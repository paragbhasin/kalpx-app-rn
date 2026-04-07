/**
 * actionExecutor.ts — Centralized action handler for the KalpX React Native app.
 *
 * Mirrors the Vue actionExecutor.js behavior. All user interactions flow through
 * executeAction() so that components never embed click logic directly.
 *
 * Architecture:
 *   Button press -> action object -> executeAction(action, context) -> state mutation + navigation
 *
 * Key invariants enforced here:
 *   INV-1: Flow-local state is cleaned up on every return to day_active
 *   INV-3: Runner context is cleared before starting a new flow
 *   INV-4: Trigger OM text is seeded before entering free_mantra_chanting
 *   INV-6: Flow instances are started/ended to track active flow lifecycle
 */

import { cleanupFlowState, GUARDED_ACTIONS } from './cleanupFields';
import { mitraTrackEvent, mitraTrackCompletion, mitraGenerateCompanion } from './mitraApi';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Navigation target — either a state_id string or a container+state pair. */
export interface ActionTarget {
  container_id: string;
  state_id: string;
}

/** An action object emitted by block components. */
export interface Action {
  type: string;
  target?: string | ActionTarget;
  payload?: Record<string, any>;
  /** Snapshot of the screen that emitted this action (used for context-aware logic). */
  currentScreen?: { id?: string; state_id?: string; container_id?: string };
}

/** Dependencies injected by the caller (typically from the Zustand store). */
export interface ActionContext {
  loadScreen: (target: string | ActionTarget) => void;
  goBack: () => void;
  setScreenValue: (value: any, key: string) => void;
  screenState: Record<string, any>;
  /** Start a named flow instance for lifecycle tracking (INV-6). */
  startFlowInstance?: (flowType: string) => void;
  /** End the active flow instance (INV-6). */
  endFlowInstance?: () => void;
}

// ---------------------------------------------------------------------------
// Duplicate-submission guard
// ---------------------------------------------------------------------------

let _actionInFlight = false;

// ---------------------------------------------------------------------------
// Helper: determine current flow type
// ---------------------------------------------------------------------------

/**
 * Returns true if the given state/container belongs to the prana check-in flow.
 */
function _isCheckinFlow(currentState: string | undefined, currentContainer: string | undefined): boolean {
  return (
    currentContainer === 'prana_checkin' ||
    currentState === 'quick_checkin' ||
    currentState === 'quick_checkin_ack' ||
    currentState === 'checkin_breath_reset'
  );
}

/**
 * Returns true if the given state/container belongs to the awareness trigger flow.
 */
function _isTriggerFlow(currentState: string | undefined, currentContainer: string | undefined): boolean {
  return (
    currentContainer === 'awareness_trigger' ||
    currentState === 'trigger_reflection' ||
    currentState === 'trigger_advice_reveal' ||
    currentState === 'trigger_recheck' ||
    currentState === 'post_trigger_mantra' ||
    currentState === 'free_mantra_chanting' ||
    currentState === 'post_trigger_reinforcement'
  );
}

// ---------------------------------------------------------------------------
// Helper: cleanup on return to Mitra Home (INV-1 + INV-6)
// ---------------------------------------------------------------------------

/**
 * Run INV-1 cleanup when navigating to day_active.
 * Clears flow-local state based on the source flow and ends the active flow instance.
 */
function _cleanupOnReturnHome(
  setScreenValue: (value: any, key: string) => void,
  screenState: Record<string, any>,
  endFlowInstance?: () => void,
): void {
  const currentState = screenState._currentStateId;
  const currentContainer = screenState._currentContainerId;

  if (_isCheckinFlow(currentState, currentContainer)) {
    cleanupFlowState('checkin', setScreenValue);
  } else if (_isTriggerFlow(currentState, currentContainer)) {
    cleanupFlowState('trigger', setScreenValue);
  } else {
    cleanupFlowState('all', setScreenValue);
  }

  if (endFlowInstance) {
    endFlowInstance();
  }
}

// ---------------------------------------------------------------------------
// Helper: simple local info data generator (replaces dynamicContentEngine for now)
// ---------------------------------------------------------------------------

interface InfoData {
  title: string;
  meaning: string;
  essence: string;
  benefits: string[];
  is_action: boolean;
  steps: string[];
  summary: string;
  deity: string;
  tradition: string;
  duration: string;
}

/**
 * Build a minimal info screen payload from master data.
 * This is a placeholder until dynamicContentEngine is ported to RN.
 */
function _generateInfoScreenData(type: string, masterData: Record<string, any>): InfoData | null {
  if (!masterData) return null;

  const isAction =
    type === 'practice' &&
    (masterData.steps?.length > 0 || masterData.tags?.includes('action'));

  return {
    title: masterData.title || masterData.iast || '',
    meaning: masterData.meaning || masterData.line || '',
    essence: masterData.essence || masterData.insight || masterData.summary || '',
    benefits: masterData.benefits || [],
    is_action: isAction,
    steps: masterData.steps || [],
    summary: masterData.summary || masterData.description || '',
    deity: masterData.deity || '',
    tradition: masterData.tradition || '',
    duration: masterData.duration || '',
  };
}

// ---------------------------------------------------------------------------
// Helper: resolve destination string from target
// ---------------------------------------------------------------------------

function _resolveDest(target: string | ActionTarget | undefined): string | undefined {
  if (!target) return undefined;
  return typeof target === 'string' ? target : target.state_id;
}

// ---------------------------------------------------------------------------
// Journey action logger
// ---------------------------------------------------------------------------

const SIGNIFICANT_ACTIONS = new Set([
  'navigate',
  'submit',
  'seal_day',
  'start_new_journey',
  'record_pause',
  'select_trigger_mantra',
  'view_info',
  'info_start_click',
]);

/**
 * Append a significant action to the per-day journey log stored in screenState.
 */
function _logJourneyAction(action: Action, context: ActionContext): void {
  const { type, payload, target } = action;
  if (!SIGNIFICANT_ACTIONS.has(type)) return;

  const { screenState, setScreenValue } = context;
  const currentDay = screenState.day_number || 1;
  const journeyLog = { ...(screenState.journey_log || {}) };
  const dayKey = `day_${currentDay}`;

  if (!journeyLog[dayKey]) {
    journeyLog[dayKey] = [];
  }

  let description = type;
  if (type === 'navigate' && target) {
    description = `Navigated to ${_resolveDest(target)}`;
  } else if (type === 'submit' && payload) {
    if (payload.practiceId) description = `Completed Practice: ${payload.practiceId}`;
    else if (payload.prana_type) description = `Checked-in Prana: ${payload.prana_type}`;
  } else if (type === 'view_info' && payload) {
    description = `Viewed Info for: ${payload.type}`;
  }

  journeyLog[dayKey].push({
    action: type,
    description,
    payload: payload || {},
    target: target || null,
    timestamp: new Date().toISOString(),
  });

  setScreenValue(journeyLog, 'journey_log');
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Execute an action emitted by a block component.
 *
 * @param action  — The action descriptor (type + target + payload).
 * @param context — Store bindings injected by the caller.
 */
export async function executeAction(action: Action, context: ActionContext): Promise<void> {
  const { type, target, payload } = action;
  const { loadScreen, goBack, setScreenValue, screenState, startFlowInstance, endFlowInstance } = context;

  // ── Duplicate-submission guard ──
  if (GUARDED_ACTIONS.has(type) && _actionInFlight) {
    console.log(`[GUARD] Action "${type}" blocked — previous action still in flight`);
    return;
  }
  if (GUARDED_ACTIONS.has(type)) {
    _actionInFlight = true;
    setScreenValue(true, '_isSubmitting');
  }

  try {
    // Log action for journey tracking
    _logJourneyAction(action, context);

    console.log(`[ACTION] Executing: ${type}`, action);

    switch (type) {
      // ================================================================
      // NAVIGATE — the most common action
      // ================================================================
      case 'navigate': {
        if (!target) break;

        const dest = _resolveDest(target);
        const currentContainer = action.currentScreen?.container_id;
        const currentState = action.currentScreen?.id || action.currentScreen?.state_id;

        // INV-6: Start flow instance when entering a runner
        if (startFlowInstance) {
          if (dest === 'mantra_runner' || dest === 'mantra_prep' || dest === 'mantra_rep_selection') {
            const isSupport =
              screenState._active_support_item ||
              currentContainer === 'awareness_trigger' ||
              currentContainer === 'prana_checkin';
            startFlowInstance(isSupport ? 'additional' : 'core_mantra');
          } else if (dest === 'sankalp_embody') {
            startFlowInstance('core_sankalp');
          } else if (dest === 'practice_step_runner') {
            const isSupport =
              screenState._active_support_item ||
              currentContainer === 'awareness_trigger' ||
              currentContainer === 'prana_checkin';
            startFlowInstance(isSupport ? 'support' : 'core_practice');
          } else if (dest === 'quick_practice_step_runner') {
            startFlowInstance('support');
          } else if (dest === 'post_trigger_mantra' || dest === 'free_mantra_chanting') {
            startFlowInstance('trigger');
          } else if (dest === 'anchor_timer') {
            startFlowInstance('core_practice');
          }
        }

        // Runner data seeding for practice/quick practice
        if (dest === 'practice_step_runner' || dest === 'quick_practice_step_runner') {
          const lastViewed = screenState._last_viewed_item;
          if (lastViewed && (dest === 'quick_practice_step_runner' || dest === 'post_trigger_mantra')) {
            const itemId = lastViewed.item_id || lastViewed.id;
            setScreenValue(
              { itemId, itemType: dest === 'post_trigger_mantra' ? 'mantra' : (lastViewed.item_type || 'practice'), source: 'support' },
              '_active_support_item',
            );
            setScreenValue(itemId, 'active_session_item_id');
          }
        }

        // Mantra support persistence
        if (dest === 'post_trigger_mantra') {
          const lastViewed = screenState._last_viewed_item;
          if (lastViewed) {
            setScreenValue(
              { itemId: lastViewed.item_id || lastViewed.id, itemType: 'mantra', source: 'support' },
              '_active_support_item',
            );
          }
        }

        // Track trigger flow milestones
        if (dest === 'trigger_reflection') {
          const eventName = currentState === 'breath_reset' ? 'breath_reset_completed' : 'sensory_grounding_completed';
          await mitraTrackEvent(eventName, {
            journeyId: screenState.journey_id,
            dayNumber: screenState.day_number || 1,
            meta: { duration_seconds: currentState === 'breath_reset' ? 45 : 60 },
          });
        }

        // Automatic completion tracking when navigating from runner to complete screen
        const destStr = dest || '';
        const destContainer = typeof target === 'string' ? '' : ((target as ActionTarget).container_id || '');
        const isRunner =
          currentState?.includes('runner') ||
          currentState?.includes('post_trigger_mantra') ||
          currentState?.includes('embody') ||
          currentState?.includes('selection') ||
          currentState === 'free_mantra_chanting';
        const isCompleteScreen =
          destStr.includes('complete') ||
          destStr.includes('confirm') ||
          destStr.includes('dashboard') ||
          destContainer.includes('dashboard');
        const activeSupport = screenState._active_support_item;

        if (isRunner && isCompleteScreen) {
          let itemId: string | null = null;
          let itemType: string | null = null;
          let source = 'core';

          if (activeSupport) {
            itemId = activeSupport.itemId;
            itemType = activeSupport.itemType;
            source = 'support';
          } else {
            const isSupportFlow =
              currentContainer === 'awareness_trigger' ||
              currentContainer === 'prana_checkin' ||
              currentState === 'breath_reset' ||
              currentState === 'sensory_grounding' ||
              currentState === 'post_trigger_mantra' ||
              currentState === 'quick_practice_step_runner';
            source = isSupportFlow ? 'support' : 'core';

            if (currentState === 'breath_reset') {
              itemId = 'practice.breath_reset';
              itemType = 'practice';
            } else if (currentState === 'sensory_grounding') {
              itemId = 'practice.sensory_grounding';
              itemType = 'practice';
            } else if (currentState === 'quick_practice_step_runner') {
              itemId = 'practice_anchor';
              itemType = 'practice';
              source = 'support';
            } else if (currentState?.includes('mantra') || currentState === 'post_trigger_mantra') {
              itemId = screenState.master_mantra?.id || screenState.trigger_mantra_id || 'practice_chant';
              itemType = 'mantra';
            } else if (currentState?.includes('sankalp')) {
              itemId = screenState.master_sankalp?.id || 'practice_embody';
              itemType = 'sankalp';
            } else if (currentState?.includes('practice')) {
              itemId = screenState.master_practice?.id || screenState.selected_practice_id || 'practice_act';
              itemType = 'practice';
            }
          }

          if (itemId && itemType) {
            const meta: Record<string, any> = {};
            if (source === 'support') {
              const durRaw = screenState.current_practice_duration || screenState.master_practice?.duration || '2 minutes';
              meta.duration_seconds = typeof durRaw === 'string' && durRaw.includes('minutes') ? parseInt(durRaw, 10) * 60 : 120;
            } else {
              if (itemType === 'mantra') meta.mantra_text = screenState.mantra_text;
              if (itemType === 'sankalp') meta.sankalp_text = screenState.sankalp_text;
              if (itemType === 'practice') {
                meta.practice_title = screenState.practice_title;
                const durRaw = screenState.current_practice_duration || screenState.master_practice?.duration || '2 minutes';
                meta.duration_seconds = typeof durRaw === 'string' && durRaw.includes('minutes') ? parseInt(durRaw, 10) * 60 : 120;
              }
            }

            await mitraTrackCompletion({
              itemType,
              itemId,
              source,
              journeyId: screenState.journey_id,
              dayNumber: screenState.day_number || 1,
              meta,
            });

            setScreenValue(true, '_completion_tracked_this_session');
            setScreenValue(true, `_tracked_${itemId}`);

            if (activeSupport) {
              setScreenValue(null, '_active_support_item');
            }
          }
        }

        // INV-1: Clear flow-local state when returning to Mitra Home
        if (dest === 'day_active') {
          _cleanupOnReturnHome(setScreenValue, screenState, endFlowInstance);
        }

        loadScreen(target);
        break;
      }

      // ================================================================
      // BACK — simple history pop
      // ================================================================
      case 'back': {
        goBack();
        break;
      }

      // ================================================================
      // INFO_BACK — context-aware back from info_reveal
      // ================================================================
      case 'info_back': {
        const backTarget = screenState.info_back_target || {
          container_id: 'companion_dashboard',
          state_id: 'day_active',
        };
        cleanupFlowState('all', setScreenValue);
        loadScreen(backTarget);
        break;
      }

      // ================================================================
      // SUBMIT — completion tracking + navigation
      // ================================================================
      case 'submit': {
        // Support flow cleanup: clear scoped trigger mantra on OM / support sessions
        if (
          payload?.itemId === 'OM' ||
          payload?.practiceId === 'OM' ||
          payload?.source === 'support' ||
          screenState._active_support_item?.source === 'support'
        ) {
          setScreenValue(null, 'trigger_mantra_text');
          setScreenValue(null, 'trigger_mantra_devanagari');
        }

        if (payload?.practiceId && payload?.completed) {
          const itemId = payload.practiceId;

          // Skip if already tracked on navigation to this screen
          if (screenState._completion_tracked_this_session) {
            if (target) loadScreen(target);
            return;
          }

          setScreenValue(true, itemId);

          const ITEM_TYPE_MAP: Record<string, string> = {
            practice_chant: 'mantra',
            practice_embody: 'sankalp',
            practice_act: 'practice',
            practice_anchor: 'practice',
            OM: 'mantra',
          };

          const activeSupport = screenState._active_support_item;
          const useSupportItem =
            activeSupport &&
            (itemId === 'practice_act' || itemId === 'OM' || itemId === activeSupport.itemId);

          const itemType =
            payload.itemType || (useSupportItem ? activeSupport.itemType : ITEM_TYPE_MAP[itemId]) || 'practice';
          const source = payload.source || (useSupportItem ? activeSupport.source : 'core');

          // Resolve authoritative Mitra item ID (priority chain)
          let finalItemId: string;
          if (useSupportItem) {
            finalItemId = activeSupport.itemId;
          } else if (itemType === 'mantra') {
            finalItemId =
              screenState.cycle_mantra_id ||
              screenState.mantra_id ||
              screenState.master_mantra?.id ||
              screenState.trigger_mantra_id ||
              itemId;
          } else if (itemType === 'sankalp') {
            finalItemId =
              screenState.cycle_sankalp_id ||
              screenState.sankalp_id ||
              screenState.master_sankalp?.id ||
              itemId;
          } else if (itemType === 'practice') {
            finalItemId =
              screenState.cycle_practice_id ||
              screenState.practice_id ||
              screenState.master_practice?.id ||
              screenState.selected_practice_id ||
              itemId;
          } else {
            finalItemId = itemId;
          }

          // Build rich meta per v3.5 spec
          const meta: Record<string, any> = { ...(payload.meta || {}) };
          if (source === 'support') {
            meta.duration_seconds = Math.round(
              screenState.chant_duration || screenState.current_practice_duration || 120,
            );
          } else {
            if (itemType === 'mantra') {
              meta.rep_count = screenState.reps_total || screenState.mantra_progress_reps || 0;
              meta.duration_seconds = Math.round(screenState.chant_duration || 0);
              if (screenState.mantra_text) meta.mantra_text = screenState.mantra_text;
            } else if (itemType === 'sankalp') {
              meta.duration_seconds = Math.round(
                screenState.chant_duration || screenState.current_practice_duration || 60,
              );
              if (screenState.sankalp_text) meta.sankalp_text = screenState.sankalp_text;
            } else if (itemType === 'practice') {
              meta.duration_seconds = Math.round(screenState.current_practice_duration || 120);
              if (screenState.practice_title) meta.practice_title = screenState.practice_title;
            }
          }

          await mitraTrackCompletion({
            itemType,
            itemId: finalItemId,
            source,
            journeyId: screenState.journey_id,
            dayNumber: screenState.day_number || 1,
            meta,
          });

          if (useSupportItem) {
            setScreenValue(null, '_active_support_item');
          }
        } else if (payload?.prana_type) {
          // Prana check-in — start checkin flow instance
          if (startFlowInstance) startFlowInstance('checkin');

          const counts = screenState.prana_checkin_counts || {};
          counts[payload.prana_type] = (counts[payload.prana_type] || 0) + 1;
          setScreenValue(counts, 'prana_checkin_counts');
          setScreenValue((screenState.prana_checkin_total || 0) + 1, 'prana_checkin_total');

          await mitraTrackEvent('checkin_acknowledged', {
            journeyId: screenState.journey_id,
            dayNumber: screenState.day_number || 1,
            meta: { prana_type: payload.prana_type },
          });
        } else if (payload?.focus) {
          setScreenValue(payload.focus, 'suggested_focus');
          setScreenValue(payload.focus, 'scan_focus');
        } else {
          console.log(`[SUBMIT] Unhandled payload: ${JSON.stringify(payload || 'no data')}`);
        }

        if (target) loadScreen(target);
        break;
      }

      // ================================================================
      // VIEW_INFO — build info screen data and navigate to info_reveal
      // ================================================================
      case 'view_info': {
        if (!payload) break;
        const { type: infoType, manualData, is_locked } = payload;
        const masterData = manualData || screenState[`master_${infoType}`];
        if (!masterData) break;

        const infoData = _generateInfoScreenData(infoType, masterData);
        if (!infoData) break;

        const isSupport =
          manualData?.source === 'support' ||
          payload.is_trigger ||
          action.currentScreen?.container_id === 'awareness_trigger' ||
          action.currentScreen?.container_id === 'prana_checkin';

        // Persist raw item data for runner
        setScreenValue(
          {
            id: manualData?.id || manualData?.item_id || masterData.id,
            item_id: manualData?.item_id || manualData?.id || masterData.id,
            item_type: manualData?.item_type || infoType,
            source: manualData?.source || (isSupport ? 'support' : 'core'),
          },
          '_last_viewed_item',
        );

        setScreenValue(infoData, 'info');

        // Start label
        const startLabelMap: Record<string, string> = {
          practice: infoData.is_action ? 'Begin Practice' : 'I Will Do This',
          mantra: 'Begin Chanting',
          sankalp: 'Embody This',
          Sankalpa: 'Embody This',
        };
        setScreenValue(payload.start_label || startLabelMap[infoType] || 'Begin', 'info_start_label');

        // Back label
        const currentContainerId = action.currentScreen?.container_id;
        const backLabel =
          payload.back_label || (currentContainerId === 'companion_dashboard' ? 'Return to Mitra Home' : 'Back');
        setScreenValue(backLabel, 'info_back_label');

        // Dynamic back target
        const currentStateId = action.currentScreen?.state_id || action.currentScreen?.id;
        if (currentContainerId === 'companion_dashboard' || currentStateId === 'day_active') {
          setScreenValue({ container_id: 'companion_dashboard', state_id: 'day_active' }, 'info_back_target');
        } else if (currentStateId === 'companion_analysis' || currentContainerId === 'cycle_transitions') {
          setScreenValue({ container_id: 'cycle_transitions', state_id: 'companion_analysis' }, 'info_back_target');
        } else {
          setScreenValue({ container_id: 'companion_dashboard', state_id: 'day_active' }, 'info_back_target');
        }

        setScreenValue(!!is_locked, 'info_is_locked');
        setScreenValue(!(is_locked || payload.read_only), 'show_info_start');
        setScreenValue(infoType === 'mantra', 'info_is_mantra');
        setScreenValue(infoType === 'sankalp' || infoType === 'Sankalpa', 'info_is_sankalp');
        setScreenValue(infoType === 'practice', 'info_is_practice');

        // Support flow handling
        if (isSupport) {
          const isPractice = (manualData?.item_type || infoType) === 'practice';
          const stateId = isPractice ? 'quick_practice_step_runner' : 'post_trigger_mantra';

          if (!isPractice) {
            const mText = manualData?.iast || manualData?.title || masterData.iast || masterData.title;
            const mDev = manualData?.devanagari || masterData.devanagari;
            if (mText) setScreenValue(mText, 'trigger_mantra_text');
            if (mDev) setScreenValue(mDev, 'trigger_mantra_devanagari');
          }

          const baseAction = payload.start_action || {
            type: 'navigate',
            target: { container_id: 'practice_runner', state_id: stateId },
          };
          setScreenValue(baseAction, 'info_start_action');
          setScreenValue(masterData, `master_${isPractice ? 'practice' : 'mantra'}`);
          setScreenValue(true, 'show_info_start');
        }

        // Practice-specific: set step state
        if (infoType === 'practice') {
          if (!payload.is_trigger && !payload.start_action) {
            const defaultStartAction = infoData.is_action
              ? { type: 'navigate', target: { container_id: 'practice_runner', state_id: 'practice_step_runner' } }
              : {
                  type: 'submit',
                  payload: { practiceId: 'practice_act', completed: true },
                  target: { container_id: 'companion_dashboard', state_id: 'day_active' },
                };
            setScreenValue(is_locked || payload.read_only ? null : defaultStartAction, 'info_start_action');
          } else if (payload.start_action) {
            setScreenValue(is_locked || payload.read_only ? null : payload.start_action, 'info_start_action');
          }

          setScreenValue(0, 'current_practice_step');
          setScreenValue(infoData.steps.length > 0 ? infoData.steps[0] : '', 'current_step_text');
          setScreenValue(infoData.steps.length > 1, 'show_next_button');
          setScreenValue(infoData.steps.length === 1, 'show_complete_button');
        } else if (!payload.is_trigger) {
          setScreenValue('', 'info_start_help_text');
          setScreenValue(is_locked || payload.read_only ? null : payload.start_action, 'info_start_action');
        }

        // Runner context (single source of truth)
        const activeItem = manualData || masterData;
        if (activeItem) {
          const itemSource = manualData ? (isSupport ? 'support' : 'additional') : 'core';
          setScreenValue(
            {
              item_type: infoType,
              source: itemSource,
              item_id: activeItem.item_id || activeItem.id || '',
              title: activeItem.title || activeItem.iast || '',
              deity: activeItem.deity || '',
              benefits: activeItem.benefits || [],
              iast: activeItem.iast || '',
              devanagari: activeItem.devanagari || '',
              meaning: activeItem.meaning || '',
              essence: activeItem.essence || '',
              audio_url: activeItem.audio_url || '',
              line: activeItem.line || '',
              insight: activeItem.insight || '',
              how_to_live: activeItem.how_to_live || [],
              summary: activeItem.summary || '',
              steps: activeItem.steps || [],
              duration: activeItem.duration || '',
              tradition: activeItem.tradition || '',
            },
            'runner_active_item',
          );
        }

        // Navigate to info reveal
        loadScreen({
          container_id: 'cycle_transitions',
          state_id: infoData.is_action ? 'info_reveal' : 'offering_reveal',
        });
        break;
      }

      // ================================================================
      // GENERATE_COMPANION — call Mitra API, unpack response into screenState
      // ================================================================
      case 'generate_companion': {
        const inputData = {
          focus: screenState.scan_focus || screenState.suggested_focus || 'peacecalm',
          sub_focus: screenState.prana_baseline_selection,
          baseline_metrics: screenState,
          depth: screenState.routine_depth || screenState.routine_setup || 'standard',
          intention: screenState.composer_intent,
          day_number: screenState.day_number || 1,
          re_analysis_friction: screenState.re_analysis_friction,
        };

        const data = await mitraGenerateCompanion(inputData);
        if (!data) {
          console.error('[ENGINE] No companion data received');
          setScreenValue(false, '_isSubmitting');
          return;
        }

        // Capture journey status and ID
        const previousJourneyId = screenState.journey_id;
        if (data.journey?.id) setScreenValue(data.journey.id, 'journey_id');
        if (data.journey?.dayNumber) setScreenValue(data.journey.dayNumber, 'day_number');
        if (data.journey?.totalDays) setScreenValue(data.journey.totalDays, 'total_days');

        // Track journey_started on new journey
        if (data.journey?.id && data.journey.id !== previousJourneyId) {
          mitraTrackEvent('journey_started', {
            journeyId: data.journey.id,
            dayNumber: data.journey.dayNumber || 1,
            meta: {
              focus: inputData.focus,
              subFocus: inputData.sub_focus,
              depth: inputData.depth,
              totalDays: data.journey.totalDays,
            },
          });
        }

        if (data.journey?.isLightened !== undefined) {
          setScreenValue(data.journey.isLightened, 'journey_is_lightened');
        }

        // Identity and path lifecycle
        setScreenValue(data.identityLabel || '', 'identity_label');
        setScreenValue(data.pathContext || {}, 'path_context');
        setScreenValue(data.pathMilestone || null, 'path_milestone');

        // Cycle item IDs (authoritative)
        if (data.journey?.cycleItems) {
          const ci = data.journey.cycleItems;
          if (ci.mantraId) setScreenValue(ci.mantraId, 'cycle_mantra_id');
          if (ci.sankalpId) setScreenValue(ci.sankalpId, 'cycle_sankalp_id');
          if (ci.practiceId) setScreenValue(ci.practiceId, 'cycle_practice_id');
        }

        // Extract and reveal companion data
        const companion = data.companion || data;

        // Intro and analysis metadata
        if (data.intro) setScreenValue(data.intro, 'analysis_intro');
        if (data.metricsSummary) setScreenValue(data.metricsSummary, 'analysis_metrics');
        if (data.insightText) setScreenValue(data.insightText, 'analysis_insight');

        // Practice / Ritual
        if (companion.practice || companion.ritual) {
          const p = companion.practice || companion.ritual;
          setScreenValue(p.ui?.card_title || p.title, 'card_ritual_title');
          setScreenValue(p.ui?.card_subtitle || p.description || p.core?.summary, 'card_ritual_description');
          setScreenValue(p.ui?.card_meta || p.meta, 'card_ritual_meta');
          setScreenValue(p.core?.title || p.title, 'practice_title');
          setScreenValue(p.ui?.card_meta || p.meta || p.core?.duration, 'practice_meta');
        }

        // Sankalpa
        if (companion.sankalp || companion.sankalpa) {
          const s = companion.sankalp || companion.sankalpa;
          setScreenValue(s.ui?.card_title || s.core?.title || '', 'card_sankalpa_title');
          setScreenValue(s.ui?.card_subtitle || s.description || s.core?.line, 'card_sankalpa_description');
          setScreenValue(s.ui?.card_meta || s.meta, 'card_sankalpa_meta');
          setScreenValue(s.core?.line || s.line, 'sankalp_text');
          setScreenValue(s.core?.title || s.line, 'sankalp_title');
        }

        // Mantra
        if (companion.mantra) {
          const m = companion.mantra;
          setScreenValue(m.ui?.card_title || m.title, 'card_mantra_title');
          setScreenValue(m.ui?.card_subtitle || m.description || m.core?.devanagari, 'card_mantra_description');
          setScreenValue(m.ui?.card_meta || m.meta, 'card_mantra_meta');
          setScreenValue(m.core?.title || m.line || m.title, 'mantra_text');
          setScreenValue(m.core?.iast || m.iast, 'mantra_iast');
          setScreenValue(m.core?.devanagari || m.devanagari || '', 'mantra_devanagari');
          setScreenValue(m.core?.title || m.title || m.iast, 'mantra_title');

          const resolvedMantraId = m.core?.item_id || m.core?.id || m.item_id || m.id;
          if (resolvedMantraId) setScreenValue(resolvedMantraId, 'mantra_id');
          if (m.ui?.deity_display) setScreenValue(m.ui.deity_display, 'mantra_deity_display');
        }

        setScreenValue(inputData.day_number, 'day_number');
        setScreenValue(inputData.focus, 'active_focus');
        setScreenValue(data.focusName || companion.focus_name, 'focus_name');
        setScreenValue(27, 'reps_total');
        setScreenValue(0, 'insight_step');

        // Extract Mitra IDs
        const getMitraId = (item: any) => item?.core?.item_id || item?.core?.id || item?.item_id || item?.id;

        if (companion.mantra) {
          const mid = getMitraId(companion.mantra);
          if (mid) setScreenValue(mid, 'mantra_id');
        }
        if (companion.sankalp || companion.sankalpa) {
          const sid = getMitraId(companion.sankalp || companion.sankalpa);
          if (sid) setScreenValue(sid, 'sankalp_id');
        }
        if (companion.practice) {
          const pid = getMitraId(companion.practice);
          if (pid) setScreenValue(pid, 'practice_id');
        }

        // Save master data for info screens
        setScreenValue(
          companion.mantra
            ? { ...companion.mantra.core, id: getMitraId(companion.mantra), wisdom: companion.mantra.context, type: 'mantra' }
            : data.masterData?.selectedMantra,
          'master_mantra',
        );
        setScreenValue(
          companion.sankalp || companion.sankalpa
            ? {
                ...(companion.sankalp || companion.sankalpa).core,
                id: getMitraId(companion.sankalp || companion.sankalpa),
                wisdom: (companion.sankalp || companion.sankalpa).context,
                type: 'sankalp',
              }
            : data.masterData?.selectedSankalp,
          'master_sankalp',
        );
        setScreenValue(
          companion.practice
            ? { ...companion.practice.core, id: getMitraId(companion.practice), wisdom: companion.practice.context, type: 'practice' }
            : data.masterData?.selectedPractice,
          'master_practice',
        );

        // Sankalp how_to_live
        if (companion.sankalp?.core?.how_to_live) {
          setScreenValue(companion.sankalp.core.how_to_live, 'sankalp_how_to_live');
        }
        // Practice benefit preview
        if (companion.practice?.ui?.benefit_preview) {
          setScreenValue(companion.practice.ui.benefit_preview, 'practice_benefit_preview');
        }
        // AI reasoning
        if (data.aiReasoning) {
          setScreenValue(data.aiReasoning, 'ai_reasoning');
        }

        // Dashboard enrichment
        const hub = data.hub || data.dashboard;
        if (hub) {
          if (hub.shift_message) setScreenValue(hub.shift_message, 'daily_shift_message');
          if (hub.streak_display) setScreenValue(hub.streak_display, 'streak_display');
          if (hub.completed_days !== undefined) setScreenValue(hub.completed_days, 'completed_days');
          if (hub.festival_today) setScreenValue(hub.festival_today, 'festival_today');
          if (hub.days_since_last_practice !== undefined) {
            setScreenValue(hub.days_since_last_practice, 'days_since_last_practice');
          }
        }

        // CTA
        if (data.cta) setScreenValue(data.cta, 'contextual_cta');

        // Navigate to reveal screen (unless skipReveal)
        if (!payload?.skipReveal) {
          loadScreen({ container_id: 'cycle_transitions', state_id: 'companion_analysis' });
        }
        break;
      }

      // ================================================================
      // INITIATE_TRIGGER — start OM chanting session (Flow 3, Step 1)
      // ================================================================
      case 'initiate_trigger': {
        // INV-6: Start trigger flow instance
        if (startFlowInstance) startFlowInstance('trigger');

        // INV-3: Clear prior runner context to prevent contamination
        setScreenValue(null, 'runner_active_item');

        // Initialize trigger session
        setScreenValue(1, 'trigger_cycle_count');

        await mitraTrackEvent('trigger_session_started', {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
        });

        // Scoped OM variables (do NOT overwrite global mantra_text)
        setScreenValue('OM', 'trigger_mantra_text');
        setScreenValue('\u0950', 'trigger_mantra_devanagari'); // ॐ

        // Set recovery target for "Try Another Way"
        setScreenValue(
          { container_id: 'awareness_trigger', state_id: 'trigger_reflection' },
          'free_chant_recovery_target',
        );

        setScreenValue(
          { itemId: 'OM', itemType: 'mantra', source: 'support' },
          '_active_support_item',
        );

        // Reset selection state
        setScreenValue(null, 'trigger_feeling_selection');
        setScreenValue('', 'trigger_sentiment_input');
        setScreenValue(null, 'selected_card_id');
        setScreenValue(false, 'show_start_trigger_mantra');

        // Reset trigger button state
        setScreenValue(true, 'is_trigger_share_disabled');
        setScreenValue('Share \u2192', 'trigger_share_btn_label');
        setScreenValue(true, 'is_recheck_btn_disabled');
        setScreenValue('Share \u2192', 'trigger_recheck_btn_label');

        console.log('[TRIGGER] Initiating OM Chanting session.');

        loadScreen({ container_id: 'practice_runner', state_id: 'free_mantra_chanting' });
        break;
      }

      // ================================================================
      // SEAL_DAY — advance day, track milestone, check for checkpoints
      // ================================================================
      case 'seal_day': {
        // Release guard early for parallel tracking
        _actionInFlight = false;

        const practicesDone = [
          screenState.practice_chant,
          screenState.practice_embody,
          screenState.practice_act,
        ].filter(Boolean).length;

        await mitraTrackEvent('day_sealed', {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {
            total_days: screenState.total_days,
            practices_done: practicesDone,
          },
        });

        const currentDay = screenState.day_number || 1;
        const nextDay = currentDay + 1;
        setScreenValue(nextDay, 'day_number');

        // Update cycle history for timeline
        const history = [...(screenState.cycle_history || [])];
        history.push({
          id: `day_${currentDay}`,
          date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          name: `Day ${currentDay}`,
          status: 'Completed',
          growth: '+1',
        });
        setScreenValue(history, 'cycle_history');

        // Clear practice completion for new day
        setScreenValue(false, 'practice_chant');
        setScreenValue(false, 'practice_embody');
        setScreenValue(false, 'practice_act');
        setScreenValue(false, '_completion_tracked_this_session');
        setScreenValue(0, 'trigger_cycle_count');

        // Check for checkpoints (Day 7 / Day 14)
        if (currentDay === 6 || currentDay === 14) {
          // Checkpoint will be handled when checkpoint actions are implemented
          console.log(`[MITRA] Checkpoint Day ${currentDay === 6 ? 7 : 14} — checkpoint handling TBD`);
          loadScreen({ container_id: 'cycle_transitions', state_id: 'weekly_checkpoint' });
        } else {
          loadScreen({ container_id: 'companion_dashboard', state_id: 'day_active' });
        }
        break;
      }

      // ================================================================
      // INFO_START_CLICK — guarded practice start from info screen
      // ================================================================
      case 'info_start_click': {
        const info = screenState.info;

        // For offerings: first click commits, second click finalizes
        if (info && !info.is_action && screenState.info_start_label === 'I Will Do This') {
          setScreenValue('Done', 'info_start_label');
          return;
        }

        // Execute the stored start action
        const startAction = screenState.info_start_action;
        if (startAction) {
          await executeAction(startAction, context);
        }
        break;
      }

      // ================================================================
      // TRACK_EVENT — fire a Mitra tracking event
      // ================================================================
      case 'track_event': {
        if (!payload) break;
        const { eventName, meta } = payload;
        await mitraTrackEvent(eventName, {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta,
        });
        if (target) {
          const trackDest = _resolveDest(target);
          if (trackDest === 'day_active') {
            _cleanupOnReturnHome(setScreenValue, screenState, endFlowInstance);
          }
          loadScreen(target);
        }
        break;
      }

      // ================================================================
      // STUBBED ACTIONS — not yet implemented in React Native
      // ================================================================
      case 'return_to_start':
      case 'confirm_deepen':
      case 'generate_help_me_choose':
      case 'evolve_path':
      case 'start_new_journey':
      case 'fast_track_baseline':
      case 'fast_track_companion':
      case 'alter_practices':
      case 'record_pause':
      case 'external_link':
      case 'next_practice_step':
      case 'process_trigger_feedback':
      case 'update_trigger_button':
      case 'update_recheck_button':
      case 'process_trigger_recheck':
      case 'trigger_mantra_suggestions':
      case 'select_trigger_mantra':
      case 'track_completion':
        console.warn(`[ACTION] "${action.type}" not yet implemented in RN`);
        break;

      default:
        console.warn(`[ACTION] Unknown action type: ${type}`);
    }
  } finally {
    // Release duplicate submit guard
    if (GUARDED_ACTIONS.has(type)) {
      _actionInFlight = false;
      setScreenValue(false, '_isSubmitting');
    }
  }
}
