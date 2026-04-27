/**
 * userApi — Profile / account endpoints.
 * Endpoints confirmed from apps/mobile/src/screens/Profile/actions.ts.
 */

import { api } from './api';
import type { UserProfile } from '../types/auth';

/**
 * GET users/profile/profile_details/ — fetch current user's profile.
 * Returns null on 401 (not logged in) or network error.
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const res = await api.get('users/profile/profile_details/');
    // Backend may return { profile: { ... } } (nested) or flat { email, ... }.
    // Mobile reads res.data?.profile?.profile_name, implying nested shape is possible.
    const raw = res.data;
    return (raw?.profile ?? raw) as UserProfile;
  } catch (err: any) {
    if (err?.response?.status === 401) return null;
    console.warn('[userApi] getUserProfile failed:', err?.message);
    return null;
  }
}

/**
 * PATCH users/profile/update_profile/ — update profile fields.
 * Phase 11: read-only display; editing deferred.
 */
export async function updateUserProfile(patch: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    const res = await api.patch<UserProfile>('users/profile/update_profile/', patch);
    return res.data;
  } catch (err: any) {
    console.warn('[userApi] updateUserProfile failed:', err?.message);
    return null;
  }
}
