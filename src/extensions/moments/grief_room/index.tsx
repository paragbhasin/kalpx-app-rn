/**
 * GriefRoomContainer — Mitra v3 Moment M46 (support room, high-stakes).
 *
 * Phase C pilot migration — content sovereignty compliant.
 *   Before: ctx fallback (l.34-37) + 5 pill labels + input prompts all
 *           hard-coded English. TSX held the grief-room voice, which
 *           made variant rotation and locale support impossible.
 *   After: all user-facing strings read from screenData.grief_room.*
 *          slots resolved by kalpx/core/content backend
 *          (moment_id=M46_grief_room). NO English fallback in TSX.
 *          Missing content surfaces via MitraDecisionLog, not hidden.
 *
 * Slot keys (null-safe "" fallback):
 *   grief_room.opening_line
 *   grief_room.second_beat_line
 *   grief_room.pill_breathe_label / pill_speak_label / pill_mantra_label
 *   grief_room.pill_stay_label / pill_exit_label
 *   grief_room.input_prompt / input_placeholder
 *   grief_room.input_submit_label / input_cancel_label
 *
 * Authoring constraints honored by the backing ContentPack:
 *   - user_attention_state=grieving_shut_down → 60-char body cap
 *   - emotional_weight=maximum → weight_guard filters celebration/cheer
 *   - silence_tolerance_sec=30 → component auto-reveals options after 30s;
 *     copy MUST NOT pressure a tap. Honoring this is the whole moment.
 *
 * Spec refs:
 *   kalpx-app-rn/docs/PRESENTATION_CONTEXT_WALKTHROUGHS.md §5 (M46)
 *   kalpx-app-rn/docs/CONTENT_CONTRACT_V1.md
 *   kalpx-app-rn/docs/ORCHESTRATION_CONTRACT_V1.md
 */

import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Fonts } from "../../../theme/fonts";
import { executeAction } from "../../../engine/actionExecutor";
import { mitraResolveMoment } from "../../../engine/mitraApi";
import { useScreenStore } from "../../../engine/useScreenBridge";
import store from "../../../store";
import { screenActions } from "../../../store/screenSlice";

/**
 * Read a slot from screenData.grief_room with null-safe "" fallback.
 * No English fallback — blank UI exposes missing content via telemetry.
 */
const readSlot = (ss: Record<string, any>, key: string): string => {
  const moment = ss.grief_room;
  if (moment && typeof moment === "object" && typeof moment[key] === "string") {
    return moment[key];
  }
  return "";
};

interface Props {
  block?: any;
}

const GriefRoomContainer: React.FC<Props> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const ss = screenData as Record<string, any>;
  const [step, setStep] = useState<"opening" | "options" | "input">("opening");
  const [inputValue, setInputValue] = useState("");
  const [actionsUsed, setActionsUsed] = useState<string[]>([]);

  const fade1 = useRef(new Animated.Value(0)).current;
  const fade2 = useRef(new Animated.Value(0)).current;
  const dotScale = useRef(new Animated.Value(1)).current;
  const resolveFiredRef = useRef(false);

  // Phase C M46 pilot — resolve grief_room content slots on mount.
  // PresentationContext declared fields are FIXED for this surface:
  //   user_attention_state=grieving_shut_down (load-bearing; wrong tone harms)
  //   emotional_weight=maximum (weight_guard filters celebration/cheer)
  // Variable signals (path, guidance_mode, locale) come from screenData.
  useEffect(() => {
    if (resolveFiredRef.current) return;
    if (ss.grief_room && typeof ss.grief_room === "object") {
      // Already populated (prior mount or server-side seed).
      resolveFiredRef.current = true;
      return;
    }
    resolveFiredRef.current = true;
    const cycleId =
      typeof ss.journey_id === "string" && ss.journey_id
        ? ss.journey_id
        : typeof ss.cycle_id === "string" && ss.cycle_id
          ? ss.cycle_id
          : "";
    const resolveCtx = {
      path: "support" as const,
      guidance_mode: (ss.guidance_mode || "hybrid") as
        | "universal"
        | "hybrid"
        | "rooted",
      locale: (ss.locale || "en") as string,
      user_attention_state: "grieving_shut_down",
      emotional_weight: "maximum" as const,
      cycle_day: Number(ss.day_number) || 0,
      entered_via:
        typeof ss._entered_via === "string" && ss._entered_via
          ? ss._entered_via
          : "check_in_anandamaya_klesha_asmita",
      stage_signals: {},
      today_layer: {
        today_kosha: ss.today_kosha || "anandamaya",
        today_klesha: ss.today_klesha || "asmita",
      },
      life_layer: {
        cycle_id: cycleId,
        life_kosha: (ss.life_kosha || ss.scan_focus || "") as string,
        scan_focus: (ss.scan_focus || "") as string,
        life_klesha: ss.life_klesha || null,
        life_vritti: ss.life_vritti || null,
        life_goal: ss.life_goal || null,
      },
    };
    let cancelled = false;
    (async () => {
      const payload = await mitraResolveMoment("M46_grief_room", resolveCtx);
      if (cancelled || !payload) return;
      store.dispatch(
        screenActions.setScreenValue({
          key: "grief_room",
          value: payload.slots,
        }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // PresentationContext silence_tolerance_sec=30 — component honors this
  // by auto-revealing options after 30s. Copy MUST NOT pressure a tap.
  useEffect(() => {
    // Stage 1: Opening line
    Animated.timing(fade1, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    // Subtle breathing dot animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotScale, {
          toValue: 1.3,
          duration: 3000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(dotScale, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Stage 2: Reveal options after 30s (or on user tap)
    const timer = setTimeout(() => {
      revealOptions();
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  const revealOptions = () => {
    if (step === "options" || step === "input") return;
    setStep("options");
    Animated.timing(fade2, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const dispatch = (actionType: string, actionTarget?: any, actionPayload?: any) => {
    if (actionType !== "exit_grief_room") {
      setActionsUsed(prev => [...new Set([...prev, actionType])]);
    }
    executeAction(
      { type: actionType, target: actionTarget, payload: actionPayload },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: store.getState().screen.screenData,
      },
    );
  };

  const handleInputSubmit = () => {
    dispatch("grief_voice_note_submitted", { 
      text: inputValue, 
      length_chars: inputValue.length,
      duration_sec: 0 // Local text fallback for now
    });
    setInputValue("");
    setStep("options");
  };

  // Slot reads. Backend-authored; no TSX English fallback (see §0 of
  // CONTENT_CONTRACT_V1 — missing content stays visibly missing).
  const openingLine = readSlot(ss, "opening_line");
  const secondBeatLine = readSlot(ss, "second_beat_line");
  const pillBreatheLabel = readSlot(ss, "pill_breathe_label");
  const pillSpeakLabel = readSlot(ss, "pill_speak_label");
  const pillMantraLabel = readSlot(ss, "pill_mantra_label");
  const pillStayLabel = readSlot(ss, "pill_stay_label");
  const pillExitLabel = readSlot(ss, "pill_exit_label");
  const inputPrompt = readSlot(ss, "input_prompt");
  const inputPlaceholder = readSlot(ss, "input_placeholder");
  const inputSubmitLabel = readSlot(ss, "input_submit_label");
  const inputCancelLabel = readSlot(ss, "input_cancel_label");

  // `slow_breath` / `grief_mantra` are not content slots — they are
  // practice pointers the backend ships separately (duration, mantra id).
  // Read from screenData without TSX-embedded English for ANY user-facing
  // string; these are data handles, not copy.
  const slowBreath = (ss as any).slow_breath;
  const griefMantra = (ss as any).grief_mantra;

  const renderOptions = () => (
    <Animated.View style={[styles.optionsStack, { opacity: fade2 }]}>
      <Text style={styles.secondBeat}>{secondBeatLine}</Text>

      <TouchableOpacity
        style={styles.pill}
        onPress={() => dispatch("start_runner",
          { container_id: "practice_runner", state_id: "practice_step_runner" },
          {
            source: "support_grief",
            variant: "practice_timer",
            duration_sec: (slowBreath?.duration_min || 9) * 60,
            item: slowBreath,
          }
        )}
      >
        <Text style={styles.pillText}>{pillBreatheLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pill}
        onPress={() => setStep("input")}
      >
        <Text style={styles.pillText}>{pillSpeakLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pill}
        onPress={() => dispatch("start_runner",
          { container_id: "practice_runner", state_id: "mantra_runner" },
          { source: "support_grief", variant: "mantra", target_reps: 27, item: griefMantra }
        )}
      >
        <Text style={styles.pillText}>{pillMantraLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pill}
        onPress={() => dispatch("grief_stay")}
      >
        <Text style={styles.pillText}>{pillStayLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.exitBtn}
        onPress={() => dispatch("exit_grief_room", null, { actions_used: actionsUsed })}
      >
        <Text style={styles.exitText}>{pillExitLabel}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderInput = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.inputWrap}
    >
      <Text style={styles.inputPrompt}>{inputPrompt}</Text>
      <TextInput
        autoFocus
        style={styles.input}
        placeholder={inputPlaceholder}
        placeholderTextColor="#8a7d6b"
        value={inputValue}
        onChangeText={setInputValue}
        multiline
        maxLength={1500}
      />
      <View style={styles.inputActions}>
        <TouchableOpacity style={styles.pill} onPress={handleInputSubmit}>
          <Text style={styles.pillText}>{inputSubmitLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setStep("options")}>
          <Text style={styles.cancelText}>{inputCancelLabel}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={styles.root}
      onPress={revealOptions}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fade1, alignItems: "center" }}>
          <Text style={styles.openingLine}>{openingLine}</Text>

          {step === "opening" && (
            <Animated.View
              style={[styles.dot, { transform: [{ scale: dotScale }] }]}
            />
          )}
        </Animated.View>

        {step === "options" && renderOptions()}
        {step === "input" && renderInput()}
      </ScrollView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F4EAD4", // Spec: deep cream, dim ambient
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 100,
    paddingBottom: 60,
    alignItems: "center",
  },
  openingLine: {
    fontFamily: Fonts.serif.regular,
    fontSize: 24,
    color: "#2b1d0a",
    textAlign: "center",
    lineHeight: 34,
    marginBottom: 60,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D4A017",
    opacity: 0.6,
  },
  secondBeat: {
    fontFamily: Fonts.sans.regular,
    fontSize: 16,
    color: "#8a7d6b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 36,
  },
  optionsStack: {
    width: "100%",
    gap: 12,
  },
  pill: {
    borderWidth: 1,
    borderColor: "rgba(43, 29, 10, 0.15)",
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    backgroundColor: "transparent",
  },
  pillText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    color: "#2b1d0a",
  },
  exitBtn: {
    marginTop: 40,
    alignItems: "center",
    paddingVertical: 12,
  },
  exitText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#8a7d6b",
    textDecorationLine: "underline",
  },
  inputWrap: {
    width: "100%",
    alignItems: "center",
  },
  inputPrompt: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#8a7d6b",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    minHeight: 200,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(43, 29, 10, 0.1)",
    padding: 20,
    fontFamily: Fonts.sans.regular,
    fontSize: 16,
    color: "#2b1d0a",
    marginBottom: 24,
    textAlignVertical: "top",
  },
  inputActions: {
    width: "100%",
    gap: 16,
    alignItems: "center",
  },
  cancelText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#8a7d6b",
  },
});

export default GriefRoomContainer;
