# Moment: Voice Consent Overlay

## What this is
The very first time a user taps any microphone icon, Mitra interrupts with a consent overlay explaining what is recorded, where it is stored, and how to opt out. Tapping 'Continue' remembers the consent and opens the recorder; 'Not now' returns to the previous screen.

## Where the design + exact copy comes from
Open this spec file — source of truth for every word and layout:
`/Users/paragbhasin/kalpx-frontend/docs/specs/mitra-v3-experience/screens/overlay_voice_consent.md`

If this scaffold renders differently from the spec, edit the scaffold, not the spec.

## The scaffold (already built — don't touch unless rendering is broken)
`src/extensions/moments/voice_consent/index.tsx`

This file is isolated. Nothing in the app currently imports it. You connect it with 3 small steps below.

---

## Wire-up (3 steps, ~10-15 min)

### Step 1 of 3 — Register the container
Open: `/Users/paragbhasin/kalpx-app-rn/allContainers.js`

Find the big `allContainers = { ... }` object.
ADD this line at the end of the object (before the closing `};`):

```javascript
overlay: { voice_consent: { blocks: [{ type: "voice_consent_card" }] } },
```

Save.

### Step 2 of 3 — Teach BlockRenderer how to draw the block
Open: `/Users/paragbhasin/kalpx-app-rn/src/engine/BlockRenderer.tsx`

At the top, with the other imports, ADD:

```typescript
import VoiceConsentOverlay from "../extensions/moments/voice_consent";
```

Scroll down to `switch (block.type) {`.
Before the `default:` branch, ADD:

```typescript
case "voice_consent_card":
  return <VoiceConsentOverlay block={block} />;
```

Save.

### Step 3 of 3 — Add the action that opens this moment
Open: `/Users/paragbhasin/kalpx-app-rn/src/engine/actionExecutor.ts`

Find the main `switch (type) {` (the big one — there's only one this size).

Before the `default:` branch, ADD:

```typescript
case "request_voice_consent": {
  loadScreen({ container_id: "overlay", state_id: "voice_consent" });
  break;
}
```

Save. Wiring done.

---

## How to test

### Option A — Dev-only deep-link (quick smoke)
Bypasses the real user flow. Good only for confirming the screen renders at all.

```bash
xcrun simctl openurl booted kalpx://mitra/overlay/voice_consent
```

Expected: Overlay with consent copy and two actions.

### Option B — Real user flow (the test that matters)
A user never types a URL. Test the tap path from cold launch:

1. As a user who has never granted voice consent, tap any mic icon (on the composer, reflection screen, etc.).
2. Expected: consent overlay appears — NOT the recorder — with 'Continue' and 'Not now' buttons.
3. Tap 'Continue' → recorder opens on next interaction.
4. Tap 'Not now' → returns to previous screen, no recording.

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

- ONE commit per moment. Commit message: `feat(moment): wire voice_consent`
- Do NOT push. Request review first.
- If the smoke test fails, revert your 3 lines. The scaffold stays in repo (harmless — it's just an unused file).

---

## Must-not-do

- Do not edit any existing logic in `allContainers.js` / `BlockRenderer.tsx` / `actionExecutor.ts`. Only ADD the lines shown above.
- Do not wire multiple moments in the same commit.
- Do not touch the scaffold file unless the rendering is genuinely broken vs the spec.
