import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const ReviewRatings = () => {
    const ratingBreakdown = [
        { star: 5, percent: 75 },
        { star: 4, percent: 55 },
        { star: 3, percent: 30 },
        { star: 2, percent: 10 },
        { star: 1, percent: 5 },
    ];

    const reviews = [
        {
            id: 1,
            name: "Courtney Henry",
            date: "11 Dec 2025",
            rating: 5,
            text: "Beautifully crafted brass diyas. The finish is premium and they light up the pooja",
            avatar: "https://randomuser.me/api/portraits/women/44.jpg",
            image: "https://images.unsplash.com/photo-1602928321679-560bb453f190?q=80&w=200",
        },
        {
            id: 2,
            name: "Courtney Henry",
            date: "09 Dec 2025",
            rating: 4,
            text: "Good quality and well packed. Worth the price.",
            avatar: "https://randomuser.me/api/portraits/women/45.jpg",
        },
    ];

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Review & Ratings</Text>

            {/* Rating Summary */}
            <View style={styles.summaryCard}>
                {/* Left: Rating Bars */}
                <View style={styles.barsContainer}>
                    {ratingBreakdown.map((item) => (
                        <View key={item.star} style={styles.barRow}>
                            <Text style={styles.barLabel}>{item.star}</Text>
                            <Icon name="star" size={12} color="#facc15" />
                            <View style={styles.progressBar}>
                                <View
                                    style={[styles.progressFill, { width: `${item.percent}%` }]}
                                />
                            </View>
                        </View>
                    ))}
                </View>

                {/* Right: Overall Rating */}
                <View style={styles.overallContainer}>
                    <Text style={styles.bigRating}>4.0</Text>
                    <View style={styles.starsRow}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Icon
                                key={i}
                                name="star"
                                size={14}
                                color={i <= 4 ? "#facc15" : "#e5e7eb"}
                            />
                        ))}
                    </View>
                    <Text style={styles.reviewCount}>132 Reviews</Text>
                </View>
            </View>

            {/* Reviews List */}
            <View style={styles.reviewsList}>
                {reviews.map((review) => (
                    <View key={review.id} style={styles.reviewCard}>
                        <View style={styles.reviewHeader}>
                            <View style={styles.userInfo}>
                                <Image source={{ uri: review.avatar }} style={styles.avatar} />
                                <View>
                                    <Text style={styles.userName}>{review.name}</Text>
                                    <Text style={styles.postDate}>Posted on {review.date}</Text>
                                </View>
                            </View>
                            <View style={styles.starsRow}>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <Icon
                                        key={i}
                                        name="star"
                                        size={12}
                                        color={i <= review.rating ? "#facc15" : "#e5e7eb"}
                                    />
                                ))}
                            </View>
                        </View>

                        <Text style={styles.reviewText}>
                            {review.text}{" "}
                            <Text style={styles.moreText}>...More</Text>
                        </Text>

                        {review.image && (
                            <Image source={{ uri: review.image }} style={styles.reviewImage} />
                        )}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    title: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1a1a1b",
        marginBottom: 16,
    },
    summaryCard: {
        backgroundColor: "#f9fafb",
        borderRadius: 16,
        padding: 16,
        flexDirection: "row",
        gap: 20,
    },
    barsContainer: {
        flex: 1,
        gap: 8,
    },
    barRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    barLabel: {
        fontSize: 12,
        width: 8,
        color: "#4b5563",
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: "#e5e7eb",
        borderRadius: 4,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: "#6b7280",
        borderRadius: 4,
    },
    overallContainer: {
        width: 100,
        alignItems: "center",
        justifyContent: "center",
        borderLeftWidth: 1,
        borderLeftColor: "#e5e7eb",
        paddingLeft: 10,
    },
    bigRating: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#111827",
    },
    starsRow: {
        flexDirection: "row",
        gap: 2,
        marginTop: 4,
    },
    reviewCount: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 4,
    },
    reviewsList: {
        marginTop: 20,
        gap: 16,
    },
    reviewCard: {
        borderWidth: 1,
        borderColor: "#f3f4f6",
        borderRadius: 16,
        padding: 12,
    },
    reviewHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    userInfo: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    userName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#111827",
    },
    postDate: {
        fontSize: 12,
        color: "#9ca3af",
    },
    reviewText: {
        fontSize: 14,
        color: "#374151",
        marginTop: 12,
        lineHeight: 20,
    },
    moreText: {
        color: "#6b7280",
        fontWeight: "600",
    },
    reviewImage: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginTop: 12,
    },
});

export default ReviewRatings;
