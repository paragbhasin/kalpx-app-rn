import { describe, it, expect, beforeEach, vi } from 'vitest';
import { filterPixelProperties, sanitizeBackendMeta, PIXEL_PROPERTY_DENYLIST, PIXEL_PROPERTY_WHITELIST } from '../lib/webAnalytics';

// ── filterPixelProperties ────────────────────────────────────────────────────

describe('filterPixelProperties', () => {
  it('returns empty object for empty input', () => {
    expect(filterPixelProperties({})).toEqual({});
  });

  it('removes denylist keys', () => {
    const result = filterPixelProperties({ prana_type: 'agitated', feeling: 'drained', event_category: 'checkin' });
    expect(result).not.toHaveProperty('prana_type');
    expect(result).not.toHaveProperty('feeling');
    expect(result).toHaveProperty('event_category', 'checkin');
  });

  it('removes every key in PIXEL_PROPERTY_DENYLIST', () => {
    const input: Record<string, unknown> = {};
    for (const key of PIXEL_PROPERTY_DENYLIST) {
      input[key] = 'value';
    }
    const result = filterPixelProperties(input);
    for (const key of PIXEL_PROPERTY_DENYLIST) {
      expect(result).not.toHaveProperty(key);
    }
  });

  it('keeps only whitelist keys', () => {
    const result = filterPixelProperties({ event_category: 'home', foo: 'bar', arbitrary: 123 });
    expect(result).toEqual({ event_category: 'home' });
  });

  it('preserves all whitelist keys when present', () => {
    const input: Record<string, unknown> = {};
    for (const key of PIXEL_PROPERTY_WHITELIST) {
      input[key] = 'ok';
    }
    const result = filterPixelProperties(input);
    expect(Object.keys(result)).toHaveLength(PIXEL_PROPERTY_WHITELIST.length);
  });

  it('removes any string value longer than 100 chars', () => {
    const longValue = 'x'.repeat(101);
    const result = filterPixelProperties({ journey_day: longValue, source: 'home' });
    expect(result).not.toHaveProperty('journey_day');
    expect(result).toHaveProperty('source', 'home');
  });

  it('keeps string values exactly 100 chars long', () => {
    const exactValue = 'x'.repeat(100);
    const result = filterPixelProperties({ source: exactValue });
    expect(result).toHaveProperty('source', exactValue);
  });

  it('keeps non-string values on whitelist keys regardless of length', () => {
    const result = filterPixelProperties({ journey_day: 42 });
    expect(result).toHaveProperty('journey_day', 42);
  });

  it('blocks noticed, named, settled (regulation labels)', () => {
    const result = filterPixelProperties({ noticed: 'breathed', named: 'fear', settled: true, event_category: 'regulation' });
    expect(result).not.toHaveProperty('noticed');
    expect(result).not.toHaveProperty('named');
    expect(result).not.toHaveProperty('settled');
    expect(result).toHaveProperty('event_category', 'regulation');
  });

  it('blocks companion_state and carry_label', () => {
    const result = filterPixelProperties({ companion_state: '{...}', carry_label: 'my label', source: 'home' });
    expect(result).not.toHaveProperty('companion_state');
    expect(result).not.toHaveProperty('carry_label');
    expect(result).toHaveProperty('source', 'home');
  });
});

// ── sanitizeBackendMeta ──────────────────────────────────────────────────────

describe('sanitizeBackendMeta', () => {
  it('returns empty object for empty input', () => {
    expect(sanitizeBackendMeta({})).toEqual({});
  });

  it('strips raw-text keys', () => {
    const result = sanitizeBackendMeta({
      text_encrypted: 'cipher',
      voice_text: 'transcript',
      s3_key: 'key',
      journey_day: 3,
      source: 'home',
    });
    expect(result).not.toHaveProperty('text_encrypted');
    expect(result).not.toHaveProperty('voice_text');
    expect(result).not.toHaveProperty('s3_key');
    expect(result).toHaveProperty('journey_day', 3);
    expect(result).toHaveProperty('source', 'home');
  });

  it('preserves internal fields not in the raw-text strip list', () => {
    const result = sanitizeBackendMeta({ prana_type: 'agitated', journey_day: 1 });
    // prana_type is NOT in backend strip list — backend may store it internally
    expect(result).toHaveProperty('prana_type', 'agitated');
    expect(result).toHaveProperty('journey_day', 1);
  });

  it('strips string values longer than 100 chars', () => {
    const result = sanitizeBackendMeta({ long_field: 'x'.repeat(101), short_field: 'ok' });
    expect(result).not.toHaveProperty('long_field');
    expect(result).toHaveProperty('short_field', 'ok');
  });
});

// ── firePixel consent gate ────────────────────────────────────────────────────

describe('firePixel consent gate (via webAnalytics.track)', () => {
  const originalLocalStorage = global.localStorage;
  const originalFbq = (global.window as any).fbq;

  beforeEach(() => {
    (global.window as any).fbq = vi.fn();
    localStorage.clear();
    // Reset module so _consentGranted re-reads localStorage
    vi.resetModules();
  });

  afterEach(() => {
    (global.window as any).fbq = originalFbq;
  });

  it('does not call window.fbq when consent is absent', async () => {
    const { webAnalytics } = await import('../lib/webAnalytics');
    localStorage.removeItem('kalpx_analytics_consent');
    webAnalytics.track('test_event', { event_category: 'home' });
    expect((global.window as any).fbq).not.toHaveBeenCalled();
  });

  it('does not call window.fbq when consent is denied', async () => {
    localStorage.setItem('kalpx_analytics_consent', 'denied');
    const { webAnalytics } = await import('../lib/webAnalytics');
    webAnalytics.track('test_event', { event_category: 'home' });
    expect((global.window as any).fbq).not.toHaveBeenCalled();
  });
});
