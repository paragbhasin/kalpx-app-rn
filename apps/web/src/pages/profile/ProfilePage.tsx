/**
 * ProfilePage — Phase 11.
 * Shows user identity, Mitra preferences, and session controls.
 * Wrapped in RequiresAuth — unauthenticated access redirects to /login.
 */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile } from '../../lib/userApi';
import { getUserPreferences } from '../../engine/mitraApi';
import { WEB_ENV } from '../../lib/env';
import type { UserProfile } from '../../types/auth';
import { AppShell, SectionCard, KalpXButton } from '../../components/ui';

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
    <AppShell>
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 20px', paddingBottom: 'calc(80px + env(safe-area-inset-bottom))' }}>
        {/* Identity */}
        <SectionCard data-testid="profile-identity">
          {loadingProfile ? (
            <p style={{ color: 'var(--kalpx-text-muted)', fontSize: 14 }}>Loading profile…</p>
          ) : profile ? (
            <>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--kalpx-gold)', textTransform: 'uppercase', marginBottom: 8 }}>
                Account
              </p>
              {displayName && (
                <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--kalpx-text)', marginBottom: 4 }} data-testid="profile-name">
                  {displayName}
                </p>
              )}
              <p style={{ fontSize: 14, color: 'var(--kalpx-text-muted)' }} data-testid="profile-email">
                {profile.email}
              </p>
            </>
          ) : (
            <p style={{ color: 'var(--kalpx-text-muted)', fontSize: 14 }}>Could not load profile.</p>
          )}
        </SectionCard>

        {/* Preferences */}
        {prefs && (
          <SectionCard data-testid="profile-preferences">
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: 'var(--kalpx-gold)', textTransform: 'uppercase', marginBottom: 12 }}>
              Mitra Preferences
            </p>
            {prefs.guidance_mode && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)' }}>Guidance mode</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--kalpx-text)' }} data-testid="profile-guidance-mode">
                  {GUIDANCE_MODE_LABELS[prefs.guidance_mode] ?? prefs.guidance_mode}
                </p>
              </div>
            )}
            {typeof prefs.voice_consent_given === 'boolean' && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: 14, color: 'var(--kalpx-text-soft)' }}>Voice notes</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--kalpx-text)' }} data-testid="profile-voice-consent">
                  {prefs.voice_consent_given ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            )}
          </SectionCard>
        )}

        {/* Navigation */}
        <SectionCard p={16}>
          <Link
            to="/en/mitra/dashboard"
            data-testid="profile-dashboard-link"
            style={{ display: 'block', fontSize: 15, color: 'var(--kalpx-text-soft)', padding: '8px 0', textDecoration: 'none' }}
          >
            ← Back to Mitra
          </Link>
        </SectionCard>

        {/* Logout */}
        <SectionCard p={16} mb={0}>
          <KalpXButton
            variant="destructive"
            fullWidth
            data-testid="profile-logout-btn"
            onClick={handleLogout}
          >
            Sign out
          </KalpXButton>
        </SectionCard>

        {/* Dev-only guest UUID debug */}
        {WEB_ENV.isDev && guestUUID && (
          <p style={{ fontSize: 10, color: '#ccc', marginTop: 16, textAlign: 'center', fontFamily: 'monospace' }}>
            guestUUID: {guestUUID}
          </p>
        )}
      </div>
    </AppShell>
  );
}
