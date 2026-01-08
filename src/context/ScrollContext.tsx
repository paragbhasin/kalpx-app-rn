import React, { createContext, useContext, useRef, useState } from 'react';
import { Animated, Platform, Dimensions } from 'react-native';
import FontSize from '../components/FontSize';

const ScrollContext = createContext<any>(null);

export const ScrollProvider = ({ children }: any) => {
    const [lastOffset, setLastOffset] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const scrollAnim = useRef(new Animated.Value(0)).current; // 0 = visible, 1 = hidden
    const isHeaderVisible = useRef(true);

    const toggleVisibility = (visible: boolean) => {
        if (isHeaderVisible.current === visible) return;
        isHeaderVisible.current = visible;
        setIsVisible(visible);

        Animated.timing(scrollAnim, {
            toValue: visible ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start();
    };

    const handleScroll = (event: any) => {
        const currentOffset = event.nativeEvent.contentOffset.y;
        const direction = currentOffset > lastOffset ? "down" : "up";

        // Show header when at the very top
        if (currentOffset <= 0) {
            toggleVisibility(true);
        }
        // Hide header when scrolling down past threshold
        else if (direction === "down" && currentOffset > 100) {
            toggleVisibility(false);
        }
        // Show header when scrolling up
        else if (direction === "up") {
            toggleVisibility(true);
        }
        setLastOffset(currentOffset);
    };

    const headerY = scrollAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -100], // Moves header out of view
    });

    return (
        <ScrollContext.Provider value={{ handleScroll, headerY, toggleVisibility, isVisible }}>
            {children}
        </ScrollContext.Provider>
    );
};

export const useScrollContext = () => {
    const context = useContext(ScrollContext);
    if (!context) {
        // Return dummy values if used outside provider to prevent crashes
        return {
            handleScroll: () => { },
            headerY: 0,
            toggleVisibility: () => { },
        };
    }
    return context;
};
