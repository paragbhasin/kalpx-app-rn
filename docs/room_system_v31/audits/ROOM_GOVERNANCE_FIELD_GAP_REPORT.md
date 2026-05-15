# Room System v3.1.1 — Governance-Field Gap Report

**Status:** Wave 1b tagging review (field-population audit)
**Date:** 2026-04-21
**Scope:** English locale only
**Author:** Agent 1 (Wave 1b governance-field completion)
**Upstream doctrine:** `ROOM_SYSTEM_STRATEGY_V1.md` §1 §5 §5.7.5 §8
**Companion artifact:** `TAG_PATCH_WAVE1B.yaml` (82 rows, curator-gated)

This report quantifies the v3.1 governance-field gap across the content
inventory that the room runtime needs to discriminate (Rule 5 / room_selection
/ render endpoint). It follows the same frame as `CONTENT_CLASS_AUDIT_V2 §A.3`
and extends it with a prioritized backfill plan plus a defense-in-depth
runtime-assertion proposal.

Four priorities are defined:
- **P1 — already-pooled**: rows that the runtime already surfaces via the 200
  tagged rows in `TAG_PATCH_WAVE1.yaml` or the 82 in `TAG_PATCH_WAVE1B.yaml`.
  These MUST be tagged or the runtime cannot filter them.
- **P2 — pool-eligible-in-W2**: rows needed to close thin spots identified in
  `WAVE1_SYNTHESIS §1.6` (authoring gaps) and §2 Table A. Tagging these
  unlocks richer rotation once authoring lands.
- **P3 — library-safe-empty**: rows that feed core triad / additionals only;
  can remain `surface_eligibility=[]` safely (pool-excluded by default).
- **P0 — runtime-safety**: the runtime guard itself, independent of row
  counts. See §D.

---

## A. Field-by-field state across the 82 Wave 2 principle rows

All 82 rows are Tier-1 principles authored by Agents F (Niti, 50) and G
(Sankhya, 32). Source files:

- `kalpx/core/data_seed/mitra_v3/principles_niti_wave2.yaml`
- `kalpx/core/data_seed/mitra_v3/principles_sankhya_wave2.yaml`

### Pre-Wave-1b field population (source YAMLs only)

| Field | Populated in source | Rate |
|---|---:|---:|
| `tradition_family` | 82 / 82 | 100% |
| `tier` | 82 / 82 | 100% |
| `status` | 82 / 82 | 100% |
| `core_teaching` / `plain_english` / `universal_explanation` / `rooted_explanation` | 82 / 82 | 100% |
| `sources[]` | 82 / 82 | 100% |
| `state_tags[]` | 82 / 82 | 100% |
| `relevances[]` | 82 / 82 | 100% |
| `tone_modes[]` | 82 / 82 | 100% |
| `intervention_links[]` | 82 / 82 | 100% |
| `contraindications[]` | 82 / 82 | 100% (where applicable) |
| `why_this_levels` | 82 / 82 | 100% |
| **v3.1 governance — below** | | |
| `room_fit` | 0 / 82 | 0% |
| `life_context_bias` | 0 / 82 | 0% |
| `surface_eligibility` | 0 / 82 | 0% |
| `pool_role` | 0 / 82 | 0% |
| `emotional_function_tag` | 0 / 82 | 0% |
| `action_family` | 0 / 82 | 0% |
| `intensity` | 0 / 82 | 0% |
| `standalone_safe_flag` | 0 / 82 | 0% |
| `repeat_tolerance_level` | 0 / 82 | 0% |
| `misuse_risk` | 0 / 82 | 0% (encoded in contraindications[0].note but not as misuse_risk field) |
| `exclude_from_contexts` | 0 / 82 | 0% |

Authoring quality for the teaching fields is at ceiling; **every v3.1
governance field is 0% populated** on the source YAMLs. This is expected
(brief explicitly says do not modify source files) but it means Rule 5 /
room_selection cannot discriminate these 82 rows without `TAG_PATCH_WAVE1B`.

### Post-Wave-1b field population (this patch)

| Field | Populated in patch | Rate | Notes |
|---|---:|---:|---|
| `tradition_family` | 82 / 82 | 100% | Primary lineage retained from source |
| `tradition[]` | 82 / 82 | 100% | 10 rows dual-lineage (see `TAG_PATCH_WAVE1B §DF-3`) |
| `room_fit` | 82 / 82 | 100% | 71 clarity / 9 growth / 2 stillness (incl. `stillness` 2 with founder-call flag DF-2) |
| `life_context_bias` | 80 / 82 | 97.6% | 2 stillness rows correctly `[]` per §1 stillness-has-no-context |
| `surface_eligibility` | 82 / 82 | 100% | Clarity = `[wisdom_teaching, wisdom_reflection]`; Growth = `[wisdom_reflection]`; Stillness = `[wisdom_banner]` |
| `pool_role` | 82 / 82 | 100% | 80 rotation / 2 rare (stillness) — curator may elevate anchors post-hoc |
| `emotional_function_tag` | 82 / 82 | 100% | clarify-default `discriminate` for clarity; `hold` for growth; `witness` for stillness |
| `action_family` | 82 / 82 | 100% | `discernment` / `cultivation` / `witness` |
| `intensity` | 82 / 82 | 100% | 80 medium / 2 light (stillness) |
| `standalone_safe_flag` | 82 / 82 | 100% | All `true` — Tier-1 principles with contraindications are still standalone safe |
| `repeat_tolerance_level` | 82 / 82 | 100% | 80 high / 2 medium (Tier-2 applied cases) |
| `misuse_risk` | 82 / 82 | 100% | Copied verbatim from `contraindications[0].note`; rows with multiple notes retain first-note only |
| `exclude_from_contexts` | 82 / 82 | 100% | All `[]` — principles at this tier do not need context-blocking |

### Rows flagged for curator judgment (uncertainty[] non-empty)

6 rows carry explicit uncertainty entries:

| row_id | flag |
|---|---|
| `niti_aparigraha_meets_prudence` | dual-tradition tag (niti + yamas) |
| `niti_truthfulness_with_discretion` | dual-tradition tag (niti + yamas) |
| `niti_austerity_as_freedom` | dual-tradition tag (niti + yamas) |
| `sankhya_rest_in_the_non_participating_witness` | stillness tradition-exclusion (DF-2); life_context_bias=[] |
| `sankhya_kaivalya_is_the_direction_of_stillness` | stillness tradition-exclusion (DF-2) |
| `sankhya_svadhyaya_is_guna_observation_over_time` | dual-tradition tag (sankhya + niyamas) |

All 6 are dispositioned in `TAG_PATCH_WAVE1B §doctrinal_flags` (DF-2 and DF-3).
The remaining 76 rows are fully governed and need no further curator judgment.

---

## B. 554-row master backfill plan

`CONTENT_CLASS_AUDIT_V2 §A.3` documents 554 rows across `master_mantras.json`
(200) + `master_sankalps.json` (159) + `master_practices.json` (195) with all
v3.1 governance fields at 0%. Not every one of these rows needs to serve
rooms — many feed only core-triad / additional surfaces. A rough decomposition:

### B.1 Priority tier assignment

| Priority | Definition | Est. row count | Action |
|---|---|---:|---|
| **P1** | Already named in a W1 or W1b pool migration (i.e. the runtime already surfaces them somewhere). MUST be tagged or the row leaks into the pool without surface/context filtering. | ~115 | Tag within Wave 1c (next sweep) |
| **P2** | Not pool-named today, but identified as needed for closing thin spots per `WAVE1_SYNTHESIS §1.6` (e.g. joy × work_career karma-yoga sankalps; Dhanvantari × health mantras). Currently 0 authored for many of these — authoring unblocks tagging. | ~60-100 | Tag opportunistically as authoring lands in Wave 2 |
| **P3** | Serves core-triad / additionals only — never expected to serve rooms. Safe to leave `surface_eligibility=[]` and `room_fit=[]`. Default-exclude behavior of a hardened runtime (see §D) then guarantees these cannot leak into room pools. | ~340-380 | No action; protected by runtime assertion |

### B.2 P1 row accounting (already-pooled rows needing tags)

From `CONTENT_CLASS_AUDIT_V2 §A.4`:

| Class | Rows pooled pre-W1 | Rows pooled post-W1 (est.) | Rows pooled post-W1b (incl. 82 new) |
|---|---:|---:|---:|
| mantras | 25 | 25 | 25 (no new W1 mantras) |
| sankalps | 8 | 17 (+9 growth new slot) | 17 |
| practices | 21 | 21 | 21 |
| principles | 31 | 231 (+200 via W1) | 313 (+82 via W1b) |
| **TOTAL** | **85** | **294** | **376** |

Of these 376 pooled rows:
- 31 clarity-principles were previously pooled and are re-tagged in
  `TAG_PATCH_WAVE1.yaml` Group 2.
- 200 rows are tagged by `TAG_PATCH_WAVE1.yaml` total.
- 82 rows are tagged by `TAG_PATCH_WAVE1B.yaml` (this wave).
- **54 rows remain pooled but untagged** (mostly pre-existing mantra + sankalp
  + practice rows from the 85 pre-W1 base whose governance fields remain 0%
  per §A.3). This is the core Wave 1c target.

### B.3 P1 row-id enumeration (for Wave 1c)

From `CONTENT_CLASS_AUDIT_V2 §A.4`, these rows are currently in pool migrations
but are NOT covered by either TAG_PATCH_WAVE1 or TAG_PATCH_WAVE1B:

**Pooled Mantras (25 rows — TAG_PATCH_WAVE1 does not re-tag these):**
`mantra.asato_ma, mantra.emotional_healing.vasudevaya,
mantra.ganesha_om_gam_clarity, mantra.gayatri, mantra.gayatri_om_tat_savitur,
mantra.hanuman_buddhi_balam, mantra.hare_krishna,
mantra.hreem_shreem_kleem_mahalakshmi, mantra.krishna_hare_krishna,
mantra.lakshmi_om_shri_joy, mantra.lokah_samastah, mantra.maha_mrityunjaya,
mantra.om_namo_bhagavate_vasudevaya, mantra.om_shanti_om, mantra.pavamana_asato_ma,
mantra.peace_calm.om, mantra.purnamadah, mantra.rudra_om_namo_bhagavate,
mantra.saraswati_om_aim_wisdom, mantra.sarve_bhavantu (×2 dup entry),
mantra.shiva_maha_mrityunjaya, mantra.shivoham, mantra.soham,
mantra.vedanta_om_tat_sat`

**Pooled Practices (21 rows):**
`practice.anahata_humming, practice.anahata_meditation, practice.belly_breathing,
practice.bhramari, practice.centering_drishti, practice.focus.ten_second_pause,
practice.four_four_six, practice.grounding_palm_press, practice.hand_on_heart,
practice.heart_breath_release, practice.heart_softening,
practice.mantra_journaling, practice.mindful_55_walking,
practice.one_sankalp_action, practice.palm_soothing, practice.sakshi_breath,
practice.self_acceptance_pause, practice.shanti_breath_cycle,
practice.shanti_exhale_drop, practice.shanti_trataka, practice.trataka`

**Pooled Joy Sankalps (8 rows — covered in TAG_PATCH_WAVE1 Group 8 but verify):**
`sankalp.choose_santosha, sankalp.give_grace, sankalp.invite_abundance_gently,
sankalp.joyful_presence, sankalp.live_in_gratitude, sankalp.open_to_divine,
sankalp.see_goodness, sankalp.welcome_abundance`

**Wave 1c scope estimate: ~46 row tag-sweep (25 mantras + 21 practices);
the 8 joy sankalps above are already in TAG_PATCH_WAVE1 Group 8 per §A.4
cross-check against the patch file.**

### B.4 P2 row accounting (authoring-dependent)

From `WAVE1_SYNTHESIS §1.6`:

| Gap | Authoring target | Est. tag-rows when authored |
|---|---:|---:|
| Joy × work_career karma-yoga-craft sankalps | +5-8 | 5-8 |
| Niti clarity × relationships + purpose_direction depth | +15-20 | 15-20 |
| Ayurveda joy-register body-vitality | +8-12 | 8-12 |
| Bhakti connection rotation breadth | +5-10 | 5-10 |
| Release banner BG 2.14-family | +3-5 | 3-5 |
| Release × work_career (doctrine first) | +5-8 | 5-8 |
| Growth sankalp × relationships/health/money | +6-9 | 6-9 |
| Clarity × money_security mantra/practice | +4-6 | 4-6 |
| Stillness Vedanta-sākṣin banner breadth | +2-3 | 2-3 |
| **Total P2 authoring-dependent** | **+53-81** | **53-81** |

These rows do NOT exist yet; Wave 1c does not tag them. As each authoring
wave lands they should ship WITH their governance tags inline (avoid the
Wave 2 F/G pattern of tag-less authoring, which forced this Wave 1b patch).

### B.5 P3 row estimate (safe-empty default)

854 total authored content rows per `CONTENT_CLASS_AUDIT_V2 §A.1`:
- 200 mantras authored
- 159 sankalps authored
- 195 practices authored
- 303 principles authored (200 principles pooled post-W1; 82 more in W1b = 282 pool-eligible; 21 remain orphan or already pooled but untagged)

Pool-ready post-W1b = 376 (B.2). Authored = 857 (§A.1 total).
Gap = 857 − 376 = **481 rows not in any pool today.**

Of those 481:
- ~115 rows are authoring-complete and pool-eligible in Wave 2-3 (P1 roll-forward
  as new pool migrations land; already-tagged orphans from TAG_PATCH_WAVE1
  Groups 3-7 partially cover this).
- ~60-100 rows are the P2 authoring-gap set (won't exist until authored).
- **~340-380 rows** are authored but appropriately stay out of room pools
  (feed core triad or additionals only). These are the safe-empty P3.

### B.6 Per-field row-count estimate for Wave 1c scope

Brief §C asks for a per-field estimate; here is the Wave 1c work order:

| Field | P1 rows needing tags | P2 rows when authored | P3 rows safe empty | Wave 1c tag count |
|---|---:|---:|---:|---:|
| `surface_eligibility` | ~115 | ~60-100 | ~380 | 115 |
| `room_fit` | ~115 | ~60-100 | ~380 | 115 |
| `life_context_bias` | ~115 (but stillness/joy/release partial subsets) | ~60-100 | ~380 | 115 |
| `emotional_function_tag` | ~115 | ~60-100 | ~380 | 115 |
| `pool_role` | ~115 | ~60-100 | ~380 | 115 |
| `intensity` | ~115 | ~60-100 | ~380 | 115 |
| `action_family` | ~115 | ~60-100 | ~380 | 115 |
| `standalone_safe_flag` | ~115 | ~60-100 | ~380 | 115 |
| `repeat_tolerance_level` | ~115 | ~60-100 | ~380 | 115 |
| `misuse_risk` | ~115 (subset; most will be null) | ~60-100 | ~380 | 115 |
| `tradition_family` / `tradition[]` | 200 (all 200 pool rows from TAG_PATCH_WAVE1 already carry tradition via their row_id stem; cross-check needed for any missing) | ~60-100 | n/a | ~30-50 |

**Wave 1c realistic effort estimate:** ~46 rows (Mantras + Practices in
`CONTENT_CLASS_AUDIT_V2 §A.4` not covered by either TAG_PATCH) × 11 governance
fields per row = **~506 field-population operations, single-pass sweep**.
Comparable to the Wave 1b Niti/Sankhya sweep but for content pre-existing in
the DB rather than fresh YAML authoring.

---

## C. Per-field, per-priority row-count summary

Condensed view for quick planning:

| Field | Populated pre-W1b | Added in W1b | Remaining P1 (Wave 1c) | Total P1+P2+P3 authored | % at runtime-ready |
|---|---:|---:|---:|---:|---:|
| `surface_eligibility` | 0 | 82 | ~115 | ~595 | 0 → 13.8% post-W1b → ~33% post-W1c |
| `room_fit` | 0 | 82 | ~115 | ~595 | 0 → 13.8% → ~33% |
| `life_context_bias` | 0 | 80 (2 stillness null) | ~115 | ~595 | 0 → 13.4% → ~33% |
| `emotional_function_tag` | 0 | 82 | ~115 | ~595 | 0 → 13.8% → ~33% |
| `pool_role` | 0 | 82 | ~115 | ~595 | 0 → 13.8% → ~33% |
| `intensity` | 0 | 82 | ~115 | ~595 | 0 → 13.8% → ~33% |
| `action_family` | 0 | 82 | ~115 | ~595 | 0 → 13.8% → ~33% |
| `standalone_safe_flag` | 0 | 82 | ~115 | ~595 | 0 → 13.8% → ~33% |
| `repeat_tolerance_level` | 0 | 82 | ~115 | ~595 | 0 → 13.8% → ~33% |
| `misuse_risk` | 0 (encoded in contraindications) | 77 | variable | variable | populated where meaningful |
| `tradition_family` + `tradition[]` | 303 principles (100% in YAML); 0% in master_*.json (0/554) | +82 | 0 (principles); 554 (mantras/sankalps/practices) | 857 | principles 100%; others 0 → fixed in W1c |

**Runtime-ready cliff**: The runtime CANNOT safely read master_*.json rows
as room candidates until their `surface_eligibility` + `room_fit` are
non-empty. Until Wave 1c lands, the runtime MUST skip or explicitly
safelist master_*.json rows. See §D for the assertion.

---

## D. Defense-in-depth runtime assertions

The 85-row pool pre-W1 did not fail because the migrations themselves enforce
pool membership. But the render endpoint + Rule 5 scoring also read row
governance fields; if `surface_eligibility` is empty or `room_fit` is empty
the row either (a) matches nothing (best case) or (b) matches everything on a
permissive filter (worst case). This must be hard-blocked.

### D.1 Proposed runtime invariants in `core/rooms/room_selection.py`

```python
# BEFORE scoring any candidate into a room pool:
assert row.surface_eligibility, (
    f"Row {row.id} has empty surface_eligibility; refuse to include in any "
    f"room pool. Tag the row (see TAG_PATCH_WAVE1/1B) or explicitly mark "
    f"it as core/additional-only (surface_eligibility=['core']) to exclude it."
)
assert row.room_fit, (
    f"Row {row.id} has empty room_fit; cannot be selected by room_selection. "
    f"Either tag it with room_fit or exclude it from the candidate set at "
    f"the source query."
)
assert row.room_fit, (
    f"Row {row.id} presented to room_selection but room_fit does not contain "
    f"the requested room '{room_id}'. Query scope bug."
) if room_id not in row.room_fit else None
```

### D.2 Proposed endpoint-level guard in `GET /api/mitra/rooms/{room_id}/render/`

At the top of the handler:
```python
candidate_pool = fetch_room_pool(room_id=room_id, pool_version=version)
untagged = [c for c in candidate_pool if not c.surface_eligibility or not c.room_fit]
if untagged:
    logger.error("Room %s pool contains %d untagged rows: %s",
                 room_id, len(untagged), [r.id for r in untagged[:5]])
    raise RenderIntegrityError(
        f"Pool {room_id}@v{version} has untagged rows; refusing to render."
    )
```

This fails loud rather than silently returning mis-routed content.

### D.3 BG ≤ 25% clarity-cap runtime guard (Wave 1b carryover from §5 of synthesis)

`WAVE1_SYNTHESIS §5` notes the cap is CODED IN MIGRATION ONLY. Add a sibling
assertion at runtime so post-migration tag operations cannot bypass doctrine:

```python
def enforce_clarity_bg_cap(pool_rows):
    if not pool_rows:
        return
    n_bg = sum(1 for r in pool_rows if r.tradition_family == "gita")
    pct = n_bg / len(pool_rows)
    if pct > 0.25:
        raise DoctrineViolation(
            f"Clarity principle pool has {n_bg}/{len(pool_rows)}={pct:.1%} BG rows; "
            f"exceeds ≤25% cap per ROOM_TRADITION_V2 §Clarity."
        )
```

### D.4 Migration-time pre-flight

Each pool-changing migration should also run the same assertions against its
target pool at apply time (`0134` and `0135` already do for BG cap; extend
to `surface_eligibility` / `room_fit` non-empty checks on every added row).

---

## E. Wave 1c sizing estimate

Wave 1c is the master-row backfill that closes the §A.3 gap for pre-W1
pool rows that the W1/W1b tag patches did not cover.

| Estimate | Count | Notes |
|---|---:|---|
| Total master_*.json authored rows | 554 | 200 mantras + 159 sankalps + 195 practices |
| Rows pool-named today but untagged (P1) | ~46 | 25 mantras + 21 practices from `CONTENT_CLASS_AUDIT_V2 §A.4`; joy sankalps are covered by TAG_PATCH_WAVE1 Group 8 |
| Rows expected to become pool-eligible with W2 authoring (P2 pending authoring) | ~60-100 | From §B.4; DO NOT tag now; tag inline with authoring |
| Rows safely left empty (P3 — core/additional only) | ~340-380 | Safe default given D.1 runtime assertion |
| **Wave 1c tag sweep size** | **~46 rows** | single-pass, comparable scope to W1b |

Wave 1c effort:
- 46 rows × 11 fields = 506 field-population ops.
- Pattern: copy-paste the W1B tagging schema; authoring already exists in
  `master_*.json`, so no new content to produce.
- Blocking question before Wave 1c: confirm which master_sankalps rows are
  pooled today (the 8 listed in §A.4 all appear to be in joy subslots,
  already covered by TAG_PATCH_WAVE1 Group 8 — verify no duplicates).
- Estimated calendar: 2-3 hours agent-class sweep + curator review.

---

## F. Acceptance signals for Wave 1b + Wave 1c

A Wave 1b/1c rollout can be considered acceptance-ready when ALL of:

1. `TAG_PATCH_WAVE1B.yaml` applied (82 rows) with DF-2 founder disposition.
2. Runtime assertions (§D.1 / §D.2 / §D.3) landed in `core/rooms/room_selection.py`
   and `GET /api/mitra/rooms/{room_id}/render/`.
3. Wave 1c tag patch applied (~46 P1 master rows).
4. Smoke test: one render per room per life_context = 6 rooms × 7 contexts
   + 6 rooms × no-context = 48 renders; zero `RenderIntegrityError`.
5. `CONTENT_CLASS_AUDIT_V3` re-runs and shows 100% governance-field population
   on all pool-named rows.

---

## References

| Artifact | Location | Role |
|---|---|---|
| Canonical strategy | `docs/room_system_v31/ROOM_SYSTEM_STRATEGY_V1.md` | §1 §5 §5.7.5 §8 source |
| Synthesis | `docs/room_system_v31/WAVE1_SYNTHESIS.md` | §1.5 §1.6 §2 §7 source |
| Content class audit | `docs/room_system_v31/audits/CONTENT_CLASS_AUDIT_V2.md` | §A.3 empty-field baseline; §A.4 pooled list |
| Tradition doctrine | `docs/room_system_v31/audits/ROOM_TRADITION_ASSIGNMENT_V2.md` | Routing lock |
| Library audit | `docs/room_system_v31/audits/LIBRARY_UTILIZATION_AUDIT_V2.md` | Tradition × class utilization |
| Wave 1 tag patch | `docs/room_system_v31/audits/TAG_PATCH_WAVE1.yaml` | 200 rows, schema parent |
| **Wave 1b tag patch (this wave)** | `docs/room_system_v31/audits/TAG_PATCH_WAVE1B.yaml` | 82 rows (50 Niti + 32 Sankhya) |
| Niti wave2 authoring | `kalpx/core/data_seed/mitra_v3/principles_niti_wave2.yaml` | Source for 50 rows |
| Sankhya wave2 authoring | `kalpx/core/data_seed/mitra_v3/principles_sankhya_wave2.yaml` | Source for 32 rows |
| Master mantras | `kalpx/core/data_seed/master_mantras.json` | 200 rows; 0% v3.1 tags; Wave 1c P1 target |
| Master sankalps | `kalpx/core/data_seed/master_sankalps.json` | 159 rows; 0% v3.1 tags; partial Wave 1c |
| Master practices | `kalpx/core/data_seed/master_practices.json` | 195 rows; 0% v3.1 tags; Wave 1c P1 target |
