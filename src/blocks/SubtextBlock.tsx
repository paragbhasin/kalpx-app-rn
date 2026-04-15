import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useScreenStore } from '../engine/useScreenBridge';
import { executeAction } from '../engine/actionExecutor';
import { Fonts } from '../theme/fonts';

interface SubtextBlockProps {
  block: any;
  textColor?: string;
}

const SubtextBlock: React.FC<SubtextBlockProps> = ({ block, textColor }) => {
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
        screenState: { ...screenState },
      });
    } catch (err) {
      console.error('[SubtextBlock] Action failed:', err);
    }
  };

  const isLink = block.variant === 'link' || !!block.action;
  const isSmall = block.variant === 'small';
  const isItalic = block.variant === 'italic' || block.style?.fontStyle === 'italic';
  const isCentered = block.variant === 'centered' || block.style?.textAlign === 'center';

  const textStyle = [
    styles.subtext,
    isSmall && styles.small,
    isItalic && styles.italic,
    isLink && styles.link,
    isCentered && styles.centered,
    textColor ? { color: textColor } : null,
    block.style,
  ];

  // Sanitize: strip raw HTML tags that leak through from server-side templates
  // when an interpolated slot is empty (e.g. "<strong>{{prana_checkin_total}}</strong>"
  // renders literally as "<strong></strong>" when the count binding is absent).
  // TODO(backend): allContainers.js progress_summary subtext should bind
  // prana_checkin_total via schema, not inline HTML template string.
  const sanitize = (v: any) => {
    if (typeof v !== 'string') return v;
    return v.replace(/<[^>]+>/g, '');
  };
  const rendered = sanitize(block.content);

  if (block.action) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        <Text style={textStyle}>{rendered}</Text>
      </TouchableOpacity>
    );
  }

  return <Text style={textStyle}>{rendered}</Text>;
};

const styles = StyleSheet.create({
  subtext: {
    fontSize: 14,
    color: 'rgba(67, 33, 4, 0.8)',
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: Fonts.sans.regular,
    textAlign: 'center',
  },
  small: {
    fontSize: 13,
    lineHeight: 18,
  },
  italic: {
    fontStyle: 'italic',
  },
  link: {
    color: '#615247',
    fontSize: 14,
    textDecorationLine: 'underline',
    marginTop: 8,
    fontFamily: Fonts.sans.medium,
  },
  centered: {
    textAlign: 'center',
  },
});

export default SubtextBlock;
