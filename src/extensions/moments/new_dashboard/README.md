# Moment: New Dashboard (companion_dashboard_v3 / day_active)

## What this is
A NEW dashboard variant that assembles all Tier-2 embed moments in the right slots, using the Apr-11 visual design language (warm parchment `#FAF7F2`, gold `#D4A017`, cream hairline cards, serif headlines). It integrates:

- `PersonalGreetingCard` (scaffold 20, top slot)
- `PathMilestoneBanner` (gold-gradient wrapper)
- `DayTypeChip` + streak pill
- `FocusPhraseLine`
- Core items triad (inline renderer — swap to shared `CoreItemsList` block when one exists in `src/blocks/`)
- `WhyThisL1Chip` row
- Conditional embeds: predictive / entity / gratitude / season / post-conflict
- `ContinuityMirrorCard`
- Two primary CTAs (I Feel Triggered / Quick Check-In) that mirror the existing Apr-11 `companion_dashboard/day_active` buttons

## Why it's separate (not a replacement)
This ships as a NEW container `companion_dashboard_v3`. The existing Apr-11 `companion_dashboard` stays untouched. A feature flag decides which a given user sees — **zero regression risk**.

## Where the design + exact copy comes from
- Slot contract: `/Users/paragbhasin/kalpx-frontend/docs/specs/mitra-v3-experience/screens/route_dashboard_day_active.md`
- Tokens: harvested from `src/screens/Home/Home.tsx`, `src/screens/Home/homestyles.ts`, `src/blocks/PracticeCardBlock.tsx`

## The scaffold (already built — don't touch unless rendering is broken)
`src/extensions/moments/new_dashboard/index.tsx`

This file is isolated. Nothing in the app currently imports it. Follow the 3 steps below.

---

## Wire-up (3 steps, ~25 min)

### Step 1 of 3 — Register the new container
Open: `/Users/paragbhasin/kalpx-app-rn/allContainers.js`

Alongside the other top-level containers, ADD:

```javascript
{
  container_id: "companion_dashboard_v3",
  states: {
    day_active: {
      blocks: [
        { type: "new_dashboard_body" },
      ],
    },
  },
},
```

(Internally the body block renders the entire dashboard layout — embeds are composed inside `NewDashboardContainer`, so this is a one-block container.)

Save.

### Step 2 of 3 — Teach BlockRenderer the new block
Open: `/Users/paragbhasin/kalpx-app-rn/src/engine/BlockRenderer.tsx`

At the top, with the other imports, ADD:
```typescript
import NewDashboardContainer from "../extensions/moments/new_dashboard";
```

Before the `default:` in the `switch (block.type)`, ADD:
```typescript
case "new_dashboard_body":
  return <NewDashboardContainer block={block} screenData={screenData} />;
```

Save.

### Step 3 of 3 — Route the v3 flag
Open: `/Users/paragbhasin/kalpx-app-rn/src/screens/Home/Home.tsx`

Find `navigateToMitra(true)` (the resume-journey path). Replace the two lines that dispatch the dashboard load with a flag-gated variant. Exact 2-line change:

```typescript
// before
const target = "companion_dashboard";
loadScreenWithData({ container_id: target, state_id: "day_active", ... });

// after
const target = process.env.EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD === "1"
  ? "companion_dashboard_v3"
  : "companion_dashboard";
loadScreenWithData({ container_id: target, state_id: "day_active", ... });
```

(Your exact call site may differ — search for `companion_dashboard` in Home.tsx and flag that single string.)

Save.

---

## Backend fields required per embed

The new dashboard renders each embed only when its backend flag is present. Coordinate with backend to ensure these are emitted for v3 users:

| Embed | Required `screenData` field |
|---|---|
| PersonalGreetingCard | `greeting_context` (+ optional `user.first_name`, `greeting_ctas`) |
| PathMilestoneBanner | `path_milestone` |
| DayTypeChip | `day_type` |
| StreakPill | `streak_count` |
| FocusPhraseLine | `focus_phrase` |
| CoreItemsList (triad) | `core_items` or `triad_items` |
| WhyThisL1 chip row | `why_this_l1_items` (array) |
| PredictiveAlertCard | `predictive_alert` |
| EntityRecognitionCard | `entity_card` |
| GratitudeSignalCard | `gratitude_card` |
| SeasonSignalCard | `season_card` |
| PostConflictMorningCard | `post_conflict` |
| ContinuityMirrorCard | `continuity_card` |

⚠️ Backend may not yet emit all of these. Each embed gracefully renders null when its field is absent — safe to ship partially populated.

---

## How to test

### Option A — Deep link (dev build only)
```bash
xcrun simctl openurl booted kalpx://mitra/companion_dashboard_v3/day_active
```
Requires the dev deep-link handler (commits `bb5ca01`+`e7cfaf4`).

### Option B — Flag toggle (real user flow)
1. Set `EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD=1` in `.env` and reload.
2. Cold launch → log in as a test user with an active journey → dashboard auto-loads → v3 layout renders.
3. Unset the flag and reload → Apr-11 dashboard renders. Both work.

Both flows must pass before merge.

---

## If something goes wrong

| Symptom | Likely missed step |
|---|---|
| Blank dashboard | Step 1 (container/state not registered) |
| "Unknown block type: new_dashboard_body" | Step 2 (BlockRenderer case missing) |
| v3 flag on but Apr-11 still loads | Step 3 (Home.tsx flag not wired) |
| Embed section blank despite backend emitting | `screenData` field name mismatch — see table above |
| TS error | Import path typo or LinearGradient not installed (already in project) |

---

## When done

- ONE commit: `feat(moment): wire new_dashboard (companion_dashboard_v3/day_active)`
- Do NOT push. Request review — this is a larger change than a single embed.
- Keep the Apr-11 dashboard reachable for 1+ release cycles; do not delete until the v3 flag is default-on for all users.

## Must-not-do

- Do not modify `companion_dashboard` (the Apr-11 one). The whole point of this scaffold is coexistence.
- Do not inline-edit the embed scaffolds — if an embed renders wrong, fix IT, not this container.
- Do not wire this PR together with single-embed PRs — ship as one cohesive "v3 dashboard" PR.
