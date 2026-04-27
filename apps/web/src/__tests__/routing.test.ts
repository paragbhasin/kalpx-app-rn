/**
 * Phase 9.5 routing audit — unit tests.
 * Covers: normalizeJourneyStatus, resetStore, journey status cache invalidation.
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
