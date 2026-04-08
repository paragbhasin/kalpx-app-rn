/**
 * RoutineLockedContainer — Shows locked routine summary after user seals practice.
 *
 * States handled (from allContainers.js):
 *   - locked_summary: read-only view of locked routine (sankalp, reps, duration)
 *   - adjust_with_intention: overlay — confirmation before unlocking for edits
 *   - adjusted_confirmation: post-adjustment confirmation with return home
 *
 * Layout: optional back button, header / scrollable content / sticky footer.
 * Supports overlay mode (schema.overlay) and tone-based backgrounds.
 */

import React, { useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';
import { useScreenStore } from '../engine/useScreenBridge';
import { Fonts } from '../theme/fonts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RoutineLockedContainerProps {
  schema: {
    blocks?: any[];
    overlay?: boolean;
    tone?: {
      theme?: string;
      mood?: string;
    };
    sankalp?: string;
    mantra_reps?: number | string;
    anchor_duration?: number | string;
  };
}

// ---------------------------------------------------------------------------
// Tone -> colour mapping (mirrors web CSS + other RN containers)
// ---------------------------------------------------------------------------

const TONE_BACKGROUNDS: Record<string, string> = {
  light_sandal: '#fffdf9',
  dark_base: '#0A0A0A',
  dark_overlay: 'rgba(10, 10, 10, 0.95)',
  deep_focus: '#0D0D0D',
  gold_dark: '#1a1a0f',
};

const TONE_TEXT_COLORS: Record<string, string> = {
  light_sandal: '#2D1F14',
  dark_base: '#FFFFFF',
  dark_overlay: '#FFFFFF',
  deep_focus: '#FFFFFF',
  gold_dark: '#FFFFFF',
};

const getBackgroundColor = (theme?: string): string => {
  if (!theme) return TONE_BACKGROUNDS.light_sandal;
  return TONE_BACKGROUNDS[theme] || TONE_BACKGROUNDS.light_sandal;
};

const getTextColor = (theme?: string): string => {
  if (!theme) return TONE_TEXT_COLORS.light_sandal;
  return TONE_TEXT_COLORS[theme] || TONE_TEXT_COLORS.light_sandal;
};

const isDarkTone = (theme?: string): boolean => {
  return (
    theme === 'dark_base' ||
    theme === 'dark_overlay' ||
    theme === 'deep_focus' ||
    theme === 'gold_dark'
  );
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const RoutineLockedContainer: React.FC<RoutineLockedContainerProps> = ({ schema }) => {
  const { goBack } = useScreenStore();

  // Derived tone values
  const toneTheme = schema?.tone?.theme;
  const backgroundColor = getBackgroundColor(toneTheme);
  const textColor = getTextColor(toneTheme);
  const dark = isDarkTone(toneTheme);
  const isOverlay = schema?.overlay === true;

  // Block buckets by position
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
    () => blocks.filter((b: any) => b.position === 'footer'),
    [blocks],
  );
  const footerActionBlocks = useMemo(
    () => blocks.filter((b: any) => b.position === 'footer_actions'),
    [blocks],
  );

  const allFooterBlocks = useMemo(
    () => [...footerBlocks, ...footerActionBlocks],
    [footerBlocks, footerActionBlocks],
  );

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleBack = useCallback(() => {
    goBack();
  }, [goBack]);

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const renderBlockList = (blockList: any[], keyPrefix: string) =>
    blockList.map((block: any, idx: number) => (
      <BlockRenderer
        key={`${keyPrefix}-${block.id || block.type}-${idx}`}
        block={block}
        textColor={textColor}
      />
    ));

  // Null guard
  if (!schema) return null;

  // ---------------------------------------------------------------------------
  // Overlay mode (e.g. adjust_with_intention)
  // ---------------------------------------------------------------------------

  if (isOverlay) {
    return (
      <View style={[styles.overlayContainer, { backgroundColor }]}>
        {/* Back / close button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={[styles.backArrow, dark && styles.backArrowLight]}>{'←'}</Text>
        </TouchableOpacity>

        <View style={styles.overlayContent}>
          {/* Header */}
          {headerBlocks.length > 0 && (
            <View style={styles.headerSection}>
              {renderBlockList(headerBlocks, 'oh')}
            </View>
          )}

          {/* Content */}
          <View style={styles.overlayBody}>
            {renderBlockList(contentBlocks, 'oc')}
          </View>

          {/* Footer */}
          {allFooterBlocks.length > 0 && (
            <View style={styles.footerSection}>
              {renderBlockList(allFooterBlocks, 'of')}
            </View>
          )}
        </View>
      </View>
    );
  }

  // ---------------------------------------------------------------------------
  // Standard mode — scrollable with sticky footer
  // ---------------------------------------------------------------------------

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Back button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleBack}
        activeOpacity={0.7}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={[styles.backArrow, dark && styles.backArrowLight]}>{'←'}</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header blocks */}
        {headerBlocks.length > 0 && (
          <View style={styles.headerSection}>
            {renderBlockList(headerBlocks, 'h')}
          </View>
        )}

        {/* Content blocks (summary_block, link_text, subtext, etc.) */}
        <View style={styles.contentSection}>
          {renderBlockList(contentBlocks, 'c')}
        </View>

        {/* Footer blocks (inside scroll — scrolls with content) */}
        {allFooterBlocks.length > 0 && (
          <View style={styles.footerSection}>
            {renderBlockList(allFooterBlocks, 'f')}
          </View>
        )}

        {/* Bottom spacer for safe area */}
        <View style={{ height: 40 }} />
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
    paddingTop: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  headerSection: {
    marginBottom: 32,
    alignItems: 'center',
  },
  contentSection: {
    marginBottom: 24,
  },
  footerSection: {
    marginTop: 40,
    alignItems: 'center',
    gap: 12,
  },
  // Back button
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 18,
    color: '#2D1F14',
    fontFamily: Fonts.sans.regular,
  },
  backArrowLight: {
    color: '#FFFFFF',
  },
  // Overlay mode
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  overlayContent: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  overlayBody: {
    flex: 1,
    justifyContent: 'center',
  },
});

export default RoutineLockedContainer;
