import { describe, it, expect } from 'vitest';
import { getApiErrorMessage } from '../lib/apiErrors';
import { normalizeJourneyStatus } from '../types/api';

describe('getApiErrorMessage', () => {
  it('returns detail from response', () => {
    const err = { response: { data: { detail: 'Invalid credentials.' } } };
    expect(getApiErrorMessage(err)).toBe('Invalid credentials.');
  });

  it('returns message from response.data', () => {
    const err = { response: { data: { message: 'Too many attempts.' } } };
    expect(getApiErrorMessage(err)).toBe('Too many attempts.');
  });

  it('returns first field error from response.data object', () => {
    const err = { response: { data: { email: ['Enter a valid email address.'] } } };
    expect(getApiErrorMessage(err)).toBe('Enter a valid email address.');
  });

  it('returns fallback when no response', () => {
    expect(getApiErrorMessage(new Error('Network Error'))).toBe('Network Error');
  });

  it('returns custom fallback for unknown errors', () => {
    expect(getApiErrorMessage(null, 'Custom fallback')).toBe('Custom fallback');
  });
});

describe('normalizeJourneyStatus', () => {
  it('returns false for null/undefined', () => {
    expect(normalizeJourneyStatus(null)).toBe(false);
    expect(normalizeJourneyStatus(undefined)).toBe(false);
  });

  it('returns true for active_journey: true', () => {
    expect(normalizeJourneyStatus({ active_journey: true })).toBe(true);
  });

  it('returns true for has_active_journey: true', () => {
    expect(normalizeJourneyStatus({ has_active_journey: true })).toBe(true);
  });

  it('returns true for journey.status = active', () => {
    expect(normalizeJourneyStatus({ journey: { status: 'active' } })).toBe(true);
  });

  it('returns true for status = active', () => {
    expect(normalizeJourneyStatus({ status: 'active' })).toBe(true);
  });

  it('returns true for journey_id present without ended status', () => {
    expect(normalizeJourneyStatus({ journey_id: 42 })).toBe(true);
  });

  it('returns false for empty object', () => {
    expect(normalizeJourneyStatus({})).toBe(false);
  });
});
