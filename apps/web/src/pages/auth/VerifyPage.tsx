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

type VerifyState = 'verifying' | 'success' | 'expired' | 'invalid';

export function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
      <AuthLayout title="Verifying your email">
        <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, textAlign: 'center', lineHeight: 1.6 }}>
          Please wait…
        </p>
      </AuthLayout>
    );
  }

  if (state === 'success') {
    return (
      <AuthLayout title="Email verified">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            Your email has been verified. You're now signed in.
          </p>
          <KalpXButton
            onClick={() =>
              navigate(
                '/en/mitra/onboarding?containerId=welcome_onboarding&stateId=turn_1',
              )
            }
            fullWidth
          >
            Continue
          </KalpXButton>
        </div>
      </AuthLayout>
    );
  }

  if (state === 'expired') {
    return (
      <AuthLayout title="Link expired">
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            Your verification link has expired. We've sent a fresh one — check your inbox.
          </p>
          <KalpXButton onClick={() => navigate('/login')} fullWidth>
            Back to sign in
          </KalpXButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Invalid link">
      <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          This verification link is invalid or has already been used.
        </p>
        <KalpXButton onClick={() => navigate('/login')} fullWidth>
          Back to sign in
        </KalpXButton>
      </div>
    </AuthLayout>
  );
}
