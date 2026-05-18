/**
 * roomSession — module-level state for passive room_exited telemetry.
 *
 * Tracks whether a leave was intentional (exit pill tapped, returnHome
 * called) so the passive exit effect in RoomContainer knows whether to
 * fire the room_exited event when the component unmounts unexpectedly
 * (e.g. back gesture, OS navigation, notification tap).
 *
 * Gate 1 — mobile notification infrastructure.
 */

let _intentionalLeave = false;
let _roomExitedFired = false;

export function markIntentionalLeave(): void {
  _intentionalLeave = true;
}

export function isIntentionalLeave(): boolean {
  return _intentionalLeave;
}

export function markRoomExitedFired(): void {
  _roomExitedFired = true;
}

export function hasRoomExitedFired(): boolean {
  return _roomExitedFired;
}

export function resetRoomSession(): void {
  _intentionalLeave = false;
  _roomExitedFired = false;
}
