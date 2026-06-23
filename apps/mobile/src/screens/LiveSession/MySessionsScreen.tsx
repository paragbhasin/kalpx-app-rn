/**
 * MySessionsScreen — TLP Phase 1.
 *
 * Shows user's registered sessions split into Upcoming / Past tabs.
 * Upcoming: sorted ascending by scheduled_at.
 * Past: sorted descending.
 *
 * "Join Now" shows when status='live' OR within 30 minutes of scheduled_at.
 */
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Fonts } from "../../theme/fonts";
import { fetchMyRegistrations, type MyRegistration } from "../../engine/liveSessionApi";

type TabKey = "upcoming" | "past";

const UPCOMING_STATUSES = new Set(["approved", "scheduled", "live"]);

function isUpcoming(reg: MyRegistration): boolean {
  const now = Date.now();
  const sessionTime = new Date(reg.scheduled_at).getTime();
  if (UPCOMING_STATUSES.has(reg.status) && sessionTime > now) return true;
  if (reg.status === "live") return true;
  return false;
}

function isJoinNowVisible(reg: MyRegistration): boolean {
  if (reg.status === "live") return true;
  const now = Date.now();
  const sessionTime = new Date(reg.scheduled_at).getTime();
  const thirtyMin = 30 * 60 * 1000;
  return sessionTime - now <= thirtyMin && sessionTime - now > -thirtyMin * 2;
}

function formatSessionTime(iso: string): string {
  try {
    const d = new Date(iso);
    const day = d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    const time = d
      .toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true })
      .toUpperCase();
    return `${day} · ${time}`;
  } catch {
    return iso;
  }
}

function platformLabel(platform: string): string {
  switch (platform.toLowerCase()) {
    case "zoom": return "Zoom";
    case "google_meet":
    case "google meet": return "Google Meet";
    case "youtube_live":
    case "youtube live": return "YouTube Live";
    default:
      return platform.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

function SessionCard({
  reg,
  isPast,
  onJoinNow,
}: {
  reg: MyRegistration;
  isPast: boolean;
  onJoinNow: () => void;
}) {
  const showJoinNow = !isPast && isJoinNowVisible(reg);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{reg.title}</Text>
        {reg.status === "live" ? (
          <View style={styles.liveBadge}>
            <Text style={styles.liveBadgeText}>LIVE</Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.cardTime}>{formatSessionTime(reg.scheduled_at)}</Text>

      <View style={styles.platformBadgeWrap}>
        <View style={styles.platformBadge}>
          <Text style={styles.platformBadgeText}>{platformLabel(reg.external_platform)}</Text>
        </View>
      </View>

      {isPast ? (
        <View style={styles.pastIndicators}>
          {reg.join_clicked ? (
            <View style={styles.indicator}>
              <Text style={styles.indicatorIcon}>✓</Text>
              <Text style={styles.indicatorText}>Attended</Text>
            </View>
          ) : null}
          {reg.reflection_completed ? (
            <View style={styles.indicator}>
              <Text style={styles.indicatorIcon}>✦</Text>
              <Text style={styles.indicatorText}>Reflected</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {showJoinNow ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onJoinNow}
          style={styles.joinNowBtn}
          accessibilityLabel={`Join ${reg.title} now`}
        >
          <Text style={styles.joinNowBtnText}>Join Now →</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function MySessionsScreen() {
  const navigation = useNavigation<any>();
  const [registrations, setRegistrations] = useState<MyRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("upcoming");

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          const data = await fetchMyRegistrations();
          if (!cancelled) setRegistrations(data);
        } catch {
          if (!cancelled) setError("Couldn't load your sessions. Please try again.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, []),
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#C99317" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const upcoming = registrations
    .filter(isUpcoming)
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const past = registrations
    .filter((r) => !isUpcoming(r))
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());

  const displayed = activeTab === "upcoming" ? upcoming : past;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <Text style={styles.backIconText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.screenTitle}>My Sessions</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "upcoming" && styles.tabActive]}
          onPress={() => setActiveTab("upcoming")}
          accessibilityLabel="Upcoming sessions"
        >
          <Text style={[styles.tabText, activeTab === "upcoming" && styles.tabTextActive]}>
            Upcoming ({upcoming.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "past" && styles.tabActive]}
          onPress={() => setActiveTab("past")}
          accessibilityLabel="Past sessions"
        >
          <Text style={[styles.tabText, activeTab === "past" && styles.tabTextActive]}>
            Past ({past.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {displayed.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              You haven't registered for any sessions yet.
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("LiveSessionsList")}
              style={styles.discoverLink}
            >
              <Text style={styles.discoverLinkText}>Discover live sessions →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {displayed.map((reg) => (
              <SessionCard
                key={reg.session_code}
                reg={reg}
                isPast={activeTab === "past"}
                onJoinNow={() =>
                  navigation.navigate("LiveSessionJoin", {
                    sessionCode: reg.session_code,
                    title: reg.title,
                    scheduledAt: reg.scheduled_at,
                    externalPlatform: reg.external_platform,
                    externalJoinUrl: reg.external_join_url,
                  })
                }
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FAF7F2" },
  center: {
    flex: 1,
    backgroundColor: "#FAF7F2",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  scroll: { paddingBottom: 60, paddingHorizontal: 20 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 20,
  },
  backIcon: { width: 40, alignItems: "flex-start" },
  backIconText: { fontSize: 32, color: "#432104", lineHeight: 36 },
  headerCenter: { flex: 1, alignItems: "center" },
  screenTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: "#432104",
  },

  tabBar: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#F0EAD8",
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: "#9A7548",
  },
  tabTextActive: {
    color: "#432104",
    fontFamily: Fonts.sans.semiBold,
  },

  list: { gap: 14 },

  card: {
    backgroundColor: "#FFF8EE",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    gap: 8,
  },
  cardTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 17,
    color: "#432104",
    flex: 1,
    lineHeight: 22,
  },
  liveBadge: {
    backgroundColor: "#C99317",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveBadgeText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 10,
    color: "#fff",
    letterSpacing: 0.5,
  },
  cardTime: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: "#7B6545",
    marginBottom: 10,
  },
  platformBadgeWrap: {
    flexDirection: "row",
    marginBottom: 12,
  },
  platformBadge: {
    backgroundColor: "#F0EAD8",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  platformBadgeText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: "#7B6545",
  },
  pastIndicators: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  indicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  indicatorIcon: {
    fontSize: 13,
    color: "#C99317",
  },
  indicatorText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: "#7B6545",
  },
  joinNowBtn: {
    backgroundColor: "#C99317",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  joinNowBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 14,
    color: "#fff",
  },

  emptyState: { alignItems: "center", marginTop: 80, paddingHorizontal: 20 },
  emptyText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#9A7548",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 22,
  },
  discoverLink: { paddingVertical: 10 },
  discoverLinkText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#C99317",
    textDecorationLine: "underline",
  },

  errorText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#432104",
    textAlign: "center",
    marginBottom: 20,
  },
  backBtn: { paddingVertical: 12, paddingHorizontal: 24 },
  backBtnText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    color: "#C99317",
  },
});
