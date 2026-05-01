import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../hooks/useJourneyStatus', () => ({
  useJourneyStatus: vi.fn(),
}));

vi.mock('../hooks/useJourneyEntryView', () => ({
  useJourneyEntryView: vi.fn(),
  mapJourneyEntryViewPath: (viewKey: string) => {
    switch (viewKey) {
      case 'day_7_view':
        return '/en/mitra/checkpoint/7';
      case 'day_14_view':
        return '/en/mitra/checkpoint/14';
      case 'welcome_back_surface':
        return '/en/mitra/welcome-back';
      case 'onboarding_start':
        return '/en/mitra/onboarding';
      default:
        return '/en/mitra/dashboard';
    }
  },
}));

import { useJourneyStatus } from '../hooks/useJourneyStatus';
import { useJourneyEntryView } from '../hooks/useJourneyEntryView';
import { RequiresJourney } from '../components/RequiresJourney';

function renderGuard(initialEntry = '/en/mitra/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/en/mitra/start" element={<div data-testid="start-page">start</div>} />
        <Route path="/en/mitra/checkpoint/7" element={<div data-testid="checkpoint-7">checkpoint-7</div>} />
        <Route path="/en/mitra/checkpoint/14" element={<div data-testid="checkpoint-14">checkpoint-14</div>} />
        <Route path="/en/mitra/welcome-back" element={<div data-testid="welcome-back">welcome-back</div>} />
        <Route path="/en/mitra/onboarding" element={<div data-testid="onboarding">onboarding</div>} />
        <Route
          path="*"
          element={(
            <RequiresJourney>
              <div data-testid="protected">protected</div>
            </RequiresJourney>
          )}
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequiresJourney', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useJourneyEntryView as any).mockReturnValue({
      loading: false,
      error: null,
      viewKey: 'daily_view',
      refetch: vi.fn(),
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders children for a normal active journey day', () => {
    (useJourneyStatus as any).mockReturnValue({
      loading: false,
      error: null,
      hasActiveJourney: true,
      rawStatus: { hasActiveJourney: true, dayNumber: 7 },
      refetch: vi.fn(),
    });

    renderGuard();

    expect(screen.getByTestId('protected')).toBeTruthy();
  });

  it('redirects active journey users to day 7 when entry-view says day_7_view', () => {
    (useJourneyStatus as any).mockReturnValue({
      loading: false,
      error: null,
      hasActiveJourney: true,
      rawStatus: { hasActiveJourney: true, dayNumber: 8 },
      refetch: vi.fn(),
    });
    (useJourneyEntryView as any).mockReturnValue({
      loading: false,
      error: null,
      viewKey: 'day_7_view',
      refetch: vi.fn(),
    });

    renderGuard('/en/mitra/room/stillness');

    expect(screen.getByTestId('checkpoint-7')).toBeTruthy();
    expect(screen.queryByTestId('protected')).toBeNull();
  });

  it('redirects active journey users to day 14 when entry-view says day_14_view', () => {
    (useJourneyStatus as any).mockReturnValue({
      loading: false,
      error: null,
      hasActiveJourney: true,
      rawStatus: { hasActiveJourney: true, dayNumber: 15, daysPastEnd: 2, checkpointPending: true },
      refetch: vi.fn(),
    });
    (useJourneyEntryView as any).mockReturnValue({
      loading: false,
      error: null,
      viewKey: 'day_14_view',
      refetch: vi.fn(),
    });

    renderGuard('/en/mitra/dashboard');

    expect(screen.getByTestId('checkpoint-14')).toBeTruthy();
    expect(screen.queryByTestId('protected')).toBeNull();
  });

  it('redirects stale active journeys to welcome-back', () => {
    (useJourneyStatus as any).mockReturnValue({
      loading: false,
      error: null,
      hasActiveJourney: true,
      rawStatus: { hasActiveJourney: true, dayNumber: 4, welcomeBack: true },
      refetch: vi.fn(),
    });
    (useJourneyEntryView as any).mockReturnValue({
      loading: false,
      error: null,
      viewKey: 'welcome_back_surface',
      refetch: vi.fn(),
    });

    renderGuard('/en/mitra/dashboard');

    expect(screen.getByTestId('welcome-back')).toBeTruthy();
  });

  it('redirects onboarding-bound active journeys to onboarding', () => {
    (useJourneyStatus as any).mockReturnValue({
      loading: false,
      error: null,
      hasActiveJourney: true,
      rawStatus: { hasActiveJourney: true, dayNumber: 14 },
      refetch: vi.fn(),
    });
    (useJourneyEntryView as any).mockReturnValue({
      loading: false,
      error: null,
      viewKey: 'onboarding_start',
      refetch: vi.fn(),
    });

    renderGuard('/en/mitra/dashboard');

    expect(screen.getByTestId('onboarding')).toBeTruthy();
  });

  it('does not re-redirect when already on the matching checkpoint route', () => {
    (useJourneyStatus as any).mockReturnValue({
      loading: false,
      error: null,
      hasActiveJourney: true,
      rawStatus: { hasActiveJourney: true, dayNumber: 14 },
      refetch: vi.fn(),
    });
    (useJourneyEntryView as any).mockReturnValue({
      loading: false,
      error: null,
      viewKey: 'day_14_view',
      refetch: vi.fn(),
    });

    renderGuard('/en/mitra/checkpoint/14');

    expect(screen.getByTestId('checkpoint-14')).toBeTruthy();
  });

  it('redirects inactive users to start', () => {
    (useJourneyStatus as any).mockReturnValue({
      loading: false,
      error: null,
      hasActiveJourney: false,
      rawStatus: { hasActiveJourney: false },
      refetch: vi.fn(),
    });

    renderGuard();

    expect(screen.getByTestId('start-page')).toBeTruthy();
  });
});
