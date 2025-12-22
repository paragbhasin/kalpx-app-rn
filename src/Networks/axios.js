<<<<<<< HEAD
// src/lib/axios.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BASE_URL from "./baseURL";
import { v4 as uuidv4 } from "uuid"; // for guest UUID generation
=======
// utils/api.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { v4 as uuidv4 } from "uuid"; // ✅ safe, since App.js polyfills crypto
import BASE_URL from "./baseURL";
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

<<<<<<< HEAD
// Helper → ensure guestUUID exists
const getGuestUUID = async () => {
  try {
    let guestUUID = await AsyncStorage.getItem("uuid");
    console.log(guestUUID, "here is the guest idddd");
    if (!guestUUID) {
      guestUUID = uuidv4();
      await AsyncStorage.setItem("guestUUID", guestUUID);
    }
=======
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

>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
    return guestUUID;
  } catch (error) {
    console.log("Error managing guestUUID:", error);
    return null;
  }
};

<<<<<<< HEAD
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
=======
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

    console.log("✅ Token refreshed successfully:", access.slice(0, 25) + "...");
    return access;
  } catch (error) {
    console.log("❌ Token refresh failed:", error?.response?.data || error.message);
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

    console.log("=====================================");
    console.log("📡 API REQUEST");
    console.log("➡️ URL:", `${config.baseURL}${config.url}`);
    console.log("📝 METHOD:", config.method?.toUpperCase());
    console.log("📦 PAYLOAD:", config.data ?? "NO BODY");

    // 🔐 FIX: Send ONLY one header type
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      delete config.headers["X-Guest-UUID"];   // ⬅ ensure removed
      console.log("🔐 USING AUTH HEADER:", config.headers.Authorization);
    } else {
      config.headers["X-Guest-UUID"] = guestUUID;
      delete config.headers.Authorization;     // ⬅ ensure removed
      console.log("🔐 USING GUEST UUID:", guestUUID);
    }

    console.log("=====================================");

>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
    return config;
  },
  (error) => Promise.reject(error)
);

<<<<<<< HEAD
// Response interceptor → handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Unauthorized → maybe redirect to login");
      // Optionally clear token or navigate to login
    }
=======

/** -------------------------------------------------
 *  🔍 LOG RESPONSE
 *  ------------------------------------------------- */
api.interceptors.response.use(
  (response) => {
    console.log("=====================================");
    console.log("✅ API RESPONSE");
    console.log("📡 URL:", response.config.url);
    console.log("🔢 STATUS:", response.status);
    console.log("📦 RESPONSE DATA:", response.data);
    console.log("=====================================");
    return response;
  },
  async (error) => {
    console.log("=====================================");
    console.log("❌ API ERROR");
    console.log("📡 URL:", error.config?.url);
    console.log("🔢 STATUS:", error.response?.status);
    console.log("⚠️ ERROR DATA:", error.response?.data);
    console.log("=====================================");
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
    return Promise.reject(error);
  }
);

export default api;
<<<<<<< HEAD
=======




// utils/api.js
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import { v4 as uuidv4 } from "uuid"; // ✅ safe, since App.js polyfills crypto
// import { store } from "../store";
// import { hideSnackBar, showSnackBar } from "../store/snackBarSlice";
// import BASE_URL from "./baseURL";

// const api = axios.create({
//   baseURL: BASE_URL,
//   timeout: 10000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// /** ✅ Ensure guest UUID exists (with fallback if crypto fails) */
// const getGuestUUID = async () => {
//   try {
//     let guestUUID = await AsyncStorage.getItem("guestUUID");

//     if (!guestUUID) {
//       let id;
//       try {
//         id = uuidv4();
//       } catch (e) {
//         id = `guest_${Math.random().toString(36).substring(2, 15)}`;
//         console.warn("⚠️ UUID fallback used:", e.message);
//       }
//       guestUUID = id;
//       await AsyncStorage.setItem("guestUUID", guestUUID);
//       console.log("✅ Created new guestUUID:", guestUUID);
//     }

//     return guestUUID;
//   } catch (error) {
//     console.log("Error managing guestUUID:", error);
//     return null;
//   }
// };

// /** ✅ Refresh access token using refresh token */
// const refreshAccessToken = async () => {
//   try {
//     const refreshToken = await AsyncStorage.getItem("refresh_token");
//     if (!refreshToken) throw new Error("No refresh token available");

//     console.log("🔁 Attempting to refresh access token...");

//     const response = await axios.post(`${BASE_URL}/token/refresh/`, {
//       refresh: refreshToken,
//     });

//     const { access, refresh } = response.data;

//     if (access) await AsyncStorage.setItem("access_token", access);
//     if (refresh) await AsyncStorage.setItem("refresh_token", refresh);

//     console.log("✅ Token refreshed successfully:", access.slice(0, 25) + "...");
//     return access;
//   } catch (error) {
//     console.log("❌ Token refresh failed:", error?.response?.data || error.message);
//     await AsyncStorage.removeItem("access_token");
//     await AsyncStorage.removeItem("refresh_token");
//     return null;
//   }
// };

// // Manage multiple refresh attempts
// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) prom.reject(error);
//     else prom.resolve(token);
//   });
//   failedQueue = [];
// };

// /** ✅ Request interceptor → attach token or guest UUID */
// api.interceptors.request.use(
//   async (config) => {
//     try {
//       const token = await AsyncStorage.getItem("access_token");

//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       } else {
//         const guestUUID = await getGuestUUID();
//         if (guestUUID) config.headers["X-Guest-UUID"] = guestUUID;
//       }
//     } catch (error) {
//       console.log("Error attaching headers:", error);
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// /** ✅ Response interceptor → global error handling & token refresh */
// api.interceptors.response.use(
//   (response) => {
//     if (response.status >= 200 && response.status < 300) {
//       if (response.data?.message) {
//         store.dispatch(showSnackBar(response.data.message));
//       } else {
//         store.dispatch(showSnackBar("Success"));
//       }
//       setTimeout(() => store.dispatch(hideSnackBar()), 2000);
//     }
//     return response;
//   },
//   async (error) => {
//     const originalRequest = error.config;
//     const status = error.response?.status;
//     const message =
//       error.response?.data?.message || error.response?.data?.error || "An error occurred";

//     // 🔹 Non-401 errors
//     if (status && status !== 401) {
//       store.dispatch(showSnackBar(message));
//       setTimeout(() => store.dispatch(hideSnackBar()), 2000);
//     }

//     // 🔹 Handle 401 → Refresh token flow
//     if (status === 401 && !originalRequest._retry) {
//       console.log("⚠️ Got 401 → trying token refresh...");

//       if (isRefreshing) {
//         console.log("⏳ Waiting for another refresh to complete...");
//         return new Promise(function (resolve, reject) {
//           failedQueue.push({ resolve, reject });
//         })
//           .then((token) => {
//             console.log("🔁 Retrying queued request with new token...");
//             originalRequest.headers.Authorization = "Bearer " + token;
//             return api(originalRequest);
//           })
//           .catch((err) => Promise.reject(err));
//       }

//       originalRequest._retry = true;
//       isRefreshing = true;

//       const newAccessToken = await refreshAccessToken();

//       if (newAccessToken) {
//         console.log("✅ Retrying original request with refreshed token...");
//         processQueue(null, newAccessToken);
//         isRefreshing = false;

//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         return api(originalRequest);
//       } else {
//         console.log("❌ Refresh token invalid — logging out user...");
//         processQueue(new Error("Refresh failed"), null);
//         isRefreshing = false;
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
