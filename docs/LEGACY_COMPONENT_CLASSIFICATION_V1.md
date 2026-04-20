# Legacy Component Classification V1

**Status:** living. Owner: Delivery Restoration program. Ticket: MDR-S1-15.
**Purpose:** authoritative classification of FE components as KEEP / LEGACY-PARKED / DELETE-CANDIDATE to gate the Sprint 3 delete queue (MDR-S3-10).

## Classification rules

- **KEEP:** component is the canonical surface for its purpose post-Wave-3; actively dispatched to.
- **LEGACY-PARKED:** component exists in source but has no live dispatcher; safe to delete once one full wave confirms no regression; does NOT ship to users.
- **DELETE-CANDIDATE:** approved at a checkpoint for removal in the delete queue.

## Canonical rich runner surfaces (Wave 3 — 2026-04-19)

| Component | Classification | Notes |
|---|---|---|
| `src/containers/CycleTransitionsContainer.tsx` | KEEP | Canonical rich runner — serves `info_reveal` + `offering_reveal` states for all variants (mantra, sankalp, practice). All 3 core + 4 support + 3 additional paths route here. |
| `src/blocks/MantraRunnerDisplay.tsx` | LEGACY-PARKED | Dark-chrome immersive M17 runner. No live dispatcher after PR1.5 (2026-04-19). Delete-candidate for MDR-S3-10. |
| `src/containers/EmbodimentChallengeRunnerContainer.tsx` | LEGACY-PARKED | Sankalp embody generic BlockRenderer. No live dispatcher after PR1.5. Delete-candidate for MDR-S3-10. |
| `src/containers/PracticeRunnerContainer.tsx` | LEGACY-PARKED | 3203-line legacy practice runner. No live dispatcher after PR1.5. Delete-candidate for MDR-S3-10. |

## Dashboard containers

| Component | Classification | Notes |
|---|---|---|
| `src/containers/NewDashboardContainer.tsx` | KEEP | Canonical v3 dashboard (flagged on). |
| `src/containers/CompanionDashboardContainer.tsx` | LEGACY-PARKED (evidence-gated deletion per CP-1 G4) | Maintenance-only post-CP-1. Removal triggered by: first fully-green post-flip week + rollback confidence + zero unresolved dashboard parity regressions. Placeholder date `2026-07-31` is NOT the trigger. |

## Why-This sheets

| Component | Classification | Notes |
|---|---|---|
| `src/blocks/dashboard/WhyThisSheet.tsx` | KEEP | Dashboard bottom sheet; PR1 rewire. Go-deeper → view_info with guard. |
| `src/blocks/WhyThisL2Sheet.tsx` | KEEP | Overlay modal for principle-only contexts (Growth Teaching, CompletionReturn wisdom anchor). PR1 rewire. |

## State ids in allContainers.js — deprecated

Parked as unreachable after PR1.5:
- `practice_runner/mantra_runner`
- `practice_runner/sankalp_embody`
- `practice_runner/practice_step_runner`

Any flow that lands on these after 2026-04-19 is a regression; should fire a deny-list trip in regression tests.

## Delete queue targets (CP-1 G2 approved — MDR-S3-10)

14-scaffold delete queue approved at CP-1 G2. Includes `day_type_chip` + `voice_on_every_screen` per default-delete tightening. Also eligible for inclusion:
- `MantraRunnerDisplay.tsx`
- `EmbodimentChallengeRunnerContainer.tsx`
- `PracticeRunnerContainer.tsx`
- `practice_runner/*` state ids in `allContainers.js`

## Reclassifications — Batch M-A (2026-04-19)

Pre-delete audit under M-1/M-2 surfaced two scaffolds that are NOT safe to delete despite Agent-1 classification noting "zero importers":

| Component | Prior classification | Corrected classification | Why |
|---|---|---|---|
| `src/extensions/moments/path_milestone_banner/` | DELETE-CANDIDATE | **KEEP** | Imported and actively rendered by `src/extensions/moments/new_dashboard/index.tsx:165` when `sd.path_milestone` is set. Flow 29 depends on `path_milestone_banner` testID. |
| `src/extensions/moments/continuity_mirror_card/` | DELETE-CANDIDATE | **KEEP** | Imported by `src/extensions/moments/new_dashboard/index.tsx:36`; as of 2026-04-19 M-2 fix, now also rendered under the `sd.continuity_mirror ? ... : null` guard. Flow 28 depends on `continuity_mirror_card` testID. |

Effective delete-queue size reduces 14 → 12. Re-verify the remaining 12 items with a fresh cross-folder importer grep before M-1 execution (Batch M-B).

## Batch M-B — M-1 fresh re-audit + partial execution (2026-04-19)

Fresh cross-folder importer grep over the remaining 12 items surfaced additional items that were WRONGLY tagged DELETE-CANDIDATE by the prior audit. Final disposition:

**DELETED (6 verified-safe scaffolds; zero importers):**
- `src/extensions/moments/checkpoint_results_refresh/` — deleted (README + contentpack.json only, never wired).
- `src/extensions/moments/cycle_reflection_refresh/` — deleted (README + contentpack.json only, never wired).
- `src/extensions/moments/voice_consent/` — deleted (scaffold; live VoiceConsentSheet lives at `src/blocks/VoiceConsentSheet.tsx`).
- `src/extensions/moments/voice_on_every_screen/` — deleted (scaffold; never integrated).
- `src/extensions/moments/completion_return/` — deleted (scaffold; live CompletionReturnTransient at `src/blocks/CompletionReturnTransient.tsx` and block-map entry `completion_return` in BlockRenderer.tsx:228 both preserved).
- `src/extensions/moments/sound_bridge/` — deleted (scaffold; live SoundBridgeTransient at `src/blocks/SoundBridgeTransient.tsx` and block-map entry `sound_bridge_transient` in BlockRenderer.tsx:231 both preserved).

Typecheck after deletion: 7 pre-existing errors repo-wide (unrelated); zero new errors from deletions.

**RECLASSIFIED KEEP (actively used, Agent-1 audit wrong):**
| Component | Prior | Corrected | Evidence |
|---|---|---|---|
| `src/extensions/moments/day_type_chip/` | DELETE-CANDIDATE | **KEEP** | Imported + rendered by `src/extensions/moments/new_dashboard/index.tsx:28,183`. |
| `src/extensions/moments/personal_greeting_card/` | DELETE-CANDIDATE | **KEEP** | Imported + rendered by `src/extensions/moments/new_dashboard/index.tsx:26,150`. Greeting logic that was referenced as "inlined in NewDashboardContainer" is for the containers/ version; the extensions/moments/new_dashboard uses this scaffold. |
| `src/extensions/moments/entity_recognition_card/` | DELETE-CANDIDATE | **KEEP** | Imported + rendered by `src/extensions/moments/new_dashboard/index.tsx:32,212` under `sd.entity_card` guard. Flow 31 depends on `entity_recognition_card` testID. A separate canonical version lives at `src/blocks/dashboard/insights/EntityRecognitionCard.tsx`; both are live for different containers. |

**DEFERRED (3 registered components, dispatch audit required):**
- `src/blocks/MantraRunnerDisplay.tsx` — registered at BlockRenderer.tsx:225 as `mantra_runner_display`. Parked per Wave 3 routing, but registry entry + import must be removed together with the file to avoid TS breakage. Coordinated delete across BlockRenderer + file.
- `src/containers/EmbodimentChallengeRunnerContainer.tsx` — registered at ScreenRenderer.tsx:16. Same coordination requirement.
- `src/containers/PracticeRunnerContainer.tsx` — registered at ScreenRenderer.tsx:23. Same coordination requirement.

Deferral rationale: each of these 3 requires a multi-file coordinated delete (file + registry entry + any stateMap reference in `allContainers.js` + possible test updates). Tracked for a dedicated Sprint 3 pass. Do NOT bundle with simple scaffold deletes.

**Queue closure:** 14 original → 2 reclassified in Batch M-A + 3 reclassified + 6 deleted + 3 deferred = full disposition. M-1 Batch M-B partial execution complete; 3 items queued for Sprint 3 coordinated delete.

## Known BE gaps surfaced by M-2 (deferred)

- `continuity_mirror` envelope field NOT populated by BE. `ContinuityMirrorCard` will stay invisible until MDR-S2-06 BE continuity wire-up lands. FE render block is now ready to receive it.
- `pathMilestone` only emitted by BE when `pathDurationDays ≥ 30` (see `core/tests/test_journey_envelope.py:228`). Flow 29's persona is `persona_day7` (day 7/14), below threshold — flow 29 needs either `persona_day30+` OR BE threshold revision (tracked item, NOT a flow-YAML-level fix).

## Cross-references

- Standing baseline: `~/.claude/projects/-Users-paragbhasin/memory/mitra_delivery_restoration_sprint_plan_2026_04_18.md`
- Wave 3 PR wave: `~/.claude/projects/-Users-paragbhasin-kalpx-app-rn/memory/mitra_room_truth_pr_wave_2026_04_19.md`
- Canonical rich runner rule: `~/.claude/projects/-Users-paragbhasin-kalpx-app-rn/memory/mitra_canonical_rich_runner_rule.md`
- Route map: `src/engine/ROUTES.md`
- CP-1 outcomes: `~/.claude/projects/-Users-paragbhasin/memory/mitra_cp1_outcomes_2026_04_18.md`
