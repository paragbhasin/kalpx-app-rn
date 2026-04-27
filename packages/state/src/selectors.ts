import type { KalpxRootState, DissonanceThread } from './types';

// --- Screen selectors ---

export const selectCurrentContainerId = (s: KalpxRootState): string =>
  s.screen.currentContainerId;

export const selectCurrentStateId = (s: KalpxRootState): string =>
  s.screen.currentStateId;

export const selectScreenData = (s: KalpxRootState): Record<string, unknown> =>
  s.screen.screenData;

export const selectIsHeaderHidden = (s: KalpxRootState): boolean =>
  s.screen.isHeaderHidden;

export const selectIsSubmitting = (s: KalpxRootState): boolean =>
  s.screen._isSubmitting;

export const selectFlowType = (s: KalpxRootState): string | null =>
  s.screen._flow_type;

// --- Mitra selectors ---

export const selectCompanion = (s: KalpxRootState): unknown =>
  s.mitra.companion;

export const selectMitraIsLoading = (s: KalpxRootState): boolean =>
  s.mitra.isLoading;

export const selectMitraError = (s: KalpxRootState): string | null =>
  s.mitra.error;

export const selectCompletionVersion = (s: KalpxRootState): number =>
  s.mitra.completionVersion;

// --- Companion state selectors ---

export const selectVolatility = (s: KalpxRootState): number =>
  s.companionState.volatility;

export const selectMood = (s: KalpxRootState): string =>
  s.companionState.mood;

export const selectDissonanceThreads = (s: KalpxRootState): DissonanceThread[] =>
  s.companionState.dissonance_threads;

export const selectLifeContext = (s: KalpxRootState): string | null =>
  s.companionState.life_context;

// --- Preferences selectors ---

export const selectGuidanceMode = (s: KalpxRootState) =>
  s.preferences.guidance_mode;

export const selectRetreatMode = (s: KalpxRootState): boolean =>
  s.preferences.retreat_mode;

export const selectReducedMotion = (s: KalpxRootState): boolean =>
  s.preferences.reduced_motion;

export const selectWhyThisLinks = (s: KalpxRootState) =>
  s.preferences.why_this_links;

export const selectVoiceConsentGiven = (s: KalpxRootState): boolean =>
  s.preferences.voice_consent_given;

export const selectPreferencesLoaded = (s: KalpxRootState): boolean =>
  s.preferences.loaded;
