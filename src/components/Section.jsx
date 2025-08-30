import React from "react";
import { View, Text, StyleSheet } from "react-native";
import colors from "../theme/colors"; // adjust path if needed

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
    fontWeight: "700",
    color: colors.primary, // use earthy brown instead of plain gray
    marginBottom: 8,
  },
});
