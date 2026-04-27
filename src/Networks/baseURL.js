// // src/baseURL.js
// // const BASE_URL = "https://kalpx.com/api"; // change as needed
// const BASE_URL = "https://dev.kalpx.com/api"; // change as needed
// export default BASE_URL;

// EXPO_PUBLIC_API_ENV is baked in at EAS build time per-profile (see eas.json).
// Falls back to __DEV__ only for local metro runs (expo start / Expo Go).
const ENV = process.env.EXPO_PUBLIC_API_ENV || (__DEV__ ? "dev" : "prod");

// API URLs
const DEV_URL = "https://dev.kalpx.com/api";
const PROD_URL = "https://kalpx.com/api";

// FINAL BASE API URL
const BASE_URL = ENV === "dev" ? DEV_URL : PROD_URL;

// IMAGE DOMAIN (NO /api)
const BASE_IMAGE_URL =
  ENV === "dev" ? "https://dev.kalpx.com" : "https://kalpx.com";

export { BASE_IMAGE_URL, ENV };
export default BASE_URL;
