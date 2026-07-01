/**
 * ProgramCard — Gate 3 MOB-8.
 *
 * Shown on Home when GET /api/programs/my-active/ returns non-null.
 * Tapping the header toggles an inline day list. Each day renders one of
 * five states: locked | today | completed | missed | completed_later.
 */
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import {
  type ActiveProgramSummary,
  type DayStatus,
} from "../../engine/programApi";
import { Fonts } from "../../theme/fonts";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ProgramCardProps {
  program: ActiveProgramSummary;
}

function isUnlocksTomorrow(unlockDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(unlockDate + "T00:00:00");
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  return diffDays === 1;
}

function getDayIcon(s: DayStatus) {
  if (s === "completed") return <Text style={styles.iconDone}>✓</Text>;
  if (s === "completed_later") return <View style={styles.iconLateDot} />;
  if (s === "today") return <View style={styles.iconActiveDot} />;
  if (s === "missed") return <Text style={styles.iconMissed}>!</Text>;
  return <Text style={styles.iconLock}>🔒</Text>;
}

function getDayLabelStyle(s: DayStatus) {
  if (s === "completed") return styles.dayLabelDone;
  if (s === "completed_later") return styles.dayLabelLate;
  if (s === "today") return styles.dayLabelActive;
  if (s === "missed") return styles.dayLabelMissed;
  return styles.dayLabelLocked;
}

function CompletedProgramCard({ program }: ProgramCardProps) {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);
  const totalDays = program.total_days ?? program.current_day;
  if (dismissed) return null;
  return (
    <View style={styles.completedCard}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => setDismissed(true)} hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}>
        <Text style={styles.closeBtnText}>✕</Text>
      </TouchableOpacity>
      <View style={styles.completedTop}>
        {/* <View style={styles.emojiWrap}>
          <Text style={styles.emoji}>🎉</Text>
        </View> */}
        <View style={styles.completedInfo}>
          <Text style={styles.completedTitle}>
            {t("programCard.journeyComplete")}
          </Text>
          <Text style={styles.completedName} numberOfLines={2}>
            {program.name}
          </Text>
          <Text style={styles.completedSub}>
            {t("programCard.congratulations", { n: totalDays })}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.btnPrimary}
        activeOpacity={0.85}
        onPress={() =>
          navigation.navigate("MyProgramsScreen" as any, {
            initialTab: "completed",
          })
        }
      >
        <Text style={styles.btnPrimaryText}>
          {t("programCard.viewSummary")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.btnOutline}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("MyProgramsScreen" as any)}
      >
        <Text style={styles.btnOutlineText}>
          {t("programCard.exploreAnother")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default function ProgramCard({ program }: ProgramCardProps) {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);

  if (program.status === "completed") {
    return <CompletedProgramCard program={program} />;
  }

  const isCompleted = false;
  const days = program.day_statuses ?? [];
  const totalDays =
    days.length > 0
      ? days.length
      : program.current_day + (program.days_remaining ?? 0);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  const handleDayPress = (dayNumber: number) => {
    navigation.navigate("ProgramDayScreen" as any, { dayNumber });
  };

  // Build subtitle
  let subtitle: string;
  if (isCompleted) {
    subtitle = t("programCard.complete");
  } else if (days.length > 0) {
    const firstMissed = days.find((d) => d.status === "missed");
    const todayDay = days.find((d) => d.status === "today");
    if (firstMissed) {
      subtitle = t("programCard.dayMissed", { n: firstMissed.day_number });
    } else if (todayDay) {
      subtitle = t("programCard.dayContinue", { n: todayDay.day_number });
    } else {
      subtitle = t("programCard.dayContinue", { n: program.current_day + 1 });
    }
  } else {
    // Legacy fallback (no day_statuses from API yet)
    const isNextDayLocked = !isCompleted && !!program.next_day_locked;
    subtitle = isNextDayLocked
      ? t("programCard.dayCompletedLocked", {
          n: program.current_day,
          next: program.current_day + 1,
        })
      : t("programCard.dayContinue", { n: program.current_day + 1 });
  }

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity
        onPress={toggleExpand}
        activeOpacity={0.85}
        style={styles.header}
        accessibilityLabel={`${program.name} — tap to ${expanded ? "collapse" : "expand"} day list`}
        testID="program_card"
      >
        <View style={styles.headerLeft}>
          <Text style={styles.label}>{t("programCard.label")}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {program.name}
          </Text>
          <Text style={styles.status}>{subtitle}</Text>
        </View>
        <Text style={styles.chevron}>{expanded ? "▾" : "▸"}</Text>
      </TouchableOpacity>

      {/* Expanded day list */}
      {expanded && (
        <View style={styles.dayList}>
          {days.length > 0
            ? (() => {
                const firstLockedIdx = days.findIndex(
                  (d) => d.status === "locked",
                );
                return days.map((day, idx) => {
                  const tappable = day.status !== "locked";
                  const isLast = idx === days.length - 1;
                  return (
                    <TouchableOpacity
                      key={day.day_number}
                      onPress={() => tappable && handleDayPress(day.day_number)}
                      activeOpacity={tappable ? 0.7 : 1}
                      disabled={!tappable}
                      style={[styles.dayRow, !isLast && styles.dayRowBorder]}
                    >
                      <View style={styles.dayIconWrap}>
                        {getDayIcon(day.status)}
                      </View>
                      <View style={styles.dayMid}>
                        <Text
                          style={[
                            styles.dayLabel,
                            getDayLabelStyle(day.status),
                          ]}
                        >
                          {t("programCard.day", { n: day.day_number })}
                        </Text>
                        {day.status === "completed" && (
                          <Text style={styles.dayHintDone}>
                            {t("programCard.statusCompleted")}
                          </Text>
                        )}
                        {day.status === "today" && (
                          <Text style={styles.dayHintToday}>
                            {t("programCard.statusToday")}
                          </Text>
                        )}
                        {day.status === "missed" && (
                          <Text style={styles.dayHintMissed}>
                            {t("programCard.statusMissed")}
                          </Text>
                        )}
                        {day.status === "completed_later" && (
                          <Text style={styles.dayHintLate}>
                            {t("programCard.statusLater")}
                          </Text>
                        )}
                        {day.status === "locked" &&
                          idx === firstLockedIdx &&
                          isUnlocksTomorrow(day.unlock_date) && (
                            <Text style={styles.dayHint}>
                              {t("programCard.unlocksTomorrow")}
                            </Text>
                          )}
                      </View>
                      {tappable && <Text style={styles.dayArrow}>→</Text>}
                    </TouchableOpacity>
                  );
                });
              })()
            : // Legacy fallback rendering (no day_statuses)
              Array.from({ length: totalDays }, (_, i) => i + 1).map(
                (dayNum) => {
                  const done = isCompleted || dayNum <= program.current_day;
                  const active =
                    !isCompleted &&
                    dayNum === program.current_day + 1 &&
                    !program.next_day_locked;
                  const tappable = done || active;
                  return (
                    <TouchableOpacity
                      key={dayNum}
                      onPress={() => tappable && handleDayPress(dayNum)}
                      activeOpacity={tappable ? 0.7 : 1}
                      disabled={!tappable}
                      style={[
                        styles.dayRow,
                        dayNum < totalDays && styles.dayRowBorder,
                      ]}
                    >
                      <View style={styles.dayIconWrap}>
                        {done ? (
                          <Text style={styles.iconDone}>✓</Text>
                        ) : active ? (
                          <View style={styles.iconActiveDot} />
                        ) : (
                          <Text style={styles.iconLock}>🔒</Text>
                        )}
                      </View>
                      <View style={styles.dayMid}>
                        <Text
                          style={[
                            styles.dayLabel,
                            done && styles.dayLabelDone,
                            active && styles.dayLabelActive,
                            !done && !active && styles.dayLabelLocked,
                          ]}
                        >
                          {t("programCard.day", { n: dayNum })}
                        </Text>
                        {!done &&
                          !active &&
                          dayNum === program.current_day + 1 &&
                          program.next_day_locked && (
                            <Text style={styles.dayHint}>
                              {t("programCard.unlocksTomorrow")}
                            </Text>
                          )}
                      </View>
                      {tappable && <Text style={styles.dayArrow}>→</Text>}
                    </TouchableOpacity>
                  );
                },
              )}

          {isCompleted && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("ProgramDay8TransitionScreen" as any)
              }
              activeOpacity={0.85}
              style={styles.nextStepRow}
            >
              <Text style={styles.nextStepText}>
                {t("programCard.chooseNextStep")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Completed celebration card
  completedCard: {
    backgroundColor: "#F0F7EE",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#A5C9A1",
    padding: 16,
    gap: 10,
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 12,
    zIndex: 1,
  },
  closeBtnText: {
    fontSize: 14,
    color: "#7A9E78",
    fontWeight: "600",
  },
  completedTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 4,
  },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DCF0D8",
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: { fontSize: 22 },
  completedInfo: { flex: 1 },
  completedTitle: {
    fontFamily: Fonts.sans.bold,
    fontSize: 13,
    color: "#2E7D32",
    marginBottom: 2,
  },
  completedName: {
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    color: "#1B3A1F",
    marginBottom: 4,
  },
  completedSub: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "#4A6741",
  },
  btnPrimary: {
    backgroundColor: "#2E5723",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  btnPrimaryText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 14,
    color: "#FFFFFF",
  },
  btnOutline: {
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#2E5723",
    paddingVertical: 11,
    alignItems: "center",
  },
  btnOutlineText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#2E5723",
  },

  card: {
    backgroundColor: "#FFF8EE",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C99317",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  headerLeft: { flex: 1, paddingRight: 12 },
  label: {
    fontFamily: Fonts.sans.medium,
    fontSize: 10,
    color: "#9A7548",
    letterSpacing: 0.06,
    marginBottom: 4,
  },
  name: {
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    color: "#432104",
    marginBottom: 3,
  },
  status: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#7B6545",
  },
  chevron: {
    fontSize: 18,
    color: "#C99317",
    fontWeight: "600",
  },

  // Day list
  dayList: {
    borderTopWidth: 1,
    borderTopColor: "#EEE3CC",
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    paddingHorizontal: 18,
    gap: 12,
  },
  dayRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#EEE3CC",
  },
  dayIconWrap: {
    width: 24,
    alignItems: "center",
  },
  iconDone: {
    fontSize: 15,
    color: "#2E7D32",
    fontWeight: "700",
  },
  iconLateDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2980B9",
  },
  iconActiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#C99317",
  },
  iconMissed: {
    fontSize: 15,
    color: "#C0392B",
    fontWeight: "700",
  },
  iconLock: {
    fontSize: 13,
  },
  dayMid: { flex: 1 },
  dayLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#432104",
  },
  dayLabelDone: { color: "#4A6741" },
  dayLabelLate: { color: "#2980B9" },
  dayLabelActive: { color: "#8B5E00", fontFamily: Fonts.sans.bold },
  dayLabelMissed: { color: "#C0392B" },
  dayLabelLocked: { color: "#B5A08A" },
  dayHint: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    color: "#B5A08A",
    marginTop: 2,
  },
  dayHintDone: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    color: "#4A6741",
    marginTop: 2,
  },
  dayHintToday: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    color: "#8B5E00",
    marginTop: 2,
  },
  dayHintMissed: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    color: "#C0392B",
    marginTop: 2,
  },
  dayHintLate: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    color: "#2980B9",
    marginTop: 2,
  },
  dayArrow: {
    fontSize: 16,
    color: "#C99317",
  },

  // Completed CTA
  nextStepRow: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#EEE3CC",
  },
  nextStepText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#C99317",
    fontWeight: "600",
  },
});
