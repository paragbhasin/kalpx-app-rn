/**
 * ProgramCard — Gate 3 MOB-8.
 *
 * Shown on Home when GET /api/programs/my-active/ returns non-null.
 * Routes to ProgramDayScreen (active) or ProgramDay8TransitionScreen
 * (completed + show_day8_transition=true).
 */
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Fonts } from "../../theme/fonts";
import { type ActiveProgramSummary } from "../../engine/programApi";

interface ProgramCardProps {
  program: ActiveProgramSummary;
}

export default function ProgramCard({ program }: ProgramCardProps) {
  const navigation = useNavigation<any>();

  const isCompleted = program.status === "completed" && program.show_day8_transition;

  const handlePress = () => {
    if (isCompleted) {
      navigation.navigate("ProgramDay8TransitionScreen" as any);
    } else {
      const nextDay = program.next_day_available
        ? program.current_day + 1
        : program.current_day;
      navigation.navigate("ProgramDayScreen" as any, { dayNumber: nextDay });
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handlePress}
      style={styles.card}
      accessibilityLabel={
        isCompleted
          ? `${program.name} — complete. Choose your next step.`
          : `${program.name} — Day ${program.current_day}. Continue your practice.`
      }
      testID="program_card"
    >
      <View style={styles.left}>
        <Text style={styles.label}>PRACTICE PROGRAM</Text>
        <Text style={styles.name} numberOfLines={1}>{program.name}</Text>
        {isCompleted ? (
          <Text style={styles.status}>Complete · Choose your next step</Text>
        ) : (
          <Text style={styles.status}>
            Day {program.current_day + 1} · Continue your practice
          </Text>
        )}
      </View>
      <Text style={styles.arrow}>→</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8EE",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#C99317",
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 12,
  },
  left: { flex: 1 },
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
  arrow: { fontSize: 20, color: "#C99317" },
});
