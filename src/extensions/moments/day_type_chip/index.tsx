// Dashboard block (inline): DayTypeChip
// Spec: kalpx-frontend/docs/specs/mitra-v3-experience/screens/route_dashboard_day_active.md §1
// ISOLATED SCAFFOLD — not registered. See ./README.md for wire-up.

import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  block?: any;
  screenData?: any;
};

const DayTypeChip: React.FC<Props> = ({ block, screenData }) => {
  const value =
    block?.value ??
    screenData?.day_type ??
    null;
  if (!value) return null;
  return (
    <View style={styles.pill} accessibilityLabel="day_type_chip">
      <Text style={styles.text}>{String(value)}</Text>
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

export default DayTypeChip;
