import type { AnalyticsAdapter } from '@kalpx/analytics';
import { api } from './api';
import { env } from './env';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

function firePixel(eventName: string, properties?: Record<string, any>) {
  if (env.metaPixelId && window.fbq) {
    window.fbq('track', eventName, properties);
  }
}

async function _postEvent(path: string, eventName: string, properties?: Record<string, any>) {
  try {
    await api.post(path, { event_name: eventName, ...properties });
  } catch {
    // swallow — telemetry must never break product flow
  }
}

export const webAnalytics: AnalyticsAdapter = {
  track: (eventName: string, properties?: Record<string, any>) => {
    _postEvent('mitra/track-event/', eventName, properties);
    firePixel(eventName, properties);
  },
  trackCompletion: (eventName: string, properties?: Record<string, any>) => {
    _postEvent('mitra/track-completion/', eventName, properties);
  },
};
