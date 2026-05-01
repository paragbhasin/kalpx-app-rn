import { useCallback, useEffect, useState } from 'react';
import { mitraJourneyEntryView } from '../engine/mitraApi';

export type JourneyEntryViewKey =
  | 'daily_view'
  | 'day_7_view'
  | 'day_14_view'
  | 'welcome_back_surface'
  | 'onboarding_start';

type UseJourneyEntryViewResult = {
  loading: boolean;
  error: string | null;
  viewKey: JourneyEntryViewKey | null;
  refetch: () => void;
};

const ENTRY_VIEW_TTL_MS = 30_000;

let _cache: { viewKey: JourneyEntryViewKey; ts: number } | null = null;
let _inflight: Promise<JourneyEntryViewKey> | null = null;

export function invalidateJourneyEntryViewCache(): void {
  _cache = null;
  _inflight = null;
}

function normalizeEntryViewKey(value: unknown): JourneyEntryViewKey {
  switch (value) {
    case 'day_7_view':
    case 'day_14_view':
    case 'welcome_back_surface':
    case 'onboarding_start':
      return value;
    case 'daily_view':
    default:
      return 'daily_view';
  }
}

export function mapJourneyEntryViewPath(viewKey: JourneyEntryViewKey): string {
  switch (viewKey) {
    case 'day_7_view':
      return '/en/mitra/checkpoint/7';
    case 'day_14_view':
      return '/en/mitra/checkpoint/14';
    case 'welcome_back_surface':
      return '/en/mitra/welcome-back';
    case 'onboarding_start':
      return '/en/mitra/onboarding?containerId=welcome_onboarding&stateId=turn_1';
    case 'daily_view':
    default:
      return '/en/mitra/dashboard';
  }
}

export function useJourneyEntryView(enabled: boolean): UseJourneyEntryViewResult {
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [viewKey, setViewKey] = useState<JourneyEntryViewKey | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => {
    invalidateJourneyEntryViewCache();
    setTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!enabled) {
      setLoading(false);
      setError(null);
      setViewKey(null);
      return;
    }

    if (_cache && Date.now() - _cache.ts < ENTRY_VIEW_TTL_MS) {
      setViewKey(_cache.viewKey);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const request = _inflight ?? (async () => {
      try {
        const result = await mitraJourneyEntryView();
        return normalizeEntryViewKey(result.envelope?.target?.view_key);
      } catch (err: any) {
        throw err;
      } finally {
        _inflight = null;
      }
    })();

    _inflight = request;

    request.then((nextViewKey) => {
      if (cancelled) return;
      _cache = { viewKey: nextViewKey, ts: Date.now() };
      setViewKey(nextViewKey);
    }).catch((err: any) => {
      if (cancelled) return;
      setError(err?.message ?? 'Could not load entry route.');
      setViewKey(null);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [enabled, tick]);

  return { loading, error, viewKey, refetch };
}
