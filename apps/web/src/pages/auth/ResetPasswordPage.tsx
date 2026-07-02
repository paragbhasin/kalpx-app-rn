/**
 * ResetPasswordPage — step 2 of OTP-based password reset.
 * POST users/reset_password/ with {email, otp, new_password, recaptcha_token}.
 * Email comes from router state (set by ForgotPasswordPage after sending OTP).
 */
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { KalpXButton } from '../../components/ui';
import { useTranslation } from '../../lib/i18n';

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const emailFromState: string = (location.state as any)?.email ?? '';
  const [email, setEmail] = useState(emailFromState);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email) { setError(t('auth.emailRequired')); return; }
    if (!otp) { setError('Please enter the reset code.'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setError(t('auth.passwordsNoMatch')); return; }

    setLoading(true);
    const result = await resetPassword(email, otp, newPassword);
    setLoading(false);

    if (result.success) {
      setDone(true);
    } else {
      setError(result.error ?? 'Password reset failed. Please check the code and try again.');
    }
  }

  if (done) {
    return (
      <AuthLayout title={t('auth.resetPasswordTitle')}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--kalpx-text-soft)', marginBottom: 24, lineHeight: 1.6 }}>
            {t('auth.resetPasswordSuccess')}
          </p>
          <KalpXButton onClick={() => navigate('/login')}>
            {t('auth.signIn')}
          </KalpXButton>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('auth.enterResetCode')}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Link to="/forgot-password" style={{ color: 'var(--kalpx-cta)', fontSize: 14 }}>← Back</Link>
        <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          {t('auth.resetCodeSubtitle')}
        </p>

        {!emailFromState && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            style={inputStyle}
          />
        )}

        <input
          type="text"
          inputMode="numeric"
          placeholder={t('auth.resetCode')}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          maxLength={6}
          autoFocus
          style={{ ...inputStyle, letterSpacing: 6, textAlign: 'center', fontSize: 20 }}
          data-testid="reset-otp-input"
        />

        <input
          type="password"
          placeholder={t('auth.newPassword')}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          autoComplete="new-password"
          style={inputStyle}
          data-testid="reset-new-password"
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          style={inputStyle}
          data-testid="reset-confirm-password"
        />

        {error && <p style={{ color: '#c0392b', fontSize: 12 }} data-testid="reset-error">{error}</p>}

        <KalpXButton
          type="submit"
          disabled={loading}
          loading={loading}
          loadingText="Resetting…"
          fullWidth
          data-testid="reset-submit-btn"
        >
          {t('auth.resetPasswordBtn')}
        </KalpXButton>

        <div style={{ textAlign: 'center', fontSize: 14, display: 'flex', justifyContent: 'center', gap: 12 }}>
          <Link to="/forgot-password" style={{ color: 'var(--kalpx-cta)' }}>{t('auth.resendCode')}</Link>
          <span style={{ color: 'var(--kalpx-text-muted)' }}>·</span>
          <Link to="/login" style={{ color: 'var(--kalpx-cta)' }}>{t('auth.signIn')}</Link>
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
