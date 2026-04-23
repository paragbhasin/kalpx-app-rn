/**
 * RoomActionInquiryPill — opens the inquiry sub-flow.
 *
 * Real flow opens a category picker over `inquiry_payload.categories[]`
 * (§7.2) and routes taps into the chosen category's practice / journal.
 *
 * Phase 6 (2026-04-20): replaced the Alert stub with `<InquiryModal />`.
 * Tap opens the category picker. Category tap emits
 * `room_inquiry_category_selected` telemetry + shows anchor_line +
 * reflective_prompt with two actions:
 *   - "Try a practice" (if suggested_practice_template_id): dispatches
 *     room_step_completed with the target template_id.
 *   - "Journal on this": inline TextInput → dispatches
 *     room_step_completed with template_id "step_journal_inquiry".
 *
 * `room_inquiry_opened` fires on first open (preserved analytics
 * contract). Defensive fallback: if the modal can't mount (test harness),
 * we fall through to the v1 Alert list so telemetry still fires.
 */

import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";

import { executeAction } from "../../../engine/actionExecutor";
import { useScreenStore } from "../../../engine/useScreenBridge";
import type { ActionEnvelope, InquiryCategory, RoomRenderV1 } from "../types";
import { buildActionCtx } from "./actionContextHelper";
import InquiryModal from "./InquiryModal";

interface Props {
  action: ActionEnvelope;
  index: number;
  envelope?: RoomRenderV1;
}

const RoomActionInquiryPill: React.FC<Props> = ({ action, envelope }) => {
  const { loadScreen, goBack } = useScreenStore();
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const dispatchOpened = () => {
    const ctx = buildActionCtx({ loadScreen, goBack });
    const ip = action.inquiry_payload;
    executeAction(
      {
        type: "room_inquiry_opened",
        payload: {
          room_id: envelope?.room_id ?? null,
          action_id: action.action_id,
          analytics_key: action.analytics_key,
          category_count: ip?.categories?.length ?? 0,
        },
      } as any,
      ctx,
    ).catch((err) => {
      if (__DEV__) {
        console.warn("[RoomActionInquiryPill] dispatch failed:", err);
      }
    });
  };

  const dispatchCategorySelected = (category: InquiryCategory) => {
    const ctx = buildActionCtx({ loadScreen, goBack });
    executeAction(
      {
        type: "room_inquiry_category_selected",
        payload: {
          room_id: envelope?.room_id ?? null,
          category_id: category.id,
          action_id: action.action_id,
          analytics_key: action.analytics_key,
        },
      } as any,
      ctx,
    ).catch((err) => {
      if (__DEV__) {
        console.warn(
          "[RoomActionInquiryPill] category-selected dispatch failed:",
          err,
        );
      }
    });
  };

  const dispatchStepFromInquiry = (
    category: InquiryCategory,
    templateId: string,
    extra: Record<string, unknown> = {},
  ) => {
    const ctx = buildActionCtx({ loadScreen, goBack });
    executeAction(
      {
        type: "room_step_completed",
        payload: {
          room_id: envelope?.room_id ?? null,
          template_id: templateId,
          action_id: action.action_id,
          analytics_key: action.analytics_key,
          writes_event: action.persistence?.writes_event ?? null,
          category_id: category.id,
          source: "inquiry",
          ...extra,
        },
      } as any,
      ctx,
    ).catch((err) => {
      if (__DEV__) {
        console.warn(
          "[RoomActionInquiryPill] step-from-inquiry dispatch failed:",
          err,
        );
      }
    });
  };

  const onPress = () => {
    const ip = action.inquiry_payload;
    if (!ip || !Array.isArray(ip.categories) || ip.categories.length === 0) {
      console.warn(
        "[RoomActionInquiryPill] missing inquiry_payload.categories",
        action.action_id,
      );
      return;
    }

    // Primary path — open the Phase 6 modal.
    try {
      setModalVisible(true);
    } catch {
      // Fall back to v1 Alert stub so telemetry still fires.
      const labels = ip.categories
        .map((c) => c.label)
        .slice(0, 8)
        .join("\n");
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
    }
  };

  const handleLaunchPractice = (
    category: InquiryCategory,
    templateId: string,
  ) => {
    setModalVisible(false);
    dispatchStepFromInquiry(category, templateId);
  };

  const handleSubmitJournal = (category: InquiryCategory, text: string) => {
    setModalVisible(false);
    dispatchStepFromInquiry(category, "step_journal_inquiry", { text });
  };

  return (
    <>
      <TouchableOpacity
        testID={action.testID}
        accessibilityRole="button"
        accessibilityLabel={action.label}
        style={styles.pill}
        onPress={onPress}
      >
        <Text style={styles.label}>{action.label}</Text>
      </TouchableOpacity>
      <InquiryModal
        visible={modalVisible}
        label={action.label || "Inquiry"}
        inquiryPayload={action.inquiry_payload}
        onOpened={dispatchOpened}
        onCategorySelected={dispatchCategorySelected}
        onLaunchPractice={handleLaunchPractice}
        onSubmitJournal={handleSubmitJournal}
        onCancel={() => setModalVisible(false)}
      />
    </>
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
  label: {
    fontSize: 15,
    color: "#432104",
    alignSelf: "center",
    textAlign: "center",
  },
});

export default RoomActionInquiryPill;
