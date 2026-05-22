/**
 * InnerPathScreen — S11 mobile parity of the web InnerPathPage.
 *
 * Entry-view routing on mount:
 *   daily_view              → render focused inner-path layout
 *   day_7_view / day_14_view → ingest + load checkpoint, replace with DynamicEngine
 *   welcome_back_surface     → replace with DynamicEngine
 *   onboarding_start / null  → replace with DynamicEngine
 *   unknown                  → replace with DynamicEngine (safe fallback)
 *
 * Common engine: uses the same mitraJourneyEntryView + mitraJourneyDailyView +
 * ingestDailyView pipeline as the web InnerPathPage. TriadCardsRow is the
 * shared zero-props block that reads from Redux screenData and fires start_runner
 * via the existing actionExecutor. Runner containers are rendered by DynamicEngine
 * (ScreenRenderer); InnerPathScreen detects the container transition via a Redux
 * selector and hands off to DynamicEngine automatically.
 *
 * Do NOT render:
 *   - greeting.headline ("Good morning")
 *   - Four-Door invitation copy
 *   - QuickSupportBlock / AdditionalItems / Room menus
 */

import { Ionicons } from "@expo/vector-icons";
import type {
  JourneyTriadReminders,
  JourneyTriadRemindersPatch,
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
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
const In1Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/in1.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
import CycleProgressBlock from "../../blocks/dashboard/CycleProgressBlock";
import { TimePickerModal } from "../../components/TimePickerModal";
import {
  apiGetJourneyReminders,
  apiPatchJourneyReminders,
  mitraJourneyDailyView,
  mitraJourneyDay14View,
  mitraJourneyDay7View,
  mitraJourneyEntryView,
} from "../../engine/mitraApi";
import { useScreenStore } from "../../engine/useScreenBridge";
import {
  ingestDailyView,
  ingestDay14View,
  ingestDay7View,
} from "../../engine/v3Ingest";
import store, { type RootState } from "../../store";
import { loadScreenWithData, screenActions } from "../../store/screenSlice";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/fonts";
import ContinueJourney from "../Home/ContinueJourney";

// Runner containers that require DynamicEngine to render.
// When TriadCardsRow fires start_runner → loadScreen({ container_id: "cycle_transitions" }),
// the selector below detects the change and navigates to DynamicEngine.
const RUNNER_CONTAINERS = new Set(["cycle_transitions"]);

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function innerPathHeldLabel(slot: string): string {
  if (slot === "mantra") return "Mantra held today · return anytime";
  if (slot === "sankalp") return "Sankalp carried today · return anytime";
  if (slot === "practice") return "Practice held today · return anytime";
  return "Held today · return anytime";
}

export function InnerPathScreen({ embedded = false }: { embedded?: boolean }) {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<any>();
  const { loadScreen, goBack, updateBackground } = useScreenStore();

  useFocusEffect(
    useCallback(() => {
      updateBackground(require("../../../assets/beige_bg.png"));
      return () => updateBackground(null);
    }, [updateBackground]),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReentrySurface, setShowReentrySurface] = useState(false);
  const [guidanceOpen, setGuidanceOpen] = useState(false);
  const [whyChosenOpen, setWhyChosenOpen] = useState(false);
  const [activeWhyTab, setActiveWhyTab] = useState<
    "mantra" | "sankalp" | "practice"
  >("mantra");
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [progressOpen, setProgressOpen] = useState(false);
  const [reminders, setReminders] = useState<JourneyTriadReminders | null>(
    null,
  );
  const [reminderSaving, setReminderSaving] = useState(false);
  const [reminderPickerKey, setReminderPickerKey] = useState<
    "mantra" | "sankalp" | "practice" | null
  >(null);
  const [showAllCompleteMessage, setShowAllCompleteMessage] = useState(false);

  // After daily-view data is loaded, watch for runner container transitions.
  const watchRunnerRef = useRef(false);
  // Tracks whether the initial load has completed; subsequent focuses trigger a silent refetch.
  const hasFocusedOnce = useRef(false);

  useFocusEffect(
    useCallback(() => {
      if (!hasFocusedOnce.current) {
        hasFocusedOnce.current = true;
        return;
      }
      // P0-B: re-fetch daily view after returning from runner so completed_today renders correctly
      mitraJourneyDailyView(null).then((result) => {
        if (!result?.envelope) return;
        const flat = ingestDailyView(result.envelope);
        for (const [k, v] of Object.entries(flat)) {
          if (v !== undefined) {
            dispatch(screenActions.setScreenValue({ key: k, value: v }));
          }
        }
      }).catch(() => {});
    }, [dispatch]),
  );
  const currentContainerId = useSelector(
    (state: RootState) => state.screen.currentContainerId,
  );

  useEffect(() => {
    if (!watchRunnerRef.current) return;
    if (!embedded && RUNNER_CONTAINERS.has(currentContainerId)) {
      navigation.navigate("DynamicEngine" as any);
    }
  }, [currentContainerId, embedded, navigation]);

  // Common engine — same pipeline as web InnerPathPage.
  useEffect(() => {
    let cancelled = false;
    const routeRunId = Date.now();
    if (__DEV__)
      console.log(
        "[InnerPathScreen] checkpoint fix e0aedef loaded — effect run",
        routeRunId,
      );

    const writeAll = (flat: Record<string, any>) => {
      for (const [k, v] of Object.entries(flat)) {
        if (v !== undefined) {
          dispatch(screenActions.setScreenValue({ key: k, value: v }));
        }
      }
    };

    (async () => {
      try {
        if (__DEV__)
          console.log("[InnerPathScreen]", routeRunId, "calling entry-view");
        const entryResult = await mitraJourneyEntryView();
        if (__DEV__)
          console.log(
            "[InnerPathScreen]",
            routeRunId,
            "entry-view returned, cancelled:",
            cancelled,
          );
        if (cancelled) return;

        const target = entryResult.envelope?.target;
        const viewKey = target?.view_key;
        const payload = target?.payload ?? {};
        if (__DEV__) {
          console.log(
            "[InnerPathScreen]",
            routeRunId,
            "entry-view view_key:",
            viewKey,
          );
          console.log(
            "[InnerPathScreen]",
            routeRunId,
            "viewKey raw JSON:",
            JSON.stringify(viewKey),
          );
          console.log(
            "[InnerPathScreen]",
            routeRunId,
            "day14 equality:",
            viewKey === "day_14_view",
          );
          console.log("[InnerPathScreen]", routeRunId, "embedded:", embedded);
        }

        if (viewKey === "day_7_view") {
          dispatch(
            screenActions.setScreenValue({ key: "checkpoint_day", value: 7 }),
          );
          // Checkpoint fetch runs regardless of embedded.
          // Embedded: DynamicEngine (already on screen) re-renders when schema switches.
          // Standalone: navigation.replace opens DynamicEngine.
          try {
            const env7 = await mitraJourneyDay7View();
            if (cancelled) return;
            if (__DEV__) {
              console.log(
                "[InnerPathScreen] day_7_view API wrapper keys:",
                env7 ? Object.keys(env7) : "null",
              );
              console.log(
                "[InnerPathScreen] day_7_view envelope keys:",
                env7?.envelope ? Object.keys(env7.envelope) : "null",
              );
            }
            if (env7?.envelope) {
              const flat = ingestDay7View(env7.envelope as any);
              if (__DEV__)
                console.log(
                  "[InnerPathScreen] day_7_view ingest keys:",
                  Object.keys(flat).slice(0, 10),
                );
              writeAll(flat);
              await dispatch(
                loadScreenWithData({
                  containerId: "cycle_transitions",
                  stateId: "checkpoint_day_7",
                }) as any,
              );
              if (__DEV__)
                console.log(
                  "[InnerPathScreen] day_7_view schema loaded, embedded:",
                  embedded,
                );
              if (!embedded) {
                navigation.replace("DynamicEngine" as any);
              }
            } else {
              if (__DEV__)
                console.warn(
                  "[InnerPathScreen] day_7_view: checkpoint not ready (null envelope)",
                );
              if (!embedded) setLoading(false);
            }
          } catch (e) {
            if (__DEV__)
              console.warn("[InnerPathScreen] day_7_view checkpoint error:", e);
          }
          return;
        }

        if (viewKey === "day_14_view") {
          if (__DEV__)
            console.log(
              "[InnerPathScreen]",
              routeRunId,
              "ENTERING day_14_view branch, embedded:",
              embedded,
            );
          dispatch(
            screenActions.setScreenValue({ key: "checkpoint_day", value: 14 }),
          );
          // Checkpoint fetch runs regardless of embedded.
          // Embedded: DynamicEngine (already on screen) re-renders when schema switches.
          // Standalone: navigation.replace opens DynamicEngine.
          if (__DEV__)
            console.log(
              "[InnerPathScreen]",
              routeRunId,
              "cancelled before day14 call:",
              cancelled,
            );
          try {
            if (__DEV__)
              console.log(
                "[InnerPathScreen]",
                routeRunId,
                "BEFORE mitraJourneyDay14View",
              );
            const env14 = await mitraJourneyDay14View();
            if (__DEV__)
              console.log(
                "[InnerPathScreen]",
                routeRunId,
                "AFTER mitraJourneyDay14View, cancelled:",
                cancelled,
                "env14 keys:",
                env14 ? Object.keys(env14) : null,
              );
            if (cancelled) return;
            if (__DEV__) {
              console.log(
                "[InnerPathScreen] day_14_view API wrapper keys:",
                env14 ? Object.keys(env14) : "null",
              );
              console.log(
                "[InnerPathScreen] day_14_view envelope keys:",
                env14?.envelope ? Object.keys(env14.envelope) : "null",
              );
            }
            if (env14?.envelope) {
              const flat = ingestDay14View(env14.envelope as any);
              if (__DEV__)
                console.log(
                  "[InnerPathScreen] day_14_view ingest keys:",
                  Object.keys(flat).slice(0, 10),
                );
              writeAll(flat);
              await dispatch(
                loadScreenWithData({
                  containerId: "cycle_transitions",
                  stateId: "checkpoint_day_14",
                }) as any,
              );
              if (__DEV__)
                console.log(
                  "[InnerPathScreen] day_14_view schema loaded, embedded:",
                  embedded,
                );
              if (!embedded) {
                navigation.replace("DynamicEngine" as any);
              }
            } else {
              if (__DEV__)
                console.warn(
                  "[InnerPathScreen] day_14_view: checkpoint not ready (null envelope)",
                );
              if (!embedded) setLoading(false);
            }
          } catch (e) {
            if (__DEV__)
              console.warn(
                "[InnerPathScreen] day_14_view checkpoint error:",
                e,
              );
          }
          return;
        }

        if (!viewKey || viewKey === "onboarding_start") {
          if (!embedded) {
            // Seed schema before navigating — DynamicEngine has no schema without this.
            dispatch(
              loadScreenWithData({
                containerId: "welcome_onboarding",
                stateId: "turn_1",
              }) as any,
            );
            navigation.replace("DynamicEngine" as any);
          }
          return;
        }

        if (viewKey === "welcome_back_surface") {
          if (!embedded) {
            setShowReentrySurface(true);
            setLoading(false);
          }
          return;
        }

        if (viewKey !== "daily_view") {
          if (!embedded) {
            navigation.replace("DynamicEngine" as any);
          }
          return;
        }

        // daily_view — use entry-view payload directly if valid, else fall back.
        const isDailyViewPayload =
          viewKey === "daily_view" &&
          payload?.identity != null &&
          payload?.today != null;

        let dailyEnvelope: any;
        if (isDailyViewPayload) {
          dailyEnvelope = payload;
        } else {
          if (__DEV__) {
            console.warn(
              "[InnerPathScreen] entry-view payload absent or mismatched — falling back to daily-view call",
            );
          }
          const dailyResult = await mitraJourneyDailyView(null);
          if (cancelled) return;
          if (dailyResult.notModified || !dailyResult.envelope) {
            setError("Your path is preparing — try again in a moment.");
            setLoading(false);
            return;
          }
          dailyEnvelope = dailyResult.envelope;
        }

        const flat = ingestDailyView(dailyEnvelope);
        writeAll(flat);

        // Arm the runner-container watcher only after data is safely in Redux.
        watchRunnerRef.current = true;
        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Could not load your path.");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch, embedded, navigation]);

  useEffect(() => {
    apiGetJourneyReminders()
      .then((r) => setReminders(r))
      .catch(() => {});
  }, []);

  const sd = useSelector((state: any) => state.screen?.screenData ?? {});

  // P1-4: show calm acknowledgment when all 3 triad items were just completed.
  useEffect(() => {
    if (sd.triad_all_complete) {
      setShowAllCompleteMessage(true);
      dispatch(screenActions.setScreenValue({ key: 'triad_all_complete', value: false }));
      const t = setTimeout(() => setShowAllCompleteMessage(false), 5000);
      return () => clearTimeout(t);
    }
  }, [sd.triad_all_complete, dispatch]);

  const triadArr = Array.isArray(sd.today?.triad) ? sd.today.triad : [];
  const sankalpRow = triadArr.find((t: any) => t?.slot === "sankalp");
  const guidanceItems = useMemo(() => {
    if (sankalpRow?.how_to_live && typeof sankalpRow.how_to_live === "string") {
      return [sankalpRow.how_to_live];
    }
    if (Array.isArray(sd.sankalp_how_to_live)) {
      return sd.sankalp_how_to_live.filter(
        (x: any) => typeof x === "string" && x.trim().length > 0,
      );
    }
    if (
      typeof sd.sankalp_how_to_live === "string" &&
      sd.sankalp_how_to_live.trim().length > 0
    ) {
      return [sd.sankalp_how_to_live];
    }
    return [];
  }, [sd.sankalp_how_to_live, sankalpRow]);
  const hasGuidance = guidanceItems.length > 0;
  const getShift = (context: any): string =>
    context?.target_shift || context?.mitra_shift || "";
  const sentence = (value: string | null | undefined): string => {
    const text = String(value || "").trim();
    if (!text) return "";
    return /[.!?]$/.test(text) ? text : `${text}.`;
  };
  const whyTabs = useMemo(
    () =>
      (
        ["mantra", "sankalp", "practice"] as (
          | "mantra"
          | "sankalp"
          | "practice"
        )[]
      )
        .map((slot) => {
          const item = triadArr.find((t: any) => t?.slot === slot) || {};
          const context = item.context || {};
          return {
            slot,
            label: slot.toUpperCase(),
            title: item.title || "",
            context,
            shift: getShift(context),
          };
        })
        .filter(
          (item) =>
            !!(
              item.title ||
              item.context?.mitra_frame_through ||
              item.shift ||
              item.context?.mitra_use_for ||
              item.context?.commentary_lineage
            ),
        ),
    [triadArr],
  );
  const hasWhyChosen = whyTabs.length > 0;
  const activeWhyItem =
    whyTabs.find((item) => item.slot === activeWhyTab) || whyTabs[0] || null;
  const triadItems = useMemo(
    () =>
      [
        {
          slot: "mantra",
          label: "MANTRA",
          title:
            triadArr.find((t: any) => t?.slot === "mantra")?.title ||
            sd.card_mantra_title ||
            "",
          subtitle:
            triadArr.find((t: any) => t?.slot === "mantra")?.subtitle ||
            "Return through sound",
          completedToday:
            triadArr.find((t: any) => t?.slot === "mantra")?.completed_today === true,
          iconName: "musical-notes-outline" as const,
          master:
            sd.master_mantra ||
            triadArr.find((t: any) => t?.slot === "mantra") ||
            null,
        },
        {
          slot: "sankalp",
          label: "SANKALP",
          title:
            triadArr.find((t: any) => t?.slot === "sankalp")?.title ||
            sd.card_sankalpa_title ||
            "",
          subtitle:
            triadArr.find((t: any) => t?.slot === "sankalp")?.subtitle ||
            "Hold today's intention",
          completedToday:
            triadArr.find((t: any) => t?.slot === "sankalp")?.completed_today === true,
          iconName: "leaf-outline" as const,
          master:
            sd.master_sankalp ||
            triadArr.find((t: any) => t?.slot === "sankalp") ||
            null,
        },
        {
          slot: "practice",
          label: "PRACTICE",
          title:
            triadArr.find((t: any) => t?.slot === "practice")?.title ||
            sd.card_ritual_title ||
            "",
          subtitle:
            triadArr.find((t: any) => t?.slot === "practice")?.subtitle ||
            "Move through the body",
          completedToday:
            triadArr.find((t: any) => t?.slot === "practice")?.completed_today === true,
          iconName: "flower-outline" as const,
          IconComponent: In1Icon,
          master:
            sd.master_practice ||
            triadArr.find((t: any) => t?.slot === "practice") ||
            null,
        },
      ].filter((item) => item.title),
    [sd, triadArr],
  );

  const handleTriadPress = (
    slot: "mantra" | "sankalp" | "practice",
    item: any,
  ) => {
    if (!item) return;
    const journeyId = String((sd as any)?.journey_id ?? "");
    const dayNumber = Number((sd as any)?.day_number) || 0;
    if (slot === "mantra") {
      navigation.navigate("InnerPathMantraRunner" as any, { item, journeyId, dayNumber });
    } else if (slot === "sankalp") {
      navigation.navigate("InnerPathSankalpRunner" as any, { item, journeyId, dayNumber });
    } else {
      navigation.navigate("InnerPathPracticeRunner" as any, { item, journeyId, dayNumber });
    }
  };
  const handleBack = () => {
    if (embedded) {
      store.dispatch(
        screenActions.setScreenValue({
          key: "dashboard_entry_surface",
          value: null,
        }),
      );
    }
    navigation.goBack();
  };
  const toggleGuidance = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(220, "easeInEaseOut", "opacity"),
    );
    setGuidanceOpen((value) => !value);
  };
  const toggleWhyChosen = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(220, "easeInEaseOut", "opacity"),
    );
    setWhyChosenOpen((value) => !value);
  };

  const toggleReminders = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(220, "easeInEaseOut", "opacity"),
    );
    setRemindersOpen((value) => !value);
  };

  const toggleProgress = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(220, "easeInEaseOut", "opacity"),
    );
    setProgressOpen((v) => !v);
  };

  const TRIAD_REMINDER_DEFAULTS: Record<
    "mantra" | "sankalp" | "practice",
    string
  > = {
    mantra: "07:00",
    sankalp: "08:00",
    practice: "18:00",
  };

  async function handleReminderToggle(key: "mantra" | "sankalp" | "practice") {
    if (!reminders || reminderSaving) return;
    const enabledKey = `${key}_reminder_enabled` as keyof JourneyTriadReminders;
    const timeKey = `${key}_reminder_time` as keyof JourneyTriadReminders;
    const currentEnabled = reminders[enabledKey] as boolean;
    const patch: JourneyTriadRemindersPatch = {
      [`${key}_reminder_enabled`]: !currentEnabled,
    } as JourneyTriadRemindersPatch;
    if (!currentEnabled && !reminders[timeKey]) {
      (patch as any)[`${key}_reminder_time`] = TRIAD_REMINDER_DEFAULTS[key];
    }
    setReminderSaving(true);
    try {
      const updated = await apiPatchJourneyReminders(patch);
      setReminders(updated);
    } catch {
      // non-fatal
    } finally {
      setReminderSaving(false);
    }
  }

  async function handleReminderTime(
    key: "mantra" | "sankalp" | "practice",
    timeStr: string,
  ) {
    setReminderPickerKey(null);
    setReminderSaving(true);
    try {
      const updated = await apiPatchJourneyReminders({
        [`${key}_reminder_time`]: timeStr,
      } as JourneyTriadRemindersPatch);
      setReminders(updated);
    } catch {
      // non-fatal
    } finally {
      setReminderSaving(false);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="small" color="#C99317" />
        </View>
      </SafeAreaView>
    );
  }

  if (showReentrySurface && !embedded) {
    return <ContinueJourney hasActiveJourney={false} />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleBack} style={styles.retryBtn}>
            <Text style={styles.retryBtnText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {showAllCompleteMessage && (
          <View style={styles.allCompleteBlock}>
            <Text style={styles.allCompleteTitle}>All three held today</Text>
            <Text style={styles.allCompleteBody}>
              Mantra, Sankalp, Practice — the cycle is complete.
            </Text>
          </View>
        )}
        <View style={styles.heroBlock}>
          <Text style={styles.sparkle}>✧</Text>
          <Text style={styles.heroTitle}>
            {sd.headline_text ||
              sd.greeting?.headline ||
              sd.focus_phrase ||
              "Still here. That is the practice."}
          </Text>
          {!!sd.greeting_context && (
            <Text style={styles.supportingLine}>{sd.greeting_context}</Text>
          )}

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={toggleProgress}
            style={styles.dayPill}
          >
            <Text style={styles.dayPillText}>
              Day {sd.day_number || 1} of {sd.total_days || 14}
            </Text>
            <Ionicons
              name={progressOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color={Colors.brownMuted}
            />
          </TouchableOpacity>
        </View>

        {progressOpen && (
          <View style={styles.progressWrap}>
            <CycleProgressBlock
              screenData={sd}
              expanded={true}
              hideHeader={true}
            />
          </View>
        )}

        <View style={styles.triadStack}>
          {triadItems.map((item) => (
            <TouchableOpacity
              key={item.slot}
              activeOpacity={0.9}
              onPress={() => handleTriadPress(item.slot as any, item.master)}
              style={styles.triadCard}
            >
              <View style={styles.triadMain}>
                <View style={styles.triadIconWrap}>
                  {item.IconComponent ? (
                    <item.IconComponent width={28} height={28} />
                  ) : (
                    <Ionicons
                      name={item.iconName}
                      size={20}
                      color={Colors.goldBright}
                    />
                  )}
                </View>
                <View style={styles.triadCopy}>
                  <Text style={styles.triadLabel}>{item.label}</Text>
                  <Text style={styles.triadTitle}>{item.title}</Text>
                  {!!item.subtitle && (
                    <Text style={styles.triadSubtitle}>{item.subtitle}</Text>
                  )}
                  {item.completedToday && (
                    <Text style={styles.triadDoneLabel}>{innerPathHeldLabel(item.slot)}</Text>
                  )}
                </View>
              </View>
              <View style={styles.triadChevronWrap}>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={Colors.goldBright}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.dividerWrap}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLotus}>✿</Text>
          <View style={styles.dividerLine} />
        </View>

        {hasGuidance && (
          <View style={styles.sectionBlock}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={toggleGuidance}
              style={styles.accordionRow}
            >
              <View style={styles.accordionLead}>
                <Text style={styles.accordionIcon}>✦</Text>
                <Text style={styles.accordionTitle}>Today&apos;s guidance</Text>
              </View>
              <Ionicons
                name={guidanceOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color={Colors.brownMuted}
              />
            </TouchableOpacity>
            {guidanceOpen && (
              <View style={styles.guidanceCard}>
                <Text style={styles.guidanceHeader}>
                  {sd.sankalp_how_to_live_label || "HOW TO LIVE THIS"}
                </Text>
                {guidanceItems.map((item: string, index: number) => (
                  <View key={`guide-${index}`} style={styles.guidanceItemRow}>
                    <View style={styles.guidanceItemBar} />
                    <Text style={styles.guidanceItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {hasWhyChosen && (
          <View style={styles.sectionBlock}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={toggleWhyChosen}
              style={styles.accordionRow}
            >
              <View style={styles.accordionLead}>
                <Text style={styles.accordionIcon}>✿</Text>
                <View style={styles.whyHeaderCopy}>
                  <Text style={styles.accordionTitle}>
                    Why these were chosen
                  </Text>
                  {!whyChosenOpen && (
                    <Text style={styles.accordionSubtitle}>
                      Understand why Mitra selected this mantra, sankalp, and
                      practice.
                    </Text>
                  )}
                </View>
              </View>
              <Ionicons
                name={whyChosenOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color={Colors.brownMuted}
              />
            </TouchableOpacity>
            {whyChosenOpen && (
              <View style={styles.whyPanel}>
                {activeWhyItem && (
                  <View>
                    <Text style={styles.whyEyebrow}>Chosen with care</Text>
                    <Text style={styles.whyTitle}>Why this supports today</Text>

                    <View style={styles.whyTabsRow}>
                      {whyTabs.map((item) => {
                        const isActive = activeWhyItem.slot === item.slot;
                        return (
                          <TouchableOpacity
                            key={item.slot}
                            activeOpacity={0.85}
                            onPress={() => setActiveWhyTab(item.slot)}
                            style={[
                              styles.whyTabPill,
                              isActive && styles.whyTabPillActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.whyTabText,
                                isActive && styles.whyTabTextActive,
                              ]}
                            >
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <View style={styles.whyDivider} />

                    <Text style={styles.whySectionLabel}>
                      {activeWhyItem.label}
                    </Text>
                    <Text style={styles.whyItemTitle}>
                      {activeWhyItem.title}
                    </Text>

                    {!!activeWhyItem.context?.mitra_frame_through && (
                      <View style={styles.whyInfoCard}>
                        <Text style={styles.whyInfoLabel}>Essence</Text>
                        <Text style={styles.whyInfoText}>
                          {sentence(
                            activeWhyItem.slot === "sankalp"
                              ? `This is ${activeWhyItem.context.mitra_frame_through}`
                              : `${activeWhyItem.title || "This"} is ${activeWhyItem.context.mitra_frame_through}`,
                          )}
                        </Text>
                      </View>
                    )}

                    {!!activeWhyItem.shift && (
                      <View style={styles.whyInfoCard}>
                        <Text style={styles.whyInfoLabel}>Shift</Text>
                        <Text style={styles.whyInfoText}>
                          {sentence(
                            `Mitra chose this to guide you from ${activeWhyItem.shift}`,
                          )}
                        </Text>
                      </View>
                    )}

                    {!!activeWhyItem.context?.mitra_use_for && (
                      <View style={styles.whyInfoCard}>
                        <Text style={styles.whyInfoLabel}>Useful for</Text>
                        <Text style={styles.whyInfoText}>
                          {sentence(activeWhyItem.context.mitra_use_for)}
                        </Text>
                      </View>
                    )}

                    {!!activeWhyItem.context?.commentary_lineage && (
                      <View style={styles.whyInfoCard}>
                        <Text style={styles.whyInfoLabel}>Rooted in</Text>
                        <Text style={styles.whyInfoText}>
                          {sentence(activeWhyItem.context.commentary_lineage)}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Reminders accordion — shown when user has an active journey */}
        {reminders?.has_journey && (
          <View style={styles.accordionSection}>
            <TouchableOpacity
              onPress={toggleReminders}
              activeOpacity={0.85}
              style={styles.accordionHeader}
            >
              <View style={styles.accordionHeaderLeft}>
                <Text style={styles.accordionHeaderTitle}>Reminders</Text>
                {!remindersOpen && (
                  <Text style={styles.accordionHeaderSubtitle}>
                    {[
                      reminders.mantra_reminder_enabled && "Mantra",
                      reminders.sankalp_reminder_enabled && "Sankalp",
                      reminders.practice_reminder_enabled && "Practice",
                    ]
                      .filter(Boolean)
                      .join(", ") || "None set"}
                  </Text>
                )}
              </View>
              <Ionicons
                name={remindersOpen ? "chevron-up" : "chevron-down"}
                size={18}
                color="#8B7864"
              />
            </TouchableOpacity>

            {remindersOpen && (
              <View style={{ paddingTop: 8 }}>
                {(["mantra", "sankalp", "practice"] as const).map((key) => {
                  const enabled = reminders[
                    `${key}_reminder_enabled`
                  ] as boolean;
                  const time = reminders[`${key}_reminder_time`] as
                    | string
                    | null;
                  const label = key.charAt(0).toUpperCase() + key.slice(1);
                  const displayTime = time
                    ? (() => {
                        const t = time.slice(0, 5);
                        const [h, m] = t.split(":").map(Number);
                        const period = h >= 12 ? "PM" : "AM";
                        const hour = h % 12 === 0 ? 12 : h % 12;
                        return `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
                      })()
                    : null;

                  return (
                    <View
                      key={key}
                      style={[
                        styles.reminderRow,
                        enabled && styles.reminderRowEnabled,
                      ]}
                    >
                      <Text style={styles.reminderRowLabel}>
                        Remind me for {label.toLowerCase()}
                      </Text>
                      <View style={styles.reminderRowRight}>
                        {enabled && displayTime && (
                          <TouchableOpacity
                            onPress={() => setReminderPickerKey(key)}
                            style={styles.reminderTimePill}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.reminderTimePillText}>
                              {displayTime}
                            </Text>
                          </TouchableOpacity>
                        )}
                        <Switch
                          value={enabled}
                          onValueChange={() => void handleReminderToggle(key)}
                          disabled={reminderSaving}
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
                      ? ((reminders?.[`${reminderPickerKey}_reminder_time`] as
                          | string
                          | null) ??
                        TRIAD_REMINDER_DEFAULTS[reminderPickerKey] + ":00")
                      : null
                  }
                  onConfirm={(timeStr) => {
                    if (reminderPickerKey)
                      void handleReminderTime(reminderPickerKey, timeStr);
                  }}
                  onCancel={() => setReminderPickerKey(null)}
                />

                {reminderSaving && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#8B7864",
                      textAlign: "center",
                      marginTop: 4,
                    }}
                  >
                    Saving…
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default InnerPathScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 80,
  },
  allCompleteBlock: {
    backgroundColor: "rgba(29, 186, 122, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(29, 186, 122, 0.35)",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    alignItems: "center",
  },
  allCompleteTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1DBA7A",
    marginBottom: 4,
  },
  allCompleteBody: {
    fontSize: 13,
    color: "#5A6B5A",
    lineHeight: 20,
    textAlign: "center",
  },
  heroBlock: {
    alignItems: "center",
    marginBottom: 26,
    paddingHorizontal: 12,
    // marginTop: -50,
  },
  sparkle: {
    fontSize: 28,
    lineHeight: 28,
    color: Colors.goldBright,
    marginBottom: 14,
  },
  heroTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 24,
    lineHeight: 40,
    color: Colors.brownDeep,
    textAlign: "center",
  },
  supportingLine: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: Colors.textSoft,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 22,
  },
  dayPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(223,205,181,0.95)",
    backgroundColor: "rgba(255,252,246,0.92)",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dayPillText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 13,
    color: "#8B6A2A",
  },
  progressWrap: {
    marginBottom: 20,
  },
  triadStack: {
    gap: 16,
    marginBottom: 28,
  },
  triadCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(242,223,182,0.95)",
    backgroundColor: "rgba(255,253,247,0.74)",
  },
  triadMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    paddingRight: 12,
  },
  triadIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(235,221,194,0.95)",
    backgroundColor: "rgba(255,250,244,0.92)",
    alignItems: "center",
    justifyContent: "center",
  },
  triadCopy: {
    flex: 1,
  },
  triadChevronWrap: {
    width: 28,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  triadLabel: {
    fontFamily: Fonts.sans.bold,
    fontSize: 13,
    letterSpacing: 4,
    color: "rgb(179, 135, 34)",
    marginBottom: 6,
  },
  triadTitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    lineHeight: 30,
    color: Colors.brownDeep,
  },
  triadSubtitle: {
    fontSize: 13,
    lineHeight: 24,
    fontStyle: "italic",
    color: "rgb(165, 122, 43)",
  },
  triadDoneLabel: {
    fontFamily: "Cormorant Garamond",
    fontSize: 12,
    color: "#7A9E7E",
    marginTop: 2,
    letterSpacing: 0.2,
  },
  dividerWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(214,183,130,0.35)",
  },
  dividerLotus: {
    fontSize: 22,
    lineHeight: 22,
    color: Colors.goldBright,
  },
  sectionBlock: {
    marginBottom: 18,
  },
  accordionRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,

    borderBottomColor: "rgba(233,214,179,0.9)",
    borderRadius: 18,
    padding: 10,
  },
  accordionLead: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingRight: 12,
  },
  accordionIcon: {
    fontSize: 22,
    lineHeight: 22,
    color: Colors.goldBright,
    marginRight: 14,
  },
  accordionTitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    lineHeight: 26,
    color: Colors.brownDeep,
  },
  accordionSubtitle: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    lineHeight: 22,
    color: Colors.textSoft,
    marginTop: 4,
  },
  guidanceCard: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(233,214,179,0.9)",
    borderRadius: 22,
    backgroundColor: "rgba(255,251,245,0.88)",
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  guidanceHeader: {
    fontFamily: Fonts.sans.bold,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: Colors.goldBright,
    marginBottom: 14,
  },
  guidanceItemRow: {
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 12,
  },
  guidanceItemBar: {
    width: 2,
    borderRadius: 2,
    backgroundColor: Colors.goldBright,
    marginRight: 14,
    opacity: 0.9,
    alignSelf: "stretch",
    minHeight: 24,
  },
  guidanceItemText: {
    flex: 1,
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    lineHeight: 22,
    color: Colors.textSoft,
  },
  whyHeaderCopy: {
    flex: 1,
  },
  whyPanel: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: "rgba(233,214,179,0.9)",
    borderRadius: 22,
    backgroundColor: "rgba(255,251,245,0.88)",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  whyEyebrow: {
    fontFamily: Fonts.sans.bold,
    fontSize: 12,
    letterSpacing: 3,
    textTransform: "uppercase",
    color: "rgb(179, 135, 34)",
  },
  whyTitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 14,
    lineHeight: 28,
    color: Colors.brownDeep,
    marginBottom: 18,
  },
  whyTabsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
    justifyContent: "center",
  },
  whyTabPill: {
    borderWidth: 1,
    borderColor: "rgba(214,183,130,0.42)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "rgba(255,252,246,0.74)",
  },
  whyTabPillActive: {
    borderColor: "rgba(179,135,34,0.68)",
  },
  whyTabText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: "#7F6A52",
  },
  whyTabTextActive: {
    color: "#8B6A2A",
  },
  whyDivider: {
    height: 1,
    backgroundColor: "rgba(214,183,130,0.36)",
    marginBottom: 18,
  },
  whySectionLabel: {
    fontFamily: Fonts.sans.bold,
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "rgb(179, 135, 34)",
    marginBottom: 10,
  },
  whyItemTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    lineHeight: 26,
    color: Colors.brownDeep,
    marginBottom: 18,
  },
  whyInfoCard: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(230,214,186,0.9)",
    marginBottom: 14,
  },
  whyInfoLabel: {
    fontFamily: Fonts.sans.bold,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#A57A2B",
    marginBottom: 8,
  },
  whyInfoText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    lineHeight: 27,
    color: "#5D5348",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorText: {
    fontSize: 14,
    color: Colors.textSoft,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: Fonts.sans.regular,
  },
  retryBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    backgroundColor: "#C99317",
  },
  retryBtnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: Fonts.sans.bold,
  },
  accordionSection: {
    marginTop: 16,
    marginHorizontal: 0,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,218,169,0.9)",
    borderRadius: 5,
  },
  accordionHeaderLeft: {
    flex: 1,
  },
  accordionHeaderTitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#432104",
  },
  accordionHeaderSubtitle: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#8B7864",
    marginTop: 2,
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    marginBottom: 8,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  reminderRowEnabled: {
    backgroundColor: "rgba(201,168,76,0.08)",
    borderColor: "rgba(201,168,76,0.25)",
  },
  reminderRowLabel: {
    fontFamily: Fonts.serif.regular,
    fontSize: 14,
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
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 4,
  },
  reminderTimePillText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: "#432104",
  },
  iosPicker: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  iosPickerDone: {
    alignItems: "flex-end",
    padding: 10,
    paddingTop: 0,
  },
  iosPickerDoneText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 14,
    color: "#C99317",
  },
});
