# Mitra v3 — Session 2026-04-14 complete reference

This document captures **everything done in the 2026-04-14 session** and
the **algorithm specs** for the key decision flows that span onboarding,
the full journey, and the cycle phases. It is the authoritative
session-close artifact.

---

## Part 1 — What this session shipped

### Commits (backend — kalpx, branch `mitra-v3-sadhana-yatra`)

Earlier session (onboarding fixes):
```
966d0787  feat(content_loader): CSV-backed stage-flow chip loader with caching
5666d9b0  feat(api): /onboarding/chips/ per-turn chip delivery
301ec2c8  fix(inference): chip_id → full_label translator for 4 stages
caf1f55c  test: onboarding_chips endpoint coverage
f8c4b020  test: chip_id resolution end-to-end (stages 1-3, support + growth)
```

Phase B — orchestration scaffold:
```
9d261412  feat(content): Phase B orchestration scaffold (~1967 LOC)
```

Phase C — pilot trio + Tier 1 wave 1:
```
22650b34  feat(content): Phase C M35 pilot — evening_reflection
a0db242d  fix(content): plumb authenticated user_id into resolve ctx
8065bf49  fix(content): coerce cycle_id to UUID for decision_log rows
d045dc0d  chore(content): TEMP diagnostic logging for stop-gate 4
d50a79ae  fix(content): use kalpx Celery app (not current_app)
6b3e9488  fix(content): route decision_log to celery default queue
ffbe2d40  chore(content): demote diagnostic logs after stop-gate 4 green
51044103  feat(content): M35 migration COMPLETE — exemption removed
3b5bd54e  feat(content): Phase C M46 pilot — grief_room
3412102e  feat(content): M46 migration COMPLETE — exemption removed
6f9cd0c1  feat(content): Phase C M24 pilot — checkpoint_day_7
20a81cdd  feat(content): M24 migration COMPLETE — manifest now empty
141b35c5  feat(content): Tier 1 batch expansion — M47 loneliness_room
```

Tier 1 waves 2–4 (batch expansion):
```
628cd3b2  feat(content): Tier 1 batch wave 2 — 10 moments (+82 tests)
3d0fd2a4  feat(content): Tier 1 batch wave 3 — +5 moments
6c4f9c56  feat(content): Tier 1 batch wave 4 — 50% MILESTONE
```

Phase E — variant rotation + self-learning + Wave 5:
```
51e6095f  feat(content): Phase E — multi-variant rotation via applies_when specificity
3f4bbba7  feat(content): Phase E — self-learning read utilities + variant rename
aebbab0d  feat(content): Tier 1 batch wave 5 — 87% coverage
```

Phase F partial:
```
ce5e1698  feat(content): close residual non-onboarding moments — 4 ContentPacks
a9ff4f05  feat(content): MitraDecisionLog.user → nullable (migration 0106)
55432921  chore(content): align M18/M36/M37 YAMLs with block copy for Phase F TSX
```

### Commits (FE — kalpx-app-rn, branch `sadhana-yatra-onboarding`)

```
4306683  feat(content): Phase A0/A1 contract docs + M35 pilot TSX migration
70b2bc6  feat(content): wire EveningReflectionBlock to M35 resolver endpoint
5440b5c  feat(deeplink): kalpx://mitra/<container>/<state> handler
3eff4d5  feat(content): Phase C M46 pilot TSX — grief_room
df9407d  feat(content): Phase C M24 pilot TSX — checkpoint_day_7
62797dc  feat(content): Tier 1 — M47 loneliness_room TSX
c06cc34  feat(content): Phase D — useContentSlots shared hook
0504590  feat(content): Phase D batch A — 3 reflection/checkpoint blocks
3319738  feat(content): Phase D batch B — 8 dashboard cards / embeds
b831430  feat(content): Phase D batch C — 5 overlay/sheet blocks
ee58609  feat(content): Phase D batch D — 3 checkin/transient blocks
db4d39d  feat(content): Phase E — eliminate 2 multi-variant TSX grandfathering
7c5da5e  feat(content): Phase F wave-5 TSX — 4 more blocks wired (M17/M18/M36/M37)
```

### Phase arc summary

| Phase | Goal | State |
|---|---|---|
| A0 | Content Contract v1 | Locked |
| A1 | Orchestration Contract v1 | Locked |
| B | Scaffold + 6 CI gates | Shipped |
| C | Pilot trio (M35/M46/M24) | Complete + sim-verified |
| D | FE consolidation hook | 20 blocks wired |
| E | Variant rotation + self-learning reads | Shipped |
| F | Residual + FK migration + wave-5 TSX | Partial (rooted/Hi deferred) |

### Numbers

- **Tests:** 381 passing locally across 13 test files.
- **Moment coverage:** 45/47 = **96%** of Sadhana Yatra framework.
- **TSX blocks wired to registry:** 28 (Phase C pilots + Tier 1 + Phase D batches + Phase F partial).
- **Sovereignty manifest:** empty — zero grandfathering.
- **CI gates:** 6 wired (sovereignty, coverage, quality, fallback_exhaustion, chip_id_stability, triad_authority).
- **Dev deploys:** 9 rolling deploys with stop-gate verification per phase.

---

## Part 2 — Onboarding end-to-end

### Turn-by-turn flow (v1.2.0 API contract)

```
Client                              Backend
──────                              ───────
Launch app (authed)
                     ── POST /journey/start ─▶
                                        (loads JourneyContext,
                                         returns triad + bridges + chrome)
Show Turn 1 greet ◀──────

Tap reply chip
                     ── GET /onboarding/chips/?stage=1&lane=<support|growth>
                        ──▶
                                        (normalize chip_id → full label,
                                         look up kosha/aliveness mapping)
                          ◀── { stage, lane, mitra_message, sub_prompt,
                                chips[], open_input, mapping_version }

Show Stage 1 chips (5 support / 6 growth)

Tap chip OR freeform
                     ── GET /onboarding/chips/?stage=2
                        &stage1_choice=<id> ──▶
                                        (keyed by lane+stage1)
                          ◀── same shape, stage=2

Tap chip → Stage 3
                     ── GET /onboarding/chips/?stage=3
                        &stage1_choice&stage2_choice ──▶
                          ◀── same shape, stage=3

Tap chip → Turn 6 (mode pick: universal / hybrid / rooted)
                     ── POST /onboarding/complete/ ──▶
                        { stage0..stage3 choices, mode, locale, freeforms }

                                        (infer_mitra_state →
                                         compose_support_recognition or
                                         compose_growth_recognition →
                                         resolve_triad_labels →
                                         persist JourneyContext fields)
                          ◀── { recognition_line, resolution,
                                bridges, stage_subtexts, triad_labels,
                                triad: {mantra, sankalp, practice},
                                journey, dashboard_chrome }

Show Turn 7 Recognition (M07)
Tap reply chip → Turn 8 Triad reveal (M_turn_8)
                     ── GET /journey/companion/ ──▶
                          ◀── dashboard payload
Show dashboard (M08)
```

### Key endpoints landed this session

| Endpoint | Purpose | Gate flag |
|---|---|---|
| `GET /api/mitra/onboarding/chips/` | Per-turn chips for Stages 1/2/3 | always on |
| `POST /api/mitra/onboarding/complete/` | 4-stage inference + compose recognition + triad | always on |
| `POST /api/mitra/content/moments/<id>/resolve/` | **NEW** content registry resolver | `MITRA_V3_CONTENT_RESOLVE_ENABLED=1` |

### Chip translator (stage_id ↔ slug ↔ full label)

`core/reasoning/onboarding_inference.py::normalize_choice()` maps
FE-friendly chip ids (`work`, `stuck`, `practical`) ↔ CSV slugs
(`work_feels_heavy`, `i_feel_stuck`, `something_practical`) ↔ display
labels. Committed bi-directional for all 4 stages (`301ec2c8`).

---

## Part 3 — Full journey structure

### Two temporal layers (architecture memory)

```
LIFE PHASE (stable, 14-day cycle)
    ├── scan_focus → life_kosha / life_klesha / life_goal
    └── drives TRIAD (mantra / sankalp / practice)

DAILY STATE (volatile, per session)
    ├── today_kosha / today_vritti / today_klesha  (support path)
    ├── today_aliveness / today_aspiration / today_modality  (growth)
    └── drives WHICH MOMENT to surface today

SYSTEM DECISION FUNCTION:
  f(life_layer, today_layer, mode, day_in_cycle) → moment_to_surface
```

### Cycle structure (14-day baseline, 7-day optional)

```
Day 1         → M_first_day briefing, triad introduced, life_kosha stated
Days 2-6      → Daily check-in. Klesha freq >> Vritti freq.
Day 7         → M24 weekly checkpoint. Review: did vritti arise at life_kosha?
                 ≥ 20% days: "Something is softening" → continue
                 <  20% days: "Still work. Stay with it" → reaffirm
Days 8-13     → Daily check-in. Vritti freq trending up.
Day 14        → M25 full cycle reflection.
                 vritti ≥ 40% at life_kosha → "Deepen" OR "Next kosha"
                 vritti <  40%              → "Another cycle here"
                 Mixed                      → "Continue with adjustment"
```

Five cycles (~70 days) = passage through all 5 koshas = one full
Sadhana Yatra arc.

### Daily loops

- **Morning** — M08 day_active dashboard; M_first_day (day 1 only);
  M41 focus_phrase; M_morning_briefing (optional audio).
- **Midday** — M20 quick_checkin if support path; M44 gratitude_joy if
  growth.
- **Any time** — M17/M18/M19 runners; M21 trigger_reflection;
  M46/M47 support rooms on klesha signals.
- **Evening** — M35 evening_reflection; M_daily_insight;
  M23 weekly_reflection (Sunday only).

---

## Part 4 — Algorithm specs for key flows

Each algorithm is listed with:
- **Current state** (IMPLEMENTED / PARTIAL / CONTRACTED)
- **Key file(s)**
- **Pseudocode highlights**
- **Invariants** (what must always hold)

---

### 4.1 — Triad generation (mantra / sankalp / practice)

**Current state:** PARTIAL. Onboarding-side inference is implemented
(`infer_mitra_state` + `compose_support_recognition` / `compose_growth_recognition`).
The **actual selector that picks a library item from the catalog** is
not yet re-plumbed in v3 — it lives in the legacy v2 journey flow
(`kalpx/core/journey_envelope.py` + library CSVs).

**Key files:**
- `kalpx/core/reasoning/onboarding_inference.py::infer_mitra_state`
- `kalpx/core/reasoning/diagnostics.py::compose_support_recognition`
- `kalpx/core/data_seed/mitra_v3/library_catalog_mantras.csv`
- `kalpx/core/data_seed/mitra_v3/library_catalog_sankalps.csv`
- `kalpx/core/data_seed/mitra_v3/library_catalog_practices.csv`

**Pseudocode:**
```python
def generate_triad(stage0, stage1, stage2, stage3, mode, locale):
    # Step 1 — full 4-stage inference
    state = infer_mitra_state(stage0, stage1, stage2, stage3)
    # state has: lane, life_context, primary_kosha, secondary_kosha,
    # vritti_candidates, klesha_candidates, support_style,
    # intervention_bias (merged), confidence (0..1)

    # Step 2 — scan_focus derivation
    scan_focus = derive_scan_focus(state.lane, state.life_context,
                                   state.primary_kosha, state.support_style)

    # Step 3 — library pick per item type
    # Each library item has tags: kosha[], klesha[], vritti[],
    # intervention[], mode_fit[], locale_fit[]
    # Candidate = item whose tags intersect ≥ N of
    # {primary_kosha, top_vritti, top_klesha} ∪ intervention_bias
    mantra = pick_highest_scoring(
        LIBRARY_MANTRAS,
        must_match_tags=[state.primary_kosha],
        prefer_tags=state.intervention_bias,
        locale=locale,
        mode=mode,
    )
    sankalp = pick_highest_scoring(LIBRARY_SANKALPS, ...)
    practice = pick_highest_scoring(LIBRARY_PRACTICES,
        duration_bias=state.support_style == "practical" ? longer : shorter)

    return Triad(mantra, sankalp, practice, scan_focus,
                 confidence=state.confidence)
```

**Invariants:**
- Triad is **stable per cycle** — `TriadReadonlyView` is frozen; selector
  runs only at cycle start or explicit reselection moment.
- Confidence < 0.4 → serve **lightweight fallback triad** (OM Namah
  Shivaya / sovereign sankalp / 9-breath practice) rather than
  over-commit to a shaky inference.
- EN corpus is thin (204 mantras / 393 sankalps / 273 practices) — if
  locale-specific pool is empty, downgrade to universal × en per the
  Orchestration Contract §3.

**Next step:** wire `/journey/start/` to the v3 inference + library
scoring. Currently journey/start still takes legacy v2 fields
(category/subCategory/level) and uses the old v2 selector. Mapper
proposed: `LIFE_CONTEXT_TO_CATEGORY` + `STAGE2_TO_SUBCATEGORY` +
`SUPPORT_STYLE_TO_LEVEL`.

---

### 4.2 — Reasoning (per-day moment selection)

**Current state:** PARTIAL. The onboarding recognition layer is
implemented. The **runtime "which moment to surface today"** decision
lives partly in:
- Dashboard container logic (RN, picks embeds based on screenData)
- Backend `companion-state` endpoint
- Backend `clear-window` / `predictive-alert` / `joy-signal` endpoints

**Contracted but not yet centralized:** a single `decide_moment()`
reasoning function that takes life_layer + today_layer + cycle_day
and returns the primary surface.

**Pseudocode (from architecture memory):**
```python
def decide_moment(user, today) -> MomentId:
    life   = user.current_cycle
    today  = today.diagnostic
    mode   = user.guidance_mode
    day    = today.cycle_day

    # Day-specific milestones override everything
    if day == 1:                    return "M_first_day"
    if day == 7:                    return "M24_checkpoint_day_7"
    if day == 14:                   return "M25_checkpoint_day_14"

    if today.path == "support":
        # Anandamaya + deep klesha → support room
        if today.kosha == "anandamaya" and today.klesha in ("asmita",
                                                             "abhinivesha"):
            return "M46_grief_room" if today.grief_signal else "M47_loneliness_room"
        # Adjustment day — honor today, not life
        if today.kosha != life.kosha:
            return "M_low_burden_day"  # or adjusted dashboard
        # Aligned → direct practice
        return "M08_day_active"

    if today.path == "growth":
        if today.aspiration == "more_devotion":  return "M08_day_active"  # w/ bhakti emphasis
        if today.aspiration == "more_depth":     return "M_deepen_sadhana"
        if today.aspiration == "more_purpose":   return "M_progress_summary"
        return "M08_day_active"  # growth default + M44 gratitude card

    # Mixed / uncertain
    return "M08_day_active"
```

**Invariants:**
- Anandamaya + asmita/abhinivesha deep klesha **always** routes to
  M46/M47 regardless of other signals. The architecture treats this
  as the single highest-override signal.
- Day-1/7/14 milestones supersede daily reasoning.
- Path mismatch between today and life (e.g., life=support but
  today=growth) → honor **today**'s signal, never force the life-path
  surface.

---

### 4.3 — Advice / support generation

**Current state:** IMPLEMENTED (via content registry since Phase C).

**Key files:**
- `kalpx/core/content/orchestrator.py::resolve()`
- `kalpx/core/content/registry.py`
- `kalpx/core/data_seed/mitra_v3/moments/*.yaml` (45 ContentPacks)

**Algorithm — 10-step fail-closed pipeline:**
```python
def resolve(moment_id, ctx, *, request_id) -> MomentPayload:
    t0 = time.perf_counter()

    # Step 1 — load declaration (in-memory registry)
    decl = get_declaration(moment_id)
    if decl is None:
        return emit_fallback_payload(moment_id, reason="registry_miss")

    # Step 2 — validate ctx (user_attention_state REQUIRED)
    if err := validate_ctx(ctx):
        return emit_fallback_payload(moment_id, reason=err)

    # Step 3 — triad authority (LOUD on violation)
    enforce_triad_readonly(ctx)  # raises TriadMutationError

    # Step 4 — build presentation_context (auto + manual fields)
    if err := validate_presentation(decl):
        return emit_fallback_payload(moment_id, reason=err)

    # Step 5 — query registry for candidates matching applies_when
    candidates = query_registry(decl, ctx)

    # Step 6 — emotional_weight guard
    #   maximum: filter celebration/play/light_touch/cheer/exclamation
    #   heavy:   filter celebration/cheer
    candidates = apply_weight_guard(candidates, ctx)

    # Step 7 — mode downgrade (rooted → hybrid → universal)
    candidates, mode_served = apply_mode_downgrade(candidates, ctx)

    # Step 8 — locale downgrade (per decl chain + en final)
    candidates, locale_served = apply_locale_downgrade(candidates, decl, ctx)

    # Step 9 — status ranking: approved > variant_candidate > agent_audited
    #          tiebreak: -len(applies_when) (specificity) then variant_id
    best = select_best(candidates)
    if best is None:
        return emit_fallback_payload(moment_id, reason="no_approved_variant")

    # Success — assemble payload
    slots = {name: "" for name in decl.content_pack.slots}
    for name, spec in decl.content_pack.slots.items():
        if spec.constant_value is not None:
            slots[name] = spec.constant_value
    slots.update(best.slots)

    payload = MomentPayload(
        moment_id=moment_id,
        slots=slots,  # every declared slot ≥ ""
        meta=PayloadMeta(
            variant_id=best.variant_id,
            mode_served=mode_served,
            locale_served=locale_served,
            fallback_used=(mode_served != ctx.guidance_mode) or
                         (locale_served != ctx.locale),
            fallback_reason=None,  # or "downgraded"
            audit_id=request_id or uuid4(),
            resolved_in_ms=elapsed_ms(t0),
        ),
    )
    shadow_write(ctx, payload)  # MitraDecisionLog async
    return payload
```

**Invariants:**
- Every step has a defined fall-through. Only `TriadMutationError`
  escapes (design bug, not recoverable).
- Every slot returns ≥ `""`. Never `None`, never missing.
- `PayloadMeta` always fully populated.
- No runtime truncation — oversize content fails CI at ingest.
- p50 ≤ 3ms, p99 ≤ 15ms (registry is in-memory; no DB in hot path).

---

### 4.4 — Self-learning

**Current state:** READ-only utilities SHIPPED. Automated promotion
intentionally NOT implemented — per Content Contract §3, founder
sign-off is required for `approved`.

**Key files:**
- `kalpx/core/content/self_learning.py`
- `kalpx/core/models.py::MitraDecisionLog` (now user-nullable)
- `kalpx/core/content/decision_log.py` (shadow-write via celery)

**Shadow-write schema (every resolve writes one row):**
```python
MitraDecisionLog(
    user_id,                  # now NULLABLE (Phase F migration 0106)
    cycle_id,                 # UUIDField, coerced from ctx
    cycle_day,
    life_kosha, life_klesha,
    today_kosha, today_vritti, today_klesha, today_path,
    moment_surfaced,
    user_engagement={         # JSON blob
        audit_id, variant_id, mode_served, locale_served,
        fallback_used, fallback_reason,
        resolved_in_ms,
        user_attention_state, emotional_weight,
        entered_via, context_hash, cycle_id_raw,
    },
    created_at,
)
```

**Algorithm — `analyze_moment(moment_id, days=14)`:**
```python
def analyze_moment(moment_id, days=14) -> MomentTelemetry:
    rows = MitraDecisionLog.objects.filter(
        moment_surfaced=moment_id,
        created_at__gte=now() - timedelta(days=days),
    ).values("user_id", "user_engagement")

    telem = MomentTelemetry(moment_id=moment_id, window_days=days)
    for row in rows:
        ue = row["user_engagement"] or {}
        vid = ue.get("variant_id") or "__fallback__"
        fb = bool(ue.get("fallback_used"))

        telem.total_serves += 1
        if fb: telem.fallback_used_total += 1
        if ue.get("mode_served") != ue.get("guidance_mode"):
            telem.mode_downgrades += 1

        vt = telem.variants.setdefault(vid, VariantTelemetry(vid))
        vt.serves += 1
        if fb: vt.fallback_used += 1
        # track unique users per variant (None filtered out)

    return telem
```

**Algorithm — `recommend_promotions(moment_id, ...)`:**
```python
def recommend_promotions(moment_id, *,
                         min_serves=100,
                         min_days=14,
                         material_gain_threshold=0.05) -> list[PromotionSignal]:
    telem = analyze_moment(moment_id, days=min_days)
    if telem.total_serves == 0: return []

    decl = registry.load()[moment_id]
    approved = [v for v in decl.variants if v.status == "approved"]
    if not approved: return []

    # Baseline fallback_rate across all approved variants (weighted by serves)
    total_approved_serves = sum(telem.variants[v.id].serves for v in approved)
    if total_approved_serves == 0: return []
    baseline_fb_rate = (sum(telem.variants[v.id].fallback_used for v in approved)
                        / total_approved_serves)

    signals = []
    for vid, vt in telem.variants.items():
        variant = decl.variants_by_id.get(vid)
        if not variant: continue
        if variant.status not in ("variant_candidate", "agent_audited"):
            continue                                  # approved already in role
        if vt.serves < min_serves: continue           # not enough signal
        gain = baseline_fb_rate - vt.fallback_rate   # lower fb_rate = better
        if gain < material_gain_threshold: continue
        signals.append(PromotionSignal(
            variant_id=vid,
            current_status=variant.status,
            serves=vt.serves,
            fallback_rate=vt.fallback_rate,
            unique_users=vt.unique_users,
            note=f"serves={vt.serves} fb={vt.fallback_rate:.3f} "
                 f"vs baseline {baseline_fb_rate:.3f} (Δ={gain:+.3f})",
        ))
    return signals
```

**Invariants:**
- **Suggestions only.** No function ever changes a variant's status.
- Conservative thresholds: ≥ 100 serves AND ≥ 5% material gain AND
  ≥ 14 days window. Any one missing → no signal.
- Approved variants never appear in promotion signals (they're the
  baseline).
- Works on guest rows (user nullable) so pre-auth traffic informs
  telemetry without requiring login.

---

### 4.5 — Deepening

**Current state:** CONTRACTED, not yet implemented. Deepen decision
lives in the Day-14 checkpoint M25 + `M_deepen_sadhana`,
`M_rep_extension_setup`, `M_deepen_confirmation` moments.

**Algorithm (from architecture memory Cycle Day 14 branch):**
```python
def decide_day_14_deepen(cycle, telem_14d) -> DeepenVerdict:
    # Count days where vritti-at-life_kosha was detected during reflection
    vritti_hit_days = count_days_where(telem_14d,
        kosha_matches=cycle.life_kosha,
        vritti_detected=True)
    ratio = vritti_hit_days / cycle.total_days  # 14 baseline

    if ratio >= 0.40:
        # User is softening at life_kosha — ready to deepen OR advance
        return DeepenVerdict(
            decision="offer_deepen_or_advance",
            present_moments=["M_deepen_sadhana", "M_path_evolution_reveal"],
            message_key="deepen_invitation",
        )
    elif ratio >= 0.20:
        # Some signal, not enough — continue with adjustment
        return DeepenVerdict(
            decision="continue_with_adjustment",
            present_moments=["M24_checkpoint_day_7_style"],
            message_key="continue_honoring",
        )
    else:
        # Minimal signal — recommend another cycle at same kosha, lighter
        return DeepenVerdict(
            decision="another_cycle_lighter",
            present_moments=["M_reset_with_awareness", "M_cycle_length_choice"],
            message_key="lighten_path",
        )
```

**Invariants:**
- **vritti_ratio at life_kosha** is the single measurable metric for
  deepen-readiness (not "days completed" — that conflates engagement
  with transformation).
- Threshold 40% for deepen, 20% for continue, < 20% for lighten.
  These are the founder-approved thresholds locked in architecture.
- Deepen sets `rep_count`/`duration` extensions via
  `M_rep_extension_setup`; it never changes the **item** (same mantra
  + sankalp + practice) — that's a focus change, handled separately.

---

### 4.6 — Welcome-back (contextual return)

**Current state:** CONTRACTED. Deep-link handler landed
(`src/utils/deeplink.ts`, commit `5440b5c`), notification-nav
infrastructure flagged for Phase D-plus. Actual "last-state memory"
logic is partial.

**Architecture principle (memory `feedback_contextual_return.md`):**
> Every return is contextual. Mitra remembers last state, offers most
> relevant next step. Mic always present. Evening reflection
> first-class. Notifications are Mitra reaching out.

**Algorithm (proposed):**
```python
def decide_welcome_back_surface(user, last_state, now) -> MomentId:
    # Signals to combine:
    days_since_last_open = (now - last_state.last_open_at).days
    days_since_last_practice = (now - last_state.last_practice_at).days
    day_in_cycle = user.current_cycle.day_number
    last_surface = last_state.last_moment_surfaced
    pending_reflection = last_state.evening_reflection_pending_today
    has_predictive_alert = fetch_predictive_alert().confidence >= 0.6

    # Highest-priority contextual returns
    if days_since_last_open >= 7:
        return "M_identity_state_view"  # "you've been carrying..."
    if day_in_cycle == 7: return "M24_checkpoint_day_7"
    if day_in_cycle == 14: return "M25_checkpoint_day_14"

    # Post-conflict morning
    if last_state.post_conflict_pending:
        return "M39_post_conflict_morning"

    # Day 1 of new cycle
    if day_in_cycle == 1: return "M_first_day"

    # Clear window active
    if fetch_clear_window().active: return "M43_clear_window_banner"

    # Predictive prep
    if has_predictive_alert: return "M28_predictive_alert_card"

    # Evening slot and reflection not yet done
    if is_evening_hour(now) and not pending_reflection:
        return "M35_evening_reflection"

    # Default — dashboard with current triad
    return "M08_day_active"
```

**Invariants:**
- **No default dashboard.** Every return chooses the highest-signal
  surface; `M08_day_active` is the **fallback**, not the default.
- Mic always present — every moment's PresentationContext declares
  `voice_mode_available`.
- Day-7/Day-14 milestones supersede all other signals.
- Notifications use the same `kalpx://mitra/<container>/<state>?data=...`
  deep-link handler so push-nav and contextual return share one code
  path.

---

### 4.7 — Day-7 checkpoint (M24)

**Current state:** IMPLEMENTED. Full pilot migrated in Phase C; sim
visual verified.

**Key files:**
- `kalpx-app-rn/src/blocks/CheckpointDay7Block.tsx`
- `kalpx/core/data_seed/mitra_v3/moments/M24_checkpoint_day_7.yaml`
- Backend action: `actionExecutor.ts::checkpoint_submit` (preserved
  from v2)

**Algorithm — 3-way decision:**
```python
def handle_day_7_checkpoint_submit(user, decision, reflection):
    # decision ∈ {"continue", "lighten", "start_fresh"}
    cycle = user.current_cycle
    save_reflection(cycle, reflection, day=7)

    if decision == "continue":
        # Keep same triad, same duration, same focus
        cycle.mark_day_7_checkpoint_done()
        return navigate_to("M08_day_active")

    elif decision == "lighten":
        # Same triad, but reduce rep count or duration by ~30%
        # Signals user is engaged but path is too heavy
        cycle.lighten(factor=0.7)
        return navigate_to("M08_day_active_lightened")

    elif decision == "start_fresh":
        # Not continuing this path — user changes focus mid-cycle
        # Clears cycle state; onboarding-lite re-flow
        cycle.mark_aborted(reason="user_chose_start_fresh")
        return navigate_to("M_discipline_select")
```

**Compound moment (2-beat render):**
```
Intro (step 1):
  "DAY 7"  |  "You've been at this a week."  |
  "Can I show you what I've seen?"  |  [Show me]

Body (step 2):
  "DAY 7"
  [7 dots grid — completed/partial/missed]
  "X of 7 days."
  body_narrative (backend-authored, or registry baseline)
  [WHAT GREW] {what_grew_section} (optional, only if backend provides)
  [WHAT TO CARRY] <textarea: reflection>
  [NEXT WEEK] next_week_prose
  [Continue my path]
  [Lighten it] [Start fresh]
```

**Invariants:**
- `decision_reversibility: irreversible` in PresentationContext. Copy
  must carry gravity without fear-driving. CI gate `quality_validator`
  rejects pressure tokens ("you must", "last chance", "no going back").
- `emotional_weight: heavy` engages `weight_guard` — celebration/cheer
  variants filtered out before ranking.
- `user_attention_state: reflective_exposed` allows 220-char primary
  slot cap; authored narrative can breathe.
- Backend `journey_narrative` from `companion-state` wins over registry
  `body_narrative` when present (per-user pattern > generic baseline).

---

### 4.8 — Day-14 checkpoint (M25)

**Current state:** ContentPack SHIPPED (wave 2). Block exists
(`CheckpointDay14Block.tsx`), Phase D-migrated — slot-driven. Multi-
variant routing on `checkpoint_feeling` exists via
`M_cycle_reflection_results` (served AFTER M25 submit).

**Key files:**
- `kalpx-app-rn/src/blocks/CheckpointDay14Block.tsx`
- `kalpx/core/data_seed/mitra_v3/moments/M25_checkpoint_day_14.yaml`
- `kalpx/core/data_seed/mitra_v3/moments/M_cycle_reflection_results.yaml`
  (5 variants keyed on `stage_signals.checkpoint_feeling`)

**Algorithm — 3-way evolution decision:**
```python
def handle_day_14_checkpoint_submit(user, decision, feeling, reflection):
    # decision ∈ {"continue_same", "deepen", "change_focus"}
    # feeling ∈ {"strong", "slight", "same", "worse"} (self-reported)
    cycle = user.current_cycle
    cycle.mark_day_14_checkpoint_done(feeling=feeling, reflection=reflection)

    # Compute vritti ratio to inform the results card
    vritti_ratio = compute_vritti_ratio_at_life_kosha(cycle)

    # Resolve M_cycle_reflection_results variant keyed on feeling
    results_payload = resolve(
        "M_cycle_reflection_results",
        ctx_with(stage_signals={"checkpoint_feeling": feeling,
                                "vritti_ratio": vritti_ratio}),
    )
    # The registry serves 1 of 4 feeling-specific variants

    if decision == "continue_same":
        next_cycle = spawn_next_cycle(same_scan_focus=True,
                                     same_triad=True)
    elif decision == "deepen":
        # Same focus, rep count / duration extended
        next_cycle = spawn_next_cycle(same_scan_focus=True,
                                     rep_multiplier=1.5)
    elif decision == "change_focus":
        # M_path_evolution_reveal → new scan_focus, new triad
        return navigate_to("M_path_evolution_reveal")

    return navigate_to("M_cycle_complete_overview", payload=results_payload)
```

**Cross-cycle continuity:**
- At cycle N+1 start, `M_cross_cycle_integrity` reinforces identity
  continuity (memory ref `mitra_v3_33_moments.md`). "You chose inner
  peace last cycle. Still want to deepen there, or steady into
  something else?"

**Invariants:**
- Same as M24 + `compound_moment_sequence: [intro, body]`.
- M25 → M_cycle_reflection_results → M_cycle_complete_overview →
  M_offering_reveal is a 4-beat arc. Currently ContentPacks exist for
  all four, but the arc orchestration is container-level work (not yet
  wired).
- After day 14 + evolve decision, cycle count increments. Five cycles
  ≈ 70 days ≈ one full Sadhana Yatra arc through all 5 koshas.

---

## Part 5 — What's NOT in this session

### Intentionally deferred (Phase F continuation)
1. **Rooted + hybrid variants** for high-impact surfaces — every
   moment currently has only `universal × en`. Rooted = Sanskrit
   verse anchor, hybrid = English with Sanskrit call-out.
2. **Hi locale first pass** — one locale variant per pilot moment to
   prove the downgrade chain end-to-end with real translated content.
3. **TSX migration for 7 wave-5 moments without blocks** — blocks
   don't exist yet (M_daily_insight, M_adaptation_toast,
   M_companion_analysis, M_low_burden_day, M_offering_reveal,
   M_info_reveal, M_post_trigger_mantra).

### Out of scope (future phases)
- Automated variant promotion (Phase G+) — `recommend_promotions`
  is read-only suggestions; a future flow would feed these into a
  founder review UI.
- Cross-moment narrative continuity enforcement — today's registry
  does not enforce that M17 runner's `completion_return` shares
  authored voice with the runner itself. Flagged as
  `sibling_content_coupling` in PresentationContext but not runtime-
  checked.
- Haptic pattern registry — M17 has haptics, M46 dot breathing, M18
  gradient fill. No authored coupling between copy cadence and haptic
  timing.
- Content authoring UI — today content authors edit YAML. Phase G+
  envisions a founder-facing review + promote UI feeding the
  lifecycle (`draft → agent_audited → approved → variant_candidate`).

---

## Part 6 — State at session close

### Dev state
- **Backend tip:** `kalpx @ 55432921` (mitra-v3-sadhana-yatra).
- **FE tip:** `kalpx-app-rn @ 7c5da5e` (sadhana-yatra-onboarding).
- **Dev deploy:** all commits pulled, 45 moments resolvable, unauth
  telemetry verified landing in MitraDecisionLog.
- **Migrations applied:** 0102/0103/0104/0105/0106 on dev.
- **Env flags live on dev:** `MITRA_V3_CONTENT_RESOLVE_ENABLED=1`,
  `MITRA_V3_DECISION_LOG_WRITE=1`, plus 16 pre-existing v3 flags.

### Test state
- **Local (venv pytest):** 381 passed in 32s.
- **Dev smoke:** spot-checked 8 moments across waves; all return
  approved variant with correct slot count + meta.
- **Sim visual:** M35 + M46 + M24 + M47 + M23 verified pixel-level.

### What a future engineer needs
1. Read `docs/CONTENT_CONTRACT_V1.md` + `docs/ORCHESTRATION_CONTRACT_V1.md`
   first. They are the authoritative schemas.
2. Read `docs/PRESENTATION_CONTEXT_WALKTHROUGHS.md` to understand
   how to derive PresentationContext for a new moment.
3. Use `kalpx-app-rn/src/hooks/useContentSlots.ts` for any new block
   migration — the pattern is proven across 24+ components.
4. Never edit a TSX file with new user-facing English without adding a
   ContentPack YAML. The sovereignty CI gate will catch it, but the
   discipline is "YAML first, TSX second."
5. For multi-variant content (state-conditional copy), pass the
   discriminator through `stage_signals` and let the orchestrator's
   specificity sort pick the keyed variant.
