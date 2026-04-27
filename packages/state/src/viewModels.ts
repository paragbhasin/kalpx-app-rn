import type { KalpxRootState } from './types';
import {
  selectVolatility,
  selectMood,
  selectLifeContext,
  selectGuidanceMode,
  selectCompletionVersion,
  selectIsSubmitting,
  selectFlowType,
} from './selectors';

export interface CompanionViewModel {
  mood: string;
  volatility: number;
  lifeContext: string | null;
  guidanceMode: string;
  isHighVolatility: boolean;
}

export function buildCompanionViewModel(state: KalpxRootState): CompanionViewModel {
  const volatility = selectVolatility(state);
  return {
    mood: selectMood(state),
    volatility,
    lifeContext: selectLifeContext(state),
    guidanceMode: selectGuidanceMode(state),
    isHighVolatility: volatility >= 0.7,
  };
}

export interface EngineViewModel {
  flowType: string | null;
  isSubmitting: boolean;
  completionVersion: number;
}

export function buildEngineViewModel(state: KalpxRootState): EngineViewModel {
  return {
    flowType: selectFlowType(state),
    isSubmitting: selectIsSubmitting(state),
    completionVersion: selectCompletionVersion(state),
  };
}
