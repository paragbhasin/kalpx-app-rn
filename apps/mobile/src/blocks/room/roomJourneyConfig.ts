/**
 * RoomJourneyRenderer — feature flag and room allowlist.
 *
 * Main flag:        EXPO_PUBLIC_MITRA_ROOM_JOURNEY_V1=1    (default OFF)
 * Per-room rollout: EXPO_PUBLIC_ROOM_JOURNEY_LIVE_ROOMS=room_stillness,room_joy
 *                   When unset: all six supported rooms are active (for dev/local testing).
 *
 * isJourneyEnabled() is the single call-site guard in RoomRenderer.tsx.
 */

export const ROOM_JOURNEY_V1_ENABLED =
  process.env.EXPO_PUBLIC_MITRA_ROOM_JOURNEY_V1 === '1';

export const ROOM_JOURNEY_SUPPORTED_ROOMS: readonly string[] = [
  'room_stillness',
  'room_release',
  'room_clarity',
  'room_growth',
  'room_connection',
  'room_joy',
];

// Per-room allowlist for controlled staging/production rollout.
// When the env var is empty/unset all supported rooms are enabled (dev-only default).
const _liveEnv = process.env.EXPO_PUBLIC_ROOM_JOURNEY_LIVE_ROOMS ?? '';
const LIVE_ROOMS: readonly string[] = _liveEnv.trim()
  ? _liveEnv.split(',').map((s) => s.trim()).filter(Boolean)
  : [...ROOM_JOURNEY_SUPPORTED_ROOMS];

export function isJourneyEnabled(roomId: string): boolean {
  return (
    ROOM_JOURNEY_V1_ENABLED &&
    ROOM_JOURNEY_SUPPORTED_ROOMS.includes(roomId) &&
    LIVE_ROOMS.includes(roomId)
  );
}
