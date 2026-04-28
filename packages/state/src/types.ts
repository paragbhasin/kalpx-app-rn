// Minimal state shape types for Stage 1 selectors.
// These mirror the slice interfaces in apps/mobile/src/store/ without importing
// the slices themselves. Kept deliberately narrow — add fields as needed.

export type GuidanceMode = 'universal' | 'hybrid' | 'rooted';
export type RecommendedFrequency = 'off' | 'reduced' | 'normal';
export type WhyThisLinksMode = 'visible' | 'hidden_30d' | 'hidden_always';

export interface DissonanceThread {
  id: string;
  label?: string;
  strength?: number;
  first_seen_at?: number;
  [key: string]: unknown;
}

export interface ScreenStateShape {
  currentContainerId: string;
  currentStateId: string;
  currentScreen: unknown | null;
  screenData: Record<string, unknown>;
  isHeaderHidden: boolean;
  _flow_instance_id: string | null;
  _flow_type: string | null;
  _isSubmitting: boolean;
}

export interface MitraStateShape {
  companion: unknown | null;
  isLoading: boolean;
  error: string | null;
  completionVersion: number;
}

export interface CompanionStateShape {
  volatility: number;
  mood: string;
  dissonance_threads: DissonanceThread[];
  last_updated: number;
  life_context: string | null;
}

export interface PreferencesStateShape {
  guidance_mode: GuidanceMode;
  recommended_frequency: RecommendedFrequency;
  why_this_links: WhyThisLinksMode;
  retreat_mode: boolean;
  reduced_motion: boolean;
  voice_consent_given: boolean;
  loaded: boolean;
}

// The minimal root state shape that Stage 1 selectors operate on.
// apps/web and apps/mobile both satisfy this shape.
export interface KalpxRootState {
  screen: ScreenStateShape;
  mitra: MitraStateShape;
  companionState: CompanionStateShape;
  preferences: PreferencesStateShape;
}
