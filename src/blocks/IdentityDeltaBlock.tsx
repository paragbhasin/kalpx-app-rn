import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Fonts } from '../theme/fonts';
import { useContentSlots, readMomentSlot } from '../hooks/useContentSlots';
import { useScreenStore } from '../engine/useScreenBridge';

interface IdentityDeltaBlockProps {
  block: {
    old_identity?: string;
    new_identity?: string;
    style?: any;
  };
}

const IdentityDeltaBlock: React.FC<IdentityDeltaBlockProps> = ({ block }) => {
  const { screenData } = useScreenStore();
  const ss = screenData as Record<string, any>;

  useContentSlots({
    momentId: 'M_identity_delta',
    screenDataKey: 'identity_delta',
    buildCtx: (s) => ({
      path: s.journey_path === 'growth' ? 'growth' : 'support',
      guidance_mode: s.guidance_mode || 'hybrid',
      locale: s.locale || 'en',
      user_attention_state: 'reflective_exposed',
      emotional_weight: 'light',
      cycle_day: Number(s.day_number) || 0,
      entered_via: 'dashboard_embed',
      stage_signals: {},
      today_layer: {},
      life_layer: {
        cycle_id: s.journey_id || s.cycle_id || '',
        life_kosha: s.life_kosha || s.scan_focus || '',
        scan_focus: s.scan_focus || '',
      },
    }),
  });
  const slot = (name: string) => readMomentSlot(ss, 'identity_delta', name);

  return (
    <View style={[styles.container, block?.style]}>
      <View style={styles.identityRow}>
        <View style={styles.identityBox}>
          <Text style={styles.label}>{slot('label_before')}</Text>
          <Text style={styles.oldIdentity}>{block.old_identity || ''}</Text>
        </View>

        <Text style={styles.arrow}>{'\u2192'}</Text>

        <View style={styles.identityBox}>
          <Text style={styles.label}>{slot('label_now')}</Text>
          <Text style={styles.newIdentity}>{block.new_identity || ''}</Text>
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
