import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ConsentBanner, CONSENT_VERSION } from '../components/ConsentBanner';
import {
  ANALYTICS_CONSENT_KEY,
  MARKETING_CONSENT_KEY,
  CONSENT_VERSION_KEY,
  CONSENT_UPDATED_AT_KEY,
} from '../lib/webAnalytics';

describe('ConsentBanner', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(window, 'dispatchEvent').mockImplementation(() => true);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // ── Visibility ───────────────────────────────────────────────────────────

  it('renders when both consent keys are absent', () => {
    render(<ConsentBanner />);
    expect(screen.getByRole('region', { name: /privacy preferences/i })).toBeTruthy();
  });

  it('renders when only analytics consent is absent', () => {
    localStorage.setItem(MARKETING_CONSENT_KEY, 'denied');
    render(<ConsentBanner />);
    expect(screen.getByRole('region', { name: /privacy preferences/i })).toBeTruthy();
  });

  it('renders when only marketing consent is absent', () => {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, 'denied');
    render(<ConsentBanner />);
    expect(screen.getByRole('region', { name: /privacy preferences/i })).toBeTruthy();
  });

  it('does not render when both consent keys are already set', () => {
    localStorage.setItem(ANALYTICS_CONSENT_KEY, 'granted');
    localStorage.setItem(MARKETING_CONSENT_KEY, 'denied');
    render(<ConsentBanner />);
    expect(screen.queryByRole('region', { name: /privacy preferences/i })).toBeNull();
  });

  // ── Two rows ─────────────────────────────────────────────────────────────

  it('shows product analytics row title', () => {
    render(<ConsentBanner />);
    expect(screen.getByText(/help us improve mitra/i)).toBeTruthy();
  });

  it('shows marketing & ads row title', () => {
    render(<ConsentBanner />);
    expect(screen.getByText(/personalized ads/i)).toBeTruthy();
  });

  // ── Defaults: both visually pre-selected to Allow ─────────────────────

  it('Allow analytics button is active (aria-pressed=true) by default', () => {
    render(<ConsentBanner />);
    const btn = screen.getByRole('button', { name: /allow analytics/i });
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });

  it('Allow marketing button is active (aria-pressed=true) by default', () => {
    render(<ConsentBanner />);
    const btn = screen.getByRole('button', { name: /allow marketing/i });
    expect(btn.getAttribute('aria-pressed')).toBe('true');
  });

  it('Not now buttons are visible and inactive (aria-pressed=false) by default', () => {
    render(<ConsentBanner />);
    const notNowBtns = screen.getAllByRole('button', { name: /not now/i });
    expect(notNowBtns).toHaveLength(2);
    expect(notNowBtns[0].getAttribute('aria-pressed')).toBe('false');
    expect(notNowBtns[1].getAttribute('aria-pressed')).toBe('false');
  });

  // ── No localStorage written before Save ──────────────────────────────────

  it('does not write to localStorage before Save is clicked', () => {
    render(<ConsentBanner />);
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBeNull();
    expect(localStorage.getItem(MARKETING_CONSENT_KEY)).toBeNull();
  });

  it('clicking Not now does not write to localStorage until Save', () => {
    render(<ConsentBanner />);
    const notNowBtns = screen.getAllByRole('button', { name: /not now/i });
    fireEvent.click(notNowBtns[0]);
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBeNull();
  });

  // ── Save with defaults writes both as granted ─────────────────────────────

  it('save with defaults writes analytics=granted', () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe('granted');
  });

  it('save with defaults writes marketing=granted', () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));
    expect(localStorage.getItem(MARKETING_CONSENT_KEY)).toBe('granted');
  });

  it('save writes kalpx_consent_version', () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));
    expect(localStorage.getItem(CONSENT_VERSION_KEY)).toBe(CONSENT_VERSION);
  });

  it('save writes kalpx_consent_updated_at as ISO timestamp', () => {
    const before = Date.now();
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));
    const saved = localStorage.getItem(CONSENT_UPDATED_AT_KEY);
    expect(saved).not.toBeNull();
    const ts = new Date(saved!).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
  });

  // ── Mixed choices ─────────────────────────────────────────────────────────

  it('declining analytics then saving writes analytics=denied, marketing=granted', () => {
    render(<ConsentBanner />);
    const notNowBtns = screen.getAllByRole('button', { name: /not now/i });
    fireEvent.click(notNowBtns[0]);
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe('denied');
    expect(localStorage.getItem(MARKETING_CONSENT_KEY)).toBe('granted');
  });

  it('declining marketing then saving writes analytics=granted, marketing=denied', () => {
    render(<ConsentBanner />);
    const notNowBtns = screen.getAllByRole('button', { name: /not now/i });
    fireEvent.click(notNowBtns[1]);
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe('granted');
    expect(localStorage.getItem(MARKETING_CONSENT_KEY)).toBe('denied');
  });

  it('declining both then saving writes both=denied', () => {
    render(<ConsentBanner />);
    const notNowBtns = screen.getAllByRole('button', { name: /not now/i });
    fireEvent.click(notNowBtns[0]);
    fireEvent.click(notNowBtns[1]);
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe('denied');
    expect(localStorage.getItem(MARKETING_CONSENT_KEY)).toBe('denied');
  });

  it('re-selecting Allow after Not now restores granted on save', () => {
    render(<ConsentBanner />);
    const notNowBtns = screen.getAllByRole('button', { name: /not now/i });
    fireEvent.click(notNowBtns[0]); // decline analytics
    fireEvent.click(screen.getByRole('button', { name: /allow analytics/i })); // re-allow
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe('granted');
    expect(localStorage.getItem(MARKETING_CONSENT_KEY)).toBe('granted');
  });

  // ── consent_updated event ─────────────────────────────────────────────────

  it('dispatches consent_updated on save', () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'consent_updated' }),
    );
  });

  // ── Banner hides after save ───────────────────────────────────────────────

  it('banner hides after save', () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));
    expect(screen.queryByRole('region', { name: /privacy preferences/i })).toBeNull();
  });
});
