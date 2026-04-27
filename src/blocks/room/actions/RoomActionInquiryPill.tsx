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
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import api from "../../../Networks/axios";
import { executeAction } from "../../../engine/actionExecutor";
import { useScreenStore } from "../../../engine/useScreenBridge";
import type { ActionEnvelope, InquiryCategory, RoomRenderV1, StepPayload } from "../types";
import { buildActionCtx } from "./actionContextHelper";
import InquiryModal from "./InquiryModal";
import StepModal, { type StepModalResult } from "./StepModal";

interface Props {
  action: ActionEnvelope;
  index: number;
  envelope?: RoomRenderV1;
  kindLabel?: string;
  isPrimary?: boolean;
}

const RoomActionInquiryPill: React.FC<Props> = ({
  action,
  envelope,
  kindLabel,
  isPrimary = false,
}) => {
  const { loadScreen, goBack, screenData } = useScreenStore();
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [stepModalVisible, setStepModalVisible] = useState<boolean>(false);
  const [stepModalPayload, setStepModalPayload] = useState<StepPayload | null>(null);
  const [stepModalLabel, setStepModalLabel] = useState<string>("");
  const [pendingCategory, setPendingCategory] = useState<InquiryCategory | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const fireSacredPost = (writesEvent: string, text: string) => {
    const roomId = envelope?.room_id ?? null;
    if (!roomId) return;
    api
      .post(`mitra/rooms/${roomId}/sacred/`, {
        writes_event: writesEvent,
        label: action.label,
        action_id: action.action_id,
        analytics_key: action.analytics_key,
        captured_at: Date.now(),
        text,
        life_context: envelope?.life_context ?? null,
        journey_id: (screenData as any)?.journey_id ?? null,
        day_number: (screenData as any)?.day_number ?? null,
        source_surface: "inquiry",
      })
      .catch((err: any) => {
        if (__DEV__) {
          console.warn(
            "[RoomActionInquiryPill] sacred POST failed (non-blocking):",
            err?.response?.status || err?.message,
          );
        }
      });
  };

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
      if (__DEV__) {
        console.warn(
          "[RoomActionInquiryPill] missing inquiry_payload.categories",
          action.action_id,
        );
      }
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
    setPendingCategory(category);
    const durationMatch = templateId.match(/_(\d+)min$/);
    const duration_sec = durationMatch ? parseInt(durationMatch[1], 10) * 60 : null;
    const practicePrompt = category.reflective_prompt || category.prompt || null;
    setStepModalPayload({
      template_id: templateId,
      step_config: {},
      input_slots: [],
      duration_sec,
      memory_modal: practicePrompt
        ? {
            title: category.suggested_practice_label || category.practice_label || undefined,
            prompt: practicePrompt,
            placeholder: "Write what comes...",
            primary_label: "Done",
          }
        : null,
    });
    setStepModalLabel(
      category.suggested_practice_label || category.practice_label || category.label || templateId,
    );
    setStepModalVisible(true);
  };

  const handleSubmitJournal = (category: InquiryCategory, text: string) => {
    setModalVisible(false);
    dispatchStepFromInquiry(category, "step_journal_inquiry", { text });
    const writesEvent = action.persistence?.writes_event ?? null;
    if (text.trim().length > 0 && writesEvent) {
      fireSacredPost(writesEvent, text.trim());
    }
    setConfirmed(true);
  };

  const handleStepDone = (extra: StepModalResult) => {
    setStepModalVisible(false);
    if (!pendingCategory || !stepModalPayload) return;
    dispatchStepFromInquiry(
      pendingCategory,
      stepModalPayload.template_id as string,
      extra.text ? { text: extra.text } : {},
    );
    setStepModalPayload(null);
    setPendingCategory(null);
    setConfirmed(true);
  };

  return (
    <>
      {confirmed ? (
        <View style={[styles.pill, isPrimary ? styles.pillPrimary : null]}>
          {kindLabel ? <Text style={styles.kindLabel}>{kindLabel}</Text> : null}
          <Text style={styles.confirmedText}>Noted.</Text>
        </View>
      ) : (
        <TouchableOpacity
          testID={action.testID}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={[styles.pill, isPrimary ? styles.pillPrimary : null]}
          onPress={onPress}
        >
          <View>
            {kindLabel ? <Text style={styles.kindLabel}>{kindLabel}</Text> : null}
            <Text style={styles.label}>{action.label}</Text>
            {action.helper_line ? (
              <Text style={styles.helperLine} numberOfLines={1} ellipsizeMode="tail">
                {action.helper_line}
              </Text>
            ) : null}
          </View>
        </TouchableOpacity>
      )}
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
      <StepModal
        visible={stepModalVisible}
        stepPayload={stepModalPayload}
        label={stepModalLabel}
        onCancel={() => {
          setStepModalVisible(false);
          setStepModalPayload(null);
          setPendingCategory(null);
        }}
        onDone={handleStepDone}
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
  pillPrimary: {
    borderColor: "#b89674",
    borderWidth: 1.4,
    shadowOpacity: 0.28,
    shadowRadius: 5,
  },
  kindLabel: {
    fontSize: 12,
    color: "#D4A017",
    textAlign: "center",
    marginBottom: 2,
  },
  label: {
    fontSize: 15,
    color: "#432104",
    alignSelf: "center",
    textAlign: "center",
  },
  helperLine: {
    fontSize: 13,
    color: "#8F8378",
    textAlign: "center",
    marginTop: 4,
  },
  confirmedText: {
    fontSize: 14,
    color: "#432104",
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default RoomActionInquiryPill;
