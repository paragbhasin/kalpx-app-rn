import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet, Text } from "react-native";
import Colors from "./Colors";
import FontSize from "./FontSize";
import { InterFonts } from "./InterFonts";

// English
import { useFonts as useInterFonts } from "@expo-google-fonts/inter";

// Hindi & Marathi
import {
  NotoSansDevanagari_400Regular,
  NotoSansDevanagari_500Medium,
  NotoSansDevanagari_700Bold,
  useFonts as useHindiFonts,
} from "@expo-google-fonts/noto-sans-devanagari";

const TextComponent = (props: any) => {
  const [interLoaded] = useInterFonts(InterFonts);
  const [hindiLoaded] = useHindiFonts({
    NotoSansDevanagari_400Regular,
    NotoSansDevanagari_500Medium,
    NotoSansDevanagari_700Bold,
  });

  const { i18n } = useTranslation();
  const userLang = i18n.language.split("-")[0]; // e.g. "hi-IN" → "hi"

  if (!interLoaded || !hindiLoaded) return null;

  const fallbackFont = Platform.select({
    ios: "System",
    android: "sans-serif",
  });

  let textStyle: any;
  switch (props?.type) {
    case "headerText":
      textStyle = styles.headerText;
      break;
    case "subText":
      textStyle = styles.subText;
      break;
    case "mediumText":
      textStyle = styles.mediumText;
      break;
    case "boldText":
      textStyle = styles.boldText;
      break;
    case "semiBoldText":
      textStyle = styles.semiBoldText;
      break;
    case "cardText":
      textStyle = styles.cardText;
      break;
    case "semiBoldBlackText":
      textStyle = styles.semiBoldBlackText;
      break;
    case "streakText":
      textStyle = styles.streakText;
      break;
    case "headerBoldText":
      textStyle = styles.headerBoldText;
      break;
    case "headerBigText":
      textStyle = styles.headerBigText;
      break;
    case "streakSubText":
      textStyle = styles.streakSubText;
      break;
    case "mediumBigText":
      textStyle = styles.mediumBigText;
      break;
    case "loginHeaderText":
      textStyle = styles.loginHeaderText;
      break;
    case "headerIncreaseText":
      textStyle = styles.headerIncreaseText;
      break;
    case "headerSubBoldText":
      textStyle = styles.headerSubBoldText;
      break;
    case "cardSadanaText":
      textStyle = styles.cardSadanaText;
      break;
    case "streakSadanaText":
      textStyle = styles.streakSadanaText;
      break;
    case "cardHeaderText":
      textStyle = styles.cardHeaderText;
      break;
    case "subScrollText":
      textStyle = styles.subScrollText;
      break;
    case "DailyHeaderText":
      textStyle = styles.DailyHeaderText;
      break;
    case "DailyDetailheaderText":
      textStyle = styles.DailyDetailheaderText;
      break;
    case "subDailyText":
      textStyle = styles.subDailyText;
      break;
    case "DailyboldText":
      textStyle = styles.DailyboldText;
      break;
    case "ButtonBottomText":
      textStyle = styles.ButtonBottomText;
      break;
    case "cardSubTitleText":
      textStyle = styles.cardSubTitleText;
      break;
    default:
      textStyle = styles.mediumText;
  }

  const weight = textStyle.fontFamily.match(/(\d+)/)?.[0] || "400";

  // Language-based font family mapping
  const getFontFamily = () => {
    if (userLang === "en") return textStyle.fontFamily;

    switch (userLang) {
      case "hi":
      case "mr":
        if (weight >= "700") return "NotoSansDevanagari_700Bold";
        if (weight >= "500") return "NotoSansDevanagari_500Medium";
        return "NotoSansDevanagari_400Regular";

      default:
        return fallbackFont;
    }
  };

  const fontFamily = getFontFamily();

  // Slightly increase font size only for Hindi/Marathi
  const adjustedFontSize =
    userLang === "hi" || userLang === "mr"
      ? textStyle.fontSize * 1.33
      : userLang === "en"
        ? textStyle.fontSize * 1
        : textStyle.fontSize;

  return (
    <Text
      allowFontScaling={false}
      {...props}
      style={[
        textStyle,
        props.style,
        {
          fontFamily: fontFamily || fallbackFont,
          fontSize: adjustedFontSize,
        },
      ]}
    >
      {props?.children}
    </Text>
  );
};

export default TextComponent;

const styles = StyleSheet.create({
  headerText: {
    color: Colors.Colors.BLACK,
    fontSize: FontSize.CONSTS.FS_16,
    fontFamily: "Inter_600SemiBold",
  },
  subText: {
    color: Colors.Colors.Light_black,
    fontSize: FontSize.CONSTS.FS_14,
    fontFamily: "Inter_400Regular",
  },
  mediumText: {
    color: Colors.Colors.Light_grey,
    fontSize: FontSize.CONSTS.FS_12,
    fontFamily: "Inter_500Medium",
  },
  boldText: {
    color: Colors.Colors.App_theme,
    fontSize: FontSize.CONSTS.FS_12,
    fontFamily: "Inter_700Bold",
  },
  semiBoldText: {
    color: Colors.Colors.App_theme,
    fontSize: FontSize.CONSTS.FS_12,
    fontFamily: "Inter_600SemiBold",
  },
  semiBoldBlackText: {
    color: Colors.Colors.Light_black,
    fontSize: FontSize.CONSTS.FS_12,
    fontFamily: "Inter_600SemiBold",
  },
  cardText: {
    color: Colors.Colors.Light_black,
    fontSize: FontSize.CONSTS.FS_14,
    fontFamily: "Inter_600SemiBold",
  },
  streakText: {
    color: Colors.Colors.App_theme,
    fontSize: FontSize.CONSTS.FS_10,
    fontFamily: "Inter_500Medium",
  },
  headerBoldText: {
    color: Colors.Colors.Light_black,
    fontSize: FontSize.CONSTS.FS_20,
    fontFamily: "Inter_700Bold",
  },
  headerBigText: {
    color: "#9A7548",
    fontSize: FontSize.CONSTS.FS_38,
    fontFamily: "Inter_900Black_Italic",
  },
  streakSubText: {
    color: Colors.Colors.BLACK,
    fontSize: FontSize.CONSTS.FS_13,
    fontFamily: "Inter_500Medium",
  },
  mediumBigText: {
    color: Colors.Colors.Light_grey,
    fontSize: FontSize.CONSTS.FS_22,
    fontFamily: "Inter_500Medium",
  },
  loginHeaderText: {
    color: Colors.Colors.Light_black,
    fontSize: FontSize.CONSTS.FS_20,
    fontFamily: "Inter_600SemiBold",
  },
  headerIncreaseText: {
    color: Colors.Colors.BLACK,
    fontSize: FontSize.CONSTS.FS_18,
    fontFamily: "Inter_600SemiBold",
  },
  headerSubBoldText: {
    color: Colors.Colors.Light_black,
    fontSize: FontSize.CONSTS.FS_14,
    fontFamily: "Inter_700Bold",
  },
  cardSadanaText: {
    color: Colors.Colors.Light_black,
    fontSize: FontSize.CONSTS.FS_22,
    fontFamily: "Inter_600SemiBold",
  },
  streakSadanaText: {
    color: Colors.Colors.BLACK,
    fontSize: FontSize.CONSTS.FS_14,
    fontFamily: "Inter_500Medium",
  },
  cardHeaderText: {
    color: Colors.Colors.card_text,
    fontSize: FontSize.CONSTS.FS_18,
    fontFamily: "Inter_500Medium",
  },
  subScrollText: {
    color: Colors.Colors.blue_text,
    fontSize: FontSize.CONSTS.FS_14,
    fontFamily: "Inter_400Regular",
  },
  DailyHeaderText: {
    color: Colors.Colors.Daily_black,
    fontSize: FontSize.CONSTS.FS_16,
    fontFamily: "Inter_500Medium",
  },
  DailyDetailheaderText: {
    color: Colors.Colors.Daily_black,
    fontSize: FontSize.CONSTS.FS_18,
    fontFamily: "Inter_500Medium",
  },
  DailyboldText: {
    color: Colors.Colors.Daily_black,
    fontSize: FontSize.CONSTS.FS_16,
    fontFamily: "Inter_700Bold",
  },
  subDailyText: {
    color: Colors.Colors.Daily_black,
    fontSize: FontSize.CONSTS.FS_12,
    fontFamily: "Inter_400Regular",
  },
  ButtonBottomText: {
    color: Colors.Colors.BLACK,
    fontSize: FontSize.CONSTS.FS_10,
    fontFamily: "Inter_600SemiBold",
  },
  cardSubTitleText: {
    color: Colors.Colors.BLACK,
    fontSize: FontSize.CONSTS.FS_14,
    fontFamily: "Inter_300Light_Italic",
  },
});
