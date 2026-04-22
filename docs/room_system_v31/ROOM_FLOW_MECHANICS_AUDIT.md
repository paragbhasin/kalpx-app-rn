# Room Flow Mechanics Audit

**Date:** 2026-04-22  
**Branch:** journey-v3-fe  
**Evidence standard:** verified = confirmed by reading the code path; inferred = best read from context; runtime-verified = confirmed by actual device/simulator interaction.

---

## Critical Finding Up Front

**`open_why_this_l2` routing is broken from the room context.** This affects wisdom taps in all 6 rooms. Full details in the Wisdom Flow section.

---

## 1. Opening Flow

**Mechanics:**

1. `enter_room` handler in `actionExecutor.ts:4286` stamps `room_id` + `life_context_allowed` into Redux, then calls `loadScreen({ container_id: "room", state_id: "render" OR "context_picker" })`. (verified)
2. `ScreenRenderer` mounts `RoomContainer`. (verified)
3. `RoomContainer` reads `room_id` + `life_context` from `screenData`. (verified)
4. `RoomRenderBranch` runs: checks `fetchedRef.current` to prevent re-fetch, calls `api.get("mitra/rooms/{room_id}/render/")`. (verified)
5. On success: envelope validated (`Array.isArray(data.actions)`), stored in `envelope` state. (verified)
6. `RoomRenderer` renders: `RoomOpeningExperience` → optional `RoomPrincipleBanner` → `RoomActionList`. (verified)
7. `RoomOpeningExperience` calls `onReveal()` in first `useEffect`, which no longer gates anything (actions always shown). (verified — this sprint)

**Issues found:**

| Issue | Severity | Category |
|-------|----------|----------|
| `enter_room` does not set `_overlay_parent_container` before navigating to "room" | HIGH | navigation |
| `ready_hint` is authored and populated in envelope but not rendered | LOW | observability |
| `section_prompt` and `pacing_ms` are dead envelope fields — authored, sent, unread | LOW | observability |

**Verdict: PASS.** Opening flow is mechanically sound. Envelope arrives, validates, renders. No hidden timing dependency remains (phase machine removed).

---

## 2. Banner / Teaching Wisdom Flow

**Critical defect — HIGH severity**

### Dispatch path (verified)

Both surfaces call the same dispatch:
```
executeAction({ type: "open_why_this_l2", payload: { principle_id } }, ctx)
```

Pre-dispatch (verified):
- Teaching pill: stamps `{ id, name, body, sources }` to `screenData.why_this_principle` before dispatch
- Banner: stamps `{ id, name, body: wisdom_anchor_line, sources: [] }` before dispatch

### `open_why_this_l2` handler (actionExecutor.ts:4099) — verified

```javascript
const principle = await getPrinciple(principleId);   // BE fetch
setScreenValue(principle, "why_this_principle");
setScreenValue(null, "why_this_source");
loadScreen({
  container_id: screenState._overlay_parent_container || screenState.currentContainerId || "companion_dashboard",
  state_id: "why_this_l2",
});
```

### Routing resolution (verified)

At the time of dispatch, from within the room:
- `screenState._overlay_parent_container` = **null / undefined** — `enter_room` handler never sets this (verified: actionExecutor.ts:4286–4384, no `setScreenValue` call for `_overlay_parent_container`)
- `screenState.currentContainerId` = **"room"** (set by `loadScreen` when entering)

Therefore: `loadScreen({ container_id: "room", state_id: "why_this_l2" })`

### What `ScreenRenderer` does (verified)

- `containerMap["room"] = RoomContainer` (ScreenRenderer.tsx:101)
- `RoomContainer` with `currentStateId = "why_this_l2"`:
  - `if (currentStateId === "context_picker")` → false
  - Falls through to `<RoomRenderBranch>`
  - `fetchedRef.current` matches → no re-fetch
  - Same room content re-renders

### Result

**WhyThisL2Sheet is never rendered.** The user taps a wisdom surface (teaching pill in clarity, or banner in 5 other rooms) and sees the room re-render with identical content. No principle sheet appears.

Intermediate state visible to user (inferred):
1. Tap fires
2. `getPrinciple()` BE fetch is in-flight → brief loading spinner (ScreenRenderer:144) while `currentScreen` resets
3. Room schema loads for "room/why_this_l2" (BE may or may not have this schema; if not, spinner persists)
4. Even if schema loads, `RoomContainer` handles it as a room render — same content

**This affects ALL 6 rooms** — every wisdom surface. The banner fix landed in the previous sprint (commit 37f5f09) was mechanically correct (wired the dispatch) but the routing target is wrong. The dispatch fires; the destination does not render the sheet.

### Fix required

In `enter_room` handler (`actionExecutor.ts:4324`), before the `loadScreen` call, stamp the caller's container as overlay parent:

```javascript
// stamp before navigation so open_why_this_l2 routes back to the caller
setScreenValue(screenState.currentContainerId || "companion_dashboard", "_overlay_parent_container");
```

With this fix, `open_why_this_l2` would route to `{ container_id: "companion_dashboard", state_id: "why_this_l2" }` (or whichever container called enter_room), where `WhyThisL2Sheet` IS in the block map and CAN be rendered. After the sheet is dismissed, normal back navigation returns to dashboard.

**Note on return path after fix:** with the overlay parent fix, closing WhyThisL2Sheet returns the user to the parent container (dashboard), not back to the room. To return to the room instead, a second fix would be needed: either a "Back to room" CTA in the sheet, or rendering WhyThisL2Sheet as a Modal directly inside RoomContainer's `state_id: "why_this_l2"` case.

| Issue | Severity | Category |
|-------|----------|----------|
| `open_why_this_l2` routes to `{ container_id: "room", state_id: "why_this_l2" }` — WhyThisL2Sheet never renders | **HIGH** | navigation |
| After fix: back-from-L2 lands on dashboard, not room | MEDIUM | navigation |

**Verdict: FAIL.** Wisdom taps produce no user-visible result. This is the single largest mechanics defect in the system.

---

## 3. Runner Flow

**Mechanics (verified):**

1. `RoomActionRunnerPill.onPress` checks `action.runner_payload` (null-guard, warns if missing)
2. Stamps `room_id` to `screenData` for return routing
3. Dispatches `start_runner` with `{ source: rp.runner_source, variant: rp.runner_kind, item: rp, target_reps }`

**`start_runner` handler (actionExecutor.ts:2872) — verified:**
- Validates `source` (refuses if missing — "REG-015" contamination guard)
- Validates `variant`
- Stamps 7 fields: `runner_variant`, `runner_source`, `runner_active_item`, `runner_start_time`, `runner_reps_completed`, `runner_step_index`, `runner_duration_actual_sec`
- Stamps `info` with the item (overwrites stale info from prior view_info taps)
- For `variant === "mantra"`: stamps `mantra_audio_url`
- Navigates to `{ container_id: "cycle_transitions", state_id: "offering_reveal" }`

**All 3 variants (mantra, sankalp, practice) route identically** — single rich surface. (Canonical routing rule, locked 2026-04-19.)

**Issues found:**

| Issue | Severity | Category |
|-------|----------|----------|
| `start_runner` stamps `room_id` in the pill, not in the handler — if pill is somehow called without `envelope`, `room_id` is not stamped | LOW | persistence |
| On `complete_runner`, return routing uses `runner_source` from Redux (can be stale if interrupted mid-run) | LOW | navigation |

**Verdict: PASS.** Runner dispatch is mechanically complete. All variants route to the same rich surface. State is fully stamped before navigation. No contamination guard gaps.

---

## 4. Step / Practice Flow

**Mechanics (verified):**

1. `RoomActionStepPill.onPress` sets `modalVisible = true` (primary path)
2. Fallback: `Alert.alert` stub if Modal throws (test harness only)
3. `StepModal` receives `stepPayload` → `classifyStep(template_id)` → mounts correct body

**Template dispatch (verified by `classifyStep` function):**

| Template prefix | Kind | Body component |
|----------------|------|---------------|
| `step_breathe_*` | timer_breathe | TimerBody (cycles × inhale+exhale+hold) |
| `step_walk_timer_*` | timer_walk | TimerBody (same computation) |
| `step_sit_ambient_*` | timer_sit | TimerBody |
| `step_hand_on_heart_*` | timer_heart | TimerBody (default 30s) |
| `step_text_input_*`, `step_journal_*` | text_input | TextInputBody (prompt_slot → PROMPT_SLOT_TEXT) |
| `step_grounding_*` | grounding | GroundingBody (5 hardcoded prompts) |
| `step_voice_note*` | voice_note | VoiceNoteBody (**stub — see warning below**) |
| `step_reach_out*` | reach_out | ReachOutBody (Clipboard + message) |
| anything else | unknown | UnknownBody (defensive "future release" message) |

**On Done:** `setModalVisible(false)` + `dispatchCompletion(extra)` → `room_step_completed` event

**`room_step_completed` handler (actionExecutor.ts:4504) — verified:**
- Fires `mitraTrackEvent("room_step_completed", ...)` — telemetry only
- If `writes_event` present: fires second `mitraTrackEvent(writes_event, ...)` — telemetry only
- **No sacred write, no BE model write, no Redux persistence**

**Issues found:**

| Issue | Severity | Category |
|-------|----------|----------|
| `VoiceNoteBody` is a stub recorder — UI shows, no audio captured; `stub: true` flag sent in payload | MEDIUM | FE-render |
| No active pool uses `step_voice_note_*` — not user-facing NOW, but risk if a pool entry is added accidentally | MEDIUM | fallback |
| Step completion has no BE persistence (telemetry-only) — not observable if track-event fails (e.g. pre-auth) | MEDIUM | event-write |
| Timer `Done` button always enabled — no enforcement that timer must complete before Done | LOW | FE-render |
| `ReachOutBody` uses deprecated `Clipboard` import — works but generates deprecation warnings | LOW | FE-render |

**Verdict: PASS WITH WARNINGS.** Step modal opens correctly, template dispatch is correct, duration fix is live. Primary concern: step completion is telemetry-only. Secondary concern: VoiceNoteBody stub is in the codebase.

---

## 5. Inquiry Flow

**Mechanics (verified):**

1. `RoomActionInquiryPill.onPress` validates `inquiry_payload.categories` (warns + returns if empty)
2. Sets `modalVisible = true`
3. `InquiryModal` fires `onOpened` on first `visible = true` → `room_inquiry_opened` telemetry

**Category list screen (verified):**
- Renders `categories.map(cat => <TouchableOpacity>)` with `cat.label`
- Tap sets `selected = cat` → category detail screen

**Category detail screen (verified):**
- Renders `selected.anchor_line` (if present)
- Renders `selected.reflective_prompt || selected.prompt` as the main prompt text
  - If BE sends only `prompt` (not `reflective_prompt`): `undefined || prompt` → prompt shown
  - If BE sends only `reflective_prompt`: `reflective_prompt || undefined` → reflective_prompt shown
  - If BE sends both: reflective_prompt takes priority
- "Try a practice" button: visible only when `selected.suggested_practice_template_id` is set; label: `selected.practice_label ?? "Try a practice"`
- "Journal on this": opens `TextInput` inline

**Outcomes (verified):**
- "Try a practice" → `handlePractice()` → `setModalVisible(false)` → `dispatchStepFromInquiry(category, templateId)` → `room_step_completed` (telemetry)
- Journal Done → `handleJournalDone()` → `setModalVisible(false)` → `dispatchStepFromInquiry(category, "step_journal_inquiry", { text })` → `room_step_completed` (telemetry)

**State reset on close (verified):** `!visible` effect resets `selected`, `journalOpen`, `journalText`, `openedFired`. Clean re-open state.

**Issues found:**

| Issue | Severity | Category |
|-------|----------|----------|
| `room_inquiry_opened` fires BEFORE `dispatchOpened` is hooked in from the pill — telemetry timing is on open, not on pill tap | LOW | observability |
| `dispatchOpened()` fired by `onOpened` prop; `onCategorySelected` correctly fires per-tap | LOW | observability |
| Inquiry "Try a practice" launches `room_step_completed` — not `start_runner`. If BE template_id is `runner_mantra`, it won't route to runner surface (misclassified as step) | MEDIUM | navigation |

The third issue is inferred: if `suggested_practice_template_id` ever contains a runner item_id (not a step template_id), the dispatch would fire as `room_step_completed` with a non-step ID. The handler only fires telemetry, so no crash — but also no navigation to the runner surface.

**Verdict: PASS WITH WARNINGS.** Mechanics are correct for the current usage (template_id = step templates). Potential mis-routing if template_id field is ever populated with a runner ID.

---

## 6. Carry Flow

**Mechanics (verified by reading `RoomActionCarryPill.tsx`):**

1. Tap calls `onPress()` (async)
2. Reads `writes_event` from `action.carry_payload.writes_event` → falls back to `action.persistence.writes_event` → falls back to `"joy_carry"`
3. Attempts `POST /api/mitra/rooms/{room_id}/sacred/` with `{ writes_event, label, action_id, analytics_key, captured_at }`
4. Sets `sacredWriteOk = true/false` based on HTTP status
5. Writes Redux trace unconditionally: `ctx.setScreenValue({ captured_at, label, room_id, writes_event, sacred_write_ok }, writesEvent)`
6. Dispatches `room_carry_captured` → `mitraTrackEvent("room_carry_captured", ...)` (telemetry only)

**Dual-write truthfulness (verified):**
- BE write (durable): `RoomEvent` row + `RoomTelemetryEvent` row. User's labeled carry event is encrypted and stored.
- Redux write (session-scoped): keyed by `writes_event`; available for same-session dashboard chip reads. Cleared on app restart.

**Issues found:**

| Issue | Severity | Category |
|-------|----------|----------|
| No client-side double-tap guard — rapid double-tap creates 2 BE rows with different `event_id` | MEDIUM | event-write |
| No retry on BE failure — if POST fails, Redux has local trace but BE has nothing; no recovery mechanism | MEDIUM | persistence |
| `room_carry_captured` telemetry fires regardless of `sacredWriteOk` — success/failure are both counted as "captured" at telemetry level | LOW | observability |
| Sacred write requires authenticated user (401 on guest) — carry for guest users silently fails BE write but Redis-style Redux write succeeds locally | MEDIUM | isolation |

**Verdict: PASS WITH WARNINGS.** The carry mechanic is structurally sound — writes to BE, writes to Redux, emits telemetry. The concerns are edge cases (double-tap, network failure, guest auth) that do not affect the primary flow.

---

## 7. Exit Flow

**Mechanics (verified by reading `RoomActionExitPill.tsx` and `actionExecutor.ts:4431`):**

1. Tap dispatches `room_exit` with `{ room_id }`
2. Handler fires `room_exit_dispatched` telemetry
3. Clears `screenData.room_id = null`
4. Loads dashboard: `companion_dashboard_v3` or `companion_dashboard` per env flag

**State cleanup on exit (verified):**
- `room_id` is cleared
- `life_context`, `context_skipped`, `life_context_allowed` are NOT explicitly cleared on exit — they persist in Redux until next `enter_room` overwrites them
- `why_this_principle`, `runner_active_item`, `runner_source` are NOT cleared

**Issues found:**

| Issue | Severity | Category |
|-------|----------|----------|
| `life_context`, `life_context_allowed` not cleared on exit — stale from prior room visit if user re-enters a different room | LOW | isolation |
| Exit always routes to dashboard — no "return to where you came from" behavior. Acceptable per current spec. | INFO | navigation |

**Verdict: PASS.** Exit always works. Navigation is deterministic. The state-cleanup gap is low risk because `enter_room` clears `life_context` before the room loads.

---

## 8. Repeat / Reopen Mechanics

**First re-entry (verified):**
- `enter_room` clears `life_context = null` and `context_skipped = false` before navigation
- `RoomRenderBranch.fetchedRef` is per-component-instance — re-mounting RoomContainer (on re-entry) creates a new ref, so a fresh fetch always fires
- New render gets: `visit_number` incremented, `render_phase: "repeat"`, potentially different action set (inquiry appears in clarity on repeat)

**Stale state risks:**
- `runner_active_item` persists in Redux between rooms — if user enters room, then taps a runner, runner state is set. If user exits mid-runner and re-enters a different room, `runner_active_item` still reflects the prior run. `start_runner` overwrites this, so only a brief window of stale state. (LOW)
- `why_this_principle` persists until the next `open_why_this_l2` dispatch overwrites it. Not user-visible (not rendered in room surface). (LOW)

**Issues found:**

| Issue | Severity | Category |
|-------|----------|----------|
| `fetchedRef` prevents re-render of same room within same RoomContainer mount — correct, but after state change (e.g., life_context update) the fetch key changes and re-fetches correctly | NONE | correct behavior |
| `runner_active_item` not cleared between rooms — brief stale window | LOW | isolation |

**Verdict: PASS.** Re-entry fetches fresh envelope. Visit state increments correctly on BE.

---

## 9. Flow Isolation

**stillness / clarity / growth / connection / release / joy:**

- Banner rooms (5) use `RoomPrincipleBanner` — only renders when `envelope.principle_banner` is non-null
- Clarity uses teaching pill — only when `action.action_type === "teaching"` and `action.teaching_payload` is non-null
- No banner in clarity (BE returns `principle_banner: null`) — verified
- No teaching pill in banner rooms (no `teaching` action_type emitted for those rooms) — verified
- Step/practice mechanics are the same component (`RoomActionStepPill` + `StepModal`) across all rooms — no per-room leakage
- Inquiry only in clarity/growth — `RoomActionInquiryPill` only renders when `action_type === "inquiry"` — correct
- Carry only in growth/connection/joy — same isolation via `action_type`

**Life context routing isolation (verified):**
- `fetchKey = "${roomId}::${lifeContext || ""}"` — life_context is part of the fetch key; changing context triggers a new fetch for the same room
- Rooms without picker (`room_stillness`, `room_connection`, `room_joy`) have no `allowedContexts` — life_context is null — fetch goes without `?life_context=` query param — BE uses universal selection

**Issues found:**

| Issue | Severity | Category |
|-------|----------|----------|
| No isolation of `_overlay_parent_container` — stale value from a prior container could affect L2 routing | MEDIUM | isolation |
| `joy carry` chip label fallback in `RoomActionCarryPill` is hardcoded `"joy_carry"` — if carry_payload AND persistence are both null, joy_carry is written regardless of which room the carry pill is in | LOW | isolation |

**Verdict: PASS WITH WARNINGS.** Room surfaces are well-isolated by action_type dispatch. The overlay parent contamination risk is tied to the larger L2 routing bug.

---

## Summary of All Defects Found

| # | Issue | Severity | Category | Rooms affected |
|---|-------|----------|----------|----------------|
| F-1 | `open_why_this_l2` routes to `{container_id:"room", state_id:"why_this_l2"}` — WhyThisL2Sheet never renders | **HIGH** | navigation | All 6 (wisdom surfaces) |
| F-2 | After fixing F-1: back from L2 sheet lands on dashboard, not room | MEDIUM | navigation | All 6 |
| F-3 | `VoiceNoteBody` stub in StepModal — UI shows but no recording; active in `step_voice_note_*` templates if ever added to a pool | MEDIUM | FE-render | Potentially any |
| F-4 | Step completion is telemetry-only — no BE sacred write, no model row | MEDIUM | event-write | All 6 |
| F-5 | Carry: no double-tap guard, no BE-failure retry | MEDIUM | persistence | growth, connection, joy |
| F-6 | Carry: sacred write requires auth — guest user carry silently drops to Redux-only | MEDIUM | isolation | growth, connection, joy |
| F-7 | Inquiry "Try a practice": dispatches `room_step_completed` not `start_runner` — mismatch if template_id is ever a runner ID | MEDIUM | navigation | clarity, growth |
| F-8 | `InquiryPayload.prompt` vs `reflective_prompt` field name needs BE code verification | MEDIUM | backend-contract | clarity, growth |
| F-9 | `enter_room` does not set `_overlay_parent_container` — root cause of F-1 | HIGH | navigation | All 6 |
| F-10 | Dead envelope fields: `ready_hint`, `section_prompt`, `pacing_ms`, `silence_tolerance_ms` — authored and sent but never read | LOW | observability | All 6 |
| F-11 | `RoomProvenance` TS type missing 4 BE fields | LOW | backend-contract | All 6 |
| F-12 | `principle_name` returns DB slug not display name | LOW | backend-contract | All 6 |
| F-13 | `Clipboard` deprecated API in `ReachOutBody` | LOW | FE-render | connection |
| F-14 | Timer `Done` always enabled (no completion enforcement) | LOW | FE-render | stillness, release |
| F-15 | `life_context` + `life_context_allowed` not cleared on exit | LOW | isolation | clarity, growth, release |
| F-16 | `room_telemetry` endpoint may not exist — errors swallowed silently | LOW | observability | All 3 picker rooms |

---

## Mechanics Honest to Ship?

**No, due to F-1.**

All surfaces render correctly on screen. The single mechanics defect that blocks honest shipping is the `open_why_this_l2` routing bug: wisdom tap from any room produces no user-visible result. Five rooms have a banner with a tappable wisdom surface that does nothing observable. Clarity's teaching pill is in the same state.

The bug fix is a one-line addition in `enter_room` (`actionExecutor.ts:4324`), but the back-navigation after closing the sheet also needs a decision (dashboard or room return).
