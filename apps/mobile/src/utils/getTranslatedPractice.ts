import i18n from "../config/i18n";
import { CATALOGS } from "../data/mantras";

import sankalpsEn from "../config/locales/en/sankalps-en.json";
import practicesEn from "../config/locales/en/practices-en.json";

const LOCALE_DATA: Record<string, any> = {
  sankalps: { en: sankalpsEn },
  practices: { en: practicesEn },
};

import { SANATAN_PRACTICES_FINAL } from "../data/sanatanPractices";

// Import category mantras (EN)
import { PEACE_CALM_MANTRAS as PC_MANTRAS_EN } from "../config/locales/en/PeaceCalm";
import { CARRER_ABUNDANCE_MANTRAS as CP_MANTRAS_EN } from "../config/locales/en/CareerProsperity";
import { EMOTIONAL_HEALING_MANTRAS as EH_MANTRAS_EN } from "../config/locales/en/EmotionalHealing";
import { FOCUS_MOTIVATION_MANTRAS as FM_MANTRAS_EN } from "../config/locales/en/FocusMotivation";
import { GRATITUDE_POSTIVITY_MANTRAS as GP_MANTRAS_EN } from "../config/locales/en/GratitudePositivity";
import { HEALTH_WELL_BEING_MANTRASS as HW_MANTRAS_EN } from "../config/locales/en/HealthWellbeing";
import { SPIRITUAL_GROWTH_MANTRAS as SG_MANTRAS_EN } from "../config/locales/en/SpiritualGrowth";

// Import category sankalps (EN)
import { PEACE_CALM_SANKALPS as PC_SANKALPS_EN } from "../config/locales/en/PeaceCalm";
import { CARRER_ABUNDANCE_SANKALPS as CP_SANKALPS_EN } from "../config/locales/en/CareerProsperity";
import { EMOTIONAL_HEALING_SANKALPS as EH_SANKALPS_EN } from "../config/locales/en/EmotionalHealing";
import { FOCUS_MOTIVATION_SANKALPS as FM_SANKALPS_EN } from "../config/locales/en/FocusMotivation";
import { GRATITUDE_POSTIVITY_SANKALPS as GP_SANKALPS_EN } from "../config/locales/en/GratitudePositivity";
import { HEALTH_WELL_BEING_SANKALPS as HW_SANKALPS_EN } from "../config/locales/en/HealthWellbeing";
import { SPIRITUAL_GROWTH_SANKALPS as SG_SANKALPS_EN } from "../config/locales/en/SpiritualGrowth";

// Import category practices (EN)
import { PEACE_CALM_PRACTICES as PC_PRACTICES_EN } from "../config/locales/en/PeaceCalm";
import { CARRER_ABUNDANCE_PRACTICES as CP_PRACTICES_EN } from "../config/locales/en/CareerProsperity";
import { EMOTIONAL_HEALING_PRACTICES as EH_PRACTICES_EN } from "../config/locales/en/EmotionalHealing";
import { FOCUS_MOTIVATION_PRACTICES as FM_PRACTICES_EN } from "../config/locales/en/FocusMotivation";
import { GRATITUDE_POSTIVITY_PRACTICES as GP_PRACTICES_EN } from "../config/locales/en/GratitudePositivity";
import { HEALTH_WELL_BEING_PRACTICES as HW_PRACTICES_EN } from "../config/locales/en/HealthWellbeing";
import { SPIRITUAL_GROWTH_PRACTICES as SG_PRACTICES_EN } from "../config/locales/en/SpiritualGrowth";

const CATEGORY_MANTRAS_EN = [
  ...(PC_MANTRAS_EN || []),
  ...(CP_MANTRAS_EN || []),
  ...(EH_MANTRAS_EN || []),
  ...(FM_MANTRAS_EN || []),
  ...(GP_MANTRAS_EN || []),
  ...(HW_MANTRAS_EN || []),
  ...(SG_MANTRAS_EN || []),
];

const CATEGORY_SANKALPS_EN = [
  ...(PC_SANKALPS_EN || []),
  ...(CP_SANKALPS_EN || []),
  ...(EH_SANKALPS_EN || []),
  ...(FM_SANKALPS_EN || []),
  ...(GP_SANKALPS_EN || []),
  ...(HW_SANKALPS_EN || []),
  ...(SG_SANKALPS_EN || []),
];

const CATEGORY_PRACTICES_EN = [
  ...(PC_PRACTICES_EN || []),
  ...(CP_PRACTICES_EN || []),
  ...(EH_PRACTICES_EN || []),
  ...(FM_PRACTICES_EN || []),
  ...(GP_PRACTICES_EN || []),
  ...(HW_PRACTICES_EN || []),
  ...(SG_PRACTICES_EN || []),
];

const COMBINED_MANTRAS: Record<string, any[]> = {
  en: [...(CATALOGS.en || []), ...CATEGORY_MANTRAS_EN],
};

const COMBINED_SANKALPS: Record<string, any[]> = {
  en: CATEGORY_SANKALPS_EN,
};

const COMBINED_PRACTICES: Record<string, any[]> = {
  en: CATEGORY_PRACTICES_EN,
};

const UNIVERSAL_CATALOG: Record<string, any[]> = {
  en: [
    ...CATEGORY_MANTRAS_EN,
    ...(CATALOGS.en || []),
    ...CATEGORY_SANKALPS_EN,
    ...CATEGORY_PRACTICES_EN,
    ...SANATAN_PRACTICES_FINAL,
  ],
};

export const getTranslatedPractice = (p: any, t: any) => {
  if (!p) return { name: "", desc: "", mantra: "", meaning: "" };

  const langKey = String(i18n.language || "en").split("-")[0].toLowerCase();

  // 🔹 Flatten nested details (API sometimes nests 3–5 levels deep)
  let details = p.details;
  while (details?.details) {
    details = details.details;
  }
  const item = { ...p, ...details };

  // 🌟 UNIVERSAL SEARCH - Try finding in universal catalog first (by ID only)
  const universalCatalog = UNIVERSAL_CATALOG[langKey] || UNIVERSAL_CATALOG.en;
  const searchId = item.practice_id || item.id;

  if (searchId) {
    // 🌟 MASTER JSON LOOKUP (following Vue pattern)
    const lang = langKey.split("-")[0];
    const sData = LOCALE_DATA.sankalps[lang] || LOCALE_DATA.sankalps.en;
    const pData = LOCALE_DATA.practices[lang] || LOCALE_DATA.practices.en;

    // Clean prefix for JSON key lookup
    const cleanSearchId = String(searchId).replace(/^(sankalp|mantra|practice)\./, "");

    const sNameKey = `sankalps.${cleanSearchId}.short`;
    const sDescKey = `sankalps.${cleanSearchId}.tooltip`;
    const sSuggestedKey = `sankalps.${cleanSearchId}.suggested`;
    const pNameKey = `practices.${cleanSearchId}.name`;
    const pDescKey = `practices.${cleanSearchId}.description`;
    const pMantraKey = `practices.${cleanSearchId}.mantra`;
    const pMeaningKey = `practices.${cleanSearchId}.meaning`;

    if (sData && sData[sNameKey]) {
      return {
        name: sData[sNameKey],
        desc: sData[sSuggestedKey] || sData[sDescKey] || item.description || "",
        mantra: "",
        meaning: "",
        summary: sData[sDescKey] || "",
        insight: sData[`sankalps.${cleanSearchId}.insight`] || "",
        benefits: sData[`sankalps.${cleanSearchId}.benefits`] || [],
        duration: sData[`sankalps.${cleanSearchId}.duration`] || "",
        steps: sData[`sankalps.${cleanSearchId}.steps`] || "",
        howToLive: sData[`sankalps.${cleanSearchId}.howToLive`] || "",
        essence: sData[`sankalps.${cleanSearchId}.essence`] || "",
        line: sData[`sankalps.${cleanSearchId}.root`] || "",
        iast: "",
        tags: [],
        suggested_practice: sData[sSuggestedKey] || ""
      };
    }

    if (pData && pData[pNameKey]) {
      return {
        name: pData[pNameKey],
        desc: pData[pDescKey] || item.description || "",
        mantra: pData[pMantraKey] || item.mantra || item.devanagari || "",
        meaning: pData[pMeaningKey] || item.meaning || "",
        summary: pData[pDescKey] || "",
        insight: pData[`practices.${cleanSearchId}.insight`] || "",
        benefits: pData[`practices.${cleanSearchId}.benefits`] || [],
        duration: pData[`practices.${cleanSearchId}.duration`] || "",
        steps: pData[`practices.${cleanSearchId}.steps`] || "",
        howToLive: pData[`practices.${cleanSearchId}.howToLive`] || "",
        essence: pData[`practices.${cleanSearchId}.essence`] || "",
        line: "",
        iast: pData[`practices.${cleanSearchId}.iast`] || "",
        tags: pData[`practices.${cleanSearchId}.tags`] || [],
        suggested_practice: ""
      };
    }

    const found = universalCatalog.find((entry) => entry.id === searchId);
    const fallback = UNIVERSAL_CATALOG.en.find((entry) => entry.id === searchId);
    const universalMatch = found || fallback;

    if (universalMatch) {
      return {
        name: universalMatch.title || universalMatch.text || universalMatch.name || item.name || "Unnamed Practice",
        desc: universalMatch.meaning || universalMatch.summary || universalMatch.line ||
          (Array.isArray(universalMatch.explanation) ? universalMatch.explanation.join(" ") : universalMatch.explanation) ||
          universalMatch.description || item.description || "",
        mantra: universalMatch.devanagari || item.devanagari || "",
        meaning: universalMatch.meaning || item.meaning || "",
        summary: universalMatch.summary || "",
        insight: universalMatch.insight || "",
        benefits: universalMatch.benefits || [],
        duration: universalMatch.duration || "",
        steps: universalMatch.steps || "",
        howToLive: universalMatch.howToLive || "",
        essence: universalMatch.essence || "",
        line: universalMatch.line || "",
        iast: universalMatch.iast || "",
        tags: universalMatch.tags || [],
        suggested_practice: universalMatch.suggested_practice || ""
      };
    }
  }

  // 🪔 1️⃣ Sankalp (Yoga Sutra / Gita)
  const isSankalp = (
    item.i18n?.short ||
    item.type === "sankalp" ||
    item.details?.type === "sankalp" ||
    item.source === "sankalp" ||
    item.id?.startsWith("sankalp_") ||
    item.id?.startsWith("sankalp.") ||
    item.practice_id?.startsWith("sankalp.")
  );

  if (isSankalp) {
    const localizedSankalpsCatalog = COMBINED_SANKALPS[langKey] || COMBINED_SANKALPS.en;
    const rawId = item.practice_id || item.id || details?.id || "";
    const cleanId = rawId.replace(/^(sankalp|mantra|practice)\./, "");

    const localizedSankalp = localizedSankalpsCatalog.find((s) => s.id === rawId || s.id === cleanId);
    const fallbackSankalp = COMBINED_SANKALPS.en.find((s) => s.id === rawId || s.id === cleanId);
    const active = localizedSankalp || fallbackSankalp;

    if (active) {
      return {
        name: active.title || item.name || "Unnamed Practice",
        desc: active.line || item.description || "",
        mantra: "",
        meaning: ""
      };
    }

    const shortKey = item.i18n?.short || (cleanId ? `sankalps.${cleanId}.short` : null);
    const suggestedKey = item.i18n?.suggested || (cleanId ? `sankalps.${cleanId}.suggested` : null);
    const tooltipKey = item.i18n?.tooltip || (cleanId ? `sankalps.${cleanId}.tooltip` : null);

    const name =
      (shortKey && t(shortKey)) ||
      item.short_text ||
      item.name ||
      "Unnamed Practice";

    const desc =
      (suggestedKey && t(suggestedKey)) ||
      (tooltipKey && t(tooltipKey)) ||
      item.suggested_practice ||
      item.tooltip ||
      item.description ||
      "";

    return { name, desc, mantra: "", meaning: "" };
  }

  // 🕉️ 2️⃣ Mantra
  const isMantra = (
    item.id?.startsWith("mantra.") ||
    item.practice_id?.startsWith("mantra.") ||
    item.source === "mantra" ||
    item.text ||
    item.devanagari ||
    item.details?.type === "mantra"
  );

  if (isMantra) {
    const localizedCatalog = COMBINED_MANTRAS[langKey] || COMBINED_MANTRAS.en;
    const searchId = item.practice_id || item.id;

    const localizedMantra = localizedCatalog.find((m) => m.id === searchId);
    const fallbackMantra = COMBINED_MANTRAS.en.find((m) => m.id === searchId);
    const active = localizedMantra || fallbackMantra || item;

    const name =
      active.title ||
      active.text ||
      item.title ||
      item.text ||
      item.name ||
      item.devanagari ||
      active.devanagari ||
      "Unnamed Mantra";

    const desc =
      active.meaning ||
      (Array.isArray(active.explanation)
        ? active.explanation.join(" ")
        : Array.isArray(item.explanation)
          ? item.explanation.join(" ")
          : active.explanation || item.explanation || item.description || "");

    return {
      name,
      desc,
      mantra: active.devanagari || item.devanagari || "",
      meaning: active.meaning || item.meaning || ""
    };
  }

  // 🧘 3️⃣ Custom Practices (NO TRANSLATION)
  if (
    item.source === "custom" ||
    String(item.practice_id || "").startsWith("custom_")
  ) {
    return {
      name: item.name?.trim() || "Custom Practice",
      desc: item.description?.trim() || "",
      mantra: item.mantra || item.devanagari || "",
      meaning: item.meaning || "",
    };
  }

  // 🪷 4️⃣ Library / Sanatan Practices (from category files)
  if (item.source === "practice" || item.source === "library") {
    const localizedPracticesCatalog = COMBINED_PRACTICES[langKey] || COMBINED_PRACTICES.en;
    const searchId = item.practice_id || item.id;

    const localizedPractice = localizedPracticesCatalog.find((p) => p.id === searchId);
    const fallbackPractice = COMBINED_PRACTICES.en.find((p) => p.id === searchId);
    const active = localizedPractice || fallbackPractice;

    if (active) {
      return {
        name: active.title || item.name || "Unnamed Practice",
        desc: active.summary || item.description || "",
        mantra: "",
        meaning: ""
      };
    }
  }

  // 🌐 5️⃣ Fallback to i18n translation keys
  const nameKey = `practices.${item.id}.name`;
  const descKey = `practices.${item.id}.description`;
  const mantraKey = `practices.${item.id}.mantra`;
  const meaningKey = `practices.${item.id}.meaning`;

  const translatedName = t(nameKey, { defaultValue: "" });
  const sankalpName = t(`sankalps.${item.id}.short`, { defaultValue: "" });
  const hasTranslation = (translatedName && translatedName !== nameKey) || (sankalpName && sankalpName !== `sankalps.${item.id}.short`);

  const name =
    hasTranslation
      ? (translatedName && translatedName !== nameKey ? translatedName : sankalpName)
      : item.name === "Unnamed Practice" && item.i18n?.short
        ? t(item.i18n.short)
        : item.name;

  const desc =
    hasTranslation
      ? (t(descKey, { defaultValue: "" }) || t(`sankalps.${item.id}.tooltip`, { defaultValue: item.description || "" }))
      : item.description || "";

  const mantra = t(mantraKey, { defaultValue: item.mantra || item.devanagari || "" });
  const meaning = t(meaningKey, { defaultValue: item.meaning || "" });

  return {
    name,
    desc,
    mantra,
    meaning,
    summary: t(`practices.${item.id}.summary`, { defaultValue: item.summary || "" }),
    insight: t(`practices.${item.id}.insight`, { defaultValue: item.insight || "" }),
    benefits: item.benefits || [],
    duration: t(`practices.${item.id}.duration`, { defaultValue: item.duration || "" }),
    steps: t(`practices.${item.id}.steps`, { defaultValue: item.steps || "" }),
    howToLive: t(`practices.${item.id}.howToLive`, { defaultValue: item.howToLive || "" }),
    essence: t(`practices.${item.id}.essence`, { defaultValue: item.essence || "" }),
    line: t(`practices.${item.id}.line`, { defaultValue: item.line || "" }),
    iast: t(`practices.${item.id}.iast`, { defaultValue: item.iast || "" }),
    tags: item.tags || [],
    suggested_practice: t(`practices.${item.id}.suggested_practice`, { defaultValue: item.suggested_practice || "" })
  };
};
