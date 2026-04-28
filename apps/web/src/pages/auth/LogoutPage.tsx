import React, { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

export function LogoutPage() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a0a0a',
        color: '#888',
      }}
    >
      Clearing your session…
    </div>
  );
}
