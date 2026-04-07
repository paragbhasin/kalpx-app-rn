import React from 'react';
import { View, StyleSheet } from 'react-native';

interface DiamondDividerBlockProps {
  block: {
    style?: any;
  };
}

const DiamondDividerBlock: React.FC<DiamondDividerBlockProps> = ({ block }) => {
  return (
    <View style={[styles.container, block?.style]}>
      <View style={styles.lineLeft} />
      <View style={styles.diamond} />
      <View style={styles.lineRight} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    width: '100%',
    marginVertical: 16,
  },
  lineLeft: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(191, 165, 138, 0.4)',
  },
  lineRight: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(191, 165, 138, 0.4)',
  },
  diamond: {
    width: 8,
    height: 8,
    backgroundColor: '#C9A84C',
    transform: [{ rotate: '45deg' }],
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 2,
  },
});

export default DiamondDividerBlock;
