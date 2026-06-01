/**
 * useJapaEngine — Japa Counting Engine hook (Phase 1)
 *
 * Powers all mantra counting across Quick Chant, Daily Rhythm, Inner Path,
 * and standalone Digital Mala. Every surface uses this same hook.
 *
 * Architecture:
 *   - sessionCount lives in React state → instant UI update on every tap
 *   - Session state persisted to AsyncStorage on every tap (fire-and-forget)
 *   - Cached stats (today/lifetime) loaded from AsyncStorage on mount,
 *     then refreshed after every successful backend sync
 *   - Backend session started non-blockingly on mantraRef becoming available
 *   - Sync fires when: unsyncedDelta >= SYNC_COUNT_THRESHOLD or
 *     SYNC_INTERVAL_MS elapsed since last sync, whichever comes first
 *   - Immediate sync on complete/unmount
 *
 * Invariants:
 *   - increment() is synchronous from the user's perspective — no await
 *   - No API call fires on every tap
 *   - Counts survive app kill (AsyncStorage persists across processes)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

import type { JapaGoalType, JapaLocalSession, JapaLocalStats, JapaSourceSurface } from '@kalpx/types';
import {
  japaCompleteSession,
  japaGetStats,
  japaStartSession,
  japaSyncSession,
} from './japaApi';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SYNC_COUNT_THRESHOLD = 50;   // sync after this many unsynced counts
const SYNC_INTERVAL_MS = 30_000;   // sync at least every 30s
const MALA_ROUND = 108;

function sessionKey(mantraRef: string) {
  return `japa_session:${mantraRef}`;
}
function statsKey(mantraRef: string) {
  return `japa_stats:${mantraRef}`;
}
function todayLocalDate(tz: string): string {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: tz }); // YYYY-MM-DD
  } catch {
    return new Date().toLocaleDateString('en-CA');
  }
}

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface JapaEngineResult {
  sessionCount: number;
  todayCount: number;
  lifetimeCount: number;
  completedMalas: number;
  beadInRound: number;
  increment: () => void;
  completeSession: () => Promise<void>;
  isSyncing: boolean;
}

export interface UseJapaEngineOptions {
  mantraRef: string | null;
  sourceSurface: JapaSourceSurface;
  goalType?: JapaGoalType;
  goalValue?: number | null;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useJapaEngine({
  mantraRef,
  sourceSurface,
  goalType = 'unlimited',
  goalValue = null,
}: UseJapaEngineOptions): JapaEngineResult {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

  // ── React state (UI) ──────────────────────────────────────────────────────
  const [sessionCount, setSessionCount] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [lifetimeCount, setLifetimeCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  // ── Refs (mutable, not causing re-renders) ────────────────────────────────
  const serverSessionId = useRef<number | null>(null);
  const localSessionId = useRef<string>(uuidv4());
  const sessionCountRef = useRef(0);       // mirror of sessionCount for callbacks
  const lastSyncedCount = useRef(0);
  const lastSyncTimestamp = useRef<number>(0);
  const sessionStartedAt = useRef<number>(Date.now());
  const startPending = useRef(false);      // guards against double start
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Keep sessionCountRef in sync ──────────────────────────────────────────
  useEffect(() => {
    sessionCountRef.current = sessionCount;
  }, [sessionCount]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const persistSession = useCallback(
    (count: number) => {
      if (!mantraRef) return;
      const data: JapaLocalSession = {
        localSessionId: localSessionId.current,
        serverSessionId: serverSessionId.current,
        mantraRef,
        sourceSurface,
        goalType,
        goalValue: goalValue ?? null,
        sessionCount: count,
        lastSyncedCount: lastSyncedCount.current,
        sessionStartedAt: sessionStartedAt.current,
        todayLocalDate: todayLocalDate(tz),
        timezone: tz,
      };
      // fire-and-forget — don't block the tap
      AsyncStorage.setItem(sessionKey(mantraRef), JSON.stringify(data)).catch(() => {});
    },
    [goalType, goalValue, mantraRef, sourceSurface, tz],
  );

  const persistStats = useCallback(
    (today: number, lifetime: number) => {
      if (!mantraRef) return;
      const data: JapaLocalStats = {
        mantraRef,
        todayCount: today,
        weekCount: 0,
        lifetimeCount: lifetime,
        lastUpdated: Date.now(),
      };
      AsyncStorage.setItem(statsKey(mantraRef), JSON.stringify(data)).catch(() => {});
    },
    [mantraRef],
  );

  // ── Backend session start (non-blocking) ──────────────────────────────────

  const ensureSessionStarted = useCallback(async () => {
    if (typeof serverSessionId.current === 'number') return; // already have a valid ID
    if (startPending.current) return;
    if (!mantraRef) return;

    startPending.current = true;
    try {
      const resp = await japaStartSession({
        local_session_id: localSessionId.current,
        mantra_ref: mantraRef,
        source_surface: sourceSurface,
        goal_type: goalType,
        goal_value: goalValue ?? null,
        today_local_date: todayLocalDate(tz),
        timezone: tz,
      });
      if (resp) {
        serverSessionId.current = resp.session_id;
        // Update persisted session with server ID
        persistSession(sessionCountRef.current);
      }
    } catch {
      // swallow — will retry on next sync
    } finally {
      startPending.current = false;
    }
  }, [goalType, goalValue, mantraRef, persistSession, sourceSurface, tz]);

  // ── Sync batch ────────────────────────────────────────────────────────────

  const syncNow = useCallback(async () => {
    const currentCount = sessionCountRef.current;
    const delta = currentCount - lastSyncedCount.current;
    if (delta <= 0) return;
    if (typeof serverSessionId.current !== 'number') {
      // Server session not yet created — try to start it first
      await ensureSessionStarted();
      if (typeof serverSessionId.current !== 'number') return; // still not ready, skip
    }

    setIsSyncing(true);
    try {
      const idempotencyKey = uuidv4();
      const result = await japaSyncSession(serverSessionId.current, {
        delta_count: delta,
        cumulative_count: currentCount,
        idempotency_key: idempotencyKey,
        client_created_at: new Date().toISOString(),
        today_local_date: todayLocalDate(tz),
        timezone: tz,
        source_surface: sourceSurface,
      });

      if (result) {
        lastSyncedCount.current = currentCount;
        lastSyncTimestamp.current = Date.now();

        // Refresh stats from server response if available
        if (result.stats) {
          const newToday = result.stats.today_count;
          const newLifetime = result.stats.lifetime_count;
          setTodayCount(newToday);
          setLifetimeCount(newLifetime);
          persistStats(newToday, newLifetime);
        }
      }
    } catch {
      // swallow — will retry on next threshold
    } finally {
      setIsSyncing(false);
    }
  }, [ensureSessionStarted, persistStats, sourceSurface, tz]);

  // ── Initialize on mantraRef change ───────────────────────────────────────

  useEffect(() => {
    if (!mantraRef) return;

    // Reset session state for new mantra
    localSessionId.current = uuidv4();
    serverSessionId.current = null;
    startPending.current = false;
    lastSyncedCount.current = 0;
    lastSyncTimestamp.current = 0;
    sessionStartedAt.current = Date.now();
    setSessionCount(0);
    sessionCountRef.current = 0;

    // Load cached stats for this mantra from AsyncStorage
    AsyncStorage.getItem(statsKey(mantraRef))
      .then((raw) => {
        if (!raw) return;
        const parsed: JapaLocalStats = JSON.parse(raw);
        if (parsed.mantraRef === mantraRef) {
          setTodayCount(parsed.todayCount ?? 0);
          setLifetimeCount(parsed.lifetimeCount ?? 0);
        }
      })
      .catch(() => {});

    // Start server session non-blockingly
    ensureSessionStarted();

    // Start sync interval
    if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    syncTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - lastSyncTimestamp.current;
      if (elapsed >= SYNC_INTERVAL_MS && sessionCountRef.current > lastSyncedCount.current) {
        syncNow();
      }
    }, 10_000); // check every 10s, fire if 30s elapsed

    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
        syncTimerRef.current = null;
      }
    };
  }, [mantraRef, ensureSessionStarted, syncNow]);

  // ── Sync on app background ────────────────────────────────────────────────

  useEffect(() => {
    const handler = (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        if (sessionCountRef.current > lastSyncedCount.current) {
          syncNow();
        }
      }
    };
    const sub = AppState.addEventListener('change', handler);
    return () => sub.remove();
  }, [syncNow]);

  // ── Public API ────────────────────────────────────────────────────────────

  const increment = useCallback(() => {
    const newCount = sessionCountRef.current + 1;
    sessionCountRef.current = newCount;
    setSessionCount(newCount);

    // Haptic — light on every tap, medium at mala boundary
    if (newCount % MALA_ROUND === 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    // Persist crash-safe
    persistSession(newCount);

    // Sync if threshold reached
    const unsynced = newCount - lastSyncedCount.current;
    if (unsynced >= SYNC_COUNT_THRESHOLD) {
      syncNow();
    }
  }, [persistSession, syncNow]);

  const completeSession = useCallback(async () => {
    // Stop sync timer
    if (syncTimerRef.current) {
      clearInterval(syncTimerRef.current);
      syncTimerRef.current = null;
    }

    const finalCount = sessionCountRef.current;
    const durationMs = Date.now() - sessionStartedAt.current;

    // Ensure server session exists
    if (typeof serverSessionId.current !== 'number') {
      await ensureSessionStarted();
    }

    if (typeof serverSessionId.current === 'number') {
      const finalKey = uuidv4();
      await japaCompleteSession(serverSessionId.current, {
        final_count: finalCount,
        duration_ms: durationMs,
        completed_at: new Date().toISOString(),
        final_idempotency_key: finalKey,
        today_local_date: todayLocalDate(tz),
        timezone: tz,
      });

      // Refresh stats from backend after completion
      const statsResp = await japaGetStats(mantraRef ?? undefined);
      if (statsResp?.stats?.length) {
        const row = statsResp.stats.find((s) => s.mantra_ref === mantraRef);
        if (row) {
          setTodayCount(row.today_count);
          setLifetimeCount(row.lifetime_count);
          persistStats(row.today_count, row.lifetime_count);
        }
      }
    }

    // Clear local session from AsyncStorage
    if (mantraRef) {
      AsyncStorage.removeItem(sessionKey(mantraRef)).catch(() => {});
    }
  }, [ensureSessionStarted, mantraRef, persistStats, tz]);

  // ── Derived values ────────────────────────────────────────────────────────

  const completedMalas = Math.floor(sessionCount / MALA_ROUND);
  const beadInRound = sessionCount % MALA_ROUND;

  return {
    sessionCount,
    todayCount,
    lifetimeCount,
    completedMalas,
    beadInRound,
    increment,
    completeSession,
    isSyncing,
  };
}
