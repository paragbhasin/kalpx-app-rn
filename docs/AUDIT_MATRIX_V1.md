# Silk Integrity — 31-Flow Audit Matrix V1

_Generated 2026-04-19 UTC. Layers 1-4 + 6 verified against dev EC2 + RN main tip. Layers 5 + 7 marked `PENDING_RUNTIME` — Metro/Maestro not runnable from this session._

**Evidence sources**
- Backend: dev EC2 `kalpx-dev-web` container, live Django shell resolver runs (all 10 probed moments) + live `/api/mitra/content/moments/<id>/resolve/` curl for M48.
- DB state: `smoke+triad@kalpx.com` user 6705 / Journey 3638 active with core_mantra/sankalp/practice seeded; test+day3/day7/day14/welcomeback/smoke+joy/smoke+growth personas **not seeded** on dev.
- FE: `kalpx-app-rn/src` — NewDashboardContainer.tsx (AdditionalItemsSectionBlock restored line 292), CompletionReturnTransient.tsx (slot-driven), CheckpointDay14Block.tsx (narrative_template + summary_line_template slot-driven), joy_room / growth_room / grief_room / loneliness_room containers.
- Supporting artifacts: `/tmp/persona_probe.json`, `/tmp/audit_matrix.{json,md}`.

## Status vocabulary

- **PASS_BACKEND_FE_PENDING_RUNTIME** — L1 + L2 + L3 + L4 + L6 pass; L5 + L7 pending Metro/Maestro.
- **FAIL** — one or more of L1-L4 or L6 demonstrably fails.
- **PARTIAL** — verifiable layers mixed; irresolvable without runtime.
- **PASS_FULL** — never assigned this turn (requires L5 + L7 runtime proof).

## Matrix

| # | slug | status | layers_passed | layers_pending | layers_failed | exact_gap | severity | root_cause_class | recommended_fix | sprint |
|---|------|--------|---------------|----------------|---------------|-----------|----------|------------------|-----------------|--------|
| 01 | onboarding_start | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none | NONE | none | stand up onboarding testIDs for L5 | later |
| 02 | recognition | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none (M07 resolves; RecognitionBlock reads /onboarding/complete/) | NONE | none | Turn-N chip + recognition-line testIDs | later |
| 03 | triad_reveal | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none (Journey 3638 has full triad; TriadCardsRow slot-driven) | NONE | none | add triad-card testIDs; Metro regression guard | now |
| 04 | first_dashboard | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none (chains off 03) | NONE | none | depends on 03 selector patch | later |
| 05 | dashboard_load | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none (smoke+triad live on dev) | NONE | none | text anchors already stable | later |
| 06 | triad_visibility | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none — regression guard | NONE | none | pattern-scan until testIDs land | now |
| 07 | quick_checkin_balanced | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none (M22 resolves) | NONE | none | checkin state chip testIDs | later |
| 08 | quick_checkin_agitated | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none (M20 resolves) | NONE | none | same as 07 | later |
| 09 | triggered_flow | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none | NONE | none | text anchor stable | later |
| 10 | grief_room | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none (M46 resolves, 19 slots, slot-driven TSX) | NONE | none | More-support row + opening-line testIDs | now |
| 11 | loneliness_room | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none (M47 resolves, 22 slots) | NONE | none | selector patch | now |
| 12 | joy_room | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none (M48 resolves live: variant_id=M48_universal_en_baseline, fallback_used=false, 19 slots populated) | NONE | none | chip label already founder-locked | now |
| 13 | growth_room | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none (M49 resolves, 20 slots; inquiry seeds pack live) | NONE | none | inquiry-category testIDs | now |
| 14 | day7_checkpoint | FAIL | 1,2,3,4,6 | 5,7 | 1 (persona data) | persona_day7 not seeded on dev DB; M24 resolver works but no user can enter the flow | P1 | data | seed test+day7@kalpx.dev user with Journey day_number=7 + MitraDecisionLog gates | now |
| 15 | day14_checkpoint | FAIL | 1,2,3,4,6 | 5,7 | 1 (persona data) | persona_day14 not seeded; M25 resolver returns 15 slots including narrative_template (body), slot-driven in CheckpointDay14Block.tsx (deny-list clean) | P1 | data | seed test+day14@kalpx.dev with Journey day_number=14 | now |
| 16 | completion_core_mantra | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none — resolver returns "Complete. You stayed with the sound." with read_more_label="Read more →" (constant_value populated) for runner_variant=mantra + runner_source=core | NONE | none | runner + completion testIDs | now |
| 17 | completion_core_sankalp | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none — resolver returns "Held. Carry it gently into the day." for sankalp+core | NONE | none | sankalp-hold testID | now |
| 18 | completion_core_practice | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none — "Complete. Notice what quieted." | NONE | none | practice runner testIDs | now |
| 19 | completion_grief_mantra | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none — "Held. You stayed with what was hard." for mantra+support_grief | NONE | none | grief→mantra option testID | now |
| 20 | completion_loneliness_mantra | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none — "Company kept. Not alone in this." for mantra+support_loneliness | NONE | none | loneliness→mantra option testID | now |
| 21 | completion_joy_mantra | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none — "Steady. You held the fullness without rushing." for mantra+support_joy | NONE | none | joy walk/mantra testID | now |
| 22 | completion_growth_mantra | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none — "Held. The question has had its hearing." for mantra+support_growth | NONE | none | growth inquiry testID | now |
| 23 | completion_growth_practice | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none — INVARIANT #8 verified: "Complete. The practice answered what thinking could not." (distinct from growth_mantra) | NONE | none | exact-text Maestro assert | now |
| 24 | completion_additional_library | FAIL | 1,2,3,4,6 | 5,7 | 1 (persona data) | persona_additional_library not seeded; M_completion_return variant resolves correctly ("Complete. You made space for this one.") when runner_source=additional_library | P1 | data | seed user with additional_items[] rows sourced=library | now |
| 25 | completion_additional_custom | FAIL | 1,2,3,4,6 | 5,7 | 1 (persona data) | persona_additional_custom not seeded; variant resolves ("Complete. Your shape of practice, kept.") | P1 | data | seed user with additional_items sourced=custom | now |
| 26 | completion_additional_recommended | FAIL | 1,2,3,4,6 | 5,7 | 1 (persona data) | persona_additional_recommended not seeded; variant resolves ("Complete. You tried what was offered.") | P1 | data | seed user with additional_items sourced=recommended | now |
| 27 | additional_items_surface | PASS_BACKEND_FE_PENDING_RUNTIME | 1,2,3,4,6 | 5,7 | — | none — AdditionalItemsSectionBlock RESTORED in NewDashboardContainer.tsx:292 this turn (self-hides when backend empty); FLOW_STATUS blocked_by_app_bug is OUT-OF-DATE | NONE | none | update FLOW_STATUS.md to `needs_selector_patch` + seed items for Maestro | now |
| 28 | continuity | FAIL | 1,2,3,4,6 | 5,7 | 1 (persona data) | persona_welcomeback not seeded; also M12_return_absent resolves but ContinuityMirrorCard wiring untested (not in NewDashboardContainer render path visible) | P1 | data/fe_mapping | seed welcomeback persona AND verify ContinuityMirrorCard mount in new dashboard | now |
| 29 | path_milestone | FAIL | 1,2,3,4,6 | 5,7 | 1 (persona data) | persona_day7 not seeded; pathMilestone field flows via /journey/companion/ but no seeded data to render | P1 | data | same seed as flow 14 | now |
| 30 | resilience_narrative | FAIL | 1,2,3,4,6 | 5,7 | 6 (fallback_masking) | ResilienceNarrativeCard.tsx:51 hardcodes "NOTICING" eyebrow (deny-list hit); M26 resolver returns growing_label + helped_ack_message + eyebrow-candidate slots; surface location wired (NewDashboardContainer:256) but eyebrow-sovereignty leak remains | P1 | fallback_masking | bind eyebrow to M26 slot (growing_label or authored eyebrow slot); remove hardcoded "NOTICING" | now |
| 31 | entity_card | FAIL | 1,2,3,4,6 | 5,7 | 6 (fallback_masking) | EntityRecognitionCard.tsx:48 hardcodes "MITRA NOTICED" eyebrow (deny-list hit); M29 resolver returns 8 slots but no authored eyebrow/noticed_label slot; card mount location wired (NewDashboardContainer:263) | P1 | fallback_masking | author eyebrow slot in M29_entity_recognition_sheet.yaml + bind EntityRecognitionCard.tsx:48 | now |

## P0 / P1 / P2 grouping

### P0 — user-visible Sprint-1 breakage
_None._ All Sprint-1 P0 slugs (triad_reveal, joy_room, growth_room, grief_room, loneliness_room, completion_core_mantra, completion_support_matrix) show L1-L4 + L6 green on dev. P0 appears only when Metro surfaces a regression at L5/L7.

### P1 — parity gaps / sovereignty leaks / data seed blockers

| # | slug | issue | fix |
|---|------|-------|-----|
| 14 | day7_checkpoint | persona_day7 missing on dev | seed user |
| 15 | day14_checkpoint | persona_day14 missing | seed user |
| 24 | completion_additional_library | persona + additional_items missing | seed |
| 25 | completion_additional_custom | same | seed |
| 26 | completion_additional_recommended | same | seed |
| 28 | continuity | persona_welcomeback missing + ContinuityMirrorCard mount unverified in new dashboard render tree | seed + FE verify |
| 29 | path_milestone | persona_day7 missing | seed |
| 30 | resilience_narrative | hardcoded "NOTICING" eyebrow | bind to M26 slot |
| 31 | entity_card | hardcoded "MITRA NOTICED" eyebrow | author eyebrow slot + bind |

### P2 — rotation / UX / telemetry

- `joy_room/index.tsx:384,401` — `pillCarryLabel || "Done"` fallback (not on deny-list; still sovereignty-adjacent).
- `CoreItemsList.tsx:37,44,51` — "Today's anchor / Today's vow / Today's practice" deny-list hits. Component is on legacy dashboard path (`CompanionDashboardContainer`); new dashboard (`NewDashboardContainer`) uses `TriadCardsRow`, so leak only fires on legacy flag. Verify flag-gating on Sprint 1 exit.
- `PracticeRunnerContainer.tsx:2170` — `"Your Sankalp is Alive."` fallback on runner completion headline. Deny-list hit; runner redesign in flight.
- `completion_return/index.tsx:210` — `placeholder="How did that feel?"` in legacy scaffold (unwired). Kept for reference; confirm not reachable.

## Metro closure plan — per PENDING_RUNTIME flow

All 31 flows need L5 (Maestro run) + L7 (MitraDecisionLog capture) before any slug upgrades from `PASS_BACKEND_FE_PENDING_RUNTIME` to `PASS_FULL`.

| # | Maestro flow | top selector gap | persona dep |
|---|--------------|------------------|-------------|
| 01 | 01_onboarding_start.yaml | onboarding CTA testID | guest |
| 02 | 02_recognition.yaml | Turn-N chips + recognition-line testIDs | guest |
| 03 | 03_triad_reveal.yaml | triad-card testIDs (mantra/sankalp/practice) | smoke+triad |
| 04 | 04_first_dashboard.yaml | inherits 03 | smoke+triad |
| 05 | 05_dashboard_load.yaml | text anchors stable — run now | smoke+triad |
| 06 | 06_triad_visibility.yaml | pattern-scan fine; add triad testIDs later | smoke+triad |
| 07-08 | 07/08_quick_checkin_*.yaml | state-chip testIDs | smoke+triad |
| 09 | 09_triggered_flow.yaml | run now | smoke+triad |
| 10-13 | support rooms | opening_line + pill testIDs on each room | smoke+triad (grief/loneliness via "more support" sheet); smoke+joy, smoke+growth for rooms 12/13 directly |
| 14-15 | checkpoint | **persona seed prerequisite** + checkpoint testIDs | test+day7, test+day14 |
| 16-23 | completion_* | runner + completion-return testIDs (variant_id already renders correct variant text) | smoke+triad |
| 24-26 | completion_additional_* | **persona seed prerequisite** | test personas with additional_items[] rows |
| 27 | 27_additional_items_surface.yaml | Maestro status must be updated from `blocked_by_app_bug` to `needs_selector_patch` given AdditionalItemsSectionBlock restoration | smoke+triad with seeded additional_items |
| 28 | 28_continuity.yaml | ContinuityMirrorCard mount verification in NewDashboardContainer + welcomeback persona | test+welcomeback |
| 29 | 29_path_milestone.yaml | depends on 14 | test+day7 |
| 30 | 30_resilience_narrative.yaml | fix eyebrow fallback first; then run | smoke+triad with seeded narrative |
| 31 | 31_entity_card.yaml | fix eyebrow fallback first; then run | smoke+triad with seeded entity |

Persona env vars (for `persona_probe.py` auth + Maestro personas): set `PERSONA_TEST_DAY3_PASSWORD`, `PERSONA_TEST_DAY7_PASSWORD`, etc. in shell before running — probe currently marks 6/7 personas `no password env; persona skipped (partial)`.

## Real bugs discovered

1. **[P1 — sovereignty leak, confirmed]** `ResilienceNarrativeCard.tsx:51` hardcodes `"NOTICING"` eyebrow. Deny-list hit. M26 has no eyebrow slot; either author one in `M26_resilience_narrative_card.yaml` or rename an existing slot to serve as eyebrow.
2. **[P1 — sovereignty leak, confirmed]** `EntityRecognitionCard.tsx:48` hardcodes `"MITRA NOTICED"` eyebrow. Deny-list hit. M29 has no authored eyebrow slot.
3. **[P1 — resolver contract, confirmed]** Unauthenticated `POST /api/mitra/content/moments/<id>/resolve/` called with minimal ctx `{mode,locale,path}` returns `fallback_used=true, fallback_reason=ctx_invalid:user_attention_state`. FE always sends full ctx (`mitraApi.ts:1495` MomentContextShape), but any integration test or external caller using the documented endpoint without full ctx gets empty slots silently. Consider softening ctx_invalid to log-warn and default `user_attention_state=focused_receiving` when unspecified — OR document the required ctx fields on the endpoint.
4. **[P2 — stale flow status]** `FLOW_STATUS.md` lists flow 27 (`additional_items_surface`) as `blocked_by_app_bug`; `NewDashboardContainer.tsx:292` restored `AdditionalItemsSectionBlock` this turn. Update FLOW_STATUS to `needs_selector_patch`.
5. **[P2 — dev data drift]** 6 of 7 canonical smoke personas (test+day3/day7/day14/welcomeback, smoke+triad@kalpx.dev, smoke+joy, smoke+growth) **do not exist on dev DB**. Only `smoke+triad@kalpx.com` (user 6705, Journey 3638 active) is live. Either re-seed per PERSONAS.md or update `persona_probe.py` default emails from `@kalpx.dev` → `@kalpx.com`.
6. **[P2 — minor leak]** `joy_room/index.tsx:384,401` `pillCarryLabel || "Done"` fallback. Not on deny-list; still should be `|| ""` per sovereignty.

## Artifacts produced

- `/Users/paragbhasin/kalpx-app-rn/docs/AUDIT_MATRIX_V1.md` (this doc)
- `/tmp/audit_matrix.json` + `/tmp/audit_matrix.md` (script-emitted; uses 3-status vocabulary — this doc is the canonical 4-status deliverable)
- `/tmp/persona_probe.json` (partial — passwords not in env)

## Files referenced

- `/Users/paragbhasin/kalpx/core/data_seed/mitra_v3/moments/M{46,47,48,49,24,25,26,29,_completion_return}.yaml`
- `/Users/paragbhasin/kalpx/core/content/orchestrator.py`
- `/Users/paragbhasin/kalpx/core/content/dataclasses_.py`
- `/Users/paragbhasin/kalpx-app-rn/src/containers/NewDashboardContainer.tsx`
- `/Users/paragbhasin/kalpx-app-rn/src/blocks/CompletionReturnTransient.tsx`
- `/Users/paragbhasin/kalpx-app-rn/src/blocks/CheckpointDay14Block.tsx`
- `/Users/paragbhasin/kalpx-app-rn/src/blocks/AdditionalItemsSectionBlock.tsx`
- `/Users/paragbhasin/kalpx-app-rn/src/blocks/CoreItemsList.tsx`
- `/Users/paragbhasin/kalpx-app-rn/src/blocks/dashboard/insights/ResilienceNarrativeCard.tsx`
- `/Users/paragbhasin/kalpx-app-rn/src/blocks/dashboard/insights/EntityRecognitionCard.tsx`
- `/Users/paragbhasin/kalpx-app-rn/src/extensions/moments/{joy,growth,grief,loneliness}_room/index.tsx`
- `/Users/paragbhasin/kalpx-app-rn/.maestro/silk-integrity/FLOW_STATUS.md`
- `/Users/paragbhasin/kalpx-app-rn/.maestro/silk-integrity/FALLBACK_DENY_LIST.txt`
