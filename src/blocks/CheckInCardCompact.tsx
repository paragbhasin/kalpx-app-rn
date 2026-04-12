/**
 * CheckInCardCompact — "How are you landing?" inline dashboard check-in.
 *
 * Shows 3 state chips (Steady / Heavy / Activated). On tap, dispatches
 * acknowledge_check_in (fires prana-acknowledge + marks dismissed).
 * REG-015: check-in uses its own local dismiss flag; does NOT share runner
 * state with the core mantra/sankalp/practice flow.
 *
 * Web parity:
 *   - Spec: route_dashboard_day_active.md §1 (SupportEntryRow quick check-in), §7 (PrepCard adjacency)
 *   - Existing web flow: kalpx-frontend/src/mock/mock/allContainers.js — cycle_transitions/quick_checkin
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Fonts } from "../theme/fonts";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";

const CHIPS = [
  { id: "steady", label: "Steady" },
  { id: "heavy", label: "Heavy" },
  { id: "activated", label: "Activated" },
];

const CheckInCardCompact: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const ss = screenData as Record<string, any>;
  if (ss.check_in_dismissed) return null;

  const onChip = (id: string) => {
    executeAction(
      { type: "acknowledge_check_in", payload: { prana_state: id } },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.prompt}>How are you landing?</Text>
      <View style={styles.row}>
        {CHIPS.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={styles.chip}
            activeOpacity={0.8}
            onPress={() => onChip(c.id)}
          >
            <Text style={styles.chipText}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fdf9ee",
    borderRadius: 12,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "rgba(212, 160, 23, 0.2)",
  },
  prompt: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: "#3a2b12",
    marginBottom: 10,
    textAlign: "center",
  },
  row: { flexDirection: "row", justifyContent: "center", gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#c7a64b",
    backgroundColor: "#fffdf5",
  },
  chipText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#432104",
  },
});

export default CheckInCardCompact;
