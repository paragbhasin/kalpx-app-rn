import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { QuickResetMantra, QuickResetOpeningState, QuickChantCompleteResponse } from '@kalpx/types';
import { getQuickResetActionLabel, normalizeBrowseMantras, pickDifferentMantra } from '@kalpx/contracts';
import {
  getQuickResetOpening,
  postQuickChantComplete,
  postQuickResetSetDefault,
  postBrowseMantras,
} from '../../engine/mitraApi';
import { Fonts } from '../../theme/fonts';
import MalaMantraCounter from '../../components/MalaMantraCounter';
import AudioPlayerBlock from '../../blocks/AudioPlayerBlock';

type Phase = 'loading' | 'opening' | 'preview' | 'running' | 'done' | 'error';

export default function QuickResetScreen() {
  const navigation = useNavigation<any>();

  const [phase, setPhase] = useState<Phase>('loading');
  const [openingState, setOpeningState] = useState<QuickResetOpeningState | null>(null);
  const [selectedMantra, setSelectedMantra] = useState<QuickResetMantra | null>(null);
  const [completionData, setCompletionData] = useState<QuickChantCompleteResponse | null>(null);
  const [beadCount, setBeadCount] = useState(0);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerMantras, setPickerMantras] = useState<QuickResetMantra[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [defaultSetConfirmed, setDefaultSetConfirmed] = useState(false);

  const runnerStartedAt = useRef<number>(0);

  const activeMantra = selectedMantra ?? openingState?.mantra ?? null;

  // ── Initial load ────────────────────────────────────────────────────────────
  const loadOpening = useCallback(async () => {
    setPhase('loading');
    const state = await getQuickResetOpening();
    if (state) {
      setOpeningState(state);
      setSelectedMantra(null);
      setPhase('opening');
    } else {
      setPhase('error');
    }
  }, []);

  useEffect(() => {
    loadOpening();
  }, [loadOpening]);

  // ── Secondary action: "Show another calming mantra" ────────────────────────
  const handleShowAnother = useCallback(async () => {
    if (!activeMantra) return;
    const raw = await postBrowseMantras('peacecalm');
    const candidates = normalizeBrowseMantras(raw);
    const different = pickDifferentMantra(candidates, activeMantra.item_id);
    if (different) {
      setSelectedMantra(different);
    }
    // If none found, keep current — silent
  }, [activeMantra]);

  // ── Secondary action: "Set as my Quick Reset mantra" ──────────────────────
  const handleSetDefault = useCallback(async (mantra: QuickResetMantra) => {
    await postQuickResetSetDefault(mantra.item_id);
    setDefaultSetConfirmed(true);
    await loadOpening();
  }, [loadOpening]);

  // ── Mantra picker modal ────────────────────────────────────────────────────
  const openPicker = useCallback(async () => {
    setPickerVisible(true);
    setPickerLoading(true);
    const raw = await postBrowseMantras('peacecalm');
    setPickerMantras(normalizeBrowseMantras(raw));
    setPickerLoading(false);
  }, []);

  const handlePickerSelect = useCallback((mantra: QuickResetMantra) => {
    setSelectedMantra(mantra);
    setPickerVisible(false);
    setPhase('preview');
  }, []);

  // ── Runner start ───────────────────────────────────────────────────────────
  const handleBeginChanting = useCallback(() => {
    runnerStartedAt.current = Date.now();
    setBeadCount(0);
    setPhase('running');
  }, []);

  // ── Done chanting ──────────────────────────────────────────────────────────
  const handleDoneChanting = useCallback(async () => {
    if (!activeMantra) return;
    const duration_ms = Date.now() - runnerStartedAt.current;
    const result = await postQuickChantComplete({
      mantra_ref: activeMantra.item_id,
      duration_ms,
      completed: true,
    });
    if (result && result.copy) {
      setCompletionData(result);
      setPhase('done');
    } else {
      navigation.goBack();
    }
  }, [activeMantra, navigation]);

  // ── End early — always silent ──────────────────────────────────────────────
  const handleEndEarly = useCallback(async () => {
    if (!activeMantra) {
      navigation.goBack();
      return;
    }
    const duration_ms = Date.now() - runnerStartedAt.current;
    postQuickChantComplete({
      mantra_ref: activeMantra.item_id,
      duration_ms,
      completed: false,
    });
    navigation.goBack();
  }, [activeMantra, navigation]);

  // ── Secondary actions handler ──────────────────────────────────────────────
  const handleSecondaryAction = useCallback((action: string) => {
    if (action === 'mitra_suggest_for_this_moment') {
      handleShowAnother();
    } else if (action === 'set_as_default' && activeMantra) {
      handleSetDefault(activeMantra);
    } else if (action === 'change_mantra' || action === 'choose_from_library') {
      openPicker();
    }
  }, [handleShowAnother, handleSetDefault, openPicker, activeMantra]);

  // ── Render helpers ─────────────────────────────────────────────────────────
  const renderMantraDisplay = (mantra: QuickResetMantra) => (
    <View style={styles.mantraBlock}>
      <Text style={styles.mantraTitle}>{mantra.title}</Text>
      <Text style={styles.mantraDevanagari}>{mantra.devanagari}</Text>
      {!!mantra.meaning && (
        <Text style={styles.mantraMeaning} numberOfLines={2}>{mantra.meaning}</Text>
      )}
    </View>
  );

  const renderCopyWithBreaks = (text: string) =>
    text.split('\n').map((line, i) => (
      <Text key={i} style={styles.copyLine}>{line}</Text>
    ));

  // ── Phases ─────────────────────────────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#C99317" />
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'error') {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <View style={styles.centerContent}>
          <Text style={styles.sectionTitle}>Unable to open Quick Reset</Text>
          <Text style={styles.subtleText}>Please try again.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={loadOpening} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (phase === 'opening' && openingState) {
    const displayMantra = activeMantra!;
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {renderMantraDisplay(displayMantra)}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleBeginChanting} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>{openingState.primary_cta}</Text>
          </TouchableOpacity>
          <View style={styles.secondaryActions}>
            {openingState.secondary_actions.map((action) => (
              <TouchableOpacity
                key={action}
                onPress={() => handleSecondaryAction(action)}
                activeOpacity={0.7}
                style={styles.secondaryActionBtn}
              >
                <Text style={styles.secondaryActionText}>
                  {getQuickResetActionLabel(action)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {defaultSetConfirmed && (
            <Text style={styles.confirmText}>Set as your Quick Reset mantra.</Text>
          )}
        </ScrollView>
        {renderPickerModal()}
      </SafeAreaView>
    );
  }

  if (phase === 'preview' && selectedMantra) {
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {renderMantraDisplay(selectedMantra)}
          <TouchableOpacity style={styles.primaryBtn} onPress={handleBeginChanting} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Begin chanting</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleSetDefault(selectedMantra)}
            activeOpacity={0.7}
            style={styles.secondaryActionBtn}
          >
            <Text style={styles.secondaryActionText}>Set as my Quick Reset mantra</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={openPicker}
            activeOpacity={0.7}
            style={styles.secondaryActionBtn}
          >
            <Text style={styles.secondaryActionText}>Choose another</Text>
          </TouchableOpacity>
          {defaultSetConfirmed && (
            <Text style={styles.confirmText}>Set as your Quick Reset mantra.</Text>
          )}
        </ScrollView>
        {renderPickerModal()}
      </SafeAreaView>
    );
  }

  if (phase === 'running' && activeMantra) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <MalaMantraCounter
          mantraTitle={activeMantra.title}
          hindiText={activeMantra.devanagari}
          mantraText={activeMantra.meaning}
          targetCount={-1}
          currentCount={beadCount}
          onIncrement={() => setBeadCount((c) => c + 1)}
          onExit={handleEndEarly}
          footerContent={
            <View style={styles.runnerFooter}>
              {activeMantra.audio_url ? (
                <AudioPlayerBlock block={{ audio_url: activeMantra.audio_url }} />
              ) : null}
              <TouchableOpacity style={styles.primaryBtn} onPress={handleDoneChanting} activeOpacity={0.8}>
                <Text style={styles.primaryBtnText}>Done chanting</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEndEarly} activeOpacity={0.7} style={styles.endEarlyBtn}>
                <Text style={styles.endEarlyText}>End early</Text>
              </TouchableOpacity>
            </View>
          }
        />
      </SafeAreaView>
    );
  }

  if (phase === 'done' && completionData?.copy) {
    const fromBrowse = selectedMantra !== null;
    const isExplicit = openingState?.screen_state === 'explicit';
    return (
      <SafeAreaView style={styles.safeArea}>
        {renderHeader()}
        <View style={styles.centerContent}>
          <View style={styles.copyBlock}>
            {renderCopyWithBreaks(completionData.copy.headline)}
            {completionData.copy.subtext ? (
              <Text style={styles.copySubtext}>{completionData.copy.subtext}</Text>
            ) : null}
          </View>
          {fromBrowse && !isExplicit && selectedMantra && (
            <TouchableOpacity
              onPress={() => handleSetDefault(selectedMantra)}
              activeOpacity={0.7}
              style={styles.secondaryActionBtn}
            >
              <Text style={styles.secondaryActionText}>Set as my Quick Reset mantra</Text>
            </TouchableOpacity>
          )}
          {defaultSetConfirmed && (
            <Text style={styles.confirmText}>Set as your Quick Reset mantra.</Text>
          )}
          <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Fallback during phase transition
  return (
    <SafeAreaView style={styles.safeArea}>
      {renderHeader()}
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color="#C99317" />
      </View>
    </SafeAreaView>
  );

  function renderHeader() {
    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>{'< Back'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quick Reset</Text>
        <View style={{ width: 50 }} />
      </View>
    );
  }

  function renderPickerModal() {
    return (
      <Modal
        visible={pickerVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setPickerVisible(false)}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setPickerVisible(false)} activeOpacity={0.7}>
              <Text style={styles.backBtnText}>{'< Back'}</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Choose a Mantra</Text>
            <View style={{ width: 50 }} />
          </View>
          {pickerLoading ? (
            <View style={styles.centerContent}>
              <ActivityIndicator size="large" color="#C99317" />
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.pickerList} showsVerticalScrollIndicator={false}>
              {pickerMantras.map((mantra) => (
                <TouchableOpacity
                  key={mantra.item_id}
                  style={styles.pickerItem}
                  onPress={() => handlePickerSelect(mantra)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pickerItemTitle}>{mantra.title}</Text>
                  {!!mantra.devanagari && (
                    <Text style={styles.pickerItemDevanagari}>{mantra.devanagari}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8EF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DAC28E',
  },
  backBtnText: {
    fontSize: 16,
    color: '#C99317',
    fontFamily: Fonts.sans.medium,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 24,
    alignItems: 'center',
    gap: 20,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 20,
  },
  mantraBlock: {
    alignItems: 'center',
    gap: 12,
    width: '100%',
  },
  mantraTitle: {
    fontSize: 22,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
    textAlign: 'center',
  },
  mantraDevanagari: {
    fontSize: 34,
    color: '#C99317',
    fontFamily: Fonts.sans.regular,
    textAlign: 'center',
    lineHeight: 42,
  },
  mantraMeaning: {
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
    color: '#7B6550',
    textAlign: 'center',
  },
  primaryBtn: {
    backgroundColor: '#C99317',
    borderRadius: 15,
    paddingHorizontal: 40,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 17,
    fontFamily: Fonts.sans.semiBold,
    color: '#fff',
  },
  secondaryActions: {
    width: '100%',
    gap: 8,
    alignItems: 'center',
  },
  secondaryActionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  secondaryActionText: {
    fontSize: 15,
    color: '#C99317',
    fontFamily: Fonts.sans.medium,
    textDecorationLine: 'underline',
  },
  confirmText: {
    fontSize: 14,
    color: '#7B6550',
    fontFamily: Fonts.sans.regular,
    textAlign: 'center',
  },
  subtleText: {
    fontSize: 15,
    color: '#7B6550',
    fontFamily: Fonts.sans.regular,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
    textAlign: 'center',
  },
  copyBlock: {
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
  },
  copyLine: {
    fontSize: 22,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
  },
  copySubtext: {
    fontSize: 15,
    fontFamily: Fonts.sans.regular,
    color: '#7B6550',
    textAlign: 'center',
    marginTop: 8,
  },
  runnerFooter: {
    gap: 12,
    alignItems: 'center',
    paddingBottom: 16,
  },
  endEarlyBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  endEarlyText: {
    fontSize: 14,
    color: '#9b8b77',
    fontFamily: Fonts.sans.regular,
    textDecorationLine: 'underline',
  },
  pickerList: {
    padding: 16,
    gap: 2,
  },
  pickerItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#DAC28E',
    gap: 4,
  },
  pickerItemTitle: {
    fontSize: 17,
    fontFamily: Fonts.serif.bold,
    color: '#432104',
    fontWeight: '700',
  },
  pickerItemDevanagari: {
    fontSize: 15,
    color: '#8B6914',
    fontFamily: Fonts.sans.regular,
  },
});
