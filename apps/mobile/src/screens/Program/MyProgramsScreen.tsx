import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import { fetchMyPrograms, type MyProgramEntry } from "../../engine/programApi";
import { Fonts } from "../../theme/fonts";

const PROGRAM_ICONS: Record<string, string> = {
  default: "🕉️",
  grief: "🎗️",
  mantra: "🔔",
  stress: "🌬️",
  sleep: "🌙",
  morning: "🌅",
  hanuman: "🪔",
  navratri: "🌺",
  pranayama: "💨",
  transformation: "✨",
};

function programEmoji(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes("grief")) return "🎗️";
  if (lower.includes("sleep") || lower.includes("rest")) return "🌙";
  if (lower.includes("morning")) return "🌅";
  if (lower.includes("hanuman")) return "🪔";
  if (lower.includes("navratri")) return "🌺";
  if (lower.includes("pranayama")) return "💨";
  if (lower.includes("mantra")) return "🔔";
  if (lower.includes("stress")) return "🌬️";
  if (lower.includes("transformation")) return "✨";
  return "🕉️";
}

export default function MyProgramsScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const initialTab = route.params?.initialTab ?? "active";
  const [activeTab, setActiveTab] = useState<"active" | "completed">(initialTab);
  const [programs, setPrograms] = useState<MyProgramEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyPrograms()
      .then(setPrograms)
      .catch(() => setPrograms([]))
      .finally(() => setLoading(false));
  }, []);

  const activeList = programs.filter((p) => p.status === "active");
  const completedList = programs.filter((p) => p.status === "completed");

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return "";
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t("programCard.myPrograms")}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "active" && styles.tabActive]}
          onPress={() => setActiveTab("active")}
        >
          <Text style={[styles.tabText, activeTab === "active" && styles.tabTextActive]}>
            {t("programCard.active")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "completed" && styles.tabActive]}
          onPress={() => setActiveTab("completed")}
        >
          <Text style={[styles.tabText, activeTab === "completed" && styles.tabTextActive]}>
            {t("programCard.completed")}
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#2E5723" />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {activeTab === "active" && (
            activeList.length === 0 ? (
              <Text style={styles.empty}>{t("programCard.noActivePrograms")}</Text>
            ) : (
              activeList.map((p) => (
                <View key={p.participant_id} style={styles.row}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.iconText}>{programEmoji(p.name)}</Text>
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowName}>{p.name}</Text>
                    <Text style={styles.rowSub}>
                      Day {p.current_day} of {p.total_days}
                    </Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{t("programCard.active")}</Text>
                  </View>
                </View>
              ))
            )
          )}

          {activeTab === "completed" && (
            completedList.length === 0 ? (
              <Text style={styles.empty}>{t("programCard.noCompletedPrograms")}</Text>
            ) : (
              completedList.map((p) => (
                <View key={p.participant_id} style={styles.row}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.iconText}>{programEmoji(p.name)}</Text>
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={styles.rowName}>{p.name}</Text>
                    {p.completed_at ? (
                      <Text style={styles.rowSub}>
                        {t("programCard.completedOn", { date: formatDate(p.completed_at) })}
                      </Text>
                    ) : null}
                    <Text style={styles.viewSummary}>{t("programCard.viewSummary")} →</Text>
                  </View>
                  <View style={[styles.badge, styles.badgeCompleted]}>
                    <Text style={[styles.badgeText, styles.badgeTextCompleted]}>
                      {t("programCard.completed")}
                    </Text>
                  </View>
                </View>
              ))
            )
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFAF5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE3CC",
  },
  backBtn: { width: 40, alignItems: "flex-start" },
  backArrow: { fontSize: 22, color: "#432104" },
  title: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#432104",
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE3CC",
    backgroundColor: "#FFFAF5",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#8B5E00",
  },
  tabText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#9A7548",
  },
  tabTextActive: {
    color: "#8B5E00",
    fontFamily: Fonts.sans.bold,
  },
  list: { padding: 16, gap: 12 },
  empty: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#9A7548",
    textAlign: "center",
    marginTop: 40,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8EE",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE3CC",
    padding: 14,
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5EDD8",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 22 },
  rowInfo: { flex: 1 },
  rowName: {
    fontFamily: Fonts.serif.bold,
    fontSize: 14,
    color: "#432104",
    marginBottom: 2,
  },
  rowSub: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "#9A7548",
    marginBottom: 2,
  },
  viewSummary: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: "#8B5E00",
    marginTop: 2,
  },
  badge: {
    backgroundColor: "#E8F5E9",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: "#2E7D32",
  },
  badgeCompleted: {
    backgroundColor: "#EEF2FF",
  },
  badgeTextCompleted: {
    color: "#3949AB",
  },
});
