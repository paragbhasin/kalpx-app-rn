# Room Thin-Gap Authoring — Wave 2 (Agent 7)

**Status:** draft; founder review pending.
**Date:** 2026-04-21
**Agent:** Agent 7 (content-first operationalization, highest-value remaining gaps)
**Upstream:** WAVE1_SYNTHESIS.md §1.4 §1.6 §8; ROOM_TRADITION_ASSIGNMENT_V2.md; ROOM_SYSTEM_STRATEGY_V1.md §5 §8.
**Scope:** Closing the thin gaps that tagging alone cannot solve. New authoring only; existing files untouched.

---

## §A Per-file inventory

| ID | File | Path | Rows | Serves (room × context) |
|----|------|------|-----:|-------------------------|
| (a) | `sankalps_joy_work_career_wave2.json` | `kalpx/core/data_seed/sankalps_joy_work_career_wave2.json` | 7 | Joy × work_career (karma-yoga-craft) |
| (b) | `sankalps_joy_health_energy_wave2.json` | `kalpx/core/data_seed/sankalps_joy_health_energy_wave2.json` | 6 | Joy × health_energy (joy-rasa body-vitality) |
| (c) | `sankalps_growth_wave2.json` | `kalpx/core/data_seed/sankalps_growth_wave2.json` | 12 | Growth × {relationships: 4, money_security: 4, health_energy: 4} |
| (d) | `principles_bhakti_wave2.yaml` | `kalpx/core/data_seed/mitra_v3/principles_bhakti_wave2.yaml` | 11 | Connection × {purpose_direction: 5, health_energy: 4, relationships: 2} |
| (e) | `principles_gita_wave2_release.yaml` | `kalpx/core/data_seed/mitra_v3/principles_gita_wave2_release.yaml` | 4 | Release × wisdom_banner (BG 2.14-family, Ch 2.11-30 + 12.13-19) |
| (f) | `sankalps_release_work_career_wave2.json` | NOT AUTHORED | 0 | See §D doctrine call |
| (g) | this document | `docs/room_system_v31/audits/ROOM_THIN_GAP_AUTHORING_WAVE2.md` | — | Index |

**New rows total: 40 (7 + 6 + 12 + 11 + 4).**

All rows carry `status: draft` and `CURATOR_GATE: true`. No BE/FE ingestion will occur until founder review completes.

---

## §B Distribution matrix by room × context × class

| Room | Context | Class | Rows added | Source file |
|------|---------|-------|-----------:|-------------|
| Joy | work_career | sankalp | 7 | (a) |
| Joy | health_energy | sankalp | 6 | (b) |
| Growth | relationships | sankalp | 4 | (c) |
| Growth | money_security | sankalp | 4 | (c) |
| Growth | health_energy | sankalp | 4 | (c) |
| Connection | purpose_direction | principle (bhakti) | 5 | (d) |
| Connection | health_energy | principle (bhakti) | 4 | (d) |
| Connection | relationships | principle (bhakti) | 2 | (d) |
| Release | (context-agnostic) | wisdom_banner (gita) | 3 | (e) |
| Release | work_career | wisdom_banner (gita) | 1 | (e) — gita_wave2_release_equanimity_in_honor_and_dishonor |

**Cross-cut subslot distribution (Joy × sankalp only):**

| Subslot | Joy × work_career | Joy × health_energy | Total |
|---------|------------------:|--------------------:|------:|
| gratitude | 2 | 3 | 5 |
| blessings | 2 | 1 | 3 |
| seva | 3 | 2 | 5 |

---

## §C Joy × health_energy decision

**Decision: AUTHORED (6 rows), not deferred.**

### Reasoning

The risk flagged in the brief is that joy × health_energy easily slides into Ayurvedic correction register ("I heal my vāta," "I restore my dosha") which belongs in release or growth, not joy. That register collapse is real — but it is avoidable if the authoring holds discipline:

1. **Body-as-given, not body-as-problem.** Each of the 6 rows addresses a body that is, at this moment, sufficient or even well. "I notice this breath as a gift" (breath unearned, given), "I bless the body that carried me today" (evening gratitude, not morning correction), "I receive the ease that arrived without my planning" (prasāda register — grace-food, arrived freely).

2. **Authentic source anchors exist.** Taittirīya Upaniṣad 2.5 (ānanda-maya-kośa) + Bhāgavata 11.13-14 (Uddhava-gītā, body-as-yantra-of-devotion) + Praśna Upaniṣad 3 (prāṇa as divine) together form a clear devotional body-register that is not Ayurveda. This is the bhakti reading of embodiment.

3. **Misuse-risk fields on each row.** Every row carries explicit `misuse_risk` guarding against: (a) using it on a day the body is actually struggling (that day routes to release, not joy), (b) spiritualizing avoidance of medical care, (c) forcing the register when it is not honestly present.

4. **Verb-register discipline.** Verbs are exclusively offering-register: "I notice / I bless / I offer / I receive / I delight." Any row that drifted toward "I practice / I restore / I heal" was rewritten or removed.

### Founder-review items for this set

- Whether `sankalp.joy_health_offer_this_wakefulness_to_what_i_serve` reads as offering or as optimization. The seva framing is intentional — offering the clear morning onward — but founder should confirm.
- Whether `sankalp.joy_health_receive_the_ease_that_arrived` (prasāda register) is sufficiently bhakti-rooted or drifts toward passivity.
- Whether the chronic-illness framing in `sankalp.joy_health_offer_the_body_that_said_yes_today` is sensitive enough for users with variable capacity.

---

## §D Release × work_career — doctrine call

**Decision: HYBRID. Sankalps DEFERRED by doctrine (release is pre-sankalpic). One banner row in (e) tagged `life_context_bias: [work_career]` to route the acute-contraction phase of work-grief through release via wisdom_banner only. Clarity picks up discernment once contraction has metabolized.**

### Doctrine read

Per `ROOM_TRADITION_ASSIGNMENT_V2.md` §Release:

> **Dominant:** Shaiva/Tantric, Ayurveda (vāta/pitta-pacifying somatic release).
> **Avoid / exclude:** Bhakti, Niti (problem-solving grief), Sankhya (too analytical), Dinacharya.
> **BG placement:** SPARSE BANNER ONLY (Ch 2.14); never teaching, never principle-anchor.
> **Why:** Release metabolizes contraction. Somatic-primacy is native. Scriptural teaching of any kind risks re-contracting the user by intellectualizing grief.

Per `WAVE1_SYNTHESIS.md` §2.3 (Release class table):

> sankalp | X | — | — (doctrinally excluded — release is pre-sankalpic)

Per `WAVE1_SYNTHESIS.md` §8.3:

> Users who grieve professional failure (layoff, project collapse) have no room home at all — they currently have to route through clarity. **Doctrinal call needed before Wave 2 authoring.**

### Agent 7 call

Work-grief (layoff, project collapse, reputation damage, professional failure) has **two temporally distinct phases**, and the correct home-room differs by phase:

**Phase 1 — acute contraction.** Shock, shame, collapse-of-identity, reputation-grief, public blame. The user is not yet capable of discernment; thinking about the problem makes it worse. Doctrine says: **this phase routes to release, via somatic-primacy and sparse banner only.** No sankalp (release is pre-sankalpic). No principle-teaching (would intellectualize). Banner use of BG 12.18-19 (mānāpamānayoḥ samaḥ — equal in honor and dishonor) speaks precisely to reputation-grief/professional collapse without crossing into karma-yoga territory.

**Phase 2 — metabolized.** Once the contraction has moved through, the user needs discernment: what to do next, what was mine and what was theirs, what to rebuild. **This phase routes to clarity,** where Niti (pragmatic discernment), Sankhya (viveka), and the BG karma-yoga verse set (2.47, 3.35, 18.47) operate. That is already served by Agent F's Wave 2 Niti 50-row file.

### Concrete authoring decision

- **(f) `sankalps_release_work_career_wave2.json` — NOT AUTHORED.** Sankalps are doctrinally excluded from release. Authoring a work-career sankalp file for release would violate `ROOM_TRADITION_V2 §Release` and `WAVE1_SYNTHESIS §2.3`.
- **(e) `principles_gita_wave2_release.yaml` includes 1 row tagged `life_context_bias: [work_career]`** — `gita_wave2_release_equanimity_in_honor_and_dishonor` (BG 12.18-19). This is the doctrinally permissible pathway: sparse BG banner from Ch 12.13-19 endurance register, serving reputation-grief/professional-collapse specifically.
- **Post-Phase-1 discernment served by Agent F's existing Niti Wave 2 file** (14 rows in clarity × work_career). No additional authoring required for Phase 2.

### What this implies for later waves

If real-user telemetry later shows that release × work_career banner rotation is too thin even with this row plus existing BG 2.14, Wave 3 authoring should add 1-2 more Ch 12.13-19 banners tagged `life_context_bias: [work_career]`, but **must not** add sankalps or principle-teaching to release. The doctrine holds.

### Founder-review items for this call

- Is the two-phase hybrid acceptable, or should release × work_career be treated as a harder doctrinal exclusion (no work_career tag on any release banner)?
- Is the mānāpamānayoḥ samaḥ tag-to-work_career an appropriate specialization of the endurance-banner pool, or does it risk conflating reputation-grief with other grief contexts?

---

## §E Intervention-link recommendations

New rows were authored with outbound intervention_links pointing to existing (authored, not necessarily pooled) target_ids in the library. Below is the set of target_ids each new wave-2 row expects to find:

### Sankalp targets (not in library — flagged for Wave 3 authoring, deprecatable to text-only for now)

| Target sankalp_id (referenced by new principles) | Current library status | Recommendation |
|---|---|---|
| `i_receive_guidance_without_idolizing_the_guide` | NOT AUTHORED | Wave 3 (Connection × purpose_direction sankalp, if Connection gains sankalp slot — currently excluded by doctrine) |
| `i_serve_what_is_before_me` | NOT AUTHORED | Wave 3 |
| `i_walk_my_path_with_love` | NOT AUTHORED | Wave 3 |
| `i_receive_the_teaching_without_performing_it` | NOT AUTHORED | Wave 3 |
| `i_surrender_the_outcome_not_the_path` | NOT AUTHORED | Wave 3 |
| `i_honor_the_body_as_altar` | NOT AUTHORED | Wave 3 |
| `i_offer_the_body_as_it_is` | NOT AUTHORED | Wave 3 |
| `i_place_what_exceeds_me_in_divine_hands` | NOT AUTHORED | Wave 3 |
| `i_let_the_breath_be_the_prayer` | NOT AUTHORED | Wave 3 |
| `i_see_the_divine_in_this_person` | NOT AUTHORED | Wave 3 |
| `i_let_this_bond_be_offering_ground` | NOT AUTHORED | Wave 3 |

**Note:** These are forward-references. Connection is doctrinally `sankalp: X` per `WAVE1_SYNTHESIS §2.2` — so these sankalp_ids would only be authored if connection gains a sankalp slot in a future doctrine update. For v3.1.1 the intervention_links will currently dangle; they are preserved for semantic clarity and future activation.

### Mantra targets (existing or to-be-verified)

| Target mantra_id | Status |
|---|---|
| `om_shanti` | Existing (used by Bhakti W1) |
| `om_namo_narayanaya` | To verify in `master_mantras.json` (Viṣṇu canonical) |
| `om_namah_shivaya` | Existing (Shaiva release canonical) |
| `om_gurave_namah` | To verify / author if absent |
| `om_dhanvantaraye_namah` | To verify / author if absent (Dhanvantari canonical — Connection × health_energy primary mantra gap flagged W1 §2.2) |
| `soham` | Existing (stillness home; referenced for ajapā-gāyatrī teaching in `bhakti_the_breath_is_already_praising`) |

### Practice targets (existing)

| Target practice_id | Status |
|---|---|
| `silent_shield` | Existing |
| `hand_on_heart` | Existing |
| `one_next_step` | Existing |
| `belly_breathing` | Existing |

### Sankalp targets referenced by W2 SELF-CONTAINED (via principle → sankalp of this same wave)

None of the new W2 sankalps cross-reference each other. Each stands independent with its own source_anchor.

---

## §F Founder-review flags

Top items needing explicit founder signal before ingestion:

1. **§D Release × work_career doctrine call.** Hybrid (release for acute, clarity for metabolized) with 1 BG 12.18-19 banner tagged work_career. Is the hybrid acceptable or should work_career tag be removed from all release rows?

2. **Connection × sankalp forward-referencing.** New bhakti principles reference sankalp target_ids that do not yet exist because connection is currently `sankalp: X`. Forward-preserved for future doctrine update. Confirm this is the preferred treatment vs. stripping intervention_links now.

3. **Joy × health_energy register authenticity.** §C reasoning. Request founder scan of 2-3 rows for register-fit verdict; recommendation: spot-check `joy_health_receive_the_ease_that_arrived` (prasāda register) and `joy_health_offer_the_body_that_said_yes_today` (chronic-illness sensitivity).

4. **BG 10.9% cap after W2 release banners.** (e) adds 4 BG rows to release pool. Release BG was 2 pre-W2 (per `WAVE1_SYNTHESIS §4`); now 6. Clarity BG cap at 10.9% unaffected (W2 release banners go to release pool, not clarity). But overall BG visibility across rooms increases — confirm this does not trigger any system-level BG dominance concern per `ROOM_SYSTEM_STRATEGY §5`.

5. **Dhanvantari mantra authoring blocker.** `om_dhanvantaraye_namah` is referenced as primary intervention by `bhakti_the_body_is_the_first_altar` and `bhakti_dhanvantari_carries_what_the_body_cannot`. If not in `master_mantras.json`, these principles cannot fully resolve their primary intervention link until the mantra is authored. Confirm authorize Wave 3 Dhanvantari mantra authoring or request W2 inline addition.

---

## §G Post-wave coverage delta per room × context

Numbers are **rows-added-in-Wave-2** (this agent), not absolute pool sizes.

| Room | Context | Pre-W2 (per W1 synthesis) | W2 added | Post-W2 |
|------|---------|-------------------------:|---------:|--------:|
| Joy | work_career | sankalp: 0 | sankalp: +7 | sankalp: 7 |
| Joy | health_energy | sankalp: 0 | sankalp: +6 | sankalp: 6 |
| Growth | relationships | sankalp: 0 | sankalp: +4 | sankalp: 4 |
| Growth | money_security | sankalp: 0 | sankalp: +4 | sankalp: 4 |
| Growth | health_energy | sankalp: 0 | sankalp: +4 | sankalp: 4 |
| Connection | purpose_direction | bhakti-principle: 0 | principle: +5 | principle: 5 |
| Connection | health_energy | bhakti-principle: 1 | principle: +4 | principle: 5 |
| Connection | relationships | bhakti-principle: minimal | principle: +2 | principle: 2 net-new |
| Release | (context-agnostic) | banner (BG-family): 2 | banner: +3 | banner: 5 |
| Release | work_career | 0 (across all classes) | banner: +1 (tagged) | banner: 1 |

### Thin gaps CLOSED by this wave (per `WAVE1_SYNTHESIS §1.6` target bands)

| Gap | Target | Delivered | Status |
|-----|-------:|----------:|--------|
| Joy × work_career karma-yoga-craft sankalps | +5-8 | +7 | CLOSED |
| Joy × health_energy joy-register body-vitality | +5-8 (if viable) | +6 | CLOSED |
| Growth × relationships sankalps | +3-5 | +4 | CLOSED |
| Growth × money_security sankalps | +3-5 | +4 | CLOSED |
| Growth × health_energy sankalps | +3-5 | +4 | CLOSED |
| Connection × purpose_direction principles | +4-6 | +5 | CLOSED |
| Connection × health_energy principles | +3-4 | +4 | CLOSED |
| Release banner BG 2.14-family | +3-5 | +4 | CLOSED |

### Gaps NOT closed / deferred in this wave

| Gap | Reason for deferral |
|-----|-------------------|
| Release × work_career sankalp/principle | Doctrinally excluded (release is pre-sankalpic; sparse banner only). See §D. One banner tag delivered. |
| Dhanvantari mantra | Needs `master_mantras.json` verification + possibly authoring. Flagged §F.5. |
| Connection sankalp intervention targets | Connection is doctrinally `sankalp: X`. Forward-referenced; not authored. See §E, §F.2. |
| Stillness Vedanta-sākṣin banner breadth | Not in this wave's scope (W3 per `WAVE1_SYNTHESIS §1.6`). |
| Clarity × money_security mantra/practice | Not in this wave's scope (W3 per `WAVE1_SYNTHESIS §2.4`). |
| Niti clarity × relationships + purpose_direction depth | Agent F covered partial (6 relationships rows). Further authoring deferred to W3. |

---

## Pre-ingestion gate

Before these 40 rows enter the DB via migration:

1. Founder sign-off on §F items (5 review items).
2. §D doctrine call either confirmed (HYBRID) or adjusted.
3. Dhanvantari mantra existence verification in `master_mantras.json`; author if missing.
4. Wave 1b tag-patch completes (per `WAVE1_SYNTHESIS §7`) for Agent F + G's 82 rows — these 40 are already inline-tagged with v3.1 governance fields and do not need the same patch.
5. `CURATOR_GATE: true` flipped to `false` on individual rows as each passes founder review (row-by-row, not file-level, per standard curator gate discipline).

---

## References

| Artifact | Location |
|---|---|
| Upstream doctrine | `docs/room_system_v31/ROOM_SYSTEM_STRATEGY_V1.md` |
| W1 synthesis | `docs/room_system_v31/WAVE1_SYNTHESIS.md` §1.4 §1.6 §2 §4 §8 |
| Tradition assignment | `docs/room_system_v31/audits/ROOM_TRADITION_ASSIGNMENT_V2.md` |
| Existing Bhakti principles | `kalpx/core/data_seed/mitra_v3/principles_bhakti.yaml` |
| Existing Gita principles | `kalpx/core/data_seed/mitra_v3/principles_gita.yaml` |
| Existing sankalps | `kalpx/core/data_seed/master_sankalps.json` |
| Existing mantras | `kalpx/core/data_seed/master_mantras.json` |

---

## End-state

40 rows authored across 5 new files. Release × work_career doctrine call documented (HYBRID). Joy × health_energy viability confirmed (AUTHORED). All authoring gaps called out in `WAVE1_SYNTHESIS §1.6` as Wave 2-scope are addressed within the target bands. No existing files modified.

Next gate: founder review per §F, then Wave 1b tag-patch prerequisite, then migration ingestion.
