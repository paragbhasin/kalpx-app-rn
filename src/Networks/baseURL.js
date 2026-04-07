// // src/baseURL.js
// // const BASE_URL = "https://kalpx.com/api"; // change as needed
// const BASE_URL = "https://dev.kalpx.com/api"; // change as needed
// export default BASE_URL;

// MANUAL SWITCH — set to "dev" during development, "prod" for release builds
const ENV = "dev";

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
