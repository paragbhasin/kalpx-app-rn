/**
 * RoomActionExitPill — dispatches room_exit for the canonical v3.1 rooms.
 *
 * Per invariant I-1: every RoomRenderV1 includes exactly one exit action.
 * Per §10: exit is NEVER network-gated — always renders even when the rest
 * of the envelope fails hydration.
 *
 * Stage 2 wiring (2026-04-20): tap dispatches `room_exit` through
 * executeAction, which navigates back to the dashboard + fires the
 * room_exit_dispatched telemetry event.
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

import { executeAction } from "../../../engine/actionExecutor";
import { useScreenStore } from "../../../engine/useScreenBridge";
import type { ActionEnvelope, RoomRenderV1 } from "../types";
import { buildActionCtx } from "./actionContextHelper";

interface Props {
  action: ActionEnvelope;
  index: number;
  envelope?: RoomRenderV1;
}

const RoomActionExitPill: React.FC<Props> = ({ action, envelope }) => {
  const { loadScreen, goBack } = useScreenStore();

  const onPress = () => {
    const ctx = buildActionCtx({ loadScreen, goBack });
    const roomId = envelope?.room_id;
    executeAction(
      {
        type: "room_exit",
        payload: { room_id: roomId || null },
      } as any,
      ctx,
    ).catch((err) => {
      if (__DEV__) console.warn("[RoomActionExitPill] dispatch failed:", err);
    });
  };

  return (
    <TouchableOpacity
      testID={action.testID}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      onPress={onPress}
    >
      <Text style={styles.label}>{action.label || "I'll go now"}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Approach: hairline-bordered pill that matches step/runner pill geometry
  // (paddingHorizontal 16, borderRadius 24) for spatial consistency, but uses
  // a quieter border (#E8E8E8 vs #D8D8D8) + muted label color so "exit" reads
  // as a calm stepping-out affordance rather than a primary chip. Padding
  // vertical raised 12 → 14 and minHeight 44 added to meet iOS HIG 44pt tap
  // target (prev 12pad + 15pt text ≈ 39pt).
  pill: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E8E8E8",
    marginVertical: 4,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    marginVertical: 4,
    fontSize: 15,
    color: "#432104",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    textDecorationLine: "underline",
  },
});

export default RoomActionExitPill;
