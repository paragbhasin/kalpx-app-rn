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
    marginVertical: 4,
  },
  label: {
    fontSize: 15,
    color: "#6E6E73",
  },
});

export default RoomActionExitPill;
