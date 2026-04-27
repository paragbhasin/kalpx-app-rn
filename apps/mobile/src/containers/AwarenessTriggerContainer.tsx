/**
 * AwarenessTriggerContainer — Dedicated container for the full awareness trigger flow.
 *
 * States handled (from allContainers.js):
 *   - midday_prompt: pause-and-check-in screen
 *   - response_matrix: feeling selection (choice_card)
 *   - trigger_entry: "I Feel Triggered" entry point
 *   - breath_reset: 3-breath animation with sankalp
 *   - sensory_grounding: 5-4-3-2-1 grounding exercise
 *   - trigger_reflection: how-are-you-feeling chips + textarea + share
 *   - trigger_advice_reveal: guidance text + suggested mantra cards + Start Practice
 *   - calm_down_advice: overlay — observer message + return home
 *   - dharmic_response: response selection (choice_card)
 *   - post_trigger_reinforcement: "Return steady" confirmation
 *   - trigger_pattern_graph: pattern insight graph
 *   - drift_warning: overlay — emotional drift soft warning
 *   - trigger_recheck: recheck chips + share + return home
 *   - nervous_stabilization: stabilization prompt
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
  Dimensions,
} from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';
import { useScreenStore } from '../engine/useScreenBridge';
import { Fonts } from '../theme/fonts';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AwarenessTriggerContainerProps {
  schema: {
    blocks?: any[];
    steps?: any[];
    complete_action?: any;
    overlay?: boolean;
    tone?: {
      theme?: string;
      mood?: string;
      backgroundPosition?: string;
      backgroundSize?: string;
    };
  };
}

// ---------------------------------------------------------------------------
// Tone -> Background color mapping (mirrors web CSS variables)
// ---------------------------------------------------------------------------

const TONE_BACKGROUNDS: Record<string, string> = {
  light_sandal: '#fffdf9',    // warm cream (primary trigger flow bg)
  dark_base: '#0A0A0A',       // deep dark
  dark_overlay: 'rgba(10, 10, 10, 0.95)', // overlay dark
  deep_focus: '#0D0D0D',      // deep focus dark
  gold_dark: '#1a1a0f',       // gold-tinted dark
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
  return theme === 'dark_base' || theme === 'dark_overlay' || theme === 'deep_focus' || theme === 'gold_dark';
};

// ---------------------------------------------------------------------------
// Step Renderers (for question/breath step-based flows)
// ---------------------------------------------------------------------------

interface StepProps {
  step: any;
  onNext: () => void;
  textColor: string;
}

const QuestionStep: React.FC<StepProps> = ({ step, onNext, textColor }) => (
  <View style={stepStyles.questionContainer}>
    <Text style={[stepStyles.questionText, { color: textColor, fontFamily: Fonts.serif.regular }]}>
      {step.text}
    </Text>
    <View style={stepStyles.choicesGrid}>
      {step.choices?.map((choice: any, idx: number) => (
        <TouchableOpacity
          key={choice.text || idx}
          style={stepStyles.choiceButton}
          onPress={onNext}
          activeOpacity={0.7}
        >
          <Text style={stepStyles.choiceText}>{choice.text}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const BreathStep: React.FC<StepProps> = ({ step, onNext, textColor }) => (
  <TouchableOpacity
    style={stepStyles.breathContainer}
    onPress={onNext}
    activeOpacity={0.8}
  >
    <Text style={[stepStyles.instructionText, { color: textColor, fontFamily: Fonts.serif.regular }]}>
      {step.text}
    </Text>
    <View style={stepStyles.breathCircle} />
    <Text style={stepStyles.hintText}>
      {step.hint_text || 'Tap when centered'}
    </Text>
  </TouchableOpacity>
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

const AwarenessTriggerContainer: React.FC<AwarenessTriggerContainerProps> = ({ schema }) => {
  const {
    updateBackground,
    updateHeaderHidden,
    goBack,
    loadScreen,
    screenData,
  } = useScreenStore();

  // Step-based flow state
  const [currentStep, setCurrentStep] = React.useState(0);

  // Configure background and header on mount
  React.useEffect(() => {
    updateBackground(null);
    // Hide the default app header; this container manages its own nav
    updateHeaderHidden(true);
  }, [updateBackground, updateHeaderHidden]);

  // Reset step index when schema changes
  React.useEffect(() => {
    setCurrentStep(0);
  }, [schema]);

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
  const pageBottomBlocks = useMemo(
    () => blocks.filter((b: any) => b.position === 'page_bottom'),
    [blocks],
  );

  // Combined footer (footer + footer_actions)
  const allFooterBlocks = useMemo(
    () => [...footerBlocks, ...footerActionBlocks],
    [footerBlocks, footerActionBlocks],
  );

  // Steps (question/breath flows)
  const steps = schema?.steps || [];
  const hasSteps = steps.length > 0;

  // ---------------------------------------------------------------------------
  // Step navigation
  // ---------------------------------------------------------------------------

  const handleNextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else if (schema?.complete_action) {
      // Last step — execute complete_action
      const { executeAction } = require('../engine/actionExecutor');
      const { screenActions } = require('../store/screenSlice');
      const { store } = require('../store');
      executeAction(schema.complete_action, {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) => {
          store.dispatch(screenActions.setScreenValue({ key, value }));
        },
        screenState: screenData,
      });
    }
  }, [currentStep, steps.length, schema?.complete_action, loadScreen, goBack, screenData]);

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
      <BlockRenderer key={`${keyPrefix}-${block.id || block.type}-${idx}`} block={block} />
    ));

  const renderStepContent = () => {
    const step = steps[currentStep];
    if (!step) return null;

    if (step.type === 'question') {
      return <QuestionStep step={step} onNext={handleNextStep} textColor={textColor} />;
    }
    if (step.type === 'breath') {
      return <BreathStep step={step} onNext={handleNextStep} textColor={textColor} />;
    }

    // Fallback: render step text
    return (
      <View style={stepStyles.questionContainer}>
        <Text style={[stepStyles.questionText, { color: textColor, fontFamily: Fonts.serif.regular }]}>
          {step.text}
        </Text>
      </View>
    );
  };

  // ---------------------------------------------------------------------------
  // Null guard
  // ---------------------------------------------------------------------------

  if (!schema) return null;

  // ---------------------------------------------------------------------------
  // Overlay mode — full-screen semi-transparent overlay
  // ---------------------------------------------------------------------------

  if (isOverlay) {
    return (
      <View style={[styles.overlayContainer, { backgroundColor: backgroundColor }]}>
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

      {/* Scrollable area: header + content (+ step content) */}
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

        {/* Step-based content (question/breath flows) */}
        {hasSteps ? (
          <View style={styles.stepContent}>
            {renderStepContent()}
          </View>
        ) : (
          /* Block-based content */
          <View style={styles.contentSection}>
            {renderBlockList(contentBlocks, 'c')}
          </View>
        )}

        {/* Page bottom blocks (non-sticky, scroll with content) */}
        {pageBottomBlocks.length > 0 && (
          <View style={styles.pageBottomSection}>
            {renderBlockList(pageBottomBlocks, 'pb')}
          </View>
        )}

        {/*
         * Footer blocks inside scroll so they scroll with content on long pages.
         * For short content pages, the flex spacer above pushes them toward the bottom.
         */}
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  },
  footerSection: {
    marginTop: 'auto' as any,
    paddingTop: 16,
    alignItems: 'center',
    gap: 12,
  },
  pageBottomSection: {
    marginTop: 24,
    alignItems: 'center',
    paddingBottom: 20,
  },

  // Step content
  stepContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
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
  },
});

// ---------------------------------------------------------------------------
// Step styles
// ---------------------------------------------------------------------------

const stepStyles = StyleSheet.create({
  questionContainer: {
    width: '100%',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 36,
  },
  choicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
  },
  choiceButton: {
    width: (SCREEN_WIDTH - 80) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  choiceText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.sans.regular,
    textAlign: 'center',
  },
  breathContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  instructionText: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 40,
  },
  breathCircle: {
    width: 150,
    height: 150,
    borderWidth: 2,
    borderColor: '#C9A84C',
    borderRadius: 75,
    marginVertical: 40,
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.3)',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontSize: 12,
    fontFamily: Fonts.sans.regular,
  },
});

export default AwarenessTriggerContainer;
