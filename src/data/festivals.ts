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

// Map festival synonyms/aliases to a canonical name
export const FESTIVAL_ALIASES: Record<string, string[]> = {
  "Ganesh Chaturthi": ["Vinayaka Chaturthi", "Ganeshotsav"],
  "Krishna Janmashtami": ["Janmashtami", "Gokulashtami", "Sri Krishna Jayanti"],
  "Diwali/Deepavali": ["Deepavali", "Diwali"],
  "Maha Navmi, Saraswati Pooja": [
    "Mahanavami",
    "Maha Navami",
    "Saraswati Puja",
  ],
  "Rama Navami": ["Ram Navami", "Sri Rama Navami"],
  "Mesha Sankranti": ["Vishu", "Odia New Year", "Pana Sankranti"],
  "Tamil New Year, Vishu": ["Puthandu", "Vishu"],
  "Vaikuntha Ekadashi": ["Vaikunta Ekadasi", "Mukkoti Ekadashi"],
  "Chaitra Navratri, Gudi Padwa, Ugadi": [
    "Chaitra Navratri",
    "Gudi Padwa",
    "Ugadi",
  ],
};

// Importance weight for sorting or prioritization
export const FESTIVAL_IMPORTANCE: Record<string, number> = {
  "Diwali/Deepavali": 100,
  "Dussehra, Vijayadashami": 95,
  "Krishna Janmashtami": 90,
  "Ganesh Chaturthi": 85,
  "Maha Shivaratri": 85,
  "Holi": 80,
  "Rama Navami": 75,
  "Vaikuntha Ekadashi": 70,
  "Makara Sankranti": 65,
  "Pongal": 65,
  "Vasant Panchami": 60,
  "Ratha Saptami": 60,
  "Thaipusam": 60,
  "Chaitra Navratri, Gudi Padwa, Ugadi": 60,
  "Hanuman Jayanti": 60,
  "Mesha Sankranti": 55,
  "Tamil New Year, Vishu": 55,
  "Akshaya Tritiya": 55,
  "Narasimha Jayanti": 55,
  "Jagannath Rath Yatra": 55,
  "Guru Purnima": 55,
  "Naga Panchami": 50,
  "Varalakshmi Vratham": 50,
  "Raksha Bandhan": 50,
  "Shravana Purnima": 50,
  "Onam": 50,
  "Maha Saptami": 50,
  "Maha Ashtami": 50,
  "Maha Navmi, Saraswati Pooja": 50,
  "Dhanteras": 50,
  "Kartika Purnima": 50,
  "Kalabhairav Jayanti": 50,
  "Karthigai Deepam": 50,
};

// Canonicalize festival names for consistent lookup
export function canonicalizeFestival(name: string): string {
  for (const [canon, aliases] of Object.entries(FESTIVAL_ALIASES)) {
    if (canon.toLowerCase() === name.toLowerCase()) return canon;
    if (aliases.some((a) => a.toLowerCase() === name.toLowerCase()))
      return canon;
  }
  return name;
}

// Get all aliases for a festival
export function getAliases(name: string): string[] {
  const canon = canonicalizeFestival(name);
  return [canon, ...(FESTIVAL_ALIASES[canon] || [])];
}

/**
 * Get the localized festival dataset based on app language.
 * Fallback: English
 */
export const getLocalizedFestivals = (): any => {
  const lang = i18next.language?.split("-")[0] || "en"; // handles "en-IN" etc.
  const selectedData = FESTIVAL_TRANSLATIONS[lang] || EN;

  return Object.entries(selectedData)
    .filter(([_, item]: any) => item?.date && item.date !== "Date")
    .map(([key, item]: any) => ({
      ...item,
      id: key,
    }));
};

/**
 * Get today's festival based on current date
 */
export const getTodayFestival = (): Festival | null => {
  const today = moment().format("YYYY-MM-DD");
  const FESTIVALS = getLocalizedFestivals();
  return FESTIVALS.find((f: any) => f.date === today) || null;
};

/**
 * Get upcoming festivals (default: next 3)
 * Sorts by date, then by importance
 */
export const getUpcomingFestivals = (count = 3): Festival[] => {
  const today = moment().format("YYYY-MM-DD");
  const FESTIVALS = getLocalizedFestivals();

  return FESTIVALS.filter((f: any) => moment(f.date).isAfter(today))
    .sort((a: any, b: any) => {
      const dateCompare = moment(a.date).diff(moment(b.date));
      if (dateCompare !== 0) return dateCompare;

      const importanceA = FESTIVAL_IMPORTANCE[canonicalizeFestival(a.name)] || 0;
      const importanceB = FESTIVAL_IMPORTANCE[canonicalizeFestival(b.name)] || 0;
      return importanceB - importanceA;
    })
    .slice(0, count);
};
