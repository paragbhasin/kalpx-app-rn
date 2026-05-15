import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useScreenStore } from "../../engine/useScreenBridge";
import { Fonts } from "../../theme/fonts";

export default function NewHome() {
  const updateBackground = useScreenStore((state) => state.updateBackground);
  const updateHeaderHidden = useScreenStore(
    (state) => state.updateHeaderHidden,
  );

  useFocusEffect(
    React.useCallback(() => {
      updateBackground(require("../../../assets/new_home.png"));
      updateHeaderHidden(false);

      return () => {
        updateBackground(null);
        updateHeaderHidden(false);
      };
    }, [updateBackground, updateHeaderHidden]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <Text style={styles.heroQuote}>
            "In this path, no effort is ever lost."
          </Text>
          <Text style={styles.heroSource}>— Bhagavad Gita 2.40</Text>
          <View style={styles.turnOneHeadlineDivider}>
            <View style={styles.turnOneDividerLine} />
            <Ionicons name="diamond" size={10} color="#c7a258" />
            <View style={styles.turnOneDividerLine} />
          </View>
          <Text style={styles.heroTitle}>KalpX Mitra</Text>
          <Text style={styles.companionTitle}>
            Your daily companion for life
          </Text>
        </View>

        <View style={styles.companionSection}>
          <Text style={styles.companionDesc}>
            Grounded in timeless Sanatan wisdom.
          </Text>
          <Text style={styles.companionDesc}>
            A calmer, clearer way to navigate life - one day at a time.
          </Text>
        </View>

        <Image
          source={require("../../../assets/new_home_lotus.png")}
          style={styles.lotus}
          resizeMode="contain"
        />

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.ctaTouch}
          testID="new_home_begin_mitra_cta"
        >
          <LinearGradient
            colors={["#E5D4CA", "#F5EDEA"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaText}>Begin with Mitra →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: "center",
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  heroQuote: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    fontStyle: "italic",
    color: "#50453D",
    textAlign: "center",
  },
  heroSource: {
    fontFamily: Fonts.serif.regular,
    fontSize: 14,
    color: "#432104",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  turnOneHeadlineDivider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 12,
    marginBottom: 20,
  },
  turnOneDividerLine: {
    width: 44,
    height: 1,
    backgroundColor: "rgba(199, 162, 88, 0.6)",
  },
  heroTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 28,
    color: "#432104",
    textAlign: "center",
    lineHeight: 36,
  },
  companionTitle: {
    fontFamily: Fonts.sans.medium,
    fontSize: 18,
    color: "#432104",
    marginTop: 5,
    marginBottom: 4,
    textAlign: "center",
  },
  companionSection: {
    alignItems: "center",
    marginBottom: 20,
    marginTop: -15,
  },
  companionDesc: {
    fontFamily: Fonts.sans.regular,
    fontSize: 16,
    color: "#5C5648",
    marginBottom: 16,
    textAlign: "center",
  },
  lotus: {
    width: 360,
    height: 260,
    marginTop: 8,
    marginBottom: 24,
  },
  ctaTouch: {
    width: "60%",
    borderRadius: 28,
    alignSelf: "center",
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
    elevation: 6,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5C4432",
    letterSpacing: 0.5,
  },
});
