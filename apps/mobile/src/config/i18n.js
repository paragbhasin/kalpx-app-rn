import i18n from "i18next";
import merge from "lodash/merge";
import { initReactI18next } from "react-i18next";
import moment from "moment";

// Supported locales at startup. To re-enable a language: add its code here,
// restore its imports and resource block below, and filter Language.tsx list.
const ENABLED_LOCALES = ["en"];

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
  },
  interpolation: {
    escapeValue: false,
  },
  saveMissing: true,
});

// Keep moment in English regardless of any in-session language changes
i18n.on("languageChanged", () => {
  moment.locale("en");
});

export { ENABLED_LOCALES };
export default i18n;
