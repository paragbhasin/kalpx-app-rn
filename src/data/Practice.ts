import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { MantraItem, pickMantra } from "../data/mantras";

// 🧩 Define store interface
interface PracticeState {
  loading: boolean;
  error: string | null;
  dailyMantras: MantraItem[];
  currentMantraIndex: number;
  weekday: string;
  deity: string;
  loadToday: () => Promise<void>;
  nextMantra: () => void;
  prevMantra: () => void;
  setDailyMantras: (mantras: MantraItem[]) => void; // ✅ Added this
}

// 🕉️ Utility functions
const getWeekday = (): string =>
  new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

const getDeityForWeekday = (weekday: string): string => {
  switch (weekday.toLowerCase()) {
    case "sunday":
      return "surya";
    case "monday":
      return "shiva";
    case "tuesday":
      return "hanuman";
    case "wednesday":
      return "krishna";
    case "thursday":
      return "vishnu";
    case "friday":
      return "lakshmi";
    case "saturday":
      return "shani";
    default:
      return "generic";
  }
};

const getTodayDateString = () =>
  new Date().toISOString().split("T")[0]; // yyyy-mm-dd

// 🎲 Deterministic seeded random for consistent daily selection
function seededRandom(seed: number) {
  let x = Math.sin(seed) * 10000;
  return () => {
    x = Math.sin(x) * 10000;
    return x - Math.floor(x);
  };
}

// 🏁 Zustand Store
export const usePracticeStore = create<PracticeState>((set, get) => ({
  loading: false,
  error: null,
  dailyMantras: [],
  currentMantraIndex: 0,
  weekday: getWeekday(),
  deity: getDeityForWeekday(getWeekday()),

  // 🔹 Load today’s mantras (deterministic daily generation)
  loadToday: async () => {
    try {
      set({ loading: true, error: null });

      const weekday = getWeekday();
      const deity = getDeityForWeekday(weekday);
      const today = getTodayDateString();
      const storageKey = `kalpx.daily_mantras.${today}`;

      // Try cached data first
      const cached = await AsyncStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          set({
            dailyMantras: parsed,
            currentMantraIndex: 0,
            weekday,
            deity,
            loading: false,
          });
          return;
        }
      }

      // Generate new daily mantras (deterministic)
      const seed = new Date(today).getTime();
      const oldRandom = Math.random;
      Math.random = seededRandom(seed);

      const mantras: MantraItem[] = [];
      const recentlyShown: string[] = [];

      for (let i = 0; i < 5; i++) {
        const mantra = pickMantra({
          locale: "en",
          recently_shown: recentlyShown,
          slot: "any",
          deityTag: deity,
          mode: "weighted",
        });
        if (mantra) {
          mantras.push(mantra);
          recentlyShown.push(mantra.id);
        }
      }

      Math.random = oldRandom;

      if (mantras.length === 0) {
        throw new Error("No mantras found for today.");
      }

      await AsyncStorage.setItem(storageKey, JSON.stringify(mantras));

      set({
        dailyMantras: mantras,
        currentMantraIndex: 0,
        weekday,
        deity,
        loading: false,
      });
    } catch (err: any) {
      console.log("Error loading mantras:", err);
      set({
        error: err.message || "Failed to load daily practice",
        loading: false,
      });
    }
  },

  // 🔹 Move to next mantra
  nextMantra: () => {
    const { currentMantraIndex, dailyMantras } = get();
    if (currentMantraIndex < dailyMantras.length - 1)
      set({ currentMantraIndex: currentMantraIndex + 1 });
  },

  // 🔹 Move to previous mantra
  prevMantra: () => {
    const { currentMantraIndex } = get();
    if (currentMantraIndex > 0)
      set({ currentMantraIndex: currentMantraIndex - 1 });
  },

  // 🔹 Manually set mantras (for preload/language change)
  setDailyMantras: (mantras) => {
    set({
      dailyMantras: mantras,
      currentMantraIndex: 0,
      loading: false,
      error: null,
    });
  },
}));






// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { create } from "zustand";
// import { MantraItem, pickMantra } from "../data/mantras";

// interface PracticeState {
//   loading: boolean;
//   error: string | null;
//   dailyMantras: MantraItem[];
//   currentMantraIndex: number;
//   weekday: string;
//   deity: string;
//   loadToday: () => Promise<void>;
//   nextMantra: () => void;
//   prevMantra: () => void;
// }

// const getWeekday = (): string =>
//   new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

// const getDeityForWeekday = (weekday: string): string => {
//   switch (weekday.toLowerCase()) {
//     case "sunday": return "surya";
//     case "monday": return "shiva";
//     case "tuesday": return "hanuman";
//     case "wednesday": return "krishna";
//     case "thursday": return "vishnu";
//     case "friday": return "lakshmi";
//     case "saturday": return "shani";
//     default: return "generic";
//   }
// };

// const getTodayDateString = () =>
//   new Date().toISOString().split("T")[0]; // yyyy-mm-dd

// // ✅ Deterministic seeded random for consistent daily selection
// function seededRandom(seed: number) {
//   let x = Math.sin(seed) * 10000;
//   return () => {
//     x = Math.sin(x) * 10000;
//     return x - Math.floor(x);
//   };
// }

// export const usePracticeStore = create<PracticeState>((set, get) => ({
//   loading: false,
//   error: null,
//   dailyMantras: [],
//   currentMantraIndex: 0,
//   weekday: getWeekday(),
//   deity: getDeityForWeekday(getWeekday()),

//   loadToday: async () => {
//     try {
//       set({ loading: true, error: null });
//       const weekday = getWeekday();
//       const deity = getDeityForWeekday(weekday);
//       const today = getTodayDateString();
//       const storageKey = `kalpx.daily_mantras.${today}`;

//       // Try reading from AsyncStorage
//       const cached = await AsyncStorage.getItem(storageKey);
//       if (cached) {
//         const parsed = JSON.parse(cached);
//         if (Array.isArray(parsed) && parsed.length > 0) {
//           set({
//             dailyMantras: parsed,
//             currentMantraIndex: 0,
//             weekday,
//             deity,
//             loading: false,
//           });
//           return;
//         }
//       }

//       // Create new daily mantras
//       const seed = new Date(today).getTime();
//       const oldRandom = Math.random;
//       Math.random = seededRandom(seed);

//       const mantras: MantraItem[] = [];
//       const recentlyShown: string[] = [];

//       for (let i = 0; i < 5; i++) {
//         const mantra = pickMantra({
//           locale: "en",
//           recently_shown: recentlyShown,
//           slot: "any",
//           deityTag: deity,
//           mode: "weighted",
//         });
//         if (mantra) {
//           mantras.push(mantra);
//           recentlyShown.push(mantra.id);
//         }
//       }

//       Math.random = oldRandom;

//       if (mantras.length === 0) {
//         throw new Error("No mantras found for today.");
//       }

//       await AsyncStorage.setItem(storageKey, JSON.stringify(mantras));

//       set({
//         dailyMantras: mantras,
//         currentMantraIndex: 0,
//         weekday,
//         deity,
//         loading: false,
//       });
//     } catch (err: any) {
//       console.log("Error loading mantras:", err);
//       set({ error: err.message || "Failed to load daily practice", loading: false });
//     }
//   },

//   nextMantra: () => {
//     const { currentMantraIndex, dailyMantras } = get();
//     if (currentMantraIndex < dailyMantras.length - 1)
//       set({ currentMantraIndex: currentMantraIndex + 1 });
//   },

//   prevMantra: () => {
//     const { currentMantraIndex } = get();
//     if (currentMantraIndex > 0)
//       set({ currentMantraIndex: currentMantraIndex - 1 });
//   },
// }));
