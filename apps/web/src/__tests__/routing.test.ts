/**
 * Phase 9.5 + Phase 11.5 routing audit — unit tests.
 * Covers: normalizeJourneyStatus (camelCase + snake_case), resetStore, journey status cache.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { normalizeJourneyStatus } from '../types/api';
import { resetStore } from '../store';
import { invalidateJourneyStatusCache } from '../hooks/useJourneyStatus';

// ── normalizeJourneyStatus ────────────────────────────────────────────────────

describe('normalizeJourneyStatus', () => {
  it('returns false for null/undefined', () => {
    expect(normalizeJourneyStatus(null)).toBe(false);
    expect(normalizeJourneyStatus(undefined)).toBe(false);
  });

  it('returns true when active_journey=true', () => {
    expect(normalizeJourneyStatus({ active_journey: true })).toBe(true);
  });

  it('returns true when has_active_journey=true', () => {
    expect(normalizeJourneyStatus({ has_active_journey: true })).toBe(true);
  });

  it('returns true when journey.status=active', () => {
    expect(normalizeJourneyStatus({ journey: { status: 'active' } })).toBe(true);
  });

  it('returns true when status=active', () => {
    expect(normalizeJourneyStatus({ status: 'active' })).toBe(true);
  });

  it('returns true when journey_id present and status not ended', () => {
    expect(normalizeJourneyStatus({ journey_id: 42, status: 'running' })).toBe(true);
  });

  it('returns false when status=ended', () => {
    expect(normalizeJourneyStatus({ journey_id: 42, status: 'ended' })).toBe(false);
  });

  it('returns false for empty object', () => {
    expect(normalizeJourneyStatus({})).toBe(false);
  });

  // ── Regression: actual backend wire shape (camelCase) ──────────────────────
  // Backend GET /api/mitra/journey/status/ returns camelCase, not snake_case.
  // Captured response: { hasActiveJourney: true, journeyId: 4014, dayNumber: 8,
  //   pathCycleNumber: 1, daysPastEnd: 0, focus: "peacecalm", subfocus: "" }

  it('REGRESSION: returns true for actual backend wire shape (camelCase hasActiveJourney)', () => {
    expect(normalizeJourneyStatus({
      hasActiveJourney: true,
      journeyId: 4014,
      focus: 'peacecalm',
      subfocus: '',
      dayNumber: 8,
      pathCycleNumber: 1,
      daysPastEnd: 0,
    })).toBe(true);
  });

  it('returns false when hasActiveJourney=false (no journey)', () => {
    expect(normalizeJourneyStatus({
      hasActiveJourney: false,
      journeyId: undefined,
      dayNumber: 0,
    })).toBe(false);
  });

  it('returns false when hasActiveJourney absent and no other matching field', () => {
    expect(normalizeJourneyStatus({
      journeyId: 4014,
      daysPastEnd: 5,
    })).toBe(false);
  });

  it('returns true when journeyId present and daysPastEnd=0 (active user, no hasActiveJourney field)', () => {
    expect(normalizeJourneyStatus({
      journeyId: 99,
      daysPastEnd: 0,
    })).toBe(true);
  });

  it('does NOT route to dashboard when hasActiveJourney=false even with journeyId present', () => {
    expect(normalizeJourneyStatus({
      hasActiveJourney: false,
      journeyId: 4014,
      dayNumber: 8,
    })).toBe(false);
  });
});

// ── resetStore ────────────────────────────────────────────────────────────────

describe('resetStore action', () => {
  it('has type store/reset', () => {
    expect(resetStore.type).toBe('store/reset');
  });

  it('dispatching resetStore resets screenData to initial state', async () => {
    const { store } = await import('../store');
    const { updateScreenData } = await import('../store/screenSlice');

    // Seed some state
    store.dispatch(updateScreenData({ greeting: 'Hello', journey_id: 99 }));
    expect((store.getState() as any).screen.screenData.greeting).toBe('Hello');

    // Reset
    store.dispatch(resetStore());
    expect((store.getState() as any).screen.screenData.greeting).toBeUndefined();
    expect((store.getState() as any).screen.screenData.journey_id).toBeUndefined();
  });

  it('dispatching resetStore clears currentScreen', async () => {
    const { store } = await import('../store');
    const { updateScreenData } = await import('../store/screenSlice');

    store.dispatch(updateScreenData({ some_key: 'some_value' }));
    store.dispatch(resetStore());

    const state = (store.getState() as any).screen;
    expect(state.currentScreen).toBeNull();
    expect(state.currentContainerId).toBe('portal');
  });
});

// ── invalidateJourneyStatusCache ──────────────────────────────────────────────

describe('invalidateJourneyStatusCache', () => {
  it('is a callable function that does not throw', () => {
    expect(() => invalidateJourneyStatusCache()).not.toThrow();
  });

  it('calling it multiple times does not throw', () => {
    expect(() => {
      invalidateJourneyStatusCache();
      invalidateJourneyStatusCache();
      invalidateJourneyStatusCache();
    }).not.toThrow();
  });
});
