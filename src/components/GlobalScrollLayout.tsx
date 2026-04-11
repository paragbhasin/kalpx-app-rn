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
  View,
} from "react-native";
import { useScrollContext } from "../context/ScrollContext";
import { useScreenStore } from "../engine/useScreenBridge";
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
  const SUPPORT_FLOW_CONTAINERS = new Set(['awareness_trigger']);
  const SUPPORT_FLOW_STATE_IDS = new Set([
    'free_mantra_chanting',
    'post_trigger_mantra',
    'trigger_practice_runner',
    'trigger_advice_reveal',
    'trigger_awareness',
    'checkin_breath_reset',
    'checkin_support_mantra',
  ]);
  const isInSupportFlow =
    SUPPORT_FLOW_CONTAINERS.has(currentContainerId || '') ||
    (currentContainerId === 'practice_runner' &&
      SUPPORT_FLOW_STATE_IDS.has(currentStateId || ''));

  const isRootScreen =
    currentContainerId === "companion_dashboard" ||
    currentContainerId === "continue_journey" ||
    currentScreen?.state_id === "discipline_select";

  const showBackButton =
    !currentScreen?.overlay && history.length > 0 && !isRootScreen;

  // Reset header visibility when back button is not present (mostly root screens)
  React.useEffect(() => {
    if (!showBackButton) {
      toggleVisibility(true);
    }
  }, [showBackButton, toggleVisibility]);

  // Prevent rapid double-taps from popping the history stack twice.
  const isNavigatingBack = React.useRef(false);

  const handleBack = React.useCallback(() => {
    if (isNavigatingBack.current) return;
    isNavigatingBack.current = true;
    setTimeout(() => { isNavigatingBack.current = false; }, 500);

    // Support flows (I Feel Triggered / Quick Check-In) accumulate many
    // intermediate history entries. Jump straight to dashboard instead of
    // stepping through each flow screen one-by-one.
    if (isInSupportFlow) {
      loadScreen({ container_id: 'companion_dashboard', state_id: 'day_active' });
      return;
    }

    if (history.length > 0) {
      goBack();
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

  // For screens without a background image, always show solid white header
  // For screens with a background, use scroll-driven glass overlay
  const hasBg = !!currentBackground;
  const backArrowColor = hasBg ? "#432104" : "#432104";

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
            // Solid white on plain screens (no background image)
            !hasBg && styles.headerSolid,
          ]}
        >
          {/* Scroll-driven glass overlay — only visible when user has scrolled */}
          {hasBg && (
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                styles.headerGlassOverlay,
                { opacity: headerBgOpacity },
              ]}
              pointerEvents="none"
            />
          )}

          {/* Back button + Header in one row. */}
          <View style={styles.headerRow}>
            {showBackButton ? (
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-back" size={20} color={backArrowColor} />
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
  // Glassmorphic overlay — rendered on top of content, driven by scroll opacity
  headerGlassOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.15)",
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
