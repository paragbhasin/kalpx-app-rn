import React from "react";
import { ImageBackground, SafeAreaView, StyleSheet, Text } from "react-native";

export default function NewMitraShell() {
  return (
    <ImageBackground
      source={require("../../../assets/beige_bg.png")}
      style={styles.fill}
    >
      <SafeAreaView style={styles.center}>
        <Text style={styles.placeholder}>NewMitraShell — Gate 1 placeholder</Text>
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
  },
  placeholder: {
    fontSize: 16,
    color: "#432104",
  },
});
