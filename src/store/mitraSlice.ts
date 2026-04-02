import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

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

// Async thunk for generating companion
export const generateCompanion = createAsyncThunk(
  'mitra/generateCompanion',
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await axios.post('https://dev.kalpx.com/api/mitra/generate-companion/', payload);
      return response.data;
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
