/**
 * useBootstrapAuth — resume authed session from AsyncStorage on cold-start.
 *
 * The Mitra RN app has no Redux Persist on the login reducer. Without this
 * hook, a cold-start with valid tokens in AsyncStorage still renders the
 * pre-onboarding welcome because `state.login.user` is empty until the
 * Login UI dispatches `loginSuccess`.
 *
 * This hook probes once per cold-start:
 *   1. Read access_token / refresh_token / user_id from AsyncStorage
 *   2. If all three are present, GET users/profile/profile_details/ to verify
 *      the token still works + fetch the user object
 *   3. On success → dispatch loginSuccess({ user: profile.user })
 *   4. On 401 → clear stale tokens (user lands on Login normally)
 *   5. On network error → no-op (tokens stay; offline-friendly resume)
 *
 * Strictly additive. The real Login UI flow is unchanged. Auth-interceptor
 * in Networks/axios.js already attaches Bearer from AsyncStorage to every
 * request, so the probe request is authenticated end-to-end.
 *
 * Usage (invoke once from a mount point reached on every cold-start):
 *   const bootstrapped = useBootstrapAuth();
 *
 * Returns a ref-based boolean so callers can suppress further probes.
 */

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../Networks/axios";
import { loginSuccess } from "../screens/Login/actions";
import type { RootState } from "../store";

export function useBootstrapAuth(): { tried: boolean } {
  const dispatch = useDispatch();
  const triedRef = useRef(false);
  const currentUser = useSelector(
    (s: RootState) => s.login?.user || s.socialLoginReducer?.user,
  );

  useEffect(() => {
    // Only fire once per cold-start. Skip if already logged in.
    if (triedRef.current || currentUser) return;
    triedRef.current = true;

    let cancelled = false;

    const probe = async () => {
      try {
        const [access, refresh, userId] = await Promise.all([
          AsyncStorage.getItem("access_token"),
          AsyncStorage.getItem("refresh_token"),
          AsyncStorage.getItem("user_id"),
        ]);

        if (!access || !refresh || !userId) {
          // Nothing to resume — clean logged-out state.
          return;
        }

        // Verify the token still works + fetch the user object.
        // Axios interceptor (Networks/axios.js) attaches Bearer from
        // AsyncStorage; handles 401 refresh itself. If refresh also fails,
        // the interceptor clears storage — our catch below completes the
        // story by ensuring Redux stays logged out.
        const res = await api.get("users/profile/profile_details/");
        if (cancelled) return;

        const user =
          res?.data?.profile?.user ||
          res?.data?.user ||
          null;

        if (user && user.id) {
          // Same payload shape the real Login flow dispatches:
          // loginSuccess(res) → payload: res.user.
          dispatch(loginSuccess({ user }) as any);
          if (__DEV__) {
            console.log(
              "[useBootstrapAuth] resumed session for user",
              user.id,
              user.email,
            );
          }
        }
      } catch (err: any) {
        // 401 → interceptor already tried refresh + failed; tokens cleared.
        // Network error → leave tokens alone; next launch will retry.
        if (__DEV__) {
          console.warn(
            "[useBootstrapAuth] probe failed (tolerated):",
            err?.response?.status,
            err?.message,
          );
        }
      }
    };

    probe();

    return () => {
      cancelled = true;
    };
  }, [currentUser, dispatch]);

  return { tried: triedRef.current };
}

export default useBootstrapAuth;
