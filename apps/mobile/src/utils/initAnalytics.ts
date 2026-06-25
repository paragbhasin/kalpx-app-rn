import analytics from "@react-native-firebase/analytics";

export async function initAnalytics(): Promise<void> {
  try {
    await analytics().setUserProperty(
      "environment",
      __DEV__ ? "dev" : "prod",
    );
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
    await analytics().logEvent(name, params);
  } catch {
    // non-fatal
  }
}
