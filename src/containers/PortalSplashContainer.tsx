/**
 * PortalSplashContainer — Animated splash/loading screen before portal.
 * Shows lotus animation, then transitions to content.
 * Background: dark (#1a1a1a). Header hidden.
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';
import { useScreenStore } from '../engine/useScreenBridge';

interface PortalSplashContainerProps {
  schema: any;
}

const PortalSplashContainer: React.FC<PortalSplashContainerProps> = ({ schema }) => {
  const { updateBackground, updateHeaderHidden } = useScreenStore();

  const lotusScale = useRef(new Animated.Value(0.3)).current;
  const lotusOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    updateBackground('#1a1a1a');
    updateHeaderHidden(true);

    // Phase 1: Lotus fades in and scales up
    Animated.parallel([
      Animated.timing(lotusOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(lotusScale, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Phase 2: Lotus fades out, content fades in
      Animated.sequence([
        Animated.timing(lotusOpacity, {
          toValue: 0,
          duration: 600,
          delay: 400,
          useNativeDriver: true,
        }),
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, []);

  if (!schema) return null;

  const blocks = schema.blocks || [];

  return (
    <View style={styles.container}>
      {/* Lotus animation overlay */}
      <Animated.View
        style={[
          styles.lotusContainer,
          {
            opacity: lotusOpacity,
            transform: [{ scale: lotusScale }],
          },
        ]}
        pointerEvents="none"
      >
        <Animated.Text style={styles.lotusEmoji}>{'\u2740'}</Animated.Text>
      </Animated.View>

      {/* Content blocks */}
      <Animated.ScrollView
        style={[styles.scroll, { opacity: contentOpacity }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {blocks.map((block: any, i: number) => (
          <BlockRenderer key={`s-${i}`} block={block} textColor="#eddeb4" />
        ))}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  lotusContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  lotusEmoji: {
    fontSize: 80,
    color: '#eddeb4',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
});

export default PortalSplashContainer;
