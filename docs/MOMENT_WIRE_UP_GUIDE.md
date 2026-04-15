# Adding Mitra v3 Moments — Guide for Pavani

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
