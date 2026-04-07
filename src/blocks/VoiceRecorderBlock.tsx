/**
 * VoiceRecorderBlock — Placeholder block for voice recording (stub with "Coming soon").
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface VoiceRecorderBlockProps {
  block: {
    label?: string;
    style?: any;
  };
}

const VoiceRecorderBlock: React.FC<VoiceRecorderBlockProps> = ({ block }) => {
  return (
    <View style={[styles.container, block?.style]}>
      <View style={styles.iconCircle}>
        <Text style={styles.icon}>{'\uD83C\uDF99'}</Text>
      </View>
      <Text style={styles.label}>{block.label || 'Voice Recording'}</Text>
      <Text style={styles.comingSoon}>Coming soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '93%',
    alignSelf: 'center',
    alignItems: 'center',
    marginVertical: 16,
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.2)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255, 253, 249, 0.5)',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(201, 168, 76, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#432104',
    fontFamily: Fonts.sans.semiBold,
    marginBottom: 4,
  },
  comingSoon: {
    fontSize: 12,
    color: 'rgba(67, 33, 4, 0.4)',
    fontFamily: Fonts.sans.regular,
    fontStyle: 'italic',
  },
});

export default VoiceRecorderBlock;
