/**
 * ProgramCard — Gate 3 MOB-8.
 *
 * Shown on Home when GET /api/programs/my-active/ returns non-null.
 * Tapping the header toggles an inline day list. Each day renders one of
 * five states: locked | today | completed | missed | completed_later.
 */
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { Fonts } from "../../theme/fonts";
import { type ActiveProgramSummary, type DayStatus } from "../../engine/programApi";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ProgramCardProps {
  program: ActiveProgramSummary;
}

function lockedHint(unlockDate: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(unlockDate + "T00:00:00");
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (diffDays === 1) return "Unlocks tomorrow";
  if (diffDays === 2) return "Unlocks in 2 days";
  return `Unlocks ${unlockDate}`;
}

function getDayIcon(s: DayStatus) {
  if (s === "completed") return <Text style={styles.iconDone}>✓</Text>;
  if (s === "completed_later") return <Text style={styles.iconDoneLate}>✓</Text>;
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

export default function ProgramCard({ program }: ProgramCardProps) {
  const navigation = useNavigation<any>();
  const [expanded, setExpanded] = useState(false);

  const isCompleted = program.status === "completed" && program.show_day8_transition;
  const days = program.day_statuses ?? [];
  const totalDays = days.length > 0
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
    subtitle = "Complete · Choose your next step";
  } else if (days.length > 0) {
    const firstMissed = days.find((d) => d.status === "missed");
    const todayDay = days.find((d) => d.status === "today");
    if (firstMissed) {
      subtitle = `Day ${firstMissed.day_number} missed · Complete it now`;
    } else if (todayDay) {
      subtitle = `Day ${todayDay.day_number} · Continue your practice`;
    } else {
      subtitle = `Day ${program.current_day + 1} · Continue your practice`;
    }
  } else {
    // Legacy fallback (no day_statuses from API yet)
    const isNextDayLocked = !isCompleted && !!program.next_day_locked;
    subtitle = isNextDayLocked
      ? `Day ${program.current_day} Complete ✓ · Day ${program.current_day + 1} unlocks tomorrow`
      : `Day ${program.current_day + 1} · Continue your practice`;
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
          <Text style={styles.label}>PRACTICE PROGRAM</Text>
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
            ? days.map((day, idx) => {
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
                      <Text style={[styles.dayLabel, getDayLabelStyle(day.status)]}>
                        Day {day.day_number}
                      </Text>
                      {day.status === "missed" && (
                        <Text style={styles.dayHintMissed}>Missed</Text>
                      )}
                      {day.status === "completed_later" && (
                        <Text style={styles.dayHintLate}>Completed</Text>
                      )}
                      {day.status === "locked" && (
                        <Text style={styles.dayHint}>{lockedHint(day.unlock_date)}</Text>
                      )}
                    </View>
                    {tappable && <Text style={styles.dayArrow}>→</Text>}
                  </TouchableOpacity>
                );
              })
            : // Legacy fallback rendering (no day_statuses)
              Array.from({ length: totalDays }, (_, i) => i + 1).map((dayNum) => {
                const done = isCompleted || dayNum <= program.current_day;
                const active = !isCompleted && dayNum === program.current_day + 1 && !program.next_day_locked;
                const tappable = done || active;
                return (
                  <TouchableOpacity
                    key={dayNum}
                    onPress={() => tappable && handleDayPress(dayNum)}
                    activeOpacity={tappable ? 0.7 : 1}
                    disabled={!tappable}
                    style={[styles.dayRow, dayNum < totalDays && styles.dayRowBorder]}
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
                        Day {dayNum}
                      </Text>
                      {!done && !active && dayNum === program.current_day + 1 && program.next_day_locked && (
                        <Text style={styles.dayHint}>Unlocks tomorrow</Text>
                      )}
                    </View>
                    {tappable && <Text style={styles.dayArrow}>→</Text>}
                  </TouchableOpacity>
                );
              })}

          {isCompleted && (
            <TouchableOpacity
              onPress={() => navigation.navigate("ProgramDay8TransitionScreen" as any)}
              activeOpacity={0.85}
              style={styles.nextStepRow}
            >
              <Text style={styles.nextStepText}>Choose your next step →</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
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
  iconDoneLate: {
    fontSize: 15,
    color: "#9A7548",
    fontWeight: "700",
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
  dayLabelLate: { color: "#9A7548" },
  dayLabelActive: { color: "#8B5E00", fontFamily: Fonts.sans.bold },
  dayLabelMissed: { color: "#C0392B" },
  dayLabelLocked: { color: "#B5A08A" },
  dayHint: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    color: "#B5A08A",
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
    color: "#9A7548",
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
