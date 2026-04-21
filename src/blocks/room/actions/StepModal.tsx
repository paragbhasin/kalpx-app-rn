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
 *   - unknown              → caller-side Alert fallback (we render nothing)
 *
 * On Done, the caller's `onDone(extra)` callback fires with any collected
 * payload bits (text, grounding[]) so the pill can merge them into the
 * `room_step_completed` dispatch. The modal closes after dispatch.
 *
 * Not a dependency addition — uses react-native stdlib Modal + TextInput.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
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
  | "unknown";

export interface StepModalResult {
  text?: string;
  grounding?: string[];
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
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
      onRequestClose={onCancel}
      transparent={false}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
            <TextInputBody
              stepPayload={stepPayload}
              onDone={onDone}
            />
          ) : null}

          {kind === "grounding" ? (
            <GroundingBody onDone={onDone} />
          ) : null}

          {kind === "unknown" ? (
            <UnknownBody onDone={onDone} />
          ) : null}
        </View>
      </KeyboardAvoidingView>
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

const TimerBody: React.FC<TimerBodyProps> = ({
  kind,
  stepPayload,
  onDone,
}) => {
  const totalSec = useMemo(() => {
    const raw = stepPayload?.duration_sec;
    if (typeof raw === "number" && raw > 0 && raw <= 60 * 60) return raw;
    return defaultTimerSeconds(kind);
  }, [stepPayload?.duration_sec, kind]);

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
          <Text style={[styles.ctrlBtnLabel, atZero ? styles.ctrlDoneLabel : null]}>
            Done
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Text-input body ─────────────────────────────────────────────────────

interface TextInputBodyProps {
  stepPayload: StepPayload | null | undefined;
  onDone: (extra: StepModalResult) => void;
}

const TextInputBody: React.FC<TextInputBodyProps> = ({
  stepPayload,
  onDone,
}) => {
  const [text, setText] = useState<string>("");
  const placeholder =
    (stepPayload?.prompt && String(stepPayload.prompt)) ||
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
        style={[styles.ctrlBtn, styles.ctrlDone, !enabled ? styles.ctrlDisabled : null]}
        disabled={!enabled}
        onPress={() => onDone({ text: trimmed })}
        testID="step_modal_text_done"
      >
        <Text style={[styles.ctrlBtnLabel, enabled ? styles.ctrlDoneLabel : null]}>
          Done
        </Text>
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
      <Text style={styles.groundingProgress} testID="step_modal_grounding_progress">
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
        style={[styles.ctrlBtn, styles.ctrlDone, !enabled ? styles.ctrlDisabled : null]}
        disabled={!enabled}
        onPress={handleNext}
        testID={isLast ? "step_modal_grounding_done" : "step_modal_grounding_next"}
      >
        <Text style={[styles.ctrlBtnLabel, enabled ? styles.ctrlDoneLabel : null]}>
          {isLast ? "Done" : "Next"}
        </Text>
      </TouchableOpacity>
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
        <Text style={[styles.ctrlBtnLabel, styles.ctrlDoneLabel]}>Done</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E0E0E2",
  },
  headerCancel: {
    fontSize: 15,
    color: "#6E6E73",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
    color: "#1C1C1E",
  },
  headerSpacer: {
    width: 50,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },

  // Timer
  timerRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
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
    flex: 1,
  },
  textPrompt: {
    fontSize: 16,
    color: "#3C3C43",
    marginBottom: 16,
    lineHeight: 22,
  },
  textInput: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: "#D8D8D8",
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: "#1C1C1E",
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
  ctrlDisabled: {
    opacity: 0.35,
  },
});

export default StepModal;
