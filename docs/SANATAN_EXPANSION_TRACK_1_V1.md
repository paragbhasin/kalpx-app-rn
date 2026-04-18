# Track 1 — Execution Spec (DRAFT for founder review)

**Parent RFC:** `SANATAN_COMPANION_EXPANSION_V1.md`
**Date:** 2026-04-18
**Status:** pre-code review — needs founder lock on (1) chip wording, (2) variant copy, (3) hard invariants

Scope: **additive dashboard expansion** (keep Quick Check-in + Triggered + More-support; add Joy + Growth chips) + **M48 Joy Room** + **M49 Growth Room** + **limited completion wisdom anchor** (deterministic map, completion screen only).

Everything else from the parent RFC is Track 2 (voice-input answering layer, onboarding joy expansion, self-learning) — NOT in this spec.

---

## 1. Dashboard — additive expansion

### Current (do NOT change)
- `[ I Feel Triggered ]` (primary, filled)
- `[ Quick Check-in ]` (primary, bordered)
- `More support ›` (link to MoreSupportSheet with Grief + Loneliness)

### Added
Two new primary chips for Joy + Growth, below the existing pair.

**Proposed layout (2×2 grid + link):**
```
[ I Feel Triggered ]   [ Quick Check-in ]
[    Joy-chip      ]   [  Growth-chip   ]
                         More support ›
```

Or if founder prefers the struggle chips stay on one row above the two new paths:
```
[ I Feel Triggered ]   [ Quick Check-in ]
        [   Joy   ]   [  Grow  ]
                 More support ›
```

Color framing: Joy chip uses gold-pale background (warmth without celebration); Growth chip uses cream-bordered (contemplative neutral). Explicitly NOT emoji-led.

### Chip wording — candidates (founder pick one each)

**Joy chip — pick one:**
- `I feel good today`
- `I'm in a good place`
- `Today is steady`
- `I feel grateful`
- `I feel open`

**Growth chip — pick one:**
- `I want to grow`
- `I have a question`
- `I want to go deeper`
- `I want to reflect`

Labels come from two new screenData slots on `/journey/home/`:
- `three_doors_joy_label`
- `three_doors_growth_label`

Sovereignty: if backend returns empty, chip self-hides (no English TSX fallback).

### Tap behavior (locked)
| Chip | Action | Lands on |
|---|---|---|
| I Feel Triggered | (existing) | (unchanged) |
| Quick Check-in | (existing `start_checkin`) | (unchanged) |
| Joy chip | `enter_joy_room` | `support_joy / room` (direct-entry, v1) |
| Growth chip | `enter_growth_room` | `support_growth / room` (direct-entry, v1) |
| More support › | (existing) | Sheet — now lists 4 rooms: Grief, Loneliness, Joy, Growth |

v1 lock: Joy + Growth chips are direct-entry. No branching, no sub-choice. (Struggle stays sheet-opens because user often knows which room.)

---

## 2. M48 Joy Room — full spec

### Purpose
Honor the good day. Not a gratitude app — a Sanatan posture of noticing + not grasping + returning to presence. Avoid any tone of celebration-as-consumption.

### Invariants (HARD rules)
- `user_attention_state: open_steady` (distinct from grieving_shut_down — no 60-char body cap needed; 80-char cap is fine)
- `emotional_weight: light`
- `silence_tolerance_sec: 4`
- No exclamation points
- No "crushing it" / "amazing" / "proud of you" / emoji
- No performative celebration framing — joy is **noticed**, not **performed**
- Content sovereignty: no English TSX fallback; missing slot = empty UI

### Slot contract (17 slots)

| Slot | Role | Max | Purpose |
|---|---|---|---|
| `opening_line` | emphasized | 80 | First line seen |
| `second_beat_line` | body | 80 | Reveals 4s after opening |
| `ready_hint` | caption | 32 | "Tap when you're ready" (optional) |
| `offer_intro_text` | caption | 60 | Framing before pills |
| `pill_chant_label` | cta | 28 | Mantra pill |
| `pill_offer_label` | cta | 28 | "Offer this into your day" (small act) |
| `pill_walk_label` | cta | 28 | Walk timer pill |
| `pill_note_label` | cta | 28 | Name what's holding (writes a steady-note, NOT a gratitude list) |
| `pill_sit_label` | cta | 20 | Just sit |
| `pill_exit_label` | cta | 20 | Exit back to Mitra |
| `input_prompt` | helper | 60 | Prompt above text input |
| `input_placeholder` | placeholder | 40 | |
| `input_submit_label` | cta | 20 | |
| `input_cancel_label` | cta | 20 | |
| `joy_mantra_item_id` | config | 80 | MasterMantra item_id for the chant pill |
| `walk_duration_min` | config | 4 | e.g. 10 |
| `wisdom_anchor_line` | body | 90 | Shown on exit / completion |

### Variant copy — universal/en

```
opening_line:         "Good to sit with you today."
second_beat_line:     "Something is steady. Let's hold it without rushing."
ready_hint:           "Tap when you're ready"
offer_intro_text:     "A few ways to hold this, if any fit:"
pill_chant_label:     "Chant for this fullness"
pill_offer_label:     "Offer it into your day"
pill_walk_label:      "A quiet 10-minute walk"
pill_note_label:      "Name what's steady"
pill_sit_label:       "Sit in it a while"
pill_exit_label:      "Carry it forward"
input_prompt:         "What's steady for you right now?"
input_placeholder:    "One line is enough..."
input_submit_label:   "Keep this"
input_cancel_label:   "Cancel"
joy_mantra_item_id:   "mantra.peace_calm.om_namah_shivaya"   # founder to confirm
walk_duration_min:    10
wisdom_anchor_line:   "Joy lives in the doing held lightly, not at the finish line."
```

### Variant copy — hybrid/en

```
opening_line:         "It's good to see you today."
second_beat_line:     "The ground feels quiet. Let's not hurry past it."
pill_chant_label:     "A chant to hold this with"
pill_offer_label:     "Turn it into a small offering"
pill_walk_label:      "A quiet 10-minute walk"
pill_note_label:      "Name what's holding you steady"
pill_sit_label:       "Sit in it a while"
# remaining slots same as universal
wisdom_anchor_line:   "Even the good day is held, not grasped."
```

### Variant copy — rooted/en

```
opening_line:         "Good to sit together. The day feels settled."
second_beat_line:     "Santosha is here. Let's honor it before the day pulls forward."
pill_chant_label:     "Chant — a simple offering"
pill_offer_label:     "Seva — turn it into one small act"
pill_walk_label:      "Walk — ten quiet minutes"
pill_note_label:      "Name the sthairya (steadiness)"
pill_sit_label:       "Sit with santosha"
# remaining slots same as universal
wisdom_anchor_line:   "Santosha is not outcome. It is the steadiness under action."
```

### Pills → actions (locked)

| Pill | Action | Flow |
|---|---|---|
| Chant | `start_runner` with `source=support_joy, variant=mantra, target_reps=27, item=hydrated via library_search` | Core mantra render path (same as grief/loneliness) |
| Offer it | `open_joy_input` (inputType = `offering`) | Text input: "What small act does this become?" → submit → quiet ack + return to options |
| Walk | `step="walk"` (inline timer like M47) | Walk timer → auto-return on timeout |
| Note | `open_joy_input` (inputType = `note`) | Text input → submit → quiet ack |
| Sit | `step="stay"` (mirrors M46 stay) | Ambient quiet; no audio auto-play unless founder wants one |
| Exit | `exit_joy_room` | Dashboard |

---

## 3. M49 Growth Room — full spec

### Purpose
Inquiry posture. Dharma, discernment, one real next step. NOT self-help. NOT a question-answerer. A room that **seats** the question so the user can hold it.

### Invariants (HARD rules)
- `user_attention_state: seeking_discerning`
- `emotional_weight: moderate`
- `silence_tolerance_sec: 10` (slower — thinking posture)
- No "you've got this" / "manifest" / "unlock your potential" language
- The room does NOT generate answers. It offers seeded-inquiry categories, principles, and practices. Answer generation is Track 2.
- Content sovereignty same as joy room.

### Slot contract (18 slots — same shape as joy + 1 extra for seeded inquiry)

| Slot | Purpose |
|---|---|
| opening, second_beat, ready_hint, offer_intro (same as joy) | |
| `pill_inquiry_label` | "Ask a question" — routes to seeded-inquiry flow |
| `pill_teaching_label` | "Reflect on a teaching" — opens WhyThisSheet L2 with seeded principle |
| `pill_mantra_label` | Mantra pill (same shape) |
| `pill_practice_label` | Practice pill (same shape) |
| `pill_journal_label` | "Journal a question" — text input |
| `pill_exit_label` | |
| config: `growth_mantra_item_id`, `growth_practice_item_id`, `seeded_principle_id`, `wisdom_anchor_line` | |

### Variant copy — universal/en

```
opening_line:         "Good to sit with you when the question is open."
second_beat_line:     "No hurry. Let's see what today is asking."
ready_hint:           "Tap when you're ready"
offer_intro_text:     "A few ways to sit with this:"
pill_inquiry_label:   "Sit with a question"
pill_teaching_label:  "Reflect on a teaching"
pill_mantra_label:    "A mantra for clarity"
pill_practice_label:  "A practice for discernment"
pill_journal_label:   "Journal what's open"
pill_exit_label:      "Carry the question forward"
input_prompt:         "What's the shape of the question?"
input_placeholder:    "One sentence is enough..."
growth_mantra_item_id:  "mantra.focus.6"      # founder to confirm
growth_practice_item_id: "practice.pratipaksha" # founder to confirm
seeded_principle_id:    "gita_swadharma"
wisdom_anchor_line:    "Your dharma, imperfectly walked, is stronger than another's perfectly performed."
```

### Variant copy — hybrid/en

```
opening_line:         "Sitting with you while the question forms."
second_beat_line:     "Not every question needs an answer today. Some need a seat."
pill_inquiry_label:   "Sit with a question"
pill_teaching_label:  "Hear a teaching"
# rest same as universal
wisdom_anchor_line:   "A question held well is already half its answer."
```

### Variant copy — rooted/en

```
opening_line:         "Sat together. Vicara has a seat here."
second_beat_line:     "Let the question become prasna — asked rightly — before it becomes answer."
pill_inquiry_label:   "Sit with prasna"
pill_teaching_label:  "Reflect on a sūtra"
pill_mantra_label:    "A mantra for viveka"
pill_practice_label:  "A practice for discernment"
# rest same as universal
seeded_principle_id:  "sutra_viveka_khyati"
wisdom_anchor_line:   "Viveka — clear seeing — is the practice itself, not its reward."
```

### "Sit with a question" → seeded inquiry flow (NO answer generation)

When user taps the inquiry pill, show a sub-screen with 4 category chips (each a founder-authored YAML entry):

```
What's the shape of your question?

[ A decision I need to make       ]
[ A relationship I'm tending      ]
[ Something I keep getting stuck on ]
[ A practice I want to refine     ]
[ Something else                  ]
```

Each chip tapped → seeded inquiry screen with 3 elements (all from a new `M49_inquiry_seeds.yaml` ContentPack):
1. **Principle anchor** — 1 short line (from one of 19 principle YAMLs, pre-mapped per category)
2. **Reflective prompt** — 1 question to sit with (no expected answer)
3. **Suggested practice** — 1 action ("Sit for 5 min with this", "Walk it once", or "Journal it")

Then: `[ Journal this ]` (opens text input, same pattern) / `[ Carry it forward ]` (exit)

**Content-mapping per category (founder-reviewable):**

| Category chip | Principle YAML pulled from | Sample principle |
|---|---|---|
| Decision I need to make | `principles_gita.yaml` | `gita_swadharma` |
| Relationship I'm tending | `principles_parenthood_partnership.yaml` + `principles_bhakti.yaml` | `bhakti_maitri` |
| Stuck on | `principles_sankhya.yaml` + `principles_yoga_sutras.yaml` | `sutra_abhyasa_vairagya` |
| Practice to refine | `principles_yoga_sutras.yaml` + `principles_deepening.yaml` | `sutra_sadhana_krama` |
| Something else | Default: `principles_niti.yaml` | `niti_viveka` |

No classifier. No LLM. Pure YAML → slot read. When Track 2 lands, "Something else" routes to `/api/mitra/voice-input/`. For v1 it uses a generic niti principle + prompt.

---

## 4. Completion wisdom anchor — deterministic routing

### Scope
- Surface: `M_completion_return` (completion screen) ONLY — not mantra display, not elsewhere
- No freshness rotation (same anchor every time for a given source × variant)
- No dynamic principle picker
- Optional slot — if empty, FE renders current 2-beat completion unchanged (non-breaking)

### Slot additions to `M_completion_return`

| Slot | Role | Required | Purpose |
|---|---|---|---|
| `wisdom_anchor_line` | body | false | Third beat copy |
| `wisdom_anchor_principle_id` | config | false | Seeds "Read more →" into existing WhyThisSheet L2 |

### Deterministic anchor table (8 lines, all founder-reviewable)

| runner_source | runner_variant | Anchor line | principle_id |
|---|---|---|---|
| core | mantra | "Action without grasping carries its own fullness." | `gita_nishkama_karma` |
| core | sankalp | "The intention held lightly is the intention held long." | `sutra_sankalpa` |
| core | practice | "The body remembers what the mind forgets." | `ayurveda_embodied_presence` |
| support_grief | mantra | "Grief held quietly is stronger than grief performed." | `bhakti_karuna_witness` |
| support_loneliness | mantra | "Company kept in silence still counts." | `bhakti_sat_sanga` |
| support_joy | mantra | "Joy lives in the doing held lightly, not at the finish line." | `gita_nishkama_as_celebration` |
| support_growth | mantra | "Your dharma, imperfectly walked, is stronger than another's perfectly performed." | `gita_swadharma` |
| support_growth | practice | "Viveka is the practice itself, not its reward." | `sutra_viveka_khyati` |

Render:
```
✓
Complete. You stayed with the sound.
─────
Action without grasping carries its own fullness.
                                       Read more →
```

Tap `Read more →` → existing `WhyThisSheet` opens pre-seeded with `principle_id`. Zero new FE surface — reuses Phase D's L2/L3 infrastructure.

---

## 5. Hard invariants (locked for v1)

1. **"Do not chatter in sacred rooms."** Grief + Loneliness + Joy rooms default to **quiet acknowledgment**. Only Dashboard + Growth Room may render visible reply cards. This rule is encoded in the voice-input contract (Track 2) AND in v1 behavior (text inputs in grief/loneliness/joy go to `log_journey_reflection` silently + return to options; the Growth Room's inquiry flow shows full seeded content).

2. **Joy Room is not a gratitude app.** No "count your blessings" framing, no exclamations, no streak-counter. "Name what's steady" ≠ "list gratitudes".

3. **Growth Room does NOT generate answers in v1.** Sitting-with is the product. Seeded inquiry + principle anchor + practice suggestion — all pre-authored, data-driven. Answer generation is Track 2.

4. **Dashboard chips are additive.** Quick Check-in + Triggered + More-support STAY. Joy + Growth are ADDED.

5. **Direct-entry for Joy + Growth rooms in v1.** No branching. Struggle path keeps its drawer sheet.

6. **Completion wisdom anchor uses deterministic map only.** No dynamic picker, no freshness rotation. Not a recommendation engine.

7. **Sovereignty.** All user-facing strings from backend slots; missing slot = empty UI, not English fallback.

---

## 6. What's explicitly NOT in Track 1

- `/api/mitra/voice-input/` endpoint (Track 2)
- Rule-based or LLM classifier (Track 2)
- Response cards on grief/loneliness/joy (Track 2)
- Onboarding joy/expansion chips (Track 2, parked memo)
- Self-learning hookup (Track 2)
- Dynamic principle picker on completions (scope cut, deterministic only)
- Multi-turn conversation (Track 3+)
- Crisis room name change (out of scope)

---

## 7. Effort estimate

| Work | Days |
|---|---|
| Author M48 + M49 ContentPacks (2 moments × 3 variants + inquiry seeds YAML) | 1.5d founder review + 1d agent drafting |
| Backend: M48/M49 resolver + `enter_joy_room` / `enter_growth_room` views + wisdom anchor routing in M_completion_return resolver | 1.5d |
| Frontend: `JoyRoomContainer` + `GrowthRoomContainer` + seeded inquiry sub-flow | 3d |
| Frontend: dashboard chip expansion + MoreSupportSheet new rows | 1d |
| Frontend: `CompletionReturnTransient` wisdom anchor beat + Read-more seeding | 0.5d |
| Tests (M48/M49 variant resolution + wisdom anchor routing) | 1d |
| Smoke test on dev | 0.5d |
| **Total** | **~9 working days** |

Calendar: ~2 weeks from approval.

---

## 8. 3 gates before coding begins

1. **Chip wording** — founder picks one from each candidate list in §1
2. **Variant copy approval** — founder reviews actual copy in §2 and §3; requests edits or approves per variant
3. **Seeded-inquiry category copy + principle pairings** — founder approves the 5 category labels + 5 category→principle mappings in §3 ("Sit with a question")

Once gates pass, execution begins. Each gate is independent — founder can approve chip wording while still reviewing variant copy, etc.

---

## 9. What to watch for during execution (drift risks)

- **Joy Room drifting toward gratitude-app UX** — catch early by pattern-matching any new pill labels against forbidden tokens ("count", "streak", "wins", "blessings", emoji)
- **Growth Room drifting toward self-help** — pill labels must stay anchored in inquiry/discernment vocab, never self-improvement ("unlock", "level up", "manifest")
- **Completion anchor becoming a recommendation engine** — whenever we're tempted to "pick the BEST anchor for this user today," stop. The scope is one anchor per (source, variant). Period.
- **Dashboard chip count creeping past 4** — keep the primary row at 4. Anything else = drawer.

---

**End of Track 1 spec.**

Awaiting founder review on §8 gates before implementation.
