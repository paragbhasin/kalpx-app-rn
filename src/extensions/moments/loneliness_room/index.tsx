/**
 * LonelinessRoomContainer — Mitra v3 Moment M47 (support room, Tier 1 batch).
 *
 * First batch-expansion migration after the Phase C pilot trio. Structural
 * mirror of M46 grief_room migration; same sovereignty + null-safe rules.
 *
 * Slot keys (null-safe "" fallback, no TSX English):
 *   loneliness_room.opening_line / second_beat_line / offer_intro_text
 *   loneliness_room.pill_name_label / pill_bhakti_label / pill_chant_label
 *   loneliness_room.pill_reach_out_label / pill_walk_label / pill_exit_label
 *   loneliness_room.input_naming_prompt / input_person_prompt
 *   loneliness_room.input_placeholder / input_submit_label / input_cancel_label
 *
 * PresentationContext highlights:
 *   user_attention_state=grieving_shut_down (60-char cap, same as M46)
 *   emotional_weight=heavy (weight_guard filters celebration + cheer)
 *   silence_tolerance_sec=2 (component auto-reveals options after 2s,
 *     vs M46's 30s — loneliness invites connection faster)
 *
 * Spec refs:
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

const readSlot = (ss: Record<string, any>, key: string): string => {
  const moment = ss.loneliness_room;
  if (moment && typeof moment === "object" && typeof moment[key] === "string") {
    return moment[key];
  }
  return "";
};

interface Props {
  block?: any;
}

const LonelinessRoomContainer: React.FC<Props> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const ss = screenData as Record<string, any>;
  const [step, setStep] = useState<"opening" | "options" | "input">("opening");
  const [inputType, setInputType] = useState<"naming" | "person">("naming");
  const [inputValue, setInputValue] = useState("");

  const fade1 = useRef(new Animated.Value(0)).current;
  const fade2 = useRef(new Animated.Value(0)).current;
  const resolveFiredRef = useRef(false);

  // Phase C Tier 1 — resolve loneliness_room slots on mount.
  useEffect(() => {
    if (resolveFiredRef.current) return;
    if (ss.loneliness_room && typeof ss.loneliness_room === "object") {
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
      emotional_weight: "heavy" as const,
      cycle_day: Number(ss.day_number) || 0,
      entered_via:
        typeof ss._entered_via === "string" && ss._entered_via
          ? ss._entered_via
          : "check_in_anandamaya_klesha_asmita_isolation",
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
      const payload = await mitraResolveMoment("M47_loneliness_room", resolveCtx);
      if (cancelled || !payload) return;
      store.dispatch(
        screenActions.setScreenValue({
          key: "loneliness_room",
          value: payload.slots,
        }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // `bhakti_mantra`, `companioned_chant`, `walk_duration_min` are data
  // handles (practice pointers), not user-facing copy.
  const bhaktiMantra = (ss as any).bhakti_mantra;
  const companionedChant = (ss as any).companioned_chant;

  // Slot reads — backend-authored, null-safe.
  const openingLine = readSlot(ss, "opening_line");
  const secondBeatLine = readSlot(ss, "second_beat_line");
  const offerIntroText = readSlot(ss, "offer_intro_text");
  const pillNameLabel = readSlot(ss, "pill_name_label");
  const pillBhaktiLabel = readSlot(ss, "pill_bhakti_label");
  const pillChantLabel = readSlot(ss, "pill_chant_label");
  const pillReachOutLabel = readSlot(ss, "pill_reach_out_label");
  const pillWalkLabel = readSlot(ss, "pill_walk_label");
  const pillExitLabel = readSlot(ss, "pill_exit_label");
  const inputNamingPrompt = readSlot(ss, "input_naming_prompt");
  const inputPersonPrompt = readSlot(ss, "input_person_prompt");
  const inputPlaceholder = readSlot(ss, "input_placeholder");
  const inputSubmitLabel = readSlot(ss, "input_submit_label");
  const inputCancelLabel = readSlot(ss, "input_cancel_label");

  useEffect(() => {
    // Stage 1: Opening line
    Animated.timing(fade1, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      // Stage 2: Second beat after 2 seconds
      setTimeout(() => {
        setStep("options");
        Animated.timing(fade2, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      }, 2000);
    });
  }, [fade1, fade2]);

  const dispatch = (actionType: string, actionTarget?: any, actionPayload?: any) =>
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

  const handleInputSubmit = () => {
    if (inputType === "naming") {
      dispatch("loneliness_named", { text: inputValue });
    } else {
      dispatch("loneliness_person_named", { text: inputValue });
    }
    setInputValue("");
    setStep("options");
  };

  const renderOptions = () => (
    <Animated.View style={[styles.optionsStack, { opacity: fade2 }]}>
      <Text style={styles.offerText}>{offerIntroText}</Text>

      <TouchableOpacity
        style={styles.pill}
        onPress={() => {
          setInputType("naming");
          setStep("input");
        }}
      >
        <Text style={styles.pillText}>{pillNameLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pill}
        onPress={() => dispatch("start_runner",
          { container_id: "practice_runner", state_id: "mantra_runner" },
          { source: "support_loneliness", variant: "mantra", target_reps: 27, item: bhaktiMantra }
        )}
      >
        <Text style={styles.pillText}>{pillBhaktiLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pill}
        onPress={() => dispatch("start_runner",
          { container_id: "practice_runner", state_id: "mantra_runner" },
          { source: "support_loneliness", variant: "mantra", target_reps: 11, item: companionedChant }
        )}
      >
        <Text style={styles.pillText}>{pillChantLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pill}
        onPress={() => {
          setInputType("person");
          setStep("input");
        }}
      >
        <Text style={styles.pillText}>{pillReachOutLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pill}
        onPress={() => dispatch("loneliness_walk_started", null, { duration_min: (ss as any).walk_duration_min || 10 })}
      >
        <Text style={styles.pillText}>{pillWalkLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.exitBtn}
        onPress={() => dispatch("exit_loneliness_room")}
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
      <Text style={styles.openingLine}>
        {inputType === "naming" ? inputNamingPrompt : inputPersonPrompt}
      </Text>
      <TextInput
        autoFocus
        style={styles.input}
        placeholder={inputPlaceholder}
        placeholderTextColor="#8a7d6b"
        value={inputValue}
        onChangeText={setInputValue}
        multiline
        maxLength={300}
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
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fade1, marginBottom: 40 }}>
          <Text style={styles.openingLine}>{openingLine}</Text>
          <Text style={styles.secondBeat}>{secondBeatLine}</Text>
        </Animated.View>

        {step === "options" && renderOptions()}
        {step === "input" && renderInput()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fffdf9", // Spec: warm cream
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 80,
    paddingBottom: 60,
  },
  openingLine: {
    fontFamily: Fonts.serif.regular,
    fontSize: 24,
    color: "#2b1d0a",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 32,
  },
  secondBeat: {
    fontFamily: Fonts.serif.regular,
    fontSize: 24,
    color: "#2b1d0a",
    textAlign: "center",
    lineHeight: 32,
  },
  offerText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#8a7d6b",
    textAlign: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  optionsStack: {
    width: "100%",
    gap: 12,
  },
  pill: {
    borderWidth: 1,
    borderColor: "#EDE1D3",
    borderRadius: 28,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    backgroundColor: "#FFFDF7",
  },
  pillText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    color: "#432104",
  },
  exitBtn: {
    marginTop: 32,
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
  input: {
    width: "100%",
    minHeight: 120,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EDE1D3",
    padding: 16,
    fontFamily: Fonts.sans.regular,
    fontSize: 16,
    color: "#432104",
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

export default LonelinessRoomContainer;
