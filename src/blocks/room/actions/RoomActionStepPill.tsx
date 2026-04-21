/**
 * RoomActionStepPill — in_room_step dispatcher.
 *
 * Step template IDs per §5.4 and beyond: step_breathe_*, step_walk_timer_*,
 * step_sit_ambient_*, step_grounding_*, step_hand_on_heart_*,
 * step_text_input_*, step_journal_*, step_voice_note_*, step_reach_out_*.
 *
 * Stage 2 v1 (2026-04-20): acceptable shortcut per Agent C review — tap
 * shows an Alert stub with the step label + "Done" that dispatches a
 * `room_step_completed` action for telemetry. The actionExecutor already
 * writes a sacred-trace event when step_payload.persistence.writes_event
 * is non-null.
 *
 * v1 stub: the real inline panel (timer, text input, voice note) lands in
 * Phase 6. This stub proves the chip dispatches meaningfully + returns to
 * the room. testID is preserved per BE emission.
 * TODO(Phase 6): replace Alert with inline modal per template_id.
 */

import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

import { executeAction } from "../../../engine/actionExecutor";
import { useScreenStore } from "../../../engine/useScreenBridge";
import type { ActionEnvelope, RoomRenderV1 } from "../types";
import { buildActionCtx } from "./actionContextHelper";

interface Props {
  action: ActionEnvelope;
  index: number;
  envelope?: RoomRenderV1;
}

const RoomActionStepPill: React.FC<Props> = ({ action, envelope }) => {
  const { loadScreen, goBack } = useScreenStore();

  const onPress = () => {
    const templateId = action.step_payload?.template_id ?? "unknown";
    const ctx = buildActionCtx({ loadScreen, goBack });

    const dispatchCompletion = () => {
      executeAction(
        {
          type: "room_step_completed",
          payload: {
            room_id: envelope?.room_id ?? null,
            template_id: templateId,
            action_id: action.action_id,
            analytics_key: action.analytics_key,
            writes_event: action.persistence?.writes_event ?? null,
          },
        } as any,
        ctx,
      ).catch((err) => {
        if (__DEV__) console.warn("[RoomActionStepPill] dispatch failed:", err);
      });
    };

    // v1 stub — proves the chip dispatches and returns to the room.
    // TODO(Phase 6): replace with inline modal panel per step template.
    try {
      Alert.alert(
        action.label || "Step",
        "This step will open an inline panel in Phase 6.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Done", onPress: dispatchCompletion },
        ],
        { cancelable: true },
      );
    } catch {
      // Alert may fail in test harness — still dispatch completion so
      // telemetry fires deterministically.
      dispatchCompletion();
    }
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

export default RoomActionStepPill;
