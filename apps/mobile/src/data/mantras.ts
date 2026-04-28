import BN from "../config/locales/bn/mantras-bn.json";
import EN from "../config/locales/en/mantras-en.json";
import GU from "../config/locales/gu/mantras-gu.json";
import HI from "../config/locales/hi/mantras-hi.json";
import KN from "../config/locales/kn/mantras-kn.json";
import ML from "../config/locales/ml/mantras-ml.json";
import MR from "../config/locales/mr/matras-mr.json";
import OR from "../config/locales/or/mantras-or.json";
import TA from "../config/locales/ta/mantras-ta.json";
import TE from "../config/locales/te/mantras-te.json";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface MantraSource {
  title?: string;
  ref?: string;
}

export interface MantraItem {
  id: string;
  deity?: string;
  text: string;
  explanation: string[] | string;
  source?: MantraSource;
  tags?: string[];
  devanagari: string;
  iast?: string;
  simplified_pronunciation?: string;
  suggested_reps?: number;
  best_times?: string[];
  audio_url?: string;
  difficulty?: 1 | 2 | 3;
  weight?: number;
}

export interface PickMantraOptions {
  locale?: string;
  recently_shown?: string[];
  slot?: "morning" | "day" | "evening" | "any";
  prefer_tags?: string[];
  deityTag?: string;
  mode?: "weighted" | "random";
}

export const CATALOGS: Record<string, MantraItem[]> = {
  en: EN as MantraItem[],
  hi: HI as MantraItem[],
  mr: MR as MantraItem[],
  bn: BN as MantraItem[],
  ta: TA as MantraItem[],
  te: TE as MantraItem[],
  kn: KN as MantraItem[],
  ml: ML as MantraItem[],
  gu: GU as MantraItem[],
  or: OR as MantraItem[],
};

export function pickMantra({
  locale = "en",
  recently_shown = [],
  slot = "any",
  prefer_tags = [],
  deityTag,
  mode = "weighted",
}: PickMantraOptions = {}): MantraItem | null {
  const catalog = getCatalog(locale);
  if (!catalog.length) return null;

  const pool = catalog.slice();
  const slotSet = getSlotSet(slot);
  const preferTagSet = new Set(prefer_tags.map(String));
  const recent = new Set(recently_shown.map(String));

  const score = (m: MantraItem): number => {
    let s = typeof m.weight === "number" ? m.weight : 1;
    const tags = new Set(m.tags || []);
    const times = Array.isArray(m.best_times) ? m.best_times : [];

    if (times.some((t) => slotSet.has(String(t)))) s += 0.9;
    for (const t of preferTagSet) if (tags.has(t)) s += 0.6;
    if (deityTag && (m.deity === deityTag || tags.has(deityTag))) s += 0.7;
    if (recent.has(m.id)) s *= 0.35;

    return Math.max(0.01, s);
  };

  const chosen =
    mode === "random"
      ? pool[Math.floor(Math.random() * pool.length)]
      : chooseWeighted(pool, score);

  return chosen
    ? { ...chosen, explanation: normalizeExplanation(chosen.explanation) }
    : null;
}

// Helpers
export function getCatalog(locale: string): MantraItem[] {
  const key = (locale || "en").toLowerCase();
  const base = key.split("-")[0];
  return CATALOGS[base] || CATALOGS.en || [];
}

function getSlotSet(slot: string): Set<string> {
  const map: Record<string, Set<string>> = {
    morning: new Set(["dawn", "sunrise", "morning"]),
    day: new Set(["midday", "afternoon"]),
    evening: new Set(["sunset", "evening", "night"]),
    any: new Set([
      "dawn",
      "sunrise",
      "morning",
      "midday",
      "afternoon",
      "sunset",
      "evening",
      "night",
    ]),
  };
  return map[slot] || map.any;
}

function normalizeExplanation(expl: string[] | string | undefined): string[] {
  if (Array.isArray(expl)) return expl;
  if (typeof expl === "string")
    return expl.split(/\n\s*\n/g).filter(Boolean);
  return [];
}

function chooseWeighted<T>(arr: T[], scoreFn: (item: T) => number): T | null {
  if (!arr.length) return null;
  const weights = arr.map(scoreFn);
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[0];
}

// ========================================
// Day-Based Rotation System
// ========================================

const MANTRA_BATCH_SIZE = 5;
const MANTRA_ROTATION_KEY = "kalpx.mantra_rotation_state";

interface MantraRotationState {
  startDate: Date;
  order: string[];
  locale: string;
}

/**
 * Calculate the number of days between two dates
 */
function dayDiff(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const startMs = new Date(start).setHours(0, 0, 0, 0);
  const endMs = new Date(end).setHours(0, 0, 0, 0);
  return Math.floor((endMs - startMs) / msPerDay);
}

/**
 * Get or initialize the mantra rotation state
 */
async function getMantraRotationState(locale: string = "en"): Promise<MantraRotationState> {
  try {
    const stored = await AsyncStorage.getItem(MANTRA_ROTATION_KEY);

    if (stored) {
      const parsed = JSON.parse(stored);
      // Check if locale matches
      if (parsed.locale === locale && parsed.order && parsed.startDate) {
        return {
          ...parsed,
          startDate: new Date(parsed.startDate),
        };
      }
    }
  } catch (e) {
    console.warn("[Mantra Rotation] Failed to load state:", e);
  }

  // Initialize new rotation state
  const catalog = getCatalog(locale);
  const order = catalog.map((m) => m.id);

  // Shuffle the order for randomness
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }

  const state: MantraRotationState = {
    startDate: new Date(),
    order,
    locale,
  };

  try {
    await AsyncStorage.setItem(MANTRA_ROTATION_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("[Mantra Rotation] Failed to save state:", e);
  }

  return state;
}

/**
 * Get daily mantras based on day-based rotation
 */
export async function getDailyMantrasDayBased({ locale = "en" } = {}): Promise<MantraItem[]> {
  const state = await getMantraRotationState(locale);

  const today = new Date();
  const userDayIndex = dayDiff(state.startDate, today);

  const order = state.order;
  const total = order.length;

  if (!total) return [];

  const startIndex = (userDayIndex * MANTRA_BATCH_SIZE) % total;

  const ids: string[] = [];
  for (let i = 0; i < MANTRA_BATCH_SIZE; i++) {
    ids.push(order[(startIndex + i) % total]);
  }

  const catalog = getCatalog(locale);

  const result = ids
    .map((id) => catalog.find((m) => m.id === id))
    .filter(Boolean)
    .map((m) => ({
      ...m!,
      explanation: normalizeExplanation(m!.explanation),
    }));

  // Safety fallback — auto heal corruption
  if (result.length < MANTRA_BATCH_SIZE) {
    await AsyncStorage.removeItem(MANTRA_ROTATION_KEY);
    return getDailyMantrasDayBased({ locale });
  }

  return result;
}
