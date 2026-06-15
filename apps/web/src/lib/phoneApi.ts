import { api } from './api';
import { getApiErrorMessage } from './apiErrors';
import type {
  PhoneOtpRequestPayload,
  PhoneOtpRequestResponse,
  PhoneOtpVerifyPayload,
  PhoneOtpVerifyResponse,
  PhoneOtpResendPayload,
  PhoneOtpResendResponse,
} from '@kalpx/types';

export async function requestPhoneOtp(
  payload: PhoneOtpRequestPayload,
): Promise<{ success: true; data: PhoneOtpRequestResponse } | { success: false; error: string }> {
  try {
    const resp = await api.post('/auth/phone/request-otp/', payload);
    return { success: true, data: resp.data as PhoneOtpRequestResponse };
  } catch (err) {
    return { success: false, error: getApiErrorMessage(err) };
  }
}

export async function verifyPhoneOtp(
  payload: PhoneOtpVerifyPayload,
): Promise<{ success: true; data: PhoneOtpVerifyResponse } | { success: false; error: string; code?: string }> {
  try {
    const resp = await api.post('/auth/phone/verify-otp/', payload);
    return { success: true, data: resp.data as PhoneOtpVerifyResponse };
  } catch (err: any) {
    const code: string | undefined = err?.response?.data?.error;
    return { success: false, error: getApiErrorMessage(err), code };
  }
}

export async function resendPhoneOtp(
  payload: PhoneOtpResendPayload,
): Promise<{ success: true; data: PhoneOtpResendResponse } | { success: false; error: string; code?: string }> {
  try {
    const resp = await api.post('/auth/phone/resend-otp/', payload);
    return { success: true, data: resp.data as PhoneOtpResendResponse };
  } catch (err: any) {
    const code: string | undefined = err?.response?.data?.error;
    return { success: false, error: getApiErrorMessage(err), code };
  }
}

export async function loginWithPhone(
  phone: string,
  country: string,
  password: string,
): Promise<{ success: true; data: PhoneOtpVerifyResponse } | { success: false; error: string; code?: string }> {
  try {
    const resp = await api.post('/users/login/', { phone, country, password });
    return { success: true, data: resp.data as PhoneOtpVerifyResponse };
  } catch (err: any) {
    const code: string | undefined = err?.response?.data?.error;
    return { success: false, error: getApiErrorMessage(err), code };
  }
}
