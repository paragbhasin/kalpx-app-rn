import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { useMemo } from 'react';
import type { RootState, AppDispatch } from './index';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HistoryEntry {
  containerId: string;
  stateId: string;
}

interface ScreenState {
  currentContainerId: string;
  currentStateId: string;
  currentScreen: any | null;
  currentBackground: any | null;
  isHeaderHidden: boolean;
  history: HistoryEntry[];
  screenData: Record<string, any>;
  currentOverlayData: any | null;
  _flow_instance_id: string | null;
  _flow_type: string | null;
  _isSubmitting: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'kalpx_journey_state';

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const initialState: ScreenState = {
  currentContainerId: 'portal',
  currentStateId: 'portal',
  currentScreen: null,
  currentBackground: null,
  isHeaderHidden: false,
  history: [],
  screenData: {},
  currentOverlayData: null,
  _flow_instance_id: null,
  _flow_type: null,
  _isSubmitting: false,
};

// ---------------------------------------------------------------------------
// Async thunks
// ---------------------------------------------------------------------------

export const persistState = createAsyncThunk(
  'screen/persistState',
  async (_, { getState }) => {
    const { screen } = getState() as { screen: ScreenState };
    const payload = JSON.stringify(screen.screenData);
    await AsyncStorage.setItem(STORAGE_KEY, payload);
  },
);

export const restoreState = createAsyncThunk(
  'screen/restoreState',
  async (_, { rejectWithValue }) => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as Record<string, any>;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to restore state');
    }
  },
);

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

const screenSlice = createSlice({
  name: 'screen',
  initialState,
  reducers: {
    loadScreen(state, action: PayloadAction<{ containerId: string; stateId: string }>) {
      const { containerId, stateId } = action.payload;
      if (state.currentContainerId && state.currentStateId) {
        state.history.push({
          containerId: state.currentContainerId,
          stateId: state.currentStateId,
        });
      }
      state.currentContainerId = containerId;
      state.currentStateId = stateId;
    },

    goBack(state) {
      if (state.history.length === 0) return;
      const previous = state.history[state.history.length - 1];
      state.history = state.history.slice(0, -1);
      state.currentContainerId = previous.containerId;
      state.currentStateId = previous.stateId;
    },

    setScreenValue(state, action: PayloadAction<{ key: string; value: any }>) {
      state.screenData[action.payload.key] = action.payload.value;
    },

    updateScreenData(state, action: PayloadAction<Record<string, any>>) {
      Object.assign(state.screenData, action.payload);
    },

    setBackground(state, action: PayloadAction<any>) {
      state.currentBackground = action.payload;
    },

    setHeaderHidden(state, action: PayloadAction<boolean>) {
      state.isHeaderHidden = action.payload;
    },

    setOverlayData(state, action: PayloadAction<any>) {
      state.currentOverlayData = action.payload;
    },

    setCurrentScreen(state, action: PayloadAction<any>) {
      state.currentScreen = action.payload;
    },

    startFlowInstance(state, action: PayloadAction<string>) {
      const flowType = action.payload;
      state._flow_instance_id = `${flowType}_${Date.now()}`;
      state._flow_type = flowType;
    },

    endFlowInstance(state) {
      state._flow_instance_id = null;
      state._flow_type = null;
    },

    setSubmitting(state, action: PayloadAction<boolean>) {
      state._isSubmitting = action.payload;
    },

    resetState() {
      return { ...initialState };
    },
  },

  extraReducers: (builder) => {
    builder.addCase(restoreState.fulfilled, (state, action) => {
      if (action.payload) {
        state.screenData = action.payload;
      }
    });
  },
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export const screenActions = screenSlice.actions;

export const {
  loadScreen,
  goBack,
  setScreenValue,
  updateScreenData,
  setBackground,
  setHeaderHidden,
  setOverlayData,
  setCurrentScreen,
  startFlowInstance,
  endFlowInstance,
  setSubmitting,
  resetState,
} = screenSlice.actions;

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

export const useScreenActions = () => {
  const dispatch = useDispatch<AppDispatch>();

  return useMemo(
    () => ({
      loadScreen: (containerId: string, stateId: string) =>
        dispatch(screenActions.loadScreen({ containerId, stateId })),
      goBack: () => dispatch(screenActions.goBack()),
      setScreenValue: (key: string, value: any) =>
        dispatch(screenActions.setScreenValue({ key, value })),
      updateScreenData: (data: Record<string, any>) =>
        dispatch(screenActions.updateScreenData(data)),
      setBackground: (bg: any) => dispatch(screenActions.setBackground(bg)),
      setHeaderHidden: (hidden: boolean) =>
        dispatch(screenActions.setHeaderHidden(hidden)),
      setOverlayData: (data: any) =>
        dispatch(screenActions.setOverlayData(data)),
      setCurrentScreen: (screen: any) =>
        dispatch(screenActions.setCurrentScreen(screen)),
      startFlowInstance: (flowType: string) =>
        dispatch(screenActions.startFlowInstance(flowType)),
      endFlowInstance: () => dispatch(screenActions.endFlowInstance()),
      setSubmitting: (flag: boolean) =>
        dispatch(screenActions.setSubmitting(flag)),
      resetState: () => dispatch(screenActions.resetState()),
      persistState: () => dispatch(persistState()),
      restoreState: () => dispatch(restoreState()),
    }),
    [dispatch],
  );
};

export const useScreenState = () =>
  useSelector((state: RootState) => state.screen);

export default screenSlice.reducer;
