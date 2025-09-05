// src/lib/axios.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BASE_URL from "./baseURL";
import { v4 as uuidv4 } from "uuid"; // for guest UUID generation

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
    let guestUUID = await AsyncStorage.getItem("uuid");
    console.log(guestUUID, "here is the guest idddd");
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
      const token = await AsyncStorage.getItem("token");
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

// Response interceptor → handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized → maybe redirect to login");
      // Optionally clear token or navigate to login
    }
    return Promise.reject(error);
  }
);

export default api;
