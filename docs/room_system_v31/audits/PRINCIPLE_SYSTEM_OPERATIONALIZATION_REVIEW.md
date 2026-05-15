# Principle System Operationalization Review (Wave 2 close)

**Status:** Hard-pass review. No doctrine reopened. English locale only.
**Date:** 2026-04-21
**Scope:** Post-Wave-2 principle inventory, pool composition, family-level operational verdicts, dark-principle prioritization for Wave 3.
**Source canon:** `ROOM_SYSTEM_STRATEGY_V1.md` §5; `WAVE2_FINAL_SYNTHESIS.md` Tables 2-3; `LIBRARY_UTILIZATION_AUDIT_V2.md` §B; `ROOM_TRADITION_ASSIGNMENT_V2.md`; `ROOM_POOL_PLAN_V3.yaml`; migrations 0134/0135; raw YAML row counts in `kalpx/core/data_seed/mitra_v3/principles_*.yaml`.
**Critical caveat:** "Pooled" throughout = pool-plan ROW REFS resolved against migrations 0120 (baseline) + 0134 (clarity expansion) + 0135 (dark-tradition seeds). All Wave 2 authored rows (45 new principles) are in YAML files but **not yet ingested via DB migration** (no 0136 yet). Counts below treat pool-plan ROW REFS as the operational truth, since those are the rows the runtime selector will see post-apply. Dual-room rows (e.g. `yamas_satya_clean_truth` in both clarity and growth) are counted in each room — this inflates per-family sums vs distinct row count.

---

## §A Master principle inventory by tradition family

Raw counts taken directly from `principles_*.yaml` files (`grep -cE "^\s*- principle_id:"`). Pooled counts taken from `ROOM_POOL_PLAN_V3.yaml` per-room `tradition_distribution_wave_1b` blocks + migrations 0134/0135.

| Tradition family | Authored pre-W2 | W2 new authored | Total post-W2 | Pooled pre-W2 | Pooled post-ingestion | Dark count remaining | Utilization % |
|---|---:|---:|---:|---:|---:|---:|---:|
| **BG (Bhagavad Gita)** | 32 | 4 (gita_wave2_release) | 36 | 7 | 22 | 14 | 61.1% |
| **Yoga Sūtras** | 25 | 0 | 25 | 1 | 29* | 0* | 116%* |
| **Sankhya** | 15 (legacy) + 32 (Agent G prior) = 47 | 12 | 59 | 1 | 18 | 41 | 30.5% |
| **Bhakti** | 26 | 11 (connection-axis) | 37 | 1 | 12 | 25 | 32.4% |
| **Dharma** | 24 | 0 | 24 | 5 | 12 | 12 | 50.0% |
| **Nīti** | 16 (legacy) + 50 (Agent F prior) = 66 | 18 | 84 | 2 | 11 | 73 | 13.1% |
| **Dinacharya** | 24 | 0 | 24 | 0 | 17 | 7 | 70.8% |
| **Ayurveda** | 24 | 0 (17 NEW PRACTICES, not principles) | 24 | 0 | 14 | 10 | 58.3% |
| **Yamas / Niyamas** | 27 | 0 | 27 | 0 | 24 | 3 | 88.9% |
| **Other-life-context (creativity / grief / loneliness / parenthood / searching_purpose / student / elder_legacy / deepening / devotional_depth / joy_expansion)** | 90 | 0 | 90 | 14 (per LIBRARY_UTIL §B.2) | 14 (no change) | 76 | 15.6% |
| **TOTAL canonical (rows 1-9)** | 313 | 45 | 358 | 17 | 159 | 185 | 44.4% |
| **TOTAL incl. life-context** | 403 | 45 | 448 | 31 | 173 | 261 | 38.6% |

*YS pooled count of 29 > 25 authored is an artifact of dual-room counting (e.g. `yoga_abhyasa_steady_return` is counted in both clarity AND growth pools per `ROOM_POOL_PLAN_V3.yaml` line 780; `yoga_use_one_truthful_anchor` clarity + stillness banner). Distinct YS rows pooled ≈ 22-23. No dark YS rows remain post-W2.

**Reconciliation note**: `CONTENT_CLASS_AUDIT_V2.md` §A.1 reports 303 principles authored at audit time and `WAVE2_FINAL_SYNTHESIS.md` Table 2 reports 303 + 45 = 348. The 313 pre-W2 figure here is higher because Agent F's 50 Niti rows + Agent G's 32 Sankhya rows (added between V2 audit and W2 close) are now physically present in the wave2 YAML files. Both numbers are correct at their respective snapshots.

**Bottom line**: Of 448 authored principle rows on disk, **173 are pool-bound post-ingestion (≈ 39%)**. **261 remain dark.** That is materially above the founder's "303 authored / 31 pooled / ~115 planned" framing — the post-W2 plan actually pools ~159 canonical rows (more than the 115 the brief expected), but the absolute dark count is still 261 because authored corpus has grown faster than pooling.

---

## §B Per-family operational verdict

### BG — **OVERUSED in growth, DISCIPLINED in clarity, CORRECT in release/joy/stillness/connection**
36 authored, 22 pooled (61% util — highest of the canonical-9). Native home is growth (no cap, 11 rows, dominant alongside Yamas+Dharma). Clarity pool BG = 7/64 = **10.9%**, well under the 25% hard cap (asserted in 0134 lines 194-215 + 0135 lines 258-276). Release = 2 banner rows (BG 2.14 family); joy = 1 banner (karma-yoga × work_career only); stillness = 1 banner (Ch 6.10-15); connection = 0. Doctrine respected room-by-room. **However**: BG has the most "growth principle" rows (11) of any tradition in the room, slightly more than Dharma (8) and well above YS (7) — Yamas/Niyamas at 18 is the only counterweight keeping BG below "primary tradition" status numerically. Within growth × work_career and × purpose_direction, BG dominates the principle-mix at the row level.

### Yoga Sūtras — **OVER-UTILIZED structurally, but operational and load-bearing**
25 authored, ~22-23 distinct pooled (88-92% util). Clarity 18 (28% of clarity principle pool) + growth 6-7 + stillness banner 2 + release banner 1. **No dark YS rows remain.** This is the most efficiently operationalized canonical family. Risk: `yoga_abhyasa_steady_return` and `yoga_use_one_truthful_anchor` are dual-room (clarity AND growth) — fine per §5.7.5 but watch for repeat-fatigue in users who tap both rooms.

### Sankhya — **OPERATIONAL in clarity (native), thin everywhere else; large dark backlog**
59 authored (15 legacy + 32 Agent G + 12 W2 = the largest canonical principle corpus after Niti), 18 pooled (30.5%). Clarity 15 (24% of clarity principle pool — co-dominant with YS 28%), connection banner 1, joy banner 1, release banner 1 (sankhya_witness_before_interpretation). **41 Sankhya rows remain dark.** Doctrine assigns Sankhya to clarity native + sparse light-support elsewhere — but with 41 dark rows, clarity rotation could plausibly absorb +6-10 more for stronger guna/buddhi/ahamkara discrimination breadth, especially for clarity × work_career and clarity × money_security where the selector still has thin bench. The 2 stillness × self rows (`rest_in_the_non_participating_witness`, `kaivalya_is_the_direction_of_stillness`) are the **D2 founder call** — flagged elsewhere as doctrinal violations.

### Bhakti — **NOW OPERATIONAL in connection (native) and joy, BUT with dual-room copy-collision risk**
37 authored, 12 pooled (32.4%). Connection banner 7 (meets 6-8 doctrinal floor exactly), joy banner 5 (1 over 3-4 ceiling — D-C3 founder call). **0 Bhakti principle-class rows in any room** — Bhakti is banner-only across all rooms by doctrine. Dual-room collision: `bhakti_gratitude_keeps_the_heart_open` and `bhakti_offer_the_moment_not_only_the_ritual` are pooled in BOTH connection AND joy banners with identical text (Agent 10 §I.1; D10 founder call). This is structurally allowed by §5.7.5 but text-level distinctness is not present. **25 Bhakti rows still dark** — particularly the deity-rasa (Lakṣmī, Hanumān) breadth that could differentiate joy rotation by deity register.

### Dharma — **OPERATIONAL primarily through growth Tier-2 substrate**
24 authored, 12 pooled (50%). Growth principle 8 (Dharma Tier-2 substrate), clarity principle 3 (dual-tagged), connection banner 1 (existing dharma_community_as_seva). 12 dark — mostly non-Tier-2 rows that are not load-bearing. This family is operationally sufficient for its doctrinal footprint.

### Nīti — **STILL THE LARGEST DARK BACKLOG (73 dark of 84 authored — the worst utilization rate)**
Lowest utilization of any principle family at **13.1%**. 84 authored (16 legacy + 50 Agent F prior + 18 W2 = the LARGEST principle corpus of any single tradition family in KalpX), but only 11 pooled — all in clarity (10 orphan + 1 promoted from banner per migration 0134:108-118). **NONE in growth × work_career secondary** (despite ROOM_TRADITION_V2 §Niti listing growth × work_career as secondary home — D9 flagged this as needing founder review); NONE in any banner outside clarity. The new 18 W2 Nīti rows (clarity × relationships deepen 8 + clarity × purpose_direction 10) are NOT YET POOLED — they're in `principles_niti_wave2.yaml` but not in any DB migration. This is the single biggest "shelf asset" risk in the system. The 73 dark Nīti rows are exactly what the founder warned about.

### Dinacharya — **NEWLY OPERATIONAL post-W2 (was 0% pre-W2 → 17 pooled)**
24 authored, 17 pooled (70.8% — 2nd highest util after Yamas). Growth principle 10 (daily_life substrate), clarity principle 5 (daily_life), connection banner 2. Touches 3 rooms (meets ≥3 doctrinal floor). Strongest dark→operational delta of any family in W2. 7 dark Dinacharya rows remain — likely Wave 3 pickings for clarity × purpose_direction or growth × self.

### Ayurveda — **NEWLY OPERATIONAL across 5 rooms (the broadest family by room-touch)**
24 authored principles + 17 NEW Wave 2 PRACTICES (separate class, in `practices_ayurveda_wave2.json`). 14 principles pooled (58.3%). Touches 5 rooms (release 5, growth 4, clarity 3, stillness 1, connection 1) — most-touched family in the post-W2 system. Hits the ≥3 doctrinal floor. **Note**: doctrine actually says Ayurveda in joy is "1 gated row" (abhyanga-as-offering, D7 / C8 founder call) — currently not pooled. 10 dark Ayurveda principles remain — `ayur_kapha_move_morning_inertia`, `ayur_pitta_cool_midday_heat` and similar context-sharp rows that could deepen growth × health_energy or release × daily_life rotation.

### Yamas / Niyamas — **MOST OPERATIONALIZED FAMILY (88.9% util)**
27 authored, 24 pooled. Growth principle 18 (the dominant substrate per §Growth doctrine), clarity principle 4 (relationships satya + ahimsa, work_career asteya), release banner 2 (aparigraha × money_security). **Only 3 rows dark.** This family went from 0% pre-W2 to nearly fully operational in one wave. The W2 dark→operational uplift here is the single largest in the system. Watch: dual-room placement of `yamas_satya_clean_truth` (clarity + growth) is documented as intentional with context-different biasing — but the row text is identical and may need surface-differentiated copy.

### Other-life-context (creativity / grief / loneliness / etc.) — **MOSTLY DARK**
90 authored, 14 pooled (15.6% — second-worst utilization after Niti). Per LIBRARY_UTILIZATION_AUDIT_V2 §B.2: deepening 4 pooled (44%), joy_expansion 4 (40%), loneliness 3 (37%), searching_purpose 2 (22%), grief 1 (9%). **Zero pooled**: creativity (8 rows), devotional_depth (10), elder_legacy (8), parenthood_partnership (9), student (8) — 43 rows entirely on the shelf. None of these were touched in Wave 2. The grief and loneliness families in particular are conspicuous: room_release and room_connection were the rooms with the largest doctrinal uplifts in W2, yet the 11 grief and 8 loneliness life-context principles already authored remain at 9% / 37% util respectively.

---

## §C Rooms still under-principled after Wave 2

| Room | Doctrinal principle role | Pool depth post-W2 | Verdict | Rotation breadth verdict |
|---|---|---|---|---|
| **Stillness** | NO principle slot (correct — pre-cognitive) | 0 principle rows (asserted in pool plan line 197-199) | DOCTRINE-CORRECT | Banner-only loop is 4 rows wide — Agent 10 §F.2 + Wave 2 synthesis flag this as "rote on frequent return" |
| **Connection** | NO principle slot (correct — bhakti-banner-only) | 0 principle, 7 bhakti banners | DOCTRINE-CORRECT structurally | Banner depth meets 6-8 floor; principle-class is by design absent |
| **Release** | Banner-only (BG 2.14 + Yamas aparigraha + Vedanta-witness) | 2 BG banners, 2 Yamas banners, 1 Vedanta banner = **5 principle banners** + 5 Ayurveda body-system banners = 10 total | THIN — banner depth marginal for 6 contexts | Banner has 5 distinct principle-tradition rows for a 6-context room — release × work_career still served by 1 banner only (Wave 2 thin-gap register P0). Banner depth = OK for normal grief, weak for prolonged-return user. |
| **Clarity** | PRINCIPLE-PRIMARY (native) | **64 rows** (sankhya 15 + YS 18 + niti 11 + BG 7 + dharma 3 + yamas 4 + ayurveda 3 + dinacharya 5) | OPERATIONAL — strongest pool in the system | **Per-context rotation depth varies sharply.** work_career 14, purpose_direction 12, relationships 10, daily_life 10, self 10 (acceptable). **health_energy 6, money_security 2** — both THIN per ROOM_POOL_PLAN_V3 line 643-644. Money_security is the worst-served context in clarity. |
| **Growth** | PRINCIPLE + SANKALP CO-PRIMARY | **58 principle rows** (yamas/niyamas 18 + BG 11 + dinacharya 10 + dharma 8 + YS 7 + ayurveda 4) | OPERATIONAL — co-primary slot delivered | Per-context: daily_life 18, self 12, purpose_direction 12, work_career 10 (good); **relationships 6, health_energy 6, money_security 3** — money_security is anaemic. Banner only 4 rows wide. |
| **Joy** | NO principle slot (correct — over-explanation risk) | 0 principle rows | DOCTRINE-CORRECT | Banner = 5 bhakti + 3 light = 8 (dual-room copy-collision flagged in §B above) |

**The 3 most under-principled rooms (judged on principle-class depth, not banner depth):**
1. **Stillness** — banner loop only, 4 rows wide; founder's own framing flagged Vedanta-sākṣin authoring as needed but no Wave 2 work.
2. **Release** — principle-banner only, 5 principle-tradition rows total; for a room serving 6 life-contexts and a high-emotion state, the banner thinness is felt on repeat. Release × work_career has 1 banner row; release × daily_life has 0 principle banners.
3. **Clarity × money_security & × health_energy** — clarity is principle-primary by doctrine and the strongest pool overall (64 rows), but those two contexts get only 2 and 6 rows respectively. A user in clarity-money state gets near-zero principle differentiation.

---

## §D Principle family × room dominance table (post-W2 pool)

Each cell = principle-class row count from `ROOM_POOL_PLAN_V3.yaml` per-room `tradition_distribution_wave_1b` blocks + 0134/0135 ADDITIONS. **`-`** = doctrinally excluded. **`B`** = banner only (no principle slot). **`P+B`** = both principle and banner.

| Tradition | Stillness | Connection | Release | Clarity | Growth | Joy |
|---|---:|---:|---:|---:|---:|---:|
| **BG** | 1 (B sparse) | 0 | 2 (B sparse) | 7 (P) | 11 (P) + 1 (B) | 1 (B sparse) |
| **YS** | 2 (B) | 0 | 1 (B) | 18 (P) + 2 (teaching) | 7 (P) | 1 (B) |
| **Sankhya** | 0 (D2 dispute on +2) | 1 (B existing) | 1 (B) | 15 (P) | 0 | 1 (B) |
| **Bhakti** | 0 | **7 (B)** | **0 ✗ doctrinal exclude** | **0 (no P slot, doctrine)** | 0 | **5 (B)** |
| **Dharma** | 0 | 1 (B existing) | 0 | 3 (P) | 8 (P) | 0 |
| **Nīti** | 0 | 0 | 0 | **11 (P)** | 0 ⚠ | 0 |
| **Yamas/Niyamas** | 0 | 0 | 2 (B aparigraha) | 4 (P) | **18 (P) + 2 (B)** | 0 |
| **Ayurveda** | 1 (B vāta) | 1 (B health) | 5 (B) | 3 (P) | 4 (P) | 0 (1 deferred) |
| **Dinacharya** | 0 | 2 (B daily) | 0 | 5 (P) | 10 (P) + 1 (B) | 0 |

**Doctrine-violation candidates:**
- **None hard-violating.** Stillness has 0 principle rows (PASS); connection has 0 principle rows (PASS); joy has 0 principle / 0 practice (PASS); release has banner-only (PASS); clarity has 0 sankalp (PASS — Gita 2.63 trap); release Bhakti = 0 (PASS).
- **Sankhya 1 release banner row** (sankhya_witness_before_interpretation per migration 0135 line 91) — release doctrine excludes Sankhya as "too analytical"; this is **on the edge** but is in the banner role only, may be defensible as Vedanta-witness adjacency (ROOM_POOL_PLAN_V3 line 422 tags it as `vedanta_sakshin: 1`). Not a hard violation but worth founder eye on D2-adjacent.
- **Niti 0 in growth × work_career secondary** — D9 founder call. Doctrine §Niti calls for growth × work_career as secondary home. Currently zero Niti in growth.

**Dominance check:**
- Clarity dominant traditions = Sankhya (15) + YS (18) + Niti (11) = 44/64 = **68% analytical-discernment** (per pool-plan line 636). BG 10.9%. Doctrine satisfied.
- Growth dominant = Yamas/Niyamas (18) + BG (11) + Dharma (8) = 37/58 = **64% primary substrate**. Doctrine satisfied. BG is the largest single tradition but the substrate trio holds.

---

## §E The 261 still-dark principles — Wave 3 priority assessment

Of the 261 dark canonical+life-context principles after W2 ingestion (per §A bottom line), priorities for Wave 3 authoring/pooling:

### Priority 1 — Tradition-family doctrine gaps
**Niti × growth × work_career secondary** (currently 0 rows pooled despite doctrine assigning growth secondary to Niti per ROOM_TRADITION_V2 §Niti). Pull **5-8** rows from the 73 dark Niti corpus. **Hard count: ≥5 Niti rows for growth × work_career.**

### Priority 2 — Rotation-breadth shortfalls (per ROOM_POOL_PLAN_V3 thin-context cells)
1. **Clarity × money_security**: currently 2 rows. Pull **3-5** more — Niti pragmatic-money-discernment from the 73-row dark Niti corpus is the obvious source.
2. **Clarity × health_energy**: currently 6. Pull **3-4** more — Ayurveda-clarity from the 10 dark Ayurveda rows.
3. **Growth × money_security**: currently 3 principle rows. Pull **2-3** more — Yamas santosha / Dharma-tier-2 / dark Niti.
4. **Growth × relationships / × health_energy**: 6 rows each. Pull **2-3** more from Dharma + dark Yamas.
5. **Stillness banner**: 4 rows. **Author 2-3 NEW Vedanta-sākṣin** rows (not in current corpus — dark-orphan authoring as Wave 2 synthesis flagged).
6. **Release × work_career banner**: 1 row. **Author 2-3 NEW** BG 2.14 / Yamas-endurance rows.

### Priority 3 — Orphan wisdom (life-context families with authored content)
1. **Grief** (11 authored, 1 pooled = 10 dark). These should be auditioning for release banner / release principle-adjacent uses. Pull **3-4** for release context-routing.
2. **Loneliness** (8 authored, 3 pooled = 5 dark). Connection × purpose_direction has zero practice and only 1 banner — loneliness rows could deepen connection × purpose_direction. Pull **2-3**.
3. **Creativity** (8 authored, 0 pooled). Could anchor a future joy × purpose_direction or growth × purpose_direction rotation. Pull **2-3** if doctrine extension allowed.
4. **Devotional_depth** (10 authored, 0 pooled). Connection rotation breadth — bhakti banner currently has 7; devotional_depth could push to 10-12 for repeat-tolerance. Pull **3-4**.
5. **Searching_purpose** (9 authored, 2 pooled). Growth × purpose_direction or clarity × purpose_direction rotation. Pull **2-3**.

### Priority 4 — Legitimately dark (out-of-doctrine, fine to leave)
- BG dark 14 — many are repetition-of-theme; current 22 pooled meets growth-native breadth. Hold.
- Bhakti dark 25 — most of these are deity-specific deep-cuts; banner pool of 12 is sufficient unless joy-deity-rotation expansion is wanted.
- Yamas dark 3 — fine.
- Dinacharya dark 7 — keep as bench.
- Parenthood_partnership 9 / Student 8 / Elder_legacy 8 — out-of-doctrine for current 6-room model; archive or save for future life-stage rooms.

---

## §F BG discipline final check

| Check | Pre-W2 | Post-W2 | Verdict |
|---|---|---|---|
| BG total pooled | 7 | 22 | Up 3.1× — within plan |
| BG % of clarity principle pool | 3/5 = 60% (pre) | 7/64 = **10.9%** | **HARD CAP 25% HELD with comfortable margin** |
| BG growth principle | 0 (pool) | 11 | Native home — no cap. Yamas/Niyamas (18) > BG (11) so substrate dominance not breached |
| BG release banner | 1 | 2 (added gita_stable_in_sorrow_and_pleasure via 0135) | SPARSE BANNER ONLY — doctrine PASS |
| BG joy banner | 1 | 1 | Sparse karma-yoga × work_career only — doctrine PASS |
| BG stillness banner | 1 (pre-existing) | 1 (gita_endure_the_passing_contacts) | LIGHT — Ch 6.10-15-adjacent — doctrine PASS |
| BG connection | 0 | 0 | EXCLUDED — doctrine PASS |
| BG cap runtime guard | not present | not present (only migration-time assertion in 0134:194-215, 0135:258-276) | I1 hygiene gap — runtime BG cap guard missing per WAVE2_FINAL_SYNTHESIS I1 |

**BG discipline final verdict: HELD.** The 25% clarity hard cap is honored with 14.1 percentage points of headroom. BG growth presence is below Yamas/Niyamas substrate as doctrine intends. BG release is banner-only as required. No BG row pooled in any room where doctrine excludes BG. **The only soft risk** is that the cap is enforced only at migration time — a future direct-pool edit could bypass it. I1 (runtime guard) needs to land before Wave 3.

---

## §G Bhakti / Yamas / Ayurveda / Dinacharya activation check

These four were 0%-pooled pre-W2; founder lock required all four to come alive post-W2 with ≥ 3-room touch.

| Family | Rooms touched post-W2 | Floor (≥3) met? | Rotation breadth (≥2 per target cell)? | Thinness risk |
|---|---:|---|---|---|
| **Bhakti** | 2 (connection + joy) | **✗ Below floor** | Connection 7 banner / joy 5 banner — both have ≥2 | Doctrinally bhakti is excluded from clarity, release, growth, stillness — so the 2-room touch is doctrine-correct, not a gap. The "≥3 floor" rule from the brief implicitly assumed broader latitude than doctrine actually allows. **Verdict: doctrine-bound at 2 rooms.** |
| **Yamas / Niyamas** | 3 (growth + clarity + release) | ✓ Met exactly | Growth 18 (deep), clarity 4 (relationships 3, work_career 1 = barely 2 per target cell), release 2 (money_security only) | Clarity × work_career has 1 Yamas row (asteya_not_stealing_credit) — single-row cell = thinness risk. Wave 3 should add 1 more (e.g. ahimsa-toward-self in work context). |
| **Ayurveda** | 5 (release + growth + clarity + stillness + connection) | ✓ Most-touched family | Release 5 (good), growth 4 (good), clarity 3 (good), stillness 1 (single-row), connection 1 (single-row) | Two single-row cells (stillness + connection). Doctrine intends "light" support for both, so 1 row may be acceptable but creates banner-fatigue if the same Ayurveda banner repeats. **Recommend +1 each** in Wave 3. |
| **Dinacharya** | 3 (growth + clarity + connection) | ✓ Met exactly | Growth 10 (deep), clarity 5 (good), connection 2 (acceptable for banner) | Healthy — no thinness cells. |

**Aggregate verdict**: All four traditions cleared the activation gate. Yamas and Dinacharya are now the cleanest "dark→operational" stories in W2 (24 / 27 and 17 / 24 utilization). Bhakti is doctrine-bound to its 2-room footprint. Ayurveda is the most broadly touched but has 2 thin single-row cells.

---

## §H Ruthless priority list for principle Wave 3 authoring/pooling

Tight 5-item list, ranked by founder-leverage (move 1 = the single act that retires the most "shelf-asset" risk).

1. **POOL the 18 W2 Niti rows + 12 W2 Sankhya rows + 11 W2 Bhakti rows + 4 W2 Gita rows that are AUTHORED BUT NOT IN ANY MIGRATION** (45 rows). Write `0136_pool_wave2_principles.py` so the new authored material actually reaches the runtime selector. Without this, the entire Wave 2 principle authoring was net-zero at runtime. **This is not new authoring — it is ingestion of existing work.** Single largest leverage.

2. **AUTHOR 5-8 new Niti rows for growth × work_career secondary** (closes the D9 doctrine-secondary-home gap; Niti is the largest dark backlog at 73 rows but most are clarity-flavored — the growth × work_career bench is genuinely empty and doctrine-required).

3. **AUTHOR 2-3 new Vedanta-sākṣin banners for stillness** (closes the stillness-rote-loop problem flagged twice in Wave 2 synthesis; this is dark-orphan authoring — corpus does not currently have these rows).

4. **AUTHOR 3-5 new Niti / Yamas-aparigraha rows for clarity × money_security** (closes the worst per-context cell in the strongest principle room — clarity has 64 rows but only 2 reach money-security users).

5. **POOL 8-12 dark life-context principles** — specifically grief × release (3-4 rows from the 10 dark grief), loneliness × connection × purpose_direction (2-3 from the 5 dark loneliness), devotional_depth × connection rotation breadth (3-4 from the 10 dark devotional_depth). These are already authored, doctrine-friendly, and would lift the orphan-wisdom utilization from 15.6% toward 30%.

---

## Appendix — Traceability

- Authored row counts per file: `grep -cE "^\s*- principle_id:" /Users/paragbhasin/kalpx/core/data_seed/mitra_v3/principles_*.yaml`
- Pre-W2 pool counts: `LIBRARY_UTILIZATION_AUDIT_V2.md` §B.1 + §B.2
- Post-W2 pool composition: `ROOM_POOL_PLAN_V3.yaml` per-room `tradition_distribution_wave_1b` blocks
- Migration ADDITIONS dictionaries: `0134_expand_clarity_principle_pool.py` lines 71-128; `0135_seed_dark_tradition_principles.py` lines 61-194
- BG cap enforcement sites: `0134_expand_clarity_principle_pool.py` lines 194-215; `0135_seed_dark_tradition_principles.py` lines 258-276
- Doctrine source: `ROOM_TRADITION_ASSIGNMENT_V2.md` (entire file, founder-locked 2026-04-21)
- Wave 2 synthesis numbers: `WAVE2_FINAL_SYNTHESIS.md` Tables 2-3 + §1.4
- Soft-fail items: bhakti joy banner 5 vs 3-4 (D-C3); Niti × growth × work_career 0 (D9); Bhakti dual-room copy collision (D10)
