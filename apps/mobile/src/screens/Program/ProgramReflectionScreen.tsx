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

const DEFAULT_PROMPT =
  "Take a moment. What shifted in you today — even slightly? Notice it without judgement.";

export default function ProgramReflectionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { reflectionPrompt, dayNumber, campaignCode } = route.params ?? {};

  const prompt = reflectionPrompt || DEFAULT_PROMPT;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.dayLabel}>DAY {dayNumber}</Text>
        <Text style={styles.heading}>Reflection</Text>

        <View style={styles.promptCard}>
          <Text style={styles.promptLabel}>REFLECTION</Text>
          <Text style={styles.promptText}>{prompt}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: "HomeTabs" }] })}
          >
            <Text style={styles.primaryBtnText}>Go to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => {
              navigation.replace("ProgramDayScreen", {
                dayNumber,
                campaignCode,
              });
            }}
          >
            <Text style={styles.secondaryBtnText}>Repeat Again</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAF7F2" },
  scroll: { flexGrow: 1, padding: 24, justifyContent: "center" },
  dayLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#C99317",
    letterSpacing: 1.5,
    textAlign: "center",
    marginBottom: 6,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#432104",
    textAlign: "center",
    marginBottom: 36,
    fontFamily: "serif",
  },
  promptCard: {
    backgroundColor: "#FFF8EC",
    borderWidth: 1,
    borderColor: "#E8DECE",
    borderRadius: 16,
    padding: 24,
    marginBottom: 40,
  },
  promptLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#C99317",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  promptText: {
    fontSize: 17,
    color: "#432104",
    lineHeight: 26,
    fontStyle: "italic",
  },
  actions: { gap: 12 },
  primaryBtn: {
    backgroundColor: "#C99317",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryBtn: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#C99317",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#C99317",
    fontSize: 15,
    fontWeight: "700",
  },
});
