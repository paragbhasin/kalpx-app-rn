/**
 * RoomActionList — iterates `envelope.actions[]` and delegates to sub-components
 * by `action_type`. Renders immediately — no stagger, no animation.
 *
 * Invariant I-1 (§4): exit is always present. This component does not
 * enforce I-1 — that's Agent 5 CI's job. If malformed envelope arrives
 * without exit, we still render what we have; we do not synthesize one.
 */

import React from "react";
import { StyleSheet, View } from "react-native";

import type { ActionEnvelope, RoomRenderV1 } from "./types";
import {
  RoomActionCarryPill,
  RoomActionExitPill,
  RoomActionInquiryPill,
  RoomActionRunnerPill,
  RoomActionStepPill,
  RoomActionTeachingPill,
} from "./actions";

interface Props {
  envelope: RoomRenderV1;
}

const RoomActionList: React.FC<Props> = ({ envelope }) => {
  const { actions } = envelope;

  return (
    <View style={styles.list} testID="room_action_list">
      {actions.map((action, index) => (
        <View key={action.action_id} style={styles.row}>
          {renderActionComponent(action, index, envelope)}
        </View>
      ))}
    </View>
  );
};

function renderActionComponent(
  action: ActionEnvelope,
  index: number,
  envelope: RoomRenderV1,
) {
  switch (action.action_type) {
    case "runner_mantra":
    case "runner_sankalp":
    case "runner_practice":
      return (
        <RoomActionRunnerPill action={action} index={index} envelope={envelope} />
      );
    case "teaching":
      return (
        <RoomActionTeachingPill action={action} index={index} envelope={envelope} />
      );
    case "inquiry":
      return (
        <RoomActionInquiryPill action={action} index={index} envelope={envelope} />
      );
    case "in_room_step":
      return (
        <RoomActionStepPill action={action} index={index} envelope={envelope} />
      );
    case "in_room_carry":
      return (
        <RoomActionCarryPill action={action} index={index} envelope={envelope} />
      );
    case "exit":
      return (
        <RoomActionExitPill action={action} index={index} envelope={envelope} />
      );
    default:
      // Unknown action_type — self-hide per sovereignty fallback (§I-6).
      if (__DEV__) {
        console.warn(`[RoomActionList] unknown action_type "${action.action_type}" — action silently skipped`);
      }
      return null;
  }
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  row: {
    width: "100%",
  },
});

export default RoomActionList;
