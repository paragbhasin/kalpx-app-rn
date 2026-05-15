# Contract Deltas V1 — Strategy vs Current Implementation
*Generated 2026-04-20 by Agent A0*

## Verdict
**1 CONFLICT FOUND** (C1). One adjacent governance gap noted as acceptable-with-override (C2-gap). All other candidate conflicts verified false.

## True conflicts

### C1 — Runner exit from canonical v3.1 rooms lands on dashboard, not source room
- **Strategy says** (§10): "Runner exit path: if runner source is support_room, exit returns to source room (not dashboard) unless explicit `room_exit` chosen."
- **Code does**:
  - BE: `canonical_runner_resolver._resolve_runner_source` (`/Users/paragbhasin/kalpx/core/canonical_runner_resolver.py:178-184`) stamps `runner_source="support_room"` for all v3.1 room runners. `_resolve_return_behavior` (L187-197) correctly returns `"to_source_room"` and action envelope emits `return_behavior` (`room_selection.py:475`).
  - FE: `CompletionReturnTransient.handleReturnHome` (`/Users/paragbhasin/kalpx-app-rn/src/blocks/CompletionReturnTransient.tsx:172-183`) checks `SUPPORT_SOURCES = {support_grief, support_loneliness, support_joy, support_growth}` — the canonical string `"support_room"` is NOT in that set.
  - FE: `actionExecutor.ts` case `return_to_source` (L5384-5414) only maps `{support_grief, support_loneliness, support_joy, support_growth}` — `"support_room"` falls to dashboard fallback (L5409).
  - FE: `return_behavior` field on action envelope is declared in `src/blocks/room/types.ts:144` but no FE code reads it (`grep return_behavior` returns only type declarations + a fallback constant in `RoomContainer.tsx:99`).
  - Net: a runner started from canonical v3.1 `room_stillness / room_connection / room_release / room_clarity / room_growth / room_joy` completes → `completion_return` → falls through to `companion_dashboard` instead of returning to source room.
- **Conflict type**: contradiction (shipped behavior violates §10)
- **Proposed resolution**: code change — extend FE `SUPPORT_SOURCES` set + `return_to_source` map to include `"support_room"` and route via `screenState.room_id` (already stamped by `RoomActionRunnerPill.tsx:42-44`). No spec change.
- **Founder call required**: no — pure FE wiring fix, strategy is unambiguous.

## False alarms verified

1. **§9 sacred vs telemetry separation** — VERIFIED_NO_CONFLICT. `sacred_views.py:170-200` writes `RoomEvent` (encrypted label, sacred-trace table) AND `RoomTelemetryEvent` (breadcrumb, `payload={surface: sacred_write, writes_event, analytics_key}` — label text explicitly excluded per comment L198). Two tables, two policies. §9 satisfied.
2. **§8 joy↔growth 7-day hard filter** — VERIFIED_NO_CONFLICT. `room_selection.py:984-999 + 1089-1094` computes paired-room `RoomRenderLog` refs over 7-day window and hard-rejects matches for mantra/practice slots.
3. **§3 core↔room same-day exclusion** — VERIFIED_NO_CONFLICT. `room_selection.py:206-219 + 1083-1085` queries `JourneyActivity` with `source__in=[core, core_deepen, additional_*]` and hard-excludes matches today.
4. **§4 canonical runner payload parity** — VERIFIED_NO_CONFLICT. `canonical_runner_resolver.py` is the single resolver; IMPLEMENTATION_STATUS_V1 confirms core + room runners share shape.
5. **§5 `surface_eligibility` enum match** — VERIFIED_NO_CONFLICT. Master{Mantra,Sankalp,Practice} + RoomContentPool all use `"support_room"` (see `room_selection.py:140`, `migrations/0121_seed_room_step_templates.py:267`, tests `test_room_render_endpoint.py:64`). Matches strategy's canonical list (`core/additional/support_room/dashboard/completion`).
6. **§7 active core triad items into rooms** — VERIFIED_NO_CONFLICT. Strategy §7 is a pool-CURATION rule ("do not build pools importing…"), not a runtime filter. Runtime coverage is provided by §3's same-day exclusion on JourneyActivity source=core, which IS enforced. No internal contradiction.
7. **§11 anchor-swap review gate** — VERIFIED_NO_CONFLICT (acceptable gap, not contradiction). Strategy §11 lists anchor swaps as a founder-escalation trigger, but does not mandate a code-level gate; pool `anchor_ref` is only modifiable via migration authored by a dev — functionally a manual gate. Governance fields (`surface_override_approved_by` etc.) are tracked as missing in IMPLEMENTATION_STATUS_V1 P1.
8. **§10 runner exit to source room** — CONFIRMED_CONFLICT. See C1 above.

## Files inspected
- `/Users/paragbhasin/kalpx/core/room_selection.py` (hard filter L138-150; core/add exclusion L206-219, 1083-1085; joy↔growth 7-day L258-276, 984-999, 1089-1094; action envelope return_behavior L475)
- `/Users/paragbhasin/kalpx/core/rooms/views.py` (render endpoint; no v3.1/§9 issues)
- `/Users/paragbhasin/kalpx/core/rooms/sacred_views.py` (dual-write L170-200, label excluded from telemetry L198)
- `/Users/paragbhasin/kalpx/core/canonical_runner_resolver.py` (runner_source default L178-184; return_behavior default L187-197)
- `/Users/paragbhasin/kalpx/core/wisdom/selector.py` (SURFACE_INTERACTION_POLICY, `room_<id>_surface` canonical + alias map L1200-1205)
- `/Users/paragbhasin/kalpx/core/models.py` (MasterMantra/Sankalp/Practice/WisdomAsset/RoomContentPool all carry `surface_eligibility` JSON field)
- `/Users/paragbhasin/kalpx-app-rn/src/blocks/room/RoomRenderer.tsx` + `src/containers/RoomContainer.tsx` + `src/blocks/room/actions/RoomActionRunnerPill.tsx:40-56` (room_id stamped; runner_payload passed through)
- `/Users/paragbhasin/kalpx-app-rn/src/blocks/CompletionReturnTransient.tsx:167-202` (SUPPORT_SOURCES set missing "support_room")
- `/Users/paragbhasin/kalpx-app-rn/src/engine/actionExecutor.ts` (enter_room L4857-4942; room_exit L4950-4975; return_to_source L5384-5415; complete_runner L3499-3568)
- `/Users/paragbhasin/kalpx-app-rn/src/blocks/room/types.ts` (`ReturnBehavior`, `SelectionSurface = "support_room"`)
