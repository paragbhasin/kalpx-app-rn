import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, ImageBackground, Dimensions, Text } from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';

const { width, height } = Dimensions.get('window');

interface ChoiceStackContainerProps {
  schema: {
    id?: string;
    blocks: any[];
    tone?: {
      theme?: string;
      mood?: string;
      backgroundPosition?: string;
      backgroundSize?: string;
    };
    meta?: {
      section_label?: string;
    };
  };
}

const ChoiceStackContainer: React.FC<ChoiceStackContainerProps> = ({ schema }) => {
  const blocks = useMemo(() => schema.blocks || [], [schema.blocks]);

  const headerBlocks = useMemo(() => blocks.filter((b) => b.position === 'header'), [blocks]);
  const contentBlocks = useMemo(() => blocks.filter((b) => !b.position || b.position === 'content'), [blocks]);
  const footerBlocks = useMemo(() => blocks.filter((b) => b.position === 'footer'), [blocks]);

  // Special UI for depth_selection
  const isDepthSelection = schema.id === 'depth_selection';

  return (
    <ImageBackground 
      source={require('../../assets/beige_bg.png')} // Fallback or dynamic
      style={styles.container}
      resizeMode="cover"
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          {headerBlocks.map((block, i) => (
            <BlockRenderer key={`header-${i}`} block={block} />
          ))}
        </View>

        {/* Depth Selection Divider */}
        {isDepthSelection && (
          <View style={styles.depthDivider}>
            <View style={styles.line} />
            <Text style={styles.microLabel}>
              {schema.meta?.section_label || "CHOOSE YOUR PRACTICE LEVEL"}
            </Text>
            <View style={styles.line} />
          </View>
        )}

        {/* Content Section */}
        <View style={styles.content}>
          {contentBlocks.map((block, i) => (
            <BlockRenderer key={`content-${i}`} block={block} />
          ))}
        </View>

        {/* Footer Section */}
        <View style={styles.footer}>
          <View style={styles.actions}>
            {footerBlocks.map((block, i) => (
              <BlockRenderer key={`footer-${i}`} block={block} />
            ))}
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 15,
  },
  header: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  depthDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    marginVertical: 15,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#D9A557',
  },
  microLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#CC9B2F',
    fontFamily: 'GelicaBold',
  },
});

export default ChoiceStackContainer;
