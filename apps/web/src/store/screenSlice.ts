import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { useDispatch, useSelector } from 'react-redux';
import { useMemo } from 'react';
import type { RootState, AppDispatch } from './index';
import { getScreen } from '../engine/screenResolver';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HistoryEntry {
  containerId: string;
  stateId: string;
}

export interface ScreenState {
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

export type RunnerVariant = 'mantra' | 'sankalp' | 'practice';
export type RunnerSource =
  | 'core'
  | 'additional_recommended'
  | 'additional_library'
  | 'additional_custom'
  | 'support_trigger'
  | 'support_checkin'
  | 'support_grief'
  | 'support_loneliness'
  | 'support_joy'
  | 'support_growth';

export type CheckinStep = 'notice' | 'name' | 'settle';
export type EveningReflectionDraft = { chip: string | null; text: string };
export type WeeklyReflectionDraft = { held: string; took: string; tending: string };
export type ResilienceNarrative = {
  headline?: string;
  carried_summary?: string;
  ongoing_thread_ack?: string;
  closing_beat?: string;
} | null;

export type OnboardingDraftState = {
  friction_id?: string;
  friction_freeform?: string;
  suggested_focus?: string;
  state_id?: string;
  state_freeform?: string;
  mode?: 'universal' | 'hybrid' | 'rooted';
  voice_choice?: 'voice' | 'text';
  started_at?: number;
};

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
// Async thunks — localStorage instead of AsyncStorage
// ---------------------------------------------------------------------------

export const persistState = createAsyncThunk(
  'screen/persistState',
  async (_, { getState }) => {
    const { screen } = getState() as { screen: ScreenState };
    const payload = JSON.stringify(screen.screenData);
    localStorage.setItem(STORAGE_KEY, payload);
  },
);

export const restoreState = createAsyncThunk(
  'screen/restoreState',
  async (_, { rejectWithValue }) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as Record<string, any>;
    } catch (err: any) {
      return rejectWithValue(err?.message ?? 'Failed to restore state');
    }
  },
);

export const loadScreenWithData = createAsyncThunk(
  'screen/loadScreenWithData',
  async (
    { containerId, stateId }: { containerId: string; stateId: string },
    { dispatch },
  ) => {
    const screenSchema = await getScreen(containerId, stateId);
    if (screenSchema) {
      dispatch({
        type: 'screen/loadScreenWithSchema',
        payload: { containerId, stateId, schema: screenSchema },
      });
    } else {
      dispatch({ type: 'screen/loadScreen', payload: { containerId, stateId } });
      console.warn(`[SCREEN_SLICE] No schema found for ${containerId}/${stateId}`);
    }
    return screenSchema;
  },
);

export const goBackWithData = createAsyncThunk(
  'screen/goBackWithData',
  async (_, { getState, dispatch }) => {
    const { screen } = getState() as { screen: ScreenState };
    if (screen.history.length === 0) return null;

    const previous = screen.history[screen.history.length - 1];
    const screenSchema = await getScreen(previous.containerId, previous.stateId);

    if (screenSchema) {
      dispatch({
        type: 'screen/goBackWithSchema',
        payload: { schema: screenSchema },
      });
    } else {
      dispatch({ type: 'screen/goBack' });
      console.warn(
        `[SCREEN_SLICE] No schema found for back target ${previous.containerId}/${previous.stateId}`,
      );
    }

    return screenSchema;
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
        state.history.push({ containerId: state.currentContainerId, stateId: state.currentStateId });
      }
      state.currentContainerId = containerId;
      state.currentStateId = stateId;
      state.currentScreen = null;
    },
    loadScreenWithSchema(
      state,
      action: PayloadAction<{ containerId: string; stateId: string; schema: any }>,
    ) {
      const { containerId, stateId, schema } = action.payload;
      if (state.currentContainerId && state.currentStateId) {
        state.history.push({ containerId: state.currentContainerId, stateId: state.currentStateId });
      }
      state.currentContainerId = containerId;
      state.currentStateId = stateId;
      state.currentScreen = schema;
    },
    goBack(state) {
      if (state.history.length === 0) return;
      const previous = state.history[state.history.length - 1];
      state.history = state.history.slice(0, -1);
      state.currentContainerId = previous.containerId;
      state.currentStateId = previous.stateId;
      state.currentScreen = null;
    },
    goBackWithSchema(state, action: PayloadAction<{ schema: any }>) {
      if (state.history.length === 0) return;
      const previous = state.history[state.history.length - 1];
      state.history = state.history.slice(0, -1);
      state.currentContainerId = previous.containerId;
      state.currentStateId = previous.stateId;
      state.currentScreen = action.payload.schema;
    },
    setScreenValue(state, action: PayloadAction<{ key: string; value: any }>) {
      state.screenData[action.payload.key] = action.payload.value;
    },
    updateScreenData(state, action: PayloadAction<Record<string, any>>) {
      Object.assign(state.screenData, action.payload);
    },
    setBackground(state, action: PayloadAction<any>) {
      if (state.currentBackground === action.payload) return;
      state.currentBackground = action.payload;
    },
    setHeaderHidden(state, action: PayloadAction<boolean>) {
      if (state.isHeaderHidden === action.payload) return;
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
      setHeaderHidden: (hidden: boolean) => dispatch(screenActions.setHeaderHidden(hidden)),
      setOverlayData: (data: any) => dispatch(screenActions.setOverlayData(data)),
      setCurrentScreen: (screen: any) => dispatch(screenActions.setCurrentScreen(screen)),
      startFlowInstance: (flowType: string) => dispatch(screenActions.startFlowInstance(flowType)),
      endFlowInstance: () => dispatch(screenActions.endFlowInstance()),
      setSubmitting: (flag: boolean) => dispatch(screenActions.setSubmitting(flag)),
      resetState: () => dispatch(screenActions.resetState()),
      loadScreenWithData: (containerId: string, stateId: string) =>
        dispatch(loadScreenWithData({ containerId, stateId })),
      persistState: () => dispatch(persistState()),
      restoreState: () => dispatch(restoreState()),
    }),
    [dispatch],
  );
};

export const useScreenState = () => useSelector((state: RootState) => state.screen);

export default screenSlice.reducer;
