import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { useScreenStore } from "../engine/useScreenBridge";
import api from "../Networks/axios";
import store, { RootState } from "../store";
import { loadScreenWithData, screenActions } from "../store/screenSlice";
import { Fonts } from "../theme/fonts";

// SVGs
import CheckInIcon from "../../assets/1_min_checkin.svg";
import GuidedMobileIcon from "../../assets/guided_mobile.svg";
import MantraIcon from "../../assets/mantra.svg";
import SankalpIcon from "../../assets/sankalp.svg";
import WisdomIcon from "../../assets/wisdom.svg";

const { width } = Dimensions.get("window");

const TESTIMONIALS = [
  {
    quote:
      "“KalpX helped me become more steady, aware, and intentional in daily life.”",
    attribution: "— A KalpX member",
  },
  {
    quote:
      "“Guided by Sanatan wisdom, each day feels more meaningful and centered.”",
    attribution: "— A KalpX member",
  },
];

const FEATURES = [
  {
    id: "mitra",
    title: "KalpX Mitra",
    subtitle: "Your daily companion",
    wide: true,
  },
  {
    id: "support",
    title: "Support When Triggered",
    subtitle: "Calm guidance in difficult moments",
    wide: true,
  },
  {
    id: "checkin",
    title: "Quick Check-In",
    subtitle: "Pause and reflect",
    Icon: CheckInIcon,
  },
  {
    id: "practices",
    title: "Additional Practices",
    subtitle: "Go deeper when you need more",
    Icon: SankalpIcon,
  },
  {
    id: "core",
    title: "Core Practice",
    subtitle: "Daily mantras, sankalps, and guidance",
    Icon: MantraIcon,
  },
  {
    id: "insight",
    title: "Mitra Insight",
    subtitle: "Thoughtful guidance for your path",
    Icon: WisdomIcon,
  },
];

export default function GuidedGrowthContainer() {
  const navigation: any = useNavigation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [checkingJourney, setCheckingJourney] = useState(true);
  const [isReentry, setIsReentry] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const updateBackground = useScreenStore((state) => state.updateBackground);
  const user = useSelector(
    (state: RootState) => state.login?.user || state.socialLoginReducer?.user,
  );
  const isLoggedIn = !!user;
  const journeyCheckRef = useRef(false);

  const GUIDED_BG = require("../../assets/guided_bg.png");

  // Parity with Vue's onMounted / Home.tsx behavior
  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;
      // Reset loading gate on every focus — prevents the page flashing
      // briefly before the journey-status redirect on re-entry.
      setCheckingJourney(true);

      const checkJourney = async () => {
        if (!isLoggedIn) {
          if (!cancelled) setCheckingJourney(false);
          return;
        }
        if (journeyCheckRef.current) {
          if (!cancelled) setCheckingJourney(false);
          return;
        }
        journeyCheckRef.current = true;
        try {
          const res = await api.get("mitra/journey/status/");
          const data = res.data;
          if (data?.hasActiveJourney) {
            // Redirect to dashboard if already has active journey
            store.dispatch(
              loadScreenWithData({
                containerId: "companion_dashboard_v3",
                stateId: "day_active",
              }),
            );
            navigation.navigate("DynamicEngine");
            return;
          } else if (data?.journeyId) {
            setIsReentry(true);
          }
        } catch (e) {
          // Silently fail
        } finally {
          if (!cancelled) setCheckingJourney(false);
          journeyCheckRef.current = false;
        }
      };

      updateBackground(GUIDED_BG);
      checkJourney();

      return () => {
        cancelled = true;
        updateBackground(null);
      };
    }, [isLoggedIn, navigation, updateBackground, GUIDED_BG]),
  );

  // Auto-play testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    flatListRef.current?.scrollToIndex({
      index: activeIndex,
      animated: true,
    });
  }, [activeIndex]);

  const handleStartJourney = () => {
    store.dispatch(
      loadScreenWithData({
        containerId: "choice_stack",
        stateId: "discipline_select",
      }),
    );
    navigation.navigate("DynamicEngine");
  };

  const handleStartFresh = () => {
    // Clear prior journey state
    const clearKeys = [
      "journey_id",
      "day_number",
      "total_days",
      "path_cycle_number",
      "cycle_metrics",
      "continuity",
      "today",
      "arc_state",
      "insights",
      "identity",
      "greeting",
    ];
    for (const k of clearKeys) {
      store.dispatch(screenActions.setScreenValue({ key: k, value: null }));
    }

    // Explicitly set turn_2 for the onboarding block
    store.dispatch(
      screenActions.setScreenValue({ key: "onboarding_turn", value: "turn_1" }),
    );

    store.dispatch(
      loadScreenWithData({
        containerId: "welcome_onboarding",
        stateId: "turn_2",
      }),
    );
    navigation.navigate("DynamicEngine");
  };

  const handleContinueSame = () => {
    store.dispatch(
      loadScreenWithData({
        containerId: "companion_dashboard_v3",
        stateId: "day_active",
      }),
    );
    navigation.navigate("DynamicEngine");
  };

  if (checkingJourney) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#432104" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            {isReentry ? "Welcome back." : "Guided growth for real life"}
          </Text>
          <Text style={styles.heroSubtitle}>
            {isReentry
              ? "Your path is waiting. Would you like to continue from where you left off, or start a new cycle?"
              : "Helping you navigate life’s challenges with clarity, balance, and Sanatan wisdom."}
          </Text>

          {isReentry ? (
            <View style={styles.reentryButtonContainer}>
              <TouchableOpacity
                onPress={handleContinueSame}
                style={styles.chipSecondary}
              >
                <Ionicons
                  name="heart-outline"
                  size={20}
                  color="#4a3f35"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.ctaText}>Continue Same</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleStartFresh}>
                <View
                  style={[
                    styles.ctaButton,
                    {
                      backgroundColor: "transparent",
                      borderColor: "rgba(74, 63, 53, 0.3)",
                    },
                  ]}
                >
                  <Text
                    style={[styles.ctaText, { color: "#4a3f35", opacity: 0.8 }]}
                  >
                    Start Fresh
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={handleStartJourney}>
              <LinearGradient
                colors={["#f3e8dd", "#e6d6c8"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaButton}
              >
                <Text style={styles.ctaText}>Start Your Journey</Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#4a3f35"
                  style={{ marginLeft: 8 }}
                />
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Path Section */}
        <View style={styles.pathSection}>
          <View style={styles.pathContent}>
            <Text style={styles.sectionTitle}>
              Your guided path begins here
            </Text>
            <Text style={styles.sectionText}>
              KalpX Mitra helps you transform through daily check-ins, mantras,
              sankalps, and guided practices designed for real-life challenges.
            </Text>
          </View>
          <View style={styles.mockupContainer}>
            <GuidedMobileIcon width={160} height={300} />
          </View>
        </View>

        {/* Feature Grid */}
        <View style={styles.featuresSection}>
          {/* Wide Features */}
          <View style={styles.wideGrid}>
            {FEATURES.filter((f) => f.wide).map((feature) => (
              <BlurView
                key={feature.id}
                intensity={40}
                tint="light"
                style={styles.featureCardWide}
              >
                <Text style={styles.featureTitleText}>{feature.title}</Text>
                <Text style={styles.featureSubtitleText}>
                  {feature.subtitle}
                </Text>
              </BlurView>
            ))}
          </View>

          <TouchableOpacity
            style={styles.howItWorksLink}
            onPress={() => navigation.navigate("MitraPhilosophy")}
          >
            <Text style={styles.linkText}>How KalpX Mitra Works</Text>
          </TouchableOpacity>

          {/* Small Features */}
          <View style={styles.smallGrid}>
            {FEATURES.filter((f) => !f.wide).map((feature) => (
              <BlurView
                key={feature.id}
                intensity={40}
                tint="light"
                style={styles.featureCardSmall}
              >
                {feature.Icon && (
                  <feature.Icon
                    width={34}
                    height={34}
                    style={styles.smallIcon}
                  />
                )}
                <Text style={styles.featureTitleTextSmall}>
                  {feature.title}
                </Text>
                <Text style={styles.featureSubtitleTextSmall}>
                  {feature.subtitle}
                </Text>
              </BlurView>
            ))}
          </View>
        </View>

        {/* Carousel Dots */}
        <View style={styles.dotsContainer}>
          {TESTIMONIALS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, activeIndex === i && styles.activeDot]}
            />
          ))}
        </View>

        {/* Testimonials */}
        <View style={styles.testimonialsSection}>
          <FlatList
            ref={flatListRef}
            data={TESTIMONIALS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false} // Managed by timer
            keyExtractor={(_, i) => i.toString()}
            renderItem={({ item }) => (
              <View style={styles.testimonialItem}>
                <Text style={styles.quoteText}>{item.quote}</Text>
                <Text style={styles.attributionText}>{item.attribution}</Text>
              </View>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingBottom: 60,
  },
  heroSection: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 40,
    marginBottom: 40,
  },
  reentryButtonContainer: {
    width: "100%",
    alignItems: "center",
  },
  heroTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 32,
    color: "#432104",
    textAlign: "center",
    lineHeight: 38,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontFamily: Fonts.sans.regular,
    fontSize: 16,
    color: "#432104",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
    opacity: 0.9,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    // paddingVertical: 14,
    paddingHorizontal: 32,
    padding: 10,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  chipSecondary: {
    backgroundColor: "#FBF5F5",
    borderColor: "#9f9f9f",
    borderWidth: 0.3,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 24,
    elevation: 6,
    padding: 10,
    marginBottom: 12,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  ctaText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#4a3f35",
  },
  pathSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    alignItems: "center",
    marginBottom: 40,
  },
  pathContent: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 22,
    color: "#432104",
    marginBottom: 8,
  },
  sectionText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#6d635b",
    lineHeight: 20,
  },
  mockupContainer: {
    flex: 0.8,
    alignItems: "center",
  },
  mobileMockup: {
    width: 140,
    height: 250,
  },
  featuresSection: {
    paddingHorizontal: 15,
    marginBottom: 40,
  },
  wideGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  featureCardWide: {
    flex: 1,
    padding: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitleText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 15,
    color: "#432104",
    textAlign: "center",
  },
  featureSubtitleText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: "#7d736b",
    textAlign: "center",
    marginTop: 4,
  },
  howItWorksLink: {
    alignSelf: "center",
    marginBottom: 20,
  },
  linkText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "#432104",
    textDecorationLine: "underline",
  },
  smallGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  featureCardSmall: {
    width: (width - 30 - 24) / 4, // 4 columns with gap
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
    overflow: "hidden",
    alignItems: "center",
  },
  smallIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  featureTitleTextSmall: {
    fontFamily: Fonts.serif.bold,
    fontSize: 12,
    color: "#432104",
    textAlign: "center",
  },
  featureSubtitleTextSmall: {
    fontFamily: Fonts.sans.regular,
    fontSize: 10,
    color: "#7d736b",
    textAlign: "center",
    marginTop: 2,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#c7bcaf",
  },
  activeDot: {
    backgroundColor: "#b8922a",
  },
  testimonialsSection: {
    width: width,
  },
  testimonialItem: {
    width: width,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  quoteText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    fontStyle: "italic",
    color: "#4a3f35",
    textAlign: "center",
    lineHeight: 26,
    marginBottom: 12,
  },
  attributionText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#8d837b",
  },
});
