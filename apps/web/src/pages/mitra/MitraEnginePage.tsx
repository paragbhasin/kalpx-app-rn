import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { PageShell } from '../../components/PageShell';
import { ScreenRenderer } from '../../engine/ScreenRenderer';
import { useScreenState } from '../../store/screenSlice';
import { loadScreenWithData } from '../../store/screenSlice';
import { executeAction } from '../../engine/actionExecutor';
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

  return (
    <PageShell>
      <div style={{ maxWidth: 480, margin: '0 auto', paddingBottom: 48 }}>
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
