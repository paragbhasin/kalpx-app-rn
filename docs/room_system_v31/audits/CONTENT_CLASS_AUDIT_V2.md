# Content Class Audit V2

## Execution Summary

Audit Date: 2026-04-21
Scope: English locale only (en)

Seed Files:
- `/Users/paragbhasin/kalpx/core/data_seed/master_mantras.json`
- `/Users/paragbhasin/kalpx/core/data_seed/master_sankalps.json`
- `/Users/paragbhasin/kalpx/core/data_seed/master_practices.json`
- `/Users/paragbhasin/kalpx/core/data_seed/mitra_v3/principles_*.yaml` (19 files)

---

## Part A: Content Class Inventory

### A.1 Class Utilization Summary

|Class|Authored|In Pools|Orphan|Util %|
|---|---:|---:|---:|---:|
|Mantras|200|25|175|12.5%|
|Sankalps|159|8|151|5.0%|
|Practices|195|21|174|10.8%|
|Principles|303|31|272|10.2%|
|**TOTAL**|**857**|**85**|**772**|**9.9%**|

### A.2 Dark Rows (in pool but gated/deprecated)

No deprecated or gated rows found in current pool migrations (0120-0129). All active pool rows have status='active' and pool_version='2026.04.v1'.

### A.3 Field Population Rates

Note: Seed JSON files (master_*.json) do not populate v3.1 tagging fields yet. Schema fields exist in models but are empty. Principles in YAML files have core teaching fields fully populated.

Principles (from YAML):
- core_teaching: 303/303 (100%)
- plain_english: 303/303 (100%)
- rooted_explanation: 303/303 (100%)
- sources: populated

Mantras, Sankalps, Practices (from JSON):
- tradition: 0/200 (0%)
- room_fit: 0/200 (0%)
- surface_eligibility: 0/200 (0%)
- pool_role: 0/200 (0%)
- emotional_function_tag: 0/200 (0%)
- intensity: 0/200 (0%)
- action_family: 0/200 (0%)
- life_context_bias: 0/200 (0%)
- standalone_safe_flag: 0/200 (0%)
- repeat_tolerance_level: 0/200 (0%)
- misuse_risk: 0/200 (0%)

Finding: v3.1 tagging columns are present in database schema but not yet seeded. No governance data available for field-level filtering.

### A.4 Pooled Content by Class

Pooled Mantras (25 rows):
- mantra.asato_ma
- mantra.emotional_healing.vasudevaya
- mantra.ganesha_om_gam_clarity
- mantra.gayatri
- mantra.gayatri_om_tat_savitur
- mantra.hanuman_buddhi_balam
- mantra.hare_krishna
- mantra.hreem_shreem_kleem_mahalakshmi
- mantra.krishna_hare_krishna
- mantra.lakshmi_om_shri_joy
- mantra.lokah_samastah
- mantra.maha_mrityunjaya
- mantra.om_namo_bhagavate_vasudevaya
- mantra.om_shanti_om
- mantra.pavamana_asato_ma
- mantra.peace_calm.om
- mantra.purnamadah
- mantra.rudra_om_namo_bhagavate
- mantra.saraswati_om_aim_wisdom
- mantra.sarve_bhavantu
- mantra.sarve_bhavantu
- mantra.shiva_maha_mrityunjaya
- mantra.shivoham
- mantra.soham
- mantra.vedanta_om_tat_sat

Pooled Sankalps (8 rows):
- sankalp.choose_santosha
- sankalp.give_grace
- sankalp.invite_abundance_gently
- sankalp.joyful_presence
- sankalp.live_in_gratitude
- sankalp.open_to_divine
- sankalp.see_goodness
- sankalp.welcome_abundance

Pooled Practices (21 rows):
- practice.anahata_humming
- practice.anahata_meditation
- practice.belly_breathing
- practice.bhramari
- practice.centering_drishti
- practice.focus.ten_second_pause
- practice.four_four_six
- practice.grounding_palm_press
- practice.hand_on_heart
- practice.heart_breath_release
- practice.heart_softening
- practice.mantra_journaling
- practice.mindful_55_walking
- practice.one_sankalp_action
- practice.palm_soothing
- practice.sakshi_breath
- practice.self_acceptance_pause
- practice.shanti_breath_cycle
- practice.shanti_exhale_drop
- practice.shanti_trataka
- practice.trataka

Pooled Principles (31 rows):
- bhakti_amplify_gratitude (joy_expansion)
- bhakti_divine_as_constant_companion (loneliness)
- bhakti_keep_company_with_the_devotional (bhakti)
- dharma_carry_only_the_duty_that_is_yours (dharma)
- dharma_choose_the_right_over_the_easy (dharma)
- dharma_community_as_seva (loneliness)
- dharma_do_not_abandon_duty_in_fear (dharma)
- dharma_right_order_before_right_speed (dharma)
- dharma_small_clean_actions_hold_the_path (dharma)
- gita_become_instrument_not_controller (gita)
- gita_choose_clarity_over_despair (gita)
- gita_clarity_after_desire_anger (gita)
- gita_detached_action (gita)
- gita_endure_the_passing_contacts (gita)
- gita_impermanence_of_form (grief)
- gita_nishkama_karma_as_celebration (joy_expansion)
- gita_offer_action_without_ownership (gita)
- gita_see_desire_as_the_covering_force (gita)
- gita_sthitaprajna_destination (deepening)
- gita_svadharma_is_what_you_have (searching_purpose)
- niti_prefer_stability_over_dramatic_reversal (niti)
- niti_separate_fact_from_emotion_before_acting (niti)
- sankhya_freedom_grows_with_discrimination (sankhya)
- sankhya_witness_as_friend (loneliness)
- sankhya_witness_joy_without_clinging (joy_expansion)
- yoga_friendliness_compassion_joy_equanimity (yoga_sutras)
- yoga_sutras_abhyasa_deepening (deepening)
- yoga_sutras_one_anchor_when_scattered (searching_purpose)
- yoga_sutras_plateau_as_ripening (deepening)
- yoga_sutras_santosha_as_practice (joy_expansion)
- yoga_sutras_subtler_not_intenser (deepening)