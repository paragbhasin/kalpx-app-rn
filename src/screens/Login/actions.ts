import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../Networks/axios"; // Adjust the import based on your project structure
import { registerDeviceToBackend } from "../../utils/registerDevice";
export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAILURE = "LOGIN_FAILURE";
export const SOCIAL_LOGIN_REQUEST = "SOCIAL_LOGIN_REQUEST";
export const SOCIAL_LOGIN_SUCCESS = "SOCIAL_LOGIN_SUCCESS";
export const SOCIAL_LOGIN_FAILURE = "SOCIAL_LOGIN_FAILURE";

export const loginRequest = () => ({ type: LOGIN_REQUEST });
export const loginSuccess = (res) => ({
  type: LOGIN_SUCCESS,
  payload: res.user,
});
export const loginFailure = (error) => ({
  type: LOGIN_FAILURE,
  payload: error,
});


export const socialLoginRequest = () => ({ type: SOCIAL_LOGIN_REQUEST });
export const socialLoginSuccess = (res) => ({
  type: SOCIAL_LOGIN_SUCCESS,
  payload: res.user,
});
export const socialLoginFailure = (error) => ({
  type: SOCIAL_LOGIN_FAILURE,
  payload: error,
});

export const loginUser = (credentials, callback) => async (dispatch) => {
  dispatch(loginRequest());
  try {
    const response = await loginApi(credentials);
    console.log("login response:::::", response);
    AsyncStorage.setItem("access_token", response.data.access_token);
    AsyncStorage.setItem("refresh_token", response.data.refresh_token);
    AsyncStorage.setItem("user_id",`${response.data.user.id}`);
      await registerDeviceToBackend();
    dispatch(loginSuccess(response.data));
    if (callback) callback({ success: true, data: response.data});
  } catch (error) {
    dispatch(loginFailure(error.message));
    if (callback) callback({ success: false, error: error.message });
  }
};

export const socialLoginUser = (credentials, callback) => async (dispatch) => {
  console.log("🚀 socialLoginUser thunk started with:", credentials);

  dispatch(socialLoginRequest()); // must exist!

  try {
    console.log("🌐 Calling API...");
    const response = await api.post("/users/social_login/", credentials);
    console.log("✅ API Response:", response.data);

    await AsyncStorage.setItem("access_token", response.data.access_token);
    await AsyncStorage.setItem("refresh_token", response.data.refresh_token);
    await AsyncStorage.setItem("user_id", `${response.data.user.id}`);
// await registerDeviceToBackend();
    dispatch(socialLoginSuccess(response.data));
    callback?.({ success: true, data: response.data });
  } catch (error) {
    console.error("❌ API Error:", error);
    dispatch(socialLoginFailure(error.message));
    callback?.({ success: false, error: error.message });
  }
};


const loginApi = (credentials) => {
  // console.log("loginApi called with:", credentials);
  return api.post("users/login/", credentials);
};

const socialLoginApi = (credentials) => {
  // console.log("social login called with:::::::::", credentials);
  return api.post("users/social_login/", credentials);
};
