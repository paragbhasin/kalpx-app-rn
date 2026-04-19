# Silk Integrity Test Pack (31 flows)

**Owner:** Delivery Restoration (MDR-S1-13).
**Purpose:** prove the 7-step Delivery Standard (DoD chain) for each critical Mitra moment:

1. Content exists (ContentPack/WisdomAsset authored, `status=approved`)
2. Resolver selects it (orchestrator picks correct variant)
3. Endpoint returns it (HTTP response carries the slot values)
4. FE reads it at canonical path (per `CONTRACT_JOURNEY_COMPANION_V1.md`)
5. Component renders it (visible in DOM / UI tree) — **Maestro asserts here**
6. No fallback overrides (no English literal in the render — `FALLBACK_DENY_LIST.txt`)
7. Telemetry confirms it was shown (MitraDecisionLog row lands)

## 31-flow coverage

### A. Onboarding (01–04)
| # | Slug | File |
|---|---|---|
| 01 | onboarding_start | `01_onboarding_start.yaml` |
| 02 | recognition | `02_recognition.yaml` |
| 03 | triad_reveal | `03_triad_reveal.yaml` |
| 04 | first_dashboard | `04_first_dashboard.yaml` |

### B. Returning user (05–09)
| # | Slug | File |
|---|---|---|
| 05 | dashboard_load | `05_dashboard_load.yaml` |
| 06 | triad_visibility (Metro bug regression guard) | `06_triad_visibility.yaml` |
| 07 | quick_checkin_balanced | `07_quick_checkin_balanced.yaml` |
| 08 | quick_checkin_agitated | `08_quick_checkin_agitated.yaml` |
| 09 | triggered_flow | `09_triggered_flow.yaml` |

### C. Support rooms (10–13)
| # | Slug | File |
|---|---|---|
| 10 | grief_room (M46) | `10_grief_room.yaml` |
| 11 | loneliness_room (M47) | `11_loneliness_room.yaml` |
| 12 | joy_room (M48, Track 1) | `12_joy_room.yaml` |
| 13 | growth_room (M49, Track 1) | `13_growth_room.yaml` |

### D. Checkpoints (14–15)
| # | Slug | File |
|---|---|---|
| 14 | day7_checkpoint (M24) | `14_day7_checkpoint.yaml` |
| 15 | day14_checkpoint (M25) | `15_day14_checkpoint.yaml` |

### E. Completion flows (16–26)
| # | Slug | File |
|---|---|---|
| 16 | completion_core_mantra | `16_completion_core_mantra.yaml` |
| 17 | completion_core_sankalp | `17_completion_core_sankalp.yaml` |
| 18 | completion_core_practice | `18_completion_core_practice.yaml` |
| 19 | completion_grief_mantra | `19_completion_grief_mantra.yaml` |
| 20 | completion_loneliness_mantra | `20_completion_loneliness_mantra.yaml` |
| 21 | completion_joy_mantra | `21_completion_joy_mantra.yaml` |
| 22 | completion_growth_mantra | `22_completion_growth_mantra.yaml` |
| 23 | completion_growth_practice (INVARIANT #8) | `23_completion_growth_practice.yaml` |
| 24 | completion_additional_library | `24_completion_additional_library.yaml` |
| 25 | completion_additional_custom | `25_completion_additional_custom.yaml` |
| 26 | completion_additional_recommended | `26_completion_additional_recommended.yaml` |

### F. Dashboard parity surfaces (27–31)
| # | Slug | File |
|---|---|---|
| 27 | additional_items_surface | `27_additional_items_surface.yaml` |
| 28 | continuity | `28_continuity.yaml` |
| 29 | path_milestone | `29_path_milestone.yaml` |
| 30 | resilience_narrative | `30_resilience_narrative.yaml` |
| 31 | entity_card | `31_entity_card.yaml` |

## Shared helpers (`common/`)

- `common/login_as_smoke_persona.yaml` — login as canonical smoke persona.
- `common/login_as_persona.yaml` — parameterized via `PERSONA_EMAIL` / `PERSONA_PASSWORD`.
- `common/guest_enter.yaml` — cold-open onboarding-eligible path.
- `common/wait_for_dashboard.yaml` — waits for dashboard readiness.
- `common/assert_no_english_fallback.yaml` — enforces `FALLBACK_DENY_LIST.txt`.
- `common/launch_dev_client.yaml` — cold-launch with dev-client scheme.

## Companion documents

- `FALLBACK_DENY_LIST.txt` — strings that must never render.
- `PERSONAS.md` — which persona each flow assumes + seed pointers.
- `SELECTOR_GAPS.md` — every `SELECTOR_PATCH_NEEDED` with FE patch suggestion.
- `FLOW_STATUS.md` — readiness table (ready / needs_selector_patch / blocked_by_data / blocked_by_app_bug).

## Running

Single flow:
```bash
cd kalpx-app-rn
npx maestro test .maestro/silk-integrity/06_triad_visibility.yaml
```

Whole pack:
```bash
cd kalpx-app-rn
npx maestro test .maestro/silk-integrity/
```

CI: added as required gate in the RN pipeline once MDR-S1-13 lands + selector patches clear.

## Assertions per flow

Each flow must assert:
- **Presence:** expected ContentPack slot values render (pattern or exact-text).
- **Absence of fallback:** `common/assert_no_english_fallback.yaml` at end of every flow.
- **Telemetry:** a `MitraDecisionLog` row is written within 5s of the render (verified via jest e2e companion, not in-Maestro).

## Dev-backend prerequisite

Metro must point at dev backend (CloudFront → EC2 via `dev.kalpx.com`) and the
canonical smoke persona `smoke+triad@kalpx.com` must remain seeded (Journey 3637,
day 3/14, triad soham/permission_to_rest/mindful_55_walking). See
`PERSONAS.md` for additional seed-required personas.
