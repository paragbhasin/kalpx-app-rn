/**
 * Phase 11.5 guardrail — profile response normalization.
 * GET users/profile/profile_details/ may return flat or nested { profile: {...} }.
 * getUserProfile() must normalize both.
 */

import { describe, it, expect, vi } from 'vitest';

vi.mock('../lib/api', () => ({
  api: { get: vi.fn() },
}));

import { getUserProfile } from '../lib/userApi';
import { api } from '../lib/api';

describe('getUserProfile — response shape normalization', () => {
  it('returns flat data when backend returns { email, first_name, ... }', async () => {
    (api.get as any).mockResolvedValueOnce({
      data: { id: 1, email: 'u@test.com', first_name: 'Jane', profile_name: 'Jane' },
    });
    const profile = await getUserProfile();
    expect(profile?.email).toBe('u@test.com');
    expect(profile?.first_name).toBe('Jane');
  });

  it('returns unwrapped data when backend returns { profile: { email, ... } }', async () => {
    (api.get as any).mockResolvedValueOnce({
      data: { profile: { id: 2, email: 'v@test.com', profile_name: 'Vik', first_name: 'Vik' } },
    });
    const profile = await getUserProfile();
    expect(profile?.email).toBe('v@test.com');
    expect(profile?.first_name).toBe('Vik');
  });

  it('returns null on 401', async () => {
    (api.get as any).mockRejectedValueOnce({ response: { status: 401 } });
    const profile = await getUserProfile();
    expect(profile).toBeNull();
  });

  it('returns null on network error', async () => {
    (api.get as any).mockRejectedValueOnce(new Error('network'));
    const profile = await getUserProfile();
    expect(profile).toBeNull();
  });
});
