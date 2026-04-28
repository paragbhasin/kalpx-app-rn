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
import { postRoomTelemetry, postRoomSacred } from '../mitraApi';

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
