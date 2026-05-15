# Wave 2 Final Synthesis — Room System v3.1.1

**Status:** FOUNDER-REVIEW-PENDING
**Date:** 2026-04-21
**Locale scope:** English (en) only
**Supersedes/extends:** `WAVE1_SYNTHESIS.md` (locks still hold)
**Upstream doctrine:** `ROOM_SYSTEM_STRATEGY_V1.md` §1 §5 §5.7.5 §8

This is the single integrated operating view after Wave 2 content-first operationalization: Phase A (governance tagging + pool plan V3 + life_context patch), Phase B (125 new authored rows across 8 seed files), Phase C (integrity review + surface isolation re-audit + variation review). It consolidates 10 agent outputs into one document the founder can act from.

---

## Executive summary

**Three room-level verdicts (Agent 8 + Agent 10 converge):**

- **Release is now EMBODIED.** 17 Ayurveda practices with Caraka/Suśruta/Vāgbhaṭa anchors, vāta/pitta/kapha named explicitly. Not generic relaxation with Sanskrit labels.
- **Clarity is now CONTEXT-DIFFERENTIATED.** Niti (pragmatic discernment) vs Sankhya (puruṣa-prakṛti viveka) operate as genuinely distinct discrimination moves in the same contexts. Work_career ≠ self ≠ money_security at the text level, not just the tag level.
- **Growth is now CO-PRIMARY.** Principle substrate + sankalp resolve pair correctly; cultivation register holds across relationships/health/money; soul change delivered.

**Two rooms still underpowered:**

- **Stillness** — structurally intentional but feels a 4-row banner loop. Needs +2-3 Vedanta-sākṣin rows (dark-orphan authoring) to prevent rote-feeling on frequent return.
- **Connection** — principle layer (11 new Bhakti rows) lands well, but practice pool stays at 3 rows. Connection × purpose_direction and × health_energy have strong principle rows but zero practice — body-feel hasn't deepened.

**Register discipline:** 0 violations across all Phase B authoring (Agent 8 confirms). Joy/growth/connection/release registers held cleanly.

**The 4 known founder calls — direct answers (Agent 9 rendered judgments):**

| # | Founder call | Verdict |
|---|---|---|
| D1 | Backfill Agent G's 32 Sankhya source YAML rows | **Source rows still empty**; TAG_PATCH_WAVE1B covers them but no DB ingestion migration exists. Needs 0136 ingestion migration. Default: proceed with backfill. |
| D2 | 2 Sankhya stillness × self rows conflict with §Stillness avoid-list | **CONFIRMED VIOLATION** on strict reading. Recommendation: reclassify to clarity × self (Agent 8 concurs). |
| D3 | `mantra.shivoham` in stillness rotation | **REAL PROBLEM.** Shaiva bija in Shaiva-excluded room. Pre-existing 0120 seed — founder call on swap or retain as sanctioned exception. |
| D4 | TAG_PATCH_WAVE1 true completeness | **DEFINITIVE: 111/200 (55.5% complete).** Groups 5-9 never authored (89-row gap covering Sankhya+YS 36, Gita orphans 10, Joy subslot+Bhakti joy 15, Connection Bhakti 7, Group 9 unnamed). |

---

## Section 1 — The 12 founder questions, directly answered

### 1.1 What is now complete

- **Phase A (doctrine/governance layer)** — 6 artifacts on disk, committed
- **Phase B (authoring layer)** — 8 new seed files (uncommitted, curator-gated) with 125 new rows
- **Phase C (review layer)** — 3 review artifacts on disk
- **Wave 1 synthesis + 12 V2 audits** — committed

### 1.2 What was tagged

| Patch | Rows | Status |
|---|---:|---|
| TAG_PATCH_WAVE1.yaml (from last session, pre-Wave-2) | **111 actually / 200 claimed** | Groups 1-4 authored; 5-9 gap |
| TAG_PATCH_WAVE1B.yaml (Agent 1, new) | 82 | F's 50 Niti + G's 32 Sankhya, inline v3.1 governance |
| LIFE_CONTEXT_TAG_PATCH.yaml (Agent 3, new) | ~215 pool-eligible rows | Density rules applied (45 sparse / 131 moderate / 30 dense / 14 stillness-universal) |

Gap: 554 master mantra/sankalp/practice rows still carry `surface_eligibility: []`. Runtime filter rejects them silently. P1 backfill in Wave 1c.

### 1.3 What was pooled (ROOM_POOL_PLAN_V3 action list)

156 concrete ops across 6 rooms + 82 tag_row ops (W1b) = 238 total. Per-room distribution: stillness 3, connection 13, release 11, clarity 57, growth 64, joy 8. 16/17 doctrinal minima pass (1 soft-fail on bhakti joy banner 5 vs 3-4 target). Migrations 0132-0135 draft — not yet applied. No DB ingestion migration for the tag patches; they are INERT until 0136 (proposed).

### 1.4 What was newly authored

Phase B — 125 rows across 8 seed files + 2 index docs:

| File | Rows | Intent |
|---|---:|---|
| `principles_niti_wave2.yaml` | 18 new (appended to F's 50 = 68 total) | clarity × relationships deepen (8) + clarity × purpose_direction (10) |
| `principles_sankhya_wave2.yaml` | 12 new (appended to G's 32 = 44 total) | rotation breadth for health/money/purpose/daily (3 each) |
| `principles_bhakti_wave2.yaml` | 11 | connection × purpose_direction (5) + × health_energy (4) + × relationships (2) |
| `principles_gita_wave2_release.yaml` | 4 | BG 2.14-family sparse banners for release |
| `practices_ayurveda_wave2.json` | 17 | vāta/pitta/kapha-aware, Caraka/Vāgbhaṭa/Suśruta anchored |
| `sankalps_joy_work_career_wave2.json` | 7 | karma-yoga-craft (BG 2.47 framed) |
| `sankalps_joy_health_energy_wave2.json` | 6 | joy-rasa body-vitality, offering register |
| `sankalps_growth_wave2.json` | 12 | growth × relationships (4) + money_security (4) + health_energy (4) |

All `status: draft`, all `CURATOR_GATE: true`, all carry v3.1 governance fields inline (lesson from F/G's missing-field retrofit).

### 1.5 What each room now relies on BY CONTENT CLASS

See Table 1 below.

### 1.6 What each room now relies on BY TRADITION

See Table 3 below.

### 1.7 Which contexts now materially affect output

**Materially affecting (6 RED→GREEN upgrades per Agent 10):**
- Connection × purpose_direction (5 Bhakti rows)
- Connection × health_energy (4 Bhakti rows)
- Growth × relationships (4 sankalps)
- Growth × health_energy (4 sankalps)
- Joy × work_career (7 karma-yoga sankalps)
- Joy × health_energy (6 joy-rasa sankalps)

**Partially affecting (4 RED→YELLOW):**
- Release × work_career (1 banner, no sankalp/practice)
- Growth × money_security (4 sankalps, no mantra/practice)
- Clarity × purpose_direction (3 Sankhya added, but principle only)
- Clarity × money_security / × health_energy (principle GREEN; mantra/practice still RED)

### 1.8 Which contexts still do not affect output enough

**Stays RED (Agent 10):**
- Release × daily_life — no authoring
- Release × work_career (overall, pending doctrine call D6)

**Implementation-blocked:**
- Every tagged-but-not-ingested row. Until migration 0136 (ingestion) exists, Rule 5 cannot discriminate on any tag-patch data regardless of how well it's authored.

### 1.9 Which rooms now feel truly differentiated

**Alive:** Release · Clarity · Growth (Agent 10 consensus).

Evidence:
- Release: 17 Ayurveda practices with body-system specificity (vata_pacifying / pitta_pacifying / kapha_lifting) anchored to śāstra; aparigraha-in-identity banner for money-grief; BG 2.14 endurance register for reputation-grief.
- Clarity: Niti-register (pragmatic-minister discernment) and Sankhya-register (seer vs seen viveka) hold as distinct voices in the same contexts. Clarity × work_career ≠ clarity × self at the sentence level.
- Growth: 9 sankalps + 56 principles co-operating; cultivation register ("I practice / I return") holds across new contexts.

### 1.10 Which rooms still feel underpowered

**Thin:** Stillness · Connection (with caveat) · Release × work_career/daily_life

- Stillness — 4 banner rotation loops feel rote on repeat. Needs +2-3 Vedanta-sākṣin authoring.
- Connection — principle+banner layers strong post-W2, but practice pool 3 rows for 5 contexts; Dhanvantari/body-bhakti practices (not just principles) remain a gap.
- Release × work_career — 1 banner only (Agent 7 doctrine-compliant hybrid). Still thin for users grieving professional collapse.

### 1.11 Remaining founder calls

See Table 5 (Founder decision register) — 23 items categorized as doctrinal (10) / curation (15) / hygiene (13).

### 1.12 What is safe to execute without founder review

- TAG_PATCH_WAVE1B.yaml can be used as the basis for a 0136 ingestion migration (all 82 rows carry clean governance fields; curator_gate flags handled downstream)
- LIFE_CONTEXT_TAG_PATCH.yaml can likewise be ingested as-is
- Phase B authored rows (125 rows across 8 files) are doctrine-compliant per Agent 8 integrity review (0 register violations; 18 A / 2 B / 1 C with the C being the 2 Sankhya stillness × self rows that already have a documented founder call)
- Runtime hardening (hygiene items I1/I2/I3) does not require doctrine — it's invariant enforcement of existing strategy

Do NOT execute without founder ACK:
- Any decontamination of `mantra.shivoham` or reclassification of the 2 Sankhya stillness × self rows (D2, D3)
- Completing TAG_PATCH_WAVE1 groups 5-9 (D4 — may need re-scoping)
- Migration apply order 0132 → 0135 (C1, C2, C3, C4 founder calls block)

---

## Table 1 — Room operational end-state

| Room | Primary class | Secondary class | Light class | Excluded class | Dominant traditions | Allowed contexts | What varies by context | What stays stable |
|---|---|---|---|---|---|---|---|---|
| **Stillness** | practice | mantra | wisdom_banner (sparse) | sankalp, principle | YS, Vedanta-sākṣin; LIGHT Ayurveda vāta | none (universal) | nothing (by design) | the sacred silence; soham anchor; belly-breathing posture |
| **Connection** | mantra | practice | wisdom_banner | sankalp, principle (except BG 18.66 banner) | Bhakti (Nārada/Bhāgavata), Dinacharya devotional-daily, BG Ch 12 secondary | relationships, self, daily_life, purpose_direction + health_energy secondary; EXCLUDE work_career + money_security | banner tradition (Dhanvantari for health, guru-bhakti for purpose, Rāma for relationships, Kṛṣṇa for self) | mantra anchor (Om Namo Bhagavate Vasudevaya); anahata-practice family |
| **Release** | practice (somatic) | mantra (Shaiva) | wisdom_banner (very sparse) | sankalp, principle | Shaiva/Tantric, Ayurveda (native primary); BG 2.14 sparse; Yamas aparigraha | relationships, self, health_energy, money_security, daily_life, work_career; EXCLUDE purpose_direction | Ayurveda-dosha register for health; aparigraha register for money; endurance register for work_career (banner only) | bhramari practice anchor; maha_mrityunjaya mantra anchor |
| **Clarity** | principle | practice | wisdom_teaching | sankalp (Gita 2.63 trap), heavy mantra | Sankhya, Yoga-Sūtras (native); Niti; Dharma-relationships; BG ≤ 25% HARD CAP | ALL 7 | principle tradition (Niti=work/money, Sankhya=self/health, YS=scatter, Dinacharya=daily) | sankhya_freedom_grows_with_discrimination anchor; centering_drishti practice |
| **Growth** | principle + sankalp (CO-PRIMARY) | practice | wisdom_reflection | (none — all classes admissible) | BG (native home), Dharma Tier-2, Yamas/Niyamas (substrate), YS abhyāsa, Ayurveda, Dinacharya | ALL 7 | sankalp resolve (for relationships/health/money/purpose/daily/work/self); principle tradition (Yamas × self vs Dinacharya × daily) | gita_svadharma_is_what_you_have principle anchor; honor_my_skill sankalp anchor (but see feel gap 1) |
| **Joy** | sankalp (3 subslots: gratitude/blessings/seva) | mantra | wisdom_banner | practice, principle | Bhakti (Kṛṣṇa/Rāma/Lakṣmī rasa), Upaniṣad-ānanda | self, relationships, daily_life, purpose_direction, health_energy + work_career secondary; EXCLUDE money_security | sankalp subslot (gratitude vs blessing vs seva) + Bhakti deity (Kṛṣṇa for self, Lakṣmī for prosperity-adjacent, Rāma for relationships) | purnamadah mantra anchor; 3-subslot structural form |

---

## Table 2 — Content-class operationalization

| Class | Authored (pre-W2) | Pooled (pre-W2) | Newly authored in W2 | Newly tagged for pool (W1b + LIFE_CONTEXT) | Utilization % (pooled/authored post-W2) | Life_context coverage | Still dark | Rooms served |
|---|---:|---:|---:|---:|---:|---|---:|---|
| **Mantra** | 200 | 25 | 0 | ~25 (life_context bias being added) | 12.5% | sparse (0-2 per row by doctrine) | 175 orphan | Stillness, Connection, Release, Clarity, Growth, Joy (6/6) |
| **Sankalp** | 159 | 8 | 25 (7+6+12) | pool pending ingestion | ~21% (33 pool-intent) | dense (2-5 per row) | ~126 | Growth (9 + 12 new = 21), Joy (16 + 13 new = 29); NOT clarity/stillness/release/connection |
| **Practice** | 195 + 17 new Ayurveda = 212 | 21 | 17 Ayurveda | pool pending ingestion | ~18% (38 pool-intent) | sparse | 174 | Stillness (5), Connection (3), Release (3 + 8 Ayurveda = 11), Clarity (4 + 2 Ayurveda), Growth (4 + 4 Ayurveda); NOT joy (by doctrine) |
| **Principle** | 303 + 45 new (18 Niti + 12 Sankhya + 11 Bhakti + 4 Gita-release) = 348 | 31 | 45 | 82 via W1b + 60+ via 0134/0135 | ~45% post-W2 (assuming migrations apply + ingestion) | moderate | ~190 | Clarity (64), Growth (56), Connection (0 principle-slot; BG 18.66 banner only), Release (banner only, 2 → 6 rows), Joy (none), Stillness (none) |
| **Wisdom (banner/teaching/reflection)** | draws from principle pool via dual-use §5.7.5 | varies | 4 new Gita-release banners | ~6 rows bhakti-additions | — | moderate | — | All 6 rooms have some wisdom surface |

**Mandatory caveats:**
- All Phase B rows are in the files BUT **none are in the DB pool yet.** Ingestion migration 0136 does not exist.
- TAG_PATCH_WAVE1 is 111/200 — Groups 5-9 never authored (89 row gap).
- 554 master-JSON rows still have `surface_eligibility: []` — silently filter-excluded.

---

## Table 3 — Tradition activation by room

| Tradition | Pre-W1 pooled | Post-W2 planned pool | Rooms touched | Primary home | Secondary home(s) |
|---|---:|---:|---:|---|---|
| **Bhagavad Gita** | 7 | 23 (7 + 12 growth + 4 release banner) | 4 (held ≤ 10.9% in clarity) | Growth (native) | Clarity (tight verse set 2.47/3.35/18.47), Release (Ch 2.14 sparse banner), Joy (Ch 2.47 work_career only) |
| **Yoga Sūtras** | 1 | 25 (clarity 18 + growth 6 + stillness 1) | 3 | Clarity (kleśa/citta-vṛtti), Stillness (dhyāna) | Growth (abhyāsa/tapas) |
| **Sankhya** | 1 | 15 core + 44 W2 authored (32 + 12) = 59 authored-ready; clarity pool will absorb 15 | 2 | Clarity (viveka, native) | Stillness × self (CONFLICT — §Stillness avoid-list; 2 rows under founder call D2) |
| **Bhakti** | 1 principle (+ many mantras) | ~18 (7 connection banner + 5 joy banner + 11 new W2 connection) | 2 | Connection (native) | Joy (light banner only) |
| **Dharma** | 5 | 13 (3 clarity dual + 10 growth Tier-2) | 2 | Growth (Tier-2 substrate) | Clarity (dual-use) |
| **Nīti** | 2 | 13 pool + 68 authored-ready (50 F + 18 Agent 4) | 2 | Clarity (discernment, native) | Growth × work_career (secondary) |
| **Dinacharya** | 0 | 17 (growth 10 + clarity 5 + connection 2) | 3 | Growth (daily_life primary) | Clarity (daily_life), Connection (devotional-daily) |
| **Ayurveda** | 0 | 14 principle + 17 practice = 31 | 6 (all rooms touched via banner or practice) | Release (health_energy primary) | Growth (health_energy), Clarity, Stillness, Connection (light), Joy (1 gated row — abhyanga-as-offering) |
| **Yamas/Niyamas** | 0 | 24 (growth 18 + release 2 + clarity 4) | 3 | Growth (primary substrate) | Release (aparigraha × money_security), Clarity (satya/ahimsa × relationships) |
| **Upaniṣad-ānanda** | indirect (via Bhakti banners) | stays indirect | 1 | Joy (banner light) | — |

**Three 0%-pooled dark traditions now operational:** Yamas, Ayurveda, Dinacharya — each touches ≥ 3 rooms. **Doctrinal target met** (founder lock: these must come alive post-W2).

**BG discipline held:** Clarity principle pool BG count = 7/64 = 10.9% (≤ 25% hard cap; assertion coded in migration 0134:194-215 + 0135:258-276). Growth (BG native home) has 11-12 BG principle rows + 4 BG banners = no over-dominance in context. Release BG is banner-only. Joy BG is karma-yoga × work_career only. Stillness/Connection have no BG.

---

## Table 4 — Remaining thin-gap register

| Room | Context | Class | Tradition | Reason still thin | Solve via | Priority | Agent source |
|---|---|---|---|---|---|---|---|
| Stillness | (universal) | wisdom_banner | Vedanta-sākṣin | 4-row rotation loops feel rote | AUTHORING (+2-3) | P2 | Agent 10 F.2 |
| Connection | purpose_direction | practice | anahata-family + guru-register | 0 practice rows for this context | AUTHORING (+4-6) | P1 | Agent 10 §D-Connection |
| Connection | health_energy | practice | Dhanvantari/body-bhakti | 0 practice rows | AUTHORING (+3-4) | P1 | Agent 10 §D-Connection |
| Release | work_career | (all classes except 1 banner) | BG 2.14 + Shaiva + Yamas | Agent 7 hybrid: 1 banner tagged; sankalp excluded by doctrine | DOCTRINE CALL (D6) + AUTHORING | P0 | Agent 7 §D |
| Release | daily_life | all classes | — | 0 rows | AUTHORING (+3-5) | P2 | Agent 10 E |
| Growth | money_security | mantra, practice | — | 0 rows (sankalp added 4) | AUTHORING (+2-3) | P2 | Agent 10 §D-Growth |
| Growth | relationships / health_energy | mantra | — | 0 growth mantras for these contexts | AUTHORING (+3-4) | P2 | Agent 7 §B |
| Clarity | money_security / health_energy | mantra, practice | — | principle GREEN; mantra/practice 0 | AUTHORING (+4-6) | P2 | Agent 10 §C |
| Clarity | all contexts | mantra | — | mantra life_context_bias not yet tagged | TAGGING (W1c 46-row sweep) | P1 | Agent 1 §D |
| Joy | (all) | mantra | — | mantra × context bias thin | TAGGING | P2 | Agent 3 §B |
| (Global) | (all) | (all) | — | 554 master rows have empty `surface_eligibility` → runtime silently rejects | INGESTION MIGRATION + BACKFILL | P0 | Agent 9 §K |
| (Global) | (all) | principle | all | TAG_PATCH_WAVE1 incomplete (111/200); groups 5-9 missing | AUTHORING (or re-scope) | P0 | Agent 9 §B |
| (Global) | (all) | (all) | — | No ingestion migration for any of the 3 tag patches — they are inert | MIGRATION 0136 | P0 | Agent 9 §K |

**Feel-level gaps (Agent 10 §H):**

| Gap | Severity | Fix |
|---|---|---|
| Growth anchor `honor_my_skill` misaligns for relationships/health/money | High | Anchor-promotion logic per context OR 3 additional context anchors |
| Dual-room bhakti banners identical copy in Connection AND Joy | Medium | Surface-differentiated text OR split into two row_ids per tone |
| `om_shanti` attached as supporting mantra to all 50 Niti rows | Medium | Mantra diversification pass in intervention_links |
| Existing joy gratitude rows (`live_in_gratitude` etc.) noticeably flatter than Phase B authoring | Medium | Uplift existing rows or retire them |
| Stillness 4-row banner loop | High for frequent-return users | +2-3 Vedanta-sākṣin banners (dark-orphan authoring) |

---

## Table 5 — Founder decision register

### Doctrinal founder calls (10)

| # | Item | Default / Recommendation | Source |
|---|---|---|---|
| D1 | Backfill Agent G's 32 original Sankhya source YAML rows with v3.1 fields? | **Proceed with backfill** (TAG_PATCH_WAVE1B covers them; needs 0136 ingestion) | User brief + Agent 1 + Agent 9 |
| D2 | 2 Sankhya × stillness × self rows violate §Stillness? | **CONFIRMED violation** — reclassify to clarity × self (Agent 8 concurs; Agent 9 confirms on strict reading) | User brief + Agent 9 H.3 |
| D3 | `mantra.shivoham` in stillness rotation (Shaiva-bija) | **CONFIRMED real problem** — founder must decide: swap (to e.g. Vedanta sat-cit-ānanda bija) OR retain as sanctioned exception with override entry | User brief + Agent 9 H.4 |
| D4 | TAG_PATCH_WAVE1 completion — 111/200, Groups 5-9 missing | Founder call on: finish 89 rows OR re-scope Wave 1 to 111 and move forward | Agent 9 H.1 DEFINITIVE |
| D5 | §5.7.5 dual-use: same principle, 2 rooms, same surface — allowed? | Affects `yoga_abhyasa_steady_return` (clarity + growth principle) and `yamas_satya_clean_truth` (clarity + growth principle). Agent 2 G-7. Default: treat as sanctioned per §5.7.5 if life_context_bias differs; else add override entries. | Agent 2 G-7 |
| D6 | Work-grief routes via RELEASE or CLARITY? | Agent 7 interpreted as hybrid (1 release banner + clarity Niti for metabolized phase). Founder can confirm or override. | Agent 7 §D |
| D7 | Joy × health_energy Ayurveda: abhyanga-as-offering (1 gated row) — accept or defer? | Agent 6 authored ONE gated row with explicit misuse_risk. Defer option documented as fallback. | Agent 6 §D |
| D8 | `self` vs `self_devotion` terminology — normalize ROOM_POOL_PLAN_V2 → `self` per STRATEGY_V1 §1? | **Recommend normalize to `self`** (STRATEGY_V1 is authoritative; 18 self_devotion occurrences in V2 are artifact) | Agent 3 E.1 |
| D9 | Niti growth × money routing doctrinally sound? | Agent 10 flagged this — Niti primarily clarity; growth × money Niti may overlap with release × money_security aparigraha | Agent 10 I.1 |
| D10 | Dual-room Bhakti banner tone distinction — enforce or allow identical copy? | Agent 10 found `bhakti_gratitude_keeps_the_heart_open` renders verbatim in Connection and Joy banners; doctrine claims distinct tones but text is identical | Agent 10 I.1 |

### Curation founder calls (15)

| # | Item | Source |
|---|---|---|
| C1 | Growth sankalp 9-row selection vs Agent D's Group 1 intent | Agent 2 G-1 |
| C2 | Clarity BG verse-set (2.47/3.35/18.47-adjacent) acceptable? | Agent 2 G-2/G-8 |
| C3 | Bhakti joy banner at 5 rows vs 3-4 target — accept as slight over? | Agent 2 G-4 |
| C4 | 2-sig on 3 dual-use rows (dina_pre_meeting, dina_sunday_reset, sankhya_witness_before_interpretation) | Agent 2 G-5/G-6 |
| C5 | Agent 4 Niti softening: 4 rows (flattery-as-debt metaphor, tale-carrier framing, etc.) | Agent 4 §5 |
| C6 | Agent 5 Sankhya row `sankhya_rajasic_activation_mimics_vitality` — borderline modern-psychology voice | Agent 5 §5 |
| C7 | Ayurveda release × health practices count 8 vs target 5-6 | Agent 6 §F.2 |
| C8 | `ayur_abhyanga_as_offering` gating — accept or defer joy × health | Agent 6 §D + §F.1 |
| C9 | `kapalabhati` tradition tag correctness | Agent 8 J.2 |
| C10 | `garshana` śāstric-anchor scope | Agent 8 J.2 |
| C11 | Existing joy gratitude rows (live_in_gratitude, etc.) — uplift to Phase B quality or retire? | Agent 10 I.2 |
| C12 | Purpose_direction Bhakti anchor swap — current anchor may be wrong | Agent 10 I.2 |
| C13 | Stillness Vedanta banner authoring — commission new rows? | Agent 10 I.2 |
| C14 | Growth anchor `honor_my_skill` context-awareness — should it rotate by context? | Agent 10 I.2 |
| C15 | 15-row cross-surface (rooms ↔ additionals) blanket resolution | Agent 9 L.2 |

### Implementation hygiene (13)

| # | Item | Source |
|---|---|---|
| I1 | Runtime BG cap guard in `core/rooms/room_selection.py` (beyond migration-only assertion) | WAVE1_SYNTHESIS §5 + Agent 9 K |
| I2 | Runtime assertion rejecting pool rows with empty surface_eligibility | Agent 1 D.1 |
| I3 | Schema-validation CI rejecting new YAML rows missing room_fit / surface_eligibility / pool_role | Agent 1 Rec 3 |
| I4 | Forward-reference resolution — many `draft_link: true` markers across Phase B rows needing target resolution | Agent 4/5/7 |
| I5 | `0136_rewire_ayurveda_intervention_links.py` — 14 existing Ayurveda principles link to placeholder practices; new Wave 2 practices are real targets | Agent 6 §E |
| I6 | `0136_ingest_tag_patches.py` proposed — materializes TAG_PATCH_WAVE1 + W1B + LIFE_CONTEXT_TAG_PATCH into DB (THE KEY GATING MIGRATION) | Agent 9 K.2 |
| I7 | `0137_backfill_surface_eligibility.py` — backfill 554 master rows for runtime pool-eligibility | Agent 9 K.3 |
| I8 | Niti mantra diversification — `om_shanti` attached to all 50 Niti rows causes user-feel saturation | Agent 10 I.3 |
| I9 | Phase B tagging scope extension — POOL_PLAN §G-8 scopes W1b to Agent F/G only; needs extension to Agent 6/7 rows (~57 more) | Agent 10 I.3 |
| I10 | Rule 5 hint weight for sankalp anchor context-sensitivity (growth anchor misaligns) | Agent 10 I.3 |
| I11 | `om_dhanvantaraye_namah` mantra — referenced by 2 Bhakti principles but not in master_mantras.json | Agent 8 §H |
| I12 | OVERRIDE_LEDGER_V3 populated (24 entries) — lock after 2-sig | Agent 9 L.3 |
| I13 | 0132-0135 apply order + pre-apply smoke_room_render on dev EC2 | WAVE1_SYNTHESIS §7 + standing blocker |

---

## Section 2 — The 2 Sankhya stillness × self rows (doctrinal recommendation)

Agents 8 and 9 converge on strict reading: **these rows violate §Stillness avoid-list** (Sankhya explicitly excluded from stillness). Recommended path:

1. Reclassify both rows (`rest_in_the_non_participating_witness`, `kaivalya_is_the_direction_of_stillness`) to **clarity × self** (where Sankhya is native).
2. If founder wants them in stillness for the sākṣī-bhāva pragmatic benefit, upgrade to explicit override with 2-sig.
3. Agent 1's current conservative routing (`surface_eligibility=[wisdom_banner]`, `pool_role=rare`) is a compromise path — works if founder accepts Shaiva/Sankhya dual-use-by-exception, otherwise reclassify.

## Section 3 — TAG_PATCH_WAVE1 completeness gap (most material finding)

Agent 9 verified **definitive** 111/200 rows (55.5% complete). Groups 5-9 never authored:

- Group 5: Sankhya + Yoga-Sūtras (36 rows) — these land via 0134 migration, so the *rows are pooled* but the *tag patch file is missing entries for field coverage*. Field coverage is now complete via LIFE_CONTEXT_TAG_PATCH + inline v3.1 on Agent 5's rows. **Practical impact: low** — pool state correct, field state now complete via other patches.
- Group 6: Orphan Gita selected (10 rows) — 0134 handles 4; remaining 6 may be unauthored
- Group 7: Joy subslot + Bhakti joy banner (15 rows) — 0135 handles Bhakti banners (5); joy subslot uplift may be unauthored
- Group 8: Connection Bhakti banner (7 rows) — 0135 handles 6; 1 row unaccounted
- Group 9: unnamed — unknown

**Decision needed:** Founder can either (a) finish authoring groups 5-9 (89 rows) with a dedicated sprint, OR (b) accept that migrations 0134/0135 already implement most of the intended tagging and the *file header's 200-row claim* was aspirational. Recommendation: (b) pragmatic — pool state is correct; audit for any slot-level coverage gap is the only follow-up.

---

## Section 4 — Apply order for Wave 2 migration

Before any migration applies, resolve the smoke-state conflict documented in `mitra_session_handoff_2026_04_20_end.md` (1/12 vs 12/12 on tip `b1ae635c`). That precedes all Wave 2 work.

Proposed apply order post-founder-ACK:

1. `0132_add_growth_sankalp_slot.py` — structural change
2. `0133_decontaminate_cross_room_rows.py` — 3 removals
3. `0134_expand_clarity_principle_pool.py` — 49 adds + BG cap assert
4. `0135_seed_dark_tradition_principles.py` — dark tradition seeds + doctrinal assertions
5. `0136_ingest_tag_patches.py` (PROPOSED) — materialize TAG_PATCH_WAVE1 + W1B + LIFE_CONTEXT into DB
6. `0137_backfill_surface_eligibility.py` (PROPOSED) — 554 master row backfill
7. `0138_rewire_ayurveda_intervention_links.py` (PROPOSED) — Agent 6's link-rewire

Smoke: `smoke_room_render` per dev EC2 + `smoke_room_sacred` per earlier validation.

---

## Section 5 — What the user will feel (updated from WAVE1_SYNTHESIS §8)

**Confirmed predictions (from WAVE1 §8):**
- Release embodied ✓ (Agent 10 confirms)
- Clarity context-shaped ✓ (Agent 10 confirms at sentence level)
- Growth soul-changed ✓ contingent on ingestion (pool plan scoped)
- Joy slightly deeper ✓ (5 Bhakti banners; 13 new joy sankalps land)

**Revised from WAVE1 §8:**
- Stillness — was predicted "spare, risk of rote"; now confirmed "rote on frequent return" — needs +2-3 Vedanta banners (vs WAVE1 "may warrant")
- Connection — was predicted "warmer, still thin on practice"; confirmed plus now additionally: dual-room Bhakti banners reading identically reduces distinctness vs Joy

---

## Section 6 — Execution decision gate

**Safe to execute** (no founder ACK required):
- Write 0136 ingestion migration (materializes 3 tag patches)
- Write 0137 surface_eligibility backfill migration
- Add runtime BG cap guard + surface_eligibility guard + schema-CI
- Resolve Phase B forward-references (draft_link: true targets)
- Commit Phase B seed files to kalpx backend (if founder says go)

**Needs founder ACK** (blocks apply):
- D1-D10 (10 doctrinal calls)
- C1-C15 (15 curation calls)  
- Any migration APPLY (not write — apply requires dev SSH + founder ACK + smoke-state resolution)

---

## Appendix — All artifacts this wave

Committed this wave:
- `WAVE1_SYNTHESIS.md` + 12 V2 audits (prior session commit `c866f86`)
- `WAVE2_FINAL_SYNTHESIS.md` (this doc — pending commit)
- Phase A + B FE docs (session commit `4a8d4b3`): TAG_PATCH_WAVE1B, ROOM_GOVERNANCE_FIELD_GAP_REPORT, ROOM_POOL_PLAN_V3, DECONTAMINATION_EXECUTION_LEDGER, LIFE_CONTEXT_TAG_PATCH, LIFE_CONTEXT_COVERAGE_REPORT, ROOM_THIN_GAP_AUTHORING_WAVE2, AYURVEDA_ROOM_MAPPING
- Phase C FE docs (pending commit): CONTENT_INTEGRITY_WAVE2_REVIEW, SURFACE_ISOLATION_REAUDIT_V3, OVERRIDE_LEDGER_V3, REGRESSION_AND_VARIATION_REPORT_V3

Uncommitted in kalpx backend (per curator-gate):
- 4 migration files (0132-0135)
- 8 new seed files (125 rows)

---

**Path: content-first operationalization — Phase A + B + C complete.**
Next gate: founder curator review of the 38 founder-call items. After ACK: Wave 2 migration apply + code-side runtime hardening (I1/I2/I3).
