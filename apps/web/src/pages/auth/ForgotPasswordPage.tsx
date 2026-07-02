/**
 * ForgotPasswordPage — step 1 of OTP-based password reset.
 * POST users/reset_password/ with {email} sends OTP to user's email.
 * On success, navigates to /reset-password with email in state for step 2.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { KalpXButton } from '../../components/ui';
import { useTranslation } from '../../lib/i18n';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email) { setError(t('auth.emailRequired')); return; }

    setLoading(true);
    // Call succeeds or fails — always navigate to step 2 to avoid account enumeration
    await forgotPassword(email);
    setLoading(false);
    navigate('/reset-password', { state: { email } });
  }

  return (
    <AuthLayout title={t('auth.resetPasswordTitle')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          {t('auth.forgotPasswordSubtitle')}
        </p>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          style={inputStyle}
        />
        {error && <p style={{ color: '#c0392b', fontSize: 12 }}>{error}</p>}
        <KalpXButton type="submit" disabled={loading} loading={loading} loadingText="Sending…" fullWidth>
          {t('auth.sendResetCode')}
        </KalpXButton>
        <div style={{ textAlign: 'center', fontSize: 14 }}>
          <Link to="/login" style={{ color: 'var(--kalpx-cta)' }}>{t('auth.backToSignIn')}</Link>
        </div>
      </form>
    </AuthLayout>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: 'var(--kalpx-bg)',
  border: '1px solid var(--kalpx-border)',
  borderRadius: 8,
  color: 'var(--kalpx-text)',
  fontSize: 16,
  outline: 'none',
  boxSizing: 'border-box',
};
