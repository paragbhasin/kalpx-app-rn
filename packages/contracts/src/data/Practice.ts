// Platform-neutral practice utilities.
// The Zustand store (usePracticeStore) and AsyncStorage caching stay in apps/mobile.

export const WEEKDAY_DEITY: Record<string, string> = {
  sunday: "surya",
  monday: "shiva",
  tuesday: "hanuman",
  wednesday: "krishna",
  thursday: "vishnu",
  friday: "lakshmi",
  saturday: "shani",
};

export function getWeekday(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
}

export function getDeityForWeekday(weekday: string): string {
  return WEEKDAY_DEITY[weekday.toLowerCase()] ?? "generic";
}

export function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export function seededRandom(seed: number): () => number {
  let x = Math.sin(seed) * 10000;
  return () => {
    x = Math.sin(x) * 10000;
    return x - Math.floor(x);
  };
}
