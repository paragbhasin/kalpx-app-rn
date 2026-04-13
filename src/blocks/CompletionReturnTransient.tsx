/**
 * CompletionReturnTransient — Week 3 Moment 32 completion return overlay.
 *
 * Web parity: src/containers/PracticeRunnerContainer.vue completion variants
 * (mantra_complete / sankalp_confirm / practice_complete). Spec:
 * transient_completion_return.md.
 *
 * Fades in over the dim runner background. Gold checkmark SVG stroke-draw
 * (800ms ease-out). Variant-specific Mitra message in Cormorant. Optional
 * "How did that feel?" input (120 char cap, mic button). Two CTAs: gold pill
 * "Return to Mitra Home" + text link "Repeat". 10s idle auto-return timer
 * that pauses if the user begins typing.
 *
 * On unmount (the very last step before nav home), clears the runner-local
 * flow fields: runner_active_item, runner_source, runner_start_time,
 * runner_variant (REG-003 cross-flow state leak guard).
 *
 * Tone constraint: ONLY the 3 specified messages. No exclamations, no "Great
 * job!", no streaks, no confetti.
 */

import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { executeAction } from "../engine/actionExecutor";
import { mitraTrackEvent } from "../engine/mitraApi";
import { useScreenStore } from "../engine/useScreenBridge";
import { Fonts } from "../theme/fonts";

const AUTO_RETURN_MS = 10_000;

const VARIANT_MESSAGES: Record<string, string> = {
  mantra: "108 in. Kept.",
  sankalp: "Held. Carry it into the day.",
  practice: "Done. Notice what stayed.",
};

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface CompletionReturnTransientProps {
  block: {
    variant?: "mantra" | "sankalp" | "practice";
    variant_key?: string;
  };
}

const CompletionReturnTransient: React.FC<CompletionReturnTransientProps> = ({
  block,
}) => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();

  const resolvedVariant: "mantra" | "sankalp" | "practice" =
    (block.variant as any) ||
    (screenData[block.variant_key || "runner_variant"] as any) ||
    (screenData.runner_variant as any) ||
    "practice";

  const message =
    VARIANT_MESSAGES[resolvedVariant] || VARIANT_MESSAGES.practice;

  const [inputText, setInputText] = useState("");
  const [autoReturnPaused, setAutoReturnPaused] = useState(false);

  const bgFade = useRef(new Animated.Value(0)).current;
  const checkProgress = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const autoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unmountedRef = useRef(false);

  const setScreenValue = (key: string, value: any) => {
    const { screenActions } = require("../store/screenSlice");
    const { store } = require("../store");
    store.dispatch(screenActions.setScreenValue({ key, value }));
  };

  const clearRunnerState = () => {
    // REG-003: flow-local cleanup on every exit path
    setScreenValue("runner_active_item", null);
    setScreenValue("runner_source", null);
    setScreenValue("runner_start_time", null);
    setScreenValue("runner_variant", null);
  };

  // Fire completion_return_shown telemetry (spec §13)
  useEffect(() => {
    mitraTrackEvent("completion_return_shown", {
      meta: {
        item_type: resolvedVariant,
        item_id: screenData.runner_active_item?.item_id,
        source: screenData.runner_source,
      },
    }).catch(() => {});

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }

    // Sequence: background fade 500ms -> check draw 800ms -> message fade 600ms
    Animated.timing(bgFade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    Animated.timing(checkProgress, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start(() => {
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      unmountedRef.current = true;
      if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
      clearRunnerState();
    };
  }, []);

  // Auto-return timer
  // useEffect(() => {
  //   if (autoReturnPaused) {
  //     if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
  //     return;
  //   }
  //   autoTimerRef.current = setTimeout(() => {
  //     if (unmountedRef.current) return;
  //     mitraTrackEvent('completion_return_auto_returned', {
  //       meta: { item_type: resolvedVariant },
  //     }).catch(() => {});
  //     handleReturnHome(false);
  //   }, AUTO_RETURN_MS);
  //   return () => {
  //     if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
  //   };
  // }, [autoReturnPaused]);

  const handleReturnHome = (manual: boolean) => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    if (manual) {
      mitraTrackEvent("completion_return_manually_returned", {
        meta: { item_type: resolvedVariant },
      }).catch(() => {});
    }
    const action = {
      type: "navigate",
      target: { container_id: "companion_dashboard", state_id: "day_active" },
    };
    executeAction(
      { ...action, currentScreen },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) => setScreenValue(key, value),
        screenState: { ...screenData },
      },
    ).catch(() => {});
  };

  const handleRepeat = () => {
    if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
    mitraTrackEvent("completion_return_repeated", {
      meta: {
        item_type: resolvedVariant,
        item_id: screenData.runner_active_item?.item_id,
      },
    }).catch(() => {});
    executeAction({ type: "repeat_runner", currentScreen } as any, {
      loadScreen,
      goBack,
      setScreenValue: (value: any, key: string) => setScreenValue(key, value),
      screenState: { ...screenData },
    }).catch(() => {});
  };

  const handleSubmitInput = () => {
    if (!inputText.trim()) return;
    mitraTrackEvent("post_completion_reflection", {
      meta: {
        item_type: resolvedVariant,
        item_id: screenData.runner_active_item?.item_id,
        text: inputText.trim().slice(0, 120),
      },
    }).catch(() => {});
    setTimeout(() => handleReturnHome(true), 1500);
  };

  // Check SVG path — simple elegant check
  const checkPathLength = 48;
  const checkDashOffset = checkProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [checkPathLength, 0],
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.overlay}
    >
      <Animated.View style={[styles.bg, { opacity: bgFade }]} />

      <View style={styles.content}>
        <View style={styles.checkWrap}>
          <Svg width={48} height={48} viewBox="0 0 48 48">
            <AnimatedPath
              d="M10 24 L20 34 L38 14"
              fill="none"
              stroke="#eddeb4"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${checkPathLength}`}
              strokeDashoffset={checkDashOffset as any}
            />
          </Svg>
        </View>

        <Animated.View style={{ opacity: messageOpacity, width: "100%" }}>
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>{message}</Text>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="How did that feel?"
              placeholderTextColor="#8c7b5c"
              value={inputText}
              onChangeText={(t) => {
                setInputText(t.slice(0, 120));
                if (!autoReturnPaused) setAutoReturnPaused(true);
              }}
              onSubmitEditing={handleSubmitInput}
              maxLength={120}
              returnKeyType="send"
              accessibilityLabel="Post-completion reflection input"
            />
            <TouchableOpacity
              style={styles.micBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityRole="button"
              accessibilityLabel="Voice note"
              onPress={() => setAutoReturnPaused(true)}
            >
              <Text style={styles.micIcon}>🎙</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryCta}
          onPress={() => handleReturnHome(true)}
          accessibilityRole="button"
          accessibilityLabel="Return to Mitra Home"
        >
          <Text style={styles.primaryCtaText}>Return to Mitra Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryCta}
          onPress={handleRepeat}
          hitSlop={{ top: 10, bottom: 10, left: 32, right: 32 }}
          accessibilityRole="button"
          accessibilityLabel="Repeat practice"
        >
          <Text style={styles.secondaryCtaText}>Repeat</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 72,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1a1a1a",
  },
  content: {
    alignItems: "center",
    width: "100%",
    marginTop: 24,
  },
  checkWrap: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },
  messageCard: {
    borderLeftWidth: 3,
    borderLeftColor: "#eddeb4",
    paddingLeft: 16,
    paddingVertical: 12,
    marginBottom: 32,
  },
  messageText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 22,
    lineHeight: 32,
    color: "#f1e7cf",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "rgba(237,222,180,0.2)",
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#eddeb4",
    paddingVertical: 4,
  },
  micBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  micIcon: {
    fontSize: 18,
    color: "#eddeb4",
  },
  footer: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },
  primaryCta: {
    backgroundColor: "#eddeb4",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 999,
    minWidth: 260,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryCtaText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: "#1a1a1a",
    letterSpacing: 0.3,
  },
  secondaryCta: {
    paddingVertical: 10,
  },
  secondaryCtaText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#bfa58a",
    letterSpacing: 0.4,
  },
});

export default CompletionReturnTransient;
