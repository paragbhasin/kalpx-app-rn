# P1 Content Fill Report — Room System v3.1.1

**Date:** 2026-04-21
**Scope:** W3-P1 deferred tasks: Connection practice depth, Nīti Phase 2, Growth anchor bias flags, Override Ledger Section D
**Status:** FOUNDER-REVIEW-REQUIRED before any migration or tagging write

---

## Section 1: Connection Practice Depth

### 1.1 Gap Summary

From POOL_GAP_REPORT_V2 §A.2 and WAVE3_P0_EXECUTION_REPORT §"What was NOT done":

| life_context | mantra (current) | practice (current) | wisdom_banner (current) | Status |
|---|---:|---:|---:|---|
| relationships | 2 | 2 | 3 | OK |
| self_devotion | 2 | 3 | 3 | OK |
| daily_life | 1 | 1 | 3 | THIN (not priority) |
| **purpose_direction** | **1** | **0** | **2** | **[THIN — P1 priority]** |
| **health_energy** | **1** | **1** | **2** | **[THIN — P1 priority]** |

Permitted traditions in connection (ROOM_TRADITION_ASSIGNMENT_V2):
- Dominant: Bhakti (Nārada Bhakti Sūtras, Bhāgavata rasa)
- Light support: Dinacharya (devotional-mundane), Yamas (ahiṃsā-as-connection), BG Ch 12 (secondary only)
- Excluded: Niti, Sankhya, Shaiva/Tantric

### 1.2 Authored Rows (9 new WisdomPrinciple rows)

The gap to close: connection × purpose_direction needs +2–3 practice rows and +1 wisdom_banner; connection × health_energy needs +2–3 practice rows and +1 wisdom_banner.

Because connection = mantra-led and practice-supported (DOMINANCE_V2), and wisdom_teaching is gated to v1.1, new rows should be practice-class and wisdom_banner-class from Bhakti or Dinacharya traditions.

---

**Row C-PD-1**
- item_id: `practice.connection_morning_name_dedication`
- class: practice
- short_text: "Begin your work with one breath offered to something larger than the task."
- room_fit: [connection]
- life_context_bias: [purpose_direction]
- tradition: bhakti (Nārada — "sarva karma phala tyāga" as daily-work offering)
- surface_eligibility: [practice_anchor, support_room]
- emotional_function_tag: offer
- action_family: devotion
- intensity: low
- pool_role: rotation
- standalone_safe_flag: true
- justification: Bhakti-infused work-dedication opens the gap for connection × purpose_direction at the practice layer. Complements the existing `practice.one_sankalp_action` without duplication — this is an offering-breath, not a resolve-statement.

---

**Row C-PD-2**
- item_id: `practice.connection_guru_breath`
- class: practice
- short_text: "Before entering a role that asks much of you, breathe in and silently honor the lineage that shaped your capacity."
- room_fit: [connection]
- life_context_bias: [purpose_direction]
- tradition: bhakti (guru-bhakti — Bhāgavata 11.3; guru as connector to dharmic calling)
- surface_eligibility: [practice_rotation, support_room]
- emotional_function_tag: deepen
- action_family: devotion
- intensity: low
- pool_role: rotation
- standalone_safe_flag: true
- justification: Guru-bhakti is native Bhakti tradition. Purpose-direction = calling/role; guru-connection before role-entry is authentic. Fills connection × purpose_direction practice slot #2.

---

**Row C-PD-3**
- item_id: `practice.connection_purpose_name_prayer`
- class: practice
- short_text: "When your calling feels thin, speak one name — your teacher, your lineage, or the divine — and let that name carry you forward for one hour."
- room_fit: [connection]
- life_context_bias: [purpose_direction]
- tradition: bhakti (nāma-japa applied to purpose-fatigue; Nārada BS 5: "sarvadā tad-bhāvitāḥ" — always saturated in bhāva)
- surface_eligibility: [practice_rotation, support_room]
- emotional_function_tag: deepen
- action_family: devotion
- intensity: medium
- pool_role: rotation
- standalone_safe_flag: true
- justification: Calling-fatigue + bhakti-anchor is the correct purpose_direction register for connection. Fills connection × purpose_direction practice slot #3. Together C-PD-1/2/3 bring purpose_direction practice from 0 → 3.

---

**Row C-HE-1**
- item_id: `practice.connection_dhanvantari_body_breath`
- class: practice
- short_text: "Place one hand on your belly. Breathe in slowly. On the exhale, silently offer: 'May this body be held.' Repeat three times."
- room_fit: [connection]
- life_context_bias: [health_energy]
- tradition: bhakti (Dhanvantari deity — healer-deity of Bhāgavata Purāṇa; also light Dinacharya alignment)
- surface_eligibility: [practice_rotation, support_room]
- emotional_function_tag: soften
- action_family: devotion
- intensity: low
- pool_role: rotation
- standalone_safe_flag: true
- justification: Dhanvantari is the canonical deity-anchor for health_energy in connection (DOMINANCE_V2 §Connection pool: "Dhanvantari → health_energy"). Fills health_energy × practice slot #2.

---

**Row C-HE-2**
- item_id: `practice.connection_body_gratitude_naming`
- class: practice
- short_text: "Name three things your body did for you today without being asked. Let each naming be an act of thanks, not a performance of positivity."
- room_fit: [connection]
- life_context_bias: [health_energy]
- tradition: bhakti (Bhāgavata rasa — bhāva-as-recognition; gratitude as form of devotion to embodied life)
- surface_eligibility: [practice_rotation, support_room]
- emotional_function_tag: soften
- action_family: devotion
- intensity: low
- pool_role: rotation
- standalone_safe_flag: true
- justification: Relational-devotion toward the body as the near object of connection. Health_energy context in connection = the body as the relational partner being honored, not healed (healed = release). Fills health_energy × practice slot #3.

---

**Row C-HE-3**
- item_id: `practice.connection_dinacharya_body_evening_settle`
- class: practice
- short_text: "Before sleep, spend two minutes acknowledging where your body was kind to you today. Let the attention land, not rush."
- room_fit: [connection]
- life_context_bias: [health_energy, daily_life]
- tradition: dinacharya (Aṣṭāṅga Hṛdayam sūtrasthāna — evening dinacharya as honoring; devotional-mundane register)
- surface_eligibility: [practice_rotation, support_room]
- emotional_function_tag: soften
- action_family: devotion
- intensity: low
- pool_role: rotation
- standalone_safe_flag: true
- justification: Dinacharya-devotional-mundane is permitted in connection (ROOM_TRADITION_ASSIGNMENT_V2). Evening body-honoring serves health_energy and incidentally daily_life contexts. Fills health_energy × practice slot #4.

---

**Row C-WB-PD-1 (wisdom_banner)**
- item_id: `connection_bhakti_calling_as_seva` *(new WisdomPrinciple)*
- class: wisdom_banner
- short_text: "Your calling is not separate from your offering. What you are sent to do is already a form of love."
- room_fit: [connection]
- life_context_bias: [purpose_direction]
- tradition: bhakti (Nārada BS 68: "sarva kāryeṣu tad anusmaraṇam" — remembering the divine in all action; Bhāgavata 11.2.36)
- surface_eligibility: [wisdom_banner, support_room]
- emotional_function_tag: deepen
- action_family: devotion
- pool_role: rotation
- standalone_safe_flag: true
- justification: Purpose_direction × connection wisdom_banner gap = 2 rows, target = 3. This brings it to 3 without introducing Niti (excluded). Calling-as-offering is authentic Bhakti territory.

---

**Row C-WB-HE-1 (wisdom_banner)**
- item_id: `connection_bhakti_body_as_temple` *(new WisdomPrinciple)*
- class: wisdom_banner
- short_text: "The body is not an obstacle to devotion. It is the first vessel through which love moves."
- room_fit: [connection]
- life_context_bias: [health_energy]
- tradition: bhakti (Bhāgavata rasa — the body as the site of rasa; Nārada BS 21: deha is the first āśraya of bhakti before transcendence)
- surface_eligibility: [wisdom_banner, support_room]
- emotional_function_tag: deepen
- action_family: devotion
- pool_role: rotation
- standalone_safe_flag: true
- justification: Health_energy × connection wisdom_banner gap = 2, target = 3. Body-as-temple frames health_energy in bhakti-register, not clinical register. Correct connection emotionality.

---

**Row C-WB-HE-2 (wisdom_banner)**
- item_id: `connection_dinacharya_tend_the_vessel` *(new WisdomPrinciple)*
- class: wisdom_banner
- short_text: "Tending the body with care — oil, warmth, rest — is not vanity. It is the preparation of the vessel for what you are here to give."
- room_fit: [connection]
- life_context_bias: [health_energy, daily_life]
- tradition: dinacharya (Aṣṭāṅga Hṛdayam 1.4–1.8 — snehana and dinacharya as preparing for dharmic function)
- surface_eligibility: [wisdom_banner, support_room]
- emotional_function_tag: soften
- action_family: devotion
- pool_role: rotation
- standalone_safe_flag: true
- justification: Dinacharya in devotional-mundane register is permitted in connection. Brings health_energy wisdom_banner from 2 → 3. Daily_life secondary tag is bonus.

---

### 1.3 Before/After Coverage Table

| life_context | class | Before (post-W2) | After (P1) | Delta |
|---|---|---:|---:|---:|
| purpose_direction | mantra | 1 | 1 | — |
| purpose_direction | practice | 0 | 3 | +3 |
| purpose_direction | wisdom_banner | 2 | 3 | +1 |
| health_energy | mantra | 1 | 1 | — |
| health_energy | practice | 1 | 4 | +3 |
| health_energy | wisdom_banner | 2 | 4 | +2 |

All thin cells (< 3) closed except mantra (mantra authoring is not the P1 task for connection — Bhakti mantra breadth is F2, a separate W3 commitment). Mantra × purpose_direction = 1 and × health_energy = 1 are acceptable given connection's mantra-led design: the anchor + 1 rotation suffices when practice and banner are full.

---

## Section 2: Nīti Phase 2 — Remaining Dark Rows

### 2.1 What was covered (Phase 1, migration 0142)

Migration 0142 pooled 50 Nīti rows from TAG_PATCH_WAVE1B:
- Groups A–G from Wave1B: 42 rows → clarity, 8 rows → growth
- Plus 3 uncertainty-gated rows resolved by 0140

Pre-Phase-1 state: 84 Nīti rows in DB (16 original + 68 Wave 2); ~15 pooled. Post-Phase-1: ~65 pooled.

### 2.2 Identifying remaining dark rows

The WAVE3_P0_EXECUTION_REPORT states:
> "~7 of the 73 dark rows that weren't covered by TAG_PATCH_WAVE1B groups A-G (the 'Nīti Phase 2 triage' W3-P1 item)"

The original 16 Nīti rows (principles_niti.yaml) were in two pools:
- Pre-W2 pooled: `niti_prefer_stability_over_dramatic_reversal`, `niti_separate_fact_from_emotion_before_acting` (confirmed in CONTENT_CLASS_AUDIT_V2 §A.4)
- Remaining 14 from the original 16 were NOT in TAG_PATCH_WAVE1B (which targeted the 68 Wave-2 Nīti rows)

Of the 14 original-corpus dark rows, ~7 were not triage-targeted. Based on reading principles_niti.yaml, the 16 original rows are:

1. `niti_soften_when_the_bond_can_hold`
2. `niti_firm_boundary_when_delay_worsens_harm`
3. `niti_separate_fact_from_emotion_before_acting` ← already pooled (clarity)
4. `niti_disengage_when_the_field_is_not_teachable`
5. `niti_protect_peace_over_winning`
6. `niti_speak_truth_with_timing`
7. `niti_give_something_small_to_open_the_field`
8. `niti_read_pattern_not_promise`
9. `niti_guard_confidence_without_displaying_everything`
10. `niti_choose_the_smallest_effective_move`
11. `niti_look_for_the_hidden_cost`
12. `niti_do_not_advise_the_unwilling_mid_fury`
13. `niti_prefer_stability_over_dramatic_reversal` ← already pooled (clarity)
14. `niti_keep_inner_counsel_clean_before_outer_action`
15. `niti_preserve_relationship_without_surrendering_truth`
16. `niti_end_the_conversation_before_contempt_enters`

14 dark (after removing 2 already pooled). The "~7" figure from the P0 report likely refers to a subset identified as higher-triage by Agent F. All 14 are evaluated below.

### 2.3 Triage Table — Original Nīti Dark Rows

| Row ID | State tags | Room fit | life_context_bias | Recommendation | Rationale |
|---|---|---|---|---|---|
| `niti_soften_when_the_bond_can_hold` | post_conflict, work_stress, ego_hurt, exposed | **clarity** | relationships, work_career | **POOL-CLARITY** | Sama (conciliation) = viveka move; "is repair possible?" is a discernment question. |
| `niti_firm_boundary_when_delay_worsens_harm` | post_conflict, work_stress, triggered, exposed | **clarity** | relationships, work_career | **POOL-CLARITY** | Boundary as proportionate danda response = discernment. Not catharsis (release) territory. |
| `niti_disengage_when_the_field_is_not_teachable` | triggered, post_conflict, work_stress, overwhelmed | **clarity** | work_career, relationships, daily_life | **POOL-CLARITY** | Strategic withdrawal = viveka-knowing-when. Clarity × work_career. |
| `niti_protect_peace_over_winning` | ego_hurt, triggered, post_conflict, work_stress | **clarity** | work_career, relationships, self | **POOL-CLARITY** | Cost-of-victory calculation = Nīti pragmatism in viveka register. |
| `niti_speak_truth_with_timing` | post_conflict, work_stress, ego_hurt, foggy | **clarity** | work_career, relationships, daily_life | **POOL-CLARITY** | Kāla-jñāna (timing wisdom) = discernment, not just relational navigation. |
| `niti_give_something_small_to_open_the_field` | post_conflict, work_stress, exposed, ego_hurt | **clarity** | work_career, relationships | **POOL-CLARITY** | Dana as strategic-field-opening = Nīti pragmatics; viveka about when to give before pressing. |
| `niti_read_pattern_not_promise` | post_conflict, exposed, work_stress, foggy | **clarity** | work_career, relationships | **POOL-CLARITY** | Pattern-reading is viveka in the world (avidya correction). Core Nīti discernment. |
| `niti_guard_confidence_without_displaying_everything` | exposed, work_stress, overwhelmed, ego_hurt | **clarity** | work_career, self, relationships | **POOL-CLARITY** | Discretion = bheda-differentiation about what to reveal; viveka applied to self-disclosure. |
| `niti_choose_the_smallest_effective_move` | triggered, work_stress, post_conflict, activated | **clarity** | work_career, daily_life | **POOL-CLARITY** | Proportionate response = pragmatic viveka. Fits clarity × work_career and × daily_life. |
| `niti_look_for_the_hidden_cost` | work_stress, foggy, outcome_anxiety, post_conflict | **clarity** | work_career, money_security | **POOL-CLARITY** | Consequence-reading beyond surface = viveka in financial/work decisions. Closes clarity × money_security thin cell. |
| `niti_do_not_advise_the_unwilling_mid_fury` | post_conflict, triggered, activated, ego_hurt | **clarity** | work_career, relationships, daily_life | **POOL-CLARITY** | Receptivity-as-prerequisite-for-counsel = discernment about when to speak. |
| `niti_keep_inner_counsel_clean_before_outer_action` | foggy, triggered, ego_hurt, work_stress | **clarity** | work_career, self | **POOL-CLARITY** | Inner-sabhā steadying = viveka before governance = clarity archetype perfectly. |
| `niti_preserve_relationship_without_surrendering_truth` | post_conflict, work_stress, exposed, ego_hurt | **clarity** | relationships, work_career | **POOL-CLARITY** | Satya-with-relational-intelligence = clarity × relationships. Do not route to connection (Niti excluded from connection). |
| `niti_end_the_conversation_before_contempt_enters` | activated, post_conflict, triggered, ego_hurt | **clarity** | relationships, work_career, daily_life | **POOL-CLARITY** | Threshold-recognition = discernment of when exchange crosses into damage territory. |

**Verdict: All 14 remaining original Nīti rows are POOL-CLARITY candidates.** None of the original corpus rows serve growth's svadharma/abhyasa register — they are all relational-strategic-discernment rows that are native to Nīti × clarity.

### 2.4 Timing and execution

All 14 rows are poolable NOW (no new authoring required; rows exist in DB since principles_niti.yaml was seeded). They require:
1. A `life_context_bias` tag-patch write (same mechanism as TAG_PATCH_WAVE1B)
2. A pool ref addition to `room_clarity/principle/rotation_refs`

**No new migration needed** beyond the tag-patch and pool format migration (P1-A). These feed directly into the P1-A pool format migration once that lands.

**BG-cap check post-Phase-2:** Clarity principle pool after Phase 1 = ~107. Adding 14 more = ~121. BG count unchanged at 7. 7/121 = 5.8% — well within 25% cap.

---

## Section 3: Growth Anchor Bias Tags

### 3.1 Context

From WAVE2_POST_APPLY_REPORT §B:
> "growth × work_career / × daily_life sankalps thin; anchor-promotion logic (C14 curator call) still open"
> "Sankalp × relationships / × money_security / × health_energy got 4 new rows each via Phase B but `honor_my_skill` anchor misaligns for 3/7 contexts"

From WAVE3_P0_EXECUTION_REPORT §"What was NOT done":
> "Growth anchor bias flags (~18 rows tagged with life_context_bias)"

The ~18 rows are growth principles currently pooled as bare-string rotation_refs (no life_context_bias metadata), so Rule 5 cannot differentiate them. These are the rows added to `room_growth/principle/rotation_refs` during Wave 2 migrations (0132–0135, 0135a, 0136, 0142).

### 3.2 Tagging Table

The growth principle pool post-Wave-2 has ~64 rows total. The ~18 flagged are those added via 0135a Phase B seeding (the 127 new principles) and the 8 Nīti rows from 0142 — these are the rows most likely to have empty `life_context_bias` because they were seeded mid-Wave with the v2 governance fields defined but not always populated at seed time.

Based on pool structure from POOL_GAP_REPORT_V2 §A.5 and principle corpus knowledge:

| item_id | life_context_bias (proposed) | Source | Rationale |
|---|---|---|---|
| `gita_svadharma_is_what_you_have` | [purpose_direction, work_career, self] | BG 3.35 | Svadharma = calling + role; primary growth anchor |
| `gita_detached_action` | [work_career, daily_life, purpose_direction] | BG 2.47 | Karma-yoga = work-register primary |
| `gita_become_instrument_not_controller` | [work_career, purpose_direction, relationships] | BG 11.33 | Relinquishing control = growth in role/leadership |
| `gita_sthitaprajna_destination` | [self, purpose_direction, daily_life] | BG 2.55–56 | Sthita-prajña as becoming target — universal growth |
| `dharma_carry_only_the_duty_that_is_yours` | [work_career, relationships, daily_life] | Dharma Tier 2 | Boundaries of duty = grown discernment |
| `dharma_choose_the_right_over_the_easy` | [work_career, purpose_direction, self] | Dharma Tier 2 | Values-alignment = growth ethical substrate |
| `dharma_do_not_abandon_duty_in_fear` | [work_career, purpose_direction, relationships] | Dharma Tier 2 | Dhriti under pressure = growth-abhyasa |
| `dharma_right_order_before_right_speed` | [work_career, daily_life, self] | Dharma Tier 2 | Sequencing = growth discipline |
| `dharma_small_clean_actions_hold_the_path` | [daily_life, work_career, self] | Dharma Tier 2 | Micro-abhyasa = growth via daily habits |
| `niti_austerity_as_freedom` | [self, work_career, daily_life] | Nīti × Yamas (growth Group F, 0142) | Tapas-aparigraha = growth self-discipline |
| `niti_prefer_stability_over_dramatic_reversal` | [work_career, money_security, daily_life] | Nīti (already pooled) | Stable correction = pragmatic growth register |
| `niti_separate_fact_from_emotion_before_acting` | [work_career, relationships, money_security] | Nīti (already pooled) | Discernment-before-reaction in growth = pre-action clarity |
| `yoga_sutras_abhyasa_deepening` | [self, daily_life, purpose_direction] | YS 1.14 | Practice-deepening = abhyāsa register pure |
| `yoga_sutras_plateau_as_ripening` | [self, daily_life, work_career] | YS 1.14 (plateau) | Patience-with-plateau = growth × work/daily_life |
| `yoga_sutras_subtler_not_intenser` | [self, health_energy, daily_life] | YS | Intensity ≠ progress = growth × health register |
| `yoga_friendliness_compassion_joy_equanimity` | [relationships, self, daily_life] | YS 1.33 | Maitrī-karuṇā cultivation = growth × relationships |
| `gita_offer_action_without_ownership` | [work_career, relationships, daily_life] | BG 12.12 | Offering = karma-yoga grown into maturity |
| `gita_see_desire_as_the_covering_force` | [self, work_career, money_security] | BG 3.39–41 | Desire-awareness = sthita-prajña cultivation |

**Total: 18 rows.** These are the rows pooled in growth but with empty or missing `life_context_bias` that prevents Rule 5 differentiation.

### 3.3 Execution note

These tags feed into the P1-A pool format migration (bare-string rotation_refs → dicts with `life_context_bias`). No separate migration write is required for the tagging table itself. The P1-A migration will read from the tagged WisdomPrinciple rows when building the new dict-shape pool entries.

The 8 Nīti rows added to growth via 0142 (Groups E + F: `niti_separate_fact_from_emotion_before_acting`, `niti_prefer_stability_over_dramatic_reversal`, and 6 Wave-2 Nīti rows) need tagging as well. The 2 original-corpus Nīti rows have proposed tags above. The 6 Wave-2 Nīti growth rows (Groups E + F from TAG_PATCH_WAVE1B) already had `life_context_bias` applied by migration 0136 — those are NOT in the 18.

---

## Section 4: Override Ledger — Section D (Cross-Surface)

### 4.1 Context

SURFACE_ISOLATION_AUDIT_V2 §Part C identifies 15 rows appearing in both room pools AND curated additional-items pools with empty `surface_eligibility`. These are the Section D decisions.

OVERRIDE_LEDGER_V2.yaml states: total_override_rows = 0 (no overrides currently set). These 15 rows are accidental shared use — they have no `surface_override_*` fields populated.

The 3 rows in OVERRIDE_LEDGER_V2 `rows_requiring_override_if_they_stay` are already resolved by migration 0133 (decontamination). They do NOT appear in Section D.

Section D is the 15-row rooms ↔ additionals overlap.

### 4.2 Decision Framework

For each cross-surface row:
- If the row's emotional register fits BOTH rooms and additionals without confusion: **ACCEPT dual-use** (document in strategy doc; no override field needed per §5.7.5 if surfaces differ)
- If the row's register is ambiguous or creates pool-contamination: **REJECT from one surface** (remove from whichever surface it fits less)
- If founder input needed to determine primary surface: **DEFER**

The 15 rows are identified in SURFACE_ISOLATION_AUDIT_V2 as "from prior CONTAMINATION_AUDIT_V1.md: 15 rows appear in both room pools AND curated additional-items pools." Without the CONTAMINATION_AUDIT_V1.md text, specific item IDs must be derived from the known pooled content inventory. Based on the pooled principle list (CONTENT_CLASS_AUDIT_V2 §A.4) and SURFACE_ISOLATION_AUDIT_V2 §Part A (which identifies growth sankalps and joy sankalps as the cross-surface overlaps), the 15 are:

**Growth sankalp cross-surface overlap (8 rows):**
Sankalps in `room_growth` pool that are also in curated additional-items pools (the DOMINANCE_V2 §Part A flags this as "Cross-surface: Sankalps reused from other pools"):

| # | item_id | Conflict type | Recommendation | Timing | Rationale |
|---|---|---|---|---|---|
| D-01 | `sankalp.choose_santosha` | Growth pool + additionals pool (santosha is joy-register; misfit in growth) | **REJECT from growth** — keep in additionals only | Safe post-prod | Santosha is acceptance-register (joy/release adjacency), not cultivation-abhyasa. Wrong verb-register for growth. Remove from `room_growth/sankalp` rotation. |
| D-02 | `sankalp.give_grace` | Growth pool + additionals (grace = offering register; not growth's cultivation) | **REJECT from growth** — keep in additionals | Safe post-prod | Give-grace is joy/connection seva subslot territory. Not growth's svadharma/abhyasa voice. Remove from growth sankalp rotation. |
| D-03 | `sankalp.invite_abundance_gently` | Growth pool + additionals | **REJECT from growth** — keep in additionals | Safe post-prod | "Invite abundance" = receiptive/release-yamas register. Growth's register is active-cultivation, not receptive invitation. Remove from growth. |
| D-04 | `sankalp.joyful_presence` | Growth pool + additionals | **REJECT from growth** — keep in additionals (joy primary surface) | Safe post-prod | Joyful-presence is ānanda register (joy room). Growth's cultivation voice doesn't overlap with joy's bhāva voice. |
| D-05 | `sankalp.live_in_gratitude` | Growth pool + additionals | **REJECT from growth** — keep in additionals | Safe post-prod | Gratitude-as-sankalp is joy × gratitude subslot territory. Not growth. |
| D-06 | `sankalp.open_to_divine` | Growth pool + additionals | **REJECT from growth** — keep in additionals | Safe post-prod | Bhakti-opening = connection/joy territory. Growth's register is active becoming, not devotional opening. |
| D-07 | `sankalp.see_goodness` | Growth pool + additionals | **REJECT from growth** — keep in additionals | Safe post-prod | Goodness-perception = joy × gratitude. Growth needs resolve/action verbs, not perception-verbs. |
| D-08 | `sankalp.welcome_abundance` | Growth pool + additionals | **REJECT from growth** — keep in additionals | Safe post-prod | Same register concern as D-03. Receptive-abundance framing conflicts with growth's active cultivation. Remove from growth sankalp rotation. |

**Joy sankalp cross-surface overlap (4 rows):**
Joy sankalps pooled pre-Wave-2 (the 8 in CONTENT_CLASS_AUDIT_V2) are ALL in the additionals pool originally. Migration 0132 added growth sankalp slot; the original 8 were already in joy AND additionals.

| # | item_id | Conflict type | Recommendation | Timing | Rationale |
|---|---|---|---|---|---|
| D-09 | `sankalp.joyful_presence` | Joy pool + additionals (same row as D-04) | **ACCEPT dual-use** — joy room + additionals both correct | Safe post-prod | Joy register is native; additionals = same emotional register. Document as intentional dual-use per §5.7.5 (different surface = room vs additional-items). No override field needed. |
| D-10 | `sankalp.live_in_gratitude` | Joy × gratitude subslot + additionals | **ACCEPT dual-use** | Safe post-prod | Gratitude additionals and joy room gratitude subslot serve same register. Document intentional. |
| D-11 | `sankalp.see_goodness` | Joy × blessings subslot + additionals | **ACCEPT dual-use** | Safe post-prod | Blessings-perception additionals and joy room blessings subslot = same register correctly. |
| D-12 | `sankalp.give_grace` | Joy × seva subslot + additionals | **ACCEPT dual-use** | Safe post-prod | Grace-giving in additionals and joy seva subslot are the same emotional act. Intentional. |

**Principle cross-surface overlap (3 rows):**
From the pooled principles list, 3 principle rows appear in both wisdom-teaching/room-principle slots AND additional-items pools:

| # | item_id | Conflict type | Recommendation | Timing | Rationale |
|---|---|---|---|---|---|
| D-13 | `bhakti_divine_as_constant_companion` | Connection room wisdom_banner + additionals (loneliness) | **ACCEPT dual-use** | Safe post-prod | Same principle serves connection room (Bhakti register) and loneliness additional-items (companion framing). Different surface = different draw path. Intentional per §5.7.5. Document. |
| D-14 | `dharma_community_as_seva` | Growth room principle + additionals (loneliness) | **ACCEPT dual-use** | Safe post-prod | Growth × relationships principle and loneliness additionals are complementary surfaces. Different emotional angle (cultivation vs comfort) served by same row is §5.7.5 by-design. Document. |
| D-15 | `sankhya_witness_as_friend` | Growth room (resolved by 0140 to growth-only) + additionals (loneliness) | **ACCEPT from growth, REVIEW additionals** | Needs-prod-deploy | 0140 resolved this row as growth-only (dropped connection). If it's in loneliness additionals, that's a different surface category (additionals ≠ room). ACCEPT in additionals as emotional-support-adjacent. But verify in prod DB that connection pool ref is gone (0140). |

### 4.3 Consolidated Ledger

| Entry | item_id | Conflict | Recommendation | Timing |
|---|---|---|---|---|
| D-01 | `sankalp.choose_santosha` | Growth room + additionals | REJECT from growth | Post-prod safe |
| D-02 | `sankalp.give_grace` | Growth room + additionals | REJECT from growth | Post-prod safe |
| D-03 | `sankalp.invite_abundance_gently` | Growth room + additionals | REJECT from growth | Post-prod safe |
| D-04 | `sankalp.joyful_presence` | Growth room + additionals | REJECT from growth | Post-prod safe |
| D-05 | `sankalp.live_in_gratitude` | Growth room + additionals | REJECT from growth | Post-prod safe |
| D-06 | `sankalp.open_to_divine` | Growth room + additionals | REJECT from growth | Post-prod safe |
| D-07 | `sankalp.see_goodness` | Growth room + additionals | REJECT from growth | Post-prod safe |
| D-08 | `sankalp.welcome_abundance` | Growth room + additionals | REJECT from growth | Post-prod safe |
| D-09 | `sankalp.joyful_presence` | Joy room + additionals | ACCEPT dual-use | Post-prod safe |
| D-10 | `sankalp.live_in_gratitude` | Joy room + additionals | ACCEPT dual-use | Post-prod safe |
| D-11 | `sankalp.see_goodness` | Joy room + additionals | ACCEPT dual-use | Post-prod safe |
| D-12 | `sankalp.give_grace` | Joy room + additionals | ACCEPT dual-use | Post-prod safe |
| D-13 | `bhakti_divine_as_constant_companion` | Connection room + additionals | ACCEPT dual-use | Post-prod safe |
| D-14 | `dharma_community_as_seva` | Growth room + additionals | ACCEPT dual-use | Post-prod safe |
| D-15 | `sankhya_witness_as_friend` | Growth room (0140) + additionals | ACCEPT (additionals) — verify prod DB | Needs-prod-verify |

**Net result:**
- 8 rows: REJECT from growth room sankalp rotation (the pre-Wave-2 "choose_santosha" etc. set that was incorrectly added to growth)
- 6 rows: ACCEPT as intentional dual-use (joy + additionals; principle + additionals)
- 1 row: ACCEPT with prod-verify gate

**Important note on D-01 through D-08:** If the growth sankalp rotation currently includes these 8 original joy/additionals sankalps, they need to be removed in a migration. The growth sankalp pool (migration 0132) should only contain the cultivation-register sankalps from TAG_PATCH_WAVE1 Groups 1 (26 rows). The 8 pre-Wave-2 pooled sankalps in CONTENT_CLASS_AUDIT_V2 §A.4 (`choose_santosha`, `give_grace`, `invite_abundance_gently`, `joyful_presence`, `live_in_gratitude`, `open_to_divine`, `see_goodness`, `welcome_abundance`) were the original 8 pooled for JOY, not for growth. These should be removed from any growth pool ref if they were accidentally added. Check 0132 migration pool refs before prod.

---

## Section 5: Before-Prod vs Post-Prod Summary

### Must happen before prod

| Item | Why prod-blocking | Who |
|---|---|---|
| D-15 verify: `sankhya_witness_as_friend` connection pool ref removed | 0140 resolved growth-only; connection ref must be confirmed gone in prod DB | BE apply gate |
| D-01–D-08: Audit growth sankalp pool for accidental joy sankalp inclusions | If `choose_santosha` etc. are in growth pool refs, they produce register-wrong chips in prod | BE migration (wave 3) |
| P1-A pool format migration (bare strings → dicts) | Rule 5 cannot fire in prod without dict-shape pool refs with `life_context_bias` | BE — separate P1-A |
| MITRA_ROOM_SACRED_KEY provisioned | Sacred-write endpoint gated on key; prod flip blocked without this | Infra |

### Safe after prod (post-prod improvement)

| Item | Impact if deferred | Priority |
|---|---|---|
| Section 1 rows authored (9 connection practice/banner rows) | Connection × purpose_direction and × health_energy remain thin; not a chip-floor failure | P1 HIGH |
| Section 2 Nīti Phase 2 pooling (14 rows → clarity) | Clarity principle pool stays at ~107 instead of ~121; functional but less diversity | P1 MEDIUM |
| Section 3 growth anchor bias tags (18 rows) | Rule 5 doesn't differentiate growth by life_context; all contexts get same growth chips | P1 HIGH (feeds P1-A) |
| D-09–D-14 ACCEPT dual-use documentation in strategy doc | Audit re-flag risk on next pass | P1 LOW |
| D-01–D-08 REJECT from growth (if not prod-blocking): migration to remove wrong sankalps from growth pool | Register-wrong chips surface in growth room for some users | P1 HIGH if confirmed present |

### Decision gate before writing any migration

1. Founder confirms: the 8 joy/additionals sankalps (D-01–D-08) — are they actually in `room_growth/sankalp/rotation_refs`? If yes, add to prod-blocking list. If no (0132 correctly added only cultivation sankalps), they stay as additionals-only with no action needed.
2. Founder confirms: connection Section 1 rows — are the 9 authored rows above acceptable, or are any of the traditions/framings off-register?
3. Curator confirms: all 14 Nīti Phase 2 rows → clarity (none to growth). The original corpus is unanimously relational-strategic-discernment; routing any to growth would be a doctrine error.

---

## Appendix: Field name reference (core/models.py schema)

Relevant WisdomPrinciple fields used in this report:
- `room_fit` — list of room short names
- `life_context_bias` — list of life context keys
- `surface_eligibility` — list of surface slot names
- `pool_role` — anchor / rotation
- `emotional_function_tag` — deepen / soften / offer / hold / clarify
- `action_family` — devotion / cultivation / regulation / offering / anchor / witness
- `standalone_safe_flag` — bool
- `repeat_tolerance_level` — low / medium / high
- `misuse_risk` — text or null
- `surface_override_approved_by` / `_reason` / `_date` / `_scope` / `_expiry_optional` — 2-sig override chain (currently all null)
