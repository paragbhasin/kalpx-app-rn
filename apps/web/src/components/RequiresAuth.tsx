import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '@kalpx/auth';
import { webStorage } from '../lib/webStorage';

interface Props {
  children: React.ReactNode;
}

export function RequiresAuth({ children }: Props) {
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    isAuthenticated(webStorage).then((ok) => {
      setAuthed(ok);
      setChecked(true);
    });
  }, []);

  if (!checked) return null;
  if (!authed) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
