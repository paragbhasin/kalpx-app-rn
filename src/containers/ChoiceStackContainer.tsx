import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Text } from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';
import { useScreenStore } from '../engine/useScreenBridge';
import Header from '../components/Header';

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
  const updateBackground = useScreenStore((state) => state.updateBackground);
  const updateHeaderHidden = useScreenStore((state) => state.updateHeaderHidden);

  useEffect(() => {
    updateBackground(require('../../assets/beige_bg.png'));
    updateHeaderHidden(true);
    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden]);

  const blocks = useMemo(() => schema.blocks || [], [schema.blocks]);

  const headerBlocks = useMemo(() => blocks.filter((b) => b.position === 'header'), [blocks]);
  const contentBlocks = useMemo(() => blocks.filter((b) => !b.position || b.position === 'content'), [blocks]);
  const footerBlocks = useMemo(() => blocks.filter((b) => b.position === 'footer'), [blocks]);

  // Special UI for depth_selection
  const isDepthSelection = schema.id === 'depth_selection';

  return (
    <ScrollView 
      style={styles.scrollView} 
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Header isTransparent={true} />
      {/* Header Section */}
      <View style={styles.header}>
        {headerBlocks.map((block, i) => (
          <BlockRenderer key={`header-${i}`} block={block} textColor="#432104" />
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
          <BlockRenderer key={`content-${i}`} block={block} textColor="#432104" />
        ))}
      </View>

      {/* Footer Section */}
      <View style={styles.footer}>
        <View style={styles.actions}>
          {footerBlocks.map((block, i) => (
            <BlockRenderer key={`footer-${i}`} block={block} textColor="#432104" />
          ))}
        </View>
      </View>
    </ScrollView>
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
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    marginTop: 10,
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
