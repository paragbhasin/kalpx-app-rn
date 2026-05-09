# KalpX Mitra Experience — Developer Handoff

**Last updated:** 2026-05-09  
**Status:** Based on code as it exists on `dev`. Covers flows shipped or in active development. Does not claim behavior not verified in code.

---

## 1. Purpose

This document gives an incoming developer full orientation to the KalpX Mitra user experience: what is built, how flows connect, which files matter, which flags are required, what is stable, and what is still pending. It is a reference guide, not a plan.

Scope: 4-Door Home, Inner Path (14-day journey), Daily Rhythm, Tell Mitra, Quick Reset, Quick Check-in, Rooms (including the Guided Room experience), Room handoff and return continuity, telemetry/outcome tracking, and all related feature flags.

For environment variable and flag reference, see: `docs/feature-flags-and-env.md` (this repo) and the canonical guide at `KalpX/docs/feature-flags-and-env.md`.

---

## 2. Product Mental Model

Mitra is a Sanatan-rooted daily companion, not a chatbot or a menu. Everything in the experience is oriented around the user's current inner state.

**The user's journey through Mitra:**

```
User opens Mitra
→ Four Doors / Dashboard (home)
→ chooses path:
     Daily Rhythm (My Rhythm)     — committed practice triad
     Inner Path                   — 14-day guided journey
     Tell Mitra                   — conversational context intake
     Quick Reset                  — one mantra, right now
     Quick Check-in               — prana state acknowledgment
     Rooms                        — guided inner spaces
→ backend returns state / action / context
→ frontend renders action (runner, inquiry, teaching, etc.)
→ telemetry + outcome logged
→ user returns with continuity (return card, prior context, bridge line)
```

**Key product rules that inform every engineering decision:**

- Rooms are guided spaces, not menus. They have a recommended starting action.
- Tell Mitra collects context progressively. It should not ask broad life-context questions once that context is already known.
- A user who says "I feel heavy" is not looking for a chatbot response; they need routing to a room.
- The goal is: feeling/state → context → support need → room/action → reflection/return.
- No raw user text is stored in plaintext anywhere in logs, API responses, or traces.

---

## 3. High-Level Architecture

### Backend (Django / DRF)
- **Repo:** `~/KalpX`
- **Settings:** `kalpx/settings/dev.py` (dev), `kalpx/settings/prod.py` (prod)
- **Feature flags:** `core/feature_flags.py` — all flags, all `os.environ.get()` based
- **Primary app:** `core/` — all Mitra models, views, services
- **Rooms subsystem:** `core/rooms/` — views, telemetry, reflection
- **Tell Mitra:** `core/tell_mitra_view.py` (single file, ~2565 lines)
- **Journey home:** `core/journey_home.py` + `core/journey_v3/`
- **URL patterns:** `core/urls.py`
- **Tests:** `core/tests_tell_mitra.py` (201 tests), `core/tests/` (rooms, journey, etc.)
- **Management commands:** `core/management/commands/`

### Web (React / Vite)
- **Repo:** `~/kalpx-app-rn/apps/web`
- **Tell Mitra page:** `src/pages/mitra/TellMitraPage.tsx`
- **Room guided section:** `src/components/blocks/room/RoomGuidedSection.tsx`
- **Action executor:** `src/engine/actionExecutor.ts`
- **API client:** `src/engine/mitraApi.ts`
- **Env vars:** accessed only through `src/lib/env.ts` → `WEB_ENV` object

### Mobile (Expo / React Native)
- **Repo:** `~/kalpx-app-rn/apps/mobile`
- **Tell Mitra container:** `src/containers/TellMitraContainer.tsx`
- **Four-Door home:** `src/containers/FourDoorHomeContainer.tsx`
- **Dashboard (v3):** `src/containers/NewDashboardContainer.tsx`
- **Room container:** `src/containers/RoomContainer.tsx`
- **Room guided section:** `src/blocks/room/RoomGuidedSection.tsx`
- **Action executor:** `src/engine/actionExecutor.ts`
- **Navigation:** `src/Shared/StackNavigator.tsx`

### Shared Packages
- **`packages/types`** — TypeScript types: `RoomId`, `RoomRenderV1`, `TellMitraConversationItem`, `TellMitraFollowupMeta`, `TellMitraRoomEntryContext`, `RoomEntryContext`, `ActionEnvelope`
- **`packages/contracts`** — Runtime constants: `CHIP_SUBMIT_TEXT`, `ROOM_GUIDED_COPY`, `ROOM_REFLECTION_OPTIONS`, `getRoomRenderParamsFromEntryContext`

---

## 4. Feature Flags Required

Full reference: `KalpX/docs/feature-flags-and-env.md`

### Backend flags (runtime, env vars, container restart required to change)

| Flag | Required For | Default | Dev | Prod | Notes |
|---|---|---|---|---|---|
| `MITRA_V3_HOME_ENABLED` | 4-Door Home endpoint | off | ON | unknown — verify | Gates GET /api/mitra/journey/home/ |
| `MITRA_V3_TELL_MITRA_ENABLED` | Tell Mitra endpoint | off | ON | unknown — verify | Gates POST /api/mitra/v3/tell-mitra/ |
| `MITRA_V3_TELL_MITRA_LEARNING` | Decision trace capture | off | ON | unknown — verify | No user-visible effect; trace-only |
| `MITRA_V3_TELL_MITRA_STORE_NORMALIZED_TEXT` | Stores normalized text in traces | off | OFF | OFF | S0 required; privacy-sensitive |
| `MITRA_V3_TELL_MITRA_LLM_EXTRACT` | LLM extractor for Tell Mitra | off | OFF | OFF | S0 required; pending dev smoke |
| `MITRA_ROOMS_V31` | All room features | off | ON | unknown — verify | Global room gate; required for all below |
| `MITRA_ROOM_GUIDED` | Guided room experience | off | ON | unknown — verify | recommended_first_action_id, /reflect/, room_steps |
| `MITRA_CURATED_ROOMS` | Curated room selector | off | ON | ON | Stage 1; replaces broad scoring |
| `MITRA_CURATED_DASHBOARD_WHY_THIS` | Curated why-this on dashboard | off | ON | ON | Stage 1 |
| `MITRA_CURATED_EXPOSURE_TRACKING` | MitraUserExposure writes | off | ON | unknown — verify | Audit/freshness tracking |
| `MITRA_V3_REASONING` | M1 Reasoning Backbone | off | ON | ON | Prerequisite for M1.5+ flags |
| `MITRA_V3_STRATEGY` | M3 Strategy Engine | off | ON | unknown — verify | |

### Web flags (build-time, VITE rebuild + S3 deploy + CloudFront invalidation required)

| Flag | Required For | Default | Dev Build | Prod Build |
|---|---|---|---|---|
| `VITE_MITRA_TELL_MITRA_THREAD_UI` | Tell Mitra thread UI | `0` | `1` (inject at build) | `0` (not yet approved) |

### Mobile flags (build-time, new EAS build required for production changes)

| Flag | Required For | Default | `.env` | `.env.local` | EAS prod |
|---|---|---|---|---|---|
| `EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD` | V3 dashboard | `0` | `1` | — | `1` |
| `EXPO_PUBLIC_MITRA_V3_ROOMS` | Rooms v3 UI | `0` | `1` | — | `1` |
| `EXPO_PUBLIC_MITRA_TELL_MITRA_THREAD_UI` | Tell Mitra thread UI | `0` | — | `1` | — (not yet in prod EAS) |

---

## 5. 4-Door / Mitra Home

### What the 4 doors are

| Door | Door ID | User Intent | Primary Action |
|---|---|---|---|
| My Rhythm | `my_rhythm` | Committed daily practice (mantra/sankalp/practice triad) | Navigate to RhythmHome |
| Inner Path | `inner_path` | 14-day guided journey | Navigate to InnerPath |
| Quick Reset | `quick_reset` | One mantra, right now | Navigate to QuickReset |
| Tell Mitra | `tell_mitra` | "Something is heavy / I need to figure this out" | Inline TellMitraContainer |

### Backend

**Endpoint:** `GET /api/mitra/journey/home/`  
**View:** `core/mitra_views.py:11297` → `journey_home()` → uses `core/journey_home.py`  
**Flag:** `MITRA_V3_HOME_ENABLED=1`

**Response shape:**
```json
{
  "response_type": "render_home | route_to_moment | fallback",
  "moment_id": null,
  "layout": "minimal_care",
  "headline": "...",
  "body_lines": ["..."],
  "primary_cta": null,
  "chips": [{ "id": "...", "label": "...", "action": {...} }],
  "meta": {
    "first_visit_today": true,
    "gap_days": 0,
    "today_path_intent": "...",
    "refetch_triggers": [...]
  }
}
```

### Web

Tell Mitra is rendered inline as a panel within the four-door layout. No separate Tell Mitra route exists in the web app at the 4-door level — it is embedded within the home/dashboard.

### Mobile

**File:** `apps/mobile/src/containers/FourDoorHomeContainer.tsx`  
**API call:** `mitraJourneyHomeV3()` → `GET /api/mitra/v3/journey/home/`  
**Navigation:**
- `my_rhythm` tap → `navigation.navigate('RhythmHome')`
- `inner_path` tap → `navigation.navigate('InnerPath')`
- `quick_reset` tap → `navigation.navigate('QuickReset')`
- `tell_mitra` → renders `<TellMitraContainer />` inline

**Shared contracts:** `DOOR_LABELS` in `packages/contracts/src/mitraFourDoor.ts`

### Known issues / pending
- The home endpoint uses `decide_moment()` with 14 context signals for moment selection — this is distinct from the 4-door card layout. The relationship between `decide_moment` responses and the 4-door UI rendering is partially abstracted and should be verified when modifying the home flow.

---

## 6. Dashboard / Return-User Experience

### Backend

**Primary daily view endpoint:** `GET /api/mitra/v3/journey/daily-view/`  
**Legacy endpoint:** `GET /api/mitra/today/` (deprecated, still active)  
**Morning briefing:** `GET /api/mitra/briefing-today/` (M3, gated by `MITRA_V3_STRATEGY`)

The daily-view returns the user's current journey triad (mantra/sankalp/practice), completion state, insights (streak, consistency), and arc state. It does not return a structured "morning/midday/night" breakdown — that is a future capability.

**CompanionState model** (`core/models.py:6571`) drives return-user personalization:
- `last_reported_mood` — user's last prana check-in state
- `last_volatility_index` — emotional volatility (decays over 28 days)
- `active_dissonance` — up to 5 active emotional threads
- `recent_support_summary` — 14-day retention, 500 char max
- `life_context` — last explicit life domain picker selection
- `preferred_guidance_mode` — universal / hybrid / rooted

### Web

Dashboard is accessed via the main Mitra layout. Tell Mitra return cards appear when a user re-opens Tell Mitra after having entered a room.

### Mobile

**File:** `apps/mobile/src/containers/NewDashboardContainer.tsx`  
**Flag:** `EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD=1`  
**Data fetch:** `mitraJourneyDailyView(lastEtag)` — ETag-aware, fires on screen focus  
**Blocks rendered:** GreetingCard, FocusPhraseLine, TriadCardsRow (mantra/sankalp/practice), WhyThisModal, CycleProgressBlock, SankalpCarryBlock, Intelligence Cards (max 2: ContinuityMirrorCard, ResilienceNarrativeCard, PredictiveAlertCard, EntityRecognitionCard), QuickSupportBlock, AdditionalItemsSectionBlock

**Room continuation:** Shown via `SupportReturnModal` when `sd.dashboard_return_modal` is populated (injected by backend when user exits a room).

### Known gaps
- CompanionRhythm model exists (`core/models.py:2951`) but is not yet integrated into the daily view response. The "My Rhythm" morning/midday/night slot structure is partially designed but not fully implemented.

---

## 7. Inner Path / 14-Day Journey

### Product purpose

A 14-day guided practice cycle with a locked triad of one mantra, one sankalp, and one practice. The user commits to this triad for the full cycle with a day-7 checkpoint (continue/lighten/abandon) and a day-14 evolution decision.

### Backend

**Journey creation:** `POST /api/mitra/generate-companion/` (`core/mitra_views.py:2003`)  
**Daily view:** `GET /api/mitra/v3/journey/daily-view/`  
**Day 7 checkpoint:** `GET /api/mitra/journey/checkpoint/7` + `POST /api/mitra/journey/checkpoint/7/submit`  
**Day 14 checkpoint:** `GET /api/mitra/journey/checkpoint/14` + `POST /api/mitra/journey/checkpoint/14/submit`  
**Triad selection:** `select_content_for_journey()` in `core/content_engine.py:200`

**Models:**
| Model | Purpose | Key fields |
|---|---|---|
| `Journey` | One per 14-day cycle | `cycle_type`, `total_days`, `status`, `start_date_local`, `cycle_mantra_id`, `cycle_sankalp_id`, `cycle_practice_id` |
| `JourneyDay` | One per day per journey | `day_number`, `date_local`, `status` (pending/in_progress/complete), `completion_rule` |
| `JourneyDayItem` | Assigned items per day | `item_type`, `item_id`, `source`, `is_required` |
| `JourneyActivity` | Per-activity log | `activity_type`, `item_type`, `item_id`, `event_name`, `performed_at`, `meta` |

**Day 7 decisions:**
- `continue` → journey stays active, no changes
- `lighten` → `journey.lightened=True`, completion_rule for days 8–14 changes to `any_one` (any one core item counts)
- `reset` → `journey.status = "abandoned"`

**Day 14 decisions:**
- `continue_same` → new Journey row, same triad, `cycle_number += 1`
- `deepen` → new Journey with `cycle_deepen_item_type`/`cycle_deepen_item_id` added
- `change_focus` → journey closed, `path_lineage` snapshot saved, user selects new focus

**Completion tracking:**
- `JourneyDay.status = "complete"` when its `completion_rule` is satisfied by `JourneyActivity` records
- `completion_rule` values: `all_required`, `by_type` (one of each type), `any_one` (lightened mode)

### Mobile screens

| Screen | File |
|---|---|
| Inner Path home | `apps/mobile/src/screens/Mitra/InnerPathScreen.tsx` |

### Known gaps
- Web Inner Path UI surface is not documented in detail here — verify current state in `apps/web/src/pages/` before modifying.

---

## 8. Daily Rhythm / Daily Companion

### Product purpose

The "My Rhythm" door gives users access to their daily triad (mantra/sankalp/practice) and, in future, a morning/midday/night structure with reminders.

### Current implementation status

**What is implemented:**
- `GET /api/mitra/v3/journey/daily-view/` returns today's triad items, completion flags, streak, and insights
- `CompanionRhythm` model exists in `core/models.py:2951` with `status` (draft/active/paused) and `reminder_preference` (yes/no/later)

**What is NOT yet implemented:**
- Distinct morning/midday/night slot structure is not in the API response
- CompanionRhythm is not yet actively populated by the daily view builders (test flag gates the feature per `test_home_v3.py:302`)
- Reminder/notification dispatch is gated by `reminder_preference` and `already_sent_today()` but the full notification flow has a known pending frontend default bug (`POST_ROOM_CONTINUITY_PUSH_ENABLED`)

### How Daily Rhythm differs from Inner Path

| | Daily Rhythm (My Rhythm) | Inner Path |
|---|---|---|
| Duration | Ongoing | Fixed 14-day cycle |
| Triad | Selected daily or from active journey | Locked at cycle start |
| Engagement tracking | Streak + completion rate | JourneyDay completion_rule |
| Checkpoints | None | Day 7 and Day 14 |
| Reminders | CompanionRhythm.reminder_preference | Not applicable |

### Mobile screen

`apps/mobile/src/screens/Mitra/RhythmHomeScreen.tsx`

---

## 9. Tell Mitra

### 9.1 Product behavior

Tell Mitra is a guided conversational intake. It collects context progressively:

1. **Broad intent** — what kind of support the user needs (distress, seeking clarity, wanting ritual, etc.)
2. **Life context** — which domain the issue is in (work_career, relationships, health_energy, money_security, purpose_direction, self, daily_life)
3. **Specific context** — granular situation (e.g., "workload", "disconnected", "sleep_deprived")
4. **Support need** — derived classification that drives room selection (e.g., "stabilize_only", "decision_clarity")
5. **Room routing** — once enough context exists, routes to a room

Tell Mitra should not ask broad life-context questions once that context is already known (from prior event, chip tap, or companion state). It should feel like it remembers.

The chip flow is: broad prompt → user taps chip → specific-context prompt → user taps chip → room recommendation card.

Start Fresh intentionally resets context and allows the user to begin a new conversation.

### 9.2 Backend flow

**Endpoint:** `POST /api/mitra/v3/tell-mitra/`  
**File:** `core/tell_mitra_view.py`  
**Flag:** `MITRA_V3_TELL_MITRA_ENABLED=1`

**Request shape:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `text` | string | Yes | 1–1000 chars; error 400 if missing/empty/too long |
| `energy_state` | string or null | No | Optional; derived server-side if absent |
| `tz` | string | No | Defaults to "UTC" |
| `source_surface` | string | No | E.g. "tell_mitra_start_fresh", "room_completion", "tell_mitra_room_return" |
| `followup` | dict | No | Chip continuation: `{selected_value, selected_label, parent_tell_mitra_event_id, parent_intent_type, life_context}` |
| `reset_context` | bool | No | When true, skips prior context lookup |
| `room_entry_context` | dict | No | Fallback only; only `life_context` field trusted |

**Response shape (key fields):**

| Field | Type | Meaning |
|---|---|---|
| `suggested_action` | string | Routing: `navigate_to_room`, `ask_followup`, `provide_wisdom_inline`, `navigate_to_door`, `none` |
| `suggested_room_id` | string or null | Room to enter (e.g., `room_stillness`) |
| `secondary_room_id` | string or null | Alternate room for dual-pathway |
| `conversation_stage` | string | `immediate_support`, `first_listen`, `clarify_input`, `context_clarification`, `ready_for_room`, `door_navigation`, `wisdom_inline`, `none` |
| `followup_question` | dict or null | `{prompt, options[]}` — chip prompt for next turn |
| `support_need` | string | E.g. `stabilize_only`, `decision_clarity`, `release_weight`, `connection_support` |
| `specific_contexts` | list | All extracted specific contexts |
| `primary_specific_context` | string | First specific context |
| `pattern_key` | string or null | Unique signature for this conversation pattern |
| `tell_mitra_event_id` | UUID string | Event ID for correlation; absent on safety responses |
| `room_entry_context` | dict or null | Structured context for room render; present only when ready_for_room or immediate_support |
| `prior_context_summary` | string or null | Narrative of prior session context |
| `safety_flag` | bool | True if crisis phrase detected; no event created; no room_entry_context |
| `response_copy` | string | User-visible acknowledgment text |
| `intent_type` | string | Classified intent (distress_acute, distress_grief, distress_loneliness, distress_drained, seeking_clarity, seeking_growth, wanting_ritual, sharing_gratitude, asking_reflection, preparing_event, seeking_question, unknown) |
| `state_tags` | list | Mood/state tags extracted from text |
| `confidence` | float | Classification confidence 0.0–1.0 |

**Routing decision tree (simplified):**

```
Input text
→ safety_precheck() — crisis phrases → return safety response, no event
→ _is_meaningful_input() — gibberish → clarify_input stage
→ _classify_intent() — keyword route_multi → AI fallback if no match
→ life_context resolution (chip > parent event > text extraction > companion state)
→ specific_context extraction (chip selection + text extraction, merged)
→ _derive_support_need() → support_need string
→ _decide_conversation_stage() → stage + support_depth + override_to_ask_followup
  - no life_context → first_listen (ask_followup)
  - no specific_context → context_clarification (ask_followup)
  - both known → ready_for_room (navigate_to_room)
  - calm_now chip → immediate_support (room_stillness)
→ _select_room_from_support_need() → (primary_room, secondary_room)
→ return response
```

**Key functions in `tell_mitra_view.py`:**
- `_classify_intent()` — multi-signal classifier
- `_decide_conversation_stage()` — stage/support_depth/override logic
- `_derive_support_need()` — support need rules via `_SUPPORT_NEED_RULES`
- `_select_room_from_support_need()` — `_ROOM_BY_SUPPORT_NEED` table lookup
- `_is_meaningful_input()` — Layer 1 gibberish check
- `_is_immediate_support_request()` — calm_now / urgent phrases
- `_safety_precheck()` — regex scan for self-harm/crisis phrases
- `_get_followup_question()` — chip generation per intent/life_context/stage
- `_normalize_input_with_events()` — Hinglish normalization
- `_is_session_continuation()` — prior context activation

**Support need → room mapping (`_ROOM_BY_SUPPORT_NEED`):**

| support_need | Primary room | Secondary room |
|---|---|---|
| `stabilize_only` | room_stillness | none |
| `stabilize_then_clarify` | room_stillness | room_clarity |
| `release_weight` | room_release | room_clarity |
| `decision_clarity` | room_clarity | room_release |
| `connection_support` | room_connection | room_clarity |
| `growth_direction` | room_growth | none |
| `understand_context_first` | none | none |

**chip routing (return-card chips):**

| Chip value | Routes to |
|---|---|
| `more_steady` | provide_wisdom_inline (no room) |
| `still_heavy` | parent secondary_room or room_stillness |
| `need_clarity` | room_clarity |
| `continue_room` | parent suggested_room |

### 9.3 Frontend thread UI

**Thread UI is controlled by:**
- Web: `VITE_MITRA_TELL_MITRA_THREAD_UI=1` → `WEB_ENV.tellMitraThreadUi === "1"` → `THREAD_UI_ENABLED`
- Mobile: `EXPO_PUBLIC_MITRA_TELL_MITRA_THREAD_UI=1` → `process.env.EXPO_PUBLIC_MITRA_TELL_MITRA_THREAD_UI === "1"` → `THREAD_UI_ENABLED`

When `THREAD_UI_ENABLED = false`: original single-result card UI with screen states.  
When `THREAD_UI_ENABLED = true`: scrollable conversation thread with persistent composer.

**Conversation item types** (`TellMitraConversationItem` union, `packages/types/src/mitraFourDoor.ts`):

| Type | When added | Key fields |
|---|---|---|
| `user_message` | User submits text | `text` |
| `user_chip` | User taps chip | `label`, `value` |
| `mitra_response` | Every non-safety response | `response_copy`, `prior_context_summary`, `conversation_stage`, `support_depth` |
| `followup_chips` | `followup_question` present in response | `prompt`, `options[]`, `parent_tell_mitra_event_id`, `parent_intent_type` |
| `room_recommendation` | `suggested_action = navigate_to_room` + valid room_id | `room_id`, `room_label`, `room_entry_context`, `tell_mitra_event_id` |
| `wisdom_options` | `next_options` array present | `next_options[]` |
| `return_card` | Returning from a room | `room_id`, `room_label`, `return_key`, `room_entry_context` |
| `safety` | `safety_flag = true` | `response_copy` |
| `loading` | While API request in flight | — |
| `error` | Exception or network failure | `message` |

**`activeContextRef` fields (persists across chip turns within a session):**

| Field | Purpose |
|---|---|
| `parentEventId` | `tell_mitra_event_id` from last response |
| `parentIntentType` | `intent_type` from last response |
| `lifeContext` | `life_context` extracted from last response |
| `supportNeed` | `support_need` from last response |
| `patternKey` | `pattern_key` from last response |
| `roomEntryContext` | Full `room_entry_context` from last navigate_to_room response |

**Session / local storage keys:**
- `tell_mitra_thread_v1` — serialized conversation array (survives page reload)
- `tell_mitra_return_room_v1` — return room metadata when user is inside a room

**Chip payload contract (`TellMitraFollowupMeta`):**

```typescript
{
  selected_value: opt.value,                  // exact chip value from backend options[]
  selected_label: opt.label,                  // display label
  parent_tell_mitra_event_id: <from chipGroup or activeContextRef>,
  parent_intent_type: <from chipGroup or activeContextRef>,
  life_context: <from return_card or activeContextRef>,
}
```

The `selected_value` is echoed verbatim to the backend — it must match exactly what the backend sent in `followup_question.options[].value`.

**`CHIP_SUBMIT_TEXT`** (`packages/contracts/src/mitraFourDoor.ts`): maps chip values to the free-text string sent as `text` for chip taps (e.g., `"overwhelmed"` → `"I am feeling overwhelmed right now"`).

**Start Fresh behavior:**
1. Clears conversation array
2. Clears composer text
3. Resets `activeContextRef` all fields to null
4. Clears both session storage keys
5. Sets `source_surface = "tell_mitra_start_fresh"` on next submit

**Room handoff (handleEnterRoom):**
1. Writes to `tell_mitra_return_room_v1` session storage: `{room_id, room_label, tell_mitra_event_id, room_entry_context, timestamp, return_key}`
2. Dispatches `enter_room` action to `actionExecutor`
3. On return: reads session storage, appends `return_card` item to conversation

### 9.4 Files

| Layer | File | Purpose |
|---|---|---|
| Backend | `core/tell_mitra_view.py` | Entire Tell Mitra backend (endpoint + all helpers) |
| Backend | `core/tests_tell_mitra.py` | 201 tests |
| Backend | `core/management/commands/tell_mitra_matrix_smoke.py` | Deterministic chip routing smoke test |
| Backend | `core/management/commands/tell_mitra_outcome_intelligence_report.py` | Outcome report |
| Backend | `core/management/commands/tell_mitra_room_outcomes_report.py` | Room outcome report |
| Web | `apps/web/src/pages/mitra/TellMitraPage.tsx` | Web Tell Mitra page component |
| Web | `apps/web/src/engine/mitraApi.ts` | `postTellMitraV3()` API call |
| Mobile | `apps/mobile/src/containers/TellMitraContainer.tsx` | Mobile Tell Mitra container |
| Shared | `packages/types/src/mitraFourDoor.ts` | `TellMitraConversationItem`, `TellMitraFollowupMeta`, `TellMitraRoomEntryContext` |
| Shared | `packages/contracts/src/mitraFourDoor.ts` | `CHIP_SUBMIT_TEXT`, `getRoomRenderParamsFromEntryContext` |

### 9.5 Known current issues

- **Temporary dev logs still present.** Tagged `[S17-D4B]`. Not removed yet. Located:
  - Web `TellMitraPage.tsx` lines ~196, ~209, ~375 (gated `WEB_ENV.isDev`)
  - Web `RoomGuidedSection.tsx` handleBegin (gated `WEB_ENV.isDev`)
  - Web `actionExecutor.ts` start_runner case (gated `WEB_ENV.isDev`)
  - Mobile `TellMitraContainer.tsx` lines ~276, ~289 (gated `__DEV__`)
  - Mobile `RoomGuidedSection.tsx` handleBegin (gated `__DEV__`)
  - These must be removed before production mobile release or production web deploy. They do not fire in production builds (Vite strips `import.meta.env.DEV` in prod; `__DEV__` is false in Expo release builds).
- **Thread state is not persisted server-side.** The conversation lives in session storage only. If the user clears browser data or switches devices, the thread is gone.
- **`EXPO_PUBLIC_MITRA_TELL_MITRA_THREAD_UI` is not in the EAS production profile.** Thread UI requires a new EAS production build to reach production mobile users.

---

## 10. Quick Reset

### Product purpose

A lightweight pause-and-refocus: one mantra with beads, approximately 3 minutes. Designed for users in a drained or agitated state who need an immediate anchor before doing anything else.

### How users reach it

- From the 4-door home: tap "Quick Reset" card
- Via routing from Quick Check-in: when `prana_type = "agitated"` or `"drained"`, prana-acknowledge endpoint returns a routing suggestion pointing to `quick_reset` door

### Backend

Quick Reset is **not a dedicated endpoint**. It is a routing destination. The content is delivered by `POST /api/mitra/prana-acknowledge/` (`core/mitra_views.py:2772`) via its routing decision:

```json
{
  "action": "quick_reset",
  "room_id": "room_stillness",
  "urgency": "high"
}
```

Content: `select_items(context, "mantra", count=1, exclude_ids=...)` returns one mantra from the user's triad or library. Subtitle: "Pause and breathe. One mantra with beads."

### Completion tracking

No formal `JourneyActivity` type for Quick Reset. If the user completes the mantra, it may log as `activity_type="mantra", source="support"`. No dedicated Quick Reset completion event.

### Mobile screen

`apps/mobile/src/screens/Mitra/QuickResetScreen.tsx` (navigated to via `navigation.navigate('QuickReset')`)

### Return behavior

After the mantra, user returns to the origin screen (home or check-in flow). Quick Reset does not create a Tell Mitra event or room render log.

---

## 11. Quick Check-in

### Product purpose

Prana state acknowledgment. The user selects their current energy/mood state, and the system updates companion state, logs the event, and offers a routing suggestion for appropriate next support.

### Backend

**Endpoint:** `POST /api/mitra/prana-acknowledge/`  
**File:** `core/mitra_views.py:2772`

**Request:**
```json
{
  "pranaType": "balanced | energized | agitated | drained",
  "focus": "optional",
  "subFocus": "optional",
  "depth": "beginner | intermediate | advanced",
  "dayNumber": 1,
  "journeyId": "UUID",
  "tz": "Asia/Kolkata"
}
```

**State written:**
- `JourneyActivity(activity_type="checkin", source="support", meta={prana_type, suggestions_shown, focus, state_family})`
- `SupportSessionState(session_type="checkin", selected_state=pranaType, status="started")`
- `CompanionState` update: `last_reported_mood`, `last_volatility_index`, `last_volatility_index_updated_at`

**Routing decisions by prana_type:**
| prana_type | Routing |
|---|---|
| `balanced` | navigate to my_rhythm or inner_path (no support suggestions) |
| `energized` | same as balanced |
| `agitated` (severe) | quick_reset + room_stillness, urgency="high" |
| `agitated` (non-severe) | quick_reset + room_stillness, urgency="medium" |
| `drained` | gentle_reset + room_release |

### Mobile screen

`apps/mobile/src/screens/Mitra/QuickCheckinScreen.tsx`

### How it affects future recommendations

`CompanionState.last_reported_mood` influences continuity narrative and guidance tone in subsequent sessions. `last_volatility_index` decays over 14–28 days and affects severity classification in future support flows.

---

## 12. Rooms / Inner Rooms / Guided Experience

### Room concept

Rooms are guided inner spaces, not menus. Each room has a purpose, a recommended starting action, a "why this room" explanation, and a set of actions (practices, mantras, sankalps, teachings, inquiries). The Guided Room experience surfaces the recommended action prominently and walks the user through it with a Begin button.

### Current rooms

| Room ID | Label | Primary support_need | Secondary room |
|---|---|---|---|
| `room_stillness` | Find Calm | `stabilize_only`, `stabilize_then_clarify` | `room_clarity` |
| `room_clarity` | Find Clarity | `decision_clarity` | `room_release` |
| `room_release` | Set It Down | `release_weight` | `room_clarity` |
| `room_connection` | Feel Connected | `connection_support` | `room_clarity` |
| `room_growth` | Take the Next Step | `growth_direction` | none |
| `room_joy` | Notice What's Good | (joy/gratitude flows) | none |

Room IDs are defined as `ROOM_ID_CHOICES` in `core/models.py:8722` and as the `RoomId` type in `packages/types/src/room.ts`.

### Backend render endpoint

**Endpoint:** `GET /api/mitra/rooms/{room_id}/render/`  
**File:** `core/rooms/views.py:604` → `room_render_view()`  
**Flags required:** `MITRA_ROOMS_V31=1`; per-room flag `MITRA_ROOM_{ROOM_ID_UPPER}` (e.g., `MITRA_ROOM_STILLNESS=1`)

**Request params:**
- `life_context` — life domain (optional, personalizes content)
- `tell_mitra_event_id` — links render to Tell Mitra routing event
- `source_surface` — presentation context
- `intent_type`, `room_intent` — intent context for curation

**Response shape (key fields):**

```json
{
  "schema_version": "room.render.v1",
  "room_id": "room_stillness",
  "room_context": {
    "situation_acknowledgement_line": "...",
    "sanatan_insight_line": "...",
    "why_this_room_line": "...",
    "entry_context": {
      "recommended_first_action_id": "action-uuid",
      "recommended_first_action_title": "...",
      "recommended_first_action_description": "...",
      "secondary_room_id": "room_clarity",
      "support_need": "stabilize_then_clarify",
      "life_context": "relationships",
      "specific_contexts": ["disconnected"],
      "tell_mitra_event_id": "uuid"
    }
  },
  "actions": [
    {
      "action_id": "uuid",
      "label": "...",
      "action_type": "runner_mantra | runner_sankalp | runner_practice | inquiry | teaching | in_room_step | in_room_carry | exit",
      "action_family": "anchor | regulation | expression | teaching | inquiry | offering | exit",
      "runner_payload": {...},
      "inquiry_payload": {...}
    }
  ],
  "provenance": {
    "render_id": "uuid",
    "pool_id": "...",
    "pool_version": "..."
  },
  "room_steps": [...],
  "visit_state": "cold_start | repeat | seasoned"
}
```

`room_context.entry_context` is only populated when a `tell_mitra_event_id` is passed (or when the guided experience is active).  
`recommended_first_action_id`, `room_steps`, and the `/reflect/` endpoint are **all gated by `MITRA_ROOM_GUIDED=1`**.

### Recommended action selection

**Function:** `_pick_recommended_action()` in `core/rooms/views.py:187`

**Logic:**
1. If `support_need` present → consult `_SUPPORT_NEED_PREFERRED_FAMILY` for ordered action family preference
2. Else → fall back to `_ROOM_DEFAULT_ACTION_FAMILY` by room_id
3. Iterate actions, return first non-exit action matching the preferred family

**Preferred families by support_need:**
| support_need | Preferred families (in order) |
|---|---|
| `stabilize_only` | anchor, regulation |
| `stabilize_then_clarify` | anchor, regulation |
| `release_weight` | expression, anchor |
| `decision_clarity` | **inquiry**, anchor |
| `connection_support` | anchor, expression |
| `growth_direction` | teaching, **inquiry** |

`decision_clarity` prefers **inquiry** actions first — Begin button must handle the inquiry path.

### Action types in `actions[]`

| action_type | Has runner_payload | Has inquiry_payload | Begin behavior |
|---|---|---|---|
| `runner_mantra` | Yes | No | dispatch `start_runner`, variant=mantra |
| `runner_sankalp` | Yes | No | dispatch `start_runner`, variant=sankalp |
| `runner_practice` | Yes | No | dispatch `start_runner`, variant=practice |
| `inquiry` | No | Yes | dispatch `room_inquiry_opened` |
| `teaching` | No | No | teaching_payload |
| `in_room_step` | No | No | step_payload |
| `in_room_carry` | No | No | carry_payload |
| `exit` | No | No | exit flow |

### Begin button handling

**Web** (`apps/web/src/components/blocks/room/RoomGuidedSection.tsx`):
```typescript
if (actionType === 'inquiry') {
  onAction({ type: 'room_inquiry_opened', payload: { inquiry_payload, action_id, room_id, render_id } });
} else {
  // runner_* action
  const variant = rp.runner_kind || actionType.replace('runner_', '') || 'mantra';
  onAction({ type: 'start_runner', payload: { source: 'support_room', variant, item: rp, action_id } });
}
```

**Mobile** (`apps/mobile/src/blocks/room/RoomGuidedSection.tsx`):
```typescript
if (actionType === "inquiry") {
  executeAction({ type: "room_inquiry_opened", payload: { inquiry_payload, action_id, room_id, render_id } });
} else {
  executeAction({ type: "start_runner", payload: { source: rp.runner_source ?? "support_room",
    variant: (rp.runner_kind ?? actionType.replace("runner_", "")) || "mantra", item: rp, action_id } });
}
```

**Critical:** The `if (!runner_payload) return` guard that previously silently killed inquiry-type actions was removed in S17-D4B. Do not re-introduce this guard.

### Reflection endpoint

**Endpoint:** `POST /api/mitra/rooms/{room_id}/reflect/`  
**File:** `core/rooms/reflect_view.py:48`  
**Flags:** `MITRA_ROOMS_V31=1` AND `MITRA_ROOM_GUIDED=1`

**Request:** `{ "response_code": "...", "render_id": "uuid", "tell_mitra_event_id": "uuid" }`

**Valid response_codes** (in `packages/contracts/src/room.ts` → `ROOM_REFLECTION_OPTIONS`):
- room_stillness: `more_steady`, `still_restless`, `a_little_clearer`
- room_clarity: `one_thing_clearer`, `know_next_step`, `still_unclear`
- room_release: `lighter`, `still_heavy`, `released_a_little`
- room_connection: `less_alone`, `still_disconnected`, `remembered_someone`
- room_growth: `i_know_one_step`, `feel_ready`, `still_stuck`, `want_help_choosing`
- room_joy: `noticed_something_good`, `want_to_share_more`
- All rooms: `want_to_share_more` (Tell Mitra bridge)

### RoomRenderLog model

**File:** `core/models.py:8915`  
**Key fields:** `render_id` (UUID, unique), `user`, `room_id`, `tell_mitra_event` (FK to TellMitraEvent), `recommended_first_action_id`, `rendered_action_ids` (JSONField), `visit_state`, `life_context_applied`, `cold_start`, `created_at`

The `tell_mitra_event` FK links the room render directly to the Tell Mitra routing event — this is the linkage used by outcome reporting and return continuity.

### Telemetry events

Sent to `POST /api/mitra/rooms/telemetry/` (`core/rooms/telemetry_view.py`). All valid `event_type` values in `TELEMETRY_EVENT_TYPES`:

`room_render`, `pill_tap`, `runner_start`, `runner_abandon`, `runner_complete`, `selection_score`, `pool_rotation`, `room_welcome_viewed`, `why_this_viewed`, `recommended_action_started`, `recommended_action_completed`, `reflection_submitted`, `next_step_selected`, `room_exited`

### Known issues

- **`room_inquiry_opened` on mobile** (`core/rooms/actionExecutor.ts`): Currently logs telemetry only. The actual inquiry category picker sheet is a Phase 6 stub — it does not open a real UI component yet. Web handles it differently via `onAction` callback.
- `room_welcome_viewed` telemetry event: not confirmed as sent by current frontend on guided room entry. Verify before reporting as implemented.

---

## 13. Room Handoff and Return Continuity

### Tell Mitra → Room handoff

When Tell Mitra returns `suggested_action = "navigate_to_room"`:

1. Frontend appends `room_recommendation` item to conversation
2. User taps "Enter Room" / Begin
3. `handleEnterRoom()` writes to session storage (`tell_mitra_return_room_v1`):
   ```json
   { "room_id": "...", "room_label": "...", "tell_mitra_event_id": "uuid",
     "room_entry_context": {...}, "timestamp": 1234567890, "return_key": "unique-key" }
   ```
4. Dispatches `enter_room` action to `actionExecutor`
5. `actionExecutor` navigates to room render screen
6. Room render screen calls `GET /api/mitra/rooms/{room_id}/render/?tell_mitra_event_id=<uuid>&...`
7. `getRoomRenderParamsFromEntryContext()` (from contracts) flattens `room_entry_context` to query params; includes a mismatch guard that returns `{}` if `room_id` doesn't match `ctx.decision.suggested_room_id`
8. Backend links `RoomRenderLog.tell_mitra_event` FK

### Returning from room

1. User exits/completes the room
2. Mobile: `SupportReturnModal` shown if `sd.dashboard_return_modal` is populated
3. Web: `tell_mitra_return_room_v1` session storage is read on next Tell Mitra open; `return_card` item is appended

### Return card

A `return_card` item in the conversation is a persistent card that shows after returning from a room. It carries:
- `room_id`, `room_label`, `tell_mitra_event_id`, `room_entry_context`
- `return_key` — unique string used to prevent duplicate cards (`lastReturnCardKeyRef`)

### source_surface values

| Value | When used |
|---|---|
| `tell_mitra_page_web` | Standard web Tell Mitra submit |
| `tell_mitra_door` | Mobile Tell Mitra panel submit |
| `tell_mitra_followup_chip` | Chip tap (may vary) |
| `tell_mitra_start_fresh` | Start Fresh was tapped |
| `room_completion` | Submitting from room completion state |
| `room_reflected` | Submitting after room reflection |
| `room_exited` | Submitting after early exit from room |
| `room_return` | Returning user context |
| `tell_mitra_room_return` | Tell Mitra opened after a room session |
| `room_return_chip` | Return card chip tapped |

### What should NOT happen

- Broad life-context question (first_listen stage) asked again when life_context is already known in activeContextRef
- Duplicate `return_card` item appended to conversation on re-focus (prevented by `lastReturnCardKeyRef`)
- Empty `item: {}` dispatched to `start_runner` (runner_payload must be present before dispatch)
- `tell_mitra_event_id` exposed in any safety response

---

## 14. Telemetry, Outcomes, and Analytics

### Models

| Model | File | Purpose |
|---|---|---|
| `TellMitraEvent` | `core/models.py:9355` | Primary Tell Mitra routing event; encrypted user text |
| `TellMitraDecisionTrace` | `core/models.py:9410` | High-value routing audit trail (AI fallback, mixed-signal, Hinglish, prior context) |
| `RoomRenderLog` | `core/models.py:8915` | Every room render; linked to TellMitraEvent |
| `RoomTelemetryEvent` | `core/models.py:9096` | 14 room interaction event types |
| `RoomFeedback` | `core/models.py:9321` | Post-session mood (lighter/same/heavier), one per user/room/day |
| `EventLog` | `core/models.py:1006` | Generic event log; flexible `event_type` string + `event_data` JSON |
| `CompanionState` | `core/models.py:6571` | Per-user emotional state snapshot |
| `JourneyActivity` | `core/models.py:2838` | Per-item completion and system events |
| `SupportSessionState` | `core/models.py:6905` | Check-in session state (started/completed) |

### Outcome reporting commands

```bash
# Tell Mitra outcome intelligence report
docker exec kalpx-dev-web python manage.py tell_mitra_outcome_intelligence_report

# Room routing outcomes
docker exec kalpx-dev-web python manage.py tell_mitra_room_outcomes_report
```

### Guided room telemetry event flow

The intended telemetry sequence for a complete guided room session:

1. `room_render` — render completed (backend logs RoomRenderLog)
2. `room_welcome_viewed` — user sees the guided welcome screen
3. `why_this_viewed` — (optional) user expanded "Why this room"
4. `recommended_action_started` — user tapped Begin
5. `runner_start` or `room_inquiry_opened` — action began
6. `runner_complete` or `recommended_action_completed` — action finished
7. `reflection_submitted` — user submitted reflection response_code
8. `next_step_selected` — (optional) user chose a next action

### Privacy: what is intentionally NOT stored

- Raw user text is never stored in plaintext. `TellMitraEvent.text_encrypted` uses Fernet encryption.
- `TellMitraDecisionTrace.normalized_text` is blank unless `MITRA_V3_TELL_MITRA_STORE_NORMALIZED_TEXT=1` AND safety_flag is false.
- `TellMitraDecisionTrace.input_hash` is blank for safety events.
- `TellMitraEvent.allow_in_synthesis = False` on all rows — no AI synthesis of user text without explicit future approval.
- Safety events (`safety_flag=True`) create no TellMitraEvent row at all.
- `normalization_events["from"]` contains only predefined alias strings, never raw user text.

---

## 15. Shared Contracts and Types

| Contract / Type | File | Used by | Notes |
|---|---|---|---|
| `TellMitraConversationItem` | `packages/types/src/mitraFourDoor.ts` | Web TellMitraPage, mobile TellMitraContainer | Union of 10 item types |
| `TellMitraFollowupMeta` | `packages/types/src/mitraFourDoor.ts` | Chip payload sent to backend | Fields: selected_value, selected_label, parent_tell_mitra_event_id, parent_intent_type, life_context |
| `TellMitraRoomEntryContext` | `packages/types/src/mitraFourDoor.ts` | Session storage, room render params | Full context from Tell Mitra response |
| `TellMitraNextOption` | `packages/types/src/mitraFourDoor.ts` | wisdom_options item | label, description, action_type, room_id, door |
| `RoomId` | `packages/types/src/room.ts` | Room routing guards | `"room_stillness" \| "room_clarity" \| "room_release" \| "room_connection" \| "room_growth" \| "room_joy"` |
| `RoomEntryContext` | `packages/types/src/room.ts` | Room render params | tell_mitra_event_id, life_context, specific_contexts, recommended_first_action_id, secondary_room_id |
| `ActionEnvelope` (RoomRenderV1) | `packages/types/src/room.ts` | RoomGuidedSection props | Typed room render envelope |
| `CHIP_SUBMIT_TEXT` | `packages/contracts/src/mitraFourDoor.ts` | Web + mobile chip tap handler | Maps chip value → free-text string sent as `text` |
| `getRoomRenderParamsFromEntryContext` | `packages/contracts/src/mitraFourDoor.ts` | Web + mobile room entry | Flattens entry context to query params; includes mismatch guard |
| `ROOM_GUIDED_COPY` | `packages/contracts/src/room.ts` | RoomGuidedSection (web + mobile) | UI strings: begin, whyThisLabel, viewAllSteps, exitLabel, reflectionPrompt |
| `ROOM_REFLECTION_OPTIONS` | `packages/contracts/src/room.ts` | Reflection UI | Per-room response_code options |

---

## 16. Testing and Verification

### Backend tests

```bash
# Full Tell Mitra test suite (201 tests)
docker exec kalpx-dev-web python manage.py test core.tests_tell_mitra -v2

# Tell Mitra deterministic routing matrix smoke (requires active user with journey)
docker exec kalpx-dev-web python manage.py tell_mitra_matrix_smoke --user-id <id>

# Specific test class
docker exec kalpx-dev-web python manage.py test core.tests_tell_mitra.TellMitraFlagOffTests -v2
```

The matrix smoke command requires `--user-id` (int) of a user with an active Journey. It verifies every chip path against live routing logic without mocking the classifier.

### Web typecheck

```bash
cd /Users/paragbhasin/kalpx-app-rn/apps/web
npx tsc --noEmit 2>&1 | grep -v "node_modules"
```

### Mobile typecheck

```bash
cd /Users/paragbhasin/kalpx-app-rn/apps/mobile
npx tsc --noEmit 2>&1 | grep -v "node_modules"
```

### Web build with Tell Mitra thread UI

```bash
cd /Users/paragbhasin/kalpx-app-rn/apps/web
VITE_MITRA_TELL_MITRA_THREAD_UI=1 npx vite build --mode development
```

Then sync to S3 and invalidate CloudFront from dev EC2 (local IAM lacks CloudFront permission on dev distribution). See `KalpX/docs/feature-flags-and-env.md §8` for exact commands.

### Mobile: enabling thread UI locally

`EXPO_PUBLIC_MITRA_TELL_MITRA_THREAD_UI=1` must be set in `apps/mobile/.env.local`. Restart the Metro bundler after changing. A new EAS build is required to change this for production.

### Manual proof flows (minimal)

Before marking any Tell Mitra or Room change as complete, verify these three flows in the browser (dev.kalpx.com with flags on) and check console for `[S17-D4B]` logs:

1. Submit text → receive chips → tap chip → receive room recommendation card
2. Tap "Enter Room" → Begin button → runner or inquiry opens
3. Submit "Just help me calm down" → room_stillness recommended immediately

---

## 17. Manual QA Scenarios

| Scenario | Steps | Expected backend fields | Expected UI | Pass criteria |
|---|---|---|---|---|
| **A. Distress → relationships → disconnected → room_connection** | Submit "My relationship feels off" → tap "My relationships" chip → tap "Feeling disconnected" chip | `life_context=relationships`, `specific_contexts=["disconnected"]`, `suggested_action=navigate_to_room`, `suggested_room_id=room_connection` | room_recommendation card for room_connection | Card appears; Begin opens |
| **B. Distress → money → ongoing stress → room_stillness** | Submit "Money stress is getting to me" → tap "Money and finances" chip → tap "Ongoing stress" chip | `life_context=money_security`, `suggested_room_id=room_stillness` | room_recommendation card for room_stillness | Card appears; Begin opens |
| **C. Distress → money → future uncertainty → room_clarity** | Submit "I don't know if my job is safe" → tap money chip → tap "Future uncertainty" chip | `support_need=decision_clarity`, `suggested_room_id=room_clarity` | room_recommendation for room_clarity | Card appears; Begin opens |
| **D. Distress → health/energy → physically tired → room_stillness** | Submit "I am exhausted" → tap health chip → tap physically tired chip | `life_context=health_energy`, `suggested_room_id=room_stillness` | room_recommendation for room_stillness | Card appears |
| **E. Purpose/direction → no direction → room_clarity** | Submit "I feel lost about what I'm doing" → tap direction chip | `life_context=purpose_direction`, `suggested_room_id=room_clarity` | room_recommendation for room_clarity | Card appears |
| **F. Immediate support → room_stillness** | Submit "Just help me calm down" OR tap calm_now chip | `conversation_stage=immediate_support`, `suggested_room_id=room_stillness` | room_recommendation immediately (no additional chips) | No followup_chips before room card |
| **G. Enter room → Begin → runner opens** | Complete any flow to room_recommendation → tap Enter Room → tap Begin on a runner action | Begin handler dispatches start_runner; runner variant non-empty | Runner screen or mantra sheet opens | No silent failure |
| **H. Enter room → Begin → inquiry opens** | Reach room_clarity (decision_clarity support_need) → Begin on inquiry action | Begin handler dispatches room_inquiry_opened | Inquiry sheet or category picker opens (or telemetry-only stub on mobile) | No silent failure |
| **I. Complete room → reflection → return to Tell Mitra** | Complete a guided room action → tap reflect → choose a response_code → open Tell Mitra | Return card with correct room_id appears in conversation | return_card item visible | return_card appears; no duplicate on re-focus |
| **J. Return card → still_heavy → no broad reset** | After room_stillness → return card → tap "Still heavy" chip | `source_surface=room_return_chip`, `life_context` preserved, conversation_stage≠first_listen | No "What's on your mind?" broad prompt | Preserved context; secondary room recommendation |
| **K. Start Fresh → broad question allowed** | Complete a chip flow → tap Start Fresh → submit any text | `reset_context=true` OR `source_surface=tell_mitra_start_fresh`; no prior life_context fallback | first_listen stage reached; broad chips shown | Broad prompt appears as expected |
| **L. Safety phrase → safety response** | Submit "I want to hurt myself" | `safety_flag=true`, `suggested_action=none`, no `tell_mitra_event_id` | safety item in conversation; no room card; no chips | Crisis copy shown; no routing |
| **M. Gibberish → clarify** | Submit "asdfghjkl" or "jkjkjk" | `conversation_stage=clarify_input`, `intent_type=unknown` | clarify_input response copy; no chips | No room recommendation; no crash |

---

## 18. Deployment Notes

### Backend flag change (dev)
```bash
# Edit docker-compose.dev.yml to add/change env var, then:
ssh -i ~/KalpXKeyPairName.pem ubuntu@18.223.217.113
cd /opt/kalpx-dev/app/KalpX
git pull --ff-only origin dev
docker compose -f docker-compose.dev.yml -p kalpxdev down
docker compose -f docker-compose.dev.yml -p kalpxdev up -d --remove-orphans
docker restart kalpx-dev-nginx  # always after fresh up
```

### Web flag change (dev S3)
Any `VITE_*` flag change requires a full rebuild:
```bash
cd /Users/paragbhasin/kalpx-app-rn/apps/web
VITE_MITRA_TELL_MITRA_THREAD_UI=1 npx vite build --mode development
# Then S3 sync with 12 media excludes + CloudFront invalidation from dev EC2
# See KalpX/docs/feature-flags-and-env.md §8 for exact commands
```

### Mobile flag change
Any `EXPO_PUBLIC_*` flag change requires a new EAS build. For local development with Metro:
```bash
echo "EXPO_PUBLIC_MITRA_TELL_MITRA_THREAD_UI=1" >> apps/mobile/.env.local
# Restart Metro bundler
```

### Current dev state (as of 2026-05-09)
- Backend on `dev` branch: Tell Mitra, Rooms, Guided Experience, Room Reflection all deployed
- `MITRA_ROOM_GUIDED=1` confirmed on dev EC2
- Web: latest build includes thread UI with `VITE_MITRA_TELL_MITRA_THREAD_UI=1`
- Temporary `[S17-D4B]` dev logs active in web bundle (DEV-gated, do not fire on prod HTTPS)
- Mobile: thread UI available locally with `EXPO_PUBLIC_MITRA_TELL_MITRA_THREAD_UI=1` in `.env.local`; not in EAS prod profile

### Production caution
- `MITRA_V3_TELL_MITRA_LLM_EXTRACT`: do not enable on prod until dev smoke validation complete
- `MITRA_V3_TELL_MITRA_STORE_NORMALIZED_TEXT`: S0 approval required
- Thread UI (`VITE_MITRA_TELL_MITRA_THREAD_UI=1` on prod web, `EXPO_PUBLIC_` in EAS prod): not yet approved for production

---

## 19. Current Known Gaps / Open Items

| Gap | Layer | Status | Notes |
|---|---|---|---|
| `[S17-D4B]` dev logs still present | Web + Mobile | Open | In TellMitraPage.tsx (×3), RoomGuidedSection.tsx, actionExecutor.ts (web); TellMitraContainer.tsx (×2), RoomGuidedSection.tsx (mobile). Must be removed before production deploy. |
| Thread state not persisted server-side | Web + Mobile | By design (for now) | Conversation lives in session storage / Redux only. No server-side Tell Mitra history. |
| `EXPO_PUBLIC_MITRA_TELL_MITRA_THREAD_UI` not in EAS production | Mobile | Pending decision | New EAS build required to enable on production mobile |
| `room_inquiry_opened` mobile: no UI | Mobile | Stub (Phase 6) | Dispatches telemetry only; actual category picker not yet implemented |
| CompanionRhythm not integrated into daily view | Backend | Pending | Model exists, reminder_preference exists, but morning/midday/night slot structure not fully wired |
| `room_welcome_viewed` telemetry | Frontend | Unverified | Event type exists in backend; verify it is sent by guided room frontend on entry |
| `POST_ROOM_CONTINUITY_PUSH_ENABLED` frontend default | Backend | Open | Known bug in notification gate; see notification_gate_status.md in project memory |
| `MITRA_V3_TELL_MITRA_LLM_EXTRACT` dev validation | Backend | Pending | Cannot enable on prod until smoke test complete |
| Progression loop fix for real classifier outputs | Backend | Shipped on dev | Commit b87ffe5b: stops loop for distress_drained/loneliness/grief intents |
| Proof table from S17-D4B | Web | Pending | Dev proof flows not yet run; `[S17-D4B]` logs are in place for this verification |

---

## 20. Future Developer Rules

1. **Do not change Tell Mitra routing without running the matrix smoke.** `tell_mitra_matrix_smoke --user-id <id>` must pass after any change to `_ROUTING_TABLE`, `_SUPPORT_NEED_RULES`, `_ROOM_BY_SUPPORT_NEED`, or `_SUPPORT_NEED_PREFERRED_FAMILY`.

2. **Do not add a chip option unless it is mapped in both the frontend contract and the backend ontology.** A chip value must exist in `CHIP_SUBMIT_TEXT` (contracts), be a recognized value in `_LIFE_CONTEXT_KEYWORDS` or `_SELECTED_CONTEXT_TO_LIFE_CONTEXT`, and produce a deterministic routing result in the backend test suite.

3. **Do not add a room action type unless Begin handling supports it on both web and mobile.** The `handleBegin` function in both `RoomGuidedSection.tsx` files must have an explicit branch for any new `action_type`. Unhandled types silently do nothing.

4. **Do not add a feature flag or env var without updating `docs/feature-flags-and-env.md` and the relevant `.env.example`.** See the full golden rule in `docs/feature-flags-and-env.md`.

5. **Do not store raw user text unless explicitly approved.** All user text must be encrypted at rest (`text_encrypted`). No plaintext in logs, API responses, traces, or synthesis candidates.

6. **Do not mark a flow as fixed without response-shape-first proof and deterministic tests.** Wire payload proof (Network tab) + console log verification + at least one deterministic test case covering the fixed path.

7. **Keep frontend thread UI and backend progression logic in sync.** If the backend adds a new `conversation_stage`, the frontend must handle it (at minimum, not crash). If the frontend adds a new conversation item type, the backend must be able to produce the response fields it needs.

8. **Do not dispatch `start_runner` with `item: {}`** (empty object). Always verify `runner_payload` is present before dispatching. The `if (!runner_payload) return` guard was a known bug — do not re-introduce it for inquiry actions, but do keep it for runner actions.

9. **Do not re-introduce a broad life-context question after life_context is already established.** If `activeContextRef.lifeContext` is non-null, the backend should not return `conversation_stage = "first_listen"`. If it does, investigate the life_context fallback chain and the chip payload — do not paper over it in the frontend.
