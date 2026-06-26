import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  cloneOfficialTemplate,
  createBlankTemplate,
  fetchOfficialTemplates,
  OfficialTemplate,
} from "../../engine/liveSessionApi";
import { Fonts } from "../../theme/fonts";

const DAY_OPTIONS = [7, 9, 11, 14, 21, 30, 40];

export default function GuideTemplateBrowserScreen() {
  const navigation = useNavigation<any>();
  const [templates, setTemplates] = useState<OfficialTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloning, setCloning] = useState<string | null>(null);
  const [showBlank, setShowBlank] = useState(false);
  const [blankTitle, setBlankTitle] = useState("");
  const [blankDays, setBlankDays] = useState(7);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOfficialTemplates()
      .then((res) => setTemplates(res.templates))
      .catch(() => setError("Could not load templates. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  async function handleClone(slug: string) {
    setCloning(slug);
    setError("");
    try {
      const tmpl = await cloneOfficialTemplate(slug);
      navigation.navigate("GuideTemplateDayEditor", { templateId: tmpl.id });
    } catch {
      setError("Could not start template. Please try again.");
    } finally {
      setCloning(null);
    }
  }

  async function handleCreateBlank() {
    if (!blankTitle.trim()) return;
    setCreating(true);
    setError("");
    try {
      const tmpl = await createBlankTemplate({ title: blankTitle.trim(), duration_days: blankDays });
      navigation.navigate("GuideTemplateDayEditor", { templateId: tmpl.id });
    } catch {
      setError("Could not create template. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {/* Back */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Text style={s.backText}>← Guide Dashboard</Text>
        </TouchableOpacity>

        {/* Header */}
        <Text style={s.eyebrow}>GUIDE TOOLS</Text>
        <Text style={s.heading}>Build a Program</Text>
        <Text style={s.sub}>
          Start from a KalpX template and customise every day — or build your own from scratch.
          Your program goes through a short review before going live.
        </Text>

        {!!error && <Text style={s.errorText}>{error}</Text>}

        {/* Start from scratch */}
        <Text style={s.sectionLabel}>Start from scratch</Text>
        {!showBlank ? (
          <TouchableOpacity style={s.blankCard} onPress={() => setShowBlank(true)} activeOpacity={0.85}>
            <Text style={s.blankPlus}>＋</Text>
            <Text style={s.blankCardTitle}>Create my own program</Text>
            <Text style={s.blankCardSub}>Choose your own title, duration, mantra, sankalp and practice for each day.</Text>
          </TouchableOpacity>
        ) : (
          <View style={s.blankForm}>
            <Text style={s.label}>Program title *</Text>
            <TextInput
              style={s.input}
              value={blankTitle}
              onChangeText={setBlankTitle}
              placeholder="e.g. 21-Day Hanuman Bhakti"
              placeholderTextColor="#B5A08A"
              autoFocus
            />
            <Text style={s.label}>Number of days</Text>
            <View style={s.dayPillRow}>
              {DAY_OPTIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[s.dayPill, blankDays === d && s.dayPillActive]}
                  onPress={() => setBlankDays(d)}
                >
                  <Text style={[s.dayPillText, blankDays === d && s.dayPillTextActive]}>{d} days</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={s.btnRow}>
              <TouchableOpacity
                style={[s.primaryBtn, (!blankTitle.trim() || creating) && { opacity: 0.5 }]}
                onPress={handleCreateBlank}
                disabled={creating || !blankTitle.trim()}
              >
                <Text style={s.primaryBtnText}>{creating ? "Creating…" : "Start Building"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.ghostBtn} onPress={() => setShowBlank(false)}>
                <Text style={s.ghostBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Official templates */}
        <Text style={[s.sectionLabel, { marginTop: 32 }]}>Or start from a KalpX template</Text>
        {loading ? (
          <ActivityIndicator color="#C99317" style={{ marginTop: 20 }} />
        ) : templates.length === 0 ? (
          <Text style={s.hint}>No official templates available yet.</Text>
        ) : (
          templates.map((t) => (
            <View key={t.slug} style={s.card}>
              <View style={s.cardHeader}>
                <View style={s.durationBadge}>
                  <Text style={s.durationText}>{t.duration_days} days</Text>
                </View>
                {(t.audience_tags ?? []).slice(0, 2).map((tag) => (
                  <View key={tag} style={s.audienceTag}>
                    <Text style={s.audienceTagText}>{tag}</Text>
                  </View>
                ))}
              </View>
              <Text style={s.cardTitle}>{t.title}</Text>
              {!!t.subtitle && <Text style={s.cardSub}>{t.subtitle}</Text>}
              {!!t.program_promise && <Text style={s.promise}>{t.program_promise}</Text>}
              {(t.day_themes ?? []).length > 0 && (
                <View style={s.dayThemeRow}>
                  {(t.day_themes ?? []).slice(0, 3).map((theme, i) => (
                    <View key={i} style={s.dayThemePill}>
                      <Text style={s.dayThemePillText}>Day {i + 1}: {theme}</Text>
                    </View>
                  ))}
                  {(t.day_themes ?? []).length > 3 && (
                    <View style={s.dayThemePill}>
                      <Text style={s.dayThemePillText}>+{(t.day_themes ?? []).length - 3} more</Text>
                    </View>
                  )}
                </View>
              )}
              <TouchableOpacity
                style={[s.cloneBtn, cloning === t.slug && { opacity: 0.6 }]}
                onPress={() => handleClone(t.slug)}
                disabled={cloning === t.slug}
              >
                <Text style={s.cloneBtnText}>{cloning === t.slug ? "Starting…" : "Use this template →"}</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAF7F2" },
  scroll: { padding: 20, paddingBottom: 60 },
  backBtn: { marginBottom: 20 },
  backText: { fontSize: 13, color: "#8B6F4E", fontFamily: Fonts.sans.regular },
  eyebrow: { fontSize: 10, letterSpacing: 1.2, color: "#8B6F4E", textTransform: "uppercase", marginBottom: 6, fontFamily: Fonts.sans.medium },
  heading: { fontSize: 26, fontWeight: "800", color: "#432104", marginBottom: 8, fontFamily: Fonts.serif.bold },
  sub: { fontSize: 14, color: "#7A6652", lineHeight: 22, marginBottom: 28, fontFamily: Fonts.sans.regular },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: "#B5A08A", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, fontFamily: Fonts.sans.medium },
  errorText: { color: "#C0392B", fontSize: 13, marginBottom: 16, fontFamily: Fonts.sans.regular },
  hint: { color: "#B5A08A", fontSize: 14, paddingVertical: 20, fontFamily: Fonts.sans.regular },

  blankCard: {
    backgroundColor: "#fff", borderWidth: 2, borderColor: "#DDD3C0", borderStyle: "dashed",
    borderRadius: 12, padding: 20, marginBottom: 8,
  },
  blankPlus: { fontSize: 22, color: "#C99317", marginBottom: 4 },
  blankCardTitle: { fontSize: 15, fontWeight: "700", color: "#432104", marginBottom: 4, fontFamily: Fonts.sans.bold },
  blankCardSub: { fontSize: 13, color: "#7A6652", fontFamily: Fonts.sans.regular },

  blankForm: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#DDD3C0",
    borderRadius: 12, padding: 20, marginBottom: 8,
  },
  label: { fontSize: 12, fontWeight: "600", color: "#432104", marginBottom: 4, marginTop: 12, fontFamily: Fonts.sans.medium },
  input: {
    borderWidth: 1, borderColor: "#DDD3C0", borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#432104",
    fontFamily: Fonts.sans.regular,
  },
  dayPillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 },
  dayPill: { borderWidth: 1, borderColor: "#DDD3C0", borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  dayPillActive: { borderColor: "#C99317", backgroundColor: "#C99317" },
  dayPillText: { fontSize: 13, color: "#432104", fontFamily: Fonts.sans.regular },
  dayPillTextActive: { color: "#fff", fontWeight: "700" },
  btnRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  primaryBtn: { backgroundColor: "#C99317", borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  primaryBtnText: { color: "#fff", fontWeight: "700", fontSize: 13, fontFamily: Fonts.sans.bold },
  ghostBtn: { borderWidth: 1, borderColor: "#DDD3C0", borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  ghostBtnText: { color: "#8B6F4E", fontSize: 13, fontFamily: Fonts.sans.regular },

  card: {
    backgroundColor: "#fff", borderWidth: 1, borderColor: "#E8DECE",
    borderRadius: 12, padding: 20, marginBottom: 16,
  },
  cardHeader: { flexDirection: "row", flexWrap: "wrap", gap: 6, alignItems: "center", marginBottom: 10 },
  durationBadge: { backgroundColor: "#FEF3D0", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 2 },
  durationText: { fontSize: 11, fontWeight: "700", color: "#7A4E00", fontFamily: Fonts.sans.bold },
  audienceTag: { backgroundColor: "#F5EFE5", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  audienceTagText: { fontSize: 11, color: "#8B6F4E", fontFamily: Fonts.sans.regular },
  cardTitle: { fontSize: 17, fontWeight: "700", color: "#432104", marginBottom: 4, fontFamily: Fonts.serif.bold },
  cardSub: { fontSize: 13, color: "#7A6652", marginBottom: 6, fontFamily: Fonts.sans.regular },
  promise: { fontSize: 12, color: "#8B6F4E", fontStyle: "italic", marginBottom: 10, fontFamily: Fonts.sans.regular },
  dayThemeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 16 },
  dayThemePill: { backgroundColor: "#F5EFE5", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  dayThemePillText: { fontSize: 11, color: "#7A6652", fontFamily: Fonts.sans.regular },
  cloneBtn: { backgroundColor: "#432104", borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10, alignSelf: "flex-start" },
  cloneBtnText: { color: "#fff", fontWeight: "700", fontSize: 13, fontFamily: Fonts.sans.bold },
});
