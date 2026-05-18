import type { AnalyticsAdapter } from '@kalpx/analytics';
import { api } from './api';
import { WEB_ENV } from './env';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

// ── External analytics denylist ─────────────────────────────────────────────
// These keys must NEVER reach window.fbq, gtag, or any external analytics SDK.
// Defence-in-depth: these are also excluded by the whitelist below, but explicit
// denylist entries make the privacy intent unambiguous to future maintainers.
export const PIXEL_PROPERTY_DENYLIST: readonly string[] = [
  // ── User identity — blocked until legal approves an analytics identity strategy
  'email', 'user_id', 'guest_uuid', 'user_email', 'username',
  // ── Companion/emotional state fields
  'prana_type', 'feeling', 'energy_state', 'mood', 'klesha', 'kosha', 'vritti',
  'trigger_history', 'active_dissonance', 'volatility_index',
  'financial_hardship', 'relationship_pain',
  'crisis', 'crisis_state', 'health_distress',
  'grief', 'conflict', 'distress',
  'agitated', 'drained', 'overwhelmed', 'balanced', 'energized',
  'noticed', 'named', 'settled', 'carry_label', 'label',
  'age_group', 'age_group_id', 'minor_status', 'user_age',
  // ── Raw text / AI payloads
  'text_encrypted', 'voice_text', 's3_key', 'transcript_text',
  'lm_output', 'bedrock_response', 'prompt_text', 'ai_response',
  'route_type', 'suppression_reason', 'evidence_snapshot',
  'copy_text', 'push_copy_text',
  'raw_text', 'transcript', 'reflection_text', 'user_message', 'companion_state',
];

// ── External analytics whitelist ────────────────────────────────────────────
// ONLY these keys may reach window.fbq, gtag, or any external analytics SDK.
export const PIXEL_PROPERTY_WHITELIST: readonly string[] = [
  'event_category', 'source', 'surface', 'item_type', 'journey_day',
  'room_id', 'screen_name', 'category_id', 'notification_id',
  'duration_bucket', 'completion_state', 'error_code', 'auth_method',
  'path', 'mode', 'slot', 'plan_type', 'link_type', 'door',
  'change_type', 'item_count', 'checkpoint_id', 'principle_id',
];

// Raw-text keys that must not be stored in backend JourneyActivity meta.
// Lighter than the external whitelist — does not restrict safe internal fields.
const BACKEND_STRIP_KEYS: readonly string[] = [
  'text_encrypted', 'voice_text', 's3_key', 'transcript_text',
  'lm_output', 'bedrock_response', 'prompt_text', 'ai_response', 'raw_text',
];

const MAX_PROP_VALUE_LENGTH = 100;

/**
 * Filter for external analytics SDKs (pixel, GA4).
 * Applies denylist first, then keeps only whitelist keys.
 * Blocks any string value longer than MAX_PROP_VALUE_LENGTH.
 */
export function filterPixelProperties(
  properties: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (PIXEL_PROPERTY_DENYLIST.includes(key)) {
      if (WEB_ENV.isDev) console.warn('[analytics] blocked (denylist):', key);
      continue;
    }
    if (!PIXEL_PROPERTY_WHITELIST.includes(key)) {
      if (WEB_ENV.isDev) console.warn('[analytics] blocked (not in whitelist):', key);
      continue;
    }
    if (typeof value === 'string' && value.length > MAX_PROP_VALUE_LENGTH) {
      if (WEB_ENV.isDev) console.warn('[analytics] blocked (value too long):', key);
      continue;
    }
    out[key] = value;
  }
  return out;
}

/**
 * Lighter filter for backend-bound event meta (JourneyActivity).
 * Strips raw-text keys and string values longer than MAX_PROP_VALUE_LENGTH.
 * Does NOT apply the external whitelist — backend may store more fields than pixel.
 */
export function sanitizeBackendMeta(
  meta: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (BACKEND_STRIP_KEYS.includes(key)) continue;
    if (typeof value === 'string' && value.length > MAX_PROP_VALUE_LENGTH) continue;
    out[key] = value;
  }
  return out;
}

// ── Consent state ───────────────────────────────────────────────────────────
// Mirrors the ConsentBanner's localStorage key. Updated without reload via custom event.
let _consentGranted = (typeof localStorage !== 'undefined')
  && localStorage.getItem('kalpx_analytics_consent') === 'granted';

if (typeof window !== 'undefined') {
  window.addEventListener('consent_updated', () => {
    _consentGranted = localStorage.getItem('kalpx_analytics_consent') === 'granted';
  });
}

function firePixel(eventName: string, properties?: Record<string, any>) {
  if (!_consentGranted) return;
  if (!WEB_ENV.metaPixelId || !window.fbq) return;
  const safeProps = filterPixelProperties(properties ?? {});
  window.fbq('track', eventName, safeProps);
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
