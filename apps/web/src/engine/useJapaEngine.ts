/**
 * useJapaEngine — web port of apps/mobile/src/engine/useJapaEngine.ts
 *
 * Identical architecture: optimistic local counts, periodic backend sync,
 * offline queue, undo stack. Web adaptations:
 *   - AsyncStorage  → localStorage  (sync reads, async writes via queueMicrotask)
 *   - AppState      → document visibilitychange
 *   - Haptics       → removed
 *   - uuid          → crypto.randomUUID()
 */

import { useCallback, useEffect, useRef, useState } from 'react';
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

const SYNC_COUNT_THRESHOLD = 50;
const SYNC_INTERVAL_MS = 60_000;
const MALA_ROUND = 108;
const UNDO_STACK_MAX = 10;
const PENDING_QUEUE_KEY = 'japa_pending_queue';

const sessionKey = (m: string) => `japa_session:${m}`;
const statsKey   = (m: string) => `japa_stats:${m}`;

function todayLocalDate(tz: string): string {
  try {
    return new Date().toLocaleDateString('en-CA', { timeZone: tz });
  } catch {
    return new Date().toLocaleDateString('en-CA');
  }
}

function randomUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function lsGet(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
function lsSet(key: string, value: string): void {
  try { localStorage.setItem(key, value); } catch { /* quota */ }
}
function lsRemove(key: string): void {
  try { localStorage.removeItem(key); } catch { /* ignore */ }
}

// ── Public interface ──────────────────────────────────────────────────────────

export interface JapaEngineResult {
  sessionCount: number;
  todayCount: number;
  weekCount: number;
  yearCount: number;
  lifetimeCount: number;
  completedMalas: number;
  beadInRound: number;
  malaRound: number;
  elapsedMs: number;
  remainingMs: number | null;
  isSyncing: boolean;
  canUndo: boolean;
  increment: () => void;
  undo: () => void;
  completeSession: () => Promise<void>;
  syncNow: () => Promise<void>;
  refreshStats: () => Promise<void>;
}

export interface UseJapaEngineOptions {
  mantraRef: string | null;
  sourceSurface: JapaSourceSurface;
  goalType?: JapaGoalType;
  goalValue?: number | null;
  onGoalReached?: () => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useJapaEngine({
  mantraRef,
  sourceSurface,
  goalType = 'unlimited',
  goalValue = null,
  onGoalReached,
}: UseJapaEngineOptions): JapaEngineResult {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
  const malaRound = (goalType === 'count' && goalValue && goalValue > 0) ? goalValue : MALA_ROUND;

  const [sessionCount, setSessionCount] = useState(0);
  const [elapsedMs, setElapsedMs]       = useState(0);
  const [isSyncing, setIsSyncing]       = useState(false);
  const [canUndo, setCanUndo]           = useState(false);
  const [statsRevision, setStatsRevision] = useState(0);

  const serverSessionId   = useRef<number | null>(null);
  const localSessionId    = useRef<string>(randomUUID());
  const sessionCountRef   = useRef(0);
  const lastSyncedCount   = useRef(0);
  const lastSyncTimestamp = useRef<number>(0);
  const sessionStartedAt  = useRef<number>(Date.now());
  const startPending      = useRef(false);
  const syncTimerRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedTimerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const goalReachedRef    = useRef(false);
  const undoStack         = useRef<number[]>([]);

  const cachedTodayBase    = useRef(0);
  const cachedWeekBase     = useRef(0);
  const cachedYearBase     = useRef(0);
  const cachedLifetimeBase = useRef(0);
  const sessionInitialCount = useRef(0);
  const currentMantraRef   = useRef<string | null>(mantraRef);
  // Stable callback refs — updated after every render so the init effect never
  // needs ensureSessionStarted/syncNow as deps (avoids spurious re-inits).
  const ensureSessionStartedRef = useRef<() => Promise<void>>(async () => {});
  const syncNowRef              = useRef<() => Promise<void>>(async () => {});

  useEffect(() => { currentMantraRef.current = mantraRef; }, [mantraRef]);
  useEffect(() => { sessionCountRef.current = sessionCount; }, [sessionCount]);

  // ── Persist helpers ───────────────────────────────────────────────────────

  const persistSession = useCallback((count: number) => {
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
    lsSet(sessionKey(mantraRef), JSON.stringify(data));
  }, [goalType, goalValue, mantraRef, sourceSurface, tz]);

  const persistStats = useCallback((
    todayBase: number, weekBase: number, yearBase: number, lifetimeBase: number,
  ) => {
    if (!mantraRef) return;
    const data: JapaLocalStats = {
      mantraRef,
      todayCount: todayBase,
      weekCount: weekBase,
      yearCount: yearBase,
      lifetimeCount: lifetimeBase,
      lastUpdated: Date.now(),
      todayLocalDate: todayLocalDate(tz),
    };
    lsSet(statsKey(mantraRef), JSON.stringify(data));
  }, [mantraRef, tz]);

  // ── Offline queue ─────────────────────────────────────────────────────────

  const enqueuePendingBatch = useCallback((batch: JapaPendingBatch) => {
    try {
      const raw = lsGet(PENDING_QUEUE_KEY);
      const queue: JapaPendingBatch[] = raw ? JSON.parse(raw) : [];
      queue.push(batch);
      lsSet(PENDING_QUEUE_KEY, JSON.stringify(queue));
    } catch { /* ignore */ }
  }, []);

  const flushPendingQueue = useCallback(async () => {
    try {
      const raw = lsGet(PENDING_QUEUE_KEY);
      if (!raw) return;
      const queue: JapaPendingBatch[] = JSON.parse(raw);
      if (!queue.length) return;
      const remaining: JapaPendingBatch[] = [];
      for (const batch of queue) {
        if (batch.sessionId === null) { remaining.push(batch); continue; }
        const result = await japaSyncSession(batch.sessionId, {
          delta_count: batch.deltaCount,
          cumulative_count: batch.cumulativeCount,
          idempotency_key: batch.idempotencyKey,
          client_created_at: batch.clientCreatedAt,
          today_local_date: batch.todayLocalDate,
          timezone: batch.timezone,
          source_surface: batch.sourceSurface,
        });
        if (!result && batch.retryCount < 5) {
          remaining.push({ ...batch, retryCount: batch.retryCount + 1 });
        }
      }
      if (remaining.length === 0) lsRemove(PENDING_QUEUE_KEY);
      else lsSet(PENDING_QUEUE_KEY, JSON.stringify(remaining));
    } catch { /* ignore */ }
  }, []);

  // ── Session start ─────────────────────────────────────────────────────────

  const ensureSessionStarted = useCallback(async () => {
    if (typeof serverSessionId.current === 'number') return;
    if (startPending.current || !mantraRef) return;
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
    } catch { /* ignore */ }
    finally { startPending.current = false; }
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
    const idempotencyKey = randomUUID();
    const todayDate = todayLocalDate(tz);
    const clientCreatedAt = new Date().toISOString();
    const newChantsSoFar = Math.max(0, currentCount - sessionInitialCount.current);

    try {
      const result = await japaSyncSession(serverSessionId.current!, {
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
          if (result.stats.mantra_ref !== currentMantraRef.current) return;
          const sc = sessionCountRef.current;
          const nc = Math.max(0, sc - sessionInitialCount.current);
          cachedWeekBase.current    = result.stats.week_count - nc;
          cachedYearBase.current    = result.stats.year_count - nc;
          cachedLifetimeBase.current = result.stats.lifetime_count - nc;
          if (result.stats.today_count !== sc) {
            const serverToday = result.stats.today_count;
            sessionInitialCount.current = serverToday - nc;
            sessionCountRef.current = serverToday;
            setSessionCount(serverToday);
            lastSyncedCount.current = serverToday;
          }
          persistStats(result.stats.today_count - nc, cachedWeekBase.current, cachedYearBase.current, cachedLifetimeBase.current);
        }
      } else {
        enqueuePendingBatch({ sessionId: serverSessionId.current!, localSessionId: localSessionId.current, deltaCount: delta, cumulativeCount: currentCount, idempotencyKey, clientCreatedAt, todayLocalDate: todayDate, timezone: tz, sourceSurface, retryCount: 0 });
      }
    } catch {
      enqueuePendingBatch({ sessionId: serverSessionId.current!, localSessionId: localSessionId.current, deltaCount: delta, cumulativeCount: currentCount, idempotencyKey, clientCreatedAt: new Date().toISOString(), todayLocalDate: todayDate, timezone: tz, sourceSurface, retryCount: 0 });
    } finally {
      setIsSyncing(false);
    }
  }, [enqueuePendingBatch, ensureSessionStarted, persistStats, sourceSurface, tz]);

  // Keep stable refs current so the init effect always calls the latest version.
  useEffect(() => {
    ensureSessionStartedRef.current = ensureSessionStarted;
    syncNowRef.current = syncNow;
  });

  // ── Refresh stats ─────────────────────────────────────────────────────────

  const refreshStats = useCallback(async () => {
    if (!mantraRef) return;
    try {
      const statsResp = await japaGetStats(mantraRef, sourceSurface);
      if (mantraRef !== currentMantraRef.current) return;

      const row = statsResp?.stats?.find((s) => s.mantra_ref === mantraRef);
      if (!row) {
        const nc = Math.max(0, sessionCountRef.current - sessionInitialCount.current);
        if (nc === 0) {
          cachedWeekBase.current = cachedYearBase.current = cachedLifetimeBase.current = 0;
          sessionInitialCount.current = sessionCountRef.current = lastSyncedCount.current = 0;
          setSessionCount(0);
          persistStats(0, 0, 0, 0);
        }
        return;
      }

      const sc = sessionCountRef.current;
      const nc = Math.max(0, sc - sessionInitialCount.current);
      cachedWeekBase.current    = row.week_count - nc;
      cachedYearBase.current    = row.year_count - nc;
      cachedLifetimeBase.current = row.lifetime_count - nc;

      if (row.today_count > sc) {
        const gap = row.today_count - sc;
        sessionInitialCount.current += gap;
        sessionCountRef.current = row.today_count;
        lastSyncedCount.current = row.today_count;
        setSessionCount(row.today_count);
      } else if (row.today_count < sessionInitialCount.current) {
        sessionInitialCount.current = row.today_count;
        sessionCountRef.current = row.today_count + nc;
        lastSyncedCount.current = row.today_count;
        setSessionCount(row.today_count + nc);
      }

      persistStats(
        row.today_count - Math.max(0, sessionCountRef.current - sessionInitialCount.current),
        cachedWeekBase.current,
        cachedYearBase.current,
        cachedLifetimeBase.current,
      );
      // Force re-render so week/year/lifetime (computed from refs) update in the UI.
      // setSessionCount((c) => c) is a React 18 no-op when c===0; use a dedicated counter.
      setStatsRevision((r) => r + 1);
    } catch { /* ignore */ }
  }, [mantraRef, persistStats, sourceSurface]);

  // ── Init on mantraRef change ───────────────────────────────────────────────

  useEffect(() => {
    if (!mantraRef) return;

    localSessionId.current  = randomUUID();
    serverSessionId.current = null;
    startPending.current    = false;
    lastSyncTimestamp.current = Date.now();
    sessionStartedAt.current  = Date.now();
    goalReachedRef.current    = false;
    undoStack.current         = [];
    cachedTodayBase.current = cachedWeekBase.current = cachedYearBase.current = cachedLifetimeBase.current = 0;
    sessionInitialCount.current = 0;
    setSessionCount(0);
    sessionCountRef.current = lastSyncedCount.current = 0;
    setElapsedMs(0);
    setCanUndo(false);

    // Load cached baselines
    const statsRaw   = lsGet(statsKey(mantraRef));
    const sessionRaw = lsGet(sessionKey(mantraRef));

    let todayBase = 0, weekBase = 0, yearBase = 0, lifetimeBase = 0;
    if (statsRaw) {
      try {
        const s: JapaLocalStats = JSON.parse(statsRaw);
        if (s.mantraRef === mantraRef) {
          const isNewDay = s.todayLocalDate && s.todayLocalDate !== todayLocalDate(tz);
          todayBase    = isNewDay ? 0 : (s.todayCount    ?? 0);
          weekBase     = s.weekCount     ?? 0;
          yearBase     = s.yearCount     ?? 0;
          lifetimeBase = s.lifetimeCount ?? 0;
        }
      } catch { /* ignore */ }
    }

    let resumeCount = todayBase;
    if (sessionRaw) {
      try {
        const sess: JapaLocalSession = JSON.parse(sessionRaw);
        if (sess.mantraRef === mantraRef && sess.sessionCount > todayBase) {
          resumeCount = sess.sessionCount;
          if (typeof sess.serverSessionId === 'number') serverSessionId.current = sess.serverSessionId;
          if (typeof sess.localSessionId  === 'string') localSessionId.current  = sess.localSessionId;
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
    if (resumeCount === todayBase) lastSyncedCount.current = todayBase;
    setSessionCount(resumeCount);

    void ensureSessionStartedRef.current();

    if (syncTimerRef.current)    clearInterval(syncTimerRef.current);
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);

    syncTimerRef.current = setInterval(() => {
      if (Date.now() - lastSyncTimestamp.current >= SYNC_INTERVAL_MS &&
          sessionCountRef.current > lastSyncedCount.current) {
        void syncNowRef.current();
      }
    }, 10_000);

    elapsedTimerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - sessionStartedAt.current);
    }, 1_000);

    return () => {
      if (syncTimerRef.current)    { clearInterval(syncTimerRef.current);    syncTimerRef.current    = null; }
      if (elapsedTimerRef.current) { clearInterval(elapsedTimerRef.current); elapsedTimerRef.current = null; }
    };
    // Only mantraRef and tz should trigger re-initialization — NOT callback refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mantraRef, tz]);

  // ── Time goal ─────────────────────────────────────────────────────────────

  useEffect(() => {
    if (goalType !== 'time' || !goalValue || goalReachedRef.current) return;
    if (elapsedMs >= goalValue * 1000) {
      goalReachedRef.current = true;
      onGoalReached?.();
    }
  }, [elapsedMs, goalType, goalValue, onGoalReached]);

  // ── Visibility change (sync on hide, flush on show) ───────────────────────

  useEffect(() => {
    const handler = () => {
      if (document.hidden) {
        if (sessionCountRef.current > lastSyncedCount.current) syncNow();
      } else {
        flushPendingQueue();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [flushPendingQueue, syncNow]);

  // ── Actions ───────────────────────────────────────────────────────────────

  const increment = useCallback(() => {
    const prev = sessionCountRef.current;
    const newCount = prev + 1;
    undoStack.current = [...undoStack.current.slice(-(UNDO_STACK_MAX - 1)), prev];
    setCanUndo(true);
    sessionCountRef.current = newCount;
    setSessionCount(newCount);
    persistSession(newCount);

    if (goalType === 'count' && goalValue && newCount >= goalValue && !goalReachedRef.current) {
      goalReachedRef.current = true;
      onGoalReached?.();
    }
    if (newCount - lastSyncedCount.current >= SYNC_COUNT_THRESHOLD) syncNow();
  }, [goalType, goalValue, onGoalReached, persistSession, syncNow]);

  const undo = useCallback(() => {
    if (!undoStack.current.length) return;
    const previous = undoStack.current[undoStack.current.length - 1];
    undoStack.current = undoStack.current.slice(0, -1);
    sessionCountRef.current = previous;
    setSessionCount(previous);
    setCanUndo(undoStack.current.length > 0);
    persistSession(previous);
  }, [persistSession]);

  const completeSession = useCallback(async () => {
    if (syncTimerRef.current)    { clearInterval(syncTimerRef.current);    syncTimerRef.current    = null; }
    if (elapsedTimerRef.current) { clearInterval(elapsedTimerRef.current); elapsedTimerRef.current = null; }

    const newChants = Math.max(0, sessionCountRef.current - sessionInitialCount.current);
    const durationMs = Date.now() - sessionStartedAt.current;

    if (newChants === 0) {
      if (mantraRef) lsRemove(sessionKey(mantraRef));
      await flushPendingQueue();
      return;
    }

    if (typeof serverSessionId.current !== 'number') await ensureSessionStarted();

    if (typeof serverSessionId.current === 'number') {
      await japaCompleteSession(serverSessionId.current, {
        final_count: newChants,
        duration_ms: durationMs,
        completed_at: new Date().toISOString(),
        final_idempotency_key: randomUUID(),
        today_local_date: todayLocalDate(tz),
        timezone: tz,
      });

      const statsResp = await japaGetStats(mantraRef ?? undefined, sourceSurface);
      if (statsResp?.stats?.length) {
        const row = statsResp.stats.find((s) => s.mantra_ref === mantraRef);
        if (row) {
          persistStats(row.today_count, row.week_count - newChants, row.year_count - newChants, row.lifetime_count - newChants);
        }
      }
    }

    if (mantraRef) lsRemove(sessionKey(mantraRef));
    await flushPendingQueue();
  }, [ensureSessionStarted, flushPendingQueue, mantraRef, persistStats, sourceSurface, tz]);

  // ── Derived values ────────────────────────────────────────────────────────

  // statsRevision increments after each refreshStats to force a re-render even
  // when sessionCount didn't change (so week/year/lifetime display from refs update).
  void statsRevision;

  const newChants    = Math.max(0, sessionCount - sessionInitialCount.current);
  const todayCount   = sessionCount;
  const weekCount    = Math.max(0, cachedWeekBase.current)    + newChants;
  const yearCount    = Math.max(0, cachedYearBase.current)    + newChants;
  const lifetimeCount = Math.max(0, cachedLifetimeBase.current) + newChants;
  const completedMalas = Math.floor(sessionCount / malaRound);
  const beadInRound    = sessionCount % malaRound;
  const remainingMs    = (goalType === 'time' && goalValue)
    ? Math.max(0, goalValue * 1000 - elapsedMs)
    : null;

  return {
    sessionCount, todayCount, weekCount, yearCount, lifetimeCount,
    completedMalas, beadInRound, malaRound,
    elapsedMs, remainingMs, isSyncing, canUndo,
    increment, undo, completeSession, syncNow, refreshStats,
  };
}
