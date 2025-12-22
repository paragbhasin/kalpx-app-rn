<<<<<<< HEAD
// src/baseURL.js
// const BASE_URL = "https://your-api-url.com/api"; // change as needed
const BASE_URL = "https://dev-backend.kalpx.com/api/"; // change as needed
=======
// // src/baseURL.js
// // const BASE_URL = "https://kalpx.com/api"; // change as needed
// const BASE_URL = "https://dev.kalpx.com/api"; // change as needed
// export default BASE_URL;




// MANUAL SWITCH
// const ENV = "dev";
const ENV = "prod";

// API URLs
const DEV_URL = "https://dev.kalpx.com/api";
const PROD_URL = "https://kalpx.com/api";

// FINAL BASE API URL
const BASE_URL = ENV === "dev" ? DEV_URL : PROD_URL;

// IMAGE DOMAIN (NO /api)
const BASE_IMAGE_URL =
  ENV === "dev"
    ? "https://dev.kalpx.com"
    : "https://kalpx.com";

export { BASE_IMAGE_URL, ENV };
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
export default BASE_URL;
