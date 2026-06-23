/**
 * GuideProgramDraftScreen — TLP Phase 2.
 *
 * Verified guides submit a program draft for KalpX review.
 * POST /api/guide/programs/draft/
 * The draft is NOT published until KalpX approves.
 */
import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Fonts } from "../../theme/fonts";
import { submitProgramDraft } from "../../engine/liveSessionApi";

const CATEGORIES = [
  { value: "meditation", label: "Meditation / Dhyaan" },
  { value: "yoga", label: "Yoga / Pranayama" },
  { value: "gita", label: "Gita" },
  { value: "family", label: "Family" },
  { value: "festival", label: "Festival Sadhana" },
  { value: "ayurveda", label: "Ayurveda" },
  { value: "satsang", label: "Satsang" },
  { value: "other", label: "Other" },
];

const DURATIONS = [
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "21", label: "21 days" },
  { value: "other", label: "Other" },
];

const LANGUAGES = [
  { value: "hi", label: "Hindi" },
  { value: "en", label: "English" },
  { value: "te", label: "Telugu" },
];

function ChipRow({
  options,
  selected,
  onSelect,
}: {
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
      {options.map((o) => (
        <TouchableOpacity
          key={o.value}
          onPress={() => onSelect(o.value)}
          style={[styles.chip, selected === o.value && styles.chipSelected]}
        >
          <Text style={[styles.chipText, selected === o.value && styles.chipTextSelected]}>
            {o.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <Text style={styles.label}>
      {label}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>
  );
}

export function GuideProgramDraftScreen() {
  const navigation = useNavigation<any>();

  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [language, setLanguage] = useState("");
  const [description, setDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [dailyStructure, setDailyStructure] = useState("");
  const [notesToKalpx, setNotesToKalpx] = useState("");

  async function handleSubmit() {
    if (!title.trim() || !category || !durationDays || !description.trim() || !language) {
      Alert.alert("Missing fields", "Please fill in title, category, duration, language and description.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitProgramDraft({
        title: title.trim(),
        category,
        duration_days: durationDays,
        description: description.trim(),
        language,
        target_audience: targetAudience.trim(),
        daily_structure: dailyStructure.trim(),
        notes_to_kalpx: notesToKalpx.trim(),
      });
      Alert.alert(
        "Draft Submitted 🙏",
        `Submission #${result.submission_id} received. KalpX will review within ${result.estimated_review_days} business days.`,
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (e: any) {
      const detail = e?.response?.data?.detail ?? "Submission failed. Please try again.";
      if (e?.response?.status === 403) {
        Alert.alert("Not authorised", "You need to be a verified guide to submit a program draft.");
      } else {
        Alert.alert("Error", detail);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.eyebrow}>GUIDE TOOLS</Text>
          <Text style={styles.title}>Submit Program Draft</Text>
          <Text style={styles.subtitle}>
            KalpX reviews your draft within 3–5 business days. You'll be notified once approved.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <FieldLabel label="Program title" required />
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. 7-Day Morning Sadhana"
            placeholderTextColor="#B5A08A"
          />

          <FieldLabel label="Category" required />
          <ChipRow options={CATEGORIES} selected={category} onSelect={setCategory} />

          <FieldLabel label="Duration" required />
          <ChipRow options={DURATIONS} selected={durationDays} onSelect={setDurationDays} />

          <FieldLabel label="Language" required />
          <ChipRow options={LANGUAGES} selected={language} onSelect={setLanguage} />

          <FieldLabel label="Description" required />
          <Text style={styles.hint}>What is this program about? What will practitioners experience?</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the practice journey…"
            placeholderTextColor="#B5A08A"
            multiline
            textAlignVertical="top"
          />

          <FieldLabel label="Target audience" />
          <TextInput
            style={[styles.input, styles.textAreaSm]}
            value={targetAudience}
            onChangeText={setTargetAudience}
            placeholder="e.g. Anyone who wants a morning routine…"
            placeholderTextColor="#B5A08A"
            multiline
            textAlignVertical="top"
          />

          <FieldLabel label="Daily structure" />
          <Text style={styles.hint}>What does a typical day look like?</Text>
          <TextInput
            style={[styles.input, styles.textAreaSm]}
            value={dailyStructure}
            onChangeText={setDailyStructure}
            placeholder="e.g. A short mantra + guided prompt + reflection…"
            placeholderTextColor="#B5A08A"
            multiline
            textAlignVertical="top"
          />

          <FieldLabel label="Notes to KalpX team" />
          <TextInput
            style={[styles.input, styles.textAreaSm]}
            value={notesToKalpx}
            onChangeText={setNotesToKalpx}
            placeholder="Anything else the KalpX team should know…"
            placeholderTextColor="#B5A08A"
            multiline
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Submit Program Draft</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FAF7F2" },
  scroll: { paddingBottom: 60 },
  header: { padding: 20, paddingBottom: 0 },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 14, color: "#8B6F4E", fontFamily: Fonts.body },
  eyebrow: { fontSize: 10, color: "#8B6F4E", letterSpacing: 1.2,
    fontFamily: Fonts.body, marginBottom: 6 },
  title: { fontSize: 20, fontWeight: "700", color: "#432104",
    fontFamily: Fonts.heading, marginBottom: 8 },
  subtitle: { fontSize: 13, color: "#7A6652", lineHeight: 20,
    fontFamily: Fonts.body, marginBottom: 4 },
  form: { padding: 20 },
  label: { fontSize: 13, fontWeight: "600", color: "#432104",
    fontFamily: Fonts.body, marginBottom: 4, marginTop: 8 },
  required: { color: "#C99317" },
  hint: { fontSize: 12, color: "#8B6F4E", fontFamily: Fonts.body, marginBottom: 4 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1, borderColor: "#DDD3C0",
    borderRadius: 8, padding: 12,
    fontSize: 14, color: "#432104", fontFamily: Fonts.body,
    marginBottom: 4,
  },
  textArea: { minHeight: 96 },
  textAreaSm: { minHeight: 72 },
  chipRow: { flexDirection: "row", marginBottom: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: "#DDD3C0",
    marginRight: 8, backgroundColor: "#fff",
  },
  chipSelected: { backgroundColor: "#FEF3D0", borderColor: "#C99317" },
  chipText: { fontSize: 13, color: "#7A6652", fontFamily: Fonts.body },
  chipTextSelected: { color: "#7A4E00", fontWeight: "600" },
  submitBtn: {
    marginTop: 24, backgroundColor: "#C99317",
    borderRadius: 10, padding: 15, alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: Fonts.heading },
});
