import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useGuestIdentity } from '../../hooks/useGuestIdentity';
import { useJourneyStatus } from '../../hooks/useJourneyStatus';
import { WEB_ENV } from '../../lib/env';
import { AUTH_KEYS } from '@kalpx/api-client';

export function MitraHomePage() {
  useGuestIdentity();
  const navigate = useNavigate();
  const { loading, error, hasActiveJourney, refetch } = useJourneyStatus();

  // Redirect once status is known — no full-page guard needed here, just light routing
  useEffect(() => {
    if (loading) return;
    if (hasActiveJourney === true) {
      navigate('/en/mitra/dashboard', { replace: true });
    }
    // else: hasActiveJourney = false or null (error) — stay on this page
  }, [loading, hasActiveJourney, navigate]);

  if (loading) {
    return (
      <div style={centeredPage}>
        <p style={{ color: '#888' }}>Loading…</p>
      </div>
    );
  }

  return (
    <div style={centeredPage}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: 32 }}>
        <p style={{ fontSize: 20, letterSpacing: 3, color: '#c9a96e', marginBottom: 8 }}>KALPX</p>
        <h1 style={{ fontWeight: 300, fontSize: 28, marginBottom: 8 }}>Mitra</h1>
        <p style={{ color: '#888', marginBottom: 40, lineHeight: 1.6 }}>Your spiritual companion</p>

        {error && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: '#e06060', fontSize: 14, marginBottom: 12 }}>Could not check journey status.</p>
            <button onClick={refetch} style={secondaryBtn}>Retry</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Link to="/en/mitra/start" style={primaryBtn}>
            Begin journey
          </Link>
          <Link to="/login" style={secondaryBtnLink}>
            Sign in
          </Link>
        </div>

        {WEB_ENV.isDev && (
          <div style={{ marginTop: 40, padding: '12px 16px', background: '#111', borderRadius: 8, fontSize: 11, fontFamily: 'monospace', color: '#666', textAlign: 'left' }}>
            <div>API: {WEB_ENV.apiBaseUrl}</div>
            <div>guestUUID: {localStorage.getItem(AUTH_KEYS.guestUUID) ?? 'none'}</div>
            <div>access_token: {localStorage.getItem(AUTH_KEYS.accessToken) ? 'present' : 'none'}</div>
          </div>
        )}
      </div>
    </div>
  );
}

const centeredPage: React.CSSProperties = {
  minHeight: '100dvh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#0a0a0a',
  color: '#f0ede8',
};

const primaryBtn: React.CSSProperties = {
  display: 'block',
  padding: '14px 32px',
  background: '#c9a96e',
  color: '#0a0a0a',
  borderRadius: 8,
  fontWeight: 600,
  fontSize: 16,
  textAlign: 'center',
  textDecoration: 'none',
};

const secondaryBtn: React.CSSProperties = {
  padding: '10px 24px',
  background: '#1a1a1a',
  border: '1px solid #333',
  borderRadius: 8,
  color: '#f0ede8',
  fontSize: 14,
};

const secondaryBtnLink: React.CSSProperties = {
  display: 'block',
  padding: '12px 32px',
  border: '1px solid #333',
  borderRadius: 8,
  color: '#f0ede8',
  textAlign: 'center',
  textDecoration: 'none',
  fontSize: 14,
};
