import type { EventName } from './eventNames';

export interface AnalyticsAdapter {
  track(event: EventName | string, params?: Record<string, unknown>): void;
  trackCompletion(event: EventName | string, params?: Record<string, unknown>): void;
}

export function createTracker(adapter: AnalyticsAdapter): AnalyticsAdapter {
  return adapter;
}

export const noopAdapter: AnalyticsAdapter = {
  track: () => {},
  trackCompletion: () => {},
};
