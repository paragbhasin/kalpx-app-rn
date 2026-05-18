import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as Device from "expo-device";
import { Platform } from "react-native";
import store from "../store";
import { clearDoorState } from "../store/doorSlice";
import api from "../Networks/axios";

const AUTH_KEYS_TO_REMOVE = ["access_token", "refresh_token"] as const;
const GUEST_UUID_KEY = "guestUUID";

/**
 * Single shared logout helper for Drawer and Profile flows.
 *
 * Sequence:
 *  1. Read tokens + guestUUID before any storage mutation.
 *  2. Call backend logout (blacklists refresh token + unregisters device) — best effort.
 *  3. Sign out Google — best effort.
 *  4. Remove auth tokens only; restore guestUUID so guest identity survives.
 *  5. Reset Redux store.
 *
 * Backend failure never blocks local logout.
 */
export async function performLogout(): Promise<void> {
  const refreshToken = await AsyncStorage.getItem("refresh_token");
  const guestUUID = await AsyncStorage.getItem(GUEST_UUID_KEY);

  // Backend logout: blacklist refresh token + unregister push device
  try {
    const body: Record<string, string | null | undefined> = {
      refresh: refreshToken,
    };
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
  await AsyncStorage.multiRemove([...AUTH_KEYS_TO_REMOVE]);

  // Explicitly restore guestUUID so guest requests continue to work after logout
  if (guestUUID) {
    await AsyncStorage.setItem(GUEST_UUID_KEY, guestUUID);
  }

  store.dispatch(clearDoorState());
  store.dispatch({ type: "RESET_APP" });
}
