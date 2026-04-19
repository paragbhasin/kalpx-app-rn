# Canonical Route Map (RN navigation targets)

**Status:** living. Owner: Delivery Restoration program. Ticket: MDR-S1-14.
**Enforcement:** `FE/scripts/lint_routes.ts` — fails PR if any `navigate` / `loadScreen` / `return_to_source` action uses a non-canonical target.
**Standing rule (post-CP-1):** no new feature work lands on legacy `CompanionDashboardContainer`. Every dashboard-facing ticket specifies target container.

## Dashboard containers

| Flag state | Canonical target container_id | Registered at | Notes |
|---|---|---|---|
| `EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD=1` | `companion_dashboard` (aliased by ScreenRenderer) + `companion_dashboard_v3` (direct) | `ScreenRenderer.tsx:63-66, 94` | Both keys resolve to `NewDashboardContainer`; alias preserved for legacy navigate callers |
| `EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD=0` | `companion_dashboard` → `CompanionDashboardContainer` | `ScreenRenderer.tsx:63-66` | Maintenance-only after CP-1 prod flag flip |

**Rule:** actions that navigate to "the dashboard" MUST use `container_id: "companion_dashboard"` (the alias). This gives the flag the final say. Using `companion_dashboard_v3` literal is acceptable only for routes that must ONLY work under flag=1.

## Support rooms

| Source | container_id | state_id | Action |
|---|---|---|---|
| Grief Room entry (MoreSupportSheet) | `support_grief` | `room` | `enter_grief_room` (`actionExecutor.ts:4789`) |
| Grief Room exit | `companion_dashboard` | (default) | `exit_grief_room` (`:4814`) |
| Loneliness Room entry | `support_loneliness` | `room` | `enter_loneliness_room` (`:4879`) |
| Loneliness Room exit | `companion_dashboard` | (default) | `exit_loneliness_room` (`:4906`) |
| Joy Room entry (Track 1) | `support_joy` | `room` | `enter_joy_room` (`:4927`) |
| Joy Room exit | `companion_dashboard` | (default) | `exit_joy_room` (`:4951`) |
| Growth Room entry (Track 1) | `support_growth` | `room` | `enter_growth_room` (`:4975`) |
| Growth Room exit | `companion_dashboard` | (default) | `exit_growth_room` (`:4999`) |

## `return_to_source` routing (`actionExecutor.ts:5022`)

| `runner_source` | Target container_id | Target state_id |
|---|---|---|
| `support_grief` | `support_grief` | `room` |
| `support_loneliness` | `support_loneliness` | `room` |
| `support_joy` | `support_joy` | `room` |
| `support_growth` | `support_growth` | `room` |
| `core` / unknown / null | `companion_dashboard` | (default) |
| `additional_*` (library / custom / recommended) | `companion_dashboard` | (default) — S1-08 may override |

## Runners

| Surface | container_id | state_id | Entry action |
|---|---|---|---|
| Mantra runner | `practice_runner` | `mantra_runner` | `start_runner` |
| Mantra runner (cycle-transitions path, e.g. core mantra reveal) | `cycle_transitions` | `offering_reveal` → auto-advance | `start_runner` from dashboard |
| Sankalp hold | `practice_runner` | `sankalp_embody` / `sankalp_confirm` | `start_runner` |
| Practice runner | `practice_runner` | `practice_steps` / `practice_timer` | `start_runner` |
| Free mantra chanting (trigger sub-flow) | `practice_runner` | `free_mantra_chanting` | `initiate_trigger` |

## Completion surfaces

| Source variant | container_id | state_id |
|---|---|---|
| All `complete_runner` chains | `completion_return` | `transient` (via `CompletionReturnTransient`) |

## Checkpoint surfaces

| Day | container_id | state_id |
|---|---|---|
| Day 7 | dashboard-embedded via `CheckpointDay7Block` | — |
| Day 14 | dashboard-embedded via `CheckpointDay14Block` | — |

## Onboarding

| Turn | container_id |
|---|---|
| 1–7 | `onboarding_conversation` |
| 8 (triad reveal) | `onboarding_triad_reveal` → auto-route to `companion_dashboard` |

## Deprecated / banned targets (lint blocks)
- `companion_dashboard_legacy` — never existed; was an early proposal.
- `dashboard_v2` — obsolete.
- Direct `eval` of nav string from user input — forbidden.

## Adding a new route
1. Update this doc in the same PR.
2. Add the canonical target to `FE/scripts/lint_routes.ts` allow-list.
3. Wire the handler in `actionExecutor.ts` if it's a new action type.
4. Register in `ScreenRenderer.tsx` if it's a new `container_id`.
5. For post-CP-1 dashboard tickets: specify which container (legacy vs new) the feature targets.
