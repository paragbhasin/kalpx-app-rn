import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useScreenStore } from './useScreenBridge';
import { executeAction } from './actionExecutor';
import { interpolate } from './utils/interpolation';
import { sanitizeStyle } from './utils/sanitizeStyle';

// Existing blocks
import HeadlineBlock from '../blocks/HeadlineBlock';
import SubtextBlock from '../blocks/SubtextBlock';
import PrimaryButtonBlock from '../blocks/PrimaryButtonBlock';
import LotusLogoBlock from '../blocks/LotusLogoBlock';
import ChoiceCardBlock from '../blocks/ChoiceCardBlock';
import BaselineSliderBlock from '../blocks/BaselineSliderBlock';
import ImageBlock from '../blocks/ImageBlock';
import PracticeCardBlock from '../blocks/PracticeCardBlock';
import SankalpDisplayBlock from '../blocks/SankalpDisplayBlock';
import BreathAnimationBlock from '../blocks/BreathAnimationBlock';

// Phase 3 blocks
import RepCounterBlock from '../blocks/RepCounterBlock';
import MantraDisplayBlock from '../blocks/MantraDisplayBlock';
import TimerDisplayBlock from '../blocks/TimerDisplayBlock';
import AudioPlayerBlock from '../blocks/AudioPlayerBlock';
import ChipListBlock from '../blocks/ChipListBlock';
import DiamondDividerBlock from '../blocks/DiamondDividerBlock';
import GroundingListBlock from '../blocks/GroundingListBlock';
import TextareaBlock from '../blocks/TextareaBlock';
import CardListBlock from '../blocks/CardListBlock';
import CompletionCardBlock from '../blocks/CompletionCardBlock';
import PracticeStepsBlock from '../blocks/PracticeStepsBlock';
import ProgressBarBlock from '../blocks/ProgressBarBlock';
import HoldTriggerBlock from '../blocks/HoldTriggerBlock';
import FooterButtonsBlock from '../blocks/FooterButtonsBlock';
import AdditionalItemsSectionBlock from '../blocks/AdditionalItemsSectionBlock';
import ProgressSectionBlock from '../blocks/ProgressSectionBlock';

// Phase 3b blocks (20 more)
import SpacerBlock from '../blocks/SpacerBlock';
import MicroLabelBlock from '../blocks/MicroLabelBlock';
import HelperTextBlock from '../blocks/HelperTextBlock';
import LinkTextBlock from '../blocks/LinkTextBlock';
import LotusHeaderBlock from '../blocks/LotusHeaderBlock';
import InsightBoxBlock from '../blocks/InsightBoxBlock';
import IdentityIndicatorBlock from '../blocks/IdentityIndicatorBlock';
import IdentityDeltaBlock from '../blocks/IdentityDeltaBlock';
import SummaryBlock from '../blocks/SummaryBlock';
import FeedbackRecapBlock from '../blocks/FeedbackRecapBlock';
import RepCounterFeedbackBlock from '../blocks/RepCounterFeedbackBlock';
import TextInputBlock from '../blocks/TextInputBlock';
import OptionPickerBlock from '../blocks/OptionPickerBlock';
import PauseOrbBlock from '../blocks/PauseOrbBlock';
import TimerControlsBlock from '../blocks/TimerControlsBlock';
import ToastMessageBlock from '../blocks/ToastMessageBlock';
import CycleReflectionBlock from '../blocks/CycleReflectionBlock';
import CycleReflectionResultsBlock from '../blocks/CycleReflectionResultsBlock';
import MantraSelectionListBlock from '../blocks/MantraSelectionListBlock';
import TriggerPatternBlock from '../blocks/TriggerPatternBlock';

// Phase 4 blocks (13 niche types)
import ChallengeTextBlock from '../blocks/ChallengeTextBlock';
import FormFieldsBlock from '../blocks/FormFieldsBlock';
import GraphBlock from '../blocks/GraphBlock';
import GuideBlock from '../blocks/GuideBlock';
import HoldButtonBlock from '../blocks/HoldButtonBlock';
import MantraBlock from '../blocks/MantraBlock';
import PracticeBlock from '../blocks/PracticeBlock';
import SankalpBlock from '../blocks/SankalpBlock';
import PressAndHoldBlock from '../blocks/PressAndHoldBlock';
import PressAndHoldCircularBlock from '../blocks/PressAndHoldCircularBlock';
import TimelineBlock from '../blocks/TimelineBlock';
import TrendChartBlock from '../blocks/TrendChartBlock';
import VoiceRecorderBlock from '../blocks/VoiceRecorderBlock';
import ActivityStatsBlock from '../blocks/ActivityStatsBlock';

// Week 1 — Welcome Onboarding blocks (Mitra v3 Moments 1-7)
import OnboardingConversationTurn from '../blocks/OnboardingConversationTurn';
import VoiceTextForkBlock from '../blocks/VoiceTextForkBlock';
import GuidanceModePicker from '../blocks/GuidanceModePicker';
import FirstRecognitionBlock from '../blocks/FirstRecognitionBlock';
import PathEmergesBlock from '../blocks/PathEmergesBlock';

// Week 2 — Day Active Dashboard (Mitra v3 Moments 8-15, 40, 41, 43)
import MorningBriefingBlock from '../blocks/MorningBriefingBlock';
import FocusPhraseBlock from '../blocks/FocusPhraseBlock';
import CoreItemsList from '../blocks/CoreItemsList';
import CheckInCardCompact from '../blocks/CheckInCardCompact';
import CycleSignalBar from '../blocks/CycleSignalBar';
import ClearWindowBanner from '../blocks/ClearWindowBanner';

// Week 3 — Practice Runners + Completion Return (Mitra v3 Moments 17, 18, 19, 32)
import MantraRunnerDisplay from '../blocks/MantraRunnerDisplay';
import SankalpHoldBlock from '../blocks/SankalpHoldBlock';
import PracticeTimerBlock from '../blocks/PracticeTimerBlock';
import CompletionReturnTransient from '../blocks/CompletionReturnTransient';

const blockMap: Record<string, React.ComponentType<any>> = {
  // Original 11 blocks
  headline: HeadlineBlock,
  subtext: SubtextBlock,
  instruction_text: SubtextBlock,
  primary_button: PrimaryButtonBlock,
  lotus_logo: LotusLogoBlock,
  choice_card: ChoiceCardBlock,
  choice_grid: ChoiceCardBlock,
  baseline_slider: BaselineSliderBlock,
  image: ImageBlock,
  practice_card: PracticeCardBlock,
  sankalp_display: SankalpDisplayBlock,
  breath_animation: BreathAnimationBlock,
  // Phase 3a blocks (15)
  rep_counter: RepCounterBlock,
  mantra_display: MantraDisplayBlock,
  timer_display: TimerDisplayBlock,
  audio_player: AudioPlayerBlock,
  chip_list: ChipListBlock,
  diamond_divider: DiamondDividerBlock,
  grounding_list: GroundingListBlock,
  textarea: TextareaBlock,
  card_list: CardListBlock,
  completion_card: CompletionCardBlock,
  practice_steps: PracticeStepsBlock,
  progress_bar: ProgressBarBlock,
  hold_trigger: HoldTriggerBlock,
  footer_buttons: FooterButtonsBlock,
  additional_items_section: AdditionalItemsSectionBlock,
  // Phase 3b blocks (20)
  spacer: SpacerBlock,
  micro_label: MicroLabelBlock,
  helper_text: HelperTextBlock,
  link_text: LinkTextBlock,
  lotus_header: LotusHeaderBlock,
  insight_box: InsightBoxBlock,
  identity_indicator: IdentityIndicatorBlock,
  identity_delta: IdentityDeltaBlock,
  summary_block: SummaryBlock,
  feedback_recap: FeedbackRecapBlock,
  rep_counter_feedback: RepCounterFeedbackBlock,
  text_input: TextInputBlock,
  option_picker: OptionPickerBlock,
  pause_orb: PauseOrbBlock,
  timer_controls: TimerControlsBlock,
  toast_message: ToastMessageBlock,
  cycle_reflection: CycleReflectionBlock,
  cycle_reflection_results: CycleReflectionResultsBlock,
  mantra_selection_list: MantraSelectionListBlock,
  trigger_pattern: TriggerPatternBlock,
  // Phase 4 blocks (13 niche types)
  challenge_text: ChallengeTextBlock,
  form_fields: FormFieldsBlock,
  graph: GraphBlock,
  guide: GuideBlock,
  hold_button: HoldButtonBlock,
  mantra: MantraBlock,
  practice: PracticeBlock,
  sankalp: SankalpBlock,
  press_and_hold: PressAndHoldBlock,
  press_and_hold_circular: PressAndHoldCircularBlock,
  timeline: TimelineBlock,
  trend_chart: TrendChartBlock,
  voice_recorder: VoiceRecorderBlock,
  progress_section: ProgressSectionBlock,
  activity_stats: ActivityStatsBlock,
  // Week 1 — Welcome Onboarding
  onboarding_conversation_turn: OnboardingConversationTurn,
  voice_text_fork: VoiceTextForkBlock,
  guidance_mode_picker: GuidanceModePicker,
  first_recognition: FirstRecognitionBlock,
  path_emerges: PathEmergesBlock,
  // Week 2 — Day Active Dashboard
  morning_briefing: MorningBriefingBlock,
  focus_phrase: FocusPhraseBlock,
  core_items_list: CoreItemsList,
  check_in_card_compact: CheckInCardCompact,
  cycle_signal_bar: CycleSignalBar,
  clear_window_banner: ClearWindowBanner,
  // Week 3 — Practice Runners + Completion Return
  mantra_runner_display: MantraRunnerDisplay,
  sankalp_hold: SankalpHoldBlock,
  practice_timer: PracticeTimerBlock,
  completion_return: CompletionReturnTransient,
};

interface BlockRendererProps {
  block: any;
  textColor?: string;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block, textColor }) => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();

  if (!block) return null;

  // 1. Check Visibility
  // hide_condition: hide this block when the condition field is truthy
  if (block.hide_condition) {
    const hideVal = screenData[block.hide_condition];
    if (hideVal === true || (hideVal && hideVal !== false)) return null;
  }
  if (block.visibility_condition) {
    const condition = block.visibility_condition;
    const value = screenData[condition];

    const isVisible = Array.isArray(value) ? value.length > 0 :
                     typeof value === 'boolean' ? value : !!value;

    if (!isVisible) return null;
  }

  // 2. Interpolate and sanitize styles
  const rawBlock = interpolate(block, screenData);
  const interpolatedBlock = rawBlock.style
    ? { ...rawBlock, style: sanitizeStyle(rawBlock.style) }
    : rawBlock;

  // 3. Render Component
  const Component = blockMap[interpolatedBlock.type];

  if (!Component) {
    return (
      <View style={styles.unknownBlock}>
        <Text style={styles.unknownText}>Unknown block: {interpolatedBlock.type}</Text>
      </View>
    );
  }

  const rendered = <Component block={interpolatedBlock} textColor={textColor} />;

  // 4. Wrap in TouchableOpacity if block has an action property.
  //    This mirrors the web's pattern where ANY block with an `action` is clickable.
  //    Skip wrapping for blocks that already handle their own actions internally
  //    (primary_button, choice_card, choice_grid, hold_button, rep_counter, subtext,
  //    practice_card, hold_trigger, press_and_hold, press_and_hold_circular,
  //    footer_buttons, chip_list, option_picker, timer_controls, cycle_reflection,
  //    mantra_selection_list, alignment_selector, form_fields, baseline_slider,
  //    floating_button).
  const selfActionBlocks = new Set([
    'primary_button', 'choice_card', 'choice_grid', 'hold_button',
    'rep_counter', 'subtext', 'instruction_text', 'practice_card',
    'hold_trigger', 'press_and_hold', 'press_and_hold_circular',
    'footer_buttons', 'chip_list', 'option_picker', 'timer_controls',
    'cycle_reflection', 'mantra_selection_list', 'alignment_selector',
    'form_fields', 'baseline_slider', 'floating_button', 'link_text',
    'card_list', 'insight_box',
    // Week 1 onboarding blocks — all dispatch their own on_response actions
    'onboarding_conversation_turn', 'voice_text_fork', 'guidance_mode_picker',
    // Week 2 dashboard blocks — manage their own taps/dispatch
    'morning_briefing', 'focus_phrase', 'core_items_list',
    'check_in_card_compact', 'cycle_signal_bar', 'clear_window_banner',
    // Week 3 runner blocks — all dispatch their own completion actions
    'mantra_runner_display', 'sankalp_hold', 'practice_timer', 'completion_return',
  ]);

  if (interpolatedBlock.action && !selfActionBlocks.has(interpolatedBlock.type)) {
    const handlePress = async () => {
      try {
        await executeAction(
          { ...interpolatedBlock.action, currentScreen },
          {
            loadScreen,
            goBack,
            setScreenValue: (value: any, key: string) => {
              const { screenActions } = require('../store/screenSlice');
              const { store } = require('../store');
              store.dispatch(screenActions.setScreenValue({ key, value }));
            },
            screenState: { ...screenData },
          },
        );
      } catch (err) {
        console.error('[BlockRenderer] Action execution failed:', err);
      }
    };

    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        {rendered}
      </TouchableOpacity>
    );
  }

  return rendered;
};

const styles = StyleSheet.create({
  unknownBlock: {
    padding: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    marginVertical: 10,
  },
  unknownText: {
    color: '#ef4444',
    fontSize: 12,
  },
});

export default BlockRenderer;
