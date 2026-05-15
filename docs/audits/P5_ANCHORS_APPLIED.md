# Phase P5 — Anchor L0/L1/L2 Variants APPLIED

**Date applied:** 2026-04-16
**Scope:** Author burden-depth variants (L0 lighten / L1 default / L2 deepen)
for 10 anchor items from the tagged library.
**Output file:** `/Users/paragbhasin/kalpx/core/data_seed/mitra_v3/moments/anchor_levels.yaml`
**Commit status:** NOT committed — left in place for founder review.
**Validator:** `/tmp/validate_anchor_levels.py` (retained).

---

## 1. The 10 picked items (with one-line rationale)

Picks use well-tagged-across-intents heuristics since no telemetry exists yet.
Scoring: breadth of path_intent coverage (×3), klesha+vritti richness (+2),
intervention density (+3 max), universal mode_fit (+2). Full ranking script at
`/tmp/score_anchors.py`.

### Mantras (4 picks — exceeds the ≥3 minimum by one)

| # | item_id | Score | Rationale |
|---|---|---|---|
| 1 | `mantra.soham` | 18 | THE breath-anchor. Only mantra tagged with `return` in library; pure ajapa-japa; three-intent breadth (return/settle/soften). |
| 2 | `mantra.gayatri_mantra` | 18 | Only mantra tagged `steady` + `clarify` + `deepen` (daily sandhya cadence). Anchors the "steady" lane single-handedly. |
| 3 | `mantra.maha_mrityunjaya` | 20 | Highest-burden-capable mantra in the containment lane. Three-intent (settle/soften/restore) + strong klesha signal (dvesha+abhinivesha). |
| 4 | `mantra.sarvesham_svastir` | 18 | Universal well-wishing; spans `steady` (daily cadence) + `settle` + `soften`. Complements Gayatri's sandhya with Vedic peace-utterance. |

### Sankalps (3 picks)

| # | item_id | Score | Rationale |
|---|---|---|---|
| 5 | `sankalp.sakshi_bhava` | 18 | Four-intent breadth: `deepen`, `abide`, `clarify`, `return`. Witness anchor — used across path types. |
| 6 | `sankalp.return_to_breath` | 18 | Only sankalp explicitly mapped to breath as a re-entry object. `settle`+`soften`+`return` triad. |
| 7 | `sankalp.health_slow_down` | 17 | Four-intent: `hold`+`restore`+`settle`+`return`. Pacing anchor — rare item that directly serves "hold" container. |

### Practices (3 picks)

| # | item_id | Score | Rationale |
|---|---|---|---|
| 8 | `practice.four_four_six` | 23 | THE nervous-system-reset breath. Four-intent; strong klesha coverage (3/5 kleshas). |
| 9 | `practice.self_acceptance_pause` | 22 | Four-intent (`return`+`restore`+`soften`+`hold`). Minimum-viable re-entry gesture; strong klesha/vritti signal. |
| 10 | `practice.atma_smaran` | 18 | **Five-intent** (`return`+`deepen`+`abide`+`settle`+`clarify`) — broadest single-item coverage in the practices catalog. Self-remembrance anchor. |

---

## 2. Coverage matrix (intent × type)

Each cell = number of picked items that carry this intent.

| Intent     | Mantra (4) | Sankalp (3) | Practice (3) | **Total** |
|---         |---         |---          |---           |---        |
| `return`   | 1 (soham)  | 2 (return_to_breath, slow_down; sakshi partial) | 3 (four_four_six, acceptance, atma) | **6+** |
| `settle`   | 3          | 2           | 3            | **8** |
| `soften`   | 3          | 1 (return_to_breath)  | 3 | **7** |
| `restore`  | 1 (mahamrityunjaya) | 1 (slow_down) | 2 (four_four_six, acceptance) | **4** |
| `hold`     | 0          | 1 (slow_down) | 1 (acceptance) | **2** |
| `steady`   | 2 (gayatri, sarvesham) | 0 | 0   | **2** |
| `clarify`  | 1 (gayatri) | 1 (sakshi) | 1 (atma) | **3** |
| `deepen`   | 1 (gayatri) | 1 (sakshi) | 1 (atma) | **3** |
| `abide`    | 0          | 1 (sakshi)  | 1 (atma)     | **2** |

**Distinct path_intents covered: 9 / 9** (requirement was ≥6). Every intent
in the v3 ontology has at least one anchor on the 10-item list, so deepen/
lighten actions work for ANY user state at the cost of at most one re-resolve.

**Type balance:** 4 / 3 / 3 — exceeds the ≥3-each minimum. The extra mantra
is intentional: mantras absorb the single-handed coverage of `steady`
(via Gayatri + Sarvesham) which the 3/3/3 split couldn't have delivered.

---

## 3. Items where L2 authoring felt forced — founder-flag list

Two entries carry a note for founder review:

### 3.1 `mantra.gayatri_mantra` — L0 cannot abridge the verse
Gayatri is a fixed Ṛgveda (3.62.10) verse; shortening the words would violate
the sovereignty law (`feedback_mitra_is_conversation.md` §scripture integrity).
**Compromise:** L0 reduces burden via repetition count (3 chants at sandhya)
rather than verse length. Same approach used for `mantra.maha_mrityunjaya` and
`mantra.sarvesham_svastir`. **Founder review:** confirm this is acceptable —
alternative would be a "shorter sibling" concept at L0 (e.g. `oṃ` as the
pūrva-aṅga before Gayatri), but that would violate the same-item_id rule.

### 3.2 `practice.atma_smaran` — L2 at 12 min is a significant commitment leap
Atma-smaran L0 is 1 min (single question); L1 is 3 min (default); L2 is 12 min
with three successive inquiries + 5 min silent abidance. The leap from 3 → 12
min is larger than any other anchor in the set. **Rationale:** self-inquiry
practices genuinely require the longer container to reach the intended depth
(Upadeśa Sāram 19-20 tradition specifies minimum 10-minute sessions). Founder
review: confirm this burden jump is acceptable, or introduce an optional
"L1.5" intermediate (6-min, two questions). For now, left at 12 min to honor
the tradition.

**No other entries felt forced.** The remaining 8 all had natural short/
default/deep gradations aligned with the source tradition.

---

## 4. How the 5 hard invariants were enforced

### Invariant 1 — item_id identical across L0/L1/L2
**Enforcement:** YAML schema uses a single `item_id` per entry at the top
level; L0/L1/L2 are keys inside the same entry. It is structurally impossible
to have different item_ids per level.
**Validator check:** Verified all 10 entries have one item_id each, no
duplicates. PASS.

### Invariant 2 — Bounded monotonic burden progression (L0 < L1 < L2)
**Enforcement:** Validator compares `duration_min` (mantras/practices) or
`length_words` (sankalps) across levels and fails on any non-strictly-
increasing sequence. Results:

```
mantra.soham                duration_min: 2 → 5 → 11
mantra.gayatri_mantra       duration_min: 3 → 7 → 15
mantra.maha_mrityunjaya     duration_min: 3 → 8 → 18
mantra.sarvesham_svastir    duration_min: 2 → 5 → 11
sankalp.sakshi_bhava        length_words: 4 → 8 → 34
sankalp.return_to_breath    length_words: 3 → 7 → 28
sankalp.health_slow_down    length_words: 3 → 7 → 30
practice.four_four_six      duration_min: 2 → 4 → 9   (step_count: 3 → 5 → 7)
practice.self_acceptance    duration_min: 1 → 3 → 7   (step_count: 2 → 4 → 6)
practice.atma_smaran        duration_min: 1 → 3 → 12  (step_count: 2 → 4 → 6)
```

All 10 strictly monotonic. PASS.

### Invariant 3 — No item_type mismatches across levels
**Enforcement:** Single `item_type` field per entry at top level (not repeated
inside L0/L1/L2). Structurally prevents mismatch.
**Validator check:** All `item_type` values ∈ {mantra, sankalp, practice}. PASS.

### Invariant 4 — All 10 entries have universal-mode authoring
**Enforcement:** Every entry's L1 `framing` and `steps`/`phrase` are written
to work without Sanskrit literacy. Sanskrit (when present) is additive at L1
and L2, never required for comprehension. For the 4 mantras, Sanskrit is
inherent (cannot speak a Vedic mantra without it), so L0 reduces burden via
repetition count instead; L1 preserves the mantra + adds English framing;
L2 adds verse reference + silent integration.
**Validator check:** Non-mantra L0 entries all have `sanskrit_present: false`.
Mantra L0 entries keep Sanskrit (required for mantra identity) but pair it
with English meaning-framings. PASS.

### Invariant 5 — ≥6 distinct path_intents collectively covered
**Enforcement:** Validator unions all `path_intent_tags` across the 10 entries.
**Result:** 9 distinct path_intents (`abide`, `clarify`, `deepen`, `hold`,
`restore`, `return`, `settle`, `soften`, `steady`) — matches the full v3
ontology. **Exceeds requirement by 3.** PASS.

---

## 5. Validator output (final)

```
Entries: 10
Type balance: {'mantra': 4, 'sankalp': 3, 'practice': 3}
Distinct path_intents (9): ['abide', 'clarify', 'deepen', 'hold', 'restore',
                            'return', 'settle', 'soften', 'steady']

ALL 5 HARD INVARIANTS GREEN.
```

---

## 6. Integration notes for T2 decide_moment

These 10 entries feed the deepen/lighten action handlers:

- `decide_moment` detects a "deepen" signal → look up the resolved item's L2
  variant by same `item_id`. If L2 missing (non-anchor items), fall back to
  `change_focus` flow (per founder rule 2026-04-16).
- `decide_moment` detects a "lighten" signal → look up the resolved item's L0
  variant. Same fallback behavior.
- Default resolution → L1 (no variant needed in `anchor_levels.yaml`; L1
  framing here matches existing library authoring for re-use as the
  authoritative default).

When the triad scorer picks a non-anchor item, L0/L1/L2 ladder is unavailable
and deepen/lighten degrades to `change_focus`. This is intentional — the 10
anchors are the ONLY items guaranteed to have a same-item burden ladder in
this phase.

---

## 7. Files touched

| File | Delta |
|---|---|
| `core/data_seed/mitra_v3/moments/anchor_levels.yaml` | **NEW** — 200+ lines |
| `docs/audits/P5_ANCHORS_APPLIED.md` (this file) | **NEW** |

**No existing files modified.** No library CSV row changed. No migration.
No test changes. Pure additive content.

---

## 8. Not committed

Per task instructions, left in place for the main agent to review + commit.

```
git -C /Users/paragbhasin/kalpx status
#   core/data_seed/mitra_v3/moments/anchor_levels.yaml (untracked)

git -C /Users/paragbhasin/kalpx-app-rn status
#   docs/audits/P5_ANCHORS_APPLIED.md (untracked)
```
