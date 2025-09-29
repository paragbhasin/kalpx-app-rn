import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../../Networks/axios"; // Adjust the import based on your project structure
export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAILURE = "LOGIN_FAILURE";

export const loginRequest = () => ({ type: LOGIN_REQUEST });
export const loginSuccess = (res) => ({
  type: LOGIN_SUCCESS,
  payload: res.user,
});
export const loginFailure = (error) => ({
  type: LOGIN_FAILURE,
  payload: error,
});

export const loginUser = (credentials, callback) => async (dispatch) => {
  dispatch(loginRequest());
  try {
    const response: any = await loginApi(credentials);
    AsyncStorage.setItem("access_token", response.access_token);
    AsyncStorage.setItem("refresh_token", response.refresh_token);
    dispatch(loginSuccess(response));
    if (callback) callback({ success: true, data: response });
  } catch (error) {
    dispatch(loginFailure(error.message));
    if (callback) callback({ success: false, error: error.message });
  }
};

const loginApi = (credentials) => {
  console.log("loginApi called with:", credentials);
  return api.post("users/login/", credentials);
};
