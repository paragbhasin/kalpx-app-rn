import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useJourneyStatus } from '../hooks/useJourneyStatus';
import { mapJourneyEntryViewPath, useJourneyEntryView } from '../hooks/useJourneyEntryView';

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
  const { loading, error, hasActiveJourney, refetch } = useJourneyStatus();
  const bypassCheckpointRedirect = hasCheckpointRedirectBypass();
  const {
    loading: entryLoading,
    error: entryError,
    viewKey,
    refetch: refetchEntryView,
  } = useJourneyEntryView(hasActiveJourney === true);

  if (loading || (hasActiveJourney === true && (entryLoading || (viewKey === null && !entryError)))) {
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

  if (error || entryError) {
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
          onClick={() => {
            refetch();
            refetchEntryView();
          }}
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

  if (!hasActiveJourney) {
    return (
      <Navigate
        to="/en/mitra/onboarding?containerId=welcome_onboarding&stateId=turn_1"
        replace
      />
    );
  }

  const targetPath = viewKey ? mapJourneyEntryViewPath(viewKey) : null;
  const shouldRedirectToCheckpoint =
    viewKey != null &&
    (viewKey === 'day_7_view' || viewKey === 'day_14_view') &&
    !bypassCheckpointRedirect &&
    targetPath !== location.pathname;

  if (shouldRedirectToCheckpoint) {
    return <Navigate to={targetPath!} replace />;
  }

  if (viewKey === 'welcome_back_surface' && location.pathname !== targetPath) {
    return <Navigate to={targetPath!} replace />;
  }

  if (viewKey === 'onboarding_start' && location.pathname !== targetPath) {
    return <Navigate to={targetPath!} replace />;
  }

  return <>{children}</>;
}
