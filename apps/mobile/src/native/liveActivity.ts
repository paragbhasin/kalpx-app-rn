import { NativeModules, PermissionsAndroid, Platform } from "react-native";
import { EVENT_NAMES } from '@kalpx/analytics';

const { KalpxLiveActivityModule } = NativeModules;

// Client-side feature flags — belt-and-suspenders.
// Primary gating is server-side: backend returns type:'none' when a surface is off.
const LA_FLAGS = {
  LIVE_ACTIVITY_QUICK_RESET_ENABLED: true,
  LIVE_ACTIVITY_DAILY_RHYTHM_ENABLED: true,
  LIVE_ACTIVITY_INNER_PATH_ENABLED: true,
};

// Thin analytics shim — logs events as structured console output so they are
// visible in Metro and can be captured by any attached analytics provider.
// Swap the body for a real SDK call (Firebase Analytics, Amplitude, etc.) when ready.
function trackLA(event: string, params?: Record<string, unknown>): void {
  console.log('[LA:analytics]', event, params ?? {});
}

// Suppress quick_chant LA restart for 30s after the user manually ends a session.
// Prevents Home.tsx useFocusEffect from immediately restarting the stats LA
// when the server still returns type:'quick_chant' right after session complete.
let _quickChantSuppressedUntil = 0;

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
    if (Date.now() < _quickChantSuppressedUntil) {
      console.log('[LiveActivity] start suppressed — reset just ended');
      return null;
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

  async startReset(mantraTitle: string, devanagari: string): Promise<string | null> {
    if (!supported) return null;
    if (!LA_FLAGS.LIVE_ACTIVITY_QUICK_RESET_ENABLED) return null;
    if (Platform.OS === "android") {
      const granted = await ensureAndroidNotificationPermission();
      if (!granted) {
        console.warn("[LiveActivity] startReset skipped — POST_NOTIFICATIONS not granted");
        return null;
      }
    }
    _quickChantSuppressedUntil = 0;
    await KalpxLiveActivityModule.endActivity().catch(() => {}); // clear stats LA before showing in-session LA
    return KalpxLiveActivityModule.startResetActivity(mantraTitle, devanagari)
      .then((id: string) => {
        trackLA(EVENT_NAMES.LIVE_ACTIVITY_RESET_STARTED);
        return id;
      })
      .catch((err: any) => {
        console.error("[LiveActivity] startReset FAILED:", err);
        return null;
      });
  },

  endReset(reason: 'practice_complete' | 'chant_override' | 'timeout' = 'practice_complete'): Promise<void> {
    if (!supported) return Promise.resolve();
    _quickChantSuppressedUntil = Date.now() + 30_000; // suppress stats LA restart for 30s
    return Promise.all([
      KalpxLiveActivityModule.endResetActivity().catch(() => {}),
      KalpxLiveActivityModule.endActivity().catch(() => {}), // also kill stats LA if still running
    ]).then(() => { trackLA(EVENT_NAMES.LIVE_ACTIVITY_RESET_ENDED, { reason }); });
  },

  async startRhythm(band: string, bandLabel: string, anchorTitle: string, anchorType: string, anchorDevanagari: string): Promise<string | null> {
    if (!supported) return null;
    if (!LA_FLAGS.LIVE_ACTIVITY_DAILY_RHYTHM_ENABLED) return null;
    if (Platform.OS === "android") {
      const granted = await ensureAndroidNotificationPermission();
      if (!granted) {
        console.warn("[LiveActivity] startRhythm skipped — POST_NOTIFICATIONS not granted");
        return null;
      }
    }
    return KalpxLiveActivityModule.startRhythmActivity(band, bandLabel, anchorTitle, anchorType, anchorDevanagari)
      .then((id: string) => {
        trackLA(EVENT_NAMES.LIVE_ACTIVITY_RHYTHM_STARTED, { band, anchor_type: anchorType });
        return id;
      })
      .catch((err: any) => {
        console.error("[LiveActivity] startRhythm FAILED:", err);
        return null;
      });
  },

  updateRhythm(bandDone: boolean): Promise<void> {
    if (!supported) return Promise.resolve();
    return KalpxLiveActivityModule.updateRhythmActivity(bandDone)
      .then(() => { trackLA(EVENT_NAMES.LIVE_ACTIVITY_RHYTHM_UPDATED, { band_done: bandDone }); })
      .catch(() => {});
  },

  endRhythm(reason: 'band_complete' | 'chant_override' | 'screen_exit' = 'band_complete'): Promise<void> {
    if (!supported) return Promise.resolve();
    return KalpxLiveActivityModule.endRhythmActivity()
      .then(() => { trackLA(EVENT_NAMES.LIVE_ACTIVITY_RHYTHM_ENDED, { reason }); })
      .catch(() => {});
  },

  async startInnerPath(dayNumber: number, totalDays: number, mantraTitle: string, mantraDevanagari: string, sankalpTitle: string, practiceTitle: string): Promise<string | null> {
    if (!supported) return null;
    if (!LA_FLAGS.LIVE_ACTIVITY_INNER_PATH_ENABLED) return null;
    if (Platform.OS === "android") {
      const granted = await ensureAndroidNotificationPermission();
      if (!granted) {
        console.warn("[LiveActivity] startInnerPath skipped — POST_NOTIFICATIONS not granted");
        return null;
      }
    }
    return KalpxLiveActivityModule.startInnerPathActivity(dayNumber, totalDays, mantraTitle, mantraDevanagari, sankalpTitle, practiceTitle)
      .then((id: string) => {
        trackLA(EVENT_NAMES.LIVE_ACTIVITY_INNER_PATH_STARTED, { day_number: dayNumber, total_days: totalDays });
        return id;
      })
      .catch((err: any) => {
        console.error("[LiveActivity] startInnerPath FAILED:", err);
        return null;
      });
  },

  updateInnerPath(mantraDone: boolean, sankalpDone: boolean, practiceDone: boolean): Promise<void> {
    if (!supported) return Promise.resolve();
    return KalpxLiveActivityModule.updateInnerPathActivity(mantraDone, sankalpDone, practiceDone)
      .then(() => { trackLA(EVENT_NAMES.LIVE_ACTIVITY_INNER_PATH_UPDATED, { mantra_done: mantraDone, sankalp_done: sankalpDone, practice_done: practiceDone }); })
      .catch(() => {});
  },

  endInnerPath(reason: 'all_done' | 'chant_override' | 'timeout' = 'all_done'): Promise<void> {
    if (!supported) return Promise.resolve();
    return KalpxLiveActivityModule.endInnerPathActivity()
      .then(() => { trackLA(EVENT_NAMES.LIVE_ACTIVITY_INNER_PATH_ENDED, { reason }); })
      .catch(() => {});
  },
};
