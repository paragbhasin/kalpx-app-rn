/**
 * CheckpointPage — Phase 10B.
 * Fetches day 7 or day 14 checkpoint view, ingests into Redux, renders via ScreenRenderer.
 * Route: /en/mitra/checkpoint/:day  (day = '7' or '14')
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from '../../lib/i18n';
import { MitraMobileShell } from '../../components/layout/MitraMobileShell';
import { ScreenRenderer } from '../../engine/ScreenRenderer';
import { loadScreenWithData } from '../../store/screenSlice';
import { useScreenState } from '../../store/screenSlice';
import { executeAction } from '../../engine/actionExecutor';
import { mitraJourneyDay7View, mitraJourneyDay14View, trackEvent } from '../../engine/mitraApi';
import { ingestDay7View, ingestDay14View } from '../../engine/v3Ingest';
import { updateScreenData } from '../../store/screenSlice';
import type { AppDispatch } from '../../store';

type LoadState = 'loading' | 'not_ready' | 'error' | 'ready';
type CheckpointLoadResult = {
  flat: Record<string, any>;
  stateId: string;
  notReady: boolean;
};

const checkpointLoadCache = new Map<string, Promise<CheckpointLoadResult>>();

export function CheckpointPage() {
  const { day } = useParams<{ day: string }>();
  const dayNum = day === '14' ? 14 : 7;
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const screenState = useScreenState();
  const { t, locale } = useTranslation();
  const [loadState, setLoadState] = useState<LoadState>('loading');

  useEffect(() => {
    function handleLocaleChange() {
      checkpointLoadCache.clear();
      setLoadState('loading');
    }
    window.addEventListener('kalpx:locale-changed', handleLocaleChange);
    return () => window.removeEventListener('kalpx:locale-changed', handleLocaleChange);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadState('loading');
      try {
        const cacheKey = `${dayNum}:${locale}`;
        const existing = checkpointLoadCache.get(cacheKey);
        const request = existing ?? (async (): Promise<CheckpointLoadResult> => {
          if (dayNum === 7) {
            const env = await mitraJourneyDay7View();
            if (!env) {
              return { flat: {}, stateId: 'checkpoint_day_7', notReady: true };
            }
            return {
              flat: ingestDay7View(env),
              stateId: 'checkpoint_day_7',
              notReady: false,
            };
          }

          const env = await mitraJourneyDay14View();
          if (!env) {
            return { flat: {}, stateId: 'checkpoint_day_14', notReady: true };
          }
          return {
            flat: ingestDay14View(env),
            stateId: 'checkpoint_day_14',
            notReady: false,
          };
        })();

        if (!existing) {
          checkpointLoadCache.set(cacheKey, request);
          request.finally(() => {
            checkpointLoadCache.delete(cacheKey);
          });
        }

        const { flat, stateId, notReady } = await request;

        if (cancelled) return;

        if (notReady) {
          setLoadState('not_ready');
          return;
        }

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
  }, [dayNum, locale, dispatch]);

  const actionContext = {
    dispatch,
    screenData: screenState.screenData,
    currentStateId: screenState.currentStateId || undefined,
  };

  if (loadState === 'loading') {
    return (
      <MitraMobileShell>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60dvh' }}>
          <p style={{ color: 'var(--kalpx-text-muted)', fontSize: 14 }}>{t('mitra.checkpoint.loading')}</p>
        </div>
      </MitraMobileShell>
    );
  }

  if (loadState === 'not_ready') {
    return (
      <MitraMobileShell>
        <div
          data-testid="checkpoint-not-ready"
          style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}
        >
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--kalpx-text)', marginBottom: 12 }}>
            {t('mitra.checkpoint.notYet')}
          </p>
          <p style={{ fontSize: 15, color: 'var(--kalpx-text-muted)', marginBottom: 32, lineHeight: 1.6 }}>
            {t('mitra.checkpoint.notYetBody')}
          </p>
          <button
            data-testid="checkpoint-back-btn"
            onClick={() => navigate('/en/mitra/dashboard', { replace: true })}
            style={{
              padding: '12px 28px',
              background: 'var(--kalpx-cta)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {t('mitra.checkpoint.backDashboard')}
          </button>
        </div>
      </MitraMobileShell>
    );
  }

  if (loadState === 'error') {
    return (
      <MitraMobileShell>
        <div
          data-testid="checkpoint-error"
          style={{ maxWidth: 480, margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}
        >
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--kalpx-text)', marginBottom: 12 }}>
            {t('mitra.checkpoint.error')}
          </p>
          <p style={{ fontSize: 15, color: 'var(--kalpx-text-muted)', marginBottom: 32 }}>
            {t('mitra.checkpoint.loadError')}
          </p>
          <button
            data-testid="checkpoint-retry-btn"
            onClick={() => setLoadState('loading')}
            style={{
              padding: '12px 28px',
              background: 'var(--kalpx-cta)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              marginRight: 12,
            }}
          >
            {t('mitra.checkpoint.tryAgain')}
          </button>
          <button
            onClick={() => navigate('/en/mitra/dashboard', { replace: true })}
            style={{
              padding: '12px 28px',
              background: 'none',
              color: 'var(--kalpx-text-muted)',
              border: '1px solid var(--kalpx-chip-bg)',
              borderRadius: 10,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            {t('mitra.checkpoint.backDashboard')}
          </button>
        </div>
      </MitraMobileShell>
    );
  }

  return (
    <MitraMobileShell>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <ScreenRenderer
          schema={screenState.currentScreen}
          screenData={screenState.screenData}
          onAction={(action) => executeAction(action, actionContext)}
        />
      </div>
    </MitraMobileShell>
  );
}
