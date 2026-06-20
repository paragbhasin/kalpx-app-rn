import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/fonts';

const PREFERRED_LA_KEY = 'kalpx:preferred_la';
const BANNER_DISMISSED_PREFIX = 'kalpx:la_banner_dismissed:';

export type LiveActivityType = 'mantra' | 'sankalp' | 'practice';

interface PreferredLA {
  type: LiveActivityType;
  name: string;
}

interface Props {
  experienceType: LiveActivityType;
  experienceName: string;
}

export function LiveActivityPreferenceBanner({ experienceType, experienceName }: Props) {
  const [visible, setVisible] = useState(false);
  const [conflictModal, setConflictModal] = useState(false);
  const [currentLA, setCurrentLA] = useState<PreferredLA | null>(null);
  const [conflictChoice, setConflictChoice] = useState<'keep' | 'switch'>('keep');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const experienceKey = `${experienceType}:${experienceName}`;
  const dismissedKey = `${BANNER_DISMISSED_PREFIX}${experienceKey}`;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [dismissed, preferredRaw] = await Promise.all([
        AsyncStorage.getItem(dismissedKey),
        AsyncStorage.getItem(PREFERRED_LA_KEY),
      ]);
      if (cancelled) return;
      if (dismissed) return;
      const pref: PreferredLA | null = preferredRaw ? JSON.parse(preferredRaw) : null;
      if (pref && pref.type === experienceType && pref.name === experienceName) return;
      setCurrentLA(pref);
      setVisible(true);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    })();
    return () => { cancelled = true; };
  }, [experienceKey]);

  const dismiss = () => {
    AsyncStorage.setItem(dismissedKey, '1').catch(() => {});
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setVisible(false);
    });
  };

  const handleYes = () => {
    if (currentLA) {
      setConflictChoice('keep');
      setConflictModal(true);
    } else {
      AsyncStorage.setItem(PREFERRED_LA_KEY, JSON.stringify({ type: experienceType, name: experienceName })).catch(() => {});
      dismiss();
    }
  };

  const handleConflictConfirm = () => {
    if (conflictChoice === 'switch') {
      AsyncStorage.setItem(PREFERRED_LA_KEY, JSON.stringify({ type: experienceType, name: experienceName })).catch(() => {});
    }
    setConflictModal(false);
    dismiss();
  };

  if (!visible) return null;

  return (
    <>
      <Animated.View style={[styles.banner, { opacity: fadeAnim }]}>
        <View style={styles.row}>
          <Text style={styles.icon}>🔒</Text>
          <Text style={styles.text} numberOfLines={1}>
            Make this your Live Activity?
          </Text>
          <TouchableOpacity onPress={dismiss} style={styles.notNowBtn} hitSlop={8}>
            <Text style={styles.notNowText}>Not Now</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleYes} style={styles.yesBtn} hitSlop={8}>
            <Text style={styles.yesText}>Yes, Add</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={dismiss} style={styles.closeBtn} hitSlop={10}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Modal visible={conflictModal} transparent animationType="fade" onRequestClose={() => setConflictModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconWrap}>
              <Text style={styles.modalIcon}>⚠</Text>
            </View>
            <Text style={styles.modalTitle}>
              You already have a preferred{'\n'}Live Activity selected.
            </Text>

            <Text style={styles.modalLabel}>Current</Text>
            <View style={styles.modalNameCard}>
              <Text style={styles.modalNameText}>{currentLA?.name ?? ''}</Text>
            </View>

            <Text style={styles.modalLabel}>New</Text>
            <View style={styles.modalNameCard}>
              <Text style={styles.modalNameText}>{experienceName}</Text>
            </View>

            <Text style={styles.modalQuestion}>
              Which would you like to display on your lock screen?
            </Text>

            <TouchableOpacity
              style={[styles.radioRow, conflictChoice === 'keep' && styles.radioRowSelected]}
              onPress={() => setConflictChoice('keep')}
              activeOpacity={0.8}
            >
              <View style={styles.radioOuter}>
                {conflictChoice === 'keep' && <View style={styles.radioInner} />}
              </View>
              <View style={styles.radioTextBlock}>
                <Text style={styles.radioTitle}>Keep Current</Text>
                <Text style={styles.radioSub} numberOfLines={1}>{currentLA?.name ?? ''}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.radioRow, conflictChoice === 'switch' && styles.radioRowSelected]}
              onPress={() => setConflictChoice('switch')}
              activeOpacity={0.8}
            >
              <View style={styles.radioOuter}>
                {conflictChoice === 'switch' && <View style={styles.radioInner} />}
              </View>
              <View style={styles.radioTextBlock}>
                <Text style={styles.radioTitle}>Switch to New</Text>
                <Text style={styles.radioSub} numberOfLines={1}>{experienceName}</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setConflictModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={handleConflictConfirm}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    backgroundColor: '#FDF8EE',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.goldHairline,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 13,
    marginRight: 7,
    flexShrink: 0,
  },
  text: {
    flex: 1,
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: '#432104',
  },
  notNowBtn: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.borderCream,
    marginLeft: 8,
  },
  notNowText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: Colors.brownMuted,
  },
  yesBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: Colors.gold,
    marginLeft: 6,
  },
  yesText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 11,
    color: '#fff',
  },
  closeBtn: {
    paddingVertical: 4,
    paddingLeft: 8,
  },
  closeText: {
    fontSize: 11,
    color: Colors.brownMuted,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.38)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  modalIconWrap: {
    marginBottom: 12,
  },
  modalIcon: {
    fontSize: 28,
    color: Colors.gold,
  },
  modalTitle: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 17,
    color: Colors.brownDeep,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalLabel: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: Colors.brownMuted,
    alignSelf: 'flex-start',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalNameCard: {
    width: '100%',
    backgroundColor: Colors.goldPale,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  modalNameText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: Colors.brownDeep,
    textAlign: 'center',
  },
  modalQuestion: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: Colors.brownDeep,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  radioRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.borderCream,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  radioRowSelected: {
    borderColor: Colors.gold,
    backgroundColor: '#FDF8EE',
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.gold,
  },
  radioTextBlock: {
    flex: 1,
  },
  radioTitle: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 14,
    color: Colors.brownDeep,
  },
  radioSub: {
    fontFamily: Fonts.sans.regular,
    fontSize: 12,
    color: Colors.brownMuted,
    marginTop: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.borderCream,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: Colors.brownMuted,
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: Colors.gold,
    paddingVertical: 14,
    alignItems: 'center',
  },
  confirmText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: '#fff',
  },
});
