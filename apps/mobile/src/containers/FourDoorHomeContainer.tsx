import {
  type MitraHomeSegment,
} from "@kalpx/contracts";
import { useTranslation } from "react-i18next";
import i18n from "../config/i18n";
import type {
  JourneyTriadRemindersPatch,
  QuickCheckinPranaLabel,
} from "@kalpx/types";
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
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
const M3Icon = ({
  width,
  height,
  style,
}: {
  width?: number;
  height?: number;
  style?: any;
}) => (
  <Image
    source={require("../../assets/door_rhythm.webp")}
    style={[{ width, height, resizeMode: "contain" }, style]}
  />
);
const Mp2Icon = ({
  width,
  height,
  style,
}: {
  width?: number;
  height?: number;
  style?: any;
}) => (
  <Image
    source={require("../../assets/door_chant.webp")}
    style={[{ width, height, resizeMode: "contain" }, style]}
  />
);
const Mp3Icon = ({
  width,
  height,
  style,
}: {
  width?: number;
  height?: number;
  style?: any;
}) => (
  <Image
    source={require("../../assets/door_path.webp")}
    style={[{ width, height, resizeMode: "contain" }, style]}
  />
);
const Mp4Icon = ({
  width,
  height,
  style,
}: {
  width?: number;
  height?: number;
  style?: any;
}) => (
  <Image
    source={require("../../assets/door_mitra.webp")}
    style={[{ width, height, resizeMode: "contain" }, style]}
  />
);
import AsyncStorage from "@react-native-async-storage/async-storage";
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
import { platformShadow } from "../theme/shadows";
import {
  rfs,
  rhPad,
  rs,
  sfs,
  TABLET_MAX_CARD_WIDTH,
} from "../utils/responsive";

type FeelingOption = "Agitated" | "Drained" | "Steady" | "Open";

const FEELING_OPTIONS: FeelingOption[] = [
  "Agitated",
  "Drained",
  "Steady",
  "Open",
];

const FOUR_DOOR_BG = require("../../assets/beige_bg.webp");
const HERO_DAY = require("../../assets/imgsun.webp");
const HERO_NIGHT = require("../../assets/night-home.webp");
const SHELL_HEADER_HEIGHT = 45;

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

function getFallbackGreetingHeadline(userName: string | undefined, t: (key: string, opts?: any) => string) {
  const hour = new Date().getHours();
  const timeKey = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  const name = userName?.trim() || t("mitraFourDoor.greeting.friend");
  return t(`mitraFourDoor.greeting.${timeKey}`, { name });
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
  screenWidth,
}: {
  Icon: any;
  label: string;
  subtitle?: string | null;
  orientationLine?: string | null;
  highlighted?: boolean;
  onPress: () => void;
  screenWidth: number;
}) {
  const isTablet = screenWidth >= 768;
  const iconSize = rs(40, 48, screenWidth);
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[
        styles.doorCard,
        highlighted && styles.doorCardHighlighted,
        isTablet && {
          maxWidth: TABLET_MAX_CARD_WIDTH,
          alignSelf: "center",
          width: "100%",
          paddingVertical: 20,
          paddingHorizontal: 22,
        },
      ]}
    >
      <View
        style={[styles.doorIconWrap, isTablet && { width: 60, height: 60 }]}
      >
        <Icon width={iconSize} height={iconSize} />
      </View>
      <View style={styles.doorBody}>
        <Text style={[styles.doorLabel, { fontSize: rs(18, 22, screenWidth) }]}>
          {label}
        </Text>
        {!!subtitle && (
          <Text
            style={[styles.doorSubtitle, { fontSize: rs(14, 17, screenWidth) }]}
          >
            {subtitle}
          </Text>
        )}
        {!!orientationLine && (
          <Text style={styles.doorOrientationLine}>{orientationLine}</Text>
        )}
      </View>
      <Text
        style={[styles.doorArrow, isTablet && { fontSize: 30, lineHeight: 30 }]}
      >
        →
      </Text>
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
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { t } = useTranslation();
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
  const reminderDestination =
    (screenData?.onboarding_reminder_destination as string) || "Home";
  const [reminderToggles, setReminderToggles] = useState<
    Record<"mantra" | "sankalp" | "practice", boolean>
  >({ mantra: false, sankalp: false, practice: false });
  const [reminderTimes, setReminderTimes] = useState<
    Record<"mantra" | "sankalp" | "practice", string>
  >({ mantra: "07:00", sankalp: "08:00", practice: "18:00" });
  const [reminderPickerKey, setReminderPickerKey] = useState<
    "mantra" | "sankalp" | "practice" | null
  >(null);
  const [reminderSaving, setReminderSaving] = useState(false);
  const [pendingPranaMessage, setPendingPranaMessage] = useState<string | null>(
    null,
  );

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
        const data = await mitraJourneyHomeV3({ forceFresh, locale: i18n.language || "en" });
        dispatch(setHomeData(data));
      } catch {
        if (!silent || !homeDataRef.current) {
          setError(t("mitraFourDoor.error.loadFailed"));
        }
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [dispatch, t],
  );

  useEffect(() => {
    setLoading(true);
    void loadHome(false, true);
  }, [loadHome]);

  useFocusEffect(
    useCallback(() => {
      if (!hasSkippedInitialFocusRefresh.current) {
        hasSkippedInitialFocusRefresh.current = true;
        return;
      }
      if (homeDataRef.current) {
        void loadHome(true, true);
      }
    }, [loadHome]),
  );

  useFocusEffect(
    useCallback(() => {
      updateBackground(FOUR_DOOR_BG);
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
          const msg =
            pranaType === "agitated" ? "I am agitated" : "I am drained";
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

  const openQuickResetSurface = useCallback(async () => {
    const token = await AsyncStorage.getItem("access_token");
    if (!token) {
      navigation.navigate("Login" as any);
      return;
    }
    navigation.navigate("QuickReset" as any);
  }, [navigation]);

  const openTellMitraSurface = useCallback(async () => {
    const token = await AsyncStorage.getItem("access_token");
    if (!token) {
      navigation.navigate("Login" as any);
      return;
    }
    navigation.navigate("TellMitra" as any);
  }, [navigation]);

  const openMyRhythmSurface = useCallback(async () => {
    const token = await AsyncStorage.getItem("access_token");
    if (!token) {
      navigation.navigate("Login" as any);
      return;
    }
    const hasRhythmInState =
      homeData?.companion_rhythm?.has_rhythm === true ||
      homeData?.my_rhythm_summary?.has_rhythm === true ||
      homeData?.user_surface_state?.has_rhythm === true ||
      homeData?.door_states?.my_rhythm?.state === "active";

    if (hasRhythmInState) {
      navigation.navigate("RhythmHome" as any);
      return;
    }

    try {
      const fresh = await mitraJourneyHomeV3({ forceFresh: true, locale: i18n.language || "en" });
      dispatch(setHomeData(fresh));
      const hasRhythmFresh =
        fresh?.companion_rhythm?.has_rhythm === true ||
        fresh?.my_rhythm_summary?.has_rhythm === true ||
        fresh?.user_surface_state?.has_rhythm === true ||
        fresh?.door_states?.my_rhythm?.state === "active";

      navigation.navigate(
        (hasRhythmFresh ? "RhythmHome" : "RhythmSetup") as any,
      );
    } catch {
      navigation.navigate("RhythmSetup" as any);
    }
  }, [dispatch, homeData, navigation]);

  const rhythmBand = getRhythmTimeBand();
  const seg = (homeData?.user_surface_state?.segment ??
    "new") as MitraHomeSegment;
  const greetingHeadline =
    homeData?.greeting?.headline?.trim() ||
    getFallbackGreetingHeadline(userName, t);
  const greetingSubtext =
    homeData?.greeting?.subtext?.trim() || t(`mitraFourDoor.greetingSegment.${seg}`) || "";
  const greetingVisual = getGreetingVisualState(greetingHeadline);
  const hasGreetingCopy = !!(greetingHeadline || greetingSubtext);

  const rhythmSubtitle = useMemo(() => {
    const cr = homeData?.companion_rhythm;
    const segVal = (homeData?.user_surface_state?.segment ??
      "new") as MitraHomeSegment;
    if (!cr?.has_rhythm) {
      return (
        t(`mitraFourDoor.rhythmSegment.${segVal}`) ||
        t("mitraFourDoor.rhythm.noStateFallback")
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
      return t("mitraFourDoor.rhythm.allDone");
    }
    if (hasMorning && !morningDone) return t("mitraFourDoor.rhythm.beginMorning");
    if (hasAfternoon && !afternoonDone) {
      return hasMorning && morningDone
        ? t("mitraFourDoor.rhythm.morningHeldAfternoon")
        : t("mitraFourDoor.rhythm.returnAfternoon");
    }
    if (hasNight && !nightDone) {
      return hasAfternoon
        ? t("mitraFourDoor.rhythm.afternoonHeldNight")
        : t("mitraFourDoor.rhythm.closeNight");
    }
    return (
      homeData?.my_rhythm_summary?.next_practice_label ??
      doorStates?.my_rhythm?.subtitle ??
      ""
    );
  }, [doorStates, homeData, t]);

  const innerPathSubtitle = useMemo(() => {
    const ips = homeData?.inner_path_summary;
    const segVal = (homeData?.user_surface_state?.segment ??
      "new") as MitraHomeSegment;
    if (!ips?.has_active_path) {
      return (
        ips?.path_title ??
        doorStates?.inner_path?.subtitle ??
        t(`mitraFourDoor.innerPathSegment.${segVal}`)
      );
    }
    const dayCount = { day: ips.day_number, total: ips.total_days };
    const heldCount = ips.today_held_count ?? 0;
    if (ips.today_practice_held || heldCount >= 3) return t("mitraFourDoor.innerPath.practiceHeld", dayCount);
    if (heldCount > 0) return t("mitraFourDoor.innerPath.stepBegun", dayCount);
    return t("mitraFourDoor.innerPath.dayCount", dayCount);
  }, [doorStates, homeData, t]);
  const hasMantra =
    homeData?.user_surface_state?.has_quick_chant_mantra === true;
  const hasQuickChantHistory =
    homeData?.user_surface_state?.has_quick_chant_history === true;
  const hasTMHistory =
    homeData?.user_surface_state?.has_tell_mitra_history === true;
  const hasIP = homeData?.user_surface_state?.has_inner_path === true;

  // Quick Chant subtitle — 3-way conditional (CRITICAL: only show "chosen mantra" if has_quick_chant_mantra)
  const quickResetSubtitle = hasMantra
    ? t("mitraFourDoor.quickChant.hasMantra")
    : hasQuickChantHistory
      ? t("mitraFourDoor.quickChant.historyOnly")
      : t("mitraFourDoor.quickChant.noState");

  // Tell Mitra subtitle — conditional on state
  const tellMitraSubtitle = hasTMHistory
    ? t("mitraFourDoor.tellMitra.hasHistory")
    : hasIP || seg === "rhythm_and_path"
      ? t("mitraFourDoor.tellMitra.activePath")
      : t("mitraFourDoor.tellMitra.default");

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
        if (reminderToggles[key])
          (patch as any)[`${key}_reminder_time`] = reminderTimes[key];
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
        <Text style={styles.errorText}>{error || t("mitraFourDoor.error.unableToLoad")}</Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => void loadHome()}
          style={styles.retryButton}
        >
          <Text style={styles.retryButtonText}>{t("mitraFourDoor.error.tryAgain")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const acw = homeData.active_checkin_window;
  const windowActive = acw?.active === true;
  const currentRouteName = navigation
    .getState?.()
    ?.routes?.slice(-1)?.[0]?.name;
  const openInnerPathSurface = async () => {
    const token = await AsyncStorage.getItem("access_token");
    if (!token) {
      navigation.navigate("Login" as any);
      return;
    }
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
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
          isTablet && {
            alignItems: "center",
            paddingBottom: insets.bottom + 60,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.heroWrap,
            {
              marginTop: -SHELL_HEADER_HEIGHT,
            },
            isTablet && { width: "100%" },
          ]}
        >
          <ImageBackground
            source={greetingVisual.image}
            resizeMode="cover"
            style={[styles.heroImage, isTablet && { minHeight: 420 }]}
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
                isTablet && { paddingHorizontal: rhPad(18, width) },
              ]}
            >
              <View style={styles.heroCopy}>
                {hasGreetingCopy && (
                  <>
                    <Text
                      style={[
                        styles.heroHeadline,
                        {
                          color: greetingVisual.textColor,
                          fontSize: rs(22, 32, width),
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {greetingHeadline}
                    </Text>
                    {!!greetingSubtext && (
                      <Text
                        style={[
                          styles.heroSubtext,
                          {
                            color: greetingVisual.textColor,
                            fontSize: rs(16, 22, width),
                          },
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

        <View
          style={[
            styles.content,
            isTablet && {
              paddingHorizontal: rhPad(16, width),
              width: "100%",
              gap: 20,
              paddingTop: 16,
              paddingBottom: 32,
            },
          ]}
        >
          {!!error && <Text style={styles.inlineError}>{error}</Text>}

          <DoorCard
            Icon={M3Icon}
            label={t("mitraFourDoor.door.myRhythm")}
            subtitle={rhythmSubtitle}
            orientationLine={seg === "new" && isFirstVisit ? t("mitraFourDoor.orientation.myRhythm") : null}
            onPress={() => void openMyRhythmSurface()}
            screenWidth={width}
          />
          <DoorCard
            Icon={Mp3Icon}
            label={t("mitraFourDoor.door.innerPath")}
            subtitle={innerPathSubtitle}
            orientationLine={seg === "new" && isFirstVisit ? t("mitraFourDoor.orientation.innerPath") : null}
            highlighted={seg === "rhythm_only"}
            onPress={() => void openInnerPathSurface()}
            screenWidth={width}
          />
          <DoorCard
            Icon={Mp2Icon}
            label={t("mitraFourDoor.door.quickChant")}
            subtitle={quickResetSubtitle}
            orientationLine={seg === "new" && isFirstVisit ? t("mitraFourDoor.orientation.quickChant") : null}
            onPress={() => void openQuickResetSurface()}
            screenWidth={width}
          />
          <DoorCard
            Icon={Mp4Icon}
            label={t("mitraFourDoor.door.tellMitra")}
            subtitle={tellMitraSubtitle}
            orientationLine={seg === "new" && isFirstVisit ? t("mitraFourDoor.orientation.tellMitra") : null}
            onPress={() => void openTellMitraSurface()}
            screenWidth={width}
          />

          <View
            style={[
              styles.checkinCard,
              isTablet && {
                maxWidth: TABLET_MAX_CARD_WIDTH,
                alignSelf: "center",
                width: "100%",
                paddingVertical: 24,
                paddingHorizontal: 24,
              },
            ]}
          >
            {windowActive ? (
              <>
                <View style={styles.checkinHeaderRow}>
                  <Text
                    style={[
                      styles.checkinTitle,
                      { fontSize: rs(18, 24, width) },
                    ]}
                  >
                    {(acw?.prana_label as QuickCheckinPranaLabel) ||
                      t("mitraFourDoor.checkin.heading")}
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
                      navigation.navigate("TellMitra" as any, {
                        initialMessage: pendingPranaMessage,
                      });
                      setPendingPranaMessage(null);
                    }}
                  >
                    <Text style={styles.suggestionButtonText}>{t("mitraFourDoor.checkin.tellMitraCta")}</Text>
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
                    {t("mitraFourDoor.checkin.boundaryBefore")}{" "}
                    <Text
                      style={styles.boundaryLink}
                      onPress={() => void openTellMitraSurface()}
                    >
                      {t("mitraFourDoor.checkin.boundaryLink")}
                    </Text>{" "}
                    {t("mitraFourDoor.checkin.boundaryAfter")}
                  </Text>
                )}
                {!acw?.suggestion && !!acw?.prana_label && (
                  <View style={{ flexDirection: "row", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                    <TouchableOpacity onPress={() => void openInnerPathSurface()}>
                      <Text style={styles.softCtaLink}>{t("mitraFourDoor.checkin.ctaInnerPath")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => void openMyRhythmSurface()}>
                      <Text style={styles.softCtaLink}>{t("mitraFourDoor.checkin.ctaMyRhythm")}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </>
            ) : (
              <>
                <Text
                  style={[styles.checkinTitle, { fontSize: rs(18, 24, width) }]}
                >
                  {t("mitraFourDoor.checkin.heading")}
                </Text>
                <Text
                  style={[
                    styles.checkinSubtitle,
                    { fontSize: rs(14, 18, width) },
                  ]}
                >
                  {t("mitraFourDoor.checkin.subtext")}
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
                          isTablet && { paddingVertical: 14 },
                        ]}
                      >
                        <View style={styles.feelingChipContent}>
                          <Text
                            style={[
                              styles.feelingChipText,
                              { fontSize: rs(14, 18, width) },
                              isSelected && styles.feelingChipTextSelected,
                            ]}
                          >
                            {t(`mitraFourDoor.feeling.${feeling.toLowerCase()}`)}
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
            <Text style={styles.reminderTitle}>{t("mitraFourDoor.reminders.title")}</Text>
            <Text style={styles.reminderSubtitle}>
              {t("mitraFourDoor.reminders.subtitle")}
            </Text>

            {(["mantra", "sankalp", "practice"] as const).map((key) => {
              const enabled = reminderToggles[key];
              return (
                <View
                  key={key}
                  style={[
                    styles.reminderRow,
                    enabled && styles.reminderRowEnabled,
                  ]}
                >
                  <Text style={styles.reminderRowLabel}>{t("mitraFourDoor.reminders.rowLabel", { label: t(`mitraFourDoor.reminders.${key}`) })}</Text>
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
                      onValueChange={(val) =>
                        setReminderToggles((prev) => ({ ...prev, [key]: val }))
                      }
                      trackColor={{
                        false: "rgba(0,0,0,0.12)",
                        true: "#C99317",
                      }}
                      thumbColor="#fff"
                    />
                  </View>
                </View>
              );
            })}

            <TimePickerModal
              visible={!!reminderPickerKey}
              initialTime={
                reminderPickerKey
                  ? reminderTimes[reminderPickerKey] + ":00"
                  : null
              }
              onConfirm={(timeStr) => {
                if (reminderPickerKey) {
                  // store as HH:MM for display; strip seconds
                  setReminderTimes((prev) => ({
                    ...prev,
                    [reminderPickerKey]: timeStr.slice(0, 5),
                  }));
                  setReminderPickerKey(null);
                }
              }}
              onCancel={() => setReminderPickerKey(null)}
            />

            <TouchableOpacity
              onPress={() => void handleSaveReminders()}
              disabled={reminderSaving}
              style={[
                styles.reminderPrimaryBtn,
                reminderSaving && styles.reminderBtnDisabled,
              ]}
              activeOpacity={0.85}
            >
              {reminderSaving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.reminderPrimaryBtnText}>{t("mitraFourDoor.reminders.saveBtn")}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={dismissReminderModal}
              disabled={reminderSaving}
              style={styles.reminderSkipBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.reminderSkipText}>{t("mitraFourDoor.reminders.skipBtn")}</Text>
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
    backgroundColor: "transparent",
  },
  screenBackground: {
    opacity: 1,
  },
  root: {
    flex: 1,
  },
  scrollContent: {},
  centeredWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: sfs(16),
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
    fontSize: sfs(15),
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
    fontSize: sfs(22),
    fontFamily: Fonts.serif.bold,
  },
  heroSubtext: {
    fontSize: sfs(16),
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
    fontSize: sfs(14),
    marginHorizontal: 10,
  },
  content: {
    paddingHorizontal: 16,
    gap: 14,
  },
  inlineError: {
    color: "#c0392b",
    textAlign: "center",
    fontSize: sfs(13),
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
    backgroundColor:
      Platform.OS === "android" ? "#FEFAF4" : "rgba(255,255,255,0.72)",
    paddingHorizontal: 16,
    paddingVertical: 14,

    ...platformShadow("#432104", 8, 0.08, 18, 4),
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
    fontSize: sfs(18),
    lineHeight: sfs(22),
    fontFamily: Fonts.serif.bold,
    marginBottom: 4,
  },
  doorSubtitle: {
    color: "rgba(67,33,4,0.62)",
    fontSize: sfs(14),
    lineHeight: sfs(20),
    fontFamily: Fonts.sans.regular,
  },
  doorCardHighlighted: {
    borderColor: "rgba(201,168,76,0.55)",
    ...platformShadow("#C9A84C", 6, 0.16, 12, 2),
  },
  doorOrientationLine: {
    color: "rgba(67,33,4,0.38)",
    fontSize: sfs(12),
    lineHeight: sfs(16),
    fontFamily: Fonts.sans.regular,
    fontStyle: "italic",
    marginTop: 3,
  },
  doorArrow: {
    color: "#C9A84C",
    fontSize: sfs(24),
    lineHeight: sfs(24),
    opacity: 0.7,
    marginLeft: 8,
  },
  checkinCard: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.28)",
    backgroundColor:
      Platform.OS === "android" ? "#FFF9F2" : "rgba(255,251,245,0.9)",
    paddingHorizontal: 16,
    paddingVertical: 18,
    ...platformShadow("#432104", 8, 0.08, 18, 4),
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
    fontSize: sfs(18),
    lineHeight: sfs(24),
    fontFamily: Fonts.serif.bold,
    flex: 1,
  },
  dismissButton: {
    width: 28,
    alignItems: "center",
  },
  dismissButtonText: {
    color: "rgba(67,33,4,0.45)",
    fontSize: sfs(24),
    lineHeight: sfs(24),
    fontFamily: Fonts.sans.regular,
  },
  checkinAcknowledgment: {
    color: "rgba(67,33,4,0.8)",
    fontSize: sfs(15),
    lineHeight: sfs(24),
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    marginBottom: 12,
  },
  suggestionHeader: {
    color: "rgba(67,33,4,0.5)",
    fontSize: sfs(13),
    lineHeight: sfs(18),
    fontFamily: Fonts.sans.regular,
    marginBottom: 8,
  },
  suggestionButton: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.38)",
    backgroundColor:
      Platform.OS === "android" ? "#FEFAF4" : "rgba(255,255,255,0.82)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...platformShadow("#C9A84C", 6, 0.12, 14, 2),
  },
  suggestionButtonText: {
    color: "#432104",
    fontSize: sfs(15),
    lineHeight: sfs(20),
    fontFamily: Fonts.serif.bold,
  },
  boundaryText: {
    color: "rgba(67,33,4,0.5)",
    fontSize: sfs(13),
    lineHeight: sfs(18),
    fontFamily: Fonts.sans.regular,
    textAlign: "center",
    marginTop: 10,
  },
  boundaryLink: {
    color: "#C99317",
    textDecorationLine: "underline",
  },
  softCtaLink: {
    fontSize: sfs(13),
    color: "#8A651B",
    textDecorationLine: "underline",
  },
  checkinSubtitle: {
    color: "rgba(67,33,4,0.62)",
    fontSize: sfs(14),
    lineHeight: sfs(21),
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
    backgroundColor:
      Platform.OS === "android" ? "#FEFAF4" : "rgba(255,255,255,0.78)",
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
    ...platformShadow("#C9A84C", 6, 0.16, 12, 2),
  },
  feelingChipDisabled: {
    opacity: 0.7,
  },
  feelingChipText: {
    color: "#432104",
    fontSize: sfs(14),
    lineHeight: sfs(18),
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
