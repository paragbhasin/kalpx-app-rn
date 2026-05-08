import React, { useState } from "react";
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
import Colors from "../../components/Colors";
import ProductView from "./ProductView";
import ServiceView from "./ServiceView";

const HaatLandingView = () => {
  const [activeTab, setActiveTab] = useState("product");

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.background}>
          {/* Title + Cart */}
          <View style={[styles.flexContainer, styles.spaceBetween]}>
            <Text style={styles.mainHeading}>KalpX Haat</Text>

            <View style={{ position: "relative" }}>
              <Icon name="cart-outline" size={22} color="#1a1a1b" />
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>0</Text>
              </View>
            </View>
          </View>

          {/* Search + Filter */}
          <View style={styles.searchRow}>
            <View style={styles.searchBox}>
              <Image
                source={require("../../../assets/C_Vector.png")}
                style={styles.searchIcon}
              />
              <TextInput
                allowFontScaling={false}
                placeholder="Search by product, shop, service"
                placeholderTextColor={Colors.Colors.Light_black}
                style={styles.searchInput}
              />
            </View>

            <TouchableOpacity style={styles.filterBtn}>
              <Icon name="options-outline" size={22} color="#1a1a1b" />
            </TouchableOpacity>
          </View>

          {/* Product / Service Tabs */}
          <View style={[styles.flexContainer, styles.tabRow]}>
            {/* Product */}
            <TouchableOpacity
              style={[styles.tab, activeTab === "product" && styles.activeTab]}
              onPress={() => setActiveTab("product")}
            >
              <Icon
                name="cube-outline"
                size={20}
                color={activeTab === "product" ? "#c9a24d" : "#999"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "product" && styles.activeTabText,
                ]}
              >
                Product
              </Text>
            </TouchableOpacity>

            {/* Service */}
            <TouchableOpacity
              style={[styles.tab, activeTab === "service" && styles.activeTab]}
              onPress={() => setActiveTab("service")}
            >
              <Icon
                name="home-outline"
                size={20}
                color={activeTab === "service" ? "#c9a24d" : "#999"}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === "service" && styles.activeTabText,
                ]}
              >
                Service
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        {activeTab === "product" && <ProductView />}
        {activeTab === "service" && <ServiceView />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  background: {
    backgroundColor: "#f8ece2",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },

  flexContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  spaceBetween: {
    justifyContent: "space-between",
  },

  mainHeading: {
    fontSize: 25,
    color: "#1a1a1b",
    fontFamily: "GelicaRegular",
  },

  /* Cart badge */
  cartBadge: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: "#c9a24d",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },

  /* Search */
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
  },

  searchBox: {
    flex: 1,
    backgroundColor: Colors.Colors.white,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    marginRight: 12,
    height: 48,
  },

  searchIcon: {
    width: 20,
    height: 20,
    marginHorizontal: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
  },

  filterBtn: {
    backgroundColor: Colors.Colors.white,
    padding: 11,
    borderRadius: 8,
  },

  /* Tabs */
  tabRow: {
    marginTop: 20,
  },

  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    marginHorizontal: 6,
  },

  activeTab: {
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  tabText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#1a1a1b",
  },

  activeTabText: {
    color: "#1a1a1b",
    fontWeight: "600",
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
export default HaatLandingView;
