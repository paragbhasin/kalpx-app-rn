import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Dimensions, Text } from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';
import { useScreenStore } from '../engine/useScreenBridge';
import { Fonts } from '../theme/fonts';
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
    dynamicMessages?: Record<string, any>;
  };
}

const ChoiceStackContainer: React.FC<ChoiceStackContainerProps> = ({ schema }) => {
  const updateBackground = useScreenStore((state: any) => state.updateBackground);
  const updateHeaderHidden = useScreenStore((state: any) => state.updateHeaderHidden);
  const screenData = useScreenStore((state: any) => state.screenData);

  useEffect(() => {
    updateBackground(require('../../assets/beige_bg.png'));
    updateHeaderHidden(true);
    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden]);

  // Dynamic blocks: applies dynamicMessages overrides based on scan_focus and prana_baseline_selection
  const dynamicBlocks = useMemo(() => {
    // Deep clone blocks to avoid mutating props
    const baseBlocks = (schema.blocks || []).map((b: any) =>
      JSON.parse(JSON.stringify(b)),
    );

    const dynamicMessages = schema.dynamicMessages;
    if (!dynamicMessages) return baseBlocks;

    // 1. Get Focus/Category from screen state
    const focusRaw = screenData?.scan_focus || 'default';
    const focus = Array.isArray(focusRaw) ? focusRaw[0] : focusRaw;

    // 2. Get Prana Baseline Selection (sub-category from previous screen)
    const pranaRaw = screenData?.prana_baseline_selection || 'default';
    const prana = Array.isArray(pranaRaw) ? pranaRaw[0] : pranaRaw;

    const categoryMessages = dynamicMessages[focus] || dynamicMessages.default;
    const subCategoryMessages = categoryMessages?.[prana] || {};

    // Update Headline (Priority: Subcategory > Category > Default)
    const headlineBlock = baseBlocks.find((b: any) => b.id === 'depth_headline');
    if (headlineBlock && categoryMessages) {
      headlineBlock.content =
        subCategoryMessages.headline ||
        categoryMessages.headline ||
        headlineBlock.content;
    }

    // Update Option Descriptions (text inside Gentle/Standard/Deep cards)
    const choiceCardBlock = baseBlocks.find((b: any) => b.type === 'choice_card');
    if (choiceCardBlock && categoryMessages) {
      const descriptions =
        subCategoryMessages.option_descriptions ||
        categoryMessages.option_descriptions ||
        {};
      if (choiceCardBlock.options) {
        choiceCardBlock.options.forEach((opt: any) => {
          if (descriptions[opt.id]) {
            opt.description = descriptions[opt.id];
          }
        });
      }
    }

    return baseBlocks;
  }, [schema.blocks, schema.dynamicMessages, screenData?.scan_focus, screenData?.prana_baseline_selection]);

  // Filter blocks by position
  const headerBlocks = useMemo(
    () => dynamicBlocks.filter((b: any) => b.position === 'header'),
    [dynamicBlocks],
  );
  const contentBlocks = useMemo(
    () => dynamicBlocks.filter((b: any) => !b.position || b.position === 'content'),
    [dynamicBlocks],
  );
  const footerBlocks = useMemo(
    () => dynamicBlocks.filter((b: any) => b.position === 'footer'),
    [dynamicBlocks],
  );

  // Special UI flags
  const isDepthSelection = schema.id === 'depth_selection';
  const isDisciplineSelect = schema.id === 'discipline_select';

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        isDepthSelection && styles.depthSelectionPadding,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <Header isTransparent={true} />

      {/* Header Section */}
      <View style={[styles.header, isDisciplineSelect && styles.disciplineHeader]}>
        {headerBlocks.map((block: any, i: number) => (
          <BlockRenderer key={`header-${i}`} block={block} textColor="#432104" />
        ))}
      </View>

      {/* Depth Selection Divider */}
      {isDepthSelection && (
        <View style={styles.depthDivider}>
          <View style={styles.line} />
          <Text style={styles.microLabel}>
            {schema.meta?.section_label || 'CHOOSE YOUR PRACTICE LEVEL'}
          </Text>
          <View style={styles.line} />
        </View>
      )}

      {/* Content Section */}
      <View style={[styles.content, isDisciplineSelect && styles.disciplineContent]}>
        {contentBlocks.map((block: any, i: number) => (
          <BlockRenderer key={`content-${i}`} block={block} textColor="#432104" />
        ))}
      </View>

      {/* Footer Section */}
      <View style={styles.footer}>
        <View style={styles.actions}>
          {footerBlocks.map((block: any, i: number) => (
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
  depthSelectionPadding: {
    paddingHorizontal: 10,
  },
  header: {
    marginTop: 10,
    marginBottom: 6,
    alignItems: 'center',
  },
  disciplineHeader: {
    maxWidth: 560,
    alignSelf: 'center',
    width: '100%',
    marginBottom: 5,
  },
  content: {
    flex: 1,
    width: '100%',
  },
  disciplineContent: {
    width: '100%',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'column',
    gap: 16,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
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
    textTransform: 'uppercase',
    fontFamily: Fonts.sans.bold,
  },
});

export default ChoiceStackContainer;
