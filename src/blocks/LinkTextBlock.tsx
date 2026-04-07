import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';
import { executeAction } from '../engine/actionExecutor';
import { useScreenStore } from '../engine/useScreenBridge';

interface LinkTextBlockProps {
  block: {
    content: string;
    action?: any;
    style?: any;
  };
}

const LinkTextBlock: React.FC<LinkTextBlockProps> = ({ block }) => {
  const { loadScreen, goBack, screenData: screenState } = useScreenStore();

  const handlePress = async () => {
    if (!block.action) return;
    try {
      await executeAction(block.action, {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) => {
          const { screenActions } = require('../store/screenSlice');
          const { store } = require('../store');
          store.dispatch(screenActions.setScreenValue({ key, value }));
        },
        screenState,
      });
    } catch (err) {
      console.error('[LinkTextBlock] Action failed:', err);
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Text style={[styles.link, block?.style]}>{block.content}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  link: {
    fontSize: 14,
    color: '#C9A84C',
    fontFamily: Fonts.sans.medium,
    textDecorationLine: 'underline',
    textAlign: 'center',
    marginVertical: 8,
  },
});

export default LinkTextBlock;
