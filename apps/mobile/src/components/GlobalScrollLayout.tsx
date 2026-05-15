import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Animated,
  BackHandler,
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { useNavigationState } from "@react-navigation/native";
import { useScrollContext } from "../context/ScrollContext";
import { useScreenStore } from "../engine/useScreenBridge";
import { navigationRef } from "../Shared/Routes/NavigationService";
import Header from "./Header";

// Total header height including status bar safe area on Android
const HEADER_HEIGHT =
  Platform.OS === "android" ? 45 + (StatusBar.currentHeight || 0) : 45;

const GlobalScrollLayout = ({ children }: { children: React.ReactNode }) => {
  const { headerY, headerBgOpacity, toggleVisibility } = useScrollContext();
  const currentBackground = useScreenStore((state) => state.currentBackground);
  const isHeaderHidden = useScreenStore((state) => state.isHeaderHidden);

  // Back button logic — lives here so it rides the headerY animation for free
  const {
    history,
    currentScreen,
    currentContainerId,
    currentStateId,
    goBack,
    loadScreen,
  } = useScreenStore();

  // ── Support-flow back navigation ─────────────────────────────────────────
  // The "I Feel Triggered" and "Quick Check-In" flows push many intermediate
  // steps to the Redux history. Pressing back one-by-one would land on random
  // flow screens. Instead, detect we're in a support flow and jump directly
  // to the Companion Dashboard.
  const SUPPORT_FLOW_CONTAINERS = new Set(["awareness_trigger"]);
  const SUPPORT_FLOW_STATE_IDS = new Set([
    "free_mantra_chanting",
    "post_trigger_mantra",
    "trigger_practice_runner",
    "trigger_advice_reveal",
    "trigger_awareness",
    "checkin_breath_reset",
    "checkin_support_mantra",
  ]);
  const isInSupportFlow =
    SUPPORT_FLOW_CONTAINERS.has(currentContainerId || "") ||
    (currentContainerId === "practice_runner" &&
      SUPPORT_FLOW_STATE_IDS.has(currentStateId || ""));

  const isRootScreen =
    currentContainerId === "companion_dashboard" ||
    currentContainerId === "continue_journey" ||
    currentScreen?.state_id === "discipline_select" ||
    (currentContainerId === "welcome_onboarding" &&
      (currentStateId === "turn_1" || currentStateId === "turn_2"));

  // Detect if a direct-route navigation stack can go back (tab → focused stack index > 0)
  const canGoBackInStack = useNavigationState((state) => {
    if (!state) return false;
    const focusedRoute = state.routes?.[state.index ?? 0];
    const nestedState = focusedRoute?.state;
    return (nestedState?.index ?? 0) > 0;
  });

  const showBackButton =
    (!currentScreen?.overlay && history.length > 0 && !isRootScreen) ||
    canGoBackInStack;

  // Reset header visibility when back button is not present (mostly root screens)
  React.useEffect(() => {
    if (!showBackButton) {
      toggleVisibility(true);
    }
  }, [
    showBackButton,
    toggleVisibility,
    currentContainerId,
    currentStateId,
    currentScreen?.state_id,
  ]);

  // Prevent rapid double-taps from popping the history stack twice.
  const isNavigatingBack = React.useRef(false);

  const handleBack = React.useCallback(() => {
    if (isNavigatingBack.current) return;
    isNavigatingBack.current = true;
    setTimeout(() => {
      isNavigatingBack.current = false;
    }, 500);

    // If the focused route is a direct-route screen (not DynamicEngine), the
    // engine history is from a prior session and irrelevant — use RN stack back.
    const currentRoute = navigationRef.isReady()
      ? navigationRef.getCurrentRoute()?.name
      : null;
    if (currentRoute && currentRoute !== "DynamicEngine" && navigationRef.canGoBack()) {
      navigationRef.goBack();
      return;
    }

    // Engine-rendered screen: support flows jump straight to dashboard.
    if (isInSupportFlow) {
      loadScreen({
        container_id: "companion_dashboard",
        state_id: "day_active",
      });
      return;
    }

    if (history.length > 0) {
      goBack();
      return;
    }

    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
      return;
    }

    loadScreen({ container_id: "portal", state_id: "portal" });
  }, [isInSupportFlow, history.length, goBack, loadScreen]);

  // Android hardware back — delegate to the same handleBack logic so
  // hardware back honors support-flow jumps, debounce, and root guards.
  // Returning true tells RN we handled the event (prevents default nav pop).
  // INV-9: system back must behave identically to header back.
  React.useEffect(() => {
    if (Platform.OS !== "android") return;
    const onBackPress = () => {
      if (isRootScreen) return false;
      handleBack();
      return true;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [handleBack, isRootScreen]);

  // Background-driven Mitra screens should not get any forced header fill.
  const hasBg = !!currentBackground;
  const backArrowColor = hasBg ? "#C99317" : "#432104";

  return (
    <View style={styles.container}>
      {currentBackground && (
        <ImageBackground
          source={currentBackground}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      )}
      {!isHeaderHidden && (
        <Animated.View
          style={[
            styles.headerContainer,
            { transform: [{ translateY: headerY }] },
            !hasBg && styles.headerSolid,
          ]}
        >
          {/* Back button + Header in one row. */}
          <View style={styles.headerRow}>
            {showBackButton ? (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-back" size={24} color={backArrowColor} />
              </TouchableOpacity>
            ) : null}
            <View style={styles.headerFlex}>
              <Header isTransparent={hasBg} />
            </View>
          </View>
        </Animated.View>
      )}
      <View
        style={[
          styles.content,
          !isHeaderHidden && { paddingTop: HEADER_HEIGHT },
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: HEADER_HEIGHT,
    justifyContent: "center",
  },
  // Solid white — used when no background image is present
  headerSolid: {
    backgroundColor: "#FFF",
  },
  // Back arrow + Header logo/dropdown in a single row
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    marginLeft: 8,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  // Header component expands to fill remaining space
  headerFlex: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default GlobalScrollLayout;
