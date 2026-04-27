/**
 * Phase 12 — classBookingSchema validation contract.
 * Confirms the real wire fields (offering_id, scheduled_at, user_timezone,
 * tutor_timezone) are required and validated correctly.
 */

import { describe, it, expect } from 'vitest';
import { classBookingSchema } from '@kalpx/validation';

describe('classBookingSchema', () => {
  const valid = {
    offering_id: 1,
    scheduled_at: '2026-05-01T10:00:00Z',
    user_timezone: 'Asia/Kolkata',
    tutor_timezone: 'Asia/Kolkata',
  };

  it('accepts a valid booking payload', () => {
    const result = classBookingSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('accepts optional note and trial_selected', () => {
    const result = classBookingSchema.safeParse({
      ...valid,
      note: 'I am a beginner',
      trial_selected: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing offering_id', () => {
    const { offering_id: _, ...rest } = valid;
    const result = classBookingSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects empty scheduled_at with custom message', () => {
    const result = classBookingSchema.safeParse({ ...valid, scheduled_at: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('Select a time slot');
    }
  });

  it('rejects when scheduled_at is absent', () => {
    const { scheduled_at: _, ...rest } = valid;
    const result = classBookingSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('rejects offering_id of 0', () => {
    const result = classBookingSchema.safeParse({ ...valid, offering_id: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects note longer than 500 characters', () => {
    const result = classBookingSchema.safeParse({ ...valid, note: 'x'.repeat(501) });
    expect(result.success).toBe(false);
  });
});
