// src/i18n.ts
import * as Localization from "expo-localization";
import i18n from "i18next";
import merge from "lodash.merge"; // deep merge utility
import { initReactI18next } from "react-i18next";

// Import your translations
import en from "./locales/en/en.json";
import templesEn from "./locales/en/temples_en.json";
import hi from "./locales/hi/hi.json";
import templesHi from "./locales/hi/temples_hi.json";
import te from "./locales/te/te.json";
import templesTe from "./locales/te/temples_te.json";

// Safely get device language
const deviceLanguage =
  Array.isArray(Localization.getLocales()) && Localization.getLocales().length > 0
    ? Localization.getLocales()[0].languageCode // e.g. "en"
    : "en";

// ✅ Deep merge translations to avoid overwriting nested objects
const translations = {
  en: merge({}, en, templesEn),
  hi: merge({}, hi, templesHi),
  te: merge({}, te, templesTe),
};

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  lng: deviceLanguage,
  fallbackLng: "en",
  debug: true, // optional, shows missing keys in console
  resources: {
    en: { translation: translations.en },
    hi: { translation: translations.hi },
    te: { translation: translations.te },
  },
  interpolation: {
    escapeValue: false, // react already escapes
  },
  saveMissing: true, // optional: sends missing keys to console
});

export default i18n;
