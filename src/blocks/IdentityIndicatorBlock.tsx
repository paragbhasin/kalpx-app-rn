import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';
import { useScreenStore } from '../engine/useScreenBridge';

interface IdentityIndicatorBlockProps {
  block: {
    identity_key?: string;
    label?: string;
    style?: any;
  };
}

const IdentityIndicatorBlock: React.FC<IdentityIndicatorBlockProps> = ({ block }) => {
  const { screenData: screenState } = useScreenStore();

  const identity = block.label || (screenState[block.identity_key || 'identity'] as string) || 'The Steady Builder';

  return (
    <View style={[styles.container, block?.style]}>
      <Text style={styles.lotus}>{'\u2740'}</Text>
      <Text style={styles.identity}>{identity}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    backgroundColor: 'rgba(201, 168, 76, 0.08)',
    alignSelf: 'center',
    marginVertical: 8,
  },
  lotus: {
    fontSize: 16,
    color: '#C9A84C',
  },
  identity: {
    fontSize: 15,
    fontWeight: '600',
    color: '#432104',
    fontFamily: Fonts.sans.semiBold,
    fontStyle: 'italic',
  },
});

export default IdentityIndicatorBlock;
