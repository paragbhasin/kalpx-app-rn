import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/fonts';

interface Props {
  visible: boolean;
  onYes: () => void;
  onNotYet: () => void;
}

export default function AppRatingModal({ visible, onYes, onNotYet }: Props) {
  const slideAnim = useRef(new Animated.Value(80)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 70,
          friction: 11,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(80);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onNotYet} />
        <Animated.View
          style={[styles.card, { transform: [{ translateY: slideAnim }] }]}
        >
          <Text style={styles.lotus}>🪷</Text>
          <Text style={styles.title}>Is KalpX helping you feel more rooted in your day?</Text>
          <View style={styles.btnCol}>
            <TouchableOpacity
              onPress={onYes}
              activeOpacity={0.82}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>Yes, it is</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onNotYet}
              activeOpacity={0.7}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>Not yet</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
    paddingBottom: 34,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: Colors.cream,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  lotus: {
    fontSize: 32,
    marginBottom: 14,
  },
  title: {
    fontFamily: Fonts.serif.regular,
    fontSize: 20,
    color: Colors.brownDeep,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: 24,
  },
  btnCol: {
    width: '100%',
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: Colors.goldBright,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: '#fff',
  },
  secondaryBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: Colors.brownMuted,
  },
});
