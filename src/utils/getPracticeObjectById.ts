import i18n from "../config/i18n";
import { CATALOGS } from "../data/mantras";
import { SANATAN_PRACTICES_FINAL } from "../data/sanatanPractices";
import { DAILY_SANKALPS } from "../data/sankalps";

export const getRawPracticeObject = (id: string, item: any): { data: any, type: 'mantra' | 'sankalp' | 'practice' } => {
  const lang = i18n.language;

  /** 1️⃣ Check Mantra Catalog - If found here, we can safely use MantraCard */
  const localizedMantra = CATALOGS[lang]?.find((m) => m.id === id);
  if (localizedMantra) return { data: localizedMantra, type: 'mantra' };

  const fallbackMantra = CATALOGS.en?.find((m) => m.id === id);
  if (fallbackMantra) return { data: fallbackMantra, type: 'mantra' };

  /** 2️⃣ Check Sankalps - If found here, we can safely use SankalpCard */
  const sankalp = DAILY_SANKALPS?.find((s) => s.id === id);
  if (sankalp) return { data: sankalp, type: 'sankalp' };

  /** 3️⃣ Check Sanatan Practice Library */
  const sanatan = SANATAN_PRACTICES_FINAL?.find((p) => p.id === id);
  if (sanatan) return { data: sanatan, type: 'practice' };

  /** 4️⃣ Check i18n bundle - Default to 'practice' type for generic display */
  const bundle = i18n.getResourceBundle(lang, "translation");
  if (bundle?.[id]) {
    return { data: bundle[id], type: 'practice' };
  }

  /** 5️⃣ If none matched: return original API item and default to 'practice' */
  return { data: item, type: 'practice' };
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