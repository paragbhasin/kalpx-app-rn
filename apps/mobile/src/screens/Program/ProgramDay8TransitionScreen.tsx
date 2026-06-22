/**
 * ProgramDay8TransitionScreen — Gate 3 MOB-7.
 *
 * Decision 4: MANDATORY after Day 7 completion. No skip path.
 * Fires PROGRAM_DAY8_TRANSITION_VIEWED on mount.
 * POST /api/programs/my-active/day8-transition/ before each navigation.
 * Back button returns to Home (not ProgramDayScreen).
 */
import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Fonts } from "../../theme/fonts";
import { postDay8Transition } from "../../engine/programApi";

const BEIGE_BG = require("../../../assets/beige_bg.webp");

type CtaPath = "inner_path" | "daily_rhythm" | "quick_chant" | "share";

export default function ProgramDay8TransitionScreen() {
  const navigation = useNavigation<any>();
  const viewedRef = useRef(false);
  const [loading, setLoading] = useState<CtaPath | null>(null);

  useEffect(() => {
    if (viewedRef.current) return;
    viewedRef.current = true;
    // Log view event — fire-and-forget
    postDay8Transition("none").catch(() => {});
  }, []);

  const handleCta = async (path: CtaPath) => {
    if (loading) return;
    setLoading(path);
    try {
      await postDay8Transition(path);
    } catch {}

    setLoading(null);

    if (path === "inner_path") {
      navigation.navigate("InnerPath" as any);
    } else if (path === "daily_rhythm") {
      navigation.navigate("RhythmHome" as any);
    } else if (path === "quick_chant") {
      navigation.navigate("QuickReset" as any);
    } else if (path === "share") {
      try {
        await Share.share({
          message: "Just completed a 7-day practice on KalpX 🙏 — find your practice at kalpx.com",
        });
      } catch {}
      navigation.navigate("Home" as any);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={BEIGE_BG} style={styles.bg}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.badge}>7-DAY JOURNEY COMPLETE</Text>
            <Text style={styles.emoji}>🌸</Text>
            <Text style={styles.headline}>
              You've built something real.
            </Text>
            <Text style={styles.subtext}>
              Seven days of practice. What you started here can continue. Choose how you'd like to keep going.
            </Text>
          </View>

          <View style={styles.ctaSection}>
            {/* CTA 1: Begin Inner Path (primary) */}
            <CtaButton
              label="Begin Inner Path"
              description="A guided 21-day journey"
              primary
              loading={loading === "inner_path"}
              onPress={() => handleCta("inner_path")}
              testID="day8_cta_inner_path"
            />

            {/* CTA 2: Continue Daily Rhythm (secondary) */}
            <CtaButton
              label="Continue Daily Rhythm"
              description="Morning, afternoon, evening practice"
              loading={loading === "daily_rhythm"}
              onPress={() => handleCta("daily_rhythm")}
              testID="day8_cta_daily_rhythm"
            />

            {/* CTA 3: Keep chanting this mantra */}
            <CtaButton
              label="Keep chanting this mantra"
              description="Add it to your Quick Chant"
              loading={loading === "quick_chant"}
              onPress={() => handleCta("quick_chant")}
              testID="day8_cta_quick_chant"
            />

            {/* CTA 4: Share what shifted */}
            <CtaButton
              label="Share what shifted"
              description="Invite someone to practice"
              loading={loading === "share"}
              onPress={() => handleCta("share")}
              testID="day8_cta_share"
            />
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

function CtaButton({
  label,
  description,
  primary = false,
  loading = false,
  onPress,
  testID,
}: {
  label: string;
  description: string;
  primary?: boolean;
  loading?: boolean;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={loading}
      style={[styles.ctaBtn, primary && styles.ctaBtnPrimary, loading && { opacity: 0.7 }]}
      testID={testID}
      accessibilityLabel={label}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.ctaBtnLabel, primary && styles.ctaBtnLabelPrimary]}>{label}</Text>
        <Text style={[styles.ctaBtnDesc, primary && styles.ctaBtnDescPrimary]}>{description}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={primary ? "#fff" : "#C99317"} />
      ) : (
        <Text style={[styles.ctaBtnArrow, primary && styles.ctaBtnArrowPrimary]}>→</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF5F5" },
  bg: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 80 },

  header: { alignItems: "center", marginBottom: 36 },
  badge: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: "#9A7548",
    letterSpacing: 0.06,
    marginBottom: 16,
  },
  emoji: { fontSize: 48, marginBottom: 16 },
  headline: {
    fontFamily: Fonts.serif.bold,
    fontSize: 26,
    color: "#432104",
    textAlign: "center",
    marginBottom: 12,
  },
  subtext: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#7B6545",
    textAlign: "center",
    lineHeight: 23,
  },

  ctaSection: { gap: 14 },

  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8EE",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 18,
  },
  ctaBtnPrimary: {
    backgroundColor: "#432104",
    borderColor: "#432104",
  },
  ctaBtnLabel: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 16,
    color: "#432104",
    marginBottom: 3,
  },
  ctaBtnLabelPrimary: { color: "#F5E6C8" },
  ctaBtnDesc: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#9A7548",
  },
  ctaBtnDescPrimary: { color: "#C3A87A" },
  ctaBtnArrow: { fontSize: 22, color: "#C99317", marginLeft: 8 },
  ctaBtnArrowPrimary: { color: "#F5E6C8" },
});
