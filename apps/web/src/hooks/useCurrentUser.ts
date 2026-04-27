import { useState, useEffect, useCallback } from 'react';
import { isAuthenticated } from '@kalpx/auth';
import { webStorage } from '../lib/webStorage';

export interface CurrentUser {
  authed: boolean;
  userInitial: string;
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
  const [state, setState] = useState<CurrentUser>({ authed: false, userInitial: 'U' });

  const check = useCallback(async () => {
    const ok = await isAuthenticated(webStorage);
    if (!ok) {
      setState({ authed: false, userInitial: 'U' });
      return;
    }
    const token = localStorage.getItem('access_token');
    const userInitial = token ? decodeJwtInitial(token) : 'U';
    setState({ authed: true, userInitial });
  }, []);

  useEffect(() => { void check(); }, [check]);

  return { ...state, refresh: check };
}
