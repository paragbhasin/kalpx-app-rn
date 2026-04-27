/**
 * actionExecutor — Phase 5 proof subset.
 * Handles the minimum action cases needed to prove the vertical slice.
 * Unknown actions log a dev warning and no-op; they never throw or silently vanish.
 *
 * Full 103-case parity with RN is Phase 7 work.
 */

import type { AppDispatch } from '../store';
import { loadScreen, setScreenValue, updateScreenData, setSubmitting, goBack } from '../store/screenSlice';
import { trackEvent as apiTrackEvent, trackCompletion as apiTrackCompletion } from './mitraApi';
import { webNavigate } from '../lib/webRouter';
import { WEB_ENV } from '../lib/env';

export interface ActionContext {
  dispatch: AppDispatch;
  screenData: Record<string, any>;
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

function _containerToPath(containerId: string, stateId: string): string {
  return `/en/mitra/engine?containerId=${encodeURIComponent(containerId)}&stateId=${encodeURIComponent(stateId)}`;
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

// ------------------------------------------------------------------
// Main executor
// ------------------------------------------------------------------

export async function executeAction(action: any, context: ActionContext): Promise<void> {
  if (!action) return;
  const type: string = action.type || action.action || '';
  const { dispatch, screenData } = context;

  _devLog('execute', type, action);

  // Prevent duplicate tap while a submission is in flight
  if (screenData._isSubmitting && type !== 'go_back' && type !== 'back') {
    _devLog('blocked — _isSubmitting');
    return;
  }

  switch (type) {

    // ----------------------------------------------------------------
    // NAVIGATE — load a contract screen by target { container_id, state_id }
    // ----------------------------------------------------------------
    case 'navigate': {
      const dest = _resolveTarget(action.target);
      if (!dest) {
        if (WEB_ENV.isDev) console.warn('[actionExecutor] navigate: missing target', action);
        break;
      }
      // Map companion_dashboard → web dashboard page
      if (dest.containerId === 'companion_dashboard' || dest.containerId === 'companion_dashboard_v3') {
        webNavigate('/en/mitra/dashboard');
        break;
      }
      dispatch(loadScreen({ containerId: dest.containerId, stateId: dest.stateId }));
      webNavigate(_containerToPath(dest.containerId, dest.stateId));
      break;
    }

    // ----------------------------------------------------------------
    // LOAD_SCREEN — direct screen load (from code, not contract blocks)
    // ----------------------------------------------------------------
    case 'load_screen': {
      const containerId = action.container_id || action.containerId;
      const stateId = action.state_id || action.stateId;
      if (!containerId || !stateId) {
        if (WEB_ENV.isDev) console.warn('[actionExecutor] load_screen: missing container_id or state_id', action);
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
    // SET_STATE / SET_SCREEN_VALUE — write into screenData
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
    // TRACK_EVENT — fire a Mitra analytics event
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
      // If a navigation target is attached, navigate after tracking
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
    // TRACK_COMPLETION — record a practice/mantra/sankalp completion
    // ----------------------------------------------------------------
    case 'track_completion': {
      dispatch(setSubmitting(true));
      try {
        const p = action.payload || action;
        const itemType = p.itemType || p.item_type || screenData.runner_variant;
        const itemId = p.itemId || p.item_id;
        const source = p.source || screenData.runner_source;
        if (!itemType || !itemId) {
          if (WEB_ENV.isDev) console.warn('[actionExecutor] track_completion: missing itemType/itemId — skipped', { itemType, itemId });
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
        // Clear runner-local state (REG-003 parity)
        const runnerKeys = ['runner_active_item', 'runner_source', 'runner_variant', 'runner_reps_completed', 'runner_step_index', 'runner_duration_actual_sec'];
        runnerKeys.forEach(k => dispatch(setScreenValue({ key: k, value: null })));
      } finally {
        dispatch(setSubmitting(false));
      }
      break;
    }

    // ----------------------------------------------------------------
    // INFO_START_CLICK — PHASE 5 PROOF ONLY
    // In full Mitra (Phase 7), this reads screenState.info_start_action
    // and executes the stored runner start action. For the proof gate,
    // we fire the completion event directly so the pipeline is verified.
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
        // Clear info fields
        dispatch(updateScreenData({ info: null, info_start_action: null, info_start_label: null }));
        webNavigate('/en/mitra/dashboard');
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
