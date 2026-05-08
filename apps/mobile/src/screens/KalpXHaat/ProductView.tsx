import React, { useEffect } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts, fetchStores } from "../../service/haatSlice";
import { AppDispatch, RootState } from "../../store";
import ProductCard from "./ProductCard";
import TrustedStores from "./TrustedStores";

const ProductView = () => {
  const dispatch = useDispatch<AppDispatch>();
  const products = useSelector((state: RootState) => state.haat.products);
  const stores = useSelector((state: RootState) => state.haat.stores);

  useEffect(() => {
    dispatch(fetchProducts({}));
    dispatch(fetchStores({}));
  }, []);

  const categories = [
    {
      id: "1",
      name: "Pooja Item",
      icon: require("../../../assets/image 227.png"),
    },
    {
      id: "2",
      name: "Oil & Essential",
      icon: require("../../../assets/image 228.png"),
    },
    {
      id: "3",
      name: "Diyas",
      icon: require("../../../assets/image 229.png"),
    },
    {
      id: "4",
      name: "Pooja Kit",
      icon: require("../../../assets/image 230.png"),
    },
  ];

  const renderItem = ({ item }: any) => {
    return (
      <View style={styles.card}>
        <Image source={item.icon} style={styles.image} />
        <Text style={styles.text}>{item.name}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
      <TrustedStores stores={stores} />

      <View style={styles.newArrivalsSection}>
        <View style={styles.headerRow}>
          <Text style={styles.newArrivalsHeading}>
            New Arrivals on Kalpx Haat
          </Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        <ProductCard products={products} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },

  listContent: {
    paddingHorizontal: 16,
  },

  card: {
    alignItems: "center",
    marginRight: 16,
  },

  image: {
    width: 72,
    height: 72,
    borderRadius: 16,
    resizeMode: "contain",
  },

  text: {
    marginTop: 8,
    fontSize: 14,
    color: "#1a1a1b",
    textAlign: "center",
  },

  newArrivalsSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  newArrivalsHeading: {
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

export default ProductView;
