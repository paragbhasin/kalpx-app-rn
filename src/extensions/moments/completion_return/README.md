# Moment: Completion Return Screen

## What this is

After a user finishes a core practice (mantra chant / sankalp embody / practice timer),
they see a short, warm acknowledgment screen before returning to the dashboard.

This is Pavani's Apr 13 redesign: premium light theme with a glowing lotus at bottom,
gold checkmark stroke-draws in, and a single Mitra message per practice type.

Three messages (the ONLY allowed copy per design rule — no "Great job!", no streaks):

- After mantra → `108 in. Kept.`
- After sankalp → `Held. Carry it into the day.`
- After practice → `Done. Notice what stayed.`

User then sees: `How did that feel?` input (optional) + `Return to Mitra Home` / `Repeat`.
There is no 10-second auto-return timer — user taps when ready.

## Backend fields this moment needs

Reads from:
- `runner.variant` (`mantra | sankalp | practice`) from Redux
- `runner.reps_completed` or `runner.duration`
- `JourneyContext.guidance_mode`

Backend content source:
- yaml: `core/data_seed/mitra_v3/moments_support_copy.yaml` section `completion_return` (added in v1.2.0)
- Returned by `/api/mitra/submit-engagement/` response

## Where the design + copy comes from

- The three messages and tone rule: `kalpx-frontend/docs/specs/mitra-v3-experience/screens/transient_completion_return.md`
- Visual redesign: Pavani's commits `b71bca9` + `dc0ce82` (Apr 13). Not re-spec'd.

If this scaffold renders differently from the spec copy, edit the scaffold, not the spec.

## The scaffold

- `src/extensions/moments/completion_return/index.tsx` — the React component (364 lines)
- `src/extensions/moments/completion_return/assets/mantra-lotus-3d.svg` — 423KB lotus asset used at bottom center

Import path in the component already points to the co-located asset (`./assets/mantra-lotus-3d.svg`). Do not move the asset.

---

## ⚠️ Important caveat before wiring

This scaffold depends on a runner **state machine** that Apr 11 base does NOT have.
Specifically, the component reads Redux keys seeded by Week 3's runner:

- `screenData.runner_variant` — one of `mantra` / `sankalp` / `practice`
- `screenData.runner_active_item` — the item being practiced
- `screenData.runner_source` — `core` vs `support` vs `additional_*`
- `screenData.runner_start_time` — seeded when runner begins

At Apr 11, the existing mantra / sankalp / practice runners (pre-Pavani merge, or Pavani's
merged runner itself) may or may not set these fields. Before wiring, verify the active
runner sets all four fields — otherwise the completion screen will render with empty
variant and fall through to the generic `practice` message.

You can stub-verify by setting these values manually in Redux before testing:

    screenData.runner_variant = "mantra"
    screenData.runner_active_item = { title: "..." }

Then deep-link to `practice_runner/completion_return`.

---

## Wire-up (3 steps, ~15 min)

### Step 1 of 3 — Register the state in allContainers

Open: `allContainers.js` (at repo root — not `src/engine/allContainers.js`)
Find `practice_runner: { ... }`.
ADD this state inside it (before the closing `}`):

```javascript
completion_return: {
    variant: "completion_return",
    immersive_v3: true,
    tone: { theme: "gold_light", mood: "grounded" },
    blocks: [
        { type: "completion_return" },
    ],
},
```

Save.

### Step 2 of 3 — Register the block in BlockRenderer

Open: `src/engine/BlockRenderer.tsx`
At the top, ADD the import:

```typescript
import CompletionReturnTransient from "../extensions/moments/completion_return";
```

Find the `blockMap` object (or the `switch (block.type)` — this repo uses one or the other).

If blockMap: ADD entry:

```typescript
completion_return: CompletionReturnTransient,
```

If switch: ADD case before `default:`:

```typescript
case "completion_return":
  return <CompletionReturnTransient block={block} />;
```

Save.

### Step 3 of 3 — Route runners to land here on completion

Open: `src/engine/actionExecutor.ts`
Find the action that fires when a runner completes. In v3 it's `complete_runner`;
in Apr 11 it may have a different name — search for `loadScreen.*practice_runner`
and see where the runner exits to.

The target when a runner finishes should be:

```typescript
loadScreen({
  container_id: "practice_runner",
  state_id: "completion_return",
});
```

If the existing action already navigates somewhere else (e.g. back to `companion_dashboard/day_active` directly), you'll need to insert this completion_return navigation FIRST, then let the user tap `Return to Mitra Home` to reach dashboard.

Minimal safe change: wherever the runner completion navigates away, replace the target with `practice_runner/completion_return`. The completion screen's own "Return to Mitra Home" button already navigates to `companion_dashboard/day_active`.

Save.

---

## How to test

### Option A — Dev deep link (fastest)

Requires the dev deep-link handler (not shipped in this branch — see `deep_link_handler.ts` if you add it separately).

```bash
xcrun simctl openurl 221EDFB1-254E-4694-9B58-8BABEF2EBADD kalpx://mitra/practice_runner/completion_return
```

Expected: beige background, gold checkmark stroke-drawing in, message "Done. Notice what stayed." (default practice variant when no runner_variant seeded), "How did that feel?" input, two CTAs, glowing lotus at bottom center.

To test each variant, seed `screenData.runner_variant` in Redux first:

    import { store } from "./src/store";
    import { screenActions } from "./src/store/screenSlice";
    store.dispatch(screenActions.setScreenValue({ key: "runner_variant", value: "mantra" }));

### Option B — Real user flow (this is what matters)

From cold launch:
1. Login as a test user with an active journey
2. Dashboard → tap the **Mantra card** → mantra runner opens
3. Complete 108 reps (or however many; tap through the bead/counter)
4. Runner completes → **completion_return fades in**
5. Expected: "108 in. Kept." message + checkmark + lotus + "Return to Mitra Home" button
6. Tap `Return to Mitra Home` → dashboard with mantra triad card showing `✓`
7. Repeat for Sankalp card → "Held. Carry it into the day."
8. Repeat for Practice card → "Done. Notice what stayed."

If any variant shows the wrong message, check that `screenData.runner_variant` is being
seeded correctly in the active runner container.

### Flow gap to watch

If the Apr 11 runners don't set `runner_variant` / `runner_active_item`, the completion
screen will appear with an empty message slot. Fix by updating the runner to set those
four fields at start (see the "caveat" above).

---

## If something goes wrong

| Symptom | Likely cause |
|---|---|
| Blank beige screen, no checkmark | Runner state not seeded; check `runner_variant` in Redux |
| TypeScript error "Cannot find module './assets/mantra-lotus-3d.svg'" | `react-native-svg-transformer` not configured OR the asset path changed |
| Lotus doesn't render | SVG transformer issue — check `metro.config.js` has `svg` in the `sourceExts` |
| Message is always "Done. Notice what stayed." | `runner_variant` is null, falling through to practice default |
| Screen never appears after practice | Step 3 wire-up didn't redirect the runner on completion |

---

## When done

- ONE commit: `feat(moment): wire completion_return`
- Do NOT push. Request review first.

## Must-not-do

- Do not edit any other logic in `allContainers.js` / `BlockRenderer.tsx` / `actionExecutor.ts` — only ADD the shown lines.
- Do not add exclamations or alternate messages. Copy is tone-locked to the 3 canonical lines.
- Do not remove the lotus — it's a design signature of Pavani's redesign.
- Do not re-add a 10-second auto-return timer — Pavani deliberately removed it so users have agency.
