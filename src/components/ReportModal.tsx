import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface ReportModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSubmit: (reason: string, details: string) => void;
}

const REPORT_REASONS = [
    'Spam',
    'Inappropriate Content',
    'Harassment',
    'Other',
];

const ReportModal: React.FC<ReportModalProps> = ({ isVisible, onClose, onSubmit }) => {
    const [selectedReason, setSelectedReason] = useState<string | null>(null);
    const [details, setDetails] = useState('');

    const handleSubmit = () => {
        if (selectedReason) {
            onSubmit(selectedReason.toLowerCase().replace(' ', '_'), details);
            // Reset state for next time
            setSelectedReason(null);
            setDetails('');
        }
    };

    return (
        <Modal
            visible={isVisible}
            animationType="fade"
            transparent={true}
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.centeredView}
            >
                <View style={styles.backdrop} />
                <View style={styles.modalView}>
                    <View style={styles.header}>
                        <Text style={styles.modalTitle}>Report Post</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.subheader}>
                            Please help us identify the issue by selecting a reason for reporting this content.
                        </Text>

                        {REPORT_REASONS.map((reason) => (
                            <TouchableOpacity
                                key={reason}
                                style={[
                                    styles.reasonItem,
                                    selectedReason === reason && styles.selectedReasonItem,
                                ]}
                                onPress={() => setSelectedReason(reason)}
                            >
                                <View style={styles.radioButton}>
                                    {selectedReason === reason && <View style={styles.radioButtonInner} />}
                                </View>
                                <Text style={styles.reasonText}>{reason}</Text>
                            </TouchableOpacity>
                        ))}

                        <Text style={styles.additionalDetailsHeader}>Additional Details (Optional)</Text>
                        <TextInput
                            style={styles.detailsInput}
                            placeholder="Provide more context if needed..."
                            multiline
                            numberOfLines={4}
                            value={details}
                            onChangeText={setDetails}
                        />

                        <View style={styles.footerButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.submitButton,
                                    !selectedReason && styles.submitButtonDisabled,
                                ]}
                                onPress={handleSubmit}
                                disabled={!selectedReason}
                            >
                                <Text style={styles.submitButtonText}>Submit Report</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '90%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        maxHeight: '80%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 5,
    },
    subheader: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 20,
    },
    reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
        marginBottom: 10,
    },
    selectedReasonItem: {
        borderColor: '#D69E2E',
        backgroundColor: '#FFF8EF',
    },
    radioButton: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    radioButtonInner: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: '#D69E2E',
    },
    reasonText: {
        fontSize: 16,
        color: '#333',
    },
    additionalDetailsHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginTop: 15,
        marginBottom: 10,
    },
    detailsInput: {
        borderWidth: 1,
        borderColor: '#eee',
        borderRadius: 12,
        padding: 12,
        minHeight: 100,
        textAlignVertical: 'top',
        fontSize: 14,
        color: '#333',
        marginBottom: 20,
    },
    footerButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        marginRight: 10,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#333',
        fontWeight: '600',
        fontSize: 16,
    },
    submitButton: {
        flex: 1,
        backgroundColor: '#E6B05B', 
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
    },
    submitButtonDisabled: {
        backgroundColor: '#eee',
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ReportModal;
