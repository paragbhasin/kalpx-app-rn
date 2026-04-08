import React, { useMemo, useEffect, useRef } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useScreenStore } from '../engine/useScreenBridge';
import { CALM_MUSIC_LIBRARY } from '../engine/actionExecutor';
import BlockRenderer from '../engine/BlockRenderer';
import Header from '../components/Header';

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
  const loadScreen = useScreenStore(state => state.loadScreen);
  const updateBackground = useScreenStore(state => state.updateBackground);
  const screenData = useScreenStore(state => state.screenData);
  const calmSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    updateBackground(require('../../assets/companion.png'));
  }, [updateBackground]);

  // ── Calming background music for sacred_pause practice runners ──
  const isSacredPause = schema.variant === 'sacred_pause';
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

  // ── Inject _selected_om_audio into audio_player blocks for OM/trigger/checkin screens ──
  const omAudioUrl = screenData._selected_om_audio || '';
  const mantraAudioUrl = screenData.runner_active_item?.audio_url || omAudioUrl;

  const headerBlocks = useMemo(() => schema.blocks?.filter(b => b.position === 'header') || [], [schema.blocks]);
  const contentBlocks = useMemo(() => schema.blocks?.filter(b => !b.position || b.position === 'content') || [], [schema.blocks]);
  const footerBlocks = useMemo(() => schema.blocks?.filter(b => b.position === 'footer') || [], [schema.blocks]);

  // Inject audio URL into audio_player blocks
  const injectAudio = (block: any) => {
    if (block.type === 'audio_player' && !block.audio_url && mantraAudioUrl) {
      return { ...block, audio_url: mantraAudioUrl };
    }
    return block;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {headerBlocks.map((block, idx) => (
        <BlockRenderer key={block.id || `header-${block.type}-${idx}`} block={injectAudio(block)} />
      ))}
    </View>
  );

  const renderContent = () => (
    <View style={styles.content}>
      {contentBlocks.map((block, idx) => (
        <BlockRenderer key={block.id || `content-${block.type}-${idx}`} block={injectAudio(block)} />
      ))}
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      {footerBlocks.map((block, idx) => (
        <BlockRenderer key={block.id || `footer-${block.type}-${idx}`} block={injectAudio(block)} />
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
        <Header isTransparent />
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.inner}>
                {renderHeader()}
                {renderContent()}
                {renderFooter()}
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
});

export default PracticeRunnerContainer;
