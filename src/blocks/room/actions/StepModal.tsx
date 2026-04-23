/**
 * StepModal — inline step panel launched by RoomActionStepPill (Phase 6).
 *
 * Renders a UI flavor derived from `step_payload.template_id` prefix:
 *   - step_breathe_*       → Timer UI (default 60s, optional cue_text)
 *   - step_walk_timer_*    → Timer UI (default 60s)
 *   - step_sit_ambient_*   → Timer UI (default 60s)
 *   - step_hand_on_heart_* → Timer UI (default 30s) + fixed instruction
 *   - step_text_input_*    → Multiline text-input (1000 char cap)
 *   - step_journal_*       → Multiline text-input (1000 char cap)
 *   - step_grounding_*     → 5-4-3-2-1 sequential prompts
 *   - step_voice_note_*    → Voice-note MVP (stub recorder, elapsed counter)
 *   - step_reach_out_*     → Reach-out prompt (contact hint + message + copy)
 *   - unknown              → defensive inline fallback panel
 *
 * On Done, the caller's `onDone(extra)` callback fires with any collected
 * payload bits (text, grounding[]) so the pill can merge them into the
 * `room_step_completed` dispatch. The modal closes after dispatch.
 *
 * Not a dependency addition — uses react-native stdlib Modal + TextInput.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Clipboard,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import type { StepPayload } from "../types";

export type StepModalKind =
  | "timer_breathe"
  | "timer_walk"
  | "timer_sit"
  | "timer_heart"
  | "text_input"
  | "grounding"
  | "voice_note"
  | "reach_out"
  | "unknown";

export interface StepModalResult {
  text?: string;
  grounding?: string[];
  // Voice-note extras — §Phase 6 carry-equivalent. `stub:true` until the
  // recorder is wired; duration_sec is the elapsed counter value.
  source?: "voice_note" | "reach_out";
  duration_sec?: number;
  stub?: boolean;
  // Reach-out extras — user-authored contact hint + message; copied flag
  // tells the BE whether the user tapped the clipboard affordance.
  contact_hint?: string;
  message?: string;
  copied?: boolean;
}

interface Props {
  visible: boolean;
  stepPayload: StepPayload | null | undefined;
  label: string;
  onCancel: () => void;
  onDone: (extra: StepModalResult) => void;
}

/** Derive the UI kind from the template_id prefix. */
export function classifyStep(templateId?: string | null): StepModalKind {
  if (!templateId) return "unknown";
  if (templateId.startsWith("step_breathe_")) return "timer_breathe";
  if (templateId.startsWith("step_walk_timer_")) return "timer_walk";
  if (templateId.startsWith("step_sit_ambient_")) return "timer_sit";
  if (templateId.startsWith("step_hand_on_heart_")) return "timer_heart";
  if (templateId.startsWith("step_text_input_")) return "text_input";
  if (templateId.startsWith("step_journal_")) return "text_input";
  if (templateId.startsWith("step_grounding_")) return "grounding";
  if (templateId.startsWith("step_voice_note")) return "voice_note";
  if (templateId.startsWith("step_reach_out")) return "reach_out";
  return "unknown";
}

const GROUNDING_PROMPTS = [
  "Name 5 things you can see",
  "Name 4 things you can hear",
  "Name 3 things you can feel",
  "Name 2 things you can smell",
  "Name 1 thing you can taste",
];

const MAX_TEXT = 1000;

const StepModal: React.FC<Props> = ({
  visible,
  stepPayload,
  label,
  onCancel,
  onDone,
}) => {
  const kind = useMemo(
    () => classifyStep(stepPayload?.template_id),
    [stepPayload?.template_id],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="overFullScreen"
      onRequestClose={onCancel}
      transparent
    >
      <View style={styles.scrim}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onCancel}
        />
        <View style={styles.sheet}>
          <ImageBackground
            source={require("../../../../assets/beige_bg.png")}
            style={styles.sheetBackground}
            imageStyle={styles.sheetImage}
          >
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <View style={styles.handle} />
              <View style={styles.header}>
                <TouchableOpacity
                  onPress={onCancel}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                  testID="step_modal_cancel"
                >
                  <Text style={styles.headerCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  {label}
                </Text>
                <View style={styles.headerSpacer} />
              </View>

              <View style={styles.body} testID="step_modal_body">
                {kind === "timer_breathe" ||
                kind === "timer_walk" ||
                kind === "timer_sit" ||
                kind === "timer_heart" ? (
                  <TimerBody
                    kind={kind}
                    stepPayload={stepPayload}
                    onDone={onDone}
                  />
                ) : null}

                {kind === "text_input" ? (
                  <TextInputBody stepPayload={stepPayload} onDone={onDone} />
                ) : null}

                {kind === "grounding" ? (
                  <GroundingBody onDone={onDone} />
                ) : null}

                {kind === "voice_note" ? (
                  <VoiceNoteBody stepPayload={stepPayload} onDone={onDone} />
                ) : null}

                {kind === "reach_out" ? (
                  <ReachOutBody stepPayload={stepPayload} onDone={onDone} />
                ) : null}

                {kind === "unknown" ? <UnknownBody onDone={onDone} /> : null}
              </View>
            </KeyboardAvoidingView>
          </ImageBackground>
        </View>
      </View>
    </Modal>
  );
};

// ─── Timer body ──────────────────────────────────────────────────────────

interface TimerBodyProps {
  kind: "timer_breathe" | "timer_walk" | "timer_sit" | "timer_heart";
  stepPayload: StepPayload | null | undefined;
  onDone: (extra: StepModalResult) => void;
}

function defaultTimerSeconds(kind: TimerBodyProps["kind"]): number {
  if (kind === "timer_heart") return 30;
  return 60;
}

function defaultInstruction(kind: TimerBodyProps["kind"]): string {
  if (kind === "timer_heart") {
    return "Rest your hand on your heart. Breathe.";
  }
  if (kind === "timer_breathe") return "Breathe gently.";
  if (kind === "timer_walk") return "Walk at your own pace.";
  return "Sit quietly.";
}

const TimerBody: React.FC<TimerBodyProps> = ({ kind, stepPayload, onDone }) => {
  const totalSec = useMemo(() => {
    const raw = stepPayload?.duration_sec;
    if (typeof raw === "number" && raw > 0 && raw <= 60 * 60) return raw;
    // BE sends duration inside step_config (cycles × per-cycle seconds)
    // rather than as a top-level duration_sec field. Compute when present.
    const sc = stepPayload?.step_config;
    if (sc) {
      const cycles = typeof sc.cycles === "number" ? sc.cycles : 0;
      const inhale = typeof sc.inhale === "number" ? sc.inhale : 0;
      const exhale = typeof sc.exhale === "number" ? sc.exhale : 0;
      const hold = typeof sc.hold === "number" ? sc.hold : 0;
      const computed = cycles * (inhale + exhale + hold);
      if (computed > 0 && computed <= 3600) return computed;
    }
    return defaultTimerSeconds(kind);
  }, [stepPayload?.duration_sec, stepPayload?.step_config, kind]);

  const cueText =
    (stepPayload?.cue_text && String(stepPayload.cue_text)) ||
    defaultInstruction(kind);

  const [remaining, setRemaining] = useState<number>(totalSec);
  const [running, setRunning] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const atZero = remaining <= 0;
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const timeLabel = `${mm.toString().padStart(1, "0")}:${ss
    .toString()
    .padStart(2, "0")}`;

  return (
    <View style={styles.timerRoot}>
      <Text style={styles.timerCue} testID="step_modal_timer_cue">
        {cueText}
      </Text>
      <Text style={styles.timerDigits} testID="step_modal_timer_digits">
        {timeLabel}
      </Text>
      <View style={styles.timerControls}>
        {!running && !atZero ? (
          <TouchableOpacity
            style={styles.ctrlBtn}
            onPress={() => setRunning(true)}
            testID="step_modal_timer_start"
          >
            <Text style={styles.ctrlBtnLabel}>Start</Text>
          </TouchableOpacity>
        ) : null}
        {running ? (
          <TouchableOpacity
            style={styles.ctrlBtn}
            onPress={() => setRunning(false)}
            testID="step_modal_timer_pause"
          >
            <Text style={styles.ctrlBtnLabel}>Pause</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.ctrlBtn, styles.ctrlDone]}
          onPress={() => onDone({})}
          testID="step_modal_timer_done"
          accessibilityState={{ disabled: false }}
        >
          <Text style={[styles.primaryActionLabel, { fontSize: 15 }]}>
            Done
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Text-input body ─────────────────────────────────────────────────────

// Resolves the prompt_slot key that BE sends in step_config to authored
// prompt text. BE sends the slot name; FE owns the resolved copy.
const PROMPT_SLOT_TEXT: Record<string, string> = {
  name_short_prompt: "What's closest to you right now?",
  name_full_prompt: "What feels most full or alive right now?",
};

interface TextInputBodyProps {
  stepPayload: StepPayload | null | undefined;
  onDone: (extra: StepModalResult) => void;
}

const TextInputBody: React.FC<TextInputBodyProps> = ({
  stepPayload,
  onDone,
}) => {
  const [text, setText] = useState<string>("");
  const promptSlot = stepPayload?.step_config?.prompt_slot;
  const placeholder =
    (stepPayload?.prompt && String(stepPayload.prompt)) ||
    (typeof promptSlot === "string" && PROMPT_SLOT_TEXT[promptSlot]) ||
    "Take a moment and write what comes.";

  const trimmed = text.trim();
  const enabled = trimmed.length >= 1;

  return (
    <ScrollView style={styles.textRoot} keyboardShouldPersistTaps="handled">
      <Text style={styles.textPrompt}>{placeholder}</Text>
      <TextInput
        value={text}
        onChangeText={(v) => setText(v.slice(0, MAX_TEXT))}
        multiline
        textAlignVertical="top"
        style={styles.textInput}
        placeholder="..."
        placeholderTextColor="#B0B0B5"
        testID="step_modal_text_input"
        maxLength={MAX_TEXT}
      />
      <Text style={styles.textCounter}>
        {text.length} / {MAX_TEXT}
      </Text>
      <TouchableOpacity
        style={[styles.primaryAction, !enabled ? styles.ctrlDisabled : null]}
        disabled={!enabled}
        onPress={() => onDone({ text: trimmed })}
        testID="step_modal_text_done"
      >
        <Text style={styles.primaryActionLabel}>Done</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ─── Grounding (5-4-3-2-1) body ──────────────────────────────────────────

const GroundingBody: React.FC<{ onDone: (extra: StepModalResult) => void }> = ({
  onDone,
}) => {
  const [index, setIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<string[]>(["", "", "", "", ""]);
  const current = answers[index] ?? "";
  const prompt = GROUNDING_PROMPTS[index];
  const isLast = index === GROUNDING_PROMPTS.length - 1;
  const trimmed = current.trim();
  const enabled = trimmed.length >= 1;

  const setCurrent = (v: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[index] = v.slice(0, MAX_TEXT);
      return next;
    });
  };

  const handleNext = () => {
    if (!enabled) return;
    if (isLast) {
      onDone({ grounding: answers.map((a) => a.trim()) });
      return;
    }
    setIndex((i) => Math.min(GROUNDING_PROMPTS.length - 1, i + 1));
  };

  return (
    <ScrollView style={styles.textRoot} keyboardShouldPersistTaps="handled">
      <Text
        style={styles.groundingProgress}
        testID="step_modal_grounding_progress"
      >
        {index + 1} of {GROUNDING_PROMPTS.length}
      </Text>
      <Text style={styles.textPrompt}>{prompt}</Text>
      <TextInput
        value={current}
        onChangeText={setCurrent}
        multiline
        textAlignVertical="top"
        style={styles.textInput}
        placeholder="..."
        placeholderTextColor="#B0B0B5"
        testID="step_modal_grounding_input"
        maxLength={MAX_TEXT}
      />
      <TouchableOpacity
        style={[styles.primaryAction, !enabled ? styles.ctrlDisabled : null]}
        disabled={!enabled}
        onPress={handleNext}
        testID={
          isLast ? "step_modal_grounding_done" : "step_modal_grounding_next"
        }
      >
        <Text style={styles.primaryActionLabel}>
          {isLast ? "Done" : "Next"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ─── Voice-note body (Phase 6 release-room carry-equivalent) ────────────
//
// MVP stub: the UI walks through idle → recording → stopped states with an
// elapsed-seconds counter, but does NOT capture audio. expo-av is present
// in package.json (~15.1.7) and iOS has NSMicrophoneUsageDescription, but
// Android RECORD_AUDIO is not yet declared in app.config.js and there is
// no BE upload pipeline for audio. Per Phase 6 spec we ship the UI with
// `stub: true` so QA can verify the flow; wiring the real recorder is a
// follow-up when both platforms have permissions + BE endpoint ready.
//
// todo: expo-av recorder wiring — Audio.Recording.createAsync() on start,
// stopAndUnloadAsync() on stop, then POST the URI to the BE once the
// upload endpoint exists; flip `stub: false` at that point.

interface VoiceNoteBodyProps {
  stepPayload: StepPayload | null | undefined;
  onDone: (extra: StepModalResult) => void;
}

type VoiceNotePhase = "idle" | "recording" | "stopped";

const VoiceNoteBody: React.FC<VoiceNoteBodyProps> = ({
  stepPayload,
  onDone,
}) => {
  const prompt =
    (stepPayload?.prompt && String(stepPayload.prompt)) ||
    "Leave a voice note — what are you releasing?";

  const [phase, setPhase] = useState<VoiceNotePhase>("idle");
  const [elapsed, setElapsed] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase !== "recording") return;
    intervalRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  const mm = Math.floor(elapsed / 60);
  const ss = elapsed % 60;
  const timeLabel = `${mm.toString().padStart(2, "0")}:${ss
    .toString()
    .padStart(2, "0")}`;

  const handleRecord = () => {
    setElapsed(0);
    setPhase("recording");
  };
  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase("stopped");
  };
  const handleDone = () => {
    onDone({
      source: "voice_note",
      duration_sec: elapsed,
      stub: true,
    });
  };

  const doneEnabled = phase === "stopped" && elapsed > 0;

  return (
    <View style={styles.timerRoot}>
      <Text style={styles.timerCue} testID="step_modal_voice_note_prompt">
        {prompt}
      </Text>

      <Text style={styles.timerDigits} testID="step_modal_voice_note_elapsed">
        {timeLabel}
      </Text>

      {phase === "recording" ? (
        <Text style={styles.voiceNoteStatus}>Recording…</Text>
      ) : phase === "stopped" ? (
        <Text style={styles.voiceNoteStatus}>
          Recorded {timeLabel} — tap Done to save
        </Text>
      ) : (
        <Text style={styles.voiceNoteStatus}>Tap the circle to begin</Text>
      )}

      <TouchableOpacity
        style={[
          styles.voiceRecordButton,
          phase === "recording" ? styles.voiceRecordButtonActive : null,
          phase === "stopped" ? styles.voiceRecordButtonDone : null,
        ]}
        onPress={phase === "recording" ? handleStop : handleRecord}
        disabled={phase === "stopped"}
        testID={
          phase === "recording"
            ? "step_modal_voice_note_stop"
            : "step_modal_voice_note_record"
        }
        accessibilityRole="button"
        accessibilityLabel={
          phase === "recording" ? "Stop recording" : "Start recording"
        }
      >
        <View
          style={
            phase === "recording"
              ? styles.voiceRecordInnerSquare
              : styles.voiceRecordInnerCircle
          }
        />
      </TouchableOpacity>

      <View style={styles.primaryActionWrapper}>
        <TouchableOpacity
          style={[
            styles.primaryAction,
            !doneEnabled ? styles.ctrlDisabled : null,
          ]}
          disabled={!doneEnabled}
          onPress={handleDone}
          testID="step_modal_voice_note_done"
        >
          <Text style={styles.primaryActionLabel}>Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Reach-out body (Phase 6 connection-room carry) ─────────────────────
//
// User composes a short message for someone who matters. "Copy and close"
// writes the message body to the system clipboard (react-native Clipboard;
// deprecated but still bundled — no new deps per scope). "Done without
// copying" fires the dispatch with copied:false. No SMS/email integration —
// the user pastes into their own messaging app.

interface ReachOutBodyProps {
  stepPayload: StepPayload | null | undefined;
  onDone: (extra: StepModalResult) => void;
}

const MAX_CONTACT = 40;
const MAX_REACH_OUT = 280;

const ReachOutBody: React.FC<ReachOutBodyProps> = ({ stepPayload, onDone }) => {
  const prompt =
    (stepPayload?.prompt && String(stepPayload.prompt)) ||
    "Reach out — a short message to someone who matters.";

  const [contact, setContact] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const trimmedMessage = message.trim();
  const trimmedContact = contact.trim();
  const enabled = trimmedMessage.length >= 1;

  const dispatch = (copied: boolean) => {
    if (!enabled) return;
    onDone({
      source: "reach_out",
      contact_hint: trimmedContact,
      message: trimmedMessage,
      copied,
    });
  };

  const handleCopyAndClose = () => {
    if (!enabled) return;
    try {
      Clipboard.setString(trimmedMessage);
      dispatch(true);
    } catch (err) {
      if (__DEV__) {
        console.warn(
          "[StepModal/reach_out] Clipboard.setString failed; dispatching copied:false",
          err,
        );
      }
      dispatch(false);
    }
  };

  const handleDoneWithoutCopy = () => {
    dispatch(false);
  };

  return (
    <ScrollView style={styles.textRoot} keyboardShouldPersistTaps="handled">
      <Text style={styles.textPrompt}>{prompt}</Text>

      <TextInput
        value={contact}
        onChangeText={(v) => setContact(v.slice(0, MAX_CONTACT))}
        style={styles.reachOutContactInput}
        placeholder="Who — e.g. my mom (optional)"
        placeholderTextColor="#B0B0B5"
        testID="step_modal_reach_out_contact"
        maxLength={MAX_CONTACT}
      />

      <TextInput
        value={message}
        onChangeText={(v) => setMessage(v.slice(0, MAX_REACH_OUT))}
        multiline
        textAlignVertical="top"
        style={styles.textInput}
        placeholder="Your message…"
        placeholderTextColor="#B0B0B5"
        testID="step_modal_reach_out_message"
        maxLength={MAX_REACH_OUT}
      />
      <Text style={styles.textCounter}>
        {message.length} / {MAX_REACH_OUT}
      </Text>

      <View style={styles.primaryActionWrapper}>
        <TouchableOpacity
          style={[styles.primaryAction, !enabled ? styles.ctrlDisabled : null]}
          disabled={!enabled}
          onPress={handleCopyAndClose}
          testID="step_modal_reach_out_copy_done"
        >
          <Text style={styles.primaryActionLabel}>Copy and close</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ctrlBtn, !enabled ? styles.ctrlDisabled : null]}
          disabled={!enabled}
          onPress={handleDoneWithoutCopy}
          testID="step_modal_reach_out_done"
        >
          <Text style={styles.ctrlBtnLabel}>Done without copying</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// ─── Unknown-template body (defensive fallback) ──────────────────────────

const UnknownBody: React.FC<{ onDone: (extra: StepModalResult) => void }> = ({
  onDone,
}) => {
  return (
    <View style={styles.timerRoot}>
      <Text style={styles.timerCue}>
        This step will open an inline panel in a future release.
      </Text>
      <TouchableOpacity
        style={[styles.ctrlBtn, styles.ctrlDone]}
        onPress={() => onDone({})}
        testID="step_modal_unknown_done"
      >
        <Text style={[styles.primaryActionLabel, { fontSize: 15 }]}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    maxHeight: "90%",
  },
  sheetBackground: {
    width: "100%",
  },
  sheetImage: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E2",
    marginTop: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "transparent",
  },
  headerCancel: {
    fontSize: 15,
    color: "#6E6E73",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#1C1C1E",
  },
  headerSpacer: {
    width: 50,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
  },

  // Timer
  timerRoot: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  timerCue: {
    fontSize: 16,
    color: "#3C3C43",
    textAlign: "center",
    marginBottom: 24,
  },
  timerDigits: {
    fontSize: 64,
    fontVariant: ["tabular-nums"],
    color: "#1C1C1E",
    marginBottom: 32,
  },
  timerControls: {
    flexDirection: "row",
    gap: 12,
  },

  // Text input
  textRoot: {
    width: "100%",
  },
  textPrompt: {
    fontSize: 16,
    color: "#3C3C43",
    marginBottom: 16,
    lineHeight: 22,
  },
  textInput: {
    minHeight: 160, // Increased minHeight
    borderWidth: 1,
    borderColor: "#D8D8D8",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#1C1C1E",
    backgroundColor: "rgba(255,255,255,0.5)", // Slight backing for readability
  },
  textCounter: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "right",
    marginTop: 6,
    marginBottom: 16,
  },

  // Grounding
  groundingProgress: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 8,
  },

  // Controls
  ctrlBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#D8D8D8",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 92,
  },
  ctrlBtnLabel: {
    fontSize: 15,
    color: "#1C1C1E",
  },
  ctrlDone: {
    backgroundColor: "#1C1C1E",
    borderColor: "#1C1C1E",
  },
  ctrlDoneLabel: {
    color: "#FFFFFF",
  },
  primaryActionWrapper: {
    width: "100%",
    paddingHorizontal: 0,
  },
  ctrlDisabled: {
    opacity: 0.35,
  },
  primaryAction: {
    height: 40,
    backgroundColor: "#FBF5F5",
    borderRadius: 28,
    borderColor: "#9f9f9f",
    borderWidth: 0.3,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: 20,
  },
  primaryActionLabel: {
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
    fontSize: 17,
    fontWeight: "600",
    color: "#432104",
  },

  // Voice note
  voiceNoteStatus: {
    fontSize: 13,
    color: "#6E6E73",
    textAlign: "center",
    marginBottom: 24,
  },
  voiceRecordButton: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#E53935",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  voiceRecordButtonActive: {
    backgroundColor: "#B71C1C",
  },
  voiceRecordButtonDone: {
    backgroundColor: "#BDBDBD",
  },
  voiceRecordInnerCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },
  voiceRecordInnerSquare: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },

  // Reach out
  reachOutContactInput: {
    borderWidth: 1,
    borderColor: "#D8D8D8",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#1C1C1E",
    marginBottom: 12,
  },
  reachOutActions: {
    gap: 10,
    marginBottom: 24,
  },
});

export default StepModal;
