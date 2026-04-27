/**
 * GuidanceModePicker — Turn 5. Three cards: Universal / Hybrid (default) / Rooted.
 *
 * Web counterpart: kalpx-frontend/src/containers/ChoiceStackContainer.vue — card pick pattern.
 * Spec: docs/specs/mitra-v3-experience/screens/route_welcome_onboarding.md §1 Turn 5, §6
 * Regression cases: REG-015 (no API call until user taps; PATCH companion-state happens in
 *   onboarding_turn_response handler, not on tap of a "select" that only highlights).
 *
 * Tapping a card selects AND submits — onboarding is a conversation, not a form.
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Line, Path } from "react-native-svg";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import { interpolate } from "../engine/utils/interpolation";
import { Fonts } from "../theme/fonts";

const DEEP_BROWN = "#432104";

// ─── Custom SVG Icons ────────────────────────────────────────────────────────

const BalanceIcon: React.FC<{ color: string; size?: number }> = ({
  color,
  size = 24,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Central pole */}
    <Line
      x1="12"
      y1="3"
      x2="12"
      y2="21"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    {/* Base */}
    <Line
      x1="6"
      y1="21"
      x2="18"
      y2="21"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    {/* Crossbar */}
    <Line
      x1="3"
      y1="7"
      x2="21"
      y2="7"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    {/* Left arm strings */}
    <Line
      x1="3"
      y1="7"
      x2="1"
      y2="13"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Line
      x1="1"
      y1="13"
      x2="7"
      y2="13"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    {/* Left pan curve */}
    <Path
      d="M1 13 Q4 17 7 13"
      stroke={color}
      strokeWidth={1.5}
      fill="none"
      strokeLinecap="round"
    />
    {/* Right arm strings */}
    <Line
      x1="21"
      y1="7"
      x2="23"
      y2="13"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Line
      x1="17"
      y1="13"
      x2="23"
      y2="13"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    {/* Right pan curve */}
    <Path
      d="M17 13 Q20 17 23 13"
      stroke={color}
      strokeWidth={1.5}
      fill="none"
      strokeLinecap="round"
    />
  </Svg>
);

const LotusIcon: React.FC<{ color: string; size?: number }> = ({
  color,
  size = 24,
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Center petal */}
    <Path
      d="M12 19 C12 19 8 14.5 8 10.5 C8 7.5 10 5.5 12 5.5 C14 5.5 16 7.5 16 10.5 C16 14.5 12 19 12 19Z"
      stroke={color}
      strokeWidth={1.4}
      fill="none"
      strokeLinejoin="round"
    />
    {/* Left petal */}
    <Path
      d="M12 19 C12 19 6 16 4.5 12 C3.5 9 5 6.5 7 6.5 C9 6.5 11 9 10.5 12"
      stroke={color}
      strokeWidth={1.4}
      fill="none"
      strokeLinejoin="round"
    />
    {/* Right petal */}
    <Path
      d="M12 19 C12 19 18 16 19.5 12 C20.5 9 19 6.5 17 6.5 C15 6.5 13 9 13.5 12"
      stroke={color}
      strokeWidth={1.4}
      fill="none"
      strokeLinejoin="round"
    />
    {/* Left outer leaf */}
    <Path
      d="M7 19 C7 19 4 17 4 14"
      stroke={color}
      strokeWidth={1.4}
      fill="none"
      strokeLinecap="round"
    />
    {/* Right outer leaf */}
    <Path
      d="M17 19 C17 19 20 17 20 14"
      stroke={color}
      strokeWidth={1.4}
      fill="none"
      strokeLinecap="round"
    />
    {/* Base stem line */}
    <Line
      x1="7"
      y1="19"
      x2="17"
      y2="19"
      stroke={color}
      strokeWidth={1.4}
      strokeLinecap="round"
    />
  </Svg>
);

// ─── Mode definitions ─────────────────────────────────────────────────────────

type ModeId = "universal" | "hybrid" | "rooted";

interface Mode {
  id: ModeId;
  title: string;
  desc: string;
  example: string;
  accent: string;
  tone: string;
  default?: boolean;
}

const MODES: Mode[] = [
  {
    id: "universal",
    title: "Keep it simple and modern",
    desc: "Clear, accessible language. No unfamiliar terms.",
    example: '"Today calls for slower pacing."',
    accent: "#7D9A62",
    tone: "simple",
  },
  {
    id: "hybrid",
    title: "A blend — modern clarity with spiritual depth",
    desc: "Familiar terms, occasional Sanatan language where it fits.",
    example: '"Today is a Tamas-leaning day. Slow pacing helps."',
    default: true,
    accent: "#C79A2B",
    tone: "hybrid",
  },
  {
    id: "rooted",
    title: "I am drawn to the deeper roots",
    desc: "Sanatan vocabulary visible. Gunas, doshas, panchang context.",
    example:
      '"Tamas rising. Your Kapha-pitta body is asking for sattvic rhythm."',
    accent: "#8673B5",
    tone: "rooted",
  },
];

const ModeIcon: React.FC<{ mode: Mode }> = ({ mode }) => {
  if (mode.id === "universal") {
    return <Ionicons name="leaf-outline" size={22} color={mode.accent} />;
  }
  if (mode.id === "hybrid") {
    return <BalanceIcon color={mode.accent} size={22} />;
  }
  return <LotusIcon color={mode.accent} size={22} />;
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  block: {
    on_response?: any;
  };
}

const GuidanceModePicker: React.FC<Props> = ({ block }) => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();

  const fire = async (modeId: string) => {
    if (!block.on_response) return;
    const base = interpolate(block.on_response, screenData);
    await executeAction(
      {
        ...base,
        payload: { ...(base.payload || {}), guidance_mode: modeId },
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
  };

  const rawTurn = screenData.onboarding_turn;
  const turn =
    typeof rawTurn === "number"
      ? rawTurn
      : typeof rawTurn === "string"
        ? Number((rawTurn.match(/\d+/) || ["6"])[0])
        : 6;

  return (
    <View style={styles.wrap}>
      {MODES.map((m) => {
        const cardTestID = `onboarding_turn_${turn}_chip_${m.id}`;
        const isSimple = m.tone === "simple";
        const isHybrid = m.tone === "hybrid";
        const isRooted = m.tone === "rooted";
        return (
          <TouchableOpacity
            key={m.id}
            style={[
              styles.card,
              isSimple ? styles.cardSimple : null,
              isHybrid ? styles.cardHybrid : null,
              isRooted ? styles.cardRooted : null,
            ]}
            onPress={() => fire(m.id)}
            activeOpacity={0.85}
            testID={cardTestID}
            accessibilityLabel={cardTestID}
          >
            {isHybrid ? (
              <View style={styles.mostChosenBadge}>
                <Ionicons name="star-outline" size={12} color="#FFFFFF" />
                <Text style={styles.mostChosenText}>MOST CHOSEN</Text>
              </View>
            ) : null}

            <View style={styles.cardRow}>
              <View
                style={[
                  styles.iconCircle,
                  { borderColor: `${m.accent}30` },
                  isSimple && { backgroundColor: "rgba(234, 240, 223, 0.6)" },
                  isHybrid && { backgroundColor: "rgba(255, 245, 220, 0.7)" },
                  isRooted && { backgroundColor: "rgba(237, 233, 255, 0.7)" },
                ]}
              >
                <ModeIcon mode={m} />
              </View>

              <View style={styles.textCol}>
                <Text
                  style={[styles.title, isHybrid ? { marginTop: 8 } : null]}
                >
                  {m.title}
                </Text>
                <Text style={styles.desc}>{m.desc}</Text>
                <Text
                  style={[
                    styles.example,
                    isHybrid ? styles.exampleHybrid : null,
                    isRooted ? styles.exampleRooted : null,
                  ]}
                >
                  {m.example}
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={20} color="#C79A2B" />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrap: { marginTop: 4, marginBottom: 12, gap: 12 },
  card: {
    backgroundColor: "#fffdf9",
    borderRadius: 24,
    padding: 15,

    // paddingHorizontal: 14,
    // paddingVertical: 14,
    borderWidth: 1,
    borderColor: "rgba(237, 222, 180, 0.65)",
  },
  cardSimple: {
    backgroundColor: "rgba(255, 255, 255, 0.82)",
  },
  cardHybrid: {
    borderColor: "rgba(199, 154, 43, 0.7)",
    backgroundColor: "rgba(255, 252, 246, 0.95)",
  },
  cardRooted: {
    borderColor: "rgba(183, 170, 219, 0.65)",
    backgroundColor: "rgba(248, 246, 255, 0.9)",
  },
  mostChosenBadge: {
    position: "absolute",
    right: 0,
    top: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomLeftRadius: 14,
    borderTopRightRadius: 24,
    backgroundColor: "#D5AE54",
    zIndex: 2,
  },
  mostChosenText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 10,
    color: "#FFFFFF",
    letterSpacing: 0.6,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 44,
    borderWidth: 1,
    backgroundColor: "rgba(248, 242, 232, 0.65)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  textCol: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    lineHeight: 26,
    color: DEEP_BROWN,
    marginBottom: 4,
  },
  desc: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    lineHeight: 21,
    color: "#5F5444",
    marginBottom: 8,
  },
  example: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    lineHeight: 19,
    color: "#8A7656",
  },
  exampleHybrid: {
    color: "#A07835",
  },
  exampleRooted: {
    color: "#7D6AAE",
  },
  simpleChip: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#EAF0DF",
  },
  simpleChipText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 10,
    color: "#3E6A2F",
    letterSpacing: 0.3,
  },
});

export default GuidanceModePicker;
