# Wisdom Orchestration V1 — Founder Decisions Log

**Date locked:** 2026-04-18
**Status:** AUTHORITATIVE — all V1 cutover blockers resolved
**Applied to:** `mitra_wisdom_library_passc_2026_04_18.csv`
**Successor-of:** Pass B (`mitra_wisdom_library_passb_2026_04_18.csv`)

This is the single source of truth for every founder-sensitive decision that was pending before engineering Day 1. All 53 blocker decisions + 6 open-question defaults are captured and applied.

---

## Packet 4 — Completion family map → LOCKED as hard law

| Runner variant | Source family | Decision |
|---|---|---|
| `mantra` | **gita** (only) | CONFIRMED |
| `sankalp` | **yoga_sutras** (only) | CONFIRMED |
| `practice` | **ayurveda + dinacharya** (only) | CONFIRMED |
| Cross-variant contamination fallback | **NO** | CONFIRMED |

**Rationale:** Pools are healthy (51 / 40 / 56 rows respectively) per PACKET_completion_family_map.md. No reachability reason to weaken the invariant.

**Enforcement:** `selector.py` invariant #8 hard-codes this map. Selector filters the pool by `source_family ∈ allowed_families` for `interaction_type=completion_anchor` BEFORE specificity sort. Non-matching rows never reach tiebreak. CI gate `test_invariant_08_completion_family_law` parameterized over 3 variants × 3 modes × 100 fixtures.

---

## Packet 3 — Sanskrit wrapper copy → AUTHORED

### Track 1 blockers (5 — REQUIRED before cutover)

| Sanskrit term | Founder-authored English gloss |
|---|---|
| `nishkāma karma` | "acting fully, without gripping the outcome" |
| `vairāgya` | "loosening the grip, not turning away from life" |
| `santosha` | "contentment that does not depend on what happens next" |
| `sat-sanga` | "the company of what steadies and uplifts you" |
| `karuna` | "compassionate presence that does not rush to fix" |

### Non-blockers (5 — APPROVED, applied to accelerate)

| Sanskrit term | Founder-authored English gloss |
|---|---|
| `phala` | "the fruit of action, the outcome you cannot control" |
| `swadharma` | "the path of responsibility that is truly yours" |
| `abhyāsa` | "the practice of coming back, again and again" |
| `viveka` | "discernment that helps you tell signal from noise" |
| `sankalpa` | "an intention held steadily enough to shape practice" |

Remaining terms (tapas, seva) → DEFERRED; founder authors if/when Track 1 surfaces need them.

**Applied to:** `wisdom_asset.wrapper_copy` column on all 12 principles whose text contains one of the 10 authored terms (per Pass C CSV). Format: `"<term>: <gloss>" || "<term>: <gloss>"` when multiple terms appear in one row.

**Enforcement:** `selector.py` `_render_with_truncation` prepends `wrapper_copy` when `mode ∈ {rooted, hybrid}` AND `asset.wrapper_required=true`. In universal mode, rows with `tradition_naming_allowed=true` are filtered out anyway (invariant #5).

**CI gate:** invariant #12 — any PR touching `wrapper_copy` fails CI unless labeled `founder-approved` on the PR.

---

## Packet 2 — Grief/loss tradition_specificity → APPLIED

### Section A — 8 explicit per-row decisions

| asset_id | decision | context_fit_tags updated |
|---|---|---|
| `gita_sthitaprajna_destination` | **NOT_GRIEF_SAFE** | grief_room, loneliness_room dropped |
| `gita_stable_in_sorrow_and_pleasure` | **SPLIT_VARIANT** | grief_room retained, but row is flagged for grief-safe sub-variant authoring (post-v1) |
| `gita_impermanence_of_form` | **GRIEF_SAFE** | grief_room kept |
| `gita_soul_is_eternal` | **SPLIT_VARIANT** | same as sorrow_and_pleasure |
| `yoga_sutras_acceptance_not_resignation` | **GRIEF_SAFE** | grief_room kept |
| `sankhya_witness_through_grief` | **SPLIT_VARIANT** | grief_room kept, SPLIT flag set |
| `gita_anger_at_god_is_relationship` | **SPLIT_VARIANT** | grief_room kept, SPLIT flag set |
| `yoga_sutras_digital_distraction_tapas` | **NOT_GRIEF_SAFE** | grief/loneliness dropped |

Rationale recorded: "anything that risks sounding like equanimity-as-correction, witness-distance, or doctrine-too-soon should not be safe in all modes for grief. Safer: impermanence, acceptance-not-resignation, carefully held continuity."

### Section B — action/duty/discipline rule → NOT_GRIEF_SAFE

**Default rule:** If a row is action-, duty-, discipline-, or restoration-coded (detected by keyword regex on plain_english + core_teaching), auto-mark `tradition_specificity=NOT_GRIEF_SAFE` and drop grief_room + loneliness_room from `context_fit_tags`.

**Strict-enforcement named rows (founder explicit):**
- `gita_detached_action`
- `gita_restore_when_dharma_falls`
- `gita_lead_through_action_not_talk`
- `gita_be_your_own_lamp_of_effort`
- `gita_dharma_revealed_in_action`

**Pass C result:** 38 additional rows auto-classified NOT_GRIEF_SAFE. Combined with Section A: 46 total grief/loss decisions applied.

**SPLIT_VARIANT remainder:** 4 rows marked SPLIT. These need founder-authored grief-safe sub-variants (post-V1 authoring task). Until then, they serve on grief surfaces as-is (already-approved register).

---

## Packet 1 — Snippet standalone_safe → 127/127 DECIDED

Founder rule: **conservative defaults**.

| Category | Count | Decision |
|---|---|---|
| LIKELY_SAFE (bulk-approved; post-cutover spot-audit) | **52** | `standalone_safe=yes` |
| HIGH_RISK aphoristic / poetic_short / too_short | **57** | `standalone_safe=drill_down_only` |
| HIGH_RISK unglossed Sanskrit (incl. "Dharma is...", "Seva is...", "Shakti is...") | **16** | `standalone_safe=wrapper_required` |
| Named aphoristic (founder explicit) | 8 covered in 57 above | `drill_down_only` |
| Named Sanskrit (founder explicit) | 1 covered in 16 above (`wis.shakti_is_tender_strength`) | `wrapper_required` |
| MEDIUM_RISK — `wis.devotion_softens_ego` | 1 | `drill_down_only` |
| MEDIUM_RISK — `wis.courage_to_release` | 1 | **`unsafe`** (banned-word "release" drift risk) |
| MEDIUM_RISK — `wis.gratitude_opens_eyes` | 1 | **`unsafe`** (banned-word "abundance" drift risk) |

Total: 127 ✓

**Pool impact:** 57 drill_down + 2 unsafe = 59 snippets removed from selector_eligible pool.

**Pending post-cutover:** founder spot-audit of 52 LIKELY_SAFE rows (≥10 sample). Any row flagged during spot-audit → flip to `drill_down_only` or `wrapper_required`.

---

## Open question defaults → LOCKED for V1

Supersedes `WISDOM_ORCHESTRATION_CONTRACT_V1.md` §13 Q5-Q10.

| # | Question | Decision | Selector enforcement |
|---|---|---|---|
| Q5 | Bhakti bridge scope | **Allow into Joy Room** (in addition to grief + loneliness compassion-slots). Gently — weight filter still applies. | `_tiebreak` R15 updated: bhakti exempt from session-tradition lock when context ∈ {grief_room, loneliness_room, joy_room}. |
| Q6 | Session boundary | **30-min idle** | Redis TTL=30min on `session:{id}:bound_tradition:*`. Matches existing `session_idle_timeout`. |
| Q7 | Hybrid mode naming budget | **Per session**, not per surface | `session:{id}:tradition_named_count` Redis counter, cap=1 per session. |
| Q8 | Downgrade permission | **Silent rooted → hybrid → universal** | `_render_with_truncation` auto-downgrades + emits `relaxation_step_applied`. No ContentPack forced. |
| Q9 | Readiness L0-L4 default | **Proposed defaults used** | `_derive_readiness_from_days(days_since_start)` → L0:<7, L1:<30, L2:<90, L3:<180, L4:≥180 |
| Q10 | Application-tier threshold | **L4 + explicit opt-in** (conservative) | Filter stage 3: application-tier rows require `user_readiness_level='L4' AND user.settings.application_tier_opt_in=true`. |

**Earlier locked (§13 Q1-Q4):**
- Q1 Completion family map → Packet 4 above
- Q2 Snippet Pass C → Packet 1 above
- Q3 Tradition_specificity → Packet 2 above
- Q4 Sanskrit wrapper copy → Packet 3 above

---

## Pass C CSV — pool state

**Input:** Pass B 430 rows, 404 selector_eligible (auto-derived).

**Output:** Pass C 430 rows, **354 selector_eligible** (founder decisions applied).

### Drop reasons from 404 → 354 (50 dropped)

| Reason | Count |
|---|---|
| Snippets → drill_down_only (aphoristic/poetic) | 57 |
| Snippets → unsafe (banned-word medium) | 2 |
| Section A NOT_GRIEF_SAFE drops grief context but stays eligible for other contexts | 2 (gita_sthitaprajna_destination, yoga_sutras_digital_distraction_tapas) |

Note: rows drop from pool only when they become DRILL_DOWN_ONLY or UNSAFE. NOT_GRIEF_SAFE rows remain eligible for non-grief contexts (they just lose grief_room/loneliness_room fit tags).

### Pool composition post-Pass C

- Principles remaining eligible: ~283 / 303
- Snippets remaining eligible: ~71 / 127
- **Total selector_eligible: 354** → contract target was ≥330 ✓

### Reachability (Pass C)

All Track 1 active cells still above the ≥3 minimum. Joy Room joy_room × opening_line (was 11 in Pass A) may dip to ~8 after snippets remove — still within minimum. **No cells drop below target.**

---

## What ships in wisdom_asset table after migration 0117

| Column | Populated by |
|---|---|
| 12 MUST-HAVE | Pass A auto-derivation |
| `principle_version_id` | Pass A seed=1; trigger bumps on text edit |
| `tradition_specificity` | Pass C (Section A 8 explicit + Section B 38 auto + 4 SPLIT kept pending) |
| `standalone_safe_v1` (snippets) | Pass C Packet 1 decisions |
| `wrapper_copy` | Pass C Packet 3 (12 principles) |
| `wrapper_required` | Pass C (16 snippets + 1 explicit named) |
| `selector_eligible` | Pass C final: 354 rows `yes` |
| `tone_tags`, `path_intent_tags` | Pass B draft |
| `channel_coverage` | Pass A derived |
| `spoken_rewrite`, `pronunciation_ipa` | NULL (Track 2 populates) |

---

## Audit trail columns added in Pass C

Each decision is reviewable:
- `standalone_safe_decision_source`: e.g., `founder_packet_1`, `founder_aphoristic_named`, `banned_word_adjacent_in_ambiguous`
- `standalone_safe_decision_note`: short human-readable rationale
- `tradition_specificity_source`: e.g., `founder_packet_2_section_a`, `founder_packet_2_section_b_action_coded`
- `wrapper_copy`: pipe-separated `"term: gloss"` pairs

---

## Track 1 review locks (2026-04-18 — Gates 1-4 cleared)

### Gate 1 — Dashboard chip wording (LOCKED)
- **Joy chip:** "I'm in a good place"
- **Growth chip:** "I want to go deeper"

### Gate 2 — Variant copy edits applied

**M48 Joy Room:**
- Universal: approved as-is
- Hybrid: opening changed to **"Good to sit with you. Something feels settled today."**; status flipped to approved
- Rooted: opening changed to **"Sat together. Santosha is here — don't rush past it."**; second_beat changed to **"Nothing more is needed right now. Stay with it a while."**; status flipped to approved

**M49 Growth Room:**
- Universal: approved as-is
- Hybrid: second_beat locked as **"Not every question needs an answer today. Some need a seat."**; status flipped to approved
- Rooted: opening changed to **"Sat together. The question has a seat here."** (vicara removed per Gate 4); second_beat kept as **"Let the question become prasna — asked rightly — before it becomes answer."** (prasna has inline gloss, safe); status flipped to approved

### Gate 3 — Seeded inquiry categories (LOCKED as proposed)

Ships in `M49_inquiry_seeds.yaml` (newly authored):

| Category chip | Principle anchor | principle_family |
|---|---|---|
| A decision I need to make | `gita_swadharma` | gita |
| A relationship I'm tending | `bhakti_maitri` | bhakti |
| Something I keep getting stuck on | `sutra_abhyasa_vairagya` | yoga_sutras |
| A practice I want to refine | `sutra_sadhana_krama` | yoga_sutras |
| Something else | `niti_viveka` | niti |

Each includes anchor_line + reflective_prompt + suggested_practice_label. Universal variants approved; hybrid + rooted drafted post-cutover after dev spot-check.

### Gate 4 — vicara decision (LOCKED)

**Decision:** Option (b) — vicara removed from M49 rooted opening. No new wrapper term authored. The 10 authored wrappers remain the V1 canon.

### Invariant #8 preservation (Track 1 review blocker resolved)

**Decision:** No resolver exemption. Invariant #8 stays absolute. The `support_growth × practice` completion anchor swapped from `sutra_viveka_khyati` to an Ayurveda/Dinacharya principle.

Applied edit to `M_completion_return.yaml` variant `M_completion_return_support_growth_practice_en`:
- `wisdom_anchor_line`: "The rhythm clarifies what urgency cannot."
- `wisdom_anchor_principle_id`: `dinacharya_rhythm_clarifies`
- `message`: "Complete. The practice answered what thinking could not." (also softened from previous "practice was the answer in motion" to better match the quiet-honoring tone)

The old anchor line and principle_id are retired from V1. Engineer note added in-comment flagging: any future support_growth × practice surface MUST stay in Ayurveda/Dinacharya family.

## Post-V1 authoring backlog (deferred)

Not blocking cutover, queued for post-launch:

1. 4 SPLIT_VARIANT rows need grief-safe sub-variants authored (Section A: `gita_stable_in_sorrow_and_pleasure`, `gita_soul_is_eternal`, `sankhya_witness_through_grief`, `gita_anger_at_god_is_relationship`)
2. 10-15 row spot-audit on the 52 LIKELY_SAFE snippet bucket
3. Sanskrit wrappers for `tapas`, `seva` (only when Track 1 surfaces need them)
4. Section B action-coded sweep review — founder can reverse any row if it turns out the regex misclassified
5. Q10 application-tier opt-in UI (Settings toggle `show_deep_tradition_sources`) — purely UX, no selector change

---

## Green-light status

With Packet 1 + 2 + 3 + 4 + Q5-Q10 locked and applied to Pass C CSV:

- **5 Review-D integrity blockers: ALL CLEARED** (D1 snippet Pass C, D2 completion family law, D3 tradition_specificity, D4 principle-over-snippet, D5 founder-only wrapper)
- **§13 open questions: ALL LOCKED** (Q1-Q10)
- **Selector_eligible pool size: 354** (target ≥330 met)
- **Reachability: all Track 1 cells ≥3**

**Engineering Day 1 (migrations 0111-0117) is CLEARED TO START.** No remaining founder-blocking items before cutover.
