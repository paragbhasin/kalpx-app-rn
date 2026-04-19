# Silk Integrity — Flow Status

31 flows authored. Status values: `ready` | `needs_selector_patch` | `blocked_by_data` | `blocked_by_app_bug`.

Phase 3 (2026-04-18) — canonical persona seed cleared all `blocked_by_data`
rows; Agent X testID land cleared most `needs_selector_patch` rows. Rows
below tagged `ready` assume Maestro is run against the freshly landed
testIDs.

| # | Slug | File | Status | Notes |
|---|---|---|---|---|
| 01 | onboarding_start | `01_onboarding_start.yaml` | needs_selector_patch | Guest enter + pattern-scan only; no testIDs on onboarding CTA (P5) |
| 02 | recognition | `02_recognition.yaml` | needs_selector_patch | Turn-N chips + recognition line need testIDs (P5) |
| 03 | triad_reveal | `03_triad_reveal.yaml` | needs_selector_patch | Triad cards need testIDs (P5 — onboarding reveal surface) |
| 04 | first_dashboard | `04_first_dashboard.yaml` | needs_selector_patch | Chains from flow 03; inherits selector gaps (P5) |
| 05 | dashboard_load | `05_dashboard_load.yaml` | ready | Smoke persona live on dev; text anchors stable |
| 06 | triad_visibility | `06_triad_visibility.yaml` | ready | Phase 3: `core_item_<kind>` testIDs expected on CoreItemsList |
| 07 | quick_checkin_balanced | `07_quick_checkin_balanced.yaml` | ready | Phase 3: `checkin_state_<state>` testIDs expected |
| 08 | quick_checkin_agitated | `08_quick_checkin_agitated.yaml` | ready | Phase 3: `checkin_state_<state>` + `checkin_suggestion_0` testIDs expected |
| 09 | triggered_flow | `09_triggered_flow.yaml` | ready | "I Feel Triggered" text anchor is stable |
| 10 | grief_room | `10_grief_room.yaml` | ready | Phase 3: `more_support_grief_row` + `grief_room_opening_line` testIDs expected |
| 11 | loneliness_room | `11_loneliness_room.yaml` | ready | Phase 3: `more_support_loneliness_row` + `loneliness_room_opening_line` testIDs expected |
| 12 | joy_room | `12_joy_room.yaml` | ready | Phase 3: `joy_room_opening_line` testID expected; chip label founder-locked |
| 13 | growth_room | `13_growth_room.yaml` | ready | Phase 3: `growth_room_opening_line` + `inquiry_category_<cat>` testIDs expected |
| 14 | day7_checkpoint | `14_day7_checkpoint.yaml` | ready | Canonical `persona_day7` seeded. Phase 3: `checkpoint_day_7_narrative` / `..._headline` expected |
| 15 | day14_checkpoint | `15_day14_checkpoint.yaml` | ready | Canonical `persona_day14` seeded. Phase 3: `checkpoint_day_14_narrative` / `..._summary` expected |
| 16 | completion_core_mantra | `16_completion_core_mantra.yaml` | ready | Phase 3: `core_item_mantra` + `mantra_runner_*` + `completion_*` testIDs expected |
| 17 | completion_core_sankalp | `17_completion_core_sankalp.yaml` | ready | Phase 3: `core_item_sankalp` + `sankalp_hold` + `completion_*` testIDs expected |
| 18 | completion_core_practice | `18_completion_core_practice.yaml` | ready | Phase 3: `core_item_practice` + `practice_runner_*` + `completion_*` testIDs expected |
| 19 | completion_grief_mantra | `19_completion_grief_mantra.yaml` | ready | Phase 3: `more_support_grief_row` + `grief_mantra_option` + `completion_*` testIDs expected |
| 20 | completion_loneliness_mantra | `20_completion_loneliness_mantra.yaml` | ready | Phase 3: `more_support_loneliness_row` + `loneliness_mantra_option` + `completion_*` testIDs expected |
| 21 | completion_joy_mantra | `21_completion_joy_mantra.yaml` | ready | Phase 3: `joy_walk_option` + `completion_*` testIDs expected |
| 22 | completion_growth_mantra | `22_completion_growth_mantra.yaml` | ready | Phase 3: `inquiry_category_decision` + `inquiry_decision_mantra_option` + `completion_*` testIDs expected |
| 23 | completion_growth_practice | `23_completion_growth_practice.yaml` | ready | INVARIANT #8 guard; asserts exact "The rhythm clarifies what urgency cannot." |
| 24 | completion_additional_library | `24_completion_additional_library.yaml` | ready | Canonical `persona_additional_library` seeded. Phase 3: `additional_items_surface` + `additional_item_0` expected |
| 25 | completion_additional_custom | `25_completion_additional_custom.yaml` | ready | Canonical `persona_additional_custom` seeded. Phase 3: `additional_items_surface` + `additional_item_0` expected |
| 26 | completion_additional_recommended | `26_completion_additional_recommended.yaml` | ready | Canonical `persona_additional_recommended` seeded. Phase 3: `additional_items_surface` + `additional_item_0` expected |
| 27 | additional_items_surface | `27_additional_items_surface.yaml` | ready | Phase 3: `additional_items_surface` testID expected on AdditionalItemsSectionBlock |
| 28 | continuity | `28_continuity.yaml` | ready | Canonical `persona_welcomeback` seeded. Phase 3: `continuity_mirror_card` expected |
| 29 | path_milestone | `29_path_milestone.yaml` | ready | Canonical `persona_day7` seeded. Phase 3: `path_milestone_banner` expected |
| 30 | resilience_narrative | `30_resilience_narrative.yaml` | ready | Phase 3: `resilience_narrative_card` expected; sovereignty leak "NOTICING" lifted to eyebrow_label slot |
| 31 | entity_card | `31_entity_card.yaml` | ready | Phase 3: `entity_recognition_card` expected; sovereignty leak "MITRA NOTICED" lifted to eyebrow_label slot |

## Summary counts

- `ready`: 27 (flows 05–31 except onboarding entry group 01–04)
- `needs_selector_patch`: 4 (flows 01, 02, 03, 04 — onboarding surfaces, P5)
- `blocked_by_data`: 0 (canonical persona seed cleared all)
- `blocked_by_app_bug`: 0 (Phase 2 cleared all)

## Runtime coverage (layers 5 + 7)

Status `ready` means the flow is fully authored and selector-resolved on
paper. Layers 5 (component_renders) and 7 (telemetry_logged) can only be
proven by a live Maestro run against a Metro bundle; neither is
observed in this session. To close each flow's 5+7 gate, run:

```
npx maestro test .maestro/silk-integrity/<file>
```

against a Metro-connected device after Phase 3 testIDs land. The audit
matrix will flip each flow to `PASS` once a Maestro result file lands
with the flow's captured strings + 2xx api-log trace.

## Unblocking order (post-Phase-3)

1. Agent X completes testID land across FE components (blocks all
   `ready` rows on the Metro-side).
2. Run Maestro against device farm / local Metro → flip rows to PASS
   in the audit matrix.
3. Remaining onboarding selector patches (flows 01–04) — lowest
   priority because pattern-scan already catches most regressions.
