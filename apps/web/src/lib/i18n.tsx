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
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored === 'en' || stored === 'hi' || stored === 'te') return stored;
  } catch {}
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language?.split('-')[0];
    if (lang === 'hi') return 'hi';
    if (lang === 'te') return 'te';
  }
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(detectInitialLocale);

  const setLocale = useCallback((next: Locale) => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, next);
    } catch {}
    // Bust the home cache so the next page load fetches in the new language
    invalidateMitraHomeV3Cache();
    setLocaleState(next);
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
