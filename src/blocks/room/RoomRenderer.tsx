/**
 * RoomRenderer — top-level entry for v3.1 room renders.
 *
 * FEATURE FLAG DISCIPLINE (READ BEFORE EDITING):
 *   - Default OFF. Returns null unless `EXPO_PUBLIC_MITRA_V3_ROOMS === "1"`.
 *   - Per-room flip happens in Phase 6 (joy → growth → clarity → stillness →
 *     connection → release). Each behind flag for 1 week of parallel run.
 *   - The flag MUST NOT be flipped until per-room canonical
 *     SURFACE_INTERACTION_POLICY entries exist on BE (§5.7.7) AND
 *     Agent A signs off.
 *
 * This scaffolding does NOT call any network endpoint. Phase 5 BE endpoints
 * (`/rooms/{id}/render/`, canonical runner resolver) are not ready yet.
 * Envelopes are assumed to be passed in fully-hydrated by the caller when
 * this component finally mounts under flag-on conditions.
 *
 * Render order per §6 + §5.7.1:
 *   RoomOpeningExperience → (optional) RoomPrincipleBanner → RoomActionList
 *
 * Invariant I-1 safeguard: if envelope.actions[] is empty or lacks an exit,
 * we still render whatever is present. We do NOT synthesize a missing exit;
 * Agent 5 CI catches malformed envelopes pre-deploy. At runtime, the caller
 * is responsible for navigation fallback.
 */

import React, { useEffect, useState } from "react";
import { AccessibilityInfo, StyleSheet, View } from "react-native";

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

  const [reduceMotion, setReduceMotion] = useState<boolean>(false);
  const [actionsRevealed, setActionsRevealed] = useState<boolean>(false);

  useEffect(() => {
    if (!flagOn) return;
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (active) setReduceMotion(Boolean(value));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [flagOn]);

  // HARD GATE: flag off → render nothing. No side effects, no subtree.
  if (!flagOn) return null;

  return (
    <View style={styles.root} testID={`room_renderer_${envelope.room_id}`}>
      <RoomOpeningExperience
        envelope={envelope}
        onReveal={() => setActionsRevealed(true)}
        _forceReduceMotion={_forceFlagOn ? reduceMotion : undefined}
      />
      {envelope.principle_banner ? (
        <RoomPrincipleBanner banner={envelope.principle_banner} />
      ) : null}
      {actionsRevealed ? (
        <RoomActionList envelope={envelope} reduceMotion={reduceMotion} />
      ) : (
        // Pre-reveal: actions not yet shown. In production the BE hydrates
        // envelope.actions in parallel while opening plays; by the time
        // onReveal fires, actions are ready.
        <View testID="room_action_list_pending" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default RoomRenderer;
