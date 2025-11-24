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

// Telugu
import {
  NotoSansTelugu_400Regular,
  NotoSansTelugu_700Bold,
  useFonts as useTeluguFonts,
} from "@expo-google-fonts/noto-sans-telugu";

// Tamil
import {
  NotoSansTamil_400Regular,
  NotoSansTamil_700Bold,
  useFonts as useTamilFonts,
} from "@expo-google-fonts/noto-sans-tamil";

// Kannada
import {
  NotoSansKannada_400Regular,
  NotoSansKannada_700Bold,
  useFonts as useKannadaFonts,
} from "@expo-google-fonts/noto-sans-kannada";

// Gujarati
import {
  NotoSansGujarati_400Regular,
  NotoSansGujarati_700Bold,
  useFonts as useGujaratiFonts,
} from "@expo-google-fonts/noto-sans-gujarati";

// Odia
import {
  NotoSansOriya_400Regular,
  NotoSansOriya_700Bold,
  useFonts as useOdiaFonts,
} from "@expo-google-fonts/noto-sans-oriya";

// Malayalam
import {
  NotoSansMalayalam_400Regular,
  NotoSansMalayalam_700Bold,
  useFonts as useMalayalamFonts,
} from "@expo-google-fonts/noto-sans-malayalam";

// Bengali
import {
  NotoSansBengali_400Regular,
  NotoSansBengali_700Bold,
  useFonts as useBengaliFonts,
} from "@expo-google-fonts/noto-sans-bengali";

const TextComponent = (props: any) => {
  const [interLoaded] = useInterFonts(InterFonts);
  const [hindiLoaded] = useHindiFonts({
    NotoSansDevanagari_400Regular,
    NotoSansDevanagari_500Medium,
    NotoSansDevanagari_700Bold,
  });
  const [teluguLoaded] = useTeluguFonts({
    NotoSansTelugu_400Regular,
    NotoSansTelugu_700Bold,
  });
  const [tamilLoaded] = useTamilFonts({
    NotoSansTamil_400Regular,
    NotoSansTamil_700Bold,
  });
  const [kannadaLoaded] = useKannadaFonts({
    NotoSansKannada_400Regular,
    NotoSansKannada_700Bold,
  });
  const [gujaratiLoaded] = useGujaratiFonts({
    NotoSansGujarati_400Regular,
    NotoSansGujarati_700Bold,
  });
  const [odiaLoaded] = useOdiaFonts({
    NotoSansOriya_400Regular,
    NotoSansOriya_700Bold,
  });
  const [malayalamLoaded] = useMalayalamFonts({
    NotoSansMalayalam_400Regular,
    NotoSansMalayalam_700Bold,
  });
  const [bengaliLoaded] = useBengaliFonts({
    NotoSansBengali_400Regular,
    NotoSansBengali_700Bold,
  });

  const { i18n } = useTranslation();
  const userLang = i18n.language.split("-")[0]; // e.g. "hi-IN" → "hi"

  if (
    !interLoaded ||
    !hindiLoaded ||
    !teluguLoaded ||
    !tamilLoaded ||
    !kannadaLoaded ||
    !gujaratiLoaded ||
    !odiaLoaded ||
    !malayalamLoaded ||
    !bengaliLoaded
  )
    return null;

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
      
    default:
      textStyle = styles.mediumText;
  }

  const weight = textStyle.fontFamily.match(/(\d+)/)?.[0] || "400";

  // ✅ Language-based font family mapping
  const getFontFamily = () => {
    if (userLang === "en") return textStyle.fontFamily;

    switch (userLang) {
      case "hi":
      case "mr":
        if (weight >= "700") return "NotoSansDevanagari_700Bold";
        if (weight >= "500") return "NotoSansDevanagari_500Medium";
        return "NotoSansDevanagari_400Regular";

      case "te":
        return weight >= "600"
          ? "NotoSansTelugu_700Bold"
          : "NotoSansTelugu_400Regular";
      case "ta":
        return weight >= "600"
          ? "NotoSansTamil_700Bold"
          : "NotoSansTamil_400Regular";
      case "kn":
        return weight >= "600"
          ? "NotoSansKannada_700Bold"
          : "NotoSansKannada_400Regular";
      case "gu":
        return weight >= "600"
          ? "NotoSansGujarati_700Bold"
          : "NotoSansGujarati_400Regular";
      case "or":
        return weight >= "600"
          ? "NotoSansOriya_700Bold"
          : "NotoSansOriya_400Regular";
      case "ml":
        return weight >= "600"
          ? "NotoSansMalayalam_700Bold"
          : "NotoSansMalayalam_400Regular";
      case "bn":
        return weight >= "600"
          ? "NotoSansBengali_700Bold"
          : "NotoSansBengali_400Regular";
      default:
        return fallbackFont;
    }
  };

  const fontFamily = getFontFamily();

  // ✅ Slightly increase font size only for Hindi/Marathi
  const adjustedFontSize =
    userLang === "hi" || userLang === "mr"
      ? textStyle.fontSize * 1.33
      : userLang === "en"  ? textStyle.fontSize * 1.2: textStyle.fontSize;

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
  cardHeaderText:{
    color: Colors.Colors.card_text,
    fontSize: FontSize.CONSTS.FS_18,
    fontFamily: "Inter_500Medium",
  },
    subScrollText: {
    color: Colors.Colors.blue_text,
    fontSize: FontSize.CONSTS.FS_14,
    fontFamily: "Inter_400Regular",
  },
    DailyHeaderText:{
    color: Colors.Colors.Daily_black,
    fontSize: FontSize.CONSTS.FS_16,
    fontFamily: "Inter_500Medium",
  },
});