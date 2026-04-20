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
      <Text style={styles.line}>{banner.wisdom_anchor_line}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  line: {
    fontSize: 14,
    lineHeight: 20,
    color: "#4A4A4A",
    fontStyle: "italic",
    textAlign: "center",
  },
});

export default RoomActionBannerScalar;
