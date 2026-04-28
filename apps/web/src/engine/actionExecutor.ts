/**
 * actionExecutor — Phase 5 + Phase 6 (onboarding).
 * Unknown actions log a dev warning and no-op; they never throw or silently vanish.
 * Full 103-case RN parity is Phase 7.
 */

import type { AppDispatch } from '../store';
import { loadScreen, setScreenValue, updateScreenData, setSubmitting, goBack } from '../store/screenSlice';
import {
  trackEvent as apiTrackEvent,
  trackCompletion as apiTrackCompletion,
  onboardingComplete,
  startJourneyV3,
  getDailyView,
  getDashboardView,
  getRoomRender,
  postRoomTelemetry,
  postRoomSacred,
  postTriggerMantras,
  postPranaAcknowledge,
  getPrinciple,
  getPrincipleSource,
  mitraJourneyDay7View,
  mitraJourneyDay14View,
  mitraJourneyDay7Decision,
  mitraJourneyDay14Decision,
} from './mitraApi';
import { ingestDailyView, ingestDay7View, ingestDay14View } from './v3Ingest';
import { webNavigate } from '../lib/webRouter';
import { invalidateJourneyStatusCache } from '../hooks/useJourneyStatus';
import { WEB_ENV } from '../lib/env';

export interface ActionContext {
  dispatch: AppDispatch;
  screenData: Record<string, any>;
  /** currentStateId from Redux — required for onboarding_turn_response state machine */
  currentStateId?: string;
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function _containerToPath(containerId: string, stateId: string): string {
  return `/en/mitra/engine?containerId=${encodeURIComponent(containerId)}&stateId=${encodeURIComponent(stateId)}`;
}

function _onboardingPath(stateId: string): string {
  return `/en/mitra/onboarding?containerId=welcome_onboarding&stateId=${encodeURIComponent(stateId)}`;
}

function _resolveTarget(target: any): { containerId: string; stateId: string } | null {
  if (!target) return null;
  const cid = target.container_id || target.containerId;
  const sid = target.state_id || target.stateId;
  if (!cid || !sid) return null;
  return { containerId: cid, stateId: sid };
}

function _devLog(...args: any[]) {
  if (WEB_ENV.isDev) console.log('[actionExecutor]', ...args);
}

function _setKey(dispatch: AppDispatch, key: string, value: any) {
  dispatch(setScreenValue({ key, value }));
}

function _navigateToOnboarding(dispatch: AppDispatch, stateId: string) {
  dispatch(loadScreen({ containerId: 'welcome_onboarding', stateId }));
  webNavigate(_onboardingPath(stateId));
}

function _isAuthenticated(): boolean {
  try {
    return !!localStorage.getItem('access_token');
  } catch {
    return false;
  }
}

// ------------------------------------------------------------------
// Main executor
// ------------------------------------------------------------------

export async function executeAction(action: any, context: ActionContext): Promise<void> {
  if (!action) return;
  const type: string = action.type || action.action || '';
  const { dispatch, screenData, currentStateId } = context;

  _devLog('execute', type, action);

  // Prevent duplicate tap while a submission is in flight
  if (screenData._isSubmitting && type !== 'go_back' && type !== 'back') {
    _devLog('blocked — _isSubmitting');
    return;
  }

  switch (type) {

    // ----------------------------------------------------------------
    // NAVIGATE
    // ----------------------------------------------------------------
    case 'navigate': {
      const dest = _resolveTarget(action.target);
      if (!dest) {
        if (WEB_ENV.isDev) console.warn('[actionExecutor] navigate: missing target', action);
        break;
      }
      if (dest.containerId === 'companion_dashboard' || dest.containerId === 'companion_dashboard_v3') {
        webNavigate('/en/mitra/dashboard');
        break;
      }
      if (dest.containerId === 'welcome_onboarding') {
        _navigateToOnboarding(dispatch, dest.stateId);
        break;
      }
      // Intercept old portal → choice_stack entry: redirect to onboarding
      if (dest.containerId === 'choice_stack' && dest.stateId === 'discipline_select') {
        _navigateToOnboarding(dispatch, 'turn_1');
        break;
      }
      dispatch(loadScreen({ containerId: dest.containerId, stateId: dest.stateId }));
      webNavigate(_containerToPath(dest.containerId, dest.stateId));
      break;
    }

    // ----------------------------------------------------------------
    // LOAD_SCREEN
    // ----------------------------------------------------------------
    case 'load_screen': {
      const containerId = action.container_id || action.containerId;
      const stateId = action.state_id || action.stateId;
      if (!containerId || !stateId) {
        if (WEB_ENV.isDev) console.warn('[actionExecutor] load_screen: missing id', action);
        break;
      }
      if (containerId === 'welcome_onboarding') {
        _navigateToOnboarding(dispatch, stateId);
        break;
      }
      if (containerId === 'companion_dashboard' || containerId === 'companion_dashboard_v3') {
        webNavigate('/en/mitra/dashboard');
        break;
      }
      dispatch(loadScreen({ containerId, stateId }));
      webNavigate(_containerToPath(containerId, stateId));
      break;
    }

    // ----------------------------------------------------------------
    // GO_BACK / BACK / INFO_BACK
    // ----------------------------------------------------------------
    case 'go_back':
    case 'back': {
      dispatch(goBack());
      webNavigate(-1);
      break;
    }
    case 'info_back': {
      const backTarget = screenData.info_back_target;
      if (backTarget) {
        const dest = _resolveTarget(backTarget);
        if (dest) {
          dispatch(loadScreen({ containerId: dest.containerId, stateId: dest.stateId }));
          webNavigate(_containerToPath(dest.containerId, dest.stateId));
          break;
        }
      }
      dispatch(goBack());
      webNavigate(-1);
      break;
    }

    // ----------------------------------------------------------------
    // SET_STATE / SET_SCREEN_VALUE
    // ----------------------------------------------------------------
    case 'set_state':
    case 'set_screen_value': {
      const key = action.key || action.field;
      const value = action.value;
      if (key != null) {
        dispatch(setScreenValue({ key, value }));
      } else if (action.data && typeof action.data === 'object') {
        dispatch(updateScreenData(action.data));
      }
      break;
    }

    // ----------------------------------------------------------------
    // TRACK_EVENT
    // ----------------------------------------------------------------
    case 'track_event': {
      const payload = action.payload || action;
      const eventName = payload.eventName || payload.event_name;
      if (!eventName) {
        if (WEB_ENV.isDev) console.warn('[actionExecutor] track_event: missing eventName', action);
        break;
      }
      await apiTrackEvent(eventName, {
        journey_id: screenData.journey_id,
        day_number: screenData.day_number || 1,
        ...(payload.meta || {}),
      });
      if (action.target) {
        const dest = _resolveTarget(action.target);
        if (dest) {
          if (dest.containerId === 'companion_dashboard' || dest.containerId === 'companion_dashboard_v3') {
            webNavigate('/en/mitra/dashboard');
          } else {
            dispatch(loadScreen({ containerId: dest.containerId, stateId: dest.stateId }));
            webNavigate(_containerToPath(dest.containerId, dest.stateId));
          }
        }
      }
      break;
    }

    // ----------------------------------------------------------------
    // TRACK_COMPLETION
    // ----------------------------------------------------------------
    case 'track_completion': {
      dispatch(setSubmitting(true));
      try {
        const p = action.payload || action;
        const itemType = p.itemType || p.item_type || screenData.runner_variant;
        const itemId = p.itemId || p.item_id;
        const source = p.source || screenData.runner_source;
        if (!itemType || !itemId) {
          if (WEB_ENV.isDev) console.warn('[actionExecutor] track_completion: missing itemType/itemId', { itemType, itemId });
          break;
        }
        await apiTrackCompletion({
          item_type: itemType,
          item_id: itemId,
          source,
          journey_id: screenData.journey_id,
          day_number: screenData.day_number || 1,
          ...(p.meta ? { meta: p.meta } : {}),
        });
        const runnerKeys = ['runner_active_item', 'runner_source', 'runner_variant', 'runner_reps_completed', 'runner_step_index', 'runner_duration_actual_sec'];
        runnerKeys.forEach(k => dispatch(setScreenValue({ key: k, value: null })));
      } finally {
        dispatch(setSubmitting(false));
      }
      break;
    }

    // ----------------------------------------------------------------
    // INFO_START_CLICK — Phase 5 proof + Phase 6 compatible
    // ----------------------------------------------------------------
    case 'info_start_click': {
      const info = screenData.info;
      if (!info) {
        if (WEB_ENV.isDev) console.warn('[actionExecutor] info_start_click: no info in screenData');
        break;
      }
      dispatch(setSubmitting(true));
      try {
        await apiTrackEvent('mantra_offering_viewed', {
          journey_id: screenData.journey_id,
          day_number: screenData.day_number || 1,
          item_id: info.item_id,
        });
        if (info.item_id) {
          await apiTrackCompletion({
            item_type: info.item_type || 'mantra',
            item_id: info.item_id,
            source: 'core',
            journey_id: screenData.journey_id,
            day_number: screenData.day_number || 1,
          });
        }
        dispatch(updateScreenData({ info: null, info_start_action: null, info_start_label: null }));
        webNavigate('/en/mitra/dashboard');
      } finally {
        dispatch(setSubmitting(false));
      }
      break;
    }

    // ----------------------------------------------------------------
    // START_RUNNER — Phase 8: resolve variant → practice_runner state.
    // mantra  → free_mantra_chanting
    // sankalp → sankalp_embody
    // practice → practice_step_runner
    // ----------------------------------------------------------------
    case 'start_runner': {
      const p = action.payload || action;
      const variant: string = p.variant || p.item_type || 'mantra';
      const source: string = p.source || 'core';
      const item = p.item || {};

      if (!item.item_id && !item.id) {
        if (WEB_ENV.isDev) console.warn('[actionExecutor] start_runner: missing item_id', action);
        break;
      }

      dispatch(setSubmitting(true));
      try {
        const itemId: string = item.item_id || item.id || '';
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

        dispatch(updateScreenData({
          runner_active_item: item,
          runner_variant: variant,
          runner_source: source,
          runner_step_index: 0,
          runner_reps_completed: 0,
          runner_start_time: Date.now(),
          runner_duration_actual_sec: 0,
          runner_tz: tz,
          // Populate runner-specific display keys
          mantra_text: variant === 'mantra' ? (item.title || '') : screenData.mantra_text,
          mantra_devanagari: variant === 'mantra' ? (item.devanagari || '') : screenData.mantra_devanagari,
          mantra_audio_url: variant === 'mantra' ? (item.audio_url || '') : screenData.mantra_audio_url,
          reps_total: item.reps_total || screenData.reps_total || 108,
          practice_duration_seconds: variant === 'practice' ? (item.duration_seconds || screenData.practice_duration_seconds || 300) : screenData.practice_duration_seconds,
          practice_steps: variant === 'practice' ? (item.steps || screenData.practice_steps || []) : screenData.practice_steps,
        }));

        void apiTrackEvent('runner_started', {
          journey_id: screenData.journey_id,
          day_number: screenData.day_number || 1,
          item_id: itemId,
          source,
          variant,
        });

        const stateId =
          variant === 'sankalp' ? 'sankalp_embody'
          : variant === 'practice' ? 'practice_step_runner'
          : 'free_mantra_chanting';

        dispatch(loadScreen({ containerId: 'practice_runner', stateId }));
        webNavigate(_containerToPath('practice_runner', stateId));
      } finally {
        dispatch(setSubmitting(false));
      }
      break;
    }

    // ----------------------------------------------------------------
    // COMPLETE_RUNNER — track completion, navigate to completion_return.
    // ----------------------------------------------------------------
    case 'complete_runner': {
      dispatch(setSubmitting(true));
      try {
        const item = (screenData.runner_active_item || {}) as Record<string, any>;
        const variant: string = (screenData.runner_variant as string) || 'mantra';
        const source: string = (screenData.runner_source as string) || 'core';
        const itemId: string = item.item_id || item.id || '';
        const startTime: number = (screenData.runner_start_time as number) || Date.now();
        const actualSeconds = Math.round((Date.now() - startTime) / 1000);
        const repsCompleted: number = (screenData.runner_reps_completed as number) || 0;
        const tz: string = (screenData.runner_tz as string) || Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

        if (itemId) {
          const meta: Record<string, any> = { variant, actual_seconds: actualSeconds };
          if (variant === 'mantra') meta.reps_completed = repsCompleted;

          await apiTrackCompletion({
            item_type: variant,
            item_id: itemId,
            source,
            journey_id: screenData.journey_id,
            day_number: screenData.day_number || 1,
            tz,
            meta,
          });
        }

        dispatch(updateScreenData({ runner_duration_actual_sec: actualSeconds }));
        dispatch(loadScreen({ containerId: 'practice_runner', stateId: 'completion_return' }));
        webNavigate(_containerToPath('practice_runner', 'completion_return'));
      } finally {
        dispatch(setSubmitting(false));
      }
      break;
    }

    // ----------------------------------------------------------------
    // REPEAT_RUNNER — reset counters, re-enter same runner state.
    // ----------------------------------------------------------------
    case 'repeat_runner': {
      const variant: string = (screenData.runner_variant as string) || 'mantra';
      dispatch(updateScreenData({
        runner_reps_completed: 0,
        runner_step_index: 0,
        runner_start_time: Date.now(),
        runner_duration_actual_sec: 0,
      }));
      const stateId =
        variant === 'sankalp' ? 'sankalp_embody'
        : variant === 'practice' ? 'practice_step_runner'
        : 'free_mantra_chanting';
      dispatch(loadScreen({ containerId: 'practice_runner', stateId }));
      webNavigate(_containerToPath('practice_runner', stateId));
      break;
    }

    // ----------------------------------------------------------------
    // NEXT_PRACTICE_STEP — advance step index.
    // ----------------------------------------------------------------
    case 'next_practice_step': {
      const current: number = (screenData.runner_step_index as number) || 0;
      const steps: any[] = Array.isArray(screenData.practice_steps) ? screenData.practice_steps : [];
      const next = current + 1;
      dispatch(setScreenValue({ key: 'runner_step_index', value: next }));
      if (next >= steps.length && steps.length > 0) {
        await executeAction({ type: 'complete_runner' }, context);
      }
      break;
    }

    // ----------------------------------------------------------------
    // RUNNER_EXIT / RUNNER_BACK — clear runner state, go to dashboard.
    // ----------------------------------------------------------------
    case 'runner_exit':
    case 'runner_back': {
      const runnerKeys = ['runner_active_item', 'runner_source', 'runner_variant', 'runner_reps_completed', 'runner_step_index', 'runner_duration_actual_sec', 'runner_start_time', 'runner_tz'];
      runnerKeys.forEach(k => dispatch(setScreenValue({ key: k, value: null })));
      webNavigate('/en/mitra/dashboard');
      break;
    }

    // ----------------------------------------------------------------
    // RETURN_TO_DASHBOARD — clear runner state, reload dashboard.
    // ----------------------------------------------------------------
    case 'return_to_dashboard': {
      const runnerClearKeys = ['runner_active_item', 'runner_source', 'runner_variant', 'runner_reps_completed', 'runner_step_index', 'runner_duration_actual_sec', 'runner_start_time', 'runner_tz'];
      runnerClearKeys.forEach(k => dispatch(setScreenValue({ key: k, value: null })));
      // Refresh dashboard data non-blocking
      try {
        const envelope = await getDashboardView();
        if (envelope) {
          dispatch(updateScreenData(ingestDailyView(envelope)));
        }
      } catch { /* non-blocking — navigate regardless */ }
      webNavigate('/en/mitra/dashboard');
      break;
    }

    // ----------------------------------------------------------------
    // VIEW_INFO — show offering_reveal info screen for a triad item.
    // ----------------------------------------------------------------
    case 'view_info': {
      const p = action.payload || action;
      const item = p.manualData || {};
      const itemType: string = p.type || p.item_type || 'mantra';

      dispatch(setSubmitting(true));
      try {
        dispatch(updateScreenData({
          info: {
            title: item.title || item.name || '',
            subtitle: item.subtitle || '',
            description: item.subtitle || item.description || '',
            item_id: item.item_id || item.id,
            item_type: itemType,
          },
          info_start_label: 'Begin',
          info_start_action: { type: 'info_start_click' },
        }));
        dispatch(loadScreen({ containerId: 'cycle_transitions', stateId: 'offering_reveal' }));
        webNavigate(_containerToPath('cycle_transitions', 'offering_reveal'));
      } finally {
        dispatch(setSubmitting(false));
      }
      break;
    }

    // ----------------------------------------------------------------
    // INITIATE_TRIGGER — route to trigger support flow.
    // ----------------------------------------------------------------
    case 'initiate_trigger': {
      void apiTrackEvent('trigger_initiated', {
        journey_id: screenData.journey_id,
        day_number: screenData.day_number || 1,
      });
      webNavigate('/en/mitra/trigger');
      break;
    }

    // ----------------------------------------------------------------
    // START_CHECKIN — route to quick check-in flow.
    // ----------------------------------------------------------------
    case 'start_checkin': {
      void apiTrackEvent('checkin_started', {
        journey_id: screenData.journey_id,
        day_number: screenData.day_number || 1,
      });
      webNavigate('/en/mitra/checkin');
      break;
    }

    // ----------------------------------------------------------------
    // ENTER_ROOM — navigate to a support room. Phase 9: stamps full
    // room context into screenData so RoomPage can read it.
    // ----------------------------------------------------------------
    case 'enter_room': {
      const p = action.payload || action;
      const roomId: string = p.room_id || '';
      if (!roomId) {
        if (WEB_ENV.isDev) console.warn('[actionExecutor] enter_room: missing room_id', action);
        break;
      }
      // Clear stale room state before entering
      dispatch(updateScreenData({
        room_id: roomId,
        room_source: p.source || 'dashboard',
        room_render_payload: null,
        room_life_context: null,
        room_selected_action: null,
        // life_context_allowed — rooms that support picker
        life_context_allowed: ['clarity', 'growth'].includes(roomId.replace('room_', ''))
          ? ['work_career', 'relationships', 'self', 'health_energy', 'money_security', 'purpose_direction', 'daily_life']
          : null,
      }));
      void apiTrackEvent('room_entered', {
        journey_id: screenData.journey_id,
        day_number: screenData.day_number || 1,
        room_id: roomId,
        source: p.source || 'dashboard',
      });
      webNavigate(`/en/mitra/room/${roomId}`);
      break;
    }

    // ----------------------------------------------------------------
    // DASHBOARD_LOAD — re-hydrate dashboard data.
    // Simplified vs RN (no briefing/resilience/entity fetches in Phase 7).
    // ----------------------------------------------------------------
    case 'dashboard_load': {
      try {
        const envelope = await getDashboardView();
        if (envelope) {
          const flat = ingestDailyView(envelope);
          dispatch(updateScreenData(flat));
          if (WEB_ENV.isDev) {
            console.log(`[actionExecutor] dashboard_load: ${Object.keys(flat).length} keys`);
          }
        }
      } catch (e) {
        if (WEB_ENV.isDev) console.warn('[actionExecutor] dashboard_load failed:', e);
      }
      break;
    }

    // ----------------------------------------------------------------
    // START_NEW_JOURNEY — reset journey state and restart onboarding
    // ----------------------------------------------------------------
    case 'start_new_journey': {
      dispatch(updateScreenData({
        journey_id: null,
        day_number: 1,
        onboarding_draft_state: null,
        onboarding_turn: null,
        stashed_inference_state: null,
        stashed_guidance_mode: null,
      }));
      _navigateToOnboarding(dispatch, 'turn_1');
      break;
    }

    // ----------------------------------------------------------------
    // ONBOARDING_TURN_RESPONSE — Phase 6 state machine
    // Matches RN actionExecutor onboarding_turn_response case.
    // ----------------------------------------------------------------
    case 'onboarding_turn_response': {
      const stateId = currentStateId || screenData.onboarding_turn || 'turn_1';
      const draft = { ...(screenData.onboarding_draft_state || {}) };
      const p = action.payload || {};

      dispatch(setSubmitting(true));
      try {
        // Fire non-blocking telemetry
        void apiTrackEvent('onboarding_turn_response', {
          meta: {
            turn: stateId,
            chip_id: p.chip_id,
            freeform_length: (p.freeform_text || '').length,
          },
        });

        let nextStateId = '';

        if (stateId === 'turn_1') {
          if (p.chip_id === 'returning') {
            // Returning user — redirect to login
            webNavigate('/login');
            return;
          }
          if (p.freeform_text) draft.intro_freeform = p.freeform_text;
          nextStateId = 'turn_2';

        } else if (stateId === 'turn_2') {
          const path = p.chip_id === 'growth' ? 'growth' : 'support';
          draft.path = path;
          draft.stage0_choice = path;
          nextStateId = path === 'growth' ? 'turn_3_growth' : 'turn_3_support';

        } else if (stateId === 'turn_3_support' || stateId === 'turn_3_growth') {
          draft.stage1_choice = p.chip_id || 'selected_via_text';
          if (p.freeform_text) draft.freeforms = { ...(draft.freeforms || {}), stage1: p.freeform_text };
          nextStateId = draft.path === 'growth' ? 'turn_4_growth' : 'turn_4_support';

        } else if (stateId === 'turn_4_support' || stateId === 'turn_4_growth') {
          draft.stage2_choice = p.chip_id || 'selected_via_text';
          if (p.freeform_text) draft.freeforms = { ...(draft.freeforms || {}), stage2: p.freeform_text };
          nextStateId = draft.path === 'growth' ? 'turn_5_growth' : 'turn_5_support';

        } else if (stateId === 'turn_5_support' || stateId === 'turn_5_growth') {
          draft.stage3_choice = p.chip_id || 'selected_via_text';
          if (p.freeform_text) draft.freeforms = { ...(draft.freeforms || {}), stage3: p.freeform_text };
          nextStateId = 'turn_6';

        } else if (stateId === 'turn_6') {
          const mode = p.guidance_mode || p.chip_id || 'hybrid';
          draft.guidance_mode = mode;

          // POST onboarding/complete/ — gets inference + recognition line + triad labels
          const complete = await onboardingComplete({
            stage0_choice: draft.stage0_choice || draft.path || 'support',
            stage1_choice: draft.stage1_choice || '',
            stage2_choice: draft.stage2_choice || '',
            stage3_choice: draft.stage3_choice || '',
            guidance_mode: mode,
            freeforms: {
              stage1: draft.freeforms?.stage1 || null,
              stage2: draft.freeforms?.stage2 || null,
              stage3: draft.freeforms?.stage3 || null,
            },
          });

          if (complete) {
            draft.inference = complete.inference;
            draft.recognition_line = complete.recognition?.line;
            _setKey(dispatch, 'recognition_line', complete.recognition?.line || '');
            _setKey(dispatch, 'recognition_body_lines', complete.recognition?.body_lines || []);
            _setKey(dispatch, 'onboarding_complete_data', complete);
            _setKey(dispatch, 'sankalp_label', complete.triad_labels?.sankalp || 'SANKALP');
            _setKey(dispatch, 'mantra_label', complete.triad_labels?.mantra || 'MANTRA');
            _setKey(dispatch, 'practice_label', complete.triad_labels?.practice || 'PRACTICE');
            _setKey(dispatch, 'sankalp_prefix', complete.sankalp_prefix_line || '');
          }
          nextStateId = 'turn_7';

        } else if (stateId === 'turn_7') {
          const inf = draft.inference || {};

          if (!_isAuthenticated()) {
            // Guest: stash inference state and redirect to login for auth
            _setKey(dispatch, 'stashed_inference_state', inf);
            _setKey(dispatch, 'stashed_guidance_mode', draft.guidance_mode || 'hybrid');
            _setKey(dispatch, 'onboarding_draft_state', draft);
            _setKey(dispatch, 'onboarding_turn', 'turn_7_awaiting_auth');
            webNavigate('/login?returnTo=' + encodeURIComponent('/en/mitra/onboarding?stateId=turn_7'));
            return;
          }

          // Authenticated: call start-v3
          const start = await startJourneyV3({
            inference_state: {
              lane: inf.lane || draft.path || 'support',
              primary_kosha: inf.primary_kosha,
              secondary_kosha: inf.secondary_kosha,
              top_klesha: inf.primary_klesha,
              top_vritti: inf.primary_vritti,
              vritti_candidates: inf.vritti_candidates || [],
              klesha_candidates: inf.klesha_candidates || [],
              life_context: inf.life_context,
              support_style: inf.support_style,
              intervention_bias: inf.intervention_bias || [],
              confidence: inf.confidence || 0.0,
            },
            guidance_mode: draft.guidance_mode || 'hybrid',
            locale: 'en',
            tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
            stage0_choice: draft.stage0_choice || draft.path,
            stage1_choice: draft.stage1_choice,
            stage2_choice: draft.stage2_choice,
            stage3_choice: draft.stage3_choice,
          });

          if (start) {
            _setKey(dispatch, 'v3_start_failed', false);
            const t = start.triad || {};
            _setKey(dispatch, 'mantra_text', t.mantra?.title);
            _setKey(dispatch, 'companion_mantra_title', t.mantra?.title);
            _setKey(dispatch, 'companion_mantra_id', t.mantra?.item_id);
            _setKey(dispatch, 'sankalp_text', t.sankalp?.title);
            _setKey(dispatch, 'companion_sankalp_line', t.sankalp?.title);
            _setKey(dispatch, 'companion_sankalp_id', t.sankalp?.item_id);
            _setKey(dispatch, 'practice_title', t.practice?.title);
            _setKey(dispatch, 'companion_practice_title', t.practice?.title);
            _setKey(dispatch, 'companion_practice_id', t.practice?.item_id);
            _setKey(dispatch, 'scan_focus', start.scan_focus);
            _setKey(dispatch, 'onboarding_triad_data', start);
            if (start.journey_id) _setKey(dispatch, 'journey_id', start.journey_id);
            nextStateId = 'turn_8';
          } else {
            _setKey(dispatch, 'v3_start_failed', true);
            if (WEB_ENV.isDev) console.warn('[actionExecutor] start-v3 returned null — staying on turn_7 for retry');
            nextStateId = 'turn_7';
          }

        } else if (stateId === 'turn_8') {
          // "Begin my journey" tapped — track completion, hydrate dashboard, navigate
          void apiTrackEvent('onboarding_completed', {
            meta: { path: draft.path, mode: draft.guidance_mode },
          });
          // Hydrate dashboard data from today endpoint (non-blocking best-effort)
          try {
            const envelope = await getDailyView();
            if (envelope) {
              const flat = ingestDailyView(envelope);
              dispatch(updateScreenData(flat));
              if (WEB_ENV.isDev) {
                console.log(`[actionExecutor] onboarding complete — ingestDailyView produced ${Object.keys(flat).length} keys`);
              }
            }
          } catch (e) {
            if (WEB_ENV.isDev) console.warn('[actionExecutor] post-onboarding daily hydrate failed:', e);
          }
          // Clear onboarding transient state
          dispatch(updateScreenData({
            onboarding_draft_state: null,
            onboarding_turn: null,
          }));
          // Journey was created at turn_7 but the 60s cache still has hasActiveJourney=false
          // from the start of onboarding. RequiresJourney must re-fetch to get the real value.
          invalidateJourneyStatusCache();
          webNavigate('/en/mitra/dashboard');
          return;
        } else {
          if (WEB_ENV.isDev) console.warn('[actionExecutor] onboarding_turn_response: unknown state', stateId);
        }

        if (!nextStateId) break;

        _setKey(dispatch, 'onboarding_draft_state', draft);
        _setKey(dispatch, 'onboarding_turn', nextStateId);
        _navigateToOnboarding(dispatch, nextStateId);

      } catch (err) {
        if (WEB_ENV.isDev) console.error('[actionExecutor] onboarding_turn_response failed:', err);
      } finally {
        dispatch(setSubmitting(false));
      }
      break;
    }

    // ================================================================
    // TRIGGER SUPPORT
    // ================================================================

    // INITIATE_TRIGGER_SUPPORT — clears stale trigger state, seeds OM audio,
    // routes to support_trigger/sound_bridge.
    case 'initiate_trigger_support': {
      const prevRound = Number(screenData.trigger_round || 0);
      // REG-002: clear trigger-owned fields before new round
      dispatch(updateScreenData({
        trigger_mantra_text: null,
        trigger_mantra_devanagari: null,
        trigger_round: prevRound + 1,
        om_audio_url: null,
      }));
      void apiTrackEvent('trigger_session_started', {
        journey_id: screenData.journey_id,
        day_number: screenData.day_number || 1,
        meta: { source_surface: 'dashboard', round: prevRound + 1 },
      });
      dispatch(loadScreen({ containerId: 'support_trigger', stateId: 'sound_bridge' }));
      webNavigate(_containerToPath('support_trigger', 'sound_bridge'));
      break;
    }

    // ADVANCE_SOUND_BRIDGE — exits OM sound bridge, starts mantra runner
    // with runner_source="support_trigger".
    case 'advance_sound_bridge': {
      const exitType = action.payload?.exit_type || 'tap';
      void apiTrackEvent('sound_bridge_exited', {
        journey_id: screenData.journey_id,
        day_number: screenData.day_number || 1,
        meta: { exit_type: exitType, parent: 'trigger' },
      });
      const triggerItem = {
        item_type: 'mantra',
        item_id: (screenData.support_mantra_id as string) || 'om_support',
        title: (screenData.trigger_mantra_text as string) || 'OM',
        devanagari: (screenData.trigger_mantra_devanagari as string) || 'ॐ',
        audio_url: (screenData.om_audio_url as string) || '',
      };
      dispatch(updateScreenData({
        runner_variant: 'mantra',
        runner_source: 'support_trigger',
        runner_active_item: triggerItem,
        runner_start_time: Date.now(),
        runner_reps_completed: 0,
        runner_duration_actual_sec: 0,
        mantra_text: triggerItem.title,
        mantra_devanagari: triggerItem.devanagari,
        mantra_audio_url: triggerItem.audio_url,
        reps_total: -1, // unlimited for support
      }));
      dispatch(loadScreen({ containerId: 'practice_runner', stateId: 'free_mantra_chanting' }));
      webNavigate(_containerToPath('practice_runner', 'free_mantra_chanting'));
      break;
    }

    // ================================================================
    // CHECK-IN SUPPORT
    // ================================================================

    // ADVANCE_CHECKIN_STEP — notice → name → settle
    case 'advance_checkin_step': {
      const from: string = action.payload?.from || 'notice';
      const value: string = action.payload?.value || '';
      const draft = { ...(screenData.checkin_draft || {}) } as Record<string, string>;
      if (from === 'notice') draft.noticed = value;
      else if (from === 'name') draft.named = value;
      dispatch(updateScreenData({ checkin_draft: draft }));
      const next: Record<string, string> = { notice: 'name', name: 'settle' };
      const nextStep = next[from];
      if (nextStep) {
        dispatch(setScreenValue({ key: 'checkin_step', value: nextStep }));
        dispatch(loadScreen({ containerId: 'support_checkin', stateId: nextStep }));
        webNavigate(_containerToPath('support_checkin', nextStep));
      }
      break;
    }

    // SUBMIT_CHECKIN — finalize, show balanced_ack overlay.
    case 'submit_checkin': {
      const draft = { ...(screenData.checkin_draft || {}) } as Record<string, string>;
      if (action.payload?.final) draft.settled = action.payload.final;
      dispatch(updateScreenData({ checkin_draft: draft, checkin_ack_variant: 'balanced' }));
      void apiTrackEvent('checkin_regulation_completed', {
        journey_id: screenData.journey_id,
        day_number: screenData.day_number || 1,
        meta: { noticed: draft.noticed, named: draft.named, settled: draft.settled },
      });
      // Best-effort prana acknowledge
      void postPranaAcknowledge({ pranaType: draft.named, focus: draft.noticed, locale: 'en' });
      dispatch(loadScreen({ containerId: 'support_checkin', stateId: 'balanced_ack' }));
      webNavigate(_containerToPath('support_checkin', 'balanced_ack'));
      break;
    }

    // CHECKIN_COMPLETE — clear checkin state, return to dashboard.
    case 'checkin_complete': {
      // REG-015: clear checkin-only state
      dispatch(updateScreenData({ checkin_step: null, checkin_draft: null, checkin_ack_variant: null }));
      webNavigate('/en/mitra/dashboard');
      break;
    }

    // ================================================================
    // ROOM ACTIONS
    // ================================================================

    // ROOM_TELEMETRY — context picker telemetry (non-blocking).
    case 'room_telemetry': {
      const body = {
        event_type: action.payload?.event_type || null,
        room_id: action.payload?.room_id || screenData.room_id || null,
        life_context: action.payload?.life_context ?? null,
        ts: Date.now(),
      };
      void postRoomTelemetry(body as any);
      break;
    }

    // ROOM_EXIT — clear room state, return to dashboard.
    case 'room_exit': {
      const rId = action.payload?.room_id || screenData.room_id || null;
      void apiTrackEvent('room_exit_dispatched', {
        journey_id: screenData.journey_id,
        day_number: screenData.day_number || 1,
        meta: { room_id: rId, source: 'room_renderer' },
      });
      dispatch(updateScreenData({
        room_id: null,
        room_render_payload: null,
        room_life_context: null,
        room_selected_action: null,
      }));
      webNavigate('/en/mitra/dashboard');
      break;
    }

    // ROOM_STEP_COMPLETED — telemetry only.
    case 'room_step_completed': {
      void apiTrackEvent('room_step_completed', {
        journey_id: screenData.journey_id,
        day_number: screenData.day_number || 1,
        meta: {
          room_id: action.payload?.room_id || screenData.room_id || null,
          template_id: action.payload?.template_id || null,
          action_id: action.payload?.action_id || null,
          analytics_key: action.payload?.analytics_key || null,
        },
      });
      break;
    }

    // ROOM_INQUIRY_OPENED / ROOM_INQUIRY_CATEGORY_SELECTED — telemetry only.
    case 'room_inquiry_opened': {
      void apiTrackEvent('room_inquiry_opened', {
        journey_id: screenData.journey_id,
        day_number: screenData.day_number || 1,
        meta: {
          room_id: action.payload?.room_id || screenData.room_id || null,
          action_id: action.payload?.action_id || null,
          analytics_key: action.payload?.analytics_key || null,
        },
      });
      break;
    }
    case 'room_inquiry_category_selected': {
      void apiTrackEvent('room_inquiry_category_selected', {
        journey_id: screenData.journey_id,
        day_number: screenData.day_number || 1,
        meta: {
          room_id: action.payload?.room_id || screenData.room_id || null,
          category_id: action.payload?.category_id || null,
          action_id: action.payload?.action_id || null,
        },
      });
      break;
    }

    // ROOM_CARRY_CAPTURED — telemetry + optional sacred write.
    case 'room_carry_captured': {
      const rId = action.payload?.room_id || screenData.room_id || null;
      void apiTrackEvent('room_carry_captured', {
        journey_id: screenData.journey_id,
        day_number: screenData.day_number || 1,
        meta: {
          room_id: rId,
          writes_event: action.payload?.writes_event || null,
          label: action.payload?.label || '',
          analytics_key: action.payload?.analytics_key || null,
        },
      });
      if (rId && action.payload?.carry_text) {
        void postRoomSacred(rId, {
          text: action.payload.carry_text,
          action_id: action.payload?.action_id,
          analytics_key: action.payload?.analytics_key,
        });
      }
      break;
    }

    // SUPPORT_EXIT — safe escape from any support surface.
    case 'support_exit': {
      // Clear all support state
      dispatch(updateScreenData({
        trigger_mantra_text: null, trigger_mantra_devanagari: null, om_audio_url: null,
        checkin_step: null, checkin_draft: null, checkin_ack_variant: null,
        room_id: null, room_render_payload: null, room_life_context: null, room_selected_action: null,
      }));
      webNavigate('/en/mitra/dashboard');
      break;
    }

    // ================================================================
    // WHY THIS — L2 / L3 principle overlays
    // ================================================================

    // OPEN_WHY_THIS_L2 — fetch principle detail, show L2 overlay.
    case 'open_why_this_l2': {
      const principleId = action.payload?.principle_id ?? action.principle_id ?? screenData.why_this?.principle_id;
      if (!principleId) {
        if (WEB_ENV.isDev) console.warn('[actionExecutor] open_why_this_l2: no principle_id', action);
        break;
      }
      dispatch(setSubmitting(true));
      try {
        void apiTrackEvent('why_this_l2_opened', {
          journey_id: screenData.journey_id,
          day_number: screenData.day_number || 1,
          meta: { principle_id: principleId },
        });
        const principle = await getPrinciple(principleId);
        if (principle) {
          dispatch(updateScreenData({
            why_this_principle: principle,
            why_this_overlay_level: 'l2',
          }));
        }
      } finally {
        dispatch(setSubmitting(false));
      }
      break;
    }

    // OPEN_WHY_THIS_L3 — fetch principle source, show L3 overlay.
    case 'open_why_this_l3': {
      const principleId = action.payload?.principle_id ?? action.principle_id ?? screenData.why_this?.principle_id;
      if (!principleId) {
        if (WEB_ENV.isDev) console.warn('[actionExecutor] open_why_this_l3: no principle_id', action);
        break;
      }
      dispatch(setSubmitting(true));
      try {
        void apiTrackEvent('why_this_l3_opened', {
          journey_id: screenData.journey_id,
          day_number: screenData.day_number || 1,
          meta: { principle_id: principleId },
        });
        const source = await getPrincipleSource(principleId);
        if (source) {
          dispatch(updateScreenData({
            why_this_source: source,
            why_this_overlay_level: 'l3',
          }));
        }
      } finally {
        dispatch(setSubmitting(false));
      }
      break;
    }

    // DISMISS_WHY_THIS — clear overlay levels and principle data.
    case 'dismiss_why_this': {
      dispatch(updateScreenData({
        why_this_overlay_level: null,
        why_this_principle: null,
        why_this_source: null,
      }));
      break;
    }

    // ================================================================
    // CHECKPOINTS — Day 7 / Day 14 decisions
    // ================================================================

    // SUBMIT_CHECKPOINT_DECISION — submit day 7 or day 14 decision.
    // Detected from currentStateId: checkpoint_day_7 → day7 API; checkpoint_day_14 → day14 API.
    case 'submit_checkpoint_decision': {
      const p = action.payload || action;
      const decision: string = p.decision || '';
      const day: number = p.day || (currentStateId === 'checkpoint_day_7' ? 7 : 14);
      const idempotencyKey = `checkpoint_${day}_${decision}_${screenData.journey_id || ''}_${Date.now()}`;

      if (!decision) {
        if (WEB_ENV.isDev) console.warn('[actionExecutor] submit_checkpoint_decision: missing decision', action);
        break;
      }

      dispatch(setSubmitting(true));
      try {
        void apiTrackEvent('checkpoint_completed', {
          journey_id: screenData.journey_id,
          day_number: screenData.day_number || day,
          meta: { decision, day },
        });

        let nextView: any = null;
        if (day === 7) {
          const result = await mitraJourneyDay7Decision({ decision }, idempotencyKey);
          nextView = result?.next_view;
        } else {
          const result = await mitraJourneyDay14Decision({ decision }, idempotencyKey);
          nextView = result?.next_view;
        }

        // Day 14 "change_focus" always re-enters onboarding
        if (day === 14 && decision === 'change_focus') {
          dispatch(updateScreenData({ journey_id: null }));
          _navigateToOnboarding(dispatch, 'turn_1');
          return;
        }

        if (nextView?.view_key === 'onboarding_start') {
          dispatch(updateScreenData({ journey_id: null }));
          _navigateToOnboarding(dispatch, 'turn_1');
          return;
        }

        if (nextView?.payload) {
          const flat = ingestDailyView(nextView.payload);
          dispatch(updateScreenData(flat));
        }

        // day_14 "deepen" goes to deepen_confirmation; otherwise dashboard
        if (day === 14 && decision === 'deepen') {
          dispatch(loadScreen({ containerId: 'cycle_transitions', stateId: 'deepen_confirmation' }));
          webNavigate(_containerToPath('cycle_transitions', 'deepen_confirmation'));
        } else {
          webNavigate('/en/mitra/dashboard');
        }
      } catch (err) {
        if (WEB_ENV.isDev) console.error('[actionExecutor] submit_checkpoint_decision failed:', err);
        // Keep user on checkpoint page — error handled by block
        dispatch(updateScreenData({ checkpoint_submit_error: true }));
      } finally {
        dispatch(setSubmitting(false));
      }
      break;
    }

    // ----------------------------------------------------------------
    // DEFAULT — log unimplemented, never throw or silently vanish
    // ----------------------------------------------------------------
    default: {
      if (WEB_ENV.isDev) {
        console.warn('[actionExecutor] unimplemented action type:', type, action);
      }
    }
  }
}
