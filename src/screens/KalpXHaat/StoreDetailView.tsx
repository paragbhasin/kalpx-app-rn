import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useEffect } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import { fetchStoreDetail } from "../../service/haatSlice";
import { AppDispatch, RootState } from "../../store";
import ProductCard from "./ProductCard";
import ServiceCard from "./ServiceCard";

const StoreDetailView = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { id } = route.params || { id: 1 };
  const dispatch = useDispatch<AppDispatch>();
  const store = useSelector((state: RootState) => state.haat.storeDetail);
  useEffect(() => {
    dispatch(fetchStoreDetail(id));
  }, [id]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Image Section */}
        <View style={styles.header}>
          <Image source={{ uri: store.image }} style={styles.headerImage} />

          {/* Overlay Buttons */}
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

          {/* Rating Badge */}
          <View style={styles.ratingBadge}>
            <View style={styles.ratingRow}>
              <Icon name="star" size={12} color="#fff" />
              <Text style={styles.ratingText}>{store.rating}</Text>
            </View>
          </View>
        </View>

        {/* Store Info Section */}
        <View style={styles.content}>
          <View style={styles.infoCard}>
            <Text style={styles.storeName}>{store.name}</Text>

            {/* Location */}
            <View style={styles.infoRow}>
              <View style={styles.iconWrapper}>
                <Icon name="location" size={16} color="#4b5563" />
              </View>
              <Text style={styles.infoText}>{store.location}</Text>
            </View>

            {/* Phone */}
            <View style={[styles.infoRow, { marginTop: 12 }]}>
              <View style={styles.iconWrapper}>
                <Icon name="call" size={16} color="#4b5563" />
              </View>
              <Text style={styles.infoText}>{store.phoneNumber}</Text>
            </View>

            {/* Timings */}
            <View style={[styles.infoRow, { marginTop: 12 }]}>
              <View style={styles.iconWrapper}>
                <Icon name="time" size={16} color="#4b5563" />
              </View>
              <View>
                <Text style={styles.statusOpen}>Open</Text>
                <Text style={styles.infoText}>
                  {store.open} - {store.close}
                </Text>
              </View>
            </View>

            <Text style={styles.description}>{store.description}</Text>
          </View>

          {/* Search Section */}
          <View style={styles.listSection}>
            <Text style={styles.listHeading}>
              {store.type === "product" ? "Product List" : "Service List"}
            </Text>

            <View style={styles.searchBox}>
              <Icon
                name="search"
                size={20}
                color="#9ca3af"
                style={styles.searchIcon}
              />
              <TextInput
                placeholder="Search by product, shop or service"
                placeholderTextColor="#9ca3af"
                style={styles.searchInput}
              />
            </View>

            {/* Cards List */}
            <View style={styles.cardsContainer}>
              {store.type === "product" ? (
                <>
                  <ProductCard />
                  <ProductCard />
                </>
              ) : (
                <>
                  <ServiceCard />
                  <ServiceCard />
                </>
              )}
            </View>
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
    width: "100%",
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
    alignItems: "center",
  },
  rightButtons: {
    flexDirection: "row",
  },
  iconBtn: {
    backgroundColor: "#F7F0DD",
    padding: 10,
    borderRadius: 8,
    elevation: 2,
  },
  ratingBadge: {
    position: "absolute",
    bottom: -15,
    right: 0,
    backgroundColor: "#fff",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#166534",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  ratingText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 4,
  },
  content: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  infoCard: {
    backgroundColor: "#F9F9F9",
    borderRadius: 16,
    padding: 16,
  },
  storeName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrapper: {
    backgroundColor: "#ECE8E8",
    padding: 10,
    borderRadius: 10,
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#4b5563",
  },
  statusOpen: {
    color: "#387F31",
    fontSize: 14,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 16,
    lineHeight: 20,
  },
  listSection: {
    marginTop: 24,
  },
  listHeading: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  cardsContainer: {
    marginTop: 16,
    paddingBottom: 40,
  },
});

export default StoreDetailView;
