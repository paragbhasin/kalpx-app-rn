import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import BASE_URL from "../Networks/baseURL";
import { BIOMETRIC_TOKEN_KEY, BIOMETRIC_REGISTERED_KEY } from "../utils/biometricKeys";
import { registerDeviceToBackend } from "../utils/registerDevice";

export function useBiometricLogin() {
  const dispatch = useDispatch();
  const [hasBiometricLogin, setHasBiometricLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check the AsyncStorage flag — no Face ID needed just to know if it's set up
  useEffect(() => {
    AsyncStorage.getItem(BIOMETRIC_REGISTERED_KEY).then((val) => {
      setHasBiometricLogin(val === "1");
    });
  }, []);

  const handleBiometricLogin = useCallback(
    async (onSuccess: () => Promise<void>) => {
      setLoading(true);
      setError(null);
      try {
        // getItemAsync with requireAuthentication: true triggers Face ID / Touch ID
        // automatically — no separate LocalAuthentication call needed.
        const storedRefresh = await SecureStore.getItemAsync(
          BIOMETRIC_TOKEN_KEY,
          { requireAuthentication: true },
        );

        if (!storedRefresh) {
          // Registered flag was set but the Keychain item is gone (device restore, etc.)
          await AsyncStorage.removeItem(BIOMETRIC_REGISTERED_KEY);
          setHasBiometricLogin(false);
          setError("Biometric login is no longer available. Please log in again.");
          return;
        }

        // Exchange the stored refresh token for a fresh access token
        const response = await axios.post(`${BASE_URL}/token/refresh/`, {
          refresh: storedRefresh,
        });

        const { access, refresh } = response.data;
        if (!access) throw new Error("Token refresh returned no access token");

        await AsyncStorage.setItem("access_token", access);

        if (refresh) {
          await AsyncStorage.setItem("refresh_token", refresh);
          // Rotate the Keychain token so it stays fresh
          await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, refresh, {
            requireAuthentication: true,
          });
        }

        // Restore user in Redux (same shape as App.jsx hydration)
        const userId = await AsyncStorage.getItem("user_id");
        const user = userId ? { id: Number(userId) } : { id: null };
        dispatch({ type: "LOGIN_SUCCESS", payload: user });

        await registerDeviceToBackend();
        await onSuccess();
      } catch (err: any) {
        const msg: string = err?.response?.data?.detail || err?.message || "";

        if (
          msg.toLowerCase().includes("token") &&
          (msg.toLowerCase().includes("invalid") ||
            msg.toLowerCase().includes("expired") ||
            msg.toLowerCase().includes("blacklist"))
        ) {
          // Refresh token is expired / invalidated — clear biometric login
          await AsyncStorage.removeItem(BIOMETRIC_REGISTERED_KEY);
          await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY).catch(() => {});
          setHasBiometricLogin(false);
          setError("Session expired. Please log in again.");
        } else if (
          // User cancelled Face ID — err.message contains "cancelled" or similar
          msg.toLowerCase().includes("cancel") ||
          msg.toLowerCase().includes("user cancel") ||
          msg.toLowerCase().includes("authentication failed")
        ) {
          // Silent — user just tapped Cancel on the Face ID prompt
        } else {
          setError("Biometric login failed. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    },
    [dispatch],
  );

  return { hasBiometricLogin, loading, error, handleBiometricLogin };
}
