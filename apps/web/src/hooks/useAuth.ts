import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import { AUTH_KEYS } from '@kalpx/api-client';
import { storeTokens, clearTokens, isAuthenticated } from '@kalpx/auth';
import { webStorage } from '../lib/webStorage';
import { api } from '../lib/api';
import { getApiErrorMessage } from '../lib/apiErrors';
import { useAppDispatch } from '../store/hooks';
import { showSnackBar } from '../store/snackBarSlice';
import { store, resetStore } from '../store';
import { clearDoorState } from '../store/doorSlice';
import { invalidateJourneyStatusCache } from './useJourneyStatus';
import { invalidateJourneyEntryViewCache } from './useJourneyEntryView';
import type { LoginRequest, LoginResponse, SignupRegisterRequest, SignupStep1Request, SignupOtpVerifyRequest, ResetPasswordRequest } from '../types/auth';
import {
  claimGuestJourney,
  invalidateDashboardViewCache,
  invalidateMitraHomeV3Cache,
} from '../engine/mitraApi';
import { getRecaptchaToken } from '../lib/recaptcha';

const AUTH_SNAPSHOT_KEY = 'kalpx_auth_snapshot';

function shouldAttemptGuestJourneyClaim(): boolean {
  try {
    const raw = localStorage.getItem('kalpx_journey_state');
    if (!raw) return false;
    const data = JSON.parse(raw) as Record<string, any>;
    return Boolean(
      data?.stashed_inference_state ||
      data?.onboarding_turn === 'turn_7_awaiting_auth',
    );
  } catch {
    return false;
  }
}

function getPostLoginPath(
  data: LoginResponse,
  returnTo?: string,
): string {
  const role =
    data.role ??
    (typeof data.user?.role === 'string' ? data.user.role : undefined) ??
    (typeof data.profile?.user?.role === 'string'
      ? data.profile.user.role
      : undefined) ??
    (typeof data.creator_profile?.user?.role === 'string'
      ? data.creator_profile.user.role
      : undefined);

  if (role === 'creator') {
    return '/en/creator/posts';
  }

  return returnTo ?? '/en/mitra';
}

function persistAuthSnapshot(data: LoginResponse) {
  try {
    localStorage.setItem(
      AUTH_SNAPSHOT_KEY,
      JSON.stringify({
        role: data.role,
        user: data.user,
        profile: data.profile,
        creator_profile: data.creator_profile,
      }),
    );
  } catch {
    // no-op
  }
}

export function useAuth() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const login = useCallback(
    async (email: string, password: string, returnTo?: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const recaptchaToken = await getRecaptchaToken('login');
        const res = await api.post<LoginResponse>('users/login/', { email, password, recaptcha_token: recaptchaToken } satisfies LoginRequest);
        const data = res.data;
        const accessToken = data.access_token ?? data.access;
        const refreshToken = data.refresh_token ?? data.refresh;

        if (!accessToken || !refreshToken) {
          return { success: false, error: 'Login succeeded but tokens were missing in response.' };
        }

        await storeTokens(webStorage, { accessToken, refreshToken });
        persistAuthSnapshot(data);
        invalidateMitraHomeV3Cache();
        store.dispatch(clearDoorState());
        invalidateJourneyStatusCache();
        invalidateJourneyEntryViewCache();
        // Attempt guest journey claim (best-effort — failure must not break login)
        if (shouldAttemptGuestJourneyClaim()) {
          try { await claimGuestJourney(); } catch { /* swallow */ }
        }
        invalidateJourneyStatusCache();
        invalidateJourneyEntryViewCache();
        navigate(getPostLoginPath(data, returnTo));
        return { success: true };
      } catch (err) {
        return { success: false, error: getApiErrorMessage(err, 'Login failed. Please check your credentials.') };
      }
    },
    [navigate],
  );

  const logout = useCallback(async () => {
    // Read token before clearing — backend call must happen while it is still present
    const refreshToken = await webStorage.getItem(AUTH_KEYS.refreshToken);

    // Revoke Google OAuth session (no-op for email logins)
    if (typeof window !== 'undefined') googleLogout();

    // Best-effort backend logout: blacklists refresh token server-side.
    // Failure must never prevent local logout — always continue regardless.
    if (refreshToken) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 5000);
        await api.post('users/logout/', { refresh: refreshToken }, { signal: controller.signal });
        clearTimeout(timer);
      } catch {
        // Swallow — network failure or expired token must not block logout
      }
    }

    await webStorage.removeItem(AUTH_KEYS.accessToken);
    await webStorage.removeItem(AUTH_KEYS.refreshToken);
    try {
      localStorage.removeItem(AUTH_SNAPSHOT_KEY);
    } catch {
      // no-op
    }
    // Keep guestUUID — guest identity survives logout
    invalidateJourneyStatusCache();
    invalidateDashboardViewCache();
    invalidateMitraHomeV3Cache();
    invalidateJourneyEntryViewCache();
    store.dispatch(clearDoorState());
    store.dispatch(resetStore());
    const opsSession = localStorage.getItem('kalpx:ops_session');
    const guideSession = localStorage.getItem('kalpx:guide_session');
    localStorage.removeItem('kalpx:ops_session');
    localStorage.removeItem('kalpx:guide_session');
    navigate(opsSession ? '/ops-login' : guideSession ? '/guide/login' : '/en');
  }, [navigate]);

  const socialLoginGoogle = useCallback(
    async (accessToken: string, returnTo?: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await api.post<LoginResponse>('users/social_login/', {
          provider: 'google',
          access_token: accessToken,
        });
        const data = res.data;
        const at = data.access_token ?? data.access;
        const rt = data.refresh_token ?? data.refresh;

        if (!at || !rt) {
          return { success: false, error: 'Google login succeeded but tokens were missing in response.' };
        }

        await storeTokens(webStorage, { accessToken: at, refreshToken: rt });
        persistAuthSnapshot(data);
        invalidateMitraHomeV3Cache();
        store.dispatch(clearDoorState());
        invalidateJourneyStatusCache();
        invalidateJourneyEntryViewCache();
        if (shouldAttemptGuestJourneyClaim()) {
          try { await claimGuestJourney(); } catch { /* swallow */ }
        }
        invalidateJourneyStatusCache();
        invalidateJourneyEntryViewCache();
        navigate(getPostLoginPath(data, returnTo));
        return { success: true };
      } catch (err) {
        return { success: false, error: getApiErrorMessage(err, 'Google sign-in failed. Please try again.') };
      }
    },
    [navigate],
  );

  const generateOtp = useCallback(
    async (email: string, recaptchaToken?: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const payload: SignupStep1Request = {
          email,
          recaptcha_token: recaptchaToken || await getRecaptchaToken('generate_otp'),
          recaptcha_action: 'generate_otp',
          context: 'registration',
        };
        await api.post('users/generate_otp/', payload);
        return { success: true };
      } catch (err) {
        return { success: false, error: getApiErrorMessage(err, 'Could not send OTP. Please try again.') };
      }
    },
    [],
  );

  const verifyOtp = useCallback(
    async (email: string, otp: string, recaptchaToken?: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const payload: SignupOtpVerifyRequest = {
          email,
          otp,
          recaptcha_token: recaptchaToken || await getRecaptchaToken('verify_otp'),
          recaptcha_action: 'verify_otp',
        };
        await api.post('users/verify_otp/', payload);
        return { success: true };
      } catch (err) {
        return { success: false, error: getApiErrorMessage(err, 'OTP verification failed. Please check the code and try again.') };
      }
    },
    [],
  );

  const registerUser = useCallback(
    async (
      payload: Omit<SignupRegisterRequest, 'recaptcha_token' | 'recaptcha_action'>,
      recaptchaToken?: string,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const body: SignupRegisterRequest = {
          ...payload,
          recaptcha_token: recaptchaToken || await getRecaptchaToken('register'),
          recaptcha_action: 'register',
        };
        const res = await api.post<LoginResponse>('users/register/', body);
        const data = res.data;
        const accessToken = data.access_token ?? data.access;
        const refreshToken = data.refresh_token ?? data.refresh;

        if (accessToken && refreshToken) {
          await storeTokens(webStorage, { accessToken, refreshToken });
          invalidateJourneyStatusCache();
          invalidateJourneyEntryViewCache();
          // Attempt guest journey claim (best-effort)
          if (shouldAttemptGuestJourneyClaim()) {
            try { await claimGuestJourney(); } catch { /* swallow */ }
          }
          invalidateJourneyStatusCache();
          invalidateJourneyEntryViewCache();
          navigate('/en/mitra/onboarding?containerId=welcome_onboarding&stateId=turn_1');
        } else {
          // Backend may not return tokens on register — navigate to login
          dispatch(showSnackBar('Account created. Please sign in.'));
          navigate('/login');
        }
        return { success: true };
      } catch (err) {
        return { success: false, error: getApiErrorMessage(err, 'Registration failed. Please try again.') };
      }
    },
    [navigate, dispatch],
  );

  const forgotPassword = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      try {
        await api.post('users/generate_otp/', {
          email,
          recaptcha_token: await getRecaptchaToken('generate_otp'),
          recaptcha_action: 'generate_otp',
          context: 'password_reset',
        });
        return { success: true };
      } catch (err) {
        return { success: false, error: getApiErrorMessage(err, 'Could not send reset email. Please try again.') };
      }
    },
    [],
  );

  const resetPassword = useCallback(
    async (
      email: string,
      otp: string,
      newPassword: string,
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const payload: ResetPasswordRequest = {
          email,
          otp,
          new_password: newPassword,
          recaptcha_token: await getRecaptchaToken('reset_password'),
          recaptcha_action: 'reset_password',
        };
        await api.post('users/reset_password/', payload);
        return { success: true };
      } catch (err) {
        return { success: false, error: getApiErrorMessage(err, 'Password reset failed. Please check the code and try again.') };
      }
    },
    [],
  );

  const getAccessToken = useCallback(() => webStorage.getItem(AUTH_KEYS.accessToken), []);

  const checkIsAuthenticated = useCallback(() => isAuthenticated(webStorage), []);

  return {
    login,
    logout,
    socialLoginGoogle,
    generateOtp,
    verifyOtp,
    registerUser,
    forgotPassword,
    resetPassword,
    getAccessToken,
    isAuthenticated: checkIsAuthenticated,
  };
}
