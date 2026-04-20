/**
 * RoomPrincipleBanner — L1 wisdom surface (§5.7.1).
 *
 * Scalar render of `envelope.principle_banner`. Never a carousel, never an
 * array, no tap-to-expand inline (I-10). Null self-hides per I-6 sovereignty
 * fallback — no English placeholder leakage.
 *
 * Tap is a no-op stub for now. Future wiring may open WhyThisL2Sheet when
 * the banner is tap-eligible and the pool row has `teaching_eligible=true`.
 */

import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { RoomActionBannerScalar } from "./actions";
import type { PrincipleBanner } from "./types";

interface Props {
  banner: PrincipleBanner | null;
}

const RoomPrincipleBanner: React.FC<Props> = ({ banner }) => {
  // §I-6 sovereignty: null self-hides.
  if (!banner) return null;

  return (
    <TouchableOpacity
      accessibilityRole="text"
      style={styles.wrap}
      activeOpacity={1}
      // Tap-to-expand is a no-op stub. Real behavior lands with L2 teaching
      // wiring in Phase 5.
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onPress={() => {}}
    >
      <View>
        <RoomActionBannerScalar banner={banner} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 4,
  },
});

export default RoomPrincipleBanner;
