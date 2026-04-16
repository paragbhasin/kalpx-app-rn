# Adding Mitra v3 Moments — Guide for Pavani

## Sadhana Yatra framework — read this first (2026-04-14)

Every moment in Mitra now lives inside the **Sadhana Yatra** spine. This is the unifying model that tells us WHEN a moment surfaces, WHY, and HOW it relates to every other moment. (The full framework doc is in Parag's local memory — ask him for the architecture summary if you need more context than the sections below provide.)

### The 4-stage diagnostic
Every user enters via a 4-stage conversation (onboarding today, daily check-in later):
- **Stage 0 — Path pick:** support (need help) vs growth (feel okay, want to grow)
- **Stage 1 — Where / What:** kosha (support) OR aliveness (growth)
- **Stage 2 — Movement:** vritti (support) OR aspiration (growth)
- **Stage 3 — Root / Fit:** klesha (support) OR preferred modality (growth)

These four signals plus `guidance_mode` compose a **recognition line** and select the user's **triad** (mantra / sankalp / practice).

### Two temporal layers
1. **Life phase** — stable over a 14-day cycle. Drives the triad.
2. **Daily state** — volatile, per session. Drives which moment surfaces today.

### What this means for wiring a moment
Before you add any new moment, answer:
1. Which **path** does it serve — support, growth, or both?
2. Which **framework cell** does it live in? (e.g. "support + anandamaya + asmita" = grief room)
3. Is it driven by **life phase** or **daily state**?
4. Does it depend on any diagnostic signal from onboarding (`primary_kosha`, `primary_vritti`, `primary_klesha`, `aliveness_state`, `aspiration`, `preferred_modality`)?

If you cannot name the cell, surface the question to Parag before building. A moment without a cell will drift.

### Onboarding shape (as of 2026-04-14)
`welcome_onboarding` container, 8 states:
- `turn_1` — greet
- `turn_2` — Stage 0 (path)
- `turn_3_support` | `turn_3_growth` — Stage 1
- `turn_4_support` | `turn_4_growth` — Stage 2
- `turn_5_support` | `turn_5_growth` — Stage 3
- `turn_6` — guidance mode picker
- `turn_7` — recognition (backend-composed, JS fallback via `MITRA_V3_RECOGNITION_BACKEND=0`)
- `turn_8` — triad reveal

Routing lives in `src/engine/actionExecutor.ts` → `onboarding_turn_response`. Chip-id → signal mapping is inline in that case. Chip labels are LOCKED per spec — do not paraphrase.

---

## API calls per onboarding turn

The onboarding flow has 8 turns. Turns 3/4/5/7/8 make backend calls (Option C — per-turn chip delivery). Turns 3/4/5 fetch chips + dynamic heading + sub_prompt from the backend; Turn 7 composes recognition; Turn 8 fetches the triad.

| Turn | What user sees | Backend call | Response | Stored in Redux draft |
|---|---|---|---|---|
| 1 | Mitra intro + returning/new | — | — | `is_returning` |
| 2 | Stage 0 path pick | — | — | `path` |
| **3** | Stage 1 chips | **GET `/api/mitra/onboarding/chips/?stage=1&lane=<path>&guidance_mode=<mode>`** | 5 or 6 chips + heading + sub_prompt | `stage1_choice` |
| **4** | Stage 2 chips | **GET `/api/mitra/onboarding/chips/?stage=2&lane=<path>&stage1_choice=<...>&guidance_mode=<mode>`** | 5–6 filtered chips + dynamic heading + sub_prompt | `stage2_choice` |
| **5** | Stage 3 chips | **GET `/api/mitra/onboarding/chips/?stage=3&lane=<path>&stage1_choice=<...>&stage2_choice=<...>&guidance_mode=<mode>`** | 5–6 style chips + dynamic heading + sub_prompt | `stage3_choice` |
| 6 | Mode picker (universal/hybrid/rooted) | — | — | `guidance_mode` |
| **7** | Recognition line | **POST `/api/mitra/onboarding/complete/`** with all 4 stage choices + mode + freeforms | `inference` + `recognition.line` + `bridges` + `stage_subtexts` + `triad_labels` + `dashboard_chrome` + `journey` + `triad: {triad_pending: true}` | `recognition_line`, `inference_snapshot`, `journey_id` |
| **8** | Triad reveal | **POST `/api/mitra/journey/start/`** with inference-derived signals | `mantra` + `sankalp` + `practice` + `focus_name` + `recommended_posture` + `sankalp_prefix_line` | `master_mantra`, `master_sankalp`, `master_practice` |

**5 backend calls during onboarding** (stages 1/2/3 chip delivery + complete + journey/start). Backend is the single source of chip truth; `allContainers.js` CSV tree is a now-unused fallback (FE will consume the new endpoint on its own rollout schedule).

### `GET /api/mitra/onboarding/chips/` — query-param spec

| Param | Required | Values |
|---|---|---|
| `stage` | yes | `1` \| `2` \| `3` |
| `lane` | yes | `support` \| `growth` |
| `stage1_choice` | if stage ≥ 2 | chip_id or full label (e.g. `work_career` or `Work feels heavy`) |
| `stage2_choice` | if stage == 3 | chip_id or full label |
| `guidance_mode` | optional | `universal` \| `hybrid` (default) \| `rooted` |

Response shape:

```json
{
  "stage": 2,
  "lane": "support",
  "mitra_message": "About work — what feels hardest right now?",
  "sub_prompt": "Name the vṛtti — the mental movement — that is loudest.",
  "chips": [
    { "id": "work_feels_hard", "label": "Work feels hard", "sort_order": 1 },
    { "id": "i_feel_stuck", "label": "I feel stuck", "sort_order": 2 }
  ],
  "open_input": { "placeholder": "Or say it in your words", "max_length": 180 },
  "mapping_version": "1.2.0"
}
```

All fields always present — never omit keys. Backend accepts BOTH chip_id values and full-label strings in `stage1_choice` / `stage2_choice`.

### Example payload — Turn 7 call

```
POST /api/mitra/onboarding/complete/
Headers: Content-Type: application/json, X-Guest-UUID: <uuid> (if guest)
Body: {
  "stage0_choice": "support",           // or "I need support right now"
  "stage1_choice": "mind",              // or full label "My mind won't settle"
  "stage2_choice": "replay",            // or full label "It keeps replaying"
  "stage3_choice": "grounding",
  "guidance_mode": "hybrid",
  "freeforms": {
    "stage1": null,
    "stage2": "I keep thinking about tomorrow's meeting",
    "stage3": null
  }
}
```

Backend accepts BOTH chip_id values and full-label strings. Translator is in `onboarding_inference.py`.

### FE handshake at Turn 6 → Turn 7

```js
// after mode pick at Turn 6
const resp = await mitraOnboardingComplete({
  stage0_choice, stage1_choice, stage2_choice, stage3_choice,
  guidance_mode, freeforms
});

// store in Redux for Turn 7/8 render
setScreenValue(resp.inference, "sadhana_yatra_inference");
setScreenValue(resp.recognition.line, "recognition_line");
setScreenValue(resp.recognition.body, "recognition_body");
setScreenValue(resp.recognition.cta, "recognition_cta_labels");
setScreenValue(resp.bridges, "onboarding_bridges");
setScreenValue(resp.stage_subtexts, "onboarding_subtexts");
setScreenValue(resp.triad_labels, "triad_labels");
setScreenValue(resp.dashboard_chrome, "dashboard_chrome");
setScreenValue(resp.journey, "journey_context");

// Render Turn 7
loadScreen({ container: "welcome_onboarding", state: "turn_7" });

// In parallel, fetch triad for Turn 8
const triad = await mitraJourneyStart({
  path: resp.inference.lane,
  primary_kosha: resp.inference.primary_kosha,
  primary_vritti: resp.inference.primary_vritti,
  primary_klesha: resp.inference.primary_klesha,
  life_context: resp.inference.life_context,
  support_style: resp.inference.support_style,
  intervention_bias: resp.inference.intervention_bias,
  aspiration: resp.inference.aspiration,
  preferred_modality: resp.inference.preferred_modality,
  guidance_mode
});

setScreenValue(triad.mantra, "master_mantra");
setScreenValue(triad.sankalp, "master_sankalp");
setScreenValue(triad.practice, "master_practice");
// triad.labels + triad.sankalp_prefix_line already in onboarding/complete response
```

## v1.2.0 `/onboarding/complete/` response shape (locked)

Every field below is ALWAYS present in the response — never omitted. Explicit `null` used for empty — FE never needs to check existence.

```json
{
  "inference": {
    "lane": "support | growth",
    "life_context": "work_career | health | relationship_home | money_responsibility | inner_state | work_career_thriving | home_thriving | inner_clarity | inner_steadiness | gratitude | transition_growth | null",
    "primary_kosha": "annamaya | pranamaya | manomaya | vijnanamaya | anandamaya | null",
    "secondary_kosha": "same | null",
    "primary_vritti": "replaying | worrying_ahead | ... | null",
    "primary_klesha": "avidya | asmita | raga | dvesha | abhinivesha | null",
    "vritti_candidates": ["..."],
    "klesha_candidates": ["..."],
    "support_style": "practical | calming | grounding | devotional | clarifying | quiet | uplifting | reflective",
    "intervention_bias": ["..."],
    "confidence": "float [0..1]",
    "why_this_internal": { "stage0_choice": "...", "stage1_choice": "...", "stage2_choice": "...", "stage3_choice": "...", "inferred_from": "..." },
    "mapping_version": "1.2.0"
  },
  "recognition": {
    "line": "str (composed 3-sentence recognition)",
    "body": "str (secondary paragraph — mode-adapted)",
    "cta": {
      "primary": "str (label — lane x mode adapted)",
      "secondary": "str (label — lane x mode adapted)"
    },
    "freeform_ack": "str | null (prepended to line if freeform was provided)",
    "mode_used": "universal | hybrid | rooted",
    "slots_used": { "...": "..." },
    "mapping_version": "1.2.0"
  },
  "bridges": {
    "post_stage0": "str (e.g. Okay. Let me help you locate where it's landing.)",
    "triad_opener": "str (e.g. Here is what I'm holding for you today.)"
  },
  "stage_subtexts": {
    "stage1": "str",
    "stage2": "str",
    "stage3": "str"
  },
  "triad_labels": {
    "mantra": "str",
    "sankalp": "str",
    "practice": "str"
  },
  "dashboard_chrome": {
    "heading": "str (day-aware)",
    "context_subheading": "str (life-context aware)"
  },
  "journey": {
    "journey_id": "str | null",
    "cycle_day": "int",
    "cycle_id": "str | null"
  },
  "triad": {
    "triad_pending": "bool",
    "reason": "call_journey_start_next | unauthenticated_or_no_journey | null",
    "mantra": "object | null",
    "sankalp": "object | null",
    "practice": "object | null",
    "sankalp_prefix_line": "str",
    "labels": { "...": "..." }
  }
}
```

FE rule of thumb: **read every field directly — no existence checks needed.**

---

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

### Tier 4 — v3 Dashboard shell (ship as ONE PR with Tier 2)

A new dashboard variant (`companion_dashboard_v3`) that assembles all Tier-2 embeds in the right slots, plus a new personal greeting card that lives at its top. Ships side-by-side with the Apr-11 dashboard, gated by a feature flag — **zero regression risk**.

Because `new_dashboard` composes every Tier-2 embed, wire Tier 2 FIRST (so each embed renders correctly in isolation), then ship Tier 2 + Tier 4 together as one cohesive "v3 dashboard" PR.

- `personal_greeting_card` (~15 min) — top-slot greeting with contextual CTAs. Also usable on unauthed Home or as a standalone `home_hub/main` container.
- `new_dashboard` (~25 min) — assembles greeting + all Tier-2 embeds into `companion_dashboard_v3/day_active`. See its README for the exact 3-step wire-up and the flag toggle in `Home.tsx`.

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

---

## Scaffold 22 — voice_on_every_screen (floating mic affordance)

- **What:** A floating mic button designed to sit adjacent to any input area. Per the Sadhana Yatra spec, the mic should be present on every conversational turn so the user can reply by voice at any time.
- **Status:** scaffold-only, NOT wired. Do not wire until voice-consent flow + recording pipeline are signed off.
- **Folder:** `src/extensions/moments/voice_on_every_screen/`
- **Spec:** no canonical spec yet — treat as vision-driven.

## Scaffold 21 — completion_return (added after the main 20)

- **What:** the "108 in. Kept." / "Held. Carry it into the day." / "Done. Notice what stayed." acknowledgment screen that appears right after a core practice completes. Pavani's Apr 13 redesign (premium light theme, glowing lotus at bottom, no auto-return timer).
- **Why separate:** it was extracted from Pavani's commits `b71bca9` + `dc0ce82` which could not be cherry-picked onto Apr 11 base because they modify a file that Week 3 introduced (and Week 3 is excluded from this branch).
- **Depends on:** Week 3 runner state machine fields (`runner_variant`, `runner_active_item`, `runner_source`, `runner_start_time`). Apr 11 runners may not set these — verify or stub before wiring.
- **Folder:** `src/extensions/moments/completion_return/` (includes `index.tsx` + `assets/mantra-lotus-3d.svg` 423KB)
- **Estimated wire time:** 15-25 min (longer than other Tier 1 scaffolds because you may need to also seed runner_variant in the active runner if not already set)
- **Spec:** `kalpx-frontend/docs/specs/mitra-v3-experience/screens/transient_completion_return.md`
- **Feature flag:** `MITRA_V3_COMPLETION_RETURN`
