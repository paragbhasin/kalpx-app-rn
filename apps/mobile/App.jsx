// MUST be first import
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  ImageBackground,
  Linking,
  LogBox,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import "react-native-get-random-values";
import { MenuProvider } from "react-native-popup-menu";
import { Provider, useDispatch, useSelector } from "react-redux";
import { useScreenStore } from "./src/engine/useScreenBridge";

import SnackBar from "./src/components/SnackBar";
import ToastHost from "./src/components/ToastHost";
import { NotificationNudgeBanner } from "./src/components/NotificationNudgeBanner";
import "./src/config/i18n";
import { CartProvider } from "./src/context/CartContext";
import { ToastProvider } from "./src/context/ToastContext";
import { navigationRef } from "./src/Shared/Routes/NavigationService";
import Routes from "./src/Shared/Routes/Routes";
import { store } from "./src/store";
import {
  fetchNotificationPrefs,
  fetchPreferences,
  restorePreferences,
  setPreference,
} from "./src/store/preferencesSlice";
import { hideSnackBar } from "./src/store/snackBarSlice";
// Audit fix F6 (2026-04-13): companion-state boot
import {
  fetchCompanionState,
  restoreCompanionState,
} from "./src/store/companionStateSlice";

// 📌 Push Notification Service
import { initScreenResolver } from "./src/engine/screenResolver";
import {
  requestPushPermission,
  foregroundNotificationListener,
  notificationOpenListener,
} from "./src/service/pushNotifications";
import { attachDeepLinkListeners } from "./src/utils/deeplink";
import { registerDeviceToBackend } from "./src/utils/registerDevice";
import { initAnalytics } from "./src/utils/initAnalytics";

import UpdateModal from "./src/components/UpdateModal";
import { AppLockOverlay } from "./src/components/AppLockOverlay";
import BiometricPromptModal from "./src/components/BiometricPromptModal";
import { useUpdateCheck } from "./src/hooks/useUpdateCheck";
import { useAppLock } from "./src/hooks/useAppLock";
import { useBiometricPrompt } from "./src/hooks/useBiometricPrompt";

const TransparentTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent",
  },
};

// Silence benign dev-only noise that triggers LogBox overlay and blocks
// Maestro automation. FB CAPI "Param event must be one of ..." error
// fires on every login in dev (Simulator doesn't meet Meta's allowed
// event enum); harmless in prod where the event is gated.
// 2026-04-19 Wave 3 — Maestro unblock.
if (__DEV__) {
  LogBox.ignoreLogs([/FB CAPI Error/i, /Param event must be one of/i]);
}

SplashScreen.preventAutoHideAsync().catch(() => {});

// Max time to wait for screen resolver API before falling back to local schemas.
const SCREEN_RESOLVER_STARTUP_TIMEOUT_MS = 3000;

// Always show notifications when app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// React 19 removed defaultProps on function components — Text/TextInput
// allowFontScaling is handled per-component or via StyleSheet going forward.

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

function isMitraRouteName(routeName) {
  return [
    "Home",
    "DynamicEngine",
    "MitraEngine",
    "GuidedGrowth",
    "MitraPhilosophy",
    "MitraStart",
    "MitraIntention",
    "NewMitraHome",
    "QuickCheckin",
    "BrowseRooms",
    "RhythmHome",
    "RhythmSetup",
    "RhythmEdit",
    "InnerPath",
    "QuickReset",
    "TellMitra",
    "MitraStart",
    "InnerPathMantraRunner",
    "InnerPathSankalpRunner",
    "InnerPathPracticeRunner",
    "RhythmMantraRunner",
    "RhythmSankalpRunner",
    "RhythmPracticeRunner",
    "InnerPathMantraCompletion",
    "InnerPathSankalpCompletion",
    "InnerPathPracticeCompletion",
    "RhythmMantraCompletion",
    "RhythmSankalpCompletion",
    "RhythmPracticeCompletion",
  ].includes(routeName);
}

// Inner component that has access to Redux Provider
function AppInner({ initialRoute, navigationRef }) {
  const currentBackground = useScreenStore((state) => state.currentBackground);
  const dispatch = useDispatch();
  const [activeRouteName, setActiveRouteName] = useState(null);

  const { showUpdate, updateType, dismissUpdate } = useUpdateCheck();
  const { overlayMode, handleUnlock } = useAppLock();
  const {
    showPrompt: showBiometricPrompt,
    biometricLabel,
    handleEnable: handleBiometricEnable,
    handleDismiss: handleBiometricDismiss,
  } = useBiometricPrompt();

  const handleOpenStore = () => {
    const url =
      Platform.OS === "ios"
        ? "https://apps.apple.com/app/kalpx/id6755144623"
        : "market://details?id=com.kalpx.app";
    Linking.openURL(url).catch(() => {});
    dismissUpdate();
  };

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
        // Await restore so app_lock_enabled is in Redux BEFORE fetchPreferences
        // sets loaded:true — prevents the race that would dismiss the lock overlay.
        await dispatch(restorePreferences());

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

        // Guide mode: if flag is set, re-verify with backend then navigate.
        const isGuideFlag = await AsyncStorage.getItem("kalpx_is_guide");
        if (isGuideFlag === "1") {
          try {
            const { default: api } = await import("./src/Networks/axios");
            await api.get("guide/my-profile/");
            // Still a guide — navigate when navigator is ready
            const tryNav = (attempts = 15) => {
              const { navigationRef } = require("./src/Shared/Routes/NavigationService");
              if (navigationRef.isReady()) {
                navigationRef.navigate("GuideHome");
              } else if (attempts > 0) {
                setTimeout(() => tryNav(attempts - 1), 200);
              }
            };
            tryNav();
          } catch {
            // No longer a guide (role revoked) — clear flag and stay on normal home
            await AsyncStorage.removeItem("kalpx_is_guide");
          }
        }
      } catch (err) {
        console.warn("[BOOT] login hydration failed:", err?.message);
      }
    };
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const shouldShowMitraBackground =
    !!currentBackground && isMitraRouteName(activeRouteName);
  const shouldUseMitraFallback =
    !currentBackground && isMitraRouteName(activeRouteName);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: shouldShowMitraBackground
          ? "transparent"
          : shouldUseMitraFallback
            ? "#FAF7F2"
            : "#FFF",
      }}
    >
      <StatusBar
        barStyle={shouldShowMitraBackground ? "light-content" : "dark-content"}
        translucent={!!shouldShowMitraBackground}
        backgroundColor="transparent"
      />
      {/*
       * Background image sits absolutely-positioned BEHIND NavigationContainer.
       * Previously this used a conditional {bg ? <ImageBackground><Routes/> : <View><Routes/>}
       * which caused React to unmount+remount Routes on every currentBackground change
       * (different component types at the same tree position → full subtree remount).
       * That remount fired the useFocusEffect cleanup in Home → updateBackground(null)
       * → branch flipped back → remount again → infinite loop / max update depth crash.
       *
       * Fix: Routes is always in the same position (inside NavigationContainer).
       * The background layer is an absolute sibling that appears/disappears without
       * affecting the position index of NavigationContainer or anything inside it.
       */}
      {shouldShowMitraBackground && (
        <ImageBackground
          source={currentBackground}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
      )}
      <NavigationContainer
        ref={navigationRef}
        theme={TransparentTheme}
        onReady={() => {
          setActiveRouteName(navigationRef?.getCurrentRoute?.()?.name || null);
        }}
        onStateChange={() => {
          setActiveRouteName(navigationRef?.getCurrentRoute?.()?.name || null);
        }}
      >
        <View style={{ flex: 1, backgroundColor: "transparent" }}>
          <NotificationNudgeBanner />
          <Routes initialRouteName={initialRoute} />
          <SnackBarContainer />
        </View>
      </NavigationContainer>
      <ToastHost />
      <UpdateModal
        visible={showUpdate}
        updateType={updateType}
        onUpdateNow={handleOpenStore}
        onLater={dismissUpdate}
      />
      {overlayMode !== 'hidden' && (
        <AppLockOverlay mode={overlayMode} onUnlock={handleUnlock} />
      )}
      <BiometricPromptModal
        visible={showBiometricPrompt}
        biometricLabel={biometricLabel}
        onEnable={handleBiometricEnable}
        onDismiss={handleBiometricDismiss}
      />
    </View>
  );
}

export default function App() {
  const [fontsLoaded, error] = useFonts({
    // KalpX design language: Cormorant Garamond (serif) + Inter (sans)
    CormorantGaramond_400Regular: require("@expo-google-fonts/cormorant-garamond/400Regular/CormorantGaramond_400Regular.ttf"),
    CormorantGaramond_700Bold: require("@expo-google-fonts/cormorant-garamond/700Bold/CormorantGaramond_700Bold.ttf"),
    Inter_300Light_Italic: require("@expo-google-fonts/inter/300Light_Italic/Inter_300Light_Italic.ttf"),
    Inter_400Regular: require("@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf"),
    Inter_500Medium: require("@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf"),
    Inter_600SemiBold: require("@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf"),
    Inter_700Bold: require("@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf"),
    Inter_900Black_Italic: require("@expo-google-fonts/inter/900Black_Italic/Inter_900Black_Italic.ttf"),
    // Legacy aliases — Gelica mapped to new fonts for backward compatibility
    GelicaBold: require("@expo-google-fonts/cormorant-garamond/700Bold/CormorantGaramond_700Bold.ttf"),
    GelicaRegular: require("@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf"),
    GelicaMedium: require("@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf"),
    GelicaLight: require("@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf"),
    // Devanagari for Hindi/Marathi and Sanskrit sources
    NotoSansDevanagari_400Regular: require("@expo-google-fonts/noto-sans-devanagari/400Regular/NotoSansDevanagari_400Regular.ttf"),
    NotoSansDevanagari_500Medium: require("@expo-google-fonts/noto-sans-devanagari/500Medium/NotoSansDevanagari_500Medium.ttf"),
    NotoSansDevanagari_700Bold: require("@expo-google-fonts/noto-sans-devanagari/700Bold/NotoSansDevanagari_700Bold.ttf"),
  });

  const [initialRoute, setInitialRoute] = useState(null);
  const startupFinishedRef = useRef(false);

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
    // On launch: show native permission dialog (first time only).
    // If already granted, register device. If denied, RemindersScreen handles it.
    requestPushPermission().then((token) => {
      if (token) registerDeviceToBackend();
    });

    // listeners
    const unsubForeground = foregroundNotificationListener();
    const unsubOpen = notificationOpenListener();

    return () => {
      unsubForeground();
      unsubOpen();
    };
  }, []);

  // Deep-link handler — Phase C pilot infrastructure (dev-only gate).
  // Enables `xcrun simctl openurl booted "kalpx://mitra/<container>/<state>"`
  // for sim validation + future notification-nav. See src/utils/deeplink.ts.
  useEffect(() => {
    const detach = attachDeepLinkListeners();
    return () => detach();
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
        store.dispatch(
          setPreference({ key: "reduced_motion", value: !!enabled }),
        );
      })
      .catch(() => {});
    subscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => {
        store.dispatch(
          setPreference({ key: "reduced_motion", value: !!enabled }),
        );
      },
    );
    return () => {
      if (subscription?.remove) subscription.remove();
    };
  }, []);

  // Initial Route Logic — waits for font readiness (or font error) before showing app.
  // startupFinishedRef prevents a double-run if fontsLoaded/error both change in quick
  // succession (e.g. late error event after initial load).
  useEffect(() => {
    const init = async () => {
      if (!fontsLoaded && !error) return;
      if (startupFinishedRef.current) return;
      startupFinishedRef.current = true;

      try {
        // Warm screen-definition cache from API, capped so slow networks don't hang splash.
        // Late resolver resolution only warms a local cache — it never redirects the user.
        await Promise.race([
          initScreenResolver().catch((err) =>
            console.warn("Screen resolver init failed (using local fallback):", err),
          ),
          new Promise((resolve) =>
            setTimeout(resolve, SCREEN_RESOLVER_STARTUP_TIMEOUT_MS),
          ),
        ]);

        // Set route before hiding splash so NavigationContainer mounts with a valid route.
        setInitialRoute("AppDrawer");
        await SplashScreen.hideAsync().catch(() => {});

        // Register device in background — must not block splash hide.
        registerDeviceToBackend();
        initAnalytics().catch(() => {});
      } catch (err) {
        console.warn("Startup sequence error:", err);
        // Fallback: render with system fonts if anything above throws.
        setInitialRoute("AppDrawer");
        await SplashScreen.hideAsync().catch(() => {});
      }
    };

    init();
  }, [fontsLoaded, error]);

  // TextComponent has system-font fallbacks, so the app is safe to render even when
  // fontsLoaded=false (e.g. after a font-load error). Only block on initialRoute so
  // NavigationContainer never mounts before the initial route is determined.
  if (initialRoute === null) return null;

  return (
    <MenuProvider>
      <Provider store={store}>
        <ToastProvider>
          <CartProvider>
            <AppInner
              initialRoute={initialRoute}
              navigationRef={navigationRef}
            />
          </CartProvider>
        </ToastProvider>
      </Provider>
    </MenuProvider>
  );
}
