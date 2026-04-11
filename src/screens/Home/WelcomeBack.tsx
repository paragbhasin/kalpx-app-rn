/**
 * WelcomeBack.tsx — returning-user welcome screen.
 *
 * Shown when GET /mitra/journey/status/ returns welcomeBack: true
 * (journey ended 30+ days ago). Mirrors web WelcomeBack.vue.
 */
import React from "react";
import {
  Image,
  ImageBackground,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Fonts } from "../../theme/fonts";

const FOCUS_LABELS: Record<string, string> = {
  careerprosperity: "Career & Focus",
  healthwellbeing: "Health & Wellbeing",
  emotionalhealing: "Relationships",
  spiritualgrowth: "Spiritual Growth",
  peacecalm: "Peace & Calm",
  focusmotivation: "Focus & Motivation",
  gratitudepositivity: "Gratitude & Positivity",
};

const FOCUS_SHORT: Record<string, string> = {
  careerprosperity: "Career & Focus",
  healthwellbeing: "Health & Wellbeing",
  emotionalhealing: "Relationships",
  spiritualgrowth: "Spiritual Growth",
  peacecalm: "Peace & Calm",
  focusmotivation: "Focus",
  gratitudepositivity: "Gratitude",
};

const SUBFOCUS_LABELS: Record<string, string> = {
  stagnant: "feeling stuck",
  work_overwhelm: "overwhelm",
  imposter: "low confidence",
  scattered: "lack of focus",
  financial_stress: "financial stress",
  heavy_heart: "heavy heart",
  resentful: "resentment",
  lonely: "loneliness",
  disconnected: "feeling disconnected",
  grieving: "grief",
  low_vitality: "low energy",
  burned_out: "burnout",
  physically_tense: "physical tension",
  sluggish: "feeling sluggish",
  neglectful: "self-neglect",
  practice_discipline: "unsteady practice",
  spiritual_dryness: "spiritual dryness",
  seeking_surrender: "seeking surrender",
  ungrateful_pattern: "losing gratitude",
  seeking_depth: "seeking depth",
};

const ANCHOR_LABELS: Record<string, string> = {
  mantra: "mantra practice",
  sankalp: "sankalp practice",
  practice: "daily practice",
};

interface WelcomeBackProps {
  focus?: string;
  subfocus?: string;
  cycleNumber?: number;
  daysPracticed?: number;
  strongestAnchor?: string;
  onContinue: () => void;
  onFresh: () => void;
}

const BACKGROUND = require("../../../assets/continue_journey_bg.jpeg");
const LOTUS_ICON = require("../../../assets/mantra3.png");

export default function WelcomeBack({
  focus = "",
  subfocus = "",
  cycleNumber = 1,
  daysPracticed = 0,
  strongestAnchor = "",
  onContinue,
  onFresh,
}: WelcomeBackProps) {
  const focusLabel = FOCUS_LABELS[focus] || focus || "your practice";
  const focusShort = FOCUS_SHORT[focus] || "this Path";
  const subfocusLabel = SUBFOCUS_LABELS[subfocus] || "";
  const anchorLabel = ANCHOR_LABELS[strongestAnchor] || "";

  return (
    <ImageBackground source={BACKGROUND} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Image source={LOTUS_ICON} style={styles.icon} resizeMode="contain" />
          </View>

          <Text style={styles.title}>Welcome back</Text>

          <Text style={styles.message}>
            You were walking the path of <Text style={styles.strong}>{focusLabel}</Text>
            {subfocusLabel ? ` — ${subfocusLabel}` : ""}.
          </Text>

          {daysPracticed > 0 && (
            <Text style={styles.detail}>
              You completed {daysPracticed} {daysPracticed === 1 ? "day" : "days"} on this path.
              {anchorLabel ? ` Your ${anchorLabel} was the practice you returned to most.` : ""}
            </Text>
          )}

          {cycleNumber > 1 && (
            <Text style={styles.detail}>
              You walked {cycleNumber} cycles on this path.
            </Text>
          )}

          <Text style={styles.prompt}>
            Your practice is still remembered. Would you like to return to that rhythm, or begin fresh?
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity onPress={onContinue} activeOpacity={0.85}>
              <LinearGradient
                colors={["#d4a853", "#c49a3c"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.btnContinue}
              >
                <Text style={styles.btnContinueText}>Continue with {focusShort}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnFresh} onPress={onFresh} activeOpacity={0.85}>
              <Text style={styles.btnFreshText}>Start Fresh</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.hint}>
            Starting fresh simply opens new possibilities. Nothing is lost.
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const GOLD = "#d0902d";

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(26, 20, 10, 0.45)",
  },
  safe: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  card: {
    maxWidth: 440,
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#feebb6",
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
  },
  iconWrap: {
    marginBottom: 20,
  },
  icon: {
    width: 52,
    height: 52,
  },
  title: {
    fontFamily: Fonts.serif.bold,
    fontSize: 28,
    color: "#1a1a1a",
    marginBottom: 14,
    textAlign: "center",
  },
  message: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    lineHeight: 24,
    color: "#4a4a4a",
    marginBottom: 8,
    textAlign: "center",
  },
  strong: {
    fontFamily: Fonts.sans.semiBold,
    color: "#1a1a1a",
  },
  detail: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    lineHeight: 22,
    color: "#6a6a6a",
    marginBottom: 6,
    textAlign: "center",
  },
  prompt: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    lineHeight: 24,
    color: "#4a4a4a",
    marginTop: 14,
    marginBottom: 20,
    textAlign: "center",
  },
  actions: {
    width: "100%",
    gap: 12,
    marginBottom: 18,
  },
  btnContinue: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  btnContinueText: {
    fontFamily: Fonts.sans.semiBold,
    color: "#ffffff",
    fontSize: 15,
  },
  btnFresh: {
    backgroundColor: "transparent",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: GOLD,
    alignItems: "center",
  },
  btnFreshText: {
    fontFamily: Fonts.sans.semiBold,
    color: GOLD,
    fontSize: 15,
  },
  hint: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    lineHeight: 18,
    color: "#999",
    textAlign: "center",
  },
});
