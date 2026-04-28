import { createSlice } from '@reduxjs/toolkit';

export interface MitraState {
  companion: any | null;
  isLoading: boolean;
  error: string | null;
  aiReasoning: string | null;
  completionVersion: number;
}

const initialState: MitraState = {
  companion: null,
  isLoading: false,
  error: null,
  aiReasoning: null,
  completionVersion: 0,
};

const mitraSlice = createSlice({
  name: 'mitra',
  initialState,
  reducers: {
    clearMitraData: (state) => {
      state.companion = null;
      state.aiReasoning = null;
      state.error = null;
    },
    recordCoreCompletion: (state) => {
      state.completionVersion += 1;
    },
  },
});

export const { clearMitraData, recordCoreCompletion } = mitraSlice.actions;
export default mitraSlice.reducer;
