/**
 * ProgramDetailPreviewScreen — TLP Phase 1.
 *
 * Displays full program detail: guide hero, program promise, day overview,
 * about the guide, invite code, and CTA to join.
 *
 * SECURITY: NEVER display guide.contact_email, contact_phone, notes, safety_flags.
 */
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Clipboard,
  Image,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { Fonts } from "../../theme/fonts";
import { fetchProgramDetail, type TLPProgramDetail } from "../../engine/liveSessionApi";

const MAX_BIO_LENGTH = 200;

export default function ProgramDetailPreviewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { code } = route.params ?? {};

  const [program, setProgram] = useState<TLPProgramDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      (async () => {
        try {
          setLoading(true);
          const data = await fetchProgramDetail(code);
          if (!cancelled) setProgram(data);
        } catch (err: unknown) {
          if (cancelled) return;
          const status = (err as { response?: { status?: number } })?.response?.status;
          if (status === 404) setError("Program not found.");
          else setError("Couldn't load program details. Please try again.");
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, [code]),
  );

  const handleCopyCode = () => {
    Clipboard.setString(code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleSupport = () => {
    if (!program?.support_contact_url) return;
    Linking.openURL(program.support_contact_url).catch(() => {});
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#C99317" />
      </SafeAreaView>
    );
  }

  if (error || !program) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.errorText}>{error ?? "Something went wrong."}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const guide = program.guide;
  const bio = guide?.bio ?? "";
  const truncatedBio = bio.length > MAX_BIO_LENGTH ? bio.slice(0, MAX_BIO_LENGTH) + "…" : bio;
  const showReadMore = bio.length > MAX_BIO_LENGTH;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
            <Text style={styles.backIconText}>‹</Text>
          </TouchableOpacity>
          <View style={{ width: 40 }} />
        </View>

        {/* Guide photo hero */}
        {guide?.photo_url ? (
          <View style={styles.guideHeroWrap}>
            <Image
              source={{ uri: guide.photo_url }}
              style={styles.guideHeroPhoto}
              accessibilityLabel={`Photo of ${guide.display_name}`}
            />
          </View>
        ) : null}

        {/* Program title + subtitle */}
        <Text style={styles.programTitle}>{program.name}</Text>
        {guide ? (
          <Text style={styles.programSubtitle}>
            Offered by {guide.display_name} · Powered by KalpX
          </Text>
        ) : (
          <Text style={styles.programSubtitle}>Powered by KalpX</Text>
        )}

        {/* Badges row */}
        <View style={styles.badgeRow}>
          {program.category ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{program.category}</Text>
            </View>
          ) : null}
          {program.duration_days ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{program.duration_days}-day program</Text>
            </View>
          ) : null}
        </View>

        {/* Program promise */}
        {program.program_promise ? (
          <View style={styles.promiseCard}>
            <Text style={styles.promiseText}>{program.program_promise}</Text>
          </View>
        ) : null}

        {/* Day Overview */}
        {program.day_themes && program.day_themes.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>DAY OVERVIEW</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dayChipRow}
            >
              {program.day_themes.map((theme, idx) => (
                <View key={idx} style={styles.dayChip}>
                  <Text style={styles.dayChipNumber}>Day {idx + 1}</Text>
                  <Text style={styles.dayChipTheme}>{theme}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* About the Guide */}
        {guide ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ABOUT THE GUIDE</Text>
            <View style={styles.guideCard}>
              <View style={styles.guideCardHeader}>
                {guide.photo_url ? (
                  <Image
                    source={{ uri: guide.photo_url }}
                    style={styles.guideCardPhoto}
                    accessibilityLabel={`Photo of ${guide.display_name}`}
                  />
                ) : null}
                <View style={styles.guideCardInfo}>
                  <Text style={styles.guideCardName}>{guide.display_name}</Text>
                  {guide.guide_type ? (
                    <View style={styles.guideTypeBadge}>
                      <Text style={styles.guideTypeBadgeText}>{guide.guide_type}</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {bio ? (
                <>
                  <Text style={styles.guideBioText}>
                    {bioExpanded ? bio : truncatedBio}
                  </Text>
                  {showReadMore ? (
                    <TouchableOpacity onPress={() => setBioExpanded(!bioExpanded)}>
                      <Text style={styles.readMoreText}>
                        {bioExpanded ? "Show less" : "Read more"}
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </>
              ) : null}

              {/* Topics chips */}
              {guide.topics && guide.topics.length > 0 ? (
                <View style={styles.topicsRow}>
                  {guide.topics.map((topic, idx) => (
                    <View key={idx} style={styles.topicChip}>
                      <Text style={styles.topicChipText}>{topic}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Invite code */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PROGRAM CODE</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{code}</Text>
            <TouchableOpacity onPress={handleCopyCode} style={styles.copyBtn}>
              <Text style={styles.copyBtnText}>
                {codeCopied ? "Copied!" : "Copy code"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Join CTA */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate("ProgramInviteClaimScreen", { code })}
          style={styles.joinBtn}
          accessibilityLabel="Join this program"
        >
          <Text style={styles.joinBtnText}>Join Program →</Text>
        </TouchableOpacity>

        {/* Support link */}
        {program.support_contact_url ? (
          <TouchableOpacity
            onPress={handleSupport}
            style={styles.supportLink}
            accessibilityLabel="Get support"
          >
            <Text style={styles.supportLinkText}>Get Support →</Text>
          </TouchableOpacity>
        ) : null}
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
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 12,
  },
  backIcon: { width: 40, alignItems: "flex-start" },
  backIconText: { fontSize: 32, color: "#432104", lineHeight: 36 },

  guideHeroWrap: {
    alignItems: "center",
    marginBottom: 20,
  },
  guideHeroPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#C99317",
  },

  programTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 26,
    color: "#432104",
    marginBottom: 6,
    lineHeight: 32,
  },
  programSubtitle: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#9A7548",
    marginBottom: 16,
  },

  badgeRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  badge: {
    backgroundColor: "#F0EAD8",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: "#7B6545",
    textTransform: "capitalize",
  },

  promiseCard: {
    backgroundColor: "#FFF8EE",
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#C99317",
    padding: 16,
    marginBottom: 24,
  },
  promiseText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: "#432104",
    fontStyle: "italic",
    lineHeight: 24,
  },

  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 10,
    color: "#9A7548",
    letterSpacing: 0.06,
    marginBottom: 12,
  },

  dayChipRow: {
    gap: 10,
    flexDirection: "row",
  },
  dayChip: {
    backgroundColor: "#FFF8EE",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 12,
    minWidth: 90,
    alignItems: "center",
  },
  dayChipNumber: {
    fontFamily: Fonts.sans.medium,
    fontSize: 10,
    color: "#9A7548",
    marginBottom: 4,
  },
  dayChipTheme: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 12,
    color: "#432104",
    textAlign: "center",
  },

  guideCard: {
    backgroundColor: "#FFF8EE",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 16,
  },
  guideCardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  guideCardPhoto: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },
  guideCardInfo: {
    flex: 1,
  },
  guideCardName: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 16,
    color: "#432104",
    marginBottom: 6,
  },
  guideTypeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F0EAD8",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  guideTypeBadgeText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 10,
    color: "#7B6545",
    textTransform: "capitalize",
  },
  guideBioText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#7B6545",
    lineHeight: 20,
    marginBottom: 8,
  },
  readMoreText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: "#C99317",
    marginBottom: 12,
  },
  topicsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  topicChip: {
    backgroundColor: "#F0EAD8",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  topicChipText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: "#7B6545",
  },

  codeBox: {
    backgroundColor: "#FFF8EE",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  codeText: {
    fontFamily: "Courier",
    fontSize: 18,
    color: "#432104",
    letterSpacing: 2,
    fontWeight: "700",
  },
  copyBtn: {
    backgroundColor: "#F0EAD8",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  copyBtnText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: "#432104",
  },

  joinBtn: {
    backgroundColor: "#C99317",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  joinBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 17,
    color: "#fff",
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
