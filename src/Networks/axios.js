// utils/api.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { v4 as uuidv4 } from "uuid"; // ✅ safe, since App.js polyfills crypto
import { store } from "../store";
import { hideSnackBar, showSnackBar } from "../store/snackBarSlice";
import BASE_URL from "./baseURL";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

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

/** ✅ Request interceptor → attach token or guest UUID */
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        const guestUUID = await getGuestUUID();
        if (guestUUID) config.headers["X-Guest-UUID"] = guestUUID;
      }
    } catch (error) {
      console.log("Error attaching headers:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/** ✅ Response interceptor → global error handling & token refresh */
api.interceptors.response.use(
  (response) => {
    if (response.status >= 200 && response.status < 300) {
      if (response.data?.message) {
        store.dispatch(showSnackBar(response.data.message));
      } else {
        store.dispatch(showSnackBar("Success"));
      }
      setTimeout(() => store.dispatch(hideSnackBar()), 2000);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.response?.data?.error || "An error occurred";

    // 🔹 Non-401 errors
    if (status && status !== 401) {
      store.dispatch(showSnackBar(message));
      setTimeout(() => store.dispatch(hideSnackBar()), 2000);
    }

    // 🔹 Handle 401 → Refresh token flow
    if (status === 401 && !originalRequest._retry) {
      console.log("⚠️ Got 401 → trying token refresh...");

      if (isRefreshing) {
        console.log("⏳ Waiting for another refresh to complete...");
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            console.log("🔁 Retrying queued request with new token...");
            originalRequest.headers.Authorization = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        console.log("✅ Retrying original request with refreshed token...");
        processQueue(null, newAccessToken);
        isRefreshing = false;

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } else {
        console.log("❌ Refresh token invalid — logging out user...");
        processQueue(new Error("Refresh failed"), null);
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;





// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import { v4 as uuidv4 } from "uuid";
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

// // ✅ Ensure guest UUID exists
// const getGuestUUID = async () => {
//   try {
//     let guestUUID = await AsyncStorage.getItem("guestUUID");
//     if (!guestUUID) {
//       guestUUID = uuidv4();
//       await AsyncStorage.setItem("guestUUID", guestUUID);
//     }
//     return guestUUID;
//   } catch (error) {
//     console.log("Error managing guestUUID:", error);
//     return null;
//   }
// };

// // ✅ Refresh access token
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

// // Prevent multiple refresh calls
// let isRefreshing = false;
// let failedQueue = [];

// const processQueue = (error, token = null) => {
//   failedQueue.forEach((prom) => {
//     if (error) prom.reject(error);
//     else prom.resolve(token);
//   });
//   failedQueue = [];
// };

// // ✅ Test mode toggle: corrupt token only once
// // let hasTestedRefresh = false;

// // Request interceptor → attach token or guest UUID
// // api.interceptors.request.use(
// //   async (config) => {
// //     try {
// //       let token = await AsyncStorage.getItem("access_token");

// //       if (token) {
// //         if (!hasTestedRefresh) {
// //           // 🧪 Force one-time refresh test
// //           token = token + "_TEST_INVALID";
// //           hasTestedRefresh = true;
// //           console.log("🚀 [TEST] Sending request with intentionally broken token (to trigger refresh)");
// //         } else {
// //           console.log("✅ [TEST] Sending request with valid token after refresh");
// //         }
// //         config.headers.Authorization = `Bearer ${token}`;
// //       } else {
// //         const guestUUID = await getGuestUUID();
// //         if (guestUUID) config.headers["X-Guest-UUID"] = guestUUID;
// //       }
// //     } catch (error) {
// //       console.log("Error attaching headers:", error);
// //     }
// //     return config;
// //   },
// //   (error) => Promise.reject(error)
// // );

// // ✅ Request interceptor → attach token or guest UUID
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


// // Response interceptor → handle global errors & refresh logic
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

//     // 🔹 Handle non-401 errors normally
//     if (status && status !== 401) {
//       store.dispatch(showSnackBar(message));
//       setTimeout(() => store.dispatch(hideSnackBar()), 2000);
//     }

//     // 🔹 Handle 401 → Refresh token
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






// // src/lib/axios.js
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "axios";
// import { v4 as uuidv4 } from "uuid";
// import { store } from '../store';
// import { hideSnackBar, showSnackBar } from '../store/snackBarSlice';
// import BASE_URL from "./baseURL";

// const api = axios.create({
//   baseURL: BASE_URL,
//   timeout: 10000,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Helper → ensure guestUUID exists
// const getGuestUUID = async () => {
//   try {
//     let guestUUID = await AsyncStorage.getItem("guestUUID");
//     if (!guestUUID) {
//       guestUUID = uuidv4();
//       await AsyncStorage.setItem("guestUUID", guestUUID);
//     }
//     return guestUUID;
//   } catch (error) {
//     console.log("Error managing guestUUID:", error);
//     return null;
//   }
// };

// // Request interceptor → attach token or guest UUID
// api.interceptors.request.use(
//   async (config) => {
//     try {
//       const token = await AsyncStorage.getItem("access_token");
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       } else {
//         const guestUUID = await getGuestUUID();
//         if (guestUUID) {
//           config.headers["X-Guest-UUID"] = guestUUID;
//         }
//       }
//     } catch (error) {
//       console.log("Error attaching headers:", error);
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor → handle global errors and success messages
// api.interceptors.response.use(
//   (response) => {
//     // console.log("Response received:::::::::::::::::::", response)
//     // Show success snackbar for 200-level responses
//     if (response.status >= 200 && response.status < 300) {
//       if (response.data?.message) {
//         store.dispatch(showSnackBar(response.data.message));
//         setTimeout(() => store.dispatch(hideSnackBar()), 2000);
//       } else {
//          store.dispatch(showSnackBar("Success"));
//         setTimeout(() => store.dispatch(hideSnackBar()), 2000);
//       }
//     }
//     return response;
//   },
//   (error) => {
//     const status = error.response?.status;
//     let message = 'An error occurred';

//     if (status === 400) {
//       const data = error.response?.data;
//       message = data?.message || data?.error || 'Bad Request';
//     } else if (status) {
//       const data = error.response?.data;
//       message = data?.message || data?.error || `Error ${status}`;
//     }

//     if (status && status !== 401) {
//       store.dispatch(showSnackBar(message));
//       setTimeout(() => store.dispatch(hideSnackBar()), 2000);
//     }

//     if (status === 401) {
//       console.log("Unauthorized → maybe redirect to login");
//       // Optionally clear token or navigate to login
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;
