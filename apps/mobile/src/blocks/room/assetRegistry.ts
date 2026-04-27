/**
 * Asset registry — 6 palettes + 6 visual-anchor references.
 *
 * Per architecture §6 "Per-room opening design tokens".
 * Values are `null` placeholders for now; asset authoring is a parallel
 * content track. Phase 4 gate: opening assets approved.
 *
 * When assets are produced, swap each `null` for the imported Image/SVG
 * module reference (or remote URL). Do NOT change key names — they are
 * part of the canonical v3.1 contract.
 */

import type { PaletteKey, VisualAnchorKind } from "./types";

// Palette placeholders. Each key resolves to a design-token or image asset.
export const PALETTE_REGISTRY: Record<PaletteKey, unknown | null> = {
  stillness_dawn: null,
  connection_warmth: null,
  release_grey: null,
  clarity_silver: null,
  growth_earth: null,
  joy_gold: null,
};

// Visual-anchor placeholders. Each key resolves to a Lottie/SVG/Image asset.
export const VISUAL_ANCHOR_REGISTRY: Record<VisualAnchorKind, unknown | null> =
  {
    lotus_breathe: null,
    companion_flame: null,
    slow_water: null,
    discernment_line: null,
    path_seedling: null,
    fullness_orb: null,
  };

/**
 * Resolve a palette asset. Returns null when asset not yet authored.
 * Callers must be null-tolerant through Phase 4.
 */
export function resolvePalette(key: PaletteKey): unknown | null {
  return PALETTE_REGISTRY[key] ?? null;
}

/**
 * Resolve a visual anchor asset. Returns null when asset not yet authored.
 */
export function resolveVisualAnchor(kind: VisualAnchorKind): unknown | null {
  return VISUAL_ANCHOR_REGISTRY[kind] ?? null;
}
