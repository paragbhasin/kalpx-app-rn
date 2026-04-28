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
import { MitraMobileShell } from '../../components/layout/MitraMobileShell';
import type { AppDispatch } from '../../store';

export function OnboardingPage() {
  useGuestIdentity();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const screenState = useScreenState();
  const [resolving, setResolving] = useState(false);

  const { loading: statusLoading, hasActiveJourney } = useJourneyStatus();

  // stateId drives which turn to show; default to turn_1 if missing
  const stateId: string =
    searchParams.get('stateId') ||
    screenState.currentStateId ||
    'turn_1';

  // Active journey users must not re-run onboarding — duplicate journey risk
  useEffect(() => {
    if (statusLoading) return;
    if (hasActiveJourney === true) {
      navigate('/en/mitra/dashboard', { replace: true });
    }
  }, [statusLoading, hasActiveJourney, navigate]);

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

  if (statusLoading) {
    return (
      <MitraMobileShell>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 24px' }}>
          <p style={{ color: 'var(--kalpx-text-muted)', fontSize: 14 }}>Loading…</p>
        </div>
      </MitraMobileShell>
    );
  }

  const actionContext = {
    dispatch,
    screenData: screenState.screenData,
    currentStateId: stateId,
  };

  return (
    <MitraMobileShell>
      <div style={{ padding: '16px 24px 80px' }}>
        {resolving && (
          <div style={{ textAlign: 'center', paddingTop: 80, color: 'var(--kalpx-text-muted)' }}>
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
    </MitraMobileShell>
  );
}
