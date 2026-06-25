/**
 * DigitalMalaScreen — standalone advanced japa mode.
 *
 * Accepts a mantraRef route param (MasterMantra.item_id).
 * If none provided, shows a mantra picker first.
 *
 * Uses the shared useJapaEngine — same counting engine as Quick Chant,
 * Daily Rhythm, and Inner Path. source_surface = "digital_mala".
 */

import * as Haptics from "expo-haptics";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import { Image } from "react-native";

import { useJapaEngine } from "../../engine/useJapaEngine";
import { useScreenStore } from "../../engine/useScreenBridge";
import { logEvent } from "../../utils/initAnalytics";
import { Fonts } from "../../theme/fonts";
import { platformShadow } from "../../theme/shadows";

const RudrakshBead = ({ size = 28, style }: { size?: number; style?: any }) => (
  <Image
    source={require("../../../assets/rudraksh.webp")}
    style={[{ width: size, height: size, resizeMode: "contain" }, style]}
  />
);

type GoalMode = "27" | "54" | "108" | "unlimited";
const GOAL_OPTIONS: { label: string; mode: GoalMode; value: number | null }[] = [
  { label: "27", mode: "27", value: 27 },
  { label: "54", mode: "54", value: 54 },
  { label: "108", mode: "108", value: 108 },
  { label: "∞", mode: "unlimited", value: null },
];

const VISUAL_BEAD_COUNT = 18;

export default function DigitalMalaScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const { updateBackground, updateHeaderHidden } = useScreenStore();

  const routeMantraRef: string | null = route.params?.mantraRef ?? null;
  const routeMantraTitle: string = route.params?.mantraTitle ?? "Mantra";
  const routeMantraDevanagari: string = route.params?.devanagari ?? "";

  const [goalMode, setGoalMode] = useState<GoalMode>("108");
  const [sessionComplete, setSessionComplete] = useState(false);

  const goalValue = GOAL_OPTIONS.find((o) => o.mode === goalMode)?.value ?? null;

  const onGoalReachedRef = useRef<(() => void) | null>(null);
  const sessionStartedRef = useRef(false);
  const japaEngine = useJapaEngine({
    mantraRef: routeMantraRef,
    sourceSurface: "digital_mala",
    goalType: goalValue ? "count" : "unlimited",
    goalValue,
    onGoalReached: useCallback(() => { onGoalReachedRef.current?.(); }, []),
  });

  useEffect(() => {
    onGoalReachedRef.current = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      logEvent("quick_chant_completed", { surface: "digital_mala" }).catch(() => {});
      setSessionComplete(true);
    };
  });

  const japaRefreshRef = useRef(japaEngine.refreshStats);
  const japaSyncRef = useRef(japaEngine.syncNow);
  useEffect(() => {
    japaRefreshRef.current = japaEngine.refreshStats;
    japaSyncRef.current = japaEngine.syncNow;
  }, [japaEngine.refreshStats, japaEngine.syncNow]);

  useFocusEffect(
    useCallback(() => {
      updateBackground(require("../../../assets/beige_bg.webp"));
      updateHeaderHidden(false);
      japaRefreshRef.current?.();
      return () => {
        updateBackground(null);
        updateHeaderHidden(false);
        japaSyncRef.current?.();
      };
    }, [updateBackground, updateHeaderHidden]),
  );

  const ringSpin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.timing(ringSpin, {
        toValue: 1,
        duration: 40000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.start();
    return () => anim.stop();
  }, [ringSpin]);

  const spin = ringSpin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const progressInCycle = japaEngine.beadInRound % VISUAL_BEAD_COUNT;
  const beads = Array.from({ length: VISUAL_BEAD_COUNT }, (_, i) => {
    const angle = (i / VISUAL_BEAD_COUNT) * 2 * Math.PI - Math.PI / 2;
    return {
      cx: 115 + Math.cos(angle) * 86,
      cy: 115 + Math.sin(angle) * 86,
      i,
    };
  });

  const handleDone = useCallback(async () => {
    await japaEngine.completeSession();
    navigation.goBack();
  }, [japaEngine, navigation]);

  useEffect(() => {
    onGoalReachedRef.current = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      logEvent("quick_chant_completed", { surface: "digital_mala" }).catch(() => {});
      setSessionComplete(true);
    };
  });

  if (!routeMantraRef) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>No mantra selected.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
 
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text style={styles.mantraTitle}>{routeMantraTitle}</Text>
          {!!routeMantraDevanagari && (
            <Text style={styles.devanagari}>{routeMantraDevanagari}</Text>
          )}
          <Text style={styles.surfaceLabel}>Digital Mala</Text>

          {/* Session count */}
          <View style={styles.countWrap}>
            <Text style={styles.countMain}>{japaEngine.sessionCount}</Text>
          </View>

          {(japaEngine.todayCount > 0 || japaEngine.weekCount > 0 || japaEngine.lifetimeCount > 0) && (
            <View style={styles.statsRow}>
              {japaEngine.todayCount > 0 && (
                <Text style={styles.statItem}>Today {japaEngine.todayCount.toLocaleString()}</Text>
              )}
              {japaEngine.weekCount > 0 && (
                <Text style={styles.statItem}>Week {japaEngine.weekCount.toLocaleString()}</Text>
              )}
              {japaEngine.lifetimeCount > 0 && (
                <Text style={styles.statItem}>Lifetime {japaEngine.lifetimeCount.toLocaleString()}</Text>
              )}
            </View>
          )}

          {/* Mala rounds label */}
          {japaEngine.completedMalas > 0 && (
            <Text style={styles.malaLabel}>
              {japaEngine.completedMalas} {japaEngine.completedMalas === 1 ? "mala" : "malas"}
              {japaEngine.beadInRound > 0 ? ` · ${japaEngine.beadInRound} beads` : " completed"}
            </Text>
          )}

          {/* Bead ring */}
          <View style={styles.ringWrap}>
            <Animated.View style={[styles.ring, { transform: [{ rotate: spin }] }]}>
              {beads.map(({ cx, cy, i }) => (
                <View
                  key={i}
                  style={[
                    styles.beadWrap,
                    {
                      left: cx - 14,
                      top: cy - 14,
                      opacity: i < progressInCycle ? 0.2 : 1,
                      transform: [{ scale: i < progressInCycle ? 0.6 : 1 }],
                    },
                  ]}
                >
                  <RudrakshBead size={28} />
                  {i === progressInCycle && <View style={styles.beadPointer} />}
                </View>
              ))}
            </Animated.View>

            <TouchableOpacity
              onPress={() => {
                if (!sessionStartedRef.current) {
                  sessionStartedRef.current = true;
                  logEvent("quick_chant_started", { surface: "digital_mala" }).catch(() => {});
                }
                japaEngine.increment();
              }}
              activeOpacity={0.85}
              style={styles.tapBtn}
            >
              <Text style={styles.tapText}>TAP</Text>
              <Text style={styles.tapSub}>HERE</Text>
              <View style={styles.tapCheck}>
                <Text style={styles.tapCheckMark}>✓</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Goal picker */}
          <View style={styles.goalRow}>
            {GOAL_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.mode}
                style={[styles.goalPill, goalMode === opt.mode && styles.goalPillActive]}
                onPress={() => setGoalMode(opt.mode)}
                activeOpacity={0.75}
              >
                <Text style={[styles.goalPillText, goalMode === opt.mode && styles.goalPillTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Completion message */}
          {sessionComplete && (
            <View style={styles.completionBanner}>
              <Text style={styles.completionTitle}>
                {goalMode === "unlimited"
                  ? `${japaEngine.sessionCount} returned.`
                  : `${goalValue} completed.`}
              </Text>
              <Text style={styles.completionSub}>Let this practice be offered.</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actionRow}>
            {japaEngine.canUndo && (
              <TouchableOpacity style={styles.undoBtn} onPress={japaEngine.undo} activeOpacity={0.7}>
                <Text style={styles.undoBtnText}>↩ Undo</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.primaryBtn, japaEngine.canUndo && styles.primaryBtnFlex]}
              onPress={handleDone}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Complete</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FFF8EF" },
  bg: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 22, alignItems: "center", gap: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 },
  errorText: { fontSize: 16, color: "#7B6550", fontFamily: Fonts.sans.regular, textAlign: "center" },
  mantraTitle: {
    fontSize: 24, fontFamily: Fonts.serif.bold, color: "#432104",
    textAlign: "center", lineHeight: 36,
  },
  devanagari: {
    fontSize: 20, fontFamily: "NotoSansDevanagari_500Medium",
    color: "#C7A048", textAlign: "center",
  },
  surfaceLabel: {
    fontSize: 11, letterSpacing: 2.2, color: "#C7A048",
    fontFamily: Fonts.sans.bold, textTransform: "uppercase",
  },
  countWrap: { marginVertical: 4 },
  countMain: {
    fontSize: 72, lineHeight: 72, color: "#C7A048",
    fontFamily: Fonts.serif.regular, textAlign: "center",
  },
  statsRow: {
    flexDirection: "row", gap: 18, justifyContent: "center",
    flexWrap: "wrap", marginTop: -8,
  },
  statItem: {
    fontSize: 12, color: "#8A7A5A",
    fontFamily: Fonts.sans.regular, letterSpacing: 0.4,
  },
  malaLabel: {
    fontSize: 12, color: "#C7A048",
    fontFamily: Fonts.sans.medium, letterSpacing: 0.3,
  },
  ringWrap: { width: 230, height: 230, position: "relative", marginVertical: 8 },
  ring: { ...StyleSheet.absoluteFillObject },
  beadWrap: {
    position: "absolute", width: 28, height: 28,
    alignItems: "center", justifyContent: "center",
  },
  beadPointer: {
    position: "absolute", top: -10, width: 8, height: 8,
    borderRadius: 4, backgroundColor: "#B89450",
  },
  tapBtn: {
    position: "absolute", top: "50%", left: "50%",
    width: 108, height: 108, marginLeft: -54, marginTop: -54,
    borderRadius: 54, backgroundColor: "#FFFDF9",
    borderWidth: 1.5, borderColor: "#E8C587",
    alignItems: "center", justifyContent: "center", gap: 2,
    ...platformShadow("#B89450", 2, 0.16, 10, 2),
  },
  tapText: { fontSize: 20, letterSpacing: 4, color: "#B89450", fontFamily: Fonts.sans.bold },
  tapSub: { fontSize: 10, letterSpacing: 1.2, color: "#8A7A5A", fontFamily: Fonts.sans.medium },
  tapCheck: {
    width: 24, height: 24, borderRadius: 12,
    borderWidth: 1, borderColor: "#B89450",
    alignItems: "center", justifyContent: "center", marginTop: 4,
  },
  tapCheckMark: { fontSize: 13, color: "#B89450", fontFamily: Fonts.sans.bold },
  goalRow: { flexDirection: "row", gap: 10, justifyContent: "center", flexWrap: "wrap" },
  goalPill: {
    minWidth: 56, paddingVertical: 8, paddingHorizontal: 14,
    borderRadius: 20, borderWidth: 1, borderColor: "#E8C587",
    alignItems: "center", justifyContent: "center",
  },
  goalPillActive: { backgroundColor: "#B89450", borderColor: "#B89450" },
  goalPillText: { fontSize: 14, color: "#8A7A5A", fontFamily: Fonts.sans.medium },
  goalPillTextActive: { color: "#fff" },
  completionBanner: {
    width: "100%", borderRadius: 14, padding: 20,
    backgroundColor: Platform.OS === "android" ? "#FEFCF9" : "rgba(255,255,255,0.72)",
    borderWidth: 1, borderColor: "rgba(218,194,142,0.65)",
    alignItems: "center", gap: 6,
  },
  completionTitle: {
    fontSize: 20, fontFamily: Fonts.serif.bold, color: "#432104", textAlign: "center",
  },
  completionSub: {
    fontSize: 14, fontFamily: Fonts.sans.regular, color: "#7B6550", textAlign: "center",
  },
  actionRow: { flexDirection: "row", gap: 10, width: "100%", alignItems: "center" },
  undoBtn: {
    paddingVertical: 14, paddingHorizontal: 18, borderRadius: 11,
    borderWidth: 1.5, borderColor: "rgba(199,160,72,0.5)",
    alignItems: "center", justifyContent: "center",
    backgroundColor: Platform.OS === "android" ? "#FEFCF9" : "rgba(255,255,255,0.5)",
  },
  undoBtnText: { fontSize: 14, color: "#B89450", fontFamily: Fonts.sans.medium },
  primaryBtn: {
    backgroundColor: "#C99317", borderRadius: 11,
    paddingVertical: 14, alignItems: "center", width: "100%",
  },
  primaryBtnFlex: { flex: 1 },
  primaryBtnText: { fontSize: 14, fontFamily: Fonts.sans.semiBold, color: "#fff" },
});
