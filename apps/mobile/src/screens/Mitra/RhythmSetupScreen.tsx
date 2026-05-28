/**
 * RhythmSetupScreen — 5-step guided wizard for first-time My Rhythm setup.
 *
 * When editMode===false (default): shows guided wizard (moments → purpose →
 * suggestion → reminders → confirmation). When editMode===true: shows the
 * accordion editor directly (used by RhythmEditScreen wrapper).
 */

import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import {
  getMissingSuggestionSlots,
  RHYTHM_BAND_LABELS,
  RHYTHM_BAND_SUBTITLES,
  RHYTHM_SUGGEST_COPY,
  rhythmSuggestItemToLocalItem,
  toRhythmSetupPayloadItems,
} from "@kalpx/contracts";
import type { RhythmTimeBand, RhythmWizardLocalItem } from "@kalpx/types";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
const A1Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/purpose_a_calm_start.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const A2Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/purpose_a_focus.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const A3Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/purpose_a_devotion.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const A4Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/purpose_a_discipline.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const A5Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/purpose_a_gratitude.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const A6Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/purpose_a_clarity.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const AfternoonIcon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/aft.png")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const M1Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/purpose_m_calm_start.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const M2Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/purpose_m_focus.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const M3Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/purpose_m_devotion.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const M4Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/purpose_m_discipline.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const M5Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/purpose_m_gratitude.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const M6Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/purpose_m_clarity.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const MorningIcon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/morning.png")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const N1Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/purpose_n_calm_start.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const N2Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/purpose_n_focus.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const N3Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/purpose_n_devotion.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const N4Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/purpose_n_discipline.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const N5Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/purpose_n_gratitude.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const N6Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/purpose_n_clarity.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const NightIcon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/night.png")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
import LibrarySearchModal, {
  LibrarySearchItem,
} from "../../components/LibrarySearchModal";
import { TimePickerModal } from "../../components/TimePickerModal";
import { executeAction } from "../../engine/actionExecutor";
import {
  deleteRhythmItem,
  mitraJourneyHomeV3,
  mitraRhythmResolveItem,
  patchRhythmItem,
  patchRhythmSettings,
  postRhythmItemAdd,
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
import { platformShadow } from "../../theme/shadows";

// ─── Types ────────────────────────────────────────────────────────────────────

type WizardStep =
  | "moments"
  | "purpose"
  | "suggestion"
  | "reminders"
  | "confirmation";

interface BandItem {
  rhythm_item_id?: number;
  item_id: string;
  item_type: string;
  title: string;
  description?: string | null;
  source: string;
  sort_order: number;
  reminder_enabled: boolean;
  reminder_time: string | null;
}

type BandItems = Record<RhythmTimeBand, BandItem[]>;

// ─── Content maps ──────────────────────────────────────────────────────────────

const BANDS: RhythmTimeBand[] = ["morning", "afternoon", "night"];
const BAND_ART: Record<RhythmTimeBand, React.ComponentType<any>> = {
  morning: MorningIcon,
  afternoon: AfternoonIcon,
  night: NightIcon,
};
const RHYTHM_BG = require("../../../assets/beige_bg.webp");

const PURPOSE_ART: Record<RhythmTimeBand, React.ComponentType<any>[]> = {
  morning: [M3Icon, M5Icon, M1Icon, M4Icon, M2Icon, M6Icon],
  afternoon: [A5Icon, A1Icon, A4Icon, A2Icon, A6Icon, A3Icon],
  night: [N4Icon, N2Icon, N5Icon, N1Icon, N6Icon, N3Icon],
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

const DEFAULT_REMINDER_TIMES: Record<RhythmTimeBand, string> = {
  morning: "06:00",
  afternoon: "13:00",
  night: "21:00",
};

function normalizeReminderTime(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const match = value.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return null;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function toReminderParts(value: string | null | undefined): {
  hour: string;
  minute: string;
  period: "AM" | "PM";
} {
  const normalized =
    normalizeReminderTime(value) ?? DEFAULT_REMINDER_TIMES.morning;
  const [hourText, minute] = normalized.split(":");
  const hour = Number(hourText);
  return {
    hour: String(hour % 12 === 0 ? 12 : hour % 12).padStart(2, "0"),
    minute,
    period: hour >= 12 ? "PM" : "AM",
  };
}

function toReminderDisplay(value: string | null | undefined): string {
  if (!normalizeReminderTime(value)) return "--:-- --";
  const parts = toReminderParts(value);
  return `${parts.hour}:${parts.minute} ${parts.period}`;
}

function reminderTimeToDate(value: string | null | undefined): Date {
  const normalized =
    normalizeReminderTime(value) ?? DEFAULT_REMINDER_TIMES.morning;
  const [hourText, minuteText] = normalized.split(":");
  const date = new Date();
  date.setHours(Number(hourText), Number(minuteText), 0, 0);
  return date;
}

function dateToReminderTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function getBandReminderTimeFromRhythm(
  band: RhythmTimeBand,
  rhythm: any,
): string | null {
  const items = rhythm?.[band]?.items;
  if (!Array.isArray(items) || items.length === 0) return null;
  const enabledItem = items.find(
    (item: any) => item?.reminder_enabled && item?.reminder_time,
  );
  const fallbackItem = items.find((item: any) => item?.reminder_time);
  return normalizeReminderTime(
    enabledItem?.reminder_time ?? fallbackItem?.reminder_time,
  );
}

function hasExistingRhythmReminder(rhythm: any): boolean {
  return BANDS.some((band) =>
    Boolean(rhythm?.[band]?.items?.some((item: any) => item?.reminder_enabled)),
  );
}

function CompactReminderTimeField({
  value,
  onChange,
}: {
  value: string | null | undefined;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        style={styles.compactReminderField}
      >
        <Text style={styles.compactReminderFieldText}>
          {toReminderDisplay(value)}
        </Text>
        <Ionicons name="time-outline" size={12} color="#21160F" />
      </TouchableOpacity>
      <TimePickerModal
        visible={open}
        initialTime={value ?? null}
        onConfirm={(timeStr) => {
          onChange(timeStr);
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}

function ReminderTimeRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.reminderTimeCard}>
      <Text style={styles.reminderTimeCardLabel}>{label}</Text>
      <View style={styles.reminderTimeBtn}>
        <CompactReminderTimeField value={value} onChange={onChange} />
      </View>
    </View>
  );
}

function beginLabel(itemType: string, t: (key: string) => string): string {
  if (itemType === "mantra") return t("rhythmHome.beginChanting");
  if (itemType === "sankalp") return t("rhythmHome.beginEmbodying");
  return t("rhythmHome.beginPractice");
}

function getConfirmationItems(
  bands: RhythmTimeBand[],
  wizardItems: Partial<Record<RhythmTimeBand, RhythmWizardLocalItem>>,
  rhythm: any,
) {
  const fromWizard = bands
    .map((band) => ({ band, item: wizardItems[band] }))
    .filter((entry) => !!entry.item) as {
    band: RhythmTimeBand;
    item: RhythmWizardLocalItem;
  }[];

  if (fromWizard.length > 0) {
    return fromWizard;
  }

  return BANDS.map((band) => {
    const item = rhythm?.[band]?.items?.[0];
    if (!item) return null;
    return {
      band,
      item: {
        slot: band,
        item_id: item.item_id,
        item_type: item.item_type,
        title_snapshot: item.title_snapshot,
        description_snapshot: item.description_snapshot ?? null,
        source: item.source ?? "user_chosen",
        sort_order: item.sort_order ?? 0,
        reminder_enabled: item.reminder_enabled ?? false,
        reminder_time: item.reminder_time ?? null,
      } satisfies RhythmWizardLocalItem,
    };
  }).filter(Boolean) as { band: RhythmTimeBand; item: RhythmWizardLocalItem }[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RhythmSetupScreen({
  editMode = false,
  embedded = false,
}: {
  editMode?: boolean;
  embedded?: boolean;
}) {
  const { t, i18n } = useTranslation();
  const itemTypeLabelLocalized = (type: string) =>
    t(`rhythmSetup.itemType.${type}`, { defaultValue: "Library" });
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const homeData = useSelector((state: any) => state.door?.homeData);
  const existingRhythm = homeData?.companion_rhythm;
  const hasActiveInnerPath =
    homeData?.inner_path_summary?.has_active_path === true;

  // ── Screen bridge (needed for executeAction in wizard confirmation) ──────────
  const screenBridge = useScreenStore();
  const screenBridgeRef = useRef(screenBridge);
  useEffect(() => {
    screenBridgeRef.current = screenBridge;
  });

  const updateBackground = useScreenStore((state) => state.updateBackground);
  useFocusEffect(
    useCallback(() => {
      updateBackground(RHYTHM_BG);
      return () => updateBackground(null);
    }, [updateBackground]),
  );

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
    navigation.navigate("RhythmHome" as any);
  }, [navigation]);

  const openInnerPath = useCallback(() => {
    if (!hasActiveInnerPath) {
      dispatch(
        screenActions.setScreenValue({
          key: "onboarding_turn",
          value: "turn_2",
        }),
      );
      dispatch(
        screenActions.setScreenValue({
          key: "onboarding_draft_state",
          value: {
            started_at: Date.now(),
            entry_intention: "inner_path",
          },
        }),
      );
      dispatch(
        loadScreenWithData({
          containerId: "welcome_onboarding",
          stateId: "turn_2",
        }) as any,
      );
      navigation.navigate("DynamicEngine");
      return;
    }

    navigation.navigate("InnerPath" as any);
  }, [dispatch, hasActiveInnerPath, navigation]);

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
  const [wizardReminderTimes, setWizardReminderTimes] = useState<
    Partial<Record<RhythmTimeBand, string | null>>
  >({});
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
      rhythm_item_id: item.rhythm_item_id,
      item_id: item.item_id,
      item_type: item.item_type,
      title: item.title_snapshot,
      description: item.description_snapshot ?? null,
      source: item.source ?? "mitra_suggested",
      sort_order: item.sort_order,
      reminder_enabled: item.reminder_enabled ?? false,
      reminder_time: item.reminder_time ?? null,
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
    (existingRhythm?.reminder_preference as "yes" | "no" | "later") ??
      (hasExistingRhythmReminder(existingRhythm) ? "yes" : "later"),
  );

  // Frozen at mount — never recomputed during save to prevent stale snapshot
  const originalBandItems = useMemo<BandItems>(
    () => ({
      morning: seedBand("morning"),
      afternoon: seedBand("afternoon"),
      night: seedBand("night"),
    }),
    [],
  );
  const originalReminderPref = useMemo(
    () =>
      (existingRhythm?.reminder_preference as "yes" | "no" | "later") ?? null,
    [],
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
  const loadSuggestions = useCallback(async () => {
    setSuggestLoading(true);
    setSuggestError(null);
    try {
      const resp = await postRhythmSuggest({
        selected_moments: selectedMoments,
        purposes,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        locale: i18n.language,
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
  }, [purposes, selectedMoments, i18n.language]);

  // Re-fetch when locale changes while already on suggestion step
  useEffect(() => {
    if (wizardStep === "suggestion") {
      setWizardItems({});
      setSuggestError(null);
      setSuggestionsLoaded(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i18n.language]);

  useEffect(() => {
    if (wizardStep === "suggestion" && !editMode && !suggestionsLoaded) {
      void loadSuggestions();
    }
  }, [editMode, loadSuggestions, suggestionsLoaded, wizardStep]);

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
    setWizardReminderTimes((prev) => ({
      ...prev,
      [wizardPickerBand]: prev[wizardPickerBand] ?? null,
    }));
    setWizardPickerBand(null);
  };

  const saveWizard = async () => {
    const reminderBands = selectedMoments.filter((band) => wizardItems[band]);
    if (wizardReminderPref === "yes") {
      const missingReminderBand = reminderBands.find(
        (band) => !normalizeReminderTime(wizardReminderTimes[band]),
      );
      if (missingReminderBand) {
        setWizardError(
          `Set a reminder time for ${t(`rhythmSetup.moment.${missingReminderBand}.label`).toLowerCase()}.`,
        );
        return;
      }
    }

    setWizardSaving(true);
    setWizardError("");
    try {
      const localItems = BANDS.filter((b) => wizardItems[b]).map((b) => {
        const item = wizardItems[b]!;
        const reminderTime =
          wizardReminderPref === "yes"
            ? normalizeReminderTime(
                wizardReminderTimes[b] ?? item.reminder_time,
              )
            : null;
        return {
          ...item,
          reminder_enabled: wizardReminderPref === "yes",
          reminder_time: reminderTime,
        };
      });
      const items = toRhythmSetupPayloadItems(localItems) as any[];
      await postRhythmSetup({ items, reminder_preference: wizardReminderPref });
      const newHomeData = await mitraJourneyHomeV3();
      dispatch(setHomeData(newHomeData));
      setWizardStep("confirmation");
    } catch {
      setWizardError(t("rhythmSetup.saveError"));
    } finally {
      setWizardSaving(false);
    }
  };

  const beginRhythmItem = (
    band: RhythmTimeBand,
    item: {
      item_id: string;
      item_type: string;
      title_snapshot: string;
      description_snapshot?: string | null;
    },
  ) => {
    void (async () => {
      let enrichedItem: Record<string, unknown> = {
        item_id: item.item_id,
        title_snapshot: item.title_snapshot,
        description_snapshot: item.description_snapshot ?? "",
        item_type: item.item_type,
      };

      try {
        const resolved = await mitraRhythmResolveItem(
          band,
          item.item_id,
          item.item_type,
        );
        if (resolved?.resolved) {
          enrichedItem = {
            ...enrichedItem,
            ...resolved,
            title_snapshot:
              item.title_snapshot ||
              resolved.title ||
              resolved.title_snapshot ||
              "",
            description_snapshot:
              item.description_snapshot ||
              resolved.description_snapshot ||
              resolved.subtitle ||
              "",
          };
        }
      } catch {
        // fall back to snapshot item
      }

      void executeAction(
        {
          type: "start_runner",
          payload: {
            source: "rhythm_daily",
            variant: item.item_type,
            item: enrichedItem,
            rhythm_slot: band,
          },
        } as any,
        buildActionContext() as any,
      );
    })();
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
            source: "user_chosen",
            sort_order: prev[libraryBand].length + 1,
            reminder_enabled: false,
            reminder_time: null,
          },
        ],
      };
    });
    setLibraryBand(null);
  };

  const removeItemAt = (band: RhythmTimeBand, idx: number) => {
    setBandItems((prev) => {
      const arr = [...prev[band]];
      arr.splice(idx, 1);
      return { ...prev, [band]: arr };
    });
  };

  const moveBandItemUp = (band: RhythmTimeBand, idx: number) => {
    setBandItems((prev) => {
      const arr = [...prev[band]];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return { ...prev, [band]: arr };
    });
  };

  const moveBandItemDown = (band: RhythmTimeBand, idx: number) => {
    setBandItems((prev) => {
      const arr = [...prev[band]];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return { ...prev, [band]: arr };
    });
  };

  const moveBandItemToSlot = (
    fromBand: RhythmTimeBand,
    idx: number,
    toSlot: RhythmTimeBand,
  ) => {
    setBandItems((prev) => {
      const fromArr = [...prev[fromBand]];
      const [moved] = fromArr.splice(idx, 1);
      return {
        ...prev,
        [fromBand]: fromArr,
        [toSlot]: [...prev[toSlot], { ...moved }],
      };
    });
  };

  const updateBandItemField = (
    band: RhythmTimeBand,
    idx: number,
    patch: Partial<BandItem>,
  ) => {
    setBandItems((prev) => {
      const arr = [...prev[band]];
      arr[idx] = { ...arr[idx], ...patch };
      return { ...prev, [band]: arr };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setErrorMsg("");
    try {
      const hasExistingRhythm = BANDS.some((b) =>
        originalBandItems[b].some((i) => i.rhythm_item_id != null),
      );

      if (!hasExistingRhythm) {
        // First-time setup: full-replace via postRhythmSetup
        const allItems = BANDS.flatMap((band) =>
          bandItems[band].map((item, idx) => ({
            slot: band,
            item_type: item.item_type as any,
            item_id: item.item_id,
            title_snapshot: item.title,
            description_snapshot: item.description ?? null,
            source: item.source as any,
            sort_order: idx + 1,
            reminder_enabled: item.reminder_enabled,
            reminder_time: item.reminder_time,
          })),
        );
        await postRhythmSetup({
          items: allItems,
          reminder_preference: reminderPref,
        });
      } else {
        // Edit mode: global delta-save
        if (BANDS.some((b) => originalBandItems[b] == null)) {
          console.error(
            "[RhythmSetup] originalBandItems missing — aborting delta",
          );
          return;
        }

        const originalAllItems = BANDS.flatMap((b) => originalBandItems[b]);
        const currentAllItems = BANDS.flatMap((band) =>
          bandItems[band].map((item, idx) => ({
            ...item,
            slot: band, // current band = current slot (source of truth)
            currentSortOrder: idx + 1,
          })),
        );
        const currentExistingIds = new Set(
          currentAllItems
            .filter((i) => i.rhythm_item_id != null)
            .map((i) => i.rhythm_item_id!),
        );

        // Step 1: DELETE — only items absent from ALL current slots
        for (const orig of originalAllItems) {
          if (
            orig.rhythm_item_id &&
            !currentExistingIds.has(orig.rhythm_item_id)
          ) {
            await deleteRhythmItem(orig.rhythm_item_id);
          }
        }

        // Step 2: POST — new items (no rhythm_item_id)
        for (const item of currentAllItems) {
          if (!item.rhythm_item_id) {
            await postRhythmItemAdd({
              slot: item.slot,
              item_type: item.item_type as any,
              item_id: item.item_id,
              title_snapshot: item.title,
              description_snapshot: item.description ?? null,
              source: item.source as any,
              sort_order: item.currentSortOrder,
              reminder_enabled: item.reminder_enabled,
              reminder_time: item.reminder_time,
            });
          }
        }

        // Step 3: PATCH — only changed fields; skip if nothing changed
        for (const item of currentAllItems) {
          if (!item.rhythm_item_id) continue;
          const orig = originalAllItems.find(
            (o) => o.rhythm_item_id === item.rhythm_item_id,
          );
          if (!orig) continue;
          const patch: Record<string, unknown> = {};
          if (orig.reminder_enabled !== item.reminder_enabled)
            patch.reminder_enabled = item.reminder_enabled;
          if (orig.reminder_time !== item.reminder_time)
            patch.reminder_time = item.reminder_time;
          if (orig.sort_order !== item.currentSortOrder)
            patch.sort_order = item.currentSortOrder;
          if ((orig as any).slot !== item.slot) patch.slot = item.slot;
          if (Object.keys(patch).length === 0) continue;
          await patchRhythmItem(item.rhythm_item_id, patch);
        }

        // Step 4: PATCH reminder_preference only if changed
        if (reminderPref !== originalReminderPref) {
          await patchRhythmSettings({ reminder_preference: reminderPref });
        }
      }

      const newHomeData = await mitraJourneyHomeV3({ forceFresh: true });
      dispatch(setHomeData(newHomeData));
      openRhythmHome();
    } catch {
      setErrorMsg(t("rhythmSetup.saveError"));
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
     
        <ScrollView
          contentContainerStyle={wStyles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={wStyles.hero}>

            {/* {renderStepDots("moments")} */}
            <Text style={wStyles.buildheading}>{t("rhythmSetup.moments.heading")}</Text>
            <Text style={wStyles.subheading}>
              {t("rhythmSetup.moments.subheading")}
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
                {t("rhythmSetup.moments.helperTitle")}
              </Text>
              <Text style={wStyles.helperBody}>
                {t("rhythmSetup.moments.helperBody")}
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
                  <Icon width={28} height={28} />
                </View>
                <View style={wStyles.momentCardInner}>
                  <Text style={wStyles.momentLabel}>
                    {t(`rhythmSetup.moment.${band}.label`)}
                  </Text>
                  <View style={wStyles.momentDividerRow}>
                    <View style={wStyles.momentDividerLine} />
                    <Text style={wStyles.momentDividerStar}>✦</Text>
                    <View style={wStyles.momentDividerLine} />
                  </View>
                  <Text style={wStyles.momentDesc}>
                    {t(`rhythmSetup.moment.${band}.desc`)}
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
            <Text style={wStyles.primaryBtnText}>{t("rhythmSetup.continueCta")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setWizardStep(null)}
            activeOpacity={0.7}
            style={[wStyles.secondaryLinkRow, { marginBottom: 32 }]}
          >
            <Text style={wStyles.secondaryLink}>{t("rhythmSetup.setupMyself")}</Text>
          </TouchableOpacity>
        </ScrollView>

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
          <View style={wStyles.hero}>

            <Text style={wStyles.heading}>
              {t("rhythmSetup.purpose.heading")}
            </Text>
            <Text style={[wStyles.subheading, wStyles.purposeIntro]}>
              {t("rhythmSetup.purpose.intro")}
            </Text>
          </View>

          {selectedMoments.map((band) => {
            const BandIcon = BAND_ART[band];
            return (
              <View key={band} style={wStyles.purposeSection}>
                <View style={wStyles.purposeSectionHeader}>
                  <BandIcon width={32} height={32} />
                  <Text style={wStyles.purposeBandLabel}>
                    {t(`rhythmSetup.moment.${band}.label`)}
                  </Text>
                  <View style={wStyles.purposeHeaderLine} />
                </View>
                <View style={wStyles.purposeGrid}>
                  {PURPOSE_OPTIONS[band].map((opt, idx) => {
                    const active = purposes[band] === opt.value;
                    const PurposeIcon = PURPOSE_ART[band][idx] ?? BandIcon;
                    return (
                      <TouchableOpacity
                        key={opt.value}
                        style={[
                          wStyles.purposeChip,
                          active && wStyles.purposeChipActive,
                        ]}
                        onPress={() =>
                          setPurposes((prev) => ({
                            ...prev,
                            [band]: opt.value,
                          }))
                        }
                        activeOpacity={0.82}
                      >
                        <View style={wStyles.purposeChipIconWrap}>
                          <PurposeIcon width={40} height={40} />
                        </View>
                        <View style={wStyles.purposeChipBody}>
                          <Text
                            style={[
                              wStyles.purposeChipLabel,
                              active && wStyles.purposeChipLabelActive,
                            ]}
                          >
                            {t(`rhythmSetup.purpose.${band}.${opt.value}.label`)}
                          </Text>
                          <Text
                            style={[
                              wStyles.purposeChipDesc,
                              active && wStyles.purposeChipDescActive,
                            ]}
                          >
                            {t(`rhythmSetup.purpose.${band}.${opt.value}.desc`)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}

          <TouchableOpacity
            style={[
              wStyles.primaryBtn,
              selectedMoments.some((b) => !purposes[b]) &&
                wStyles.primaryBtnDisabled,
            ]}
            onPress={advanceToSuggestion}
            disabled={selectedMoments.some((b) => !purposes[b])}
            activeOpacity={0.85}
          >
            <Text style={wStyles.primaryBtnText}>
              {t("rhythmSetup.purpose.seeSuggestion")}
            </Text>
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
            <View style={wStyles.hero}>
              <Text style={[wStyles.heading, wStyles.suggestionHeading]}>
                {t("rhythmSetup.suggestion.heading")}
              </Text>
              <Text style={[wStyles.subheading, wStyles.suggestionSubheading]}>
                {t("rhythmSetup.suggestion.subheading")}
              </Text>
            </View>

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
                        {t(`rhythmSetup.moment.${band}.label`).toLowerCase()} practice.
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
                    <View style={wStyles.suggestionMetaRow}>
                      <View style={wStyles.suggestionTypePill}>
                        <Text style={wStyles.suggestionTypePillText}>
                          {itemTypeLabelLocalized(item.item_type)}
                        </Text>
                      </View>
                      <Text style={wStyles.suggestionBandMeta}>
                        {t(`rhythmSetup.moment.${band}.label`)}
                      </Text>
                      <TouchableOpacity
                        style={wStyles.suggestionChangeBtn}
                        onPress={() => setWizardPickerBand(band)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="pencil-outline"
                          size={15}
                          color="#C89211"
                        />
                        <Text style={wStyles.suggestionChangeText}>{t("rhythmSetup.change")}</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={wStyles.suggestionTitle}>
                      {item.title_snapshot}
                    </Text>
                    <View style={wStyles.suggestionDividerRow}>
                      <View style={wStyles.suggestionDividerShort} />
                      <Text style={wStyles.suggestionDividerStar}>✦</Text>
                      <View style={wStyles.suggestionDividerLong} />
                    </View>
                    {!!item.why_this && (
                      <Text style={wStyles.suggestionWhyThis}>
                        {item.why_this}
                      </Text>
                    )}
                    {!!item.description_snapshot && !item.why_this && (
                      <Text style={wStyles.suggestionWhyThis}>
                        {item.description_snapshot}
                      </Text>
                    )}
                  </View>
                );
              })}

            <TouchableOpacity
              style={[
                wStyles.primaryBtn,
                acceptDisabled && wStyles.primaryBtnDisabled,
              ]}
              onPress={() => {
                setWizardReminderTimes((prev) => {
                  const next = { ...prev };
                  selectedMoments.forEach((band) => {
                    if (!next[band]) next[band] = DEFAULT_REMINDER_TIMES[band];
                  });
                  return next;
                });
                setWizardStep("reminders");
              }}
              activeOpacity={0.85}
              disabled={acceptDisabled}
            >
              <Text style={wStyles.primaryBtnText}>{t("rhythmSetup.suggestion.accept")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setWizardStep(null);
              }}
              activeOpacity={0.7}
              style={[wStyles.secondaryLinkRow, { marginBottom: 48 }]}
            >
              <Text style={wStyles.secondaryLink}>{t("rhythmSetup.suggestion.chooseOwn")}</Text>
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
        {renderStepDots("reminders")}
        <Text style={wStyles.buildheading}>
          {t("rhythmSetup.reminders.heading")}
        </Text>
        <Text style={wStyles.subheading}>
          {t("rhythmSetup.reminders.subheading")}
        </Text>

        <View style={wStyles.pillRow}>
          {(
            [
              { label: t("rhythmSetup.reminders.yes"), value: "yes" },
              { label: t("rhythmSetup.reminders.no"), value: "no" },
              { label: t("rhythmSetup.reminders.later"), value: "later" },
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

        {wizardReminderPref === "yes" && (
          <View style={styles.reminderTimeSection}>
            {selectedMoments
              .filter((band) => wizardItems[band])
              .map((band) => (
                <ReminderTimeRow
                  key={band}
                  label={`${t(`rhythmSetup.moment.${band}.label`)} reminder time`}
                  value={
                    wizardReminderTimes[band] ??
                    wizardItems[band]?.reminder_time
                  }
                  onChange={(value) =>
                    setWizardReminderTimes((prev) => ({
                      ...prev,
                      [band]: normalizeReminderTime(value) ?? value,
                    }))
                  }
                />
              ))}
          </View>
        )}

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
            <Text style={wStyles.primaryBtnText}>{t("rhythmSetup.reminders.save")}</Text>
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
          <View style={wStyles.hero}>
            <View style={wStyles.confirmSparkleWrap}>
              <Text style={wStyles.confirmSparkle}>✦</Text>
            </View>
            <Text style={[wStyles.heading, wStyles.confirmHeading]}>
              {t("rhythmSetup.confirmation.heading")}
            </Text>
            <Text style={[wStyles.subheading, wStyles.confirmSubheading]}>
              {t("rhythmSetup.confirmation.subheading")}
            </Text>
          </View>

          <View style={wStyles.confirmList}>
            {getConfirmationItems(
              selectedMoments,
              wizardItems,
              homeData?.companion_rhythm,
            ).map(({ band, item }) => {
              return (
                <View key={band} style={wStyles.confirmCard}>
                  <View style={wStyles.confirmCardHeader}>
                    <Text style={wStyles.confirmBand}>
                      {t(`rhythmSetup.moment.${band}.label`).toUpperCase()}
                    </Text>
                    <View style={wStyles.confirmTypePill}>
                      <Text style={wStyles.confirmTypePillText}>
                        {itemTypeLabelLocalized(item.item_type).toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={wStyles.confirmTitle}>
                    {item.title_snapshot}
                  </Text>
                  <TouchableOpacity
                    style={wStyles.confirmActionBtn}
                    onPress={() =>
                      beginRhythmItem(band, {
                        item_id: item.item_id,
                        item_type: item.item_type,
                        title_snapshot: item.title_snapshot,
                        description_snapshot: item.description_snapshot,
                      })
                    }
                    activeOpacity={0.85}
                  >
                    <Text style={wStyles.confirmActionBtnText}>
                      {beginLabel(item.item_type, t)}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={[wStyles.primaryBtn, wStyles.secondaryBtn]}
            onPress={openRhythmHome}
            activeOpacity={0.85}
          >
            <Text style={[wStyles.primaryBtnText, { color: "#7B6550" }]}>
              {t("rhythmSetup.returnHome")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={openInnerPath}
            activeOpacity={0.7}
            style={wStyles.secondaryLinkRow}
          >
            <Text style={wStyles.secondaryLink}>
              {hasActiveInnerPath ? t("rhythmSetup.confirmation.innerPath") : t("rhythmSetup.confirmation.addInnerPath")}
            </Text>
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>

            <Text style={styles.headerTitle}>
              {editMode ? t("rhythmSetup.editTitle") : t("rhythmSetup.setupTitle")}
            </Text>
          </View>

          {BANDS.map((band, index) => {
            const isExpanded = expandedBand === band;
            const Icon = BAND_ART[band];
            return (
              <View
                key={band}
                style={[styles.bandBlock, { zIndex: BANDS.length - index }]}
              >
                <TouchableOpacity
                  style={[
                    styles.bandHeaderCard,
                    isExpanded && styles.bandHeaderCardExpanded,
                  ]}
                  onPress={() => setExpandedBand(isExpanded ? null : band)}
                  activeOpacity={0.8}
                >
                  <View style={styles.bandIconWrap}>
                    <Icon width={30} height={30} />
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
                    {bandItems[band].map((item, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === bandItems[band].length - 1;
                      return (
                        <View
                          key={item.rhythm_item_id ?? `${item.item_id}-${idx}`}
                          style={styles.addedItem}
                        >
                          {/* Item info */}
                          <View style={styles.addedItemInfo}>
                            <Text style={styles.addedItemType}>
                              {item.item_type}
                            </Text>
                            <Text style={styles.addedItemTitle}>
                              {item.title}
                            </Text>
                          </View>

                          {/* Gentle reminder toggle */}
                          <View style={styles.itemReminderRow}>
                            <TouchableOpacity
                              onPress={() => {
                                const enabled = !item.reminder_enabled;
                                updateBandItemField(band, idx, {
                                  reminder_enabled: enabled,
                                  ...(enabled && item.reminder_time == null
                                    ? {
                                        reminder_time:
                                          DEFAULT_REMINDER_TIMES[band],
                                      }
                                    : {}),
                                });
                              }}
                              activeOpacity={0.7}
                              style={styles.reminderToggleBtn}
                            >
                              <Text style={styles.reminderToggleText}>
                                {item.reminder_enabled
                                  ? t("rhythmSetup.reminderOn")
                                  : t("rhythmSetup.remindMe")}
                              </Text>
                            </TouchableOpacity>
                            {item.reminder_enabled && (
                              <ReminderTimeRow
                                label=""
                                value={item.reminder_time}
                                onChange={(v) =>
                                  updateBandItemField(band, idx, {
                                    reminder_time: v
                                      ? normalizeReminderTime(v)
                                      : null,
                                  })
                                }
                              />
                            )}
                          </View>
                          <View style={wStyles.mantraDividerline} />

                          {/* Reorder */}
                          {/* <View style={styles.reorderRow}>
                            <TouchableOpacity
                              disabled={isFirst}
                              onPress={() => moveBandItemUp(band, idx)}
                              style={[
                                styles.reorderBtn,
                                isFirst && styles.reorderBtnDisabled,
                              ]}
                            >
                              <Text style={styles.reorderBtnText}>↑</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              disabled={isLast}
                              onPress={() => moveBandItemDown(band, idx)}
                              style={[
                                styles.reorderBtn,
                                isLast && styles.reorderBtnDisabled,
                              ]}
                            >
                              <Text style={styles.reorderBtnText}>↓</Text>
                            </TouchableOpacity>
                          </View> */}

                          {/* Move to slot */}
                          <View
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              gap: 12,
                              marginTop: 10,
                              justifyContent: "flex-end",
                            }}
                          >
                            <View style={styles.moveSlotRow}>
                              {(
                                [
                                  "morning",
                                  "afternoon",
                                  "night",
                                ] as RhythmTimeBand[]
                              )
                                .filter((s) => s !== band)
                                .map((s) => (
                                  <TouchableOpacity
                                    key={s}
                                    onPress={() =>
                                      moveBandItemToSlot(band, idx, s)
                                    }
                                    style={styles.moveSlotPill}
                                    activeOpacity={0.7}
                                  >
                                    <Text style={styles.moveSlotPillText}>
                                      {t("rhythmSetup.moveTo", { band: s })}
                                    </Text>
                                  </TouchableOpacity>
                                ))}
                            </View>

                            {/* Remove */}
                            <TouchableOpacity
                              onPress={() => removeItemAt(band, idx)}
                              activeOpacity={0.7}
                              style={styles.removeBtn}
                            >
                              <Text style={styles.removeBtnText}>{t("rhythmSetup.remove")}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}

                    <TouchableOpacity
                      style={styles.addFromLibraryBtn}
                      onPress={() => setLibraryBand(band)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.addFromLibraryPlus}>＋</Text>
                      <Text style={styles.addFromLibraryText}>
                        {t("rhythmSetup.addFromLibrary")}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          })}

          {/* <View style={styles.reminderSection}>
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
          </View> */}

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
                <Text style={styles.saveBtnText}>{t("rhythmSetup.saveRhythm")}</Text>
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
    </SafeAreaView>
  );
}

// ─── Wizard styles ─────────────────────────────────────────────────────────────

const wStyles = StyleSheet.create({
  safe: { flex: 1 },
  background: { flex: 1 },
  backgroundImage: { opacity: 0.98 },
  scroll: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 48 },
  hero: { position: "relative", paddingTop: 6 },
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
    fontSize: 22,
    color: "#432104",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "left",
  },
  buildheading: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: "#432104",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subheading: {
    fontSize: 14,
    color: "#7B6550",
    fontFamily: Fonts.sans.regular,
    marginBottom: 18,
    lineHeight: 24,
    textAlign: "center",
  },
  purposeIntro: {
    textAlign: "left",
    marginBottom: 28,
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
    backgroundColor: Platform.OS === "android" ? "#F8F3E8" : "rgba(245,245,240,0.45)",
    marginBottom: 16,
    ...platformShadow("#432104", 10, 0.08, 18, 1),
  },
  momentCardSelected: {
    borderColor: "#C99317",
    backgroundColor: "rgba(255,251,244,0.98)",
  },
  momentArtWrap: {
    width: 48,
    height: 48,
    borderRadius: 22,
    flexShrink: 0,
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
  mantraDividerline: {
    width: "100%",
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
  purposeSection: { marginBottom: 28 },
  purposeSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  purposeBandLabel: {
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    color: "#432104",
    fontWeight: "700",
  },
  purposeHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(201,168,76,0.22)",
  },
  purposeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
  },
  purposeChip: {
    width: "48.5%",

    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "rgba(201,168,76,0.22)",
    backgroundColor: Platform.OS === "android" ? "#F8F3E8" : "rgba(245,245,240,0.45)",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    ...platformShadow("#432104", 6, 0.05, 14, 1),
  },
  purposeChipActive: {
    borderColor: "#C99317",
    backgroundColor: "rgba(255,251,244,0.98)",
    ...platformShadow("#DEB861", 12, 0.14, 24, 2),
  },
  purposeChipIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  purposeChipBody: {
    flex: 1,
  },
  purposeChipLabel: {
    fontFamily: Fonts.serif.bold,
    fontSize: 13,
    color: "#432104",
    fontWeight: "600",
    marginBottom: 4,
    lineHeight: 16,
  },
  purposeChipLabelActive: { color: "#8B5E00" },
  purposeChipDesc: {
    fontSize: 12,
    color: "#A08060",
    fontFamily: Fonts.sans.semiBold,
    lineHeight: 18,
  },
  purposeChipDescActive: { color: "#7B5500" },
  suggestionHeading: {
    textAlign: "left",
    marginBottom: 12,
  },
  suggestionSubheading: {
    textAlign: "left",
    marginBottom: 28,
  },
  suggestionCard: {
    borderWidth: 1.5,
    borderColor: "rgba(201,168,76,0.22)",
    borderRadius: 26,
    backgroundColor: "rgba(255,251,244,0.95)",
    padding: 15,
    marginBottom: 18,
    ...platformShadow("#432104", 10, 0.06, 18, 1),
  },
  suggestionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  suggestionTypePill: {
    backgroundColor: "#FCF8EC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  suggestionTypePillText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    color: "#8B6914",
    textTransform: "uppercase",
    fontFamily: Fonts.sans.bold,
  },
  suggestionBandMeta: {
    fontSize: 13,
    color: "#A08060",
    fontFamily: Fonts.sans.regular,
    flexShrink: 1,
  },
  suggestionChangeBtn: {
    marginLeft: "auto",
    minWidth: 106,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.4)",
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "transparent",
  },
  suggestionChangeIcon: {
    fontSize: 14,
    color: "#C99317",
  },
  suggestionChangeText: {
    fontSize: 13,
    color: "#C99317",
    fontFamily: Fonts.sans.medium,
  },
  suggestionTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#432104",
    fontWeight: "700",
    marginBottom: 14,
    lineHeight: 26,
  },
  suggestionDividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  suggestionDividerShort: {
    width: 86,
    height: 1,
    backgroundColor: "rgba(228,180,79,0.4)",
  },
  suggestionDividerLong: {
    width: 118,
    height: 1,
    backgroundColor: "rgba(228,180,79,0.4)",
  },
  suggestionDividerStar: {
    fontSize: 13,
    lineHeight: 13,
    color: "#E4B44F",
  },
  suggestionWhyThis: {
    fontSize: 14,
    color: "#8B6914",
    fontFamily: Fonts.sans.regular,
    fontStyle: "italic",
    lineHeight: 22,
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
    fontSize: 11,
    color: "#7B6550",
    fontFamily: Fonts.sans.medium,
    textAlign: "center",
    alignSelf: "center",
  },
  pillTextActive: { color: "#fff" },
  confirmSparkleWrap: {
    alignItems: "center",
    marginTop: 28,
    marginBottom: 22,
  },
  confirmSparkle: {
    fontSize: 44,
    lineHeight: 44,
    color: "#D8A00E",
  },
  confirmHeading: {
    textAlign: "center",
    marginBottom: 12,
  },
  confirmSubheading: {
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 24,
  },
  confirmList: { marginBottom: 26, gap: 14 },
  confirmCard: {
    borderWidth: 1.5,
    borderColor: "rgba(201,168,76,0.22)",
    borderRadius: 24,
    backgroundColor: "rgba(255,251,244,0.95)",
    paddingHorizontal: 16,
    paddingVertical: 18,
    ...platformShadow("#432104", 6, 0.05, 14, 1),
  },
  confirmCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  confirmBand: {
    fontFamily: Fonts.sans.bold,
    fontSize: 12,
    color: "#D8A00E",
    letterSpacing: 0.4,
  },
  confirmTitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#432104",
    lineHeight: 28,
    marginBottom: 18,
  },
  confirmTypePill: {
    backgroundColor: "#F5EFD8",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 104,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmTypePillText: {
    fontSize: 11,
    color: "#8B6914",
    letterSpacing: 2,
    fontFamily: Fonts.sans.bold,
  },
  confirmActionBtn: {
    backgroundColor: "#C99317",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  confirmActionBtnText: {
    fontSize: 15,
    fontFamily: Fonts.sans.semiBold,
    color: "#fff",
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
  safeArea: { flex: 1, backgroundColor: "transparent" },
  embeddedTransparent: { backgroundColor: "transparent" },
  background: { flex: 1 },
  backgroundImage: { opacity: 0.98 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
  hero: { position: "relative", paddingTop: 6, marginBottom: 18 },
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
  headerTitle: {
    fontSize: 28,
    fontFamily: Fonts.serif.bold,
    color: "#432104",
    fontWeight: "700",
    marginBottom: 8,
  },
  bandBlock: { marginBottom: 20, backgroundColor: "transparent" },
  bandHeaderCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 86,
    borderWidth: 1,
    borderColor: "rgba(226, 201, 151, 0.72)",
    borderRadius: 15,
    backgroundColor:
      Platform.OS === "android" ? "#FFFCF7" : "rgba(255, 250, 242, 0.96)",
    ...(Platform.OS === "android"
      ? { elevation: 0 }
      : platformShadow("#C9A84C", 6, 0.05, 12, 1)),
  },
  bandHeaderCardExpanded: {
    backgroundColor:
      Platform.OS === "android" ? "#FBF6EB" : "rgba(248, 242, 230, 0.96)",
  },
  bandIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Platform.OS === "android" ? "#FBF3DE" : "rgba(248, 236, 210, 0.68)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
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
  chevron: {
    width: 24,
    textAlign: "center",
    fontSize: 26,
    lineHeight: 26,
    color: "#C99317",
    flexShrink: 0,
  },
  bandBody: { paddingTop: 16, gap: 12 },
  addedItem: {
    flexDirection: "column",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(226, 201, 151, 0.9)",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 10,
  },
  addedItemInfo: { marginBottom: 8 },
  addedItemType: {
    fontSize: 12,
    fontFamily: Fonts.sans.bold,
    color: "#9A7436",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  addedItemTitle: {
    fontSize: 13,
    fontFamily: Fonts.sans.medium,
    color: "#432104",
    lineHeight: 24,
    fontWeight: "700",
  },
  itemReminderRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
    marginTop: 10,
  },
  reminderToggleBtn: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.4)",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  reminderToggleText: {
    fontSize: 13,
    color: "#7B6550",
    fontFamily: Fonts.sans.regular,
  },
  reorderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  reorderBtn: {
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  reorderBtnDisabled: {
    opacity: 0.35,
  },
  reorderBtnText: {
    fontSize: 14,
    color: "#7B6550",
    fontFamily: Fonts.sans.regular,
  },
  moveSlotRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  moveSlotPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d4a01b",
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  moveSlotPillText: {
    fontSize: 10,
    color: "#432104",
    fontFamily: Fonts.sans.regular,
  },
  removeBtn: { paddingVertical: 4 },
  removeBtnText: {
    fontSize: 13,
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
    fontFamily: Fonts.serif.bold,
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
  reminderTimeSection: {
    gap: 12,
    marginBottom: 18,
  },
  reminderTimeCard: {
    // paddingHorizontal: 16,
    // paddingVertical: 10,
    // gap: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reminderTimeCardLabel: {
    fontSize: 15,
    color: "#5E4328",
    fontFamily: Fonts.serif.regular,
    textAlignVertical: "center",
  },
  reminderTimeBtn: {
    alignItems: "flex-end",
  },
  compactReminderField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 100,
    // minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(216, 188, 119, 0.95)",
    backgroundColor: "#FFFDF9",
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  compactReminderFieldText: {
    fontSize: 12,
    color: "#6A4E36",
    fontFamily: Fonts.sans.medium,
    letterSpacing: 0.4,
  },
  iosPickerOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(33, 22, 15, 0.18)",
  },
  iosPickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  iosPickerSheet: {
    backgroundColor: "#FFFDF9",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 10,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: "rgba(216, 188, 119, 0.35)",
  },
  iosPickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingBottom: 8,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderColor: "rgba(216, 188, 119, 0.2)",
  },
  iosPickerHeaderAction: {
    fontSize: 16,
    color: "#C99317",
    fontFamily: Fonts.sans.semiBold,
  },
  iosPickerBody: {
    minHeight: 216,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFDF9",
  },
  iosDateTimePicker: {
    width: "100%",
    height: 216,
    backgroundColor: "#FFFDF9",
  },
});
