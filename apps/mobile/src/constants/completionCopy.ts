import { useTranslation } from "react-i18next";

type CompletionType =
  | "innerPath_mantra"
  | "innerPath_sankalp"
  | "innerPath_practice"
  | "rhythm_mantra"
  | "rhythm_sankalp"
  | "rhythm_practice";

export function useCompletionCopy(type: CompletionType) {
  const { t } = useTranslation();
  const base = `completion.${type}`;
  return {
    title: t(`${base}.title`),
    subtitle: t(`${base}.subtitle`),
    badgeSuccess: t(`${base}.badgeSuccess`),
    pending: t(`${base}.pending`),
    failure: t(`${base}.failure`),
    cta: t(`${base}.cta`),
    secondary: t(`${base}.secondary`),
  };
}
