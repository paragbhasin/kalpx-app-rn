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
const SYNC_INTERVAL_MS = 60_000;  // 60s safety-net — screen blur/focus now handle the common case
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
  yearCount: number;
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
  // Navigation hooks — call these from useFocusEffect in the screen
  syncNow: () => Promise<void>;       // flush unsynced delta → call on screen blur
  refreshStats: () => Promise<void>;  // fetch fresh stats from server → call on screen focus
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
  // sessionCount STARTS at cachedTodayBase so the big counter = today's running total.
  // sessionInitialCount = the value sessionCount started at (= cachedTodayBase at init).
  // delta for sync = sessionCount - lastSyncedCount (only new chants, never the baseline).
  // displayed week     = cachedWeekBase    + newChants  (newChants = sessionCount - sessionInitialCount)
  // displayed lifetime = cachedLifetimeBase + newChants
  // After sync: adjust bases so display stays consistent with server.
  const cachedTodayBase = useRef(0);
  const cachedWeekBase = useRef(0);
  const cachedYearBase = useRef(0);
  const cachedLifetimeBase = useRef(0);
  const sessionInitialCount = useRef(0); // snapshot of cachedTodayBase at session start

  // Tracks the active mantraRef so stale async callbacks (sync, refreshStats,
  // AsyncStorage loads) can detect they've been superseded and bail out before
  // mutating shared refs with the wrong mantra's data.
  const currentMantraRef = useRef<string | null>(mantraRef);
  useEffect(() => {
    currentMantraRef.current = mantraRef;
  }, [mantraRef]);

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
    (todayBase: number, weekBase: number, yearBase: number, lifetimeBase: number) => {
      if (!mantraRef) return;
      const data: JapaLocalStats = {
        mantraRef,
        todayCount: todayBase,
        weekCount: weekBase,
        yearCount: yearBase,
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
        // Skip batches without a server session ID (Watch offline-start batches
        // waiting for phone to relay session start). They stay in queue until resolved.
        if (batch.sessionId === null) {
          remaining.push(batch);
          continue;
        }
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
    // cumulative_count is relative to this server session (starts at 0).
    // newChantsSoFar = total taps since session started, excluding the baseline.
    const newChantsSoFar = Math.max(0, currentCount - sessionInitialCount.current);

    try {
      const result = await japaSyncSession(serverSessionId.current, {
        delta_count: delta,
        cumulative_count: newChantsSoFar,
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
          // Guard: if the user switched mantra while this sync was in-flight,
          // do NOT write to shared refs — they now belong to the new mantra.
          if (result.stats.mantra_ref !== currentMantraRef.current) return;

          const sc = sessionCountRef.current;
          const nc = Math.max(0, sc - sessionInitialCount.current); // new chants so far
          // Update week/year/lifetime bases so their displayed values match server
          cachedWeekBase.current = result.stats.week_count - nc;
          cachedYearBase.current = result.stats.year_count - nc;
          cachedLifetimeBase.current = result.stats.lifetime_count - nc;
          // If server's today_count differs from sessionCount (e.g. another device added
          // counts), reconcile by bumping sessionCount to match server.
          if (result.stats.today_count !== sc) {
            const serverToday = result.stats.today_count;
            sessionInitialCount.current = serverToday - nc; // adjust initial so newChants stays correct
            sessionCountRef.current = serverToday;
            setSessionCount(serverToday);
            lastSyncedCount.current = serverToday;
          }
          // Persist baselines for next session startup (store server-confirmed today as base)
          persistStats(
            result.stats.today_count - nc, // next session's today base
            cachedWeekBase.current,
            cachedYearBase.current,
            cachedLifetimeBase.current,
          );
        }
      } else {
        // Network failure — enqueue for retry
        await enqueuePendingBatch({
          sessionId: serverSessionId.current,
          localSessionId: localSessionId.current,
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
        sessionId: serverSessionId.current,
        localSessionId: localSessionId.current,
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

  // ── Refresh stats from server (call on screen focus) ──────────────────────

  const refreshStats = useCallback(async () => {
    if (!mantraRef) return;
    try {
      const statsResp = await japaGetStats(mantraRef, sourceSurface);

      // Guard: mantra switched while request was in-flight — don't touch shared refs.
      if (mantraRef !== currentMantraRef.current) return;

      const row = statsResp?.stats?.find((s) => s.mantra_ref === mantraRef);

      if (!row) {
        // Server has no history for this mantra. If no new chants have been tapped
        // this session, any non-zero base is stale local cache (e.g. after account
        // deletion + re-signup with same login). Zero it out so the display is correct.
        const nc = Math.max(0, sessionCountRef.current - sessionInitialCount.current);
        if (nc === 0) {
          cachedWeekBase.current = 0;
          cachedYearBase.current = 0;
          cachedLifetimeBase.current = 0;
          sessionInitialCount.current = 0;
          sessionCountRef.current = 0;
          lastSyncedCount.current = 0;
          setSessionCount(0);
          persistStats(0, 0, 0, 0);
        }
        return;
      }

      const sc = sessionCountRef.current;
      const nc = Math.max(0, sc - sessionInitialCount.current);

      // Update baselines so displayed values match server + any unsynced local taps
      cachedWeekBase.current = row.week_count - nc;
      cachedYearBase.current = row.year_count - nc;
      cachedLifetimeBase.current = row.lifetime_count - nc;

      // Reconcile today: if server's today_count > sessionCount, another device/session
      // added counts — bump our sessionCount to match so user sees the latest total
      if (row.today_count > sc) {
        const gap = row.today_count - sc;
        sessionInitialCount.current = sessionInitialCount.current + gap;
        sessionCountRef.current = row.today_count;
        lastSyncedCount.current = row.today_count;
        setSessionCount(row.today_count);
      }

      // Persist updated baselines to AsyncStorage
      persistStats(
        row.today_count - Math.max(0, sessionCountRef.current - sessionInitialCount.current),
        cachedWeekBase.current,
        cachedYearBase.current,
        cachedLifetimeBase.current,
      );

      // Trigger re-render for week/lifetime
      setSessionCount((c) => c);
    } catch {
      // swallow — stale local values remain, not a critical failure
    }
  }, [mantraRef, persistStats]);

  // ── Initialise on mantraRef change ────────────────────────────────────────

  useEffect(() => {
    if (!mantraRef) return;

    // Reset for new mantra/session
    localSessionId.current = uuidv4();
    serverSessionId.current = null;
    startPending.current = false;
    lastSyncTimestamp.current = 0;
    sessionStartedAt.current = Date.now();
    goalReachedRef.current = false;
    undoStack.current = [];
    cachedTodayBase.current = 0;
    cachedWeekBase.current = 0;
    cachedYearBase.current = 0;
    cachedLifetimeBase.current = 0;
    sessionInitialCount.current = 0;

    // Start session at 0 first; will be updated to today's base after AsyncStorage loads.
    setSessionCount(0);
    sessionCountRef.current = 0;
    lastSyncedCount.current = 0;
    setElapsedMs(0);
    setCanUndo(false);

    // Load cached baselines + any in-progress session (taps before first sync).
    // statsKey = synced baseline (updated every sync).
    // sessionKey = every-tap crash-safe state — may have unsynced taps above the baseline.
    Promise.all([
      AsyncStorage.getItem(statsKey(mantraRef)),
      AsyncStorage.getItem(sessionKey(mantraRef)),
    ]).then(([statsRaw, sessionRaw]) => {
      if (mantraRef !== currentMantraRef.current) return;

      let todayBase = 0, weekBase = 0, yearBase = 0, lifetimeBase = 0;
      if (statsRaw) {
        try {
          const s: JapaLocalStats = JSON.parse(statsRaw);
          if (s.mantraRef === mantraRef) {
            todayBase    = s.todayCount    ?? 0;
            weekBase     = s.weekCount     ?? 0;
            yearBase     = s.yearCount     ?? 0;
            lifetimeBase = s.lifetimeCount ?? 0;
          }
        } catch { /* ignore */ }
      }

      // Recover in-progress session: if the persisted sessionCount is higher than the
      // synced baseline, the user had unsynced taps — restore them so the count
      // doesn't reset to 0 on re-mount.
      let resumeCount = todayBase;
      if (sessionRaw) {
        try {
          const sess: JapaLocalSession = JSON.parse(sessionRaw);
          if (sess.mantraRef === mantraRef && sess.sessionCount > todayBase) {
            resumeCount = sess.sessionCount;
            // Restore server session ID so the next sync goes to the right session
            if (typeof sess.serverSessionId === 'number') {
              serverSessionId.current = sess.serverSessionId;
            }
            if (typeof sess.localSessionId === 'string') {
              localSessionId.current = sess.localSessionId;
            }
            lastSyncedCount.current = sess.lastSyncedCount ?? todayBase;
          }
        } catch { /* ignore */ }
      }

      cachedTodayBase.current    = todayBase;
      cachedWeekBase.current     = weekBase;
      cachedYearBase.current     = yearBase;
      cachedLifetimeBase.current = lifetimeBase;
      sessionInitialCount.current = todayBase;
      sessionCountRef.current    = resumeCount;
      if (resumeCount === todayBase) {
        lastSyncedCount.current = todayBase;
      }
      setSessionCount(resumeCount);
    }).catch(() => {});

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

    // newChants = only what the user tapped this session (NOT the starting baseline).
    // This is what the server needs — it starts its session count at 0.
    const newChants = Math.max(0, sessionCountRef.current - sessionInitialCount.current);
    const durationMs = Date.now() - sessionStartedAt.current;

    // Nothing new chanted — skip server call entirely, just clear local state
    if (newChants === 0) {
      if (mantraRef) AsyncStorage.removeItem(sessionKey(mantraRef)).catch(() => {});
      await flushPendingQueue();
      return;
    }

    if (typeof serverSessionId.current !== 'number') {
      await ensureSessionStarted();
    }

    if (typeof serverSessionId.current === 'number') {
      const finalKey = uuidv4();
      await japaCompleteSession(serverSessionId.current, {
        final_count: newChants,          // server counts from 0, send only new chants
        duration_ms: durationMs,
        completed_at: new Date().toISOString(),
        final_idempotency_key: finalKey,
        today_local_date: todayLocalDate(tz),
        timezone: tz,
      });

      // Refresh stats — next session will start from server's confirmed today_count
      const statsResp = await japaGetStats(mantraRef ?? undefined, sourceSurface);
      if (statsResp?.stats?.length) {
        const row = statsResp.stats.find((s) => s.mantra_ref === mantraRef);
        if (row) {
          persistStats(
            row.today_count,
            row.week_count - newChants,
            row.year_count - newChants,
            row.lifetime_count - newChants,
          );
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
  // sessionCount starts at today's existing count → it IS today's running total.
  // newChants = only what happened this session (excludes the starting baseline).
  // todayCount = sessionCount (same thing — the big number)
  // week/lifetime add only the new chants on top of their own baselines.

  const newChants = Math.max(0, sessionCount - sessionInitialCount.current);
  const todayCount = sessionCount;   // big number = today's total
  const weekCount = Math.max(0, cachedWeekBase.current) + newChants;
  const yearCount = Math.max(0, cachedYearBase.current) + newChants;
  const lifetimeCount = Math.max(0, cachedLifetimeBase.current) + newChants;

  const completedMalas = Math.floor(sessionCount / malaRound);
  const beadInRound = sessionCount % malaRound;
  const remainingMs = (goalType === 'time' && goalValue)
    ? Math.max(0, goalValue * 1000 - elapsedMs)
    : null;

  return {
    sessionCount,
    todayCount,
    weekCount,
    yearCount,
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
    syncNow,
    refreshStats,
  };
}
