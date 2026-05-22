import {
  DOOR_LABELS,
  QUICK_CHANT_HAS_MANTRA_SUBTITLE,
  QUICK_CHANT_HISTORY_ONLY_SUBTITLE,
  QUICK_CHANT_NO_STATE_SUBTITLE,
  SEGMENT_GREETING_SUBTEXT,
  SEGMENT_INNER_PATH_NO_STATE_SUBTITLE,
  SEGMENT_RHYTHM_NO_STATE_SUBTITLE,
  TELL_MITRA_ACTIVE_PATH_SUBTITLE,
  TELL_MITRA_DEFAULT_SUBTITLE,
  TELL_MITRA_HAS_HISTORY_SUBTITLE,
  type MitraHomeSegment,
} from "@kalpx/contracts";
import type { JourneyTriadRemindersPatch, QuickCheckinPranaLabel } from "@kalpx/types";
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
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
const M3Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../assets/mitra1.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const Mp2Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../assets/mitra2.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const Mp3Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../assets/mitra3.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const Mp4Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../assets/mitra4.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  apiPatchJourneyReminders,
  mitraJourneyHomeV3,
  mitraPranaAcknowledge,
  postPranaAcknowledgeDismiss,
} from "../engine/mitraApi";
import { useScreenStore } from "../engine/useScreenBridge";
import { setHomeData } from "../store/doorSlice";
import { Fonts } from "../theme/fonts";
import { TimePickerModal } from "../components/TimePickerModal";

type FeelingOption = "Agitated" | "Drained" | "Steady" | "Open";

const FEELING_OPTIONS: FeelingOption[] = [
  "Agitated",
  "Drained",
  "Steady",
  "Open",
];

const HERO_DAY = require("../../assets/imgsun.png");
const HERO_NIGHT = require("../../assets/night-home.webp");
const SHELL_HEADER_HEIGHT =
  Platform.OS === "android" ? 45 + (StatusBar.currentHeight || 0) : 45;

function getRhythmTimeBand(): "morning" | "afternoon" | "night" {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 20) return "afternoon";
  return "night";
}

function getGreetingVisualState(headline?: string | null) {
  const greetingHeadline = headline || "";
  const isNightGreeting = /good\s*night|night/i.test(greetingHeadline);
  return {
    isNightGreeting,
    image: isNightGreeting ? HERO_NIGHT : HERO_DAY,
    textColor: isNightGreeting ? "#FFFFFF" : "#432104",
  };
}

function getFallbackGreetingHeadline(userName?: string) {
  const hour = new Date().getHours();
  const dayPart = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const name = userName?.trim() || "friend";
  return `Good ${dayPart}, ${name}`;
}

function mapFeelingToPranaType(feeling: FeelingOption) {
  if (feeling === "Open") return "energized";
  if (feeling === "Steady") return "balanced";
  return feeling.toLowerCase();
}

function DoorCard({
  Icon,
  label,
  subtitle,
  orientationLine,
  highlighted,
  onPress,
}: {
  Icon: any;
  label: string;
  subtitle?: string | null;
  orientationLine?: string | null;
  highlighted?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[
        styles.doorCard,
        highlighted && styles.doorCardHighlighted,
      ]}
    >
      <View style={styles.doorIconWrap}>
        <Icon width={40} height={40} />
      </View>
      <View style={styles.doorBody}>
        <Text style={styles.doorLabel}>{label}</Text>
        {!!subtitle && <Text style={styles.doorSubtitle}>{subtitle}</Text>}
        {!!orientationLine && (
          <Text style={styles.doorOrientationLine}>{orientationLine}</Text>
        )}
      </View>
      <Text style={styles.doorArrow}>→</Text>
    </TouchableOpacity>
  );
}

export default function FourDoorHomeContainer({
  userName = "friend",
  forceInnerPathReentry = false,
}: {
  userName?: string;
  forceInnerPathReentry?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const loadScreen = useScreenStore((state) => state.loadScreen);
  const updateScreenData = useScreenStore((state) => state.updateScreenData);
  const updateBackground = useScreenStore((state) => state.updateBackground);
  const updateHeaderHidden = useScreenStore(
    (state) => state.updateHeaderHidden,
  );
  const screenData = useScreenStore((state) => state.screenData);
  const homeData = useSelector((state: any) => state.door?.homeData);
  const hasSkippedInitialFocusRefresh = useRef(false);
  const homeDataRef = useRef(homeData);

  const [loading, setLoading] = useState(!homeData);
  const [error, setError] = useState<string | null>(null);
  const [selectedFeeling, setSelectedFeeling] = useState<FeelingOption | null>(
    null,
  );
  const [feelingLoading, setFeelingLoading] = useState(false);
  const doorStates = (homeData?.door_states ?? {}) as Record<string, any>;

  // T4 — first-visit orientation gate
  const FOUR_DOOR_VISITED_KEY = "mitra_four_door_home_visited_v1";
  const [isFirstVisit, setIsFirstVisit] = useState<boolean>(false);
  useEffect(() => {
    void AsyncStorage.getItem(FOUR_DOOR_VISITED_KEY).then((val) => {
      if (!val) setIsFirstVisit(true);
    });
  }, []);

  // Post-onboarding reminder step (embedded via screenData flag)
  const showReminderModal = !!screenData?.onboarding_reminder_show;
  const reminderDestination = (screenData?.onboarding_reminder_destination as string) || "Home";
  const [reminderToggles, setReminderToggles] = useState<Record<"mantra" | "sankalp" | "practice", boolean>>({ mantra: false, sankalp: false, practice: false });
  const [reminderTimes, setReminderTimes] = useState<Record<"mantra" | "sankalp" | "practice", string>>({ mantra: "07:00", sankalp: "08:00", practice: "18:00" });
  const [reminderPickerKey, setReminderPickerKey] = useState<"mantra" | "sankalp" | "practice" | null>(null);
  const [reminderSaving, setReminderSaving] = useState(false);
  const [pendingPranaMessage, setPendingPranaMessage] = useState<string | null>(null);

  useEffect(() => {
    homeDataRef.current = homeData;
  }, [homeData]);

  // T4 — write visited key after first successful four-door render for new-segment users
  useEffect(() => {
    if (
      isFirstVisit &&
      homeData?.user_surface_state?.segment === "new" &&
      !error
    ) {
      void AsyncStorage.setItem(FOUR_DOOR_VISITED_KEY, "1");
    }
  }, [isFirstVisit, homeData?.user_surface_state?.segment, error]);

  const loadHome = useCallback(
    async (silent = false, forceFresh = false) => {
      if (!silent) setLoading(true);
      if (!silent) setError(null);
      try {
        const data = await mitraJourneyHomeV3({ forceFresh });
        dispatch(setHomeData(data));
      } catch {
        if (!silent || !homeDataRef.current) {
          setError("Unable to load. Please try again.");
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [dispatch],
  );

  useEffect(() => {
    setLoading(true);
    void loadHome();
  }, [loadHome]);

  useFocusEffect(
    useCallback(() => {
      if (!hasSkippedInitialFocusRefresh.current) {
        hasSkippedInitialFocusRefresh.current = true;
        return;
      }
      if (homeDataRef.current) {
        void loadHome(true);
      }
    }, [loadHome]),
  );

  useFocusEffect(
    useCallback(() => {
      updateBackground(require("../../assets/beige_bg.png"));
      updateHeaderHidden(false);
      return () => updateHeaderHidden(false);
    }, [updateBackground, updateHeaderHidden]),
  );

  const handleFeelingSelect = useCallback(
    async (feeling: FeelingOption) => {
      const pranaType = mapFeelingToPranaType(feeling);
      setSelectedFeeling(feeling);
      setFeelingLoading(true);
      try {
        const ackResult = await mitraPranaAcknowledge({
          pranaType,
          focus:
            (screenData?.scan_focus as string) ||
            (screenData?.active_focus as string) ||
            "peacecalm",
          subFocus: (screenData?.prana_baseline_selection as string) || "",
          depth:
            (screenData?.routine_depth as string) ||
            (screenData?.routine_setup as string) ||
            "standard",
          dayNumber: screenData?.day_number || 1,
          journeyId: screenData?.journey_id || null,
          round: 2,
          locale: (screenData?.locale as string) || "en",
          tz:
            Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
        });
        if (pranaType === "agitated" || pranaType === "drained") {
          const msg = pranaType === "agitated" ? "I am agitated" : "I am drained";
          setPendingPranaMessage(msg);
          await loadHome(true, true);
        } else {
          await loadHome(true, true);
        }
      } finally {
        setFeelingLoading(false);
      }
    },
    [loadHome, navigation, screenData, setPendingPranaMessage],
  );

  const handleDismissCheckin = useCallback(async () => {
    setPendingPranaMessage(null);
    await postPranaAcknowledgeDismiss();
    await loadHome(true, true);
  }, [loadHome]);

  const openQuickResetSurface = useCallback(() => {
    navigation.navigate("QuickReset" as any);
  }, [navigation]);

  const openTellMitraSurface = useCallback(() => {
    navigation.navigate("TellMitra" as any);
  }, [navigation]);

  const openMyRhythmSurface = useCallback(() => {
    const hasRhythm = homeData?.companion_rhythm?.has_rhythm === true;
    const target = hasRhythm ? "RhythmHome" : "RhythmSetup";
    navigation.navigate(target as any);
  }, [homeData?.companion_rhythm?.has_rhythm, navigation]);

  const rhythmBand = getRhythmTimeBand();
  const seg = (homeData?.user_surface_state?.segment ??
    "new") as MitraHomeSegment;
  const greetingHeadline =
    homeData?.greeting?.headline?.trim() ||
    getFallbackGreetingHeadline(userName);
  const greetingSubtext =
    homeData?.greeting?.subtext?.trim() || SEGMENT_GREETING_SUBTEXT[seg] || "";
  const greetingVisual = getGreetingVisualState(greetingHeadline);
  const hasGreetingCopy = !!(greetingHeadline || greetingSubtext);

  const rhythmSubtitle = useMemo(() => {
    const cr = homeData?.companion_rhythm;
    const segVal = (homeData?.user_surface_state?.segment ??
      "new") as MitraHomeSegment;
    if (!cr?.has_rhythm) {
      return (
        SEGMENT_RHYTHM_NO_STATE_SUBTITLE[segVal] ||
        "Build a gentle daily rhythm"
      );
    }
    const hasMorning = (cr.morning?.items?.length ?? 0) > 0;
    const hasAfternoon = (cr.afternoon?.items?.length ?? 0) > 0;
    const hasNight = (cr.night?.items?.length ?? 0) > 0;
    const morningDone = cr.morning_done ?? false;
    const afternoonDone = cr.afternoon_done ?? false;
    const nightDone = cr.night_done ?? false;
    const allDone =
      (!hasMorning || morningDone) &&
      (!hasAfternoon || afternoonDone) &&
      (!hasNight || nightDone);
    if (allDone && (hasMorning || hasAfternoon || hasNight)) {
      return "Your rhythm has been held today";
    }
    if (hasMorning && !morningDone) return "Begin with your morning rhythm";
    if (hasAfternoon && !afternoonDone) {
      return hasMorning && morningDone
        ? "Morning held · return at midday"
        : "Return with your afternoon rhythm";
    }
    if (hasNight && !nightDone) {
      return hasAfternoon
        ? "Afternoon held · close gently tonight"
        : "Close the day with your night rhythm";
    }
    return (
      homeData?.my_rhythm_summary?.next_practice_label ??
      doorStates?.my_rhythm?.subtitle ??
      ""
    );
  }, [doorStates, homeData]);

  const innerPathSubtitle = useMemo(() => {
    const ips = homeData?.inner_path_summary;
    const segVal = (homeData?.user_surface_state?.segment ??
      "new") as MitraHomeSegment;
    if (!ips?.has_active_path) {
      return (
        ips?.path_title ??
        doorStates?.inner_path?.subtitle ??
        SEGMENT_INNER_PATH_NO_STATE_SUBTITLE[segVal]
      );
    }
    const dayLine = `Day ${ips.day_number} of ${ips.total_days}`;
    const heldCount = ips.today_held_count ?? 0;
    if (ips.today_practice_held || heldCount >= 3) return `${dayLine} · today's practice is held`;
    if (heldCount > 0) return `${dayLine} · today's step has begun`;
    return dayLine;
  }, [doorStates, homeData]);
  const hasMantra =
    homeData?.user_surface_state?.has_quick_chant_mantra === true;
  const hasQuickChantHistory =
    homeData?.user_surface_state?.has_quick_chant_history === true;
  const hasTMHistory =
    homeData?.user_surface_state?.has_tell_mitra_history === true;
  const hasIP = homeData?.user_surface_state?.has_inner_path === true;

  // Quick Chant subtitle — 3-way conditional (CRITICAL: only show "chosen mantra" if has_quick_chant_mantra)
  const quickResetSubtitle = hasMantra
    ? QUICK_CHANT_HAS_MANTRA_SUBTITLE
    : hasQuickChantHistory
      ? QUICK_CHANT_HISTORY_ONLY_SUBTITLE
      : QUICK_CHANT_NO_STATE_SUBTITLE;

  // Tell Mitra subtitle — conditional on state
  const tellMitraSubtitle = hasTMHistory
    ? TELL_MITRA_HAS_HISTORY_SUBTITLE
    : hasIP || seg === "rhythm_and_path"
      ? TELL_MITRA_ACTIVE_PATH_SUBTITLE
      : TELL_MITRA_DEFAULT_SUBTITLE;

  if (loading && !homeData) {
    return (
      <View style={styles.centeredWrap}>
        <ActivityIndicator size="small" color="#b8922a" />
      </View>
    );
  }

  function parseReminderTimeToDate(timeStr: string): Date {
    const [h, m] = timeStr.split(":").map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  }

  function dateToReminderTimeStr(date: Date): string {
    return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  }

  function formatReminderTimeDisplay(timeStr: string): string {
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const hour = h % 12 === 0 ? 12 : h % 12;
    return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
  }

  function dismissReminderModal() {
    updateScreenData("onboarding_reminder_show", false);
    updateScreenData("onboarding_reminder_destination", null);
    if (reminderDestination === "InnerPath") {
      navigation.navigate("InnerPath" as any);
    }
  }

  async function handleSaveReminders() {
    setReminderSaving(true);
    try {
      const patch: JourneyTriadRemindersPatch = {};
      for (const key of ["mantra", "sankalp", "practice"] as const) {
        (patch as any)[`${key}_reminder_enabled`] = reminderToggles[key];
        if (reminderToggles[key]) (patch as any)[`${key}_reminder_time`] = reminderTimes[key];
      }
      await apiPatchJourneyReminders(patch);
    } catch {
      // non-fatal
    } finally {
      setReminderSaving(false);
      dismissReminderModal();
    }
  }

  if (!homeData) {
    return (
      <View style={styles.centeredWrap}>
        <Text style={styles.errorText}>{error || "Unable to load."}</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => void loadHome()}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const acw = homeData.active_checkin_window;
  const windowActive = acw?.active === true;
  const currentRouteName = navigation
    .getState?.()
    ?.routes?.slice(-1)?.[0]?.name;
  const openInnerPathSurface = () => {
    const hasExistingInnerPath =
      forceInnerPathReentry ||
      homeData?.inner_path_summary?.has_active_path === true ||
      homeData?.user_surface_state?.has_inner_path === true;

    if (!hasExistingInnerPath) {
      updateScreenData("onboarding_turn", "turn_2");
      updateScreenData("onboarding_draft_state", {
        started_at: Date.now(),
        entry_intention: "inner_path",
      });
      loadScreen({
        container_id: "welcome_onboarding",
        state_id: "turn_2",
        replace: true,
      });
      if (currentRouteName !== "DynamicEngine") {
        navigation.navigate("DynamicEngine" as any);
      }
      return;
    }

    navigation.navigate("InnerPath" as any);
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.root}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.heroWrap,
            {
              marginTop: -SHELL_HEADER_HEIGHT,
            },
          ]}
        >
          <ImageBackground
            source={greetingVisual.image}
            resizeMode="cover"
            style={styles.heroImage}
          >
            <View
              style={[
                styles.heroInner,
                {
                  paddingTop: Math.max(
                    insets.top + SHELL_HEADER_HEIGHT + 18,
                    92,
                  ),
                },
              ]}
            >
              <View style={styles.heroCopy}>
                {hasGreetingCopy && (
                  <>
                    <Text
                      style={[
                        styles.heroHeadline,
                        { color: greetingVisual.textColor },
                      ]}
                      numberOfLines={2}
                    >
                      {greetingHeadline}
                    </Text>
                    {!!greetingSubtext && (
                      <Text
                        style={[
                          styles.heroSubtext,
                          { color: greetingVisual.textColor },
                        ]}
                      >
                        {greetingSubtext}
                      </Text>
                    )}
                    <View style={styles.heroDivider}>
                      <View style={styles.heroDividerLine} />
                      <Text style={styles.heroDividerIcon}>◈</Text>
                      <View style={styles.heroDividerLine} />
                    </View>
                  </>
                )}
              </View>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.content}>
          {!!error && <Text style={styles.inlineError}>{error}</Text>}

          <DoorCard
            Icon={M3Icon}
            label={DOOR_LABELS.my_rhythm}
            subtitle={rhythmSubtitle}
            orientationLine={seg === "new" && isFirstVisit ? "Shape the day with a simple rhythm." : null}
            onPress={() => void openMyRhythmSurface()}
          />
          <DoorCard
            Icon={Mp3Icon}
            label={DOOR_LABELS.inner_path}
            subtitle={innerPathSubtitle}
            orientationLine={seg === "new" && isFirstVisit ? "Walk a 14-day path with Mitra beside you." : null}
            highlighted={seg === "rhythm_only"}
            onPress={openInnerPathSurface}
          />
          <DoorCard
            Icon={Mp2Icon}
            label={DOOR_LABELS.quick_reset}
            subtitle={quickResetSubtitle}
            orientationLine={seg === "new" && isFirstVisit ? "Return through mantra, in a single moment." : null}
            onPress={() => void openQuickResetSurface()}
          />
          <DoorCard
            Icon={Mp4Icon}
            label={DOOR_LABELS.tell_mitra}
            subtitle={tellMitraSubtitle}
            orientationLine={seg === "new" && isFirstVisit ? "Share what is moving. Mitra will listen." : null}
            onPress={() => void openTellMitraSurface()}
          />

          <View style={styles.checkinCard}>
            {windowActive ? (
              <>
                <View style={styles.checkinHeaderRow}>
                  <Text style={styles.checkinTitle}>
                    {(acw?.prana_label as QuickCheckinPranaLabel) ||
                      "How are you landing?"}
                  </Text>
                  {acw?.dismissible && (
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => void handleDismissCheckin()}
                      style={styles.dismissButton}
                    >
                      <Text style={styles.dismissButtonText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {!!acw?.acknowledgment && (
                  <Text style={styles.checkinAcknowledgment}>
                    {acw.acknowledgment}
                  </Text>
                )}

                {pendingPranaMessage && (
                  <TouchableOpacity
                    style={styles.suggestionButton}
                    activeOpacity={0.82}
                    onPress={() => {
                      navigation.navigate("TellMitra" as any, { initialMessage: pendingPranaMessage });
                      setPendingPranaMessage(null);
                    }}
                  >
                    <Text style={styles.suggestionButtonText}>Tell Mitra →</Text>
                  </TouchableOpacity>
                )}

                {!!acw?.suggestion && (
                  <>
                    {!!acw.suggestion.card_header && (
                      <Text style={styles.suggestionHeader}>
                        {acw.suggestion.card_header}
                      </Text>
                    )}
                    <TouchableOpacity
                      activeOpacity={0.82}
                      onPress={() => void openQuickResetSurface()}
                      style={styles.suggestionButton}
                    >
                      <Text style={styles.suggestionButtonText}>
                        {acw.suggestion.label} →
                      </Text>
                    </TouchableOpacity>
                  </>
                )}

                {acw?.companion_boundary && (
                  <Text style={styles.boundaryText}>
                    If this feels heavy to carry,{" "}
                    <Text
                      style={styles.boundaryLink}
                      onPress={() => void openTellMitraSurface()}
                    >
                      Tell Mitra
                    </Text>{" "}
                    is here.
                  </Text>
                )}
                {!acw?.suggestion && !!acw?.prana_label && (
                  <View style={{ flexDirection: "row", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                    <TouchableOpacity onPress={openInnerPathSurface}>
                      <Text style={styles.softCtaLink}>Continue Inner Path</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => void openMyRhythmSurface()}>
                      <Text style={styles.softCtaLink}>My Rhythm</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <>
                <Text style={styles.checkinTitle}>How are you landing?</Text>
                <Text style={styles.checkinSubtitle}>
                  One tap. Mitra meets you where you are.
                </Text>
                <View style={styles.feelingGrid}>
                  {FEELING_OPTIONS.map((feeling) => {
                    const isSelected = selectedFeeling === feeling;
                    const isSubmittingSelection = feelingLoading && isSelected;
                    return (
                      <TouchableOpacity
                        key={feeling}
                        activeOpacity={0.82}
                        disabled={feelingLoading}
                        onPress={() => void handleFeelingSelect(feeling)}
                        style={[
                          styles.feelingChip,
                          isSelected && styles.feelingChipSelected,
                          feelingLoading && styles.feelingChipDisabled,
                        ]}
                      >
                        <View style={styles.feelingChipContent}>
                          <Text
                            style={[
                              styles.feelingChipText,
                              isSelected && styles.feelingChipTextSelected,
                            ]}
                          >
                            {feeling}
                          </Text>
                          {isSubmittingSelection ? (
                            <ActivityIndicator
                              size="small"
                              color="#8A651B"
                              style={styles.feelingChipLoader}
                            />
                          ) : null}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Post-onboarding reminder step — embedded via screenData flag */}
      <Modal
        visible={showReminderModal}
        animationType="slide"
        transparent
        onRequestClose={() => dismissReminderModal()}
      >
        <View style={styles.reminderOverlay}>
          <View style={styles.reminderSheet}>
            <Text style={styles.reminderTitle}>Want gentle reminders?</Text>
            <Text style={styles.reminderSubtitle}>
              Mitra will gently remind you at the times you choose.
            </Text>

            {(["mantra", "sankalp", "practice"] as const).map((key) => {
              const label = key.charAt(0).toUpperCase() + key.slice(1);
              const enabled = reminderToggles[key];
              return (
                <View key={key} style={[styles.reminderRow, enabled && styles.reminderRowEnabled]}>
                  <Text style={styles.reminderRowLabel}>Remind me for {label.toLowerCase()}</Text>
                  <View style={styles.reminderRowRight}>
                    {enabled && (
                      <TouchableOpacity
                        onPress={() => setReminderPickerKey(key)}
                        style={styles.reminderTimePill}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.reminderTimePillText}>
                          {formatReminderTimeDisplay(reminderTimes[key])}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <Switch
                      value={enabled}
                      onValueChange={(val) => setReminderToggles((prev) => ({ ...prev, [key]: val }))}
                      trackColor={{ false: "rgba(0,0,0,0.12)", true: "#C99317" }}
                      thumbColor="#fff"
                    />
                  </View>
                </View>
              );
            })}

            <TimePickerModal
              visible={!!reminderPickerKey}
              initialTime={reminderPickerKey ? (reminderTimes[reminderPickerKey] + ":00") : null}
              onConfirm={(timeStr) => {
                if (reminderPickerKey) {
                  // store as HH:MM for display; strip seconds
                  setReminderTimes((prev) => ({ ...prev, [reminderPickerKey]: timeStr.slice(0, 5) }));
                  setReminderPickerKey(null);
                }
              }}
              onCancel={() => setReminderPickerKey(null)}
            />

            <TouchableOpacity
              onPress={() => void handleSaveReminders()}
              disabled={reminderSaving}
              style={[styles.reminderPrimaryBtn, reminderSaving && styles.reminderBtnDisabled]}
              activeOpacity={0.85}
            >
              {reminderSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.reminderPrimaryBtnText}>Set reminders</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={dismissReminderModal}
              disabled={reminderSaving}
              style={styles.reminderSkipBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.reminderSkipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenBackground: {
    opacity: 1,
  },
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 160,
  },
  centeredWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: "#6b5a45",
    textAlign: "center",
    marginBottom: 16,
    fontFamily: Fonts.sans.regular,
  },
  retryButton: {
    backgroundColor: "#C99317",
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: Fonts.sans.semiBold,
  },
  heroWrap: {
    marginBottom: 10,
  },
  heroImage: {
    minHeight: 260,
    backgroundColor: "transparent",
  },
  heroInner: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 12,
    justifyContent: "space-between",
  },
  logo: {
    width: 108,
    height: 48,
  },
  heroCopy: {
    gap: 6,
    paddingBottom: 10,
    marginTop: 24,
  },
  heroHeadline: {
    fontSize: 22,

    fontFamily: Fonts.serif.bold,
  },
  heroSubtext: {
    fontSize: 16,

    fontFamily: Fonts.serif.regular,
    maxWidth: "92%",
  },
  heroDivider: {
    flexDirection: "row",
    alignItems: "center",
    width: 170,
    marginTop: 6,
  },
  heroDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(201,168,76,0.45)",
  },
  heroDividerIcon: {
    color: "#C9A84C",
    fontSize: 14,
    marginHorizontal: 10,
  },
  content: {
    paddingHorizontal: 16,
    gap: 14,
  },
  inlineError: {
    color: "#c0392b",
    textAlign: "center",
    fontSize: 13,
    fontFamily: Fonts.sans.regular,
    marginBottom: 4,
  },
  doorCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.28)",
    backgroundColor: "rgba(255,255,255,0.72)",
    paddingHorizontal: 16,
    paddingVertical: 14,

    shadowColor: "#432104",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },
  doorIconWrap: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  doorBody: {
    flex: 1,
    justifyContent: "center",
  },
  doorLabel: {
    color: "#432104",
    fontSize: 18,
    lineHeight: 22,
    fontFamily: Fonts.serif.bold,
    marginBottom: 4,
  },
  doorSubtitle: {
    color: "rgba(67,33,4,0.62)",
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Fonts.sans.regular,
  },
  doorCardHighlighted: {
    borderColor: "rgba(201,168,76,0.55)",
    shadowColor: "#C9A84C",
    shadowOpacity: 0.16,
  },
  doorOrientationLine: {
    color: "rgba(67,33,4,0.38)",
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Fonts.sans.regular,
    fontStyle: "italic",
    marginTop: 3,
  },
  doorArrow: {
    color: "#C9A84C",
    fontSize: 24,
    lineHeight: 24,
    opacity: 0.7,
    marginLeft: 8,
  },
  checkinCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.28)",
    backgroundColor: "rgba(255,251,245,0.9)",
    paddingHorizontal: 16,
    paddingVertical: 18,
    shadowColor: "#432104",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
    marginTop: 4,
  },
  checkinHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  checkinTitle: {
    color: "#432104",
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Fonts.serif.bold,
    flex: 1,
  },
  dismissButton: {
    width: 28,
    alignItems: "center",
  },
  dismissButtonText: {
    color: "rgba(67,33,4,0.45)",
    fontSize: 24,
    lineHeight: 24,
    fontFamily: Fonts.sans.regular,
  },
  checkinAcknowledgment: {
    color: "rgba(67,33,4,0.8)",
    fontSize: 15,
    lineHeight: 24,
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    marginBottom: 12,
  },
  suggestionHeader: {
    color: "rgba(67,33,4,0.5)",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sans.regular,
    marginBottom: 8,
  },
  suggestionButton: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.38)",
    backgroundColor: "rgba(255,255,255,0.82)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: "#C9A84C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 2,
  },
  suggestionButtonText: {
    color: "#432104",
    fontSize: 15,
    lineHeight: 20,
    fontFamily: Fonts.serif.bold,
  },
  boundaryText: {
    color: "rgba(67,33,4,0.5)",
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Fonts.sans.regular,
    textAlign: "center",
    marginTop: 10,
  },
  boundaryLink: {
    color: "#C99317",
    textDecorationLine: "underline",
  },
  softCtaLink: {
    fontSize: 13,
    color: "#8A651B",
    textDecorationLine: "underline",
  },
  checkinSubtitle: {
    color: "rgba(67,33,4,0.62)",
    fontSize: 14,
    lineHeight: 21,
    fontFamily: Fonts.sans.regular,
    marginTop: 4,
    marginBottom: 14,
  },
  feelingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  feelingChip: {
    width: "48%",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.38)",
    backgroundColor: "rgba(255,255,255,0.78)",
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  feelingChipContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 24,
  },
  feelingChipSelected: {
    borderColor: "rgba(201,168,76,0.85)",
    backgroundColor: "rgba(243,220,168,0.95)",
    shadowColor: "#C9A84C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 2,
  },
  feelingChipDisabled: {
    opacity: 0.7,
  },
  feelingChipText: {
    color: "#432104",
    fontSize: 14,
    lineHeight: 18,
    fontFamily: Fonts.sans.medium,
  },
  feelingChipLoader: {
    marginLeft: 8,
  },
  feelingChipTextSelected: {
    fontFamily: Fonts.sans.bold,
  },
  reminderOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  reminderSheet: {
    backgroundColor: "#FDF8F0",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 48,
  },
  reminderTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 26,
    color: "#432104",
    marginBottom: 8,
    lineHeight: 34,
  },
  reminderSubtitle: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#7B6545",
    marginBottom: 24,
    lineHeight: 22,
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  reminderRowEnabled: {
    backgroundColor: "rgba(201,168,76,0.08)",
    borderColor: "rgba(201,168,76,0.25)",
  },
  reminderRowLabel: {
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    color: "#432104",
    flex: 1,
  },
  reminderRowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  reminderTimePill: {
    backgroundColor: "rgba(201,168,76,0.15)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 4,
  },
  reminderTimePillText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: "#432104",
  },
  iosPicker: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  iosPickerDone: {
    alignItems: "flex-end",
    padding: 12,
    paddingTop: 0,
  },
  iosPickerDoneText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 14,
    color: "#C99317",
  },
  reminderPrimaryBtn: {
    backgroundColor: "#C99317",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    marginTop: 20,
  },
  reminderBtnDisabled: { opacity: 0.6 },
  reminderPrimaryBtnText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 17,
    color: "#fff",
  },
  reminderSkipBtn: {
    alignItems: "center",
    padding: 14,
    marginTop: 4,
  },
  reminderSkipText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    color: "#7B6545",
  },
});
