import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { PageShell } from '../../components/PageShell';
import { useScreenState } from '../../store/screenSlice';
import { updateScreenData, setScreenValue } from '../../store/screenSlice';
import { getDailyView } from '../../engine/mitraApi';
import { ingestDailyView } from '../../engine/v3Ingest';
import { buildDashboardProofViewModel } from '../../features/mitra/dashboard/buildDashboardProofViewModel';
import { executeAction } from '../../engine/actionExecutor';
import type { AppDispatch } from '../../store';
import { WEB_ENV } from '../../lib/env';

export function DashboardPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const screenState = useScreenState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugOpen, setDebugOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const envelope = await getDailyView();
        if (cancelled) return;
        const flat = ingestDailyView(envelope);
        const keyCount = Object.keys(flat).length;
        if (WEB_ENV.isDev) {
          console.log(`[Dashboard] ingestDailyView produced ${keyCount} keys`);
          console.log('[Dashboard] triad:', flat.today?.triad);
          console.log('[Dashboard] screenData.greeting_headline:', flat.greeting_headline);
        }
        dispatch(updateScreenData(flat));
      } catch (err: any) {
        if (!cancelled) {
          const msg = err?.response?.data?.detail || err?.message || 'Failed to load today';
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => { cancelled = true; };
  }, [dispatch]);

  const handleTriadTap = useCallback(
    async (card: any) => {
      if (screenState._isSubmitting) return;
      // Set info context so offering_reveal can interpolate {{info.title}}
      dispatch(setScreenValue({
        key: 'info',
        value: {
          title: card.title,
          subtitle: card.subtitle,
          description: card.subtitle,
          item_id: card.itemId,
          item_type: card.type,
        },
      }));
      dispatch(setScreenValue({ key: 'info_start_label', value: 'Begin' }));
      await executeAction(card.tapAction, { dispatch, screenData: screenState.screenData });
      // Navigate is handled inside executeAction
    },
    [dispatch, navigate, screenState],
  );

  const vm = buildDashboardProofViewModel(screenState.screenData);

  return (
    <PageShell>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 48, color: '#888' }}>
            Loading your practice…
          </div>
        )}

        {error && (
          <div style={{ padding: 16, background: '#fee', borderRadius: 8, color: '#c00', marginBottom: 16 }}>
            {error}
            <button
              onClick={() => window.location.reload()}
              style={{ marginLeft: 12, cursor: 'pointer', color: '#c00', textDecoration: 'underline', background: 'none', border: 'none' }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Greeting */}
            <div style={{ marginBottom: 28 }}>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1a1a1a', margin: 0 }}>
                {vm.greeting.headline}
              </h1>
              {vm.greeting.subtitle && (
                <p style={{ fontSize: 14, color: '#666', marginTop: 6 }}>{vm.greeting.subtitle}</p>
              )}
            </div>

            {/* Triad cards */}
            {vm.triadCards.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
                  Today's Practice
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {vm.triadCards.map((card) => (
                    <button
                      key={card.id}
                      data-testid={`triad-card-${card.type}`}
                      onClick={() => void handleTriadTap(card)}
                      disabled={screenState._isSubmitting}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '14px 16px',
                        borderRadius: 10,
                        border: '1px solid',
                        borderColor: card.completed ? '#c8e6c9' : '#e0d4b8',
                        background: card.completed ? '#f1f8f2' : '#fdf8ef',
                        cursor: 'pointer',
                        opacity: screenState._isSubmitting ? 0.6 : 1,
                      }}
                    >
                      <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                        {card.type}{card.completed ? ' ✓' : ''}
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#2a1a0a' }}>{card.title}</div>
                      {card.subtitle && (
                        <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{card.subtitle}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {vm.triadCards.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: '#888', border: '1px dashed #ddd', borderRadius: 10 }}>
                No practice data. Check backend response.
              </div>
            )}

            {/* Support chips */}
            {vm.supportChips.length > 0 && (
              <div>
                <p style={{ fontSize: 12, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                  Support
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {vm.supportChips.map((chip) => (
                    <button
                      key={chip.id}
                      data-testid={`support-chip-${chip.id}`}
                      style={{
                        padding: '7px 14px',
                        borderRadius: 20,
                        border: '1px solid #d4b16a',
                        background: '#fdf8ef',
                        fontSize: 13,
                        cursor: 'pointer',
                        color: '#6b4c1a',
                      }}
                      onClick={() => {
                        if (chip.action) {
                          void executeAction(chip.action, { dispatch, screenData: screenState.screenData });
                        }
                      }}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* DEV debug panel */}
            {WEB_ENV.isDev && (
              <div style={{ marginTop: 32, borderTop: '1px solid #eee', paddingTop: 16 }}>
                <button
                  onClick={() => setDebugOpen(!debugOpen)}
                  style={{ fontSize: 11, color: '#aaa', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {debugOpen ? '▼' : '▶'} screenData debug
                </button>
                {debugOpen && (
                  <pre style={{ fontSize: 10, color: '#666', overflow: 'auto', maxHeight: 300, marginTop: 8 }}>
                    {JSON.stringify(screenState.screenData, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
