import React from "react";
import { StyleSheet, View } from "react-native";
import TextComponent from "./TextComponent";

export default function Section({ title, children }) {
  return (
    <View style={styles.sectionWrap}>
      <TextComponent type="headerText" style={styles.sectionTitle}>{title}</TextComponent>
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionWrap: {
    marginBottom: 18,
  },
  sectionTitle: {
    // fontSize: 16,
    // fontWeight: "500",
    color: "#000000", // use earthy brown instead of plain gray
    marginBottom: 8,
  },
});
