/**
 * P0 — InnerPathPage onboarding routing tests.
 * Verifies that entry-view returning onboarding_start navigates to
 * /en/mitra/onboarding?stateId=turn_1 (not bare /en/mitra/onboarding).
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor, cleanup } from '@testing-library/react';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('react-redux', () => ({
  useDispatch: vi.fn(),
  useSelector: vi.fn(),
  Provider: ({ children }: any) => children,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

vi.mock('../../../store/screenSlice', () => ({
  useScreenState: vi.fn(() => ({ screenData: {}, currentContainerId: 'portal', currentStateId: 'portal', currentScreen: null })),
  updateScreenData: vi.fn((x: any) => ({ type: 'screen/updateScreenData', payload: x })),
  setScreenValue: vi.fn((x: any) => ({ type: 'screen/setScreenValue', payload: x })),
}));

vi.mock('../../../engine/mitraApi', () => ({
  mitraJourneyEntryView: vi.fn(),
  getDashboardView: vi.fn(),
}));

vi.mock('../../../engine/v3Ingest', () => ({
  ingestDailyView: vi.fn(() => ({})),
  ingestDay7View: vi.fn(() => ({})),
  ingestDay14View: vi.fn(() => ({})),
}));

vi.mock('../../../engine/actionExecutor', () => ({
  executeAction: vi.fn(),
}));

vi.mock('@kalpx/contracts', () => ({
  normalizeDashboardWhyThisState: vi.fn(() => ({ canOpenWhyThis: false, tabs: [], l1Items: [] })),
}));

vi.mock('lucide-react', () => ({
  Leaf: () => null,
  Music: () => null,
  Sparkles: () => null,
}));

vi.mock('../../../components/layout/MitraMobileShell', () => ({
  MitraMobileShell: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('../../../components/blocks/dashboard/ContinuityBanner', () => ({
  ContinuityBanner: () => null,
}));

vi.mock('../../../components/blocks/dashboard/CycleProgressBlock', () => ({
  CycleProgressBlock: () => null,
}));

vi.mock('../../../components/blocks/dashboard/SankalpCarryBlock', () => ({
  SankalpCarryBlock: () => null,
}));

import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { mitraJourneyEntryView } from '../../../engine/mitraApi';
import { InnerPathPage } from '../InnerPathPage';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('InnerPathPage — P0 onboarding routing', () => {
  let mockNavigate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate = vi.fn();
    (useNavigate as any).mockReturnValue(mockNavigate);
    (useDispatch as any).mockReturnValue(vi.fn((action: any) => Promise.resolve(action)));
  });

  afterEach(cleanup);

  it('navigates to /en/mitra/onboarding?stateId=turn_1 when entry-view returns onboarding_start', async () => {
    (mitraJourneyEntryView as any).mockResolvedValue({
      envelope: { target: { view_key: 'onboarding_start' } },
    });

    render(<InnerPathPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('stateId=turn_1'),
        expect.objectContaining({ replace: true }),
      );
    });

    // Must NOT navigate to bare /en/mitra/onboarding (no stateId causes portal-stale bug)
    const call = mockNavigate.mock.calls[0][0] as string;
    expect(call).toMatch(/stateId=turn_1/);
    expect(call).not.toBe('/en/mitra/onboarding');
  });

  it('navigates to /en/mitra/onboarding?stateId=turn_1 when entry-view returns null viewKey', async () => {
    (mitraJourneyEntryView as any).mockResolvedValue({
      envelope: { target: { view_key: null } },
    });

    render(<InnerPathPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.stringContaining('stateId=turn_1'),
        expect.objectContaining({ replace: true }),
      );
    });
  });

  it('navigates to checkpoint when entry-view returns day_7_view', async () => {
    (mitraJourneyEntryView as any).mockResolvedValue({
      envelope: { target: { view_key: 'day_7_view', payload: {} } },
    });

    render(<InnerPathPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/en/mitra/checkpoint/7', { replace: true });
    });
  });

  it('navigates to checkpoint when entry-view returns day_14_view', async () => {
    (mitraJourneyEntryView as any).mockResolvedValue({
      envelope: { target: { view_key: 'day_14_view', payload: {} } },
    });

    render(<InnerPathPage />);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/en/mitra/checkpoint/14', { replace: true });
    });
  });
});
