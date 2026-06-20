import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, Layout } from 'react-native-reanimated';
import { useToast, Toast } from '../context/ToastContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Fonts } from '../theme/fonts';

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
    if (toast.type === 'la_added') {
        return (
            <Animated.View
                entering={FadeInUp.springify().damping(14).stiffness(120)}
                exiting={FadeOutUp.duration(200)}
                layout={Layout.springify()}
                style={styles.laToast}
            >
                <View style={styles.laIconBox}>
                    <Ionicons name="lock-closed" size={20} color="#C9A84C" />
                </View>
                <View style={styles.laTextBlock}>
                    <Text style={styles.laTitle}>{toast.message}</Text>
                    {!!toast.subtitle && (
                        <Text style={styles.laSubtitle}>{toast.subtitle}</Text>
                    )}
                </View>
                <View style={styles.laCheckBox}>
                    <Ionicons name="checkmark-circle" size={22} color="#C9A84C" />
                </View>
            </Animated.View>
        );
    }

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
        backgroundColor: '#1F2937',
    },
    success: {
        backgroundColor: '#10B981',
    },
    error: {
        backgroundColor: '#EF4444',
    },

    // LA Added toast
    laToast: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1C1007',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#6B4C1E',
        paddingVertical: 14,
        paddingHorizontal: 16,
        marginBottom: 10,
        width: '100%',
        maxWidth: 400,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },
    laIconBox: {
        width: 42,
        height: 42,
        borderRadius: 12,
        backgroundColor: '#2E1A06',
        borderWidth: 1,
        borderColor: '#6B4C1E',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        flexShrink: 0,
    },
    laTextBlock: {
        flex: 1,
    },
    laTitle: {
        fontFamily: Fonts.sans.semiBold,
        fontSize: 14,
        color: '#F5E6C8',
        lineHeight: 19,
    },
    laSubtitle: {
        fontFamily: Fonts.sans.regular,
        fontSize: 12,
        color: '#9B7E5C',
        marginTop: 2,
        lineHeight: 16,
    },
    laCheckBox: {
        marginLeft: 10,
        flexShrink: 0,
    },
});

export default ToastHost;
