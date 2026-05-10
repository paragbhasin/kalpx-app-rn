/**
 * actionExecutor — Phase 9 support action tests.
 * Trigger / Check-In / Rooms.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeAction } from '../actionExecutor';
import type { ActionContext } from '../actionExecutor';

const _storage: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: (k: string) => _storage[k] ?? null,
  setItem: (k: string, v: string) => { _storage[k] = v; },
  removeItem: (k: string) => { delete _storage[k]; },
  clear: () => { Object.keys(_storage).forEach((k) => delete _storage[k]); },
});

vi.mock('../mitraApi', () => ({
  trackEvent: vi.fn().mockResolvedValue(undefined),
  trackCompletion: vi.fn().mockResolvedValue(undefined),
  onboardingComplete: vi.fn().mockResolvedValue(null),
  startJourneyV3: vi.fn().mockResolvedValue(null),
  getDailyView: vi.fn().mockResolvedValue(null),
  getDashboardView: vi.fn().mockResolvedValue(null),
  getRoomRender: vi.fn().mockResolvedValue(null),
  postRoomTelemetry: vi.fn().mockResolvedValue(undefined),
  postRoomSacred: vi.fn().mockResolvedValue(undefined),
  postTriggerMantras: vi.fn().mockResolvedValue(null),
  postPranaAcknowledge: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../lib/webRouter', () => ({ webNavigate: vi.fn() }));
vi.mock('../../hooks/useJourneyStatus', () => ({ invalidateJourneyStatusCache: vi.fn() }));

import { webNavigate } from '../../lib/webRouter';
import { postPranaAcknowledge, postRoomTelemetry, postRoomSacred, postTriggerMantras } from '../mitraApi';

function makeDispatch() {
  return vi.fn((action: any) => Promise.resolve(action));
}

function makeContext(screenData: Record<string, any> = {}): ActionContext {
  return { dispatch: makeDispatch() as any, screenData };
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

// ── TRIGGER ──────────────────────────────────────────────────────────────────

describe('initiate_trigger_support', () => {
  it('clears trigger fields and navigates to sound_bridge', async () => {
    const ctx = makeContext({
      trigger_mantra_text: 'Old mantra',
      trigger_round: 2,
      journey_id: 5,
      day_number: 7,
    });
    await executeAction({ type: 'initiate_trigger_support' }, ctx);
    expect(ctx.dispatch).toHaveBeenCalled();
    const calls = (ctx.dispatch as any).mock.calls.map((c: any[]) => c[0]);
    const update = calls.find((a: any) => a?.payload?.om_audio_url !== undefined);
    expect(update?.payload?.om_audio_url).toContain('/om/');
    expect(update?.payload?.trigger_mantra_text).toBeTruthy();
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('sound_bridge'));
  });

  it('increments trigger_round', async () => {
    const dispatch = makeDispatch();
    const ctx: ActionContext = {
      dispatch: dispatch as any,
      screenData: { trigger_round: 3, journey_id: 1, day_number: 3 },
    };
    await executeAction({ type: 'initiate_trigger_support' }, ctx);
    const calls = dispatch.mock.calls.map((c: any[]) => c[0]);
    const updateCall = calls.find((a: any) => a?.payload?.trigger_round !== undefined);
    expect(updateCall?.payload?.trigger_round).toBe(4);
  });
});

describe('advance_sound_bridge', () => {
  it('seeds runner state with support_trigger source and navigates to free_mantra_chanting', async () => {
    const dispatch = makeDispatch();
    const ctx: ActionContext = {
      dispatch: dispatch as any,
      screenData: {
        trigger_mantra_text: 'Om Namah Shivaya',
        trigger_mantra_devanagari: 'ॐ नमः शिवाय',
        om_audio_url: 'https://cdn.example.com/om.mp3',
        journey_id: 1,
        day_number: 3,
      },
    };
    await executeAction({ type: 'advance_sound_bridge', payload: { exit_type: 'tap' } }, ctx);
    const calls = dispatch.mock.calls.map((c: any[]) => c[0]);
    const update = calls.find((a: any) => a?.payload?.runner_source !== undefined);
    expect(update?.payload?.runner_source).toBe('support_trigger');
    expect(update?.payload?.reps_total).toBe(-1);
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('free_mantra_chanting'));
  });

  it('seeds runner_active_item from screenData trigger fields', async () => {
    const dispatch = makeDispatch();
    const ctx: ActionContext = {
      dispatch: dispatch as any,
      screenData: {
        trigger_mantra_text: 'Mahamrityunjaya',
        trigger_mantra_devanagari: 'महामृत्युञ्जय',
        journey_id: 1,
        day_number: 1,
      },
    };
    await executeAction({ type: 'advance_sound_bridge' }, ctx);
    const calls = dispatch.mock.calls.map((c: any[]) => c[0]);
    const update = calls.find((a: any) => a?.payload?.runner_active_item !== undefined);
    expect(update?.payload?.runner_active_item?.title).toBe('Mahamrityunjaya');
  });
});

describe('trigger_still_feeling', () => {
  it('step 2 routes to post_trigger_mantra using prefetched mantra data', async () => {
    const dispatch = makeDispatch();
    const ctx: ActionContext = {
      dispatch: dispatch as any,
      screenData: {
        trigger_step: 2,
        trigger_feeling: 'triggered',
        _trigger_mantra_data: {
          title: 'Om Namah Shivaya',
          iast: 'Om Namah Shivaya',
          devanagari: 'ॐ नमः शिवाय',
          audio_url: 'https://cdn.example.com/mantra.mp3',
        },
        journey_id: 1,
        day_number: 4,
      },
    };
    await executeAction({ type: 'trigger_still_feeling' }, ctx);
    const calls = dispatch.mock.calls.map((c: any[]) => c[0]);
    const update = calls.find((a: any) => a?.payload?.trigger_step === 3);
    expect(update?.payload?.runner_source).toBe('support_trigger');
    expect(update?.payload?.runner_active_item?.item_type).toBe('mantra');
    expect(update?.payload?.runner_reps_completed).toBe(0);
    expect(update?.payload?.mantra_text).toBe('Om Namah Shivaya');
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('post_trigger_mantra'));
  });

  it('step 1 fetches suggestions and routes to trigger_practice_runner when practice exists', async () => {
    vi.mocked(postTriggerMantras).mockResolvedValueOnce({
      suggestions: [
        {
          type: 'practice',
          item_id: 'practice_1',
          context: 'Gentle grounding',
          core: {
            title: 'Ground your breath',
            steps: ['Sit down', 'Lengthen exhale'],
            benefits: ['Soothes the nervous system'],
          },
        },
        {
          type: 'mantra',
          item_id: 'mantra_1',
          context: 'Steady the mind',
          core: {
            title: 'Om Shanti',
            devanagari: 'ॐ शान्तिः',
          },
        },
      ],
    });

    const dispatch = makeDispatch();
    const ctx: ActionContext = {
      dispatch: dispatch as any,
      screenData: {
        trigger_step: 1,
        trigger_feeling: 'anxious',
        journey_id: 1,
        day_number: 4,
      },
    };
    await executeAction({ type: 'trigger_still_feeling' }, ctx);
    const calls = dispatch.mock.calls.map((c: any[]) => c[0]);
    const update = calls.find((a: any) => a?.payload?.runner_active_item?.item_type === 'practice');
    expect(postTriggerMantras).toHaveBeenCalledWith(expect.objectContaining({ feeling: 'anxious', round: 1 }));
    expect(update?.payload?.runner_source).toBe('support_trigger');
    expect(update?.payload?.trigger_step).toBe(2);
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('trigger_practice_runner'));
  });
});

// ── CHECK-IN ──────────────────────────────────────────────────────────────────

describe('advance_checkin_step', () => {
  it('navigates from notice to name', async () => {
    const ctx = makeContext({ journey_id: 1 });
    await executeAction(
      { type: 'advance_checkin_step', payload: { from: 'notice', value: 'I feel tense' } },
      ctx,
    );
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('name'));
  });

  it('navigates from name to settle', async () => {
    const ctx = makeContext({ journey_id: 1, checkin_draft: { noticed: 'tense' } });
    await executeAction(
      { type: 'advance_checkin_step', payload: { from: 'name', value: 'Anxiety' } },
      ctx,
    );
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('settle'));
  });

  it('stores the step value in checkin_draft', async () => {
    const dispatch = makeDispatch();
    const ctx: ActionContext = {
      dispatch: dispatch as any,
      screenData: { journey_id: 1, checkin_draft: {} },
    };
    await executeAction(
      { type: 'advance_checkin_step', payload: { from: 'notice', value: 'Heaviness' } },
      ctx,
    );
    const calls = dispatch.mock.calls.map((c: any[]) => c[0]);
    const update = calls.find((a: any) => a?.payload?.checkin_draft !== undefined);
    expect(update?.payload?.checkin_draft?.noticed).toBe('Heaviness');
  });

  it('does not navigate when from step has no next step', async () => {
    const ctx = makeContext({ journey_id: 1, checkin_draft: { noticed: 'x', named: 'y' } });
    await executeAction(
      { type: 'advance_checkin_step', payload: { from: 'settle', value: 'calm' } },
      ctx,
    );
    expect(webNavigate).not.toHaveBeenCalled();
  });
});

describe('submit_checkin', () => {
  it('navigates to balanced_ack and dispatches ack_variant', async () => {
    const dispatch = makeDispatch();
    const ctx: ActionContext = {
      dispatch: dispatch as any,
      screenData: { journey_id: 1, day_number: 3, checkin_draft: { noticed: 'x', named: 'y' } },
    };
    await executeAction(
      { type: 'submit_checkin', payload: { final: 'I am settled' } },
      ctx,
    );
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('balanced_ack'));
    const calls = dispatch.mock.calls.map((c: any[]) => c[0]);
    const update = calls.find((a: any) => a?.payload?.checkin_ack_variant !== undefined);
    expect(update?.payload?.checkin_ack_variant).toBe('balanced');
  });
});

describe('submit quick_checkin prana_type', () => {
  it('balanced routes to quick_checkin_ack and stores ack copy', async () => {
    vi.mocked(postPranaAcknowledge).mockResolvedValueOnce({
      insight: 'Stay with this steadiness.',
      suggestions: [],
    });
    const dispatch = makeDispatch();
    const ctx: ActionContext = {
      dispatch: dispatch as any,
      screenData: { journey_id: 1, day_number: 2 },
    };
    await executeAction({ type: 'submit', payload: { prana_type: 'balanced' } }, ctx);
    const calls = dispatch.mock.calls.map((c: any[]) => c[0]);
    const update = calls.find((a: any) => a?.payload?.current_prana_type === 'balanced');
    expect(update?.payload?.checkin_ack_headline).toBe('You are exactly where you need to be.');
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('stateId=quick_checkin_ack'));
  });

  it('agitated routes to checkin_breath_reset runner', async () => {
    vi.mocked(postPranaAcknowledge).mockResolvedValueOnce({
      insight: 'Take one calming breath.',
      suggestions: [{ type: 'mantra', item_id: 'm1' }],
    });
    const dispatch = makeDispatch();
    const ctx: ActionContext = {
      dispatch: dispatch as any,
      screenData: { journey_id: 1, day_number: 2 },
    };
    await executeAction({ type: 'submit', payload: { prana_type: 'agitated' } }, ctx);
    const calls = dispatch.mock.calls.map((c: any[]) => c[0]);
    const update = calls.find((a: any) => a?.payload?.runner_source === 'support_checkin');
    expect(update?.payload?.trigger_feeling).toBe('agitated');
    expect(update?.payload?.trigger_step).toBe(1);
    expect(update?.payload?.mantra_audio_url).toContain('/om/');
    expect(update?.payload?.checkin_mantra_text).toBeTruthy();
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('stateId=checkin_breath_reset'));
  });
});

describe('checkin_complete', () => {
  it('clears checkin state and navigates to dashboard', async () => {
    const dispatch = makeDispatch();
    const ctx: ActionContext = {
      dispatch: dispatch as any,
      screenData: { checkin_step: 'settle', checkin_draft: { noticed: 'x' } },
    };
    await executeAction({ type: 'checkin_complete' }, ctx);
    const calls = dispatch.mock.calls.map((c: any[]) => c[0]);
    const update = calls.find((a: any) => a?.payload?.checkin_step !== undefined);
    expect(update?.payload?.checkin_step).toBeNull();
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/dashboard');
  });
});

// ── ROOMS ─────────────────────────────────────────────────────────────────────

describe('room_exit', () => {
  it('clears room fields and navigates to dashboard', async () => {
    const dispatch = makeDispatch();
    const ctx: ActionContext = {
      dispatch: dispatch as any,
      screenData: { room_id: 'room_joy', room_render_payload: {}, journey_id: 1, day_number: 3 },
    };
    await executeAction({ type: 'room_exit', payload: { room_id: 'room_joy' } }, ctx);
    const calls = dispatch.mock.calls.map((c: any[]) => c[0]);
    const update = calls.find((a: any) => a?.payload?.room_id !== undefined);
    expect(update?.payload?.room_id).toBeNull();
    expect(update?.payload?.room_render_payload).toBeNull();
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/dashboard');
  });
});

describe('room_telemetry', () => {
  it('calls postRoomTelemetry and does not block navigation', async () => {
    const ctx = makeContext({ room_id: 'room_clarity', journey_id: 1 });
    await executeAction(
      {
        type: 'room_telemetry',
        payload: { event_type: 'context_picked', room_id: 'room_clarity', life_context: 'work_career' },
      },
      ctx,
    );
    expect(postRoomTelemetry).toHaveBeenCalledWith(
      expect.objectContaining({ event_type: 'context_picked', room_id: 'room_clarity', life_context: 'work_career' }),
    );
    expect(webNavigate).not.toHaveBeenCalled();
  });

  it('fires without throwing when payload is minimal', async () => {
    const ctx = makeContext({});
    await expect(executeAction({ type: 'room_telemetry', payload: {} }, ctx)).resolves.not.toThrow();
  });
});

describe('room_carry_captured', () => {
  it('calls postRoomSacred when carry_text is present', async () => {
    const ctx = makeContext({ room_id: 'room_joy', journey_id: 1, day_number: 3 });
    await executeAction(
      {
        type: 'room_carry_captured',
        payload: { room_id: 'room_joy', carry_text: 'I felt peace', action_id: 'joy_carry_01', analytics_key: 'joy_carry' },
      },
      ctx,
    );
    expect(postRoomSacred).toHaveBeenCalledWith(
      'room_joy',
      expect.objectContaining({ text: 'I felt peace' }),
    );
  });

  it('skips postRoomSacred when carry_text is absent', async () => {
    const ctx = makeContext({ room_id: 'room_joy', journey_id: 1, day_number: 3 });
    await executeAction(
      { type: 'room_carry_captured', payload: { room_id: 'room_joy', action_id: 'x' } },
      ctx,
    );
    expect(postRoomSacred).not.toHaveBeenCalled();
  });
});

describe('support_exit', () => {
  it('clears all support state and navigates to dashboard', async () => {
    const dispatch = makeDispatch();
    const ctx: ActionContext = {
      dispatch: dispatch as any,
      screenData: {
        trigger_mantra_text: 'Om',
        checkin_step: 'settle',
        room_id: 'room_grief',
      },
    };
    await executeAction({ type: 'support_exit' }, ctx);
    const calls = dispatch.mock.calls.map((c: any[]) => c[0]);
    const update = calls.find((a: any) => a?.payload?.trigger_mantra_text !== undefined);
    expect(update?.payload?.trigger_mantra_text).toBeNull();
    expect(update?.payload?.checkin_step).toBeNull();
    expect(update?.payload?.room_id).toBeNull();
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/dashboard');
  });

  it('does not clear runner state (REG-015)', async () => {
    const dispatch = makeDispatch();
    const ctx: ActionContext = {
      dispatch: dispatch as any,
      screenData: { runner_variant: 'mantra', runner_active_item: { item_id: 'om' } },
    };
    await executeAction({ type: 'support_exit' }, ctx);
    const calls = dispatch.mock.calls.map((c: any[]) => c[0]);
    const update = calls.find((a: any) => a?.payload?.trigger_mantra_text !== undefined);
    expect(update?.payload).not.toHaveProperty('runner_variant');
    expect(update?.payload).not.toHaveProperty('runner_active_item');
  });
});

// ── S17-C: enter_room — room_entry_context threading ─────────────────────────

const VALID_ROOM_ENTRY_CTX = {
  source_surface: "tell_mitra_door",
  tell_mitra_event_id: "db08ca38-0000-0000-0000-000000000001",
  situation: { intent_type: "distress_acute", state_tags: [], energy_state: "", life_context: "", prior_context_used: false },
  decision: { routing_type: "navigate_to_room", suggested_room_id: "room_stillness", confidence: 0.95, source: "internal_rule" },
  learning: { eligible_for_learning: true, feedback_pending: true },
};

describe('enter_room — S17-C room_entry_context', () => {
  it('stamps room_entry_context into screenData and suppresses picker for Tell Mitra entry', async () => {
    const ctx = makeContext({});
    await executeAction(
      { type: 'enter_room', payload: { room_id: 'room_stillness', source: 'tell_mitra', room_entry_context: VALID_ROOM_ENTRY_CTX } },
      ctx,
    );
    const calls = (ctx.dispatch as any).mock.calls.map((c: any[]) => c[0]);
    const update = calls.find((a: any) => a?.payload?.room_id === 'room_stillness');
    expect(update?.payload?.room_entry_context).toEqual(VALID_ROOM_ENTRY_CTX);
    expect(update?.payload?.life_context_allowed).toBeNull();
  });

  it('restores life_context_allowed for normal (non-Tell Mitra) room entry', async () => {
    const ctx = makeContext({});
    await executeAction(
      { type: 'enter_room', payload: { room_id: 'room_stillness', source: 'dashboard' } },
      ctx,
    );
    const calls = (ctx.dispatch as any).mock.calls.map((c: any[]) => c[0]);
    const update = calls.find((a: any) => a?.payload?.room_id === 'room_stillness');
    expect(update?.payload?.room_entry_context).toBeNull();
    expect(Array.isArray(update?.payload?.life_context_allowed)).toBe(true);
    expect(update?.payload?.life_context_allowed).toContain('work_career');
  });

  it('stale-context regression: second normal entry clears room_entry_context', async () => {
    const ctx1 = makeContext({});
    // First entry: Tell Mitra with context
    await executeAction(
      { type: 'enter_room', payload: { room_id: 'room_stillness', source: 'tell_mitra', room_entry_context: VALID_ROOM_ENTRY_CTX } },
      ctx1,
    );
    // Second entry: normal dashboard entry (no entry context)
    const ctx2 = makeContext({});
    await executeAction(
      { type: 'enter_room', payload: { room_id: 'room_stillness', source: 'dashboard' } },
      ctx2,
    );
    const calls2 = (ctx2.dispatch as any).mock.calls.map((c: any[]) => c[0]);
    const update2 = calls2.find((a: any) => a?.payload?.room_id === 'room_stillness');
    expect(update2?.payload?.room_entry_context).toBeNull();
    expect(Array.isArray(update2?.payload?.life_context_allowed)).toBe(true);
  });

  it('suppresses picker for tell_mitra_followup_chip source', async () => {
    const ctx = makeContext({});
    const chipCtx = { ...VALID_ROOM_ENTRY_CTX, source_surface: "tell_mitra_followup_chip" };
    await executeAction(
      { type: 'enter_room', payload: { room_id: 'room_release', source: 'tell_mitra', room_entry_context: chipCtx } },
      ctx,
    );
    const calls = (ctx.dispatch as any).mock.calls.map((c: any[]) => c[0]);
    const update = calls.find((a: any) => a?.payload?.room_id === 'room_release');
    expect(update?.payload?.life_context_allowed).toBeNull();
  });

  it('does NOT suppress picker when situation.intent_type is missing', async () => {
    const ctx = makeContext({});
    const noIntentCtx = { ...VALID_ROOM_ENTRY_CTX, situation: { ...VALID_ROOM_ENTRY_CTX.situation, intent_type: "" } };
    await executeAction(
      { type: 'enter_room', payload: { room_id: 'room_release', source: 'tell_mitra', room_entry_context: noIntentCtx } },
      ctx,
    );
    const calls = (ctx.dispatch as any).mock.calls.map((c: any[]) => c[0]);
    const update = calls.find((a: any) => a?.payload?.room_id === 'room_release');
    expect(Array.isArray(update?.payload?.life_context_allowed)).toBe(true);
  });

  it('does NOT suppress picker for non-tell_mitra source', async () => {
    const ctx = makeContext({});
    const foreignCtx = { ...VALID_ROOM_ENTRY_CTX, source_surface: "quick_support_block" };
    await executeAction(
      { type: 'enter_room', payload: { room_id: 'room_release', source: 'dashboard', room_entry_context: foreignCtx } },
      ctx,
    );
    const calls = (ctx.dispatch as any).mock.calls.map((c: any[]) => c[0]);
    const update = calls.find((a: any) => a?.payload?.room_id === 'room_release');
    expect(Array.isArray(update?.payload?.life_context_allowed)).toBe(true);
  });
});
