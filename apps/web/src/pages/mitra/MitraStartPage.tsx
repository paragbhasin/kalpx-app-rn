/**
 * MitraStartPage — Phase 6.
 * Journey-status gate for /en/mitra/start.
 * Active journey → dashboard. No journey → /en/mitra/onboarding.
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGuestIdentity } from '../../hooks/useGuestIdentity';
import { useJourneyStatus } from '../../hooks/useJourneyStatus';

export function MitraStartPage() {
  useGuestIdentity();
  const navigate = useNavigate();
  const { loading, hasActiveJourney } = useJourneyStatus();

  useEffect(() => {
    if (loading) return;
    if (hasActiveJourney === true) {
      navigate('/en/mitra/dashboard', { replace: true });
    } else {
      navigate('/en/mitra/onboarding?containerId=welcome_onboarding&stateId=turn_1', {
        replace: true,
      });
    }
  }, [loading, hasActiveJourney, navigate]);

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
