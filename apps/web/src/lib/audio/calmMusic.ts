/**
 * Calm music sequential rotation — mirrors RN CALM_MUSIC_LIBRARY + _rotateAudio.
 * Uses localStorage to persist the rotation index across sessions.
 */
import { createAudio, type AudioHandle } from './howlerAudio';

const CALM_MUSIC_LIBRARY = [
  'https://kalpx-dev-website.s3.us-east-2.amazonaws.com/audio/calm/Audio-calmmusic.mp3',
  'https://kalpx-dev-website.s3.us-east-2.amazonaws.com/audio/calm/Audio1.mpeg',
  'https://kalpx-dev-website.s3.us-east-2.amazonaws.com/audio/calm/Audio9.mpeg',
  'https://kalpx-dev-website.s3.us-east-2.amazonaws.com/audio/calm/Audio6.mpeg',
];

const STORAGE_KEY = '_kalpx_calm_audio_idx';

function nextCalmTrack(): string {
  let lastIdx = 0;
  try {
    lastIdx = parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10) || 0;
  } catch { /* SSR / private browsing */ }
  const nextIdx = (lastIdx + 1) % CALM_MUSIC_LIBRARY.length;
  try { localStorage.setItem(STORAGE_KEY, String(nextIdx)); } catch {}
  return CALM_MUSIC_LIBRARY[nextIdx] ?? CALM_MUSIC_LIBRARY[0]!;
}

export function createCalmAudio(): AudioHandle {
  const src = nextCalmTrack();
  return createAudio(src, { loop: true, volume: 0.35 });
}

// Room ambient: always the first track (Audio-calmmusic.mp3), looped at 0.5
export function createRoomAmbient(): AudioHandle {
  return createAudio(CALM_MUSIC_LIBRARY[0]!, { loop: true, volume: 0.5 });
}
