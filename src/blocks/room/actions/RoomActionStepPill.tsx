/**
 * RoomActionStepPill — stub for action_type=in_room_step.
 *
 * Delegates to step template by `step_payload.template_id`. Template IDs per
 * §5.4: breathe | walk_timer | sit_ambient | grounding | hand_on_heart.
 * Scaffolding renders the label; real template dispatch lands in Phase 5.
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import type { ActionEnvelope } from "../types";

interface Props {
  action: ActionEnvelope;
  index: number;
}

const RoomActionStepPill: React.FC<Props> = ({ action }) => {
  // Example future dispatch site (left commented intentionally):
  // const templateId = action.step_payload?.template_id;
  // switch (templateId) { case "breathe": ...; case "walk_timer": ...; }
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

export default RoomActionStepPill;
