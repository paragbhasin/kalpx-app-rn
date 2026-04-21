/**
 * Mitra API Functions — React Native Port
 *
 * Ported from Vue actionExecutor.js (lines 68-459).
 * All functions are async and return data or null on error.
 * The RN axios client (../Networks/axios) handles JWT/guest UUID headers
 * via interceptors, so no manual auth headers are needed.
 */

import api from "../Networks/axios";

// ---------------------------------------------------------------------------
// Offline fallbacks — used when backend is unreachable (dev 502, airplane
// mode, flag-off). Minimal stub data so screens never render "—" / blanks.
// Full dynamicContentEngine port (Vue parity) is a future task; these are
// the smallest-possible shapes that satisfy the readers across the 30 blocks.
// ---------------------------------------------------------------------------

function generateHelpMeChooseResponse(input: any): any {
  const text = (input?.text || "").toLowerCase();
  // Simple keyword → focus mapping (mirrors web fallback pattern)
  const focus = /work|career|deadline/.test(text)
    ? "clarity"
    : /relation|partner|family|sarah|mother|father/.test(text)
      ? "connection"
      : /anger|stress|upset|tight|tense/.test(text)
        ? "regulation"
        : /quiet|rest|sleep|tired/.test(text)
          ? "stillness"
          : "grounding";
  return { focus, sub_focus: null, label: focus, _offline_fallback: true };
}

function generatePranaAcknowledgement(
  pranaType: string,
  _focus: string,
  _locale: string,
): any {
  const insights: Record<string, string> = {
    steady: "Steady is enough. Stay here.",
    heavy: "It's heavy. That's honest. Be kind with yourself today.",
    activated: "Something is rising. Notice it. Let it settle before you act.",
  };
  return {
    insight: insights[pranaType] || "I heard you.",
    _offline_fallback: true,
  };
}

function generateTriggerMantraSuggestions(
  _feeling: string,
  _locale: string,
): any {
  return {
    mantras: [
      {
        id: "trig_om",
        title: "Om",
        devanagari: "ॐ",
        one_line: "The simplest sound. Start here.",
      },
      {
        id: "trig_so_hum",
        title: "So Hum",
        devanagari: "सो हम्",
        one_line: "I am that. With the breath.",
      },
    ],
    _offline_fallback: true,
  };
}

function generateCheckpointData(screenState: any): any {
  const day = screenState?.day_number || 7;
  return {
    day_number: day,
    headline:
      day >= 14
        ? "Two weeks. Something settled."
        : "You've been at this a week.",
    summary:
      "The practice is the practice. Keep going if it is serving; shift if it is not.",
    options: [
      { id: "continue_same", label: "Continue the same path" },
      { id: "deepen", label: "Deepen this path" },
      { id: "change_focus", label: "Shift to a new focus" },
    ],
    _offline_fallback: true,
  };
}

function generateResetPlan(_obstacle: string): any {
  return {
    plan: {
      headline: "Start small.",
      steps: ["One slow breath.", "One honest sentence.", "One clean action."],
    },
    _offline_fallback: true,
  };
}

function generateInfoScreenData(type: string, _data: any): any {
  const defaults: Record<string, any> = {
    mantra: {
      title: "Om Namah Shivaya",
      devanagari: "ॐ नमः शिवाय",
      meaning: "A turning toward the steady self.",
      instruction: "Chant slowly. Let the meaning settle within.",
    },
    sankalp: {
      line: "I protect what matters and let the rest pass.",
      instruction: "Hold the intention in the body, not just the mind.",
    },
    practice: {
      title: "Nine slow breaths, eyes soft",
      instruction:
        "Sit comfortably. Breathe in for four, out for six. Nine rounds.",
    },
  };
  return { ...(defaults[type] || {}), _offline_fallback: true };
}

function generatePathEvolutionScreen(oldFocus: string, newFocus: string): any {
  return {
    headline: `Shifting from ${oldFocus} to ${newFocus}.`,
    subtext: "The path moves when you move. Trust the turn.",
    _offline_fallback: true,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getTz(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata";
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/** POST mitra/track-event/ — Track a journey event or milestone. */
export async function mitraTrackEvent(
  eventName: string,
  inputData: any,
): Promise<any> {
  try {
    const { journeyId, dayNumber, meta } = inputData;
    const res = await api.post("mitra/track-event/", {
      eventName,
      journeyId,
      dayNumber,
      locale: "en",
      tz: getTz(),
      meta: meta || {},
    });
    console.log(`[MITRA] track-event "${eventName}" logged`);
    return res.data;
  } catch (err: any) {
    console.warn(`[MITRA] track-event "${eventName}" failed:`, err.message);
    return null;
  }
}

/** POST mitra/track-completion/ — Track practice/mantra/sankalp completion. */
export async function mitraTrackCompletion(inputData: any): Promise<any> {
  try {
    const { itemType, itemId, source, journeyId, dayNumber, meta } = inputData;
    const res = await api.post("mitra/track-completion/", {
      itemType,
      itemId,
      source,
      journeyId,
      dayNumber,
      tz: getTz(),
      meta: meta || {},
    });
    console.log("[MITRA] track-completion API response received", res.data);
    return res.data;
  } catch (err: any) {
    console.warn("[MITRA] track-completion API failed:", err.message);
    return null;
  }
}

/** POST mitra/help-me-choose/ — AI-powered path/focus guidance. */
/**
 * POST /api/mitra/onboarding/recognition/ — Sadhana Yatra Stage 5.
 * Composes the "recognition line" from the user's 4-stage onboarding signals.
 *
 * Gated by `MITRA_V3_RECOGNITION_BACKEND=1` (runtime env). When disabled OR the
 * backend returns non-2xx, falls back to a simple JS-composed template so the
 * UI always has a non-empty recognition_line to render.
 */
export interface MitraRecognitionPayload {
  path: "support" | "growth";
  primary_kosha?: string;
  primary_vritti?: string;
  primary_klesha?: string;
  aliveness_state?: string;
  aspiration?: string;
  preferred_modality?: string;
  guidance_mode: "universal" | "hybrid" | "rooted";
  freeforms?: Record<string, string>;
}

export interface MitraRecognitionResponse {
  recognition_line: string;
  resolution: any;
}

function composeRecognitionFallback(
  p: MitraRecognitionPayload,
): MitraRecognitionResponse {
  if (p.path === "support") {
    const koshaPhrase: Record<string, string> = {
      annamaya: "your body is holding something tight",
      pranamaya: "your breath has gone uneven",
      manomaya: "your mind is not settling",
      vijnanamaya: "your clarity is clouded",
      anandamaya: "something deep inside feels heavy",
    };
    const k = koshaPhrase[p.primary_kosha || ""] || "something in you needs care";
    return {
      recognition_line: `I hear you — ${k}. Let's begin gently.`,
      resolution: { source: "fallback", path: "support" },
    };
  }
  const aspirationPhrase: Record<string, string> = {
    clarity: "clarity",
    peace: "peace",
    strength: "strength",
    devotion: "devotion",
    purpose: "purpose",
    steadiness: "steadiness",
  };
  const a = aspirationPhrase[p.aspiration || ""] || "growth";
  return {
    recognition_line: `Beautiful — you're here for ${a}. Let's honour that.`,
    resolution: { source: "fallback", path: "growth" },
  };
}

/** POST mitra/onboarding/complete/ — unified one-shot onboarding endpoint.
 *
 * Takes all 4-stage choices + guidance_mode and returns:
 *   inference (internal state), recognition (composed line), triad
 *   (mantra/sankalp/practice — or triad_pending:true for guests),
 *   journey metadata, dashboard_chrome, bridges, stage_subtexts.
 *
 * This is the canonical Call 4 in the v3 onboarding flow. Replaces
 * the deprecated separate /recognition/ + /generate-companion/ calls.
 */
export async function mitraOnboardingComplete(payload: {
  stage0_choice: string;
  stage1_choice: string;
  stage2_choice: string;
  stage3_choice: string;
  guidance_mode: string;
  freeforms?: Record<string, string | null>;
}): Promise<any> {
  try {
    const res = await api.post("mitra/onboarding/complete/", payload);
    return res.data;
  } catch (err: any) {
    console.warn("[MITRA] onboarding/complete failed:", err?.message);
    return null;
  }
}


export async function mitraOnboardingRecognition(
  payload: MitraRecognitionPayload,
): Promise<MitraRecognitionResponse> {
  // Env flag — RN exposes process.env at build time via Expo.
  const flagOn =
    (process.env.MITRA_V3_RECOGNITION_BACKEND ||
      process.env.EXPO_PUBLIC_MITRA_V3_RECOGNITION_BACKEND ||
      "0") === "1";
  if (!flagOn) {
    return composeRecognitionFallback(payload);
  }
  try {
    const res = await api.post("mitra/onboarding/recognition/", payload);
    const data = res.data || {};
    if (!data.recognition_line) {
      return composeRecognitionFallback(payload);
    }
    return {
      recognition_line: data.recognition_line,
      resolution: data.resolution || null,
    };
  } catch (err: any) {
    console.warn(
      "[MITRA] onboarding/recognition failed, using fallback:",
      err?.message,
    );
    return composeRecognitionFallback(payload);
  }
}

/** GET /api/mitra/onboarding/chips/ — Fetch dynamic stage chips. */
export async function mitraFetchOnboardingChips(params: {
  stage: number;
  lane: string;
  guidance_mode: string;
  stage1_choice?: string;
  stage2_choice?: string;
}): Promise<any> {
  try {
    console.log("[MITRA] Fetch Chips Payload:", params);
    const res = await api.get("mitra/onboarding/chips/", { params });
    console.log("[MITRA] Fetch Chips Response:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("[MITRA] fetch onboarding chips failed:", err.message);
    return null;
  }
}


// ─── legacy journey wrappers retired (journey-v3-fe Step 11) ─────────
// Deleted: mitraJourneyHome, mitraGetCheckpoint, mitraSubmitCheckpoint,
// mitraCheckpoint, mitraJourneyCompanion, mitraJourneyWelcomeBack.
// All callers migrated to v3 (mitraJourney{Entry,Daily,Day7,Day14}View +
// mitraJourney{Reentry,Day7,Day14}Decision).
// ─────────────────────────────────────────────────────────────────────

/** POST /api/mitra/onboarding/complete/ — Finish onboarding and get recognition. */
export async function mitraCompleteOnboarding(payload: {
  stage0_choice: string;
  stage1_choice: string;
  stage2_choice: string;
  stage3_choice: string;
  guidance_mode: string;
  freeforms: Record<string, string | null>;
}): Promise<any> {
  try {
    console.log("[MITRA] Complete Onboarding Payload:", payload);
    const res = await api.post("mitra/onboarding/complete/", payload);
    console.log("[MITRA] Complete Onboarding Response:", res.data);
    return res.data;
  } catch (err: any) {
    console.error("[MITRA] complete onboarding failed:", err.message);
    return null;
  }
}

/** POST /api/mitra/journey/start-v3/ — v3 triad generation (authenticated).
 *
 * This is the ONLY triad generation endpoint. Legacy /journey/start/ is
 * deprecated. Requires authentication — returns null for guests (call
 * after auth with stashed inference_state from /onboarding/complete/).
 *
 * v3 response shape:
 *   { triad: { mantra, sankalp, practice },
 *     scan_focus, path_intent, movement_goal_label, rupture_inferred,
 *     confidence, hard_fallback, downgrade_applied,
 *     coherence_adjustment_used, fallback_reason,
 *     mode_served, locale_served, cycle_id, journey_context_id }
 */
export async function mitraStartJourney(payload: {
  inference_state: Record<string, any>;
  guidance_mode: string;
  locale?: string;
  tz?: string;
  cycle_id?: string;
  stage0_choice?: string;
  stage1_choice?: string;
  stage2_choice?: string;
  stage3_choice?: string;
}): Promise<any> {
  try {
    console.log("[MITRA] Start Journey v3 Payload:", payload);
    const res = await api.post("mitra/journey/start-v3/", payload);
    console.log("[MITRA] Start Journey v3 Response:", res.data);
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 401) {
      console.log("[MITRA] journey/start-v3/ requires auth — stash inference for post-auth call");
      return null;
    }
    if (status === 404) {
      console.log("[MITRA] journey/start-v3/ flag off on server");
      return null;
    }
    console.error("[MITRA] journey start v3 failed:", err.message);
    return null;
  }
}

export async function mitraHelpMeChoose(inputData: any): Promise<any> {
  try {
    const res = await api.post("mitra/help-me-choose/", inputData);
    return res.data;
  } catch (err: any) {
    console.warn("[MITRA] help-me-choose failed, falling back:", err.message);
    return generateHelpMeChooseResponse(inputData);
  }
}

/** POST mitra/prana-acknowledge/ — Prana check-in acknowledgement. */
export async function mitraPranaAcknowledge(inputData: any): Promise<any> {
  try {
    const res = await api.post("mitra/prana-acknowledge/", inputData);
    return res.data;
  } catch (err: any) {
    console.warn(
      "[MITRA] prana-acknowledge failed, falling back:",
      err.message,
    );
    return generatePranaAcknowledgement(
      inputData.pranaType,
      inputData.focus,
      inputData.locale || "en",
    );
  }
}

/** POST mitra/trigger-mantras/ — Trigger mantra suggestions. */
export async function mitraTriggerMantras(inputData: any): Promise<any> {
  try {
    const res = await api.post("mitra/trigger-mantras/", inputData);
    return res.data;
  } catch (err: any) {
    console.warn("[MITRA] trigger-mantras failed, falling back:", err.message);
    return generateTriggerMantraSuggestions(
      inputData.feeling,
      inputData.locale || "en",
    );
  }
}




// mitraResetPlan + mitraInfoScreen removed 2026-04-18 — audited as
// zero-call-site dead wrappers. Local fallback generators
// (generateResetPlan / generateInfoScreenData) kept if any future
// consumer wants to reconstruct them. If neither is used a quarter
// from now, delete those too.

/** POST mitra/path-evolution/ — Path evolution narrative on focus change. */
export async function mitraPathEvolution(
  oldFocus: string,
  newFocus: string,
): Promise<any> {
  try {
    const res = await api.post("mitra/path-evolution/", { oldFocus, newFocus });
    return res.data;
  } catch (err: any) {
    console.warn("[MITRA] path-evolution failed, falling back:", err.message);
    return generatePathEvolutionScreen(oldFocus, newFocus);
  }
}

/** GET mitra/journey/additional/list/ — Fetch user's additional practices. */
export async function mitraFetchAdditionalItems(): Promise<any> {
  try {
    const res = await api.get("mitra/journey/additional/list/", {
      params: { tz: getTz() },
    });
    return res.data;
  } catch (err: any) {
    // Non-fatal — block renders empty state / hides itself via uiHints.
    console.warn("[MITRA] fetch additional items failed:", err.message);
    return { items: [], uiHints: {} };
  }
}

/** POST mitra/journey/additional/{id}/complete/ — Mark additional practice as complete. */
export async function mitraCompleteAdditionalItem(
  itemId: string | number,
): Promise<any> {
  try {
    const res = await api.post(`mitra/journey/additional/${itemId}/complete/`, {
      tz: getTz(),
    });
    return res.data;
  } catch (err: any) {
    console.error("[MITRA] complete additional item failed:", err.message);
    throw err;
  }
}

/** DELETE mitra/journey/additional/{id}/ — Remove additional practice. */
export async function mitraRemoveAdditionalItem(
  itemId: string | number,
): Promise<any> {
  try {
    const res = await api.delete(`mitra/journey/additional/${itemId}/`);
    return res.data;
  } catch (err: any) {
    console.error("[MITRA] remove additional item failed:", err.message);
    throw err;
  }
}

/** GET mitra/library/search/ — Search for practices in the library. */
export async function mitraLibrarySearch(
  query: string,
  itemType?: string,
): Promise<any> {
  try {
    const res = await api.get("mitra/library/search/", {
      params: { q: query, itemType, limit: 5 },
    });
    return res.data;
  } catch (err: any) {
    console.error("[MITRA] library search failed:", err.message);
    return { results: [] };
  }
}

/** GET mitra/journey/progress/ — Fetch user's journey progress stats. */
export async function mitraFetchProgress(): Promise<any> {
  try {
    const res = await api.get("mitra/journey/progress/", {
      params: { tz: getTz() },
      timeout: 15000, // CloudFront can be slow on first hit
    });
    return res.data;
  } catch (err: any) {
    if (__DEV__) console.warn("[MITRA] fetch progress failed:", err.message);
    return null;
  }
}

/** POST mitra/journey/alter/ — v3 alter/deepen/change.
 *
 * Day-7 compassionate adjust + Day-14 full choice (deepen | alter | change).
 * Replaces legacy POST /api/user-journey/alter-practice/.
 * Backend delegates to the existing decision matrix so gating (tapas /
 * compassionate_reset / mid_cycle_adjust / continue) is identical.
 *
 * Response (success): { allowed, reason?, message, direction?, journey?, stats }
 * Response (blocked): { allowed: false, reason, message, stats }
 */
export async function mitraAlterPractice(payload: {
  direction?: "alter" | "deepen" | "change";
  feeling?: string;
  reason?: string;
  journeyId?: number | string;
  newCategory?: string;
  newSubFocus?: string;
  newLevel?: string;
}): Promise<any | null> {
  try {
    const res = await api.post("mitra/journey/alter/", payload);
    return res.data;
  } catch (err: any) {
    console.warn("[MITRA] journey/alter failed:", err?.message);
    return null;
  }
}

/** POST mitra/journey/reset/ — Abandon current journey, start fresh.
 * Called by "I want to start over" on the dashboard. */
export async function mitraResetJourney(): Promise<any> {
  try {
    // Use the welcome-back endpoint with decision="fresh" to cleanly
    // close the current journey and signal a fresh start.
    const res = await api.post("mitra/journey/welcome-back/", {
      decision: "fresh",
      tz: getTz(),
    });
    return res.data;
  } catch (err: any) {
    if (__DEV__) console.warn("[MITRA] reset journey failed:", err.message);
    return null;
  }
}

/** GET mitra/journey/status/ — Journey status; may return welcomeBack flag. */
/** POST mitra/moment/next/ — Phase T2b decide_moment router.
 *
 * Shadow call on app-open (and future: push_tap / flow_end / idle_return).
 * Server gate: MITRA_V3_MOMENT_ROUTER_ENABLED — returns 404 when off so FE
 * transparently falls back to legacy routing.
 *
 * Response shape is stable across 404/500/offline via catch — the caller
 * always gets an object with moment_id + reentry_target; null means
 * "router unavailable, keep legacy routing."
 *
 * ``triggers`` and ``session_hints`` are optional. Caller fills in what the
 * FE knows (grief/loneliness/crisis taps, decline counts, embed candidates).
 */
export async function mitraMomentNext(input: {
  trigger_event?: "app_open" | "push_tap" | "flow_end" | "idle_return";
  triggers?: {
    grief?: boolean;
    loneliness?: boolean;
    crisis?: boolean;
    refocus_tap?: boolean;
    predictive_alert?: boolean;
  };
  session_hints?: {
    decline_count_this_session?: number;
    predictive_tier?: number;
    predictive_severity?: number;
    embed_candidates?: string[];
  };
} = {}): Promise<any | null> {
  try {
    const res = await api.post("mitra/moment/next/", {
      trigger_event: input.trigger_event || "app_open",
      triggers: input.triggers || {},
      session_hints: input.session_hints || {},
    });
    return res.data;
  } catch (err: any) {
    // 404 (flag off) / 401 / network error — caller falls back to legacy.
    // Low-volume WARN so we can see rollout progress in dev logs without
    // crying wolf on every unauthenticated screen.
    if (__DEV__) {
      console.log(
        "[MOMENT_ROUTER] unavailable — falling back to legacy routing:",
        err?.response?.status || err?.message,
      );
    }
    return null;
  }
}

export async function mitraJourneyStatus(): Promise<any> {
  try {
    const res = await api.get("mitra/journey/status/", {
      params: { tz: getTz() },
    });
    return res.data;
  } catch (err: any) {
    console.warn(
      "[MITRA] journey/status failed — offline fallback (no journey):",
      err.message,
    );
    // Offline fallback — treat as "no active journey" so Home.tsx auto-routes
    // into welcome_onboarding instead of getting stuck on the legacy splash.
    return {
      hasActiveJourney: false,
      journeyId: null,
      welcomeBack: false,
      dayNumber: 0,
      _offline_fallback: true,
    };
  }
}


/**
 * Week 1 — Welcome Onboarding APIs (Mitra v3 Moments 1-7).
 * Spec: route_welcome_onboarding.md §6
 *
 * NOTE 2026-04-13 audit cleanup (F8): postOnboardingTurn and postJourneyCreate
 * were removed — backend has neither endpoint. Per-turn analytics is via
 * track-event (already wrapped). Journey creation happens server-side as a
 * side effect of generate-companion at Turn 5 with day_number: 1.
 */

/** PATCH mitra/companion-state/ — write guidance_mode and other prefs. */
export async function patchCompanionState(
  patch: Record<string, any>,
): Promise<any> {
  try {
    const res = await api.patch("mitra/companion-state/", patch);
    return res.data;
  } catch (err: any) {
    console.warn("[MITRA] companion-state PATCH failed:", err.message);
    return null;
  }
}

/**
 * GET mitra/clear-window/ — Moment 43 Clear Window banner data source.
 * Backend B4-v2 shipped 2026-04-13 (commits cfef7cbb + 4fff840f). 5-gate
 * signal-based detection (volatility, upcoming alerts, fresh dissonance,
 * active hours, 7-day cooldown); never synthesizes.
 *
 * Flag MITRA_V3_CLEAR_WINDOW default OFF → 404 (card hides).
 * Response when active:
 *   { active: true, headline, message, until_time, window_minutes,
 *     confidence, signals_used }
 * Response when gated: { active: false } or 404.
 */
export async function getClearWindow(): Promise<any> {
  try {
    const res = await api.get("mitra/clear-window/", {
      params: { tz: getTz() },
    });
    // Normalize: treat {active:false} same as null so frontend can just null-check.
    if (res.data && res.data.active === false) return null;
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 502 || !status) return null;
    console.warn("[MITRA] clear-window failed:", err.message);
    return null;
  }
}

/**
 * Week 4 — Support Path APIs (Mitra v3 Moments 31, 38 + Phase 1.5 intent).
 * All feature-flagged on backend; 404-tolerant, never throw to UI.
 */

export async function postVoiceNote(
  audioBlob: any,
  metadata: any,
): Promise<any> {
  try {
    const res = await api.post("mitra/voice/notes/", {
      source_surface: metadata?.source_surface,
      duration_ms: metadata?.duration_ms ?? 0,
      has_audio: !!audioBlob,
    });
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 503) {
      console.warn("[MITRA] voice/notes endpoint unavailable (flag off)");
      return null;
    }
    console.warn("[MITRA] postVoiceNote failed:", err?.message);
    return null;
  }
}

export async function getVoiceNoteInterpretation(id: string): Promise<any> {
  if (!id) return null;
  try {
    const res = await api.get(`mitra/voice/notes/${id}/interpretation/`);
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 503) return null;
    console.warn("[MITRA] getVoiceNoteInterpretation failed:", err?.message);
    return null;
  }
}

/** POST mitra/crisis/ — Phase T3A-3 safety surface.
 *
 * Safety-critical: not gated, always on. Server returns a full crisis
 * payload (opening_line + grounding_breath + reach_out + hotlines)
 * regardless of classifier result — even when the classifier says
 * not-crisis, the payload is usable as de-escalation content.
 *
 * Response shape:
 *   {
 *     is_crisis: boolean,
 *     tier: "acute_crisis" | "acute_distress" | "user_requested" | "none",
 *     severity: number,                     // 0..1
 *     opening_line: string,
 *     grounding_anchor: string,
 *     grounding_breath: { title, duration_min, pattern, runner_route },
 *     reach_out: string[],                  // action lines
 *     hotlines: {region, name, number, hours}[],
 *     signals: string[],                    // matched keyword phrases
 *     next_step: { label, target }          // FE deeplink hint
 *   }
 *
 * Null only on outright network failure — in that case the FE must
 * still surface a local emergency reminder ('call 112 / 911').
 */
export async function mitraCrisis(input: {
  trigger?: "button_tap" | "text_input" | "voice_interpretation";
  text?: string;
  source_surface?: string;
} = {}): Promise<any | null> {
  try {
    const res = await api.post("mitra/crisis/", {
      trigger: input.trigger || "button_tap",
      text: input.text || "",
      source_surface: input.source_surface || "dashboard",
    });
    return res.data;
  } catch (err: any) {
    if (__DEV__) {
      console.warn(
        "[MITRA] crisis endpoint unreachable — local fallback:",
        err?.message,
      );
    }
    return null;
  }
}

export async function postInterpretIntent(text: string): Promise<any> {
  if (!text || !text.trim()) return null;
  try {
    const res = await api.post("mitra/interpret-intent/", { text });
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 503) return null;
    console.warn("[MITRA] postInterpretIntent failed:", err?.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Week 5 — Reflection + Checkpoints (Mitra v3 Moments 23, 24, 25, 26, 34)
// All feature-flagged; callers tolerate null gracefully.
// ---------------------------------------------------------------------------

export async function getResilienceNarrative(): Promise<any> {
  try {
    const res = await api.get("mitra/resilience-narrative/", {
      params: { tz: getTz() },
    });
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404) {
      console.log("[MITRA] resilience-narrative: feature flag off (404)");
    } else {
      console.warn("[MITRA] resilience-narrative failed:", err.message);
    }
    return null;
  }
}

export async function postGratitudeLedger(entry: {
  signal_type: string;
  text?: string;
  note?: string;
  context?: any;
  intensity?: number | null;
  logged_at?: string;
  meta?: Record<string, any>;
}): Promise<any> {
  try {
    const res = await api.post("mitra/gratitude-ledger/", {
      ...entry,
      tz: getTz(),
    });
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404) {
      console.log(
        `[MITRA] gratitude-ledger (${entry.signal_type}): feature flag off (404)`,
      );
    } else {
      console.warn(
        `[MITRA] gratitude-ledger (${entry.signal_type}) failed:`,
        err.message,
      );
    }
    return null;
  }
}

export async function getWeeklyReflectionData(cycleDay?: number): Promise<any> {
  try {
    const res = await api.get("mitra/journey/weekly-reflection/", {
      params: { cycle_day: cycleDay, tz: getTz() },
    });
    return res.data;
  } catch (err: any) {
    // Audited 2026-04-18: the 404 path previously fell back to
    // /mitra/journey/status/ which returns a journey-status shape
    // (hasActiveJourney, journeyId) — NOT a weekly-reflection shape.
    // Callers reading .letter / .framing would see undefined and the
    // fallback accomplished nothing except adding a second round-trip.
    // Removed. 404 now returns null cleanly; callers already handle it.
    console.warn("[MITRA] weekly-reflection failed:", err.message);
    return null;
  }
}


// ===========================================================================
// Mitra v3 Journey Views — CONTRACT v3.0.0
// ---------------------------------------------------------------------------
// Endpoints under /api/mitra/v3/journey/. Gated server-side by
// MITRA_V3_JOURNEY_VIEWS (defaults ON in DEBUG, OFF otherwise).
//
// GETs:
//   entry-view, daily-view, day-7-view, day-14-view
//   — ETag-aware: caller passes last-known ETag as `etag` arg; 304
//     response returns `{envelope:null, etag, notModified:true}` so
//     caller can keep rendering its cached payload.
//
// POSTs:
//   reentry-decision, day-7-decision, day-14-decision
//   — Idempotency-Key required. Duplicate requests within 24h return
//     cached response verbatim. 400 responses carry a structured
//     fallback envelope and are surfaced to the caller (not swallowed
//     as network errors).
//
// Envelope frame (all endpoints):
//   { envelope_version: "3.0.0",
//     status: "ok" | "degraded" | "fallback",
//     fallback_reason: string | null,
//     view: string,
//     ...body,
//     provenance: { contract, generated_at, cache_ttl_sec } }
//
// Legacy wrappers above (mitraJourneyHome, mitraJourneyCompanion,
// mitraGetCheckpoint, mitraSubmitCheckpoint, mitraJourneyWelcomeBack,
// mitraCheckpoint) are SCHEDULED FOR DELETION at migration Step 11.
// Do NOT add new callers.
// ===========================================================================

export type V3Status = "ok" | "degraded" | "fallback";

export interface V3Provenance {
  contract: string;
  generated_at: string;
  cache_ttl_sec: number;
}

export interface V3Envelope {
  envelope_version: string;
  status: V3Status;
  fallback_reason: string | null;
  view: string;
  provenance: V3Provenance;
}

export interface V3Identity {
  journey_id: number | null;
  day_number: number;
  total_days: number;
  path_cycle_number: number;
}

export interface V3Greeting {
  headline: string;
  supporting_line: string;
  user_name: string;
  /** Mic input placeholder copy; FE VoiceTextInput self-hides on empty. */
  voice_placeholder: string;
}

export interface V3ArcState {
  phase: string;
  checkpoint_due: "day_7" | "day_14" | null;
  arc_complete: boolean;
  /** "support" | "growth" | "" — derived from journey.category bucket */
  journey_path: string;
  /** Display label for PathChip; e.g. "Support Path" */
  journey_path_label: string;
}

export interface V3WhyThis {
  level1: string;
  level2: string;
  level3: string;
}

export interface V3Continuity {
  tier: "none" | "short" | "medium" | "long" | "very_long";
  gap_days: number;
  headline: string;
  body: string;
  earned_context: Record<string, any>;
  fresh_restart_suggested: boolean;
  /** Null when sankalp has no linked principle; FE self-hides WhyThis surfaces on null. */
  why_this: V3WhyThis | null;
  why_this_l1_items: { id: string; label: string }[];
}

export interface V3TriadItem {
  slot: "mantra" | "sankalp" | "practice";
  item_id: string;
  title: string;
  subtitle: string;
  completed_today: boolean;
  /** Sankalp row only; absent/"" on mantra+practice rows. */
  how_to_live?: string;
}

export interface V3MorningBriefing {
  audio_status: "generating" | "ready" | "failed";
  audio_url: string | null;
  summary: string;
  briefing_id: string;
}

export interface V3QuickSupportLabels {
  triggered_label: string;
  checkin_label: string;
  joy_label: string;
  growth_label: string;
  more_label: string;
}

export interface V3CycleMetrics {
  days_engaged: number;
  days_fully_completed: number;
  trigger_sessions: number;
  daily_rhythm: { day: number; state: "done" | "missed" | "pending" }[];
  summary_label: string;
  days_engaged_label: string;
  days_complete_label: string;
  trigger_sessions_label: string;
  rhythm_header_label: string;
}

export interface V3Today {
  triad: V3TriadItem[];
  additional_items: any[];
  morning_briefing: V3MorningBriefing;
  /** Path focus phrase; "" when no authored source available. */
  focus_phrase: string;
  quick_support_labels: V3QuickSupportLabels;
  /** Null on no active journey; FE CycleProgressBlock self-hides. */
  cycle_metrics: V3CycleMetrics | null;
}

export interface V3Insights {
  resilience_narrative: any | null;
  path_milestone: any | null;
  entity_card: any | null;
  refinement_signal: any | null;
}

export interface V3EntryViewEnvelope extends V3Envelope {
  view: "entry_view";
  greeting: V3Greeting;
  journey_state: {
    has_active_journey: boolean;
    day_number: number;
    total_days: number;
    path_cycle_number: number;
    checkpoint_due: "day_7" | "day_14" | null;
    arc_complete: boolean;
  };
  continuity: V3Continuity;
  target: {
    view_key:
      | "daily_view"
      | "day_7_view"
      | "day_14_view"
      | "welcome_back_surface"
      | "onboarding_start"
      | "crisis_view"
      | "grief_room"
      | "loneliness_room";
    payload: Record<string, any>;
  };
}

export interface V3DailyViewEnvelope extends V3Envelope {
  view: "daily_view";
  identity: V3Identity;
  greeting: V3Greeting;
  arc_state: V3ArcState;
  continuity: V3Continuity;
  today: V3Today;
  insights: V3Insights;
}

export interface V3Day7ViewEnvelope extends V3Envelope {
  view: "day_7_view";
  surface_type: "day_7_reflection";
  identity: V3Identity;
  reflection: {
    headline: string;
    body: string;
    engagement_trajectory: string;
    trend_graph: {
      labels: string[];
      engaged: number[];
      fully_completed: number[];
    };
    /** Per-path-intent checkpoint framing (checkpoint_framings.yaml); "" on miss. */
    framing: string;
    /** Synthesized 1-line recap based on trend_graph counts; always non-empty on success. */
    journey_narrative: string;
  };
  insights: V3Insights;
  continuity: V3Continuity | null;
  actions: { primary: string; decisions_available: string[] };
}

export interface V3Day14ViewEnvelope extends V3Envelope {
  view: "day_14_view";
  surface_type: "day_14_completion";
  identity: V3Identity;
  cycle_reflection: {
    mitra_reflection: string;
    reflection_prompt: string;
    strongest_type: string;
    growth_area: string;
    completion_rates: Record<string, number>;
  };
  day14_arc: {
    classification: { label: string; completion_rate: number } | null;
    what_grew: { days_completed: number; days_total: number } | null;
    refinement_signal: any | null;
  };
  completion_ceremony: {
    completed_days: number;
    total_days: number;
    strongest_practice: string;
    growth_highlight: string;
    sovereignty_line: string;
  };
  m25_narrative: Record<string, any>;
  insights: V3Insights;
  actions: { primary: string; decisions_available: string[] };
}

export interface V3DecisionEnvelope extends V3Envelope {
  decision_applied: string | null;
  next_view: {
    view_key: string;
    payload: Record<string, any>;
  };
  prior_journey_id?: number;
  new_journey_id?: number;
  path_cycle_number?: number;
  journey_id?: number;
}

export interface V3GetResult<E extends V3Envelope> {
  /** Parsed envelope when a fresh 200 was returned; `null` on 304 or error. */
  envelope: E | null;
  /** ETag value to keep for the next request. `null` on error. */
  etag: string | null;
  /** True if server returned 304 (client should keep its cached envelope). */
  notModified: boolean;
}

async function v3Get<E extends V3Envelope>(
  url: string,
  etagIn: string | null = null,
  params?: Record<string, string>,
): Promise<V3GetResult<E>> {
  const headers: Record<string, string> = {};
  if (etagIn) headers["If-None-Match"] = etagIn;
  try {
    const res = await api.get(url, {
      headers,
      params,
      validateStatus: (s: number) => (s >= 200 && s < 300) || s === 304,
    });
    const etag =
      (res.headers?.etag as string) ||
      (res.headers?.ETag as string) ||
      etagIn ||
      null;
    if (res.status === 304) {
      return { envelope: null, etag, notModified: true };
    }
    return { envelope: res.data as E, etag, notModified: false };
  } catch (err: any) {
    const status = err?.response?.status;
    console.warn(
      `[MITRA v3] GET ${url} failed (${status || "network"})`,
      err?.message,
    );
    return { envelope: null, etag: null, notModified: false };
  }
}

export function mitraJourneyEntryView(
  etag: string | null = null,
  signals?: { crisis?: boolean; grief?: boolean; loneliness?: boolean },
): Promise<V3GetResult<V3EntryViewEnvelope>> {
  const params: Record<string, string> = {};
  if (signals?.crisis) params.crisis = "1";
  if (signals?.grief) params.grief = "1";
  if (signals?.loneliness) params.loneliness = "1";
  return v3Get<V3EntryViewEnvelope>("mitra/v3/journey/entry-view/", etag, Object.keys(params).length ? params : undefined);
}

export async function mitraJourneyHome(params: {
  tz?: string;
  locale?: string;
  guidance_mode?: string;
  crisis?: string;
  grief?: string;
  loneliness?: string;
} = {}): Promise<any | null> {
  try {
    const res = await api.get("mitra/journey/home/", { params });
    return res.data;
  } catch (err: any) {
    console.warn("[MITRA] journey/home failed:", err?.message);
    return null;
  }
}

export function mitraJourneyDailyView(
  etag: string | null = null,
): Promise<V3GetResult<V3DailyViewEnvelope>> {
  return v3Get<V3DailyViewEnvelope>("mitra/v3/journey/daily-view/", etag);
}

export function mitraJourneyDay7View(
  etag: string | null = null,
): Promise<V3GetResult<V3Day7ViewEnvelope>> {
  return v3Get<V3Day7ViewEnvelope>("mitra/v3/journey/day-7-view/", etag);
}

export function mitraJourneyDay14View(
  etag: string | null = null,
): Promise<V3GetResult<V3Day14ViewEnvelope>> {
  return v3Get<V3Day14ViewEnvelope>("mitra/v3/journey/day-14-view/", etag);
}

async function v3DecisionPost(
  url: string,
  body: Record<string, any>,
  idempotencyKey: string,
): Promise<V3DecisionEnvelope | null> {
  try {
    const res = await api.post(url, body, {
      headers: { "Idempotency-Key": idempotencyKey },
      validateStatus: (s: number) => (s >= 200 && s < 300) || s === 400,
    });
    return res.data as V3DecisionEnvelope;
  } catch (err: any) {
    const status = err?.response?.status;
    // v3 POSTs are designed to never 500 — a network/unexpected error
    // should be surfaced as null so callers can render a retry CTA.
    if (err?.response?.data) {
      return err.response.data as V3DecisionEnvelope;
    }
    console.warn(
      `[MITRA v3] POST ${url} failed (${status || "network"})`,
      err?.message,
    );
    return null;
  }
}

export function mitraJourneyReentryDecision(
  decision: "continue" | "fresh",
  idempotencyKey: string,
): Promise<V3DecisionEnvelope | null> {
  return v3DecisionPost(
    "mitra/v3/journey/reentry-decision/",
    { decision, tz: getTz() },
    idempotencyKey,
  );
}

export function mitraJourneyDay7Decision(
  payload: {
    decision: "continue" | "lighten" | "reset";
    reflection?: string;
    feeling?: string;
  },
  idempotencyKey: string,
): Promise<V3DecisionEnvelope | null> {
  return v3DecisionPost(
    "mitra/v3/journey/day-7-decision/",
    { ...payload, tz: getTz() },
    idempotencyKey,
  );
}

export function mitraJourneyDay14Decision(
  payload: {
    decision: "continue_same" | "deepen" | "change_focus";
    reflection?: string;
    feeling?: string;
    deepenItemType?: string;
    deepenItemId?: string;
    deepenAccepted?: boolean;
  },
  idempotencyKey: string,
): Promise<V3DecisionEnvelope | null> {
  return v3DecisionPost(
    "mitra/v3/journey/day-14-decision/",
    { ...payload, tz: getTz() },
    idempotencyKey,
  );
}

// ---------------------------------------------------------------------------
// Week 6 — Companion Intelligence APIs (Moments 27, 28, 29, 30, 39)
// ---------------------------------------------------------------------------

export async function getPrepContext(
  params: Record<string, any> = {},
): Promise<any> {
  try {
    const res = await api.get("mitra/prep/", {
      params: { ...params, tz: getTz() },
    });
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 502 || !status) {
      // Flag-off (404) or backend unreachable (502/timeout) → offline fallback
      // so the sheet renders sample coaching content instead of a blank state.
      return {
        surface: "Steady before",
        strategy_line:
          "Lower your voice slightly. Let them finish before you respond.",
        grounding_action: "One slow breath before you enter the room.",
        do_frame: "Speak from steadiness. Keep to one clean point.",
        dont_frame: "Don't enter already arguing in your head.",
        principle_hint: null,
        context_type: params?.context_type || "work_conversation",
        _offline_fallback: true,
      };
    }
    console.warn("[MITRA] prep/ failed:", err.message);
    return null;
  }
}

/** GET mitra/predictive/alerts/ — Moment 28 friction forecasts.
 *  Audit fix F5 (2026-04-13): URL was 'predictive-alerts' (hyphen), but
 *  backend exposes 'predictive/alerts' (slash). Fixed.
 */
export async function getPredictiveAlerts(): Promise<any> {
  try {
    const res = await api.get("mitra/predictive/alerts/", {
      params: { tz: getTz() },
    });
    return res.data;
  } catch (err: any) {
    if (
      err?.response?.status &&
      err?.response?.status !== 404 &&
      err?.response?.status !== 502
    ) {
      console.warn("[MITRA] predictive/alerts failed:", err.message);
    }
    return null;
  }
}

/** POST mitra/predictive/alerts/<id>/dismiss/ — Moment 28 user-dismiss action. */
export async function dismissPredictiveAlert(
  alertId: string | number,
): Promise<any> {
  try {
    const res = await api.post(`mitra/predictive/alerts/${alertId}/dismiss/`);
    return res.data;
  } catch (err: any) {
    console.warn(
      `[MITRA] predictive/alerts/${alertId}/dismiss failed:`,
      err.message,
    );
    return null;
  }
}

/** POST mitra/predictive/alerts/<id>/mute-entity/ — mute the entity behind an alert. */
export async function mutePredictiveAlertEntity(
  alertId: string | number,
): Promise<any> {
  try {
    const res = await api.post(
      `mitra/predictive/alerts/${alertId}/mute-entity/`,
    );
    return res.data;
  } catch (err: any) {
    console.warn(
      `[MITRA] predictive/alerts/${alertId}/mute-entity failed:`,
      err.message,
    );
    return null;
  }
}

/** GET mitra/briefing/today/ — Moment 8/Dashboard morning briefing.
 *  Audit fix F2 (2026-04-13): added wrapper. Backend has it; spec dashboard §6
 *  step 4 declares it as a separate endpoint (not bundled in generate-companion).
 *  Returns: { audio_url, script, voice_preset, duration_ms } or null when no
 *  briefing today / flag off / 502.
 */
export async function getBriefingToday(): Promise<any> {
  try {
    const res = await api.get("mitra/briefing/today/", {
      params: { tz: getTz() },
    });
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 502 || !status) {
      // Briefing card hides gracefully when no briefing for today.
      return null;
    }
    console.warn("[MITRA] briefing/today failed:", err.message);
    return null;
  }
}

/** GET mitra/resilience-ledger/?limit=N — Moment 23/26 dashboard data source.
 *  Audit fix F3 (2026-04-13): distinct from getResilienceNarrative (which is the
 *  LLM-generated paragraph). Ledger is the raw entity-linked resilience data.
 *  Spec dashboard §6 step 7 + route_reflection_weekly entity highlights.
 */
export async function getResilienceLedger(
  params: { limit?: number; entity_id?: string | number } = {},
): Promise<any> {
  try {
    const res = await api.get("mitra/resilience-ledger/", {
      params: { ...params, tz: getTz() },
    });
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 502 || !status) return null;
    console.warn("[MITRA] resilience-ledger failed:", err.message);
    return null;
  }
}

/** GET mitra/journey/deepen-preview/ — Moment 25 Day-14 deepen path preview.
 *  Audit fix F9 (2026-04-13): wrapper added; CheckpointDay14Block can fetch.
 */
export async function getDeepenPreview(): Promise<any> {
  try {
    const res = await api.get("mitra/journey/deepen-preview/", {
      params: { tz: getTz() },
    });
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 502 || !status) return null;
    console.warn("[MITRA] journey/deepen-preview failed:", err.message);
    return null;
  }
}

/** GET mitra/recommended-additional/ — Moment 30 post-core recommendation. */
export async function getRecommendedAdditional(): Promise<any> {
  try {
    const res = await api.get("mitra/recommended-additional/", {
      params: { tz: getTz() },
    });
    return res.data;
  } catch (err: any) {
    if (
      err?.response?.status &&
      err?.response?.status !== 404 &&
      err?.response?.status !== 502
    ) {
      console.warn("[MITRA] recommended-additional/ failed:", err.message);
    }
    return null;
  }
}

/** GET mitra/post-conflict-context/ — Moment 39 dissonance-thread context. */
export async function getPostConflictContext(): Promise<any> {
  try {
    const res = await api.get("mitra/post-conflict-context/", {
      params: { tz: getTz() },
    });
    return res.data;
  } catch (err: any) {
    if (
      err?.response?.status &&
      err?.response?.status !== 404 &&
      err?.response?.status !== 502
    ) {
      console.warn("[MITRA] post-conflict-context/ failed:", err.message);
    }
    return null;
  }
}

/** POST mitra/entities/check-duplicate/ — Moment 29 probe from freeform mention text. */
export async function postEntitiesCheckDuplicate(text: string): Promise<any> {
  try {
    const res = await api.post("mitra/entities/check-duplicate/", { text });
    return res.data;
  } catch (err: any) {
    if (err?.response?.status !== 404) {
      console.warn("[MITRA] entities/check-duplicate failed:", err.message);
    }
    return null;
  }
}

/** GET mitra/user-preferences/ — load companion-wide prefs.
 *  404-tolerant so old dev backends stay functional. */
export async function getUserPreferences(): Promise<any | null> {
  try {
    const res = await api.get("mitra/user-preferences/");
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    console.warn("[MITRA] user-preferences GET failed:", err?.message);
    return null;
  }
}

/** PATCH mitra/user-preferences/ — persist companion-wide prefs (season
 *  banner dismissal, guidance preferences, etc.). Swallows 404 quietly so
 *  old dev backends stay functional. */
export async function patchUserPreferences(
  patch: Record<string, any>,
): Promise<any | null> {
  try {
    const res = await api.patch("mitra/user-preferences/", patch);
    return res.data;
  } catch (err: any) {
    if (err?.response?.status !== 404) {
      console.warn("[MITRA] user-preferences PATCH failed:", err?.message);
    }
    return null;
  }
}

/** GET mitra/user-preferences/notifications/ — notification toggles. */
export async function getNotificationPreferences(): Promise<any | null> {
  try {
    const res = await api.get("mitra/user-preferences/notifications/");
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 404) return null;
    console.warn("[MITRA] notification-prefs GET failed:", err?.message);
    return null;
  }
}

/** PATCH mitra/user-preferences/notifications/ — update a notification toggle. */
export async function patchNotificationPreferences(
  patch: Record<string, any>,
): Promise<any | null> {
  try {
    const res = await api.patch("mitra/user-preferences/notifications/", patch);
    return res.data;
  } catch (err: any) {
    if (err?.response?.status !== 404) {
      console.warn("[MITRA] notification-prefs PATCH failed:", err?.message);
    }
    return null;
  }
}

/** PATCH mitra/entities/<id>/ — Moment 29 confirm / dismiss / snooze / mute.
 *  Backend B5 shipped 2026-04-13: generic PATCH with {status, snooze_until}.
 *  status: 'confirmed' | 'dismissed' | 'snoozed' | 'muted'
 */
export async function patchEntity(
  id: string | number,
  payload: Record<string, any>,
): Promise<any> {
  try {
    const res = await api.patch(`mitra/entities/${id}/`, payload);
    return res.data;
  } catch (err: any) {
    if (err?.response?.status !== 404) {
      console.warn(`[MITRA] entities/${id} PATCH failed:`, err.message);
    }
    return null;
  }
}

/** PATCH mitra/dissonance-threads/<id>/ — Moment 39 post-conflict ack.
 *  Backend B3 shipped 2026-04-13. Body: { status: 'acknowledged' | 'resolved'
 *  | 'stale' | 'softened' }. Sets timestamps server-side.
 */
export async function patchDissonanceThread(
  id: string | number,
  payload: { status: "acknowledged" | "resolved" | "stale" | "softened" },
): Promise<any> {
  try {
    const res = await api.patch(`mitra/dissonance-threads/${id}/`, payload);
    return res.data;
  } catch (err: any) {
    if (err?.response?.status !== 404) {
      console.warn(
        `[MITRA] dissonance-threads/${id} PATCH failed:`,
        err.message,
      );
    }
    return null;
  }
}

/** GET mitra/panchang/today/ — Moment 44 season change banner data source.
 *  Backend B2 shipped 2026-04-13. Returns { date, ritu, ritu_english,
 *  ritu_changed_today, tithi, festival, moon_phase, sunrise, sunset } or null.
 *  Optional ?date= override for testing.
 */
export async function getPanchangToday(date?: string): Promise<any> {
  try {
    const res = await api.get("mitra/panchang/today/", {
      params: date ? { date, tz: getTz() } : { tz: getTz() },
    });
    return res.data;
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404 || status === 502 || !status) return null;
    console.warn("[MITRA] panchang/today failed:", err.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Week 7 — Why-This + grief/loneliness/joy APIs (Moments 36, 37, 45, 46, 47)
// ---------------------------------------------------------------------------

export async function getPrinciple(id: string | number): Promise<any> {
  if (!id) return null;
  try {
    const res = await api.get(`mitra/principles/${id}/`);
    return res.data || null;
  } catch (err: any) {
    console.warn(`[MITRA] principles/${id} failed (tolerated):`, err.message);
    return null;
  }
}

/** GET mitra/principles/{id}/sources/ — Principle source for Why-This L3. */
export async function getPrincipleSource(id: string | number): Promise<any> {
  if (!id) return null;
  try {
    const res = await api.get(`mitra/principles/${id}/sources/`);
    return res.data || null;
  } catch (err: any) {
    console.warn(
      `[MITRA] principles/${id}/sources failed (tolerated):`,
      err.message,
    );
    return null;
  }
}

/** GET mitra/support/grief-context/ — Grief room contextual copy/prompt.
 *
 * T3B-2 (Day-14 audit follow-up): returns null on failure instead of
 * TSX English fallback copy. Sovereignty-compliant per the rule
 * documented at mitraResolveMoment: blank UI > hidden hardcoded
 * content. The M46 spine moment handles null by falling back to its
 * approved universal × en variant via the BE orchestrator.
 */
export async function getGriefContext(): Promise<any> {
  try {
    const res = await api.get("mitra/support/grief-context/");
    return res.data || null;
  } catch (err: any) {
    if (__DEV__) {
      console.warn("[MITRA] grief-context unavailable:", err.message);
    }
    return null;
  }
}

/** GET mitra/support/loneliness-context/ — Loneliness room context + chant.
 *
 * T3B-2: null on failure (see getGriefContext docstring). M47 spine
 * variant is the authoritative fallback path.
 */
export async function getLonelinessContext(): Promise<any> {
  try {
    const res = await api.get("mitra/support/loneliness-context/");
    return res.data || null;
  } catch (err: any) {
    if (__DEV__) {
      console.warn("[MITRA] loneliness-context unavailable:", err.message);
    }
    return null;
  }
}

/** GET mitra/joy-signal/ — Today's joy signal (Moment 45). null when no signal. */
export async function getJoySignal(): Promise<any> {
  try {
    const res = await api.get("mitra/joy-signal/");
    return res.data || null;
  } catch (err: any) {
    console.warn("[MITRA] joy-signal failed (tolerated):", err.message);
    return null;
  }
}

/**
 * Mitra v3 content resolver — Phase C pilot client (M35 evening_reflection).
 *
 * Spec: kalpx-app-rn/docs/ORCHESTRATION_CONTRACT_V1.md §1
 * Endpoint: POST /api/mitra/content/moments/<moment_id>/resolve/
 *   (gated behind MITRA_V3_CONTENT_RESOLVE_ENABLED on the backend — 404
 *   when disabled; caller treats 404 identically to a network failure)
 *
 * Sovereignty-compliant failure mode:
 *   - On 404 / 5xx / network error: returns null.
 *   - The caller MUST NOT fall back to TSX-embedded English strings.
 *     Blank UI is preferred over hidden content. Missing content
 *     surfaces via the backend MitraDecisionLog dashboards.
 */
export interface MomentContextShape {
  path: "support" | "growth" | "both";
  guidance_mode: "universal" | "hybrid" | "rooted";
  locale: string;
  user_attention_state: string;
  emotional_weight: "light" | "moderate" | "heavy" | "maximum";
  cycle_day: number;
  entered_via: string;
  stage_signals?: Record<string, string>;
  today_layer?: Record<string, string>;
  life_layer: {
    cycle_id: string;
    life_kosha: string;
    scan_focus: string;
    life_klesha?: string | null;
    life_vritti?: string | null;
    life_goal?: string | null;
  };
}

export interface MomentPayloadShape {
  moment_id: string;
  slots: Record<string, string>;
  meta: {
    variant_id: string;
    mode_served: string;
    locale_served: string;
    fallback_used: boolean;
    fallback_reason: string | null;
    audit_id: string;
    resolved_in_ms: number;
  };
  presentation_hints: Record<string, any> | null;
}

export async function mitraResolveMoment(
  momentId: string,
  ctx: MomentContextShape,
  requestId?: string,
): Promise<MomentPayloadShape | null> {
  try {
    const headers: Record<string, string> = {};
    if (requestId) headers["X-Request-ID"] = requestId;
    const res = await api.post(
      `mitra/content/moments/${momentId}/resolve/`,
      ctx,
      { headers },
    );
    const data = res.data || null;
    if (!data || typeof data !== "object" || !data.slots) return null;
    return data as MomentPayloadShape;
  } catch (err: any) {
    // Sovereignty contract: never fall back to English. Return null and
    // let the caller render empty slots ("") so missing content is
    // visible in QA + telemetry.
    console.warn(
      "[MITRA] content.resolve failed (tolerated, blank-on-missing):",
      momentId,
      err?.message,
    );
    return null;
  }
}

// ---------------------------------------------------------------------------
// mitraPickWisdom — Track 0.5 Wisdom Orchestration selector client.
//
// Contract: kalpx-app-rn/docs/WISDOM_ORCHESTRATION_CONTRACT_V1.md §5
// Impl spec: kalpx-app-rn/docs/WISDOM_SELECTOR_IMPLEMENTATION_SPEC_V1.md §4
//
// Endpoint: POST /api/mitra/wisdom/pick/
//
// Null-safe invariants (match backend selector.py contract):
//   - Never rejects. Always resolves with a WisdomSelectionOutput.
//   - On backend error, timeout, env-flag-off, or non-200 response:
//     returns { ok: false, selected_text: "", fallback_reason: "<cause>" }
//     so the caller falls through to the ContentPack authored fallback.
//   - NEVER emits canned English from the FE. Blank is preferred; copy is
//     always authored in ContentPacks.
//
// Timeout: hard cap at 1500ms (Stream 1 integration budget). Enforced via
// AbortController — we do NOT rely solely on the shared 30s axios timeout.
// ---------------------------------------------------------------------------

export type WisdomInteractionType =
  | "first_read_opening"
  | "second_beat"
  | "quiet_ack"
  | "visible_reply"
  | "completion_anchor";

export type WisdomGuidanceMode = "universal" | "hybrid" | "rooted";

export type WisdomReadinessLevel = "L0" | "L1" | "L2" | "L3" | "L4";

export interface WisdomSelectionInput {
  // Required — see contract §4.1
  interaction_type: WisdomInteractionType;
  context: string; // surface id: joy_room | grief_room | growth_room | completion_core | completion_support | ...
  state_family: string; // grief | loneliness | joy | growth | core | ...
  guidance_mode: WisdomGuidanceMode;
  locale: string; // en | hi | ...

  // Optional
  path_intent?: string | null;
  user_context?: Record<string, any>;
  memory?: {
    recent_asset_ids?: string[];
    session_traditions?: string[];
    session_id?: string;
    thread_id?: string;
  };
  preferences?: Record<string, any>;

  // Extension (declared in V1, populated post-cutover)
  user_readiness_level?: WisdomReadinessLevel;
  thread_id?: string;
}

export interface WisdomDecisionTraceSubset {
  audit_id?: string;
  input_hash?: string;
  final_winner_asset_id?: string;
  final_winner_tier?: string;
  final_winner_family?: string;
  tiebreak_reason?: string;
  relaxation_steps_applied?: string[];
  truncation_layer_used?: string;
  rendered_char_count?: number;
  fallback_used?: boolean;
  fallback_reason?: string | null;
  latency_ms?: number;
  principle_version_id_served?: number;
}

export interface WisdomSelectionOutput {
  ok: boolean;
  selected_text: string;
  asset_kind?: "principle" | "snippet" | "none";
  asset_id?: string;
  source_tier?: "tier_1" | "tier_2" | "application" | "snippet" | "none" | string;
  source_family?: string;
  char_count?: number;
  wrapper_required?: boolean;
  wrapper_suggestion?: string | null;
  drill_down_id?: string | null;
  drill_down_available?: boolean;
  principle_version_id?: number;
  trace?: WisdomDecisionTraceSubset | null;
  // FE-only diagnostic — set when selector was skipped locally.
  fallback_reason?: string | null;
}

/**
 * POST /api/mitra/wisdom/pick/ — Track 0.5 Wisdom Orchestration selector.
 *
 * Null-safe: always resolves (never rejects). On backend error, timeout, or
 * env-flag-off, returns { ok: false, selected_text: "", fallback_reason }.
 * Caller inspects `output.ok` and falls through to its ContentPack slot on
 * false. Never renders `fallback_reason` as user-facing copy.
 */
export async function mitraPickWisdom(
  input: WisdomSelectionInput,
  timeoutMs: number = 1500,
): Promise<WisdomSelectionOutput> {
  const controller =
    typeof AbortController !== "undefined" ? new AbortController() : null;
  const timer = controller
    ? setTimeout(() => {
        try {
          controller.abort();
        } catch {
          // no-op
        }
      }, Math.max(0, timeoutMs))
    : null;

  try {
    const res = await api.post("mitra/wisdom/pick/", input, {
      // Also set axios-level timeout as a belt-and-suspenders — if the
      // AbortController path is unavailable for some reason, the per-request
      // timeout still caps the wait.
      timeout: Math.max(0, timeoutMs),
      signal: controller ? (controller.signal as any) : undefined,
    });
    const data = res?.data;
    if (!data || typeof data !== "object") {
      return {
        ok: false,
        selected_text: "",
        fallback_reason: "empty_response",
      };
    }
    // Pass through the backend shape verbatim; tolerate missing optional
    // fields so future additions (e.g., channel_coverage) don't break
    // existing callers.
    const out: WisdomSelectionOutput = {
      ok: Boolean(data.ok),
      selected_text:
        typeof data.selected_text === "string" ? data.selected_text : "",
      asset_kind: data.asset_kind,
      asset_id: data.asset_id,
      source_tier: data.source_tier,
      source_family: data.source_family,
      char_count:
        typeof data.char_count === "number"
          ? data.char_count
          : typeof data.selected_text === "string"
            ? data.selected_text.length
            : 0,
      wrapper_required: Boolean(data.wrapper_required),
      wrapper_suggestion: data.wrapper_suggestion ?? null,
      drill_down_id: data.drill_down_id ?? null,
      drill_down_available: Boolean(data.drill_down_available),
      principle_version_id:
        typeof data.principle_version_id === "number"
          ? data.principle_version_id
          : 0,
      trace: data.trace ?? null,
      fallback_reason: data.ok
        ? null
        : (data.trace && data.trace.fallback_reason) || "selector_not_ok",
    };
    return out;
  } catch (err: any) {
    const aborted =
      err?.name === "CanceledError" ||
      err?.name === "AbortError" ||
      err?.code === "ERR_CANCELED" ||
      err?.code === "ECONNABORTED";
    const reason = aborted
      ? "selector_timeout"
      : err?.response?.status === 404
        ? "selector_not_deployed"
        : err?.response
          ? `selector_http_${err.response.status}`
          : "selector_network_error";
    console.warn(
      "[MITRA] wisdom.pick failed (tolerated, ContentPack fallback):",
      reason,
      err?.message,
    );
    return {
      ok: false,
      selected_text: "",
      fallback_reason: reason,
    };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
