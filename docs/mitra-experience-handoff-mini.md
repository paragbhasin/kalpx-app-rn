# KalpX Mitra Experience Handoff

**Last updated:** 2026-05-16 | **Source of truth:** code on `main` branch (dev deployed)  
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
| Rooms | Implemented | BE: `core/rooms/views.py` / Web: `RoomGuidedSection.tsx` / Mobile: `RoomContainer.tsx` | 6 rooms; guided experience; preview card + See all steps live; room-specific completion copy + reflection chips; between-step 1.8s pacing |
| Room Return | Implemented | Web: `TellMitraPage.tsx` (sessionStorage) / Mobile: `TellMitraContainer.tsx` (useFocusEffect + refs) | return_card item in conversation; lastReturnCardKeyRef deduplication |
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
- Rooms are guided spaces, not menus. Each has a recommended starting action shown in a preview card before Begin.
- Room completion shows room-specific closure copy (e.g. "You set something down.") + subtext + 4 reflection chips. Not a form.
- Between steps: 1.8s companion line overlay before next step opens. No tap required.
- `completion_source: "room_sequence"` in the completion payload is the guard that distinguishes room completion from Quick Chant / mantra / sankalp completions in `CompletionReturnTransient`.
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

**Thread UI flag check:**

| Platform | Guard | Location |
|---|---|---|
| Web | `const THREAD_UI_ENABLED = WEB_ENV.tellMitraThreadUi === "1"` | `TellMitraPage.tsx` line 13 |
| Mobile | `(process.env.EXPO_PUBLIC_MITRA_TELL_MITRA_THREAD_UI ?? '0') === '1'` | `TellMitraContainer.tsx` line ~45 |

When `flag = 0`: old textarea UI renders, no chips, no thread. When `flag = 1`: full chip-based thread UI.

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

## 5. Tell Mitra — Frontend Deep Dive

### Conversation item types (10)

| Type | When added | What renders |
|---|---|---|
| `loading` | Immediately on submit | Spinner while API call in flight |
| `safety` | `resp.safety_flag = true` | Crisis support message; no room card, no chips |
| `mitra_response` | Every non-safety response | Mitra's narrative response text |
| `followup_chips` | `resp.suggested_action = "ask_followup"` | Prompt + selectable chip options |
| `room_recommendation` | `suggested_action = "navigate_to_room"` + valid `room_id` | Room name, description, Enter Room button |
| `wisdom_options` | `suggested_action = "provide_wisdom_inline"` | Inline wisdom items |
| `user_chip` | When user taps a chip | The chip label echoed back |
| `user_message` | `handleQuickStartChip` quick-start | Free-text echoed back |
| `return_card` | On focus after room exit | Room name, "Still heavy?" / "Something new?" chips |
| `error` | API failure | Error message with retry option |

### `submitThread` — step-by-step

```
1. Read freshResetPendingRef.current:
     if true → effectiveSource = "tell_mitra_start_fresh", isReset = true, clear ref
     else    → effectiveSource = caller-supplied sourceSurface

2. Append { id: loadingId, type: "loading" } to conversation[]
   setSubmitting(true)
   scroll to bottom (50ms timeout)

3. POST /api/mitra/v3/tell-mitra/ with:
     text: inputText.trim()
     tz: Intl.DateTimeFormat().resolvedOptions().timeZone
     source_surface: effectiveSource
     followup: followupMeta    (if chip tap — see §5 chip payload)
     reset_context: true       (only if isReset)

4. On response — update activeContextRef.current:
     parentEventId    ← resp.tell_mitra_event_id ?? prior
     parentIntentType ← resp.intent_type ?? prior
     lifeContext      ← resp.room_entry_context?.situation?.life_context
                        ?? resp.conversation_context?.current_life_context
                        ?? prior
     supportNeed      ← resp.support_need || prior
     patternKey       ← resp.pattern_key ?? prior
     roomEntryContext ← resp.room_entry_context ?? prior

5. Build newItems array:
     if resp.safety_flag → [{ type: "safety" }]
     else:
       always push { type: "mitra_response", text: resp.mitra_response }
       then exactly one of:
         if suggested_action === "ask_followup" AND followup_question
           → push { type: "followup_chips", prompt, options, parent_tell_mitra_event_id, parent_intent_type }
         if suggested_action === "navigate_to_room" AND isValidRoomId(resp.suggested_room_id)
           → push { type: "room_recommendation", room_id, room_label, tell_mitra_event_id, room_entry_context }
         if suggested_action === "provide_wisdom_inline"
           → push { type: "wisdom_options", items }

6. Replace loading item; append newItems:
     setConversation(prev => [...prev.filter(i => i.id !== loadingId), ...newItems])
```

### `handleChipClickThread` — exact payload

When user taps a chip (`opt: { value, label }`), finds `chipGroup` (the `followup_chips` item) and optional `returnCardItem` (nearest `return_card` item above):

```typescript
const followupMeta: TellMitraFollowupMeta = {
  prompt_id: null,
  selected_value: opt.value,               // echoed verbatim — must match backend options[].value
  selected_label: opt.label,
  parent_tell_mitra_event_id:
    returnCardItem?.tell_mitra_event_id     // 1st priority: return card context
    ?? chipGroup?.parent_tell_mitra_event_id // 2nd: chip group's own event id
    ?? activeContextRef.current.parentEventId // 3rd: accumulated ref
    ?? null,
  parent_intent_type:
    chipGroup?.parent_intent_type
    ?? activeContextRef.current.parentIntentType
    ?? null,
  life_context:
    returnCardItem?.room_entry_context?.situation?.life_context // return card wins
    ?? activeContextRef.current.lifeContext
    ?? null,
};
// CHIP_SUBMIT_TEXT[opt.value] → text field sent as the API submission string
```

`CHIP_SUBMIT_TEXT` maps chip values to human-readable `text` strings (in `packages/contracts/src/mitraFourDoor.ts`). Any new chip must be added there **and** in backend ontology (`_LIFE_CONTEXT_KEYWORDS` or `_SELECTED_CONTEXT_TO_LIFE_CONTEXT`).

### `activeContextRef` fields

Ref (not state) — survives re-renders without triggering them.

| Field | Set from | Used for |
|---|---|---|
| `parentEventId` | `resp.tell_mitra_event_id` after each submit | `parent_tell_mitra_event_id` in next chip payload |
| `parentIntentType` | `resp.intent_type` after each submit | `parent_intent_type` in next chip payload |
| `lifeContext` | `resp.room_entry_context.situation.life_context` or `resp.conversation_context.current_life_context` | `life_context` in next chip payload |
| `supportNeed` | `resp.support_need` | Continuity context for return card |
| `patternKey` | `resp.pattern_key` | Telemetry, outcome tracking |
| `roomEntryContext` | `resp.room_entry_context` | Passed into `room_recommendation` item; used in `handleEnterRoom` |

### `handleEnterRoom` — full sequence

```typescript
function handleEnterRoom(item: room_recommendation) {
  // 1. Build dedup key
  const returnKey = `return_card:${item.room_id}:${item.tell_mitra_event_id ?? Math.floor(Date.now() / 60000)}`;

  // 2. Write to sessionStorage (web) — mobile uses pendingTellMitraReturnRef instead
  sessionStorage.setItem("tell_mitra_return_room_v1", JSON.stringify({
    room_id: item.room_id,
    room_label: item.room_label,
    tell_mitra_event_id: item.tell_mitra_event_id,
    room_entry_context: item.room_entry_context,
    timestamp: Date.now(),
    return_key: returnKey,
  }));

  // 3. Dispatch enter_room action to actionExecutor
  executeAction({
    type: "enter_room",
    payload: {
      room_id: item.room_id,
      source: "tell_mitra",
      tell_mitra_event_id: item.tell_mitra_event_id,
      room_entry_context: item.room_entry_context,
    },
  }, actionCtx);
}
```

### Return card injection

**Web — `useEffect` on mount (`TellMitraPage.tsx`):**
1. On mount, reads `sessionStorage.getItem("tell_mitra_return_room_v1")`
2. If present and not already in conversation, appends `{ type: "return_card", ... }` to conversation[]
3. Clears the sessionStorage key after injecting

**Mobile — `useFocusEffect` + refs (`TellMitraContainer.tsx`):**
```typescript
useFocusEffect(React.useCallback(() => {
  const pending = pendingTellMitraReturnRef.current;
  if (!pending) return;
  pendingTellMitraReturnRef.current = null;
  if (lastReturnCardKeyRef.current === pending.return_key) return;  // dedup
  lastReturnCardKeyRef.current = pending.return_key;
  setConversation(prev => {
    const already = prev.some(i =>
      i.type === 'return_card' &&
      (i.return_key ? i.return_key === pending.return_key : i.room_id === pending.room_id)
    );
    if (already) return prev;
    return [...prev, { id: genId(), type: 'return_card', ...pending }];
  });
  setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
}, []));
```
`pendingTellMitraReturnRef` is set by the enter_room action handler in mobile actionExecutor. `lastReturnCardKeyRef` prevents re-injecting on every focus event.

### `handleStartFresh` — exact state cleared

```typescript
function handleStartFresh() {
  setConversation([]);                                      // clears all items
  setText("");                                              // clears input
  setComposerPlaceholder("What's on your mind…");          // resets placeholder
  freshResetPendingRef.current = true;                     // next submit → source_surface="tell_mitra_start_fresh"
  activeContextRef.current = {                             // clears all accumulated context
    parentEventId: null, parentIntentType: null,
    lifeContext: null, supportNeed: null,
    patternKey: null, roomEntryContext: null,
  };
  sessionStorage.removeItem("tell_mitra_thread_v1");       // clear persisted thread
  sessionStorage.removeItem("tell_mitra_return_room_v1");  // clear return room
}
```

### Backend response fields

| Field | Meaning | Used by |
|---|---|---|
| `intent_type` | Classified intent (distress_acute, seeking_clarity, etc.) | Stage decision, room selection |
| `conversation_stage` | Where in progression (first_listen, context_clarification, ready_for_room, etc.) | Frontend rendering |
| `followup_question` | `{prompt, options[]}` — chip prompt for next turn | `followup_chips` item |
| `suggested_action` | `navigate_to_room`, `ask_followup`, `provide_wisdom_inline`, `navigate_to_door`, `none` | Frontend routing |
| `suggested_room_id` | Primary room to enter | `room_recommendation` card |
| `secondary_room_id` | Alternate room | return_card still_heavy routing |
| `support_need` | Derived classification (stabilize_only, decision_clarity, etc.) | Room selection, recommended action |
| `pattern_key` | Unique pattern signature | Telemetry, outcome tracking |
| `tell_mitra_event_id` | UUID; absent on safety responses | Room render linkage, chip continuation |
| `room_entry_context` | Full structured context for room render | Passed as query params to room endpoint |
| `safety_flag` | Crisis phrase detected | Safety item; no room, no event_id |
| `prior_context_summary` | Narrative of prior session | mitra_response display |

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
- **`[S17-D4B]` dev logs still in code.** Web: `TellMitraPage.tsx` (×3, `WEB_ENV.isDev`-gated), `RoomGuidedSection.tsx`, `actionExecutor.ts`. Mobile: `TellMitraContainer.tsx` (×2, `__DEV__`-gated), `RoomGuidedSection.tsx`. Must be removed before production.
- **Thread state is session/local only.** No server-side Tell Mitra history. Clearing browser data loses the thread.
- **Proof table from S17-D4B not yet filled.** Logs are in place; dev verification flows not yet reported.

---

## 6. Rooms / Guided Room Experience

### Room IDs

| Room ID | Label | Typical support_need | Notes |
|---|---|---|---|
| `room_stillness` | Find Calm | stabilize_only, stabilize_then_clarify | Default for immediate_support / calm_now |
| `room_clarity` | Find Clarity | decision_clarity | Preferred action family: inquiry first |
| `room_release` | Set It Down | release_weight | |
| `room_connection` | Feel Connected | connection_support | |
| `room_growth` | Take the Next Step | growth_direction | |
| `room_joy` | Notice What's Good | (gratitude/joy flows) | |

### Render endpoint
`GET /api/mitra/rooms/{room_id}/render/` (`core/rooms/views.py:604`)  
Query params: `life_context`, `tell_mitra_event_id`, `source_surface`, `intent_type`  
Flags: `MITRA_ROOMS_V31=1` + per-room `MITRA_ROOM_{ID}=1`

**Key response fields when `MITRA_ROOM_GUIDED=1`:**
```
room_context.entry_context.recommended_first_action_id     → Begin button target
room_context.entry_context.recommended_first_action_title
room_context.entry_context.recommended_first_action_description
room_context.situation_acknowledgement_line
room_context.sanatan_insight_line
room_context.why_this_room_line
room_steps[]                                               → view-all-steps modal
provenance.render_id                                       → telemetry linkage
actions[]                                                  → each: action_id, action_type, runner_payload OR inquiry_payload
```

### RoomGuidedSection layout

```
┌─────────────────────────────────────────┐
│  recommended_first_action_title         │  ← from entry_context
│  recommended_first_action_description   │
│  [ Begin ]                              │  ← handleBegin()
├─────────────────────────────────────────┤
│  [Why this?]   [View all steps]         │  ← visible only when why_this_room_line set
├─────────────────────────────────────────┤
│  why accordion (expands inline)         │  ← toggles on whyExpanded
├─────────────────────────────────────────┤
│              Exit                       │  ← bottom center link
└─────────────────────────────────────────┘
```

`recId` = `envelope.room_context?.entry_context?.recommended_first_action_id`  
`recAction` = `envelope.actions.find(a => a.action_id === recId)`

### Begin button dispatch

```typescript
function handleBegin() {
  if (!recAction) return;

  // telemetry first (both platforms)
  trackRoomTelemetry({ event_type: "recommended_action_started", room_id, render_id, action_id });

  const actionType = recAction.action_type ?? "";

  if (actionType === "inquiry") {
    const ip = recAction.inquiry_payload;
    if (!ip) return;
    dispatch({                               // web: onAction(); mobile: executeAction()
      type: "room_inquiry_opened",
      payload: { inquiry_payload: ip, action_id, room_id, render_id },
    });
  } else {
    // runner_mantra | runner_sankalp | runner_practice
    const rp = recAction.runner_payload;
    if (!rp) return;                         // NEVER dispatch start_runner with empty item: {}
    const variant =
      rp.runner_kind
      || (actionType.startsWith("runner_") ? actionType.replace("runner_", "") : actionType)
      || "mantra";
    dispatch({
      type: "start_runner",
      payload: { source: rp.runner_source ?? "support_room", variant, item: rp, action_id },
    });
  }
}
```

**Critical:** `decision_clarity` support_need prefers **inquiry** actions first. The `if (!runner_payload) return` guard that was the original bug must NOT be the only guard — inquiry path (`actionType === "inquiry"`) must be handled first.

### Mobile room navigation flow

```
enter_room action dispatched by handleEnterRoom
  → actionExecutor "enter_room" case
  → navigate to DynamicEngine screen with { room_id, source, tell_mitra_event_id, room_entry_context }
  → DynamicEngine fetches GET /api/mitra/rooms/{room_id}/render/
  → RoomContainer receives ActionEnvelope
  → RoomContainer renders "context_picker" state → then "render" state
  → "render" state → RoomGuidedSection (when MITRA_ROOM_GUIDED=1)
  → RoomGuidedSection shows recommended card → Begin → runner or inquiry sheet
```

### Reflection endpoint
`POST /api/mitra/rooms/{room_id}/reflect/` — requires both `MITRA_ROOMS_V31` and `MITRA_ROOM_GUIDED`.  
Body: `{ response_code, render_id, tell_mitra_event_id }`  
Valid response_codes per room: see `ROOM_REFLECTION_OPTIONS` in `packages/contracts/src/room.ts`.

### Known issues
- `room_inquiry_opened` on mobile: telemetry only — real category picker is a Phase 6 stub
- `room_welcome_viewed` telemetry: event type exists in backend; not confirmed sent by current frontend

---

## 7. Four-Door Home (`FourDoorHomeContainer.tsx`)

Four doors rendered as cards. `tell_mitra` door is the only one that renders an inline component instead of a navigation link.

### Subtitle fallback chains per door

| Door | Fallback chain |
|---|---|
| `my_rhythm` | `homeData.my_rhythm_summary?.next_practice_label` → `homeData.companion_rhythm?.[timeBand]?.items?.[0]?.title_snapshot` → `ds.my_rhythm?.subtitle` → `ds.my_rhythm?.cta` → `''` |
| `inner_path` | if `ips.has_active_path` → `"Day ${ips.day_number} of ${ips.total_days}"` else → `ips.path_title ?? ds.inner_path?.subtitle ?? ''` |
| `quick_reset` | `ds.quick_reset?.subtitle ?? ''` (no intelligence fallback) |
| `tell_mitra` | Renders `<TellMitraContainer />` inline in `tellMitraWrap` view — no subtitle string |

`timeBand` = `getRhythmTimeBand()` → `'morning' | 'afternoon' | 'night'` based on current hour.  
`ds` = door strings from home response. `ips` = inner path summary from home response.

### Tell Mitra door
```tsx
<View style={styles.tellMitraWrap}>
  <Text style={styles.doorLabel}>{DOOR_LABELS.tell_mitra}</Text>
  <TellMitraContainer />        {/* full thread UI embedded inline */}
</View>
```

---

## 8. Dashboard (`NewDashboardContainer.tsx`)

ETag-aware `useFocusEffect` fetch (no re-fetch when ETag unchanged). Renders 10+ conditional blocks in fixed order.

### Conditional block render order

| Block | Condition | Notes |
|---|---|---|
| `GreetingCard` | Always | Name, time-of-day greeting, checkpoint prompt |
| Focus phrase + path chip row | Always | Self-hides if no focus phrase |
| `TriadCardsRow` | Always | Three practice cards (mantra/sankalp/practice) |
| `WhyThisModal` trigger + link | `normalizeDashboardWhyThisState(sd?.why_this).canOpenWhyThis` | Opens inline modal |
| `CycleProgressBlock` | Always (self-hides internally) | Day-in-cycle ring |
| `SankalpCarryBlock` | Always (self-hides when no `practice_embody`) | Active sankalp carry display |
| `ContinuityMirrorCard` | `sd.continuity?.tier && sd.continuity.tier !== "none"` | Intelligence tier — first |
| `ClearWindowBanner` | `sd.clear_window_active` | Intelligence tier candidate |
| `PathMilestoneBanner` | `ins.path_milestone ?? sd.path_milestone` | Intelligence tier candidate |
| `ResilienceNarrativeCard` | `ins.resilience_narrative ?? sd.resilience_narrative` | Intelligence tier candidate |
| `PredictiveAlertCard` | `predictiveAlerts[0] ?? null` | Intelligence tier candidate |
| `EntityRecognitionCard` | `ins.entity_card ?? sd.entity_card` | Intelligence tier candidate |
| `QuickSupportBlock` | Always | Quick Reset + Quick Check-in CTAs |
| `AdditionalItemsSectionBlock` | Always (self-hides when no items) | Extra content rows |
| `SupportReturnModal` | `!!sd.dashboard_return_modal` | Overlay; `payload = sd.dashboard_return_modal` |
| `fullLoaderOverlay` | `isHydrating` | Full-screen skeleton while fetching |

**Intelligence tier cap:** max 2 insight cards shown (`candidates.slice(0, 2)`). `ContinuityMirrorCard` is evaluated before the candidates slice.

---

## 9. Inner Path, Daily Rhythm, Quick Reset, Quick Check-in

### Inner Path (14-Day Journey)
- **Purpose:** Committed 14-day cycle with locked mantra/sankalp/practice triad
- **Entry:** `POST /api/mitra/generate-companion/`; day view via daily-view endpoint
- **Checkpoints:** Day 7 (`GET/POST /api/mitra/journey/checkpoint/7`) → continue / lighten / reset; Day 14 → continue_same / deepen / change_focus
- **Backend:** `core/mitra_views.py`, `core/content_engine.py` (`select_content_for_journey`)
- **Mobile:** `InnerPathScreen.tsx`
- **Data written:** Journey, JourneyDay, JourneyDayItem, JourneyActivity

### Daily Rhythm
- **Purpose:** Daily triad access + eventual reminder structure
- **Entry:** `GET /api/mitra/v3/journey/daily-view/`
- **Backend:** `core/journey_v3/views.py` + builders
- **Mobile:** `RhythmHomeScreen.tsx`
- **Known gaps:** CompanionRhythm model exists but not integrated; morning/midday/night slot structure not implemented

### Quick Reset
- **Purpose:** One mantra with beads, ~3 min pause
- **Entry:** Routing destination from `prana-acknowledge` — not a dedicated endpoint
- **Backend:** `prana-acknowledge` returns `{action: "quick_reset", room_id: "room_stillness"}`
- **Mobile:** `QuickResetScreen.tsx`
- **Known gaps:** No formal completion tracking as a distinct flow

### Quick Check-in
- **Purpose:** Prana state selection → companion state update → routing suggestion
- **Entry:** `POST /api/mitra/prana-acknowledge/`
- **4 prana states:** balanced, energized, agitated, drained
- **Backend:** `core/mitra_views.py:2772`; updates CompanionState (last_reported_mood, last_volatility_index)
- **Routing:** balanced/energized → my_rhythm; agitated → quick_reset + room_stillness; drained → room_release
- **Mobile:** `QuickCheckinScreen.tsx`
- **Data written:** JourneyActivity (checkin), SupportSessionState, CompanionState

---

## 10. Telemetry and Outcome Tracking

| Model/Event | Purpose | Written by | Used for |
|---|---|---|---|
| `TellMitraEvent` | Encrypted routing event + intelligence spine | Tell Mitra backend | Routing audit, continuity, outcome linkage |
| `TellMitraDecisionTrace` | AI/mixed-signal trace (not all events) | Tell Mitra backend (high-value only) | Review, ML improvement |
| `RoomRenderLog` | Every room render; linked to TellMitraEvent | Room render backend | Outcome tracking, return continuity |
| `RoomTelemetryEvent` | 14 room interaction events | Frontend via `POST /api/mitra/rooms/telemetry/` | Engagement analytics |
| `RoomFeedback` | Post-session mood (lighter/same/heavier) | Room feedback endpoint | Outcome quality signal |
| `CompanionState` | Per-user emotional state snapshot | prana-acknowledge, Tell Mitra | Dashboard intelligence, continuity |

**Guided room telemetry events:**
`room_welcome_viewed` · `why_this_viewed` · `recommended_action_started` · `recommended_action_completed` · `reflection_submitted` · `next_step_selected` · `room_exited` · `runner_start` · `runner_complete` · `runner_abandon`

**Privacy invariants:** Raw user text never stored plaintext. `text_encrypted` uses Fernet. Safety events create no TellMitraEvent. `allow_in_synthesis = False` on all rows.

---

## 11. Shared Contracts and Types

| Contract/type | File | Why it matters |
|---|---|---|
| `CHIP_SUBMIT_TEXT` | `packages/contracts/src/mitraFourDoor.ts` | Maps chip value → free-text `text` field sent to backend |
| `TellMitraConversationItem` | `packages/types/src/mitraFourDoor.ts` | Union of 10 item types; defines thread UI rendering |
| `TellMitraFollowupMeta` | `packages/types/src/mitraFourDoor.ts` | Chip tap payload contract (selected_value must match backend options verbatim) |
| `TellMitraRoomEntryContext` | `packages/types/src/mitraFourDoor.ts` | Full context from Tell Mitra; stored in sessionStorage; passed to room render |
| `getRoomRenderParamsFromEntryContext` | `packages/contracts/src/mitraFourDoor.ts` | Flattens entry context to room render query params |
| `RoomId` | `packages/types/src/room.ts` | Type-safe room ID union; guards routing |
| `ROOM_REFLECTION_OPTIONS` | `packages/contracts/src/room.ts` | Per-room reflection response_codes; used by reflection UI |
| `ROOM_GUIDED_COPY` | `packages/contracts/src/room.ts` | UI copy strings for guided room (begin, whyThisLabel, viewAllSteps, exitLabel) |

---

## 12. Testing Cheat Sheet

### Backend
```bash
# Full Tell Mitra suite (201 tests)
docker exec kalpx-dev-web python manage.py test core.tests_tell_mitra -v2

# Deterministic chip routing matrix smoke
docker exec kalpx-dev-web python manage.py tell_mitra_matrix_smoke --user-id <id>

# Outcome reports
docker exec kalpx-dev-web python manage.py tell_mitra_outcome_intelligence_report
docker exec kalpx-dev-web python manage.py tell_mitra_room_outcomes_report
```

### Web
```bash
cd apps/web
npx tsc --noEmit 2>&1 | grep -v node_modules   # typecheck

# Build with thread UI enabled (must cd into apps/web first)
VITE_MITRA_TELL_MITRA_THREAD_UI=1 npx vite build --mode development
# Then S3 sync + CloudFront invalidation from dev EC2 (local IAM lacks CF permission)
```

### Mobile
```bash
cd apps/mobile
npx tsc --noEmit 2>&1 | grep -v node_modules   # typecheck

# Enable thread UI locally (Metro restart required after)
echo "EXPO_PUBLIC_MITRA_TELL_MITRA_THREAD_UI=1" >> .env.local
```

---

## 13. Manual QA Smoke Scenarios

| Scenario | Steps | Expected result |
|---|---|---|
| Relationship path | overwhelmed → tap "My relationships" → tap "Feeling disconnected" | room_connection recommendation |
| Money stress | overwhelmed → money_security → ongoing stress | room_stillness recommendation |
| Money future | overwhelmed → money_security → future uncertainty | room_clarity recommendation (decision_clarity support_need) |
| Health / tired | overwhelmed → health_energy → physically tired | room_stillness recommendation |
| Purpose | overwhelmed → purpose_direction → no direction | room_clarity recommendation |
| Calm now | tap "Just help me calm down" or calm_now chip | room_stillness immediately; no extra chips |
| Room begin (runner) | reach any room → Begin on runner action | runner sheet opens; no silent failure |
| Room begin (inquiry) | reach room_clarity → Begin on inquiry action | inquiry sheet opens (or telemetry-only stub on mobile) |
| Room return | complete room → re-open Tell Mitra → tap "Still heavy" | return_card; no broad life-context question |
| Start Fresh | mid-flow → tap Start Fresh → new text | reset context; first_listen stage; `source_surface="tell_mitra_start_fresh"` |
| Safety phrase | "I want to hurt myself" | safety item; no room card; no event_id |
| Gibberish | "asdfghjkl" | clarify_input; no room; no crash |
| Flag off | `VITE_MITRA_TELL_MITRA_THREAD_UI=0` | old textarea UI; no chips; no thread |

---

## 14. Known Gaps / Open Items

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

## 15. Developer Rules

1. **Do not change Tell Mitra routing without running the matrix smoke.** (`tell_mitra_matrix_smoke --user-id <id>`)
2. **Do not add a chip unless it is mapped in `CHIP_SUBMIT_TEXT` and backend mapping/ontology** (`_LIFE_CONTEXT_KEYWORDS` or `_SELECTED_CONTEXT_TO_LIFE_CONTEXT`), then covered by a matrix smoke case.
3. **Do not add a room action type unless `handleBegin` supports it on both web and mobile.** Unhandled action types silently do nothing.
4. **Do not re-introduce a blanket `if (!runner_payload) return` guard in `handleBegin`.** Inquiry actions have `inquiry_payload`, not `runner_payload` — handle them first.
5. **Do not add a feature flag or env var without updating `docs/feature-flags-and-env.md` and the relevant `.env.example`.**
6. **Do not store raw user text without S0 approval.** All user text must be Fernet-encrypted at rest.
7. **Do not mark a flow fixed without response-shape-first proof and at least one deterministic test.**
8. **Keep frontend thread UI and backend progression logic in sync.** New `conversation_stage` values must be handled (or at minimum non-crashing) in both web and mobile.
