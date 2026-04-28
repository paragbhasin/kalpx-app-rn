/**
 * SignupPage — 3-step OTP flow.
 * Step 1: Email → POST users/generate_otp/
 * Step 2: Verify OTP → POST users/verify_otp/
 * Step 3: Complete registration → POST users/register/
 *
 * reCAPTCHA: dev bypass token used in Phase 4.
 * Production will require real reCAPTCHA widget integration.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../components/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { KalpXButton } from '../../components/ui';

type Step = 'email' | 'otp' | 'register';

export function SignupPage() {
  const { generateOtp, verifyOtp, registerUser } = useAuth();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email) { setError('Email is required.'); return; }
    setLoading(true);
    const result = await generateOtp(email);
    setLoading(false);
    if (result.success) {
      setStep('otp');
    } else {
      setError(result.error ?? 'Could not send OTP.');
    }
  }

  async function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!otp) { setError('Please enter the OTP.'); return; }
    setLoading(true);
    const result = await verifyOtp(email, otp);
    setLoading(false);
    if (result.success) {
      setStep('register');
    } else {
      setError(result.error ?? 'OTP verification failed.');
    }
  }

  async function handleStep3(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    const result = await registerUser({ email, password, confirm_password: confirmPassword, first_name: firstName, last_name: lastName });
    setLoading(false);
    if (!result.success) setError(result.error ?? 'Registration failed.');
  }

  return (
    <AuthLayout title={step === 'email' ? 'Create account' : step === 'otp' ? 'Verify email' : 'Almost there'}>
      {step === 'email' && (
        <form onSubmit={handleStep1} style={formStyle}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" style={inputStyle} />
          {error && <p style={errorStyle}>{error}</p>}
          <KalpXButton type="submit" disabled={loading} loading={loading} loadingText="Sending…" fullWidth>
            Continue
          </KalpXButton>
          <div style={linkRow}>
            Already have an account? <Link to="/login" style={linkStyle}>Sign in</Link>
          </div>
        </form>
      )}

      {step === 'otp' && (
        <form onSubmit={handleStep2} style={formStyle}>
          <p style={{ color: 'var(--kalpx-text-soft)', fontSize: 14, margin: 0 }}>Enter the code sent to <strong>{email}</strong></p>
          <input
            type="text"
            inputMode="numeric"
            placeholder="OTP code"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            style={{ ...inputStyle, letterSpacing: 8, textAlign: 'center', fontSize: 22 }}
            maxLength={6}
            autoFocus
          />
          {error && <p style={errorStyle}>{error}</p>}
          <KalpXButton type="submit" disabled={loading} loading={loading} loadingText="Verifying…" fullWidth>
            Verify
          </KalpXButton>
          <button type="button" onClick={() => { setStep('email'); setOtp(''); setError(''); }} style={{ background: 'none', color: 'var(--kalpx-text-muted)', fontSize: 13, padding: '8px 0' }}>
            ← Change email
          </button>
        </form>
      )}

      {step === 'register' && (
        <form onSubmit={handleStep3} style={formStyle}>
          <div style={{ display: 'flex', gap: 12 }}>
            <input type="text" placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
          </div>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" style={inputStyle} />
          <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" style={inputStyle} />
          {error && <p style={errorStyle}>{error}</p>}
          <KalpXButton type="submit" disabled={loading} loading={loading} loadingText="Creating account…" fullWidth>
            Create account
          </KalpXButton>
        </form>
      )}
    </AuthLayout>
  );
}

const formStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 16 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', background: 'var(--kalpx-bg)', border: '1px solid var(--kalpx-border)', borderRadius: 8, color: 'var(--kalpx-text)', fontSize: 16, outline: 'none', boxSizing: 'border-box' };
const errorStyle: React.CSSProperties = { color: '#c0392b', fontSize: 12, marginTop: 0 };
const linkRow: React.CSSProperties = { textAlign: 'center', fontSize: 14, color: 'var(--kalpx-text-muted)' };
const linkStyle: React.CSSProperties = { color: 'var(--kalpx-cta)' };
