# `src/blocks/room/` — Room System v3.1.1-wisdom scaffolding

**Status:** scaffolding only. Feature flag `EXPO_PUBLIC_MITRA_V3_ROOMS` is **OFF by default**.
No user-visible surface renders through this folder until per-room flip in Phase 6.

## Do not flip the feature flag until:

1. Per-room canonical `room_<id>_surface` entries exist in `SURFACE_INTERACTION_POLICY`
   on the backend (see architecture §5.7.7). Legacy aliasing such as `room_joy ↔ joy_room`
   is a **temporary bridge only** and must be removed before production flip.
2. Agent A signs off on the per-room canonical surface policy.
3. Agent 5 CI is green on the room's fixtures (envelope invariants I-1 through I-12).
4. Phase 6 flip order is respected: **joy → growth → clarity → stillness → connection → release**.
   Each room parallel-runs behind flag for 1 week before production cutover.

## Architecture reference

`docs/ROOM_SYSTEM_V3_1_ARCHITECTURE.md` is the source of truth.

- §6  — Opening Experience 6-phase sequence (ambient / opening_line / breath / second_beat / silence_window / options_reveal)
- §7.1 — `RoomRenderV1` envelope shape
- §7.2 — `Action` polymorphic shape
- §5.7 — Wisdom integration (L1 banner, L2 teaching, L3 post-runner reflection)

## Files

| File | Role |
|---|---|
| `types.ts` | TS types for the envelope, action, opening experience, runner payload. |
| `RoomRenderer.tsx` | Top-level component. Flag-gated; returns `null` when flag off. |
| `RoomOpeningExperience.tsx` | 6-phase state machine; audio + reduced-motion stubs. |
| `RoomPrincipleBanner.tsx` | L1 wisdom banner — scalar, null self-hides. |
| `RoomActionList.tsx` | Iterates `envelope.actions[]`; dispatches by `action_type`. |
| `actions/` | 8 action sub-component stubs + banner scalar + re-export barrel. |
| `assetRegistry.ts` | 6 palette + 6 visual-anchor placeholders (`null` pending Phase 4). |
| `__tests__/RoomRenderer.test.tsx` | Jest test for flag-off no-render, testID pattern, reduced-motion. |

## Rules for contributors

- **Do not import** from `src/extensions/moments/{grief,loneliness,joy,growth}_room/*`.
  Those are legacy v2 containers; v3.1 is a clean-room rewrite.
- **Do not import** `src/engine/actionExecutor.ts` from this folder. The v3.1 runner
  path uses the canonical resolver landing in Phase 5; scaffolding must stay pure.
- **Do not modify** `src/engine/ScreenRenderer.tsx` or any existing container
  to route into `RoomRenderer` yet. Wiring is a Phase 6 step per room.
- Keep stubs minimal. Business logic lands in Phase 5+.
