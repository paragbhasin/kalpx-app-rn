/**
 * GriefRoomContainer — Mitra v3 Moment M46 (support room, high-stakes).
 *
 * HYBRID MERGE: content sovereignty shell (ours) + Pavani's audio/walk/animation features.
 *
 * Phase C pilot migration — content sovereignty compliant.
 *   All user-facing strings read from screenData.grief_room.* slots resolved
 *   by kalpx/core/content backend (moment_id=M46_grief_room).
 *   NO English fallback in TSX. Missing content surfaces via MitraDecisionLog.
 *
 * Pavani integrations:
 *   - Audio.Sound playback for "Just sit" mode (Om loop, slot-resolved URL)
 *   - Volume2/VolumeX mute toggle (lucide-react-native)
 *   - LinearGradient breathing orb
 *   - Background image via useScreenStore.updateBackground
 *   - In-component breath timer + "stay" ambient screen
 *
 * Slot keys (null-safe "" fallback):
 *   grief_room.opening_line / second_beat_line
 *   grief_room.pill_breathe_label / pill_speak_label / pill_mantra_label
 *   grief_room.pill_stay_label / pill_exit_label
 *   grief_room.input_prompt / input_placeholder
 *   grief_room.input_submit_label / input_cancel_label
 *   grief_room.breath_title / breath_end_label
 *   grief_room.stay_quote
 *
 * Authoring constraints honored by the backing ContentPack:
 *   - user_attention_state=grieving_shut_down -> 60-char body cap
 *   - emotional_weight=maximum -> weight_guard filters celebration/cheer
 *   - silence_tolerance_sec=30 -> component auto-reveals options after 30s;
 *     copy MUST NOT pressure a tap. Honoring this is the whole moment.
 *
 * Spec refs:
 *   kalpx-app-rn/docs/PRESENTATION_CONTEXT_WALKTHROUGHS.md section 5 (M46)
 *   kalpx-app-rn/docs/CONTENT_CONTRACT_V1.md
 *   kalpx-app-rn/docs/ORCHESTRATION_CONTRACT_V1.md
 */

import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { Volume2, VolumeX } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { executeAction } from "../../../engine/actionExecutor";
import {
  mitraLibrarySearch,
  mitraResolveMoment,
  mitraTrackEvent,
} from "../../../engine/mitraApi";
import { useScreenStore } from "../../../engine/useScreenBridge";
import store from "../../../store";
import { screenActions } from "../../../store/screenSlice";
import { Fonts } from "../../../theme/fonts";

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
  const updateBackground = useScreenStore(
    (state: any) => state.updateBackground,
  );
  const updateHeaderHidden = useScreenStore(
    (state: any) => state.updateHeaderHidden,
  );
  const ss = screenData as Record<string, any>;

  const [step, setStep] = useState<
    "opening" | "options" | "input" | "breath" | "stay"
  >("opening");
  const [breathText, setBreathText] = useState("Inhale");
  const [timerSeconds, setTimerSeconds] = useState(540); // 9 minutes default
  const [inputValue, setInputValue] = useState("");
  const [actionsUsed, setActionsUsed] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const fade1 = useRef(new Animated.Value(0)).current;
  const fade2 = useRef(new Animated.Value(0)).current;
  const dotScale = useRef(new Animated.Value(1)).current;
  const resolveFiredRef = useRef(false);

  // --- Pavani: background image setup ---
  useEffect(() => {
    const updatedBackground = require("../../../../assets/beige_bg.png");
    updateBackground(updatedBackground);
    updateHeaderHidden(false);
    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden]);

  // --- Ours: Phase C M46 pilot — resolve grief_room content slots on mount ---
  useEffect(() => {
    if (resolveFiredRef.current) return;
    resolveFiredRef.current = true;

    // Telemetry — Step 4a: Room entered
    const parentSource =
      typeof ss._entered_via === "string" && ss._entered_via
        ? ss._entered_via
        : "dashboard";
    mitraTrackEvent("grief_session_opened", {
      journeyId: ss.journey_id,
      dayNumber: ss.day_number || 1,
      meta: { parent_source: parentSource },
    });

    if (ss.grief_room && typeof ss.grief_room === "object") {
      return;
    }
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
      entered_via: parentSource,
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

    // Subtle breathing dot animation (opening step only)
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
      ]),
    ).start();

    // Stage 2: Reveal options after 30s (or on user tap)
    const timer = setTimeout(() => {
      revealOptions();
    }, 30000);

    return () => clearTimeout(timer);
  }, []);

  // --- Pavani: Breathing orchestration ---
  useEffect(() => {
    if (step !== "breath") return;

    // Read breath duration from slot-resolved data (default 9 min)
    const durationSec = ((ss as any).slow_breath?.duration_min || 9) * 60;
    setTimerSeconds(durationSec);

    const timerInterval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    const runBreathCycle = () => {
      setBreathText("Inhale");
      Animated.timing(dotScale, {
        toValue: 2.2,
        duration: 4000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }).start(() => {
        setBreathText("Exhale");
        Animated.timing(dotScale, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }).start(() => {
          runBreathCycle();
        });
      });
    };

    runBreathCycle();

    return () => {
      clearInterval(timerInterval);
    };
  }, [step]);

  // --- Pavani: Audio for "Just Sit" ---
  useEffect(() => {
    if (step === "stay") {
      const playSound = async () => {
        try {
          // Prefer slot-resolved audio URL; fall back to local Om asset
          const audioSource =
            (ss as any).grief_mantra?.audio_url
              ? { uri: (ss as any).grief_mantra.audio_url }
              : require("../../../../assets/sounds/Om.mp4");
          const { sound } = await Audio.Sound.createAsync(audioSource, {
            isLooping: true,
            shouldPlay: true,
            isMuted: isMuted,
          });
          soundRef.current = sound;
        } catch (err) {
          console.warn("[GriefRoom] Failed to load audio:", err);
        }
      };
      playSound();
    } else {
      if (soundRef.current) {
        soundRef.current.stopAsync();
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    }

    return () => {
      if (soundRef.current) {
        soundRef.current.stopAsync();
        soundRef.current.unloadAsync();
      }
    };
  }, [step]);

  // --- Pavani: Mute toggle ---
  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setIsMutedAsync(isMuted);
    }
  }, [isMuted]);

  const revealOptions = () => {
    if (step === "options" || step === "input") return;
    setStep("options");
    Animated.timing(fade2, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const dispatch = (
    actionType: string,
    actionTarget?: any,
    actionPayload?: any,
  ) => {
    if (actionType !== "exit_grief_room") {
      setActionsUsed((prev) => [...new Set([...prev, actionType])]);
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
      duration_sec: 0, // Local text fallback for now
    });
    setInputValue("");
    setStep("options");
  };

  // Hydrate the grief mantra from the library and route through the SAME
  // runner chain as the core dashboard mantra (cycle_transitions/offering_reveal).
  // Uses start_runner so runner_source="support_grief" is stamped — that's
  // what the source-aware M_completion_return variant keys on to show
  // "Back to your seat" + return_to_source on completion.
  const handleMantraTap = async () => {
    const itemId = readSlot(ss, "grief_mantra_item_id");
    if (!itemId) {
      console.warn("[grief_room] grief_mantra_item_id missing from slots");
      return;
    }
    try {
      const resp = await mitraLibrarySearch(itemId, "mantra");
      const mantra = (resp?.results || []).find(
        (r: any) => (r?.itemId ?? r?.item_id) === itemId,
      );
      if (!mantra) {
        console.warn("[grief_room] mantra not found in library:", itemId);
        return;
      }
      // Pre-seed display fields that CycleTransitionsContainer's
      // offering_reveal path reads (master_mantra / info). start_runner
      // below handles mantra_audio_url + runner_source + runner_active_item.
      store.dispatch(
        screenActions.setScreenValue({ key: "master_mantra", value: mantra }),
      );
      store.dispatch(
        screenActions.setScreenValue({
          key: "info",
          value: { ...mantra, audio_url: mantra.audio_url },
        }),
      );
      dispatch(
        "start_runner",
        { container_id: "cycle_transitions", state_id: "offering_reveal" },
        {
          source: "support_grief",
          variant: "mantra",
          target_reps: 27,
          item: { ...mantra, core: mantra },
        },
      );
    } catch (err) {
      console.warn("[grief_room] mantra tap failed:", err);
    }
  };

  // Slot reads. Backend-authored; no TSX English fallback (see section 0 of
  // CONTENT_CONTRACT_V1 — missing content stays visibly missing).
  const openingLine = readSlot(ss, "opening_line");
  const secondBeatLine = readSlot(ss, "second_beat_line");
  const readyHintLabel = readSlot(ss, "ready_hint");
  const pillBreatheLabel = readSlot(ss, "pill_breathe_label");
  const pillSpeakLabel = readSlot(ss, "pill_speak_label");
  const pillMantraLabel = readSlot(ss, "pill_mantra_label");
  const pillStayLabel = readSlot(ss, "pill_stay_label");
  const pillExitLabel = readSlot(ss, "pill_exit_label");
  // Null-asset render guard (founder adjustment #4, 2026-04-19): hide the
  // mantra pill if grief_mantra_item_id is missing. Prevents silent no-op
  // tap. Also fixes prior sovereignty violation where unconditional render
  // exposed empty label-less pills when backend hadn't seeded slots.
  const griefMantraItemId = readSlot(ss, "grief_mantra_item_id");
  const inputPrompt = readSlot(ss, "input_prompt");
  const inputPlaceholder = readSlot(ss, "input_placeholder");
  const inputSubmitLabel = readSlot(ss, "input_submit_label");
  const inputCancelLabel = readSlot(ss, "input_cancel_label");
  const breathTitle = readSlot(ss, "breath_title");
  const breathEndLabel = readSlot(ss, "breath_end_label");
  const stayQuote = readSlot(ss, "stay_quote");

  // Practice pointers (data handles, not user-facing copy).
  // Note: grief_mantra is now hydrated on-demand by handleMantraTap (via
  // library_search) rather than consumed as a pre-populated screenData
  // object — prior pattern never worked because backend returns only the
  // item_id string, not a full mantra object.
  const slowBreath = (ss as any).slow_breath;

  const renderOptions = () => (
    <Animated.View style={[styles.optionsStack, { opacity: fade2 }]}>
      <Text style={styles.secondBeat}>{secondBeatLine}</Text>

      <TouchableOpacity
        style={styles.pill}
        onPress={() => setStep("breath")}
      >
        <Text style={styles.pillText}>{pillBreatheLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.pill}
        onPress={() => setStep("input")}
      >
        <Text style={styles.pillText}>{pillSpeakLabel}</Text>
      </TouchableOpacity>

      {!!pillMantraLabel && !!griefMantraItemId && (
        <TouchableOpacity
          style={styles.pill}
          onPress={handleMantraTap}
          testID="grief_mantra_option"
          accessible={true}
        >
          <Text style={styles.pillText}>{pillMantraLabel}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.pill}
        onPress={() => setStep("stay")}
      >
        <Text style={styles.pillText}>{pillStayLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.exitBtn}
        onPress={() =>
          dispatch("exit_grief_room", null, { actions_used: actionsUsed })
        }
      >
        <Text style={styles.exitText}>{pillExitLabel}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // --- Pavani: Breath screen with LinearGradient orb ---
  const renderBreath = () => {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    const timeStr = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    return (
      <View style={styles.breathContainer}>
        <Text style={styles.mudraLabel}>{breathTitle}</Text>

        <View style={styles.orbOuter}>
          <Animated.View
            style={[styles.orbWrapper, { transform: [{ scale: dotScale }] }]}
          >
            <LinearGradient
              colors={[
                "rgba(255, 255, 255, 0.45)",
                "rgba(235, 215, 190, 0.2)",
              ]}
              style={styles.orbGradient}
            >
              <Text style={styles.breathActionText}>{breathText}</Text>
            </LinearGradient>
          </Animated.View>
          <View style={styles.orbHighlight} />
        </View>

        <Text style={styles.timerText}>{timeStr}</Text>

        <TouchableOpacity
          style={styles.endPracticeBtn}
          onPress={() => setStep("options")}
        >
          <Text style={styles.endPracticeText}>{breathEndLabel}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.exitBtn}
          onPress={() =>
            dispatch("exit_grief_room", null, { actions_used: actionsUsed })
          }
        >
          <Text style={styles.exitText}>{pillExitLabel}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // --- Pavani: "Just sit" ambient screen with audio + mute ---
  const renderStay = () => (
    <View style={styles.stayContainer}>
      <View style={styles.stayTopRow}>
        <TouchableOpacity
          style={styles.floatingMuteBtn}
          onPress={() => setIsMuted(!isMuted)}
        >
          {isMuted ? (
            <VolumeX size={24} color="#564B42" />
          ) : (
            <Volume2 size={24} color="#564B42" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.stayContent}>
        <Image
          source={require("../../../../assets/DailyOm.png")}
          style={styles.stayOmIcon}
          resizeMode="contain"
        />

        <Text style={styles.stayQuote}>{stayQuote}</Text>
      </View>

      <View style={styles.stayFooter}>
        <TouchableOpacity
          style={styles.stayBackBtn}
          onPress={() => setStep("options")}
        >
          <Text style={styles.stayBackText}>{pillExitLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
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
      {/* Always-visible back affordance. Pre-options-reveal there's no
          "I'll go now" pill yet — without this the user is stuck waiting
          30s or tapping to reveal just to find the exit. Uses the
          same exit copy the room already has (pill_exit_label). */}
      {step !== "stay" && step !== "breath" && !!pillExitLabel && (
        <View style={styles.topBackWrap} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.topBackBtn}
            activeOpacity={0.7}
            onPress={(e) => {
              e.stopPropagation();
              dispatch("exit_grief_room", null, { actions_used: actionsUsed });
            }}
          >
            <Text style={styles.topBackText}>{pillExitLabel}</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View style={{ opacity: fade1, alignItems: "center" }}>
          <Text style={styles.openingLine} testID="grief_room_opening_line">
            {openingLine}
          </Text>

          {step === "opening" && (
            <>
              <Animated.View
                style={[styles.dot, { transform: [{ scale: dotScale }] }]}
              />
              {!!readyHintLabel && (
                <Text style={styles.readyHint}>{readyHintLabel}</Text>
              )}
            </>
          )}
        </Animated.View>

        {step === "options" && renderOptions()}
        {step === "input" && renderInput()}
        {step === "breath" && renderBreath()}
        {step === "stay" && renderStay()}
      </ScrollView>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 60,
    alignItems: "center",
  },
  openingLine: {
    fontFamily: Fonts.sans.medium,
    fontSize: 24,
    color: "#432104",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D4A017",
    opacity: 0.6,
  },
  readyHint: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "#8a7d6b",
    textAlign: "center",
    marginTop: 18,
    letterSpacing: 0.3,
    opacity: 0.75,
  },
  topBackWrap: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
  },
  topBackBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  topBackText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#8a7d6b",
    letterSpacing: 0.3,
  },
  // --- Breath Interaction Styles (Pavani) ---
  breathContainer: {
    width: "100%",
    alignItems: "center",
    paddingTop: 10,
  },
  mudraLabel: {
    fontFamily: Fonts.serif.regular,
    fontSize: 24,
    color: "#432104",
    marginBottom: 60,
    textAlign: "center",
  },
  orbOuter: {
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 60,
  },
  orbWrapper: {
    width: 140,
    height: 140,
    borderRadius: 110,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(191, 138, 74, 0.25)",
    elevation: 4,
    shadowColor: "#BF8A4A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  orbGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 253, 249, 0.2)",
  },
  orbHighlight: {
    position: "absolute",
    top: "15%",
    left: "25%",
    width: 40,
    height: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    transform: [{ rotate: "-15deg" }],
    pointerEvents: "none",
  },
  breathActionText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 22,
    color: "#564B42",
  },
  timerText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 28,
    color: "#432104",
    letterSpacing: 2,
    marginBottom: 100,
  },
  endPracticeBtn: {
    paddingVertical: 12,
  },
  endPracticeText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "#8a7d6b",
    textDecorationLine: "underline",
  },
  // --- Stay Interaction Styles (Pavani) ---
  stayContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 60,
  },
  stayTopRow: {
    width: "100%",
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  floatingMuteBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  stayContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  stayOmIcon: {
    width: 80,
    height: 80,
    marginBottom: 60,
    opacity: 0.8,
    tintColor: "#BF8A4A",
  },
  stayQuote: {
    fontFamily: Fonts.serif.regular,
    fontSize: 22,
    color: "#564B42",
    textAlign: "center",
    lineHeight: 36,
  },
  stayFooter: {
    alignItems: "center",
    width: "100%",
  },
  stayBackBtn: {
    paddingVertical: 10,
  },
  stayBackText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "#432104",
    textDecorationLine: "underline",
    marginTop: 20,
  },
  // --- Shared styles ---
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
    marginTop: 10,
  },
  pill: {
    backgroundColor: "#FBF5F5",
    borderColor: "#c89a47",
    borderWidth: 1,
    elevation: 6,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  pillText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 17,
    color: "#432104",
  },
  exitBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  exitText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#432104",
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
