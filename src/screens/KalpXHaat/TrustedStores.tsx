import React from "react";
import { FlatList, Image, StyleSheet, Text, View } from "react-native";

const TrustedStores = ({ stores }) => {
  const renderItem = ({ item }) => {
    return (
      <View style={styles.cardWrapper}>
        <View style={styles.card}>
          {/* Image */}
          <View style={styles.imageWrapper}>
            <Image source={{ uri: item.image }} style={styles.image} />

            {/* Rating badge */}
            <View style={styles.ratingBadge}>
              <Text style={styles.ratingText}>★ {item.rating}</Text>
            </View>
          </View>

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>

            <Text style={styles.meta}>
              {item.time} <Text style={styles.open}> • Open</Text>
            </Text>

            <Text style={styles.distance}>{item.distance}</Text>
          </View>
        </View>
      </View>
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  ratingText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
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
