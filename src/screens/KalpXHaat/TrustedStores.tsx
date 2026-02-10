import { useNavigation } from "@react-navigation/native";
import React from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const TrustedStores = ({ stores }) => {
  const navigation = useNavigation<any>();

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.cardWrapper}
        onPress={() => navigation.navigate("StoreDetailView", { id: item.id })}
        activeOpacity={0.9}
      >
        <View style={styles.card}>
          {/* Image */}
          <View style={styles.imageWrapper}>
            <Image source={{ uri: item.image }} style={styles.image} />

            {/* Rating badge */}
            <View style={styles.ratingBadge}>
              <View style={styles.ratingRow}>
                <Icon name="star" size={10} color="#fff" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
            </View>
          </View>

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>{item.name}</Text>

            <Text style={styles.meta}>
              {item.time} <Text style={styles.open}> • Open</Text>
            </Text>

            <Text style={styles.distance}>{item.distance}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>Trusted store near you</Text>
        <Text style={styles.viewAll}>View all</Text>
      </View>

      <FlatList
        data={stores}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 10, // 👈 IMPORTANT
        }}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  heading: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1b",
  },

  viewAll: {
    fontSize: 14,
    color: "#c9a24d",
  },

  cardWrapper: {
    width: 240,
    marginRight: 16,

    // shadow ONLY
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },

    backgroundColor: "transparent", // 👈 KEY
  },

  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#fff", // 👈 move bg here
  },

  imageWrapper: {
    position: "relative",
  },

  image: {
    width: "100%",
    height: 140,
  },

  info: {
    padding: 12,
    backgroundColor: "#fff", // keep consistent
  },

  ratingBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    backgroundColor: "#2e7d32",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },

  ratingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1b",
    marginBottom: 6,
  },

  meta: {
    fontSize: 14,
    color: "#6b7280",
  },

  open: {
    color: "#16a34a",
    fontWeight: "500",
  },

  distance: {
    marginTop: 4,
    fontSize: 13,
    color: "#9ca3af",
  },
});
export default TrustedStores;
