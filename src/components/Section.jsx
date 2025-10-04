import React from "react";
import { StyleSheet, Text, View } from "react-native";

export default function Section({ title, children }) {
  return (
    <View style={styles.sectionWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionWrap: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0000000", // use earthy brown instead of plain gray
    marginBottom: 8,
  },
});
