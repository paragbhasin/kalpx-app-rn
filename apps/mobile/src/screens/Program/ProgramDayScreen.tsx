/**
 * ProgramDayScreen — Gate 3 MOB-4.
 *
 * Forked from InnerPathScreen concept; DO NOT modify InnerPathScreen.
 * Loads day content from GET /api/programs/my-active/day/{N}/ and
 * shows the prescribed mantra, sankalp, and practice for that day.
 *
 * On completing all 3 items → "Complete Day" CTA → ProgramCompletionScreen.
 */
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  completeProgramDay,
  fetchProgramDay,
  postProgramActivity,
  type ProgramDayContent,
  type ProgramDayItem,
  type WisdomCard,
} from "../../engine/programApi";
import { Fonts } from "../../theme/fonts";

const SUPPORT_URL = "https://kalpx.com/programs/support";

/** Returns a short human-readable title for the card. */
function getCardTitle(item: ProgramDayItem): string {
  if (item.item_type === "mantra") {
    // item_id like "mantra.durga_suktam" → "Durga Suktam"
    const base = item.item_id.replace(/^mantra\./, "");
    return base.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  }
  if (item.item_type === "sankalp" && item.line) {
    return item.line;
  }
  return item.title;
}

function ItemCard({
  item,
  label,
  done,
  onPress,
}: {
  item: ProgramDayItem;
  label: string;
  done: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={onPress}
      style={[styles.itemCard, done && styles.itemCardDone]}
      accessibilityLabel={`${label}: ${getCardTitle(item)}${done ? " (done)" : ""}`}
    >
      <View style={styles.itemCardLeft}>
        <Text style={styles.itemLabel}>{label}</Text>
        <Text style={styles.itemTitle}>{getCardTitle(item)}</Text>
      </View>
      <View style={styles.itemCardRight}>
        {done ? (
          <Text style={styles.doneCheckmark}>✓</Text>
        ) : (
          <Text style={styles.itemArrow}>→</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ProgramDayScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { dayNumber, completedItems } = route.params ?? {};

  const [dayContent, setDayContent] = useState<ProgramDayContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const firedAnalyticsRef = useRef(false);
  const dayCompletedRef = useRef(false);

  // completedItems is passed back by each runner and accumulated there.
  // Reading directly from params avoids any stale-state/remount issues.
  const sessionDone = new Set<string>(
    Array.isArray(completedItems) ? completedItems : [],
  );

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          const data = await fetchProgramDay(dayNumber);
          if (!cancelled) {
            setDayContent(data);
            if (!firedAnalyticsRef.current) {
              firedAnalyticsRef.current = true;
              postProgramActivity("program_day_started", {
                day_number: data.day_number,
              }).catch(() => {});
              if (data.day_number === 2) {
                postProgramActivity("program_day_2_started", {
                  day_number: 2,
                }).catch(() => {});
              }
            }
          }
        } catch (err: any) {
          if (cancelled) return;
          const status = err?.response?.status;
          if (status === 403) setError("Complete the previous day first.");
          else if (status === 404) setError("Day not found in your program.");
          else setError("Couldn't load today's practice. Please try again.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [dayNumber]),
  );

  const handleLaunchRunner = (item: ProgramDayItem) => {
    const screenMap: Record<string, string> = {
      mantra: "ProgramMantraRunner",
      sankalp: "ProgramSankalpRunner",
      practice: "ProgramPracticeRunner",
    };
    const screen = screenMap[item.item_type];
    if (!screen) return;
    // Pass current completedItems so the runner can append to the list on complete
    navigation.navigate(screen, {
      item,
      dayNumber,
      completedItems: Array.from(sessionDone),
    });
  };

  const allItems = dayContent
    ? ([dayContent.mantra, dayContent.sankalp, dayContent.practice].filter(
        Boolean,
      ) as ProgramDayItem[])
    : [];

  const isItemDone = (item: ProgramDayItem) =>
    dayContent?.is_completed || sessionDone.has(item.item_id);

  const allDone = allItems.length > 0 && allItems.every(isItemDone);

  // All 3 done freshly in this session — call backend once to unlock next day
  const completedInSession =
    allItems.length > 0 && allItems.every((i) => sessionDone.has(i.item_id));

  useEffect(() => {
    if (
      completedInSession &&
      !loading &&
      dayContent &&
      !dayCompletedRef.current
    ) {
      dayCompletedRef.current = true;
      completeProgramDay(dayNumber).catch(() => {});
      // Navigate to reflection screen after a short delay so user sees all checkmarks
      setTimeout(() => {
        navigation.navigate("ProgramReflectionScreen", {
          dayNumber,
          reflectionPrompt: dayContent.reflection_prompt || null,
        });
      }, 800);
    }
  }, [completedInSession, loading, dayContent, dayNumber]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#C99317" />
      </SafeAreaView>
    );
  }

  if (error || !dayContent) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error ?? "Something went wrong."}</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const ITEM_LABELS: Record<string, string> = {
    mantra: "Mantra",
    sankalp: "Sankalp",
    practice: "Practice",
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backIcon}
          >
            <Text style={styles.backIconText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.dayLabel}>DAY {dayContent.day_number}</Text>
            <Text style={styles.themeText}>{dayContent.theme}</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Item cards */}
        <View style={styles.itemsSection}>
          {allItems.map((item) => (
            <ItemCard
              key={item.item_id}
              item={item}
              label={ITEM_LABELS[item.item_type] ?? item.item_type}
              done={isItemDone(item)}
              onPress={() => handleLaunchRunner(item)}
            />
          ))}
        </View>

        {/* Wisdom card — tappable, opens ProgramWisdomRunner */}
        {dayContent.wisdom_card ? (
          <TouchableOpacity
            style={styles.wisdomCard}
            activeOpacity={0.82}
            onPress={() =>
              navigation.navigate("ProgramWisdomRunner", {
                wisdom: dayContent.wisdom_card,
                dayNumber: dayContent.day_number,
              })
            }
            accessibilityLabel="Wisdom of the Day"
          >
            <View style={styles.wisdomCardInner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.wisdomLabel}>WISDOM OF THE DAY</Text>
                <Text style={styles.wisdomText} numberOfLines={2}>
                  {dayContent.wisdom_card.text}
                </Text>
              </View>
              <Text style={styles.itemArrow}>→</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Live session */}
        {dayContent.day_join_url ? (
          <TouchableOpacity
            style={styles.liveSessionCard}
            onPress={() => Linking.openURL(dayContent.day_join_url!)}
            activeOpacity={0.82}
            accessibilityLabel="Join live session"
          >
            <View style={styles.liveSessionLeft}>
              <Text style={styles.liveSessionLabel}>LIVE SESSION</Text>
              {dayContent.day_session_time ? (
                <Text style={styles.liveSessionTime}>
                  {dayContent.day_session_time}
                  {dayContent.day_session_timezone ? ` ${dayContent.day_session_timezone}` : ''}
                </Text>
              ) : null}
              <Text style={styles.liveSessionLink}>Tap to join →</Text>
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Reflection prompt */}
        {dayContent.reflection_prompt ? (
          <View style={styles.reflectionCard}>
            <Text style={styles.reflectionLabel}>REFLECTION</Text>
            <Text style={styles.reflectionText}>
              {dayContent.reflection_prompt}
            </Text>
          </View>
        ) : null}

        {allDone ? (
          <View style={styles.completionBanner}>
            <Text style={styles.completionTitle}>
              Day {dayContent.day_number} Complete ✓
            </Text>
            <Text style={styles.completionSub}>
              Tap any practice to do it again
            </Text>
          </View>
        ) : (
          <Text style={styles.progressHint}>
            {allItems.filter(isItemDone).length}/{allItems.length} done —
            complete all to finish the day
          </Text>
        )}

        {/* Support footer */}
        <TouchableOpacity
          style={styles.supportLink}
          onPress={() =>
            Alert.alert(
              "Need help?",
              "Visit kalpx.com/programs/support for help with your program.",
              [{ text: "OK" }],
            )
          }
          accessibilityLabel="Program support"
        >
          <Text style={styles.supportLinkText}>Need help? Get support →</Text>
        </TouchableOpacity>
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
    paddingBottom: 20,
  },
  backIcon: { width: 40, alignItems: "flex-start" },
  backIconText: { fontSize: 32, color: "#432104", lineHeight: 36 },
  headerCenter: { flex: 1, alignItems: "center" },
  dayLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: "#9A7548",
    letterSpacing: 0.06,
    marginBottom: 4,
  },
  themeText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 20,
    color: "#432104",
    textAlign: "center",
  },

  itemsSection: { gap: 12, marginBottom: 24 },

  itemCard: {
    backgroundColor: "#FFF8EE",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemCardDone: {
    backgroundColor: "#F0EAD8",
    borderColor: "#C99317",
  },
  itemCardLeft: { flex: 1 },
  itemLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: "#9A7548",
    letterSpacing: 0.05,
    marginBottom: 4,
  },
  itemTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    color: "#432104",
    marginBottom: 2,
  },
  itemDevanagari: {
    fontFamily: Fonts.devanagari.regular,
    fontSize: 15,
    color: "#7B6545",
    lineHeight: 22,
  },
  itemCardRight: { marginLeft: 12 },
  doneCheckmark: { fontSize: 22, color: "#C99317", fontWeight: "700" },
  itemArrow: { fontSize: 22, color: "#C99317" },

  wisdomCard: {
    backgroundColor: '#FFF8EE',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E8D9B5',
    padding: 18,
    marginBottom: 12,
  },
  wisdomCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  wisdomLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: '#9A7548',
    letterSpacing: 0.05,
    marginBottom: 4,
  },
  wisdomText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    color: '#432104',
    fontStyle: 'italic',
  },
  wisdomSource: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: '#9A7548',
    marginTop: 8,
  },
  liveSessionCard: {
    backgroundColor: '#FFF3DC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C99317',
    padding: 16,
    marginBottom: 12,
  },
  liveSessionLeft: { flex: 1 },
  liveSessionLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 10,
    color: '#9A7548',
    letterSpacing: 0.06,
    marginBottom: 6,
  },
  liveSessionTime: {
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    color: '#432104',
    marginBottom: 4,
  },
  liveSessionLink: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: '#C99317',
  },
  reflectionCard: {
    backgroundColor: "#FFF8EE",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 16,
    marginBottom: 24,
  },
  reflectionLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 10,
    color: "#9A7548",
    letterSpacing: 0.06,
    marginBottom: 6,
  },
  reflectionText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#432104",
    lineHeight: 21,
  },

  completionBanner: {
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 8,
  },
  completionTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 20,
    color: "#C99317",
    marginBottom: 6,
  },
  completionSub: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#9A7548",
  },

  progressHint: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#9A7548",
    textAlign: "center",
    marginBottom: 16,
  },

  supportLink: { alignItems: "center", paddingVertical: 12 },
  supportLinkText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 13,
    color: "#9A7548",
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
