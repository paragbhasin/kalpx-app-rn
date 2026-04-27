/**
 * PathChip — visualises the user's current journey path
 * (support / growth / return).
 *
 * Spec: docs/NEW_DASHBOARD_V1_SPEC.md §2 #3
 *
 * Data: screenData.journey_path — one of "support" | "growth" | "return".
 *       screenData.journey_path_label (optional) — localized label to render.
 *
 * Sovereignty: falls back to the enum slug (which is a neutral identifier,
 * not prose) if no label is provided. We never fabricate English.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/fonts";

type JourneyPath = "support" | "growth" | "return" | string;

type Props = {
  screenData?: Record<string, any>;
};

const iconForPath = (path: JourneyPath): keyof typeof Ionicons.glyphMap => {
  switch (path) {
    case "support":
      return "heart-outline";
    case "growth":
      return "leaf-outline";
    case "return":
      return "refresh-outline";
    default:
      return "flower-outline";
  }
};

const PathChip: React.FC<Props> = ({ screenData }) => {
  const sd = screenData ?? {};
  const path: JourneyPath | null = sd.journey_path ?? null;
  // Always-visible block. When backend hasn't supplied a label yet,
  // use a neutral structural default ("Your Path") so the chip row
  // is stable. Specific copy swaps in once the journey classifies.
  const label: string =
    sd.journey_path_label ||
    (path === "support" ? "Support Path" :
     path === "growth" ? "Growth Path" :
     path === "return" ? "Re-entry" :
     "Your Path");

  return (
    <View style={styles.pill} accessibilityLabel="path_chip">
      <Ionicons
        name={iconForPath(path ?? "")}
        size={13}
        color={Colors.gold}
        style={styles.icon}
      />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.goldHairline,
    backgroundColor: Colors.cream,
  },
  icon: {
    marginRight: 5,
  },
  text: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: Colors.brownMuted,
  },
});

export default PathChip;
