# Room Content Operational Matrix

**Agent**: Agent 2 (Wave 2 operationalization)
**Date**: 2026-04-21
**Status**: FOUNDER-REVIEW-PENDING (execution-facing view; no doctrine reopened)
**Locale scope**: English (en) only
**Purpose**: Operator's view of per-room content transition through three states:
  - **Current live (0120)** — what is in the DB today (pool_version `2026.04.v1`)
  - **Post-ingestion** — after TAG_PATCH_WAVE1 + TAG_PATCH_WAVE1B + LIFE_CONTEXT_TAG_PATCH patches land AND draft migrations 0132-0135 apply (pool_version `2026.04.v2`)
  - **Post-authoring** — after 0136 ingestion migration materializes Phase B authored rows (125 rows across 8 seed files)

**Source artifacts** (read-only; not re-derived here):
- `ROOM_SYSTEM_STRATEGY_V1.md` §5 (doctrine)
- `WAVE2_FINAL_SYNTHESIS.md` Tables 1-3
- `ROOM_POOL_PLAN_V3.yaml` (per-room current_state + wave_1/1b_projected)
- `ROOM_TRADITION_ASSIGNMENT_V2.md`, `ROOM_CLASS_DOMINANCE_V2.md`
- `LIFE_CONTEXT_COVERAGE_REPORT.md` §C (12 RED cells)
- `REGRESSION_AND_VARIATION_REPORT_V3.md` §E (RED cell revisions)
- `core/migrations/0120_seed_room_pools_v1.py` (live baseline — directly counted)
- 8 Phase B row files (directly counted): Niti 68 · Sankhya 44 · Bhakti 11 · Gita-release 4 · Ayurveda 17 · Joy-work 7 · Joy-health 6 · Growth 12

**Counting conventions**
- Pooled row = anchor + rotation_refs. Dual-surface within a room counts once per surface (mirrors POOL_PLAN_V3 §5.7.5 dual-use accounting).
- Post-ingestion column assumes 0132-0135 applied AND three tag patches land via a proposed 0136 migration (not yet written) so surface_eligibility is materialized.
- Post-authoring column assumes a subsequent 0137-style migration ingests the 8 Phase B seed files into pool refs per ROOM_POOL_PLAN_V3 wave_2/wave_3 deferred_items.
- `±N` notation flags counts where Phase B pool-role (anchor / rotation / backup) is not yet resolved; I count authored rows as pool-eligible upper bound.
- Numbers below were reconciled against POOL_PLAN_V3 `classes:` maps; where V3 and the 0120 file disagree slightly (e.g. joy sankalp 16 vs 19 counted) I note `±` and prefer the direct 0120 count. Integrity: not material to execution verdict.

---

## Executive summary (one row per room)

| Room | Primary class | Pool size (live → post-ingestion → post-authoring) | Context-differentiation verdict | Execution verdict |
|---|---|---|---|---|
| **Stillness** | practice | 12 → 10 → 10 (±3 W2 authoring target) | N/A (life_context stripped by doctrine) | READY (smallest ops set; 2 adds; 0 deps on Phase B) |
| **Connection** | mantra | 13 → 17 → 17 (±9 W2 practice authoring) | GREEN relationships/self · YELLOW daily_life · RED→GREEN purpose/health via Bhakti W2 | GATED (principle-slot=0 stays; purpose/health practice gap remains after ingestion) |
| **Release** | practice (somatic) | 9 → 18 → 35 (±4 BG 2.14 + Shaiva money) | GREEN health/self · YELLOW money/relationships · RED→YELLOW work_career · RED daily_life | READY post-0136 (Ayurveda W2 17 rows is the biggest single-room delta; doctrinal call D6 blocks work_career) |
| **Clarity** | principle | 26 → 98 → 180 (+82 W1b Niti/Sankhya authored) | GREEN self/work/relationships/daily · YELLOW purpose/money/health (principle-only) | GATED (0136 ingestion of TAG_PATCH_WAVE1B is the critical gate; mantra/practice per-context still RED) |
| **Growth** | principle + sankalp (CO-PRIMARY) | 27 → 92 → 104 (+12 growth sankalp authoring) | GREEN daily/self/purpose/work · YELLOW→GREEN relationships/health via Growth W2 · RED→YELLOW money | GATED (0132 adds sankalp slot; anchor misalignment for 3 contexts is P0 product-truth risk) |
| **Joy** | sankalp | 29 → 29 → 42 (+13 joy W2 sankalps) | GREEN daily/self/relationships · RED→GREEN work_career + health_energy via Joy W2 · YELLOW purpose | GATED (structural shape stable; Joy W2 13-row ingestion is the win; soft-fail on bhakti banner count 5 vs 3-4 needs founder ACK) |

**Totals**: Live 116 rows pooled → Post-ingestion 264 → Post-authoring 388 (±16). Net delta +272 rows.

**Biggest pool-count deltas (top 3 by growth)**:
1. **Clarity**: 26 → 180 (6.9×). Driver: 82 W1b principle rows (Niti 68 + Sankhya 44 tag-patched) + 49 0134 + 10 0135 dark-tradition seeds.
2. **Release**: 9 → 35 (3.9×). Driver: 17 Ayurveda W2 practices is the highest-feel single-room delta (Agent 10 consensus).
3. **Growth**: 27 → 104 (3.9×). Driver: structural sankalp-slot creation (0132) + 51 principle additions (0135) + 12 W2 authored growth sankalps.

**Execution state**:
- **READY**: Stillness (3 ops total), Release (after 0136 + D6 ACK)
- **GATED**: Clarity (0136 for W1b tagging is the make-or-break gate), Growth (0132 structural + anchor-misalignment risk), Joy (Phase B ingestion + G-4 founder ACK)
- **THIN**: none after Phase B — but Stillness at accepted-thin; Release × work_career pre-ingestion YELLOW

---

## Room — stillness

### Class profile (from doctrine)
- **Primary**: practice
- **Secondary**: mantra
- **Light**: wisdom_banner (sparse)
- **Excluded**: sankalp, principle
- **Dominant traditions**: Yoga-Sūtras (prāṇāyāma/dhyāna), Vedanta-sākṣin
- **Allowed contexts**: none (pre-cognitive — life_context stripped at router per STRATEGY §1)

### Pool counts per class

| Class | Current live (0120) | Post-ingestion (+ 0132-0135) | Post-authoring (Phase B) |
|---|---:|---:|---:|
| mantra | 4 | 4 | 4 |
| practice | 6 | 5 | 5 |
| sankalp | 0 | 0 | 0 |
| principle | 0 | 0 | 0 |
| wisdom_banner | 2 | 4 | 4 |
| wisdom_teaching | 0 | 0 | 0 |
| wisdom_reflection | 0 | 0 | 0 |
| **Total** | **12** | **13** | **13** (±3 W2 Vedanta-sākṣin authoring target) |

Note: POOL_PLAN_V3 counts practice at 5 post-ingestion (SURFACE_ISOLATION_V2 reconciliation — `practice.hand_on_heart` stays at stillness home but the V3 `classes` map reads 5; I use 5 to match V3). Live count 6 reflects the 0120 rotation_refs literally as seeded.

### Tradition distribution post-authoring (banner slot only — no principle/sankalp)

| Tradition | Rows |
|---|---:|
| Yoga-Sūtras | 2 (one_anchor_when_scattered + rest_in_the_seer) |
| Vedanta-sākṣin | 1 (yoga_rest_in_the_seer dual-tagged) |
| BG 6.x banner | 1 (gita_endure_the_passing_contacts) |
| Ayurveda vāta | 1 (ayur_vata_ground_evening) |
| Shaiva | 1 (mantra.shivoham rotation) — **flagged D3** |

### Life_context × class differentiation prediction

| life_context | class that varies | class that stays same | material-variation verdict |
|---|---|---|---|
| (universal — life_context stripped) | none | all | N/A (Rule 5 does not fire) |

### Status summary
- **Newly tagged rows**: 0 (stillness has no W1b authoring target)
- **Newly authored rows (uncommitted)**: 0 (Phase B authored nothing into stillness)
- **Not yet ingested (in tag patches, inert)**: 0
- **Still dark**: 0 within live pool, but Vedanta-sākṣin banner breadth is at accepted-thin (4 banners → 6 would harden rotation per POOL_PLAN §Stillness deferred Wave 2)
- **Still missing (needs W3 authoring)**: +2-3 Vedanta-sākṣin banners for frequent-return users
- **User-visible expected effect after ingestion**: Structurally unchanged. 0133 removes `yoga_sutras_one_anchor_when_scattered` cross-contamination out of clarity (keeps stillness home); 0135 adds `ayur_vata_ground_evening` + `yoga_rest_in_the_seer` to banner rotation (4 → 4 counted via V3; room feels identical on first visit, marginal banner refresh on repeat). Stillness continues to feel sacred-spare; on 4+ visits per week, user notices banner loop.

### Execution readiness
- **Safe to execute**: 0133 (practice.hand_on_heart reconciliation); 0135 stillness-scoped banner adds (2 rows)
- **Needs founder ACK**: D3 (`mantra.shivoham` status — Shaiva bija in Shaiva-excluded room); W3 Vedanta-sākṣin authoring commission

---

## Room — connection

### Class profile (from doctrine)
- **Primary**: mantra
- **Secondary**: practice
- **Light**: wisdom_banner
- **Excluded**: sankalp, principle (except BG 18.66 banner)
- **Dominant traditions**: Bhakti (Nārada/Bhāgavata), BG Ch 12 secondary, Dinacharya devotional-daily
- **Allowed contexts**: relationships, self, daily_life, purpose_direction, health_energy
- **Excluded contexts**: work_career, money_security

### Pool counts per class

| Class | Current live (0120) | Post-ingestion (+ 0132-0135) | Post-authoring (Phase B) |
|---|---:|---:|---:|
| mantra | 5 | 4 | 4 |
| practice | 4 | 3 | 3 (±9 W2 Dhanvantari + guru-bhakti authoring target) |
| sankalp | 0 | 0 | 0 (doctrinally excluded) |
| principle | 0 | 0 | 0 (BG 18.66 banner-only) |
| wisdom_banner | 4 | 10 | 10 (+ 11 Bhakti W2 — see authoring note below) |
| wisdom_teaching | 0 | 0 | 0 (v1.1 gated per 0129) |
| wisdom_reflection | 0 | 0 | 0 |
| **Total** | **13** | **17** | **17 + 11 = 28** (Bhakti W2 11 rows eligible for banner pool; V3 places them in principle-authoring but class maps to banner at render due to no-principle-slot doctrine) |

Note on Bhakti W2 11 rows: POOL_PLAN_V3 scopes them to connection × purpose_direction (5), × health_energy (4), × relationships (2). Since connection has no principle slot, these are rendered through the wisdom_banner surface (dual-use §5.7.5). Authoring-row count = 11; pool-role per row (anchor vs rotation vs backup) not yet resolved.

### Tradition distribution post-authoring (banner slot — primary-class inversion: banner is the effective principle substitute)

| Tradition | Rows |
|---|---:|
| Bhakti | 7 existing + 11 W2 = 18 (Nārada + Bhāgavata + guru-bhakti + Dhanvantari body-bhakti) |
| Dinacharya | 2 (pre_meeting + sunday_reset; dual-use with clarity principle) |
| Ayurveda | 1 (eat_before_hard_conversation) |
| Sankhya | 1 (witness_as_friend — light support existing) |
| Dharma | 1 (community_as_seva — light support existing) |

### Life_context × class differentiation prediction

| life_context | class that varies | class that stays same | material-variation verdict |
|---|---|---|---|
| relationships | mantra (3) + practice (1) + banner (5) | — | GREEN |
| self | mantra (3) + practice (2) + banner (4) | — | GREEN |
| daily_life | mantra (1) + banner (2) + practice (0) | practice | YELLOW (varies principally via banner) |
| purpose_direction | banner +5 after Phase B (0→5) | mantra (0), practice (0) | **RED→GREEN** via Bhakti W2 (banner only; practice still 0) |
| health_energy | banner +4 after Phase B (0→4) | mantra (1), practice (0) | **RED→GREEN** via Bhakti W2 (banner only; practice still 0) |

### Status summary
- **Newly tagged rows**: 0 (no W1b target)
- **Newly authored rows (uncommitted)**: 11 (Bhakti W2)
- **Not yet ingested (in tag patches, inert)**: 0 at connection (life_context tag patch touches connection-pooled rows but room_fit unchanged)
- **Still dark**: practice × purpose_direction (0), × health_energy (0) — somatic devotion register gap
- **Still missing (needs W3 authoring)**: +4-6 guru-bhakti practices × purpose_direction; +3-4 Dhanvantari / body-bhakti practices × health_energy (Agent 10 §D-Connection)
- **User-visible expected effect after ingestion**: Mantra feels cleaner (soham decontaminated to stillness home). Banner rotation doubles and bhakti register becomes genuinely taught, not just chanted — "Deha-devālaya" (health), "Walk with the teacher who points beyond himself" (purpose). Body-felt devotion NOT yet instrumented — user gets taught-bhakti but not practiced-bhakti in these two contexts.

### Execution readiness
- **Safe to execute**: 0133 (soham + hand_on_heart decontamination); 0135 Bhakti banner adds (6 rows) + Dinacharya adds (2 rows) + Ayurveda 1 row; Phase B Bhakti 11-row ingestion
- **Needs founder ACK**: D10 (dual-room Bhakti banner tone distinction — `bhakti_gratitude_keeps_the_heart_open` + `bhakti_offer_the_moment_not_only_the_ritual` render identically in connection + joy); C12 (Connection × purpose_direction anchor swap — current anchor is abstract); W3 body-bhakti authoring commission

---

## Room — release

### Class profile (from doctrine)
- **Primary**: practice (somatic)
- **Secondary**: mantra (Shaiva)
- **Light**: wisdom_banner (very sparse — BG 2.14 only)
- **Excluded**: sankalp, principle
- **Dominant traditions**: Shaiva/Tantric (Maha-Mrityunjaya, Rudra), Ayurveda (native primary)
- **Allowed contexts**: relationships, self, health_energy, money_security, daily_life, work_career
- **Excluded contexts**: purpose_direction

### Pool counts per class

| Class | Current live (0120) | Post-ingestion (+ 0132-0135) | Post-authoring (Phase B) |
|---|---:|---:|---:|
| mantra | 4 | 4 | 4 (±3 W2 Shaiva × money_security authoring target) |
| practice | 3 | 3 | **3 + 17 Ayurveda W2 = 20** (highest single-room delta) |
| sankalp | 0 | 0 | 0 (release is pre-sankalpic) |
| principle | 0 | 0 | 0 (banner-only use) |
| wisdom_banner | 2 | 11 | **11 + 4 Gita W2 release = 15** (BG 2.14-family) |
| wisdom_teaching | 0 | 0 | 0 |
| wisdom_reflection | 0 | 0 | 0 |
| **Total** | **9** | **18** | **~35** (±4 Shaiva money + additional BG breadth) |

### Tradition distribution post-authoring

| Tradition | Rows |
|---|---:|
| Shaiva | 4 mantra (maha_mrityunjaya anchor + 3 rotation) |
| Ayurveda | 5 existing banner + 17 W2 practice = **22** (dominant somatic substrate) |
| Yamas (aparigraha) | 2 banner (money_security-release) |
| Yoga-Sūtras | 1 banner (friendliness_compassion_joy_equanimity) |
| BG (2.14-family) | 2 existing banner + 4 W2 = 6 banner (sparse-by-design; now meets rotation breadth) |
| Vedanta-sākṣin | 1 banner (sankhya_witness_before_interpretation, dual-room with clarity principle) |
| Bhakti / Niti / Sankhya / Dinacharya | 0 (doctrinally excluded) |

### Life_context × class differentiation prediction

| life_context | class that varies | class that stays same | material-variation verdict |
|---|---|---|---|
| self | mantra (2) + practice (≥2) + banner (2) | — | GREEN |
| relationships | mantra (1) + practice (1) + banner (2) | — | YELLOW |
| health_energy | mantra (1) + practice (3 + 17 W2) + banner (5) | — | **GREEN** (Ayurveda W2 is the biggest delta; pitta/vāta/kapha-specific) |
| daily_life | banner (2 BG) | mantra (0), practice (0) | RED (no Phase B authoring; unchanged) |
| money_security | banner (2 aparigraha) | mantra (0), practice (0) | YELLOW (banner-only variation; 2 Yamas rows + W2 Gita aparigraha context) |
| work_career | banner (1 Phase B `gita_wave2_release_equanimity_in_honor_and_dishonor`) | mantra (0), practice (0) | **RED→YELLOW** via Gita W2 (1 banner — blocked on D6 doctrinal routing) |

### Status summary
- **Newly tagged rows**: 0 at release row-level (release is all existing-authored additions via 0135)
- **Newly authored rows (uncommitted)**: 21 (Ayurveda 17 + Gita release 4)
- **Not yet ingested (in tag patches, inert)**: 0 (tag patches don't target release new rows)
- **Still dark**: practice × money_security (0), × work_career (0); daily_life across all classes (only 1 banner)
- **Still missing (needs W3 authoring)**: +5-8 release × work_career all classes (blocked on D6); +3-5 release × daily_life authoring; +3-5 Ayurveda vāta/pitta practice rotation still thin on certain body-systems
- **User-visible expected effect after ingestion**: Room becomes embodied for the first time. A user in grief-state gets a practice with concrete steps (sitali cooling, abhyanga self-oil, warm-mug-hold) rather than abstract "breathe gently." Reputation-collapse user (work_career × release) gets the BG 12.18-19 mānāpamāna banner — doctrinal routing still ambiguous but content is there.

### Execution readiness
- **Safe to execute**: 0135 release-scoped adds (8 rows); Phase B Ayurveda 17-row ingestion; Phase B Gita 4-row ingestion
- **Needs founder ACK**: D6 (work-grief routing — release vs clarity); C7 (Ayurveda release × health at 8 rows vs 5-6 target — acceptable over?); W3 daily_life + Shaiva-money authoring commission

---

## Room — clarity

### Class profile (from doctrine)
- **Primary**: principle
- **Secondary**: practice
- **Light**: wisdom_teaching
- **Excluded**: sankalp (Gita 2.63 trap), heavy mantra
- **Dominant traditions**: Sankhya (viveka-khyāti), Yoga-Sūtras (kleśa/citta-vṛtti), Niti (pragmatic discernment)
- **BG cap**: ≤ 25% hard cap (enforced in 0134/0135 migration assertions)
- **Allowed contexts**: ALL 7 (no exclusions)

### Pool counts per class

| Class | Current live (0120) | Post-ingestion (+ 0132-0135) | Post-authoring (Phase B) |
|---|---:|---:|---:|
| mantra | 6 | 6 | 6 (±4 W2 money/health authoring target) |
| practice | 5 | 5 | 5 (±4 W2 money/health authoring target) |
| sankalp | 0 | 0 | 0 (doctrinally excluded) |
| principle | 4 | **64** (via 0134 49 + 0135 10 + 1 promotion) | **64 + 82 W1b (Niti 68 + Sankhya 44 tagged) = 146** (assumes 0136 ingestion; V3 documents 82 as curator-gated) |
| wisdom_banner | 6 | 7 | 7 |
| wisdom_teaching | 5 | 7 | 7 |
| wisdom_reflection | 0 | 0 | 0 |
| **Total** | **26** | **98** | **~180** (±4 on mantra/practice authoring targets) |

Note: Phase B Niti is 68 rows and Sankhya is 44 rows (direct count); W2 brief counts 50+32=82 from F/G original batch. The delta (68-50=18 Niti new + 44-32=12 Sankhya new = 30 W2 net-new rows) lands into clarity principle via TAG_PATCH_WAVE1B (scopes W1b to F/G original 82) plus additional inline authoring in Agent 4/5 extensions. Net post-authoring clarity principle = 64 + 82 (W1b) + 30 (W2 net-new inline) = 176. Counted as 146 above via strict W1b; 176 if W2 net-new rows are separately ingested. ±30.

### Tradition distribution post-authoring (principle pool)

| Tradition | Rows | % of principle pool (of 64 post-ingestion; rescales after W1b ingestion) |
|---|---:|---|
| Sankhya | 15 (→ 59 with W2 Sankhya 44 ingested) | 23% → 40% |
| Yoga-Sūtras | 18 | 28% → 12% |
| Niti | 11 (→ 79 with W2 Niti 68 ingested) | 17% → 53% |
| BG (cap ≤ 25%) | 7 | **10.9%** (PASS; may rescale to ~5% post-ingestion — cap holds) |
| Dharma | 3 | 5% |
| Yamas | 4 | 6% |
| Ayurveda | 3 | 5% |
| Dinacharya | 5 | 8% |

**BG discipline** HELD at 10.9% (assertions in 0134 lines 194-215 + 0135 lines 258-276; founder lock `bg_clarity_principle_pct ≤ 25%` enforced at migration time; runtime guard deferred per Wave 1b hygiene item I1).

### Life_context × class differentiation prediction

| life_context | class that varies | class that stays same | material-variation verdict |
|---|---|---|---|
| self | principle (22) + practice (1) + mantra (2) | — | **GREEN** (strongest in system per REGRESSION_V3 §C.1) |
| work_career | principle (15 Niti + Yamas asteya) + mantra (4) + practice (2) | — | **GREEN** |
| relationships | principle (14 Niti + Yamas satya/ahimsa) + practice (1) + mantra (1) | — | **GREEN** |
| daily_life | principle (9 Dinacharya) + practice (2) + mantra (2) | — | **GREEN** |
| purpose_direction | principle (3 Sankhya W2 → 5 incl. existing) + mantra (3) | practice (1) | **YELLOW** (moved from RED; Niti × purpose_direction still unauthored per Agent F) |
| money_security | principle (15 with W2 Niti ingested; 3 pre-ingestion) | mantra (0), practice (0) | YELLOW pre-ingestion; GREEN at principle only post-authoring |
| health_energy | principle (4 Ayurveda → 7 with W2 Sankhya body-prakṛti) | mantra (0), practice (0) | YELLOW at principle only |

### Status summary
- **Newly tagged rows**: 82 (TAG_PATCH_WAVE1B — Niti 50 + Sankhya 32; the F/G originals). Additional ~30 W2 inline-governed rows ship tags inline.
- **Newly authored rows (uncommitted)**: 112 (Niti 68 + Sankhya 44) — W2 expansions beyond F/G originals
- **Not yet ingested (in tag patches, inert)**: 82 rows pending 0136 ingestion migration (proposed). Inert = Rule 5 cannot discriminate regardless of author quality.
- **Still dark**: mantra and practice per-context (money_security, health_energy, purpose_direction)
- **Still missing (needs W3 authoring)**: +4-6 clarity × money_security mantra/practice; +4-6 clarity × health_energy mantra/practice; +15-20 Niti × purpose_direction
- **User-visible expected effect after ingestion**: Room becomes context-shaped for the first time. Work pulls Niti-register ("Distinguish counsel from flattery"), self pulls Sāṁkhya-viveka ("Emotion is guṇa-weather, not a self"), relationships pulls Niti-on-speech + Yamas satya/ahimsa, daily pulls Dinacharya + Niti sequencing. Mantra/practice invariant across contexts — a heavy clarity user sees the same 6 mantras for 7 contexts.

### Execution readiness
- **Safe to execute**: 0133 decontamination (1 row); 0134 principle expansion (49 rows with BG cap assertion); 0135 dark-tradition seed (10 rows with doctrinal assertions); 0136 (TO BE WRITTEN) tag-patch ingestion materializing W1b + LIFE_CONTEXT + WAVE1
- **Needs founder ACK**: D4 (TAG_PATCH_WAVE1 completeness — 111/200; Groups 5-9 never authored); D5 (§5.7.5 dual-use — `yoga_abhyasa_steady_return` + `yamas_satya_clean_truth` in clarity AND growth principle); D9 (Niti growth × money routing collision); I8 (Niti `om_shanti` supporting-mantra saturation — 50 rows share same supporting mantra); W3 mantra/practice authoring commission

---

## Room — growth

### Class profile (from doctrine)
- **Primary**: principle + sankalp (CO-PRIMARY per STRATEGY §5)
- **Secondary**: practice
- **Light**: wisdom_reflection
- **Excluded / avoid-dominance**: mantra-dominant rendering
- **Dominant traditions**: BG (native home — svadharma, karma-yoga, sthita-prajña), Dharma Tier-2, Yamas/Niyamas (cultivation substrate)
- **Allowed contexts**: ALL 7

### Pool counts per class

| Class | Current live (0120) | Post-ingestion (+ 0132-0135) | Post-authoring (Phase B) |
|---|---:|---:|---:|
| mantra | 5 | 5 | 5 (±4 W2 relationships/health authoring target) |
| practice | 5 | 5 | 5 (±3 W2 money/health authoring target) |
| sankalp | **0 (missing!)** | **9** (via 0132 structural add: honor_my_skill anchor + 8 rotation) | **9 + 12 W2 = 21** (Growth W2 12 rows covering relationships/health/money) |
| principle | 6 | **57** (via 0135 51 adds) | 57 (±8 inline Agent F growth-targeted Niti per G-8 founder call) |
| wisdom_banner | 7 | 11 | 11 |
| wisdom_teaching | 6 | 7 | 7 |
| wisdom_reflection | 5 | 5 | 5 |
| **Total** | **27 (sankalp=0)** | **92** | **~104** (includes Phase B Growth W2 12 rows) |

### Tradition distribution post-authoring (principle + sankalp)

| Tradition | Principle rows | Sankalp rows |
|---|---:|---:|
| BG | 11 (PRIMARY — growth is BG native home) | 1 (effort_over_outcome, karma-yoga-inflected) |
| Dharma Tier-2 | 8 | — |
| Yamas/Niyamas | 18 (primary substrate) | — |
| Dinacharya | 10 (daily_life primary) | — |
| Yoga-Sūtras | 7 (abhyāsa/tapas) | — |
| Ayurveda | 4 (health_energy) | — |
| Niti (secondary × work_career only per §Growth) | 0 pooled; 8 Phase B authored (founder call G-8) | — |
| Growth W2 (cultivation-resolve register) | — | 12 (4 relationships + 4 health + 4 money) |
| Existing | — | 9 (honor_my_skill anchor + purpose/self/work/daily) |

**BG discipline**: growth is BG's native home — no cap. 11/57 = 19% principle pool (doctrinally unconstrained here).

### Life_context × class differentiation prediction

| life_context | class that varies | class that stays same | material-variation verdict |
|---|---|---|---|
| daily_life | principle (18 Dinacharya) + practice (3) + sankalp (2) | — | **GREEN** |
| self | principle (12) + sankalp (7) + practice (2) | — | **GREEN** |
| purpose_direction | principle (12) + sankalp (6) + practice (2) | — | **GREEN** |
| work_career | principle (10) + sankalp (6) + practice (1) | — | **GREEN** |
| relationships | principle (6) + sankalp (2 → 6 with Growth W2) | mantra (0) | **RED→GREEN** via Growth W2 (4 cultivation-register sankalps) |
| health_energy | principle (10) + sankalp (1 → 5 with Growth W2) | mantra (0) | **RED→GREEN** via Growth W2 |
| money_security | principle (3) + sankalp (0 → 4 with Growth W2) | mantra (1), practice (0) | **RED→YELLOW** via Growth W2 (sankalp-only; mantra/practice stay RED) |

### Status summary
- **Newly tagged rows**: 0 strictly (Agent F growth-targeted Niti = 8 rows pending G-8 founder call, not in W1b scope per strict interpretation)
- **Newly authored rows (uncommitted)**: 12 (Growth W2 sankalps, cultivation-resolve voice disciplined)
- **Not yet ingested (in tag patches, inert)**: 12 Growth W2 rows pending 0136+0137 ingestion migration
- **Still dark**: mantra × relationships (0), × health_energy (0); practice × money_security (0), × health_energy (1)
- **Still missing (needs W3 authoring)**: +3-4 growth mantra × relationships/health; +2-3 practice × money/health; anchor-context promotion logic per Agent 10 §H gap #1
- **User-visible expected effect after ingestion**: Structural breakthrough — growth goes from "no user-authored resolve surface" to "I practice / I return / I honor" cultivation register, with genuine context differentiation for 7/7 contexts (GREEN or YELLOW across the board). BUT: anchor `honor_my_skill` is work/self-coded and will open for a user arriving from relationship-stuck or health-depleted context — misaligned anchor = product-truth risk (Agent 10 §H #1).

### Execution readiness
- **Safe to execute**: 0132 (sankalp slot structural add + 9 rows, with verb-register PASS); 0135 growth-scoped principle adds (51 rows); Phase B Growth W2 12-row ingestion
- **Needs founder ACK**: G-1 (9-row growth sankalp selection vs Agent D Group 1 intent — 26 candidate sankalps); D5/G-7 (dual-use `yoga_abhyasa_steady_return` + `yamas_satya_clean_truth` in clarity AND growth principle — same class surface, strict §5.7.5); G-8 (Agent F's 8 growth-targeted Niti rows — 5 work_career doctrinally allowed, 3 money_security not); C14 (growth anchor context-awareness — either promotion logic or 3 additional anchors); I10 (Rule 5 hint weight for sankalp anchor context-sensitivity)

---

## Room — joy

### Class profile (from doctrine)
- **Primary**: sankalp (3 subslots: gratitude / blessings / seva)
- **Secondary**: mantra
- **Light**: wisdom_banner
- **Excluded**: practice (joy does not need procedure), principle
- **Dominant traditions**: Bhakti (Kṛṣṇa/Rāma/Lakṣmī rasa), Upaniṣad-ānanda (Taittirīya)
- **BG**: NEAR-EXCLUDED (Ch 2.47 for work_career only)
- **Allowed contexts**: self, relationships, purpose_direction, daily_life, health_energy + work_career secondary
- **Excluded contexts**: money_security

### Pool counts per class

| Class | Current live (0120) | Post-ingestion (+ 0132-0135) | Post-authoring (Phase B) |
|---|---:|---:|---:|
| mantra | 6 | 6 | 6 |
| practice | 0 | 0 | 0 (doctrinally excluded) |
| sankalp (3 subslots) | 19 (gratitude 6 + blessings 6 + seva 7) | 19 | **19 + 13 W2 = 32** (Joy-work 7 + Joy-health 6) |
| principle | 0 | 0 | 0 (doctrinally excluded) |
| wisdom_banner | 4 | 8 | 8 |
| wisdom_teaching | 0 | 0 | 0 (v1.1 gated per 0129) |
| wisdom_reflection | 0 | 0 | 0 |
| **Total** | **29** | **33** | **~42** (V3 reports sankalp=16; direct 0120 count yields 19; ±3) |

### Tradition distribution post-authoring (sankalp + banner)

| Tradition | Rows |
|---|---:|
| Bhakti (banner) | 1 existing + 4 W2 = 5 (SOFT_FAIL vs 3-4 band — D10/G-4 founder ACK needed) |
| Upanisad-ānanda (mantra anchor) | 1 (purnamadah) |
| BG (2.47 karma-yoga × work_career) | 1 existing + 7 W2 joy-work = 8 (sparse per doctrine, but now concentrated on joy × work_career sankalps) |
| Bhāgavata deha-devālaya (W2 joy-health) | 6 sankalps |
| Vedic stotra / Kṛṣṇa / Rāma / Lakṣmī | mantras + existing sankalps |
| Yoga-Sūtras santosha / Sankhya witness | 2 banner (light) |
| Yamas / Niti / Shaiva | 0 (doctrinal exclusion HELD) |

### Life_context × class differentiation prediction

| life_context | class that varies | class that stays same | material-variation verdict |
|---|---|---|---|
| daily_life | mantra (4) + sankalp (13) + banner (2) | — | **GREEN** (strongest — all 3 subslots represented) |
| self | mantra (3) + sankalp (10) + banner (2-3) | — | **GREEN** |
| relationships | mantra (2) + sankalp (10) + banner (1-2) | — | **GREEN** |
| purpose_direction | mantra (1) + sankalp (3) + banner (1) | — | YELLOW (thinner; seva subslot carries) |
| health_energy | mantra (1) + sankalp (1 → 7 with Joy W2) + banner (0 → 1) | — | **RED→GREEN** via Joy W2 6 sankalps (deha-devālaya register, distinct from Ayurveda-correction) |
| work_career | mantra (0) + sankalp (2 → 9 with Joy W2) + banner (1) | — | **RED→GREEN** via Joy W2 7 karma-yoga-craft sankalps |
| money_security | N/A (excluded) | — | N/A |

### Status summary
- **Newly tagged rows**: 0 at joy (W1b doesn't target joy)
- **Newly authored rows (uncommitted)**: 13 (Joy W2 — 7 work_career + 6 health_energy)
- **Not yet ingested (in tag patches, inert)**: 13 Phase B rows pending 0136/0137
- **Still dark**: banner × work_career (1 row only — `gita_nishkama_karma_as_celebration`); practice intentionally 0
- **Still missing (needs W3 authoring)**: +2-3 Joy banner × work_career (BG 2.47 / 18.46 breadth); existing joy gratitude rows `live_in_gratitude` / `see_goodness` / `welcome_abundance` need uplift to Phase B voice (Agent 10 §I C11)
- **User-visible expected effect after ingestion**: Joy × work_career goes from hollow (2 existing sankalps) to structurally alive (9 sankalps, karma-yoga-craft register rooted in BG 2.47 / 3.7 / 18.46 / 2.50). Joy × health_energy goes from 3 weak rows to 7 body-vitality sankalps with deha-devālaya / prasāda register. Register discipline HELD — "I notice / I bless / I offer" (NOT cultivation's "I practice / I return").

### Execution readiness
- **Safe to execute**: 0135 joy banner adds (4 Bhakti rows); Phase B Joy-work 7-row ingestion; Phase B Joy-health 6-row ingestion
- **Needs founder ACK**: G-4 (Bhakti joy banner at 5 rows vs 3-4 target — soft fail, founder must accept or trim); D7 (abhyanga-as-offering gated row — 1 row at Joy × health_energy with explicit misuse_risk); C11 (existing joy gratitude rows uplift vs retire); D10 (dual-room Bhakti banner tone distinction — shared with Connection)

---

## Cross-room global execution gates

| Gate | Blocks | Priority |
|---|---|---|
| **0136 ingestion migration (TO BE WRITTEN)** | All tag-patch work inert until this lands. W1b 82 rows, LIFE_CONTEXT 215 rows, WAVE1 111/200 rows. | **P0** |
| **0137 surface_eligibility backfill (TO BE WRITTEN)** | 554 master rows silently rejected by runtime filter. | **P0** |
| **Smoke-state conflict resolution** (1/12 vs 12/12 on tip b1ae635c per session handoff 2026-04-20 end) | All migration APPLY gated | **P0** |
| **Runtime BG cap guard in `core/rooms/room_selection.py`** | Cap enforced only at migration time; non-migration pool changes could bypass | P1 |
| **Phase B tagging scope extension** | Agent F/G 82 rows covered by W1b; Agent 6/7 rows (~57 more) not yet | P1 |

## Execution summary — rooms by readiness

- **READY (can execute post-0136 alone; minimal doctrinal ACK)**: Stillness, Release (post-D6), Joy (post-G-4)
- **GATED (critical ACK blocks execution)**: Clarity (D4 + D5), Growth (G-1 + G-7 + G-8 + C14)
- **THIN (accepted-sparse; authoring deferred)**: Stillness (Vedanta breadth W3), Release × daily_life + × work_career (W3 + D6), Growth mantra/practice × underserved-3

---

## Appendix — numerical reconciliation

Some pool counts in this matrix differ slightly from POOL_PLAN_V3 `classes` maps. Reconciliation notes:

- **Joy sankalp**: V3 reports 16. Direct 0120 count = 19 (gratitude 6 + blessings 6 + seva 7). ±3. Not material.
- **Stillness practice**: V3 reports 5 post-ingestion. 0120 rotation_refs count = 6 (anchor + 5). V3 deducts 1 for cross-contamination reconciliation. I use 5 post-ingestion to match V3.
- **Clarity principle pre-ingestion**: V3 reports 5 (anchor + 4 rotation). 0120 rotation_refs count = 4 (anchor + 3). V3 includes `niti_prefer_stability_over_dramatic_reversal` as banner-to-principle promotion via 0134 not pre-existing; I use 4 pre, 64 post.
- **Joy banner post-authoring**: sums to 8 per V3 action_list, but W2 could introduce additional banner-promotion of Joy W2 sankalps. Conservative: 8.

All deltas are ≤ 4 rows and do not change READY/GATED/THIN verdicts.

---

**End of matrix. Not a doctrine document — an operator's view for Wave 2 apply sequencing.**
