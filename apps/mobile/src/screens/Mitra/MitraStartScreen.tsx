import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useSelector } from "react-redux";
import {
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useScreenStore } from "../../engine/useScreenBridge";
import type { RootState } from "../../store";
import { Fonts } from "../../theme/fonts";
import { platformShadow } from "../../theme/shadows";

const INTRO_LINES = [
  "Hi. I am Mitra.",
  "I am here to help you feel more calm, steady, and clear — on hard days and good days.",
  "I notice small things, like your mood and the shape of your day.",
];
const START_BACKGROUND = require("../../../assets/new_home.webp");

export default function MitraStartScreen() {
  const navigation = useNavigation<any>();
  const user = useSelector(
    (state: RootState) => state.login?.user || state.socialLoginReducer?.user,
  );
  const isLoggedIn = !!user;

  const updateBackground = useScreenStore((state) => state.updateBackground);
  const updateHeaderHidden = useScreenStore(
    (state) => state.updateHeaderHidden,
  );
  useFocusEffect(
    React.useCallback(() => {
      updateBackground(START_BACKGROUND);
      updateHeaderHidden(true);

      return () => {
        updateBackground(null);
        updateHeaderHidden(false);
      };
    }, [updateBackground, updateHeaderHidden]),
  );
  function handleBegin() {
    navigation.navigate("MitraIntention");
  }

  return (
    <ImageBackground source={START_BACKGROUND} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={require("../../../assets/KalpXlogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <View style={styles.card}>
            <Text style={styles.title}>I'm Mitra.{"\n"}I'm here with you.</Text>

            <View style={styles.divider}>
              <View style={styles.line} />
              <View style={styles.diamond} />
              <View style={styles.line} />
            </View>

            <View style={styles.lines}>
              {INTRO_LINES.map((line, i) => (
                <View key={i} style={styles.lineRow}>
                  <Text style={styles.bullet}>✦</Text>
                  <Text style={styles.lineText}>{line}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <Image
              source={require("../../../assets/new_home_lotus.webp")}
              style={styles.lotus}
              resizeMode="contain"
            />

            <TouchableOpacity
              onPress={handleBegin}
              activeOpacity={0.85}
              style={styles.beginButton}
            >
              <LinearGradient
                colors={["#C89416", "#D9AE3A"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
              >
                <Text style={styles.beginText}>Yes, let's begin →</Text>
              </LinearGradient>
            </TouchableOpacity>

            {!isLoggedIn ? (
              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                activeOpacity={0.8}
                style={styles.returningButton}
              >
                <Text style={styles.returningText}>I'm returning</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  safe: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 104,
    justifyContent: "space-between",
  },
  logo: {
    width: 118,
    height: 48,
    marginLeft: 6,
    marginBottom: 24,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 26,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(217, 190, 137, 0.65)",
    ...platformShadow("#432104", 10, 0.1, 20, 5),
  },
  title: {
    fontFamily: Fonts.serif.bold,
    fontSize: 28,
    color: "#432104",
    textAlign: "center",
    lineHeight: 36,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    gap: 12,
  },
  line: {
    width: 60,
    height: 1,
    backgroundColor: "rgba(201, 168, 76, 0.35)",
  },
  diamond: {
    width: 10,
    height: 10,
    backgroundColor: "#D5AD4B",
    transform: [{ rotate: "45deg" }],
  },
  lines: {
    gap: 20,
  },
  lineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  bullet: {
    color: "#C9A84C",
    fontSize: 16,
    marginTop: 2,
  },
  lineText: {
    flex: 1,
    fontFamily: Fonts.serif.regular,
    fontSize: 15,
    color: "#5C3B1A",
    lineHeight: 22,
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
  },
  lotus: {
    width: 180,
    height: 120,
    marginBottom: 20,
  },
  beginButton: {
    width: "100%",
    borderRadius: 30,
    overflow: "hidden",
    marginBottom: 12,
    ...platformShadow("#845B0A", 12, 0.22, 24, 8),
  },
  gradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  beginText: {
    color: "#FFF8EF",
    fontSize: 16,
    fontWeight: "700",
  },
  returningButton: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 30,
    backgroundColor: "rgba(255, 251, 244, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.55)",
    ...platformShadow("#432104", 10, 0.08, 24, 4),
  },
  returningText: {
    color: "#432104",
    fontSize: 16,
    fontWeight: "700",
  },
});
