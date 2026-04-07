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

// Phase 3 blocks — lazy imports to avoid crash if file doesn't exist yet
const lazyImport = (path: string) => {
  try { return require(path).default; } catch { return null; }
};

const RepCounterBlock = lazyImport('../blocks/RepCounterBlock');
const MantraDisplayBlock = lazyImport('../blocks/MantraDisplayBlock');
const TimerDisplayBlock = lazyImport('../blocks/TimerDisplayBlock');
const AudioPlayerBlock = lazyImport('../blocks/AudioPlayerBlock');
const ChipListBlock = lazyImport('../blocks/ChipListBlock');
const DiamondDividerBlock = lazyImport('../blocks/DiamondDividerBlock');
const GroundingListBlock = lazyImport('../blocks/GroundingListBlock');
const TextareaBlock = lazyImport('../blocks/TextareaBlock');
const CardListBlock = lazyImport('../blocks/CardListBlock');
const CompletionCardBlock = lazyImport('../blocks/CompletionCardBlock');
const PracticeStepsBlock = lazyImport('../blocks/PracticeStepsBlock');
const ProgressBarBlock = lazyImport('../blocks/ProgressBarBlock');
const HoldTriggerBlock = lazyImport('../blocks/HoldTriggerBlock');
const FooterButtonsBlock = lazyImport('../blocks/FooterButtonsBlock');
const AdditionalItemsSectionBlock = lazyImport('../blocks/AdditionalItemsSectionBlock');

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
  ...(RepCounterBlock && { rep_counter: RepCounterBlock }),
  ...(MantraDisplayBlock && { mantra_display: MantraDisplayBlock }),
  ...(TimerDisplayBlock && { timer_display: TimerDisplayBlock }),
  ...(AudioPlayerBlock && { audio_player: AudioPlayerBlock }),
  ...(ChipListBlock && { chip_list: ChipListBlock }),
  ...(DiamondDividerBlock && { diamond_divider: DiamondDividerBlock }),
  ...(GroundingListBlock && { grounding_list: GroundingListBlock }),
  ...(TextareaBlock && { textarea: TextareaBlock }),
  ...(CardListBlock && { card_list: CardListBlock }),
  ...(CompletionCardBlock && { completion_card: CompletionCardBlock }),
  ...(PracticeStepsBlock && { practice_steps: PracticeStepsBlock }),
  ...(ProgressBarBlock && { progress_bar: ProgressBarBlock }),
  ...(HoldTriggerBlock && { hold_trigger: HoldTriggerBlock }),
  ...(FooterButtonsBlock && { footer_buttons: FooterButtonsBlock }),
  ...(AdditionalItemsSectionBlock && { additional_items_section: AdditionalItemsSectionBlock }),
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
