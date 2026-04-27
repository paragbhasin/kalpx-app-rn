/**
 * BalancedAckOverlay — Week 4 Moment 22 post-regulation acknowledgment.
 *
 * Web parity: kalpx-frontend/src/containers/AwarenessTriggerContainer.vue
 * (balanced trigger state — celebration/ack). Spec:
 * overlay_checkin_balanced_ack.md §1, §4.
 *
 * Brief overlay shown after submit_checkin. Single line Mitra card:
 *   "You named it. That's already part of settling."
 * + primary pill "Return to Mitra Home" (explicit navigate to dashboard,
 * REG-015 isolation — does NOT touch runner_* fields).
 *
 * Auto-dismiss after 4s if user does not tap; otherwise manual dismiss.
 * Tone rule: exactly the one ack line. No exclamations, no embellishment.
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Fonts } from '../theme/fonts';
import { executeAction } from '../engine/actionExecutor';
import { useScreenStore } from '../engine/useScreenBridge';
import store from '../store';
import { screenActions } from '../store/screenSlice';
import { mitraTrackEvent } from '../engine/mitraApi';

const AUTO_DISMISS_MS = 4000;

const BalancedAckOverlay: React.FC<{ block?: any }> = () => {
  const { screenData, loadScreen, goBack, currentScreen } = useScreenStore();
  const fade = useRef(new Animated.Value(0)).current;
  const dismissedRef = useRef(false);

  useEffect(() => {
    Animated.timing(fade, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    mitraTrackEvent('checkin_balanced_ack_shown', { meta: {} }).catch(() => {});
    const t = setTimeout(() => dismiss(), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    // REG-015: explicit navigate — do not rely on stack pop. Cleanup of
    // checkin_* fields is handled by the action handler.
    executeAction(
      {
        type: 'navigate',
        target: { container_id: 'companion_dashboard', state_id: 'day_active' },
        currentScreen,
      } as any,
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) =>
          store.dispatch(screenActions.setScreenValue({ key, value })),
        screenState: { ...screenData },
      },
    ).catch(() => {});
  };

  return (
    <Animated.View style={[styles.root, { opacity: fade }]}>
      <View style={styles.card}>
        <Text style={styles.ackText}>
          You named it. That&apos;s already part of settling.
        </Text>
      </View>
      <TouchableOpacity
        style={styles.pill}
        onPress={dismiss}
        accessibilityRole="button"
        accessibilityLabel="Return to Mitra Home"
      >
        <Text style={styles.pillText}>Return to Mitra Home</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFF8EF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderLeftWidth: 3,
    borderLeftColor: '#eddeb4',
    paddingLeft: 16,
    paddingVertical: 12,
    marginBottom: 40,
    maxWidth: 320,
  },
  ackText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 20,
    lineHeight: 30,
    color: '#FFF8EF',
  },
  pill: {
    backgroundColor: '#eddeb4',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 999,
    minWidth: 260,
    alignItems: 'center',
  },
  pillText: {
    fontFamily: Fonts.sans.semiBold,
    fontSize: 15,
    color: '#fffdf9',
    letterSpacing: 0.3,
  },
});

export default BalancedAckOverlay;
