import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Pressable,
    Dimensions,
    SafeAreaView,
    StatusBar,
    ImageBackground,
    FlatList,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import FacilitatorCard from '../../components/Retreats/FacilitatorCard';

const { width } = Dimensions.get('window');

const TABS = [
    { id: 'summary', label: 'Summary' },
    { id: 'facilitator', label: 'Guides' },
    { id: 'packages', label: 'Packages' },
    { id: 'policies', label: 'Policies' },
    { id: 'tips', label: 'Tips' },
    { id: 'addons', label: 'Add Ons' },
    { id: 'address', label: 'Address' },
    { id: 'reviews', label: 'Reviews' },
];

const PACKAGES = [
    {
        name: "Advance Package",
        price: "₹10,000/-",
        popular: true,
        inclusions: [
            "Meals Included",
            "3 Days",
            "Breakfast, Lunch, Dinner Included",
            "For 1 person only",
        ],
    },
    {
        name: "Beginner Friendly",
        price: "₹3,300/-",
        popular: false,
        inclusions: [
            "Meals Included",
            "5 Days",
            "Breakfast, Lunch, Dinner Included",
            "For 2 person only",
        ],
    },
];

const ADDONS = [
    {
        name: "Airport Pickup",
        description: "Comfortable Airport Pickup",
        price: "₹4000/-",
        icon: "plane",
    },
    {
        name: "Gluten Free Meal",
        description: "Special dietary preference",
        price: "₹1500/-",
        icon: "plus",
    },
];

const POLICIES = [
    "A deposit is required to confirm your booking.",
    "The remaining amount must be paid before the retreat start date.",
    "Cancellations made after this period may result in partial or no refund.",
];

const TIPS = [
    "Carry comfortable cotton clothing.",
    "Inform facilitators about any health conditions.",
    "Digital detox is encouraged during the sessions.",
];

const REVIEWS = [
    {
        user: "Ramesh Khair",
        date: "2 days ago",
        comment: "Amazing experience! Enjoyed every day here. The teacher is very good and the atmosphere is very peaceful.",
        rating: 5,
        images: [
            require('../../../assets/retreat/retreat1.jpg'),
            require('../../../assets/retreat/retreat2.jpg'),
        ]
    }
];

const RetreatDetailsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute();
    const [activeTab, setActiveTab] = useState('summary');
    const [imgIndex, setImgIndex] = useState(0);
    const scrollRef = useRef<ScrollView>(null);
    const sectionOffsets = useRef<{ [key: string]: number }>({});

    const gallery = [
        require('../../../assets/retreat/retreat1.jpg'),
        require('../../../assets/retreat/retreat2.jpg'),
        require('../../../assets/retreat/landing1.png'),
    ];

    const handleScrollTo = (id: string) => {
        setActiveTab(id);
        const y = sectionOffsets.current[id];
        if (y !== undefined) {
            scrollRef.current?.scrollTo({ y, animated: true });
        }
    };

    const handleLayout = (id: string, y: number) => {
        sectionOffsets.current[id] = y;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Custom Back Button Header */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
            </View>

            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[1]}
            >
                {/* Hero section with Carousel */}
                <View style={styles.heroContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={(e) => {
                            const index = Math.round(e.nativeEvent.contentOffset.x / width);
                            setImgIndex(index);
                        }}
                    >
                        {gallery.map((img, i) => (
                            <Image key={i} source={img} style={styles.heroImage} />
                        ))}
                    </ScrollView>

                    {/* Carousel Pagination */}
                    <View style={styles.pagination}>
                        {gallery.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    imgIndex === i ? styles.activeDot : styles.inactiveDot
                                ]}
                            />
                        ))}
                    </View>
                </View>

                {/* Sticky Tabs */}
                <View style={styles.tabContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tabScrollContent}
                    >
                        {TABS.map((tab) => (
                            <Pressable
                                key={tab.id}
                                onPress={() => handleScrollTo(tab.id)}
                                style={[styles.tab, activeTab === tab.id && styles.activeTab]}
                            >
                                <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                                    {tab.label}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>

                {/* Main Content Sections */}
                <View style={styles.content}>
                    <Text style={styles.title}>Rejuvenating yoga & Ayurvedic Retreat</Text>

                    {/* Summary Section */}
                    <View
                        onLayout={(e) => handleLayout('summary', e.nativeEvent.layout.y)}
                        style={styles.section}
                    >
                        <Text style={styles.sectionTitle}>Summary of Retreats</Text>
                        <Text style={styles.description}>
                            This retreat is designed to offer a structured and comfortable experience focused on mindful living and personal wellness journey that helps you to find peace and rejuvenation.
                            <Text style={styles.moreText}> More</Text>
                        </Text>
                    </View>

                    {/* Facilitator Section */}
                    <View
                        onLayout={(e) => handleLayout('facilitator', e.nativeEvent.layout.y)}
                        style={styles.section}
                    >
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Your Guides</Text>
                            <Pressable><Text style={styles.viewAllText}>View all</Text></Pressable>
                        </View>
                        <FacilitatorCard />
                    </View>

                    {/* Packages Section */}
                    <View
                        onLayout={(e) => handleLayout('packages', e.nativeEvent.layout.y)}
                        style={styles.section}
                    >
                        <Text style={styles.sectionTitle}>Package Details</Text>
                        {PACKAGES.map((pkg, i) => (
                            <View key={i} style={styles.packageCard}>
                                {pkg.popular && (
                                    <View style={styles.popularBadge}>
                                        <Text style={styles.popularText}>Most Popular</Text>
                                    </View>
                                )}
                                <View style={styles.packageHeader}>
                                    <Text style={styles.packageName}>{pkg.name}</Text>
                                    <Text style={styles.packagePrice}>{pkg.price}</Text>
                                </View>
                                {pkg.inclusions.map((inc, j) => (
                                    <View key={j} style={styles.inclusionRow}>
                                        <FontAwesome name="check-circle" size={16} color="#43BC6C" />
                                        <Text style={styles.inclusionText}>{inc}</Text>
                                    </View>
                                ))}
                                <Pressable
                                    style={styles.bookButton}
                                    onPress={() => navigation.navigate('RetreatPackage', { pkg, retreat: { title: 'Rejuvenating yoga & Ayurvedic Retreat' } })}
                                >
                                    <Text style={styles.bookButtonText}>Book Now</Text>
                                </Pressable>
                            </View>
                        ))}
                    </View>

                    {/* Policies Section */}
                    <View
                        onLayout={(e) => handleLayout('policies', e.nativeEvent.layout.y)}
                        style={styles.section}
                    >
                        <Text style={styles.sectionTitle}>Policies</Text>
                        {POLICIES.map((p, i) => (
                            <View key={i} style={styles.policyRow}>
                                <View style={styles.policyBullet}>
                                    <FontAwesome name="check" size={10} color="#43BC6C" />
                                </View>
                                <Text style={styles.policyText}>{p}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Tips Section */}
                    <View
                        onLayout={(e) => handleLayout('tips', e.nativeEvent.layout.y)}
                        style={styles.section}
                    >
                        <Text style={styles.sectionTitle}>Tips & Advisory</Text>
                        {TIPS.map((t, i) => (
                            <View key={i} style={styles.tipRow}>
                                <View style={styles.tipDot} />
                                <Text style={styles.tipText}>{t}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Addons Section */}
                    <View
                        onLayout={(e) => handleLayout('addons', e.nativeEvent.layout.y)}
                        style={styles.section}
                    >
                        <Text style={styles.sectionTitle}>Add Ons</Text>
                        {ADDONS.map((addon, i) => (
                            <View key={i} style={styles.addonCard}>
                                <View style={styles.addonIconContainer}>
                                    <FontAwesome name={addon.icon as any} size={18} color="#D4A017" />
                                </View>
                                <View style={styles.addonInfo}>
                                    <Text style={styles.addonName}>{addon.name}</Text>
                                    <Text style={styles.addonDesc}>{addon.description}</Text>
                                </View>
                                <View style={styles.addonPriceBadge}>
                                    <Text style={styles.addonPriceText}>{addon.price}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    {/* Address Section */}
                    <View
                        onLayout={(e) => handleLayout('address', e.nativeEvent.layout.y)}
                        style={styles.section}
                    >
                        <Text style={styles.sectionTitle}>Address Details</Text>
                        <View style={styles.mapPlaceholder}>
                            <Image
                                source={require('../../../assets/retreat/landing1.png')}
                                style={styles.mapImage}
                            />
                            <View style={styles.mapOverlay} />
                        </View>
                        <View style={styles.addressCard}>
                            <View style={styles.addressRow}>
                                <Ionicons name="location" size={20} color="#D4A017" />
                                <Text style={styles.addressText}>
                                    KalpX Wellness Retreat, Vythiri, Wayanad, Kerala - 673576
                                </Text>
                            </View>
                            <View style={styles.addressDivider} />
                            <View>
                                <Text style={styles.airportLabel}>NEAREST AIRPORT</Text>
                                <Text style={styles.airportName}>Calicut International Airport (CCJ)</Text>
                                <Text style={styles.airportDist}>Distance: 85km</Text>
                            </View>
                        </View>
                    </View>

                    {/* Reviews Section */}
                    <View
                        onLayout={(e) => handleLayout('reviews', e.nativeEvent.layout.y)}
                        style={styles.section}
                    >
                        <Text style={styles.sectionTitle}>Reviews</Text>
                        {REVIEWS.map((r, i) => (
                            <View key={i} style={styles.reviewCard}>
                                <View style={styles.reviewHeader}>
                                    <View style={styles.userInfo}>
                                        <View style={styles.avatarPlaceholder}>
                                            <Text style={styles.avatarLetter}>{r.user[0]}</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.userName}>{r.user}</Text>
                                            <Text style={styles.reviewDate}>{r.date}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.starsRow}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <FontAwesome key={s} name="star" size={12} color="#D4A017" />
                                        ))}
                                    </View>
                                </View>
                                <Text style={styles.reviewText}>{r.comment}</Text>
                                <View style={styles.reviewImages}>
                                    {r.images.map((img, j) => (
                                        <Image key={j} source={img} style={styles.reviewImage} />
                                    ))}
                                </View>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 100,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    heroContainer: {
        width: width,
        height: 300,
    },
    heroImage: {
        width: width,
        height: 300,
        resizeMode: 'cover',
    },
    pagination: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        width: 24,
        backgroundColor: '#fff',
    },
    inactiveDot: {
        width: 8,
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    tabContainer: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    tabScrollContent: {
        paddingHorizontal: 16,
    },
    tab: {
        paddingVertical: 16,
        paddingHorizontal: 12,
        marginRight: 8,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#D4A017',
    },
    tabText: {
        fontSize: 14,
        fontFamily: 'GelicaBold',
        color: '#707070',
    },
    activeTabText: {
        color: '#000',
    },
    content: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontFamily: 'GelicaBold',
        color: '#000',
        marginBottom: 24,
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'GelicaBold',
        color: '#000',
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    description: {
        fontSize: 15,
        fontFamily: 'GelicaMedium',
        color: '#707070',
        lineHeight: 22,
    },
    moreText: {
        color: '#D4A017',
        fontFamily: 'GelicaBold',
    },
    viewAllText: {
        fontSize: 13,
        fontFamily: 'GelicaBold',
        color: '#707070',
    },
    packageCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        padding: 24,
        marginBottom: 16,
        position: 'relative',
        overflow: 'hidden',
    },
    popularBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#D4A017',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderBottomLeftRadius: 16,
    },
    popularText: {
        color: '#fff',
        fontSize: 11,
        fontFamily: 'GelicaBold',
    },
    packageHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    packageName: {
        fontSize: 18,
        fontFamily: 'GelicaBold',
        color: '#000',
        maxWidth: '60%',
    },
    packagePrice: {
        fontSize: 20,
        fontFamily: 'GelicaBold',
        color: '#D4A017',
    },
    inclusionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    inclusionText: {
        fontSize: 14,
        fontFamily: 'GelicaMedium',
        color: '#707070',
    },
    bookButton: {
        backgroundColor: '#D4A017',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'GelicaBold',
    },
    policyRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 12,
    },
    policyBullet: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1,
        borderColor: '#43BC6C',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    policyText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'GelicaMedium',
        color: '#707070',
        lineHeight: 20,
    },
    tipRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
        gap: 16,
    },
    tipDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#D4A017',
        marginTop: 8,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'GelicaMedium',
        color: '#707070',
        lineHeight: 20,
    },
    addonCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDFCF9',
        borderWidth: 1,
        borderColor: '#F1EAD9',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    addonIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#F1EAD9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addonInfo: {
        flex: 1,
        marginLeft: 16,
    },
    addonName: {
        fontSize: 16,
        fontFamily: 'GelicaBold',
        color: '#000',
    },
    addonDesc: {
        fontSize: 12,
        fontFamily: 'GelicaMedium',
        color: '#909090',
        marginTop: 2,
    },
    addonPriceBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(212,160,23,0.1)',
        backgroundColor: 'transparent',
    },
    addonPriceText: {
        fontSize: 14,
        fontFamily: 'GelicaBold',
        color: '#D4A017',
    },
    mapPlaceholder: {
        width: '100%',
        height: 200,
        borderRadius: 24,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        marginBottom: 16,
    },
    mapImage: {
        width: '100%',
        height: '100%',
        opacity: 0.5,
    },
    mapOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(74, 144, 226, 0.05)',
    },
    addressCard: {
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        backgroundColor: '#fff',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
    },
    addressText: {
        flex: 1,
        fontSize: 15,
        fontFamily: 'GelicaBold',
        color: '#000',
        lineHeight: 20,
    },
    addressDivider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginVertical: 16,
    },
    airportLabel: {
        fontSize: 11,
        fontFamily: 'GelicaBold',
        color: '#909090',
        letterSpacing: 1,
        marginBottom: 8,
    },
    airportName: {
        fontSize: 14,
        fontFamily: 'GelicaBold',
        color: '#000',
    },
    airportDist: {
        fontSize: 13,
        fontFamily: 'GelicaMedium',
        color: '#707070',
        marginTop: 2,
    },
    reviewCard: {
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        backgroundColor: '#fff',
        marginBottom: 16,
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarPlaceholder: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FDFCF9',
        borderWidth: 1,
        borderColor: '#F1EAD9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarLetter: {
        fontSize: 18,
        fontFamily: 'GelicaBold',
        color: '#D4A017',
    },
    userName: {
        fontSize: 15,
        fontFamily: 'GelicaBold',
        color: '#000',
    },
    reviewDate: {
        fontSize: 12,
        fontFamily: 'GelicaBold',
        color: '#909090',
    },
    starsRow: {
        flexDirection: 'row',
        gap: 2,
    },
    reviewText: {
        fontSize: 15,
        fontFamily: 'GelicaMedium',
        color: '#707070',
        lineHeight: 22,
    },
    reviewImages: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    reviewImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#fff',
    },
});

export default RetreatDetailsScreen;
