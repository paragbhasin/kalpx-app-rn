/**
 * PhoneOtpFlow — self-contained 2-step phone auth component.
 * Returns null when VITE_PHONE_AUTH_ENABLED !== '1'.
 * Step 1: phone + country input.
 * Step 2: 6-digit OTP input with countdown and resend.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PHONE_AUTH_COUNTRIES, DEFAULT_PHONE_COUNTRY } from '@kalpx/types';
import type { PhoneOtpVerifyResponse, PhoneCountryCode } from '@kalpx/types';
import { storeTokens } from '@kalpx/auth';
import { webStorage } from '../lib/webStorage';
import { requestPhoneOtp, verifyPhoneOtp, resendPhoneOtp } from '../lib/phoneApi';
import { WEB_ENV } from '../lib/env';
import { CountryDialSelector } from './CountryDialSelector';

const OTP_LENGTH = 6;
const MAX_RESENDS = 3;

const ERROR_COPY: Record<string, string> = {
  invalid_phone: 'Please enter a valid phone number.',
  rate_limit_exceeded: 'Too many attempts. Please try again later.',
  cooldown_active: 'Please wait before requesting another code.',
  otp_expired: 'This code has expired. Please request a new one.',
  invalid_otp: 'Incorrect code.',
  too_many_attempts: 'Too many incorrect attempts. Please try again later.',
  phone_auth_unavailable: 'Phone sign up is not available right now.',
  sms_send_failed: 'We couldn\'t send the code. Please try again.',
  sms_unavailable: 'We couldn\'t send the code. Please try again.',
  phone_already_in_use: 'This phone number is already linked to another KalpX account.',
  phone_auth_disabled: 'Phone login is not available yet. Please sign in with email.',
};

function errorCopy(code: string | undefined, fallback: string, extra?: string): string {
  if (!code) return fallback;
  const base = ERROR_COPY[code] || fallback;
  return extra ? `${base} ${extra}` : base;
}

interface Props {
  purpose: 'auth' | 'link_phone';
  onSuccess: (tokens?: { accessToken: string; refreshToken: string }, isNewUser?: boolean) => void;
}

export function PhoneOtpFlow({ purpose, onSuccess }: Props) {
  if (WEB_ENV.phoneAuthEnabled !== '1') return null;

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [country, setCountry] = useState<PhoneCountryCode>(DEFAULT_PHONE_COUNTRY);
  const [phone, setPhone] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const startCooldown = useCallback((seconds: number) => {
    setCooldown(seconds);
    if (cooldownRef.current) clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

  const handleRequestOtp = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 7) {
      setError('Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await requestPhoneOtp({ phone: digits, country, purpose });
    setLoading(false);
    if (!result.success) {
      setError(errorCopy(undefined, result.error));
      return;
    }
    setSessionToken(result.data.session_token);
    setMaskedPhone(result.data.masked_phone);
    startCooldown(result.data.cooldown_seconds);
    setStep('otp');
  };

  const handleOtpChange = (idx: number, val: string) => {
    const char = val.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[idx] = char;
    setOtp(next);
    if (char && idx < OTP_LENGTH - 1) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) {
      setError('Please enter the 6-digit code.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await verifyPhoneOtp({ session_token: sessionToken, otp: code });
    setLoading(false);
    if (!result.success) {
      const attemptsRemaining = (result as any).data?.attempts_remaining;
      let msg = errorCopy(result.code, result.error);
      if (result.code === 'invalid_otp' && attemptsRemaining != null) {
        msg = `${msg} ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining.`;
      }
      setError(msg);
      setOtp(Array(OTP_LENGTH).fill(''));
      otpRefs.current[0]?.focus();
      return;
    }
    const data = result.data as PhoneOtpVerifyResponse;
    if (data.access_token && data.refresh_token) {
      await storeTokens(webStorage, {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });
      onSuccess({ accessToken: data.access_token, refreshToken: data.refresh_token }, data.is_new_user);
    } else {
      // link_phone path — no tokens returned
      onSuccess(undefined, false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resendCount >= MAX_RESENDS) return;
    setLoading(true);
    setError('');
    const result = await resendPhoneOtp({ session_token: sessionToken });
    setLoading(false);
    if (!result.success) {
      setError(errorCopy(result.code, result.error));
      return;
    }
    setResendCount(result.data.resends_remaining < MAX_RESENDS ? MAX_RESENDS - result.data.resends_remaining : resendCount + 1);
    startCooldown(result.data.cooldown_seconds);
    setOtp(Array(OTP_LENGTH).fill(''));
    otpRefs.current[0]?.focus();
  };

  const dialCode = PHONE_AUTH_COUNTRIES.find((c) => c.code === country)?.dialCode ?? '+91';
  const placeholder = PHONE_AUTH_COUNTRIES.find((c) => c.code === country)?.placeholder ?? '';

  if (step === 'phone') {
    return (
      <div className="phone-otp-flow">
        <p className="phone-otp-hint">We'll send a one-time code to this number.</p>
        <div className="phone-input-row">
          <CountryDialSelector value={country} onChange={(c) => setCountry(c as PhoneCountryCode)} disabled={loading} />
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            aria-label="Phone number"
            style={{
              flex: 1,
              height: '46px',
              padding: '0 12px',
              border: '1px solid var(--kalpx-border, #ddd)',
              borderLeft: 'none',
              borderRadius: '0 8px 8px 0',
              fontSize: '1rem',
            }}
          />
        </div>
        {error && <div className="phone-otp-error">{error}</div>}
        <button
          type="button"
          className="submit-btn"
          onClick={handleRequestOtp}
          disabled={loading || phone.replace(/\D/g, '').length < 7}
        >
          {loading ? 'Sending…' : 'Send OTP'}
        </button>
      </div>
    );
  }

  const otpComplete = otp.every(Boolean);

  return (
    <div className="phone-otp-flow">
      <p className="phone-otp-hint">Enter the 6-digit code sent to <strong>{maskedPhone}</strong>.</p>
      <div className="otp-cells-row">
        {otp.map((val, idx) => (
          <input
            key={idx}
            ref={(el) => { otpRefs.current[idx] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val}
            onChange={(e) => handleOtpChange(idx, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
            disabled={loading}
            aria-label={`OTP digit ${idx + 1}`}
            style={{
              width: '44px',
              height: '52px',
              textAlign: 'center',
              fontSize: '1.4rem',
              border: '1px solid var(--kalpx-border, #ddd)',
              borderRadius: '8px',
            }}
          />
        ))}
      </div>
      {error && <div className="phone-otp-error">{error}</div>}
      <button
        type="button"
        className="submit-btn"
        onClick={handleVerifyOtp}
        disabled={loading || !otpComplete}
      >
        {loading ? 'Verifying…' : 'Verify'}
      </button>
      <div className="phone-otp-resend-row">
        {cooldown > 0 ? (
          <span>Resend code in {cooldown}s</span>
        ) : resendCount >= MAX_RESENDS ? (
          <span>Try again later</span>
        ) : (
          <button type="button" className="link-btn" onClick={handleResend} disabled={loading}>
            Resend code
          </button>
        )}
        <span className="phone-otp-sep">·</span>
        <button type="button" className="link-btn" onClick={() => { setStep('phone'); setError(''); setOtp(Array(OTP_LENGTH).fill('')); }}>
          Change number
        </button>
      </div>
    </div>
  );
}
