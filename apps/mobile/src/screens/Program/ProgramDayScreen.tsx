/**
 * ProgramDayScreen — Gate 3 MOB-4.
 *
 * Forked from InnerPathScreen concept; DO NOT modify InnerPathScreen.
 * Loads day content from GET /api/programs/my-active/day/{N}/ and
 * shows the prescribed mantra, sankalp, and practice for that day.
 *
 * On completing all 3 items → "Complete Day" CTA → ProgramCompletionScreen.
 */
import { Ionicons } from "@expo/vector-icons";
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
  LayoutAnimation,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TimePickerModal } from "../../components/TimePickerModal";
import {
  apiGetProgramReminders,
  apiPatchProgramReminders,
  completeProgramDay,
  fetchProgramDay,
  postProgramActivity,
  type ProgramDayContent,
  type ProgramDayItem,
  type ProgramReminders,
  type ProgramRemindersPatch,
} from "../../engine/programApi";
import { useNotificationPermissionGate } from "../../hooks/useNotificationPermissionGate";
import { Fonts } from "../../theme/fonts";
import {
  setForceFourDoorHome,
  setSkipMitraStart,
} from "../../utils/postLoginGuard";

const SUPPORT_URL = "https://kalpx.com/programs/support";

/** Converts "HH:MM" (24-hour) to "H:MM AM/PM". Returns original string if unparseable. */
function formatSessionTime(time: string): string {
  const parts = time.split(":");
  if (parts.length < 2) return time;
  const h = parseInt(parts[0], 10);
  const m = parts[1];
  if (isNaN(h)) return time;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${m} ${period}`;
}

/** Returns a short human-readable title for the card. */
function getCardTitle(item: ProgramDayItem): string {
  return item.title;
}

function fmt12h(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

function getCardSubtitle(
  item: ProgramDayItem,
  dayContent: ProgramDayContent | null,
): string | null {
  if (!dayContent) return null;
  const parts: string[] = [];
  if (item.item_type === "mantra") {
    if (dayContent.mantra_count) parts.push(`${dayContent.mantra_count}×`);
    if (dayContent.mantra_reminder_time)
      parts.push(`⏰ ${fmt12h(dayContent.mantra_reminder_time)}`);
  } else if (item.item_type === "practice") {
    if (dayContent.practice_duration_minutes)
      parts.push(`${dayContent.practice_duration_minutes} min`);
    if (dayContent.practice_reminder_time)
      parts.push(`⏰ ${fmt12h(dayContent.practice_reminder_time)}`);
  } else if (item.item_type === "sankalp") {
    if (dayContent.sankalp_reminder_time)
      parts.push(`⏰ ${fmt12h(dayContent.sankalp_reminder_time)}`);
  }
  return parts.length > 0 ? parts.join("  ·  ") : null;
}

function ItemCard({
  item,
  label,
  done,
  subtitle,
  onPress,
}: {
  item: ProgramDayItem;
  label: string;
  done: boolean;
  subtitle?: string | null;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[styles.itemCard, done && styles.itemCardDone]}
      accessibilityLabel={`${label}: ${getCardTitle(item)}${done ? " (done)" : ""}`}
    >
      <View style={styles.itemCardLeft}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemTitle}>{getCardTitle(item)}</Text>
        {subtitle ? <Text style={styles.itemSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.itemCardRight}>
        {done ? (
          <Text style={styles.doneCheckmark}>✓</Text>
        ) : (
          <Text style={styles.itemArrow}>→</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ProgramDayScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { dayNumber, completedItems } = route.params ?? {};

  const [dayContent, setDayContent] = useState<ProgramDayContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wisdom inline dropdown
  const [wisdomOpen, setWisdomOpen] = useState(false);

  // Reminder accordion
  const [copiedLink, setCopiedLink] = useState(false);
  const [reminders, setReminders] = useState<ProgramReminders | null>(null);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [reminderSaving, setReminderSaving] = useState(false);
  const [reminderPickerKey, setReminderPickerKey] = useState<
    "mantra" | "sankalp" | "practice" | null
  >(null);

  const { withPermissionCheck, renderPermissionModal } =
    useNotificationPermissionGate();

  const firedAnalyticsRef = useRef(false);
  const dayCompletedRef = useRef(false);

  // Load program reminders on mount
  useEffect(() => {
    apiGetProgramReminders()
      .then(setReminders)
      .catch(() => {});
  }, []);

  const REMINDER_DEFAULTS: Record<"mantra" | "sankalp" | "practice", string> = {
    mantra: "07:00",
    sankalp: "08:00",
    practice: "18:00",
  };

  const toggleReminders = () => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(220, "easeInEaseOut", "opacity"),
    );
    setRemindersOpen((v) => !v);
  };

  async function doReminderToggle(key: "mantra" | "sankalp" | "practice") {
    if (!reminders || reminderSaving) return;
    const currentEnabled = reminders[
      `${key}_reminder_enabled` as keyof ProgramReminders
    ] as boolean;
    const patch: ProgramRemindersPatch = {
      [`${key}_reminder_enabled`]: !currentEnabled,
    };
    if (
      !currentEnabled &&
      !reminders[`${key}_reminder_time` as keyof ProgramReminders]
    ) {
      (patch as any)[`${key}_reminder_time`] = REMINDER_DEFAULTS[key];
    }
    setReminderSaving(true);
    try {
      const updated = await apiPatchProgramReminders(patch);
      setReminders(updated);
    } catch {
      // non-fatal
    } finally {
      setReminderSaving(false);
    }
  }

  async function handleReminderToggle(key: "mantra" | "sankalp" | "practice") {
    if (!reminders || reminderSaving) return;
    const isCurrentlyEnabled = reminders[
      `${key}_reminder_enabled` as keyof ProgramReminders
    ] as boolean;
    if (!isCurrentlyEnabled) {
      await withPermissionCheck(() => doReminderToggle(key));
    } else {
      await doReminderToggle(key);
    }
  }

  async function handleReminderTime(
    key: "mantra" | "sankalp" | "practice",
    timeStr: string,
  ) {
    setReminderPickerKey(null);
    setReminderSaving(true);
    try {
      const updated = await apiPatchProgramReminders({
        [`${key}_reminder_time`]: timeStr,
      } as ProgramRemindersPatch);
      setReminders(updated);
      setDayContent((prev) =>
        prev
          ? { ...prev, [`${key}_reminder_time`]: timeStr.slice(0, 5) }
          : prev,
      );
    } catch {
      // non-fatal
    } finally {
      setReminderSaving(false);
    }
  }

  // Ensure Home shows FourDoor (not "Begin with Mitra") when user navigates back
  useEffect(() => {
    const unsub = navigation.addListener("beforeRemove", () => {
      setSkipMitraStart();
      setForceFourDoorHome();
    });
    return unsub;
  }, [navigation]);

  // completedItems is passed back by each runner and accumulated there.
  // Reading directly from params avoids any stale-state/remount issues.
  const sessionDone = new Set<string>(
    Array.isArray(completedItems) ? completedItems : [],
  );

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          const data = await fetchProgramDay(dayNumber);
          if (!cancelled) {
            setDayContent(data);
            if (!firedAnalyticsRef.current) {
              firedAnalyticsRef.current = true;
              postProgramActivity("program_day_started", {
                day_number: data.day_number,
              }).catch(() => {});
              if (data.day_number === 2) {
                postProgramActivity("program_day_2_started", {
                  day_number: 2,
                }).catch(() => {});
              }
            }
          }
        } catch (err: any) {
          if (cancelled) return;
          const status = err?.response?.status;
          const detail = err?.response?.data?.detail;
          if (status === 403 && detail === "next_day_locked")
            setError(
              "Today's practice is complete. Come back tomorrow for the next day.",
            );
          else if (status === 403) setError("Complete the previous day first.");
          else if (status === 404) setError("Day not found in your program.");
          else setError("Couldn't load today's practice. Please try again.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [dayNumber]),
  );

  const handleLaunchRunner = (item: ProgramDayItem) => {
    const screenMap: Record<string, string> = {
      mantra: "ProgramMantraRunner",
      sankalp: "ProgramSankalpRunner",
      practice: "ProgramPracticeRunner",
    };
    const screen = screenMap[item.item_type];
    if (!screen) return;
    const extraParams: Record<string, any> = {};
    if (item.item_type === "mantra" && dayContent?.mantra_count) {
      extraParams.mantraCount = dayContent.mantra_count;
    }
    if (
      item.item_type === "practice" &&
      dayContent?.practice_duration_minutes
    ) {
      extraParams.practiceDurationMinutes =
        dayContent.practice_duration_minutes;
    }
    navigation.navigate(screen, {
      item,
      dayNumber,
      completedItems: Array.from(sessionDone),
      ...extraParams,
    });
  };

  const allItems = dayContent
    ? ([dayContent.mantra, dayContent.sankalp, dayContent.practice].filter(
        Boolean,
      ) as ProgramDayItem[])
    : [];

  const isItemDone = (item: ProgramDayItem) =>
    dayContent?.is_completed || sessionDone.has(item.item_id);

  const allDone = allItems.length > 0 && allItems.every(isItemDone);

  // All 3 done freshly in this session — call backend once to unlock next day
  const completedInSession =
    allItems.length > 0 && allItems.every((i) => sessionDone.has(i.item_id));

  useEffect(() => {
    if (
      completedInSession &&
      !loading &&
      dayContent &&
      !dayCompletedRef.current
    ) {
      dayCompletedRef.current = true;
      completeProgramDay(dayNumber).catch(() => {});
      // Navigate to reflection screen after a short delay so user sees all checkmarks
      setTimeout(() => {
        navigation.navigate("ProgramReflectionScreen", {
          dayNumber,
          reflectionPrompt: dayContent.reflection_prompt || null,
        });
      }, 800);
    }
  }, [completedInSession, loading, dayContent, dayNumber]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#C99317" />
      </SafeAreaView>
    );
  }

  if (error || !dayContent) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error ?? "Something went wrong."}</Text>
        <TouchableOpacity
          onPress={() => {
            setSkipMitraStart();
            setForceFourDoorHome();
            navigation.goBack();
          }}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const ITEM_LABELS: Record<string, string> = {
    mantra: "Mantra",
    sankalp: "Sankalp",
    practice: "Practice",
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              setSkipMitraStart();
              setForceFourDoorHome();
              navigation.goBack();
            }}
            style={styles.backIcon}
          >
            {/* <Text style={styles.backIconText}>‹</Text> */}
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.dayLabel}>DAY {dayContent.day_number}</Text>
            <Text style={styles.themeText}>{dayContent.theme}</Text>
            {dayContent.wisdom_card ? (
              <TouchableOpacity
                onPress={() => setWisdomOpen((v) => !v)}
                activeOpacity={0.82}
                style={styles.wisdomInline}
              >
                <Text style={styles.wisdomInlineLabel}>WISDOM OF THE DAY</Text>
                <View style={styles.wisdomInlineRow}>
                  <Text
                    style={styles.wisdomInlineTitle}
                    numberOfLines={wisdomOpen ? undefined : 2}
                  >
                    {dayContent.wisdom_card.text}
                  </Text>
                  <Ionicons
                    name={wisdomOpen ? "chevron-up" : "chevron-down"}
                    size={14}
                    color="#9A7548"
                    style={{ marginLeft: 6 }}
                  />
                </View>
                {wisdomOpen &&
                (dayContent.wisdom_card.explanation?.[0] ?? null) ? (
                  <Text style={styles.wisdomInlineBody}>
                    {dayContent.wisdom_card.explanation![0]}
                  </Text>
                ) : null}
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Item cards */}
        <View style={styles.itemsSection}>
          {allItems.map((item) => (
            <ItemCard
              key={item.item_id}
              item={item}
              label={ITEM_LABELS[item.item_type] ?? item.item_type}
              done={isItemDone(item)}
              subtitle={getCardSubtitle(item, dayContent)}
              onPress={() => handleLaunchRunner(item)}
            />
          ))}
        </View>

        {/* Live session */}
        {dayContent.day_join_url ? (
          <TouchableOpacity
            style={styles.liveSessionCard}
            onPress={() => Linking.openURL(dayContent.day_join_url!)}
            activeOpacity={0.82}
            accessibilityLabel="Join live session"
          >
            <View style={styles.liveSessionLeft}>
              <Text style={styles.liveSessionLabel}>LIVE SESSION</Text>
              {dayContent.day_session_time ? (
                <Text style={styles.liveSessionTime}>
                  {formatSessionTime(dayContent.day_session_time)}
                  {dayContent.day_session_timezone
                    ? ` ${dayContent.day_session_timezone}`
                    : ""}
                </Text>
              ) : null}
              <Text style={styles.liveSessionLink}>Tap to join →</Text>
              <View style={styles.liveSessionUrlRow}>
                <Text
                  style={styles.liveSessionUrl}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  {dayContent.day_join_url}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Clipboard.setString(dayContent.day_join_url!);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  style={styles.copyBtn}
                  activeOpacity={0.7}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.copyBtnText}>
                    {copiedLink ? "Copied!" : "Copy"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Reflection prompt */}
        {dayContent.reflection_prompt ? (
          <TouchableOpacity
            activeOpacity={0.82}
            style={styles.reflectionCard}
            onPress={() =>
              navigation.navigate("ProgramReflectionScreen", {
                dayNumber,
                reflectionPrompt: dayContent.reflection_prompt,
              })
            }
          >
            <Text style={styles.reflectionLabel}> REFLECTION</Text>
            <Text style={styles.reflectionText}>
              {dayContent.reflection_prompt}
            </Text>
            <Text style={styles.reflectionHint}>
              Tap to write your reflection →
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* Reminders accordion */}
        {reminders !== null && (
          <View style={styles.remindersCard}>
            <TouchableOpacity
              onPress={toggleReminders}
              activeOpacity={0.85}
              style={styles.remindersHeader}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.remindersTitle}>Reminders</Text>
                {!remindersOpen && (
                  <Text style={styles.remindersSub}>
                    {(["mantra", "sankalp", "practice"] as const)
                      .filter((k) => reminders[`${k}_reminder_enabled`])
                      .map((k) => k.charAt(0).toUpperCase() + k.slice(1))
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
              <View style={styles.remindersBody}>
                {(["mantra", "sankalp", "practice"] as const).map((key) => {
                  const enabled = reminders[
                    `${key}_reminder_enabled`
                  ] as boolean;
                  const time = reminders[`${key}_reminder_time`] as
                    | string
                    | null;
                  const displayTime = time
                    ? (() => {
                        const [h, m] = time.slice(0, 5).split(":").map(Number);
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
                        {key.charAt(0).toUpperCase() + key.slice(1)} reminder
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
                      ? (reminders?.[
                          `${reminderPickerKey}_reminder_time` as keyof ProgramReminders
                        ] as string | null)
                        ? (reminders![
                            `${reminderPickerKey}_reminder_time` as keyof ProgramReminders
                          ] as string) + ":00"
                        : REMINDER_DEFAULTS[reminderPickerKey] + ":00"
                      : null
                  }
                  onConfirm={(timeStr) => {
                    if (reminderPickerKey)
                      void handleReminderTime(reminderPickerKey, timeStr);
                  }}
                  onCancel={() => setReminderPickerKey(null)}
                />

                {reminderSaving && (
                  <Text style={styles.reminderSavingText}>Saving…</Text>
                )}
              </View>
            )}
          </View>
        )}
        {renderPermissionModal()}

        {allDone ? (
          <View style={styles.completionBanner}>
            <Text style={styles.completionTitle}>
              Day {dayContent.day_number} Complete ✓
            </Text>
            <Text style={styles.completionSub}>
              Tap any practice to do it again
            </Text>
          </View>
        ) : (
          <Text style={styles.progressHint}>
            {allItems.filter(isItemDone).length}/{allItems.length} done —
            complete all to finish the day
          </Text>
        )}

        {/* Support footer */}
        <TouchableOpacity
          style={styles.supportLink}
          onPress={() =>
            Alert.alert(
              "Need help?",
              "Visit kalpx.com/programs/support for help with your program.",
              [{ text: "OK" }],
            )
          }
          accessibilityLabel="Program support"
        >
          <Text style={styles.supportLinkText}>Need help? Get support →</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FAF7F2" },
  center: {
    flex: 1,
    backgroundColor: "#FAF7F2",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  scroll: { paddingBottom: 60, paddingHorizontal: 20 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 20,
  },
  backIcon: { width: 40, alignItems: "flex-start" },
  backIconText: { fontSize: 32, color: "#432104", lineHeight: 36 },
  headerCenter: { flex: 1, alignItems: "center" },
  dayLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: "#9A7548",
    letterSpacing: 0.06,
    marginBottom: 4,
  },
  themeText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 20,
    color: "#432104",
    textAlign: "center",
  },

  itemsSection: { gap: 12, marginBottom: 24 },

  itemCard: {
    backgroundColor: "#FFF8EE",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemCardDone: {
    backgroundColor: "#F0EAD8",
    borderColor: "#C99317",
  },
  itemCardLeft: { flex: 1 },
  itemLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: "#9A7548",
    letterSpacing: 0.05,
    marginBottom: 4,
  },
  itemTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    color: "#432104",
    marginBottom: 2,
  },
  itemSubtitle: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: "#9A7548",
    marginTop: 2,
  },
  itemDevanagari: {
    fontFamily: Fonts.devanagari.regular,
    fontSize: 15,
    color: "#7B6545",
    lineHeight: 22,
  },
  itemCardRight: { marginLeft: 12 },
  doneCheckmark: { fontSize: 22, color: "#C99317", fontWeight: "700" },
  itemArrow: { fontSize: 22, color: "#C99317" },

  wisdomInline: {
    marginTop: 12,
    alignSelf: "stretch",
    backgroundColor: "#FFF8EE",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 14,
    alignItems: "center",
  },
  wisdomInlineLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 10,
    color: "#9A7548",
    letterSpacing: 0.08,
    textAlign: "center",
    marginBottom: 5,
  },
  wisdomInlineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  wisdomInlineTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 15,
    color: "#432104",
    textAlign: "center",
    flexShrink: 1,
  },
  wisdomInlineBody: {
    marginTop: 10,
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#7B6545",
    lineHeight: 20,
    textAlign: "center",
  },
  liveSessionCard: {
    backgroundColor: "#FFF3DC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C99317",
    padding: 16,
    marginBottom: 12,
  },
  liveSessionLeft: { flex: 1 },
  liveSessionLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 10,
    color: "#9A7548",
    letterSpacing: 0.06,
    marginBottom: 6,
  },
  liveSessionTime: {
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    color: "#432104",
    marginBottom: 4,
  },
  liveSessionLink: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: "#C99317",
  },
  liveSessionUrlRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 8,
  },
  liveSessionUrl: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    color: "#9A7548",
    flex: 1,
  },
  copyBtn: {
    backgroundColor: "#FFF3DC",
    borderWidth: 1,
    borderColor: "#C99317",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  copyBtnText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: "#C99317",
  },
  reflectionCard: {
    backgroundColor: "#FFF8EE",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 16,
    marginBottom: 24,
  },
  reflectionLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 10,
    color: "#9A7548",
    letterSpacing: 0.06,
    marginBottom: 6,
  },
  reflectionText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#432104",
    lineHeight: 21,
  },
  reflectionHint: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: "#C99317",
    marginTop: 10,
  },

  completionBanner: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 8,
  },
  completionTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 20,
    color: "#C99317",
    marginBottom: 6,
  },
  completionSub: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#9A7548",
  },

  progressHint: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#9A7548",
    textAlign: "center",
    marginBottom: 16,
  },

  remindersCard: {
    backgroundColor: "#FFF8EE",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    marginBottom: 16,
    overflow: "hidden",
  },
  remindersHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  remindersTitle: {
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    color: "#432104",
    marginBottom: 2,
  },
  remindersSub: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "#8B7864",
  },
  remindersBody: { paddingHorizontal: 16, paddingBottom: 12, gap: 4 },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  reminderRowEnabled: { backgroundColor: "rgba(201,147,23,0.08)" },
  reminderRowLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#432104",
    flex: 1,
  },
  reminderRowRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  reminderTimePill: {
    backgroundColor: "#C99317",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  reminderTimePillText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: "#fff",
  },
  reminderSavingText: {
    fontSize: 12,
    color: "#8B7864",
    textAlign: "center",
    marginTop: 4,
  },

  supportLink: { alignItems: "center", paddingVertical: 12 },
  supportLinkText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: "#9A7548",
    textDecorationLine: "underline",
  },

  errorText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#432104",
    textAlign: "center",
    marginBottom: 20,
  },
  backBtn: { paddingVertical: 12, paddingHorizontal: 24 },
  backBtnText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    color: "#C99317",
  },
});
