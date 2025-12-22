<<<<<<< HEAD
import React from "react";
=======
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
import { Pressable, StyleSheet, Text } from "react-native";
import colors from "../theme/colors"; // adjust path if needed

export default function PillOption({ label, selected, onToggle }) {
  return (
    <Pressable
      onPress={() => onToggle(label)}
      style={[styles.pill, selected && styles.pillOn]}
    >
<<<<<<< HEAD
      <Text style={[styles.text, selected && styles.textOn]}>{label}</Text>
=======
      <Text  allowFontScaling={false} style={[styles.text, selected && styles.textOn]}>{label}</Text>
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.chipBorder,
    backgroundColor: colors.chipBg,
    marginRight: 10,
    marginBottom: 10,
  },
  pillOn: {
    backgroundColor: colors.bg, // could also use colors.accent with opacity
    borderColor: colors.primary,
  },
  text: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  textOn: {
    color: colors.primary,
  },
});
