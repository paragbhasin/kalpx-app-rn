import React from 'react';
import { Animated, StyleSheet, View, ImageBackground } from 'react-native';
import { useScrollContext } from '../context/ScrollContext';
import Header from './Header';
import { useScreenStore } from '../engine/useScreenBridge';

const GlobalScrollLayout = ({ 
    children, 
}: { 
    children: React.ReactNode,
}) => {
    const { headerY } = useScrollContext();
    const currentBackground = useScreenStore((state) => state.currentBackground);
    const isHeaderHidden = useScreenStore((state) => state.isHeaderHidden);

    return (
        <View style={styles.container}>
            {!isHeaderHidden && (
                <Animated.View style={[
                    styles.headerContainer, 
                    { transform: [{ translateY: headerY }] },
                    currentBackground && { backgroundColor: 'transparent' }
                ]}>
                    <Header isTransparent={!!currentBackground} />
                </Animated.View>
            )}
            <View style={styles.content}>
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
    },
    content: {
        flex: 1,
    },
});

export default GlobalScrollLayout;
