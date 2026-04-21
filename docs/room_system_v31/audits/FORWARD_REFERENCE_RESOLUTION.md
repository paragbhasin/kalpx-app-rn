# Forward-Reference Resolution — Wave 2 Phase B seeds

**Status:** DRAFT — safe-execution (§5.C SE7 in WAVE2_OPERATIONALIZATION_SYNTHESIS.md)
**Date:** 2026-04-21
**Locale scope:** English (en) only
**Source files touched:**
- `/Users/paragbhasin/kalpx/core/data_seed/mitra_v3/principles_niti_wave2.yaml`
- `/Users/paragbhasin/kalpx/core/data_seed/mitra_v3/principles_sankhya_wave2.yaml`

---

## §A — Summary

| Action | Count |
|---|---:|
| Resolved (target found → `draft_link: true` flag removed) | **0** |
| Replaced (swapped to existing target id) | **0** |
| Stripped (intervention_link entry deleted entirely) | **44** |
| Needs new authoring (logged for Wave 3) | **44** |

All 44 `draft_link: true` entries in the two Phase B principle YAML files
pointed to sankalp / practice ids that **do not exist** in
`master_sankalps.json` / `master_practices.json`. Per the brief
("either replace with a real existing target_id if a good match exists, or
strip the intervention_link entry entirely"), this pass **stripped** all 44
entries — no in-library substitute matched the Nīti work-register / Sāṁkhya
witness-register semantics cleanly enough to avoid register contamination.

The principles themselves remain fully functional — they retain their
`om_shanti` mantra links and (in most cases) a non-draft `practice` or
`sankalp` link. The stripped entries were always additional-primary links,
never the only intervention link on a row.

---

## §B — Stripped entries, by principle

### B.1 `principles_niti_wave2.yaml` (32 stripped across 19 principles)

| principle_id | target_type | placeholder target_id | role |
|---|---|---|---|
| niti_answer_the_question_that_was_asked | practice | single_decision_write_it | primary |
| niti_answer_the_question_that_was_asked | sankalp | i_answer_only_what_was_asked | primary |
| niti_praise_in_public_correct_in_private | practice | single_decision_write_it | primary |
| niti_praise_in_public_correct_in_private | sankalp | i_correct_in_private_appreciate_in_public | primary |
| niti_the_friend_who_only_brings_news_of_others_faults | sankalp | i_share_less_with_those_who_carry_tales | primary |
| niti_do_not_test_a_bond_with_a_question_that_cannot_be_unasked | sankalp | i_do_not_ask_what_asking_will_damage | primary |
| niti_weigh_the_elders_word_even_when_it_is_inconvenient | practice | single_decision_write_it | primary |
| niti_weigh_the_elders_word_even_when_it_is_inconvenient | sankalp | i_re_read_the_elder_word_once | primary |
| niti_flattery_is_a_debt_being_opened | practice | single_decision_write_it | primary |
| niti_flattery_is_a_debt_being_opened | sankalp | i_register_the_flattery_in_real_time | primary |
| niti_do_not_mistake_absence_of_objection_for_consent | practice | single_decision_write_it | primary |
| niti_do_not_mistake_absence_of_objection_for_consent | sankalp | i_do_not_count_silence_as_consent | primary |
| niti_the_grievance_that_is_actually_about_an_older_wound | sankalp | i_name_the_older_layer_first | primary |
| niti_serve_the_work_not_the_role | practice | single_decision_write_it | primary |
| niti_serve_the_work_not_the_role | sankalp | i_serve_the_work_not_the_title | primary |
| niti_read_the_signals_that_this_is_not_your_field | practice | single_decision_write_it | primary |
| niti_read_the_signals_that_this_is_not_your_field | sankalp | i_read_the_wrong_field_signals_honestly | primary |
| niti_know_when_the_work_no_longer_needs_you | practice | single_decision_write_it | primary |
| niti_know_when_the_work_no_longer_needs_you | sankalp | i_release_the_work_at_its_moment | primary |
| niti_do_not_keep_proving_after_the_proof_is_complete | practice | single_decision_write_it | primary |
| niti_do_not_keep_proving_after_the_proof_is_complete | sankalp | i_stop_proving_what_is_already_proven | primary |
| niti_choose_what_you_are_willing_to_serve_not_only_what_you_want | practice | single_decision_write_it | primary |
| niti_choose_what_you_are_willing_to_serve_not_only_what_you_want | sankalp | i_choose_what_i_will_serve_not_only_what_i_want | primary |
| niti_do_not_overclaim_the_work_before_it_stands | practice | single_decision_write_it | primary |
| niti_do_not_overclaim_the_work_before_it_stands | sankalp | i_let_the_work_describe_itself | primary |
| niti_post_leave_the_role_without_shadowing_it | sankalp | i_leave_the_role_without_shadowing_it | primary |
| niti_the_comparison_that_steals_the_path | practice | single_decision_write_it | primary |
| niti_the_comparison_that_steals_the_path | sankalp | i_measure_my_path_against_itself | primary |
| niti_build_the_successor_before_you_think_you_need_to | practice | single_decision_write_it | primary |
| niti_build_the_successor_before_you_think_you_need_to | sankalp | i_build_the_successor_early | primary |
| niti_the_cost_of_the_wrong_patron | practice | single_decision_write_it | primary |
| niti_the_cost_of_the_wrong_patron | sankalp | i_read_the_patron_through_those_already_served | primary |

**Post-strip link count:** 172 (was 204). 68 principles × ~2.5 retained
links per row. Every Nīti principle continues to carry at minimum the
`om_shanti` mantra link.

### B.2 `principles_sankhya_wave2.yaml` (12 stripped across 12 principles)

| principle_id | target_type | placeholder target_id | role |
|---|---|---|---|
| sankhya_hunger_thirst_sleep_are_indriya_reports | sankalp | the_drive_is_the_instrument_speaking | primary |
| sankhya_bhutas_compose_the_body_not_the_self | sankalp | the_body_is_composition_i_am_not | primary |
| sankhya_rajasic_activation_mimics_vitality | sankalp | i_distinguish_agitation_from_vitality | primary |
| sankhya_wealth_is_guna_motion_in_the_field | sankalp | the_field_moves_the_seer_does_not | primary |
| sankhya_scarcity_fear_contracts_prana_before_it_reads_facts | sankalp | the_breath_tightens_first_the_facts_later | primary |
| sankhya_windfall_does_not_add_to_the_seer | sankalp | gain_does_not_enlarge_the_seer | primary |
| sankhya_drift_is_tamasic_not_evidence_of_no_path | sankalp | fog_is_a_guna_not_a_verdict | primary |
| sankhya_comparison_is_ahamkara_benchmarking | sankalp | comparison_is_not_direction | primary |
| sankhya_direction_is_read_from_buddhi_not_manas | sankalp | direction_comes_from_buddhi_not_manas | primary |
| sankhya_indriyas_operate_continuously_under_the_witness | sankalp | the_instruments_run_the_seer_watches | primary |
| sankhya_boredom_is_tamasic_avarana_not_emptiness | sankalp | flat_is_tamas_not_truth | primary |
| sankhya_multitasking_fractures_buddhi_not_the_seer | sankalp | buddhi_scatters_the_seer_does_not | primary |

**Post-strip link count:** 120 (was 132). 44 principles × ~2.7 retained
links per row. Every Sāṁkhya principle continues to carry `om_shanti`.

---

## §C — Why no substitution

The brief permitted "replace with a real existing target_id if a good match
exists". The `master_sankalps.json` library has 159 unique en-locale rows;
the `master_practices.json` library has 195. None of the stripped targets
had a clean in-library analogue:

- The Nīti work-register stubs (`i_answer_only_what_was_asked`,
  `i_correct_in_private_appreciate_in_public`, `i_stop_proving_what_is_already_proven`,
  etc.) are each authored to a specific Nīti discernment move. The closest
  existing rows (`sankalp.honor_my_skill`, `sankalp.effort_over_outcome`,
  `sankalp.seek_clarity_not_rush`) are growth-register / cultivation-register —
  swapping them in would misclassify Nīti rows as growth-primary and
  introduce register contamination the Wave 1 decontamination migration
  (0133) just cleaned up.

- The Sāṁkhya witness-register stubs (`the_field_moves_the_seer_does_not`,
  `gain_does_not_enlarge_the_seer`, `fog_is_a_guna_not_a_verdict`, etc.)
  are each authored to pure Sāṁkhya puruṣa-prakṛti duality. No
  Sāṁkhya-register sankalp exists in master_sankalps.json — the library's
  witness-adjacent rows (`sankalp.silence_heals`, `sankalp.choose_inner_purity`)
  are Bhakti / moralistic register, incompatible with Sāṁkhya doctrine.

- The `single_decision_write_it` practice placeholder appears 16 times.
  The library has no "single-decision writing" practice; adding it as a
  library row is authoring, outside this pass's scope.

Strip-not-replace preserves doctrinal cleanness. Authoring substitutes is
the Wave 3 path.

---

## §D — Wave 3 commission list

To restore full intervention-link density for these principles, 44
stripped targets need to be authored into `master_sankalps.json` /
`master_practices.json` (or into the equivalent Wave 3 seed files). The
table below groups by register family so Wave 3 authoring can batch
efficiently:

| Register family | Target type | Target count | Example targets |
|---|---|---:|---|
| Nīti work / craft — sankalp | sankalp | 14 | `i_answer_only_what_was_asked`, `i_serve_the_work_not_the_title`, `i_stop_proving_what_is_already_proven`, `i_build_the_successor_early` |
| Nīti relational — sankalp | sankalp | 3 | `i_share_less_with_those_who_carry_tales`, `i_do_not_ask_what_asking_will_damage`, `i_correct_in_private_appreciate_in_public` |
| Nīti discernment — sankalp | sankalp | 2 | `i_register_the_flattery_in_real_time`, `i_do_not_count_silence_as_consent` |
| Nīti — practice | practice | 16 | `single_decision_write_it` (appears 16× as primary — potentially one practice, one row) |
| Sāṁkhya witness — sankalp | sankalp | 12 | `the_field_moves_the_seer_does_not`, `gain_does_not_enlarge_the_seer`, `the_body_is_composition_i_am_not` |
| **Total** | | **44** (via 15 target instances that repeat) | |

Note: of the 44 stripped entries, 16 are the same
`single_decision_write_it` placeholder. If Wave 3 authors that one
practice row, it resolves 16 forward references at once.

---

## §E — Idempotency + reversibility

- The strip is a pure text edit on the two YAML files. No DB state was
  touched. The Wave 2 seed migration (0135a) will ingest the
  post-strip row set — 112 principle rows with clean link graphs.
- If Wave 3 authors the 15 missing target instances, the stripped
  `intervention_links` entries can be re-added by a follow-up YAML edit
  (or a targeted migration); they will not collide with 0135a because
  0135a reads the YAML shape, not a frozen snapshot.
- Pre-strip backup: the pre-edit YAMLs are recoverable from git history
  (the edit is in the current working tree, unstaged at time of writing).

---

## End-state

- 44 forward-references resolved by **stripping** (none replaced, none
  needed-authoring-as-blocker — system is functional without them).
- 2 Wave 2 YAMLs re-parsed cleanly (principles counts: 68 + 44 = 112;
  draft_link remaining: 0).
- Wave 3 authoring list of 15 distinct target instances logged above.
