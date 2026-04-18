// Dashboard block (inline): FocusPhraseLine
// Spec: kalpx-frontend/docs/specs/mitra-v3-experience/screens/route_dashboard_day_active.md §1
// ISOLATED SCAFFOLD — not registered. See ./README.md for wire-up.

import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  block?: any;
  screenData?: any;
};

const FocusPhraseLine: React.FC<Props> = ({ block, screenData }) => {
  const value =
    block?.value ??
    screenData?.focus_phrase ??
    null;
  // Always-visible. Structural fallback keeps the italic gold line
  // present even before backend authors today's phrase.
  const display = value ? String(value) : "One gentle step is enough.";
  return (
    <View style={styles.pill} accessibilityLabel="focus_phrase_line">
      <Text style={styles.text}>{display}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: "#F5E9D2",
    marginVertical: 6,
  },
  text: { color: "#8B6B1F", fontSize: 13, fontStyle: "italic" },
});

export default FocusPhraseLine;
