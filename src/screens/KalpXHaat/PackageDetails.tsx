import { useNavigation, useRoute } from "@react-navigation/native";
import React, { useState } from "react";
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

const { width } = Dimensions.get("window");

const PackageDetails = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const [selectedSlot, setSelectedSlot] = useState("10.00 PM - 12.00 PM");

    const packageName = "Basic Package";
    const serviceImage = require("../../../assets/service-card.png");
    const totalPrice = 12000;
    const deposit = 2000;

    const availableSlots = [
        "6.00 AM - 8.00 AM",
        "6.00 PM - 8.00 PM",
        "10.00 PM - 12.00 PM",
        "02.00 PM - 4.00 PM",
    ];

    const included = [
        "Traditional theme setup",
        "LED string lighting & diyas",
        "Entrance toran & backdrop",
    ];

    const excluded = [
        "Floral rangoli setup at entrance",
        "Setup & takedown assistance",
        "Personal Expenses",
    ];

    const addOns = [
        {
            name: "Extra rose flower",
            desc: "Extra rose Flower",
            price: 200,
            selected: true,
        },
        {
            name: "Extra Lighting",
            desc: "Extra Lighting",
            price: 1000,
            selected: false,
        },
    ];

    const highlights = [
        "Elegant, minimal Diwali-themed setup",
        "Quick 1-hour installation",
        "Ideal for home or small gatherings",
        "Traditional aesthetic with floral and diya elements",
        "Budget-friendly festive makeover",
        "Free cancellation up to 24 hours before service",
    ];

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Section */}
                <View style={styles.header}>
                    <Image source={serviceImage} style={styles.headerImage} />

                    <View style={styles.topButtons}>
                        <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <Icon name="arrow-back" size={20} color="#1a1a1b" />
                        </TouchableOpacity>

                        <View style={styles.rightButtons}>
                            <TouchableOpacity style={styles.iconBtn}>
                                <Icon name="heart-outline" size={20} color="#1a1a1b" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.iconBtn, { marginLeft: 12 }]}
                                onPress={() => navigation.navigate("HaatCart")}
                            >
                                <Icon name="cart-outline" size={20} color="#1a1a1b" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Content Section */}
                <View style={styles.content}>
                    {/* Title and Badge */}
                    <View style={styles.titleRow}>
                        <Text style={styles.packageName}>{packageName}</Text>
                        <View style={styles.packageBadge}>
                            <Text style={styles.packageBadgeText}>PremiumPackage</Text>
                        </View>
                    </View>

                    {/* Price Card */}
                    <View style={styles.priceCard}>
                        <Text style={styles.totalPriceText}>
                            Total Price: ₹{totalPrice.toLocaleString()}/-
                        </Text>
                        <Text style={styles.depositText}>
                            Deposit : ₹{deposit.toLocaleString()}
                        </Text>
                    </View>

                    {/* Reserve Bookings */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Reserve your bookings</Text>
                        <View style={styles.dateGrid}>
                            <View style={styles.dateField}>
                                <Text style={styles.dateLabel}>From</Text>
                                <View style={styles.dateInputWrapper}>
                                    <Text style={styles.dateValue}>10/12/2021</Text>
                                    <Icon name="calendar-outline" size={18} color="#9ca3af" />
                                </View>
                            </View>
                            <View style={styles.dateField}>
                                <Text style={styles.dateLabel}>To</Text>
                                <View style={styles.dateInputWrapper}>
                                    <Text style={styles.dateValue}>10/12/2021</Text>
                                    <Icon name="calendar-outline" size={18} color="#9ca3af" />
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Available Slots */}
                    <View style={styles.section}>
                        <Text style={styles.sectionHeading}>Available Slots</Text>
                        <View style={styles.slotsGrid}>
                            {availableSlots.map((slot) => (
                                <TouchableOpacity
                                    key={slot}
                                    style={[
                                        styles.slotBtn,
                                        selectedSlot === slot && styles.activeSlotBtn,
                                    ]}
                                    onPress={() => setSelectedSlot(slot)}
                                >
                                    <Text
                                        style={[
                                            styles.slotText,
                                            selectedSlot === slot && styles.activeSlotText,
                                        ]}
                                    >
                                        {slot}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Included / Excluded */}
                    <View style={styles.gridSection}>
                        <View style={styles.column}>
                            <Text style={styles.sectionHeading}>What is Included</Text>
                            <View style={styles.list}>
                                {included.map((item) => (
                                    <View key={item} style={styles.listItem}>
                                        <View style={styles.checkCircle}>
                                            <Icon name="checkmark" size={10} color="#22c55e" />
                                        </View>
                                        <Text style={styles.listText}>{item}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        <View style={styles.column}>
                            <Text style={styles.sectionHeading}>What is Excluded</Text>
                            <View style={styles.list}>
                                {excluded.map((item) => (
                                    <View key={item} style={styles.listItem}>
                                        <View style={styles.xCircle}>
                                            <Icon name="close" size={10} color="#ef4444" />
                                        </View>
                                        <Text style={styles.listText}>{item}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>

                    {/* Add Ons */}
                    <View style={styles.section}>
                        <Text style={styles.sectionHeading}>Add Ons</Text>
                        <View style={styles.addOnsList}>
                            {addOns.map((addon) => (
                                <View key={addon.name} style={styles.addOnItem}>
                                    <View style={styles.addOnLeft}>
                                        <View style={styles.addOnIcon}>
                                            <Icon name={addon.selected ? "checkmark" : "add"} size={14} color="#1a1a1b" />
                                        </View>
                                        <View>
                                            <Text style={styles.addonName}>{addon.name}</Text>
                                            <Text style={styles.addonDesc}>{addon.desc}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.addonPriceTag}>
                                        <Text style={styles.addonPrice}>₹{addon.price}/-</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Highlights */}
                    <View style={styles.section}>
                        <Text style={styles.sectionHeading}>Highlights of Package</Text>
                        <View style={styles.highlightsList}>
                            {highlights.map((hl) => (
                                <View key={hl} style={styles.hlItem}>
                                    <Text style={styles.hlBullet}>•</Text>
                                    <Text style={styles.hlText}>{hl}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View>
                    <Text style={styles.totalPriceLabel}>TOTAL PRICE</Text>
                    <Text style={styles.finalPrice}>₹{totalPrice.toLocaleString()}</Text>
                </View>
                <TouchableOpacity
                    style={styles.bookBtn}
                    onPress={() => navigation.navigate("HaatCart")}
                >
                    <Text style={styles.bookBtnText}>Book Now</Text>
                    <Icon name="arrow-forward" size={18} color="#fff" />
                </TouchableOpacity>
            </View>
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
        height: 230,
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
        padding: 8,
        borderRadius: 8,
        width: 36,
        height: 36,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        padding: 16,
        paddingBottom: 40,
    },
    titleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
    },
    packageName: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1f2937",
    },
    packageBadge: {
        backgroundColor: "#E9F0FF",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
    },
    packageBadgeText: {
        color: "#1E56A0",
        fontSize: 12,
        fontWeight: "700",
    },
    priceCard: {
        backgroundColor: "#FBF6E9",
        borderRadius: 16,
        padding: 12,
        marginBottom: 30,
    },
    totalPriceText: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1f2937",
        marginBottom: 4,
    },
    depositText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#4b5563",
    },
    section: {
        marginBottom: 30,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#1f2937",
        marginBottom: 16,
    },
    sectionHeading: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1f2937",
        marginBottom: 16,
    },
    dateGrid: {
        flexDirection: "row",
        gap: 16,
    },
    dateField: {
        flex: 1,
    },
    dateLabel: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1f2937",
        marginBottom: 8,
    },
    dateInputWrapper: {
        backgroundColor: "#f3f4f6",
        height: 48,
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
    },
    dateValue: {
        fontSize: 14,
        color: "#6b7280",
    },
    slotsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    slotBtn: {
        width: "48%",
        backgroundColor: "#FBF6E9",
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "transparent",
    },
    activeSlotBtn: {
        borderColor: "#c9a24d",
    },
    slotText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#374151",
    },
    activeSlotText: {
        color: "#1a1a1b",
        fontWeight: "600",
    },
    gridSection: {
        marginBottom: 30,
        gap: 24,
    },
    listItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 12,
    },
    column: {
        flex: 1,
    },
    list: {
        gap: 4,
    },
    checkCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#22c55e",
        justifyContent: "center",
        alignItems: "center",
    },
    xCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ef4444",
        justifyContent: "center",
        alignItems: "center",
    },
    listText: {
        fontSize: 14,
        color: "#4b5563",
        fontWeight: "500",
    },
    addOnsList: {
        gap: 16,
    },
    addOnItem: {
        backgroundColor: "#f9fafb",
        borderRadius: 12,
        padding: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    addOnLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
    },
    addOnIcon: {
        width: 32,
        height: 32,
        backgroundColor: "#FBF6E9",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(201, 162, 77, 0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    addonName: {
        fontSize: 15,
        fontWeight: "700",
        color: "#1f2937",
    },
    addonDesc: {
        fontSize: 12,
        color: "#9ca3af",
        fontWeight: "500",
    },
    addonPriceTag: {
        borderWidth: 1,
        borderColor: "#c9a24d",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    addonPrice: {
        color: "#c9a24d",
        fontSize: 12,
        fontWeight: "700",
    },
    highlightsList: {
        gap: 8,
    },
    hlBullet: {
        color: "#9ca3af",
        fontSize: 18,
        marginTop: -4,
    },
    hlItem: {
        flexDirection: "row",
        gap: 8,
        alignItems: "flex-start",
    },
    hlText: {
        fontSize: 14,
        color: "#4b5563",
        fontWeight: "500",
        lineHeight: 20,
        flex: 1,
    },
    bottomBar: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        paddingBottom: 30,
        borderTopWidth: 1,
        borderTopColor: "#f3f4f6",
    },
    totalPriceLabel: {
        fontSize: 10,
        fontWeight: "700",
        color: "#9ca3af",
    },
    finalPrice: {
        fontSize: 24,
        fontWeight: "800",
        color: "#1f2937",
    },
    bookBtn: {
        backgroundColor: "#c9a24d",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
    },
    bookBtnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});

export default PackageDetails;
