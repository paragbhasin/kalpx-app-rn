# Silk Integrity Test Pack

**Owner:** Delivery Restoration (MDR-S1-13).
**Purpose:** prove the 7-step Delivery Standard (DoD chain) for each critical Mitra moment:
1. Content exists (ContentPack/WisdomAsset authored, `status=approved`)
2. Resolver selects it (orchestrator picks correct variant)
3. Endpoint returns it (HTTP response carries the slot values)
4. FE reads it at canonical path (per `CONTRACT_JOURNEY_COMPANION_V1.md`)
5. Component renders it (visible in DOM / UI tree)
6. No fallback overrides (no English literal in the render)
7. Telemetry confirms it was shown (MitraDecisionLog row lands)

## Test coverage (Sprint 1)

| # | Flow | Maestro flow | Jest e2e | Status |
|---|---|---|---|---|
| 01 | Onboarding recognition | `01_recognition.yaml` | `recognition.e2e.spec.ts` | **skeleton** |
| 02 | Triad reveal | `02_triad_reveal.yaml` | `triad_reveal.e2e.spec.ts` | **skeleton** |
| 03 | Home contextual route | `03_home_contextual.yaml` | `home.e2e.spec.ts` | **skeleton** |
| 04 | Grief Room (M46) | `04_grief_room.yaml` (exists) | `grief_room.e2e.spec.ts` | adapt existing |
| 05 | Loneliness Room (M47) | `05_loneliness_room.yaml` (exists) | `loneliness_room.e2e.spec.ts` | adapt existing |
| 06 | Joy Room (M48) — NEW | `06_joy_room.yaml` | `joy_room.e2e.spec.ts` | **new, Sprint 1** |
| 07 | Growth Room (M49) — NEW | `07_growth_room.yaml` | `growth_room.e2e.spec.ts` | **new, Sprint 1** |
| 08 | Day 7 checkpoint (M24) | `08_day7.yaml` | `day7.e2e.spec.ts` | **skeleton** |
| 09 | Day 14 checkpoint (M25) | `09_day14.yaml` | `day14.e2e.spec.ts` | **skeleton** |
| 10 | Completion return — core mantra | `10_completion_core_mantra.yaml` | `completion_core.e2e.spec.ts` | **skeleton** |
| 11 | Completion return — support × source matrix | `11_completion_support_matrix.yaml` | `completion_support.e2e.spec.ts` | **skeleton** |

## Assertions per flow

Each flow must assert:
- **Presence:** expected ContentPack slot values render in the DOM (exact string match against resolved variant).
- **Absence of fallback:** a negative grep against the known hardcoded-English fallbacks (maintained in `FALLBACK_DENY_LIST.txt`). Fails CI if any are rendered.
- **Telemetry:** a `MitraDecisionLog` row is written within 5s of the render with expected `moment_id`, `variant_id`, `user_attention_state`, and `mode_served`.

## Runner surface regression (MDR-S3-13)

Flows 06, 07, 10, 11 also cover the runner surfaces (PracticeRunnerContainer, MantraRunnerDisplay, SankalpHoldBlock, PracticeStepsBlock, PracticeTimerBlock, GuideBlock, SummaryBlock). Assertions:
- No English leakage in Hi locale.
- No hardcoded mantra/sankalp/practice copy rendered outside ContentPack flow.
- `reflection_prompt` slot resolves to authored text (not the legacy `"How did that feel?"` fallback — MDR-S1-12 drops that fallback entirely).

## Fallback deny-list (seed)

`FALLBACK_DENY_LIST.txt` — the strings that MUST NOT appear rendered anywhere (tested via DOM text search after each render). Seed list:
- `"Fourteen days. Two weeks of showing up."` (CheckpointDay14 pre-S1-10 hardcoded)
- `"How did that feel?"` (CompletionReturnTransient pre-S1-12 fallback — being dropped per consolidation)
- `"Grief Room"`, `"Loneliness Room"` as standalone labels (MoreSupportSheet pre-S1-11 fallbacks)
- `"I'm here if you need more."` (MoreSupportSheet pre-S1-11 fallback)
- `"Today's anchor"`, `"Today's vow"`, `"Today's practice"` (CoreItemsList pre-S3-04 fallbacks)
- `"Your Sankalp is Alive."` (PracticeRunnerContainer pre-S3-05 fallback)

Each Sprint adds rows to this deny-list as fallbacks are eliminated. Deny-list entries are removed only if the source fallback is PROVEN still live + legitimate (re-classified into the Sovereignty Exception Registry — MDR-S3-08).

## Running

Locally:
```bash
cd kalpx-app-rn && npx maestro test .maestro/silk-integrity/
```

CI: added as required gate in the RN pipeline once MDR-S1-13 lands.

## Skeleton files

Each flow file carries the standard Maestro shape + assertions. Initial skeletons are placeholders — Agent-4-backed (regression) review completes before enabling in CI.
