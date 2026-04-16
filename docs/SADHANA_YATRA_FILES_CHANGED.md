# Sadhana Yatra — Files Changed/Added Inventory

Verified line counts via `wc -l` against actual files on 2026-04-14. Bold counts in prose should match the `wc` output cited next to each file.

## Backend (kalpx repo, `mitra-v3-sadhana-yatra` branch, tip `3003bba2`)

### New files (verified present on branch tip)
- `core/data_seed/mitra_v3/onboarding_recognition_slots.yaml` — **2028 lines** (universal + hybrid + rooted slots across 3 modes)
- `core/data_seed/mitra_v3/onboarding_stage_flow.csv` — **374 rows** incl. header (4-stage chip tree)
- `core/data_seed/mitra_v3/moments_support_copy.yaml` — **91 lines** (6 moments x 3 modes)
- `core/reasoning/onboarding_inference.py` — **753 lines**
- `core/reasoning/ONBOARDING_INFERENCE_README.md`
- `core/migrations/0104_sadhana_yatra_context_decision_log.py`
- `core/migrations/0105_journey_context_inference_snapshot.py`
- `core/tests_onboarding_inference.py`
- `core/tests_onboarding_composer.py`
- `core/tests_sadhana_yatra.py`

### Modified files
- `core/reasoning/diagnostics.py` — added `compose_support_recognition_csv`, `compose_growth_recognition_csv`, helpers
- `core/content_loader.py` — added `get_onboarding_slots`
- `core/mitra_views.py` — added `onboarding_complete` view, v1.2.0 response shape
- `core/urls.py` — added `/api/mitra/onboarding/complete/` route
- `core/serializers.py` — added 7 new fields on `JourneyStartSerializer`
- `core/journey_views.py` — sadhana-yatra signal folding
- `core/models.py` — `JourneyContext` sadhana-yatra fields + `MitraDecisionLog`
- `core/data_seed/mitra_v3/guidance_mode_copy.yaml` — rooted `long_desc` softened
- `core/data_seed/mitra_v3/notification_templates.yaml` — `post_conflict_follow` title tweak
- `core/data_seed/mitra_v3/strategic_prep_templates.yaml` — `deepen_practice` rewrite
- `core/data_seed/mitra_v3/library_authoring_fixture.yaml` — 4x deepen rewrites
- `core/data_seed/mitra_v3/principles_yamas.yaml` — line 1949 better-place fix

### Test results on dev (latest verification)
- Targeted suite: **66/66 pass**
- Full core regression: **946 pass / 24 fail / 29 error** — 0 new regressions; all failures are pre-existing auth flakes

### Deploy steps
See `~/.claude/projects/-Users-paragbhasin/memory/mitra_v3_sadhana_yatra_deploy.md` (local memory, not in repo).

## Frontend scaffolds (kalpx-app-rn, `sadhana-yatra-onboarding` branch)

### New scaffold moments (22 total under `src/extensions/moments/`)

Tier 1 — Support surfaces:
- `grief_room/{index.tsx, README.md}`
- `loneliness_room/{index.tsx, README.md}`
- `why_this_l2/{index.tsx, README.md}`
- `why_this_l3/{index.tsx, README.md}`
- `voice_consent/{index.tsx, README.md}`
- `sound_bridge/{index.tsx, README.md}`

Tier 2 — Dashboard embeds:
- `day_type_chip/{index.tsx, README.md}`
- `focus_phrase_line/{index.tsx, README.md}`
- `continuity_mirror_card/{index.tsx, README.md}`
- `why_this_l1_chip/{index.tsx, README.md}`
- `path_milestone_banner/{index.tsx, README.md}`
- `predictive_alert_card/{index.tsx, README.md}`
- `entity_recognition_card/{index.tsx, README.md}`
- `gratitude_signal_card/{index.tsx, README.md}`
- `season_signal_card/{index.tsx, README.md}`
- `post_conflict_morning_card/{index.tsx, README.md}`

Tier 3 — Content refreshes (no `index.tsx` — content-pack only):
- `cycle_reflection_refresh/{contentpack.json, README.md}`
- `checkpoint_results_refresh/{contentpack.json, README.md}`

Tier 4 — v3 Dashboard shell:
- `new_dashboard/{index.tsx, README.md}`
- `personal_greeting_card/{index.tsx, README.md}`
- `completion_return/{index.tsx, README.md}` + `assets/mantra-lotus-3d.svg`

Tier 5 — New-ish:
- `voice_on_every_screen/{index.tsx, README.md}`

### Docs
- `docs/MOMENT_WIRE_UP_GUIDE.md` — scaffold wire-up bible (this branch added: Sadhana Yatra intro, API-per-turn map, v1.2.0 response shape)
- `docs/SADHANA_YATRA_FILES_CHANGED.md` — this file

### Modified legacy FE files
- Scaffold wiring for onboarding turns has been done against `allContainers.js` + `src/engine/BlockRenderer.tsx` + `src/engine/actionExecutor.ts` in upstream commits on this branch; see `git log sadhana-yatra-onboarding` for exact deltas. (Not duplicated here to avoid drift.)

### Test status
- TS clean: `npx tsc --noEmit -p .` passes for scaffold edits
- Banned-phrase scan: clean on all scaffold copy

## Memory files (~/.claude/projects/-Users-paragbhasin/memory/)

### New
- `mitra_architecture_sadhana_yatra.md` — 47-moment framework mapping
- `mitra_v3_sadhana_yatra_deploy.md` — deploy/test/rollback steps
- `mitra_onboarding_joy_inclusion.md` — joy-path design memo
- `mitra_deeplink_notifications.md` — deeplink-as-notification-nav

### Updated
- `MEMORY.md` — v3 index pointer updates

## Branches

| Branch | Repo | Tip | Status |
|---|---|---|---|
| `mitra-v3-sadhana-yatra` | kalpx | `3003bba2` | pushed; 66/66 targeted tests pass |
| `sadhana-yatra-onboarding` | kalpx-app-rn | (this branch) | scaffolds + docs updates |
| `pavani` | kalpx-app-rn | `61e8af3` | unchanged (Pavani's Apr 15 work) — NOT merged with sadhana-yatra-onboarding yet |
| `pavani-pre-rollback-b5d5cae` | kalpx-app-rn | tag | safety snapshot of pre-rollback state |
