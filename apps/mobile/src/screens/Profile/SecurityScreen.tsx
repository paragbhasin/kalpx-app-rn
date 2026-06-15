import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import TextComponent from '../../components/TextComponent';
import { RootState } from '../../store';
import { setPreference } from '../../store/preferencesSlice';
import { BIOMETRIC_TOKEN_KEY, BIOMETRIC_REGISTERED_KEY } from '../../utils/biometricKeys';

const BRAND = '#a67c52';
const GOLD = '#C9A84C';
const BG = '#fffaf5';
const SECTION_LABEL = '#999';

type CapabilityInfo = {
  hasHardware: boolean;
  isEnrolled: boolean;
  // hasFaceRecognition: true on iOS (Face ID) and Android devices with face unlock
  hasFaceRecognition: boolean;
  // hasFingerprint: true on iOS (Touch ID) and Android devices with fingerprint sensor
  hasFingerprint: boolean;
};

const SecurityScreen = () => {
  const navigation: any = useNavigation();
  const dispatch = useDispatch();
  const appLockEnabled = useSelector(
    (state: RootState) => state.preferences.app_lock_enabled,
  );
  const [capability, setCapability] = useState<CapabilityInfo | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    const detect = async () => {
      try {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        setCapability({
          hasHardware,
          isEnrolled,
          hasFaceRecognition: types.includes(
            LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
          ),
          // No platform guard — FINGERPRINT applies to both Touch ID (iOS) and
          // fingerprint sensors (Android)
          hasFingerprint: types.includes(
            LocalAuthentication.AuthenticationType.FINGERPRINT,
          ),
        });
      } catch {
        setCapability({
          hasHardware: false,
          isEnrolled: false,
          hasFaceRecognition: false,
          hasFingerprint: false,
        });
      }
    };
    detect();
  }, []);

  const handleToggle = async (value: boolean) => {
    if (isToggling) return;
    setIsToggling(true);
    try {
      if (value) {
        // Verify identity before enabling — ensures the user can unlock
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Verify your identity to enable App Lock',
          cancelLabel: 'Cancel',
          disableDeviceFallback: false,
          fallbackLabel: 'Use Passcode',
        });
        if (result.success) {
          dispatch(setPreference({ key: 'app_lock_enabled', value: true }));
          // Also register biometric login so "Login with Face ID" appears on login screen
          const refreshToken = await AsyncStorage.getItem('refresh_token');
          if (refreshToken) {
            await SecureStore.setItemAsync(BIOMETRIC_TOKEN_KEY, refreshToken, {
              requireAuthentication: true,
            });
            await AsyncStorage.setItem(BIOMETRIC_REGISTERED_KEY, '1');
          }
        } else if (
          result.error === 'not_available' ||
          result.error === 'not_enrolled'
        ) {
          Alert.alert(
            'App Lock Unavailable',
            Platform.OS === 'ios'
              ? 'Please set up Face ID, Touch ID, or a passcode in Settings before enabling App Lock.'
              : 'Please set up fingerprint, face unlock, or a screen lock PIN in Settings before enabling App Lock.',
          );
        }
        // Cancelled: leave toggle off, no alert needed
      } else {
        dispatch(setPreference({ key: 'app_lock_enabled', value: false }));
        // Also remove biometric login registration
        await AsyncStorage.removeItem(BIOMETRIC_REGISTERED_KEY);
        await SecureStore.deleteItemAsync(BIOMETRIC_TOKEN_KEY).catch(() => {});
      }
    } catch {
      // swallow
    } finally {
      setIsToggling(false);
    }
  };

  const capabilityLabel = (): string => {
    if (!capability) return '';
    const { hasHardware, isEnrolled, hasFaceRecognition, hasFingerprint } =
      capability;

    if (!hasHardware) {
      return Platform.OS === 'ios'
        ? 'Device passcode will be used'
        : 'Screen lock PIN or password will be used';
    }

    if (Platform.OS === 'ios') {
      if (hasFaceRecognition) {
        return isEnrolled
          ? 'Face ID available'
          : 'Face ID not set up — device passcode will be used';
      }
      if (hasFingerprint) {
        return isEnrolled
          ? 'Touch ID available'
          : 'Touch ID not enrolled — device passcode will be used';
      }
      return 'Device passcode will be used';
    }

    // Android
    if (hasFaceRecognition && hasFingerprint) {
      return isEnrolled
        ? 'Face unlock and fingerprint available'
        : 'No biometric enrolled — screen lock PIN will be used';
    }
    if (hasFaceRecognition) {
      return isEnrolled
        ? 'Face unlock available'
        : 'Face unlock not enrolled — screen lock PIN will be used';
    }
    if (hasFingerprint) {
      return isEnrolled
        ? 'Fingerprint available'
        : 'No fingerprint enrolled — screen lock PIN will be used';
    }
    return 'Screen lock PIN or password will be used';
  };

  const capabilityIcon = (): string => {
    if (!capability) return 'phone-portrait-outline';
    if (capability.hasFaceRecognition) return 'scan-outline';
    if (capability.hasFingerprint) return 'finger-print-outline';
    return 'phone-portrait-outline';
  };

  const lockDescription = (): string => {
    if (!capability) return 'Require authentication to open KalpX';
    if (Platform.OS === 'ios') {
      if (capability.hasFaceRecognition)
        return 'Require Face ID or passcode to open KalpX';
      if (capability.hasFingerprint)
        return 'Require Touch ID or passcode to open KalpX';
      return 'Require passcode to open KalpX';
    }
    // Android
    if (capability.hasFaceRecognition && capability.hasFingerprint)
      return 'Require biometric or PIN to open KalpX';
    if (capability.hasFaceRecognition)
      return 'Require face unlock or PIN to open KalpX';
    if (capability.hasFingerprint)
      return 'Require fingerprint or PIN to open KalpX';
    return 'Require screen lock PIN to open KalpX';
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={BRAND} />
        </TouchableOpacity>
        <TextComponent type="headerBoldText" style={styles.headerTitle}>
          Security
        </TextComponent>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.body}>
        <TextComponent type="mediumText" style={styles.sectionLabel}>
          PROTECTION
        </TextComponent>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBadge, { backgroundColor: BRAND + '18' }]}>
                <Ionicons name="lock-closed-outline" size={18} color={BRAND} />
              </View>
              <View style={styles.textBlock}>
                <TextComponent type="headerSubBoldText" style={styles.rowLabel}>
                  App Lock
                </TextComponent>
                <TextComponent type="mediumText" style={styles.rowSub}>
                  {lockDescription()}
                </TextComponent>
              </View>
            </View>
            <Switch
              value={appLockEnabled}
              onValueChange={handleToggle}
              disabled={isToggling}
              trackColor={{ false: '#e0e0e0', true: GOLD + '99' }}
              thumbColor={appLockEnabled ? GOLD : '#f4f3f4'}
              ios_backgroundColor="#e0e0e0"
            />
          </View>
        </View>

        {/* Device capability badge */}
        {capability && (
          <View style={styles.capabilityRow}>
            <Ionicons name={capabilityIcon()} size={13} color="#aaa" />
            <TextComponent type="mediumText" style={styles.capabilityText}>
              {capabilityLabel()}
            </TextComponent>
          </View>
        )}

        {appLockEnabled && (
          <TextComponent type="mediumText" style={styles.hint}>
            App locks after 60 seconds in the background.
          </TextComponent>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e8e2da',
    backgroundColor: '#fff',
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    color: '#1a1a1a',
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 28,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: SECTION_LABEL,
    letterSpacing: 1,
    paddingLeft: 4,
    marginBottom: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBadge: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 15,
    color: '#222',
  },
  rowSub: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
  capabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 6,
    marginTop: 4,
  },
  capabilityText: {
    color: '#aaa',
    fontSize: 12,
  },
  hint: {
    color: '#aaa',
    fontSize: 12,
    paddingLeft: 6,
    marginTop: 4,
  },
});

export default SecurityScreen;
