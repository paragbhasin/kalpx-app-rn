/**
 * PortalContainer -- Entry screen: "Your Sanatan Transformation Companion"
 *
 * Schema tone: gold_dark / steady
 * Blocks: lotus_logo, headline, subtext, primary_button ("Begin My Journey")
 *
 * Renders blocks via BlockRenderer with gold-on-dark styling.
 * Background: companion.png (set via updateBackground).
 * Header hidden; fade-in animation on mount.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  ImageBackground,
} from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';
import { useScreenStore } from '../engine/useScreenBridge';
import { Fonts } from '../theme/fonts';

const { width, height } = Dimensions.get('window');

interface PortalContainerProps {
  schema: {
    blocks: any[];
    tone?: {
      theme?: string;
      mood?: string;
    };
  };
}

const PortalContainer: React.FC<PortalContainerProps> = ({ schema }) => {
  const updateBackground = useScreenStore((state) => state.updateBackground);
  const updateHeaderHidden = useScreenStore((state) => state.updateHeaderHidden);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // gold_dark tone -- dark base with companion background image
    updateBackground(require('../../assets/companion.png'));
    updateHeaderHidden(true);

    // Fade-in + slide-up (mirrors web .portal-content transition)
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 100,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 100,
        useNativeDriver: true,
      }),
    ]).start();

    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden]);

  if (!schema) return null;

  const blocks = schema.blocks || [];

  // Determine text color from tone: gold_dark -> gold text on dark
  const textColor = '#eddeb4';

  return (
    <View style={styles.container}>
      {/* Dark overlay to ensure text readability over background image */}
      <View style={styles.darkOverlay} />

      <Animated.ScrollView
        style={[
          styles.scroll,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {blocks.map((block: any, index: number) => (
          <BlockRenderer
            key={block.id || `block-${block.type}-${index}`}
            block={block}
            textColor={textColor}
          />
        ))}

        {/* Bottom spacer for safe scroll area */}
        <View style={{ height: 80 }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(26, 26, 26, 0.45)',
    zIndex: 1,
  },
  scroll: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: height * 0.18,
    paddingBottom: 40,
  },
});

export default PortalContainer;
