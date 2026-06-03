const SUPPORTED_LOCALES = ['en', 'hi'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

const LOCALE_STORAGE_KEY = 'kalpx_lang';

export function getActiveLocale(): SupportedLocale {
  // Check localStorage first (user's explicit choice)
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'en' || stored === 'hi') return stored;
  } catch {}
  // Fall back to browser language
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language?.split('-')[0];
  return (SUPPORTED_LOCALES as readonly string[]).includes(lang ?? '')
    ? (lang as SupportedLocale)
    : 'en';
}
