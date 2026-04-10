import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Fonts } from "../../theme/fonts";

const { width, height } = Dimensions.get("window");

interface ContinueJourneyProps {
  dayNumber: number;
  onResume: () => void;
}

const FEATURE_ITEMS = [
  {
    icon: require("../../../assets/mitra_3.svg"),
    title: "Mitra",
    subtitle: "Your daily companion",
  },
  {
    icon: require("../../../assets/mitra_2.svg"),
    title: "Communities",
    subtitle: "Grow with others",
  },
  {
    icon: require("../../../assets/mitra_1.svg"),
    title: "Classes",
    subtitle: "Learn with depth",
  },
];

const BACKGROUND_IMAGE = require("../../../assets/continue_journey_bg.jpeg");

export default function ContinueJourney({
  dayNumber,
  onResume,
}: ContinueJourneyProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Top Section --- */}
        <View style={styles.topSection}>
          <View style={styles.quoteWrapper}>
            <Text style={styles.quoteText}>
              “In this path, no effort is ever lost.”
            </Text>
            <View style={styles.quoteDivider}>
              <View style={styles.line} />
              <Text style={styles.quoteSource}>BHAGAVAD GITA 2.40</Text>
              <View style={styles.line} />
            </View>
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>
              Rooted guidance.{"\n"}Real transformation.
            </Text>
            <Text style={styles.heroSubtitle}>
              Every day you return, something within you{" "}
              <Text style={styles.heroSubtitleSpan}>strengthens.</Text>
            </Text>
          </View>

          <View style={styles.ctaGroup}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={onResume}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaButtonText}>Return to Your Practice</Text>
              <View style={styles.btnIconCircle}>
                <Ionicons name="arrow-forward" size={16} color="white" />
              </View>
            </TouchableOpacity>

            <View style={styles.closingNote}>
              <Text style={styles.noteText}>
                Transformation does not come in one moment.
              </Text>
              <Text style={[styles.noteText, styles.italic]}>
                It comes by returning.
              </Text>
            </View>
          </View>
        </View>

        {/* --- Bottom Section --- */}
        <View style={styles.bottomSection}>
          <Text style={styles.bottomTitle}>
            Begin with Mitra. Grow with KalpX.
          </Text>

          <View style={styles.featureRow}>
            {FEATURE_ITEMS.map((item, index) => (
              <React.Fragment key={index}>
                <TouchableOpacity
                  style={styles.featureCard}
                  onPress={onResume}
                  activeOpacity={0.7}
                >
                  <Image source={item.icon} style={styles.featureIcon} />
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureSubtitle}>{item.subtitle}</Text>
                </TouchableOpacity>
                {index < FEATURE_ITEMS.length - 1 && (
                  <View style={styles.verticalDivider} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 60,
    paddingBottom: 40,
  },
  topSection: {
    height: 520, // Approximate 65vh-70vh for mobile devices
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between",
  },
  quoteWrapper: {
    alignItems: "center",
    marginTop: 20,
  },
  quoteText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    lineHeight: 26,
    color: "#E8DCC3",
    textAlign: "center",
    maxWidth: 290,
    letterSpacing: 0.3,
  },
  quoteDivider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    gap: 12,
  },
  line: {
    height: 1,
    width: 30,
    backgroundColor: "#CBBE9A",
    opacity: 0.5,
  },
  quoteSource: {
    fontFamily: Fonts.serif.regular,
    fontSize: 11,
    color: "#CBBE9A",
    letterSpacing: 1.5,
  },
  heroContent: {
    alignItems: "center",
    marginBottom: 20,
  },
  heroTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    lineHeight: 28,
    color: "#F5EBD7",
    textAlign: "center",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    marginBottom: 15,
  },
  heroSubtitle: {
    fontFamily: Fonts.serif.regular,
    fontSize: 14,
    color: "#D1C69A",
    textAlign: "center",
    opacity: 0.9,
  },
  heroSubtitleSpan: {
    fontFamily: Fonts.serif.bold,
    color: "#F7F0DD",
  },
  ctaGroup: {
    alignItems: "center",
    width: "100%",
    paddingBottom: 30,
    gap: 16,
  },
  ctaButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#A67C00",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 50,
    gap: 12,
    borderWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.3)",
    shadowColor: "#A67C00",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  ctaButtonText: {
    fontFamily: Fonts.sans.bold,
    fontSize: 15,
    color: "#FFFFFF",
  },
  btnIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  closingNote: {
    alignItems: "center",
  },
  noteText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: "white",
    textAlign: "center",
    opacity: 0.9,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  italic: {
    fontStyle: "italic",
  },
  bottomSection: {
    backgroundColor: "transparent",
    paddingTop: 30,
    alignItems: "center",
  },
  bottomTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#5A4633",
    marginBottom: 25,
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },
  featureCard: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 5,
  },
  featureIcon: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  featureTitle: {
    fontFamily: Fonts.sans.bold,
    fontSize: 15,
    color: "#4A3B2A",
    marginBottom: 2,
  },
  featureSubtitle: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 10,
    color: "#6B5A45",
    textAlign: "center",
  },
  verticalDivider: {
    width: 1,
    height: "80%",
    backgroundColor: "#D4AF37",
    opacity: 0.4,
  },
});
