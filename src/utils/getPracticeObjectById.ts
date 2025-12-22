import i18n from "../config/i18n";
import { CATALOGS } from "../data/mantras";
import { SANATAN_PRACTICES_FINAL } from "../data/sanatanPractices";
import { DAILY_SANKALPS } from "../data/sankalps";

export const getRawPracticeObject = (id: string, item: any) => {
  const lang = i18n.language;
  const bundle = i18n.getResourceBundle(lang, "translation");

  /** 1️⃣ Check i18n bundle */
  if (bundle?.[id]) return bundle[id];

  /** 2️⃣ Check Mantra Catalog */
  const localized = CATALOGS[lang]?.find((m) => m.id === id);
  if (localized) return localized;

  const fallback = CATALOGS.en?.find((m) => m.id === id);
  if (fallback) return fallback;

  /** 3️⃣ Check Sankalps */
  const sankalp = DAILY_SANKALPS?.find((s) => s.id === id);
  if (sankalp) return sankalp;

  /** ⭐️ 4️⃣ Check Sanatan Practice Library */
  const sanatan = SANATAN_PRACTICES_FINAL?.find((p) => p.id === id);
  if (sanatan) return sanatan;

  /** 5️⃣ If none matched: return original API item */
  return item;
};





// import i18n from "../config/i18n";
// import { CATALOGS } from "../data/mantras";
// import { DAILY_SANKALPS } from "../data/sankalps";

// export const getRawPracticeObject = (id: string, item: any) => {
//   const lang = i18n.language;
//   const bundle = i18n.getResourceBundle(lang, "translation");
//   if (bundle?.[id]) return bundle[id];
//   const localized = CATALOGS[lang]?.find((m) => m.id === id);
//   if (localized) return localized;
//   const fallback = CATALOGS.en?.find((m) => m.id === id);
//   if (fallback) return fallback;
//   const sankalp = DAILY_SANKALPS?.find((s) => s.id === id);
//   if (sankalp) return sankalp;
//   return item;
// };