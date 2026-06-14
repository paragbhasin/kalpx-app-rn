export const PHONE_AUTH_COUNTRIES = [
  { code: 'IN', dialCode: '+91', label: 'India',         placeholder: '98765 43210' },
  { code: 'US', dialCode: '+1',  label: 'United States', placeholder: '(415) 555-2671' },
  { code: 'GB', dialCode: '+44', label: 'United Kingdom', placeholder: '07911 123456' },
] as const;

export const DEFAULT_PHONE_COUNTRY = 'IN' as const;
export type PhoneCountry = typeof PHONE_AUTH_COUNTRIES[number];
export type PhoneCountryCode = PhoneCountry['code'];

export type PhoneOtpPurpose = 'auth' | 'link_phone';

export interface PhoneOtpRequestPayload {
  phone: string;
  country: PhoneCountryCode;
  purpose: PhoneOtpPurpose;
}

export interface PhoneOtpVerifyPayload {
  session_token: string;
  otp: string;
}

export interface PhoneOtpResendPayload {
  session_token: string;
}

export interface PhoneOtpRequestResponse {
  masked_phone: string;
  session_token: string;
  cooldown_seconds: number;
  otp_expiry_seconds: number;
}

export interface PhoneOtpVerifyResponse {
  access_token?: string;
  refresh_token?: string;
  role?: string;
  user?: Record<string, unknown>;
  profile?: Record<string, unknown> | null;
  creator_profile?: null;
  is_new_user?: boolean;
  phone_verified?: boolean;
}

export interface PhoneOtpResendResponse {
  masked_phone: string;
  cooldown_seconds: number;
  resends_remaining: number;
}
