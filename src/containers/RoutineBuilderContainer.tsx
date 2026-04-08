/**
 * RoutineBuilderContainer — Routine configuration flow.
 *
 * States (from allContainers.js routine_builder):
 *   - mantra_reps_picker: repetition count selection
 *   - anchor_duration_picker: stabilization time selection
 *   - refinement_layer_menu: observation/embodiment/stability choice
 *   - ai_suggestion_modal: overlay — AI-suggested adjustments
 *   - over_stacking_warning: overlay — intensity caution
 *   - routine_review_summary: summary before locking
 *
 * Layout: header / scrollable content / footer, with overlay support.
 * Tone-aware backgrounds and text colors (light_sandal, dark_overlay, etc.).
 * All actions are routed through blocks (executeAction) — container only renders.
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

interface RoutineBuilderContainerProps {
  schema: {
    blocks?: any[];
    overlay?: boolean;
    tone?: {
      theme?: string;
      mood?: string;
    };
  };
}

// ---------------------------------------------------------------------------
// Tone -> color mapping (mirrors web CSS variables & other RN containers)
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
// Main Component
// ---------------------------------------------------------------------------

const RoutineBuilderContainer: React.FC<RoutineBuilderContainerProps> = ({
  schema,
}) => {
  const { updateBackground, updateHeaderHidden, goBack } = useScreenStore();

  // Configure background and header on mount
  React.useEffect(() => {
    updateBackground(null);
    updateHeaderHidden(true);
    return () => updateHeaderHidden(false);
  }, [updateBackground, updateHeaderHidden]);

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const isOverlay = schema?.overlay === true;
  const toneTheme = schema?.tone?.theme;
  const backgroundColor = getBackgroundColor(toneTheme);
  const textColor = getTextColor(toneTheme);
  const dark = isDarkTone(toneTheme);

  // Block buckets by position
  const blocks = schema?.blocks || [];

  const headerBlocks = useMemo(
    () => blocks.filter((b: any) => b.position === 'header'),
    [blocks],
  );
  const contentBlocks = useMemo(
    () =>
      blocks.filter((b: any) => !b.position || b.position === 'content'),
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
  // Back button handler
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

  // ---------------------------------------------------------------------------
  // Null guard
  // ---------------------------------------------------------------------------

  if (!schema) return null;

  // ---------------------------------------------------------------------------
  // Overlay mode (ai_suggestion_modal, over_stacking_warning)
  // ---------------------------------------------------------------------------

  if (isOverlay) {
    return (
      <View style={[styles.overlayContainer, { backgroundColor }]}>
        {/* Close / back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={[styles.backArrow, dark && styles.backArrowLight]}>
            {'←'}
          </Text>
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
  // Standard mode — scrollable with header / content / footer
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
        <Text style={[styles.backArrow, dark && styles.backArrowLight]}>
          {'←'}
        </Text>
      </TouchableOpacity>

      {/* Scrollable area */}
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

        {/* Content blocks */}
        <View style={styles.contentSection}>
          {renderBlockList(contentBlocks, 'c')}
        </View>

        {/* Footer blocks (scroll with content; flex pushes toward bottom on short pages) */}
        {allFooterBlocks.length > 0 && (
          <View style={styles.footerSection}>
            {renderBlockList(allFooterBlocks, 'f')}
          </View>
        )}

        {/* Bottom safe-area spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  // Standard layout
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },

  // Back button
  backButton: {
    position: 'absolute',
    top: 12,
    left: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  backArrow: {
    fontSize: 20,
    color: '#2D1F14',
    fontFamily: Fonts.sans.medium,
  },
  backArrowLight: {
    color: 'rgba(255, 255, 255, 0.7)',
  },

  // Section layouts
  headerSection: {
    marginTop: 44, // space below back button
    marginBottom: 16,
    alignItems: 'center',
  },
  contentSection: {
    marginBottom: 24,
    gap: 24,
  },
  footerSection: {
    marginTop: 'auto' as any,
    paddingTop: 16,
    alignItems: 'center',
    gap: 12,
  },

  bottomSpacer: {
    height: 40,
  },

  // Overlay layout
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  overlayContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  overlayBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    gap: 24,
  },
});

export default RoutineBuilderContainer;
