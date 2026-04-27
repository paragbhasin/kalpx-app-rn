import { AUTH_KEYS, type StorageAdapter } from '@kalpx/api-client';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export async function getStoredTokens(storage: StorageAdapter): Promise<Tokens | null> {
  const accessToken = await storage.getItem(AUTH_KEYS.accessToken);
  const refreshToken = await storage.getItem(AUTH_KEYS.refreshToken);
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export async function storeTokens(storage: StorageAdapter, tokens: Tokens): Promise<void> {
  await storage.setItem(AUTH_KEYS.accessToken, tokens.accessToken);
  await storage.setItem(AUTH_KEYS.refreshToken, tokens.refreshToken);
}

export async function clearTokens(storage: StorageAdapter): Promise<void> {
  await storage.removeItem(AUTH_KEYS.accessToken);
  await storage.removeItem(AUTH_KEYS.refreshToken);
}

/**
 * Decodes the JWT exp claim and returns true if the token has expired.
 * Returns true on any parse error (treat malformed tokens as expired).
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payloadB64 = token.split('.')[1];
    if (!payloadB64) return true;
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'))) as { exp?: number };
    if (typeof payload.exp !== 'number') return true;
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
