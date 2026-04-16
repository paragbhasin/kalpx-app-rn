/**
 * Home.tsx — Mitra-first Home screen matching web's MobileHome.vue behavior.
 *
 * Three states:
 * 1. Logged out / no journey → "Begin with KalpX Mitra" CTA
 * 2. Logged in + active journey → "Resume Your Journey" → MitraEngine dashboard
 * 3. Logged in + no journey → "Begin with KalpX Mitra" → MitraEngine portal
 *
 * Old Home.tsx saved as Home.old.tsx for reference.
 */
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";

import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import {
  mitraJourneyWelcomeBack,
  mitraTrackEvent,
} from "../../engine/mitraApi";
import { useScreenStore } from "../../engine/useScreenBridge";
import api from "../../Networks/axios";
import store, { RootState } from "../../store";
import { loadScreenWithData, screenActions } from "../../store/screenSlice";
import { Fonts } from "../../theme/fonts";
import ContinueJourney from "./ContinueJourney";
import WelcomeBack from "./WelcomeBack";

const FEATURE_ITEMS = [
  {
    icon: require("../../../assets/guided-growth.png"),
    title: "KalpX Mitra",
    text: "Your daily companion.",
  },
  {
    icon: require("../../../assets/daily-consistency.png"),
    title: "Support When Triggered",
    text: "Calm guidance in difficult moments.",
  },
  {
    icon: require("../../../assets/self-reflection.png"),
    title: "Quick Check-In",
    text: "Pause and reflect.",
  },
  {
    icon: require("../../../assets/sanatan-wisdom.png"),
    title: "Core Practice",
    text: "Daily mantras, sankalps, and guidance.",
  },
];

// Legacy export for RelatedVideosScreen compatibility
export const collapseControl = { avoidCollapse: false };

export default function Home() {
  const navigation: any = useNavigation();
  const user = useSelector(
    (state: RootState) => state.login?.user || state.socialLoginReducer?.user,
  );
  const isLoggedIn = !!user;

  const updateBackground = useScreenStore((state) => state.updateBackground);
  const updateHeaderHidden = useScreenStore(
    (state) => state.updateHeaderHidden,
  );

  const [mitraJourneyId, setMitraJourneyId] = useState<string | null>(null);
  const [journeyDay, setJourneyDay] = useState<number>(1);
  const [checkingJourney, setCheckingJourney] = useState(false);
  const [welcomeBackData, setWelcomeBackData] = useState<any>(null);
  // Mitra v3 — guard auto-route so we don't re-navigate on every Home focus.
  const v3AutoRoutedRef = useRef(false);

  const HOME_BACKGROUND = require("../../../assets/new_home.png");
  const CONTINUE_BG = require("../../../assets/continue_journey_bg.jpeg");

  useFocusEffect(
    React.useCallback(() => {
      updateBackground(mitraJourneyId ? CONTINUE_BG : HOME_BACKGROUND);
      updateHeaderHidden(false);
      return () => {
        updateBackground(null);
        updateHeaderHidden(false);
      };
    }, [
      updateBackground,
      updateHeaderHidden,
      mitraJourneyId,
      CONTINUE_BG,
      HOME_BACKGROUND,
    ]),
  );

  const seedJourneyStatus = React.useCallback((status: any) => {
    if (!status) return;

    const screenUpdates: Record<string, any> = {
      journey_id: status.journeyId ?? null,
      day_number: status.dayNumber || 1,
      total_days: status.totalDays || 14,
      is_experienced: true,
    };

    const focus = status.focus || status.activeFocus || "";
    const subFocus = status.subfocus || status.sub_focus || "";
    const depth = status.depth || "standard";

    if (focus) {
      screenUpdates.scan_focus = focus;
      screenUpdates.active_focus = focus;
      screenUpdates.suggested_focus = focus;
    }

    if (subFocus) {
      screenUpdates.prana_baseline_selection = subFocus;
    }

    if (depth) {
      screenUpdates.routine_depth = depth;
      screenUpdates.routine_setup = depth;
    }

    store.dispatch(screenActions.updateScreenData(screenUpdates));
  }, []);

  // Check journey status on focus (matches web's onMounted behavior)
  useFocusEffect(
    React.useCallback(() => {
      const checkJourney = async () => {
        if (!isLoggedIn) {
          setMitraJourneyId(null);
          return;
        }
        setCheckingJourney(true);
        try {
          const res = await api.get("mitra/journey/status/");
          const data = res.data;
          if (data?.welcomeBack) {
            setWelcomeBackData({
              focus: data.focus || "",
              subfocus: data.subfocus || data.sub_focus || "",
              cycleNumber: data.pathCycleNumber || 1,
              daysPracticed: data.daysPracticed || 0,
              strongestAnchor: data.strongestAnchor || "",
              journeyId: data.journeyId || null,
            });
            setMitraJourneyId(null);
          } else if (data?.hasActiveJourney && data?.journeyId) {
            setWelcomeBackData(null);
            setMitraJourneyId(data.journeyId);
            setJourneyDay(data.dayNumber || 1);
            seedJourneyStatus(data);
            // Mitra v3 auto-route: authed user with active journey skips
            // legacy Home splash and goes straight to the companion experience.
            if (!v3AutoRoutedRef.current) {
              v3AutoRoutedRef.current = true;
              navigateToMitra(true);
            }
          } else {
            setWelcomeBackData(null);
            setMitraJourneyId(null);
            // Mitra v3 auto-route: authed user without a journey lands in
            // welcome_onboarding Turn 1 instead of the legacy splash.
            if (!v3AutoRoutedRef.current) {
              v3AutoRoutedRef.current = true;
              navigateToMitra(false);
            }
          }
        } catch (err) {
          console.debug("[HOME] journey/status failed:", (err as any).message);
        } finally {
          setCheckingJourney(false);
        }
      };
      checkJourney();
    }, [isLoggedIn, seedJourneyStatus]),
  );

  const [isProcessing, setIsProcessing] = useState(false);

  const handleWelcomeBackContinue = async () => {
    setIsProcessing(true);
    mitraTrackEvent("welcome_back_decided", {
      journeyId: welcomeBackData?.journeyId || null,
      dayNumber: 0,
      meta: {
        decision: "continue",
        days_past_end: welcomeBackData?.daysPastEnd || 0,
        focus: welcomeBackData?.focus || "",
      },
    });
    try {
      const res = await mitraJourneyWelcomeBack("continue");
      if (res?.status === "ok" && res?.newJourneyId) {
        const screenUpdates: Record<string, any> = {
          journey_id: res.newJourneyId,
          day_number: 1,
          is_experienced: true,
        };
        if (res.focus) {
          screenUpdates.scan_focus = res.focus;
          screenUpdates.active_focus = res.focus;
        }
        if (res.subfocus) {
          screenUpdates.prana_baseline_selection = res.subfocus;
        }
        store.dispatch(screenActions.updateScreenData(screenUpdates));
        setWelcomeBackData(null);
        setMitraJourneyId(res.newJourneyId);
        setJourneyDay(1);

        const { executeAction } = require("../../engine/actionExecutor");
        await executeAction(
          { type: "generate_companion" },
          {
            screenState: store.getState().screen.screenData,
            loadScreen: (target: any) => {
              const containerId =
                target?.container_id || target?.containerId || "generic";
              const stateId =
                target?.state_id || target?.stateId || target || "";
              store.dispatch(loadScreenWithData({ containerId, stateId }));
            },
            goBack: () => {
              const { goBackWithData } = require("../../store/screenSlice");
              store.dispatch(goBackWithData());
            },
            setScreenValue: (value: any, key: string) => {
              store.dispatch(screenActions.setScreenValue({ key, value }));
            },
          },
        );

        store.dispatch(
          loadScreenWithData({
            containerId: process.env.EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD === "1"
              ? "companion_dashboard_v3"
              : "companion_dashboard",
            stateId: "day_active",
          }),
        );
        navigation.navigate("DynamicEngine");
      }
    } catch (err) {
      console.debug("[HOME] welcome-back continue failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleWelcomeBackFresh = async () => {
    setIsProcessing(true);
    mitraTrackEvent("welcome_back_decided", {
      journeyId: welcomeBackData?.journeyId || null,
      dayNumber: 0,
      meta: {
        decision: "fresh",
        days_past_end: welcomeBackData?.daysPastEnd || 0,
        focus: welcomeBackData?.focus || "",
      },
    });
    try {
      await mitraJourneyWelcomeBack("fresh");
    } catch (err) {
      console.debug("[HOME] welcome-back fresh failed:", err);
    }
    store.dispatch(screenActions.resetState());
    setWelcomeBackData(null);
    setMitraJourneyId(null);
    store.dispatch(
      loadScreenWithData({
        containerId: "choice_stack",
        stateId: "discipline_select",
      }),
    );
    setIsProcessing(false);
    navigation.navigate("DynamicEngine");
  };

  const navigateToMitra = async (hasJourney: boolean) => {
    if (hasJourney) {
      setIsProcessing(true);
      try {
        // Log Bearer Token check for user visibility
        const AsyncStorage =
          require("@react-native-async-storage/async-storage").default;
        const token = await AsyncStorage.getItem("access_token");
        console.log("=====================================");
        console.log("🛠️  RESUME JOURNEY DEBUG");
        console.log(
          "🔑 Checking Bearer Token:",
          token ? `Exists (${token.slice(0, 15)}...)` : "MISSING",
        );

        console.log("📡 Calling Status API: mitra/journey/status/");
        const res = await api.get("mitra/journey/status/");
        const status = res.data;
        console.log("📦 Status API Response:", status);

        if (status?.hasActiveJourney && status?.journeyId) {
          // Reset checkpoint state when entering a new journey so stale
          // completed flags from a prior session don't skip the checkpoint.
          const prevJourneyId = store.getState().screen.screenData.journey_id;
          if (prevJourneyId !== status.journeyId) {
            store.dispatch(
              screenActions.setScreenValue({
                key: "checkpoint_completed",
                value: false,
              }),
            );
            store.dispatch(
              screenActions.setScreenValue({
                key: "checkpoint_original_data",
                value: null,
              }),
            );
          }

          seedJourneyStatus(status);

          // Phase T2b — shadow call to the decide_moment router. We log
          // the decision for telemetry validation but do NOT override
          // legacy routing yet. A follow-up PR will flip to active
          // routing once shadow-mode decisions are validated against
          // the legacy Home.tsx:368+ auto-route logic below.
          try {
            const { mitraMomentNext } = require("../../engine/mitraApi");
            const decision = await mitraMomentNext({
              trigger_event: "app_open",
            });
            if (decision && __DEV__) {
              console.log(
                "[MOMENT_ROUTER] shadow decision:",
                decision.moment_id,
                "tier=" + decision.tier,
                "reentry=" + (decision.reentry_target ?? "none"),
                "considered=" + JSON.stringify(decision.considered || []),
              );
            }
          } catch (_err) {
            // swallow — router is shadow mode only, never blocks resume
          }

          // Audit fix F4 (2026-04-13, revised) — resume dispatches the same
          // generate_companion action handler with use_journey_companion=true,
          // which swaps the API call to read-only /journey/companion/ but
          // reuses the full (~50-field) population logic. Fixes regression
          // where CoreItemsList read empty card_mantra_title / master_mantra
          // on resume and dashboard triad showed placeholders + view_info
          // couldn't open info reveal.
          console.log(
            "📡 Calling: generate_companion via journey/companion (resume)",
          );
          const { executeAction } = require("../../engine/actionExecutor");
          await executeAction(
            {
              type: "generate_companion",
              payload: { use_journey_companion: true },
            },
            {
              screenState: store.getState().screen.screenData,
              loadScreen: (target: any) => {
                const containerId =
                  target?.container_id || target?.containerId || "generic";
                const stateId =
                  target?.state_id || target?.stateId || target || "";
                store.dispatch(loadScreenWithData({ containerId, stateId }));
              },
              goBack: () => {
                const { goBackWithData } = require("../../store/screenSlice");
                store.dispatch(goBackWithData());
              },
              setScreenValue: (value: any, key: string) => {
                store.dispatch(screenActions.setScreenValue({ key, value }));
              },
            },
          );
          console.log("✅ resume companion data loaded");

          // Auto-route to checkpoint screens on day 7 / day 14 if not yet completed
          const dayNumber = status.dayNumber || 1;
          const checkpointCompleted =
            store.getState().screen.screenData.checkpoint_completed;
          // Both day 7 and day 14 use weekly_checkpoint — the cycle_reflection
          // block handles both via its internal is14DayCycle check.
          // (daily_insight_14 is the pre-checkpoint milestone splash and is
          // reached separately from the milestone view, not auto-routed.)
          const checkpointStateId =
            dayNumber === 7 || dayNumber === 14 ? "weekly_checkpoint" : null;

          if (checkpointStateId && !checkpointCompleted) {
            store.dispatch(
              screenActions.setScreenValue({
                key: "checkpoint_day",
                value: dayNumber,
              }),
            );
            store.dispatch(
              loadScreenWithData({
                containerId: "cycle_transitions",
                stateId: checkpointStateId,
              }),
            );
          } else {
            store.dispatch(
              loadScreenWithData({
                containerId: process.env.EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD === "1"
                  ? "companion_dashboard_v3"
                  : "companion_dashboard",
                stateId: "day_active",
              }),
            );
          }
        } else {
          // Mitra v3: no active journey → launch welcome_onboarding conversation
          // (Moments 1–7). Replaces the legacy choice_stack/discipline_select
          // portal. Seeds onboarding_turn=1 + empty draft state so the first
          // turn renders correctly.
          // LEGACY (commented out — kept for rollback reference):
          // store.dispatch(loadScreenWithData({
          //   containerId: "choice_stack",
          //   stateId: "discipline_select",
          // }));
          store.dispatch(
            screenActions.setScreenValue({ key: "onboarding_turn", value: 1 }),
          );
          store.dispatch(
            screenActions.setScreenValue({
              key: "onboarding_draft_state",
              value: { started_at: Date.now() },
            }),
          );
          store.dispatch(
            loadScreenWithData({
              containerId: "welcome_onboarding",
              stateId: "turn_1",
            }),
          );
        }
      } catch (err) {
        console.debug("[HOME] Navigation pre-check failed:", err);
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Mitra v3: unauthed or no-journey path → welcome_onboarding turn_1.
      // LEGACY (commented out):
      // store.dispatch(loadScreenWithData({
      //   containerId: "choice_stack",
      //   stateId: "discipline_select",
      // }));
      store.dispatch(
        screenActions.setScreenValue({ key: "onboarding_turn", value: 1 }),
      );
      store.dispatch(
        screenActions.setScreenValue({
          key: "onboarding_draft_state",
          value: { started_at: Date.now() },
        }),
      );
      store.dispatch(
        loadScreenWithData({
          containerId: "welcome_onboarding",
          stateId: "turn_1",
        }),
      );
    }
    navigation.navigate("DynamicEngine");
  };

  // Temporarily disable the quick-category nav (Mitra / Videos / Classes / Community).
  // const categories = [
  //   { id: "1", name: "Mitra", icon: "compass-outline" as const, isMitra: true },
  //   { id: "2", name: t("categories.explore") || "Videos", icon: "play-circle-outline" as const, screen: "Explore" },
  //   { id: "3", name: t("categories.classes") || "Classes", icon: "laptop-outline" as const, screen: "ClassesScreen" },
  //   { id: "4", name: t("home.community") || "Community", icon: "people-outline" as const, screen: "CommunityLanding" },
  // ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FAF7F2"
        translucent={false}
      />

      {(checkingJourney || isProcessing) && (
        <BlurView intensity={30} tint="dark" style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#D4A017" />
        </BlurView>
      )}

      {/* ── Top Category Nav ── */}
      {/*
      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => {
              if (item.isMitra) {
                navigateToMitra(!!mitraJourneyId);
              } else if (item.screen) {
                navigation.navigate(item.screen);
              }
            }}
          >
            <Ionicons name={item.icon} size={24} color="#9A7548" />
            <Text style={styles.categoryText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
      */}

      {welcomeBackData ? (
        <WelcomeBack
          focus={welcomeBackData.focus}
          subfocus={welcomeBackData.subfocus}
          cycleNumber={welcomeBackData.cycleNumber}
          daysPracticed={welcomeBackData.daysPracticed}
          strongestAnchor={welcomeBackData.strongestAnchor}
          onContinue={handleWelcomeBackContinue}
          onFresh={handleWelcomeBackFresh}
        />
      ) : mitraJourneyId ? (
        <ContinueJourney
          dayNumber={journeyDay}
          onResume={() => navigateToMitra(true)}
        />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero Section ── */}
          <View style={styles.heroSection}>
            <Text style={styles.heroQuote}>
              "In this path, no effort is ever lost."
            </Text>
            <Text style={styles.heroSource}>— Bhagavad Gita 6.5</Text>
            <Text style={[styles.heroTitle, { marginTop: 20 }]}>
              KalpX Mitra
            </Text>
            <Text style={styles.heroSubtitle}>A daily companion for life</Text>
          </View>

          {/* ── Journey CTA ── */}

          {/* ── Companion Preview ── */}
          <View style={styles.companionSection}>
            <Text style={[styles.companionTitle, { marginTop: 20 }]}>
              Your daily companion for life
            </Text>
            <Text style={styles.companionDesc}>
              Grounded in timeless Sanatan wisdom.
            </Text>
            <Text style={styles.companionDesc}>
              A calmer, clearer way to navigate life - one day at a time.
            </Text>
          </View>

          {/* {!isLoggedIn && (
            <TouchableOpacity
              style={styles.loginCta}
              onPress={() => navigation.navigate("Login")}
            >
              <Ionicons name="person-outline" size={18} color="#D4A017" />
              <Text style={styles.loginText}>Sign in to save your journey</Text>
            </TouchableOpacity>
          )} */}
          <Image source={require("../../../assets/new_home_lotus.png")} />
          {/* <View style={{ height: 220 }} /> */}
          <TouchableOpacity
            onPress={() => navigateToMitra(false)}
            activeOpacity={0.85}
            style={{ borderRadius: 28 }}
          >
            <LinearGradient
              colors={["#E5D4CA", "#F5EDEA"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaButton}
            >
              <Text style={styles.ctaText}>Begin your journey →</Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    marginTop: -40,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryList: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  categoryItem: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 70,
  },
  categoryText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: "#432104",
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 65,
    paddingBottom: 40,
  },

  // Hero
  heroSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  heroQuote: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    fontStyle: "italic",
    color: "#5C5648",
    textAlign: "center",
  },
  heroSource: {
    fontFamily: Fonts.serif.regular,
    fontSize: 14,
    color: "#8A7D6B",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 28,
    color: "#432104",
    textAlign: "center",
    lineHeight: 36,
  },
  heroSubtitle: {
    fontFamily: Fonts.sans.regular,
    fontSize: 15,
    color: "#5C5648",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 22,
    maxWidth: 320,
  },

  // Journey Resume Card
  journeyCard: {
    backgroundColor: "#432104",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  journeyCardInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  journeyCardTitle: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 18,
    color: "#EDDEB4",
  },
  journeyCardDesc: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "rgba(237, 222, 180, 0.7)",
    marginTop: 4,
  },
  journeyArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#D4A017",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  ctaButton: {
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1.5,
    borderColor: "#E8D7B5",

    shadowColor: "#BFA27A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    width: "60%",
    elevation: 6,
    alignSelf: "center",
  },

  ctaText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5C4432", // deep gold-brown
    letterSpacing: 0.5,
  },

  // Companion Preview
  companionSection: {
    alignItems: "center",
    marginBottom: 32,
    // paddingVertical: 20,
    paddingHorizontal: 16,
  },
  companionLabel: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 12,
    letterSpacing: 3,
    color: "#564B42",
    marginBottom: 6,
  },
  featureIconImage: {
    width: 28,
    height: 28,
  },
  companionTitle: {
    fontFamily: Fonts.sans.medium,
    fontSize: 16,
    color: "#432104",
    marginBottom: 4,
  },
  companionDesc: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "#5C5648",
    marginBottom: 16,
    textAlign: "center",
  },
  companionImage: {
    width: 280,
    height: 200,
  },

  // Features
  featuresSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 18,
    color: "#432104",
    textAlign: "center",
    marginBottom: 16,
  },
  featureGrid: {
    flexDirection: "row",
    justifyContent: "center",
    // alignItems: "flex-start",
    // gap: 5,
  },
  featureCard: {
    width: "27%",

    padding: 5,
    alignItems: "center",

    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  featureIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(212, 160, 23, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  featureTitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 13,
    color: "#432104",
    textAlign: "center",
    marginBottom: 4,
  },
  featureText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    color: "#5C5648",
    textAlign: "center",
  },

  // Philosophy link
  philosophyLink: {
    alignItems: "center",
    marginBottom: 24,
  },
  philosophyText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "#432104",
    textDecorationLine: "underline",
  },

  // Login CTA
  loginCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#EDD9A3",
  },
  loginText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "#5C5648",
  },
});
