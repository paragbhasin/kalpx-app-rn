import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

type Props = {
  fromCart?: boolean;
  fromOrder?: boolean;
  product?: any;
  products?: any[];
};

const ProductCard: React.FC<Props> = ({
  products,
  product,
  fromCart = false,
  fromOrder = false,
}) => {
  const navigation = useNavigation<any>();

  const items = products ? products : product ? [product] : [];

  if (items.length === 0) return null;

  return (
    <>
      {items.map((item: any, index: number) => (
        <SingleProductCard
          key={item.id || index}
          product={item}
          fromCart={fromCart}
          fromOrder={fromOrder}
          navigation={navigation}
        />
      ))}
    </>
  );
};

const SingleProductCard = ({
  product,
  fromCart,
  fromOrder,
  navigation,
}: any) => {
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
      onPress={() => goToDetails(product.id)}
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
          onPress={() => fromCart && goToDetails(product.id)}
        >
          <Image
            source={{ uri: product?.images?.[0]?.url || product?.image }}
            style={styles.image}
          />
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{product.name}</Text>

            {fromCart && !fromOrder && (
              <Ionicons name="remove-circle-outline" size={18} color="#444" />
            )}
          </View>

          {fromCart && (
            <Text style={styles.vendor}>By {product.store?.store_name}</Text>
          )}

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

          <Text style={styles.price}>
            ₹{product.price_minor || product.price}/-
          </Text>

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
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
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

  row: { flexDirection: "row", gap: 16 },

  image: {
    width: 120,
    height: 120,
    borderRadius: 20,
  },

  content: { flex: 1 },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#273142",
  },

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
    marginTop: 6,
  },

  rating: {
    marginLeft: 6,
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
  },

  review: {
    marginLeft: 6,
    fontSize: 13,
    color: "#9ca3af",
  },

  offer: { marginTop: 10 },

  offerText: {
    backgroundColor: "#16a34a",
    color: "#fff",
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    fontWeight: "600",
    alignSelf: "flex-start",
  },

  price: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10,
    color: "#000",
  },

  viewDetails: {
    marginTop: 6,
    color: "#c9a24d",
    fontSize: 16,
    fontWeight: "700",
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
