import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '@kalpx/auth';
import { webStorage } from '../lib/webStorage';
import { getUserProfile } from '../lib/userApi';

interface Props { children: React.ReactNode; }

export function RequiresStaff({ children }: Props) {
  const [status, setStatus] = useState<'loading' | 'staff' | 'not-staff' | 'not-authed'>('loading');
  const location = useLocation();

  useEffect(() => {
    async function check() {
      const authed = await isAuthenticated(webStorage);
      if (!authed) { setStatus('not-authed'); return; }
      const profile = await getUserProfile();
      const isStaff = (profile as any)?.user?.is_staff === true;
      setStatus(isStaff ? 'staff' : 'not-staff');
    }
    check();
  }, []);

  if (status === 'loading') return null;
  if (status === 'not-authed') {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }
  if (status === 'not-staff') return <Navigate to="/" replace />;
  return <>{children}</>;
}
