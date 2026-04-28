import { describe, it, expect, beforeEach } from 'vitest';
import { AUTH_KEYS } from '@kalpx/api-client';
import { storeTokens, clearTokens, isAuthenticated } from '@kalpx/auth';
import type { StorageAdapter } from '@kalpx/api-client';

function makeMockStorage(): StorageAdapter & { _store: Record<string, string> } {
  const _store: Record<string, string> = {};
  return {
    _store,
    getItem: (key) => Promise.resolve(_store[key] ?? null),
    setItem: (key, value) => { _store[key] = value; return Promise.resolve(); },
    removeItem: (key) => { delete _store[key]; return Promise.resolve(); },
  };
}

describe('auth-storage', () => {
  let storage: ReturnType<typeof makeMockStorage>;

  beforeEach(() => {
    storage = makeMockStorage();
  });

  it('storeTokens writes access and refresh', async () => {
    await storeTokens(storage, { accessToken: 'acc123', refreshToken: 'ref456' });
    expect(await storage.getItem(AUTH_KEYS.accessToken)).toBe('acc123');
    expect(await storage.getItem(AUTH_KEYS.refreshToken)).toBe('ref456');
  });

  it('clearTokens removes access and refresh but preserves guestUUID', async () => {
    storage._store[AUTH_KEYS.accessToken] = 'acc';
    storage._store[AUTH_KEYS.refreshToken] = 'ref';
    storage._store[AUTH_KEYS.guestUUID] = 'guest-uuid-123';

    await clearTokens(storage);

    expect(await storage.getItem(AUTH_KEYS.accessToken)).toBeNull();
    expect(await storage.getItem(AUTH_KEYS.refreshToken)).toBeNull();
    expect(await storage.getItem(AUTH_KEYS.guestUUID)).toBe('guest-uuid-123');
  });

  it('isAuthenticated returns false when no token', async () => {
    expect(await isAuthenticated(storage)).toBe(false);
  });

  it('isAuthenticated returns true when access token present and not expired', async () => {
    // Build a fake JWT with a far-future exp using Buffer.from (Node base64url)
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url');
    const fakeJwt = `${header}.${payload}.fakesig`;
    storage._store[AUTH_KEYS.accessToken] = fakeJwt;
    expect(await isAuthenticated(storage)).toBe(true);
  });

  it('logout: manually clearing access+refresh preserves guestUUID', async () => {
    storage._store[AUTH_KEYS.accessToken] = 'acc';
    storage._store[AUTH_KEYS.refreshToken] = 'ref';
    storage._store[AUTH_KEYS.guestUUID] = 'keep-me';

    // Simulate what useAuth.logout does
    await storage.removeItem(AUTH_KEYS.accessToken);
    await storage.removeItem(AUTH_KEYS.refreshToken);

    expect(await storage.getItem(AUTH_KEYS.accessToken)).toBeNull();
    expect(await storage.getItem(AUTH_KEYS.refreshToken)).toBeNull();
    expect(await storage.getItem(AUTH_KEYS.guestUUID)).toBe('keep-me');
  });
});
