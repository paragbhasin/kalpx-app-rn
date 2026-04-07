import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Fonts } from '../theme/fonts';

interface AudioPlayerBlockProps {
  block: {
    audio_url?: string;
    label?: string;
  };
}

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const AudioPlayerBlock: React.FC<AudioPlayerBlockProps> = ({ block }) => {
  const audioUrl = block.audio_url || '';
  const soundRef = useRef<Audio.Sound | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!audioUrl) return;

    let isMounted = true;

    const loadAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: false, isLooping: true },
          (status) => {
            if (!isMounted || !status.isLoaded) return;
            setCurrentTime(status.positionMillis / 1000);
            if (status.durationMillis) {
              setDuration(status.durationMillis / 1000);
            }
          },
        );
        soundRef.current = sound;

        // Auto-play after 2 seconds
        setTimeout(async () => {
          if (isMounted && soundRef.current) {
            await soundRef.current.playAsync();
            setIsPlaying(true);
          }
        }, 2000);
      } catch (err) {
        console.warn('[AudioPlayerBlock] Failed to load audio:', err);
      }
    };

    loadAudio();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [audioUrl]);

  if (!audioUrl) return null;

  const togglePlay = async () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      await soundRef.current.pauseAsync();
    } else {
      await soundRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = async () => {
    if (!soundRef.current) return;
    await soundRef.current.setIsMutedAsync(!isMuted);
    setIsMuted(!isMuted);
  };

  const seek = async (value: number) => {
    if (!soundRef.current || !duration) return;
    await soundRef.current.setPositionAsync(value * duration * 1000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLine} />
        <Text style={styles.headerTitle}>Guided Audio</Text>
        <View style={styles.headerLine} />
      </View>

      {/* Progress row */}
      <View style={styles.timeRow}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <View style={styles.sliderWrapper}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={duration > 0 ? currentTime / duration : 0}
            onSlidingComplete={seek}
            minimumTrackTintColor="#B89450"
            maximumTrackTintColor="rgba(184, 148, 80, 0.15)"
            thumbTintColor="#B89450"
          />
        </View>
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.spacer} />

        <TouchableOpacity style={styles.playButton} onPress={togglePlay} activeOpacity={0.8}>
          <View style={styles.playCircle}>
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color="#c9962a"
              style={!isPlaying ? { marginLeft: 3 } : undefined}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.muteControl} onPress={toggleMute}>
          <View style={[styles.muteIconWrap, isMuted && styles.mutedBg]}>
            <Ionicons
              name={isMuted ? 'volume-mute' : 'volume-high'}
              size={18}
              color="#B89450"
            />
          </View>
          <Text style={styles.muteLabel}>Mute</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    marginVertical: 20,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    opacity: 0.8,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(184, 148, 80, 0.3)',
  },
  headerTitle: {
    fontSize: 14,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '500',
    color: '#B89450',
    fontFamily: Fonts.sans.medium,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 14,
    color: '#432104',
    opacity: 0.7,
    fontFamily: Fonts.sans.regular,
    minWidth: 35,
  },
  sliderWrapper: {
    flex: 1,
  },
  slider: {
    width: '100%',
    height: 30,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spacer: {
    width: 50,
  },
  playButton: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#d9a557',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#d9a557',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
    backgroundColor: '#fff',
  },
  muteControl: {
    alignItems: 'center',
    gap: 4,
    width: 50,
  },
  muteIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(184, 148, 80, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mutedBg: {
    backgroundColor: 'rgba(184, 148, 80, 0.15)',
  },
  muteLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#432104',
    opacity: 0.6,
    fontFamily: Fonts.sans.regular,
  },
});

export default AudioPlayerBlock;
