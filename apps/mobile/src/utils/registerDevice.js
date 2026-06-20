import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import * as Device from "expo-device";
import { Platform } from "react-native";
import api from "../Networks/axios"; // your axios wrapper

// Run once per app session. Home's useFocusEffect (and the duplicate-nested
// HomePage) otherwise fire this — plus its coupled timezone PATCH — 5× on boot,
// tripping the backend rate limit. Module-level guard dedupes across all the
// component instances a per-component ref can't reach.
let _registerInFlight = null;
let _registeredThisSession = false;

export async function registerDeviceToBackend() {
  if (_registeredThisSession) return;
  if (_registerInFlight) return _registerInFlight;
  _registerInFlight = (async () => {
    try {
      await _registerDeviceToBackendImpl();
      _registeredThisSession = true;
    } finally {
      _registerInFlight = null;
    }
  })();
  return _registerInFlight;
}

async function _registerDeviceToBackendImpl() {
  try {
    // 1️⃣ FCM Token
    const fcmToken = await messaging().getToken();
    if (!fcmToken) {
      console.log("❌ No FCM token yet");
      return;
    }

    // 2️⃣ Device ID (unique per device)
    const deviceId = Device.osInternalBuildId;

    let guestUUID = await AsyncStorage.getItem("guestUUID");
    if (!guestUUID) {
      guestUUID = `guest_${Math.random().toString(36).substring(2, 15)}`;
      await AsyncStorage.setItem("guestUUID", guestUUID);
    }

    const payload = {
      device_id: deviceId,
      platform: Platform.OS,
      token: fcmToken,
      guest_uuid: guestUUID,
    };

    // 3️⃣ Register device token
    const res = await api.post("/notifications/register-device/", payload);
    console.log("📡 Device Register Response:", res.data);

    // 5️⃣ Confirm device timezone so push eligibility Gate 1 passes.
    // Without this, timezone_source stays "default" and all reminders
    // are silently suppressed by is_eligible_for_push().
    try {
      const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (deviceTimezone) {
        await api.patch("users/profile/update_profile/", {
          timezone: deviceTimezone,
          timezone_confirmed_from_device: true,
        });
        console.log("🕐 Timezone confirmed:", deviceTimezone);
      }
    } catch (tzError) {
      console.log("⚠️ Timezone confirm failed (non-fatal):", tzError?.message);
    }
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
