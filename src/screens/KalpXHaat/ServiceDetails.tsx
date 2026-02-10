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
import ReviewRatings from "./ReviewRatings";

const { width } = Dimensions.get("window");

const ServiceDetails = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { id } = route.params || { id: 1 };
    const [selectedPackageId, setSelectedPackageId] = useState(1);

    // Mock data for services
    const services = [
        {
            id: 1,
            name: "Diwali Decoration",
            image: "https://images.unsplash.com/photo-1519225495810-75123321954b?q=80&w=600&h=400&auto=format&fit=crop",
            rating: "4.0",
            description: "Festive Diwali decoration with lights, floral arrangements, rangoli, and traditional décor to create an auspicious atmosphere at home or temple.",
            location: "Chennai",
        },
    ];

    const packages = [
        {
            id: 1,
            name: "Basic Package",
            price: 12000,
            features: [
                "Traditional theme setup",
                "LED string lighting & diyas",
                "Entrance toran & backdrop",
                "On-site setup and cleanup",
            ],
        },
        {
            id: 2,
            name: "Advance Package",
            price: 20000,
            features: [
                "Premium Diwali theme setup",
                "LED lights, lanterns, and diyas",
                "Floral entrance arch & stage backdrop",
                "Cleanup and material pickup included",
            ],
        },
    ];

    const service = services.find((s) => s.id === id) || services[0];

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Image Section */}
                <View style={styles.header}>
                    <Image source={{ uri: service.image }} style={styles.headerImage} />

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
                            >
                                <Icon name="cart-outline" size={22} color="#1a1a1b" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Content Area */}
                <View style={styles.content}>
                    {/* Title and Rating */}
                    <View style={styles.mainTitleRow}>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <View style={styles.ratingBadge}>
                            <Icon name="star" size={12} color="#fff" />
                            <Text style={styles.ratingText}>{service.rating}+</Text>
                        </View>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Description:</Text>
                        <Text style={styles.descriptionText}>{service.description}</Text>
                    </View>

                    <View style={styles.divider} />

                    {/* Additional Details */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Additional Details</Text>
                        <View style={styles.detailsGrid}>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailKey}>Setup Time</Text>
                                <Text style={styles.detailValue}>2-3 Hours</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailKey}>Service Mode</Text>
                                <Text style={styles.detailValue}>At Your Location</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailKey}>Team Size</Text>
                                <Text style={styles.detailValue}>2 Members</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.detailKey}>Cleanup Included</Text>
                                <Text style={styles.detailValue}>Yes</Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* Package Details */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Package Details</Text>

                        <View style={styles.packagesList}>
                            {packages.map((pkg) => (
                                <View key={pkg.id} style={styles.packageCard}>
                                    {/* Package Header */}
                                    <View style={styles.packageHeader}>
                                        <Text style={styles.packageName}>{pkg.name}</Text>
                                        <View>
                                            <Text style={styles.priceLabel}>Price</Text>
                                            <Text style={styles.packagePrice}>₹{pkg.price.toLocaleString()}</Text>
                                        </View>
                                    </View>

                                    {/* Features */}
                                    <View style={styles.featuresList}>
                                        {pkg.features.map((feature, idx) => (
                                            <View key={idx} style={styles.featureRow}>
                                                <Icon name="checkmark" size={14} color="#3b82f6" />
                                                <Text style={styles.featureText}>{feature}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {/* Package Actions */}
                                    <View style={styles.packageActions}>
                                        <TouchableOpacity
                                            style={[
                                                styles.selectBtn,
                                                selectedPackageId === pkg.id && styles.selectedBtn
                                            ]}
                                            onPress={() => setSelectedPackageId(pkg.id)}
                                        >
                                            <Text style={[
                                                styles.selectBtnText,
                                                selectedPackageId === pkg.id && styles.selectedBtnText
                                            ]}>
                                                {selectedPackageId === pkg.id ? "Selected" : "Select Package"}
                                            </Text>
                                            {selectedPackageId === pkg.id && (
                                                <Icon name="checkmark" size={16} color="#fff" style={{ marginLeft: 6 }} />
                                            )}
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.pViewDetailsBtn}
                                            onPress={() => navigation.navigate("PackageDetails", { id: pkg.id })}
                                        >
                                            <Text style={styles.pViewDetailsText}>View Details</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Bottom Actions */}
                    <View style={styles.bottomActions}>
                        <TouchableOpacity style={styles.addToCartBtn}>
                            <Icon name="cart-outline" size={20} color="#D4A017" />
                            <Text style={styles.addToCartText}>Add to Cart</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.bookNowBtn}
                            onPress={() => navigation.navigate("HaatCart")}
                        >
                            <Text style={styles.bookNowText}>Book Now</Text>
                            <Icon name="arrow-forward" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    <ReviewRatings />
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
        paddingBottom: 60,
    },
    mainTitleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 16,
    },
    serviceName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1f2937",
        flex: 1,
        marginRight: 10,
    },
    ratingBadge: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#387F31",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    ratingText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#1f2937",
        marginBottom: 12,
    },
    descriptionText: {
        fontSize: 15,
        color: "#6b7280",
        lineHeight: 24,
    },
    divider: {
        height: 1,
        backgroundColor: "#f3f4f6",
        marginVertical: 16,
    },
    detailsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 20,
    },
    detailItem: {
        width: "45%",
    },
    detailKey: {
        fontSize: 14,
        color: "#9ca3af",
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1f2937",
    },
    packagesList: {
        gap: 16,
    },
    packageCard: {
        borderWidth: 1,
        borderColor: "#f3f4f6",
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#fff",
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    packageHeader: {
        backgroundColor: "#FBF6E9",
        padding: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    packageName: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1f2937",
    },
    priceLabel: {
        fontSize: 10,
        color: "#9ca3af",
    },
    packagePrice: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1a1a1b",
    },
    featuresList: {
        padding: 16,
        gap: 12,
    },
    featureRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    featureText: {
        fontSize: 14,
        color: "#4b5563",
    },
    packageActions: {
        padding: 16,
        paddingTop: 0,
        flexDirection: "row",
        gap: 12,
    },
    selectBtn: {
        flex: 1,
        backgroundColor: "#D4A017",
        paddingVertical: 10,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
    },
    selectedBtn: {
        backgroundColor: "#D4A017",
    },
    selectBtnText: {
        color: "#fff",
        fontSize: 14,
        fontWeight: "bold",
    },
    selectedBtnText: {
        color: "#fff",
    },
    pViewDetailsBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        paddingVertical: 10,
        borderRadius: 8,
        justifyContent: "center",
        alignItems: "center",
    },
    pViewDetailsText: {
        color: "#6b7280",
        fontSize: 14,
        fontWeight: "bold",
    },
    bottomActions: {
        flexDirection: "row",
        gap: 16,
        marginTop: 8,
    },
    addToCartBtn: {
        flex: 1,
        borderWidth: 2,
        borderColor: "#D4A017",
        borderRadius: 12,
        paddingVertical: 14,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
    },
    addToCartText: {
        color: "#D4A017",
        fontSize: 16,
        fontWeight: "bold",
    },
    bookNowBtn: {
        flex: 1,
        backgroundColor: "#D4A017",
        borderRadius: 12,
        paddingVertical: 14,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 8,
    },
    bookNowText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default ServiceDetails;
