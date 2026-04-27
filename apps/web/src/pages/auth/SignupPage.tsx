import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageShell } from '../../components/PageShell';
import { signupSchema } from '@kalpx/validation';
import { storeTokens } from '@kalpx/auth';
import { webStorage } from '../../lib/webStorage';
import { api } from '../../lib/api';
import { useAppDispatch } from '../../store/hooks';
import { showSnackBar } from '../../store/snackBarSlice';

export function SignupPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse(form);
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
      const res = await api.post('auth/register/', form);
      await storeTokens(webStorage, {
        accessToken: res.data.access,
        refreshToken: res.data.refresh,
      });
      navigate('/en/mitra/start');
    } catch (err: any) {
      const msg = err?.response?.data?.detail ?? 'Registration failed. Please try again.';
      dispatch(showSnackBar(msg));
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell centered>
      <div style={{ width: '100%', maxWidth: 400, padding: 32 }}>
        <h2 style={{ fontWeight: 300, marginBottom: 32, textAlign: 'center' }}>Create account</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {(['first_name', 'last_name', 'email', 'password'] as const).map((field) => (
            <div key={field}>
              <input
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                placeholder={field.replace('_', ' ')}
                value={form[field]}
                onChange={(e) => set(field, e.target.value)}
                style={inputStyle}
              />
              {errors[field] && <p style={errorStyle}>{errors[field]}</p>}
            </div>
          ))}
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
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#888' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#c9a96e' }}>Sign in</Link>
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
