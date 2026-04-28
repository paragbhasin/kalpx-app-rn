import React from 'react';
import { View, StyleSheet } from 'react-native';

interface SpacerBlockProps {
  block: {
    height?: number;
    style?: any;
  };
}

const SpacerBlock: React.FC<SpacerBlockProps> = ({ block }) => {
  return <View style={[styles.spacer, { height: block.height || 16 }, block?.style]} />;
};

const styles = StyleSheet.create({
  spacer: {
    width: '100%',
  },
});

export default SpacerBlock;
