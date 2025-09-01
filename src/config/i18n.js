import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "./locales/en.json";
import hi from "./locales/hi.json";
import te from "./locales/te.json";

// ✅ Safely get the device language
const deviceLanguage =
  Array.isArray(Localization.getLocales()) && Localization.getLocales().length > 0
    ? Localization.getLocales()[0].languageCode // e.g. "en"
    : "en";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  lng: deviceLanguage, // use safe fallback
  fallbackLng: "en",
  resources: {
    en: { translation: en },
    hi: { translation: hi },
    te: { translation: te },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
