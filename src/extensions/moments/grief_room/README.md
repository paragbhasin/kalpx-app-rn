# Moment: Grief Room

## ⚠️ Canonical spec status
Spec partially defined in `overlay_support_grief_room.md` (stub). Confirm copy with product before wiring. Fallback copy in `index.tsx` is a best-guess from the Mitra vision memos.

## What this is
The Grief Room is a soft, dim-lit space Mitra opens when the user signals loss, heavy grief, or bereavement. Nothing rushes them — the room just sits with them. It offers a single grounding phrase, an ambient sound option, and two calm exits (stay longer / return to day).

## Backend fields this moment needs

Reads from:
- `JourneyContext.primary_kosha` — determines intensity (`anandamaya` triggers grief path)
- `JourneyContext.primary_klesha` — `asmita` or `abhinivesha` strengthens offer
- `JourneyContext.guidance_mode` — determines copy mode

Writes to:
- Trigger log (`reason: grief_room_entered`, `source: {automatic|user_requested}`)

Backend content source:
- yaml: `core/data_seed/mitra_v3/moments_support_copy.yaml` section `grief_room`
- Planned API: `/api/mitra/moments/grief_room/copy?mode=<mode>`

See [MOMENT_WIRE_UP_GUIDE.md — API per turn + v1.2.0 response shape](../../../../docs/MOMENT_WIRE_UP_GUIDE.md#api-calls-per-onboarding-turn) for the full field map.

## Where the design + exact copy comes from
Open this spec file — source of truth for every word and layout:
`/Users/paragbhasin/kalpx-frontend/docs/specs/mitra-v3-experience/screens/overlay_support_grief_room.md`

If this scaffold renders differently from the spec, edit the scaffold, not the spec.

## The scaffold (already built — don't touch unless rendering is broken)
`src/extensions/moments/grief_room/index.tsx`

This file is isolated. Nothing in the app currently imports it. You connect it with 3 small steps below.

---

## Wire-up (3 steps, ~10-15 min)

### Step 1 of 3 — Register the container
Open: `/Users/paragbhasin/kalpx-app-rn/allContainers.js`

Find the big `allContainers = { ... }` object.
ADD this line at the end of the object (before the closing `};`):

```javascript
support_grief: { room: { blocks: [{ type: "grief_room_body" }] } },
```

Save.

### Step 2 of 3 — Teach BlockRenderer how to draw the block
Open: `/Users/paragbhasin/kalpx-app-rn/src/engine/BlockRenderer.tsx`

At the top, with the other imports, ADD:

```typescript
import GriefRoomContainer from "../extensions/moments/grief_room";
```

Scroll down to `switch (block.type) {`.
Before the `default:` branch, ADD:

```typescript
case "grief_room_body":
  return <GriefRoomContainer block={block} />;
```

Save.

### Step 3 of 3 — Add the action that opens this moment
Open: `/Users/paragbhasin/kalpx-app-rn/src/engine/actionExecutor.ts`

Find the main `switch (type) {` (the big one — there's only one this size).

Before the `default:` branch, ADD:

```typescript
case "enter_grief_room": {
  loadScreen({ container_id: "support_grief", state_id: "room" });
  break;
}
```

Save. Wiring done.

---

## How to test

### Option A — Dev-only deep-link (quick smoke)
Bypasses the real user flow. Good only for confirming the screen renders at all.

```bash
xcrun simctl openurl booted kalpx://mitra/support_grief/room
```

Expected: "Sit with me for a moment." style phrase + soft buttons (stay / return).

### Option B — Real user flow (the test that matters)
A user never types a URL. Test the tap path from cold launch:

1. Cold launch app, complete onboarding OR log in as a user with an active journey.
2. On the companion dashboard, tap the 'I need support' entry (or the support composer).
3. In the composer, choose 'grief' / 'loss' as the feeling.
4. Read the advice card, then tap 'Enter the room' (or equivalent CTA).
5. Expected: the Grief Room screen renders — dim background, single anchor phrase, two muted actions.

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

- ONE commit per moment. Commit message: `feat(moment): wire grief_room`
- Do NOT push. Request review first.
- If the smoke test fails, revert your 3 lines. The scaffold stays in repo (harmless — it's just an unused file).

---

## Must-not-do

- Do not edit any existing logic in `allContainers.js` / `BlockRenderer.tsx` / `actionExecutor.ts`. Only ADD the lines shown above.
- Do not wire multiple moments in the same commit.
- Do not touch the scaffold file unless the rendering is genuinely broken vs the spec.
