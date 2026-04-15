import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface SummaryBlockProps {
  block: {
    title?: string;
    items?: string[];
    content?: string;
    style?: any;
  };
}

const SummaryBlock: React.FC<SummaryBlockProps> = ({ block }) => {
  return (
    <View style={[styles.card, block?.style]}>
      {Boolean(block.title) && <Text style={styles.title}>{block.title}</Text>}

      {block.items && block.items.length > 0 ? (
        <View style={styles.list}>
          {(block.items as any[]).map((item, index) => {
            const text =
              typeof item === 'string'
                ? item
                : (item && typeof item === 'object'
                    ? ((item as any).title || (item as any).text || (item as any).label || (item as any).instruction || '')
                    : '');
            return (
              <View key={index} style={styles.bulletRow}>
                <Text style={styles.bullet}>{'\u2022'}</Text>
                <Text style={styles.itemText}>{text}</Text>
              </View>
            );
          })}
        </View>
      ) : block.content ? (
        <Text style={styles.content}>{block.content}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    borderRadius: 20,
    padding: 24,
    marginVertical: 10,
    backgroundColor: 'rgba(255, 253, 249, 0.85)',
    width: '93%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#432104',
    fontFamily: Fonts.serif.bold,
    marginBottom: 14,
    textAlign: 'center',
  },
  list: {
    gap: 8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    fontSize: 16,
    color: '#C9A84C',
    lineHeight: 22,
  },
  itemText: {
    fontSize: 15,
    color: 'rgba(67, 33, 4, 0.8)',
    fontFamily: Fonts.sans.regular,
    lineHeight: 22,
    flex: 1,
  },
  content: {
    fontSize: 15,
    color: 'rgba(67, 33, 4, 0.8)',
    fontFamily: Fonts.sans.regular,
    lineHeight: 22,
  },
});

export default SummaryBlock;
