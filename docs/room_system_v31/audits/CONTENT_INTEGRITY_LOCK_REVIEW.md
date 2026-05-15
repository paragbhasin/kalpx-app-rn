# Content Integrity Lock Review — Agent 5 (Final)

**Reviewer:** Agent 5 (Wave 2 closing lock — Sanatan integrity)
**Date:** 2026-04-21
**Scope:** Final lock on ~143 new rows + Wave 2 pool placement. Reads Agent 8's prior pass (CONTENT_INTEGRITY_WAVE2_REVIEW.md) and confirms / overrides with evidence.
**Posture:** Closing lock, not redesign. Doctrine is NOT reopened. Agent 8's 3 doctrinal/curation "founder calls" (J.1.a, J.1.b, J.2.a–c) have been re-examined and most are demoted to curator hygiene.
**Sampling:** 13 Niti rows across 4 context bands; 12 Sankhya rows across 5 context bands (incl. both stillness rows); all 11 Bhakti; all 4 Gita-release; all 17 Ayurveda; all 25 new sankalps (13 Joy + 12 Growth).

---

## §A Final verdict per checklist item

| # | Checklist item | Verdict | Evidence |
|---|---|:-:|---|
| A.1 | Wrong-tradition / wrong-room mismatches | **SOFT-FAIL** | 2 Sankhya rows placed in `room_fit: [stillness]` violating ROOM_TRADITION_V2 §Stillness avoid-list (Sankhya excluded). Everything else clean. See §B. |
| A.2 | Shallow rows | **PASS** | 0 shallow rows found. Every row is either śāstra-anchored doctrine or operationally specific. See §C. |
| A.3 | Modern / generic rows | **PASS** (with 1 soft flag) | 1 phrase flag — `growth_money_act_from_long_view` line "10-year-horizon version of me" reads mildly modern-productivity but rooted_explanation anchors in Cāṇakya/Vidura/MBh Śānti Parva dīrgha-sūtratā. See §D. |
| A.4 | BG over-centralization re-check | **HOLDS** | Clarity 7/64 = 10.9% (cap 25%); Growth 11 as PRIMARY home (uncapped — correct per doctrine); Release 2 banner rows sparse-by-design; Joy 1 banner BG + 7 BG-cited sankalps all scoped to karma-yoga-craft work_career only; Connection 1 BG (18.66 via Rāmānuja); Stillness 1 banner (Ch 6.10-15). No out-of-doctrine BG appearances. See §E. |
| A.5 | Underexpressed tradition re-check | **SOFT-FAIL** on Bhakti, Yamas, Dinacharya; **ALIVE** on Ayurveda | Ayurveda broke through Wave 2 (17 new practices, 8 dosha configurations, 5 rooms). Bhakti got 11 Wave 2 principles but Connection × purpose_direction still single-corpus (only Rāmānuja/NBS/Bhāgavata — no mādhurya / Caitanya-Gauḍīya mode). Yamas still operating at floor (4 rows in clarity relationships). Dinacharya present but mostly via Ayurveda tagging, not native authoring. See §F. |

---

## §B Wrong-tradition / wrong-room mismatches

| row_id | tradition tag | room_fit | problem | proposed fix |
|---|---|---|---|---|
| `sankhya_rest_in_the_non_participating_witness` | sankhya | [stillness] (implicit — Agent G authored for stillness×self per file header §19-20) | ROOM_TRADITION_V2 §Stillness explicitly excludes Sankhya; ROOM_CLASS_DOMINANCE_V2 §Stillness excludes principle-class content. Structurally off-home despite clean Sāṁkhya doctrine. | Reclassify `room_fit: [clarity]` with state_tags [drained, overwhelmed, restless, scattered] already present. Purely curator-hygiene — content stays. |
| `sankhya_kaivalya_is_the_direction_of_stillness` | sankhya | [stillness] (implicit — same) | Same doctrinal violation. | Same fix: reclassify `room_fit: [clarity]` with stillness-adjacent tags, or delete (redundant with `rest_in_the_non_participating_witness` after reclass). |

No other mismatches found. Joy-gated `ayur_abhyanga_as_offering` is doctrinally permissible (Ashtanga Hridaya framing + CURATOR_GATE + explicit joy-state misuse_risk) — stands. Bhakti 18.66 via Rāmānuja Śaraṇāgati-gadya is correctly scoped to connection (not growth) because the source is Bhakti-primary, BG-secondary.

---

## §C Shallow rows

**0 shallow rows found.** Every sampled row carries either (a) specific śāstric anchor with verse cited, (b) operational move distinct from all adjacent rows, or (c) state-trigger precision that prevents generic deployment.

Representative verification — samples that could have been shallow but are not:

| row_id | class | anti-shallow evidence |
|---|---|---|
| `niti_praise_in_public_correct_in_private` | principle | Cites Vidura "counsellor does not censure the king before the court" + Cāṇakya "praśaṁsā bahuṣu, tarjanā ekānte — never the reverse." Operational register specific. |
| `niti_answer_the_question_that_was_asked` | principle | Cāṇakya "speech bounded by prasaṅga"; operationalizes "repeat the exact question in your head" — not therapy-voice, not mindfulness-generic. |
| `sankhya_the_thought_is_not_the_thinker` | principle | SK 3 + SK 19 cited — buddhi as first evolute of prakṛti + puruṣa as kevala-sākṣin. Operational discrimination move, not generic "thoughts are not you." |
| `bhakti_the_breath_is_already_praising` | principle | Haṁsa Up 1-4 ajapā-gāyatrī + Bhāg 11.14.32 prāṇa-offering. Specific to low-energy days via misuse_risk gate. |
| `sankalp.joy_work_bless_the_small_mastery_of_the_day` | sankalp | BG 2.50 yogaḥ karmasu kauśalam. Anti-inflation register explicit: "not the whole project, just one true small thing." Prevents generic gratitude-drift. |

**Disposition: 0 rewrites, 0 demotions, 0 rejections.**

---

## §D Modern-generic rows

| row_id | class | exact quote | disposition |
|---|---|---|---|
| `sankalp.growth_money_act_from_long_view_not_fear` | sankalp | "I ask what a 10-year-horizon version of me would do, rather than what a scared-right-now version would do" | **REWRITE LINE ONLY** (keep the row). Rooted_explanation properly cites dīrgha-sūtratā from Cāṇakya/Vidura/MBh Śānti Parva 120. The user-facing line leaks Silicon Valley productivity-speak. Proposed swap: "the long-thread self" or "the older me that comes back to see what I did today." Non-blocking; not a shallow row, just tonally off-register for a dharmic sankalp among 11 tonally-correct peers. |

No other modern-generic flags. Joy/offering vocabulary held across all 13 Joy rows. Growth cultivation vocabulary held across all 12 Growth rows. Ayurveda never uses "wellness," "self-care," "balance"-as-vague — every row names dosha + counter-quality. Bhakti never drifts to generic spirituality-speak.

---

## §E BG discipline re-check (hard numerical)

| Check | Target | Actual | Verdict |
|---|---|---|:-:|
| Clarity principle pool BG / total | ≤ 25% | 7/64 = **10.9%** | **PASS** |
| Growth principle pool BG | uncapped (PRIMARY home) | 11 rows of 58 total = 19% (PRIMARY placement) | **PASS** (doctrine allows) |
| Release banner BG | sparse (2.11-30 + 12.13-19 only) | 2 existing + 4 new Wave 2 = 6 banner rows total, all in BG Ch 2 (2.14, 2.20, 2.23-24) + Ch 12 (12.18-19). All carry `surface_eligibility: [wisdom_banner]` + `exclude_from_contexts: [joy, growth, clarity, connection, stillness]` | **PASS** |
| Joy × work_career BG (2.47 exception only) | allowed | 7 sankalps cite BG 2.47 / 2.50 / 3.7 / 9.27 / 18.46 / 18.47 — all karma-yoga-joy-of-the-craft. 1 wisdom_banner BG row. | **PASS** |
| Joy × non-work_career BG | 0 expected | 0 in joy_health_energy (Bhakti-primary, BG-light secondary only in one row) | **PASS** |
| Connection BG | 0 expected (except 18.66 via Rāmānuja) | 1 row (`bhakti_surrender_the_direction`) — correctly Bhakti-register reading of 18.66 | **PASS** |
| Stillness BG | 0 expected (except Ch 6.10-15 banner) | 1 existing banner (`gita_endure_the_passing_contacts`), 0 new Wave 2 | **PASS** |
| Any BG in doctrine-excluded room | 0 | 0 | **PASS** |

**BG discipline: HOLDS.** 0 out-of-doctrine appearances across ~17 new BG-citing rows.

---

## §F Underexpressed tradition re-check

| Tradition | Home room | Current count | Verdict |
|---|---|---|:-:|
| **Ayurveda** | Release (dominant) + light support elsewhere | 17 new practices across 5 rooms (release 8, growth 4, stillness 1, clarity 2, connection 1, joy 1 gated). 8 distinct dosha configurations. Daily dinacharya anchors present. | **ALIVE** |
| **Bhakti** | Connection (dominant) | 11 new + existing = full Connection × purpose_direction pool (5) + Connection × health_energy (4 Dhanvantari) + Connection × relationships (2). Authored from single-lineage corpus — Rāmānuja Śrīvaiṣṇava + NBS + Bhāgavata + Dhanvantari. **MISSING:** Caitanya-Gauḍīya mādhurya register; Ālvār Tamil-bhakti; Mīrā / Kabīr Sant traditions. Doctrinal home is satisfied at *minimum viable*; aesthetic breadth thin. | **MINIMUM-FLOOR** |
| **Yamas** | Growth substrate (cultivation); Clarity relationships light-support | 4 rows in Clarity relationships pool (satya_clean + satya_with_timing + ahimsa_toward_others from existing seed; 1 via Wave 2). Wave 2 growth sankalps reference yamas via tradition_family but don't author new yamas principles. | **STILL-THIN** |
| **Dinacharya** | Distributed support (Stillness, Clarity, Growth via Ayurveda) | 5 rows in Clarity daily_life (existing) + 7 Ayurveda-tagged dinacharya practices (warm-water-waking, kapha-brisk-walk, ginger-honey, dry-brush, kapalabhati, post-meal-walk, warm-foot-soak, nasya, shatapavali). Native *principle*-class dinacharya still absent — practice-class only. | **MINIMUM-FLOOR** (practice), **STILL-THIN** (principle) |

**Wave 3 depth-authoring recommended for:** Bhakti (Gauḍīya mādhurya + Ālvār register), Yamas (asteya + brahmacarya + aparigraha principles in growth native-home), Dinacharya principles (rhythm-before-decision teaching in clarity daily_life).

---

## §G Must-fix before land

1. **Reclassify 2 Sankhya stillness×self rows.** `sankhya_rest_in_the_non_participating_witness` + `sankhya_kaivalya_is_the_direction_of_stillness` — remove `[stillness]` from room_fit, replace with `[clarity]` and state_tags [drained, overwhelmed, restless, scattered]. Pure curator move; content stays.

2. **Governance-field backfill — 82 Wave 1 rows.** 50 Niti + 32 Sankhya rows still lack inline v3.1 governance fields (confirmed: Niti yaml has 108 governance lines / 6 per row = 18 complete rows out of 68; Sankhya yaml has 72 / 12 rows out of 44). Without `room_fit` / `surface_eligibility` / `life_context_bias`, these rows cannot route. Blocks Wave 2 land. Apply TAG_PATCH_WAVE1B.yaml.

3. **`om_dhanvantaraye_namah` mantra authoring.** Referenced as `role: primary` by `bhakti_the_body_is_the_first_altar` + `bhakti_dhanvantari_carries_what_the_body_cannot`. If not authored in master_mantras.json, these two anchor rows have dangling intervention links. Author inline or strip the intervention_links entries on land.

4. **Rewrite `sankalp.growth_money_act_from_long_view` line.** Swap "10-year-horizon version of me" → "the long-thread self" or "the older me that comes back to see what I did today." Tonal fix only; all other fields remain.

---

## §H Safe to defer

1. **Growth×money minor overlap** — `growth_money_practice_responsible_effort` + `growth_money_honor_the_labor` are both artha-dharma stewardship. Keep both in Wave 2; consider tightening in Wave 3 if pool churn shows low diversity.
2. **Release×work_career single banner row** — `gita_wave2_release_equanimity_in_honor_and_dishonor` `life_context_bias: [work_career]`. Doctrinally permissible (12.18-19 mānāpamānayoḥ samaḥ is precisely reputation-grief). Curator may add 1 more to shore rotation; not required.
3. **Release pool size** — 8 Ayurveda practices vs 5-6 target band. Each addresses a distinct dosha-state; rationale holds. Defer.
4. **Forward-reference sankalp target_ids in Bhakti W2** — 11 intervention_links reference unauthored sankalp IDs. Will dangle but not break runtime. Strip on land or preserve for Wave 3 authoring.
5. **Intervention-link rewire for 14 existing Ayurveda principles** — AYURVEDA_ROOM_MAPPING §E.1. Non-blocking; propose as follow-up migration `0136_rewire_ayurveda_intervention_links.py`.
6. **`practice.ayur_kapalabhati_short_morning` tradition tagging** — Hatha Shatkarma operationalized as Ayurveda dinacharya. Current tag `[ayurveda]` is defensible per file's inline disclosure. Curator hygiene only.

---

## §I Founder decisions (ruthlessly filtered)

Agent 8 proposed 8 net-new founder calls across §J (1 doctrinal + 3 curation + 4 hygiene). On re-read, **most of these are curator decisions**, not founder calls. Genuine founder calls are items requiring doctrinal/judgment that cannot be resolved by applying existing ROOM_TRADITION_V2 + ROOM_CLASS_DOMINANCE_V2.

Filtered list (max 5):

1. **Aesthetic breadth of Bhakti corpus — single-lineage authoring acceptable or insufficient?** All 11 Bhakti W2 rows source from Rāmānuja Śrīvaiṣṇava + NBS + Bhāgavata + Dhanvantari. Founder call: is this minimum-viable Bhakti for Wave 2 ingestion, or does the app's Bhakti pool need Gauḍīya mādhurya + Ālvār + Sant breadth before connection is considered doctrinally fully-served? (Operational answer is yes-ship-now; doctrinal aesthetic answer is founder's.)

2. **`mantra.shivoham` in stillness rotation.** Preserved from CONTENT_INTEGRITY_V2. Shaiva-bija risks drift toward release-register in stillness. Founder: keep as-is, swap for Vedanta-witness equivalent (e.g. `sākṣī-aham` or Upaniṣadic silence-bija), or remove. Not resolved by doctrine.

3. **Release × work_career admission scope.** Doctrine reads "BG sparse banner ONLY" for release and allows `life_context_bias: [work_career]` tagging. Founder call: is reputation-grief (professional collapse, public blame) a legitimate release-room use-case, or does it belong in growth for dharma-rebuild? The 12.18-19 banner is authored; routing is founder's.

All other Agent 8 items (Sankhya-stillness reclassification, Dhanvantari mantra, Niti growth-pool ordering, governance-field backfill, intervention-link rewire, forward-reference targets, kapalabhati tagging, dry-brush scope, abhyanga-as-offering gate) = **curator hygiene**, not founder decisions. Applying existing doctrine resolves them.

---

## End-state

- **Artifact:** `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/audits/CONTENT_INTEGRITY_LOCK_REVIEW.md`
- **§A verdicts:** SOFT-FAIL / PASS / PASS (with 1 line-fix) / HOLDS / SOFT-FAIL.
- **Wrong-tradition mismatches:** 2 (both Sankhya × stillness; pure re-tag fix).
- **Shallow row count:** 0. **Modern-generic row count:** 1 line-fix, 0 full rewrites.
- **BG discipline:** HOLDS (all 5 cap/placement checks PASS).
- **Tradition aliveness:** Ayurveda ALIVE; Bhakti MINIMUM-FLOOR; Yamas STILL-THIN; Dinacharya MINIMUM-FLOOR.
- **Founder decisions remaining:** 3 (Bhakti breadth / shivoham disposition / release×work_career scope).
- **Must-fix before land:** 4 hygiene items (Sankhya-stillness reclass + 82-row tag-patch + Dhanvantari mantra + growth_money line rewrite).

Wave 2 authoring integrity is **substantively clean**. The 4 must-fix items are curator hygiene, not content failures. Land after those close.
