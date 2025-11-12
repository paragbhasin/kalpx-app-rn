import i18n from "../config/i18n";
import { CATALOGS } from "../data/mantras";

export const getTranslatedPractice = (p: any, t: any) => {
  if (!p) return { name: "", desc: "" };

  const langKey = i18n.language?.split("-")[0]?.toLowerCase() || "en";

  // 🔹 Flatten nested details (API sometimes nests 3–5 levels deep)
  let details = p.details;
  while (details?.details) {
    details = details.details;
  }
  const item = { ...p, ...details };

  // 🪔 1️⃣ Sankalp (Yoga Sutra / Gita)
  if (item.i18n?.short || item.type === "sankalp" || item.details?.type === "sankalp") {
    const shortKey = item.i18n?.short;
    const suggestedKey = item.i18n?.suggested;

    const name =
      (shortKey && t(shortKey)) ||
      item.short_text ||
      item.name ||
      "Unnamed Practice";

    const desc =
      (suggestedKey && t(suggestedKey)) ||
      item.suggested_practice ||
      item.tooltip ||
      item.description ||
      "";

    return { name, desc };
  }

  // 🕉️ 2️⃣ Mantra
  if (
    item.id?.startsWith("mantra.") ||
    item.text ||
    item.devanagari ||
    item.details?.type === "mantra"
  ) {
    const localizedCatalog = CATALOGS[langKey] || CATALOGS.en;
    const localizedMantra = localizedCatalog.find((m) => m.id === item.id);
    const fallbackMantra = CATALOGS.en.find((m) => m.id === item.id);
    const active = localizedMantra || fallbackMantra || item;

    const name =
    
      active.text ||
      item.text ||
      item.name ||
      item.devanagari ||
        active.devanagari ||
      "Unnamed Mantra";

    const desc =
      Array.isArray(active.explanation)
        ? active.explanation.join(" ")
        : Array.isArray(item.explanation)
        ? item.explanation.join(" ")
        : active.explanation || item.explanation || item.description || "";

    return { name, desc };
  }

  // 🧘 3️⃣ Custom Practices (NO TRANSLATION)
  if (
    item.source === "custom" ||
    String(item.practice_id || "").startsWith("custom_")
  ) {
    return {
      name: item.name?.trim() || "Custom Practice",
      desc: item.description?.trim() || "",
    };
  }

  // 🪷 4️⃣ Library / Sanatan Practices (from translation files)
  const nameKey = `practices.${item.id}.name`;
  const descKey = `practices.${item.id}.description`;

  const translatedName = t(nameKey, { defaultValue: "" });
  const hasTranslation = translatedName && translatedName !== nameKey;

  const name =
    hasTranslation
      ? translatedName
      : item.name === "Unnamed Practice" && item.i18n?.short
      ? t(item.i18n.short)
      : item.name;

  const desc =
    hasTranslation
      ? t(descKey, { defaultValue: item.description || "" })
      : item.description || "";

  return { name, desc };
};









// export const getTranslatedPractice = (p: any, t: any) => {
//   if (!p) return { name: "", desc: "" };

//   // 🪔 1️⃣ Sankalpa or i18n-based items
//   if (p.i18n?.short) {
//     return {
//       name: t(p.i18n.short, { defaultValue: p.short_text || p.name }),
//       desc:
//         t(p.i18n.suggested, {
//           defaultValue:
//             p.tooltip || p.suggested_practice || p.description || "",
//         }) || "",
//     };
//   }

//   // 🕉️ 2️⃣ Mantra catalog items (usually have devanagari or explanation array)
//   if (p.id?.startsWith("mantra.")) {
//     return {
//       name: p.devanagari || p.text || p.name,
//       desc:
//         Array.isArray(p.explanation) && p.explanation.length > 0
//           ? p.explanation.join(" ")
//           : p.explanation || p.description || "",
//     };
//   }

//   // 🪷 3️⃣ Check dynamically if translation exists in JSON (no prefix assumptions)
//   const nameKey = `practices.${p.id}.name`;
//   const descKey = `practices.${p.id}.description`;

//   // Check if a translation exists (not the untranslated key itself)
//   const translatedName = t(nameKey, { defaultValue: "" });
//   const hasTranslation = translatedName !== nameKey;

//   if (hasTranslation) {
//     return {
//       name: translatedName || p.name,
//       desc:
//         t(descKey, { defaultValue: p.description || "" }) ||
//         p.description ||
//         "",
//     };
//   }

//   // 🪶 4️⃣ Fallback for any unlisted / custom practice
//   return {
//     name: p.name || "Custom Practice",
//     desc: p.description || "A personal practice crafted with your intention.",
//   };
// };




// // src/utils/getTranslatedPractice.ts
// export const getTranslatedPractice = (p, t) => {
//   if (!p) return { name: "", desc: "" };

//   // 🪔 Sankalp Type
//   if (p.i18n?.short) {
//     return {
//       name: t(p.i18n.short) || p.short_text || p.name,
//       desc:
//         t(p.i18n.suggested) ||
//         t(p.i18n.tooltip) ||
//         p.tooltip ||
//         p.suggested_practice ||
//         "",
//     };
//   }

//   // 🕉️ Mantra Type
//   if (p.id?.startsWith("mantra.")) {
//     return {
//       name: p.devanagari || p.text || p.name,
//       desc:
//         Array.isArray(p.explanation) && p.explanation.length > 0
//           ? p.explanation[0]
//           : p.explanation || "",
//     };
//   }

//   // 🪷 Sanatan Practice Type
//   if (p.id && p.id.startsWith("japa_")) {
//     return {
//       name: t(`practices.${p.id}.name`, { defaultValue: p.name }),
//       desc: t(`practices.${p.id}.description`, {
//         defaultValue: p.description,
//       }),
//     };
//   }

//   // 🪶 Custom Practice (user-created)
//   return {
//     name: p.name || "Custom Practice",
//     desc: p.description || "A personal practice crafted with your intention.",
//   };
// };
