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
import { useTranslation } from "react-i18next";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/fonts";
import { sfs } from "../../utils/responsive";
import RoomActionList from "./RoomActionList";
import RoomOpeningExperience from "./RoomOpeningExperience";
import RoomPrincipleBanner from "./RoomPrincipleBanner";
import RoomGuidedSection from "./RoomGuidedSection";
import RoomJourneyRenderer from "./RoomJourneyRenderer";
import { isJourneyEnabled } from "./roomJourneyConfig";
import { ROOM_LABELS, ROOM_LABELS_HI, ROOM_LABELS_TE } from "@kalpx/contracts";
import { LIFE_CONTEXT_LABELS } from "./roomConstants";
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
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === "hi";
  const isTE = i18n.language === "te";
  const flagOn = _forceFlagOn === true || isFlagOn();

  // HARD GATE: flag off → render nothing. No side effects, no subtree.
  if (!flagOn) return null;

  const roomDisplayName = (isHindi ? ROOM_LABELS_HI : isTE ? ROOM_LABELS_TE : ROOM_LABELS)[envelope.room_id as keyof typeof ROOM_LABELS];
  const lifeContextLabel = envelope.life_context && LIFE_CONTEXT_LABELS[envelope.life_context]
    ? t(LIFE_CONTEXT_LABELS[envelope.life_context])
    : null;
  const ctx = envelope.room_context;
  const isGuided = !!(ctx?.entry_context?.recommended_first_action_id);

  if (isGuided) {
    if (isJourneyEnabled(envelope.room_id)) {
      // No wrapper View — RoomJourneyRenderer owns its own minHeight via useWindowDimensions.
      // A flex:1 wrapper inside the parent ScrollView collapses to 0 and defeats minHeight.
      return <RoomJourneyRenderer envelope={envelope} />;
    }
    return (
      <View style={styles.root} testID={`room_renderer_${envelope.room_id}`}>
        <RoomGuidedSection envelope={envelope} />
      </View>
    );
  }

  return (
    <View style={styles.root} testID={`room_renderer_${envelope.room_id}`}>
      <View style={styles.header}>
        {roomDisplayName ? (
          <Text style={styles.roomName}>{roomDisplayName}</Text>
        ) : null}
        {ctx?.room_purpose_line ? (
          <Text style={styles.roomPurpose}>{ctx.room_purpose_line}</Text>
        ) : null}
        {lifeContextLabel ? (
          <Text style={[styles.lifeContext, isHindi && { letterSpacing: 0 }]}>
            {t("room.youChose", { label: lifeContextLabel })}
          </Text>
        ) : null}
        {ctx?.situation_acknowledgement_line ? (
          <Text style={styles.situationAck} testID="room_situation_ack">
            {ctx.situation_acknowledgement_line}
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
      {ctx?.bridge_line ? (
        <Text style={styles.bridgeLine} testID="room_bridge_line">{ctx.bridge_line}</Text>
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
    fontSize: sfs(18),
    color: "#432104",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 10,
  },
  lifeContext: {
    fontSize: sfs(12),
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
    fontSize: sfs(12),
    color: "#8A7968",
    fontFamily: Fonts.sans.medium,

    lineHeight: 17,
    textAlign: "center",
  },
  whyThisRoom: {
    fontSize: sfs(12),
    color: "#9f9f9f",
    marginTop: 6,
    lineHeight: 17,
    textAlign: "center",
    marginBottom: 10,
  },
  situationAck: {
    fontSize: sfs(14),
    color: "#6B5E4E",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 2,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  roomPurpose: {
    fontSize: sfs(13),
    color: "#8A7968",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 2,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  bridgeLine: {
    fontSize: sfs(13),
    color: "#8A7968",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 19,
    paddingHorizontal: 28,
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
