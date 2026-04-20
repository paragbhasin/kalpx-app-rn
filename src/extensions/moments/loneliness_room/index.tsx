/**
 * LonelinessRoomContainer — Mitra v3 Moment M47 (support room, Tier 1 batch).
 *
 * HYBRID MERGE: content sovereignty shell (ours) + Pavani's walk timer feature.
 *
 * First batch-expansion migration after the Phase C pilot trio. Structural
 * mirror of M46 grief_room migration; same sovereignty + null-safe rules.
 *
 * Pavani integrations:
 *   - Inline walk timer with countdown (reads walk_duration_min from slot)
 *   - Walk UI with end-and-return, walk icon, timer bar
 *   - Background image via useScreenStore.updateBackground
 *
 * Slot keys (null-safe "" fallback, no TSX English):
 *   loneliness_room.opening_line / second_beat_line / offer_intro_text
 *   loneliness_room.pill_name_label / pill_bhakti_label / pill_chant_label
 *   loneliness_room.pill_reach_out_label / pill_walk_label / pill_exit_label
 *   loneliness_room.input_naming_prompt / input_person_prompt
 *   loneliness_room.input_placeholder / input_submit_label / input_cancel_label
 *   loneliness_room.walk_quote / walk_holding_line / walk_action_label
 *   loneliness_room.walk_end_return_label
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

const readSlot = (ss: Record<string, any>, key: string): string => {
  const moment = ss.loneliness_room;
  if (moment && typeof moment === "object" && typeof moment[key] === "string") {
    return moment[key];
  }
  return "";
};

const WALK_FALLBACKS = {
  walk_quote:
    "Step outside into the fresh air.\n\nWalk for 10 minutes, no need to rush.\n\nTake any path that feels right, and let your body move naturally.",
  walk_holding_line: "I’ll be here, holding this quiet space for you.",
  walk_action_label: "Time to walk",
  walk_end_return_label: "End walk and return",
} as const;

const readWalkSlot = (
  ss: Record<string, any>,
  key: keyof typeof WALK_FALLBACKS,
): string => {
  const value = readSlot(ss, key);
  return value || WALK_FALLBACKS[key];
};

interface Props {
  block?: any;
}

const LonelinessRoomContainer: React.FC<Props> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const updateBackground = useScreenStore(
    (state: any) => state.updateBackground,
  );
  const updateHeaderHidden = useScreenStore(
    (state: any) => state.updateHeaderHidden,
  );
  const ss = screenData as Record<string, any>;

  const [step, setStep] = useState<"opening" | "options" | "input" | "walk">(
    "opening",
  );
  const [timerSeconds, setTimerSeconds] = useState(600); // default 10 min
  const [inputType, setInputType] = useState<"naming" | "person">("naming");
  const [inputValue, setInputValue] = useState("");

  const fade1 = useRef(new Animated.Value(0)).current;
  const fade2 = useRef(new Animated.Value(0)).current;
  const resolveFiredRef = useRef(false);

  // --- Pavani: background image setup ---
  useEffect(() => {
    const updatedBackground = require("../../../../assets/beige_bg.png");
    updateBackground(updatedBackground);
    updateHeaderHidden(false);
    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden]);

  // --- Ours: Phase C Tier 1 — resolve loneliness_room slots on mount ---
  useEffect(() => {
    if (resolveFiredRef.current) return;
    resolveFiredRef.current = true;

    // Telemetry — Step 4a: Room entered
    const parentSource =
      typeof ss._entered_via === "string" && ss._entered_via
        ? ss._entered_via
        : "dashboard";
    mitraTrackEvent("loneliness_session_opened", {
      journeyId: ss.journey_id,
      dayNumber: ss.day_number || 1,
      meta: { parent_source: parentSource },
    });

    if (ss.loneliness_room && typeof ss.loneliness_room === "object") {
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
      emotional_weight: "heavy" as const,
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
      const payload = await mitraResolveMoment(
        "M47_loneliness_room",
        resolveCtx,
      );
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

  // Data handles (practice pointers, not user-facing copy).
  // bhakti_mantra / companioned_chant are now hydrated on-demand by
  // routeSupportMantra (via library_search) rather than consumed as
  // pre-populated screenData objects — backend only returns item_ids.

  // Slot reads — backend-authored, null-safe.
  const openingLine = readSlot(ss, "opening_line");
  const secondBeatLine = readSlot(ss, "second_beat_line");
  const readyHintLabel = readSlot(ss, "ready_hint");
  const offerIntroText = readSlot(ss, "offer_intro_text");
  const pillNameLabel = readSlot(ss, "pill_name_label");
  const pillBhaktiLabel = readSlot(ss, "pill_bhakti_label");
  const pillChantLabel = readSlot(ss, "pill_chant_label");
  const pillReachOutLabel = readSlot(ss, "pill_reach_out_label");
  const pillWalkLabel = readSlot(ss, "pill_walk_label");
  const pillExitLabel = readSlot(ss, "pill_exit_label");
  // Null-asset render guards (founder adjustment #4, 2026-04-19): hide
  // runner-launching pills if their item_id slot is missing. Prevents
  // the silent no-op tap where handler warns to console but user sees
  // nothing. Same "hide, don't render no-op" rule as Why-This Go deeper.
  const bhaktiMantraItemId = readSlot(ss, "bhakti_mantra_item_id");
  const companionedChantItemId = readSlot(ss, "companioned_chant_item_id");
  const inputNamingPrompt = readSlot(ss, "input_naming_prompt");
  const inputPersonPrompt = readSlot(ss, "input_person_prompt");
  const inputPlaceholder = readSlot(ss, "input_placeholder");
  const inputSubmitLabel = readSlot(ss, "input_submit_label");
  const inputCancelLabel = readSlot(ss, "input_cancel_label");
  const walkQuote = readWalkSlot(ss, "walk_quote");
  const walkHoldingLine = readWalkSlot(ss, "walk_holding_line");
  const walkActionLabel = readWalkSlot(ss, "walk_action_label");
  const walkEndReturnLabel = readWalkSlot(ss, "walk_end_return_label");

  const revealOptions = () => {
    setStep("options");
    Animated.timing(fade2, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    // Stage 1: Opening line
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

  // --- Pavani: Timer orchestration for Walk ---
  useEffect(() => {
    if (step !== "walk") return;

    // Read walk duration from slot-resolved data (default 10 min)
    const walkDurationMin = Number((ss as any).walk_duration_min) || 10;
    setTimerSeconds(walkDurationMin * 60);

    const timerInterval = setInterval(() => {
      setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [step]);

  const dispatch = (
    actionType: string,
    actionTarget?: any,
    actionPayload?: any,
  ) =>
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

  // Hydrate a support mantra from the library and route through the same
  // runner chain as the core dashboard mantra (cycle_transitions/offering_reveal).
  // start_runner stamps runner_source="support_loneliness" which M_completion_return
  // keys on for the "Back to your seat" variant.
  const routeSupportMantra = async (
    itemIdSlot: "bhakti_mantra_item_id" | "companioned_chant_item_id",
    targetReps: number,
  ) => {
    const itemId = readSlot(ss, itemIdSlot);
    if (!itemId) {
      console.warn(`[loneliness_room] ${itemIdSlot} missing from slots`);
      return;
    }
    try {
      const resp = await mitraLibrarySearch(itemId, "mantra");
      const mantra = (resp?.results || []).find(
        (r: any) => (r?.itemId ?? r?.item_id) === itemId,
      );
      if (!mantra) {
        console.warn("[loneliness_room] mantra not found in library:", itemId);
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
          source: "support_loneliness",
          variant: "mantra",
          target_reps: targetReps,
          item: { ...mantra, core: mantra },
        },
      );
    } catch (err) {
      console.warn("[loneliness_room] mantra tap failed:", err);
    }
  };

  const handleBhaktiTap = () => routeSupportMantra("bhakti_mantra_item_id", 27);
  const handleChantTap = () =>
    routeSupportMantra("companioned_chant_item_id", 11);

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

      {!!pillBhaktiLabel && !!bhaktiMantraItemId && (
        <TouchableOpacity
          style={styles.pill}
          onPress={handleBhaktiTap}
          testID="loneliness_bhakti_option"
          accessible={true}
        >
          <Text style={styles.pillText}>{pillBhaktiLabel}</Text>
        </TouchableOpacity>
      )}

      {!!pillChantLabel && !!companionedChantItemId && (
        <TouchableOpacity
          style={styles.pill}
          onPress={handleChantTap}
          testID="loneliness_chant_option"
          accessible={true}
        >
          <Text style={styles.pillText}>{pillChantLabel}</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.pill}
        onPress={() => {
          setInputType("person");
          setStep("input");
        }}
      >
        <Text style={styles.pillText}>{pillReachOutLabel}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.pill} onPress={() => setStep("walk")}>
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

  // --- Pavani: Walk screen with timer ---
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
          <Text style={[styles.secondQuote, { marginTop: 40, opacity: 0.8 }]}>
            {walkHoldingLine}
          </Text>
        </View>

        <View style={styles.walkBottomBar}>
          <View style={styles.walkIconBox}>
            <Text style={{ fontSize: 24 }}>{"\u{1F6B6}"}</Text>
          </View>
          <Text style={styles.walkActionLabel}>{walkActionLabel}</Text>
          <Text style={styles.walkTimerText}>{timeStr}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      {/* Always-visible back affordance. Walk screen hides it (owns its
          own top-right end-return). Uses the same exit copy the room
          already has (pill_exit_label). */}
      {step !== "walk" && !!pillExitLabel && (
        <View style={styles.topBackWrap} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.topBackBtn}
            activeOpacity={0.7}
            onPress={() => dispatch("exit_loneliness_room")}
          >
            {/* <Text style={styles.topBackText}>{pillExitLabel}</Text> */}
          </TouchableOpacity>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {step !== "walk" && (
          <Animated.View style={{ opacity: fade1, marginBottom: 40 }}>
            <Text
              style={styles.openingLine}
              testID="loneliness_room_opening_line"
            >
              {openingLine}
            </Text>
            <Text style={styles.secondBeat}>{secondBeatLine}</Text>
            {step === "opening" && !!readyHintLabel && (
              <Text style={styles.readyHint}>{readyHintLabel}</Text>
            )}
          </Animated.View>
        )}

        {step === "options" && renderOptions()}
        {step === "input" && renderInput()}
        {step === "walk" && renderWalk()}
      </ScrollView>
    </View>
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
  offerText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#946A47",
    textAlign: "center",
    marginBottom: 12,
  },
  optionsStack: {
    width: "100%",
    gap: 12,
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
    fontSize: 18,
    color: "#432104",
  },
  // --- Walk Interaction Styles (Pavani) ---
  walkContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
  },
  walkHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  endReturnBtn: {
    backgroundColor: "#FBF5F5",
    borderColor: "#c89a47",
    borderWidth: 1,
    elevation: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    position: "absolute",
    right: 20,
  },
  endReturnText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "#6B4F31",
  },
  walkContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },
  walkQuote: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: "#432104",
    textAlign: "center",
    lineHeight: 36,
  },
  secondQuote: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#432104",
    textAlign: "center",
    lineHeight: 36,
  },
  walkBottomBar: {
    backgroundColor: "#FBF5F5",
    borderColor: "#c89a47",
    borderWidth: 1,
    elevation: 6,
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: "center",
    marginTop: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: "90%",
    flexDirection: "row",
    alignItems: "center",
  },
  walkIconBox: {
    marginRight: 15,
  },
  walkActionLabel: {
    flex: 1,
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#564B42",
  },
  walkTimerText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 20,
    color: "#564B42",
    letterSpacing: 1,
  },
  // --- Shared styles ---
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
