/**
 * ProgramsDiscoveryScreen — TLP Phase 1.
 *
 * Lists all programs from GET /api/programs/.
 * "Join Program →" → navigate to ProgramInviteClaimScreen with { code }.
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
import { fetchPrograms, type TLPProgram } from "../../engine/liveSessionApi";

function ProgramCard({
  program,
  onJoin,
}: {
  program: TLPProgram;
  onJoin: () => void;
}) {
  return (
    <View style={styles.card}>
      {/* Duration badge */}
      {program.duration_days ? (
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{program.duration_days}-day program</Text>
        </View>
      ) : null}

      <Text style={styles.programName}>{program.name}</Text>

      <View style={styles.leaderRow}>
        <Text style={styles.leaderLabel}>Led by </Text>
        <Text style={styles.leaderName}>{program.leader_name}</Text>
      </View>

      {program.community_name ? (
        <Text style={styles.communityName}>{program.community_name}</Text>
      ) : null}

      {program.description ? (
        <Text style={styles.description} numberOfLines={3}>
          {program.description}
        </Text>
      ) : null}

      {program.start_date ? (
        <Text style={styles.startDate}>
          Starts {formatDate(program.start_date)}
        </Text>
      ) : null}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onJoin}
        style={styles.joinBtn}
        accessibilityLabel={`Join ${program.name}`}
      >
        <Text style={styles.joinBtnText}>Join Program →</Text>
      </TouchableOpacity>
    </View>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso;
  }
}

export default function ProgramsDiscoveryScreen() {
  const navigation = useNavigation<any>();
  const [programs, setPrograms] = useState<TLPProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchPrograms();
        if (!cancelled) setPrograms(data.programs);
      } catch {
        if (!cancelled) setError("Couldn't load programs. Please try again.");
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
            <Text style={styles.screenTitle}>Programs</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {programs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No programs available</Text>
            <Text style={styles.emptySubText}>Check back soon for new programs.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {programs.map((p) => (
              <ProgramCard
                key={p.code}
                program={p}
                onJoin={() =>
                  navigation.navigate("ProgramInviteClaimScreen", { code: p.code })
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

  list: { gap: 16 },

  card: {
    backgroundColor: "#FFF8EE",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 20,
  },

  durationBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F0EAD8",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  durationText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: "#7B6545",
  },

  programName: {
    fontFamily: Fonts.serif.bold,
    fontSize: 20,
    color: "#432104",
    marginBottom: 8,
    lineHeight: 26,
  },

  leaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  leaderLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#9A7548",
  },
  leaderName: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 13,
    color: "#432104",
  },

  communityName: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "#9A7548",
    marginBottom: 12,
  },

  description: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#7B6545",
    lineHeight: 20,
    marginBottom: 12,
  },

  startDate: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: "#9A7548",
    marginBottom: 16,
  },

  joinBtn: {
    backgroundColor: "#C99317",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  joinBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: "#fff",
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
