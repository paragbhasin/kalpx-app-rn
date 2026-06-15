import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking, Platform } from 'react-native';
import React, { useRef, useState } from 'react';
import AppRatingModal from '../components/AppRatingModal';

const STORAGE_KEY = '@kalpx_rating_v1';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export type RatingTrigger = 'quick_chant' | 'rhythm' | 'inner_path';

interface RatingState {
  quick_chant_sessions: number;
  rhythm_days: number;
  inner_path_milestones: number;
  last_prompted_ms: number;
  dismiss_count: number;
  has_rated: boolean;
}

const DEFAULT_STATE: RatingState = {
  quick_chant_sessions: 0,
  rhythm_days: 0,
  inner_path_milestones: 0,
  last_prompted_ms: 0,
  dismiss_count: 0,
  has_rated: false,
};

const COUNT_KEY: Record<RatingTrigger, keyof RatingState> = {
  quick_chant: 'quick_chant_sessions',
  rhythm: 'rhythm_days',
  inner_path: 'inner_path_milestones',
};

const THRESHOLD: Record<RatingTrigger, number> = {
  quick_chant: __DEV__ ? 1 : 3,
  rhythm: __DEV__ ? 1 : 3,
  inner_path: 1,
};

async function loadState(): Promise<RatingState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

async function saveState(state: RatingState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function isSuppressed(state: RatingState): boolean {
  if (state.has_rated) return true;
  if (state.dismiss_count >= 2) return true;
  if (!__DEV__ && state.last_prompted_ms > 0 && Date.now() - state.last_prompted_ms < THIRTY_DAYS_MS) return true;
  return false;
}

function isThresholdHit(state: RatingState, trigger: RatingTrigger): boolean {
  const count = state[COUNT_KEY[trigger]] as number;
  const threshold = THRESHOLD[trigger];
  return count > 0 && count % threshold === 0;
}

export function useAppRating() {
  const [visible, setVisible] = useState(false);
  const afterCloseRef = useRef<(() => void) | null>(null);

  async function recordAndMaybePrompt(
    trigger: RatingTrigger,
    onAfterClose?: () => void,
  ): Promise<void> {
    console.log('[AppRating] recordAndMaybePrompt called', trigger);
    const state = await loadState();
    console.log('[AppRating] state loaded', JSON.stringify(state));

    const countKey = COUNT_KEY[trigger];
    (state[countKey] as number) += 1;
    await saveState(state);
    console.log('[AppRating] count after increment:', state[countKey]);

    const suppressed = isSuppressed(state);
    const threshold = isThresholdHit(state, trigger);
    console.log('[AppRating] suppressed:', suppressed, '| thresholdHit:', threshold);

    if (suppressed || !threshold) {
      onAfterClose?.();
      return;
    }

    afterCloseRef.current = onAfterClose ?? null;
    console.log('[AppRating] setVisible(true)');
    setVisible(true);
  }

  async function handleYes() {
    setVisible(false);
    const state = await loadState();
    state.has_rated = true;
    state.last_prompted_ms = Date.now();
    await saveState(state);
    afterCloseRef.current?.();
    afterCloseRef.current = null;
    try {
      const url = Platform.OS === 'ios'
        ? 'itms-apps://itunes.apple.com/app/id6755144623?action=write-review'
        : 'market://details?id=com.kalpx.app';
      await Linking.openURL(url);
    } catch {}
  }

  async function handleNotYet() {
    setVisible(false);
    const state = await loadState();
    state.dismiss_count += 1;
    state.last_prompted_ms = Date.now();
    await saveState(state);
    afterCloseRef.current?.();
    afterCloseRef.current = null;
  }

  function renderRatingModal() {
    return React.createElement(AppRatingModal, {
      visible,
      onYes: handleYes,
      onNotYet: handleNotYet,
    });
  }

  return { recordAndMaybePrompt, renderRatingModal };
}
