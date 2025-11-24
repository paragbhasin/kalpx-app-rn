import * as Device from "expo-device";
import { Platform } from "react-native";
import api from "../Networks/axios";

const unregisterDeviceFromBackend = async () => {
  try {
    const deviceId = Device.osInternalBuildId;
    const platform = Platform.OS;

    const payload = {
      device_id: deviceId,
      platform: platform,
    };

    console.log("📡 Unregistering Device:", payload);

    const res = await api.post("/notifications/unregister-device/", payload);

    console.log("🗑️ Unregister Response:", res.data);

  } catch (error) {
    console.log("❌ Device unregistration failed:", error?.message);
  }
}

export default unregisterDeviceFromBackend;