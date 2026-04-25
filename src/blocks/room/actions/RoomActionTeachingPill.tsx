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
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { executeAction } from "../../../engine/actionExecutor";
import { useScreenStore } from "../../../engine/useScreenBridge";
import type { ActionEnvelope, RoomRenderV1 } from "../types";
import { buildActionCtx } from "./actionContextHelper";

interface Props {
  action: ActionEnvelope;
  index: number;
  envelope?: RoomRenderV1;
  kindLabel?: string;
  isPrimary?: boolean;
}

const RoomActionTeachingPill: React.FC<Props> = ({
  action,
  kindLabel,
  isPrimary = false,
}) => {
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
      style={[styles.pill, isPrimary ? styles.pillPrimary : null]}
      onPress={onPress}
    >
      <View>
        {kindLabel ? <Text style={styles.kindLabel}>{kindLabel}</Text> : null}
        <Text style={styles.label}>{action.label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pill: {
    backgroundColor: "#FBF5F5",
    borderColor: "#9f9f9f",
    borderWidth: 0.3,
    borderRadius: 15,
    padding: 15,
    elevation: 6,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginBottom: 10,
  },
  pillPrimary: {
    borderColor: "#b89674",
    borderWidth: 1.4,
    shadowOpacity: 0.28,
    shadowRadius: 5,
  },
  kindLabel: {
    fontSize: 12,
    color: "#D4A017",
    textAlign: "center",
    marginBottom: 2,
  },
  label: {
    fontSize: 15,
    color: "#432104",
    alignSelf: "center",
    textAlign: "center",
  },
});

export default RoomActionTeachingPill;
