/**
 * CycleSignalBar — slim horizontal progress bar mapping the current cycle
 * (7 or 14 day). Checkpoint dots appear at day 7 and day 14, tappable once
 * that day is reached.
 *
 * Web parity:
 *   - Spec: route_dashboard_day_active.md §1 (journey progress), §8 Checkpoint entry
 *   - Existing mock: kalpx-frontend/src/mock/mock/allContainers.js line 190-192 (journey_summary)
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Fonts } from "../theme/fonts";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import store from "../store";
import { screenActions } from "../store/screenSlice";

const CycleSignalBar: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const ss = screenData as Record<string, any>;
  const cycleDay = Number(ss.cycle_day || ss.day_number || 1);
  const totalDays = Number(ss.total_days || 14);
  const isFourteen = totalDays >= 14;
  const denom = isFourteen ? 14 : 7;
  const progress = Math.max(0, Math.min(1, cycleDay / denom));

  const onCheckpointTap = (day: number) => {
    if (cycleDay < day) return;
    executeAction(
      { type: "navigate", target: { container_id: "cycle_transitions", state_id: `checkpoint_day_${day}` } },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    );
  };

  const dot7Pos = 7 / denom;
  const dot14Pos = 14 / denom;

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
        {/* Checkpoint dots */}
        <TouchableOpacity
          style={[
            styles.dot,
            { left: `${dot7Pos * 100}%` },
            cycleDay >= 7 ? styles.dotActive : styles.dotPending,
          ]}
          onPress={() => onCheckpointTap(7)}
          activeOpacity={cycleDay >= 7 ? 0.6 : 1}
          disabled={cycleDay < 7}
        />
        {isFourteen && (
          <TouchableOpacity
            style={[
              styles.dot,
              { left: `${dot14Pos * 100}%` },
              cycleDay >= 14 ? styles.dotActive : styles.dotPending,
            ]}
            onPress={() => onCheckpointTap(14)}
            activeOpacity={cycleDay >= 14 ? 0.6 : 1}
            disabled={cycleDay < 14}
          />
        )}
      </View>
      <Text style={styles.meta}>
        Day {cycleDay} of {denom}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 4, marginVertical: 10 },
  track: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#FFF8EF",
    position: "relative",
    marginBottom: 6,
  },
  fill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "#c9a84c",
  },
  dot: {
    position: "absolute",
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: -6,
  },
  dotActive: { backgroundColor: "#c9a84c" },
  dotPending: {
    backgroundColor: "#fffdf9",
    borderWidth: 1,
    borderColor: "#eddeb4",
  },
  meta: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    color: "#8a7a5a",
    textAlign: "right",
    letterSpacing: 0.5,
  },
});

export default CycleSignalBar;
