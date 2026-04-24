/**
 * RoomActionList — iterates `envelope.actions[]` and delegates to sub-components
 * by `action_type`. Renders immediately — no stagger, no animation.
 *
 * Invariant I-1 (§4): exit is always present. This component does not
 * enforce I-1 — that's Agent 5 CI's job. If malformed envelope arrives
 * without exit, we still render what we have; we do not synthesize one.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { ActionEnvelope, RoomRenderV1 } from "./types";
import {
  RoomActionCarryPill,
  RoomActionExitPill,
  RoomActionInquiryPill,
  RoomActionRunnerPill,
  RoomActionStepPill,
  RoomActionTeachingPill,
} from "./actions";
import { ACTION_KIND_LABELS } from "./roomConstants";

interface Props {
  envelope: RoomRenderV1;
}

const RoomActionList: React.FC<Props> = ({ envelope }) => {
  const { actions } = envelope;

  const sortedActions = [...actions].sort((a, b) => {
    const aPrimary = a.primary_recommendation ? 1 : 0;
    const bPrimary = b.primary_recommendation ? 1 : 0;
    if (aPrimary !== bPrimary) return bPrimary - aPrimary;
    if (a.action_type === "exit" && b.action_type !== "exit") return 1;
    if (a.action_type !== "exit" && b.action_type === "exit") return -1;
    return 0;
  });

  return (
    <View style={styles.list} testID="room_action_list">
      {sortedActions.map((action, index) => (
        <View key={action.action_id} style={styles.row}>
          {action.primary_recommendation && index === 0 ? (
            <Text style={styles.startHereLabel}>Start here</Text>
          ) : null}
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
  const kindLabelValue = ACTION_KIND_LABELS[action.action_type];
  const kindLabel = kindLabelValue && kindLabelValue.length > 0 ? kindLabelValue : undefined;

  switch (action.action_type) {
    case "runner_mantra":
    case "runner_sankalp":
    case "runner_practice":
      return (
        <RoomActionRunnerPill action={action} index={index} envelope={envelope} kindLabel={kindLabel} />
      );
    case "teaching":
      return (
        <RoomActionTeachingPill action={action} index={index} envelope={envelope} kindLabel={kindLabel} />
      );
    case "inquiry":
      return (
        <RoomActionInquiryPill action={action} index={index} envelope={envelope} kindLabel={kindLabel} />
      );
    case "in_room_step":
      return (
        <RoomActionStepPill action={action} index={index} envelope={envelope} kindLabel={kindLabel} />
      );
    case "in_room_carry":
      return (
        <RoomActionCarryPill action={action} index={index} envelope={envelope} kindLabel={kindLabel} />
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
  startHereLabel: {
    fontSize: 10,
    color: "#9f9f9f",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
});

export default RoomActionList;
