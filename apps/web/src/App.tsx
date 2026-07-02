import React, { useEffect } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AppRoutes } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SnackBar } from './components/SnackBar';
import { setWebNavigate } from './lib/webRouter';
import { AppLayout } from './components/layout/AppLayout';
import { ConsentBanner } from './components/ConsentBanner';
import { DownloadModal } from './components/DownloadModal';
import { I18nProvider, useTranslation } from './lib/i18n';
import { ENABLED_LOCALES } from './lib/locale';
import type { Locale } from './lib/i18n';

function NavigateInjector() {
  const navigate = useNavigate();
  useEffect(() => {
    setWebNavigate(navigate);
  }, [navigate]);
  return null;
}

function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname, search]);

  return null;
}

// Syncs i18n locale when the URL locale segment changes (e.g. browser back/forward
// between /en/ and /hi/ — I18nProvider is outside BrowserRouter so it can't use
// useLocation directly; this bridge component lives inside BrowserRouter).
//
// Uses window.location.pathname (browser-synchronous) instead of React Router's
// pathname because BrowserRouter has v7_startTransition:true which defers the
// React Router state update — so useLocation() can briefly lag behind the real URL.
// Similarly compares against localStorage (updated synchronously by setLocale)
// rather than the React locale state, which also lags. This prevents LocaleSync
// from seeing a stale /en pathname after setLocale('hi') fires and calling
// setLocale('en') before the transition commits, which would revert the locale
// and cause a double API call.
function LocaleSync() {
  const { pathname } = useLocation();
  const { setLocale } = useTranslation();
  useEffect(() => {
    const segment = window.location.pathname.split('/')[1];
    if (!(ENABLED_LOCALES as string[]).includes(segment)) return;
    const stored = localStorage.getItem('kalpx_lang') ?? 'en';
    if (segment !== stored) {
      setLocale(segment as Locale);
    }
  }, [pathname, setLocale]);
  return null;
}

export function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <Provider store={store}>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <NavigateInjector />
            <ScrollToTop />
            <LocaleSync />
            <AppLayout>
              <AppRoutes />
            </AppLayout>
            <SnackBar />
            <ConsentBanner />
            <DownloadModal />
          </BrowserRouter>
        </Provider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
