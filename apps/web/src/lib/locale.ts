const SUPPORTED_LOCALES = ['en', 'hi', 'te'] as const;
export type SupportedLocale = typeof SUPPORTED_LOCALES[number];

const LOCALE_STORAGE_KEY = 'kalpx_lang';

// Parse build-time env var (baked in by Vite at build time, not available at runtime).
// Prod: VITE_ENABLED_LOCALES=en  →  ENABLED_LOCALES = ['en']
// Dev:  VITE_ENABLED_LOCALES=en,hi,te  →  ENABLED_LOCALES = ['en','hi','te']
const _rawEnabled = import.meta.env.VITE_ENABLED_LOCALES ?? 'en';
export const ENABLED_LOCALES: SupportedLocale[] = (_rawEnabled as string)
  .split(',')
  .map((s: string) => s.trim())
  .filter((s: string): s is SupportedLocale =>
    (SUPPORTED_LOCALES as readonly string[]).includes(s)
  );
// Always ensure 'en' is present as the fallback
if (!ENABLED_LOCALES.includes('en')) ENABLED_LOCALES.unshift('en');

export const LANG_LABELS: Record<SupportedLocale, string> = {
  en: 'English',
  hi: 'हिंदी',
  te: 'తెలుగు',
};

/**
 * Returns the locale if it is in ENABLED_LOCALES, otherwise returns 'en'.
 * Used at app startup to silently reset any stored hi/te locale when prod
 * is English-only.
 */
export function normalizeLocale(l: string | null | undefined): SupportedLocale {
  if (l && (ENABLED_LOCALES as string[]).includes(l)) return l as SupportedLocale;
  return 'en';
}

export function getActiveLocale(): SupportedLocale {
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    const normalized = normalizeLocale(stored);
    // Overwrite stale stored value (e.g. 'hi' when prod is English-only)
    if (stored !== normalized) {
      try { localStorage.setItem(LOCALE_STORAGE_KEY, normalized); } catch {}
    }
    return normalized;
  } catch {}
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language?.split('-')[0];
  return normalizeLocale(lang);
}
