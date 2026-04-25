/**
 * RoomActionCarryPill — writes a sacred-trace event for carry actions.
 *
 * Event names per §Contract 6: joy_carry, joy_named, release_voice_note,
 * connection_named, connection_reach_out, growth_journal, stillness_named,
 * clarity_journal.
 *
 * Phase 6 (2026-04-20): dual-write to the Phase 4 BE sacred endpoint
 *   POST /api/mitra/rooms/{room_id}/sacred/
 * and the existing Redux session-trace (the dashboard chip reads it for
 * today's carry preview). The Redux write remains the durability guarantee
 * when BE is unreachable — on network/4xx/5xx failure we fall through to
 * Redux-only and log a __DEV__ warning. The room_carry_captured telemetry
 * event now carries `sacred_write_ok: boolean` so Phase 7 can measure
 * delivery rate from the FE perspective.
 *
 * The tap returns the user to the room per INLINE_STEP contract — no nav.
 */

import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import api from "../../../Networks/axios";
import { executeAction } from "../../../engine/actionExecutor";
import { useScreenStore } from "../../../engine/useScreenBridge";
import type { ActionEnvelope, RoomRenderV1 } from "../types";
import { buildActionCtx } from "./actionContextHelper";
import StepModal, { type StepModalResult } from "./StepModal";

const INPUT_TEMPLATE: Record<string, string> = {
  growth_journal: "step_journal_growth",
  connection_reach_out: "step_reach_out_connection",
};

const NAVIGATE_AFTER = new Set(["joy_carry", "joy_named", "stillness_named", "connection_named"]);

interface Props {
  action: ActionEnvelope;
  index: number;
  envelope?: RoomRenderV1;
  kindLabel?: string;
  isPrimary?: boolean;
}

const RoomActionCarryPill: React.FC<Props> = ({
  action,
  envelope,
  kindLabel,
  isPrimary = false,
}) => {
  const { loadScreen, goBack } = useScreenStore();
  const [modalVisible, setModalVisible] = useState(false);

  const writesEvent =
    action.carry_payload?.writes_event ??
    action.persistence?.writes_event ??
    "joy_carry";
  const roomId = envelope?.room_id ?? null;
  const needsInput = writesEvent in INPUT_TEMPLATE;

  const dashboardContainer =
    process.env.EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD === "1"
      ? "companion_dashboard_v3"
      : "companion_dashboard";

  const doCarryWrite = async (extra?: StepModalResult) => {
    const ctx = buildActionCtx({ loadScreen, goBack });
    const capturedAt = Date.now();

    let sacredWriteOk = false;
    if (roomId) {
      try {
        const res = await api.post(`mitra/rooms/${roomId}/sacred/`, {
          writes_event: writesEvent,
          label: action.label,
          action_id: action.action_id,
          analytics_key: action.analytics_key,
          captured_at: capturedAt,
          ...(extra?.text ? { text: extra.text } : {}),
          ...(extra?.contact_hint ? { contact_hint: extra.contact_hint } : {}),
          ...(extra?.message ? { message: extra.message } : {}),
        });
        const status = res?.status ?? 0;
        sacredWriteOk = status >= 200 && status < 300;
      } catch (err: any) {
        sacredWriteOk = false;
        if (__DEV__) {
          console.warn(
            "[RoomActionCarryPill] sacred POST failed; falling back to Redux-only",
            err?.response?.status || err?.message,
          );
        }
      }
    } else if (__DEV__) {
      console.warn(
        "[RoomActionCarryPill] missing room_id on envelope; skipping BE POST",
      );
    }

    ctx.setScreenValue(
      {
        captured_at: capturedAt,
        label: action.label,
        room_id: roomId,
        writes_event: writesEvent,
        sacred_write_ok: sacredWriteOk,
      },
      writesEvent,
    );

    executeAction(
      {
        type: "room_carry_captured",
        payload: {
          room_id: roomId,
          writes_event: writesEvent,
          label: action.label,
          analytics_key: action.analytics_key,
          sacred_write_ok: sacredWriteOk,
        },
      } as any,
      ctx,
    ).catch((err) => {
      if (__DEV__) {
        console.warn("[RoomActionCarryPill] dispatch failed:", err);
      }
    });
  };

  const onPress = async () => {
    if (needsInput) {
      setModalVisible(true);
      return;
    }
    await doCarryWrite();
    if (NAVIGATE_AFTER.has(writesEvent)) {
      loadScreen({ container_id: dashboardContainer, state_id: "day_active" } as any);
    }
  };

  const handleModalDone = async (extra: StepModalResult) => {
    setModalVisible(false);
    await doCarryWrite(extra);
    loadScreen({ container_id: dashboardContainer, state_id: "day_active" } as any);
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
      {needsInput && (
        <StepModal
          visible={modalVisible}
          stepPayload={{
            template_id: INPUT_TEMPLATE[writesEvent]!,
            step_config: {},
            input_slots: [],
          }}
          label={action.label}
          onCancel={() => setModalVisible(false)}
          onDone={handleModalDone}
        />
      )}
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

export default RoomActionCarryPill;
