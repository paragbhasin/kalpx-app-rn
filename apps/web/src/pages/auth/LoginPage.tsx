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
  const [showPassword, setShowPassword] = useState(false);
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
          <label htmlFor="login-email" className="sr-only">Email</label>
          <input
            id="login-email"
            data-testid="login-email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            style={inputStyle}
          />
          {fieldErrors.email && (
            <p data-testid="login-email-error" style={errorStyle}>{fieldErrors.email}</p>
          )}
        </div>
        <div>
          <label htmlFor="login-password" className="sr-only">Password</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input
              id="login-password"
              data-testid="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{ ...inputStyle, paddingRight: 44 }}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide' : 'Show'}
              onClick={() => setShowPassword((v) => !v)}
              style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 40,
                minHeight: 40,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0 10px',
                color: 'var(--kalpx-text-muted)',
              }}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p data-testid="login-password-error" style={errorStyle}>{fieldErrors.password}</p>
          )}
        </div>
        {globalError && (
          <p
            data-testid="login-error"
            style={{ ...errorStyle, textAlign: 'center', padding: '8px 12px', background: '#fff1f0', color: '#c0392b', borderRadius: 6 }}
          >
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

      <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: 'var(--kalpx-text-muted)', display: 'flex', justifyContent: 'center', gap: 16 }}>
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
