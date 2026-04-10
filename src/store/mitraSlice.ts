import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../Networks/axios';

interface MitraState {
  companion: any | null;
  isLoading: boolean;
  error: string | null;
  aiReasoning: string | null;
}

const initialState: MitraState = {
  companion: null,
  isLoading: false,
  error: null,
  aiReasoning: null,
};

// Async thunk for generating companion — uses logic from mitraApi and syncs with screen store
export const generateCompanion = createAsyncThunk(
  'mitra/generateCompanion',
  async (payload: any, { dispatch, rejectWithValue }) => {
    try {
      // 1. Resolve API using localized logic (which handles metrics, tz, locale)
      const { mitraGenerateCompanion } = require('../engine/mitraApi');
      const data = await mitraGenerateCompanion(payload);

      if (data) {
        // 2. Automatically seed the screenData so dashboard renders correctly
        const { updateScreenData } = require('./screenSlice');
        dispatch(updateScreenData(data));
      }
      
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to generate companion');
    }
  }
);

const mitraSlice = createSlice({
  name: 'mitra',
  initialState,
  reducers: {
    clearMitraData: (state) => {
      state.companion = null;
      state.aiReasoning = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateCompanion.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateCompanion.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.companion = action.payload;
        state.aiReasoning = action.payload.aiReasoning || null;
      })
      .addCase(generateCompanion.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMitraData } = mitraSlice.actions;
export default mitraSlice.reducer;
