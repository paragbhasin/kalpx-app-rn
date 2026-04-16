# Mitra Orchestration Contract v1.0

**Status:** Locked (2026-04-14), Phase A1.
**Predecessor:** `docs/CONTENT_CONTRACT_V1.md` (Phase A0) — schema + variants + CI gates.
**Successor:** Phase B scaffold — implement this contract in `kalpx/core/content/`.

This contract defines how a single function — `content_orchestrator.resolve()` —
turns `(moment_id, context)` into a `MomentPayload` (or a deterministic
null-safe fallback) at request time. It covers the request lifecycle, the
10-step pipeline, triad-authority enforcement, null-safety behavior,
decision logging, and the pilot migration sequence.

**Non-goal:** authoring tools, variant rotation policy, self-learning weight
updates. These are Phase D+ concerns.

---

## 0. Scope and boundaries

### In scope (v1)
- Resolving `MomentPayload` for the 47 moments in the Sadhana Yatra framework.
- Resolving `ChipTreePayload`, `NotificationPayload`, `AudioPayload` via the same pipeline skeleton (delegated to family-specific resolvers).
- Mode downgrade (`rooted → hybrid → universal`).
- Locale downgrade per `Declaration.locale_fallback_chain`.
- Emotional-weight guard (refuse light-tone variants when weight≥heavy).
- Shadow-write `MitraDecisionLog` gated by `MITRA_V3_DECISION_LOG_WRITE`.
- Triad-authority enforcement (`TriadReadonlyView` throughout).

### Out of scope (v1)
- Variant A/B traffic split (Phase D).
- Self-learning feedback loop (Phase D, `mitra_v3_self_learning_s1_schema.md`).
- Authoring UI / agent drafter-auditor pipeline (Phase E).
- Cross-moment narrative continuity enforcement (flagged via `sibling_content_coupling`, not enforced).

---

## 1. Public API

```python
# kalpx/core/content/orchestrator.py

def resolve(
    moment_id: str,
    ctx: MomentContentContext,
    *,
    request_id: str,
) -> MomentPayload:
    """
    Fail-closed, null-safe resolver for any of the 47 Sadhana Yatra moments.
    Never raises. Always returns a MomentPayload where every declared slot is
    at minimum the empty string "".
    """
```

### Inputs
- `moment_id: str` — stable id, e.g. `M07_recognition`, `M17_mantra_runner`.
- `ctx: MomentContentContext` — per Content Contract §2. Built by caller (view layer) from JourneyContext + today signals + guidance_mode + locale.
- `request_id: str` — caller-supplied, propagated to `MitraDecisionLog.audit_id`.

### Outputs
- `MomentPayload` — per Content Contract §5. Always returned; callers never need try/except.

### Side effects
- One `MitraDecisionLog` row written when `MITRA_V3_DECISION_LOG_WRITE=1`.
- Cache hits/misses incremented via `statsd` counters (non-blocking).
- No DB writes other than the decision log.

---

## 2. Data shapes (frozen v1)

```python
@dataclass(frozen=True)
class TriadReadonlyView:
    cycle_id: str
    life_kosha: str
    life_klesha: str | None
    life_vritti: str | None
    life_goal: str | None
    scan_focus: str
    # No setters. No .copy_with(). Constructed once per cycle by triad_selector.

@dataclass
class MomentContentContext:
    moment_id: str
    path: Literal["support", "growth", "both"]
    stage_signals: dict[str, str]              # kosha/klesha/vritti/aliveness/aspiration/modality
    life_layer: TriadReadonlyView               # read-only, read-only, read-only
    today_layer: dict[str, str]                 # today_kosha/today_vritti/today_klesha/today_modality
    cycle_day: int
    entered_via: str                            # "joy_path" | "deficit_path" | "trigger" | "dashboard_card" | …
    guidance_mode: Literal["universal", "hybrid", "rooted"]
    locale: str                                 # "en" | "hi" | "sa"
    user_attention_state: str                   # REQUIRED. Copied from PresentationContext at call time.
    emotional_weight: Literal["light","moderate","heavy","maximum"]

@dataclass
class MomentPayload:
    moment_id: str
    slots: dict[str, str]                       # NEVER None; empty string minimum
    meta: PayloadMeta
    presentation_hints: dict[str, Any] | None   # None if no hints

@dataclass
class PayloadMeta:
    variant_id: str                             # "" if pure fallback
    mode_served: Literal["universal","hybrid","rooted","fallback"]
    locale_served: str                          # "en" if downgraded
    fallback_used: bool
    fallback_reason: str | None                 # "registry_miss" | "weight_guard" | "sovereignty_fallback" | …
    audit_id: str
    resolved_in_ms: int
```

---

## 3. The 10-step pipeline (fail-closed)

Every step has a **defined fall-through** on failure. No step ever raises
past its boundary. Each step's failure advances to the next step with
`fallback_used=True` and an explicit `fallback_reason`.

| Step | Name | Happy-path output | On failure |
|---|---|---|---|
| 1 | `load_declaration` | `MomentDeclaration` object | goto step 10 with `registry_miss` |
| 2 | `validate_ctx` | ctx enriched w/ defaults | on schema fail, goto step 10 with `ctx_invalid` |
| 3 | `enforce_triad_readonly` | ctx confirmed to carry `TriadReadonlyView` | on any mutation attempt, raise `TriadMutationError` (fail loud — design bug) |
| 4 | `build_presentation_context` | merged declared + auto-derived fields | on missing required manual field → goto step 10 with `pctx_incomplete` |
| 5 | `query_registry` | ordered list of candidate variants | empty list → step 6 handles |
| 6 | `apply_emotional_weight_guard` | candidates filtered to allowed tones | if candidates empty after filter, fall into step 7 |
| 7 | `apply_mode_downgrade` | candidates filtered by mode (rooted→hybrid→universal) | if empty, step 8 |
| 8 | `apply_locale_downgrade` | candidates filtered by locale chain | if empty, step 9 |
| 9 | `select_best_by_status` | single variant (approved > variant_candidate > agent_audited > draft-never-served) | if no `approved/agent_audited`, advance to step 10 with `no_approved_variant` |
| 10 | `emit_fallback_payload` | deterministic null-safe payload | always succeeds |

### Per-step contracts

**Step 1 — `load_declaration(moment_id) -> MomentDeclaration | None`**
- Read from in-memory registry (loaded at process start from YAML).
- Cache miss → return `None` (no I/O in hot path).
- Registry key is `(moment_id, moment_family)` where family ∈ {`moment`, `chip_tree`, `notification`, `audio`}.

**Step 2 — `validate_ctx(ctx) -> ctx'`**
- Enforce required fields: `moment_id`, `path`, `guidance_mode`, `locale`, `user_attention_state`, `emotional_weight`.
- `user_attention_state` is REQUIRED per A0 finding (single highest-value field). Absent → fail-closed to fallback.
- Coerce missing optional fields to their schema defaults.
- Drop unknown keys (strict contract, permissive reader).

**Step 3 — `enforce_triad_readonly(ctx)`**
- Verify `ctx.life_layer` is a `TriadReadonlyView` instance, not a dict.
- Raise `TriadMutationError` if any code path downstream attempts attribute set — this is a design bug, not runtime recoverable. **Fail LOUD.**
- Rationale: triad is the stable per-cycle identity; guidance/support content must never mutate it. A0 walkthroughs confirmed no component writes to life_kosha/life_klesha; this invariant must be enforced at the type system + runtime.

**Step 4 — `build_presentation_context(decl, ctx) -> PresentationContext`**
- Merge `decl.presentation` (manual fields) with auto-derived fields loaded at build-time from FE inspection (stored alongside YAML per moment).
- If any required manual field missing → `pctx_incomplete` fallback.
- Since A0 measured 67% auto-derive coverage, assume **manual declaration is the normal case** — orchestrator treats auto-fields as an enrichment, not the primary source.

**Step 5 — `query_registry(decl, ctx) -> list[Variant]`**
- Lookup: `registry[moment_id].variants` where each variant has an `applies_when` dict.
- Return variants whose `applies_when` is a (non-strict) subset of `ctx.stage_signals ∪ ctx.today_layer ∪ {entered_via, path, guidance_mode, locale}`.
- Ordering: deterministic (stable sort by `(status_rank, applies_when_specificity, variant_id)`).

**Step 6 — `apply_emotional_weight_guard(candidates, ctx) -> list[Variant]`**
- If `ctx.emotional_weight == "maximum"`: filter out variants whose `tone_tags` include `celebration`, `play`, `light_touch`, `cheer`, `exclamation`.
- If `"heavy"`: filter out `celebration`, `cheer`.
- If `"moderate"`: no filter.
- If `"light"`: no filter (celebration permitted).
- Empty post-filter + weight≥heavy → advance with `fallback_reason="weight_guard"` (fallback is safer than serving wrong tone).

**Step 7 — `apply_mode_downgrade(candidates, ctx)`**
- Try `mode=ctx.guidance_mode` first.
- If empty, descend `rooted → hybrid → universal`.
- `universal` is required to exist for every moment per coverage validator (§8 CI gate) — if missing, step 10.

**Step 8 — `apply_locale_downgrade(candidates, decl, ctx)`**
- Try `ctx.locale`, then each locale in `decl.locale_fallback_chain`.
- `en` must exist for every moment.

**Step 9 — `select_best_by_status(candidates)`**
- Rank: `approved > variant_candidate > agent_audited > draft`.
- `draft` is NEVER served in production. If only `draft` exists, advance to step 10.
- `variant_candidate` served only when `MITRA_V3_VARIANT_AB_ENABLED=1` AND user falls in A/B bucket (Phase D — orchestrator hook in place, selection disabled in v1).

**Step 10 — `emit_fallback_payload(moment_id, ctx, reason) -> MomentPayload`**
- Deterministic empty-slot payload:
  - `slots`: every slot declared in `MomentDeclaration` present as `""`.
  - `meta.variant_id = ""`, `mode_served = "fallback"`, `locale_served = "en"`, `fallback_used = True`, `fallback_reason = reason`.
  - `presentation_hints = None`.
- If declaration itself was not loaded (step 1 miss), emit payload with `slots={}` and `moment_id=moment_id`.
- CI gate `fallback_exhaustion_test` verifies this step returns a valid `MomentPayload` for every moment × every reason.

---

## 4. Null-safety contract (locked)

**Rule 1 — Every declared slot is always at minimum `""`.**
Never `None`. Never missing. Callers do `payload.slots["emphasized_line"]` without guards.

**Rule 2 — `meta` is always fully populated.**
Even on total failure, `meta` is a complete `PayloadMeta` with defaults (`variant_id=""`, `mode_served="fallback"`, `fallback_used=True`).

**Rule 3 — `presentation_hints` may be `None`.**
FE ignores if `None`. This is the ONE field that may be absent.

**Rule 4 — Empty slot is visible.**
When a slot is `""`, FE renders nothing (no placeholder text). The render appears "short" but never crashes. Surfaced via telemetry: `fallback_used=True` in MitraDecisionLog.

**Rule 5 — No string `None`.**
Type-check: `assert all(isinstance(v, str) for v in payload.slots.values())` at the egress boundary.

---

## 5. Triad authority enforcement

From A0 walkthroughs, triad is stable per cycle and must not be mutated by any content resolution. v1 enforces this three ways:

1. **Type system:** `TriadReadonlyView` is `@dataclass(frozen=True)`. Any `.x = y` raises `FrozenInstanceError`.
2. **Runtime check (step 3):** `enforce_triad_readonly(ctx)` verifies the instance type before the pipeline runs.
3. **CI gate:** `triad_authority_check` — static analysis ensures `orchestrator.py` and every resolver it calls import `TriadReadonlyView` (not `JourneyContext` or dict-based triad shapes).

Violation = build fails. This is intentionally draconian: a single mutation path that leaks into production breaks cycle identity across all 47 moments.

---

## 6. Visual-fit fallback rule (A0 finding #4)

**The problem:** `max_lines` and line-length caps are NOT reliably auto-derivable from RN `<Text>` styles because component height is content-driven (no fixed container heights in 4/6 walkthroughs).

**The rule:**
1. **Preferred:** author declares `slots[slot_name].max_chars` and `.max_lines` manually in `ContentPack`. Orchestrator validates at ingest time, not resolve time.
2. **Fallback when undeclared:** apply these defaults by `emphasis_hierarchy`:

| emphasis_hierarchy | max_chars | max_lines |
|---|---|---|
| `label` | 20 | 1 |
| `emphasized` | 90 | 2 |
| `body` | 140 | 3 |
| `caption` | 60 | 2 |
| `cta` | 20 | 1 |
| `placeholder` | 40 | 1 |
| `helper` | 80 | 2 |
| `ack` | 60 | 2 |

3. **Additional cap by `user_attention_state`:**

| user_attention_state | hard max_chars cap for primary slot |
|---|---|
| `focused_receiving` | 90 |
| `scanning` | 60 |
| `meditative_single_pointed` | 0 English (Sanskrit-only) |
| `reflective_exposed` | 220 |
| `grieving_shut_down` | 60 per beat |
| `winding_down` | 40 |

4. **Quality validator (CI gate):** reject any variant whose slot text exceeds the min of declared + defaults. Content rejection happens at author time, not runtime — resolver NEVER trims.

5. **No runtime truncation.** If a variant slips through and overflows visually, telemetry captures via a client-side render-line-count ping (Phase D). For v1, author discipline + CI is the enforcement.

---

## 7. Decision logging (shadow-write)

Every `resolve()` call writes one `MitraDecisionLog` row when `MITRA_V3_DECISION_LOG_WRITE=1`. Schema already shipped in `0104_sadhana_yatra_context_decision_log`.

Row fields:
- `audit_id` (PK, = request_id)
- `cycle_id` (from `ctx.life_layer.cycle_id`)
- `cycle_day`
- `moment_id`
- `user_attention_state`
- `emotional_weight`
- `path`, `entered_via`
- `today_kosha`, `today_vritti`, `today_klesha`, `today_modality`
- `variant_id`, `mode_served`, `locale_served`
- `fallback_used`, `fallback_reason`
- `resolved_in_ms`
- `context_hash` (stable hash of ctx, for idempotency check)
- `created_at`

Write is **async / non-blocking** (celery task). Logger failure never affects the response. Dropping a log row is preferable to failing a resolve.

---

## 8. Pilot migration sequence (post-scaffold)

A0 found 3 sovereignty violators. Phase B ships the scaffold; phases below migrate **only these 3 moments** before any broader rollout. This proves the full contract end-to-end with minimum blast radius.

### Pilot order (locked)
1. **M35 evening_reflection** — worst offender. Simplest surface (one block, one flow). Proves: basic slot resolution, mode/locale downgrade, null-safe ack, sovereignty_check CI gate.
2. **M46 grief_room** — highest emotional stakes. Proves: emotional_weight guard, silence_tolerance_sec as hint, fallback discipline (every fallback user-sees matters here).
3. **M24 checkpoint_day_7** — compound moment (intro → body → ack). Proves: compound_moment_sequence, decision_reversibility gating, long-form narrative variant routing.

### Pilot success criteria (5 proofs, all required before expansion)

1. **Payload shape proof** — For every (mode × locale × weight) combination on the 3 pilots, orchestrator returns a payload that type-checks as `MomentPayload` AND every declared slot is a non-None string.
2. **Registry resolution proof** — Approved variants correctly routed; drafts never served; variant_candidates correctly gated behind `MITRA_V3_VARIANT_AB_ENABLED`.
3. **Downgrade behavior proof** — With `rooted` variant absent, pipeline serves `hybrid`, logs `fallback_used=True, mode_served="hybrid"`. With locale `hi` absent, serves `en`. No crash at any step.
4. **Decision logging proof** — 100% of resolves produce exactly one `MitraDecisionLog` row. Log drop rate < 0.1% under load. Schema fields all populated.
5. **No triad mutation proof** — Static analysis pass (grep) finds zero writes to any field of `TriadReadonlyView` in orchestrator + pilot resolvers. Runtime: unit test asserts `FrozenInstanceError` on attempted mutation.

All 5 green → expand to Tier B (dashboard chrome) and Tier C (onboarding recognition) per Content Contract §10.

---

## 9. Performance budget (v1)

- `resolve()` p50 ≤ 3ms, p99 ≤ 15ms (registry is in-memory; no DB in hot path).
- Registry load at process start: ≤ 500ms for all 47 moments.
- Decision log celery task: fire-and-forget; backlog not allowed to grow unbounded (drop after 10k queued).

---

## 10. Failure modes and observability

| Failure | Where caught | User-visible effect | Telemetry signal |
|---|---|---|---|
| Registry miss for `moment_id` | step 1 | Empty slots rendered | `fallback_reason="registry_miss"` |
| Required ctx field missing | step 2 | Empty slots rendered | `fallback_reason="ctx_invalid"` + field name |
| Triad mutation attempt | step 3 | **500 to client (intentional)** | `TriadMutationError` raised; pager |
| PresentationContext required field missing | step 4 | Empty slots rendered | `fallback_reason="pctx_incomplete"` |
| Weight guard filters all | step 6 | Empty slots (safer than wrong tone) | `fallback_reason="weight_guard"` |
| No approved variant | step 9 | Empty slots rendered | `fallback_reason="no_approved_variant"` |
| Decision log write drop | async writer | None | `statsd: mitra.decision_log.drop` |

Dashboards (Phase B implementation):
- `mitra.orchestrator.p50/p99` latency
- `mitra.orchestrator.fallback_rate` by moment_id (alert when > 5% for any approved moment)
- `mitra.orchestrator.mode_downgrade_rate` (signals missing `rooted` variants)
- `mitra.orchestrator.locale_downgrade_rate` (signals missing locale coverage)

---

# Appendix A — A1 Non-Negotiables from A0 Findings

These five rules are derived directly from the 6-moment walkthrough and
override any convenience that contradicts them.

## A.1 Manual-vs-Auto derivation rule

**A0 measured: 67% auto-derivable.** Manual declaration is the norm, not the exception.

- Orchestrator treats `PresentationContext.auto_fields` as enrichment, not primary source.
- If an auto-field is missing, orchestrator does NOT block; it proceeds with declared fields only.
- If a REQUIRED MANUAL field is missing, orchestrator DOES fail-closed (step 4 → step 10 with `pctx_incomplete`).
- CI gate `coverage_validator` treats every moment as requiring all 12 manual fields and only the 10 auto-fields that can be reliably derived for that surface class (`passive_block`, `composed_container`, `immersive`, `compound_block`, `ritual_room`, `form_block`).

## A.2 Sovereignty-violation handling

**A0 identified 3 violators: M35, M46, M24.** These are **Pilot Migration targets** — called out in §8, not buried.

- Until a violator is migrated, orchestrator returns a payload whose slots remain empty `""` and FE silently falls back to its TSX-embedded string. This is accepted grandfathering.
- CI gate `content_sovereignty_check` will fail the build on any NEW block that ships TSX-embedded strings without a MomentDeclaration.
- Migration gate: no new moments ship after M24 pilot completes unless their sovereignty is clean at merge time.

## A.3 Visual-fit fallback rule

**A0 found:** `max_lines` is not reliably auto-derivable.

- Preferred: manual declaration in ContentPack.
- Fallback: `emphasis_hierarchy` default table (§6) + `user_attention_state` hard cap (§6).
- Quality validator enforces at ingest, not resolve. Orchestrator never truncates.
- If author ships content exceeding caps and somehow passes CI (shouldn't), render will visually overflow; Phase D captures this via client-side line-count telemetry.

## A.4 Null-safe payload behavior (REQUIRED)

**A0 found:** 3 blocks have TSX fallbacks hiding missing backend content.

- Every declared slot = empty string minimum.
- Every `meta` = fully populated (no partial meta objects).
- `presentation_hints` is the only optional field.
- `assert isinstance(v, str) for v in payload.slots.values()` at egress.
- When orchestrator returns empty slots, FE renders nothing (NOT a TSX fallback string). This makes missing content visible in QA and telemetry.

## A.5 Triad authority enforcement

**A0 confirmed:** No walkthrough component writes to life_kosha / life_klesha. The invariant must be codified.

- `TriadReadonlyView` is `frozen=True`. Mutations raise `FrozenInstanceError`.
- Step 3 of pipeline type-checks the view.
- `triad_authority_check` CI gate: static analysis verifies `orchestrator.py` + every resolver imports `TriadReadonlyView` only.
- Any future refactor that introduces a mutable triad shape fails CI loudly.
- This is an architectural invariant, not a convention. Violation = build fails.

---

# Appendix B — Post-A1 sequencing (locked)

1. **Phase B — Scaffold**
   - Implement `kalpx/core/content/orchestrator.py` per §1-§3.
   - Implement `TriadReadonlyView`, `MomentPayload`, `PayloadMeta` dataclasses.
   - Implement in-memory registry loader.
   - Wire 5 CI gates from Content Contract §8 + `triad_authority_check`.
   - No moment migrations yet. All existing endpoints keep current behavior.

2. **Phase C — Pilot 3 moments**
   - Migrate M35 → M46 → M24 in that order.
   - Each migration: remove TSX fallback, add MomentDeclaration, author approved variants for (universal × en) at minimum, verify all 5 pilot success criteria (§8).
   - STOP after M24 until all 5 proofs green on production.

3. **Phase D — Expansion**
   - Tier B: dashboard chrome (M08 `status_messages`, missing embeds).
   - Tier C: onboarding recognition (18+ sections of `onboarding_recognition_slots.yaml` → approved).
   - Add remaining 44 moments via MomentDeclaration; no TSX content allowed from this point forward.

4. **Phase E — Self-learning integration**
   - Kick `MITRA_V3_DECISION_LOG_WRITE=1` in production.
   - Build the 4-layer bounded feedback loop per `mitra_v3_self_learning_framework.md`.
   - Promote `variant_candidate → approved` by material-gain criteria.

Each phase gate requires: telemetry clean, fallback rate < 5% for approved moments, p99 < 15ms, zero triad mutation incidents.
