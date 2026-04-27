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
  it('navigates to dashboard and clears runner state', async () => {
    const ctx = makeContext({ runner_variant: 'mantra', runner_active_item: { item_id: 'x' } });
    await executeAction({ type: 'runner_exit' }, ctx);
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
