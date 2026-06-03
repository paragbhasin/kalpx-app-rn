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
import { I18nProvider } from './lib/i18n';

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

export function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <Provider store={store}>
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <NavigateInjector />
            <ScrollToTop />
            <AppLayout>
              <AppRoutes />
            </AppLayout>
            <SnackBar />
            <ConsentBanner />
          </BrowserRouter>
        </Provider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
