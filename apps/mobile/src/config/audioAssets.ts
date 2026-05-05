const REMOTE_AUDIO_BASE_URL = "https://kalpx.com/audio";

const AUDIO_FILENAMES = {
  CALM_MUSIC: "Audio-calmmusic.mp3",
  CALM_MUSIC_1: "Audio1.mpeg",
  CALM_MUSIC_9: "Audio9.mpeg",
  CALM_MUSIC_6: "Audio6.mpeg",
  OM: "Om.mp4",
  OM_SHANTI: "Om Shanti.mp4",
  HARI_OM: "Hari Om -Female.mp4",
  BE_STILL: "Audio_Be_still.mp4",
  SANKALP_OM: "sankalp_om.mp3",
};

function getRemoteAudioSource(fileName: string): { uri: string } {
  return { uri: `${REMOTE_AUDIO_BASE_URL}/${encodeURIComponent(fileName)}` };
}

const REMOTE_AUDIO_SOURCES = {
  CALM_MUSIC: getRemoteAudioSource(AUDIO_FILENAMES.CALM_MUSIC),
  CALM_MUSIC_1: getRemoteAudioSource(AUDIO_FILENAMES.CALM_MUSIC_1),
  CALM_MUSIC_9: getRemoteAudioSource(AUDIO_FILENAMES.CALM_MUSIC_9),
  CALM_MUSIC_6: getRemoteAudioSource(AUDIO_FILENAMES.CALM_MUSIC_6),
  OM: getRemoteAudioSource(AUDIO_FILENAMES.OM),
  OM_SHANTI: getRemoteAudioSource(AUDIO_FILENAMES.OM_SHANTI),
  HARI_OM: getRemoteAudioSource(AUDIO_FILENAMES.HARI_OM),
  BE_STILL: getRemoteAudioSource(AUDIO_FILENAMES.BE_STILL),
  SANKALP_OM: getRemoteAudioSource(AUDIO_FILENAMES.SANKALP_OM),
};

export { REMOTE_AUDIO_BASE_URL, AUDIO_FILENAMES, getRemoteAudioSource, REMOTE_AUDIO_SOURCES };
