import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

type Props = {
  fromCart?: boolean;
  fromOrder?: boolean;
};

const ProductCard: React.FC<Props> = ({
  fromCart = false,
  fromOrder = false,
}) => {
  const navigation = useNavigation<any>();
  const [itemQuantity, setItemQuantity] = useState(1);

  const goToDetails = (id: number) => {
    if (!fromCart) {
      navigation.navigate("ProductDetails", { id });
    }
  };

  const decreaseNumber = () => {
    setItemQuantity((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const increaseNumber = () => {
    setItemQuantity((prev) => prev + 1);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.cardWrapper}
      onPress={() => goToDetails(1)}
    >
      {/* Order status */}
      {fromOrder && (
        <View style={styles.statusBox}>
          <View style={styles.delivered}>
            <Ionicons name="checkmark-circle" size={16} color="#16a34a" />
            <Text style={styles.statusText}>Order Delivered</Text>
          </View>
        </View>
      )}

      <View style={styles.row}>
        {/* Image */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => fromCart && goToDetails(1)}
        >
          <Image
            source={require("../../../assets/brass-deepa.png")}
            style={styles.image}
          />
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Brass Diyas</Text>

            {fromCart && !fromOrder && (
              <Ionicons name="remove-circle-outline" size={18} color="#444" />
            )}
          </View>

          {fromCart && <Text style={styles.vendor}>By Deepa Handicrafts</Text>}

          {fromOrder && <Text style={styles.meta}>Quantity: 2</Text>}

          {/* Quantity */}
          {fromCart && !fromOrder && (
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={decreaseNumber}>
                <Text>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{itemQuantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={increaseNumber}>
                <Text>+</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Rating */}
          {!fromCart && (
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#facc15" />
              <Text style={styles.rating}>4.5</Text>
              <Text style={styles.review}>(132 reviews)</Text>
            </View>
          )}

          {/* Offer */}
          {!fromOrder && (
            <View style={styles.offer}>
              <Text style={styles.offerText}>62% off</Text>
            </View>
          )}

          <Text style={styles.price}>₹120/-</Text>

          {!fromCart && <Text style={styles.viewDetails}>View Details</Text>}

          {fromCart && !fromOrder && (
            <View style={styles.returnRow}>
              <Ionicons name="checkmark" size={14} color="#16a34a" />
              <Text style={styles.returnText}>7 days return available</Text>
            </View>
          )}
        </View>
      </View>

      {/* Order buttons */}
      {fromOrder && (
        <View style={styles.orderActions}>
          <Text style={styles.track}>Track Order</Text>
          <Text style={styles.cancel}>Cancel Order</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  statusBox: { marginBottom: 8 },

  delivered: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: 8,
    borderRadius: 8,
  },

  statusText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#16a34a",
  },

  row: { flexDirection: "row", gap: 12 },

  image: {
    width: 96,
    height: 96,
    borderRadius: 12,
  },

  content: { flex: 1 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  title: { fontSize: 14, fontWeight: "700", color: "#1f2937" },

  vendor: { fontSize: 12, color: "#6b7280", marginTop: 4 },

  meta: { fontSize: 12, color: "#6b7280" },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  qtyBtn: {
    backgroundColor: "#e5e7eb",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  qtyText: { marginHorizontal: 12 },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  rating: { marginLeft: 4, fontSize: 12 },

  review: { marginLeft: 6, fontSize: 10, color: "#9ca3af" },

  offer: { marginTop: 8 },

  offerText: {
    backgroundColor: "#15803d",
    color: "#fff",
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },

  price: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 8,
  },

  viewDetails: {
    marginTop: 4,
    color: "#d4a017",
    fontWeight: "600",
  },

  returnRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },

  returnText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: "600",
  },

  orderActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  track: {
    borderWidth: 1,
    borderColor: "#d4a017",
    padding: 10,
    borderRadius: 8,
    color: "#d4a017",
  },

  cancel: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 10,
    borderRadius: 8,
  },
});
export default ProductCard;
