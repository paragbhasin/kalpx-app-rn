import { AUTH_KEYS, type StorageAdapter } from '@kalpx/api-client';
import { isTokenExpired } from './tokens';

/** Returns true if a non-expired access token is present in storage. */
export async function isAuthenticated(storage: StorageAdapter): Promise<boolean> {
  const accessToken = await storage.getItem(AUTH_KEYS.accessToken);
  if (!accessToken) return false;
  return !isTokenExpired(accessToken);
}
