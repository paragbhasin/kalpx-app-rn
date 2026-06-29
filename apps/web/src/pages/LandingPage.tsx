import React from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '../components/PageShell';
import { useTranslation } from '../lib/i18n';

export function LandingPage() {
  const { t } = useTranslation();
  return (
    <PageShell centered>
      <div style={{ textAlign: 'center', padding: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 300, marginBottom: 8 }}>KalpX</h1>
        <p style={{ color: '#888', marginBottom: 32 }}>{t('landing.tagline')}</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link
            to="/en/mitra"
            style={{
              padding: '12px 32px',
              background: '#c9a96e',
              color: '#0a0a0a',
              borderRadius: 8,
              fontWeight: 500,
            }}
          >
            {t('landing.openMitra')}
          </Link>
          <Link
            to="/login"
            style={{
              padding: '12px 32px',
              border: '1px solid #444',
              borderRadius: 8,
            }}
          >
            {t('landing.signIn')}
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
