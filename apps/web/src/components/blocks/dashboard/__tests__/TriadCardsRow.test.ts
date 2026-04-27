/**
 * TriadCardsRow — pure data-layer tests.
 * Tests screenData extraction logic without React rendering (node env).
 */

import { describe, it, expect } from 'vitest';

// Pure helper tested in isolation — mirrors what TriadCardsRow computes
function extractTriadItems(sd: Record<string, any>) {
  const triadArr: any[] = Array.isArray(sd.today?.triad) ? sd.today.triad : [];
  const completed: string[] = Array.isArray(sd.completed_today) ? sd.completed_today : [];

  const SLOT_TITLE: Record<string, string> = {
    mantra: 'card_mantra_title',
    sankalp: 'card_sankalpa_title',
    practice: 'card_ritual_title',
  };

  return ['mantra', 'sankalp', 'practice'].map((slot) => {
    const raw = triadArr.find((t: any) => t?.slot === slot);
    return {
      slot,
      title: raw?.title || sd[SLOT_TITLE[slot]] || '',
      completed: completed.includes(slot),
    };
  });
}

describe('TriadCardsRow data extraction', () => {
  it('extracts titles from today.triad array', () => {
    const sd = {
      today: {
        triad: [
          { slot: 'mantra', item_id: 'm1', title: 'Om Namah Shivaya', subtitle: 'Sacred', completed_today: false },
          { slot: 'sankalp', item_id: 's1', title: 'I am at peace', subtitle: '', completed_today: true },
          { slot: 'practice', item_id: 'p1', title: 'Breath work', subtitle: '', completed_today: false },
        ],
      },
      completed_today: ['sankalp'],
    };
    const items = extractTriadItems(sd);
    expect(items[0].title).toBe('Om Namah Shivaya');
    expect(items[1].title).toBe('I am at peace');
    expect(items[2].title).toBe('Breath work');
  });

  it('falls back to flat card_* keys when today.triad is absent', () => {
    const sd = {
      card_mantra_title: 'Mantra fallback',
      card_sankalpa_title: 'Sankalp fallback',
      card_ritual_title: 'Practice fallback',
      completed_today: [],
    };
    const items = extractTriadItems(sd);
    expect(items[0].title).toBe('Mantra fallback');
    expect(items[1].title).toBe('Sankalp fallback');
    expect(items[2].title).toBe('Practice fallback');
  });

  it('marks completed correctly from completed_today array', () => {
    const sd = {
      today: { triad: [{ slot: 'mantra', title: 'Om' }] },
      completed_today: ['mantra'],
    };
    const items = extractTriadItems(sd);
    expect(items[0].completed).toBe(true);
    expect(items[1].completed).toBe(false);
    expect(items[2].completed).toBe(false);
  });

  it('returns empty titles when no data', () => {
    const items = extractTriadItems({});
    items.forEach((item) => expect(item.title).toBe(''));
  });

  it('handles partial triad (only mantra slot present)', () => {
    const sd = {
      today: { triad: [{ slot: 'mantra', title: 'Om' }] },
      completed_today: [],
    };
    const items = extractTriadItems(sd);
    expect(items[0].title).toBe('Om');
    expect(items[1].title).toBe('');
    expect(items[2].title).toBe('');
  });
});

describe('WhyThis null-safety', () => {
  function hasWhyThis(sd: Record<string, any>): boolean {
    return (
      (Array.isArray(sd['why_this_l1_items']) && (sd['why_this_l1_items'] as any[]).length > 0) ||
      !!(sd['why_this'] as any)?.level1
    );
  }

  it('is false when both why_this and items are absent', () => {
    expect(hasWhyThis({})).toBe(false);
  });

  it('is true when why_this.level1 present', () => {
    expect(hasWhyThis({ why_this: { level1: 'Dharma', level2: '', level3: '' } })).toBe(true);
  });

  it('is true when why_this_l1_items has items', () => {
    expect(hasWhyThis({ why_this_l1_items: [{ id: 'mantra', label: 'Sacred sound steadies' }] })).toBe(true);
  });
});
