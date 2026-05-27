import { Ionicons } from "@expo/vector-icons";
import { useNavigationState } from "@react-navigation/native";
import React from "react";
import {
  Animated,
  BackHandler,
  ImageBackground,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useScrollContext } from "../context/ScrollContext";
import { useScreenStore } from "../engine/useScreenBridge";
import { isMitraRouteName } from "../Shared/Routes/mitraRouteNames";
import { navigationRef } from "../Shared/Routes/NavigationService";

import { store } from "../store";
import Header from "./Header";

// Total header height including status bar safe area on Android
const HEADER_HEIGHT =
  Platform.OS === "android" ? 10 + (StatusBar.currentHeight || 0) : 45;
const DEFAULT_SURFACE = "#FAF7F2";

const GlobalScrollLayout = ({ children }: { children: React.ReactNode }) => {
  const { headerY, toggleVisibility } = useScrollContext();
  const currentBackground = useScreenStore((state) => state.currentBackground);
  const isHeaderHidden = useScreenStore((state) => state.isHeaderHidden);

  // Back button logic — lives here so it rides the headerY animation for free
  const {
    history,
    currentScreen,
    currentContainerId,
    currentStateId,
    screenData,
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
  const { canGoBackInStack, isOnDynamicEngine, leafRouteName } =
    useNavigationState((state) => {
      if (!state)
        return {
          canGoBackInStack: false,
          isOnDynamicEngine: false,
          leafRouteName: null as string | null,
        };
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
            leafRouteName: (focused?.name ?? null) as string | null,
          };
        }
        s = focused.state;
      }
      return {
        canGoBackInStack: false,
        isOnDynamicEngine: false,
        leafRouteName: null as string | null,
      };
    });

  // Routes that are stable home bases — back button never shows even if the RN
  // stack has depth (e.g. navigate("Home") pushes a new entry on an existing stack).
  const DIRECT_ROOT_ROUTES = new Set([
    "Home",
    "Classes",
    "ClassesScreen",
    "SocialExplore",
    "CommunityLanding",
  ]);

  // Engine owner: show when depth > 0 beyond the root engine screen.
  // Also show when engine history is fully exhausted but DynamicEngine is still
  // on the RN stack (e.g. room session launched from BrowseRooms) so the user
  // can pop back to the launching direct-route screen instead of getting stuck.
  // Direct-route owner: show whenever the stack has depth (index > 0), unless the
  // current route is a designated root (Four Door Home, etc.).
  //
  // canGoBackInStack alone: runner/overlay screens launched from direct-route
  // screens (InnerPath, RhythmHome) carry overlay:true in their schema (designed
  // for companion_dashboard use), which suppresses both engine-history conditions.
  // Whenever a direct-route screen is below DynamicEngine in the RN stack
  // (canGoBackInStack=true), always show back — the overlay flag is irrelevant
  // in this context because the user entered via a stable direct route.
  const showBackButton = isOnDynamicEngine
    ? canGoBackInStack ||
      (!currentScreen?.overlay && history.length > 0 && !isRootScreen)
    : canGoBackInStack && !DIRECT_ROOT_ROUTES.has(leafRouteName ?? "");

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

    // Room sessions are entered from direct-route screens (BrowseRooms, TellMitra, etc.).
    // Pop the RN stack to return to the launching surface — matches room_exit behavior.
    if (currentContainerId === "room" && canGoBackInStack) {
      navigationRef.goBack();
      return;
    }

    // Onboarding surfaces can be launched from direct-route screens
    // (Four Door Home, Rhythm setup, Inner Path). In that case, the RN stack
    // owns the origin, so pop back to the actual launching screen instead of
    // stepping through stale engine history.
    if (currentContainerId === "welcome_onboarding" && canGoBackInStack) {
      navigationRef.goBack();
      return;
    }

    const isRhythmSurface =
      screenData?.runner_source === "rhythm_daily" ||
      screenData?.practice_launch_surface === "rhythm";
    const hasActiveInnerPath =
      (store.getState() as any)?.door?.homeData?.inner_path_summary
        ?.has_active_path === true;

    if (
      isRhythmSurface &&
      !hasActiveInnerPath &&
      (currentContainerId === "cycle_transitions" ||
        currentContainerId === "practice_runner")
    ) {
      (navigationRef as any).navigate("Home");
      return;
    }

    // Runner launched from a direct-route screen (InnerPath, RhythmHome).
    // Engine history may have stale entries from prior sessions — pop the RN stack
    // directly so one back press returns to the launching screen, not into old history.
    if (
      (currentContainerId === "cycle_transitions" ||
        currentContainerId === "practice_runner") &&
      canGoBackInStack
    ) {
      navigationRef.goBack();
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

    // Last resort: return to Four Door Home — the product root for logged-in users.
    (navigationRef as any).navigate("Home");
  }, [
    isOnDynamicEngine,
    isInSupportFlow,
    currentContainerId,
    screenData?.runner_source,
    screenData?.practice_launch_surface,
    canGoBackInStack,
    history.length,
    goBack,
    loadScreen,
  ]);

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
  const shouldUseDefaultSurface =
    !hasBg && isMitraRouteName(leafRouteName ?? "");
  const backArrowColor = hasBg ? "#a36e2e" : "#432104";
  const isColorBackground = typeof currentBackground === "string";

  return (
    <View
      style={[
        styles.container,
        shouldUseDefaultSurface && styles.defaultSurface,
      ]}
    >
      {currentBackground &&
        (isColorBackground ? (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: currentBackground },
            ]}
          />
        ) : (
          <ImageBackground
            source={currentBackground}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ))}
      {!isHeaderHidden && (
        <Animated.View
          style={[
            styles.headerContainer,
            { transform: [{ translateY: headerY }] },
            !hasBg &&
              (shouldUseDefaultSurface
                ? styles.defaultSurface
                : styles.headerSolid),
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
                <Ionicons
                  name="chevron-back"
                  size={24}
                  color={backArrowColor}
                />
              </TouchableOpacity>
            ) : null}
            <View style={styles.headerFlex}>
              <Header
                isTransparent={hasBg}
                backgroundColor={
                  shouldUseDefaultSurface ? DEFAULT_SURFACE : undefined
                }
              />
            </View>
          </View>
        </Animated.View>
      )}
      <View
        style={[
          styles.content,
          shouldUseDefaultSurface && styles.defaultSurface,
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
  // Match KalpX logo header background so the back arrow blends in
  headerSolid: {
    backgroundColor: "#F7F0DD",
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
  defaultSurface: {
    backgroundColor: DEFAULT_SURFACE,
  },
});

export default GlobalScrollLayout;
