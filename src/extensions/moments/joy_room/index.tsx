/**
 * JoyRoomContainer — Mitra v3 Moment M48 (support room, Track 1 first-class).
 *
 * Flow-contract mirror of grief_room / loneliness_room:
 *   - state ownership: useState<step>
 *   - entry: enter_joy_room → support_joy/room
 *   - exit: exit_joy_room → companion_dashboard/day_active
 *   - runner: start_runner with source="support_joy" → cycle_transitions/
 *     offering_reveal (same render path as core mantra)
 *   - completion: runner_source drives M_completion_return source-aware
 *     variant (authored with "Back to your seat" + return_to_source)
 *
 * NOT inherited from grief:
 *   - No 30s silence auto-reveal — Joy Room uses 2-4s per M48 YAML
 *     (silence_tolerance_sec=4, emotional_weight=light)
 *   - No weight_guard maximum cap — Joy is light weight
 *   - No protective grief-safe tone — Joy honors, doesn't protect
 *
 * Slot keys (null-safe "" fallback — no TSX English):
 *   joy_room.opening_line / second_beat_line / ready_hint / offer_intro_text
 *   joy_room.pill_chant_label / pill_offer_label / pill_walk_label
 *   joy_room.pill_name_label / pill_sit_label / pill_carry_label
 *   joy_room.input_naming_prompt / input_placeholder
 *   joy_room.input_submit_label / input_cancel_label
 *   joy_room.joy_mantra_item_id / walk_duration_min
 *   joy_room.wisdom_anchor_line (optional)
 *
 * Spec refs:
 *   kalpx-app-rn/docs/SANATAN_EXPANSION_TRACK_1_V1.md
 *   kalpx-app-rn/docs/WISDOM_FOUNDER_DECISIONS_LOG_2026_04_18.md
 *   kalpx/core/data_seed/mitra_v3/moments/M48_joy_room.yaml
 */

import { Audio } from "expo-av";
import { Volume2, VolumeX } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
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
 * Read a slot from screenData.joy_room with null-safe "" fallback.
 * No English fallback — blank UI exposes missing content via telemetry.
 */
const readSlot = (ss: Record<string, any>, key: string): string => {
  const moment = ss.joy_room;
  if (moment && typeof moment === "object" && typeof moment[key] === "string") {
    return moment[key];
  }
  return "";
};

const JOY_WALK_FALLBACKS = {
  walk_quote:
    "Step outside into the fresh air.\n\nWalk for 10 minutes, no need to rush.\n\nTake any path that feels right, and let your body move naturally.",
  walk_holding_line: "I’ll be here, holding this quiet space for you.",
  walk_action_label: "Time to walk",
  walk_end_return_label: "End & Return",
} as const;

const readWalkSlot = (
  ss: Record<string, any>,
  key: keyof typeof JOY_WALK_FALLBACKS,
): string => {
  return readSlot(ss, key) || JOY_WALK_FALLBACKS[key];
};

interface Props {
  block?: any;
}

const JoyRoomContainer: React.FC<Props> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const updateBackground = useScreenStore(
    (state: any) => state.updateBackground,
  );
  const updateHeaderHidden = useScreenStore(
    (state: any) => state.updateHeaderHidden,
  );
  const ss = screenData as Record<string, any>;

  const [step, setStep] = useState<
    "opening" | "options" | "input" | "walk" | "sit" | "carried"
  >("opening");
  const [timerSeconds, setTimerSeconds] = useState(600);
  const [inputValue, setInputValue] = useState("");
  const [actionsUsed, setActionsUsed] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const fade1 = useRef(new Animated.Value(0)).current;
  const fade2 = useRef(new Animated.Value(0)).current;
  const resolveFiredRef = useRef(false);

  // Background setup (mirrors grief/loneliness)
  useEffect(() => {
    const updatedBackground = require("../../../../assets/beige_bg.png");
    updateBackground(updatedBackground);
    updateHeaderHidden(false);
    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden]);

  // Resolve M48_joy_room slots on mount
  useEffect(() => {
    if (resolveFiredRef.current) return;
    resolveFiredRef.current = true;

    // Telemetry — Step 4a: Room entered
    const parentSource =
      typeof ss._entered_via === "string" && ss._entered_via
        ? ss._entered_via
        : "dashboard";
    mitraTrackEvent("joy_room_entered", {
      journeyId: ss.journey_id,
      dayNumber: ss.day_number || 1,
      meta: { parent_source: parentSource },
    });

    if (ss.joy_room && typeof ss.joy_room === "object") {
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
      user_attention_state: "open_steady",
      emotional_weight: "light" as const,
      cycle_day: Number(ss.day_number) || 0,
      entered_via: parentSource,
      stage_signals: {},
      today_layer: {
        today_kosha: ss.today_kosha || "anandamaya",
        today_klesha: ss.today_klesha || null,
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
      const payload = await mitraResolveMoment("M48_joy_room", resolveCtx);
      if (cancelled || !payload) return;
      store.dispatch(
        screenActions.setScreenValue({
          key: "joy_room",
          value: payload.slots,
        }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Joy pacing: short silence (2s), light fade. Not grief 30s.
  useEffect(() => {
    Animated.timing(fade1, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      const timer = setTimeout(() => {
        revealOptions();
      }, 2000);
      return () => clearTimeout(timer);
    });
  }, [fade1]);

  // Walk timer (step=walk)
  useEffect(() => {
    if (step !== "walk") return;
    const walkDurationMin = Number(readSlot(ss, "walk_duration_min")) || 10;
    setTimerSeconds(walkDurationMin * 60);
    const timerInterval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerInterval);
  }, [step]);

  useEffect(() => {
    if (step !== "sit") {
      if (soundRef.current) {
        soundRef.current.stopAsync();
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      return;
    }

    const playSound = async () => {
      try {
        const audioSource = readSlot(ss, "joy_sit_audio_url")
          ? { uri: readSlot(ss, "joy_sit_audio_url") }
          : require("../../../../assets/sounds/Om.mp4");
        const { sound } = await Audio.Sound.createAsync(audioSource, {
          isLooping: true,
          shouldPlay: true,
          isMuted,
        });
        soundRef.current = sound;
      } catch (err) {
        console.warn("[joy_room] failed to load sit audio:", err);
      }
    };

    playSound();

    return () => {
      if (soundRef.current) {
        soundRef.current.stopAsync();
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [step]);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.setIsMutedAsync(isMuted);
    }
  }, [isMuted]);

  // Slot reads
  const openingLine = readSlot(ss, "opening_line");
  const secondBeatLine = readSlot(ss, "second_beat_line");
  const readyHintLabel = readSlot(ss, "ready_hint");
  const offerIntroText = readSlot(ss, "offer_intro_text");
  const pillChantLabel = readSlot(ss, "pill_chant_label");
  const pillOfferLabel = readSlot(ss, "pill_offer_label");
  const pillWalkLabel = readSlot(ss, "pill_walk_label");
  const pillNameLabel = readSlot(ss, "pill_name_label");
  const pillSitLabel = readSlot(ss, "pill_sit_label");
  const pillCarryLabel = readSlot(ss, "pill_carry_label");
  // Joy Carry truth (founder adjustment #3, 2026-04-19): Carry is now
  // INLINE_STEP per §C.3 (stamps joy_carry + dashboard chip). Exit is a
  // separate NAV_EXIT pill. Backend is expected to author pill_exit_label
  // alongside pill_carry_label; until it does, the top-back affordance
  // (which currently uses pillCarryLabel) still provides an exit path.
  const pillExitLabel = readSlot(ss, "pill_exit_label");
  // Null-asset render guard (founder adjustment #4, 2026-04-19): hide the
  // chant pill if joy_mantra_item_id is missing. Prevents silent no-op tap.
  const joyMantraItemId = readSlot(ss, "joy_mantra_item_id");
  const inputNamingPrompt = readSlot(ss, "input_naming_prompt");
  const inputPlaceholder = readSlot(ss, "input_placeholder");
  const inputSubmitLabel = readSlot(ss, "input_submit_label");
  const inputCancelLabel = readSlot(ss, "input_cancel_label");
  const walkDurationMin = Number(readSlot(ss, "walk_duration_min")) || 10;
  const walkQuote = readWalkSlot(ss, "walk_quote");
  const walkHoldingLine = readWalkSlot(ss, "walk_holding_line");
  const walkActionLabel = readWalkSlot(ss, "walk_action_label");
  const walkEndReturnLabel = readWalkSlot(ss, "walk_end_return_label");
  const sitQuote =
    readSlot(ss, "sit_quote") ||
    `Come, let’s sit together in this quiet.
There’s nothing for you to do.
You’re exactly where you need to be right now.`;

  const revealOptions = () => {
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
    if (actionType !== "exit_joy_room") {
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
    dispatch("joy_named", {
      text: inputValue,
      length_chars: inputValue.length,
    });
    setInputValue("");
    setStep("options");
  };

  // Hydrate joy mantra from library + route through core mantra render path.
  // Mirrors loneliness routeSupportMantra(); stamps runner_source=support_joy
  // so M_completion_return serves the source-aware variant with "Back to
  // your seat" + return_to_source.
  const handleMantraTap = async () => {
    const itemId = readSlot(ss, "joy_mantra_item_id");
    if (!itemId) {
      console.warn("[joy_room] joy_mantra_item_id missing from slots");
      return;
    }
    try {
      const resp = await mitraLibrarySearch(itemId, "mantra");
      const mantra = (resp?.results || []).find(
        (r: any) => (r?.itemId ?? r?.item_id) === itemId,
      );
      if (!mantra) {
        console.warn("[joy_room] mantra not found in library:", itemId);
        return;
      }
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
          source: "support_joy",
          variant: "mantra",
          target_reps: 27,
          item: { ...mantra, core: mantra },
        },
      );
    } catch (err) {
      console.warn("[joy_room] mantra tap failed:", err);
    }
  };

  const renderOptions = () => (
    <Animated.View style={[styles.optionsStack, { opacity: fade2 }]}>
      {!!offerIntroText && (
        <Text style={styles.offerText}>{offerIntroText}</Text>
      )}

      {!!pillChantLabel && !!joyMantraItemId && (
        <TouchableOpacity
          style={styles.pill}
          onPress={handleMantraTap}
          testID="joy_chant_option"
          accessible={true}
        >
          <Text style={styles.pillText}>{pillChantLabel}</Text>
        </TouchableOpacity>
      )}

      {!!pillNameLabel && (
        <TouchableOpacity style={styles.pill} onPress={() => setStep("input")}>
          <Text style={styles.pillText}>{pillNameLabel}</Text>
        </TouchableOpacity>
      )}

      {!!pillOfferLabel && (
        <TouchableOpacity
          style={styles.pill}
          onPress={() => {
            dispatch("joy_offering_noted", null, { label: pillOfferLabel });
            setStep("options");
          }}
        >
          <Text style={styles.pillText}>{pillOfferLabel}</Text>
        </TouchableOpacity>
      )}

      {!!pillWalkLabel && (
        <TouchableOpacity
          style={styles.pill}
          onPress={() => {
            dispatch("joy_walk_started", null, {
              label: pillWalkLabel,
              duration_min: walkDurationMin,
            });
            setStep("walk");
          }}
        >
          <Text style={styles.pillText}>{pillWalkLabel}</Text>
        </TouchableOpacity>
      )}

      {!!pillSitLabel && (
        <TouchableOpacity
          style={styles.pill}
          onPress={() => {
            dispatch("joy_sit_started", null, { label: pillSitLabel });
            setStep("sit");
          }}
        >
          <Text style={styles.pillText}>{pillSitLabel}</Text>
        </TouchableOpacity>
      )}

      {!!pillCarryLabel && (
        <TouchableOpacity
          style={styles.pill}
          onPress={() => {
            dispatch("carry_joy_forward", null, { label: pillCarryLabel });
            setStep("carried");
          }}
        >
          <Text style={styles.pillText}>{pillCarryLabel}</Text>
        </TouchableOpacity>
      )}

      {!!pillExitLabel && (
        <TouchableOpacity
          style={styles.exitBtn}
          onPress={() =>
            dispatch("exit_joy_room", null, { actions_used: actionsUsed })
          }
        >
          <Text style={styles.exitText}>{pillExitLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  const renderInput = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.inputWrap}
    >
      {!!inputNamingPrompt && (
        <Text style={styles.inputPrompt}>{inputNamingPrompt}</Text>
      )}
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
        {!!inputSubmitLabel && (
          <TouchableOpacity style={styles.pill} onPress={handleInputSubmit}>
            <Text style={styles.pillText}>{inputSubmitLabel}</Text>
          </TouchableOpacity>
        )}
        {!!inputCancelLabel && (
          <TouchableOpacity onPress={() => setStep("options")}>
            <Text style={styles.cancelText}>{inputCancelLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );

  const renderWalk = () => {
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    const timeStr = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
    return (
      <View style={styles.walkContainer}>
        <View style={styles.walkHeader}>
          <TouchableOpacity
            style={styles.endReturnBtn}
            onPress={() => setStep("options")}
          >
            <Text style={styles.endReturnText}>{walkEndReturnLabel}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.walkContent}>
          <Text style={styles.walkQuote}>{walkQuote}</Text>
          <Text style={styles.walkHoldingLine}>{walkHoldingLine}</Text>
        </View>

        <View style={styles.walkBottomBar}>
          <View style={styles.walkIconBox}>
            <Text style={styles.walkEmoji}>{"\u{1F6B6}"}</Text>
          </View>
          <Text style={styles.walkActionLabel}>{walkActionLabel}</Text>
          <Text style={styles.walkTimerText}>{timeStr}</Text>
        </View>
      </View>
    );
  };

  const renderSit = () => (
    <View style={styles.sitContainer}>
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

        <Text style={styles.stayQuote}>{sitQuote}</Text>
      </View>

      <View style={styles.stayFooter}>
        <TouchableOpacity
          style={styles.stayBackBtn}
          onPress={() => setStep("options")}
        >
          <Text style={styles.stayBackText}>{pillExitLabel || "Back"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCarried = () => {
    const confirmLine =
      readSlot(ss, "carry_confirm_line") || "Joy carried.";
    const confirmSub =
      readSlot(ss, "carry_confirm_subline") ||
      "Take this with you into the rest of your day.";
    return (
      <Animated.View style={[styles.optionsStack, { opacity: fade2 }]}>
        <Text style={styles.confirmLine}>{confirmLine}</Text>
        <Text style={styles.confirmSub}>{confirmSub}</Text>
        {!!pillExitLabel && (
          <TouchableOpacity
            style={styles.exitBtn}
            onPress={() =>
              dispatch("exit_joy_room", null, { actions_used: actionsUsed })
            }
          >
            <Text style={styles.exitText}>{pillExitLabel}</Text>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.root}>
      {/* Always-visible back link (pre-options-reveal safety net) */}
      {step !== "walk" && step !== "sit" && !!pillCarryLabel && (
        <View style={styles.topBackWrap} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.topBackBtn}
            activeOpacity={0.7}
            onPress={() =>
              dispatch("exit_joy_room", null, { actions_used: actionsUsed })
            }
          >
            {/* <Text style={styles.topBackText}>{pillCarryLabel}</Text> */}
          </TouchableOpacity>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step !== "walk" && step !== "sit" && (
          <Animated.View style={{ opacity: fade1, marginBottom: 40 }}>
            {!!openingLine && (
              <Text style={styles.openingLine} testID="joy_room_opening_line">
                {openingLine}
              </Text>
            )}
            {!!secondBeatLine && (
              <Text style={styles.secondBeat}>{secondBeatLine}</Text>
            )}
            {step === "opening" && !!readyHintLabel && (
              <Text style={styles.readyHint}>{readyHintLabel}</Text>
            )}
          </Animated.View>
        )}

        {step === "options" && renderOptions()}
        {step === "input" && renderInput()}
        {step === "walk" && renderWalk()}
        {step === "sit" && renderSit()}
        {step === "carried" && renderCarried()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 60,
  },
  openingLine: {
    fontFamily: Fonts.sans.medium,
    fontSize: 24,
    color: "#432104",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 32,
  },
  secondBeat: {
    fontFamily: Fonts.serif.regular,
    fontSize: 20,
    color: "#564B42",
    textAlign: "center",
    lineHeight: 28,
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
  topBackBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  topBackText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#8a7d6b",
    letterSpacing: 0.3,
  },
  offerText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#946A47",
    textAlign: "center",
    marginBottom: 12,
  },
  optionsStack: { width: "100%", gap: 12 },
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
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    color: "#432104",
    textAlign: "center",
  },
  exitBtn: {
    alignItems: "center",
    paddingVertical: 14,
    marginTop: 8,
  },
  exitText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "#564B42",
    textDecorationLine: "underline",
  },
  inputWrap: { width: "100%", gap: 12 },
  inputPrompt: {
    fontFamily: Fonts.sans.medium,
    fontSize: 16,
    color: "#432104",
    textAlign: "center",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.6)",
    borderColor: "#e0d4b4",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    minHeight: 100,
    textAlignVertical: "top",
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#432104",
  },
  inputActions: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    marginTop: 8,
  },
  cancelText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#8a7d6b",
  },
  walkContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingBottom: 60,
  },
  walkHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 8,
  },
  endReturnBtn: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#c9a35f",
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.45)",
  },
  endReturnText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "#564B42",
  },
  walkContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    gap: 28,
    marginTop: 40,
    marginBottom: 40,
  },
  walkQuote: {
    fontFamily: Fonts.serif.regular,
    fontSize: 22,
    lineHeight: 44,
    color: "#432104",
    textAlign: "center",
  },
  walkHoldingLine: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    lineHeight: 34,
    color: "#564B42",
    textAlign: "center",
    opacity: 0.88,
  },
  walkBottomBar: {
    width: "100%",
    minHeight: 62,
    borderWidth: 1,
    borderColor: "#c9a35f",
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.45)",
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  walkIconBox: {
    width: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  walkEmoji: {
    fontSize: 24,
  },
  walkActionLabel: {
    flex: 1,
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#564B42",
  },
  walkTimerText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#432104",
  },
  sitContainer: {
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
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(191, 138, 74, 0.35)",
  },
  stayContent: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 16,
  },
  stayOmIcon: {
    width: 120,
    height: 120,
    opacity: 0.8,
  },
  stayQuote: {
    fontFamily: Fonts.serif.regular,
    fontSize: 22,
    lineHeight: 42,
    color: "#432104",
    textAlign: "center",
    marginTop: 28,
  },
  stayFooter: {
    width: "100%",
    alignItems: "center",
  },
  stayBackBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  stayBackText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "#564B42",
    textDecorationLine: "underline",
  },
  confirmLine: {
    fontFamily: Fonts.serif.regular,
    fontSize: 20,
    color: "#432104",
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 10,
  },
  confirmSub: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#564B42",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
});

export default JoyRoomContainer;
