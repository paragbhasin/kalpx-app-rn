// utils/api.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { v4 as uuidv4 } from "uuid"; // ✅ safe, since App.js polyfills crypto
import BASE_URL from "./baseURL";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

/** ✅ Format data for logs (truncates large blobs, detects HTML) */
const formatLogData = (data) => {
  if (!data) return "null";

  // 1. Detect HTML (often a 404/500 fallback from the server)
  if (
    typeof data === "string" &&
    (data.includes("<!doctype html>") || data.includes("<html"))
  ) {
    const title = data.match(/<title>(.*?)<\/title>/)?.[1] || "Unknown Title";
    return `📄 [HTML Response] Title: "${title}" (${data.length} chars). Preview: ${data.trim().substring(0, 150)}...`;
  }

  // 2. Handle Objects (JSON)
  if (typeof data === "object") {
    try {
      const json = JSON.stringify(data);
      if (json.length > 2000) {
        return `${json.substring(0, 2000)}... [TRUNCATED, Total: ${json.length} chars]`;
      }
      return json;
    } catch (e) {
      return "[Circular or Complex Object]";
    }
  }

  // 3. Handle Strings
  if (typeof data === "string" && data.length > 2000) {
    return `${data.substring(0, 2000)}... [TRUNCATED, Total: ${data.length} chars]`;
  }

  return String(data);
};

/** ✅ Ensure guest UUID exists (with fallback if crypto fails) */
const getGuestUUID = async () => {
  try {
    let guestUUID = await AsyncStorage.getItem("guestUUID");

    if (!guestUUID) {
      let id;
      try {
        id = uuidv4();
      } catch (e) {
        id = `guest_${Math.random().toString(36).substring(2, 15)}`;
        console.warn("⚠️ UUID fallback used:", e.message);
      }
      guestUUID = id;
      await AsyncStorage.setItem("guestUUID", guestUUID);
      console.log("✅ Created new guestUUID:", guestUUID);
    }

    return guestUUID;
  } catch (error) {
    console.log("Error managing guestUUID:", error);
    return null;
  }
};

/** ✅ Refresh access token using refresh token */
const refreshAccessToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem("refresh_token");
    if (!refreshToken) throw new Error("No refresh token available");

    console.log("🔁 Attempting to refresh access token...");

    const response = await axios.post(`${BASE_URL}/token/refresh/`, {
      refresh: refreshToken,
    });

    const { access, refresh } = response.data;

    if (access) await AsyncStorage.setItem("access_token", access);
    if (refresh) await AsyncStorage.setItem("refresh_token", refresh);

    console.log(
      "✅ Token refreshed successfully:",
      access.slice(0, 25) + "...",
    );
    return access;
  } catch (error) {
    console.log(
      "❌ Token refresh failed:",
      error?.response?.data || error.message,
    );
    await AsyncStorage.removeItem("access_token");
    await AsyncStorage.removeItem("refresh_token");
    return null;
  }
};

// Manage multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

/** -------------------------------------------------
 *  🔍 GLOBAL LOGGING — EVERY REQUEST & RESPONSE
 *  ------------------------------------------------- */
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("access_token");
    const guestUUID = await AsyncStorage.getItem("guestUUID");

    console.log("📡 API REQUEST");
    console.log("➡️ URL:", `${config.baseURL}${config.url}`);
    console.log("📝 METHOD:", config.method?.toUpperCase());
    console.log(
      "📦 PAYLOAD:",
      config.data ? JSON.stringify(config.data) : "null",
    );

    // 🔐 FIX: Send ONLY one header type
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      delete config.headers["X-Guest-UUID"]; // ⬅ ensure removed
      console.log("🔐 USING AUTH HEADER:", config.headers.Authorization);
    } else {
      config.headers["X-Guest-UUID"] = guestUUID;
      delete config.headers.Authorization; // ⬅ ensure removed
      console.log("🔐 USING GUEST UUID:", guestUUID);
    }

    // ⏰ DEV ONLY: X-Test-Now header for time-travel testing.
    // Set via the dev tools screen; backend's TestNowMiddleware honors it
    // when DEBUG=True or TEST_TIME_ENABLED=1.
    if (__DEV__) {
      try {
        const testNow = await AsyncStorage.getItem("@kalpx_test_now");
        if (testNow) {
          config.headers["X-Test-Now"] = testNow;
          console.log("⏰ X-Test-Now:", testNow);
        }
      } catch (_) {
        /* noop */
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/** -------------------------------------------------
 *  Response interceptor — token refresh on 401
 *  ------------------------------------------------- */
api.interceptors.response.use(
  (response) => {
    console.log("✅ API RESPONSE");
    console.log(
      "➡️ URL:",
      `${response.config.baseURL}${response.config.url}`,
    );
    console.log("📦 DATA:", formatLogData(response.data));
    return response;
  },
  async (error) => {
    console.log("❌ API RESPONSE ERROR");
    console.log("➡️ URL:", `${error.config?.baseURL}${error.config?.url}`);
    console.log("📦 ERROR:", formatLogData(error.response?.data || error.message));

    const originalRequest = error.config;
    const status = error.response?.status;

    // Handle 401 → attempt token refresh
    if (status === 401 && !originalRequest._retry) {
      console.log("[AUTH] Got 401 — attempting token refresh...");

      if (isRefreshing) {
        // Queue this request while another refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        console.log("[AUTH] Token refreshed — retrying original request");
        processQueue(null, newAccessToken);
        isRefreshing = false;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } else {
        console.log("[AUTH] Refresh failed — user needs to re-login");
        processQueue(new Error("Refresh failed"), null);
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
