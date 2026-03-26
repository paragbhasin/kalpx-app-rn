import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useScreenStore } from './ScreenStore';
import { interpolate } from './utils/interpolation';

// Import blocks (to be created)
import HeadlineBlock from '../blocks/HeadlineBlock';
import SubtextBlock from '../blocks/SubtextBlock';
import PrimaryButtonBlock from '../blocks/PrimaryButtonBlock';
import LotusLogoBlock from '../blocks/LotusLogoBlock';
import ChoiceCardBlock from '../blocks/ChoiceCardBlock';

const blockMap: Record<string, React.ComponentType<any>> = {
  headline: HeadlineBlock,
  subtext: SubtextBlock,
  primary_button: PrimaryButtonBlock,
  lotus_logo: LotusLogoBlock,
  choice_card: ChoiceCardBlock,
};

interface BlockRendererProps {
  block: any;
}

const BlockRenderer: React.FC<BlockRendererProps> = ({ block }) => {
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

  return <Component block={interpolatedBlock} />;
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
