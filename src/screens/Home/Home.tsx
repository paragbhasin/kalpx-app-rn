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
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import store, { RootState } from "../../store";
import { screenActions } from "../../store/screenSlice";
import api from "../../Networks/axios";
import { Fonts } from "../../theme/fonts";

// Feature items matching web's MobileHome.vue
const FEATURE_ITEMS = [
  {
    icon: "compass-outline" as const,
    title: "KalpX Mitra",
    text: "Your daily companion.",
  },
  {
    icon: "shield-checkmark-outline" as const,
    title: "Support When Triggered",
    text: "Calm guidance in difficult moments.",
  },
  {
    icon: "pulse-outline" as const,
    title: "Quick Check-In",
    text: "Pause and reflect.",
  },
  {
    icon: "flower-outline" as const,
    title: "Core Practice",
    text: "Daily mantras, sankalps, and guidance.",
  },
];

// Legacy export for RelatedVideosScreen compatibility
export const collapseControl = { avoidCollapse: false };

export default function Home() {
  const navigation: any = useNavigation();
  const { t } = useTranslation();
  const user = useSelector(
    (state: RootState) => state.login?.user || state.socialLoginReducer?.user,
  );
  const isLoggedIn = !!user;

  const [mitraJourneyId, setMitraJourneyId] = useState<string | null>(null);
  const [journeyFocus, setJourneyFocus] = useState<string>("");
  const [journeyDay, setJourneyDay] = useState<number>(1);
  const [checkingJourney, setCheckingJourney] = useState(false);

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
          if (res.data?.hasActiveJourney && res.data?.journeyId) {
            setMitraJourneyId(res.data.journeyId);
            setJourneyFocus(res.data.focus || "");
            setJourneyDay(res.data.dayNumber || 1);
            // Seed screen state for MitraEngine
            store.dispatch(screenActions.setScreenValue({ key: "journey_id", value: res.data.journeyId }));
            store.dispatch(screenActions.setScreenValue({ key: "day_number", value: res.data.dayNumber || 1 }));
            if (res.data.focus) store.dispatch(screenActions.setScreenValue({ key: "scan_focus", value: res.data.focus }));
          } else {
            setMitraJourneyId(null);
          }
        } catch (err) {
          console.debug("[HOME] journey/status failed:", (err as any).message);
        } finally {
          setCheckingJourney(false);
        }
      };
      checkJourney();
    }, [isLoggedIn]),
  );

  const navigateToMitra = (hasJourney: boolean) => {
    const { loadScreenWithData } = require("../../store/screenSlice");
    if (hasJourney) {
      store.dispatch(loadScreenWithData({ containerId: "companion_dashboard", stateId: "day_active" }));
    } else {
      store.dispatch(loadScreenWithData({ containerId: "choice_stack", stateId: "discipline_select" }));
    }
    navigation.navigate("MitraEngine");
  };

  if (checkingJourney) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#D4A017" />
        </View>
      </SafeAreaView>
    );
  }

  const categories = [
    { id: "1", name: "Mitra", icon: "compass-outline" as const, isMitra: true },
    { id: "2", name: t("categories.explore") || "Videos", icon: "play-circle-outline" as const, screen: "Explore" },
    { id: "3", name: t("categories.classes") || "Classes", icon: "laptop-outline" as const, screen: "ClassesScreen" },
    { id: "4", name: t("home.community") || "Community", icon: "people-outline" as const, screen: "CommunityLanding" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" translucent={false} />

      {/* ── Top Category Nav ── */}
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Hero Section ── */}
        <View style={styles.heroSection}>
          <Text style={styles.heroQuote}>"Lift yourself by your own Self."</Text>
          <Text style={styles.heroSource}>— Bhagavad Gita 6.5</Text>
          <Text style={styles.heroTitle}>Guided growth for real life</Text>
          <Text style={styles.heroSubtitle}>
            Helping you navigate life's challenges with clarity, balance, and Sanatan wisdom.
          </Text>
        </View>

        {/* ── Journey CTA ── */}
        {mitraJourneyId ? (
          <TouchableOpacity style={styles.journeyCard} onPress={() => navigateToMitra(true)}>
            <View style={styles.journeyCardInner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.journeyCardTitle}>
                  {t("home.resumeJourney") || "Resume Your Journey"}
                </Text>
                <Text style={styles.journeyCardDesc}>
                  Day {journeyDay} — Continue where you left off.
                </Text>
              </View>
              <View style={styles.journeyArrow}>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.ctaButton} onPress={() => navigateToMitra(false)}>
            <Text style={styles.ctaText}>Begin with KalpX Mitra →</Text>
          </TouchableOpacity>
        )}

        {/* ── Companion Preview ── */}
        <View style={styles.companionSection}>
          <Text style={styles.companionLabel}>KALPX MITRA</Text>
          <Text style={styles.companionTitle}>Your guided path begins here</Text>
          <Text style={styles.companionDesc}>A companion for the life you are actually living.</Text>
          <TouchableOpacity onPress={() => navigateToMitra(!!mitraJourneyId)}>
            <Image
              source={require("../../../assets/locus.png")}
              style={styles.companionImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* ── What Mitra Offers ── */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What Mitra Offers</Text>
          <View style={styles.featureGrid}>
            {FEATURE_ITEMS.map((item, idx) => (
              <View key={idx} style={styles.featureCard}>
                <View style={styles.featureIconWrap}>
                  <Ionicons name={item.icon} size={28} color="#D4A017" />
                </View>
                <Text style={styles.featureTitle}>{item.title}</Text>
                <Text style={styles.featureText}>{item.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── How It Works Link ── */}
        <TouchableOpacity
          style={styles.philosophyLink}
          onPress={() => navigation.navigate("MitraPhilosophy")}
        >
          <Text style={styles.philosophyText}>How KalpX Mitra Works →</Text>
        </TouchableOpacity>

        {/* ── Login CTA (logged out only) ── */}
        {!isLoggedIn && (
          <TouchableOpacity
            style={styles.loginCta}
            onPress={() => navigation.navigate("Login")}
          >
            <Ionicons name="person-outline" size={18} color="#D4A017" />
            <Text style={styles.loginText}>Sign in to save your journey</Text>
          </TouchableOpacity>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7F2",
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
    paddingTop: 12,
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

  // Begin CTA
  ctaButton: {
    backgroundColor: "#D4A017",
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#D4A017",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  // Companion Preview
  companionSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#EDD9A3",
    borderRadius: 12,
  },
  companionLabel: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 12,
    letterSpacing: 3,
    color: "#564B42",
    marginBottom: 6,
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
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  featureCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
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
    fontSize: 15,
    color: "#432104",
    textAlign: "center",
    marginBottom: 4,
  },
  featureText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
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
    color: "#D4A017",
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
