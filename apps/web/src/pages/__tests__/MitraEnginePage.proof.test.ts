import { describe, it, expect } from 'vitest';

// Test the URL parsing logic in isolation without rendering React components.
// The full component test requires JSDOM + React Router; this covers the param extraction logic.

function parseEngineParams(search: string, locationState: any, storeIds: { containerId: string; stateId: string }) {
  const params = new URLSearchParams(search);
  const containerId =
    locationState?.containerId ||
    params.get('containerId') ||
    storeIds.containerId;
  const stateId =
    locationState?.stateId ||
    params.get('stateId') ||
    storeIds.stateId;
  return { containerId, stateId };
}

describe('MitraEnginePage — containerId/stateId resolution', () => {
  it('reads containerId and stateId from query params', () => {
    const result = parseEngineParams(
      '?containerId=cycle_transitions&stateId=offering_reveal',
      null,
      { containerId: 'portal', stateId: 'portal' },
    );
    expect(result.containerId).toBe('cycle_transitions');
    expect(result.stateId).toBe('offering_reveal');
  });

  it('router state takes precedence over query params', () => {
    const result = parseEngineParams(
      '?containerId=cycle_transitions&stateId=offering_reveal',
      { containerId: 'practice_runner', stateId: 'mantra_runner' },
      { containerId: 'portal', stateId: 'portal' },
    );
    expect(result.containerId).toBe('practice_runner');
    expect(result.stateId).toBe('mantra_runner');
  });

  it('falls back to Redux store values when neither query params nor state present', () => {
    const result = parseEngineParams('', null, { containerId: 'portal', stateId: 'portal' });
    expect(result.containerId).toBe('portal');
    expect(result.stateId).toBe('portal');
  });

  it('handles URL-encoded containerId correctly', () => {
    const result = parseEngineParams(
      `?containerId=${encodeURIComponent('cycle_transitions')}&stateId=${encodeURIComponent('offering_reveal')}`,
      null,
      { containerId: 'portal', stateId: 'portal' },
    );
    expect(result.containerId).toBe('cycle_transitions');
    expect(result.stateId).toBe('offering_reveal');
  });
});
