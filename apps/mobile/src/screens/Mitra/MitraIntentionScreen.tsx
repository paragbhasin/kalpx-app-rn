import {
  ENTRY_INTENTION_HEADING,
  ENTRY_INTENTION_OPTIONS,
  ENTRY_INTENTION_SUBTEXT,
} from "@kalpx/contracts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
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
import M3Icon from "../../../../web/public/m3.svg";
import Mp2Icon from "../../../../web/public/mp2.svg";
import Mp3Icon from "../../../../web/public/mp3.svg";
import Mp4Icon from "../../../../web/public/mp4.svg";
import FontSize from "../../components/FontSize";
import { useScrollContext } from "../../context/ScrollContext";
import store from "../../store";
import { loadScreenWithData, screenActions } from "../../store/screenSlice";
import { Fonts } from "../../theme/fonts";

const PENDING_KEY = "mitra_intention_pending";

const OPTION_ACCENTS = {
  daily_rhythm: {
    icon: M3Icon,
    iconBg: "rgba(248, 238, 209, 0.72)",
    chipBg: "rgba(245, 222, 166, 0.34)",
    chipColor: "#C18B12",
  },
  inner_path: {
    icon: Mp3Icon,
    iconBg: "rgba(248, 238, 209, 0.72)",
    chipBg: "rgba(222, 200, 232, 0.48)",
    chipColor: "#8E5D99",
  },
  quick_chant: {
    icon: Mp2Icon,
    iconBg: "rgba(248, 238, 209, 0.72)",
    chipBg: "rgba(225, 228, 190, 0.5)",
    chipColor: "#8E9440",
  },
  tell_mitra: {
    icon: Mp4Icon,
    iconBg: "rgba(248, 238, 209, 0.72)",
    chipBg: "rgba(247, 213, 179, 0.48)",
    chipColor: "#D27A27",
  },
} as const;

export default function MitraIntentionScreen() {
  const navigation = useNavigation<any>();
  const { handleScroll } = useScrollContext();
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
      <Image
        source={require("../../../../web/public/leaves-bird.png")}
        style={styles.topRightLeaves}
      />
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.heading}>{ENTRY_INTENTION_HEADING}</Text>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Image
                source={require("../../../assets/lotus_icon.png")}
                style={styles.lotusIcon}
                resizeMode="contain"
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
              const accent =
                (OPTION_ACCENTS as any)[opt.id] || OPTION_ACCENTS.daily_rhythm;
              const IconComponent = accent.icon;
              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.85}
                  onPress={() => void handleSelect(opt.id)}
                  style={styles.card}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: "#FCF8EC" },
                    ]}
                  >
                    <IconComponent width={45} height={45} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{opt.title}</Text>
                    <Text style={styles.cardBody}>{opt.body}</Text>
                    <View
                      style={[styles.chip, { backgroundColor: accent.chipBg }]}
                    >
                      <Text
                        style={[styles.chipText, { color: accent.chipColor }]}
                      >
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

const TAB_BAR_HEIGHT = FontSize.CONSTS.DEVICE_HEIGHT * 0.07;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  topRightLeaves: {
    position: "absolute",
    top: -110,
    right: 0,
    width: 200,
    height: 300,
    resizeMode: "contain",
    opacity: 0.75,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: TAB_BAR_HEIGHT + 96,
  },
  header: {
    alignItems: "center",
    marginBottom: 18,
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
    width: 28,
    height: 28,
    tintColor: "#D6A63A",
  },
  subtext: {
    fontFamily: Fonts.serif.regular,
    fontSize: 16,
    color: "rgba(67, 33, 4, 0.78)",
    lineHeight: 24,
    textAlign: "center",
  },
  options: {
    gap: 18,
  },
  card: {
    backgroundColor: "rgba(255, 252, 247, 0.92)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(226, 199, 144, 0.48)",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: "#C9A84C",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 40,
    elevation: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    alignSelf: "center",
  },
  optionIcon: {
    width: 40,
    height: 40,
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
    fontSize: 13,
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
