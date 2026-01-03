import React, { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from './Colors';

interface ShimmerPlaceholderProps {
    width?: DimensionValue;
    height?: DimensionValue;
    style?: ViewStyle;
    duration?: number;
}

const ShimmerPlaceholder: React.FC<ShimmerPlaceholderProps> = ({
    width = '100%',
    height = 20,
    style,
    duration = 1500,
}) => {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const startAnimation = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: duration,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        startAnimation();
    }, [animatedValue, duration]);

    const translateX = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-300, 300], // Adjust based on typical width
    });

    return (
        <View style={[styles.container, { width, height }, style]}>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: '#E0E0E0' }]} />
            <Animated.View
                style={{
                    ...StyleSheet.absoluteFillObject,
                    transform: [{ translateX }],
                }}
            >
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.5)', 'transparent']}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
    },
});

export default ShimmerPlaceholder;
