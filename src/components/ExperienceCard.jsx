import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import colors from "../theme/colors"; // adjust path if needed

export default function ExperienceCard({ label, active, onPress, blurb }) {
  return (
    <Pressable
      onPress={() => onPress(label)}
      style={[styles.card, active && styles.active]}
    >
      <View style={styles.row}>
        <Text style={styles.icon}>💎</Text>
        <Text style={styles.title}>{label}</Text>
      </View>
      <Text style={styles.blurb}>{blurb}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginRight: 12,
  },
  active: {
    borderColor: colors.primary,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  row: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  icon: { fontSize: 14 },
  title: { fontSize: 14, fontWeight: "800", color: colors.text, marginLeft: 6 },
  blurb: { fontSize: 12, color: colors.subtext, lineHeight: 16 },
});
