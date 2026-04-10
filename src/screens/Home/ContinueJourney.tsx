import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
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
              Your journey into Sanatan wisdom continues. Small steps every day
              lead to profound inner change.
            </Text>
          </View>

          <View style={styles.ctaGroup}>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={onResume}
              activeOpacity={0.8}
            >
              <View style={styles.ctaButtonInner}>
                <View>
                  <Text style={styles.ctaButtonText}>Return to Your Practice</Text>
                  <Text style={styles.ctaButtonStatus}>Day {dayNumber} is waiting</Text>
                </View>
                <View style={styles.btnIconCircle}>
                  <Ionicons name="arrow-forward" size={24} color="white" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* --- Bottom Feature Grid --- */}
        <View style={styles.bottomSection}>
          <View style={styles.gridCard}>
            <View style={styles.gridItem}>
              <MaterialCommunityIcons name="comment-account-outline" size={26} color="#D4A017" />
              <Text style={styles.gridLabel}>Mitra</Text>
            </View>
            
            <View style={styles.verticalDivider} />

            <View style={styles.gridItem}>
              <MaterialCommunityIcons name="account-group-outline" size={26} color="#D4A017" />
              <Text style={styles.gridLabel}>Communities</Text>
            </View>

            <View style={styles.verticalDivider} />

            <View style={styles.gridItem}>
              <MaterialCommunityIcons name="book-open-variant" size={26} color="#D4A017" />
              <Text style={styles.gridLabel}>Classes</Text>
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
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 80,
    paddingBottom: 40,
  },
  topSection: {
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 40,
  },
  quoteWrapper: {
    alignItems: "center",
    marginBottom: 60,
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
    opacity: 0.4,
  },
  quoteSource: {
    fontFamily: Fonts.serif.regular,
    fontSize: 11,
    color: "#CBBE9A",
    letterSpacing: 1.5,
  },
  heroContent: {
    alignItems: "center",
    marginBottom: 50,
  },
  heroTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 34,
    lineHeight: 44,
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  heroSubtitle: {
    fontFamily: Fonts.sans.regular,
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 320,
  },
  ctaGroup: {
    width: "100%",
  },
  ctaButton: {
    backgroundColor: "#C9A84C",
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ctaButtonText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#FFFFFF",
  },
  ctaButtonStatus: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  btnIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  bottomSection: {
    paddingHorizontal: 24,
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
    fontFamily: Fonts.serif.regular,
    fontSize: 12,
    color: "#CBBE9A",
    letterSpacing: 0.5,
  },
  verticalDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
});
