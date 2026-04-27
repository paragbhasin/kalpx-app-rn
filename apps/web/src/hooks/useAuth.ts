import { useEffect, useState } from 'react';
import { isAuthenticated } from '@kalpx/auth';
import { webStorage } from '../lib/webStorage';

export function useAuth() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    isAuthenticated(webStorage).then(setAuthenticated);
  }, []);

  return { authenticated, loading: authenticated === null };
}
