import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface GroundingItem {
  icon?: string;
  text: string;
}

interface GroundingListBlockProps {
  block: {
    items: GroundingItem[];
    style?: any;
  };
}

const GroundingListBlock: React.FC<GroundingListBlockProps> = ({ block }) => {
  const items = block.items || [];

  return (
    <View style={[styles.container, block?.style]}>
      {items.map((item, index) => (
        <View key={index} style={styles.item}>
          {Boolean(item.icon) && <Text style={styles.icon}>{item.icon}</Text>}
          <Text style={styles.content}>{item.text}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    marginVertical: 16,
    gap: 12,
  },
  item: {
    borderWidth: 0.5,
    borderColor: '#d0902d',
    borderRadius: 15,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    shadowColor: '#d0902d',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  icon: {
    fontSize: 22,
    color: '#B89450',
  },
  content: {
    fontSize: 16,
    color: '#432104',
    fontWeight: '400',
    lineHeight: 22,
    fontFamily: Fonts.sans.regular,
    flexShrink: 1,
  },
});

export default GroundingListBlock;
