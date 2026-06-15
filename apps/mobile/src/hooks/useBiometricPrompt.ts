import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { persistPreferences, setPreference } from "../store/preferencesSlice";

// Written ONLY when user taps Enable — never on dismiss.
const ENABLED_KEY = "biometric_lock_setup_done";
// Written on every "Not now" dismiss with a Unix timestamp.
const DISMISS_TS_KEY = "biometric_prompt_dismiss_ts";
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

async function detectBiometricLabel(): Promise<string | null> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return null;
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  if (!isEnrolled) return null;

  const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
  const hasFace = types.includes(
    LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
  );
  const hasFingerprint = types.includes(
    LocalAuthentication.AuthenticationType.FINGERPRINT,
  );

  if (Platform.OS === "ios") {
    // Some iOS versions may return an empty types array even when Face ID works.
    // Fall back to "Face ID" on modern iPhones rather than returning null.
    if (hasFingerprint) return "Touch ID";
    return "Face ID";
  }
  // Android
  if (hasFace && hasFingerprint) return "Biometric";
  if (hasFace) return "Face Unlock";
  if (hasFingerprint) return "Fingerprint";
  return "Biometric"; // fallback — hardware confirmed but type undetected
}

export function useBiometricPrompt() {
  const dispatch = useDispatch();
  const user = useSelector(
    (state: RootState) => state.login?.user || state.socialLoginReducer?.user,
  );
  const appLockEnabled = useSelector(
    (state: RootState) => state.preferences.app_lock_enabled,
  );
  const isLoggedIn = !!(
    user?.id ||
    user?.email ||
    user?.token ||
    user?.profile
  );

  const [showPrompt, setShowPrompt] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("");

  const checkedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Stable refs so the AppState callback never goes stale
  const isLoggedInRef = useRef(isLoggedIn);
  const appLockEnabledRef = useRef(appLockEnabled);

  useEffect(() => {
    isLoggedInRef.current = isLoggedIn;
  }, [isLoggedIn]);
  useEffect(() => {
    appLockEnabledRef.current = appLockEnabled;
  }, [appLockEnabled]);

  // ── Trigger 1: every login ──────────────────────────────────────────────
  // Shows on every login until the user taps Enable. No 24h gate here —
  // login is an intentional moment, always a good time to prompt.
  useEffect(() => {
    if (!isLoggedIn || checkedRef.current) return;
    checkedRef.current = true;

    const check = async () => {
      if (appLockEnabled) return;
      const alreadySetUp = await AsyncStorage.getItem(ENABLED_KEY);
      if (alreadySetUp) return;
      const label = await detectBiometricLabel();
      if (!label) return;
      setBiometricLabel(label);
      timerRef.current = setTimeout(() => setShowPrompt(true), 1200);
    };

    check();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoggedIn, appLockEnabled]);

  // ── Trigger 2: foreground after 24 h ───────────────────────────────────
  // If the user stays logged in but hasn't opened the app in 24h, re-nudge.
  useEffect(() => {
    const handleAppState = async (nextState: AppStateStatus) => {
      if (nextState !== "active") return;
      if (!isLoggedInRef.current || appLockEnabledRef.current) return;

      const alreadySetUp = await AsyncStorage.getItem(ENABLED_KEY);
      if (alreadySetUp) return;

      // Only re-nudge after a prior dismiss; first-time show is handled by login trigger
      const dismissTsRaw = await AsyncStorage.getItem(DISMISS_TS_KEY);
      if (!dismissTsRaw) return;

      const elapsed = Date.now() - Number(dismissTsRaw);
      if (elapsed < TWENTY_FOUR_HOURS_MS) return;

      const label = await detectBiometricLabel();
      if (!label) return;
      setBiometricLabel(label);
      // Allow login trigger to fire again next session
      checkedRef.current = false;
      setShowPrompt(true);
    };

    const sub = AppState.addEventListener("change", handleAppState);
    return () => sub.remove();
  }, []); // stable — reads live values via refs

  // ── Reset on logout ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoggedIn) {
      checkedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      setShowPrompt(false);
    }
  }, [isLoggedIn]);

  const handleEnable = useCallback(async () => {
    setShowPrompt(false);
    await AsyncStorage.setItem(ENABLED_KEY, "1");
    await AsyncStorage.removeItem(DISMISS_TS_KEY);
    dispatch(setPreference({ key: "app_lock_enabled", value: true }));
    dispatch(persistPreferences() as any);
  }, [dispatch]);

  const handleDismiss = useCallback(async () => {
    // Record dismiss time; foreground trigger will re-show after 24 h
    setShowPrompt(false);
    await AsyncStorage.setItem(DISMISS_TS_KEY, String(Date.now()));
  }, []);

  return { showPrompt, biometricLabel, handleEnable, handleDismiss };
}
