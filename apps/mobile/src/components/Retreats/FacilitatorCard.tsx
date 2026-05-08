import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

interface FacilitatorCardProps {
    name?: string;
    role?: string;
    rating?: string;
    reviews?: string;
    exp?: string;
    tags?: string[];
    languages?: string;
    description?: string;
    image?: any;
}

const FacilitatorCard: React.FC<FacilitatorCardProps> = ({
    name = "Riya Dyne",
    role = "Meditation Teacher",
    rating = "4.9",
    reviews = "76 Reviews",
    exp = "10+ Exp",
    tags = ['Ayurveda', 'Meditation', 'Yoga'],
    languages = "English, Hindi",
    description = "Retreats are curated by certified wellness specialists....",
    image = require('../../../assets/retreat/retreat2.jpg')
}) => {
    return (
        <View style={styles.container}>
            {/* Top Row: Avatar/Name & Stats */}
            <View style={styles.topRow}>
                {/* Left Side: Avatar then Name/Role below */}
                <View style={styles.leftCol}>
                    <Image source={image} style={styles.avatar} />
                    <View style={styles.nameContainer}>
                        <Text style={styles.name}>{name}</Text>
                        <Text style={styles.role}>{role}</Text>
                    </View>
                </View>

                {/* Right Side: Stats with Dividers */}
                <View style={styles.statsCol}>
                    <View style={styles.statItem}>
                        <FontAwesome name="star" size={12} color="#909090" style={styles.statIcon} />
                        <Text style={styles.statValueBold}>{rating}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.statItem}>
                        <FontAwesome name="commenting-o" size={12} color="#909090" style={styles.statIcon} />
                        <Text style={styles.statValue}>{reviews}</Text>
                    </View>
                    <View style={styles.divider} />

                    <View style={styles.statItem}>
                        <FontAwesome name="briefcase" size={12} color="#909090" style={styles.statIcon} />
                        <Text style={styles.statValue}>{exp}</Text>
                    </View>
                </View>
            </View>

            {/* Tags Row */}
            <View style={styles.tagsContainer}>
                <FontAwesome name="bookmark" size={14} color="#F4B400" style={styles.awardIcon} />
                <View style={styles.tagList}>
                    {tags.map((tag, index) => (
                        <View key={index} style={styles.tagBadge}>
                            <Text style={styles.tagText}>{tag}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Languages Row */}
            <View style={styles.langRow}>
                <FontAwesome name="globe" size={14} color="#4A90E2" style={styles.langIcon} />
                <Text style={styles.langText}>{languages}</Text>
            </View>

            {/* Description */}
            <Text style={styles.description}>
                {description}
                <Text style={styles.viewMore}> View more</Text>
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    leftCol: {
        flex: 1,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#f5f5f5',
    },
    nameContainer: {
        marginTop: 12,
    },
    name: {
        fontSize: 18,
        fontFamily: 'GelicaBold',
        color: '#000',
        lineHeight: 22,
    },
    role: {
        fontSize: 16,
        fontFamily: 'GelicaMedium',
        color: '#707070',
        marginTop: 2,
    },
    statsCol: {
        width: 100,
        gap: 8,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statIcon: {
        width: 16,
        marginRight: 8,
    },
    statValue: {
        fontSize: 14,
        fontFamily: 'GelicaMedium',
        color: '#707070',
    },
    statValueBold: {
        fontSize: 14,
        fontFamily: 'GelicaBold',
        color: '#333',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEEEEE',
        width: '100%',
    },
    tagsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    awardIcon: {
        marginRight: 8,
    },
    tagList: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tagBadge: {
        backgroundColor: '#FFF6E5',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    tagText: {
        fontSize: 16,
        fontFamily: 'GelicaMedium',
        color: '#333',
    },
    langRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
    },
    langIcon: {
        marginRight: 8,
    },
    langText: {
        fontSize: 14,
        fontFamily: 'GelicaMedium',
        color: '#707070',
    },
    description: {
        fontSize: 14,
        fontFamily: 'GelicaMedium',
        color: '#707070',
        lineHeight: 20,
        marginTop: 12,
    },
    viewMore: {
        fontFamily: 'GelicaBold',
        color: '#333',
    },
});

export default FacilitatorCard;
