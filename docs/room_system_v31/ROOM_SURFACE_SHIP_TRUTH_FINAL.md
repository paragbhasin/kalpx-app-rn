# Room Surface Ship Truth — Final

**Date:** 2026-04-22  
**Branch:** journey-v3-fe  
**Verdict:** Honest to ship from a room-surface perspective.

---

## Q1: Is wisdom visible?

**Yes, in all 6 rooms.**

| Room | Wisdom surface | Visible |
|------|---------------|---------|
| room_stillness | Principle banner (`wisdom_anchor_line`) | Yes |
| room_clarity | Teaching pill (authored label) | Yes |
| room_growth | Principle banner | Yes |
| room_connection | Principle banner | Yes |
| room_release | Principle banner | Yes |
| room_joy | Principle banner | Yes |

Clarity suppresses the banner by design — the teaching pill is its primary wisdom surface. All other rooms show the banner.

---

## Q2: Is wisdom tappable where shown?

**Yes, in all 6 rooms.**

| Room | Wisdom component | Tap result |
|------|-----------------|-----------|
| room_stillness | `RoomPrincipleBanner` | Opens `WhyThisL2Sheet` via `open_why_this_l2` |
| room_clarity | `RoomActionTeachingPill` | Opens `WhyThisL2Sheet` via `open_why_this_l2` |
| room_growth | `RoomPrincipleBanner` | Opens `WhyThisL2Sheet` |
| room_connection | `RoomPrincipleBanner` | Opens `WhyThisL2Sheet` |
| room_release | `RoomPrincipleBanner` | Opens `WhyThisL2Sheet` |
| room_joy | `RoomPrincipleBanner` | Opens `WhyThisL2Sheet` |

The banner dead-tap stub (`onPress={() => {}}`) was removed and replaced with real dispatch in `RoomPrincipleBanner.tsx` (commit 37f5f09).

---

## Q3: Is step/practice the real practice surface?

**Yes.**

`_emit_step()` in `room_selection.py` returns an `in_room_step` action in all 6 rooms. That action renders as `RoomActionStepPill` → `StepModal`, which is what the user interacts with.

The `practice fallback` lane (`_emit_practice()`) is the else-branch — it fires only if the step pool returns empty, which does not happen in any active room.

There is no separate "practice" surface. Step is practice.

---

## Q4: Is any user-facing dead affordance left?

**No.**

| Previously dead | Fix applied | Status |
|----------------|-------------|--------|
| Banner tap (`onPress={() => {}}`) in 5 rooms | Wired to `open_why_this_l2` in `RoomPrincipleBanner.tsx` | Fixed |
| Breathe timer showing 0s (read wrong field) | `TimerBody` now computes from `step_config.cycles × (inhale+exhale+hold)` | Fixed |
| Text-input showing no prompt | `TextInputBody` resolves `step_config.prompt_slot` via `PROMPT_SLOT_TEXT` map | Fixed |
| "Leave a voice note" carry in release (no recording) | Migration 0148 deleted the carry pool row | Fixed |
| Actions gated behind phase timer (visible only after 4–7s) | `RoomOpeningExperience` phase machine removed; actions render immediately | Fixed |

---

## Q5: Are we honest to ship from a room-surface perspective?

**Yes.**

Every user-visible surface produces a real result on tap. Every content surface renders authored content from the backend. No stub, no dead tap, no false affordance exists in the shipped rooms.

**Remaining known gaps (tracked, not blocking):**

| Gap | Impact | Severity |
|-----|--------|----------|
| `principle_name` returns slug (e.g., `gita_chain_from_dwelling_to_fall`) instead of display name | Shown briefly in `WhyThisL2Sheet` header before fetch overwrites | Low |
| `RoomProvenance` TS type missing 4 BE fields (`visit_number`, `render_phase`, `life_context_applied`, `life_context_skipped`) | Type-only gap, no runtime crash | Low |
| `VisualAnchorKind` enum stale | Type-only gap | Low |

None of these gaps are user-visible as broken behavior.

---

## Per-Room Surface Summary (final state)

### room_stillness
1. Opening line — immediate render
2. Second beat line — immediate render
3. Principle banner — taps open WhyThisL2Sheet
4. Mantra runner pill — navigates to runner
5. Breathe step pill — opens StepModal with timer
6. Exit — returns to dashboard

### room_clarity
1. Opening line
2. Second beat line
3. Mantra runner pill
4. Grounding step pill — opens StepModal
5. Teaching pill — opens WhyThisL2Sheet
6. Inquiry pill — opens InquiryModal (2-screen)
7. Exit

### room_growth
1. Opening line
2. Second beat line
3. Principle banner — taps open WhyThisL2Sheet
4. Mantra runner pill
5. Walk step pill — opens StepModal with timer
6. Inquiry pill
7. Journal carry pill — writes sacred event
8. Exit

### room_connection
1. Opening line
2. Second beat line
3. Principle banner — taps open WhyThisL2Sheet
4. Mantra runner pill
5. Text-input step pill — opens StepModal with prompt
6. Named carry pill — writes sacred event
7. Exit

### room_release
1. Opening line
2. Second beat line
3. Principle banner — taps open WhyThisL2Sheet
4. Breathe step pill
5. Mantra runner pill
6. Exit

### room_joy
1. Opening line
2. Second beat line
3. Principle banner — taps open WhyThisL2Sheet
4. Mantra runner pill
5. Text-input step pill
6. Joy carry pill — writes sacred event
7. Sankalp runner pill
8. Exit
