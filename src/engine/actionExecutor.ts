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
import { Alert, Linking } from "react-native";
import api from "../Networks/axios";
import { navigate as rootNavigate } from "../Shared/Routes/NavigationService";
import { cleanupFlowState, GUARDED_ACTIONS } from "./cleanupFields";
import {
  mitraAlterPractice,
  mitraCheckpoint,
  mitraCompleteOnboarding,
  mitraFetchOnboardingChips,
  mitraHelpMeChoose,
  mitraOnboardingRecognition,
  mitraPathEvolution,
  mitraPranaAcknowledge,
  mitraStartJourney,
  mitraSubmitCheckpoint,
  mitraTrackCompletion,
  mitraTrackEvent,
  mitraTriggerMantras,
  patchCompanionState,
  patchUserPreferences,
  getClearWindow,
  postVoiceNote,
  getVoiceNoteInterpretation,
  postInterpretIntent,
  // Week 5 — Reflection + Checkpoints
  getResilienceNarrative,
  postGratitudeLedger,
  // Week 6 — Companion Intelligence
  getPrepContext,
  getPredictiveAlerts,
  getRecommendedAdditional,
  getPostConflictContext,
  patchEntity,
  // Week 7 — Why-This + Personas
  getPrinciple,
  getPrincipleSource,
  getGriefContext,
  getLonelinessContext,
  getJoySignal,
  // Audit fix F1/F2/F3/F9 (2026-04-13) — wrappers for dashboard_load orchestration
  getBriefingToday,
  getResilienceLedger,
  mitraFetchAdditionalItems,
  mitraJourneyCompanion,
  getDeepenPreview,
  dismissPredictiveAlert,
  mutePredictiveAlertEntity,
  // 2026-04-13 backend B2/B3 wiring
  getPanchangToday,
  patchDissonanceThread,
  // 2026-04-18 M12 long-absence unification (Phase 2)
  mitraJourneyWelcomeBack,
} from "./mitraApi";

// Audit fix F6 (2026-04-13) — dispatch fetchCompanionState via Redux store
// without creating a hard import dep on the slice file at module top.
async function dispatchFetchCompanionState(): Promise<any> {
  try {
    const { store } = require("../store");
    const { fetchCompanionState } = require("../store/companionStateSlice");
    return await store.dispatch(fetchCompanionState()).unwrap();
  } catch (err) {
    return null;
  }
}

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

function _normalizeRunnerItem(item: any): any {
  if (!item || typeof item !== "object") return item;
  const itemType = item.item_type || item.itemType || item.type || null;
  const itemId = item.item_id || item.itemId || item.id || null;
  const normalized: any = {
    ...item,
    ...(itemType ? { item_type: itemType, itemType, type: itemType } : {}),
    ...(itemId ? { item_id: itemId, itemId, id: itemId } : {}),
  };
  if (item.core && typeof item.core === "object") {
    normalized.core = _normalizeRunnerItem(item.core);
  }
  return normalized;
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
      // HOME SURFACE ACTIONS (JOURNEY_HOME_CONTRACT_V1 §10 action enum)
      // These fire from chips/CTAs on the /journey/home/ response.
      // ================================================================
      // Navigation-only handlers. By contract, triad hydration via
      // generate_companion happens on ContinueJourney mount — not on
      // chip tap — so these handlers stay fast and synchronous.
      case "continue_practice": {
        console.log("[actionExecutor] continue_practice: entering");
        const target = {
          container_id:
            (process as any).env?.EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD === "1"
              ? "companion_dashboard_v3"
              : "companion_dashboard",
          state_id: "day_active",
        };
        console.log("[actionExecutor] continue_practice: loadScreen ->", target, "typeof loadScreen:", typeof loadScreen);
        loadScreen(target);
        console.log("[actionExecutor] continue_practice: rootNavigate DynamicEngine");
        rootNavigate("DynamicEngine");
        _actionInFlight = false;
        break;
      }
      case "start_checkin": {
        console.log("[actionExecutor] start_checkin: entering");
        loadScreen({
          container_id: "cycle_transitions",
          state_id: "quick_checkin",
        });
        rootNavigate("DynamicEngine");
        _actionInFlight = false;
        break;
      }
      case "start_support": {
        console.log("[actionExecutor] start_support: entering");
        // "I need some support today" — same entry as dashboard
        // "I Feel Triggered" button. Previously we re-dispatched
        // initiate_trigger via a nested executeAction call, but that
        // passed the wrong second argument (`action` instead of
        // `context`) — the nested call saw an undefined loadScreen and
        // silently no-op'd. Fix: inline the minimum trigger-session
        // setup here + navigate to the OM chanting screen. Matches what
        // initiate_trigger does at actionExecutor.ts:~1690.
        if (startFlowInstance) startFlowInstance("trigger");
        setScreenValue(null, "runner_active_item");
        setScreenValue(1, "trigger_cycle_count");
        setScreenValue("triggered", "trigger_feeling");
        setScreenValue(1, "trigger_step");
        const triggerOmAudio = _rotateAudio(
          OM_AUDIO_LIBRARY,
          "_kalpx_om_audio_idx",
        );
        setScreenValue(triggerOmAudio, "_selected_om_audio");
        const { label: trigLabel, devanagari: trigDev } =
          _omTextForTrack(triggerOmAudio);
        setScreenValue(trigLabel, "trigger_mantra_text");
        setScreenValue(trigDev, "trigger_mantra_devanagari");
        mitraTrackEvent("trigger_session_started", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
        });
        loadScreen({
          container_id: "practice_runner",
          state_id: "free_mantra_chanting",
        });
        rootNavigate("DynamicEngine");
        _actionInFlight = false;
        break;
      }
      case "open_mitra_chat": {
        // "Talk with Mitra" / "I'd like to talk with Mitra" — no dedicated
        // chat sheet yet; dashboard carries the voice/text input row.
        loadScreen({
          container_id:
            (process as any).env?.EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD === "1"
              ? "companion_dashboard_v3"
              : "companion_dashboard",
          state_id: "day_active",
        });
        rootNavigate("DynamicEngine");
        _actionInFlight = false;
        break;
      }

      // ================================================================
      // M12 LONG-ABSENCE (WelcomeBack unification, 2026-04-18)
      // Fires from the 30+-day M12 variant chips. Backend endpoint
      // /mitra/journey/welcome-back/ handles the DB transition:
      //  - "continue" → closes old journey (status=completed),
      //                 creates new with path_cycle_number += 1 +
      //                 previous_journey lineage + reused triad
      //  - "fresh"    → closes old journey (status=completed, NOT
      //                 abandoned — lineage preserved per Option A);
      //                 user proceeds to onboarding turn_1; when
      //                 onboarding creates the new Journey, it sets
      //                 previous_journey=<old> automatically.
      // Legacy WelcomeBack.tsx + custom telemetry event superseded.
      // ================================================================
      case "welcome_back_continue": {
        console.log("[actionExecutor] welcome_back_continue: entering");
        try {
          const res = await mitraJourneyWelcomeBack("continue");
          if (res && res.status === "ok" && res.newJourneyId) {
            // Seed triad + focus into screenData so dashboard mount
            // doesn't need a second round-trip.
            setScreenValue(res.newJourneyId, "journey_id");
            if (res.focus) setScreenValue(res.focus, "active_focus");
            if (res.subfocus) setScreenValue(res.subfocus, "prana_baseline_selection");
          }
        } catch (err: any) {
          console.warn("[actionExecutor] welcome_back_continue failed:", err?.message);
        }
        loadScreen({
          container_id:
            (process as any).env?.EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD === "1"
              ? "companion_dashboard_v3"
              : "companion_dashboard",
          state_id: "day_active",
        });
        rootNavigate("DynamicEngine");
        _actionInFlight = false;
        break;
      }
      case "welcome_back_fresh": {
        console.log("[actionExecutor] welcome_back_fresh: entering");
        try {
          await mitraJourneyWelcomeBack("fresh");
        } catch (err: any) {
          console.warn("[actionExecutor] welcome_back_fresh failed:", err?.message);
        }
        // Scoped reset — clear journey-scoped redux keys only, NOT full
        // resetState (which would wipe profile/guidance prefs etc.).
        // Lineage is preserved server-side; user's earlier cycles stay
        // linked via previous_journey when onboarding creates the new row.
        setScreenValue(null, "journey_id");
        setScreenValue(null, "active_focus");
        setScreenValue(null, "prana_baseline_selection");
        setScreenValue(null, "scan_focus");
        setScreenValue(null, "insight_step");
        setScreenValue(null, "mantra_text");
        setScreenValue(null, "sankalp_text");
        setScreenValue(null, "practice_title");
        setScreenValue(false, "practice_chant");
        setScreenValue(false, "practice_embody");
        setScreenValue(false, "practice_act");
        loadScreen({
          container_id: "welcome_onboarding",
          state_id: "turn_1",
        });
        rootNavigate("DynamicEngine");
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

        // Seed mantra_audio_url for the runner. masterData comes from
        // screenState.master_mantra which was populated by the companion
        // response (core.audio_url from MasterMantra DB lookup).
        if (infoType === "mantra") {
          const infoAudioUrl = masterData.audio_url || masterData.core?.audio_url || "";
          if (infoAudioUrl) {
            setScreenValue(infoAudioUrl, "mantra_audio_url");
          }
        }

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
        // 2026-04-19: legacy /generate-companion/ side-effect journey
        // creation is retired on FE. This action now ALWAYS calls the
        // v3 read-only /journey/companion/ endpoint. Journey creation
        // runs through POST /journey/start-v3/ (mitraStartJourney) at
        // onboarding turn_7. If no active journey exists, this returns
        // null — callers are responsible for routing to onboarding.
        // Kept the action name for caller compatibility; consider
        // renaming to `fetch_companion` in a follow-up.
        const inputData = {
          focus:
            screenState.scan_focus ||
            screenState.suggested_focus ||
            "peacecalm",
          sub_focus: screenState.prana_baseline_selection,
          depth:
            screenState.routine_depth ||
            screenState.routine_setup ||
            "standard",
          day_number: screenState.day_number || 1,
        };

        const data = await mitraJourneyCompanion();
        if (!data) {
          console.warn(
            "[ENGINE] journey/companion returned no data — skipping companion seed",
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

        // Clear-window (Moment 43) was dropped per backend B4 decision
        // (2026-04-13 audit). Slot reserved if revisited post-soak.
        setScreenValue(null, "clear_window");
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
      // FAST_TRACK_COMPANION — load companion data for a pre-existing journey
      // (2026-04-19: now reads via v3 journey/companion/; journey must
      // already exist — creation runs through journey/start-v3at turn_7)
      // ================================================================
      case "fast_track_companion": {
        const ftcFocus = payload?.focus;

        if (ftcFocus) {
          setScreenValue(ftcFocus, "scan_focus");
          setScreenValue(ftcFocus, "suggested_focus");
        }

        const ftcData = await mitraJourneyCompanion();
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
          const alterData = await mitraAlterPractice({
            direction: apDirection,
            feeling: screenState.checkpoint_feeling || "",
            newCategory: payload?.newCategory || "",
            newSubFocus: payload?.newSubFocus || "",
            newLevel: payload?.newLevel || "",
          });

          if (!alterData) {
            console.warn("[MITRA] alter-practice returned no data — skipping");
            break;
          }

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
        if (cpData.framing) {
          setScreenValue(cpData.framing, "checkpoint_framing");
        }

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

        // P1-7 — capture pre-submit triad IDs for post-submit validation.
        // continue_same / deepen MUST preserve item identity per the
        // Day-14 contract; if BE silently regenerates, we want a
        // warning in dev logs (not user-facing failure).
        const preSubmitTriadIds = {
          mantra:   screenState?.cycle_mantra_id || screenState?.companion?.mantra?.core?.id,
          sankalp:  screenState?.cycle_sankalp_id || screenState?.companion?.sankalp?.core?.id,
          practice: screenState?.cycle_practice_id || screenState?.companion?.practice?.core?.id,
        };

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

        // P1-6 — clear the AsyncStorage day14 pending flag on success.
        // Any future mid-flow crash before navigation completes won't
        // re-surface this now-resolved checkpoint.
        if (csDay === 14) {
          try {
            const AsyncStorage =
              require("@react-native-async-storage/async-storage").default;
            await AsyncStorage.removeItem("kalpx_day14_pending");
          } catch (_err) {
            // non-fatal
          }
        }

        // P1-7 — triad-identity validation for continue_same / deepen.
        // Dev-only log; warns if BE silently regenerated an item ID.
        // continue_same and deepen MUST keep the same mantra/sankalp/
        // practice IDs; change_focus is expected to change them.
        if (
          csDay === 14 &&
          (csDecision === "continue_same" || csDecision === "deepen") &&
          __DEV__
        ) {
          try {
            const { mitraJourneyCompanion } = require("./mitraApi");
            const companion = await mitraJourneyCompanion();
            const post = {
              mantra:   companion?.companion?.mantra?.core?.id,
              sankalp:  companion?.companion?.sankalp?.core?.id,
              practice: companion?.companion?.practice?.core?.id,
            };
            const drifted: string[] = [];
            for (const k of ["mantra", "sankalp", "practice"] as const) {
              if (preSubmitTriadIds[k] && post[k] &&
                  preSubmitTriadIds[k] !== post[k]) {
                drifted.push(
                  `${k}: ${preSubmitTriadIds[k]} → ${post[k]}`,
                );
              }
            }
            if (drifted.length > 0) {
              console.warn(
                "[CHECKPOINT_SUBMIT] triad-identity drift on " +
                  csDecision +
                  " — IDs changed silently:",
                drifted,
              );
            }
          } catch (_err) {
            // non-fatal — validation failure doesn't block navigation
          }
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
      //
      // Week 3 extension (Mitra v3 Moments 17-19): when invoked from a v3
      // runner, the canonical source / itemType / itemId / duration / variant
      // are already in screenState. Callers may pass them in payload OR rely
      // on screenState.runner_* fields. On success, flow-local runner_* state
      // is cleared (REG-003 cross-flow isolation).
      // ================================================================
      case "track_completion": {
        const p = payload || {};
        const activeItem = _normalizeRunnerItem(
          screenState.runner_active_item || {},
        );
        const resolvedItemType =
          p.itemType ||
          p.item_type ||
          activeItem.item_type ||
          activeItem.itemType ||
          screenState.runner_variant;
        const resolvedItemId =
          p.itemId ||
          p.item_id ||
          activeItem.item_id ||
          activeItem.itemId ||
          activeItem.id;
        const resolvedSource = p.source || screenState.runner_source;
        const resolvedDuration =
          p.duration_sec ?? screenState.runner_duration_actual_sec;
        const resolvedVariant = p.variant || screenState.runner_variant;
        const resolvedMeta = {
          ...(p.meta || {}),
          ...(resolvedDuration != null ? { actual_seconds: resolvedDuration } : {}),
          ...(resolvedVariant ? { variant: resolvedVariant } : {}),
          ...(screenState.runner_reps_completed != null
            ? { reps_completed: screenState.runner_reps_completed }
            : {}),
        };

        if (resolvedItemType && resolvedItemId) {
          await mitraTrackCompletion({
            itemType: resolvedItemType,
            itemId: resolvedItemId,
            source: resolvedSource,
            journeyId: screenState.journey_id,
            dayNumber: screenState.day_number || 1,
            meta: resolvedMeta,
          });
        } else {
          console.warn(
            "[track_completion] missing itemType or itemId — skipped",
            { resolvedItemType, resolvedItemId, resolvedSource },
          );
        }

        // REG-003: clear runner-local state so it cannot leak into the next
        // flow (core vs. additional vs. trigger). These fields are owned by
        // the runner flow and have no meaning outside it.
        setScreenValue(null, "runner_active_item");
        setScreenValue(null, "runner_source");
        setScreenValue(null, "runner_start_time");
        setScreenValue(null, "runner_variant");
        setScreenValue(null, "runner_reps_completed");
        setScreenValue(null, "runner_step_index");
        setScreenValue(null, "runner_duration_actual_sec");
        break;
      }

      // ================================================================
      // START_RUNNER — initialize runner_* flow-local state from the entry
      // action, validating that a source is set (REG-015 guard against
      // cross-flow contamination).
      //
      // Called from info reveal / dashboard triad / trigger suggestion with:
      //   payload: { variant, item: {item_type,item_id,title}, source,
      //              target_reps?, duration_sec?, steps? }
      // Navigates to the provided target or inferred runner state.
      // ================================================================
      case "start_runner": {
        const sp = payload || {};
        if (!sp.source) {
          console.warn(
            "[start_runner] missing source — refusing to start to prevent " +
              "cross-flow contamination (REG-015).",
          );
          break;
        }
        if (!sp.variant) {
          console.warn("[start_runner] missing variant");
          break;
        }
        const normalizedItem = _normalizeRunnerItem(sp.item || null);

        setScreenValue(sp.variant, "runner_variant");
        setScreenValue(sp.source, "runner_source");
        setScreenValue(normalizedItem, "runner_active_item");
        setScreenValue(Date.now(), "runner_start_time");
        setScreenValue(0, "runner_reps_completed");
        setScreenValue(0, "runner_step_index");
        setScreenValue(0, "runner_duration_actual_sec");
        // Canonical rich runner routing (LOCKED 2026-04-19): the rich
        // surface (`cycle_transitions/offering_reveal`) reads `info` with
        // `runner_active_item` as fallback. If `screenData.info` is stale
        // from a prior view_info (e.g. user opened sankalp info icon, then
        // tapped mantra triad card), the stale item renders instead of the
        // current runner's item. Always overwrite `info` with the current
        // item so the rich surface aligns with the active runner.
        if (normalizedItem) {
          setScreenValue(normalizedItem, "info");
        }
        // Seed audio_url for MantraRunnerDisplay — it reads from
        // screenData.mantra_audio_url, not runner_active_item.
        if (sp.variant === "mantra" && normalizedItem) {
          const itemAudio =
            normalizedItem.audio_url || normalizedItem.core?.audio_url || "";
          if (itemAudio) {
            setScreenValue(itemAudio, "mantra_audio_url");
          }
        }
        if (sp.target_reps) setScreenValue(sp.target_reps, "reps_total");
        if (sp.duration_sec) {
          setScreenValue(sp.duration_sec, "practice_duration_seconds");
        }
        if (sp.steps) setScreenValue(sp.steps, "practice_steps");

        // Nav
        //
        // Canonical rich runner routing (LOCKED 2026-04-19): when no
        // explicit target is passed (core triad primary tap, default path),
        // all variants route to `cycle_transitions/offering_reveal` — the
        // single rich runner surface already used by support paths
        // (grief / loneliness / joy / growth mantra taps). This collapses
        // the prior split where core landed on the thin
        // `practice_runner/{mantra_runner|sankalp_embody|practice_step_runner}`
        // surfaces with bare count/animation-only UI. Thin surfaces are
        // parked as legacy/unreachable — safe to delete in a future PR.
        if (target) {
          loadScreen(target);
        } else if (
          sp.variant === "mantra" ||
          sp.variant === "sankalp" ||
          sp.variant === "practice"
        ) {
          loadScreen({
            container_id: "cycle_transitions",
            state_id: "offering_reveal",
          });
        }
        break;
      }

      // ================================================================
      // COMPLETE_RUNNER — natural completion of a v3 runner (mantra 108th
      // tap, sankalp 3s hold, practice timer expiry). Fires track_completion
      // with source derived from runner_source (never inferred), then lands
      // on the completion_return transient.
      // ================================================================
      case "complete_runner": {
        const activeItem = _normalizeRunnerItem(
          screenState.runner_active_item || {},
        );
        const variant = screenState.runner_variant;
        const source = screenState.runner_source;
        const durationSec =
          screenState.runner_duration_actual_sec ??
          (screenState.runner_start_time
            ? Math.round((Date.now() - screenState.runner_start_time) / 1000)
            : 0);

        if (
          (activeItem.item_type || activeItem.itemType) &&
          (activeItem.item_id || activeItem.itemId) &&
          source
        ) {
          await mitraTrackCompletion({
            itemType: activeItem.item_type || activeItem.itemType,
            itemId: activeItem.item_id || activeItem.itemId,
            source,
            journeyId: screenState.journey_id,
            dayNumber: screenState.day_number || 1,
            meta: {
              variant,
              actual_seconds: durationSec,
              ...(screenState.runner_reps_completed != null
                ? { reps_completed: screenState.runner_reps_completed }
                : {}),
            },
          });

          // Local engagement flag update — dashboard ring depends on
          // practice_chant / practice_embody / practice_act (+ practice_deepen
          // when a 4th deepen item is chosen). BE persists the JourneyActivity
          // but does not return engagement state, and /journey/home/ is not
          // re-fetched on dashboard return, so the flags must flip locally.
          // Scoped to source === "core" so support/additional completions do
          // not falsely flip the core triad progress.
          if (source === "core") {
            const isDeepenCompletion =
              !!screenState.cycle_deepen_item_id &&
              activeItem.item_id === screenState.cycle_deepen_item_id;
            if (isDeepenCompletion) {
              setScreenValue(true, "practice_deepen");
            } else {
              const flagKey =
                activeItem.item_type === "mantra"
                  ? "practice_chant"
                  : activeItem.item_type === "sankalp"
                  ? "practice_embody"
                  : activeItem.item_type === "practice"
                  ? "practice_act"
                  : null;
              if (flagKey) setScreenValue(true, flagKey);
            }
          }
        } else {
          console.warn(
            "[complete_runner] missing item/source — track_completion skipped",
            { activeItem, source },
          );
        }

        loadScreen({
          container_id: "practice_runner",
          state_id: "completion_return",
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
      // DISMISS_CLEAR_WINDOW removed (B4 dropped 2026-04-13). Handler
      // retained as no-op for any cached schema referencing it.
      case "dismiss_clear_window": {
        setScreenValue(null, "clear_window");
        break;
      }

      // ================================================================
      // REPEAT_RUNNER — Week 3. User tapped "Repeat" on completion_return.
      // Resets reps/step/duration and re-enters the same variant's runner
      // state with the same item_id/source preserved.
      // ================================================================
      case "repeat_runner": {
        setScreenValue(0, "runner_reps_completed");
        setScreenValue(0, "runner_step_index");
        setScreenValue(0, "runner_duration_actual_sec");
        setScreenValue(Date.now(), "runner_start_time");

        // Canonical rich runner routing (LOCKED 2026-04-19) — repeat
        // lands on the same surface as first-run start_runner.
        const variant = screenState.runner_variant;
        if (
          variant === "mantra" ||
          variant === "sankalp" ||
          variant === "practice"
        ) {
          loadScreen({
            container_id: "cycle_transitions",
            state_id: "offering_reveal",
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
      // ONBOARDING_TURN_RESPONSE — Week 1 Welcome Onboarding (Moments 1-7)
      // Web counterpart: no direct web equivalent (Mitra v3 is RN-first).
      // Spec: route_welcome_onboarding.md §6.
      // Branches on current screenData.onboarding_turn (1-7). Validates payload,
      // calls per-turn API (help-me-choose for free-form friction, PATCH
      // companion-state + generate-companion at turn 5, track-event at turn 7),
      // advances screenData.onboarding_turn, and loads next turn state.
      // ================================================================
      case "onboarding_turn_response": {
        // Sadhana Yatra 4-stage flow (2026-04-14). State-id driven rather than
        // numeric-turn driven — path-aware branching requires named states.
        const currentStateId = 
          action.currentScreen?.state_id ||
          (typeof screenState.onboarding_turn === "string" 
            ? screenState.onboarding_turn 
            : `turn_${screenState.onboarding_turn || 1}`);
        const draft = { ...(screenState.onboarding_draft_state || {}) };
        const p = action.payload || {};

        // Kosha / klesha maps per spec mitra_architecture_sadhana_yatra.md
        const KOSHA_MAP: Record<string, string> = {
          body: "annamaya",
          breath: "pranamaya",
          mind: "manomaya",
          intellect: "vijnanamaya",
          deep: "anandamaya",
        };
        const KLESHA_MAP: Record<string, string> = {
          fear: "abhinivesha",
          wanting: "raga",
          resistance: "dvesha",
          identity: "asmita",
          confusion: "avidya",
          not_sure: "avidya",
        };

        // Tracking (non-blocking)
        mitraTrackEvent("onboarding_turn_response", {
          meta: {
            turn: currentStateId,
            chip_id: p.chip_id,
            freeform_length: (p.freeform_text || "").length,
          },
        }).catch(() => {});

        let nextStateId = "";

        try {
          if (currentStateId === "turn_1") {
            if (p.chip_id === "returning") {
              draft.returning = true;
              rootNavigate("Login");
              return; // Do not proceed to turn_2
            }
            if (p.freeform_text) draft.intro_freeform = p.freeform_text;
            nextStateId = "turn_2";
          } else if (currentStateId === "turn_2") {
            // Stage 0 — path pick
            const path = p.chip_id === "growth" ? "growth" : "support";
            draft.path = path;
            draft.stage0_choice = path;
            nextStateId = path === "growth" ? "turn_3_growth" : "turn_3_support";

            // Fetch Stage 1 chips
            const stage1 = await mitraFetchOnboardingChips({
              stage: 1,
              lane: path,
              guidance_mode: "hybrid",
            });
            if (stage1) setScreenValue(stage1, "stage1_data");
          } else if (
            currentStateId === "turn_3_support" ||
            currentStateId === "turn_3_growth"
          ) {
            // Stage 1 chip pick
            draft.stage1_choice = p.chip_id || "selected_via_text";
            nextStateId = draft.path === "growth" ? "turn_4_growth" : "turn_4_support";
            if (p.freeform_text) {
              draft.freeforms = { ...(draft.freeforms || {}), stage1: p.freeform_text };
            }

            // Fetch Stage 2 chips
            const stage2 = await mitraFetchOnboardingChips({
              stage: 2,
              lane: draft.path,
              guidance_mode: "hybrid",
              stage1_choice: draft.stage1_choice,
            });
            if (stage2) setScreenValue(stage2, "stage2_data");
          } else if (
            currentStateId === "turn_4_support" ||
            currentStateId === "turn_4_growth"
          ) {
            // Stage 2 chip pick
            draft.stage2_choice = p.chip_id || "selected_via_text";
            nextStateId = draft.path === "growth" ? "turn_5_growth" : "turn_5_support";
            if (p.freeform_text) {
              draft.freeforms = { ...(draft.freeforms || {}), stage2: p.freeform_text };
            }

            // Fetch Stage 3 chips (Help styles)
            const stage3 = await mitraFetchOnboardingChips({
              stage: 3,
              lane: draft.path,
              guidance_mode: "hybrid",
              stage1_choice: draft.stage1_choice,
              stage2_choice: draft.stage2_choice,
            });
            if (stage3) setScreenValue(stage3, "stage3_data");
          } else if (
            currentStateId === "turn_5_support" ||
            currentStateId === "turn_5_growth"
          ) {
            // Stage 3 chip pick
            draft.stage3_choice = p.chip_id || "selected_via_text";
            if (p.freeform_text) {
              draft.freeforms = { ...(draft.freeforms || {}), stage3: p.freeform_text };
            }
            nextStateId = "turn_6";
          } else if (currentStateId === "turn_6") {
            // Mode picker
            const mode = p.guidance_mode || p.chip_id || "hybrid";
            draft.guidance_mode = mode;
            nextStateId = "turn_7";

            // Call POST onboarding/complete/
            const complete = await mitraCompleteOnboarding({
              stage0_choice: draft.stage0_choice || draft.path || "support",
              stage1_choice: draft.stage1_choice,
              stage2_choice: draft.stage2_choice,
              stage3_choice: draft.stage3_choice,
              guidance_mode: mode,
              freeforms: {
                stage1: draft.freeforms?.stage1 || null,
                stage2: draft.freeforms?.stage2 || null,
                stage3: draft.freeforms?.stage3 || null,
              },
            });

            if (complete) {
              draft.recognition_line = complete.recognition?.line;
              setScreenValue(complete.recognition?.line, "recognition_line");
              // Recognition body — lane × mode closing paragraph (2026-04-17
              // Option B). Moved from FE hardcoded block to backend spine.
              setScreenValue(
                complete.recognition?.body_lines || [],
                "recognition_body_lines",
              );
              setScreenValue(complete, "onboarding_complete_data");
              // Use labels for triad templating
              setScreenValue(complete.triad_labels?.sankalp || "SANKALP", "sankalp_label");
              setScreenValue(complete.triad_labels?.mantra || "MANTRA", "mantra_label");
              setScreenValue(complete.triad_labels?.practice || "PRACTICE", "practice_label");
              setScreenValue(complete.sankalp_prefix_line, "sankalp_prefix");
              
              // Store inference fields for triad call
              draft.inference = complete.inference;
            }

            nextStateId = "turn_7";
          } else if (currentStateId === "turn_7") {
            // "Show me my path" tapped. Flow:
            //   1. Check if authenticated
            //   2. If guest → navigate to Login, stash inference for post-auth
            //   3. If authed → call /journey/start-v3/ → seed triad → turn_8
            const inf = draft.inference || {};

            // Check auth state
            const _store = require("../store").default;
            const authState = _store.getState().login || _store.getState().socialLoginReducer || {};
            const isAuthed = !!(authState.user?.id || authState.user?.email || authState.user?.token);

            if (!isAuthed) {
              // Guest — stash inference + onboarding state, redirect to Login.
              // After login, Home.tsx post-auth hook:
              //   1. Calls /journey/start-v3/ with stashed inference
              //   2. Seeds triad into screenData
              //   3. Navigates to welcome_onboarding/turn_8 (triad reveal)
              setScreenValue(inf, "stashed_inference_state");
              setScreenValue(draft.guidance_mode || "hybrid", "stashed_guidance_mode");
              setScreenValue(draft, "onboarding_draft_state");
              setScreenValue("turn_7_awaiting_auth", "onboarding_turn");

              // Navigate to Login via the root stack navigator.
              // The actionExecutor doesn't have direct nav access, but
              // the loadScreen function's container_id is checked by
              // ScreenRenderer → if not in containerMap, we need a
              // different approach. Use the navigation service.
              try {
                const { CommonActions } = require("@react-navigation/native");
                const { navigationRef } = require("../Shared/Routes/NavigationService");
                if (navigationRef?.isReady()) {
                  (navigationRef.navigate as any)("Login");
                } else {
                  // Fallback: use the global navigation from store
                  // The RN app's StackNavigator has "Login" as a screen.
                  // Force a re-render of Home which will detect isLoggedIn=false
                  // and show the login prompt.
                  if (__DEV__) console.log("[ONBOARDING] No nav ref — user must tap Login from menu");
                }
              } catch (_navErr) {
                if (__DEV__) console.warn("[ONBOARDING] Login redirect failed:", _navErr);
              }
              // Don't advance to turn_8 yet — wait for auth
              break;
            }

            // Authenticated — generate triad via v3
            nextStateId = "turn_8";
            const start = await mitraStartJourney({
              inference_state: {
                lane: inf.lane || draft.path || "support",
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
              guidance_mode: draft.guidance_mode || "hybrid",
              locale: "en",
              tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
              stage0_choice: draft.stage0_choice || draft.path,
              stage1_choice: draft.stage1_choice,
              stage2_choice: draft.stage2_choice,
              stage3_choice: draft.stage3_choice,
            });

            if (start) {
              const t = start.triad || {};
              setScreenValue(t.mantra?.title, "mantra_text");
              setScreenValue(t.mantra?.title, "companion_mantra_title");
              setScreenValue(t.mantra?.item_id, "companion_mantra_id");
              setScreenValue(t.sankalp?.title, "sankalp_text");
              setScreenValue(t.sankalp?.title, "companion_sankalp_line");
              setScreenValue(t.sankalp?.item_id, "companion_sankalp_id");
              setScreenValue(t.practice?.title, "practice_title");
              setScreenValue(t.practice?.title, "companion_practice_title");
              setScreenValue(t.practice?.item_id, "companion_practice_id");
              setScreenValue(start.scan_focus, "focus_name");
              setScreenValue(start.scan_focus, "scan_focus");
              setScreenValue(start.path_intent, "path_intent");
              setScreenValue(start.movement_goal_label, "movement_goal_label");
              setScreenValue(start.cycle_id, "cycle_id");
              setScreenValue(start, "onboarding_triad_data");
              if (start.journey_id) {
                setScreenValue(start.journey_id, "journey_id");
              }
            }

            nextStateId = "turn_8";
          } else if (currentStateId === "turn_8") {
            // Completion — "Begin my journey" tapped. Before navigating
            // to the dashboard, call generate_companion (via journey/
            // companion/) to seed ALL enrichment data (how_to_live,
            // recommended_posture, focus_name, one_line, reasoning, etc.)
            // so the dashboard renders fully — not just the triad stubs
            // from the v3 response.
            mitraTrackEvent("onboarding_completed", {
              meta: { path: draft.path, mode: draft.guidance_mode },
            }).catch(() => {});

            await patchCompanionState({
              last_reported_mood:
                draft.primary_kosha || draft.aliveness_state || null,
              last_seen_at: new Date().toISOString(),
              active_dissonance: draft.primary_klesha
                ? {
                    source: draft.primary_klesha,
                    opened_at: new Date().toISOString(),
                    summary: draft.klesha_freeform || null,
                  }
                : null,
            });

            // Seed full companion enrichment from the journey companion
            // endpoint. This populates how_to_live, recommended_posture,
            // focus_name, one_line, reasoning, shift messages, etc.
            try {
              const _store = require("../store").default;
              const _screenActions = require("../store/screenSlice").screenActions;
              await executeAction(
                {
                  type: "generate_companion",
                  payload: { use_journey_companion: true },
                },
                {
                  screenState: _store.getState().screen.screenData,
                  loadScreen: () => {},
                  goBack: () => {},
                  setScreenValue: (value: any, key: string) =>
                    _store.dispatch(_screenActions.setScreenValue({ key, value })),
                },
              );
            } catch (_err) {
              if (__DEV__) console.warn("[ONBOARDING] companion enrichment failed:", _err);
            }

            setScreenValue(null, "onboarding_draft_state");
            setScreenValue(null, "onboarding_turn");
            loadScreen({ container_id: "companion_dashboard", state_id: "day_active" });
            break;
          }

          if (!nextStateId) {
            console.warn(
              "[onboarding_turn_response] no next state for",
              currentStateId,
            );
            break;
          }

          setScreenValue(draft, "onboarding_draft_state");
          setScreenValue(nextStateId, "onboarding_turn");
          loadScreen({ container_id: "welcome_onboarding", state_id: nextStateId });
        } catch (err) {
          console.error("[onboarding_turn_response] failed:", err);
        }
        break;
      }

      // ================================================================
      // CROSS-CUTTING HANDLERS (mitra-v3-cross)
      // ================================================================

      // mute_entity — companion intelligence: mark an entity (person/topic)
      // as muted. PATCH /api/mitra/entities/<id>/ with status=muted.
      case "mute_entity": {
        const entityId = payload?.entity_id || target;
        if (!entityId) {
          console.warn("[mute_entity] no entity_id provided");
          break;
        }
        const muted = await patchEntity(entityId, { status: "muted" });
        if (muted !== null) {
          setScreenValue(true, `_entity_muted_${entityId}`);
        }
        break;
      }

      // log_gratitude — generic gratitude-ledger POST. signal_type comes from
      // payload, allowing multiple call sites (evening reflection, joy moment,
      // welcome expansion) to share one handler.
      case "log_gratitude": {
        await postGratitudeLedger({
          signal_type: payload?.signal_type || "gratitude",
          note: payload?.note || "",
          context: payload?.context || null,
          intensity: payload?.intensity ?? null,
          logged_at: new Date().toISOString(),
        });
        break;
      }

      // acknowledge_season — sets season_banner_dismissed_at and (if endpoint
      // present) PATCHes user-preferences so dismissal persists server-side.
      case "acknowledge_season": {
        const now = Date.now();
        setScreenValue(now, "season_banner_dismissed_at");
        await patchUserPreferences({
          season_banner_dismissed_at: new Date(now).toISOString(),
        });
        break;
      }

      // ================================================================
      // WEEK 4 — SUPPORT PATH (Mitra v3 Moments 20, 21, 22, 31, 38, 42)
      // Web parity: AwarenessTriggerContainer.vue + VoiceRecorderBlock.vue
      // Specs: route_support_trigger.md, route_support_checkin_regulation.md,
      //        overlay_voice_note.md, overlay_voice_consent.md,
      //        transient_sound_bridge.md, overlay_checkin_balanced_ack.md.
      // ================================================================

      // INITIATE_TRIGGER_SUPPORT (Moment 20) — entry from TriggerEntryBlock
      // REG-002: clear any prior trigger_mantra_text (no contamination)
      // REG-015: must NOT touch runner_active_item / companion_mantra_id
      // REG-020: active path is sound_bridge → mantra_runner → dashboard
      case "initiate_trigger_support": {
        // REG-002 guard — wipe trigger-owned mantra text so a stale value
        // from a prior round cannot surface in the new round.
        setScreenValue(null, "trigger_mantra_text");
        setScreenValue(null, "trigger_mantra_devanagari");

        // REG-015 multi-round counter
        const prevRound = Number(screenState.trigger_round || 0);
        setScreenValue(prevRound + 1, "trigger_round");

        // Seed OM audio for the sound bridge step
        const omUrl = _rotateAudio(OM_AUDIO_LIBRARY, "_kalpx_om_audio_idx");
        setScreenValue(omUrl, "om_audio_url");
        const omText = _omTextForTrack(omUrl);
        setScreenValue(omText.label, "trigger_mantra_text");
        setScreenValue(omText.devanagari, "trigger_mantra_devanagari");

        mitraTrackEvent("trigger_session_started", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {
            source_surface: "dashboard",
            round: prevRound + 1,
          },
        });

        if (context.startFlowInstance) context.startFlowInstance("support_trigger");

        loadScreen({ container_id: "support_trigger", state_id: "sound_bridge" });
        break;
      }

      // ADVANCE_SOUND_BRIDGE (Moment 42) — auto or manual advance
      // Seeds runner_source="support_trigger" then enters mantra runner.
      // No recheck (REG-020).
      case "advance_sound_bridge": {
        const exitType = (payload && payload.exit_type) || "auto";
        mitraTrackEvent("sound_bridge_exited", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { exit_type: exitType, parent: "trigger" },
        });

        // Seed runner-local state for the support mantra runner.
        setScreenValue("mantra", "runner_variant");
        setScreenValue("support_trigger", "runner_source");
        setScreenValue(
          {
            item_type: "mantra",
            item_id: screenState.support_mantra_id || "om_support",
            title: screenState.trigger_mantra_text || "OM",
          },
          "runner_active_item",
        );
        setScreenValue(Date.now(), "runner_start_time");
        setScreenValue(0, "runner_reps_completed");
        setScreenValue(0, "runner_duration_actual_sec");

        loadScreen({
          container_id: "practice_runner",
          state_id: "mantra_runner",
        });
        break;
      }

      // ADVANCE_CHECKIN_STEP (Moment 21) — notice → name → settle
      // REG-015: only touches checkin_* fields.
      case "advance_checkin_step": {
        const from = payload?.from || "notice";
        const value = payload?.value;
        const draft = { ...(screenState.checkin_draft || {}) };
        if (from === "notice") draft.noticed = value;
        else if (from === "name") draft.named = value;
        setScreenValue(draft, "checkin_draft");
        const next: Record<string, string> = {
          notice: "name",
          name: "settle",
        };
        const nextStep = next[from];
        if (nextStep) {
          setScreenValue(nextStep, "checkin_step");
          loadScreen({ container_id: "support_checkin", state_id: nextStep });
        }
        break;
      }

      // SUBMIT_CHECKIN — finalize regulation, show BalancedAckOverlay.
      case "submit_checkin": {
        const draft = { ...(screenState.checkin_draft || {}) };
        if (payload?.final) draft.settled = payload.final;
        setScreenValue(draft, "checkin_draft");

        mitraTrackEvent("checkin_regulation_completed", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {
            noticed: draft.noticed,
            named: draft.named,
            settled: draft.settled,
          },
        });

        // Phase 1.5 — best-effort intent interpretation on freeform settle
        if (typeof draft.named === "string" && draft.named.length > 2) {
          postInterpretIntent(draft.named).catch(() => {});
        }

        setScreenValue("balanced", "checkin_ack_variant");
        loadScreen({
          container_id: "support_checkin",
          state_id: "balanced_ack",
        });
        break;
      }

      // START_VOICE_NOTE — opens VoiceNoteSheet, gates on consent first use.
      case "start_voice_note": {
        const sourceSurface = payload?.source_surface || "dashboard";
        setScreenValue(sourceSurface, "voice_note_source_surface");

        if (
          screenState.voice_consent_given === null ||
          screenState.voice_consent_given === undefined
        ) {
          loadScreen({ container_id: "overlay", state_id: "voice_consent" });
        } else if (screenState.voice_consent_given === false) {
          // User previously declined — re-prompt once per voice trigger
          loadScreen({ container_id: "overlay", state_id: "voice_consent" });
        } else {
          setScreenValue(true, "voice_note_active");
          loadScreen({ container_id: "overlay", state_id: "voice_note" });
        }
        break;
      }

      // SUBMIT_VOICE_NOTE — POST, stores id, polls interpretation.
      case "submit_voice_note": {
        try {
          const res = await postVoiceNote(payload?.audio || null, {
            source_surface:
              payload?.source_surface ||
              screenState.voice_note_source_surface ||
              "dashboard",
            duration_ms: payload?.duration_ms || 0,
          });
          if (res && res.id) {
            setScreenValue(res.id, "voice_note_id");
            // fire-and-forget poll
            (async () => {
              for (let i = 0; i < 5; i++) {
                await new Promise((r) => setTimeout(r, 1500));
                const interp = await getVoiceNoteInterpretation(res.id);
                if (interp) {
                  setScreenValue(interp, "voice_note_interpretation");
                  return;
                }
              }
            })();
          }
        } catch (err) {
          console.warn("[submit_voice_note] failed", err);
        }
        break;
      }

      // ================================================================
      // WEEK 5 — REFLECTION + CHECKPOINTS (Mitra v3 Moments 23, 24, 25, 26, 34)
      // Web parity: kalpx-frontend/src/engine/actionExecutor.js — gratitude
      // ledger + track-event patterns. Spec: route_reflection_evening.md,
      // route_reflection_weekly.md, embedded_resilience_narrative_card.md.
      //
      // Preserve contract: checkpoint_submit (case above, ~line 2509) and
      // seal_day (case above, ~line 2075) are unchanged.
      // ================================================================

      case "submit_evening_reflection": {
        const p = payload || {};
        const chip: string = p.chip || "steady";
        const text: string = (p.text || "").trim();

        await postGratitudeLedger({
          signal_type: "evening_reflection",
          text,
          meta: {
            chip,
            journey_id: screenState.journey_id,
            day_number: screenState.day_number || 1,
          },
        });

        mitraTrackEvent("evening_reflection", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { chip, text_length: text.length },
        });

        setScreenValue(true, "_evening_reflection_submitted");
        setScreenValue(null, "evening_reflection_draft");

        setTimeout(() => {
          loadScreen({
            container_id: "companion_dashboard",
            state_id: "day_active",
          });
          setScreenValue(false, "_evening_reflection_submitted");
        }, 1800);
        break;
      }

      case "submit_weekly_reflection": {
        const p = payload || {};
        const sections = p.sections || {};
        const entries = [
          { key: "held", signal: "weekly_held" },
          { key: "took", signal: "weekly_took" },
          { key: "tending", signal: "weekly_tending" },
        ];

        await Promise.all(
          entries
            .filter((e) => (sections[e.key] || "").trim().length > 0)
            .map((e) =>
              postGratitudeLedger({
                signal_type: e.signal,
                text: sections[e.key].trim(),
                meta: {
                  journey_id: screenState.journey_id,
                  cycle_day: screenState.cycle_day || screenState.day_number,
                },
              }),
            ),
        );

        mitraTrackEvent("reflection_letter_completed", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {
            cycle_day: screenState.cycle_day || screenState.day_number,
            sections_filled: entries.filter(
              (e) => (sections[e.key] || "").trim().length > 0,
            ).length,
          },
        });

        setScreenValue(true, "_weekly_reflection_submitted");
        setScreenValue(null, "weekly_reflection_draft");

        setTimeout(() => {
          loadScreen({
            container_id: "companion_dashboard",
            state_id: "day_active",
          });
          setScreenValue(false, "_weekly_reflection_submitted");
        }, 1800);
        break;
      }

      case "fetch_resilience_narrative": {
        try {
          const data = await getResilienceNarrative();
          setScreenValue(data || null, "resilience_narrative");
        } catch (err) {
          console.warn("[fetch_resilience_narrative] unexpected error", err);
          setScreenValue(null, "resilience_narrative");
        }
        break;
      }

      // ACCEPT_VOICE_CONSENT — sets voice_consent_given=true via PATCH
      case "accept_voice_consent": {
        setScreenValue(true, "voice_consent_given");
        patchCompanionState({ voice_consent_given: true }).catch(() => {});
        mitraTrackEvent("voice_consent_given", { meta: {} });
        setScreenValue(true, "voice_note_active");
        loadScreen({ container_id: "overlay", state_id: "voice_note" });
        break;
      }

      // DECLINE_VOICE_CONSENT — sets voice_consent_given=false
      case "decline_voice_consent": {
        setScreenValue(false, "voice_consent_given");
        patchCompanionState({ voice_consent_given: false }).catch(() => {});
        mitraTrackEvent("voice_consent_declined", { meta: {} });
        loadScreen({
          container_id: "companion_dashboard",
          state_id: "day_active",
        });
        break;
      }

      case "ack_resilience_narrative": {
        setScreenValue(true, "resilience_narrative_acked");
        mitraTrackEvent("resilience_narrative_acked", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {},
        });
        break;
      }

      case "submit_what_helped": {
        const text: string = ((payload && payload.text) || "").trim();
        if (!text) break;
        await postGratitudeLedger({
          signal_type: "what_held",
          text,
          meta: {
            journey_id: screenState.journey_id,
            source_surface: "resilience_narrative_card",
          },
        });
        mitraTrackEvent("what_helped_submitted", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { text_length: text.length },
        });
        setScreenValue(true, "resilience_narrative_acked");
        break;
      }

      // start_gentle — generic "start a gentle practice" action for
      // post-conflict / grief / loneliness rooms. Caller MUST pass
      // runner_source in payload — never hardcoded here.
      case "start_gentle": {
        try {
          const runnerSource = payload?.runner_source;
          if (!runnerSource) {
            console.warn(
              "[start_gentle] missing required payload.runner_source — aborting",
            );
            break;
          }
          const practiceId = payload?.practice_id || null;
          const runnerVariant = payload?.runner_variant || "practice";
          setScreenValue(runnerSource, "runner_source");
          setScreenValue(runnerVariant, "runner_variant");
          if (practiceId) setScreenValue(practiceId, "runner_practice_id");

          if (startFlowInstance) startFlowInstance("support");

          const destination = payload?.destination || "practice_step_runner";
          loadScreen({ container_id: destination, state_id: payload?.destination_state || "active" });
        } catch (err) {
          console.error("[start_gentle] failed:", err);
        }
        break;
      }

      // ================================================================
      // DASHBOARD_LOAD — Audit fix F1 (2026-04-13).
      // Spec route_dashboard_day_active.md §6 declares 8 parallel API calls
      // on dashboard entry. Previously only generate-companion + clear-window
      // ran. This action orchestrates the full set per the contract.
      // Dispatch from: CompanionDashboardContainer.tsx mount + on focus
      // (with 30s debounce). Failure of any one fetch hides only its card.
      // ================================================================
      case "dashboard_load": {
        // Delegate to fetch_companion_intelligence first for prep/alerts/rec/
        // post-conflict (kept separate so it can also be triggered standalone).
        await executeAction(
          { type: "fetch_companion_intelligence", payload: payload || {} },
          context,
        );

        // Then the rest of the spec-declared parallel calls.
        const results = await Promise.allSettled([
          getBriefingToday(),
          dispatchFetchCompanionState(),
          getResilienceLedger({ limit: 3 }),
          mitraFetchAdditionalItems(),
          getJoySignal(),
          getGriefContext(),
          getPanchangToday(),
          getClearWindow(),
        ]);
        const [
          briefing,
          _cs,
          resilienceLedger,
          additional,
          joy,
          _grief,
          panchang,
          clearWindow,
        ] = results.map((r) => (r.status === "fulfilled" ? r.value : null));

        if (briefing) {
          setScreenValue(true, "briefing_available");
          setScreenValue(briefing.audio_url || null, "briefing_audio_url");
          setScreenValue(briefing.script || briefing.transcript || null, "briefing_transcript");
          setScreenValue(briefing.script || briefing.summary || null, "briefing_summary");
          setScreenValue(briefing.voice_preset || null, "briefing_voice_preset");
          setScreenValue(briefing.duration_ms || null, "briefing_duration_ms");
        } else {
          setScreenValue(false, "briefing_available");
        }

        if (resilienceLedger) setScreenValue(resilienceLedger, "resilience_ledger");
        if (additional?.items) setScreenValue(additional.items, "additional_items");
        if (joy) setScreenValue(joy, "joy_signal");
        // Backend B2 — only show season banner when ritu changed today
        if (panchang?.ritu_changed_today) setScreenValue(panchang, "season_signal");
        else setScreenValue(null, "season_signal");

        // Backend B4-v2 (2026-04-13) — clear_window payload only non-null when
        // all 5 gates pass server-side. Also drives clear_window_active
        // dashboard variant so the banner renders in the hero slot.
        if (clearWindow) {
          setScreenValue(clearWindow, "clear_window");
          setScreenValue("clear_window_active", "dashboard_variant");
        } else {
          setScreenValue(null, "clear_window");
        }

        break;
      }

      case "fetch_companion_intelligence": {
        const results = await Promise.allSettled([
          getPrepContext(payload?.prep_params || {}),
          getPredictiveAlerts(),
          getRecommendedAdditional(),
          getPostConflictContext(),
        ]);
        const [prep, alerts, rec, postConflict] = results.map((r) =>
          r.status === "fulfilled" ? r.value : null,
        );

        // predictive_alert: pick highest-confidence, not-dismissed-today, not muted.
        const dismissedAt =
          screenState.predictive_alert_dismissed_at || 0;
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        const withinCooldown =
          dismissedAt && Date.now() - dismissedAt < sevenDaysMs;
        let topAlert = null;
        if (alerts && Array.isArray(alerts.alerts)) {
          topAlert = alerts.alerts
            .filter((a: any) => (a.confidence ?? 0) >= 0.6)
            .filter((a: any) => a.entity?.status !== "muted")
            .sort((a: any, b: any) => (b.confidence || 0) - (a.confidence || 0))[0] || null;
        }
        setScreenValue(prep || null, "prep_context");
        setScreenValue(withinCooldown ? null : topAlert, "predictive_alert");
        setScreenValue(rec || null, "recommended_additional");
        setScreenValue(postConflict || null, "post_conflict_pending");

        // Provisional entity: first eligible. (Endpoint returns {entities:[...]})
        if (alerts === null && rec === null && prep === null && postConflict === null) {
          // All flags off — nothing to do further.
        }
        break;
      }

      // open_prep_sheet — opens prep_coaching_sheet overlay. If we do not
      // already have prep_context, fetch it lazily.
      case "open_prep_sheet": {
        const existing = screenState.prep_context;
        if (!existing) {
          const prep = await getPrepContext({
            context_type: payload?.context_type,
          });
          setScreenValue(prep || null, "prep_context");
        }
        loadScreen({
          container_id: "companion_dashboard",
          state_id: "prep_coaching_sheet",
        });
        break;
      }

      // ack_prep — Moment 27 "Got it" dismiss.
      case "ack_prep": {
        const ctx = screenState.prep_context || {};
        await mitraTrackEvent("prep_acknowledged", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { context_type: ctx.context_type, surface: ctx.surface },
        });
        // REG-003: overlay dismissal clears sheet-local state and does NOT
        // touch runner_* fields.
        setScreenValue(null, "prep_context");
        goBack();
        break;
      }

      // dismiss_predictive_alert — Moment 28 "Later" tap. Cools 7d.
      case "dismiss_predictive_alert": {
        setScreenValue(null, "predictive_alert");
        setScreenValue(Date.now(), "predictive_alert_dismissed_at");
        // Fire-and-forget track-event. No PATCH needed (dismissal is local).
        mitraTrackEvent("predictive_alert_dismissed", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { id: payload?.id, reason: "not_this_time" },
        });
        break;
      }

      // confirm_entity — Moment 29 "Yes that's them".
      case "confirm_entity": {
        const id = payload?.id;
        if (id) {
          await patchEntity(id, {
            status: "confirmed",
            relation_note: payload?.relation_note,
          });
          mitraTrackEvent("entity_confirmed", {
            journeyId: screenState.journey_id,
            dayNumber: screenState.day_number || 1,
            meta: { entity_id: id },
          });
        }
        setScreenValue(null, "entity_recognition_pending");
        goBack();
        break;
      }

      // reject_entity — Moment 29 "Different person" / "Not a person".
      case "reject_entity": {
        const id = payload?.id;
        if (id) {
          await patchEntity(id, { status: "dismissed" });
          mitraTrackEvent("entity_dismissed", {
            journeyId: screenState.journey_id,
            dayNumber: screenState.day_number || 1,
            meta: { entity_id: id, reason: payload?.reason },
          });
        }
        setScreenValue(null, "entity_recognition_pending");
        goBack();
        break;
      }

      // ================================================================
      // start_recommended_additional — Moment 30 "Begin" + Moment 27
      // "Prepare now" + Moment 39 "Start gentle".
      //
      // CRITICAL REG-015: this handler is the single chokepoint for
      // recommended-additional runner starts. The source is hard-coded
      // to "additional_recommended" so no caller can accidentally start a
      // core runner. Any future edit here must preserve this invariant:
      //
      //   assert(source === "additional_recommended")
      //
      // The start_runner case (see above) in turn stamps runner_source
      // which track_completion reads without modification — the two
      // together guarantee no leak to core.
      // ================================================================
      case "start_recommended_additional": {
        const sp = payload || {};
        // REG-015 assertion — hard-coded source; do NOT accept a payload override.
        const source = "additional_recommended"; // assert: never "core"
        const variant = sp.variant || sp.item?.item_type || "practice";
        const item = sp.item || null;
        const intent = sp.intent || "recommended";

        // Track acceptance event for analytics.
        mitraTrackEvent("recommended_additional_accepted", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {
            item_type: item?.item_type,
            item_id: item?.item_id,
            intent,
            duration_sec: sp.duration_sec,
          },
        });

        // Clear the card after accept (it's consumed).
        if (intent === "recommended") {
          setScreenValue(null, "recommended_additional");
        } else if (intent === "prep") {
          // Prep sheet stays closed after runner starts.
          setScreenValue(null, "prep_context");
        } else if (intent === "post_conflict_soften") {
          setScreenValue(null, "post_conflict_pending");
        }

        // Delegate to start_runner with the enforced source. This keeps
        // all runner setup logic in one place (INV-3, INV-6).
        await executeAction(
          {
            type: "start_runner",
            payload: {
              variant,
              item,
              source,
              duration_sec: sp.duration_sec,
              target_reps: sp.target_reps,
              steps: sp.steps,
            },
            currentScreen: action.currentScreen,
          },
          context,
        );
        break;
      }

      // dismiss_recommended_additional — Moment 30 "Not now".
      case "dismiss_recommended_additional": {
        setScreenValue(null, "recommended_additional");
        setScreenValue(Date.now(), "recommended_additional_dismissed_at");
        mitraTrackEvent("recommended_additional_dismissed", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {},
        });
        break;
      }

      // ack_post_conflict — Moment 39 "I'm okay". Backend B3 (2026-04-13)
      // ships PATCH /api/mitra/dissonance-threads/<id>/ accepting status:
      // acknowledged | resolved | stale | softened.
      case "ack_post_conflict": {
        const threadId = payload?.thread_id;
        if (threadId) {
          await patchDissonanceThread(threadId, { status: "acknowledged" });
        }
        setScreenValue(null, "post_conflict_pending");
        setScreenValue(true, "post_conflict_acked");
        mitraTrackEvent("post_conflict_acknowledged", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { thread_id: threadId },
        });
        break;
      }

      // open_post_conflict_voice_note — Moment 39 "Something to say?".
      case "open_post_conflict_voice_note": {
        mitraTrackEvent("post_conflict_voice_note_opened", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { thread_id: payload?.thread_id },
        });
        // Voice-note overlay is a Phase 3 surface outside Week 6 scope; we
        // reuse the reflection voice surface if present, else fall back to
        // reflection_entry.
        loadScreen({
          container_id: "reflection_entry",
          state_id: "voice_note",
        });
        break;
      }

      case "open_why_this_l2": {
        const principleId = payload?.principle_id;
        if (!principleId) {
          console.warn("[open_why_this_l2] missing principle_id");
          break;
        }
        const principle = await getPrinciple(principleId);
        setScreenValue(principle, "why_this_principle");
        setScreenValue(null, "why_this_source");
        loadScreen({
          container_id: (screenState._overlay_parent_container as string) ||
            screenState.currentContainerId || "companion_dashboard",
          state_id: "why_this_l2",
        } as any);
        mitraTrackEvent("why_this_l2_opened", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { principle_id: principleId },
        });
        break;
      }

      case "open_why_this_l3": {
        const principleId =
          payload?.principle_id ||
          (screenState.why_this_principle && screenState.why_this_principle.id);
        if (!principleId) {
          console.warn("[open_why_this_l3] missing principle_id");
          break;
        }
        const source = await getPrincipleSource(principleId);
        setScreenValue(source, "why_this_source");
        loadScreen({
          container_id: (screenState.currentContainerId as string) || "companion_dashboard",
          state_id: "why_this_l3",
        } as any);
        mitraTrackEvent("why_this_l3_opened", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { principle_id: principleId },
        });
        break;
      }

      // ================================================================
      // T3B-4 — open_trigger + open_check_in handlers.
      // Spec: SUPPORT_ADVICE_AUDIT.md gap 8. new_dashboard dispatched
      // these actions but they were undefined in actionExecutor —
      // runtime error on tap. Implementations route to the existing
      // support containers (SupportTriggerContainer + SupportCheckinContainer).
      // ================================================================
      case "open_trigger": {
        // Fresh entry — reset the trigger round + any lingering feeling
        // so the user doesn't resume in a stale state.
        setScreenValue(1, "trigger_round");
        setScreenValue(null, "trigger_previous_suggestion_id");
        setScreenValue(null, "trigger_previous_suggestion_type");
        setScreenValue("", "trigger_feeling");
        loadScreen({
          container_id: "support_trigger",
          state_id: "feeling_select",
        } as any);
        mitraTrackEvent("trigger_flow_opened", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { parent_source: payload?.source || "dashboard" },
        });
        break;
      }

      case "open_check_in": {
        // Reset the 3-step state machine (notice → name → settle).
        setScreenValue("notice", "checkin_step");
        setScreenValue(null, "checkin_draft");
        loadScreen({
          container_id: "support_checkin",
          state_id: "notice",
        } as any);
        mitraTrackEvent("checkin_flow_opened", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { parent_source: payload?.source || "dashboard" },
        });
        break;
      }

      // T3A-3 — Crisis safety surface.
      // User taps 'I'm not safe right now' on dashboard (or elsewhere).
      // Call /api/mitra/crisis/ with trigger=button_tap — always returns
      // a full crisis payload. Seed it into Redux so CrisisRoomContainer
      // can render. If network fails, the container has a local
      // fallback (sovereignty rule explicitly waived for this surface).

      // "I want to start over" — abandon current journey, restart from
      // stage 1 (growth/support lane selection).
      case "reset_journey": {
        try {
          const { mitraResetJourney } = require("./mitraApi");
          const res = await mitraResetJourney();
          if (__DEV__) console.log("[RESET] Journey reset:", res?.status);

          const clearKeys = [
            "journey_id", "day_number", "total_days", "mantra_text",
            "sankalp_text", "practice_title", "companion_mantra_id",
            "companion_sankalp_id", "companion_practice_id",
            "companion_mantra_title", "companion_sankalp_line",
            "companion_practice_title", "path_intent", "scan_focus",
            "cycle_id", "onboarding_draft_state", "onboarding_turn",
            "practice_chant", "practice_embody", "practice_act",
            "sankalp_how_to_live", "master_mantra", "master_sankalp",
            "master_practice", "stashed_inference_state",
            "stashed_guidance_mode", "checkpoint_completed",
          ];
          for (const key of clearKeys) {
            setScreenValue(null, key);
          }

          mitraTrackEvent("journey_reset", {
            meta: { source: "dashboard_start_over" },
          }).catch(() => {});

          setScreenValue(2, "onboarding_turn");
          setScreenValue({ started_at: Date.now() }, "onboarding_draft_state");
          loadScreen({
            container_id: "welcome_onboarding",
            state_id: "turn_2",
          } as any);
        } catch (err) {
          if (__DEV__) console.error("[RESET] Failed:", err);
        }
        break;
      }

      case "open_crisis": {
        const { mitraCrisis } = require("./mitraApi");
        let crisisPayload = null;
        try {
          crisisPayload = await mitraCrisis({
            trigger: "button_tap",
            source_surface: payload?.source || "dashboard",
          });
        } catch (_err) {
          // Swallow — CrisisRoomContainer has its own local fallback.
          crisisPayload = null;
        }
        setScreenValue(crisisPayload, "crisis_payload");
        loadScreen({
          container_id: "crisis_room",
          state_id: "grounding",
        } as any);
        mitraTrackEvent("crisis_surface_opened", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {
            parent_source: payload?.source || "dashboard",
            is_crisis: crisisPayload?.is_crisis ?? null,
            tier: crisisPayload?.tier ?? null,
          },
        });
        break;
      }

      // ================================================================
      // v3.1.1-wisdom §14 — canonical room entry dispatch.
      //
      // Spec: docs/ROOM_SYSTEM_V3_1_ARCHITECTURE.md §14.1 / §14.3.
      //
      // Dispatched by the §14.1 "I'm in a good place" primary chip and
      // by every RoomEntrySheet row (§14.3). Payload shape:
      //   { room_id: RoomId, source?: string }
      //
      // Routing policy (Phase 5 — flag OFF default):
      //   - EXPO_PUBLIC_MITRA_V3_ROOMS === "1" → route to the v3.1
      //     RoomRenderer surface ({container_id:"room", state_id:"render",
      //     meta:{room_id}}). NOT wired into allContainers yet; that
      //     mounting lands in Phase 6 per-room flips.
      //   - Flag OFF → map canonical room_id onto the legacy support_*
      //     container when one exists (room_release→support_grief,
      //     room_connection→support_loneliness, room_joy→support_joy,
      //     room_growth→support_growth). Rooms without a legacy
      //     container (room_stillness, room_clarity) show a "Coming
      //     soon" toast until Phase 6.
      //
      // This handler intentionally does NOT clear runner_* state: each
      // downstream legacy enter_* case already handles that, and the
      // flag-ON RoomRenderer path owns its own state via envelope.
      // ================================================================
      case "enter_room": {
        const roomId: string = payload?.room_id || "";
        const source: string = payload?.source || "quick_support_block";
        if (!roomId) {
          console.warn("[actionExecutor] enter_room: missing room_id");
          break;
        }

        mitraTrackEvent("room_entry_dispatched", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { room_id: roomId, source },
        });

        const flagOn = process.env.EXPO_PUBLIC_MITRA_V3_ROOMS === "1";
        if (flagOn) {
          // Phase 6 target surface. allContainers wiring lands with the
          // per-room flip; until then this is a forward-compatible stub.
          loadScreen({
            container_id: "room",
            state_id: "render",
            meta: { room_id: roomId },
          } as any);
          break;
        }

        // Flag OFF — legacy dev-bridge mapping. Reuse the existing
        // support_* enter_* handlers so session state, context fetches,
        // and telemetry continue to match the legacy flow contract.
        const legacyActionMap: Record<string, string> = {
          room_joy: "enter_joy_room",
          room_growth: "enter_growth_room",
          room_release: "enter_grief_room",
          room_connection: "enter_loneliness_room",
        };
        const legacyAction = legacyActionMap[roomId];
        if (legacyAction) {
          await executeAction(
            { type: legacyAction, payload: { source } },
            context,
          );
          break;
        }

        // room_stillness + room_clarity have no legacy container.
        // Surface a Coming-Soon acknowledgement until Phase 6 ships
        // the RoomRenderer flip for these rooms.
        try {
          Alert.alert(
            "Coming soon",
            "This room is on the way. Your path is held.",
          );
        } catch {
          // Alert can fail in test harness; swallow.
        }
        mitraTrackEvent("room_entry_coming_soon", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { room_id: roomId, source },
        });
        break;
      }

      // WEEK 7 — Grief room enter/exit.
      // Spec: route_support_grief.md.
      // REG-015: clears runner_* so grief never overlaps with a practice
      // runner. Exit clears only grief_session_* (no runner touches).
      // ================================================================
      case "enter_grief_room": {
        // REG-015: strip runner state so grief doesn't leak into core flow.
        setScreenValue(null, "runner_variant");
        setScreenValue(null, "runner_source");
        setScreenValue(null, "runner_active_item");
        setScreenValue(0, "runner_reps_completed");
        setScreenValue(0, "runner_step_index");
        setScreenValue(0, "runner_duration_actual_sec");
        setScreenValue(null, "runner_start_time");

        setScreenValue(true, "grief_session_active");
        setScreenValue(Date.now(), "grief_session_start");

        const ctx = await getGriefContext();
        if (ctx) setScreenValue(ctx, "grief_context");

        loadScreen({ container_id: "support_grief", state_id: "room" } as any);
        break;
      }

      case "exit_grief_room": {
        setScreenValue(false, "grief_session_active");
        setScreenValue(null, "grief_session_start");
        setScreenValue(null, "grief_context");
        mitraTrackEvent("grief_session_ended", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { 
            duration_sec: (Date.now() - (screenState.grief_session_start || 0)) / 1000,
            actions_used: payload?.actions_used || []
          },
        });
        loadScreen({
          container_id: "companion_dashboard",
          state_id: "day_active",
        } as any);
        break;
      }

      case "grief_voice_note_submitted": {
        mitraTrackEvent("grief_voice_note_submitted", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { 
            duration_sec: payload?.duration_sec,
            length_chars: payload?.length_chars 
          },
        });
        break;
      }

      case "grief_session_abandoned": {
        mitraTrackEvent("grief_session_abandoned", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { duration_sec: payload?.duration_sec },
        });
        break;
      }

      // Inner-room muted CTAs: they stay in the room — no navigation.
      case "grief_stay": {
        mitraTrackEvent("grief_sit_with_me", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {},
        });
        break;
      }
      case "grief_voice_note": {
        // Week 4 voice consent flow owns the actual recorder. Here we just
        // mark intent and track; the sheet opens from Week 4 hooks if consent.
        setScreenValue(true, "grief_voice_note_requested");
        mitraTrackEvent("grief_voice_note_requested", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {},
        });
        break;
      }

      // ================================================================
      // WEEK 7 — Loneliness room enter/exit. Symmetric to grief.
      // Spec: route_support_loneliness.md.
      // ================================================================
      case "enter_loneliness_room": {
        setScreenValue(null, "runner_variant");
        setScreenValue(null, "runner_source");
        setScreenValue(null, "runner_active_item");
        setScreenValue(0, "runner_reps_completed");
        setScreenValue(0, "runner_step_index");
        setScreenValue(0, "runner_duration_actual_sec");
        setScreenValue(null, "runner_start_time");

        setScreenValue(true, "loneliness_session_active");
        setScreenValue(Date.now(), "loneliness_session_start");

        const ctx = await getLonelinessContext();
        if (ctx) setScreenValue(ctx, "loneliness_context");

        loadScreen({
          container_id: "support_loneliness",
          state_id: "room",
        } as any);
        break;
      }

      case "exit_loneliness_room": {
        setScreenValue(false, "loneliness_session_active");
        setScreenValue(null, "loneliness_session_start");
        setScreenValue(null, "loneliness_context");
        mitraTrackEvent("loneliness_session_ended", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { duration_sec: (Date.now() - (screenState.loneliness_session_start || 0)) / 1000 },
        });
        loadScreen({
          container_id: "companion_dashboard",
          state_id: "day_active",
        } as any);
        break;
      }

      // ================================================================
      // TRACK 1 — Joy room enter/exit. Symmetric to grief/loneliness.
      // Moment M48. Mirrors flow contract; emotional behavior differs
      // (lighter timing, no weight_guard max cap).
      // ================================================================
      case "enter_joy_room": {
        setScreenValue(null, "runner_variant");
        setScreenValue(null, "runner_source");
        setScreenValue(null, "runner_active_item");
        setScreenValue(0, "runner_reps_completed");
        setScreenValue(0, "runner_step_index");
        setScreenValue(0, "runner_duration_actual_sec");
        setScreenValue(null, "runner_start_time");

        setScreenValue(true, "joy_session_active");
        setScreenValue(Date.now(), "joy_session_start");

        loadScreen({
          container_id: "support_joy",
          state_id: "room",
        } as any);
        break;
      }

      case "exit_joy_room": {
        setScreenValue(false, "joy_session_active");
        setScreenValue(null, "joy_session_start");
        mitraTrackEvent("joy_session_ended", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {
            duration_sec: (Date.now() - (screenState.joy_session_start || 0)) / 1000,
            actions_used: payload?.actions_used || [],
          },
        });
        loadScreen({
          container_id: "companion_dashboard",
          state_id: "day_active",
        } as any);
        break;
      }

      // ================================================================
      // CARRY_JOY_FORWARD — Joy room §C.3 INLINE_STEP semantics.
      //
      // Founder decision 2026-04-19 (Option A, frontend-first): the
      // "Carry it forward" pill must honor its label. Previously it
      // dispatched exit_joy_room — label/action mismatch. Now it stamps
      // a session-scoped `joy_carry` trace that the dashboard renders as
      // a same-day chip under the greeting, then returns to the room
      // options (per INLINE_STEP contract). Exit is a separate pill.
      //
      // Backend persistence is deferred (see Locked Adjustments memory).
      // Chip lives in Redux — visible for the current session and same
      // calendar day. Cross-session persistence can be added later via
      // JournalEvent when backend ships the endpoint.
      // ================================================================
      case "carry_joy_forward": {
        const now = Date.now();
        const label = payload?.label || "";
        setScreenValue(
          {
            captured_at: now,
            label,
          },
          "joy_carry",
        );
        mitraTrackEvent("joy_carried_forward", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { label, captured_at: now },
        });
        break;
      }

      case "joy_named": {
        mitraTrackEvent("joy_named", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {
            text: payload?.text || "",
            length_chars: payload?.length_chars ?? (payload?.text || "").length,
          },
        });
        break;
      }

      case "joy_offering_noted": {
        mitraTrackEvent("joy_offering_noted", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {
            label: payload?.label || "",
          },
        });
        break;
      }

      case "joy_walk_started": {
        mitraTrackEvent("joy_walk_started", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {
            duration_min: payload?.duration_min ?? null,
            label: payload?.label || "",
          },
        });
        break;
      }

      case "joy_sit_started": {
        mitraTrackEvent("joy_sit_started", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {
            label: payload?.label || "",
          },
        });
        break;
      }

      // ================================================================
      // TRACK 1 — Growth room enter/exit. Symmetric to grief/loneliness.
      // Moment M49 + M49_inquiry_seeds. Seeded-inquiry sub-flow lives
      // inside growth_room/index.tsx as internal state (not a separate
      // container).
      // ================================================================
      case "enter_growth_room": {
        setScreenValue(null, "runner_variant");
        setScreenValue(null, "runner_source");
        setScreenValue(null, "runner_active_item");
        setScreenValue(0, "runner_reps_completed");
        setScreenValue(0, "runner_step_index");
        setScreenValue(0, "runner_duration_actual_sec");
        setScreenValue(null, "runner_start_time");

        setScreenValue(true, "growth_session_active");
        setScreenValue(Date.now(), "growth_session_start");

        loadScreen({
          container_id: "support_growth",
          state_id: "room",
        } as any);
        break;
      }

      case "exit_growth_room": {
        setScreenValue(false, "growth_session_active");
        setScreenValue(null, "growth_session_start");
        mitraTrackEvent("growth_session_ended", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {
            duration_sec: (Date.now() - (screenState.growth_session_start || 0)) / 1000,
            actions_used: payload?.actions_used || [],
          },
        });
        loadScreen({
          container_id: "companion_dashboard",
          state_id: "day_active",
        } as any);
        break;
      }

      // Generic return-to-source: reads runner_source (stamped by
      // start_runner from a support room) and navigates back to that
      // container so mantra completion loops back to the room, not
      // dashboard. Used by the source-aware M_completion_return variants
      // (return_action slot). Falls back to dashboard if source unknown.
      case "return_to_source": {
        const source = screenState.runner_source;
        const map: Record<
          string,
          { container_id: string; state_id: string }
        > = {
          support_grief: { container_id: "support_grief", state_id: "room" },
          support_loneliness: {
            container_id: "support_loneliness",
            state_id: "room",
          },
          // Track 1 — Joy + Growth first-class support rooms.
          support_joy: { container_id: "support_joy", state_id: "room" },
          support_growth: { container_id: "support_growth", state_id: "room" },
        };
        const target = map[source as string];
        // Clear runner state BEFORE nav so the room remounts clean.
        setScreenValue(null, "runner_variant");
        setScreenValue(null, "runner_source");
        setScreenValue(null, "runner_active_item");
        setScreenValue(null, "runner_start_time");
        setScreenValue(0, "runner_reps_completed");
        if (target) {
          loadScreen(target as any);
        } else {
          loadScreen({
            container_id: "companion_dashboard",
            state_id: "day_active",
          } as any);
        }
        break;
      }

      case "loneliness_named": {
        mitraTrackEvent("loneliness_named", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {
            body_location: payload?.text,
            length_chars: (payload?.text || "").length,
          },
        });
        break;
      }

      case "loneliness_person_named": {
        mitraTrackEvent("loneliness_person_named", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {}, // spec specifies no contact content transmitted
        });
        break;
      }

      case "loneliness_walk_started": {
        mitraTrackEvent("loneliness_walk_started", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { duration_min: payload?.duration_min },
        });
        break;
      }

      case "loneliness_stay": {
        mitraTrackEvent("loneliness_stay", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {},
        });
        break;
      }

      // ================================================================
      // WEEK 7 — Gratitude joy-signal submission.
      // Spec: embedded_gratitude_joy_card.md.
      // ================================================================
      case "submit_gratitude_joy": {
        const text = (payload?.text || "").trim();
        if (!text) break;
        const signalId =
          payload?.signal_id ||
          (screenState.joy_signal && screenState.joy_signal.id) ||
          null;
        await postGratitudeLedger({
          signal_type: "joy_signal",
          text,
          meta: { signal_id: signalId },
        });
        // Clear the signal so the card collapses and doesn't re-render today.
        setScreenValue(null, "joy_signal");
        mitraTrackEvent("gratitude_joy_submitted", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: { length: text.length },
        });
        break;
      }

      // ================================================================
      // WEEK 7 — Season banner dismiss (7d hide).
      // Spec: embedded_season_change_banner.md.
      // ================================================================
      case "dismiss_season_banner": {
        setScreenValue(Date.now(), "season_banner_dismissed_at");
        mitraTrackEvent("season_banner_dismissed", {
          journeyId: screenState.journey_id,
          dayNumber: screenState.day_number || 1,
          meta: {},
        });
        break;
      }

      case "dashboard_query": {
        console.log("[ActionExecutor] dashboard_query captured:", payload);
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
