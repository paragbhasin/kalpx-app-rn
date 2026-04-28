import { describe, it, expect } from 'vitest';
import { retreatInterestSchema } from '@kalpx/validation';

describe('retreatInterestSchema', () => {
  const validPayload = {
    interests: ['Yoga & Meditation'],
    locations: ['Mountains'],
    duration: '7_days' as const,
    experience: 'comfort' as const,
  };

  it('valid payload accepts', () => {
    const result = retreatInterestSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it('missing interests array fails', () => {
    const { interests: _omit, ...rest } = validPayload;
    const result = retreatInterestSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('empty interests array fails', () => {
    const result = retreatInterestSchema.safeParse({ ...validPayload, interests: [] });
    expect(result.success).toBe(false);
  });

  it('invalid duration enum fails', () => {
    const result = retreatInterestSchema.safeParse({ ...validPayload, duration: '2_days' });
    expect(result.success).toBe(false);
  });

  it('invalid experience enum fails', () => {
    const result = retreatInterestSchema.safeParse({ ...validPayload, experience: 'luxury' });
    expect(result.success).toBe(false);
  });

  it('spiritualIntent over 500 chars fails', () => {
    const result = retreatInterestSchema.safeParse({
      ...validPayload,
      spiritualIntent: 'a'.repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it('valid partial (only required fields) accepts', () => {
    const result = retreatInterestSchema.safeParse({
      interests: ['Healing & Therapy'],
      locations: ['Beach'],
      duration: '3_days',
      experience: 'essencial',
    });
    expect(result.success).toBe(true);
  });
});
