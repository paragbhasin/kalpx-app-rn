import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import type { JourneyTriadReminders, JourneyTriadRemindersPatch, RhythmItem, RhythmTimeBand } from "@kalpx/types";
import {
  apiGetJourneyReminders,
  apiPatchJourneyReminders,
  mitraJourneyHomeV3 as getMitraHomeV3,
  patchRhythmItem,
} from "../../engine/mitraApi";
import type { AppDispatch, RootState } from "../../store";
import { setHomeData } from "../../store/doorSlice";
import { TimePickerModal } from "../../components/TimePickerModal";
import { Colors } from "../../theme/colors";
import { Fonts } from "../../theme/fonts";
import { useSafeAreaInsets, SafeAreaView } from "react-native-safe-area-context";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TRIAD_DEFAULTS: Record<string, string> = {
  mantra: "07:00",
  sankalp: "08:00",
  practice: "18:00",
};

function formatTime(hms: string | null, setTimeLabel: string): string {
  if (!hms) return setTimeLabel;
  const [h, m] = hms.split(":").map(Number);
  const suffix = h < 12 ? "AM" : "PM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}


// ── Section header ─────────────────────────────────────────────────────────────
function SectionHeader({ label }: { label: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionLine} />
      <View style={styles.sectionLabelRow}>
        <Ionicons name="notifications-outline" size={12} color={Colors.goldBright} />
        <Text style={styles.sectionLabel}>{label}</Text>
      </View>
      <View style={styles.sectionLine} />
    </View>
  );
}

// ── Band sub-label ─────────────────────────────────────────────────────────────
function BandLabel({ label }: { label: string }) {
  return <Text style={styles.bandLabel}>{label}</Text>;
}

// ── Reminder row ──────────────────────────────────────────────────────────────
function ReminderRow({
  label,
  enabled,
  time,
  saving,
  onToggle,
  onTimePillPress,
}: {
  label: string;
  enabled: boolean;
  time: string | null;
  saving: boolean;
  onToggle: () => void;
  onTimePillPress: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={[styles.row, saving && styles.rowSaving]}>
      <Text style={styles.rowLabel} numberOfLines={1}>{label}</Text>
      {enabled && (
        <Pressable onPress={onTimePillPress} style={styles.timePill}>
          <Text style={styles.timePillText}>{formatTime(time, t('remindersScreen.setTime'))}</Text>
        </Pressable>
      )}
      {!enabled && time && (
        <View style={[styles.timePill, styles.timePillDisabled]}>
          <Text style={[styles.timePillText, styles.timePillTextDisabled]}>{formatTime(time, t('remindersScreen.setTime'))}</Text>
        </View>
      )}
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: "#D9D0C7", true: Colors.goldBright }}
        thumbColor="#fff"
        ios_backgroundColor="#D9D0C7"
      />
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function RemindersScreen() {
  const { t } = useTranslation();
  const navigation: any = useNavigation();
  const dispatch = useDispatch<AppDispatch>();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const homeData = useSelector((s: RootState) => s.door.homeData);

  const [reminders, setReminders] = useState<JourneyTriadReminders | null>(null);
  const [remindersLoading, setRemindersLoading] = useState(true);
  const [triadSavingKey, setTriadSavingKey] = useState<string | null>(null);
  const [rhythmSavingId, setRhythmSavingId] = useState<number | null>(null);

  // Picker state
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerInitialTime, setPickerInitialTime] = useState<string | null>(null);
  const pickerCallback = useRef<((timeStr: string) => void) | null>(null);

  useEffect(() => {
    apiGetJourneyReminders()
      .then(setReminders)
      .catch(() => setReminders(null))
      .finally(() => setRemindersLoading(false));
  }, []);

  useEffect(() => {
    if (homeData) return;
    getMitraHomeV3()
      .then((d) => dispatch(setHomeData(d)))
      .catch(() => {});
  }, [homeData, dispatch]);

  function openPicker(initialTime: string | null, fallback: string, onConfirm: (timeStr: string) => void) {
    setPickerInitialTime(initialTime ?? fallback);
    pickerCallback.current = onConfirm;
    setPickerVisible(true);
  }

  // ── Triad handlers ────────────────────────────────────────────────────────
  async function handleTriadToggle(key: "mantra" | "sankalp" | "practice") {
    if (!reminders) return;
    const enabledKey = `${key}_reminder_enabled` as keyof JourneyTriadReminders;
    const timeKey = `${key}_reminder_time` as keyof JourneyTriadReminders;
    const isEnabled = reminders[enabledKey] as boolean;
    const currentTime = reminders[timeKey] as string | null;

    const patch: JourneyTriadRemindersPatch = {
      [`${key}_reminder_enabled`]: !isEnabled,
      [`${key}_reminder_time`]: currentTime ?? (TRIAD_DEFAULTS[key] + ":00"),
    };
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setTriadSavingKey(key);
    const prev = reminders;
    setReminders({ ...reminders, ...patch } as JourneyTriadReminders);
    try {
      const updated = await apiPatchJourneyReminders(patch);
      setReminders(updated);
    } catch {
      setReminders(prev);
    } finally {
      setTriadSavingKey(null);
    }
  }

  function handleTriadTimePill(key: "mantra" | "sankalp" | "practice") {
    const timeKey = `${key}_reminder_time` as keyof JourneyTriadReminders;
    const current = reminders?.[timeKey] as string | null;
    openPicker(current, TRIAD_DEFAULTS[key] + ":00", async (timeStr) => {
      const patch: JourneyTriadRemindersPatch = { [`${key}_reminder_time`]: timeStr };
      setTriadSavingKey(key);
      const prev = reminders;
      setReminders((r) => r ? { ...r, [`${key}_reminder_time`]: timeStr } : r);
      try {
        const updated = await apiPatchJourneyReminders(patch);
        setReminders(updated);
      } catch {
        setReminders(prev);
      } finally {
        setTriadSavingKey(null);
      }
    });
  }

  // ── Rhythm handlers ───────────────────────────────────────────────────────
  async function handleRhythmToggle(item: RhythmItem) {
    setRhythmSavingId(item.rhythm_item_id);
    try {
      await patchRhythmItem(item.rhythm_item_id, {
        reminder_enabled: !item.reminder_enabled,
        reminder_time: item.reminder_time ?? "07:00:00",
      });
      const fresh = await getMitraHomeV3({ forceFresh: true });
      dispatch(setHomeData(fresh));
    } catch {
    } finally {
      setRhythmSavingId(null);
    }
  }

  function handleRhythmTimePill(item: RhythmItem) {
    openPicker(item.reminder_time, "07:00:00", async (timeStr) => {
      setRhythmSavingId(item.rhythm_item_id);
      try {
        await patchRhythmItem(item.rhythm_item_id, { reminder_time: timeStr });
        const fresh = await getMitraHomeV3({ forceFresh: true });
        dispatch(setHomeData(fresh));
      } catch {
      } finally {
        setRhythmSavingId(null);
      }
    });
  }

  const hasJourney = reminders?.has_journey ?? false;
  const hasRhythm = homeData?.companion_rhythm?.has_rhythm ?? false;
  const rhythmBands: RhythmTimeBand[] = ["morning", "afternoon", "night"];
  const allRhythmItems = rhythmBands.flatMap(
    (band) => homeData?.companion_rhythm?.[band]?.items ?? []
  );
  const neitherSetUp = !remindersLoading && !hasJourney && !hasRhythm;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarHeight + insets.bottom + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.topBar}>
          <Text style={styles.pageTitle}>{t('remindersScreen.title')}</Text>
        </View>

        <Text style={styles.subtitle}>{t('remindersScreen.subtitle')}</Text>

        {/* ── Inner Path section ── */}
        {!remindersLoading && hasJourney && (
          <>
            <SectionHeader label={t('remindersScreen.innerPath')} />
            {(["mantra", "sankalp", "practice"] as const).map((key) => (
              <ReminderRow
                key={key}
                label={t(`remindersScreen.triad.${key}`)}
                enabled={(reminders?.[`${key}_reminder_enabled`] as boolean) ?? false}
                time={(reminders?.[`${key}_reminder_time`] as string | null) ?? null}
                saving={triadSavingKey === key}
                onToggle={() => void handleTriadToggle(key)}
                onTimePillPress={() => handleTriadTimePill(key)}
              />
            ))}
          </>
        )}

        {/* ── Daily Rhythm section ── */}
        {hasRhythm && allRhythmItems.length > 0 && (
          <>
            <SectionHeader label={t('remindersScreen.dailyRhythm')} />
            {rhythmBands.map((band) => {
              const items = homeData?.companion_rhythm?.[band]?.items ?? [];
              if (items.length === 0) return null;
              return (
                <View key={band}>
                  <BandLabel label={t(`remindersScreen.band.${band}`)} />
                  {items.map((item) => (
                    <ReminderRow
                      key={item.rhythm_item_id}
                      label={item.title_snapshot}
                      enabled={item.reminder_enabled}
                      time={item.reminder_time}
                      saving={rhythmSavingId === item.rhythm_item_id}
                      onToggle={() => void handleRhythmToggle(item)}
                      onTimePillPress={() => handleRhythmTimePill(item)}
                    />
                  ))}
                </View>
              );
            })}
          </>
        )}

        {/* ── Empty state ── */}
        {neitherSetUp && (
          <View style={styles.emptyCard}>
            <Ionicons name="notifications-outline" size={36} color={Colors.goldBright} />
            <Text style={styles.emptyTitle}>{t('remindersScreen.emptyTitle')}</Text>
            <Text style={styles.emptyBody}>
              {t('remindersScreen.emptyBody')}
            </Text>
          </View>
        )}

        {/* ── No journey hint ── */}
        {!remindersLoading && !hasJourney && hasRhythm && (
          <View style={styles.hintCard}>
            <Text style={styles.hintText}>
              {t('remindersScreen.hintText')}
            </Text>
          </View>
        )}
      </ScrollView>

      <TimePickerModal
        visible={pickerVisible}
        initialTime={pickerInitialTime}
        onConfirm={(timeStr) => {
          pickerCallback.current?.(timeStr);
          setPickerVisible(false);
        }}
        onCancel={() => setPickerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.parchment,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 60,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  pageTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 28,
    color: "#432104",
    textAlign: "center",
    flex: 1,
  },
  subtitle: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: Colors.brownMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 8,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(201,168,76,0.25)",
  },
  sectionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  sectionLabel: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: Colors.goldBright,
    textTransform: "uppercase",
  },
  bandLabel: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: Colors.brownMuted,
    textTransform: "uppercase",
    marginTop: 12,
    marginBottom: 6,
    marginLeft: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFDF7",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.22)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 10,
  },
  rowSaving: {
    opacity: 0.65,
  },
  rowLabel: {
    flex: 1,
    fontFamily: Fonts.serif.bold,
    fontSize: 17,
    color: "#432104",
  },
  timePill: {
    backgroundColor: "rgba(201,168,76,0.18)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.28)",
  },
  timePillDisabled: {
    backgroundColor: "rgba(0,0,0,0.04)",
    borderColor: "rgba(0,0,0,0.08)",
  },
  timePillText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 13,
    color: "#432104",
  },
  timePillTextDisabled: {
    color: Colors.brownMuted,
  },
  emptyCard: {
    marginTop: 48,
    alignItems: "center",
    backgroundColor: "#FFFDF7",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.22)",
    padding: 36,
    gap: 10,
  },
  emptyTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 20,
    color: "#432104",
    textAlign: "center",
  },
  emptyBody: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: Colors.brownMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  hintCard: {
    marginTop: 16,
    backgroundColor: "rgba(201,168,76,0.12)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(201,168,76,0.25)",
    padding: 14,
  },
  hintText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: Colors.brownMuted,
    lineHeight: 20,
  },
  iosPickerSheet: {
    backgroundColor: "#FFFDF7",
    borderTopWidth: 1,
    borderTopColor: "rgba(201,168,76,0.25)",
    paddingBottom: 20,
  },
  iosDoneBtn: {
    alignSelf: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  iosDoneBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: Colors.goldBright,
  },
});
