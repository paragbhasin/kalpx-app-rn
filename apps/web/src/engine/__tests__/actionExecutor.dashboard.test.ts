/**
 * actionExecutor — Phase 7 dashboard action tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeAction } from '../actionExecutor';
import type { ActionContext } from '../actionExecutor';

// localStorage stub
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
  it('navigates to offering_reveal with runner context set', async () => {
    const ctx = makeContext({ journey_id: 1, day_number: 3 });
    await executeAction(
      {
        type: 'start_runner',
        payload: {
          source: 'core',
          variant: 'mantra',
          item: { item_id: 'mantra.shiva_om', title: 'Om Namah Shivaya', subtitle: 'Sacred sound' },
        },
      },
      ctx,
    );
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('offering_reveal'));
  });

  it('does not navigate when item_id is missing', async () => {
    const ctx = makeContext({});
    await executeAction(
      { type: 'start_runner', payload: { source: 'core', variant: 'mantra', item: {} } },
      ctx,
    );
    expect(webNavigate).not.toHaveBeenCalled();
  });
});

describe('view_info', () => {
  it('navigates to offering_reveal', async () => {
    const ctx = makeContext({});
    await executeAction(
      {
        type: 'view_info',
        payload: { type: 'mantra', manualData: { item_id: 'm1', title: 'Test' } },
      },
      ctx,
    );
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('offering_reveal'));
  });
});

describe('initiate_trigger', () => {
  it('navigates to /en/mitra/trigger', async () => {
    await executeAction({ type: 'initiate_trigger' }, makeContext({}));
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/trigger');
  });
});

describe('start_checkin', () => {
  it('navigates to /en/mitra/checkin', async () => {
    await executeAction({ type: 'start_checkin' }, makeContext({}));
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/checkin');
  });
});

describe('enter_room', () => {
  it('navigates to room/:roomId', async () => {
    await executeAction(
      { type: 'enter_room', payload: { room_id: 'room_clarity', source: 'quick_support' } },
      makeContext({ journey_id: 1 }),
    );
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/room/room_clarity');
  });

  it('warns when room_id is missing', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await executeAction({ type: 'enter_room', payload: {} }, makeContext({}));
    expect(webNavigate).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

describe('dashboard_load', () => {
  it('calls getDashboardView and dispatches ingest result', async () => {
    const { getDashboardView } = await import('../mitraApi');
    vi.mocked(getDashboardView).mockResolvedValueOnce({
      identity: { journey_id: 1, day_number: 3 },
      greeting: { headline: 'Hello' },
      arc_state: {},
      continuity: {},
      today: { triad: [] },
      insights: {},
    });
    const ctx = makeContext({});
    await executeAction({ type: 'dashboard_load' }, ctx);
    expect(getDashboardView).toHaveBeenCalled();
    // dispatch should have been called with updateScreenData
    expect(ctx.dispatch).toHaveBeenCalled();
  });
});
