# P1 Final Synthesis — Room System v3.1.1
**Date:** 2026-04-21
**Synthesized from:** P1_MIGRATION_REPORT, P1_RUNTIME_VARIATION_REPORT, P1_BHAKTI_BREADTH_REPORT, P1_SANATAN_INTEGRITY_REVIEW, P1_CONTENT_FILL_REPORT, P1_SURFACE_ISOLATION_REAUDIT + coordinator-identified gaps

---

## What P1 Changed

P1 attacked three distinct gaps simultaneously. Track A (P1-A) wrote migration 0144 to convert every pool's bare-string `rotation_refs` to dict format carrying `life_context_bias` — the structural prerequisite for Rule 5 to fire at all; this migration is written but not yet applied. Track B (P1-B) authored 14 new Bhakti rows across Gauḍīya, Ālvār, and Sant lineages for the connection and joy rooms, all passing 100% integrity review with two source-verification items flagged before prod. Track C (P1-C) closed connection's thin practice/banner cells for `purpose_direction` (0 → 3 practices) and `health_energy` (1 → 4 practices), triaged all 14 remaining original-corpus Nīti dark rows to clarity, proposed bias tags for 18 growth principle rows, and resolved 15 cross-surface override decisions. What is VERIFIED is the migration logic, all doctrinal assignments, all bias tags, all lineage integrity checks, and all 15 override decisions. What is NOT YET LIVE is any of it — 0144 is undeployed, P1-B rows are unmitigrated, P1-C content is uningested, and the Python `WisdomPrinciple` model class is still missing the `life_context_bias` field.

---

## The 7 Founder Questions

---

### Q1: Is Rule 5 now actually operative in production-like rendering?

**Conditionally yes — four conditions must hold simultaneously. If any one is missing, Rule 5 is silent for principle slots or entirely.**

**Condition 1 — Migration 0135b applied AND models.py updated:** Migration 0135b adds `life_context_bias` as a DB column to the WisdomPrinciple table. But if the Python `WisdomPrinciple` class in `models.py` does not declare this field, the 0144 migration's `_lookup_bias` function will silently catch the resulting `AttributeError` and return `[]` for every WisdomPrinciple row. Result: clarity/principle and growth/principle pool entries receive `life_context_bias: []` in their dicts, Rule 5 never fires for those slots, and there is no error message. This is the most critical technical gap in the system. **Both the DB migration and the Python class update are required.**

**Condition 2 — Migration 0136 applied:** 0136 ingests the actual bias values from TAG_PATCH_WAVE1B and LIFE_CONTEXT_TAG_PATCH into the content tables. Without it, 0135b adds the column but all WisdomPrinciple rows have empty bias. Runner slots (mantras, practices, sankalps) have their own bias from migration 0130 and are unaffected — but principle slots remain dark.

**Condition 3 — Migration 0144 applied:** This converts every bare-string rotation_ref to a dict carrying the bias value. Without 0144, the selector's `isinstance(r, str)` branch assigns `bias=[]` to every rotation ref and Rule 5 is permanently silenced regardless of what values are in the content tables.

**Condition 4 — FE/API passes `life_context` in room render requests:** The `select_room_actions` signature defaults `life_context=None`. If the caller omits this parameter, Rule 5 short-circuits on `if life_context:` and contributes +0 to every candidate. Rule 5 is then behaviorally identical to the pre-migration bare-string world.

**What happens if any condition is missing:**
- 0135b missing or models.py unpatched: Rule 5 fires for runner slots (mantra, practice, sankalp) but NOT for principle slots. clarity/principle and growth/principle chips are context-neutral.
- 0136 missing: Same as above — columns exist, values are empty.
- 0144 missing: Rule 5 cannot fire for anything regardless of tagging.
- FE doesn't pass life_context: Rule 5 cannot fire for anything regardless of migration state.

**Minimum required sequence for full Rule 5 operability: 0135b (+ models.py field) → 0136 → 0142 → 0144, AND FE passes life_context.**

Anchor slots (`pool.anchor_ref`) are always assigned `bias=[]` by the selector by design. Cold-start renders (which prefer the anchor) are always context-neutral on Rule 5. Only repeat renders drawing from rotation refs benefit from Rule 5.

---

### Q2: Which rooms now visibly change by life_context?

| Room | Slot | Signal strength | Why |
|---|---|---|---|
| room_clarity | principle | **Strong** — work_career (~22 items), money_security (~12), daily_life (~10), relationships (~9) | 50 Nīti rows from 0142 carry explicit bias per TAG_PATCH_WAVE1B; 14 more Nīti rows pending Phase 2 (121 total post-P1) |
| room_clarity | mantra | **Moderate** — work_career, purpose_direction | Saraswati/Hanuman/Ganesha mantras tagged via LIFE_CONTEXT_TAG_PATCH |
| room_growth | principle | **Moderate** — work_career (~5 Nīti rows), money_security (~3 Nīti rows); **weak** — relationships | 8 Nīti rows from 0142 Groups E+F; 18 BG/Dharma/YS rows now tagged via P1-C (pending apply); no relationships-biased Nīti rows in growth |
| room_growth | sankalp | **Moderate** — purpose_direction, work_career, daily_life | Growth sankalp pool carries explicit bias (conditional on D-01–D-08 cleanup; see Q6) |
| room_growth | mantra | **Moderate** — purpose_direction, money_security | Gayatri/Mahalakshmi mantras tagged |
| room_release | mantra | **Moderate** — health_energy, self_devotion | Shiva mantras and Ayurveda-tagged practices |
| room_release | practice | **Moderate** — health_energy | Bhramari etc. tagged |
| room_connection | mantra | **Weak** — relationships, self | Small pool (~3–5 mantras); contexts clustered around relational register |
| room_connection | practice | **Moderate** (pending P1-C ingestion) — purpose_direction (3 new rows), health_energy (4 new rows) | P1-C fills previously empty cells |
| room_joy | mantra | **Moderate** — self_devotion, relationships, daily_life | Bhakti/Lakshmi mantras tagged |
| room_stillness | all | **None** — by design | All stillness rows tagged `life_context_bias: []` per pre-cognitive room doctrine |

For a `work_career` user in clarity: ~22 principle items score +1 vs. ~85 items scoring flat — a 3x priority uplift for work-career-biased content over the pre-migration uniform-random state.

---

### Q3: Which rooms remain mostly universal even after P1?

**room_stillness** — Universal by design, permanently. Pre-cognitive regulation space; life_context differentiation is doctrinally harmful here. All items will carry `bias: []` after 0144.

**room_connection** — Partially universal. Connection excludes work_career and money_security by doctrine. A user in those life contexts visiting connection gets zero Rule 5 discrimination. The pool is small (~5 mantras), and even after P1-C's additions, mantra × purpose_direction and × health_energy carry only 1 mantra each (mantra authoring was out of P1 scope). Rule 5 signal in connection is real for `relationships` and `self_devotion` users but absent for excluded contexts.

**room_joy × money_security** — Zero Rule 5 signal by doctrine. money_security is excluded from joy. Any money_security user in joy sees context-neutral selection.

**room_release × purpose_direction** — Zero Rule 5 signal by doctrine. purpose_direction is excluded from release. Users in that context visiting release see no Rule 5 discrimination.

**health_energy users across most rooms** — Weak rather than zero, but thin. clarity has ~4 health_energy-biased principle items out of 121 total; growth has a few YS rows (`yoga_sutras_subtler_not_intenser`). health_energy users will frequently receive universal (unbiased) items because the bias-eligible set is small. Not starvation — unbiased items are not penalized — but the Rule 5 lift is minimal.

---

### Q4: Has connection gained enough depth in practice and lineage?

**Practice depth: Yes for the two thin cells, pending ingestion.**

| Context | Before P1-C | After P1-C |
|---|---|---|
| purpose_direction / practice | 0 rows | 3 rows (C-PD-1, C-PD-2 pending rewrite, C-PD-3) |
| purpose_direction / wisdom_banner | 2 rows | 3 rows (+C-WB-PD-1) |
| health_energy / practice | 1 row | 4 rows (+C-HE-1, C-HE-2, C-HE-3) |
| health_energy / wisdom_banner | 2 rows | 4 rows (+C-WB-HE-1, C-WB-HE-2) |

Note: C-PD-2 (guru breath) requires rewrite before ingestion (see Q6). If C-PD-2 is rewritten and passes integrity review, purpose_direction/practice goes 0 → 3. All other cells close cleanly.

**Lineage breadth: Yes — materially.**

| Lineage | Before P1-B | After P1-B |
|---|---|---|
| Vaiṣṇava (undifferentiated W1+W2) | 18 rows | 18 rows (unchanged) |
| Gauḍīya (Chaitanya line) | 0 | 5 rows — viraha-bhakti, nāma-saṅkīrtana, sevā, ecstatic bhāva registers |
| Ālvār (Tamil Vaiṣṇava) | 0 | 4 rows — prapatti, daas, divine nearness, luminous ordinary registers |
| Sant (Nirguṇa north Indian) | 0 | 5 rows — Kabīr (×2), Mirabai, Tukaram, Nāmdeva — 4 distinct devotional voices |
| **Total Bhakti rows** | **18** | **32 (+14)** |

The connection room now has three fully distinct Bhakti lineages alongside the existing undifferentiated base. Each lineage maintains a separate doctrinal vocabulary — Gauḍīya's viraha/mādhurya, Ālvār's Tamil prapatti, Sant's nirguṇa directness — with no voice bleed between lineages. Integrity review passed all 14 rows (100%) with no removals, 2 source-verify items before prod (S-3 Tukaram, S-5 Nāmdeva).

**Is it sufficient?** For Waves 1–3 scope, yes. The W3 F2 commitment (Gauḍīya/Ālvār/Sant tracking as W3 requirement) is now fulfilled. The mantra layer remains thin (1 each for purpose_direction and health_energy) — that remains a Wave 4 item.

---

### Q5: Has joy gained breadth without losing its register?

**Yes — breadth added, register holds.**

Joy wisdom_banner pool: 5 rows (pre-P1) → 9 rows (post-P1-B). Additions: G-3 (dual, viraha-ānanda), G-5 (Gauḍīya ecstatic bhāva), A-4 (Ālvār luminous ordinary), S-4 (Kabīr universal access).

**Register check:**
- All 4 new joy rows carry `emotional_function: offer` (celebrating what is), which is joy's native register. None carry `deepen` (connection's register).
- G-3 is the only dual-tagged row (connection + joy). The doctrinal basis is Gauḍīya viraha-ānanda — the tradition itself teaches that longing and ecstasy are simultaneously present at the highest devotional level. This is not register-bleeding; it is register-collapse at the doctrinal apex. Banner-only format (no teaching slot) is the correct containment.
- G-5 frames ecstasy as epistemology (bhāva as knowing), not as performance. A-4 frames luminous ordinary-world perception as devotional vision. S-4 frames divine universal access as joy. All three are ānanda-register correctly.
- No joy row uses Nīti (excluded), Sankhya (excluded from joy), or Shaiva/Tantric (excluded) tradition.

**Lineage diversity in joy:**
- Pre-P1-B: 5 rows, all undifferentiated Vaiṣṇava/Bhāgavata register.
- Post-P1-B: 9 rows across 4 lineages (Vaiṣṇava base + Gauḍīya + Ālvār + Sant). Joy now has 3 distinct devotional voices in the banner pool.

**Joy sankalp pool integrity:** The 3 joy sankalp subslots (gratitude, blessings, seva) are unchanged by P1-B — those are untouched. The concern from P1-C (D-01–D-08) is that some joy-register sankalps may have been incorrectly included in the growth pool, not that growth sankalps leaked into joy. Joy's sankalp identity is intact.

---

### Q6: What still blocks prod, if anything?

**HARD BLOCKERS (prod cannot flip without these):**

- **HARD BLOCKER: Python `WisdomPrinciple` model class does not define `life_context_bias`** — Update `models.py` to add the field matching migration 0135b's schema, AND apply 0135b. Without both, 0144 silently produces `life_context_bias: []` for every principle pool entry. Rule 5 is dead for principle slots. — Owner: BE

- **HARD BLOCKER: Migration chain 0135b → 0136 → 0142 → 0144 must be applied in order on prod** — Currently none of these are on prod. 0144 depends on 0143. 0136 depends on 0135b. 0142 depends on 0140. Full chain must apply clean. Any failure aborts (0144 has a hard RuntimeError assertion on bare strings remaining). — Owner: BE

- **HARD BLOCKER: Audit migration 0132 `room_growth/sankalp/rotation_refs` for 8 wrong-register joy sankalps (D-01–D-08)** — If `sankalp.choose_santosha`, `sankalp.give_grace`, `sankalp.invite_abundance_gently`, `sankalp.joyful_presence`, `sankalp.live_in_gratitude`, `sankalp.open_to_divine`, `sankalp.see_goodness`, `sankalp.welcome_abundance` are in the growth pool refs, a cleanup migration (0145) must be written and applied before prod. These 8 are joy/acceptance-register sankalps serving register-wrong chips in the growth room. — Owner: BE (10-minute audit: read 0132 migration file)

- **HARD BLOCKER: MITRA_ROOM_SACRED_KEY must be provisioned** — Sacred-write endpoint is gated on this key. Prod flip is blocked without it. — Owner: Infra

- **HARD BLOCKER: FE must pass `life_context` in room render requests** — If the render API call does not include `life_context`, Rule 5 cannot fire regardless of migration state. This is the integration contract between FE and the selector. — Owner: FE

**CONTENT GATES (must resolve before ingesting P1-B/P1-C content):**

- **CONTENT GATE: C-PD-2 `practice.connection_guru_breath` — rewrite required** — As written, assumes user has a formal guru-lineage. Inaccessible for secular, diaspora, and Abrahamic-background users. Recommended rewrite: "Before entering a role that asks much of you, breathe in and silently call to mind whoever taught you something true about this work — a teacher, an elder, or the lineage behind your practice. Let that remembrance be the breath that carries you forward." Doctrinal ground (guru-bhakti as connector to calling) preserved. — Owner: Content

- **CONTENT GATE: S-3 Tukaram `bhakti_sant_tukaram_grace_finds_the_one_who_stops_performing` — source verify** — Verify "Āhān to mi deva" first-line attribution against Tukaram Gāthā (Pune university edition, Vol. 1–3) before prod migration. If not found, replace opening with best-verified Tukaram nakedness-prayer abhanga. Teaching itself is doctrinally unambiguous and unchanged. — Owner: Content

- **CONTENT GATE: S-5 Nāmdeva `bhakti_sant_namdeva_the_divine_is_in_the_work_of_your_hands` — source verify** — Verify "Shivta shivta" reference in Nāmdeva Gāthā (Ranade edition, Pune) before prod migration. Teaching unchanged if reference cannot be confirmed — use best-verified Nāmdeva tailoring-abhanga opening. — Owner: Content

**FOUNDER SIGN-OFF REQUIRED (binary decisions, see section below):**

- **FOUNDER SIGN-OFF: F-1** — Accept Nīti at ~60% of clarity principle pool and commit to Sankhya/YS balancing in Wave 3, OR defer 7 of 14 Phase 2 Nīti rows.
- **FOUNDER SIGN-OFF: F-2** — Confirms D-01–D-08 audit approach (read 0132 now, treat as prod-blocking if confirmed present). Not actually a binary — this is a must-do.
- **FOUNDER SIGN-OFF: F-3** — Accept G-3 dual-tag as doctrine-grounded unique exception with explicit rule-hardening, OR assign G-3 to connection only.
- **FOUNDER SIGN-OFF: F-4** — Add `exclude_from_contexts: [grief_acute, relationship_rupture_acute]` to S-2 Mirabai before prod.

---

### Q7: What should P2 be, based on evidence rather than theory?

P1 surfaced three concrete gaps that are evidence-grounded and user-facing.

First, the **smoke_room_render 1/12 vs 12/12 conflict** (flagged before P1 began, still unresolved) must be cleared before anything else. This is not a P1 finding — it predates P1 — but it is the gate for dev safety on all migrations. If the smoke is at 1/12, any migration applies against a broken baseline. Resolving this is P2 item zero.

Second, **the principle pool at clarity is now ~60% Nīti** (P1 evidence). Sankhya and Yoga-Sūtras are clarity's co-dominant traditions but are underrepresented in the rotation pool. A `work_career` user in clarity will encounter Nīti-flavored tactical wisdom in roughly 6 of 10 sessions. This is register-correct but experientially narrow. P2 should pool 20+ Sankhya rows and 15+ Yoga-Sūtras rows into clarity to bring Nīti below 45% and give the room its full viveka (not just strategic-viveka) texture.

Third, **growth's Rule 5 signal is highly skewed to work_career and money_security** (P1 evidence). The `relationships` life context has near-zero Rule 5 signal in growth — no relationships-biased Nīti rows were added in Wave 2, and the few Bhakti/YS rows tagged by LIFE_CONTEXT_TAG_PATCH do not create a meaningful eligible set. A `relationships` user in growth gets the same rotation as an untagged user. P2 should author 5–8 growth principle rows explicitly biased to `relationships` (the `maitrī-karuṇā` cultivation register from YS 1.33, relational-dharma rows, BG Ch 12 friendship-and-care rows), and similarly for `self_devotion` and `health_energy` thin cells in growth.

P2 should not reopen room doctrine, Bhakti lineage breadth (F2 is fulfilled), or the override ledger (all 15 resolved). The work is: smoke-gate clear, Sankhya/YS pooling in clarity, and growth × relationships/self_devotion content fill.

---

## What Landed vs What Remains

| Track | Status | Evidence | Prod-safe? |
|---|---|---|---|
| P1-A: 0144 pool format migration written | WRITTEN — not applied | Migration file exists; integrity verified | Not yet — awaits dev apply + 12/12 smoke |
| P1-A: models.py WisdomPrinciple field | MISSING — GAP | Coordinator-identified; not in migration 0135b | Hard blocker for principle slot Rule 5 |
| P1-A: 0135b + 0136 prerequisite chain | WRITTEN — not applied | Dependencies declared in 0144 | Must apply before 0144 |
| Rule 5 operative for runner slots (mantra/practice/sankalp) | Conditional | Runner slot bias from 0130 is pre-existing; needs 0144 for dict conversion | After 0144 + FE integration |
| Rule 5 operative for principle slots | Conditional on hard blocker | Needs 0135b + models.py + 0136 + 0144 | After all 4 + FE integration |
| P1-B: 14 Bhakti rows authored (Gauḍīya/Ālvār/Sant) | AUTHORED — integrity-reviewed | 5/5 Gauḍīya pass, 4/4 Ālvār pass, 5/5 Sant pass | After S-3/S-5 source verify + C-PD-2 rewrite (separate P1-C item) |
| P1-B: 2 Sant source verifications | OUTSTANDING content gate | S-3 Tukaram + S-5 Nāmdeva first-line verification pending | Before prod migration |
| P1-C: 9 connection practice/banner rows authored | AUTHORED — tradition-clean | All 9 pass tradition + register check; C-PD-2 requires rewrite | After C-PD-2 rewrite + founder review |
| P1-C: 14 Nīti Phase 2 rows → clarity | TRIAGED — unanimously confirmed | All 14 confirmed clarity by P1-C + P1-SI + P1-SIR | After tag-patch write + pool format migration |
| P1-C: 18 growth principle bias tags | ALL CONFIRMED | Surface Isolation confirmed all 18 tags | After tag write + 0144 |
| P1-C: 15 override ledger decisions (D-01–D-15) | ALL CONFIRMED (15/15 agreement) | D-01–D-08 REJECT-from-growth; D-09–D-14 ACCEPT dual-use; D-15 accept+prod-verify | D-01–D-08 depend on 0132 audit; D-15 needs prod-verify |
| D-01–D-08: Joy sankalps in growth pool audit | UNVERIFIED | 0132 migration file not yet read for these specific refs | Must audit before prod — may require migration 0145 |
| Nīti dominance in clarity (~60%) | KNOWN FLAG | P1-SI calculation: 72/121 rows = Nīti | Functional; needs Sankhya/YS balancing in P2 |
| S-2 Mirabai exclusion tag | AUTHORED — missing gate | intensity=high confirmed; `grief_acute` tag recommended | Add `relationship_rupture_acute` to exclude list before ingestion |
| G-3 dual-tag precedent rule | AUTHORED — founder call needed | Doctrinal basis is strong; rule-hardening required | Needs F-3 founder decision |
| 12/12 smoke on dev | OUTSTANDING | Pre-existing 1/12 vs 12/12 conflict, pre-dates P1 | Must clear before any P1 migration applies to dev |

---

## Open Founder Sign-Off Items

**[F-1] Nīti dominance in clarity principle pool (~60%)** — After P1-C Phase 2, Nīti rows constitute ~72 of ~121 clarity principle rows (60%). Sankhya and Yoga-Sūtras, also designated dominant traditions in clarity, are underrepresented. Clarity may feel like a strategy/tactics room rather than a viveka room for work_career users. — **Choice A:** Accept current state; commit to pooling 20+ Sankhya + 15+ YS rows in Wave 3 (P2) to bring Nīti below 45%. Recommended. — **Choice B:** Defer 7 of the 14 Phase 2 Nīti rows until Sankhya/YS balance is restored. Impact: slower clarity pool growth but better tradition diversity now.

**[F-2] D-01–D-08 growth sankalp audit** — 8 joy/acceptance-register sankalps (`choose_santosha`, `give_grace`, `invite_abundance_gently`, `joyful_presence`, `live_in_gratitude`, `open_to_divine`, `see_goodness`, `welcome_abundance`) may be incorrectly included in `room_growth/sankalp/rotation_refs` from migration 0132. If present, growth is serving register-wrong chips to all growth users now. — **Choice A:** Audit 0132 migration file immediately; treat as prod-blocking if any of the 8 are confirmed present (write migration 0145 to remove them). Recommended — 10-minute read with potentially high impact. — **Choice B:** Defer to post-prod. Impact: live register-wrong chips in growth for all current users until post-prod.

**[F-3] G-3 dual-tag boundary** — Row `bhakti_gaudia_love_that_aches_is_already_meeting` is tagged `room_fit: [connection, joy]`. Doctrinal basis: Gauḍīya viraha-ānanda — the tradition explicitly teaches that longing and ecstasy are simultaneously present at mahābhāva. Only row in P1 with dual room_fit. Integrity review confirmed doctrinal basis as genuine and unique (not repeatable). — **Choice A:** Accept G-3 dual-tag as unique doctrinal exception; add explicit rule to ROOM_SYSTEM_STRATEGY_V1.md §5 that no other row may be dual-tagged without comparable doctrinal citation and founder+doctrine sign-off. Recommended. — **Choice B:** Assign G-3 to connection only (longing-register is primary). Simpler pool boundaries; viraha-ānanda resolved into the reaching pole only. Impact: loss of the doctrinally accurate connection/joy collapse; joy pool stays at 8 rows not 9.

**[F-4] S-2 Mirabai intensity gate** — Row `bhakti_sant_mira_i_have_chosen_the_path_that_cannot_be_taken_back` (intensity=high). The "I have left everything behind, there is no return" register is genuine high-charge Mirabai bhakti. For a user in acute grief or relational rupture, "no backward door" could harm. P1-B proposed `exclude_from_contexts: [grief_acute]`; integrity review recommends adding `relationship_rupture_acute`. — **Choice A:** Add both exclusion tags before prod ingestion. Costs nothing; prevents one harmful pastoral scenario. Recommended. — **Choice B:** Trust intensity=high flag and room-selection emotional-state logic to filter. Risk: room-selection doesn't guarantee this row won't reach a grief user in connection.

---

## P1 Complete Migration Sequence (for prod)

The following is the ordered sequence required for full P1 operability on prod. Prerequisites from earlier waves that may not yet be on prod are listed first.

```
Pre-P1 prerequisites (from Wave 2 / earlier):
  0130   — adds life_context_bias to runner models (MasterMantra, MasterPractice, MasterSankalp)
  0131   — (prior wave; must precede 0132)
  0132   — growth sankalp pool seeding [AUDIT FIRST for D-01–D-08 contamination]
  0133   — decontamination (soham/hand_on_heart/yoga_sutras cross-room removal)
  0134   — BG cap coding
  0135   — (Wave 2 governance)
  0135a  — (Wave 2 Phase B seeding — 127 new principles)
  0135b  — adds life_context_bias column to WisdomPrinciple DB schema
             [REQUIRES models.py Python class update at same time]
  0136   — ingests LIFE_CONTEXT_TAG_PATCH + TAG_PATCH_WAVE1B values into all content tables
  0137   — (Wave 2 close migration)
  0138   — (if applicable)
  0139   — (if applicable)
  0140   — curator gate resolution / sankhya_witness_as_friend growth-only
  0141   — stillness mantra fix (removes shivoham from stillness pool)
  0142   — Nīti Phase 1 pooling (50 rows → clarity, 8 rows → growth)
  0143   — fix stillness mantra surface eligibility

P1-specific:
  0144   — pool format migration: all active pool rotation_refs bare strings → dicts
             carrying life_context_bias. Enables Rule 5.
             [DO NOT APPLY before 0135b models.py patch + 0136 are live]
             [Must dev-smoke 12/12 rooms before prod apply]

If D-01–D-08 are confirmed present in 0132 output:
  0145   — (to be written) removes 8 wrong-register sankalps from room_growth sankalp rotation_refs
```

**Non-migration prerequisites before any prod flip:**
1. `models.py` Python `WisdomPrinciple` class: add `life_context_bias = ArrayField(...)` matching 0135b schema.
2. MITRA_ROOM_SACRED_KEY provisioned in prod environment.
3. FE: pass `life_context` parameter in room render API requests.
4. Dev 12/12 smoke (resolve pre-existing 1/12 vs 12/12 conflict first).
5. Audit 0132 migration output for D-01–D-08 (before writing 0145 or declaring clean).
6. Content: rewrite C-PD-2 (guru breath) per integrity review recommendation.
7. Content: verify S-3 Tukaram and S-5 Nāmdeva source citations before writing P1-B ingestion migration.

**P1-B and P1-C content ingestion migrations** (new migrations to be written after above gates pass):
- One migration ingesting 14 Gauḍīya/Ālvār/Sant WisdomPrinciple rows (P1-B).
- One migration ingesting 9 connection practice/banner rows + 14 Nīti Phase 2 pool refs + 18 growth bias tag patches (P1-C). Alternatively these can be split if content gates clear at different times.
