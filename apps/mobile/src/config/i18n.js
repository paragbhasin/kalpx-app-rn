import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import merge from "lodash/merge";
import { initReactI18next } from "react-i18next";
import moment from "moment";

// Enabled locales are gated by EXPO_PUBLIC_ENABLED_LOCALES (baked in at EAS build time).
// Production: EXPO_PUBLIC_ENABLED_LOCALES=en  →  English only.
// Dev/internal: EXPO_PUBLIC_ENABLED_LOCALES=en,hi,te  →  all supported locales.
// Translation files are never deleted — only UI exposure is gated.
const _rawEnabledLocales = process.env.EXPO_PUBLIC_ENABLED_LOCALES ?? "en";
const ENABLED_LOCALES = _rawEnabledLocales
  .split(",")
  .map((s) => s.trim())
  .filter((s) => ["en", "hi", "te"].includes(s));
if (!ENABLED_LOCALES.includes("en")) ENABLED_LOCALES.unshift("en");

// Hindi imports
import hi from "./locales/hi/hi.json";

// Telugu imports
import {
  CARRER_ABUNDANCE_MANTRAS as CARRER_ABUNDANCE_MANTRAS_TE,
  CARRER_ABUNDANCE_PRACTICES as CARRER_ABUNDANCE_PRACTICES_TE,
  CARRER_ABUNDANCE_SANKALPS as CARRER_ABUNDANCE_SANKALPS_TE,
} from "./locales/te/CareerProsperity-te";
import {
  EMOTIONAL_HEALING_MANTRAS as EMOTIONAL_HEALING_MANTRAS_TE,
  EMOTIONAL_HEALING_PRACTICES as EMOTIONAL_HEALING_PRACTICES_TE,
  EMOTIONAL_HEALING_SANKALPS as EMOTIONAL_HEALING_SANKALPS_TE,
} from "./locales/te/EmotionalHealing-te";
import te from "./locales/te/te.json";
import festivalsTe from "./locales/te/festivals-te.json";
import {
  FOCUS_MOTIVATION_MANTRAS as FOCUS_MOTIVATION_MANTRAS_TE,
  FOCUS_MOTIVATION_PRACTICES as FOCUS_MOTIVATION_PRACTICES_TE,
  FOCUS_MOTIVATION_SANKALPS as FOCUS_MOTIVATION_SANKALPS_TE,
} from "./locales/te/FocusMotivation-te";
import {
  GRATITUDE_POSTIVITY_MANTRAS as GRATITUDE_POSTIVITY_MANTRAS_TE,
  GRATITUDE_POSTIVITY_PRACTICES as GRATITUDE_POSTIVITY_PRACTICES_TE,
  GRATITUDE_POSTIVITY_SANKALPS as GRATITUDE_POSTIVITY_SANKALPS_TE,
} from "./locales/te/GratitudePositivity-te";
import {
  HEALTH_WELL_BEING_MANTRASS as HEALTH_WELL_BEING_MANTRASS_TE,
  HEALTH_WELL_BEING_PRACTICES as HEALTH_WELL_BEING_PRACTICES_TE,
  HEALTH_WELL_BEING_SANKALPS as HEALTH_WELL_BEING_SANKALPS_TE,
} from "./locales/te/HealthWellbeing-te";
import mantrasTE from "./locales/te/mantras-te.json";
import {
  PEACE_CALM_MANTRAS as PEACE_CALM_MANTRAS_TE,
  PEACE_CALM_PRACTICES as PEACE_CALM_PRACTICES_TE,
  PEACE_CALM_SANKALPS as PEACE_CALM_SANKALPS_TE,
} from "./locales/te/PeaceClam-te";
import practicesTe from "./locales/te/practices-te.json";
import sankalpsTe from "./locales/te/sankalps-te.json";
import {
  SPIRITUAL_GROWTH_MANTRAS as SPIRITUAL_GROWTH_MANTRAS_TE,
  SPIRITUAL_GROWTH_PRACTICES as SPIRITUAL_GROWTH_PRACTICES_TE,
  SPIRITUAL_GROWTH_SANKALPS as SPIRITUAL_GROWTH_SANKALPS_TE,
} from "./locales/te/SpiritualGrowth-te";
import templesTe from "./locales/te/temples_te.json";
import wisdomTe from "./locales/te/wisdom-te.json";

// English imports
import {
  CARRER_ABUNDANCE_MANTRAS,
  CARRER_ABUNDANCE_PRACTICES,
  CARRER_ABUNDANCE_SANKALPS,
} from "./locales/en/CareerProsperity";
import {
  EMOTIONAL_HEALING_MANTRAS,
  EMOTIONAL_HEALING_PRACTICES,
  EMOTIONAL_HEALING_SANKALPS,
} from "./locales/en/EmotionalHealing";
import en from "./locales/en/en.json";
import festivalsEn from "./locales/en/festivals-en.json";
import {
  FOCUS_MOTIVATION_MANTRAS,
  FOCUS_MOTIVATION_PRACTICES,
  FOCUS_MOTIVATION_SANKALPS,
} from "./locales/en/FocusMotivation";
import {
  GRATITUDE_POSTIVITY_MANTRAS,
  GRATITUDE_POSTIVITY_PRACTICES,
  GRATITUDE_POSTIVITY_SANKALPS,
} from "./locales/en/GratitudePositivity";
import {
  HEALTH_WELL_BEING_MANTRASS,
  HEALTH_WELL_BEING_PRACTICES,
  HEALTH_WELL_BEING_SANKALPS,
} from "./locales/en/HealthWellbeing";
import mantrasEn from "./locales/en/mantras-en.json";
import {
  PEACE_CALM_MANTRAS,
  PEACE_CALM_PRACTICES,
  PEACE_CALM_SANKALPS,
} from "./locales/en/PeaceCalm";
import practicesEn from "./locales/en/practices-en.json";
import sankalpsEn from "./locales/en/sankalps-en.json";
import {
  SPIRITUAL_GROWTH_MANTRAS,
  SPIRITUAL_GROWTH_PRACTICES,
  SPIRITUAL_GROWTH_SANKALPS,
} from "./locales/en/SpiritualGrowth";
import templesEn from "./locales/en/temples_en.json";
import wisdomEn from "./locales/en/wisdom-en.json";

const convertArrayToTranslation = (arr, categoryKey) => {
  const obj = {};
  if (!arr) return obj;
  arr.forEach((item) => {
    if (item.id) obj[item.id] = { ...item, category: categoryKey };
  });
  return obj;
};

const getCategoryTranslations = (
  peaceP,
  peaceM,
  peaceS,
  spiritualP,
  spiritualM,
  spiritualS,
  careerP,
  careerM,
  careerS,
  focusP,
  focusM,
  focusS,
  healingP,
  healingM,
  healingS,
  gratitudeP,
  gratitudeM,
  gratitudeS,
  healthP,
  healthM,
  healthS
) => {
  return {
    ...convertArrayToTranslation(peaceP, "peace-calm"),
    ...convertArrayToTranslation(peaceM, "peace-calm"),
    ...convertArrayToTranslation(peaceS, "peace-calm"),
    ...convertArrayToTranslation(spiritualP, "spiritual-growth"),
    ...convertArrayToTranslation(spiritualM, "spiritual-growth"),
    ...convertArrayToTranslation(spiritualS, "spiritual-growth"),
    ...convertArrayToTranslation(careerP, "career"),
    ...convertArrayToTranslation(careerM, "career"),
    ...convertArrayToTranslation(careerS, "career"),
    ...convertArrayToTranslation(focusP, "focus"),
    ...convertArrayToTranslation(focusM, "focus"),
    ...convertArrayToTranslation(focusS, "focus"),
    ...convertArrayToTranslation(healingP, "healing"),
    ...convertArrayToTranslation(healingM, "healing"),
    ...convertArrayToTranslation(healingS, "healing"),
    ...convertArrayToTranslation(gratitudeP, "gratitude"),
    ...convertArrayToTranslation(gratitudeM, "gratitude"),
    ...convertArrayToTranslation(gratitudeS, "gratitude"),
    ...convertArrayToTranslation(healthP, "health"),
    ...convertArrayToTranslation(healthM, "health"),
    ...convertArrayToTranslation(healthS, "health"),
  };
};

// ✅ Deep merge translations to avoid overwriting nested objects
const translations = {
  te: merge(
    {},
    te,
    templesTe,
    mantrasTE,
    festivalsTe,
    sankalpsTe,
    wisdomTe,
    practicesTe,
    getCategoryTranslations(
      PEACE_CALM_PRACTICES_TE,
      PEACE_CALM_MANTRAS_TE,
      PEACE_CALM_SANKALPS_TE,
      SPIRITUAL_GROWTH_PRACTICES_TE,
      SPIRITUAL_GROWTH_MANTRAS_TE,
      SPIRITUAL_GROWTH_SANKALPS_TE,
      CARRER_ABUNDANCE_PRACTICES_TE,
      CARRER_ABUNDANCE_MANTRAS_TE,
      CARRER_ABUNDANCE_SANKALPS_TE,
      FOCUS_MOTIVATION_PRACTICES_TE,
      FOCUS_MOTIVATION_MANTRAS_TE,
      FOCUS_MOTIVATION_SANKALPS_TE,
      EMOTIONAL_HEALING_PRACTICES_TE,
      EMOTIONAL_HEALING_MANTRAS_TE,
      EMOTIONAL_HEALING_SANKALPS_TE,
      GRATITUDE_POSTIVITY_PRACTICES_TE,
      GRATITUDE_POSTIVITY_MANTRAS_TE,
      GRATITUDE_POSTIVITY_SANKALPS_TE,
      HEALTH_WELL_BEING_PRACTICES_TE,
      HEALTH_WELL_BEING_MANTRASS_TE,
      HEALTH_WELL_BEING_SANKALPS_TE
    )
  ),
  en: merge(
    {},
    en,
    templesEn,
    mantrasEn,
    festivalsEn,
    sankalpsEn,
    wisdomEn,
    practicesEn,
    getCategoryTranslations(
      PEACE_CALM_PRACTICES,
      PEACE_CALM_MANTRAS,
      PEACE_CALM_SANKALPS,
      SPIRITUAL_GROWTH_PRACTICES,
      SPIRITUAL_GROWTH_MANTRAS,
      SPIRITUAL_GROWTH_SANKALPS,
      CARRER_ABUNDANCE_PRACTICES,
      CARRER_ABUNDANCE_MANTRAS,
      CARRER_ABUNDANCE_SANKALPS,
      FOCUS_MOTIVATION_PRACTICES,
      FOCUS_MOTIVATION_MANTRAS,
      FOCUS_MOTIVATION_SANKALPS,
      EMOTIONAL_HEALING_PRACTICES,
      EMOTIONAL_HEALING_MANTRAS,
      EMOTIONAL_HEALING_SANKALPS,
      GRATITUDE_POSTIVITY_PRACTICES,
      GRATITUDE_POSTIVITY_MANTRAS,
      GRATITUDE_POSTIVITY_SANKALPS,
      HEALTH_WELL_BEING_PRACTICES,
      HEALTH_WELL_BEING_MANTRASS,
      HEALTH_WELL_BEING_SANKALPS
    )
  ),
};

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  lng: "en",
  fallbackLng: "en",
  debug: true,
  resources: {
    en: { translation: translations.en },
    hi: { translation: hi },
    te: { translation: translations.te },
  },
  interpolation: {
    escapeValue: false,
  },
  saveMissing: true,
}).then(async () => {
  // Restore the user's saved language preference. If the saved locale is no
  // longer in ENABLED_LOCALES (e.g. prod build that only ships English), silently
  // fall back to English so the app never gets stuck on an invisible language.
  try {
    const saved = await AsyncStorage.getItem("kalpx_locale");
    const target = saved && ENABLED_LOCALES.includes(saved) ? saved : "en";
    if (target !== i18n.language) {
      i18n.changeLanguage(target);
    }
  } catch {
    if (!ENABLED_LOCALES.includes(i18n.language)) {
      i18n.changeLanguage("en");
    }
  }
});

// Keep moment in English regardless of any in-session language changes
i18n.on("languageChanged", () => {
  moment.locale("en");
});

export { ENABLED_LOCALES };
export default i18n;
