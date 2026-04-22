/**
 * RoomPrincipleBanner — L1 wisdom surface (§5.7.1).
 *
 * Scalar render of `envelope.principle_banner`. Never a carousel, never an
 * array, no tap-to-expand inline (I-10). Null self-hides per I-6 sovereignty
 * fallback — no English placeholder leakage.
 *
 * Tap opens WhyThisL2Sheet via open_why_this_l2 dispatch. wisdom_anchor_line
 * is stamped as the immediate body placeholder; the handler overwrites with
 * a full principle fetch using principle_id.
 */

import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { executeAction } from "../../engine/actionExecutor";
import { useScreenStore } from "../../engine/useScreenBridge";
import { RoomActionBannerScalar } from "./actions";
import { buildActionCtx } from "./actions/actionContextHelper";
import type { PrincipleBanner } from "./types";

interface Props {
  banner: PrincipleBanner | null;
}

const RoomPrincipleBanner: React.FC<Props> = ({ banner }) => {
  const { loadScreen, goBack } = useScreenStore();

  // §I-6 sovereignty: null self-hides.
  if (!banner) return null;

  const onPress = () => {
    const ctx = buildActionCtx({ loadScreen, goBack });
    // Stamp wisdom_anchor_line as placeholder body so the sheet renders
    // immediately while the handler fetches the full principle body.
    ctx.setScreenValue(
      {
        id: banner.principle_id,
        name: banner.principle_name,
        principle_name: banner.principle_name,
        body: banner.wisdom_anchor_line,
        sources: [],
      },
      "why_this_principle",
    );
    executeAction(
      {
        type: "open_why_this_l2",
        payload: { principle_id: banner.principle_id },
      } as any,
      ctx,
    ).catch(() => {});
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="View wisdom"
      style={styles.wrap}
      activeOpacity={0.7}
      onPress={onPress}
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
