import React, { useEffect, useRef } from "react";
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import { useTranslation } from "react-i18next";
import { executeAction } from "../engine/actionExecutor";
import { useScreenStore } from "../engine/useScreenBridge";
import { interpolate } from "../engine/utils/interpolation";
import { Fonts } from "../theme/fonts";
import {
  TABLET_MAX_CARD_WIDTH,
  rfs,
  rs,
  useTablet,
} from "../utils/responsive";

interface Props {
  block: {
    id?: string;
    headline?: string;
    subtext?: string;
    reply_chips?: {
      id: string;
      label: string;
      style?: "primary" | "secondary";
    }[];
    image?: {
      url: string;
      alt?: string;
    };
    on_response?: any;
  };
}

const OnboardingIntroHero: React.FC<Props> = ({ block }) => {
  const { width } = useWindowDimensions();
  const isTablet = useTablet();
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === "hi";
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const replyAnim = useRef(new Animated.Value(0)).current;
  const updateBackground = useScreenStore(
    (state: any) => state.updateBackground,
  );
  const updateHeaderHidden = useScreenStore(
    (state: any) => state.updateHeaderHidden,
  );

  useEffect(() => {
    const updatedBackground = require("../../assets/new_home.webp");

    updateBackground(updatedBackground);
    updateHeaderHidden(false);
    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden]);
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(replyAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, replyAnim]);

  const fire = async (payload: Record<string, any>) => {
    if (!block.on_response) return;
    const base = interpolate(block.on_response, screenData);
    try {
      await executeAction(
        {
          ...base,
          payload: { ...(base.payload || {}), ...payload },
          currentScreen,
        },
        {
          loadScreen,
          goBack,
          setScreenValue: (value: any, key: string) => {
            const { screenActions } = require("../store/screenSlice");
            const { store } = require("../store");
            store.dispatch(screenActions.setScreenValue({ key, value }));
          },
          screenState: { ...screenData },
        },
      );
    } catch (err) {
      console.error("[OnboardingIntroHero] action failed", err);
    }
  };

  const headline = t("mitraPathSelect.headline", { defaultValue: block.headline || "" });
  const subtext = t("mitraPathSelect.subtext", { defaultValue: block.subtext || "" });
  const chipLabel = (chip: { id: string; label: string }) => {
    if (chip.id === "support") return t("mitraPathSelect.chipSupport", { defaultValue: chip.label });
    if (chip.id === "growth") return t("mitraPathSelect.chipGrowth", { defaultValue: chip.label });
    return chip.label;
  };
  const headlineLines = headline.split("\n").filter(Boolean);
  // `screenData.onboarding_turn` is a state-id string (e.g. "turn_2",
  // "turn_3_support") after the first turn response; extract digits.
  const rawTurn = screenData.onboarding_turn;
  const turn =
    typeof rawTurn === "number"
      ? rawTurn
      : typeof rawTurn === "string"
        ? Number((rawTurn.match(/\d+/) || ["2"])[0])
        : 2;
  const rootTestID = `onboarding_turn_${turn}_root`;

  return (
    <View
      style={[styles.container, isTablet && styles.containerTablet]}
      testID={rootTestID}
      accessibilityLabel={rootTestID}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <Text
          style={[
            styles.headline,
            {
              fontSize: rfs(28, width),
              lineHeight: rs(38, 46, width),
              paddingHorizontal: rs(20, 60, width),
            },
            isHindi && { letterSpacing: 0 },
          ]}
        >
          {headlineLines.join("\n")}
        </Text>

        {block.subtext && (
          <Text
            style={[
              styles.subtext,
              {
                fontSize: rfs(18, width),
                paddingHorizontal: rs(30, 80, width),
                marginBottom: rs(40, 48, width),
              },
              isHindi && { letterSpacing: 0 },
            ]}
          >
            {interpolate(subtext, screenData)}
          </Text>
        )}

        <Animated.View
          style={[
            styles.responseWrap,
            { opacity: replyAnim },
            isTablet && {
              maxWidth: TABLET_MAX_CARD_WIDTH,
              alignSelf: "center",
              width: "100%",
              paddingHorizontal: Math.max(
                20,
                (width - TABLET_MAX_CARD_WIDTH) / 2,
              ),
            },
          ]}
        >
          {(block.reply_chips || []).map((chip) => {
            const isReturning = chip.label.toLowerCase().includes("returning");
            if (isReturning) return null;

            const chipTestID = `onboarding_turn_${turn}_chip_${chip.id}`;
            return (
              <TouchableOpacity
                key={chip.id}
                activeOpacity={0.85}
                onPress={() =>
                  fire({ chip_id: chip.id, response_type: "chip" })
                }
                style={styles.chipButton}
                testID={chipTestID}
                accessibilityLabel={chipTestID}
              >
                <View
                  style={[
                    styles.premiumChip,
                    { paddingVertical: rs(15, 18, width) },
                  ]}
                >
                  <Text
                    style={[
                      styles.premiumChipLabel,
                      { fontSize: rfs(16, width) },
                      isHindi && { letterSpacing: 0 },
                    ]}
                  >
                    {chipLabel(chip)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {(() => {
            const returningChip = (block.reply_chips || []).find((c) =>
              c.label.toLowerCase().includes("returning"),
            );
            if (!returningChip) return null;

            return (
              <TouchableOpacity
                key={returningChip.id}
                activeOpacity={0.85}
                onPress={() =>
                  fire({ chip_id: returningChip.id, response_type: "chip" })
                }
                style={styles.returningButton}
                testID="onboarding_im_returning"
                accessibilityLabel="onboarding_im_returning"
              >
                <Text
                  style={[styles.linkText, { fontSize: rfs(18, width) }]}
                >
                  {returningChip.label}
                </Text>
              </TouchableOpacity>
            );
          })()}
        </Animated.View>
      </Animated.View>

      {/* Lotus image at the bottom — purely decorative, must not intercept chip taps */}
      <View
        style={[styles.lotusWrap, isTablet && { marginTop: 0, marginBottom: 0 }]}
        pointerEvents="none"
      >
        <Image
          source={require("../../assets/new_home_lotus.webp")}
          style={[
            styles.lotus,
            {
              width: rs(340, 420, width),
              height: rs(340, 420, width),
            },
          ]}
          resizeMode="contain"
        />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 500,
    justifyContent: "space-between",
    // paddingTop: 40,
  },
  // Tablet: center content+lotus as a group within the flex:1 container.
  // flexGrow:1 on the ScrollView contentContainerStyle makes this container
  // fill the viewport; justifyContent:center distributes the two children
  // (content block + lotusWrap) around the vertical midpoint.
  containerTablet: {
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  headline: {
    fontFamily: Fonts.serif.bold,
    fontSize: 28,
    color: "#3f2810",
    textAlign: "center",
    lineHeight: 38,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  subtext: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: "#432104",
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 30,
    opacity: 0.9,
  },
  responseWrap: {
    width: "100%",
    paddingHorizontal: 20,
    gap: 16,
  },
  chipButton: {
    width: "100%",
  },
  premiumChip: {
    backgroundColor: "#FBF5F5",
    borderColor: "#9f9f9f",
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderRadius: 24,
    borderWidth: 0.3,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: "100%",
  },
  premiumChipLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 16,
    color: "#432104",
    textAlign: "center",
  },
  returningButton: {
    marginTop: 20,
    alignSelf: "center",
  },
  linkText: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: "#432104",
    textDecorationLine: "underline",
  },
  lotusWrap: {
    alignItems: "center",
    marginTop: -30,
    marginBottom: -40,
  },
  lotus: {
    width: 340,
    height: 340,
  },
});

export default OnboardingIntroHero;
