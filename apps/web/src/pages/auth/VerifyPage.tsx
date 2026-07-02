import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../../components/AuthLayout';
import { KalpXButton } from '../../components/ui';
import { api } from '../../lib/api';
import { webStorage } from '../../lib/webStorage';
import { storeTokens } from '@kalpx/auth';
import { invalidateJourneyStatusCache } from '../../hooks/useJourneyStatus';
import { invalidateJourneyEntryViewCache } from '../../hooks/useJourneyEntryView';
import { claimGuestJourney } from '../../engine/mitraApi';
import { useTranslation } from '../../lib/i18n';

type VerifyState = 'verifying' | 'success' | 'expired' | 'invalid';

export function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const token = searchParams.get('token');
  const [state, setState] = useState<VerifyState>(token ? 'verifying' : 'invalid');

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function verify() {
      try {
        const res = await api.post<{ access_token: string; refresh_token: string }>('users/soft_verify_api/', { token });
        if (cancelled) return;
        const { access_token, refresh_token } = res.data;
        await storeTokens(webStorage, { accessToken: access_token, refreshToken: refresh_token });
        invalidateJourneyStatusCache();
        invalidateJourneyEntryViewCache();
        try { await claimGuestJourney(); } catch { /* swallow */ }
        invalidateJourneyStatusCache();
        invalidateJourneyEntryViewCache();
        setState('success');
      } catch (err: any) {
        if (cancelled) return;
        const msg: string = err?.response?.data?.error ?? '';
        setState(msg === 'expired' ? 'expired' : 'invalid');
      }
    }

    verify();
    return () => { cancelled = true; };
  }, [token]);

  if (state === 'verifying') {
    return (
      <AuthLayout title={t('auth.verifyingEmail')}>
        <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, textAlign: 'center', lineHeight: 1.6 }}>
          {t('auth.pleaseWait')}
        </p>
      </AuthLayout>
    );
  }

  if (state === 'success') {
    return (
      <AuthLayout title={t('auth.emailVerified')}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            {t('auth.emailVerifiedMessage')}
          </p>
          <KalpXButton
            onClick={() =>
              navigate(
                '/en/mitra/onboarding?containerId=welcome_onboarding&stateId=turn_1',
              )
            }
            fullWidth
          >
            {t('auth.continue')}
          </KalpXButton>
        </div>
      </AuthLayout>
    );
  }

  if (state === 'expired') {
    return (
      <AuthLayout title={t('auth.linkExpired')}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            {t('auth.linkExpiredMessage')}
          </p>
          <KalpXButton onClick={() => navigate('/login')} fullWidth>
            {t('auth.backToSignIn')}
          </KalpXButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('auth.invalidLink')}>
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          {t('auth.invalidLinkMessage')}
        </p>
        <KalpXButton onClick={() => navigate('/login')} fullWidth>
          {t('auth.backToSignIn')}
        </KalpXButton>
      </div>
    </AuthLayout>
  );
}
