import { NativeModules, PermissionsAndroid, Platform } from "react-native";

const { KalpxLiveActivityModule } = NativeModules;

// Supported on iOS (ActivityKit) and Android (Foreground Service + Ongoing Notification).
// On any other platform the methods are no-ops returning null/0.
const supported = !!KalpxLiveActivityModule && (Platform.OS === "ios" || Platform.OS === "android");
console.log("[LiveActivity] module found:", !!KalpxLiveActivityModule, "supported:", supported);

// Android 13+ (API 33) requires POST_NOTIFICATIONS runtime permission before
// posting any notification. Called once before the first start() or startSankalp().
// On iOS this is handled by ActivityKit's areActivitiesEnabled check.
async function ensureAndroidNotificationPermission(): Promise<boolean> {
  if (Platform.OS !== "android") return true;
  if (Platform.Version < 33) return true;
  try {
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: "Chanting Session Notification",
        message: "Allow KalpX to show your chanting progress on the lock screen",
        buttonPositive: "Allow",
        buttonNegative: "Not now",
      }
    );
    return status === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

export const liveActivity = {
  async start(
    mantraName: string,
    devanagari: string,
    sessionCount: number,
    weekCount: number,
    yearCount: number,
    totalCount: number,
    elapsedSeconds: number = 0,
    deepLinkURL: string = 'kalpx://mitra/quick_chant/home',
  ): Promise<string | null> {
    if (!supported) {
      console.warn("[LiveActivity] start skipped — module not found");
      return null;
    }
    if (Platform.OS === "android") {
      const granted = await ensureAndroidNotificationPermission();
      if (!granted) {
        console.warn("[LiveActivity] start skipped — POST_NOTIFICATIONS not granted");
        return null;
      }
    }
    console.log("[LiveActivity] calling start", { mantraName, sessionCount, weekCount, yearCount, totalCount, deepLinkURL });
    return KalpxLiveActivityModule.startActivity(
      mantraName,
      devanagari,
      { sessionCount, weekCount, yearCount, totalCount, elapsedSeconds, deepLinkURL }
    ).then((id: string) => {
      console.log("[LiveActivity] started OK, id:", id);
      return id;
    }).catch((err: any) => {
      console.error("[LiveActivity] start FAILED:", err);
      return null;
    });
  },

  update(
    sessionCount: number,
    weekCount: number,
    yearCount: number,
    totalCount: number,
    elapsedSeconds: number = 0,
  ): Promise<void> {
    if (!supported) return Promise.resolve();
    return KalpxLiveActivityModule.updateActivity(
      { sessionCount, weekCount, yearCount, totalCount, elapsedSeconds }
    ).catch((err: any) => {
      console.error("[LiveActivity] update FAILED:", err);
    });
  },

  completeChant(finalCount: number, elapsedSeconds: number): Promise<void> {
    if (!supported) return Promise.resolve();
    return KalpxLiveActivityModule.completeChantActivity(finalCount, elapsedSeconds)
      .catch((err: any) => {
        console.error("[LiveActivity] completeChant FAILED:", err);
      });
  },

  async startSankalp(title: string, line: string): Promise<string | null> {
    if (!supported) {
      console.warn("[LiveActivity] startSankalp skipped — module not found");
      return null;
    }
    if (Platform.OS === "android") {
      const granted = await ensureAndroidNotificationPermission();
      if (!granted) {
        console.warn("[LiveActivity] startSankalp skipped — POST_NOTIFICATIONS not granted");
        return null;
      }
    }
    console.log("[LiveActivity] calling startSankalp", { title, line });
    return KalpxLiveActivityModule.startSankalpActivity(title, line)
      .then((id: string) => {
        console.log("[LiveActivity] startSankalp OK, id:", id);
        return id;
      })
      .catch((err: any) => {
        console.error("[LiveActivity] startSankalp FAILED:", err);
        return null;
      });
  },

  end(): Promise<void> {
    if (!supported) return Promise.resolve();
    return KalpxLiveActivityModule.endActivity().catch(() => {});
  },

  consumePendingIncrements(): Promise<number> {
    if (!supported) return Promise.resolve(0);
    return KalpxLiveActivityModule.getPendingIncrements().catch(() => 0);
  },
};
