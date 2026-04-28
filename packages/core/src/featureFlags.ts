// Platform-neutral flag name constants.
// RN reads these as EXPO_PUBLIC_* env vars at build time.
// Web reads them as VITE_* env vars.
// Never import platform APIs here — just the string keys.

export const FLAG_MITRA_V3_NEW_DASHBOARD = 'EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD';
export const FLAG_MITRA_V3_ROOMS = 'EXPO_PUBLIC_MITRA_V3_ROOMS';
export const FLAG_MITRA_V3_RECOGNITION_BACKEND = 'EXPO_PUBLIC_MITRA_V3_RECOGNITION_BACKEND';

// Room-level flags — each room can be individually enabled.
// Convention: EXPO_PUBLIC_MITRA_ROOM_<ROOM_ID_UPPER>=1
export const ROOM_FLAG_PREFIX = 'EXPO_PUBLIC_MITRA_ROOM_';
