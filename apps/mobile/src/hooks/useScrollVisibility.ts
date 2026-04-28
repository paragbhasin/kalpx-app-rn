import { useState, useRef, useEffect } from "react";
import { Animated, Dimensions, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import FontSize from "../components/FontSize";

/**
 * Hook to manage showing/hiding header and bottom tab bar based on scroll direction.
 * @param initialHeaderHeight The approximate height of the header to hide.
 * @returns { handleScroll, headerY, toggleVisibility }
 */
export const useScrollVisibility = (initialHeaderHeight = 100) => {
    const navigation = useNavigation();
    const [lastOffset, setLastOffset] = useState(0);
    const scrollAnim = useRef(new Animated.Value(0)).current; // 0 = visible, 1 = hidden
    const isHeaderVisible = useRef(true);

    const toggleVisibility = (visible: boolean) => {
        if (isHeaderVisible.current === visible) return;
        isHeaderVisible.current = visible;

        Animated.timing(scrollAnim, {
            toValue: visible ? 0 : 1,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Toggle Bottom Tab Bar
        // Note: Adjust the depth of getParent() as needed based on your navigation structure
        const tabNav = navigation.getParent()?.getParent();
        if (tabNav) {
            tabNav.setOptions({
                tabBarStyle: {
                    display: visible ? "flex" : "none",
                    backgroundColor: "#FFF",
                    borderTopWidth: 0.5,
                    borderTopColor: "#d1d1d1",
                    elevation: 0,
                    shadowOpacity: 0,
                    height: FontSize.CONSTS.DEVICE_HEIGHT * 0.07,
                    paddingBottom: Platform.OS === 'ios' ? 10 : 6
                },
            });
        }
    };

    const handleScroll = (event: any) => {
        const currentOffset = event.nativeEvent.contentOffset.y;
        const direction = currentOffset > lastOffset ? "down" : "up";

        if (currentOffset <= 0) {
            toggleVisibility(true);
        } else if (direction === "down" && currentOffset > 100) {
            toggleVisibility(false);
        } else if (direction === "up") {
            toggleVisibility(true);
        }
        setLastOffset(currentOffset);
    };

    const headerY = scrollAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -initialHeaderHeight - 80], // Extra margin to hide fully
    });

    useEffect(() => {
        return () => {
            // Ensure navigation elements are restored when leaving the screen
            toggleVisibility(true);
        };
    }, []);

    return { handleScroll, headerY, toggleVisibility };
};
