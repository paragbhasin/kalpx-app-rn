# P1 Surface Isolation Re-Audit

**Date:** 2026-04-21
**Auditor:** P1 Surface Isolation Agent
**Scope:** Post-P1 changes — P1-A (pool format migration 0144), P1-B (Bhakti breadth: 14 new rows), P1-C (content fill: 9 connection rows, 14 Nīti triage, 18 growth bias tags, 15 override ledger decisions)
**Input documents:** P1_CONTENT_FILL_REPORT.md, P1_BHAKTI_BREADTH_REPORT.md, SURFACE_ISOLATION_AUDIT_V2.md, ROOM_TRADITION_ASSIGNMENT_V2.md, OVERRIDE_LEDGER_V2.yaml, ROOM_CLASS_DOMINANCE_V2.md
**Status:** FOUNDER-REVIEW-REQUIRED — Section 6 items require binary decisions before any migration write

---

## Section 1: Connection Room Isolation

### 1.1 Tradition Compliance Check

Connection permitted traditions per ROOM_TRADITION_ASSIGNMENT_V2:
- **Dominant:** Bhakti (Nārada Bhakti Sūtras, Bhāgavata rasa; Kṛṣṇa/Rāma/Viṣṇu deity anchors)
- **Light support:** Dinacharya (devotional-mundane), Yamas (ahiṃsā-as-connection), BG Ch 12 (secondary only)
- **Excluded:** Niti, Sankhya, Shaiva/Tantric

**P1-C Connection Rows — Tradition Audit:**

| Row ID | Tradition claimed | Permitted? | Verdict |
|---|---|---|---|
| `practice.connection_morning_name_dedication` | Bhakti (Nārada — sarva karma phala tyāga) | Yes — dominant tradition | PASS |
| `practice.connection_guru_breath` | Bhakti (guru-bhakti — Bhāgavata 11.3) | Yes — dominant tradition | PASS |
| `practice.connection_purpose_name_prayer` | Bhakti (nāma-japa — Nārada BS 5) | Yes — dominant tradition | PASS |
| `practice.connection_dhanvantari_body_breath` | Bhakti (Dhanvantari deity — Bhāgavata) + light Dinacharya | Yes — dominant + light-support | PASS |
| `practice.connection_body_gratitude_naming` | Bhakti (Bhāgavata rasa — bhāva-as-recognition) | Yes — dominant tradition | PASS |
| `practice.connection_dinacharya_body_evening_settle` | Dinacharya (Aṣṭāṅga Hṛdayam sūtrasthāna) | Yes — light-support tradition | PASS |
| `connection_bhakti_calling_as_seva` (wisdom_banner) | Bhakti (Nārada BS 68; Bhāgavata 11.2.36) | Yes — dominant tradition | PASS |
| `connection_bhakti_body_as_temple` (wisdom_banner) | Bhakti (Bhāgavata rasa; Nārada BS 21) | Yes — dominant tradition | PASS |
| `connection_dinacharya_tend_the_vessel` (wisdom_banner) | Dinacharya (Aṣṭāṅga Hṛdayam 1.4–1.8) | Yes — light-support tradition | PASS |

All 9 rows use permitted traditions. No excluded traditions (Niti, Sankhya, Shaiva/Tantric) appear. **Tradition compliance: CLEAN.**

**P1-B Connection Rows — Tradition Audit:**

All 14 P1-B connection/joy rows use Bhakti tradition (Gauḍīya, Ālvār, Sant lineages), which is the dominant tradition for connection. All 14 are permitted. **Tradition compliance: CLEAN.**

---

### 1.2 Register Check — Does Each Row Maintain Connection's Register?

Connection register: **relational-reaching**, embodied, anāhata. Not striving/expansive (growth), not cathartic (release), not celebrating-what-is (joy).

**P1-C row register check:**

| Row ID | Register read | Cross-room ambiguity? | Verdict |
|---|---|---|---|
| `connection_morning_name_dedication` | Offering-breath before work. Devotional, low-intensity. | Mild: could read as growth's karma-yoga work-entry. Bhakti framing (offering vs. resolve) distinguishes it. | PASS — `offer` emotional_function tag + devotion action_family anchors it in connection. |
| `connection_guru_breath` | Honoring lineage before role-entry. Guru-bhakti. | Mild: purpose_direction + guru breath = could be confused as growth's svadharma anchoring. The "honor the lineage" register is relational (connection), not "I become" (growth). | PASS — reaching-toward rather than becoming. |
| `connection_purpose_name_prayer` | Nāma-japa for calling-fatigue. Speaking a name to be carried. | Moderate: calling-fatigue + purpose_direction is also clarity territory (discernment under fog). P1-C correctly used bhakti-nāma register, not viveka register. | PASS — but this is the connection row most susceptible to misfire if surfaced to a user in `foggy` or `outcome_anxiety` states who needs clarity not connection. Flag for context-tag curation. |
| `connection_dhanvantari_body_breath` | Hand on belly, "May this body be held." Somatic offering. | Low: heal-the-body register is adjacent to release (somatic) but the offering-frame ("May this body be held" = devotional offering, not catharsis) keeps it in connection. | PASS — offering frame is correct. |
| `connection_body_gratitude_naming` | Naming three body acts as thanks. Not performance of positivity. | Low: gratitude register overlaps with joy. P1-C correctly specified "not a performance of positivity" — the frame is relational recognition (body as partner), not celebratory gratitude. | PASS — but surface this row with `emotional_function: soften` not `offer` to distinguish from joy gratitude at chip display. |
| `connection_dinacharya_body_evening_settle` | Evening body-attention with Dinacharya framing. | Low: Dinacharya in devotional-mundane is permitted. Evening settle = acceptable boundary. | PASS — correctly uses the light-support Dinacharya register. |
| `connection_bhakti_calling_as_seva` | "Your calling is not separate from your offering." | Moderate: calling-as-offering in purpose_direction is growth's karma-yoga-flavored territory at first read. The bhakti key: it is calling = offering (connection register), not calling = dharmic duty to fulfill (growth register). | PASS — but this row is growth-adjacent. If a user is in `purpose_direction` with an abhyāsa emotional state rather than a devotional emotional state, growth would be the correct room. The row itself is fine; routing logic must handle the upstream room-selection correctly. |
| `connection_bhakti_body_as_temple` | "The body is not an obstacle to devotion." | Low: anti-obstacle framing is connection. Heal-register would be release. | PASS — clean. |
| `connection_dinacharya_tend_the_vessel` | "Tending the body...preparation of the vessel for what you are here to give." | Moderate: "for what you are here to give" echoes purpose_direction + growth's dharma orientation. The critical distinction: this is Dinacharya preparation (relational-mundane devotion), not svadharma actualization. | PASS — Dinacharya frame distinguishes it from growth. But the `purpose_direction` secondary bias means Rule 5 could surface it during a growth session too if the user has purpose_direction life_context. Cross-room Rule 5 risk flagged (see Section 5). |

---

### 1.3 Are Any Rows Ambiguous Enough to Belong in Growth or Joy Instead?

Three rows have cross-room adjacency that should be documented:

1. **`connection_purpose_name_prayer`** — The calling-fatigue + nāma register is authentic connection, but a user in `foggy/outcome_anxiety + purpose_direction` context is equally well-served by clarity's viveka or growth's abhyāsa. This row should NOT be in connection if the room-selection already directed the user to clarity or growth. The row is fine in connection but should carry `exclude_if_room_is: [clarity, growth]` metadata for curator review.

2. **`connection_bhakti_calling_as_seva`** — Growth-adjacent as noted above. The register is correct for connection but the surface text ("your calling... already a form of love") could read as karmic-resolution to a user expecting growth content. Safe to keep but pairs with upstream room-selection discipline.

3. **`connection_dinacharya_tend_the_vessel`** — The `daily_life` secondary tag creates mild joy/connection overlap (joy can also serve daily_life contexts). The key distinction is `action_family: devotion` + Dinacharya (not Bhakti ānanda). Safe to keep.

**Overall: Connection identity preserved? YES.** All 9 P1-C rows are register-correct for connection. Three rows require curator-side exclusion notes for room co-selection edge cases, not editorial changes.

---

### 1.4 P1-B Bhakti Breadth — Connection Isolation Assessment

The 14 P1-B rows maintain clear register separation:
- All connection-assigned P1-B rows use `emotional_function: deepen` (reaching-toward)
- All joy-assigned P1-B rows use `emotional_function: offer` (celebrating-what-is)
- The one dual-tagged row (G-3: `bhakti_gaudia_love_that_aches_is_already_meeting`) has doctrinal grounding (viraha-ānanda is doctrinally simultaneous reaching and arriving) — unique exception, not a pattern

**P1-B connection isolation: CLEAN.**

**One flag for founder:** Row A-3 (`bhakti_alvar_no_ego_remains_when_the_beloved_fills_the_room`, Nammāḷvār Tiruvāymoḻi 10.10) describes the complete dissolution of the self into divine love. This is connection's deepening register at maximum intensity. It is wisdom_banner-only (not teaching), which is correct. However, this row is also conceptually adjacent to Release's release-of-self register (Shaiva/Tantric). The key difference: Ālvār self-dissolution = filling with Beloved (connection); Release = emptying contraction (somatic). The emotional movement is opposite. Row is correctly placed.

---

## Section 2: Nīti Phase 2 Assignment Validation

### 2.1 Triage Table

P1-C routed all 14 remaining original-corpus Nīti rows to clarity. Verdict per row:

| item_id | P1-C assignment | Your verdict | Notes |
|---|---|---|---|
| `niti_soften_when_the_bond_can_hold` | clarity | CONFIRM | Sama (conciliation) discernment = viveka. Not catharsis (release), not relational reaching (connection). Clarity × relationships. |
| `niti_firm_boundary_when_delay_worsens_harm` | clarity | CONFIRM | Boundary-proportionality = pragmatic viveka in protective-danda mode. Clarity × work_career or × relationships. |
| `niti_disengage_when_the_field_is_not_teachable` | clarity | CONFIRM | Strategic withdrawal = knowing-when = core viveka function. No release register; no growth register. |
| `niti_protect_peace_over_winning` | clarity | CONFIRM | Cost-of-victory calculation is Nīti pragmatism in the discernment register — not a cultivation-abhyāsa row (growth) nor a cathartic row (release). |
| `niti_speak_truth_with_timing` | clarity | CONFIRM | Kāla-jñāna (timing wisdom) is viveka in social/world context. Fits clarity × work_career × daily_life. |
| `niti_give_something_small_to_open_the_field` | clarity | CONFIRM | Dana-as-strategic-field-opening = Nīti pragmatics. Clarity × work_career. Note: this row has mild connection adjacency (giving as relational act). Nīti is excluded from connection — route to clarity only. |
| `niti_read_pattern_not_promise` | clarity | CONFIRM | Pattern-reading = avidya-correction = viveka in the world. Core Nīti discernment. |
| `niti_guard_confidence_without_displaying_everything` | clarity | CONFIRM | Bheda-differentiation about self-disclosure = viveka applied to information boundary. |
| `niti_choose_the_smallest_effective_move` | clarity | CONFIRM | Proportionate response = pragmatic viveka. Fits clarity × work_career and × daily_life. |
| `niti_look_for_the_hidden_cost` | clarity | CONFIRM | Consequence-reading = viveka in financial/work decisions. Clarity × money_security. This is a gap-filler — money_security is thin in clarity. High-value assignment. |
| `niti_do_not_advise_the_unwilling_mid_fury` | clarity | CONFIRM | Receptivity-prerequisite = discernment about when to speak. Viveka × relationships × work_career. |
| `niti_keep_inner_counsel_clean_before_outer_action` | clarity | CONFIRM | Inner-sabhā steadying before acting = viveka before governance. Clarity archetype textbook case. |
| `niti_preserve_relationship_without_surrendering_truth` | clarity | CONFIRM | Satya-with-relational-intelligence = clarity × relationships. P1-C's explicit note "Do not route to connection (Niti excluded from connection)" is correct and important. |
| `niti_end_the_conversation_before_contempt_enters` | clarity | CONFIRM | Threshold-recognition = discernment of when exchange crosses into damage territory. Clarity × relationships. |

**All 14: CONFIRMED as clarity assignments.** Zero disputes. The original Nīti corpus is unanimously relational-strategic-discernment — viveka in social context. None have growth (svadharma/abhyāsa) register. None have release register. The two existing growth assignments from the original corpus (`niti_prefer_stability_over_dramatic_reversal`, `niti_separate_fact_from_emotion_before_acting`) were already pooled before Phase 2; they were correct growth assignments (pre-action discernment in pragmatic-growth mode).

### 2.2 Dual-Tag Potential

Three rows have secondary context flags that should be noted — they do not dispute the clarity assignment, but they add nuance:

- **`niti_give_something_small_to_open_the_field`**: Mild connection register (giving as relational act) but Nīti is excluded from connection. Correctly clarity-only. No dual-tag.
- **`niti_preserve_relationship_without_surrendering_truth`**: The "preserve relationship" language is connection-adjacent, but again Nīti is excluded from connection. The row stays clarity × relationships only.
- **`niti_look_for_the_hidden_cost`**: This is the one row that could have argued for growth × money_security (cost-consciousness as growth discipline). The decision to route to clarity is correct because the diagnostic framing ("look for") is viveka not abhyāsa. Growth's money_security register is cultivation, not cost-analysis. Clarity is right.

### 2.3 Class Dominance After Phase 2

Pre-Phase-2 clarity principle pool: ~107 rows.
Post-Phase-2 (+ 14 Nīti rows): ~121 rows.

BG count in clarity: 7 rows (unchanged). 7/121 = 5.8% — well within 25% BG-cap.
Nīti count in clarity: previously ~58 (42 from Wave1B Group A-G + 16 original). After Phase 2: 14 additional → ~72 Nīti rows in clarity out of ~121 total = **59.5% of clarity principle pool is Nīti**.

**FLAG:** Nīti now constitutes approximately 60% of the clarity principle pool. The ROOM_TRADITION_ASSIGNMENT_V2 designates Sankhya and Yoga-Sūtras as co-dominant with Nīti in clarity. A 60% Nīti share risks making clarity feel like a Nīti room rather than a viveka room. The Sankhya and YS rows need to be urgently pooled to balance. This is NOT a reason to stop Phase 2 pooling — the rows are correctly assigned — but it creates a class-dominance concern that should be flagged for founder review (see Section 6, F-1).

---

## Section 3: Growth Bias Tag Validation

### 3.1 Tagging Table Validation

P1-C proposed 18 growth rows for `life_context_bias` tagging. Verdict per row:

| item_id | P1-C bias (proposed) | Your verdict | Notes |
|---|---|---|---|
| `gita_svadharma_is_what_you_have` | [purpose_direction, work_career, self] | CONFIRM | BG 3.35 svadharma = calling + role. Primary growth anchor. All three contexts correct. |
| `gita_detached_action` | [work_career, daily_life, purpose_direction] | CONFIRM | BG 2.47 karma-yoga = work-register primary. All three correct. `daily_life` is valid (detachment applies to all acts). |
| `gita_become_instrument_not_controller` | [work_career, purpose_direction, relationships] | CONFIRM | BG 11.33 relinquishing control = growth in role/leadership. `relationships` is a legitimate third tag (instrument-not-controller applies to interpersonal power dynamics). |
| `gita_sthitaprajna_destination` | [self, purpose_direction, daily_life] | CONFIRM | BG 2.55–56 sthita-prajña as becoming target = universal growth archetype. All three contexts correct. |
| `dharma_carry_only_the_duty_that_is_yours` | [work_career, relationships, daily_life] | CONFIRM | Boundaries of duty = grown discernment. All three correct. |
| `dharma_choose_the_right_over_the_easy` | [work_career, purpose_direction, self] | CONFIRM | Values-alignment = growth ethical substrate. All three correct. |
| `dharma_do_not_abandon_duty_in_fear` | [work_career, purpose_direction, relationships] | CONFIRM | Dhriti under pressure = growth-abhyāsa. All three correct. |
| `dharma_right_order_before_right_speed` | [work_career, daily_life, self] | CONFIRM | Sequencing = growth discipline. All three correct. |
| `dharma_small_clean_actions_hold_the_path` | [daily_life, work_career, self] | CONFIRM | Micro-abhyāsa = growth via daily habits. All three correct. |
| `niti_austerity_as_freedom` | [self, work_career, daily_life] | CONFIRM | Tapas-aparigraha in growth register. Note: `niti_austerity_as_freedom` — if this row is in the growth pool (from 0142 Groups E/F), the Nīti-in-growth placement is intentional (Nīti-as-substrate-for-growth-discipline is permitted per ROOM_TRADITION_ASSIGNMENT_V2 §Growth). |
| `niti_prefer_stability_over_dramatic_reversal` | [work_career, money_security, daily_life] | CONFIRM | Stable correction = pragmatic growth register. `money_security` is important to confirm: growth × money_security is a thin cell, this helps. Correct. |
| `niti_separate_fact_from_emotion_before_acting` | [work_career, relationships, money_security] | CONFIRM | Pre-action discernment in growth mode. Note: This is also CONFIRMED as clarity material in Section 2 (it was already pooled in clarity before Phase 2). If it is ALSO in the growth pool (which 0142 indicates), it is legitimately dual-pool. Dual-pool of a Nīti row across clarity and growth is acceptable when the emotional register is different (pre-action = clarity; the practice-of-acting-with-discernment = growth). Document as intentional. |
| `yoga_sutras_abhyasa_deepening` | [self, daily_life, purpose_direction] | CONFIRM | YS 1.14 practice-deepening = abhyāsa register pure. All three correct. |
| `yoga_sutras_plateau_as_ripening` | [self, daily_life, work_career] | CONFIRM | Patience-with-plateau = growth × work/daily_life. All three correct. |
| `yoga_sutras_subtler_not_intenser` | [self, health_energy, daily_life] | CONFIRM | Intensity ≠ progress = growth × health register. `health_energy` here is in the growth-through-physical-practice modality, not the body-as-vessel (connection) or body-as-stored-contraction (release) modality. Correct. |
| `yoga_friendliness_compassion_joy_equanimity` | [relationships, self, daily_life] | CONFIRM WITH FLAG | YS 1.33 maitrī-karuṇā cultivation = growth × relationships. The `joy` in the item_id (`yoga_friendliness_compassion_joy_equanimity`) is muditā — sympathetic joy — not ānanda-joy-room content. This row must NOT enter the joy room pool. The item_id naming creates a risk of confusion. The growth-only routing is correct but should be explicitly documented. |
| `gita_offer_action_without_ownership` | [work_career, relationships, daily_life] | CONFIRM | BG 12.12 offering = karma-yoga grown into maturity. All three correct. |
| `gita_see_desire_as_the_covering_force` | [self, work_career, money_security] | CONFIRM | BG 3.39–41 desire-awareness = sthita-prajña cultivation. All three correct. `money_security` is particularly apt (desire covering = craving-accumulation). |

**All 18 tags: CONFIRMED.** One documentation flag (`yoga_friendliness_compassion_joy_equanimity` item_id creates joy-room confusion risk — should carry explicit `room_fit: [growth]` not `[growth, joy]`).

### 3.2 Cross-Territory Bleed Assessment

The 18 tags do not inappropriately bleed into connection or clarity territory. Key checks:

- **Growth vs. Clarity bleed:** `niti_separate_fact_from_emotion_before_acting` and `niti_prefer_stability_over_dramatic_reversal` could be dual-pool (clarity + growth). P1-C confirms they are in growth; they were already pooled in clarity before Phase 2. This is the legitimate dual-pool case. Register difference holds: clarity = diagnostic viveka; growth = practicing-the-discernment-in-action. Safe.

- **Growth vs. Connection bleed:** None of the 18 rows are connection-adjacent. Growth's BG/Dharma/YS traditions do not overlap with connection's Bhakti traditions. Clean.

- **Growth vs. Joy bleed:** The `yoga_friendliness_compassion_joy_equanimity` item_id risk is flagged above. The content itself (maitrī-karuṇā-muditā-upekṣā cultivation) is growth's systematic cultivation, not joy's spontaneous ānanda. But the pool-routing logic must not accidentally pull this into joy. Flag.

---

## Section 4: Override Ledger Review

### 4.1 Context

The OVERRIDE_LEDGER_V2.yaml shows `total_override_rows: 0` — no surface_override_* fields are populated. The P1-C Section 4 decisions are operational calls about 15 cross-surface rows (rooms ↔ additional-items overlap), not override field settings.

The 3 rows in OVERRIDE_LEDGER_V2 `rows_requiring_override_if_they_stay` (mantra.soham, yoga_sutras_one_anchor_when_scattered, practice.hand_on_heart) are cross-room contamination, NOT the 15 cross-surface decisions. These 3 are handled separately (decontamination; migration 0133). P1-C correctly notes these are resolved.

### 4.2 Decision Review Table

| Entry | item_id | P1-C call | My call | Agreement? | Notes |
|---|---|---|---|---|---|
| D-01 | `sankalp.choose_santosha` | REJECT from growth | **AGREE** | Yes | Santosha = acceptance/contentment register. Not cultivation-abhyāsa. Growth sankalp verb-register requires action/cultivation orientation. Reject is correct. |
| D-02 | `sankalp.give_grace` | REJECT from growth | **AGREE** | Yes | Give-grace = offering register (joy/connection seva territory). Growth's svadharma register is not served by grace-giving. Reject is correct. |
| D-03 | `sankalp.invite_abundance_gently` | REJECT from growth | **AGREE** | Yes | Receptive/inviting register conflicts with growth's active cultivation. "Invite" = receive mode, not practice mode. Reject is correct. |
| D-04 | `sankalp.joyful_presence` | REJECT from growth | **AGREE** | Yes | Ānanda register = joy room primary. Growth does not cultivate joyful presence as a resolve — it cultivates dharmic action. Reject is correct. |
| D-05 | `sankalp.live_in_gratitude` | REJECT from growth | **AGREE** | Yes | Gratitude-as-sankalp = joy × gratitude subslot territory. Growth resolve is active not appreciative. Reject is correct. |
| D-06 | `sankalp.open_to_divine` | REJECT from growth | **AGREE** | Yes | Bhakti-opening = connection/joy. Growth's tradition (BG/Dharma/Yamas) does not frame svadharma as "opening to divine" — that is the Bhakti register. Reject is correct. |
| D-07 | `sankalp.see_goodness` | REJECT from growth | **AGREE** | Yes | Goodness-perception = joy × gratitude/blessings. Growth's resolve is not perceptual — it is action-oriented. Reject is correct. |
| D-08 | `sankalp.welcome_abundance` | REJECT from growth | **AGREE** | Yes | Same as D-03 and D-05. Receptive-abundance framing is wrong verb-register for growth. Reject is correct. |
| D-09 | `sankalp.joyful_presence` | ACCEPT dual-use (joy + additionals) | **AGREE** | Yes | Joy room native. Additionals pool serving same register. Different surface = different draw path. §5.7.5 by-design. |
| D-10 | `sankalp.live_in_gratitude` | ACCEPT dual-use (joy + additionals) | **AGREE** | Yes | Joy gratitude subslot + additionals = same emotional register. Intentional dual-use per §5.7.5. |
| D-11 | `sankalp.see_goodness` | ACCEPT dual-use (joy + additionals) | **AGREE** | Yes | Joy blessings subslot + additionals = same register. §5.7.5 correct. |
| D-12 | `sankalp.give_grace` | ACCEPT dual-use (joy + additionals) | **AGREE** | Yes | Joy seva subslot + additionals = same emotional act. §5.7.5 correct. |
| D-13 | `bhakti_divine_as_constant_companion` | ACCEPT dual-use (connection + additionals) | **AGREE** | Yes | Same principle serves connection room (Bhakti register) and loneliness additionals (companion framing). Different draw path. §5.7.5. |
| D-14 | `dharma_community_as_seva` | ACCEPT dual-use (growth + additionals) | **AGREE** | Yes | Growth × relationships principle + loneliness additionals are complementary surfaces. Register difference (cultivation vs. comfort) served by same row is §5.7.5. |
| D-15 | `sankhya_witness_as_friend` | ACCEPT (additionals) + VERIFY prod DB connection pool ref removed | **AGREE WITH CAVEAT** | Yes, with caveat | Migration 0140 resolved this as growth-only (dropped connection pool ref). If it appears in loneliness additionals, that is a different surface category. The accept-in-additionals call is correct. **The prod-verify gate is LOAD-BEARING** — if the connection pool ref was not removed in 0140's dev apply, this is a live contamination bug. Must verify before prod flip, not just before migration write. |

**Overall ledger assessment:** 15/15 P1-C calls confirmed. 8 REJECT-from-growth decisions are unanimously correct — the 8 rows are joy/acceptance-register sankalps that should never have been in growth rotation refs. 7 ACCEPT-dual-use decisions are correctly reasoned using §5.7.5 (same row, different surface = not a violation, no override needed).

**One procedural note:** The D-01 through D-08 finding creates an important migration requirement. If these 8 joy-register sankalps are currently in `room_growth/sankalp/rotation_refs` (migration 0132 may have incorrectly included them alongside the cultivation-register sankalps), this is a live register-wrong chip in the growth room for all current users. This should be treated as prod-blocking if confirmed present, not post-prod. P1-C calls it "prod-blocking if confirmed" — agree. This must be the first migration write after confirmation.

---

## Section 5: Cross-Room Register Integrity (Post All P1 Changes)

### 5.1 Per-Room Register Assessment

**Stillness:**
- P1 changes: None directly (P1-A pool format migration touches all rooms; no new stillness content).
- Pre-existing contamination (soham, hand_on_heart, yoga_sutras_one_anchor — resolved by migration 0133) is no longer active.
- P1-A dict-format migration will allow Rule 5 to fire in stillness. Since stillness has no life_context (pre-cognitive room), Rule 5 is structurally irrelevant for stillness — life_context_bias tags on stillness rows will not produce +1 score since stillness selection is emotion-based, not context-based.
- **Register: INTACT.** No P1 changes affect stillness isolation.

**Connection:**
- P1-C adds 9 new rows (all Bhakti/Dinacharya — permitted traditions). P1-B adds 10 connection rows (all Bhakti — dominant tradition). Total connection pool growth: +19 rows across practice and wisdom_banner/teaching slots.
- Pre-existing contamination (soham, hand_on_heart — resolved by 0133) is gone.
- Three P1-C rows have mild cross-room adjacency (flagged in Section 1.3) but remain register-correct.
- Rule 5 now fires: connection rows with `life_context_bias: [purpose_direction]` will surface preferentially for purpose_direction users. The calling-as-seva (C-WB-PD-1) and guru_breath rows will compete in the Rule 5 weight. This is by-design and correct.
- **Register: INTACT.** Connection identity = mantra-led Bhakti reaching. P1 additions stay inside this definition.

**Release:**
- P1 changes: None. Release was the cleanest room pre-P1 and P1 adds nothing to release.
- **Register: INTACT.** Confirmed clean.

**Clarity:**
- P1-C adds 14 Nīti principle rows. The Nīti pool share now reaches ~60% of the clarity principle pool (~72 of ~121 rows). This is not a register violation — all 14 rows are correct clarity assignments — but it is a **tradition-dominance concern** (see F-1 in Section 6).
- The wisdom_teaching and practice slots are not affected by P1-C.
- **Register: INTACT** but approaching Nīti-saturation in principle slot. Action needed to balance with Sankhya/YS rows.

**Growth:**
- P1-C tags 18 rows with `life_context_bias`, enabling Rule 5 differentiation. This is a positive change — growth becomes more context-responsive.
- D-01 through D-08: If the 8 joy-register sankalps are confirmed present in growth rotation_refs, growth currently serves register-wrong sankalp chips. This is a pre-P1 bug confirmed by P1-C, not introduced by P1-C.
- P1-A dict format migration: Once live, growth sankalp and principle rotation will fire Rule 5 correctly. The 18 bias-tagged rows will weight correctly for context.
- **Register: INTACT for principle/practice slots.** Sankalp slot status depends on D-01–D-08 confirmation (conditional on migration 0132 audit).

**Joy:**
- P1-B adds 4 joy rows (G-3 dual, G-5 Gauḍīya; A-4 Ālvār; S-4 Sant). All are Bhakti ānanda-register (`emotional_function: offer`). Joy pool grows from 5 to 9 wisdom_banner rows.
- No cross-room contamination from P1-B additions.
- The dual-tagged G-3 row (`bhakti_gaudia_love_that_aches_is_already_meeting`, connection + joy) is wisdom_banner only — this format is appropriate for the viraha-ānanda paradox.
- **Register: INTACT.** Joy identity = sankalp-led ānanda. P1-B additions are banners only (non-primary class for joy), so the sankalp dominance is undisturbed.

---

### 5.2 Contamination Risk Map (Post All P1 Changes)

| Risk | Severity | Status | Action |
|---|---|---|---|
| `mantra.soham` in stillness + connection | Critical (pre-P1) | RESOLVED by 0133 | None |
| `yoga_sutras_one_anchor_when_scattered` in stillness + clarity | Critical (pre-P1) | RESOLVED by 0133 | None |
| `practice.hand_on_heart` in stillness + connection | Medium (pre-P1) | RESOLVED by 0133 | None |
| `sankhya_witness_as_friend` connection pool ref | Medium | PROD-VERIFY gate (D-15) | Verify 0140 applied correctly before prod |
| D-01–D-08 joy sankalps in growth pool | High (if confirmed present) | UNCONFIRMED — must check 0132 migration | Audit 0132 `room_growth/sankalp/rotation_refs` immediately |
| Rule 5 firing cross-room (same item_id in multiple rooms after dict migration) | Medium | Latent — not yet a problem | Ensure each row's `room_fit` is single-room unless intentionally dual |
| `niti_separate_fact_from_emotion_before_acting` in both clarity + growth pools | Low | Intentional dual-pool — different register context | Document as intentional in strategy doc |
| Nīti ~60% of clarity principle pool | Medium-Low | Functional but aesthetically Nīti-dominated | Balance with Sankhya/YS pooling (Wave 3 P2 action) |
| `yoga_friendliness_compassion_joy_equanimity` item_id confusion with joy room | Low | Documentation only | Confirm room_fit is growth-only in DB |
| `connection_purpose_name_prayer` — surfacing to foggy/outcome_anxiety users who need clarity | Low | Curator-side only; row is correct | Add exclude_if_room_is: [clarity] curator note |
| S-2 Mirabai (`bhakti_sant_mira_i_have_chosen_the_path_that_cannot_be_taken_back`) intensity=high | Low | Curator note needed | Exclude from connection in grief_acute contexts |

---

### 5.3 Class Dominance Table (Post P1)

| Room | Dominant class | Current dominant % | Concern? |
|---|---|---|---|
| Stillness | Practice | ~55% of pool | Clean — by design |
| Connection | Mantra (anchor) + Wisdom banner/teaching (after P1-B) | Mantra: ~30%; WB+WT: ~50% | WB/WT growth is fine — wisdom_teaching was gated and P1-B populates appropriately |
| Release | Practice (somatic) | ~60% | Clean — by design |
| Clarity | Principle (Nīti-dominant) | Nīti: ~60% of principle pool | FLAG — balance needed (see Section 6 F-1) |
| Growth | Principle + Sankalp co-primary | Principle: ~70% of principle+sankalp pool; Sankalp: ~30% | Acceptable post-0132 — once sankalp slot is confirmed clean |
| Joy | Sankalp | Sankalp: ~55% of joy pool | Clean — by design |

---

## Section 6: Items Requiring Founder Sign-Off

### F-1: Nīti dominance in clarity principle pool (binary decision required)

**Finding:** After P1-C Phase 2 pooling, Nīti rows constitute approximately 60% of the clarity principle pool (~72 of ~121 rows). Sankhya and Yoga-Sūtras — also designated as dominant traditions in clarity — represent a smaller share.

**Risk:** A clarity session may disproportionately serve Nīti-flavored content (pragmatic relational wisdom), making clarity feel like a strategy/tactics room rather than a viveka/discrimination room. This is especially pronounced in `work_career` and `relationships` life_context states where Nīti has the most rows.

**Binary framing:**
- **Option A — ACCEPT current state and prioritize Sankhya/YS balancing in Wave 3:** The 14 P1-C Nīti rows are correctly assigned; the dominance is a pool-size artifact, not a routing error. Accept Phase 2 pooling as-is. Commit to Wave 3 pooling 20+ Sankhya rows and 15+ YS rows to bring Nīti below 45%.
- **Option B — DEFER 7 of the 14 P1-C Nīti rows to Wave 3:** Hold the 7 most Nīti-flavored rows (the ones that most strongly read as tactical rather than viveka) until Sankhya/YS rows balance the pool. Proceed with only 7 of the 14 rows now.

**Recommendation:** Option A. The rows are correctly assigned. The dominance is not a register problem — Nīti belongs in clarity. The feeling risk is real but manageable at pool-display level with rotation diversity. Balancing Sankhya/YS is the Wave 3 P2 action, not a reason to defer correctly-assigned rows.

---

### F-2: D-01 through D-08 confirmation gate (binary decision required)

**Finding:** P1-C identifies 8 joy/acceptance-register sankalps that may be incorrectly included in the `room_growth/sankalp/rotation_refs` pool (migration 0132). If they are present, the growth room is currently serving register-wrong chips to all growth users.

**Binary framing:**
- **Option A — AUDIT 0132 migration NOW and treat as prod-blocking if confirmed present:** Pull the 0132 migration file, read `room_growth/sankalp/rotation_refs` literal value, confirm whether `sankalp.choose_santosha`, `sankalp.give_grace`, `sankalp.invite_abundance_gently`, `sankalp.joyful_presence`, `sankalp.live_in_gratitude`, `sankalp.open_to_divine`, `sankalp.see_goodness`, `sankalp.welcome_abundance` appear. If any do, add removal to prod-blocking migration list.
- **Option B — Defer to post-prod audit:** Accept the risk that some growth sankalp chips may be register-wrong until post-prod.

**Recommendation:** Option A — must-do. The 8 rows are unambiguously wrong register for growth. If confirmed present, they are a live product defect for any user whose room engine serves them. This is a 10-minute audit (read one migration file) with potentially high impact. Do not defer.

---

### F-3: G-3 dual-tag boundary (binary decision required)

**Finding:** P1-B row G-3 (`bhakti_gaudia_love_that_aches_is_already_meeting`) is dual-tagged as `room_fit: [connection, joy]`. P1-B provides strong doctrinal grounding (Gauḍīya viraha-ānanda teaching in Caitanya-caritāmṛta). This is the only dual-tagged row among all 23 P1 additions.

**Risk:** Establishing the precedent of dual-tagged content classes may attract requests to dual-tag other rows that don't have equivalent doctrinal grounding (e.g., "this mantra serves both connection and joy").

**Binary framing:**
- **Option A — ACCEPT G-3 dual-tag as a doctrine-grounded unique exception, with explicit rule that no other row may be dual-tagged without comparable doctrinal citation:** Document in ROOM_SYSTEM_STRATEGY_V1.md §5 as: "Dual room_fit tagging requires documented doctrinal basis showing the tradition itself collapses the distinction (e.g., Gauḍīya viraha-ānanda). Curator cannot dual-tag without founder+doctrine-citation sign-off."
- **Option B — REJECT dual-tag, assign G-3 to connection only:** The longing-register is primary in the viraha teaching. Joy can be served by separate ānanda rows. Simpler, cleaner pool boundaries.

**Recommendation:** Option A. The doctrinal basis is genuinely unique and strong. The viraha-ānanda collapse is not an edge case in Gauḍīya theology — it is the central teaching. But the rule-hardening is essential: this should be the only dual-tagged row, explicitly named as the exception.

---

### F-4: S-2 Mirabai intensity=high curator exclusion (binary decision required)

**Finding:** P1-B notes that row S-2 (`bhakti_sant_mira_i_have_chosen_the_path_that_cannot_be_taken_back`, intensity=high) should consider `exclude_from_contexts: [grief_acute]` because the irreversible-surrender register could be harmful to users in acute grief states who come to connection for comfort.

**Binary framing:**
- **Option A — ADD explicit context-exclusion tag for grief_acute emotional states before this row enters production:** The "I have left everything behind, there is no return" register is powerful bhakti teaching but genuinely risky for a user experiencing active grief or loss who needs holding, not irreversibility-affirmation.
- **Option B — ACCEPT intensity=high and trust the room-selection layer to filter correctly:** The connection room already uses emotional state matching; a grief_acute user may not reach this row via rotation.

**Recommendation:** Option A. Intensity=high rows in bhakti-surrender register carry real pastoral risk. The curator-exclusion tag costs nothing to add and prevents a scenario where the engine serves a grief-loss user an "I've left everything behind and there's no going back" message.

---

### F-5: Pool format migration (P1-A) — pre-apply smoke requirement

**Finding:** Migration 0144 (pool format: bare strings → dicts with life_context_bias) is the enabling dependency for Rule 5. It must be applied on dev before the 18 growth bias tags and 9 connection rows are live-functional. However, the migration changes all pool entries system-wide.

**Binary framing:**
- **Option A — Apply 0144 on dev immediately after D-01–D-08 confirmation (F-2 above), smoke test the 12/12 room render, then proceed to prod:** The 12/12 smoke test is the gate. If any room breaks under the dict-format migration, catch it on dev, not prod.
- **Option B — Apply 0144 to prod directly once written:** Skip the dev smoke round.

**Recommendation:** Option A — non-negotiable. A pool format migration that changes every rotation_refs entry system-wide must be dev-smoked at 12/12 before prod. This is a standing rule from the MITRA_WAVE2_APPLY_MODE protocol.

---

## Summary Verdict

| Area | Status | Action required |
|---|---|---|
| Connection tradition compliance (P1-C + P1-B) | CLEAN | None — all rows use permitted traditions |
| Connection register integrity | INTACT — 3 rows need curator notes | Add exclude_if_room_is notes for 3 rows; do not edit content |
| Nīti Phase 2 assignments (14 rows → clarity) | ALL CONFIRMED | Pool all 14 — no disputes |
| Growth bias tags (18 rows) | ALL CONFIRMED | Tag all 18 — one documentation flag |
| Override Ledger (15 decisions) | ALL AGREED | D-01–D-08 removal depends on F-2 audit; D-15 requires prod-verify |
| Cross-room contamination (pre-existing 3 rows) | RESOLVED by 0133 | Verify on dev DB |
| Nīti dominance in clarity | FLAG (F-1) | Founder: accept + Wave 3 balancing? |
| D-01–D-08 growth sankalp audit | URGENT (F-2) | Audit 0132 migration NOW |
| G-3 dual-tag boundary | DECISION NEEDED (F-3) | Accept as unique exception with rule-hardening? |
| S-2 Mirabai exclusion tag | LOW RISK (F-4) | Add grief_acute exclusion before prod |
| P1-A smoke gate | PROCESS (F-5) | Dev smoke 12/12 required before prod |
