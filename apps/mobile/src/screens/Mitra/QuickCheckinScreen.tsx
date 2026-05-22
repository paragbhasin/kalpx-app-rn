import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { isValidRoomId } from '@kalpx/contracts';
import type {
  QuickCheckinEnergyState,
  QuickCheckinResponse,
} from '@kalpx/types';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { executeAction } from '../../engine/actionExecutor';
import { postQuickCheckin } from '../../engine/mitraApi';
import { useScreenStore } from '../../engine/useScreenBridge';
import { Fonts } from '../../theme/fonts';
import { platformShadow } from "../../theme/shadows";

const BEIGE_BG = require('../../../assets/beige_bg.webp');

const DOOR_ROUTES: Record<string, string> = {
  my_rhythm: 'RhythmHome',
  inner_path: 'InnerPath',
  quick_reset: 'QuickReset',
  tell_mitra: 'TellMitra',
};

const ROOM_CTA_LABELS: Record<string, string> = {
  room_stillness: 'Go to Find Calm',
  room_release: 'Set It Down',
  room_joy: "Notice What's Good",
  room_growth: 'Take the Next Step',
  room_clarity: 'Go to Find Clarity',
  room_connection: 'Open Connection',
};

const DOOR_CTA_LABELS: Record<string, string> = {
  my_rhythm: 'Go to My Rhythm',
  inner_path: 'Continue Your Path',
  quick_reset: 'Quick Reset',
  tell_mitra: 'Tell Mitra more',
};

const ENERGY_OPTIONS: {
  label: string;
  value: QuickCheckinEnergyState;
  desc: string;
  icon: React.ReactNode;
}[] = [
  {
    label: 'Energized',
    value: 'energized',
    desc: 'Ready and moving',
    icon: <Ionicons name="sunny-outline" size={30} color="#D4A017" />,
  },
  {
    label: 'Balanced',
    value: 'balanced',
    desc: 'Steady and clear',
    icon: (
      <MaterialCommunityIcons
        name="flower-outline"
        size={30}
        color="#D4A017"
      />
    ),
  },
  {
    label: 'Agitated',
    value: 'agitated',
    desc: 'Restless or tense',
    icon: <Ionicons name="flash-outline" size={30} color="#D4A017" />,
  },
  {
    label: 'Drained',
    value: 'drained',
    desc: 'Low or heavy',
    icon: <Ionicons name="rainy-outline" size={30} color="#D4A017" />,
  },
];

function getSuggestedRoomLabel(result: QuickCheckinResponse): string | null {
  return (
    (result as any).suggested_room_label ??
    (result as any).room_label ??
    null
  );
}

function getSuggestedRoomDescription(result: QuickCheckinResponse): string | null {
  return (
    (result as any).suggested_room_description ??
    (result as any).room_description ??
    null
  );
}

export default function QuickCheckinScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const screenData = useScreenStore((state) => state.screenData);
  const updateBackground = useScreenStore((state) => state.updateBackground);

  useFocusEffect(
    useCallback(() => {
      updateBackground(BEIGE_BG);
      return () => updateBackground(null);
    }, [updateBackground]),
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuickCheckinResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<QuickCheckinEnergyState | null>(
    null,
  );

  const ctaLabel = useMemo(() => {
    if (!result) return 'Continue';
    if (
      result.suggested_action === 'navigate_to_room' &&
      result.suggested_room_id
    ) {
      return ROOM_CTA_LABELS[result.suggested_room_id] ?? 'Go to Practice';
    }
    if (
      result.suggested_action === 'navigate_to_door' &&
      result.suggested_door
    ) {
      return DOOR_CTA_LABELS[result.suggested_door] ?? 'Continue';
    }
    return 'Return Home';
  }, [result]);

  const handleProceed = useCallback(async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    try {
      const res = await postQuickCheckin(selected);
      setResult(res);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selected]);

  const handleCTA = useCallback(() => {
    if (!result) return;
    if (
      result.suggested_action === 'navigate_to_room' &&
      isValidRoomId(result.suggested_room_id)
    ) {
      void executeAction(
        {
          type: 'enter_room',
          payload: {
            room_id: result.suggested_room_id,
            source: 'quick_checkin',
          },
        } as any,
        {
          dispatch,
          screenData,
          currentStateId: 'quick_checkin',
        } as any,
      );
      return;
    }

    if (
      result.suggested_action === 'navigate_to_door' &&
      result.suggested_door
    ) {
      navigation.navigate(DOOR_ROUTES[result.suggested_door] ?? 'Home');
      return;
    }

    navigation.navigate('Home');
  }, [dispatch, navigation, result, screenData]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ImageBackground
        source={BEIGE_BG}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.shell}>
            {!result ? (
              <>
                <View style={styles.introBlock}>
                  <View style={styles.sparkleRow}>
                    <View style={styles.sparkleLine} />
                    <Ionicons name="sparkles-outline" size={22} color="#D4A017" />
                    <View style={styles.sparkleLine} />
                  </View>

                  <Text style={styles.heading}>Quick Check-in</Text>
                  <Text style={styles.subheading}>
                    Share how you&apos;re feeling.{'\n'}
                    Mitra will find a practice that fits.
                  </Text>
                </View>

                {loading ? (
                  <Text style={styles.loadingText}>Checking in…</Text>
                ) : (
                  <>
                    <View style={styles.optionGrid}>
                      {ENERGY_OPTIONS.map((opt) => {
                        const active = selected === opt.value;
                        return (
                          <TouchableOpacity
                            key={opt.value}
                            onPress={() => setSelected(opt.value)}
                            activeOpacity={0.85}
                            style={[
                              styles.optionCard,
                              active && styles.optionCardActive,
                            ]}
                          >
                            <View style={styles.optionIconWrap}>{opt.icon}</View>
                            <Text style={styles.optionLabel}>{opt.label}</Text>
                            <Text style={styles.optionDesc}>{opt.desc}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    <View style={styles.helperRow}>
                      <Text style={styles.helperFlower}>❦</Text>
                      <Text style={styles.helperText}>
                        Select your energy to continue.
                      </Text>
                      <Text style={styles.helperFlower}>❦</Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => void handleProceed()}
                      disabled={selected === null}
                      activeOpacity={0.85}
                      style={[
                        styles.goldBtn,
                        selected === null && styles.goldBtnDisabled,
                      ]}
                    >
                      <Text style={styles.goldBtnText}>Proceed →</Text>
                    </TouchableOpacity>
                  </>
                )}

                {error ? <Text style={styles.errorText}>{error}</Text> : null}
              </>
            ) : (
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>Mitra heard you.</Text>

                <View style={styles.copyCard}>
                  <Text style={styles.copyText}>{result.copy}</Text>
                </View>

                {getSuggestedRoomLabel(result) ? (
                  <View style={styles.suggestedCard}>
                    <Text style={styles.suggestedTitle}>
                      {getSuggestedRoomLabel(result)}
                    </Text>
                    {getSuggestedRoomDescription(result) ? (
                      <Text style={styles.suggestedDesc}>
                        {getSuggestedRoomDescription(result)}
                      </Text>
                    ) : null}
                  </View>
                ) : null}

                <TouchableOpacity
                  onPress={handleCTA}
                  activeOpacity={0.85}
                  style={[styles.goldBtn, styles.resultPrimaryBtn]}
                >
                  <Text style={styles.goldBtnText}>{ctaLabel}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => navigation.navigate('TellMitra')}
                  activeOpacity={0.8}
                  style={styles.secondaryFullBtn}
                >
                  <Text style={styles.secondaryFullBtnText}>Tell Mitra more</Text>
                </TouchableOpacity>

                <View style={styles.resultGrid}>
                  <TouchableOpacity
                    onPress={() => {
                      setResult(null);
                      setSelected(null);
                      setError(null);
                    }}
                    activeOpacity={0.8}
                    style={styles.resultSmallBtn}
                  >
                    <Text style={styles.resultSmallBtnText}>Quick Check-in</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => navigation.navigate('QuickReset')}
                    activeOpacity={0.8}
                    style={styles.resultSmallBtn}
                  >
                    <Text style={styles.resultSmallBtnText}>Quick Reset</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={() => navigation.navigate('Home')}
                  activeOpacity={0.7}
                  style={styles.returnHomeBtn}
                >
                  <Text style={styles.returnHomeText}>Return Home</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8EF',
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    resizeMode: 'cover',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 108,
  },
  shell: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    position: 'relative',
  },
  introBlock: {
    alignItems: 'center',
    marginBottom: 34,
  },
  sparkleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 20,
  },
  sparkleLine: {
    width: 68,
    height: 1,
    backgroundColor: 'rgba(212,160,23,0.45)',
  },
  heading: {
    fontFamily: Fonts.serif.bold,
    fontSize: 34,
    color: '#432104',
    marginBottom: 12,
  },
  subheading: {
    color: '#7B6550',
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    fontFamily: Fonts.sans.regular,
  },
  loadingText: {
    color: '#A08060',
    textAlign: 'center',
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
    marginBottom: 22,
  },
  optionCard: {
    width: '48%',
    padding: 18,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(212,160,23,0.35)',
    backgroundColor: Platform.OS === "android" ? '#FEFCF9' : 'rgba(255,255,255,0.86)',
    alignItems: 'center',
    ...platformShadow("#C9A84C", 8, 0.08, 18, 2),
  },
  optionCardActive: {
    borderWidth: 1.6,
    borderColor: '#D4A017',
    backgroundColor: 'rgba(255,250,241,0.96)',
    ...platformShadow("#432104", 6, 0.12, 22, 3),
  },
  optionIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(246,234,208,0.72)',
  },
  optionLabel: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: '#432104',
    marginBottom: 6,
    textAlign: 'center',
  },
  optionDesc: {
    fontSize: 14,
    color: '#7B6550',
    lineHeight: 19,
    textAlign: 'center',
    fontFamily: Fonts.sans.regular,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  helperFlower: {
    color: '#E2C37F',
    fontSize: 14,
  },
  helperText: {
    color: '#8B6A43',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: Fonts.sans.regular,
  },
  goldBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 11,
    backgroundColor: '#C99317',
    alignItems: 'center',
    ...platformShadow("#C99317", 10, 0.2, 20, 3),
  },
  goldBtnDisabled: {
    opacity: 0.45,
  },
  goldBtnText: {
    color: '#fff',
    fontFamily: Fonts.serif.bold,
    fontSize: 19,
  },
  errorText: {
    color: '#e06060',
    marginTop: 14,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: Fonts.sans.regular,
  },
  resultCard: {
    borderWidth: 1,
    borderColor: 'rgba(225,197,136,0.45)',
    borderRadius: 28,
    backgroundColor: Platform.OS === "android" ? '#FDF9F3' : 'rgba(255,252,247,0.88)',
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 20,
    ...platformShadow("#C9A84C", 12, 0.12, 24, 3),
  },
  resultTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 18,
    color: '#C99317',
    marginBottom: 18,
  },
  copyCard: {
    backgroundColor: Platform.OS === "android" ? '#FEFCF9' : 'rgba(255,255,255,0.72)',
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(212,160,23,0.45)',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 22,
    marginBottom: 22,
  },
  copyText: {
    fontFamily: Fonts.serif.regular,
    fontSize: 18,
    color: '#432104',
    lineHeight: 30,
    fontStyle: 'italic',
  },
  suggestedCard: {
    borderWidth: 1,
    borderColor: 'rgba(225,197,136,0.6)',
    borderRadius: 18,
    backgroundColor: Platform.OS === "android" ? '#FFF9F2' : 'rgba(255,251,244,0.78)',
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 22,
  },
  suggestedTitle: {
    fontFamily: Fonts.serif.bold,
    fontSize: 17,
    color: '#432104',
    marginBottom: 8,
  },
  suggestedDesc: {
    fontSize: 15,
    color: '#7B6550',
    lineHeight: 22,
    fontFamily: Fonts.sans.regular,
  },
  resultPrimaryBtn: {
    marginBottom: 16,
  },
  secondaryFullBtn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(225,197,136,0.65)',
    backgroundColor: Platform.OS === "android" ? '#FEFCF9' : 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryFullBtnText: {
    color: '#7B6550',
    fontSize: 17,
    fontFamily: Fonts.sans.regular,
  },
  resultGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 18,
  },
  resultSmallBtn: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(225,197,136,0.65)',
    backgroundColor: Platform.OS === "android" ? '#FEFCF9' : 'rgba(255,255,255,0.6)',
    alignItems: 'center',
  },
  resultSmallBtnText: {
    color: '#7B6550',
    fontSize: 16,
    fontFamily: Fonts.sans.regular,
    textAlign: 'center',
  },
  returnHomeBtn: {
    width: '100%',
    alignItems: 'center',
  },
  returnHomeText: {
    color: '#8B6A43',
    fontSize: 16,
    fontFamily: Fonts.sans.regular,
  },
});
