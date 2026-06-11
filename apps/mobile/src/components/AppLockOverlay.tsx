import React, { useEffect, useRef } from 'react';
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Android's BiometricPrompt requires the activity to be fully resumed before
// it can be shown. Without a small delay, the prompt fires before the activity
// is ready and is silently dropped.
const AUTO_TRIGGER_DELAY_MS = Platform.OS === 'android' ? 350 : 0;
import Ionicons from 'react-native-vector-icons/Ionicons';
import { OverlayMode } from '../hooks/useAppLock';

type Props = {
  mode: Exclude<OverlayMode, 'hidden'>;
  onUnlock: () => void;
};

export function AppLockOverlay({ mode, onUnlock }: Props) {
  const onUnlockRef = useRef(onUnlock);
  onUnlockRef.current = onUnlock;

  // Auto-trigger biometrics when locked. Android needs a short delay for the
  // activity to fully resume before BiometricPrompt can be shown.
  useEffect(() => {
    if (mode !== 'locked') return;
    const timer = setTimeout(() => {
      onUnlockRef.current();
    }, AUTO_TRIGGER_DELAY_MS);
    return () => clearTimeout(timer);
  }, [mode]);

  const biometricIcon =
    Platform.OS === 'ios' ? 'scan-outline' : 'finger-print-outline';
  const biometricLabel =
    Platform.OS === 'ios' ? 'Unlock with Face ID' : 'Unlock with Biometrics';

  return (
    <View style={styles.overlay}>
      <SafeAreaView style={styles.inner}>
        <View style={styles.content}>
          {mode === 'locked' ? (
            <>
              <View style={styles.lockIconWrap}>
                <Ionicons name="lock-closed" size={48} color="#fff" />
              </View>
              <Text style={styles.title}>KalpX Locked</Text>
              <TouchableOpacity
                style={styles.unlockBtn}
                onPress={onUnlock}
                activeOpacity={0.75}
              >
                <Ionicons name={biometricIcon} size={20} color="#fff" />
                <Text style={styles.unlockBtnText}>{biometricLabel}</Text>
              </TouchableOpacity>
            </>
          ) : (
            // Privacy mode — blank dark screen hides content in app switcher
            null
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 9999,
  },
  inner: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  lockIconWrap: {
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 50,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  unlockBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
