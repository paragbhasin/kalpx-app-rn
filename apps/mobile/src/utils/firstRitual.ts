import AsyncStorage from "@react-native-async-storage/async-storage";
import { logEvent } from "./initAnalytics";

const FIRST_RITUAL_KEY = "kalpx_first_ritual_done";

export type RitualType = "mantra" | "sankalp" | "practice" | "japa";

export async function trackRitualCompletion(type: RitualType): Promise<void> {
  logEvent("ritual_completed", { ritual_type: type });

  try {
    const done = await AsyncStorage.getItem(FIRST_RITUAL_KEY);
    if (!done) {
      await AsyncStorage.setItem(FIRST_RITUAL_KEY, "1");
      logEvent("first_ritual_completed", { ritual_type: type });
    }
  } catch {
    // non-fatal
  }
}
