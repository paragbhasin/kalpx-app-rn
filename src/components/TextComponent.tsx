import { useFonts } from "@expo-google-fonts/inter";
import React from "react";
import { StyleSheet, Text } from "react-native";
import Colors from "./Colors";
import FontSize from "./FontSize";
import { InterFonts } from "./InterFonts";

const TextComponent = (props: any) => {
  const [fontsLoaded] = useFonts(InterFonts);

  if (!fontsLoaded) return null;

  let textStyle: {};
  switch (props?.type) {
    case "headerText":
      textStyle = styles.headerText;
      break;
    case "subText":
      textStyle = styles.subText;
      break;
    case "mediumText":
      textStyle = styles.subText;
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
    default:
      textStyle = styles.mediumText;
      break;
  }

  return (
    <Text
      {...props}
      style={{ ...textStyle, ...props.style }}
      onPress={props.onPress}
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
  cardText:{
        color: Colors.Colors.Light_black,
    fontSize: FontSize.CONSTS.FS_14,
    fontFamily: "Inter_600SemiBold",
  }
});
