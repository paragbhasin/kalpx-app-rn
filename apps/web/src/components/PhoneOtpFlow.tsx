/**
 * PhoneOtpFlow — self-contained 2-step phone auth component.
 * Returns null when VITE_PHONE_AUTH_ENABLED !== '1'.
 * Step 1: phone + country input.
 * Step 2: 6-digit OTP input with countdown and resend.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { PHONE_AUTH_COUNTRIES, DEFAULT_PHONE_COUNTRY } from '@kalpx/types';
import type { PhoneOtpVerifyResponse, PhoneCountryCode, PhoneOtpPurpose } from '@kalpx/types';
import { storeTokens } from '@kalpx/auth';
import { webStorage } from '../lib/webStorage';
import { requestPhoneOtp, verifyPhoneOtp, resendPhoneOtp } from '../lib/phoneApi';
import { WEB_ENV } from '../lib/env';
import { CountryDialSelector } from './CountryDialSelector';
import { useTranslation } from '../lib/i18n';

const OTP_LENGTH = 6;
const MAX_RESENDS = 3;

function errorCopy(errorMap: Record<string, string>, code: string | undefined, fallback: string, extra?: string): string {
  if (!code) return fallback;
  const base = errorMap[code] || fallback;
  return extra ? `${base} ${extra}` : base;
}

const NEEDS_PASSWORD = new Set<PhoneOtpPurpose>(['signup', 'password_reset_phone']);

interface Props {
  purpose: PhoneOtpPurpose;
  onSuccess: (tokens?: { accessToken: string; refreshToken: string }, isNewUser?: boolean) => void;
}

export function PhoneOtpFlow({ purpose, onSuccess }: Props) {
  if (WEB_ENV.phoneAuthEnabled !== '1') return null;

  const { t } = useTranslation();

  const ERROR_MAP: Record<string, string> = {
    invalid_phone: t('phoneOtp.invalidPhone'),
    rate_limit_exceeded: t('phoneOtp.rateLimitExceeded'),
    cooldown_active: t('phoneOtp.cooldownActive'),
    otp_expired: t('phoneOtp.otpExpired'),
    invalid_otp: t('phoneOtp.invalidOtp'),
    too_many_attempts: t('phoneOtp.tooManyAttempts'),
    phone_auth_unavailable: t('phoneOtp.phoneAuthUnavailable'),
    sms_send_failed: t('phoneOtp.smsSendFailed'),
    sms_unavailable: t('phoneOtp.smsSendFailed'),
    phone_already_in_use: t('phoneOtp.phoneAlreadyInUse'),
    phone_auth_disabled: t('phoneOtp.phoneAuthDisabled'),
  };

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [country, setCountry] = useState<PhoneCountryCode>(DEFAULT_PHONE_COUNTRY);
  const [phone, setPhone] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [maskedPhone, setMaskedPhone] = useState('');
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
      setError(t('phoneOtp.invalidPhone'));
      return;
    }
    setLoading(true);
    setError('');
    const result = await requestPhoneOtp({ phone: digits, country, purpose });
    setLoading(false);
    if (!result.success) {
      setError(errorCopy(ERROR_MAP, undefined, result.error));
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
      setError(t('phoneOtp.enterOtpValidation'));
      return;
    }
    if (NEEDS_PASSWORD.has(purpose)) {
      if (password.length < 8) {
        setError(t('phoneOtp.passwordTooShort'));
        return;
      }
      if (password !== confirmPassword) {
        setError(t('phoneOtp.passwordMismatch'));
        return;
      }
    }
    setLoading(true);
    setError('');
    const payload: Parameters<typeof verifyPhoneOtp>[0] = { session_token: sessionToken, otp: code };
    if (purpose === 'signup') payload.password = password;
    if (purpose === 'password_reset_phone') payload.new_password = password;
    const result = await verifyPhoneOtp(payload);
    setLoading(false);
    if (!result.success) {
      const attemptsRemaining = (result as any).data?.attempts_remaining;
      let msg = errorCopy(ERROR_MAP, result.code, result.error);
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
      setError(errorCopy(ERROR_MAP, result.code, result.error));
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
        <p className="phone-otp-hint">{t('phoneOtp.sendOtpHint')}</p>
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
          {loading ? t('phoneOtp.sending') : t('phoneOtp.sendOtp')}
        </button>
      </div>
    );
  }

  const otpComplete = otp.every(Boolean);
  const passwordLabel = purpose === 'password_reset_phone' ? t('phoneOtp.newPassword') : t('phoneOtp.createPassword');
  const confirmLabel = purpose === 'password_reset_phone' ? t('phoneOtp.confirmNewPassword') : t('phoneOtp.confirmPassword');

  return (
    <div className="phone-otp-flow">
      <p className="phone-otp-hint">{t('phoneOtp.enterOtpHint').replace('{maskedPhone}', maskedPhone)}</p>
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
      {NEEDS_PASSWORD.has(purpose) && (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={passwordLabel}
            disabled={loading}
            aria-label={passwordLabel}
            autoComplete="new-password"
            style={{
              height: '46px',
              padding: '0 12px',
              border: '1px solid var(--kalpx-border, #ddd)',
              borderRadius: '8px',
              fontSize: '1rem',
            }}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={confirmLabel}
            disabled={loading}
            aria-label={confirmLabel}
            autoComplete="new-password"
            style={{
              height: '46px',
              padding: '0 12px',
              border: '1px solid var(--kalpx-border, #ddd)',
              borderRadius: '8px',
              fontSize: '1rem',
            }}
          />
        </div>
      )}
      {error && <div className="phone-otp-error">{error}</div>}
      <button
        type="button"
        className="submit-btn"
        onClick={handleVerifyOtp}
        disabled={loading || !otpComplete || (NEEDS_PASSWORD.has(purpose) && (password.length < 8 || password !== confirmPassword))}
      >
        {loading ? t('phoneOtp.verifying') : t('phoneOtp.verify')}
      </button>
      <div className="phone-otp-resend-row">
        {cooldown > 0 ? (
          <span>{t('phoneOtp.resendCodeIn').replace('{cooldown}', String(cooldown))}</span>
        ) : resendCount >= MAX_RESENDS ? (
          <span>{t('phoneOtp.tryAgainLater')}</span>
        ) : (
          <button type="button" className="link-btn" onClick={handleResend} disabled={loading}>
            {t('phoneOtp.resendCode')}
          </button>
        )}
        <span className="phone-otp-sep">·</span>
        <button type="button" className="link-btn" onClick={() => { setStep('phone'); setError(''); setOtp(Array(OTP_LENGTH).fill('')); }}>
          {t('phoneOtp.changeNumber')}
        </button>
      </div>
    </div>
  );
}
