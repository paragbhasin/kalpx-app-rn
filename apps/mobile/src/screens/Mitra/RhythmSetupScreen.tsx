/**
 * RhythmSetupScreen — 5-step guided wizard for first-time My Rhythm setup.
 *
 * When editMode===false (default): shows guided wizard (moments → purpose →
 * suggestion → reminders → confirmation). When editMode===true: shows the
 * accordion editor directly (used by RhythmEditScreen wrapper).
 */

import {
  getMissingSuggestionSlots,
  RHYTHM_BAND_LABELS,
  RHYTHM_BAND_SUBTITLES,
  RHYTHM_SUGGEST_COPY,
  rhythmSuggestItemToLocalItem,
  toRhythmSetupPayloadItems,
} from "@kalpx/contracts";
import type { RhythmTimeBand, RhythmWizardLocalItem } from "@kalpx/types";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import AfternoonIcon from "../../../assets/aft.svg";
import MorningIcon from "../../../assets/morning.svg";
import NightIcon from "../../../assets/night1.svg";
import LibrarySearchModal, {
  LibrarySearchItem,
} from "../../components/LibrarySearchModal";
import { executeAction } from "../../engine/actionExecutor";
import {
  mitraJourneyHomeV3,
  postRhythmSetup,
  postRhythmSuggest,
} from "../../engine/mitraApi";
import { useScreenStore } from "../../engine/useScreenBridge";
import { setHomeData } from "../../store/doorSlice";
import {
  goBackWithData,
  loadScreenWithData,
  screenActions,
} from "../../store/screenSlice";
import { Fonts } from "../../theme/fonts";

// ─── Types ────────────────────────────────────────────────────────────────────

type WizardStep =
  | "moments"
  | "purpose"
  | "suggestion"
  | "reminders"
  | "confirmation";

interface BandItem {
  item_id: string;
  item_type: string;
  title: string;
  description?: string | null;
}

type BandItems = Record<RhythmTimeBand, BandItem[]>;

// ─── Content maps ──────────────────────────────────────────────────────────────

const BANDS: RhythmTimeBand[] = ["morning", "afternoon", "night"];
const BAND_ART: Record<RhythmTimeBand, React.ComponentType<any>> = {
  morning: MorningIcon,
  afternoon: AfternoonIcon,
  night: NightIcon,
};
const RHYTHM_BG = require("../../../assets/beige_bg.png");
const RHYTHM_LEAF_ART = require("../../../assets/leaves-bird.png");

const MOMENT_COPY: Record<RhythmTimeBand, { label: string; desc: string }> = {
  morning: {
    label: "Morning",
    desc: "Begin the day with steadiness and intention.",
  },
  afternoon: {
    label: "Afternoon",
    desc: "Pause, reset, and return to yourself.",
  },
  night: { label: "Night", desc: "Reflect, release, and close gently." },
};

const PURPOSE_OPTIONS: Record<
  RhythmTimeBand,
  { value: string; label: string; desc: string }[]
> = {
  morning: [
    {
      value: "calm_start",
      label: "Calm Start",
      desc: "Begin without rushing inside.",
    },
    { value: "focus", label: "Focus", desc: "Gather the mind before action." },
    {
      value: "devotion",
      label: "Devotion",
      desc: "Begin the day with reverence.",
    },
    {
      value: "discipline",
      label: "Discipline",
      desc: "Start with one sincere commitment.",
    },
    {
      value: "gratitude",
      label: "Gratitude",
      desc: "Remember what supports you.",
    },
    {
      value: "clarity",
      label: "Clarity",
      desc: "See the day with steadiness.",
    },
  ],
  afternoon: [
    { value: "reset", label: "Reset", desc: "Clear the midday weight." },
    {
      value: "patience",
      label: "Patience",
      desc: "Steady the response to friction.",
    },
    {
      value: "sankalp_reminder",
      label: "Sankalp Reminder",
      desc: "Return to the quality you are practicing.",
    },
    {
      value: "energy_check",
      label: "Energy Check",
      desc: "Restore prana for the second half.",
    },
    {
      value: "mindful_action",
      label: "Mindful Action",
      desc: "Act from intention, not reaction.",
    },
    {
      value: "emotional_balance",
      label: "Emotional Balance",
      desc: "Settle what is stirred.",
    },
  ],
  night: [
    {
      value: "release",
      label: "Release",
      desc: "Let go of what the day placed on you.",
    },
    {
      value: "gratitude",
      label: "Gratitude",
      desc: "Close with what was given.",
    },
    {
      value: "reflection",
      label: "Reflection",
      desc: "See the day clearly before rest.",
    },
    {
      value: "forgiveness",
      label: "Forgiveness",
      desc: "Dissolve what you are still carrying.",
    },
    {
      value: "sleep_calm",
      label: "Sleep Calm",
      desc: "Steady the mind for deep rest.",
    },
    {
      value: "self_review",
      label: "Self-Review",
      desc: "Study what the day is teaching.",
    },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function RhythmSetupScreen({
  editMode = false,
  embedded = false,
}: {
  editMode?: boolean;
  embedded?: boolean;
}) {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const homeData = useSelector((state: any) => state.door?.homeData);
  const existingRhythm = homeData?.companion_rhythm;

  // ── Screen bridge (needed for executeAction in wizard confirmation) ──────────
  const screenBridge = useScreenStore();
  const screenBridgeRef = useRef(screenBridge);
  useEffect(() => {
    screenBridgeRef.current = screenBridge;
  });

  const buildActionContext = useCallback(
    () => ({
      screenState: screenBridgeRef.current.screenData || {},
      setScreenValue: (value: any, key: string) => {
        dispatch(screenActions.setScreenValue({ key, value }));
      },
      loadScreen: (target: any) => {
        const containerId =
          typeof target === "string"
            ? "generic"
            : target?.container_id || target?.containerId || "generic";
        const stateId =
          typeof target === "string"
            ? target
            : target?.state_id || target?.stateId || "";
        dispatch(loadScreenWithData({ containerId, stateId }) as any);
        navigation.navigate("DynamicEngine");
      },
      goBack: () => {
        dispatch(goBackWithData() as any);
      },
      currentScreen: screenBridgeRef.current.currentScreen,
    }),
    [dispatch, navigation],
  );

  const openRhythmHome = useCallback(() => {
    dispatch(
      screenActions.setScreenValue({
        key: "dashboard_entry_surface",
        value: "my_rhythm",
      }),
    );
    dispatch(
      loadScreenWithData({
        containerId: "companion_dashboard",
        stateId: "day_active",
      }) as any,
    );
    navigation.navigate("DynamicEngine");
  }, [dispatch, navigation]);

  const leaveEmbeddedFlow = useCallback(() => {
    if (embedded) {
      dispatch(
        screenActions.setScreenValue({
          key: "dashboard_entry_surface",
          value: null,
        }),
      );
    }
    navigation.goBack();
  }, [dispatch, embedded, navigation]);

  const handleEditBack = useCallback(() => {
    if (embedded) {
      openRhythmHome();
      return;
    }
    navigation.goBack();
  }, [embedded, navigation, openRhythmHome]);

  // ── Wizard state ─────────────────────────────────────────────────────────────
  const [wizardStep, setWizardStep] = useState<WizardStep | null>(
    editMode ? null : "moments",
  );
  const [selectedMoments, setSelectedMoments] = useState<RhythmTimeBand[]>([]);
  const [purposes, setPurposes] = useState<
    Partial<Record<RhythmTimeBand, string>>
  >({});
  const [wizardItems, setWizardItems] = useState<
    Partial<Record<RhythmTimeBand, RhythmWizardLocalItem>>
  >({});
  const [wizardReminderPref, setWizardReminderPref] = useState<
    "yes" | "no" | "later"
  >("later");
  const [wizardPickerBand, setWizardPickerBand] =
    useState<RhythmTimeBand | null>(null);
  const [wizardSaving, setWizardSaving] = useState(false);
  const [wizardError, setWizardError] = useState("");
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [suggestionsLoaded, setSuggestionsLoaded] = useState(false);

  // ── Accordion state (edit mode) ───────────────────────────────────────────────
  const seedBand = (band: RhythmTimeBand): BandItem[] => {
    const slot = existingRhythm?.[band];
    if (!slot?.items?.length) return [];
    return slot.items.map((item: any) => ({
      item_id: item.item_id,
      item_type: item.item_type,
      title: item.title_snapshot,
      description: item.description_snapshot ?? null,
    }));
  };

  const [bandItems, setBandItems] = useState<BandItems>({
    morning: seedBand("morning"),
    afternoon: seedBand("afternoon"),
    night: seedBand("night"),
  });
  const [expandedBand, setExpandedBand] = useState<RhythmTimeBand | null>(
    "morning",
  );
  const [libraryBand, setLibraryBand] = useState<RhythmTimeBand | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [reminderPref, setReminderPref] = useState<"yes" | "no" | "later">(
    "later",
  );

  // ── Wizard methods ────────────────────────────────────────────────────────────

  const toggleMoment = (band: RhythmTimeBand) => {
    setSelectedMoments((prev) =>
      prev.includes(band) ? prev.filter((b) => b !== band) : [...prev, band],
    );
  };

  // Reload guard: reset stale suggestions when moments or purposes change
  useEffect(() => {
    setWizardItems({});
    setSuggestError(null);
    setSuggestionsLoaded(false);
  }, [selectedMoments, purposes]);

  // Load suggestions once when entering suggestion step
  useEffect(() => {
    if (wizardStep === "suggestion" && !editMode && !suggestionsLoaded) {
      void loadSuggestions();
    }
  }, [wizardStep, suggestionsLoaded]);

  const loadSuggestions = async () => {
    setSuggestLoading(true);
    setSuggestError(null);
    try {
      const resp = await postRhythmSuggest({
        selected_moments: selectedMoments,
        purposes,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: "en",
        source_surface: "rhythm_wizard",
      });
      const newItems: Partial<Record<RhythmTimeBand, RhythmWizardLocalItem>> =
        {};
      resp.items.forEach((it, idx) => {
        newItems[it.slot] = {
          ...rhythmSuggestItemToLocalItem(it),
          sort_order: idx,
        };
      });
      setWizardItems(newItems);
      setSuggestionsLoaded(true);
      if (resp.status === "partial" && resp.missing_slots?.length) {
        setSuggestError(
          `Mitra could not suggest a practice for: ${resp.missing_slots.join(", ")}.`,
        );
      }
    } catch {
      setSuggestError(RHYTHM_SUGGEST_COPY.error);
    } finally {
      setSuggestLoading(false);
    }
  };

  const advanceToSuggestion = () => {
    setWizardStep("suggestion");
  };

  const handleWizardPickerSelect = (item: LibrarySearchItem) => {
    if (!wizardPickerBand) return;
    const itemId = item.itemId || (item as any).item_id || "";
    const itemType =
      (item as any)._type ||
      item.itemType ||
      (item as any).item_type ||
      "practice";
    setWizardItems((prev) => ({
      ...prev,
      [wizardPickerBand]: {
        slot: wizardPickerBand,
        item_id: itemId,
        item_type: itemType,
        title_snapshot: item.title,
        description_snapshot: item.description ?? null,
        source: "user_chosen" as const,
        sort_order: selectedMoments.indexOf(wizardPickerBand),
        reminder_enabled: false,
        reminder_time: null,
      },
    }));
    setWizardPickerBand(null);
  };

  const saveWizard = async () => {
    setWizardSaving(true);
    setWizardError("");
    try {
      const localItems = BANDS.filter((b) => wizardItems[b]).map(
        (b) => wizardItems[b]!,
      );
      const items = toRhythmSetupPayloadItems(localItems) as any[];
      await postRhythmSetup({ items, reminder_preference: wizardReminderPref });
      const newHomeData = await mitraJourneyHomeV3();
      dispatch(setHomeData(newHomeData));
      setWizardStep("confirmation");
    } catch {
      setWizardError("Could not save. Please try again.");
    } finally {
      setWizardSaving(false);
    }
  };

  const beginTodaysPractice = () => {
    const hour = new Date().getHours();
    const band: RhythmTimeBand =
      hour < 12 ? "morning" : hour < 17 ? "afternoon" : "night";
    const rhythm = homeData?.companion_rhythm;
    const practiceItem = rhythm?.[band]?.items?.[0];
    if (!practiceItem) {
      openRhythmHome();
      return;
    }
    void executeAction(
      {
        type: "start_runner",
        payload: {
          source: "rhythm_daily",
          variant: practiceItem.item_type,
          item: {
            item_id: practiceItem.item_id,
            title_snapshot: practiceItem.title_snapshot,
            description_snapshot: practiceItem.description_snapshot ?? "",
            item_type: practiceItem.item_type,
          },
        },
      } as any,
      buildActionContext() as any,
    );
  };

  // ── Accordion methods ─────────────────────────────────────────────────────────

  const handleItemSelected = (item: LibrarySearchItem) => {
    if (!libraryBand) return;
    const itemId = item.itemId || (item as any).item_id || "";
    const itemType =
      (item as any)._type ||
      item.itemType ||
      (item as any).item_type ||
      "practice";
    setBandItems((prev) => {
      if (prev[libraryBand].some((i) => i.item_id === itemId)) return prev;
      return {
        ...prev,
        [libraryBand]: [
          ...prev[libraryBand],
          {
            item_id: itemId,
            item_type: itemType,
            title: item.title,
            description: item.description ?? null,
          },
        ],
      };
    });
    setLibraryBand(null);
  };

  const removeItem = (band: RhythmTimeBand, itemId: string) => {
    setBandItems((prev) => ({
      ...prev,
      [band]: prev[band].filter((i) => i.item_id !== itemId),
    }));
  };

  const handleSave = async () => {
    const allItems = BANDS.flatMap((band, _) =>
      bandItems[band].map((item, idx) => ({
        slot: band,
        item_type: item.item_type as any,
        item_id: item.item_id,
        title_snapshot: item.title,
        description_snapshot: item.description ?? null,
        source: "user_chosen" as const,
        sort_order: idx,
        reminder_enabled: false,
      })),
    );
    setSaving(true);
    setErrorMsg("");
    try {
      await postRhythmSetup({
        items: allItems,
        reminder_preference: reminderPref,
      });
      const newHomeData = await mitraJourneyHomeV3();
      dispatch(setHomeData(newHomeData));
      openRhythmHome();
    } catch {
      setErrorMsg("Could not save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Wizard step renderers ──────────────────────────────────────────────────────

  const STEP_LABELS: WizardStep[] = [
    "moments",
    "purpose",
    "suggestion",
    "reminders",
  ];

  const renderStepDots = (current: WizardStep) => {
    const idx = STEP_LABELS.indexOf(current);
    return (
      <View style={wStyles.dots}>
        {STEP_LABELS.map((_, i) => (
          <View key={i} style={[wStyles.dot, i === idx && wStyles.dotActive]} />
        ))}
      </View>
    );
  };

  const renderMomentsStep = () => (
    <SafeAreaView
      style={[wStyles.safe, embedded && styles.embeddedTransparent]}
    >
      <ImageBackground
        source={RHYTHM_BG}
        style={wStyles.background}
        imageStyle={wStyles.backgroundImage}
      >
        <ScrollView
          contentContainerStyle={wStyles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={wStyles.hero}>
            <Image
              source={RHYTHM_LEAF_ART}
              style={wStyles.leafArt}
              resizeMode="contain"
            />

            <TouchableOpacity
              onPress={leaveEmbeddedFlow}
              style={wStyles.backRow}
            >
              <Text style={wStyles.backText}>{"< Back"}</Text>
            </TouchableOpacity>
            {/* {renderStepDots("moments")} */}
            <Text style={wStyles.heading}>Build Your Daily Rhythm</Text>
            <Text style={wStyles.subheading}>
              When would you like Mitra to support you?
            </Text>
            <View style={{ alignSelf: "center" }}>
              <View style={wStyles.momentDividerRow}>
                <View style={wStyles.momentDividerLine} />
                <Text style={wStyles.momentDividerStar}>✦</Text>
                <View style={wStyles.momentDividerLine} />
              </View>
            </View>
            <View style={wStyles.helperCopyWrap}>
              <Text style={wStyles.helperTitle}>
                You can select more than one
              </Text>
              <Text style={wStyles.helperBody}>
                Choose all moments when you'd like Mitra to walk with you.
              </Text>
            </View>
          </View>

          {BANDS.map((band) => {
            const selected = selectedMoments.includes(band);
            const Icon = BAND_ART[band];
            return (
              <TouchableOpacity
                key={band}
                style={[
                  wStyles.momentCard,
                  selected && wStyles.momentCardSelected,
                ]}
                onPress={() => toggleMoment(band)}
                activeOpacity={0.82}
              >
                <View style={wStyles.momentArtWrap}>
                  <Icon width={40} height={40} />
                </View>
                <View style={wStyles.momentCardInner}>
                  <Text style={wStyles.momentLabel}>
                    {MOMENT_COPY[band].label}
                  </Text>
                  <View style={wStyles.momentDividerRow}>
                    <View style={wStyles.momentDividerLine} />
                    <Text style={wStyles.momentDividerStar}>✦</Text>
                    <View style={wStyles.momentDividerLine} />
                  </View>
                  <Text style={wStyles.momentDesc}>
                    {MOMENT_COPY[band].desc}
                  </Text>
                </View>
                <View
                  style={[wStyles.check, selected && wStyles.checkSelected]}
                >
                  {selected && <View style={wStyles.checkInner} />}
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[
              wStyles.primaryBtn,
              selectedMoments.length === 0 && wStyles.primaryBtnDisabled,
            ]}
            onPress={() => setWizardStep("purpose")}
            disabled={selectedMoments.length === 0}
            activeOpacity={0.85}
          >
            <Text style={wStyles.primaryBtnText}>Continue →</Text>
          </TouchableOpacity>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );

  const renderPurposeStep = () => (
    <SafeAreaView
      style={[wStyles.safe, embedded && styles.embeddedTransparent]}
    >
      <ScrollView
        contentContainerStyle={wStyles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => setWizardStep("moments")}
          style={wStyles.backRow}
        >
          <Text style={wStyles.backText}>{"< Back"}</Text>
        </TouchableOpacity>
        {renderStepDots("purpose")}
        <Text style={wStyles.heading}>Choose Your Purpose</Text>
        <Text style={wStyles.subheading}>
          What do you need from each moment?
        </Text>

        {selectedMoments.map((band) => (
          <View key={band} style={wStyles.purposeSection}>
            <Text style={wStyles.purposeBandLabel}>
              {MOMENT_COPY[band].label}
            </Text>
            <View style={wStyles.purposeGrid}>
              {PURPOSE_OPTIONS[band].map((opt) => {
                const active = purposes[band] === opt.value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      wStyles.purposeChip,
                      active && wStyles.purposeChipActive,
                    ]}
                    onPress={() =>
                      setPurposes((prev) => ({ ...prev, [band]: opt.value }))
                    }
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        wStyles.purposeChipLabel,
                        active && wStyles.purposeChipLabelActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                    <Text
                      style={[
                        wStyles.purposeChipDesc,
                        active && wStyles.purposeChipDescActive,
                      ]}
                    >
                      {opt.desc}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[
            wStyles.primaryBtn,
            selectedMoments.some((b) => !purposes[b]) &&
              wStyles.primaryBtnDisabled,
          ]}
          onPress={advanceToSuggestion}
          disabled={selectedMoments.some((b) => !purposes[b])}
          activeOpacity={0.8}
        >
          <Text style={wStyles.primaryBtnText}>Continue →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  const renderSuggestionStep = () => {
    const missingSlots = getMissingSuggestionSlots(
      selectedMoments,
      wizardItems,
    );
    const acceptDisabled = suggestLoading || missingSlots.length > 0;
    return (
      <SafeAreaView
        style={[wStyles.safe, embedded && styles.embeddedTransparent]}
      >
        <ScrollView
          contentContainerStyle={wStyles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            onPress={() => setWizardStep("purpose")}
            style={wStyles.backRow}
          >
            <Text style={wStyles.backText}>{"< Back"}</Text>
          </TouchableOpacity>
          {renderStepDots("suggestion")}
          <Text style={wStyles.heading}>Mitra Suggests</Text>
          <Text style={wStyles.subheading}>
            These practices match your intentions.
          </Text>

          {suggestLoading && (
            <View style={wStyles.loadingRow}>
              <ActivityIndicator color="#C99317" />
              <Text style={wStyles.loadingText}>
                {RHYTHM_SUGGEST_COPY.loading}
              </Text>
            </View>
          )}

          {!suggestLoading && suggestError && (
            <View style={wStyles.errorBox}>
              <Text style={wStyles.errorText}>{suggestError}</Text>
              <TouchableOpacity
                style={wStyles.retryBtn}
                onPress={() => {
                  setSuggestionsLoaded(false);
                  setWizardItems({});
                }}
                activeOpacity={0.8}
              >
                <Text style={wStyles.retryBtnText}>
                  {RHYTHM_SUGGEST_COPY.tryAgain}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setWizardStep(null)}
                activeOpacity={0.7}
                style={wStyles.secondaryLinkRow}
              >
                <Text style={wStyles.secondaryLink}>
                  {RHYTHM_SUGGEST_COPY.chooseFromLibrary}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!suggestLoading &&
            selectedMoments.map((band) => {
              const item = wizardItems[band];
              if (!item) {
                return (
                  <View key={band} style={wStyles.missingSlotBox}>
                    <Text style={wStyles.missingSlotText}>
                      Mitra could not suggest a{" "}
                      {MOMENT_COPY[band].label.toLowerCase()} practice.
                    </Text>
                    <TouchableOpacity
                      style={wStyles.changeBtn}
                      onPress={() => setWizardPickerBand(band)}
                      activeOpacity={0.7}
                    >
                      <Text style={wStyles.changeBtnText}>
                        {RHYTHM_SUGGEST_COPY.chooseFromLibrary}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              }
              return (
                <View key={band} style={wStyles.suggestionCard}>
                  <View style={wStyles.suggestionCardHeader}>
                    <Text style={wStyles.suggestionBandLabel}>
                      {MOMENT_COPY[band].label}
                    </Text>
                    <Text style={wStyles.suggestionTypeBadge}>
                      {item.item_type}
                    </Text>
                  </View>
                  <Text style={wStyles.suggestionTitle}>
                    {item.title_snapshot}
                  </Text>
                  {!!item.why_this && (
                    <Text style={wStyles.suggestionWhyThis}>
                      {item.why_this}
                    </Text>
                  )}
                  {!!item.description_snapshot && !item.why_this && (
                    <Text style={wStyles.suggestionDesc}>
                      {item.description_snapshot}
                    </Text>
                  )}
                  <TouchableOpacity
                    style={wStyles.changeBtn}
                    onPress={() => setWizardPickerBand(band)}
                    activeOpacity={0.7}
                  >
                    <Text style={wStyles.changeBtnText}>Change</Text>
                  </TouchableOpacity>
                </View>
              );
            })}

          <TouchableOpacity
            style={[
              wStyles.primaryBtn,
              acceptDisabled && wStyles.primaryBtnDisabled,
            ]}
            onPress={() => setWizardStep("reminders")}
            activeOpacity={0.8}
            disabled={acceptDisabled}
          >
            <Text style={wStyles.primaryBtnText}>Accept Rhythm →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setWizardStep(null);
            }}
            activeOpacity={0.7}
            style={wStyles.secondaryLinkRow}
          >
            <Text style={wStyles.secondaryLink}>Choose My Own</Text>
          </TouchableOpacity>
        </ScrollView>

        <LibrarySearchModal
          isVisible={wizardPickerBand !== null}
          onClose={() => setWizardPickerBand(null)}
          onItemAdded={() => {}}
          mode="select_for_rhythm"
          onItemSelected={handleWizardPickerSelect}
        />
      </SafeAreaView>
    );
  };

  const renderRemindersStep = () => (
    <SafeAreaView
      style={[wStyles.safe, embedded && styles.embeddedTransparent]}
    >
      <ScrollView
        contentContainerStyle={wStyles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          onPress={() => setWizardStep("suggestion")}
          style={wStyles.backRow}
        >
          <Text style={wStyles.backText}>{"< Back"}</Text>
        </TouchableOpacity>
        {renderStepDots("reminders")}
        <Text style={wStyles.heading}>Gentle Reminders</Text>
        <Text style={wStyles.subheading}>
          Would you like Mitra to remind you?
        </Text>

        <View style={wStyles.pillRow}>
          {(
            [
              { label: "Yes, gently", value: "yes" },
              { label: "I will come", value: "no" },
              { label: "Ask me later", value: "later" },
            ] as { label: string; value: "yes" | "no" | "later" }[]
          ).map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                wStyles.pill,
                wizardReminderPref === opt.value && wStyles.pillActive,
              ]}
              onPress={() => setWizardReminderPref(opt.value)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  wStyles.pillText,
                  wizardReminderPref === opt.value && wStyles.pillTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {!!wizardError && <Text style={wStyles.errorText}>{wizardError}</Text>}

        <TouchableOpacity
          style={[
            wStyles.primaryBtn,
            wizardSaving && wStyles.primaryBtnDisabled,
          ]}
          onPress={() => void saveWizard()}
          disabled={wizardSaving}
          activeOpacity={0.8}
        >
          {wizardSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={wStyles.primaryBtnText}>Continue →</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  const renderConfirmationStep = () => (
    <SafeAreaView
      style={[wStyles.safe, embedded && styles.embeddedTransparent]}
    >
      <ScrollView
        contentContainerStyle={wStyles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[wStyles.heading, { marginTop: 48 }]}>
          Your Daily Companion{"\n"}is ready.
        </Text>
        <Text style={wStyles.subheading}>
          A practice waits for you each day.
        </Text>

        <View style={wStyles.confirmList}>
          {selectedMoments.map((band) => {
            const item = wizardItems[band];
            if (!item) return null;
            return (
              <View key={band} style={wStyles.confirmRow}>
                <Text style={wStyles.confirmBand}>
                  {MOMENT_COPY[band].label}
                </Text>
                <Text style={wStyles.confirmTitle}>{item.title_snapshot}</Text>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          style={wStyles.primaryBtn}
          onPress={beginTodaysPractice}
          activeOpacity={0.8}
        >
          <Text style={wStyles.primaryBtnText}>Begin today's practice</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[wStyles.primaryBtn, wStyles.secondaryBtn]}
          onPress={openRhythmHome}
          activeOpacity={0.8}
        >
          <Text style={[wStyles.primaryBtnText, { color: "#7B6550" }]}>
            Return Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            dispatch(
              loadScreenWithData({
                containerId: "companion_dashboard",
                stateId: "day_active",
              }) as any,
            );
            navigation.navigate("DynamicEngine" as any);
          }}
          activeOpacity={0.7}
          style={wStyles.secondaryLinkRow}
        >
          <Text style={wStyles.secondaryLink}>Add Inner Path</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  // ── Render ────────────────────────────────────────────────────────────────────

  if (wizardStep === "moments") return renderMomentsStep();
  if (wizardStep === "purpose") return renderPurposeStep();
  if (wizardStep === "suggestion") return renderSuggestionStep();
  if (wizardStep === "reminders") return renderRemindersStep();
  if (wizardStep === "confirmation") return renderConfirmationStep();

  // ── Edit mode: accordion ──────────────────────────────────────────────────────
  return (
    <SafeAreaView
      style={[styles.safeArea, embedded && styles.embeddedTransparent]}
    >
      <ImageBackground
        source={RHYTHM_BG}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <Image
              source={RHYTHM_LEAF_ART}
              style={styles.leafArt}
              resizeMode="contain"
            />

            <TouchableOpacity
              onPress={handleEditBack}
              activeOpacity={0.7}
              style={styles.backBtn}
            >
              <Text style={styles.backBtnText}>{"< Back"}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {editMode ? "Edit My Rhythm" : "Set Up My Rhythm"}
            </Text>
          </View>

          {BANDS.map((band) => {
            const isExpanded = expandedBand === band;
            const Icon = BAND_ART[band];
            return (
              <View key={band} style={styles.bandBlock}>
                <TouchableOpacity
                  style={[
                    styles.bandHeaderCard,
                    isExpanded && styles.bandHeaderCardExpanded,
                  ]}
                  onPress={() => setExpandedBand(isExpanded ? null : band)}
                  activeOpacity={0.8}
                >
                  <View style={styles.bandIconWrap}>
                    <Icon width={38} height={38} />
                  </View>
                  <View style={styles.bandCopy}>
                    <Text style={styles.bandLabel}>
                      {RHYTHM_BAND_LABELS[band]}
                    </Text>
                    <Text style={styles.bandSubtitle}>
                      {RHYTHM_BAND_SUBTITLES[band]}
                    </Text>
                  </View>
                  <Text style={styles.chevron}>{isExpanded ? "⌃" : "⌄"}</Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.bandBody}>
                    {bandItems[band].map((item) => (
                      <View key={item.item_id} style={styles.addedItem}>
                        <View style={styles.addedItemInfo}>
                          <Text style={styles.addedItemType}>
                            {item.item_type}
                          </Text>
                          <Text style={styles.addedItemTitle}>
                            {item.title}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => removeItem(band, item.item_id)}
                          activeOpacity={0.7}
                          style={styles.removeBtn}
                        >
                          <Text style={styles.removeBtnText}>Remove</Text>
                        </TouchableOpacity>
                      </View>
                    ))}

                    <TouchableOpacity
                      style={styles.addFromLibraryBtn}
                      onPress={() => setLibraryBand(band)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.addFromLibraryPlus}>＋</Text>
                      <Text style={styles.addFromLibraryText}>
                        Add from library
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}

          <View style={styles.reminderSection}>
            <Text style={styles.reminderLabel}>Reminder preference</Text>
            <View style={styles.reminderPills}>
              {(
                [
                  { label: "Yes please", value: "yes" },
                  { label: "No thanks", value: "no" },
                  { label: "Remind me later", value: "later" },
                ] as { label: string; value: "yes" | "no" | "later" }[]
              ).map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  onPress={() => setReminderPref(opt.value)}
                  activeOpacity={0.7}
                  style={[
                    styles.reminderPill,
                    reminderPref === opt.value && styles.reminderPillSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.reminderPillText,
                      reminderPref === opt.value &&
                        styles.reminderPillTextSelected,
                    ]}
                  >
                    {reminderPref === opt.value && opt.value === "later"
                      ? "✓  "
                      : ""}
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {!!errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}

          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.saveBtnIcon}>✦</Text>
                <Text style={styles.saveBtnText}>Save My Rhythm</Text>
                <Text style={styles.saveBtnArrow}>→</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>

        <LibrarySearchModal
          isVisible={libraryBand !== null}
          onClose={() => setLibraryBand(null)}
          onItemAdded={() => {}}
          mode="select_for_rhythm"
          onItemSelected={handleItemSelected}
        />
      </ImageBackground>
    </SafeAreaView>
  );
}

// ─── Wizard styles ─────────────────────────────────────────────────────────────

const wStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF8EF" },
  background: { flex: 1 },
  backgroundImage: { opacity: 0.98 },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 48 },
  hero: { position: "relative", paddingTop: 6 },
  leafArt: {
    position: "absolute",
    right: -70,
    top: -110,
    width: 300,
    height: 300,
    opacity: 0.78,
  },
  brandBlock: { marginLeft: 2, marginBottom: 26 },
  brandTitle: {
    fontSize: 34,
    lineHeight: 36,
    color: "#D19A18",
    fontFamily: Fonts.serif.regular,
  },
  brandSubtitle: {
    fontSize: 11,
    color: "#9B7340",
    fontFamily: Fonts.sans.regular,
    marginTop: 2,
    marginLeft: 2,
  },
  backRow: { alignSelf: "flex-start", marginBottom: 18 },
  backText: { fontSize: 16, color: "#C99317", fontFamily: Fonts.sans.medium },
  dots: { flexDirection: "row", gap: 8, marginBottom: 24, alignSelf: "center" },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(201,168,76,0.25)",
  },
  dotActive: { width: 30, backgroundColor: "#C99317" },
  heading: {
    fontFamily: Fonts.serif.bold,
    fontSize: 28,
    color: "#432104",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subheading: {
    fontSize: 16,
    color: "#7B6550",
    fontFamily: Fonts.sans.regular,
    marginBottom: 18,
    lineHeight: 24,
    textAlign: "center",
  },
  helperCopyWrap: {
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  helperTitle: {
    fontSize: 13,
    color: "#8E5D99",
    fontFamily: Fonts.sans.bold,
    marginBottom: 4,
    textAlign: "center",
  },
  helperBody: {
    fontSize: 13,
    color: "#7B6550",
    fontFamily: Fonts.sans.regular,
    lineHeight: 20,
    textAlign: "center",
  },
  momentCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: "rgba(201,168,76,0.26)",
    backgroundColor: "rgba(245,245,240,0.45)",
    marginBottom: 16,
    shadowColor: "#432104",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 1,
  },
  momentCardSelected: {
    borderColor: "#C99317",
    backgroundColor: "rgba(255,251,244,0.98)",
  },
  momentArtWrap: {
    width: 48,
    height: 48,
    borderRadius: 22,

    backgroundColor: "#FCF8EC",
    alignItems: "center",
    justifyContent: "center",
  },
  momentCardInner: { flex: 1, marginRight: 4 },
  momentLabel: {
    fontFamily: Fonts.serif.bold,
    fontSize: 19,
    color: "#432104",
    fontWeight: "700",
    marginBottom: 8,
  },
  momentDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 5,
  },
  momentDividerLine: {
    width: 56,
    height: 1,
    backgroundColor: "rgba(228,180,79,0.4)",
  },
  momentDividerStar: {
    fontSize: 13,
    lineHeight: 13,
    color: "#E4B44F",
  },
  momentDesc: {
    fontSize: 13,
    color: "#7B6550",
    fontFamily: Fonts.sans.regular,
    lineHeight: 22,
    maxWidth: 220,
  },
  check: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(201,168,76,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkSelected: { borderColor: "#C99317" },
  checkInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#C99317",
  },
  purposeSection: { marginBottom: 20 },
  purposeBandLabel: {
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    color: "#432104",
    fontWeight: "700",
    marginBottom: 10,
  },
  purposeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  purposeChip: {
    width: "47%",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.3)",
    backgroundColor: "rgba(250,245,240,0.92)",
  },
  purposeChipActive: {
    borderColor: "#C99317",
    backgroundColor: "rgba(201,147,23,0.1)",
  },
  purposeChipLabel: {
    fontFamily: Fonts.serif.bold,
    fontSize: 14,
    color: "#432104",
    fontWeight: "600",
    marginBottom: 2,
  },
  purposeChipLabelActive: { color: "#8B5E00" },
  purposeChipDesc: {
    fontSize: 11,
    color: "#A08060",
    fontFamily: Fonts.sans.regular,
  },
  purposeChipDescActive: { color: "#7B5500" },
  suggestionCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.25)",
    backgroundColor: "rgba(255,252,248,0.95)",
    marginBottom: 14,
  },
  suggestionCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  suggestionBandLabel: {
    fontFamily: Fonts.serif.bold,
    fontSize: 13,
    color: "#7B6550",
    fontWeight: "700",
  },
  suggestionTypeBadge: {
    fontSize: 11,
    color: "#8b6838",
    fontFamily: Fonts.sans.semiBold,
    textTransform: "uppercase",
  },
  suggestionTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 17,
    color: "#432104",
    fontWeight: "600",
    marginBottom: 4,
  },
  suggestionDesc: {
    fontSize: 13,
    color: "#7B6550",
    fontFamily: Fonts.sans.regular,
    marginBottom: 10,
  },
  suggestionWhyThis: {
    fontSize: 13,
    color: "#8B6914",
    fontFamily: Fonts.sans.regular,
    fontStyle: "italic",
    marginBottom: 10,
  },
  loadingRow: { alignItems: "center", paddingVertical: 24, gap: 12 },
  loadingText: {
    fontSize: 14,
    color: "#7B6550",
    fontFamily: Fonts.sans.regular,
    textAlign: "center",
  },
  errorBox: { alignItems: "center", paddingVertical: 16, gap: 10 },
  retryBtn: {
    backgroundColor: "#C99317",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryBtnText: {
    fontSize: 14,
    color: "#fff",
    fontFamily: Fonts.sans.semiBold,
  },
  missingSlotBox: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(201,100,76,0.3)",
    backgroundColor: "rgba(255,245,245,0.9)",
    marginBottom: 12,
    gap: 10,
  },
  missingSlotText: {
    fontSize: 14,
    color: "#9B4E4E",
    fontFamily: Fonts.sans.regular,
  },
  changeBtn: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.4)",
  },
  changeBtnText: {
    fontSize: 13,
    color: "#C99317",
    fontFamily: Fonts.sans.medium,
  },
  pillRow: { flexDirection: "row", gap: 8, marginBottom: 24 },
  pill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#DAC28E",
    alignItems: "center",
    backgroundColor: "#FBF5F5",
  },
  pillActive: { backgroundColor: "#C99317", borderColor: "#C99317" },
  pillText: {
    fontSize: 13,
    color: "#7B6550",
    fontFamily: Fonts.sans.medium,
    textAlign: "center",
  },
  pillTextActive: { color: "#fff" },
  confirmList: { marginVertical: 24 },
  confirmRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(201,168,76,0.25)",
  },
  confirmBand: {
    fontFamily: Fonts.serif.bold,
    fontSize: 15,
    color: "#7B6550",
    fontWeight: "600",
  },
  confirmTitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: "#432104",
    flex: 1,
    textAlign: "right",
  },
  primaryBtn: {
    backgroundColor: "#C99317",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryBtnDisabled: { opacity: 0.45 },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: Fonts.sans.semiBold,
    color: "#fff",
  },
  secondaryBtn: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.4)",
  },
  secondaryLinkRow: { alignItems: "center", paddingTop: 12 },
  secondaryLink: {
    fontSize: 13,
    color: "#C99317",
    fontFamily: Fonts.sans.medium,
  },
  errorText: {
    fontSize: 13,
    color: "#c0392b",
    textAlign: "center",
    marginBottom: 10,
  },
});

// ─── Accordion styles ──────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF8EF" },
  embeddedTransparent: { backgroundColor: "transparent" },
  background: { flex: 1 },
  backgroundImage: { opacity: 0.98 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
  hero: { position: "relative", paddingTop: 6, marginBottom: 18 },
  leafArt: {
    position: "absolute",
    right: -70,
    top: -110,
    width: 300,
    height: 300,
    opacity: 0.78,
  },
  brandBlock: { marginLeft: 4, marginBottom: 26 },
  brandTitle: {
    fontSize: 36,
    color: "#D19A18",
    fontFamily: Fonts.serif.regular,
    lineHeight: 38,
  },
  brandSubtitle: {
    fontSize: 11,
    color: "#9B7340",
    fontFamily: Fonts.sans.regular,
    marginTop: 2,
    marginLeft: 2,
  },
  backBtn: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginBottom: 22,
  },
  backBtnText: {
    fontSize: 16,
    color: "#D19A18",
    fontFamily: Fonts.sans.medium,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    fontWeight: "700",
    marginBottom: 8,
  },
  bandBlock: { marginBottom: 20 },
  bandHeaderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(226, 201, 151, 0.72)",
    borderRadius: 15,
    backgroundColor: "rgba(255, 250, 242, 0.96",
    shadowColor: "#8A6837",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 1,
  },
  bandHeaderCardExpanded: {
    backgroundColor: "rgba(248, 242, 230, 0.96)",
  },
  bandIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(248, 236, 210, 0.68)",
    alignItems: "center",
    justifyContent: "center",
  },
  bandCopy: { flex: 1, paddingRight: 10 },
  bandLabel: {
    fontSize: 16,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    fontWeight: "700",
    marginBottom: 2,
  },
  bandSubtitle: {
    fontSize: 13,
    fontFamily: Fonts.sans.regular,
    color: "#7B6550",
    lineHeight: 19,
  },
  chevron: { fontSize: 26, color: "#C99317", marginTop: -4 },
  bandBody: { paddingTop: 16, gap: 12 },
  addedItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(226, 201, 151, 0.9)",
    backgroundColor: "rgba(255, 251, 244, 0.95)",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  addedItemInfo: { flex: 1, paddingRight: 12 },
  addedItemType: {
    fontSize: 12,
    fontFamily: Fonts.sans.bold,
    color: "#9A7436",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  addedItemTitle: {
    fontSize: 14,
    fontFamily: Fonts.serif.regular,
    color: "#6A4523",
    lineHeight: 24,
  },
  removeBtn: { paddingVertical: 6, paddingLeft: 8 },
  removeBtnText: {
    fontSize: 14,
    color: "#DF4D35",
    fontFamily: Fonts.sans.semiBold,
  },
  addFromLibraryBtn: {
    // minHeight: 68,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(226, 201, 151, 0.95)",
    borderRadius: 34,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "rgba(255, 252, 248, 0.44)",
  },
  addFromLibraryPlus: {
    fontSize: 26,
    color: "#D39A14",
    marginRight: 10,
    lineHeight: 28,
  },
  addFromLibraryText: {
    fontSize: 17,
    color: "#D39A14",
    fontFamily: Fonts.serif.regular,
  },
  errorText: { fontSize: 14, color: "#c0392b", textAlign: "center" },
  saveBtn: {
    backgroundColor: "#D8A00E",
    borderRadius: 11,
    padding: 10,
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnIcon: { color: "#fff", fontSize: 24, marginRight: 12 },
  saveBtnText: { fontSize: 18, fontFamily: Fonts.sans.semiBold, color: "#fff" },
  saveBtnArrow: { color: "#fff", fontSize: 28, marginLeft: 12, lineHeight: 28 },
  reminderSection: { marginTop: 16, marginBottom: 6 },
  reminderLabel: {
    fontSize: 18,
    color: "#432104",
    fontFamily: Fonts.serif.regular,
    marginBottom: 16,
  },
  reminderPills: { flexDirection: "row", gap: 10 },
  reminderPill: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: "#D8BC77",
    borderRadius: 22,

    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(255, 250, 244, 0.85)",
  },
  reminderPillSelected: { backgroundColor: "#C99317", borderColor: "#C99317" },
  reminderPillText: {
    fontSize: 11,
    color: "#7B6550",
    fontFamily: Fonts.sans.medium,
    textAlign: "center",
    lineHeight: 18,
  },
  reminderPillTextSelected: { color: "#fff" },
});
