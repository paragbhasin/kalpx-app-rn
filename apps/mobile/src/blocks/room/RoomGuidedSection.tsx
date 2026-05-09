/**
 * RoomGuidedSection — S17-D4A guided room layout (mobile).
 * Recommended action card + secondary links + exit.
 * Replaces RoomActionList when entry_context.recommended_first_action_id is set.
 */
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ROOM_GUIDED_COPY } from "@kalpx/contracts";
import { executeAction } from "../../engine/actionExecutor";
import { trackRoomTelemetry } from "../../engine/mitraApi";
import { useScreenStore } from "../../engine/useScreenBridge";
import { buildActionCtx } from "./actions/actionContextHelper";
import type { RoomRenderV1 } from "./types";

interface Props {
  envelope: RoomRenderV1;
}

const RoomGuidedSection: React.FC<Props> = ({ envelope }) => {
  const ctx = (envelope as any).room_context?.entry_context ?? {};
  const recId: string | null = ctx.recommended_first_action_id ?? null;
  const recTitle: string = ctx.recommended_first_action_title ?? "";
  const recDesc: string = ctx.recommended_first_action_description ?? "";
  const roomId: string = envelope.room_id;
  const renderId: string = (envelope as any).provenance?.render_id ?? "";

  const recAction = recId
    ? envelope.actions.find((a: any) => a.action_id === recId) ?? null
    : null;
  const nonExitActions = envelope.actions.filter((a: any) => a.action_type !== "exit");

  const [whyExpanded, setWhyExpanded] = useState(false);
  const [stepsOpen, setStepsOpen] = useState(false);

  const { loadScreen, goBack } = useScreenStore();

  function handleBegin() {
    if (__DEV__) console.log('[S17-D4B] handleBegin', {
      recId,
      recAction_found: !!recAction,
      recAction_type: (recAction as any)?.action_type,
      runner_payload_present: !!(recAction as any)?.runner_payload,
      inquiry_payload_present: !!(recAction as any)?.inquiry_payload,
      actions_count: envelope.actions.length,
      action_ids: envelope.actions.map((a: any) => a.action_id),
      render_id: renderId,
    });
    if (!recAction) return;
    const actionCtx = buildActionCtx({ loadScreen, goBack });
    if (envelope.room_id) {
      actionCtx.setScreenValue(envelope.room_id, "room_id");
    }
    const actionId = (recAction as any).action_id;
    const actionType: string = (recAction as any).action_type ?? "";
    // trackRoomTelemetry type is narrow (room_entered|exit_tapped); cast until telemetry helper is widened.
    void (trackRoomTelemetry as any)({
      event_type: "recommended_action_started",
      room_id: roomId,
      render_id: renderId,
      action_id: actionId,
      surface: "room",
    });
    if (actionType === "inquiry") {
      const ip = (recAction as any).inquiry_payload;
      if (!ip) return;
      void executeAction(
        {
          type: "room_inquiry_opened",
          payload: { inquiry_payload: ip, action_id: actionId, room_id: roomId, render_id: renderId },
        } as any,
        actionCtx,
      );
    } else {
      const rp = (recAction as any).runner_payload;
      if (!rp) {
        if (__DEV__) console.warn("[S17-D4B] handleBegin: runner_payload missing for", actionType);
        return;
      }
      void executeAction(
        {
          type: "start_runner",
          payload: {
            source: rp.runner_source ?? "support_room",
            variant: (rp.runner_kind ?? actionType.replace("runner_", "")) || "mantra",
            item: rp,
            action_id: actionId,
          },
        } as any,
        actionCtx,
      );
    }
  }

  function handleExit() {
    void trackRoomTelemetry({ event_type: 'room_exited' as any, room_id: roomId, surface: 'room' });
    const actionCtx = buildActionCtx({ loadScreen, goBack });
    void executeAction({ type: "exit_tapped", payload: { room_id: roomId } } as any, actionCtx);
  }

  return (
    <View style={styles.root} testID="room_guided_section">
      {/* Recommended action card */}
      <View style={styles.card} testID="room_recommended_card">
        <Text style={styles.cardTitle}>{recTitle || (recAction as any)?.label || ""}</Text>
        {!!recDesc && <Text style={styles.cardDesc}>{recDesc}</Text>}
        <TouchableOpacity
          style={styles.beginBtn}
          onPress={handleBegin}
          activeOpacity={0.85}
          testID="room_guided_begin"
        >
          <Text style={styles.beginBtnText}>{ROOM_GUIDED_COPY.begin}</Text>
        </TouchableOpacity>
      </View>

      {/* Secondary links */}
      <View style={styles.secondaryRow}>
        {!!ctx.why_this_room_line && (
          <TouchableOpacity
            onPress={() => {
              void trackRoomTelemetry({ event_type: 'why_this_viewed' as any, room_id: roomId, surface: 'room' });
              setWhyExpanded((v) => !v);
            }}
            testID="room_guided_why_this"
          >
            <Text style={styles.linkGold}>{ROOM_GUIDED_COPY.whyThisLabel}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => setStepsOpen(true)}
          testID="room_guided_view_all_steps"
        >
          <Text style={styles.linkMuted}>{ROOM_GUIDED_COPY.viewAllSteps}</Text>
        </TouchableOpacity>
      </View>

      {/* Why this accordion */}
      {whyExpanded && !!ctx.why_this_room_line && (
        <View style={styles.whyBox} testID="room_why_expanded">
          <Text style={styles.whyText}>{ctx.why_this_room_line}</Text>
        </View>
      )}

      {/* Exit */}
      <View style={styles.exitRow}>
        <TouchableOpacity onPress={handleExit} testID="room_guided_exit">
          <Text style={styles.exitText}>{ROOM_GUIDED_COPY.exitLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* View all steps modal */}
      <Modal
        visible={stepsOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setStepsOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setStepsOpen(false)}>
          <View style={styles.stepsSheet}>
            <Text style={styles.stepsTitle}>Steps in this space</Text>
            <ScrollView>
              {nonExitActions.map((a: any, i: number) => (
                <View
                  key={a.action_id}
                  style={[
                    styles.stepRow,
                    a.action_id === recId && styles.stepRowHighlight,
                  ]}
                  testID={`room_step_${a.action_id}`}
                >
                  <Text style={styles.stepNum}>{i + 1}</Text>
                  <Text style={styles.stepLabel}>{a.label}</Text>
                  {a.action_id === recId && (
                    <Text style={styles.stepSuggested}>suggested</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { paddingHorizontal: 16, paddingBottom: 40 },
  card: {
    backgroundColor: "rgba(255,251,244,0.95)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: "#432104",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "rgba(200,180,154,0.4)",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#432104",
    lineHeight: 22,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: "#8A7968",
    fontStyle: "italic",
    lineHeight: 19,
    marginBottom: 14,
  },
  beginBtn: {
    backgroundColor: "#432104",
    borderRadius: 28,
    paddingVertical: 13,
    alignItems: "center",
  },
  beginBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  secondaryRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginBottom: 8,
  },
  linkGold: { fontSize: 13, color: "#8B6914", textDecorationLine: "underline" },
  linkMuted: { fontSize: 13, color: "#8A7968", textDecorationLine: "underline" },
  whyBox: {
    backgroundColor: "rgba(248,242,232,0.8)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  whyText: { fontSize: 13, color: "#6B5E4E", lineHeight: 19 },
  exitRow: { alignItems: "center", marginTop: 8 },
  exitText: { fontSize: 13, color: "#b0a090" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(30,20,10,0.45)",
    justifyContent: "flex-end",
  },
  stepsSheet: {
    backgroundColor: "#FFF8EF",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: "70%",
  },
  stepsTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#432104",
    textAlign: "center",
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(200,180,154,0.2)",
  },
  stepRowHighlight: { backgroundColor: "rgba(201,168,76,0.08)" },
  stepNum: { fontSize: 13, color: "#9f9f9f", minWidth: 24, textAlign: "right" },
  stepLabel: { flex: 1, fontSize: 14, color: "#432104", marginLeft: 12 },
  stepSuggested: { fontSize: 11, color: "#8B6914", fontStyle: "italic" },
});

export default RoomGuidedSection;
