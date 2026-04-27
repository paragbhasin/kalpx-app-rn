# Surface Isolation Re-Audit V3

**Agent:** Agent 9 — Surface Isolation Re-audit (Phase C, Wave 2 operationalization)
**Date:** 2026-04-21
**Scope:** English locale only; operational isolation verification post-W1b + W2
**Baseline:** SURFACE_ISOLATION_AUDIT_V2 (3 cross-room + 15 cross-surface + 13 intentional)
**Doctrine:** ROOM_SYSTEM_STRATEGY_V1 §5.7.5; OVERRIDE_LEDGER_V2 2-sig lock; TAG_PATCH_WAVE1 / WAVE1B / LIFE_CONTEXT_TAG_PATCH

---

## §A Executive verdict

**Operationally isolated: WITH-EXCEPTIONS, NOT-YET-APPLIED.**

- Doctrine is locked. Decontamination logic (migration 0133) is correctly coded and reverse-safe.
- No migration from the W1 decontamination set (0132–0135) has been applied against prod; they sit DRAFT pending 2-sig on the ledger.
- TAG_PATCH_WAVE1 is **substantially incomplete** — 111 rows authored vs 200 claimed in the header (see §B).
- TAG_PATCH_WAVE1B (82 rows) and LIFE_CONTEXT_TAG_PATCH (~189 rows per row_id count; grep reports 189 row_id occurrences) are complete and consistent with doctrine.
- 7 confirmed cross-room dual-use rows (different surface) need explicit OVERRIDE_LEDGER_V3 entries before migration apply (currently tracked in DECONTAMINATION_EXECUTION_LEDGER but not in the override ledger itself).
- 2 cross-room same-surface dual-use rows (yoga_abhyasa_steady_return, yamas_satya_clean_truth) remain founder-blocked on G-7.
- 15 cross-surface (room ↔ additionals) rows from CONTAMINATION_AUDIT_V1 are all re-confirmed on disk (backend repo copy) and are **not yet resolved** — all 15 still untagged at the master row level (surface_eligibility=[] on all 15).
- 2 Sankhya × stillness rows violate ROOM_TRADITION_V2 §Stillness avoid-list on a strict reading; patch proposes conservative banner-only routing but founder-call remains open.
- mantra.shivoham in stillness rotation is a Shaiva-tradition row in a Sankhya-/Shaiva-excluded room. Doctrinally problematic.

Net: rooms are NOT yet operationally isolated because (a) W1 decontamination migrations haven't applied, (b) TAG_PATCH_WAVE1 shipped incomplete, (c) 15-row cross-surface register is unresolved, (d) 2 founder calls block clean apply.

---

## §B TAG_PATCH_WAVE1 completeness

**Definitive row count: 111 rows (via `grep -c "row_id:"`).**

**Header claim:** 200 rows in 9 groups.
**Truth:** 4 groups authored, 5 groups missing. Breakdown:

| Group # | Name | Header target | Actual rows | Status |
|---|---|---:|---:|---|
| 1 | Growth-candidate sankalps | 26 | 29 | present (over-count by 3) |
| 2 | Currently-pooled clarity principles | 31 | 31 | present |
| 3 | Orphan Ayurveda principles | 24 | 24 | present |
| 4 | Orphan Yamas/Niyamas principles | 27 | 27 | present |
| 5 | Sankhya + Yoga-Sūtras | 36 | 0 | **MISSING** |
| 6 | Orphan Gita (selected) | 10 | 0 | **MISSING** |
| 7 | Joy subslot + Bhakti joy banner | 15 | 0 | **MISSING** |
| 8 | Connection Bhakti banner | 7 | 0 | **MISSING** |
| 9 | (no header present in file) | — | 0 | **MISSING** |
| — | **TOTAL** | 200 | **111** | **55.5% complete** |

- Group 1 actually contains 29 rows (includes `sankalp.begin_again`, `finish_what_start`, `learn_daily`, `effort_over_result` — 3 more than the 26 the header declared).
- Groups 2–4 match their header counts exactly.
- Groups 5–9 (89 rows, 44.5% of the headered workload) never authored. The file ends at row 2449 with `niyamas_make_the_inner_space_habitable` (last row of group 4). No group-header comments for 5–9 appear in the file.

**Answer to founder call:** TAG_PATCH_WAVE1 is **not complete**. 89 rows missing across 5 groups (Sankhya/YS, Gita selected, Joy subslot+Bhakti joy banner, Connection Bhakti banner, and group 9 which the header never named beyond the 9-group claim).

---

## §C Cross-room contamination post-W1b + W2

### §C.1 V2 cross-room rows (3 rows) — status after 0133 applies

| row_id | V2 state | 0133 action | Post-0133 state | Classification |
|---|---|---|---|---|
| `mantra.soham` | stillness (anchor) + connection (rotation) | remove from room_connection | stillness-only anchor | (a) RESOLVED by decontamination |
| `practice.hand_on_heart` | stillness + connection rotations | remove from room_connection | stillness-only rotation | (a) RESOLVED by decontamination |
| `yoga_sutras_one_anchor_when_scattered` | stillness (anchor) + clarity (banner rotation) | remove from room_clarity/wisdom_banner (replacement `yoga_use_one_truthful_anchor` added via 0134) | stillness-only anchor | (a) RESOLVED by decontamination |

All 3 resolved by migration 0133 — **contingent on 0133 being applied** (currently DRAFT, 2-sig pending).

### §C.2 New cross-room dual-use candidates (W2 authoring)

Per ROOM_POOL_PLAN_V3 §dual_use_summary.intentional_cross_room and DECONTAMINATION_EXECUTION_LEDGER Parts B + C, Wave 2 authoring introduced 7 cross-room dual-use rows:

| row_id | rooms served | surface split | Classification |
|---|---|---|---|
| `sankhya_witness_before_interpretation` | clarity (principle) + release (wisdom_banner) | DIFFERENT surface | (a) §5.7.5 acceptable, OVERRIDE entry required (G-6) |
| `bhakti_gratitude_keeps_the_heart_open` | connection (wisdom_banner) + joy (wisdom_banner) | SAME surface, different tone/tag | (c) NEW cross-room, OVERRIDE entry required (G-4 scope) |
| `bhakti_offer_the_moment_not_only_the_ritual` | connection (wisdom_banner) + joy (wisdom_banner) | SAME surface, different tone/tag | (c) NEW cross-room, OVERRIDE entry required |
| `dina_pre_meeting_arrive_before_you_speak` | connection (wisdom_banner) + clarity (principle) | DIFFERENT surface | (a) §5.7.5 acceptable, OVERRIDE entry required (G-5) |
| `dina_sunday_reset_restore_the_weekly_rhythm` | connection (wisdom_banner) + clarity (principle) | DIFFERENT surface | (a) §5.7.5 acceptable, OVERRIDE entry required (G-5) |
| `yoga_abhyasa_steady_return` | clarity (principle) + growth (principle) | SAME surface | (c) NEW cross-room SAME-surface — founder_call G-7 |
| `yamas_satya_clean_truth` | clarity (principle) + growth (principle) | SAME surface | (c) NEW cross-room SAME-surface — founder_call G-7 |

### §C.3 Intentional within-room dual-use (§5.7.5 zone)

13 pre-existing rows + 4 new rows authored in growth via 0135 (`yamas_tapas_warmth_not_punishment`, `niyamas_santosha_rest_in_enough`, `gita_no_effort_is_lost`, `gita_lift_by_abhyasa_and_detachment`) = **17 within-room dual-use rows** post-W1. All (b) classification per §5.7.5 — intentional, no override required.

### §C.4 Summary

- V2 cross-room (3 rows): all (a) RESOLVED by 0133 (pending apply).
- W2 new cross-room (7 rows with different-surface): all (a) acceptable §5.7.5 but need OVERRIDE_LEDGER_V3 entries with 2-sig.
- W2 new cross-room SAME-surface (2 rows): (c) founder_call G-7 blocks apply.
- Within-room dual-use (17 rows): (b) doctrinally locked, no action.

---

## §D Cross-surface contamination post-W2

### §D.1 Source document availability

CONTAMINATION_AUDIT_V1.md is **present** at `/Users/paragbhasin/kalpx/docs/room_system_v31/audits/CONTAMINATION_AUDIT_V1.md` (backend repo). The V2 audit and V3 execution ledger both claimed this file was not on disk — that claim was wrong. The 15 rows ARE enumerable.

### §D.2 Enumerated 15 cross-surface rows

All 15 rows still present on disk; all 15 still have `surface_eligibility=[]` per CONTAMINATION_AUDIT_V1 live findings. No Wave 1 migration (0117–0135) backfills `surface_eligibility` on master mantra/sankalp/practice rows.

| row_id | room (slot) | additionals surface | Post-W2 status |
|---|---|---|---|
| `practice.anahata_humming` | connection (practice anchor) | additional (relationships × 3) | UNRESOLVED; surface_eligibility=[] |
| `practice.anahata_meditation` | connection (practice rotation) | additional (wealth + relationships) | UNRESOLVED |
| `practice.bhramari` | release (practice anchor) | additional (career/wealth/relationships) | UNRESOLVED |
| `practice.centering_drishti` | clarity (practice anchor) | additional (relationships × 2) | UNRESOLVED |
| `practice.focus.ten_second_pause` | clarity (practice rotation) | additional (career/imposter) | UNRESOLVED |
| `practice.four_four_six` | stillness (practice rotation) | additional (career/wealth/relationships) | UNRESOLVED |
| `practice.heart_breath_release` | release (practice rotation) | additional (relationships × 3+) | UNRESOLVED |
| `practice.one_sankalp_action` | growth (practice rotation) | additional (career/wealth) | UNRESOLVED |
| `practice.palm_soothing` | stillness (practice rotation) | additional (relationships × 3+) | UNRESOLVED |
| `practice.self_acceptance_pause` | growth (practice rotation) | additional (career + relationships) | UNRESOLVED |
| `notice_blessings` | joy (sankalp_gratitude rotation) | additional (wealth × 2) | UNRESOLVED |
| `sankalp.give_grace` | joy (sankalp_blessings anchor) | additional (relationships × 3) | UNRESOLVED |
| `sankalp.invite_abundance_gently` | joy (sankalp_blessings rotation) | additional (wealth × 2) | UNRESOLVED |
| `thank_three` | joy (sankalp_gratitude rotation) | additional (wealth + relationships) | UNRESOLVED |
| `work_as_offering` | joy (sankalp_seva rotation) | additional (wealth/unfulfilled_wealth) | UNRESOLVED |

**4 of 15 are ANCHORs** (anahata_humming, bhramari, centering_drishti, sankalp.give_grace). Removing these requires pool re-authoring, not a simple cross-surface tag update.

### §D.3 Doctrinal question (STRATEGY §3)

STRATEGY §3 rule: "Core triad content and Additional content must not appear in room pools by default." The 15 rows are the opposite direction (room-pool row also curated into additionals) but the isolation principle is identical. Either:
- ADD `surface_eligibility=[support_room, additional]` with 2-sig OVERRIDE entries (legitimizes today's behavior), OR
- REMOVE from one surface (cleaner but may require pool re-authoring for the 4 anchors).

No migration currently does either. Blocker reconfirmed.

---

## §E Wrong-surface leakage

### §E.1 Methodology

Checked Phase B inline seed files for `surface_eligibility` vs pool-target slot alignment.

### §E.2 Findings

- **`practices_ayurveda_wave2.json`** (17 rows): all carry `surface_eligibility=[practice_anchor, practice_rotation]` with `pool_role ∈ {anchor, rotation}`. Targets are release/growth/clarity/stillness/connection practice slots. Consistent.
- **`sankalps_growth_wave2.json`** (12 rows): all carry `surface_eligibility` with `sankalp_anchor` or `sankalp_rotation`. Target = growth sankalp slot. Consistent.
- **`sankalps_joy_work_career_wave2.json`** (7 rows) + **`sankalps_joy_health_energy_wave2.json`** (6 rows): all carry `sankalp_*` surface eligibility. Targets = joy sub-slot pools. Consistent.
- **`principles_bhakti_wave2.yaml`** (11 rows): all target `room_fit=[connection]` with `surface_eligibility=[wisdom_teaching, wisdom_banner]` (10 rows) or `[wisdom_teaching, wisdom_banner, wisdom_reflection]` (1 row). **ISSUE:** original 0129-era doctrine parked connection wisdom_teaching ("deferred_v2 per Chip Contract v1.1"). These 11 rows authoring `wisdom_teaching` eligibility on connection is doctrinally ahead of where the connection room's wisdom_teaching slot is approved for activation. Not a runtime leak today (no pool references these rows yet) but a pool-plan forward-leak. Flag **E-1**.
- **`principles_gita_wave2_release.yaml`** (4 rows): all `room_fit=[release]` with `surface_eligibility=[wisdom_banner]` only. Correct per §Release "sparse banner only" doctrine.
- **`principles_niti_wave2.yaml`** (68 rows total): 18 rows have inline `room_fit` + `surface_eligibility` (Agent 4 authoring, post-F); 50 rows lack inline fields and are tagged via TAG_PATCH_WAVE1B (Agent F). TAG_PATCH_WAVE1B assigns all 50 to `clarity` or `growth` with `[wisdom_teaching, wisdom_reflection]` or `[wisdom_reflection]`. Consistent.
- **`principles_sankhya_wave2.yaml`** (44 rows total): 12 rows have inline `room_fit` + `surface_eligibility` (Agent 5); 32 rows tagged via TAG_PATCH_WAVE1B (Agent G). Group O (2 rows, stillness × self) routed via wisdom_banner only — conservative per DF-2.

### §E.3 Verdict

No wrong-surface leaks in the sense of principle rows sitting in practice pools or vice versa. One doctrinal-forward-leak at E-1 (bhakti wave2 authoring wisdom_teaching on connection). No rotation_refs in 0120–0135 currently reference these bhakti_wave2 rows into a connection wisdom_teaching pool (that pool isn't seeded), so runtime is safe today. But if a future 0136 seeds them, it must first unlock the connection wisdom_teaching pool — parked per chip contract.

---

## §F Governance-field completeness

### §F.1 Per the task-brief checklist

| Group | Rows | Source | Governance fields present? |
|---|---:|---|---|
| Agent G — original Sankhya (32) | 32 | principles_sankhya_wave2.yaml (lines not tagged inline) | **No, by design** — tagged via TAG_PATCH_WAVE1B (82-row patch). Inline source YAML intentionally unmodified. Runtime depends on patch being materialized into DB. |
| Agent F — original Niti (50) | 50 | principles_niti_wave2.yaml (lines not tagged inline) | **No, by design** — same story. Tagged via TAG_PATCH_WAVE1B. |
| Agent 4 — new Niti (18) | 18 | principles_niti_wave2.yaml (inline tagged) | **Yes** — 18 rows with anchored `^    room_fit:` and `^    surface_eligibility:` inline. |
| Agent 5 — new Sankhya (12) | 12 | principles_sankhya_wave2.yaml (inline tagged) | **Yes** — 12 rows with anchored inline governance fields. |
| Agent 6 — Ayurveda practices (17) | 17 | practices_ayurveda_wave2.json | **Yes** — 68 governance-field occurrences (4 fields × 17 rows). |
| Agent 7 — 40 new rows across 5 files | 40 | sankalps_growth_wave2.json (12) + sankalps_joy_work_career_wave2.json (7) + sankalps_joy_health_energy_wave2.json (6) + principles_bhakti_wave2.yaml (11) + principles_gita_wave2_release.yaml (4) = 40 | **Yes** — every row carries `room_fit` / `surface_eligibility` / `life_context_bias` / `pool_role` inline. |

### §F.2 Rows missing governance fields (pool-eligible only)

- Agent G's 32 Sankhya + Agent F's 50 Niti = **82 rows**, pool-eligible, inline source YAML carries **0 of 82** v3.1 governance fields. Correctly covered by TAG_PATCH_WAVE1B.
- Gap: if TAG_PATCH_WAVE1B isn't materialized by a DB migration, these 82 rows fail `_row_passes_hard_filter` at runtime because `surface_eligibility=[]`. Migration 0130 added the columns but does not backfill. **No migration in 0117–0135 materializes TAG_PATCH_WAVE1B into the DB.** Same applies to TAG_PATCH_WAVE1's 111 rows and LIFE_CONTEXT_TAG_PATCH's ~189 rows.
- 554 master-JSON rows (200 mantras + 159 sankalps + 195 practices) remain at `surface_eligibility=[]` per CONTAMINATION_AUDIT_V1 structural finding. No Wave 1 backfill. Runtime works only if an out-of-tree backfill was applied, or the hard filter is bypassed somewhere.

### §F.3 Aggregate governance-field gap

- **Tagged-by-patch (not yet materialized to DB):** 111 (WAVE1) + 82 (WAVE1B) + ~189 (LIFE_CONTEXT) = ~382 row-patches pending DB migration.
- **Pool-eligible rows still missing governance fields (even after all patches materialize):** 18 Niti (inline) + 12 Sankhya (inline) + 40 Agent-7 + 17 Ayurveda = 87 rows have inline tags but also need DB materialization via a Phase B ingestion migration (not yet drafted).

---

## §G Implicit overrides

Per STRATEGY §1 decision 5, a row serving 2+ rooms or 2+ surfaces without an OVERRIDE_LEDGER entry with 2-sig is an implicit override. Enumeration:

1. `sankhya_witness_before_interpretation` — clarity + release (different surface) — NO ledger entry yet → **implicit**
2. `bhakti_gratitude_keeps_the_heart_open` — connection + joy (same surface, different tone) — NO ledger entry → **implicit**
3. `bhakti_offer_the_moment_not_only_the_ritual` — connection + joy (same surface, different tone) — NO ledger entry → **implicit**
4. `dina_pre_meeting_arrive_before_you_speak` — connection + clarity (different surface) — NO ledger entry → **implicit**
5. `dina_sunday_reset_restore_the_weekly_rhythm` — connection + clarity (different surface) — NO ledger entry → **implicit**
6. `yoga_abhyasa_steady_return` — clarity + growth (same surface) — NO ledger entry; founder_call G-7 → **implicit + blocked**
7. `yamas_satya_clean_truth` — clarity + growth (same surface) — NO ledger entry; founder_call G-7 → **implicit + blocked**
8–22. 15 cross-surface rooms↔additionals rows enumerated in §D.2 — NO ledger entries → **implicit × 15**

**Total implicit overrides: 22 rows** awaiting OVERRIDE_LEDGER_V3 entries + 2-sig. Populated in Artifact 2.

---

## §H Task 7 direct answers

**H.1 — Is TAG_PATCH_WAVE1 complete?**
**NO.** 111 rows authored of 200 claimed. Groups 1–4 present (99 rows against a 108-row target; group 1 overshoots by 3, group 2–4 match). Groups 5–9 entirely missing (89-row gap). The file has no group-header comment for groups 5–9.

**H.2 — Do Agent G's 32 original Sankhya rows still need governance field backfill?**
**NO (if TAG_PATCH_WAVE1B gets materialized to DB); YES (today — patch not yet in DB).** TAG_PATCH_WAVE1B covers all 32 G-rows with full governance fields. Source YAML is intentionally unmodified per Wave 1b contract. The patch is curator-gated and must be converted into a migration that reads YAML + patch and writes DB rows. No such migration exists in 0117–0135.

**H.3 — Do the 2 Sankhya × stillness rows (`sankhya_rest_in_the_non_participating_witness`, `sankhya_kaivalya_is_the_direction_of_stillness`) violate ROOM_TRADITION_V2 §Stillness?**
**YES on strict reading.** ROOM_TRADITION_V2 §Stillness Avoid-list explicitly includes Sankhya. WAVE1_SYNTHESIS §2.1 classifies stillness as principle-class excluded (wisdom_banner only). TAG_PATCH_WAVE1B Group O routes both via `surface_eligibility=[wisdom_banner]` + `pool_role=rare` to respect §2.1 class exclusion, but the tradition-exclusion remains. DF-2 founder-call is explicit. **Recommendation:** route to clarity × self (option b) — register fits clarity's viveka native and removes doctrinal tension. This is a curation judgment — not an operational blocker if founder approves banner-only routing.

**H.4 — Is `mantra.shivoham` in stillness rotation a real doctrinal problem or acceptable exception?**
**REAL PROBLEM on strict reading.** Shivoham is a Shaiva bija (Śivo'ham = "I am Śiva"). ROOM_TRADITION_V2 §Stillness Avoid-list explicitly includes "Tantric-Shaiva." Shaiva register belongs in room_release (§Release Dominant = Shaiva/Tantric). ROOM_POOL_PLAN_V3 §G-3 flags this exact question. **Recommendation:** swap for a Vedanta-witness equivalent (e.g. `aham brahmasmi` light-register, or Upanishadic peace-mantra) and move `mantra.shivoham` to release or keep it parked. If retained in stillness, requires explicit OVERRIDE entry per STRATEGY §3 with 2-sig. Pre-existing condition (0120 seed) — not a W2 regression.

---

## §I Task 8 direct answers

**I.1 — Are rooms now operationally isolated (not just doctrinally)?**
**NO, not yet.** Four gates:
1. Migrations 0132–0135 (growth sankalp slot + 3-row decontamination + clarity expansion + dark-tradition seed) are DRAFT, unapplied. Until applied, V2's 3 cross-room contaminations persist live.
2. TAG_PATCH_WAVE1 (111 rows), TAG_PATCH_WAVE1B (82), LIFE_CONTEXT_TAG_PATCH (~189) have no ingestion migration. Master rows still `surface_eligibility=[]` per CONTAMINATION_AUDIT_V1 — runtime hard-filter at `room_selection._row_passes_hard_filter` rejects them (if filter active).
3. 15 cross-surface rows (room pools ↔ additionals) unresolved at master row level.
4. 7 new implicit cross-room overrides + 2 same-surface founder-blocked need OVERRIDE_LEDGER_V3 entries before 0134/0135 can safely apply.

Doctrine IS isolated. Code IS correctly written. The WIRING from doctrine → code → data is incomplete.

**I.2 — V2 contamination status:**

| V2 flag | Count | Post-W1b+W2 status |
|---|---:|---|
| Cross-room (critical + medium) | 3 | RESOLVED-IN-PLAN; pending 0133 apply |
| Cross-surface (room ↔ additionals) | 15 | UNRESOLVED; 15 rows still enumerated, none tagged, no migration |
| Intentional within-room dual-use | 13 | FALSE-POSITIVE (confirmed); documented §5.7.5. 4 more added by Wave 1 (now 17 total). |
| Surface_eligibility=[] on master rows | 554 rows | UNRESOLVED; no backfill migration. Biggest outstanding operational risk. |

---

## §J False-positive register

V2 flags that are intentional §5.7.5 dual-use (no action required):

- **13 pre-existing wisdom-asset rows** reused within room_clarity or room_growth across principle / wisdom_banner / wisdom_teaching / wisdom_reflection slots. Documented in STRATEGY §5.7.5, OVERRIDE_LEDGER_V2 `intentional_cross_surface_uses.count=13`, SURFACE_ISOLATION_V2 §C Part D.
- **4 new within-room dual-use rows** added by Wave 1 0135 in room_growth: `yamas_tapas_warmth_not_punishment`, `niyamas_santosha_rest_in_enough`, `gita_no_effort_is_lost`, `gita_lift_by_abhyasa_and_detachment` (principle + wisdom_banner or principle + wisdom_teaching within growth).
- **Total: 17 within-room dual-use rows** — all locked by doctrine §5.7.5.

---

## §K Real problems requiring action (prioritized)

### K.1 — P0 (blocks Wave 1 apply)

1. **TAG_PATCH_WAVE1 is 45% incomplete** (89 rows unfinished across 5 groups). Authoring gap. Groups 5–9 (Sankhya/YS orphans, Gita selected, Joy subslot + Bhakti joy banner, Connection Bhakti banner) never landed. Action: founder choice — (a) reschedule to Wave 1c, (b) mark groups 5–9 deferred to Wave 2 explicitly, (c) author now.
2. **No ingestion migration materializes TAG_PATCH_WAVE1 / WAVE1B / LIFE_CONTEXT_TAG_PATCH into the DB.** Without this, Rule 5 cannot discriminate Wave 2-authored rows. Action: draft `0136_ingest_tag_patches.py` reading the 3 patches + writing master row fields.
3. **554 master rows still `surface_eligibility=[]`.** Runtime hard-filter at `room_selection.py:144` rejects rows without `"support_room"` in surface_eligibility. Either prod rows were backfilled out-of-tree (unverified) OR the filter is bypassed in practice. Action: live-query dev DB on a sample room-pool item_id; if empty, draft a blanket backfill migration.

### K.2 — P1 (blocks clean isolation verification)

4. **15 cross-surface rooms↔additionals rows remain unresolved.** All 15 still `surface_eligibility=[]` at the master row level. Pool + curated additionals surface the same rows today. Action: either 15-row REMOVE decisions OR 15-row DUAL-USE-OVERRIDE entries with 2-sig per STRATEGY §3.
5. **OVERRIDE_LEDGER_V3 is empty but needs 7 dual-use-override entries + 2 founder-call entries** covering the new cross-room rows from W2 authoring (B.1–B.5 of DECONTAMINATION_EXECUTION_LEDGER) + 2 same-surface rows (C.1, C.2) + 15 cross-surface (§D). Total 24 entries. Artifact 2 populates them.
6. **Founder calls G-3 (mantra.shivoham in stillness) and DF-2 (2 Sankhya × stillness rows) doctrinally unresolved.** Both touch §Stillness tradition purity. Action: single founder session covering both + G-7 (C.1/C.2 same-surface dual-use).

### K.3 — P2 (hygiene)

7. **Connection `wisdom_teaching` slot parked by chip contract v1.1 but bhakti_wave2 authoring pre-populates `wisdom_teaching` eligibility on 11 rows.** Not a live leak — no pool references those rows yet. Action: add note to bhakti_wave2 that wisdom_teaching eligibility is dormant-until-slot-activation.
8. **DECONTAMINATION_EXECUTION_LEDGER claimed CONTAMINATION_AUDIT_V1.md is absent from disk; it is present in backend repo at `/Users/paragbhasin/kalpx/docs/room_system_v31/audits/CONTAMINATION_AUDIT_V1.md`.** The ledger's blocker note on Part E is out-of-date. Action: update ledger Part E to cite the present file and enumerate the 15 rows with proposed dispositions.
9. **No runtime defense-in-depth assertion** guards pool integrity. `room_selection.py` should assert any row entering a pool carries non-empty `surface_eligibility` + non-empty `room_fit`. Action: add `assert_pool_row_integrity` helper. ROOM_GOVERNANCE_FIELD_GAP_REPORT §D already drafts this.

---

## §L Founder-call register additions

### §L.1 Doctrinal (preserve the 4 user-listed founder calls)

- **L-doc-1 — TAG_PATCH_WAVE1 completeness:** 111 of 200. Founder decision: author groups 5–9 before apply (+89 rows), OR mark deferred to Wave 1c / Wave 2 with explicit deletion of the 200 header claim and replacement with 111.
- **L-doc-2 — Agent G's 32 Sankhya rows governance-field materialization:** rows are tagged via TAG_PATCH_WAVE1B but NO ingestion migration exists. Founder decision: (a) author ingestion migration that materializes all 3 patches, (b) defer to Wave 1c.
- **L-doc-3 — 2 Sankhya × stillness rows (`sankhya_rest_in_the_non_participating_witness`, `sankhya_kaivalya_is_the_direction_of_stillness`):** violate §Stillness tradition avoid-list (Sankhya excluded). TAG_PATCH_WAVE1B proposes option (a) — banner-only routing — as conservative compromise. Founder choices: (a) accept banner-only, (b) re-route to clarity × self, (c) reject for stillness entirely.
- **L-doc-4 — `mantra.shivoham` in stillness rotation:** Shaiva bija in Shaiva-excluded room. Violates §Stillness strict reading. Pre-existing 0120 seed — not W2 regression. Founder choices: (a) swap for Vedanta-witness equivalent (e.g. aham-brahmasmi or om-shanti-light), (b) retain with 2-sig OVERRIDE entry + documented rationale, (c) move to release.

### §L.2 Curation

- **L-cur-1 — Cross-room same-surface dual-use (G-7):** `yoga_abhyasa_steady_return` + `yamas_satya_clean_truth` in both clarity AND growth principle pools. §5.7.5 is silent on same-surface cross-room. Strict read forbids. Options: keep both (create OVERRIDE entries), remove one (growth-primary for abhyasa; clarity-primary for satya × relationships), OR invoke §5.7.5 extension rule.
- **L-cur-2 — 15 cross-surface rooms↔additionals rows:** per-row REMOVE decisions vs blanket rule (room-sovereign default with OVERRIDE tagging for offering-family joy sankalps). 4 are anchors requiring pool re-authoring if removed.
- **L-cur-3 — Bhakti joy banner count (G-4):** 5 vs 3–4 target band. 0135 assertion requires >=3 so 5 is non-blocking but off-spec.
- **L-cur-4 — Growth-sankalp 9-row subset in 0132 vs Group 1's 26 candidates (G-1):** Agent D's original Group 1 intent not cross-checked against 0132's chosen 9. Without this, growth anchor selection lacks curator concurrence.

### §L.3 Implementation hygiene

- **L-impl-1 — Draft `0136_ingest_tag_patches.py`** reading all 3 patch YAMLs + writing master row governance fields. Blocks Wave 1b materialization.
- **L-impl-2 — Draft `0137_backfill_surface_eligibility_master_rows.py`** for the 554 master rows. Either `[]` + explicit exclusion OR `[support_room]` per room-pool membership.
- **L-impl-3 — Add runtime pool-integrity assertion** in `room_selection.py`: any pool row must carry non-empty `surface_eligibility` AND non-empty `room_fit` or raise `PoolIntegrityError`.
- **L-impl-4 — Update DECONTAMINATION_EXECUTION_LEDGER Part E** to cite the present backend-repo copy of CONTAMINATION_AUDIT_V1.md and enumerate the 15 rows with proposed dispositions.
- **L-impl-5 — Populate OVERRIDE_LEDGER_V3.yaml** with the 7 + 2 + 15 = 24 new entries (Artifact 2 of this audit).

---

## Citations

- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/ROOM_SYSTEM_STRATEGY_V1.md` §1 §3 §5 §5.7.5 §8
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/SURFACE_ISOLATION_AUDIT_V2.md`
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/OVERRIDE_LEDGER_V2.yaml`
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/ROOM_POOL_PLAN_V3.yaml` §dual_use_summary §founder_calls_needed
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/DECONTAMINATION_EXECUTION_LEDGER.md` Parts A–F
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/TAG_PATCH_WAVE1.yaml` (111 rows definitive)
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/TAG_PATCH_WAVE1B.yaml` (82 rows, DF-2 + DF-3 flags)
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/LIFE_CONTEXT_TAG_PATCH.yaml` (~189 rows)
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/ROOM_GOVERNANCE_FIELD_GAP_REPORT.md`
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/ROOM_TRADITION_ASSIGNMENT_V2.md` §Stillness §Connection §Growth §Joy
- `/Users/paragbhasin/kalpx/docs/room_system_v31/audits/CONTAMINATION_AUDIT_V1.md` (backend repo copy — 15-row enumeration)
- `/Users/paragbhasin/kalpx/core/migrations/0120_seed_room_pools_v1.py` line 44 (mantra.shivoham)
- `/Users/paragbhasin/kalpx/core/migrations/0130_tagging_v2_governance_fields.py`
- `/Users/paragbhasin/kalpx/core/migrations/0132_add_growth_sankalp_slot.py` (DRAFT)
- `/Users/paragbhasin/kalpx/core/migrations/0133_decontaminate_cross_room_rows.py` (DRAFT)
- `/Users/paragbhasin/kalpx/core/migrations/0134_expand_clarity_principle_pool.py` (DRAFT)
- `/Users/paragbhasin/kalpx/core/migrations/0135_seed_dark_tradition_principles.py` (DRAFT)
- `/Users/paragbhasin/kalpx/core/data_seed/mitra_v3/principles_{niti,sankhya,bhakti,gita}_wave2.yaml`
- `/Users/paragbhasin/kalpx/core/data_seed/{practices_ayurveda,sankalps_growth,sankalps_joy_*}_wave2.json`
