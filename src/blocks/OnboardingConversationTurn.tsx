/**
 * OnboardingConversationTurn — Atomic "Mitra speaks, user replies" block.
 *
 * Web counterpart: kalpx-frontend/src/engine/BlockRenderer.vue (mitra_message+chip_list composite)
 *   Closest web equivalents: src/blocks/MitraMessageCard (conceptual, no direct file) +
 *   src/blocks/ChipListBlock + inline input pattern used in ConversationContainer.vue.
 * Spec: docs/specs/mitra-v3-experience/screens/route_welcome_onboarding.md §1, §10
 * Regression cases guarded:
 *   - REG-001: state cleanup on next-turn transition (we do not persist draft inside block state)
 *   - REG-015: no auto-completion when user has not tapped (only action.type=onboarding_turn_response)
 *   - REG-016: input placeholder shown only when block.open_input.enabled (turns 4/5 are binary)
 *
 * Tone rules: no exclamations, no "Great!", no emoji, no streak language.
 */

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { VoiceTextInput } from "../components/VoiceTextInput";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import { interpolate } from "../engine/utils/interpolation";
import { RootState } from "../store";
import { Fonts } from "../theme/fonts";

interface Props {
  block: {
    id?: string;
    headline?: string;
    subtext?: string;
    turnOneHero?: boolean;
    mitra_message?: string | string[];
    image?: {
      url: string;
      alt?: string;
      style?: any;
    };
    reply_chips?: {
      id: string;
      label: string;
      style?: "primary" | "secondary";
    }[];
    open_input?: {
      enabled?: boolean;
      placeholder?: string;
      max_length?: number;
    };
    voice_available?: boolean;
    on_response?: any; // base action object; { chip_id } or { freeform_text } merged into payload
  };
}

// Tokens mirror legacy KalpX palette — see Home.tsx hero CTA + cards.
const GOLD_BORDER = "#9f9f9f"; // subtle gold border / card accent
const AMBER_CTA = "#c89a47"; // primary CTA fill (matches "Begin Chanting")
const DEEP_BROWN = "#432104"; // primary text
const WARM_SUBTEXT = "#6b5a45"; // secondary text
const CREAM = "#FEFDF9A1"; // card surface
const CHIP_BG = "#FBF5F5"; // secondary chip fill

const resolveBlockImage = (url?: string) => {
  if (!url) return null;
  if (!url.startsWith("/assets/")) return { uri: url };

  const assetPath = url.replace("/assets/", "");
  if (assetPath === "mitra_lotus.png") {
    return require("../../assets/mitra_lotus.png");
  }
  if (assetPath === "new_home_lotus.png") {
    return require("../../assets/new_home_lotus.png");
  }
  if (assetPath === "lotus.png" || assetPath === "lotus") {
    return require("../../assets/lotus.png");
  }

  return { uri: url };
};

const turnOneMessageIcons: (keyof typeof Ionicons.glyphMap)[] = [
  "sunny-outline",
  "cloud-outline",
  "leaf-outline",
];

const OnboardingConversationTurn: React.FC<Props> = ({ block }) => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const user = useSelector(
    (state: RootState) => state.login?.user || state.socialLoginReducer?.user,
  );
  const isLoggedIn = !!user;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const replyAnim = useRef(new Animated.Value(0)).current;
  const [text, setText] = useState("");
  const turn = Number(screenData.onboarding_turn || 1);
  const isIntroTurn = turn === 1;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(replyAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, replyAnim]);

  const messages = Array.isArray(block.mitra_message)
    ? block.mitra_message
    : [block.mitra_message || ""];
  const inlineImageSource = resolveBlockImage(block.image?.url);
  const headlineLines = (block.headline || "").split("\n").filter(Boolean);
  const featureMessages = messages.slice(0, 3);
  const closingMessage = messages[3] || "";

  const fire = async (payload: Record<string, any>) => {
    if (!block.on_response) return;
    const base = interpolate(block.on_response, screenData);
    try {
      await executeAction(
        {
          ...base,
          payload: { ...(base.payload || {}), ...payload },
          currentScreen,
        },
        {
          loadScreen,
          goBack,
          setScreenValue: (value: any, key: string) => {
            const { screenActions } = require("../store/screenSlice");
            const { store } = require("../store");
            store.dispatch(screenActions.setScreenValue({ key, value }));
          },
          screenState: { ...screenData },
        },
      );
    } catch (err) {
      console.error("[OnboardingConversationTurn] action failed", err);
    }
  };

  const renderStyledInput = (showHeroMeta = false) => (
    <>
      {showHeroMeta && (
        <View style={styles.turnOneInputDivider}>
          <View style={styles.turnOneInputLine} />
          <Ionicons name="diamond" size={10} color="#c7a258" />
          <Text style={styles.turnOneInputDividerText}>
            Or share in your own words
          </Text>
          <Ionicons name="diamond" size={10} color="#c7a258" />
          <View style={styles.turnOneInputLine} />
        </View>
      )}

      <VoiceTextInput
        voiceAvailable={block.voice_available}
        placeholder={
          showHeroMeta
            ? "Type Or say it in your words..."
            : "Type Or say it in your words..."
        }
        onSend={(val, type) => {
          if (type === "text") {
            fire({ freeform_text: val, response_type: "text" });
          } else {
            fire({ response_type: "voice_requested" });
          }
        }}
      />

      {showHeroMeta && (
        <>
          <View style={styles.turnOneHintRow}>
            <Text style={styles.turnOneHintText}>Write</Text>
            <View style={styles.turnOneOrPill}>
              <Text style={styles.turnOneOrPillText}>or</Text>
            </View>
            <Text style={styles.turnOneHintText}>speak</Text>
            <Ionicons name="mic-outline" size={16} color="#7a6031" />
          </View>

          <View style={styles.turnOnePrivacyRow}>
            <Ionicons name="lock-closed-outline" size={16} color="#7a6031" />
            <Text style={styles.turnOnePrivacyText}>
              Your thoughts are private and safe with Mitra.
            </Text>
          </View>
        </>
      )}
    </>
  );

  if (block.turnOneHero && isIntroTurn) {
    return (
      <View style={styles.turnOneWrap}>
        <View style={styles.turnOneCard}>
          <Text style={styles.turnOneHeadline}>{headlineLines.join("\n")}</Text>

          <View style={styles.turnOneHeadlineDivider}>
            <View style={styles.turnOneDividerLine} />
            <Ionicons name="diamond" size={10} color="#c7a258" />
            <View style={styles.turnOneDividerLine} />
          </View>

          <View style={styles.turnOneMessageList}>
            {featureMessages.map((message, index) => (
              <View key={index} style={styles.turnOneMessageRow}>
                <View style={styles.turnOneIconBubble}>
                  <Ionicons
                    name={turnOneMessageIcons[index] || "sparkles-outline"}
                    size={22}
                    color="#c7a258"
                  />
                </View>
                <Text style={styles.turnOneMessageText}>
                  {interpolate(message, screenData)}
                </Text>
              </View>
            ))}
          </View>

          {closingMessage ? (
            <>
              <View style={styles.turnOneCardSeparator} />
              <View style={styles.turnOneMessageRow}>
                <View style={styles.turnOneIconBubble}>
                  <Ionicons name="heart-outline" size={22} color="#c7a258" />
                </View>
                <Text style={styles.turnOneClosingText}>
                  {interpolate(closingMessage, screenData).replace(
                    "alone.",
                    "",
                  )}
                  <Text style={styles.turnOneClosingEmphasis}>alone.</Text>
                </Text>
              </View>
            </>
          ) : null}
        </View>

        {inlineImageSource && (
          <View style={styles.turnOneLotusWrap}>
            <Image
              source={inlineImageSource}
              style={styles.turnOneLotus}
              resizeMode="contain"
            />
          </View>
        )}

        <Animated.View
          style={[styles.turnOneResponseWrap, { opacity: replyAnim }]}
        >
          {(block.reply_chips || []).map((chip) => {
            const isReturning = chip.label.toLowerCase().includes("returning");
            if (isReturning) return null; // Rendered at the bottom instead

            return (
              <TouchableOpacity
                key={chip.id}
                activeOpacity={0.85}
                onPress={() =>
                  fire({ chip_id: chip.id, response_type: "chip" })
                }
              >
                {chip.style === "primary" ? (
                  <LinearGradient
                    colors={["#C08B31", "#D3A44D", "#B57C26"]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={[styles.turnOneButton, styles.turnOnePrimaryButton]}
                  >
                    <Ionicons
                      name="sparkles-outline"
                      size={20}
                      color="#fff9ec"
                    />
                    <Text style={styles.turnOnePrimaryButtonText}>
                      {chip.label.replace(" →", "")}
                    </Text>
                    <Ionicons name="arrow-forward" size={22} color="#fff9ec" />
                  </LinearGradient>
                ) : (
                  <View
                    style={[
                      styles.turnOneButton,
                      styles.turnOneSecondaryButton,
                    ]}
                  >
                    <Text style={styles.turnOneSecondaryButtonText}>
                      {chip.label}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {(() => {
            const returningChip = (block.reply_chips || []).find((c) =>
              c.label.toLowerCase().includes("returning"),
            );
            if (!returningChip && !isIntroTurn) return null;
            if (isLoggedIn) return null; // Hide returning button if already logged in

            const finalId = returningChip?.id || "returning";
            const finalLabel = returningChip?.label || "I'm returning";

            return (
              <TouchableOpacity
                key={finalId}
                activeOpacity={0.85}
                onPress={() =>
                  fire({ chip_id: finalId, response_type: "chip" })
                }
                style={{ paddingBottom: 10 }}
              >
                <View
                  style={[styles.turnOneButton, styles.turnOneSecondaryButton]}
                >
                  <Text style={styles.turnOneSecondaryButtonText}>
                    {finalLabel}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })()}

          {block.open_input?.enabled && renderStyledInput(true)}
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.fullCard}>
        {block.headline && (
          <>
            <Text style={styles.unifiedHeadline}>
              {headlineLines.join("\n")}
            </Text>

            <View style={styles.turnOneHeadlineDivider}>
              <View style={styles.turnOneDividerLine} />
              <Ionicons name="diamond" size={10} color="#c7a258" />
              <View style={styles.turnOneDividerLine} />
            </View>

            {block.subtext && (
              <Text style={styles.unifiedSubtext}>
                {interpolate(block.subtext, screenData)}
              </Text>
            )}
          </>
        )}

        {messages.some((m) => m && String(m).trim().length > 0) && (
          <Animated.View style={[styles.mitraMsgCard, { opacity: fadeAnim }]}>
            {messages.map((para, i) =>
              para && String(para).trim().length > 0 ? (
                <Text
                  key={i}
                  style={[styles.mitraMsg, i > 0 && { marginTop: 12 }]}
                >
                  {interpolate(para, screenData)}
                </Text>
              ) : null,
            )}
          </Animated.View>
        )}

        <Animated.View style={{ opacity: replyAnim }}>
          {isIntroTurn && inlineImageSource && (
            <View style={styles.inlineImageWrap}>
              <Image
                source={inlineImageSource}
                style={[styles.inlineImage, block.image?.style]}
                resizeMode="contain"
                accessibilityLabel={block.image?.alt || "decorative image"}
              />
            </View>
          )}

          {(block.reply_chips || []).map((chip) => {
            const isReturning = chip.label.toLowerCase().includes("returning");

            if (isReturning) {
              if (isLoggedIn) return null; // Hide returning button if already logged in
              return (
                <TouchableOpacity
                  key={chip.id}
                  activeOpacity={0.75}
                  onPress={() =>
                    fire({ chip_id: chip.id, response_type: "chip" })
                  }
                >
                  <View style={[styles.chip, styles.chipSecondary]}>
                    <Text style={styles.chipLabel}>{chip.label}</Text>
                  </View>
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={chip.id}
                activeOpacity={0.75}
                onPress={() =>
                  fire({ chip_id: chip.id, response_type: "chip" })
                }
              >
                {isIntroTurn && chip.style !== "primary" ? (
                  <LinearGradient
                    colors={["#E5D4CA", "#F5EDEA"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.heroChip, styles.heroChipSecondary]}
                  >
                    <Text style={styles.heroChipLabel}>{chip.label}</Text>
                  </LinearGradient>
                ) : (
                  <View
                    style={[
                      isIntroTurn ? styles.heroChip : styles.chip,
                      chip.style === "primary"
                        ? isIntroTurn
                          ? styles.heroChipPrimary
                          : styles.chipPrimary
                        : isIntroTurn
                          ? styles.heroChipSecondary
                          : styles.chipSecondary,
                    ]}
                  >
                    <Text
                      style={[
                        isIntroTurn ? styles.heroChipLabel : styles.chipLabel,
                        chip.style === "primary" &&
                          (isIntroTurn
                            ? styles.heroChipLabelPrimary
                            : styles.chipLabelPrimary),
                      ]}
                    >
                      {chip.label}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {block.open_input?.enabled && renderStyledInput(false)}
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginVertical: 12 },
  turnOneWrap: {
    marginTop: -15,
    marginBottom: 12,
  },
  turnOneCard: {
    borderRadius: 25,
    backgroundColor: "rgba(255, 252, 246, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(226, 208, 174, 0.9)",
    paddingHorizontal: 10,
    paddingTop: 24,
    paddingBottom: 20,
    shadowColor: "#d9bf8f",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 22,
    elevation: 4,
  },
  unifiedSubtext: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    lineHeight: 22,
    color: "#6b5a45",
    textAlign: "center",
    marginBottom: 16,
  },
  turnOneGlyphWrap: {
    alignItems: "center",
    marginBottom: 12,
  },
  turnOneHeadline: {
    fontFamily: Fonts.serif.bold,
    color: "#3f2810",
    fontSize: 28,
    lineHeight: 38,
    textAlign: "center",
  },
  turnOneHeadlineDivider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 12,
    marginBottom: 20,
  },
  turnOneDividerLine: {
    width: 44,
    height: 1,
    backgroundColor: "rgba(199, 162, 88, 0.6)",
  },
  turnOneMessageList: {
    gap: 16,
  },
  turnOneMessageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  turnOneIconBubble: {
    width: 25,
    height: 25,
    borderRadius: 22,
    backgroundColor: "rgba(250, 244, 229, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  turnOneMessageText: {
    flex: 1,
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    lineHeight: 24,
    color: "#3f2810",
    alignItems: "center",
    justifyContent: "center",
    // paddingTop: 6,
  },
  linkText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 20,
    color: "#432104",
    textDecorationLine: "underline",
    alignSelf: "center",
    marginTop: 12,
  },
  turnOneCardSeparator: {
    height: 1,
    backgroundColor: "rgba(220, 203, 174, 0.7)",
    marginVertical: 18,
  },
  turnOneClosingText: {
    flex: 1,
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    lineHeight: 24,
    color: "#3f2810",
    paddingTop: 4,
  },
  turnOneClosingEmphasis: {
    fontFamily: Fonts.serif.bold,
    color: "#b9892f",
    fontStyle: "italic",
  },
  turnOneLotusWrap: {
    alignItems: "center",
    marginTop: -8,
    marginBottom: 10,
  },
  turnOneLotus: {
    width: 201,
    height: 200,
    marginBottom: -50,
    marginTop: -30,
  },
  turnOneResponseWrap: {
    paddingHorizontal: 10,
  },
  turnOneButton: {
    minHeight: 45,
    borderRadius: 31,
    marginBottom: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 24,
    shadowColor: "#d2b176",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 4,
  },
  turnOnePrimaryButton: {
    justifyContent: "space-between",
  },
  turnOnePrimaryButtonText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 17,
    color: "#fff9ec",
  },
  turnOneSecondaryButton: {
    borderWidth: 1.5,
    borderColor: "#cfaa62",
  },
  turnOneSecondaryButtonText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 17,
    color: "#432104",
  },
  turnOneInputDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 16,
    gap: 8,
  },
  turnOneInputLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(210, 192, 158, 0.6)",
  },
  turnOneInputDividerText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: "#8f7442",
  },
  turnOneInputShell: {
    minHeight: 30,
    borderRadius: 20,
    backgroundColor: "rgba(255, 252, 246, 0.98)",
    borderWidth: 1,
    borderColor: "rgba(222, 206, 176, 0.95)",
    paddingLeft: 16,
    paddingRight: 10,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#d9bf8f",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 3,
  },
  turnOneInputLeadIcon: {
    marginRight: 12,
  },
  turnOneInput: {
    flex: 1,
    maxHeight: 50,
    paddingVertical: 10,
    color: "#432104",
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
  },
  turnOneMicButton: {
    width: 30,
    height: 30,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "#cfaa62",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff9ec",
    marginLeft: 10,
  },
  sharedInputShell: {
    minHeight: 72,
    borderRadius: 16,
    marginTop: 16,
  },
  sharedInput: {
    paddingVertical: 16,
  },
  turnOneHintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 18,
  },
  turnOneHintText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    color: "#6f5730",
  },
  turnOneOrPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "#caa04e",
  },
  turnOneOrPillText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 12,
    color: "#fff9ec",
  },
  turnOnePrivacyRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  turnOnePrivacyText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#6f5730",
  },
  mitraMsgCard: {
    // borderLeftWidth: 3,
    // borderLeftColor: GOLD_BORDER,
    paddingLeft: 16,
    paddingVertical: 8,
    marginBottom: 24,
  },
  inlineImageWrap: {
    alignItems: "center",
    marginBottom: 18,
  },
  inlineImage: {
    width: 180,
    height: 180,
  },
  mitraMsg: {
    fontFamily: Fonts.serif.regular,
    fontSize: 20,
    lineHeight: 28,
    color: DEEP_BROWN,
  },
  chip: {
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginBottom: 10,
    borderWidth: 0.3,
  },
  chipPrimary: { backgroundColor: AMBER_CTA, borderColor: AMBER_CTA },
  chipSecondary: {
    backgroundColor: CHIP_BG,
    borderColor: GOLD_BORDER,
    borderWidth: 0.3,

    elevation: 6,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  chipLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    color: DEEP_BROWN,
    textAlign: "center",
  },
  chipLabelPrimary: { color: "#ffffff" },
  heroChip: {
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    minWidth: 220,
    maxWidth: "92%",
    paddingHorizontal: 12,
    borderRadius: 46,
    marginBottom: 16,
    borderWidth: 3,
    shadowColor: "#E8C587",
    shadowOffset: { width: 10, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 4,
  },
  heroChipPrimary: {
    backgroundColor: "#C7913A",
    borderColor: "#fcecc2",
  },
  heroChipSecondary: {
    borderColor: "rgba(255, 244, 232, 0.95)",
  },
  heroChipLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 16,
    lineHeight: 40,
    color: DEEP_BROWN,
    textAlign: "center",
    letterSpacing: -0.6,
  },
  heroChipLabelPrimary: {
    color: "#fffdf9",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: CREAM,
    borderWidth: 1,
    borderColor: GOLD_BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 16,
  },
  input: {
    flex: 1,
    // minHeight: 44,
    maxHeight: 100,
    color: DEEP_BROWN,
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    alignSelf: "center",
  },
  micBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  micIcon: { color: AMBER_CTA, fontSize: 20 },
  fullCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: "#fffaf3",
    borderWidth: 1,
    borderColor: "#e6c88f",
    shadowColor: "#c89a47",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    marginTop: -15,
  },

  unifiedHeadline: {
    fontFamily: Fonts.serif.bold,
    fontSize: 24,
    lineHeight: 34,
    color: "#3f2810",
    textAlign: "center",
    marginBottom: 10,
  },
});

export default OnboardingConversationTurn;
