# Adding Mitra v3 Moments — Guide for Pavani

## Sadhana Yatra framework — read this first (2026-04-14)

Every moment in Mitra now lives inside the **Sadhana Yatra** spine. This is the unifying model that tells us WHEN a moment surfaces, WHY, and HOW it relates to every other moment. Spec: `~/.claude/projects/-Users-paragbhasin/memory/mitra_architecture_sadhana_yatra.md`.

### The 4-stage diagnostic
Every user enters via a 4-stage conversation (onboarding today, daily check-in later):
- **Stage 0 — Path pick:** support (need help) vs growth (feel okay, want to grow)
- **Stage 1 — Where / What:** kosha (support) OR aliveness (growth)
- **Stage 2 — Movement:** vritti (support) OR aspiration (growth)
- **Stage 3 — Root / Fit:** klesha (support) OR preferred modality (growth)

These four signals plus `guidance_mode` compose a **recognition line** and select the user's **triad** (mantra / sankalp / practice).

### Two temporal layers
1. **Life phase** — stable over a 14-day cycle. Drives the triad.
2. **Daily state** — volatile, per session. Drives which moment surfaces today.

### What this means for wiring a moment
Before you add any new moment, answer:
1. Which **path** does it serve — support, growth, or both?
2. Which **framework cell** does it live in? (e.g. "support + anandamaya + asmita" = grief room)
3. Is it driven by **life phase** or **daily state**?
4. Does it depend on any diagnostic signal from onboarding (`primary_kosha`, `primary_vritti`, `primary_klesha`, `aliveness_state`, `aspiration`, `preferred_modality`)?

If you cannot name the cell, surface the question to Parag before building. A moment without a cell will drift.

### Onboarding shape (as of 2026-04-14)
`welcome_onboarding` container, 8 states:
- `turn_1` — greet
- `turn_2` — Stage 0 (path)
- `turn_3_support` | `turn_3_growth` — Stage 1
- `turn_4_support` | `turn_4_growth` — Stage 2
- `turn_5_support` | `turn_5_growth` — Stage 3
- `turn_6` — guidance mode picker
- `turn_7` — recognition (backend-composed, JS fallback via `MITRA_V3_RECOGNITION_BACKEND=0`)
- `turn_8` — triad reveal

Routing lives in `src/engine/actionExecutor.ts` → `onboarding_turn_response`. Chip-id → signal mapping is inline in that case. Chip labels are LOCKED per spec — do not paraphrase.

---

## What is a "moment"?

Mitra's experience is made of ~47 named moments — specific emotional surfaces the user sees at specific points in their day and journey. Each moment is ONE container x ONE state (e.g. `support_grief` x `room` = the Grief Room).

Think of a moment as a single "turn" in the conversation Mitra has with the user. It is NOT a generic screen in a traditional app.

## How the screen engine works (30-second crash course)

1. A **container** is a namespace for a UX surface (e.g. `support_grief`). A **state** is a specific screen inside it (e.g. `room`).
2. When code dispatches `loadScreen({container_id, state_id})`, the engine reads the layout from `/Users/paragbhasin/kalpx-app-rn/allContainers.js` and renders the blocks listed there.
3. A **block** is one small React component (headline, button, mantra ring, `grief_room_body`, etc.).
4. `src/engine/BlockRenderer.tsx` maps `block.type` -> a React component.
5. **Actions** (button presses, `enter_grief_room`) are handlers in `src/engine/actionExecutor.ts`.

That's it. Every screen the user sees is a container + state + list of blocks.

## The recipe

Every moment in `src/extensions/moments/` ships as:

- ONE scaffold file (already built — don't edit unless rendering is wrong vs the spec).
- ONE README with EXACT 3-step wire-up instructions (copy-paste).

Open a moment's README and follow the 3 steps. No more, no less.

## Recommended order (smallest/safest first)

### Tier 1 — Support surfaces (2-3 hours total)

Standalone surfaces reached from the dashboard support entry. Wire these first — they are the simplest pattern (register container -> register block -> register action).

- `grief_room` (~15 min)
- `loneliness_room` (~15 min)
- `why_this_l2` (~10 min)
- `why_this_l3` (~10 min)
- `voice_consent` (~10 min)
- `sound_bridge` (~10 min)

### Tier 2 — Dashboard embeds (3-4 hours total)

These are conditional cards inside `companion_dashboard/day_active`. Wiring is slightly different: you add the block to the dashboard's `blocks: [...]` array and let the block itself check backend data for visibility. No new action needed for most.

- `day_type_chip` (~15 min)
- `focus_phrase_line` (~15 min)
- `continuity_mirror_card` (~20 min)
- `why_this_l1_chip` (~30 min — touches triad card renderer, see its README)
- `path_milestone_banner` (~15 min)
- `predictive_alert_card` (~15 min)
- `entity_recognition_card` (~20 min — decide overlay vs embed first)
- `gratitude_signal_card` (~15 min)
- `season_signal_card` (~15 min)
- `post_conflict_morning_card` (~15 min)

### Tier 3 — Content refreshes (30 min total)

NOT code changes — these are JSON content packs applied through the backend.

- `cycle_reflection_refresh`
- `checkpoint_results_refresh`

### Tier 4 — v3 Dashboard shell (ship as ONE PR with Tier 2)

A new dashboard variant (`companion_dashboard_v3`) that assembles all Tier-2 embeds in the right slots, plus a new personal greeting card that lives at its top. Ships side-by-side with the Apr-11 dashboard, gated by a feature flag — **zero regression risk**.

Because `new_dashboard` composes every Tier-2 embed, wire Tier 2 FIRST (so each embed renders correctly in isolation), then ship Tier 2 + Tier 4 together as one cohesive "v3 dashboard" PR.

- `personal_greeting_card` (~15 min) — top-slot greeting with contextual CTAs. Also usable on unauthed Home or as a standalone `home_hub/main` container.
- `new_dashboard` (~25 min) — assembles greeting + all Tier-2 embeds into `companion_dashboard_v3/day_active`. See its README for the exact 3-step wire-up and the flag toggle in `Home.tsx`.

## Rules

1. ONE moment per branch, ONE moment per commit.
2. Commit message format: `feat(moment): wire <moment_name>`
3. Do not push without review.
4. Always run BOTH tests in the README (deep link + real user flow).
5. If the real user flow cannot reach the moment, file a product gap issue FIRST — do not ship the wiring.
6. Never modify existing logic in the 3 engine files — only ADD the shown lines.
7. If TypeScript complains after your edits, double-check the component import path in Step 2.

## Forbidden files (do not modify; ADD lines only)

- `/Users/paragbhasin/kalpx-app-rn/allContainers.js`
- `/Users/paragbhasin/kalpx-app-rn/src/engine/BlockRenderer.tsx`
- `/Users/paragbhasin/kalpx-app-rn/src/engine/actionExecutor.ts`

## Escalation

If a moment has:

- **No canonical spec file** (marked with a WARNING in its README) — ping product before wiring.
- **A "real user flow gap"** (no tap path to reach it) — file the gap issue first.
- **TypeScript errors you can't resolve** — ping for help, don't force-fix.

## When all moments are wired

Tag the branch `v3-moments-complete-by-pavani`, open PR for review.

## Reference: the spec repo

All design specs live in the kalpx-frontend repo:

`/Users/paragbhasin/kalpx-frontend/docs/specs/mitra-v3-experience/screens/`

Key files:

- `INDEX.md` — list of all 47 moments and their spec files.
- `00-SCREEN-SPEC-TEMPLATE.md` — the spec template pattern.
- `01-SURFACE-CLASSIFICATION.md` — the 5 surface types (route / overlay / transient / embedded / external).

## One more thing

This engine is "append-only" for wiring. You are ADDING lines, never removing. If you ever find yourself reaching to delete or refactor an existing line in one of the 3 engine files, stop and ask. The moment you remove a line, you are outside the safe path.

---

## Scaffold 21 — completion_return (added after the main 20)

- **What:** the "108 in. Kept." / "Held. Carry it into the day." / "Done. Notice what stayed." acknowledgment screen that appears right after a core practice completes. Pavani's Apr 13 redesign (premium light theme, glowing lotus at bottom, no auto-return timer).
- **Why separate:** it was extracted from Pavani's commits `b71bca9` + `dc0ce82` which could not be cherry-picked onto Apr 11 base because they modify a file that Week 3 introduced (and Week 3 is excluded from this branch).
- **Depends on:** Week 3 runner state machine fields (`runner_variant`, `runner_active_item`, `runner_source`, `runner_start_time`). Apr 11 runners may not set these — verify or stub before wiring.
- **Folder:** `src/extensions/moments/completion_return/` (includes `index.tsx` + `assets/mantra-lotus-3d.svg` 423KB)
- **Estimated wire time:** 15-25 min (longer than other Tier 1 scaffolds because you may need to also seed runner_variant in the active runner if not already set)
- **Spec:** `kalpx-frontend/docs/specs/mitra-v3-experience/screens/transient_completion_return.md`
- **Feature flag:** `MITRA_V3_COMPLETION_RETURN`
