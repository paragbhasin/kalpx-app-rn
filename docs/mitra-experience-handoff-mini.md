# KalpX Mitra Experience Handoff

**Last updated:** 2026-05-09 | **Source of truth:** code on `dev` branch  
**Full handoff:** `docs/mitra-experience-handoff.md` | **Flags reference:** `docs/feature-flags-and-env.md`

---

## 1. Snapshot

| Area | Status | Key files | Notes |
|---|---|---|---|
| Mitra Home / 4 Doors | Implemented | BE: `core/mitra_views.py:11297`, `core/journey_home.py` / Mobile: `FourDoorHomeContainer.tsx` | 4 doors: my_rhythm, inner_path, quick_reset, tell_mitra (inline) |
| Dashboard | Implemented | BE: `core/mitra_views.py` (today), `core/journey_v3/` / Mobile: `NewDashboardContainer.tsx` | ETag-aware daily-view fetch; morning/midday/night structure pending |
| Inner Path | Implemented | BE: `core/mitra_views.py`, `core/content_engine.py` / Mobile: `InnerPathScreen.tsx` | 14-day locked triad; day 7 + day 14 checkpoints |
| Daily Rhythm | Partial | BE: `core/journey_v3/views.py` / Mobile: `RhythmHomeScreen.tsx` | Daily-view API works; CompanionRhythm model exists but not integrated |
| Tell Mitra | Implemented | BE: `core/tell_mitra_view.py` / Web: `TellMitraPage.tsx` / Mobile: `TellMitraContainer.tsx` | Thread UI behind flag; 201 backend tests |
| Quick Reset | Implemented (routing only) | BE: `core/mitra_views.py:2772` (prana-acknowledge) / Mobile: `QuickResetScreen.tsx` | Not a dedicated endpoint — routing destination from prana-acknowledge |
| Quick Check-in | Implemented | BE: `core/mitra_views.py:2772` / Mobile: `QuickCheckinScreen.tsx` | prana-acknowledge: 4 states → routes + updates CompanionState |
| Rooms | Implemented | BE: `core/rooms/views.py` / Web: `RoomGuidedSection.tsx` / Mobile: `RoomContainer.tsx` | 6 rooms; guided experience gated by MITRA_ROOM_GUIDED |
| Room Return | Implemented | Web: `TellMitraPage.tsx` (sessionStorage) / Mobile: `TellMitraContainer.tsx` (activeContextRef) | return_card item in conversation; lastReturnCardKeyRef deduplication |
| Telemetry | Implemented | BE: `core/models.py` (TellMitraEvent, RoomTelemetryEvent, RoomRenderLog) | 14 room event types; outcome reports via management commands |

---

## 2. Product Flow Summary

Mitra is a Sanatan-rooted daily companion. Users enter through any of 7 paths; the system routes based on context:

```
User opens Mitra
→ chooses entry point (4 Doors / Dashboard / Tell Mitra / Quick Reset / Check-in / Rhythm / Inner Path)
→ backend returns context / action / room
→ frontend renders guidance / room / runner action
→ telemetry + outcome logged (RoomTelemetryEvent, TellMitraEvent, RoomRenderLog)
→ user returns with continuity (return_card / prior_context_summary / bridge_line)
```

**Key rules:**
- Tell Mitra moves users: feeling → `life_context` → `specific_context` → `support_need` → room
- Broad life-context question only when `life_context` is unknown. Never repeat it after context is established.
- Rooms are guided spaces, not menus. Each has a recommended starting action.
- Room return preserves context unless user taps Start Fresh.

---

## 3. Feature Flags

Full reference: `docs/feature-flags-and-env.md`

| Flag | Layer | Required for | Dev | Prod | Change requires |
|---|---|---|---|---|---|
| `MITRA_V3_HOME_ENABLED` | Backend | 4-Door home endpoint | ON | unknown — verify | Container restart |
| `MITRA_V3_TELL_MITRA_ENABLED` | Backend | Tell Mitra endpoint | ON | unknown — verify | Container restart |
| `MITRA_V3_TELL_MITRA_LEARNING` | Backend | Decision trace capture | ON | unknown — verify | Container restart |
| `MITRA_V3_TELL_MITRA_STORE_NORMALIZED_TEXT` | Backend | Stores normalized text in traces | OFF | OFF | S0 required |
| `MITRA_V3_TELL_MITRA_LLM_EXTRACT` | Backend | LLM extractor | OFF | OFF | S0 + dev smoke first |
| `MITRA_ROOMS_V31` | Backend | All room features | ON | unknown — verify | Container restart |
| `MITRA_ROOM_GUIDED` | Backend | Guided experience (recommended action, /reflect/) | ON | unknown — verify | Container restart |
| `MITRA_CURATED_ROOMS` | Backend | Curated room selector | ON | ON | Container restart |
| `MITRA_CURATED_DASHBOARD_WHY_THIS` | Backend | Curated why-this on dashboard | ON | ON | Container restart |
| `MITRA_CURATED_EXPOSURE_TRACKING` | Backend | MitraUserExposure writes | ON | unknown — verify | Container restart |
| `MITRA_V3_REASONING` | Backend | M1 Reasoning Backbone (prereq for most flags) | ON | ON | Container restart |
| `VITE_MITRA_TELL_MITRA_THREAD_UI` | Web | Thread UI (chips, room recommendation) | `1` (inject at build) | `0` (not approved yet) | Full Vite rebuild + S3 deploy |
| `EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD` | Mobile | V3 dashboard | `1` in .env | `1` (EAS prod) | New EAS build |
| `EXPO_PUBLIC_MITRA_V3_ROOMS` | Mobile | Rooms v3 UI | `1` in .env | `1` (EAS prod) | New EAS build |
| `EXPO_PUBLIC_MITRA_TELL_MITRA_THREAD_UI` | Mobile | Thread UI | `1` in .env.local only | not in EAS prod | New EAS build |

---

## 4. Main Flow Map

| Flow | User purpose | Backend endpoint | Web files | Mobile files | Data written |
|---|---|---|---|---|---|
| Mitra Home / 4 Doors | Entry hub; pick a door | `GET /api/mitra/journey/home/` | (inline in dashboard) | `FourDoorHomeContainer.tsx` | — |
| Dashboard | Return-user daily view | `GET /api/mitra/v3/journey/daily-view/` | — | `NewDashboardContainer.tsx` | ETag-cached Redux |
| Inner Path | 14-day journey | `POST /api/mitra/generate-companion/`, checkpoint endpoints | — | `InnerPathScreen.tsx` | Journey, JourneyDay, JourneyActivity |
| Daily Rhythm | Daily triad practice | `GET /api/mitra/v3/journey/daily-view/` | — | `RhythmHomeScreen.tsx` | JourneyActivity (completions) |
| Tell Mitra | Conversational intake → room routing | `POST /api/mitra/v3/tell-mitra/` | `TellMitraPage.tsx` | `TellMitraContainer.tsx` | TellMitraEvent, TellMitraDecisionTrace, CompanionState |
| Quick Reset | One mantra, right now | Routing output of prana-acknowledge | — | `QuickResetScreen.tsx` | JourneyActivity (optional) |
| Quick Check-in | Prana state acknowledgment | `POST /api/mitra/prana-acknowledge/` | — | `QuickCheckinScreen.tsx` | JourneyActivity, SupportSessionState, CompanionState |
| Rooms | Guided inner space | `GET /api/mitra/rooms/{room_id}/render/` | `RoomGuidedSection.tsx` | `RoomContainer.tsx`, `RoomGuidedSection.tsx` | RoomRenderLog, RoomTelemetryEvent |
| Room Return | Continuity after room | (linked via tell_mitra_event_id on re-open) | `TellMitraPage.tsx` | `TellMitraContainer.tsx` | return_card in conversation |

**Shared contracts/types:**
- `packages/types/src/mitraFourDoor.ts` — `TellMitraConversationItem`, `TellMitraFollowupMeta`, `TellMitraRoomEntryContext`
- `packages/types/src/room.ts` — `RoomId`, `RoomEntryContext`, `ActionEnvelope`
- `packages/contracts/src/mitraFourDoor.ts` — `CHIP_SUBMIT_TEXT`, `getRoomRenderParamsFromEntryContext`
- `packages/contracts/src/room.ts` — `ROOM_GUIDED_COPY`, `ROOM_REFLECTION_OPTIONS`

---

## 5. Tell Mitra

### What it does
- Guided conversational intake; collects `intent_type`, `life_context`, `specific_contexts`, `support_need`, `pattern_key`
- Asks broad life-context only when unknown
- Routes to room when context is sufficient
- Supports chip continuation across turns via `parent_tell_mitra_event_id`
- Supports **Start Fresh** (resets prior context, `source_surface = "tell_mitra_start_fresh"`)
- Supports **room return** continuity (return_card, prior_context_summary)

### Backend response fields

| Field | Meaning | Used by |
|---|---|---|
| `intent_type` | Classified intent (distress_acute, seeking_clarity, etc.) | Stage decision, room selection |
| `conversation_stage` | Where in the progression (first_listen, context_clarification, ready_for_room, immediate_support, etc.) | Frontend chip/response rendering |
| `followup_question` | `{prompt, options[]}` — chip prompt for next turn | Frontend followup_chips item |
| `suggested_action` | `navigate_to_room`, `ask_followup`, `provide_wisdom_inline`, `navigate_to_door`, `none` | Frontend routing |
| `suggested_room_id` | Primary room to enter | room_recommendation card |
| `secondary_room_id` | Alternate room | return_card still_heavy routing |
| `support_need` | Derived classification (stabilize_only, decision_clarity, etc.) | Room selection, recommended action |
| `specific_contexts` | List of granular contexts extracted | Room entry context |
| `pattern_key` | Unique pattern signature for this conversation | Telemetry, outcome tracking |
| `tell_mitra_event_id` | UUID; absent on safety responses | Room render linkage, chip continuation |
| `room_entry_context` | Full structured context for room render | Passed as query params to room endpoint |
| `safety_flag` | Crisis phrase detected; no room, no event_id | Safety item in conversation |
| `prior_context_summary` | Narrative of prior session | mitra_response display |

### Progression rules

| State | Expected behavior |
|---|---|
| `life_context` unknown | `first_listen` → broad life-context chip prompt |
| `life_context` known, `specific_context` unknown | `context_clarification` → specific-context chips |
| Both known | `ready_for_room` → room recommendation card |
| calm_now chip or phrase | `immediate_support` → room_stillness immediately |
| Start Fresh | `reset_context=true` → skip all prior context |
| Room return chip | Use `return_card` context; must NOT re-ask broad chips |

### Chip payload contract (`TellMitraFollowupMeta`)
```
{
  selected_value,              // echoed verbatim from options[].value — must match exactly
  selected_label,
  parent_tell_mitra_event_id,  // from chipGroup or activeContextRef.parentEventId
  parent_intent_type,          // from chipGroup or activeContextRef.parentIntentType
  life_context,                // from return_card entry_context or activeContextRef
}
```
`CHIP_SUBMIT_TEXT` maps chip values to the `text` field sent as the submission string.

### Session state (frontend)
| Storage | Key | What |
|---|---|---|
| sessionStorage (web) | `tell_mitra_thread_v1` | Serialized conversation array |
| sessionStorage (web) | `tell_mitra_return_room_v1` | Room metadata on enter_room |
| Redux (mobile) | `state.door.tellMitra.inputDraft` | Draft input across navigation |
| Ref (both) | `activeContextRef` | parentEventId, parentIntentType, lifeContext, supportNeed, patternKey, roomEntryContext |
| Ref (mobile) | `lastReturnCardKeyRef` | Prevents duplicate return cards |

### Key files

| Layer | File | Purpose |
|---|---|---|
| Backend | `core/tell_mitra_view.py` | Entire Tell Mitra backend (~2565 lines) |
| Backend | `core/tests_tell_mitra.py` | 201 tests |
| Backend | `core/management/commands/tell_mitra_matrix_smoke.py` | Chip routing smoke test |
| Web | `apps/web/src/pages/mitra/TellMitraPage.tsx` | Thread UI, submitThread, handleChipClickThread, handleEnterRoom |
| Web | `apps/web/src/engine/actionExecutor.ts` | `start_runner`, `room_inquiry_opened`, `enter_room` cases |
| Mobile | `apps/mobile/src/containers/TellMitraContainer.tsx` | Mobile thread UI, same logic as web |
| Shared | `packages/types/src/mitraFourDoor.ts` | `TellMitraConversationItem` (10 types), `TellMitraFollowupMeta` |
| Shared | `packages/contracts/src/mitraFourDoor.ts` | `CHIP_SUBMIT_TEXT`, `getRoomRenderParamsFromEntryContext` |

### Known current issues
- **`[S17-D4B]` dev logs still in code.** Locations: `TellMitraPage.tsx` (×3, `WEB_ENV.isDev`-gated), `TellMitraContainer.tsx` (×2, `__DEV__`-gated). Do not fire in production builds but must be removed before release.
- **Thread state is session/local only.** No server-side Tell Mitra history. Clearing browser data loses the thread.
- **Proof table from S17-D4B not yet filled.** Logs are in place; dev verification flows not yet reported.

---

## 6. Rooms / Guided Room Experience

### Room IDs

| Room ID | Label | Typical support_need | Secondary room | Notes |
|---|---|---|---|---|
| `room_stillness` | Find Calm | stabilize_only, stabilize_then_clarify | room_clarity | Default for immediate_support / calm_now |
| `room_clarity` | Find Clarity | decision_clarity | room_release | Preferred action family: inquiry first |
| `room_release` | Set It Down | release_weight | room_clarity | |
| `room_connection` | Feel Connected | connection_support | room_clarity | |
| `room_growth` | Take the Next Step | growth_direction | — | |
| `room_joy` | Notice What's Good | (gratitude/joy flows) | — | |

Defined in `core/models.py:8722` (ROOM_ID_CHOICES) and `packages/types/src/room.ts` (RoomId type).

### Render endpoint
`GET /api/mitra/rooms/{room_id}/render/` (`core/rooms/views.py:604`)  
Query params: `life_context`, `tell_mitra_event_id`, `source_surface`, `intent_type`  
Flags: `MITRA_ROOMS_V31=1` + per-room `MITRA_ROOM_{ID}=1`

**Key response fields when `MITRA_ROOM_GUIDED=1`:**
```
room_context.entry_context.recommended_first_action_id  → Begin button target
room_context.entry_context.recommended_first_action_title
room_context.entry_context.recommended_first_action_description
room_context.entry_context.secondary_room_id
room_context.situation_acknowledgement_line
room_context.sanatan_insight_line
room_context.why_this_room_line
room_steps[]                                           → view-all-steps modal
provenance.render_id                                   → telemetry linkage
actions[]                                              → each has action_id, action_type, runner_payload OR inquiry_payload
```

### Begin button handling (both platforms)

```typescript
if (actionType === 'inquiry') {
  // → dispatch room_inquiry_opened with inquiry_payload
  //   Web: calls onAction; Mobile: executeAction (telemetry stub only — Phase 6)
} else {
  // runner_mantra / runner_sankalp / runner_practice
  // → dispatch start_runner with runner_payload
  //   variant = rp.runner_kind || actionType.replace('runner_', '') || 'mantra'
  //   NEVER dispatch if runner_payload is missing
}
```

**Critical:** `decision_clarity` support_need prefers **inquiry** actions. `Begin` must handle inquiry path. Do not re-introduce the `if (!runner_payload) return` guard for inquiry-type actions.

### Reflection endpoint
`POST /api/mitra/rooms/{room_id}/reflect/` — requires both `MITRA_ROOMS_V31` and `MITRA_ROOM_GUIDED`.  
Body: `{ response_code, render_id, tell_mitra_event_id }`  
Valid response_codes per room: see `ROOM_REFLECTION_OPTIONS` in `packages/contracts/src/room.ts`.

### Room → Tell Mitra return
1. Frontend writes `tell_mitra_return_room_v1` to sessionStorage on `enter_room`
2. On re-open, Tell Mitra reads it and appends a `return_card` conversation item
3. Return card chips route via `room_return_chip` source_surface (no broad reset unless Start Fresh)

### Known issues
- `room_inquiry_opened` on mobile: telemetry only — real category picker is a Phase 6 stub
- `room_welcome_viewed` telemetry: event type exists in backend; not confirmed as sent by current frontend

---

## 7. Inner Path, Daily Rhythm, Quick Reset, Quick Check-in

### Inner Path (14-Day Journey)
- **Purpose:** Committed 14-day cycle with locked mantra/sankalp/practice triad
- **Entry:** `POST /api/mitra/generate-companion/`; day view via daily-view endpoint
- **Checkpoints:** Day 7 (`GET/POST /api/mitra/journey/checkpoint/7`) → continue / lighten / reset; Day 14 → continue_same / deepen / change_focus
- **Backend:** `core/mitra_views.py`, `core/content_engine.py` (`select_content_for_journey`)
- **Mobile:** `InnerPathScreen.tsx`
- **Data written:** Journey, JourneyDay, JourneyDayItem, JourneyActivity
- **Known gaps:** Web Inner Path surface not mapped in this doc — verify `apps/web/src/pages/`

### Daily Rhythm
- **Purpose:** Daily triad access (mantra/sankalp/practice) + eventual reminder structure
- **Entry:** `GET /api/mitra/v3/journey/daily-view/`
- **Backend:** `core/journey_v3/views.py` + builders
- **Mobile:** `RhythmHomeScreen.tsx`
- **Data written:** Reads JourneyDay/JourneyActivity; writes on item completion
- **Known gaps:** CompanionRhythm model exists but not integrated; morning/midday/night slot structure not implemented

### Quick Reset
- **Purpose:** One mantra with beads, ~3 min pause; for drained/agitated users
- **Entry:** Routing destination from `prana-acknowledge`; not a dedicated API endpoint
- **Backend:** `prana-acknowledge` returns `{action: "quick_reset", room_id: "room_stillness"}`; content is one mantra from `select_items()`
- **Mobile:** `QuickResetScreen.tsx`
- **Data written:** Optional JourneyActivity (mantra, source=support); no dedicated QR completion event
- **Known gaps:** No formal completion tracking for Quick Reset as a distinct flow

### Quick Check-in
- **Purpose:** Prana state selection → companion state update → routing suggestion
- **Entry:** `POST /api/mitra/prana-acknowledge/`
- **4 prana states:** balanced, energized, agitated, drained
- **Backend:** `core/mitra_views.py:2772`; updates CompanionState (last_reported_mood, last_volatility_index)
- **Routing:** balanced/energized → my_rhythm; agitated → quick_reset + room_stillness; drained → room_release
- **Mobile:** `QuickCheckinScreen.tsx`
- **Data written:** JourneyActivity (checkin), SupportSessionState, CompanionState

---

## 8. Telemetry and Outcome Tracking

| Model/Event | Purpose | Written by | Used for |
|---|---|---|---|
| `TellMitraEvent` | Encrypted routing event + intelligence spine | Tell Mitra backend | Routing audit, continuity, outcome linkage |
| `TellMitraDecisionTrace` | AI/mixed-signal trace (not all events) | Tell Mitra backend (high-value only) | Review, ML improvement |
| `RoomRenderLog` | Every room render; linked to TellMitraEvent | Room render backend | Outcome tracking, return continuity |
| `RoomTelemetryEvent` | 14 room interaction events | Frontend via `POST /api/mitra/rooms/telemetry/` | Engagement analytics |
| `RoomFeedback` | Post-session mood (lighter/same/heavier) | Room feedback endpoint | Outcome quality signal |
| `EventLog` | Generic event log (flexible event_type) | Various | System events, audit |
| `CompanionState` | Per-user emotional state snapshot | prana-acknowledge, Tell Mitra | Dashboard intelligence, continuity |

**Guided room telemetry events (sent to `/api/mitra/rooms/telemetry/`):**
`room_welcome_viewed` · `why_this_viewed` · `recommended_action_started` · `recommended_action_completed` · `reflection_submitted` · `next_step_selected` · `room_exited` · `runner_start` · `runner_complete` · `runner_abandon`

**Outcome report commands:**
```bash
docker exec kalpx-dev-web python manage.py tell_mitra_outcome_intelligence_report
docker exec kalpx-dev-web python manage.py tell_mitra_room_outcomes_report
```

**Privacy invariants:** Raw user text never stored plaintext. `text_encrypted` uses Fernet. Safety events create no TellMitraEvent. `allow_in_synthesis = False` on all rows.

---

## 9. Shared Contracts and Types

| Contract/type | File | Why it matters |
|---|---|---|
| `CHIP_SUBMIT_TEXT` | `packages/contracts/src/mitraFourDoor.ts` | Maps chip value → free-text `text` field sent to backend |
| `TellMitraConversationItem` | `packages/types/src/mitraFourDoor.ts` | Union of 10 item types; defines thread UI rendering |
| `TellMitraFollowupMeta` | `packages/types/src/mitraFourDoor.ts` | Chip tap payload contract (selected_value must match backend options verbatim) |
| `TellMitraRoomEntryContext` | `packages/types/src/mitraFourDoor.ts` | Full context from Tell Mitra; stored in sessionStorage; passed to room render |
| `getRoomRenderParamsFromEntryContext` | `packages/contracts/src/mitraFourDoor.ts` | Flattens entry context to room render query params; includes mismatch guard |
| `RoomId` | `packages/types/src/room.ts` | Type-safe room ID union; guards routing |
| `RoomEntryContext` | `packages/types/src/room.ts` | Typed entry_context from room render response |
| `ROOM_REFLECTION_OPTIONS` | `packages/contracts/src/room.ts` | Per-room reflection response_codes; used by reflection UI |
| `ROOM_GUIDED_COPY` | `packages/contracts/src/room.ts` | UI copy strings for guided room (begin, whyThisLabel, viewAllSteps, exitLabel) |

**Rule:** Any new chip must be added to `CHIP_SUBMIT_TEXT`, mapped in backend (`_LIFE_CONTEXT_KEYWORDS` or `_SELECTED_CONTEXT_TO_LIFE_CONTEXT`), and tested via the matrix smoke.

---

## 10. Testing Cheat Sheet

### Backend
```bash
# Full Tell Mitra suite (201 tests)
docker exec kalpx-dev-web python manage.py test core.tests_tell_mitra -v2

# Deterministic chip routing matrix smoke (requires user with active journey)
docker exec kalpx-dev-web python manage.py tell_mitra_matrix_smoke --user-id <id>

# Outcome reports
docker exec kalpx-dev-web python manage.py tell_mitra_outcome_intelligence_report
docker exec kalpx-dev-web python manage.py tell_mitra_room_outcomes_report
```

### Web
```bash
cd apps/web
npx tsc --noEmit 2>&1 | grep -v node_modules          # typecheck

# Build with thread UI enabled
VITE_MITRA_TELL_MITRA_THREAD_UI=1 npx vite build --mode development
# Then S3 sync + CloudFront invalidation from dev EC2 (local IAM lacks CF permission)
```

### Mobile
```bash
cd apps/mobile
npx tsc --noEmit 2>&1 | grep -v node_modules          # typecheck

# Enable thread UI locally (Metro restart required after)
echo "EXPO_PUBLIC_MITRA_TELL_MITRA_THREAD_UI=1" >> .env.local
```

---

## 11. Manual QA Smoke Scenarios

| Scenario | Steps | Expected result |
|---|---|---|
| Relationship path | overwhelmed → tap "My relationships" → tap "Feeling disconnected" | room_connection recommendation |
| Money stress | overwhelmed → money_security → ongoing stress | room_stillness recommendation |
| Money future | overwhelmed → money_security → future uncertainty | room_clarity recommendation (`decision_clarity` support_need) |
| Health / tired | overwhelmed → health_energy → physically tired | room_stillness recommendation |
| Purpose | overwhelmed → purpose_direction → no direction | room_clarity recommendation |
| Calm now | tap "Just help me calm down" or calm_now chip | room_stillness immediately; no extra chips |
| Room begin (runner) | reach any room → Begin on runner action | runner sheet opens; no silent failure |
| Room begin (inquiry) | reach room_clarity → Begin on inquiry action | inquiry sheet opens (or telemetry-only stub on mobile) |
| Room return | complete room → re-open Tell Mitra → tap "Still heavy" | return_card; no broad life-context question |
| Start Fresh | mid-flow → tap Start Fresh → new text | reset context; first_listen stage |
| Safety phrase | "I want to hurt myself" | safety item; no room card; no event_id |
| Gibberish | "asdfghjkl" | clarify_input; no room; no crash |

---

## 12. Known Gaps / Open Items

| Gap | Layer | Status |
|---|---|---|
| `[S17-D4B]` dev logs still present | Web + Mobile | Open — must remove before production. Web: `TellMitraPage.tsx` (×3), `RoomGuidedSection.tsx`, `actionExecutor.ts`. Mobile: `TellMitraContainer.tsx` (×2), `RoomGuidedSection.tsx`. |
| Thread state not server-side | Web + Mobile | By design for now — session/local storage only |
| `EXPO_PUBLIC_MITRA_TELL_MITRA_THREAD_UI` not in EAS prod | Mobile | Pending — new EAS build required |
| `room_inquiry_opened` mobile has no UI | Mobile | Phase 6 stub — telemetry only |
| CompanionRhythm not integrated into daily-view | Backend | Model exists; morning/midday/night not wired |
| `room_welcome_viewed` telemetry | Frontend | Not confirmed sent by current frontend |
| `MITRA_V3_TELL_MITRA_LLM_EXTRACT` | Backend | Off on dev/prod — dev smoke validation pending before prod enable |
| S17-D4B proof table not filled | Web | Logs in place; dev flows not yet reported |

---

## 13. Developer Rules

1. **Do not change Tell Mitra routing without running the matrix smoke.** (`tell_mitra_matrix_smoke --user-id <id>`)
2. **Do not add a chip unless it is mapped in `CHIP_SUBMIT_TEXT` and backend mapping/ontology** (`_LIFE_CONTEXT_KEYWORDS` or `_SELECTED_CONTEXT_TO_LIFE_CONTEXT`), then covered by a matrix smoke case.
3. **Do not add a room action type unless `handleBegin` supports it on both web and mobile.** Unhandled types silently do nothing.
4. **Do not add a feature flag or env var without updating `docs/feature-flags-and-env.md` and the relevant `.env.example`.**
5. **Do not store raw user text without S0 approval.** All user text must be Fernet-encrypted at rest.
6. **Do not mark a flow fixed without response-shape-first proof and at least one deterministic test.**
7. **Keep frontend thread UI and backend progression logic in sync.** New `conversation_stage` values must be handled (or at minimum non-crashing) in both web and mobile.
