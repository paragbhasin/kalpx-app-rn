/**
 * RoomActionRunnerPill — dispatches start_runner for mantra|sankalp|practice.
 *
 * Stage 2 wiring (2026-04-20): tap dispatches the canonical start_runner
 * action through executeAction. The start_runner handler
 * (actionExecutor.ts:3420+) routes all 3 variants to
 * `cycle_transitions/offering_reveal` — the rich runner surface.
 *
 * Canonical Rich Runner Routing Rule (LOCKED 2026-04-19): the FE must NOT
 * reconstruct the runner payload. The full canonical payload from the BE
 * is passed through as `item` so the rich surface reads the authored shape.
 *
 * Gated at RoomRenderer via EXPO_PUBLIC_MITRA_V3_ROOMS.
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { executeAction } from "../../../engine/actionExecutor";
import { useScreenStore } from "../../../engine/useScreenBridge";
import type { ActionEnvelope, RoomRenderV1 } from "../types";
import { buildActionCtx } from "./actionContextHelper";

interface Props {
  action: ActionEnvelope;
  index: number;
  envelope?: RoomRenderV1;
}

const RoomActionRunnerPill: React.FC<Props> = ({ action, envelope }) => {
  const { loadScreen, goBack } = useScreenStore();

  const onPress = () => {
    const rp = action.runner_payload;
    if (!rp) {
      console.warn("[RoomActionRunnerPill] missing runner_payload", action.action_id);
      return;
    }
    const ctx = buildActionCtx({ loadScreen, goBack });
    // Stamp room source + room_id so complete_runner / return_to_source
    // route back to this room rather than the dashboard.
    if (envelope?.room_id) {
      ctx.setScreenValue(envelope.room_id, "room_id");
    }
    executeAction(
      {
        type: "start_runner",
        payload: {
          source: rp.runner_source,
          variant: rp.runner_kind,
          target_reps: rp.reps_default_selection ?? rp.reps_target ?? undefined,
          // Pass the full canonical payload verbatim — the rich runner
          // surface reads this as `info` / `runner_active_item`. FE must
          // NOT reconstruct.
          item: rp,
        },
      } as any,
      ctx,
    ).catch((err) => {
      if (__DEV__) console.warn("[RoomActionRunnerPill] dispatch failed:", err);
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
