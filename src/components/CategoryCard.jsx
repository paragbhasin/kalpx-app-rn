<<<<<<< HEAD
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
=======
import { Ionicons } from "@expo/vector-icons";
import { Image, Pressable, StyleSheet, View } from "react-native";
import colors from "../theme/colors"; // adjust path if needed
import TextComponent from "./TextComponent";
 
export default function CategoryCard({ item, selected, onToggle }) {
   const isRemote = typeof item.image === "string" && item.image.startsWith("http");
    const uniqueKey = item?.key ?? item?.id ?? item?.name;

  return (
    <Pressable
      onPress={() => onToggle(uniqueKey)}
      style={[styles.card, selected && styles.selected]}
    >
      {/* <Image source={{ uri: item.image }} style={styles.image} /> */}
   <Image
        source={isRemote ? { uri: item.image } : item.image}
        style={styles.image}
      />
      {/* Circular Checkbox in top-right */}
      {selected && (
        <View style={styles.checkCircle}>
          <Ionicons name="checkmark" size={14} color="#fff" />
        </View>
      )}
 
      <TextComponent type="headerSubBoldText" style={styles.title} numberOfLines={1}>
        {item.title}
      </TextComponent>
      {item.subtitle ? (
        <TextComponent type="mediumText" style={styles.subtitle} numberOfLines={2}>
          {item.subtitle}
        </TextComponent>
      ) : null}
    </Pressable>
  );
}
 
const styles = StyleSheet.create({
  card: {
    width: 180, // fixed width for horizontal scroll
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
<<<<<<< HEAD
    marginBottom: 12,
=======
    marginRight: 12, // spacing for FlatList horizontal
    marginBottom:10
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
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
<<<<<<< HEAD
    height: 70,
=======
    height: 90,
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
    borderRadius: 12,
    marginBottom: 6,
  },
  title: {
<<<<<<< HEAD
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    fontSize: 10,
    color: colors.subtext,
  },
});
=======
    // fontSize: 14,
    // fontWeight: "700",
    color: colors.text,
  },
  subtitle: {
    // fontSize: 10,
    color: colors.subtext,
  },
  checkCircle: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
 
 
>>>>>>> 32d65a58210371a3fcd7c935e9b9120fc9eeaf08
