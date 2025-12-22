import SHA256 from "crypto-js/sha256";
import * as Device from "expo-device";

// ⭐ SECURITY NOTE: NEVER hardcode a user access token (EAAQ...) in production code.
// This should be a limited-permission App Access Token or an external configuration.
const FB_APP_ID = "835697332515011";
const FB_ACCESS_TOKEN = "EAAQ0I4Q6eAwBQGK7ZBnKnkkVW7UWpXlRFwwUUy2rq4xeWW4p7KxIvAnywKo25ZCbnl9MYZC4CZC3vtY43LlvYaZCZARKCHaQu84ophOVcZBZBz4kuzZBEJiDZBDZAbfh6Wdsb3ojOzNsVCBseuoirvMrnVirUw8OZAaEGUUa8TeU2hEaH3RIvSaCVuMtottOxNUZBCwZDZD";// use the one you generated

// Hash user fields (required for matching)
const hash = (value) => {
  if (!value) return undefined;
  // Meta requires SHA256 hashing after trimming whitespace and converting to lowercase.
  return SHA256(String(value).trim().toLowerCase()).toString();
};

export async function sendMetaEvent(eventName, customData: any = {}, userInfo : any= {}) {
  if (!FB_ACCESS_TOKEN) {
    console.error("❌ Missing FB token");
    return;
  }

  // Meta required extinfo format for mobile apps
  const extinfo = JSON.stringify([
    "mbsdk",               // Fixed prefix
    "1",                   // Version
    Device.osName || "",   // OS
    Device.osVersion || "",// OS version
    Device.modelName || "",// Device model
    "", "", ""             // Padding (required)
  ]);

  // ⭐ FIX: Dynamically build user_data to only include valid, hashed fields.
  const userData : any = {};

  const hashedEmail = hash(userInfo.email);
  const hashedUserId = hash(userInfo.user_id);

  if (hashedEmail) {
    userData.em = hashedEmail;
  }
  if (hashedUserId) {
    // External ID is often used for user IDs
    userData.external_id = hashedUserId; 
  }
  
  // OPTIONAL BEST PRACTICE: Skip event if no user identifier is present
  if (Object.keys(userData).length === 0) {
      console.warn(`⚠️ Meta Event '${eventName}' skipped: No valid user identifiers (email or user_id) provided.`);
      // However, for standard events like AppLaunch, you might still want to send it.
      // We will allow sending an event with empty user_data if we can't identify the user.
  }

  const payload = {
    event: eventName,
    advertiser_tracking_enabled: 1,
    application_tracking_enabled: 1,
    extinfo,
    // Use the dynamically built userData object
    user_data: userData, 
    custom_data: customData,
  };

  console.log("📤 FB Payload:", JSON.stringify(payload, null, 2));

  try {
    const res = await fetch(
      // NOTE: Using v18.0. Check Meta's documentation for the latest version.
      `https://graph.facebook.com/v18.0/${FB_APP_ID}/activities?access_token=${FB_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const json = await res.json();
    console.log("📩 FB Event Response:", json);
    
    // Check for explicit CAPI error code 100
    if (json.error?.code === 100) {
        console.error(`❌ FB CAPI Error 100: ${json.error.message}. Check payload:`, payload);
    }
  } catch (err) {
    console.error("❌ FB CAPI Error:", err);
  }
}

// Simple wrapper like your Vue version
export function trackPixelEvent(eventName, params : any= {}) {
  const { user_id, email, ...rest } = params;

  sendMetaEvent(
    eventName,
    { ...rest },
    { user_id, email }
  );
}


// import SHA256 from "crypto-js/sha256";
// import * as Device from "expo-device";

// const FB_APP_ID = "835697332515011";
// const FB_ACCESS_TOKEN = "EAAQ0I4Q6eAwBQGK7ZBnKnkkVW7UWpXlRFwwUUy2rq4xeWW4p7KxIvAnywKo25ZCbnl9MYZC4CZC3vtY43LlvYaZCZARKCHaQu84ophOVcZBZBz4kuzZBEJiDZBDZAbfh6Wdsb3ojOzNsVCBseuoirvMrnVirUw8OZAaEGUUa8TeU2hEaH3RIvSaCVuMtottOxNUZBCwZDZD";// use the one you generated

// // Hash user fields (required for matching)
// const hash = (value) => {
//   if (!value) return undefined;
//   return SHA256(String(value).trim().toLowerCase()).toString();
// };

// export async function sendMetaEvent(eventName, customData: any = {}, userInfo : any= {}) {
//   if (!FB_ACCESS_TOKEN) {
//     console.error("❌ Missing FB token");
//     return;
//   }

//   // Meta required extinfo format for mobile apps
//   const extinfo = JSON.stringify([
//     "mbsdk",               // Fixed prefix
//     "1",                   // Version
//     Device.osName || "",   // OS
//     Device.osVersion || "",// OS version
//     Device.modelName || "",// Device model
//     "", "", ""             // Padding (required)
//   ]);

//   const payload = {
//     event: eventName,
//     advertiser_tracking_enabled: 1,
//     application_tracking_enabled: 1,
//     extinfo,
//     user_data: {
//       em: userInfo.email ? hash(userInfo.email) : undefined,
//       external_id: userInfo.user_id ? hash(userInfo.user_id) : undefined,
//     },
//     custom_data: customData,
//   };

//   console.log("📤 FB Payload:", JSON.stringify(payload, null, 2));

//   try {
//     const res = await fetch(
//       `https://graph.facebook.com/v18.0/${FB_APP_ID}/activities?access_token=${FB_ACCESS_TOKEN}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       }
//     );

//     const json = await res.json();
//     console.log("📩 FB Event Response:", json);
//   } catch (err) {
//     console.error("❌ FB CAPI Error:", err);
//   }
// }

// // Simple wrapper like your Vue version
// export function trackPixelEvent(eventName, params : any= {}) {
//   const { user_id, email, ...rest } = params;

//   sendMetaEvent(
//     eventName,
//     { ...rest },
//     { user_id, email }
//   );
// }





// import SHA256 from "crypto-js/sha256";
// import * as Device from "expo-device";

// const FB_PIXEL_ID = "1166304465175132";
// const FB_ACCESS_TOKEN = "EAAQ0I4Q6eAwBQGK7ZBnKnkkVW7UWpXlRFwwUUy2rq4xeWW4p7KxIvAnywKo25ZCbnl9MYZC4CZC3vtY43LlvYaZCZARKCHaQu84ophOVcZBZBz4kuzZBEJiDZBDZAbfh6Wdsb3ojOzNsVCBseuoirvMrnVirUw8OZAaEGUUa8TeU2hEaH3RIvSaCVuMtottOxNUZBCwZDZD";

// // Hash per Meta rules
// const hash = (value) => {
//   if (!value) return undefined;
//   return SHA256(String(value).trim().toLowerCase()).toString();
// };

// // Send raw CAPI event
// // export async function sendMetaEvent(eventName, customData: any = {}, userInfo : any= {}) {
// //   if (!FB_ACCESS_TOKEN) {
// //     console.error("❌ FB CAPI token missing.");
// //     return;
// //   }

// //   const payload = {
// //     data: [
// //       {
// //         event_name: eventName,
// //         event_time: Math.floor(Date.now() / 1000),
// //         action_source: "app",

// //         user_data: {
// //           // Required for matching
// //           em: userInfo.email ? hash(userInfo.email) : undefined,
// //           external_id: userInfo.user_id ? hash(userInfo.user_id) : undefined,
// //           client_user_agent: Device.osName,
// //           advertiser_tracking_enabled: 0
// //         },

// //         custom_data: customData,
// //       },
// //     ],
// //   };

// //   try {
// //     const res = await fetch(
// //       `https://graph.facebook.com/v18.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`,
// //       {
// //         method: "POST",
// //         headers: { "Content-Type": "application/json" },
// //         body: JSON.stringify(payload),
// //       }
// //     );
// //     const json = await res.json();
// //     console.log("📩 FB Event Sent:", eventName, json);
// //   } catch (err) {
// //     console.error("❌ FB Event Error:", err);
// //   }
// // }


// export async function sendMetaEvent(eventName, customData: any = {}, userInfo: any = {}) {
//   if (!FB_ACCESS_TOKEN) {
//     console.error("❌ FB CAPI token missing.");
//     return;
//   }

//   const extinfoArr = [
//   "mbsdk",
//   "1",
//   "13.4.0",
//   "0",
//   "0",
//   "0",
//   "0",
//   "0"
// ];


// //   const extinfoArr = [
// //     "mbsdk",                     // required by Meta
// //     "1.0",                       // version
// //     Device.osName || "",         // OS name
// //     Device.osVersion || "",      // OS version
// //     Device.modelName || "",      // device model
// //     "", "", ""                   // required padding
// //   ];

//   const payload = {
//     data: [
//       {
//         event_name: eventName,
//         event_time: Math.floor(Date.now() / 1000),
//         action_source: "app",

//         app_data: {
//           advertiser_tracking_enabled: 1,
//           application_tracking_enabled: 1,
//           extinfo: JSON.stringify(extinfoArr),
//         },

//         user_data: {
//           em: userInfo.email ? hash(userInfo.email) : undefined,
//           external_id: userInfo.user_id ? hash(userInfo.user_id) : undefined,
//           client_user_agent: Device.osName,
//         },

//         custom_data: customData,
//       },
//     ],
//   };

//   try {
//     const res = await fetch(
//       `https://graph.facebook.com/v18.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       }
//     );

//     const json = await res.json();
//     console.log("FB Payload log:", JSON.stringify(payload, null, 2));
//     console.log("FB Event Sent log:", eventName, json);
//   } catch (err) {
//     console.error("❌ FB Event Error:", err);
//   }
// }




// // Same API as Vue: trackPixelEvent("EventName", {params})
// export function trackPixelEvent(eventName, params : any= {}) {
//   const { user_id, email, ...rest } = params;

//   const context = {
//     source: "react-native-app",
//     device: Device.osName,
//     timestamp: Date.now(),
//   };

//   sendMetaEvent(eventName, { ...rest, ...context }, { user_id, email });
// }





// import * as Device from "expo-device";

// const FB_PIXEL_ID = "1166304465175132";
// const FB_ACCESS_TOKEN = "EAAQ0I4Q6eAwBQGK7ZBnKnkkVW7UWpXlRFwwUUy2rq4xeWW4p7KxIvAnywKo25ZCbnl9MYZC4CZC3vtY43LlvYaZCZARKCHaQu84ophOVcZBZBz4kuzZBEJiDZBDZAbfh6Wdsb3ojOzNsVCBseuoirvMrnVirUw8OZAaEGUUa8TeU2hEaH3RIvSaCVuMtottOxNUZBCwZDZD";

// export async function sendMetaEvent(eventName, customData = {}) {
//   if (!FB_ACCESS_TOKEN) {
//     console.error("❌ FB CAPI token missing.");
//     return;
//   }

//   const payload = {
//     data: [
//       {
//         event_name: eventName,
//         event_time: Math.floor(Date.now() / 1000),
//         action_source: "app",
//         user_data: {
//           client_user_agent: Device.osName,
//         },
//         custom_data: customData,
//       },
//     ],
//   };

//   try {
//     const res = await fetch(
//       `https://graph.facebook.com/v18.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`,
//       {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       }
//     );

//     const json = await res.json();
//     console.log("📩 FB Event Sent:", eventName, json);
//   } catch (err) {
//     console.error("❌ FB Event Error:", err);
//   }
// }
