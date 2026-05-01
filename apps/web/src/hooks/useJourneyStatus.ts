import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { normalizeJourneyStatus, type JourneyStatus } from '../types/api';
import { ensureGuestIdentity } from './useGuestIdentity';

type UseJourneyStatusResult = {
  loading: boolean;
  error: string | null;
  hasActiveJourney: boolean | null;
  rawStatus: JourneyStatus | null;
  refetch: () => void;
};

// Module-level TTL cache — shared across all RequiresJourney instances in a session.
// Avoids one API call per guarded route mount (dashboard → room → trigger = 3 calls → 1).
const STATUS_TTL_MS = 60_000;
let _cache: { value: boolean | null; raw: JourneyStatus | null; ts: number } | null = null;
let _inflight: Promise<{ value: boolean; raw: JourneyStatus | null }> | null = null;

export function invalidateJourneyStatusCache(): void {
  _cache = null;
  _inflight = null;
}

export function useJourneyStatus(): UseJourneyStatusResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveJourney, setHasActiveJourney] = useState<boolean | null>(null);
  const [rawStatus, setRawStatus] = useState<JourneyStatus | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => {
    invalidateJourneyStatusCache();
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Serve from cache if fresh
    if (_cache && Date.now() - _cache.ts < STATUS_TTL_MS) {
      setHasActiveJourney(_cache.value);
      setRawStatus(_cache.raw);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const request = _inflight ?? (async () => {
      try {
        await ensureGuestIdentity();
        const res = await api.get<JourneyStatus>('mitra/journey/status/');
        const normalized = normalizeJourneyStatus(res.data);
        return { value: normalized, raw: res.data };
      } catch (err: any) {
        if (err?.response?.status === 404) {
          return { value: false, raw: null };
        }
        throw err;
      } finally {
        _inflight = null;
      }
    })();

    _inflight = request;

    request.then(({ value, raw }) => {
      if (cancelled) return;
      _cache = { value, raw, ts: Date.now() };
      setRawStatus(raw);
      setHasActiveJourney(value);
    }).catch((err: any) => {
      if (cancelled) return;
      setError(err?.message ?? 'Could not load journey status.');
      setHasActiveJourney(null);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [tick]);

  return { loading, error, hasActiveJourney, rawStatus, refetch };
}
