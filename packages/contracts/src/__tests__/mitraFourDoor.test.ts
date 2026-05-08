import { describe, it, expect } from 'vitest';
import {
  isValidRoomId,
  isValidDoorId,
  getRoomLabel,
  getRoomDescription,
  getDoorLabel,
  normalizeTellMitraResult,
  ROOM_LABELS,
  DOOR_LABELS,
  VALID_ROOM_IDS,
  VALID_DOOR_IDS,
} from '../mitraFourDoor';
import type { TellMitraV3Response } from '@kalpx/types';

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
