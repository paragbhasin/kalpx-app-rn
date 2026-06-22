/**
 * ProgramCompletionScreen — Gate 3 MOB-6.
 *
 * Fires POST /api/programs/my-active/day/{N}/complete/ on mount.
 * Day 3: micro-feedback prompt.
 * Day 7: testimonial input + navigate to ProgramDay8TransitionScreen.
 * Consent defaults to false (Decision 9).
 */
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Fonts } from "../../theme/fonts";
import {
  completeProgramDay,
  submitProgramMicroFeedback,
  submitProgramTestimonial,
} from "../../engine/programApi";

const BEIGE_BG = require("../../../assets/beige_bg.webp");

const MICRO_FEEDBACK_OPTIONS = [
  "It shifted something",
  "I needed this today",
  "Peaceful",
  "I'll keep going",
];

export default function ProgramCompletionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { dayNumber, completionMessage, programName } = route.params ?? {};

  const completedRef = useRef(false);
  const [completing, setCompleting] = useState(true);
  const [completionError, setCompletionError] = useState(false);

  // Day 3 micro-feedback
  const [feedbackSelected, setFeedbackSelected] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Day 7 testimonial
  const [testimonialText, setTestimonialText] = useState("");
  const [testimonialSubmitted, setTestimonialSubmitted] = useState(false);
  const [testimonialLoading, setTestimonialLoading] = useState(false);

  useEffect(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    (async () => {
      try {
        await completeProgramDay(dayNumber);
      } catch {
        setCompletionError(true);
      } finally {
        setCompleting(false);
      }
    })();
  }, [dayNumber]);

  const handleMicroFeedback = async (option: string) => {
    setFeedbackSelected(option);
    try {
      await submitProgramMicroFeedback("", option);
    } catch {}
    setFeedbackSubmitted(true);
  };

  const handleSubmitTestimonial = async () => {
    if (!testimonialText.trim()) return;
    setTestimonialLoading(true);
    try {
      await submitProgramTestimonial(testimonialText.trim());
      setTestimonialSubmitted(true);
    } catch {
      Alert.alert("Couldn't save", "Please try again.");
    } finally {
      setTestimonialLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: programName
          ? `I just completed "${programName}" on KalpX! 🙏`
          : "I just completed a 7-day practice on KalpX! 🙏",
      });
    } catch {}
  };

  const handleGoToDay8 = () => {
    navigation.replace("ProgramDay8TransitionScreen");
  };

  const handleReturn = () => {
    navigation.navigate("Home");
  };

  const isDay3 = dayNumber === 3;
  const isDay7 = dayNumber === 7;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground source={BEIGE_BG} style={styles.bg}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {completing ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color="#C99317" />
            </View>
          ) : (
            <>
              {/* Completion header */}
              <View style={styles.header}>
                <Text style={styles.dayBadge}>DAY {dayNumber} COMPLETE</Text>
                <Text style={styles.emoji}>🙏</Text>
                {completionMessage ? (
                  <Text style={styles.completionMessage}>{completionMessage}</Text>
                ) : (
                  <Text style={styles.completionMessage}>
                    Beautiful. You showed up for yourself today.
                  </Text>
                )}
              </View>

              {/* Day 3: Micro-feedback */}
              {isDay3 && !feedbackSubmitted && (
                <View style={styles.feedbackCard}>
                  <Text style={styles.feedbackQuestion}>
                    How did today's practice feel?
                  </Text>
                  <View style={styles.feedbackOptions}>
                    {MICRO_FEEDBACK_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        activeOpacity={0.8}
                        onPress={() => handleMicroFeedback(opt)}
                        style={[
                          styles.feedbackChip,
                          feedbackSelected === opt && styles.feedbackChipSelected,
                        ]}
                      >
                        <Text
                          style={[
                            styles.feedbackChipText,
                            feedbackSelected === opt && styles.feedbackChipTextSelected,
                          ]}
                        >
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {isDay3 && feedbackSubmitted && (
                <View style={styles.feedbackDone}>
                  <Text style={styles.feedbackDoneText}>Thank you for sharing 🌼</Text>
                </View>
              )}

              {/* Day 7: Share + Testimonial */}
              {isDay7 && (
                <>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleShare}
                    style={styles.shareBtn}
                  >
                    <Text style={styles.shareBtnText}>Share what shifted →</Text>
                  </TouchableOpacity>

                  {!testimonialSubmitted ? (
                    <View style={styles.testimonialCard}>
                      <Text style={styles.testimonialLabel}>
                        Want to leave a reflection? (optional)
                      </Text>
                      <TextInput
                        style={styles.testimonialInput}
                        value={testimonialText}
                        onChangeText={setTestimonialText}
                        placeholder="What shifted for you over these 7 days?"
                        placeholderTextColor="#9A7548"
                        multiline
                        numberOfLines={4}
                        maxLength={500}
                        textAlignVertical="top"
                      />
                      {testimonialText.trim().length > 0 && (
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={handleSubmitTestimonial}
                          disabled={testimonialLoading}
                          style={[styles.testimonialBtn, testimonialLoading && { opacity: 0.6 }]}
                        >
                          {testimonialLoading ? (
                            <ActivityIndicator size="small" color="#fff" />
                          ) : (
                            <Text style={styles.testimonialBtnText}>Save reflection</Text>
                          )}
                        </TouchableOpacity>
                      )}
                      <Text style={styles.testimonialConsent}>
                        Your reflection is private by default.
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.feedbackDone}>
                      <Text style={styles.feedbackDoneText}>Reflection saved 🙏</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleGoToDay8}
                    style={styles.day8Cta}
                    accessibilityLabel="Choose your next step"
                  >
                    <Text style={styles.day8CtaText}>Choose your next step →</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Return home */}
              {!isDay7 && (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleReturn}
                  style={styles.returnBtn}
                  accessibilityLabel="Return home"
                >
                  <Text style={styles.returnBtnText}>Back to home</Text>
                </TouchableOpacity>
              )}

              {completionError && (
                <Text style={styles.errorNote}>
                  Completion couldn't be saved — please check your connection.
                </Text>
              )}
            </>
          )}
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#FBF5F5" },
  bg: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 80 },

  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center", minHeight: 200 },

  header: { alignItems: "center", marginBottom: 32 },
  dayBadge: {
    fontFamily: Fonts.sans.medium,
    fontSize: 12,
    color: "#9A7548",
    letterSpacing: 0.06,
    marginBottom: 12,
  },
  emoji: { fontSize: 40, marginBottom: 16 },
  completionMessage: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: "#432104",
    textAlign: "center",
    lineHeight: 32,
  },

  feedbackCard: {
    backgroundColor: "#FFF8EE",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 20,
    marginBottom: 24,
  },
  feedbackQuestion: {
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    color: "#432104",
    marginBottom: 16,
    textAlign: "center",
  },
  feedbackOptions: { gap: 10 },
  feedbackChip: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFF8EE",
  },
  feedbackChipSelected: { backgroundColor: "#C99317", borderColor: "#C99317" },
  feedbackChipText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#432104",
    textAlign: "center",
  },
  feedbackChipTextSelected: { color: "#fff" },

  feedbackDone: { alignItems: "center", marginBottom: 24 },
  feedbackDoneText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#9A7548",
  },

  shareBtn: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#C99317",
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  shareBtnText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    color: "#C99317",
  },

  testimonialCard: {
    backgroundColor: "#FFF8EE",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 20,
    marginBottom: 24,
  },
  testimonialLabel: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#432104",
    marginBottom: 12,
  },
  testimonialInput: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#432104",
    backgroundColor: "#FAF7F2",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E8D9B5",
    padding: 12,
    minHeight: 100,
    marginBottom: 12,
  },
  testimonialBtn: {
    backgroundColor: "#C99317",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 8,
  },
  testimonialBtnText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "#fff",
  },
  testimonialConsent: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    color: "#9A7548",
    textAlign: "center",
  },

  day8Cta: {
    backgroundColor: "#432104",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginBottom: 16,
  },
  day8CtaText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 16,
    color: "#F5E6C8",
  },

  returnBtn: {
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8D9B5",
    marginBottom: 16,
  },
  returnBtnText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 15,
    color: "#9A7548",
  },

  errorNote: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "#C05B3A",
    textAlign: "center",
    marginTop: 8,
  },
});
