import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Clipboard,
  Linking,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  fetchGuideDashboard,
  type GuideDashboard,
  type GuideDashboardTemplate,
  type GuideProgram,
  type GuideSession,
} from "../../engine/liveSessionApi";
import { performLogout } from "../../utils/logout";
import { ENV } from "../../Networks/baseURL";

const WEB_BASE = ENV === "prod" ? "https://kalpx.com" : "https://dev.kalpx.com";

type LoadState =
  | { kind: "loading" }
  | { kind: "loaded"; data: GuideDashboard }
  | { kind: "error" };

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  submitted: "In Review",
  under_review: "Under Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  rejected: "Rejected",
  active: "Active",
};

const STATUS_COLOR: Record<string, string> = {
  draft: "#8B6F4E",
  submitted: "#0969da",
  under_review: "#0969da",
  changes_requested: "#d97706",
  approved: "#22863a",
  rejected: "#c0392b",
  active: "#22863a",
};

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ProgramRow({ program }: { program: GuideProgram }) {
  const [copied, setCopied] = useState(false);
  const joinUrl = program.join_url || "";

  const handleCopy = () => {
    if (!joinUrl) return;
    Clipboard.setString(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle} numberOfLines={1}>{program.title}</Text>
          <Text style={styles.rowMeta}>
            {program.status}{program.is_public ? " · public" : " · not public"}
          </Text>
        </View>
        <View style={styles.rowStats}>
          <View style={styles.statPill}>
            <Text style={styles.statPillNum}>{program.joined_count}</Text>
            <Text style={styles.statPillLabel}>joined</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statPillNum}>{program.testimonials_count}</Text>
            <Text style={styles.statPillLabel}>testimonials</Text>
          </View>
        </View>
      </View>
      {!!joinUrl && (
        <View style={styles.joinUrlRow}>
          <Text style={styles.joinUrlText} numberOfLines={1}>{joinUrl}</Text>
          <TouchableOpacity
            style={[styles.copyBtn, copied && styles.copyBtnDone]}
            onPress={handleCopy}
          >
            <Text style={styles.copyBtnText}>{copied ? "Copied!" : "Copy"}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function SessionRow({ session }: { session: GuideSession }) {
  const date = (() => {
    try {
      return new Date(session.scheduled_at).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return session.scheduled_at;
    }
  })();

  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle} numberOfLines={1}>{session.title}</Text>
          <Text style={styles.rowMeta}>{date} · {session.status}</Text>
        </View>
        <View style={styles.rowStats}>
          <View style={styles.statPill}>
            <Text style={styles.statPillNum}>
              {session.registered_count > 0 ? session.registered_count : "—"}
            </Text>
            <Text style={styles.statPillLabel}>registered</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statPillNum}>{session.reflection_count}</Text>
            <Text style={styles.statPillLabel}>reflected</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function TemplateRow({ tmpl }: { tmpl: GuideDashboardTemplate }) {
  const color = STATUS_COLOR[tmpl.review_status] ?? "#8B6F4E";
  const label = STATUS_LABEL[tmpl.review_status] ?? tmpl.review_status;
  return (
    <View style={styles.row}>
      <Text style={styles.rowTitle} numberOfLines={1}>{tmpl.title || "Untitled Program"}</Text>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
        <Text style={[styles.statusBadge, { color }]}>{label}</Text>
        <Text style={styles.rowMeta}>· {tmpl.duration_days} days</Text>
      </View>
    </View>
  );
}

export default function GuideHomeScreen() {
  const navigation = useNavigation<any>();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchGuideDashboard();
      setState({ kind: "loaded", data });
    } catch {
      setState({ kind: "error" });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("kalpx_is_guide");
    await performLogout();
    navigation.reset({ index: 0, routes: [{ name: "AppDrawer" }] });
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>Leader Portal</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#c9a84c" />}
      >
        <Text style={styles.sectionEyebrow}>GUIDE DASHBOARD</Text>
        <Text style={styles.pageTitle}>Your Impact</Text>

        {state.kind === "loading" && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#c9a84c" />
          </View>
        )}

        {state.kind === "error" && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>Could not load dashboard. Pull down to retry.</Text>
          </View>
        )}

        {state.kind === "loaded" && (() => {
          const { data } = state;
          const { summary } = data;
          const pipeline = (data.my_templates ?? []).filter((t) =>
            ["submitted", "under_review", "approved", "changes_requested"].includes(t.review_status)
          );

          return (
            <>
              {/* Stats */}
              <View style={styles.statsRow}>
                <StatCard label="PROGRAMS" value={summary.programs_count} />
                <StatCard label="TOTAL JOINED" value={summary.total_joined} />
                <StatCard label="SESSIONS" value={summary.sessions_count} />
                <StatCard label="TESTIMONIALS" value={summary.testimonials_count} />
              </View>

              {/* CTAs */}
              <View style={styles.ctaRow}>
                <TouchableOpacity
                  style={styles.ctaPrimary}
                  onPress={() => Linking.openURL(`${WEB_BASE}/guide/templates`)}
                >
                  <Text style={styles.ctaPrimaryText}>+ Build a Program</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.ctaSecondary}
                  onPress={() => Linking.openURL(`${WEB_BASE}/guide/sessions/draft`)}
                >
                  <Text style={styles.ctaSecondaryText}>+ Schedule Session</Text>
                </TouchableOpacity>
              </View>

              {/* My Programs (pipeline) */}
              {pipeline.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>MY PROGRAMS</Text>
                  {pipeline.map((t) => <TemplateRow key={t.id} tmpl={t} />)}
                </View>
              )}

              {/* Live Programs */}
              {data.programs.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>LIVE PROGRAMS</Text>
                  {data.programs.map((p) => <ProgramRow key={p.code} program={p} />)}
                </View>
              )}

              {/* Upcoming Sessions */}
              {data.upcoming_sessions.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionLabel}>UPCOMING SESSIONS</Text>
                  {data.upcoming_sessions.map((s) => <SessionRow key={s.code} session={s} />)}
                </View>
              )}

              {data.programs.length === 0 && data.upcoming_sessions.length === 0 && pipeline.length === 0 && (
                <View style={styles.emptyBox}>
                  <Text style={styles.emptyText}>No programs or sessions yet.</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(`${WEB_BASE}/guide/templates`)}>
                    <Text style={styles.emptyLink}>Submit your first program →</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          );
        })()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#faf7f0" },
  topBar: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e8dfc8",
    backgroundColor: "#faf7f0",
  },
  topBarTitle: { fontSize: 16, fontWeight: "700", color: "#432104" },
  signOutBtn: {
    borderWidth: 1,
    borderColor: "#e8dfc8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  signOutText: { fontSize: 13, color: "#8B6F4E" },
  scroll: { padding: 20, paddingBottom: 60 },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9e9b97",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  pageTitle: { fontSize: 22, fontWeight: "700", color: "#432104", marginBottom: 24 },
  centered: { paddingTop: 60, alignItems: "center" },
  errorText: { fontSize: 14, color: "#8B6F4E", textAlign: "center" },

  statsRow: { flexDirection: "row", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  statCard: {
    flex: 1,
    minWidth: 70,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e8dfc8",
    borderRadius: 10,
    padding: 12,
  },
  statValue: { fontSize: 20, fontWeight: "700", color: "#432104", marginBottom: 2 },
  statLabel: { fontSize: 10, fontWeight: "600", color: "#9e9b97", letterSpacing: 0.4 },

  ctaRow: { flexDirection: "row", gap: 10, marginBottom: 28, flexWrap: "wrap" },
  ctaPrimary: {
    backgroundColor: "#c9a84c",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  ctaPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  ctaSecondary: {
    borderWidth: 1,
    borderColor: "#c9a84c",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  ctaSecondaryText: { color: "#c9a84c", fontWeight: "700", fontSize: 13 },

  section: { marginBottom: 28 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9e9b97",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  row: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e8dfc8",
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  rowHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  rowTitle: { fontSize: 14, fontWeight: "600", color: "#432104", marginBottom: 2 },
  rowMeta: { fontSize: 12, color: "#9e9b97" },
  rowStats: { flexDirection: "row", gap: 16 },
  statPill: { alignItems: "flex-end" },
  statPillNum: { fontSize: 15, fontWeight: "700", color: "#432104" },
  statPillLabel: { fontSize: 10, color: "#9e9b97" },
  statusBadge: { fontSize: 11, fontWeight: "700", letterSpacing: 0.4, textTransform: "uppercase" },

  joinUrlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f5f0e8",
    borderWidth: 1,
    borderColor: "#e8dfc8",
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
  },
  joinUrlText: { flex: 1, fontSize: 12, color: "#1d4ed8" },
  copyBtn: {
    backgroundColor: "#c9a84c",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  copyBtnDone: { backgroundColor: "#22863a" },
  copyBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  emptyBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#e8dfc8",
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
  },
  emptyText: { fontSize: 14, color: "#9e9b97", marginBottom: 10 },
  emptyLink: { fontSize: 14, color: "#c9a84c", fontWeight: "600" },
});
