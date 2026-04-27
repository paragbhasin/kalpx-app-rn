# Room System v3.1.1 — Governed Strategy (founder-locked 2026-04-20)

This is the CANONICAL STRATEGY doc for the Mitra Room System. It supersedes the implicit `ROOM_SYSTEM_V3_1_ARCHITECTURE.md` reference (which was never committed to disk; only lived in conversation context). Use this as the source of truth going forward.

Canonical room set: `stillness, connection, release, clarity, growth, joy`.
Canonical life_context set: `work_career, relationships, self, health_energy, money_security, purpose_direction, daily_life`.

---

## 1. Room-first UX contract

**Why room first, context second**

1. State is the immediate need. A user knows how they feel before they can frame it ("I feel heavy" is faster than "this is about career").
2. Rooms regulate posture before content — emotional tone / intensity ceiling / forbidden actions resolved before context biasing.
3. Context shapes relevance, not emotional framing. "Relationships" can appear in release, connection, clarity, or growth; room decides *how* the system meets the user.
4. Prevents the system becoming a life-advice browser.

**2-step UX**

Step 1: user picks room (stillness / connection / release / clarity / growth / joy).
Step 2: one-screen, one-tap follow-up — "What part of life is this touching most right now?" — 7 options + "Skip for now".

**One-tap rules**

- One screen, one tap, no multi-select in v1.
- Optional. Skip is first-class.
- Secondary visual weight to room choice.

**Skip behavior**

- If skipped, selection uses room-only pools; `life_context=null`.
- Telemetry: `context_skipped=true`.
- No retry prompt, no penalty.
- Framed as "Skip for now" or "Just use the room".

---

## 2. Room × life_context mapping

### stillness
- **Best-fit**: self, health_energy, daily_life, work_career
- **Weak-fit**: money_security, purpose_direction
- **Cautious**: relationships
- **Posture**: overwhelmed, scattered, flooded
- **Tone**: permissive, quiet, non-demanding, settling
- **Content bias**: breath, grounding, soothing mantra, short settling step, low cognitive load
- **No-go**: career problem-solving, duty-heavy teachings, moral correction, sharp discernment

### connection
- **Best-fit**: relationships, self, daily_life
- **Good-fit**: purpose_direction, work_career
- **Weak-fit**: money_security, health_energy
- **Posture**: alone, distant, spiritually dry, needing warmth
- **Tone**: companioning, relational, devotional, soft but not sentimental
- **Content bias**: companioned chant, relational naming, belonging, small outward contact
- **No-go**: analytical inquiry, emotionally cold teaching, "fix your loneliness" framing

### release
- **Best-fit**: relationships, self, daily_life
- **Good-fit**: work_career, health_energy
- **Weak-fit**: purpose_direction, money_security
- **Posture**: heavy, burdened, grieving, carrying something unprocessed
- **Tone**: held, compassionate, grave, non-fixing
- **Content bias**: breath + mantra + expression; space to process, not explain
- **No-go**: optimism coaching, life-hack tone, celebratory reframing, corrective niti

### clarity
- **Best-fit**: work_career, relationships, purpose_direction, money_security, self
- **Good-fit**: daily_life, health_energy
- **Posture**: confused, conflicted, mentally tangled
- **Tone**: spacious, discerning, steady, not preachy
- **Content bias**: anchor, pause, teaching, inquiry. Strongest room for Gita/Niti/Yoga Sutra discernment.
- **No-go**: raw containment, sentiment-heavy bhakti, generic soothing, celebration-forward

### growth
- **Best-fit**: purpose_direction, work_career, self, relationships
- **Good-fit**: money_security, health_energy
- **Weak-fit**: daily_life
- **Posture**: intentional, ready, wanting evolution
- **Tone**: dharmic, clean, forward, grounded
- **Content bias**: inquiry, practice, dharmic teaching, journal, abhyasa, swadharma, humility, next step
- **No-go**: vague inspiration, shallow motivation, joy-style celebration, passive soothing

### joy
- **Best-fit**: daily_life, relationships, self, purpose_direction
- **Good-fit**: work_career, health_energy
- **Weak-fit**: money_security
- **Posture**: already in a good place, grateful, open, ready to extend outward
- **Tone**: warm, light, grounded, expansive without bubbly
- **Content bias**: fullness, offering, blessing, seva, gratitude, carry
- **No-go**: introspection-heavy inquiry, burden-processing, duty-heavy growth, shallow positivity

---

## 3. Surface-isolation contract

**Default rule (absolute)**: Core triad content and Additional content **must not** appear in room pools by default. Core = journey repetition. Additional = elective extension. Rooms = state-responsive intervention.

**Override rule**: a row may cross surfaces only if ALL of:
1. Explicitly whitelisted in curator governance.
2. Whitelist includes written justification.
3. Row tagged for both surfaces in `surface_eligibility`.
4. Row passes room identity rules.
5. Cross-surface same-day exclusion rules still apply.

**Required override metadata**
- `surface_override_approved_by`
- `surface_override_reason`
- `surface_override_date`
- `surface_override_scope`
- `surface_override_expiry_optional`

**Same-day exclusions (defaults)**
- core ↔ room: same row cannot appear on both same day
- additional ↔ room: same row cannot appear on both same day
- room ↔ room: same row cannot appear in two rooms same day unless explicitly allowed
- joy ↔ growth: tighter exclusion window for mantra/practice — 7 days

---

## 4. Canonical rich runner contract

One shared BE runner payload for mantra / sankalp / practice, used by **both** core runners AND room runners. **No thin room-specific payload allowed.**

**Canonical fields**: `runner_kind, item_id, title, subtitle_optional, source_text, meaning_plain, instructions, reps_target, reps_default_selection, reps_available, duration_min, duration_ms_optional, audio_url, audio_duration_ms, deity_optional, tradition, sanskrit_optional, translation_optional, visual_anchor_optional, completion_copy_optional, provenance`.

**Rule**: rooms feel premium only if runner payload parity is enforced. A thinner room payload creates second-class UX.

---

## 5. Tagging v2 schema

### Required fields per row
- `room_fit` — list of canonical rooms
- `emotional_function` — regulate / hold / clarify / deepen / offer / express
- `spiritual_mode` — witnessing / teaching / offering / devotion / inquiry
- `intensity` — very_light / light / medium / deep
- `energy_direction` — inward / stabilizing / outward / reflective / embodied
- `tradition` — list
- `surface_eligibility` — core / additional / support_room / dashboard / completion / ...
- `pool_role` — anchor / rotation / backup / rare / conditional
- `action_family` — anchor / regulation / teaching / inquiry / expression / offering / carry / exit

### Governance fields
- `curator_notes`
- `selection_justification`
- `cross_surface_override_reason_optional`
- `founder_escalation_required`
- `review_status`
- `reviewed_by`
- `reviewed_at`

### Supporting fields
- `life_context_bias` — list of contexts row is especially good for
- `misuse_risk`
- `standalone_safe`
- `repeat_tolerance`
- `banner_eligible`
- `teaching_eligible`
- `reflection_eligible`

---

## 6. Audit framework for current rooms

For each legacy room, classify: keep / relabel / replace / add / remove / persist / contamination-risk.

Mandatory callouts per room: missing exit, weak pills, duplicated content, missing testIDs, persistence gaps, shallow copy, cross-surface contamination.

### grief → release
- **Keep**: breath-first holding, grief-compatible mantras, compassionate tone
- **Relabel**: clinical or finalizing language
- **Replace**: uplift lines, "lesson from pain" framing
- **Add**: clear exit, sacred-trace persistence for expression
- **Remove**: celebration, offering, analytical inquiry
- **Persist**: voice-note / expression if governed and private
- **Contamination-risk**: dharma-duty, niti correction, generic kindness aphorisms

### loneliness → connection
- **Keep**: companionship tone, relational chant, gentle reach-out
- **Relabel**: anything pitying or overly soft
- **Replace**: flat "you are not alone" clichés
- **Add**: banner-ready devotional principles, held offering
- **Remove**: analytical self-diagnosis
- **Persist**: named connection state, reach-out intent
- **Contamination-risk**: release-style grief content, stillness-style silence

### joy
- **Keep**: fullness mantra, carry, blessing/seva direction
- **Relabel**: weak outward chips
- **Replace**: vague "Offer it into your day"
- **Add**: stronger offering/blessing sankalp rotation
- **Remove**: gratitude-worksheet feel
- **Persist**: carry event, blessing/offer completion
- **Contamination-risk**: growth-style moral effort, clarity-style inquiry

### growth
- **Keep**: inquiry, path-oriented mantra, walk/practice, journal
- **Relabel**: self-improvement tone copy
- **Replace**: vague motivational chips
- **Add**: real teaching payloads, dharmic progression logic
- **Remove**: joy carry, shallow inspiration
- **Persist**: journal, inquiry category, chosen growth thread
- **Contamination-risk**: joy or clarity overlap if not differentiated

---

## 7. Curated pool strategy

Small governed pools per `(room × action_slot)`:
- anchors: 1 per slot
- rotation: 3–6 per slot
- rare/conditional: 0–2
- backups: 1–2

**Do not**: build huge undifferentiated pools; import active core triad items; import active additional items.

**Life_context biasing**: do NOT create dozens of sub-pools. Keep one pool per `(room, slot)`; score candidates within the pool using `life_context_bias`. Context biases selection, not architecture.

Example: growth mantra pool is one pool. If `life_context=work_career`, score swadharma / disciplined-effort rows higher. If `purpose_direction`, score meaning / path / vocation rows higher. Same pool, different scores.

---

## 8. Selection rules

### Hard filters
- `room_fit` match
- `surface_eligibility` match
- no-go rule pass
- intensity ceiling pass
- `action_family` slot match

### Anti-repetition
- suppress same item in same room for last 3 renders
- prefer unseen-in-room before repeating
- prefer unseen-anywhere-today before repeating

### Same-day exclusions
- core ↔ room excluded same day
- additional ↔ room excluded same day
- room ↔ room excluded same day unless explicitly allowed
- joy ↔ growth mantra/practice excluded for 7 days

### Joy/Growth differentiation
- joy must always feel outward / full / carry
- growth must always feel inquiry / deepen / practice
- same row almost never serves both without explicit override

### Cold-start anchor rule
- first visit: bias strongly to anchor row
- use familiar, room-defining content
- delay heavier rotation until repeat visit

### Observability logging per render
`user_id_or_guest_id, room_id, life_context, visit_number, selected_action_ids, selected_banner_id_optional, selected_teaching_id_optional, rejected_candidates_summary, score_breakdown, cross_surface_exclusions_applied, cold_start_bool, feature_flags, pool_version`

---

## 9. Backend contract

### Endpoints
- `GET /api/mitra/rooms/{room_id}/render/`
- `POST /api/mitra/rooms/{room_id}/sacred/`
- `POST /api/mitra/rooms/telemetry/`
- `GET /api/mitra/rooms/dashboard-chips/`

### RoomRenderV1 shape
`room_id, life_context_optional, visit_state, opening_experience, principle_banner_optional, actions[], post_runner_reflection_pool_id_optional, dashboard_chip_label_optional, provenance`

### Action shape
Each action contains: `action_id, label, action_family, action_type, testID, analytics_key`, **one** of:
- `runner_payload`
- `step_payload`
- `teaching_payload`
- `inquiry_payload`
- `carry_payload`
- `exit_payload`

### Provenance block
`pool_id, pool_version, anchor_ref_optional, selected_ref, selection_reason, selection_score_breakdown, surface, room_id, life_context_optional`

### Persistence semantics

**Sacred-trace (user-private)**: voice note metadata, journal text, carry text, named state, reach-out intent. Encrypted, exportable, deletable.

**Telemetry (non-private)**: room entered, pill tapped, runner started, runner completed, exit, inquiry opened, carry saved. Separate from sacred-trace.

**Rule**: sacred-trace and telemetry are two different channels, tables, policies.

---

## 10. FE migration contract

### Components
`RoomRenderer, ActionPillRunner, ActionPillStep, ActionPillInquiry, ActionPillCarry, ActionPillExit`

### testID pattern (mandatory)
`<room>_<action_type>_<index>`

### Rules
- FE **never** reconstructs runner payload fields. BE is the source of truth for: reps, duration, source text, audio metadata, meaning, teaching content.
- Runner exit path: if runner source is support_room, exit returns to source room (not dashboard) unless explicit `room_exit` chosen.

---

## 11. Multi-agent workflow

### Tagging Draft Agent
Checks: candidate tagging completeness, first-pass room_fit, action_family, intensity.
Produces: tagging draft artifact, uncertainty list.
Escalates: only unresolved ambiguous rows.

### Room-Fit Review Agent
Checks: emotional posture fit, room contamination, weak-fit / forbidden-fit misuse.
Produces: keep / move / remove recommendations.
Escalates: multi-room exceptions.

### Surface Isolation Agent
Checks: no core/additional leakage, same-day exclusion compliance, override justification validity.
Produces: contamination audit, override ledger.
Escalates: any cross-surface whitelist proposal.

### Sovereignty / Content Integrity Agent
Checks: tradition integrity, source fidelity, no shallow paraphrase drift, no corrupted principle/mantra identity.
Produces: content integrity report.
Escalates: rows that distort source meaning.

### Runtime / Regression Contract Agent
Checks: endpoint contract, chip count, locked order, payload completeness, FE/BE action shape match.
Produces: fixture suite, regression report.
Escalates: invariant breaks.

### Founder-escalation triggers
- new cross-surface overrides
- room identity exceptions
- anchor swaps
- principle-family expansion into a new room
- content-fork conflicts

### Does NOT need founder
- normal rotation updates
- typo fixes
- pool-version bumps
- non-controversial relabels within approved tone

---

## 12. Phased execution order

- **Phase 0 — contracts**: room-first UX, life_context list, surface isolation, canonical runner, tagging v2, invariants — LOCKED.
- **Phase 1 — tagging + pools**: tag rows, build governed pools, exclude core/additional, resolve anchors, set slots.
- **Phase 2 — multi-agent review**: tagging, room-fit, surface-isolation, sovereignty, runtime.
- **Phase 3 — quick visible wins**: clean weak pills, unify exit, fix testIDs, remove shallow labels, improve dashboard entry UX.
- **Phase 4 — persistence**: sacred-trace encryption, telemetry separation, carry/journal/voice persistence, export/delete semantics.
- **Phase 5 — resolver + render endpoint**: room render endpoint, selection engine, provenance, room × life_context biasing, rich runner resolution.
- **Phase 6 — FE migration**: RoomRenderer, action pills, dashboard integration, entry sheet, source-safe exit.
- **Phase 7 — observability + tuning**: render logs, pool rotation stats, contamination monitoring, room health, curator dashboard.
