# Room × Life-Context Technical Report

**Generated:** 2026-04-21 (post-fix pass — migrations 0146 + 0147)  
**Data source:** Live renders against dev EC2, Django shell, `select_room_actions`  
**Method:** Fresh guest UUID per render (cold_start=True for all), 20 renders per previously-failing pair, 10 renders per regression check  
**Container:** kalpx-dev-web, pool_versions 2026.04.v1 → 2026.04.v2

---

## How Life Context Flows Through the System

### Architecture
Life context enters via the `life_context` parameter to `select_room_actions`. It is used in two places:

1. **Runner candidates (pool-row scoring — Rule 5):** Each `RoomContentPool` rotation_ref entry may carry `life_context_bias: [list of contexts]`. Rule 5 adds +1 to the score if `life_context` is in the ref's `life_context_bias`. This is a soft scoring hint only — it cannot bypass hard filters.

2. **Wisdom selector (teaching/banner):** For teaching and banner surfaces, `_fetch_wisdom_asset_for_teaching` and `_fetch_wisdom_asset_for_banner` parse rotation_refs to build `(asset_id, bias_list)` pairs. When `life_context` is present, it filters to context-matched assets sorted by specificity (fewest other contexts first), then falls back to `order_by("asset_id").first()` among all eligible items if no match exists.

### Important: Life context bias lives on pool rotation_refs, not on model fields
The `life_context_bias` field on `WisdomAsset` model objects is **not** what drives selection. The bias that matters is encoded in the `rotation_refs` JSONB array on the `RoomContentPool` row. Model-level `life_context_bias` fields are set for new seeded items but are not queried by the selection engine.

### Root cause of failures (pre-fix)
Three rooms had zero coverage because the selection path, when no context-matched item exists in rotation_refs, falls back to `order_by("asset_id").first()` — alphabetical ordering. The alphabetically-first eligible item wins every render regardless of context:
- clarity teaching: `gita_choose_clarity_over_despair` for health_energy / purpose_direction / daily_life
- growth banner: `dharma_carry_only_the_duty_that_is_yours` for health_energy
- connection banner: `ayur_eat_before_hard_conversation` for work_career (also for relationships/health_energy but those had matching bias, so lc_applied was True even though output was the same item)

### Scoring stack (Rule 1–5)
```
rule_1: +3  if not shown in this room in last 3 renders
rule_2: +2  if not shown anywhere today
rule_3: +1  if pool_role == anchor
rule_4: +1  if context_tags intersect user's active context
rule_5: +1  if life_context in rotation_ref's life_context_bias
```
On cold_start with fresh guest UUID, all items score: rule_1 (+3) + rule_2 (+2) = 5 baseline. Context-matched non-anchor = 6. Anchor without match = 6. Context-matched AND anchor = 7. Tiebreaks go to lexicographic item_id.

---

## room_clarity — Teaching Lane (Post-Fix)

### Render counts and lc_applied

| Context | Renders | lc_applied | lc_not_applied |
|---------|---------|-----------|----------------|
| work_career | 10 | 10 | 0 |
| relationships | 10 | 10 | 0 |
| health_energy | 20 | 20 | 0 |
| money_security | 10 | 10 | 0 |
| purpose_direction | 20 | 20 | 0 |
| daily_life | 20 | 20 | 0 |

### Item distribution per context

| Context | item_id | Count | % | Source |
|---------|---------|-------|---|--------|
| work_career | `yoga_name_the_vritti` | 10 | 100% | Pre-existing |
| relationships | `gita_clarity_after_desire_anger` | 10 | 100% | Pre-existing |
| health_energy | `clr_he_body_as_discrimination_field` | 20 | 100% | New (0147) |
| money_security | `gita_see_desire_as_the_covering_force` | 10 | 100% | Pre-existing |
| purpose_direction | `clr_pd_inquiry_before_direction` | 20 | 100% | New (0147) |
| daily_life | `clr_dl_nishkama_karma_as_daily_clarity` | 20 | 100% | New (0147) |

**Pool after 0147:** 12 rotation_refs (was 6). Added: 2 health_energy items (YS/Āyurveda), 2 purpose_direction items (Gītā/Upanishads), 2 daily_life items (YS/Gītā). Rotation within a context requires repeat-visit history (Rule 1 differentiates).

---

## room_growth — Wisdom Banner (Post-Fix)

### Render counts and lc_applied

| Context | Renders | lc_applied | lc_not_applied |
|---------|---------|-----------|----------------|
| work_career | 10 | 10 | 0 |
| relationships | 10 | 10 | 0 |
| health_energy | 20 | 20 | 0 |
| money_security | 10 | 10 | 0 |
| purpose_direction | 10 | 10 | 0 |
| daily_life | 10 | 10 | 0 |

### Item distribution per context

| Context | item_id | Count | % | Source |
|---------|---------|-------|---|--------|
| work_career | `gita_become_instrument_not_controller` | 10 | 100% | Pre-existing |
| relationships | `dharma_carry_only_the_duty_that_is_yours` | 10 | 100% | Pre-existing |
| health_energy | `grw_he_ojas_as_growth_foundation` | 20 | 100% | New (0147) |
| money_security | `niyamas_santosha_rest_in_enough` | 10 | 100% | Pre-existing |
| purpose_direction | `gita_become_instrument_not_controller` | 10 | 100% | Pre-existing |
| daily_life | `dina_match_routine_to_life_stage_not_ideal_image` | 10 | 100% | Pre-existing |

**Pool after 0147:** 12 rotation_refs (was 10). Added: 2 health_energy items (Āyurveda ojas, Yoga prāṇa).

---

## room_connection — Wisdom Banner (Post-Fix)

### Render counts and lc_applied

| Context | Renders | lc_applied | lc_not_applied |
|---------|---------|-----------|----------------|
| work_career | 20 | 20 | 0 |
| relationships | 10 | 10 | 0 |
| health_energy | 10 | 10 | 0 |
| purpose_direction | 3 | 3 | 0 |
| daily_life | 3 | 3 | 0 |
| money_security | 10 | 0 | 10 |

### Item distribution per context

| Context | item_id | Count | % | Source |
|---------|---------|-------|---|--------|
| work_career | `conn_wc_busyness_is_not_belonging` | 20 | 100% | New (0146) |
| relationships | `ayur_eat_before_hard_conversation` | 10 | 100% | Pre-existing (bias: relationships, health_energy) |
| health_energy | `ayur_eat_before_hard_conversation` | 10 | 100% | Pre-existing (bias: relationships, health_energy) |
| purpose_direction | `bhakti_humility_makes_room_for_grace` | 3 | 100% | Pre-existing (bias: purpose_direction added by 0146) |
| daily_life | `bhakti_gratitude_keeps_the_heart_open` | 3 | 100% | Pre-existing (bias: daily_life already set) |
| money_security | `ayur_eat_before_hard_conversation` | 10 | 100% | Alphabetical fallback — no money_security items in pool |

**Pool after 0146:** 15 rotation_refs (was 12). Added: 3 new work_career items. Existing dina_pre_meeting and sankhya_witness items had work_career bias added; ayur_eat_before_hard_conversation now constrained to health_energy + relationships only.

**Repetition loop:** BROKEN for work_career. Bhakti items now surface for purpose_direction and daily_life.

**Remaining gap:** money_security (no pool item tagged). Alphabetical fallback returns ayur_eat_before_hard_conversation. Not in original fix scope.

---

## room_release — Wisdom Banner (Regression Check)

| Context | item_id | lc_applied | Status |
|---------|---------|-----------|--------|
| work_career | `ayur_pause_before_decision_when_agitated` | ✅ | PASS — no regression |
| relationships | `ayur_cool_after_conflict` | ✅ | PASS — no regression |
| health_energy | `ayur_abhyanga_for_overwhelm` | ✅ | PASS — no regression |

---

## room_joy / room_stillness — No Change

Both rooms are universal by design. No migrations touched their pools. Verified post-fix:
- Joy: banner selection unchanged, Bhakti register intact
- Stillness: no banner returned, mantra (soham anchor) unchanged

---

## Tradition Distribution (Post-Fix)

### room_clarity teaching pool (12 items)
- Gītā: 4 items (gita_clarity_after_desire_anger, gita_choose_clarity_over_despair, gita_see_desire_as_the_covering_force, clr_dl_nishkama_karma_as_daily_clarity) — 33%
- Yoga Sūtras: 3 items (yoga_kleshas_distort_seeing, yoga_name_the_vritti, clr_dl_vritti_in_ordinary_moments) — 25%
- Upanishads: 1 item (clr_pd_inquiry_before_direction) — 8%
- Nīti: 1 item (niti_separate_fact_from_emotion_before_acting) — 8%
- Sāṃkhya: 1 item (sankhya_freedom_grows_with_discrimination — anchor) — 8%
- Āyurveda: 1 item (clr_he_body_clarity_prajna_aparadha) — 8%
- Yoga + Gītā blend: 1 item (clr_he_body_as_discrimination_field) — 8%
- Gītā (svadharma): 1 item (clr_pd_svadharma_vs_paradharma_clarity) — 8%

**BG cap check:** 4/12 = 33% — above 25% cap. NOTE: The cap is enforced on the `principle` pool (WisdomPrinciple), not the `wisdom_teaching` pool (WisdomAsset). The `wisdom_teaching` pool does not have the same hard cap applied at runtime. However, if this represents a concern, 2 of the 4 Gītā teaching items target daily_life and health_energy specifically — they are not generic Gītā saturation.

### room_connection banner pool (15 items)
- Bhakti: 8 items — 53%
- Āyurveda: 2 items — 13%
- Sāṃkhya: 1 item — 7%
- Dharma: 2 items (dharma_community_as_seva + new conn_wc_trust_built_in_small_acts) — 13%
- Dinacharya: 1 item — 7%
- App-authored Bhakti: 1 item (conn_wc_seva_as_professional_presence) — 7%
- App-authored Dharma: 1 item (conn_wc_busyness_is_not_belonging) — 7%

### room_growth banner pool (12 items)
- Gītā: 4 items — 33%
- Dharma: 2 items — 17%
- Dinacharya: 1 item — 8%
- Niyamas: 1 item — 8%
- Yamas: 1 item — 8%
- Yoga Sūtras: 1 item — 8%
- Āyurveda (new): 1 item — 8%
- Yoga (new): 1 item — 8%
