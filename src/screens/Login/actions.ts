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
    AsyncStorage.setItem("user_id", `${response.data.user.id}`);
    await registerDeviceToBackend();
    dispatch(loginSuccess(response.data));
    if (callback) callback({ success: true, data: response.data });
  } catch (error) {
    let errorMessage = error.message;

    // Extract detailed error from response if available (e.g., {"email": ["Enter a valid email address."]})
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (typeof data === 'object') {
        // Flatten object errors: {"email": ["msg"]} -> "email: msg"
        errorMessage = Object.keys(data)
          .map(key => {
            const val = data[key];
            const message = Array.isArray(val) ? val.join(", ") : val;
            return `${key}: ${message}`;
          })
          .join("\n");
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
    }

    dispatch(loginFailure(errorMessage));
    if (callback) callback({ success: false, error: errorMessage });
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
    let errorMessage = error.message;

    if (error.response && error.response.data) {
      const data = error.response.data;
      if (typeof data === 'object') {
        errorMessage = Object.keys(data)
          .map(key => {
            const val = data[key];
            const message = Array.isArray(val) ? val.join(", ") : val;
            return `${key}: ${message}`;
          })
          .join("\n");
      } else if (typeof data === 'string') {
        errorMessage = data;
      }
    }

    dispatch(socialLoginFailure(errorMessage));
    callback?.({ success: false, error: errorMessage });
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
