import { NativeModules, Platform } from "react-native";

const { KalpxLiveActivityModule } = NativeModules;
const supported = Platform.OS === "ios" && !!KalpxLiveActivityModule;
console.log("[LiveActivity] module found:", !!KalpxLiveActivityModule, "supported:", supported);

export const liveActivity = {
  start(
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
      return Promise.resolve(null);
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

  startSankalp(title: string, line: string): Promise<string | null> {
    if (!supported) {
      console.warn("[LiveActivity] startSankalp skipped — module not found");
      return Promise.resolve(null);
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
