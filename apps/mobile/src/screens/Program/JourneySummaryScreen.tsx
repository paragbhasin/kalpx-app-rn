/**
 * JourneySummaryScreen — post-completion 6-step flow.
 *
 * Step 1: Journey Summary (stats)
 * Step 2: Invite for testimonial
 * Step 3: Rate your experience
 * Step 4: Write testimonial
 * Step 5: Choose visibility
 * Step 6: Thank you
 */
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  fetchJourneySummary,
  submitTestimonialFull,
  type JourneySummaryData,
} from "../../engine/programApi";
import { Fonts } from "../../theme/fonts";

const BEIGE_BG = require("../../../assets/beige_bg.webp");

const INSPIRATIONAL_QUOTES = [
  "Small daily steps create lasting change.",
  "The journey of a thousand miles begins with a single step.",
  "You showed up for yourself every single day.",
  "Stillness is the soil from which growth springs.",
];

type Visibility = "named" | "anonymous" | "private";

function StatRow({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent: string;
}) {
  return (
    <View style={styles.statRow}>
      <View style={[styles.statAccent, { backgroundColor: accent }]} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map((n) => (
        <TouchableOpacity
          key={n}
          onPress={() => onChange(n)}
          activeOpacity={0.7}
        >
          <Text style={[styles.star, n <= value && styles.starFilled]}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function JourneySummaryScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { campaignCode } = route.params ?? {};

  const [step, setStep] = useState(1);
  const [summary, setSummary] = useState<JourneySummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Testimonial state
  const [rating, setRating] = useState(0);
  const [testimonialText, setTestimonialText] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("named");
  const [submitting, setSubmitting] = useState(false);

  const quoteRef = useRef(
    INSPIRATIONAL_QUOTES[
      Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)
    ],
  );

  useEffect(() => {
    if (!campaignCode) {
      setError(true);
      setLoading(false);
      return;
    }
    fetchJourneySummary(campaignCode)
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [campaignCode]);

  const handleSubmitTestimonial = async () => {
    if (!testimonialText.trim()) {
      setStep(6);
      return;
    }
    setSubmitting(true);
    try {
      await submitTestimonialFull({
        text: testimonialText.trim(),
        rating,
        visibility,
        campaignCode,
      });
      setStep(6);
    } catch (e: any) {
      console.log("[Testimonial] error:", e?.response?.status, e?.response?.data);
      Alert.alert(
        "Couldn't save",
        "Your reflection could not be saved. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkipTestimonial = () => navigation.navigate("Home");

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#C99317" />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !summary) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <Text style={styles.errorText}>
            Couldn't load summary. Please try again.
          </Text>
          <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.btnPrimaryText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const completedDate = summary.completed_at
    ? new Date(summary.completed_at + "T00:00:00").toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={BEIGE_BG} style={styles.bg}>
        {/* Back button */}
        {/* <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity> */}

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Step 1: Journey Summary ── */}
          {step === 1 && (
            <>
              <View style={styles.badgeWrap}>
                <Text style={styles.badgeText}>JOURNEY COMPLETED</Text>
              </View>

              <Text style={styles.headingLarge}>You did it!</Text>
              <Text style={styles.subHeading}>
                You have completed{"\n"}
                <Text style={styles.programNameInline}>
                  {summary.program_name}
                </Text>
              </Text>
              <Text style={styles.metaLine}>
                {completedDate
                  ? `Completed on ${completedDate}`
                  : "Journey complete"}
              </Text>

              <Text style={styles.sectionLabel}>
                Here's a glimpse of your journey.
              </Text>

              <View style={styles.statsCard}>
                <StatRow
                  accent="#2E7D32"
                  value={summary.days_completed}
                  label="Days Completed"
                />
                <View style={styles.statDivider} />
                <StatRow
                  accent="#C99317"
                  value={summary.days_completed}
                  label="Practices Done"
                />
                <View style={styles.statDivider} />
                <StatRow
                  accent="#7B6545"
                  value={summary.reflections_written}
                  label="Reflections Written"
                />
              </View>

              <Text style={styles.quote}>"{quoteRef.current}"</Text>

              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => setStep(2)}
              >
                <Text style={styles.btnPrimaryText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnLink}
                onPress={() => navigation.navigate("Home")}
              >
                {/* <Text style={styles.btnLinkText}>Explore Another Program</Text> */}
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 2: Invite ── */}
          {step === 2 && (
            <>
              <View style={styles.centeredSection}>
                {/* <Text style={styles.inviteEmoji}>🌱</Text> */}
                <Text style={styles.headingLarge}>
                  Your journey can{"\n"}inspire others
                </Text>
                <Text style={styles.inviteBody}>
                  Your experience can help someone who is going through the same
                  phase in life.
                </Text>
              </View>

              <View style={styles.reasonsCard}>
                {[
                  { label: "Inspire Others", color: "#2E7D32" },
                  { label: "Build a Supportive Community", color: "#C99317" },
                  { label: "Spread Healing", color: "#7B6545" },
                ].map((r, idx) => (
                  <React.Fragment key={r.label}>
                    {idx > 0 && <View style={styles.reasonDivider} />}
                    <View style={styles.reasonRow}>
                      <View
                        style={[styles.reasonDot, { backgroundColor: r.color }]}
                      />
                      <Text style={styles.reasonLabel}>{r.label}</Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>

              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => setStep(3)}
              >
                <Text style={styles.btnPrimaryText}>Share My Experience</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnLink}
                onPress={handleSkipTestimonial}
              >
                <Text style={styles.btnLinkText}>Maybe Later</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 3: Rate ── */}
          {step === 3 && (
            <>
              <View style={styles.centeredSection}>
                <Text style={styles.headingMedium}>
                  How was your overall{"\n"}experience?
                </Text>
                <Text style={styles.inviteBody}>
                  Your rating helps us improve and helps others trust the
                  program.
                </Text>
                <StarRating value={rating} onChange={setRating} />
              </View>

              <TouchableOpacity
                style={[styles.btnPrimary, rating === 0 && { opacity: 0.5 }]}
                disabled={rating === 0}
                onPress={() => setStep(4)}
              >
                <Text style={styles.btnPrimaryText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnLink}
                onPress={handleSkipTestimonial}
              >
                <Text style={styles.btnLinkText}>Skip</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 4: Write ── */}
          {step === 4 && (
            <>
              <Text style={styles.headingMedium}>Share your experience</Text>
              <Text style={styles.inviteBody}>
                Write a few lines about how this journey impacted you.
              </Text>

              <TextInput
                style={styles.textArea}
                value={testimonialText}
                onChangeText={setTestimonialText}
                placeholder={
                  "What did you learn?\n\nWhat changed for you?\n\nWhat would you tell someone who is starting this journey?"
                }
                placeholderTextColor="#B5A08A"
                multiline
                numberOfLines={6}
                maxLength={500}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{testimonialText.length}/500</Text>
              <Text style={styles.consentNote}>
                🔒 Your name will be shown as you choose.
              </Text>

              <TouchableOpacity
                style={[styles.btnPrimary, submitting && { opacity: 0.6 }]}
                onPress={() => setStep(5)}
                disabled={submitting}
              >
                <Text style={styles.btnPrimaryText}>Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnLink}
                onPress={handleSkipTestimonial}
              >
                <Text style={styles.btnLinkText}>Skip</Text>
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 5: Visibility ── */}
          {step === 5 && (
            <>
              <View style={styles.centeredSection}>
                <Text style={styles.headingMedium}>
                  Where can we share this?
                </Text>
                <Text style={styles.inviteBody}>
                  You are always in control.
                </Text>
              </View>

              {(
                [
                  {
                    value: "named" as Visibility,
                    icon: "👤",
                    label: "Show with my name",
                    desc: "Helps others trust the program",
                  },
                  {
                    value: "anonymous" as Visibility,
                    icon: "💬",
                    label: "Show anonymously",
                    desc: "Your words, no name",
                  },
                ] as const
              ).map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[
                    styles.visibilityRow,
                    visibility === opt.value && styles.visibilityRowSelected,
                  ]}
                  onPress={() => setVisibility(opt.value)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.visibilityIcon}>{opt.icon}</Text>
                  <View style={styles.visibilityMid}>
                    <Text style={styles.visibilityLabel}>{opt.label}</Text>
                    <Text style={styles.visibilityDesc}>{opt.desc}</Text>
                  </View>
                  <View
                    style={[
                      styles.radio,
                      visibility === opt.value && styles.radioSelected,
                    ]}
                  />
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={[styles.btnPrimary, submitting && { opacity: 0.6 }]}
                onPress={handleSubmitTestimonial}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Done</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {/* ── Step 6: Thank You ── */}
          {step === 6 && (
            <>
              <View style={styles.centeredSection}>
                <Text style={styles.thankYouEmoji}>🙏</Text>
                <Text style={styles.headingLarge}>Thank you!</Text>
                <Text style={styles.inviteBody}>
                  Your words will inspire many people on their healing journey.
                </Text>
              </View>

              {/* <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => navigation.navigate("Home")}
              >
                <Text style={styles.btnPrimaryText}>
                  Explore Another Program
                </Text>
              </TouchableOpacity> */}
              <TouchableOpacity
                style={styles.btnLink}
                onPress={() => navigation.navigate("Home")}
              >
                <Text style={styles.btnLinkText}>Go to Home</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF5EE" },
  bg: { flex: 1 },
  scroll: { padding: 24, paddingTop: 24, paddingBottom: 80 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  backBtn: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backBtnText: { fontSize: 22, color: "#432104" },

  // Badge
  badgeWrap: { alignItems: "center", marginBottom: 12 },
  badgeEmoji: { fontSize: 48, marginBottom: 10 },
  badgeText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 18,
    color: "#2E7D32",
    letterSpacing: 0.08,
    // backgroundColor: "#DCF0D8",
    paddingHorizontal: 14,
    // paddingVertical: 5,
    borderRadius: 20,
    overflow: "hidden",
  },

  // Typography
  headingLarge: {
    fontFamily: Fonts.serif.bold,
    fontSize: 26,
    color: "#432104",
    textAlign: "center",
    marginBottom: 16,
  },
  headingMedium: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: "#432104",
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 30,
  },
  subHeading: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#7B6545",
    textAlign: "center",
    marginBottom: 10,
    lineHeight: 24,
  },
  programNameInline: {
    fontFamily: Fonts.sans.bold,
    color: "#432104",
  },
  metaLine: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "#9A7548",
    textAlign: "center",
    marginBottom: 28,
  },
  sectionLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#9A7548",
    textAlign: "center",
    marginBottom: 14,
  },

  // Stats
  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    paddingVertical: 8,
    marginBottom: 24,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 14,
  },
  statAccent: {
    width: 4,
    height: 36,
    borderRadius: 2,
  },
  statDivider: { height: 1, backgroundColor: "#F0E8D0", marginHorizontal: 20 },
  statValue: {
    fontFamily: Fonts.sans.bold,
    fontSize: 22,
    color: "#432104",
    marginRight: 6,
  },
  statLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#7B6545",
    flex: 1,
  },

  // Quote
  quote: {
    fontFamily: Fonts.serif.bold,
    fontSize: 15,
    color: "#9A7548",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 28,
    lineHeight: 22,
    paddingHorizontal: 16,
  },

  // Invite
  centeredSection: { alignItems: "center", marginBottom: 28 },
  inviteEmoji: { fontSize: 56, marginBottom: 20 },
  thankYouEmoji: { fontSize: 64, marginBottom: 20 },
  inviteBody: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#7B6545",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 8,
  },

  reasonsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    marginBottom: 32,
    overflow: "hidden",
  },
  reasonDivider: { height: 1, backgroundColor: "#F0E8D0" },
  reasonDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  reasonLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    color: "#432104",
  },

  // Stars
  starRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 20,
    marginBottom: 8,
  },
  star: { fontSize: 40, color: "#DDD" },
  starFilled: { color: "#C99317" },

  // Text area
  textArea: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#432104",
    backgroundColor: "#FAF7F2",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 14,
    minHeight: 140,
    marginBottom: 6,
  },
  charCount: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    color: "#B5A08A",
    textAlign: "right",
    marginBottom: 8,
  },
  consentNote: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "#9A7548",
    textAlign: "center",
    marginBottom: 24,
  },

  // Visibility
  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8EE",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E8D9B5",
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  visibilityRowSelected: {
    borderColor: "#C99317",
    backgroundColor: "#FFFBF0",
  },
  visibilityIcon: { fontSize: 22, width: 28 },
  visibilityMid: { flex: 1 },
  visibilityLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#432104",
    marginBottom: 2,
  },
  visibilityDesc: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "#9A7548",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#DDD",
  },
  radioSelected: {
    borderColor: "#C99317",
    backgroundColor: "#C99317",
  },

  // Buttons
  btnPrimary: {
    backgroundColor: "#2E5723",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  btnPrimaryText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 15,
    color: "#FFFFFF",
  },
  btnLink: {
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  btnLinkText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#9A7548",
  },

  errorText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#C05B3A",
    textAlign: "center",
    marginBottom: 20,
  },
});
