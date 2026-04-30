import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('../hooks/useJourneyStatus', () => ({
  useJourneyStatus: vi.fn(),
}));

import { useJourneyStatus } from '../hooks/useJourneyStatus';
import { RequiresJourney } from '../components/RequiresJourney';

function renderGuard(initialEntry = '/en/mitra/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/en/mitra/start" element={<div data-testid="start-page">start</div>} />
        <Route path="/en/mitra/checkpoint/7" element={<div data-testid="checkpoint-7">checkpoint-7</div>} />
        <Route path="/en/mitra/checkpoint/14" element={<div data-testid="checkpoint-14">checkpoint-14</div>} />
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
  });

  afterEach(() => {
    cleanup();
  });

  it('renders children for a normal active journey day', () => {
    (useJourneyStatus as any).mockReturnValue({
      loading: false,
      error: null,
      hasActiveJourney: true,
      rawStatus: { hasActiveJourney: true, dayNumber: 8 },
      refetch: vi.fn(),
    });

    renderGuard();

    expect(screen.getByTestId('protected')).toBeTruthy();
  });

  it('redirects active journey users on day 7 to the checkpoint route', () => {
    (useJourneyStatus as any).mockReturnValue({
      loading: false,
      error: null,
      hasActiveJourney: true,
      rawStatus: { hasActiveJourney: true, dayNumber: 7 },
      refetch: vi.fn(),
    });

    renderGuard('/en/mitra/room/stillness');

    expect(screen.getByTestId('checkpoint-7')).toBeTruthy();
    expect(screen.queryByTestId('protected')).toBeNull();
  });

  it('redirects active journey users on day 14 to the checkpoint route', () => {
    (useJourneyStatus as any).mockReturnValue({
      loading: false,
      error: null,
      hasActiveJourney: true,
      rawStatus: { hasActiveJourney: true, dayNumber: 14, daysPastEnd: 2 },
      refetch: vi.fn(),
    });

    renderGuard('/en/mitra/dashboard');

    expect(screen.getByTestId('checkpoint-14')).toBeTruthy();
    expect(screen.queryByTestId('protected')).toBeNull();
  });

  it('does not re-redirect when already on the matching checkpoint route', () => {
    (useJourneyStatus as any).mockReturnValue({
      loading: false,
      error: null,
      hasActiveJourney: true,
      rawStatus: { hasActiveJourney: true, dayNumber: 14 },
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
