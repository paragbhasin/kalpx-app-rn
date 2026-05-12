import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  ENTRY_INTENTION_HEADING,
  ENTRY_INTENTION_OPTIONS,
  ENTRY_INTENTION_SUBTEXT,
} from "@kalpx/contracts";
import React, { useCallback } from "react";
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
import { useSelector } from "react-redux";
import store from "../../store";
import { loadScreenWithData, screenActions } from "../../store/screenSlice";
import { Fonts } from "../../theme/fonts";

const PENDING_KEY = "mitra_intention_pending";

const OPTION_ACCENTS = {
  daily_rhythm: {
    icon: require("../../../assets/mitra3.png"),
    iconBg: "rgba(248, 238, 209, 0.72)",
    chipBg: "rgba(245, 222, 166, 0.34)",
    chipColor: "#C18B12",
  },
  inner_path: {
    icon: require("../../../assets/mitra1.png"), // Using best available
    iconBg: "rgba(248, 238, 209, 0.72)",
    chipBg: "rgba(222, 200, 232, 0.48)",
    chipColor: "#8E5D99",
  },
  quick_chant: {
    icon: require("../../../assets/mitra2.png"),
    iconBg: "rgba(248, 238, 209, 0.72)",
    chipBg: "rgba(225, 228, 190, 0.5)",
    chipColor: "#8E9440",
  },
  tell_mitra: {
    icon: require("../../../assets/mitra4.png"),
    iconBg: "rgba(248, 238, 209, 0.72)",
    chipBg: "rgba(247, 213, 179, 0.48)",
    chipColor: "#D27A27",
  },
} as const;

export default function MitraIntentionScreen() {
  const navigation = useNavigation<any>();
  const isLoggedIn = useSelector(
    (state: any) => !!(state.login?.user || state.socialLoginReducer?.user),
  );

  useFocusEffect(
    useCallback(() => {
      if (!isLoggedIn) return;
      (async () => {
        const pending = await AsyncStorage.getItem(PENDING_KEY);
        if (!pending) return;
        await AsyncStorage.removeItem(PENDING_KEY);
        await executeDoor(pending);
      })();
    }, [isLoggedIn]),
  );

  async function executeDoor(optionId: string) {
    switch (optionId) {
      case "daily_rhythm":
        navigation.navigate("RhythmSetup");
        break;
      case "inner_path":
        await AsyncStorage.setItem("mitra_entry_intention", "inner_path");
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
        navigation.navigate("DynamicEngine");
        break;
      case "quick_chant":
        navigation.navigate("QuickReset");
        break;
      case "tell_mitra":
        navigation.navigate("TellMitra");
        break;
    }
  }

  async function handleSelect(optionId: string) {
    if (!isLoggedIn) {
      await AsyncStorage.setItem(PENDING_KEY, optionId);
      navigation.navigate("Login" as any);
      return;
    }
    await executeDoor(optionId);
  }

  return (
    <ImageBackground
      source={require("../../../assets/beige_bg.png")}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.heading}>{ENTRY_INTENTION_HEADING}</Text>
            
            <View style={styles.divider}>
              <View style={styles.line} />
              <Image 
                source={require("../../../assets/lotus_icon.png")} 
                style={styles.lotusIcon}
              />
              <View style={styles.line} />
            </View>

            {ENTRY_INTENTION_SUBTEXT.split("\n\n").map((para, i) => (
              <Text key={i} style={styles.subtext}>
                {para}
              </Text>
            ))}
          </View>

          <View style={styles.options}>
            {ENTRY_INTENTION_OPTIONS.map((opt) => {
              const accent = (OPTION_ACCENTS as any)[opt.id] || OPTION_ACCENTS.daily_rhythm;
              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.85}
                  onPress={() => void handleSelect(opt.id)}
                  style={styles.card}
                >
                  <View style={[styles.iconContainer, { backgroundColor: accent.iconBg }]}>
                    <Image source={accent.icon} style={styles.optionIcon} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{opt.title}</Text>
                    <Text style={styles.cardBody}>{opt.body}</Text>
                    <View style={[styles.chip, { backgroundColor: accent.chipBg }]}>
                      <Text style={[styles.chipText, { color: accent.chipColor }]}>
                        {opt.cta} →
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 48,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  heading: {
    fontFamily: Fonts.serif.bold,
    fontSize: 32,
    color: "#432104",
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 16,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginBottom: 20,
  },
  line: {
    width: 100,
    height: 1,
    backgroundColor: "rgba(214, 166, 58, 0.42)",
  },
  lotusIcon: {
    width: 22,
    height: 22,
    tintColor: "#D6A63A",
  },
  subtext: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "rgba(67, 33, 4, 0.78)",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 12,
  },
  options: {
    gap: 20,
  },
  card: {
    backgroundColor: "rgba(255, 252, 247, 0.92)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 199, 144, 0.48)",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    shadowColor: "#C9A84C",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 4,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  optionIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#432104",
    lineHeight: 24,
    marginBottom: 6,
  },
  cardBody: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "rgba(67, 33, 4, 0.76)",
    lineHeight: 20,
    marginBottom: 12,
  },
  chip: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
