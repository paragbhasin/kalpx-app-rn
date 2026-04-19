# Silk Integrity — Flow Status

31 flows authored. Status values: `ready` | `needs_selector_patch` | `blocked_by_data` | `blocked_by_app_bug`.

| # | Slug | File | Status | Notes |
|---|---|---|---|---|
| 01 | onboarding_start | `01_onboarding_start.yaml` | needs_selector_patch | Guest enter + pattern-scan only; no testIDs on onboarding CTA |
| 02 | recognition | `02_recognition.yaml` | needs_selector_patch | Turn-N chips + recognition line need testIDs |
| 03 | triad_reveal | `03_triad_reveal.yaml` | needs_selector_patch | Triad cards need testIDs |
| 04 | first_dashboard | `04_first_dashboard.yaml` | needs_selector_patch | Chains from flow 03; inherits selector gaps |
| 05 | dashboard_load | `05_dashboard_load.yaml` | ready | Smoke persona live on dev; text anchors stable |
| 06 | triad_visibility | `06_triad_visibility.yaml` | needs_selector_patch | REGRESSION GUARD for Metro triad bug; pattern-scan only until testIDs land |
| 07 | quick_checkin_balanced | `07_quick_checkin_balanced.yaml` | needs_selector_patch | Checkin state chips need testIDs |
| 08 | quick_checkin_agitated | `08_quick_checkin_agitated.yaml` | needs_selector_patch | Same as 07 |
| 09 | triggered_flow | `09_triggered_flow.yaml` | ready | "I Feel Triggered" text anchor is stable |
| 10 | grief_room | `10_grief_room.yaml` | needs_selector_patch | More-support row + grief opening_line testIDs needed |
| 11 | loneliness_room | `11_loneliness_room.yaml` | needs_selector_patch | Same as 10 |
| 12 | joy_room | `12_joy_room.yaml` | ready | Chip label founder-locked ("I'm in a good place") |
| 13 | growth_room | `13_growth_room.yaml` | needs_selector_patch | Chip label stable; inquiry categories need testIDs |
| 14 | day7_checkpoint | `14_day7_checkpoint.yaml` | blocked_by_data | persona_day7 SEED REQUIRED; also needs checkpoint testIDs |
| 15 | day14_checkpoint | `15_day14_checkpoint.yaml` | blocked_by_data | persona_day14 SEED REQUIRED |
| 16 | completion_core_mantra | `16_completion_core_mantra.yaml` | needs_selector_patch | Runner + completion testIDs needed |
| 17 | completion_core_sankalp | `17_completion_core_sankalp.yaml` | needs_selector_patch | Sankalp hold testID needed |
| 18 | completion_core_practice | `18_completion_core_practice.yaml` | needs_selector_patch | Practice runner testIDs needed |
| 19 | completion_grief_mantra | `19_completion_grief_mantra.yaml` | needs_selector_patch | Grief → mantra option testID needed |
| 20 | completion_loneliness_mantra | `20_completion_loneliness_mantra.yaml` | needs_selector_patch | Loneliness → mantra option testID needed |
| 21 | completion_joy_mantra | `21_completion_joy_mantra.yaml` | needs_selector_patch | Joy walk/mantra option testID needed |
| 22 | completion_growth_mantra | `22_completion_growth_mantra.yaml` | needs_selector_patch | Growth inquiry testIDs needed |
| 23 | completion_growth_practice | `23_completion_growth_practice.yaml` | needs_selector_patch | INVARIANT #8 guard; asserts exact "The rhythm clarifies what urgency cannot." |
| 24 | completion_additional_library | `24_completion_additional_library.yaml` | blocked_by_data | persona_additional_library SEED REQUIRED |
| 25 | completion_additional_custom | `25_completion_additional_custom.yaml` | blocked_by_data | persona_additional_custom SEED REQUIRED |
| 26 | completion_additional_recommended | `26_completion_additional_recommended.yaml` | blocked_by_data | persona_additional_recommended SEED REQUIRED |
| 27 | additional_items_surface | `27_additional_items_surface.yaml` | blocked_by_app_bug | Additional items section not yet live on new dashboard (P1 parked) |
| 28 | continuity | `28_continuity.yaml` | blocked_by_data | persona_welcomeback SEED REQUIRED; also ContinuityMirrorCard may not be wired |
| 29 | path_milestone | `29_path_milestone.yaml` | blocked_by_data | persona_day7 SEED REQUIRED |
| 30 | resilience_narrative | `30_resilience_narrative.yaml` | blocked_by_app_bug | Resilience narrative card surface location unverified |
| 31 | entity_card | `31_entity_card.yaml` | needs_selector_patch | EntityRecognitionCard testID needed |

## Summary counts

- `ready`: 3 (flows 05, 09, 12)
- `needs_selector_patch`: 20
- `blocked_by_data`: 6 (flows 14, 15, 24, 25, 26, 28, 29 — persona seeds)
- `blocked_by_app_bug`: 2 (flows 27, 30 — surface wiring)

## Unblocking order

1. Seed personas (PERSONAS.md) → unblocks 14, 15, 24-26, 28, 29.
2. Land P0+P1 selector patches (SELECTOR_GAPS.md) → upgrades 12 flows to `ready`.
3. Resolve dashboard parity bugs for flows 27, 30.
4. Remaining onboarding selector patches (flows 01-04) — lowest priority.
