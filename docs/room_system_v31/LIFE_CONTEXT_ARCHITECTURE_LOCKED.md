# Life-Context Architecture — Locked
**Status:** LOCKED 2026-04-21  
**Owner:** Founder  
**Branch:** journey-v3-fe  
**Supersedes:** conversation-only architecture from 2026-04-21 execution session

---

## A. Canonical Architecture

### Core Principle

Life-context shaping belongs in **content selection**, not in mantra assignment.
A principle or wisdom banner chosen for a `work_career` user in clarity should be structurally different from the one chosen for a `relationships` user — same room, different teaching.
Mantras and practices are state-driven. They respond to what the room does to the body and psyche, not to where the user is in life. Context should not change which mantra a user in a stillness room receives.

---

### Three-Layer Model

**Layer 1 — Principle and Wisdom (Primary)**

Principle selection (`_pick_wisdom_for_room`) and teaching selection (`_fetch_wisdom_asset_for_teaching`) must be routed through life-context scoring. This is where the most auditable, spiritually distinct content lives. This is the correct primary surface for context differentiation.

Implementation path (Path B): `_pick_wisdom_for_room` receives `life_context: Optional[str]` and passes it through to `pick_wisdom` via `WisdomSelectionInput`. The wisdom selector (`core/wisdom/selector.py`) adds a life_context scoring step: candidates where `life_context_bias` contains the input receive +1 (the same Rule 5 logic, now applied in the wisdom lane). `_fetch_wisdom_asset_for_teaching` similarly prefers life_context-matched `WisdomAsset` rows.

Layer 1 applies to: clarity (teaching), growth (banner).

**Layer 2 — Sankalp (Secondary)**

The existing Rule 5 mechanism in `_score_candidate` is the correct mechanism for sankalp. Sankalps articulate intention for the week or day. A growth user in `work_career` context and one in `relationships` context should receive meaningfully different sankalps.

Layer 2 applies to growth sankalp (first implementation) and connection sankalp (second implementation). No other slots.

Layer 2 does NOT apply to:
- Mantra (any room)
- Practice (any room)
- Stillness (any slot)
- Joy (see Layer 2 exemption below)

**Layer 3 — Mantra and Practice (State-Driven)**

Mantras and practices in this system address the user's inner state — regulation, absorption, devotional arousal, embodied release. They are not tactical responses to life circumstances.

Assigning Gayatri to a `work_career` user because they are in `work_career` is functionally correct but theologically imprecise: Gayatri is a consciousness-expansion mantra, not a career tool. Assigning Shiva mantras to `health_energy` users is correct by register (Shiva governs dissolution and regulation), not by life-context label.

The correct approach: choose mantras and practices by **room fit, tradition, and register**. Do not apply life-context scoring to these slots. The content tagging in migration 0136 captures some mantra-by-context associations; do not extend this approach. The existing tagged data need not be stripped, but no new bias tagging should be authored for mantra or practice slots.

---

### Room-by-Room Ideal State

**room_clarity — High**  
Primary shaping surface: principle/wisdom teaching (Layer 1). Teaching selection is the correct surface because clarity delivers a teaching chip, not a banner. A `work_career` user receives a Nīti or Yoga-Sūtras teaching oriented to strategic discernment. A `relationships` user receives a principle about right relationship or relational dharma. Same Vedic corpus, different facet. Mantra selection: state-driven (Gayatri, Saraswati register), not context-scored.

**room_growth — High**  
Primary shaping surface: principle/wisdom banner (Layer 1). Secondary: sankalp (Layer 2). Growth is the room most saturated by life-context intention — users bring explicit purpose here. Banner and sankalp both should reflect context. A `work_career` user gets a Bhagavad Gītā or Nīti banner about purposeful action and a sankalp about disciplined effort. A `relationships` user gets maitrī-karuṇā teaching (Yoga-Sūtras 1.33) and a sankalp about showing up for others. Mantra: state-driven (Gayatri, empowerment register).

**room_connection — Moderate**  
Primary shaping surface: sankalp (Layer 2, second implementation). Banner selection may receive Layer 1 eventually but is not Phase 1 scope. Connection excludes `work_career` and `money_security` by doctrine; users in those contexts in connection see context-neutral selection and that is correct. Eligible contexts: `relationships`, `self_devotion`, `daily_life`, `purpose_direction`, `health_energy`. The small practice pool (now filled for `purpose_direction` and `health_energy` by P1-C) provides useful variation but is not a primary context-shaping surface.

**room_release — Light**  
Principle/wisdom banners in release should be **burden / contraction / letting-go oriented**. Grief-specific content may appropriately appear in release for users in loss, but grief-framed banners are not universally appropriate for all release users. A user releasing a work-career pattern does not need the same banner as a user in relational grief. Release banners should first be selected by register (letting-go, surrender, release of holding), not by life-context. Context-shaping in release is light and limited to register-compatible content, not context-prescriptive teaching. Mantra and practice remain state-driven (Shiva dissolution register, Ayurveda-informed embodied practices).

**room_joy — Minimal**  
Joy is shaped primarily by register — gratitude, blessing, delight, offering, celebration — not by life-context. The subslot structure (gratitude, blessings, seva) already provides differentiation within joy. Life-context may lightly tint joy selection (a user in `relationships` joy context might receive a relational bhakti banner over a solitary-devotion banner), but life-context should not dominate or override the register-first logic. No Path A or Path B implementation for joy is required in Phase 1 or Phase 2. Joy's sankalp slots are led by subslot identity, not by context scoring.

**room_stillness — None**  
Life-context shaping must never be applied to stillness. Stillness is a pre-cognitive regulation space. Introducing context differentiation here would imply the room is solving for life circumstances, which is doctrinely incorrect and experientially counterproductive. All stillness rotation_refs will carry `life_context_bias: []` after 0144. This is permanent — not a gap.

---

## B. Why Path B Is the Correct Primary Architecture

Path A (Rule 5 applied to action-chip candidates) scores individual items from the pool using `life_context_bias`. It works for sankalp because sankalps are inherently intentional and context-specific. It does not work for principle/wisdom because principle selection (`_pick_wisdom_for_room`) bypasses `_score_candidate` entirely — Rule 5 does not fire in the wisdom selector path.

Path B (life_context scoring added to the wisdom selector) is correct because it operates on the right selection surface. Principle and wisdom teaching are where context-specific guidance is most legible to users and most spiritually coherent — the tradition has produced distinct teachings for work, relationships, health, purpose, and daily life that are genuinely different, not superficially so.

Path A has exactly one role in the ideal architecture: Layer 2 sankalp scoring in growth and connection. It should not be extended beyond this.

---

## C. Rollout Order

### Phase 1: Clarity + Growth (Path B selector implementation)

Deliverables:
- `_pick_wisdom_for_room` receives and passes `life_context`
- Wisdom selector (`pick_wisdom`) adds life_context +1 step
- `_fetch_wisdom_asset_for_teaching` prefers context-matched WisdomAssets
- `lc_applied_item_ids` tracking extended to wisdom/banner/teaching paths
- `life_context_applied` provenance flag fires correctly for principle/wisdom selections

Gate: 80-render proof (see proof standard below) passes for both rooms.  
Gate: life-context picker visible only after this gate passes.

### Phase 2: Connection Sankalp (Layer 2, Path A)

Deliverables:
- Connection sankalp pool bias-tagged by context (after growth sankalp proves the pattern)
- Rule 5 fires for connection sankalp in `_score_candidate`
- Connection practice pool bias tags reviewed for `purpose_direction` and `health_energy`

### Phase 3: Release + Joy (if justified)

Release context-shaping proceeds only if Phase 1 proof establishes a clear pattern and release pool has sufficient tradition-clean bias-tagged content. Do not engineer for it; do not defer Phase 3 as a firm commitment. Evaluate after Phase 2 closes.

Joy receives no Phase 3 implementation. Joy's register-first, subslot-led logic is permanent. If evidence emerges that specific contexts benefit from tinting, revisit at that point only.

**Stillness: never.** Not a phase. Not a future item. Locked permanently.

---

## D. Proof Standard

Phase 1 is proven when the following conditions hold simultaneously across both clarity and growth:

**Technical proof (automated):**
1. `life_context_applied: true` in the provenance block of at least one chip per render when `life_context` is passed
2. Different `item_id` selected for `work_career` vs `relationships` renders using the same user UUID and room

**Statistical proof (20-render test):**
3. At least 60% of renders under a tagged life context (e.g., `work_career`) select items where `life_context_bias` contains that context — confirming statistical skew rather than accidental per-render coincidence
4. No single tradition family accounts for more than 70% of context-matched renders — life-context scoring must not produce unintended collapse into a single tradition or register (e.g., all `work_career` clarity renders producing only Nīti, when Yoga-Sūtras and BG are also tagged)

**Human-reviewable proof:**
5. A founder reads the two selected items side-by-side (one per context) and can articulate, in one sentence each, why each item is contextually appropriate — without reference to the `life_context_bias` tag
6. Neither item feels out of place in its room or context — no teaching that is technically tagged `work_career` but reads as a generic universal teaching that would be indistinguishable in a `relationships` render

The proof is not declared by tooling output alone. It is declared by a human who has read the content.

---

## E. Path A Scope — Final

| Surface | Path A applies? | Notes |
|---|---|---|
| Growth sankalp | **Yes — first Layer 2 implementation** | Bias tags in MasterSankalp; Rule 5 fires via `_score_candidate` |
| Connection sankalp | **Yes — second Layer 2 implementation** | After growth proves the pattern |
| Clarity principle/teaching | No — Path B only | Rule 5 path doesn't reach wisdom selector |
| Growth banner | No — Path B only | Same as above |
| Mantra (any room) | **No** | State-driven; no life-context scoring |
| Practice (any room) | **No** | State-driven; no life-context scoring |
| Joy (any slot) | **No** | Register/subslot-led; context may lightly tint but no scoring layer |
| Stillness (any slot) | **Never** | Pre-cognitive regulation; permanent |

---

## F. Picker Policy

The life-context picker is suppressed globally until Phase 1 (clarity + growth) passes the proof standard above.

Rationale: if context does not visibly change the room output, the picker must not be presented as meaningful personalization. Showing a picker whose output is context-neutral is a form of false representation to the user.

Once Phase 1 is proven:
- Clarity and growth: picker visible, no disclaimer
- Other rooms: picker may be visible but copy should not imply context-specific shaping until that room's phase proves the pattern

---

## G. What This Architecture Does Not Include

- Life-context scoring for mantra or practice — not now, not in future phases
- Stillness context shaping — never
- Joy as a primary context-shaping surface — never; register-first is permanent
- Release as a high-priority context-differentiation room — light, only if Phase 1 proves the pattern
- Extending Path A to principle/wisdom slots — architecturally incorrect; use Path B

---

*This document is the locked canonical architecture for life-context shaping in KalpX rooms. Changes require explicit founder sign-off and must update this file.*
