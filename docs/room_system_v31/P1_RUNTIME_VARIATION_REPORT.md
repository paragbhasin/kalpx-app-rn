# P1 Runtime Variation Report — Rule 5 life_context_bias Proof

**Date:** 2026-04-21
**Scope:** Analytical proof that migration 0144 makes Rule 5 operative and produces measurable rendering variation by life_context.
**Sources read:** room_selection.py, 0144_pool_format_migration.py, 0142_niti_phase1_pooling.py, 0135b_add_v2_governance_to_wisdom_principle.py, 0136_ingest_tag_patches.py, LIFE_CONTEXT_TAG_PATCH.yaml, TAG_PATCH_WAVE1B.yaml, models.py.

---

## Section 1: Rule 5 Code Path (post-migration)

### 1.1 Where the bare-string vs dict branch diverges

In `room_selection.py` lines 1180-1192, the selector builds `refs_with_role` — a list of `(item_id, role, life_context_bias)` tuples:

```python
refs_with_role: List[Tuple[str, str, List[str]]] = []
if pool.anchor_ref:
    refs_with_role.append((pool.anchor_ref, "anchor", []))   # anchor always gets empty bias
for r in (pool.rotation_refs or []):
    if isinstance(r, dict):
        rid = r.get("item_id") or r.get("id") or ""
        if rid:
            bias = r.get("life_context_bias") or []
            if not isinstance(bias, list):
                bias = []
            refs_with_role.append((rid, "rotation", bias))    # DICT PATH — bias populated
    elif isinstance(r, str) and r:
        refs_with_role.append((r, "rotation", []))             # BARE-STRING PATH — bias always []
```

**Pre-migration (bare-string world):** every rotation ref hits the `elif isinstance(r, str)` branch and is assigned `bias=[]`. Rule 5 can never fire because `life_context in []` is always False.

**Post-migration (0144 applied):** every rotation ref is a dict of the form `{"item_id": "...", "life_context_bias": [...]}`. The `isinstance(r, dict)` branch reads the actual bias from the dict. Rule 5 can now fire when `bias` is non-empty.

**Anchor refs** remain bare strings (stored in `pool.anchor_ref`, not `rotation_refs`). The selector always assigns `bias=[]` to the anchor regardless. This is a known residual gap: the anchor item never receives Rule 5 bonus, even if its master row has life_context_bias populated.

### 1.2 Rule 5 exact implementation

In `_score_candidate` (room_selection.py lines 393-395):

```python
# Rule 5 — life_context_bias. Scoring hint only. Capped at +1.
if life_context and life_context in (row_life_context_bias or []):
    score += 1
    breakdown["rules"]["rule_5_life_context_bias"] = 1
```

Key properties:
- **Condition 1:** `life_context` must be truthy (not None, not empty string). If the caller omits `life_context`, Rule 5 is a guaranteed no-op for all candidates.
- **Condition 2:** `life_context` must appear in `row_life_context_bias` (a list). Partial matches do not count — it is a full-string membership check.
- **Cap:** +1 only, regardless of how many contexts match (only one user context is passed at a time).
- **Cannot bypass hard filters:** The docstring and inline comment both confirm Rule 5 runs after hard filters and exclusions. A high-biased item that fails `surface_eligibility` or same-day exclusion is still rejected.

### 1.3 How `life_context` input reaches the selector

`select_room_actions` signature (line 1067):

```python
def select_room_actions(
    room_id: str,
    *,
    life_context: Optional[str] = None,
    ...
) -> RoomSelectionResult:
```

`life_context` is a single string (e.g., `"work_career"`) or None. It flows unchanged to every `_resolve_runner_candidate` call and on to `_score_candidate`. It is also written to `RoomRenderLog.life_context` for observability.

**Note:** The function expects a **single string** from the caller (not a list). The canonical context set has 7 values: `work_career`, `relationships`, `self`, `health_energy`, `money_security`, `purpose_direction`, `daily_life`.

### 1.4 How score sorting works (_top_candidate)

Sorting (line 1232):
```python
cands.sort(key=lambda c: (-c["score"], c["item_id"]))
```

Descending by score, then lexicographic ascending on `item_id` as tie-breaker.

`_top_candidate` (lines 1246-1263) picks randomly among same-score tied candidates. This means:
- An item with score 7 (Rules 1+2+3+5) always beats an item with score 6 (Rules 1+2+3).
- Two items both at score 7 are selected with equal probability.

### 1.5 Format written by 0144 matches what the selector expects

Migration 0144 writes:
```python
{"item_id": "niti_separate_fact_from_emotion", "life_context_bias": ["work_career", "relationships"]}
```

Selector reads:
```python
rid = r.get("item_id") or r.get("id") or ""
bias = r.get("life_context_bias") or []
```

The key names match exactly. The fallback `r.get("id")` covers legacy carry-pool entries that used `"id"` instead of `"item_id"` — those are already dict-format and were never bare strings, so 0144 idempotency guard skips them.

### 1.6 Rule 5 can stack with Rules 1-4

Yes. All 5 rules contribute independently to the integer score. A candidate can score a maximum of 3+2+1+1+1 = 8 (not shown in pool today, not shown anywhere today, anchor role, context_tag intersect, life_context_bias match). In practice, Rule 3 (anchor) and Rule 5 (life_context) are mutually exclusive for principle-slot items because anchor_ref always gets `bias=[]` — the anchor can score max 7, a rotation item with bias match can also score max 7 (if not anchor it cannot get Rule 3 +1, so 3+2+1 = 6 at baseline or 7 with Rule 5).

---

## Section 2: Worked Example — room_clarity × principle slot

### 2.1 Pool composition after migration 0142 (Nīti Phase 1)

The clarity/principle pool after 0142 has approximately **107 rotation refs** plus 1 anchor. The 0142 docstring confirms: "clarity pool expands from ~65 to ~107 rows. BG count stays 7. BG% = 7/107 = 6.5%".

After 0144 runs, all 107 bare-string rotation refs are converted to dicts carrying their `life_context_bias` from `WisdomPrinciple.life_context_bias` (added by migration 0135b and populated by 0136/LIFE_CONTEXT_TAG_PATCH + TAG_PATCH_WAVE1B).

### 2.2 life_context_bias by context from the Nīti additions (0142 source data)

From the 50 Nīti rows added by 0142, drawn from TAG_PATCH_WAVE1B.yaml which assigns `life_context_bias` per group:

**work_career-biased Nīti rows (Group A + partial Group G), clarity pool:**
- `niti_separate_report_from_interpretation` → `[work_career]`
- `niti_counsel_versus_flattery` → `[work_career, relationships]`
- `niti_timing_of_the_action` → `[work_career]`
- `niti_reputation_over_gain` → `[work_career]`
- `niti_speak_or_stay_silent` → `[work_career]`
- `niti_coalition_without_losing_the_principle` → `[work_career]`
- `niti_short_gain_vs_long_credibility` → `[work_career]`
- `niti_rising_by_help_does_not_reduce_you` → `[work_career]`
- `niti_two_masters_problem` → `[work_career]`
- `niti_do_not_announce_the_plan_before_it_holds` → `[work_career]`
- `niti_know_your_position_before_your_move` → `[work_career]`
- `niti_protect_the_channel_of_information` → `[work_career]`
- `niti_the_promoter_who_overclaims` → `[work_career]`
- `niti_do_not_negotiate_from_exhaustion` → `[work_career]`

**relationships-biased Nīti rows (Group D), clarity pool:**
- `niti_truthfulness_with_discretion` → `[relationships]` (CURATOR_GATE: uncertainty, may be skipped by 0136)
- `niti_when_silence_protects_the_other` → `[relationships]`
- `niti_read_character_slowly` → `[relationships]`
- `niti_boundaries_as_respect` → `[relationships]`
- `niti_withholding_what_is_not_theirs` → `[relationships]`
- `niti_keep_one_elder_counsel` → `[relationships]`

Plus `niti_counsel_versus_flattery` → `[work_career, relationships]` (dual-biased, benefits both users).

**money_security-biased Nīti rows (Group B), clarity pool:** 12 rows. Primary life_context_bias = `[money_security]`.

**daily_life-biased Nīti rows (Group C), clarity pool:** 10 rows. Primary life_context_bias = `[daily_life]`.

### 2.3 Estimating bias-eligible counts in the clarity/principle pool (~107 total)

Sources for the pre-existing ~65 rows (before 0142): Bhagavad Gita (7), Yoga Sutras, Sankhya, Ayurveda, Yamas, Dinacharya, Bhakti rows from earlier migrations. The LIFE_CONTEXT_TAG_PATCH covers 125 principle rows (counting wisdom-banner-only); for clarity's pool the patch assigns bias to most non-BG, non-stillness principles.

Conservative estimates for the 107-row clarity principle pool after all migrations applied:

| life_context | Approximate eligible rows | Source |
|---|---|---|
| work_career | ~20-25 | 14 Nīti Group A+G + ~6-10 from earlier Sankhya/Yoga/BG rows tagged by LIFE_CONTEXT patch |
| relationships | ~8-12 | 6 Nīti Group D + ~2-6 from earlier rows (Bhakti, Yamas) |
| money_security | ~12 | 12 Nīti Group B |
| daily_life | ~10 | 10 Nīti Group C |
| self | ~8-12 | Sankhya, Yoga Sutras, Dinacharya rows |
| purpose_direction | ~5-8 | BG rows, Dharma/Purushartha rows |
| health_energy | ~3-5 | Ayurveda, Dinacharya rows |

Items with **empty life_context_bias**: BG rows (7, universal doctrine), some Yoga Sutras rows, possibly some Bhakti rows. Estimate: ~15-25 rows with no bias, i.e., universal.

### 2.4 Score tables — User A (work_career) vs User B (relationships)

**Scenario:** A fresh user on their second visit to room_clarity. Prior render showed item X (hypothetical). No same-day core activity. Five candidate principles from the rotation.

**Abbreviations:** R1 = shown in last 3 renders (+3 if absent), R2 = shown anywhere today (+2 if absent), R3 = pool_role=anchor (+1), R4 = context_tags intersect (+1), R5 = life_context_bias match (+1).

All 5 candidates shown below are rotation items (not anchor) so R3=0 for all. Assume no same-day exclusions and no prior-render hits unless noted. Assume R4=0 (context_tags intersection is a separate field not populated by these patches).

| item_id | R1 | R2 | R3 | R4 | R5 (work_career) | Total (User A) | R5 (relationships) | Total (User B) |
|---|---|---|---|---|---|---|---|---|
| niti_timing_of_the_action | +3 | +2 | 0 | 0 | +1 | **6** | 0 | 5 |
| niti_two_masters_problem | +3 | +2 | 0 | 0 | +1 | **6** | 0 | 5 |
| niti_counsel_versus_flattery | +3 | +2 | 0 | 0 | +1 | **6** | +1 | **6** |
| niti_when_silence_protects_the_other | +3 | +2 | 0 | 0 | 0 | 5 | +1 | **6** |
| niti_boundaries_as_respect | +3 | +2 | 0 | 0 | 0 | 5 | +1 | **6** |

**User A (work_career):** Top candidates at score 6 are `niti_timing_of_the_action`, `niti_two_masters_problem`, `niti_counsel_versus_flattery`. Random selection among tied items at score 6. The relationships-biased items (`niti_when_silence...`, `niti_boundaries...`) score 5 and are deprioritized.

**User B (relationships):** Top candidates at score 6 are `niti_counsel_versus_flattery`, `niti_when_silence_protects_the_other`, `niti_boundaries_as_respect`. The work_career-biased items (`niti_timing...`, `niti_two_masters...`) score 5 and are deprioritized.

**How this changes ranking vs pre-migration bare-string world:**

Pre-migration, all 5 items scored identically (5 points, since R5 never fired). Selection was random across all tied items, giving each item a 1/5 probability of selection. Post-migration:
- User A: 3 items tie at 6, 2 items score 5. The 3 work_career-biased items have 3× higher probability of selection than any relationships-biased item.
- User B: 3 items tie at 6, 2 items score 5. The 3 relationships-biased items have 3× higher probability of selection than any work_career-only item.

### 2.5 Quantification: Rule-5-eligible items per context in clarity/principle pool

Approximately:

| life_context | Rule-5-eligible items (est.) | % of 107-item pool |
|---|---|---|
| work_career | ~22 | ~21% |
| relationships | ~10 | ~9% |
| money_security | ~12 | ~11% |
| daily_life | ~10 | ~9% |
| self | ~10 | ~9% |
| purpose_direction | ~6 | ~6% |
| health_energy | ~4 | ~4% |
| (no bias / universal) | ~25 | ~23% |

A `work_career` user has ~22 items that score 6 vs ~85 items scoring 5 on a fresh rotation — a materially larger preferred set than a `health_energy` user (only ~4 items scoring 6). This means `work_career` and `money_security` users will see the most Rule 5 discrimination on the clarity principle surface.

---

## Section 3: room_growth × principle slot — brief verification

### 3.1 Pool composition

0142 adds 8 Nīti rows to the growth/principle pool (Groups E + F). Pre-existing growth principle rows are fewer than clarity; estimated total pool ~25-35 rows post-0142.

**work_career-biased Nīti rows (Group E), growth pool:**
- `niti_craft_outlives_the_role` → `[work_career]`
- `niti_clean_means_as_discipline` → `[work_career]`
- `niti_leadership_that_serves` → `[work_career]`
- `niti_develop_your_successor` → `[work_career]`
- `niti_learn_from_the_counterpart` → `[work_career]`

**money_security-biased Nīti rows (Group F), growth pool:**
- `niti_wealth_used_rightly` → `[money_security]`
- `niti_austerity_as_freedom` → `[money_security]` (CURATOR_GATE: uncertainty)
- `niti_do_not_mistake_money_for_security` → `[money_security]`

**Note:** The growth pool has **no relationships-biased Nīti rows**. Relationships users visiting room_growth will receive no Rule 5 bonus from the Nīti additions. Any Rule 5 signal for `relationships` in growth depends entirely on whatever bias the earlier-seeded non-Nīti principle rows carry (Bhakti, Yoga Sutras, BG rows tagged by LIFE_CONTEXT_TAG_PATCH — a small set).

### 3.2 Score table (growth, work_career vs relationships)

| item_id | R5 (work_career) | Total User A | R5 (relationships) | Total User B |
|---|---|---|---|---|
| niti_craft_outlives_the_role | +1 | **6** | 0 | 5 |
| niti_leadership_that_serves | +1 | **6** | 0 | 5 |
| gita_detached_action (example BG, bias=[]) | 0 | 5 | 0 | 5 |
| some_bhakti_principle (bias=[relationships]) | 0 | 5 | +1 | **6** |

**work_career users** see clear Rule 5 discrimination in growth (5 Nīti items boosted). **relationships users** see little or no Rule 5 discrimination unless the LIFE_CONTEXT_TAG_PATCH applied relational bias to earlier growth-pool Bhakti/Yoga rows — a dependency that is currently marked DRAFT (0136 not yet applied).

---

## Section 4: Rooms that remain context-universal (no Rule 5 signal)

After migration 0144 is applied, the following rooms will show zero or near-zero Rule 5 variation:

### room_stillness

**Mantras:** By doctrine (ROOM_SYSTEM_STRATEGY_V1 §1, LIFE_CONTEXT_TAG_PATCH density_doctrine), stillness rows have `life_context_bias=[]` intentionally. Four canonical mantras explicitly tagged with empty bias in LIFE_CONTEXT_TAG_PATCH: `mantra.soham`, `mantra.peace_calm.om`, `mantra.shivoham` (removed from pool by 0141), `mantra.om_shanti_om`. Practices similarly empty.

**Principles:** Stillness is principle-EXCLUDED by doctrine (ROOM_CLASS_DOMINANCE_V2, WAVE1_SYNTHESIS §2.1). No principle pool seeded for stillness.

**Result:** Rule 5 is a guaranteed no-op for room_stillness. All items score identically on Rule 5, making it functionally context-universal. This is by design: stillness is a pre-cognitive regulation space where context-differentiation would be harmful.

### room_connection (partial gap)

Connection mantras receive bias from LIFE_CONTEXT_TAG_PATCH (`relationships`, `self`, `daily_life`). However, the pool is small (~3-5 mantras) and contexts are clustered around the relational register. A `work_career` or `money_security` user in room_connection will see no Rule 5 discrimination (those contexts are excluded from connection per room_context_policy).

### room_joy (partial gap)

Joy mantras receive bias (primary contexts: `self`, `relationships`, `purpose_direction`, `daily_life`, `health_energy`). `money_security` is excluded from joy by doctrine. A `money_security` user in room_joy will see no Rule 5 signal.

### room_release

Practices/mantras tagged by LIFE_CONTEXT_TAG_PATCH receive some bias, but `purpose_direction` is excluded from release. Users whose life_context is `purpose_direction` see no Rule 5 discrimination in release.

**Summary table:**

| Room | Rule 5 signal strength | Reason |
|---|---|---|
| room_stillness | None (by design) | All items tagged empty bias per doctrine |
| room_clarity | Strong (work_career, money_security) | 22+ work_career + 12 money_security items |
| room_growth | Moderate (work_career), weak (relationships) | 5 Nīti items for work_career; few for other contexts |
| room_connection | Weak overall; zero for work_career/money | Small pool; excluded contexts get no signal |
| room_release | Moderate; zero for purpose_direction | purpose_direction excluded |
| room_joy | Moderate; zero for money_security | money_security excluded |

---

## Section 5: Edge Case Analysis

### 5.1 What if `user_life_context` is None or not provided?

In `_score_candidate` (line 393):
```python
if life_context and life_context in (row_life_context_bias or []):
```

The `if life_context` guard short-circuits immediately when `life_context` is None or `""`. Rule 5 produces +0 for every candidate. **Graceful skip confirmed.** No crash, no partial-fire. The selector behaves identically to the pre-migration bare-string world for this call.

The `select_room_actions` signature defaults `life_context=None`, so callers that do not pass life_context are fully safe.

### 5.2 What if a pool ref dict exists but `life_context_bias` key is missing?

In the selector (line 1187):
```python
bias = r.get("life_context_bias") or []
if not isinstance(bias, list):
    bias = []
```

`dict.get("life_context_bias")` returns None if the key is absent. `None or []` evaluates to `[]`. Rule 5 receives `row_life_context_bias=[]` and cannot fire. **No crash.** The item is treated as context-universal.

The 0144 migration always writes the key (`{"item_id": ..., "life_context_bias": [...]}`) — so refs produced by 0144 always have the key. The only way to get a dict without the key is a legacy carry-pool entry authored separately (these have additional keys and are skipped by the 0144 idempotency guard).

### 5.3 What if all items have empty life_context_bias (e.g., stillness room)?

If every `row_life_context_bias` is `[]`, then `life_context in []` is always False. Rule 5 contributes +0 to every candidate. Scores are identical across all items on Rule 5. Other rules (1-4) determine ranking normally. **Clean no-op confirmed.** The overall scoring and ranking logic is unaffected.

### 5.4 Can Rule 5 cause starvation for niche-context users?

**Starvation definition:** a niche-context user (e.g., `health_energy`) never sees items whose bias contains their context, because the high-volume context items (work_career) crowd the pool.

**Analysis:** Rule 5 adds at most +1 to items matching the caller's context. Items that do NOT match the caller's context (including items biased toward other contexts) simply don't get the +1 — they are not penalized. An item with `life_context_bias=["work_career"]` scores identically for a `health_energy` user as for a `relationships` user: no bonus for either.

So the competitive dynamic is: items biased to the **caller's** context get +1, all others get +0. This means:
- A `work_career` user sees ~22 items at score 6+ and ~85 items at score 5 in clarity. They are likely to get a work_career-biased item.
- A `health_energy` user sees ~4 items at score 6+ and ~103 items at score 5 in clarity. They may frequently get a universal (unbiased) item, but NOT a work_career item — those score the same 5 points as a health_energy item for this user.

**Starvation risk:** Low. The niche-context user is not disadvantaged relative to the pre-migration world — they receive the same universe of items minus the Rule 5 bonus concentration. The work_career-biased items do not crowd out health_energy items; they only crowd out each other (ties at score 6 are random). A health_energy user has roughly equal probability of getting any of the ~103 items that scored 5 for them.

**One real concern:** If the pool has very few universal items and a `health_energy` user finds many `work_career` items in their last-3-renders exclusion (Rule 1), the effective pool shrinks. But this is a content density problem, not a Rule 5 starvation problem.

---

## Section 6: Verdict

### 6.1 Is Rule 5 now truly operative for context-responsive rendering?

**YES — with conditions.**

Post-0144, Rule 5 fires whenever three conditions are met simultaneously:

1. The caller passes a non-null `life_context` string to `select_room_actions`.
2. The pool row's `rotation_refs` entry is a dict (guaranteed by 0144 for all active pools).
3. The dict's `life_context_bias` list is non-empty and contains the caller's `life_context` value.

Condition 1 is a caller responsibility — the FE/API must pass `life_context` in the room request. If it is omitted, Rule 5 is permanently silent.

Condition 3 depends on:
- Migration 0135b having been applied (adds `life_context_bias` column to WisdomPrinciple — currently DRAFT).
- Migration 0136 having been applied (ingests TAG_PATCH_WAVE1B and LIFE_CONTEXT_TAG_PATCH values into the column — currently DRAFT).
- Migration 0142 having been applied (pools the Nīti rows that carry those values).
- Migration 0144 having been applied (copies the values from the model rows into the pool dicts).

**The P1 execution chain required for Rule 5 to fire: 0135b → 0136 → 0142 → 0144, plus the FE passing life_context.**

### 6.2 Which rooms change materially by life_context after P1-A?

| Room | Contexts with material Rule 5 signal | Evidence |
|---|---|---|
| room_clarity / principle | work_career (~22 items), money_security (~12 items) | Nīti Groups A+G+B in 0142; tagging in WAVE1B |
| room_clarity / principle | daily_life (~10 items), relationships (~7-9 items) | Nīti Groups C+D |
| room_clarity / mantra | work_career, purpose_direction | LIFE_CONTEXT_TAG_PATCH clarity mantras (Hanuman, Saraswati, Ganesha rows) |
| room_growth / principle | work_career (~5 items) | Nīti Group E |
| room_growth / principle | money_security (~3 items) | Nīti Group F |
| room_growth / mantra | self, purpose_direction | LIFE_CONTEXT_TAG_PATCH growth mantras |
| room_joy / mantra | self, relationships, daily_life | LIFE_CONTEXT_TAG_PATCH joy mantras |
| room_connection / mantra | relationships, self | LIFE_CONTEXT_TAG_PATCH connection mantras |
| room_release / mantra | health_energy, self | LIFE_CONTEXT_TAG_PATCH release mantras |
| room_stillness / any | none | Doctrine: empty bias by design |

### 6.3 What is the remaining gap (if any)?

**Gap 1: Migrations 0135b and 0136 are still DRAFT.**
Migration 0135b adds the `life_context_bias` column to `WisdomPrinciple`. Migration 0136 ingests the actual values from the three tag-patch YAMLs. Without these two migrations applied before 0144, the `_lookup_bias` function in 0144 will call `row.life_context_bias` on WisdomPrinciple and either crash with AttributeError (column not in schema) or return `[]` for every principle row (if the column exists but has not been populated). In either case, the clarity/growth principle pool items receive `life_context_bias=[]` in their pool dicts, and Rule 5 cannot fire for principle slots. **Runner slots (mantras, practices, sankalps) are unaffected** — their `life_context_bias` was added by migration 0130 and populated in earlier migration waves.

**Gap 2: Anchor refs do not receive Rule 5.**
`pool.anchor_ref` is a bare string and always gets `bias=[]` in the selector (line 1182). Even if the anchor item's master row has `life_context_bias` populated, Rule 5 cannot fire for it. On cold-start, the selector prefers the anchor — meaning cold-start renders are always context-neutral on Rule 5. Only repeat renders, which draw from rotation refs, benefit from Rule 5.

**Gap 3: Caller must pass life_context.**
If the API endpoint (`/api/v1/rooms/{room_id}/render/`) does not receive `life_context` in the request body and does not forward it to `select_room_actions`, Rule 5 is silent. This is an integration requirement, not a migration requirement.

**Gap 4: WisdomPrinciple's life_context_bias is not confirmed in models.py.**
Inspection of models.py confirms that the Python model class `WisdomPrinciple` (lines 6902-7015) does NOT define `life_context_bias` as a model field. Migration 0135b adds this column to the database schema but the corresponding `models.py` update must also be applied. If models.py is out of sync, Django ORM calls to `row.life_context_bias` in the 0144 migration will raise `AttributeError` (accessing an attribute not declared on the Python class), potentially causing the migration to fail gracefully (logged as `bias=[]`) or noisily (unhandled exception). The migration's `_lookup_bias` has a broad `except Exception` guard that logs and returns `[]` — so in the worst case, all principle pool refs get `life_context_bias=[]` silently.

**Gap 5: CURATOR_GATE uncertainty items skipped by 0136.**
Six rows have non-empty `uncertainty[]` in TAG_PATCH_WAVE1B and are skipped by 0136 ingest: `niti_aparigraha_meets_prudence`, `niti_truthfulness_with_discretion`, `niti_austerity_as_freedom`, and three Sankhya rows. These six rows are pooled by 0142 but their `life_context_bias` will be empty in the DB (0136 skips them). After 0144, their pool dicts will carry `life_context_bias=[]`. They participate in the pool but never receive Rule 5 bonus — treated as universal items.

### 6.4 Minimum viable P1-A checklist for Rule 5 to be fully operative

1. Apply 0135b (adds life_context_bias to WisdomPrinciple DB schema + update models.py Python class).
2. Apply 0136 (ingests LIFE_CONTEXT_TAG_PATCH + TAG_PATCH_WAVE1B values into all content tables).
3. Apply 0142 (pools 50 Nīti rows into clarity + growth).
4. Apply 0144 (converts rotation_refs to dicts carrying life_context_bias from content rows).
5. FE/API passes `life_context` parameter in room render requests.

Steps 1-4 are all currently DRAFT-gated. Steps 1+2 are blocked on founder review of the tag-patch content. Step 5 is an FE integration task. Once all 5 are live, Rule 5 is operative and measurable for `work_career` (strongest signal in clarity), `money_security`, and `daily_life`. Relationships and self signals are present but thinner.
