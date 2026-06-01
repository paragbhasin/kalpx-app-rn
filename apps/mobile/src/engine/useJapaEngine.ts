/**
 * useJapaEngine — Japa Counting Engine hook (Phase 1 complete)
 *
 * Powers all mantra counting across Quick Chant, Daily Rhythm, Inner Path,
 * and standalone Digital Mala. Every surface uses this same hook.
 *
 * Architecture:
 *   - sessionCount lives in React state → instant UI update on every tap
 *   - today/week/lifetime computed as (cachedBase + sessionCount) → also instant
 *   - cachedBase = what existed BEFORE this session (loaded from AsyncStorage)
 *   - After each sync: cachedBase = serverValue - sessionCount (keeps display correct)
 *   - Session state persisted to AsyncStorage on every tap (fire-and-forget)
 *   - Sync fires at SYNC_COUNT_THRESHOLD taps OR SYNC_INTERVAL_MS elapsed
 *   - Failed syncs queued in AsyncStorage → flushed when app returns to foreground
 *   - Undo stack: last 10 taps undoable within a session
 *   - Time goal: internal countdown timer, calls onGoalReached when expired
 *   - Count goal: detected in increment(), calls onGoalReached when hit
 *
 * Key invariant:
 *   todayCount = cachedTodayBase + sessionCount
 *   → increments on EVERY tap, never waits for backend
 *   → backend sync only adjusts the base, display stays smooth
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { v4 as uuidv4 } from 'uuid';

import type {
  JapaGoalType,
  JapaLocalSession,
  JapaLocalStats,
  JapaPendingBatch,
  JapaSourceSurface,
} from '@kalpx/types';
import {
  japaCompleteSession,
  japaGetStats,
  japaStartSession,
  japaSyncSession,
} from './japaApi';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SYNC_COUNT_THRESHOLD = 50;
const SYNC_INTERVAL_MS = 30_000;
const MALA_ROUND = 108;
const UNDO_STACK_MAX = 10;
const PENDING_QUEUE_KEY = 'japa_pending_queue';

// ---------------------------------------------------------------------------
// Storage key helpers
// ---------------------------------------------------------------------------

const sessionKey = (mantraRef: string) => `japa_session:${mantraRef}`;
const statsKey = (mantraRef: string) => `japa_stats:${mantraRef}`;

function todayLocalDate(tz: string): string {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: tz });
  } catch {
    return new Date().toLocaleDateString('en-CA');
  }
}

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface JapaEngineResult {
  // Counts
  sessionCount: number;
  todayCount: number;
  weekCount: number;
  lifetimeCount: number;
  // Mala
  completedMalas: number;
  beadInRound: number;
  malaRound: number;
  // Time goal
  elapsedMs: number;
  remainingMs: number | null;   // null when no time goal
  // State
  isSyncing: boolean;
  canUndo: boolean;
  // Actions
  increment: () => void;
  undo: () => void;
  completeSession: () => Promise<void>;
}

export interface UseJapaEngineOptions {
  mantraRef: string | null;
  sourceSurface: JapaSourceSurface;
  goalType?: JapaGoalType;
  goalValue?: number | null;        // seconds for 'time', count for 'count'
  onGoalReached?: () => void;       // called once when time/count goal is hit
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useJapaEngine({
  mantraRef,
  sourceSurface,
  goalType = 'unlimited',
  goalValue = null,
  onGoalReached,
}: UseJapaEngineOptions): JapaEngineResult {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';

  // Determine mala round: use goalValue for count goals, else default 108
  const malaRound = (goalType === 'count' && goalValue && goalValue > 0)
    ? goalValue
    : MALA_ROUND;

  // ── React state (drives re-renders) ───────────────────────────────────────
  const [sessionCount, setSessionCount] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  // ── Refs (mutable, no re-render) ──────────────────────────────────────────
  const serverSessionId = useRef<number | null>(null);
  const localSessionId = useRef<string>(uuidv4());
  const sessionCountRef = useRef(0);
  const lastSyncedCount = useRef(0);
  const lastSyncTimestamp = useRef<number>(0);
  const sessionStartedAt = useRef<number>(Date.now());
  const startPending = useRef(false);
  const syncTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const goalReachedRef = useRef(false);
  const undoStack = useRef<number[]>([]);

  // Baseline counts loaded from cache before this session began.
  // displayed today    = cachedTodayBase   + sessionCount  (updates every tap)
  // displayed week     = cachedWeekBase    + sessionCount  (updates every tap)
  // displayed lifetime = cachedLifetimeBase + sessionCount (updates every tap)
  // After sync: base = serverValue - sessionCount (keeps displayed value correct)
  const cachedTodayBase = useRef(0);
  const cachedWeekBase = useRef(0);
  const cachedLifetimeBase = useRef(0);

  // Keep sessionCountRef in sync with state
  useEffect(() => {
    sessionCountRef.current = sessionCount;
  }, [sessionCount]);

  // ── Persist helpers ───────────────────────────────────────────────────────

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
      AsyncStorage.setItem(sessionKey(mantraRef), JSON.stringify(data)).catch(() => {});
    },
    [goalType, goalValue, mantraRef, sourceSurface, tz],
  );

  // Persists the BASELINE (pre-session) counts, not the displayed counts.
  // On next session start these become the new baselines to add onto.
  const persistStats = useCallback(
    (todayBase: number, weekBase: number, lifetimeBase: number) => {
      if (!mantraRef) return;
      const data: JapaLocalStats = {
        mantraRef,
        todayCount: todayBase,
        weekCount: weekBase,
        lifetimeCount: lifetimeBase,
        lastUpdated: Date.now(),
      };
      AsyncStorage.setItem(statsKey(mantraRef), JSON.stringify(data)).catch(() => {});
    },
    [mantraRef],
  );

  // ── Offline queue ─────────────────────────────────────────────────────────

  const enqueuePendingBatch = useCallback(async (batch: JapaPendingBatch) => {
    try {
      const raw = await AsyncStorage.getItem(PENDING_QUEUE_KEY);
      const queue: JapaPendingBatch[] = raw ? JSON.parse(raw) : [];
      queue.push(batch);
      await AsyncStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(queue));
    } catch {
      // swallow — count is already in session state
    }
  }, []);

  const flushPendingQueue = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(PENDING_QUEUE_KEY);
      if (!raw) return;
      const queue: JapaPendingBatch[] = JSON.parse(raw);
      if (!queue.length) return;

      const remaining: JapaPendingBatch[] = [];
      for (const batch of queue) {
        const result = await japaSyncSession(batch.sessionId, {
          delta_count: batch.deltaCount,
          cumulative_count: batch.cumulativeCount,
          idempotency_key: batch.idempotencyKey,
          client_created_at: batch.clientCreatedAt,
          today_local_date: batch.todayLocalDate,
          timezone: batch.timezone,
          source_surface: batch.sourceSurface,
        });
        if (!result) {
          // Still failing — keep in queue, limit retries to 5
          if (batch.retryCount < 5) {
            remaining.push({ ...batch, retryCount: batch.retryCount + 1 });
          }
        }
      }

      if (remaining.length === 0) {
        await AsyncStorage.removeItem(PENDING_QUEUE_KEY);
      } else {
        await AsyncStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(remaining));
      }
    } catch {
      // swallow
    }
  }, []);

  // ── Backend session start (non-blocking) ──────────────────────────────────

  const ensureSessionStarted = useCallback(async () => {
    if (typeof serverSessionId.current === 'number') return;
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
        persistSession(sessionCountRef.current);
      }
    } catch {
      // will retry on next sync
    } finally {
      startPending.current = false;
    }
  }, [goalType, goalValue, mantraRef, persistSession, sourceSurface, tz]);

  // ── Core sync ─────────────────────────────────────────────────────────────

  const syncNow = useCallback(async () => {
    const currentCount = sessionCountRef.current;
    const delta = currentCount - lastSyncedCount.current;
    if (delta <= 0) return;

    if (typeof serverSessionId.current !== 'number') {
      await ensureSessionStarted();
      if (typeof serverSessionId.current !== 'number') return;
    }

    setIsSyncing(true);
    const idempotencyKey = uuidv4();
    const todayDate = todayLocalDate(tz);
    const clientCreatedAt = new Date().toISOString();

    try {
      const result = await japaSyncSession(serverSessionId.current, {
        delta_count: delta,
        cumulative_count: currentCount,
        idempotency_key: idempotencyKey,
        client_created_at: clientCreatedAt,
        today_local_date: todayDate,
        timezone: tz,
        source_surface: sourceSurface,
      });

      if (result) {
        lastSyncedCount.current = currentCount;
        lastSyncTimestamp.current = Date.now();

        if (result.stats) {
          // Server's today_count INCLUDES the counts we just synced.
          // Set base = serverValue - sessionCount so that:
          //   displayed = base + sessionCount = serverValue (correct)
          // and future taps keep adding on top instantly.
          const sc = sessionCountRef.current;
          cachedTodayBase.current = result.stats.today_count - sc;
          cachedWeekBase.current = result.stats.week_count - sc;
          cachedLifetimeBase.current = result.stats.lifetime_count - sc;
          // Persist bases (not displayed values) for next session startup
          persistStats(cachedTodayBase.current, cachedWeekBase.current, cachedLifetimeBase.current);
          // Force a re-render so the displayed counts (base + sessionCount) refresh
          setSessionCount((c) => c);
        }
      } else {
        // Network failure — enqueue for retry
        await enqueuePendingBatch({
          sessionId: serverSessionId.current,
          deltaCount: delta,
          cumulativeCount: currentCount,
          idempotencyKey,
          clientCreatedAt,
          todayLocalDate: todayDate,
          timezone: tz,
          sourceSurface,
          retryCount: 0,
        });
      }
    } catch {
      await enqueuePendingBatch({
        sessionId: serverSessionId.current as number,
        deltaCount: delta,
        cumulativeCount: currentCount,
        idempotencyKey,
        clientCreatedAt,
        todayLocalDate: todayDate,
        timezone: tz,
        sourceSurface,
        retryCount: 0,
      });
    } finally {
      setIsSyncing(false);
    }
  }, [enqueuePendingBatch, ensureSessionStarted, persistStats, sourceSurface, tz]);

  // ── Initialise on mantraRef change ────────────────────────────────────────

  useEffect(() => {
    if (!mantraRef) return;

    // Reset for new mantra/session
    localSessionId.current = uuidv4();
    serverSessionId.current = null;
    startPending.current = false;
    lastSyncedCount.current = 0;
    lastSyncTimestamp.current = 0;
    sessionStartedAt.current = Date.now();
    goalReachedRef.current = false;
    undoStack.current = [];
    cachedTodayBase.current = 0;
    cachedWeekBase.current = 0;
    cachedLifetimeBase.current = 0;

    setSessionCount(0);
    sessionCountRef.current = 0;
    setElapsedMs(0);
    setCanUndo(false);

    // Load cached baselines from AsyncStorage.
    // These are the counts BEFORE this session — sessionCount starts at 0
    // so displayed = base + 0 = base on first render.
    AsyncStorage.getItem(statsKey(mantraRef))
      .then((raw) => {
        if (!raw) return;
        const parsed: JapaLocalStats = JSON.parse(raw);
        if (parsed.mantraRef === mantraRef) {
          cachedTodayBase.current = parsed.todayCount ?? 0;
          cachedWeekBase.current = parsed.weekCount ?? 0;
          cachedLifetimeBase.current = parsed.lifetimeCount ?? 0;
          // Trigger a re-render so the computed displayed values update
          setSessionCount((c) => c);
        }
      })
      .catch(() => {});

    ensureSessionStarted();

    // Sync interval — checks every 10s, fires if 30s elapsed since last sync
    if (syncTimerRef.current) clearInterval(syncTimerRef.current);
    syncTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - lastSyncTimestamp.current;
      if (elapsed >= SYNC_INTERVAL_MS && sessionCountRef.current > lastSyncedCount.current) {
        syncNow();
      }
    }, 10_000);

    // Elapsed timer — ticks every second
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    elapsedTimerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - sessionStartedAt.current);
    }, 1_000);

    return () => {
      if (syncTimerRef.current) { clearInterval(syncTimerRef.current); syncTimerRef.current = null; }
      if (elapsedTimerRef.current) { clearInterval(elapsedTimerRef.current); elapsedTimerRef.current = null; }
    };
  }, [mantraRef, ensureSessionStarted, syncNow]);

  // ── Time goal countdown & auto-completion ─────────────────────────────────

  useEffect(() => {
    if (goalType !== 'time' || !goalValue || goalReachedRef.current) return;
    const goalMs = goalValue * 1000;
    if (elapsedMs >= goalMs) {
      goalReachedRef.current = true;
      onGoalReached?.();
    }
  }, [elapsedMs, goalType, goalValue, onGoalReached]);

  // ── AppState — sync on background, flush queue on foreground ─────────────

  useEffect(() => {
    const handler = (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        if (sessionCountRef.current > lastSyncedCount.current) {
          syncNow();
        }
      } else if (state === 'active') {
        // App returned to foreground — flush any queued offline batches
        flushPendingQueue();
      }
    };
    const sub = AppState.addEventListener('change', handler);
    return () => sub.remove();
  }, [flushPendingQueue, syncNow]);

  // ── Public actions ────────────────────────────────────────────────────────

  const increment = useCallback(() => {
    const prev = sessionCountRef.current;
    const newCount = prev + 1;

    // Push to undo stack (cap at UNDO_STACK_MAX)
    undoStack.current = [...undoStack.current.slice(-(UNDO_STACK_MAX - 1)), prev];
    setCanUndo(true);

    sessionCountRef.current = newCount;
    setSessionCount(newCount);

    // Haptic — medium at mala boundary, light otherwise
    if (newCount % malaRound === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    persistSession(newCount);

    // Count goal detection
    if (goalType === 'count' && goalValue && newCount >= goalValue && !goalReachedRef.current) {
      goalReachedRef.current = true;
      onGoalReached?.();
    }

    // Sync threshold
    if (newCount - lastSyncedCount.current >= SYNC_COUNT_THRESHOLD) {
      syncNow();
    }
  }, [goalType, goalValue, malaRound, onGoalReached, persistSession, syncNow]);

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return;

    const previous = undoStack.current[undoStack.current.length - 1];
    undoStack.current = undoStack.current.slice(0, -1);

    sessionCountRef.current = previous;
    setSessionCount(previous);
    setCanUndo(undoStack.current.length > 0);

    // Undo haptic
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    persistSession(previous);
    // Note: undo does not affect lastSyncedCount — the next sync will send
    // cumulative_count which the backend takes as max(synced_count, cumulative_count).
    // Undo within the unsynced window is purely local.
  }, [persistSession]);

  const completeSession = useCallback(async () => {
    // Stop all timers
    if (syncTimerRef.current) { clearInterval(syncTimerRef.current); syncTimerRef.current = null; }
    if (elapsedTimerRef.current) { clearInterval(elapsedTimerRef.current); elapsedTimerRef.current = null; }

    const finalCount = sessionCountRef.current;
    const durationMs = Date.now() - sessionStartedAt.current;

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

      // Refresh stats from server after completion.
      // Session is over so sessionCount won't change — store server values
      // directly as the new baselines for the NEXT session.
      const statsResp = await japaGetStats(mantraRef ?? undefined);
      if (statsResp?.stats?.length) {
        const row = statsResp.stats.find((s) => s.mantra_ref === mantraRef);
        if (row) {
          // After completion sessionCount is frozen — use server values as next-session bases
          cachedTodayBase.current = row.today_count - finalCount;
          cachedWeekBase.current = row.week_count - finalCount;
          cachedLifetimeBase.current = row.lifetime_count - finalCount;
          persistStats(cachedTodayBase.current, cachedWeekBase.current, cachedLifetimeBase.current);
        }
      }
    }

    if (mantraRef) {
      AsyncStorage.removeItem(sessionKey(mantraRef)).catch(() => {});
    }

    // Flush any remaining queued batches
    await flushPendingQueue();
  }, [ensureSessionStarted, flushPendingQueue, mantraRef, persistStats, tz]);

  // ── Derived values ────────────────────────────────────────────────────────
  // today/week/lifetime computed from baseline + current session count.
  // This means they increment on EVERY tap — never wait for the backend.

  const todayCount = Math.max(0, cachedTodayBase.current) + sessionCount;
  const weekCount = Math.max(0, cachedWeekBase.current) + sessionCount;
  const lifetimeCount = Math.max(0, cachedLifetimeBase.current) + sessionCount;

  const completedMalas = Math.floor(sessionCount / malaRound);
  const beadInRound = sessionCount % malaRound;
  const remainingMs = (goalType === 'time' && goalValue)
    ? Math.max(0, goalValue * 1000 - elapsedMs)
    : null;

  return {
    sessionCount,
    todayCount,
    weekCount,
    lifetimeCount,
    completedMalas,
    beadInRound,
    malaRound,
    elapsedMs,
    remainingMs,
    isSyncing,
    canUndo,
    increment,
    undo,
    completeSession,
  };
}
