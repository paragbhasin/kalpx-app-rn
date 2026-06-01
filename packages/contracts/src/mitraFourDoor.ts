// API calls (getMitraHomeV3, postTellMitraV3) are app-local in mitraApi.ts — see S08 decision.

import type {
  DoorId,
  QuickResetMantra,
  RhythmItemSource,
  RhythmItemType,
  RhythmReminderPreference,
  RhythmSuggestItem,
  RhythmSuggestResponse,
  RhythmTimeBand,
  RhythmWizardLocalItem,
  TellMitraConversationContext,
  TellMitraFollowupOption,
  TellMitraFollowupQuestion,
  TellMitraNextOption,
  TellMitraRoomEntryContext,
  TellMitraSupportDepth,
  TellMitraV3Response,
  VerifiedRoomId,
} from "@kalpx/types";

// ── Rhythm setup contracts ───────────────────────────────────────────────────

export interface RhythmSetupItem {
  slot: RhythmTimeBand;
  item_type: RhythmItemType;
  item_id: string;
  title_snapshot: string;
  description_snapshot?: string | null;
  purpose?: string | null;
  source: RhythmItemSource;
  sort_order: number;
  reminder_enabled: boolean;
  reminder_time?: string | null;
}

export interface RhythmSetupPayload {
  reminder_preference?: RhythmReminderPreference;
  items: RhythmSetupItem[];
}

export const RHYTHM_TIME_BANDS: RhythmTimeBand[] = [
  "morning",
  "afternoon",
  "night",
];

export const RHYTHM_BAND_LABELS: Record<RhythmTimeBand, string> = {
  morning: "Morning",
  afternoon: "Afternoon",
  night: "Night",
};

export const RHYTHM_BAND_LABELS_HI: Record<RhythmTimeBand, string> = {
  morning: "सुबह",
  afternoon: "दोपहर",
  night: "रात",
};

export const RHYTHM_BAND_SUBTITLES: Record<RhythmTimeBand, string> = {
  morning: "Smriti — remembering before the day begins",
  afternoon: "Karma Yoga — a small return in the middle of everything",
  night: "Sharanagati — offering what the day held",
};

export const RHYTHM_BAND_SUBTITLES_HI: Record<RhythmTimeBand, string> = {
  morning: "स्मृति — दिन शुरू होने से पहले खुद को याद करना",
  afternoon: "कर्म योग — सब कुछ के बीच एक छोटी वापसी",
  night: "शरणागति — दिन ने जो थामा उसे अर्पित करना",
};

export const RHYTHM_ITEM_TYPE_LABELS: Record<RhythmItemType, string> = {
  mantra: "Mantra",
  sankalp: "Sankalp",
  practice: "Practice",
  reflection: "Reflection",
  library: "Library",
};

export const RHYTHM_ITEM_TYPE_LABELS_HI: Record<RhythmItemType, string> = {
  mantra: "मंत्र",
  sankalp: "संकल्प",
  practice: "अभ्यास",
  reflection: "चिंतन",
  library: "पुस्तकालय",
};

// ── Door constants ──────────────────────────────────────────────────────────

export const VALID_DOOR_IDS: readonly DoorId[] = [
  "my_rhythm",
  "inner_path",
  "quick_reset",
  "tell_mitra",
];

// Approved display labels. CB-01 LOCKED — no changes without S0 + S05 approval.
export const DOOR_LABELS: Record<DoorId, string> = {
  my_rhythm: "My Rhythm",
  inner_path: "Inner Path",
  quick_reset: "Quick Chant",
  tell_mitra: "Tell Mitra",
};

export const DOOR_LABELS_HI: Record<DoorId, string> = {
  my_rhythm: "मेरी लय",
  inner_path: "आंतरिक पथ",
  quick_reset: "त्वरित जप",
  tell_mitra: "मित्र को बताएं",
};

// ── Room constants ──────────────────────────────────────────────────────────

export const VALID_ROOM_IDS: readonly VerifiedRoomId[] = [
  "room_stillness",
  "room_connection",
  "room_release",
  "room_clarity",
  "room_growth",
  "room_joy",
];

// Labels verified against core/tell_mitra_view.py _ROOM_LABELS on origin/dev.
export const ROOM_LABELS: Record<VerifiedRoomId, string> = {
  room_stillness: "Find Calm",
  room_release: "Set It Down",
  room_clarity: "Find Clarity",
  room_joy: "Notice What's Good",
  room_connection: "Feel Connected",
  room_growth: "Take the Next Step",
};

export const ROOM_LABELS_HI: Record<VerifiedRoomId, string> = {
  room_stillness: "शांत हों",
  room_release: "इसे रख दें",
  room_clarity: "स्पष्टता पाएं",
  room_joy: "अच्छाई देखें",
  room_connection: "जुड़ाव महसूस करें",
  room_growth: "अगला कदम उठाएं",
};

// Descriptions verified against core/tell_mitra_view.py _ROOM_LABELS on origin/dev.
export const ROOM_DESCRIPTIONS: Record<VerifiedRoomId, string> = {
  room_stillness: "A room to steady the mind when things feel too much.",
  room_release: "A room to set down what feels heavy.",
  room_clarity: "A room to see the next step more clearly.",
  room_joy: "A room to notice what is already good.",
  room_connection: "A room for when the heart feels alone.",
  room_growth: "A room to turn energy into one clear action.",
};

export const ROOM_DESCRIPTIONS_HI: Record<VerifiedRoomId, string> = {
  room_stillness: "एक कमरा जब चीजें बहुत अधिक लगें तो मन को स्थिर करने के लिए।",
  room_release: "एक कमरा जो भारी लगे उसे रखने के लिए।",
  room_clarity: "एक कमरा अगला कदम स्पष्ट रूप से देखने के लिए।",
  room_joy: "एक कमरा यह देखने के लिए कि पहले से क्या अच्छा है।",
  room_connection: "एक कमरा जब हृदय अकेला महसूस करे।",
  room_growth: "एक कमरा ऊर्जा को एक स्पष्ट कार्य में बदलने के लिए।",
};

// ── Guards ──────────────────────────────────────────────────────────────────

export function isValidRoomId(id: unknown): id is VerifiedRoomId {
  return (
    typeof id === "string" && (VALID_ROOM_IDS as readonly string[]).includes(id)
  );
}

export function isValidDoorId(id: unknown): id is DoorId {
  return (
    typeof id === "string" && (VALID_DOOR_IDS as readonly string[]).includes(id)
  );
}

// ── Lookups ─────────────────────────────────────────────────────────────────

export function getRoomLabel(roomId: VerifiedRoomId): string {
  return ROOM_LABELS[roomId] ?? roomId;
}

export function getRoomDescription(roomId: VerifiedRoomId): string {
  return ROOM_DESCRIPTIONS[roomId] ?? "";
}

/**
 * Flattens a TellMitraRoomEntryContext into query params for getRoomRender.
 * If roomId is supplied and does not match ctx.decision.suggested_room_id, returns {}
 * to prevent copy bleed (e.g. distress_acute context applied to room_release).
 */
export function getRoomRenderParamsFromEntryContext(
  ctx: TellMitraRoomEntryContext | null | undefined,
  roomId?: string,
): {
  intent_type?: string;
  source_surface?: string;
  tell_mitra_event_id?: string | number;
} {
  if (!ctx) return {};
  if (
    roomId &&
    ctx.decision?.suggested_room_id &&
    ctx.decision.suggested_room_id !== roomId
  ) {
    return {};
  }
  const result: {
    intent_type?: string;
    source_surface?: string;
    tell_mitra_event_id?: string | number;
  } = {};
  if (ctx.situation?.intent_type)
    result.intent_type = ctx.situation.intent_type;
  if (ctx.source_surface) result.source_surface = ctx.source_surface;
  if (ctx.tell_mitra_event_id != null)
    result.tell_mitra_event_id = ctx.tell_mitra_event_id;
  return result;
}

export function getDoorLabel(doorId: DoorId): string {
  return DOOR_LABELS[doorId] ?? doorId;
}

/**
 * Returns true when roomEntryContext came from any Tell Mitra surface
 * (tell_mitra_door, tell_mitra_followup_chip, tell_mitra_start_fresh, etc.)
 * and carries a resolved intent_type.
 *
 * Use this everywhere instead of inline source_surface === "tell_mitra" checks.
 * The backend sends the specific sub-surface ("tell_mitra_door", not "tell_mitra"),
 * so an exact-equality check silently fails for every real Tell Mitra entry.
 */
export function hasTellMitraRoomEntryContext(
  roomEntryContext?: TellMitraRoomEntryContext | null,
): boolean {
  return (
    typeof roomEntryContext?.source_surface === "string" &&
    roomEntryContext.source_surface.startsWith("tell_mitra") &&
    !!roomEntryContext?.situation?.intent_type
  );
}

// ── Rhythm suggest helpers ───────────────────────────────────────────────────

export const RHYTHM_SUGGEST_COPY = {
  loading: "Mitra is shaping your rhythm…",
  error: "Mitra couldn’t shape this automatically right now.",
  tryAgain: "Try Again",
  chooseFromLibrary: "Choose from Library",
  signInRequired: "Sign in to let Mitra shape your rhythm.",
  signIn: "Sign in",
} as const;

export const RHYTHM_SUGGEST_COPY_HI = {
  loading: "मित्र आपकी लय बना रहा है…",
  error: "मित्र अभी इसे स्वचालित रूप से नहीं बना सका।",
  tryAgain: "फिर कोशिश करें",
  chooseFromLibrary: "पुस्तकालय से चुनें",
  signInRequired: "मित्र को आपकी लय बनाने दें — साइन इन करें।",
  signIn: "साइन इन करें",
} as const;

/**
 * Coerces the raw /rhythm/suggest/ response into a typed RhythmSuggestResponse with safe defaults.
 */
export function normalizeRhythmSuggestResponse(
  raw: unknown,
): RhythmSuggestResponse {
  if (raw === null || typeof raw !== "object") {
    return {
      suggestion_request_id: "",
      status: "error",
      source: "error",
      confidence: 0,
      items: [],
      reasoning: {},
      fallback_used: false,
      missing_slots: [],
      warnings: [],
    };
  }
  const r = raw as Record<string, unknown>;
  return {
    suggestion_request_id:
      typeof r["suggestion_request_id"] === "string"
        ? r["suggestion_request_id"]
        : "",
    status:
      r["status"] === "ok" ||
      r["status"] === "partial" ||
      r["status"] === "error"
        ? (r["status"] as "ok" | "partial" | "error")
        : "error",
    source:
      typeof r["source"] === "string"
        ? (r["source"] as RhythmSuggestResponse["source"])
        : "error",
    confidence: typeof r["confidence"] === "number" ? r["confidence"] : 0,
    items: Array.isArray(r["items"]) ? (r["items"] as RhythmSuggestItem[]) : [],
    reasoning:
      typeof r["reasoning"] === "object" && r["reasoning"] !== null
        ? (r["reasoning"] as Partial<Record<RhythmTimeBand, string>>)
        : {},
    fallback_used:
      typeof r["fallback_used"] === "boolean" ? r["fallback_used"] : false,
    missing_slots: Array.isArray(r["missing_slots"])
      ? (r["missing_slots"] as RhythmTimeBand[])
      : [],
    warnings: Array.isArray(r["warnings"]) ? (r["warnings"] as string[]) : [],
  };
}

/**
 * Converts a RhythmSuggestItem from the backend to a RhythmWizardLocalItem for wizard state.
 * Preserves all provenance fields for display (why_this etc.) without any unsafe cast.
 */
export function rhythmSuggestItemToLocalItem(
  it: RhythmSuggestItem,
): RhythmWizardLocalItem {
  return {
    slot: it.slot,
    item_type: it.item_type,
    item_id: it.item_id,
    title_snapshot: it.title_snapshot,
    description_snapshot: it.description_snapshot,
    source: it.source,
    sort_order: it.sort_order,
    reminder_enabled: it.reminder_enabled,
    reminder_time: it.reminder_time,
    why_this: it.why_this,
    suggestion_source: it.suggestion_source,
    confidence: it.confidence,
    reasoning_code: it.reasoning_code,
    suggestion_request_id: it.suggestion_request_id,
  };
}

/**
 * Strips provenance fields before POSTing to /rhythm/setup/.
 * Accepts RhythmWizardLocalItem[] so library-chosen items (without provenance) also work.
 */
export function toRhythmSetupPayloadItems(
  items: RhythmWizardLocalItem[],
): RhythmSetupItem[] {
  return items.map(
    ({
      slot,
      sort_order,
      item_type,
      item_id,
      title_snapshot,
      description_snapshot,
      source,
      reminder_enabled,
      reminder_time,
    }) => ({
      slot,
      sort_order,
      item_type,
      item_id,
      title_snapshot,
      description_snapshot: description_snapshot ?? undefined,
      source,
      reminder_enabled,
      reminder_time: reminder_time ?? undefined,
    }),
  );
}

/**
 * Returns bands that have a selected moment but no item in the wizard state.
 * Used to gate the "Accept Rhythm" button.
 */
export function getMissingSuggestionSlots(
  selectedMoments: RhythmTimeBand[],
  items: Partial<Record<RhythmTimeBand, unknown>>,
): RhythmTimeBand[] {
  return selectedMoments.filter((band) => !items[band]);
}

// Re-export for convenience so callers only need @kalpx/contracts
export type { RhythmSuggestItem, RhythmSuggestResponse, RhythmWizardLocalItem };

// ── normalizeTellMitraResult ─────────────────────────────────────────────────
//
// Coerces unknown API response into TellMitraV3Response with safe defaults.
// Use this in both apps immediately after the POST /api/mitra/v3/tell-mitra/ call.
// Matches backend _SAFE_RESPONSE block.

export function normalizeTellMitraResult(raw: unknown): TellMitraV3Response {
  if (raw === null || typeof raw !== "object") {
    return _safeTellMitraResponse();
  }
  const r = raw as Record<string, unknown>;
  const room_raw = r["suggested_room_id"];
  const door_raw = r["door"];
  return {
    intent_matched:
      typeof r["intent_matched"] === "boolean" ? r["intent_matched"] : false,
    intent_type: typeof r["intent_type"] === "string" ? r["intent_type"] : null,
    confidence: typeof r["confidence"] === "number" ? r["confidence"] : 0,
    source: typeof r["source"] === "string" ? r["source"] : "none",
    fallback_reason:
      typeof r["fallback_reason"] === "string" ? r["fallback_reason"] : "",
    suggested_action: _coerceRoutingType(r["suggested_action"]),
    suggested_room_id: isValidRoomId(room_raw) ? room_raw : null,
    suggested_room_label:
      typeof r["suggested_room_label"] === "string"
        ? r["suggested_room_label"]
        : null,
    suggested_room_description:
      typeof r["suggested_room_description"] === "string"
        ? r["suggested_room_description"]
        : null,
    door: isValidDoorId(door_raw) ? door_raw : null,
    response_copy:
      typeof r["response_copy"] === "string" ? r["response_copy"] : "",
    state_tags: Array.isArray(r["state_tags"])
      ? r["state_tags"].filter((t): t is string => typeof t === "string")
      : [],
    companion_state_written:
      typeof r["companion_state_written"] === "boolean"
        ? r["companion_state_written"]
        : false,
    safety_flag:
      typeof r["safety_flag"] === "boolean" ? r["safety_flag"] : false,
    prior_context_used:
      typeof r["prior_context_used"] === "boolean"
        ? r["prior_context_used"]
        : false,
    prior_context_summary:
      typeof r["prior_context_summary"] === "string"
        ? r["prior_context_summary"]
        : null,
    prior_suggested_room_id: isValidRoomId(r["prior_suggested_room_id"])
      ? r["prior_suggested_room_id"]
      : null,
    prior_suggested_room_label:
      typeof r["prior_suggested_room_label"] === "string"
        ? r["prior_suggested_room_label"]
        : null,
    next_options: Array.isArray(r["next_options"])
      ? (r["next_options"] as TellMitraNextOption[])
      : [],
    tell_mitra_event_id:
      typeof r["tell_mitra_event_id"] === "string" ||
      typeof r["tell_mitra_event_id"] === "number"
        ? (r["tell_mitra_event_id"] as string | number)
        : null,
    room_entry_context: _normalizeRoomEntryContext(r["room_entry_context"]),
    conversation_context: _normalizeConversationContext(
      r["conversation_context"],
    ),
    support_depth: _coerceSupportDepth(r["support_depth"]),
    followup_question: _normalizeFollowupQuestion(r["followup_question"]),
    conversation_stage:
      typeof r["conversation_stage"] === "string"
        ? r["conversation_stage"]
        : "none",
    specific_context:
      typeof r["specific_context"] === "string" ? r["specific_context"] : null,
    immediate_support_requested:
      typeof r["immediate_support_requested"] === "boolean"
        ? r["immediate_support_requested"]
        : false,
    predictive_eligible:
      typeof r["predictive_eligible"] === "boolean"
        ? r["predictive_eligible"]
        : false,
    pattern_key: typeof r["pattern_key"] === "string" ? r["pattern_key"] : null,
    // S17-D1X-A: multi-signal intelligence fields
    specific_contexts: Array.isArray(r["specific_contexts"])
      ? (r["specific_contexts"] as unknown[]).filter(
          (v): v is string => typeof v === "string",
        )
      : [],
    primary_specific_context:
      typeof r["primary_specific_context"] === "string"
        ? r["primary_specific_context"]
        : null,
    support_need:
      typeof r["support_need"] === "string"
        ? r["support_need"]
        : "understand_context_first",
    secondary_room_id:
      typeof r["secondary_room_id"] === "string"
        ? r["secondary_room_id"]
        : null,
  };
}

function _safeTellMitraResponse(): TellMitraV3Response {
  return {
    intent_matched: false,
    intent_type: null,
    confidence: 0,
    source: "none",
    fallback_reason: "internal_error",
    suggested_action: "none",
    suggested_room_id: null,
    suggested_room_label: null,
    suggested_room_description: null,
    door: null,
    response_copy: "",
    state_tags: [],
    companion_state_written: false,
    safety_flag: false,
    prior_context_used: false,
    prior_context_summary: null,
    prior_suggested_room_id: null,
    prior_suggested_room_label: null,
    next_options: [],
    tell_mitra_event_id: null,
    room_entry_context: null,
    conversation_context: null,
    support_depth: "direct_room" as TellMitraSupportDepth,
    followup_question: null,
    conversation_stage: "none",
    specific_context: null,
    immediate_support_requested: false,
    predictive_eligible: false,
    pattern_key: null,
    specific_contexts: [],
    primary_specific_context: null,
    support_need: "understand_context_first",
    secondary_room_id: null,
  };
}

const _VALID_ROUTING_TYPES = new Set([
  "navigate_to_room",
  "navigate_to_door",
  "provide_wisdom_inline",
  "ask_followup",
  "none",
]);

function _coerceRoutingType(
  v: unknown,
): TellMitraV3Response["suggested_action"] {
  return typeof v === "string" && _VALID_ROUTING_TYPES.has(v)
    ? (v as TellMitraV3Response["suggested_action"])
    : "none";
}

const _VALID_SUPPORT_DEPTHS = new Set([
  "direct_room",
  "ask_followup",
  "context_followup",
  "room_with_followup",
  "wisdom_inline",
  "door_navigation",
]);

function _coerceSupportDepth(v: unknown): TellMitraSupportDepth {
  return typeof v === "string" && _VALID_SUPPORT_DEPTHS.has(v)
    ? (v as TellMitraSupportDepth)
    : "direct_room";
}

function _normalizeConversationContext(
  raw: unknown,
): TellMitraConversationContext | null {
  if (raw === null || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  return {
    turn_count: typeof r["turn_count"] === "number" ? r["turn_count"] : 1,
    prior_context_used:
      typeof r["prior_context_used"] === "boolean"
        ? r["prior_context_used"]
        : false,
    prior_intent_type:
      typeof r["prior_intent_type"] === "string"
        ? r["prior_intent_type"]
        : null,
    prior_state_tags: Array.isArray(r["prior_state_tags"])
      ? r["prior_state_tags"].filter((t): t is string => typeof t === "string")
      : [],
    prior_life_context:
      typeof r["prior_life_context"] === "string"
        ? r["prior_life_context"]
        : null,
    current_input_added_context:
      typeof r["current_input_added_context"] === "boolean"
        ? r["current_input_added_context"]
        : false,
    current_life_context:
      typeof r["current_life_context"] === "string"
        ? r["current_life_context"]
        : null,
    summary: typeof r["summary"] === "string" ? r["summary"] : null,
  };
}

function _normalizeFollowupQuestion(
  raw: unknown,
): TellMitraFollowupQuestion | null {
  if (raw === null || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const prompt = typeof r["prompt"] === "string" ? r["prompt"] : "";
  if (!prompt) return null;
  const options = Array.isArray(r["options"])
    ? r["options"].filter(
        (o): o is TellMitraFollowupOption =>
          typeof o === "object" &&
          o !== null &&
          typeof (o as Record<string, unknown>)["label"] === "string" &&
          typeof (o as Record<string, unknown>)["value"] === "string",
      )
    : [];
  return { prompt, options };
}

// ── Tell Mitra chip submission text (S17-D4B) ─────────────────────────────────
// Single source of truth for chip value → free-text submission mapping.
// Used by both web TellMitraPage and mobile TellMitraContainer.
// If a value is missing, callers fall back to opt.label and emit a dev warning.

export const CHIP_SUBMIT_TEXT: Readonly<Record<string, string>> = {
  // Pre-S17-D1 work chips
  workload: "It is the workload that is overwhelming me",
  people: "It is the people at work that is getting to me",
  pressure: "I am feeling the pressure of expectations",
  fear_falling_behind: "I am afraid of falling behind",
  physical_tired: "I am physically exhausted",
  emotional_empty: "I feel emotionally empty",
  no_motivation: "I have no motivation to continue",
  vent: "I need to express what I am feeling",
  disconnected: "I am feeling disconnected from everyone",
  conflict: "I am in a conflict with someone close to me",
  immediate_worry: "I have an immediate financial worry",
  ongoing_stress: "I am dealing with ongoing financial stress",
  future_uncertainty: "I feel uncertain about my financial future",
  // S17-D1 broad life-context chips
  work_career: "Work and my career is where most of this weight is coming from",
  relationships:
    "My relationships are where most of this weight is coming from",
  health_energy:
    "My body and health is where most of this weight is coming from",
  money_security: "Money and financial security is weighing on me the most",
  family: "Family is where most of this weight is coming from",
  purpose_direction:
    "Feeling lost or without direction is what is weighing on me",
  not_sure: "I am not sure where this is coming from",
  // S17-D1 health context chips
  sleep: "I can't sleep and it is wearing me down",
  physical_exhausted: "I am physically exhausted and depleted",
  physical_concern: "Something feels physically wrong and it is concerning me",
  pain: "I am in physical pain right now",
  // S17-D1 purpose context chips
  no_direction: "I have no clear direction and do not know which way to go",
  no_meaning: "Nothing feels meaningful right now",
  wrong_path: "I feel like I am on the wrong path or in the wrong place",
  questioning: "I am questioning everything right now",
  // S17-D1 growth chips
  daily_practice: "I want to build a daily practice and create consistency",
  focus_clarity: "I need more focus and clarity in my life",
  inner_steadiness: "I want more inner steadiness and groundedness",
  facing_hard: "I am facing something hard and need support moving through it",
  spiritual_deepening: "I want to deepen my spiritual practice",
  // S17-D1 grief / loneliness chips
  loss_person: "I have lost someone and I am grieving",
  relationship_ending: "A relationship has ended and I am struggling with it",
  cut_off: "I am feeling cut off from people I care about",
  lingering_hurt: "There is hurt that stays with me and I cannot let it go",
  far_from_loved: "I am far from the people I love and miss them",
  around_not_felt: "I am around people but still feel completely alone",
  unseen: "No one really knows me and I feel unseen",
  after_conflict:
    "Something happened between me and someone and now I feel alone",
  // Quick-start + return card chips
  overwhelmed: "I am feeling overwhelmed right now",
  need_clarity: "I need more clarity and direction right now",
  more_steady: "I am feeling more steady now",
  still_heavy: "I still feel heavy and weighed down",
};

// ── Quick Reset shared product logic (Stream E, Gate E-1 approved 2026-05-10) ──

// Backend action identifiers → frontend display labels (LOCKED 2026-05-10)
export const QUICK_RESET_ACTION_LABELS: Record<string, string> = {
  mitra_suggest_for_this_moment: "Try another calming mantra",
  set_as_default: "Set as my Quick Reset mantra",
  change_mantra: "Change mantra",
  choose_from_library: "Choose from library",
};

export const QUICK_RESET_ACTION_LABELS_HI: Record<string, string> = {
  mitra_suggest_for_this_moment: "एक और शांत मंत्र आज़माएं",
  set_as_default: "मेरा क्विक रीसेट मंत्र सेट करें",
  change_mantra: "मंत्र बदलें",
  choose_from_library: "पुस्तकालय से चुनें",
};

export function getQuickResetActionLabel(action: string, locale = "en"): string {
  if (locale === "hi") return QUICK_RESET_ACTION_LABELS_HI[action] ?? QUICK_RESET_ACTION_LABELS[action] ?? action;
  return QUICK_RESET_ACTION_LABELS[action] ?? action;
}

// Normalises a browse-mantras API result item into QuickResetMantra shape.
// browse API returns `id` (not item_id); curated rows have id="curated:{n}" — excluded.
// No audio_url in browse response; normalised to null.
export function normalizeMantraFromBrowse(
  raw: Record<string, unknown>,
): QuickResetMantra | null {
  const id = typeof raw["id"] === "string" ? raw["id"] : null;
  if (!id || id.startsWith("curated:")) return null;
  return {
    item_id: id,
    title: typeof raw["title"] === "string" ? raw["title"] : "",
    devanagari: typeof raw["devanagari"] === "string" ? raw["devanagari"] : "",
    iast: typeof raw["iast"] === "string" ? raw["iast"] : "",
    meaning:
      typeof raw["meaning"] === "string"
        ? raw["meaning"]
        : typeof raw["essence"] === "string"
          ? raw["essence"]
          : "",
    essence: typeof raw["essence"] === "string" ? raw["essence"] : undefined,
    audio_url:
      typeof raw["audio_url"] === "string" && raw["audio_url"]
        ? raw["audio_url"]
        : null,
  };
}

// Returns a random mantra from `candidates` whose item_id differs from `currentItemId`.
// Falls back to null if no different mantra is available.
export function pickDifferentMantra(
  candidates: QuickResetMantra[],
  currentItemId: string,
): QuickResetMantra | null {
  const different = candidates.filter((m) => m.item_id !== currentItemId);
  if (different.length === 0) return null;
  return different[Math.floor(Math.random() * different.length)];
}

// Normalises browse-mantras raw array → QuickResetMantra[].
export function normalizeBrowseMantras(raw: unknown[]): QuickResetMantra[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeMantraFromBrowse(item as Record<string, unknown>))
    .filter((m): m is QuickResetMantra => m !== null);
}

// Re-export for convenience
export type { QuickResetMantra };

function _normalizeRoomEntryContext(
  raw: unknown,
): TellMitraRoomEntryContext | null {
  if (raw === null || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const sit =
    typeof r["situation"] === "object" && r["situation"] !== null
      ? (r["situation"] as Record<string, unknown>)
      : null;
  const dec =
    typeof r["decision"] === "object" && r["decision"] !== null
      ? (r["decision"] as Record<string, unknown>)
      : null;
  const lrn =
    typeof r["learning"] === "object" && r["learning"] !== null
      ? (r["learning"] as Record<string, unknown>)
      : {};
  // Require minimum usable fields; return null rather than a mostly empty object
  if (!sit || !dec) return null;
  if (!sit["intent_type"] || !dec["suggested_room_id"]) return null;
  return {
    source_surface:
      typeof r["source_surface"] === "string" ? r["source_surface"] : "",
    tell_mitra_event_id:
      typeof r["tell_mitra_event_id"] === "string" ||
      typeof r["tell_mitra_event_id"] === "number"
        ? r["tell_mitra_event_id"]
        : null,
    situation: {
      intent_type: sit["intent_type"] as string,
      state_tags: Array.isArray(sit["state_tags"])
        ? sit["state_tags"].filter((t): t is string => typeof t === "string")
        : [],
      energy_state:
        typeof sit["energy_state"] === "string" ? sit["energy_state"] : "",
      life_context:
        typeof sit["life_context"] === "string" ? sit["life_context"] : "",
      prior_context_used:
        typeof sit["prior_context_used"] === "boolean"
          ? sit["prior_context_used"]
          : false,
    },
    decision: {
      routing_type:
        typeof dec["routing_type"] === "string" ? dec["routing_type"] : "",
      suggested_room_id: dec["suggested_room_id"] as string,
      confidence: typeof dec["confidence"] === "number" ? dec["confidence"] : 0,
      source: typeof dec["source"] === "string" ? dec["source"] : "",
    },
    learning: {
      eligible_for_learning:
        typeof lrn["eligible_for_learning"] === "boolean"
          ? lrn["eligible_for_learning"]
          : false,
      feedback_pending:
        typeof lrn["feedback_pending"] === "boolean"
          ? lrn["feedback_pending"]
          : false,
    },
    conversation_context:
      _normalizeConversationContext(r["conversation_context"]) ?? undefined,
  };
}
