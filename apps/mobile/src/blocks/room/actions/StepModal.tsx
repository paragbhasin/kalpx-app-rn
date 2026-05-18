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

import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import LottieView from "lottie-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Clipboard,
  Image,
  ImageBackground,
  Keyboard,
  LayoutChangeEvent,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  presentation?: "sheet" | "screen";
  onCancel: () => void;
  onDone: (extra: StepModalResult) => void;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  /** When true: enables room-guided UX (auto-start, companion prompts, optional input). */
  isRoomGuided?: boolean;
  /** Fallback context line (action.helper_line or room_context.sanatan_insight_line) shown only when step_payload.memory_modal has no sanatan_context or why_we_ask. */
  helperLine?: string | null;
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

const GROUNDING_PROMPTS_ROOM = [
  "What do you see around you?",
  "What sounds do you notice?",
  "What do you feel against your skin?",
  "Is there a scent nearby?",
  "What taste is in your mouth?",
];

const TIMER_COMPLETION_LINES: Record<string, string> = {
  timer_breathe: "You made space.",
  timer_sit:     "You sat with it.",
  timer_heart:   "Your heart has steadied.",
  timer_walk:    "You moved through it.",
};

const HEART_PHASES = [
  "Rest your hand on your heart.",
  "Feel the warmth.",
  "Breathe slowly.",
];

const MAX_TEXT = 1000;

const StepModal: React.FC<Props> = ({
  visible,
  stepPayload,
  label,
  presentation = "sheet",
  onCancel,
  onDone,
  errorMessage,
  isSubmitting = false,
  isRoomGuided = false,
  helperLine = null,
}) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [sheetHeight, setSheetHeight] = useState(0);
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const kind = useMemo(
    () => classifyStep(stepPayload?.template_id),
    [stepPayload?.template_id],
  );
  const isImmersiveTextInput =
    presentation === "screen" && kind === "text_input";
  const contextLine: string | null =
    stepPayload?.memory_modal?.sanatan_context ??
    stepPayload?.memory_modal?.why_we_ask ??
    helperLine ??
    null;

  const handleSheetLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = event.nativeEvent.layout.height || 0;
    setSheetHeight((prev) =>
      Math.abs(prev - nextHeight) > 1 ? nextHeight : prev,
    );
  }, []);

  const topSafeGap = insets.top + 20;
  const maxKeyboardLift =
    sheetHeight > 0
      ? Math.max(0, windowHeight - topSafeGap - sheetHeight)
      : Number.MAX_SAFE_INTEGER;
  const keyboardLift =
    keyboardHeight > 0
      ? Math.min(Math.max(0, keyboardHeight - 18), maxKeyboardLift)
      : 0;

  useEffect(() => {
    if (!visible) {
      setKeyboardHeight(0);
      return;
    }

    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates?.height || 0);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onCancel}
      transparent={presentation === "sheet"}
    >
      <View
        style={[
          styles.scrim,
          presentation === "screen" ? styles.screenScrim : null,
        ]}
      >
        {presentation === "sheet" ? (
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onCancel}
          />
        ) : null}
        <View
          onLayout={handleSheetLayout}
          style={[
            styles.sheet,
            presentation === "screen" ? styles.screenSheet : null,
            keyboardLift > 0 && { marginBottom: keyboardLift },
          ]}
        >
          <ImageBackground
            source={require("../../../../assets/beige_bg.png")}
            style={styles.sheetBackground}
            imageStyle={[
              styles.sheetImage,
              presentation === "screen" ? styles.screenImage : null,
            ]}
          >
            <View
              style={[
                styles.keyboardAvoid,
                presentation === "screen" ? styles.screenKeyboardAvoid : null,
                presentation === "screen"
                  ? {
                      paddingTop: insets.top + 8,
                      paddingBottom: Math.max(insets.bottom, 16),
                    }
                  : null,
              ]}
            >
              {presentation === "sheet" ? <View style={styles.handle} /> : null}
              <View
                style={[
                  styles.headerCancelRow,
                  presentation === "screen"
                    ? styles.screenHeaderCancelRow
                    : null,
                ]}
              >
                {!isImmersiveTextInput ? (
                  <TouchableOpacity
                    onPress={onCancel}
                    accessibilityRole="button"
                    accessibilityLabel="Cancel"
                    testID="step_modal_cancel"
                  >
                    <Text style={styles.headerCancel}>Cancel</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              {!isImmersiveTextInput ? (
                <Text style={styles.headerTitle} numberOfLines={2}>
                  {label}
                </Text>
              ) : null}

              <View
                style={[
                  styles.body,
                  presentation === "screen" ? styles.screenBody : null,
                  isSubmitting && styles.bodySubmitting,
                ]}
                testID="step_modal_body"
                pointerEvents={isSubmitting ? "none" : "auto"}
              >
                {isImmersiveTextInput ? (
                  <ScreenTextInputExperience
                    stepPayload={stepPayload}
                    label={label}
                    onCancel={onCancel}
                    onDone={onDone}
                  />
                ) : null}
                {kind === "timer_breathe" ||
                kind === "timer_walk" ||
                kind === "timer_sit" ||
                kind === "timer_heart" ? (
                  <TimerBody
                    kind={kind}
                    stepPayload={stepPayload}
                    onDone={onDone}
                    isScreen={presentation === "screen"}
                    isRoomGuided={isRoomGuided}
                    contextLine={contextLine}
                  />
                ) : null}

                {kind === "text_input" && !isImmersiveTextInput ? (
                  <TextInputBody
                    stepPayload={stepPayload}
                    onDone={onDone}
                    isScreen={presentation === "screen"}
                  />
                ) : null}

                {kind === "grounding" ? (
                  <GroundingBody
                    onDone={onDone}
                    isScreen={presentation === "screen"}
                    isRoomGuided={isRoomGuided}
                    contextLine={contextLine}
                  />
                ) : null}

                {kind === "voice_note" ? (
                  <VoiceNoteBody stepPayload={stepPayload} onDone={onDone} />
                ) : null}

                {kind === "reach_out" ? (
                  <ReachOutBody stepPayload={stepPayload} onDone={onDone} />
                ) : null}

                {kind === "unknown" ? <UnknownBody onDone={onDone} /> : null}
              </View>
              {!!errorMessage && (
                <Text style={styles.modalError} testID="step_modal_error">
                  {errorMessage}
                </Text>
              )}
            </View>
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
  isScreen?: boolean;
  isRoomGuided?: boolean;
  contextLine?: string | null;
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
  return "Let your thoughts settle like dust in still water.";
}

const WALK_ANIMATION_END_FRAME = 68;
const WALK_PERSON_COLOR = "#4A3B2F";

const BreathingOrb: React.FC<{
  running: boolean;
  inhaleMs: number;
  exhaleMs: number;
}> = ({ running, inhaleMs, exhaleMs }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const [phase, setPhase] = useState("Inhale");
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearPhaseTimer = useCallback(() => {
    if (!phaseTimerRef.current) return;
    clearTimeout(phaseTimerRef.current);
    phaseTimerRef.current = null;
  }, []);

  const stopBreathingLoop = useCallback(() => {
    animationRef.current?.stop();
    animationRef.current = null;
  }, []);

  useEffect(() => {
    const inhaleDuration = inhaleMs > 0 ? inhaleMs : 4000;
    const exhaleDuration = exhaleMs > 0 ? exhaleMs : 6000;
    let cancelled = false;

    const schedulePhaseCycle = () => {
      if (cancelled) return;
      setPhase("Inhale");
      phaseTimerRef.current = setTimeout(() => {
        if (cancelled) return;
        setPhase("Exhale");
        phaseTimerRef.current = setTimeout(() => {
          schedulePhaseCycle();
        }, exhaleDuration);
      }, inhaleDuration);
    };

    stopBreathingLoop();
    clearPhaseTimer();

    if (running) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.3,
            duration: inhaleDuration,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: exhaleDuration,
            useNativeDriver: true,
          }),
        ]),
      );
      animationRef.current = loop;
      loop.start();
      schedulePhaseCycle();
    } else {
      stopBreathingLoop();
      clearPhaseTimer();
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
      setPhase("Inhale");
    }

    return () => {
      cancelled = true;
      stopBreathingLoop();
      clearPhaseTimer();
    };
  }, [running, inhaleMs, exhaleMs, stopBreathingLoop, clearPhaseTimer, scale]);

  return (
    <View style={styles.orbContainer}>
      {/* Outer glow/soft shadow layer */}
      <Animated.View
        style={[
          styles.orbGlow,
          {
            transform: [{ scale }],
            opacity: scale.interpolate({
              inputRange: [1, 1.3],
              outputRange: [0.3, 0.6],
            }),
          },
        ]}
      />

      <Animated.View
        style={[
          styles.circle,
          {
            transform: [{ scale }],
          },
        ]}
      >
        {Platform.OS === "ios" ? (
          <BlurView intensity={40} style={styles.blurWrapper}>
            <View style={styles.innerGlass}>
              <Text style={styles.circleText}>{phase}</Text>
            </View>
          </BlurView>
        ) : (
          <View style={[styles.blurWrapper, styles.androidCircleFill]}>
            <View style={styles.innerGlass}>
              <Text style={styles.circleText}>{phase}</Text>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const TimerBody: React.FC<TimerBodyProps> = ({
  kind,
  stepPayload,
  onDone,
  isScreen = false,
  isRoomGuided = false,
  contextLine = null,
}) => {
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

  const baseCueText =
    (stepPayload?.cue_text && String(stepPayload.cue_text)) ||
    defaultInstruction(kind);

  const [remaining, setRemaining] = useState<number>(totalSec);
  const [running, setRunning] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lottieRef = useRef<LottieView>(null);
  const atZero = remaining <= 0;
  const hasCompletedRef = useRef(false);

  // Pre-start state for room-guided auto-start kinds.
  const autoStartKinds = ["timer_breathe", "timer_sit", "timer_heart"];
  const isAutoStart = isRoomGuided && autoStartKinds.includes(kind);
  const [preStartVisible, setPreStartVisible] = useState(isAutoStart);

  // Soft pre-start: show "Let's begin gently…" for 600ms then start timer.
  useEffect(() => {
    if (!isAutoStart) return;
    hasCompletedRef.current = false;
    setPreStartVisible(true);
    const t = setTimeout(() => {
      setPreStartVisible(false);
      setRunning(true);
    }, 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoStart]);

  // Heart phase rotation: cycle every 10s when running.
  const [heartPhase, setHeartPhase] = useState(0);
  useEffect(() => {
    if (kind !== "timer_heart" || !running || !isRoomGuided) return;
    const t = setInterval(() => {
      setHeartPhase((p) => Math.min(p + 1, HEART_PHASES.length - 1));
    }, 10000);
    return () => clearInterval(t);
  }, [kind, running, isRoomGuided]);

  // Sit ambient pulse animation.
  const sitOpacity = useRef(new Animated.Value(0.35)).current;
  useEffect(() => {
    if (kind !== "timer_sit" || !isRoomGuided) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(sitOpacity, { toValue: 0.65, duration: 2000, useNativeDriver: true }),
        Animated.timing(sitOpacity, { toValue: 0.35, duration: 2000, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [kind, isRoomGuided, sitOpacity]);

  // Heart pulse animation.
  const heartScale = useRef(new Animated.Value(1.0)).current;
  useEffect(() => {
    if (kind !== "timer_heart" || !isRoomGuided) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(heartScale, { toValue: 1.08, duration: 600, useNativeDriver: true }),
        Animated.timing(heartScale, { toValue: 1.0, duration: 600, useNativeDriver: true }),
      ]),
    );
    anim.start();
    return () => anim.stop();
  }, [kind, isRoomGuided, heartScale]);

  useEffect(() => {
    if (kind !== "timer_walk") return;
    if (running && !atZero) {
      // The source JSON has trailing empty frames; play only the active range.
      lottieRef.current?.play(0, WALK_ANIMATION_END_FRAME);
      return;
    }
    lottieRef.current?.pause();
  }, [running, atZero, kind]);

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

  useEffect(() => {
    if (atZero) setRunning(false);
  }, [atZero]);

  const [completionLineText, setCompletionLineText] = useState<string | null>(null);
  useEffect(() => {
    if (!atZero || !isRoomGuided || hasCompletedRef.current) return;
    hasCompletedRef.current = true;
    const line = TIMER_COMPLETION_LINES[kind] ?? null;
    if (line) setCompletionLineText(line);
  }, [atZero, isRoomGuided, kind]);

  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const timeLabel = `${mm.toString().padStart(1, "0")}:${ss
    .toString()
    .padStart(2, "0")}`;

  // Display cue: heart uses phase rotation in room context; others use baseCueText.
  const displayCue = (kind === "timer_heart" && isRoomGuided)
    ? HEART_PHASES[heartPhase]
    : baseCueText;

  return (
    <View style={[styles.timerRoot, isScreen ? styles.screenTimerRoot : null]}>
      {/* Completion line overlay (room-guided) */}
      {completionLineText ? (
        <View style={styles.timerCompletionOverlay}>
          <Text style={styles.timerCompletionLine}>{completionLineText}</Text>
          <TouchableOpacity style={styles.timerContinueBtn} onPress={() => onDone({})}>
            <Text style={styles.timerContinueBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Pre-start hint */}
      <Text
        style={isRoomGuided ? styles.timerCueRoom : styles.timerCue}
        testID="step_modal_timer_cue"
      >
        {preStartVisible ? "Let's begin gently…" : displayCue}
      </Text>

      {kind === "timer_breathe" && (
        <BreathingOrb
          running={running}
          inhaleMs={Number(stepPayload?.step_config?.inhale ?? 0) * 1000}
          exhaleMs={Number(stepPayload?.step_config?.exhale ?? 0) * 1000}
        />
      )}

      {/* Sit ambient: pulsing lotus icon */}
      {kind === "timer_sit" && isRoomGuided && (
        <Animated.View style={[styles.sitIconWrap, { opacity: sitOpacity }]}>
          <Ionicons name="leaf-outline" size={48} color="#A68246" />
        </Animated.View>
      )}

      {/* Hand on heart: pulsing heart icon */}
      {kind === "timer_heart" && isRoomGuided && (
        <Animated.View style={[styles.heartIconWrap, { transform: [{ scale: heartScale }] }]}>
          <Ionicons name="heart-outline" size={32} color="#A68246" />
        </Animated.View>
      )}

      {kind === "timer_walk" && (
        <View style={styles.walkingAnimationContainer}>
          <LottieView
            ref={lottieRef}
            source={require("../../../../assets/Walking Animation.json")}
            autoPlay={false}
            loop={false}
            style={styles.walkingAnimation}
            colorFilters={[
              { keypath: "Fill 1", color: WALK_PERSON_COLOR },
              { keypath: "**.Fill 1", color: WALK_PERSON_COLOR },
            ]}
            onAnimationFinish={() => {
              if (running && !atZero) {
                lottieRef.current?.play(0, WALK_ANIMATION_END_FRAME);
              }
            }}
          />
        </View>
      )}

      {isRoomGuided && contextLine ? (
        <Text style={styles.timerContextLine}>{contextLine}</Text>
      ) : null}

      <Text
        style={isRoomGuided ? styles.timerDigitsRoom : styles.timerDigits}
        testID="step_modal_timer_digits"
      >
        {timeLabel}
      </Text>
      <View style={styles.timerControls}>
        {/* Auto-start kinds hide the Start button in room context */}
        {!running && !atZero && !isAutoStart ? (
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
            <Text style={styles.ctrlBtnLabel}>{isRoomGuided ? "Rest" : "Pause"}</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          style={[styles.ctrlBtn, styles.ctrlDone]}
          onPress={() => {
            hasCompletedRef.current = true;
            onDone({});
          }}
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
  isScreen?: boolean;
}

const TextInputBody: React.FC<TextInputBodyProps> = ({
  stepPayload,
  onDone,
  isScreen = false,
}) => {
  const mm = stepPayload?.memory_modal;
  const [text, setText] = useState<string>("");
  const promptSlot = stepPayload?.step_config?.prompt_slot;
  const promptText =
    mm?.prompt ||
    (stepPayload?.prompt && String(stepPayload.prompt)) ||
    (typeof promptSlot === "string" && PROMPT_SLOT_TEXT[promptSlot]) ||
    "Take a moment and write what comes.";
  const placeholderText = mm?.placeholder || "Type what you feel..";
  const doneLabel = mm?.primary_label || "Done";

  const trimmed = text.trim();
  const enabled = trimmed.length >= 1;

  return (
    <ScrollView
      style={styles.textRoot}
      contentContainerStyle={isScreen ? styles.screenTextContent : undefined}
      keyboardShouldPersistTaps="handled"
    >
      {!!mm?.sanatan_context && (
        <Text
          style={[
            styles.modalSanatanContext,
            isScreen ? styles.screenModalSanatanContext : null,
          ]}
        >
          {mm.sanatan_context}
        </Text>
      )}
      {!!mm?.why_we_ask && (
        <Text
          style={[
            styles.modalWhyWeAsk,
            isScreen ? styles.screenModalWhyWeAsk : null,
          ]}
        >
          {mm.why_we_ask}
        </Text>
      )}
      <Text
        style={[styles.textPrompt, isScreen ? styles.screenTextPrompt : null]}
      >
        {promptText}
      </Text>
      <TextInput
        value={text}
        onChangeText={(v) => setText(v.slice(0, MAX_TEXT))}
        multiline
        textAlignVertical="top"
        style={[styles.textInput, isScreen ? styles.screenTextInput : null]}
        placeholder={placeholderText}
        placeholderTextColor="#B0B0B5"
        testID="step_modal_text_input"
        maxLength={MAX_TEXT}
      />
      <Text
        style={[styles.textCounter, isScreen ? styles.screenTextCounter : null]}
      >
        {text.length} / {MAX_TEXT}
      </Text>
      <TouchableOpacity
        style={[
          styles.primaryAction,
          isScreen ? styles.screenPrimaryAction : null,
          !enabled ? styles.ctrlDisabled : null,
        ]}
        disabled={!enabled}
        onPress={() => onDone({ text: trimmed })}
        testID="step_modal_text_done"
      >
        <Text style={styles.primaryActionLabel}>{doneLabel}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

interface ScreenTextInputExperienceProps {
  stepPayload: StepPayload | null | undefined;
  label: string;
  onCancel: () => void;
  onDone: (extra: StepModalResult) => void;
}

const ScreenTextInputExperience: React.FC<ScreenTextInputExperienceProps> = ({
  stepPayload,
  label,
  onCancel,
  onDone,
}) => {
  const mm = stepPayload?.memory_modal;
  const [text, setText] = useState<string>("");
  const promptSlot = stepPayload?.step_config?.prompt_slot;
  const title = mm?.title || label;
  const promptText =
    mm?.prompt ||
    (stepPayload?.prompt && String(stepPayload.prompt)) ||
    (typeof promptSlot === "string" && PROMPT_SLOT_TEXT[promptSlot]) ||
    "Take a moment and write what comes.";
  const placeholderText = mm?.placeholder || "Type what you feel..";
  const doneLabel = mm?.primary_label || "Done";
  const trimmed = text.trim();
  const enabled = trimmed.length >= 1;

  return (
    <ScrollView
      style={styles.immersiveRoot}
      contentContainerStyle={styles.immersiveContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.immersiveHeaderRow}>
        <TouchableOpacity
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Back"
          testID="step_modal_back"
          style={styles.immersiveBackButton}
        >
          <Text style={styles.immersiveBackIcon}>‹</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel"
          testID="step_modal_cancel"
        >
          <Text style={styles.immersiveCancel}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.immersiveHero}>
        <Image
          source={require("../../../../assets/lotus_icon.png")}
          style={styles.immersiveLotus}
        />
        <Text style={styles.immersiveTitle}>{title}</Text>
        <View style={styles.immersiveDivider}>
          <View style={styles.immersiveDividerLine} />
          <Text style={styles.immersiveDividerDiamond}>◆</Text>
          <View style={styles.immersiveDividerLine} />
        </View>
        {!!mm?.why_we_ask && (
          <Text style={styles.immersiveDescription}>{mm.why_we_ask}</Text>
        )}
        {!!mm?.sanatan_context && (
          <Text style={styles.immersiveSanatan}>{mm.sanatan_context}</Text>
        )}
      </View>

      <Text style={styles.immersivePrompt}>{promptText}</Text>

      <View style={styles.immersiveInputWrap}>
        <TextInput
          value={text}
          onChangeText={(v) => setText(v.slice(0, MAX_TEXT))}
          multiline
          textAlignVertical="top"
          style={styles.immersiveTextInput}
          placeholder={placeholderText}
          placeholderTextColor="#9C9893"
          testID="step_modal_text_input"
          maxLength={MAX_TEXT}
        />
        <Text style={styles.immersiveCounter}>
          {text.length} / {MAX_TEXT}
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.immersivePrimaryAction,
          !enabled ? styles.ctrlDisabled : null,
        ]}
        disabled={!enabled}
        onPress={() => onDone({ text: trimmed })}
        testID="step_modal_text_done"
      >
        <View style={styles.immersivePrimaryInner}>
          <Image
            source={require("../../../../assets/lotus_icon.png")}
            style={styles.immersivePrimaryLotus}
          />
          <Text style={styles.immersivePrimaryLabel}>{doneLabel}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={onCancel} testID="step_modal_go_now">
        <Text style={styles.immersiveSecondaryAction}>I&apos;ll go now</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ─── Grounding (5-4-3-2-1) body ──────────────────────────────────────────

const GroundingBody: React.FC<{
  onDone: (extra: StepModalResult) => void;
  isScreen?: boolean;
  label?: string;
  isRoomGuided?: boolean;
  contextLine?: string | null;
}> = ({ onDone, isScreen = false, label = "Step", isRoomGuided = false, contextLine = null }) => {
  const prompts = isRoomGuided ? GROUNDING_PROMPTS_ROOM : GROUNDING_PROMPTS;
  const [index, setIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<string[]>(["", "", "", "", ""]);
  const [closingText, setClosingText] = useState<string | null>(null);
  const hasCompletedRef = useRef(false);
  const current = answers[index] ?? "";
  const prompt = prompts[index];
  const isLast = index === prompts.length - 1;
  const trimmed = current.trim();
  const enabled = isRoomGuided ? true : trimmed.length >= 1;

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
      if (isRoomGuided && !hasCompletedRef.current) {
        hasCompletedRef.current = true;
        setClosingText("Good. You are here.");
      } else if (!isRoomGuided) {
        onDone({ grounding: answers.map((a) => a.trim()) });
      }
      return;
    }
    setIndex((i) => Math.min(prompts.length - 1, i + 1));
  };

  if (closingText) {
    return (
      <View style={[styles.timerRoot, { alignItems: "center", justifyContent: "center" }]}>
        <Text style={styles.timerCompletionLine}>{closingText}</Text>
        <TouchableOpacity
          style={styles.timerContinueBtn}
          onPress={() => onDone({ grounding: answers.map((a) => a.trim()) })}
        >
          <Text style={styles.timerContinueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isScreen) {
    return (
      <ScrollView
        style={styles.textRoot}
        contentContainerStyle={styles.screenGroundingContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenGroundingTitle}>{label}</Text>
        <Text
          style={[styles.groundingProgress, styles.screenGroundingProgress]}
          testID="step_modal_grounding_progress"
        >
          {index + 1} of {prompts.length}
        </Text>
        <Text style={styles.screenGroundingPrompt}>{prompt}</Text>
        <View style={styles.screenGroundingInputWrap}>
          <TextInput
            value={current}
            onChangeText={setCurrent}
            multiline
            textAlignVertical="top"
            style={styles.screenGroundingInput}
            placeholder="Type what you feel.."
            placeholderTextColor="#B0B0B5"
            testID="step_modal_grounding_input"
            maxLength={MAX_TEXT}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.screenGroundingAction,
            !enabled ? styles.ctrlDisabled : null,
          ]}
          disabled={!enabled}
          onPress={handleNext}
          testID={
            isLast ? "step_modal_grounding_done" : "step_modal_grounding_next"
          }
        >
          <Text style={styles.screenGroundingActionLabel}>
            {isLast ? "Done" : "Next"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.textRoot}
      contentContainerStyle={styles.screenTextContent}
      keyboardShouldPersistTaps="handled"
    >
      {isRoomGuided && index === 0 ? (
        <Text style={styles.groundingOpeningLine}>
          Let us return to the room around you.
        </Text>
      ) : null}
      {isRoomGuided && index === 0 && contextLine ? (
        <Text style={styles.groundingContextLine}>{contextLine}</Text>
      ) : null}
      <Text
        style={styles.groundingProgress}
        testID="step_modal_grounding_progress"
      >
        {index + 1} of {prompts.length}
      </Text>
      <Text style={styles.textPrompt}>{prompt}</Text>
      <TextInput
        value={current}
        onChangeText={setCurrent}
        multiline
        textAlignVertical="top"
        style={styles.textInput}
        placeholder="Type what you feel.."
        placeholderTextColor="#B0B0B5"
        testID="step_modal_grounding_input"
        maxLength={MAX_TEXT}
      />
      {isRoomGuided ? (
        <Text style={styles.groundingHint}>or just notice quietly.</Text>
      ) : null}
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
  const mm = stepPayload?.memory_modal;
  const prompt =
    (stepPayload?.prompt && String(stepPayload.prompt)) ||
    "Reach out — a short message to someone who matters.";
  const primaryLabel = mm?.primary_label || "Copy and close";

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
      {!!mm?.sanatan_context && (
        <Text style={styles.modalSanatanContext}>{mm.sanatan_context}</Text>
      )}
      {!!mm?.why_we_ask && (
        <Text style={styles.modalWhyWeAsk}>{mm.why_we_ask}</Text>
      )}
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
          <Text style={styles.primaryActionLabel}>{primaryLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.ctrlBtn, !enabled ? styles.ctrlDisabled : null]}
          disabled={!enabled}
          onPress={handleDoneWithoutCopy}
          testID="step_modal_reach_out_done"
        >
          <Text style={styles.ctrlBtnLabel}>Save without copying</Text>
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
  screenScrim: {
    backgroundColor: "#F8F2EA",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    maxHeight: "90%",
  },
  screenSheet: {
    flex: 1,
    maxHeight: "100%",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  sheetBackground: {
    width: "100%",
    flex: 1,
  },
  sheetImage: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  screenImage: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  keyboardAvoid: {
    flexShrink: 1,
  },
  screenKeyboardAvoid: {
    flex: 1,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E0E0E2",
    marginTop: 12,
  },
  headerCancelRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 4,
  },
  screenHeaderCancelRow: {
    paddingTop: 0,
    paddingBottom: 8,
  },
  headerCancel: {
    fontSize: 15,
    color: "#6E6E73",
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1C1C1E",
    textAlign: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
    lineHeight: 21,
    marginTop: 80,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
  },
  screenBody: {
    flex: 1,
    paddingBottom: 8,
  },
  immersiveRoot: {
    width: "100%",
  },
  immersiveContent: {
    paddingBottom: 28,
  },
  immersiveHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 28,
  },
  immersiveBackButton: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1.2,
    borderColor: "rgba(191,151,84,0.75)",
    backgroundColor: "rgba(255,255,255,0.52)",
    alignItems: "center",
    justifyContent: "center",
  },
  immersiveBackIcon: {
    fontSize: 30,
    lineHeight: 32,
    color: "#A7792E",
    marginTop: -2,
  },
  immersiveCancel: {
    fontSize: 16,
    color: "#45403A",
  },
  immersiveHero: {
    alignItems: "center",
    marginBottom: 10,
    marginTop: -55,
  },
  immersiveLotus: {
    width: 34,
    height: 26,
    marginBottom: 18,
    opacity: 0.95,
  },
  immersiveTitle: {
    fontSize: 22,
    lineHeight: 38,
    color: "#2C1C11",
    textAlign: "center",
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    paddingHorizontal: 24,
  },
  immersiveDivider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
    marginTop: 18,
    marginBottom: 22,
  },
  immersiveDividerLine: {
    width: 48,
    height: 1,
    backgroundColor: "rgba(184,134,50,0.42)",
  },
  immersiveDividerDiamond: {
    fontSize: 16,
    lineHeight: 16,
    color: "#B88632",
  },
  immersiveDescription: {
    fontSize: 14,
    lineHeight: 28,
    color: "#35302B",
    textAlign: "center",
    marginBottom: 18,
    maxWidth: 640,
    paddingHorizontal: 8,
  },
  immersiveSanatan: {
    fontSize: 14,
    lineHeight: 28,
    color: "#A97817",
    fontStyle: "italic",
    textAlign: "center",
    maxWidth: 560,
    paddingHorizontal: 10,
  },
  immersivePrompt: {
    fontSize: 14,
    lineHeight: 24,
    color: "#2E241B",
    textAlign: "center",
    fontWeight: "700",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    marginBottom: 18,
    paddingHorizontal: 20,
  },
  immersiveInputWrap: {
    position: "relative",
    marginBottom: 24,
  },
  immersiveTextInput: {
    width: "100%",
    minHeight: 210,
    borderWidth: 1,
    borderColor: "rgba(196,181,161,0.92)",
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingTop: 5,
    paddingBottom: 54,
    fontSize: 13,
    lineHeight: 27,
    color: "#1C1C1E",
    backgroundColor: "rgba(255,255,255,0.72)",
    shadowColor: "#482E0D",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  },
  immersiveCounter: {
    position: "absolute",
    right: 22,
    bottom: 18,
    fontSize: 13,
    color: "#75706A",
  },
  immersivePrimaryAction: {
    width: "100%",
    minHeight: 45,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(85,42,11,0.22)",
    backgroundColor: "#5A2D0C",
    shadowColor: "#5E330F",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 22,
    elevation: 4,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  immersivePrimaryInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  immersivePrimaryLotus: {
    width: 22,
    height: 18,
    tintColor: "#F1D089",
  },
  immersivePrimaryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFF7EF",
  },
  immersiveSecondaryAction: {
    alignSelf: "center",
    fontSize: 14,
    color: "#4A433C",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(72,57,41,0.45)",
    paddingBottom: 3,
  },

  // Timer
  timerRoot: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  screenTimerRoot: {
    paddingTop: 36,
  },
  timerCue: {
    fontSize: 16,
    color: "#3C3C43",
    textAlign: "center",
    marginBottom: 24,
  },
  timerCueRoom: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 18,
    color: "#4a3a20",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 26,
  },
  timerDigits: {
    fontSize: 64,
    fontVariant: ["tabular-nums"],
    color: "#1C1C1E",
    marginBottom: 32,
    marginTop: 24,
  },
  timerDigitsRoom: {
    fontSize: 13,
    fontVariant: ["tabular-nums"],
    color: "#8b7a55",
    marginBottom: 24,
    marginTop: 16,
  },
  timerCompletionOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    backgroundColor: "transparent",
  },
  timerCompletionLine: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 20,
    fontStyle: "italic",
    color: "#432104",
    textAlign: "center",
    paddingHorizontal: 32,
    lineHeight: 30,
  },
  timerContinueBtn: {
    marginTop: 28,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: "#6B4A1E",
  },
  timerContinueBtnText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 16,
    color: "#FBF6EF",
    letterSpacing: 0.5,
  },
  sitIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 16,
  },
  heartIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  circle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: "rgba(230, 211, 163, 0.6)",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden", // Important for BlurView
    shadowColor: Platform.OS === "ios" ? "#000" : "transparent",
    shadowOffset:
      Platform.OS === "ios" ? { width: 0, height: 8 } : { width: 0, height: 0 },
    shadowOpacity: Platform.OS === "ios" ? 0.15 : 0,
    shadowRadius: Platform.OS === "ios" ? 16 : 0,
    elevation: Platform.OS === "android" ? 0 : 10,
  },
  blurWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  androidCircleFill: {
    backgroundColor: "rgba(255, 255, 255, 0.7)",
  },
  innerGlass: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  orbContainer: {
    width: 280,
    height: 280,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  orbGlow: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "#E6D3A3",
  },
  orbHighlight: {
    position: "absolute",
    top: 20,
    left: 40,
    width: 60,
    height: 30,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    transform: [{ rotate: "-25deg" }],
  },
  circleText: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 24,
    fontWeight: "500",
    color: "#4A3B2F",
    letterSpacing: 0.5,
    textShadowColor: "rgba(255, 255, 255, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  timerControls: {
    flexDirection: "row",
    gap: 12,
  },

  modalSanatanContext: {
    fontSize: 13,
    color: "#8B6914",
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 6,
    lineHeight: 19,
    paddingHorizontal: 4,
  },
  modalWhyWeAsk: {
    fontSize: 13,
    color: "#5C5C5C",
    textAlign: "center",
    marginBottom: 14,
    lineHeight: 19,
    paddingHorizontal: 4,
  },
  // Text input
  textRoot: {
    width: "100%",
  },
  screenTextContent: {
    paddingBottom: 28,
  },
  textPrompt: {
    fontSize: 16,
    color: "#3C3C43",
    marginBottom: 16,
    lineHeight: 22,
  },
  screenTextPrompt: {
    fontSize: 18,
    color: "#4A3B2F",
    textAlign: "center",
    lineHeight: 32,
    marginBottom: 22,
    paddingHorizontal: 6,
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
  screenTextInput: {
    minHeight: 220,
    borderRadius: 22,
    borderColor: "rgba(201,168,76,0.32)",
    backgroundColor: "rgba(255,255,255,0.76)",
    paddingHorizontal: 20,
    paddingVertical: 18,
    fontSize: 16,
    lineHeight: 26,
  },
  textCounter: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "right",
    marginTop: 6,
    marginBottom: 16,
  },
  screenTextCounter: {
    color: "#8B6A43",
    fontSize: 13,
    marginTop: 10,
    marginBottom: 22,
  },

  // Grounding
  groundingProgress: {
    fontSize: 12,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 8,
  },
  groundingOpeningLine: {
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    fontSize: 15,
    fontStyle: "italic",
    color: "#8b7a55",
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 22,
  },
  groundingContextLine: {
    fontSize: 13,
    color: "#8b7a55",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: -8,
    marginBottom: 12,
    paddingHorizontal: 20,
    lineHeight: 19,
  },
  timerContextLine: {
    fontSize: 13,
    color: "#8b7a55",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 24,
    lineHeight: 19,
  },
  groundingHint: {
    fontSize: 13,
    color: "#8b7a55",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
    fontStyle: "italic",
  },
  screenGroundingContent: {
    paddingBottom: 28,
  },
  screenGroundingTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1C1E",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  screenGroundingProgress: {
    color: "#A57A2B",
    fontSize: 14,
    marginBottom: 18,
  },
  screenGroundingPrompt: {
    fontSize: 18,
    color: "#432104",
    textAlign: "center",
    lineHeight: 30,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  screenGroundingInputWrap: {
    marginBottom: 18,
  },
  screenGroundingInput: {
    minHeight: 210,
    borderWidth: 1,
    borderColor: "rgba(214, 183, 130, 0.7)",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingVertical: 24,
    fontSize: 16,
    color: "#1C1C1E",
    backgroundColor: "rgba(255,255,255,0.56)",
    lineHeight: 26,
  },
  screenGroundingAction: {
    width: "100%",
    minHeight: 45,
    borderRadius: 999,

    backgroundColor: "rgb(67, 33, 4)",
    alignItems: "center",
    justifyContent: "center",
  },
  screenGroundingActionLabel: {
    fontSize: 17,
    fontWeight: "600",
    color: "#ffffff",
  },

  // Controls
  ctrlBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1C1C1E",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 92,
  },
  ctrlBtnLabel: {
    fontSize: 15,
    color: "#432104",
  },
  ctrlDone: {
    backgroundColor: "#FBF5F5",
    borderColor: "#D8D8D8",
  },
  ctrlDoneLabel: {
    color: "#432104",
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
  screenPrimaryAction: {
    height: 58,
    borderRadius: 999,
    borderColor: "rgba(214,183,130,0.24)",
    backgroundColor: "rgba(255,255,255,0.72)",
    shadowColor: "#A57A2B",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 3,
    marginTop: 0,
  },
  primaryActionLabel: {
    fontFamily: Platform.OS === "ios" ? "System" : "sans-serif",
    fontSize: 17,
    fontWeight: "600",
    color: "#432104",
  },
  screenModalSanatanContext: {
    fontSize: 18,
    lineHeight: 30,
    color: "#A57A2B",
    marginBottom: 14,
    paddingHorizontal: 14,
  },
  screenModalWhyWeAsk: {
    fontSize: 16,
    lineHeight: 28,
    color: "#6E6357",
    marginBottom: 24,
    paddingHorizontal: 10,
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
  walkingAnimationContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
  },
  walkingAnimation: {
    width: "100%",
    height: "100%",
  },
  bodySubmitting: {
    opacity: 0.55,
  },
  modalError: {
    color: "#C0392B",
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
});

export default StepModal;
