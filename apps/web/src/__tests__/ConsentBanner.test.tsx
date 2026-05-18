import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConsentBanner } from '../components/ConsentBanner';

const CONSENT_KEY = 'kalpx_analytics_consent';

describe('ConsentBanner', () => {
  beforeEach(() => {
    localStorage.clear();
    // Suppress act() warnings in test output
    vi.spyOn(window, 'dispatchEvent').mockImplementation(() => true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders when localStorage key is absent', () => {
    render(<ConsentBanner />);
    expect(screen.getByRole('region', { name: /analytics consent/i })).toBeTruthy();
  });

  it('does not render when consent is already set to granted', () => {
    localStorage.setItem(CONSENT_KEY, 'granted');
    render(<ConsentBanner />);
    expect(screen.queryByRole('region', { name: /analytics consent/i })).toBeNull();
  });

  it('does not render when consent is already set to denied', () => {
    localStorage.setItem(CONSENT_KEY, 'denied');
    render(<ConsentBanner />);
    expect(screen.queryByRole('region', { name: /analytics consent/i })).toBeNull();
  });

  it('writes granted and hides banner when "Accept analytics" is clicked', () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /accept analytics/i }));
    expect(localStorage.getItem(CONSENT_KEY)).toBe('granted');
    expect(screen.queryByRole('region', { name: /analytics consent/i })).toBeNull();
  });

  it('writes denied and hides banner when "Essential only" is clicked', () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /essential only/i }));
    expect(localStorage.getItem(CONSENT_KEY)).toBe('denied');
    expect(screen.queryByRole('region', { name: /analytics consent/i })).toBeNull();
  });

  it('dispatches consent_updated event on choice', () => {
    render(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /accept analytics/i }));
    expect(window.dispatchEvent).toHaveBeenCalledWith(expect.objectContaining({ type: 'consent_updated' }));
  });
});
