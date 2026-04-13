/**
 * CompletionReturnTransient — Week 3 Moment 32 completion return screen.
 * REDESIGNED: Premium Light Theme with Glowing Lotus.
 *
 * Fades in over the beige background. Gold checkmark SVG stroke-draw (800ms).
 * Variant-specific Mitra message in Cormorant/Serif dark brown.
 * "How did that feel?" input (120 char cap).
 * Large glowing lotus at bottom center.
 * manual redirection only (Return to Dashboard / Repeat).
 */

import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import MantraLotus3d from "../../assets/mantra-lotus-3d.svg";
import { executeAction } from "../engine/actionExecutor";
import { mitraTrackEvent } from "../engine/mitraApi";
import { useScreenStore } from "../engine/useScreenBridge";
import { Fonts } from "../theme/fonts";

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
  const { screenData, loadScreen, goBack, currentScreen, updateBackground, updateHeaderHidden } = useScreenStore();

  const resolvedVariant: "mantra" | "sankalp" | "practice" =
    (block.variant as any) ||
    (screenData[block.variant_key || "runner_variant"] as any) ||
    (screenData.runner_variant as any) ||
    "practice";

  const message =
    VARIANT_MESSAGES[resolvedVariant] || VARIANT_MESSAGES.practice;

  const [inputText, setInputText] = useState("");

  const contentFade = useRef(new Animated.Value(0)).current;
  const checkProgress = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const unmountedRef = useRef(false);

  const setScreenValue = (key: string, value: any) => {
    const { screenActions } = require("../store/screenSlice");
    const { store } = require("../store");
    store.dispatch(screenActions.setScreenValue({ key, value }));
  };

  const clearRunnerState = () => {
    setScreenValue("runner_active_item", null);
    setScreenValue("runner_source", null);
    setScreenValue("runner_start_time", null);
    setScreenValue("runner_variant", null);
  };

  useEffect(() => {
    // Apply global background from header to footer via bridge
    updateBackground(require("../../assets/beige_bg.png"));
    updateHeaderHidden(false);

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

    // Sequence: content fade -> check draw -> message fade
    Animated.timing(contentFade, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    
    Animated.timing(checkProgress, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start(() => {
      Animated.timing(messageOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    });

    return () => {
      unmountedRef.current = true;
      clearRunnerState();
    };
  }, []);

  const handleReturnHome = (manual: boolean) => {
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
    handleReturnHome(true);
  };

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
      <Animated.View style={[styles.content, { opacity: contentFade }]}>
        <View style={styles.checkWrap}>
          <Svg width={48} height={48} viewBox="0 0 48 48">
            <AnimatedPath
              d="M10 24 L20 34 L38 14"
              fill="none"
              stroke="#A68246"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${checkPathLength}`}
              strokeDashoffset={checkDashOffset as any}
            />
          </Svg>
        </View>

        <Animated.View
          style={{ opacity: messageOpacity, width: "100%", alignItems: "center" }}
        >
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>{message}</Text>
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="How did that feel?"
              placeholderTextColor="#A6824699"
              value={inputText}
              onChangeText={(t) => setInputText(t.slice(0, 120))}
              onSubmitEditing={handleSubmitInput}
              maxLength={120}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={styles.micBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Text style={styles.micIcon}>🎙</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>

      <View style={styles.bottomSection}>
        <View style={styles.lotusWrap}>
          <MantraLotus3d width={180} height={140} opacity={0.65} />
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.primaryCta}
            onPress={() => handleReturnHome(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryCtaText}>Return to Mitra Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryCta}
            onPress={handleRepeat}
            activeOpacity={0.6}
          >
            <Text style={styles.secondaryCtaText}>Repeat</Text>
          </TouchableOpacity>
        </View>
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
    paddingTop: 100,
    paddingBottom: 48,
    paddingHorizontal: 32,
  },
  content: {
    alignItems: "center",
    width: "100%",
  },
  checkWrap: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 48,
  },
  messageCard: {
    borderLeftWidth: 2,
    borderLeftColor: "#DAC28E",
    paddingLeft: 20,
    paddingVertical: 4,
    marginBottom: 40,
    width: '100%',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 26,
    lineHeight: 38,
    color: "#5C3A12",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "#DAC28E66",
    borderBottomWidth: 1,
    paddingVertical: 12,
    width: "100%",
  },
  input: {
    flex: 1,
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "#5C3A12",
    paddingVertical: 4,
  },
  micBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  micIcon: {
    fontSize: 20,
    color: "#5C3A12",
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
  },
  lotusWrap: {
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  primaryCta: {
    backgroundColor: "#F2E8CF",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 32,
    width: "100%",
    maxWidth: 280,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DAC28E",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryCtaText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    color: "#5C3A12",
    letterSpacing: 0.2,
  },
  secondaryCta: {
    paddingVertical: 10,
  },
  secondaryCtaText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: "#8C6A3D",
    letterSpacing: 0.5,
  },
});

export default CompletionReturnTransient;
