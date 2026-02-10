import { useNavigation } from "@react-navigation/native";
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

const ServiceCheckout = () => {
  const navigation = useNavigation<any>();
  const [selectedPlan, setSelectedPlan] = useState("deposit");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handlePayment = () => {
    setShowSuccessModal(true);
  };

  const renderSuccessModal = () => (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.successIconWrapper}>
          <View style={styles.wavyCircle}>
            <Icon name="checkmark" size={40} color="#fff" />
          </View>
        </View>

        <Text style={styles.congratsTitle}>Congratulation</Text>
        <Text style={styles.congratsSubtext}>
          Thank you! Your order has been successfully placed. We'll share the
          confirmation details with you shortly
        </Text>

        <TouchableOpacity
          style={styles.trackOrderBtn}
          onPress={() => {
            setShowSuccessModal(false);
            navigation.navigate("HaatCart", { tab: "orders" });
          }}
        >
          <Text style={styles.trackOrderBtnText}>Track my order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color="#1a1a1b" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Cart</Text>
        </View>
        <TouchableOpacity style={styles.wishlistBtn}>
          <Icon name="heart-outline" size={22} color="#1a1a1b" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Tabs */}
        <View style={styles.tabBar}>
          <View style={[styles.tab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>My Cart</Text>
          </View>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => navigation.navigate("HaatCart", { tab: "orders" })}
          >
            <Text style={styles.tabText}>My Orders</Text>
          </TouchableOpacity>
        </View>

        {/* Service Card */}
        <View style={styles.serviceItem}>
          <Image
            source={require("../../../assets/service-card.png")}
            style={styles.serviceImage}
          />
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceTitle}>Diwali Decoration</Text>
            <View style={styles.ratingRow}>
              <Icon name="star" size={12} color="#c9a24d" />
              <Text style={styles.ratingText}>4.5 (132 reviews)</Text>
            </View>
            <Text style={styles.serviceMeta}>Date: 23 Nov 2025</Text>
            <Text style={styles.serviceMeta}>Time: 8.00 AM - 5 PM</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("PackageDetails")}
            >
              <Text style={styles.viewDetailsLink}>View Details</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Coupon */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Coupons</Text>
          <View style={styles.couponCard}>
            <View style={styles.couponMain}>
              <View style={styles.couponIcon}>
                <Icon name="pricetag" size={20} color="#3b82f6" />
              </View>
              <View>
                <Text style={styles.couponTitle}>Extra 100off</Text>
                <Text style={styles.couponDesc}>
                  On HDFC credit card. T & C
                </Text>
              </View>
            </View>
            <Text style={styles.appliedText}>APPLIED</Text>
          </View>
        </View>

        {/* Price Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Total Price</Text>
              <Text style={styles.priceValue}>₹12,000/-</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Discount</Text>
              <Text style={[styles.priceValue, { color: "#ef4444" }]}>
                -₹100/-
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Delivery Charge</Text>
              <Text style={[styles.priceValue, { color: "#16a34a" }]}>
                Free
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL AMOUNT</Text>
              <Text style={styles.totalValue}>₹11,900/-</Text>
            </View>
          </View>
        </View>

        {/* Payment Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Option</Text>

          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === "deposit" && styles.activePlanCard,
            ]}
            onPress={() => setSelectedPlan("deposit")}
          >
            <View style={styles.planHeader}>
              <View style={styles.radioRow}>
                <View
                  style={[
                    styles.radio,
                    selectedPlan === "deposit" && styles.radioActive,
                  ]}
                >
                  {selectedPlan === "deposit" && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.planName}>PAY DEPOSIT</Text>
              </View>
              <Text style={styles.planPrice}>2,000/-</Text>
            </View>
            <Text style={styles.planDesc}>
              Secure by paying deposit and pay after full amount at the event
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === "full" && styles.activePlanCard,
            ]}
            onPress={() => setSelectedPlan("full")}
          >
            <View style={styles.planHeader}>
              <View style={styles.radioRow}>
                <View
                  style={[
                    styles.radio,
                    selectedPlan === "full" && styles.radioActive,
                  ]}
                >
                  {selectedPlan === "full" && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.planName}>PAY FULL AMOUNT NOW</Text>
              </View>
              <Text style={styles.planPrice}>₹12,000/-</Text>
            </View>
            <Text style={styles.planDesc}>
              Pay all amount today you will all set! No additional payment
              required
            </Text>
          </TouchableOpacity>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Address</Text>
          <TouchableOpacity
            style={styles.addressCard}
            onPress={() => navigation.navigate("AddressListView")}
            activeOpacity={0.7}
          >
            <View style={styles.editBtn}>
              <Icon name="pencil" size={14} color="#1a1a1b" />
            </View>
            <Text style={styles.addressName}>Banu Elson</Text>
            <Text style={styles.addressText}>
              Flat 302, Shanti Apartments, Lajpat Nagar,{"\n"}New Delhi - 110024
            </Text>
            <Text style={styles.mobileText}>
              Mobile: <Text style={styles.mobileValue}>9823456367</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Make Payment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Make Payment</Text>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card No.</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Card number"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                />
                <Icon name="card" size={20} color="#9ca3af" />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expiration Date</Text>
              <TextInput
                placeholder="MM/YY"
                placeholderTextColor="#9ca3af"
                style={styles.simpleInput}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Security Date</Text>
              <TextInput
                placeholder="CVC"
                placeholderTextColor="#9ca3af"
                style={styles.simpleInput}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Country</Text>
              <TouchableOpacity style={styles.selectWrapper}>
                <Text style={styles.selectText}>India</Text>
                <Icon name="chevron-down" size={18} color="#9ca3af" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerPriceLabel}>TOTAL PRICE</Text>
          <Text style={styles.footerPrice}>₹12000</Text>
        </View>
        <TouchableOpacity style={styles.bookNowBtn} onPress={handlePayment}>
          <Text style={styles.bookNowText}>Book Now</Text>
          <Icon name="arrow-forward" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {showSuccessModal && renderSuccessModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  wishlistBtn: {
    backgroundColor: "#FBF6E9",
    padding: 8,
    borderRadius: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    marginBottom: 24,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#c9a24d",
  },
  tabText: {
    fontSize: 16,
    color: "#9ca3af",
    fontWeight: "700",
  },
  activeTabText: {
    color: "#c9a24d",
  },
  serviceItem: {
    flexDirection: "row",
    padding: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 16,
    gap: 16,
    marginBottom: 24,
    backgroundColor: "#fff",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  serviceImage: {
    width: 96,
    height: 96,
    borderRadius: 12,
  },
  serviceInfo: {
    flex: 1,
    justifyContent: "space-between",
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9ca3af",
  },
  serviceMeta: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "700",
  },
  viewDetailsLink: {
    fontSize: 11,
    color: "#c9a24d",
    fontWeight: "700",
    textDecorationLine: "underline",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
  },
  couponCard: {
    backgroundColor: "rgba(239, 246, 255, 0.4)",
    borderWidth: 1,
    borderColor: "#dbeafe",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  couponMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  couponIcon: {
    width: 24,
    height: 24,
  },
  couponTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
  },
  couponDesc: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "700",
  },
  appliedText: {
    color: "#3b82f6",
    fontSize: 12,
    fontWeight: "700",
  },
  priceBreakdown: {
    gap: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  priceValue: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1f2937",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1f2937",
  },
  planCard: {
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  activePlanCard: {
    borderColor: "#22c55e",
    backgroundColor: "rgba(240, 253, 244, 0.4)",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#d1d5db",
    justifyContent: "center",
    alignItems: "center",
  },
  radioActive: {
    borderColor: "#22c55e",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22c55e",
  },
  planName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1f2937",
  },
  planPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#c9a24d",
  },
  planDesc: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: "700",
    paddingLeft: 32,
    lineHeight: 14,
  },
  addressCard: {
    backgroundColor: "rgba(249, 250, 251, 0.5)",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 16,
    padding: 16,
    position: "relative",
  },
  editBtn: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  addressName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "700",
    lineHeight: 18,
    marginBottom: 4,
  },
  mobileText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1f2937",
  },
  mobileValue: {
    color: "#9ca3af",
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#1f2937",
  },
  simpleInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    fontSize: 14,
    color: "#1f2937",
  },
  selectWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: "#fff",
  },
  selectText: {
    fontSize: 14,
    color: "#1f2937",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    backgroundColor: "#fff",
  },
  footerPriceLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#9ca3af",
  },
  footerPrice: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1f2937",
  },
  bookNowBtn: {
    backgroundColor: "#c9a24d",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  bookNowText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
  },
  successIconWrapper: {
    marginBottom: 20,
  },
  wavyCircle: {
    width: 80,
    height: 80,
    backgroundColor: "#55A665",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    transform: [{ rotate: "45deg" }],
  },
  congratsTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1b",
    marginBottom: 16,
  },
  congratsSubtext: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 24,
  },
  trackOrderBtn: {
    backgroundColor: "#c9a24d",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  trackOrderBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default ServiceCheckout;
