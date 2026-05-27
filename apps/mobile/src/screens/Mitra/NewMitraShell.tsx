import React from "react";
import { ImageBackground, SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { rfs, rhPad, TABLET_MAX_CONTENT_WIDTH } from "../../utils/responsive";

export default function NewMitraShell() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;

  return (
    <ImageBackground
      source={require("../../../assets/beige_bg.webp")}
      style={styles.fill}
    >
      <SafeAreaView style={styles.center}>
        <View
          style={[
            styles.contentWrap,
            isTablet && {
              maxWidth: TABLET_MAX_CONTENT_WIDTH,
              alignSelf: "center",
              width: "100%",
              paddingHorizontal: rhPad(24, width),
            },
          ]}
        >
          <Text style={[styles.placeholder, { fontSize: rfs(16, width) }]}>
            NewMitraShell — Gate 1 placeholder
          </Text>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  contentWrap: {
    alignItems: "center",
  },
  placeholder: {
    fontSize: 16,
    color: "#432104",
  },
});
