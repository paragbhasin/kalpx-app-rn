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
import { useToast } from "../../../context/ToastContext";
import type { ActionEnvelope, RoomRenderV1, StepPayload } from "../types";
import { buildActionCtx } from "./actionContextHelper";
import StepModal, { type StepModalResult } from "./StepModal";

const INPUT_TEMPLATE: Record<string, string> = {
  growth_journal:       "step_journal_growth",
  connection_reach_out: "step_reach_out_connection",
  connection_named:     "step_text_input_connection_named",
  joy_named:            "step_text_input_joy_named",
  release_named:        "step_text_input_release_named",
  // Pre-wired — PARKED (never emitted by BE seed); activate in Batch 2:
  stillness_named:      "step_text_input_stillness_named",
  clarity_journal:      "step_text_input_clarity_journal",
};

const NAVIGATE_AFTER = new Set(["joy_carry"]);

const CARRY_TOAST_COPY: Record<string, string> = {
  joy_carry:            "Saved. Carry this joy into your day.",
  joy_named:            "Saved. Carry this joy into your day.",
  connection_named:     "Saved. Carry this connection with you.",
  stillness_named:      "Saved. Return with this stillness.",
  growth_journal:       "Saved. Let this insight walk with you.",
  connection_reach_out: "Saved. Carry this connection with you.",
  clarity_journal:      "Saved. Keep this question close.",
};
const CARRY_TOAST_FALLBACK = "Saved to your path.";
const CARRY_TOAST_ERROR    = "Couldn't save. Please try again.";

const CARRY_CONFIRM_COPY: Record<string, string> = {
  joy_named:            "Saved. You can write another.",
  connection_named:     "Saved. You can name another.",
  growth_journal:       "Saved. You can write another.",
  connection_reach_out: "Saved. You can add another.",
  release_named:        "Saved. You set it down.",
  stillness_named:      "Saved.",
  clarity_journal:      "Saved. You can write another.",
};

const CONFIRMED_ADD_LABEL: Record<string, string> = {
  connection_named:     "Name another",
  joy_named:            "Write another",
  growth_journal:       "Write another",
  clarity_journal:      "Write another",
  stillness_named:      "Write another",
  connection_reach_out: "Add another",
  release_named:        "Name another",
};

const CARRY_MEMORY_MODAL: Record<string, NonNullable<StepPayload["memory_modal"]>> = {
  connection_named: {
    title:             "Name someone who matters",
    sanatan_context:   "Sambandha reminds us that even one true bond can hold us.",
    why_we_ask:        "Naming someone helps you return from feeling alone to one thread of care.",
    prompt:            "Who is close to your heart right now?",
    placeholder:       "Write a name, relationship, or a few words…",
    primary_label:     "Save this connection",
    confirmation:      "Saved. You can name another.",
    add_another_label: "Name another",
  },
  joy_named: {
    title:             "Write what’s good right now",
    sanatan_context:   "Santosha begins by noticing what is already enough.",
    why_we_ask:        "Writing one good thing helps the mind stay with it instead of rushing past it.",
    prompt:            "What feels good, steady, or quietly enough right now?",
    placeholder:       "Write one good thing…",
    primary_label:     "Save this joy",
    confirmation:      "Saved. You can write another.",
    add_another_label: "Write another",
  },
  growth_journal: {
    title:             "Write what you noticed",
    sanatan_context:   "Growth ripens through one right action, not speed.",
    why_we_ask:        "Naming what you noticed turns observation into the seed of a next step.",
    prompt:            "What did you notice, or what is forming?",
    placeholder:       "Write what came up…",
    primary_label:     "Save this",
    confirmation:      "Saved. You can write another.",
    add_another_label: "Write another",
  },
  connection_reach_out: {
    title:             "Reach out to one person",
    sanatan_context:   "A short act of reaching is itself the practice of sambandha.",
    why_we_ask:        "Writing the message — even without sending — brings the connection closer.",
    prompt:            "Write a short message to someone who matters.",
    placeholder:       "Your message…",
    primary_label:     "Save and copy message",
    confirmation:      "Saved. You can add another.",
    add_another_label: "Add another",
  },
  release_named: {
    title:             "Name what you’re setting down",
    sanatan_context:   "Letting go is not giving up. It is loosening the grip so life can move again.",
    why_we_ask:        "Naming the weight helps you separate yourself from what you are carrying.",
    prompt:            "What is ready to be set down for now?",
    placeholder:       "Write one word or a few lines…",
    primary_label:     "Save this release",
    confirmation:      "Saved. You set it down.",
    add_another_label: "Name another",
  },
  // PARKED — pre-wired, not currently emitted by BE:
  stillness_named: {
    title:             "Write what became still",
    sanatan_context:   "Stillness begins when attention returns to one steady anchor.",
    why_we_ask:        "Naming what settled helps you recognize the ground beneath the noise.",
    prompt:            "What feels quieter now?",
    placeholder:       "Write one word or a few lines…",
    primary_label:     "Save this stillness",
    confirmation:      "Saved.",
    add_another_label: "Write another",
  },
  clarity_journal: {
    title:             "Write one honest question",
    sanatan_context:   "Clarity comes when we stop obeying confusion and look at what is actually here.",
    why_we_ask:        "Writing the question separates the real decision from the noise around it.",
    prompt:            "What is the question you are actually sitting with?",
    placeholder:       "Write your honest question…",
    primary_label:     "Save this question",
    confirmation:      "Saved. You can write another.",
    add_another_label: "Write another",
  },
};

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
  const { loadScreen, goBack, screenData } = useScreenStore();
  const { showToast } = useToast();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const writesEvent =
    action.carry_payload?.writes_event ??
    action.persistence?.writes_event ??
    "joy_carry";
  const roomId = envelope?.room_id ?? null;
  const needsInput = writesEvent in INPUT_TEMPLATE;

  // Stub action: no real audio capture yet. Hide pill until recorder is wired.
  if (writesEvent === "release_voice_note") return null;

  const dashboardContainer =
    process.env.EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD === "1"
      ? "companion_dashboard_v3"
      : "companion_dashboard";

  const doCarryWrite = async (extra?: StepModalResult): Promise<boolean> => {
    // sacredWriteOk is declared outside the outer try so the inner sacred-POST
    // catch can set it true/false independently of post-POST errors.
    // Outer catch guards setScreenValue/executeAction/buildActionCtx failures
    // and must not reset sacredWriteOk — a successful sacred POST must stay true.
    let sacredWriteOk = false;
    try {
      const ctx = buildActionCtx({ loadScreen, goBack });
      const capturedAt = Date.now();

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
            life_context: envelope?.life_context ?? null,
            journey_id: (screenData as any)?.journey_id ?? null,
            day_number: (screenData as any)?.day_number ?? null,
            source_surface: "carry_pill",
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
    } catch (err: any) {
      if (__DEV__) {
        console.warn("[RoomActionCarryPill] doCarryWrite unexpected error:", err);
      }
    }
    return sacredWriteOk;
  };

  const onPress = async () => {
    if (needsInput) {
      setConfirmed(false);
      setModalError(null);
      setModalSubmitting(false);
      setModalVisible(true);
      return;
    }
    const ok = await doCarryWrite();
    if (ok) {
      if (NAVIGATE_AFTER.has(writesEvent)) {
        showToast(CARRY_TOAST_COPY[writesEvent] ?? CARRY_TOAST_FALLBACK, 3000, "success");
        loadScreen({ container_id: dashboardContainer, state_id: "day_active" } as any);
      } else {
        setConfirmed(true);
      }
    } else {
      showToast(CARRY_TOAST_ERROR, 4000, "error");
    }
  };

  const handleModalDone = async (extra: StepModalResult) => {
    if (modalSubmitting) return;
    setModalSubmitting(true);
    setModalError(null);
    let ok = false;
    try {
      ok = await doCarryWrite(extra);
    } finally {
      setModalSubmitting(false);
    }
    if (ok) {
      setModalVisible(false);
      setModalError(null);
      setConfirmed(true);
    } else {
      setModalError(CARRY_TOAST_ERROR);
    }
  };

  return (
    <>
      {confirmed ? (
        <View style={[styles.pill, isPrimary ? styles.pillPrimary : null]}>
          {kindLabel ? <Text style={styles.kindLabel}>{kindLabel}</Text> : null}
          <Text style={styles.confirmedText}>
            {CARRY_MEMORY_MODAL[writesEvent]?.confirmation
              ?? CARRY_CONFIRM_COPY[writesEvent]
              ?? CARRY_TOAST_FALLBACK}
          </Text>
          <View style={styles.confirmedActions}>
            <TouchableOpacity
              style={styles.confirmedBtn}
              onPress={() => setConfirmed(false)}
              accessibilityRole="button"
              accessibilityLabel={
                CARRY_MEMORY_MODAL[writesEvent]?.add_another_label
                  ?? CONFIRMED_ADD_LABEL[writesEvent]
                  ?? "Add another"
              }
            >
              <Text style={styles.confirmedBtnLabel}>
                {CARRY_MEMORY_MODAL[writesEvent]?.add_another_label
                  ?? CONFIRMED_ADD_LABEL[writesEvent]
                  ?? "Add another"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmedBtn, styles.confirmedBtnHome]}
              onPress={() =>
                loadScreen({ container_id: dashboardContainer, state_id: "day_active" } as any)
              }
              accessibilityRole="button"
              accessibilityLabel="Return home"
            >
              <Text style={styles.confirmedBtnLabel}>Return home</Text>
            </TouchableOpacity>
          </View>
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
          </View>
        </TouchableOpacity>
      )}
      {needsInput && (
        <StepModal
          visible={modalVisible}
          label={CARRY_MEMORY_MODAL[writesEvent]?.title ?? action.label}
          stepPayload={{
            template_id: INPUT_TEMPLATE[writesEvent]!,
            step_config: {},
            input_slots: [],
            memory_modal: CARRY_MEMORY_MODAL[writesEvent] ?? null,
          }}
          onCancel={() => {
            setModalVisible(false);
            setModalError(null);
            setModalSubmitting(false);
          }}
          onDone={handleModalDone}
          errorMessage={modalError}
          isSubmitting={modalSubmitting}
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
  confirmedText: {
    fontSize: 14,
    color: "#432104",
    textAlign: "center",
    marginBottom: 10,
  },
  confirmedActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  confirmedBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: "#9f9f9f",
  },
  confirmedBtnHome: {
    borderColor: "#b89674",
  },
  confirmedBtnLabel: {
    fontSize: 13,
    color: "#432104",
  },
});

export default RoomActionCarryPill;
