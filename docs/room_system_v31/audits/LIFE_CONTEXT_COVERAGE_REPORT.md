# Life Context Coverage Report

**Agent**: Agent 3 (life_context operationalization)
**Date**: 2026-04-21
**Status**: FOUNDER-REVIEW-PENDING
**Paired artifact**: `LIFE_CONTEXT_TAG_PATCH.yaml`
**Doctrine ref**: `ROOM_SYSTEM_STRATEGY_V1.md` §1 §2 §8 · `WAVE1_SYNTHESIS.md` §1.4 · `ROOM_POOL_PLAN_V2.yaml`
**Locale scope**: English (en) only

This report predicts the post-tag discrimination power of Rule 5 (the +1 hint
weight life_context scorer) after the companion `LIFE_CONTEXT_TAG_PATCH.yaml`
applies. It is meant to be read alongside the patch and WAVE1_SYNTHESIS §8
(what the user will feel).

Canonical context naming used: **`self`** (per STRATEGY §1 authoritative
line 6). ROOM_POOL_PLAN_V2.yaml's `self_devotion` is treated as a V2-doc
inconsistency and flagged in §E.

---

## §A Expected post-tag coverage by class

Count of rows (per class) carrying each life_context after the patch applies.
Cells ≤2 rows are **THIN** (Rule 5 cannot discriminate meaningfully at <3 candidates).

### A.1 Mantras (24 pool rows; sparse 0-2)

| context | stillness | connection | release | clarity | growth | joy | TOTAL |
|---|---:|---:|---:|---:|---:|---:|---:|
| work_career     | — | 0 | 0 | 4 | 1 | 0 | 5 |
| relationships   | — | 3 | 1 | 1 | 0 | 2 | 7 |
| self            | — | 3 | 2 | 2 | 2 | 3 | 12 |
| health_energy   | — | 1 | 3 | 0 | 0 | 1 | 5 |
| money_security  | — | 0 | 0 | 0 | 1 | — | 1 **THIN** |
| purpose_direction | — | 0 | — | 3 | 3 | 1 | 7 |
| daily_life      | — | 1 | 0 | 2 | 1 | 4 | 8 |
| universal (stillness only) | 4 | — | — | — | — | — | 4 |

**THIN cells** (mantra):
- connection × purpose_direction (0) — authoring gap (WAVE1_SYNTHESIS §1.4)
- connection × daily_life (1) — very thin
- release × daily_life (0), × money_security (0), × work_career (0) — release doctrinal thinness
- clarity × health_energy (0), × money_security (0) — authoring gap
- growth × relationships (0), × health_energy (0) — authoring gap
- joy × work_career (0) — karma-yoga-craft mantra gap
- money_security 1 row ONLY across all mantras (mahalakshmi in growth); THIN

### A.2 Practices (21 pool rows; sparse 0-2)

| context | stillness | connection | release | clarity | growth | joy | TOTAL |
|---|---:|---:|---:|---:|---:|---:|---:|
| work_career     | — | 0 | 0 | 2 | 1 | — | 3 |
| relationships   | — | 1 | 1 | 1 | 1 | — | 4 |
| self            | — | 2 | 2 | 1 | 2 | — | 7 |
| health_energy   | — | 0 | 2 | 0 | 1 | — | 3 |
| money_security  | — | 0 | 0 | 0 | 0 | — | 0 **RED** |
| purpose_direction | — | 0 | — | 1 | 1 | — | 2 |
| daily_life      | — | 0 | 0 | 2 | 3 | — | 5 |
| universal (stillness only) | 5 | — | — | — | — | — | 5 |

**THIN cells** (practice):
- practice × money_security is empty across all rooms → Rule 5 cannot score practice by money context anywhere.
- clarity × relationships / health_energy (1 / 0)
- growth × health_energy (1)

### A.3 Sankalps (30 pool rows; dense 2-5, skew 3)

| context | growth | joy | TOTAL |
|---|---:|---:|---:|
| work_career     | 6 | 2 | 8 |
| relationships   | 2 | 10 | 12 |
| self            | 7 | 10 | 17 |
| health_energy   | 1 | 2 | 3 |
| money_security  | 0 | 0 (excluded) | 0 **RED** |
| purpose_direction | 6 | 3 | 9 |
| daily_life      | 6 | 13 | 19 |

Sankalps are only pooled in growth (9 rows) + joy (21 rows across 3 subslots).
Stillness/connection/release/clarity sankalp pools = empty by doctrine.

**THIN cells** (sankalp):
- growth × relationships (2) — confirmed WAVE1 authoring gap
- growth × health_energy (1), × money_security (0) — confirmed authoring gap
- joy × health_energy (2) — WAVE1 joy-rasa body-vitality gap
- joy × work_career (2) — only `share_knowledge` + `work_as_offering` carry this; critical W2 authoring need

### A.4 Principles (125 pool rows; moderate 1-3)

| context | connection | release | clarity | growth | joy | TOTAL |
|---|---:|---:|---:|---:|---:|---:|
| work_career     | 0 | 0 | 15 | 12 | 0 | 27 |
| relationships   | 5 | 2 | 14 | 6 | 1 | 28 |
| self            | 4 | 3 | 22 | 18 | 2 | 49 |
| health_energy   | 0 | 7 | 4 | 10 | 0 | 21 |
| money_security  | 0 | 2 | 3 | 2 | 0 | 7 |
| purpose_direction | 1 | — | 2 | 8 | 1 | 12 |
| daily_life      | 2 | 1 | 9 | 22 | 2 | 36 |

Principle tradition mix within clarity (per ROOM_POOL_PLAN_V2): BG 10.9% (cap ≤25% ✓).

**THIN cells** (principle):
- connection × health_energy (0), × daily_life (2) — confirmed WAVE1 gap
- release × daily_life (1), × relationships (2) — W2 expansion target
- clarity × purpose_direction (2) — matches WAVE1 flag; Agent F did not specifically author purpose_direction niti
- joy × health_energy (0) — joy-rasa body-vitality gap (WAVE1 §1.4)
- money_security: 7 rows total across all rooms; clarity has 3, release has 2 — still thin

### A.5 Wisdom-banner-only rows (6 rows; moderate 1-3)

These are the 6 wisdom_banner rows authored in WAVE1 that don't live in
principle/sankalp pools (stillness banner-only rows + joy-specific banners).

| row_id | room | life_context_bias |
|---|---|---|
| yoga_rest_in_the_seer | stillness | [] (universal) |
| ayur_vata_ground_evening (banner surface) | stillness | [] (universal on stillness surface) |
| bhakti_stay_faithful_in_ordinary_time | joy | [daily_life, relationships] |
| bhakti_trust_the_small_daily_turning | joy | [daily_life, self] |
| gita_stable_in_sorrow_and_pleasure | release | [health_energy, self] |
| sankhya_witness_before_interpretation (banner on release) | release | [self, relationships] |

---

## §B Rule 5 meaningfulness by room × context

Per STRATEGY §1 locked decision 4: Rule 5 adds **+1 hint weight**, never
overrides invariants. Predicted signal quality:

- **GREEN**: pool will visibly vary by context (≥3 candidates with distinct bias)
- **YELLOW**: varies in some classes but not all (e.g. sankalp varies, mantra doesn't)
- **RED**: post-tag pool too thin → Rule 5 output nearly identical across contexts

### B.1 Stillness

By doctrine: life_context is stripped. **N/A** — Rule 5 does not fire in stillness.

### B.2 Connection

| context | signal | why |
|---|---|---|
| relationships | GREEN | 3 mantras, 1 practice, 5 principles/banners biased relationships |
| self | GREEN | 3 mantras, 2 practices, 4 principles biased self |
| daily_life | YELLOW | 1 mantra, 0 practice, 2 principles — varies via principle only |
| purpose_direction | RED | 0 mantra, 0 practice, 1 principle (humility_makes_room_for_grace) — no variation |
| health_energy | RED | 1 mantra, 0 practice, 0 principle — single cell |
| work_career / money_security | N/A (excluded) | — |

### B.3 Release

| context | signal | why |
|---|---|---|
| health_energy | GREEN | 3 mantras, 2 practices, 7 principles/banners |
| self | GREEN | 2 mantras, 2 practices, 3 principles |
| relationships | YELLOW | 1 mantra, 1 practice, 2 principles — varies in banner, thin elsewhere |
| money_security | YELLOW | 0 mantra, 0 practice, 2 Yamas-aparigraha banners — variation only via banner |
| daily_life | RED | 0 mantra, 0 practice, 1 principle — nearly identical output |
| work_career | RED | 0 across ALL classes — confirmed WAVE1 §1.4 release × work_career gap |
| purpose_direction | N/A (excluded) | — |

### B.4 Clarity

| context | signal | why |
|---|---|---|
| self | GREEN | 2 mantras, 1 practice, 22 principles — strongest variation |
| work_career | GREEN | 4 mantras, 2 practices, 15 principles (Niti + Yamas-asteya) |
| relationships | GREEN | 1 mantra, 1 practice, 14 principles (Niti soften/boundary; Yamas satya/ahimsa) |
| daily_life | GREEN | 2 mantras, 2 practices, 9 principles (Dinacharya 5 + others) |
| purpose_direction | YELLOW | 3 mantras, 1 practice, 2 principles — mantra/practice carry; principle thin (WAVE1 confirmed gap) |
| health_energy | YELLOW | 0 mantra, 0 practice, 4 principles (Ayurveda 3) — varies via principle only |
| money_security | YELLOW | 0 mantra, 0 practice, 3 principles (Niti hidden-cost/pattern + Yoga-vairagya) — thin but not RED |

### B.5 Growth

| context | signal | why |
|---|---|---|
| daily_life | GREEN | 1 mantra, 3 practices, 6 sankalps, 22 principles (Dinacharya substrate) |
| self | GREEN | 2 mantras, 2 practices, 7 sankalps, 18 principles |
| purpose_direction | GREEN | 3 mantras, 1 practice, 6 sankalps, 8 principles |
| work_career | GREEN | 1 mantra, 1 practice, 6 sankalps, 12 principles |
| relationships | YELLOW | 0 mantra, 1 practice, 2 sankalps (light), 6 principles — tilts principle-only |
| health_energy | YELLOW | 0 mantra, 1 practice, 1 sankalp, 10 principles (Dinacharya/Ayurveda) — tilts principle |
| money_security | RED | 0 mantra, 0 practice, 0 sankalp, 2 principles (Niyamas-santosha + Dharma-integrity) — Rule 5 discrimination near-nil |

### B.6 Joy

| context | signal | why |
|---|---|---|
| daily_life | GREEN | 4 mantras, 13 sankalps, 2 banners — strong variation (subslot gratitude/blessings/seva all represent) |
| self | GREEN | 3 mantras, 10 sankalps, 2 banners |
| relationships | GREEN | 2 mantras, 10 sankalps, 1 banner |
| purpose_direction | YELLOW | 1 mantra, 3 sankalps, 1 banner — thinner; seva subslot carries |
| health_energy | YELLOW | 1 mantra, 2 sankalps, 0 banner — thin (WAVE1 joy-rasa body-vitality gap) |
| work_career | RED | 0 mantra, 2 sankalps (`share_knowledge`, `work_as_offering`), 0 banner — confirmed WAVE1 karma-yoga-craft gap |
| money_security | N/A (excluded) | — |

---

## §C Rooms that will still not materially vary post-tag

These room × context cells have **post-tag** row totals so thin that
Rule 5's +1 hint cannot produce user-visible variation. Candidates for
Wave 2 authoring OR founder de-prioritization.

| Room × context | Row count across classes | Wave 2 decision |
|---|---|---|
| **Release × work_career** | 0 total (all classes) | DOCTRINE first — WAVE1 §1.4 calls for founder doctrinal call on whether work-grief routes release or clarity |
| **Release × daily_life** | 1 total | Authoring (+3-5 release banners daily-life grief) |
| **Connection × purpose_direction** | 1 total | Authoring — guru-bhakti principles / Dhanvantari practice |
| **Connection × health_energy** | 1 total | Authoring — Dhanvantari / body-bhakti (WAVE1 §8.2 flagged) |
| **Growth × money_security** | 2 total | Authoring — growth sankalps × money (WAVE1 §1.4) |
| **Growth × relationships** | 9 total but only 2 sankalps | Authoring — growth sankalps × relationships |
| **Growth × health_energy** | 12 total but only 1 sankalp | Authoring — growth sankalps × health |
| **Joy × work_career** | 2 total (both sankalps) | Authoring — karma-yoga-craft banners + sankalps (WAVE1 §1.4 5-8 rows) |
| **Joy × health_energy** | 3 total | Authoring — joy-rasa body-vitality (WAVE1 8-12 rows) |
| **Clarity × purpose_direction** | 6 total, only 2 principles | Authoring — Niti × purpose_direction (Agent F did not hit this; WAVE1 §1.4 +15-20) |
| **Clarity × money_security** | 3 principles only; 0 mantra/practice | Authoring — clarity × money_security mantra + practice (WAVE1 §1.4) |
| **Clarity × health_energy** | 4 principles only; 0 mantra/practice | Authoring — clarity × health mantra + practice |

**Net red-cell count**: 12 room × context cells where Rule 5 cannot
meaningfully discriminate post-Wave-1. All 12 correspond to known
WAVE1_SYNTHESIS §1.4 authoring gaps — this patch does not create new
gaps; it exposes the existing ones via quantified coverage.

---

## §D Context-universal rows (no life_context_bias)

The following 14 rows ship with `life_context_bias: []` and `exclude_from_contexts: []` as doctrine-correct:

### D.1 Stillness surface rows (pre-cognitive; STRATEGY §1)
- `mantra.soham`
- `mantra.peace_calm.om`
- `mantra.shivoham`
- `mantra.om_shanti_om`
- `practice.belly_breathing`
- `practice.four_four_six`
- `practice.shanti_exhale_drop`
- `practice.palm_soothing`
- `practice.grounding_palm_press`
- `yoga_rest_in_the_seer` (stillness banner)
- `ayur_vata_ground_evening` (stillness banner surface only — same row lives in release with context bias; SURFACE_ISOLATION governed)
- `yoga_sutras_one_anchor_when_scattered` (stillness anchor post-decontamination)
- `ayur_warm_food_for_vata_scatter` (stillness teaching)
- `ayur_kapha_move_morning_inertia` (stillness teaching)

**Rule**: Router MUST strip any incoming `life_context` parameter on stillness room dispatch before scoring — if Rule 5 sees life_context on stillness, it is a router bug.

### D.2 Cross-room banners currently left universal
None in Wave 1. All banners carry at least 1 context bias on their non-stillness surfaces.

---

## §E Founder-review items

### E.1 `self` vs `self_devotion` canonical naming
**Issue**: `ROOM_POOL_PLAN_V2.yaml` uses `self_devotion` throughout its
`life_context_coverage` blocks (18 occurrences). `ROOM_SYSTEM_STRATEGY_V1.md`
§1 line 6 authoritatively names the context `self`. `TAG_PATCH_WAVE1.yaml`
uses `self`. `TAGGING_DRAFT_V1.yaml` uses `self`.

**Agent 3 choice**: Used `self` per STRATEGY §1 authority.

**Founder decision needed**: Either (a) Wave 1b normalization migration
converts `self_devotion` → `self` in ROOM_POOL_PLAN_V2, or (b) STRATEGY §1
is amended to name it `self_devotion`. Do not silently normalize in code —
this should be a deliberate docstring fix.

### E.2 Release × work_career doctrinal call
**Issue**: Release × work_career has **0 rows** across all classes post-Wave-1.
This is consistent with WAVE1_SYNTHESIS §1.4 ("release × work_career
has no pooled rows across any class"). Fundamental question: does grief
arising from professional failure (layoff, project collapse) route
through release or clarity?

**Options**:
- (a) Keep release as somatic/relational/health grief only; route work-grief to clarity
- (b) Author release × work_career content (+5-8 rows in Wave 2)

**Recommendation**: Agent 3 leans (a) — release is pre-cognitive holding;
professional loss is often cognitive-relational and routes naturally to clarity
once the body has settled. But this is a founder call. Rule 5 cannot
discriminate work_career inside release regardless.

### E.3 Joy × money_security exclusion vs abundance-family copy
**Issue**: 4 joy rows (`sankalp.welcome_abundance`, `sankalp.invite_abundance_gently`,
`mantra.lakshmi_om_shri_joy`, `dana_practice`) carry abundance / lakshmi / dana
language. Joy EXCLUDES money_security. The life_context_bias biases these
away from money_security (they skew self/purpose/relational), and
`exclude_from_contexts: [money_security]` is set — but the copy may still
read as wealth-adjacent.

**Question**: Should curator audit the copy on these 4 rows to ensure
tonality is inner-abundance / seva, not wealth-attraction?

### E.4 Sparse-density floor on mantras
**Issue**: Brief says "sparse means 0-2, not 0 — some mantras genuinely carry
relationships, some carry purpose_direction. Do not default to empty." Agent 3
assigned 1-2 contexts to every non-stillness mantra (19 of 19 non-stillness
mantras carry ≥1 context). Stillness mantras (4 of 4) are intentionally empty.

**Question**: Confirm sparse-floor interpretation is correct — never-empty
for non-stillness rows, always-empty for stillness rows.

### E.5 Dual-room rows and context coherence
**Issue**: 5 rows carry dual-room fit:
- `sankhya_witness_before_interpretation` (clarity + release)
- `yoga_abhyasa_steady_return` (clarity + growth)
- `yamas_satya_clean_truth` (growth + clarity)
- `bhakti_offer_the_moment_not_only_the_ritual` (connection + joy)
- `bhakti_gratitude_keeps_the_heart_open` (connection + joy)

Agent 3 applied the **strictest room's** exclude_from_contexts as binding
(e.g. connection's excludes dominate for bhakti dual-room; release's
`[purpose_direction]` exclusion dominates for sankhya dual). This means
a bhakti row that could serve `work_career` in joy will not, because
connection excludes work_career.

**Question**: Is "strictest-room-wins" the right dual-room exclude
semantics, or should each surface apply its own exclude at render time?
The latter is better for content utilization but more complex in the
resolver.

### E.6 Rule 5 meaningfulness thresholds
**Issue**: My RED/YELLOW/GREEN classification uses ≤2 rows = RED. Brief says
"any cell ≤2 rows as THIN (Rule 5 cannot discriminate)." If founder wants
stricter (≤3 = RED) or looser (≤1 = RED) thresholds, the matrices in §A
and §B need re-classification.

---

## Summary

- **~215 rows tagged** with `life_context_bias` + `exclude_from_contexts` per density doctrine.
- **Stillness 14 rows correctly empty** (doctrine lock).
- **12 room × context cells remain RED** post-tag — all 12 map to known WAVE1_SYNTHESIS §1.4 authoring gaps.
- **Rule 5 will meaningfully discriminate** in clarity (self/work/relationships/daily), growth (daily/self/purpose/work), joy (daily/self/relationships), connection (relationships/self), and release (health/self).
- **Canonical context naming**: `self` (per STRATEGY §1). ROOM_POOL_PLAN_V2 `self_devotion` treated as doc inconsistency; founder normalization needed (§E.1).
