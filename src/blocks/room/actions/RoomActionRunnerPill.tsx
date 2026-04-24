/**
 * RoomActionRunnerPill — dispatches start_runner for mantra|sankalp|practice.
 *
 * Stage 2 wiring (2026-04-20): tap dispatches the canonical start_runner
 * action through executeAction. The start_runner handler
 * (actionExecutor.ts:3420+) routes all 3 variants to
 * `cycle_transitions/offering_reveal` — the rich runner surface.
 *
 * Canonical Rich Runner Routing Rule (LOCKED 2026-04-19): the FE must NOT
 * reconstruct the runner payload. The full canonical payload from the BE
 * is passed through as `item` so the rich surface reads the authored shape.
 *
 * Gated at RoomRenderer via EXPO_PUBLIC_MITRA_V3_ROOMS.
 */

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { executeAction } from "../../../engine/actionExecutor";
import { useScreenStore } from "../../../engine/useScreenBridge";
import type { ActionEnvelope, RoomRenderV1 } from "../types";
import { buildActionCtx } from "./actionContextHelper";

// Clean romanized English labels for known anchor mantra item_ids.
// Used when BE has not yet populated display.display_title.
// Expand this map as rooms are verified — key is runner_payload.item_id.
const MANTRA_ANCHOR_LABELS: Record<string, string> = {
  "mantra.om_namo_bhagavate_vasudevaya": "Om Namo Bhagavate Vasudevaya",
  "mantra.maha_mrityunjaya": "Maha Mrityunjaya",
  "mantra.peace_calm.om_namah_shivaya": "Om Namah Shivaya",
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

interface Props {
  action: ActionEnvelope;
  index: number;
  envelope?: RoomRenderV1;
  kindLabel?: string;
  isPrimary?: boolean;
}

const RoomActionRunnerPill: React.FC<Props> = ({ action, envelope, kindLabel, isPrimary = false }) => {
  const { loadScreen, goBack } = useScreenStore();

  const onPress = () => {
    const rp = action.runner_payload;
    if (!rp) {
      console.warn(
        "[RoomActionRunnerPill] missing runner_payload",
        action.action_id,
      );
      return;
    }
    const ctx = buildActionCtx({ loadScreen, goBack });
    // Stamp room source + room_id so complete_runner / return_to_source
    // route back to this room rather than the dashboard.
    if (envelope?.room_id) {
      ctx.setScreenValue(envelope.room_id, "room_id");
    }
    executeAction(
      {
        type: "start_runner",
        payload: {
          source: rp.runner_source,
          variant: rp.runner_kind,
          target_reps: rp.reps_default_selection ?? rp.reps_target ?? undefined,
          // Pass the full canonical payload verbatim — the rich runner
          // surface reads this as `info` / `runner_active_item`. FE must
          // NOT reconstruct.
          item: rp,
        },
      } as any,
      ctx,
    ).catch((err) => {
      if (__DEV__) console.warn("[RoomActionRunnerPill] dispatch failed:", err);
    });
  };

  const isMantra = action.action_type === "runner_mantra";
  const itemId = action.runner_payload?.item_id ?? "";
  const rawTitle = action.runner_payload?.title ?? action.label;
  const displayTitle = action.display?.display_title ?? null;
  const mapLabel = MANTRA_ANCHOR_LABELS[itemId] ?? null;

  // Label priority: BE display_title > map label > raw runner title.
  const mainLabel = isMantra
    ? (displayTitle ?? mapLabel ?? rawTitle)
    : action.label;

  // Transliteration: only shown when it adds new information (different from mainLabel after normalization).
  const transliteration = isMantra && normalize(rawTitle) !== normalize(mainLabel)
    ? rawTitle
    : null;

  const displaySubtitle = isMantra ? (action.display?.display_subtitle ?? null) : null;

  // why_for_you: FE-ready slot — renders on primary action only when BE starts populating display.why_for_you.
  const whyForYou = isPrimary ? (action.display?.why_for_you ?? null) : null;

  return (
    <TouchableOpacity
      testID={action.testID}
      accessibilityRole="button"
      accessibilityLabel={action.label}
      style={[styles.pill, isPrimary ? styles.pillPrimary : null]}
      onPress={onPress}
    >
      <View style={styles.inner}>
        <View>
          {kindLabel ? <Text style={styles.kindLabel}>{kindLabel}</Text> : null}
          <Text style={styles.label}>{mainLabel}</Text>
          {transliteration ? (
            <Text style={styles.transliteration}>{transliteration}</Text>
          ) : null}
          {displaySubtitle ? (
            <Text style={styles.displaySubtitle}>{displaySubtitle}</Text>
          ) : null}
          {whyForYou ? (
            <Text style={styles.whyForYou}>{whyForYou}</Text>
          ) : null}
        </View>
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
    marginBottom: 10,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  pillPrimary: {
    borderColor: "#b89674",
    borderWidth: 1.4,
    shadowOpacity: 0.28,
    shadowRadius: 5,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  kindLabel: {
    fontSize: 10,
    color: "#9f9f9f",
    textAlign: "center",
    marginBottom: 2,
  },
  label: {
    fontSize: 15,
    color: "#432104",
    alignSelf: "center",
    textAlign: "center",
  },
  transliteration: {
    fontSize: 12,
    color: "#9f9f9f",
    textAlign: "center",
    marginTop: 3,
  },
  displaySubtitle: {
    fontSize: 11,
    color: "#b0b0b0",
    textAlign: "center",
    marginTop: 2,
  },
  whyForYou: {
    fontSize: 11,
    color: "#8A7968",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 5,
  },
});

export default RoomActionRunnerPill;
