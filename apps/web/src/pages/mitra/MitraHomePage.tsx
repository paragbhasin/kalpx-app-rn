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

  useEffect(() => {
    if (loading) return;
    if (hasActiveJourney === true) {
      navigate('/en/mitra/dashboard', { replace: true });
      return;
    }
    if (hasActiveJourney === false && typeof localStorage !== 'undefined' && !!localStorage.getItem(AUTH_KEYS.accessToken)) {
      navigate('/en/mitra/welcome-back', { replace: true });
    }
  }, [loading, hasActiveJourney, navigate]);

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: '#FFF8EF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 28, height: 28, border: '2px solid var(--kalpx-cta)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        backgroundImage: 'url(/new_home.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 24px calc(56px + env(safe-area-inset-bottom))',
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        {/* Diamond divider — matches RN Home.tsx */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(199,162,88,0.4)', maxWidth: 60 }} />
          <span style={{ fontSize: 10, color: '#c7a258' }}>◆</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(199,162,88,0.4)', maxWidth: 60 }} />
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 300, color: '#432104', marginBottom: 8, fontFamily: 'var(--kalpx-font-serif)' }}>
          KalpX Mitra
        </h1>
        <p style={{ color: '#6b4c1a', marginBottom: 8, lineHeight: 1.6 }}>
          Your daily companion for life
        </p>
        <p style={{ color: '#6b4c1a', fontSize: 14, lineHeight: 1.6, maxWidth: 280, margin: '0 auto 32px' }}>
          Grounded in timeless Sanatan wisdom.
        </p>

        <img src="/new_home_lotus.png" alt="" style={{ width: '40vw', maxWidth: 200, opacity: 0.7, marginBottom: 24 }} />

        {error && (
          <p style={{ color: '#e06060', fontSize: 13, marginBottom: 16 }}>
            Could not check status.{' '}
            <button onClick={refetch} style={{ background: 'none', border: 'none', color: '#c9a96e', cursor: 'pointer', fontSize: 13 }}>
              Retry
            </button>
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 360, marginBottom: 8 }}>
        <Link
          to="/en/mitra/start"
          style={{
            display: 'block',
            padding: '16px 32px',
            background: 'linear-gradient(to right, #E5D4CA, #F5EDEA)',
            color: '#432104',
            borderRadius: 28,
            fontWeight: 600,
            fontSize: 16,
            textAlign: 'center',
            textDecoration: 'none',
            border: '1px solid rgba(199,162,88,0.3)',
          }}
        >
          Begin your journey →
        </Link>

        <Link
          to="/login"
          style={{
            display: 'block',
            padding: '14px 32px',
            border: '1px solid rgba(199,162,88,0.4)',
            borderRadius: 28,
            color: '#432104',
            textAlign: 'center',
            textDecoration: 'none',
            fontSize: 14,
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        >
          Sign in
        </Link>
      </div>

      {WEB_ENV.isDev && typeof window !== 'undefined' && window.location.search.includes('debug') && (
        <div style={{ margin: '16px 0', padding: '12px 16px', background: 'rgba(0,0,0,0.5)', borderRadius: 8, fontSize: 11, fontFamily: 'monospace', color: '#aaa', textAlign: 'left', width: '100%', maxWidth: 360 }}>
          <div>API: {WEB_ENV.apiBaseUrl}</div>
          <div>guestUUID: {localStorage.getItem(AUTH_KEYS.guestUUID) ?? 'none'}</div>
          <div>access_token: {localStorage.getItem(AUTH_KEYS.accessToken) ? 'present' : 'none'}</div>
        </div>
      )}
    </div>
  );
}
