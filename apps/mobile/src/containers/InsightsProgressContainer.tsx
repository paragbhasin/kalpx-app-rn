/**
 * InsightsProgressContainer — Shows progress insights, pattern notices,
 * resistance detection, adaptive states, reflections, and engagement recovery.
 *
 * Maps to Vue InsightsProgressContainer.vue.
 *
 * Layout: header / content / footer / page_bottom block sections.
 * Tone: all states use light_sandal theme; background and text color are
 * derived from schema.tone.theme so API-driven overrides work automatically.
 */

import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';
import { useScreenStore } from '../engine/useScreenBridge';
import { Fonts } from '../theme/fonts';

// ---------------------------------------------------------------------------
// Tone mappings (matches AwarenessTriggerContainer / CycleTransitionsContainer)
// ---------------------------------------------------------------------------

const TONE_BACKGROUNDS: Record<string, string> = {
  light_sandal: '#fffdf9',
  gold_dark: '#1a1a1a',
  dark_base: '#0A0A0A',
  portal: '#0f0f0f',
  deep_focus: '#0A0A0A',
};

const TONE_TEXT_COLORS: Record<string, string> = {
  light_sandal: '#2D1F14',
  gold_dark: '#FFFFFF',
  dark_base: '#FFFFFF',
  portal: '#FFFFFF',
  deep_focus: '#FFFFFF',
};

const getBackgroundColor = (theme?: string): string => {
  if (!theme) return TONE_BACKGROUNDS.light_sandal;
  return TONE_BACKGROUNDS[theme] || TONE_BACKGROUNDS.light_sandal;
};

const getTextColor = (theme?: string): string => {
  if (!theme) return TONE_TEXT_COLORS.light_sandal;
  return TONE_TEXT_COLORS[theme] || TONE_TEXT_COLORS.light_sandal;
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InsightsProgressContainerProps {
  schema: any;
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const InsightsProgressContainer: React.FC<InsightsProgressContainerProps> = ({ schema }) => {
  const { updateBackground, updateHeaderHidden, screenData } = useScreenStore();

  // Set background / header visibility on mount
  React.useEffect(() => {
    updateBackground(null);
    updateHeaderHidden(false);
  }, []);

  // Derive tone colours from schema
  const toneTheme = schema?.tone?.theme;
  const backgroundColor = getBackgroundColor(toneTheme);
  const textColor = getTextColor(toneTheme);

  // Tag interpolation (e.g. "Day {{day_number}} Insight")
  const interpolatedTag = useMemo(() => {
    if (!schema?.tag) return null;
    return schema.tag.replace(/\{\{(.*?)\}\}/g, (_match: string, p1: string) => {
      const keys = p1.trim().split('.');
      let v: any = screenData;
      for (const k of keys) {
        v = v?.[k];
      }
      return v !== undefined && v !== null ? String(v) : '';
    });
  }, [schema?.tag, screenData]);

  // Block buckets — split by position
  const blocks = schema?.blocks || [];

  const headerBlocks = useMemo(
    () => blocks.filter((b: any) => b.position === 'header'),
    [blocks],
  );
  const contentBlocks = useMemo(
    () => blocks.filter((b: any) => !b.position || b.position === 'content'),
    [blocks],
  );
  const footerBlocks = useMemo(
    () => blocks.filter((b: any) => b.position === 'footer' || b.position === 'footer_actions'),
    [blocks],
  );
  const pageBottomBlocks = useMemo(
    () => blocks.filter((b: any) => b.position === 'page_bottom'),
    [blocks],
  );

  if (!schema) return null;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Optional tag label */}
        {(schema.tag || interpolatedTag) ? (
          <Text style={[styles.tag, { color: textColor, opacity: 0.5 }]}>
            {interpolatedTag || schema.tag}
          </Text>
        ) : null}

        {/* Header blocks */}
        {headerBlocks.length > 0 && (
          <View style={styles.header}>
            {headerBlocks.map((block: any, i: number) => (
              <BlockRenderer key={`h-${i}`} block={block} textColor={textColor} />
            ))}
          </View>
        )}

        {/* Content blocks */}
        {contentBlocks.length > 0 && (
          <View style={styles.content}>
            {contentBlocks.map((block: any, i: number) => (
              <BlockRenderer key={`c-${i}`} block={block} textColor={textColor} />
            ))}
          </View>
        )}

        {/* Footer action buttons */}
        {footerBlocks.length > 0 && (
          <View style={styles.footer}>
            {footerBlocks.map((block: any, i: number) => (
              <BlockRenderer key={`f-${i}`} block={block} textColor={textColor} />
            ))}
          </View>
        )}

        {/* Page bottom blocks */}
        {pageBottomBlocks.length > 0 && (
          <View style={styles.pageBottom}>
            {pageBottomBlocks.map((block: any, i: number) => (
              <BlockRenderer key={`pb-${i}`} block={block} textColor={textColor} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  tag: {
    fontSize: 10,
    letterSpacing: 2.5,
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: Fonts.sans.bold,
    textTransform: 'uppercase',
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  content: {
    gap: 16,
    marginBottom: 24,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    gap: 12,
  },
  pageBottom: {
    marginTop: 24,
    alignItems: 'center',
    paddingBottom: 20,
  },
});

export default InsightsProgressContainer;
