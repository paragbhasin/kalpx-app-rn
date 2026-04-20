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
//
// Week 2 — Day Active Dashboard (Mitra v3 Moments 8-15, 40, 41, 43).
// Spec: route_dashboard_day_active.md §2. All live inside screenData:
// - briefing_available: boolean (today's briefing is ready)
// - briefing_audio_url: string (play url)
// - briefing_transcript: string (full script, lazy-expanded)
// - briefing_summary: string (2-line opening)
// - briefing_voice_preset: 'anchor' | 'guardian' | 'zen' | 'witness'
// - focus_phrase: string (sub-header italic gold line)
// - cycle_day: number (1-based, mirrors day_number but cycle-scoped)
// - clear_window: { headline, message } | null (Moment 43)
// - checkpoint_due: 'day_7' | 'day_14' | null
// - check_in_dismissed: boolean (dashboard-local flag, REG-015 isolation)
// - dashboard_variant: string (first_day | standard | checkpoint_pending_day_7 |
//   checkpoint_pending_day_14 | clear_window_active | post_conflict_morning)
//
// Week 3 — Practice Runners (Mitra v3 Moments 17, 18, 19, 32)
// Spec: route_practice_mantra_runner.md, route_practice_sankalp_hold.md,
// route_practice_timer.md, transient_completion_return.md.
//
// - runner_variant: 'mantra' | 'sankalp' | 'practice' — selects which runner
//   block to render inside PracticeRunnerContainer's v3 immersive chrome, and
//   which message to show in the completion_return transient.
// - runner_source: 'core' | 'additional_recommended' | 'additional_library' |
//   'additional_custom' | 'support_trigger' | 'support_checkin' |
//   'support_grief' | 'support_loneliness' | 'support_joy' |
//   'support_growth' — must be explicitly set by the entry action
//   (start_runner). Never inferred.
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
//
// Week 6 — Companion Intelligence (Mitra v3 Moments 27, 28, 29, 30, 39)
// Spec: overlay_prep_coaching.md, embedded_predictive_alert_card.md,
//       overlay_entity_recognition.md, embedded_recommended_additional_card.md,
//       embedded_post_conflict_gentleness_card.md
// All live inside screenData. Populated by fetch_companion_intelligence
// (parallel fetch of all 5 endpoints) and cleared on dashboard re-load.
// - prep_context: object | null — Moment 27. From GET /mitra/prep/.
//   { surface, strategy_line, grounding_action, do_frame, dont_frame,
//     principle_hint, context_type, gentle_practice?, variant?, duration_min? }
// - predictive_alert: object | null — Moment 28. From GET /mitra/predictive-alerts/
//   (first alert with confidence >= 0.6, not dismissed-today, not muted).
//   { id, entity:{id,display_name,friction_trend}, when_phrase, evidence_line,
//     suggested_prep_context, confidence, principle_hint? }
// - entity_recognition_pending: object | null — Moment 29. From
//   GET /mitra/entities/?status=provisional&ready_to_ask=true.
//   { id, display_name, mention_count, contexts, first_seen_phrase }
// - recommended_additional: object | null — Moment 30. From
//   GET /mitra/recommended-additional/.
//   { item_type, item_id, title, duration_min, benefit_line, lead_in,
//     principle_hint?, source: "additional_recommended" }
// - post_conflict_pending: object | null — Moment 39. From
//   GET /mitra/post-conflict-context/.
//   { thread:{id,opened_at,entity?}, yesterday_phrase, softness_line,
//     gentle_practice:{item_type,item_id,title,duration_min}, principle_hint? }
// - predictive_alert_dismissed_at: number | null — epoch ms; cools 7d.
// - recommended_additional_dismissed_at: number | null — cools to end-of-day.
// - post_conflict_acked: boolean — one-shot ack this morning.
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

// Week 4 — Support Path (Mitra v3 Moments 20, 21, 22, 31, 38, 42).
// voice_consent_given, voice_note_*, trigger_round, trigger_mantra_text,
// checkin_step, checkin_draft, checkin_ack_variant.
export type CheckinStep = 'notice' | 'name' | 'settle';

// Week 5 — Reflection + Checkpoints (Mitra v3 Moments 23, 24, 25, 26, 34).
// evening_reflection_draft, weekly_reflection_draft, resilience_narrative,
// resilience_narrative_acked, _evening_reflection_submitted, _weekly_reflection_submitted.
export type EveningReflectionDraft = { chip: string | null; text: string };
export type WeeklyReflectionDraft = {
  held: string;
  took: string;
  tending: string;
};
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
