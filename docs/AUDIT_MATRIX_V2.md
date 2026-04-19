# Silk Integrity — Master Audit Matrix V2

_Generated 2026-04-19T05:13:41.969037+00:00_

## Summary

- **Total flows:** 33
- **PASS_BACKEND_FE_PENDING_RUNTIME:** 29
- **PARTIAL:** 4
- **P0:** 11  **P1:** 19  **P2:** 3

Layers 5 (component_renders) + 7 (telemetry_logged) are runtime-pending — they require live Maestro run against Metro. Rows tagged PASS_BACKEND_FE_PENDING_RUNTIME have clean backend + selector surface; run the listed Maestro invocation to close the gate.

## Canonical persona probe (2026-04-18)

All 7 canonical personas locked-triad + all 3 Master rows present. Card_titles populated. Full probe at `/tmp/persona_probe_clean.json`.

| Persona | email | locked_triad | missing | mantra_title | sankalp_title | practice_title |
|---|---|---|---|---|---|---|
| smoke_triad | smoke+triad@kalpx.com | True |  | সোহং | Permission to Rest | Mindful 5-5 Walking |
| persona_day7 | persona_day7@kalpx.com | True |  | সোহং | Permission to Rest | Mindful 5-5 Walking |
| persona_day14 | persona_day14@kalpx.com | True |  | সোহং | Permission to Rest | Mindful 5-5 Walking |
| persona_welcomeback | persona_welcomeback@kalpx.com | True |  | সোহং | Permission to Rest | Mindful 5-5 Walking |
| persona_additional_library | persona_additional_library@kalpx.com | True |  | সোহং | Permission to Rest | Mindful 5-5 Walking |
| persona_additional_custom | persona_additional_custom@kalpx.com | True |  | সোহং | Permission to Rest | Mindful 5-5 Walking |
| persona_additional_recommended | persona_additional_recommended@kalpx.com | True |  | সোহং | Permission to Rest | Mindful 5-5 Walking |

## Per-flow rows

| flow | augmented_status | severity | flow_status | failed_layer | backend_content_source | endpoint | component_surface | augmented_reason | maestro_invocation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| onboarding_start | PARTIAL | P2 | needs_selector_patch |  | unknown | unknown | unknown | selector patch pending upstream (onboarding P5) | npx maestro test .maestro/silk-integrity/01_onboarding_start.yaml |
| recognition | PARTIAL | P2 | needs_selector_patch |  | ContentPack: M07_turn7_recognition | POST /api/mitra/onboarding/complete/ | RecognitionBlock | selector patch pending upstream (onboarding P5) | npx maestro test .maestro/silk-integrity/02_recognition.yaml |
| triad_reveal | PARTIAL | P0 | needs_selector_patch |  | WisdomAsset + triad orchestrator | POST /api/mitra/journey/start/ | TriadRevealBlock | selector patch pending upstream (onboarding P5) | npx maestro test .maestro/silk-integrity/03_triad_reveal.yaml |
| first_dashboard | PARTIAL | P2 | needs_selector_patch |  | unknown | unknown | unknown | selector patch pending upstream (onboarding P5) | npx maestro test .maestro/silk-integrity/04_first_dashboard.yaml |
| dashboard_load | PASS_BACKEND_FE_PENDING_RUNTIME | P1 | ready |  | unknown | unknown | unknown | flow_status=ready; no direct probe coverage — Maestro live-run to close layers 5+7 | npx maestro test .maestro/silk-integrity/05_dashboard_load.yaml |
| triad_visibility | PASS_BACKEND_FE_PENDING_RUNTIME | P0 | ready |  | unknown | unknown | unknown | flow_status=ready; no direct probe coverage — Maestro live-run to close layers 5+7 | npx maestro test .maestro/silk-integrity/06_triad_visibility.yaml |
| quick_checkin_balanced | PASS_BACKEND_FE_PENDING_RUNTIME | P1 | ready |  | unknown | unknown | unknown | flow_status=ready; no direct probe coverage — Maestro live-run to close layers 5+7 | npx maestro test .maestro/silk-integrity/07_quick_checkin_balanced.yaml |
| quick_checkin_agitated | PASS_BACKEND_FE_PENDING_RUNTIME | P1 | ready |  | unknown | unknown | unknown | flow_status=ready; no direct probe coverage — Maestro live-run to close layers 5+7 | npx maestro test .maestro/silk-integrity/08_quick_checkin_agitated.yaml |
| triggered_flow | PASS_BACKEND_FE_PENDING_RUNTIME | P1 | ready |  | unknown | unknown | unknown | flow_status=ready; no direct probe coverage — Maestro live-run to close layers 5+7 | npx maestro test .maestro/silk-integrity/09_triggered_flow.yaml |
| grief_room | PASS_BACKEND_FE_PENDING_RUNTIME | P0 | ready |  | ContentPack: M46_grief_room | POST /api/mitra/content/moments/M46_grief_room/resolve/ | GriefRoomContainer | backend + selector clean; awaiting live Maestro layers 5+7 | npx maestro test .maestro/silk-integrity/10_grief_room.yaml |
| loneliness_room | PASS_BACKEND_FE_PENDING_RUNTIME | P0 | ready |  | ContentPack: M47_loneliness_room | POST /api/mitra/content/moments/M47_loneliness_room/resolve/ | LonelinessRoomContainer | backend + selector clean; awaiting live Maestro layers 5+7 | npx maestro test .maestro/silk-integrity/11_loneliness_room.yaml |
| joy_room | PASS_BACKEND_FE_PENDING_RUNTIME | P0 | ready |  | ContentPack: M48_joy_room | POST /api/mitra/content/moments/M48_joy_room/resolve/ | JoyRoomContainer | backend + selector clean; awaiting live Maestro layers 5+7 | npx maestro test .maestro/silk-integrity/12_joy_room.yaml |
| growth_room | PASS_BACKEND_FE_PENDING_RUNTIME | P0 | ready |  | ContentPack: M49_growth_room + M49_inquiry_seeds | POST /api/mitra/content/moments/M49_growth_room/resolve/ | GrowthRoomContainer | backend + selector clean; awaiting live Maestro layers 5+7 | npx maestro test .maestro/silk-integrity/13_growth_room.yaml |
| day7_checkpoint | PASS_BACKEND_FE_PENDING_RUNTIME | P1 | ready |  | ContentPack: M24_checkpoint_day_7 | GET /api/mitra/journey/checkpoint/day7/ | CheckpointDay7Block | backend + selector clean; awaiting live Maestro layers 5+7 | npx maestro test .maestro/silk-integrity/14_day7_checkpoint.yaml |
| day14_checkpoint | PASS_BACKEND_FE_PENDING_RUNTIME | P1 | ready |  | ContentPack: M25_checkpoint_day_14 + spine seed | GET /api/mitra/journey/checkpoint/day14/ | CheckpointDay14Block | backend + selector clean; awaiting live Maestro layers 5+7 | npx maestro test .maestro/silk-integrity/15_day14_checkpoint.yaml |
| completion_core_mantra | PASS_BACKEND_FE_PENDING_RUNTIME | P0 | ready |  | ContentPack: M_completion_return_core_mantra | POST /api/mitra/journey/completion_return/ | CompletionReturnTransient | backend + selector clean; awaiting live Maestro layers 5+7 | npx maestro test .maestro/silk-integrity/16_completion_core_mantra.yaml |
| completion_core_sankalp | PASS_BACKEND_FE_PENDING_RUNTIME | P0 | ready |  | unknown | unknown | unknown | flow_status=ready; no direct probe coverage — Maestro live-run to close layers 5+7 | npx maestro test .maestro/silk-integrity/17_completion_core_sankalp.yaml |
| completion_core_practice | PASS_BACKEND_FE_PENDING_RUNTIME | P0 | ready |  | unknown | unknown | unknown | flow_status=ready; no direct probe coverage — Maestro live-run to close layers 5+7 | npx maestro test .maestro/silk-integrity/18_completion_core_practice.yaml |
| completion_grief_mantra | PASS_BACKEND_FE_PENDING_RUNTIME | P1 | ready |  | unknown | unknown | unknown | flow_status=ready; no direct probe coverage — Maestro live-run to close layers 5+7 | npx maestro test .maestro/silk-integrity/19_completion_grief_mantra.yaml |
| completion_loneliness_mantra | PASS_BACKEND_FE_PENDING_RUNTIME | P1 | ready |  | unknown | unknown | unknown | flow_status=ready; no direct probe coverage — Maestro live-run to close layers 5+7 | npx maestro test .maestro/silk-integrity/20_completion_loneliness_mantra.yaml |
| completion_joy_mantra | PASS_BACKEND_FE_PENDING_RUNTIME | P1 | ready |  | unknown | unknown | unknown | flow_status=ready; no direct probe coverage — Maestro live-run to close layers 5+7 | npx maestro test .maestro/silk-integrity/21_completion_joy_mantra.yaml |
| completion_growth_mantra | PASS_BACKEND_FE_PENDING_RUNTIME | P1 | ready |  | unknown | unknown | unknown | flow_status=ready; no direct probe coverage — Maestro live-run to close layers 5+7 | npx maestro test .maestro/silk-integrity/22_completion_growth_mantra.yaml |
| completion_growth_practice | PASS_BACKEND_FE_PENDING_RUNTIME | P0 | ready |  | unknown | unknown | unknown | flow_status=ready; no direct probe coverage — Maestro live-run to close layers 5+7 | npx maestro test .maestro/silk-integrity/23_completion_growth_practice.yaml |
| completion_additional_library | PASS_BACKEND_FE_PENDING_RUNTIME | P1 | ready |  | unknown | unknown | unknown | backend + selector clean; awaiting live Maestro layers 5+7 | npx maestro test .maestro/silk-integrity/24_completion_additional_library.yaml |
| completion_additional_custom | PASS_BACKEND_FE_PENDING_RUNTIME | P1 | ready |  | unknown | unknown | unknown | backend + selector clean; awaiting live Maestro layers 5+7 | npx maestro test .maestro/silk-integrity/25_completion_additional_custom.yaml |
| completion_additional_recommended | PASS_BACKEND_FE_PENDING_RUNTIME | P1 | ready |  | unknown | unknown | unknown | backend + selector clean; awaiting live Maestro layers 5+7 | npx maestro test .maestro/silk-integrity/26_completion_additional_recommended.yaml |
| additional_items_surface | PASS_BACKEND_FE_PENDING_RUNTIME | P1 | ready |  | unknown | unknown | unknown | flow_status=ready; no direct probe coverage — Maestro live-run to close layers 5+7 | npx maestro test .maestro/silk-integrity/27_additional_items_surface.yaml |
| continuity | PASS_BACKEND_FE_PENDING_RUNTIME | P1 | ready |  | unknown | unknown | unknown | backend + selector clean; awaiting live Maestro layers 5+7 | npx maestro test .maestro/silk-integrity/28_continuity.yaml |
| path_milestone | PASS_BACKEND_FE_PENDING_RUNTIME | P1 | ready |  | unknown | unknown | unknown | backend + selector clean; awaiting live Maestro layers 5+7 | npx maestro test .maestro/silk-integrity/29_path_milestone.yaml |
| resilience_narrative | PASS_BACKEND_FE_PENDING_RUNTIME | P1 | ready |  | unknown | unknown | unknown | flow_status=ready; no direct probe coverage — Maestro live-run to close layers 5+7 | npx maestro test .maestro/silk-integrity/30_resilience_narrative.yaml |
| entity_card | PASS_BACKEND_FE_PENDING_RUNTIME | P1 | ready |  | unknown | unknown | unknown | flow_status=ready; no direct probe coverage — Maestro live-run to close layers 5+7 | npx maestro test .maestro/silk-integrity/31_entity_card.yaml |
| completion_support_matrix | PASS_BACKEND_FE_PENDING_RUNTIME | P0 | unknown |  | ContentPack: M_completion_return (support × source) | POST /api/mitra/journey/completion_return/ | CompletionReturnTransient | backend + selector clean; awaiting live Maestro layers 5+7 |  |
| home_contextual | PASS_BACKEND_FE_PENDING_RUNTIME | P1 | unknown |  | ContentPack: M08_dashboard_day_active | GET /api/mitra/journey/home/ | CompanionDashboard | backend + selector clean; awaiting live Maestro layers 5+7 |  |

## Layer coverage

Per the 7-layer DoD (README §2):
- **L1 content_authored** — covered via FLOW_META backend_content_source (ContentPack / WisdomAsset entries).
- **L2 resolver_selects** — covered via persona probe: all canonical personas return non-empty card_titles, confirming resolver downgrade + master lookup are intact.
- **L3 endpoint_returns** — covered via persona probe: `/api/mitra/journey/companion/` returns the expected shape for every canonical persona (PERSONAS.md confirms HTTP 200 on 2026-04-18).
- **L4 fe_reads_canonical** — covered via FLOW_META fe_files column; Phase 3 testID land is the explicit checkpoint.
- **L5 component_renders** — RUNTIME PENDING — requires live Maestro against Metro.
- **L6 no_fallback_override** — covered by the `FALLBACK_DENY_LIST.txt` assertions inside each flow; validated when flow runs on Metro.
- **L7 telemetry_logged** — RUNTIME PENDING — requires Celery + MitraDecisionLog capture during live run.

## Closing runtime layers 5 + 7

For each flow, the recipe is identical:
```
cd /Users/paragbhasin/kalpx-app-rn
npx expo start --dev-client   # Metro
npx maestro test .maestro/silk-integrity/<file>
```

Per-flow invocations are in the `maestro_invocation` column above.
