import { useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const PaymentDetails = () => {
    const navigation = useNavigation<any>();
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleBuyNow = () => {
        setShowSuccessModal(true);
    };

    const handleTrackOrder = () => {
        setShowSuccessModal(false);
        navigation.navigate("HaatCart", { tab: "orders" });
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#1a1a1b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Payment Details</Text>
                <TouchableOpacity style={styles.wishlistBtn}>
                    <Icon name="heart-outline" size={22} color="#1a1a1b" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Address Section */}
                <TouchableOpacity
                    style={styles.addressCard}
                    onPress={() => navigation.navigate("AddressListView")}
                    activeOpacity={0.7}
                >
                    <View style={styles.addressHeader}>
                        <Text style={styles.sectionTitle}>Address</Text>
                        <View>
                            <Icon name="pencil" size={18} color="#1a1a1b" />
                        </View>
                    </View>
                    <View style={styles.addressInfo}>
                        <Text style={styles.userName}>Banu Elson</Text>
                        <Text style={styles.addressBody}>
                            Flat 302, Shanti Apartments, Lajpat Nagar, New Delhi – 110024
                        </Text>
                        <Text style={styles.mobileText}>Mobile: <Text style={styles.mobileValue}>9823456367</Text></Text>
                    </View>
                </TouchableOpacity>

                {/* Payment Method Selection */}
                <Text style={styles.mainSectionTitle}>Payment Method</Text>
                <View style={styles.paymentMethodsRow}>
                    <TouchableOpacity
                        style={[
                            styles.methodBtn,
                            paymentMethod === "cash" && styles.activeMethodBtn
                        ]}
                        onPress={() => setPaymentMethod("cash")}
                    >
                        <View style={styles.methodContent}>
                            <Icon name="cash-outline" size={20} color={paymentMethod === "cash" ? "#c9a24d" : "#6b7280"} />
                            <Text style={[styles.methodText, paymentMethod === "cash" && styles.activeMethodText]}>
                                Cash on Delivery
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.methodBtn,
                            paymentMethod === "card" && styles.activeMethodBtn
                        ]}
                        onPress={() => setPaymentMethod("card")}
                    >
                        <View style={styles.methodContent}>
                            <Icon name="card-outline" size={20} color={paymentMethod === "card" ? "#c9a24d" : "#6b7280"} />
                            <Text style={[styles.methodText, paymentMethod === "card" && styles.activeMethodText]}>
                                Card Payment
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Make Payment Section (Card Inputs) */}
                {paymentMethod === "card" && (
                    <View style={styles.makePaymentSection}>
                        <Text style={styles.mainSectionTitle}>Make Payment</Text>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Card No.</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    placeholder="Card number"
                                    placeholderTextColor="#9ca3af"
                                    style={styles.input}
                                />
                                <Icon name="card" size={20} color="#6b7280" />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Expiration Date</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    placeholder="MM/YY"
                                    placeholderTextColor="#9ca3af"
                                    style={styles.input}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Security Date</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    placeholder="CVC"
                                    placeholderTextColor="#9ca3af"
                                    style={styles.input}
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Country</Text>
                            <TouchableOpacity style={styles.inputWrapper}>
                                <Text style={styles.inputText}>India</Text>
                                <Icon name="chevron-down" size={20} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow}>
                    <Text style={styles.buyNowText}>Buy Now</Text>
                </TouchableOpacity>
            </View>

            {/* Success Modal */}
            {showSuccessModal && (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.successIconWrapper}>
                            <View style={styles.wavyCircle}>
                                <Icon name="checkmark" size={40} color="#fff" />
                            </View>
                        </View>

                        <Text style={styles.congratsTitle}>Congratulation</Text>
                        <Text style={styles.congratsSubtext}>
                            Thank you! Your order has been successfully placed. We'll share the confirmation details with you shortly
                        </Text>

                        <TouchableOpacity style={styles.trackOrderBtn} onPress={handleTrackOrder}>
                            <Text style={styles.trackOrderBtnText}>Track my order</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F9F9F9",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
        backgroundColor: "#fff",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1b",
    },
    wishlistBtn: {
        backgroundColor: "#F7F0DD",
        padding: 8,
        borderRadius: 8,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 100,
    },
    addressCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: "#f3f4f6",
    },
    addressHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1a1a1b",
    },
    addressInfo: {
        gap: 4,
    },
    userName: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1a1a1b",
    },
    addressBody: {
        fontSize: 14,
        color: "#4b5563",
        lineHeight: 20,
    },
    mobileText: {
        fontSize: 14,
        color: "#4b5563",
        marginTop: 4,
    },
    mobileValue: {
        fontWeight: "600",
        color: "#1a1a1b",
    },
    mainSectionTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1b",
        marginBottom: 16,
    },
    paymentMethodsRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    methodBtn: {
        flex: 1,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 10,
    },
    activeMethodBtn: {
        backgroundColor: "#FBF6E9",
        borderColor: "#c9a24d",
    },
    methodContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
    },
    methodText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6b7280",
    },
    activeMethodText: {
        color: "#1a1a1b",
    },
    makePaymentSection: {
        marginTop: 8,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 8,
    },
    inputWrapper: {
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        height: 50,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: "#1a1a1b",
    },
    inputText: {
        flex: 1,
        fontSize: 15,
        color: "#1a1a1b",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        padding: 16,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: "#eee",
    },
    buyNowBtn: {
        backgroundColor: "#c9a24d",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    buyNowText: {
        color: "#fff",
        fontSize: 18,
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
        borderRadius: 25, // Making it slightly square-wavy like the mockup
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

export default PaymentDetails;
