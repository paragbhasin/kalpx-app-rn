// src/lib/axios.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { store } from '../store';
import { hideSnackBar, showSnackBar } from '../store/snackBarSlice';
import BASE_URL from "./baseURL";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper → ensure guestUUID exists
const getGuestUUID = async () => {
  try {
    let guestUUID = await AsyncStorage.getItem("guestUUID");
    if (!guestUUID) {
      guestUUID = uuidv4();
      await AsyncStorage.setItem("guestUUID", guestUUID);
    }
    return guestUUID;
  } catch (error) {
    console.log("Error managing guestUUID:", error);
    return null;
  }
};

// Request interceptor → attach token or guest UUID
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        const guestUUID = await getGuestUUID();
        if (guestUUID) {
          config.headers["X-Guest-UUID"] = guestUUID;
        }
      }
    } catch (error) {
      console.log("Error attaching headers:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor → handle global errors and success messages
api.interceptors.response.use(
  (response) => {
    console.log("Response received:::::::::::::::::::", response)
    // Show success snackbar for 200-level responses
    if (response.status >= 200 && response.status < 300) {
      if (response.data?.message) {
        store.dispatch(showSnackBar(response.data.message));
        setTimeout(() => store.dispatch(hideSnackBar()), 2000);
      } else {
         store.dispatch(showSnackBar("Success"));
        setTimeout(() => store.dispatch(hideSnackBar()), 2000);
      }
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    let message = 'An error occurred';

    if (status === 400) {
      const data = error.response?.data;
      message = data?.message || data?.error || 'Bad Request';
    } else if (status) {
      const data = error.response?.data;
      message = data?.message || data?.error || `Error ${status}`;
    }

    if (status && status !== 401) {
      store.dispatch(showSnackBar(message));
      setTimeout(() => store.dispatch(hideSnackBar()), 2000);
    }

    if (status === 401) {
      console.log("Unauthorized → maybe redirect to login");
      // Optionally clear token or navigate to login
    }

    return Promise.reject(error);
  }
);

export default api;
