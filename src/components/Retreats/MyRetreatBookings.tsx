import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Pressable,
    Dimensions,
    TextInput,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isDesktop = width > 1024;

const CATEGORIES = ['All Retreats', 'Confirmed', 'Requested'];

const FILTER_GROUPS = [
    { name: 'Category', options: ['All Retreats', 'Yoga', 'Ayurveda', 'Bhakti & Stastang', 'Meditation'] },
    { name: 'Language', options: ['Hindi', 'English', 'Urdu'] },
    { name: 'Diet', options: ['Gluten Free', 'Ayurvedic', 'Vegetarian'] },
    { name: 'Amenities', options: ['Spa', 'Mountain View', 'Fitness Center'] },
];

const BOOKINGS = [
    {
        id: 1,
        title: "Rejuvenating yoga & Ayurvedic Retreat",
        description: "A gentle 7-day wellness journey to help you to the pause, reset your mind that mindful....",
        location: "Kerala",
        dates: "26-28 Dec 2025",
        status: "Confirmed",
        image: require('../../../assets/retreat/retreat1.jpg'),
        facilitator: { name: "Riya Dyne", avatar: require('../../../assets/retreat/retreat2.jpg') },
    },
    {
        id: 2,
        title: "Rejuvenating yoga & Ayurvedic Retreat",
        description: "A gentle 7-day wellness journey to help you to the pause, reset your mind that mindful....",
        location: "Kerala",
        dates: "26-28 Dec 2025",
        status: "Payment Due",
        image: require('../../../assets/retreat/retreat1.jpg'),
        facilitator: { name: "Riya Dyne", avatar: require('../../../assets/retreat/retreat2.jpg') },
    },
    {
        id: 3,
        title: "Rejuvenating yoga & Ayurvedic Retreat",
        description: "A gentle 7-day wellness journey to help you to the pause, reset your mind that mindful....",
        location: "Kerala",
        dates: "26-28 Dec 2025",
        status: "Requested",
        image: require('../../../assets/retreat/retreat1.jpg'),
        facilitator: { name: "Riya Dyne", avatar: require('../../../assets/retreat/retreat2.jpg') },
    },
    {
        id: 4,
        title: "Rejuvenating yoga & Ayurvedic Retreat",
        description: "A gentle 7-day wellness journey to help you to the pause, reset your mind that mindful....",
        location: "Kerala",
        dates: "26-28 Dec 2025",
        status: "Cancelled",
        image: require('../../../assets/retreat/retreat1.jpg'),
        facilitator: { name: "Riya Dyne", avatar: require('../../../assets/retreat/retreat2.jpg') },
    },
];

const MyRetreatBookings: React.FC = () => {
    const navigation = useNavigation<any>();
    const [activeTab, setActiveTab] = useState('All Retreats');

    const filteredBookings = BOOKINGS.filter(b => {
        if (activeTab === 'All Retreats') return true;
        return b.status === activeTab;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Confirmed': return { color: '#43BC6C' };
            case 'Payment Due': return { color: '#1877F2' };
            case 'Requested': return { color: '#D4A017' };
            case 'Cancelled': return { color: '#FF4D4D' };
            default: return { color: '#707070' };
        }
    };

    const renderCard = (booking: any) => (
        <View key={booking.id} style={[styles.card, isDesktop && styles.desktopCard]}>
            <View style={styles.imageContainer}>
                <Image source={booking.image} style={styles.cardImage} />

                {booking.id === 1 && (
                    <View style={[styles.badge, { backgroundColor: '#748DCE' }]}>
                        <Text style={styles.badgeText}>Only 10 spot left. Hurry!</Text>
                    </View>
                )}
                {booking.id === 2 && (
                    <View style={[styles.badge, { backgroundColor: '#43BC6C' }]}>
                        <Text style={styles.badgeText}>20% off for first time user</Text>
                    </View>
                )}

                <View style={styles.facilitatorOverlay}>
                    <Image source={booking.facilitator.avatar} style={styles.facilitatorAvatar} />
                    <View>
                        <Text style={styles.facilitatorName}>
                            {booking.facilitator.name} <Text style={styles.expText}>(10+Exp)</Text>
                        </Text>
                        <Text style={styles.facilitatorRole}>Facilitator</Text>
                    </View>
                </View>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.bookingTitle}>{booking.title}</Text>
                <Text style={styles.bookingDesc} numberOfLines={2}>
                    {booking.description} <Text style={styles.moreLink}>More</Text>
                </Text>

                <View style={styles.metaGrid}>
                    <View style={styles.metaItem}>
                        <Ionicons name="location" size={14} color="#D4A017" />
                        <Text style={styles.metaText}>{booking.location}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <FontAwesome name="star" size={12} color="#D4A017" />
                        <Text style={styles.metaText}>4.9(223)</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="globe" size={14} color="#D4A017" />
                        <Text style={styles.metaText}>English, Hindi</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="calendar" size={14} color="#D4A017" />
                        <Text style={styles.metaText}>{booking.dates}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View>
                        <Text style={[styles.statusText, getStatusStyle(booking.status)]}>
                            {booking.status}
                        </Text>
                        {booking.status === 'Payment Due' && (
                            <Text style={styles.dueSubtext}>7 days left only</Text>
                        )}
                    </View>
                    <Pressable
                        style={styles.viewButton}
                        onPress={() => navigation.navigate('RetreatBookingDetails', { bookingId: booking.id })}
                    >
                        <Text style={styles.viewButtonText}>View Details</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );

    const renderSidebar = () => (
        <View style={styles.sidebar}>
            {/* Search */}
            <View style={styles.sidebarSection}>
                <Text style={styles.sidebarTitle}>Search Your Retreats</Text>
                <View style={styles.searchWrapper}>
                    <Ionicons name="search" size={18} color="#909090" />
                    <TextInput placeholder="Search retreats here....." style={styles.searchInput} />
                </View>
                <Pressable style={styles.sidebarButton}>
                    <Text style={styles.sidebarButtonText}>Check Availability</Text>
                </Pressable>
            </View>

            {/* Availability */}
            <View style={styles.sidebarSection}>
                <Text style={styles.sidebarCapsTitle}>AVAILABILITY</Text>
                <View style={styles.dateInputWrapper}>
                    <Text style={styles.dateLabel}>From</Text>
                    <View style={styles.dateInput}>
                        <Text style={styles.dateText}>Select Date</Text>
                        <Ionicons name="calendar-outline" size={16} color="#909090" />
                    </View>
                </View>
                <View style={styles.dateInputWrapper}>
                    <Text style={styles.dateLabel}>To</Text>
                    <View style={styles.dateInput}>
                        <Text style={styles.dateText}>Select Date</Text>
                        <Ionicons name="calendar-outline" size={16} color="#909090" />
                    </View>
                </View>
            </View>

            {/* Price Range */}
            <View style={styles.sidebarSection}>
                <Text style={styles.sidebarCapsTitle}>PRICE RANGE</Text>
                <View style={styles.rangeTrack}>
                    <View style={styles.rangePoint} />
                    <View style={[styles.rangePoint, { right: 0 }]} />
                </View>
                <View style={styles.rangeLabels}>
                    <Text style={styles.rangeLabel}>₹0</Text>
                    <Text style={styles.rangeLabel}>₹40,000</Text>
                </View>
            </View>

            {/* Filter Groups */}
            {FILTER_GROUPS.map(group => (
                <View key={group.name} style={styles.sidebarSection}>
                    <View style={styles.groupHeader}>
                        <Text style={styles.sidebarCapsTitle}>{group.name.toUpperCase()}</Text>
                        <Ionicons name="chevron-down" size={14} color="#909090" />
                    </View>
                    <View style={styles.groupOptions}>
                        {group.options.map(opt => (
                            <View key={opt} style={styles.optionRow}>
                                <Text style={styles.optionText}>{opt}</Text>
                                <View style={styles.checkbox} />
                            </View>
                        ))}
                    </View>
                </View>
            ))}
        </View>
    );

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Mobile Tabs (only on mobile) */}
            {!isDesktop && (
                <View style={styles.mobileTabs}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
                        {CATEGORIES.map(tab => (
                            <Pressable
                                key={tab}
                                style={[styles.mobileTab, activeTab === tab && styles.activeMobileTab]}
                                onPress={() => setActiveTab(tab)}
                            >
                                <Text style={[styles.mobileTabText, activeTab === tab && styles.activeMobileTabText]}>
                                    {tab}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            )}

            <View style={[styles.mainLayout, isDesktop && styles.desktopLayout]}>
                {isDesktop && renderSidebar()}

                <View style={styles.contentArea}>
                    {!isDesktop && <Text style={styles.headerTitle}>Upcoming Retreats</Text>}

                    <View style={[styles.bookingGrid, isDesktop && styles.desktopBookingGrid]}>
                        {filteredBookings.map(renderCard)}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    mainLayout: {
        paddingHorizontal: 16,
    },
    desktopLayout: {
        flexDirection: 'row',
        paddingHorizontal: 40,
        gap: 32,
        paddingTop: 32,
    },
    sidebar: {
        width: 280,
        gap: 24,
    },
    sidebarSection: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    sidebarTitle: {
        fontSize: 16,
        fontFamily: 'GelicaBold',
        color: '#000',
        marginBottom: 16,
    },
    sidebarCapsTitle: {
        fontSize: 12,
        fontFamily: 'GelicaBold',
        color: '#000',
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 44,
        gap: 10,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'GelicaMedium',
        color: '#000',
    },
    sidebarButton: {
        backgroundColor: '#D4A017',
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sidebarButtonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'GelicaBold',
    },
    dateInputWrapper: {
        marginBottom: 12,
    },
    dateLabel: {
        fontSize: 12,
        fontFamily: 'GelicaBold',
        color: '#707070',
        marginBottom: 6,
    },
    dateInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        paddingHorizontal: 16,
        height: 44,
    },
    dateText: {
        fontSize: 14,
        fontFamily: 'GelicaMedium',
        color: '#909090',
    },
    rangeTrack: {
        height: 4,
        backgroundColor: '#EBEBEB',
        position: 'relative',
        marginVertical: 10,
    },
    rangePoint: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#D4A017',
        position: 'absolute',
        top: -6,
    },
    rangeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    rangeLabel: {
        fontSize: 12,
        fontFamily: 'GelicaBold',
        color: '#707070',
    },
    groupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    groupOptions: {
        marginTop: 8,
        gap: 12,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 14,
        fontFamily: 'GelicaMedium',
        color: '#2b2b2b',
    },
    checkbox: {
        width: 18,
        height: 18,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    contentArea: {
        flex: 1,
    },
    mobileTabs: {
        paddingHorizontal: 16,
        paddingVertical: 20,
    },
    tabScroll: {
        gap: 12,
    },
    mobileTab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    activeMobileTab: {
        backgroundColor: '#FCF8F0',
        borderColor: '#D4A017',
    },
    mobileTabText: {
        fontSize: 14,
        fontFamily: 'GelicaBold',
        color: '#707070',
    },
    activeMobileTabText: {
        color: '#D4A017',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'GelicaBold',
        color: '#000',
        marginBottom: 20,
    },
    bookingGrid: {
        gap: 24,
        paddingBottom: 40,
    },
    desktopBookingGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 28,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
        width: '100%',
    },
    desktopCard: {
        width: (width - 280 - 112) / 2, // 2 cards per row on desktop
    },
    imageContainer: {
        height: 200,
        width: '100%',
        position: 'relative',
    },
    cardImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    badge: {
        position: 'absolute',
        top: 16,
        left: 16,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontFamily: 'GelicaBold',
    },
    facilitatorOverlay: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 6,
        paddingRight: 12,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    facilitatorAvatar: {
        width: 36,
        height: 36,
        borderRadius: 8,
    },
    facilitatorName: {
        fontSize: 12,
        fontFamily: 'GelicaBold',
        color: '#000',
    },
    expText: {
        fontSize: 10,
        color: '#707070',
        fontFamily: 'GelicaMedium',
    },
    facilitatorRole: {
        fontSize: 10,
        color: '#707070',
        fontFamily: 'GelicaBold',
    },
    cardContent: {
        padding: 20,
    },
    bookingTitle: {
        fontSize: 16,
        fontFamily: 'GelicaBold',
        color: '#000',
        marginBottom: 8,
    },
    bookingDesc: {
        fontSize: 14,
        fontFamily: 'GelicaMedium',
        color: '#707070',
        lineHeight: 20,
        marginBottom: 16,
    },
    moreLink: {
        color: '#D4A017',
        fontFamily: 'GelicaBold',
    },
    metaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        minWidth: '45%',
    },
    metaText: {
        fontSize: 13,
        fontFamily: 'GelicaBold',
        color: '#2b2b2b',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    statusText: {
        fontSize: 16,
        fontFamily: 'GelicaBold',
    },
    dueSubtext: {
        fontSize: 12,
        fontFamily: 'GelicaMedium',
        color: '#707070',
        marginTop: 2,
    },
    viewButton: {
        backgroundColor: '#D4A017',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        shadowColor: '#D4A017',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    viewButtonText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'GelicaBold',
    },
});

export default MyRetreatBookings;
