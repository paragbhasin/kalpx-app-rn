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
  conversation_context: null,
  support_depth: "direct_room",
  followup_question: null,
  conversation_stage: "ready_for_room",
  specific_context: null,
  immediate_support_requested: false,
  predictive_eligible: false,
  pattern_key: null,
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

// ── S17-D0: conversation_context, support_depth, followup_question ────────────

describe('S17-D0 normalizeTellMitraResult — conversation context + followup', () => {
  it('T1: parses full conversation_context — all 8 fields correct', () => {
    const raw = {
      ...VALID_FULL_RESPONSE,
      conversation_context: {
        turn_count: 2,
        prior_context_used: true,
        prior_intent_type: "distress_acute",
        prior_state_tags: ["overwhelmed"],
        prior_life_context: "",
        current_input_added_context: true,
        current_life_context: "work_career",
        summary: "You shared distress earlier, then told Mitra it connects to your work situation.",
      },
    };
    const result = normalizeTellMitraResult(raw);
    expect(result.conversation_context?.turn_count).toBe(2);
    expect(result.conversation_context?.prior_context_used).toBe(true);
    expect(result.conversation_context?.prior_intent_type).toBe("distress_acute");
    expect(result.conversation_context?.prior_state_tags).toEqual(["overwhelmed"]);
    expect(result.conversation_context?.prior_life_context).toBe("");
    expect(result.conversation_context?.current_input_added_context).toBe(true);
    expect(result.conversation_context?.current_life_context).toBe("work_career");
    expect(result.conversation_context?.summary).toBe(
      "You shared distress earlier, then told Mitra it connects to your work situation.",
    );
  });

  it('T2: parses support_depth="room_with_followup"', () => {
    const result = normalizeTellMitraResult({ ...VALID_FULL_RESPONSE, support_depth: "room_with_followup" });
    expect(result.support_depth).toBe("room_with_followup");
  });

  it('T3: invalid support_depth ("banana") defaults to "direct_room"', () => {
    const result = normalizeTellMitraResult({ ...VALID_FULL_RESPONSE, support_depth: "banana" });
    expect(result.support_depth).toBe("direct_room");
  });

  it('T4: parses followup_question, filters malformed options', () => {
    const raw = {
      ...VALID_FULL_RESPONSE,
      followup_question: {
        prompt: "What part of work feels heaviest?",
        options: [
          { label: "Workload", value: "workload" },
          { label: 123, value: "bad" },        // malformed label — filtered
          { label: "Pressure", value: "pressure" },
          "not_an_object",                      // malformed — filtered
        ],
      },
    };
    const result = normalizeTellMitraResult(raw);
    expect(result.followup_question?.prompt).toBe("What part of work feels heaviest?");
    expect(result.followup_question?.options).toHaveLength(2);
    expect(result.followup_question?.options[0].value).toBe("workload");
    expect(result.followup_question?.options[1].value).toBe("pressure");
  });

  it('T5: null input → conversation_context=null, support_depth="direct_room", followup_question=null', () => {
    const result = normalizeTellMitraResult(null);
    expect(result.conversation_context).toBeNull();
    expect(result.support_depth).toBe("direct_room");
    expect(result.followup_question).toBeNull();
  });

  it('T6: room_entry_context preserves nested conversation_context when present', () => {
    const ctxWithConversation: TellMitraRoomEntryContext = {
      ...VALID_ROOM_ENTRY_CONTEXT,
      conversation_context: {
        turn_count: 2,
        prior_context_used: true,
        prior_intent_type: "distress_acute",
        prior_state_tags: ["overwhelmed"],
        prior_life_context: "",
        current_input_added_context: true,
        current_life_context: "work_career",
        summary: "You shared distress earlier.",
      },
    };
    const result = normalizeTellMitraResult({ ...VALID_FULL_RESPONSE, room_entry_context: ctxWithConversation });
    expect(result.room_entry_context?.conversation_context?.turn_count).toBe(2);
    expect(result.room_entry_context?.conversation_context?.current_life_context).toBe("work_career");
  });

  it('T7: S17-C backward-compat — room_entry_context without conversation_context normalizes cleanly', () => {
    const result = normalizeTellMitraResult({
      ...VALID_FULL_RESPONSE,
      room_entry_context: VALID_ROOM_ENTRY_CONTEXT,
    });
    expect(result.room_entry_context).not.toBeNull();
    expect(result.room_entry_context?.situation.intent_type).toBe("distress_acute");
    // conversation_context absent in old response → undefined or null, no crash
    const cc = result.room_entry_context?.conversation_context;
    expect(cc === undefined || cc === null).toBe(true);
  });
});

// ── S17-D1: ask_followup routing + conversation_stage + specific_context ─────

describe('S17-D1 normalizeTellMitraResult — listening mode fields', () => {
  it('T1: suggested_action="ask_followup" passes through', () => {
    const result = normalizeTellMitraResult({ ...VALID_FULL_RESPONSE, suggested_action: "ask_followup" });
    expect(result.suggested_action).toBe("ask_followup");
  });

  it('T2: conversation_stage="context_clarification" parsed correctly', () => {
    const result = normalizeTellMitraResult({ ...VALID_FULL_RESPONSE, conversation_stage: "context_clarification" });
    expect(result.conversation_stage).toBe("context_clarification");
  });

  it('T3: specific_context, predictive_eligible, immediate_support_requested all parse correctly', () => {
    const result = normalizeTellMitraResult({
      ...VALID_FULL_RESPONSE,
      specific_context: "pressure",
      predictive_eligible: true,
      immediate_support_requested: false,
    });
    expect(result.specific_context).toBe("pressure");
    expect(result.predictive_eligible).toBe(true);
    expect(result.immediate_support_requested).toBe(false);
  });

  it('T4: null input → conversation_stage="none", specific_context=null, predictive_eligible=false, immediate_support_requested=false, pattern_key=null', () => {
    const result = normalizeTellMitraResult(null);
    expect(result.conversation_stage).toBe("none");
    expect(result.specific_context).toBeNull();
    expect(result.predictive_eligible).toBe(false);
    expect(result.immediate_support_requested).toBe(false);
    expect(result.pattern_key).toBeNull();
  });

  it('T5: unknown suggested_action still coerces to "none" (existing guard preserved)', () => {
    const result = normalizeTellMitraResult({ suggested_action: "unknown_value" });
    expect(result.suggested_action).toBe("none");
  });
});
