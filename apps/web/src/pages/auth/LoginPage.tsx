import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { AuthLayout } from '../../components/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { useGuestIdentity } from '../../hooks/useGuestIdentity';
import { useAppDispatch } from '../../store/hooks';
import { showSnackBar } from '../../store/snackBarSlice';
import { loginSchema } from '@kalpx/validation';

export function LoginPage() {
  useGuestIdentity();
  const { login, socialLoginGoogle } = useAuth();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') ?? undefined;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = useGoogleLogin({
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      const { success, error } = await socialLoginGoogle(tokenResponse.access_token, returnTo);
      setGoogleLoading(false);
      if (!success && error) dispatch(showSnackBar(error));
    },
    onError: () => {
      dispatch(showSnackBar('Google sign-in was cancelled or failed. Please try again.'));
    },
  });

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

  const isAnyLoading = loading || googleLoading;

  return (
    <AuthLayout title="Sign in">
      <button
        type="button"
        onClick={() => handleGoogleLogin()}
        disabled={isAnyLoading}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          padding: '11px 16px',
          background: '#fff',
          border: '1px solid var(--kalpx-border-gold)',
          borderRadius: 8,
          fontSize: 15,
          fontWeight: 500,
          color: '#3c3c3c',
          cursor: isAnyLoading ? 'not-allowed' : 'pointer',
          opacity: isAnyLoading ? 0.6 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        {googleLoading ? (
          <span style={{ fontSize: 14, color: 'var(--kalpx-text-muted)' }}>Signing in…</span>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
            Continue with Google
          </>
        )}
      </button>

      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--kalpx-text-muted)', margin: '12px 0' }}>
        — or —
      </div>

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
          disabled={isAnyLoading}
          style={{
            padding: '14px',
            background: isAnyLoading ? 'var(--kalpx-text-muted)' : 'var(--kalpx-cta)',
            color: 'var(--kalpx-cta-text)',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 16,
            transition: 'background 0.2s',
            border: 'none',
            cursor: isAnyLoading ? 'not-allowed' : 'pointer',
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
