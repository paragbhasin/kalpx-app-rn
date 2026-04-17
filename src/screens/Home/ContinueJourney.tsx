import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Fonts } from "../../theme/fonts";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ContinueJourneyProps {
  userName?: string;
  dayNumber: number;
  onResume: () => void;
  onCheckIn?: () => void;
  onSupport?: () => void;
  onTalk?: () => void;
}

export default function ContinueJourney({
  userName = "User",
  dayNumber,
  onResume,
  onCheckIn,
  onSupport,
  onTalk,
}: ContinueJourneyProps) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Header Section --- */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome back, {userName}.</Text>
          <Text style={styles.subtext}>
            Last time felt a little heavier, and you came in for support.
            {"\n"}
            {"\n"}
            We can begin there again, or take today one gentle step at a time.
          </Text>
        </View>

        {/* --- Divider --- */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Ionicons name="diamond-outline" size={10} color="#DAC28E" />
          <View style={styles.dividerLine} />
        </View>

        {/* --- Prompt --- */}
        <Text style={styles.promptText}>What feels right for you today?</Text>

        {/* --- Actions --- */}
        <View style={styles.actionGroup}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onSupport}
            activeOpacity={0.7}
          >
            <View style={styles.btnContent}>
              <Ionicons
                name="heart-outline"
                size={24}
                color="#432104"
                style={styles.btnIcon}
              />
              <Text style={styles.btnText}>I need some support today</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onCheckIn}
            activeOpacity={0.7}
          >
            <View style={styles.btnContent}>
              <Ionicons
                name="chatbubble-outline"
                size={24}
                color="#432104"
                style={styles.btnIcon}
              />
              <Text style={styles.btnText}>Let me start with a check-in</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onTalk}
            activeOpacity={0.7}
          >
            <View style={styles.btnContent}>
              <Ionicons
                name="heart-outline"
                size={24}
                color="#432104"
                style={styles.btnIcon}
              />
              <Text style={styles.btnText}>I'd like to talk with Mitra</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={onResume}
            activeOpacity={0.7}
          >
            <View
              style={[styles.btnContent, { justifyContent: "space-between" }]}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={styles.iconPlaceholder} />
                <Text style={styles.btnText}>
                  I'm ready for today's practice
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={24} color="#432104" />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- Lotus Illustration --- */}
      <View style={styles.lotusContainer} pointerEvents="none">
        <Image
          source={require("../../../assets/new_home_lotus.png")}
          style={styles.lotusImage}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 220, // Space for lotus
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  welcomeText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 28,
    color: "#432104",
    textAlign: "center",
    marginBottom: 16,
  },
  subtext: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#6b5a45",
    textAlign: "center",
    lineHeight: 28,
    maxWidth: 320,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    width: "60%",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DAC28E",
    marginHorizontal: 10,
    opacity: 0.5,
  },
  promptText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 22,
    color: "#432104",
    textAlign: "center",
    marginBottom: 15,
  },
  actionGroup: {
    width: "100%",
    gap: 12,
  },
  actionButton: {
    width: "100%",
    // height: 60,
    padding: 10,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(107, 77, 40, 0.15)",
    backgroundColor: "rgba(255, 252, 246, 0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  btnIcon: {
    marginRight: 12,
  },
  btnText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#432104",
  },
  iconPlaceholder: {
    width: 24,
    marginRight: 12,
  },
  lotusContainer: {
    position: "absolute",
    bottom: -60,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  lotusImage: {
    width: SCREEN_HEIGHT * 0.25,
    height: SCREEN_HEIGHT * 0.3,
  },
});
