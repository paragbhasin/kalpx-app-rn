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
import { Image, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../theme/colors";

import RoomActionList from "./RoomActionList";
import RoomOpeningExperience from "./RoomOpeningExperience";
import RoomPrincipleBanner from "./RoomPrincipleBanner";
import { LIFE_CONTEXT_LABELS, ROOM_DISPLAY_NAMES } from "./roomConstants";
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

  const roomDisplayName = ROOM_DISPLAY_NAMES[envelope.room_id];
  const lifeContextLabel = envelope.life_context
    ? LIFE_CONTEXT_LABELS[envelope.life_context]
    : null;
  const ctx = envelope.room_context;

  return (
    <View style={styles.root} testID={`room_renderer_${envelope.room_id}`}>
      <View style={styles.header}>
        {roomDisplayName ? (
          <Text style={styles.roomName}>{roomDisplayName}</Text>
        ) : null}
        {lifeContextLabel ? (
          <Text style={styles.lifeContext}>
            {"You chose: " + lifeContextLabel}
          </Text>
        ) : null}
        {ctx?.sanatan_insight_line ? (
          <View style={styles.sanatanInsightRow}>
            <View style={styles.sanatanAccent} />
            <Text style={styles.sanatanInsight}>
              {ctx.sanatan_insight_line}
            </Text>
          </View>
        ) : null}
        <View style={styles.lotusDivider}>
          <View style={styles.dividerLine} />
          <Image
            source={require("../../../assets/lotus_icon.png")}
            style={styles.lotusIcon}
          />
          <View style={styles.dividerLine} />
        </View>
        {ctx?.why_this_room_line ? (
          <Text style={styles.whyThisRoom}>{ctx.why_this_room_line}</Text>
        ) : null}
      </View>
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  roomName: {
    fontSize: 18,
    color: "#432104",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 10,
  },
  lifeContext: {
    fontSize: 12,
    color: "#9f9f9f",
    marginTop: 2,
    textAlign: "center",
  },
  sanatanInsightRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    marginBottom: 2,
  },
  sanatanAccent: {
    width: 2,
    alignSelf: "stretch",
    backgroundColor: "#c8b49a",
    marginRight: 8,
    borderRadius: 1,
  },
  sanatanInsight: {
    flex: 1,
    fontSize: 12,
    color: "#8A7968",
    fontStyle: "italic",
    lineHeight: 17,
    textAlign: "center",
  },
  whyThisRoom: {
    fontSize: 12,
    color: "#9f9f9f",
    marginTop: 6,
    lineHeight: 17,
    textAlign: "center",
    marginBottom: 10,
  },
  lotusDivider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.goldHairline,
    opacity: 0.4,
  },
  lotusIcon: {
    width: 20,
    height: 16,
    marginHorizontal: 12,
    tintColor: Colors.gold,
    opacity: 0.6,
  },
});

export default RoomRenderer;
