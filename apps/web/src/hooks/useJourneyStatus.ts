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

export function invalidateJourneyStatusCache(): void {
  _cache = null;
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

    (async () => {
      try {
        await ensureGuestIdentity();
        const res = await api.get<JourneyStatus>('mitra/journey/status/');
        if (cancelled) return;
        const normalized = normalizeJourneyStatus(res.data);
        _cache = { value: normalized, raw: res.data, ts: Date.now() };
        setRawStatus(res.data);
        setHasActiveJourney(normalized);
      } catch (err: any) {
        if (cancelled) return;
        if (err?.response?.status === 404) {
          _cache = { value: false, raw: null, ts: Date.now() };
          setHasActiveJourney(false);
          setRawStatus(null);
        } else {
          setError(err?.message ?? 'Could not load journey status.');
          setHasActiveJourney(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [tick]);

  return { loading, error, hasActiveJourney, rawStatus, refetch };
}
