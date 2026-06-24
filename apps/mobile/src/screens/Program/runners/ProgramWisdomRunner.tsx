import { useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { type WisdomCard } from "../../../engine/programApi";
import { Fonts } from "../../../theme/fonts";

export default function ProgramWisdomRunner() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { wisdom, dayNumber }: { wisdom: WisdomCard; dayNumber: number } = route.params;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
            <Text style={styles.backIconText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.dayLabel}>DAY {dayNumber}</Text>
            <Text style={styles.screenTitle}>Wisdom of the Day</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Wisdom card */}
        <View style={styles.card}>
          <Text style={styles.wisdomText}>{wisdom.text}</Text>
          {wisdom.source_title ? (
            <Text style={styles.source}>— {wisdom.source_title}</Text>
          ) : null}
        </View>

        {/* Reflection nudge */}
        <View style={styles.reflectionBox}>
          <Text style={styles.reflectionLabel}>REFLECT</Text>
          <Text style={styles.reflectionText}>
            Sit with this wisdom for a moment. How does it speak to where you are today?
          </Text>
        </View>

        {/* Close button */}
        <TouchableOpacity
          style={styles.doneBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.82}
        >
          <Text style={styles.doneBtnText}>Close</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAF7F2" },
  scroll: { paddingHorizontal: 24, paddingBottom: 60 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 24,
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
  screenTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: "#432104",
    textAlign: "center",
  },

  card: {
    backgroundColor: "#FFF8EE",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 24,
    marginBottom: 20,
  },
  wisdomText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 20,
    color: "#432104",
    lineHeight: 30,
    fontStyle: "italic",
    marginBottom: 16,
  },
  source: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#9A7548",
  },

  reflectionBox: {
    backgroundColor: "#F5EFE3",
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  reflectionLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 10,
    color: "#9A7548",
    letterSpacing: 0.08,
    marginBottom: 8,
  },
  reflectionText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#432104",
    lineHeight: 22,
  },

  doneBtn: {
    backgroundColor: "#432104",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  doneBtnText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 16,
    color: "#FFF8EE",
  },
});
