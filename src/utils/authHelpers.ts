import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * ensureLoggedIn
 * - navigation: React Navigation navigation prop
 * - pendingDataKey: string key to save pending action in AsyncStorage
 * - data: optional object to save so it can be resumed after login
 *
 * Returns true if user already logged in (has access_token), false otherwise.
 */
export const ensureLoggedIn = async (navigation: any, pendingDataKey: string, data: any = null) => {
  const accessToken = await AsyncStorage.getItem("access_token");
  if (!accessToken) {
    if (data) {
      await AsyncStorage.setItem(pendingDataKey, JSON.stringify(data));
    }
    // Navigate to Login screen; include info which screen sent the user
    navigation.navigate("Login", { from: pendingDataKey });
    return false;
  }
  return true;
};
