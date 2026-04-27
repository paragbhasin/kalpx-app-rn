import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_KEYS } from '@kalpx/api-client';
import { storeTokens, clearTokens, isAuthenticated } from '@kalpx/auth';
import { webStorage } from '../lib/webStorage';
import { api } from '../lib/api';
import { getApiErrorMessage } from '../lib/apiErrors';
import { useAppDispatch } from '../store/hooks';
import { showSnackBar } from '../store/snackBarSlice';
import { store, resetStore } from '../store';
import { invalidateJourneyStatusCache } from './useJourneyStatus';
import type { LoginRequest, LoginResponse, SignupRegisterRequest, SignupStep1Request, SignupOtpVerifyRequest, ForgotPasswordRequest } from '../types/auth';

// Dev reCAPTCHA bypass — backend accepts any token value in dev/debug mode
const DEV_RECAPTCHA_TOKEN = 'dev-bypass-token';

function getRecaptchaToken(): string {
  // Phase 4: always use dev bypass. Phase 5+ will integrate the real widget.
  return DEV_RECAPTCHA_TOKEN;
}

export function useAuth() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const login = useCallback(
    async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await api.post<LoginResponse>('users/login/', { email, password } satisfies LoginRequest);
        const data = res.data;
        const accessToken = data.access_token ?? data.access;
        const refreshToken = data.refresh_token ?? data.refresh;

        if (!accessToken || !refreshToken) {
          return { success: false, error: 'Login succeeded but tokens were missing in response.' };
        }

        await storeTokens(webStorage, { accessToken, refreshToken });
        invalidateJourneyStatusCache();
        navigate('/en/mitra');
        return { success: true };
      } catch (err) {
        return { success: false, error: getApiErrorMessage(err, 'Login failed. Please check your credentials.') };
      }
    },
    [navigate],
  );

  const logout = useCallback(async () => {
    await webStorage.removeItem(AUTH_KEYS.accessToken);
    await webStorage.removeItem(AUTH_KEYS.refreshToken);
    // Keep guestUUID — guest identity survives logout
    invalidateJourneyStatusCache();
    store.dispatch(resetStore());
    navigate('/login');
  }, [navigate]);

  const generateOtp = useCallback(
    async (email: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const payload: SignupStep1Request = {
          email,
          recaptcha_token: getRecaptchaToken(),
          recaptcha_action: 'request_otp',
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
    async (email: string, otp: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const payload: SignupOtpVerifyRequest = {
          email,
          otp,
          recaptcha_token: getRecaptchaToken(),
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
    ): Promise<{ success: boolean; error?: string }> => {
      try {
        const body: SignupRegisterRequest = {
          ...payload,
          recaptcha_token: getRecaptchaToken(),
          recaptcha_action: 'register',
        };
        const res = await api.post<LoginResponse>('users/register/', body);
        const data = res.data;
        const accessToken = data.access_token ?? data.access;
        const refreshToken = data.refresh_token ?? data.refresh;

        if (accessToken && refreshToken) {
          await storeTokens(webStorage, { accessToken, refreshToken });
          navigate('/en/mitra/start');
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
        const payload: ForgotPasswordRequest = { email };
        // Endpoint: POST users/reset_password/ (confirmed from apps/mobile/src/screens/Signup/actions.ts)
        await api.post('users/reset_password/', payload);
        return { success: true };
      } catch (err) {
        return { success: false, error: getApiErrorMessage(err, 'Could not send reset email. Please try again.') };
      }
    },
    [],
  );

  const getAccessToken = useCallback(() => webStorage.getItem(AUTH_KEYS.accessToken), []);

  const checkIsAuthenticated = useCallback(() => isAuthenticated(webStorage), []);

  return {
    login,
    logout,
    generateOtp,
    verifyOtp,
    registerUser,
    forgotPassword,
    getAccessToken,
    isAuthenticated: checkIsAuthenticated,
  };
}
