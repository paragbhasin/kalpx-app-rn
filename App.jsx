// MUST be first import
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import 'react-native-get-random-values';
import { MenuProvider } from "react-native-popup-menu";
import { Provider, useDispatch, useSelector } from "react-redux";

import SnackBar from "./src/components/SnackBar";
import "./src/config/i18n";
import { CartProvider } from "./src/context/CartContext";
import { navigationRef } from "./src/Shared/Routes/NavigationService";
import Routes from "./src/Shared/Routes/Routes";
import { store } from "./src/store";
import { hideSnackBar } from "./src/store/snackBarSlice";

// 📌 Push Notification Service
import {
  foregroundNotificationListener,
  notificationOpenListener,
  requestPushPermission
} from "./src/service/pushNotifications";

SplashScreen.preventAutoHideAsync().catch(() => {});

// Always show notifications when app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function SnackBarContainer() {
  const dispatch = useDispatch();
  const { visible, message } = useSelector((state) => state.snackBar);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => dispatch(hideSnackBar()), 3000);
    return () => clearTimeout(timer);
  }, [visible, dispatch]);

  return <SnackBar visible={visible} message={message} />;
}

export default function App() {
  const [fontsLoaded, error] = useFonts({
    GelicaRegular: require("./assets/fonts/gelica-regular.otf"),
    GelicaLight: require("./assets/fonts/gelica-light.otf"),
    GelicaMedium: require("./assets/fonts/gelica-medium.otf"),
    GelicaBold: require("./assets/fonts/gelica-bold.otf"),
  });

  const [initialRoute, setInitialRoute] = useState(null);

  // Google login setup
  GoogleSignin.configure({
    webClientId: '473187060791-pqas4l17udkmt37re2l3fkdfs585onqt.apps.googleusercontent.com',
    iosClientId: '473187060791-96pucdifumqrnn7lb5l6bboqladmarat.apps.googleusercontent.com',
    offlineAccess: true,
  });

  // Push Notification setup
  useEffect(() => {
    // request push permissions
    requestPushPermission();

    // listeners
    const unsubForeground = foregroundNotificationListener();
    const unsubOpen = notificationOpenListener();

    return () => {
      unsubForeground();
      unsubOpen();
    };
  }, []);

  // Initial Route Logic
  useEffect(() => {
    const init = async () => {
      if (!fontsLoaded && !error) return;
      try {
        const accessToken = await AsyncStorage.getItem("access_token");
        const refreshToken = await AsyncStorage.getItem("refresh_token");
        setInitialRoute(accessToken && refreshToken ? "AppDrawer" : "Welcome");
        await new Promise(res => setTimeout(res, 300));
      } catch {
        setInitialRoute("Welcome");
      } finally {
        await SplashScreen.hideAsync().catch(() => {});
      }
    };
    init();
  }, [fontsLoaded, error]);

  if (!fontsLoaded || initialRoute === null) return null;

  return (
    <MenuProvider>
      <Provider store={store}>
         <CartProvider>
        <NavigationContainer ref={navigationRef}>
          <Routes initialRouteName={initialRoute} />
          <SnackBarContainer />
        </NavigationContainer>
        </CartProvider>
      </Provider>
    </MenuProvider>
  );
}
