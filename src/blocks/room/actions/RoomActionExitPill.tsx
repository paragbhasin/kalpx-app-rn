/**
 * RoomActionExitPill — stub for action_type=exit.
 *
 * Per invariant I-1: every RoomRenderV1 includes exactly one exit action.
 * Per §10: exit is NEVER network-gated — always renders even when the rest
 * of the envelope fails hydration. Scaffolding is a tap-no-op.
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import type { ActionEnvelope } from "../types";

interface Props {
  action: ActionEnvelope;
  index: number;
}

const RoomActionExitPill: React.FC<Props> = ({ action }) => {
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
    marginVertical: 4,
  },
  label: {
    fontSize: 15,
    color: "#6E6E73",
  },
});

export default RoomActionExitPill;
