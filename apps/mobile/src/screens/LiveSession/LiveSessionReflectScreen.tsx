/**
 * LiveSessionReflectScreen — TLP Phase 1.
 *
 * Records the user's follow-up action choice after attending a live session.
 * NEVER stores or displays reflection text — only records followup_action choice.
 */
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Fonts } from "../../theme/fonts";
import { submitReflection } from "../../engine/liveSessionApi";

type FollowupAction = "inner_path" | "daily_rhythm" | "quick_chant" | "none";

interface FollowupOption {
  value: FollowupAction;
  label: string;
  subtitle: string;
}

const FOLLOWUP_OPTIONS: FollowupOption[] = [
  {
    value: "inner_path",
    label: "Begin Inner Path",
    subtitle: "Start a guided journey aligned to your intention",
  },
  {
    value: "daily_rhythm",
    label: "Set Daily Rhythm",
    subtitle: "Build a morning, afternoon, and evening practice",
  },
  {
    value: "quick_chant",
    label: "Chant with a mantra",
    subtitle: "Settle your mind with a short mantra session",
  },
  {
    value: "none",
    label: "Continue later",
    subtitle: "I'll explore more when I'm ready",
  },
];

export default function LiveSessionReflectScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { sessionCode } = route.params ?? {};

  const [selected, setSelected] = useState<FollowupAction>("none");
  const [submitting, setSubmitting] = useState(false);

  const handleDone = async () => {
    setSubmitting(true);
    try {
      const result = await submitReflection(sessionCode, selected);
      const deepLink = result.redirect_deep_link;
      if (deepLink === "kalpx://inner-path") {
        navigation.navigate("InnerPath");
      } else if (deepLink === "kalpx://rhythm") {
        navigation.navigate("RhythmHome");
      } else if (deepLink === "kalpx://quick-chant") {
        navigation.navigate("DigitalMala");
      } else {
        navigation.goBack();
      }
    } catch {
      Alert.alert("Could not save your choice", "Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
            <Text style={styles.backIconText}>‹</Text>
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>

        <Text style={styles.heading}>Thank you for joining</Text>
        <Text style={styles.subheading}>
          How would you like to continue your practice?
        </Text>

        <View style={styles.optionsList}>
          {FOLLOWUP_OPTIONS.map((opt) => {
            const isSelected = selected === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                onPress={() => setSelected(opt.value)}
                style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                activeOpacity={0.82}
                accessibilityLabel={opt.label}
              >
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected ? <View style={styles.radioDot} /> : null}
                </View>
                <View style={styles.optionContent}>
                  <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                    {opt.label}
                  </Text>
                  <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Done CTA */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleDone}
          disabled={submitting}
          style={[styles.doneBtn, submitting && styles.doneBtnDisabled]}
          accessibilityLabel="Done"
        >
          {submitting ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.doneBtnText}>Done</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FAF7F2" },
  scroll: { paddingBottom: 60, paddingHorizontal: 24 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 8,
  },
  backIcon: { width: 40, alignItems: "flex-start" },
  backIconText: { fontSize: 32, color: "#432104", lineHeight: 36 },

  heading: {
    fontFamily: Fonts.serif.bold,
    fontSize: 26,
    color: "#432104",
    marginBottom: 8,
    lineHeight: 34,
  },
  subheading: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#7B6545",
    marginBottom: 32,
    lineHeight: 22,
  },

  optionsList: {
    gap: 12,
    marginBottom: 36,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF8EE",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 16,
  },
  optionRowSelected: {
    borderColor: "#C99317",
    backgroundColor: "#FFF8EE",
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#C8B89A",
    marginRight: 14,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: "#C99317",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#C99317",
  },
  optionContent: { flex: 1 },
  optionLabel: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: "#432104",
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: "#432104",
  },
  optionSubtitle: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#7B6545",
    lineHeight: 19,
  },

  doneBtn: {
    backgroundColor: "#432104",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
  },
  doneBtnDisabled: {
    backgroundColor: "#9A7548",
  },
  doneBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 17,
    color: "#fff",
  },
});
