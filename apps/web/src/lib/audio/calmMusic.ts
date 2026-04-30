import type { AudioHandle } from './howlerAudio';

const CALM_TRACKS = [
  '/Audio-calmmusic.mp3',
  '/Audio1.mpeg',
  '/Audio9.mpeg',
  '/Audio6.mpeg',
];
const CALM_IDX_KEY = '_kalpx_room_calm_music_idx';

let roomAmbientAudio: HTMLAudioElement | null = null;

function nextCalmTrack(): string {
  let lastIdx = -1;
  try {
    lastIdx = parseInt(localStorage.getItem(CALM_IDX_KEY) || '-1', 10);
  } catch {}
  const nextIdx =
    ((Number.isFinite(lastIdx) ? lastIdx : -1) + 1) % CALM_TRACKS.length;
  try {
    localStorage.setItem(CALM_IDX_KEY, String(nextIdx));
  } catch {}
  return CALM_TRACKS[nextIdx] || CALM_TRACKS[0]!;
}

function createRoomElement(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  const audio = new Audio(nextCalmTrack());
  audio.loop = true;
  audio.volume = 0.5;
  audio.preload = 'auto';
  return audio;
}

function getRoomElement(): HTMLAudioElement | null {
  if (!roomAmbientAudio) {
    roomAmbientAudio = createRoomElement();
  }
  return roomAmbientAudio;
}

export function createCalmAudio(): AudioHandle {
  const audio = createRoomElement();
  return {
    play() {
      void audio?.play().catch(() => {});
    },
    pause() {
      audio?.pause();
    },
    stop() {
      if (!audio) return;
      audio.pause();
      audio.currentTime = 0;
    },
    unload() {
      if (!audio) return;
      audio.pause();
      audio.src = '';
      audio.load();
    },
    isPlaying: () => !!audio && !audio.paused,
    isLoaded: () => !!audio,
  };
}

export function ensureRoomAmbientPlaying() {
  const audio = getRoomElement();
  if (!audio) return;
  if (!audio.paused) return;
  void audio.play().catch(() => {});
}

export function stopRoomAmbient() {
  if (!roomAmbientAudio) return;
  roomAmbientAudio.pause();
  roomAmbientAudio.currentTime = 0;
  roomAmbientAudio.src = '';
  roomAmbientAudio.load();
  roomAmbientAudio = null;
}

export function unloadRoomAmbient() {
  if (!roomAmbientAudio) return;
  roomAmbientAudio.pause();
  roomAmbientAudio.src = '';
  roomAmbientAudio.load();
  roomAmbientAudio = null;
}
