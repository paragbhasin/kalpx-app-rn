import React from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ServiceCard from "./ServiceCard";
import TrustedStores from "./TrustedStores";

const ServiceView = () => {
  const categories = [
    {
      id: "1",
      name: "Pandit Booking",
      icon: require("../../../assets/image 221.png"),
    },
    {
      id: "2",
      name: "Festival Decoration",
      icon: require("../../../assets/image 224.png"),
    },
    {
      id: "3",
      name: "Temple Offering",
      icon: require("../../../assets/image 225.png"),
    },
  ];

  const trustedStores = [
    {
      id: 4,
      name: "Divine Floral decoration  Service",
      image: require("../../../assets/service1.png"),
      rating: "4.9+",
      time: "40-50 min",
      distance: "900m away",
    },
    {
      id: 5,
      name: "Om Pandit Seva Kendrs",
      image: require("../../../assets/service2.png"),
      rating: "4.7",
      time: "30-40 min",
      distance: "1.2km away",
    },
    {
      id: 6,
      name: "MA Decoration Service",
      image: require("../../../assets/service3.png"),
      rating: "4.7",
      time: "30-40 min",
      distance: "1.2km away",
    },
  ];

  const renderCategory = ({ item }) => {
    return (
      <View style={styles.catCard}>
        <Image source={item.icon} style={styles.catImage} />
        <Text style={styles.catText}>{item.name}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Categories Section */}
      <View style={styles.section}>
        <Text style={styles.sectionHeading}>Categories</Text>
        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catListContent}
        />
      </View>

      {/* Trusted Service Providers Section */}
      <TrustedStores
        stores={trustedStores}
        title="Kalpx Trusted Service Provider"
      />

      {/* Popular Service Section */}
      <View style={styles.cardSection}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>Our Popular Service</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>
        <ServiceCard />
      </View>

      {/* What's New Section */}
      <View style={[styles.cardSection, { marginBottom: 30 }]}>
        <View style={styles.headerRow}>
          <Text style={styles.sectionTitle}>What's New</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>
        <ServiceCard />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 16,
  },
  catListContent: {
    paddingRight: 16,
  },
  catCard: {
    alignItems: "center",
    marginRight: 20,
    width: 80,
  },
  catImage: {
    width: 72,
    height: 72,
    borderRadius: 16,
    resizeMode: "contain",
  },
  catText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
    lineHeight: 18,
  },
  cardSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  viewAllText: {
    fontSize: 14,
    color: "#d4a017",
    fontWeight: "600",
  },
});

export default ServiceView;
