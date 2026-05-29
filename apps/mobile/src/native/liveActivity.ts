import { NativeModules, Platform } from "react-native";

const { KalpxLiveActivityModule } = NativeModules;

const supported = Platform.OS === "ios" && !!KalpxLiveActivityModule;
console.log("[LiveActivity] module found:", !!KalpxLiveActivityModule, "supported:", supported);

export const liveActivity = {
  start(mantraName: string, devanagari: string, sessionCount: number): Promise<string | null> {
    if (!supported) return Promise.resolve(null);
    return KalpxLiveActivityModule.startActivity(mantraName, devanagari, sessionCount);
  },

  update(sessionCount: number): Promise<void> {
    if (!supported) return Promise.resolve();
    return KalpxLiveActivityModule.updateActivity(sessionCount);
  },

  end(): Promise<void> {
    if (!supported) return Promise.resolve();
    return KalpxLiveActivityModule.endActivity();
  },

  /** Returns count of taps made from Lock Screen since last call, then resets to 0. */
  consumePendingIncrements(): Promise<number> {
    if (!supported) return Promise.resolve(0);
    return KalpxLiveActivityModule.getPendingIncrements();
  },
};
