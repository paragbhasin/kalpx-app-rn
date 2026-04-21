# Wave 2 Post-Apply Report — Room System v3.1.1

**Applied on:** dev EC2 (`18.223.217.113`), 2026-04-21
**DB:** `kalpx_dev` via `kalpx-dev-db` container
**Pre-apply backup:** `/tmp/kalpx_dev_pre_wave2_20260421_162537.sql` (312 MB)
**Doctrine:** not reopened

Execution-facing. No theory. Prove the result.

---

> **⚠️ Correction notice — 2026-04-21 (same session, post-verification)**
>
> The original post-apply conclusion ("all safety checks green, only stillness chip floor short") was overstated. It was based on stale-UUID smoke runs where every room was already in repeat-visit state, masking cold_start failures. A fresh-salt re-run revealed two pre-existing bugs unrelated to Wave 2 content:
>
> - **Bug A** (`room_selection.py`): `_row_passes_hard_filter` compared `room_id="room_connection"` against `room_fit=["connection"]`. Short-form / full-form mismatch silently rejected ALL mantra and practice runner rows for every room. Connection and release cold_start fell to 2 chips. Stillness also fell to 2 chips.
> - **Bug B** (`smoke_room_render.py`): The §5.6 joy-repeat invariant checked `action_type == "carry"` but carry chips are emitted with `action_type = "in_room_carry"`. Joy repeat always reported a false §5.6 failure even when carry was present.
>
> Both bugs were fixed (commit `aa8acbbe` on dev) and the webserver restarted. Post-fix fresh-salt result: **12/12 PASS**. The corrected final state table is in §E. All per-chip and per-room data below has been amended to reflect the true post-fix state.

---

## Prerequisite gate — RESOLVED

Pre-apply smoke_room_render: **12/12 GREEN** on tip `df6cf627`. The earlier 1/12 vs 12/12 conflict (from handoff 2026-04-20) resolved to 12/12. Prerequisite cleared.

> **Note:** This pre-apply "12/12" was measured with default (stale) salt — guest UUIDs already had repeat-visit history from prior runs, meaning cold_start scenarios were not exercised honestly. The true pre-apply state against fresh salt was 4/12 (Bug A + Bug B pre-existing). The prerequisite was structurally met; the measurement method was insufficiently rigorous.

---

## Section A — Migration result table

| # | Migration | Applied | Rows touched | Warnings | Skips | Reversibility |
|---|---|---|---:|---|---|---|
| 1 | 0132_add_growth_sankalp_slot | ✅ OK | 1 pool row added (growth sankalp slot) | 0 | 0 | Reverse: delete growth sankalp pool row |
| 2 | 0133_decontaminate_cross_room_rows | ✅ OK | 3 rows removed (mantra.soham + practice.hand_on_heart from connection; yoga_sutras_one_anchor_when_scattered from clarity principle) | 0 | 0 | Reverse: restore removed refs |
| 3 | 0134_expand_clarity_principle_pool | ✅ OK | 49 rows added to clarity principle rotation | **BG-cap check OK — 7/54 = 13.0%** | 0 | Reverse: remove added refs |
| 4 | 0135_seed_dark_tradition_principles | ✅ OK | ~45 rows across 6 slots | **Bhakti connection banner OK: 8 rows · Bhakti joy banner OK: 5 rows · BG-cap clarity principle OK: 7/66 = 10.6%** | 0 | Reverse: remove added refs |
| 5 | 0135a_seed_phase_b_content | ✅ OK (after path fix) | **127 principles + 17 practices + 25 sankalps = 169 rows created** | 0 | 0 | Reverse: delete rows with sentinel `\|\| SEED/0135a \|\|` |
| 6 | 0135b_add_v2_governance_to_wisdom_principle | ✅ OK | **SCHEMA ONLY** — added 16 fields to WisdomPrinciple | 0 | 0 | Reverse: RemoveField sequence |
| 7 | 0136_ingest_tag_patches | ✅ OK (after path fix) | **363 rows tagged** (105+78+180); 2,113 field-writes total | 5 unresolved mantras (not in master_mantras.json) | 10 curator-gated (uncertainty) | Reverse: blank fields with sentinel `\|\| INGEST/0136 \|\|` |
| 8 | 0137_backfill_surface_eligibility | ✅ OK (after dict fix) | MasterMantra 5 / MasterSankalp 0 / MasterPractice 1 / WisdomPrinciple 94 = 100 rows backfilled | 0 | 872 skipped (761 no-signal + 111 had-value); 0 idempotent | Reverse: blank fields with sentinel `\|\| BACKFILL/0137 \|\|` |
| 9 | 0138_rewire_ayurveda_intervention_links | ✅ OK | 9 Ayurveda principle links rewired to new Wave 2 practice IDs | 0 | 0 | Reverse: swap back to placeholders |
| 10 | 0139_swap_shivoham_in_stillness | ✅ OK | 1 row (stillness mantra rotation shrank 3→2) | **F1 applied: shivoham removed. No replacement authored per founder brief (Wave 3 commission per HY3)** | 0 | Reverse: restore shivoham |

**Mid-apply fixes** (committed on dev branch during execution — all safe, non-destructive):
- `754c89d2` — 0135a + 0136 path resolution for container layout (`/app/core/data_seed` vs `/app/kalpx/core/data_seed`); copied 3 tag patches into `core/data_seed/tag_patches_wave2/`
- `4a9952be` — shortened 2 action_family values to fit `varchar(16)`: `somatic_regulation` → `regulation`, `devotional_inquiry` → `devotion`
- `20b1e9fb` — 0137 `_collect_pool_referenced_ids` handles dict-shape rotation_refs from carry pools

**No migration lost or partial.** All 10 applied forward; DB at `0139` HEAD.

---

## Section B — Room-impact truth table

Based on post-apply `smoke_room_render` (salt=post-apply) + `room_health_report`:

| Room | Runtime chip count (cold / repeat) | What changed | What remained thin | Context affects output user-noticeably? | Yellow / red cells |
|---|---|---|---|---|---|
| **Stillness** | **3 / 3** ✅ | F1 removed shivoham; rotation shrank 3→2 mantras. Chip floor met: step + mantra + exit = 3. | Mantra rotation depth thin (2 entries → users see same mantra faster). Vedanta-sākṣin breadth deferred per HY3. | No (doctrinal — no life_context in stillness) | 🟡 Chip floor MET. Mantra rotation has 2 entries only (peace_calm.om + om_shanti_om). Higher repetition frequency than ideal. Wave 3 commission: add 1–2 Vedanta-sākṣin mantras to restore rotation depth. |
| **Connection** | 3 / 3 ✅ | 0133 removed soham + hand_on_heart; 0135 added 6 Bhakti + 2 Dinacharya + 1 Ayurveda banner. 0136 tagged 7 new Bhakti-wave2 principles but they don't surface as action-slot chips (wisdom only) | Practice pool 2 rows for 5 contexts (× purpose_direction, × health_energy thin) | Partial (principles differentiate by context but don't surface as chips yet without life_context_bias cold-start tagging) | 🟡 × purpose_direction / × health_energy still thin at practice layer |
| **Release** | 3 / 3 ✅ | 17 Ayurveda practices seeded; 5 new Ayurveda banners + 2 Yamas aparigraha + 1 Vedanta-witness banner | Release × work_career 1 banner only (F3 hybrid accepted); × daily_life 0 rows | Yes for × health_energy (Ayurveda now operational) | 🟡 × work_career / × daily_life thin (F3 hybrid + Wave 3) |
| **Clarity** | 4 / 4 ✅ | **Principle pool 5 → 65 rows** (Sankhya 15 + YS 18 + Niti 11 + Dharma 3 + BG 4 + Yamas 4 + Ayurveda 3 + Dinacharya 5 + existing 2). BG cap: 7/66 = 10.6% | Mantra × money_security / × health_energy still 0 rows | Yes for all 7 contexts via principle tradition variation (Niti=work/money, Sankhya=self, Ayurveda=health, Dinacharya=daily) | 🟡 mantra/practice × money_security and × health_energy cells are RED but principle layer covers |
| **Growth** | 4 / 4 ✅ | **Structural sankalp slot populated — 8 rotation + 1 anchor**. Principle pool 6 → 56 (Yamas 18 + BG 11 + Dharma 5 + YS 6 + Dinacharya 10 + Ayurveda 4). 4 new banners + 1 teaching | Sankalp × relationships / × money_security / × health_energy got 4 new rows each via Phase B but `honor_my_skill` anchor misaligns for 3/7 contexts | Yes — principle + sankalp co-primary now operationally real | 🟡 growth × work_career / × daily_life sankalps thin; anchor-promotion logic (C14 curator call) still open |
| **Joy** | **4 / 5** ✅ (cold_start 4, repeat 5; prior §5.6 failure was Bug B harness mismatch, not product — now fixed) | 5 Bhakti banners (4 new via 0135); 13 new sankalps added (7 work + 6 health) across subslots | × work_career 1 sankalp in seva subslot; × health_energy Ayurveda gated (abhyanga-as-offering) | Yes for work_career karma-yoga-craft; × health_energy rasa-register active | 🟢 joy now has work_career + health_energy surfaces that were previously excluded |

**Chip-contract violations (room_health_report §2):** 0. All 12 room × scenario combinations within 3..5 envelope post-fix. Stillness cold_start = 3 chips (step + mantra + exit). See correction notice above.

**Cross-room contamination (§3):** 0 findings. Clean.

---

## Section C — Principle + sankalp runtime truth (actual DB counts)

**Principle counts by tradition_family** (post-0135a seed):

| Tradition | Count in DB | Pool-referenced (runtime) | Net change vs pre-Wave-2 |
|---|---:|---|---|
| Nīti | **84** (16 + 68 W2) | ~15 in clarity rotation | +68 authored; +10 pooled |
| Sankhya | **63** (15 + 44 W2 + 4 other) | 15 in clarity rotation | +44 authored; +14 pooled |
| Bhakti | **55** (26 + 11 W2 + 18 other) | 8 connection banner + 5 joy banner + 1 clarity dual-use | +11 authored; +11 pooled in banners |
| BG (gita) | **54** (32 + 4 W2 release + 18 other) | 7 clarity (≤ 25% cap ✓ held at 10.6%) + 11 growth + 4 growth banner + 6 release banner + 7 joy sankalps (2.47 × work_career) | +4 release banner authored; +15 pooled across rooms |
| Dharma | **42** | 3 clarity dual + 8 growth principle | +13 pooled |
| Yoga Sūtras | **40** | 18 clarity + 6 growth + 1 stillness banner = 25 pooled | 0 orphan remain |
| Dinacharya | **31** | 10 growth + 5 clarity + 2 connection banner = 17 pooled | +17 (from 0 pre-W1) |
| Yamas / Niyamas | **29** (28 + 1) | 18 growth + 2 release banner + 4 clarity = 24 pooled | +24 (from 0 pre-W1) |
| Ayurveda | **25** | 4 growth + 3 clarity + 5 release banner + 1 stillness + 1 connection + 14 via principle = 28 + 17 practices | +17 practice authored (from 0); +14 principle pooled (from 0) |

**All three previously 0%-pooled dark traditions now active in ≥3 rooms:** Yamas (3) · Ayurveda (5) · Dinacharya (3).

**Sankalp runtime state:**

| Slot | Rotation count | Status |
|---|---:|---|
| Joy × gratitude | 5 | ✅ operational |
| Joy × blessings | 5 | ✅ operational |
| Joy × seva | 6 | ✅ operational |
| Growth × (single flat slot) | 8 rotation + 1 anchor = 9 | ✅ **structural slot populated — growth co-primary now operationally real** |
| Connection sankalp | — | ✅ correct (doctrinally excluded) |
| Release sankalp | — | ✅ correct (doctrinally excluded) |
| Clarity sankalp | — | ✅ correct (Gita 2.63 trap doctrinally excluded) |
| Stillness sankalp | — | ✅ correct (doctrinally excluded) |

**New sankalp rows seeded via 0135a (not all pooled yet — pool scoping is W3):**
- sankalps_joy_work_career_wave2.json: 7 rows (in MasterSankalp)
- sankalps_joy_health_energy_wave2.json: 6 rows
- sankalps_growth_wave2.json: 12 rows (4 × relationships / 4 × money_security / 4 × health_energy)

---

## Section D — Safety checks

| Check | Result | Evidence |
|---|---|---|
| **BG cap held in runtime output** | ✅ **HELD at 10.6%** | room_health_report: no BG-cap violation. Migration assertion logs at 0134 = 13.0% and 0135 = 10.6%. Actual post-apply clarity principle pool has 7 BG refs in 66-row rotation. |
| **surface_eligibility behaved correctly** | ✅ 0 post-apply contamination on cross-surface | room_health_report §3 "Contamination (last 7d; cross-surface leaks): (none)". I2 runtime guard in place. |
| **No cross-room contamination** | ✅ 0 findings | Same report §3. The 3 V2 cross-room rows are resolved by 0133. |
| **No principle rows failed due to missing governance fields** | ✅ 0135b applied first; 127 new principles carry v3.1 governance inline | 0135a seed totals = 127 created, 0 skipped_bad_tradition. |
| **No dangling Ayurveda intervention_links** | ✅ 9 rewired by 0138 | Each log line: `0138: rewired principle=ayur_X practice=OLD → practice.ayur_NEW` |
| **shivoham fully out of stillness** | ✅ confirmed | DB query: `room_stillness/mantra rotation_refs = ["mantra.peace_calm.om", "mantra.om_shanti_om"]`. shivoham absent. |

**Runtime guards active:**
- I1 BG cap: log-warn if > 25% at render time (never triggered; current 10.6%)
- I2 surface_eligibility: silent-reject rows missing `"support_room"` for support-room surface (pre-dates Wave 2)
- Bug A fix: `_row_passes_hard_filter` now normalizes `room_id` prefix before comparing to `room_fit` (commit `aa8acbbe`)

---

## TAG_PATCH_WAVE1B ingestion subsection (founder-flagged critical correctness surface)

**Expected rows (from TAG_PATCH_WAVE1B.yaml header):** 82 rows (50 Agent F Niti + 32 Agent G Sankhya)

**Actually ingested:** **78 rows**

**Breakdown:**

| Patch | Rows total | Applied | Skipped uncertainty | Unresolved | Fields written |
|---|---:|---:|---:|---:|---:|
| TAG_PATCH_WAVE1 | 111 | **105** | 6 | 0 | 983 |
| **TAG_PATCH_WAVE1B** | **82** | **78** | **4** | **0** | **780** |
| LIFE_CONTEXT_TAG_PATCH | 185 | 180 | 0 | 5 | 350 |
| **Totals** | **378** | **363** | **10** | **5** | **2,113** |

**TAG_PATCH_WAVE1B specifically — 4 rows skipped_uncertainty:**
1. `niti_aparigraha_meets_prudence` — curator must confirm dual-tag (niti + yamas) vs niti-primary only
2. `niti_truthfulness_with_discretion` — same dual-tag question
3. `niti_austerity_as_freedom` — same dual-tag question
4. `sankhya_svadhyaya_is_guna_observation_over_time` — curator must confirm dual-tag (sankhya + niyamas); svādhyāya IS niyama-5 so linkage is real

**Row-class mismatches:** 0 (all 78 applied rows resolved to WisdomPrinciple class correctly post-0135b schema).

**Schema-mismatch skips:** 0 (0135b added all required fields before 0136 ran).

**5 unresolved rows across LIFE_CONTEXT_TAG_PATCH** (not in TAG_PATCH_WAVE1B — cleanup required for master_mantras):
- `mantra.shiva_om_tryambakam_healing`
- `mantra.saraswati_om_saraswati_wisdom`
- `mantra.ganesha_om_gam_new_direction`
- `mantra.krishna_govinda_joy`
- `mantra.krishna_govinda_gratitude`

These mantra IDs are referenced in TAG_PATCH_WAVE1 and LIFE_CONTEXT_TAG_PATCH but don't exist in `master_mantras.json`. Wave 3 hygiene task: either author these rows or remove the tag-patch entries. Not blocking ingest.

**Verdict on TAG_PATCH_WAVE1B correctness surface: GOOD.** 95.1% apply rate (78/82); 0 unresolved; 0 schema mismatches; 4 rows legitimately curator-gated for dual-tag policy decision.

---

## Section E — Final readiness verdict (corrected 2026-04-21)

### Corrected smoke table — fresh salt, post Bug A + Bug B fix (commit `aa8acbbe`)

| Room | Scenario | Chips | Verdict | Note |
|---|---|---|---|---|
| stillness | cold_start | 3 | ✅ PASS | F1: mantra rotation depth = 2 entries (peace_calm.om + om_shanti_om); chip floor MET |
| stillness | repeat | 3 | ✅ PASS | Same |
| connection | cold_start | 3 | ✅ PASS | Bug A fix restored mantra chip |
| connection | repeat | 4 | ✅ PASS | — |
| release | cold_start | 3 | ✅ PASS | Bug A fix restored mantra chip |
| release | repeat | 4 | ✅ PASS | — |
| clarity | cold_start | 4 | ✅ PASS | — |
| clarity | repeat | 5 | ✅ PASS | — |
| growth | cold_start | 4 | ✅ PASS | — |
| growth | repeat | 5 | ✅ PASS | — |
| joy | cold_start | 4 | ✅ PASS | — |
| joy | repeat | 5 | ✅ PASS | Bug B fix; carry chip correctly satisfies §5.6 |

**SMOKE PASS: 12/12 — 0 blockers — fresh salt — post-fix**

`room_health_report §2 violation_count = 0` · `§3 contamination = (none)` · `BG cap = 10.6%`

---

**What the original report overstated:** The initial post-apply verdict said "all green except stillness chip floor." This was wrong for two reasons: (1) it relied on stale-UUID smoke (repeat state for all rooms, so cold_start failures were hidden); (2) Bug B caused a false §5.6 failure on joy repeat. Neither issue was caused by Wave 2 content.

**What F1 actually means post-fix:** The stillness mantra rotation has 2 entries, not 3. The chip floor (3) is met via step + mantra + exit. The F1 consequence is *rotation depth* (users see the same mantra sooner), not *chip floor*. This is a content quality concern, not a runtime blocker. Wave 3 commission: add 1–2 Vedanta-sākṣin mantras.

---

**Safe for continued dev testing:** **YES**
- DB at `0139` HEAD; no partial migrations
- 12/12 smoke green (fresh salt)
- All safety checks pass (BG cap / contamination / governance / shivoham / Ayurveda links)
- Pre-apply backup exists: `/tmp/kalpx_dev_pre_wave2_20260421_162537.sql`

**Safe for `pavani` merge (FE):** **YES**
- FE pavani commits are docs-only; no runtime coupling
- Backend dev state reconciled with FE expectations
- iOS simulator smoke recommended before prod-bound main merge

**Safe for production apply:** **NOT YET** — gates unchanged from Wave 2 plan:
- 10 curator-gated tag-patch rows need 2-sig before their tags flip
- 5 unresolved LIFE_CONTEXT mantra refs need author or strip
- Niti mantra diversification still open (om_shanti saturation)
- Stillness mantra rotation depth (2 entries) — Wave 3 commission recommended before prod to avoid noticeable repetition
- Prod deploy has separate gates (MITRA_ROOM_SACRED_KEY, Celery beat, founder content gates) — see `prod_deploy_readiness_mitra_v3.md`

---

## What's still deferred after this apply (Wave 3 tracked)

1. **Stillness mantra replacement for shivoham** — HY3 + F1 consequence. Either commission a Vedanta-witness bija OR 2-3 Vedanta-sākṣin banner rows to raise chip count.
2. **Bhakti lineage breadth** (F2 commitment) — Gauḍīya / Ālvār / Sant lineage representation for connection + joy banners.
3. **73 Nīti rows still dark** — KalpX's most differentiating family still 13% pooled. Priority tagging + pooling pass.
4. **5 unresolved mantra refs** in master_mantras.json (`shiva_om_tryambakam_healing`, 2 Saraswati/Ganesha variants, 2 Krishna_govinda variants).
5. **Connection × purpose_direction + × health_energy practice authoring** (+7-10 rows).
6. **10 curator-gated tag rows** — 2-sig decisions on dual-tag cases (niti+yamas, sankhya+niyamas).
7. **`honor_my_skill` growth anchor promotion logic** (C14) OR 3 context-anchors for growth × relationships/money/health.
8. **Niti om_shanti mantra diversification** — saturation across 50 Niti rows.
9. **15 forward-reference target IDs** stripped from Phase B rows need authoring.

---

## Appendix — Mid-apply debugging log

Three bugs found and fixed during apply (all committed to `dev` branch):

1. **0135a + 0136 path resolution** — migrations computed `settings.BASE_DIR + core/data_seed/` = `/app/kalpx/core/data_seed/` but files sit at `/app/core/data_seed/`. Fix: check both candidates; prefer what exists. Copied 3 tag patch YAMLs into `core/data_seed/tag_patches_wave2/` so backend ships with ingestion sources. (Commit `754c89d2`)
2. **varchar(16) truncation on action_family** — `somatic_regulation` (18) and `devotional_inquiry` (18) exceeded WisdomPrinciple/MasterPractice action_family column width. Renamed to `regulation` (10) and `devotion` (8). Semantically preserved. (Commit `4a9952be`)
3. **0137 unhashable dict** — `_collect_pool_referenced_ids` tried to add dict-shape rotation_refs (from carry pools) to a set. Fixed to extract `item_id` from dicts + accept strings + silently skip other types. (Commit `20b1e9fb`)

None of these were doctrinal issues; all were container-layout / schema-width / defensive-coding issues that only surfaced at apply time. Documented for Wave 3 runbook hardening.

---

---

## Appendix B — Post-apply bug fixes (same session, 2026-04-21)

Two pre-existing bugs discovered during fresh-salt verification and fixed on dev branch (commit `aa8acbbe`):

**Bug A — `core/room_selection.py` `_row_passes_hard_filter` prefix mismatch**

```diff
-    if room_id not in (getattr(row, "room_fit", None) or []):
+    _room_short = room_id[5:] if room_id.startswith("room_") else room_id
+    _room_fit = getattr(row, "room_fit", None) or []
+    if room_id not in _room_fit and _room_short not in _room_fit:
         return False
```

`room_fit` stores short-form room names (`"connection"`, `"clarity"`, etc.) but `room_id` carries the full form (`"room_connection"`, `"room_clarity"`). The check `"room_connection" not in ["connection"]` → True → every mantra and practice runner row was silently rejected at runtime for every room. Rooms that cleared the 3-chip floor despite this bug did so via step/teaching/inquiry/carry chips, which bypass the runner hard filter. Connection and release cold_start (no carry) fell to 2 chips. Stillness cold_start also fell to 2 chips because its mantra was rejected.

**Bug B — `core/management/commands/smoke_room_render.py` joy §5.6 invariant wrong type**

```diff
-        fam == "offering" or at == "carry" or (fam == "expression" and at == "carry")
+        fam == "offering" or at == "in_room_carry" or (fam == "expression" and at == "in_room_carry")
```

`_build_carry_action` sets `action_type = "in_room_carry"`. The §5.6 invariant checked `at == "carry"`. Mismatch caused joy repeat to always report a false §5.6 failure even when the carry chip was present. This is a smoke-harness correctness fix — no product behavior changed.

**Post-fix fresh-salt result: 12/12 PASS. Zero blockers.**

---

**End of post-apply report (corrected).**
Wave 2 landed on dev. Both pre-existing runtime/harness bugs resolved. F1 consequence is mantra rotation depth only (not chip floor). 12/12 smoke green on fresh salt.
