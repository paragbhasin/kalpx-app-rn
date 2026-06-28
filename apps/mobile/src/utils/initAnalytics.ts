import { Platform } from "react-native";
import Constants from "expo-constants";
import analytics from "@react-native-firebase/analytics";

// Resolved once at module load — Platform.OS is always synchronously available.
// app_version falls back through expoConfig → manifest → "unknown".
const _platform: string = Platform.OS;
const _appVersion: string =
  Constants.expoConfig?.version ??
  (Constants as { manifest?: { version?: string } }).manifest?.version ??
  "unknown";

export async function initAnalytics(): Promise<void> {
  try {
    await analytics().setUserProperty("environment", __DEV__ ? "dev" : "prod");
    await analytics().setUserProperty("platform", _platform);
    await analytics().setUserProperty("app_version", _appVersion);
  } catch {
    // non-fatal
  }
}

export async function setAnalyticsUser(userId: string | number): Promise<void> {
  try {
    await analytics().setUserId(String(userId));
  } catch {
    // non-fatal
  }
}

export async function clearAnalyticsUser(): Promise<void> {
  try {
    await analytics().setUserId(null);
  } catch {
    // non-fatal
  }
}

export async function logEvent(
  name: string,
  params?: Record<string, string | number | boolean>,
): Promise<void> {
  try {
    await analytics().logEvent(name, {
      ...params,
      platform: _platform,
      app_version: _appVersion,
    });
  } catch {
    // non-fatal
  }
}
