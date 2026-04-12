/**
 * companionStateSlice — v3 Field Layer (Sanatan reasoning "companion state").
 *
 * Tracks volatility, mood, and dissonance threads for the companion. Persisted
 * to AsyncStorage so the companion's state survives app restarts.
 *
 * Persistence key: kalpx:companionState (versioned, _version: 1).
 */

import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../Networks/axios';

export const COMPANION_STATE_STORAGE_KEY = 'kalpx:companionState';
export const COMPANION_STATE_VERSION = 1;

export interface DissonanceThread {
  id: string;
  label?: string;
  strength?: number;
  first_seen_at?: number;
  [key: string]: any;
}

export interface CompanionStateSlice {
  volatility: number; // 0..1
  mood: string; // 'steady' | 'tender' | 'volatile' | etc
  dissonance_threads: DissonanceThread[];
  last_updated: number; // epoch ms
}

const initialState: CompanionStateSlice = {
  volatility: 0,
  mood: 'steady',
  dissonance_threads: [],
  last_updated: 0,
};

// ---------------------------------------------------------------------------
// Thunks
// ---------------------------------------------------------------------------

export const fetchCompanionState = createAsyncThunk(
  'companionState/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/api/mitra/companion-state/');
      return res.data;
    } catch (err: any) {
      // 404-tolerant: endpoint may not exist yet
      if (err?.response?.status === 404) {
        return null;
      }
      return rejectWithValue(err?.message ?? 'fetch companion-state failed');
    }
  },
);

export const persistCompanionState = createAsyncThunk(
  'companionState/persist',
  async (_, { getState }) => {
    const state = (getState() as any).companionState as CompanionStateSlice;
    const payload = JSON.stringify({
      _version: COMPANION_STATE_VERSION,
      data: state,
    });
    await AsyncStorage.setItem(COMPANION_STATE_STORAGE_KEY, payload);
  },
);

export const restoreCompanionState = createAsyncThunk(
  'companionState/restore',
  async () => {
    const raw = await AsyncStorage.getItem(COMPANION_STATE_STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?._version !== COMPANION_STATE_VERSION) {
        // Future: run a migration. For now, discard.
        return null;
      }
      return parsed.data as CompanionStateSlice;
    } catch {
      return null;
    }
  },
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const companionStateSlice = createSlice({
  name: 'companionState',
  initialState,
  reducers: {
    setVolatility(state, action: PayloadAction<number>) {
      state.volatility = action.payload;
      state.last_updated = Date.now();
    },
    setMood(state, action: PayloadAction<string>) {
      state.mood = action.payload;
      state.last_updated = Date.now();
    },
    upsertDissonanceThread(
      state,
      action: PayloadAction<{ id: string; patch: Partial<DissonanceThread> }>,
    ) {
      const { id, patch } = action.payload;
      const idx = state.dissonance_threads.findIndex((t) => t.id === id);
      if (idx === -1) {
        state.dissonance_threads.push({
          id,
          first_seen_at: Date.now(),
          ...patch,
        });
      } else {
        state.dissonance_threads[idx] = {
          ...state.dissonance_threads[idx],
          ...patch,
        };
      }
      state.last_updated = Date.now();
    },
    removeDissonanceThread(state, action: PayloadAction<string>) {
      state.dissonance_threads = state.dissonance_threads.filter(
        (t) => t.id !== action.payload,
      );
      state.last_updated = Date.now();
    },
    resetCompanionState() {
      return { ...initialState };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanionState.fulfilled, (state, action) => {
        const data = action.payload;
        if (!data) return;
        if (typeof data.volatility === 'number') state.volatility = data.volatility;
        if (typeof data.mood === 'string') state.mood = data.mood;
        if (Array.isArray(data.dissonance_threads)) {
          state.dissonance_threads = data.dissonance_threads;
        }
        state.last_updated = Date.now();
      })
      .addCase(restoreCompanionState.fulfilled, (state, action) => {
        if (!action.payload) return state;
        return action.payload;
      });
  },
});

export const {
  setVolatility,
  setMood,
  upsertDissonanceThread,
  removeDissonanceThread,
  resetCompanionState,
} = companionStateSlice.actions;

export default companionStateSlice.reducer;
