# Phase 3 — Silk Integrity first live pass on Metro

**Context:** Sprint 1 Phase 3 under CP-1 revised disposition.
**Prerequisite:** Phase 2 Metro verification PASS (see `PHASE_2_METRO_VERIFICATION.md`).
**Pack:** `.maestro/silk-integrity/` (11 flow skeletons + README + FALLBACK_DENY_LIST).

## Goal

First live execution of the 11 Silk Integrity flows against a running Metro session + real dev backend. Flush out placeholder Maestro IDs; iterate until 11/11 green.

## Prerequisites

- Metro running (`npx expo start --dev-client`) with Track 1 flag ON.
- iOS simulator OR Android emulator OR physical dev client connected to Metro.
- `maestro` CLI installed: `curl -Ls https://get.maestro.mobile.dev \| bash`.
- Dev backend `MITRA_V3_CONTENT_RESOLVE_ENABLED=1` confirmed (Phase 1 ✅).

## Running the pack

### One flow at a time (expected first-pass)

```bash
cd /Users/paragbhasin/kalpx-app-rn
# Start with the simplest flow
maestro test .maestro/silk-integrity/06_joy_room.yaml
```

First run WILL likely fail on placeholder Maestro IDs (e.g. `triad_card_mantra`). That's expected. For each failure:

1. Read the actual rendered element's `testID` / `accessibilityLabel` via Maestro Studio: `maestro studio`.
2. Patch the flow file to use the real ID.
3. Re-run.

Commit the batched patches as a single `mdr-s1-13: first-live-run id alignment` commit.

### Full pack (after individual flows are green)

```bash
maestro test .maestro/silk-integrity/
```

## Expected runtime

- Skeleton → stable first-green: ~45–90 min depending on how many IDs need patching.
- Full pack subsequent runs: ~8–12 min.

## Flow execution order (dependency-respecting)

1. `01_recognition.yaml` (onboarding recognition)
2. `02_triad_reveal.yaml` (builds on 01)
3. `03_home_contextual.yaml` (requires a persona with Journey)
4. `04_grief_room.yaml`, `05_loneliness_room.yaml` (independent)
5. `06_joy_room.yaml`, `07_growth_room.yaml` (independent, Track 1)
6. `08_day7_checkpoint.yaml`, `09_day14_checkpoint.yaml` (persona walk)
7. `10_completion_core_mantra.yaml`
8. `11_completion_support_matrix.yaml` (parameterized — 7 invocations)

## Success criteria

- All 11 flows PASS on the current Metro session.
- `FALLBACK_DENY_LIST.txt` strings do not appear in any flow's assertion surface.
- Screenshots captured per flow under `.maestro/silk-integrity/screenshots/` (gitignored if path conflicts exist).
- Patched flow files committed.

## What failures mean

| Failure type | Classification | Action |
|---|---|---|
| Missing `testID` / mismatched selector | Skeleton-side (expected) | Patch selector; re-run |
| Asserted string absent (content not seeded) | BE content authoring gap | STOP; open ticket; do not patch Maestro assertion to hide it |
| Asserted string present but on wrong surface | Render-layer bug | STOP; open ticket; fix in a proper edit |
| Deny-list string rendered | Sovereignty regression | Critical; STOP and fix the source fallback before continuing |

## Exit to Phase 4

- 11/11 PASS on Metro.
- Flow file patches committed.
- Any deferred findings logged in closure register (e.g. persona-data gaps) with target sprint.
- Then: Phase 4 human smoke walk-through runs on the same Metro session against the 16-flow `PROD_SMOKE_CHECKLIST_V1.md`.

## What does NOT happen in Phase 3

- No eas build.
- No production targeting.
- No backend/content re-authoring unless Phase 3 surfaces a real rendering bug traced to the backend.
