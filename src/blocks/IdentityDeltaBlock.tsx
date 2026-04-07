import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';

interface IdentityDeltaBlockProps {
  block: {
    old_identity?: string;
    new_identity?: string;
    style?: any;
  };
}

const IdentityDeltaBlock: React.FC<IdentityDeltaBlockProps> = ({ block }) => {
  return (
    <View style={[styles.container, block?.style]}>
      <View style={styles.identityRow}>
        <View style={styles.identityBox}>
          <Text style={styles.label}>Before</Text>
          <Text style={styles.oldIdentity}>{block.old_identity || 'Seeker'}</Text>
        </View>

        <Text style={styles.arrow}>{'\u2192'}</Text>

        <View style={styles.identityBox}>
          <Text style={styles.label}>Now</Text>
          <Text style={styles.newIdentity}>{block.new_identity || 'Builder'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 12,
    width: '93%',
    alignSelf: 'center',
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  identityBox: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
    backgroundColor: 'rgba(255, 253, 249, 0.8)',
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: 'rgba(67, 33, 4, 0.5)',
    fontFamily: Fonts.sans.regular,
  },
  oldIdentity: {
    fontSize: 15,
    color: 'rgba(67, 33, 4, 0.6)',
    fontFamily: Fonts.serif.regular,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  newIdentity: {
    fontSize: 16,
    fontWeight: '700',
    color: '#C9A84C',
    fontFamily: Fonts.serif.bold,
    textAlign: 'center',
  },
  arrow: {
    fontSize: 24,
    color: '#C9A84C',
  },
});

export default IdentityDeltaBlock;
