import { type StorageAdapter } from '@kalpx/api-client';
import { getStoredTokens, isTokenExpired } from './tokens';

/** Returns true if a non-expired access token is present in storage. */
export async function isAuthenticated(storage: StorageAdapter): Promise<boolean> {
  const tokens = await getStoredTokens(storage);
  if (!tokens) return false;
  return !isTokenExpired(tokens.accessToken);
}
