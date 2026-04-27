/**
 * DashboardPage — Phase 7.
 * Fetches GET /api/mitra/v3/journey/daily-view/ (fallback: mitra/today/),
 * runs ingestDailyView(), dispatches to Redux, loads companion_dashboard_v3/day_active
 * through ScreenRenderer + NewDashboardBodyBlock.
 *
 * Active journey gate handled by RequiresJourney in routes.tsx.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { ScreenRenderer } from '../../engine/ScreenRenderer';
import { useScreenState, updateScreenData, loadScreenWithData } from '../../store/screenSlice';
import { getDashboardView } from '../../engine/mitraApi';
import { ingestDailyView } from '../../engine/v3Ingest';
import { executeAction } from '../../engine/actionExecutor';
import { useGuestIdentity } from '../../hooks/useGuestIdentity';
import { WEB_ENV } from '../../lib/env';
import type { AppDispatch } from '../../store';

export function DashboardPage() {
  useGuestIdentity();
  const dispatch = useDispatch<AppDispatch>();
  const screenState = useScreenState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugOpen, setDebugOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const envelope = await getDashboardView();

      if (!envelope) {
        setError('Your path is preparing — try again in a moment.');
        return;
      }

      // Legacy fallback: v3 endpoint returned 404 (feature flag off).
      // mitra/today/ response is not v3Ingest-compatible; show safe error.
      if (envelope._isLegacyFallback) {
        setError('Dashboard is updating — please try again shortly.');
        return;
      }

      const flat = ingestDailyView(envelope);

      if (WEB_ENV.isDev) {
        console.log(`[Dashboard] ingestDailyView → ${Object.keys(flat).length} keys`);
        console.log('[Dashboard] greeting:', flat.greeting);
        console.log('[Dashboard] today.triad:', flat.today?.triad);
        console.log('[Dashboard] continuity tier:', flat.continuity?.tier);
      }

      dispatch(updateScreenData(flat));

      // Load companion_dashboard_v3/day_active schema from contracts
      await dispatch(loadScreenWithData({ containerId: 'companion_dashboard_v3', stateId: 'day_active' }));

    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Could not load your practice.';
      if (WEB_ENV.isDev) console.error('[Dashboard] load error:', err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    void load();
  }, [load]);

  const actionContext = {
    dispatch,
    screenData: screenState.screenData,
    currentStateId: 'day_active',
  };

  return (
    <div style={{ minHeight: '100dvh', background: '#FFF8EF' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>

        {/* ── Loading skeleton ── */}
        {loading && <DashboardSkeleton />}

        {/* ── Error state ── */}
        {!loading && error && (
          <div style={{ padding: 24 }}>
            <div
              style={{
                padding: '16px 20px',
                borderRadius: 12,
                background: '#fff1f0',
                border: '1px solid #fca5a5',
                marginBottom: 12,
              }}
            >
              <p style={{ color: '#b91c1c', fontSize: 14, marginBottom: 8 }}>{error}</p>
              <button
                onClick={() => void load()}
                style={{
                  padding: '8px 20px',
                  borderRadius: 8,
                  background: '#b91c1c',
                  color: '#fff',
                  border: 'none',
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* ── Dashboard via ScreenRenderer ── */}
        {!loading && !error && (
          <ScreenRenderer
            schema={screenState.currentScreen}
            screenData={screenState.screenData}
            onAction={(action) => void executeAction(action, actionContext)}
          />
        )}

        {/* ── Dev debug panel ── */}
        {WEB_ENV.isDev && (
          <div style={{ borderTop: '1px solid #eee', padding: '12px 16px', marginTop: 16 }}>
            <button
              onClick={() => setDebugOpen(!debugOpen)}
              style={{ fontSize: 11, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              {debugOpen ? '▼' : '▶'} screenData debug
            </button>
            {debugOpen && (
              <pre
                style={{
                  fontSize: 10,
                  color: '#555',
                  overflow: 'auto',
                  maxHeight: 400,
                  marginTop: 8,
                  background: '#f8f8f8',
                  borderRadius: 6,
                  padding: 8,
                }}
              >
                {JSON.stringify(screenState.screenData, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

function SkeletonLine({ w = '100%', h = 16, mb = 8 }: { w?: string | number; h?: number; mb?: number }) {
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 6,
        background: '#f0e8d8',
        marginBottom: mb,
        animation: 'pulse 1.5s ease-in-out infinite',
      }}
    />
  );
}

function DashboardSkeleton() {
  return (
    <div style={{ padding: '28px 16px' }}>
      {/* Greeting skeleton */}
      <SkeletonLine w="40%" h={12} mb={6} />
      <SkeletonLine w="80%" h={28} mb={6} />
      <SkeletonLine w="60%" h={16} mb={28} />

      {/* Triad skeleton */}
      <SkeletonLine w="30%" h={11} mb={10} />
      {['mantra', 'sankalp', 'practice'].map((s) => (
        <div
          key={s}
          style={{
            padding: 16,
            borderRadius: 12,
            border: '1px solid #f0e8d8',
            background: '#fdf8ef',
            marginBottom: 10,
          }}
        >
          <SkeletonLine w="25%" h={10} mb={6} />
          <SkeletonLine w="70%" h={18} mb={0} />
        </div>
      ))}

      {/* Support skeleton */}
      <div style={{ marginTop: 20 }}>
        <SkeletonLine w="30%" h={11} mb={10} />
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              padding: 12,
              borderRadius: 10,
              border: '1px solid #f0e8d8',
              background: '#fdf8ef',
              marginBottom: 8,
            }}
          >
            <SkeletonLine w="55%" h={14} mb={0} />
          </div>
        ))}
      </div>
    </div>
  );
}
