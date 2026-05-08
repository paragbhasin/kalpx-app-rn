import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const RetreatBookingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { pkg, retreat } = route.params || {};

  const [paymentType, setPaymentType] = useState<"deposit" | "full">("deposit");
  const [showSuccess, setShowSuccess] = useState(false);

  const retreatData = retreat || {
    title: "Rejuvenating yoga & Ayurvedic Retreat",
    image: require("../../../assets/retreat/retreat1.jpg"),
  };

  const packageData = pkg || {
    name: "Beginner Friendly",
    price: "3,300",
    deposit: "1,000",
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Booking Details</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Retreat Summary Card */}
        <View style={styles.summaryCard}>
          <Image source={retreatData.image} style={styles.summaryImage} />
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>{retreatData.title}</Text>
            <View style={styles.ratingRow}>
              <Text style={styles.ratingText}>4.9(223)</Text>
              <FontAwesome name="star" size={12} color="#D4A017" />
            </View>
          </View>
        </View>

        {/* Free Cancellation Policy */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Free Cancellation</Text>
          <View style={styles.policyItem}>
            <View style={styles.dot} />
            <Text style={styles.policyText}>
              Free Cancellation before start of 30 days
            </Text>
          </View>
          <View style={styles.policyItem}>
            <View style={styles.dot} />
            <Text style={styles.policyText}>
              20% Deducted if cancelled after 30 days
            </Text>
          </View>
        </View>

        {/* Guest & Dates */}
        <View style={[styles.sectionCard, styles.dividedCard]}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>GUEST</Text>
            <Text style={styles.infoValue}>1 Person</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DATES</Text>
            <Text style={styles.infoValue}>
              From 22 Dec - 24 Dec 2025 ( 3 Days/ 2 Nights)
            </Text>
          </View>
        </View>

        {/* Coupons Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Coupons</Text>
          <View style={styles.couponRow}>
            <Text style={styles.couponLabel}>Coupon & bank offer</Text>
            <Text style={styles.viewAllText}>View all</Text>
          </View>
          <View style={styles.appliedCoupon}>
            <View style={styles.couponHeader}>
              <FontAwesome name="tag" size={16} color="#000" />
              <Text style={styles.couponName}>Extra 91.65 off</Text>
            </View>
            <Text style={styles.couponDesc}>
              On minimum spend of 100. T & C
            </Text>
            <Text style={styles.appliedText}>Applied</Text>
          </View>
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          <View style={styles.priceBreakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Package Price</Text>
              <Text style={styles.breakdownValue}>₹3,300</Text>
            </View>

            <View style={styles.addOnsSection}>
              <Text style={styles.addOnsHeader}>ADD ONS</Text>
              <View style={styles.breakdownRow}>
                <View style={styles.checkItem}>
                  <View style={styles.checkIcon}>
                    <FontAwesome name="check" size={8} color="#fff" />
                  </View>
                  <Text style={styles.breakdownLabel}>Airport Pickup</Text>
                </View>
                <Text style={styles.breakdownValue}>₹4000/-</Text>
              </View>
              <View style={styles.breakdownRow}>
                <View style={styles.checkItem}>
                  <View style={styles.checkIcon}>
                    <FontAwesome name="check" size={8} color="#fff" />
                  </View>
                  <Text style={styles.breakdownLabel}>Gluten Free Meal</Text>
                </View>
                <Text style={styles.breakdownValue}>₹2000/-</Text>
              </View>
            </View>

            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Taxes</Text>
              <Text style={styles.breakdownValue}>₹330/-</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Total Discount</Text>
              <Text style={[styles.breakdownValue, { color: "#E4405F" }]}>
                -₹200/-
              </Text>
            </View>

            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Payment</Text>
              <Text style={styles.totalValue}>₹9,430/-</Text>
            </View>
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                placeholder="Enter your first name"
                style={styles.input}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                placeholder="Enter your last name"
                style={styles.input}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Id</Text>
              <TextInput
                placeholder="Enter email -id"
                style={styles.input}
                keyboardType="email-address"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput
                placeholder="Enter your mobile number"
                style={styles.input}
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Payment Option */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Option</Text>
          <Pressable
            style={[
              styles.paymentOption,
              paymentType === "deposit" && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentType("deposit")}
          >
            <View style={styles.paymentHeader}>
              <View style={styles.radioRow}>
                <View
                  style={[
                    styles.radio,
                    paymentType === "deposit" && styles.radioActive,
                  ]}
                >
                  {paymentType === "deposit" && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.paymentLabel}>Pay Deposit</Text>
              </View>
              <Text style={styles.paymentPrice}>1,000/-</Text>
            </View>
            <Text style={styles.paymentDesc}>
              Pay depsoit now and secure your seat. Then pay 2,300 in next 7
              days
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.paymentOption,
              paymentType === "full" && styles.paymentOptionActive,
            ]}
            onPress={() => setPaymentType("full")}
          >
            <View style={styles.paymentHeader}>
              <View style={styles.radioRow}>
                <View
                  style={[
                    styles.radio,
                    paymentType === "full" && styles.radioActive,
                  ]}
                >
                  {paymentType === "full" && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.paymentLabel}>Pay full amount now</Text>
              </View>
              <Text style={styles.paymentPrice}>3,300/-</Text>
            </View>
            <Text style={styles.paymentDesc}>
              Pay all amount today you will all set! No additional payment
              required
            </Text>
          </Pressable>
        </View>

        {/* Make Payment Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Make Payment</Text>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card No.</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="Card number"
                  style={[styles.input, { flex: 1 }]}
                  keyboardType="numeric"
                />
                <FontAwesome name="credit-card" size={16} color="#909090" />
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Expiration Date</Text>
              <TextInput placeholder="MM/YY" style={styles.input} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Security Code</Text>
              <TextInput
                placeholder="CVC"
                style={styles.input}
                keyboardType="numeric"
                secureTextEntry
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Country</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  placeholder="India"
                  style={[styles.input, { flex: 1 }]}
                  editable={false}
                />
                <FontAwesome name="chevron-down" size={10} color="#909090" />
              </View>
            </View>
          </View>
        </View>

        <Pressable
          style={styles.payButton}
          onPress={() => setShowSuccess(true)}
        >
          <Text style={styles.payButtonText}>Make Payment</Text>
        </Pressable>
      </ScrollView>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Pressable
              style={styles.modalClose}
              onPress={() => setShowSuccess(false)}
            >
              <Ionicons name="close" size={24} color="#909090" />
            </Pressable>

            <View style={styles.successIconContainer}>
              <FontAwesome name="check" size={32} color="#fff" />
            </View>

            <Text style={styles.congratsText}>Payment Received</Text>
            <Text style={styles.successAmount}>
              ₹{paymentType === "deposit" ? "1,000" : "9,430"}/-
            </Text>
            <Text style={styles.successMessage}>
              Your {paymentType === "deposit" ? "Deposit" : "Payment"} has been
              received successfully
            </Text>

            <View style={styles.depositInfoBox}>
              <Text style={styles.depositInfoTitle}>
                Next Payment Due :{" "}
                <Text style={styles.depositInfoValue}>27 Dec 2026</Text>
              </Text>
              <Text style={styles.depositInfoTitle}>
                Total Payment Left :{" "}
                <Text style={styles.depositInfoHighlight}>₹8,430/-</Text>
              </Text>
              <Text style={styles.depositInfoDesc}>
                We will send you reminder 3 day before the due date
              </Text>
            </View>

            <Text style={styles.approvalText}>
              Your seat will be confirmed once the retreat owner approves your
              booking.
            </Text>

            <Pressable
              style={styles.exploreButton}
              onPress={() => {
                setShowSuccess(false);
                navigation.navigate("RetreatsScreen");
              }}
            >
              <Text style={styles.exploreButtonText}>Explore More Retreats</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "GelicaBold",
    color: "#000",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    gap: 16,
    marginBottom: 20,
  },
  summaryImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  summaryInfo: {
    flex: 1,
    justifyContent: "center",
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: "GelicaBold",
    color: "#000",
    lineHeight: 20,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: "GelicaBold",
    color: "#707070",
  },
  sectionCard: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "GelicaBold",
    color: "#000",
    marginBottom: 12,
  },
  policyItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#000",
    marginTop: 8,
  },
  policyText: {
    flex: 1,
    fontSize: 13,
    fontFamily: "GelicaMedium",
    color: "#707070",
  },
  dividedCard: {
    paddingVertical: 10,
  },
  infoRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#FDFCF9",
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: "GelicaBold",
    color: "#707070",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: "GelicaBold",
    color: "#000",
  },
  section: {
    marginBottom: 24,
  },
  couponRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  couponLabel: {
    fontSize: 15,
    fontFamily: "GelicaBold",
    color: "#000",
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "GelicaMedium",
    color: "#707070",
  },
  appliedCoupon: {
    backgroundColor: "#F8F8F8",
    borderWidth: 1,
    borderColor: "#DBD9D9",
    borderRadius: 12,
    padding: 16,
  },
  couponHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  couponName: {
    fontSize: 15,
    fontFamily: "GelicaBold",
    color: "#000",
  },
  couponDesc: {
    fontSize: 14,
    fontFamily: "GelicaMedium",
    color: "#909090",
    marginBottom: 8,
  },
  appliedText: {
    fontSize: 15,
    fontFamily: "GelicaBold",
    color: "#1877F2",
  },
  priceBreakdown: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    overflow: "hidden",
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  breakdownLabel: {
    fontSize: 15,
    fontFamily: "GelicaMedium",
    color: "#707070",
  },
  breakdownValue: {
    fontSize: 15,
    // fontFamily: "GelicaBold",
    color: "#000",
  },
  addOnsSection: {
    paddingVertical: 8,
  },
  addOnsHeader: {
    fontSize: 12,
    fontFamily: "GelicaBold",
    color: "#707070",
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#D4A017",
    justifyContent: "center",
    alignItems: "center",
  },
  totalRow: {
    backgroundColor: "#FFF9E5",
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F1EAD9",
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: "GelicaBold",
    color: "#000",
  },
  totalValue: {
    fontSize: 18,
    // fontFamily: "GelicaBold",
    color: "#000",
  },
  formContainer: {
    backgroundColor: "#f9f9f9",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    fontFamily: "GelicaBold",
    color: "#707070",
    marginBottom: 8,
  },
  input: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: "GelicaMedium",
    color: "#000",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    paddingRight: 16,
  },
  paymentOption: {
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    padding: 20,
    marginBottom: 16,
  },
  paymentOptionActive: {
    borderColor: "#D4A017",
  },
  paymentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  radioActive: {
    borderColor: "#D4A017",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#D4A017",
  },
  paymentLabel: {
    fontSize: 15,
    fontFamily: "GelicaBold",
    color: "#000",
  },
  paymentPrice: {
    fontSize: 16,
    fontFamily: "GelicaBold",
    color: "#D4A017",
  },
  paymentDesc: {
    fontSize: 13,
    fontFamily: "GelicaMedium",
    color: "#707070",
    lineHeight: 18,
    marginLeft: 32,
  },
  payButton: {
    backgroundColor: "#D4A017",
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#D4A017",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 10,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "GelicaBold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 40,
    padding: 32,
    alignItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: 24,
    right: 24,
  },
  successIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#43BC6C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 8,
    borderColor: "#E8F8EE",
    marginBottom: 24,
  },
  congratsText: {
    fontSize: 18,
    fontFamily: "GelicaBold",
    color: "#000",
    marginBottom: 8,
  },
  successAmount: {
    fontSize: 44,
    // fontFamily: "GelicaBold",
    color: "#43BC6C",
    lineHeight: 50,
  },
  successMessage: {
    fontSize: 18,
    fontFamily: "GelicaBold",
    color: "#333",
    marginBottom: 24,
  },
  depositInfoBox: {
    backgroundColor: "#FFF9E5",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#F1EAD9",
    padding: 20,
    width: "100%",
    marginBottom: 24,
  },
  depositInfoTitle: {
    fontSize: 15,
    fontFamily: "GelicaBold",
    color: "#000",
    marginBottom: 4,
  },
  depositInfoValue: {
    fontFamily: "GelicaMedium",
    color: "#707070",
  },
  depositInfoHighlight: {
    fontFamily: "GelicaMedium",
    color: "#707070",
  },
  depositInfoDesc: {
    fontSize: 13,
    fontFamily: "GelicaMedium",
    color: "#707070",
    marginTop: 8,
  },
  emailConfText: {
    fontSize: 14,
    fontFamily: "GelicaBold",
    color: "#707070",
    textAlign: "center",
    maxWidth: 250,
  },
  approvalText: {
    fontSize: 15,
    fontFamily: "GelicaMedium",
    color: "#707070",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  exploreButton: {
    backgroundColor: "#D4A017",
    width: "100%",
    height: 54,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "GelicaBold",
  },
});

export default RetreatBookingScreen;
