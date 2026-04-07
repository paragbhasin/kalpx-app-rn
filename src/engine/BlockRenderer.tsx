import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useScreenStore } from './useScreenBridge';
import { interpolate } from './utils/interpolation';

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

const blockMap: Record<string, React.ComponentType<any>> = {
  // Original 11 blocks
  headline: HeadlineBlock,
  subtext: SubtextBlock,
  primary_button: PrimaryButtonBlock,
  lotus_logo: LotusLogoBlock,
  choice_card: ChoiceCardBlock,
  choice_grid: ChoiceCardBlock,
  baseline_slider: BaselineSliderBlock,
  image: ImageBlock,
  practice_card: PracticeCardBlock,
  sankalp_display: SankalpDisplayBlock,
  breath_animation: BreathAnimationBlock,
  // Phase 3 blocks (15 new)
  rep_counter: RepCounterBlock,
  mantra_display: MantraDisplayBlock,
  timer_display: TimerDisplayBlock,
  audio_player: AudioPlayerBlock,
  chip_list: ChipListBlock,
  diamond_divider: DiamondDividerBlock,
  grounding_list: GroundingListBlock,
  textarea: TextareaBlock,
  ...(CardListBlock && { card_list: CardListBlock }),
  card_list: CardListBlock,
  completion_card: CompletionCardBlock,
  practice_steps: PracticeStepsBlock,
  progress_bar: ProgressBarBlock,
  hold_trigger: HoldTriggerBlock,
  footer_buttons: FooterButtonsBlock,
  additional_items_section: AdditionalItemsSectionBlock,
};

interface BlockRendererProps {
  block: any;
  textColor?: string;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block, textColor }) => {
  const screenData = useScreenStore((state) => state.screenData);
  
  if (!block) return null;

  // 1. Check Visibility
  if (block.visibility_condition) {
    const condition = block.visibility_condition;
    const value = screenData[condition];
    
    const isVisible = Array.isArray(value) ? value.length > 0 : 
                     typeof value === 'boolean' ? value : !!value;
    
    if (!isVisible) return null;
  }

  // 2. Interpolate
  const interpolatedBlock = interpolate(block, screenData);

  // 3. Render Component
  const Component = blockMap[interpolatedBlock.type];

  if (!Component) {
    return (
      <View style={styles.unknownBlock}>
        <Text style={styles.unknownText}>Unknown block: {interpolatedBlock.type}</Text>
      </View>
    );
  }

  return <Component block={interpolatedBlock} textColor={textColor} />;
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
