/**
 * OnboardingPage — Phase 6.
 * Renders the welcome_onboarding container state-by-state using ScreenRenderer.
 * URL: /en/mitra/onboarding?containerId=welcome_onboarding&stateId=<turn>
 *
 * Does NOT require an active journey — onboarding creates the journey.
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { ScreenRenderer } from '../../engine/ScreenRenderer';
import { useScreenState, loadScreenWithData } from '../../store/screenSlice';
import { executeAction } from '../../engine/actionExecutor';
import { useGuestIdentity } from '../../hooks/useGuestIdentity';
import { useJourneyStatus } from '../../hooks/useJourneyStatus';
import type { AppDispatch } from '../../store';

export function OnboardingPage() {
  useGuestIdentity();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const screenState = useScreenState();
  const [resolving, setResolving] = useState(false);

  const { loading: statusLoading, hasActiveJourney } = useJourneyStatus();

  // Active journey users must not re-run onboarding — duplicate journey risk
  useEffect(() => {
    if (statusLoading) return;
    if (hasActiveJourney === true) {
      navigate('/en/mitra/dashboard', { replace: true });
    }
  }, [statusLoading, hasActiveJourney, navigate]);

  if (statusLoading) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fdf8ef' }}>
        <p style={{ color: '#888', fontSize: 14 }}>Loading…</p>
      </div>
    );
  }

  // stateId drives which turn to show; default to turn_1 if missing
  const stateId: string =
    searchParams.get('stateId') ||
    screenState.currentStateId ||
    'turn_1';

  useEffect(() => {
    if (
      screenState.currentContainerId === 'welcome_onboarding' &&
      screenState.currentStateId === stateId &&
      screenState.currentScreen
    ) {
      return;
    }
    setResolving(true);
    dispatch(loadScreenWithData({ containerId: 'welcome_onboarding', stateId })).finally(() =>
      setResolving(false),
    );
  }, [stateId, dispatch]);

  const actionContext = {
    dispatch,
    screenData: screenState.screenData,
    currentStateId: stateId,
  };

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#fdf8ef',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 480,
          padding: '48px 24px 80px',
        }}
      >
        {resolving && (
          <div style={{ textAlign: 'center', paddingTop: 80, color: '#888' }}>
            Loading…
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
    </div>
  );
}
