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
import { Animated, StyleSheet, View, Image, ImageBackground, StatusBar, AccessibilityInfo } from "react-native";
import { useScreenStore } from "./src/engine/useScreenBridge";
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
import {
  setPreference,
  restorePreferences,
  fetchPreferences,
  fetchNotificationPrefs,
} from "./src/store/preferencesSlice";
// Audit fix F6 (2026-04-13): companion-state boot
import {
  restoreCompanionState,
  fetchCompanionState,
} from "./src/store/companionStateSlice";

// 📌 Push Notification Service
import {
  foregroundNotificationListener,
  notificationOpenListener,
  requestPushPermission,
} from "./src/service/pushNotifications";
import { registerDeviceToBackend } from "./src/utils/registerDevice";
import { initScreenResolver } from "./src/engine/screenResolver";
// DEV-only: kalpx://mitra/<container>/<state> deep-link handler for
// validation screenshots. No-op in release builds (gated by __DEV__).
import { initDeepLinkHandler } from "./src/navigation/deepLinkHandler";

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

// Inner component that has access to Redux Provider
function AppInner({ initialRoute, navigationRef }) {
  const currentBackground = useScreenStore((state) => state.currentBackground);
  const dispatch = useDispatch();

  // Hydrate the login user from AsyncStorage on app boot.
  // The login flow already persists access_token + refresh_token + user_id to
  // AsyncStorage, but the Redux state.login.user was being lost on restart.
  // This restores it so the user stays logged in across app launches.
  //
  // Mitra v3: also bootstraps preferencesSlice — first restores from
  // AsyncStorage (fast render), then if the user is authed, fetches from
  // /api/mitra/user-preferences/ and /api/mitra/user-preferences/notifications/
  // (MITRA_V3_USER_PREFERENCES flag is live on dev). Both fetches are
  // 404-tolerant and never throw to the UI.
  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        // Preferences restore first (no auth required, just AsyncStorage)
        dispatch(restorePreferences());

        const [token, userId] = await Promise.all([
          AsyncStorage.getItem("access_token"),
          AsyncStorage.getItem("user_id"),
        ]);
        if (cancelled || !token) return;

        // Minimal user shape — full profile can be re-fetched on demand.
        const user = userId ? { id: Number(userId) } : { id: null };
        dispatch({ type: "LOGIN_SUCCESS", payload: user });

        // Authed: sync preferences from backend (overrides restored values
        // for server-owned fields; client-only fields are preserved).
        dispatch(fetchPreferences());
        dispatch(fetchNotificationPrefs());

        // Audit fix F6 (2026-04-13): companion-state hydration.
        // restore from AsyncStorage first (fast render), then fetch from
        // backend to sync. Both 404-tolerant via the slice.
        dispatch(restoreCompanionState());
        dispatch(fetchCompanionState());
      } catch (err) {
        console.warn("[BOOT] login hydration failed:", err?.message);
      }
    };
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return (
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
      <ToastHost />
    </View>
  );
}

export default function App() {
  const [fontsLoaded, error] = useFonts({
    // KalpX design language: Cormorant Garamond (serif) + Inter (sans)
    CormorantGaramond_400Regular: require("@expo-google-fonts/cormorant-garamond/400Regular/CormorantGaramond_400Regular.ttf"),
    CormorantGaramond_700Bold: require("@expo-google-fonts/cormorant-garamond/700Bold/CormorantGaramond_700Bold.ttf"),
    Inter_400Regular: require("@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf"),
    Inter_500Medium: require("@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf"),
    Inter_600SemiBold: require("@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf"),
    Inter_700Bold: require("@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf"),
    // Legacy aliases — Gelica mapped to new fonts for backward compatibility
    GelicaBold: require("@expo-google-fonts/cormorant-garamond/700Bold/CormorantGaramond_700Bold.ttf"),
    GelicaRegular: require("@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf"),
    GelicaMedium: require("@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf"),
    GelicaLight: require("@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf"),
    // decorative — Cinzel
    Cinzel_400Regular: require("@expo-google-fonts/cinzel/400Regular/Cinzel_400Regular.ttf"),
    Cinzel_700Bold: require("@expo-google-fonts/cinzel/700Bold/Cinzel_700Bold.ttf"),
    // Week 7 — Devanagari for Why-This L3 Sanskrit sources
    NotoSansDevanagari_400Regular: require("@expo-google-fonts/noto-sans-devanagari/400Regular/NotoSansDevanagari_400Regular.ttf"),
    NotoSansDevanagari_700Bold: require("@expo-google-fonts/noto-sans-devanagari/700Bold/NotoSansDevanagari_700Bold.ttf"),
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

  // Reduced-motion accessibility bootstrap — Mitra v3 Week 7.
  // GriefRoomContainer + CompanionedChant read preferences.reduced_motion to
  // skip breath pulse / orb scale animations. We read the OS setting once on
  // mount and subscribe for changes; the preference also persists via
  // preferencesSlice so user overrides survive relaunch.
  useEffect(() => {
    let subscription;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        store.dispatch(setPreference({ key: "reduced_motion", value: !!enabled }));
      })
      .catch(() => {});
    subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => {
        store.dispatch(setPreference({ key: "reduced_motion", value: !!enabled }));
      },
    );
    return () => {
      if (subscription?.remove) subscription.remove();
    };
  }, []);

  // Initial Route Logic
  useEffect(() => {
    const init = async () => {
      if (!fontsLoaded && !error) return;
      
      // Preload screen definitions from API (falls back to local)
      initScreenResolver().catch((err) =>
        console.warn("Screen resolver init failed (using local fallback):", err)
      );

      // DEV-only deep-link handler — no-op in release builds.
      initDeepLinkHandler().catch(() => {});

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
            <AppInner initialRoute={initialRoute} navigationRef={navigationRef} />
          </CartProvider>
        </ToastProvider>
      </Provider>
    </MenuProvider>
  );
}
