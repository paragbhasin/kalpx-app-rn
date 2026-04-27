/**
 * ResetPasswordPage — step 2 of OTP-based password reset.
 * POST users/reset_password/ with {email, otp, new_password, recaptcha_token}.
 * Email comes from router state (set by ForgotPasswordPage after sending OTP).
 */
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../components/AuthLayout';
import { useAuth } from '../../hooks/useAuth';

export function ResetPasswordPage() {
  const { resetPassword } = useAuth();
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
    if (!email) { setError('Email is required.'); return; }
    if (!otp) { setError('Please enter the reset code.'); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }

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
      <AuthLayout title="Password reset">
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#aaa', marginBottom: 24, lineHeight: 1.6 }}>
            Your password has been reset successfully.
          </p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '14px 28px',
              background: '#c9a96e',
              color: '#0a0a0a',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            Sign in
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Enter reset code">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <p style={{ color: '#888', fontSize: 14, margin: 0, lineHeight: 1.6 }}>
          Enter the code we sent to your email and choose a new password.
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
          placeholder="Reset code"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          maxLength={6}
          autoFocus
          style={{ ...inputStyle, letterSpacing: 6, textAlign: 'center', fontSize: 20 }}
          data-testid="reset-otp-input"
        />

        <input
          type="password"
          placeholder="New password"
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

        {error && <p style={{ color: '#e06060', fontSize: 12 }} data-testid="reset-error">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          data-testid="reset-submit-btn"
          style={{
            padding: '14px',
            background: loading ? '#7a6640' : '#c9a96e',
            color: '#0a0a0a',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {loading ? 'Resetting…' : 'Reset password'}
        </button>

        <div style={{ textAlign: 'center', fontSize: 14, display: 'flex', justifyContent: 'center', gap: 12 }}>
          <Link to="/forgot-password" style={{ color: '#c9a96e' }}>Resend code</Link>
          <span style={{ color: '#444' }}>·</span>
          <Link to="/login" style={{ color: '#c9a96e' }}>Sign in</Link>
        </div>
      </form>
    </AuthLayout>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: '#1a1a1a',
  border: '1px solid #333',
  borderRadius: 8,
  color: '#f0ede8',
  fontSize: 16,
  outline: 'none',
  boxSizing: 'border-box',
};
