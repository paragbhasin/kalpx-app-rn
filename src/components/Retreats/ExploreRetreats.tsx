import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    StyleSheet,
    Pressable,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import RetreatCard from './RetreatCard';

const CATEGORIES = [
    "All Retreats",
    "Yoga",
    "Ayurveda",
    "Bhakti & Stastang",
    "Meditation",
];

const DUMMY_RETREATS = [
    {
        slug: "rejuvenating-yoga-ayurvedic-retreat",
        title: "Rejuvenating yoga & Ayurvedic Retreat",
        tagline: "A gentle 7-day wellness journey to help you to the pause, reset your mind that mindful....",
        cheapest_price_minor: 1000000,
        location: { city: "Kerala" },
        rating_avg: 4.9,
        rating_count: 223,
        badge: { text: "Only 10 spot left. Hurry!", type: "urgency" as const },
        formatted_date_range: "Available all year round",
    },
    {
        slug: "sattva-renewal-retreat",
        title: "Sattva Renewal Retreat",
        tagline: "A calming wellness retreat focused on balance, mindfulness, and inner which help .....",
        cheapest_price_minor: 333000,
        location: { city: "Kerala" },
        rating_avg: 4.9,
        rating_count: 223,
        badge: { text: "20% off for first time user", type: "offer" as const },
        formatted_date_range: "Available all year round",
    },
    {
        slug: "ayura-serenity-retreat",
        title: "Ayura Serenity Retreat",
        tagline: "A holistic Ayurvedic retreat offering guided healing, rest, and mindful experience...",
        cheapest_price_minor: 2000000,
        location: { city: "Kerala" },
        rating_avg: 4.9,
        rating_count: 223,
        formatted_date_range: "Available all year round",
    },
];

const ExploreRetreats: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState("All Retreats");

    return (
        <View style={styles.container}>
            {/* Search Bar */}
            <View style={styles.searchRow}>
                <View style={styles.searchWrapper}>
                    <FontAwesome name="search" size={16} color="#707070" style={styles.searchIcon} />
                    <TextInput
                        placeholder="Search retreats here....."
                        style={styles.searchInput}
                        placeholderTextColor="#909090"
                    />
                </View>
                <Pressable style={styles.sliderButton}>
                    <FontAwesome name="sliders" size={20} color="#707070" />
                </Pressable>
            </View>

            {/* Category Chips */}
            <View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.categoryScroll}
                >
                    {CATEGORIES.map((cat) => (
                        <Pressable
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            style={[
                                styles.categoryChip,
                                selectedCategory === cat && styles.activeCategoryChip,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.categoryText,
                                    selectedCategory === cat && styles.activeCategoryText,
                                ]}
                            >
                                {cat}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Section Title */}
            <Text style={styles.sectionTitle}>Upcoming Retreats</Text>

            {/* Retreats List */}
            <View style={styles.retreatsList}>
                {DUMMY_RETREATS.map((retreat, index) => (
                    <RetreatCard key={index} retreat={retreat} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },
    searchRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
        marginBottom: 20,
    },
    searchWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 50,
    },
    searchIcon: {
        marginRight: 12,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'GelicaMedium',
        color: '#333',
    },
    sliderButton: {
        width: 56,
        height: 49,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryScroll: {
        paddingBottom: 16,
        gap: 12,
    },
    categoryChip: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#EEEEEE',
        borderRadius: 12,
        paddingHorizontal: 24,
        paddingVertical: 10,
    },
    activeCategoryChip: {
        backgroundColor: '#F7F0DD',
        borderColor: '#F1EAD9',
    },
    categoryText: {
        fontSize: 15,
        fontFamily: 'GelicaBold',
        color: '#707070',
    },
    activeCategoryText: {
        color: '#2b2b2b',
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: 'GelicaBold',
        color: '#000',
        marginBottom: 16,
        marginTop: 8,
    },
    retreatsList: {
        paddingBottom: 40,
    },
});

export default ExploreRetreats;
