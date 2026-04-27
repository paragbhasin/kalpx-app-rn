import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../../components/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { useGuestIdentity } from '../../hooks/useGuestIdentity';
import { loginSchema } from '@kalpx/validation';

export function LoginPage() {
  useGuestIdentity();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') ?? undefined;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setGlobalError('');

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) errs[String(err.path[0])] = err.message;
      });
      setFieldErrors(errs);
      return;
    }

    setLoading(true);
    const { success, error } = await login(email, password, returnTo);
    setLoading(false);

    if (!success && error) setGlobalError(error);
  }

  return (
    <AuthLayout title="Sign in">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            style={inputStyle}
          />
          {fieldErrors.email && <p style={errorStyle}>{fieldErrors.email}</p>}
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            style={inputStyle}
          />
          {fieldErrors.password && <p style={errorStyle}>{fieldErrors.password}</p>}
        </div>
        {globalError && (
          <p style={{ ...errorStyle, textAlign: 'center', padding: '8px 12px', background: '#fff1f0', color: '#c0392b', borderRadius: 6 }}>
            {globalError}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '14px',
            background: loading ? 'var(--kalpx-text-muted)' : 'var(--kalpx-cta)',
            color: 'var(--kalpx-cta-text)',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            transition: 'background 0.2s',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#888', display: 'flex', justifyContent: 'center', gap: 16 }}>
        <Link to="/forgot-password" style={{ color: 'var(--kalpx-cta)' }}>Forgot password?</Link>
        <span>·</span>
        <Link to="/signup" style={{ color: 'var(--kalpx-cta)' }}>Create account</Link>
      </div>
    </AuthLayout>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 16px',
  background: 'var(--kalpx-bg)',
  border: '1px solid var(--kalpx-border-gold)',
  borderRadius: 8,
  color: 'var(--kalpx-text)',
  fontSize: 16,
  outline: 'none',
  boxSizing: 'border-box',
};

const errorStyle: React.CSSProperties = {
  color: '#c0392b',
  fontSize: 12,
  marginTop: 4,
};
