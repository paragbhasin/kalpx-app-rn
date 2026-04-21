/**
 * RoomActionList — iterates `envelope.actions[]` and delegates to sub-components
 * by `action_type`. Honors reveal stagger per `pacing_ms.pills_reveal_stagger`.
 *
 * Stub behavior: reveal delay is computed but no animation driver is wired
 * yet (scaffolding). When flag flips, RoomRenderer mounts this only under
 * EXPO_PUBLIC_MITRA_V3_ROOMS === "1".
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
  reduceMotion: boolean;
}

const RoomActionList: React.FC<Props> = ({ envelope, reduceMotion }) => {
  const { actions, opening_experience } = envelope;
  const stagger = opening_experience.pacing_ms.pills_reveal_stagger;

  return (
    <View style={styles.list} testID="room_action_list">
      {actions.map((action, index) => {
        // staggerDelay reserved for future animation driver.
        // When reduceMotion=true, stagger collapses to 0 and we rely on
        // opacity-only fades per §6 accessibility invariants.
        const _staggerDelay = reduceMotion ? 0 : index * stagger;
        void _staggerDelay;
        return (
          <View key={action.action_id} style={styles.row}>
            {renderActionComponent(action, index, envelope)}
          </View>
        );
      })}
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
    case "carry":
      return (
        <RoomActionCarryPill action={action} index={index} envelope={envelope} />
      );
    case "exit":
      return (
        <RoomActionExitPill action={action} index={index} envelope={envelope} />
      );
    default:
      // Unknown action_type — self-hide per sovereignty fallback (§I-6).
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
