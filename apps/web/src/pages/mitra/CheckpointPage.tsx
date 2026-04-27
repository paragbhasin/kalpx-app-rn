/**
 * CheckpointPage — Phase 10B.
 * Fetches day 7 or day 14 checkpoint view, ingests into Redux, renders via ScreenRenderer.
 * Route: /en/mitra/checkpoint/:day  (day = '7' or '14')
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { PageShell } from '../../components/PageShell';
import { ScreenRenderer } from '../../engine/ScreenRenderer';
import { loadScreenWithData } from '../../store/screenSlice';
import { useScreenState } from '../../store/screenSlice';
import { executeAction } from '../../engine/actionExecutor';
import { mitraJourneyDay7View, mitraJourneyDay14View, trackEvent } from '../../engine/mitraApi';
import { ingestDay7View, ingestDay14View } from '../../engine/v3Ingest';
import { updateScreenData } from '../../store/screenSlice';
import type { AppDispatch } from '../../store';

type LoadState = 'loading' | 'not_ready' | 'error' | 'ready';

export function CheckpointPage() {
  const { day } = useParams<{ day: string }>();
  const dayNum = day === '14' ? 14 : 7;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const screenState = useScreenState();
  const [loadState, setLoadState] = useState<LoadState>('loading');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadState('loading');
      try {
        let flat: Record<string, any> = {};
        let stateId: string;

        if (dayNum === 7) {
          const env = await mitraJourneyDay7View();
          if (!env) {
            if (!cancelled) setLoadState('not_ready');
            return;
          }
          flat = ingestDay7View(env);
          stateId = 'checkpoint_day_7';
        } else {
          const env = await mitraJourneyDay14View();
          if (!env) {
            if (!cancelled) setLoadState('not_ready');
            return;
          }
          flat = ingestDay14View(env);
          stateId = 'checkpoint_day_14';
        }

        if (cancelled) return;

        dispatch(updateScreenData(flat));
        await dispatch(loadScreenWithData({ containerId: 'cycle_transitions', stateId }));

        void trackEvent('checkpoint_viewed', {
          journey_id: flat.journey_id,
          day_number: flat.day_number || dayNum,
          meta: { day: dayNum },
        });

        setLoadState('ready');
      } catch (err: any) {
        if (!cancelled) setLoadState('error');
      }
    }

    load();
    return () => { cancelled = true; };
  }, [dayNum, dispatch]);

  const actionContext = {
    dispatch,
    screenData: screenState.screenData,
    currentStateId: screenState.currentStateId || undefined,
  };

  if (loadState === 'loading') {
    return (
      <PageShell>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60dvh' }}>
          <p style={{ color: '#9A8C78', fontSize: 14 }}>Loading your checkpoint…</p>
        </div>
      </PageShell>
    );
  }

  if (loadState === 'not_ready') {
    return (
      <PageShell>
        <div
          data-testid="checkpoint-not-ready"
          style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}
        >
          <p style={{ fontSize: 18, fontWeight: 700, color: '#1a1a0a', marginBottom: 12 }}>
            Not yet
          </p>
          <p style={{ fontSize: 15, color: '#9A8C78', marginBottom: 32, lineHeight: 1.6 }}>
            Your Day {dayNum} checkpoint isn't ready yet. Keep your practice going.
          </p>
          <button
            data-testid="checkpoint-back-btn"
            onClick={() => navigate('/en/mitra/dashboard', { replace: true })}
            style={{
              padding: '12px 28px',
              background: '#C9A84C',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </PageShell>
    );
  }

  if (loadState === 'error') {
    return (
      <PageShell>
        <div
          data-testid="checkpoint-error"
          style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}
        >
          <p style={{ fontSize: 18, fontWeight: 700, color: '#1a1a0a', marginBottom: 12 }}>
            Something went wrong
          </p>
          <p style={{ fontSize: 15, color: '#9A8C78', marginBottom: 32 }}>
            Could not load your checkpoint. Please try again.
          </p>
          <button
            data-testid="checkpoint-retry-btn"
            onClick={() => setLoadState('loading')}
            style={{
              padding: '12px 28px',
              background: '#C9A84C',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              marginRight: 12,
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => navigate('/en/mitra/dashboard', { replace: true })}
            style={{
              padding: '12px 28px',
              background: 'none',
              color: '#9A8C78',
              border: '1px solid #e8d5a0',
              borderRadius: 10,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <ScreenRenderer
          schema={screenState.currentScreen}
          screenData={screenState.screenData}
          onAction={(action) => executeAction(action, actionContext)}
        />
      </div>
    </PageShell>
  );
}
