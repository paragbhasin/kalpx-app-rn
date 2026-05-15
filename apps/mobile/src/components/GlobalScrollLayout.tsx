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

  // Drill through all nested navigators (Drawer → BottomTab → HomeStack …) to
  // find the innermost stack and its currently focused leaf screen.
  // Fixed-depth selectors broke because the app has 3+ navigator levels:
  // reading index at the wrong level gave tab-selection (0/1/2) not stack depth.
  const { canGoBackInStack, isOnDynamicEngine } = useNavigationState((state) => {
    if (!state) return { canGoBackInStack: false, isOnDynamicEngine: false };
    let s: any = state;
    while (s?.routes?.length) {
      const idx: number = s.index ?? 0;
      const focused = s.routes[idx];
      if (!focused?.state?.routes?.length) {
        // Leaf screen — s is the navigator that directly contains it.
        // canGoBackInStack: only meaningful when s is a stack (not a tab or drawer).
        return {
          canGoBackInStack: s.type === "stack" && idx > 0,
          isOnDynamicEngine: focused?.name === "DynamicEngine",
        };
      }
      s = focused.state;
    }
    return { canGoBackInStack: false, isOnDynamicEngine: false };
  });

  // Engine owner: show when depth > 0 beyond the root engine screen.
  // Also show when engine history is fully exhausted but DynamicEngine is still
  // on the RN stack (e.g. room session launched from BrowseRooms) so the user
  // can pop back to the launching direct-route screen instead of getting stuck.
  // Direct-route owner: show whenever the stack has depth (index > 0).
  const showBackButton = isOnDynamicEngine
    ? (!currentScreen?.overlay && history.length > 0 && !isRootScreen) ||
      (history.length === 0 && canGoBackInStack)
    : canGoBackInStack;

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

    // Direct-route owner: engine history is irrelevant — pop the RN stack.
    if (!isOnDynamicEngine) {
      if (navigationRef.isReady() && navigationRef.canGoBack()) {
        navigationRef.goBack();
      }
      return;
    }

    // Engine owner: support flows jump straight to dashboard rather than
    // stepping through many intermediate history entries one-by-one.
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

    // Engine history exhausted but DynamicEngine still on RN stack — pop back
    // to the direct-route screen that launched this engine session (e.g. BrowseRooms).
    if (navigationRef.isReady() && navigationRef.canGoBack()) {
      navigationRef.goBack();
      return;
    }

    loadScreen({ container_id: "portal", state_id: "portal" });
  }, [isOnDynamicEngine, isInSupportFlow, history.length, goBack, loadScreen]);

  // Android hardware back — delegate to the same handleBack logic so
  // hardware back honors support-flow jumps, debounce, and root guards.
  // Returning true tells RN we handled the event (prevents default nav pop).
  // INV-9: system back must behave identically to header back.
  React.useEffect(() => {
    if (Platform.OS !== "android") return;
    const onBackPress = () => {
      if (!showBackButton) return false;
      handleBack();
      return true;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => sub.remove();
  }, [handleBack, showBackButton]);

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
