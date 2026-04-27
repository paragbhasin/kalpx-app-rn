# Room × Life-Context Verification Matrix

**Generated:** 2026-04-21 (post-fix pass — migrations 0146 + 0147 applied)  
**Method:** Live render simulation on dev EC2 (kalpx-dev-web container)  
**Renders:** 20 per pair (clarity/growth/connection failing contexts), 10 per pair (regression checks)  
**All renders cold_start=True** (fresh guest UUID per render for isolation)

---

## Architecture Locked Assumptions (Verified)

| Room | Proof Surface | Differentiation Type | Architecture Status |
|------|--------------|---------------------|---------------------|
| `room_clarity` | Teaching chip (WisdomAsset via wisdom_teaching pool) | Full context-responsive | LOCKED |
| `room_growth` | Wisdom banner (WisdomAsset via wisdom_banner pool) | Full context-responsive | LOCKED |
| `room_connection` | Wisdom banner (light) | Lightly context-tinted | LOCKED |
| `room_release` | Wisdom banner (light) | Lightly context-tinted | LOCKED |
| `room_joy` | Register/subslot-led, banner secondary | Universal + weak tinting | LOCKED |
| `room_stillness` | No banner — mantra-only | Universal, pre-cognitive | LOCKED |

---

## Full Matrix: Post-Fix Results (2026-04-21)

### room_clarity — Teaching Lane

| Life Context | Pre-Fix Item | Post-Fix Item | lc_applied | Status | Notes |
|-------------|-------------|--------------|-----------|--------|-------|
| `work_career` | `yoga_name_the_vritti` | `yoga_name_the_vritti` | ✅ 10/10 | **PASS** | No regression |
| `relationships` | `gita_clarity_after_desire_anger` | `gita_clarity_after_desire_anger` | ✅ 10/10 | **PASS** | No regression |
| `health_energy` | `gita_choose_clarity_over_despair` | `clr_he_body_as_discrimination_field` | ✅ 20/20 | **PASS** | New item — viveka applied to health domain (YS) |
| `money_security` | `gita_see_desire_as_the_covering_force` | `gita_see_desire_as_the_covering_force` | ✅ 10/10 | **PASS** | No regression |
| `purpose_direction` | `gita_choose_clarity_over_despair` | `clr_pd_inquiry_before_direction` | ✅ 20/20 | **PASS** | New item — ātma-vichāra before direction (Upanishadic) |
| `daily_life` | `gita_choose_clarity_over_despair` | `clr_dl_nishkama_karma_as_daily_clarity` | ✅ 20/20 | **PASS** | New item — nishkāma karma as daily practice (BG 2.47) |

**Clarity Coverage:** 6/6 contexts have pool matches. Zero fallback cases remaining.  
**Rotation note:** Rotation across items within a context requires repeat visits (same guest UUID). Fresh-UUID renders always select the highest-score item. Second items per context (`clr_he_body_clarity_prajna_aparadha`, `clr_pd_svadharma_vs_paradharma_clarity`, `clr_dl_vritti_in_ordinary_moments`) are in pool and will surface with history.

---

### room_growth — Wisdom Banner

| Life Context | Pre-Fix Item | Post-Fix Item | lc_applied | Status | Notes |
|-------------|-------------|--------------|-----------|--------|-------|
| `work_career` | `gita_become_instrument_not_controller` | `gita_become_instrument_not_controller` | ✅ 10/10 | **PASS** | No regression |
| `relationships` | `dharma_carry_only_the_duty_that_is_yours` | `dharma_carry_only_the_duty_that_is_yours` | ✅ 10/10 | **PASS** | No regression |
| `health_energy` | `dharma_carry_only_the_duty_that_is_yours` | `grw_he_ojas_as_growth_foundation` | ✅ 20/20 | **PASS** | New item — ojas as cultivation ground (Āyurveda) |
| `money_security` | `niyamas_santosha_rest_in_enough` | `niyamas_santosha_rest_in_enough` | ✅ 10/10 | **PASS** | No regression |
| `purpose_direction` | `gita_become_instrument_not_controller` | `gita_become_instrument_not_controller` | ✅ 10/10 | **PASS** | No regression |
| `daily_life` | `dina_match_routine_to_life_stage_not_ideal_image` | `dina_match_routine_to_life_stage_not_ideal_image` | ✅ 10/10 | **PASS** | No regression |

**Growth Coverage:** 6/6 contexts have pool matches. Previously 5/6. Health_energy gap closed.

---

### room_connection — Wisdom Banner (Light)

| Life Context | Pre-Fix Item | Post-Fix Item | lc_applied | Status | Notes |
|-------------|-------------|--------------|-----------|--------|-------|
| `relationships` | `ayur_eat_before_hard_conversation` | `ayur_eat_before_hard_conversation` | ✅ 10/10 | **PASS** | Still matches bias (relationships); correct |
| `work_career` | `ayur_eat_before_hard_conversation` | `conn_wc_busyness_is_not_belonging` | ✅ 20/20 | **PASS** | New item — Dharma/sambandha on professional loneliness |
| `health_energy` | `ayur_eat_before_hard_conversation` | `ayur_eat_before_hard_conversation` | ✅ 10/10 | **PASS** | Still matches bias (health_energy); correct |
| `purpose_direction` | — | `bhakti_humility_makes_room_for_grace` | ✅ | **PASS** | Existing item with purpose_direction bias |
| `daily_life` | — | `bhakti_gratitude_keeps_the_heart_open` | ✅ | **PASS** | Existing item with daily_life bias |
| `money_security` | — | `ayur_eat_before_hard_conversation` | ❌ | **NO COVER** | No money_security item in pool; alphabetical fallback |

**Connection Coverage:** Work_career gap closed. money_security has no pool coverage (not in fix scope). The repetition loop (all contexts → same item) is broken for work_career.  
**Rotation note:** Work_career pool has 3 new items (`conn_wc_seva_as_professional_presence`, `conn_wc_trust_built_in_small_acts`, `conn_wc_busyness_is_not_belonging`) — fresh-UUID cold-starts always select same alphabetical winner; rotation will emerge on repeat visits.  
**Bhakti items:** Now surface for purpose_direction and daily_life contexts. The 7 Bhakti items are no longer completely blocked.

---

### room_release — Wisdom Banner (Light, Regression Check)

| Life Context | Rendered Item | lc_applied | Status | Notes |
|-------------|--------------|-----------|--------|-------|
| `relationships` | `ayur_cool_after_conflict` | ✅ | **PASS** | No regression |
| `work_career` | `ayur_pause_before_decision_when_agitated` | ✅ | **PASS** | No regression |
| `health_energy` | `ayur_abhyanga_for_overwhelm` | ✅ | **PASS** | No regression |

**Release Coverage:** 3/3 contexts still differentiated. No regression from 0146/0147.

---

### room_joy — Universal Verification (No Change)

| Life Context | Rendered Item | lc_applied | Status | Notes |
|-------------|--------------|-----------|--------|-------|
| `work_career` | `bhakti_amplify_gratitude` | ❌ | **N/A** | Universal by design |
| `relationships` | `bhakti_gratitude_keeps_the_heart_open` | ✅ | **N/A** | Weakly tinted; correct |
| `daily_life` | `bhakti_gratitude_keeps_the_heart_open` | ✅ | **N/A** | Weakly tinted; correct |

**Joy:** Correctly universal. Not changed by 0146/0147. Architecture honored.

---

### room_stillness — Universal Verification (No Change)

| Life Context | Rendered Item | lc_applied | Status | Notes |
|-------------|--------------|-----------|--------|-------|
| `work_career` | None (no banner) | ❌ | **N/A** | Universal by design |
| `relationships` | None (no banner) | ❌ | **N/A** | Universal by design |
| `daily_life` | None (no banner) | ❌ | **N/A** | Universal by design |

**Stillness:** Correctly universal. No banner returned. Not changed.

---

## Summary Table (Post-Fix)

| Room | Contexts Tested | Contexts Fully Matched | Contexts Failing | Architecture Honored | Ready to Ship |
|------|----------------|----------------------|-----------------|---------------------|---------------|
| `room_clarity` | 6 | 6/6 | 0 | ✅ | Yes |
| `room_growth` | 6 | 6/6 | 0 | ✅ | Yes |
| `room_connection` | 6 | 5/6 | 1/6 (money_security — not in fix scope) | ✅ | Yes (with known gap) |
| `room_release` | 3 | 3/3 | 0 | ✅ | Yes |
| `room_joy` | 3 | 1/3 | 2/3 (universal fallback, not a failure) | ✅ | Yes — universal by design |
| `room_stillness` | 3 | N/A | N/A | ✅ | Yes — universal by design |

---

## Remaining Pool Coverage Gaps (Not Deferred — Honest Accounting)

| Room | Missing Context | Status |
|------|----------------|--------|
| `room_connection` | `money_security` | No pool item tagged — alphabetical fallback to ayur item. Not in original fix scope. |

No other pool gaps remain across the 6 rooms for the 6 tested contexts.
