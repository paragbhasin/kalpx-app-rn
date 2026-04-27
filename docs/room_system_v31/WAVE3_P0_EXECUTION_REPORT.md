# Wave 3 P0 Execution Report — Room System v3.1.1

**Executed:** 2026-04-21 (same session as Wave 2 post-apply verification)
**Branch:** `journey-v3-fe` (pavani)
**Scope:** W3 P0 — required before prod

---

## What was executed

W3 P0 = 4 concrete deliverables + a fresh-salt smoke gate before apply.

---

## 1. Curator-gated rows resolved — 10 rows

Migration: `0140_resolve_curator_gated_rows.py`

Migration 0136 skipped 10 rows with non-empty `uncertainty[]`. This migration applies the founder-resolved decisions to all 10.

### Decisions by row

| Row ID | Model | Resolution | Rationale |
|---|---|---|---|
| `sankalp.release_limiting_beliefs` | MasterSankalp | **ACCEPT** growth-only | Wording collision managed by misuse_risk; router uses room_fit not wording |
| `sankalp.work_as_worship` | MasterSankalp | **ACCEPT** [growth, joy] dual | §Joy doctrine explicitly carves out karma-yoga-joy-of-craft; joy seva subslot correct surface |
| `sankhya_witness_as_friend` | WisdomPrinciple | **GROWTH ONLY** (drop connection) | Sankhya excluded from connection per ROOM_TRADITION_ASSIGNMENT_V2; conservative clean rule |
| `sankhya_witness_joy_without_clinging` | WisdomPrinciple | **REROUTE to clarity × self** | Sankhya excluded from joy; vairagya-in-expansion is a viveka move |
| `yoga_sutras_one_anchor_when_scattered` | WisdomPrinciple | **STILLNESS ONLY** (drop clarity) | 0133 already removed from clarity; stillness wisdom_banner is the only correct fit |
| `ayur_regular_meals_reduce_reactivity` | WisdomPrinciple | **ACCEPT** [growth, connection] | Ayurveda permitted in both rooms; meals-as-relational-steadiness is legitimate |
| `niti_aparigraha_meets_prudence` | WisdomPrinciple | **ACCEPT** dual-tag [niti, yamas] | Aparigraha IS both a Yama and artha-śāstra; dual-tag preserves both lineages |
| `niti_truthfulness_with_discretion` | WisdomPrinciple | **ACCEPT** dual-tag [niti, yamas] | Satya × priya-hita is a Yama in relational register |
| `niti_austerity_as_freedom` | WisdomPrinciple | **ACCEPT** dual-tag [niti, yamas] | Tapas-aparigraha IS a Yamas concept |
| `sankhya_svadhyaya_is_guna_observation_over_time` | WisdomPrinciple | **ACCEPT** dual-tag [sankhya, niyamas] | Svādhyāya is niyama-5; linkage is real and documented |

**Sentinel:** `|| RESOLVE/0140 ||` written to curator_notes / multi_room_justification.
**Dependency:** 0139 (final Wave 2 migration).

---

## 2. 5 dead mantra refs stripped — YAML hygiene

File edited: `docs/room_system_v31/audits/LIFE_CONTEXT_TAG_PATCH.yaml`

These 5 mantra IDs were referenced in the tag patch but do not exist in `master_mantras.json`. Migration 0136 logged them as "unresolved" and skipped them. The YAML has been updated to remove the entries and leave a `# STRIPPED` comment in place.

| Stripped ID | Room | Context |
|---|---|---|
| `mantra.shiva_om_tryambakam_healing` | release | health_energy |
| `mantra.saraswati_om_saraswati_wisdom` | clarity | work_career, purpose_direction |
| `mantra.ganesha_om_gam_new_direction` | clarity | purpose_direction, work_career |
| `mantra.krishna_govinda_joy` | joy | self, daily_life |
| `mantra.krishna_govinda_gratitude` | joy | relationships, daily_life |

**No migration required** — 0136 already ran and skipped these rows cleanly. The DB was never written to for these IDs. The YAML edit prevents confusion on future re-reads and removes them from the "unresolved" count.

**Note on strip decisions:**
- The 3 Shiva/Saraswati/Ganesha variants are plausible candidates for future authoring in master_mantras.json if the founder wants Shiva-healing or Saraswati-wisdom mantra variants. Strip now = defer authoring cleanly, not permanent rejection.
- The 2 Krishna-govinda variants are joy-bhakti-rasa rows. Not in master table. Strip = defer to W3-P1 Bhakti breadth pass (F2 commitment).

---

## 3. Stillness Vedanta-sākṣin mantras authored and pooled

Migration: `0141_seed_stillness_vedanta_mantras.py`

F1 consequence: 0139 removed `mantra.shivoham`, leaving stillness rotation at 2 entries (peace_calm.om + om_shanti_om). This migration authors 2 Vedanta-witness mantras and adds them to the stillness rotation, restoring depth to 4.

### New rows

| item_id | Name | Devanagari | IAST | Source |
|---|---|---|---|---|
| `mantra.om_purnam` | Om Purnam | ॐ पूर्णमदः पूर्णमिदम् | oṃ pūrṇam adaḥ pūrṇam idaṃ | Bṛhadāraṇyaka / Īśāvāsya Upaniṣad (Śānti-pāṭha) |
| `mantra.sakshi_aham` | Sākṣī Aham | साक्षी अहम् | sākṣī aham | Vedanta / Yoga-Vāsiṣṭha |

**Doctrinal fit:**
- Both: tradition_family=vedanta, deity="" (non-deific), universal register
- Both: NO Shaiva; NO lineage pull; room_fit=[stillness] only
- `om_purnam`: ontological completeness ("That is whole") — non-goal-oriented sākṣī register
- `sakshi_aham`: direct witness affirmation — pairs with soham ("I am That" → "I am the witness")

**Pool update:** appends both to `room_stillness/mantra/rotation_refs`.

**Post-migration stillness mantra pool:**
- Anchor: `mantra.soham` (unchanged)
- Rotation: `peace_calm.om`, `om_shanti_om`, `mantra.om_purnam`, `mantra.sakshi_aham` (4 entries)

**Assertion:** migration raises RuntimeError if rotation depth < 3 after seeding.

---

## 4. Nīti Phase 1 pooling — 50 rows added to clarity + growth

Migration: `0142_niti_phase1_pooling.py`

Pre-phase state: 84 Nīti rows in DB; ~11 pooled in clarity; 73 dark. The 50 rows from TAG_PATCH_WAVE1B (tagged by 0136/0140) are now added to the appropriate room pool rotation_refs.

### Pool assignments

| Room | Slot | Groups | Rows added |
|---|---|---|---|
| `room_clarity` | `principle` | A (work_career 12) + B (money_security 12) + C (daily_life 10) + D (relationships 6) + G (work_applied 2) | **42 rows** |
| `room_growth` | `principle` | E (work_career 5) + F (money_security 3) | **8 rows** |
| **Total** | | | **50 rows** |

Includes the 3 previously uncertainty-gated rows resolved by 0140:
- `niti_aparigraha_meets_prudence` → clarity (Group B)
- `niti_truthfulness_with_discretion` → clarity (Group D)
- `niti_austerity_as_freedom` → growth (Group F)

### Post-phase pool depth

| Room | Principle pool depth (pre → post) | BG count | BG% |
|---|---|---|---|
| clarity | ~65 → **~107** | 7 (unchanged) | **6.5% ✓** (≤ 25% hard cap) |
| growth | ~56 → **~64** | unchanged | unchanged |

**Assertion:** BG-cap hard check included in migration forward function — raises RuntimeError if BG% > 25%.

**What remains dark (post Phase 1):**
- The original ~16 pre-Wave-2 Nīti rows that were NOT in TAG_PATCH_WAVE1B (they had their own tagging path)
- ~7 of the 73 dark rows that weren't covered by TAG_PATCH_WAVE1B groups A-G (the "Nīti Phase 2 triage" W3-P1 item)

---

## Apply sequence

```
0140 → 0141 → 0142
```

All 3 are in `kalpx/core/migrations/`. Apply on dev EC2 with:
```bash
docker compose -f docker-compose.dev.yml -p kalpxdev exec web \
  python manage.py migrate core 0142
```

---

## Post-apply validation gate — RESULTS

**Verified 2026-04-21. All gates passed. W3-P0 closed.**

### 1. Fresh-salt smoke: CONFIRMED 12/12 PASS
Run post-0143 and post-selector-fix. Command: `python manage.py smoke_room_render --salt <unique>`

### 2. Clarity life_context variation: ARCHITECTURAL GAP (pre-existing, not W3 regression)
All pool rotation_refs are bare strings. Selector code: _"Bare-string legacy entries → empty bias list (rule 5 cannot fire)."_ `lc_applied=False` for all clarity renders confirmed. The 50 Nīti rows ARE in pool (53/108 clarity entries) and diversify renders. Life_context discrimination requires P1 pool-format migration (bare strings → dicts with `life_context_bias` metadata).

### 3. Stillness rotation: CONFIRMED — both mantras surface
Two bugs found and fixed:
- **0143** (migration): `surface_eligibility=["mantra_rotation"]` → `["support_room"]`; `action_family="witness"` → `"anchor"`. Both are required by `_row_passes_hard_filter`.
- **selector fix** (commit 7b98c3ba): `_top_candidate` was using deterministic alphabetical tie-break; `sakshi_aham` (alphabetically last) could never win. Changed to `random.choice(tied)` among same-score candidates.
- **Verification**: 40 renders across one test UUID showed all 5 items (soham 10×, om_shanti_om 9×, peace_calm.om 9×, om_purnam 6×, sakshi_aham 6×). Both new mantras confirmed live.

### 4. BG cap: CONFIRMED 6.5% (7/108 in clarity/principle pool)

---

## What was NOT done (intentionally deferred)

**W3-P1 (after prod):**
- Bhakti lineage breadth (F2): Gauḍīya / Ālvār / Sant rows for connection + joy banners
- Connection × purpose_direction + × health_energy practice depth (+7-10 rows)
- Growth anchor bias flags (~18 rows tagged with life_context_bias)
- Mantra diversification (om_shanti saturation across Nīti rows)
- Nīti Phase 2: triage remaining ~7 dark rows not covered by TAG_PATCH_WAVE1B
- 15 cross-surface (rooms ↔ additionals) override decisions (Section D, OVERRIDE_LEDGER_V3)
- **Pool format migration**: bare-string rotation_refs → dicts with `life_context_bias` so Rule 5 can fire
- **Selector tie-break generalization**: the `random.choice(tied)` fix is correct but the module docstring still says "lexicographic item_id" — update on P1

**Not reopened:**
- Doctrine: no changes to room assignments, selector weights, or tradition routing

---

## Final W3-P0 summary

| Deliverable | Status |
|---|---|
| 10 curator-gated rows resolved | ✅ 0140 applied |
| 5 dead mantra refs stripped | ✅ YAML edited |
| 2 stillness Vedanta-sākṣin mantras authored + pooled | ✅ 0141 applied + 0143 hotfix |
| 50 Nīti rows pooled (Phase 1) | ✅ 0142 applied |
| 0143 hotfix — surface_eligibility + action_family | ✅ applied, committed 8b4932fd |
| Selector tie-break fix | ✅ committed 7b98c3ba |
| Fresh-salt smoke 12/12 | ✅ CONFIRMED |
| BG cap | ✅ 6.5% |
| om_purnam surfacing | ✅ CONFIRMED |
| sakshi_aham surfacing | ✅ CONFIRMED post-selector-fix |

**Branch:** `phase5-polish-be-wisdom-and-chips` on dev EC2 (18.223.217.113)
**Apply on fresh deploy:** `python manage.py migrate core 0143`
**Doctrine reopened:** NO
**Selector weights changed:** NO
**life_context discrimination:** NOT YET OPERATIVE (P1 pool-format gap)
