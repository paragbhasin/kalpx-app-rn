import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    Pressable,
    TextInput,
    SafeAreaView,
    StatusBar,
    Dimensions,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const RetreatPaymentScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { retreat, pkg, participant } = route.params || {};

    const retreatData = retreat || {
        title: "Rejuvenating yoga & calm Ayurvedic Retreat",
        image: require('../../../assets/retreat/retreat1.jpg'),
        rating: "4.9(223)",
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Custom Header matching screenshot */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.logoText}>Kalp<Text style={styles.logoX}>X</Text></Text>
                    <Text style={styles.logoTagline}>Connect to your Roots</Text>
                </View>
                <View style={styles.headerRight}>
                    <Pressable style={styles.langSelector}>
                        <Text style={styles.langText}>English</Text>
                        <Ionicons name="chevron-forward" size={14} color="#707070" />
                    </Pressable>
                    <Pressable style={styles.menuButton}>
                        <Ionicons name="menu" size={28} color="#000" />
                    </Pressable>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Retreat Summary Mini Card */}
                <View style={styles.summaryCard}>
                    <Image source={retreatData.image} style={styles.summaryImage} />
                    <View style={styles.summaryInfo}>
                        <Text style={styles.summaryTitle}>{retreatData.title}</Text>
                        <View style={styles.ratingRow}>
                            <Text style={styles.ratingText}>{retreatData.rating}</Text>
                            <FontAwesome name="star" size={14} color="#D4A017" />
                        </View>
                    </View>
                </View>

                {/* Free Cancellation */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Free Cancellation</Text>
                    <View style={styles.policyItem}>
                        <View style={styles.dot} />
                        <Text style={styles.policyText}>Free Cancellation before start of 30 days</Text>
                    </View>
                    <View style={styles.policyItem}>
                        <View style={styles.dot} />
                        <Text style={styles.policyText}>20% Deducted if cancelled after 30 days</Text>
                    </View>
                </View>

                {/* Guest */}
                <View style={styles.divider} />
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Guest</Text>
                    <Text style={styles.valueText}>1 Person</Text>
                </View>

                {/* Dates */}
                <View style={styles.divider} />
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dates</Text>
                    <Text style={styles.valueText}>From 22 Dec - 24 Dec 2025 ( 3 Days/ 2 Nights)</Text>
                </View>

                {/* Person Information */}
                <Text style={styles.labelTitle}>Person Information</Text>
                <View style={styles.personCard}>
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

                {/* Price Breakdown */}
                <Text style={styles.labelTitle}>Price Breakdown</Text>
                <View style={styles.priceCard}>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Package Price</Text>
                        <Text style={styles.priceValue}>₹3,300</Text>
                    </View>

                    <Text style={styles.priceHeader}>Add Ons</Text>
                    <View style={styles.priceRow}>
                        <View style={styles.checkItem}>
                            <View style={styles.checkboxActive}>
                                <FontAwesome name="check" size={8} color="#fff" />
                            </View>
                            <Text style={styles.priceLabel}>Airport Pickup</Text>
                        </View>
                        <Text style={styles.priceValue}>₹4000/-</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <View style={styles.checkItem}>
                            <View style={styles.checkboxActive}>
                                <FontAwesome name="check" size={8} color="#fff" />
                            </View>
                            <Text style={styles.priceLabel}>Gluten Free Meal</Text>
                        </View>
                        <Text style={styles.priceValue}>₹2000/-</Text>
                    </View>

                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Total Disconut</Text>
                        <Text style={styles.priceValue}>₹200/-</Text>
                    </View>
                    <View style={styles.priceRow}>
                        <Text style={styles.priceLabel}>Taxes</Text>
                        <Text style={styles.priceValue}>₹330/-</Text>
                    </View>

                    <View style={[styles.priceRow, styles.paidRow]}>
                        <Text style={styles.priceLabel}>Deposit Paid</Text>
                        <Text style={styles.priceValue}>₹1,000/-</Text>
                    </View>

                    <View style={styles.totalDueBox}>
                        <Text style={styles.totalDueLabel}>Total Payment due</Text>
                        <Text style={styles.totalDueValue}>₹8,430/-</Text>
                    </View>
                </View>

                {/* Make Payment Section */}
                <Text style={styles.labelTitle}>Make Payment</Text>
                <View style={styles.paymentForm}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.fieldLabel}>Card No.</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput placeholder="Card number" style={styles.input} />
                            <FontAwesome name="credit-card" size={16} color="#707070" />
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.fieldLabel}>Expiration Date</Text>
                        <TextInput placeholder="MM/YY" style={styles.input} />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.fieldLabel}>Security Date</Text>
                        <TextInput placeholder="CVC" style={styles.input} />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.fieldLabel}>Country</Text>
                        <View style={styles.inputWrapper}>
                            <TextInput placeholder="India" style={styles.input} editable={false} />
                            <Ionicons name="chevron-down" size={16} color="#707070" />
                        </View>
                    </View>

                    <Pressable style={styles.makePaymentBtn}>
                        <Text style={styles.makePaymentText}>Make Payment</Text>
                    </Pressable>

                    <Pressable style={styles.cancelBtn} onPress={() => navigation.navigate('RetreatCancellation')}>
                        <Text style={styles.cancelBtnText}>Cancel Booking</Text>
                    </Pressable>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerLeft: {
    },
    logoText: {
        fontSize: 22,
        fontFamily: 'GelicaBold',
        color: '#D4A017',
    },
    logoX: {
        color: '#D4A017',
    },
    logoTagline: {
        fontSize: 10,
        color: '#000',
        fontFamily: 'GelicaMedium',
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    langSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#EBEBEB',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        gap: 4,
    },
    langText: {
        fontSize: 12,
        color: '#000',
        fontFamily: 'GelicaMedium',
    },
    menuButton: {
    },
    scrollContent: {
        padding: 16,
        gap: 16,
    },
    summaryCard: {
        flexDirection: 'row',
        gap: 16,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
    },
    summaryImage: {
        width: 80,
        height: 80,
        borderRadius: 12,
    },
    summaryInfo: {
        flex: 1,
        justifyContent: 'center',
        gap: 4,
    },
    summaryTitle: {
        fontSize: 15,
        fontFamily: 'GelicaBold',
        color: '#000',
        lineHeight: 18,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 14,
        fontFamily: 'GelicaBold',
        color: '#707070',
    },
    section: {
        gap: 4,
    },
    sectionTitle: {
        fontSize: 14,
        fontFamily: 'GelicaBold',
        color: '#000',
    },
    policyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#707070',
    },
    policyText: {
        fontSize: 13,
        fontFamily: 'GelicaMedium',
        color: '#707070',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
    },
    valueText: {
        fontSize: 13,
        fontFamily: 'GelicaMedium',
        color: '#707070',
    },
    labelTitle: {
        fontSize: 16,
        fontFamily: 'GelicaBold',
        color: '#000',
        marginTop: 8,
    },
    personCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    avatarName: {
        fontSize: 16,
        fontFamily: 'GelicaBold',
        color: '#000',
    },
    avatarSubText: {
        fontSize: 13,
        fontFamily: 'GelicaMedium',
        color: '#707070',
    },
    priceCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#F0F0F0',
        overflow: 'hidden',
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    priceLabel: {
        fontSize: 15,
        fontFamily: 'GelicaMedium',
        color: '#707070',
    },
    priceValue: {
        fontSize: 15,
        fontFamily: 'GelicaBold',
        color: '#000',
    },
    priceHeader: {
        fontSize: 14,
        fontFamily: 'GelicaBold',
        color: '#000',
        paddingHorizontal: 16,
        marginTop: 4,
    },
    checkItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    checkboxActive: {
        width: 16,
        height: 16,
        borderRadius: 4,
        backgroundColor: '#D4A017',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paidRow: {
        borderTopWidth: 1,
        borderTopColor: '#F0F0F0',
        marginTop: 4,
    },
    totalDueBox: {
        backgroundColor: '#FFF9E5',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#F1EAD9',
    },
    totalDueLabel: {
        fontSize: 16,
        fontFamily: 'GelicaBold',
        color: '#000',
    },
    totalDueValue: {
        fontSize: 18,
        fontFamily: 'GelicaBold',
        color: '#000',
    },
    paymentForm: {
        gap: 16,
        paddingBottom: 40,
    },
    inputGroup: {
        gap: 6,
    },
    fieldLabel: {
        fontSize: 12,
        fontFamily: 'GelicaBold',
        color: '#707070',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 48,
    },
    input: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'GelicaMedium',
        color: '#000',
    },
    makePaymentBtn: {
        backgroundColor: '#D4A017',
        height: 52,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    makePaymentText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'GelicaBold',
    },
    cancelBtn: {
        height: 52,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: {
        color: '#707070',
        fontSize: 16,
        fontFamily: 'GelicaBold',
    },
});

export default RetreatPaymentScreen;
