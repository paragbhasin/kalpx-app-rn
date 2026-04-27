import { useEffect } from 'react';
import { getOrCreateGuestUUID } from '@kalpx/auth';
import { webStorage } from '../lib/webStorage';

export async function ensureGuestIdentity(): Promise<string> {
  return getOrCreateGuestUUID(webStorage);
}

export function useGuestIdentity() {
  useEffect(() => {
    ensureGuestIdentity().catch(console.error);
  }, []);
}
