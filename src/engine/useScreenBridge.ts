/**
 * Bridge hook: provides the same API as the old Zustand useScreenStore
 * but backed by Redux screenSlice. This allows incremental migration
 * without changing all 15+ files at once.
 *
 * Usage: replace `import { useScreenStore } from './ScreenStore'`
 *   with `import { useScreenStore } from './useScreenBridge'`
 *
 * The old ScreenStore.ts can be deleted once all imports are switched.
 */

import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import {
  screenActions,
  persistState,
} from '../store/screenSlice';

/** Hook that provides the same interface as the old Zustand useScreenStore */
export function useScreenStore(selector?: (state: any) => any) {
  const dispatch = useDispatch<AppDispatch>();
  const screenState = useSelector((state: RootState) => state.screen);

  const loadScreen = useCallback(
    (target: string | { container_id?: string; containerId?: string; state_id?: string; stateId?: string }) => {
      // Support both string and object targets (matches Vue screenStore API)
      let containerId: string;
      let stateId: string;
      if (typeof target === 'string') {
        containerId = 'generic';
        stateId = target;
      } else {
        containerId = target.container_id || target.containerId || 'generic';
        stateId = target.state_id || target.stateId || '';
      }
      // Use loadScreenWithData to resolve schema (not just set IDs)
      const { loadScreenWithData } = require('../store/screenSlice');
      dispatch(loadScreenWithData({ containerId, stateId }));
    },
    [dispatch],
  );

  const goBack = useCallback(() => {
    dispatch(screenActions.goBack());
  }, [dispatch]);

  const setScreenData = useCallback(
    (data: Record<string, any>) => {
      dispatch(screenActions.updateScreenData(data));
    },
    [dispatch],
  );

  const updateScreenData = useCallback(
    (key: string, value: any) => {
      dispatch(screenActions.setScreenValue({ key, value }));
    },
    [dispatch],
  );

  const updateBackground = useCallback(
    (bg: any) => {
      dispatch(screenActions.setBackground(bg));
    },
    [dispatch],
  );

  const updateHeaderHidden = useCallback(
    (hidden: boolean) => {
      dispatch(screenActions.setHeaderHidden(hidden));
    },
    [dispatch],
  );

  const setOverlayData = useCallback(
    (data: any) => {
      dispatch(screenActions.setOverlayData(data));
    },
    [dispatch],
  );

  const setCurrentScreen = useCallback(
    (screen: any) => {
      dispatch(screenActions.setCurrentScreen(screen));
    },
    [dispatch],
  );

  const store = {
    // State
    currentContainerId: screenState.currentContainerId,
    currentStateId: screenState.currentStateId,
    currentScreen: screenState.currentScreen,
    currentBackground: screenState.currentBackground,
    isHeaderHidden: screenState.isHeaderHidden,
    history: screenState.history,
    screenData: screenState.screenData,
    currentOverlayData: screenState.currentOverlayData,
    _flow_instance_id: screenState._flow_instance_id,
    _isSubmitting: screenState._isSubmitting,

    // Actions
    loadScreen,
    goBack,
    setScreenData,
    updateScreenData,
    updateBackground,
    updateHeaderHidden,
    setOverlayData,
    setCurrentScreen,
  };

  // If a selector is provided, return just that slice (Zustand pattern)
  if (selector) {
    return selector(store);
  }

  return store;
}

/**
 * Static access for outside React components (replaces useScreenStore.getState())
 * Import the Redux store directly for these cases.
 */
export { screenActions } from '../store/screenSlice';
