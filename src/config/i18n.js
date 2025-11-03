// src/i18n.ts
import * as Localization from "expo-localization";
import i18n from "i18next";
import merge from "lodash.merge"; // deep merge utility
import { initReactI18next } from "react-i18next";

// Import your translations
import bn from "./locales/bn/bn.json";
import festivalsBn from "./locales/bn/festivals-bn.json";
import mantrasBn from "./locales/bn/mantras-bn.json";
import practicesBn from "./locales/bn/practices-bn.json";
import sankalpsBn from "./locales/bn/sankalps-bn.json";
import wisdomBn from "./locales/bn/wisdom-bn.json";
import en from "./locales/en/en.json";
import festivalsEn from "./locales/en/festivals-en.json";
import mantrasEn from "./locales/en/mantras-en.json";
import practicesEn from "./locales/en/practices-en.json";
import sankalpsEn from "./locales/en/sankalps-en.json";
import templesEn from "./locales/en/temples_en.json";
import wisdomEn from "./locales/en/wisdom-en.json";
import festivalsGu from "./locales/gu/festivals-gu.json";
import gu from "./locales/gu/gu.json";
import mantrasGu from "./locales/gu/mantras-gu.json";
import practicesGu from "./locales/gu/practices-gu.json";
import sankalpsGu from "./locales/gu/sankalps-gu.json";
import wisdomGu from "./locales/gu/wisdom-gu.json";
import festivalsHi from "./locales/hi/festivals-hi.json";
import hi from "./locales/hi/hi.json";
import mantrasHi from "./locales/hi/mantras-hi.json";
import practicesHi from "./locales/hi/practices-hi.json";
import sankalpsHi from "./locales/hi/sankalps-hi.json";
import templesHi from "./locales/hi/temples_hi.json";
import wisdomHi from "./locales/hi/wisdom-hi.json";
import festivalsKn from "./locales/kn/festivals-kn.json";
import kn from "./locales/kn/kn.json";
import mantrasKn from "./locales/kn/mantras-kn.json";
import practicesKn from "./locales/kn/practices-kn.json";
import sankalpsKn from "./locales/kn/sankalps-kn.json";
import wisdomKn from "./locales/kn/wisdom-kn.json";
import festivalsMl from "./locales/ml/festivals-ml.json";
import mantrasMl from "./locales/ml/mantras-ml.json";
import ml from "./locales/ml/ml.json";
import practicesMl from "./locales/ml/practices-ml.json";
import sankalpsMl from "./locales/ml/sankalps-ml.json";
import wisdomMl from "./locales/ml/wisdom-ml.json";
import festivalsMr from "./locales/mr/festivals-mr.json";
import mantrasMr from "./locales/mr/matras-mr.json";
import mr from "./locales/mr/mr.json";
import practicesMr from "./locales/mr/practices-mr.json";
import sankalpsMr from "./locales/mr/sankalps-mr.json";
import wisdomMr from "./locales/mr/wisdom-mr.json";
import festivalsOr from "./locales/or/festivals-or.json";
import mantrasOr from "./locales/or/mantras-or.json";
import or from "./locales/or/or.json";
import practicesOr from "./locales/or/practices-or.json";
import sankalpsOr from "./locales/or/sankalps-or.json";
import wisdomOr from "./locales/or/wisdom-or.json";
import festivalsTa from "./locales/ta/festivals-ta.json";
import mantrasTa from "./locales/ta/mantras-ta.json";
import practicesTa from "./locales/ta/practices-ta.json";
import sankalpsTa from "./locales/ta/sankalps-ta.json";
import ta from "./locales/ta/ta.json";
import wisdomTa from "./locales/ta/wisdom-ta.json";
import festivalsTe from "./locales/te/festivals-te.json";
import mantrasTe from "./locales/te/mantras-te.json";
import practicesTe from "./locales/te/practices-te.json";
import sankalpsTe from "./locales/te/sankalps-te.json";
import te from "./locales/te/te.json";
import templesTe from "./locales/te/temples_te.json";
import wisdomTe from "./locales/te/wisdom-te.json";


// Safely get device language
const deviceLanguage =
  Array.isArray(Localization.getLocales()) && Localization.getLocales().length > 0
    ? Localization.getLocales()[0].languageCode // e.g. "en"
    : "en";

// ✅ Deep merge translations to avoid overwriting nested objects
const translations = {
  en: merge({}, en, templesEn, mantrasEn, festivalsEn, sankalpsEn, wisdomEn, practicesEn),
  hi: merge({}, hi, templesHi, mantrasHi, festivalsHi, sankalpsHi, wisdomHi, practicesHi),
  te: merge({}, te, templesTe, mantrasTe, sankalpsTe, festivalsTe, wisdomTe, practicesTe),
  ta: merge({}, ta, mantrasTa, sankalpsTa, festivalsTa, wisdomTa, practicesTa),
  bn: merge({}, bn, mantrasBn, sankalpsBn, festivalsBn, wisdomBn, practicesBn),
  gu: merge({}, gu, mantrasGu, sankalpsGu, festivalsGu, wisdomGu, practicesGu),
  kn: merge({}, kn, mantrasKn, sankalpsKn, festivalsKn, wisdomKn, practicesKn),
  ml: merge({}, ml, mantrasMl, sankalpsMl, festivalsMl, wisdomMl, practicesMl),
  mr: merge({}, mr, mantrasMr, sankalpsMr, festivalsMr, wisdomMr, practicesMr),
  or: merge({}, or, mantrasOr, sankalpsOr, festivalsOr, wisdomOr, practicesOr),
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
    ta: { translation: translations.ta },
    bn: { translation: translations.bn },
    gu: { translation: translations.gu },
    kn: { translation: translations.kn},
    ml: { translation: translations.ml },
    mr: { translation: translations.mr},
    or: { translation: translations.or},
  },
  interpolation: {
    escapeValue: false, // react already escapes
  },
  saveMissing: true, // optional: sends missing keys to console
});

export default i18n;
