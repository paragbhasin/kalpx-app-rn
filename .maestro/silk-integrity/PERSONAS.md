# Silk Integrity — Personas

Authoritative, seeded persona set for Silk / Metro integrity runs. Every
persona below is seeded by one idempotent management command — no
ambiguous half-broken fixtures in the test loop.

> Canonical seed command (dev only):
> ```
> python manage.py seed_canonical_persona_set --recreate --also-repair-legacy
> ```
> Source: `kalpx/core/management/commands/seed_canonical_persona_set.py`

All canonical personas share the dev-only password
`smoke-dev-only-do-not-use-in-prod`. Real creds live in 1Password vault
`kalpx-dev-personas`. **Never reuse this password outside dev.**

All canonical personas pull their `cycle_*_id` values LIVE from
`MasterMantra` / `MasterSankalp` / `MasterPractice` at seed time, so
schema re-prefixing can never silently break them again. Current live
triad (dev, 2026-04-18):

- mantra: `mantra.soham`
- sankalp: `sankalp.permission_to_rest`
- practice: `practice.mindful_55_walking`

## Canonical personas (LIVE on dev — VALID)

| Persona | Purpose | Day | `cycle_mantra_id` | `cycle_sankalp_id` | `cycle_practice_id` | Master rows? | Flows |
|---|---|---|---|---|---|---|---|
| `smoke+triad@kalpx.com` | Base canonical / triad smoke | 3/14 | `mantra.soham` | `sankalp.permission_to_rest` | `practice.mindful_55_walking` | yes | 01-09, 16-23, 27, 30, 31 |
| `persona_day7@kalpx.com` | Day-7 checkpoint firing | 7/14 | `mantra.soham` | `sankalp.permission_to_rest` | `practice.mindful_55_walking` | yes | 14, 29 |
| `persona_day14@kalpx.com` | Day-14 checkpoint firing | 14/14 | `mantra.soham` | `sankalp.permission_to_rest` | `practice.mindful_55_walking` | yes | 15 |
| `persona_welcomeback@kalpx.com` | Long-absence / continuity surface (`end_date_local` 35d ago) | 14/14 | `mantra.soham` | `sankalp.permission_to_rest` | `practice.mindful_55_walking` | yes | 28 |
| `persona_additional_library@kalpx.com` | Additional x library completion | 3/14 | `mantra.soham` | `sankalp.permission_to_rest` | `practice.mindful_55_walking` | yes | 24 |
| `persona_additional_custom@kalpx.com` | Additional x custom (Shraddha Vessel) completion | 3/14 | `mantra.soham` | `sankalp.permission_to_rest` | `practice.mindful_55_walking` | yes | 25 |
| `persona_additional_recommended@kalpx.com` | Additional x recommended completion | 3/14 | `mantra.soham` | `sankalp.permission_to_rest` | `practice.mindful_55_walking` | yes | 26 |

Probe (2026-04-18, direct view dispatch on dev container): all 7 return
HTTP 200 with populated `companion.{mantra,sankalp,practice}.ui.card_title`
(`'Soham'` / `'Today, I give myself permission to rest.'` / `'Mindful 5-5 Walking'`).

### Schema-workaround notes

- **`persona_welcomeback`** — `Journey` has no `last_activity_at` field.
  Long-absence is detected via `days_past_end >= 30` (see
  `core/mitra_views.py:4838`). The seed shifts `start_date_local` back by
  `total_days + 35` days and sets `end_date_local` accordingly.
- **`persona_additional_recommended`** — `JourneyAdditionalItem.source`
  schema only accepts `additional_library` / `additional_custom`. The
  recommended-additional surface is served by
  `/api/mitra/journey/recommended-additional/` (live suggestion), and the
  `additional_recommended` token only appears on `JourneyActivity.source`
  at completion time. The seed inserts a `JourneyAdditionalItem` with
  `source=additional_library` plus `custom_meta.seeded_as='recommended'`
  so downstream logic that inspects `custom_meta` can distinguish it.

## Legacy personas (REPAIRED — back-compat only)

These predate the canonical set but are still referenced by older tests
and docs. `seed_canonical_persona_set --also-repair-legacy` rebinds their
`cycle_*_id` columns in place (no user delete) to match the live Master
schema.

| Persona | Status | Day | Password | Notes |
|---|---|---|---|---|
| `test+day3@kalpx.com` | REPAIRED | 3/14 | `Test1234!` | Original seed: `seed_test_journey.py` |
| `test+day7@kalpx.com` | REPAIRED | 7/14 | `Test1234!` | Original seed: `seed_test_journey.py` |
| `test+day14@kalpx.com` | REPAIRED | 14/14 | `Test1234!` | Original seed: `seed_test_journey.py` |
| `test+welcomeback@kalpx.com` | REPAIRED | 14/14 + 35d | `Test1234!` | Original seed: `seed_test_journey.py` |

Probe (2026-04-18 post-repair): all 4 return HTTP 200 with populated
triad `card_title` slots (same copy as canonical).

**Deprecation plan:** once no tests/flows reference `test+day*` emails,
drop them from `seed_canonical_persona_set.LEGACY_PERSONAS` and delete.
DO NOT add new references to these emails — use canonical equivalents
(`persona_day7` / `persona_day14` / `persona_welcomeback`) instead.

## Operational notes

- **Flow-to-persona binding:** Each Silk flow header declares the persona
  it assumes. If a flow shows up as flaky / half-broken, check its
  declared persona first — seed drift is the #1 cause.
- **Re-seeding:** Safe to run `--recreate` whenever Silk starts flaking;
  it deletes and re-creates each canonical user + journey atomically.
- **Track 1 Joy/Growth chips:** Dashboard home payload for canonical
  personas renders both chips once the founder-locked `joy_label` /
  `growth_label` are live backend-side. Copy: "I'm in a good place"
  (joy) / "I want to go deeper" (growth).
- **Extending this set:** Add new specs to `CANONICAL_PERSONAS` in
  `seed_canonical_persona_set.py` plus a row here. Keep this table the
  single source of truth — do NOT document seeded personas anywhere else.
