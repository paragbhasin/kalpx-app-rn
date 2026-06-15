import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { persistPreferences, setPreference } from "../store/preferencesSlice";

// Key written ONLY when user taps Enable — "Not now" never sets this.
// Renamed from biometric_prompt_shown to clear any stale flag from older builds.
const ENABLED_KEY = "biometric_lock_setup_done";

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
    return hasFace ? "Face ID" : "Touch ID";
  }
  // Android
  if (hasFace && hasFingerprint) return "Biometric";
  if (hasFace) return "Face Unlock";
  return "Fingerprint";
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

  // Run check once per login session
  useEffect(() => {
    if (!isLoggedIn || checkedRef.current) return;
    checkedRef.current = true;

    const check = async () => {
      // Already enabled (from this prompt or from Profile → Security)
      if (appLockEnabled) return;

      // User already tapped Enable in a previous session — stop asking
      const alreadySetUp = await AsyncStorage.getItem(ENABLED_KEY);
      if (alreadySetUp) return;

      const label = await detectBiometricLabel();
      if (!label) return;

      setBiometricLabel(label);
      // Delay so the home screen is fully visible before the modal appears
      timerRef.current = setTimeout(() => setShowPrompt(true), 1200);
    };

    check();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLoggedIn, appLockEnabled]);

  // Reset checker on logout so the next login gets a fresh check
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
    dispatch(setPreference({ key: "app_lock_enabled", value: true }));
    dispatch(persistPreferences() as any);
  }, [dispatch]);

  const handleDismiss = useCallback(() => {
    // "Not now" — just hide for this session; show again on next login
    setShowPrompt(false);
  }, []);

  return { showPrompt, biometricLabel, handleEnable, handleDismiss };
}
