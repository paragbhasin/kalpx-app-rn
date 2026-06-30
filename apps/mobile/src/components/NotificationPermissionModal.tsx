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
import { useTranslation } from 'react-i18next';
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

export default function NotificationPermissionModal({
  visible,
  permissionStatus,
  onAllow,
  onDismiss,
}: Props) {
  const { t } = useTranslation();
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
  }, [visible, permissionStatus]);

  function handleAllow() {
    mitraTrackEvent('notification_pre_prompt_accept', {
      meta: { permission_status: permissionStatus },
    });
    onAllow();
  }

  function handleDismiss() {
    onDismiss();
  }

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleDismiss} />
        <Animated.View
          style={[styles.card, { transform: [{ translateY: slideAnim }] }]}
        >
          {/* Icon row */}
          <View style={styles.iconRow}>
            <View style={styles.iconWrap}>
              <Ionicons name="notifications-outline" size={18} color={Colors.goldBright} />
            </View>
            <Text style={styles.title}>{t(`notificationPermission.${permissionStatus}.title`)}</Text>
          </View>

          {/* Body */}
          <Text style={styles.body}>{t(`notificationPermission.${permissionStatus}.body`)}</Text>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              onPress={handleDismiss}
              activeOpacity={0.7}
              style={styles.secondaryBtn}
            >
              <Text style={styles.secondaryBtnText}>{t(`notificationPermission.${permissionStatus}.secondaryCta`)}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleAllow}
              activeOpacity={0.82}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>{t(`notificationPermission.${permissionStatus}.primaryCta`)}</Text>
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
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(212,160,23,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: Colors.brownDeep,
    flex: 1,
  },
  body: {
    fontFamily: Fonts.sans.regular,
    fontSize: 13,
    color: Colors.brownMuted,
    lineHeight: 19,
    marginBottom: 16,
    paddingLeft: 44,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    alignItems: 'center',
  },
  secondaryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  secondaryBtnText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 14,
    color: Colors.brownMuted,
  },
  primaryBtn: {
    backgroundColor: Colors.goldBright,
    borderRadius: 8,
    paddingVertical: 9,
    paddingHorizontal: 18,
  },
  primaryBtnText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 14,
    color: '#fff',
  },
});
