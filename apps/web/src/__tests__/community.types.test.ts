/**
 * Phase 13 — community type helper normalization.
 * getPostText and getPostAuthor must handle real wire fields and fallbacks.
 */

import { describe, it, expect } from 'vitest';
import { getPostText, getPostAuthor } from '@kalpx/types';

describe('getPostText', () => {
  it('returns content when present (real wire field)', () => {
    expect(getPostText({ content: 'Hello', body: 'fallback' })).toBe('Hello');
  });

  it('falls back to body when content is absent', () => {
    expect(getPostText({ body: 'Body text' })).toBe('Body text');
  });

  it('falls back to text when content and body are absent', () => {
    expect(getPostText({ text: 'Text field' })).toBe('Text field');
  });

  it('returns empty string when all fields absent', () => {
    expect(getPostText({})).toBe('');
  });
});

describe('getPostAuthor', () => {
  const creator = { id: 1, username: 'priya' };
  const author = { id: 2, username: 'ravi' };

  it('returns creator when present (real wire field)', () => {
    expect(getPostAuthor({ creator, author })).toBe(creator);
  });

  it('falls back to author when creator is absent', () => {
    expect(getPostAuthor({ author })).toBe(author);
  });

  it('returns undefined when both absent', () => {
    expect(getPostAuthor({})).toBeUndefined();
  });
});
