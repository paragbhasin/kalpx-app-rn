// MUST be first import
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";

const TransparentTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: 'transparent',
  },
};
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, useRef } from "react";
import { Animated, StyleSheet, View, Image, ImageBackground, StatusBar } from "react-native";
import { useScreenStore } from "./src/engine/ScreenStore";
import "react-native-get-random-values";
import { MenuProvider } from "react-native-popup-menu";
import { Provider, useDispatch, useSelector } from "react-redux";

import SnackBar from "./src/components/SnackBar";
import "./src/config/i18n";
import { CartProvider } from "./src/context/CartContext";
import { ToastProvider } from "./src/context/ToastContext";
import ToastHost from "./src/components/ToastHost";
import { navigationRef } from "./src/Shared/Routes/NavigationService";
import Routes from "./src/Shared/Routes/Routes";
import { store } from "./src/store";
import { hideSnackBar } from "./src/store/snackBarSlice";

// 📌 Push Notification Service
import {
  foregroundNotificationListener,
  notificationOpenListener,
  requestPushPermission,
} from "./src/service/pushNotifications";
import { registerDeviceToBackend } from "./src/utils/registerDevice";

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
  const currentBackground = useScreenStore((state) => state.currentBackground);
  const [fontsLoaded, error] = useFonts({
    GelicaRegular: require("./assets/fonts/gelica-regular.otf"),
    GelicaLight: require("./assets/fonts/gelica-light.otf"),
    GelicaMedium: require("./assets/fonts/gelica-medium.otf"),
    GelicaBold: require("./assets/fonts/gelica-bold.otf"),
  });

  const [initialRoute, setInitialRoute] = useState(null);

  // Google login setup
  GoogleSignin.configure({
    iosClientId:
      "800459558908-5bt6k0ihh1vh1o003m43ffltrkhhlnu1.apps.googleusercontent.com",
    webClientId:
      "800459558908-gi4poj40ulaoc3a0gkc3rbaevfubt4vm.apps.googleusercontent.com",
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
      
      // Set route and hide splash immediately to speed up launch
      setInitialRoute("AppDrawer");
      await SplashScreen.hideAsync().catch(() => {});

      try {
        // Register device in background without blocking
        registerDeviceToBackend();
      } catch (err) {
        console.log("Background initialization error:", err);
      }
    };
    init();
  }, [fontsLoaded, error]);

  if (!fontsLoaded || initialRoute === null) return null;

  return (
    <MenuProvider>
      <Provider store={store}>
        <ToastProvider>
          <CartProvider>
            <View style={{ flex: 1, backgroundColor: currentBackground ? 'transparent' : '#FFF' }}>
              <StatusBar 
                barStyle={currentBackground ? "light-content" : "dark-content"} 
                translucent={!!currentBackground} 
                backgroundColor="transparent" 
              />
              <NavigationContainer ref={navigationRef} theme={TransparentTheme}>
                {currentBackground ? (
                  <ImageBackground source={currentBackground} style={{ flex: 1 }} resizeMode="cover">
                    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
                      <Routes initialRouteName={initialRoute} />
                      <SnackBarContainer />
                    </View>
                  </ImageBackground>
                ) : (
                  <View style={{ flex: 1, backgroundColor: '#FFF' }}>
                    <Routes initialRouteName={initialRoute} />
                    <SnackBarContainer />
                  </View>
                )}
              </NavigationContainer>
            </View>
            <ToastHost />
          </CartProvider>
        </ToastProvider>
      </Provider>
    </MenuProvider>
  );
}
