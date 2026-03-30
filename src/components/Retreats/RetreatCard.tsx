import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import {
    Dimensions,
    Image,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width } = Dimensions.get("window");

interface Retreat {
  slug: string;
  title: string;
  tagline: string;
  cheapest_price_minor: number;
  location: { city: string };
  rating_avg: number;
  rating_count: number;
  badge?: { text: string; type: "urgency" | "offer" };
  formatted_date_range?: string;
  cover_image?: { url: any };
  facilitator?: { name: string; avatar: any; exp: string };
}

interface RetreatCardProps {
  retreat: Retreat;
  onOpen?: () => void;
}

const RetreatCard: React.FC<RetreatCardProps> = ({ retreat, onOpen }) => {
  const formatPrice = (minor: number) => {
    if (!minor) return "10,000";
    return (minor / 100).toLocaleString("en-IN");
  };

  const getBadgeColor = (type?: string) => {
    switch (type) {
      case "offer":
        return "#43BC6C";
      case "urgency":
        return "#748DCE";
      default:
        return "#748DCE";
    }
  };

  const retreatImage = require("../../../assets/retreat/retreat1.jpg");
  const facilitatorImage = require("../../../assets/retreat/retreat2.jpg");

  return (
    <Pressable style={styles.card} onPress={onOpen}>
      {/* Top Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={retreat.cover_image?.url || retreatImage}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Dynamic Badge */}
        {retreat.badge && (
          <View
            style={[
              styles.badge,
              { backgroundColor: getBadgeColor(retreat.badge.type) },
            ]}
          >
            <Text style={styles.badgeText}>{retreat.badge.text}</Text>
          </View>
        )}

        {/* Facilitator Overlay */}
        <View style={styles.facilitatorOverlay}>
          <Image
            source={retreat.facilitator?.avatar || facilitatorImage}
            style={styles.avatar}
          />
          <View style={styles.facilitatorInfo}>
            <Text style={styles.facilitatorName}>
              {retreat.facilitator?.name || "Riya Dyne"}{" "}
              <Text style={styles.facilitatorExp}>
                ({retreat.facilitator?.exp || "10+Exp"})
              </Text>
            </Text>
            <Text style={styles.facilitatorRole}>Facilitator</Text>
          </View>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <Text style={styles.title}>{retreat.title}</Text>
        <Text style={styles.tagline} numberOfLines={2}>
          {retreat.tagline} <Text style={styles.moreText}>More</Text>
        </Text>

        {/* Date Range Pill */}
        <View style={styles.datePill}>
          <FontAwesome
            name="calendar"
            size={14}
            color="#2b2b2b"
            style={styles.icon}
          />
          <Text style={styles.dateText}>
            {retreat.formatted_date_range || "22 Dec - 27 Dec 2025"}
          </Text>
        </View>

        {/* Meta Info */}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <FontAwesome
              name="map-marker"
              size={16}
              color="#D4A017"
              style={styles.icon}
            />
            <Text style={styles.metaText}>{retreat.location.city}</Text>
          </View>
          <View style={styles.metaItem}>
            <FontAwesome
              name="star"
              size={16}
              color="#D4A017"
              style={styles.icon}
            />
            <Text>
              {retreat.rating_avg}
              <Text>({retreat.rating_count})</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Pricing Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>Starting From</Text>
          <Text style={styles.priceText}>
            ₹{formatPrice(retreat.cheapest_price_minor)}
          </Text>
        </View>
        <Pressable style={styles.button} onPress={onOpen}>
          <Text style={styles.buttonText}>View Details</Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  badge: {
    position: "absolute",
    top: 16,
    left: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "GelicaBold",
  },
  facilitatorOverlay: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    padding: 6,
    paddingRight: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    zIndex: 10,
    maxWidth: "85%",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#eee",
  },
  facilitatorInfo: {
    marginLeft: 10,
  },
  facilitatorName: {
    fontSize: 13,
    fontFamily: "GelicaBold",
    color: "#000",
  },
  facilitatorExp: {
    fontSize: 10,
    color: "#707070",
    fontFamily: "GelicaMedium",
  },
  facilitatorRole: {
    fontSize: 10,
    color: "#707070",
    fontFamily: "GelicaMedium",
    marginTop: 2,
  },
  content: {
    padding: 16,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontFamily: "GelicaBold",
    color: "#000",
  },
  tagline: {
    fontSize: 15,
    fontFamily: "GelicaMedium",
    color: "#707070",
    lineHeight: 20,
  },
  moreText: {
    color: "#D4A017",
    fontFamily: "GelicaBold",
  },
  datePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FCF8F0",
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1EAD9",
    alignSelf: "flex-start",
    marginTop: 4,
  },
  dateText: {
    fontSize: 15,
    fontFamily: "GelicaBold",
    color: "#2b2b2b",
    marginLeft: 8,
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginRight: 6,
  },
  metaText: {
    fontSize: 15,
    fontFamily: "GelicaBold",
    color: "#2b2b2b",
  },
  ratingCount: {
    color: "#707070",
    fontFamily: "GelicaMedium",
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginHorizontal: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  priceLabel: {
    fontSize: 13,
    fontFamily: "GelicaBold",
    color: "#707070",
    marginBottom: 2,
  },
  priceText: {
    fontSize: 22,
    fontFamily: "GelicaBold",
    color: "#000",
  },
  button: {
    backgroundColor: "#D4A017",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  buttonText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "GelicaBold",
  },
});

export default RetreatCard;
