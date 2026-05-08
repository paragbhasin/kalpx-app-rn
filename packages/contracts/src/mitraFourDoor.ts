// API calls (getMitraHomeV3, postTellMitraV3) are app-local in mitraApi.ts — see S08 decision.

import type {
  DoorId,
  VerifiedRoomId,
  TellMitraV3Response,
  RhythmTimeBand,
  RhythmItemType,
  RhythmItemSource,
  RhythmReminderPreference,
} from '@kalpx/types';

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

export const RHYTHM_TIME_BANDS: RhythmTimeBand[] = ["morning", "afternoon", "night"];

export const RHYTHM_BAND_LABELS: Record<RhythmTimeBand, string> = {
  morning:   "Morning",
  afternoon: "Afternoon",
  night:     "Night",
};

export const RHYTHM_BAND_SUBTITLES: Record<RhythmTimeBand, string> = {
  morning:   "Start with intention",
  afternoon: "Steady the middle",
  night:     "Close with care",
};

export const RHYTHM_ITEM_TYPE_LABELS: Record<RhythmItemType, string> = {
  mantra:     "Mantra",
  sankalp:    "Sankalp",
  practice:   "Practice",
  reflection: "Reflection",
  library:    "Library",
};

// ── Door constants ──────────────────────────────────────────────────────────

export const VALID_DOOR_IDS: readonly DoorId[] = [
  "my_rhythm", "inner_path", "quick_reset", "tell_mitra",
];

// Approved display labels. CB-01 LOCKED — no changes without S0 + S05 approval.
export const DOOR_LABELS: Record<DoorId, string> = {
  my_rhythm:   "My Rhythm",
  inner_path:  "Inner Path",
  quick_reset: "Quick Reset",
  tell_mitra:  "Tell Mitra",
};

// ── Room constants ──────────────────────────────────────────────────────────

export const VALID_ROOM_IDS: readonly VerifiedRoomId[] = [
  "room_stillness", "room_connection", "room_release",
  "room_clarity",   "room_growth",     "room_joy",
];

// Labels verified against core/tell_mitra_view.py _ROOM_LABELS on origin/dev.
export const ROOM_LABELS: Record<VerifiedRoomId, string> = {
  room_stillness:  "Find Calm",
  room_release:    "Set It Down",
  room_clarity:    "Find Clarity",
  room_joy:        "Notice What's Good",
  room_connection: "Feel Connected",
  room_growth:     "Take the Next Step",
};

// Descriptions verified against core/tell_mitra_view.py _ROOM_LABELS on origin/dev.
export const ROOM_DESCRIPTIONS: Record<VerifiedRoomId, string> = {
  room_stillness:  "A room to steady the mind when things feel too much.",
  room_release:    "A room to set down what feels heavy.",
  room_clarity:    "A room to see the next step more clearly.",
  room_joy:        "A room to notice what is already good.",
  room_connection: "A room for when the heart feels alone.",
  room_growth:     "A room to turn energy into one clear action.",
};

// ── Guards ──────────────────────────────────────────────────────────────────

export function isValidRoomId(id: unknown): id is VerifiedRoomId {
  return typeof id === "string" && (VALID_ROOM_IDS as readonly string[]).includes(id);
}

export function isValidDoorId(id: unknown): id is DoorId {
  return typeof id === "string" && (VALID_DOOR_IDS as readonly string[]).includes(id);
}

// ── Lookups ─────────────────────────────────────────────────────────────────

export function getRoomLabel(roomId: VerifiedRoomId): string {
  return ROOM_LABELS[roomId] ?? roomId;
}

export function getRoomDescription(roomId: VerifiedRoomId): string {
  return ROOM_DESCRIPTIONS[roomId] ?? "";
}

export function getDoorLabel(doorId: DoorId): string {
  return DOOR_LABELS[doorId] ?? doorId;
}

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
    intent_matched:             typeof r["intent_matched"] === "boolean"   ? r["intent_matched"] : false,
    intent_type:                typeof r["intent_type"] === "string"        ? r["intent_type"]    : null,
    confidence:                 typeof r["confidence"] === "number"         ? r["confidence"]     : 0,
    source:                     typeof r["source"] === "string"             ? r["source"]         : "none",
    fallback_reason:            typeof r["fallback_reason"] === "string"    ? r["fallback_reason"]: "",
    suggested_action:           _coerceRoutingType(r["suggested_action"]),
    suggested_room_id:          isValidRoomId(room_raw) ? room_raw : null,
    suggested_room_label:       typeof r["suggested_room_label"] === "string"       ? r["suggested_room_label"]       : null,
    suggested_room_description: typeof r["suggested_room_description"] === "string" ? r["suggested_room_description"] : null,
    door:                       isValidDoorId(door_raw) ? door_raw : null,
    response_copy:              typeof r["response_copy"] === "string"      ? r["response_copy"]  : "",
    state_tags:                 Array.isArray(r["state_tags"])
                                  ? r["state_tags"].filter((t): t is string => typeof t === "string")
                                  : [],
    companion_state_written:    typeof r["companion_state_written"] === "boolean" ? r["companion_state_written"] : false,
    safety_flag:                typeof r["safety_flag"] === "boolean" ? r["safety_flag"] : false,
  };
}

function _safeTellMitraResponse(): TellMitraV3Response {
  return {
    intent_matched: false, intent_type: null, confidence: 0,
    source: "none", fallback_reason: "internal_error",
    suggested_action: "none", suggested_room_id: null,
    suggested_room_label: null, suggested_room_description: null,
    door: null, response_copy: "", state_tags: [],
    companion_state_written: false, safety_flag: false,
  };
}

const _VALID_ROUTING_TYPES = new Set([
  "navigate_to_room", "navigate_to_door", "provide_wisdom_inline", "none",
]);

function _coerceRoutingType(v: unknown): TellMitraV3Response["suggested_action"] {
  return typeof v === "string" && _VALID_ROUTING_TYPES.has(v)
    ? (v as TellMitraV3Response["suggested_action"])
    : "none";
}
