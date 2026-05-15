# Wave 2 Final Execution Package — Room System v3.1.1

**Status:** READY FOR DEV APPLY · PENDING FOUNDER SIGNOFF ON APPLY + PAVANI MERGE
**Date:** 2026-04-21
**Doctrine:** locked; do not reopen
**Founder decisions F1/F2/F3:** landed

Execution-facing only. No doctrine restatement.

---

## 1. Exact apply order (10 migrations)

```
0132_add_growth_sankalp_slot                      # structural
0133_decontaminate_cross_room_rows                # 3 removals
0134_expand_clarity_principle_pool                # BG cap assert
0135_seed_dark_tradition_principles               # Yamas / Ayurveda / Dinacharya
0135a_seed_phase_b_content                        # 125 new rows across 8 files
0135b_add_v2_governance_to_wisdom_principle       # SCHEMA (load-bearing)
0136_ingest_tag_patches                           # 3 patches → DB
0137_backfill_surface_eligibility                 # 554 master rows → pool-eligible
0138_rewire_ayurveda_intervention_links           # 14 principle links → new practices
0139_swap_shivoham_in_stillness                   # F1 decision applied
```

## 2. Exact migration dependency order

| # | Migration | Depends on | Type | Reverse |
|---|---|---|---|---|
| 1 | 0132 | 0131 | Data (pool structural) | Delete growth sankalp pool rows |
| 2 | 0133 | 0132 | Data (decontamination) | Restore removed cross-room rows |
| 3 | 0134 | 0133 | Data (clarity expansion) | Remove added rotation entries |
| 4 | 0135 | 0134 | Data (dark tradition seed) | Remove added rotation entries |
| 5 | **0135a** | 0135 | Data (Phase B seed) | Delete rows with `\|\| SEED/0135a \|\|` sentinel |
| 6 | **0135b** | 0135a | **SCHEMA** (16 new fields on WisdomPrinciple) | RemoveField sequence |
| 7 | 0136 | 0135b | Data (tag-patch ingestion) | Blank fields with `\|\| INGEST/0136 \|\|` sentinel |
| 8 | 0137 | 0136 | Data (surface_eligibility backfill) | Blank fields with `\|\| BACKFILL/0137 \|\|` sentinel |
| 9 | 0138 | 0137 | Data (Ayurveda link rewire) | Swap new targets back to placeholders |
| 10 | 0139 | 0138 | Data (shivoham removal from stillness) | Restore shivoham in position |

**0135b is load-bearing.** Without it, 0136 cannot write `life_context_bias` / `misuse_risk` / `standalone_safe_flag` etc. to WisdomPrinciple rows — migration 0130 missed this model.

## 3. Rows affected per migration

| Migration | Schema changes | Data rows touched | Idempotency key |
|---|---|---|---|
| 0132 | 0 | 9 growth sankalp pool rows added | pool row existence check |
| 0133 | 0 | 3 rows decontaminated (mantra.soham, practice.hand_on_heart, yoga_sutras_one_anchor_when_scattered) | rotation list membership |
| 0134 | 0 | 49 clarity principle rotation additions | ref-not-in-rotation check |
| 0135 | 0 | ~45 rows across 6 pool slots (stillness banner 2 / connection banner 9 / release banner 9 / clarity principle 12 / growth principle 51 / growth banner 4 + 1 teaching / joy banner 4) | ref-not-in-rotation check |
| 0135a | 0 | 125 new authored rows (68 Niti + 44 Sankhya + 11 Bhakti + 4 Gita-release + 17 Ayurveda practices + 25 new sankalps) | principle_id/sankalp_id/practice_id existence |
| **0135b** | **+16 columns on WisdomPrinciple** | 0 (schema only) | Django auto |
| 0136 | 0 | ~260 row-tags across 3 patches (105 of 111 WAVE1 + 76 of 82 WAVE1B + 160 of 185 LIFE_CONTEXT; CURATOR_GATE+uncertainty rows skipped) | per-row `\|\| INGEST/0136 \|\|` sentinel |
| 0137 | 0 | 554 master rows (mantra/sankalp/practice) get default `surface_eligibility` | per-row `\|\| BACKFILL/0137 \|\|` sentinel + non-empty-value skip |
| 0138 | 0 | 14 Ayurveda principle intervention_links re-pointed | link target match check |
| 0139 | 0 | 1 row (stillness mantra rotation — shivoham removed) | presence check |

## 4. Schema vs data changes — summary

- **Schema migrations (1):** only 0135b. Adds v2 governance columns to WisdomPrinciple.
- **Data migrations (9):** all others. Reversible.
- **No destructive data ops.** All removals are reversible via stored-state reload.

## 5. What changes visibly per room, per migration

| After migration | Stillness | Connection | Release | Clarity | Growth | Joy |
|---|---|---|---|---|---|---|
| 0132 | — | — | — | — | sankalp slot EXISTS (empty content yet) | — |
| 0133 | soham stays as anchor (removed from connection); hand_on_heart stays (removed from connection) | loses soham + hand_on_heart | — | yoga_sutras_one_anchor_when_scattered removed from principle; still in banner | — | — |
| 0134 | — | — | — | principle pool 5 → 54 (Sankhya 14 + YS 18 + Niti 11 + BG 4 + Dharma 3); BG=7/54=13% | — | — |
| 0135 | +2 banner (vāta-ground + rest_in_the_seer) | +9 banner (6 Bhakti + 2 Dinacharya + 1 Ayurveda); Bhakti floor met | +9 banner (BG 2.14 + 5 Ayurveda + 2 Yamas + 1 Vedanta) | +12 principle (Yamas 4 + Ayurveda 3 + Dinacharya 5); +2 teaching | +51 principle (Yamas 18 + BG 8 + Dharma 5 + YS 6 + Dinacharya 10 + Ayurveda 4); +4 banner; +1 teaching | +4 banner (Bhakti) |
| 0135a | — | +11 bhakti principle rows (content now exists) | +4 BG-release banners (content) | +30 new principle rows (18 Niti + 12 Sankhya) | +12 new sankalp rows (relationships 4, money 4, health 4) | +13 new sankalp rows (7 work_career + 6 health_energy) |
| 0135b | — | WisdomPrinciple now accepts life_context_bias | same | SAME (single biggest unlock: context-shaping becomes real) | SAME | — |
| 0136 | — | connection × purpose_direction + × health_energy now discriminate | — | context-bias ACTIVE across all 5 contexts on 60+ principle rows | context-bias ACTIVE on 50+ principle rows | context-bias on 13 new sankalps |
| 0137 | 554 master rows now pool-eligible | same | same | same | same | same |
| 0138 | — | — | Ayurveda principles now link to real practice targets (no dangling) | — | — | — |
| 0139 | Shaiva-bīja swap out (F1) — rotation shrinks 3→2 until Wave 3 Vedanta banner authoring lands | — | — | — | — | — |

## 6. What's still deferred after Wave 2 apply

**Wave 3 priorities (tracked; not in this apply):**

| Gap | Source | Owner |
|---|---|---|
| Stillness Vedanta-sākṣin rotation breadth (+2-3 rows) | Agent 10 F.2 + F1 consequence | curator authoring |
| Bhakti lineage breadth for Connection + Joy (Gauḍīya / Ālvār / Sant) | F2 commitment | curator authoring |
| Connection × purpose_direction + × health_energy practice pool (+7-10 rows) | Agent 10 §D | curator authoring |
| Nīti dark — 73 authored rows still un-pooled | Agent 3 | tagging pass |
| Growth × daily_life + × work_career sankalp depth (+6-8) | Agent 4 | curator authoring |
| Joy × work_career rotation breadth (post-W2 good; breadth for 6+ month rotation) | Agent 4 | curator authoring |
| Forward-reference targets — 15 unique practice/sankalp IDs resolving 44 link slots | FORWARD_REFERENCE_RESOLUTION.md | curator authoring |

**Hygiene items not yet closed:**
- `self_devotion` → `self` normalization in ROOM_POOL_PLAN_V2 (18 occurrences)
- `om_shanti` mantra diversification across 50 Niti rows (user-feel saturation)
- Dual-room Bhakti banner text differentiation (Connection vs Joy)

## 7. Safe to apply on dev — checklist

**Prerequisite (standing blocker — must close first):**
- [ ] Resolve `smoke_room_render` 1/12 vs 12/12 conflict on tip `b1ae635c` per `mitra_session_handoff_2026_04_20_end.md`. SSH dev EC2 and run `docker exec kalpx-dev-web python manage.py smoke_room_render --salt=dev-$(date +%s)` for ground truth.

**Apply checklist:**
- [ ] DB backup on dev (`pg_dump` or equivalent)
- [ ] Run `python manage.py migrate core 0131` (baseline — should be at tip)
- [ ] Apply `0132` · verify `growth` pool row exists with empty sankalp slot
- [ ] Apply `0133` · verify 3 decontamination rows moved
- [ ] Apply `0134` · verify clarity principle pool == 54 + BG assertion log shows ≤25%
- [ ] Apply `0135` · verify Yamas / Ayurveda / Dinacharya now touch ≥3 rooms
- [ ] Apply `0135a` · verify 125 new rows land (check sentinel in curator_note)
- [ ] Apply `0135b` · verify new columns on WisdomPrinciple via `python manage.py shell` → `from core.models import WisdomPrinciple; WisdomPrinciple._meta.get_field('life_context_bias')`
- [ ] Apply `0136` · verify tag-patch ingestion count matches report (105/111 + 76/82 + 160/185)
- [ ] Apply `0137` · verify 554 master rows got default surface_eligibility
- [ ] Apply `0138` · verify Ayurveda intervention_links no longer reference placeholder practice ids
- [ ] Apply `0139` · verify `mantra.shivoham` removed from `room_stillness/mantra` rotation
- [ ] Run `smoke_room_render --salt=post-apply-$(date +%s)` · expect 12/12 GREEN
- [ ] Run `smoke_room_sacred --user-id=1 --token=<dev-JWT>` · expect 12/12 GREEN
- [ ] Run `room_health_report` · expect BG cap OK, chip contract OK, no contamination warnings
- [ ] Tail logs for BG-cap-guard + surface_eligibility-guard WARN counts (should be 0 under steady-state)
- [ ] iOS sim smoke: launch pavani tip, load dashboard, enter each of 6 rooms, verify renderers

**Rollback path:** `python manage.py migrate core <previous>` one step at a time. Every migration has explicit reverse_code.

## 8. Safe to merge to `pavani` — checklist

**FE repo merge preconditions:**
- [ ] All FE commits this session (c866f86 / 4a8d4b3 / 9430f27 / 3d5863f / this session's commit) pushed to `pavani`
- [ ] `pavani` tip passes `npm run typecheck` (4 pre-existing errors expected per WAVE1_SYNTHESIS §P2)
- [ ] `pavani` tip passes `npm run lint` baseline
- [ ] Founder ACK on the 3 founder decisions (F1/F2/F3) — landed
- [ ] Founder ACK on the 14 curator items in WAVE2_OPERATIONALIZATION_SYNTHESIS §5.B (can be delegated; no founder time needed)

**Backend repo (kalpx) pre-apply checklist for Pavani:**
- [ ] All migration drafts committed on dev branch
- [ ] `python manage.py makemigrations --dry-run` shows no pending schema changes beyond the 10 listed
- [ ] `python scripts/validate_yaml_governance.py` passes (enforces v3.1 governance on new authoring)
- [ ] Runtime guards merged to `core/room_selection.py` (BG cap + surface_eligibility)
- [ ] Python tests (if any) pass on the seed-loading path

**Known-good landing state:**
- Wave 2 applied on dev: Release embodied (17 Ayurveda practices); Clarity context-shaped (Niti vs Sankhya on different contexts); Growth sankalp co-primary (9 anchor + 12 new); Joy slightly deeper (5 Bhakti banners + 13 new sankalps); Stillness sparse-spare; Connection Bhakti-present.
- Known thin: Stillness Vedanta breadth, Connection practice, Release × work_career / × daily_life, growth × work_career sankalp breadth. All Wave 3 candidates.

## 9. 9-tradition operationalization by room × class (post-apply)

Counts = rows in pool. Stars indicate primary-class tradition home per doctrine.

| Tradition | Stillness | Connection | Release | Clarity | Growth | Joy | Rooms touched | Dark remaining |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **BG** | 1 banner | 1 banner (18.66) | 6 banner ★ sparse | 7 principle (≤25% cap held at 13%) | 11 principle ★ + 4 banner | 7 sankalps (2.47 × work_career) | 6 | 14 |
| **Yoga Sūtras** | 1 banner + anchor support | 0 | 0 | 18 principle ★ (kleśa/vṛtti) + 2 teaching | 6 principle (abhyāsa/tapas) | 0 | 3 | 0 (saturated) |
| **Sankhya** | 0 | 0 | 1 banner | 15 principle ★ + 12 W2 rotation | 1 (svādhyāya) | 0 | 3 | 41 |
| **Bhakti** | 0 | 7 banner ★ + 11 W2 principles + 4 mantra anchors | 0 | 0 | 0 | 5 banner + 13 new sankalps ★ | 2 | 25 (single-lineage Wave 2; breadth = Wave 3 per F2) |
| **Dharma** | 0 | 1 (community) | 0 | 3 principle (dual-use) | 8 principle ★ Tier-2 | 0 | 2 | 12 |
| **Nīti** | 0 | 0 | 0 | 11 principle ★ + 18 W2 | 5 (work_career secondary) | 0 | 2 | **73** |
| **Dinacharya** | 0 | 2 banner | 0 | 5 principle | 10 principle ★ daily_life | 0 | 3 | 7 |
| **Ayurveda** | 1 practice (vāta-ground) | 1 banner | **5 banner + 17 practices = 22 ★** | 3 principle | 4 principle | 1 gated sankalp | 6 | 10 |
| **Yamas / Niyamas** | 0 | 0 | 2 banner (aparigraha) | 4 principle (satya / ahiṃsā / asteya) | 18 principle ★ (primary substrate) | 0 | 3 | 3 |

**Newly operational traditions (0% pre-W1 → ≥3 rooms post-apply):**
- Ayurveda ✓ (6 rooms)
- Dinacharya ✓ (3 rooms)
- Yamas/Niyamas ✓ (3 rooms)

**Single-most-under-used canonical family:** Nīti — 84 authored, 11 pooled pre-W2, 29 after 0135a/0136 = **still 66% dark.** KalpX's most differentiating family; Wave 3 priority to pool ~40-50 more.

**BG discipline:** holds. Clarity 7/54 = 13% (≤25% cap); Growth primary (11 — appropriate native home); Release sparse-banner-only; Joy 2.47 × work_career only; Connection 18.66 banner only; Stillness Ch 6.10-15 banner only.

## 10. Final mode state

- **Artifacts:** 1 final execution package (this doc) + 5 operationalization audits + earlier synthesis chain
- **Code:** 6 new/updated migrations + 1 schema migration (0135b load-bearing) + 1 runtime-guard update + 1 schema-CI validator script
- **Content:** 4 hygiene fixes landed (2 Sankhya reclassified + growth_money line + Dhanvantari link)
- **Ingestibility:** 341 of 378 tag-patch field-ops auto-apply; 12 curator-gated rows skip cleanly
- **Register:** 3 founder decisions + 14 curator delegable + 7 safe-execution + 5 hygiene — all accounted for

**Nothing else needs theorizing.** Apply the 10-migration chain on dev post founder ACK, resolve the standing smoke-state blocker, verify the 12/12 render, merge pavani to main.

---

## Appendix — File locations

**Migrations (kalpx/core/migrations/):**
- 0132_add_growth_sankalp_slot.py
- 0133_decontaminate_cross_room_rows.py
- 0134_expand_clarity_principle_pool.py
- 0135_seed_dark_tradition_principles.py
- **0135a_seed_phase_b_content.py** (NEW this pass)
- **0135b_add_v2_governance_to_wisdom_principle.py** (NEW this pass)
- 0136_ingest_tag_patches.py (finalized this pass)
- 0137_backfill_surface_eligibility.py (finalized this pass)
- **0138_rewire_ayurveda_intervention_links.py** (NEW this pass)
- **0139_swap_shivoham_in_stillness.py** (NEW this pass)

**Runtime guards:** `kalpx/core/room_selection.py` (BG cap + surface_eligibility)

**Schema-CI:** `kalpx/scripts/validate_yaml_governance.py`

**Hygiene fixes this pass (backend):**
- `core/data_seed/mitra_v3/principles_sankhya_wave2.yaml` — 2 stillness rows → clarity × self + inline governance
- `core/data_seed/mitra_v3/principles_bhakti_wave2.yaml` — Dhanvantari intervention_link target_id normalized to `mantra.dhanvantari_om_dhanvantaraye`
- `core/data_seed/sankalps_growth_wave2.json` — "10-year-horizon" phrases rewritten to "dhīra-buddhi" register

**Hygiene fixes this pass (FE docs):**
- `docs/room_system_v31/audits/TAG_PATCH_WAVE1B.yaml` — 2 Sankhya stillness rows updated to clarity × self per F-D2 lock
- `docs/room_system_v31/audits/FORWARD_REFERENCE_RESOLUTION.md` — 44 draft_link entries resolved / stripped

---

**End. Doctrine is locked. Content is ready. Migrations are drafted. Guards are in place. Apply at founder discretion.**
