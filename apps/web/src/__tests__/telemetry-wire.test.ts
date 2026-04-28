/**
 * Phase 11.5 — Telemetry wire-format tests.
 * Verifies trackEvent and trackCompletion send camelCase payloads matching mobile wire format.
 * Backend expects: { eventName, journeyId, dayNumber, ... } — NOT snake_case.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/api', () => ({
  api: { post: vi.fn().mockResolvedValue({ data: {} }) },
}));

import { trackEvent, trackCompletion } from '../engine/mitraApi';
import { api } from '../lib/api';

describe('trackEvent — wire format', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('sends eventName (camelCase) not event_name', async () => {
    await trackEvent('mantra_viewed', { journeyId: 4014, dayNumber: 8 });
    const body = (api.post as any).mock.calls[0][1];
    expect(body).toHaveProperty('eventName', 'mantra_viewed');
    expect(body).not.toHaveProperty('event_name');
  });

  it('sends journeyId (camelCase) not journey_id', async () => {
    await trackEvent('test_event', { journeyId: 4014, dayNumber: 8 });
    const body = (api.post as any).mock.calls[0][1];
    expect(body).toHaveProperty('journeyId', 4014);
    expect(body).not.toHaveProperty('journey_id');
  });

  it('sends dayNumber (camelCase) not day_number', async () => {
    await trackEvent('test_event', { journeyId: 4014, dayNumber: 8 });
    const body = (api.post as any).mock.calls[0][1];
    expect(body).toHaveProperty('dayNumber', 8);
    expect(body).not.toHaveProperty('day_number');
  });

  it('normalises legacy snake_case journey_id from call sites', async () => {
    await trackEvent('test_event', { journey_id: 4014, day_number: 8 });
    const body = (api.post as any).mock.calls[0][1];
    expect(body.journeyId).toBe(4014);
    expect(body.dayNumber).toBe(8);
  });

  it('includes locale and tz', async () => {
    await trackEvent('test_event', { journeyId: 1 });
    const body = (api.post as any).mock.calls[0][1];
    expect(body).toHaveProperty('locale', 'en');
    expect(body).toHaveProperty('tz');
  });

  it('posts to mitra/track-event/', async () => {
    await trackEvent('test_event', {});
    expect(api.post).toHaveBeenCalledWith('mitra/track-event/', expect.any(Object));
  });

  it('swallows errors — never throws', async () => {
    (api.post as any).mockRejectedValueOnce(new Error('network'));
    await expect(trackEvent('test_event', {})).resolves.toBeUndefined();
  });
});

describe('trackCompletion — wire format', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('sends itemType (camelCase) not item_type', async () => {
    await trackCompletion({ item_type: 'mantra', item_id: 'abc', journey_id: 1, day_number: 3 });
    const body = (api.post as any).mock.calls[0][1];
    expect(body).toHaveProperty('itemType', 'mantra');
    expect(body).not.toHaveProperty('item_type');
  });

  it('sends itemId (camelCase) not item_id', async () => {
    await trackCompletion({ item_type: 'mantra', item_id: 'abc', journey_id: 1, day_number: 3 });
    const body = (api.post as any).mock.calls[0][1];
    expect(body).toHaveProperty('itemId', 'abc');
    expect(body).not.toHaveProperty('item_id');
  });

  it('sends journeyId and dayNumber (camelCase)', async () => {
    await trackCompletion({ itemType: 'mantra', itemId: 'abc', journeyId: 4014, dayNumber: 8 });
    const body = (api.post as any).mock.calls[0][1];
    expect(body).toHaveProperty('journeyId', 4014);
    expect(body).toHaveProperty('dayNumber', 8);
    expect(body).not.toHaveProperty('journey_id');
    expect(body).not.toHaveProperty('day_number');
  });

  it('normalises legacy snake_case journey_id from call sites', async () => {
    await trackCompletion({ itemType: 'mantra', itemId: 'x', journey_id: 99, day_number: 5 });
    const body = (api.post as any).mock.calls[0][1];
    expect(body.journeyId).toBe(99);
    expect(body.dayNumber).toBe(5);
  });

  it('includes tz', async () => {
    await trackCompletion({ itemType: 'mantra', itemId: 'x' });
    const body = (api.post as any).mock.calls[0][1];
    expect(body).toHaveProperty('tz');
  });

  it('posts to mitra/track-completion/', async () => {
    await trackCompletion({ itemType: 'mantra', itemId: 'x' });
    expect(api.post).toHaveBeenCalledWith('mitra/track-completion/', expect.any(Object));
  });
});
