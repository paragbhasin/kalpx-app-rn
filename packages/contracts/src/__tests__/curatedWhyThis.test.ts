import { describe, it, expect } from 'vitest';
import {
  normalizeRoomWhyThisState,
  normalizeDashboardWhyThisState,
  isRoomWhyThisContext,
  buildMobileCuratedRoomL2Payload,
  buildWebCuratedRoomL2Payload,
} from '../curatedWhyThis';
import type { RoomRenderV1, RoomSelectedItem, DashboardWhyThis } from '@kalpx/types';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const SELECTED_ITEM: RoomSelectedItem = {
  item_id: 'test_item_001',
  item_type: 'mantra',
  title: 'Test mantra',
  short_label: 'A quiet anchor',
  room_support_line: 'You are held here.',
  why_this_short: 'This may bring stillness when the mind races.',
  freshness_group: 'group_a',
  semantic_family: 'grounding',
  source_family: 'yoga_sutras',
};

function makeEnvelope(overrides: Partial<RoomRenderV1> = {}): RoomRenderV1 {
  return {
    schema_version: 'room.render.v1',
    room_id: 'room_stillness',
    opening_line: 'Step in.',
    second_beat_line: null,
    ready_hint: 'Take a breath.',
    section_prompt: 'Choose your path.',
    dashboard_chip_label: null,
    principle_banner: null,
    opening_experience: {} as RoomRenderV1['opening_experience'],
    actions: [],
    provenance: {} as RoomRenderV1['provenance'],
    fallbacks: { hide_if_empty: [] },
    ...overrides,
  };
}

// ─── normalizeRoomWhyThisState ────────────────────────────────────────────────

describe('normalizeRoomWhyThisState', () => {
  it('absent field → legacy, shouldSuppressTap=false', () => {
    const result = normalizeRoomWhyThisState(makeEnvelope());
    expect(result.mode).toBe('legacy');
    expect(result.shouldSuppressTap).toBe(false);
    expect(result.canOpenWhyThis).toBe(false);
    expect(result.selectedItem).toBeNull();
  });

  it('null field → legacy, shouldSuppressTap=false', () => {
    const result = normalizeRoomWhyThisState(makeEnvelope({ show_room_why_this: null }));
    expect(result.mode).toBe('legacy');
    expect(result.shouldSuppressTap).toBe(false);
  });

  it('false → curated_fallback, shouldSuppressTap=true', () => {
    const result = normalizeRoomWhyThisState(makeEnvelope({ show_room_why_this: false }));
    expect(result.mode).toBe('curated_fallback');
    expect(result.shouldSuppressTap).toBe(true);
    expect(result.canOpenWhyThis).toBe(false);
  });

  it('true + selected_item present → curated_success, canOpenWhyThis=true', () => {
    const result = normalizeRoomWhyThisState(
      makeEnvelope({ show_room_why_this: true, selected_item: SELECTED_ITEM }),
    );
    expect(result.mode).toBe('curated_success');
    expect(result.canOpenWhyThis).toBe(true);
    expect(result.shouldSuppressTap).toBe(false);
    expect(result.selectedItem).toBe(SELECTED_ITEM);
  });

  it('true + selected_item ABSENT → curated_fallback, suppress (not legacy)', () => {
    const result = normalizeRoomWhyThisState(makeEnvelope({ show_room_why_this: true }));
    expect(result.mode).toBe('curated_fallback');
    expect(result.shouldSuppressTap).toBe(true);
    expect(result.canOpenWhyThis).toBe(false);
    expect(result.selectedItem).toBeNull();
  });

  it('selection_source forwarded correctly', () => {
    const result = normalizeRoomWhyThisState(
      makeEnvelope({ show_room_why_this: false, selection_source: 'safe_room_fallback' }),
    );
    expect(result.selectionSource).toBe('safe_room_fallback');
  });
});

// ─── normalizeDashboardWhyThisState ──────────────────────────────────────────

describe('normalizeDashboardWhyThisState', () => {
  it('null → none, canOpenWhyThis=false', () => {
    const result = normalizeDashboardWhyThisState(null);
    expect(result.mode).toBe('none');
    expect(result.canOpenWhyThis).toBe(false);
  });

  it('undefined → none, canOpenWhyThis=false', () => {
    const result = normalizeDashboardWhyThisState(undefined);
    expect(result.mode).toBe('none');
    expect(result.canOpenWhyThis).toBe(false);
  });

  it('explanation_scope=none → mode=none, canOpenWhyThis=false', () => {
    const result = normalizeDashboardWhyThisState({ explanation_scope: 'none' });
    expect(result.mode).toBe('none');
    expect(result.canOpenWhyThis).toBe(false);
  });

  it('explanation_scope=legacy + no level content → canOpenWhyThis=false', () => {
    const result = normalizeDashboardWhyThisState({ explanation_scope: 'legacy', label: 'A reflection' });
    expect(result.mode).toBe('legacy');
    expect(result.canOpenWhyThis).toBe(false);
    expect(result.label).toBe('A reflection');
  });

  it('explanation_scope=legacy + level1 present → canOpenWhyThis=true', () => {
    const result = normalizeDashboardWhyThisState({
      explanation_scope: 'legacy',
      label: 'A reflection',
      level1: 'The path behind this moment.',
    });
    expect(result.mode).toBe('legacy');
    expect(result.canOpenWhyThis).toBe(true);
  });

  it('scope absent + level1 present → legacy, canOpenWhyThis=true', () => {
    const result = normalizeDashboardWhyThisState({ level1: 'Grounding you here.' });
    expect(result.mode).toBe('legacy');
    expect(result.canOpenWhyThis).toBe(true);
  });

  it('scope absent + no level content → legacy, canOpenWhyThis=false', () => {
    const result = normalizeDashboardWhyThisState({ label: 'A label' });
    expect(result.mode).toBe('legacy');
    expect(result.canOpenWhyThis).toBe(false);
  });

  it('curated scope with level1 → canOpenWhyThis=true', () => {
    const result = normalizeDashboardWhyThisState({
      explanation_scope: 'path',
      level1: 'This path was chosen for you.',
    });
    expect(result.mode).toBe('curated');
    expect(result.canOpenWhyThis).toBe(true);
  });

  it('curated scope with level2 only → canOpenWhyThis=true', () => {
    const result = normalizeDashboardWhyThisState({
      explanation_scope: 'now',
      level2: 'Going deeper.',
    });
    expect(result.mode).toBe('curated');
    expect(result.canOpenWhyThis).toBe(true);
  });

  it('curated scope with NO level1 and NO level2 → canOpenWhyThis=false', () => {
    const result = normalizeDashboardWhyThisState({ explanation_scope: 'today' });
    expect(result.mode).toBe('curated');
    expect(result.canOpenWhyThis).toBe(false);
  });

  it('show_path_items=true forwarded correctly', () => {
    const result = normalizeDashboardWhyThisState({
      explanation_scope: 'path',
      level1: 'x',
      show_path_items: true,
    });
    expect(result.showPathItems).toBe(true);
  });

  it('item_specific_lines forwarded correctly', () => {
    const lines = { mantra: 'M line', sankalp: 'S line', practice: 'P line' };
    const result = normalizeDashboardWhyThisState({
      explanation_scope: 'today',
      level1: 'x',
      item_specific_lines: lines,
    });
    expect(result.itemSpecificLines).toEqual(lines);
  });
});

// ─── isRoomWhyThisContext ─────────────────────────────────────────────────────

describe('isRoomWhyThisContext', () => {
  it('null → false', () => {
    expect(isRoomWhyThisContext(null)).toBe(false);
  });

  it('undefined → false', () => {
    expect(isRoomWhyThisContext(undefined)).toBe(false);
  });

  it('"room" → true', () => {
    expect(isRoomWhyThisContext({ _overlay_parent_container: 'room' })).toBe(true);
  });

  it('"companion_dashboard" → false', () => {
    expect(isRoomWhyThisContext({ _overlay_parent_container: 'companion_dashboard' })).toBe(false);
  });
});

// ─── payload builders ─────────────────────────────────────────────────────────

describe('buildMobileCuratedRoomL2Payload', () => {
  it('essence equals room_support_line', () => {
    const payload = buildMobileCuratedRoomL2Payload(SELECTED_ITEM);
    expect(payload.essence).toBe(SELECTED_ITEM.room_support_line);
    expect(payload.tradition_family).toBeNull();
    expect(payload.sources).toEqual([]);
    expect(payload.context).toBe(SELECTED_ITEM.short_label);
  });
});

describe('buildWebCuratedRoomL2Payload', () => {
  it('description equals room_support_line, tradition=null', () => {
    const payload = buildWebCuratedRoomL2Payload(SELECTED_ITEM);
    expect(payload.description).toBe(SELECTED_ITEM.room_support_line);
    expect(payload.tradition).toBeNull();
    expect(payload.tradition_family).toBeNull();
    expect(payload.sources).toEqual([]);
    expect(payload.context).toBe(SELECTED_ITEM.short_label);
  });
});
