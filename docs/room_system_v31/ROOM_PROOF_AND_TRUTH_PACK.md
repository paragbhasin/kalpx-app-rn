# Room Proof and Truth Pack
**Status:** Phase 1 DECLARED PROVEN — 2026-04-21  
**Owner:** Founder

---

## 1. Phase 1 proof summary

Phase 1 covers Clarity (teaching lane) and Growth (wisdom banner lane). Both are proven.

| Criterion | Description | Clarity result | Growth result |
|---|---|---|---|
| **C1** | `life_context_applied: true` in provenance on ≥1 chip per render | 20/20 (100%) | 20/20 (100%) |
| **C2** | Different `item_id` for work_career vs relationships, same UUID + room | PASS — `yoga_name_the_vritti` vs `gita_clarity_after_desire_anger` | PASS — `gita_become_instrument_not_controller` vs `dharma_carry_only_the_duty_that_is_yours` |
| **C3** | ≥60% of renders select bias-matched items under a tagged context | 20/20 (100%) for both conditions | 20/20 (100%) for both conditions |
| **C4** | No single tradition family >70% of context-matched renders | PASS — YS (1), Gītā (1) across both contexts. No collapse. | PASS — Gītā (1), Dharma (1) across both contexts. No collapse. |
| **C5** | Founder reads both items per room and articulates contextual fit without referencing bias tag | PASS — declared by founder 2026-04-21 | PASS — declared by founder 2026-04-21 |

**Items proven:**

| Room | Context | Item selected | Bias | Why it fits |
|---|---|---|---|---|
| clarity | work_career | `yoga_name_the_vritti` | ['self', 'work_career'] | Naming the mental pattern (vritti) that drives career decisions — discrimination at work |
| clarity | relationships | `gita_clarity_after_desire_anger` | ['relationships', 'self'] | Discernment after desire/anger — applies directly to relational distortion and seeing clearly in bonds |
| growth | work_career | `gita_become_instrument_not_controller` | ['work_career', 'purpose_direction'] | Karma-yoga of relinquishing control — growing into purposeful professional action |
| growth | relationships | `dharma_carry_only_the_duty_that_is_yours` | ['work_career', 'relationships', 'purpose_direction'] | Dharmic boundary-setting in relational growth — not carrying more than yours to carry |

---

## 2. Technical mechanism

Context differentiation is delivered by **direct pool-ref selection** (`_pick_asset_from_refs` in `core/room_selection.py`). When `life_context` is passed to `select_room_actions`, the teaching path (`_fetch_wisdom_asset_for_teaching`) and the banner path (`_fetch_wisdom_asset_for_banner`) both read the room's pool `rotation_refs` — which are dicts carrying `{item_id, life_context_bias}` after migration 0144. The function filters for candidates where `life_context_bias` contains the requested context, then sorts by `(len(life_context_bias), asset_id)` ascending. This means the most context-exclusive item (tagged for only one or two contexts) is preferred over broadly-tagged items. The result is queried directly from `WisdomAsset` using `asset_id__in`. If no context-matched candidates exist, it falls back to alphabetical order among all pool refs. This mechanism is entirely independent of the wisdom selector's ranking pipeline — it does not go through `_pick_wisdom_for_room` for the teaching/banner paths when `life_context` is present and pool refs are available.

**Key code commits (dev branch `phase5-polish-be-wisdom-and-chips`):**
- `dddfa87b` — feat(life-context/P1): Path B wisdom selector + teaching context routing
- `b2da7855` — fix(life-context/P1): banner path uses direct pool-ref selection for context
- `fb428201` — fix(life-context/P1): prefer context-exclusive items in teaching+banner selection

---

## 3. Per-room proof status

| Room | Proof status | Surface carrying differentiation | Is distinction legible to human? | Picker allowed? |
|---|---|---|---|---|
| **room_clarity** | **PROVEN** — C1/C2/C3/C4/C5 all pass | Teaching lane (WisdomAsset direct selection from principle pool rotation_refs) | Yes — YS vritti-naming vs Gītā desire-anger clarity are visibly different teachings for different life situations | **YES** |
| **room_growth** | **BANNER PROVEN** — C1/C2/C3/C4/C5 all pass for banner. Sankalp not separately proven. | Wisdom banner lane (WisdomAsset direct selection from banner pool rotation_refs) | Yes — Gītā non-controller framing vs Dharma relational-duty framing are visibly distinct for work vs relationship contexts | **YES** (banner proven) |
| **room_growth sankalp** | **NOT PROVEN** — 0144 applied on dev, Rule 5 is wired, pool refs are dict format; but anchor `honor_my_skill` is work-skewed on cold_start and no proof run has been conducted | Rule 5 in `_score_candidate` (uses `MasterSankalp.life_context_bias`, not affected by WisdomPrinciple models.py gap) | Not proven — anchor misalignment means cold_start is not context-neutral regardless of Rule 5 state | **NO** — must not claim sankalp is context-proven |
| **room_connection** | **NOT PROVEN** | None yet (Phase 2 scope) | No | **NO** |
| **room_release** | **NOT PROVEN** | None yet (Phase 3 if justified) | No | **NO** |
| **room_joy** | **UNIVERSAL BY DESIGN** — not a proof gap | N/A — register/subslot-led permanently | N/A | **NO** — permanent |
| **room_stillness** | **UNIVERSAL BY DESIGN** — not a proof gap | N/A — pre-cognitive regulation, permanent | N/A | **NO** — permanent |

---

## 4. Provenance accuracy

`life_context_applied: true` in the API response's provenance block fires correctly for clarity and growth.

The mechanism: `lc_applied_item_ids` is a set populated by the teaching and banner selection paths when `lc_matched=True` is returned from `_pick_asset_from_refs`. At the end of `select_room_actions`, `life_context_applied_envelope = bool(lc_applied_item_ids)` is computed and passed to the response envelope as `provenance.life_context_applied`.

There is no inflation: `lc_matched=True` is only returned when an item was selected specifically because it appeared in the context-matched set. If the fallback path (alphabetical, no context match) was taken, `lc_matched=False` is returned and `lc_applied_item_ids` is not populated for that item.

**Result:** C1 firing at 100% across 80 renders is not an artifact of provenance over-reporting. It reflects genuine context-matched selection on every render.

---

## 5. What is not proven

The following are explicitly out of scope for the current proof. They must not be claimed as proven.

| Item | Status | Gate |
|---|---|---|
| Growth sankalp context-responsiveness | Not proven | Phase 2 (after anchor fix + dedicated proof run) |
| Connection context-responsiveness | Not proven | Phase 2 |
| Release context-responsiveness | Not proven | Phase 3 if justified |
| Joy context-responsiveness | N/A — by design | Never |
| Stillness context-responsiveness | N/A — by design | Never |
| Mantra context-responsiveness (any room) | N/A — state-driven by design | Never |
| Practice context-responsiveness (any room) | N/A — state-driven by design | Never |
| Prod-environment proof | Not yet run | After 0144 + full chain applied on prod |
