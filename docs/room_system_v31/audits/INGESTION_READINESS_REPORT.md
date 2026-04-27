# Ingestion Readiness Report — Wave 2 Operationalization

**Status:** DRAFT — FOUNDER REVIEW PENDING
**Date:** 2026-04-21
**Agent:** Wave 2 Operationalization Pass — Agent 1
**Scope:** Make ingestion of TAG_PATCH_WAVE1 + TAG_PATCH_WAVE1B + LIFE_CONTEXT_TAG_PATCH actually possible. Identify post-ingestion rows that will still fail room eligibility.
**Locale scope:** English (en) only.

No doctrine is (re)opened. Doctrine is treated as LOCKED per `WAVE2_FINAL_SYNTHESIS.md` + `ROOM_SYSTEM_STRATEGY_V1.md`.

---

## §A Target schema identification

### A.1 Model-to-YAML field map

| YAML key | Target Django model | Column | Type | Source migration |
|---|---|---|---|---|
| `proposed_tags.tradition_family` | `WisdomPrinciple` | `tradition_family` | CharField(choices, max=32) | 0001/0110 pre-existing |
| `proposed_tags.tradition` | `MasterMantra` · `MasterSankalp` · `MasterPractice` · `WisdomAsset` | `tradition` | JSONField(list) | 0117 |
| `proposed_tags.room_fit` | all 5 tagged models (mantra, sankalp, practice, principle, asset) | `room_fit` | JSONField(list) | 0117 |
| `proposed_tags.surface_eligibility` | all 5 | `surface_eligibility` | JSONField(list) | 0117 |
| `proposed_tags.pool_role` | all 5 | `pool_role` | CharField(choices, max=16) | 0117 |
| `proposed_tags.intensity` | all 5 | `intensity` | CharField(choices, max=12) | 0117 |
| `proposed_tags.action_family` | all 5 | `action_family` | CharField(choices, max=16) | 0117 |
| `proposed_tags.emotional_function_tag` | `MasterMantra` · `MasterSankalp` · `MasterPractice` · `WisdomAsset` · `RoomContentPool` | `emotional_function_tag` | CharField(choices, max=16) | 0130 |
| `proposed_tags.life_context_bias` | same 5 as emotional_function_tag | `life_context_bias` | JSONField(list) | 0130 |
| `proposed_tags.standalone_safe_flag` | same 5 | `standalone_safe_flag` | BooleanField | 0130 |
| `proposed_tags.repeat_tolerance_level` | same 5 | `repeat_tolerance_level` | CharField(choices, max=8) | 0130 |
| `proposed_tags.misuse_risk` | same 5 | `misuse_risk` | TextField(null) | 0130 |
| `proposed_tags.exclude_from_contexts` | — | no column (needs new column OR store in `context_tags` with `-` prefix OR defer) | N/A | NOT MIGRATED |
| `proposed_tags.sankalp_register` | — | no column (YAML annotation only) | N/A | NOT MIGRATED |
| `proposed_life_context_bias` (LIFE_CONTEXT_TAG_PATCH) | mantra/sankalp/practice tables | `life_context_bias` | JSONField(list) | 0130 |
| `proposed_exclude_from_contexts` (LIFE_CONTEXT_TAG_PATCH) | — | no column | N/A | NOT MIGRATED |
| `CURATOR_GATE` / `uncertainty` / `justification` / `rationale` | all 5 | packed into `curator_notes` (TextField) + `needs_curator_review` (Bool) | — | 0117/0130 existing |

### A.2 Principle-row targeting gap (load-bearing)

`WisdomPrinciple` (seed `priniciples_*.yaml` models) received the Wave-1 v3.1 fields in migration 0117 (`room_fit`, `surface_eligibility`, `pool_role`, `intensity`, `action_family`, `spiritual_mode`, etc.) but **did NOT receive the v2 governance supporting-tag columns from 0130** (`life_context_bias`, `emotional_function_tag`, `misuse_risk`, `standalone_safe_flag`, `repeat_tolerance_level`, `curator_notes`, `selection_justification`, `review_status`, `banner_eligible`, `teaching_eligible`, `reflection_eligible`, `surface_override_*`).

Verified in `/Users/paragbhasin/kalpx/core/models.py`:

- `life_context_bias` column lives on lines **3124** (MasterMantra), **3245** (MasterSankalp), **3386** (MasterPractice), **8470** (WisdomAsset), **8738** (RoomContentPool).
- No `life_context_bias` on `WisdomPrinciple` (lines 6902–7015).

**Implication for ingestion:** 82 of 111 WAVE1 rows + 82 of 82 WAVE1B rows + 107 of 185 LIFE_CONTEXT rows are `class: principle` — they cannot have `life_context_bias` / `misuse_risk` / `standalone_safe_flag` / `repeat_tolerance_level` / `emotional_function_tag` written to the DB, because those columns do not exist on `WisdomPrinciple`.

Three paths:

- **(P-a)** Ship a pre-requisite schema migration (`0135b_add_v2_governance_to_wisdom_principle.py`) that adds the 11 missing columns before 0136 runs. Additive, no backfill. Straightforward.
- **(P-b)** Restrict 0136 to write only the subset of fields that WisdomPrinciple already has (`room_fit`, `surface_eligibility`, `pool_role`, `intensity`, `action_family`) and log `life_context_bias` + friends as deferred. Rule 5 loses principle-context discrimination until P-a lands.
- **(P-c)** Store principle-scoped life_context_bias in `RoomContentPool.life_context_bias` at pool-level rather than at principle-level. Breaks per-row fidelity but unblocks Wave 2.

**Recommendation:** P-a. Draft `0135b` as a pre-req of 0136. Columns are copies of MasterMantra's existing definitions. No data risk (all additive, null/default). Decision: **FOUNDER ACK required** before drafting.

Per Wave 2 directive, 0136 draft below explicitly targets WisdomPrinciple for `room_fit`/`surface_eligibility`/`pool_role`/`intensity`/`action_family` only, and RuntimeErrors when attempting to write `life_context_bias` / `misuse_risk` / `standalone_safe_flag` / `repeat_tolerance_level` / `emotional_function_tag` on a principle row (schema mismatch). That means the principle rows will ingest pool-eligibility fields cleanly but drop the life_context_bias layer until P-a ships. This is explicit, not silent.

### A.3 Missing column: `exclude_from_contexts`

All 3 patches populate `exclude_from_contexts` (stillness rows, sankhya × joy, release × purpose_direction, etc.). No column exists for it on any model. Options:

- Add column to mantra/sankalp/practice/principle/asset/pool (7 additional AddField ops in a 0135c). Net-safe.
- Encode into `context_tags` as negation entries (e.g. `"-money_security"`). Rule 5 selector would need to handle the negation.
- Drop on ingestion; rely on runtime room-context allow/exclude policy table as the exclusion authority.

**Recommendation:** drop-on-ingestion (third option). `room_context_policy` already enumerates per-room excludes (per `LIFE_CONTEXT_TAG_PATCH.yaml` lines 60–80 and `WAVE2_FINAL_SYNTHESIS` Table 1). Per-row exclude only matters for the ~6 edge-case rows with row-level overrides (e.g. sankhya × joy `exclude_from_contexts: [money_security]` — already excluded at joy-room level). Zero runtime risk from dropping. Log the intent in `curator_notes`. Decision: **safe-to-execute**; 0136 draft adopts this.

---

## §B Per-patch ingestion readiness

### B.1 TAG_PATCH_WAVE1.yaml — 111 rows

| Metric | Count |
|---|---:|
| Total rows | **111** |
| `class: sankalp` | 29 |
| `class: principle` | 82 |
| `CURATOR_GATE: true` | 111 (100%) |
| Rows with empty `uncertainty: []` | 105 |
| Rows with populated `uncertainty[]` (curator-review-required) | **6** |

**Rows with non-empty `uncertainty[]` (curator-review-required, SKIP on auto-ingest):**

1. `sankalp.release_limiting_beliefs` — "wording-collision-with-release-room"
2. `sankalp.work_as_worship` — "joy co-tag — curator"
3. `sankhya_witness_as_friend` — "connection fit — sankhya normally excluded"
4. `sankhya_witness_joy_without_clinging` — "doctrinal-edge — sankhya typically excluded from joy"
5. `yoga_sutras_one_anchor_when_scattered` — "dual-room — curator verify stillness banner vs clarity teaching"
6. `ayur_regular_meals_reduce_reactivity` — "dual-room placement — curator verify"

**Ingestible under auto-rule (CURATOR_GATE + empty uncertainty[]):** **105 of 111** rows.
**Blocked (CURATOR_GATE + populated uncertainty[]):** **6 of 111** rows → status=`needs_curator_review`, no field writes beyond `curator_notes` marker.

**Target models:**
- 29 sankalp rows → `MasterSankalp` (matched on `item_id = row_id`, locale=`en`)
- 82 principle rows → `WisdomPrinciple` (matched on `principle_id = row_id`)

**Idempotency:** match keys are `(item_id, locale='en')` for MasterSankalp and `principle_id` for WisdomPrinciple. A `curator_note` marker `|| INGEST/0136 ||` in the `curator_notes` field (or for WisdomPrinciple, in `multi_room_justification` since it lacks `curator_notes`) lets 0136 detect prior runs and no-op.

**Blocked by schema:** 82 principle rows cannot have `life_context_bias` / `misuse_risk` / `standalone_safe_flag` / `repeat_tolerance_level` / `emotional_function_tag` written — see §A.2 P-a decision gate.

### B.2 TAG_PATCH_WAVE1B.yaml — 82 rows

| Metric | Count |
|---|---:|
| Total rows | **82** |
| `class: principle` | 82 |
| `CURATOR_GATE: true` | 82 (100%) |
| Rows with empty `uncertainty: []` | 76 |
| Rows with populated `uncertainty[]` | **6** |

**Rows with non-empty `uncertainty[]` (SKIP on auto-ingest):**

1. `niti_aparigraha_meets_prudence` — dual-tag (niti + yamas) confirm
2. `niti_truthfulness_with_discretion` — dual-tag confirm
3. `niti_austerity_as_freedom` — dual-tag confirm
4. `sankhya_rest_in_the_non_participating_witness` — §Stillness tradition-exclusion override
5. `sankhya_kaivalya_is_the_direction_of_stillness` — §Stillness tradition-exclusion override
6. `sankhya_svadhyaya_is_guna_observation_over_time` — dual-tag (sankhya + niyamas)

**Ingestible under auto-rule:** **76 of 82** rows (provided §A.2 P-a lands first).
**Blocked:** 6 rows → status=`needs_curator_review`.

**Target model:** `WisdomPrinciple` (all 82). Matched on `principle_id`.

**Blocked by schema:** same as B.1 — all 82 cannot have the 5 v2 governance fields until §A.2 P-a ships.

### B.3 LIFE_CONTEXT_TAG_PATCH.yaml — 185 rows (188 total entries; 3 are under `issues/` corrections, not tag-patches)

| Metric | Count |
|---|---:|
| Total row-tag entries with `class:` | **185** |
| `class: mantra` | 29 |
| `class: sankalp` | 28 |
| `class: practice` | 21 |
| `class: principle` | 107 |
| `CURATOR_GATE: true` | 25 |
| `CURATOR_GATE: false` (auto-ingestible) | 160 |
| Rows with `uncertainty[]` items | 0 |
| Stillness-universal rows (empty `proposed_life_context_bias: []`) | 12 |

**Ingestible under auto-rule (CURATOR_GATE=false):** **160 of 185** rows.
**Needs curator pre-review:** **25 of 185** rows (CURATOR_GATE=true). These SHOULD proceed to ingestion, but marked `needs_curator_review=True` in DB; 0136 writes the tags AND sets the flag so Rule 5 can still use the row but curator sees the queue.

**Target models by class:**
- 29 mantra → `MasterMantra`
- 28 sankalp → `MasterSankalp`
- 21 practice → `MasterPractice`
- 107 principle → `WisdomPrinciple`

**Blocked by schema:** 107 principle rows cannot have `life_context_bias` written to DB — this is the whole point of the LIFE_CONTEXT patch. **This is the single highest-impact schema gap:** without §A.2 P-a, 58% of LIFE_CONTEXT patch (107 of 185) ingests nothing usable. Non-principle rows (78 of 185, covering mantra/sankalp/practice) ingest cleanly.

---

## §C 554-master-row backfill strategy

CONTENT_CLASS_AUDIT_V2 §A.3 + CONTAMINATION_AUDIT_V1 + ROOM_SYSTEM_STRATEGY §8: the master tables carry 554 rows with `surface_eligibility=[]` (200 mantra + 159 sankalp + 195 practice). Runtime `room_selection.py:144` silently filters them out.

### C.1 Per-class backfill default

| Class | Master rows | Pooled (referenced from any `RoomContentPool`) | Proposed backfill rule |
|---|---:|---:|---|
| `MasterMantra` | 200 | ~25 pool-referenced + ~29 via LIFE_CONTEXT patch = ~54 | Pooled + LIFE_CONTEXT rows → `[pool_eligible]`. Rest (~146) remain `[]` = triad/additional-items-only (silently-ineligible for room pools). |
| `MasterSankalp` | 159 | ~8 pooled + ~28 LIFE_CONTEXT + growth-9 from 0132 + joy-13 new = ~57 | Pooled + LIFE_CONTEXT rows → `[pool_eligible]`. Rest (~102) → `[]`. |
| `MasterPractice` | 195 | ~21 pooled + ~21 LIFE_CONTEXT + 17 Ayurveda Phase B = ~50 | Same rule. Rest (~145) → `[]`. |

**Net:** ~161 of 554 master rows become `[pool_eligible]`. The remaining ~393 stay `[]` (by doctrinal design — triad-only / addon-only content).

### C.2 Source of truth for "who gets `[pool_eligible]`"

A row is pool-eligible if **any** of the following is true:

1. Its `item_id` appears as `anchor_ref` on any active `RoomContentPool` row.
2. Its `item_id` appears in `rotation_refs` on any active `RoomContentPool` row.
3. LIFE_CONTEXT_TAG_PATCH tags it with a non-empty `room_fit`.
4. TAG_PATCH_WAVE1 / WAVE1B tags it with a non-empty `surface_eligibility` (already written by 0136).

The backfill migration (0137) is run **after** 0136 and reads the now-populated `surface_eligibility` / `room_fit` / RoomContentPool refs to compute the eligibility predicate.

### C.3 Reverse

Backfill reverse = write `[]` back, but only for rows this migration touched. Track via `curator_notes` marker `|| BACKFILL/0137 ||`.

---

## §D Failure modes pre-ingestion

### D.1 Curator-gated rows with uncertainty[] items

Total across all 3 patches: **12 rows** (6 + 6 + 0).

**Policy:** ingestion must SKIP the proposed_tags write for these rows AND log them. Two disposition paths, both implemented in 0136:

1. **Skip-with-marker:** write nothing to the row's tag fields; write a `curator_notes` entry of the form `|| CURATOR_GATE_UNCERTAINTY/0136 ||<timestamp>||<uncertainty[0]>||`. Sets `needs_curator_review=True`. Row remains unusable for Rule 5 (tags still empty) but flagged for curator attention.
2. **Skip-with-dry-run-log:** same as above, PLUS emit a stdout line per skipped row so migration output is actionable.

0136 does both.

### D.2 CURATOR_GATE without uncertainty

TAG_PATCH_WAVE1 + WAVE1B have CURATOR_GATE=true on **all 193 rows** (by design — all new Wave 1 authoring is curator-gated). With empty uncertainty[], these are normal-path ingests:

- 0136 writes the tags
- 0136 sets `needs_curator_review=True`
- 0136 writes a `curator_notes` entry `|| INGEST/0136 ||<timestamp>||source=TAG_PATCH_WAVE1 ||` for auditability
- Rule 5 uses the row at runtime
- Curator reviews the `needs_curator_review=True` queue and flips the flag when satisfied

LIFE_CONTEXT_TAG_PATCH has CURATOR_GATE=true on 25 rows (rationale-level, not uncertainty). Same disposition.

### D.3 Row-not-found-in-DB

Three scenarios:

1. `MasterMantra` / `MasterSankalp` / `MasterPractice` lookup by `item_id='<row_id>', locale='en'` returns 0 rows → likely because (a) row_id is mistyped, (b) row was retired by 0131, (c) row is in a Phase B seed file that hasn't been applied yet.
2. `WisdomPrinciple` lookup by `principle_id='<row_id>'` returns 0 rows → (a) principle_id mistyped, (b) Agent F/G principle not yet seeded by a Phase B content migration.
3. Row exists but `is_active=False` (e.g. retired by 0131).

**Policy:** log and skip (no RuntimeError). Increment a per-patch "unresolved" counter. If any patch has >10% unresolved, ABORT (RuntimeError) because that signals a major content-vs-patch drift. Threshold is configurable.

### D.4 Phase B rows not yet in DB

Agent F's 50 Niti + Agent G's 32 Sankhya are in `kalpx/core/data_seed/mitra_v3/principles_*_wave2.yaml`. They are NOT yet in DB (no Phase B seed migration has applied). TAG_PATCH_WAVE1B assumes they are present. If they aren't, 0136 will find 0 rows for all 82 and log them as unresolved.

**Expected order:**

1. Seed Phase B principles_niti_wave2.yaml + principles_sankhya_wave2.yaml (and siblings) via a Phase B content migration first. Call it `0135a_seed_phase_b_principles.py` — NOT DRAFTED HERE (doctrine directive "don't broaden scope").
2. Then apply 0136.

**Recommendation:** 0136's §header calls out this prerequisite explicitly. If the Phase B seed migration is deferred, 0136 is still safe (skips unresolved rows) but its Wave 1B coverage is 0/82.

---

## §E Post-ingestion rows still failing room eligibility

Even after 0136 + 0137 apply, these rows will NOT appear in pools:

### E.1 Rows whose `room_fit` references a pool that doesn't exist

Enumerate rooms referenced in the 3 patches vs rooms with active RoomContentPool entries:

- Rooms with pool entries (per 0120 + 0132 seeds): `room_stillness`, `room_connection`, `room_release`, `room_clarity`, `room_growth`, `room_joy` — all 6 present.
- Rooms referenced in patches: `stillness` / `connection` / `release` / `clarity` / `growth` / `joy` — all 6 present.
- **No unaligned-room failures.**

### E.2 Rows whose `surface_eligibility` doesn't match any active slot

| Surface token in patches | Active pool slots (per 0120+0132) | Valid? |
|---|---|---|
| `sankalp_anchor` | `sankalp` (flat slot in growth 0132, plus `sankalp_gratitude` / `sankalp_blessings` / `sankalp_seva` in joy) | Valid |
| `sankalp_rotation` | same | Valid |
| `mantra_anchor` / `mantra_rotation` | `mantra` | Valid |
| `practice_anchor` / `practice_rotation` | `practice` | Valid |
| `principle_rotation` | `principle` | Valid |
| `principle_anchor` | `principle` | Valid |
| `wisdom_banner` | `wisdom_banner` | Valid |
| `wisdom_teaching` | `wisdom_teaching` | Valid (connection `wisdom_teaching` parked per 0127 — see E.3) |
| `wisdom_reflection` | `wisdom_reflection` | Valid |
| `pool_eligible` (from 0137 backfill) | — | Runtime predicate only |

### E.3 Rows with surface `wisdom_teaching` in a room where it's parked

Migration 0127 parked `wisdom_teaching` for stillness + clarity; later reopened. Migration 0127 also parked `sankalp` for stillness + clarity. Verify at apply time. LIFE_CONTEXT + WAVE1B don't route teaching to stillness/clarity in ways that conflict — cross-checked against `room_context_policy`. Low risk.

Connection `wisdom_teaching` is parked per chip contract v1.1 per WAVE2_FINAL_SYNTHESIS §L.3 K.3 #7. 11 Bhakti Wave2 rows propose teaching-eligibility. These tag correctly but Rule 5 won't surface them until the slot reopens. **Dormant but not failing.**

### E.4 Rows with sound doctrine flags

- 2 Sankhya × stillness rows (`sankhya_rest_in_the_non_participating_witness`, `sankhya_kaivalya_is_the_direction_of_stillness`) — tagged `room_fit=[stillness]` but §Stillness doctrine excludes Sankhya. If founder accepts the conservative banner-only route, they ingest cleanly. If founder reclassifies to clarity × self, 0136 should be re-run with updated patch. D2 founder call.
- `mantra.shivoham` pre-existing in `room_stillness` rotation (0120 seed) — NOT touched by 0136 (not in any tag patch). Remains as-is. D3 founder call.

### E.5 Ingested-but-stranded rows

Rows that get tags via 0136 but aren't referenced by any RoomContentPool:

- 82 WAVE1B principles are patch-tagged for pool-eligibility, but no pool `rotation_refs` updates are in any Wave 1 migration for them. Principles from WAVE1B land in the pool via 0134 + 0135, but verified coverage is partial (0134 pulls 14 sankhya + 18 YS by principle_id; 0135 pulls 18 yamas + 8 BG + 5 dharma + 6 YS + 10 dinacharya + 4 ayurveda for growth). Cross-checked: ~70 of 82 WAVE1B principles land in a pool via 0134 or 0135. **~12 tag-written-but-pool-orphan** — tagged correctly but no RoomContentPool references them. They become orphan-but-correctly-governed.

**Post-ingestion orphan count (rows tagged but unreferenced in any pool):** estimated **~12–20 rows** across all 3 patches. Hygiene-level. Not a failure, just unused capacity.

---

## §F Idempotency + rollback

### F.1 Idempotency mechanism

Every ingestion write is idempotent via a single `curator_notes` sentinel: the migration appends `|| INGEST/0136 ||<timestamp>||<patch_file>||` on first write. On re-run, the sentinel's presence causes the migration to SKIP that row's tag writes (but re-logs the idempotent-skip). The sentinel includes the patch filename so a partial re-run after a patch-YAML edit still picks up new rows.

For WisdomPrinciple (no `curator_notes` column per §A.2), the sentinel is written to `multi_room_justification` — additive-append.

### F.2 Re-run safety

- Safe to run twice in a row: second run is a no-op (all sentinels present).
- Safe to run after YAML edit: new rows picked up; sentinel-marked rows skipped.
- Safe to run in reverse then forward: reverse clears sentinels + blanks fields; forward re-populates.

### F.3 Reverse migration

Reverse walks each patch and, for every row that carries the `|| INGEST/0136 ||` sentinel, reverts the targeted fields to their pre-ingest state (empty list / null). Only touches rows this migration touched — does not blank fields that were populated by 0117 or by inline authoring in seed JSON files.

### F.4 Atomicity

Django wraps `RunPython` in a transaction by default. If any row raises (schema mismatch, for example), the entire 0136 apply is rolled back. Required: all-or-nothing for a given migration run.

---

## §G Migration dependency order

**Recommended order:**

1. `0132_add_growth_sankalp_slot.py` (drafted, not applied) — structural pool add
2. `0133_decontaminate_cross_room_rows.py` (drafted, not applied) — 3 cross-room removals
3. `0134_expand_clarity_principle_pool.py` (drafted, not applied) — +49 clarity principle rows + BG cap assert
4. `0135_seed_dark_tradition_principles.py` (drafted, not applied) — dark-tradition seeds + doctrinal asserts
5. **(NEW — blocking)** `0135a_seed_phase_b_content.py` — seed Phase B content (Agent F/G principles, 17 Ayurveda practices, 25 Joy sankalps, 12 Growth sankalps, 4 Bhakti/Gita principles) from 8 Phase B YAML/JSON files. **NOT drafted this pass.** Without it, 0136 finds 82+ WAVE1B principles missing in DB.
6. **(NEW — conditional on §A.2 P-a)** `0135b_add_v2_governance_to_wisdom_principle.py` — add 11 v2 governance columns to WisdomPrinciple. **NOT drafted this pass** (founder ACK required on §A.2 P-a). Without it, 82 principles in WAVE1B cannot receive `life_context_bias` / `misuse_risk` / etc.
7. `0136_ingest_tag_patches.py` (DRAFTED THIS PASS) — materialize 3 tag patches into master / principle tables. Skips unresolved + curator-gated-with-uncertainty rows.
8. `0137_backfill_surface_eligibility.py` (DRAFTED THIS PASS) — backfill 554 master-row `surface_eligibility` to `[pool_eligible]` or `[]` based on pool membership + 0136 tag output.

**Without 0135a + 0135b:** 0136 degrades to best-effort. Principles present in DB get what they can (pool-eligibility fields only); principles NOT in DB get logged as unresolved; life_context_bias on principles fails.

---

## §H Safe-to-execute vs needs-ACK

### H.1 Safe to execute (no doctrine reopening needed)

- **0136 draft migration file creation** — safe (this pass)
- **0137 draft migration file creation** — safe (this pass)
- Skip-policy for curator-gated-with-uncertainty rows (12 total) — safe; follows existing curator-gate convention
- Drop-on-ingestion for `exclude_from_contexts` (§A.3) — safe; room-policy table already covers all cases
- Idempotency via `curator_notes` sentinel — safe; pattern established by 0131 / 0133
- Per-class `surface_eligibility` backfill default (§C.1) — safe; deterministic derivation from existing pool + tag-patch data

### H.2 Needs founder ACK

- **§A.2 P-a:** Draft + apply `0135b_add_v2_governance_to_wisdom_principle.py` adding 11 columns (life_context_bias, emotional_function_tag, misuse_risk, standalone_safe_flag, repeat_tolerance_level, curator_notes, selection_justification, review_status, banner_eligible, teaching_eligible, reflection_eligible, 5 surface_override_* fields — total ~15 fields). Blocking for principle-row life_context ingestion.
- **0135a content-seed migration** for Phase B YAML/JSON files — doctrine-lock means seed-as-drafted is safe, but founder must OK applying Phase B authoring to DB.
- D1–D4 founder calls (per WAVE2_FINAL_SYNTHESIS Table 5) — 0136 specifically does NOT pre-empt any: it ingests the conservative banner-only route for the 2 stillness-sankhya rows, leaves `mantra.shivoham` untouched, and logs the 6 uncertainty rows.
- **Apply any migration.** Drafting is safe; `python manage.py migrate` is not. Founder ACK + dev EC2 smoke gate + resolve 1/12 vs 12/12 smoke-state conflict per `mitra_session_handoff_2026_04_20_end.md` required first.

---

## §I Numeric summary

| Metric | Count |
|---|---:|
| WAVE1 rows total | 111 |
| WAVE1 ingestible (CURATOR_GATE + empty uncertainty[]) | 105 |
| WAVE1 blocked by uncertainty[] items | 6 |
| WAVE1 principle rows blocked by §A.2 for life_context_bias | 82 |
| WAVE1B rows total | 82 |
| WAVE1B ingestible under auto-rule | 76 |
| WAVE1B blocked by uncertainty[] items | 6 |
| WAVE1B rows blocked by §A.2 for life_context_bias | 82 (all) |
| LIFE_CONTEXT rows total | 185 |
| LIFE_CONTEXT auto-ingestible (CURATOR_GATE=false) | 160 |
| LIFE_CONTEXT CURATOR_GATE=true (ingest + flag) | 25 |
| LIFE_CONTEXT principle rows blocked by §A.2 | 107 |
| 554-master-row backfill → `[pool_eligible]` | ~161 |
| 554-master-row backfill → `[]` (unchanged) | ~393 |
| Curator-gated-with-uncertainty rows (global) | 12 |
| Orphan-but-tagged rows post-ingest (rows tagged but not in any pool) | ~12–20 |

---

## §J Citations

- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/WAVE2_FINAL_SYNTHESIS.md` — tables 1–5, §L founder-call register
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/TAG_PATCH_WAVE1.yaml` — 111 rows verified
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/TAG_PATCH_WAVE1B.yaml` — 82 rows verified
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/LIFE_CONTEXT_TAG_PATCH.yaml` — 185 tag rows + 3 issue entries
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/SURFACE_ISOLATION_REAUDIT_V3.md` §F §K §L
- `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/ROOM_POOL_PLAN_V3.yaml`
- `/Users/paragbhasin/kalpx/core/models.py` lines 3025 (MasterMantra), 3161 (MasterSankalp), 3282 (MasterPractice), 6902 (WisdomPrinciple), 8689 (RoomContentPool)
- `/Users/paragbhasin/kalpx/core/migrations/0117_room_v31_tagging.py`, `0130_tagging_v2_governance_fields.py`, `0132`–`0135` Wave 1 drafts
