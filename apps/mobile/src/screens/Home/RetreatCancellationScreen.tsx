import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
    SafeAreaView,
    StatusBar,
    Modal,
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const REASONS = [
    "Schedule or date conflict",
    "Health or personal reasons",
    "Unable to attend at this time",
    "The retreat dates no longer work for me.",
    "found an alternative retreat or program.",
    "My plans have changed and I'm unable to attend.",
    "Work or professional commitments have come up.",
    "Pricing or payment concern",
    "Other",
];

const RetreatCancellationScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const [selectedReason, setSelectedReason] = useState(REASONS[0]);
    const [otherReason, setOtherReason] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleCancelPress = () => {
        setShowConfirmModal(true);
    };

    const confirmCancellation = () => {
        setShowConfirmModal(false);
        setShowSuccessModal(true);
    };

    const handleSuccessOk = () => {
        setShowSuccessModal(false);
        navigation.navigate('Retreats'); // Navigate back to the main retreats screen
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
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
                <Text style={styles.title}>Why you want to cancel the booking?</Text>

                <View style={styles.reasonsList}>
                    {REASONS.map((reason, index) => (
                        <Pressable
                            key={index}
                            style={styles.reasonItem}
                            onPress={() => setSelectedReason(reason)}
                        >
                            <View style={[styles.radioOuter, selectedReason === reason && styles.radioOuterActive]}>
                                {selectedReason === reason && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.reasonText}>{reason}</Text>
                        </Pressable>
                    ))}
                </View>

                <Text style={styles.label}>Write Reason for cancellation if selected other</Text>
                <TextInput
                    style={styles.textArea}
                    multiline
                    numberOfLines={4}
                    placeholder=""
                    value={otherReason}
                    onChangeText={setOtherReason}
                />

                <Pressable style={styles.cancelBookBtn} onPress={handleCancelPress}>
                    <Text style={styles.cancelBookBtnText}>Cancel Booking</Text>
                </Pressable>
            </ScrollView>

            {/* Confirmation Modal */}
            <Modal
                transparent
                visible={showConfirmModal}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmContent}>
                        <Text style={styles.confirmTitle}>Are sure you want to cancel the booking?</Text>
                        <Text style={styles.confirmSub}>90% refund will be credited to your account in 20 days</Text>

                        <View style={styles.modalActions}>
                            <Pressable
                                style={styles.keepBtn}
                                onPress={() => setShowConfirmModal(false)}
                            >
                                <Text style={styles.keepBtnText}>No, Don't Cancel</Text>
                            </Pressable>
                            <Pressable
                                style={styles.confirmCancelBtn}
                                onPress={confirmCancellation}
                            >
                                <Text style={styles.confirmCancelText}>Cancel Booking</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal
                transparent
                visible={showSuccessModal}
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.successContent}>
                        <View style={styles.successIconOuter}>
                            <FontAwesome name="check" size={40} color="#fff" />
                        </View>

                        <Text style={styles.successTitle}>Booking Cancelled Succesfully</Text>
                        <Text style={styles.successSub}>90% refund will be credited to your account in 20 days</Text>

                        <Pressable style={styles.okBtn} onPress={handleSuccessOk}>
                            <Text style={styles.okBtnText}>Ok</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
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
        padding: 24,
    },
    title: {
        fontSize: 18,
        fontFamily: 'GelicaBold',
        color: '#000',
        marginBottom: 24,
    },
    reasonsList: {
        gap: 20,
        marginBottom: 32,
    },
    reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 1.5,
        borderColor: '#D4A017',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioOuterActive: {
        borderColor: '#D4A017',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#D4A017',
    },
    reasonText: {
        fontSize: 15,
        fontFamily: 'GelicaMedium',
        color: '#000',
    },
    label: {
        fontSize: 14,
        fontFamily: 'GelicaBold',
        color: '#000',
        marginBottom: 12,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 12,
        padding: 16,
        height: 120,
        textAlignVertical: 'top',
        fontSize: 14,
        fontFamily: 'GelicaMedium',
        marginBottom: 40,
    },
    cancelBookBtn: {
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBookBtnText: {
        fontSize: 16,
        fontFamily: 'GelicaBold',
        color: '#707070',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    confirmContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    confirmTitle: {
        fontSize: 20,
        fontFamily: 'GelicaBold',
        color: '#000',
        marginBottom: 12,
    },
    confirmSub: {
        fontSize: 14,
        fontFamily: 'GelicaMedium',
        color: '#707070',
        marginBottom: 24,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    keepBtn: {
        flex: 1,
        height: 48,
        backgroundColor: '#D4A017',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    keepBtnText: {
        color: '#fff',
        fontSize: 14,
        fontFamily: 'GelicaBold',
    },
    confirmCancelBtn: {
        flex: 1,
        height: 48,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D4A017',
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmCancelText: {
        color: '#D4A017',
        fontSize: 14,
        fontFamily: 'GelicaBold',
    },
    successContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        maxWidth: 400,
    },
    successIconOuter: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#D4A017',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    successTitle: {
        fontSize: 18,
        fontFamily: 'GelicaBold',
        color: '#000',
        marginBottom: 8,
        textAlign: 'center',
    },
    successSub: {
        fontSize: 14,
        fontFamily: 'GelicaMedium',
        color: '#707070',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    okBtn: {
        backgroundColor: '#D4A017',
        paddingHorizontal: 48,
        height: 44,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    okBtnText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'GelicaBold',
    },
});

export default RetreatCancellationScreen;
