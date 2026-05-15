# Wisdom Selector — Implementation Spec V1 (Phase A engineering)

**Companion to:** `WISDOM_ORCHESTRATION_CONTRACT_V1.md`
**Date:** 2026-04-18
**Status:** Engineering-ready. Blocked only on founder Pass C (see §6).

Ships: one Django module, 7 Alembic migrations, one REST endpoint, ~350 LOC selector core. Nothing else.

---

## 1. File layout

```
kalpx/core/wisdom/
├── __init__.py
├── selector.py               # pick_wisdom() — ~350 LOC
├── phrase_blacklist.py       # 3 V1 families (grief_bypass, joy_celebration, self_help)
├── views.py                  # POST /api/mitra/wisdom/pick/
├── telemetry.py              # snippet_ratio_per_context_family celery task
└── tests/
    ├── test_invariants.py    # 12 hard invariants (§4.3 of contract)
    ├── test_reachability.py  # 45 fixtures (Agent 5 §1)
    ├── test_library_integrity.py  # build-time library checks
    └── fixtures/*.yaml       # ≥45 test fixtures
```

---

## 2. Alembic migrations (dependency order)

```
0111_wisdom_asset_must_haves.py
0112_wisdom_asset_integrity_required.py       # principle_version_id + tradition_specificity
0113_wisdom_asset_channel_extensions.py       # channel_coverage, spoken_rewrite, pronunciation_ipa
0114_mitra_decision_log_selector_trace.py     # selector_trace_json JSONB column
0115_conversation_memory_declared_empty.py    # table created; unused in V1
0116_response_assembly_and_part.py            # ResponseAssembly + ResponsePart (single-part default)
0117_wisdom_asset_pass_a_backfill.py          # data migration: Pass A → 12 must-haves populated
```

### 0111 — MUST-HAVE columns

```python
op.add_column("wisdom_asset", sa.Column("asset_kind", sa.String(16), nullable=False, server_default="principle"))
op.add_column("wisdom_asset", sa.Column("source_tier", sa.String(16), nullable=False, server_default="tier_2"))
op.add_column("wisdom_asset", sa.Column("source_family", sa.String(32), nullable=False, server_default=""))
op.add_column("wisdom_asset", sa.Column("mode_coverage", sa.ARRAY(sa.Text), nullable=False, server_default="{}"))
op.add_column("wisdom_asset", sa.Column("context_fit_tags", sa.ARRAY(sa.Text), nullable=False, server_default="{}"))
op.add_column("wisdom_asset", sa.Column("state_fit_tags", sa.ARRAY(sa.Text), nullable=False, server_default="{}"))
op.add_column("wisdom_asset", sa.Column("interaction_role_tags", sa.ARRAY(sa.Text), nullable=False, server_default="{}"))
op.add_column("wisdom_asset", sa.Column("max_char_fits", sa.dialects.postgresql.JSONB, nullable=False, server_default="{}"))
op.add_column("wisdom_asset", sa.Column("emotional_weight", sa.String(16), nullable=False, server_default="moderate"))
op.add_column("wisdom_asset", sa.Column("drill_down_only", sa.Boolean, nullable=False, server_default="false"))
op.add_column("wisdom_asset", sa.Column("standalone_safe", sa.String(16), nullable=False, server_default="pending"))  # enum-like: yes|no|pending
op.add_column("wisdom_asset", sa.Column("tradition_naming_allowed", sa.Boolean, nullable=False, server_default="false"))
op.add_column("wisdom_asset", sa.Column("bridge_family", sa.String(32), nullable=True))
op.add_column("wisdom_asset", sa.Column("repeat_tolerance", sa.String(24), nullable=False, server_default="rotate_with_gap"))
op.add_column("wisdom_asset", sa.Column("selector_eligible", sa.Boolean, nullable=False, server_default="false"))

# Indexes (filter hot)
op.create_index("ix_wisdom_asset_kind_tier_family", "wisdom_asset", ["asset_kind", "source_tier", "source_family"])
op.create_index("ix_wisdom_asset_selector_eligible", "wisdom_asset", ["selector_eligible"])
op.create_index("ix_wisdom_asset_context_fit", "wisdom_asset", ["context_fit_tags"], postgresql_using="gin")
op.create_index("ix_wisdom_asset_state_fit", "wisdom_asset", ["state_fit_tags"], postgresql_using="gin")
op.create_index("ix_wisdom_asset_role_tags", "wisdom_asset", ["interaction_role_tags"], postgresql_using="gin")

# Check constraints
op.create_check_constraint("chk_asset_kind", "wisdom_asset", "asset_kind IN ('principle','snippet')")
op.create_check_constraint("chk_source_tier", "wisdom_asset", "source_tier IN ('tier_1','tier_2','application','snippet')")
op.create_check_constraint("chk_emotional_weight", "wisdom_asset", "emotional_weight IN ('light','moderate','heavy','maximum')")
op.create_check_constraint("chk_standalone_safe", "wisdom_asset", "standalone_safe IN ('yes','no','pending')")
op.create_check_constraint("chk_repeat_tolerance", "wisdom_asset", "repeat_tolerance IN ('rotate_fresh','rotate_with_gap','stable_anchor','exhaust_once')")
```

### 0112 — Integrity-required

```python
op.add_column("wisdom_asset", sa.Column("principle_version_id", sa.Integer, nullable=False, server_default="1"))
op.add_column("wisdom_asset", sa.Column("tradition_specificity", sa.String(64), nullable=True))

op.create_index("ix_wisdom_asset_version", "wisdom_asset", ["principle_version_id"])

# Trigger: bump principle_version_id on text edit
op.execute("""
CREATE OR REPLACE FUNCTION bump_principle_version_id() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.plain_english IS DISTINCT FROM OLD.plain_english OR
       NEW.core_teaching IS DISTINCT FROM OLD.core_teaching OR
       NEW.universal_explanation IS DISTINCT FROM OLD.universal_explanation OR
       NEW.rooted_explanation IS DISTINCT FROM OLD.rooted_explanation OR
       NEW.short_label IS DISTINCT FROM OLD.short_label THEN
        NEW.principle_version_id = OLD.principle_version_id + 1;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bump_version_on_text_edit
BEFORE UPDATE ON wisdom_asset
FOR EACH ROW EXECUTE FUNCTION bump_principle_version_id();
""")
```

### 0113 — Channel extensions

```python
op.add_column("wisdom_asset", sa.Column("channel_coverage", sa.ARRAY(sa.Text), nullable=True))  # {visible_text,spoken_voice,silent_store}
op.add_column("wisdom_asset", sa.Column("spoken_rewrite", sa.Text, nullable=True))
op.add_column("wisdom_asset", sa.Column("pronunciation_ipa", sa.Text, nullable=True))
```

### 0114 — DecisionTrace JSON column

```python
op.add_column("mitra_decision_log", sa.Column("selector_trace_json", sa.dialects.postgresql.JSONB, nullable=True))
```

### 0115 — ConversationMemory (declared-empty)

```python
op.create_table("conversation_memory",
    sa.Column("id", sa.BigInteger, primary_key=True),
    sa.Column("thread_id", sa.String(64), nullable=False),
    sa.Column("user_id", sa.dialects.postgresql.UUID, sa.ForeignKey("auth_user.id", ondelete="CASCADE"), nullable=False),
    sa.Column("turn_count", sa.Integer, nullable=False, server_default="0"),
    sa.Column("summary_buffer", sa.Text, nullable=True),
    sa.Column("user_state_vector_series", sa.dialects.postgresql.JSONB, nullable=False, server_default="[]"),
    sa.Column("user_vocabulary_comfort", sa.dialects.postgresql.JSONB, nullable=False, server_default="{}"),
    sa.Column("per_principle_drill_depth", sa.dialects.postgresql.JSONB, nullable=False, server_default="{}"),
    sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    sa.UniqueConstraint("thread_id", "user_id", name="uq_conversation_memory_thread"),
)
# No secondary indexes in V1 — unused. Track 2 adds when queried.
```

### 0116 — ResponseAssembly + ResponsePart

```python
op.create_table("response_assembly",
    sa.Column("id", sa.BigInteger, primary_key=True),
    sa.Column("assembly_uuid", sa.dialects.postgresql.UUID, nullable=False, unique=True, server_default=sa.text("gen_random_uuid()")),
    sa.Column("decision_log_id", sa.BigInteger, sa.ForeignKey("mitra_decision_log.id", ondelete="SET NULL"), nullable=True),
    sa.Column("modality", sa.String(16), nullable=False, server_default="visible"),
    sa.Column("total_budget_chars", sa.Integer, nullable=True),
    sa.Column("flow_tags", sa.ARRAY(sa.Text), nullable=False, server_default="{}"),
    sa.Column("continuation_marker", sa.String(32), nullable=False, server_default="closed"),
    sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
)
op.create_check_constraint("chk_modality", "response_assembly", "modality IN ('visible','audible','silent')")
op.create_check_constraint("chk_continuation", "response_assembly", "continuation_marker IN ('closed','awaiting_user','awaiting_user_with_prompt','pausing_beat')")

op.create_table("response_part",
    sa.Column("id", sa.BigInteger, primary_key=True),
    sa.Column("assembly_id", sa.BigInteger, sa.ForeignKey("response_assembly.id", ondelete="CASCADE"), nullable=False),
    sa.Column("part_index", sa.Integer, nullable=False, server_default="0"),
    sa.Column("part_type", sa.String(32), nullable=False),
    sa.Column("text", sa.Text, nullable=False),
    sa.Column("asset_id", sa.String(128), nullable=True),
    sa.Column("render_constraints", sa.String(16), nullable=False, server_default="visible"),
    sa.Column("char_count_visible", sa.Integer, nullable=True),
    sa.Column("char_count_spoken", sa.Integer, nullable=True),
    sa.Column("pause_before_ms", sa.Integer, nullable=True),
    sa.Column("pause_after_ms", sa.Integer, nullable=True),
    sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    sa.UniqueConstraint("assembly_id", "part_index", name="uq_assembly_part_idx"),
)
op.create_check_constraint("chk_render", "response_part", "render_constraints IN ('visible','audible','silent')")
op.create_check_constraint("chk_parttype", "response_part",
    "part_type IN ('mirror','principle_anchor','suggested_action','quiet_ack','reflective_prompt','listen_silence','completion_anchor','first_read_line','second_beat_line')")
```

### 0117 — Pass A backfill (data migration)

Loads `/Users/paragbhasin/Downloads/mitra_wisdom_library_passb_2026_04_18.csv` (Pass B output) into `wisdom_asset` by asset_id. Populates 12 MUST-HAVE + 2 integrity + 3 nullable extension columns. Flips `selector_eligible=true` on 404 rows.

---

## 3. `selector.py` — pseudocode (~350 LOC)

```python
"""
kalpx/core/wisdom/selector.py

pick_wisdom() — deterministic wisdom routing for Track 0.5 V1.
Contract: WISDOM_ORCHESTRATION_CONTRACT_V1.md
"""
import hashlib, json, re, time, uuid
from dataclasses import dataclass, field, asdict
from typing import Optional, List, Dict, Any, Set

from core.models import WisdomAsset, MitraDecisionLog
from core.wisdom.phrase_blacklist import BLACKLIST_GRIEF_BYPASS, BLACKLIST_JOY_CELEBRATION, BLACKLIST_SELF_HELP

# ---------- Input / output shapes ----------

@dataclass
class WisdomSelectionInput:
    interaction_type: str              # 5 values in V1: first_read_opening, second_beat, quiet_ack, visible_reply, completion_anchor
    context: str                       # room_or_surface_id
    state_family: str                  # grief | loneliness | joy | growth | core | ...
    guidance_mode: str                 # universal | hybrid | rooted
    locale: str                        # en | hi | ...
    user_readiness_level: str = "L1"   # L0..L4 bucket (derived from days_since_start)
    path_intent: Optional[str] = None
    user_context: Dict[str, Any] = field(default_factory=dict)
    memory: Dict[str, Any] = field(default_factory=dict)
    preferences: Dict[str, Any] = field(default_factory=dict)

@dataclass
class DecisionTrace:
    audit_id: str
    input_hash: str
    called_at_epoch_ms: int
    funnel: List[Dict] = field(default_factory=list)
    sort_trace: List[Dict] = field(default_factory=list)
    tiebreak_reason: str = "none"
    final_winner_asset_id: str = ""
    final_winner_tier: str = ""
    final_winner_family: str = ""
    relaxation_steps_applied: List[str] = field(default_factory=list)
    truncation_layer_used: str = "none"
    rendered_char_count: int = 0
    char_budget: Dict[str, Any] = field(default_factory=dict)
    fallback_used: bool = False
    fallback_reason: Optional[str] = None
    latency_ms: int = 0
    principle_version_id_served: int = 0

@dataclass
class WisdomSelectionOutput:
    ok: bool
    selected_text: str = ""
    asset_kind: str = "none"
    asset_id: str = ""
    source_tier: str = "none"
    source_family: str = ""
    char_count: int = 0
    wrapper_required: bool = False
    wrapper_suggestion: Optional[str] = None
    tradition_naming_used: bool = False
    drill_down_id: Optional[str] = None
    drill_down_available: bool = False
    principle_version_id: int = 0
    trace: Optional[DecisionTrace] = None

# ---------- Main entry point ----------

def pick_wisdom(input: WisdomSelectionInput) -> WisdomSelectionOutput:
    t0 = time.monotonic()
    audit_id = str(uuid.uuid4())
    input_hash = _hash_input(input)
    trace = DecisionTrace(audit_id=audit_id, input_hash=input_hash, called_at_epoch_ms=int(time.time()*1000))

    # 1. Validate
    err = _validate(input)
    if err:
        trace.fallback_used = True
        trace.fallback_reason = err
        trace.latency_ms = int((time.monotonic() - t0) * 1000)
        _emit_decision_log(trace)
        return WisdomSelectionOutput(ok=False, trace=trace)

    # 2. Check surface allowlist (interaction_type × surface = allowed?)
    if not _is_interaction_allowed_on_surface(input.interaction_type, input.context):
        trace.fallback_used = True
        trace.fallback_reason = "not_in_surface_policy"
        trace.latency_ms = int((time.monotonic() - t0) * 1000)
        _emit_decision_log(trace)
        return WisdomSelectionOutput(ok=False, trace=trace)

    # 3. Load candidate pool (selector_eligible only)
    pool = list(WisdomAsset.objects.filter(selector_eligible=True))
    trace.funnel.append({"stage": "load_pool", "n_in": 0, "n_out": len(pool)})
    n = len(pool)

    # 4. Filter chain — collapsed to one pass per contract §4.1 step 1
    pool = _filter_interaction_allowlist(pool, input.interaction_type)
    trace.funnel.append({"stage": "interaction_allowlist", "n_in": n, "n_out": len(pool)}); n = len(pool)

    pool = _filter_mode_eligibility(pool, input.guidance_mode)
    trace.funnel.append({"stage": "mode_eligibility", "n_in": n, "n_out": len(pool)}); n = len(pool)

    pool = _filter_context_fit(pool, input.context)
    trace.funnel.append({"stage": "context_fit", "n_in": n, "n_out": len(pool)}); n = len(pool)

    pool = _filter_state_fit(pool, input.state_family, input.path_intent)
    trace.funnel.append({"stage": "state_fit", "n_in": n, "n_out": len(pool)}); n = len(pool)

    pool = _filter_contraindications(pool, input)
    trace.funnel.append({"stage": "contraindications", "n_in": n, "n_out": len(pool)}); n = len(pool)

    # Invariant #8: completion family law (hard filter for completion_anchor)
    if input.interaction_type == "completion_anchor":
        variant = input.user_context.get("runner_variant")
        allowed_families = {
            "mantra": {"gita"},
            "sankalp": {"yoga_sutras"},
            "practice": {"ayurveda", "dinacharya"},
        }.get(variant, None)
        if allowed_families:
            pool = [p for p in pool if p.source_family in allowed_families]
            trace.funnel.append({"stage": "completion_family_lock", "n_in": n, "n_out": len(pool)}); n = len(pool)

    # Invariant #2: principle-over-snippet
    if any(p.asset_kind == "principle" for p in pool):
        pool = [p for p in pool if p.asset_kind == "principle"]
        trace.funnel.append({"stage": "principle_over_snippet", "n_in": n, "n_out": len(pool)}); n = len(pool)

    pool = _filter_freshness(pool, input.memory)
    trace.funnel.append({"stage": "freshness", "n_in": n, "n_out": len(pool)}); n = len(pool)

    # Invariant #3: one tradition per session (if Redis lock set)
    session_traditions = input.memory.get("session_traditions", [])
    if session_traditions:
        bound = session_traditions[0]  # first one locked
        if bound != "bhakti":  # Bhakti bridge exception
            pool = [p for p in pool if p.source_family == bound or p.source_family == "bhakti"]
            trace.funnel.append({"stage": "session_tradition_lock", "n_in": n, "n_out": len(pool)}); n = len(pool)

    # 5. Relaxation if empty
    if not pool:
        pool, relaxations = _relax(input, trace)
        trace.relaxation_steps_applied = relaxations
        if not pool:
            trace.fallback_used = True
            trace.fallback_reason = "pool_empty_after_all_relaxations"
            trace.latency_ms = int((time.monotonic() - t0) * 1000)
            _emit_decision_log(trace)
            return WisdomSelectionOutput(ok=False, trace=trace)

    # 6. Sort (3-key per Review B simplification)
    pool.sort(key=lambda r: (
        _tier_rank(r.source_tier),                          # 1. authority
        -_specificity_score(r, input),                       # 2. specificity
        -_quality_rank(r.status),                            # 3. approved > variant > draft
    ))
    trace.sort_trace.append({"key": "tier+specificity+quality", "top_3": [p.asset_id for p in pool[:3]]})

    # 7. Tiebreak (3-level per contract §4.1 step 3)
    pool = _tiebreak(pool, input, trace)

    winner = pool[0]

    # 8. Truncate to surface budget
    rendered_text, layer = _render_with_truncation(winner, input)
    trace.truncation_layer_used = layer
    trace.rendered_char_count = len(rendered_text)
    trace.char_budget = _get_render_budget(input.context, input.interaction_type)

    # 9. Wrap (mode downgrade if wrapper missing)
    if winner.needs_wrapper and not _has_wrapper_copy(winner):
        # Downgrade mode
        if input.guidance_mode == "rooted":
            trace.relaxation_steps_applied.append("mode_downgrade_rooted_to_hybrid")
            input.guidance_mode = "hybrid"
        elif input.guidance_mode == "hybrid":
            trace.relaxation_steps_applied.append("mode_downgrade_hybrid_to_universal")
            input.guidance_mode = "universal"
        # Re-render or null-out depending on mode
        rendered_text, layer = _render_with_truncation(winner, input)

    # 10. Emit trace
    trace.final_winner_asset_id = winner.asset_id
    trace.final_winner_tier = winner.source_tier
    trace.final_winner_family = winner.source_family
    trace.principle_version_id_served = winner.principle_version_id
    trace.latency_ms = int((time.monotonic() - t0) * 1000)
    _emit_decision_log(trace)

    return WisdomSelectionOutput(
        ok=True,
        selected_text=rendered_text,
        asset_kind=winner.asset_kind,
        asset_id=winner.asset_id,
        source_tier=winner.source_tier,
        source_family=winner.source_family,
        char_count=len(rendered_text),
        wrapper_required=winner.needs_wrapper,
        tradition_naming_used=winner.tradition_naming_allowed and input.guidance_mode != "universal",
        drill_down_id=winner.asset_id if winner.asset_kind == "principle" else None,
        drill_down_available=winner.asset_kind == "principle",
        principle_version_id=winner.principle_version_id,
        trace=trace,
    )

# ---------- Helper functions (abbreviated) ----------

def _hash_input(inp): return hashlib.sha256(json.dumps(asdict(inp), sort_keys=True).encode()).hexdigest()

def _validate(inp):
    if inp.interaction_type not in V1_INTERACTION_TYPES: return "bad_interaction_type"
    if inp.guidance_mode not in {"universal", "hybrid", "rooted"}: return "bad_mode"
    return None

def _filter_interaction_allowlist(pool, itype): return [p for p in pool if itype in p.interaction_role_tags]
def _filter_mode_eligibility(pool, mode): return [p for p in pool if mode in p.mode_coverage]
def _filter_context_fit(pool, ctx): return [p for p in pool if ctx in p.context_fit_tags]
def _filter_state_fit(pool, state, path_intent):
    result = [p for p in pool if state in p.state_fit_tags]
    if path_intent:
        result = [p for p in result if path_intent in p.path_intent_tags]
    return result

def _filter_contraindications(pool, inp):
    # Apply 3 phrase blacklists based on context
    out = []
    for p in pool:
        text = p.plain_english or ""
        if _grief_context(inp) and BLACKLIST_GRIEF_BYPASS.search(text): continue
        if _joy_context(inp) and BLACKLIST_JOY_CELEBRATION.search(text): continue
        if _growth_context(inp) and BLACKLIST_SELF_HELP.search(text): continue
        out.append(p)
    return out

def _filter_freshness(pool, memory):
    recent = set(memory.get("recent_asset_ids", []))
    # Fragile-surface stability exception (Agent 6 R4)
    return [p for p in pool if p.asset_id not in recent or p.repeat_tolerance == "stable_anchor"]

def _tier_rank(t): return {"tier_1": 0, "tier_2": 1, "application": 2, "snippet": 3}.get(t, 4)

def _specificity_score(row, inp):
    score = 0
    if inp.state_family in row.state_fit_tags: score += 2
    if inp.path_intent and inp.path_intent in row.path_intent_tags: score += 1
    if inp.context in row.context_fit_tags: score += 1
    return score

def _quality_rank(status): return {"approved": 3, "variant_candidate": 2, "agent_audited": 1, "draft": 0}.get(status, 0)

def _tiebreak(pool, inp, trace):
    if len(pool) == 1: trace.tiebreak_reason = "unique_winner"; return pool
    # 3-level per contract
    # (a) tradition session diversity
    session_traditions = set(inp.memory.get("session_traditions", []))
    diverse = [p for p in pool if p.source_family not in session_traditions]
    if diverse and len(diverse) < len(pool):
        trace.tiebreak_reason = "session_diversity"
        return diverse + [p for p in pool if p not in diverse]
    # (b) founder weighting (config dict lookup)
    weight = _get_founder_weighting(pool[0].source_family)
    # (c) alphabetical asset_id — final determinism
    pool.sort(key=lambda r: r.asset_id)
    trace.tiebreak_reason = "alphabetical"
    return pool

def _render_with_truncation(row, inp):
    budget = _get_render_budget(inp.context, inp.interaction_type)
    hard_cap = budget.get("hard_cap", 90)
    # Layer 1: short_label
    if row.short_label and len(row.short_label) <= hard_cap:
        return row.short_label, "short_label"
    # Layer 2: plain_english first clause
    plain = row.plain_english or ""
    first_clause = re.split(r"[,;—]", plain)[0].strip()
    if first_clause and len(first_clause) <= hard_cap:
        return first_clause, "first_clause"
    # Layer 3: plain_english first sentence
    first_sentence = re.split(r"[.?!]", plain)[0].strip()
    if first_sentence and len(first_sentence) <= hard_cap:
        return first_sentence, "first_sentence"
    # Truncation failed — caller gets ok=false via the relaxation chain
    return "", "none"

def _relax(inp, trace):
    """6-step relaxation ladder per Agent 6 §4."""
    # Step 1: relax freshness (12h vs 24h)
    # Step 2: drop same-family gap
    # Step 3: broaden state_fit
    # Step 4: mode downgrade
    # Step 5: tier floor (T1→T2→snippet)
    # Step 6: hardcoded fallback → return []
    # ... (full impl ~60 LOC)
    return [], ["pool_exhaustion_fallback"]

def _is_interaction_allowed_on_surface(itype, surface):
    # Surface policy table (from Agent 3 §3 mapping)
    policy = {
        "joy_room": {"first_read_opening", "second_beat", "quiet_ack", "completion_anchor"},
        "growth_room": {"first_read_opening", "visible_reply", "completion_anchor"},
        "completion_core": {"completion_anchor"},
        "completion_support_grief": {"completion_anchor"},
        "completion_support_loneliness": {"completion_anchor"},
    }
    return itype in policy.get(surface, set())

def _emit_decision_log(trace):
    # Fire-and-forget Celery task (existing pattern from Phase C pilot)
    from celery import current_app
    current_app.send_task("core.wisdom.tasks.write_decision_trace", kwargs={"trace": asdict(trace)})

V1_INTERACTION_TYPES = {"first_read_opening", "second_beat", "quiet_ack", "visible_reply", "completion_anchor"}
```

LOC count: ~350 including imports and helpers. Fits one file.

---

## 4. REST endpoint

```python
# kalpx/core/wisdom/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from dataclasses import asdict
from .selector import pick_wisdom, WisdomSelectionInput

@api_view(["POST"])
@permission_classes([IsAuthenticatedOrReadOnly])  # supports unauth via X-Guest-UUID
def wisdom_pick(request):
    if not settings.MITRA_V3_WISDOM_SELECTOR_ENABLED:
        return Response({"ok": False, "fallback_reason": "env_flag_off"})
    try:
        inp = WisdomSelectionInput(**request.data)
    except (TypeError, ValueError) as e:
        return Response({"ok": False, "fallback_reason": f"invalid_input:{e}"}, status=400)
    out = pick_wisdom(inp)
    return Response(asdict(out))
```

Wired via `urls.py`: `path("wisdom/pick/", wisdom_pick, name="mitra-wisdom-pick")`.

---

## 5. 3 phrase blacklist families

```python
# kalpx/core/wisdom/phrase_blacklist.py
import re

BLACKLIST_GRIEF_BYPASS = re.compile(
    r"\b(let go|move on|time heals|silver lining|everything happens for a reason|"
    r"release|rise above|heal from|get over|just smile|be positive|it'?s for the best|"
    r"stay strong|in a better place|at peace now)\b", re.I
)
BLACKLIST_JOY_CELEBRATION = re.compile(
    r"\b(abundance|blessings|count your|manifest|level up|crushing it|thriving|"
    r"good vibes|high vibe|celebrate|victory|win|streak|nailed it|crush)\b", re.I
)
BLACKLIST_SELF_HELP = re.compile(
    r"\b(unlock|follow your heart|trust the universe|your truth|be your best|"
    r"limitless|unstoppable|manifest|transform your life|10x|next level|"
    r"breakthrough|reach your potential)\b", re.I
)
```

Identical patterns used in Pass A — consistency between build-time validation + runtime filter.

---

## 6. Env flags

```bash
MITRA_V3_WISDOM_SELECTOR_ENABLED=0   # default OFF; flip to 1 after cutover gates pass
MITRA_V3_SELECTOR_TRACE_SAMPLE_RATE=1.0   # full capture V1
```

Dual-gate safety: RN client also checks `EXPO_PUBLIC_MITRA_V3_WISDOM_SELECTOR_ENABLED=0` (Constants.expoConfig.extra). Both must be `=1` for real selector path.

---

## 7. 7-day deploy sequence (mapped to contract §8.1)

| Day | Work | Owner |
|---|---|---|
| 1-2 | Run Alembic migrations 0111-0117 on dev | engineer |
| 3 | Pass A + Pass B CSV bulk-load into wisdom_asset (migration 0117 reads the Pass B CSV) | engineer |
| 4 | selector.py + phrase_blacklist.py + views.py + tests green on dev | engineer |
| 5 | **Founder Pass C** — review 127 snippets + 4 grief/loss T1 + 5 Sanskrit wrappers | founder |
| 6-7 | Track 1 integration (Joy opening, Growth anchor, Completion anchor) + 9 fallback rows + CI gates | engineer + founder sign-off on fallback rows |

Flag flip `MITRA_V3_WISDOM_SELECTOR_ENABLED=1` on dev only after all cutover gates (§8.2 of contract) green.

---

**End of implementation spec. Ready for engineer pickup.**
