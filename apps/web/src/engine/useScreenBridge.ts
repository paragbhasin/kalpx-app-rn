/**
 * Bridge hook: same API as the old Zustand useScreenStore, backed by Redux screenSlice.
 * Web copy — path fix only: `../store` resolves from engine/ correctly.
 */

import { useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import { screenActions, persistState, loadScreenWithData, goBackWithData } from '../store/screenSlice';

export function useScreenStore(selector?: (state: any) => any) {
  const dispatch = useDispatch<AppDispatch>();
  const screenState = useSelector((state: RootState) => state.screen);

  const loadScreen = useCallback(
    (target: string | { container_id?: string; containerId?: string; state_id?: string; stateId?: string }) => {
      let containerId: string;
      let stateId: string;
      if (typeof target === 'string') {
        containerId = 'generic';
        stateId = target;
      } else {
        containerId = target.container_id || target.containerId || 'generic';
        stateId = target.state_id || target.stateId || '';
      }
      dispatch(loadScreenWithData({ containerId, stateId }));
    },
    [dispatch],
  );

  const goBack = useCallback(() => {
    dispatch(goBackWithData());
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

  const currentBackgroundRef = useRef(screenState.currentBackground);
  useEffect(() => {
    currentBackgroundRef.current = screenState.currentBackground;
  }, [screenState.currentBackground]);

  const updateBackground = useCallback(
    (bg: any) => {
      if (currentBackgroundRef.current !== bg) {
        currentBackgroundRef.current = bg;
        dispatch(screenActions.setBackground(bg));
      }
    },
    [dispatch],
  );

  const headerHiddenRef = useRef(screenState.isHeaderHidden);
  useEffect(() => {
    headerHiddenRef.current = screenState.isHeaderHidden;
  }, [screenState.isHeaderHidden]);

  const updateHeaderHidden = useCallback(
    (hidden: boolean) => {
      if (headerHiddenRef.current !== hidden) {
        headerHiddenRef.current = hidden;
        dispatch(screenActions.setHeaderHidden(hidden));
      }
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

  // trigger persist
  void persistState;

  const store = {
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

    loadScreen,
    goBack,
    setScreenData,
    updateScreenData,
    updateBackground,
    updateHeaderHidden,
    setOverlayData,
    setCurrentScreen,
  };

  if (selector) {
    return selector(store);
  }

  return store;
}

export { screenActions } from '../store/screenSlice';
