import {
  ENTRY_INTENTION_OPTIONS,
} from "@kalpx/contracts";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { rfs, rhPad, sfs, TABLET_MAX_CARD_WIDTH, TABLET_MAX_CONTENT_WIDTH } from "../../utils/responsive";
import { useSelector } from "react-redux";
const M3Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/door_rhythm.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const Mp2Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/door_chant.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const Mp3Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/door_path.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
const Mp4Icon = ({ width, height, style }: { width?: number; height?: number; style?: any }) => <Image source={require("../../../assets/door_mitra.webp")} style={[{ width, height, resizeMode: 'contain' }, style]} />;
import { useScrollContext } from "../../context/ScrollContext";
import { useScreenStore } from "../../engine/useScreenBridge";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import store from "../../store";
import { loadScreenWithData, screenActions } from "../../store/screenSlice";
import { Fonts } from "../../theme/fonts";
import { platformShadow } from "../../theme/shadows";

const PENDING_KEY = "mitra_intention_pending";

const OPTION_ACCENTS = {
  daily_rhythm: {
    icon: M3Icon,
    iconBg: "#FBF3DE",
    chipBg: "rgba(245, 222, 166, 0.34)",
    chipColor: "#C18B12",
  },
  inner_path: {
    icon: Mp3Icon,
    iconBg: "#FBF3DE",
    chipBg: "rgba(222, 200, 232, 0.48)",
    chipColor: "#C18B12",
  },
  quick_chant: {
    icon: Mp2Icon,
    iconBg: "#FBF3DE",
    chipColor: "#C18B12",
  },
  tell_mitra: {
    icon: Mp4Icon,
    iconBg: "#FBF3DE",
    chipBg: "rgba(247, 213, 179, 0.48)",
    chipColor: "#C18B12",
  },
} as const;

export default function MitraIntentionScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { handleScroll } = useScrollContext();
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
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
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 56 },
            isTablet && {
              paddingHorizontal: rhPad(20, width),
              paddingTop: 0,
              paddingBottom: 0,
              flexGrow: 1,
              justifyContent: 'center',
            },
          ]}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.header, isTablet && { maxWidth: TABLET_MAX_CONTENT_WIDTH, alignSelf: 'center', width: '100%', marginBottom: 30 }]}>
            <Text style={[styles.heading, { fontSize: rfs(32, width) }]}>{t("mitraIntention.heading")}</Text>
            <Text style={[styles.subtext, { fontSize: rfs(14, width) }]}>{t("mitraIntention.subtext")}</Text>

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

          <View style={[styles.options, isTablet && { maxWidth: TABLET_MAX_CONTENT_WIDTH, alignSelf: 'center', width: '100%' }]}>
            {ENTRY_INTENTION_OPTIONS.map((opt) => {
              const accent =
                (OPTION_ACCENTS as any)[opt.id] || OPTION_ACCENTS.daily_rhythm;
              const IconComponent = accent.icon;
              return (
                <TouchableOpacity
                  key={opt.id}
                  activeOpacity={0.85}
                  onPress={() => void handleSelect(opt.id)}
                  style={[styles.card, isTablet && { maxWidth: TABLET_MAX_CARD_WIDTH, alignSelf: 'center', width: '100%', padding: 20 }]}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: accent.iconBg },
                      isTablet && { width: 68, height: 68, borderRadius: 34 },
                    ]}
                  >
                    <IconComponent width={isTablet ? 54 : 45} height={isTablet ? 54 : 45} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={[styles.cardTitle, { fontSize: rfs(18, width) }]}>{t(`mitraIntention.options.${opt.id}.title`)}</Text>
                    <Text style={[styles.cardBody, { fontSize: rfs(13, width) }]}>{t(`mitraIntention.options.${opt.id}.body`)}</Text>
                    <View style={styles.ctaRow}>
                      <Text
                        style={[
                          styles.chipText,
                          styles.ctaText,
                          {
                            color: accent.chipColor,
                            borderBottomColor: accent.chipColor,
                            fontSize: rfs(12, width),
                          },
                        ]}
                      >
                        {t(`mitraIntention.options.${opt.id}.cta`)}
                      </Text>
                      <Text style={[styles.arrow, { color: accent.chipColor, fontSize: rfs(22, width) }]}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  safe: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 36,
  },
  header: {
    alignItems: "stretch",
    marginBottom: 22,
  },
  heading: {
    fontFamily: Fonts.serif.bold,
    fontSize: sfs(32),
    color: "#432104",
    textAlign: "center",
    lineHeight: sfs(40),
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  line: {
    flex: 1,
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
    fontSize: sfs(14),
    color: "rgba(67, 33, 4, 0.72)",
    lineHeight: sfs(26),
    textAlign: "center",
  },
  options: {
    gap: 18,
  },
  card: {
    backgroundColor: "#FFFCF7",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(214, 166, 58, 0.24)",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    ...platformShadow("#C9A84C", 8, 0.05, 14, 1),
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    fontSize: sfs(18),
    color: "#432104",
    lineHeight: sfs(24),
    marginBottom: 6,
  },
  cardBody: {
    fontFamily: Fonts.sans.regular,
    fontSize: sfs(13),
    color: "rgba(67, 33, 4, 0.76)",
    lineHeight: sfs(20),
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
    fontSize: sfs(12),
    fontWeight: "700",
  },
  ctaText: {
    borderBottomWidth: 1,
    paddingBottom: 2,
  },
  arrow: {
    fontSize: sfs(22),
    lineHeight: sfs(22),
    fontWeight: "500",
  },
});
