import React from 'react';
import { Navigate } from 'react-router-dom';
import { useJourneyStatus } from '../hooks/useJourneyStatus';

interface Props {
  children: React.ReactNode;
}

export function RequiresJourney({ children }: Props) {
  const { loading, error, hasActiveJourney, refetch } = useJourneyStatus();

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

  return <>{children}</>;
}
