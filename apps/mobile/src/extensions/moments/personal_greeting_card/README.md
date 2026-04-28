# Moment: Personal Greeting Card

## ⚠️ Canonical spec status
No canonical spec exists. Copy is a best guess from Mitra vision principles. Product confirmation required before shipping.

## What this is
A personalized top-of-screen greeting card that addresses the user by name (when available), surfaces a contextual message based on `greeting_context`, and offers 3–4 gentle next-step CTAs (Start today / Review / Reflect / Ask Mitra). It is meant to be the first warm voice the user hears when they land on a home-like surface.

Possible use-cases:
- Top slot of the new v3 dashboard (scaffold 19 `new_dashboard`).
- Top banner of the unauthed Apr-11 Home screen.
- Standalone `home_hub/main` container.

## Backend fields this moment needs

Reads from:
- `User.first_name`
- `CompanionState.greeting_context` — one of `morning | evening | low_engagement | milestone`

Writes to: —

Backend content source:
- Not yet defined server-side (see the ⚠️ spec-status note above)
- Fallback: the static `CONTEXTUAL_MESSAGES` table inside `index.tsx`

## Where the design + exact copy comes from
⚠️ **No canonical spec file exists yet.** The layout + copy in this scaffold is a best-guess translation of these memos:

- `~/.claude/projects/-Users-paragbhasin/memory/mitra_vision_core.md` (Steel/Silk, sovereign companion voice)
- `~/.claude/projects/-Users-paragbhasin/memory/feedback_contextual_return.md` (contextual return, no default dashboard)

Pavani / product must confirm the four CTA labels and the contextual-message copy before wiring in prod.

## The scaffold (already built — don't touch unless rendering is broken)
`src/extensions/moments/personal_greeting_card/index.tsx`

This file is isolated. Nothing in the app currently imports it. You connect it via one of the 3 paths below.

---

## Inputs the card reads from screenData

| Field | Type | Purpose |
|---|---|---|
| `screenData.user.first_name` (or `screenData.first_name`) | string | Used in "Hi, ${firstName}." — if absent, greeting line is hidden and only the contextual message renders. |
| `screenData.greeting_context` | `"morning" \| "evening" \| "low_engagement" \| "milestone"` | Picks the contextual line-2 message. Anything else → generic fallback. |
| `screenData.greeting_ctas` | `{id, label}[]` (optional) | Overrides the default 4 CTAs. |

Backend may not yet emit `greeting_context` — the fallback message ("Still here. That is the practice.") will render. That is acceptable for MVP.

---

## Wire-up — pick ONE path

### Path A — Top slot of the new v3 dashboard (preferred)
Already handled if you wire scaffold 19 `new_dashboard` — that container imports `PersonalGreetingCard` directly and renders it as its top slot. **No extra work.**

### Path B — Top of unauthed Apr-11 Home
⚠️ This touches `Home.tsx`. Treat as a Home.tsx modification — review with Parag before committing.

Open: `/Users/paragbhasin/kalpx-app-rn/src/screens/Home/Home.tsx`

At the top, with the other imports, ADD:
```typescript
import PersonalGreetingCard from "../../extensions/moments/personal_greeting_card";
```

Inside `<ScrollView contentContainerStyle={styles.scrollContent}>`, ABOVE `<View style={styles.heroSection}>`, ADD:
```tsx
<PersonalGreetingCard
  screenData={{ user, greeting_context: "morning" }}
  onCtaPress={(id) => console.log("greeting cta", id)}
/>
```

Save.

### Path C — Standalone `home_hub/main` container
Open: `/Users/paragbhasin/kalpx-app-rn/allContainers.js`

ADD a new container entry alongside the other top-level containers:
```javascript
{
  container_id: "home_hub",
  states: {
    main: {
      blocks: [
        { type: "personal_greeting_card" },
      ],
    },
  },
},
```

Open: `/Users/paragbhasin/kalpx-app-rn/src/engine/BlockRenderer.tsx`

At the top:
```typescript
import PersonalGreetingCard from "../extensions/moments/personal_greeting_card";
```

Before `default:` in the `switch (block.type)`:
```typescript
case "personal_greeting_card":
  return <PersonalGreetingCard block={block} screenData={screenData} />;
```

Add an `open_home_hub` action in `src/engine/actionExecutor.ts` if you need a tap path to reach it.

---

## How to test

### Option A — Dev deep-link (Path C only)
```bash
xcrun simctl openurl booted kalpx://mitra/home_hub/main
```
Expected: Greeting card with "Hi, {first_name}." (or just contextual line if no name), contextual message, four gradient CTA pills.

### Option B — Real user flow
1. Cold launch the app.
2. For Path A → log in → dashboard route uses the v3 flag → card appears at top of dashboard.
3. For Path B → cold launch (logged-out) → Home renders → card appears above hero quote.
4. Tap each CTA pill — confirm `onCtaPress` fires (currently just a placeholder console log).

Real navigation for each CTA is left to Pavani when she wires — the scaffold intentionally defers routing to the caller.

---

## If something goes wrong

| Symptom | Likely missed step |
|---|---|
| Blank where greeting should be | Path C: container/block not registered |
| "Unknown block type" error | Path C: BlockRenderer import/case missing |
| CTA taps do nothing | Expected — wire `onCtaPress` to your navigation logic |
| Greeting line hidden when user is logged in | Backend not populating `screenData.user.first_name` |

---

## When done

- ONE commit: `feat(moment): wire personal_greeting_card (<path A|B|C>)`
- Do NOT push. Request review first (especially for Path B).
- If copy/CTAs still unconfirmed with product, ship Path A only — it is the safest surface.

## Must-not-do

- Do not invent a spec — flag the gap and ask product.
- Do not hard-code user names. Always read from `screenData.user.first_name`.
- Do not wire this moment and other moments in the same commit.
