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

export function useJourneyStatus(): UseJourneyStatusResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasActiveJourney, setHasActiveJourney] = useState<boolean | null>(null);
  const [rawStatus, setRawStatus] = useState<JourneyStatus | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        await ensureGuestIdentity();
        const res = await api.get<JourneyStatus>('mitra/journey/status/');
        if (cancelled) return;
        setRawStatus(res.data);
        setHasActiveJourney(normalizeJourneyStatus(res.data));
      } catch (err: any) {
        if (cancelled) return;
        if (err?.response?.status === 404) {
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
