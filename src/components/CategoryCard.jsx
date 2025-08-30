import React from "react";
import { Pressable, Image, Text, StyleSheet } from "react-native";
import colors from "../theme/colors"; // adjust path if needed

export default function CategoryCard({ item, selected, onToggle }) {
  return (
    <Pressable
      onPress={() => onToggle(item.id)}
      style={[styles.card, selected && styles.selected]}
    >
      <Image source={{ uri: item.image }} style={styles.image} />
      <Text style={styles.title}>{item.title}</Text>
      {item.subtitle ? <Text style={styles.subtitle}>{item.subtitle}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "31.5%",
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    marginBottom: 12,
  },
  selected: {
    borderColor: colors.primary,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 70,
    borderRadius: 12,
    marginBottom: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 10,
    color: colors.subtext,
  },
});
