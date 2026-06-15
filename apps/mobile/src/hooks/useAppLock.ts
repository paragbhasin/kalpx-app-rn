import * as LocalAuthentication from "expo-local-authentication";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../store";

export const APP_LOCK_TIMEOUT_SECONDS = 60;

export type OverlayMode = "hidden" | "privacy" | "locked";

export function useAppLock() {
  const appLockEnabled = useSelector(
    (state: RootState) => state.preferences.app_lock_enabled,
  );
  const prefsLoaded = useSelector(
    (state: RootState) => state.preferences.loaded,
  );

  // Start in privacy mode to prevent content flash on cold launch.
  // Resolved to 'hidden' or 'locked' in <50ms once AsyncStorage prefs load.
  const [overlayMode, setOverlayModeState] = useState<OverlayMode>("privacy");
  const overlayModeRef = useRef<OverlayMode>("privacy");

  const setOverlayMode = useCallback((mode: OverlayMode) => {
    overlayModeRef.current = mode;
    setOverlayModeState(mode);
  }, []);

  // Stable refs for the AppState callback (avoids stale closure)
  const appLockEnabledRef = useRef(appLockEnabled);
  const prefsLoadedRef = useRef(prefsLoaded);
  const backgroundedAtRef = useRef<number | null>(null);
  const isAuthInProgressRef = useRef(false);
  const coldLaunchHandled = useRef(false);

  useEffect(() => {
    appLockEnabledRef.current = appLockEnabled;
  }, [appLockEnabled]);

  useEffect(() => {
    prefsLoadedRef.current = prefsLoaded;
  }, [prefsLoaded]);

  // OS-managed authentication — never stores biometric data.
  // disableDeviceFallback: false → iOS uses LAContext.deviceOwnerAuthentication
  // which covers Face ID → Touch ID → Passcode in that priority order.
  const triggerAuth = useCallback(async () => {
    if (isAuthInProgressRef.current) return;
    isAuthInProgressRef.current = true;
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock KalpX",
        cancelLabel: "Cancel",
        disableDeviceFallback: false,
        fallbackLabel: "Use Passcode",
      });
      if (result.success) {
        overlayModeRef.current = "hidden";
        setOverlayModeState("hidden");
      }
      // fail or cancel: remain locked — Unlock button retries
    } catch {
      // remain locked
    } finally {
      isAuthInProgressRef.current = false;
    }
  }, []);

  // Cold launch: once preferences restore from AsyncStorage, decide state.
  // Use appLockEnabled (selector) directly — more reliable than the ref here
  // since both prefsLoaded and appLockEnabled change in the same Redux dispatch.
  useEffect(() => {
    if (!prefsLoaded || coldLaunchHandled.current) return;
    coldLaunchHandled.current = true;
    if (appLockEnabled) {
      setOverlayMode("locked");
      // triggerAuth is called by AppLockOverlay's useEffect when mode → 'locked'
    } else {
      setOverlayMode("hidden");
    }
  }, [prefsLoaded, appLockEnabled, setOverlayMode]);

  // User disables App Lock from Settings → unlock immediately
  useEffect(() => {
    if (!coldLaunchHandled.current) return;
    if (!appLockEnabled) {
      setOverlayMode("hidden");
    }
  }, [appLockEnabled, setOverlayMode]);

  const handleAppStateChange = useCallback(
    (nextState: AppStateStatus) => {
      if (nextState === "background" || nextState === "inactive") {
        backgroundedAtRef.current = Date.now();
        if (overlayModeRef.current !== "locked") {
          // Privacy overlay only makes sense when app lock is on — it hides
          // content in the app switcher. When app lock is off (e.g. after
          // logout + RESET_APP), don't black out the screen; it would stay
          // black on return-to-active because prefsLoaded is false post-reset.
          if (appLockEnabledRef.current) {
            overlayModeRef.current = "privacy";
            setOverlayModeState("privacy");
          }
        }
      } else if (nextState === "active") {
        if (!prefsLoadedRef.current) return;

        if (!appLockEnabledRef.current) {
          overlayModeRef.current = "hidden";
          setOverlayModeState("hidden");
          return;
        }

        // If already locked (e.g. backgrounded while locked), re-trigger auth
        if (overlayModeRef.current === "locked") {
          triggerAuth();
          return;
        }

        const elapsed =
          backgroundedAtRef.current !== null
            ? (Date.now() - backgroundedAtRef.current) / 1000
            : APP_LOCK_TIMEOUT_SECONDS;
        backgroundedAtRef.current = null;

        if (elapsed >= APP_LOCK_TIMEOUT_SECONDS) {
          overlayModeRef.current = "locked";
          setOverlayModeState("locked");
          triggerAuth();
        } else {
          overlayModeRef.current = "hidden";
          setOverlayModeState("hidden");
        }
      }
    },
    [triggerAuth],
  );

  useEffect(() => {
    const sub = AppState.addEventListener("change", handleAppStateChange);
    return () => sub.remove();
  }, [handleAppStateChange]);

  return { overlayMode, handleUnlock: triggerAuth };
}
