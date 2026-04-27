import React from 'react';
import { View, StyleSheet } from 'react-native';
import BlockRenderer from '../engine/BlockRenderer';

interface FooterButtonsBlockProps {
  block: {
    buttons?: any[];
    style?: any;
  };
}

const FooterButtonsBlock: React.FC<FooterButtonsBlockProps> = ({ block }) => {
  const buttons = block.buttons || [];

  if (buttons.length === 0) return null;

  return (
    <View style={[styles.container, block?.style]}>
      {buttons.map((childBlock: any, index: number) => (
        <BlockRenderer key={childBlock.id || `footer-btn-${index}`} block={childBlock} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 16,
    gap: 4,
    alignItems: 'center',
  },
});

export default FooterButtonsBlock;
