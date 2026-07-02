import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { en } from '../locales/en';
import { hi } from '../locales/hi';
import { te } from '../locales/te';
import { invalidateMitraHomeV3Cache } from '../engine/mitraApi';
import { ENABLED_LOCALES, normalizeLocale } from './locale';
import { webNavigate } from './webRouter';

export type Locale = 'en' | 'hi' | 'te';

const LOCALE_STORAGE_KEY = 'kalpx_lang';

const translations: Record<Locale, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  hi: hi as Record<string, unknown>,
  te: te as Record<string, unknown>,
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
});

function detectInitialLocale(): Locale {
  try {
    // URL locale segment takes priority so bookmarked/shared /hi/ or /te/ URLs load correctly
    const urlSegment = window.location.pathname.split('/')[1];
    if ((ENABLED_LOCALES as string[]).includes(urlSegment)) {
      try { localStorage.setItem(LOCALE_STORAGE_KEY, urlSegment); } catch {}
      return urlSegment as Locale;
    }
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    const candidate = stored ?? (typeof navigator !== 'undefined' ? navigator.language?.split('-')[0] : undefined);
    const normalized = normalizeLocale(candidate);
    // Overwrite stale stored value (e.g. 'hi' stored when prod is English-only)
    if (stored !== normalized) {
      try { localStorage.setItem(LOCALE_STORAGE_KEY, normalized); } catch {}
    }
    return normalized;
  } catch {}
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectInitialLocale);

  const setLocale = useCallback((next: Locale) => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {}
    invalidateMitraHomeV3Cache();
    setLocaleState(next);
    window.dispatchEvent(new CustomEvent('kalpx:locale-changed', { detail: next }));
    // Swap the locale segment in the current URL (e.g. /en/mitra → /hi/mitra)
    const segments = window.location.pathname.split('/');
    if (segments.length >= 2 && (ENABLED_LOCALES as string[]).includes(segments[1]) && segments[1] !== next) {
      segments[1] = next;
      const newPath = segments.join('/') + window.location.search + window.location.hash;
      webNavigate(newPath, { replace: true });
    }
  }, []);

  const t = useCallback(
    (key: string): string => {
      const parts = key.split('.');
      let value: unknown = translations[locale];
      for (const part of parts) {
        if (value && typeof value === 'object') {
          value = (value as Record<string, unknown>)[part];
        } else {
          value = undefined;
          break;
        }
      }
      if (typeof value === 'string') return value;

      // Fallback to English
      let fallback: unknown = translations.en;
      for (const part of parts) {
        if (fallback && typeof fallback === 'object') {
          fallback = (fallback as Record<string, unknown>)[part];
        } else {
          return key;
        }
      }
      return typeof fallback === 'string' ? fallback : key;
    },
    [locale],
  );

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
