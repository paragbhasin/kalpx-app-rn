import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
import { saveDayReflection } from "../../engine/programApi";
import {
  setForceFourDoorHome,
  setSkipMitraStart,
} from "../../utils/postLoginGuard";

const MAX_CHARS = 500;

export default function ProgramReflectionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const { reflectionPrompt, dayNumber } = route.params ?? {};

  const prompt = reflectionPrompt || t("programs.reflection.defaultPrompt");

  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await saveDayReflection(dayNumber, text.trim());
      setSaved(true);
      setTimeout(() => {
        setSkipMitraStart();
        setForceFourDoorHome();
        navigation.reset({ index: 0, routes: [{ name: "Home" }] });
      }, 900);
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
          {/* <Text style={styles.emoji}>🌼</Text> */}
          <Text style={styles.heading}>{t("programs.reflection.heading")}</Text>
          <Text style={styles.subtitle}>
            {t("programs.reflection.subtitle")}
          </Text>

          <View style={styles.questionCard}>
            <Text style={styles.questionLabel}>{t("programs.reflection.questionLabel")}</Text>
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
                  if (v.length <= MAX_CHARS) {
                    setText(v);
                    setSaved(false);
                  }
                }}
                placeholder={t("programs.reflection.inputPlaceholder")}
                placeholderTextColor="#B5A08A"
                multiline
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>
                {text.length}/{MAX_CHARS}
              </Text>

              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {saved ? t("programs.reflection.savedButton") : t("programs.reflection.saveButton")}
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
              <Text style={styles.primaryBtnText}>{t("programs.reflection.goToHome")}</Text>
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
              <Text style={styles.secondaryBtnText}>{t("programs.reflection.backToDay")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAF7F2" },
  scroll: { flexGrow: 1, padding: 20, paddingBottom: 32 },
  emoji: { fontSize: 28, textAlign: "center", marginBottom: 4 },
  heading: {
    fontSize: 24,
    fontWeight: "800",
    color: "#432104",
    textAlign: "center",
    marginBottom: 4,
    fontFamily: "serif",
  },
  subtitle: {
    fontSize: 13,
    color: "#7A6248",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 14,
  },
  questionCard: {
    backgroundColor: "#FFF8EC",
    borderWidth: 1,
    borderColor: "#E8DECE",
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  questionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#C99317",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  questionText: {
    fontSize: 15,
    color: "#432104",
    lineHeight: 22,
    fontStyle: "italic",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#DDD0BC",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#432104",
    minHeight: 100,
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    color: "#A08060",
    textAlign: "right",
    marginTop: 4,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: "#C99317",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 8,
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  actions: { gap: 6 },
  primaryBtn: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#C99317",
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: "center",
  },
  primaryBtnText: { color: "#C99317", fontSize: 15, fontWeight: "700" },
  secondaryBtn: {
    paddingVertical: 6,
    alignItems: "center",
  },
  secondaryBtnText: { color: "#9A7548", fontSize: 14 },
});
