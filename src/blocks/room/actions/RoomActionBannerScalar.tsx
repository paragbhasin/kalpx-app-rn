/**
 * RoomActionBannerScalar — NOT a pill.
 *
 * Thin scalar renderer consumed by RoomPrincipleBanner (§5.7.1 L1). Kept in
 * the actions/ folder for co-location with action sub-components, but this
 * component is NOT action-typed — it has no action_id, no analytics_key,
 * no provenance. It only renders a `PrincipleBanner` scalar line.
 *
 * Per §5.7.2 I-10, banners are never carousels. A single scalar object in,
 * one line of text out.
 */

import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { PrincipleBanner } from "../types";

interface Props {
  banner: PrincipleBanner;
  testID?: string;
}

const RoomActionBannerScalar: React.FC<Props> = ({ banner, testID }) => {
  return (
    <View style={styles.wrap} testID={testID ?? "room_principle_banner"}>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>{"A teaching for you"}</Text>
        <Text style={styles.line}>{banner.wisdom_anchor_line}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#FAF6F0",
    borderColor: "#E8D8C4",
    borderWidth: 0.5,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  cardLabel: {
    fontSize: 11,
    color: "#9f9f9f",
    marginBottom: 4,
  },
  line: {
    fontSize: 16,
    lineHeight: 22,
    color: "#4A4A4A",
    textAlign: "left",
  },
});

export default RoomActionBannerScalar;
