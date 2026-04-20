/**
 * RoomActionInquiryPill — stub for action_type=inquiry.
 *
 * Inquiry sub-flow entry point. Real flow opens a category picker over
 * `inquiry_payload.categories[]` (§7.2). Scaffolding is tap-no-op.
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import type { ActionEnvelope } from "../types";

interface Props {
  action: ActionEnvelope;
  index: number;
}

const RoomActionInquiryPill: React.FC<Props> = ({ action }) => {
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

export default RoomActionInquiryPill;
