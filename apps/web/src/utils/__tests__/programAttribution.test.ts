import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { captureProgramAttribution, getPendingProgramCode, clearProgramAttribution } from '../programAttribution';

// Minimal localStorage mock
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
};

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k]);
  Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });
  Object.defineProperty(global, 'document', { value: { referrer: '' }, writable: true });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('captureProgramAttribution', () => {
  it('stores pending_program_code', () => {
    Object.defineProperty(global, 'window', {
      value: { location: { search: '' } },
      writable: true,
    });
    captureProgramAttribution('ABC123');
    expect(localStorageMock.getItem('pending_program_code')).toBe('ABC123');
  });

  it('stores pending_program_source as direct when no utm_medium', () => {
    Object.defineProperty(global, 'window', {
      value: { location: { search: '' } },
      writable: true,
    });
    captureProgramAttribution('ABC123');
    expect(localStorageMock.getItem('pending_program_source')).toBe('direct');
  });

  it('stores utm_medium as pending_program_source when present', () => {
    Object.defineProperty(global, 'window', {
      value: { location: { search: '?utm_medium=whatsapp' } },
      writable: true,
    });
    captureProgramAttribution('ABC123');
    expect(localStorageMock.getItem('pending_program_source')).toBe('whatsapp');
  });

  it('stores full program_attribution JSON with all UTM params', () => {
    Object.defineProperty(global, 'window', {
      value: { location: { search: '?utm_source=temple&utm_medium=poster&utm_campaign=BAYSHIV1&utm_content=flyer' } },
      writable: true,
    });
    captureProgramAttribution('BAYSHIV1');
    const raw = localStorageMock.getItem('program_attribution');
    expect(raw).not.toBeNull();
    const attr = JSON.parse(raw!);
    expect(attr.campaign_code).toBe('BAYSHIV1');
    expect(attr.utm_source).toBe('temple');
    expect(attr.utm_medium).toBe('poster');
    expect(attr.utm_campaign).toBe('BAYSHIV1');
    expect(attr.utm_content).toBe('flyer');
    expect(attr.landed_at).toBeTruthy();
  });

  it('uses campaign_code as utm_campaign fallback when utm_campaign not in URL', () => {
    Object.defineProperty(global, 'window', {
      value: { location: { search: '?utm_source=yoga' } },
      writable: true,
    });
    captureProgramAttribution('YOGA01');
    const attr = JSON.parse(localStorageMock.getItem('program_attribution')!);
    expect(attr.utm_campaign).toBe('YOGA01');
  });

  it('overwrites existing attribution on repeated call (idempotent per spec)', () => {
    Object.defineProperty(global, 'window', {
      value: { location: { search: '' } },
      writable: true,
    });
    captureProgramAttribution('FIRST1');
    captureProgramAttribution('SECOND2');
    expect(localStorageMock.getItem('pending_program_code')).toBe('SECOND2');
  });

  it('fails silently when localStorage is unavailable', () => {
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: () => { throw new Error('unavailable'); },
        setItem: () => { throw new Error('unavailable'); },
        removeItem: () => { throw new Error('unavailable'); },
      },
      writable: true,
    });
    Object.defineProperty(global, 'window', {
      value: { location: { search: '' } },
      writable: true,
    });
    // Must not throw
    expect(() => captureProgramAttribution('ABC123')).not.toThrow();
  });
});

describe('getPendingProgramCode', () => {
  it('returns stored code', () => {
    localStorageMock.setItem('pending_program_code', 'XYZ789');
    expect(getPendingProgramCode()).toBe('XYZ789');
  });

  it('returns null when not set', () => {
    expect(getPendingProgramCode()).toBeNull();
  });
});

describe('clearProgramAttribution', () => {
  it('removes all three keys', () => {
    Object.defineProperty(global, 'window', {
      value: { location: { search: '' } },
      writable: true,
    });
    captureProgramAttribution('CLR1');
    clearProgramAttribution();
    expect(localStorageMock.getItem('pending_program_code')).toBeNull();
    expect(localStorageMock.getItem('pending_program_source')).toBeNull();
    expect(localStorageMock.getItem('program_attribution')).toBeNull();
  });
});
