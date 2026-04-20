/**
 * RoomActionCarryPill — stub for action_type=carry.
 *
 * Writes a sacred-trace event on tap. Real BE endpoint lands in Phase 4.
 * Scaffolding logs intent to console only — no network, no local storage.
 *
 * Event names per §Contract 6: joy_carry, joy_named, release_voice_note,
 * connection_named, connection_reach_out, growth_journal, stillness_named,
 * clarity_journal.
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import type { ActionEnvelope } from "../types";

interface Props {
  action: ActionEnvelope;
  index: number;
}

const RoomActionCarryPill: React.FC<Props> = ({ action }) => {
  const onPress = () => {
    const event = action.carry_payload?.writes_event ?? null;
    // eslint-disable-next-line no-console
    console.log("[room-scaffold] carry tap (no network yet)", {
      action_id: action.action_id,
      writes_event: event,
      analytics_key: action.analytics_key,
    });
  };

  return (
    <TouchableOpacity
      testID={action.testID}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      style={styles.pill}
      onPress={onPress}
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

export default RoomActionCarryPill;
