/**
 * actionExecutor — Phase 8 runner action tests.
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
}));

vi.mock('../../lib/webRouter', () => ({ webNavigate: vi.fn() }));
vi.mock('../../hooks/useJourneyStatus', () => ({ invalidateJourneyStatusCache: vi.fn() }));

import { webNavigate } from '../../lib/webRouter';
import { trackCompletion } from '../mitraApi';

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

describe('start_runner', () => {
  it('routes mantra variant to free_mantra_chanting', async () => {
    const ctx = makeContext({ journey_id: 1, day_number: 3 });
    await executeAction(
      {
        type: 'start_runner',
        payload: {
          source: 'core',
          variant: 'mantra',
          item: { item_id: 'mantra.om_namah_shivaya', title: 'Om Namah Shivaya', subtitle: 'Sacred sound' },
        },
      },
      ctx,
    );
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('free_mantra_chanting'));
  });

  it('routes sankalp variant to sankalp_embody', async () => {
    const ctx = makeContext({ journey_id: 1, day_number: 3 });
    await executeAction(
      {
        type: 'start_runner',
        payload: {
          source: 'core',
          variant: 'sankalp',
          item: { item_id: 'sankalp.peace', title: 'I am at peace' },
        },
      },
      ctx,
    );
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('sankalp_embody'));
  });

  it('routes practice variant to practice_step_runner', async () => {
    const ctx = makeContext({ journey_id: 1, day_number: 3 });
    await executeAction(
      {
        type: 'start_runner',
        payload: {
          source: 'core',
          variant: 'practice',
          item: { item_id: 'practice.breathwork', title: 'Breath work' },
        },
      },
      ctx,
    );
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('practice_step_runner'));
  });

  it('does not navigate when item_id is missing', async () => {
    const ctx = makeContext({});
    await executeAction(
      { type: 'start_runner', payload: { source: 'core', variant: 'mantra', item: {} } },
      ctx,
    );
    expect(webNavigate).not.toHaveBeenCalled();
  });

  it('stamps runner_variant and runner_source into screenData via dispatch', async () => {
    const dispatch = makeDispatch();
    const ctx: ActionContext = { dispatch: dispatch as any, screenData: { journey_id: 1 } };
    await executeAction(
      {
        type: 'start_runner',
        payload: {
          source: 'core',
          variant: 'mantra',
          item: { item_id: 'mantra.om', title: 'Om' },
        },
      },
      ctx,
    );
    // dispatch should have been called with updateScreenData containing runner keys
    expect(dispatch).toHaveBeenCalled();
  });

  // G13: sankalp_audio_url seeding
  it('seeds sankalp_audio_url from item.audio_url when variant=sankalp', async () => {
    const dispatch = makeDispatch();
    const ctx: ActionContext = { dispatch: dispatch as any, screenData: { journey_id: 1 } };
    await executeAction(
      {
        type: 'start_runner',
        payload: {
          source: 'core',
          variant: 'sankalp',
          item: { item_id: 'sankalp.peace', title: 'I am at peace', audio_url: 'https://cdn.kalpx.com/sankalp.mp3' },
        },
      },
      ctx,
    );
    const updateCall = (dispatch as any).mock.calls.find((args: any[]) =>
      args[0]?.payload?.sankalp_audio_url !== undefined
    );
    expect(updateCall?.[0]?.payload?.sankalp_audio_url).toBe('https://cdn.kalpx.com/sankalp.mp3');
  });

  it('does not seed sankalp_audio_url from item when variant=mantra', async () => {
    const dispatch = makeDispatch();
    const ctx: ActionContext = { dispatch: dispatch as any, screenData: { journey_id: 1, sankalp_audio_url: 'existing.mp3' } };
    await executeAction(
      {
        type: 'start_runner',
        payload: {
          source: 'core',
          variant: 'mantra',
          item: { item_id: 'mantra.om', title: 'Om', audio_url: 'https://cdn.kalpx.com/mantra.mp3' },
        },
      },
      ctx,
    );
    // For mantra variant, sankalp_audio_url should preserve existing screenData value
    const updateCall = (dispatch as any).mock.calls.find((args: any[]) =>
      args[0]?.payload?.sankalp_audio_url !== undefined
    );
    expect(updateCall?.[0]?.payload?.sankalp_audio_url).toBe('existing.mp3');
  });
});

describe('complete_runner', () => {
  it('calls trackCompletion with correct payload and navigates to completion_return', async () => {
    const ctx = makeContext({
      runner_active_item: { item_id: 'mantra.om', title: 'Om' },
      runner_variant: 'mantra',
      runner_source: 'core',
      runner_reps_completed: 5,
      runner_start_time: Date.now() - 30_000,
      journey_id: 1,
      day_number: 3,
    });
    await executeAction({ type: 'complete_runner' }, ctx);
    expect(trackCompletion).toHaveBeenCalledWith(
      expect.objectContaining({
        item_type: 'mantra',
        item_id: 'mantra.om',
        source: 'core',
        journey_id: 1,
        day_number: 3,
      }),
    );
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('completion_return'));
  });

  it('skips trackCompletion when item_id is absent', async () => {
    const ctx = makeContext({
      runner_active_item: {},
      runner_variant: 'mantra',
      runner_source: 'core',
    });
    await executeAction({ type: 'complete_runner' }, ctx);
    expect(trackCompletion).not.toHaveBeenCalled();
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('completion_return'));
  });
});

describe('repeat_runner', () => {
  it('navigates to free_mantra_chanting for mantra variant', async () => {
    const ctx = makeContext({ runner_variant: 'mantra' });
    await executeAction({ type: 'repeat_runner' }, ctx);
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('free_mantra_chanting'));
  });

  it('navigates to sankalp_embody for sankalp variant', async () => {
    const ctx = makeContext({ runner_variant: 'sankalp' });
    await executeAction({ type: 'repeat_runner' }, ctx);
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('sankalp_embody'));
  });
});

describe('runner_exit', () => {
  it('navigates to dashboard and clears runner state for core source', async () => {
    const ctx = makeContext({ runner_variant: 'mantra', runner_source: 'core', runner_active_item: { item_id: 'x' } });
    await executeAction({ type: 'runner_exit' }, ctx);
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/dashboard');
  });

  // G17: room-aware exit
  it('navigates back to room when runner_source=support_room and room_id is set', async () => {
    const ctx = makeContext({ runner_source: 'support_room', room_id: 'room_clarity', runner_active_item: { item_id: 'x' } });
    await executeAction({ type: 'runner_exit' }, ctx);
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/room/clarity');
  });

  it('navigates to dashboard when runner_source=support_room but room_id is absent', async () => {
    const ctx = makeContext({ runner_source: 'support_room', runner_active_item: { item_id: 'x' } });
    await executeAction({ type: 'runner_exit' }, ctx);
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/dashboard');
  });

  it('runner_back also navigates to room when support_room + room_id set', async () => {
    const ctx = makeContext({ runner_source: 'support_room', room_id: 'room_growth', runner_active_item: { item_id: 'x' } });
    await executeAction({ type: 'runner_back' }, ctx);
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/room/growth');
  });

  it('non-room/non-trigger source returns to dashboard (additional/checkin)', async () => {
    for (const src of ['additional_mantra', 'support_checkin']) {
      vi.clearAllMocks();
      const ctx = makeContext({ runner_source: src, room_id: null, runner_active_item: { item_id: 'x' } });
      await executeAction({ type: 'runner_exit' }, ctx);
      expect(webNavigate).toHaveBeenCalledWith('/en/mitra/dashboard');
    }
  });

  // G27: trigger-sourced exit
  it('navigates to /en/mitra/trigger when runner_source=support_trigger', async () => {
    const ctx = makeContext({ runner_source: 'support_trigger', runner_active_item: { item_id: 'x' } });
    await executeAction({ type: 'runner_exit' }, ctx);
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/trigger');
  });

  it('runner_back also navigates to trigger when support_trigger', async () => {
    const ctx = makeContext({ runner_source: 'support_trigger', runner_active_item: { item_id: 'x' } });
    await executeAction({ type: 'runner_back' }, ctx);
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/trigger');
  });
});

describe('return_to_source', () => {
  // G17: room-sourced completion return
  it('navigates to room when runner_source=support_room and room_id is set', async () => {
    const ctx = makeContext({ room_id: 'room_clarity', runner_source: 'support_room' });
    await executeAction({ type: 'return_to_source' }, ctx);
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/room/clarity');
  });

  it('falls back to dashboard when runner_source=support_room but room_id is absent', async () => {
    const ctx = makeContext({ runner_source: 'support_room' });
    await executeAction({ type: 'return_to_source' }, ctx);
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/dashboard');
  });

  it('clears all runner keys', async () => {
    const dispatch = makeDispatch();
    const ctx: ActionContext = {
      dispatch: dispatch as any,
      screenData: { room_id: 'room_clarity', runner_source: 'support_room', runner_active_item: { item_id: 'x' }, runner_variant: 'mantra' },
    };
    await executeAction({ type: 'return_to_source' }, ctx);
    expect(dispatch).toHaveBeenCalled();
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/room/clarity');
  });

  // G27: trigger-sourced completion return
  it('navigates to /en/mitra/trigger when runner_source=support_trigger', async () => {
    const ctx = makeContext({ runner_source: 'support_trigger' });
    await executeAction({ type: 'return_to_source' }, ctx);
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/trigger');
  });

  it('support_trigger does not require room_id to navigate correctly', async () => {
    const ctx = makeContext({ runner_source: 'support_trigger', room_id: null });
    await executeAction({ type: 'return_to_source' }, ctx);
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/trigger');
  });

  it('falls back to dashboard for unknown source', async () => {
    const ctx = makeContext({ runner_source: 'additional_mantra' });
    await executeAction({ type: 'return_to_source' }, ctx);
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/dashboard');
  });
});

describe('return_to_dashboard', () => {
  it('navigates to dashboard', async () => {
    const ctx = makeContext({ runner_variant: 'practice' });
    await executeAction({ type: 'return_to_dashboard' }, ctx);
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/dashboard');
  });
});

describe('next_practice_step', () => {
  it('increments runner_step_index', async () => {
    const dispatch = makeDispatch();
    const ctx: ActionContext = {
      dispatch: dispatch as any,
      screenData: { runner_step_index: 0, practice_steps: ['step1', 'step2', 'step3'] },
    };
    await executeAction({ type: 'next_practice_step' }, ctx);
    expect(dispatch).toHaveBeenCalled();
  });
});

// T1–T9: info_start_click (X-PRE fix)
describe('info_start_click', () => {
  it('T1: routes to free_mantra_chanting for item_type=mantra', async () => {
    const ctx = makeContext({
      info: { item_id: 'mantra.om', item_type: 'mantra', title: 'Om' },
      journey_id: 1,
      day_number: 1,
    });
    await executeAction({ type: 'info_start_click' }, ctx);
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('free_mantra_chanting'));
  });

  it('T2: routes to sankalp_embody for item_type=sankalp', async () => {
    const ctx = makeContext({
      info: { item_id: 'sankalp.peace', item_type: 'sankalp', title: 'I am at peace' },
      journey_id: 1,
    });
    await executeAction({ type: 'info_start_click' }, ctx);
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('sankalp_embody'));
  });

  it('T3: routes to practice_step_runner for item_type=practice', async () => {
    const ctx = makeContext({
      info: { item_id: 'practice.breath', item_type: 'practice', title: 'Breath work' },
      journey_id: 1,
    });
    await executeAction({ type: 'info_start_click' }, ctx);
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('practice_step_runner'));
  });

  it('T4: does NOT call trackCompletion (practice has not happened)', async () => {
    const ctx = makeContext({
      info: { item_id: 'mantra.om', item_type: 'mantra', title: 'Om' },
      journey_id: 1,
    });
    await executeAction({ type: 'info_start_click' }, ctx);
    expect(trackCompletion).not.toHaveBeenCalled();
  });

  it('T5: seeds runner_variant, runner_source, runner_active_item in screenData', async () => {
    const dispatch = makeDispatch();
    const ctx: ActionContext = {
      dispatch: dispatch as any,
      screenData: { info: { item_id: 'mantra.om', item_type: 'mantra', title: 'Om' }, journey_id: 1 },
    };
    await executeAction({ type: 'info_start_click' }, ctx);
    const updateCalls = (dispatch as any).mock.calls.filter((args: any[]) =>
      args[0]?.payload?.runner_variant !== undefined
    );
    expect(updateCalls.length).toBeGreaterThan(0);
    const payload = updateCalls[0][0].payload;
    expect(payload.runner_variant).toBe('mantra');
    expect(payload.runner_source).toBe('core');
    expect(payload.runner_active_item).toBeTruthy();
  });

  it('T6: merges master_mantra audio_url and devanagari when master is present', async () => {
    const dispatch = makeDispatch();
    const ctx: ActionContext = {
      dispatch: dispatch as any,
      screenData: {
        info: { item_id: 'mantra.om', item_type: 'mantra', title: 'Om' },
        master_mantra: { item_id: 'mantra.om', title: 'Om Namah Shivaya', audio_url: 'https://cdn.kalpx.com/om.mp3', devanagari: 'ॐ नमः शिवाय' },
        journey_id: 1,
      },
    };
    await executeAction({ type: 'info_start_click' }, ctx);
    const updateCalls = (dispatch as any).mock.calls.filter((args: any[]) =>
      args[0]?.payload?.mantra_audio_url !== undefined
    );
    expect(updateCalls.length).toBeGreaterThan(0);
    const payload = updateCalls[0][0].payload;
    expect(payload.mantra_audio_url).toBe('https://cdn.kalpx.com/om.mp3');
    expect(payload.mantra_devanagari).toBe('ॐ नमः शिवाय');
  });

  it('T7: preserves existing runner_source (e.g. support_room) from screenData', async () => {
    const dispatch = makeDispatch();
    const ctx: ActionContext = {
      dispatch: dispatch as any,
      screenData: {
        info: { item_id: 'mantra.om', item_type: 'mantra', title: 'Om' },
        runner_source: 'support_room',
        journey_id: 1,
      },
    };
    await executeAction({ type: 'info_start_click' }, ctx);
    const updateCalls = (dispatch as any).mock.calls.filter((args: any[]) =>
      args[0]?.payload?.runner_source !== undefined
    );
    expect(updateCalls.length).toBeGreaterThan(0);
    expect(updateCalls[0][0].payload.runner_source).toBe('support_room');
  });

  it('T8: falls back to info.title when master_mantra is absent', async () => {
    const dispatch = makeDispatch();
    const ctx: ActionContext = {
      dispatch: dispatch as any,
      screenData: {
        info: { item_id: 'mantra.custom', item_type: 'mantra', title: 'Custom Mantra' },
        journey_id: 1,
      },
    };
    await executeAction({ type: 'info_start_click' }, ctx);
    const updateCalls = (dispatch as any).mock.calls.filter((args: any[]) =>
      args[0]?.payload?.runner_active_item !== undefined
    );
    expect(updateCalls.length).toBeGreaterThan(0);
    expect(updateCalls[0][0].payload.runner_active_item.title).toBe('Custom Mantra');
  });

  it('T9: no-op when screenData.info is null', async () => {
    const ctx = makeContext({ info: null, journey_id: 1 });
    await executeAction({ type: 'info_start_click' }, ctx);
    expect(webNavigate).not.toHaveBeenCalled();
    expect(trackCompletion).not.toHaveBeenCalled();
  });
});
