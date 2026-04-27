/**
 * Phase 13 — communityPostSchema + communityCommentSchema validation.
 * Tests use real wire field names: content (not body).
 */

import { describe, it, expect } from 'vitest';
import { communityPostSchema, communityCommentSchema } from '@kalpx/validation';

describe('communityPostSchema', () => {
  it('accepts valid post with content only', () => {
    const result = communityPostSchema.safeParse({ content: 'Hello world' });
    expect(result.success).toBe(true);
  });

  it('accepts post with title and content', () => {
    const result = communityPostSchema.safeParse({ content: 'Body', title: 'My title' });
    expect(result.success).toBe(true);
  });

  it('rejects empty content', () => {
    const result = communityPostSchema.safeParse({ content: '' });
    expect(result.success).toBe(false);
  });

  it('rejects whitespace-only content (trimmed)', () => {
    const result = communityPostSchema.safeParse({ content: '   ' });
    expect(result.success).toBe(false);
  });

  it('rejects content exceeding 2000 characters', () => {
    const result = communityPostSchema.safeParse({ content: 'x'.repeat(2001) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('2000');
    }
  });

  it('rejects title exceeding 120 characters', () => {
    const result = communityPostSchema.safeParse({ content: 'ok', title: 'x'.repeat(121) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('120');
    }
  });

  it('accepts content at exactly 2000 characters', () => {
    const result = communityPostSchema.safeParse({ content: 'x'.repeat(2000) });
    expect(result.success).toBe(true);
  });
});

describe('communityCommentSchema', () => {
  it('accepts valid comment', () => {
    const result = communityCommentSchema.safeParse({ content: 'Great post!' });
    expect(result.success).toBe(true);
  });

  it('rejects empty content', () => {
    const result = communityCommentSchema.safeParse({ content: '' });
    expect(result.success).toBe(false);
  });

  it('rejects whitespace-only content (trimmed)', () => {
    const result = communityCommentSchema.safeParse({ content: '  ' });
    expect(result.success).toBe(false);
  });

  it('rejects content exceeding 1000 characters', () => {
    const result = communityCommentSchema.safeParse({ content: 'x'.repeat(1001) });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('1000');
    }
  });

  it('accepts content at exactly 1000 characters', () => {
    const result = communityCommentSchema.safeParse({ content: 'x'.repeat(1000) });
    expect(result.success).toBe(true);
  });
});
