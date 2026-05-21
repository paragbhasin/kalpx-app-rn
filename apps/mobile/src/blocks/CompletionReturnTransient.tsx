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
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {Image, 
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
const MantraLotus3d = ({ width, height, opacity, style }: { width?: number; height?: number; opacity?: number; style?: any }) => <Image source={require("../../assets/mantra-lotus-3d.webp")} style={[{ width, height, opacity, resizeMode: 'contain' }, style]} />;
import { VoiceTextInput } from "../components/VoiceTextInput";
import { executeAction } from "../engine/actionExecutor";
import {
  mitraAddAdditionalItem,
  mitraTrackEvent,
  postGratitudeLedger,
} from "../engine/mitraApi";
import { useScreenStore } from "../engine/useScreenBridge";
import { readMomentSlot, useContentSlots } from "../hooks/useContentSlots";
import { store } from "../store";
import { screenActions } from "../store/screenSlice";
import { showSnackBar } from "../store/snackBarSlice";
import { Fonts } from "../theme/fonts";

// Phase E — variant-specific completion messages now served from the
// M_completion_return registry pack, keyed on
// stage_signals.runner_variant (mantra / sankalp / practice). The
// 3-way TSX dict is removed; fully registry-driven.

const AnimatedPath = Animated.createAnimatedComponent(Path);

// Prevents completion_return_shown from firing N times when multiple stale
// CompletionReturnTransient instances render from the same Redux state.
// Keyed by runner_source|runner_variant|item_id — so each distinct completion
// session fires once. Reset in clearRunnerState so the next session can track.
let _completionReturnShownKey = "";

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
  const navigation = useNavigation<any>();
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

  const _rhythmResult = ss.rhythm_complete_result as import('@kalpx/types').RhythmCompleteResponse | null | undefined;
  const _isRhythmCompletion = String(ss.runner_source || '') === 'rhythm_daily' && !!_rhythmResult;
  // Source-based flags used for CTA label — independent of rhythm_complete_result
  // so label is correct even when stacked-instance timing prevents result from being set.
  const isRhythmSource = String(ss.runner_source || '') === 'rhythm_daily';
  const isInnerPathSource = String(ss.practice_launch_surface || '') === 'inner_path';

  // For rhythm_daily completions, use frozen F-C copy from backend instead of registry.
  const isRoomSequenceCompletion = slot("completion_source") === "room_sequence";

  const message = _isRhythmCompletion
    ? (_rhythmResult!.copy.headline ?? slot("message"))
    : slot("message");
  const subtext = isRoomSequenceCompletion ? slot("subtext") : "";
  const wisdomAnchorLine = _isRhythmCompletion
    ? (_rhythmResult!.copy.subtext ?? "")
    : slot("wisdom_anchor_line");
  const wisdomAnchorPrincipleId = _isRhythmCompletion ? null : slot("wisdom_anchor_principle_id");

  const contentFade = useRef(new Animated.Value(0)).current;
  const checkProgress = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const [communityAddLoading, setCommunityAddLoading] = useState(false);
  const [showWriteInput, setShowWriteInput] = useState(false);

  const REFLECTION_CHIPS = ["A little more calm", "One clear thing", "A softer heart", "I need more time"];

  const handleChipTap = (chipLabel: string) => {
    mitraTrackEvent("room_completion_chip_tapped", {
      meta: { chip_label: chipLabel, room_id: screenData.room_id || null },
    }).catch(() => {});
  };

  const isCommunityRunner = screenData.runner_source === "community";
  const activeRunnerItem = screenData.runner_active_item || {};
  const activeRunnerItemId = String(
    activeRunnerItem.item_id || activeRunnerItem.itemId || activeRunnerItem.id || "",
  );
  const activeRunnerType = String(
    screenData.runner_variant ||
      activeRunnerItem.item_type ||
      activeRunnerItem.itemType ||
      activeRunnerItem.type ||
      "",
  );
  const activeAdditionalItemId =
    screenData.runner_additional_item_id ?? null;

  const setScreenValue = (key: string, value: any) => {
    store.dispatch(screenActions.setScreenValue({ key, value }));
  };

  const clearRunnerState = () => {
    _completionReturnShownKey = "";
    setScreenValue("runner_active_item", null);
    setScreenValue("runner_source", null);
    setScreenValue("runner_start_time", null);
    setScreenValue("runner_variant", null);
    setScreenValue("completion_return", null);
  };

  const ensureCommunityAdditionalItem = async () => {
    if (!activeRunnerItemId || !activeRunnerType) return null;
    if (activeAdditionalItemId) {
      return { additionalItem: { id: activeAdditionalItemId }, created: false };
    }

    const res = await mitraAddAdditionalItem(
      activeRunnerItemId,
      activeRunnerType,
      "community",
    );
    const nextId = res?.additionalItem?.id ?? res?.additional_item?.id ?? null;
    if (nextId != null) {
      store.dispatch(
        screenActions.setScreenValue({
          key: "runner_additional_item_id",
          value: nextId,
        }),
      );
    }
    store.dispatch(
      showSnackBar(
        res?.created
          ? "Added to your Mitra practice."
          : "Already in your Mitra practice.",
      ),
    );
    return res;
  };

  const handleCommunityAdd = async () => {
    if (communityAddLoading) return;
    if (!activeRunnerItemId || !activeRunnerType) {
      store.dispatch(showSnackBar("Could not add this item right now."));
      return;
    }
    setCommunityAddLoading(true);
    try {
      await ensureCommunityAdditionalItem();
    } catch (_) {
      store.dispatch(showSnackBar("Could not add this item right now."));
    } finally {
      setCommunityAddLoading(false);
    }
  };

  useEffect(() => {
    // Apply global background from header to footer via bridge
    updateBackground(require("../../assets/beige_bg.png"));
    updateHeaderHidden(false);

    const _sessionKey = [
      String(screenData.runner_source || ""),
      String(screenData.runner_variant || ""),
      String((screenData.runner_active_item as any)?.item_id || ""),
    ].join("|");
    if (_completionReturnShownKey !== _sessionKey) {
      _completionReturnShownKey = _sessionKey;
      mitraTrackEvent("completion_return_shown", {
        meta: {
          item_type: resolvedVariant,
          item_id: screenData.runner_active_item?.item_id,
          source: screenData.runner_source,
        },
      }).catch(() => {});
    }

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
    if (String(screenData.runner_source || '') === 'rhythm_daily') {
      executeAction({ type: 'return_to_rhythm_home', currentScreen } as any, {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) => setScreenValue(key, value),
        screenState: { ...screenData },
      }).catch(() => {});
      return;
    }
    if (String(screenData.practice_launch_surface || '') === 'inner_path') {
      executeAction({
        type: 'return_to_inner_path',
        payload: {
          item_type: String(screenData.runner_variant || ''),
          item_ref: String((screenData.runner_active_item as any)?.item_id || ''),
        },
        currentScreen,
      } as any, {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) => setScreenValue(key, value),
        screenState: { ...screenData },
      }).catch(() => {});
      return;
    }
    const returnAction = slot("return_action");
    if (returnAction === "return_to_mitra_home") {
      navigation.navigate("Home");
      return;
    }
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
    const repeatAction = slot("repeat_action");
    if (repeatAction === "repeat_room_sequence") {
      setScreenValue("show_room_reflection", false);
      setScreenValue("room_sequence_active", false);
      setScreenValue("room_sequence_resume_action_id", null);
      setScreenValue("room_sequence_action_ids", null);
      setScreenValue("room_sequence_index", null);
      loadScreen({ container_id: "room", state_id: "render" } as any);
      return;
    }
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
    postGratitudeLedger({
      signal_type: "post_completion_reflection",
      text: reflectionText.trim(),
      meta: {
        item_type: resolvedVariant,
        item_id: screenData.runner_active_item?.item_id ?? null,
      },
      logged_at: new Date().toISOString(),
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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
              {!!subtext && (
                <Text style={styles.subtextText} testID="completion_subtext">
                  {subtext}
                </Text>
              )}
            </View>

            {!!wisdomAnchorLine && (
              <View style={styles.wisdomAnchorCard}>
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
                    {/* <Text style={styles.readMoreText}>
                      {slot("read_more_label")}
                    </Text> */}
                  </TouchableOpacity>
                )}
              </View>
            )}

            {isRoomSequenceCompletion ? (
              <View style={styles.chipsWrap} testID="completion_reflection_chips">
                <View style={styles.chipsRow}>
                  {REFLECTION_CHIPS.map((chip) => (
                    <TouchableOpacity
                      key={chip}
                      style={styles.chip}
                      activeOpacity={0.75}
                      onPress={() => handleChipTap(chip)}
                      testID={`completion_chip_${chip.replace(/\s+/g, "_").toLowerCase()}`}
                    >
                      <Text style={styles.chipText}>{chip}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {!showWriteInput ? (
                  <TouchableOpacity
                    onPress={() => setShowWriteInput(true)}
                    activeOpacity={0.7}
                    style={styles.writeWordsBtn}
                    testID="completion_write_words_btn"
                  >
                    <Text style={styles.writeWordsBtnText}>Write a few words</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.voiceInputWrap}>
                    <VoiceTextInput
                      placeholder="Anything to carry from this?"
                      onSend={(text, type) => handleSubmitReflection(text, type)}
                    />
                  </View>
                )}
              </View>
            ) : (
              <View
                style={styles.voiceInputWrap}
                testID="completion_reflection_placeholder"
              >
                <VoiceTextInput
                  placeholder={slot("reflection_prompt")}
                  onSend={(text, type) => handleSubmitReflection(text, type)}
                />
              </View>
            )}
          </Animated.View>
        </Animated.View>

        <View style={styles.bottomSection}>
          <View style={styles.lotusWrap}>
            <MantraLotus3d width={180} height={140} opacity={0.65} />
          </View>

          <View style={styles.footer}>
            {isCommunityRunner && (
              <TouchableOpacity
                style={[
                  styles.communityAddCta,
                  communityAddLoading && styles.communityAddCtaDisabled,
                ]}
                onPress={() => {
                  void handleCommunityAdd();
                }}
                activeOpacity={0.8}
                disabled={communityAddLoading}
              >
                <Text style={styles.communityAddCtaText}>
                  {communityAddLoading ? "Adding..." : "Add to My Practice"}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.primaryCta}
              onPress={() => handleReturnHome(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryCtaText}>
                {isRhythmSource
                  ? "Return to My Rhythm"
                  : isInnerPathSource
                    ? "Return to Inner Path"
                    : slot("return_home_cta") || "Return to Mitra Home"}
              </Text>
            </TouchableOpacity>

            {!isRoomSequenceCompletion && !!slot("repeat_cta") && (
              <TouchableOpacity
                style={styles.secondaryCta}
                onPress={handleRepeat}
                activeOpacity={0.6}
              >
                <Text style={styles.secondaryCtaText}>{slot("repeat_cta")}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    width: "100%",
  },
  scroll: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
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
    // marginBottom: 48,
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
  subtextText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    lineHeight: 22,
    color: "#8A6845",
    fontStyle: "italic",
    marginTop: 8,
  },
  chipsWrap: {
    width: "100%",
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    backgroundColor: "rgba(255, 248, 239, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(200, 180, 154, 0.6)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#5C3A12",
    letterSpacing: 0.2,
  },
  writeWordsBtn: {
    paddingVertical: 4,
    alignSelf: "flex-start",
  },
  writeWordsBtnText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 14,
    color: "#946A47",
    textDecorationLine: "underline",
    fontStyle: "italic",
  },
  voiceInputWrap: {
    width: "100%",
    marginTop: 8,
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
    marginTop: -300,
    marginBottom: 96,
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
  communityAddCta: {
    backgroundColor: "rgba(255,248,239,0.92)",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: "100%",
    maxWidth: 280,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DAC28E",
    marginBottom: 12,
  },
  communityAddCtaDisabled: {
    opacity: 0.65,
  },
  communityAddCtaText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 14,
    color: "#B88413",
    letterSpacing: 0.2,
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
