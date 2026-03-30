import React, { useState } from 'react';
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
    FlatList,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const ACC_FEATURES = [
    { label: "Single", icon: "bed" },
    { label: "Queen", icon: "couch" as any },
    { label: "1 Person Only", icon: "user" },
    { label: "20 sq.ft", icon: "map" },
    { label: "Free WiFi", icon: "wifi" },
    { label: "Beach View", icon: "umbrella-beach" as any },
    { label: "Mountain View", icon: "mountain" as any },
];

const SPECIAL_FEATURES = [
    "Daily yoga sessions at sunrise, sunset, indoors, and outdoors — guided by certified yoga teachers and Ayurveda doctors.",
    "Ayurveda healing through personalized diet consultations and rejuvenating therapies.",
    "Aqua yoga sessions promoting gentle, water-supported movement and deep relaxation.",
    "Therapeutic yoga designed to relieve stress, back pain, digestive imbalances, and restore natural vitality.",
];

interface ScheduleItemProps {
    day: number;
    title: string;
    isActive: boolean;
    onToggle: () => void;
}

const ScheduleItem: React.FC<ScheduleItemProps> = ({ day, title, isActive, onToggle }) => {
    const getScheduleText = (time: string) => {
        if (time === "Morning")
            return "Yoga and meditation at the Indrayani River, led by the Sattvic";
        if (time === "Afternoon")
            return "Cultural workshop — Warli art and rangoli to connect with Pune's heritage";
        return "Saree draping and aarti at Morya Gosavi Temple, dedicated to the 14th-century saint- poet";
    };

    return (
        <View style={styles.scheduleItem}>
            <Pressable onPress={onToggle} style={styles.scheduleHeader}>
                <View>
                    <Text style={styles.dayLabel}>Day {day}</Text>
                    <Text style={styles.scheduleItemTitle}>{title}</Text>
                </View>
                <FontAwesome
                    name={isActive ? "chevron-up" : "chevron-down"}
                    size={12}
                    color="#909090"
                />
            </Pressable>
            {isActive && (
                <View style={styles.scheduleContent}>
                    {['Morning', 'Afternoon', 'Evening'].map((time, i) => (
                        <View key={time} style={styles.timeSection}>
                            <View style={styles.timelineContainer}>
                                <View style={styles.timelineDot} />
                                {i < 2 && <View style={styles.timelineLine} />}
                            </View>
                            <View style={styles.timeContent}>
                                <Text style={styles.timeLabel}>{time}</Text>
                                <Text style={styles.timeDesc}>{getScheduleText(time)}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const RetreatPackageScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { pkg, retreat } = route.params || {};

    const [accImgIndex, setAccImgIndex] = useState(0);
    const [activeDay, setActiveDay] = useState<number | null>(1);

    const accGallery = [
        require('../../../assets/retreat/retreat1.jpg'),
        require('../../../assets/retreat/retreat2.jpg'),
    ];

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
                <View style={styles.headerTop}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </Pressable>
                    <Text style={styles.headerTitle} numberOfLines={1}>
                        {retreat?.title || "Rejuvenating yoga & Ayurvedic Retreat"}
                    </Text>
                </View>

                {/* Sub-Tabs (Static Mock) */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.subTabs}
                    contentContainerStyle={styles.subTabsContent}
                >
                    <View style={styles.activeSubTab}>
                        <Text style={styles.activeSubTabText}>Package Details</Text>
                    </View>
                    <Text style={styles.inactiveSubTabText}>Address Details</Text>
                    <Text style={styles.inactiveSubTabText}>Policies</Text>
                    <Text style={styles.inactiveSubTabText}>Tips and Advisory</Text>
                </ScrollView>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Package Name & Close */}
                <View style={styles.packageHeaderRow}>
                    <Text style={styles.packageNameTitle}>{packageData.name}</Text>
                    <Pressable onPress={() => navigation.goBack()} style={styles.closeButton}>
                        <Ionicons name="close" size={20} color="#909090" />
                    </Pressable>
                </View>

                {/* Price Card */}
                <View style={styles.priceCard}>
                    <Text style={styles.dateRangeText}>From 22 Dec - 24 Dec (3 days/ 2 nights)</Text>
                    <View style={styles.priceRow}>
                        <Text style={styles.totalPriceLabel}>Total Price: </Text>
                        <Text style={styles.priceValue}>₹{packageData.price}</Text>
                        <Text style={styles.perPersonText}>per person</Text>
                    </View>
                    <Text style={styles.depositText}>
                        Deposit : <Text style={styles.depositValue}>₹{packageData.deposit}</Text>
                    </Text>
                </View>

                {/* Accommodation */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Accommodation</Text>
                    <View style={styles.accCarouselContainer}>
                        <FlatList
                            data={accGallery}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            onScroll={(e) => {
                                const index = Math.round(e.nativeEvent.contentOffset.x / (width - 40));
                                setAccImgIndex(index);
                            }}
                            renderItem={({ item }) => (
                                <Image source={item} style={styles.accImage} />
                            )}
                            keyExtractor={(_, i) => i.toString()}
                        />
                        <View style={styles.accPagination}>
                            {accGallery.map((_, i) => (
                                <View
                                    key={i}
                                    style={[styles.accDot, accImgIndex === i && styles.accActiveDot]}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Features Grid */}
                    <View style={styles.featuresGrid}>
                        {ACC_FEATURES.map((feat, i) => (
                            <View key={i} style={styles.featureItem}>
                                <FontAwesome name={feat.icon as any} size={14} color="#707070" />
                                <Text style={styles.featureLabel}>{feat.label}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.sectionDivider} />

                {/* Who is this for */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Who is these Retreats for</Text>
                    <View style={styles.infoBlock}>
                        <Text style={styles.infoLabel}>Suitable for</Text>
                        <Text style={styles.infoValue}>Single</Text>
                    </View>
                    <View style={styles.infoBlock}>
                        <Text style={styles.infoLabel}>Recommended For</Text>
                        <Text style={styles.infoValue}>Beginner, Intermediate, Advance</Text>
                    </View>

                    <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Food & Dining</Text>
                    <View style={styles.infoBlock}>
                        <Text style={styles.infoLabel}>Meal Type</Text>
                        <Text style={styles.infoValue}>Ayurveda, Satvic</Text>
                    </View>
                    <View style={styles.infoBlock}>
                        <Text style={styles.infoLabel}>Included Meal</Text>
                        {['Breakfast', 'Lunch', 'Dinner'].map((m) => (
                            <View key={m} style={styles.checkRow}>
                                <View style={styles.checkBox}>
                                    <FontAwesome name="check" size={10} color="#43BC6C" />
                                </View>
                                <Text style={styles.checkText}>{m}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.sectionDivider} />

                {/* Amenities */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Amenities</Text>
                    <Text style={styles.subSectionLabel}>What is Included</Text>
                    {['Daily Yoga Session', 'Airport Pickup', 'Workshop Material'].map(inc => (
                        <View key={inc} style={styles.checkRow}>
                            <View style={styles.checkBox}>
                                <FontAwesome name="check" size={10} color="#43BC6C" />
                            </View>
                            <Text style={styles.checkText}>{inc}</Text>
                        </View>
                    ))}

                    <Text style={[styles.subSectionLabel, { marginTop: 16 }]}>What is Excluded</Text>
                    {['Airfare', 'Laundry', 'Personal Expenses'].map(exc => (
                        <View key={exc} style={styles.checkRow}>
                            <View style={[styles.checkBox, { borderColor: '#FF4D4D' }]}>
                                <Ionicons name="close" size={12} color="#FF4D4D" />
                            </View>
                            <Text style={styles.checkText}>{exc}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.sectionDivider} />

                {/* Cancellation Policy */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Cancellation Policy</Text>
                    <View style={styles.bulletRow}>
                        <View style={styles.bullet} />
                        <Text style={styles.bulletText}>Free Cancellation before start of 30 days</Text>
                    </View>
                    <View style={styles.bulletRow}>
                        <View style={styles.bullet} />
                        <Text style={styles.bulletText}>20% Deducted if cancelled after 30 days</Text>
                    </View>
                </View>

                <View style={styles.sectionDivider} />

                {/* Special Features */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>What Makes This Retreat Special</Text>
                    {SPECIAL_FEATURES.map((spec, i) => (
                        <View key={i} style={styles.bulletRow}>
                            <View style={styles.bullet} />
                            <Text style={styles.bulletText}>{spec}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.sectionDivider} />

                {/* Schedule */}
                <View style={styles.section}>
                    <View style={styles.scheduleTitleRow}>
                        <Text style={styles.sectionTitle}>Schedule</Text>
                        <Text style={styles.planLabel}>3 Days Plan</Text>
                    </View>
                    {[1, 2, 3].map(day => (
                        <ScheduleItem
                            key={day}
                            day={day}
                            title="Spiritual Immersion & Cultural"
                            isActive={activeDay === day}
                            onToggle={() => setActiveDay(activeDay === day ? null : day)}
                        />
                    ))}
                </View>
            </ScrollView>

            {/* Sticky Footer */}
            <View style={styles.footer}>
                <View>
                    <Text style={styles.footerLabel}>TOTAL PRICE</Text>
                    <Text style={styles.footerPrice}>₹{packageData.price}</Text>
                </View>
                <Pressable style={styles.bookNowButton}>
                    <Text style={styles.bookNowText}>Book Now</Text>
                    <FontAwesome name="arrow-right" size={14} color="#fff" />
                </Pressable>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        paddingTop: 10,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'GelicaBold',
        color: '#000',
        flex: 1,
    },
    subTabs: {
        paddingHorizontal: 16,
    },
    subTabsContent: {
        gap: 32,
        paddingRight: 32,
    },
    activeSubTab: {
        borderBottomWidth: 3,
        borderBottomColor: '#D4A017',
        paddingVertical: 12,
    },
    activeSubTabText: {
        fontSize: 14,
        fontFamily: 'GelicaBold',
        color: '#D4A017',
    },
    inactiveSubTabText: {
        fontSize: 14,
        fontFamily: 'GelicaBold',
        color: '#707070',
        paddingVertical: 12,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    packageHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
    },
    packageNameTitle: {
        fontSize: 20,
        fontFamily: 'GelicaBold',
        color: '#000',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    priceCard: {
        margin: 20,
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    dateRangeText: {
        fontSize: 13,
        fontFamily: 'GelicaBold',
        color: '#707070',
        marginBottom: 16,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    totalPriceLabel: {
        fontSize: 22,
        fontFamily: 'GelicaBold',
        color: '#000',
    },
    priceValue: {
        fontSize: 22,
        fontFamily: 'GelicaBold',
        color: '#D4A017',
    },
    perPersonText: {
        fontSize: 13,
        fontFamily: 'GelicaMedium',
        color: '#707070',
        marginLeft: 4,
    },
    depositText: {
        fontSize: 15,
        fontFamily: 'GelicaBold',
        color: '#000',
    },
    depositValue: {
        color: '#707070',
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontFamily: 'GelicaBold',
        color: '#000',
        marginBottom: 16,
    },
    accCarouselContainer: {
        width: '100%',
        borderRadius: 20,
        overflow: 'hidden',
        height: 220,
        backgroundColor: '#f5f5f5',
    },
    accImage: {
        width: width - 40,
        height: 220,
        resizeMode: 'cover',
    },
    accPagination: {
        position: 'absolute',
        bottom: 12,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 6,
    },
    accDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    accActiveDot: {
        backgroundColor: '#fff',
    },
    featuresGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        marginTop: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: '45%',
    },
    featureLabel: {
        fontSize: 13,
        fontFamily: 'GelicaMedium',
        color: '#707070',
    },
    sectionDivider: {
        height: 6,
        backgroundColor: '#F9F9F9',
        marginVertical: 4,
    },
    infoBlock: {
        marginBottom: 16,
    },
    infoLabel: {
        fontSize: 14,
        fontFamily: 'GelicaBold',
        color: '#000',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        fontFamily: 'GelicaMedium',
        color: '#707070',
    },
    checkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 12,
    },
    checkBox: {
        width: 20,
        height: 20,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#43BC6C',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkText: {
        fontSize: 14,
        fontFamily: 'GelicaMedium',
        color: '#707070',
    },
    subSectionLabel: {
        fontSize: 14,
        fontFamily: 'GelicaBold',
        color: '#707070',
        marginBottom: 12,
    },
    bulletRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
        gap: 10,
    },
    bullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#000',
        marginTop: 8,
    },
    bulletText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'GelicaMedium',
        color: '#707070',
        lineHeight: 20,
    },
    scheduleTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    planLabel: {
        fontSize: 14,
        fontFamily: 'GelicaBold',
        color: '#707070',
    },
    scheduleItem: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#EEEEEE',
        marginBottom: 12,
        overflow: 'hidden',
    },
    scheduleHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'rgba(249, 249, 249, 0.5)',
    },
    dayLabel: {
        fontSize: 13,
        fontFamily: 'GelicaBold',
        color: '#D4A017',
    },
    scheduleItemTitle: {
        fontSize: 14,
        fontFamily: 'GelicaBold',
        color: '#000',
    },
    scheduleContent: {
        padding: 16,
    },
    timeSection: {
        flexDirection: 'row',
        gap: 12,
    },
    timelineContainer: {
        width: 12,
        alignItems: 'center',
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#D4A017',
        backgroundColor: '#fff',
        zIndex: 1,
    },
    timelineLine: {
        width: 1,
        flex: 1,
        backgroundColor: '#F1EAD9',
        marginVertical: -2,
    },
    timeContent: {
        flex: 1,
        paddingBottom: 24,
    },
    timeLabel: {
        fontSize: 13,
        fontFamily: 'GelicaBold',
        color: '#D4A017',
        textTransform: 'uppercase',
    },
    timeDesc: {
        fontSize: 13,
        fontFamily: 'GelicaMedium',
        color: '#707070',
        lineHeight: 18,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    footerLabel: {
        fontSize: 10,
        fontFamily: 'GelicaBold',
        color: '#909090',
        letterSpacing: 1,
    },
    footerPrice: {
        fontSize: 18,
        fontFamily: 'GelicaBold',
        color: '#000',
    },
    bookNowButton: {
        backgroundColor: '#D4A017',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    bookNowText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'GelicaBold',
    },
});

export default RetreatPackageScreen;
