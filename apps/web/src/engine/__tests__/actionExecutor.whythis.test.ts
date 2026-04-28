/**
 * Phase 10A — WhyThis action executor unit tests.
 * Covers: open_why_this_l2, open_why_this_l3, dismiss_why_this.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeAction } from '../actionExecutor';
import type { ActionContext } from '../actionExecutor';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('../mitraApi', () => ({
  getPrinciple: vi.fn(),
  getPrincipleSource: vi.fn(),
  trackEvent: vi.fn().mockResolvedValue(undefined),
  trackCompletion: vi.fn().mockResolvedValue(undefined),
  getDashboardView: vi.fn().mockResolvedValue(null),
  getDailyView: vi.fn().mockResolvedValue(null),
  mitraJourneyDay7View: vi.fn().mockResolvedValue(null),
  mitraJourneyDay14View: vi.fn().mockResolvedValue(null),
  mitraJourneyDay7Decision: vi.fn().mockResolvedValue({ next_view: null }),
  mitraJourneyDay14Decision: vi.fn().mockResolvedValue({ next_view: null }),
  onboardingComplete: vi.fn().mockResolvedValue(null),
  startJourneyV3: vi.fn().mockResolvedValue(null),
  getRoomRender: vi.fn().mockResolvedValue(null),
  postRoomTelemetry: vi.fn().mockResolvedValue(undefined),
  postRoomSacred: vi.fn().mockResolvedValue(null),
  postTriggerMantras: vi.fn().mockResolvedValue(null),
  postPranaAcknowledge: vi.fn().mockResolvedValue(null),
}));

vi.mock('../../lib/webRouter', () => ({ webNavigate: vi.fn() }));
vi.mock('../../hooks/useJourneyStatus', () => ({ invalidateJourneyStatusCache: vi.fn() }));

import * as mitraApi from '../mitraApi';
import { webNavigate } from '../../lib/webRouter';

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeDispatch() {
  const calls: any[] = [];
  return Object.assign((action: any) => { calls.push(action); return action; }, { _calls: calls });
}

function makeContext(screenData: Record<string, any> = {}, stateId?: string): ActionContext {
  return {
    dispatch: makeDispatch() as any,
    screenData: { journey_id: 42, day_number: 3, ...screenData },
    currentStateId: stateId,
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('open_why_this_l2', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches principle and sets why_this_overlay_level to l2', async () => {
    const fakePrinciple = { title: 'Non-attachment', description: 'Release what you cling to.' };
    (mitraApi.getPrinciple as any).mockResolvedValue(fakePrinciple);

    const ctx = makeContext({ why_this: { principle_id: 'principle_123' } });
    await executeAction({ type: 'open_why_this_l2' }, ctx);

    const dispatchCalls = (ctx.dispatch as any)._calls;
    const updateCall = dispatchCalls.find((c: any) => c.type === 'screen/updateScreenData');
    expect(updateCall).toBeTruthy();
    expect(updateCall.payload).toMatchObject({
      why_this_principle: fakePrinciple,
      why_this_overlay_level: 'l2',
    });
  });

  it('reads principle_id from action payload first', async () => {
    (mitraApi.getPrinciple as any).mockResolvedValue({ title: 'Test' });
    const ctx = makeContext({});
    await executeAction({ type: 'open_why_this_l2', principle_id: 'direct_id' }, ctx);
    expect(mitraApi.getPrinciple).toHaveBeenCalledWith('direct_id');
  });

  it('does not dispatch update when principle returns null', async () => {
    (mitraApi.getPrinciple as any).mockResolvedValue(null);
    const ctx = makeContext({ why_this: { principle_id: 'x' } });
    await executeAction({ type: 'open_why_this_l2' }, ctx);
    const dispatchCalls = (ctx.dispatch as any)._calls;
    const updateCall = dispatchCalls.find((c: any) => c.type === 'screen/updateScreenData');
    expect(updateCall).toBeUndefined();
  });

  it('does nothing when no principle_id is available', async () => {
    const ctx = makeContext({ why_this: {} });
    await executeAction({ type: 'open_why_this_l2' }, ctx);
    expect(mitraApi.getPrinciple).not.toHaveBeenCalled();
  });
});

describe('open_why_this_l3', () => {
  beforeEach(() => vi.clearAllMocks());

  it('fetches principle source and sets why_this_overlay_level to l3', async () => {
    const fakeSource = { text: 'Yogas chitta vritti nirodhah', attribution: 'Patanjali', tradition: 'Yoga Sutra 1.2' };
    (mitraApi.getPrincipleSource as any).mockResolvedValue(fakeSource);

    const ctx = makeContext({ why_this: { principle_id: 'p_456' } });
    await executeAction({ type: 'open_why_this_l3' }, ctx);

    const dispatchCalls = (ctx.dispatch as any)._calls;
    const updateCall = dispatchCalls.find((c: any) => c.type === 'screen/updateScreenData');
    expect(updateCall).toBeTruthy();
    expect(updateCall.payload).toMatchObject({
      why_this_source: fakeSource,
      why_this_overlay_level: 'l3',
    });
  });

  it('does not dispatch update when source returns null', async () => {
    (mitraApi.getPrincipleSource as any).mockResolvedValue(null);
    const ctx = makeContext({ why_this: { principle_id: 'p_456' } });
    await executeAction({ type: 'open_why_this_l3' }, ctx);
    const dispatchCalls = (ctx.dispatch as any)._calls;
    const updateCall = dispatchCalls.find((c: any) => c.type === 'screen/updateScreenData');
    expect(updateCall).toBeUndefined();
  });
});

describe('dismiss_why_this', () => {
  beforeEach(() => vi.clearAllMocks());

  it('clears overlay level, principle, and source', async () => {
    const ctx = makeContext({
      why_this_overlay_level: 'l2',
      why_this_principle: { title: 'Test' },
      why_this_source: { text: 'Quote' },
    });
    await executeAction({ type: 'dismiss_why_this' }, ctx);

    const dispatchCalls = (ctx.dispatch as any)._calls;
    const updateCall = dispatchCalls.find((c: any) => c.type === 'screen/updateScreenData');
    expect(updateCall).toBeTruthy();
    expect(updateCall.payload).toMatchObject({
      why_this_overlay_level: null,
      why_this_principle: null,
      why_this_source: null,
    });
  });

  it('does not navigate', async () => {
    const ctx = makeContext({});
    await executeAction({ type: 'dismiss_why_this' }, ctx);
    expect(webNavigate).not.toHaveBeenCalled();
  });
});
