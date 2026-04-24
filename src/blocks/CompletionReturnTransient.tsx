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
import React, { useEffect, useRef } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import MantraLotus3d from "../../assets/mantra-lotus-3d.svg";
import { VoiceTextInput } from "../components/VoiceTextInput";
import { executeAction } from "../engine/actionExecutor";
import { mitraTrackEvent } from "../engine/mitraApi";
import { useScreenStore } from "../engine/useScreenBridge";
import { readMomentSlot, useContentSlots } from "../hooks/useContentSlots";
import { Fonts } from "../theme/fonts";

// Phase E — variant-specific completion messages now served from the
// M_completion_return registry pack, keyed on
// stage_signals.runner_variant (mantra / sankalp / practice). The
// 3-way TSX dict is removed; fully registry-driven.

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
  const {
    screenData,
    loadScreen,
    goBack,
    currentScreen,
    updateBackground,
    updateHeaderHidden,
  } = useScreenStore();
  const ss = screenData as Record<string, any>;

  const resolvedVariant: "mantra" | "sankalp" | "practice" =
    (block.variant as any) ||
    (screenData[block.variant_key || "runner_variant"] as any) ||
    (screenData.runner_variant as any) ||
    "practice";

  useContentSlots({
    momentId: "M_completion_return",
    screenDataKey: "completion_return",
    buildCtx: (s) => ({
      path: s.journey_path === "growth" ? "growth" : "support",
      guidance_mode: s.guidance_mode || "hybrid",
      locale: s.locale || "en",
      user_attention_state: "winding_down",
      emotional_weight: "light",
      cycle_day: Number(s.day_number) || 0,
      entered_via: `${resolvedVariant}_complete`,
      // Pass runner_variant AND runner_source through stage_signals so the
      // registry can pick between the keyed runner-variant variants (core
      // flow) and the higher-specificity source-aware variants (support
      // rooms — "Back to your seat" + return_to_source action).
      stage_signals: {
        runner_variant: resolvedVariant,
        runner_source: s.runner_source || "",
      },
      today_layer: {},
      life_layer: {
        cycle_id: s.journey_id || s.cycle_id || "",
        life_kosha: s.life_kosha || s.scan_focus || "",
        scan_focus: s.scan_focus || "",
      },
    }),
  });
  const slot = (name: string) => readMomentSlot(ss, "completion_return", name);

  // Message comes from the registry's runner_variant-keyed slot.
  const message = slot("message");
  // Track 1 — optional wisdom anchor line (third beat). Authored in the
  // M_completion_return ContentPack on source-aware variants. Empty when
  // the resolved variant doesn't include it; in that case the third beat
  // is not rendered and the completion shows the existing 2-beat shape.
  const wisdomAnchorLine = slot("wisdom_anchor_line");
  const wisdomAnchorPrincipleId = slot("wisdom_anchor_principle_id");

  const contentFade = useRef(new Animated.Value(0)).current;
  const checkProgress = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;

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
      clearRunnerState();
    };
  }, []);

  const handleReturnHome = (manual: boolean) => {
    if (manual) {
      mitraTrackEvent("completion_return_manually_returned", {
        meta: { item_type: resolvedVariant, source: screenData.runner_source },
      }).catch(() => {});
    }
    // v3 Flow Contract §A.8: support runner completion returns to source room.
    // Backend MAY seed `return_action: "return_to_source"` explicitly; if not,
    // and runner_source is a known support source, we default to return_to_source
    // so completion consistently loops back to grief/loneliness/joy/growth rooms.
    // Core / additional / trigger sources fall through to dashboard (§A.9, §A.10).
    const returnAction = slot("return_action");
    const SUPPORT_SOURCES = new Set([
      "support_grief",
      "support_loneliness",
      "support_joy",
      "support_growth",
      // Canonical v3.1 rooms — BE stamps `runner_source: "support_room"` on
      // every runner whose pill was dispatched from a canonical Room (A0
      // finding 2026-04-20). Without this, completion falls through to
      // dashboard instead of looping back into the room.
      "support_room",
    ]);
    const isSupportSource = SUPPORT_SOURCES.has(
      String(screenData.runner_source || ""),
    );
    const resolvedReturnAction =
      returnAction || (isSupportSource ? "return_to_source" : null);
    const action = resolvedReturnAction
      ? { type: resolvedReturnAction }
      : {
          type: "navigate",
          target: {
            container_id: "companion_dashboard",
            state_id: "day_active",
          },
        };
    executeAction({ ...action, currentScreen } as any, {
      loadScreen,
      goBack,
      setScreenValue: (value: any, key: string) => setScreenValue(key, value),
      screenState: { ...screenData },
    }).catch(() => {});
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

  const handleSubmitReflection = (
    reflectionText: string,
    responseType: "text" | "voice",
  ) => {
    if (!reflectionText.trim()) return;
    mitraTrackEvent("post_completion_reflection", {
      meta: {
        item_type: resolvedVariant,
        item_id: screenData.runner_active_item?.item_id,
        text: reflectionText.trim().slice(0, 120),
        response_type: responseType,
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
          style={{
            opacity: messageOpacity,
            width: "100%",
            alignItems: "center",
          }}
        >
          <View style={styles.messageCard}>
            <Text style={styles.messageText} testID="completion_message">
              {message}
            </Text>
          </View>

          {/* Track 1 — wisdom anchor (third beat). Renders only when the
              resolved ContentPack variant authored a wisdom_anchor_line.
              "Read more →" surfaces existing WhyThisSheet L2 seeded with
              the backing principle_id when present. */}
          {!!wisdomAnchorLine && (
            <View style={styles.wisdomAnchorCard}>
              {/* <View style={styles.wisdomDivider} /> */}
              <Text
                style={styles.wisdomAnchorText}
                testID="completion_wisdom_anchor_line"
              >
                {wisdomAnchorLine}
              </Text>
              {!!wisdomAnchorPrincipleId && (
                <TouchableOpacity
                  style={styles.readMoreBtn}
                  activeOpacity={0.7}
                  testID="completion_read_more"
                  onPress={() => {
                    const { screenActions } = require("../store/screenSlice");
                    const { store } = require("../store");
                    // Seed principle id + open WhyThisSheet L2
                    store.dispatch(
                      screenActions.setScreenValue({
                        key: "why_this_principle_id",
                        value: wisdomAnchorPrincipleId,
                      }),
                    );
                    executeAction(
                      {
                        type: "open_why_this_l2",
                        payload: { principle_id: wisdomAnchorPrincipleId },
                      } as any,
                      {
                        loadScreen,
                        goBack,
                        setScreenValue: (value: any, key: string) =>
                          setScreenValue(key, value),
                        screenState: { ...screenData },
                      },
                    ).catch(() => {});
                  }}
                >
                  <Text style={styles.readMoreText}>
                    {slot("read_more_label")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View
            style={styles.voiceInputWrap}
            testID="completion_reflection_placeholder"
          >
            {/* MDR-S1-12 — sovereignty-strict. Placeholder reads from slot
                 only; dead English fallback dropped. Empty slot → blank
                 placeholder (acceptable — input remains functional; missing
                 content visible in QA + telemetry). */}
            <VoiceTextInput
              placeholder={slot("reflection_prompt")}
              onSend={(text, type) => handleSubmitReflection(text, type)}
            />
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
            <Text style={styles.primaryCtaText}>{slot("return_home_cta")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryCta}
            onPress={handleRepeat}
            activeOpacity={0.6}
          >
            <Text style={styles.secondaryCtaText}>{slot("repeat_cta")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    // flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    // paddingTop: 80,
    // paddingBottom: 48,
    paddingHorizontal: 20,
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
    width: "100%",
    alignSelf: "flex-start",
  },
  messageText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 26,
    lineHeight: 38,
    color: "#5C3A12",
  },
  voiceInputWrap: {
    width: "100%",
    // marginBottom: 8,
    // paddingHorizontal: -100,
  },
  // Track 1 — third-beat wisdom anchor block (below message, above input).
  wisdomAnchorCard: {
    width: "100%",
    marginBottom: 20,
    paddingLeft: 20,
    alignItems: "flex-start",
  },
  wisdomDivider: {
    width: 40,
    height: 1,
    backgroundColor: "#DAC28E",
    marginBottom: 12,
  },
  wisdomAnchorText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    lineHeight: 24,
    color: "#5C3A12",
    fontStyle: "italic",
    marginBottom: 8,
  },
  readMoreBtn: {
    paddingVertical: 4,
  },
  readMoreText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#946A47",
    letterSpacing: 0.3,
  },
  bottomSection: {
    width: "100%",
    alignItems: "center",
  },
  lotusWrap: {
    // marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
  },
  footer: {
    width: "100%",
    alignItems: "center",
    // gap: 16,
  },
  primaryCta: {
    backgroundColor: "#FBF5F5",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 32,
    width: "100%",
    maxWidth: 280,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.3,
    borderColor: "#9f9f9f",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 6,
  },
  primaryCtaText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 16,
    color: "#432104",
    letterSpacing: 0.2,
  },
  secondaryCta: {
    paddingVertical: 10,
  },
  secondaryCtaText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#432104",
    letterSpacing: 0.5,
    marginTop: 10,
    textDecorationLine: "underline",
  },
});

export default CompletionReturnTransient;
