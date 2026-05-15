# Mitra v3 YAML Content Catalog

> Authoritative reference for every YAML backing the 45/47 moment framework. Generated 2026-04-18.
> Source of truth: moment IDs live in `~/kalpx/core/data_seed/mitra_v3/moments/`; shared libraries + templates live alongside.

## Overview

Orchestration entrypoint: `core/content/content_orchestrator.py::resolve(moment_id, ctx)` → reads ContentPacks (YAML) filtered by `status=approved` + locale + mode + `applies_when`, returns slot values.

**Current coverage:** 41/47 moments have registered YAML = **87% spine coverage** (Wave 5 final). M35/M46/M24/M47 shipped via Phase C pilots; Wave 2-5 batches landed Phase D-F.

---

## Part 1 — Numbered moment YAMLs (M8–M47)

All variants are 3-way (universal / hybrid / rooted), locale `en`, `status: approved`. Paths rooted at `~/kalpx/core/data_seed/mitra_v3/moments/`.

| ID | File | Purpose | Slots | Tests |
|---|---|---|---|---|
| M8 | `M8_morning_good.yaml` | Journey-home greeting when yesterday complete (momentum layout) | 7 | wave 2-5 |
| M9 | `M9_morning_triggered.yaml` | Morning when user was triggered overnight | 7 | batch |
| M10 | `M10_practice_incomplete.yaml` | Practice not done yet today | 7 | batch |
| M12 | `M12_return_absent.yaml` | Welcome-back after absence (3d+) | body/cta/context | batch |
| M15 | `M15_late_night.yaml` | Late-session evening reflection | 7 | batch |
| M17 | `M17_mantra_runner.yaml` | Runner: user's cycle mantra | 4 | wave 5 |
| M18 | `M18_sankalp_embody.yaml` | Runner: user's cycle sankalp | 4 | wave 5 |
| M19 | `M19_practice_step_runner.yaml` | Runner: user's cycle practice | 4 | wave 5 |
| M20 | `M20_checkin_regulation.yaml` | Midday quick check-in (support path) | 6 | wave 2 |
| M22 | `M22_balanced_return.yaml` | Return-path when balanced kosha | 7 | batch |
| M23 | `M23_weekly_reflection.yaml` | Sunday reflection / weekly loop | 6 | wave 2 |
| M24 | `M24_checkpoint_day_7.yaml` | Day 7 checkpoint — Phase C pilot, heavy weight | 10 | `test_pilot_m24.py` (11) |
| M25 | `M25_checkpoint_day_14.yaml` | Day 14 end-of-cycle, maximum weight | 12 | wave 2 |
| M26 | `M26_resilience_narrative_card.yaml` | Dashboard card — resilience reflection | 5 | wave 2 |
| M27 | `M27_prep_coaching_sheet.yaml` | Strategic prep (meet, negotiation, hard conversation) | 6 | wave 3 |
| M28 | `M28_predictive_alert_card.yaml` | Friction forecast alert | 5 | wave 2 |
| M29 | `M29_entity_recognition_sheet.yaml` | Entity identification moment | 6 | wave 2 |
| M31 | `M31_voice_note_sheet.yaml` | Voice consent + recording UI | 5 | wave 2 |
| M35 | `M35_evening_reflection.yaml` | Evening reflection — **Phase C pilot #1**, first fully in registry | 8 | `test_pilot_m35.py` (9) |
| M36 | `M36_why_this_l2.yaml` | Why-this L2 depth | 4 | wave 5 |
| M37 | `M37_why_this_l3.yaml` | Why-this L3 rooted anchor | 4 | wave 5 |
| M38 | `M38_voice_consent_sheet.yaml` | Voice consent instruction | 5 | wave 2 |
| M39 | `M39_post_conflict_morning.yaml` | Morning after conflict / repair | 6 | wave 2 |
| M40 | `M40_day_type_chip.yaml` | Dashboard day-type chip (multi-variant via applies_when) | 4 | wave 5 |
| M41 | `M41_focus_phrase.yaml` | Morning focus-phrase chrome | 3 | wave 5 |
| M42 | `M42_sound_bridge.yaml` | Audio bridge between runners | 4 | wave 2 |
| M43 | `M43_clear_window_banner.yaml` | Clarity banner + panchang indicator | 4 | wave 3 |
| M44 | `M44_gratitude_joy_card.yaml` | Gratitude + joy reflection (growth path) | 4 | wave 3 |
| M45 | `M45_season_signal_card.yaml` | Seasonal/cyclical insight | 4 | wave 5 |
| M46 | `M46_grief_room.yaml` | Grief support — **Phase C pilot #2**, maximum weight, outranks checkpoints | 10 | `test_pilot_m46.py` (16) |
| M47 | `M47_loneliness_room.yaml` | Loneliness support — tier 1 expansion, outranks checkpoints | 10 | `test_pilot_m47.py` (11) |

---

## Part 2 — Non-numbered `M_*` moment YAMLs

| ID | File | Purpose | Slots |
|---|---|---|---|
| M_adaptation_toast | Adaptation feedback toast | 3 |
| M_checkin_compact | Dashboard embed check-in widget | 4 |
| M_companion_analysis | Cycle embed — Mitra effectiveness reflection | 5 |
| M_completion_return | Transient completion acknowledgement | 3 |
| M_cycle_length_choice | 7d vs 14d cycle choice | 6 |
| M_cycle_reflection_results | Post day-14 decision card | 13 |
| M_daily_insight | Evening dashboard embed | 4 |
| M_discipline_select | Onboarding modality choice | 5 |
| M_first_day | Cycle day 1 briefing (triad intro) | 8 |
| M_help_me_choose_reveal | Onboarding help-me-choose reveal | 4 |
| M_identity_delta | Dashboard embed — identity shift | 2 |
| M_info_reveal | Feature discovery / explanatory UI | 5 |
| M_low_burden_day | Adjustment day when today_kosha ≠ life_kosha | 5 |
| M_morning_briefing | Optional audio transcript toggle | 2 |
| M_new_dashboard_greeting | Dashboard chrome + footer CTAs | 13 |
| M_offering_reveal | Devotional offering UI | 5 |
| M_pause_orb | Runner pause overlay | 2 |
| M_post_trigger_mantra | Post-trigger mantra reinforcement | 4 |
| M_progress_summary | Growth-path cycle embed (progress narrative) | 5 |
| M_reset_with_awareness | Mid-cycle reset | 5 |
| M_support_checkin | Support-specific mode-aware check-in | 5 |
| M_support_trigger | Triggered-state activation | 4 |

---

## Part 3 — Shared libraries & templates

### Principle registry (wisdom library)
Loaded by `core/management/commands/ingest_wisdom_principles.py`. Powers M7 path reveal, M17–M19 runners, M35–M37 why-this, M46/M47 support rooms.

- `principles_dharma.yaml`, `principles_gita.yaml`, `principles_yoga_sutras.yaml`
- `principles_sankhya.yaml`, `principles_ayurveda.yaml`, `principles_bhakti.yaml`
- `principles_dinacharya.yaml`, `principles_yamas.yaml`, `principles_niti.yaml`
- `principles_grief.yaml`, `principles_loneliness.yaml`, `principles_joy_expansion.yaml`
- `principles_devotional_depth.yaml`, `principles_searching_purpose.yaml`
- `principles_student.yaml`, `principles_creativity.yaml`, `principles_deepening.yaml`
- `principles_elder_legacy.yaml`, `principle_intervention_review.yaml`

**Per-entry schema:** `principle_id`, `tradition_family`, `title`, `description`, `state_tags` (klesha/vritti/kosha), `relevances`, `tone_modes`, `intervention_links`, `contraindications`.

### Library authoring fixture (triad catalog)
- `library_authoring_fixture.yaml` → ingest via `ingest_library_fixture.py` → `MasterMantra` / `MasterSankalp` / `MasterPractice` DB rows.
- Current: 4 mantras + 44 sankalps + 11 practices (founder-authored minimum).
- Drives cycle start (triad selection via library_scoring), M17/M18/M19 runner display, M35 context.

### Stage / onboarding (M1–M7)
- `diagnostic_copy.yaml` — stage 1–3 chip labels + mappings
- `onboarding_recognition_slots.yaml` — M7 recognition line templates + voice samples
- `moments_support_copy.yaml` — support-path framing per stage
- `guidance_mode_copy.yaml` — universal/hybrid/rooted variants
- `joy_signal_templates.yaml` — joy-path onboarding (pairs with positive textures)

Loaders: `core/reasoning/onboarding_inference.py`, `core/content/moments/views.py`.

### Strategic prep & predictive (M27/28/29/39/41/43/44)
- `strategic_prep_templates.yaml` — M27 coaching
- `predictive_alert_templates.yaml` — M28 alerts
- `pre_meeting_prep_template.yaml` — call framing
- `day_type_copy.yaml` — M40 day-type classification
- `panchang*.yaml` — M43 clear-window calendar indicators
- `seasonal_templates.yaml` — M45 seasonal insights
- `continuity_templates.yaml` — cross-day bridges

### Support & lifecycle (M12/21/26/31/46/47)
- `welcome_back_lines.yaml` — M12 absence variants (3d / 7d+ / mood-aware)
- `support_grief_templates.yaml` — M46 grief room
- `support_loneliness_templates.yaml` — M47 loneliness room
- `voice_note_consent_copy.yaml` — M31/M38 voice consent
- `resilience_ledger_copy.yaml` — M26 resilience narrative
- `life_ledger_prompts.yaml` — checkpoint prompts (M23, M25)

### Anchors + checkpoint framings
- `anchor_levels.yaml` — L0 grounding / L1 classical / L2 wisdom / L3 embodied
- `checkpoint_framings.yaml` — M24/M25 multi-variant rotation
- `moment_priority.yaml` — pair-wise conflict resolution (loaded by `decide_moment`):
  - `crisis > anything_else`
  - `grief_room > day7/day14 checkpoint`
  - `loneliness_room > day7/day14 checkpoint`
  - `grief_room > loneliness_room`
  - `welcome_back > predictive_alert`
  - `embeds_cap = 3`

### Meta / reference (not in resolve path)
- `library_cleanup_report.yaml` — audit + deprecation marks
- `intervention_mapping_proposal.yaml` — Phase C experimental
- `strategy_mapping.yaml` — moment→strategy decision tree proposal

---

## Part 4 — Loader module cross-reference

| YAML category | Loader | Entrypoint | Used by |
|---|---|---|---|
| Moment M*.yaml | `core/content/registry.py` | `load_registry()` | All orchestrator resolves |
| Principles | `core/management/commands/ingest_wisdom_principles.py` | `handle()` | M7/M17–M19/M35–M37/M46/M47 |
| Triad catalog | `core/management/commands/ingest_library_fixture.py` | `handle()` | Cycle start, M17–M19 |
| Onboarding copy | `core/reasoning/onboarding_inference.py` | `infer_mitra_state()` | M1–M7 |
| Support/grief/joy | `core/mitra_views.py` | `joy_signal()` et al | M44/M46/M47 |
| Moment priority | `core/content/moments/decide.py` | `resolve_pair()` | All moment conflict resolution |
| Checkpoint framings | `core/content/registry.py` | variant selection | M24/M25 rotation |

---

## Part 5 — Moments with no YAML (gaps vs spec's 47)

**Hardcoded in FE / legacy v2:**
- M1–M7 — onboarding turns (stage chips live in FE + legacy backend)
- M11 (pattern day), M13/M14 (evening practice branches), M16 (info reveal — partial)
- M21 (check-in agitated/drained — has `M_support_checkin` but not numbered M21)
- M30 (recommended additional), M32 (completion), M33 (notification deep-link — pipeline only)
- M34 (evening reflection full — M35 is the compact version)

**Contracted but not yet implemented:**
- `M_deepen_confirmation`, `M_deepen_sadhana` (growth deepening)
- `M_cross_cycle_integrity`, `M_cycle_complete_overview` (multi-cycle)
- `M_identity_state_view`, `M_path_evolution_reveal`
- `M_rep_extension_*` (reputation/karma tracking)
- `M_turn_8+` (post-M7 onboarding turns)

---

## Part 6 — CI gates (all green)

1. **Sovereignty** — zero grandfathering (`sovereignty_exemptions.txt` is empty post-M35/M46/M24)
2. **Coverage** — 41/47 = 87%
3. **Quality** — slot character/line caps enforced
4. **Fallback exhaustion** — rooted → hybrid → universal → null-safe
5. **Chip ID stability** — for onboarding stages
6. **Triad authority** — `TriadReadonlyView` immutability

---

## Quick reference paths

- Moment YAMLs: `~/kalpx/core/data_seed/mitra_v3/moments/M*.yaml`
- Shared libs: `~/kalpx/core/data_seed/mitra_v3/{principles_*,library_authoring_fixture,*_templates}.yaml`
- Registry: `~/kalpx/core/content/registry.py`
- Orchestrator: `~/kalpx/core/content/content_orchestrator.py::resolve()`
- Priority: `~/kalpx/core/content/moments/moment_priority.yaml`
- Test suite: `~/kalpx/core/content/tests/test_*.py` (20 files, 381 tests)
