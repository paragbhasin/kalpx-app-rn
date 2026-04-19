# Silk Integrity — Personas

Every flow declares which persona it assumes. Personas marked **SEED REQUIRED**
do not yet exist on dev and must be seeded before the flow can run green.

Seeding is backend-owned: use the Django management command referenced below
OR manually register + progress the journey through the admin + API.

## Canonical seeded persona (LIVE on dev)

| Email | Password | Journey | Day | Triad | Used by |
|---|---|---|---|---|---|
| `smoke+triad@kalpx.com` | `smoke-triad-dev-only` | 3637 | 3/14 | `mantra.soham` / `sankalp.permission_to_rest` / `practice.mindful_55_walking` | 05, 06, 07, 08, 09, 10, 11, 12, 13, 16, 17, 18, 19, 20, 21, 22, 23, 27, 30, 31 |

## Seed required personas

| Email | Purpose | Used by | State required |
|---|---|---|---|
| `persona_day7@kalpx.com` | Day-7 checkpoint firing | 14, 29 | Journey active, day 7 exactly; triad seeded; no day-7 checkpoint_decision yet |
| `persona_day14@kalpx.com` | Day-14 checkpoint firing | 15 | Journey active, day 14 exactly; triad seeded; no day-14 checkpoint_decision yet |
| `persona_welcomeback@kalpx.com` | Continuity / long-absence surface | 28 | Journey paused > 7d; last activity ≥ 8 days ago |
| `persona_additional_library@kalpx.com` | Additional × library completion | 24 | At least one library item saved as active Additional |
| `persona_additional_custom@kalpx.com` | Additional × custom completion | 25 | At least one custom-authored Additional item active |
| `persona_additional_recommended@kalpx.com` | Additional × recommended completion | 26 | At least one recommended Additional item surfaced + activated |

## Seed-command pointers

Backend mgmt commands (kalpx repo) to consider for seeding:

```
# Canonical smoke persona (already live):
python manage.py seed_smoke_persona --email smoke+triad@kalpx.com

# Day-7 / Day-14 personas (CREATE COMMAND NEEDED):
python manage.py seed_checkpoint_persona --day 7 --email persona_day7@kalpx.com
python manage.py seed_checkpoint_persona --day 14 --email persona_day14@kalpx.com

# Welcome-back (manual today):
#   1. Seed base persona
#   2. Set Journey.last_activity_at = now() - timedelta(days=10)

# Additional personas (manual today — Django admin):
#   1. Seed base persona
#   2. Create AdditionalItem rows with source ∈ {library|custom|recommended}
```

## Notes

- All seed-required personas default to `smoke-triad-dev-only` family passwords
  (document pattern — real dev passwords live in 1Password vault `kalpx-dev-personas`).
- Welcome-back flow 28 can alternatively be simulated by logging in as the smoke
  persona and fast-forwarding `Journey.last_activity_at` via Django shell.
- Track 1 joy/growth chips depend on backend-seeded `joy_label` + `growth_label`
  on the smoke persona's dashboard home payload. Founder-locked wording:
  "I'm in a good place" (joy) / "I want to go deeper" (growth).
