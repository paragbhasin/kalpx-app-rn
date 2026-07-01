import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Clipboard,
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
  fetchGuideAllTestimonials,
  guideModerateTestimonial,
  type GuideDashboard,
  type GuideDashboardTemplate,
  type GuideProgram,
  type GuideSession,
  type GuideTestimonialFull,
} from "../../engine/liveSessionApi";
import { performLogout } from "../../utils/logout";
import api from "../../Networks/axios";

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

// ─── Impact stat card ──────────────────────────────────────────────
function ImpactCard({
  label,
  sublabel,
  value,
}: {
  label: string;
  sublabel: string;
  value: number | string;
}) {
  return (
    <View style={styles.impactCard}>
      <Text style={styles.impactValue}>{value}</Text>
      <Text style={styles.impactLabel}>{label}</Text>
      <Text style={styles.impactSub}>{sublabel}</Text>
    </View>
  );
}

// ─── Live program row ───────────────────────────────────────────────
function ProgramRow({
  program,
  onView,
}: {
  program: GuideProgram;
  onView?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const joinUrl = program.join_url || "";

  const handleCopy = () => {
    if (!joinUrl) return;
    Clipboard.setString(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pendingCount =
    program.testimonials_count - (program.approved_testimonials_count ?? 0);

  return (
    <View style={styles.row}>
      {/* Title + View */}
      <View style={styles.rowTop}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {program.title}
        </Text>
        {!!program.template_id && !!onView && (
          <TouchableOpacity style={styles.ghostBtn} onPress={onView}>
            <Text style={styles.ghostBtnText}>View</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status + start date */}
      <Text style={styles.rowMeta}>
        <Text style={{ color: "#22863a", fontWeight: "700" }}>
          • {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
        </Text>
        {program.start_date
          ? `  ·  Starts ${new Date(program.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
          : "  ·  No start date"}
        {program.max_participants
          ? `  ·  Max ${program.max_participants}`
          : "  ·  Unlimited"}
      </Text>

      {/* Metrics row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Text style={styles.metricNum}>{program.joined_count}</Text>
          <Text style={styles.metricLabel}>Joined</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricNum}>{program.active_count ?? 0}</Text>
          <Text style={styles.metricLabel}>Active</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricNum}>{program.completed_count ?? 0}</Text>
          <Text style={styles.metricLabel}>Completed</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricNum}>{program.testimonials_count}</Text>
          <Text style={styles.metricLabel}>Testimonials</Text>
          {pendingCount > 0 && (
            <View style={styles.pendingBadge}>
              <Text style={styles.pendingBadgeText}>{pendingCount} pending</Text>
            </View>
          )}
        </View>
      </View>

      {/* Join URL */}
      {!!joinUrl && (
        <View style={styles.joinUrlRow}>
          <Text style={styles.joinUrlText} numberOfLines={1}>
            {joinUrl}
          </Text>
          <TouchableOpacity
            style={[styles.copyBtn, copied && styles.copyBtnDone]}
            onPress={handleCopy}
          >
            <Text style={styles.copyBtnText}>
              {copied ? "Copied!" : "Copy link"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Session row ────────────────────────────────────────────────────
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
      <View style={styles.rowTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {session.title}
          </Text>
          <Text style={styles.rowMeta}>
            {date} · {session.status}
          </Text>
        </View>
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricNum}>
              {session.registered_count > 0 ? session.registered_count : "—"}
            </Text>
            <Text style={styles.metricLabel}>registered</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricNum}>{session.reflection_count}</Text>
            <Text style={styles.metricLabel}>reflected</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Template (in-review) row ───────────────────────────────────────
function TemplateRow({
  tmpl,
  onEdit,
  onView,
  onLaunched,
}: {
  tmpl: GuideDashboardTemplate;
  onEdit: (id: number) => void;
  onView: (id: number) => void;
  onLaunched: (joinUrl: string) => void;
}) {
  const color = STATUS_COLOR[tmpl.review_status] ?? "#8B6F4E";
  const label = STATUS_LABEL[tmpl.review_status] ?? tmpl.review_status;
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState("");

  const canEdit = ["submitted", "under_review", "changes_requested"].includes(
    tmpl.review_status,
  );

  const handleLaunch = async () => {
    setLaunching(true);
    setLaunchError("");
    try {
      const res = await api.post<{ code: string; join_url: string }>(
        `guide/my-templates/${tmpl.id}/launch/`,
      );
      onLaunched(res.data.join_url);
    } catch (e: any) {
      setLaunchError(
        e?.response?.data?.detail || "Launch failed. Please try again.",
      );
    } finally {
      setLaunching(false);
    }
  };

  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={styles.rowTitle} numberOfLines={1}>
            {tmpl.title || "Untitled Program"}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 3 }}>
            <Text style={[styles.statusBadge, { color }]}>{label}</Text>
            <Text style={styles.rowMeta}>· {tmpl.duration_days} days</Text>
            {tmpl.desired_start_date && (
              <Text style={styles.rowMeta}>
                · Starts{" "}
                {new Date(tmpl.desired_start_date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </Text>
            )}
          </View>
        </View>
      </View>
      <View style={[styles.rowTop, { marginTop: 10, gap: 8 }]}>
        {canEdit && (
          <TouchableOpacity
            style={styles.goldBtn}
            onPress={() => onEdit(tmpl.id)}
          >
            <Text style={styles.goldBtnText}>Edit</Text>
          </TouchableOpacity>
        )}
        {tmpl.review_status === "approved" && (
          <TouchableOpacity
            style={[styles.launchBtn, launching && { opacity: 0.6 }]}
            onPress={handleLaunch}
            disabled={launching}
          >
            <Text style={styles.launchBtnText}>
              {launching ? "Launching…" : "🚀 Launch"}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.ghostBtn}
          onPress={() => onView(tmpl.id)}
        >
          <Text style={styles.ghostBtnText}>View Details</Text>
        </TouchableOpacity>
      </View>
      {!!launchError && (
        <Text style={styles.launchError}>{launchError}</Text>
      )}
    </View>
  );
}

// ─── Testimonials section ───────────────────────────────────────────
function TestimonialsSection({ programs }: { programs: GuideProgram[] }) {
  const [testimonials, setTestimonials] = useState<GuideTestimonialFull[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "pending" | "approved">("all");
  const [acting, setActing] = useState<number | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const all = await Promise.all(
        programs.map((p) =>
          fetchGuideAllTestimonials(p.code).then((r) => r.testimonials),
        ),
      );
      setTestimonials(all.flat());
    } finally {
      setLoading(false);
    }
  }, [programs]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const moderate = async (
    t: GuideTestimonialFull,
    newStatus: "approved" | "rejected",
  ) => {
    setActing(t.id);
    try {
      await guideModerateTestimonial(t.campaign_code, t.id, newStatus);
      setTestimonials((prev) =>
        prev.map((x) =>
          x.id === t.id ? { ...x, moderation_status: newStatus } : x,
        ),
      );
    } catch {
      Alert.alert("Error", "Could not update testimonial. Please try again.");
    } finally {
      setActing(null);
    }
  };

  if (loading || testimonials.length === 0) return null;

  const tabs: ("all" | "pending" | "approved")[] = ["all", "pending", "approved"];
  const filtered = testimonials.filter((t) =>
    tab === "all" ? true : (t.moderation_status ?? "") === tab,
  );
  const starStr = (r: number | null) =>
    r ? "★".repeat(r) + "☆".repeat(5 - r) : "";

  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>TESTIMONIALS</Text>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {tabs.map((t) => {
          const count = testimonials.filter((x) =>
            t === "all" ? true : (x.moderation_status ?? "") === t,
          ).length;
          return (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  tab === t && styles.tabBtnTextActive,
                ]}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {filtered.length === 0 ? (
        <Text style={styles.rowMeta}>No {tab} testimonials.</Text>
      ) : (
        filtered.map((t) => (
          <View key={t.id} style={styles.testimonialCard}>
            {!!t.program_name && (
              <Text style={styles.testimonialProgram}>{t.program_name}</Text>
            )}
            <View style={styles.rowTop}>
              <Text style={styles.testimonialName}>{t.display_name}</Text>
              <Text style={styles.testimonialStars}>{starStr(t.rating)}</Text>
            </View>
            <Text style={styles.testimonialText}>"{t.testimonial_text}"</Text>
            <View style={[styles.rowTop, { marginTop: 8, flexWrap: "wrap", gap: 8 }]}>
              <Text style={styles.rowMeta}>{t.created_at}</Text>
              <View
                style={[
                  styles.statusChip,
                  t.moderation_status === "approved" && styles.statusChipGreen,
                  t.moderation_status === "rejected" && styles.statusChipRed,
                ]}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    t.moderation_status === "approved" && { color: "#2E7D32" },
                    t.moderation_status === "rejected" && { color: "#C05B3A" },
                  ]}
                >
                  {(t.moderation_status ?? "").toUpperCase()}
                </Text>
              </View>
            </View>
            {t.moderation_status === "pending" && (
              <View style={[styles.rowTop, { marginTop: 10, gap: 8 }]}>
                <TouchableOpacity
                  style={styles.approveBtn}
                  disabled={acting === t.id}
                  onPress={() => moderate(t, "approved")}
                >
                  <Text style={styles.approveBtnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectBtn}
                  disabled={acting === t.id}
                  onPress={() => moderate(t, "rejected")}
                >
                  <Text style={styles.rejectBtnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))
      )}
    </View>
  );
}

// ─── Main screen ────────────────────────────────────────────────────
export default function GuideHomeScreen() {
  const navigation = useNavigation<any>();
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [refreshing, setRefreshing] = useState(false);
  const [launchResult, setLaunchResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchGuideDashboard();
      setState({ kind: "loaded", data });
    } catch {
      setState({ kind: "error" });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#c9a84c"
          />
        }
      >
        <Text style={styles.eyebrow}>GUIDE DASHBOARD</Text>
        <Text style={styles.pageTitle}>Your Impact at a Glance</Text>
        <Text style={styles.pageSub}>
          Here's how your programs are transforming lives.
        </Text>

        {state.kind === "loading" && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#c9a84c" />
          </View>
        )}

        {state.kind === "error" && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>
              Could not load dashboard. Pull down to retry.
            </Text>
          </View>
        )}

        {state.kind === "loaded" &&
          (() => {
            const { data } = state;
            const { summary } = data;
            const pipeline = (data.my_templates ?? []).filter((t) =>
              [
                "submitted",
                "under_review",
                "approved",
                "changes_requested",
              ].includes(t.review_status),
            );

            return (
              <>
                {/* Impact grid: 2×3 on mobile */}
                <View style={styles.impactGrid}>
                  <ImpactCard
                    label="Programs"
                    sublabel="Live programs"
                    value={summary.programs_count}
                  />
                  <ImpactCard
                    label="Total Participants"
                    sublabel="Across all programs"
                    value={summary.total_joined}
                  />
                  <ImpactCard
                    label="Active"
                    sublabel="Started the program"
                    value={summary.active_count_total ?? 0}
                  />
                  <ImpactCard
                    label="Completion Rate"
                    sublabel="Overall"
                    value={`${summary.completion_rate ?? 0}%`}
                  />
                  <ImpactCard
                    label="Testimonials"
                    sublabel="Received"
                    value={summary.testimonials_count}
                  />
                  <ImpactCard
                    label="Sessions"
                    sublabel="Scheduled"
                    value={summary.sessions_count}
                  />
                </View>

                {/* CTAs */}
                <View style={styles.ctaRow}>
                  <TouchableOpacity
                    style={styles.ctaPrimary}
                    onPress={() => navigation.navigate("GuideTemplateBrowser")}
                  >
                    <Text style={styles.ctaPrimaryText}>+ Build a Program</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.ctaSecondary}
                    onPress={() => navigation.navigate("GuideSessionDraft")}
                  >
                    <Text style={styles.ctaSecondaryText}>
                      + Schedule Session
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* My Programs (review pipeline) */}
                {pipeline.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>MY PROGRAMS</Text>
                    {launchResult && (
                      <View style={styles.launchSuccess}>
                        <Text style={styles.launchSuccessTitle}>
                          Program launched! Share this link:
                        </Text>
                        <View style={styles.joinUrlRow}>
                          <Text
                            style={styles.joinUrlText}
                            numberOfLines={1}
                          >
                            {launchResult}
                          </Text>
                          <TouchableOpacity
                            style={styles.copyBtn}
                            onPress={() => Clipboard.setString(launchResult)}
                          >
                            <Text style={styles.copyBtnText}>Copy</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    {pipeline.map((t) => (
                      <TemplateRow
                        key={t.id}
                        tmpl={t}
                        onEdit={(id) =>
                          navigation.navigate("GuideTemplateDayEditor", {
                            templateId: id,
                          })
                        }
                        onView={(id) =>
                          navigation.navigate("GuideTemplateDayEditor", {
                            templateId: id,
                            viewOnly: true,
                          })
                        }
                        onLaunched={(joinUrl) => {
                          setLaunchResult(joinUrl);
                          load();
                        }}
                      />
                    ))}
                  </View>
                )}

                {/* Live Programs */}
                {data.programs.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>LIVE PROGRAMS</Text>
                    {data.programs.map((p) => (
                      <ProgramRow
                        key={p.code}
                        program={p}
                        onView={
                          p.template_id
                            ? () =>
                                navigation.navigate("GuideTemplateDayEditor", {
                                  templateId: p.template_id,
                                  viewOnly: true,
                                })
                            : undefined
                        }
                      />
                    ))}
                  </View>
                )}

                {/* Testimonials */}
                {data.programs.length > 0 && (
                  <TestimonialsSection programs={data.programs} />
                )}

                {/* Upcoming Sessions */}
                {data.upcoming_sessions.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionLabel}>UPCOMING SESSIONS</Text>
                    {data.upcoming_sessions.map((s) => (
                      <SessionRow key={s.code} session={s} />
                    ))}
                  </View>
                )}

                {data.programs.length === 0 &&
                  data.upcoming_sessions.length === 0 &&
                  pipeline.length === 0 && (
                    <View style={styles.emptyBox}>
                      <Text style={styles.emptyText}>
                        No programs or sessions yet.
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          navigation.navigate("GuideTemplateBrowser")
                        }
                      >
                        <Text style={styles.emptyLink}>
                          Submit your first program →
                        </Text>
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
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9e9b97",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  pageTitle: { fontSize: 22, fontWeight: "700", color: "#432104", marginBottom: 4 },
  pageSub: { fontSize: 13, color: "#9e9b97", marginBottom: 24 },
  centered: { paddingTop: 60, alignItems: "center" },
  errorText: { fontSize: 14, color: "#8B6F4E", textAlign: "center" },

  // Impact grid — 2 columns
  impactGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  impactCard: {
    width: "47%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e8dfc8",
    borderRadius: 12,
    padding: 14,
  },
  impactValue: { fontSize: 22, fontWeight: "700", color: "#432104", marginBottom: 2 },
  impactLabel: { fontSize: 13, fontWeight: "600", color: "#432104", marginBottom: 2 },
  impactSub: { fontSize: 11, color: "#9e9b97" },

  // CTAs
  ctaRow: { gap: 10, marginBottom: 28 },
  ctaPrimary: {
    backgroundColor: "#c9a84c",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaPrimaryText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  ctaSecondary: {
    borderWidth: 1.5,
    borderColor: "#c9a84c",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  ctaSecondaryText: { color: "#c9a84c", fontWeight: "700", fontSize: 15 },

  // Section
  section: { marginBottom: 28 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9e9b97",
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  // Card row
  row: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e8dfc8",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  rowTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  rowTitle: { fontSize: 14, fontWeight: "600", color: "#432104", flex: 1, marginBottom: 3 },
  rowMeta: { fontSize: 12, color: "#9e9b97", marginBottom: 2 },
  statusBadge: { fontSize: 11, fontWeight: "700", letterSpacing: 0.4, textTransform: "uppercase" },

  // Metrics
  metricsRow: { flexDirection: "row", gap: 16, marginTop: 10, flexWrap: "wrap" },
  metricItem: { alignItems: "center", minWidth: 56 },
  metricNum: { fontSize: 16, fontWeight: "700", color: "#432104" },
  metricLabel: { fontSize: 10, color: "#9e9b97", marginTop: 1 },

  // Pending badge
  pendingBadge: {
    backgroundColor: "#FFF3CC",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 3,
  },
  pendingBadgeText: { fontSize: 9, fontWeight: "700", color: "#9A7548" },

  // Buttons
  ghostBtn: {
    borderWidth: 1,
    borderColor: "#e8dfc8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ghostBtnText: { fontSize: 12, fontWeight: "600", color: "#9e9b97" },
  goldBtn: {
    borderWidth: 1,
    borderColor: "#c9a84c",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  goldBtnText: { fontSize: 12, fontWeight: "600", color: "#c9a84c" },
  launchBtn: {
    backgroundColor: "#c9a84c",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  launchBtnText: { fontSize: 12, fontWeight: "700", color: "#fff" },
  launchError: { fontSize: 12, color: "#c0392b", marginTop: 6 },

  // Join URL
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
    paddingVertical: 5,
  },
  copyBtnDone: { backgroundColor: "#22863a" },
  copyBtnText: { color: "#fff", fontSize: 12, fontWeight: "600" },

  // Launch success
  launchSuccess: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#86efac",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  launchSuccessTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
    marginBottom: 8,
  },

  // Testimonials
  tabRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  tabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#e0d5c5",
  },
  tabBtnActive: { borderColor: "#c9a84c", backgroundColor: "#c9a84c" },
  tabBtnText: { fontSize: 12, fontWeight: "600", color: "#9e9b97" },
  tabBtnTextActive: { color: "#fff" },
  testimonialCard: {
    backgroundColor: "#faf7f2",
    borderWidth: 1,
    borderColor: "#e8d9b5",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  testimonialProgram: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9e9b97",
    marginBottom: 6,
  },
  testimonialName: { fontSize: 13, fontWeight: "600", color: "#432104", flex: 1 },
  testimonialStars: { fontSize: 14, color: "#c9a84c" },
  testimonialText: {
    fontSize: 14,
    color: "#432104",
    lineHeight: 20,
    marginTop: 4,
    fontStyle: "italic",
  },
  statusChip: {
    backgroundColor: "#FFF3CC",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusChipGreen: { backgroundColor: "#DCF0D8" },
  statusChipRed: { backgroundColor: "#FCE8E4" },
  statusChipText: { fontSize: 10, fontWeight: "700", color: "#9A7548", textTransform: "uppercase" },
  approveBtn: {
    backgroundColor: "#2E5723",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  approveBtnText: { fontSize: 12, fontWeight: "600", color: "#fff" },
  rejectBtn: {
    borderWidth: 1,
    borderColor: "#C05B3A",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  rejectBtnText: { fontSize: 12, fontWeight: "600", color: "#C05B3A" },

  // Empty
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
