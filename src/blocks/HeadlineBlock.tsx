import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface HeadlineBlockProps {
  block: any;
  textColor?: string;
}

// Strip "px" from CSS values for RN compatibility
function sanitizeStyle(style: any): any {
  if (!style || typeof style !== 'object') return style;
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(style)) {
    if (typeof v === 'string' && /^-?\d+(\.\d+)?px$/.test(v)) {
      clean[k] = parseFloat(v);
    } else if (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v) && k !== 'fontWeight' && k !== 'color') {
      clean[k] = parseFloat(v);
    } else if (k === 'fontFamily' && typeof v === 'string' && v.includes('!important')) {
      // Strip !important from font declarations
      clean[k] = v.replace(/\s*!important/, '');
    } else {
      clean[k] = v;
    }
  }
  return clean;
}

const HeadlineBlock: React.FC<HeadlineBlockProps> = ({ block, textColor }) => {
  const cleanStyle = sanitizeStyle(block.style);

  return (
    <Text style={[styles.headline, textColor ? { color: textColor } : null, cleanStyle]}>
      {block.content}
    </Text>
  );
};

const styles = StyleSheet.create({
  headline: {
    fontSize: 20,
    fontWeight: '700',
    color: '#432104',
    marginBottom: 12,
    fontFamily: Fonts.serif.bold,
    textAlign: 'center',
    lineHeight: 28,
  },
});

export default HeadlineBlock;
