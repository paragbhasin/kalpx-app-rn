import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '@kalpx/auth';
import { webStorage } from '../lib/webStorage';

interface Props { children: React.ReactNode; }

export function RequiresFounder({ children }: Props) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'not-founder' | 'not-authed'>('loading');
  const location = useLocation();

  useEffect(() => {
    async function check() {
      const authed = await isAuthenticated(webStorage);
      if (!authed) { setStatus('not-authed'); return; }
      const isFounder = localStorage.getItem('kalpx:founder_session') === '1';
      setStatus(isFounder ? 'ok' : 'not-founder');
    }
    check();
  }, []);

  if (status === 'loading') return null;
  if (status === 'not-authed') {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/ops-login?returnTo=${returnTo}`} replace />;
  }
  if (status === 'not-founder') return <Navigate to="/" replace />;
  return <>{children}</>;
}
