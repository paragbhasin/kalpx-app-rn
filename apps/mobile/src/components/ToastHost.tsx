import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, Layout } from 'react-native-reanimated';
import { useToast, Toast } from '../context/ToastContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const ToastHost: React.FC = () => {
    const { toasts, removeToast } = useToast();

    return (
        <View style={styles.container} pointerEvents="box-none">
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
            ))}
        </View>
    );
};

const ToastItem: React.FC<{ toast: Toast; onRemove: () => void }> = ({ toast, onRemove }) => {
    return (
        <Animated.View
            entering={FadeInUp}
            exiting={FadeOutUp}
            layout={Layout.springify()}
            style={[styles.toast, styles[toast.type || 'info']]}
        >
            <View style={styles.content}>
                <Text style={styles.message}>{toast.message}</Text>
                <TouchableOpacity onPress={onRemove} style={styles.closeButton}>
                    <Ionicons name="close" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
        zIndex: 10000,
        paddingHorizontal: 20,
    },
    toast: {
        backgroundColor: '#333',
        borderRadius: 16,
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginBottom: 10,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    message: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    closeButton: {
        marginLeft: 10,
        padding: 4,
    },
    info: {
        backgroundColor: '#1F2937', // gray-800
    },
    success: {
        backgroundColor: '#10B981', // green-500
    },
    error: {
        backgroundColor: '#EF4444', // red-500
    },
});

export default ToastHost;
