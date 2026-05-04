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
  trackRoomTelemetry,
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
import { ensureRoomAmbientPlaying } from '../lib/audio/calmMusic';
import { webNavigate } from '../lib/webRouter';
import { invalidateJourneyStatusCache } from '../hooks/useJourneyStatus';
import { invalidateJourneyEntryViewCache } from '../hooks/useJourneyEntryView';
import { WEB_ENV } from '../lib/env';
const CHECKPOINT_BYPASS_KEY = 'kalpx_checkpoint_redirect_bypass_until';

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

function _normalizeCompletionSource(source: string | null | undefined): string | null {
  if (!source) return null;
  if (source === 'support_room') return 'support';
  return source;
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
    return !!(
      localStorage.getItem('access_token') ||
      localStorage.getItem('accessToken')
    );
  } catch {
    return false;
  }
}

function _triggerNegativeLabel(feeling: string, step: number): string {
  if (step <= 2) return 'Try another way';
  const labels: Record<string, string> = {
    triggered: 'I still feel triggered',
    agitated: 'I still feel agitated',
    drained: 'I still feel drained',
    anxious: 'I still feel anxious',
    restless: 'I still feel restless',
    angry: 'I still feel angry',
    overwhelmed: 'I still feel overwhelmed',
    stuck: 'I still feel stuck',
    uncertain: 'I still feel unsettled',
  };
  return labels[feeling] || 'I still feel unsettled';
}

function _resolveMitraTz(): string {
  const raw = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  return raw === 'Asia/Calcutta' ? 'Asia/Kolkata' : raw;
}

function _setCheckpointRedirectBypass(msFromNow = 30_000): void {
  try {
    sessionStorage.setItem(CHECKPOINT_BYPASS_KEY, String(Date.now() + msFromNow));
  } catch {
    // best effort
  }
}

// Om audio served via kalpx.com CloudFront (s3://kalpx-media/audio/)
const OM_AUDIO_LIBRARY = [
  'https://kalpx.com/audio/Om.mp4',
  'https://kalpx.com/audio/Om%20Shanti.mp4',
  'https://kalpx.com/audio/Hari%20Om%20-Female.mp4',
];

function _rotateAudio(library: string[], storageKey: string): string {
  let lastIdx = -1;
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored != null) lastIdx = parseInt(stored, 10);
  } catch {}
  const nextIdx = ((Number.isFinite(lastIdx) ? lastIdx : -1) + 1) % library.length;
  try {
    localStorage.setItem(storageKey, String(nextIdx));
  } catch {}
  return library[nextIdx];
}

function _omTextForTrack(url: string) {
  if (url.includes('Hari Om')) {
    return { label: 'Hari Om', devanagari: 'हरि ॐ' };
  }
  if (url.includes('Om Shanti')) {
    return {
      label: 'Om Shanti Shanti Shanti',
      devanagari: 'ॐ शान्तिः शान्तिः शान्तिः',
    };
  }
  return { label: 'OM', devanagari: 'ॐ' };
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
        const source = _normalizeCompletionSource(
          (p.source || screenData.runner_source) as string | null | undefined
        );
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
    // INFO_START_CLICK — offering_reveal "Begin" → start the runner.
    // X-PRE: removes false apiTrackCompletion; recovers master item fields;
    //        seeds runner state (same pattern as start_runner); routes to
    //        practice_runner/{stateId}. Core context ONLY — Room/Additional
    //        dispatch start_runner directly (no offering_reveal path).
    // ----------------------------------------------------------------
    case 'info_start_click': {
      const info = screenData.info as any;
      const manualInfoItem = (screenData._info_manual_data || {}) as Record<string, any>;
      if (!info) {
        if (WEB_ENV.isDev) console.warn('[actionExecutor] info_start_click: no info in screenData');
        break;
      }

      const itemType: string = info.item_type || info.type || 'mantra';
      const variant: 'mantra' | 'sankalp' | 'practice' =
        itemType === 'sankalp' ? 'sankalp'
        : itemType === 'practice' ? 'practice'
        : 'mantra';

      // Recover full item fields from master items already in Redux (daily-view ingest).
      // screenData.info only has { title, subtitle, item_id, item_type } — master has audio_url, devanagari, steps, etc.
      const masterKey = variant === 'sankalp' ? 'master_sankalp'
        : variant === 'practice' ? 'master_practice'
        : 'master_mantra';
      const masterItem = (screenData[masterKey] || {}) as Record<string, any>;
      const baseItem = Object.keys(manualInfoItem).length > 0 ? manualInfoItem : masterItem;
      const item: Record<string, any> = {
        ...baseItem,
        item_id: info.item_id || manualInfoItem.item_id || manualInfoItem.itemId || masterItem.item_id || '',
        item_type: variant,
        itemType: variant,
        title: manualInfoItem.title || masterItem.title || info.title || '',
        subtitle: manualInfoItem.subtitle || masterItem.subtitle || info.subtitle || '',
        devanagari: manualInfoItem.devanagari || masterItem.devanagari || '',
        audio_url: manualInfoItem.audio_url || masterItem.audio_url || '',
        reps_total: manualInfoItem.reps_total ?? masterItem.reps_total ?? null,
        duration_seconds: manualInfoItem.duration_seconds ?? masterItem.duration_seconds ?? null,
        steps: manualInfoItem.steps || masterItem.steps || [],
      };

      void apiTrackEvent('mantra_offering_viewed', {
        journey_id: screenData.journey_id,
        day_number: screenData.day_number || 1,
        item_id: item.item_id,
      });

      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
      const preservedSource = (screenData.runner_source as string) || 'core';

      dispatch(updateScreenData({
        runner_variant: variant,
        runner_source: preservedSource,
        runner_active_item: item,
        runner_step_index: 0,
        runner_reps_completed: 0,
        runner_start_time: Date.now(),
        runner_duration_actual_sec: 0,
        runner_tz: tz,
        mantra_text: variant === 'mantra' ? (item.title || '') : screenData.mantra_text,
        mantra_devanagari: variant === 'mantra' ? (item.devanagari || '') : screenData.mantra_devanagari,
        mantra_audio_url: variant === 'mantra' ? (item.audio_url || '') : screenData.mantra_audio_url,
        sankalp_audio_url: variant === 'sankalp' ? (item.audio_url || '') : (screenData.sankalp_audio_url ?? ''),
        reps_total: item.reps_total || screenData.reps_total || 108,
        practice_duration_seconds: variant === 'practice'
          ? (item.duration_seconds || screenData.practice_duration_seconds || 300)
          : screenData.practice_duration_seconds,
        practice_steps: variant === 'practice' ? (item.steps || screenData.practice_steps || []) : screenData.practice_steps,
        info: null,
        _info_manual_data: null,
        info_start_action: null,
        info_start_label: null,
      }));

      void apiTrackEvent('runner_started', {
        journey_id: screenData.journey_id,
        day_number: screenData.day_number || 1,
        item_id: item.item_id,
        source: preservedSource,
        variant,
      });

      const stateId =
        variant === 'sankalp' ? 'sankalp_embody'
        : variant === 'practice' ? 'practice_step_runner'
        : 'free_mantra_chanting';

      dispatch(loadScreen({ containerId: 'practice_runner', stateId }));
      webNavigate(_containerToPath('practice_runner', stateId));
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
          // G13: seed sankalp audio for SankalpHoldBlock — silent without this
          sankalp_audio_url: variant === 'sankalp' ? (item.audio_url || '') : (screenData.sankalp_audio_url ?? ''),
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
        const source: string =
          _normalizeCompletionSource(screenData.runner_source as string | null | undefined) || 'core';
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
    // RUNNER_EXIT / RUNNER_BACK — clear runner state, return to origin.
    // G17: room-sourced exit returns to room. G27: trigger-sourced returns to /trigger.
    // Read source/roomId BEFORE clearing keys.
    // ----------------------------------------------------------------
    case 'runner_exit':
    case 'runner_back': {
      const exitSource = screenData.runner_source as string | null;
      const exitRoomId = screenData.room_id as string | null;
      const runnerKeys = ['runner_active_item', 'runner_source', 'runner_variant', 'runner_reps_completed', 'runner_step_index', 'runner_duration_actual_sec', 'runner_start_time', 'runner_tz'];
      runnerKeys.forEach(k => dispatch(setScreenValue({ key: k, value: null })));
      if (exitSource === 'support_room' && exitRoomId) {
        ensureRoomAmbientPlaying();
        webNavigate(`/en/mitra/room/${exitRoomId.replace(/^room_/, '')}`);
      } else if (exitSource === 'support_trigger') {
        webNavigate('/en/mitra/trigger');
      } else {
        webNavigate('/en/mitra/dashboard');
      }
      break;
    }

    // ----------------------------------------------------------------
    // RETURN_TO_DASHBOARD — clear runner state, reload dashboard.
    // ----------------------------------------------------------------
    case 'return_to_dashboard': {
      // Navigate first so support/mantra screens do not briefly re-render with
      // partially-cleared runner state before the route transition completes.
      webNavigate('/en/mitra/dashboard');

      // Refresh dashboard data non-blocking
      try {
        const envelope = await getDashboardView();
        if (envelope) {
          dispatch(updateScreenData(ingestDailyView(envelope)));
        }
      } catch { /* non-blocking — navigate regardless */ }
      break;
    }

    // ----------------------------------------------------------------
    // RETURN_TO_SOURCE — clear runner state, navigate back to origin surface.
    // G17: support_room → originating room. G27: support_trigger → /en/mitra/trigger.
    // Falls back to dashboard for all other sources (safe no-op).
    // ----------------------------------------------------------------
    case 'return_to_source': {
      const roomId = (screenData.room_id as string | null) || null;
      const returnSrc = (screenData.runner_source as string | null) || null;
      const runnerClearKeys = ['runner_active_item', 'runner_source', 'runner_variant', 'runner_reps_completed', 'runner_step_index', 'runner_duration_actual_sec', 'runner_start_time', 'runner_tz'];
      runnerClearKeys.forEach(k => dispatch(setScreenValue({ key: k, value: null })));
      if (returnSrc === 'support_room' && roomId) {
        ensureRoomAmbientPlaying();
        webNavigate(`/en/mitra/room/${roomId.replace(/^room_/, '')}`);
      } else if (returnSrc === 'support_trigger') {
        webNavigate('/en/mitra/trigger');
      } else {
        webNavigate('/en/mitra/dashboard');
      }
      break;
    }

    // ----------------------------------------------------------------
    // VIEW_INFO — show offering_reveal info screen for a triad item.
    // ----------------------------------------------------------------
    case 'view_info': {
      const p = action.payload || action;
      const item = p.manualData || {};
      const itemType: string = p.type || p.item_type || 'mantra';
      const itemSource: string = item.source || (screenData.runner_source as string) || 'core';

      dispatch(setSubmitting(true));
      try {
        dispatch(updateScreenData({
          runner_source: itemSource,
          _info_manual_data: item,
          info: {
            title: item.title || item.name || '',
            subtitle: item.subtitle || '',
            description: item.subtitle || item.description || '',
            item_id: item.item_id || item.itemId || item.id,
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
    // INITIATE_TRIGGER — mirror mobile dashboard quick-support behavior:
    // seed an OM trigger session and enter the mantra runner directly.
    // ----------------------------------------------------------------
    case 'initiate_trigger': {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
      const triggerOmAudio = _rotateAudio(OM_AUDIO_LIBRARY, '_kalpx_om_audio_idx');
      const { label: trigLabel, devanagari: trigDev } = _omTextForTrack(triggerOmAudio);
      const triggerItem = {
        item_type: 'mantra',
        item_id: 'om_support',
        title: trigLabel,
        devanagari: trigDev,
        audio_url: triggerOmAudio,
        source: 'support',
      };

      dispatch(updateScreenData({
        runner_active_item: triggerItem,
        runner_variant: 'mantra',
        runner_source: 'core',
        runner_step_index: 0,
        runner_reps_completed: 0,
        runner_start_time: Date.now(),
        runner_duration_actual_sec: 0,
        runner_tz: tz,
        reps_total: -1,
        trigger_cycle_count: 1,
        trigger_feeling: 'triggered',
        trigger_step: 1,
        _selected_om_audio: triggerOmAudio,
        om_audio_url: triggerOmAudio,
        trigger_mantra_text: trigLabel,
        trigger_mantra_devanagari: trigDev,
        mantra_text: trigLabel,
        mantra_devanagari: trigDev,
        mantra_audio_url: triggerItem.audio_url,
      }));

      void apiTrackEvent('trigger_session_started', {
        journey_id: screenData.journey_id,
        day_number: screenData.day_number || 1,
      });

      dispatch(loadScreen({ containerId: 'practice_runner', stateId: 'free_mantra_chanting' }));
      webNavigate(_containerToPath('practice_runner', 'free_mantra_chanting'));
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
      dispatch(updateScreenData({
        current_prana: null,
        current_prana_type: null,
        checkin_ack_headline: null,
        checkin_ack_body: null,
        checkin_ack_accent: null,
        prana_ack_suggestions: null,
      }));
      dispatch(loadScreen({ containerId: 'cycle_transitions', stateId: 'quick_checkin' }));
      webNavigate(_containerToPath('cycle_transitions', 'quick_checkin'));
      break;
    }

    // SUBMIT — quick check-in prana selection parity with RN
    case 'submit': {
      const p = action.payload || {};

      if (p.prana_type) {
        const pranaType = String(p.prana_type);
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
        const ackRes = await postPranaAcknowledge({
          pranaType,
          focus: (screenData.scan_focus as string) || (screenData.active_focus as string) || 'peacecalm',
          subFocus: (screenData.prana_baseline_selection as string) || '',
          depth: (screenData.routine_depth as string) || (screenData.routine_setup as string) || 'standard',
          baselineMetrics: screenData.baseline_metrics || {},
          dayNumber: screenData.day_number || 1,
          journeyId: screenData.journey_id || null,
          round: 2,
          locale: (screenData.locale as string) || 'en',
          tz,
        });

        const checkinAckCopy: Record<string, { headline: string; body: string; accent?: string }> = {
          balanced: {
            headline: 'You are exactly where you need to be.',
            body: 'There is a quiet steadiness within you.\nStay here. Let it deepen.',
            accent: 'Nothing needs to be changed right now.',
          },
          energized: {
            headline: 'Your energy is present and alive.',
            body: 'Move with this energy, not against it.\nLet it carry your intention forward.',
            accent: 'This is a good moment to carry your sankalp forward.',
          },
          agitated: {
            headline: 'A gentler next step may help settle this.',
            body: 'You do not need to push through this state. Choose one small support that helps bring your energy back into steadiness.',
            accent: '',
          },
          drained: {
            headline: 'A nourishing next step may help restore you.',
            body: 'You may not need more effort right now. Choose one small support that helps you return with more softness and steadiness.',
            accent: '',
          },
        };
        const ackCopy = checkinAckCopy[pranaType] || checkinAckCopy.balanced;

        dispatch(updateScreenData({
          current_prana: pranaType,
          current_prana_type: pranaType,
          checkin_ack_headline: ackCopy.headline,
          checkin_ack_body: ackCopy.body,
          checkin_ack_accent: ackCopy.accent || '',
          prana_ack_insight: ackRes?.insight || null,
          prana_ack_suggestions: Array.isArray(ackRes?.suggestions) ? ackRes.suggestions : null,
        }));

        const hasSuggestions = Array.isArray(ackRes?.suggestions) && ackRes.suggestions.length > 0;
        void apiTrackEvent(hasSuggestions ? 'checkin_acknowledged' : 'checkin_ack_only', {
          journey_id: screenData.journey_id,
          day_number: screenData.day_number || 1,
          prana_type: pranaType,
        });

        if (pranaType === 'agitated' || pranaType === 'drained') {
          const checkinOmAudio = _rotateAudio(OM_AUDIO_LIBRARY, '_kalpx_om_audio_idx');
          const { label, devanagari } = _omTextForTrack(checkinOmAudio);
          dispatch(updateScreenData({
            runner_variant: 'mantra',
            runner_source: 'support_checkin',
            runner_active_item: {
              item_type: 'mantra',
              item_id: 'checkin_breath_reset',
              title: label,
              devanagari,
              audio_url: checkinOmAudio,
              source: 'support',
            },
            runner_start_time: Date.now(),
            runner_reps_completed: 0,
            runner_duration_actual_sec: 0,
            reps_total: -1,
            _selected_om_audio: checkinOmAudio,
            om_audio_url: checkinOmAudio,
            checkin_mantra_text: label,
            checkin_mantra_devanagari: devanagari,
            mantra_text: label,
            mantra_devanagari: devanagari,
            mantra_audio_url: checkinOmAudio,
            trigger_feeling: pranaType,
            trigger_step: 1,
            trigger_cycle_count: 2,
          }));
          dispatch(loadScreen({ containerId: 'practice_runner', stateId: 'checkin_breath_reset' }));
          webNavigate(_containerToPath('practice_runner', 'checkin_breath_reset'));
          break;
        }

        dispatch(loadScreen({ containerId: 'cycle_transitions', stateId: 'quick_checkin_ack' }));
        webNavigate(_containerToPath('cycle_transitions', 'quick_checkin_ack'));
        break;
      }

      if (WEB_ENV.isDev) console.warn('[actionExecutor] submit: unsupported payload', action);
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
      ensureRoomAmbientPlaying();
      // Clear stale room state before entering
      dispatch(updateScreenData({
        room_id: roomId,
        room_source: p.source || 'dashboard',
        room_render_payload: null,
        room_life_context: null,
        room_selected_action: null,
        // Match mobile picker contract: only rooms with visibly differentiated
        // context-aware content should offer the life-context tray.
        life_context_allowed: ({
          room_clarity: ['work_career', 'relationships', 'self', 'health_energy', 'money_security', 'purpose_direction', 'daily_life'],
          room_growth: ['work_career', 'relationships', 'self', 'health_energy', 'money_security', 'purpose_direction', 'daily_life'],
          room_release: ['work_career', 'relationships', 'self', 'health_energy', 'money_security'],
          room_stillness: ['work_career', 'relationships', 'self', 'health_energy', 'money_security', 'purpose_direction'],
        } as Record<string, string[] | null>)[roomId] ?? null,
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
      const omUrl = _rotateAudio(OM_AUDIO_LIBRARY, '_kalpx_om_audio_idx');
      const omText = _omTextForTrack(omUrl);
      // REG-002: clear trigger-owned fields before new round
      dispatch(updateScreenData({
        trigger_mantra_text: omText.label,
        trigger_mantra_devanagari: omText.devanagari,
        trigger_round: prevRound + 1,
        _selected_om_audio: omUrl,
        om_audio_url: omUrl,
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

    case 'try_another_way':
    case 'trigger_still_feeling': {
      const stillStep = Number(screenData.trigger_step || 2);
      const stillFeeling = (screenData.trigger_feeling as string) || 'triggered';
      const locale = (screenData.locale as string) || 'en';
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

      const fetchSuggestions = async (round: number) =>
        await postTriggerMantras({
          feeling: stillFeeling,
          focus: (screenData.scan_focus as string) || (screenData.active_focus as string) || 'peacecalm',
          subFocus: (screenData.prana_baseline_selection as string) || '',
          depth: (screenData.routine_depth as string) || (screenData.routine_setup as string) || 'standard',
          round,
          locale,
          tz,
        });

      const normalizePractice = (suggestion: any) => {
        const core = suggestion?.core || {};
        return {
          ...core,
          wisdom: suggestion?.context,
          source: 'support',
          is_trigger: true,
          item_id: suggestion?.item_id || core.item_id || suggestion?.id || core.id,
          item_type: 'practice',
          steps_text: Array.isArray(core.steps)
            ? core.steps.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')
            : core.steps_text,
          benefits_text: Array.isArray(core.benefits)
            ? core.benefits.map((b: string) => `• ${b}`).join('\n')
            : core.benefits_text,
        };
      };

      const normalizeMantra = (suggestion: any) => {
        const core = suggestion?.core || {};
        return {
          ...core,
          wisdom: suggestion?.context,
          source: 'support',
          is_trigger: true,
          item_id: suggestion?.item_id || core.item_id || suggestion?.id || core.id,
          item_type: 'mantra',
        };
      };

      if (stillStep <= 1) {
        const res = await fetchSuggestions(1);
        const suggestions = res?.suggestions || [];
        const practiceSuggestion = suggestions.find((s: any) => s?.type === 'practice');
        const mantraSuggestion = suggestions.find((s: any) => s?.type === 'mantra');

        if (practiceSuggestion) {
          const practiceData = normalizePractice(practiceSuggestion);
          dispatch(updateScreenData({
            _trigger_practice_data: {
              ...(practiceSuggestion.core || {}),
              wisdom: practiceSuggestion.context,
              item_id: practiceSuggestion.item_id || practiceSuggestion.id,
            },
            ...(mantraSuggestion
              ? {
                  _trigger_mantra_data: {
                    ...(mantraSuggestion.core || {}),
                    wisdom: mantraSuggestion.context,
                    item_id: mantraSuggestion.item_id || mantraSuggestion.id,
                  },
                }
              : {}),
            runner_active_item: practiceData,
            runner_variant: 'practice',
            runner_source: 'support_trigger',
            trigger_step: 2,
            _trigger_negative_label: _triggerNegativeLabel(stillFeeling, 2),
          }));
          webNavigate(_containerToPath('practice_runner', 'trigger_practice_runner'));
          return;
        }

        if (mantraSuggestion) {
          const mantraData = normalizeMantra(mantraSuggestion);
          dispatch(updateScreenData({
            _trigger_mantra_data: {
              ...(mantraSuggestion.core || {}),
              wisdom: mantraSuggestion.context,
              item_id: mantraSuggestion.item_id || mantraSuggestion.id,
            },
            runner_active_item: mantraData,
            runner_variant: 'mantra',
            runner_source: 'support_trigger',
            runner_reps_completed: 0,
            runner_start_time: Date.now(),
            runner_duration_actual_sec: 0,
            mantra_text: mantraData.iast || mantraData.title || 'OM',
            mantra_devanagari: mantraData.devanagari || 'ॐ',
            mantra_audio_url: mantraData.audio_url || '',
            trigger_mantra_text: mantraData.iast || mantraData.title || 'OM',
            trigger_mantra_devanagari: mantraData.devanagari || 'ॐ',
            trigger_step: 3,
            _trigger_negative_label: _triggerNegativeLabel(stillFeeling, 3),
          }));
          webNavigate(_containerToPath('practice_runner', 'post_trigger_mantra'));
          return;
        }

        webNavigate('/en/mitra/dashboard');
        return;
      }

      if (stillStep === 2) {
        let mantraData = screenData._trigger_mantra_data as Record<string, any> | null;

        if (!mantraData) {
          const res = await fetchSuggestions(2);
          const mantraSuggestion = (res?.suggestions || []).find((s: any) => s?.type === 'mantra');
          if (mantraSuggestion) {
            mantraData = {
              ...(mantraSuggestion.core || {}),
              wisdom: mantraSuggestion.context,
              item_id: mantraSuggestion.item_id || mantraSuggestion.id,
            };
          }
        }

        void apiTrackEvent('trigger_still_feeling', {
          journey_id: screenData.journey_id,
          day_number: screenData.day_number || 1,
          step: 2,
          feeling: stillFeeling,
          next_step: 'mantra',
        });

        if (mantraData) {
          dispatch(updateScreenData({
            _trigger_mantra_data: mantraData,
            runner_active_item: {
              ...mantraData,
              source: 'support',
              is_trigger: true,
              item_type: 'mantra',
            },
            runner_variant: 'mantra',
            runner_source: 'support_trigger',
            runner_reps_completed: 0,
            runner_start_time: Date.now(),
            runner_duration_actual_sec: 0,
            mantra_text: mantraData.iast || mantraData.title || 'OM',
            mantra_devanagari: mantraData.devanagari || 'ॐ',
            mantra_audio_url: mantraData.audio_url || '',
            trigger_mantra_text: mantraData.iast || mantraData.title || 'OM',
            trigger_mantra_devanagari: mantraData.devanagari || 'ॐ',
            trigger_step: 3,
            _trigger_negative_label: _triggerNegativeLabel(stillFeeling, 3),
          }));
          webNavigate(_containerToPath('practice_runner', 'post_trigger_mantra'));
        } else {
          webNavigate('/en/mitra/dashboard');
        }
        return;
      }

      void apiTrackEvent('trigger_still_feeling_final', {
        journey_id: screenData.journey_id,
        day_number: screenData.day_number || 1,
        feeling: stillFeeling,
      });
      dispatch(updateScreenData({
        dashboard_return_modal:
          stillFeeling === 'agitated'
            ? {
                title: 'Stay with your breath',
                body: ['A softer rhythm may help your system settle.'],
                cta_label: 'Close',
              }
            : stillFeeling === 'drained'
              ? {
                  title: 'Stay with gentle steadiness',
                  body: ['You may need softness more than force right now.'],
                  cta_label: 'Close',
                }
              : {
                  title: 'Stay with your Sankalp',
                  body: [
                    'Small steps with sincerity create deep change.',
                    'Your Sankalp is your inner compass.',
                    'Stay consistent, it will help.',
                  ],
                  cta_label: 'Close',
                },
        trigger_mantra_text: null,
        trigger_mantra_devanagari: null,
      }));
      webNavigate('/en/mitra/dashboard');
      return;
    }

    case 'trigger_calmer_now': {
      const calmerStep = Number(screenData.trigger_step || 1);
      const calmerFeeling = (screenData.trigger_feeling as string) || 'triggered';

      void apiTrackEvent('trigger_resolved', {
        journey_id: screenData.journey_id,
        day_number: screenData.day_number || 1,
        step: calmerStep,
        feeling: calmerFeeling,
      });

      dispatch(updateScreenData({
        dashboard_return_modal: {
          title: 'Carry this steadiness',
          body: [
            'You returned to your center.',
            'Keep one simple anchor close as you move through the rest of your day.',
          ],
          cta_label: 'Close',
        },
        runner_active_item: null,
        runner_source: null,
        runner_variant: null,
        runner_reps_completed: null,
        runner_step_index: null,
        runner_duration_actual_sec: null,
        runner_start_time: null,
        runner_tz: null,
        trigger_mantra_text: null,
        trigger_mantra_devanagari: null,
      }));
      webNavigate('/en/mitra/dashboard');
      return;
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
      // Gate 6D — exit_tapped telemetry. Best-effort; fires before navigation.
      if (rId) {
        void trackRoomTelemetry({ event_type: 'exit_tapped', room_id: String(rId), surface: 'room' });
      }
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
      dispatch(updateScreenData({ checkpoint_submit_error: null }));
      try {
        void apiTrackEvent('checkpoint_completed', {
          journey_id: screenData.journey_id,
          day_number: screenData.day_number || day,
          meta: { decision, day },
        });

        const tz = _resolveMitraTz();
        let nextView: any = null;
        if (day === 7) {
          const day7FeelingMap: Record<string, string> = { continue: 'steady', lighten: 'heavy', reset: 'ready' };
          const result = await mitraJourneyDay7Decision(
            { decision, feeling: day7FeelingMap[decision] || '', tz },
            idempotencyKey,
          );
          nextView = result?.next_view;
        } else {
          const day14FeelingMap: Record<string, string> = { continue_same: 'steady', deepen: 'strong', change_focus: 'ready' };
          const deepenSuggestion = screenData.checkpoint_deepen_suggestion as any;
          const reflection = p.reflection ?? screenData.checkpoint_user_reflection ?? '';
          const sealRitual = p.sealRitual ?? '';
          const deepenFields = decision === 'deepen' && deepenSuggestion?.item_id
            ? { deepenItemType: deepenSuggestion.item_type, deepenItemId: deepenSuggestion.item_id, deepenAccepted: true }
            : {};
          const result = await mitraJourneyDay14Decision(
            {
              decision,
              feeling: day14FeelingMap[decision] || '',
              reflection,
              sealRitual,
              tz,
              ...deepenFields,
            },
            idempotencyKey,
          );
          nextView = result?.next_view;
          dispatch(updateScreenData({ checkpoint_completed: true }));
        }

        // Day 14 "change_focus" always re-enters onboarding
        if (day === 14 && decision === 'change_focus') {
          invalidateJourneyStatusCache();
          invalidateJourneyEntryViewCache();
          dispatch(updateScreenData({
            journey_id: null,
            day_number: null,
            total_days: null,
            path_cycle_number: null,
            arc_state: nextView?.payload?.arc_state ?? null,
            continuity: null,
            checkpoint_completed: true,
          }));
          _navigateToOnboarding(dispatch, 'turn_1');
          return;
        }

        if (nextView?.view_key === 'onboarding_start') {
          invalidateJourneyStatusCache();
          invalidateJourneyEntryViewCache();
          dispatch(updateScreenData({
            journey_id: null,
            day_number: null,
            total_days: null,
            path_cycle_number: null,
            arc_state: nextView?.payload?.arc_state ?? null,
            continuity: null,
            checkpoint_completed: true,
          }));
          _navigateToOnboarding(dispatch, 'turn_1');
          return;
        }

        if (nextView?.payload) {
          const flat = ingestDailyView(nextView.payload);
          dispatch(updateScreenData(flat));
        }

        // Mobile parity: day 14 continue_same/deepen both hydrate next cycle payload
        // and return directly to dashboard. change_focus already routed above.
        if (day === 14) {
          invalidateJourneyStatusCache();
          invalidateJourneyEntryViewCache();
          _setCheckpointRedirectBypass();
          webNavigate('/en/mitra/dashboard');
        } else {
          invalidateJourneyStatusCache();
          invalidateJourneyEntryViewCache();
          _setCheckpointRedirectBypass();
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
