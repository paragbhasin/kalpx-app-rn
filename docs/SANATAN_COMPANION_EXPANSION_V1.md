# Mitra v3 — Sanatan Companion Expansion (RFC)

**Date:** 2026-04-18
**Status:** Draft for founder review
**Authors:** Claude + Parag
**Scope:** Dashboard surfaces, support/joy/growth rooms, wisdom anchoring, voice-text input loop
**Related:** `docs/NEW_DASHBOARD_V1_SPEC.md`, `docs/PARKED_ITEMS.md`, `~/kalpx/docs/mitra-v3/RFC_TRACK_EVENT_TO_DECISION_LOG.md`

---

## 0. The frame we're changing

Today's dashboard quick-support area presents **3 deficit-framed actions**:
- I Feel Triggered
- Quick Check-in
- More support → (Grief / Loneliness)

This is **coping-app framing** — the UI only knows what to do when the user is struggling. A user who opens the app feeling steady, grateful, curious, or ready to grow has no authentic entry. The product quietly becomes "call when you're in trouble" rather than a **Sanatan life companion**.

This violates two durable project principles already in memory:
- `feedback_celebrate_life.md` — "Mitra celebrates good days, growth, joy, rhythm — not just a crisis companion"
- `feedback_sanatan_living_not_coping.md` — "CATEGORY-DEFINING: life companion rooted in Sanatan living, NOT an emotional support tool"

And per `mitra_onboarding_joy_inclusion.md` (2026-04-15, parked), the same bias exists in the 4-stage onboarding — all friction chips are deficit-framed.

**This RFC proposes the fix across 4 surfaces: dashboard, completions, voice/text input, and onboarding — unified under one content strategy.**

---

## 1. The three paths (product law)

Every user moment falls into one of three states:

| Path | Signal | Current coverage | Proposed rooms |
|---|---|---|---|
| **Struggle** | trigger, grief, loneliness, overwhelm | ✅ shipped (M34, M46, M47) | ✅ done |
| **Joy** | gratitude, accomplishment, lightness, festival, streak | ⚠️ partial (M44 embedded card, joy-signal endpoint) | 🆕 M48 Joy Room |
| **Growth** | seeking, deepening, question, intention, dharma-reflection | ❌ absent | 🆕 M49 Growth Room |

All three paths must be reachable from the dashboard **within one tap** (or one sheet-open). The dashboard is the only universal entry — everything else is navigation.

---

## 2. Dashboard redesign — the "Three Doors"

### 2.1 Current state
```
[ I Feel Triggered ]
[ Quick Check-in  ]
  More support ›
```

### 2.2 Proposed state
```
How are you entering today?     ← always-visible header line
[ 🌪 I'm struggling ]  [ ✨ I'm good ]  [ 🌱 I want to grow ]
   More support ›   (sheet opens below)
```

- **Three primary chips** = the three paths.
- **"More support ›"** sheet still exists, but now contains **4 rooms**: Grief, Loneliness, Joy, Growth. Also offers Triggered + Quick Check-in as legacy shortcuts.
- **Header copy** comes from `screenData.three_doors_header_label` (slot-resolved, sovereignty-compliant).

### 2.3 Tap behavior

| Chip | Dispatches | Lands on |
|---|---|---|
| I'm struggling | `open_struggle_menu` (sheet) | inner choice: Triggered / Grief / Loneliness / Quick check-in |
| I'm good | `enter_joy_room` | `support_joy` / `room` |
| I want to grow | `enter_growth_room` | `support_growth` / `room` |

### 2.4 Why 3 primary + drawer (not 6 flat)

Flat 6-chip row overwhelms cold open. Two-layer navigation:
- Layer 1 — which **path** are you on today (3 doors)
- Layer 2 — inside a path, the **specific room** (auto-routed for joy/growth; chooser for struggle)

The struggle path has 3 rooms because the user often already knows what's happening (triggered vs. grieving vs. lonely). Joy and growth can auto-route to a single room — the room itself asks the refining question.

---

## 3. Joy Room (M48) — spec

Structurally mirrors M46 grief_room. Files/wiring follow the same pattern used today by M46/M47.

### 3.1 ContentPack (`M48_joy_room.yaml`)

```yaml
moment_id: M48_joy_room

source_policy:
  primary_source: [bhakti, gita, joy_expansion]
  secondary_source: [yoga_sutras]
  default_visibility: implicit
  visibility_by_mode:
    universal: implicit
    hybrid: implicit
    rooted: lightly_named
  max_naming_frequency: once_per_variant
  allowed_surfaces: [support_room]

presentation_context:
  screen_id: support_rooms/joy_room
  user_attention_state: open_steady
  entry_path:
    - dashboard_door_joy
    - notification_streak_recognition
    - joy_signal_tap
  exit_paths:
    - mantra_runner_joy
    - gratitude_note_submitted
    - joy_walk_started
    - exit_joy_room
  reading_posture: open_receptive
  emotional_weight: light
  voice_mode_available: true
  silence_tolerance_sec: 4
  sibling_content_coupling: [M44_gratitude_joy_card, M_completion_return]

slots:
  opening_line:          { role: emphasized, required: true, max_chars: 60 }
  second_beat_line:      { role: body,       required: true, max_chars: 60 }
  ready_hint:            { role: caption,    required: false, max_chars: 32 }
  offer_intro_text:      { role: caption,    required: true,  max_chars: 60 }
  pill_gratitude_label:  { role: cta,        required: true,  max_chars: 28 }
  pill_mantra_label:     { role: cta,        required: true,  max_chars: 28 }
  pill_walk_label:       { role: cta,        required: true,  max_chars: 28 }
  pill_share_label:      { role: cta,        required: true,  max_chars: 28 }
  pill_sit_label:        { role: cta,        required: true,  max_chars: 20 }
  pill_exit_label:       { role: cta,        required: true,  max_chars: 20 }
  input_prompt:          { role: helper,     required: true,  max_chars: 60 }
  input_placeholder:     { role: placeholder, required: true, max_chars: 40 }
  input_submit_label:    { role: cta,        required: true,  max_chars: 20 }
  input_cancel_label:    { role: cta,        required: true,  max_chars: 20 }
  joy_mantra_item_id:    { role: config,     required: true,  max_chars: 80 }
  walk_duration_min:     { role: config,     required: true,  max_chars: 4 }
  principle_id:          { role: config,     required: true,  max_chars: 40 }
  principle_name:        { role: config,     required: true,  max_chars: 40 }
  wisdom_anchor_line:    { role: body,       required: false, max_chars: 90 }
```

### 3.2 Variant copy (universal/en baseline)

```yaml
opening_line: "Good to sit with you when the day is bright."
second_beat_line: "Notice it for a breath. Then choose how to honor it."
ready_hint: "Tap when you're ready"
offer_intro_text: "Ways to hold this, if any fit:"
pill_gratitude_label: "Write a gratitude note"
pill_mantra_label: "A mantra for this feeling"
pill_walk_label: "Walk with it for 10 minutes"
pill_share_label: "Share with one person"
pill_sit_label: "Just sit with it"
pill_exit_label: "Carry it forward"
input_prompt: "What's alive for you right now?"
input_placeholder: "Anything worth remembering..."
joy_mantra_item_id: "mantra.peace_calm.om_namah_shivaya"   # founder pick
walk_duration_min: 10
principle_id: "gita_nishkama_karma_as_celebration"
principle_name: "Nishkāma Karma"
wisdom_anchor_line: "Joy lives in the doing held lightly — not waiting at the finish line."
```

### 3.3 Pills → actions

| Pill | Action | Next |
|---|---|---|
| Write a gratitude note | `open_joy_input` (sets inputType="gratitude") | Input step → submit → quiet ack + return |
| A mantra for this feeling | `start_runner` with source=`support_joy`, variant=mantra, target_reps=27, item hydrated from `joy_mantra_item_id` | Core mantra render path (same as support_grief) |
| Walk with it | Walk timer (mirrors M47) | Timer done → return |
| Share with one person | `open_joy_input` (inputType="share") | Input for name → closes |
| Just sit with it | `stay` step (mirrors grief stay) | Audio loop (peaceful, not ritual_held) |
| Carry it forward | `exit_joy_room` | Dashboard |

---

## 4. Growth Room (M49) — spec

The growth room is for someone asking: **"I want to deepen / I have a question / I'm approaching a threshold."** Less about emotion, more about dharma inquiry.

### 4.1 Spec delta from M48

Most slot/pill structure is identical. Differences:

| Field | Joy Room | Growth Room |
|---|---|---|
| `user_attention_state` | `open_steady` | `seeking_discerning` |
| `reading_posture` | `open_receptive` | `contemplative` |
| `silence_tolerance_sec` | 4 | 10 (slower — thinking posture) |
| `emotional_weight` | light | moderate |

### 4.2 Growth pills

| Pill | Purpose |
|---|---|
| Ask a question | Text input → "Mitra answering voice" returns a principle-anchored reflection |
| Reflect on a teaching | Opens wisdom L2/L3 sheet seeded with today's `principle_id` |
| A mantra for clarity | Mantra runner (source=support_growth) |
| Practice for discernment | Practice runner (source=support_growth) |
| Journal a dharma question | Text input → submit → quiet ack |
| Carry the question forward | `exit_growth_room` |

### 4.3 Growth variant copy (universal/en)

```yaml
opening_line: "Good to sit with you when the question is open."
second_beat_line: "No hurry. Let's see what the day is asking."
ready_hint: "Tap when you're ready"
principle_id: "gita_swadharma"
principle_name: "Swadharma"
wisdom_anchor_line: "Your dharma, imperfectly walked, is stronger than another's perfectly performed."
```

---

## 5. Wisdom anchor beat (all completions)

### 5.1 The problem
Today's `M_completion_return` ends with:
> "Complete. You stayed with the sound."
> [Return to Mitra Home] [Repeat]

There's no connection between the practice the user just did and the **tradition it belongs to**. A mantra session ends identical to a trigger session — both feel transactional.

### 5.2 The proposal — add a sovereign wisdom beat

Extend `M_completion_return` with 2 optional slots:
- `wisdom_anchor_line` — one line of plain-English teaching, max 90 chars
- `wisdom_anchor_principle_id` — pointer so "Read more →" can drill into the L2 sheet (existing WhyThisSheet path)

Displayed as a quiet third line below the completion message:
```
✓
Complete. You stayed with the sound.
─────
Action without grasping carries its own fullness.
  Read more →  (opens L2 WhyThis sheet with principle_id="gita_nishkama_karma")
```

### 5.3 Which principle for which context?

Backend logic (add to `M_completion_return` resolver):
- If `runner_variant=mantra` + `runner_source=core` → pick from `principles_gita.yaml` + `principles_bhakti.yaml` scored by user's current `today_kosha/klesha`
- If `runner_variant=sankalp` + `runner_source=core` → pick from `principles_yoga_sutras.yaml` (sankalpa is a Sutra concept)
- If `runner_variant=practice` + `runner_source=core` → pick from `principles_yoga_sutras.yaml` + `principles_ayurveda.yaml`
- If `runner_source=support_grief` → `principles_grief.yaml` + `principles_bhakti.yaml` (karuna, maitri)
- If `runner_source=support_loneliness` → `principles_loneliness.yaml` + `principles_bhakti.yaml` (sat-sanga)
- If `runner_source=support_joy` → `principles_joy_expansion.yaml` (santosha, nishkama)
- If `runner_source=support_growth` → `principles_gita.yaml` + `principles_sankhya.yaml` + `principles_niti.yaml`

Picker respects mode (universal/hybrid/rooted), stays consistent per session (principle doesn't flip mid-day), and rotates over days.

### 5.4 Variant YAML shape

```yaml
- variant_id: M_completion_return_mantra_core_en
  applies_when: {runner_variant: "mantra", runner_source: "core"}
  slots:
    message: "Complete. You stayed with the sound."
    wisdom_anchor_line: "Action without grasping carries its own fullness."
    wisdom_anchor_principle_id: "gita_nishkama_karma"
    return_home_cta: "Return to Mitra Home"
    repeat_cta: "Repeat"
```

For the support-room variants already shipped in this session, add:
```yaml
wisdom_anchor_line: "Karuna held is stronger than karuna performed."
wisdom_anchor_principle_id: "bhakti_karuna_witness"
```

---

## 6. Mitra's answering voice (text/voice input handler)

### 6.1 The problem (the silent void)

Today the dashboard "How can I help you?" input dispatches `voice_input_send`. **That action has no backend handler.** Same for grief-room "I want to speak" submit, loneliness-room naming inputs, and the CompletionReturnTransient reflection input — user types into the void.

This is the single biggest silent failure in the app: every text/voice interaction promises a companion and delivers silence.

### 6.2 Phased strategy (no LLM on day 1)

**Phase 1 — Rule-based mirror + route (ships in 1 week)**
- New endpoint: `POST /api/mitra/voice-input/`
- Input: `{text, input_type, context: {surface, runner_source, mood, guidance_mode, today_kosha, today_klesha}}`
- Classifier runs on text:
  - Keyword match on struggle tokens → return `{mirror_line, suggested_action: "enter_grief_room" | "enter_loneliness_room" | "initiate_trigger"}`
  - Keyword match on joy tokens → `{mirror_line, suggested_action: "enter_joy_room"}`
  - Keyword match on question tokens (who/why/what/should/how) → `{mirror_line, suggested_action: "enter_growth_room", wisdom_principle_id: <picked>}`
  - Default (unclear) → `{mirror_line: "You're heard. Sitting with this for a moment.", suggested_action: "null"}`
- Response rendered inline below the input as a 2-line card:
  ```
  Mirror: "What's in you right now sounds heavy."
  → [Sit with me in the grief room]
  ```

**Phase 2 — Principle-anchored reply (week 2-3)**
- Classifier picks a principle from the appropriate YAML based on classified state
- Returns `{mirror_line, wisdom_anchor_line, principle_id, suggested_action}`
- FE renders the response card + optional "Read more →" L2 drill-down

**Phase 3 — LLM-backed multi-turn (month 2-3)**
- Same endpoint shape, but classifier → LLM with tight system prompt citing the 19 principle YAMLs as retrieval context
- Multi-turn via `conversation_id` returned from first call
- Gated behind user consent + cost monitoring
- Never invents principles outside the registry

### 6.3 Surface rendering rules

| Surface | Input context | Response render |
|---|---|---|
| Dashboard "How can I help?" | surface=dashboard, runner_source=null | Inline response card below input + optional route CTA |
| Grief room "I want to speak" | surface=support_grief | Quiet ack + return to options ("Held. Sit a moment.") |
| Loneliness naming input | surface=support_loneliness | Quiet ack + return to options ("Named. That matters.") |
| CompletionReturnTransient reflection | surface=completion, runner_source=* | Silent store to JourneyReflections table, return-home runs |
| Joy room gratitude note | surface=support_joy | Post to gratitude-ledger (existing), quiet ack |
| Growth room question | surface=support_growth | **Full response** — mirror + wisdom_anchor + optional L2 |

Only the **dashboard** and **growth room** render visible Mitra-replies. All others use the input to **deepen silent understanding** (log + route + acknowledge). This preserves the "listening presence" posture in high-stakes rooms — Mitra doesn't chatter at grief.

---

## 7. Content sources → surfaces mapping

All 19 principle YAMLs + wisdom-en.json (127 snippets) mapped to surfaces:

| File | Count (est) | Status | Primary surface | Secondary |
|---|---|---|---|---|
| `principles_gita.yaml` | ~12 | approved | Completion (core mantra) | Growth room |
| `principles_yoga_sutras.yaml` | ~12 | approved | Completion (sankalp/practice) | Growth room |
| `principles_sankhya.yaml` | ~10 | approved | Growth room, WhyThis L2 | Trigger |
| `principles_niti.yaml` | ~8 | approved | Growth room (dharma questions) | — |
| `principles_ayurveda.yaml` | ~12 | approved | Daily rhythm, evening ref | Dinacharya |
| `principles_dinacharya.yaml` | ~10 | approved | Morning briefing | Ayurveda |
| `principles_bhakti.yaml` | ~8 | approved | Grief, Loneliness, Joy rooms | Completion |
| `principles_joy_expansion.yaml` | ~10 | approved | **Joy room (primary)** | Completion when source=core+mood=steady |
| `principles_grief.yaml` | ~8 | approved | Grief room | Completion grief |
| `principles_loneliness.yaml` | ~5 | approved | Loneliness room | — |
| `principles_dharma.yaml` | ~6 | approved | Growth room | — |
| `principles_yamas.yaml` | ~5 | approved | Growth, Onboarding | — |
| `principles_student.yaml` | ~5 | approved | Growth (purpose-seeking) | — |
| `principles_deepening.yaml` | ~5 | approved | Post-30-day checkpoints | — |
| `principles_creativity.yaml` | ~5 | approved | Growth (flow state) | — |
| `principles_parenthood_partnership.yaml` | ~4 | approved | Growth (relational questions) | — |
| `principles_searching_purpose.yaml` | ~5 | approved | Growth (dharma) | — |
| `principles_devotional_depth.yaml` | ~5 | approved | Bhakti deepening | — |
| `principles_elder_legacy.yaml` | ~4 | approved | Life-phase specific | — |
| `wisdom-en.json` | 127 | live in 10 locales | Quick-pick snippet for completion anchor | Fallback when principle resolution fails |

**Authority hierarchy** (already in registry):
- Tier 1: Gita, Yoga Sutras, Sankhya, Ayurveda
- Tier 2: Bhakti, Dinacharya, Niti, Joy Expansion

Rooted-mode tradition-naming uses Tier 1 freely; Tier 2 with `lightly_named` visibility only.

---

## 8. Implementation plan — 3 phases

### Phase A — "Two new rooms + wisdom anchor" (target: 10 days)

**Week 1 — backend**
1. Author `M48_joy_room.yaml` (3 variants: universal/hybrid/rooted)
2. Author `M49_growth_room.yaml` (3 variants)
3. Add `wisdom_anchor_line` + `wisdom_anchor_principle_id` slots to `M_completion_return`
4. Add `wisdom_anchor_line` slots to M46 + M47 (retrofit approved variants)
5. Resolver enhancement: when `wisdom_anchor_line` slot is present, post-process to pick principle from the right YAML based on applies_when context
6. Tests: 22 new ContentPack tests for M48/M49 + 8 wisdom-anchor resolver tests

**Week 2 — FE**
1. Build `JoyRoomContainer` (mirror of M46/M47 pattern — ~400 lines)
2. Build `GrowthRoomContainer` (mirror + input-response surface)
3. Register both in `allContainers.js` + `ScreenRenderer.tsx`
4. Dashboard — redesign quick-path row to "Three Doors"
5. `MoreSupportSheet` — add Joy + Growth rows
6. `CompletionReturnTransient` — render `wisdom_anchor_line` as optional third beat + "Read more →" that opens existing WhyThisSheet seeded with `wisdom_anchor_principle_id`
7. `actionExecutor` — add `enter_joy_room` / `enter_growth_room` handlers (mirror grief/loneliness)

**Acceptance gates**
- 0 sovereignty violations from 2 new ContentPacks
- Joy + Growth rooms render end-to-end with backend slots (no TSX English)
- Wisdom anchor appears on all completion flows
- Dashboard "Three Doors" routes correctly

### Phase B — "Listening voice" (target: 10 days)

**Week 3 — backend**
1. Build `POST /api/mitra/voice-input/` endpoint
2. Rule-based classifier (5-7 intent buckets via keyword + sentiment)
3. Principle picker shared with completion anchor
4. Response envelope: `{mirror_line, suggested_action, wisdom_anchor_line?, principle_id?, conversation_id?}`
5. Tests: 30+ classifier cases (struggle/joy/question/neutral/unclear)

**Week 4 — FE**
1. New `mitraVoiceInput(payload)` function in `mitraApi.ts`
2. `handleVoiceSend` in dashboard → call endpoint → render response card
3. `InlineResponseCard` block — 2-line mirror + wisdom beat + optional route CTA
4. Wire `voice_input_send` action (currently orphaned) in `actionExecutor.ts`
5. Grief + Loneliness + Joy rooms: call same endpoint, render quiet-ack mode (no response card, just route confirmation)
6. Growth room: call endpoint, render FULL response card (mirror + wisdom + L2 link)
7. CompletionReturnTransient reflection: submit to `/api/mitra/journey-reflection/` (new, write-only) — no response card

**Acceptance gates**
- 0 silent dispatches — every text submit produces either a render, a route, or a logged reflection
- Growth room renders full response with principle anchor ≥80% of classifiable inputs

### Phase C — "Onboarding joy path + self-learning" (target: 10 days, parked-item cleanup)

Ship the 2026-04-15 parked memo (`mitra_onboarding_joy_inclusion.md`):
1. Turn 2 — add 4 expansion chips
2. Turn 3 — add 4 positive textures
3. Turn 6 — `joy_signal_recognition` branch alongside `diagnostic_copy_for`
4. Wire `/journey/start/` to call the right recognition function based on `entered_via` flag
5. Extend `joy_signal_templates.yaml` with onboarding section

Plus: self-learning hookup so voice-input classifications inform future principle picks per user.

---

## 9. Data & contracts — minute details

### 9.1 `/api/mitra/voice-input/` contract (Phase B)

**Request**
```json
POST /api/mitra/voice-input/
Authorization: Bearer <token>
{
  "text": "I don't know what I'm supposed to do with my career",
  "input_type": "text",
  "context": {
    "surface": "dashboard",
    "journey_id": "abc-123",
    "runner_source": null,
    "guidance_mode": "hybrid",
    "today_kosha": "vijnanamaya",
    "today_klesha": "asmita",
    "locale": "en"
  }
}
```

**Response**
```json
{
  "classification": "seeking_purpose",
  "mirror_line": "That uncertainty is heavy to carry alone.",
  "wisdom_anchor_line": "Your dharma — imperfectly walked — is stronger than another's perfectly performed.",
  "principle_id": "gita_swadharma",
  "suggested_action": {
    "type": "enter_growth_room",
    "label": "Sit with this in the growth room"
  },
  "conversation_id": "conv_xyz",
  "log_id": "vi_7fab"
}
```

### 9.2 New actions needed in `actionExecutor.ts`

```tsx
case "enter_joy_room":       // mirror enter_grief_room
case "enter_loneliness_room": // already exists
case "enter_growth_room":    // mirror grief
case "open_wisdom_drill":    // payload={principle_id} → opens WhyThisSheet L2 with seed
case "voice_input_send":     // currently orphaned, wire to new endpoint
case "open_struggle_menu":   // opens MoreSupportSheet filtered to struggle rooms
case "log_journey_reflection": // silent write for completion reflections
```

### 9.3 Slot additions across existing moments

| Moment | New slot | Purpose |
|---|---|---|
| M_completion_return | `wisdom_anchor_line`, `wisdom_anchor_principle_id` | Third beat |
| M46 grief_room | `wisdom_anchor_line` (optional, per variant) | Exit beat |
| M47 loneliness_room | `wisdom_anchor_line` | Exit beat |
| NEW M48 joy_room | full slot set (see §3) | — |
| NEW M49 growth_room | full slot set | — |
| Dashboard | `three_doors_header_label`, `door_struggle_label`, `door_joy_label`, `door_growth_label` | Chip row |

### 9.4 ContentPack authoring load

- **New YAMLs:** 2 (M48, M49) × 3 variants each = 6 variants × ~20 slots ≈ 120 author decisions
- **Retrofit YAMLs:** 3 (M46, M47, M_completion_return) × add 1-2 slots
- **New text per variant:** ~8 lines (opening, second_beat, 5 pills, wisdom anchor)
- **Estimated authoring time:** 2-3 days founder review on drafts (agent-drafted → founder reviews)

### 9.5 Migration risk — existing completion flows

Wisdom anchor is **optional** (`required: false`). If slot is empty, FE renders current 2-beat completion unchanged. Non-breaking.

Non-support `runner_source` continues to use runner_variant variants (mantra/sankalp/practice). Adding wisdom_anchor to those variants is a separate pass — can ship joy/growth rooms first, retrofit wisdom on completions second.

---

## 10. Decisions needed from founder

1. **Three-Doors framing** — "I'm struggling / I'm good / I want to grow" vs. alternate phrasings? Prefer founder-canonical words.
2. **Joy Room name** — "Joy Room" is a functional label; is there a more sanatan-canonical word (ananda_seat, santosh_space)?
3. **Growth Room name** — "Growth Room" vs. "Inquiry Room" vs. "Swadharma Seat"?
4. **Wisdom anchor placement on core mantra** — third beat on completion screen, OR as a "Read more →" on the mantra display screen itself, OR both?
5. **Rule-based voice-input classifier** — 5-7 intent buckets is enough for MVP, or do we wait until LLM is gated and ship nothing in Phase B?
6. **Voice note transcription** — for grief/loneliness voice input (spoken not typed), do we transcribe server-side, or send audio + let backend handle?
7. **Onboarding joy-inclusion ship cadence** — bundle with Phase A (tight coupling) or Phase C (separate cleanup)?

---

## 11. What we explicitly do NOT do in this RFC

- **No LLM integration in Phase A or B** — rule-based keeps latency low + cost zero + quality verifiable. LLM is Phase 3 with explicit gating.
- **No multi-turn dialog** in phases A/B — every response is stateless. Conversation memory is a Phase C scope.
- **No rewriting of wisdom-en.json** — 127 snippets stay as-is. They're the fallback when principle resolution fails.
- **No new onboarding paths beyond the parked 2026-04-15 memo** — we honor that plan, don't re-scope it.
- **No change to the core triad generation** — dashboard triad, path reveal, day-type classification all stay. This RFC adds SURFACES, doesn't rewire the brain.

---

## 12. Estimated effort

| Phase | Backend | Frontend | Content (founder) | Total elapsed |
|---|---|---|---|---|
| A (rooms + anchor) | 3d | 4d | 2d | **~10d** |
| B (voice input) | 3d | 4d | 1d | **~10d** |
| C (onboarding joy + self-learning) | 2d | 2d | 1d | **~7d** |
| **Total** | 8d | 10d | 4d | **~27 working days** |

Calendar-wise: ~5-6 weeks from approval.

---

## 13. Success metrics

- **Dashboard path utilization:** within 2 weeks of launch, Joy + Growth combined tap rate ≥ 25% of daily quick-path taps (currently 100% struggle)
- **Voice-input response rate:** ≥95% of input submits receive a non-null response (today: 0%)
- **Principle surfacing:** unique principles shown per user per week ≥ 5 (today: ~1)
- **Completion wisdom beat rendered:** ≥ 90% of completions render `wisdom_anchor_line` within 2 weeks of retrofit (once we've authored enough variants)
- **Growth room engagement:** ≥ 1 text submit per growth-room entry (proves it's useful for the inquiry use case)

---

## 14. Appendix — sample principle-picker pseudocode

```python
# In M_completion_return resolver, after variant selection:
def pick_wisdom_anchor(ctx):
    # Map source/variant to principle file(s)
    source = ctx.stage_signals.get("runner_source", "core")
    variant = ctx.stage_signals.get("runner_variant", "mantra")
    principle_files = ROUTING_TABLE[(source, variant)]

    # Filter by guidance_mode + rooted allowance
    candidates = []
    for pf in principle_files:
        candidates.extend(load_principles(pf, mode=ctx.guidance_mode, status="approved"))

    # Score by klesha/kosha match + freshness (not-served-today)
    scored = [(p, score(p, ctx)) for p in candidates]
    scored.sort(key=lambda x: -x[1])

    best = scored[0][0] if scored else None
    if not best:
        return (None, None)
    return (best.plain_english[:90], best.principle_id)
```

```python
ROUTING_TABLE = {
    ("core", "mantra"):   ["principles_gita.yaml", "principles_bhakti.yaml"],
    ("core", "sankalp"):  ["principles_yoga_sutras.yaml"],
    ("core", "practice"): ["principles_yoga_sutras.yaml", "principles_ayurveda.yaml"],
    ("support_grief", "mantra"):       ["principles_grief.yaml", "principles_bhakti.yaml"],
    ("support_loneliness", "mantra"):  ["principles_loneliness.yaml", "principles_bhakti.yaml"],
    ("support_joy", "mantra"):         ["principles_joy_expansion.yaml"],
    ("support_growth", "mantra"):      ["principles_gita.yaml", "principles_sankhya.yaml"],
}
```

---

**End of RFC. Awaiting founder review of §10 decisions before implementation.**
