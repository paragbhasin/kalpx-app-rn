/**
 * RoomActionTeachingPill — opens WhyThisL2Sheet overlay from the
 * `teaching_payload` authored by the BE.
 *
 * Stage 2 wiring (2026-04-20): tap stamps teaching_payload into screenData
 * under `why_this_principle` (the key WhyThisL2Sheet reads from), then
 * dispatches `open_why_this_l2`. The open_why_this_l2 handler
 * (actionExecutor.ts:4670+) will overwrite with a fresh BE fetch when
 * principle_id is provided; we pass principle_id so that path runs too.
 *
 * Gated at RoomRenderer via EXPO_PUBLIC_MITRA_V3_ROOMS.
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

const RoomActionTeachingPill: React.FC<Props> = ({ action }) => {
  const { loadScreen, goBack } = useScreenStore();

  const onPress = () => {
    const tp = action.teaching_payload;
    if (!tp) {
      console.warn(
        "[RoomActionTeachingPill] missing teaching_payload",
        action.action_id,
      );
      return;
    }
    const ctx = buildActionCtx({ loadScreen, goBack });
    // WhyThisL2Sheet reads screenData.why_this_principle. Stamp the BE
    // payload first so the overlay has content to render immediately —
    // the open_why_this_l2 handler then overwrites with the authoritative
    // fetch via principle_id.
    ctx.setScreenValue(
      {
        id: tp.principle_id,
        name: tp.principle_name,
        principle_name: tp.principle_name,
        body: tp.body,
        // WhyThisL2Sheet renders p.essence — map body here so the teaching
        // text is visible even when WisdomPrinciple has no row for this asset.
        essence: tp.body,
        sources: tp.sources,
      },
      "why_this_principle",
    );
    executeAction(
      {
        type: "open_why_this_l2",
        payload: { principle_id: tp.principle_id },
      } as any,
      ctx,
    ).catch((err) => {
      if (__DEV__) {
        console.warn("[RoomActionTeachingPill] dispatch failed:", err);
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

export default RoomActionTeachingPill;
