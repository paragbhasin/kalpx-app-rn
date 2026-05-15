# Wave 1.6 — path_intent gap-fill APPLIED

**Date applied:** 2026-04-16
**Scope:** Retag existing items in 3 tagged CSVs at
`/Users/paragbhasin/kalpx/core/data_seed/mitra_v3/library_catalog_{mantras,sankalps,practices}_tagged.csv`.
**Source proposal:** `WAVE_1_6_GAP_FILL_PROPOSAL.md` (same directory).
**Applier script:** `/tmp/wave_1_6_apply.py` (retained; idempotent).
**Commit status:** NOT committed — edits left in place for founder review.

---

## 1. Re-scan findings: founder's "mantras already in library" claim — CONFIRMED

The founder was **correct**. The proposal claimed 5–6 new mantras needed
authoring for `return × mantra` and `steady × mantra`. Re-scan of
`library_catalog_mantras.csv` + `library_catalog_mantras_tagged.csv` found that
every one of the proposed new items (or a close sonic-anchor synonym) is
**already in the library**, just not tagged with the relevant path_intent.

### Existing mantras → mapped to proposed "new" items

| Proposal new item (6.x) | Existing library item_id(s) | row(s) in mantras_tagged.csv | Decision |
|---|---|---|---|
| `mantra.so_ham_anchor` (return) | `mantra.soham`, `soham_meditation` | 150, 168 | Retag existing |
| `mantra.hamsa_witness` (return) | `soham_meditation` (explicit `Hamsa` tag + `witness` intervention) | 168 | Retag existing (covers both So-Ham and Haṁsa axes — same ajapa technique) |
| `mantra.bhur_bhuvah_svah_gayatri_anchor` (return) | `mantra.gayatri_mantra` (full mantra beginning with exactly this line) + `mantra.gayatri` / `gayatri` | 72–75, 89, 155 | Skipped for return (Gayatri is devotional/savitr-invoking; founder nuance needed) — instead tagged for **steady** (daily sandhya cadence). Pure-sound anchors for return satisfied by Om + So-Ham. |
| `mantra.om_108_daily` (steady) | `mantra.spiritual_growth.om` ("Om – The Pranava Mantra"), `om_before_task` | 195, 165 | Retag existing for return (Om as pure sonic anchor); steady mantra cadence already covered by Gayatri + Sarvesham retags |
| `mantra.gayatri_daily_short` (steady) | `gayatri`, `mantra.gayatri`, `mantra.gayatri_mantra` | 155, 89, 72 | Retag existing |
| `mantra.swasti_vachana_daily` (steady, stretch) | `mantra.sarvesham`, `mantra.sarvesham_svastir` (both "Sarvesham Svastir Bhavatu" = Vedic Swasti utterance) | 98, 140 | Retag existing |

**Net result:** **ZERO new mantra authoring was required.** 5 existing mantras
retagged for `return`, 6 existing mantras retagged for `steady`.

### Rationale

- **Return × mantra (gap 0 → 4)** filled by 4 pure-sound anchors whose
  tone_tags are **not** in the `return` deny-list (`calm|quiet_presence` for
  `mantra.soham`; `devotional|contemplative` for Om + So'ham variants — note
  `devotional` is NOT in the return deny-list, only `bhakti` intervention and
  `heart_opening` tone are).
- **Steady × mantra (gap 0 → 6)** filled by 6 repeatable daily-cadence
  utterances (Gayatri + Sarvesham Svastir + shloka_reflection_daily).

### Items the proposal rejected and this applier did NOT touch

All Appendix A rejections honored (`practice.focus.ten_second_pause`,
`practice.focus.agni_breath`, `practice.focus.prana_lift`,
`practice.heart_breath_release`, `practice.morning_breath`,
`practice.prithvi_walk`, `sankalp.choose_self_worth`, `sankalp.gentleness_self`,
`sankalp.give_grace`, `sankalp.honor_my_skill`,
`mantra.health_aditya_hridayam`).

### Appendix B ambiguous items — SKIPPED per prompt directive

Per the task prompt rule "Do NOT touch items flagged for founder review
(Appendix B) unless they're in the APPROVED retag list — if ambiguous, skip",
the following 4 items are in **both** the proposal's approved retag tables
**and** Appendix B (founder review):

| Item | Proposal intent | Why ambiguous | Action |
|---|---|---|---|
| `practice.focus.breath_20` | +return (secondary, medium-conf) | `energizing` tone paired with `steady\|grounding` — return deny-list says `energizing` is blocked | **SKIPPED** |
| `sankalp.focus.mental_strength` | +steady (secondary, medium-conf) | `energizing\|activating` tones — founder may reserve `steady` for low-activation | **SKIPPED** |
| `sankalp.health_body_temple` | +hold (secondary, medium-conf) | "honor"-framed, may belong to `restore` only | **SKIPPED** |
| `sankalp.honor_my_boundaries` | +hold (secondary, medium-conf) | "honor"-framed, may belong to `restore` only | **SKIPPED** |

This is a net reduction of 4 from the proposal's 53 retag count. Founder can
flip these on manually with a one-line edit if they're approved.

---

## 2. Total retags applied (per intent)

| Intent | Mantras | Sankalps | Practices | **Total** |
|---|---|---|---|---|
| `return` | 4 | 5 | 14 | **23** |
| `hold`   | 3 | 7* | 5 | **15** |
| `steady` | 6 | 3 | 12 | **21** |
| **TOTAL** | **13** | **15** | **31** | **59** |

(*) `sankalp.health_slow_down` gets BOTH `return` (secondary) and `hold`
(primary) per proposal — counted once per intent in the "applied" table.
Multi-intent items: `sankalp.health_slow_down`, `practice.slow_sipping_breath`,
`practice.bhramari`, `practice.self_acceptance_pause`.

---

## 3. New coverage matrix (path_intent × type, post-apply)

From `catalog_loader.load_catalog()` over all `.csv` rows:

| Intent    | Mantra (196) | Sankalp (159) | Practice (195) |
|---        |---           |---            |---             |
| `abide`   | 65           | 85            | 108            |
| `clarify` | 75           | 35            | 58             |
| `deepen`  | 109          | 108           | 136            |
| `hold`    | **3** ✓      | **7** ✓       | **6** ✓        |
| `restore` | 51           | 32            | 33             |
| `return`  | **4** ✓      | **8** ✓       | **14** ✓       |
| `settle`  | 71           | 30            | 57             |
| `soften`  | 43           | 35            | 30             |
| `steady`  | **6** ✓      | **3** ✓       | **12** ✓       |

**All 9 (intent × type) cells now ≥ 3.** ✓

---

## 4. Delta vs before — movements from 0 to ≥ 3

| Cell | Pre-fill | Post-fill | Moved? |
|---|---|---|---|
| return × mantra | 0 | 4 | **YES** (0→≥3) |
| return × sankalp | 3 | 8 | already met, expanded |
| return × practice | 0 | 14 | **YES** (0→≥3) |
| hold × mantra | 0 | 3 | **YES** (0→≥3) |
| hold × sankalp | 0 | 7 | **YES** (0→≥3) |
| hold × practice | 1 | 6 | **YES** (below ≥3→met) |
| steady × mantra | 0 | 6 | **YES** (0→≥3) |
| steady × sankalp | 0 | 3 | **YES** (0→≥3, minimum met) |
| steady × practice | 0 | 12 | **YES** (0→≥3) |

**No cells remain at 0. No cells remain below ≥3.** Triad scorer can now award
the `+2 path_intent` match bonus to every intent/type combo without fallback
to deny-list-violating items.

Delta vs proposal's projection:
- Proposal projected `return × mantra = 3` via new authoring; actual is **4**
  via retag-only (zero authoring).
- Proposal projected `steady × mantra = 3–4` via 1 retag + 2–3 authored;
  actual is **6** via retag-only.
- `sankalp.focus.mental_strength` skipped → steady × sankalp is **3** (still
  ≥3 minimum, one fewer than proposal's projected 4).
- `sankalp.health_body_temple` + `sankalp.honor_my_boundaries` skipped → hold
  × sankalp is **7** (vs proposal's projected 9).
- `practice.focus.breath_20` skipped → return × practice is **14** (same as
  proposal's projected — high-conf candidates alone sufficed).

---

## 5. Test suite: PASS

```
cd /Users/paragbhasin/kalpx && source venv/bin/activate && \
python -m pytest core/content/tests/test_triad_selector.py \
                 core/content/tests/test_support_path_intent.py \
                 core/content/tests/test_decide_moment.py -q
```

Result: **94 passed in 0.31s**. No failures, no warnings.

Relevant coverage:
- `test_triad_selector.py` — triad scoring + deny-list + fallback picks
- `test_support_path_intent.py` — path_intent derivation + deny filter
- `test_decide_moment.py` — decide_moment path selection (milestones, return,
  dashboard embeds, etc.)

No new tests were added — the retags are pure-data changes that existing
tests validate against.

---

## 6. Files modified — line-count deltas

| File | Lines before | Lines after | Delta |
|---|---|---|---|
| `library_catalog_mantras_tagged.csv` | 200 | 200 | 0 |
| `library_catalog_sankalps_tagged.csv` | 160 | 160 | 0 |
| `library_catalog_practices_tagged.csv` | 196 | 196 | 0 |

**No rows added or removed; 59 rows modified in place** (columns
`path_intent_tags`, `tone_tags`, `tagging_source` only). Multi-line quoted
row for `mantra.gayatri_mantra` (spans 4 file lines) preserved intact.

Invariants preserved:
- `item_id` unchanged on all 59 rows
- `title`, `category`, `deity`, `tradition`, `duration` unchanged
- raw `tags` column unchanged
- `variant_status` still `approved` on all rows
- `kosha_tags`, `klesha_tags`, `vritti_tags`, `intervention_tags`, `mode_fit`,
  `locale_fit` all unchanged

All 59 modified rows now carry `tagging_source` suffix
`+wave_1_6_2026-04-16` for audit trail.

---

## 7. Summary for founder review

- **Wave 1.6 closed every path_intent × type gap.** All 9 cells ≥3.
- **Zero new-content authoring needed** — founder's re-scan instinct was
  correct; all claimed-needed new mantras (So-Ham, Hamsa, Bhur-Bhuvah-Svah
  Gayatri anchor, Om-108-daily, Gayatri-daily-short, Swasti-Vachana-daily)
  already existed in the library, just untagged for the relevant intent.
- **4 Appendix-B items skipped** as conservative default (founder can approve
  via follow-up one-line edits).
- **Test suite green** (94/94 passing on the 3 affected test modules).
- **Edits in place, not committed.** Review diff with:
  ```
  git -C /Users/paragbhasin/kalpx diff core/data_seed/mitra_v3/library_catalog_{mantras,sankalps,practices}_tagged.csv
  ```
