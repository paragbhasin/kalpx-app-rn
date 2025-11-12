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
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 8,
    marginRight: 12, // spacing for FlatList horizontal
    marginBottom:10
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
    height: 90,
    borderRadius: 12,
    marginBottom: 6,
  },
  title: {
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
 
 