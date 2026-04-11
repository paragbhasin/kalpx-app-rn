import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { mitraFetchProgress } from "../engine/mitraApi";
import { Fonts } from "../theme/fonts";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ProgressData {
  today?: {
    dayNumber: number;
    coreActivity: {
      mantra: { sessions: number };
      sankalp: { embodied: boolean };
      practice: { sessions: number };
    };
  };
  cycle?: {
    daysEngaged: number;
    daysFullyCompleted: number;
    supportActivity: {
      checkinCount: number;
      triggerSessions: number;
      resolvedAtReset: number;
    };
  };
  journey?: {
    totalDays: number;
  };
  weeklyTrend?: Array<{
    day: string;
    engaged: boolean;
    fullyCompleted: boolean;
  }>;
}

const ProgressSectionBlock: React.FC = () => {
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProgressData | null>(null);

  const fetchProgress = async () => {
    setLoading(true);
    try {
      const res = await mitraFetchProgress();
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error("[Progress] Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
    if (!expanded && !data) {
      fetchProgress();
    }
  };

  const today = data?.today;
  const cycle = data?.cycle;
  const trend = data?.weeklyTrend || [];
  const totalDays = data?.journey?.totalDays || 14;

  const mantraDone = (today?.coreActivity?.mantra?.sessions || 0) > 0;
  const sankalpDone = !!today?.coreActivity?.sankalp?.embodied;
  const practiceDone = (today?.coreActivity?.practice?.sessions || 0) > 0;
  const todayCoreDone = [mantraDone, sankalpDone, practiceDone].filter(
    Boolean,
  ).length;

  return (
    <View style={styles.container}>
      {/* Header / Toggle Button */}
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.8}
        style={styles.toggleBtn}
      >
        <LinearGradient
          colors={["rgba(255, 252, 248, 0.92)", "rgba(247, 239, 229, 0.9)"]}
          style={styles.toggleGradient}
        >
          <Text style={styles.toggleLabel}>Your Progress</Text>
          <Ionicons
            name={expanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#9d876d"
          />
        </LinearGradient>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          {loading && !data ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="#d4a017" />
            </View>
          ) : data ? (
            <View style={styles.body}>
              <View style={styles.mainCard}>
                <Text style={styles.cardHeading}>
                  Today — Day {today?.dayNumber}
                </Text>

                <View style={styles.todayGrid}>
                  {/* Mantra */}
                  <View
                    style={[
                      styles.todayItem,
                      mantraDone && styles.todayItemDone,
                    ]}
                  >
                    <View style={styles.itemBadge}>
                      <Text style={styles.itemBadgeText}>MANTRA</Text>
                    </View>
                    <Text style={styles.itemStatus}>
                      {mantraDone
                        ? `${today?.coreActivity?.mantra?.sessions} session${
                            today?.coreActivity?.mantra?.sessions === 1
                              ? ""
                              : "s"
                          }`
                        : "Not yet"}
                    </Text>
                  </View>

                  {/* Sankalp */}
                  <View
                    style={[
                      styles.todayItem,
                      sankalpDone && styles.todayItemDone,
                    ]}
                  >
                    <View style={styles.itemBadge}>
                      <Text style={styles.itemBadgeText}>SANKALP</Text>
                    </View>
                    <Text style={styles.itemStatus}>
                      {sankalpDone ? "Embodied" : "Not yet"}
                    </Text>
                  </View>

                  {/* Practice */}
                  <View
                    style={[
                      styles.todayItem,
                      practiceDone && styles.todayItemDone,
                    ]}
                  >
                    <View style={styles.itemBadge}>
                      <Text style={styles.itemBadgeText}>PRACTICE</Text>
                    </View>
                    <Text style={styles.itemStatus}>
                      {practiceDone
                        ? `${today?.coreActivity?.practice?.sessions} session${
                            today?.coreActivity?.practice?.sessions === 1
                              ? ""
                              : "s"
                          }`
                        : "Not yet"}
                    </Text>
                  </View>
                </View>

                <Text style={styles.todaySummary}>
                  Progress: {todayCoreDone} / 3
                </Text>

                {/* Cycle Stats */}
                <View style={[styles.subCard, { marginTop: 24 }]}>
                  <Text style={styles.subHeading}>This Cycle</Text>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Days Engaged</Text>
                    <Text style={styles.statValue}>
                      {cycle?.daysEngaged || 0} / {totalDays}
                    </Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Fully Completed</Text>
                    <Text style={styles.statValue}>
                      {cycle?.daysFullyCompleted || 0} / {totalDays}
                    </Text>
                  </View>
                  {!!cycle?.supportActivity?.checkinCount && (
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Check-ins</Text>
                      <Text style={styles.statValue}>
                        {cycle.supportActivity.checkinCount}
                      </Text>
                    </View>
                  )}
                  {!!cycle?.supportActivity?.triggerSessions && (
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Trigger Sessions</Text>
                      <Text style={styles.statValue}>
                        {cycle.supportActivity.triggerSessions}
                      </Text>
                    </View>
                  )}
                  {!!cycle?.supportActivity?.resolvedAtReset && (
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Settled with Breath</Text>
                      <Text style={styles.statValue}>
                        {cycle.supportActivity.resolvedAtReset}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Weekly Trend (Rhythm Dots) */}
                {trend.length > 0 && (
                  <View style={[styles.subCard, { marginTop: 15 }]}>
                    <Text style={styles.subHeading}>Daily Rhythm</Text>
                    <View style={styles.rhythmDots}>
                      {trend.map((day, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.rhythmDot,
                            day.fullyCompleted && styles.rhythmDotComplete,
                            !day.fullyCompleted &&
                              day.engaged &&
                              styles.rhythmDotEngaged,
                          ]}
                        />
                      ))}
                    </View>
                    <View style={styles.legend}>
                      <View style={styles.legendItem}>
                        <View
                          style={[styles.legendDot, styles.rhythmDotComplete]}
                        />
                        <Text style={styles.legendText}>Completed</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={styles.legendDot} />
                        <Text style={styles.legendText}>Missed</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    width: "100%",
  },
  toggleBtn: {
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(214, 176, 109, 0.42)",
    shadowColor: "#7b5c35",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 4,
  },
  toggleGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  toggleLabel: {
    fontFamily: Fonts.serif.bold,
    fontSize: 20,
    color: "#4a2508",
  },
  content: {
    width: "100%",
  },
  loadingContainer: {
    padding: 30,
    alignItems: "center",
  },
  body: {
    paddingTop: 14,
  },
  mainCard: {
    padding: 15,
    borderRadius: 15,
    // backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(218, 183, 122, 0.36)",
    shadowColor: "#7b5c35",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 3,
  },
  cardHeading: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: "#432104",
    marginBottom: 16,
  },
  todayGrid: {
    flexDirection: "row",
    gap: 10,
  },
  todayItem: {
    flex: 1,
    padding: 10,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(230, 216, 198, 0.8)",
  },
  todayItemDone: {
    backgroundColor: "rgba(255, 252, 248, 0.9)",
    borderColor: "rgba(211, 179, 130, 0.9)",
  },
  itemBadge: {
    alignSelf: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
    backgroundColor: "#f1e8dc",
    marginBottom: 10,
  },
  itemBadgeText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 9,
    color: "#8d7453",
    letterSpacing: 1,
  },
  itemStatus: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "#7f7367",
    textAlign: "center",
  },
  todaySummary: {
    textAlign: "center",
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#4e3623",
    marginTop: 18,
  },
  subCard: {
    padding: 15,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(218, 183, 122, 0.2)",
  },
  subHeading: {
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    color: "#432104",
    marginBottom: 12,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(223, 210, 193, 0.4)",
  },
  statLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#5a4a2a",
  },
  statValue: {
    fontFamily: Fonts.sans.bold,
    fontSize: 14,
    color: "#432104",
  },
  rhythmDots: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    marginTop: 4,
  },
  rhythmDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#efe5dc",
    borderWidth: 1,
    borderColor: "rgba(202, 182, 156, 0.58)",
  },
  rhythmDotComplete: {
    backgroundColor: "#6d7f74",
    borderColor: "#6d7f74",
  },
  rhythmDotEngaged: {
    backgroundColor: "#c9b19a",
    borderColor: "#c9b19a",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
    marginTop: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#efe5dc",
  },
  legendText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "#8a7a5a",
  },
});

export default ProgressSectionBlock;
