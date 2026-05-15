# Room Surface Data Flow Map

**Date:** 2026-04-22  
**Branch:** journey-v3-fe  
**Purpose:** End-to-end traceability from backend content model through to what the user actually sees.

---

## Architecture overview

```
DB Model (WisdomPrinciple / MasterMantra / MasterCarry / StepTemplate)
  → room_selection.py selector (_emit_* methods)
    → RoomRenderSerializer → /api/mitra/rooms/{id}/render/ JSON
      → RoomContainer fetch (mitraApi axios) → RoomRenderV1 TS type
        → RoomRenderer → RoomPrincipleBanner / RoomActionList
          → per-action sub-component → tap handler → executeAction dispatch
```

---

## Surface-by-Surface Data Flow

### 1. Opening Line

| Layer | Detail |
|-------|--------|
| DB / content source | `WisdomAsset` — body field. Pool: `{room_id}_opening` |
| Selector | `_emit_opening_line()` in `room_selection.py` |
| Serializer field | `RoomRenderV1.opening_line: string` |
| RN ingest | `RoomContainer` passes full `RoomRenderV1` to `RoomRenderer` |
| UI component | `RoomOpeningExperience` — renders `envelope.opening_line` as primary text |
| Tap handler | None — ambient text |
| User sees | Room entry phrase. Renders immediately on mount. |
| Honest to ship | Yes |

---

### 2. Second Beat Line

| Layer | Detail |
|-------|--------|
| DB / content source | `WisdomAsset` — body field. Pool: `{room_id}_second_beat` |
| Selector | `_emit_second_beat()` in `room_selection.py` |
| Serializer field | `RoomRenderV1.second_beat_line: string | null`. Null for rooms that omit it. |
| RN ingest | `RoomOpeningExperience` reads `envelope.second_beat_line` |
| UI component | `RoomOpeningExperience` — suppressed when null (I-6) |
| Tap handler | None — ambient text |
| User sees | Secondary phrase after opening line, or nothing |
| Honest to ship | Yes |

---

### 3. Principle Banner

| Layer | Detail |
|-------|--------|
| DB / content source | `WisdomPrinciple` — `wisdom_anchor_line`, `principle_id`, `principle_name` fields. Pool: `{room_id}_banner` |
| Selector | `_emit_banner()` in `room_selection.py`. Returns null for room_clarity. |
| Serializer field | `RoomRenderV1.principle_banner: PrincipleBanner | null` — scalar, not in `actions[]` |
| RN ingest | `RoomRenderer` reads `envelope.principle_banner` directly |
| UI component | `RoomPrincipleBanner` → `RoomActionBannerScalar` — renders `wisdom_anchor_line` as italic text |
| Tap handler | `open_why_this_l2` dispatch with `principle_id`. Stamps `wisdom_anchor_line` as placeholder body → sheet renders immediately → handler fetch overwrites with full `WisdomPrinciple` body + sources. |
| User sees | Italic wisdom quote. Tap opens WhyThisL2Sheet. |
| Honest to ship | Yes (wired 2026-04-22) |

---

### 4. Teaching Pill

| Layer | Detail |
|-------|--------|
| DB / content source | `WisdomPrinciple` — `principle_id`, `principle_name`, `body`, `sources[]`. Teaching payload authored in pool's `rotation_refs` item. |
| Selector | `_emit_teaching()` in `room_selection.py`. Only fires for `room_clarity`. |
| Serializer field | `ActionEnvelope.teaching_payload: TeachingPayload`. Field in `actions[]` with `action_type: "teaching"`. |
| RN ingest | `RoomActionList.renderActionComponent` switch → `RoomActionTeachingPill` |
| UI component | `RoomActionTeachingPill` — rendered as a tappable pill with `action.label` |
| Tap handler | Stamps `teaching_payload` as `why_this_principle` in screenData → dispatches `open_why_this_l2` with `principle_id` |
| User sees | Pill label (e.g., "Explore this insight"). Tap opens WhyThisL2Sheet with principle body + optional "Go deeper". |
| Honest to ship | Yes |

---

### 5. Mantra Runner Pill

| Layer | Detail |
|-------|--------|
| DB / content source | `MasterMantra` — title, deity, source, tradition, iast, devanagari, meaning, essence, audio_url. Pool: `{room_id}_mantra` |
| Selector | `_emit_mantra()` → `action_type: runner_mantra` in `actions[]` |
| Serializer field | `ActionEnvelope.runner_payload: CanonicalRichRunnerPayloadV1` with `runner_kind: "mantra"` |
| RN ingest | `RoomActionList` switch → `RoomActionRunnerPill` |
| UI component | `RoomActionRunnerPill` — rendered as a tappable pill |
| Tap handler | `start_runner` dispatch → routes to `cycle_transitions/offering_reveal` screen |
| User sees | Pill label (mantra title). Tap launches runner experience. |
| Honest to ship | Yes |

---

### 6. Sankalp Runner Pill

| Layer | Detail |
|-------|--------|
| DB / content source | `MasterSankalp` — title, insight, how_to_live[], benefits[]. Pool: `{room_id}_sankalp` |
| Selector | `_emit_sankalp()` → `action_type: runner_sankalp`. Present in `room_joy` only. |
| Serializer field | `ActionEnvelope.runner_payload` with `runner_kind: "sankalp"` |
| RN ingest | `RoomActionList` switch → `RoomActionRunnerPill` (same component as mantra) |
| UI component | `RoomActionRunnerPill` |
| Tap handler | `start_runner` dispatch → `cycle_transitions/offering_reveal` |
| User sees | Sankalp pill. Tap launches runner. |
| Honest to ship | Yes |

---

### 7. Step / Practice Pill

| Layer | Detail |
|-------|--------|
| DB / content source | `StepTemplate` — `template_id`, `step_config` (JSONB with template-specific fields). Pool: `{room_id}_step` |
| Selector | `_emit_step()` → `action_type: in_room_step`. Practice pool = else-branch, never reached in any active room. |
| Serializer field | `ActionEnvelope.step_payload: StepPayload` — `template_id` + `step_config` + `input_slots` |
| RN ingest | `RoomActionList` switch → `RoomActionStepPill` |
| UI component | `RoomActionStepPill` → opens `StepModal` → classifies template → mounts body component |
| Template dispatch | `breathe` / `walk_timer` → `TimerBody` (duration from `step_config.cycles × (inhale+exhale+hold)`); `text_input_name_short` / `text_input_name_full` → `TextInputBody` (prompt from `PROMPT_SLOT_TEXT[step_config.prompt_slot]`); `grounding` → `GroundingBody`; `hand_on_heart` → `HandOnHeartBody` |
| Tap handler | Opens `StepModal`. On completion, dispatches `room_step_completed`. |
| User sees | Step pill label. Tap opens modal with step UI. |
| Honest to ship | Yes |

**Practice note:** `runner_practice` action_type dispatches to the same `RoomActionRunnerPill`. It would only appear if step pool returned empty. No room currently emits it.

---

### 8. Inquiry Pill

| Layer | Detail |
|-------|--------|
| DB / content source | `InquiryCategory[]` authored in pool item. Fields: id, label, anchor_line, prompt, practice_label, principle_id. |
| Selector | `_emit_inquiry()` → `action_type: inquiry`. Present in `room_clarity` + `room_growth`. |
| Serializer field | `ActionEnvelope.inquiry_payload: InquiryPayload` — `categories: InquiryCategory[]` |
| RN ingest | `RoomActionList` switch → `RoomActionInquiryPill` |
| UI component | `RoomActionInquiryPill` → opens `InquiryModal` |
| Tap handler | Opens `InquiryModal` (2 screens: category list → detail with practice/journal). Fires telemetry: `room_inquiry_opened`, `room_inquiry_category_selected`, `room_step_completed`. |
| User sees | Inquiry pill. Tap opens category list → select category → see anchor line + practice prompt. |
| Honest to ship | Yes |

---

### 9. Carry Pill

| Layer | Detail |
|-------|--------|
| DB / content source | `MasterCarry` — label, writes_event. Pool: `{room_id}_carry`. |
| Selector | `_emit_carry()` → `action_type: in_room_carry`. Present in growth (journal), connection (named), joy (carry + named). |
| Serializer field | `ActionEnvelope.carry_payload: CarryPayload` — `writes_event`, `persists` |
| RN ingest | `RoomActionList` switch → `RoomActionCarryPill` |
| UI component | `RoomActionCarryPill` — pill with label |
| Tap handler | (1) POST to `/api/mitra/rooms/{room_id}/sacred/` with `writes_event`; (2) Redux session-trace write under `writes_event` key. Dual-write — Redux is the durability guarantee on BE failure. |
| User sees | Carry pill label (e.g., "Name what brought you joy"). Tap records the sacred event. No modal — tap is the gesture. |
| Honest to ship | Yes |

---

### 10. Exit Pill

| Layer | Detail |
|-------|--------|
| DB / content source | Synthesized by serializer — not a content row. Always last in `actions[]`. |
| Selector | `_emit_exit()` — always present; no pool lookup |
| Serializer field | `ActionEnvelope` with `action_type: "exit"`, `exit_payload: { returns_to: "dashboard" }` |
| RN ingest | `RoomActionList` switch → `RoomActionExitPill` |
| UI component | `RoomActionExitPill` |
| Tap handler | `room_exit` dispatch → navigates to dashboard |
| User sees | Exit button (e.g., "Return", "Leave this room"). Tap ends session. |
| Honest to ship | Yes |

---

## Final Ship-Truth Table

| Surface | Source content | Selector | Envelope field | RN ingest path | UI component | Tap result | Honest to ship? |
|---------|---------------|----------|---------------|---------------|--------------|-----------|----------------|
| Opening line | WisdomAsset.body | `_emit_opening_line()` | `opening_line` | RoomOpeningExperience | text | None (ambient) | Yes |
| Second beat line | WisdomAsset.body | `_emit_second_beat()` | `second_beat_line` | RoomOpeningExperience | text | None (ambient) | Yes |
| Principle banner | WisdomPrinciple.wisdom_anchor_line + principle_id | `_emit_banner()` | `principle_banner` scalar | RoomPrincipleBanner | italic text (tappable) | Opens WhyThisL2Sheet | Yes |
| Teaching pill | WisdomPrinciple + teaching_payload | `_emit_teaching()` | `actions[].teaching_payload` | RoomActionTeachingPill | pill | Opens WhyThisL2Sheet | Yes |
| Mantra runner | MasterMantra | `_emit_mantra()` | `actions[].runner_payload (mantra)` | RoomActionRunnerPill | pill | cycle_transitions/offering_reveal | Yes |
| Sankalp runner | MasterSankalp | `_emit_sankalp()` | `actions[].runner_payload (sankalp)` | RoomActionRunnerPill | pill | cycle_transitions/offering_reveal | Yes |
| Step/practice | StepTemplate.step_config | `_emit_step()` | `actions[].step_payload` | RoomActionStepPill → StepModal | pill → modal | Opens step experience | Yes |
| Inquiry pill | InquiryCategory[] | `_emit_inquiry()` | `actions[].inquiry_payload` | RoomActionInquiryPill → InquiryModal | pill | Opens 2-screen inquiry | Yes |
| Carry pill | MasterCarry | `_emit_carry()` | `actions[].carry_payload` | RoomActionCarryPill | pill | Sacred write + Redux trace | Yes |
| Exit pill | Synthesized | `_emit_exit()` | `actions[].exit_payload` | RoomActionExitPill | button | Returns to dashboard | Yes |

---

## Known gaps (tracked, not blocking)

| Gap | Affects | Severity |
|-----|---------|----------|
| `principle_name` returns slug not display name | Banner + teaching pill sheet header (pre-fetch) | Low — overwrites after fetch |
| `RoomProvenance` TS type missing 4 fields | Type completeness only, non-breaking | Low |
| `VisualAnchorKind` enum stale | Type completeness only | Low |
| `principle_name` slug vs. display name in sheet header (pre-fetch) | Banner + teaching pill | Low — overwrites after fetch |
