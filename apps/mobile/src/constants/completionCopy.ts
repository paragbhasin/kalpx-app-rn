import { useTranslation } from "react-i18next";

type CompletionType =
  | "innerPath_mantra"
  | "innerPath_sankalp"
  | "innerPath_practice"
  | "rhythm_mantra"
  | "rhythm_sankalp"
  | "rhythm_practice";

export type CompletionVariant = "mantra" | "sankalp" | "practice";

const NAME_CARD_LABEL: Record<CompletionVariant, string> = {
  sankalp: "Today's Intention",
  mantra: "Today's Mantra",
  practice: "Today's Practice",
};

const NAME_CARD_GUIDE: Record<CompletionVariant, string> = {
  sankalp: "Let this guide your thoughts, words and actions.",
  mantra: "Let its vibration stay with you through the day.",
  practice: "Carry this stillness into your day.",
};

export function useCompletionCopy(type: CompletionType) {
  const { t } = useTranslation();
  const base = `completion.${type}`;
  const variant: CompletionVariant = type.includes("sankalp")
    ? "sankalp"
    : type.includes("mantra")
      ? "mantra"
      : "practice";
  return {
    variant,
    title: t(`${base}.title`),
    subtitle: t(`${base}.subtitle`),
    badgeSuccess: t(`${base}.badgeSuccess`),
    pending: t(`${base}.pending`),
    failure: t(`${base}.failure`),
    cta: t(`${base}.cta`),
    secondary: t(`${base}.secondary`),
    // Name card ("Today's …") — translatable later via these keys; defaults shipped now.
    nameCardLabel: t(`completion.nameCard.${variant}Label`, {
      defaultValue: NAME_CARD_LABEL[variant],
    }),
    nameCardGuide: t(`completion.nameCard.${variant}Guide`, {
      defaultValue: NAME_CARD_GUIDE[variant],
    }),
    reflectionPrompt: t("completion.carryFromThisPlaceholder", {
      defaultValue: "Write your reflection…",
    }),
  };
}
