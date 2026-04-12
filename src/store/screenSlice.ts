import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

// Week 1 — Welcome Onboarding (Mitra v3 Moments 1-7)
// These fields live inside screenData at runtime but are documented here for
// discoverability. Spec: route_welcome_onboarding.md §2, §4.
// - onboarding_turn: number 1-7, current turn in conversation thread
// - onboarding_draft_state: accumulated payload (friction, state, freeform, etc.)
// - voice_consent_given: boolean, gates Turn 4 "Speak to me"
// - guidance_mode: 'universal' | 'hybrid' | 'rooted'
// - companion_mantra_id / companion_sankalp_id / companion_practice_id: set from
//   generate-companion response between Turn 5 and Turn 6.
// Week 3 — Practice Runners (Mitra v3 Moments 17, 18, 19, 32)
// These fields live inside screenData at runtime. Spec:
// route_practice_mantra_runner.md, route_practice_sankalp_hold.md,
// route_practice_timer.md, transient_completion_return.md.
//
// - runner_variant: 'mantra' | 'sankalp' | 'practice' — selects which runner
//   block to render inside PracticeRunnerContainer's v3 immersive chrome, and
//   which message to show in the completion_return transient.
// - runner_source: 'core' | 'additional_recommended' | 'additional_library' |
//   'additional_custom' | 'support_trigger' | 'support_checkin' — must be
//   explicitly set by the entry action (start_runner). Never inferred.
//   Used by track_completion to log the correct `source` (REG-015 guard).
// - runner_active_item: { item_type, item_id, title } — the master mantra /
//   sankalp / practice being run.
// - runner_start_time: number (ms epoch), set by start_runner.
// - runner_reps_completed: number — mirror of the MantraRunnerDisplay count.
// - runner_step_index: number — current step for PracticeTimerBlock.
// - runner_duration_actual_sec: number — elapsed seconds; used by
//   track_completion meta.actual_seconds and by SankalpHoldBlock for hold
//   duration.
// - All runner_* fields are cleared by track_completion and by the
//   CompletionReturnTransient on unmount (REG-003: cross-flow isolation).
export type RunnerVariant = 'mantra' | 'sankalp' | 'practice';
export type RunnerSource =
  | 'core'
  | 'additional_recommended'
  | 'additional_library'
  | 'additional_custom'
  | 'support_trigger'
  | 'support_checkin';

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

/**
 * Load a screen by containerId + stateId and resolve its schema from the
 * screen resolver (API first, local allContainers.js fallback).
 */
export const loadScreenWithData = createAsyncThunk(
  'screen/loadScreenWithData',
  async (
    { containerId, stateId }: { containerId: string; stateId: string },
    { dispatch },
  ) => {
    // 1. Update navigation state immediately (uses the action creator exported below)
    dispatch({ type: 'screen/loadScreen', payload: { containerId, stateId } });

    // 2. Resolve the screen schema
    const screenSchema = await getScreen(containerId, stateId);
    if (screenSchema) {
      dispatch({ type: 'screen/setCurrentScreen', payload: screenSchema });
    } else {
      console.warn(
        `[SCREEN_SLICE] No schema found for ${containerId}/${stateId}`,
      );
    }

    return screenSchema;
  },
);

export const goBackWithData = createAsyncThunk(
  'screen/goBackWithData',
  async (_, { getState, dispatch }) => {
    dispatch({ type: 'screen/goBack' });

    const { screen } = getState() as { screen: ScreenState };
    const { currentContainerId, currentStateId } = screen;
    const screenSchema = await getScreen(currentContainerId, currentStateId);

    if (screenSchema) {
      dispatch({ type: 'screen/setCurrentScreen', payload: screenSchema });
    } else {
      console.warn(
        `[SCREEN_SLICE] No schema found for back target ${currentContainerId}/${currentStateId}`,
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
        state.history.push({
          containerId: state.currentContainerId,
          stateId: state.currentStateId,
        });
      }
      state.currentContainerId = containerId;
      state.currentStateId = stateId;
      // Clear the schema immediately so ScreenRenderer never renders the
      // previous container's schema inside the new container while the new
      // schema is being fetched asynchronously.
      state.currentScreen = null;
    },

    goBack(state) {
      if (state.history.length === 0) return;
      const previous = state.history[state.history.length - 1];
      state.history = state.history.slice(0, -1);
      state.currentContainerId = previous.containerId;
      state.currentStateId = previous.stateId;
      // Clear schema immediately — prevents ScreenRenderer from briefly
      // mounting the parent container with the child screen's schema while
      // the parent schema is being resolved asynchronously.
      state.currentScreen = null;
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
      loadScreenWithData: (containerId: string, stateId: string) =>
        dispatch(loadScreenWithData({ containerId, stateId })),
      persistState: () => dispatch(persistState()),
      restoreState: () => dispatch(restoreState()),
    }),
    [dispatch],
  );
};

export const useScreenState = () =>
  useSelector((state: RootState) => state.screen);

export default screenSlice.reducer;
