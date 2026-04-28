/**
 * preferencesSlice — user-level preferences (declarative).
 *
 * Duplicates two fields currently in screenData for onboarding compatibility:
 *   - voice_consent_given
 *   - guidance_mode
 *
 * Dual-write expectation: onboarding (Turn 5) writes to BOTH screenData and
 * preferencesSlice. Long-term, screenData fields become derived from
 * preferencesSlice; nothing is broken today.
 *
 * Persistence key: kalpx:preferences (versioned).
 */

import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getUserPreferences,
  patchUserPreferences,
  getNotificationPreferences,
  patchNotificationPreferences,
} from '../engine/mitraApi';

export const PREFERENCES_STORAGE_KEY = 'kalpx:preferences';
export const PREFERENCES_VERSION = 1;

export type GuidanceMode = 'universal' | 'hybrid' | 'rooted';
export type RecommendedFrequency = 'off' | 'reduced' | 'normal';
export type WhyThisLinksMode = 'visible' | 'hidden_30d' | 'hidden_always';

export interface QuietHours {
  start: string; // "22:00"
  end: string; // "07:00"
}

export interface NotificationPrefs {
  morning_presence: boolean;
  prep_heads_up: boolean;
  post_conflict_follow: boolean;
  evening_reflection: boolean;
  grief_follow: boolean;
  festival_ritucharya: boolean;
  gentle_reengagement: boolean;
}

export interface PreferencesSlice {
  // Local-only (OS accessibility)
  reduced_motion: boolean;
  // Mirrors backend /api/mitra/user-preferences/
  guidance_mode: GuidanceMode;
  recommended_frequency: RecommendedFrequency;
  why_this_links: WhyThisLinksMode;
  retreat_mode: boolean;
  post_conflict_cards: boolean;
  season_acknowledged_ritu: string | null;
  quiet_hours: QuietHours;
  // Mirrors backend /api/mitra/user-preferences/notifications/
  notifications: NotificationPrefs;
  // Legacy carry-overs (screenData dual-write)
  voice_consent_given: boolean;
  // Client-only
  season_banner_dismissed_at: number | null;
  loaded: boolean;
}

const initialState: PreferencesSlice = {
  reduced_motion: false,
  guidance_mode: 'hybrid',
  recommended_frequency: 'normal',
  why_this_links: 'visible',
  retreat_mode: false,
  post_conflict_cards: true,
  season_acknowledged_ritu: null,
  quiet_hours: { start: '22:00', end: '07:00' },
  notifications: {
    morning_presence: true,
    prep_heads_up: true,
    post_conflict_follow: true,
    evening_reflection: true,
    grief_follow: true,
    festival_ritucharya: true,
    gentle_reengagement: false,
  },
  voice_consent_given: false,
  season_banner_dismissed_at: null,
  loaded: false,
};

// ---------------------------------------------------------------------------
// Thunks
// ---------------------------------------------------------------------------

// 2026-04-19: routed through src/engine/mitraApi.ts wrappers for
// consistency + 404 tolerance. Fixes a latent axios path bug: previous
// code used "/api/mitra/user-preferences/" which axios-joined to the
// baseURL "https://dev.kalpx.com/api" produced "/api/api/mitra/..."
// double-prefixed. Wrappers use "mitra/user-preferences/" (relative).
export const fetchPreferences = createAsyncThunk(
  'preferences/fetch',
  async () => getUserPreferences(),
);

export const updatePreference = createAsyncThunk(
  'preferences/update',
  async ({ key, value }: { key: keyof PreferencesSlice; value: any }) => {
    await patchUserPreferences({ [key]: value });
    return { key, value };
  },
);

export const fetchNotificationPrefs = createAsyncThunk(
  'preferences/fetchNotifications',
  async () => {
    const data = await getNotificationPreferences();
    return (data as NotificationPrefs | null) ?? null;
  },
);

export const updateNotificationPref = createAsyncThunk(
  'preferences/updateNotification',
  async ({
    key,
    value,
  }: {
    key: keyof NotificationPrefs;
    value: boolean;
  }) => {
    await patchNotificationPreferences({ [key]: value });
    return { key, value };
  },
);

export const persistPreferences = createAsyncThunk(
  'preferences/persist',
  async (_, { getState }) => {
    const state = (getState() as any).preferences as PreferencesSlice;
    const payload = JSON.stringify({
      _version: PREFERENCES_VERSION,
      data: state,
    });
    await AsyncStorage.setItem(PREFERENCES_STORAGE_KEY, payload);
  },
);

export const restorePreferences = createAsyncThunk(
  'preferences/restore',
  async () => {
    const raw = await AsyncStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?._version !== PREFERENCES_VERSION) return null;
      return parsed.data as PreferencesSlice;
    } catch {
      return null;
    }
  },
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setPreference(
      state,
      action: PayloadAction<{ key: keyof PreferencesSlice; value: any }>,
    ) {
      const { key, value } = action.payload;
      (state as any)[key] = value;
    },
    setAllPreferences(state, action: PayloadAction<Partial<PreferencesSlice>>) {
      Object.assign(state, action.payload);
    },
    resetPreferences() {
      return { ...initialState, loaded: true };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        if (action.payload) {
          // Backend returns top-level fields; notifications sub-resource is a
          // separate endpoint. Keep client-only fields (reduced_motion,
          // season_banner_dismissed_at) intact across server sync.
          const { reduced_motion, season_banner_dismissed_at, notifications } =
            state;
          Object.assign(state, action.payload, {
            reduced_motion,
            season_banner_dismissed_at,
            notifications,
          });
        }
        state.loaded = true;
      })
      .addCase(fetchPreferences.rejected, (state) => {
        state.loaded = true;
      })
      .addCase(updatePreference.fulfilled, (state, action) => {
        const { key, value } = action.payload;
        (state as any)[key] = value;
      })
      .addCase(fetchNotificationPrefs.fulfilled, (state, action) => {
        if (action.payload) {
          state.notifications = { ...state.notifications, ...action.payload };
        }
      })
      .addCase(updateNotificationPref.fulfilled, (state, action) => {
        const { key, value } = action.payload;
        state.notifications[key] = value;
      })
      .addCase(restorePreferences.fulfilled, (state, action) => {
        if (!action.payload) {
          state.loaded = true;
          return state;
        }
        return { ...action.payload, loaded: true };
      });
  },
});

export const { setPreference, setAllPreferences, resetPreferences } =
  preferencesSlice.actions;

export default preferencesSlice.reducer;
