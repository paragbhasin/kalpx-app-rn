# Catalog Tagging Rollout — Library Items for v3 Triad Selector

**Status:** ACTIVE ROLLOUT (2026-04-14).
**Scope:** 556 English items across mantras (200), sankalps (160),
practices (196). Non-English locales inherit tag structure via
translation — tags authored in EN are copied to translated rows.

## Why this matters

The v3 triad selector (`core/content/triad/triad_selector.py`) scores
each library item against an 8-column signal bundle
(primary_kosha, secondary_kosha, top_klesha, top_vritti,
intervention_bias, path_intent, mode, duration). **Until every item
carries proper tags, the selector falls through to item_id-alphabetical
tiebreaks** — meaningful discrimination requires this rollout.

Today each catalog CSV row has:
```
item_id, title, category, [deity], [tradition], [duration], tags
```
where `tags` is a loose pipe-separated keyword string
(e.g. `harmony|abundance|Bhuvaneshwari`). The `category` column maps
roughly to scan_focus, not to any panchakosha signal.

## Target schema

Each library item gets these additional columns (CSV) / YAML keys:

```yaml
kosha_tags:        [annamaya, pranamaya, manomaya, vijnanamaya, anandamaya]
klesha_tags:       [avidya, asmita, raga, dvesha, abhinivesha]
vritti_tags:       [replaying, worrying_ahead, comparing, arguing_inside, blanking,
                    smriti, vikalpa, viparyaya, tamas, nidra]
intervention_tags: [breath, sound, slowing, body, rhythm, touch, walking,
                    witness, naming, discernment, bhakti, ishvara_pranidhana,
                    one_step_action, gratitude, offering, simple_practice,
                    pattern_interruption, containment, slowing, ...]
path_intent_tags:  [settle, clarify, restore, hold, soften, deepen,
                    abide, return, steady]
tone_tags:         [calm, steady, gentle, sovereign, quiet_presence,
                    honoring, devotional, grounding, contemplative,
                    energizing, activating, ...]  # used by coherence check
mode_fit:          [universal, hybrid, rooted]
locale_fit:        [en, hi, sa, ...]
```

Every list is **additive** — an item may carry multiple tags per
column. Empty lists are allowed but reduce the item's match
opportunities.

## Tagging principles

1. **Minimum 1 kosha tag** — the primary layer the item addresses.
2. **Klesha tag only when explicit** — don't force a klesha tag if
   the item is kosha-centric without root-affliction address.
3. **Path_intent tag is load-bearing** — this is the movement-goal
   tag. If unsure, pick the single most honest one; Mitra's selector
   weights it at +2. Default to `steady` only when no other intent
   clearly fits.
4. **Tone_tags protect coherence** — accurate tone tags let the
   coherence check catch contradictory picks. An energizing mantra
   must be tagged `energizing` so a `restore` context won't pick it.
5. **mode_fit is opt-in for specialization** — `[universal]` alone
   reaches all users. Add `hybrid` only if the item uses Sanskrit
   intentionally; `rooted` only if the item is verse-grounded.
6. **locale_fit follows translation, not authorship** — an item
   translated to Hindi inherits every EN tag unchanged. Tags are
   language-independent signals.

## Rollout waves

### Wave 1 — Auto-inference (DRAFT status)
Script reads each CSV row's `title` + `category` + loose `tags` and
proposes first-pass `kosha_tags`, `intervention_tags`, `path_intent_tags`,
`tone_tags`, `mode_fit`, `locale_fit`. Output is written to
`library_catalog_*_tagged.csv` alongside the original CSV.

All variants land with variant status ``draft`` — NOT served to
users until founder review. Each row carries a `tagging_source:
auto_v1` field for audit.

**Expected yield:** ~70% of items get at least one meaningful tag
from existing signals; the remaining ~30% default to `[steady]`
path_intent + empty kosha (manual review required).

### Wave 2 — Drafter + auditor review (per §0.1 of algorithm spec)

For every auto-tagged item with weak signals:
1. **Drafter agent** produces a refinement PR with:
   - Proposed tag additions / corrections
   - Rationale referencing CONTENT-STANDARDS.md §0–§10
2. **Auditor agent** verifies:
   - No banned tone tokens (grief-bypass, celebration-at-heavy)
   - `kosha_tags` at least one
   - `path_intent_tags` specific (not default `steady`)
   - Mode/locale constraints consistent
3. **CI validators** must pass before founder review:
   - `quality_validator` (tag schema, tag length, banned tokens)
   - `coverage_validator` (each item has ≥1 kosha tag)
   - `chip_id_stability` (item_ids frozen)
   - `triad_authority_check`
4. **Founder sign-off** — variant flips from `draft` → `approved`.
   No agent alone promotes per Content Contract §3.

### Wave 3 — Coverage audit
After Waves 1+2, run a coverage report:
- Every path_intent value (9 total) has ≥ 3 items per type
  (mantra / sankalp / practice) — so each intent has real picks.
- Every primary_kosha (5 total) × (mantra/sankalp/practice) has
  ≥ 5 items — so the scorer has candidates even under strict filter.
- No path_intent has zero `rooted`-tagged items (so rooted mode
  doesn't always downgrade to universal for that intent).

Gaps become content-authoring tickets; no new items ship without
full tag coverage.

## Auto-inference rules (for Wave 1)

The auto-tagger derives Wave 1 drafts by reading these signals:

### From `category`
```
scan_focus (CSV category)   →   kosha hint
────────────────────────────────────────
innerpeace, innerbliss      →   manomaya, pranamaya
healing, healthwellness     →   annamaya, pranamaya
clarity, wisdom             →   vijnanamaya
relationship, connection    →   manomaya, anandamaya
careerprosperity            →   vijnanamaya, manomaya
devotion                    →   anandamaya
protection                  →   vijnanamaya
```

### From `title` keyword match
```
"breath", "pranayama"       →   kosha += pranamaya
                                intervention += breath
"mantra", "chant", "japa"   →   intervention += sound
"walk"                      →   intervention += walking, body
"sit", "meditation"         →   kosha += manomaya
                                intervention += stillness
"surrender", "offer"        →   path_intent += abide
                                intervention += ishvara_pranidhana, offering
"witness", "observe"        →   intervention += witness, naming
"gratitude"                 →   path_intent += abide
                                intervention += gratitude, offering
"courage", "strength"       →   kosha += pranamaya, annamaya
                                tone += generative
"still", "quiet"            →   path_intent += settle
                                tone += quiet_presence
"act", "step", "do"         →   intervention += one_step_action
"soften", "release"         →   path_intent += soften
                                intervention += pattern_interruption
"journal", "reflect"        →   path_intent += clarify
                                intervention += inquiry
```

### From existing `tags` column
Already implemented in `core/content/triad/catalog_loader.py::_extract_loose_tags()`.
Wave 1 ingests those mappings unchanged.

### Default fallbacks (if no signal fires)
```
kosha_tags:        [manomaya]  (most-common support target)
path_intent_tags:  [steady]    (safe default)
tone_tags:         [calm]
mode_fit:          [universal]
locale_fit:        [en]
```

## Locale handling

Per founder direction 2026-04-14:
> "English for now and copy that to other locales — everything will
> be translated."

Process:
1. EN catalog rows are the tagging source of truth.
2. When an item is translated to another locale (hi, sa), the
   translated row **inherits every EN tag unchanged** — `kosha_tags`,
   `klesha_tags`, `vritti_tags`, `intervention_tags`,
   `path_intent_tags`, `tone_tags`, `mode_fit` all copy verbatim.
3. Only `item_id` adds a locale suffix (e.g.
   `mantra.om_namah_shivaya` → `mantra.om_namah_shivaya__hi`) and
   `locale_fit` changes to the new locale.
4. Translations that drift tonally from EN (e.g. a softer
   translation of an energizing mantra) MUST update `tone_tags`
   explicitly — tone is content, not shared inheritance.

## Invariants (hard — must hold across all waves)

1. **Every served variant has ≥1 kosha tag.** Coverage validator
   rejects items with empty `kosha_tags` at approved status.
2. **No auto-tagged item ships at `approved`.** Auto-inference
   produces `draft` only. Promotion requires founder review.
3. **Tiebreak remains deterministic.** item_id alphabetical. Never
   by serve_count. Never by freshness. This keeps triads reproducible
   for the same inputs.
4. **Translation never changes tags except tone.** A Hindi translation
   shares every structural tag with its EN source. If tone drifts,
   re-tag explicitly and re-review.

## CI gates

Before a tagged variant can move from `draft` → `approved`:
- `coverage_validator` passes (kosha + path_intent present)
- `quality_validator` passes (banned tokens absent, tag length OK)
- `content_sovereignty_check` passes (no TSX strings introduced)
- `triad_authority_check` passes (no mutable triad references)
- `chip_id_stability` passes (item_ids untouched)

Failure of any gate blocks the ingest; drafter agent re-draws.

## Timeline

- **Wave 1 auto-inference:** 1 day (scripted)
- **Wave 2 drafter + auditor review:** 3–5 days per 100 items;
  can parallelize across agents
- **Wave 3 coverage audit + gap-fill authoring:** 2–3 days of
  content work

End-state: 556+ approved items, every one with a full signal bundle,
driving meaningful selector discrimination. Phase T1 triad selector
truly replaces legacy v2.

## Ownership

- **Drafter agents:** author refinement PRs
- **Auditor agents:** verify against content standards
- **Content eng (human):** run auto-inference script, manage rollout
  waves, trigger CI
- **Founder:** final promotion sign-off, locks tunable constants if
  rollout surfaces miscalibrations

## Related docs

- `ALGORITHMS_TRIAD_AND_REASONING_V1.md` — locked selector spec
- `CONTENT_CONTRACT_V1.md` — variant lifecycle rules
- `CONTENT-STANDARDS.md` (in `kalpx/core/data_seed/mitra_v3/`) —
  content-author voice & tone rules
