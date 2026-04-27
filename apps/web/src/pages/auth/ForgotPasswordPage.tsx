import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '../../components/PageShell';
import { forgotPasswordSchema } from '@kalpx/validation';
import { api } from '../../lib/api';
import { useAppDispatch } from '../../store/hooks';
import { showSnackBar } from '../../store/snackBarSlice';

export function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = forgotPasswordSchema.safeParse({ email });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[String(err.path[0])] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await api.post('auth/password-reset/', { email });
      setSent(true);
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? 'Request failed. Please try again.';
      dispatch(showSnackBar(msg));
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <PageShell centered>
        <div style={{ textAlign: 'center', padding: 32 }}>
          <p style={{ marginBottom: 16 }}>Check your email for a reset link.</p>
          <Link to="/login" style={{ color: '#c9a96e' }}>Back to sign in</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell centered>
      <div style={{ width: '100%', maxWidth: 400, padding: 32 }}>
        <h2 style={{ fontWeight: 300, marginBottom: 32, textAlign: 'center' }}>Reset password</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
            {errors.email && <p style={errorStyle}>{errors.email}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              background: '#c9a96e',
              color: '#0a0a0a',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 16,
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14 }}>
          <Link to="/login" style={{ color: '#c9a96e' }}>Back to sign in</Link>
        </div>
      </div>
    </PageShell>
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
};

const errorStyle: React.CSSProperties = {
  color: '#cc4444',
  fontSize: 12,
  marginTop: 4,
};
