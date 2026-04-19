import { createSlice } from '@reduxjs/toolkit';

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
});

export const { clearMitraData } = mitraSlice.actions;
export default mitraSlice.reducer;
