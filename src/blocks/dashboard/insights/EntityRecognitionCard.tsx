/**
 * EntityRecognitionCard (M29) — compact dashboard variant.
 *
 * Reads sd.entity_card (founder-approved shape 2026-04-18):
 *   {
 *     entity_id: string,
 *     display_name: string,
 *     context: string,              // machine code
 *     confidence: number,           // 0..1
 *     summary_line: string,         // user-facing prose
 *   }
 *
 * Self-hides when signal missing OR confidence below threshold (0.70).
 * Rendered restraint is non-negotiable — M29 can feel smart or
 * invasive depending on how often it appears. Gate aggressively.
 *
 * Priority rank: #4 above-fold per founder dashboard rules.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../theme/colors";
import { Fonts } from "../../../theme/fonts";

type Props = {
  screenData?: Record<string, any>;
};

const CONFIDENCE_THRESHOLD = 0.7;

const EntityRecognitionCard: React.FC<Props> = ({ screenData }) => {
  const sd = screenData ?? {};
  const payload = sd.entity_card ?? null;
  if (!payload || typeof payload !== "object") return null;

  const summary: string =
    typeof payload.summary_line === "string" ? payload.summary_line : "";
  const confidence =
    typeof payload.confidence === "number" ? payload.confidence : 0;

  // High-confidence guard — avoid "creepy" surface when evidence weak.
  if (!summary || confidence < CONFIDENCE_THRESHOLD) return null;

  return (
    <View style={styles.card} accessibilityLabel="entity_recognition_card">
      <View style={styles.headerRow}>
        <Text style={styles.eyebrow}>MITRA NOTICED</Text>
        <Ionicons
          name="person-circle-outline"
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

export default EntityRecognitionCard;
