/**
 * LiveSessionsListScreen — TLP Phase 1.
 *
 * Lists all live sessions from GET /api/live-sessions/.
 * Tap a row → LiveSessionDetailScreen.
 */
import { useNavigation } from "@react-navigation/native";
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
import { Fonts } from "../../theme/fonts";
import { fetchLiveSessions, type TLPLiveSession } from "../../engine/liveSessionApi";

const SESSION_TYPE_LABELS: Record<string, string> = {
  jaap: "Jaap",
  dhyaan: "Dhyaan",
  satsang: "Satsang",
  gita_class: "Gita Class",
  yoga: "Yoga",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Pending",
  submitted: "Pending",
  approved: "Approved",
  scheduled: "Upcoming",
  live: "LIVE",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "#9A7548",
  submitted: "#9A7548",
  approved: "#7B6545",
  scheduled: "#432104",
  live: "#C99317",
  completed: "#9A7548",
  cancelled: "#B04040",
};

function formatScheduledAt(iso: string): string {
  try {
    const d = new Date(iso);
    const dayName = d.toLocaleDateString("en-GB", { weekday: "short" });
    const day = d.getDate();
    const month = d.toLocaleDateString("en-GB", { month: "short" });
    const time = d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
    return `${dayName} ${day} ${month} · ${time}`;
  } catch {
    return iso;
  }
}

function SessionCard({ session, onPress }: { session: TLPLiveSession; onPress: () => void }) {
  const typeLabel =
    SESSION_TYPE_LABELS[session.session_type] ??
    session.session_type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const statusLabel = STATUS_LABELS[session.status] ?? session.status;
  const statusColor = STATUS_COLORS[session.status] ?? "#432104";

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={styles.card}
      accessibilityLabel={`${session.title}, ${typeLabel}, ${formatScheduledAt(session.scheduled_at)}`}
    >
      <View style={styles.cardTop}>
        <View style={styles.cardMeta}>
          <Text style={styles.typeLabel}>{typeLabel.toUpperCase()}</Text>
          <View style={[styles.statusChip, { borderColor: statusColor }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
        <Text style={styles.arrow}>→</Text>
      </View>

      <Text style={styles.title}>{session.title}</Text>
      <Text style={styles.guideName}>with {session.guide_name}</Text>

      <View style={styles.cardFooter}>
        <Text style={styles.scheduledAt}>{formatScheduledAt(session.scheduled_at)}</Text>
        <View style={styles.platformBadge}>
          <Text style={styles.platformText}>{session.external_platform}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function LiveSessionsListScreen() {
  const navigation = useNavigation<any>();
  const [sessions, setSessions] = useState<TLPLiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchLiveSessions();
        if (!cancelled) setSessions(data.sessions);
      } catch {
        if (!cancelled) setError("Couldn't load sessions. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
            <Text style={styles.backIconText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.screenTitle}>Live Sessions</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No upcoming sessions</Text>
            <Text style={styles.emptySubText}>Check back soon for new sessions.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {sessions.map((s) => (
              <SessionCard
                key={s.code}
                session={s}
                onPress={() => navigation.navigate("LiveSessionDetail", { code: s.code })}
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
  center: { flex: 1, backgroundColor: "#FAF7F2", justifyContent: "center", alignItems: "center", padding: 24 },
  scroll: { paddingBottom: 60, paddingHorizontal: 20 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 20,
  },
  backIcon: { width: 40, alignItems: "flex-start" },
  backIconText: { fontSize: 32, color: "#432104", lineHeight: 36 },
  headerCenter: { flex: 1, alignItems: "center" },
  screenTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: "#432104",
  },

  list: { gap: 12 },

  card: {
    backgroundColor: "#FFF8EE",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 18,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  typeLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 10,
    color: "#9A7548",
    letterSpacing: 0.06,
  },
  statusChip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 10,
    letterSpacing: 0.04,
  },
  arrow: { fontSize: 18, color: "#C99317" },

  title: {
    fontFamily: Fonts.serif.bold,
    fontSize: 17,
    color: "#432104",
    marginBottom: 4,
  },
  guideName: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#7B6545",
    marginBottom: 12,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scheduledAt: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: "#432104",
  },
  platformBadge: {
    backgroundColor: "#F0EAD8",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  platformText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: "#7B6545",
  },

  emptyState: { alignItems: "center", marginTop: 80 },
  emptyText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 20,
    color: "#432104",
    marginBottom: 8,
  },
  emptySubText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#9A7548",
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
