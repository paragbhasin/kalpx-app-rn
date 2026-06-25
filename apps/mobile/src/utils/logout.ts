import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as Device from "expo-device";
import { Platform } from "react-native";
import store from "../store";
import { clearDoorState } from "../store/doorSlice";
import api from "../Networks/axios";
import { BIOMETRIC_TOKEN_KEY, BIOMETRIC_REGISTERED_KEY } from "./biometricKeys";
import { clearAnalyticsUser } from "./initAnalytics";

const AUTH_KEYS_TO_REMOVE = ["access_token", "refresh_token"] as const;
const GUEST_UUID_KEY = "guestUUID";

/**
 * Single shared logout helper for Drawer and Profile flows.
 *
 * Sequence:
 *  1. Read tokens + guestUUID before any storage mutation.
 *  2. If biometric login is registered:
 *       - Update the Keychain with the latest refresh_token (keeps it fresh).
 *       - Call backend logout WITHOUT passing refresh (skip blacklisting) so
 *         the Keychain token stays valid for the next Face ID login.
 *     If biometric login is NOT registered:
 *       - Call backend logout WITH refresh to fully blacklist the token.
 *  3. Sign out Google — best effort.
 *  4. Remove auth tokens only; restore guestUUID so guest identity survives.
 *  5. Reset Redux store.
 *
 * Backend failure never blocks local logout.
 */
export async function performLogout(): Promise<void> {
  const refreshToken = await AsyncStorage.getItem("refresh_token");
  const guestUUID = await AsyncStorage.getItem(GUEST_UUID_KEY);
  const biometricRegistered = await AsyncStorage.getItem(BIOMETRIC_REGISTERED_KEY);

  // If biometric login is set up, update the Keychain with the latest token
  // so the next Face ID login always uses a fresh (non-blacklisted) token.
  if (biometricRegistered === "1" && refreshToken) {
    try {
      await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, refreshToken, {
        requireAuthentication: true,
      });
    } catch {
      // Non-fatal — biometric login may stop working but logout proceeds
    }
  }

  try {
    const body: Record<string, string | null | undefined> = {};

    // Only blacklist the refresh token if biometric login is NOT registered.
    // When biometric is registered, the token must stay valid in the Keychain
    // so Face ID login works after logout. The token is still protected by
    // Face ID — removing it from AsyncStorage is the "local logout".
    if (!biometricRegistered) {
      body.refresh = refreshToken;
    }

    const deviceId = Device.osInternalBuildId;
    if (deviceId) {
      body.device_id = deviceId;
      body.platform = Platform.OS;
    }

    await api.post("/users/logout/", body);
  } catch {
    // Never block local logout
  }

  // Google sign-out (best effort)
  try {
    await GoogleSignin.signOut();
    await GoogleSignin.revokeAccess();
  } catch {}

  // Remove auth tokens only — targeted removal preserves other keys
  await AsyncStorage.multiRemove([...AUTH_KEYS_TO_REMOVE, "kalpx_is_guide"]);

  // Explicitly restore guestUUID so guest requests continue to work after logout
  if (guestUUID) {
    await AsyncStorage.setItem(GUEST_UUID_KEY, guestUUID);
  }

  clearAnalyticsUser();
  store.dispatch(clearDoorState());
  store.dispatch({ type: "RESET_APP" });
}
