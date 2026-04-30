import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useJourneyStatus } from '../hooks/useJourneyStatus';

interface Props {
  children: React.ReactNode;
}

const CHECKPOINT_BYPASS_KEY = 'kalpx_checkpoint_redirect_bypass_until';

function hasCheckpointRedirectBypass(): boolean {
  try {
    const raw = sessionStorage.getItem(CHECKPOINT_BYPASS_KEY);
    if (!raw) return false;
    const until = Number(raw);
    if (!Number.isFinite(until) || until <= Date.now()) {
      sessionStorage.removeItem(CHECKPOINT_BYPASS_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function RequiresJourney({ children }: Props) {
  const location = useLocation();
  const { loading, error, hasActiveJourney, rawStatus, refetch } = useJourneyStatus();
  const bypassCheckpointRedirect = hasCheckpointRedirectBypass();

  const rawDayNumber = Number(rawStatus?.dayNumber ?? rawStatus?.day_number ?? 0);
  const checkpointDay = hasActiveJourney && (rawDayNumber === 7 || rawDayNumber === 14)
    ? rawDayNumber
    : null;

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#888',
        }}
      >
        Loading…
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0a0a0a',
          color: '#f0ede8',
          gap: 16,
        }}
      >
        <p style={{ color: '#888' }}>Could not verify journey status.</p>
        <button
          onClick={refetch}
          style={{
            padding: '10px 24px',
            background: '#2a2a2a',
            borderRadius: 8,
            color: '#f0ede8',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!hasActiveJourney) return <Navigate to="/en/mitra/start" replace />;

  if (
    checkpointDay != null &&
    !bypassCheckpointRedirect &&
    location.pathname !== `/en/mitra/checkpoint/${checkpointDay}`
  ) {
    return <Navigate to={`/en/mitra/checkpoint/${checkpointDay}`} replace />;
  }

  return <>{children}</>;
}
