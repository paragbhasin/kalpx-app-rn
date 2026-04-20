/**
 * @deprecated 2026-04-20 — Canonical rich runner is
 * `cycle_transitions/offering_reveal`. State id `practice_runner/sankalp_embody`
 * (which mounts this container) was decommissioned post-Wave-3. Stage-1
 * deprecation adds runtime warn + `legacy_runner_rendered` telemetry.
 * DO NOT EXTEND. Coordinated delete in Sprint 3.
 *
 * EmbodimentChallengeRunnerContainer — Runner for embodiment challenge flows.
 *
 * States handled (from allContainers.js):
 *   - challenge_view: Daily embodiment card — micro_label, headline, challenge_text,
 *       subtext, choice_card (Completed / Avoided / Not Tested) with on_select
 *   - challenge_confirm: Outcome confirmation — headline, subtext, primary_button
 *       (Return to Mitra Home)
 *
 * Layout: back button + scrollable header / centered content / sticky footer.
 * Supports tone-based backgrounds (dark_base default), on_select action dispatch,
 * and full block rendering via BlockRenderer.
 */

import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';
import { executeAction } from '../engine/actionExecutor';
import { mitraTrackEvent } from '../engine/mitraApi';
import { useScreenStore } from '../engine/useScreenBridge';
import { Fonts } from '../theme/fonts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EmbodimentChallengeRunnerContainerProps {
  schema: {
    container_id?: string;
    state_id?: string;
    blocks?: any[];
    tone?: {
      theme?: string;
      mood?: string;
    };
    variant?: string;
    on_select?: Record<string, any>;
    meta?: Record<string, any>;
  };
}

// ---------------------------------------------------------------------------
// Tone -> Background / Text color mapping (mirrors web CSS variables)
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
  if (!theme) return TONE_BACKGROUNDS.dark_base;
  return TONE_BACKGROUNDS[theme] || TONE_BACKGROUNDS.dark_base;
};

const getTextColor = (theme?: string): string => {
  if (!theme) return TONE_TEXT_COLORS.dark_base;
  return TONE_TEXT_COLORS[theme] || TONE_TEXT_COLORS.dark_base;
};

const isDarkTone = (theme?: string): boolean => {
  return theme === 'dark_base' || theme === 'dark_overlay' || theme === 'deep_focus' || theme === 'gold_dark';
};

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const EmbodimentChallengeRunnerContainer: React.FC<EmbodimentChallengeRunnerContainerProps> = ({ schema }) => {
  const {
    updateBackground,
    updateHeaderHidden,
    goBack,
    loadScreen,
    screenData,
  } = useScreenStore();

  // Track last on_select value we acted on to avoid re-firing
  const lastOnSelectRef = useRef<string | null>(null);

  // DEPRECATED (2026-04-20). Stage-1 telemetry — any mount indicates a
  // leaked dispatcher to practice_runner/sankalp_embody. Canonical runner
  // is cycle_transitions/offering_reveal.
  useEffect(() => {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(
        "[DEPRECATED] EmbodimentChallengeRunnerContainer rendered — canonical runner is cycle_transitions/offering_reveal. Trace the caller.",
      );
    }
    const ss = screenData as Record<string, any>;
    mitraTrackEvent("legacy_runner_rendered", {
      journeyId: ss.journey_id,
      dayNumber: ss.day_number || 1,
      meta: {
        component: "EmbodimentChallengeRunnerContainer",
        state_id: "practice_runner/sankalp_embody",
        source: ss.runner_source,
      },
    }).catch(() => {});
  }, []);

  // Configure background and header on mount
  useEffect(() => {
    updateBackground(null);
    updateHeaderHidden(true);
  }, [updateBackground, updateHeaderHidden]);

  // Reset on_select tracking when schema changes
  useEffect(() => {
    lastOnSelectRef.current = null;
  }, [schema]);

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const toneTheme = schema?.tone?.theme;
  const backgroundColor = getBackgroundColor(toneTheme);
  const textColor = getTextColor(toneTheme);
  const dark = isDarkTone(toneTheme);

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
  // on_select handler — watches screenData for choice_card selections and
  // fires the matching action from schema.on_select map
  // ---------------------------------------------------------------------------

  const buildActionContext = useCallback(() => {
    const { screenActions } = require('../store/screenSlice');
    const { store } = require('../store');
    return {
      loadScreen,
      goBack,
      setScreenValue: (value: any, key: string) => {
        store.dispatch(screenActions.setScreenValue({ key, value }));
      },
      screenState: screenData,
    };
  }, [loadScreen, goBack, screenData]);

  useEffect(() => {
    if (!schema?.on_select) return;

    // Find choice_card blocks to determine which screenData key holds the selection
    const choiceBlocks = blocks.filter(
      (b: any) => b.type === 'choice_card' || b.type === 'choice_grid',
    );

    for (const choiceBlock of choiceBlocks) {
      const stateKey = choiceBlock.id || 'current_choice';
      const selectedValue = screenData?.[stateKey];

      if (
        selectedValue &&
        typeof selectedValue === 'string' &&
        selectedValue !== lastOnSelectRef.current &&
        schema.on_select[selectedValue]
      ) {
        lastOnSelectRef.current = selectedValue;
        const action = schema.on_select[selectedValue];
        executeAction(action, buildActionContext());
        return; // Only fire once per selection change
      }
    }
  }, [screenData, schema?.on_select, blocks, buildActionContext]);

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
  // Render
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

      {/* Scrollable area: header + content + footer */}
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

        {/* Content blocks — centered for timer/progress/challenge blocks */}
        <View style={styles.contentSection}>
          {renderBlockList(contentBlocks, 'c')}
        </View>

        {/* Footer blocks */}
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
    marginTop: 44,
    marginBottom: 16,
    alignItems: 'center',
  },
  contentSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  footerSection: {
    marginTop: 'auto' as any,
    paddingTop: 16,
    alignItems: 'center',
    gap: 12,
  },
});

export default EmbodimentChallengeRunnerContainer;
