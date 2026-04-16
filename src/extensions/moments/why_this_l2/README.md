# Moment: Why This? (Level 2 Overlay)

## What this is
When a user taps the small 'Why this?' chip on a dashboard card (mantra / sankalp / practice), Mitra reveals a Level-2 explanation: 1-2 lines of reasoning in plain human language, with a 'Go deeper' link to Level 3.

## Backend fields this moment needs

Reads from:
- `JourneyContext.primary_klesha` + `JourneyContext.primary_kosha` — selects `diagnostic_copy` key
- `JourneyContext.guidance_mode`

Writes to:
- Why-this open event log

Backend content source:
- yaml: `core/data_seed/mitra_v3/diagnostic_copy.yaml` (klesha x kosha x mode matrix)
- API: `/api/mitra/principle/<id>/detail/?level=2` OR `/api/mitra/diagnostic/<klesha>/<kosha>/`

## Where the design + exact copy comes from
Open this spec file — source of truth for every word and layout:
`/Users/paragbhasin/kalpx-frontend/docs/specs/mitra-v3-experience/screens/overlay_why_this_level_2.md`

If this scaffold renders differently from the spec, edit the scaffold, not the spec.

## The scaffold (already built — don't touch unless rendering is broken)
`src/extensions/moments/why_this_l2/index.tsx`

This file is isolated. Nothing in the app currently imports it. You connect it with 3 small steps below.

---

## Wire-up (3 steps, ~10-15 min)

### Step 1 of 3 — Register the container
Open: `/Users/paragbhasin/kalpx-app-rn/allContainers.js`

Find the big `allContainers = { ... }` object.
ADD this line at the end of the object (before the closing `};`):

```javascript
overlay: { why_this_l2: { blocks: [{ type: "why_this_l2_card" }] } },
```

Save.

### Step 2 of 3 — Teach BlockRenderer how to draw the block
Open: `/Users/paragbhasin/kalpx-app-rn/src/engine/BlockRenderer.tsx`

At the top, with the other imports, ADD:

```typescript
import WhyThisL2Overlay from "../extensions/moments/why_this_l2";
```

Scroll down to `switch (block.type) {`.
Before the `default:` branch, ADD:

```typescript
case "why_this_l2_card":
  return <WhyThisL2Overlay block={block} />;
```

Save.

### Step 3 of 3 — Add the action that opens this moment
Open: `/Users/paragbhasin/kalpx-app-rn/src/engine/actionExecutor.ts`

Find the main `switch (type) {` (the big one — there's only one this size).

Before the `default:` branch, ADD:

```typescript
case "open_why_this_l2": {
  loadScreen({ container_id: "overlay", state_id: "why_this_l2" });
  break;
}
```

Save. Wiring done.

---

## How to test

### Option A — Dev-only deep-link (quick smoke)
Bypasses the real user flow. Good only for confirming the screen renders at all.

```bash
xcrun simctl openurl booted kalpx://mitra/overlay/why_this_l2
```

Expected: Overlay card with reasoning lines and a 'Go deeper' button.

### Option B — Real user flow (the test that matters)
A user never types a URL. Test the tap path from cold launch:

1. Log in as a user who has a visible mantra/sankalp/practice card on the dashboard.
2. Tap the small 'Why this?' chip on the card.
3. Expected: a modal overlay with 2-3 short reasoning lines + 'Go deeper' link.

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

- ONE commit per moment. Commit message: `feat(moment): wire why_this_l2`
- Do NOT push. Request review first.
- If the smoke test fails, revert your 3 lines. The scaffold stays in repo (harmless — it's just an unused file).

---

## Must-not-do

- Do not edit any existing logic in `allContainers.js` / `BlockRenderer.tsx` / `actionExecutor.ts`. Only ADD the lines shown above.
- Do not wire multiple moments in the same commit.
- Do not touch the scaffold file unless the rendering is genuinely broken vs the spec.
