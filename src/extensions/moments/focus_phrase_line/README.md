# Moment: Focus Phrase Line

## What this is
A single line of anchor text shown on the dashboard — Mitra's suggested focus for today. Short, poetic, non-prescriptive.

## Backend fields this moment needs

Reads from:
- `CompanionState.focus_phrase` (returned by `/journey/companion/`)
- OR `JourneyContext.life_context` + `dashboard_chrome.context_subheading` (from v1.2.0 onboarding/complete)

Backend content source:
- v1.2.0 `dashboard_chrome.context_subheading`
- OR `core/data_seed/mitra_v3/morning_briefing_templates.yaml`

## Where the design + exact copy comes from
WARNING: No dedicated spec file — see §1 of route_dashboard_day_active.md.

## The scaffold (already built — don't touch unless rendering is broken)
`src/extensions/moments/focus_phrase_line/index.tsx`

This file is isolated. Nothing in the app currently imports it. You connect it with 3 small steps below.

---

## Wire-up (3 steps, ~10-15 min)

### Step 1 of 3 — Add the block to the dashboard block list
Open: `/Users/paragbhasin/kalpx-app-rn/allContainers.js`

Find the `companion_dashboard` key, then its `day_active` state, then the `blocks: [...]` array inside it.

ADD this entry to the end of the array (respecting the comma before it):

```javascript
{ type: "focus_phrase_line" },
```

(Backend gates visibility via `screenData.focus_phrase`. You do NOT need to add any `if` in the RN code — the block itself checks `screenData.focus_phrase` and renders null when absent.)

Save.

### Step 2 of 3 — Teach BlockRenderer how to draw the block
Open: `/Users/paragbhasin/kalpx-app-rn/src/engine/BlockRenderer.tsx`

At the top, with the other imports, ADD:

```typescript
import FocusPhraseLine from "../extensions/moments/focus_phrase_line";
```

Scroll down to `switch (block.type) {`.
Before the `default:` branch, ADD:

```typescript
case "focus_phrase_line":
  return <FocusPhraseLine block={block} />;
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

Expected: Single italic line of focus phrase text.

### Option B — Real user flow (the test that matters)
A user never types a URL. Test the tap path from cold launch:

1. Log in as a user with an active journey.
2. If the backend returns `focus_phrase` for today, the line appears below the day-type chip on the dashboard.

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

- ONE commit per moment. Commit message: `feat(moment): wire focus_phrase_line`
- Do NOT push. Request review first.
- If the smoke test fails, revert your 3 lines. The scaffold stays in repo (harmless — it's just an unused file).

---

## Must-not-do

- Do not edit any existing logic in `allContainers.js` / `BlockRenderer.tsx` / `actionExecutor.ts`. Only ADD the lines shown above.
- Do not wire multiple moments in the same commit.
- Do not touch the scaffold file unless the rendering is genuinely broken vs the spec.
