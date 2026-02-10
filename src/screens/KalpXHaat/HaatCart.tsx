import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState, useEffect } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import ProductCard from "./ProductCard";
import ServiceCard from "./ServiceCard";

const HaatCart = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const [activeTab, setActiveTab] = useState("cart");

    useEffect(() => {
        if (route.params?.tab) {
            setActiveTab(route.params.tab);
        }
    }, [route.params]);

    const renderPriceDetails = (total: number, discount: number, final: number) => (
        <View style={styles.priceSection}>
            <Text style={styles.sectionTitle}>Price Details</Text>
            <View style={styles.priceCard}>
                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Total MRP</Text>
                    <Text style={styles.priceValue}>₹{total.toLocaleString()}</Text>
                </View>
                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Discount</Text>
                    <Text style={[styles.priceValue, styles.discountText]}>-₹{discount.toLocaleString()}</Text>
                </View>
                <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Delivery Charges</Text>
                    <Text style={[styles.priceValue, { color: "#16a34a" }]}>Free</Text>
                </View>
                <View style={styles.divider} />
                <View style={[styles.priceRow, { marginTop: 4 }]}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalValue}>₹{final.toLocaleString()}</Text>
                </View>
            </View>
        </View>
    );

    const renderCartTab = () => {
        if (route.params?.type === "service") {
            return (
                <View style={styles.tabContent}>
                    <ServiceCard fromCart={true} />

                    {/* Payment Plans specific to services */}
                    <View style={styles.servicePlansSection}>
                        <Text style={styles.sectionTitle}>Payment Option</Text>
                        <TouchableOpacity style={[styles.planCard, styles.activePlanCard]}>
                            <View style={styles.planHeader}>
                                <View style={styles.radioRow}>
                                    <View style={[styles.radio, styles.radioActive]}>
                                        <View style={styles.radioInner} />
                                    </View>
                                    <Text style={styles.planName}>PAY DEPOSIT</Text>
                                </View>
                                <Text style={styles.planPrice}>2,000/-</Text>
                            </View>
                            <Text style={styles.planDesc}>Secure by paying deposit and pay after full amount at the event</Text>
                        </TouchableOpacity>
                    </View>

                    {renderPriceDetails(12000, 100, 11900)}

                    <TouchableOpacity
                        style={styles.buyNowBtn}
                        onPress={() => navigation.navigate("ServiceCheckout")}
                    >
                        <Text style={styles.buyNowText}>Proceed to Checkout</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.tabContent}>
                <ProductCard fromCart={true} />

                <View style={styles.offerSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Coupon & bank offer</Text>
                        <TouchableOpacity>
                            <Text style={styles.viewAllText}>View all</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.couponCard}>
                        <View style={styles.couponHeader}>
                            <View style={styles.couponTitleRow}>
                                <Icon name="pricetag-outline" size={18} color="#1a1a1b" />
                                <Text style={styles.couponTitle}>Extra 91.65 off</Text>
                            </View>
                            <Text style={styles.appliedText}>Applied</Text>
                        </View>
                        <Text style={styles.couponSubtext}>
                            On minimum spend of 100. T & C
                        </Text>
                    </View>
                </View>

                {renderPriceDetails(2500, 91.65, 2408.35)}

                <TouchableOpacity
                    style={styles.buyNowBtn}
                    onPress={() => navigation.navigate("PaymentDetails")}
                >
                    <Text style={styles.buyNowText}>Buy Now</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderOrdersTab = () => (
        <View style={styles.tabContent}>
            {route.params?.type === "service" ? (
                <ServiceCard fromCart={true} fromOrder={true} />
            ) : (
                <ProductCard fromCart={true} fromOrder={true} />
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Icon name="arrow-back" size={24} color="#1a1a1b" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Your Cart</Text>
                <TouchableOpacity style={styles.wishlistBtn}>
                    <Icon name="heart-outline" size={22} color="#1a1a1b" />
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "cart" && styles.activeTab]}
                    onPress={() => setActiveTab("cart")}
                >
                    <Text style={[styles.tabText, activeTab === "cart" && styles.activeTabText]}>
                        My Cart
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === "orders" && styles.activeTab]}
                    onPress={() => setActiveTab("orders")}
                >
                    <Text style={[styles.tabText, activeTab === "orders" && styles.activeTabText]}>
                        My Orders
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {activeTab === "cart" ? renderCartTab() : renderOrdersTab()}
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
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
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
    tabBar: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    tab: {
        flex: 1,
        paddingVertical: 14,
        alignItems: "center",
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: "#c9a24d",
    },
    tabText: {
        fontSize: 16,
        color: "#6b7280",
        fontWeight: "600",
    },
    activeTabText: {
        color: "#c9a24d",
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    tabContent: {
        flex: 1,
    },
    offerSection: {
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#000",
    },
    viewAllText: {
        fontSize: 14,
        color: "#6b7280",
    },
    couponCard: {
        backgroundColor: "#F8F8F8",
        borderWidth: 1,
        borderColor: "#DBD9D9",
        borderRadius: 8,
        padding: 12,
    },
    couponHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    couponTitleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    couponTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#000",
    },
    appliedText: {
        color: "#1877F2",
        fontSize: 15,
        fontWeight: "600",
    },
    couponSubtext: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 4,
        marginLeft: 26,
    },
    priceSection: {
        marginTop: 24,
    },
    priceCard: {
        backgroundColor: "#F8F8F8",
        borderRadius: 8,
        padding: 12,
        marginTop: 12,
    },
    priceRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    priceLabel: {
        fontSize: 14,
        color: "#6b7280",
    },
    priceValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1a1a1b",
    },
    discountText: {
        color: "#16a34a",
    },
    divider: {
        height: 1,
        backgroundColor: "#DBD9D9",
        marginVertical: 8,
    },
    totalLabel: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1a1a1b",
    },
    totalValue: {
        fontSize: 14,
        fontWeight: "700",
        color: "#1a1a1b",
    },
    buyNowBtn: {
        backgroundColor: "#c9a24d",
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 24,
    },
    buyNowText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    servicePlansSection: {
        marginTop: 24,
    },
    planCard: {
        borderWidth: 1,
        borderColor: "#f3f4f6",
        borderRadius: 16,
        padding: 12,
        marginTop: 12,
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
});

export default HaatCart;
