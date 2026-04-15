# Moment: Loneliness Room

## ⚠️ Canonical spec status
Spec partially defined in `overlay_support_loneliness_room.md` (stub). Confirm copy with product before wiring. Fallback copy in `index.tsx` is a best-guess from Mitra vision memos.

## What this is
The Loneliness Room is opened when a user expresses loneliness or a feeling of not being seen. It is gentle and company-like — never clinical. One phrase, one breathing/ambient cue, two kind exits.

## Where the design + exact copy comes from
Open this spec file — source of truth for every word and layout:
`/Users/paragbhasin/kalpx-frontend/docs/specs/mitra-v3-experience/screens/overlay_support_loneliness_room.md`

If this scaffold renders differently from the spec, edit the scaffold, not the spec.

## The scaffold (already built — don't touch unless rendering is broken)
`src/extensions/moments/loneliness_room/index.tsx`

This file is isolated. Nothing in the app currently imports it. You connect it with 3 small steps below.

---

## Wire-up (3 steps, ~10-15 min)

### Step 1 of 3 — Register the container
Open: `/Users/paragbhasin/kalpx-app-rn/allContainers.js`

Find the big `allContainers = { ... }` object.
ADD this line at the end of the object (before the closing `};`):

```javascript
support_loneliness: { room: { blocks: [{ type: "loneliness_room_body" }] } },
```

Save.

### Step 2 of 3 — Teach BlockRenderer how to draw the block
Open: `/Users/paragbhasin/kalpx-app-rn/src/engine/BlockRenderer.tsx`

At the top, with the other imports, ADD:

```typescript
import LonelinessRoomContainer from "../extensions/moments/loneliness_room";
```

Scroll down to `switch (block.type) {`.
Before the `default:` branch, ADD:

```typescript
case "loneliness_room_body":
  return <LonelinessRoomContainer block={block} />;
```

Save.

### Step 3 of 3 — Add the action that opens this moment
Open: `/Users/paragbhasin/kalpx-app-rn/src/engine/actionExecutor.ts`

Find the main `switch (type) {` (the big one — there's only one this size).

Before the `default:` branch, ADD:

```typescript
case "enter_loneliness_room": {
  loadScreen({ container_id: "support_loneliness", state_id: "room" });
  break;
}
```

Save. Wiring done.

---

## How to test

### Option A — Dev-only deep-link (quick smoke)
Bypasses the real user flow. Good only for confirming the screen renders at all.

```bash
xcrun simctl openurl booted kalpx://mitra/support_loneliness/room
```

Expected: Warm phrase + two soft buttons (stay / return).

### Option B — Real user flow (the test that matters)
A user never types a URL. Test the tap path from cold launch:

1. Cold launch app, log in as a user with an active journey.
2. On the dashboard, tap 'I need support' or the composer.
3. Choose 'lonely' / 'alone' in the feeling picker.
4. Read the advice card, tap 'Enter the room'.
5. Expected: Loneliness Room renders — warm tone, single phrase, two exits.

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

- ONE commit per moment. Commit message: `feat(moment): wire loneliness_room`
- Do NOT push. Request review first.
- If the smoke test fails, revert your 3 lines. The scaffold stays in repo (harmless — it's just an unused file).

---

## Must-not-do

- Do not edit any existing logic in `allContainers.js` / `BlockRenderer.tsx` / `actionExecutor.ts`. Only ADD the lines shown above.
- Do not wire multiple moments in the same commit.
- Do not touch the scaffold file unless the rendering is genuinely broken vs the spec.
