import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { MitraMobileShell } from '../../components/layout/MitraMobileShell';
import { ScreenRenderer } from '../../engine/ScreenRenderer';
import { useScreenState } from '../../store/screenSlice';
import { loadScreenWithData } from '../../store/screenSlice';
import { executeAction } from '../../engine/actionExecutor';
import { webNavigate } from '../../lib/webRouter';
import { createCalmAudio } from '../../lib/audio/calmMusic';
import type { AudioHandle } from '../../lib/audio/howlerAudio';
import type { AppDispatch } from '../../store';

export function MitraEnginePage() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const screenState = useScreenState();
  const [resolving, setResolving] = useState(false);
  const calmAudioRef = useRef<AudioHandle | null>(null);

  const containerId: string =
    (location.state as any)?.containerId ||
    searchParams.get('containerId') ||
    screenState.currentContainerId;
  const stateId: string =
    (location.state as any)?.stateId ||
    searchParams.get('stateId') ||
    screenState.currentStateId;

  const isRunnerContainer = containerId === 'practice_runner';

  // Calm music: play on runner mount, stop on unmount
  useEffect(() => {
    if (!isRunnerContainer) return;
    const handle = createCalmAudio();
    calmAudioRef.current = handle;
    const t = setTimeout(() => { try { handle.play(); } catch {} }, 300);
    return () => {
      clearTimeout(t);
      handle.stop();
      handle.unload();
      calmAudioRef.current = null;
    };
  }, [isRunnerContainer]);

  useEffect(() => {
    if (!containerId || !stateId) return;
    if (
      screenState.currentContainerId === containerId &&
      screenState.currentStateId === stateId &&
      screenState.currentScreen
    ) {
      return;
    }
    setResolving(true);
    dispatch(loadScreenWithData({ containerId, stateId }))
      .finally(() => setResolving(false));
  }, [containerId, stateId, dispatch]);

  const actionContext = {
    dispatch,
    screenData: screenState.screenData,
    currentStateId: screenState.currentStateId,
  };

  if (!containerId || !stateId) {
    return (
      <MitraMobileShell>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: 32, textAlign: 'center' }}>
          <p style={{ color: 'var(--kalpx-text-muted)', marginBottom: 16 }} data-testid="engine-not-found">
            This screen is not available.
          </p>
          <button
            onClick={() => webNavigate('/en/mitra/dashboard')}
            data-testid="engine-return-btn"
            style={{ padding: '10px 24px', borderRadius: 8, background: 'var(--kalpx-cta)', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Return to dashboard
          </button>
        </div>
      </MitraMobileShell>
    );
  }

  // ── Practice runner: dark immersive chrome, no shell ────────────────
  if (isRunnerContainer) {
    return (
      <div className="kalpx-runner-dark" style={{ position: 'relative' }}>
        {!resolving && stateId !== 'completion_return' && (
          <div style={{ position: 'absolute', top: 12, right: 16, zIndex: 10 }}>
            <button
              onClick={() => void executeAction({ type: 'runner_exit' }, actionContext)}
              data-testid="runner-exit-btn"
              aria-label="Exit runner"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(201,168,76,0.3)',
                borderRadius: 20,
                cursor: 'pointer',
                fontSize: 12,
                color: '#bfa58a',
                padding: '5px 14px',
                backdropFilter: 'blur(4px)',
              }}
            >
              ✕ Exit
            </button>
          </div>
        )}
        {resolving ? (
          <div style={{ textAlign: 'center', padding: 80 }}>
            <div style={{ width: 28, height: 28, border: '2px solid #C9A84C', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : (
          <div style={{ maxWidth: 480, margin: '0 auto', paddingTop: 56, paddingBottom: 48 }}>
            <ScreenRenderer
              schema={screenState.currentScreen}
              screenData={screenState.screenData}
              onAction={(action) => executeAction(action, actionContext)}
            />
          </div>
        )}
      </div>
    );
  }

  // ── Regular engine screen: wrapped in MitraMobileShell ──────────────
  return (
    <MitraMobileShell>
      <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 48 }}>
        {resolving && (
          <div style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ width: 28, height: 28, border: '2px solid var(--kalpx-cta)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, color: 'var(--kalpx-text-muted)' }}>Loading…</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}
        {!resolving && (
          <ScreenRenderer
            schema={screenState.currentScreen}
            screenData={screenState.screenData}
            onAction={(action) => executeAction(action, actionContext)}
          />
        )}
      </div>
    </MitraMobileShell>
  );
}
