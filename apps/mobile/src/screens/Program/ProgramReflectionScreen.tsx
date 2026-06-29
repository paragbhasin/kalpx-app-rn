import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { setSkipMitraStart, setForceFourDoorHome } from "../../utils/postLoginGuard";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { fetchDayReflection, saveDayReflection } from "../../engine/programApi";

const MAX_CHARS = 500;
const DEFAULT_PROMPT =
  "Take a moment. What shifted in you today — even slightly? Notice it without judgement.";

export default function ProgramReflectionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { reflectionPrompt, dayNumber } = route.params ?? {};

  const prompt = reflectionPrompt || DEFAULT_PROMPT;

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!dayNumber) { setLoading(false); return; }
    fetchDayReflection(dayNumber)
      .then((t) => { setText(t); setSaved(!!t); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dayNumber]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await saveDayReflection(dayNumber, text.trim());
      setSaved(true);
    } catch {
      // silent — user can retry
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.emoji}>🌼</Text>
          <Text style={styles.heading}>Reflection</Text>
          <Text style={styles.subtitle}>
            Take a quiet moment to reflect on today's journey.
          </Text>

          <View style={styles.questionCard}>
            <Text style={styles.questionLabel}>QUESTION</Text>
            <Text style={styles.questionText}>{prompt}</Text>
          </View>

          {loading ? (
            <ActivityIndicator color="#C99317" style={{ marginVertical: 24 }} />
          ) : (
            <>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={text}
                onChangeText={(v) => {
                  if (v.length <= MAX_CHARS) { setText(v); setSaved(false); }
                }}
                placeholder="Write your thoughts here..."
                placeholderTextColor="#B5A08A"
                multiline
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{text.length}/{MAX_CHARS}</Text>

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {saved ? "✓ Reflection Saved" : "Save Reflection"}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => {
                setSkipMitraStart();
                setForceFourDoorHome();
                navigation.reset({ index: 0, routes: [{ name: "Home" }] });
              }}
            >
              <Text style={styles.primaryBtnText}>Go to Home</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => {
                if (navigation.canGoBack()) {
                  navigation.goBack();
                } else {
                  navigation.replace("ProgramDayScreen", { dayNumber });
                }
              }}
            >
              <Text style={styles.secondaryBtnText}>Back to Day</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAF7F2" },
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 48 },
  emoji: { fontSize: 32, textAlign: "center", marginBottom: 6 },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#432104",
    textAlign: "center",
    marginBottom: 8,
    fontFamily: "serif",
  },
  subtitle: {
    fontSize: 14,
    color: "#7A6248",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
  },
  questionCard: {
    backgroundColor: "#FFF8EC",
    borderWidth: 1,
    borderColor: "#E8DECE",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  questionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#C99317",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  questionText: {
    fontSize: 16,
    color: "#432104",
    lineHeight: 24,
    fontStyle: "italic",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#DDD0BC",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: "#432104",
    minHeight: 120,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    color: "#A08060",
    textAlign: "right",
    marginTop: 6,
    marginBottom: 20,
  },
  saveBtn: {
    backgroundColor: "#C99317",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 28,
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  actions: { gap: 12 },
  primaryBtn: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#C99317",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "#C99317", fontSize: 15, fontWeight: "700" },
  secondaryBtn: {
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryBtnText: { color: "#9A7548", fontSize: 14 },
});
