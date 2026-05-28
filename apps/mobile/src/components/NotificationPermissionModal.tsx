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
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/fonts';
import { mitraTrackEvent } from '../engine/mitraApi';
import type { NotifPermissionStatus } from '../service/notificationPermission';

interface Props {
  visible: boolean;
  permissionStatus: Extract<NotifPermissionStatus, 'undetermined' | 'denied'>;
  onAllow: () => void;
  onDismiss: () => void;
}

const COPY = {
  undetermined: {
    title: 'Stay connected to your rhythm',
    body: 'Receive gentle reminders for your mantra, sankalp, and daily pauses.',
    primaryCta: 'Allow Gentle Reminders',
    secondaryCta: 'Maybe Later',
  },
  denied: {
    title: 'Notifications are currently off',
    body: 'To receive gentle reminders, allow notifications for KalpX in your device settings.',
    primaryCta: 'Open Settings',
    secondaryCta: 'Not Now',
  },
} as const;

export default function NotificationPermissionModal({
  visible,
  permissionStatus,
  onAllow,
  onDismiss,
}: Props) {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const copy = COPY[permissionStatus] ?? COPY.undetermined;

  useEffect(() => {
    if (visible) {
      mitraTrackEvent('notification_pre_prompt_view', {
        meta: { permission_status: permissionStatus },
      });
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 260,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 60,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(60);
    }
  }, [visible]);

  function handleAllow() {
    mitraTrackEvent('notification_pre_prompt_accept', {
      meta: { permission_status: permissionStatus },
    });
    onAllow();
  }

  function handleDismiss() {
    mitraTrackEvent('notification_pre_prompt_decline', {
      meta: { permission_status: permissionStatus },
    });
    onDismiss();
  }

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />
        <Animated.View
          style={[styles.card, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Icon */}
          <View style={styles.iconWrap}>
            <Ionicons name="notifications-outline" size={26} color={Colors.goldBright} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{copy.title}</Text>

          {/* Body */}
          <Text style={styles.body}>{copy.body}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Primary CTA */}
          <TouchableOpacity
            onPress={handleAllow}
            activeOpacity={0.82}
            style={styles.primaryBtn}
          >
            <Text style={styles.primaryBtnText}>{copy.primaryCta}</Text>
          </TouchableOpacity>

          {/* Secondary CTA */}
          <TouchableOpacity
            onPress={handleDismiss}
            activeOpacity={0.7}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryBtnText}>{copy.secondaryCta}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.52)',
    justifyContent: 'flex-end',
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: Colors.parchment,
    borderRadius: 20,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.goldHairline,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(212,160,23,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  title: {
    fontFamily: Fonts.serif.bold,
    fontSize: 22,
    color: Colors.brownDeep,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 30,
  },
  body: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: Colors.brownMuted,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.goldHairline,
    marginBottom: 20,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: Colors.goldBright,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: '#fff',
    letterSpacing: 0.3,
  },
  secondaryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  secondaryBtnText: {
    fontFamily: Fonts.sans.regular,
    fontSize: 14,
    color: Colors.brownMuted,
  },
});
