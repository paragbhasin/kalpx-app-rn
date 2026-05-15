# Wave 2 Operationalization Synthesis — Room System v3.1.1

**Status:** FOUNDER-REVIEW-PENDING (tight register — see §5)
**Date:** 2026-04-21
**Locale scope:** English (en) only
**Supersedes/extends:** `WAVE2_FINAL_SYNTHESIS.md` (doctrine + review pass — this doc is the EXECUTION view)
**Upstream doctrine:** `ROOM_SYSTEM_STRATEGY_V1.md` — no doctrine reopened this pass

This document answers the 10 operationalization questions the founder asked after Phase C close, reduces the 38-item founder blob to **3 true founder decisions**, and calls out the one material schema gap that gates everything else: **WisdomPrinciple lacks v2 governance columns**.

---

## Section 1 — Executive summary

**What's content-real today:** 125 rows authored across 8 Wave 2 seed files, doctrine-compliant (0 register violations per Agent 5), sitting on disk uncommitted in `~/kalpx/`. Draft migrations 0136 (ingest 3 tag patches) and 0137 (surface_eligibility backfill) now exist as actual Python files. Pool plan V3 + decontamination ledger + override ledger V3 all committed.

**What's blocking user-visible effect:** A single schema-level discovery. Migration 0130 added v2 governance columns to `MasterMantra` / `MasterSankalp` / `MasterPractice` / `AssetLibrary` / `RoomContentPool` — **but NOT to `WisdomPrinciple`**. Without a `0135b` migration adding those columns (`life_context_bias`, `misuse_risk`, `standalone_safe_flag`, `repeat_tolerance_level`, `emotional_function_tag`, etc.) to the principle model, **271 principle rows** cannot receive their tags. That is the single largest unresolved item of the wave. It's hygiene — not doctrine — but it's the bottleneck.

**What's genuinely a founder call:** 3 items (Agent 5 ruthless reduction — see §5.A).

**Rooms that will materially improve at ingestion:** Release (Ayurveda body-wisdom embodied), Growth (sankalp slot structural), Clarity (context-differentiated at sentence level).

**Rooms that stay thin even post-ingestion:** Stillness (4-row banner loop), Connection × purpose_direction / × health_energy (practice pool only 3 rows).

---

## Section 2 — The 10 founder questions, directly answered

### 2.1 What content is actually ready to ingest now?

- **TAG_PATCH_WAVE1:** 105 of 111 rows auto-ingestible. 6 blocked by `uncertainty[]`/curator-gate.
- **TAG_PATCH_WAVE1B:** 76 of 82 rows auto-ingestible. 6 blocked by curator-gate.
- **LIFE_CONTEXT_TAG_PATCH:** 160 of 185 rows auto-ingestible. 25 ingest-with-flag.
- **Phase B seed files (125 rows):** ALL ingestible IF 0135a seed-migration is drafted. Currently the files exist on disk but no migration reads them.
- **Migrations 0132-0135 (draft):** ingest-ready pending founder apply ACK.

**Aggregate auto-ingestible: 341 of 378 field-operations** (90%). Twelve rows carry curator-gate blocks for legitimate reasons (uncertainty flags) and need curator ACK.

### 2.2 What content is properly tagged but still inert?

Everything. Nothing is live until `0135b` (principle schema expansion) + `0136` (ingest) + `0137` (backfill) land. Detailed below:

- **All 125 Phase B rows** — on disk, uncommitted, no ingest path.
- **All ~215 LIFE_CONTEXT_TAG_PATCH entries** — no DB column on WisdomPrinciple to hold life_context_bias for principles, so 107 of the 215 entries cannot write.
- **All 82 TAG_PATCH_WAVE1B entries** — same principle-schema block.
- **All 554 master rows with `surface_eligibility: []`** — pool filter rejects silently until 0137 backfill.
- **Migrations 0132-0135** — draft only; not applied to dev DB.

### 2.3 Which rooms will materially improve the moment ingestion lands?

| Room | Post-ingestion delta | Why |
|---|---|---|
| **Release** | 9 → 35 rows (3.9×) | 17 Ayurveda practices with vāta/pitta/kapha-specific steps (sitali, abhyanga, warm-mug for vāta-tremor). The only room where content tells the body what to do. |
| **Growth** | 27 → 104 rows (3.9×) | Sankalp slot structural (9 anchor + 12 new across rel/money/health) + principle substrate (Yamas 18 + Dinacharya 10 + BG 8 + Dharma 5). Principle + sankalp co-primary becomes real. |
| **Clarity** | 26 → 180 rows (6.9×) | Largest numerical delta. Context-shaped principle rotation (Niti for work/money/daily, Sankhya for self/health viveka, Ayurveda for health discipline, Dinacharya for daily rhythm). BG held at 10.9%. |

Joy gets modest banner depth change (+5 Bhakti banners) and +13 new joy sankalps. Structurally stable.

### 2.4 Which rooms will still remain thin after ingestion?

- **Stillness** — 4-row banner rotation loops on frequent return. Agent 3 flagged zero new Wave 2 authoring here. Needs +2-3 Vedanta-sākṣin rows (dark-orphan territory). Accept-as-sparse is valid; monitor user-feel.
- **Connection × purpose_direction + × health_energy** — principle/banner layers strong post-W2 (11 new Bhakti), but practice pool stays 3 rows for 5 contexts. Dhanvantari/body-bhakti practices (not principles) remain a gap. Wave 3.
- **Release × work_career** — 1 banner only (Agent 7 hybrid). Doctrinally constrained (no sankalp in release); doctrine call on whether to author more Shaiva-register mantras for work-grief.
- **Release × daily_life** — 0 rows across all classes.

### 2.5 Which content classes are now truly operational in each room?

Per Agent 2's operational matrix. Execution-grade per class per room:

| Room | Primary class ops-ready | Secondary class ops-ready | Light class ops-ready | Excluded (correct) |
|---|---|---|---|---|
| Stillness | Practice ✓ | Mantra ✓ | Wisdom banner (4 rows — THIN but doctrinal) | Sankalp, Principle ✓ |
| Connection | Mantra ✓ | Practice ✓ (3 rows — THIN for 5 contexts) | Wisdom banner ✓ (10 rows Bhakti) | Sankalp, Principle ✓ |
| Release | Practice somatic ✓ (17 Ayurveda) | Mantra Shaiva ✓ | Wisdom banner sparse ✓ | Sankalp, Principle ✓ |
| Clarity | Principle ✓ (64 rows context-shaped) | Practice ✓ | Wisdom teaching ✓ | Sankalp ✓ |
| Growth | Principle + Sankalp co-primary ✓ (CONTINGENT on anchor-promotion) | Practice ✓ | Wisdom reflection ✓ | — |
| Joy | Sankalp (3 subslots ✓ — gratitude 11, blessings 9, seva 12) | Mantra ✓ | Wisdom banner ✓ (5 Bhakti) | Practice, Principle ✓ |

### 2.6 Are principles finally becoming a real operational asset?

**Mixed. Yes in Clarity (64 rows, 6.9× delta, context-shaped). Yes in Growth (56 rows with Yamas/BG/Dharma/YS/Dinacharya mix). No globally.**

The damning number from Agent 3: **Nīti — 84 authored, 11 pooled, 73 dark. 13.1% utilization.** KalpX's most differentiating tradition family is its most under-used principle family.

**Post-ingestion dark principle count: 261** (185 canonical + 76 life-context). Canonical breakdown of dark: Niti 73, Sankhya 41, Bhakti 25, BG 14, Dharma 12, Ayurveda 10, Dinacharya 7, Yamas 3, YS 0. Life-context dark: 76 spread across creativity/devotional_depth/elder_legacy/parenthood/student/grief/loneliness/searching_purpose/joy_expansion/deepening.

**Verdict:** Phase B moves principles from 9.9% utilization to ~33%. Still a shelf asset at system level even after ingestion. Wave 3 sizing guide: ~80-100 high-leverage orphan principles to pool over the next 6-8 weeks will bring it to ~60%.

### 2.7 Is sankalp now distributed correctly, especially in growth?

**Content: YES. Operationally: CONTINGENT ON two gates.**

- Joy subslots post-W2: gratitude 11 / blessings 9 / seva 12 — adequate for 3-week rotation per subslot.
- Growth sankalp post-W2: 9 anchor + 12 new = 21 rows. Context distribution post-W2: relationships 4, money 4, health 4, purpose 3, self 3, daily 2 (YELLOW), work_career 2 (YELLOW).
- Register discipline: 0 violations across 25 new rows (Agent 5 re-verified).

**Two contingencies for growth co-primary to land as intended:**

1. `0135a` or equivalent seed migration must move the 12 Phase B growth sankalps into `RoomContentPool`. Currently they sit in the JSON file unused.
2. `honor_my_skill` as growth sankalp anchor misaligns for 3 of 7 contexts (relationships, health, money). Agent 4 recommends **Rule 5 anchor-promotion at resolver** — select highest-weighted context-matched rotation row when life_context is in underserved set. Alternative: author 3 context-anchors (relationship-anchor / body-anchor / money-anchor). Worst: accept misalignment.

**Asymmetry worth flagging:** joy × work_career has 7 strong Phase B karma-yoga-craft rows. Growth × work_career has only 2 register-weak rows from the anchor-9. Growth's work_career user will see weaker material than Joy's work_career user. Wave 3 priority.

### 2.8 Does life_context now have enough signal to justify the picker?

**Yes for Clarity, Growth, Joy (where context pulls visibly different tradition/tone). Borderline for Release. No for Connection × daily_life and Stillness (doctrinal).**

Per Agent 10's RED-cell revisions (12 RED → 6 GREEN, 4 YELLOW, 2 stay RED):

- **GREEN post-ingestion:** Connection × purpose_direction + × health_energy (Bhakti principles), Growth × relationships/health (sankalps), Joy × work_career + × health (sankalps)
- **YELLOW:** Release × work_career (1 banner), Growth × money_security (no mantra/practice), Clarity × purpose_direction + × money_security + × health_energy (principle GREEN, mantra/practice RED)
- **Stay RED:** Release × daily_life (0 rows), Release × work_career overall (doctrine call needed)

**But critical caveat:** NONE of these GREEN upgrades are live yet. Until 0136+0137 ingest, all context-bias tags are inert. Ingestion is the switch.

**The picker is justified — content will reward it — IF ingestion lands.**

### 2.9 Which traditions are now alive in rooms that were previously dark?

**9-tradition usage matrix — by room × primary class** (counts post-ingestion):

| Tradition | Stillness | Connection | Release | Clarity | Growth | Joy | Rooms alive | Pre-W1 rooms |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **BG** | 1 banner | 1 banner (18.66) | 6 banner | 7 principle (≤25% cap) | 11 principle + 4 banner | 7 sankalps (2.47 × work) | 6 | 3 |
| **Yoga Sūtras** | 1 banner + anchor support | 0 | 0 | 18 principle + 2 teaching | 6 principle | 0 | 3 | 2 |
| **Sankhya** | 2 (CONFLICT — must reclassify) | 0 | 1 banner | 15 principle + 12 W2 rotation | 1 | 0 | 2-3 | 1 |
| **Bhakti** | 0 | 7 banner + 11 W2 principles + 4 mantra anchors | 0 | 0 | 0 | 5 banner + 13 new sankalps | 2 | 1 |
| **Dharma** | 0 | 1 (community banner) | 0 | 3 principle (dual-use) | 8 principle | 0 | 2 | 2 |
| **Nīti** | 0 | 0 | 0 | 11 principle + 18 W2 | 5 (work_career 2ndary) | 0 | 2 | 1 (pooled) — **73 STILL DARK** |
| **Dinacharya** | 0 | 2 banner | 0 | 5 principle | 10 principle | 0 | 3 | 0 |
| **Ayurveda** | 1 practice (vāta-ground) | 1 banner (eat-before-hard-talk) | **5 banner + 17 W2 practices = 22 rows** | 3 principle | 4 principle | 1 gated sankalp | 6 | 0 |
| **Yamas/Niyamas** | 0 | 0 | 2 banner (aparigraha) | 4 principle | 18 principle (primary substrate) | 0 | 3 | 0 |

**Newly alive traditions (0 rooms → ≥3 rooms post-ingestion):**
- Yamas/Niyamas → 3 rooms (growth primary, release × money_security, clarity × relationships/work)
- Ayurveda → 6 rooms (release primary, growth + clarity + stillness light, connection light, joy gated)
- Dinacharya → 3 rooms (growth primary, clarity + connection light)

**Doctrinal floor met** (all three ≥ 3 rooms). Bhakti moves from 1 room to 2 rooms (connection + joy) with meaningful depth.

**Underexpression still to address** (Agent 5 flagged):
- Bhakti = MINIMUM-FLOOR; single-lineage Śrīvaiṣṇava in W2 — no Gauḍīya / Ālvār / Sant breadth
- Yamas = STILL-THIN in clarity (4 rows only)
- Dinacharya = MINIMUM-FLOOR in principle class; OK in practice via Ayurveda-adjacent

### 2.10 What exactly can be executed immediately without founder review?

**Safe to execute now** (no founder ACK required):

1. Commit draft migrations `0136_ingest_tag_patches.py` and `0137_backfill_surface_eligibility.py` to kalpx repo as DRAFTS (they will not apply until founder ACK)
2. Write `0135b_add_v2_governance_to_wisdom_principle.py` — schema-only migration adding v2 governance columns to `WisdomPrinciple` model (mirrors 0130 shape for the other 4 models). Does not touch data. This unblocks 271 row tags.
3. Write `0135a_seed_phase_b_content.py` — seed migration for the 8 Phase B files. Makes the 125 new rows ingestable by 0136.
4. Add runtime guards in `core/rooms/room_selection.py`:
   - I1: BG cap runtime assertion (defense-in-depth beyond migration-only)
   - I2: refuse pool rows with empty `surface_eligibility`
   - I3: schema-validation CI step on new YAML rows
5. Resolve Phase B `draft_link: true` forward-references by looking up actual target_ids or removing dangling links
6. Commit the 8 Phase B seed files in kalpx repo with status `draft` (already draft-marked; curator approval separate)
7. Commit the 4 Phase C review artifacts (already done on `pavani` branch `9430f27`)

**Needs founder ACK** (blocks any `manage.py migrate` on dev/prod):

- The 3 founder decisions in §5.A
- Any migration APPLY step (vs WRITE) — applies are ACK-gated for prod; dev applies are blocked on the 2026-04-20 smoke-state conflict

---

## Section 3 — The WisdomPrinciple schema gap (load-bearing finding)

Agent 1 discovered that migration 0130 (`0130_tagging_v2_governance_fields.py`) added v2 governance columns (`life_context_bias`, `misuse_risk`, `standalone_safe_flag`, `repeat_tolerance_level`, `emotional_function_tag`, `pool_role`, `intensity`, `action_family`, `curator_notes`, `review_status`, etc.) to:

- MasterMantra
- MasterSankalp
- MasterPractice
- AssetLibrary (wisdom assets)
- RoomContentPool

**But not to WisdomPrinciple.**

Consequence: 271 principle rows (existing 303 authored + 45 W2 authored = 348, minus 77 that serve via RoomContentPool linkage only) cannot receive `life_context_bias`. Rule 5 cannot discriminate on principles by context.

**Impact:** the entire context-shaping promise for Clarity (principle-primary room) and Growth (principle + sankalp co-primary) degrades to tag-less principle pools. The rooms will still be PRE-filtered correctly by `room_fit` but Rule 5's context scoring becomes a no-op on principles.

**Fix:** draft `0135b_add_v2_governance_to_wisdom_principle.py` mirroring 0130's shape. Schema-only — no data touched. Blocks 0136 ingestion until applied.

**Agent 1 draft proposal:** extend 0136 with a `STRICT_SCHEMA` flag so that principle tag-patches either log-as-DEFERRED (permissive) or RuntimeError (strict). Recommend strict for initial run, switch to permissive only if 0135b cannot land in time.

---

## Section 4 — Execution order

Prerequisite: resolve smoke-state conflict on dev EC2 (1/12 vs 12/12 on tip `b1ae635c`) per 2026-04-20 handoff. Blocks any migration apply.

Post-prerequisite migration chain:

```
0132_add_growth_sankalp_slot                  # structural
0133_decontaminate_cross_room_rows            # 3 removals
0134_expand_clarity_principle_pool            # BG cap asserted
0135_seed_dark_tradition_principles           # Yamas/Ayurveda/Dinacharya
0135a_seed_phase_b_content [TO DRAFT]         # 8 files × 125 rows
0135b_add_v2_governance_to_wisdom_principle   # schema expansion — LOAD-BEARING
    [TO DRAFT]
0136_ingest_tag_patches                       # materialize 3 patches
0137_backfill_surface_eligibility             # 554 master rows
0138_rewire_ayurveda_intervention_links       # Agent 6 recommendation
    [TO DRAFT]
```

Runtime hardening (non-migration):

- `core/rooms/room_selection.py` — BG cap runtime guard, empty-surface_eligibility refusal
- CI schema-validation on new YAML rows (prevent future F/G retrofit pattern)

Smoke tests to run post-apply:

- `smoke_room_render --salt=<ts>` — 12/12 GREEN expected
- `smoke_room_sacred --user-id=1 --token=<JWT>` — 12/12 GREEN expected
- `room_health_report` — BG cap check + chip-contract check + contamination check + sacred volume

---

## Section 5 — Reduced founder register (4 sections, ruthlessly filtered)

### 5.A Founder decisions only (3)

These require founder doctrine/judgment. No curator or hygiene dressed up as doctrine.

| # | Decision | Why it matters | Default recommendation | Blocking? |
|---|---|---|---|---|
| **F1** | Keep or swap `mantra.shivoham` in stillness rotation? | Shaiva bija in Shaiva-excluded room per §Stillness avoid-list. Pre-existing 0120 seed. | **Swap** to Vedanta-witness equivalent (e.g. sat-cit-ānanda bija) per §Stillness doctrine. Accept-as-exception requires 2-sig override entry. | Non-blocking for 0136 apply; blocking for doctrinal cleanness claim |
| **F2** | Accept single-lineage Bhakti (Śrīvaiṣṇava only) in Wave 2, or require Gauḍīya / Ālvār / Sant breadth before Connection is doctrinally-served? | Agent 5 flagged MINIMUM-FLOOR on Bhakti; Connection × purpose_direction leans Rāmānuja only. | **Accept single-lineage** for Wave 2 (rotation breadth is a Wave 3 target). Mark as known thin. | Non-blocking |
| **F3** | Release × work_career scope: does reputation-grief (public blame, professional collapse) belong in release via the BG 12.18-19 equanimity banner, or route to growth for dharma-rebuild? | Agent 7's hybrid (1 release banner + clarity Niti for metabolized phase) assumed release-phase-1 + clarity-phase-2; founder can confirm or consolidate. | **Accept hybrid** as-is (release for acute contraction + clarity for metabolized discernment) | Non-blocking (sparse banner only; no sankalp authoring needed) |

That's it for genuine founder decisions. Everything else the prior synthesis called "founder calls" is below.

### 5.B Curator-only decisions (delegable)

Curator can action without founder involvement:

| # | Item | Action |
|---|---|---|
| CUR1 | Reclassify 2 Sankhya × stillness × self rows to clarity × self | Simple re-tag in source YAML; matches §Clarity native home |
| CUR2 | Accept or downgrade existing joy gratitude rows (`live_in_gratitude`, `welcome_abundance`, `see_goodness`) that read noticeably flatter than Phase B | Agent 4 recommendation: set `pool_role: backup` once Phase B ingests |
| CUR3 | Bhakti joy banner at 5 rows vs 3-4 target — accept as slight over | Accept; Agent 2 soft-fail not worth founder time |
| CUR4 | Growth sankalp 9-row selection vs original Agent D Group 1 intent | Accept current 9; verb-register verified clean |
| CUR5 | Clarity BG verse-set (2.47/3.35/18.47-adjacent picks) | Accept; BG held at 10.9%, well under cap |
| CUR6 | Author's softening on 4 Niti rows (flattery-as-debt metaphor etc.) | Curator aesthetic call; not doctrine |
| CUR7 | Agent 5 Sankhya row `sankhya_rajasic_activation_mimics_vitality` borderline modern-psychology | Curator can accept with note or rewrite one line |
| CUR8 | Ayurveda release × health practices count 8 vs target 5-6 | Accept over-allotment; all 8 rows dosha-distinct |
| CUR9 | Joy × health gating on `ayur_abhyanga_as_offering` | Accept as `pool_role: rare` with explicit misuse_risk already set |
| CUR10 | `kapalabhati` tradition tag correctness | Curator verification |
| CUR11 | `garshana` śāstric-anchor scope | Curator verification |
| CUR12 | Purpose_direction Bhakti anchor swap (if current anchor reads as secondary) | Curator aesthetic |
| CUR13 | 15-row cross-surface (rooms ↔ additionals) overlap resolution | Curator per-row decision using existing DECONTAMINATION_EXECUTION_LEDGER |
| CUR14 | 2-sig on 3 dual-use rows (dina × 2 + sankhya_witness_before_interpretation) | Policy says 2-sig = founder + curator; founder already approved §5.7.5, curator signs |

### 5.C Safe execution items (7 — execute without further review)

| # | Item |
|---|---|
| SE1 | Write `0135a_seed_phase_b_content.py` draft |
| SE2 | Write `0135b_add_v2_governance_to_wisdom_principle.py` draft (schema-only; mirrors 0130) |
| SE3 | Write `0138_rewire_ayurveda_intervention_links.py` draft (Agent 6 spec) |
| SE4 | Add runtime BG cap guard in `core/rooms/room_selection.py` (I1) |
| SE5 | Add runtime surface_eligibility guard (I2) |
| SE6 | Add schema-CI step rejecting new YAML rows missing room_fit / surface_eligibility / pool_role (I3) |
| SE7 | Resolve Phase B `draft_link: true` forward-references (cross-reference target_ids) |

### 5.D Hygiene / cleanup (5)

| # | Item |
|---|---|
| HY1 | Normalize `self_devotion` → `self` in ROOM_POOL_PLAN_V2 (18 occurrences) per STRATEGY §1 |
| HY2 | Commission `om_dhanvantaraye_namah` mantra in `master_mantras.json` (2 new Bhakti principles link to it) |
| HY3 | Commission 2-3 Vedanta-sākṣin banners for stillness (dark-orphan authoring — Wave 3 candidate) |
| HY4 | Niti mantra diversification — `om_shanti` attached to all 50 Niti rows causes user-feel saturation; rotate across 4-5 mantras |
| HY5 | Dual-room Bhakti banners identical text in Connection + Joy — either surface-differentiated copy or split row_ids |

### 5.E What moved FROM the 38-item blob TO this clean register

- Agent 8's 8 doctrinal founder calls → 3 (F1, F2, F3); 5 moved to curator or hygiene
- Agent 9's 4 doctrinal + 4 curation + 5 hygiene → 1 doctrinal (F1), 7 curator, 4 hygiene
- Agent 10's 2 doctrinal + 4 curation + 3 hygiene → 0 new doctrinal (all absorbed in F2/F3 or demoted), curator/hygiene distributed

**Total register: 3 founder + 14 curator + 7 safe-execution + 5 hygiene = 29** (down from 38; more importantly: the true founder set is 3 not 38).

---

## Section 6 — Apply readiness verdict

**Wave 2 is substantively landable** after these 4 must-fix items close (Agent 5 lock):

1. Reclassify 2 Sankhya × stillness × self rows to clarity × self (CUR1 — curator)
2. Apply TAG_PATCH_WAVE1B to 82 rows via 0136 (SE item — execute)
3. Author or strip Dhanvantari mantra intervention-link from 2 Bhakti rows (HY2 — curator)
4. Rewrite one line in `growth_money_act_from_long_view` ("10-year-horizon version of me" — modern-generic) (curator aesthetic fix)

All four are hygiene or curator items. None require founder judgment. **No content failures block ingestion.**

The 3 founder decisions (F1/F2/F3) are all non-blocking for 0136 apply. F1 (shivoham) creates a doctrinal cleanliness gap that can be resolved separately.

---

## Section 7 — What this pass shifted

- **Doctrine: not reopened.** No new strategy, no new tradition assignments, no new class-dominance rules.
- **Scope: not broadened.** No new authoring agents spawned. Phase B's 125 rows are the Wave 2 authoring ceiling.
- **Register: ruthlessly reduced.** 38 → 3 + 14 + 7 + 5.
- **Execution: primed.** 0136 + 0137 drafts on disk; 0135b identified as load-bearing gap; apply order locked.

---

## Appendix — Artifacts this operationalization pass

Committed:
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/INGESTION_READINESS_REPORT.md`
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/ROOM_CONTENT_OPERATIONAL_MATRIX.md`
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/PRINCIPLE_SYSTEM_OPERATIONALIZATION_REVIEW.md`
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/SANKALP_OPERATIONALIZATION_REVIEW.md`
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/CONTENT_INTEGRITY_LOCK_REVIEW.md`
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/WAVE2_OPERATIONALIZATION_SYNTHESIS.md` (this doc)

Backend drafts (uncommitted — curator-gate):
- `/Users/paragbhasin/kalpx/core/migrations/0136_ingest_tag_patches.py`
- `/Users/paragbhasin/kalpx/core/migrations/0137_backfill_surface_eligibility.py`
- All 8 Phase B seed files (125 rows)
- Migrations 0132-0135 (draft from earlier)

**Load-bearing next writes (safe-to-execute):** `0135a_seed_phase_b_content.py`, `0135b_add_v2_governance_to_wisdom_principle.py`, `0138_rewire_ayurveda_intervention_links.py`.

---

**End of Wave 2 Operationalization.**
Next gate = founder F1/F2/F3 decisions (3 items) + curator CUR1-14 (14 items).
After ACK + smoke-state resolution on dev: apply 0132 → 0137 chain.
