// import AsyncStorage from "@react-native-async-storage/async-storage";

import AsyncStorage from "@react-native-async-storage/async-storage";

// export const ensureLoggedIn = async (navigation: any, pendingDataKey: string, data: any = null) => {
//   const accessToken = await AsyncStorage.getItem("access_token");
//   if (!accessToken) {
//     if (data) {
//       await AsyncStorage.setItem(pendingDataKey, JSON.stringify(data));
//     }
//     // Navigate to Login screen; include info which screen sent the user
//     navigation.navigate("Login", { from: pendingDataKey });
//     return false;
//   }
//   return true;
// };

export const ensureLoggedIn = async (
  navigation,
  pendingDataKey,
  data = null,
  redirectScreen = null
) => {
  const accessToken = await AsyncStorage.getItem("access_token");

  if (!accessToken) {
    if (data) {
      await AsyncStorage.setItem(pendingDataKey, JSON.stringify(data));
    }

    navigation.navigate("Login", {
      from: pendingDataKey,
      restoreTo: redirectScreen,   // ⭐ Tell login where to come back
    });

    return false;
  }

  return true;
};

