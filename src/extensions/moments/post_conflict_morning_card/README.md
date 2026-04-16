# Moment: Post-Conflict Morning Card

## What this is
The morning after a user logged a conflict/rupture, Mitra opens with a softer card: no goals, just a question of how they slept and an offer to sit.

## Backend fields this moment needs

Reads from:
- Prior day's `ReflectionEntry.weight == "heavy"`
- `JourneyContext.guidance_mode`

Backend content source:
- yaml: `core/data_seed/mitra_v3/notification_templates.yaml` entry `post_conflict_follow`
- v1.2.0 `stage_subtext` / `dashboard_headings` provide alt copy when needed

## Where the design + exact copy comes from
Open this spec file — source of truth for every word and layout:
`/Users/paragbhasin/kalpx-frontend/docs/specs/mitra-v3-experience/screens/embedded_post_conflict_gentleness_card.md`

If this scaffold renders differently from the spec, edit the scaffold, not the spec.

## The scaffold (already built — don't touch unless rendering is broken)
`src/extensions/moments/post_conflict_morning_card/index.tsx`

This file is isolated. Nothing in the app currently imports it. You connect it with 3 small steps below.

---

## Wire-up (3 steps, ~10-15 min)

### Step 1 of 3 — Add the block to the dashboard block list
Open: `/Users/paragbhasin/kalpx-app-rn/allContainers.js`

Find the `companion_dashboard` key, then its `day_active` state, then the `blocks: [...]` array inside it.

ADD this entry to the end of the array (respecting the comma before it):

```javascript
{ type: "post_conflict_morning_card" },
```

(Backend gates visibility via `screenData.post_conflict`. You do NOT need to add any `if` in the RN code — the block itself checks `screenData.post_conflict` and renders null when absent.)

Save.

### Step 2 of 3 — Teach BlockRenderer how to draw the block
Open: `/Users/paragbhasin/kalpx-app-rn/src/engine/BlockRenderer.tsx`

At the top, with the other imports, ADD:

```typescript
import PostConflictMorningCard from "../extensions/moments/post_conflict_morning_card";
```

Scroll down to `switch (block.type) {`.
Before the `default:` branch, ADD:

```typescript
case "post_conflict_morning_card":
  return <PostConflictMorningCard block={block} />;
```

Save.

### Step 3 of 3 — Action wiring
This moment has no bespoke action — it renders passively based on backend data. Skip this step.

(If your moment has an interactive CTA that needs a new action, add it to `src/engine/actionExecutor.ts` before the `default:` in the main `switch (type)`.)

---

## How to test

### Option A — Dev-only deep-link (quick smoke)
Bypasses the real user flow. Good only for confirming the screen renders at all.

```bash
xcrun simctl openurl booted kalpx://mitra/companion_dashboard/day_active
```

Expected: Soft card with morning-after tone.

### Option B — Real user flow (the test that matters)
A user never types a URL. Test the tap path from cold launch:

1. As a user who logged a conflict yesterday, open the app the next morning.
2. If `post_conflict` is returned, the card renders first on the dashboard.

If a user CANNOT reach this moment via taps, REPORT THE GAP before wiring in prod. Deep-link only is NOT shippable.

---

## If something goes wrong

| Symptom | Likely missed step |
|---|---|
| Blank screen / nothing happens | Step 1 (container/block not registered) |
| Red error "no block type X" | Step 2 (block not registered in BlockRenderer) |
| Button/trigger does nothing | Step 3 (action not registered) |
| TypeScript error in BlockRenderer | Import path or component name typo in Step 2 |

---

## When done

- ONE commit per moment. Commit message: `feat(moment): wire post_conflict_morning_card`
- Do NOT push. Request review first.
- If the smoke test fails, revert your 3 lines. The scaffold stays in repo (harmless — it's just an unused file).

---

## Must-not-do

- Do not edit any existing logic in `allContainers.js` / `BlockRenderer.tsx` / `actionExecutor.ts`. Only ADD the lines shown above.
- Do not wire multiple moments in the same commit.
- Do not touch the scaffold file unless the rendering is genuinely broken vs the spec.
