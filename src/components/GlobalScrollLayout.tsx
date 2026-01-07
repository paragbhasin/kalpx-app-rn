import React from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useScrollContext } from '../context/ScrollContext';
import Header from './Header';

const GlobalScrollLayout = ({ children }: { children: React.ReactNode }) => {
    const { headerY } = useScrollContext();

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.headerContainer, { transform: [{ translateY: headerY }] }]}>
                <Header />
            </Animated.View>
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
