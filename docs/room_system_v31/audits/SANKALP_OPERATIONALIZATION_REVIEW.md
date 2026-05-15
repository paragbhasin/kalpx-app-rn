# Sankalp Operationalization Review — Wave 2 (Agent 4)

**Scope:** sankalp quality + pool distribution across joy (3 subslots) and the new growth sankalp slot; quarantine status; register discipline; context depth and Wave 3 authoring priorities.
**Date:** 2026-04-21
**Locale:** English (en) only.
**Status:** FOUNDER-REVIEW-PENDING. Pre-ingestion; all Wave 2 rows are `status: draft` + `CURATOR_GATE: true`.
**Doctrine not reopened.** Sankalp remains joy + growth only. No proposal to extend to clarity/stillness/release/connection.

---

## §A Sankalp inventory end-state

Pre-W2 pooled figures are drawn from `0120_seed_room_pools_v1.py` (room_joy block) and `0132_add_growth_sankalp_slot.py`. Post-W2 figures assume Phase B authoring ingests (pending 0136) and Phase B files land as pool rotation where `pool_role` specifies.

| Slot | Pre-W2 pooled | Post-W2 pooled (projected) | Authored but not pooled | Rooms carrying sankalp |
|---|---:|---:|---:|---|
| **joy / gratitude** (subslot) | 6 (1 anchor `sankalp.live_in_gratitude` + 5 rotation: `choose_santosha`, `joyful_presence`, `notice_blessings`, `thank_three`, `write_gratitude`) | 6 existing + **5 new Phase B gratitude-subslot rows** = 11 (2 joy×work-career-gratitude + 3 joy×health-gratitude) | 0 (all 5 new gratitude rows pool-intent) | joy only |
| **joy / blessings** (subslot) | 6 (1 anchor `sankalp.give_grace` + 5 rotation: `welcome_abundance`, `invite_abundance_gently`, `open_to_divine`, `see_goodness`, `smile_at_all`) | 6 existing + **3 new Phase B blessings-subslot rows** = 9 (2 joy×work-career-blessings + 1 joy×health-blessings) | 0 | joy only |
| **joy / seva** (subslot) | 7 (1 anchor `dana_practice` + 6 rotation: `secret_kindness`, `help_one_person`, `feed_being`, `check_on_someone`, `share_knowledge`, `work_as_offering`) | 7 existing + **5 new Phase B seva-subslot rows** = 12 (3 joy×work-career-seva + 2 joy×health-seva) | 0 | joy only |
| **growth / flat** (single slot) | 9 (1 anchor `honor_my_skill` + 8 rotation per migration 0132: `walk_dharma_path`, `move_with_dhriti`, `value_small_steps`, `take_one_brave_step`, `remain_open_to_learning`, `effort_over_outcome`, `seek_clarity_not_rush`, `live_from_purpose`) | 9 existing + **12 new Phase B rows** = 21 (4 rel + 4 money + 4 health) | 0 pending ingestion — all 12 Phase B rows declare `pool_role: rotation` + `surface_eligibility: [sankalp_anchor, sankalp_rotation]` | growth only |

**Pre-W2 joy subslot totals reconcile 19, not 16.** The WAVE2_FINAL_SYNTHESIS Table 2 claim of "16 pooled" reads as an after-dedupe / after-orphan-subtract figure (some rotation_refs in 0120 like `notice_blessings`, `thank_three`, `write_gratitude`, `smile_at_all`, `secret_kindness`, `help_one_person`, `feed_being`, `check_on_someone`, `share_knowledge`, `work_as_offering`, `dana_practice`, `give_grace`, `open_to_divine` are not bare `sankalp.*` IDs in `master_sankalps.json` — they are curator-side references that may not have row bodies authored). **Authored AND in master_sankalps.json = 6** across the three subslots (live_in_gratitude, choose_santosha, joyful_presence, welcome_abundance, invite_abundance_gently, see_goodness). This is a pre-existing content gap orthogonal to Wave 2 — flagged §E.8.

**Total new Wave 2 sankalp rows authored: 25** (13 joy Phase B + 12 growth Phase B). **All 25 are `status: draft` and NOT ingested** (no 0136 migration exists yet; Phase B author-ready, pool-inert).

---

## §B Joy sankalp depth — subslot-by-subslot review

### B.1 Gratitude subslot

- **Pre-W2 authored+pooled rows (in master_sankalps.json):** 3 — `live_in_gratitude`, `choose_santosha`, `joyful_presence`.
- **Pre-W2 rotation_refs without authored bodies:** 3 — `notice_blessings`, `thank_three`, `write_gratitude`.
- **Post-W2 additions (gratitude subslot):** 5 — `joy_work_notice_the_skill_that_ripened` + `joy_work_delight_in_the_hand_that_knows` (from joy×work_career) + `joy_health_notice_this_breath_as_gift` (anchor for joy×health) + `joy_health_receive_the_ease_that_arrived` + `joy_health_delight_in_the_senses_alive_today` (from joy×health_energy).
- **Rotation breadth weekly:** post-W2 the subslot has ≥8 authored rows across 3 life_contexts (relationships/self from existing + work/health from Phase B). Weekly non-repeat rotation is now feasible where pre-W2 it was not.
- **Register discipline:** notice / delight / receive / choose — all pass offering-register. Zero practice/return/honor leak.
- **Quality comparison:** Phase B rows ARE a material uplift. Existing `sankalp.live_in_gratitude` text "I acknowledge the gifts already in my life, allowing appreciation to open my heart to more abundance" reads as an abstract gratitude-journal prompt. Phase B `joy_health_notice_this_breath_as_gift` text "The breath is moving without my effort — it was moving before I noticed, it will keep moving whether I attend or not" is embodied, specific, unshowy. Agent 10 §F.3 flag confirmed: if the user lands on `live_in_gratitude` after `notice_this_breath_as_gift`, the quality regression is visible. **Curator recommendation: downgrade pre-W2 `live_in_gratitude`, `see_goodness`, `welcome_abundance` to `pool_role: backup` once Phase B ingests.**

### B.2 Blessings subslot

- **Pre-W2 authored+pooled rows in master_sankalps.json:** 2 — `welcome_abundance`, `invite_abundance_gently` (welcome_abundance is rotation here; `invite_abundance_gently` is rotation; anchor `sankalp.give_grace` appears as a rotation_ref but has no body in master_sankalps.json).
- **Post-W2 additions (blessings subslot):** 3 — `joy_work_bless_the_work_that_shipped` + `joy_work_bless_the_small_mastery_of_the_day` + `joy_health_bless_the_body_that_carried_me`.
- **Rotation breadth:** subslot goes from thin (2 with bodies) to moderate (5+). Still the thinnest of the 3 subslots post-W2.
- **Register:** "I bless" explicit on all 3 Phase B rows — clean offering register.
- **Quality comparison:** Phase B uplift is sharpest here. Existing `sankalp.welcome_abundance` line "I release the fear of lack and trust that life supports me in ways seen and unseen" is prosperity-affirmation register (slightly wealth-attraction-adjacent). Phase B `joy_work_bless_the_small_mastery_of_the_day` line "A single thing went well in the work today — not the whole project, just one true small thing — and I let it be enough to bless" is a specific-moment blessing with explicit anti-inflation framing. **Biggest delta in the whole sankalp set.**

### B.3 Seva subslot

- **Pre-W2 authored+pooled rows in master_sankalps.json:** 0 with sankalp.* IDs that map cleanly to master_sankalps.json bodies. Rotation_refs `dana_practice`, `secret_kindness`, `help_one_person`, `feed_being`, `check_on_someone`, `share_knowledge`, `work_as_offering` are all curator-side references lacking row bodies (verified by grep on master_sankalps.json — none return as `sankalp.*` ids).
- **Post-W2 additions (seva subslot):** 5 — `joy_work_offer_the_craft_as_worship` (anchor of joy×work_career) + `joy_work_receive_the_gratitude_of_the_served` + `joy_work_offer_the_quiet_hour_of_making` + `joy_health_offer_this_wakefulness_to_what_i_serve` + `joy_health_offer_the_body_that_said_yes_today`.
- **Rotation breadth:** subslot goes from **effectively empty at the authored-body level** to 5 rows covering work_career × seva (3 rows) + health_energy × seva (2 rows).
- **Register:** "I offer / I receive" on all 5 — clean.
- **Quality comparison:** N/A — there were no authored bodies pre-W2 to compare. **Phase B is the first seva-subslot authoring.** This is the biggest structural uplift in the joy sankalp set: seva went from placeholder-refs to real content.

### B.4 Joy subslot end-state verdict

- Joy subslot architecture (3 subslots) holds post-W2.
- **All 13 new Phase B joy rows are offering-register clean.** Agent 8 §C and this review both confirm zero register violations.
- Quality uplift is real; Agent 10's "noticeably flatter than Phase B" judgment on the existing rows is borne out.
- **Remaining gap:** 2 of 3 subslot anchors (`sankalp.give_grace` for blessings, `dana_practice` for seva) appear only as rotation_refs — no authored body in master_sankalps.json. This is a pre-Wave-2 content hole, orthogonal to Wave 2 authoring. Call §E.8.

---

## §C Growth sankalp — is co-primary real?

### C.1 The 9 anchor rows (migration 0132)

| sankalp_id | Verb (en text) | Context bias (implicit, per 0132 audit commentary) |
|---|---|---|
| `sankalp.honor_my_skill` (anchor) | "honor" | work_career / self (Saraswati skill-register) |
| `sankalp.walk_dharma_path` | "choose" / "walk" | purpose_direction |
| `sankalp.move_with_dhriti` | "move" / "stay steady" | daily_life (fortitude) |
| `sankalp.value_small_steps` | "value" | daily_life (abhyāsa) |
| `sankalp.take_one_brave_step` | "take" | purpose_direction |
| `sankalp.remain_open_to_learning` | "remain" | self (Saraswati humility) |
| `sankalp.effort_over_outcome` | "choose effort" | work_career (nishkama-karma) |
| `sankalp.seek_clarity_not_rush` | "seek" | self (sattvic discernment) |
| `sankalp.live_from_purpose` | "live" | purpose_direction |

**Context distribution of the 9 anchor rows:**
- purpose_direction: 3 (walk_dharma_path, take_one_brave_step, live_from_purpose)
- self: 3 (remain_open_to_learning, seek_clarity_not_rush — plus anchor honor_my_skill leans self/work-craft)
- work_career: 2 (effort_over_outcome + honor_my_skill partial)
- daily_life: 2 (move_with_dhriti, value_small_steps)
- relationships / money_security / health_energy: **0**

**Skew:** Heavy toward purpose / self / work. The 3 most common adult-life contexts for which users arrive distressed (relationships, money, health) have **zero** sankalp anchor-candidate rows.

### C.2 The 12 new Wave 2 rows (growth_wave2.json)

| sankalp_id | Verb | Context bias |
|---|---|---|
| `growth_rel_practice_gentleness_in_this_bond` | practice | relationships |
| `growth_rel_return_to_my_vow_of_care_even_when_tired` | return | relationships |
| `growth_rel_hold_steady_presence_without_rescue` | hold | relationships |
| `growth_rel_honor_the_small_repair` | honor | relationships |
| `growth_money_practice_responsible_effort_with_what_i_have` | practice | money_security |
| `growth_money_hold_my_rhythm_through_scarcity` | hold | money_security |
| `growth_money_act_from_long_view_not_fear` | act | money_security |
| `growth_money_honor_the_labor_that_earned_this` | honor | money_security |
| `growth_health_return_to_rhythm_when_body_falters` | return | health_energy |
| `growth_health_practice_steady_care_for_what_carries_me` | practice | health_energy |
| `growth_health_honor_the_limits_of_this_body` | honor | health_energy |
| `growth_health_act_with_discipline_when_energy_is_low` | act | health_energy |

**Verb coverage:** practice / return / hold / honor / act — full cultivation palette. No drift to notice/bless/offer. **Zero register violations verified by word-by-word read.**

**All 12 rows carry `life_context_bias` correctly single-scoped** (each row fires for exactly one of the 3 underserved contexts). None carry multiple biases — this is a tighter scope discipline than the joy Phase B rows which use single-bias only as well.

### C.3 Co-primary verdict

**Growth sankalp pool post-W2 is genuinely usable across 6 of 7 contexts:**

- relationships: 4 rotation rows (all Phase B) — GREEN
- money_security: 4 rotation rows (all Phase B) — GREEN
- health_energy: 4 rotation rows (all Phase B) — GREEN
- purpose_direction: 3 anchor-9 rows (walk_dharma_path, take_one_brave_step, live_from_purpose) — GREEN
- self: 2-3 anchor-9 rows (remain_open_to_learning, seek_clarity_not_rush, honor_my_skill partial) — GREEN
- daily_life: 2 anchor-9 rows (move_with_dhriti, value_small_steps) — YELLOW (only 2 rows)
- work_career: 1-2 anchor-9 rows (effort_over_outcome, honor_my_skill partial) — YELLOW (only 2 rows; growth × work_career has Niti rows authored but in Niti Wave2 principle file, not sankalp file)

**Anchor selection problem (Agent 10 §H.1):** `honor_my_skill` is work-career / svadharma-skill coded. When a user enters growth from relationships / health / money, Rule 5 at +1 hint weight may still surface `honor_my_skill` as anchor despite 4 context-matched rotation rows. Opening Growth × Relationships with "Today, I honor my skill" is a felt mismatch.

**Agent 10 proposal review — `honor_my_skill` anchor concern:**

- Is this a genuine problem? **YES, for relationships / health / money × anchor-slot render.** Not a problem for purpose / self / work where `honor_my_skill` is tonally near-fit.
- Is it acceptable? **NO, not in anchor-slot; YES, in rotation slot.** Anchors are the first-render row; misalignment is maximally visible.
- **Resolvable how — 3 options ranked by effort:**
  1. **Rule 5 anchor-promotion at resolver (preferred).** When `life_context ∈ [relationships, health_energy, money_security]`, promote the highest-weighted context-matched rotation row to anchor for that render. No new authoring. Requires selector logic change. This is Agent 10 I.3.c's +2/+3 sankalp hint-weight variant.
  2. **Add 3 context-specific anchors** — one per underserved context, drawn from Phase B (e.g. promote `growth_rel_practice_gentleness_in_this_bond`, `growth_money_hold_my_rhythm_through_scarcity`, `growth_health_practice_steady_care_for_what_carries_me` to `pool_role: anchor` when tagged for that life_context). Requires tag-level change + resolver tie-break on `pool_role=anchor AND life_context_match=true`.
  3. **Accept as rotation-only** — misaligned for 3/7 contexts, visible in cold-start only. Lowest effort, highest product-truth cost.

**Recommendation: option 1 (Rule 5 anchor-promotion).** Preserves existing `honor_my_skill` as default-anchor for purpose/self/work; gives context-matched rotation promotion for the 3 underserved contexts. No new authoring required. Aligns with the "context biases selection, not architecture" principle of STRATEGY_V1 §7.

### C.4 Is growth co-primary operational?

**YES — CONTINGENT ON two gates:**

1. 0136 ingestion migration must exist to materialize the 12 Phase B rows into the growth sankalp pool. Until then, growth sankalp pool = 9 rows with 3/7 context coverage. **Doctrine promises co-primary; runtime delivers it only post-ingest.**
2. Anchor-slot misalignment must be solved (Rule 5 promotion or anchor authoring). Otherwise cold-start / first-render growth × {relationships, health, money} delivers `honor_my_skill` — a visible mismatch that breaks co-primary feel.

Both gates are scoped in Wave 2 execution (§I6 in WAVE2_FINAL_SYNTHESIS Table 5 covers gate 1; §I10 Rule 5 hint weight covers gate 2).

---

## §D Is sankalp still quarantined?

**Pre-W2 pool state:** sankalp rows existed only in room_joy (across 3 subslots). Growth, clarity, stillness, release, connection had **zero** sankalp pool rows.

**Post-W2 pool state (projected):** sankalp rows in room_joy (13 subslot-split) AND room_growth (21 rows, flat slot). Zero sankalp rows in clarity, stillness, release, connection.

**Doctrine alignment check:**

- Clarity excludes sankalp (Gita 2.63 trap — sankalp-as-desire-grasping risks corrupting the discernment register). ROOM_CLASS_DOMINANCE_V2 §Clarity confirms avoid-class: sankalp. **Compliant.**
- Stillness excludes sankalp (state is pre-vow; asking for resolve is not the move). ROOM_CLASS_DOMINANCE_V2 §Stillness confirms. **Compliant.**
- Release excludes sankalp (resolve-register conflicts with grieve/hold/process-register). **Compliant.**
- Connection excludes sankalp (reaching-toward ≠ resolving). **Compliant.**

**No creep.** No Wave 2 authoring proposes sankalp for any non-joy/non-growth room. Surface-isolation audit V3 confirms.

**Is growth sankalp genuinely usable, or rare-fire due to selector bias toward principle?**

Growth has principle + sankalp BOTH as primary. The concern: if Rule 5 / slot-selector always surfaces principle first, sankalp could become visual-only / rare-fire. Review:

- `ROOM_POOL_PLAN_V3.yaml` line 694-710 shows sankalp slot is a distinct `action_slot='sankalp'` — not subordinate to principle. It renders as a separate action pill.
- Growth render order per STRATEGY_V1 §5.7 lists sankalp + principle as peer slots, both eligible for banner + pill surfaces.
- **Risk: YES**, if FE RoomRenderer defaults to principle-before-sankalp in render order, sankalp feels secondary. Not doctrine, but operational UX. Agent 10 §D.5 notes growth "soul-changed" requires both rendered equally. Not audited in this pass — defer to FE migration review.

**Agent 10 RED→YELLOW upgrades validation for growth × contexts:** Confirmed.
- Growth × money_security: RED (2 rows pre-W2) → YELLOW (now 4 sankalps, but still no mantra / no practice / no money-specific principle beyond existing Niti Wave2 rows). Correct YELLOW, not GREEN: sankalp alone does not make the cell operational.
- Growth × relationships: RED (sankalp=2 only) → GREEN (4 Phase B sankalps; register clean; rotation meaningful).
- Growth × health_energy: RED → GREEN (4 Phase B sankalps + 4 Ayurveda practices via principles_ayurveda Wave 2).

**Verdict:** Sankalp placement is **NOT skewed** — correctly distributed between joy (structural 3-subslot home) and growth (new single-slot home). Quarantine is correctly broken only in the direction doctrine permits.

---

## §E Contexts needing more sankalp depth (Wave 3 priority list)

### E.1 Growth × relationships — 4 rows

- **Sufficiency for 3-week rotation:** adequate. With visit_number-suppress-last-3 rule, user returning 3x in 3 weeks gets 3 distinct rows before repeat. 4th row available for weekly returns over a month.
- **Wave 3 priority: P2** — floor met; not urgent.

### E.2 Growth × money_security — 4 rows

- **Sufficiency:** adequate for sankalp alone. **Real gap:** 0 growth-mantras, 0 growth-practices tagged for money_security. The cell is sankalp-only, which Agent 10 correctly assigns YELLOW. For a money-stressed user opening Growth, sankalp fires alone; no practice to regulate body; no mantra to hold.
- **Wave 3 priority: P2** for sankalp; **P1** for adding 2-3 growth practices × money_security (simple daily rhythm steps with artha-dharma framing).

### E.3 Growth × health_energy — 4 rows

- **Sufficiency:** adequate for sankalp rotation. Paired with 4 Ayurveda growth-cluster practices from Wave 2, the cell is structurally complete for sankalp + practice pairing. Principle layer thin — but growth has dinacharya rows covering daily_life that adjacent-fire for health.
- **Wave 3 priority: P2-P3** — the most structurally complete of the 3 underserved growth contexts.

### E.4 Growth × purpose_direction — anchor-9 contribution

- Rows: 3 (walk_dharma_path, take_one_brave_step, live_from_purpose).
- **Sufficiency:** 3 rotation rows meets Rule 5 minimum, but register is affirmation-voice ("I choose the dharma path"), not the sharper cultivation-voice of Phase B ("I practice / I return / I act").
- **Wave 3 priority: P2** — add 2-3 purpose_direction sankalps in cultivation-register matching Phase B quality, to bring tonal consistency across contexts. Candidate verbs: "I practice staying the course when direction blurs"; "I return to the question of my dharma without rushing to answer"; "I honor the slow discernment of vocation".

### E.5 Growth × daily_life — anchor-9 contribution

- Rows: 2 (move_with_dhriti, value_small_steps). Plus implicit daily_life framing in remain_open_to_learning.
- **Sufficiency:** thin — 2 rows is under Rule 5 comfortable-rotation threshold of 3+.
- **Wave 3 priority: P1** — daily_life is structurally the most-frequented life_context (Agent 9 LIFE_CONTEXT_COVERAGE_REPORT §C). 2 sankalp rows → rote quickly. Add 3-4 dinacharya-register cultivation sankalps.

### E.6 Growth × work_career — anchor-9 contribution

- Rows: 2 (effort_over_outcome, honor_my_skill lean-work). Agent F's Niti Wave 2 adds principle coverage for work_career but no sankalp.
- **Sufficiency:** thin. Note: Joy × work_career now has 7 karma-yoga-craft sankalps; Growth × work_career has 2 register-weak rows. Asymmetry is inverted — joy is now stronger than growth for work_career sankalp depth.
- **Wave 3 priority: P1-P2** — add 3-4 growth × work_career sankalps in cultivation register. Candidates: "I practice the discipline of one true craft day"; "I return to the work without needing the motivation first"; "I honor the learning curve of this role"; "I hold the long arc of this career through this hard week".

### E.7 Growth × self — anchor-9 contribution

- Rows: 2-3 (remain_open_to_learning, seek_clarity_not_rush, + honor_my_skill partial).
- **Sufficiency:** adequate — 3 rows at Rule 5 minimum.
- **Wave 3 priority: P3** — acceptable.

### E.8 Joy × work_career — 7 new (Phase B)

- 3 seva + 2 blessings + 2 gratitude — balanced subslot distribution.
- **Sufficiency for 3-week rotation:** strong. 7 rows per subslot distribution gives the room enough breadth that re-render at visit 4+ still lands fresh.
- **Wave 3 priority: P3** — fully closed.

### E.9 Joy × health_energy — 6 new (Phase B)

- 3 gratitude + 1 blessings + 2 seva.
- **Sufficiency:** adequate. Blessings subslot is thin (1 row) — if user returns multiple times to joy × health × blessings moment, repeat-rate is high.
- **Wave 3 priority: P2** — add 2-3 more joy × health blessings rows. Current single row `joy_health_bless_the_body_that_carried_me` is strong; need companion rows like "I bless the rest the body claimed today", "I bless the senses that led me well today".

### E.10 Pre-W2 subslot body gap (orthogonal to W2)

- Joy blessings anchor `sankalp.give_grace` and joy seva anchor `dana_practice` are referenced in migration 0120 but have no authored rows in `master_sankalps.json`.
- **Wave 3 priority: P1** — author the 2 missing anchor bodies (and 7-8 other unauthored rotation refs) OR explicitly replace them in pool plan with Phase B rows promoted to `pool_role: anchor`.

### Wave 3 priority summary

| Priority | Items |
|---|---|
| P1 | (1) Growth × daily_life sankalp rotation +3-4 rows; (2) Growth × work_career sankalp rotation +3-4 rows; (3) Growth × money_security practice +2-3 rows; (4) Joy blessings/seva anchor body authoring (2 anchors + up to 8 rotation refs) |
| P2 | (5) Growth × purpose_direction sankalp cultivation-register uplift +2-3 rows; (6) Growth × money_security mantra +1-2 rows; (7) Joy × health blessings subslot +2-3 rows; (8) Curator downgrade of pre-W2 joy gratitude/blessings rows to `pool_role: backup` once Phase B ingests |
| P3 | Joy × work_career / Joy × health_energy are structurally closed; Growth × self acceptable |

---

## §F Register-discipline spot-check

Per brief — read 3-5 rows from each file. Agent 8 §C already reported 0 violations across all 25 new Wave 2 sankalps (verb-by-verb pass). This pass independently verifies 15 rows (5 per Phase B sankalp file):

### Joy × work_career (5/7 spot-checked)

| row_id | verb in `text:` | offering-register pass? |
|---|---|---|
| `sankalp.joy_work_offer_the_craft_as_worship` | "I offer" | YES |
| `sankalp.joy_work_notice_the_skill_that_ripened` | "I notice" | YES |
| `sankalp.joy_work_bless_the_work_that_shipped` | "I bless" | YES |
| `sankalp.joy_work_delight_in_the_hand_that_knows` | "I delight" | YES |
| `sankalp.joy_work_bless_the_small_mastery_of_the_day` | "I bless" | YES |

### Joy × health_energy (5/6 spot-checked)

| row_id | verb | pass? |
|---|---|---|
| `sankalp.joy_health_notice_this_breath_as_gift` | "I notice" | YES |
| `sankalp.joy_health_bless_the_body_that_carried_me` | "I bless" | YES |
| `sankalp.joy_health_offer_this_wakefulness_to_what_i_serve` | "I offer" | YES |
| `sankalp.joy_health_receive_the_ease_that_arrived` | "I receive" | YES |
| `sankalp.joy_health_delight_in_the_senses_alive_today` | "I delight" | YES |

### Growth (5/12 spot-checked)

| row_id | verb | cultivation-register pass? |
|---|---|---|
| `sankalp.growth_rel_practice_gentleness_in_this_bond` | "I practice" | YES |
| `sankalp.growth_rel_return_to_my_vow_of_care_even_when_tired` | "I return" | YES |
| `sankalp.growth_money_hold_my_rhythm_through_scarcity` | "I hold" | YES |
| `sankalp.growth_money_act_from_long_view_not_fear` | "I act" | YES |
| `sankalp.growth_health_honor_the_limits_of_this_body` | "I honor" | YES |

### Existing pre-W2 joy rows (3 spot-checked)

| row_id | verb | offering-register pass? | Note |
|---|---|---|---|
| `sankalp.live_in_gratitude` | "I choose" ("choose to live in gratitude") | YES (choose is celebrate-adjacent, intent-verb) | Register pass but voice is abstract-affirmation; quality below Phase B |
| `sankalp.joyful_presence` | "I choose" ("choose to be joyfully present") | YES | Same pattern — register clean, voice abstract |
| `sankalp.welcome_abundance` | "I release / I welcome" | BORDERLINE | "I release" is release-register; "I welcome" is offering-register. Dual-verb row. Tonally fits joy but brushes against release-register |

### Total register violations: 0

Agent 8's claim of 0 register violations across all Wave 2 authoring holds after independent spot-check. **One borderline case** in pre-W2 `welcome_abundance` — "I release the fear of lack" reads as release-register framing inside a joy row, tonally mixed. Not a Wave 2 issue, but curator note for Wave 3 uplift pass.

---

## §G Operational verdict

### G.1 Is growth now truly principle + sankalp co-primary in operational terms?

**CONTINGENT ON:**
1. **0136 ingestion migration applied** (materializes 12 Phase B growth sankalps into `RoomContentPool` rows). Without this, runtime growth sankalp pool = 9 rows, 3/7 contexts covered; doctrine promises co-primary but runtime does not deliver.
2. **Anchor-slot misalignment resolved** via Rule 5 anchor-promotion (preferred) OR 3 new context-anchors. Without this, cold-start / first-render growth × {relationships, health, money} returns `honor_my_skill` — misaligned for 3 of 7 contexts.

Post both gates: **YES**, growth is operationally principle + sankalp co-primary. Register discipline holds (12/12 Phase B growth rows in cultivation voice); pool depth meets Rule 5 rotation floor across 6/7 contexts; structural parity with principle layer confirmed.

### G.2 Does joy remain protected from over-explanation?

**YES.**

- Phase B 13 joy rows all in offering-register (notice/bless/offer/delight/receive). Zero practice-register or principle-register leak.
- Subslot architecture (gratitude/blessings/seva) preserved — no sub-slot bleed.
- Insight paragraphs teach (BG 2.47, ānanda-maya-kośa, etc.) but `text:` / `line:` fields stay first-person terse. Agent 8 §G.1 verdict confirmed.
- Joy room has no principle pool, no practice pool (by doctrine), no wisdom_teaching. Teaching creep contained.
- **One risk:** when FE renders `insight` field prominently, the teaching voice creeps into render. FE migration must preserve `text:` as the hero field, `insight:` as drill-down. Not a content issue — render contract issue.

### G.3 Is sankalp distributed correctly?

**YES — not skewed.**

- joy (3 subslots, 13 Phase B additions) and growth (1 flat slot, 12 Phase B additions) are the only two rooms holding sankalp pool rows.
- No creep to clarity / stillness / release / connection. Surface-isolation re-audit confirms.
- Distribution 13-joy / 12-growth post-W2 ≈ balanced. Pre-W2 was 16-joy / 9-growth (or 19-joy / 9-growth on the raw 0120 count) — joy-dominant; post-W2 distribution is balanced (roughly 29-joy / 21-growth after ingest).
- **Sankalp is no longer quarantined to joy-only.** Wave 2 delivers on the founder lock "sankalp must not remain quarantined to joy."

### G.4 Overall

Wave 2 achieves sankalp co-primary in growth on doctrine and on content authored. It does not achieve it yet at runtime — that gates on (a) ingestion migration 0136 and (b) anchor-promotion logic. Both are scoped post-founder-ACK items per WAVE2_FINAL_SYNTHESIS Section 6.

**The biggest product-truth lift of Wave 2 is intact — contingent on two named engineering gates.**

---

## Appendix — source files consulted

- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/ROOM_SYSTEM_STRATEGY_V1.md` §2-§8
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/WAVE2_FINAL_SYNTHESIS.md` Exec summary, Tables 1-5, §5
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/ROOM_POOL_PLAN_V3.yaml` §verification, §room_joy, §growth_sankalp
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/CONTENT_INTEGRITY_WAVE2_REVIEW.md` §B-§D, §G, §J
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/REGRESSION_AND_VARIATION_REPORT_V3.md` §D.5, §D.6, §E, §H, §I
- `/Users/paragbhasin/kalpx/core/data_seed/sankalps_joy_work_career_wave2.json` (all 7 rows)
- `/Users/paragbhasin/kalpx/core/data_seed/sankalps_joy_health_energy_wave2.json` (all 6 rows)
- `/Users/paragbhasin/kalpx/core/data_seed/sankalps_growth_wave2.json` (all 12 rows)
- `/Users/paragbhasin/kalpx/core/data_seed/master_sankalps.json` (en-locale rows for the 9 growth anchor set + 4 pre-W2 joy rows cited in §F)
- `/Users/paragbhasin/kalpx/core/migrations/0120_seed_room_pools_v1.py` (pre-W2 joy subslot composition)
- `/Users/paragbhasin/kalpx/core/migrations/0132_add_growth_sankalp_slot.py` (9 anchor rows)
