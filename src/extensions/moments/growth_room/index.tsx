/**
 * GrowthRoomContainer — Mitra v3 Moment M49 (support room, Track 1 first-class).
 *
 * Flow-contract mirror of grief_room / loneliness_room. NOT a new architecture.
 *   - state ownership: useState<step>
 *   - entry: enter_growth_room → support_growth/room
 *   - exit: exit_growth_room → companion_dashboard/day_active
 *   - runner: start_runner with source="support_growth" → cycle_transitions/
 *     offering_reveal (same render path as core mantra)
 *   - completion: runner_source drives M_completion_return source-aware
 *     variant (invariant #8 absolute — practice must stay in Ayurveda/
 *     Dinacharya family; mantra in Gita)
 *
 * Seeded inquiry sub-flow — internal state machine, not a separate container:
 *   step="inquiry_categories" → resolves M49_inquiry_seeds, renders 5 category
 *   chips; tap → step="inquiry_seat" shows principle_anchor_line +
 *   reflective_prompt + suggested_practice_label from the selected category;
 *   user can journal (step="journal") or carry forward (exit).
 *
 * NOT inherited from grief:
 *   - No 30s silence auto-reveal — Growth uses 10s per M49 YAML
 *     (silence_tolerance_sec=10; contemplative posture)
 *   - No protective grief-safe tone — Growth is inquiry-first, can render
 *     visible teaching (the one visible-reply exception in support rooms)
 *   - No weight_guard — emotional_weight=moderate
 *
 * Slot keys (null-safe "" fallback — no TSX English):
 *   growth_room.opening_line / second_beat_line / ready_hint /
 *     offer_intro_text
 *   growth_room.pill_inquiry_label / pill_teaching_label / pill_mantra_label /
 *     pill_practice_label / pill_journal_label / pill_exit_label
 *   growth_room.input_inquiry_prompt / input_placeholder /
 *     input_submit_label / input_cancel_label
 *   growth_room.growth_mantra_item_id / growth_practice_item_id
 *
 * Inquiry seed slots (read from screenData.growth_inquiry_seeds.<category>):
 *   category_label / principle_anchor_line / reflective_prompt /
 *   suggested_practice_label / principle_id / journal_cta / carry_forward_cta
 *
 * Spec refs:
 *   kalpx-app-rn/docs/SANATAN_EXPANSION_TRACK_1_V1.md
 *   kalpx-app-rn/docs/WISDOM_FOUNDER_DECISIONS_LOG_2026_04_18.md
 *   kalpx/core/data_seed/mitra_v3/moments/M49_growth_room.yaml
 *   kalpx/core/data_seed/mitra_v3/moments/M49_inquiry_seeds.yaml
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
} from "../../../engine/mitraApi";
import { useScreenStore } from "../../../engine/useScreenBridge";
import store from "../../../store";
import { screenActions } from "../../../store/screenSlice";
import { Fonts } from "../../../theme/fonts";

/**
 * Read a slot from screenData.growth_room with null-safe "" fallback.
 */
const readSlot = (ss: Record<string, any>, key: string): string => {
  const moment = ss.growth_room;
  if (moment && typeof moment === "object" && typeof moment[key] === "string") {
    return moment[key];
  }
  return "";
};

/**
 * Read a slot from a specific inquiry-seed category.
 * Seeds resolve at step="inquiry_categories" entry.
 */
const readSeedSlot = (
  ss: Record<string, any>,
  category: string,
  key: string,
): string => {
  const seeds = ss.growth_inquiry_seeds;
  if (seeds && typeof seeds === "object" && seeds[category]) {
    const cat = seeds[category];
    if (typeof cat === "object" && typeof cat[key] === "string") {
      return cat[key];
    }
  }
  return "";
};

type InquiryCategory =
  | "decision"
  | "relationship"
  | "stuck"
  | "practice"
  | "other";

const INQUIRY_CATEGORIES: InquiryCategory[] = [
  "decision",
  "relationship",
  "stuck",
  "practice",
  "other",
];

interface Props {
  block?: any;
}

const GrowthRoomContainer: React.FC<Props> = () => {
  const { screenData, loadScreen, goBack } = useScreenStore();
  const updateBackground = useScreenStore(
    (state: any) => state.updateBackground,
  );
  const updateHeaderHidden = useScreenStore(
    (state: any) => state.updateHeaderHidden,
  );
  const ss = screenData as Record<string, any>;

  const [step, setStep] = useState<
    "opening" | "options" | "inquiry_categories" | "inquiry_seat" | "journal"
  >("opening");
  const [selectedCategory, setSelectedCategory] =
    useState<InquiryCategory | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [actionsUsed, setActionsUsed] = useState<string[]>([]);

  const fade1 = useRef(new Animated.Value(0)).current;
  const fade2 = useRef(new Animated.Value(0)).current;
  const resolveFiredRef = useRef(false);
  const seedsResolveFiredRef = useRef(false);

  // Background
  useEffect(() => {
    const updatedBackground = require("../../../../assets/beige_bg.png");
    updateBackground(updatedBackground);
    updateHeaderHidden(false);
    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden]);

  // Resolve M49_growth_room slots on mount
  useEffect(() => {
    if (resolveFiredRef.current) return;
    if (ss.growth_room && typeof ss.growth_room === "object") {
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
      path: "growth" as const,
      guidance_mode: (ss.guidance_mode || "hybrid") as
        | "universal"
        | "hybrid"
        | "rooted",
      locale: (ss.locale || "en") as string,
      user_attention_state: "reflective_open",
      emotional_weight: "moderate" as const,
      cycle_day: Number(ss.day_number) || 0,
      entered_via:
        typeof ss._entered_via === "string" && ss._entered_via
          ? ss._entered_via
          : "check_in_vijnanamaya_question_forming",
      stage_signals: {},
      today_layer: {
        today_kosha: ss.today_kosha || "vijnanamaya",
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
      const payload = await mitraResolveMoment("M49_growth_room", resolveCtx);
      if (cancelled || !payload) return;
      store.dispatch(
        screenActions.setScreenValue({
          key: "growth_room",
          value: payload.slots,
        }),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Resolve M49_inquiry_seeds once, first time user taps into inquiry.
  // Fetched as 5 separate resolve calls (one per category) — each returns
  // its own slots keyed on the category. All 5 stored in
  // screenData.growth_inquiry_seeds under their category keys.
  const resolveInquirySeeds = async () => {
    if (seedsResolveFiredRef.current) return;
    seedsResolveFiredRef.current = true;
    const baseCtx = {
      path: "growth" as const,
      guidance_mode: (ss.guidance_mode || "hybrid") as
        | "universal"
        | "hybrid"
        | "rooted",
      locale: (ss.locale || "en") as string,
      user_attention_state: "reflective_open",
      emotional_weight: "moderate" as const,
      cycle_day: Number(ss.day_number) || 0,
      entered_via: "growth_room_pill_inquiry",
      stage_signals: {} as Record<string, string>,
      today_layer: {},
      life_layer: {
        cycle_id: ss.journey_id || ss.cycle_id || "",
        life_kosha: ss.life_kosha || ss.scan_focus || "",
        scan_focus: ss.scan_focus || "",
      },
    };
    const seedsMap: Record<string, any> = {};
    await Promise.all(
      INQUIRY_CATEGORIES.map(async (cat) => {
        const payload = await mitraResolveMoment("M49_inquiry_seeds", {
          ...baseCtx,
          stage_signals: { category: cat },
        });
        if (payload?.slots) {
          seedsMap[cat] = payload.slots;
        }
      }),
    );
    store.dispatch(
      screenActions.setScreenValue({
        key: "growth_inquiry_seeds",
        value: seedsMap,
      }),
    );
  };

  // Growth pacing: 10s auto-reveal per M49 silence_tolerance_sec.
  // Slower than joy's 2s — contemplative posture.
  useEffect(() => {
    Animated.timing(fade1, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start(() => {
      const timer = setTimeout(() => {
        revealOptions();
      }, 10000);
      return () => clearTimeout(timer);
    });
  }, [fade1]);

  // Slot reads (room-level)
  const openingLine = readSlot(ss, "opening_line");
  const secondBeatLine = readSlot(ss, "second_beat_line");
  const readyHintLabel = readSlot(ss, "ready_hint");
  const offerIntroText = readSlot(ss, "offer_intro_text");
  const pillInquiryLabel = readSlot(ss, "pill_inquiry_label");
  const pillTeachingLabel = readSlot(ss, "pill_teaching_label");
  const pillMantraLabel = readSlot(ss, "pill_mantra_label");
  const pillPracticeLabel = readSlot(ss, "pill_practice_label");
  const pillJournalLabel = readSlot(ss, "pill_journal_label");
  const pillExitLabel = readSlot(ss, "pill_exit_label");
  const inputInquiryPrompt = readSlot(ss, "input_inquiry_prompt");
  const inputPlaceholder = readSlot(ss, "input_placeholder");
  const inputSubmitLabel = readSlot(ss, "input_submit_label");
  const inputCancelLabel = readSlot(ss, "input_cancel_label");
  const seededPrincipleId = readSlot(ss, "seeded_principle_id");
  // Null-asset render guards (founder adjustment #4, 2026-04-19): hide
  // runner-launching pills if their item_id slot is missing.
  const growthMantraItemId = readSlot(ss, "growth_mantra_item_id");
  const growthPracticeItemId = readSlot(ss, "growth_practice_item_id");

  const revealOptions = () => {
    if (step === "opening") {
      setStep("options");
      Animated.timing(fade2, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }).start();
    }
  };

  const dispatch = (
    actionType: string,
    actionTarget?: any,
    actionPayload?: any,
  ) => {
    if (actionType !== "exit_growth_room") {
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

  const handleInquiryPillTap = async () => {
    await resolveInquirySeeds();
    setStep("inquiry_categories");
  };

  const handleCategoryTap = (cat: InquiryCategory) => {
    setSelectedCategory(cat);
    setStep("inquiry_seat");
  };

  const handleTeachingTap = () => {
    // Open WhyThisSheet L2 seeded with growth principle.
    // Dispatches existing open_why_this_l2 action if available;
    // otherwise falls through — mirrors WhyThisSheet wiring per Phase D.
    if (seededPrincipleId) {
      dispatch("open_why_this_l2", null, {
        principle_id: seededPrincipleId,
      });
    }
  };

  // Hydrate growth mantra (invariant #8: runner_variant=mantra → Gita family)
  // and route through core mantra render path.
  const handleMantraTap = async () => {
    const itemId = readSlot(ss, "growth_mantra_item_id");
    if (!itemId) {
      console.warn("[growth_room] growth_mantra_item_id missing from slots");
      return;
    }
    try {
      const resp = await mitraLibrarySearch(itemId, "mantra");
      const mantra = (resp?.results || []).find(
        (r: any) => r?.item_id === itemId,
      );
      if (!mantra) {
        console.warn("[growth_room] mantra not found:", itemId);
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
          source: "support_growth",
          variant: "mantra",
          target_reps: 27,
          item: { ...mantra, core: mantra },
        },
      );
    } catch (err) {
      console.warn("[growth_room] mantra tap failed:", err);
    }
  };

  // Hydrate growth practice (invariant #8: runner_variant=practice →
  // Ayurveda/Dinacharya family; enforced at M_completion_return resolver).
  const handlePracticeTap = async () => {
    const itemId = readSlot(ss, "growth_practice_item_id");
    if (!itemId) {
      console.warn("[growth_room] growth_practice_item_id missing from slots");
      return;
    }
    try {
      const resp = await mitraLibrarySearch(itemId, "practice");
      const practice = (resp?.results || []).find(
        (r: any) => r?.item_id === itemId,
      );
      if (!practice) {
        console.warn("[growth_room] practice not found:", itemId);
        return;
      }
      // Canonical rich runner routing (LOCKED 2026-04-19): support
      // practice lands on offering_reveal to match growth mantra + all
      // other support runner paths. No parallel thin practice surface.
      dispatch(
        "start_runner",
        { container_id: "cycle_transitions", state_id: "offering_reveal" },
        {
          source: "support_growth",
          variant: "practice",
          item: practice,
        },
      );
    } catch (err) {
      console.warn("[growth_room] practice tap failed:", err);
    }
  };

  const handleJournalSubmit = () => {
    dispatch("growth_journal_submitted", {
      text: inputValue,
      length_chars: inputValue.length,
      category: selectedCategory || "general",
    });
    setInputValue("");
    setStep("options");
  };

  const renderOptions = () => (
    <Animated.View style={[styles.optionsStack, { opacity: fade2 }]}>
      {!!offerIntroText && (
        <Text style={styles.offerText}>{offerIntroText}</Text>
      )}

      {!!pillInquiryLabel && (
        <TouchableOpacity style={styles.pill} onPress={handleInquiryPillTap}>
          <Text style={styles.pillText}>{pillInquiryLabel}</Text>
        </TouchableOpacity>
      )}

      {!!pillTeachingLabel && !!seededPrincipleId && (
        <TouchableOpacity style={styles.pill} onPress={handleTeachingTap}>
          <Text style={styles.pillText}>{pillTeachingLabel}</Text>
        </TouchableOpacity>
      )}

      {!!pillMantraLabel && !!growthMantraItemId && (
        <TouchableOpacity
          style={styles.pill}
          onPress={handleMantraTap}
          testID="growth_mantra_option"
          accessibilityLabel="growth_mantra_option"
        >
          <Text style={styles.pillText}>{pillMantraLabel}</Text>
        </TouchableOpacity>
      )}

      {!!pillPracticeLabel && !!growthPracticeItemId && (
        <TouchableOpacity
          style={styles.pill}
          onPress={handlePracticeTap}
          testID="growth_practice_option"
          accessibilityLabel="growth_practice_option"
        >
          <Text style={styles.pillText}>{pillPracticeLabel}</Text>
        </TouchableOpacity>
      )}

      {!!pillJournalLabel && (
        <TouchableOpacity
          style={styles.pill}
          onPress={() => setStep("journal")}
        >
          <Text style={styles.pillText}>{pillJournalLabel}</Text>
        </TouchableOpacity>
      )}

      {!!pillExitLabel && (
        <TouchableOpacity
          style={styles.exitBtn}
          onPress={() =>
            dispatch("exit_growth_room", null, { actions_used: actionsUsed })
          }
        >
          <Text style={styles.exitText}>{pillExitLabel}</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  const renderInquiryCategories = () => (
    <View style={styles.categoriesStack}>
      {INQUIRY_CATEGORIES.map((cat) => {
        const label = readSeedSlot(ss, cat, "category_label");
        if (!label) return null;
        return (
          <TouchableOpacity
            key={cat}
            style={styles.pill}
            onPress={() => handleCategoryTap(cat)}
          >
            <Text style={styles.pillText}>{label}</Text>
          </TouchableOpacity>
        );
      })}
      <TouchableOpacity
        style={styles.exitBtn}
        onPress={() => setStep("options")}
      >
        <Text style={styles.exitText}>
          {readSlot(ss, "input_cancel_label") || ""}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderInquirySeat = () => {
    if (!selectedCategory) return null;
    const principleAnchor = readSeedSlot(
      ss,
      selectedCategory,
      "principle_anchor_line",
    );
    const reflectivePrompt = readSeedSlot(
      ss,
      selectedCategory,
      "reflective_prompt",
    );
    const practiceLabel = readSeedSlot(
      ss,
      selectedCategory,
      "suggested_practice_label",
    );
    const journalCta = readSeedSlot(ss, selectedCategory, "journal_cta");
    const carryCta = readSeedSlot(
      ss,
      selectedCategory,
      "carry_forward_cta",
    );
    return (
      <View style={styles.inquirySeatWrap}>
        {!!principleAnchor && (
          <Text style={styles.principleAnchor}>{principleAnchor}</Text>
        )}
        {!!reflectivePrompt && (
          <Text style={styles.reflectivePrompt}>{reflectivePrompt}</Text>
        )}
        {!!practiceLabel && (
          <View style={styles.practiceBox}>
            <Text style={styles.practiceLabel}>{practiceLabel}</Text>
          </View>
        )}
        <View style={styles.seatActions}>
          {!!journalCta && (
            <TouchableOpacity
              style={styles.pill}
              onPress={() => setStep("journal")}
            >
              <Text style={styles.pillText}>{journalCta}</Text>
            </TouchableOpacity>
          )}
          {!!carryCta && (
            <TouchableOpacity
              style={styles.exitBtn}
              onPress={() => {
                setSelectedCategory(null);
                setStep("options");
              }}
            >
              <Text style={styles.exitText}>{carryCta}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderJournal = () => (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.inputWrap}
    >
      {!!inputInquiryPrompt && (
        <Text style={styles.inputPrompt}>{inputInquiryPrompt}</Text>
      )}
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
        {!!inputSubmitLabel && (
          <TouchableOpacity style={styles.pill} onPress={handleJournalSubmit}>
            <Text style={styles.pillText}>{inputSubmitLabel}</Text>
          </TouchableOpacity>
        )}
        {!!inputCancelLabel && (
          <TouchableOpacity
            onPress={() => {
              setInputValue("");
              if (selectedCategory) {
                setStep("inquiry_seat");
              } else {
                setStep("options");
              }
            }}
          >
            <Text style={styles.cancelText}>{inputCancelLabel}</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );

  return (
    <View style={styles.root}>
      {/* Always-visible back link during opening/options */}
      {(step === "opening" || step === "options") && !!pillExitLabel && (
        <View style={styles.topBackWrap} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.topBackBtn}
            activeOpacity={0.7}
            onPress={() =>
              dispatch("exit_growth_room", null, {
                actions_used: actionsUsed,
              })
            }
          >
            <Text style={styles.topBackText}>{pillExitLabel}</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {(step === "opening" || step === "options") && (
          <Animated.View style={{ opacity: fade1, marginBottom: 40 }}>
            {!!openingLine && (
              <Text
                style={styles.openingLine}
                testID="growth_room_opening_line"
              >
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
        {step === "inquiry_categories" && renderInquiryCategories()}
        {step === "inquiry_seat" && renderInquirySeat()}
        {step === "journal" && renderJournal()}
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
  topBackWrap: { position: "absolute", top: 10, left: 10, zIndex: 10 },
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
  categoriesStack: { width: "100%", gap: 12 },
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
  exitBtn: { alignItems: "center", paddingVertical: 14, marginTop: 8 },
  exitText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "#564B42",
    textDecorationLine: "underline",
  },
  inquirySeatWrap: {
    width: "100%",
    paddingVertical: 24,
    gap: 24,
  },
  principleAnchor: {
    fontFamily: Fonts.serif.regular,
    fontSize: 20,
    color: "#432104",
    textAlign: "center",
    lineHeight: 28,
  },
  reflectivePrompt: {
    fontFamily: Fonts.sans.medium,
    fontSize: 18,
    color: "#564B42",
    textAlign: "center",
    lineHeight: 26,
  },
  practiceBox: {
    borderLeftWidth: 2,
    borderLeftColor: "#DAC28E",
    paddingLeft: 16,
    paddingVertical: 8,
    marginHorizontal: 20,
  },
  practiceLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#432104",
    fontStyle: "italic",
  },
  seatActions: {
    alignItems: "center",
    gap: 16,
    marginTop: 16,
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
    minHeight: 120,
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
});

export default GrowthRoomContainer;
