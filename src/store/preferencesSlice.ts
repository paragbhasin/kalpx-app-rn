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
import api from '../Networks/axios';

export const PREFERENCES_STORAGE_KEY = 'kalpx:preferences';
export const PREFERENCES_VERSION = 1;

export type GuidanceMode = 'universal' | 'hybrid' | 'rooted';

export interface PreferencesSlice {
  notifications_enabled: boolean;
  reduced_motion: boolean;
  guidance_mode: GuidanceMode;
  voice_consent_given: boolean;
  season_banner_dismissed_at: number | null;
  loaded: boolean;
}

const initialState: PreferencesSlice = {
  notifications_enabled: true,
  reduced_motion: false,
  guidance_mode: 'hybrid',
  voice_consent_given: false,
  season_banner_dismissed_at: null,
  loaded: false,
};

// ---------------------------------------------------------------------------
// Thunks
// ---------------------------------------------------------------------------

export const fetchPreferences = createAsyncThunk(
  'preferences/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/api/mitra/user-preferences/');
      return res.data;
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      return rejectWithValue(err?.message ?? 'fetch preferences failed');
    }
  },
);

export const updatePreference = createAsyncThunk(
  'preferences/update',
  async (
    { key, value }: { key: keyof PreferencesSlice; value: any },
    { rejectWithValue },
  ) => {
    try {
      await api.patch('/api/mitra/user-preferences/', { [key]: value });
    } catch (err: any) {
      if (err?.response?.status !== 404) {
        return rejectWithValue(err?.message ?? 'update preference failed');
      }
    }
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
          Object.assign(state, action.payload);
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
