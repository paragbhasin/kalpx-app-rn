/**
 * RoomRenderer — top-level entry for v3.1 canonical rooms.
 *
 * FEATURE FLAG DISCIPLINE (READ BEFORE EDITING):
 *   - Default OFF. Returns null unless `EXPO_PUBLIC_MITRA_V3_ROOMS === "1"`.
 *   - Per-room flip happens in Phase 6 (joy → growth → clarity → stillness →
 *     connection → release). Each behind flag for 1 week of parallel run.
 *
 * Render order: RoomOpeningExperience → (optional) RoomPrincipleBanner → RoomActionList.
 * All surfaces render immediately — no phase gating, no animation delay.
 *
 * Invariant I-1: if envelope.actions[] is empty or lacks an exit, we still
 * render what is present. We do NOT synthesize a missing exit.
 */

import React from "react";
import { StyleSheet, View } from "react-native";

import RoomActionList from "./RoomActionList";
import RoomOpeningExperience from "./RoomOpeningExperience";
import RoomPrincipleBanner from "./RoomPrincipleBanner";
import type { RoomRendererProps } from "./types";

function isFlagOn(): boolean {
  // Read from process.env at call time so bundled string replacement wins.
  // Expo inlines `process.env.EXPO_PUBLIC_*` at build time.
  return process.env.EXPO_PUBLIC_MITRA_V3_ROOMS === "1";
}

const RoomRenderer: React.FC<RoomRendererProps> = ({
  envelope,
  _forceFlagOn,
}) => {
  const flagOn = _forceFlagOn === true || isFlagOn();

  // HARD GATE: flag off → render nothing. No side effects, no subtree.
  if (!flagOn) return null;

  return (
    <View style={styles.root} testID={`room_renderer_${envelope.room_id}`}>
      <RoomOpeningExperience envelope={envelope} />
      {envelope.principle_banner ? (
        <RoomPrincipleBanner banner={envelope.principle_banner} />
      ) : null}
      <RoomActionList envelope={envelope} />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default RoomRenderer;
