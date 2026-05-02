/**
 * MitraStartPage — Phase 6.
 * Journey-status gate for /en/mitra/start.
 * Active journey → dashboard. No journey → /en/mitra/onboarding.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useGuestIdentity } from '../../hooks/useGuestIdentity';
import { useJourneyStatus } from '../../hooks/useJourneyStatus';

export function MitraStartPage() {
  useGuestIdentity();
  const { loading, hasActiveJourney } = useJourneyStatus();

  if (!loading) {
    return hasActiveJourney === true ? (
      <Navigate to="/en/mitra" replace />
    ) : (
      <Navigate
        to="/en/mitra/onboarding?containerId=welcome_onboarding&stateId=turn_1"
        replace
      />
    );
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fdf8ef',
      }}
    >
      <p style={{ color: '#888', fontSize: 14 }}>Loading…</p>
    </div>
  );
}
