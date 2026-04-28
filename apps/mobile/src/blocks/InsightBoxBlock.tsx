import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface InsightBoxBlockProps {
  block: {
    content: string;
    icon?: string;
    title?: string;
    style?: any;
  };
}

const InsightBoxBlock: React.FC<InsightBoxBlockProps> = ({ block }) => {
  return (
    <View style={[styles.card, block?.style]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{block.icon || '\u2728'}</Text>
        {Boolean(block.title) && <Text style={styles.title}>{block.title}</Text>}
      </View>
      <Text style={styles.content}>{block.content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    backgroundColor: 'rgba(255, 253, 249, 0.8)',
    width: '93%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  icon: {
    fontSize: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#432104',
    fontFamily: Fonts.sans.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  content: {
    fontSize: 15,
    color: 'rgba(67, 33, 4, 0.8)',
    fontFamily: Fonts.sans.regular,
    lineHeight: 22,
  },
});

export default InsightBoxBlock;
