# Silk Integrity — Flow Status

31 flows authored. Status values: `ready` | `needs_selector_patch` | `blocked_by_data` | `blocked_by_app_bug`.

Phase 3 (2026-04-18) — canonical persona seed cleared all `blocked_by_data`
rows; Agent X testID land cleared most `needs_selector_patch` rows. Rows
below tagged `ready` assume Maestro is run against the freshly landed
testIDs.

| # | Slug | File | Status | Notes |
|---|---|---|---|---|
| 01 | onboarding_start | `01_onboarding_start.yaml` | ready | 2026-04-19 §A.3 testIDs land + runtime-verified on sim 221EDFB1: `onboarding_begin_journey_cta` + `onboarding_turn_1_root` + `onboarding_turn_1_chip_continue` + `onboarding_im_returning` all live. `onboarding_yes_lets_begin` dormant (backend ships chip label "Continue"). |
| 02 | recognition | `02_recognition.yaml` | ready | 2026-04-19 §A.3 testIDs land; uses `onboarding_turn_\d+_chip_.*` repeat-walk pattern + `onboarding_recognition_root` + `onboarding_recognition_continue` terminal assert. Live end-to-end verification pending. |
| 03 | triad_reveal | `03_triad_reveal.yaml` | ready | 2026-04-19 §A.3 testIDs land; `onboarding_triad_reveal_root` + `onboarding_triad_begin_journey` terminal assert. Live end-to-end verification pending. |
| 04 | first_dashboard | `04_first_dashboard.yaml` | ready | Chains from flow 03 via `onboarding_triad_begin_journey`; asserts dashboard render + v3 greeting tail. Live end-to-end verification pending. |
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

- `ready`: 31 (all flows, post §A.3 onboarding testID land 2026-04-19)
- `needs_selector_patch`: 0
- `blocked_by_data`: 0 (canonical persona seed cleared all)
- `blocked_by_app_bug`: 0 (Phase 2 cleared all)

## 2026-04-19 Wave 3 — Canonical rich runner routing + Batch A live-green

**Runtime state (sim 221EDFB1, Metro 8081, dev backend):**

- **Batch A (flows 06–13) — LIVE GREEN on unified rich runner surface.**
  All 8 flows passed against `cycle_transitions/offering_reveal` canonical
  path (post PR1–PR6 wave). 116 Maestro commands total, 0 failures.
  Batch A scope = room ENTRY assertions only; does not exercise support
  runner-launching pills or completion paths.
- **Canary validation (core triad × 3 + joy_carry_chip) — LIVE GREEN.**
  Rich surface renders for mantra, sankalp, practice primary taps. Joy
  Carry pill → `carry_joy_forward` → dashboard `joy_carry_chip` verified
  end-to-end. PR5 sankalp Essence state-binding regression fixed
  same-day (2-token swap).

## 2026-04-19 Wave 3 — Batch B blocker (single)

Flows 16 / 19 / 20 / 21 / 22 / (optionally 23) depend on
`mantra_runner_start` + `mantra_runner_complete` testIDs to automate
the 108-tap / 3s-hold / timer-expiry completions. Those testIDs lived
on the parked `MantraRunnerDisplay` component. **Resolution landed
2026-04-19:** `test_runner_force_complete` — dev-only (`__DEV__`-gated),
invisible (1×1 opacity 0), real-completion-path hook added to
`CycleTransitionsContainer.tsx` inside the `isInfoScreen` branch.
Tapping it fires the same `complete_runner` action the natural
completion paths use — no fake UI state, no mocked tracking.

**Required YAML patch pattern** (provisional — to be finalized only
after Batch B proves the surface):

```yaml
# Replace the legacy optional taps:
# - tapOn: { id: "mantra_runner_start", optional: true }
# - tapOn: { text: "(Start|Begin|Play)", optional: true }
# - waitForAnimationToEnd
# - tapOn: { id: "mantra_runner_complete", optional: true }
# - tapOn: { text: "(Done|Complete|I'm done)", optional: true }

# With a single deterministic tap on the dev affordance:
- tapOn:
    id: "test_runner_force_complete"
- waitForAnimationToEnd:
    timeout: 10000
```

Then preserve existing `completion_message` / `completion_wisdom_anchor_line`
/ `completion_read_more` / `completion_reflection_placeholder` extendedWaitUntil
assertions. Add a post-completion assertion for `return_to_source` landing
(flows 19–22 should verify they re-enter `support_<room>/room`, not the
dashboard — per v3 Flow Contract §A.8).

## Final YAML rewrites — DEFERRED

Per 2026-04-19 founder direction, final Maestro YAML rewrites remain
deferred until:

1. `test_runner_force_complete` hook lands (✅ 2026-04-19)
2. Batch B runs green against the hook (pending)
3. Support completion → source room routing is proven live (pending,
   part of Batch B runtime)

Once all three are green, YAMLs for flows 16 + 19–23 finalize against
the verified testID set. Until then, docs reflect the INTENT; YAML
patches are provisional.

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

## Batch 1A results (2026-04-19, post-Cases-A+B deploy)

**Wave 3 FINAL runtime outcomes:**

| Flow | Result | Notes |
|---|---|---|
| 06–13 | 🟢 Green | Batch A unchanged |
| 14 | 🟢 Green | day7_checkpoint |
| 15 | 🟡 Manual exception | **Sovereignty blocker fixed** (H-5, 2026-04-19): M25 `narrative_template` rewritten to remove flow-15 deny-list phrases ("Fourteen days. Two weeks of showing up." + "sealed. Something has settled."); BE commit `d5aa1ffd` deployed to dev. Flow YAML + login helpers + persona seed were already correct (FLOW_STATUS note pre-H-5 was misdiagnosis). Full-YAML CLI e2e pending clean MCP-off session (same harness protocol as 19/20). |
| 16 | 🟢 Green | core mantra — test_runner_force_complete verified |
| 17 | 🟢 Green | core sankalp — test_runner_force_complete verified |
| 18 | 🟢 Green | core practice — test_runner_force_complete verified |
| 19 | 🔴 Red | **MoreSupportSheet iOS Modal accessibility flatten** blocks row tap. FE refactor required (H-3). Manual-validation exception protocol authorized if H-3 deferred. |
| 20 | 🔴 Red | Same blocker as 19 |
| 21 | 🟢 Green | joy completion — full e2e 21 commands including return-to-source |
| 22 | 🟡 Intermittent | Cases A+B applied and verified in DOM (growth_mantra_option + growth_practice_option testIDs queryable with resource-id); flow timing brittle at growth's 10s silence_tolerance boundary. Needs timing tuning or cold-launch Metro warm-up allowance. |
| 23 | ⏸ Not run | Batch C; predicted green once 22 timing stabilizes |
| 24–26 | ⏸ Not run | Batch C (additional_* completion) |
| 27–31 | ⏸ Not run | Batch C (additional_items_surface, continuity, path_milestone, resilience_narrative, entity_card) |

## Manual-validation exceptions (explicit)

Flows 19 + 20 classified as **manual-validation exceptions** pending H-3 authorization decision at Batch 1A close. Manual exception protocol per H-3 of Post-Wave-3 Roadmap:

- Dashboard → tap "More support" → tap "Sitting with grief" (or "Company for loneliness") row → room renders → tap mantra/bhakti/chant pill → rich runner loads → 108 taps OR `test_runner_force_complete` → completion_return surface → tap Return Home → assert lands in source room (NOT dashboard) for support sources
- On real device or simulator, **screen-recorded** as evidence
- "Someone glanced at the sheet" does NOT count

Applies on every Phase 4 smoke pass until H-3 ships.

## Batch 1B H-3 (2026-04-19) — a11y refactor landed; 19/20 remain MANUAL EXCEPTION (scope narrowed)

**Product fix — COMPLETE:**
- `src/blocks/dashboard/MoreSupportSheet.tsx` refactored to eliminate iOS Modal accessibility flatten: nested Pressable → plain View containers + sibling scrim TouchableOpacity; `accessible=false` on containers; rows are single accessible leaves with authored `accessibilityLabel`; `presentationStyle="overFullScreen"`.
- 4-agent review: 3/3 PASS (contract + sovereignty + regression).
- Live iOS hierarchy verification on sim 221EDFB1: `resource-id=more_support_grief_row` at `[18,702][375,763]`; `resource-id=more_support_loneliness_row` at `[18,763][375,824]`. PRE-H-3 these IDs did not resolve at all.
- Product path proven via MCP inline flow: tap `more_support_grief_row` → grief room opens → `grief_room_opening_line` ("I'm here with you. We can stay quiet first.") visible. End-to-end confirmed on the grief half.

**Flow 19 + 20 full-YAML CLI e2e — remain MANUAL EXCEPTION (scope narrowed):**
- Blocker is NOT the product. TestIDs are live. Room opens on tap.
- Blocker is **harness driver collision**: running `maestro test` while the Maestro MCP daemon is attached to the same sim causes two concurrent `xcodebuild test-without-building` processes to contend on driver install, and `launchApp` fails with "Unable to launch app".
- **Operator protocol for closing the remaining gap:** stop the MCP daemon (kill the maestro mcp java process), confirm only one xcodebuild test-without-building exists, then run:
  ```
  maestro --device 221EDFB1-254E-4694-9B58-8BABEF2EBADD test .maestro/silk-integrity/19_completion_grief_mantra.yaml
  maestro --device 221EDFB1-254E-4694-9B58-8BABEF2EBADD test .maestro/silk-integrity/20_completion_loneliness_mantra.yaml
  ```
  Both flows now tap by `more_support_grief_row` / `more_support_loneliness_row` testID (not text regex) and include a 3s `waitForAnimationToEnd` before the row-visibility assertion.

**Sprint 1 close condition (a) — PARTIAL.** FE product fix verified reachable; CLI runner e2e still owed. Don't auto-close Sprint 1 until a clean CLI (or CI) session runs 19/20 end-to-end green.

## Batch 1B H-5 (2026-04-19) — Day 14 sovereignty blocker removed

**Product fix — COMPLETE:**
- File: `~/kalpx/core/data_seed/mitra_v3/moments/M25_checkpoint_day_14.yaml`
- Change: `narrative_template` rewritten. Before: `"Fourteen days. Two weeks of showing up. {completed_count} of {total_days} sealed. Something has settled."`. After: `"{completed_count} days of presence across {total_days}. What has taken root here now belongs to you."`. Also `summary_line_template` tightened: `"{completed_count} of {total_days} days held."`.
- 4-agent review: Agent 2 (deny-list + sovereignty + constraints) PASS; Agent 4 (regression + deploy mechanism) PASS.
- BE commit: `d5aa1ffd` on `dev`; deployed to EC2 18.223.217.113 via standard docker compose path (in-memory registry reloaded by container restart).
- FE consumer (`CheckpointDay14Block.tsx`) unchanged; reads the same slot names; `interpolate()` consumes `{completed_count}` + `{total_days}`.

**Audit correction:** the Batch 1A FLOW_STATUS note for flow 15 ("Persona mismatch — uses `smoke+triad`") was misdiagnosed. The real blocker was M25 `narrative_template` containing flow-15 deny-list phrases, so the flow's sovereignty asserts `assertNotVisible: "Fourteen days. Two weeks of showing up."` + `assertNotVisible: "sealed. Something has settled."` would hard-fail on render. Login helpers, `common/login_as_persona.yaml`, `common/fast_login_as_persona.yaml`, flow-15 env, and `persona_day14` seed are ALL correctly parameterized.

**Flow 15 full-YAML CLI e2e — MANUAL EXCEPTION:** same harness constraint as 19/20 (Maestro CLI/MCP driver collision). Flow YAML has no remaining product-level gap; awaits clean CLI-only session for green e2e.

## Batch M-A (2026-04-19) — M-2 continuity + pathMilestone render

**Implementation status:** COMPLETE.
- `src/extensions/moments/new_dashboard/index.tsx`: `ContinuityMirrorCard` now rendered under canonical `sd.continuity_mirror` guard (parallel to existing `PathMilestoneBanner` render). Stale `sd.continuity_card` mount point removed to prevent duplicate-testID collision.
- 4-agent review: Agent 2 (contract + reachability) PASS; Agent 4 (regression + typecheck) PASS.
- Commit `bbae859` on `main`.

**Validation status:** BLOCKED EXTERNALLY — see per-flow owner/next-action below.

| Flow | Status | Blocker owner | Next action |
|---|---|---|---|
| 28 continuity | 🟡 FE ready, validation blocked | **BE / content** (MDR-S2-06) | Emit `continuityMirror` envelope field in `core/journey_envelope.py` for welcome-back state (persona_welcomeback → 35d past end_date) |
| 29 path_milestone | 🟡 FE already live, validation blocked | **persona / harness owner + BE threshold owner** | Either (a) create/use `persona_day30+` so BE `_build_path_milestone` emits a non-null value, OR (b) confirm-and-document whether the 30-day threshold in `core/tests/test_journey_envelope.py:228` is product intent |

**Classification doc correction (same commit):** `continuity_mirror_card` + `path_milestone_banner` reclassified from DELETE-CANDIDATE to KEEP. 14-scaffold delete queue reduced to 12 pending Batch M-B fresh re-audit.
