/**
 * ResilienceNarrativeCard (M26) — compact dashboard variant.
 *
 * Reads sd.resilience_narrative (founder-approved shape 2026-04-18):
 *   {
 *     pattern: string,
 *     weeks_detected: number,
 *     summary_line: string,
 *     strength: "emerging" | "strong" | "weak"
 *   }
 *
 * Self-hides when signal missing. Renders a calm sage-toned card; no
 * analytics framing, no streak-counter style. Pure noticing.
 *
 * Priority rank: #2 above-fold (after checkpoint banners) per founder
 * dashboard rendering rules.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../theme/colors";
import { Fonts } from "../../../theme/fonts";

type Props = {
  screenData?: Record<string, any>;
};

const ResilienceNarrativeCard: React.FC<Props> = ({ screenData }) => {
  const sd = screenData ?? {};
  // v3 journey: insights.resilience_narrative (namespaced). Fallback flat.
  const payload = sd.insights?.resilience_narrative ?? sd.resilience_narrative ?? null;
  if (!payload || typeof payload !== "object") return null;

  const summary: string =
    typeof payload.summary_line === "string" ? payload.summary_line : "";
  if (!summary) return null;

  const strength: string = payload.strength || "emerging";
  const strengthDot =
    strength === "strong"
      ? Colors.successGreen
      : strength === "weak"
        ? Colors.ringTan
        : Colors.gold;

  // Sovereignty Rule 3 — eyebrow is backend-seeded; hide when absent rather
  // than leaking hardcoded "NOTICING". BE field: payload.eyebrow_label
  // (or legacy payload.eyebrow). FE-first fix; slot populates when BE ships.
  const eyebrowLabel: string =
    typeof payload.eyebrow_label === "string"
      ? payload.eyebrow_label
      : typeof payload.eyebrow === "string"
        ? payload.eyebrow
        : "";

  return (
    <View
      style={styles.card}
      accessibilityLabel="resilience_narrative_card"
      testID="resilience_narrative_card"
    >
      <View style={styles.mainRow}>
        {/* Left: Strength Dot and optional eyebrow label */}
        <View style={styles.leftCol}>
          <View style={[styles.strengthDot, { backgroundColor: strengthDot }]} />
          {!!eyebrowLabel && (
            <Text style={styles.eyebrow} numberOfLines={1}>
              {eyebrowLabel}
            </Text>
          )}
        </View>

        {/* Center: Narrative summary text (flexible) */}
        <View style={styles.centerCol}>
          <Text style={styles.body}>{summary}</Text>
        </View>

        {/* Right: Icon */}
        <View style={styles.rightCol}>
          <Ionicons name="leaf-outline" size={15} color={Colors.brownMuted} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: Colors.goldHairline,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginVertical: 8,
    backgroundColor: Colors.cream,
  },
  mainRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  leftCol: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 5, // align with first line cap-height
    gap: 6,
  },
  centerCol: {
    flex: 1,
  },
  rightCol: {
    paddingTop: 4,
  },
  strengthDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  eyebrow: {
    fontFamily: Fonts.sans.medium,
    fontSize: 9,
    letterSpacing: 1.1,
    color: Colors.brownMuted,
  },
  body: {
    fontFamily: Fonts.serif.regular,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.brownDeep,
  },
});

export default ResilienceNarrativeCard;
