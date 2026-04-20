/**
 * RoomActionRunnerPill — stub for runner_mantra | runner_sankalp | runner_practice.
 *
 * SCAFFOLDING ONLY. Rendered only when EXPO_PUBLIC_MITRA_V3_ROOMS === "1"
 * (gated at RoomRenderer). No network calls. No actionExecutor side-effects.
 * Real runner dispatch lands in Phase 5 with the BE resolver endpoint.
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { ActionEnvelope } from "../types";

interface Props {
  action: ActionEnvelope;
  index: number;
}

const RoomActionRunnerPill: React.FC<Props> = ({ action }) => {
  return (
    <TouchableOpacity
      testID={action.testID}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      style={styles.pill}
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onPress={() => {}}
    >
      <View style={styles.inner}>
        <Text style={styles.label}>{action.label}</Text>
      </View>
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
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 15,
    color: "#1C1C1E",
  },
});

export default RoomActionRunnerPill;
