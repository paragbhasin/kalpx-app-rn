import React, { useEffect } from 'react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AppRoutes } from './routes';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SnackBar } from './components/SnackBar';
import { setWebNavigate } from './lib/webRouter';
import { AppLayout } from './components/layout/AppLayout';

function NavigateInjector() {
  const navigate = useNavigate();
  useEffect(() => {
    setWebNavigate(navigate);
  }, [navigate]);
  return null;
}

export function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <BrowserRouter>
          <NavigateInjector />
          <AppLayout>
            <AppRoutes />
          </AppLayout>
          <SnackBar />
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  );
}
