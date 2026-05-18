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

  it('shows product analytics row', () => {
    render(<ConsentBanner />);
    expect(screen.getByText(/product analytics/i)).toBeTruthy();
  });

  it('shows marketing & ads row', () => {
    render(<ConsentBanner />);
    expect(screen.getByText(/marketing & ads/i)).toBeTruthy();
  });

  // ── Defaults ─────────────────────────────────────────────────────────────

  it('both rows default to declined (Decline buttons are active)', () => {
    render(<ConsentBanner />);
    const declineButtons = screen.getAllByRole('button', { name: /decline/i });
    expect(declineButtons).toHaveLength(2);
  });

  // ── Save writes all four localStorage keys ────────────────────────────────

  it('save writes kalpx_analytics_consent', () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe('denied');
  });

  it('save writes kalpx_marketing_consent', () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));
    expect(localStorage.getItem(MARKETING_CONSENT_KEY)).toBe('denied');
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

  // ── Accepting analytics row ───────────────────────────────────────────────

  it('accepting analytics row writes granted for analytics key', () => {
    render(<ConsentBanner />);
    // Accept buttons: first Accept = analytics, second Accept = marketing
    const acceptButtons = screen.getAllByRole('button', { name: /^accept$/i });
    fireEvent.click(acceptButtons[0]);
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe('granted');
    expect(localStorage.getItem(MARKETING_CONSENT_KEY)).toBe('denied');
  });

  // ── Accepting marketing row ───────────────────────────────────────────────

  it('accepting marketing row writes granted for marketing key', () => {
    render(<ConsentBanner />);
    const acceptButtons = screen.getAllByRole('button', { name: /^accept$/i });
    fireEvent.click(acceptButtons[1]);
    fireEvent.click(screen.getByRole('button', { name: /save preferences/i }));
    expect(localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe('denied');
    expect(localStorage.getItem(MARKETING_CONSENT_KEY)).toBe('granted');
  });
});
