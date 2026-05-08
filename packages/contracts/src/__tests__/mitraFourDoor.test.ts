import { describe, it, expect } from 'vitest';
import {
  isValidRoomId,
  isValidDoorId,
  getRoomLabel,
  getRoomDescription,
  getDoorLabel,
  normalizeTellMitraResult,
  getRoomRenderParamsFromEntryContext,
  ROOM_LABELS,
  DOOR_LABELS,
  VALID_ROOM_IDS,
  VALID_DOOR_IDS,
} from '../mitraFourDoor';
import type { TellMitraV3Response, TellMitraRoomEntryContext } from '@kalpx/types';

// ── isValidRoomId ─────────────────────────────────────────────────────────────

describe('isValidRoomId', () => {
  it.each([
    "room_stillness", "room_connection", "room_release",
    "room_clarity",   "room_growth",     "room_joy",
  ] as const)('"%s" → true', (id) => {
    expect(isValidRoomId(id)).toBe(true);
  });

  it.each([
    "grief_room", "room_find_calm", "room_stillness_typo", "", null, 123,
  ])('"%s" → false', (id) => {
    expect(isValidRoomId(id)).toBe(false);
  });
});

// ── isValidDoorId ─────────────────────────────────────────────────────────────

describe('isValidDoorId', () => {
  it.each([
    "my_rhythm", "inner_path", "quick_reset", "tell_mitra",
  ] as const)('"%s" → true', (id) => {
    expect(isValidDoorId(id)).toBe(true);
  });

  it.each([
    "daily_companion", "reset", "My Rhythm", "", null,
  ])('"%s" → false', (id) => {
    expect(isValidDoorId(id)).toBe(false);
  });
});

// ── getRoomLabel ──────────────────────────────────────────────────────────────

describe('getRoomLabel', () => {
  it('"room_stillness" → "Find Calm"', () => {
    expect(getRoomLabel("room_stillness")).toBe("Find Calm");
  });
  it('"room_release" → "Set It Down"', () => {
    expect(getRoomLabel("room_release")).toBe("Set It Down");
  });
  it('"room_joy" → "Notice What\'s Good"', () => {
    expect(getRoomLabel("room_joy")).toBe("Notice What's Good");
  });
  it('"room_connection" → "Feel Connected"', () => {
    expect(getRoomLabel("room_connection")).toBe("Feel Connected");
  });
});

// ── getRoomDescription ────────────────────────────────────────────────────────

describe('getRoomDescription', () => {
  it('"room_stillness" → exact description', () => {
    expect(getRoomDescription("room_stillness")).toBe(
      "A room to steady the mind when things feel too much.",
    );
  });
  it('"room_release" → exact description', () => {
    expect(getRoomDescription("room_release")).toBe(
      "A room to set down what feels heavy.",
    );
  });
});

// ── getDoorLabel ──────────────────────────────────────────────────────────────

describe('getDoorLabel', () => {
  it('"my_rhythm" → "My Rhythm"', () => {
    expect(getDoorLabel("my_rhythm")).toBe("My Rhythm");
  });
  it('"tell_mitra" → "Tell Mitra"', () => {
    expect(getDoorLabel("tell_mitra")).toBe("Tell Mitra");
  });
  it('"inner_path" → "Inner Path"', () => {
    expect(getDoorLabel("inner_path")).toBe("Inner Path");
  });
  it('"quick_reset" → "Quick Reset"', () => {
    expect(getDoorLabel("quick_reset")).toBe("Quick Reset");
  });
});

// ── normalizeTellMitraResult ──────────────────────────────────────────────────

const VALID_FULL_RESPONSE: TellMitraV3Response = {
  intent_matched: true,
  intent_type: "distress_acute",
  confidence: 0.85,
  source: "keyword",
  fallback_reason: "",
  suggested_action: "navigate_to_room",
  suggested_room_id: "room_stillness",
  suggested_room_label: "Find Calm",
  suggested_room_description: "A room to steady the mind when things feel too much.",
  door: null,
  response_copy: "I hear you.",
  state_tags: ["triggered"],
  companion_state_written: false,
  safety_flag: false,
  prior_context_used: false,
  prior_context_summary: null,
  prior_suggested_room_id: null,
  prior_suggested_room_label: null,
  next_options: [],
  tell_mitra_event_id: null,
  room_entry_context: null,
};

describe('normalizeTellMitraResult', () => {
  it('valid full shape passes through unchanged', () => {
    const result = normalizeTellMitraResult(VALID_FULL_RESPONSE);
    expect(result).toEqual(VALID_FULL_RESPONSE);
  });

  it('null input → safe defaults', () => {
    const result = normalizeTellMitraResult(null);
    expect(result.intent_matched).toBe(false);
    expect(result.suggested_action).toBe("none");
    expect(result.suggested_room_id).toBeNull();
    expect(result.door).toBeNull();
    expect(result.state_tags).toEqual([]);
    expect(result.companion_state_written).toBe(false);
  });

  it('{ suggested_room_id: "grief_room" } → suggested_room_id: null', () => {
    const result = normalizeTellMitraResult({ suggested_room_id: "grief_room" });
    expect(result.suggested_room_id).toBeNull();
  });

  it('{ suggested_room_id: "room_stillness" } → suggested_room_id: "room_stillness"', () => {
    const result = normalizeTellMitraResult({ suggested_room_id: "room_stillness" });
    expect(result.suggested_room_id).toBe("room_stillness");
  });

  it('{ door: "daily_companion" } → door: null', () => {
    const result = normalizeTellMitraResult({ door: "daily_companion" });
    expect(result.door).toBeNull();
  });

  it('{ door: "my_rhythm" } → door: "my_rhythm"', () => {
    const result = normalizeTellMitraResult({ door: "my_rhythm" });
    expect(result.door).toBe("my_rhythm");
  });

  it('{ suggested_action: "navigate_to_room" } → suggested_action: "navigate_to_room"', () => {
    const result = normalizeTellMitraResult({ suggested_action: "navigate_to_room" });
    expect(result.suggested_action).toBe("navigate_to_room");
  });

  it('{ suggested_action: "teleport" } → suggested_action: "none"', () => {
    const result = normalizeTellMitraResult({ suggested_action: "teleport" });
    expect(result.suggested_action).toBe("none");
  });
});

// ── Coverage assertions ───────────────────────────────────────────────────────

describe('coverage assertions', () => {
  it('ROOM_LABELS has 6 entries', () => {
    expect(Object.keys(ROOM_LABELS).length).toBe(6);
  });
  it('DOOR_LABELS has 4 entries', () => {
    expect(Object.keys(DOOR_LABELS).length).toBe(4);
  });
  it('VALID_ROOM_IDS has 6 entries', () => {
    expect(VALID_ROOM_IDS.length).toBe(6);
  });
  it('VALID_DOOR_IDS has 4 entries', () => {
    expect(VALID_DOOR_IDS.length).toBe(4);
  });
});

// ── S17-C: normalizeTellMitraResult — new fields ──────────────────────────────

const VALID_ROOM_ENTRY_CONTEXT: TellMitraRoomEntryContext = {
  source_surface: "tell_mitra",
  tell_mitra_event_id: "db08ca38-0000-0000-0000-000000000001",
  situation: {
    intent_type: "distress_acute",
    state_tags: ["overwhelmed"],
    energy_state: "drained",
    life_context: "work_career",
    prior_context_used: false,
  },
  decision: {
    routing_type: "navigate_to_room",
    suggested_room_id: "room_stillness",
    confidence: 0.95,
    source: "internal_rule",
  },
  learning: {
    eligible_for_learning: true,
    feedback_pending: true,
  },
};

describe('S17-C normalizeTellMitraResult — tell_mitra_event_id + room_entry_context', () => {
  it('passes through tell_mitra_event_id (UUID string)', () => {
    const result = normalizeTellMitraResult({
      ...VALID_FULL_RESPONSE,
      tell_mitra_event_id: "db08ca38-0000-0000-0000-000000000001",
    });
    expect(result.tell_mitra_event_id).toBe("db08ca38-0000-0000-0000-000000000001");
  });

  it('passes through full room_entry_context block with correct shape', () => {
    const result = normalizeTellMitraResult({
      ...VALID_FULL_RESPONSE,
      room_entry_context: VALID_ROOM_ENTRY_CONTEXT,
    });
    expect(result.room_entry_context).toEqual(VALID_ROOM_ENTRY_CONTEXT);
    expect(result.room_entry_context?.situation.intent_type).toBe("distress_acute");
    expect(result.room_entry_context?.decision.suggested_room_id).toBe("room_stillness");
  });

  it('returns room_entry_context: null when absent in raw response', () => {
    const result = normalizeTellMitraResult({ ...VALID_FULL_RESPONSE });
    expect(result.room_entry_context).toBeNull();
  });

  it('returns room_entry_context: null when situation is missing (defensive normalization)', () => {
    const result = normalizeTellMitraResult({
      ...VALID_FULL_RESPONSE,
      room_entry_context: { source_surface: "tell_mitra", decision: { suggested_room_id: "room_stillness" } },
    });
    expect(result.room_entry_context).toBeNull();
  });
});

// ── S17-C: getRoomRenderParamsFromEntryContext ────────────────────────────────

describe('S17-C getRoomRenderParamsFromEntryContext', () => {
  it('null input → {}', () => {
    expect(getRoomRenderParamsFromEntryContext(null)).toEqual({});
  });

  it('undefined input → {}', () => {
    expect(getRoomRenderParamsFromEntryContext(undefined)).toEqual({});
  });

  it('matching roomId → returns all three params', () => {
    const result = getRoomRenderParamsFromEntryContext(VALID_ROOM_ENTRY_CONTEXT, "room_stillness");
    expect(result.intent_type).toBe("distress_acute");
    expect(result.source_surface).toBe("tell_mitra");
    expect(result.tell_mitra_event_id).toBe("db08ca38-0000-0000-0000-000000000001");
  });

  it('mismatch roomId → {} (prevents copy bleed)', () => {
    const result = getRoomRenderParamsFromEntryContext(VALID_ROOM_ENTRY_CONTEXT, "room_release");
    expect(result).toEqual({});
  });

  it('no roomId supplied → returns params without mismatch guard', () => {
    const result = getRoomRenderParamsFromEntryContext(VALID_ROOM_ENTRY_CONTEXT);
    expect(result.intent_type).toBe("distress_acute");
  });

  it('null tell_mitra_event_id → omitted from params', () => {
    const ctxNullId: TellMitraRoomEntryContext = {
      ...VALID_ROOM_ENTRY_CONTEXT,
      tell_mitra_event_id: null,
    };
    const result = getRoomRenderParamsFromEntryContext(ctxNullId, "room_stillness");
    expect('tell_mitra_event_id' in result).toBe(false);
  });
});
