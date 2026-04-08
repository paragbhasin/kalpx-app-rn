/**
 * ComposerContainer — Sankalp composition and editing screens.
 *
 * States handled (from allContainers.js):
 *   - sankalp_composer: fresh write with textarea, chip suggestions, AI assist link
 *   - ai_suggestions: overlay with AI-generated sankalp choices
 *   - validation_warning: refine prompt when sankalp is too vague/short
 *   - edit_sankalp: pre-loaded editor for existing sankalp
 *   - locked_redirect: redirect when cycle is already active
 *
 * Layout: header / scrollable content / sticky footer (footer + footer_actions).
 * Supports overlay mode (schema.overlay), tone-based backgrounds, back button.
 */

import React, { useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';
import { useScreenStore } from '../engine/useScreenBridge';
import { Fonts } from '../theme/fonts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ComposerContainerProps {
  schema: {
    blocks?: any[];
    overlay?: boolean;
    tone?: {
      theme?: string;
      mood?: string;
      backgroundPosition?: string;
      backgroundSize?: string;
    };
    meta?: {
      min_length?: number;
      max_length?: number;
      allow_ai_assist?: boolean;
      preload_existing?: boolean;
      section_label?: string;
    };
  };
}

// ---------------------------------------------------------------------------
// Tone -> Background/text color mapping (mirrors web CSS variables)
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

const ComposerContainer: React.FC<ComposerContainerProps> = ({ schema }) => {
  const goBack = useScreenStore((state: any) => state.goBack);
  const updateBackground = useScreenStore((state: any) => state.updateBackground);
  const updateHeaderHidden = useScreenStore((state: any) => state.updateHeaderHidden);

  // Hide the app-level header; composer has its own back button
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

  // Combined footer (footer + footer_actions)
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
  // Overlay mode — full-screen semi-transparent overlay (e.g. ai_suggestions)
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
  // Standard mode — scrollable with sticky footer, keyboard-aware for textarea
  // ---------------------------------------------------------------------------

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
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

      {/* Scrollable area: header + content */}
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

        {/* Content blocks (textarea, chip_list, etc.) */}
        <View style={styles.contentSection}>
          {renderBlockList(contentBlocks, 'c')}
        </View>

        {/* Footer blocks inside scroll so they scroll with content on long pages */}
        {allFooterBlocks.length > 0 && (
          <View style={styles.footerSection}>
            {renderBlockList(allFooterBlocks, 'f')}
          </View>
        )}

        {/* Bottom spacer for safe area */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingBottom: 24,
  },
  headerSection: {
    marginBottom: 12,
    gap: 6,
  },
  contentSection: {
    flex: 1,
    gap: 16,
  },
  footerSection: {
    marginTop: 24,
    gap: 12,
    alignItems: 'center',
    paddingBottom: 8,
  },
  bottomSpacer: {
    height: 40,
  },

  // Back button
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 16,
    left: 16,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 20,
    color: '#2D1F14',
    fontFamily: Fonts.sans.medium,
  },
  backArrowLight: {
    color: '#FFFFFF',
  },

  // Overlay layout
  overlayContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 20,
  },
  overlayContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    justifyContent: 'space-between',
  },
  overlayBody: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
});

export default ComposerContainer;
