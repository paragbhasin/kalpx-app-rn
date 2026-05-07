/**
 * RoomPrincipleBanner — L1 wisdom surface (§5.7.1).
 *
 * Scalar render of `envelope.principle_banner`. Never a carousel, never an
 * array, no tap-to-expand inline (I-10). Null self-hides per I-6 sovereignty
 * fallback — no English placeholder leakage.
 *
 * Tap opens WhyThisL2Sheet via open_why_this_l2 dispatch. Curated path
 * dispatches curated_content; legacy path fetches via principle_id.
 * Tap is suppressed when room_why_this_state.shouldSuppressTap=true
 * (curated_fallback mode — no valid selection was made).
 */

import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import { executeAction } from "../../engine/actionExecutor";
import { useScreenStore } from "../../engine/useScreenBridge";
import { RoomActionBannerScalar } from "./actions";
import { buildActionCtx } from "./actions/actionContextHelper";
import type { PrincipleBanner } from "./types";
import type { RoomWhyThisState } from "@kalpx/contracts";

interface Props {
  banner: PrincipleBanner | null;
}

const RoomPrincipleBanner: React.FC<Props> = ({ banner }) => {
  const { screenData, loadScreen, goBack } = useScreenStore();

  if (!banner) return null;

  const whyThisState = (screenData as any)?.room_why_this_state as
    | RoomWhyThisState
    | undefined;
  const shouldSuppressTap = whyThisState?.shouldSuppressTap === true;
  const isCuratedSuccess = whyThisState?.mode === "curated_success";
  const cardLabel = isCuratedSuccess
    ? (whyThisState!.selectedItem?.short_label ?? undefined)
    : undefined;

  const onPress = () => {
    const ctx = buildActionCtx({ loadScreen, goBack });
    if (isCuratedSuccess && whyThisState?.selectedItem) {
      executeAction(
        {
          type: "open_why_this_l2",
          payload: { curated_content: whyThisState.selectedItem },
        } as any,
        ctx,
      ).catch(() => {});
    } else {
      ctx.setScreenValue(
        {
          id: banner.principle_id,
          name: banner.principle_name,
          principle_name: banner.principle_name,
          body: banner.wisdom_anchor_line,
          essence: banner.wisdom_anchor_line,
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
    }
  };

  const inner = (
    <View>
      <RoomActionBannerScalar banner={banner} cardLabel={cardLabel} />
    </View>
  );

  if (shouldSuppressTap) {
    return <View style={styles.wrap}>{inner}</View>;
  }

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="View wisdom"
      style={styles.wrap}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {inner}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 4,
  },
});

export default RoomPrincipleBanner;
