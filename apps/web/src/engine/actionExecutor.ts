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
} from './mitraApi';
import { ingestDailyView } from './v3Ingest';
import { webNavigate } from '../lib/webRouter';
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
            webNavigate('/login?returnTo=/en/mitra/onboarding&resume=turn_7');
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
