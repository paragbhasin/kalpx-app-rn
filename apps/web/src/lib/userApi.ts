/**
 * userApi — Profile / account endpoints.
 * Endpoints confirmed from apps/mobile/src/screens/Profile/actions.ts.
 */

import { api } from './api';
import type { UserProfile } from '../types/auth';

export type ProfileOptionItem = {
  id: number;
  name: string;
};

export type UserProfileOptions = {
  age_groups?: ProfileOptionItem[];
  categories?: ProfileOptionItem[];
  languages?: ProfileOptionItem[];
  [key: string]: unknown;
};

export type SavedReflection = {
  memory_id: string;
  room_id: string;
  event_type: string;
  text: string;
  action_label: string;
  source_surface: string;
  life_context: string;
  journey_id: number | null;
  day_number: number | null;
  captured_at: string | null;
  user_deletable: boolean;
};

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
    if (import.meta.env.DEV) {
      console.log('[userApi] profile_details raw shape:', JSON.stringify(raw)?.slice(0, 300));
    }
    return (raw?.profile ?? raw) as UserProfile;
  } catch (err: any) {
    if (err?.response?.status === 401) return null;
    console.warn('[userApi] getUserProfile failed:', err?.message);
    return null;
  }
}

/**
 * GET users/profile/profile_options/ — fetch profile dropdown options.
 */
export async function getUserProfileOptions(): Promise<UserProfileOptions | null> {
  try {
    const res = await api.get('users/profile/profile_options/');
    return (res.data?.data ?? res.data ?? {}) as UserProfileOptions;
  } catch (err: any) {
    if (err?.response?.status === 401) return null;
    console.warn('[userApi] getUserProfileOptions failed:', err?.message);
    return null;
  }
}

export async function getSavedReflections(): Promise<SavedReflection[]> {
  try {
    const res = await api.get('mitra/rooms/memory/');
    return (res.data?.memories ?? []) as SavedReflection[];
  } catch (err: any) {
    console.warn('[userApi] getSavedReflections failed:', err?.message);
    throw err;
  }
}

export async function deleteSavedReflection(memoryId: string): Promise<void> {
  await api.delete(`mitra/rooms/memory/${memoryId}/`);
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
