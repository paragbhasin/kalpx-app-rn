import React from 'react';
import { Animated, Platform, StatusBar, StyleSheet, TouchableOpacity, View, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useScrollContext } from '../context/ScrollContext';
import Header from './Header';
import { useScreenStore } from '../engine/useScreenBridge';

// Total header height including status bar safe area on Android
const HEADER_HEIGHT = Platform.OS === 'android' ? 54 + (StatusBar.currentHeight || 0) : 54;

const GlobalScrollLayout = ({ 
    children, 
}: { 
    children: React.ReactNode,
}) => {
    const { headerY } = useScrollContext();
    const currentBackground = useScreenStore((state) => state.currentBackground);
    const isHeaderHidden = useScreenStore((state) => state.isHeaderHidden);

    // Back button logic — lives here so it rides the headerY animation for free
    const { history, currentScreen, goBack, loadScreen } = useScreenStore();
    const hideBackOnState = currentScreen?.state_id === 'discipline_select';
    const showBackButton = !currentScreen?.overlay && history.length > 0 && !hideBackOnState;

    const handleBack = () => {
        if (history.length > 0) {
            goBack();
            return;
        }
        loadScreen({ container_id: 'portal', state_id: 'portal' });
    };

    return (
        <View style={styles.container}>
            {currentBackground && (
                <ImageBackground
                    source={currentBackground}
                    style={StyleSheet.absoluteFill}
                    resizeMode="cover"
                />
            )}
            {!isHeaderHidden && (
                <Animated.View style={[
                    styles.headerContainer,
                    { transform: [{ translateY: headerY }] },
                    currentBackground && styles.headerTransparent,
                ]}>
                    {/* Back button + Header in one row.
                        Both live inside the animated block — back arrow slides with the header */}
                    <View style={styles.headerRow}>
                        {showBackButton ? (
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={handleBack}
                                activeOpacity={0.8}
                            >
                                <Ionicons name="arrow-back" size={20} color="#432104" />
                            </TouchableOpacity>
                        ) : null}
                        <View style={styles.headerFlex}>
                            <Header isTransparent={!!currentBackground} />
                        </View>
                    </View>
                </Animated.View>
            )}
            <View style={[
                styles.content,
                !isHeaderHidden && { paddingTop: HEADER_HEIGHT },
            ]}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        backgroundColor: '#FFF',
        height: HEADER_HEIGHT,
        justifyContent: 'center',
    },
    headerTransparent: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
    },
    // Back arrow + Header logo/dropdown in a single row
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    backButton: {
        width: 36,
        height: 36,
        marginLeft: 8,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    // Header component expands to fill remaining space
    headerFlex: {
        flex: 1,
    },
    content: {
        flex: 1,
    },
});

export default GlobalScrollLayout;
