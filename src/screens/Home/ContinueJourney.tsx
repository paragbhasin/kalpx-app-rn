import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Mitra1 from "../../../assets/mitra_1.svg";
import Mitra2 from "../../../assets/mitra_2.svg";
import Mitra3 from "../../../assets/mitra_3.svg";
import { Fonts } from "../../theme/fonts";

interface ContinueJourneyProps {
  dayNumber: number;
  onResume: () => void;
}

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
        <ImageBackground
          source={require("../../../assets/continue_journey_bg.jpeg")}
          style={styles.absoluteBg}
          resizeMode="cover"
        />
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
              Every day you return, something within you
            </Text>
            <Text style={styles.heroSubtitle}>strengthens.</Text>
          </View>

          <View style={styles.ctaGroup}>
            <TouchableOpacity onPress={onResume} activeOpacity={0.85}>
              <LinearGradient
                colors={["#E7C355", "#A67C00"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.ctaButton}
              >
                <View style={styles.ctaButtonInner}>
                  <Text style={styles.ctaButtonText}>
                    Return to Your Practice
                  </Text>

                  <View style={styles.btnIconCircle}>
                    <Ionicons name="arrow-forward" size={15} color="white" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <View style={styles.textCenter}>
            <Text style={styles.normalText}>
              Transformation does not come in one moment.
            </Text>
            <Text style={styles.italicText}>It comes by returning.</Text>
          </View>
        </View>

        <View style={styles.bottomSection}>
          <View style={styles.content}>
            <Text style={styles.heading}>
              Begin with Mitra. Grow with KalpX.
            </Text>

            <View style={styles.featuresRow}>
              {/* Mitra */}
              <TouchableOpacity style={styles.featureCard} activeOpacity={0.8}>
                <Mitra3 width={50} height={50} />
                <Text style={styles.title}>Mitra</Text>
                <Text style={styles.subtitle}>Your daily companion</Text>
              </TouchableOpacity>

              {/* Communities */}
              <TouchableOpacity style={styles.featureCard} activeOpacity={0.8}>
                <Mitra2 width={50} height={50} />
                <Text style={styles.title}>Communities</Text>
                <Text style={styles.subtitle}>Grow with others</Text>
              </TouchableOpacity>

              {/* Classes */}
              <TouchableOpacity style={styles.featureCard} activeOpacity={0.8}>
                <Mitra1 width={50} height={50} />
                <Text style={styles.title}>Classes</Text>
                <Text style={styles.subtitle}>Learn with depth</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  absoluteBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 15,
    paddingBottom: 30,
  },
  topSection: {
    paddingHorizontal: 5,
    alignItems: "center",
    marginBottom: 40,
  },
  quoteWrapper: {
    alignItems: "center",
    // marginBottom: 60,
  },
  quoteText: {
    fontFamily: Fonts.cinzel.bold,
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
    // marginTop: 12,
    gap: 12,
  },
  line: {
    height: 1,
    width: 30,
    backgroundColor: "#CBBE9A",
    opacity: 0.4,
  },
  quoteSource: {
    fontFamily: Fonts.cinzel.bold,
    fontSize: 11,
    color: "#CBBE9A",
    letterSpacing: 1.5,
  },
  heroContent: {
    alignItems: "center",
    marginBottom: 50,
  },
  heroTitle: {
    fontFamily: Fonts.cinzel.bold,
    fontSize: 20,
    // lineHeight: 44,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  heroSubtitle: {
    fontFamily: Fonts.cinzel.bold,
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 24,
    // maxWidth: 320,
  },
  ctaGroup: {
    alignItems: "center",
    marginTop: "auto",
    paddingBottom: 10,
    paddingTop: 120,
  },

  ctaButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",

    shadowColor: "#A67C00",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,

    minWidth: 250,
  },

  ctaButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: Fonts.sans.bold,
  },

  btnIconCircle: {
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 16,
  },

  textCenter: {
    alignItems: "center",
  },

  normalText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",

    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  italicText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
    color: "#FFFFFF",
    opacity: 0.9,
    textAlign: "center",

    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  gridCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  gridItem: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  gridLabel: {
    fontFamily: Fonts.cinzel.bold,
    fontSize: 12,
    color: "#CBBE9A",
    letterSpacing: 0.5,
  },
  verticalDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  bottomSection: {
    marginTop: 10,
  },

  content: {
    alignItems: "center",
  },

  heading: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#432104",
    textAlign: "center",
    marginBottom: 10,
  },

  featuresRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  featureCard: {
    flex: 1,
    alignItems: "center",
    // paddingVertical: 20,
    marginHorizontal: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  featureIcon: {
    width: 48,
    height: 48,
    marginBottom: 12,
  },

  title: {
    fontFamily: Fonts.serif.bold,
    fontSize: 16,
    color: "#432104",
    marginTop: -6,
  },

  subtitle: {
    fontFamily: Fonts.sans.bold,
    fontSize: 13,
    color: "#432104",
    textAlign: "center",
    marginTop: 4,
  },
});
