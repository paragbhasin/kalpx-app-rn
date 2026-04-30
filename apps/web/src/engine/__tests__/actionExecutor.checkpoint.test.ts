/**
 * Phase 10B — Checkpoint decision action executor unit tests.
 * Covers: submit_checkpoint_decision for day 7 and day 14.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeAction } from '../actionExecutor';
import type { ActionContext } from '../actionExecutor';

vi.mock('../mitraApi', () => ({
  mitraJourneyDay7Decision: vi.fn(),
  mitraJourneyDay14Decision: vi.fn(),
  trackEvent: vi.fn().mockResolvedValue(undefined),
  trackCompletion: vi.fn().mockResolvedValue(undefined),
  getDashboardView: vi.fn().mockResolvedValue(null),
  getDailyView: vi.fn().mockResolvedValue(null),
  getPrinciple: vi.fn().mockResolvedValue(null),
  getPrincipleSource: vi.fn().mockResolvedValue(null),
  mitraJourneyDay7View: vi.fn().mockResolvedValue(null),
  mitraJourneyDay14View: vi.fn().mockResolvedValue(null),
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
import { invalidateJourneyStatusCache } from '../../hooks/useJourneyStatus';

function makeDispatch() {
  const calls: any[] = [];
  return Object.assign((action: any) => { calls.push(action); return action; }, { _calls: calls });
}

function makeContext(screenData: Record<string, any> = {}, stateId?: string): ActionContext {
  return {
    dispatch: makeDispatch() as any,
    screenData: { journey_id: 99, day_number: 7, ...screenData },
    currentStateId: stateId,
  };
}

describe('submit_checkpoint_decision — Day 7', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls mitraJourneyDay7Decision with correct payload', async () => {
    (mitraApi.mitraJourneyDay7Decision as any).mockResolvedValue({ next_view: null });
    const ctx = makeContext({}, 'checkpoint_day_7');
    await executeAction({ type: 'submit_checkpoint_decision', payload: { decision: 'continue', day: 7 } }, ctx);
    expect(mitraApi.mitraJourneyDay7Decision).toHaveBeenCalledWith(
      expect.objectContaining({ decision: 'continue', feeling: 'steady', tz: expect.any(String) }),
      expect.stringContaining('checkpoint_7_continue'),
    );
  });

  it('day 7 continue includes feeling steady', async () => {
    (mitraApi.mitraJourneyDay7Decision as any).mockResolvedValue({ next_view: null });
    const ctx = makeContext({}, 'checkpoint_day_7');
    await executeAction({ type: 'submit_checkpoint_decision', payload: { decision: 'continue', day: 7 } }, ctx);
    const call = (mitraApi.mitraJourneyDay7Decision as any).mock.calls[0][0];
    expect(call.feeling).toBe('steady');
    expect(call.tz).toBeTruthy();
  });

  it('day 7 lighten includes feeling heavy', async () => {
    (mitraApi.mitraJourneyDay7Decision as any).mockResolvedValue({ next_view: null });
    const ctx = makeContext({}, 'checkpoint_day_7');
    await executeAction({ type: 'submit_checkpoint_decision', payload: { decision: 'lighten', day: 7 } }, ctx);
    const call = (mitraApi.mitraJourneyDay7Decision as any).mock.calls[0][0];
    expect(call.feeling).toBe('heavy');
    expect(call.tz).toBeTruthy();
  });

  it('day 7 reset includes feeling ready', async () => {
    (mitraApi.mitraJourneyDay7Decision as any).mockResolvedValue({ next_view: { view_key: 'onboarding_start' } });
    const ctx = makeContext({}, 'checkpoint_day_7');
    await executeAction({ type: 'submit_checkpoint_decision', payload: { decision: 'reset', day: 7 } }, ctx);
    const call = (mitraApi.mitraJourneyDay7Decision as any).mock.calls[0][0];
    expect(call.feeling).toBe('ready');
    expect(call.tz).toBeTruthy();
  });

  it('navigates to dashboard after day 7 decision', async () => {
    (mitraApi.mitraJourneyDay7Decision as any).mockResolvedValue({ next_view: null });
    const ctx = makeContext({}, 'checkpoint_day_7');
    await executeAction({ type: 'submit_checkpoint_decision', payload: { decision: 'lighten', day: 7 } }, ctx);
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/dashboard');
  });

  it('routes to onboarding when next_view.view_key is onboarding_start', async () => {
    (mitraApi.mitraJourneyDay7Decision as any).mockResolvedValue({ next_view: { view_key: 'onboarding_start' } });
    const ctx = makeContext({}, 'checkpoint_day_7');
    await executeAction({ type: 'submit_checkpoint_decision', payload: { decision: 'reset', day: 7 } }, ctx);
    // Should navigate to onboarding
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('/en/mitra/onboarding'));
  });

  it('does nothing when decision is missing', async () => {
    const ctx = makeContext({}, 'checkpoint_day_7');
    await executeAction({ type: 'submit_checkpoint_decision', payload: {} }, ctx);
    expect(mitraApi.mitraJourneyDay7Decision).not.toHaveBeenCalled();
    expect(mitraApi.mitraJourneyDay14Decision).not.toHaveBeenCalled();
  });
});

describe('submit_checkpoint_decision — Day 14', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls mitraJourneyDay14Decision for day 14', async () => {
    (mitraApi.mitraJourneyDay14Decision as any).mockResolvedValue({ next_view: null });
    const ctx = makeContext({}, 'checkpoint_day_14');
    await executeAction({ type: 'submit_checkpoint_decision', payload: { decision: 'continue_same', day: 14 } }, ctx);
    expect(mitraApi.mitraJourneyDay14Decision).toHaveBeenCalledWith(
      expect.objectContaining({
        decision: 'continue_same',
        feeling: 'steady',
        reflection: '',
        sealRitual: '',
        tz: expect.any(String),
      }),
      expect.stringContaining('checkpoint_14_continue_same'),
    );
  });

  it('day 14 deepen includes feeling strong', async () => {
    (mitraApi.mitraJourneyDay14Decision as any).mockResolvedValue({ next_view: null });
    const ctx = makeContext({}, 'checkpoint_day_14');
    await executeAction({ type: 'submit_checkpoint_decision', payload: { decision: 'deepen', day: 14 } }, ctx);
    const call = (mitraApi.mitraJourneyDay14Decision as any).mock.calls[0][0];
    expect(call.feeling).toBe('strong');
    expect(call.tz).toBeTruthy();
  });

  it('day 14 change_focus includes feeling ready', async () => {
    (mitraApi.mitraJourneyDay14Decision as any).mockResolvedValue({ next_view: null });
    const ctx = makeContext({}, 'checkpoint_day_14');
    await executeAction({ type: 'submit_checkpoint_decision', payload: { decision: 'change_focus', day: 14 } }, ctx);
    const call = (mitraApi.mitraJourneyDay14Decision as any).mock.calls[0][0];
    expect(call.feeling).toBe('ready');
    expect(call.tz).toBeTruthy();
  });

  it('day 14 deepen with deepenSuggestion includes deepen item fields', async () => {
    (mitraApi.mitraJourneyDay14Decision as any).mockResolvedValue({ next_view: null });
    const ctx = makeContext({
      checkpoint_deepen_suggestion: { item_id: 'mantra_42', item_type: 'mantra' },
    }, 'checkpoint_day_14');
    await executeAction({ type: 'submit_checkpoint_decision', payload: { decision: 'deepen', day: 14 } }, ctx);
    const call = (mitraApi.mitraJourneyDay14Decision as any).mock.calls[0][0];
    expect(call.deepenItemType).toBe('mantra');
    expect(call.deepenItemId).toBe('mantra_42');
    expect(call.deepenAccepted).toBe(true);
    expect(call.reflection).toBe('');
    expect(call.sealRitual).toBe('');
  });

  it('day 14 deepen without deepenSuggestion omits deepen item fields', async () => {
    (mitraApi.mitraJourneyDay14Decision as any).mockResolvedValue({ next_view: null });
    const ctx = makeContext({}, 'checkpoint_day_14');
    await executeAction({ type: 'submit_checkpoint_decision', payload: { decision: 'deepen', day: 14 } }, ctx);
    const call = (mitraApi.mitraJourneyDay14Decision as any).mock.calls[0][0];
    expect(call.deepenItemType).toBeUndefined();
    expect(call.deepenItemId).toBeUndefined();
  });

  it('day 14 continue_same routes to dashboard', async () => {
    (mitraApi.mitraJourneyDay14Decision as any).mockResolvedValue({ next_view: null });
    const ctx = makeContext({}, 'checkpoint_day_14');
    await executeAction({ type: 'submit_checkpoint_decision', payload: { decision: 'continue_same', day: 14 } }, ctx);
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/dashboard');
  });

  it('always routes change_focus to onboarding and invalidates journey cache', async () => {
    (mitraApi.mitraJourneyDay14Decision as any).mockResolvedValue({
      next_view: { view_key: 'onboarding_start', payload: { arc_state: { phase: 'onboarding' } } },
    });
    const ctx = makeContext({}, 'checkpoint_day_14');
    await executeAction({ type: 'submit_checkpoint_decision', payload: { decision: 'change_focus', day: 14 } }, ctx);
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('/en/mitra/onboarding'));
    expect(invalidateJourneyStatusCache).toHaveBeenCalled();
  });

  it('routes deepen to dashboard', async () => {
    (mitraApi.mitraJourneyDay14Decision as any).mockResolvedValue({ next_view: null });
    const ctx = makeContext({}, 'checkpoint_day_14');
    await executeAction({ type: 'submit_checkpoint_decision', payload: { decision: 'deepen', day: 14 } }, ctx);
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/dashboard');
  });

  it('sets checkpoint_submit_error on API failure', async () => {
    (mitraApi.mitraJourneyDay14Decision as any).mockRejectedValue(new Error('network error'));
    const ctx = makeContext({}, 'checkpoint_day_14');
    await executeAction({ type: 'submit_checkpoint_decision', payload: { decision: 'continue_same', day: 14 } }, ctx);
    const dispatchCalls = (ctx.dispatch as any)._calls;
    const updateCall = dispatchCalls.find((c: any) => c.type === 'screen/updateScreenData');
    expect(updateCall?.payload?.checkpoint_submit_error).toBe(true);
  });
});
