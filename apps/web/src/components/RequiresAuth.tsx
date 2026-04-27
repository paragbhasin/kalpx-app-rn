import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '@kalpx/auth';
import { webStorage } from '../lib/webStorage';

interface Props {
  children: React.ReactNode;
}

export function RequiresAuth({ children }: Props) {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    isAuthenticated(webStorage).then((ok) => {
      setAuthed(ok);
      setChecked(true);
    });
  }, []);

  if (!checked) return null;
  if (!authed) {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }
  return <>{children}</>;
}
