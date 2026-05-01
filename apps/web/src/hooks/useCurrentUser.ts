import { useState, useEffect, useCallback } from 'react';
import { AUTH_KEYS } from '@kalpx/api-client';
import { isAuthenticated } from '@kalpx/auth';
import { webStorage } from '../lib/webStorage';

export interface CurrentUser {
  authed: boolean;
  userInitial: string;
}

function readStoredAccessToken(): string | null {
  try {
    return (
      localStorage.getItem(AUTH_KEYS.accessToken) ||
      localStorage.getItem('access_token')
    );
  } catch {
    return null;
  }
}

function decodeJwtInitial(token: string): string {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(b64));
    const name: string = payload.first_name || payload.email || '';
    return name[0]?.toUpperCase() ?? 'U';
  } catch {
    return 'U';
  }
}

export function useCurrentUser(): CurrentUser & { refresh: () => void } {
  const [state, setState] = useState<CurrentUser>(() => {
    const token = readStoredAccessToken();
    return token
      ? { authed: true, userInitial: decodeJwtInitial(token) }
      : { authed: false, userInitial: 'U' };
  });

  const syncState = useCallback((next: CurrentUser) => {
    setState((prev) =>
      prev.authed === next.authed && prev.userInitial === next.userInitial
        ? prev
        : next,
    );
  }, []);

  const check = useCallback(async () => {
    const ok = await isAuthenticated(webStorage);
    if (!ok) {
      syncState({ authed: false, userInitial: 'U' });
      return;
    }
    const token = readStoredAccessToken();
    const userInitial = token ? decodeJwtInitial(token) : 'U';
    syncState({ authed: true, userInitial });
  }, [syncState]);

  useEffect(() => { void check(); }, [check]);

  return { ...state, refresh: check };
}
