import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the API calls so tests don't need a real backend
vi.mock('../mitraApi', () => ({
  trackEvent: vi.fn().mockResolvedValue(undefined),
  trackCompletion: vi.fn().mockResolvedValue(undefined),
}));

// Mock webNavigate so tests can assert navigation
vi.mock('../../lib/webRouter', () => ({
  webNavigate: vi.fn(),
}));
vi.mock('../../hooks/useJourneyStatus', () => ({ invalidateJourneyStatusCache: vi.fn() }));

// Mock WEB_ENV
vi.mock('../../lib/env', () => ({
  WEB_ENV: { isDev: false },
}));

import { executeAction, type ActionContext } from '../actionExecutor';
import { trackEvent, trackCompletion } from '../mitraApi';
import { webNavigate } from '../../lib/webRouter';

function makeDispatch() {
  return vi.fn();
}

function makeContext(screenData: Record<string, any> = {}): ActionContext {
  return { dispatch: makeDispatch(), screenData };
}

describe('actionExecutor — Phase 5 proof subset', () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('unknown action type logs warning and does not throw', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await expect(
      executeAction({ type: 'some_future_action' }, makeContext()),
    ).resolves.toBeUndefined();
    warnSpy.mockRestore();
  });

  it('navigate with companion_dashboard target redirects to /en/mitra/dashboard', async () => {
    const ctx = makeContext();
    await executeAction(
      { type: 'navigate', target: { container_id: 'companion_dashboard', state_id: 'day_active' } },
      ctx,
    );
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/dashboard');
    expect(ctx.dispatch).not.toHaveBeenCalled();
  });

  it('navigate with contract target dispatches loadScreen and navigates to engine URL', async () => {
    const ctx = makeContext();
    await executeAction(
      { type: 'navigate', target: { container_id: 'cycle_transitions', state_id: 'offering_reveal' } },
      ctx,
    );
    expect(ctx.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ payload: { containerId: 'cycle_transitions', stateId: 'offering_reveal' } }),
    );
    expect(webNavigate).toHaveBeenCalledWith(
      '/en/mitra/engine?containerId=cycle_transitions&stateId=offering_reveal',
    );
  });

  it('load_screen dispatches loadScreen and navigates to engine URL', async () => {
    const ctx = makeContext();
    await executeAction(
      { type: 'load_screen', container_id: 'cycle_transitions', state_id: 'offering_reveal' },
      ctx,
    );
    expect(ctx.dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ payload: { containerId: 'cycle_transitions', stateId: 'offering_reveal' } }),
    );
    expect(webNavigate).toHaveBeenCalledWith(
      '/en/mitra/engine?containerId=cycle_transitions&stateId=offering_reveal',
    );
  });

  it('go_back dispatches goBack and navigates -1', async () => {
    const ctx = makeContext();
    await executeAction({ type: 'go_back' }, ctx);
    expect(ctx.dispatch).toHaveBeenCalled();
    expect(webNavigate).toHaveBeenCalledWith(-1);
  });

  it('track_event calls mitraApi.trackEvent with event name and journey context', async () => {
    const ctx = makeContext({ journey_id: 42, day_number: 3 });
    await executeAction(
      { type: 'track_event', payload: { eventName: 'mantra_tapped', meta: { foo: 'bar' } } },
      ctx,
    );
    expect(trackEvent).toHaveBeenCalledWith('mantra_tapped', {
      journey_id: 42,
      day_number: 3,
      foo: 'bar',
    });
  });

  it('track_completion calls mitraApi.trackCompletion with item context', async () => {
    const ctx = makeContext({ journey_id: 42, day_number: 3 });
    await executeAction(
      {
        type: 'track_completion',
        payload: { itemType: 'mantra', item_id: 'so_hum', source: 'core' },
      },
      ctx,
    );
    expect(trackCompletion).toHaveBeenCalledWith(
      expect.objectContaining({ item_type: 'mantra', item_id: 'so_hum', source: 'core' }),
    );
  });

  it('track_completion with missing itemType/itemId warns and skips API call', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const ctx = makeContext({});
    await executeAction({ type: 'track_completion', payload: {} }, ctx);
    expect(trackCompletion).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('info_start_click with info in screenData fires trackEvent + trackCompletion + navigate dashboard', async () => {
    const ctx = makeContext({
      journey_id: 10,
      day_number: 5,
      info: { item_id: 'so_hum', item_type: 'mantra', title: 'So Hum' },
    });
    await executeAction({ type: 'info_start_click' }, ctx);
    expect(trackEvent).toHaveBeenCalledWith('mantra_offering_viewed', expect.any(Object));
    expect(trackCompletion).toHaveBeenCalledWith(expect.objectContaining({ item_id: 'so_hum', item_type: 'mantra' }));
    expect(webNavigate).toHaveBeenCalledWith('/en/mitra/dashboard');
  });

  it('info_start_click without info in screenData warns and no-ops', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await executeAction({ type: 'info_start_click' }, makeContext({}));
    expect(trackEvent).not.toHaveBeenCalled();
    expect(webNavigate).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('navigate action without target warns and no-ops', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await executeAction({ type: 'navigate', target: null }, makeContext());
    expect(webNavigate).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
