/**
 * G8b — OnboardingPage post-auth turn_7 recovery tests.
 * Covers: happy path, no double execution, unauthenticated no-op,
 *         no stashed state no-op, wrong stateId no-op, failure path.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/react';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const _storage: Record<string, string> = {};
vi.stubGlobal('localStorage', {
  getItem: (k: string) => _storage[k] ?? null,
  setItem: (k: string, v: string) => { _storage[k] = v; },
  removeItem: (k: string) => { delete _storage[k]; },
  clear: () => { Object.keys(_storage).forEach((k) => delete _storage[k]); },
});

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
  Provider: ({ children }: any) => children,
}));

vi.mock('react-router-dom', () => ({
  useSearchParams: vi.fn(),
  useNavigate: vi.fn(),
}));

vi.mock('../../../store/screenSlice', () => ({
  useScreenState: vi.fn(),
  loadScreenWithData: vi.fn(() => ({ type: 'screen/loadScreenWithData' })),
  loadScreen: vi.fn((x: any) => ({ type: 'screen/loadScreen', payload: x })),
  setScreenValue: vi.fn((x: any) => ({ type: 'screen/setScreenValue', payload: x })),
  updateScreenData: vi.fn((x: any) => ({ type: 'screen/updateScreenData', payload: x })),
}));

vi.mock('../../../hooks/useJourneyStatus', () => ({
  useJourneyStatus: vi.fn(),
  invalidateJourneyStatusCache: vi.fn(),
}));

vi.mock('../../../hooks/useGuestIdentity', () => ({ useGuestIdentity: vi.fn() }));
vi.mock('../../../engine/mitraApi', () => ({ startJourneyV3: vi.fn() }));
vi.mock('../../../lib/webRouter', () => ({ webNavigate: vi.fn() }));
vi.mock('../../../lib/env', () => ({ WEB_ENV: { isDev: false } }));
vi.mock('../../../engine/actionExecutor', () => ({ executeAction: vi.fn() }));
vi.mock('../../../engine/ScreenRenderer', () => ({
  ScreenRenderer: () => null,
}));
vi.mock('../../../components/layout/MitraMobileShell', () => ({
  MitraMobileShell: ({ children }: any) => <div>{children}</div>,
}));

import { useDispatch } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useScreenState, loadScreen, updateScreenData, setScreenValue } from '../../../store/screenSlice';
import { useJourneyStatus, invalidateJourneyStatusCache } from '../../../hooks/useJourneyStatus';
import { startJourneyV3 } from '../../../engine/mitraApi';
import { webNavigate } from '../../../lib/webRouter';
import { OnboardingPage } from '../OnboardingPage';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STASHED_SCREENDATA = {
  stashed_inference_state: { lane: 'support', primary_kosha: 'manomaya' },
  stashed_guidance_mode: 'hybrid',
  onboarding_draft_state: { path: 'support', guidance_mode: 'hybrid' },
  onboarding_turn: 'turn_7_awaiting_auth',
};

const FAKE_START = {
  triad: {
    mantra: { title: 'Om Namah Shivaya', item_id: 'mantra.ons' },
    sankalp: { title: 'I am at peace', item_id: 'sankalp.peace' },
    practice: { title: 'Box Breathing', item_id: 'practice.box' },
  },
  scan_focus: 'release',
  journey_id: 101,
};

function makeDispatch() {
  return vi.fn((action: any) => Promise.resolve(action));
}

function setupMocks({
  stateId = 'turn_7',
  screenData = STASHED_SCREENDATA,
  hasActiveJourney = false,
  statusLoading = false,
}: {
  stateId?: string;
  screenData?: Record<string, any>;
  hasActiveJourney?: boolean;
  statusLoading?: boolean;
} = {}) {
  const dispatch = makeDispatch();
  (useDispatch as any).mockReturnValue(dispatch);
  (useNavigate as any).mockReturnValue(vi.fn());

  const params = new URLSearchParams(`stateId=${stateId}`);
  (useSearchParams as any).mockReturnValue([params, vi.fn()]);

  (useScreenState as any).mockReturnValue({
    screenData,
    currentContainerId: 'welcome_onboarding',
    currentStateId: stateId,
    currentScreen: null,
  });

  (useJourneyStatus as any).mockReturnValue({ loading: statusLoading, hasActiveJourney });

  return { dispatch };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('OnboardingPage — G8b post-auth turn_7 recovery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('happy path: calls startJourneyV3, seeds triad, clears stash, invalidates cache, navigates to turn_8', async () => {
    (startJourneyV3 as any).mockResolvedValue(FAKE_START);
    localStorage.setItem('access_token', 'test.jwt.token');
    const { dispatch } = setupMocks();

    render(<OnboardingPage />);

    await waitFor(() => {
      expect(startJourneyV3).toHaveBeenCalledWith(
        expect.objectContaining({ guidance_mode: 'hybrid' }),
      );
    });

    // Triad seeded via updateScreenData
    const updateCalls = (dispatch as any).mock.calls
      .map((c: any[]) => c[0])
      .filter((a: any) => a?.type === 'screen/updateScreenData');
    const triads = updateCalls.find((a: any) => a?.payload?.companion_mantra_title);
    expect(triads?.payload).toMatchObject({
      companion_mantra_title: 'Om Namah Shivaya',
      companion_sankalp_id: 'sankalp.peace',
      companion_practice_title: 'Box Breathing',
      journey_id: 101,
    });

    // Stashed keys cleared in same update call
    expect(triads?.payload?.stashed_inference_state).toBeNull();
    expect(triads?.payload?.stashed_guidance_mode).toBeNull();
    expect(triads?.payload?.onboarding_draft_state).toBeNull();
    expect(triads?.payload?.onboarding_turn).toBe('turn_8');

    // Cache invalidated
    expect(invalidateJourneyStatusCache).toHaveBeenCalled();

    // loadScreen dispatched to turn_8
    expect(loadScreen).toHaveBeenCalledWith({ containerId: 'welcome_onboarding', stateId: 'turn_8' });

    // webNavigate to turn_8
    expect(webNavigate).toHaveBeenCalledWith(expect.stringContaining('stateId=turn_8'));
  });

  it('no double execution: startJourneyV3 called exactly once even when screenData re-renders', async () => {
    (startJourneyV3 as any).mockResolvedValue(FAKE_START);
    localStorage.setItem('access_token', 'test.jwt.token');
    setupMocks();

    const { rerender } = render(<OnboardingPage />);

    await waitFor(() => {
      expect(startJourneyV3).toHaveBeenCalledTimes(1);
    });

    // Force a re-render (simulates screenData change triggering effect dependencies)
    rerender(<OnboardingPage />);
    await waitFor(() => {});

    expect(startJourneyV3).toHaveBeenCalledTimes(1);
  });

  it('unauthenticated no-op: does not call startJourneyV3 when no access_token', async () => {
    // localStorage is clear (no access_token)
    setupMocks();

    render(<OnboardingPage />);

    // Allow effects to flush
    await waitFor(() => {});

    expect(startJourneyV3).not.toHaveBeenCalled();
    expect(webNavigate).not.toHaveBeenCalled();
  });

  it('no stashed state no-op: does not call startJourneyV3 when stashed_inference_state is absent', async () => {
    localStorage.setItem('access_token', 'test.jwt.token');
    setupMocks({
      screenData: {
        stashed_inference_state: null,
        onboarding_turn: 'turn_7_awaiting_auth',
      },
    });

    render(<OnboardingPage />);
    await waitFor(() => {});

    expect(startJourneyV3).not.toHaveBeenCalled();
  });

  it('wrong stateId no-op: does not call startJourneyV3 on turn_6 or turn_8', async () => {
    (startJourneyV3 as any).mockResolvedValue(FAKE_START);
    localStorage.setItem('access_token', 'test.jwt.token');

    for (const sid of ['turn_6', 'turn_8']) {
      vi.clearAllMocks();
      localStorage.setItem('access_token', 'test.jwt.token');
      setupMocks({ stateId: sid, screenData: STASHED_SCREENDATA });
      const { unmount } = render(<OnboardingPage />);
      await waitFor(() => {});
      expect(startJourneyV3).not.toHaveBeenCalled();
      unmount();
    }
  });

  it('failure path: dispatches v3_start_failed, preserves stashed keys, does not navigate to turn_8', async () => {
    (startJourneyV3 as any).mockResolvedValue(null); // API returns null
    localStorage.setItem('access_token', 'test.jwt.token');
    const { dispatch } = setupMocks();

    render(<OnboardingPage />);

    await waitFor(() => {
      expect(startJourneyV3).toHaveBeenCalled();
    });

    // v3_start_failed dispatched via setScreenValue
    expect(setScreenValue).toHaveBeenCalledWith({ key: 'v3_start_failed', value: true });

    // updateScreenData should NOT have been called with stash-clearing payload
    const updateCalls = (dispatch as any).mock.calls
      .map((c: any[]) => c[0])
      .filter((a: any) => a?.type === 'screen/updateScreenData');
    const stashClear = updateCalls.find((a: any) => a?.payload?.stashed_inference_state === null);
    expect(stashClear).toBeUndefined();

    // No navigation to turn_8
    const navigateCalls = (webNavigate as any).mock.calls.map((c: any[]) => c[0]);
    expect(navigateCalls.every((p: string) => !String(p).includes('turn_8'))).toBe(true);
  });
});
