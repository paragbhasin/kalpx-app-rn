import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import { LiveActivityPreferenceBanner } from "../../../components/LiveActivityPreferenceBanner";
import { type WisdomCard } from "../../../engine/programApi";
import { liveActivity } from "../../../native/liveActivity";
import { Fonts } from "../../../theme/fonts";
import { sfs } from "../../../utils/responsive";

if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const BROWN = "#432104";

const SectionHeader = ({ label }: { label: string }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.dividerLine} />
    <Text style={styles.sectionLabel}>{label}</Text>
    <View style={styles.dividerLine} />
  </View>
);

const CollapsibleCard = ({
  label,
  expanded,
  onToggle,
  children,
}: {
  label: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) => (
  <TouchableOpacity
    style={[styles.card, expanded && styles.cardExpanded]}
    onPress={() => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      onToggle();
    }}
    activeOpacity={0.8}
  >
    <View style={styles.cardHeader}>
      <View style={styles.dividerLine} />
      <View style={styles.headerLabelGroup}>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.toggleIcon}>{expanded ? "▲" : "▼"}</Text>
      </View>
      <View style={styles.dividerLine} />
    </View>
    {expanded && <View style={styles.cardContent}>{children}</View>}
  </TouchableOpacity>
);

export default function ProgramWisdomRunner() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {
    wisdom,
    dayNumber,
    day_join_url,
    day_session_time,
    day_session_timezone,
  }: {
    wisdom: WisdomCard;
    dayNumber: number;
    day_join_url?: string | null;
    day_session_time?: string | null;
    day_session_timezone?: string | null;
  } = route.params;

  const [explanationExpanded, setExplanationExpanded] = useState(true);
  const [sourceExpanded, setSourceExpanded] = useState(false);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.flow}>
          {/* Back button */}
          {/* <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backRow}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity> */}

          {/* Day label */}
          <Text style={styles.dayLabel}>
            DAY {dayNumber} · WISDOM OF THE DAY
          </Text>

          {/* Main wisdom quote */}
          <View style={styles.quoteCard}>
            <Text style={styles.quoteText}>{wisdom.text}</Text>
          </View>

          {/* Explanation section */}
          {wisdom.explanation && wisdom.explanation.length > 0 && (
            <View style={styles.mainCard}>
              <SectionHeader label="Explanation" />
              <View style={{ marginTop: 12 }}>
                {wisdom.explanation.map((line, idx) => (
                  <Text key={idx} style={styles.explanationText}>
                    {line}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {/* Source section */}
          {wisdom.source_title ? (
            <CollapsibleCard
              label="Source"
              expanded={sourceExpanded}
              onToggle={() => setSourceExpanded(!sourceExpanded)}
            >
              <Text style={styles.cardText}>{wisdom.source_title}</Text>
            </CollapsibleCard>
          ) : null}

          {/* Close */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backLink}
          >
            <Text style={styles.backLinkText}>← Back to Day</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <LiveActivityPreferenceBanner
        experienceType="practice"
        experienceName={wisdom.text ?? "Wisdom of the Day"}
        experienceLine={wisdom.text ?? ""}
        onActivate={() => {
          liveActivity.startSankalp(
            `Day ${dayNumber} · Wisdom`,
            wisdom.text ?? "",
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FAF7F2" },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    alignItems: "center",
  },
  flow: {
    width: "100%",
    alignItems: "center",
    paddingTop: 16,
  },

  backRow: { alignSelf: "flex-start", paddingVertical: 8, marginBottom: 8 },
  backText: { fontFamily: Fonts.sans.medium, fontSize: 15, color: BROWN },

  dayLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: "#9A7548",
    letterSpacing: 0.08,
    marginBottom: 20,
    textAlign: "center",
  },

  quoteCard: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 12,
    marginBottom: 24,
  },
  quoteText: {
    fontFamily: Fonts.serif.bold,
    fontSize: sfs(22),
    lineHeight: sfs(32),
    color: BROWN,
    textAlign: "center",
    fontStyle: "italic",
  },

  mainCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E8C587",
    padding: 20,
    marginBottom: 12,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E8C587",
    opacity: 0.6,
  },
  sectionLabel: {
    fontFamily: Fonts.serif.regular,
    fontSize: sfs(14),
    color: "#B89450",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },

  explanationText: {
    fontFamily: Fonts.serif.regular,
    fontStyle: "italic",
    fontSize: sfs(18),
    color: "#4A4A4A",
    lineHeight: sfs(28),
    textAlign: "center",
    paddingHorizontal: 8,
    marginBottom: 6,
  },

  card: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(184, 148, 80, 0.1)",
    padding: 15,
    marginBottom: 12,
  },
  cardExpanded: {},
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "center",
  },
  headerLabelGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardLabel: {
    fontSize: sfs(18),
    fontFamily: Fonts.serif.bold,
    color: BROWN,
    marginHorizontal: 12,
  },
  toggleIcon: {
    fontSize: sfs(12),
    color: "#D4A017",
    alignSelf: "center",
  },
  cardContent: { marginTop: 12 },
  cardText: {
    fontSize: sfs(16),
    lineHeight: sfs(24),
    color: "#5a3c21",
    fontFamily: Fonts.serif.regular,
    textAlign: "center",
  },

  backLink: { marginTop: 32, paddingVertical: 4 },
  backLinkText: {
    fontSize: sfs(16),
    fontFamily: Fonts.serif.regular,
    color: BROWN,
    textDecorationLine: "underline",
  },
});
