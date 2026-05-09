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
    TextInput,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import FacilitatorCard from '../../components/Retreats/FacilitatorCard';

const { width } = Dimensions.get('window');
const isDesktop = width > 1024;

const RetreatBookingDetailsScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { bookingId } = route.params || {};

    const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
    const [isEditingPackage, setIsEditingPackage] = useState(false);
    const [isEditingParticipant, setIsEditingParticipant] = useState(false);
    const [currentImg, setCurrentImg] = useState(0);

    const images = [
        require('../../../assets/retreat/retreat1.jpg'),
        require('../../../assets/retreat/retreat1.jpg'),
        require('../../../assets/retreat/retreat1.jpg'),
    ];

    const pkgFeatures = [
        "Meals Included",
        "5 Days",
        "Brekfast, Lunch, Dinner Included",
        "Starting from 22 Dec - 26 Dec 2025",
    ];

    const policies = [
        "A deposit is required to confirm your booking.",
        "The remaining amount must be paid before the retreat start date.",
        "Cancellations made after this period may result in partial or no refund.",
    ];

    const addons = [
        { name: "Airport Pickup", selected: true },
        { name: "Gluten Free Meal", selected: false },
    ];

    const nextImg = () => setCurrentImg((currentImg + 1) % images.length);
    const prevImg = () => setCurrentImg(currentImg === 0 ? images.length - 1 : currentImg - 1);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header for Mobile */}
            {!isDesktop && (
                <View style={styles.header}>
                    <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </Pressable>
                    <Text style={styles.headerTitle}>Booking Details</Text>
                </View>
            )}

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Section / Gallery */}
                <View style={styles.heroContainer}>
                    <Image source={images[currentImg]} style={styles.heroImage} />
                    <View style={styles.arrowsContainer}>
                        <Pressable onPress={prevImg} style={styles.arrowCircle}>
                            <Ionicons name="chevron-back" size={20} color="#000" />
                        </Pressable>
                        <Pressable onPress={nextImg} style={styles.arrowCircle}>
                            <Ionicons name="chevron-forward" size={20} color="#000" />
                        </Pressable>
                    </View>
                    <View style={styles.paginationDots}>
                        {images.map((_, i) => (
                            <View
                                key={i}
                                style={[styles.dot, currentImg === i ? styles.activeDot : styles.inactiveDot]}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={styles.title}>Rejuvenating yoga & Ayurvedic Retreat</Text>

                    {/* Summary Section */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionLabel}>SUMMARY OF RETREATS</Text>
                        </View>
                        <Text
                            style={styles.summaryText}
                            numberOfLines={isSummaryExpanded ? undefined : 2}
                        >
                            This retreat is designed to offer a structured and comfortable experience focused on mindful living. It combines traditional Ayurveda with modern luxury.
                        </Text>
                        <Pressable
                            style={styles.viewMoreRow}
                            onPress={() => setIsSummaryExpanded(!isSummaryExpanded)}
                        >
                            <Text style={styles.viewMoreText}>
                                {isSummaryExpanded ? 'Less Details' : 'View Details'}
                            </Text>
                            <Ionicons
                                name={isSummaryExpanded ? "chevron-up" : "chevron-down"}
                                size={14}
                                color="#1877F2"
                            />
                        </Pressable>

                        {isSummaryExpanded && (
                            <View style={styles.expandedSummary}>
                                <Text style={styles.subHeader}>Your Guides on This Journey</Text>
                                <FacilitatorCard />

                                <Text style={styles.subHeader}>Address</Text>
                                <View style={styles.mapPlaceholder}>
                                    <Image
                                        source={{ uri: 'https://maps.googleapis.com/maps/api/staticmap?center=11.53,76.04&zoom=13&size=600x300&key=MAPS_KEY' }}
                                        style={styles.mapImage}
                                    />
                                </View>
                                <Text style={styles.addressText}>
                                    KalpX Wellness Retreat, Vythiri Forest Road, Wayanad, Kerala - 673576, India
                                </Text>

                                <View style={styles.divider} />

                                <Text style={styles.subHeader}>Policies</Text>
                                {policies.map((p, i) => (
                                    <View key={i} style={styles.policyRow}>
                                        <View style={styles.checkIndicator}>
                                            <FontAwesome name="check" size={10} color="#43BC6C" />
                                        </View>
                                        <Text style={styles.policyText}>{p}</Text>
                                    </View>
                                ))}

                                <Text style={styles.subHeader}>Add Ons</Text>
                                {addons.map((addon, i) => (
                                    <View key={i} style={styles.addonRow}>
                                        <View style={styles.addonLeft}>
                                            <View style={styles.addonIconBox}>
                                                <FontAwesome
                                                    name={addon.selected ? "check" : "plus"}
                                                    size={12}
                                                    color="#707070"
                                                />
                                            </View>
                                            <View>
                                                <Text style={styles.addonName}>{addon.name}</Text>
                                                <Text style={styles.addonSub}>Comfortable Airport Pickup</Text>
                                            </View>
                                        </View>
                                        <View style={styles.priceTag}>
                                            <Text style={styles.priceTagText}>₹4000/-</Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Packages Selected */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionLabel}>PACKAGES SELECTED</Text>
                            <Pressable
                                style={styles.editRow}
                                onPress={() => setIsEditingPackage(!isEditingPackage)}
                            >
                                <Ionicons name="pencil" size={12} color="#707070" />
                                <Text style={styles.editLink}>Change</Text>
                            </Pressable>
                        </View>

                        <View style={[styles.packageBox, styles.activePackage]}>
                            <View style={styles.packageHead}>
                                <View style={styles.radioOuter}>
                                    <View style={styles.radioInner} />
                                </View>
                                <Text style={styles.packageName}>Beginner Friendly</Text>
                            </View>
                            <Text style={styles.packagePrice}>₹3300/-</Text>
                            {pkgFeatures.map((f, i) => (
                                <View key={i} style={styles.featureRow}>
                                    <FontAwesome name="check" size={12} color="#43BC6C" />
                                    <Text style={styles.featureText}>{f}</Text>
                                </View>
                            ))}
                            <Pressable style={styles.packageViewButton} onPress={() => navigation.navigate('RetreatPayment')}>
                                <Text style={styles.packageViewText}>View Details</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Participant Details */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionLabel}>PARTICIPANT DETAILS</Text>
                            <Pressable
                                style={styles.editRow}
                                onPress={() => setIsEditingParticipant(!isEditingParticipant)}
                            >
                                <Ionicons name="pencil" size={12} color="#707070" />
                                <Text style={styles.editLink}>Change</Text>
                            </Pressable>
                        </View>

                        {isEditingParticipant ? (
                            <View style={styles.formContainer}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>First Name</Text>
                                    <TextInput placeholder="Enter your first name" style={styles.input} />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Last Name</Text>
                                    <TextInput placeholder="Enter your last name" style={styles.input} />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Email Id</Text>
                                    <TextInput placeholder="Enter your email" style={styles.input} />
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>Mobile Number</Text>
                                    <TextInput placeholder="Enter your mobile number" style={styles.input} />
                                </View>
                                <View style={styles.formActions}>
                                    <Pressable style={styles.saveBtn} onPress={() => setIsEditingParticipant(false)}>
                                        <Text style={styles.saveBtnText}>Save Changes</Text>
                                    </Pressable>
                                    <Pressable style={styles.cancelBtn} onPress={() => setIsEditingParticipant(false)}>
                                        <Text style={styles.cancelBtnText}>Cancel</Text>
                                    </Pressable>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.participantRow}>
                                <Image
                                    source={{ uri: 'https://ui-avatars.com/api/?name=Vikram+Mishra&background=F1EAD9&color=D4A017' }}
                                    style={styles.avatar}
                                />
                                <View>
                                    <Text style={styles.avatarName}>Vikram Mishra</Text>
                                    <Text style={styles.avatarSubText}>+91 9345344562</Text>
                                    <Text style={styles.avatarSubText}>vikrammishra@gmail.com</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Retreat Dates */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionLabel}>RETREATS DATES</Text>
                            <Pressable style={styles.editRow}>
                                <Ionicons name="pencil" size={12} color="#707070" />
                                <Text style={styles.editLink}>Change</Text>
                            </Pressable>
                        </View>
                        <View style={styles.datesBox}>
                            <View style={styles.dateRow}>
                                <View style={styles.dateCol}>
                                    <Text style={styles.dateLabel}>Check in</Text>
                                    <Text style={styles.dateValue}>22 Dec 2025</Text>
                                    <Text style={styles.dateTime}>at 12.00 am</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#E0E0E0" />
                                <View style={[styles.dateCol, { alignItems: 'flex-end' }]}>
                                    <Text style={styles.dateLabel}>Check out</Text>
                                    <Text style={styles.dateValue}>25 Dec 2025</Text>
                                    <Text style={styles.dateTime}>at 12.00 am</Text>
                                </View>
                            </View>
                            <View style={styles.durationRow}>
                                <Text style={styles.durationText}>3 Days/ 2 Nights</Text>
                            </View>
                        </View>
                    </View>

                    <Pressable
                        style={styles.cancelBookingBtn}
                        onPress={() => navigation.navigate('RetreatCancellation')}
                    >
                        <Text style={styles.cancelBookingText}>Cancel Booking</Text>
                    </Pressable>
                </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <View>
                    <Text style={styles.footerLabel}>Total Amount Left</Text>
                    <Text style={styles.footerPrice}>₹8,430</Text>
                </View>
                <Pressable style={styles.footerButton} onPress={() => navigation.navigate('RetreatPayment')}>
                    <Text style={styles.footerButtonText}>Make Payment</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
        backgroundColor: '#fff',
    },
    backButton: {
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
    },
    heroContainer: {
        width: '100%',
        height: 250,
        position: 'relative',
    },
    heroImage: {
        width: '100%',
        height: '100%',
    },
    arrowsContainer: {
        position: 'absolute',
        width: '100%',
        top: '50%',
        marginTop: -20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    arrowCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginationDots: {
        position: 'absolute',
        bottom: 16,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    activeDot: {
        backgroundColor: '#fff',
        width: 20,
    },
    inactiveDot: {
        backgroundColor: 'rgba(255,255,255,0.4)',
    },
    content: {
        padding: 16,
        gap: 20,
    },
    title: {
        fontSize: 18,
        fontFamily: 'GelicaBold',
        color: '#000',
        lineHeight: 24,
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionLabel: {
        fontSize: 13,
        fontFamily: 'GelicaBold',
        color: '#707070',
        letterSpacing: 0.5,
    },
    summaryText: {
        fontSize: 14,
        fontFamily: 'GelicaMedium',
        color: '#707070',
        lineHeight: 20,
    },
    viewMoreRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 10,
    },
    viewMoreText: {
        fontSize: 13,
        fontFamily: 'GelicaBold',
        color: '#1877F2',
    },
    expandedSummary: {
        marginTop: 20,
        gap: 16,
    },
    subHeader: {
        fontSize: 14,
        fontFamily: 'GelicaBold',
        color: '#000',
    },
    mapPlaceholder: {
        height: 150,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
        overflow: 'hidden',
    },
    mapImage: {
        width: '100%',
        height: '100%',
    },
    addressText: {
        fontSize: 13,
        fontFamily: 'GelicaMedium',
        color: '#707070',
        lineHeight: 18,
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
    },
    policyRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'flex-start',
    },
    checkIndicator: {
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
        fontSize: 13,
        fontFamily: 'GelicaMedium',
        color: '#707070',
        lineHeight: 18,
    },
    addonRow: {
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addonLeft: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'center',
    },
    addonIconBox: {
        width: 24,
        height: 24,
        borderRadius: 4,
        backgroundColor: '#F1EAD9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    addonName: {
        fontSize: 13,
        fontFamily: 'GelicaBold',
        color: '#000',
    },
    addonSub: {
        fontSize: 11,
        fontFamily: 'GelicaMedium',
        color: '#707070',
    },
    priceTag: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#D4A017',
    },
    priceTagText: {
        fontSize: 12,
        fontFamily: 'GelicaBold',
        color: '#D4A017',
    },
    editRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    editLink: {
        fontSize: 12,
        fontFamily: 'GelicaBold',
        color: '#707070',
    },
    packageBox: {
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    activePackage: {
        borderColor: '#D4A017',
    },
    packageHead: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 4,
    },
    radioOuter: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 1.5,
        borderColor: '#D4A017',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#D4A017',
    },
    packageName: {
        fontSize: 16,
        fontFamily: 'GelicaBold',
        color: '#000',
    },
    packagePrice: {
        fontSize: 20,
        fontFamily: 'GelicaBold',
        color: '#D4A017',
        marginLeft: 30,
        marginBottom: 16,
    },
    featureRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        marginLeft: 30,
        marginBottom: 8,
    },
    featureText: {
        fontSize: 13,
        fontFamily: 'GelicaMedium',
        color: '#707070',
    },
    packageViewButton: {
        marginTop: 12,
        marginLeft: 30,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D4A017',
        alignItems: 'center',
    },
    packageViewText: {
        fontSize: 13,
        fontFamily: 'GelicaBold',
        color: '#D4A017',
    },
    participantRow: {
        backgroundColor: '#FBFBFB',
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    avatarName: {
        fontSize: 15,
        fontFamily: 'GelicaBold',
        color: '#000',
    },
    avatarSubText: {
        fontSize: 12,
        fontFamily: 'GelicaMedium',
        color: '#707070',
    },
    formContainer: {
        backgroundColor: '#FBFBFB',
        padding: 16,
        borderRadius: 16,
        gap: 12,
    },
    inputGroup: {
        gap: 6,
    },
    inputLabel: {
        fontSize: 11,
        fontFamily: 'GelicaBold',
        color: '#707070',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderRadius: 12,
        height: 44,
        paddingHorizontal: 12,
        fontSize: 13,
        fontFamily: 'GelicaMedium',
    },
    formActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 12,
    },
    saveBtn: {
        flex: 1,
        height: 48,
        backgroundColor: '#D4A017',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveBtnText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'GelicaBold',
    },
    cancelBtn: {
        flex: 1,
        height: 48,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#D4A017',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#D4A017',
        fontSize: 14,
        fontFamily: 'GelicaBold',
    },
    datesBox: {
        backgroundColor: '#FBFBFB',
        borderRadius: 20,
        padding: 20,
    },
    dateRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    dateCol: {
        gap: 2,
    },
    dateLabel: {
        fontSize: 12,
        fontFamily: 'GelicaBold',
        color: '#707070',
        marginBottom: 4,
    },
    dateValue: {
        fontSize: 14,
        fontFamily: 'GelicaBold',
        color: '#000',
    },
    dateTime: {
        fontSize: 11,
        fontFamily: 'GelicaMedium',
        color: '#707070',
    },
    durationRow: {
        paddingTop: 12,
        alignItems: 'center',
    },
    durationText: {
        fontSize: 13,
        fontFamily: 'GelicaBold',
        color: '#707070',
    },
    cancelBookingBtn: {
        height: 56,
        borderWidth: 1,
        borderColor: '#707070',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    cancelBookingText: {
        fontSize: 15,
        fontFamily: 'GelicaBold',
        color: '#707070',
    },
    footer: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
    },
    footerLabel: {
        fontSize: 12,
        fontFamily: 'GelicaBold',
        color: '#707070',
    },
    footerPrice: {
        fontSize: 20,
        // fontFamily: 'GelicaBold',
        color: '#000',
    },
    footerButton: {
        backgroundColor: '#D4A017',
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 12,
        shadowColor: '#D4A017',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    footerButtonText: {
        color: '#fff',
        fontSize: 15,
        fontFamily: 'GelicaBold',
    },
});

export default RetreatBookingDetailsScreen;
