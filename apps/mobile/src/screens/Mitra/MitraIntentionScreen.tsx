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
const M3Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/m3.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const Mp2Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/mp2.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const Mp3Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/mp3.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const Mp4Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/mp4.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
import FontSize from "../../components/FontSize";
import { useScrollContext } from "../../context/ScrollContext";
import { useScreenStore } from "../../engine/useScreenBridge";
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
    chipColor: "#C18B12",
  },
  quick_chant: {
    icon: Mp2Icon,
    iconBg: "rgba(248, 238, 209, 0.72)",
    chipColor: "#C18B12",
  },
  tell_mitra: {
    icon: Mp4Icon,
    iconBg: "rgba(248, 238, 209, 0.72)",
    chipBg: "rgba(247, 213, 179, 0.48)",
    chipColor: "#C18B12",
  },
} as const;

export default function MitraIntentionScreen() {
  const navigation = useNavigation<any>();
  const { handleScroll } = useScrollContext();
  const isLoggedIn = useSelector(
    (state: any) => !!(state.login?.user || state.socialLoginReducer?.user),
  );
  const updateBackground = useScreenStore((state) => state.updateBackground);

  useFocusEffect(
    useCallback(() => {
      updateBackground(require("../../../assets/beige_bg.webp"));
      return () => updateBackground(null);
    }, [updateBackground]),
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
        if (process.env.EXPO_PUBLIC_MITRA_NEW_SHELL === "1") {
          store.dispatch(screenActions.setBackground(require("../../../assets/beige_bg.webp")));
          navigation.navigate("NewMitraHome");
          break;
        }
        await AsyncStorage.setItem("mitra_entry_intention", "inner_path");
        store.dispatch(
          screenActions.setScreenValue({
            key: "onboarding_turn",
            value: "turn_2",
          }),
        );
        store.dispatch(
          screenActions.setScreenValue({
            key: "onboarding_draft_state",
            value: { started_at: Date.now(), entry_intention: "inner_path" },
          }),
        );
        store.dispatch(
          loadScreenWithData({
            containerId: "welcome_onboarding",
            stateId: "turn_2",
            replace: true,
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
      source={require("../../../assets/beige_bg.webp")}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.heading}>{ENTRY_INTENTION_HEADING}</Text>
            <Text style={styles.subtext}>{ENTRY_INTENTION_SUBTEXT}</Text>

            <View style={styles.divider}>
              <View style={styles.line} />
              <Image
                source={require("../../../assets/lotus_icon.png")}
                style={styles.lotusIcon}
                resizeMode="contain"
              />
              <View style={styles.line} />
            </View>
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
                      { backgroundColor: accent.iconBg },
                    ]}
                  >
                    <IconComponent width={45} height={45} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{opt.title}</Text>
                    <Text style={styles.cardBody}>{opt.body}</Text>
                    <View style={styles.ctaRow}>
                      <Text
                        style={[
                          styles.chipText,
                          styles.ctaText,
                          {
                            color: accent.chipColor,
                            borderBottomColor: accent.chipColor,
                          },
                        ]}
                      >
                        {opt.cta}
                      </Text>
                      <Text style={[styles.arrow, { color: accent.chipColor }]}>
                        →
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
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: TAB_BAR_HEIGHT + 96,
  },
  header: {
    alignItems: "stretch",
    marginBottom: 22,
  },
  heading: {
    fontFamily: Fonts.serif.bold,
    fontSize: 32,
    color: "#432104",
    textAlign: "center",
    lineHeight: 40,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  line: {
    width: 120,
    height: 1,
    backgroundColor: "rgba(214, 166, 58, 0.28)",
  },
  lotusIcon: {
    width: 24,
    height: 24,
    tintColor: "#D6A63A",
  },
  subtext: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: "rgba(67, 33, 4, 0.72)",
    lineHeight: 26,
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
    flexDirection: "column",
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
  ctaRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  ctaText: {
    borderBottomWidth: 1,
    paddingBottom: 2,
  },
  arrow: {
    fontSize: 22,
    lineHeight: 22,
    fontWeight: "500",
  },
});
