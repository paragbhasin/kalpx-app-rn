// Dashboard container body: NewDashboardContainer (companion_dashboard_v3/day_active)
// Spec: kalpx-frontend/docs/specs/mitra-v3-experience/screens/route_dashboard_day_active.md
// ISOLATED SCAFFOLD — not registered. See ./README.md for wire-up.
//
// Mirrors the Apr-11 design language (warm parchment, gold accents, serif headlines,
// cream hairline cards). Coexists with the existing `companion_dashboard` — does NOT
// replace it. Feature-flagged.

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "../../../theme/fonts";

import PersonalGreetingCard from "../personal_greeting_card";
import PathMilestoneBanner from "../path_milestone_banner";
import DayTypeChip from "../day_type_chip";
import FocusPhraseLine from "../focus_phrase_line";
import WhyThisL1Chip from "../why_this_l1_chip";
import PredictiveAlertCard from "../predictive_alert_card";
import EntityRecognitionCard from "../entity_recognition_card";
import GratitudeSignalCard from "../gratitude_signal_card";
import SeasonSignalCard from "../season_signal_card";
import PostConflictMorningCard from "../post_conflict_morning_card";
import ContinuityMirrorCard from "../continuity_mirror_card";

type Props = {
  block?: any;
  screenData?: any;
  onAction?: (actionId: string, payload?: any) => void;
};

// Minimal local triad renderer — mirrors the web's CoreItemsList cream-card /
// label / title / why layout. This is intentionally a local stub: Pavani can
// swap to a shared `CoreItemsList` block when one lands in `src/blocks/`.
const CoreItemsListInline: React.FC<{ items?: any[] }> = ({ items }) => {
  if (!items || items.length === 0) return null;
  return (
    <View style={styles.triadWrap}>
      {items.map((it, i) => (
        <View key={it.id ?? i} style={styles.triadCard}>
          {!!it.label && <Text style={styles.triadLabel}>{String(it.label).toUpperCase()}</Text>}
          {!!it.title && <Text style={styles.triadTitle}>{it.title}</Text>}
          {!!it.why && <Text style={styles.triadWhy}>{it.why}</Text>}
        </View>
      ))}
    </View>
  );
};

const KalpXHeader: React.FC = () => (
  <View style={styles.header}>
    <View style={styles.headerLeft}>
      <View style={styles.logoDot}>
        <Ionicons name="flower-outline" size={16} color="#D4A017" />
      </View>
      <Text style={styles.headerTitle}>KalpX</Text>
    </View>
    <TouchableOpacity style={styles.langPill} activeOpacity={0.7}>
      <Ionicons name="globe-outline" size={14} color="#8A7D6B" />
      <Text style={styles.langText}>EN</Text>
    </TouchableOpacity>
  </View>
);

const StreakPill: React.FC<{ count?: number }> = ({ count }) => {
  if (!count && count !== 0) return null;
  return (
    <View style={styles.streakPill}>
      <Ionicons name="flame-outline" size={14} color="#C9A84C" />
      <Text style={styles.streakText}>{count} day streak</Text>
    </View>
  );
};

const NewDashboardContainer: React.FC<Props> = ({ block, screenData, onAction }) => {
  const sd = screenData ?? block?.screenData ?? {};

  const coreItems = sd.core_items ?? sd.triad_items ?? [];
  const whyL1Items: any[] = Array.isArray(sd.why_this_l1_items)
    ? sd.why_this_l1_items
    : [];

  const handlePress = (actionId: string, payload?: any) => {
    if (onAction) onAction(actionId, payload);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <KalpXHeader />

      {/* 2. Personal greeting */}
      {sd.greeting_context ? (
        <PersonalGreetingCard
          screenData={sd}
          onCtaPress={(id) => handlePress("greeting_cta", { id })}
        />
      ) : null}

      {/* 3. Path milestone banner (gold-gradient pill via scaffold) */}
      {sd.path_milestone ? (
        <View style={styles.milestoneWrap}>
          <LinearGradient
            colors={["#F7EED1", "#E8D9A8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.milestoneGradient}
          >
            <PathMilestoneBanner screenData={sd} />
          </LinearGradient>
        </View>
      ) : null}

      {/* 4. Chip row: dayType + streak */}
      {sd.day_type || sd.streak_count ? (
        <View style={styles.chipRow}>
          <View style={{ flexShrink: 1 }}>
            <DayTypeChip screenData={sd} />
          </View>
          <StreakPill count={sd.streak_count} />
        </View>
      ) : null}

      {/* 5. Focus phrase (italic gold line) */}
      {sd.focus_phrase ? <FocusPhraseLine screenData={sd} /> : null}

      {/* 6. Core triad */}
      <CoreItemsListInline items={coreItems} />

      {/* 7. why_this_l1 chips row */}
      {whyL1Items.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.whyChipsRow}
        >
          {whyL1Items.map((w, i) => (
            <View key={w.id ?? i} style={styles.whyChipWrap}>
              <WhyThisL1Chip screenData={{ why_this_l1: w }} />
            </View>
          ))}
        </ScrollView>
      ) : null}

      {/* 8. Conditional embeds */}
      {sd.predictive_alert ? <PredictiveAlertCard screenData={sd} /> : null}
      {sd.entity_card ? <EntityRecognitionCard screenData={sd} /> : null}
      {sd.gratitude_card ? <GratitudeSignalCard screenData={sd} /> : null}
      {sd.season_card ? <SeasonSignalCard screenData={sd} /> : null}
      {sd.post_conflict ? <PostConflictMorningCard screenData={sd} /> : null}

      {/* 9. Continuity mirror */}
      {sd.continuity_card ? <ContinuityMirrorCard screenData={sd} /> : null}

      {/* 10. Support CTAs — mirror existing Apr-11 primary_buttons */}
      <View style={styles.ctaBlock}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handlePress("open_trigger")}
        >
          <LinearGradient
            colors={["#E5D4CA", "#F5EDEA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>I Feel Triggered</Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => handlePress("open_check_in")}
          style={{ marginTop: 10 }}
        >
          <LinearGradient
            colors={["#E5D4CA", "#F5EDEA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>Quick Check-In</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#FAF7F2",
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 48,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#D4A017",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  headerTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 20,
    color: "#432104",
    letterSpacing: 0.3,
  },
  langPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EDE1D3",
    backgroundColor: "#FFFDF7",
  },
  langText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: "#8A7D6B",
    marginLeft: 4,
  },

  // Milestone
  milestoneWrap: {
    marginVertical: 8,
  },
  milestoneGradient: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },

  // Chip row
  chipRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EDE1D3",
    backgroundColor: "#FFFDF7",
  },
  streakText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: "#8A7D6B",
    marginLeft: 4,
  },

  // Triad
  triadWrap: {
    marginVertical: 10,
    gap: 10,
  },
  triadCard: {
    backgroundColor: "#FFFDF7",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EDE1D3",
    padding: 18,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  triadLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 10,
    letterSpacing: 1.2,
    color: "#C9A84C",
    marginBottom: 6,
  },
  triadTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 17,
    color: "#432104",
    marginBottom: 4,
  },
  triadWhy: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#6b6155",
    lineHeight: 19,
  },

  // why_this_l1 chips row
  whyChipsRow: {
    flexDirection: "row",
    paddingVertical: 6,
    gap: 8,
  },
  whyChipWrap: {
    marginRight: 8,
  },

  // CTA block
  ctaBlock: {
    marginTop: 20,
  },
  primaryBtn: {
    borderRadius: 28,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: "#432104",
    letterSpacing: 0.3,
  },
});

export default NewDashboardContainer;
