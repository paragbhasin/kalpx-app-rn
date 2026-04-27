# Room Surface Runtime Contract

**Locked:** 2026-04-22  
**Branch:** journey-v3-fe  
**Status:** Implementation complete. All surfaces reflect live runtime behavior.

---

## Locked Foundations

| Decision | Contract |
|----------|----------|
| Step = practice surface | Step pool is what BE emits. Practice fallback lane is internal only — never surfaces to user. |
| Practice fallback | `room_selection.py` emits `in_room_step` first; practice pool is the else-branch. No active room ever falls through to it. |
| Banner wisdom tap | Must open real content. Wired in this sprint via `open_why_this_l2` dispatch (RoomPrincipleBanner.tsx). |
| Dead tap targets | None permitted in shipped rooms. |
| Teaching pill | Clarity only. Backend carries `teaching_payload`. All other rooms use banner. |

---

## Room-by-Room Surface Table

### room_stillness

| Surface | Backend Source | Selector Path | FE Component | Tap Behavior | Status |
|---------|---------------|---------------|--------------|--------------|--------|
| Opening line | `WisdomAsset.body` (stillness opening pool) | `_emit_opening_line()` → `opening_line` field | `RoomOpeningExperience` → text | None | LIVE |
| Second beat line | `WisdomAsset.body` (second beat pool) | `_emit_second_beat()` → `second_beat_line` field | `RoomOpeningExperience` → text | None | LIVE |
| Principle banner | `WisdomPrinciple.wisdom_anchor_line` (stillness banner pool) | `_emit_banner()` → `principle_banner` scalar | `RoomPrincipleBanner` → `RoomActionBannerScalar` | Opens WhyThisL2Sheet with full principle body | LIVE |
| Mantra runner | `MasterMantra` (stillness mantra pool) | `_emit_mantra()` → `action_type: runner_mantra` | `RoomActionRunnerPill` | Navigates to cycle_transitions/offering_reveal | LIVE |
| Breathe step | `StepTemplate` (breathe template) | `_emit_step()` → `action_type: in_room_step` | `RoomActionStepPill` → `StepModal` → `TimerBody` | Opens breathe timer (duration from step_config) | LIVE |
| Exit | Synthesized by serializer | Always last in `actions[]` | `RoomActionExitPill` | Returns to dashboard | LIVE |

**No picker.** No carry. No inquiry. No teaching pill.

---

### room_clarity

| Surface | Backend Source | Selector Path | FE Component | Tap Behavior | Status |
|---------|---------------|---------------|--------------|--------------|--------|
| Opening line | `WisdomAsset.body` | `_emit_opening_line()` | `RoomOpeningExperience` | None | LIVE |
| Second beat line | `WisdomAsset.body` | `_emit_second_beat()` | `RoomOpeningExperience` | None | LIVE |
| Principle banner | **null** — clarity suppresses banner | n/a | n/a | n/a | INTENTIONAL NULL |
| Mantra runner | `MasterMantra` | `_emit_mantra()` → `runner_mantra` | `RoomActionRunnerPill` | cycle_transitions/offering_reveal | LIVE |
| Grounding step | `StepTemplate` (grounding) | `_emit_step()` → `in_room_step` | `RoomActionStepPill` → `StepModal` → `GroundingBody` | Opens grounding step | LIVE |
| Teaching pill | `WisdomPrinciple` + `teaching_payload` authored in pool | `_emit_teaching()` → `action_type: teaching` | `RoomActionTeachingPill` | Opens WhyThisL2Sheet with full principle body | LIVE |
| Inquiry pill | `InquiryCategory[]` from inquiry pool | `_emit_inquiry()` → `action_type: inquiry` | `RoomActionInquiryPill` → `InquiryModal` | Opens 2-screen inquiry flow | LIVE |
| Exit | Synthesized | Always last | `RoomActionExitPill` | Returns to dashboard | LIVE |

**Picker:** clarity/all 7 contexts. No carry.

---

### room_growth

| Surface | Backend Source | Selector Path | FE Component | Tap Behavior | Status |
|---------|---------------|---------------|--------------|--------------|--------|
| Opening line | `WisdomAsset.body` | `_emit_opening_line()` | `RoomOpeningExperience` | None | LIVE |
| Second beat line | `WisdomAsset.body` | `_emit_second_beat()` | `RoomOpeningExperience` | None | LIVE |
| Principle banner | `WisdomPrinciple.wisdom_anchor_line` | `_emit_banner()` → `principle_banner` | `RoomPrincipleBanner` | Opens WhyThisL2Sheet | LIVE |
| Mantra runner | `MasterMantra` | `_emit_mantra()` → `runner_mantra` | `RoomActionRunnerPill` | cycle_transitions/offering_reveal | LIVE |
| Walk step | `StepTemplate` (walk_timer) | `_emit_step()` → `in_room_step` | `RoomActionStepPill` → `StepModal` → `TimerBody` | Opens walk timer | LIVE |
| Inquiry pill | `InquiryCategory[]` | `_emit_inquiry()` → `inquiry` | `RoomActionInquiryPill` → `InquiryModal` | Opens 2-screen inquiry | LIVE |
| Journal carry | `MasterCarry` (growth_journal) | `_emit_carry()` → `in_room_carry` | `RoomActionCarryPill` | Writes sacred event + Redux trace | LIVE |
| Exit | Synthesized | Always last | `RoomActionExitPill` | Returns to dashboard | LIVE |

**Picker:** growth/all 7 contexts.

---

### room_connection

| Surface | Backend Source | Selector Path | FE Component | Tap Behavior | Status |
|---------|---------------|---------------|--------------|--------------|--------|
| Opening line | `WisdomAsset.body` | `_emit_opening_line()` | `RoomOpeningExperience` | None | LIVE |
| Second beat line | `WisdomAsset.body` | `_emit_second_beat()` | `RoomOpeningExperience` | None | LIVE |
| Principle banner | `WisdomPrinciple.wisdom_anchor_line` | `_emit_banner()` | `RoomPrincipleBanner` | Opens WhyThisL2Sheet | LIVE |
| Mantra runner | `MasterMantra` | `_emit_mantra()` | `RoomActionRunnerPill` | cycle_transitions/offering_reveal | LIVE |
| Text-input step | `StepTemplate` (text_input_name_short) | `_emit_step()` → `in_room_step` | `RoomActionStepPill` → `StepModal` → `TextInputBody` | Opens text prompt | LIVE |
| Named carry | `MasterCarry` (connection_named) | `_emit_carry()` → `in_room_carry` | `RoomActionCarryPill` | Writes sacred event + Redux trace | LIVE |
| Exit | Synthesized | Always last | `RoomActionExitPill` | Returns to dashboard | LIVE |

**No picker** (money_security context deferred; picker hidden until proven).

---

### room_release

| Surface | Backend Source | Selector Path | FE Component | Tap Behavior | Status |
|---------|---------------|---------------|--------------|--------------|--------|
| Opening line | `WisdomAsset.body` | `_emit_opening_line()` | `RoomOpeningExperience` | None | LIVE |
| Second beat line | `WisdomAsset.body` | `_emit_second_beat()` | `RoomOpeningExperience` | None | LIVE |
| Principle banner | `WisdomPrinciple.wisdom_anchor_line` | `_emit_banner()` | `RoomPrincipleBanner` | Opens WhyThisL2Sheet | LIVE |
| Breathe step | `StepTemplate` (breathe) | `_emit_step()` → `in_room_step` | `RoomActionStepPill` → `StepModal` → `TimerBody` | Opens breathe timer | LIVE |
| Mantra runner | `MasterMantra` | `_emit_mantra()` | `RoomActionRunnerPill` | cycle_transitions/offering_reveal | LIVE |
| Exit | Synthesized | Always last | `RoomActionExitPill` | Returns to dashboard | LIVE |

**Picker:** release/5 contexts (work_career, relationships, self, health_energy, money_security).  
**Voice note carry removed** — migration 0148 deleted the pool row. No dead affordance.

---

### room_joy

| Surface | Backend Source | Selector Path | FE Component | Tap Behavior | Status |
|---------|---------------|---------------|--------------|--------------|--------|
| Opening line | `WisdomAsset.body` | `_emit_opening_line()` | `RoomOpeningExperience` | None | LIVE |
| Second beat line | `WisdomAsset.body` | `_emit_second_beat()` | `RoomOpeningExperience` | None | LIVE |
| Principle banner | `WisdomPrinciple.wisdom_anchor_line` | `_emit_banner()` | `RoomPrincipleBanner` | Opens WhyThisL2Sheet | LIVE |
| Mantra runner | `MasterMantra` | `_emit_mantra()` | `RoomActionRunnerPill` | cycle_transitions/offering_reveal | LIVE |
| Text-input step | `StepTemplate` (text_input_name_full) | `_emit_step()` → `in_room_step` | `RoomActionStepPill` → `StepModal` → `TextInputBody` | Opens text prompt | LIVE |
| Joy carry | `MasterCarry` (joy_carry) | `_emit_carry()` → `in_room_carry` | `RoomActionCarryPill` | Writes sacred event + Redux trace | LIVE |
| Sankalp runner | `MasterSankalp` (joy sankalp pool) | `_emit_sankalp()` → `runner_sankalp` | `RoomActionRunnerPill` | cycle_transitions/offering_reveal | LIVE |
| Exit | Synthesized | Always last | `RoomActionExitPill` | Returns to dashboard | LIVE |

**No picker.** Joy is a permanent exception — no life-context bias applies.

---

## Surface-Type Master Reference

| Action Type | FE Dispatcher | When present |
|-------------|--------------|--------------|
| `runner_mantra` | `RoomActionRunnerPill` | All 6 rooms |
| `runner_sankalp` | `RoomActionRunnerPill` | joy only |
| `runner_practice` | `RoomActionRunnerPill` | Never (step fallback lane, not reached) |
| `teaching` | `RoomActionTeachingPill` | clarity only |
| `inquiry` | `RoomActionInquiryPill` | clarity, growth |
| `in_room_step` | `RoomActionStepPill` → `StepModal` | All 6 rooms |
| `in_room_carry` | `RoomActionCarryPill` | growth, connection, joy |
| `exit` | `RoomActionExitPill` | All 6 rooms |
| `principle_banner` | `RoomPrincipleBanner` (top-level, not action) | 5 rooms (not clarity) |

## Practice Surface Clarification (Locked)

Step IS the practice surface. `_emit_step()` returns an `in_room_step` action in all 6 rooms. `_emit_practice()` is the else-branch in `room_selection.py` — it fires only when the step pool returns nothing. No room currently falls through. Practice as a distinct surface does not exist from the user's perspective.

## Picker Policy (Locked)

| Room | Picker shown | Contexts |
|------|-------------|----------|
| room_clarity | Yes | all 7 (work_career, relationships, self, health_energy, money_security, purpose_direction, daily_life) |
| room_growth | Yes | all 7 |
| room_release | Yes | 5 (excludes purpose_direction, daily_life) |
| room_stillness | No | — |
| room_connection | No | — |
| room_joy | No | — |
