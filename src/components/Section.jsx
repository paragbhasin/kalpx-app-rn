import React from "react";
<<<<<<< HEAD
import { View, Text, StyleSheet } from "react-native";
import colors from "../theme/colors"; // adjust path if needed
=======
import { StyleSheet, View } from "react-native";
import TextComponent from "./TextComponent";
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08

export default function Section({ title, children }) {
  return (
    <View style={styles.sectionWrap}>
<<<<<<< HEAD
      <Text style={styles.sectionTitle}>{title}</Text>
=======
      <TextComponent type="headerText" style={styles.sectionTitle}>{title}</TextComponent>
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionWrap: {
    marginBottom: 18,
  },
  sectionTitle: {
<<<<<<< HEAD
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary, // use earthy brown instead of plain gray
=======
    // fontSize: 16,
    // fontWeight: "500",
    color: "#000000", // use earthy brown instead of plain gray
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
    marginBottom: 8,
  },
});
