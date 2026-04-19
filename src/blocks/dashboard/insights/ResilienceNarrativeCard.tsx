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
  const payload = sd.resilience_narrative ?? null;
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
      <View style={styles.headerRow}>
        <View style={styles.eyebrowWrap}>
          <View style={[styles.strengthDot, { backgroundColor: strengthDot }]} />
          {!!eyebrowLabel && <Text style={styles.eyebrow}>{eyebrowLabel}</Text>}
        </View>
        <Ionicons
          name="leaf-outline"
          size={15}
          color={Colors.brownMuted}
        />
      </View>
      <Text style={styles.body}>{summary}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: Colors.goldHairline,
    borderRadius: 14,
    padding: 14,
    marginVertical: 8,
    backgroundColor: Colors.cream,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  eyebrowWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  strengthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  eyebrow: {
    fontFamily: Fonts.sans.medium,
    fontSize: 10,
    letterSpacing: 1.3,
    color: Colors.brownMuted,
  },
  body: {
    fontFamily: Fonts.serif.regular,
    fontSize: 14,
    lineHeight: 21,
    color: Colors.brownDeep,
  },
});

export default ResilienceNarrativeCard;
