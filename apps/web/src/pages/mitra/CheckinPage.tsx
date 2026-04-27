/**
 * CheckinPage — support_checkin container host.
 * Steps: notice → name → settle → balanced_ack.
 */
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useSearchParams } from 'react-router-dom';
import { ScreenRenderer } from '../../engine/ScreenRenderer';
import { loadScreenWithData, useScreenState } from '../../store/screenSlice';
import { executeAction } from '../../engine/actionExecutor';
import type { AppDispatch } from '../../store';

export function CheckinPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const screenState = useScreenState();

  const containerId: string =
    (location.state as any)?.containerId ||
    searchParams.get('containerId') ||
    (screenState.currentContainerId === 'support_checkin' ? screenState.currentContainerId : '') ||
    'support_checkin';
  const stateId: string =
    (location.state as any)?.stateId ||
    searchParams.get('stateId') ||
    (screenState.currentContainerId === 'support_checkin' ? screenState.currentStateId : '') ||
    'notice';

  useEffect(() => {
    if (
      screenState.currentContainerId === containerId &&
      screenState.currentStateId === stateId &&
      screenState.currentScreen
    ) return;
    dispatch(loadScreenWithData({ containerId, stateId }));
  }, [containerId, stateId, dispatch]);

  const actionContext = {
    dispatch,
    screenData: screenState.screenData,
    currentStateId: stateId,
  };

  const isAck = stateId === 'balanced_ack';

  return (
    <div style={{ minHeight: '100dvh', background: '#FFF8EF', maxWidth: 480, margin: '0 auto' }}>
      {!isAck && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px 0' }}>
          <button
            onClick={() => void executeAction({ type: 'support_exit' }, actionContext)}
            data-testid="checkin-exit-btn"
            style={{ background: 'none', border: 'none', color: '#9A8C78', fontSize: 13, cursor: 'pointer' }}
          >
            ✕ Return home
          </button>
        </div>
      )}
      <ScreenRenderer
        schema={screenState.currentScreen}
        screenData={screenState.screenData}
        onAction={(action) => void executeAction(action, actionContext)}
      />
    </div>
  );
}
