import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useScreenStore } from '../engine/useScreenBridge';
import { CALM_MUSIC_LIBRARY } from '../engine/actionExecutor';
import { executeAction } from '../engine/actionExecutor';
import BlockRenderer from '../engine/BlockRenderer';
import Header from '../components/Header';
import { Fonts } from '../theme/fonts';

interface PracticeRunnerContainerProps {
  schema: {
    container_id: string;
    blocks: any[];
    tone?: {
      theme?: string;
      mood?: string;
    };
    variant?: string;
    state_id?: string;
    on_complete?: any;
    complete_action?: any;
    is_trigger?: boolean;
    headline?: string;
    subtext?: string;
    body?: string;
    pause_config?: any;
    mantra_text?: string;
    mantra_hindi_text?: string;
    mantra_config?: any;
    completion_config?: any;
    embody_config?: any;
    prep_config?: any;
    feedback_config?: any;
    audio_url?: string;
    id?: string;
  };
}

// ── Calming Music Rotation ──
async function _rotateCalmMusic(): Promise<string> {
  if (!CALM_MUSIC_LIBRARY || CALM_MUSIC_LIBRARY.length === 0) return '';
  let lastIdx = -1;
  try {
    const stored = await AsyncStorage.getItem('_kalpx_calm_music_idx');
    lastIdx = stored ? parseInt(stored, 10) : -1;
  } catch (_) {}
  const nextIdx = (lastIdx + 1) % CALM_MUSIC_LIBRARY.length;
  try { await AsyncStorage.setItem('_kalpx_calm_music_idx', String(nextIdx)); } catch (_) {}
  return CALM_MUSIC_LIBRARY[nextIdx];
}

const PracticeRunnerContainer: React.FC<PracticeRunnerContainerProps> = ({ schema }) => {
  const { screenData: screenState, loadScreen, goBack, currentScreen, currentStateId } = useScreenStore();
  const updateBackground = useScreenStore(state => state.updateBackground);
  const calmSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    updateBackground(require('../../assets/companion.png'));
  }, [updateBackground]);

  // ── Variant Detection ──
  const currentVariant = schema?.variant || '';
  const isMantraRunner = currentVariant === 'mantra_runner';
  const isSacredPause = currentVariant === 'sacred_pause';
  const isSankalpEmbody = currentVariant === 'sankalp_embody';
  const isSankalpConfirm = currentVariant === 'sankalp_confirm';
  const isMantraComplete = currentVariant === 'mantra_complete';
  const isMantraPrep = currentVariant === 'mantra_prep';
  const isRepSelection = currentVariant === 'mantra_rep_selection';

  // ── Screen-Aware Detection (prevents cross-flow contamination) ──
  const stateId = currentStateId || '';
  const _isTriggerScreen = stateId === 'free_mantra_chanting' || stateId === 'post_trigger_mantra';
  const _isCheckinSupportScreen = stateId === 'checkin_support_mantra' || stateId === 'checkin_breath_reset';

  const isTriggerSession =
    schema?.is_trigger ||
    stateId === 'free_mantra_chanting' ||
    stateId === 'post_trigger_mantra' ||
    stateId === 'trigger_practice_runner' ||
    screenState?.source === 'support' ||
    screenState?._active_support_item?.source === 'support';

  const isTriggerOmChantScreen =
    (stateId === 'free_mantra_chanting' || stateId === 'checkin_breath_reset');

  // ── Trigger Support Completion Flag ──
  const isTriggerSupportCompleted = !!screenState?._trigger_support_completed;

  // ── Mantra Audio URL (screen-aware to prevent cross-flow audio contamination) ──
  const mantraAudioUrl = useMemo(() => {
    const state = screenState || {};
    // OM screens: use rotated OM audio from _selected_om_audio
    if (stateId === 'free_mantra_chanting' || stateId === 'checkin_breath_reset') {
      return state._selected_om_audio || '';
    }
    // Support mantra runners: use runner_active_item audio or fall back to OM
    if (_isTriggerScreen || _isCheckinSupportScreen) {
      return state.runner_active_item?.audio_url || state._selected_om_audio || '';
    }
    // Core: runner_active_item first, then master_mantra fallback
    return state.runner_active_item?.audio_url || state.master_mantra?.audio_url || '';
  }, [
    screenState?._selected_om_audio,
    screenState?.runner_active_item?.audio_url,
    screenState?.master_mantra?.audio_url,
    stateId,
    _isTriggerScreen,
    _isCheckinSupportScreen,
  ]);

  // ── Calming background music for sacred_pause ──
  useEffect(() => {
    if (!isSacredPause) return;
    let isMounted = true;
    const startMusic = async () => {
      try {
        const url = await _rotateCalmMusic();
        if (!url || !isMounted) return;
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true, isLooping: true, volume: 0.15 },
        );
        if (isMounted) calmSoundRef.current = sound;
        else await sound.unloadAsync();
      } catch (err) { console.warn('[CALM] Music load failed:', err); }
    };
    startMusic();
    return () => {
      isMounted = false;
      if (calmSoundRef.current) {
        calmSoundRef.current.unloadAsync();
        calmSoundRef.current = null;
      }
    };
  }, [isSacredPause]);

  // ── Block Filtering by Position ──
  const { headerBlocks, contentBlocks, footerBlocks, footerActionBlocks } = useMemo(() => {
    const blocks = schema.blocks || [];
    return {
      headerBlocks: blocks.filter((b: any) => b.position === 'header'),
      contentBlocks: blocks.filter((b: any) => !b.position || b.position === 'content'),
      footerBlocks: blocks.filter((b: any) => b.position === 'footer'),
      footerActionBlocks: blocks.filter((b: any) => b.position === 'footer_actions'),
    };
  }, [schema.blocks]);

  // ── Audio Injection into audio_player blocks ──
  const injectAudio = (block: any) => {
    if (block.type === 'audio_player') {
      // For trigger OM chant screens, hide the audio_player block entirely
      // (audio is handled by intro/loop refs on web; on RN blocks handle their own audio)
      if (isTriggerOmChantScreen) {
        return { ...block, audio_url: mantraAudioUrl || block.audio_url };
      }
      // Inject computed audio URL if block doesn't already have one
      if (!block.audio_url && mantraAudioUrl) {
        return { ...block, audio_url: mantraAudioUrl };
      }
      // If block has audio_url, still prefer computed mantraAudioUrl for consistency
      if (mantraAudioUrl) {
        return { ...block, audio_url: mantraAudioUrl };
      }
    }
    return block;
  };

  // ── For trigger sessions, hide default headline/subtext blocks (container provides its own) ──
  const processBlock = (block: any) => {
    let processed = injectAudio(block);
    if (isTriggerSession && (block.type === 'headline' || (block.type === 'subtext' && !block.action))) {
      // Hide default headline/subtext on trigger screens — container renders custom ones
      processed = { ...processed, _hidden: true };
    }
    return processed;
  };

  // ── Trigger Completion Action Handlers ──
  const handleFeelCalmer = () => {
    executeAction(
      {
        type: 'submit',
        payload: { type: 'trigger_resolved_after_support' },
        target: { container_id: 'companion_dashboard', state_id: 'day_active' },
        currentScreen,
      },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) => {
          const { screenActions } = require('../store/screenSlice');
          const { store } = require('../store');
          store.dispatch(screenActions.setScreenValue({ key, value }));
        },
        screenState,
      },
    );
  };

  const handleTryAnother = () => {
    executeAction(
      {
        type: 'navigate',
        target: { container_id: 'awareness_trigger', state_id: 'trigger_recheck' },
        currentScreen,
      },
      {
        loadScreen,
        goBack,
        setScreenValue: (value: any, key: string) => {
          const { screenActions } = require('../store/screenSlice');
          const { store } = require('../store');
          store.dispatch(screenActions.setScreenValue({ key, value }));
        },
        screenState,
      },
    );
  };

  // ── Render Helpers ──
  const renderBlockList = (blocks: any[], keyPrefix: string) => (
    <>
      {blocks.map((block: any, idx: number) => {
        const processed = processBlock(block);
        if (processed._hidden) return null;
        return (
          <BlockRenderer
            key={block.id || `${keyPrefix}-${block.type}-${idx}`}
            block={processed}
          />
        );
      })}
    </>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      {renderBlockList(headerBlocks, 'header')}
    </View>
  );

  const renderContent = () => (
    <View style={styles.content}>
      {renderBlockList(contentBlocks, 'content')}
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      {renderBlockList(footerBlocks, 'footer')}
    </View>
  );

  const renderFooterActions = () => {
    // If trigger support is completed, show "I feel calmer now" + "Try another way" buttons
    if (isTriggerSupportCompleted) {
      return (
        <View style={styles.footerActions}>
          <TouchableOpacity style={styles.calmButton} onPress={handleFeelCalmer} activeOpacity={0.8}>
            <Text style={styles.calmButtonText}>I feel calmer now</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tryAnotherButton} onPress={handleTryAnother} activeOpacity={0.8}>
            <Text style={styles.tryAnotherText}>Try another way</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // Otherwise render footer_actions blocks normally
    if (footerActionBlocks.length > 0) {
      return (
        <View style={styles.footerActions}>
          {renderBlockList(footerActionBlocks, 'footer_actions')}
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      <Header isTransparent />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.inner}>
          {renderHeader()}
          {renderContent()}
          {renderFooter()}
          {renderFooterActions()}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  safeArea: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 40,
    paddingTop: 20,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  content: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 'auto',
    gap: 20,
  },
  footerActions: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingBottom: 8,
  },
  // ── Trigger Support Completion Buttons ──
  calmButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#C9A84C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  calmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: Fonts.sans.semiBold,
    letterSpacing: 0.5,
  },
  tryAnotherButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#C9A84C',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tryAnotherText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#C9A84C',
    fontFamily: Fonts.sans.medium,
    letterSpacing: 0.3,
  },
});

export default PracticeRunnerContainer;
