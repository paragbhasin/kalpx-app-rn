// /data/festivals.ts
import i18next from "i18next"; // 👈 ensures we detect the current app language dynamically
import moment from "moment";

export interface Festival {
  name: string;
  date: string;
  deity: string | string[];
  fasting: {
    observers: string;
    rules: string;
    significance: string;
  };
  mythology: {
    story: string;
    reference: string;
  };
  spiritualBenefit: string;
  traditionalFoods: string[];
  celebrationPractices: string[];
  regionalCustoms: Record<string, string> | string;
  videoKeywords?: string[];
  symbols: string[];
  quote: {
    text: string;
    source: string;
  };
}

// 🕉️ Import all localized festival data
import BN from "../config/locales/bn/festivals-bn.json";
import EN from "../config/locales/en/festivals-en.json";
import GU from "../config/locales/gu/festivals-gu.json";
import HI from "../config/locales/hi/festivals-hi.json";
import KN from "../config/locales/kn/festivals-kn.json";
import ML from "../config/locales/ml/festivals-ml.json";
import MR from "../config/locales/mr/festivals-mr.json";
import OR from "../config/locales/or/festivals-or.json";
import TA from "../config/locales/ta/festivals-ta.json";
import TE from "../config/locales/te/festivals-te.json";

/**
 * 🌍 Language mapping table
 * Ensures correct JSON is selected for current i18next.language
 */
const FESTIVAL_TRANSLATIONS: Record<string, any> = {
  en: EN,
  hi: HI,
  bn: BN,
  gu: GU,
  kn: KN,
  ml: ML,
  mr: MR,
  or: OR,
  ta: TA,
  te: TE,
};

/**
 * Get the localized festival dataset based on app language.
 * Fallback: English
 */
export const getLocalizedFestivals = (): any => {
  const lang = i18next.language?.split("-")[0] || "en"; // handles "en-IN" etc.
  const selectedData = FESTIVAL_TRANSLATIONS[lang] || EN;
  return Object.values(selectedData).filter((item: any) => item?.date);
};

/**
 * Get today's festival based on current date
 */
export const getTodayFestival = (): Festival | null => {
  const today = moment().format("YYYY-MM-DD");
  const FESTIVALS = getLocalizedFestivals();
  return FESTIVALS.find((f) => f.date === today) || null;
};

/**
 * Get upcoming festivals (default: next 3)
 */
export const getUpcomingFestivals = (count = 3): Festival[] => {
  const today = moment().format("YYYY-MM-DD");
  const FESTIVALS = getLocalizedFestivals();

  return FESTIVALS.filter((f) => moment(f.date).isAfter(today))
    .sort((a, b) => moment(a.date).diff(moment(b.date)))
    .slice(0, count);
};
