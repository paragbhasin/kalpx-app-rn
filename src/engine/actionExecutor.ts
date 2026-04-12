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

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking } from "react-native";
import api from "../Networks/axios";
import { navigate as rootNavigate } from "../Shared/Routes/NavigationService";
import { cleanupFlowState, GUARDED_ACTIONS } from "./cleanupFields";
import {
  mitraCheckpoint,
  mitraGenerateCompanion,
  mitraHelpMeChoose,
  mitraPathEvolution,
  mitraPranaAcknowledge,
  mitraSubmitCheckpoint,
  mitraTrackCompletion,
  mitraTrackEvent,
  mitraTriggerMantras,
  postOnboardingTurn,
  patchCompanionState,
  getClearWindow,
} from "./mitraApi";

// Week 1 — friction chip → focus mapping. Web parity: actionExecutor.js FRICTION_MAP.
// Spec: route_welcome_onboarding.md §1 Turn 2-3, §6.
const FRICTION_TO_FOCUS: Record<string, { focus: string; label: string }> = {
  work_clarity: { focus: "clarity", label: "work clarity" },
  relationship: { focus: "connection", label: "relationship attention" },
  mind_quiet: { focus: "stillness", label: "busy mind" },
  uncertain: { focus: "grounding", label: "uncertainty" },
  low_energy: { focus: "vitality", label: "low energy" },
  searching_identity: { focus: "self_knowledge", label: "self-inquiry" },
  spiritual: { focus: "devotion", label: "spiritual longing" },
};

const STATE_LABEL_MAP: Record<string, string> = {
  activated: "Activated.",
  drained: "Drained.",
  foggy: "Foggy.",
  heavy: "Heavy.",
  restless: "Restless.",
  clear_but_full: "Clear but full.",
};

// ---------------------------------------------------------------------------
// Audio Rotation
// ---------------------------------------------------------------------------

const AUDIO_S3_BASE =
  "https://kalpx-dev-website.s3.us-east-2.amazonaws.com/audio";

/** OM audio library — add new files here as they're uploaded to S3 */
const OM_AUDIO_LIBRARY = [
  `${AUDIO_S3_BASE}/om/Om.mp4`,
  `${AUDIO_S3_BASE}/om/Om Shanti.mp4`,
  `${AUDIO_S3_BASE}/om/Hari Om -Female.mp4`,
];

/** Calming practice music library — add new files here */
export const CALM_MUSIC_LIBRARY = [
  `${AUDIO_S3_BASE}/calm/Audio-calmmusic.mp3`,
  `${AUDIO_S3_BASE}/calm/Audio1.mpeg`,
  `${AUDIO_S3_BASE}/calm/Audio9.mpeg`,
  `${AUDIO_S3_BASE}/calm/Audio6.mpeg`,
];

/**
 * Synchronous audio rotation. Returns the next URL immediately so callers
 * can set screen state BEFORE loadScreen (web parity, actionExecutor.js:3095).
 * The AsyncStorage write is fire-and-forget and hydrates a module cache on
 * first load so rotation offsets persist across launches.
 */
const _rotationCache: Record<string, number> = {};

(async () => {
  try {
    for (const key of ["_kalpx_om_audio_idx", "_kalpx_calm_audio_idx"]) {
      const stored = await AsyncStorage.getItem(key);
      if (stored != null) _rotationCache[key] = parseInt(stored, 10);
    }
  } catch (_) {
    /* best effort */
  }
})();

function _rotateAudio(library: string[], storageKey: string): string {
  if (!library || library.length === 0) return "";
  const lastIdx = _rotationCache[storageKey] ?? -1;
  const nextIdx = (lastIdx + 1) % library.length;
  _rotationCache[storageKey] = nextIdx;
  AsyncStorage.setItem(storageKey, String(nextIdx)).catch(() => {});
  return library[nextIdx];
}

function _omTextForTrack(url: string) {
  if (url.includes("Hari Om")) return { label: "Hari Om", devanagari: "हरि ॐ" };
  if (url.includes("Om Shanti"))
    return {
      label: "Om Shanti Shanti Shanti",
      devanagari: "ॐ शान्तिः शान्तिः शान्तिः",
    };
  return { label: "OM", devanagari: "ॐ" };
}

function _triggerNegativeLabel(feeling: string, step: number): string {
  if (step <= 2) return "Try another way";
  const labels: Record<string, string> = {
    triggered: "I still feel triggered",
    agitated: "I still feel agitated",
    drained: "I still feel drained",
  };
  return labels[feeling] || "I still feel unsettled";
}

function _mitraTz(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
}

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
function _isCheckinFlow(
  currentState: string | undefined,
  currentContainer: string | undefined,
): boolean {
  return (
    currentContainer === "prana_checkin" ||
    currentState === "quick_checkin" ||
    currentState === "quick_checkin_ack" ||
    currentState === "checkin_breath_reset"
  );
}

/**
 * Returns true if the given state/container belongs to the awareness trigger flow.
 */
function _isTriggerFlow(
  currentState: string | undefined,
  currentContainer: string | undefined,
): boolean {
  return (
    currentContainer === "awareness_trigger" ||
    currentState === "trigger_reflection" ||
    currentState === "trigger_advice_reveal" ||
    currentState === "trigger_recheck" ||
    currentState === "post_trigger_mantra" ||
    currentState === "free_mantra_chanting" ||
    currentState === "post_trigger_reinforcement"
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
    cleanupFlowState("checkin", setScreenValue);
  } else if (_isTriggerFlow(currentState, currentContainer)) {
    cleanupFlowState("trigger", setScreenValue);
  } else {
    cleanupFlowState("all", setScreenValue);
  }

  if (endFlowInstance) {
    endFlowInstance();
  }
}

// ---------------------------------------------------------------------------
// Helper: simple local info data generator (replaces dynamicContentEngine for now)
// ---------------------------------------------------------------------------

interface InfoData {
  type: string;
  title: string;
  subtitle: string;
  meaning: string;
  essence: string;
  benefits: string[];
  is_action: boolean;
  steps: string[];
  summary: string;
  insight: string;
  deity: string;
  tradition: string;
  duration: string;
  iast?: string;
  devanagari?: string;
  full_mantra?: string;
  audio_url?: string;
  how_to_live?: string[];
}

/**
 * Build a minimal info screen payload from master data.
 * This is a placeholder until dynamicContentEngine is ported to RN.
 */
function _generateInfoScreenData(
  type: string,
  masterData: Record<string, any>,
): InfoData | null {
  if (!masterData) return null;

  const isAction =
    type === "practice" &&
    (masterData.steps?.length > 0 || masterData.tags?.includes("action"));

  return {
    type,
    title: masterData.title || masterData.iast || "",
    subtitle:
      masterData.subtitle || masterData.devanagari || masterData.hindi || "",
    meaning: masterData.meaning || masterData.line || "",
    essence:
      masterData.essence || masterData.insight || masterData.summary || "",
    benefits: masterData.benefits || [],
    is_action: isAction,
    steps: masterData.steps || [],
    summary: masterData.summary || masterData.description || "",
    insight: masterData.insight || "",
    deity: masterData.deity || "",
    tradition: masterData.tradition || "",
    duration: masterData.duration || "",
    iast: masterData.iast || "",
    devanagari: masterData.devanagari || masterData.hindi || "",
    full_mantra:
      masterData.full_mantra ||
      masterData.subtitle ||
      masterData.devanagari ||
      "",
    audio_url: masterData.audio_url || "",
    how_to_live: masterData.how_to_live || masterData.steps || [],
  };
}

// ---------------------------------------------------------------------------
// Helper: resolve destination string from target
// ---------------------------------------------------------------------------

function _resolveDest(
  target: string | ActionTarget | undefined,
): string | undefined {
  if (!target) return undefined;
  return typeof target === "string" ? target : target.state_id;
}

// ---------------------------------------------------------------------------
// Journey action logger
// ---------------------------------------------------------------------------

const SIGNIFICANT_ACTIONS = new Set([
  "navigate",
  "submit",
  "seal_day",
  "start_new_journey",
  "record_pause",
  "select_trigger_mantra",
  "view_info",
  "info_start_click",
]);

/**
 * Append a significant action to the per-day journey log stored in screenState.
 */
function _logJourneyAction(action: Action, context: ActionContext): void {
  const { type, payload, target } = action;
  if (!SIGNIFICANT_ACTIONS.has(type)) return;

  const { screenState, setScreenValue } = context;
  const currentDay = screenState.day_number || 1;
  const existingLog = screenState.journey_log || {};
  const dayKey = `day_${currentDay}`;

  // Deep copy to avoid mutating frozen Redux state
  const journeyLog: Record<string, any[]> = {};
  for (const key of Object.keys(existingLog)) {
    journeyLog[key] = [...(existingLog[key] || [])];
  }
  if (!journeyLog[dayKey]) {
    journeyLog[dayKey] = [];
  }

  let description = type;
  if (type === "navigate" && target) {
    description = `Navigated to ${_resolveDest(target)}`;
  } else if (type === "submit" && payload) {
    if (payload.practiceId)
      description = `Completed Practice: ${payload.practiceId}`;
    else if (payload.prana_type)
      description = `Checked-in Prana: ${payload.prana_type}`;
  } else if (type === "view_info" && payload) {
    description = `Viewed Info for: ${payload.type}`;
  }

  journeyLog[dayKey].push({
    action: type,
    description,
    payload: payload || {},
    target: target || null,
    timestamp: new Date().toISOString(),
  });

  setScreenValue(journeyLog, "journey_log");
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
export async function executeAction(
  action: Action,
  context: ActionContext,
): Promise<void> {
  const { type, target, payload } = action;
  const {
    loadScreen,
    goBack,
    setScreenValue,
    screenState,
    startFlowInstance,
    endFlowInstance,
  } = context;

  // ── Duplicate-submission guard ──
  if (GUARDED_ACTIONS.has(type) && _actionInFlight) {
    console.log(
      `[GUARD] Action "${type}" blocked — previous action still in flight`,
    );
    return;
  }
  if (GUARDED_ACTIONS.has(type)) {
    _actionInFlight = true;
    setScreenValue(true, "_isSubmitting");
  }

  try {
    // Log action for journey tracking
    _logJourneyAction(action, context);

    console.log(`[ACTION] Executing: ${type}`, action);

    switch (type) {
      // ================================================================
      // SET_STATE — simple state setter (used by on_complete to set flags)
      // ================================================================
      case "set_state": {
        const { field, value } = action as any;
        if (field) setScreenValue(value, field);
        _actionInFlight = false;
        break;
      }

      // ================================================================
      // NAVIGATE — the most common action
      // ================================================================
      case "navigate": {
        if (!target) break;

        const dest = _resolveDest(target);
        const currentContainer = action.currentScreen?.container_id;
        const currentState =
          action.currentScreen?.id || action.currentScreen?.state_id;

        // INV-6: Start flow instance when entering a runner
        if (startFlowInstance) {
          if (
            dest === "mantra_runner" ||
            dest === "mantra_prep" ||
            dest === "mantra_rep_selection"
          ) {
            const isSupport =
              screenState._active_support_item ||
              currentContainer === "awareness_trigger" ||
              currentContainer === "prana_checkin";
            startFlowInstance(isSupport ? "additional" : "core_mantra");
          } else if (dest === "sankalp_embody") {
            startFlowInstance("core_sankalp");
          } else if (dest === "practice_step_runner") {
            const isSupport =
              screenState._active_support_item ||
              currentContainer === "awareness_trigger" ||
              currentContainer === "prana_checkin";
            startFlowInstance(isSupport ? "support" : "core_practice");
          } else if (dest === "quick_practice_step_runner") {
            startFlowInstance("support");
          } else if (
            dest === "post_trigger_mantra" ||
            dest === "free_mantra_chanting"
          ) {
            startFlowInstance("trigger");
          } else if (dest === "anchor_timer") {
            startFlowInstance("core_practice");
          }
        }

        // Runner data seeding for practice/quick practice
        if (
          dest === "practice_step_runner" ||
          dest === "quick_practice_step_runner"
        ) {
          const lastViewed = screenState._last_viewed_item;
          if (
            lastViewed &&
            ((dest as string) === "quick_practice_step_runner" ||
              (dest as string) === "post_trigger_mantra")
          ) {
            const itemId = lastViewed.item_id || lastViewed.id;
            setScreenValue(
              {
                itemId,
                itemType:
                  (dest as string) === "post_trigger_mantra"
                    ? "mantra"
                    : lastViewed.item_type || "practice",
                source: "support",
              },
              "_active_support_item",
            );
            setScreenValue(itemId, "active_session_item_id");
          }
        }

        // Mantra support persistence
        if (dest === "post_trigger_mantra") {
          const lastViewed = screenState._last_viewed_item;
          if (lastViewed) {
            setScreenValue(
              {
                itemId: lastViewed.item_id || lastViewed.id,
                itemType: "mantra",
                source: "support",
              },
              "_active_support_item",
            );
          }
        }

        // Track trigger flow milestones
        if (dest === "trigger_reflection") {
          const eventName =
            currentState === "breath_reset"
              ? "breath_reset_completed"
              : "sensory_grounding_completed";
          await mitraTrackEvent(eventName, {
            journeyId: screenState.journey_id,
            dayNumber: screenState.day_number || 1,
            meta: {
              duration_seconds: currentState === "breath_reset" ? 45 : 60,
            },
          });
        }

        // Automatic completion tracking when navigating from runner to complete screen
        const destStr = dest || "";
        const destContainer =
          typeof target === "string"
            ? ""
            : (target as ActionTarget).container_id || "";
        const isRunner =
          currentState?.includes("runner") ||
          currentState?.includes("post_trigger_mantra") ||
          currentState?.includes("embody") ||
          currentState?.includes("selection") ||
          currentState === "free_mantra_chanting";
        const isCompleteScreen =
          destStr.includes("complete") ||
          destStr.includes("confirm") ||
          destStr.includes("dashboard") ||
          destContainer.includes("dashboard");
        const activeSupport = screenState._active_support_item;

        if (isRunner && isCompleteScreen) {
          let itemId: string | null = null;
          let itemType: string | null = null;
          let source = "core";

          if (activeSupport) {
            itemId = activeSupport.itemId;
            itemType = activeSupport.itemType;
            source = "support";
          } else {
            const isSupportFlow =
              currentContainer === "awareness_trigger" ||
              currentContainer === "prana_checkin" ||
              currentState === "breath_reset" ||
              currentState === "sensory_grounding" ||
              currentState === "post_trigger_mantra" ||
              currentState === "quick_practice_step_runner";
            source = isSupportFlow ? "support" : "core";

            if (currentState === "breath_reset") {
              itemId = "practice.breath_reset";
              itemType = "practice";
            } else if (currentState === "sensory_grounding") {
              itemId = "practice.sensory_grounding";
              itemType = "practice";
            } else if (currentState === "quick_practice_step_runner") {
              itemId = "practice_anchor";
              itemType = "practice";
              source = "support";
            } else if (
              currentState?.includes("mantra") ||
              currentState === "post_trigger_mantra"
            ) {
              itemId =
                screenState.master_mantra?.id ||
                screenState.trigger_mantra_id ||
                "practice_chant";
              itemType = "mantra";
            } else if (currentState?.includes("sankalp")) {
              itemId = screenState.master_sankalp?.id || "practice_embody";
              itemType = "sankalp";
            } else if (currentState?.includes("practice")) {
              itemId =
                screenState.master_practice?.id ||
                screenState.selected_practice_id ||
                "practice_act";
              itemType = "practice";
            }
          }

          if (itemId && itemType) {
            const meta: Record<string, any> = {};
            if (source === "support") {
              const durRaw =
                screenState.current_practice_duration ||
                screenState.master_practice?.duration ||
                "2 minutes";
              meta.duration_seconds =
                typeof durRaw === "string" && durRaw.includes("minutes")
                  ? parseInt(durRaw, 10) * 60
                  : 120;
            } else {
              if (itemType === "mantra")
                meta.mantra_text = screenState.mantra_text;
              if (itemType === "sankalp")
                meta.sankalp_text = screenState.sankalp_text;
              if (itemType === "practice") {
                meta.practice_title = screenState.practice_title;
                const durRaw =
                  screenState.current_practice_duration ||
                  screenState.master_practice?.duration ||
                  "2 minutes";
                meta.duration_seconds =
                  typeof durRaw === "string" && durRaw.includes("minutes")
                    ? parseInt(durRaw, 10) * 60
                    : 120;
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

            // Web parity (actionExecutor.js:1113-1127): when a support item
            // completes inside a check-in flow, fire checkin_support_completed
            // so the check-in funnel can distinguish "acknowledged only" from
            // "acknowledged and did support practice".
            if (
              source === "support" &&
              _isCheckinFlow(currentState, currentContainer)
            ) {
              mitraTrackEvent("checkin_support_completed", {
                journeyId: screenState.journey_id,
                dayNumber: screenState.day_number || 1,
                meta: {
                  prana_type: screenState.current_prana_type,
                  itemType,
                  itemId,
                },
              });
            }

            setScreenValue(true, "_completion_tracked_this_session");
            setScreenValue(true, `_tracked_${itemId}`);

            if (activeSupport) {
              setScreenValue(null, "_active_support_item");
            }
          }
        }

        // INV-1: Clear flow-local state when returning to Mitra Home
        if (dest === "day_active") {
          _cleanupOnReturnHome(setScreenValue, screenState, endFlowInstance);
        }

        loadScreen(target);
        break;
      }

      // ================================================================
      // BACK — simple history pop
      // ================================================================
      case "back": {
        goBack();
        break;
      }

      // ================================================================
      // INFO_BACK — context-aware back from info_reveal
      // ================================================================
      case "info_back": {
        const backTarget = screenState.info_back_target || {
          container_id: "companion_dashboard",
          state_id: "day_active",
        };
        cleanupFlowState("all", setScreenValue);
        loadScreen(backTarget);
        break;
      }

      // ================================================================
      // SUBMIT — completion tracking + navigation
      // ================================================================
      case "submit": {
        const { itemId } = payload || {}; // note: target is already destructured at top of executeAction
        let finalTarget = target;
        const submitCurrentState =
          action.currentScreen?.id || action.currentScreen?.state_id;

        // Web parity (actionExecutor.js:2674-2707): handle lifecycle
        // events that submit via payload.type — session_started,
        // session_abandoned, trigger_session_abandoned,
        // trigger_resolved_after_support. These are tracked without the
        // main completion path (no mitraTrackCompletion call).
        if (payload?.type === "session_started") {
          mitraTrackEvent("session_started", {
            journeyId: screenState.journey_id,
            dayNumber: screenState.day_number || 1,
            meta: {
              itemType: payload.itemType,
              itemId: payload.itemId,
              source: payload.source,
              runnerType: payload.runnerType,
            },
          });
          if (target) loadScreen(target);
          break;
        }
        if (payload?.type === "session_abandoned") {
          mitraTrackEvent("session_abandoned", {
            journeyId: screenState.journey_id,
            dayNumber: screenState.day_number || 1,
            meta: {
              itemType: payload.itemType,
              itemId: payload.itemId,
              source: payload.source,
              runnerType: payload.runnerType,
              repsCompleted: payload.repsCompleted || 0,
              durationSeconds: payload.durationSeconds || 0,
            },
          });
          if (target) loadScreen(target);
          break;
        }
        if (payload?.type === "trigger_session_abandoned") {
          mitraTrackEvent("trigger_session_abandoned", {
            journeyId: screenState.journey_id,
            dayNumber: screenState.day_number || 1,
            meta: { exitedFrom: submitCurrentState },
          });
          _cleanupOnReturnHome(setScreenValue, screenState, endFlowInstance);
          if (target) loadScreen(target);
          break;
        }
        if (payload?.type === "trigger_resolved_after_support") {
          mitraTrackEvent("trigger_resolved_after_support", {
            journeyId: screenState.journey_id,
            dayNumber: screenState.day_number || 1,
            meta: { exitedFrom: "post_trigger_mantra" },
          });
          setScreenValue(null, "trigger_mantra_text");
          setScreenValue(null, "trigger_mantra_devanagari");
          if (target) loadScreen(target);
          break;
        }

        // Support flow cleanup: clear scoped trigger mantra on OM / support sessions
        if (
          payload?.itemId === "OM" ||
          payload?.practiceId === "OM" ||
          payload?.source === "support" ||
          screenState._active_support_item?.source === "support"
        ) {
          setScreenValue(null, "trigger_mantra_text");
          setScreenValue(null, "trigger_mantra_devanagari");
        }

        if (payload?.practiceId && payload?.completed) {
          const itemId = payload.practiceId;

          // Skip if already tracked on navigation to this screen
          if (screenState._completion_tracked_this_session) {
            if (finalTarget) loadScreen(finalTarget);
            return;
          }

          setScreenValue(true, itemId);

          const ITEM_TYPE_MAP: Record<string, string> = {
            practice_chant: "mantra",
            practice_embody: "sankalp",
            practice_act: "practice",
            practice_anchor: "practice",
            OM: "mantra",
          };

          const activeSupport = screenState._active_support_item;
          const useSupportItem =
            activeSupport &&
            (itemId === "practice_act" ||
              itemId === "OM" ||
              itemId === activeSupport.itemId);

          const itemType =
            payload.itemType ||
            (useSupportItem ? activeSupport.itemType : ITEM_TYPE_MAP[itemId]) ||
            "practice";
          // Source priority: payload.source > activeSupport.source >
          // runner_active_item.source (for additional items) > "core"
          const source =
            payload.source ||
            (useSupportItem ? activeSupport.source : null) ||
            screenState.runner_active_item?.source ||
            "core";

          // Resolve authoritative Mitra item ID (priority chain)
          let finalItemId: string;
          if (useSupportItem) {
            finalItemId = activeSupport.itemId;
          } else if (itemType === "mantra") {
            finalItemId =
              screenState.cycle_mantra_id ||
              screenState.mantra_id ||
              screenState.master_mantra?.id ||
              screenState.trigger_mantra_id ||
              itemId;
          } else if (itemType === "sankalp") {
            finalItemId =
              screenState.cycle_sankalp_id ||
              screenState.sankalp_id ||
              screenState.master_sankalp?.id ||
              itemId;
          } else if (itemType === "practice") {
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
          if (source === "support") {
            meta.duration_seconds = Math.round(
              screenState.chant_duration ||
                screenState.current_practice_duration ||
                120,
            );
          } else {
            if (itemType === "mantra") {
              meta.rep_count =
                screenState.reps_total || screenState.mantra_progress_reps || 0;
              meta.duration_seconds = Math.round(
                screenState.chant_duration || 0,
              );
              if (screenState.mantra_text)
                meta.mantra_text = screenState.mantra_text;
            } else if (itemType === "sankalp") {
              meta.duration_seconds = Math.round(
                screenState.chant_duration ||
                  screenState.current_practice_duration ||
                  60,
              );
              if (screenState.sankalp_text)
                meta.sankalp_text = screenState.sankalp_text;
            } else if (itemType === "practice") {
              meta.duration_seconds = Math.round(
                screenState.current_practice_duration || 120,
              );
              if (screenState.practice_title)
                meta.practice_title = screenState.practice_title;
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
            setScreenValue(null, "_active_support_item");
          }
        } else if (payload?.prana_type) {
          // Prana check-in — start checkin flow instance
          if (startFlowInstance) startFlowInstance("checkin");
          console.log(`[CHECKIN] Processing prana type: ${payload.prana_type}`);

          // Determine navigation target (Override target if agitated/drained).
          // balanced/energized go to cycle_transitions > quick_checkin_ack
          // (web parity — actionExecutor.js:2831 uses the same container).
          finalTarget =
            payload.prana_type === "agitated" ||
            payload.prana_type === "drained"
              ? {
                  container_id: "practice_runner",
                  state_id: "checkin_breath_reset",
                }
              : target || {
                  container_id: "cycle_transitions",
                  state_id: "quick_checkin_ack",
                };

          const counts = { ...(screenState.prana_checkin_counts || {}) };
          counts[payload.prana_type] = (counts[payload.prana_type] || 0) + 1;
          setScreenValue(counts, "prana_checkin_counts");
          setScreenValue(
            (screenState.prana_checkin_total || 0) + 1,
            "prana_checkin_total",
          );

          // Web parity (actionExecutor.js:2279-2283): set next_insight_screen
          // so the {{next_insight_screen}} template in allContainers.js:4122
          // resolves to daily_insight_14 on Day 14 users. Without this, Day 14
          // users skip the daily_insight_14 milestone splash entirely and
          // jump straight to whatever the default target is.
          const checkinCurrentDay = screenState["day_number"] || 1;
          setScreenValue(
            checkinCurrentDay === 14 ? "daily_insight_14" : "daily_insight",
            "next_insight_screen",
          );

          // Call Prana Acknowledge API for all check-in feedback.
          // Pass full context (baselineMetrics + dayNumber) so the backend
          // can personalize suggestions (web parity, actionExecutor.js:2286).
          // Note: API expects `pranaType` (not `feeling`) per web contract.
          const pranaAckRes = await mitraPranaAcknowledge({
            pranaType: payload.prana_type,
            focus:
              screenState["scan_focus"] ||
              screenState["active_focus"] ||
              "peacecalm",
            subFocus: screenState["prana_baseline_selection"] || "",
            depth:
              screenState["routine_depth"] ||
              screenState["routine_setup"] ||
              "standard",
            baselineMetrics: screenState["baseline_metrics"] || {},
            dayNumber: screenState["day_number"] || 1,
            journeyId: screenState["journey_id"] || null,
            round: 2,
            locale: screenState["locale"] || "en",
            tz: _mitraTz(),
          });
          if (pranaAckRes?.insight) {
            setScreenValue(pranaAckRes.insight, "prana_ack_insight");
          }

          // Select rotated OM audio for check-in breath reset
          if (
            payload.prana_type === "agitated" ||
            payload.prana_type === "drained"
          ) {
            const checkinOmAudio = _rotateAudio(
              OM_AUDIO_LIBRARY,
              "_kalpx_om_audio_idx",
            );
            setScreenValue(checkinOmAudio, "_selected_om_audio");
            const { label, devanagari } = _omTextForTrack(checkinOmAudio);
            setScreenValue(label, "checkin_mantra_text");
            setScreenValue(devanagari, "checkin_mantra_devanagari");
            // Set trigger state for support flow
            setScreenValue(payload.prana_type, "trigger_feeling");
            setScreenValue(1, "trigger_step");
            setScreenValue(2, "trigger_cycle_count");
            // Clear stale trigger state
            setScreenValue(null, "trigger_mantra_text");
            setScreenValue(null, "trigger_mantra_devanagari");

            // Web parity (actionExecutor.js:2401-2405): fire check-in breath
            // reset event immediately when an agitated/drained user enters
            // the OM breath reset. Fire-and-forget — doesn't block loadScreen.
            mitraTrackEvent("checkin_breath_reset", {
              journeyId: screenState.journey_id,
              dayNumber: screenState.day_number || 1,
              meta: { prana_type: payload.prana_type },
            });
          }

          // checkin_ack copy per prana type
          const checkinAckCopy: Record<
            string,
            { headline: string; body: string; accent?: string }
          > = {
            balanced: {
              headline: "You are exactly where you need to be.",
              body: "There is a quiet steadiness within you.\nStay here. Let it deepen.",
              accent: "Nothing needs to be changed right now.",
            },
            energized: {
              headline: "Your energy is present and alive.",
              body: "Move with this energy, not against it.\nLet it carry your intention forward.",
              accent: "This is a good moment to carry your sankalp forward.",
            },
            agitated: {
              headline: "A gentler next step may help settle this.",
              body: "You do not need to push through this state. Choose one small support that helps bring your energy back into steadiness.",
              accent: "",
            },
            drained: {
              headline: "A nourishing next step may help restore you.",
              body: "You may not need more effort right now. Choose one small support that helps you return with more softness and steadiness.",
              accent: "",
            },
          };
          const ackCopy =
            checkinAckCopy[payload.prana_type] || checkinAckCopy.balanced!;
          setScreenValue(ackCopy.headline, "checkin_ack_headline");
          setScreenValue(ackCopy.body, "checkin_ack_body");
          setScreenValue(ackCopy.accent || "", "checkin_ack_accent");

          // Web parity (actionExecutor.js:2366-2374): differentiate between
          // ack-only (no support suggestions) and acknowledged (with support)
          // so funnel analytics can measure how often check-ins route into
          // support practices vs return-to-rhythm.
          const hasCheckinSuggestions =
            Array.isArray(pranaAckRes?.suggestions) &&
            pranaAckRes.suggestions.length > 0;
          const checkinEventName = hasCheckinSuggestions
            ? "checkin_acknowledged"
            : "checkin_ack_only";
          await mitraTrackEvent(checkinEventName, {
            journeyId: screenState.journey_id,
            dayNumber: screenState.day_number || 1,
            meta: { prana_type: payload.prana_type },
          });
        }

        if (finalTarget) {
          console.log(`[SUBMIT] Navigating to: ${JSON.stringify(finalTarget)}`);
          loadScreen(finalTarget);
        }
        break;
      }

      // ================================================================
      // VIEW_INFO — build info screen data and navigate to info_reveal
      // ================================================================
      case "view_info": {
        if (!payload) break;
        const infoType = (payload.type || "").toLowerCase();
        const { manualData, is_locked } = payload;
        const masterData = manualData || screenState[`master_${infoType}`];
        if (!masterData) break;

        const infoData = _generateInfoScreenData(infoType, masterData);
        if (!infoData) break;

        const isSupport =
          manualData?.source === "support" ||
          payload.is_trigger ||
          action.currentScreen?.container_id === "awareness_trigger" ||
          action.currentScreen?.container_id === "prana_checkin";

        // REG-015 / INV-12: core view_info MUST clear stale support context.
        // Without this, `_active_support_item` (and legacy `source`/
        // `_last_viewed_item`) from a prior trigger flow leaks into the next
        // core mantra screen and renders the "I feel calmer now" support
        // button inside a core runner.
        if (!isSupport) {
          setScreenValue(null, "_active_support_item");
          setScreenValue("", "source");
          // Also clear trigger flow-local state that should not influence
          // core screens (STATE_OWNERSHIP_MATRIX.md lines 106-108).
          setScreenValue(null, "trigger_mantra_text");
          setScreenValue(null, "trigger_mantra_devanagari");
          setScreenValue(null, "trigger_step");
          setScreenValue(null, "trigger_feeling");
        }

        // Persist raw item data for runner
        const resolvedSource =
          manualData?.source || (isSupport ? "support" : "core");
        setScreenValue(
          {
            id: manualData?.id || manualData?.item_id || masterData.id,
            item_id: manualData?.item_id || manualData?.id || masterData.id,
            item_type: manualData?.item_type || infoType,
            source: resolvedSource,
          },
          "_last_viewed_item",
        );

        // Additional items (library / custom) must populate runner_active_item
        // so the runner reads from the correct content source, and the submit
        // handler attributes engagement to source=additional_* (not "core").
        // Without this, the 4-tier source resolution in submit falls through
        // to "core" and additional-flow metrics are lost.
        // See audit C3 2026-04-10.
        const isAdditional =
          resolvedSource === "additional_library" ||
          resolvedSource === "additional_custom" ||
          resolvedSource === "additional";
        if (isAdditional && manualData) {
          setScreenValue(
            {
              ...manualData,
              id: manualData.id || manualData.item_id || masterData.id,
              item_id:
                manualData.item_id || manualData.id || masterData.id,
              item_type: manualData.item_type || infoType,
              source: resolvedSource,
              title: manualData.title || masterData.title || "",
              iast: manualData.iast || masterData.iast || "",
              devanagari:
                manualData.devanagari || masterData.devanagari || "",
              audio_url:
                manualData.audio_url || masterData.audio_url || "",
              steps: manualData.steps || masterData.steps || [],
            },
            "runner_active_item",
          );
        }

        setScreenValue(infoData, "info");

        // Start label
        const startLabelMap: Record<string, string> = {
          practice: infoData.is_action ? "Practice" : "I Will Do This",
          mantra: "Chant",
          sankalp: "Embody",
          sankalpa: "Embody",
        };
        setScreenValue(
          payload.start_label || startLabelMap[infoType] || "Begin",
          "info_start_label",
        );

        // Back label
        const currentContainerId = action.currentScreen?.container_id;
        const backLabel =
          payload.back_label ||
          (currentContainerId === "companion_dashboard"
            ? "Return to Mitra Home"
            : "Back");
        setScreenValue(backLabel, "info_back_label");

        // Dynamic back target
        const currentStateId =
          action.currentScreen?.state_id || action.currentScreen?.id;
        if (
          currentContainerId === "companion_dashboard" ||
          currentStateId === "day_active"
        ) {
          setScreenValue(
            { container_id: "companion_dashboard", state_id: "day_active" },
            "info_back_target",
          );
        } else if (
          currentStateId === "companion_analysis" ||
          currentContainerId === "cycle_transitions" ||
          currentContainerId === "insight_summary"
        ) {
          setScreenValue(
            { container_id: currentContainerId, state_id: currentStateId },
            "info_back_target",
          );
        } else {
          setScreenValue(
            { container_id: "companion_dashboard", state_id: "day_active" },
            "info_back_target",
          );
        }

        setScreenValue(!!is_locked, "info_is_locked");
        setScreenValue(!(is_locked || payload.read_only), "show_info_start");
        setScreenValue(infoType === "mantra", "info_is_mantra");
        setScreenValue(
          infoType === "sankalp" || infoType === "sankalpa",
          "info_is_sankalp",
        );
        setScreenValue(infoType === "practice", "info_is_practice");

        // Support flow handling
        if (isSupport) {
          const isPractice = (manualData?.item_type || infoType) === "practice";
          const stateId = isPractice
            ? "quick_practice_step_runner"
            : "post_trigger_mantra";

          if (!isPractice) {
            const mText =
              manualData?.iast ||
              manualData?.title ||
              masterData.iast ||
              masterData.title;
            const mDev = manualData?.devanagari || masterData.devanagari;
            if (mText) setScreenValue(mText, "trigger_mantra_text");
            if (mDev) setScreenValue(mDev, "trigger_mantra_devanagari");
          }

          const baseAction = payload.start_action || {
            type: "navigate",
            target: { container_id: "practice_runner", state_id: stateId },
          };
          setScreenValue(baseAction, "info_start_action");
          setScreenValue(
            masterData,
            `master_${isPractice ? "practice" : "mantra"}`,
          );
          setScreenValue(true, "show_info_start");
        }

        // Practice-specific: set step state
        if (infoType === "practice") {
          if (!payload.is_trigger && !payload.start_action) {
            const defaultStartAction = infoData.is_action
              ? {
                  type: "navigate",
                  target: {
                    container_id: "practice_runner",
                    state_id: "practice_step_runner",
                  },
                }
              : {
                  type: "submit",
                  payload: { practiceId: "practice_act", completed: true },
                  target: {
                    container_id: "companion_dashboard",
                    state_id: "day_active",
                  },
                };
            setScreenValue(
              is_locked || payload.read_only ? null : defaultStartAction,
              "info_start_action",
            );
          } else if (payload.start_action) {
            setScreenValue(
              is_locked || payload.read_only ? null : payload.start_action,
              "info_start_action",
            );
          }

          setScreenValue(0, "current_practice_step");
          setScreenValue(
            infoData.steps.length > 0 ? infoData.steps[0] : "",
            "current_step_text",
          );
          setScreenValue(infoData.steps.length > 1, "show_next_button");
          setScreenValue(infoData.steps.length === 1, "show_complete_button");
        } else if (!payload.is_trigger) {
          setScreenValue("", "info_start_help_text");

          let defaultStartAction = payload.start_action || null;
          if (!payload.start_action) {
            const typeKey = infoType.toLowerCase();
            if (typeKey === "mantra") {
              defaultStartAction = {
                type: "navigate",
                target: {
                  container_id: "practice_runner",
                  state_id: "mantra_rep_selection",
                },
              };
            } else if (typeKey === "sankalp" || typeKey === "sankalpa") {
              defaultStartAction = {
                type: "navigate",
                target: {
                  container_id: "practice_runner",
                  state_id: "sankalp_embody",
                },
              };
            } else if (typeKey === "practice") {
              defaultStartAction = {
                type: "navigate",
                target: {
                  container_id: "practice_runner",
                  state_id: "practice_step_runner",
                },
              };
            }
          }

          setScreenValue(
            is_locked || payload.read_only ? null : defaultStartAction,
            "info_start_action",
          );
        }

        // Runner context (single source of truth)
        const activeItem = manualData || masterData;
        if (activeItem) {
          const itemSource = manualData
            ? isSupport
              ? "support"
              : "additional"
            : "core";
          setScreenValue(
            {
              item_type: infoType,
              source: itemSource,
              item_id: activeItem.item_id || activeItem.id || "",
              title: activeItem.title || activeItem.iast || "",
              deity: activeItem.deity || "",
              benefits: activeItem.benefits || [],
              iast: activeItem.iast || "",
              devanagari: activeItem.devanagari || "",
              meaning: activeItem.meaning || "",
              essence: activeItem.essence || "",
              audio_url: activeItem.audio_url || "",
              line: activeItem.line || "",
              insight: activeItem.insight || "",
              how_to_live: activeItem.how_to_live || [],
              summary: activeItem.summary || "",
              steps: activeItem.steps || [],
              duration: activeItem.duration || "",
              tradition: activeItem.tradition || "",
            },
            "runner_active_item",
          );
        }

        // Navigate to info reveal
        loadScreen({
          container_id: "cycle_transitions",
          state_id: infoData.is_action ? "info_reveal" : "offering_reveal",
        });
        break;
      }

      // ================================================================
      // GENERATE_COMPANION — call Mitra API, unpack response into screenState
      // ================================================================
      case "generate_companion": {
        const inputData = {
          focus:
            screenState.scan_focus ||
            screenState.suggested_focus ||
            "peacecalm",
          sub_focus: screenState.prana_baseline_selection,
          baseline_metrics: screenState,
          depth:
            screenState.routine_depth ||
            screenState.routine_setup ||
            "standard",
          intention: screenState.composer_intent,
          day_number: screenState.day_number || 1,
          re_analysis_friction: screenState.re_analysis_friction,
        };

        const data = await mitraGenerateCompanion(inputData);
        if (!data) {
          // Use console.warn, NOT console.error: in dev builds console.error
          // triggers the RN LogBox red overlay which leaks into screenshot
          // captures (audit M2 — Day 14 intro screenshot flakiness). The
          // engine already has a graceful no-op fallback below (the checkpoint
          // / home orchestrators have their own data seeding paths), so this
          // is a recoverable warning, not a crash.
          console.warn(
            "[ENGINE] generate_companion returned no data — skipping companion seed",
          );
          setScreenValue(false, "_isSubmitting");
          return;
        }

        // Capture journey status and ID
        const previousJourneyId = screenState.journey_id;
        if (data.journey?.id) setScreenValue(data.journey.id, "journey_id");

        // REG-010 / Rule 12 (STATE_OWNERSHIP_MATRIX): Checkpoint context guard.
        // If a checkpoint is currently in flight (checkpoint_headline set),
        // do NOT overwrite day_number / identity_label / path_context — those
        // belong to the checkpoint screen, not the upcoming companion data.
        const _checkpointActive = !!screenState.checkpoint_headline;

        if (data.journey?.dayNumber && !_checkpointActive)
          setScreenValue(data.journey.dayNumber, "day_number");
        if (data.journey?.totalDays)
          setScreenValue(data.journey.totalDays, "total_days");

        // Track journey_started on new journey
        if (data.journey?.id && data.journey.id !== previousJourneyId) {
          mitraTrackEvent("journey_started", {
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
          setScreenValue(data.journey.isLightened, "journey_is_lightened");
        }

        // Identity and path lifecycle — guarded by checkpoint context (REG-010)
        if (!_checkpointActive) {
          setScreenValue(data.identityLabel || "", "identity_label");
          setScreenValue(data.pathContext || {}, "path_context");
          setScreenValue(data.pathMilestone || null, "path_milestone");
        }

        // Cycle item IDs (authoritative)
        if (data.journey?.cycleItems) {
          const ci = data.journey.cycleItems;
          if (ci.mantraId) setScreenValue(ci.mantraId, "cycle_mantra_id");
          if (ci.sankalpId) setScreenValue(ci.sankalpId, "cycle_sankalp_id");
          if (ci.practiceId) setScreenValue(ci.practiceId, "cycle_practice_id");
        }

        // Extract and reveal companion data
        const companion = data.companion || data;

        // Intro and analysis metadata
        if (data.intro) setScreenValue(data.intro, "analysis_intro");
        if (data.metricsSummary)
          setScreenValue(data.metricsSummary, "analysis_metrics");
        if (data.insightText)
          setScreenValue(data.insightText, "analysis_insight");

        // Practice / Ritual
        if (companion.practice || companion.ritual) {
          const p = companion.practice || companion.ritual;
          setScreenValue(p.ui?.card_title || p.title, "card_ritual_title");
          setScreenValue(
            p.ui?.card_subtitle || p.description || p.core?.summary,
            "card_ritual_description",
          );
          setScreenValue(p.ui?.card_meta || p.meta, "card_ritual_meta");
          setScreenValue(p.core?.title || p.title, "practice_title");
          setScreenValue(
            p.ui?.card_meta || p.meta || p.core?.duration,
            "practice_meta",
          );
        }

        // Sankalpa
        if (companion.sankalp || companion.sankalpa) {
          const s = companion.sankalp || companion.sankalpa;
          setScreenValue(
            s.ui?.card_title || s.core?.title || "",
            "card_sankalpa_title",
          );
          setScreenValue(
            s.ui?.card_subtitle || s.description || s.core?.line,
            "card_sankalpa_description",
          );
          setScreenValue(s.ui?.card_meta || s.meta, "card_sankalpa_meta");
          setScreenValue(s.core?.line || s.line, "sankalp_text");
          setScreenValue(s.core?.title || s.line, "sankalp_title");
        }

        // Mantra
        if (companion.mantra) {
          const m = companion.mantra;
          setScreenValue(m.ui?.card_title || m.title, "card_mantra_title");
          setScreenValue(
            m.ui?.card_subtitle || m.description || m.core?.devanagari,
            "card_mantra_description",
          );
          setScreenValue(m.ui?.card_meta || m.meta, "card_mantra_meta");
          setScreenValue(m.core?.title || m.line || m.title, "mantra_text");
          setScreenValue(m.core?.iast || m.iast, "mantra_iast");
          setScreenValue(
            m.core?.devanagari || m.devanagari || "",
            "mantra_devanagari",
          );
          setScreenValue(m.core?.title || m.title || m.iast, "mantra_title");
          setScreenValue(m.core?.audio_url || m.audio_url || "", "mantra_audio_url");

          const resolvedMantraId =
            m.core?.item_id || m.core?.id || m.item_id || m.id;
          if (resolvedMantraId) setScreenValue(resolvedMantraId, "mantra_id");
          if (m.ui?.deity_display)
            setScreenValue(m.ui.deity_display, "mantra_deity_display");
        }

        setScreenValue(inputData.day_number, "day_number");
        setScreenValue(inputData.focus, "active_focus");
        setScreenValue(data.focusName || companion.focus_name, "focus_name");
        setScreenValue(27, "reps_total");
        setScreenValue(0, "insight_step");

        // Extract Mitra IDs
        const getMitraId = (item: any) =>
          item?.core?.item_id || item?.core?.id || item?.item_id || item?.id;

        if (companion.mantra) {
          const mid = getMitraId(companion.mantra);
          if (mid) setScreenValue(mid, "mantra_id");
        }
        if (companion.sankalp || companion.sankalpa) {
          const sid = getMitraId(companion.sankalp || companion.sankalpa);
          if (sid) setScreenValue(sid, "sankalp_id");
        }
        if (companion.practice) {
          const pid = getMitraId(companion.practice);
          if (pid) setScreenValue(pid, "practice_id");
        }

        // Save master data for info screens
        setScreenValue(
          companion.mantra
            ? {
                ...companion.mantra.core,
                id: getMitraId(companion.mantra),
                wisdom: companion.mantra.context,
                type: "mantra",
              }
            : data.masterData?.selectedMantra,
          "master_mantra",
        );
        setScreenValue(
          companion.sankalp || companion.sankalpa
            ? {
                ...(companion.sankalp || companion.sankalpa).core,
                id: getMitraId(companion.sankalp || companion.sankalpa),
                wisdom: (companion.sankalp || companion.sankalpa).context,
                type: "sankalp",
              }
            : data.masterData?.selectedSankalp,
          "master_sankalp",
        );
        setScreenValue(
          companion.practice
            ? {
                ...companion.practice.core,
                id: getMitraId(companion.practice),
                wisdom: companion.practice.context,
                type: "practice",
              }
            : data.masterData?.selectedPractice,
          "master_practice",
        );

        // Sankalp how_to_live
        if (companion.sankalp?.core?.how_to_live) {
          setScreenValue(
            companion.sankalp.core.how_to_live,
            "sankalp_how_to_live",
          );
        }
        // Practice benefit preview
        if (companion.practice?.ui?.benefit_preview) {
          setScreenValue(
            companion.practice.ui.benefit_preview,
            "practice_benefit_preview",
          );
        }
        // AI reasoning
        if (data.aiReasoning) {
          setScreenValue(data.aiReasoning, "ai_reasoning");
        }

        // Dashboard enrichment
        const hub = data.hub || data.dashboard;
        if (hub) {
          if (hub.shift_message)
            setScreenValue(hub.shift_message, "daily_shift_message");
          if (hub.streak_display)
            setScreenValue(hub.streak_display, "streak_display");
          if (hub.completed_days !== undefined)
            setScreenValue(hub.completed_days, "completed_days");
          if (hub.festival_today)
            setScreenValue(hub.festival_today, "festival_today");
          if (hub.days_since_last_practice !== undefined) {
            setScreenValue(
              hub.days_since_last_practice,
              "days_since_last_practice",
            );
          }
        }

        // CTA
        if (data.cta) setScreenValue(data.cta, "contextual_cta");

        // ----------------------------------------------------------------
        // Week 2 — Day Active Dashboard enrichment (Moments 8-15, 40, 41, 43).
        // Spec: route_dashboard_day_active.md §2, §6. Populate briefing,
        // focus phrase, cycle_day, checkpoint_due, clear_window from the
        // generate-companion envelope (+ side-call to /clear-window/).
        // ----------------------------------------------------------------
        const briefing = data.briefing || data.morningBriefing || null;
        if (briefing) {
          setScreenValue(true, "briefing_available");
          setScreenValue(briefing.audio_url || briefing.audioUrl || "", "briefing_audio_url");
          setScreenValue(
            briefing.summary || briefing.opening_line || briefing.script?.slice(0, 140) || "",
            "briefing_summary",
          );
          setScreenValue(briefing.script || briefing.transcript || "", "briefing_transcript");
          setScreenValue(briefing.voice_preset || "anchor", "briefing_voice_preset");
        } else {
          setScreenValue(false, "briefing_available");
        }

        // Focus phrase — Phase 1.5 expansive phrase; fall back to dayType sub-header.
        const focusPhrase =
          data.focus_phrase || data.focusPhrase || data.dayTypeCopy?.subHeader || "";
        if (focusPhrase) setScreenValue(focusPhrase, "focus_phrase");

        // cycle_day — distinct screenData copy so the signal bar can read it
        // without stomping on day_number (which checkpoint logic also owns).
        if (data.journey?.dayNumber) {
          setScreenValue(data.journey.dayNumber, "cycle_day");
        }

        // Checkpoint-due enum (for variant selection)
        const dn = data.journey?.dayNumber;
        if (dn === 7) setScreenValue("day_7", "checkpoint_due");
        else if (dn === 14) setScreenValue("day_14", "checkpoint_due");
        else setScreenValue(null, "checkpoint_due");

        // Dashboard variant resolver — minimal shape; refined by server later.
        let variant: string = "standard";
        if (dn === 1) variant = "first_day";
        if (dn === 7) variant = "checkpoint_pending_day_7";
        if (dn === 14) variant = "checkpoint_pending_day_14";
        if (data.postConflict || data.dayType === "post_conflict_morning") {
          variant = "post_conflict_morning";
        }

        // Clear-window (Moment 43) — separate endpoint; fire-and-forget.
        try {
          const cw = await getClearWindow();
          if (cw && (cw.headline || cw.message)) {
            setScreenValue(cw, "clear_window");
            variant = "clear_window_active";
          } else {
            setScreenValue(null, "clear_window");
          }
        } catch (_e) {
          setScreenValue(null, "clear_window");
        }
        setScreenValue(variant, "dashboard_variant");

        // Navigate to the post-lock summary reveal (unless skipReveal)
        if (!payload?.skipReveal) {
          loadScreen({
            container_id: "insight_summary",
            state_id: "path_reveal",
          });
        }
        break;
      }

      // ================================================================
      // INITIATE_TRIGGER — start OM chanting session (Flow 3, Step 1)
      // ================================================================
      case "initiate_trigger": {
        // INV-6: Start trigger flow instance
        if (startFlowInstance) startFlowInstance("trigger");

        // INV-3: Clear prior runner context to prevent contamination
        setScreenValue(null, "runner_active_item");

        // Initialize trigger session
        setScreenValue(1, "trigger_cycle_count");
        setScreenValue("triggered", "trigger_feeling");
        setScreenValue(1, "trigger_step");

        // Select rotated OM audio for this session (SYNCHRONOUS — web parity).
        // Must run BEFORE the loadScreen call below so _selected_om_audio is
        // in state when PracticeRunnerContainer's audio useEffect fires.
        const triggerOmAudio = _rotateAudio(
          OM_AUDIO_LIBRARY,
          "_kalpx_om_audio_idx",
        );
        setScreenValue(triggerOmAudio, "_selected_om_audio");
        const { label: trigLabel, devanagari: trigDev } =
          _omTextForTrack(triggerOmAudio);
        setScreenValue(trigLabel, "trigger_mantra_text");
        setScreenValue(trigDev, "trigger_mantra_devanagari");

        // Fire-and-forget event tracking
        mitraTrackEvent("trigger_session_started", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
        });

        // Set recovery target for "Try Another Way"
        setScreenValue(
          { container_id: "awareness_trigger", state_id: "trigger_reflection" },
          "free_chant_recovery_target",
        );

        setScreenValue(
          { itemId: "OM", itemType: "mantra", source: "support" },
          "_active_support_item",
        );

        // Reset selection state
        setScreenValue(null, "trigger_feeling_selection");
        setScreenValue("", "trigger_sentiment_input");
        setScreenValue(null, "selected_card_id");
        setScreenValue(false, "show_start_trigger_mantra");

        // Reset trigger button state
        setScreenValue(true, "is_trigger_share_disabled");
        setScreenValue("Share \u2192", "trigger_share_btn_label");
        setScreenValue(true, "is_recheck_btn_disabled");
        setScreenValue("Share \u2192", "trigger_recheck_btn_label");

        console.log("[TRIGGER] Initiating OM Chanting session.");

        loadScreen({
          container_id: "practice_runner",
          state_id: "free_mantra_chanting",
        });
        break;
      }

      // ================================================================
      // TRY_ANOTHER_WAY — call API for trigger support suggestions
      // ================================================================
      case "try_another_way": {
        const tryFeeling = screenState["trigger_feeling"] || "uncertain";
        const tryRound = screenState["trigger_cycle_count"] || 1;

        const res = await mitraTriggerMantras({
          feeling: tryFeeling,
          focus:
            screenState["scan_focus"] ||
            screenState["active_focus"] ||
            "peacecalm",
          subFocus: screenState["prana_baseline_selection"] || "",
          depth:
            screenState["routine_depth"] ||
            screenState["routine_setup"] ||
            "standard",
          round: tryRound,
          locale: screenState["locale"] || "en",
          tz: _mitraTz(),
        });
        const suggestions = res.suggestions || [];

        const practiceSuggestion = suggestions.find(
          (s: any) => s.type === "practice" || (s.core && s.core.steps),
        );
        const mantraSuggestion = suggestions.find(
          (s: any) => s.type === "mantra" || (s.core && !s.core.steps),
        );

        if (practiceSuggestion) {
          setScreenValue(
            {
              ...practiceSuggestion.core,
              wisdom: practiceSuggestion.context,
              item_id: practiceSuggestion.item_id || practiceSuggestion.id,
            },
            "_trigger_practice_data",
          );
          const pCore = practiceSuggestion.core || {};
          setScreenValue(
            {
              ...pCore,
              wisdom: practiceSuggestion.context,
              source: "support",
              is_trigger: true,
              item_id: practiceSuggestion.item_id || practiceSuggestion.id,
              item_type: "practice",
              steps_text: (pCore.steps || [])
                .map((s: string, i: number) => `${i + 1}. ${s}`)
                .join("\n"),
              benefits_text: (pCore.benefits || [])
                .map((b: string) => `• ${b}`)
                .join("\n"),
            },
            "runner_active_item",
          );
        }
        if (mantraSuggestion) {
          setScreenValue(
            {
              ...mantraSuggestion.core,
              wisdom: mantraSuggestion.context,
              item_id: mantraSuggestion.item_id || mantraSuggestion.id,
            },
            "_trigger_mantra_data",
          );
        }

        setScreenValue(2, "trigger_step");
        setScreenValue(
          _triggerNegativeLabel(tryFeeling, 2),
          "_trigger_negative_label",
        );

        // Track the try-another tap (web parity — actionExecutor.js:3207)
        mitraTrackEvent("trigger_try_another", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {
            feeling: tryFeeling,
            round: tryRound,
            hasPractice: !!practiceSuggestion,
            hasMantra: !!mantraSuggestion,
          },
        });

        if (practiceSuggestion) {
          loadScreen({
            container_id: "practice_runner",
            state_id: "trigger_practice_runner",
          });
        } else if (mantraSuggestion) {
          setScreenValue(3, "trigger_step");
          setScreenValue(
            _triggerNegativeLabel(tryFeeling, 3),
            "_trigger_negative_label",
          );
          setScreenValue(
            mantraSuggestion.core?.iast || mantraSuggestion.core?.title || "OM",
            "trigger_mantra_text",
          );
          setScreenValue(
            mantraSuggestion.core?.devanagari || "ॐ",
            "trigger_mantra_devanagari",
          );
          setScreenValue(
            mantraSuggestion.core?.audio_url || "",
            "_selected_om_audio",
          );
          loadScreen({
            container_id: "practice_runner",
            state_id: "post_trigger_mantra",
          });
        } else {
          loadScreen({
            container_id: "companion_dashboard",
            state_id: "day_active",
          });
        }
        break;
      }

      // ================================================================
      // TRIGGER_CALMER_NOW — user feels calmer, resolve trigger flow
      // ================================================================
      case "trigger_calmer_now": {
        const calmerStep = screenState["trigger_step"] || 1;
        const calmerFeeling = screenState["trigger_feeling"] || "triggered";

        mitraTrackEvent("trigger_resolved", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {
            step: calmerStep,
            feeling: calmerFeeling,
            resolution: "calmer_now",
          },
        });

        setScreenValue(
          {
            message:
              "You returned to your center. Carry this steadiness with you.",
            type: "calmer",
          },
          "_trigger_resolution_toast",
        );

        setScreenValue(null, "trigger_mantra_text");
        setScreenValue(null, "trigger_mantra_devanagari");

        loadScreen({
          container_id: "companion_dashboard",
          state_id: "day_active",
        });
        break;
      }

      // ================================================================
      // TRIGGER_STILL_FEELING — user still feels triggered, escalate
      // ================================================================
      case "trigger_still_feeling": {
        // Default step 2 matches web actionExecutor.js:3270. initiate_trigger
        // still sets trigger_step=1 explicitly; this default only kicks in
        // on state drift (e.g., user navigates back then forward).
        const stillStep = screenState["trigger_step"] || 2;
        const stillFeeling = screenState["trigger_feeling"] || "triggered";

        console.log(
          `[TRIGGER] Escalating from Step ${stillStep}. Feeling: ${stillFeeling}`,
        );

        if (stillStep === 1) {
          // First escalation: Call API and show Practice DIRECTLY
          const res = await mitraTriggerMantras({
            feeling: stillFeeling,
            focus:
              screenState["scan_focus"] ||
              screenState["active_focus"] ||
              "peacecalm",
            subFocus: screenState["prana_baseline_selection"] || "",
            depth:
              screenState["routine_depth"] ||
              screenState["routine_setup"] ||
              "standard",
            round: 1,
            locale: screenState["locale"] || "en",
            tz: _mitraTz(),
          });

          const suggestions = res?.suggestions || [];
          const practiceSuggestion = suggestions.find(
            (s: any) => s.type === "practice",
          );
          const mantraSuggestion = suggestions.find(
            (s: any) => s.type === "mantra",
          );

          // Persist both for the sequence
          if (practiceSuggestion) {
            setScreenValue(practiceSuggestion.core, "_trigger_practice_data");
          }
          if (mantraSuggestion) {
            setScreenValue(mantraSuggestion.core, "_trigger_mantra_data");
          }

          if (practiceSuggestion) {
            const pCore = practiceSuggestion.core || {};
            setScreenValue(
              {
                ...pCore,
                wisdom: practiceSuggestion.context,
                source: "support",
                is_trigger: true,
                item_id: pCore.item_id || pCore.id,
                item_type: "practice",
                steps_text: (pCore.steps || [])
                  .map((s: string, i: number) => `${i + 1}. ${s}`)
                  .join("\n"),
                benefits_text: (pCore.benefits || [])
                  .map((b: string) => `• ${b}`)
                  .join("\n"),
              },
              "runner_active_item",
            );

            setScreenValue(2, "trigger_step");
            setScreenValue(
              _triggerNegativeLabel(stillFeeling, 2),
              "_trigger_negative_label",
            );
            loadScreen({
              container_id: "practice_runner",
              state_id: "trigger_practice_runner",
            });
          } else if (mantraSuggestion) {
            // Fallback directly to mantra if no practice found
            const mCore = mantraSuggestion.core || {};
            setScreenValue(
              mCore.iast || mCore.title || "OM",
              "trigger_mantra_text",
            );
            setScreenValue(
              mCore.devanagari || "ॐ",
              "trigger_mantra_devanagari",
            );
            setScreenValue(mCore.audio_url || "", "_selected_om_audio");
            setScreenValue(
              {
                ...mCore,
                source: "support",
                is_trigger: true,
                item_type: "mantra",
              },
              "runner_active_item",
            );

            setScreenValue(3, "trigger_step");
            setScreenValue(
              _triggerNegativeLabel(stillFeeling, 3),
              "_trigger_negative_label",
            );
            loadScreen({
              container_id: "practice_runner",
              state_id: "post_trigger_mantra",
            });
          } else {
            loadScreen({
              container_id: "companion_dashboard",
              state_id: "day_active",
            });
          }
        } else if (stillStep === 2) {
          // Second escalation: Show Mantra DIRECTLY (pre-fetched or fetch if missing)
          let mantraData = screenState["_trigger_mantra_data"];

          if (!mantraData) {
            const res = await mitraTriggerMantras({
              feeling: stillFeeling,
              focus:
                screenState["scan_focus"] ||
                screenState["active_focus"] ||
                "peacecalm",
              round: 2,
              locale: screenState["locale"] || "en",
              tz: _mitraTz(),
            });
            const mantraSuggestion = (res?.suggestions || []).find(
              (s: any) => s.type === "mantra",
            );
            if (mantraSuggestion) {
              mantraData = mantraSuggestion.core;
              setScreenValue(mantraData, "_trigger_mantra_data");
            }
          }

          mitraTrackEvent("trigger_still_feeling", {
            journeyId: screenState.journey_id,
            dayNumber: screenState.day_number || 1,
            meta: { step: 2, feeling: stillFeeling, nextStep: "mantra" },
          });

          setScreenValue(3, "trigger_step");
          setScreenValue(
            _triggerNegativeLabel(stillFeeling, 3),
            "_trigger_negative_label",
          );

          if (mantraData) {
            setScreenValue(
              mantraData.iast || mantraData.title || "OM",
              "trigger_mantra_text",
            );
            setScreenValue(
              mantraData.devanagari || "ॐ",
              "trigger_mantra_devanagari",
            );
            setScreenValue(mantraData.audio_url || "", "_selected_om_audio");
            setScreenValue(
              {
                ...mantraData,
                source: "support",
                is_trigger: true,
                item_type: "mantra",
              },
              "runner_active_item",
            );
            loadScreen({
              container_id: "practice_runner",
              state_id: "post_trigger_mantra",
            });
          } else {
            loadScreen({
              container_id: "companion_dashboard",
              state_id: "day_active",
            });
          }
        } else {
          // Final escalation: Return to Dashboard with encouragement
          mitraTrackEvent("trigger_still_feeling_final", {
            journeyId: screenState.journey_id,
            dayNumber: screenState.day_number || 1,
            meta: {
              step: 3,
              feeling: stillFeeling,
              resolution: "encourage_core",
            },
          });

          setScreenValue(
            {
              message:
                "Stay close to your sankalp, mantra, and practice — they are your anchors.",
              type: "encourage",
            },
            "_trigger_resolution_toast",
          );

          setScreenValue(null, "trigger_mantra_text");
          setScreenValue(null, "trigger_mantra_devanagari");

          loadScreen({
            container_id: "companion_dashboard",
            state_id: "day_active",
          });
        }
        break;
      }

      // ================================================================
      // SEAL_DAY — advance day, track milestone, check for checkpoints
      // ================================================================
      case "seal_day": {
        // Release guard early for parallel tracking
        _actionInFlight = false;

        const practicesDone = [
          screenState.practice_chant,
          screenState.practice_embody,
          screenState.practice_act,
        ].filter(Boolean).length;

        await mitraTrackEvent("day_sealed", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {
            total_days: screenState.total_days,
            practices_done: practicesDone,
          },
        });

        const currentDay = screenState.day_number || 1;
        const nextDay = currentDay + 1;
        setScreenValue(nextDay, "day_number");

        // Update cycle history for timeline
        const history = [...(screenState.cycle_history || [])];
        history.push({
          id: `day_${currentDay}`,
          date: new Date().toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          }),
          name: `Day ${currentDay}`,
          status: "Completed",
          growth: "+1",
        });
        setScreenValue(history, "cycle_history");

        // Clear practice completion for new day
        setScreenValue(false, "practice_chant");
        setScreenValue(false, "practice_embody");
        setScreenValue(false, "practice_act");
        setScreenValue(false, "_completion_tracked_this_session");
        setScreenValue(0, "trigger_cycle_count");

        // Check for checkpoints (Day 7 / Day 14)
        if (currentDay === 6 || currentDay === 14) {
          // Checkpoint will be handled when checkpoint actions are implemented
          console.log(
            `[MITRA] Checkpoint Day ${currentDay === 6 ? 7 : 14} — checkpoint handling TBD`,
          );
          loadScreen({
            container_id: "cycle_transitions",
            state_id: "weekly_checkpoint",
          });
        } else {
          loadScreen({
            container_id: "companion_dashboard",
            state_id: "day_active",
          });
        }
        break;
      }

      // ================================================================
      // INFO_START_CLICK — guarded practice start from info screen
      // ================================================================
      case "info_start_click": {
        const info = screenState.info;

        // For offerings: first click commits, second click finalizes
        if (
          info &&
          !info.is_action &&
          screenState.info_start_label === "I Will Do This"
        ) {
          setScreenValue("Done", "info_start_label");
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
      case "track_event": {
        if (!payload) break;
        const { eventName, meta } = payload;
        await mitraTrackEvent(eventName, {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta,
        });
        // Web parity: when checkin_breath_reset_completed is tracked,
        // also fire checkin_resolved_after_breath_reset as a secondary
        // event so analytics can distinguish the breath_reset completion
        // from resolution (matches actionExecutor.js:3571-3577).
        if (eventName === "checkin_breath_reset_completed") {
          mitraTrackEvent("checkin_resolved_after_breath_reset", {
            journeyId: screenState.journey_id,
            dayNumber: screenState.day_number || 1,
            meta: { prana_type: screenState.current_prana_type },
          });
        }
        if (target) {
          const trackDest = _resolveDest(target);
          if (trackDest === "day_active") {
            _cleanupOnReturnHome(setScreenValue, screenState, endFlowInstance);
          }
          loadScreen(target);
        }
        break;
      }

      // ================================================================
      // RETURN_TO_START — navigate back to portal / onboarding
      // ================================================================
      case "return_to_start": {
        loadScreen({ container_id: "portal", state_id: "portal" });
        rootNavigate("AppDrawer", {
          screen: "HomePage",
          params: {
            screen: "HomePage",
            params: {
              screen: "Home",
            },
          },
        });
        break;
      }

      // ================================================================
      // CONFIRM_DEEPEN — set 108 reps and show confirmation
      // ================================================================
      case "confirm_deepen": {
        setScreenValue(108, "reps_total");
        setScreenValue("108 Reps", "practice_chant_meta");
        loadScreen({
          container_id: "cycle_transitions",
          state_id: "deepen_confirmation",
        });
        break;
      }

      // ================================================================
      // GENERATE_HELP_ME_CHOOSE — AI-guided path selection
      // ================================================================
      case "generate_help_me_choose": {
        const hmcInput = {
          friction: screenState.help_me_choose_1,
          intention: screenState.help_me_choose_2,
          isReanalysis: !!screenState.scan_focus,
        };

        const hmcData = await mitraHelpMeChoose(hmcInput);
        if (!hmcData) break;

        setScreenValue(hmcData.intro, "help_me_choose_intro");
        setScreenValue(hmcData.analysisText, "help_me_choose_analysis");
        setScreenValue(hmcData.buttonLabel, "help_me_choose_button_label");

        const hmcNextAction = hmcData.isReanalysis
          ? {
              type: "evolve_path",
              payload: { newFocus: hmcData.suggestedFocus },
            }
          : {
              type: "fast_track_baseline",
              payload: { focus: hmcData.suggestedFocus },
            };

        setScreenValue(hmcNextAction, "help_me_choose_button_action");

        loadScreen({
          container_id: "cycle_transitions",
          state_id: "help_me_choose_reveal",
        });
        break;
      }

      // ================================================================
      // EVOLVE_PATH — path evolution narrative on focus change
      // ================================================================
      case "evolve_path": {
        const epNewFocus = payload?.newFocus;
        const epOldFocus = screenState.scan_focus || "peacecalm";

        const epData = await mitraPathEvolution(
          epOldFocus,
          epNewFocus || "peacecalm",
        );

        if (epData?.evolutionText) {
          setScreenValue(epData.evolutionText, "path_evolution_text");
        }
        setScreenValue(epNewFocus, "scan_focus");
        setScreenValue(epNewFocus, "suggested_focus");

        loadScreen({
          container_id: "cycle_transitions",
          state_id: "path_evolution_reveal",
        });
        break;
      }

      // ================================================================
      // START_NEW_JOURNEY — reset state and begin fresh
      // ================================================================
      case "start_new_journey": {
        // Clear all state for a fresh journey
        const snjTarget = payload?.target || "discipline_select";
        // Reset key journey fields
        setScreenValue(null, "journey_id");
        setScreenValue(1, "day_number");
        setScreenValue({}, "journey_log");
        setScreenValue(false, "practice_chant");
        setScreenValue(false, "practice_embody");
        setScreenValue(false, "practice_act");
        setScreenValue(false, "_completion_tracked_this_session");
        setScreenValue(null, "scan_focus");
        setScreenValue(null, "suggested_focus");
        setScreenValue(null, "master_mantra");
        setScreenValue(null, "master_sankalp");
        setScreenValue(null, "master_practice");
        setScreenValue(null, "identity_label");
        setScreenValue(null, "path_context");
        setScreenValue(null, "path_milestone");
        cleanupFlowState("all", setScreenValue);
        loadScreen(snjTarget);
        break;
      }

      // ================================================================
      // FAST_TRACK_BASELINE — skip to baseline with chosen focus
      // ================================================================
      case "fast_track_baseline": {
        const ftbFocus = payload?.focus;
        if (ftbFocus) {
          setScreenValue(ftbFocus, "scan_focus");
          setScreenValue(ftbFocus, "suggested_focus");
        }
        loadScreen({ container_id: "stable_scan", state_id: "prana_baseline" });
        break;
      }

      // ================================================================
      // FAST_TRACK_COMPANION — load pre-cached companion data
      // ================================================================
      case "fast_track_companion": {
        const ftcFocus = payload?.focus;
        const ftcFriction = screenState.help_me_choose_1;
        const ftcIntention = screenState.help_me_choose_2;

        const ftcInput = {
          focus: ftcFocus,
          feelings: [ftcFriction || "restless"],
          depth: "standard",
          intention: ftcIntention || "Seek growth and clarity.",
        };

        if (ftcFocus) {
          setScreenValue(ftcFocus, "scan_focus");
          setScreenValue(ftcFocus, "suggested_focus");
        }

        const ftcData = await mitraGenerateCompanion(ftcInput);
        if (!ftcData) break;

        if (ftcData.intro) setScreenValue(ftcData.intro, "analysis_intro");
        if (ftcData.metricsSummary)
          setScreenValue(ftcData.metricsSummary, "analysis_metrics");
        if (ftcData.insightText)
          setScreenValue(ftcData.insightText, "analysis_insight");

        // Extract companion items
        const ftcCompanion = ftcData.companion || ftcData;

        if (ftcCompanion.ritual || ftcCompanion.practice) {
          const r = ftcCompanion.ritual || ftcCompanion.practice;
          setScreenValue(
            r.title || r.ui?.card_title,
            "card_ritual_description",
          );
          setScreenValue(r.meta || r.ui?.card_meta, "card_ritual_meta");
        }
        if (ftcCompanion.sankalpa || ftcCompanion.sankalp) {
          const s = ftcCompanion.sankalpa || ftcCompanion.sankalp;
          setScreenValue(
            s.line || s.core?.line || s.ui?.card_subtitle,
            "card_sankalpa_description",
          );
        }
        if (ftcCompanion.mantra) {
          setScreenValue(
            ftcCompanion.mantra.line ||
              ftcCompanion.mantra.core?.devanagari ||
              ftcCompanion.mantra.ui?.card_subtitle,
            "card_mantra_description",
          );
        }

        setScreenValue(ftcData.identityLabel || "", "identity_label");
        setScreenValue(ftcData.pathContext || {}, "path_context");
        setScreenValue(ftcData.pathMilestone || null, "path_milestone");

        loadScreen({
          container_id: "insight_summary",
          state_id: "path_reveal",
        });
        break;
      }

      // ================================================================
      // ALTER_PRACTICES — Day 14 practice alteration
      // ================================================================
      case "alter_practices": {
        const apDirection = payload?.direction || "alter";
        try {
          const alterRes = await api.post("user-journey/alter-practice/", {
            direction: apDirection,
            feeling: screenState.checkpoint_feeling || "",
            newCategory: payload?.newCategory || "",
            newSubFocus: payload?.newSubFocus || "",
            newLevel: payload?.newLevel || "",
          });

          const alterData = alterRes.data;
          console.log("[MITRA] alter-practice response:", alterData);

          if (!alterData.allowed) {
            setScreenValue(alterData.message, "alter_blocked_message");
            setScreenValue(alterData.reason, "alter_blocked_reason");
            loadScreen({
              container_id: "companion_dashboard",
              state_id: "day_active",
            });
            break;
          }

          // Allowed — reset for new cycle
          setScreenValue(true, "alter_practices_mode");
          setScreenValue(1, "day_number");
          setScreenValue({}, "journey_log");
          setScreenValue(false, "checkpoint_completed");

          if (alterData.journey?.cycleItems) {
            setScreenValue(
              alterData.journey.cycleItems.mantraId,
              "cycle_mantra_id",
            );
            setScreenValue(
              alterData.journey.cycleItems.practiceId,
              "cycle_practice_id",
            );
            setScreenValue(
              alterData.journey.cycleItems.sankalpId,
              "cycle_sankalp_id",
            );
          }

          // Regenerate companion with new locked items
          await executeAction({ type: "generate_companion" }, context);
        } catch (apErr: any) {
          console.warn("[MITRA] alter-practice failed:", apErr.message);
          // Fallback to local alter
          setScreenValue(true, "alter_practices_mode");
          setScreenValue(1, "day_number");
          setScreenValue({}, "journey_log");
          await executeAction({ type: "generate_companion" }, context);
        }
        break;
      }

      // ================================================================
      // ENSURE_CHECKPOINT_DATA — fetch checkpoint data into screen state.
      // Idempotent: skips fetch if checkpoint_original_data is already populated.
      // ================================================================
      case "ensure_checkpoint_data": {
        const cpDay =
          payload?.day || screenState.checkpoint_day || screenState.day_number || 7;
        if (screenState.checkpoint_original_data) {
          break;
        }
        const cpData = await mitraCheckpoint(screenState, cpDay);
        if (!cpData) break;
        setScreenValue(cpData.headline, "checkpoint_headline");
        setScreenValue(cpData.subtext, "checkpoint_subtext");
        setScreenValue(cpData.question, "checkpoint_question");
        setScreenValue(cpData.options || [], "checkpoint_options");
        setScreenValue(cpData.metrics || {}, "checkpoint_metrics");
        setScreenValue(cpData.originalData || null, "checkpoint_original_data");
        setScreenValue(cpData.day || cpDay, "checkpoint_day");
        setScreenValue(cpData.type || "", "checkpoint_type");
        setScreenValue(cpData.engagementLevel || "", "checkpoint_engagement_level");
        setScreenValue(cpData.trendGraph || {}, "checkpoint_trend_graph");
        setScreenValue(cpData.strongestArea || "", "strongest_area");
        setScreenValue(cpData.observation || "", "milestone_reflection");
        setScreenValue(cpData.daysEngaged || 0, "checkpoint_days_engaged");
        setScreenValue(
          cpData.daysFullyCompleted || 0,
          "checkpoint_days_fully_completed",
        );
        setScreenValue(cpData.totalDays || cpDay, "checkpoint_total_days");
        setScreenValue(
          cpData.recommendationAction || "",
          "checkpoint_recommendation",
        );
        setScreenValue(
          cpData.deepenSuggestion || null,
          "checkpoint_deepen_suggestion",
        );

        // Match web actionExecutor.js:2795 — fire checkpoint_viewed once
        // when the milestone screen successfully loads its data.
        mitraTrackEvent("checkpoint_viewed", {
          journeyId: screenState.journey_id,
          dayNumber: cpDay,
          meta: {
            engagement_level: cpData.engagementLevel || "",
            day: cpDay,
          },
        });
        break;
      }

      // ================================================================
      // CHECKPOINT_SUBMIT — submit Day 7 / Day 14 reflection.
      // Mirrors web actionExecutor.js:2512-2645.
      // ================================================================
      case "checkpoint_submit": {
        const csDay =
          screenState.checkpoint_day || screenState.day_number || 7;
        const csDecision =
          payload?.decision ||
          screenState.checkpoint_decision ||
          screenState.checkpoint_feeling ||
          screenState.checkpoint_options?.[0]?.id ||
          "continue";

        const csPayload: any = {
          decision: csDecision,
          reflection: screenState.checkpoint_user_reflection || "",
        };

        if (csDay === 14) {
          const impliedFeelingMap: Record<string, string> = {
            continue_same: "steady",
            deepen: "strong",
            change_focus: "ready",
          };
          csPayload.feeling =
            screenState.checkpoint_feeling_simple ||
            screenState.checkpoint_feeling ||
            impliedFeelingMap[csDecision] ||
            "steady";

          if (csDecision === "deepen") {
            const ds = screenState.checkpoint_deepen_suggestion;
            csPayload.deepenAccepted = true;
            if (ds?.itemType) csPayload.deepenItemType = ds.itemType;
            if (ds?.itemId) csPayload.deepenItemId = ds.itemId;
          }
        }

        const csRes = await mitraSubmitCheckpoint(csDay, csPayload);

        if (!csRes || csRes.status !== "ok") {
          console.warn("[CHECKPOINT_SUBMIT] backend returned error:", csRes);
          // Still mark completed locally so the user isn't stuck
          setScreenValue(true, "checkpoint_completed");
          setScreenValue(csDecision, "checkpoint_completed_decision");
          loadScreen({
            container_id: "cycle_transitions",
            state_id: "checkpoint_results",
          });
          break;
        }

        setScreenValue(true, "checkpoint_completed");
        setScreenValue(csDecision, "checkpoint_completed_decision");

        // Match web actionExecutor.js:2566 payload exactly:
        // includes reflection_length, drops redundant `day` field.
        mitraTrackEvent("checkpoint_completed", {
          journeyId: screenState.journey_id,
          dayNumber: csDay,
          meta: {
            decision: csDecision,
            reflection_length: (screenState.checkpoint_user_reflection || "").length,
          },
        });

        if (csDay === 14) {
          // Match web actionExecutor.js:2578 payload — include total_days +
          // path_cycle_number for analytics parity.
          mitraTrackEvent("cycle_completed", {
            journeyId: screenState.journey_id,
            dayNumber: csDay,
            meta: {
              decision: csDecision,
              total_days: csDay,
              path_cycle_number:
                screenState.path_context?.pathCycleNumber || 1,
            },
          });
        }

        // Apply backend-driven side effects: new journey id, day reset, etc.
        if (csRes.newJourneyId) {
          setScreenValue(csRes.newJourneyId, "journey_id");
        }
        if (csRes.resetDay || csDay === 14) {
          setScreenValue(1, "day_number");
        }

        // Navigate to results screen
        loadScreen({
          container_id: "cycle_transitions",
          state_id: "checkpoint_results",
        });
        break;
      }

      // ================================================================
      // RECORD_PAUSE — track pause/victory counters
      // ================================================================
      case "record_pause": {
        const rpSuccess = payload?.success;
        const rpCount = screenState.pause_count || 0;
        const rpVictories = screenState.pause_victories || 0;

        setScreenValue(rpCount + 1, "pause_count");
        if (rpSuccess) {
          setScreenValue(rpVictories + 1, "pause_victories");
        }

        if (target) loadScreen(target);
        break;
      }

      // ================================================================
      // EXTERNAL_LINK — open URL in system browser
      // ================================================================
      case "external_link": {
        if (payload?.url) {
          Linking.openURL(payload.url).catch((err: any) =>
            console.warn("[ACTION] Failed to open URL:", err.message),
          );
        }
        break;
      }

      // ================================================================
      // NEXT_PRACTICE_STEP — advance step counter in practice runner
      // ================================================================
      case "next_practice_step": {
        const npsSteps = screenState.info?.steps || [];
        const npsCurrentStep = screenState.current_practice_step || 0;
        if (npsCurrentStep < npsSteps.length - 1) {
          const npsNextIdx = npsCurrentStep + 1;
          const npsIsLast = npsNextIdx === npsSteps.length - 1;
          setScreenValue(npsNextIdx, "current_practice_step");
          setScreenValue(npsSteps[npsNextIdx], "current_step_text");
          setScreenValue(!npsIsLast, "show_next_button");
          setScreenValue(npsIsLast, "show_complete_button");
        }
        break;
      }

      // ================================================================
      // PROCESS_TRIGGER_FEEDBACK — process reflection, get suggestions
      // ================================================================
      case "process_trigger_feedback": {
        const ptfSelection = screenState.trigger_feeling_selection;
        const ptfManual = screenState.trigger_sentiment_input;
        let ptfFeeling = ptfSelection;

        // Smart sentiment detection for manual typing
        if (!ptfFeeling && ptfManual) {
          const ptfText = ptfManual.toLowerCase();
          const positiveKeywords = [
            "good",
            "balanced",
            "calm",
            "better",
            "peace",
            "fine",
            "okay",
            "settled",
            "stable",
            "shanti",
          ];
          const negativeKeywords = [
            "bad",
            "stressed",
            "triggered",
            "anxious",
            "angry",
            "heavy",
            "overwhelmed",
            "restless",
            "upset",
          ];

          const hasPositive = positiveKeywords.some((k) => ptfText.includes(k));
          const hasNegative = negativeKeywords.some((k) => ptfText.includes(k));

          if (hasPositive && !hasNegative) {
            ptfFeeling = "balanced";
          } else if (hasNegative) {
            ptfFeeling = "agitated";
          } else {
            ptfFeeling = "uncertain";
          }
        }

        // Log trigger reflection submission
        await mitraTrackEvent("trigger_reflection_submitted", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { feeling: ptfFeeling, free_text: ptfManual },
        });

        // If user feels balanced -> resolve and return home
        if (ptfFeeling === "balanced") {
          await mitraTrackEvent("trigger_resolved_after_reset", {
            journeyId: screenState.journey_id,
            dayNumber: screenState.day_number || 1,
          });

          // Cleanup support mantra
          setScreenValue(null, "trigger_mantra_text");
          setScreenValue(null, "trigger_mantra_devanagari");

          _cleanupOnReturnHome(setScreenValue, screenState, endFlowInstance);
          loadScreen({
            container_id: "companion_dashboard",
            state_id: "day_active",
          });
          break;
        }

        // Call trigger-mantras API for suggestions
        const ptfRes = await mitraTriggerMantras({
          feeling: ptfFeeling,
          focus:
            screenState.scan_focus || screenState.active_focus || "peacecalm",
          subFocus: screenState.prana_baseline_selection || "",
          depth:
            screenState.routine_depth ||
            screenState.routine_setup ||
            "standard",
          round: screenState.trigger_cycle_count || 1,
          locale: screenState.locale || "en",
          tz:
            Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
        });

        const ptfSuggestions = ptfRes?.suggestions || [];
        const ptfGuidance = ptfRes?.guidance || {};

        // Map dynamic guidance
        setScreenValue(
          ptfGuidance.headline || "Let Your Breath Guide You",
          "trigger_advice_headline",
        );
        setScreenValue(
          ptfGuidance.comfort || "You are not alone in this.",
          "trigger_advice_subtext_1",
        );
        setScreenValue(
          ptfGuidance.insight || "Observe what arises without judgment.",
          "trigger_advice_subtext_2",
        );
        setScreenValue(
          ptfGuidance.next_step || "Try one of these practices.",
          "trigger_advice_subtext_3",
        );

        // Map suggestions to PracticeCard format
        const ptfCards = ptfSuggestions.map((s: any, idx: number) => {
          const ptfItemType = s.core?.type || s.type || "mantra";
          const ptfIsPractice = ptfItemType === "practice";

          return {
            id: `trigger_suggestion_${idx}`,
            item_id: s.item_id || s.id,
            type: "practice_card",
            title: s.ui?.card_title || s.core?.title,
            description: s.ui?.card_subtitle || s.core?.meaning,
            icon: ptfIsPractice ? "leaf" : "om",
            info_action: {
              type: "view_info",
              payload: {
                type: ptfItemType,
                manualData: {
                  ...s.core,
                  wisdom: s.context,
                  source: "support",
                  is_trigger: true,
                  item_id: s.item_id || s.id,
                  item_type: ptfItemType,
                },
                is_trigger: true,
                start_action: ptfIsPractice
                  ? {
                      type: "navigate",
                      target: {
                        container_id: "practice_runner",
                        state_id: "practice_step_runner",
                      },
                    }
                  : {
                      type: "select_trigger_mantra",
                      payload: { mantra: { ...s.core, id: s.item_id || s.id } },
                      target: {
                        container_id: "practice_runner",
                        state_id: "post_trigger_mantra",
                      },
                    },
              },
            },
          };
        });

        setScreenValue(ptfCards, "suggested_trigger_mantras");

        // Reset selection state
        setScreenValue(null, "selected_card_id");
        setScreenValue(false, "show_start_trigger_mantra");

        loadScreen({
          container_id: "awareness_trigger",
          state_id: "trigger_advice_reveal",
        });
        break;
      }

      // ================================================================
      // UPDATE_TRIGGER_BUTTON — enable Share button (always "Share →")
      // ================================================================
      case "update_trigger_button": {
        setScreenValue(false, "is_trigger_share_disabled");
        // REG-013: Always keep "Share →" — process_trigger_feedback handles balanced → navigate home
        setScreenValue("Share \u2192", "trigger_share_btn_label");
        break;
      }

      // ================================================================
      // UPDATE_RECHECK_BUTTON — enable recheck Share button
      // ================================================================
      case "update_recheck_button": {
        setScreenValue(false, "is_recheck_btn_disabled");
        // Always keep "Share →"
        setScreenValue("Share \u2192", "trigger_recheck_btn_label");
        break;
      }

      // ================================================================
      // PROCESS_TRIGGER_RECHECK — handle recheck result (round 2 or resolve)
      // ================================================================
      case "process_trigger_recheck": {
        const ptrFeeling = screenState.trigger_recheck_selection;
        const ptrRound = screenState.trigger_cycle_count || 1;

        // Log recheck submission
        await mitraTrackEvent("trigger_recheck_submitted", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { round: ptrRound, feeling: ptrFeeling },
        });

        if (ptrFeeling === "balanced" || ptrRound >= 2) {
          // Cleanup support mantra
          setScreenValue(null, "trigger_mantra_text");
          setScreenValue(null, "trigger_mantra_devanagari");

          // Gentle exit message for max-rounds (not true resolution)
          if (ptrRound >= 2 && ptrFeeling !== "balanced") {
            setScreenValue(
              "You can return to your dashboard and continue gently from here.",
              "trigger_exit_message",
            );
          }

          // Distinct event name based on resolution type
          // (web actionExecutor.js:3367-3376)
          const ptrRecheckEvent =
            ptrRound >= 2 && ptrFeeling !== "balanced"
              ? "trigger_max_support_reached"
              : "trigger_resolved_after_recheck";
          await mitraTrackEvent(ptrRecheckEvent, {
            journeyId: screenState.journey_id,
            dayNumber: screenState.day_number || 1,
            meta: { round: ptrRound },
          });

          // Note: web does NOT call _cleanupOnReturnHome here (intentional).
          // The trigger flow state is cleared on the next engine navigation
          // via the standard trigger cleanup path. Removing the premature
          // cleanup avoids losing state before the screen finishes rendering.
          _cleanupOnReturnHome(setScreenValue, screenState, endFlowInstance);
          loadScreen({
            container_id: "companion_dashboard",
            state_id: "day_active",
          });
        } else {
          // Round 2 recommendations
          const ptrNextRound = ptrRound + 1;
          setScreenValue(ptrNextRound, "trigger_cycle_count");

          const ptrPrevSupport = screenState._active_support_item || {};
          const ptrRound1Suggestions = (
            screenState.suggested_trigger_mantras || []
          )
            .map((s: any) => s.item_id)
            .filter(Boolean);

          const ptrRes = await mitraTriggerMantras({
            feeling: "agitated",
            focus:
              screenState.scan_focus || screenState.active_focus || "peacecalm",
            subFocus: screenState.prana_baseline_selection || "",
            round: ptrNextRound,
            previousSuggestionId:
              ptrPrevSupport.itemId || ptrRound1Suggestions[0] || "",
            previousSuggestionType: ptrPrevSupport.itemType || "mantra",
            previousSuggestionCompleted:
              !!screenState._completion_tracked_this_session,
            excludeIds: ptrRound1Suggestions,
            recheckState: ptrFeeling,
            locale: screenState.locale || "en",
            tz:
              Intl.DateTimeFormat().resolvedOptions().timeZone ||
              "Asia/Kolkata",
            depth: screenState.routine_depth || "standard",
          });

          const ptrSuggestions = ptrRes?.suggestions || [];
          const ptrGuidance = ptrRes?.guidance || {};

          setScreenValue(
            ptrGuidance.headline || "Round 2: Deeper Focus",
            "trigger_advice_headline",
          );
          setScreenValue(
            ptrGuidance.comfort || "Stay steady.",
            "trigger_advice_subtext_1",
          );
          setScreenValue(
            ptrGuidance.insight || "Notice your breath.",
            "trigger_advice_subtext_2",
          );
          setScreenValue(
            ptrGuidance.next_step || "Continue with focus.",
            "trigger_advice_subtext_3",
          );

          // Map Round 2 suggestions to cards
          const ptrCards = ptrSuggestions.map((s: any, idx: number) => {
            const ptrItemType = s.core?.type || s.type || "mantra";
            const ptrIsPractice = ptrItemType === "practice";

            return {
              id: `trigger_suggestion_round2_${idx}`,
              item_id: s.item_id || s.id,
              type: "practice_card",
              title: s.ui?.card_title || s.core?.title,
              description: s.ui?.card_subtitle || s.core?.meaning,
              icon: ptrIsPractice ? "leaf" : "om",
              info_action: {
                type: "view_info",
                payload: {
                  type: ptrItemType,
                  manualData: {
                    ...s.core,
                    wisdom: s.context,
                    source: "support",
                    is_trigger: true,
                    item_id: s.item_id || s.id,
                    item_type: ptrItemType,
                  },
                  is_trigger: true,
                  start_action: ptrIsPractice
                    ? {
                        type: "navigate",
                        target: {
                          container_id: "practice_runner",
                          state_id: "practice_step_runner",
                        },
                      }
                    : {
                        type: "select_trigger_mantra",
                        payload: {
                          mantra: { ...s.core, id: s.item_id || s.id },
                        },
                        target: {
                          container_id: "practice_runner",
                          state_id: "post_trigger_mantra",
                        },
                      },
                },
              },
            };
          });

          setScreenValue(ptrCards, "suggested_trigger_mantras");
          setScreenValue(null, "selected_card_id");
          setScreenValue(false, "show_start_trigger_mantra");

          loadScreen({
            container_id: "awareness_trigger",
            state_id: "trigger_advice_reveal",
          });
        }
        break;
      }

      // ================================================================
      // TRIGGER_MANTRA_SUGGESTIONS — navigate to recovery target or insight
      // ================================================================
      case "trigger_mantra_suggestions": {
        const tmsRecoveryTarget = screenState.free_chant_recovery_target;
        if (tmsRecoveryTarget) {
          loadScreen(tmsRecoveryTarget);
        } else {
          const tmsCurrentDay = screenState.day_number || 1;
          loadScreen({
            container_id: "cycle_transitions",
            state_id:
              tmsCurrentDay === 14 ? "daily_insight_14" : "daily_insight",
          });
        }
        break;
      }

      // ================================================================
      // SELECT_TRIGGER_MANTRA — select a mantra from suggestions
      // ================================================================
      case "select_trigger_mantra": {
        const stmMantra = payload?.mantra;
        if (!stmMantra) break;

        setScreenValue(stmMantra.id, "selected_card_id");
        setScreenValue(
          stmMantra.iast || stmMantra.title,
          "trigger_mantra_text",
        );
        setScreenValue(stmMantra.devanagari, "trigger_mantra_devanagari");
        setScreenValue(true, "show_start_trigger_mantra");

        // Update runner_active_item with full mantra data including audio_url
        setScreenValue(
          {
            item_type: "mantra",
            source: "support",
            item_id: stmMantra.item_id || stmMantra.id,
            audio_url: stmMantra.audio_url || null,
            iast: stmMantra.iast || stmMantra.title,
            devanagari: stmMantra.devanagari,
            meaning: stmMantra.meaning,
            title: stmMantra.title || stmMantra.iast,
          },
          "runner_active_item",
        );

        // Log suggestion selection milestone
        const stmEventName =
          screenState._currentContainerId === "awareness_trigger"
            ? "trigger_suggestion_selected"
            : "checkin_suggestion_selected";

        await mitraTrackEvent(stmEventName, {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {
            item_type: "mantra",
            item_id: stmMantra.item_id || stmMantra.id,
            round: screenState.trigger_cycle_count || 1,
          },
        });

        if (target) loadScreen(target);
        break;
      }

      // ================================================================
      // TRACK_COMPLETION — fire a Mitra completion event
      // ================================================================
      case "track_completion": {
        if (!payload) break;
        const {
          itemType: tcItemType,
          itemId: tcItemId,
          source: tcSource,
          meta: tcMeta,
        } = payload;
        await mitraTrackCompletion({
          itemType: tcItemType,
          itemId: tcItemId,
          source: tcSource,
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: tcMeta,
        });
        break;
      }

      // ================================================================
      // ACKNOWLEDGE_CHECK_IN — Week 2 Dashboard inline check-in.
      // Spec: route_dashboard_day_active.md §1 (CheckInCardCompact), §6.
      // Web parity: kalpx-frontend/src/mock/mock/allContainers.js cycle_transitions/quick_checkin
      // REG-015: dashboard check-in must NOT share runner state with core
      // mantra flow — we only set a dashboard-local dismiss flag and
      // side-call prana-acknowledge.
      // ================================================================
      case "acknowledge_check_in": {
        const pranaState = (payload && payload.prana_state) || "steady";
        try {
          const ack = await mitraPranaAcknowledge({
            pranaType: pranaState,
            focus: screenState.scan_focus || screenState.suggested_focus || "peacecalm",
            locale: "en",
            journeyId: screenState.journey_id,
            dayNumber: screenState.day_number || 1,
          });
          if (ack?.insight) setScreenValue(ack.insight, "prana_ack_insight");
        } catch (err) {
          console.warn("[acknowledge_check_in] prana-acknowledge failed", err);
        }
        // Dashboard-local dismiss flag — does NOT touch runner_active_item,
        // practice_chant, or any core-flow state (REG-015).
        setScreenValue(true, "check_in_dismissed");
        mitraTrackEvent("dashboard_check_in_ack", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { prana_state: pranaState },
        });
        break;
      }

      // ================================================================
      // DISMISS_CLEAR_WINDOW — Week 2 Moment 43 banner dismissal.
      // Spec: route_dashboard_day_active.md §1 variant 43, §7 dismissibility.
      // Clears only clear_window screenData field; doesn't affect triad.
      // ================================================================
      case "dismiss_clear_window": {
        setScreenValue(null, "clear_window");
        setScreenValue("standard", "dashboard_variant");
        mitraTrackEvent("dashboard_clear_window_dismissed", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {},
        });
        break;
      }

      // ================================================================
      // ONBOARDING_TURN_RESPONSE — Week 1 Welcome Onboarding (Moments 1-7)
      // Web counterpart: no direct web equivalent (Mitra v3 is RN-first).
      // Spec: route_welcome_onboarding.md §6.
      // Branches on current screenData.onboarding_turn (1-7). Validates payload,
      // calls per-turn API (help-me-choose for free-form friction, PATCH
      // companion-state + generate-companion at turn 5, track-event at turn 7),
      // advances screenData.onboarding_turn, and loads next turn state.
      // ================================================================
      case "onboarding_turn_response": {
        const currentTurn = Number(screenState.onboarding_turn || 1);
        const draft = { ...(screenState.onboarding_draft_state || {}) };
        const p = payload || {};

        // fire-and-forget analytics
        postOnboardingTurn(currentTurn, {
          response_type: p.response_type,
          chip_id: p.chip_id,
          freeform_length: (p.freeform_text || "").length,
        });

        let nextTurn = currentTurn + 1;

        try {
          if (currentTurn === 1) {
            if (p.chip_id === "returning") {
              // Journey status check handled outside — for now advance to Turn 2.
              draft.returning = true;
            }
            if (p.freeform_text) draft.intro_freeform = p.freeform_text;
          } else if (currentTurn === 2) {
            if (p.chip_id) {
              draft.friction_id = p.chip_id;
              const m = FRICTION_TO_FOCUS[p.chip_id];
              if (m) draft.suggested_focus = m.focus;
            } else if (p.freeform_text) {
              draft.friction_freeform = p.freeform_text;
              const r = await mitraHelpMeChoose({ freeformInput: p.freeform_text });
              if (r) {
                draft.suggested_focus = r.suggestedFocus || r.suggested_focus;
                draft.friction_analysis = r.analysisText || r.analysis_text;
              }
            }
          } else if (currentTurn === 3) {
            if (p.chip_id) draft.state_id = p.chip_id;
            if (p.freeform_text) draft.state_freeform = p.freeform_text;
            // Stash label for Turn 4 acknowledgment
            setScreenValue(
              STATE_LABEL_MAP[p.chip_id] || "I hear you.",
              "onboarding_state_ack",
            );
          } else if (currentTurn === 4) {
            draft.voice_choice = p.choice;
            if (p.choice === "voice" && !screenState.voice_consent_given) {
              // Consent overlay flow — navigate to consent, then consent screen
              // advances turn back to 5. For Week 1 we mark the gate here.
              setScreenValue(false, "voice_consent_given");
            }
          } else if (currentTurn === 5) {
            draft.mode = p.guidance_mode;
            setScreenValue(p.guidance_mode, "guidance_mode");

            await patchCompanionState({
              preferred_guidance_mode: p.guidance_mode,
            });

            const companion = await mitraGenerateCompanion({
              focus: draft.suggested_focus || "clarity",
              sub_focus: draft.state_id,
              depth: "standard",
              baseline_metrics: {},
              intention: draft.friction_freeform,
              day_number: 1,
              guidance_mode: p.guidance_mode,
            });

            if (companion?.companion) {
              const c = companion.companion;
              const fMap = FRICTION_TO_FOCUS[draft.friction_id || ""];
              setScreenValue(fMap?.label || "what's alive for you", "friction_label");
              setScreenValue(
                (STATE_LABEL_MAP[draft.state_id || ""] || "").replace(".", "") ||
                  "the texture of it",
                "state_label",
              );
              setScreenValue(
                c.recommended_posture || "protecting your space and doing less, better",
                "recommended_posture",
              );
              setScreenValue(c.mantra?.core?.title || c.mantra?.title || "", "companion_mantra_title");
              setScreenValue(
                c.mantra?.ui?.card_subtitle || c.mantra?.one_line || "",
                "companion_mantra_one_line",
              );
              setScreenValue(c.mantra?.core?.id || c.mantra?.id || null, "companion_mantra_id");
              setScreenValue(c.sankalp?.core?.line || c.sankalp?.line || "", "companion_sankalp_line");
              setScreenValue(c.sankalp?.one_line || "", "companion_sankalp_one_line");
              setScreenValue(c.sankalp?.core?.id || c.sankalp?.id || null, "companion_sankalp_id");
              setScreenValue(c.practice?.core?.title || c.practice?.title || "", "companion_practice_title");
              setScreenValue(c.practice?.one_line || "", "companion_practice_one_line");
              setScreenValue(c.practice?.core?.id || c.practice?.id || null, "companion_practice_id");
            }
          } else if (currentTurn === 6) {
            if (p.chip_id === "play_briefing") {
              draft.briefing_requested = true;
            }
          } else if (currentTurn === 7) {
            // Completion
            await mitraTrackEvent("onboarding_completed", {
              meta: {
                friction: draft.friction_id,
                state: draft.state_id,
                mode: draft.mode,
                free_form_count:
                  (draft.friction_freeform ? 1 : 0) + (draft.state_freeform ? 1 : 0),
              },
            });
            setScreenValue(null, "onboarding_draft_state");
            setScreenValue(null, "onboarding_turn");
            loadScreen("companion_dashboard", "day_active");
            break;
          }

          setScreenValue(draft, "onboarding_draft_state");
          setScreenValue(nextTurn, "onboarding_turn");
          loadScreen("welcome_onboarding", `turn_${nextTurn}`);
        } catch (err) {
          console.error("[onboarding_turn_response] failed:", err);
        }
        break;
      }

      default:
        console.warn(`[ACTION] Unknown action type: ${type}`);
    }
  } finally {
    // Release duplicate submit guard
    if (GUARDED_ACTIONS.has(type)) {
      _actionInFlight = false;
      setScreenValue(false, "_isSubmitting");
    }
  }
}
