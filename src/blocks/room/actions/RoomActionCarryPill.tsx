/**
 * RoomActionCarryPill — writes a sacred-trace event for carry actions.
 *
 * Event names per §Contract 6: joy_carry, joy_named, release_voice_note,
 * connection_named, connection_reach_out, growth_journal, stillness_named,
 * clarity_journal.
 *
 * Stage 2 wiring (2026-04-20): mirrors the existing carry_joy_forward
 * pattern in actionExecutor.ts — stamps a session-scoped trace in Redux
 * (visible for the current session + same calendar day) and fires
 * telemetry. BE sacred-write endpoint is Phase 4 work; this falls back to
 * Redux-only + telemetry until then.
 *
 * The tap returns the user to the room per INLINE_STEP contract — no nav.
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

const RoomActionCarryPill: React.FC<Props> = ({ action, envelope }) => {
  const { loadScreen, goBack } = useScreenStore();

  const onPress = () => {
    const ctx = buildActionCtx({ loadScreen, goBack });
    const writesEvent =
      action.carry_payload?.writes_event ??
      action.persistence?.writes_event ??
      "joy_carry";

    // Redux-only session trace — mirrors carry_joy_forward pattern.
    // TODO(Phase 4): POST sacred-write endpoint once BE ships.
    ctx.setScreenValue(
      {
        captured_at: Date.now(),
        label: action.label,
        room_id: envelope?.room_id ?? null,
        writes_event: writesEvent,
      },
      // Bucket by event_type so the dashboard carry-chip can read it by key.
      writesEvent,
    );

    executeAction(
      {
        type: "room_carry_captured",
        payload: {
          room_id: envelope?.room_id ?? null,
          writes_event: writesEvent,
          label: action.label,
          analytics_key: action.analytics_key,
        },
      } as any,
      ctx,
    ).catch((err) => {
      if (__DEV__) {
        console.warn("[RoomActionCarryPill] dispatch failed:", err);
      }
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
