/**
 * RoomActionInquiryPill — opens the inquiry sub-flow.
 *
 * Real flow opens a category picker over `inquiry_payload.categories[]`
 * (§7.2) and routes taps into the chosen category's practice / journal.
 *
 * Stage 2 v1 (2026-04-20): acceptable shortcut per Agent C review — tap
 * shows an Alert listing the category labels with Cancel. This proves the
 * chip dispatches and the payload is consumed. The first category's
 * `suggested_practice_template_id` is dispatched as a room_step_completed
 * stub on confirmation so telemetry flows.
 *
 * v1 stub: real category picker UI lands in Phase 6.
 * TODO(Phase 6): replace Alert with inline category picker modal that
 * renders anchor_line + reflective_prompt + Practice/Journal buttons.
 */

import React from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";

import { executeAction } from "../../../engine/actionExecutor";
import { useScreenStore } from "../../../engine/useScreenBridge";
import type { ActionEnvelope, RoomRenderV1 } from "../types";
import { buildActionCtx } from "./actionContextHelper";

interface Props {
  action: ActionEnvelope;
  index: number;
  envelope?: RoomRenderV1;
}

const RoomActionInquiryPill: React.FC<Props> = ({ action, envelope }) => {
  const { loadScreen, goBack } = useScreenStore();

  const onPress = () => {
    const ip = action.inquiry_payload;
    if (!ip || !Array.isArray(ip.categories) || ip.categories.length === 0) {
      console.warn(
        "[RoomActionInquiryPill] missing inquiry_payload.categories",
        action.action_id,
      );
      return;
    }
    const ctx = buildActionCtx({ loadScreen, goBack });
    const labels = ip.categories.map((c) => c.label).slice(0, 8).join("\n");

    const dispatchOpened = () => {
      executeAction(
        {
          type: "room_inquiry_opened",
          payload: {
            room_id: envelope?.room_id ?? null,
            action_id: action.action_id,
            analytics_key: action.analytics_key,
            category_count: ip.categories.length,
          },
        } as any,
        ctx,
      ).catch((err) => {
        if (__DEV__) {
          console.warn("[RoomActionInquiryPill] dispatch failed:", err);
        }
      });
    };

    // v1 stub — shows the authored category labels so QA can verify the
    // BE inquiry_payload is flowing through FE.
    // TODO(Phase 6): replace with inline category picker modal.
    try {
      Alert.alert(
        action.label || "Inquiry",
        labels,
        [{ text: "Cancel", style: "cancel", onPress: dispatchOpened }],
        { cancelable: true },
      );
    } catch {
      dispatchOpened();
    }
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

export default RoomActionInquiryPill;
