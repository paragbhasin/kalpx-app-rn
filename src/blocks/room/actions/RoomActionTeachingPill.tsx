/**
 * RoomActionTeachingPill — stub for action_type=teaching.
 *
 * Opens the WhyThisL2Sheet overlay (reuses existing FE component per §5.7.6).
 * SCAFFOLDING ONLY: stub does not wire into the overlay yet — real wiring
 * lands in Phase 5 alongside BE teaching_payload hydration.
 *
 * Gated at RoomRenderer via EXPO_PUBLIC_MITRA_V3_ROOMS.
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import type { ActionEnvelope } from "../types";

interface Props {
  action: ActionEnvelope;
  index: number;
}

const RoomActionTeachingPill: React.FC<Props> = ({ action }) => {
  return (
    <TouchableOpacity
      testID={action.testID}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      style={styles.pill}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onPress={() => {}}
    >
      <Text style={styles.label}>{action.label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#D8D8D8",
    marginVertical: 4,
  },
  label: {
    fontSize: 15,
    color: "#1C1C1E",
  },
});

export default RoomActionTeachingPill;
