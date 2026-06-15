import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  Animated,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Fonts } from '../theme/fonts';
import {
  checkNotificationPermission,
  openNotificationSettings,
} from '../service/notificationPermission';

const STATUS_TOP = Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight ?? 24);
const BANNER_HEIGHT = 36;

// Called by useNotificationPermissionGate when it shows its own modal — prevents double UI
let _externalCollapse: (() => void) | null = null;
export function collapseNotificationBanner() {
  _externalCollapse?.();
}

export function NotificationNudgeBanner() {
  const user = useSelector(
    (state: any) => state.login?.user || state.socialLoginReducer?.user,
  );
  const isLoggedIn = !!user;

  const [show, setShow] = useState(false);
  const dismissed = useRef(false);
  const heightAnim = useRef(new Animated.Value(0)).current;

  const recheck = async () => {
    if (dismissed.current || !isLoggedIn) return;
    const status = await checkNotificationPermission();
    const shouldShow = status === 'denied';
    setShow(shouldShow);
    Animated.timing(heightAnim, {
      toValue: shouldShow ? BANNER_HEIGHT : 0,
      duration: 280,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    // Reset dismiss on login change so a newly-logged-in user sees the banner
    dismissed.current = false;
    recheck();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') recheck();
    });
    return () => sub.remove();
  }, [isLoggedIn]);

  const collapse = (cb?: () => void) => {
    dismissed.current = true;
    Animated.timing(heightAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: false,
    }).start(() => {
      setShow(false);
      cb?.();
    });
  };

  // Register so external callers (permission modal) can collapse this banner
  useEffect(() => {
    _externalCollapse = () => collapse();
    return () => { _externalCollapse = null; };
  });

  if (!show) return null;

  return (
    // Spacer pushes banner below status bar; banner itself is in the normal flow
    <View style={{ paddingTop: STATUS_TOP }}>
      <Animated.View style={[styles.banner, { height: heightAnim }]}>
        <View style={styles.row}>
          <Ionicons name="notifications-off-outline" size={13} color="#F5E8C8" style={styles.icon} />
          <Text style={styles.text} numberOfLines={1}>
            Turn on notifications to get reminders
          </Text>
          <TouchableOpacity onPress={() => collapse()} style={styles.laterBtn} hitSlop={8}>
            <Text style={styles.laterText}>Later</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => collapse(openNotificationSettings)}
            style={styles.enableBtn}
            hitSlop={8}
          >
            <Text style={styles.enableText}>Enable</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#473018',
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 6,
    flexShrink: 0,
  },
  text: {
    flex: 1,
    fontFamily: Fonts.sans.regular,
    fontSize: 11,
    color: '#F5E8C8',
  },
  laterBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  laterText: {
    fontFamily: Fonts.sans.medium,
    fontSize: 11,
    color: '#C4A96A',
  },
  enableBtn: {
    backgroundColor: Colors.goldBright,
    borderRadius: 5,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginLeft: 4,
  },
  enableText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 11,
    color: '#fff',
  },
});
