/**
 * Shared helper for the Stage 2 room action pills.
 *
 * Each action sub-component needs to dispatch through the engine
 * `executeAction(action, context)` helper. The context shape is the same
 * everywhere, so we centralize construction of it here to avoid drift.
 *
 * Usage:
 *   const ctx = buildActionCtx(useScreenStore());
 *   executeAction({ type: "...", payload: {...} }, ctx).catch(() => {});
 *
 * Notes:
 *   - `screenState` is the live Redux snapshot at dispatch time.
 *   - `setScreenValue` writes through the screenSlice action creator.
 *   - The caller is expected to have been mounted under RoomContainer,
 *     which ensures room_id is already stamped in screenData.
 */

import type { ActionContext } from "../../../engine/actionExecutor";
import store from "../../../store";
import { screenActions } from "../../../store/screenSlice";

interface StoreLike {
  loadScreen: (target: any) => void;
  goBack: () => void;
}

export function buildActionCtx(storeBridge: StoreLike): ActionContext {
  return {
    loadScreen: storeBridge.loadScreen,
    goBack: storeBridge.goBack,
    setScreenValue: (value: any, key: string) =>
      store.dispatch(screenActions.setScreenValue({ key, value })),
    screenState: store.getState().screen.screenData,
  };
}
