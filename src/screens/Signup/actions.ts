import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../Networks/axios";
import { registerDeviceToBackend } from "../../utils/registerDevice";

export const SIGNUP_REQUEST = "SIGNUP_REQUEST";
export const SIGNUP_SUCCESS = "SIGNUP_SUCCESS";
export const SIGNUP_FAILURE = "SIGNUP_FAILURE";
export const GENERATE_OTP_REQUEST = "GENERATE_OTP_REQUEST";
export const GENERATE_OTP_SUCCESS = "GENERATE_OTP_SUCCESS";
export const GENERATE_OTP_FAILURE = "GENERATE_OTP_FAILURE";
export const VERIFY_OTP_REQUEST = "VERIFY_OTP_REQUEST";
export const VERIFY_OTP_SUCCESS = "VERIFY_OTP_SUCCESS";
export const VERIFY_OTP_FAILURE = "VERIFY_OTP_FAILURE";
export const FORGOT_PASSWORD_REQUEST = "FORGOT_PASSWORD_REQUEST";
export const FORGOT_PASSWORD_SUCCESS = "FORGOT_PASSWORD_SUCCESS";
export const FORGOT_PASSWORD_FAILURE = "FORGOT_PASSWORD_FAILURE";

export const signupRequest = () => ({ type: SIGNUP_REQUEST });
export const signupSuccess = (res) => ({
  type: SIGNUP_SUCCESS,
  payload: res.user,
});
export const signupFailure = (error) => ({
  type: SIGNUP_FAILURE,
  payload: error,
});

export const generateOtpRequest = () => ({ type: GENERATE_OTP_REQUEST });
export const generateOtpSuccess = (res) => ({
  type: GENERATE_OTP_SUCCESS,
  payload: res.user,
});
export const generateOtpFailure = (error) => ({
  type: GENERATE_OTP_FAILURE,
  payload: error,
});

export const verifyOtpRequest = () => ({ type: VERIFY_OTP_REQUEST });
export const verifyOtpSuccess = (res) => ({
  type: FORGOT_PASSWORD_SUCCESS,
  payload: res.user,
});
export const verifyOtpFailure = (error) => ({
  type: FORGOT_PASSWORD_FAILURE,
  payload: error,
});

export const forgotPasswordRequest = () => ({ type: FORGOT_PASSWORD_REQUEST });
export const forgotPasswordSuccess = (res) => ({
  type: VERIFY_OTP_SUCCESS,
  payload: res.user,
});
export const forgotPasswordFailure = (error) => ({
  type: VERIFY_OTP_FAILURE,
  payload: error,
});

export const signupUser = (credentials, callback) => async (dispatch) => {
  dispatch(signupRequest());
  try {
    const response: any = await signupApi(credentials);
    AsyncStorage.setItem("access_token", response.access_token);
    AsyncStorage.setItem("refresh_token", response.refresh_token);
       await registerDeviceToBackend();
    dispatch(signupSuccess(response));
    if (callback) callback({ success: true, data: response });
  } catch (error) {
    dispatch(signupFailure(error.message));
    if (callback) callback({ success: false, error: error.message });
  }
};

export const generateOtp = (credentials, callback) => async (dispatch) => {
  dispatch(generateOtpRequest());
  try {
    const response: any = await generateOtpApi(credentials);
    dispatch(generateOtpSuccess(response));
    if (callback) callback({ success: true, data: response });
  } catch (error) {
    dispatch(generateOtpFailure(error.message));
    if (callback) callback({ success: false, error: error.message });
  }
};

export const verifyOtp = (credentials, callback) => async (dispatch) => {
  dispatch(verifyOtpRequest());
  try {
    const response: any = await verifyOtpApi(credentials);
    dispatch(verifyOtpSuccess(response));
    if (callback) callback({ success: true, data: response });
  } catch (error) {
    dispatch(verifyOtpFailure(error.message));
    if (callback) callback({ success: false, error: error.message });
  }
};

export const resetPasswordOtp = (credentials, callback) => async (dispatch) => {
  dispatch(forgotPasswordRequest());
  try {
    const response: any = await resetPasswordApi(credentials);
    dispatch(forgotPasswordSuccess(response));
    if (callback) callback({ success: true, data: response });
  } catch (error) {
    dispatch(forgotPasswordFailure(error.message));
    if (callback) callback({ success: false, error: error.message });
  }
};

const signupApi = (credentials) => {
  // console.log("loginApi called with:", credentials);
  return api.post("users/register/", credentials);
};

const generateOtpApi = (credentials) => {
  // console.log("loginApi called with:", credentials);
  return api.post("users/generate_otp/", credentials);
};

const verifyOtpApi = (credentials) => {
  // console.log("loginApi called with:", credentials);
  return api.post("users/verify_otp/", credentials);
};

const resetPasswordApi = (credentials) => {
  // console.log("loginApi called with:", credentials);
  return api.post("users/reset_password/", credentials);
};
