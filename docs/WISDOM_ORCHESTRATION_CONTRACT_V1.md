# Wisdom Orchestration Contract V1

**Track 0.5 — Mitra v3.0 Wisdom Orchestration Layer**
**Date:** 2026-04-18
**Status:** LOCKED for v1 scope; ADDITIVE extension points declared for Track 2+
**Inputs reconciled:** Design Agents 1-7; Review Agents A (Architecture), B (Simplicity), C (Chat/Voice), D (Integrity)

---

## 1. Executive summary

Track 0.5 defines the deterministic routing layer that picks the right wisdom line for any Mitra surface — today (Joy/Growth/Completion), tomorrow (chat, voice, notifications, new rooms). It is a pure function, `pick_wisdom(input) → output`, sitting between the 430-row wisdom library and the existing content orchestrator. It does not generate, retrieve, or summarize with an LLM. It filters a static pool using authority tier, fit tags, contraindications, freshness, and a deterministic tiebreak.

This V1 ships a minimum viable selector (~350 LOC, one file), 12 must-have asset fields populated on ~330 selector-eligible rows, 3 hard-reject tone rules, one-tradition-per-session Redis lock, a 6-step relaxation ladder, and an always-emitted DecisionTrace through the existing MitraDecisionLog.

Four reviewers disagreed on scope. Review B demanded hard cuts; Reviews A and C demanded additive hooks for chat/voice and architecture extensibility; Review D demanded strict integrity gates. The reconciled V1 accepts B's scope discipline, honors A/C's extension points as nullable fields and declared-but-empty tables, and ships D's five integrity tightenings as blocking prerequisites. No feature crosses scope unless it is either (a) needed for Track 1 this quarter or (b) a nullable hook that prevents a schema migration later.

---

## 2. Clear goal of Track 0.5

**Why it exists.** Without an orchestration layer, every new surface that wants wisdom must hand-author its own selection logic. That path produces silent integrity regressions (self-help drift, grief-bypass, tradition-mixing) and duplicates library-routing code across TSX blocks. Track 0.5 centralizes the routing rules and their audit trail.

**What success looks like at V1 cutover.**

1. Track 1 surfaces (Joy Room opening, Growth Room anchor, Completion wisdom anchor) consume `pick_wisdom(...)` exclusively — zero hardcoded principle_ids in TSX.
2. Selector is deterministic: same input → same output, forever. Founder-replayable via DecisionTrace audit_id.
3. Zero integrity regressions detectable: `content_quality_gate` fails in CI if a grief-bypass phrase, application-tier-on-first-read, or cross-tradition blend is emitted.
4. ~330 selector-eligible rows have all 12 MUST-HAVE fields populated; pool-exhaustion telemetry fires < 1% of live calls.
5. Track 2 (chat, voice, notifications) can be built additively — no v1 schema mutation, no v1 rule rewrite.

**What it is NOT.** Not an LLM. Not a retrieval system. Not a content authoring tool. Not a ContentPack replacement (ContentPacks still own first-read fallback copy and quiet_ack phrase banks).

---

## 3. Architecture layers (final reconciled contract)

The layer has six objects. Four ship in V1; two are declared-empty hooks for Track 2+.

### 3.1 Ships in V1

**A. WisdomAsset** — normalized row in the library. Unifies principle + snippet via `asset_kind ∈ {principle, snippet}`. Carries 12 MUST-HAVE fields (see §4.2) plus 6 NICE-TO-HAVE.

**B. InteractionType** — Track 1 ships 5 types: `first_read_opening, second_beat, quiet_ack, visible_reply, completion_anchor`. (Agent 3 proposed 15; B cut 10. The additional 10 exist as future values of the same enum — same column, same switch statement, no schema change when they land.)

**C. Selector** — `pick_wisdom(WisdomSelectionInput) → WisdomSelectionOutput`. Pure, null-safe, deterministic. 6-stage pipeline (Filter → Sort → Tiebreak → Truncate → Wrap → Trace). Pseudocode fits one file ~350 LOC.

**D. DecisionTrace** — one JSON column appended to existing MitraDecisionLog rows. No new table. Records funnel counts per filter, final winner, tiebreak reason, relaxation steps, fallback used.

### 3.2 Declared-empty hooks for Track 2+

**E. ConversationMemory** — table created in V1, unused in V1. Track 1 writes `thread_id = session_id`. Reserved fields: `turn_count, summary_buffer (nullable), user_state_vector_series, user_vocabulary_comfort, per_principle_drill_depth`. Nullable = no migration cost.

**F. ResponseAssembly / ResponsePart** — schema declared, single-part default in V1. Fields: `part_type, text, asset_id, render_constraints (visible/audible/silent), char_count_visible, char_count_spoken, pause_before_ms, pause_after_ms, continuation_marker`. V1 every assembly has `parts = [single_part]` and `modality = visible`. Voice (Track 2) sets `modality = audible` and populates pause fields. Chat multi-turn (Track 2) produces multi-part assemblies.

### 3.3 Naming decisions (Review A)

- `room_fit_tags` → **`context_fit_tags`** (rooms are initial enum values; chat/voice/notification contexts add later without renaming)
- Per-surface char caps → **`RenderBudget`** object (`primary_limit, secondary_limit, hard_cap, medium ∈ {visible, audible, silent}`)
- Every asset row gets **`principle_version_id`** (monotonic integer; bumps on plain_english edit). DecisionTrace captures version_id → historical rows remain replayable.
- **`channel_coverage`** column on all assets: `[visible_text, spoken_voice, silent_store]` — derived by script (verse-cite `(2.47)` → not `spoken_voice`).
- **`bridge_family`** metadata (generalizes the Bhakti-on-compassion-slots exception; populated with `bhakti` only in V1).

### 3.4 What is intentionally NOT in V1

- UserReadinessProfile (A's ask): declared as an input field `user_readiness_level ∈ {L0..L4}` on the selector input, defaulted from `user.days_since_start` bucket. No object, no schema.
- RelationshipThread (A's ask): deferred. V1 treats `session_id` as the thread. The rename path is a field migration (`session_id` → `thread_id`) when Track 2 chat lands.
- Crisis pre-empt filter: V1 passes crisis signals through as a hard-reject tag on contraindicated assets. The dedicated crisis plane is Track 2.

---

## 4. Minimum viable V1 scope

### 4.1 The contract in one page

**Selector function**

```
pick_wisdom(input: WisdomSelectionInput) -> WisdomSelectionOutput

Input (required):  interaction_type, context (room), state_family, guidance_mode, locale
Input (optional):  path_intent, user_context, memory, preferences
Input (extension): user_readiness_level (L0..L4), thread_id (defaults to session_id)

Output: ok, selected_text, asset_kind, asset_id, principle_version_id,
        source_tier, source_family, char_count, wrapper_required,
        drill_down_available, channel_coverage, trace (DecisionTrace)

Contract: never raises. Invalid input → ok=false, empty selected_text,
          fallback_reason set. Caller falls through to ContentPack.
```

**Pipeline (6 stages, collapsed from Agent 7's 14)**

1. **Filter** — interaction_type allowlist × mode × context_fit × state × contraindications × freshness. Merged into one pass over the pool.
2. **Sort** — authority tier DESC → specificity DESC → quality (approved > variant_candidate) DESC.
3. **Tiebreak** — (a) tradition session diversity, (b) founder weighting, (c) alphabetical asset_id. Three keys total (B's simplification).
4. **Truncate** — short_label → first clause of plain_english (split on `,;—`) → first sentence. Enforce RenderBudget.
5. **Wrap** — if `wrapper_required=true` and founder wrapper_copy authored, prepend gloss. If missing → downgrade mode (rooted → hybrid → universal).
6. **Trace** — emit DecisionTrace inline on MitraDecisionLog.

If Filter returns empty pool, enter relaxation ladder (§4.3).

### 4.2 The 12 MUST-HAVE fields

Populated on ~330 selector-eligible rows before Track 1 cutover:

1. `asset_kind` (principle | snippet)
2. `source_tier` (tier_1 | tier_2 | application | snippet)
3. `source_family` (gita, yoga_sutras, bhakti, …)
4. `mode_coverage` (subset of {universal, hybrid, rooted})
5. `context_fit_tags` (joy_room, grief_room, growth_room, dashboard, completion_core, …)
6. `state_fit_tags` (grief, loneliness, joy, overwhelm, clarity_seeking, …)
7. `interaction_role_tags` (opening_line, second_beat_line, wisdom_anchor_line, seeded_prompt, typed_ack)
8. `max_char_fits` — computed from rendered char_count vs RenderBudgets
9. `emotional_weight` ∈ {light, moderate, heavy, maximum}
10. `drill_down_only` (bool)
11. `standalone_safe` (bool)
12. `tradition_naming_allowed` (bool)

Plus two **integrity-required** fields elevated from Review D (were deferrable in B's cut):

13. `principle_version_id` (required; bump on edit) — supports DecisionTrace replay
14. `tradition_specificity` (required on Tier 1 grief/loss/loss-completion rows) — distinguishes `gita_equanimity_in_loss` from `gita_arjuna_despair`. Move from Pass D → Pass C.

Nullable extension fields (Review C, additive):

15. `channel_coverage` (script-derivable)
16. `spoken_rewrite` (authored only for `tradition_naming_allowed=true` principles used in Track 1)
17. `pronunciation_ipa` (nullable; blank in V1)

### 4.3 Hard invariants (V1, no exceptions)

These are the immovable rules. Each has a CI gate.

1. **Application tier NEVER first_read** — regardless of mode. Drill-down L2/L3 only. Hard-coded filter.
2. **Snippets NEVER override principles in same slot** — principle wins R3 before any sort.
3. **One tradition per session** — Redis key `session:{id}:bound_tradition:{context_family}`. Set on first selection, enforced for rest of session.
4. **60-char cap in grief + loneliness is absolute** — RenderBudget.hard_cap = 60, no override.
5. **No tradition-naming on first_read in universal mode** — `tradition_naming_allowed=false` assets only. TS-12 hard-reject.
6. **Three hard-reject phrase families** (V1 ships only these three from Agent 5's twenty):
   - grief-bypass in grief/loneliness/triggered: `let go, move on, time heals, release, rise above, silver lining`
   - joy-as-gratitude-app in joy_room: `abundance, blessings, count your, manifest, level up, !, emoji`
   - self-help in growth/dashboard_input: `unlock, follow your heart, trust the universe, your truth, limitless`
7. **Snippet standalone_safe=yes defaults — HARD-BLOCKED pending founder Pass C review** of all 127 snippets. Track 1 cannot cutover until this pass completes. (Review D, elevated from deferrable to blocker.)
8. **Completion anchor source is law, not preference** (Review D, elevated from preference to invariant):
   - `runner_variant=mantra` → `source_family ∈ {gita}` only
   - `runner_variant=sankalp` → `source_family ∈ {yoga_sutras}` only
   - `runner_variant=practice` → `source_family ∈ {ayurveda, dinacharya}` only
   - No specificity override. Deterministic map.
9. **Reflective prompts prefer principle, not snippet** (Review D R11a inversion). Principle `why_this_levels.level1` is first choice; snippet is length-fallback only.
10. **Selector NEVER emits canned English.** On ok=false, empty `selected_text`; caller uses ContentPack authored fallback.
11. **Zero-fallback in rooted mode** — downgrade chain is rooted → hybrid → universal; universal → ContentPack. Never English override.
12. **Founder-only authors Sanskrit wrapper copy** — agent may draft English paraphrase only. CI gate: wrapper_copy edited in PR without founder approval → block.

### 4.4 Relaxation ladder (6-step, Agent 6)

Fires only when Filter returns empty candidates. Each step emits telemetry with `relaxation_step_reached`.

1. Relax freshness: 24h → 12h cooldown
2. Relax same-family gap: allow same-family consecutive
3. Relax specificity: broaden state_tag match (Jaccard 0.5 → 0.2)
4. Relax mode: rooted → hybrid → universal
5. Relax tier floor: Tier 1 only → Tier 2 allowed → snippet allowed
6. ContentPack fallback: caller's authored fallback string. P0 alert if missing.

### 4.5 Freshness policy (V1 — one rule + fragile exception)

- **R1 cooldown:** 24h per (user, asset_id). Single Redis key with TTL.
- **R4 fragile-surface stability (Agent 6's R4 inversion):** grief_room_opening, loneliness_room_opening, welcome_back_long_absence → SERVE SAME stable anchor on repeat visits. Rotation reads as "app forgot me." Implemented as `repeat_policy = stable_anchor` on the selector input.

All other freshness rules (R2/R3/R5/R6 from Agent 6) deferred to V2. `repeat_tolerance` → `repeat_policy` rename deferred; V1 uses existing column.

---

## 5. What Track 1 should consume

Three concrete integration points. Each is a single `pick_wisdom(...)` call from an existing orchestrator hook.

### 5.1 Joy Room opening

```
pick_wisdom({
  interaction_type: "first_read_opening",
  context: "joy_room",
  state_family: "joy",
  guidance_mode: user.mode,
  locale: user.locale,
  user_readiness_level: derive_from_days(user.days_since_start),
  memory: { recent_asset_ids, session_traditions, session_id },
})
```

Expected: Bhakti/Gita/Joy-Expansion family; `emotional_weight ∈ {light, moderate}`; celebration-language filtered out; char ≤ 80. Fallback: ContentPack `joy_room_opening_authored`.

### 5.2 Growth Room wisdom anchor (visible reply)

```
pick_wisdom({
  interaction_type: "visible_reply",
  context: "growth_room",
  state_family: user_classified_state,
  path_intent: user_classified_path_intent,
  guidance_mode: user.mode,
  locale: user.locale,
})
```

Expected: Tier 1 principle (never snippet alone); 80-char mirror + 90-char anchor; `tradition_naming_allowed=true` only in hybrid/rooted. Fallback: ContentPack `growth_room_default_anchor`.

### 5.3 Completion wisdom anchor

```
pick_wisdom({
  interaction_type: "completion_anchor",
  context: "completion_" + runner_source,  // core | support
  state_family: runner_variant_to_state[runner_variant],
  user_context: { runner_source, runner_variant },
  guidance_mode: user.mode,
  locale: user.locale,
})
```

Expected: deterministic per invariant #8. Source locked by runner_variant. Fallback: ContentPack hardcoded per (runner_source, runner_variant) — 6 authored rows.

### 5.4 Integration contract (3 surfaces only)

- Caller passes typed input.
- Caller inspects `output.ok`. If false, renders its ContentPack fallback. Never shows raw selector error.
- Caller reads `output.selected_text`, `output.asset_id`, `output.drill_down_available`.
- Caller optionally links WhyThisSheet L2 to `output.asset_id` — L2 already works.
- Caller does NOT execute tradition lock, freshness, or truncation. All selector-side.

---

## 6. What is explicitly deferred (and why it is safe to defer)

| Deferred item | Source | Why safe to defer |
|---|---|---|
| 10 of 15 interaction types | Agent 3 | Track 1 uses 5. Adding values to enum + switch is additive; no schema change. |
| Full 30×15×3 policy matrix | Agent 3 | V1 authors 3 surfaces × 5 types × 3 modes = 45 cells. Matrix grows row by row. |
| 17 of 20 tone rules (TS-04..TS-20) | Agent 5 | The 3 shipped rules cover the historical fail modes (grief-bypass, joy-celebration, self-help). Additional rules add downgrades, not blockers. |
| Wrapper copy system | Agents 2, 4, 5 | V1 uses downgrade chain when wrapper missing. Wrapper authoring is Track 2. |
| `variant_group_id` clustering | Agent 4 | Rotation is V2. V1 uses asset_id tie-break. |
| `AssetLifetimeServeCount` | Agent 6 | Over-familiarity is a 30-day-live concern; ships after telemetry proves a problem exists. |
| `repeat_policy` rename | Agent 6 | Column rename is a schema migration. V1 preserves `repeat_tolerance`; rename via Alembic when V2 freshness rules land. |
| Voice interaction types + prosody hints | Agent 3, Review C | ResponseAssembly single-part default handles V1; voice fields nullable in schema. |
| Full 430-row Pass B | Agent 4 | Only ~330 selector-eligible rows need MUST-HAVEs. Remaining rows are drill-down-only or application tier. |
| Application-tier readiness L3+ gating machinery | Agent 1 | V1 sets `drill_down_only=true` on 8 rows. No gate logic needed. |
| Snippet promotion path | Agents 1, 2 | Pass C founder review covers V1 integrity. Promotion lifecycle is V2. |
| RelationshipThread object | Review A | `session_id` → `thread_id` rename when Track 2 chat lands. V1 passes session_id unchanged. |
| Crisis pre-empt filter plane | Review A | Current misuse_risk + TS-18 contraindication is sufficient. Dedicated plane is Track 2. |
| `tradition_specificity` on full 430 rows | Review D | V1 authors on ~40 grief/loss/loss-completion rows only (Pass C slice). Full-corpus authoring is Pass D. |
| Full phrase blacklist expansion | Agent 5 | 3 families cover V1 surfaces. Expand per Track 2 surface. |

Every deferred item above has one property: **shipping it later does NOT require rewriting the V1 contract**. Additive values, nullable fields, later CI gates.

---

## 7. Risks and mitigations

### 7.1 Integrity risks (Review D)

- **Risk:** Snippet drift dominates live output within 30 days (snippets are shorter, more, well-tagged).
  **Mitigation:** Invariants #2 and #9 (principle-over-snippet) + Pass C founder review block + corpus-level `snippet_ratio_per_context_family` alert in DecisionTrace telemetry > 40% → Slack warn.
- **Risk:** Wrong-verse-in-context (same-family, tag-matching, wrong teaching — e.g., Arjuna-despair verse in grief-exit slot).
  **Mitigation:** `tradition_specificity` required on Tier 1 grief/loss rows before cutover (Pass C slice, not Pass D).
- **Risk:** Session-tradition lock false-reset on 35-min user bounce.
  **Mitigation:** Redis TTL = 24h on `session:{id}:bound_tradition`, not session-lifetime.
- **Risk:** Wrapper misattribution via agent-drafted Sanskrit gloss.
  **Mitigation:** Invariant #12 — CI gate on wrapper_copy edits; founder-only.
- **Risk:** Completion family-slip (Bhakti winning specificity on runner_variant=mantra).
  **Mitigation:** Invariant #8 — hard law, not preference.

### 7.2 Scope risks (Review B)

- **Risk:** Selector bloats to 14-stage pipeline; Track 1 slips 4-6 weeks.
  **Mitigation:** Contract pins selector at 6 stages, ~350 LOC, one file. CI LOC budget.
- **Risk:** Open-question parking lot hits 80 items; founder review becomes gating.
  **Mitigation:** §13 caps founder decisions at 10. Everything else is an engineering default.
- **Risk:** DecisionTrace cardinality explodes on every block mount.
  **Mitigation:** Single JSON column; existing MitraDecisionLog; no new table. Sampling rate configurable via env flag.

### 7.3 Chat/voice compatibility risks (Review C)

- **Risk:** V1 locks shapes that break Track 2 chat/voice.
  **Mitigation:** ResponseAssembly + ResponsePart declared in V1 schema (single-part default); ConversationMemory table declared-empty; `channel_coverage` populated on ingest; `spoken_rewrite` nullable on Track 1 scope.
- **Risk:** `visible_reply` scoped to dashboard+growth locks grief/loneliness from future chat 2-beat needs.
  **Mitigation:** Interaction-type policy row, not a hardcoded rule. Track 2 adds a row for grief-chat 2-beat; no rewrite.

---

## 8. Final recommendation

**SHIP, with the five Review-D tightenings as blockers and the five Review-C additions as nullable schema.**

### 8.1 First-week engineering plan

**Day 1-2 — Schema + migrations (additive)**
- Alembic: add 12 MUST-HAVE columns + `principle_version_id` + `tradition_specificity` + nullable `channel_coverage`, `spoken_rewrite`, `pronunciation_ipa` to `wisdom_asset` table
- Alembic: create `conversation_memory` table (declared-empty)
- Alembic: add `selector_trace_json` column to existing `mitra_decision_log`

**Day 3 — Pass A script**
- Auto-derive ~85% of MUST-HAVE fields via heuristic (authority_rank, max_char_fits, tradition_naming_allowed, beginner_safe, drill_down_only, channel_coverage, coarse context_fit_tags)

**Day 4 — Selector core**
- `pick_wisdom` in one file, ~350 LOC
- 6-stage pipeline, 3 hard-reject phrase families, 6-step relaxation ladder, DecisionTrace emission
- 10 test fixtures covering §5's three Track 1 surfaces × 3 modes + pool-exhaustion + fragile-surface stability

**Day 5 — Agent Pass B + Founder Pass C**
- Agent drafts tone_tags, path_intent_tags, emotional_weight refinement (Pass B)
- Founder bulk review: 127 snippets standalone_safe confirm/revoke (Pass C, blocker)
- Founder authors tradition_specificity on ~40 grief/loss rows (Pass C slice)
- Founder approves wrapper_copy for Track 1 Sanskrit terms (santosha, nishkāma, vairāgya if used)

**Day 6-7 — Track 1 integration**
- Joy Room opening + Growth Room anchor + Completion anchor call `pick_wisdom`
- ContentPack authored fallbacks landed (9 rows: 3 surfaces × 3 modes)
- CI gates: 12 invariants + reachability test (45 lookups × 3 modes)
- Founder smoke-test on dev; flip env flag `MITRA_V3_WISDOM_SELECTOR_ENABLED=1`

### 8.2 Go/no-go gate before cutover

All must be green:
- 330 selector_eligible rows have 12 MUST-HAVEs + `principle_version_id` + `tradition_specificity` (where required)
- 127 snippets founder-reviewed for standalone_safe
- 45 reachability lookups all return ≥1 candidate
- 12 hard invariants have passing CI tests
- Wrapper copy for Track 1 Sanskrit terms founder-authored
- `snippet_ratio_per_context_family` live-metric plumbed

---

## 9. Strongest design decisions (what survives from Agents 1-7)

1. **Interaction-type abstraction (Agent 3).** 5 in V1, extensible to 15+. Survives chat, voice, notifications.
2. **Pure deterministic selector (Agent 7).** Memory passed in; null-safe; always-emits trace. Testable, replayable.
3. **Quiet_ack != visible_reply (Agents 2+3).** Grief/loneliness/joy text inputs locked to ContentPack quiet_ack — prevents single most common fail.
4. **Fragile-surface stability inversion (Agent 6 R4).** Repeat-preferred on grief opening is mature design.
5. **Three-tier authority with application hard-gated off first_read (Agent 1 R3).** Prevents metaphysical-overreach.
6. **Bhakti as explicit bridge family (Agents 1, 5).** Theologically honest (karuna/sat-sanga), not a hack.
7. **Deterministic tiebreak with alphabetical final (Agent 7).** Ends non-determinism; enables replay.
8. **Normalized 12-field asset schema (Agent 4).** Pass A auto-derives 85%; founder authors the 15%.
9. **6-step relaxation ladder + ContentPack fallback (Agent 6).** Pool-undersizing becomes observable, not silent failure.
10. **Single DecisionTrace JSON column (Agent 7 + Review B merge).** No new table; existing celery path.

---

## 10. What must change (from reviewer feedback)

1. `room_fit_tags` → **`context_fit_tags`** everywhere (Review A).
2. Every asset carries **`principle_version_id`**; DecisionTrace records it (Review A).
3. **RelationshipThread minimally as `thread_id` field on memory** (Review A); V1 = session_id.
4. **ResponseAssembly / ResponsePart declared** in V1 schema, single-part default (Review C).
5. **ConversationMemory table declared-empty** in V1 with reserved fields (Review C).
6. **`channel_coverage` column** on every asset, script-derived (Review C).
7. **`spoken_rewrite` nullable** on Track 1 `tradition_naming_allowed=true` principles (Review C).
8. **R11a inverted** — prefer principle over snippet on reflective_prompt (Review D).
9. **Completion family-bias is law, not preference** — invariant #8 (Review D).
10. **`tradition_specificity` to Pass C** on ~40 grief/loss rows, not Pass D (Review D).
11. **Snippet standalone_safe HARD-BLOCKED pending Pass C** — cutover gate (Review D).
12. **Founder-only Sanskrit wrapper authoring** — CI gate (Review D).
13. **Scope collapsed:** 10 asset types → 5 interaction types; 14 stages → 6; 20 tone rules → 3; full 430 Pass B → 330 selector-eligible (Review B).
14. **Single JSON column** for DecisionTrace, not a new table (Review B).
15. **Drop `emotional_weight` / `repeat_tolerance` scale reconciliation** for V1 (Review B).

---

## 11. Minimum viable Track 0.5 (engineerable next week)

- [ ] One file: `kalpx/core/wisdom/selector.py` (~350 LOC)
- [ ] One pipeline: filter → sort → tiebreak → truncate → wrap → trace
- [ ] 12 MUST-HAVE + 2 integrity-required + 3 nullable-extension columns on `wisdom_asset`
- [ ] 330 rows populated (auto-derived Pass A + agent Pass B + founder Pass C)
- [ ] 3 hard-reject phrase families
- [ ] 12 hard invariants with CI gates
- [ ] 6-step relaxation ladder with telemetry
- [ ] DecisionTrace single JSON column on MitraDecisionLog
- [ ] `ConversationMemory` table declared-empty
- [ ] `ResponseAssembly/ResponsePart` schema declared, single-part default
- [ ] `channel_coverage` script-derived
- [ ] 10 test fixtures, 45 reachability lookups
- [ ] 3 Track 1 integrations (Joy Room, Growth anchor, Completion anchor)
- [ ] 9 ContentPack fallback rows authored
- [ ] 1 env flag: `MITRA_V3_WISDOM_SELECTOR_ENABLED`
- [ ] 1 metric: `snippet_ratio_per_context_family`

---

## 12. Future-ready Track 0.5 (the full vision, multi-phase)

**Phase 2 (Track 2 chat):** 10 more interaction types (inquiry_prompt, pre_practice_frame, post_practice_reflection, return_line, etc.); ResponseAssembly multi-part; ConversationMemory lit up (thread_id diverges from session_id; summary_buffer populated by turn 30); `continuation_marker` values beyond `closed`; R7/R8 conversation freshness rules.

**Phase 3 (Track 2 voice):** `listen_silence` as interaction type 16; `spoken_rewrite` + `pronunciation_ipa` authored on Tier 1 tradition-named principles; `prosody_hints` + pause grammar; silence-tolerance per context; barge-in policy; voice completion anchors.

**Phase 4 (Notifications + morning briefing + evening reflection):** `ambient_beat` interaction type; `notification_ack_mode` downgrade in grief-state; daily digest composition rule.

**Phase 5 (Self-learning):** `AssetLifetimeServeCount` over-familiarity mechanic; variant rotation via `variant_group_id`; snippet promotion path; agent-suggested-founder-approved authoring workflow.

**Phase 6 (Full wisdom-as-continuity):** `RelationshipThread` as first-class object (not field); `UserReadinessProfile` as continuous per-term readiness, not L0..L4 bucket; `principle_version_id` drives content-edit replay for founder-audit.

Every phase adds rows, nullable fields, or values-on-enums. None rewrites V1.

---

## 13. Open questions — ALL LOCKED 2026-04-18

See `WISDOM_FOUNDER_DECISIONS_LOG_2026_04_18.md` for the full decisions record and applied Pass C CSV.

1. **Completion family map — LOCKED HARD LAW.** mantra → gita only; sankalp → yoga_sutras only; practice → ayurveda + dinacharya only. Cross-variant contamination fallback: **NO**. Enforced in `selector.py` invariant #8 with no specificity override.
2. **Snippet Pass C — COMPLETE.** 127 snippets decided: 52 `yes` (LIKELY_SAFE bulk, post-cutover spot-audit), 57 `drill_down_only` (aphoristic/poetic_short), 16 `wrapper_required` (unglossed Sanskrit), 2 `unsafe` (banned-word drift: `wis.courage_to_release`, `wis.gratitude_opens_eyes`). Explicit founder-named rows honored.
3. **Tradition_specificity — DECIDED.** Packet 2 Section A 8 rows explicit + Section B 38 action-coded sweep = 46 grief/loss decisions. 4 `SPLIT_VARIANT` rows kept with grief context; sub-variants to author post-V1.
4. **Sanskrit wrapper copy — AUTHORED.** 5 Track 1 blockers (nishkāma karma, vairāgya, santosha, sat-sanga, karuna) + 5 non-blockers (phala, swadharma, abhyāsa, viveka, sankalpa) founder-authored. Applied to `wrapper_copy` column on 12 principles.
5. **Bhakti bridge scope — LOCKED.** Allow into Joy Room (in addition to grief + loneliness). Gently — weight filter still applies. Bhakti exempt from session-tradition lock when context ∈ {grief_room, loneliness_room, joy_room}.
6. **Session boundary — LOCKED.** 30-minute idle. Redis TTL=30min on `session:{id}:bound_tradition:*`.
7. **Hybrid mode naming budget — LOCKED.** Per session, not per surface. `session:{id}:tradition_named_count` Redis counter, cap=1 per session.
8. **Guidance mode downgrade — LOCKED.** Silent rooted → hybrid → universal downgrade allowed. `_render_with_truncation` auto-downgrades, emits `relaxation_step_applied`.
9. **User readiness L0-L4 — LOCKED.** Proposed defaults: `days_since_start < 7 → L0; < 30 → L1; < 90 → L2; < 180 → L3; ≥ 180 → L4`.
10. **Application-tier threshold — LOCKED.** L4 + explicit opt-in (conservative). Filter stage 3: application-tier rows require `user_readiness_level='L4' AND user.settings.application_tier_opt_in=true`.

**All founder blockers cleared. Engineering Day 1 (migrations 0111-0117) is GO.**

---

**End of contract. V1 scope locked. Cutover gate is §8.2.**
