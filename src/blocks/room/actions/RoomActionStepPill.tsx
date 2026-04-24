/**
 * RoomActionStepPill — in_room_step dispatcher.
 *
 * Step template IDs per §5.4 and beyond: step_breathe_*, step_walk_timer_*,
 * step_sit_ambient_*, step_grounding_*, step_hand_on_heart_*,
 * step_text_input_*, step_journal_*, step_voice_note_*, step_reach_out_*.
 *
 * Phase 6 (2026-04-20): tapping the pill opens `<StepModal />` with an
 * inline UI per template_id family (timer, text-input, grounding). When
 * the user taps Done the modal closes and we dispatch
 * `room_step_completed` with any collected payload bits (text, grounding).
 *
 * Defensive fallback: if `step_payload` is missing or the template_id is
 * unknown, the modal still opens with a generic "Done" button (classifyStep
 * → "unknown"). In test-harness contexts where Modal can't mount, we
 * fall through to the v1 Alert stub so telemetry still fires.
 */

import React, { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { executeAction } from "../../../engine/actionExecutor";
import { useScreenStore } from "../../../engine/useScreenBridge";
import type { ActionEnvelope, RoomRenderV1 } from "../types";
import { buildActionCtx } from "./actionContextHelper";
import StepModal, { type StepModalResult } from "./StepModal";

interface Props {
  action: ActionEnvelope;
  index: number;
  envelope?: RoomRenderV1;
  kindLabel?: string;
  isPrimary?: boolean;
}

const RoomActionStepPill: React.FC<Props> = ({
  action,
  envelope,
  kindLabel,
  isPrimary = false,
}) => {
  const { loadScreen, goBack } = useScreenStore();
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const templateId = action.step_payload?.template_id ?? "unknown";

  const dispatchCompletion = (extra: StepModalResult) => {
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
          ...(extra.text ? { text: extra.text } : {}),
          ...(extra.grounding ? { grounding: extra.grounding } : {}),
        },
      } as any,
      ctx,
    ).catch((err) => {
      if (__DEV__) console.warn("[RoomActionStepPill] dispatch failed:", err);
    });
  };

  const onPress = () => {
    // Primary path — open the inline Phase 6 modal.
    try {
      setModalVisible(true);
    } catch {
      // Modal open failed (test harness). Fall back to Alert stub so
      // telemetry still fires deterministically.
      try {
        Alert.alert(
          action.label || "Step",
          "This step will open an inline panel.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Done", onPress: () => dispatchCompletion({}) },
          ],
          { cancelable: true },
        );
      } catch {
        dispatchCompletion({});
      }
    }
  };

  const handleDone = (extra: StepModalResult) => {
    setModalVisible(false);
    dispatchCompletion(extra);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  return (
    <>
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
        </View>
      </TouchableOpacity>
      <StepModal
        visible={modalVisible}
        stepPayload={action.step_payload}
        label={action.label || "Step"}
        onCancel={handleCancel}
        onDone={handleDone}
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
});

export default RoomActionStepPill;
