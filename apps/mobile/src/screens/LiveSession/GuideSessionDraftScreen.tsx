/**
 * GuideSessionDraftScreen — TLP Phase 2.
 *
 * Verified guides submit an external-link live session draft for KalpX review.
 * POST /api/guide/sessions/draft/
 * FD-19: external_join_url is the guide's Zoom/Meet/YouTube link (https:// required).
 * No native streaming, no WebRTC.
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
import { submitSessionDraft } from "../../engine/liveSessionApi";

const SESSION_TYPES = [
  { value: "jaap", label: "Jaap" },
  { value: "dhyaan", label: "Dhyaan" },
  { value: "satsang", label: "Satsang" },
  { value: "yoga", label: "Yoga" },
  { value: "katha", label: "Katha" },
  { value: "workshop", label: "Workshop" },
  { value: "qa", label: "Q&A" },
  { value: "other", label: "Other" },
];

const PLATFORMS = [
  { value: "zoom", label: "Zoom" },
  { value: "google_meet", label: "Google Meet" },
  { value: "youtube_live", label: "YouTube Live" },
  { value: "instagram_live", label: "Instagram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "other", label: "Other" },
];

const RECURRENCES = [
  { value: "once", label: "One-time" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "festival", label: "Festival" },
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

export function GuideSessionDraftScreen() {
  const navigation = useNavigation<any>();
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [description, setDescription] = useState("");
  const [externalJoinUrl, setExternalJoinUrl] = useState("");
  const [externalPlatform, setExternalPlatform] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [recurrence, setRecurrence] = useState("once");
  const [language, setLanguage] = useState("");
  const [notesToKalpx, setNotesToKalpx] = useState("");

  async function handleSubmit() {
    if (!title.trim() || !sessionType || !description.trim() ||
        !externalJoinUrl.trim() || !externalPlatform || !scheduledAt.trim()) {
      Alert.alert("Missing fields",
        "Please fill in title, type, description, join link, platform and date/time.");
      return;
    }

    if (!externalJoinUrl.startsWith("https://")) {
      Alert.alert("Invalid join link", "The join link must start with https://");
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitSessionDraft({
        title: title.trim(),
        session_type: sessionType,
        description: description.trim(),
        external_join_url: externalJoinUrl.trim(),
        external_platform: externalPlatform,
        scheduled_at: scheduledAt.trim(),
        timezone: timezone.trim() || "Asia/Kolkata",
        duration_minutes: parseInt(durationMinutes, 10) || 60,
        recurrence,
        language,
        notes_to_kalpx: notesToKalpx.trim(),
      });
      Alert.alert(
        "Session Draft Submitted 🙏",
        `Submission #${result.submission_id} received. KalpX will review within ${result.estimated_review_days} business days.`,
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (e: any) {
      if (e?.response?.status === 403) {
        Alert.alert("Not authorised", "You need to be a verified guide to schedule a session.");
      } else {
        const data = e?.response?.data ?? {};
        const detail = data.external_join_url?.[0] ?? data.detail ?? "Submission failed. Please try again.";
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
          <Text style={styles.pageTitle}>Schedule a Live Session</Text>
          <Text style={styles.subtitle}>
            Your session runs on your platform (Zoom, Meet, YouTube, etc.). KalpX handles the
            listing, reminders, and post-session flow.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <FieldLabel label="Session title" required />
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Sunday Morning Jaap"
            placeholderTextColor="#B5A08A"
          />

          <FieldLabel label="Session type" required />
          <ChipRow options={SESSION_TYPES} selected={sessionType} onSelect={setSessionType} />

          <FieldLabel label="Platform" required />
          <ChipRow options={PLATFORMS} selected={externalPlatform} onSelect={setExternalPlatform} />

          <FieldLabel label="Join link (https:// required)" required />
          <Text style={styles.hint}>Your Zoom / Google Meet / YouTube / etc. link.</Text>
          <TextInput
            style={styles.input}
            value={externalJoinUrl}
            onChangeText={setExternalJoinUrl}
            placeholder="https://zoom.us/j/your-meeting-id"
            placeholderTextColor="#B5A08A"
            keyboardType="url"
            autoCapitalize="none"
          />

          <FieldLabel label="Description" required />
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="What will practitioners experience in this session?"
            placeholderTextColor="#B5A08A"
            multiline
            textAlignVertical="top"
          />

          <FieldLabel label="Date and time (ISO format)" required />
          <Text style={styles.hint}>e.g. 2026-07-06T07:00:00+05:30</Text>
          <TextInput
            style={styles.input}
            value={scheduledAt}
            onChangeText={setScheduledAt}
            placeholder="2026-07-06T07:00:00+05:30"
            placeholderTextColor="#B5A08A"
            autoCapitalize="none"
          />

          <FieldLabel label="Timezone" />
          <TextInput
            style={styles.input}
            value={timezone}
            onChangeText={setTimezone}
            placeholder="Asia/Kolkata"
            placeholderTextColor="#B5A08A"
            autoCapitalize="none"
          />

          <FieldLabel label="Duration (minutes)" />
          <TextInput
            style={styles.input}
            value={durationMinutes}
            onChangeText={setDurationMinutes}
            placeholder="60"
            placeholderTextColor="#B5A08A"
            keyboardType="number-pad"
          />

          <FieldLabel label="Recurrence" />
          <ChipRow options={RECURRENCES} selected={recurrence} onSelect={setRecurrence} />

          <FieldLabel label="Language" />
          <ChipRow options={LANGUAGES} selected={language} onSelect={setLanguage} />

          <FieldLabel label="Notes to KalpX team" />
          <TextInput
            style={[styles.input, styles.textAreaSm]}
            value={notesToKalpx}
            onChangeText={setNotesToKalpx}
            placeholder="Anything the KalpX team should know before approving…"
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
              <Text style={styles.submitText}>Submit Session Draft</Text>
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
  backText: { fontSize: 14, color: "#8B6F4E", fontFamily: Fonts.sans.regular },
  eyebrow: { fontSize: 10, color: "#8B6F4E", letterSpacing: 1.2,
    fontFamily: Fonts.sans.regular, marginBottom: 6 },
  pageTitle: { fontSize: 20, fontWeight: "700", color: "#432104",
    fontFamily: Fonts.serif.bold, marginBottom: 8 },
  subtitle: { fontSize: 13, color: "#7A6652", lineHeight: 20,
    fontFamily: Fonts.sans.regular, marginBottom: 4 },
  form: { padding: 20 },
  label: { fontSize: 13, fontWeight: "600", color: "#432104",
    fontFamily: Fonts.sans.regular, marginBottom: 4, marginTop: 8 },
  required: { color: "#C99317" },
  hint: { fontSize: 12, color: "#8B6F4E", fontFamily: Fonts.sans.regular, marginBottom: 4 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1, borderColor: "#DDD3C0",
    borderRadius: 8, padding: 12,
    fontSize: 14, color: "#432104", fontFamily: Fonts.sans.regular,
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
  chipText: { fontSize: 13, color: "#7A6652", fontFamily: Fonts.sans.regular },
  chipTextSelected: { color: "#7A4E00", fontWeight: "600" },
  submitBtn: {
    marginTop: 24, backgroundColor: "#C99317",
    borderRadius: 10, padding: 15, alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "700", fontFamily: Fonts.serif.bold },
});
