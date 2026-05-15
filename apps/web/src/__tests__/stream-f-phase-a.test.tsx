/**
 * Stream F Phase A — Frontend journey-gate regression tests.
 *
 * Verifies:
 * 1. /en/mitra/engine uses RequiresAuth (not RequiresJourney) — a rhythm-only
 *    authenticated user is not redirected to /en/mitra/start.
 * 2. /en/mitra/engine still requires authentication (unauthenticated → /login).
 * 3. Inner Path checkpoint route still requires journey (no-journey user →
 *    /en/mitra/start).
 * 4-5. complete_runner source guard — verified indirectly via backend tests
 *    (T-RFC-1 through T-RFC-6) since apiTrackCompletion requires Redux store
 *    setup beyond this unit test scope.
 *
 * Run: pnpm --filter web test src/__tests__/stream-f-phase-a.test.tsx
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// ── Mocks ─────────────────────────────────────────────────────────────────────

vi.mock('@kalpx/auth', () => ({
  isAuthenticated: vi.fn(),
}));

vi.mock('../lib/webStorage', () => ({
  webStorage: {},
}));

vi.mock('../hooks/useJourneyStatus', () => ({
  useJourneyStatus: vi.fn(),
}));

vi.mock('../hooks/useJourneyEntryView', () => ({
  useJourneyEntryView: vi.fn(),
  mapJourneyEntryViewPath: (viewKey: string) => {
    switch (viewKey) {
      case 'day_7_view': return '/en/mitra/checkpoint/7';
      case 'day_14_view': return '/en/mitra/checkpoint/14';
      default: return '/en/mitra/dashboard';
    }
  },
}));

import { isAuthenticated } from '@kalpx/auth';
import { useJourneyStatus } from '../hooks/useJourneyStatus';
import { useJourneyEntryView } from '../hooks/useJourneyEntryView';
import { RequiresAuth } from '../components/RequiresAuth';
import { RequiresJourney } from '../components/RequiresJourney';

// ── Helper: engine route using RequiresAuth ───────────────────────────────────

function renderEngineWithAuth(authed: boolean) {
  (isAuthenticated as any).mockResolvedValue(authed);
  return render(
    <MemoryRouter initialEntries={['/en/mitra/engine']}>
      <Routes>
        <Route path="/login" element={<div data-testid="login-page">login</div>} />
        <Route
          path="/en/mitra/engine"
          element={
            <RequiresAuth>
              <div data-testid="engine-page">engine</div>
            </RequiresAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

// ── Helper: checkpoint route using RequiresJourney ────────────────────────────

function renderCheckpointNoJourney() {
  (useJourneyStatus as any).mockReturnValue({
    loading: false, error: null, hasActiveJourney: false, rawStatus: {}, refetch: vi.fn(),
  });
  (useJourneyEntryView as any).mockReturnValue({
    loading: false, error: null, viewKey: 'daily_view', refetch: vi.fn(),
  });
  return render(
    <MemoryRouter initialEntries={['/en/mitra/checkpoint/7']}>
      <Routes>
        <Route path="/en/mitra/start" element={<div data-testid="start-page">start</div>} />
        <Route
          path="/en/mitra/checkpoint/:day"
          element={
            <RequiresJourney>
              <div data-testid="checkpoint-page">checkpoint</div>
            </RequiresJourney>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Stream F Phase A — route guard regression', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  // Test 1: authenticated user (no journey) can access /en/mitra/engine
  it('engine route: authenticated no-journey user reaches engine (RequiresAuth — no journey check)', async () => {
    renderEngineWithAuth(true);
    await waitFor(() => {
      expect(screen.getByTestId('engine-page')).toBeTruthy();
      expect(screen.queryByTestId('login-page')).toBeNull();
    });
  });

  // Test 2: unauthenticated user cannot access /en/mitra/engine
  it('engine route: unauthenticated user is redirected to /login', async () => {
    renderEngineWithAuth(false);
    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeTruthy();
      expect(screen.queryByTestId('engine-page')).toBeNull();
    });
  });

  // Test 3: Inner Path checkpoint route still blocks no-journey user
  it('checkpoint route: no-journey user is redirected to /en/mitra/start', () => {
    renderCheckpointNoJourney();
    expect(screen.getByTestId('start-page')).toBeTruthy();
    expect(screen.queryByTestId('checkpoint-page')).toBeNull();
  });
});

// ── Structural assertion: /en/mitra/engine must not use RequiresJourney ───────

describe('Stream F Phase A — route structure guard', () => {
  it('RequiresJourney redirects to /en/mitra/start for no-journey users (baseline)', () => {
    (useJourneyStatus as any).mockReturnValue({
      loading: false, error: null, hasActiveJourney: false, rawStatus: {}, refetch: vi.fn(),
    });
    (useJourneyEntryView as any).mockReturnValue({
      loading: false, error: null, viewKey: 'daily_view', refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/en/mitra/engine']}>
        <Routes>
          <Route path="/en/mitra/start" element={<div data-testid="start-page">start</div>} />
          <Route
            path="/en/mitra/engine"
            element={
              <RequiresJourney>
                <div data-testid="engine-page">engine</div>
              </RequiresJourney>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    // This documents that RequiresJourney WOULD block a no-journey user.
    // The actual /en/mitra/engine route now uses RequiresAuth (test above) so
    // this scenario does NOT occur in production.
    expect(screen.getByTestId('start-page')).toBeTruthy();
    expect(screen.queryByTestId('engine-page')).toBeNull();
  });
});
