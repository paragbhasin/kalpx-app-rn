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
  // MDR-S1-04 — sovereignty-strict. BE emits `focus_phrase` at top level
  // (via journey_envelope.merge_enrichment_into_response). Hide block
  // cleanly when BE has not seeded a value rather than leaking hardcoded
  // English. Per standing baseline Rule 3 (sovereignty) + Rule 6 (unread
  // field closure): the pill is a "render only if present" surface.
  const value = block?.value ?? screenData?.focus_phrase ?? null;
  const display = typeof value === "string" ? value : "";
  if (!display) return null;
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
