import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../Networks/axios";
import { registerDeviceToBackend } from "../../utils/registerDevice";
import type {
  PhoneOtpRequestPayload,
  PhoneOtpRequestResponse,
  PhoneOtpVerifyPayload,
  PhoneOtpVerifyResponse,
  PhoneOtpResendPayload,
  PhoneOtpResendResponse,
} from "@kalpx/types";

export const PHONE_LOGIN_SUCCESS = "PHONE_LOGIN_SUCCESS";

export type PhoneAuthResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export const phoneLoginSuccess = (res: any) => ({
  type: PHONE_LOGIN_SUCCESS,
  payload: res.user,
});

export const requestPhoneOtp = (
  payload: PhoneOtpRequestPayload,
  callback: (result: PhoneAuthResult<PhoneOtpRequestResponse>) => void,
) => async () => {
  try {
    const response = await api.post("/auth/phone/request-otp/", payload);
    callback({ success: true, data: response.data });
  } catch (err: any) {
    const code: string | undefined = err?.response?.data?.error;
    const error: string = err?.response?.data?.detail || err?.message || "Request failed";
    callback({ success: false, error, code });
  }
};

export const verifyPhoneOtp = (
  payload: PhoneOtpVerifyPayload,
  callback: (result: PhoneAuthResult<PhoneOtpVerifyResponse>) => void,
) => async (dispatch: any) => {
  try {
    const response = await api.post("/auth/phone/verify-otp/", payload);
    const data: PhoneOtpVerifyResponse = response.data;
    if (data.access_token && data.refresh_token) {
      await AsyncStorage.setItem("access_token", data.access_token);
      await AsyncStorage.setItem("refresh_token", data.refresh_token);
      if (data.user) {
        await AsyncStorage.setItem("user_id", `${(data.user as any).id ?? ""}`);
      }
      await registerDeviceToBackend();
      dispatch(phoneLoginSuccess(data));
    }
    callback({ success: true, data });
  } catch (err: any) {
    const code: string | undefined = err?.response?.data?.error;
    const error: string = err?.response?.data?.detail || err?.message || "Verification failed";
    callback({ success: false, error, code });
  }
};

export const resendPhoneOtp = (
  payload: PhoneOtpResendPayload,
  callback: (result: PhoneAuthResult<PhoneOtpResendResponse>) => void,
) => async () => {
  try {
    const response = await api.post("/auth/phone/resend-otp/", payload);
    callback({ success: true, data: response.data });
  } catch (err: any) {
    const code: string | undefined = err?.response?.data?.error;
    const error: string = err?.response?.data?.detail || err?.message || "Resend failed";
    callback({ success: false, error, code });
  }
};

export const loginWithPhone = (
  payload: { phone: string; country: string; password: string },
  callback: (result: PhoneAuthResult<PhoneOtpVerifyResponse>) => void,
) => async (dispatch: any) => {
  try {
    const response = await api.post("/users/login/", payload);
    const data: PhoneOtpVerifyResponse = response.data;
    if (data.access_token && data.refresh_token) {
      await AsyncStorage.setItem("access_token", data.access_token);
      await AsyncStorage.setItem("refresh_token", data.refresh_token);
      if (data.user) {
        await AsyncStorage.setItem("user_id", `${(data.user as any).id ?? ""}`);
      }
      await registerDeviceToBackend();
      dispatch(phoneLoginSuccess(data));
    }
    callback({ success: true, data });
  } catch (err: any) {
    const code: string | undefined = err?.response?.data?.error;
    const error: string = err?.response?.data?.detail || err?.message || "Login failed";
    callback({ success: false, error, code });
  }
};
