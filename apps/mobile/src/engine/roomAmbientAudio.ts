import { Audio } from "expo-av";
import { REMOTE_AUDIO_SOURCES } from "../config/audioAssets";

const ROOM_AMBIENT_TRACK = REMOTE_AUDIO_SOURCES.CALM_MUSIC;

let roomAmbientSound: Audio.Sound | null = null;
let roomAmbientIsPlaying = false;
let roomAmbientRunId = 0;

export async function stopRoomAmbientAudio() {
  roomAmbientRunId += 1;
  const sound = roomAmbientSound;
  roomAmbientSound = null;
  roomAmbientIsPlaying = false;
  if (!sound) return;
  await sound.stopAsync().catch(() => {});
  await sound.unloadAsync().catch(() => {});
}

export async function ensureRoomAmbientAudioPlaying() {
  const runId = roomAmbientRunId;
  const isStale = () => runId !== roomAmbientRunId;

  const playWithRecovery = async (sound: Audio.Sound) => {
    try {
      if (roomAmbientIsPlaying) return true;
      await sound.playAsync();
      if (isStale()) {
        await sound.stopAsync().catch(() => {});
        await sound.unloadAsync().catch(() => {});
        return false;
      }
      roomAmbientIsPlaying = true;
      return true;
    } catch {
      return false;
    }
  };

  const existing = roomAmbientSound;
  if (existing) {
    const ok = await playWithRecovery(existing);
    if (ok) return;
    await stopRoomAmbientAudio();
  }

  await Audio.setIsEnabledAsync(true).catch(() => {});
  if (isStale()) return;
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
  }).catch(() => {});
  if (isStale()) return;

  const created = await Audio.Sound.createAsync(ROOM_AMBIENT_TRACK, {
    isLooping: true,
    volume: 0.5,
  }).catch(() => null);
  if (!created) return;

  const fresh = created.sound;
  if (isStale()) {
    await fresh.unloadAsync().catch(() => {});
    return;
  }
  roomAmbientSound = fresh;
  roomAmbientIsPlaying = false;
  await playWithRecovery(fresh);
}
