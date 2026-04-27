# Ayurveda Room Mapping — Wave 2 Activation

**Status:** FOUNDER-REVIEW-PENDING
**Date:** 2026-04-21
**Agent:** Agent 6 — Ayurveda operationalization
**Locale scope:** English (en) only
**Upstream doctrine:** `ROOM_SYSTEM_STRATEGY_V1.md` §5; `ROOM_TRADITION_ASSIGNMENT_V2.md` (Ayurveda = primary in release/growth × health_energy; light-support in stillness/connection/clarity; excluded-by-default in joy unless offering-register); `WAVE1_SYNTHESIS.md` §1.6 (thin-gap call-out).

**Artifacts produced by this agent:**
1. `kalpx/core/data_seed/practices_ayurveda_wave2.json` — 17 new Ayurveda-tradition practice rows, `status: draft`, `CURATOR_GATE: true`.
2. `kalpx-app-rn/docs/room_system_v31/audits/AYURVEDA_ROOM_MAPPING.md` — this document.

**Does NOT modify:** `principles_ayurveda.yaml` (24 existing principle rows untouched).

---

## §A — Inventory end-state

| Class | Authored pre-Wave-1 | Pooled pre-Wave-1 | Pooled post-0135 (Wave 1) | Pooled after Wave 2 (this agent) | Still dark |
|---|---:|---:|---:|---:|---:|
| Ayurveda principles | 24 | 0 | 14 | 14 (unchanged — this agent did not pool more principles) | 10 |
| Ayurveda practices | 0 | 0 | 0 | 17 (new, pending migration) | n/a |

**Note on practices:** master_practices.json contained ZERO Ayurveda-tradition practice entries before Wave 2. The 17 rows in `practices_ayurveda_wave2.json` are the first Ayurveda-tradition somatic drills in the library — this is genuinely new authoring, not re-tagging.

**Migration coupling required before selector sees these rows:**
- Ingestion of `practices_ayurveda_wave2.json` into `Practice`/`RoomContentPool` tables (Wave 2b migration, not authored here).
- Tag-patch populating v3.1 governance fields is already inline in this JSON (unlike the Niti/Sankhya Wave 2 files, which require a separate TAG_PATCH_WAVE1B per WAVE1_SYNTHESIS §6.3).

---

## §B — Room × life_context × Ayurveda class matrix

### B.1 Room × context matrix (this agent's 17 practice rows)

| Room | health_energy | relationships (shared) | Count per room |
|---|---|---|---:|
| release | 7 primary + 1 shared-with-stillness = 8 | — | 8 |
| growth | 4 | — | 4 |
| clarity | 2 | — | 2 |
| stillness | 2 (1 shared with release) | — | 2 |
| connection | 1 | 1 (secondary bias) | 1 |
| joy | 1 (offering-register, gated) | — | 1 |
| **Total unique rows** | — | — | **17** |

The single connection row (`ayur_eat_before_hard_talk`) carries both `health_energy` and `relationships` in `life_context_bias` because pre-relational body-prep is both a body-vitality act and a relational preparation; connection × health_energy gets the row *as* body-prep, connection × relationships gets it via secondary bias. This is deliberate — it closes the `connection × health_energy` gap identified in WAVE1_SYNTHESIS §1.6 with a single authentic row rather than forcing a separate authoring.

### B.2 Per-row justification (dosha / śāstra logic)

#### Release (somatic primacy — native ground for Ayurveda)

| practice_id | Dosha logic | Śāstra anchor | Why release |
|---|---|---|---|
| `practice.ayur_sitali_cool_pitta_midday` | pitta pacifying — cooling breath | Ashtanga Hridaya Su.1; HYP 2.57–58 | Midday pitta heat → release of fire before speech/decision. |
| `practice.ayur_abhyanga_self_oil_5min` | vata pacifying — warmth + rhythm + boundary | Ashtanga Hridaya Su.2 (Dinacharya); Charaka Su.5 | Overwhelm = vata vitiation; abhyanga is the classical vata-release. Anchor row for release × health_energy. |
| `practice.ayur_cool_water_hands_face` | pitta pacifying — cooling sites (wrists, eyes) | Sushruta Sharira (marma sites); Ashtanga Hridaya Su.1 | Post-conflict residual pitta discharge. |
| `practice.ayur_warm_mug_hold_for_shaking` | vata pacifying — warmth + weight + rhythm | Charaka Su.20 (vata symptoms & pacification) | Acute vata tremor (fear/cold/shakiness) — classical counter: warmth not courage-talk. |
| `practice.ayur_nasya_mustard_oil_nostril` | vata pacifying — anchors prana downward | Ashtanga Hridaya Su.2 (Dinacharya — nasya); Charaka Su.5 | Post-travel/post-chaotic dryness; nasya is the dinacharya step for prana re-anchor. |
| `practice.ayur_post_meal_walk_10min` | kapha lifting — prevents post-meal stagnation | Ashtanga Hridaya Su.8 (post-meal conduct) | Post-meal heaviness release (classical shatapavali). |
| `practice.ayur_simplify_day_recovery` | vata pacifying — protects ojas | Charaka Su.15 (samsarjana-krama); Su.11 (nidra) | Convalescence release — release of "perform to prove I'm back" loop. |
| `practice.ayur_warm_foot_soak_evening` (shared with stillness) | vata pacifying — draws prana downward | Ashtanga Hridaya Su.2 (Dinacharya — padabhyanga) | Evening vata release; also valid as stillness-light. |

#### Growth (rhythm-building — kapha-lifting for morning heaviness)

| practice_id | Dosha logic | Śāstra anchor | Why growth |
|---|---|---|---|
| `practice.ayur_kapha_brisk_walk_7min` | kapha lifting — lightness + warmth + motion | Ashtanga Hridaya Su.2; Charaka Su.21 (vyayama) | Anchor row — growth × health_energy. Kapha morning = growth's native time-of-day. |
| `practice.ayur_kapha_ginger_honey_water` | kapha lifting — ushna + lekhana | Ashtanga Hridaya Su.5; Bhavaprakasha (madhuvarga) | Morning kapha reduction via dravya-guna; supports rhythm-building. |
| `practice.ayur_dry_brush_garshana` | kapha lifting — rukshana (drying) | Charaka Su.5 (udvartana) | Friction-based kapha mobilization — alternative to oiling on heavy mornings. |
| `practice.ayur_kapalabhati_short_morning` | kapha lifting — gentle expulsion | HYP 2.35 (shatkarma); Ashtanga Hridaya Su.2 dosha logic | Morning kapha — growth-register breath practice (contrast: not stillness-register). |

#### Stillness (vata-grounding — LIGHT support only, per doctrine)

| practice_id | Dosha logic | Śāstra anchor | Why stillness |
|---|---|---|---|
| `practice.ayur_vata_ground_evening_sequence` | vata pacifying — pre-sleep settling | Ashtanga Hridaya Su.2 (Dinacharya evening); Charaka Su.1 | Dusk vata-pacification as pre-sleep settling. Deliberately softer than any stillness-primary yoga practice to preserve light-support role. |
| `practice.ayur_warm_foot_soak_evening` (shared with release) | vata pacifying — draws prana downward | Ashtanga Hridaya Su.2 | Can operate in stillness as sacred-spare evening act, no cognitive load. |

#### Clarity (sense-restraint, pre-decision body-settling)

| practice_id | Dosha logic | Śāstra anchor | Why clarity |
|---|---|---|---|
| `practice.ayur_sense_withdrawal_3min` | vata pacifying — indriya nigraha | Ashtanga Hridaya Su.1; Charaka Sharira 1 | Pre-decision body-settling — lowers sensory load before buddhi discriminates. |
| `practice.ayur_warm_water_waking_5min` | kapha lifting — ushnodaka + agni | Ashtanga Hridaya Su.2; Bhavaprakasha | First-decision-of-day clearing; dinacharya foundation. |

#### Connection (pre-relational body-prep — LIGHT)

| practice_id | Dosha logic | Śāstra anchor | Why connection |
|---|---|---|---|
| `practice.ayur_eat_before_hard_talk` | vata+pitta pacifying — ojas support | Charaka Su.5; Su.27 (annapana-vidhi) | Pre-relational body-prep: steady agni/ojas so the conversation is about the topic, not the deficit. |

#### Joy (offering-register — GATED, see §D)

| practice_id | Dosha logic | Śāstra anchor | Why joy (if) |
|---|---|---|---|
| `practice.ayur_abhyanga_as_offering` | sattvic honoring — body-celebration, not body-correction | Ashtanga Hridaya Su.2 | Joy-register variant: posture is offering, not correction. Pool role = `rare` with CURATOR gating. See §D. |

---

## §C — Principles still dark after Wave 1 + this agent's pass

10 of 24 Ayurveda principles remain un-pooled after migration 0135. For each, this agent proposes either `ACTIVATE` (with target room/slot) or `LEAVE DARK` (with reason). **Activation is advisory** — it does not change pools; it is a recommendation for a Wave 1c tagging patch or Wave 2 extension.

| # | principle_id | Proposal | Target room / slot | Justification |
|---|---|---|---|---|
| 1 | `ayur_pitta_cool_midday_heat` | **ACTIVATE → release/wisdom_banner** | `room_release / wisdom_banner` | Pitta-cooling doctrine at midday peak is a natural banner companion to `practice.ayur_sitali_cool_pitta_midday`. Currently unpooled; release banner pool has five Ayurveda rows already, one more is doctrinally safe and closes the pitta-cooling pair principle↔practice. |
| 2 | `ayur_kapha_move_morning_inertia` | **ACTIVATE → growth/wisdom_banner** | `room_growth / wisdom_banner` | Principle directly mirrors the new `practice.ayur_kapha_brisk_walk_7min` anchor; activating it gives the growth × health_energy user both a body-wisdom banner and the somatic practice in one visit. Low risk — growth accepts Ayurveda as light support per doctrine. |
| 3 | `ayur_warm_and_oil_when_dry` | **ACTIVATE → release/wisdom_banner** | `room_release / wisdom_banner` | Ruksha / snigdha teaching pairs tightly with `practice.ayur_abhyanga_self_oil_5min` (which is the anchor in release practice). Natural principle↔practice interlock. |
| 4 | `ayur_lighten_when_stuck_after_eating` | **ACTIVATE → release/wisdom_banner** | `room_release / wisdom_banner` | Directly pairs with `practice.ayur_post_meal_walk_10min` (shatapavali). |
| 5 | `ayur_after_travel_reground` | **ACTIVATE → release/wisdom_banner** | `room_release / wisdom_banner` | Pairs with `practice.ayur_nasya_mustard_oil_nostril` — classical post-travel protocol. Release is the right emotional register for arriving after chaos. |
| 6 | `ayur_warm_food_for_vata_scatter` | LEAVE DARK (Wave 1c tagging recommended) | n/a in Wave 2 | Thin because it lacks `life_context_bias` tagging, not because it lacks fit. Would surface in growth × daily_life if tagged. Log for Wave 1c tag-patch as noted in §E. |
| 7 | `ayur_cool_food_when_heat_is_high` | LEAVE DARK (Wave 1c tagging recommended) | n/a in Wave 2 | Same reason as #6. Candidate for growth × daily_life after tagging. |
| 8 | `ayur_do_less_when_recovering` | **ACTIVATE → release/wisdom_banner** | `room_release / wisdom_banner` | Pairs with `practice.ayur_simplify_day_recovery` — convalescence principle + practice. |
| 9 | `ayur_morning_elimination_and_clear_start` | **ACTIVATE → growth/principle** | `room_growth / principle` | Dinacharya-adjacent; growth is the daily-rhythm room. Pairs with `practice.ayur_warm_water_waking_5min`. Low risk — growth already has 4 Ayurveda principles pooled. |
| 10 | `ayur_evening_screen_restraint` | LEAVE DARK (reason: dinacharya-overlap) | n/a | Dinacharya family already has `dina_pre_sleep_same_sequence` and other evening-discipline rows active in growth. Activating this Ayurveda row here would duplicate register. Leave dark unless Wave 3 surfaces a distinct stillness × evening slot. |

**Summary:**
- **Propose ACTIVATE:** 7 of 10 — all into release wisdom_banner (5) or growth (2). No joy, no connection. Each pairs with a Wave 2 practice so the principle↔practice interlock is complete.
- **Propose LEAVE DARK:** 3 of 10 — 2 need Wave 1c tagging upstream; 1 would duplicate dinacharya.

**Risk check against doctrine:** Each proposed activation stays within the ROOM_TRADITION_V2 envelope — Ayurveda primary in release × health and growth × health, never surfaced in joy as corrective. No tradition-fit violation.

---

## §D — Joy × health_energy decision

**Call: PARTIAL AUTHOR — single gated row, with explicit CURATOR gate.**

### Reasoning

ROOM_TRADITION_V2 §Joy doctrine: joy is ānanda / offering / rasa — not cultivation, not correction, not "wellness." Any Ayurvedic practice whose posture is "fix the body" violates the joy register, because joy's native posture is "the body is already good; extend outward from that fullness."

Most Ayurveda practice is dosha-corrective (pacify vata, cool pitta, lift kapha). Those are *not joy*. They are release (vata pacification is literally release-register), growth (kapha-lifting is rhythm-building cultivation), or clarity (sense-restraint is discernment-preparation).

**However**, Ayurveda also contains a minor thread of sattvic honoring — treatments approached not as remedy but as daily care for a body already in its sattvic state. Abhyanga specifically is described in Ashtanga Hridaya as daily care, not remedy alone. The posture can legitimately shift from "fix" to "offer."

So this agent authored **one** joy-register row:

- `practice.ayur_abhyanga_as_offering` — pool role `rare`, CURATOR_GATE: true, explicit `misuse_risk`: "Do NOT surface during grief, agitation, or depletion — this is joy-register only; CURATOR must confirm joy-state gating before routing."

**Why only one, why rare, why gated:**
1. Curation risk is high — the same somatic action (abhyanga) reads as release-register in any non-joy state. Runtime selection must never surface this row to a user in release or growth by accident.
2. Rotation breadth is not the goal — the goal is a single authentic joy-register Ayurveda anchor. Gratuitously adding "joy × ayurveda" rotation would push toward wellness-generic, which the brief explicitly forbids.
3. If the founder rejects this row in §F review, the fallback is `DEFER`: "joy × health_energy Ayurveda practice = DEFER — no authentic joy-register Ayurveda authoring viable in Wave 2; route to growth × health_energy for kapha-lifting body-vitality, or to release × health_energy for vata-pacifying somatic release." The decision gate is preserved.

**Not authored as joy:**
- "Body-celebration breath," "gratitude-scan-of-body," or any gratitude-journaling-as-Ayurveda was rejected. None has dosha logic or śāstric anchor; all would be wellness-rebranded.

---

## §E — Intervention links

This section lists recommended links FROM existing library rows INTO the 17 new practices. Format: `source (type/id) → target_id (role)`.

### E.1 From existing Ayurveda principles (Wave 1c tagging companion)

Existing Ayurveda principles in `principles_ayurveda.yaml` already have `intervention_links` arrays targeting *placeholder practice IDs* (e.g. `cooling_breath_sitali_3min`, `warm_foot_soak_5min`, `cool_water_hands_face`, `brisk_walk_7min`, `self_oil_hands_feet_3min`, `walk_after_meal_10min`, `simplify_the_day_3min`, `hold_a_warm_mug_2min`, `screen_off_30min`, `sleep_wake_consistency_check`). These placeholders **do not exist** in master_practices.json. Wave 2's new practices are the real resolution targets:

| Existing principle | Current placeholder link | Propose re-target to |
|---|---|---|
| `ayur_pitta_cool_midday_heat` | `cooling_breath_sitali_3min` (primary) | `practice.ayur_sitali_cool_pitta_midday` (primary) |
| `ayur_vata_ground_evening` | `warm_foot_soak_5min` (primary) | `practice.ayur_warm_foot_soak_evening` (primary) |
| `ayur_cool_after_conflict` | `cool_water_hands_face` (primary) | `practice.ayur_cool_water_hands_face` (primary) |
| `ayur_cool_after_conflict` | `cooling_breath_sitali_3min` (supporting) | `practice.ayur_sitali_cool_pitta_midday` (supporting) |
| `ayur_kapha_move_morning_inertia` | `brisk_walk_7min` (primary) | `practice.ayur_kapha_brisk_walk_7min` (primary) |
| `ayur_warm_and_oil_when_dry` | `self_oil_hands_feet_3min` (primary) | `practice.ayur_abhyanga_self_oil_5min` (primary) |
| `ayur_lighten_when_stuck_after_eating` | `walk_after_meal_10min` (primary) | `practice.ayur_post_meal_walk_10min` (primary) |
| `ayur_do_less_when_recovering` | `simplify_the_day_3min` (primary) | `practice.ayur_simplify_day_recovery` (primary) |
| `ayur_warmth_for_fear_and_shakiness` | `hold_a_warm_mug_2min` (primary) | `practice.ayur_warm_mug_hold_for_shaking` (primary) |
| `ayur_abhyanga_for_overwhelm` | `self_oil_hands_feet_3min` (primary) | `practice.ayur_abhyanga_self_oil_5min` (primary) |
| `ayur_sense_restraint_when_overloaded` | `one_minute_eyes_closed_pause` (primary) | `practice.ayur_sense_withdrawal_3min` (primary) |
| `ayur_after_travel_reground` | `wash_face_and_feet_arrival` (primary) | `practice.ayur_nasya_mustard_oil_nostril` (supporting); KEEP wash_face_and_feet_arrival if authored separately elsewhere |
| `ayur_morning_elimination_and_clear_start` | `warm_water_on_waking` (primary) | `practice.ayur_warm_water_waking_5min` (primary) |
| `ayur_eat_before_hard_conversation` | `mindful_water_and_pause_3min` (primary) | `practice.ayur_eat_before_hard_talk` (primary) |

**Founder-review item:** the scale of this rewire is 14+ intervention_link changes across the Ayurveda YAML. Propose a single companion migration (`0136_rewire_ayurveda_intervention_links.py` in a future wave) rather than editing the YAML — preserves audit trail and avoids coupling content-seed commits to intervention-graph changes. **Not in Wave 2 scope.**

### E.2 From Agent F's Niti rows (principles_niti_wave2.yaml)

Agent F's Niti principles are clarity-register discernment. The following should add secondary intervention_links into Wave 2 Ayurveda practices for embodied pre-decision prep:

| Niti row family | Propose secondary link | Role |
|---|---|---|
| Niti × clarity × work_career (any "pause before deciding") | `practice.ayur_sense_withdrawal_3min` | supporting |
| Niti × clarity × money_security (agitation-before-money-choice) | `practice.ayur_sense_withdrawal_3min` | supporting |
| Niti × clarity × relationships (before-difficult-conversation rows) | `practice.ayur_eat_before_hard_talk` | supporting |

Exact Niti row IDs to select are beyond this agent's scope; flag for the Wave 2 follow-up that tags Agent F + Agent G rows.

### E.3 From master_sankalps

No direct sankalp link rewiring recommended in Wave 2. Existing principles_ayurveda.yaml already references sankalp targets (`ground_before_sleep`, `respond_without_heat`, `begin_before_ready`, etc.). These sankalps should remain the primary link; Wave 2 practices are parallel somatic entries, not sankalp-replacements.

---

## §F — Founder-review flags

### F.1 Judgment calls on tradition-fit

1. **`practice.ayur_abhyanga_as_offering` in joy.** This agent authored 1 joy-register Ayurveda practice under explicit CURATOR gating. Founder call: is the offering-register reframing of abhyanga authentic enough to stand as a joy-room row, or should joy × health_energy Ayurveda be fully deferred per the alternative in §D? **If deferred**, remove this row before ingestion and route joy × health_energy to the Bhakti offering-banner pool instead.

2. **`practice.ayur_kapalabhati_short_morning` tradition tagging.** Kapalabhati's native home is Hatha Yoga (shatkarma), not Ayurveda proper. This agent placed it under `tradition: [ayurveda]` because its operational use here is dosha-timed (kapha morning) and dinacharya-framed, not because it originates in Ayurveda. Founder call: accept as Ayurveda-operationalized Hatha, or re-tag as Hatha with Ayurveda secondary? The row still works either way; only the tradition metadata differs.

3. **`practice.ayur_dry_brush_garshana` śāstric anchor.** Garshana (raw silk glove dry brushing) is an operational adaptation — Charaka describes *udvartana* (powder-based dry massage) but not silk-glove specifically. This agent marked `sastra_anchor` with a "operationally adapted for self-care as garshana" note. Founder call: acceptable as dosha-logical extension, or strip to udvartana-only framing?

### F.2 Ayurveda-as-light vs primary

Release × health_energy has 8 Wave 2 rows (7 unique-primary + 1 shared with stillness). This is at the upper end of the 5-6 target in the brief. Rationale: Ayurveda is doctrinally **primary** (not light) in release per ROOM_TRADITION_V2 §Release, and every one of the 8 rows has a distinct dosha-state it addresses (vata overwhelm, vata tremor, pitta post-conflict, pitta midday, vata post-travel, kapha post-meal, vata recovery, vata evening). The brief's 5-6 figure was pre-authoring; post-authoring the legitimate count landed higher. Founder call: accept 8, or defer 2-3 to Wave 3?

### F.3 Items logged for Wave 1c tagging (not fixes here)

- `ayur_warm_food_for_vata_scatter` — thin because it lacks `life_context_bias` tagging (would surface in growth × daily_life).
- `ayur_cool_food_when_heat_is_high` — same reason.
- Intervention-link rewire across 14 existing Ayurveda principles (§E.1) — propose as `0136_rewire_ayurveda_intervention_links.py`.

### F.4 Distribution summary vs brief target

| Target (brief) | Target range | Delivered | Notes |
|---|---:|---:|---|
| Release × health_energy | 5–6 | 8 (7 unique-primary + 1 shared) | Over by 2; see §F.2 |
| Growth × health_energy | 3–4 | 4 | At top of band |
| Stillness × body-regulation (LIGHT) | 1–2 | 2 (1 shared with release) | ✓ |
| Clarity × health_energy | 2 | 2 | ✓ |
| Connection × health_energy | 1 | 1 (dual-biased with relationships) | ✓ |
| Joy × health_energy | 0–2 (conditional) | 1 (gated, rare) | See §D — founder decision required |
| **Total** | 15–20 | **17** | ✓ |

---

## Appendix — Sources referenced

Primary śāstric corpus cited across the 17 rows:

- **Caraka Saṁhitā** — Sutrasthana 1, 5, 11, 15, 20, 21, 27
- **Aṣṭāṅga Hṛdayam (Vāgbhaṭa)** — Sutrasthana 1, 2 (Dinacharya), 5, 8
- **Suśruta Saṁhitā** — Sharira Sthana (marma sites)
- **Bhāvaprakāśa** — madhuvarga (honey), ushnodaka (warm water)
- **Haṭha Yoga Pradīpikā** — 2.35 (kapalabhati), 2.57–58 (sitali) — cross-referenced where Ayurveda operationalizes Hatha breath practice under dosha logic

No row citing only "wellness tradition." No row without dosha logic. No mindfulness-rebrand.

---

## End-state

17 practices authored; 7 existing dark principles proposed for activation; 1 joy-register row gated for founder decision; 3 judgment calls flagged. Wave 1c tagging + 1 follow-up intervention-link migration logged for future waves. No principle YAML modified. No pool migration applied by this agent.
