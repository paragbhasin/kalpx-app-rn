import { useNavigation, useRoute } from "@react-navigation/native";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductDetail } from "../../service/haatSlice";
import { AppDispatch, RootState } from "../../store";
import ReviewRatings from "./ReviewRatings";

const { width } = Dimensions.get("window");

const ProductDetails = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();
  const { id } = route.params || {};

  const product = useSelector((state: RootState) => state.haat.productDetail);
  const loading = useSelector((state: RootState) => state.haat.loading);

  React.useEffect(() => {
    if (id) {
      dispatch(fetchProductDetail(id));
    }
  }, [id]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={{ marginTop: 100, textAlign: "center" }}>Loading...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={{ marginTop: 100, textAlign: "center" }}>
          Product not found
        </Text>
      </View>
    );
  }

  const productImage = product.images?.[0]?.url || product.image;

  const additionalDetails: any = {
    // product might have different fields in API
    material: product.material || "N/A",
    size: product.size || "Standard",
    color: product.color || "Default",
    weight: product.weight || "N/A",
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Image source={{ uri: productImage }} style={styles.headerImage} />

          <View style={styles.topButtons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={22} color="#1a1a1b" />
            </TouchableOpacity>

            <View style={styles.rightButtons}>
              <TouchableOpacity style={styles.iconBtn}>
                <Icon name="heart-outline" size={22} color="#1a1a1b" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, { marginLeft: 12 }]}
                onPress={() => navigation.navigate("HaatCart")}
              >
                <Icon name="cart-outline" size={22} color="#1a1a1b" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.mainInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>₹{product.price_minor}/-</Text>
          </View>

          <View style={styles.ratingRow}>
            <Text style={styles.ratingText}>{product.rating}</Text>
            <Icon name="star" size={18} color="#c9a24d" />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description :</Text>
            <Text style={styles.descriptionText}>{product.description}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Details :</Text>

            <View style={styles.detailsGrid}>
              {Object.entries(additionalDetails).map(([key, value]) => (
                <View key={key} style={styles.detailItem}>
                  <Text style={styles.detailKey}>{key}</Text>
                  <Text style={styles.detailValue}>{String(value)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.divider} />

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.addToCartBtn}>
              <Icon
                name="cart-outline"
                size={20}
                color="#c9a24d"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buyNowBtn}
              onPress={() => navigation.navigate("HaatCart")}
            >
              <Text style={styles.buyNowText}>Buy Now</Text>
              <Icon
                name="arrow-forward"
                size={20}
                color="#fff"
                style={{ marginLeft: 8 }}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Review Ratings Placeholder */}
          <View style={styles.reviewsSection}>
            <ReviewRatings />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    position: "relative",
  },
  headerImage: {
    width: width,
    height: 250,
    resizeMode: "cover",
  },
  topButtons: {
    position: "absolute",
    top: 50,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rightButtons: {
    flexDirection: "row",
  },
  iconBtn: {
    backgroundColor: "#F7F0DD",
    padding: 10,
    borderRadius: 8,
  },
  content: {
    padding: 16,
  },
  mainInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  productName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a1a1b",
  },
  productPrice: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a1a1b",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  ratingText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#c9a24d",
    marginRight: 4,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
    marginBottom: 8,
    fontFamily: "Inter-SemiBold",
  },
  descriptionText: {
    fontSize: 15,
    color: "#4b5563",
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 20,
  },
  detailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  detailItem: {
    width: "45%",
    marginBottom: 16,
  },
  detailKey: {
    fontSize: 14,
    color: "#9ca3af",
    textTransform: "capitalize",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
  },
  actions: {
    marginTop: 10,
  },
  addToCartBtn: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#c9a24d",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  addToCartText: {
    color: "#c9a24d",
    fontSize: 16,
    fontWeight: "700",
  },
  buyNowBtn: {
    width: "100%",
    backgroundColor: "#c9a24d",
    paddingVertical: 14,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  buyNowText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  reviewsSection: {
    paddingBottom: 40,
  },
});

export default ProductDetails;
