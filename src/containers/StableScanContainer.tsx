import React, { useMemo, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useScreenStore } from '../engine/useScreenBridge';
import BlockRenderer from '../engine/BlockRenderer';
import Header from '../components/Header';
import GlobalScrollLayout from '../components/GlobalScrollLayout';

interface StableScanContainerProps {
  schema: any;
}

const StableScanContainer: React.FC<StableScanContainerProps> = ({ schema }) => {
  const updateBackground = useScreenStore((state) => state.updateBackground);
  const updateHeaderHidden = useScreenStore((state) => state.updateHeaderHidden);
  const screenState = useScreenStore((state) => state.screenData);

  useEffect(() => {
    // User requested beige_bg only
    updateBackground(require('../../assets/beige_bg.png'));
    updateHeaderHidden(true);
    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden]);

  const dynamicBlocks = useMemo(() => {
    if (!schema.blocks) return [];

    // Deep clone blocks to avoid side effects
    let baseBlocks = JSON.parse(JSON.stringify(schema.blocks));

    // 1. Handle Selection Logic (Matching Vue implementation)
    const selectionBlock = baseBlocks.find((b: any) => b.id === "prana_baseline_selection");

    if (selectionBlock) {
      // Filter options based on scan_focus
      const focusRaw = screenState["scan_focus"] || "peacecalm"; // default matches web
      const focus = Array.isArray(focusRaw) ? focusRaw[0] : focusRaw;

      if (schema.optionsMap && schema.optionsMap[focus]) {
        selectionBlock.options = schema.optionsMap[focus];
      }

      // Add dynamic sliders
      const defaultInternal = selectionBlock.options && selectionBlock.options[0]?.id;
      const selectedId = screenState["prana_baseline_selection"] || defaultInternal;

      if (schema.subCategorySliders) {
        const sliders = schema.subCategorySliders[selectedId];
        if (sliders) {
          const sliderBlocks = sliders.map((s: any) => ({
            type: "baseline_slider",
            label: s.label,
            value: s.value,
            id: `slider-${s.label}`
          }));
          baseBlocks.push(...sliderBlocks);
        }
      }
    }

    // 2. Handle Dynamic Text
    const textBlock = baseBlocks.find((b: any) => b.id === "dynamic_prana_text");
    const subtextBlock = baseBlocks.find((b: any) => b.id === "dynamic_prana_subtext");

    if (selectionBlock) {
      const dynamicMessages = schema.dynamicMessages || {};
      const focusRaw = screenState["scan_focus"] || "default";
      const finalFocusStr = Array.isArray(focusRaw) ? focusRaw[0] : focusRaw;

      const messageObj = dynamicMessages[finalFocusStr] || dynamicMessages.default;

      if (messageObj) {
        if (textBlock) textBlock.content = messageObj.headline || textBlock.content;
        if (subtextBlock) subtextBlock.content = messageObj.subtext || subtextBlock.content;
      }
    }

    return baseBlocks;
  }, [schema.blocks, schema.optionsMap, schema.subCategorySliders, schema.dynamicMessages, screenState]);

  const headerBlocks = dynamicBlocks.filter((b: any) => b.position === "header");
  const contentBlocks = dynamicBlocks.filter((b: any) => !b.position || b.position === "content");
  const footerBlocks = dynamicBlocks.filter((b: any) => b.position === "footer");

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <Header isTransparent={true} />
      
      <View style={styles.headerSection}>
        {headerBlocks.map((block: any, i: number) => (
          <BlockRenderer key={`header-${i}`} block={block} textColor="#432104" />
        ))}
      </View>

      <View style={styles.contentSection}>
        {contentBlocks.map((block: any, i: number) => (
          <React.Fragment key={block.id || `block-${i}`}>
            {block.section_title && (
              <View style={styles.sectionDivider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>{block.section_title}</Text>
                <View style={styles.line} />
              </View>
            )}
            <BlockRenderer block={block} textColor="#432104" />
          </React.Fragment>
        ))}
      </View>

      <View style={styles.footerSection}>
        {footerBlocks.map((block: any, i: number) => (
          <BlockRenderer key={`footer-${i}`} block={block} textColor="#432104" />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerSection: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  contentSection: {
    paddingHorizontal: 16,
    gap: 10,
  },
  footerSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    alignItems: 'center',
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 20,
  },
  dividerText: {
    fontFamily: 'GelicaBold',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#C9A84C',
    fontWeight: '600',
  },
  line: {
    height: 1,
    flex: 1,
    backgroundColor: '#C9A84C',
    opacity: 0.3,
  },
});

export default StableScanContainer;
