import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import * as Device from "expo-device";
import { Platform } from "react-native";
import api from "../Networks/axios"; // your axios wrapper

export async function registerDeviceToBackend() {
  try {
    // 1️⃣ FCM Token
    const fcmToken = await messaging().getToken();
    if (!fcmToken) {
      console.log("❌ No FCM token yet");
      return;
    }
console.log("fcmToken >>>>>>>>>>",fcmToken);
    // 2️⃣ Device ID (unique per device)
    const deviceId = Device.osInternalBuildId;

      let guestUUID = await AsyncStorage.getItem("guestUUID");
    if (!guestUUID) {
      guestUUID = `guest_${Math.random().toString(36).substring(2, 15)}`;
      await AsyncStorage.setItem("guestUUID", guestUUID);
    }

    // 3️⃣ Payload WITHOUT guest_uuid (backend no longer wants it)
    const payload = {
      device_id: deviceId,
      platform: Platform.OS,
      token: fcmToken,
      guest_uuid: guestUUID
    };

    console.log("📡 Registering Device 8→", payload);

    // 4️⃣ POST request
    const res = await api.post(
      "/notifications/register-device/",
      payload
    );

    console.log("📡 Device Register Response:", res.data);

  } catch (error) {
    console.log("❌ Device registration failed:", error?.message);
  }
}









// import AsyncStorage from "@react-native-async-storage/async-storage";
// import messaging from "@react-native-firebase/messaging";
// import * as Device from "expo-device";
// import { Platform } from "react-native";
// import api from "../Networks/axios";

// /**
//  * ✅ Uses the SAME guestUUID created in utils/api.js
//  */
// async function getExistingGuestUUID() {
//   let uuid = await AsyncStorage.getItem("guestUUID");
//   if (!uuid) {
//     // fallback — avoid creating new. Using device id for stability
//     uuid = Device.osInternalBuildId || `guest_${Date.now()}`;
//     await AsyncStorage.setItem("guestUUID", uuid);
//   }
//   return uuid;
// }

// export async function registerDeviceToBackend() {
//   try {
//     // 1️⃣ FCM Token
//     const fcmToken = await messaging().getToken();
//     if (!fcmToken) {
//       console.log("❌ No FCM token yet");
//       return;
//     }

//     // 2️⃣ Unique device ID
//     const deviceId = Device.osInternalBuildId;

//     // 3️⃣ Get SAME guestUUID used in axios interceptors
//     const guestUUID = await getExistingGuestUUID();

//     const payload = {
//       device_id: deviceId,
//       platform: Platform.OS,
//       token: fcmToken,
//       guest_uuid: guestUUID,
//     };

//     console.log("📡 Registering Device:", payload);

//  const res = await api.post("/register-device/", payload, {
//   headers: {
//     "X-Guest-UUID": guestUUID,
//   },
// });

// console.log("📡 Device Register Response Data:", res.data);

// if (typeof res.data === "string" && res.data.startsWith("<!DOCTYPE html")) {
//   console.log("❌ ERROR: HTML received — wrong API endpoint!");
// } else {
//   console.log("✅ Device registered successfully:", res.data);
// }


//   } catch (error) {
//     console.log("❌ Device registration failed:", error?.message);
//   }
// }