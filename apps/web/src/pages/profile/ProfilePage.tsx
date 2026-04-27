/**
 * ProfilePage — Phase 11.
 * Shows user identity, Mitra preferences, and session controls.
 * Wrapped in RequiresAuth — unauthenticated access redirects to /login.
 */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile } from '../../lib/userApi';
import { getUserPreferences } from '../../engine/mitraApi';
import { WEB_ENV } from '../../lib/env';
import type { UserProfile } from '../../types/auth';

const GUIDANCE_MODE_LABELS: Record<string, string> = {
  guided: 'Guided',
  exploratory: 'Exploratory',
  hybrid: 'Hybrid',
};

export function ProfilePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [prefs, setPrefs] = useState<Record<string, any> | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [guestUUID, setGuestUUID] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [p, pr, gid] = await Promise.all([
        getUserProfile(),
        getUserPreferences(),
        // Dev-only: read guestUUID for debugging
        WEB_ENV.isDev ? import('../../lib/webStorage').then(m => m.webStorage.getItem('guestUUID')) : Promise.resolve(null),
      ]);
      setProfile(p);
      setPrefs(pr);
      setGuestUUID(gid);
      setLoadingProfile(false);
    }
    load();
  }, []);

  async function handleLogout() {
    await logout();
  }

  const displayName = profile
    ? [profile.first_name, profile.last_name].filter(Boolean).join(' ') || profile.profile_name || profile.username || profile.email
    : null;

  return (
    <div style={{ minHeight: '100dvh', background: '#fdf8ef', color: '#1a1a0a' }}>
      <Header />

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px 80px' }}>
        {/* Identity */}
        <section
          data-testid="profile-identity"
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: '20px',
            border: '1px solid #e8d5a0',
            marginBottom: 16,
          }}
        >
          {loadingProfile ? (
            <p style={{ color: '#9A8C78', fontSize: 14 }}>Loading profile…</p>
          ) : profile ? (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#b08840', textTransform: 'uppercase', marginBottom: 8 }}>
                Account
              </p>
              {displayName && (
                <p style={{ fontSize: 18, fontWeight: 700, color: '#1a1a0a', marginBottom: 4 }} data-testid="profile-name">
                  {displayName}
                </p>
              )}
              <p style={{ fontSize: 14, color: '#9A8C78' }} data-testid="profile-email">
                {profile.email}
              </p>
            </>
          ) : (
            <p style={{ color: '#9A8C78', fontSize: 14 }}>Could not load profile.</p>
          )}
        </section>

        {/* Preferences */}
        {prefs && (
          <section
            data-testid="profile-preferences"
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: '20px',
              border: '1px solid #e8d5a0',
              marginBottom: 16,
            }}
          >
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: '#b08840', textTransform: 'uppercase', marginBottom: 12 }}>
              Mitra Preferences
            </p>
            {prefs.guidance_mode && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: 14, color: '#4a3318' }}>Guidance mode</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a0a' }} data-testid="profile-guidance-mode">
                  {GUIDANCE_MODE_LABELS[prefs.guidance_mode] ?? prefs.guidance_mode}
                </p>
              </div>
            )}
            {typeof prefs.voice_consent_given === 'boolean' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: 14, color: '#4a3318' }}>Voice notes</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a0a' }} data-testid="profile-voice-consent">
                  {prefs.voice_consent_given ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            )}
          </section>
        )}

        {/* Navigation */}
        <section
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: '16px 20px',
            border: '1px solid #e8d5a0',
            marginBottom: 16,
          }}
        >
          <Link
            to="/en/mitra/dashboard"
            data-testid="profile-dashboard-link"
            style={{ display: 'block', fontSize: 15, color: '#4a3318', padding: '8px 0', textDecoration: 'none' }}
          >
            ← Back to Mitra
          </Link>
        </section>

        {/* Logout */}
        <section
          style={{
            background: '#fff',
            borderRadius: 12,
            padding: '16px 20px',
            border: '1px solid #e8d5a0',
          }}
        >
          <button
            data-testid="profile-logout-btn"
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              background: 'none',
              border: '1px solid #e8d5a0',
              borderRadius: 8,
              fontSize: 15,
              color: '#c0392b',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Sign out
          </button>
        </section>

        {/* Dev-only guest UUID debug */}
        {WEB_ENV.isDev && guestUUID && (
          <p style={{ fontSize: 10, color: '#ccc', marginTop: 16, textAlign: 'center', fontFamily: 'monospace' }}>
            guestUUID: {guestUUID}
          </p>
        )}
      </div>
    </div>
  );
}
