/**
 * actionExecutor — Phase 6 onboarding state machine tests.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeAction } from '../actionExecutor';
import type { ActionContext } from '../actionExecutor';

// Provide a localStorage stub for the Node test environment
const _storage: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: (k: string) => _storage[k] ?? null,
  setItem: (k: string, v: string) => { _storage[k] = v; },
  removeItem: (k: string) => { delete _storage[k]; },
  clear: () => { Object.keys(_storage).forEach((k) => delete _storage[k]); },
});

// Mock mitraApi
vi.mock('../mitraApi', () => ({
  trackEvent: vi.fn().mockResolvedValue(undefined),
  trackCompletion: vi.fn().mockResolvedValue(undefined),
  onboardingComplete: vi.fn().mockResolvedValue({
    inference: { lane: 'support', primary_kosha: 'manomaya', confidence: 0.8 },
    recognition: { line: 'You are carrying something heavy.' },
    triad_labels: { mantra: 'MANTRA', sankalp: 'SANKALP', practice: 'PRACTICE' },
  }),
  startJourneyV3: vi.fn().mockResolvedValue({
    journey_id: 42,
    triad: {
      mantra: { title: 'Om Namah Shivaya', item_id: 'm1' },
      sankalp: { title: 'I am at peace', item_id: 's1' },
      practice: { title: 'Morning breath', item_id: 'p1' },
    },
  }),
  getDailyView: vi.fn().mockResolvedValue(null),
}));

// Mock webRouter
vi.mock('../../lib/webRouter', () => ({
  webNavigate: vi.fn(),
}));

import { webNavigate } from '../../lib/webRouter';

function makeDispatch() {
  const calls: any[] = [];
  const dispatch = vi.fn((action: any) => {
    calls.push(action);
    return Promise.resolve();
  });
  (dispatch as any)._calls = calls;
  return dispatch;
}

function makeContext(
  screenData: Record<string, any> = {},
  currentStateId = 'turn_1',
): ActionContext {
  return {
    dispatch: makeDispatch() as any,
    screenData,
    currentStateId,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe('onboarding_turn_response', () => {
  it('turn_1 continue chip → navigates to turn_2', async () => {
    const ctx = makeContext({}, 'turn_1');
    await executeAction(
      { type: 'onboarding_turn_response', payload: { chip_id: 'continue' } },
      ctx,
    );
    expect(webNavigate).toHaveBeenCalledWith(
      expect.stringContaining('turn_2'),
    );
  });

  it('turn_1 returning chip → navigates to login', async () => {
    const ctx = makeContext({}, 'turn_1');
    await executeAction(
      { type: 'onboarding_turn_response', payload: { chip_id: 'returning' } },
      ctx,
    );
    expect(webNavigate).toHaveBeenCalledWith('/login');
  });

  it('turn_2 growth chip → navigates to turn_3_growth', async () => {
    const ctx = makeContext({}, 'turn_2');
    await executeAction(
      { type: 'onboarding_turn_response', payload: { chip_id: 'growth' } },
      ctx,
    );
    expect(webNavigate).toHaveBeenCalledWith(
      expect.stringContaining('turn_3_growth'),
    );
  });

  it('turn_2 support chip → navigates to turn_3_support', async () => {
    const ctx = makeContext({}, 'turn_2');
    await executeAction(
      { type: 'onboarding_turn_response', payload: { chip_id: 'support' } },
      ctx,
    );
    expect(webNavigate).toHaveBeenCalledWith(
      expect.stringContaining('turn_3_support'),
    );
  });

  it('turn_3_support stage1 choice → navigates to turn_4_support', async () => {
    const draft = { path: 'support', stage0_choice: 'support' };
    const ctx = makeContext({ onboarding_draft_state: draft }, 'turn_3_support');
    await executeAction(
      { type: 'onboarding_turn_response', payload: { chip_id: 'body' } },
      ctx,
    );
    expect(webNavigate).toHaveBeenCalledWith(
      expect.stringContaining('turn_4_support'),
    );
  });

  it('turn_6 guidance_mode → calls onboardingComplete and navigates to turn_7', async () => {
    const { onboardingComplete } = await import('../mitraApi');
    const draft = {
      path: 'support',
      stage0_choice: 'support',
      stage1_choice: 'body',
      stage2_choice: 'emotions',
      stage3_choice: 'fear',
    };
    const ctx = makeContext({ onboarding_draft_state: draft }, 'turn_6');
    await executeAction(
      { type: 'onboarding_turn_response', payload: { guidance_mode: 'hybrid' } },
      ctx,
    );
    expect(onboardingComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        stage0_choice: 'support',
        guidance_mode: 'hybrid',
      }),
    );
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('turn_7'));
  });

  it('turn_7 unauthenticated → stashes state and redirects to login', async () => {
    // localStorage has no token → unauthenticated
    const draft = { path: 'support', inference: {}, guidance_mode: 'hybrid' };
    const ctx = makeContext({ onboarding_draft_state: draft }, 'turn_7');
    await executeAction(
      { type: 'onboarding_turn_response', payload: { chip_id: 'show_path' } },
      ctx,
    );
    expect(webNavigate).toHaveBeenCalledWith(
      expect.stringContaining('/login'),
    );
  });

  it('turn_7 authenticated → calls startJourneyV3 and navigates to turn_8', async () => {
    localStorage.setItem('access_token', 'eyJhbGciOiJIUzI1NiJ9.eyJleHAiOjk5OTk5OTk5OTl9.sig');
    const { startJourneyV3 } = await import('../mitraApi');
    const draft = {
      path: 'support',
      stage0_choice: 'support',
      stage1_choice: 'body',
      stage2_choice: 'emotions',
      stage3_choice: 'fear',
      guidance_mode: 'hybrid',
      inference: { lane: 'support', primary_kosha: 'manomaya' },
    };
    const ctx = makeContext({ onboarding_draft_state: draft }, 'turn_7');
    await executeAction(
      { type: 'onboarding_turn_response', payload: { chip_id: 'show_path' } },
      ctx,
    );
    expect(startJourneyV3).toHaveBeenCalled();
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('turn_8'));
  });

  it('turn_8 → navigates to dashboard', async () => {
    const draft = { path: 'support', guidance_mode: 'hybrid' };
    const ctx = makeContext({ onboarding_draft_state: draft }, 'turn_8');
    await executeAction(
      { type: 'onboarding_turn_response', payload: { chip_id: 'ready' } },
      ctx,
    );
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/dashboard');
  });
});

describe('start_new_journey', () => {
  it('resets draft state and navigates to turn_1', async () => {
    const ctx = makeContext({}, 'turn_8');
    await executeAction({ type: 'start_new_journey' }, ctx);
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('turn_1'));
  });
});
