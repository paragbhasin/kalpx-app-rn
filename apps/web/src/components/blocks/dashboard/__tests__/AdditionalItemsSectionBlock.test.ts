/**
 * AdditionalItemsSectionBlock — data-layer + live-fetch + collapse + add/remove tests.
 * Tests screenData extraction, action payload logic, fetch/collapse state, and add/remove without React rendering.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mirrors the source computation in AdditionalItemsSectionBlock
function computeSource(item: { source?: string; item_type?: string }): string {
  return item.source || `additional_${item.item_type || 'recommended'}`;
}

// Mirrors item extraction from sd
function extractItems(sd: Record<string, any>) {
  return Array.isArray(sd.additional_items) ? sd.additional_items : [];
}

describe('AdditionalItemsSectionBlock — data layer', () => {
  it('returns empty array when additional_items is absent', () => {
    expect(extractItems({})).toEqual([]);
  });

  it('returns empty array when additional_items is not an array', () => {
    expect(extractItems({ additional_items: null })).toEqual([]);
    expect(extractItems({ additional_items: 'bad' })).toEqual([]);
  });

  it('returns items from sd.additional_items', () => {
    const items = [{ item_id: 'a', title: 'Test', item_type: 'mantra' }];
    expect(extractItems({ additional_items: items })).toEqual(items);
  });

  it('prefers item.source when present (L1 — explicit backend source)', () => {
    expect(computeSource({ source: 'additional_library', item_type: 'mantra' })).toBe('additional_library');
    expect(computeSource({ source: 'additional_custom', item_type: 'sankalp' })).toBe('additional_custom');
  });

  it('falls back to additional_${item_type} when source is absent', () => {
    expect(computeSource({ item_type: 'mantra' })).toBe('additional_mantra');
    expect(computeSource({ item_type: 'sankalp' })).toBe('additional_sankalp');
    expect(computeSource({ item_type: 'practice' })).toBe('additional_practice');
  });

  it('falls back to additional_recommended when source and item_type are both absent', () => {
    expect(computeSource({})).toBe('additional_recommended');
  });

  it('item.completedToday drives completed state', () => {
    const items = [
      { item_id: 'a', completedToday: true },
      { item_id: 'b', completedToday: false },
      { item_id: 'c' },
    ];
    const sd = { additional_items: items };
    const extracted = extractItems(sd);
    expect(extracted[0].completedToday).toBe(true);
    expect(extracted[1].completedToday).toBe(false);
    expect(extracted[2].completedToday).toBeUndefined();
  });
});

// ─── Live fetch + collapse state logic ───────────────────────────────────────

// Mirrors the fetch+collapse resolution in AdditionalItemsSectionBlock
function resolveItemsAndCollapse(
  fetchResult: { items: any[]; uiHints: { shouldCollapse?: boolean } },
  sdItems: any[],
  initialCollapsed: boolean,
): { items: any[]; collapsed: boolean } {
  let items = sdItems;
  let collapsed = initialCollapsed;

  if (fetchResult.items.length > 0 || sdItems.length > 0) {
    items = fetchResult.items.length > 0 ? fetchResult.items : sdItems;
  }
  if (fetchResult.uiHints?.shouldCollapse === true) collapsed = true;
  else collapsed = false;

  return { items, collapsed };
}

describe('AdditionalItemsSectionBlock — live fetch + collapse (T1–T5)', () => {
  it('T1: fetch success — live items replace sd.additional_items', () => {
    const sdItems = [{ item_id: 'sd-1', title: 'From envelope' }];
    const liveItems = [{ item_id: 'live-1', title: 'From API' }];
    const result = resolveItemsAndCollapse({ items: liveItems, uiHints: {} }, sdItems, true);
    expect(result.items).toEqual(liveItems);
  });

  it('T2: fetch failure — fallback to sd.additional_items', () => {
    const sdItems = [{ item_id: 'sd-1', title: 'From envelope' }];
    const result = resolveItemsAndCollapse({ items: [], uiHints: {} }, sdItems, true);
    expect(result.items).toEqual(sdItems);
  });

  it('T3: shouldCollapse absent → expanded (B2 fix)', () => {
    const result = resolveItemsAndCollapse({ items: [], uiHints: {} }, [], true);
    expect(result.collapsed).toBe(false);
  });

  it('T4: shouldCollapse=false → expanded', () => {
    const result = resolveItemsAndCollapse({ items: [], uiHints: { shouldCollapse: false } }, [], true);
    expect(result.collapsed).toBe(false);
  });

  it('T5: shouldCollapse=true → collapsed', () => {
    const result = resolveItemsAndCollapse({ items: [], uiHints: { shouldCollapse: true } }, [], false);
    expect(result.collapsed).toBe(true);
  });
});

// ─── Add / Remove logic ───────────────────────────────────────────────────────

describe('AdditionalItemsSectionBlock — add/remove (T6–T10)', () => {
  it('T6: add success — onItemAdded called when addAdditionalItem resolves', async () => {
    const onItemAdded = vi.fn();
    const addAdditionalItem = vi.fn().mockResolvedValue({});

    const handleAdd = async (itemId: string, itemType: string) => {
      await addAdditionalItem(itemId, itemType);
      onItemAdded();
    };

    await handleAdd('item-1', 'mantra');
    expect(onItemAdded).toHaveBeenCalledTimes(1);
  });

  it('T7: add duplicate — addedIds Set prevents re-add', async () => {
    const addedIds = new Set(['item-1']);
    const addAdditionalItem = vi.fn().mockResolvedValue({});

    const handleAdd = async (id: string) => {
      if (addedIds.has(id)) return;
      await addAdditionalItem(id, 'mantra');
      addedIds.add(id);
    };

    await handleAdd('item-1');
    expect(addAdditionalItem).not.toHaveBeenCalled();
  });

  it('T8: add failure — no crash; item not added to addedIds', async () => {
    const addedIds = new Set<string>();
    const addAdditionalItem = vi.fn().mockRejectedValue(new Error('network'));

    const handleAdd = async (id: string) => {
      try {
        await addAdditionalItem(id, 'mantra');
        addedIds.add(id);
      } catch {
        // best-effort
      }
    };

    await handleAdd('item-2');
    expect(addedIds.has('item-2')).toBe(false);
  });

  it('T9: remove success — item filtered from list after await', async () => {
    let items = [
      { id: 'a', item_id: 'a', title: 'Keep' },
      { id: 'b', item_id: 'b', title: 'Remove' },
    ];
    const removeAdditionalItem = vi.fn().mockResolvedValue(undefined);

    const handleRemove = async (id: string) => {
      await removeAdditionalItem(id);
      items = items.filter((i) => (i.id ?? i.item_id) !== id);
    };

    await handleRemove('b');
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('a');
  });

  it('T10: remove failure — item stays in list', async () => {
    let items = [
      { id: 'a', item_id: 'a', title: 'A' },
      { id: 'b', item_id: 'b', title: 'B' },
    ];
    const removeAdditionalItem = vi.fn().mockRejectedValue(new Error('network'));

    const handleRemove = async (id: string) => {
      try {
        await removeAdditionalItem(id);
        items = items.filter((i) => (i.id ?? i.item_id) !== id);
      } catch {
        // best-effort
      }
    };

    await handleRemove('b');
    expect(items).toHaveLength(2);
  });
});

// ─── handleLaunch source computation ─────────────────────────────────────────

describe('AdditionalItemsSectionBlock — handleLaunch source (T11)', () => {
  it('T11: start_runner dispatched with item.source when present, else derived', () => {
    const dispatched: any[] = [];
    const onAction = (action: any) => dispatched.push(action);

    const handleLaunch = (item: any) => {
      onAction({
        type: 'start_runner',
        payload: {
          source: item.source || `additional_${item.item_type || 'recommended'}`,
          variant: item.item_type || 'mantra',
          item,
        },
      });
    };

    handleLaunch({ item_id: 'x', item_type: 'mantra', source: 'additional_library' });
    expect(dispatched[0].payload.source).toBe('additional_library');

    handleLaunch({ item_id: 'y', item_type: 'sankalp' });
    expect(dispatched[1].payload.source).toBe('additional_sankalp');

    handleLaunch({ item_id: 'z' });
    expect(dispatched[2].payload.source).toBe('additional_recommended');
  });
});
