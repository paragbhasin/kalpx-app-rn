# Room Gate Verdict

**Date:** 2026-04-22  
**Branch:** journey-v3-fe

---

## Backend / Contract Gate: PASS WITH WARNINGS

The backend contract is stable and consistently populated. All action payload fields are present. Envelope shape matches what RN expects for all surfaces that are consumed. No contract field causes a runtime crash.

Warnings (non-blocking):
- `RoomProvenance` FE type is missing 4 backend fields (visit_number, render_phase, life_context_applied, life_context_skipped). TypeScript-level gap only.
- `principle_name` in responses returns the DB slug, not the display name. Shows briefly in the WhyThisL2Sheet header before the fetch overwrites it.
- `ready_hint`, `section_prompt`, and `pacing_ms` are dead fields — authored by BE, sent in the envelope, never read by FE.
- InquiryCategory `prompt` vs `reflective_prompt` field naming: FE handles both gracefully (`reflective_prompt || prompt`), but the BE variable naming should be verified to confirm the short-name `prompt` field is always present.
- No duplicate write detection on sacred endpoint. Low practical risk.

---

## Flow Mechanics Gate: FAIL

The room system has one HIGH-severity mechanics defect that prevents the flows from being honest to ship: the `open_why_this_l2` routing bug.

Every wisdom tap from within a room — teaching pill in clarity, banner wisdom in all five other rooms — dispatches `open_why_this_l2`, which routes to `{ container_id: "room", state_id: "why_this_l2" }`. `RoomContainer` does not handle `why_this_l2` as a state — it falls through to `RoomRenderBranch` and shows the room again. `WhyThisL2Sheet` is never rendered. The user taps the wisdom surface and sees nothing change (or briefly sees a loading spinner).

This is not a visual polish issue. The wisdom surfaces are the primary depth affordance in the room system. They are tappable, they look interactive, and they produce no user-visible result. That is a dead affordance.

---

## Top 5 Blockers

### B-1: `open_why_this_l2` routing from room context — HIGH

**All 6 rooms. All wisdom surfaces.**

Root cause: `enter_room` handler does not stamp `_overlay_parent_container` before loading the room. When the handler fires, `currentContainerId = "room"`, so `open_why_this_l2` routes to `container_id: "room"`. `RoomContainer` has no handler for `state_id: "why_this_l2"`.

Fix (actionExecutor.ts, in `enter_room` case, before `loadScreen` call):
```javascript
setScreenValue(
  screenState.currentContainerId || "companion_dashboard",
  "_overlay_parent_container"
);
```

This stamps the caller's container (typically `companion_dashboard`) so `open_why_this_l2` routes to that container's "why_this_l2" state, where `WhyThisL2Sheet` IS in the block map.

Secondary fix needed: after closing the sheet, the user is returned to the parent container (dashboard), not back to the room. Decide whether the L2 sheet needs a "Back to room" path.

### B-2: Back-from-L2 navigation after B-1 fix — MEDIUM

After B-1 is fixed, the L2 sheet opens on the parent container. Closing the sheet returns the user to the dashboard, not the room. If the product intent is "user reads the principle and returns to the room to continue", this navigation is wrong.

Fix options:
- Add a `return_to_room` flag on the L2 sheet and in the close handler
- Or accept dashboard return as intentional (wisdom is an exit affordance)

Decision required before B-1 fix is shipped.

### B-3: `VoiceNoteBody` stub is live in StepModal — MEDIUM

`VoiceNoteBody` shows a recording UI that claims to record but does not. `stub: true` is sent in the completion payload. No active pool currently has a `step_voice_note_*` template_id. Risk: if a pool entry is added by mistake, users see a fake recorder.

Fix: either remove `VoiceNoteBody` entirely until the recorder is wired, or add a BUILD_ONLY guard that makes the body unreachable in production.

### B-4: Sacred write not authenticated for guests — MEDIUM

`POST /api/mitra/rooms/{room_id}/sacred/` returns 401 for guests. Carry taps from guest users silently drop to Redux-only (no BE model row). If carry persistence is expected for guests, the endpoint gate is wrong. If carry is authenticated-only by design, the FE should suppress the carry pill for guest users.

Decision required: is carry a guest affordance or authenticated-only?

### B-5: Step completion has no BE persistence — MEDIUM

`room_step_completed` is telemetry-only (`mitraTrackEvent` only). No `RoomEvent` model row is written on step completion. If telemetry drops (pre-auth, network failure), the step is completely unobservable from the backend. No resilience ledger entry, no JourneyActivity row, no analytics row.

Fix: either confirm this is intentional (steps are ephemeral) or add a sacred write call in the `room_step_completed` handler analogous to carry.

---

## Top 5 Non-Blocking Warnings

### W-1: InquiryCategory field naming (backend-contract)
`room_selection.py` uses `reflective_prompt` internally; FE reads `reflective_prompt || prompt`. If the short-name `prompt` field is not present in the emitted dict, the authored prompt is lost and the FE falls back to an empty string. Verify BE dict output keys.

### W-2: Carry double-tap creates duplicate rows (event-write)
No client-side single-tap guard on `RoomActionCarryPill`. Rapid double-tap or accidental double-press creates two `RoomEvent` rows. Acceptable for now; should be guarded in a future pass.

### W-3: Dead envelope fields (observability)
`ready_hint`, `section_prompt`, `pacing_ms`, `silence_tolerance_ms` are authored by BE content teams, sent in every render, and never read by FE. This creates content-author confusion and wastes bandwidth. Clean up by removing from the FE type and considering BE deprecation.

### W-4: `RoomProvenance` TS type drift (backend-contract)
4 fields missing from FE type. When code tries to read `provenance.life_context_applied`, TypeScript types it as `undefined`. Fix: add the 4 fields to `RoomProvenance` interface in `types.ts`.

### W-5: `Clipboard` deprecated API in ReachOutBody (FE-render)
`import { Clipboard } from "react-native"` generates deprecation warnings. Replace with `@react-native-clipboard/clipboard` when that dependency is added to the project.

---

## Exact Next Actions Required to Clear Each Gate

### To clear the Backend / Contract Gate (currently PASS WITH WARNINGS → PASS)

1. Add 4 missing fields to `RoomProvenance` in `types.ts` (visit_number, render_phase, life_context_applied, life_context_skipped). 30-minute fix.
2. Verify `room_selection.py` emits `prompt` (not only `reflective_prompt`) in the InquiryCategory dict. If missing, add it as a field alias.
3. Mark `ready_hint`, `section_prompt`, `pacing_ms`, `silence_tolerance_ms` as intentionally dead in docs (or remove from FE type with `@deprecated`). No user impact.

### To clear the Flow Mechanics Gate (currently FAIL → PASS WITH WARNINGS)

1. **Fix B-1**: Add `setScreenValue(screenState.currentContainerId || "companion_dashboard", "_overlay_parent_container")` in `enter_room` case before `loadScreen`. This unblocks all wisdom taps.
2. **Decide B-2**: Is returning to the dashboard after closing the L2 sheet acceptable, or does the user need to return to the room? If room-return is required, add the return path.
3. **Address B-3**: Remove `VoiceNoteBody` from the template dispatch table or make it production-unreachable until the recorder is wired.
4. **Decide B-4**: Is carry for guest users a product requirement? If yes, lift the auth gate on the sacred endpoint for carry events. If no, suppress the carry pill for guest users.
5. After B-1 is fixed and B-2 is decided, re-verify the teaching pill in clarity and the banner in all 5 banner rooms against a running device.

---

## Mechanical Soundness Paragraph

The room system is **not yet mechanically sound**. The opening flow, runner dispatch, step modal, inquiry modal, carry write, and exit are all mechanically correct — actions fire, payloads are complete, navigation resolves, and state is correctly scoped. The single defect that breaks the system's mechanical honesty is the `open_why_this_l2` routing: every wisdom surface in all six rooms dispatches to a destination that renders the room again, not the principle sheet. This is not a content gap or a polish item — it is a navigation dead-end that makes every wisdom tap appear broken to the user. The fix is one line in the `enter_room` handler. Until that line is added and the back-navigation decision is resolved, the statement "the room system is mechanically sound" cannot be made honestly.
