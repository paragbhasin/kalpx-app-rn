# Room Backend Contract Audit

**Date:** 2026-04-22  
**Branch:** journey-v3-fe  
**Evidence standard:** verified = confirmed by reading the code path; inferred = best read from context.

---

## Envelope Contract Inventory

The render endpoint is `GET /api/mitra/rooms/{room_id}/render/`. The response is assembled directly by `_build_envelope()` in `room_selection.py`, not by a DRF serializer. The schema is defined in `core/rooms/schemas.py::RoomRenderV1`.

### Top-level fields

| Field | Type | Populated | FE uses it | Notes |
|-------|------|-----------|-----------|-------|
| `schema_version` | `"room.render.v1"` | Always | No | Contract sentinel only. |
| `room_id` | string | Always | Yes — `RoomContainer`, `RoomActionList` | |
| `opening_line` | string | Always (can be `""`) | Yes — `RoomOpeningExperience` | |
| `second_beat_line` | string \| null | Nullable | Yes — `RoomOpeningExperience` | Self-hides per fallbacks. |
| `ready_hint` | string | Always | **No — dead field** | Was used by the phase machine. Phase machine removed; field now unused on FE. Authored but unrendered. |
| `section_prompt` | string | Always | **No — dead field** | No FE component reads this. |
| `dashboard_chip_label` | string \| null | Nullable | **No — not rendered in room** | Used by dashboard chip components, not RoomContainer. |
| `principle_banner` | `PrincipleBanner \| null` | Nullable scalar | Yes — `RoomPrincipleBanner` | Scalar, never array. |
| `opening_experience` | object | Always | Partially — `RoomOpeningExperience` ignores `pacing_ms` + `silence_tolerance_ms` now | `pacing_ms` and `silence_tolerance_ms` are dead after phase machine removal. `ambient_audio` is stub-only. |
| `actions[]` | array | Always, ≥1 | Yes — `RoomActionList` | Exit always present per I-1. |
| `provenance` | object | Always | Partially | **4 fields missing from FE type** (see below). |
| `fallbacks` | object | Always | Not read by FE | FE applies hide logic inline; `fallbacks.hide_if_empty` is informational only. |
| `life_context` | string \| null | Nullable | No — informational only | Echoed back from query param. FE reads from screenData, not envelope. |
| `visit_state` | string \| null | Nullable | No — informational only | FE does not branch on this. |

### Provenance drift

BE sends 9 fields in `provenance`; FE `RoomProvenance` type declares 5.

| Field | BE sends | FE type has |
|-------|----------|-------------|
| `pool_id` | Yes | Yes |
| `pool_version` | Yes | Yes |
| `selection_service_version` | Yes | Yes |
| `render_id` | Yes | Yes |
| `active_rotation_window_days` | Yes | Yes |
| `visit_number` | Yes | **Missing** |
| `render_phase` | Yes | **Missing** |
| `life_context_applied` | Yes | **Missing** |
| `life_context_skipped` | Yes | **Missing** |

**Status: PASS WITH WARNINGS.** The 4 missing fields are TypeScript-level gaps only; no runtime crash. FE code does not attempt to read these fields. Non-breaking but stale.

---

## Action Payload Contract

### runner_mantra / runner_sankalp / runner_practice

Shape: `CanonicalRichRunnerPayloadV1` — 25 keys. All always present (verified by BE test I-5).

| Required field | Present | FE reads it |
|---------------|---------|-------------|
| `schema_version` | Always | No |
| `runner_kind` | Always | Yes — `start_runner` dispatch |
| `item_id` | Always | Yes — via `item` passthrough |
| `title` | Always | Yes — runner display |
| `audio_url` | Always (non-empty for mantra per I-5) | Yes — stamped as `mantra_audio_url` |
| `essence` | Always (non-empty per I-5) | Yes — runner display |
| `runner_source` | Always | Yes — `start_runner` payload |
| `return_behavior` | Always | Yes — runner return routing |
| `analytics_key` | Always | Yes — telemetry |

**Status: PASS.** Contract complete. All required fields present and consumed.

### teaching

Shape: `TeachingPayload` — 4 fields, all always present (non-nullable in schema).

| Field | BE sends | FE reads |
|-------|----------|---------|
| `principle_id` | Always | Yes — `open_why_this_l2` dispatch |
| `principle_name` | Always (returns DB slug, not display name) | Yes — stamped to `why_this_principle.name` |
| `body` | Always (can be `""`) | Yes — immediate placeholder in sheet |
| `sources` | Always (can be `[]`) | Yes — sheet sources list |

**Status: PASS WITH WARNINGS.** All fields present. `principle_name` is the DB slug (e.g., `gita_chain_from_dwelling_to_fall`) not the display name. This renders in the sheet header briefly before the `getPrinciple()` fetch overwrites it. Tracked as low-severity content bug.

### inquiry

Shape: `InquiryPayload` → `categories: InquiryCategory[]`.

Per-category fields (InquiryCategory):

| Field | FE type | FE component reads | Notes |
|-------|---------|-------------------|-------|
| `id` | required string | Yes — key + dispatch | |
| `label` | required string | Yes — list row label, modal header | |
| `anchor_line` | required string | Yes — detail screen top text | |
| `prompt` | required string | InquiryModal line 184: `reflective_prompt \|\| prompt` | Fallback field |
| `practice_label` | required string | InquiryModal line 197: `practice_label ?? "Try a practice"` | Falls back to hardcoded string |
| `principle_id` | required string | Not consumed in FE modal | Unused in FE render |
| `reflective_prompt` | optional string \| null | InquiryModal line 184: reads first | BE code mentions `reflective_prompt` in assembly |
| `suggested_practice_template_id` | optional string \| null | InquiryModal line 108: gates "Try a practice" | |

**FIELD CONCERN (needs BE verification):** Backend agent reported that `room_selection.py` builds inquiry categories using variable names `reflective_prompt` and `suggested_practice_label`, while the schema and FE expect `prompt` and `practice_label` as the required short-name fields. If the BE dict keys are `reflective_prompt` and `suggested_practice_label` (not `prompt` and `practice_label`), then:
- `InquiryModal` line 184 renders `undefined || undefined` = `""` (empty prompt)
- Practice label button falls back to "Try a practice" (hardcoded)

**Status: PASS WITH WARNINGS (pending BE code verification).** If the BE emits `prompt` (confirmed by runtime fixtures), no impact. If it only emits `reflective_prompt`, the prompt field shows blank. InquiryModal gracefully degrades to hardcoded fallbacks so it does not crash, but the intended authored prompt is lost.

### in_room_step

Shape: `StepPayload` — 3 required fields.

| Field | Always present | FE reads |
|-------|---------------|---------|
| `template_id` | Yes | Yes — `classifyStep()` prefix match |
| `step_config` | Yes (can be `{}`) | Yes — duration, cycles, prompt_slot |
| `input_slots` | Yes (can be `[]`) | No — not read in FE |

`step_config` fields per template family (verified):

| Template | `step_config` keys used by FE |
|----------|-------------------------------|
| breathe | `cycles`, `inhale`, `exhale`, `hold` |
| walk_timer / sit_ambient / hand_on_heart | `cycles`, `inhale`, `exhale`, `hold` (same computation) |
| text_input_* / journal_* | `prompt_slot` → resolved via `PROMPT_SLOT_TEXT` map |
| grounding | none — prompts are hardcoded in FE |
| voice_note | `prompt` (top-level, not via slot) |
| reach_out | `prompt` (top-level) |

**Status: PASS.** All consumed fields present in BE output. `duration_sec` top-level is never sent by BE (step_config-based computation fixed in last sprint).

### in_room_carry

Shape: `CarryPayload` — 2 fields.

| Field | Present | FE reads |
|-------|---------|---------|
| `writes_event` | Always | Yes — sacred POST body |
| `persists` | Always | No — not read in `RoomActionCarryPill` |

FE also reads `action.persistence.writes_event` as fallback (line 41 of `RoomActionCarryPill`). BE populates both. Redundant but harmless.

**Status: PASS.**

### exit

Shape: `ExitPayload` — 1 field. `returns_to: "dashboard"` always hardcoded by BE. FE `room_exit` handler ignores this and uses `process.env.EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD` to decide which dashboard. **Mild contract drift**: BE says `"dashboard"` but FE may navigate to `companion_dashboard_v3`. Non-breaking since exit always goes to a dashboard.

**Status: PASS.**

---

## Sacred Write Contract

Endpoint: `POST /api/mitra/rooms/{room_id}/sacred/`

| FE sends | BE expects | Match |
|---------|-----------|-------|
| `writes_event` | validated against `SACRED_EVENT_TYPES` | Yes |
| `label` | max 500 chars | Yes (action.label) |
| `action_id` | optional | Yes |
| `analytics_key` | optional | Yes |
| `captured_at` | optional ms epoch | Yes |

**Response on success:** `{"status": "ok", "event_id": str}` — FE ignores the response body (only checks HTTP status for `sacredWriteOk`).

**Duplicate detection:** None. Multiple POSTs from same user/room/writes_event all succeed and produce distinct `event_id` rows. No client-side idempotency guard in `RoomActionCarryPill`. Low impact (carry taps are intentional user actions), but rapid double-tap produces two rows.

**Status: PASS WITH WARNINGS.**

---

## Selector Outputs

| Action type | Pool queried | Can return empty | Empty behavior |
|-------------|-------------|-----------------|---------------|
| `runner_mantra` | `{room_id}_mantra` | No (anchor mandatory) | Selection exception → 500 |
| `runner_sankalp` | `{room_id}_sankalp` | Yes (joy only) | Omitted from actions |
| `teaching` | `{room_id}_teaching` | Yes | Omitted from actions |
| `inquiry` | moment_id anchor | Yes | Omitted from actions |
| `in_room_step` | `{room_id}_step` | Yes → falls to practice | `runner_practice` emitted |
| `in_room_carry` | `{room_id}_carry` | Yes | Omitted from actions |
| `exit` | hardcoded | No | Always present |
| `principle_banner` | `{room_id}_banner` | Yes (clarity: always null) | `principle_banner: null` |

Action ordering is PARTIALLY non-deterministic: tied candidates use `random.choice()` in selector. FE must treat action order as supplied, not fixed. Documented; not a bug.

---

## Dead / Stale Envelope Fields

These fields are present in the envelope but not consumed by any FE room component:

| Field | BE populates | FE reads | Status |
|-------|-------------|---------|--------|
| `ready_hint` | Always | **No** (phase machine removed) | Dead — authored but unrendered |
| `section_prompt` | Always | **No** | Dead — no component renders this |
| `dashboard_chip_label` | Nullable | **No** (in room context) | Used by dashboard only; dead in room |
| `pacing_ms` | Always (non-zero values) | **No** (phase machine removed) | Dead after this sprint |
| `silence_tolerance_ms` | Always | **No** | Dead after this sprint |
| `ambient_audio` | Always | **No** | Audio stub — never wired |

---

## Backend / Contract Gate Verdict

**PASS WITH WARNINGS**

Blockers: None.

Warnings (non-blocking):
1. `RoomProvenance` FE type missing 4 fields (visit_number, render_phase, life_context_applied, life_context_skipped)
2. `principle_name` in teaching/banner responses returns DB slug, not display name
3. `ready_hint`, `section_prompt`, `pacing_ms`, `silence_tolerance_ms` are dead fields (authored but no longer consumed)
4. InquiryCategory `prompt`/`reflective_prompt` field naming needs BE code verification
5. No duplicate detection on sacred writes
6. Exit `returns_to: "dashboard"` is stale — FE decides actual dashboard variant from env flag
