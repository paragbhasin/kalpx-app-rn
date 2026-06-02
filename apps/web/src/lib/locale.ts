const SUPPORTED_LOCALES = ['en', 'hi'] as const;
type SupportedLocale = typeof SUPPORTED_LOCALES[number];

export function getActiveLocale(): SupportedLocale {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language?.split('-')[0];
  return (SUPPORTED_LOCALES as readonly string[]).includes(lang ?? '')
    ? (lang as SupportedLocale)
    : 'en';
}
