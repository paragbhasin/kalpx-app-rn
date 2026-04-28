/**
 * Phase 11 — useAuth unit tests.
 * Tests the auth hook logic without rendering React components.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AUTH_KEYS } from '@kalpx/api-client';

// ── Mocks — factories must be self-contained (vi.mock is hoisted) ─────────────

// useCallback needs a React context when called outside a component.
// Mock it to be transparent so we can test the hook logic directly.
vi.mock('react', async () => {
  const actual = await vi.importActual<typeof import('react')>('react');
  return { ...actual, useCallback: (fn: any) => fn };
});

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('react-redux', () => ({
  useDispatch: () => vi.fn(),
}));

vi.mock('../lib/webStorage', () => {
  const store: Record<string, string> = {};
  return {
    webStorage: {
      _store: store,
      getItem: (k: string) => Promise.resolve(store[k] ?? null),
      setItem: (k: string, v: string) => { store[k] = v; return Promise.resolve(); },
      removeItem: (k: string) => { delete store[k]; return Promise.resolve(); },
    },
  };
});

vi.mock('../lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock('../hooks/useJourneyStatus', () => ({
  invalidateJourneyStatusCache: vi.fn(),
}));

vi.mock('../store', () => ({
  store: { dispatch: vi.fn() },
  resetStore: vi.fn().mockReturnValue({ type: 'store/reset' }),
}));

vi.mock('../store/snackBarSlice', () => ({
  showSnackBar: vi.fn().mockReturnValue({ type: 'snackBar/show' }),
}));

vi.mock('../store/hooks', () => ({
  useAppDispatch: () => vi.fn(),
}));

vi.mock('../engine/mitraApi', () => ({
  claimGuestJourney: vi.fn().mockResolvedValue(null),
}));

// Import AFTER mocks
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { webStorage } from '../lib/webStorage';
import { invalidateJourneyStatusCache } from '../hooks/useJourneyStatus';
import { store, resetStore } from '../store';
import * as mitraApi from '../engine/mitraApi';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStorage() {
  return (webStorage as any)._store as Record<string, string>;
}

function clearStorage() {
  const s = getStorage();
  Object.keys(s).forEach(k => delete s[k]);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('login — token storage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearStorage();
  });

  it('calls POST users/login/ with email and password', async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { access_token: 'acc', refresh_token: 'ref' },
    });
    const { login } = useAuth();
    await login('user@test.com', 'pass123');
    expect(api.post).toHaveBeenCalledWith('users/login/', { email: 'user@test.com', password: 'pass123' });
  });

  it('stores access and refresh tokens on success', async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { access_token: 'myaccess', refresh_token: 'myrefresh' },
    });
    const { login } = useAuth();
    await login('user@test.com', 'pass123');
    const s = getStorage();
    expect(s[AUTH_KEYS.accessToken]).toBe('myaccess');
    expect(s[AUTH_KEYS.refreshToken]).toBe('myrefresh');
  });

  it('accepts alternate access/refresh field names', async () => {
    (api.post as any).mockResolvedValueOnce({
      data: { access: 'alt_access', refresh: 'alt_refresh' },
    });
    const { login } = useAuth();
    await login('user@test.com', 'pass123');
    const s = getStorage();
    expect(s[AUTH_KEYS.accessToken]).toBe('alt_access');
    expect(s[AUTH_KEYS.refreshToken]).toBe('alt_refresh');
  });

  it('returns success: false when tokens missing in response', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { message: 'ok but no tokens' } });
    const { login } = useAuth();
    const result = await login('user@test.com', 'pass123');
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/tokens were missing/i);
  });

  it('returns success: false on API error', async () => {
    (api.post as any).mockRejectedValueOnce(new Error('network error'));
    const { login } = useAuth();
    const result = await login('x@y.com', 'p');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe('login — guest journey claim', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearStorage();
  });

  it('calls claimGuestJourney after successful login', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { access_token: 'a', refresh_token: 'r' } });
    const { login } = useAuth();
    await login('user@test.com', 'pass');
    expect(mitraApi.claimGuestJourney).toHaveBeenCalled();
  });

  it('does NOT abort login if claimGuestJourney throws', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { access_token: 'a', refresh_token: 'r' } });
    (mitraApi.claimGuestJourney as any).mockRejectedValueOnce(new Error('claim failed'));
    const { login } = useAuth();
    const result = await login('user@test.com', 'pass');
    expect(result.success).toBe(true);
  });

  it('invalidates journey status cache after successful login', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { access_token: 'a', refresh_token: 'r' } });
    const { login } = useAuth();
    await login('user@test.com', 'pass');
    expect(invalidateJourneyStatusCache).toHaveBeenCalled();
  });
});

describe('logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearStorage();
    const s = getStorage();
    s[AUTH_KEYS.accessToken] = 'existing_token';
    s[AUTH_KEYS.refreshToken] = 'existing_refresh';
    s[AUTH_KEYS.guestUUID] = 'guest-abc-123';
  });

  it('clears access and refresh tokens', async () => {
    const { logout } = useAuth();
    await logout();
    const s = getStorage();
    expect(s[AUTH_KEYS.accessToken]).toBeUndefined();
    expect(s[AUTH_KEYS.refreshToken]).toBeUndefined();
  });

  it('preserves guestUUID after logout', async () => {
    const { logout } = useAuth();
    await logout();
    const s = getStorage();
    expect(s[AUTH_KEYS.guestUUID]).toBe('guest-abc-123');
  });

  it('dispatches resetStore to clear Redux state', async () => {
    const { logout } = useAuth();
    await logout();
    expect(store.dispatch).toHaveBeenCalledWith(resetStore());
  });

  it('invalidates journey status cache', async () => {
    const { logout } = useAuth();
    await logout();
    expect(invalidateJourneyStatusCache).toHaveBeenCalled();
  });
});

describe('resetPassword', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls POST users/reset_password/ with email, otp, new_password', async () => {
    (api.post as any).mockResolvedValueOnce({ data: {} });
    const { resetPassword } = useAuth();
    await resetPassword('u@test.com', '123456', 'newpass99');
    expect(api.post).toHaveBeenCalledWith(
      'users/reset_password/',
      expect.objectContaining({ email: 'u@test.com', otp: '123456', new_password: 'newpass99' }),
    );
  });

  it('returns success: true on success', async () => {
    (api.post as any).mockResolvedValueOnce({ data: {} });
    const { resetPassword } = useAuth();
    const result = await resetPassword('u@test.com', '000000', 'pass1234');
    expect(result.success).toBe(true);
  });

  it('returns success: false on API failure', async () => {
    (api.post as any).mockRejectedValueOnce({ response: { data: { detail: 'Invalid OTP.' } } });
    const { resetPassword } = useAuth();
    const result = await resetPassword('u@test.com', 'bad_otp', 'pass1234');
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  });
});

describe('forgotPassword', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls POST users/reset_password/ with just email', async () => {
    (api.post as any).mockResolvedValueOnce({ data: {} });
    const { forgotPassword } = useAuth();
    await forgotPassword('u@test.com');
    expect(api.post).toHaveBeenCalledWith('users/reset_password/', { email: 'u@test.com' });
  });

  it('returns success: true on successful call', async () => {
    (api.post as any).mockResolvedValueOnce({ data: {} });
    const { forgotPassword } = useAuth();
    const result = await forgotPassword('u@test.com');
    expect(result.success).toBe(true);
  });
});
