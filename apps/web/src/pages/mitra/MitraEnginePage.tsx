import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { PageShell } from '../../components/PageShell';
import { ScreenRenderer } from '../../engine/ScreenRenderer';
import { useScreenState } from '../../store/screenSlice';
import { loadScreenWithData } from '../../store/screenSlice';
import { executeAction } from '../../engine/actionExecutor';
import { webNavigate } from '../../lib/webRouter';
import type { AppDispatch } from '../../store';

export function MitraEnginePage() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const screenState = useScreenState();
  const [resolving, setResolving] = useState(false);

  // Read containerId/stateId from router state first, then query params as fallback.
  // Query params allow browser refresh to preserve the screen.
  const containerId: string =
    (location.state as any)?.containerId ||
    searchParams.get('containerId') ||
    screenState.currentContainerId;
  const stateId: string =
    (location.state as any)?.stateId ||
    searchParams.get('stateId') ||
    screenState.currentStateId;

  useEffect(() => {
    if (!containerId || !stateId) return;
    // Only load if the current screen doesn't match (avoids redundant resolves)
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

  const isRunnerContainer = containerId === 'practice_runner';

  // Fallback — missing params with no Redux state → never show blank screen
  if (!containerId || !stateId) {
    return (
      <PageShell>
        <div style={{ maxWidth: 480, margin: '0 auto', padding: 32, textAlign: 'center' }}>
          <p style={{ color: '#9A8C78', marginBottom: 16 }} data-testid="engine-not-found">
            This screen is not available.
          </p>
          <button
            onClick={() => webNavigate('/en/mitra/dashboard')}
            data-testid="engine-return-btn"
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              background: '#C9A84C',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Return to dashboard
          </button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 48 }}>
        {/* Runner exit strip — always visible for practice_runner screens */}
        {isRunnerContainer && !resolving && stateId !== 'completion_return' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px 0' }}>
            <button
              onClick={() => void executeAction({ type: 'runner_exit' }, actionContext)}
              data-testid="runner-exit-btn"
              aria-label="Exit runner"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                color: '#9A8C78',
                padding: '4px 8px',
              }}
            >
              ✕ Exit
            </button>
          </div>
        )}
        {resolving && (
          <div style={{ textAlign: 'center', padding: 48, color: '#888' }}>
            Loading screen…
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
    </PageShell>
  );
}
