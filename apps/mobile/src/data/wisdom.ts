// /data/wisdom.ts
import i18next from "i18next";
import BN from "../config/locales/bn/wisdom-bn.json";
import EN from "../config/locales/en/wisdom-en.json";
import GU from "../config/locales/gu/wisdom-gu.json";
import HI from "../config/locales/hi/wisdom-hi.json";
import KN from "../config/locales/kn/wisdom-kn.json";
import ML from "../config/locales/ml/wisdom-ml.json";
import MR from "../config/locales/mr/wisdom-mr.json";
import TA from "../config/locales/ta/wisdom-ta.json";
import TE from "../config/locales/te/wisdom-te.json";

// Return localized wisdom array
export const getLocalizedWisdom = () => {
  const lang = i18next.language || "en";
  switch (lang) {
    case "hi": return Object.values(HI);
    case "gu": return Object.values(GU);
    case "bn": return Object.values(BN);
    case "kn": return Object.values(KN);
    case "ml": return Object.values(ML);
    case "mr": return Object.values(MR);
    case "ta": return Object.values(TA);
    case "te": return Object.values(TE);
    default: return Object.values(EN);
  }
};
