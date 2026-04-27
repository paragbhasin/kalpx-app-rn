/**
 * ForgotPasswordPage — POST users/reset_password/ (confirmed from apps/mobile/src/screens/Signup/actions.ts)
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../../components/AuthLayout';
import { useAuth } from '../../hooks/useAuth';

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email) { setError('Email is required.'); return; }

    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setSent(true);
    } else {
      // Show success anyway — don't reveal whether email exists
      setSent(true);
    }
  }

  return (
    <AuthLayout title="Reset password">
      {sent ? (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#aaa', marginBottom: 24, lineHeight: 1.6 }}>
            If an account exists for <strong>{email}</strong>, you'll receive a reset link shortly.
          </p>
          <Link to="/login" style={{ color: '#c9a96e', fontSize: 14 }}>← Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            style={inputStyle}
          />
          {error && <p style={{ color: '#e06060', fontSize: 12 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              background: loading ? '#7a6640' : '#c9a96e',
              color: '#0a0a0a',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
          <div style={{ textAlign: 'center', fontSize: 14 }}>
            <Link to="/login" style={{ color: '#c9a96e' }}>← Back to sign in</Link>
          </div>
        </form>
      )}
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
