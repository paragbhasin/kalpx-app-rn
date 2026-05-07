/**
 * Stage 1 Curated Intelligence — shared normalizer helpers.
 *
 * Single source of truth for all curated why-this interpretation logic.
 * Both mobile and web import from here — do not duplicate this logic in
 * platform components.
 *
 * Flags involved: MITRA_CURATED_ROOMS, MITRA_CURATED_DASHBOARD_WHY_THIS
 * Neither flag is read here — callers apply results regardless and the
 * normalizers degrade gracefully when curated fields are absent.
 */

import type { RoomRenderV1, RoomSelectedItem, DashboardWhyThis } from '@kalpx/types';

// ─────────────────────────────────────────────────────────────────────────────
// Room why-this
// ─────────────────────────────────────────────────────────────────────────────

export type RoomWhyThisMode =
  | 'legacy'           // show_room_why_this absent/null — preserve existing tap
  | 'curated_success'  // show_room_why_this=true + selected_item present
  | 'curated_fallback'; // show_room_why_this=false OR true+selected_item absent

export interface RoomWhyThisState {
  mode: RoomWhyThisMode;
  canOpenWhyThis: boolean;
  shouldSuppressTap: boolean;
  selectedItem: RoomSelectedItem | null;
  selectionSource: string | null;
}

/**
 * Normalise the room render envelope into a typed why-this state.
 *
 * Rules (order matters):
 * 1. show_room_why_this absent/null → legacy (preserve existing tap)
 * 2. show_room_why_this=false → curated_fallback, suppress tap
 * 3. show_room_why_this=true + selected_item present → curated_success
 * 4. show_room_why_this=true + selected_item ABSENT → curated_fallback, suppress
 *    (malformed curated response — do NOT silently revert to broad-scoring tap)
 */
export function normalizeRoomWhyThisState(envelope: RoomRenderV1): RoomWhyThisState {
  const flag = envelope.show_room_why_this;

  if (flag == null) {
    return {
      mode: 'legacy',
      canOpenWhyThis: false,
      shouldSuppressTap: false,
      selectedItem: null,
      selectionSource: envelope.selection_source ?? null,
    };
  }

  if (!flag) {
    return {
      mode: 'curated_fallback',
      canOpenWhyThis: false,
      shouldSuppressTap: true,
      selectedItem: null,
      selectionSource: envelope.selection_source ?? null,
    };
  }

  // flag=true
  if (envelope.selected_item) {
    return {
      mode: 'curated_success',
      canOpenWhyThis: true,
      shouldSuppressTap: false,
      selectedItem: envelope.selected_item,
      selectionSource: envelope.selection_source ?? null,
    };
  }

  // flag=true but no selected_item — malformed; suppress rather than fall back
  return {
    mode: 'curated_fallback',
    canOpenWhyThis: false,
    shouldSuppressTap: true,
    selectedItem: null,
    selectionSource: envelope.selection_source ?? null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Platform-specific L2 payload builders
// ─────────────────────────────────────────────────────────────────────────────

export interface MobileCuratedRoomL2Payload {
  room_support_line: string;
  why_this_short: string;
  context: string;
  /** Mobile WhyThisL2Sheet reads p.essence as body — set to room_support_line. */
  essence: string;
  tradition_family: null;
  sources: never[];
}

/** Build the why_this_principle payload for mobile's WhyThisL2Sheet. */
export function buildMobileCuratedRoomL2Payload(item: RoomSelectedItem): MobileCuratedRoomL2Payload {
  return {
    room_support_line: item.room_support_line,
    why_this_short: item.why_this_short,
    context: item.short_label,
    essence: item.room_support_line,
    tradition_family: null,
    sources: [],
  };
}

export interface WebCuratedRoomL2Payload {
  room_support_line: string;
  why_this_short: string;
  context: string;
  /** Web WhyThisL2SheetBlock reads principle.description as body — set to room_support_line. */
  description: string;
  /** Web reads principle.tradition — set to null to suppress. */
  tradition: null;
  tradition_family: null;
  sources: never[];
}

/** Build the why_this_principle payload for web's WhyThisL2SheetBlock. */
export function buildWebCuratedRoomL2Payload(item: RoomSelectedItem): WebCuratedRoomL2Payload {
  return {
    room_support_line: item.room_support_line,
    why_this_short: item.why_this_short,
    context: item.short_label,
    description: item.room_support_line,
    tradition: null,
    tradition_family: null,
    sources: [],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard why-this
// ─────────────────────────────────────────────────────────────────────────────

export type DashboardWhyThisMode = 'none' | 'legacy' | 'curated';

export interface DashboardWhyThisState {
  mode: DashboardWhyThisMode;
  /** false if scope=none, or curated scope with no level1/level2 content. */
  canOpenWhyThis: boolean;
  /** Raw label from backend. Each platform applies its own default string. */
  label: string | null;
  showPathItems: boolean;
  itemSpecificLines: Record<string, string>;
}

const CURATED_SCOPES = new Set(['path', 'today', 'now', 'item']);

/**
 * Normalise a dashboard why_this payload into a typed state.
 *
 * Rules (order matters):
 * 1. null/undefined → mode=none, canOpenWhyThis=false (no payload, never open)
 * 2. scope=none → mode=none, canOpenWhyThis=false
 * 3. scope=legacy → mode=legacy, canOpenWhyThis = !!(level1||level2||level3)
 * 4. scope absent → mode=legacy, canOpenWhyThis = !!(level1||level2||level3)
 * 5. curated scopes → mode=curated, canOpenWhyThis = !!(level1||level2)
 *    (empty curated response must not open modal)
 */
export function normalizeDashboardWhyThisState(
  whyThis: DashboardWhyThis | null | undefined,
): DashboardWhyThisState {
  if (!whyThis) {
    return {
      mode: 'none',
      canOpenWhyThis: false,
      label: null,
      showPathItems: false,
      itemSpecificLines: {},
    };
  }

  const scope = whyThis.explanation_scope;

  if (scope === 'none') {
    return {
      mode: 'none',
      canOpenWhyThis: false,
      label: null,
      showPathItems: false,
      itemSpecificLines: {},
    };
  }

  if (!scope || scope === 'legacy') {
    const hasContent = !!(whyThis.level1 || whyThis.level2 || whyThis.level3);
    return {
      mode: 'legacy',
      canOpenWhyThis: hasContent,
      label: whyThis.label ?? null,
      showPathItems: false,
      itemSpecificLines: {},
    };
  }

  if (CURATED_SCOPES.has(scope)) {
    const hasContent = !!(whyThis.level1 || whyThis.level2);
    return {
      mode: 'curated',
      canOpenWhyThis: hasContent,
      label: whyThis.label ?? null,
      showPathItems: whyThis.show_path_items === true,
      itemSpecificLines: whyThis.item_specific_lines ?? {},
    };
  }

  // Unknown scope — closed
  return {
    mode: 'legacy',
    canOpenWhyThis: false,
    label: whyThis.label ?? null,
    showPathItems: false,
    itemSpecificLines: {},
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Context helper
// ─────────────────────────────────────────────────────────────────────────────

/** Returns true when the current overlay context is a room (not dashboard/other). */
export function isRoomWhyThisContext(
  screenData: Record<string, unknown> | null | undefined,
): boolean {
  return screenData?._overlay_parent_container === 'room';
}
