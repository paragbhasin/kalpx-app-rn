# Mitra v3 — Algorithm specs for Triad generation + Central reasoning

**Status:** LOCKED (2026-04-14). Founder sign-off received with
specific tunable values + path_intent addition. This doc is now the
implementation spec for Phases T1 + T2.
**Previous state:** REVIEW DRAFT — superseded by the locked values
below. Open questions in Part 3 are resolved in Part 0 "Locked
decisions."

---

## Part 0 — Locked decisions

### Triad weights (final)
| Signal | Weight | Notes |
|---|---|---|
| primary_kosha match | **4** | Kosha is the most load-bearing signal — raised from 3 to 4 to prevent additive bias matches from overpowering it |
| secondary_kosha match | 1 | Token acknowledgement |
| top_klesha match | 2 | Direct state signal |
| top_vritti match | 2 | Direct state signal |
| intervention_bias per match | +1 | Each merged-bias match adds additively |
| path_intent match | **+2** | NEW — see §0.2. Only if catalog item has explicit `path_intent_tags` |
| mode exact-fit | +1 | Rewards items authored `[mode]` exactly |
| duration_bias (practice only) | +1 | Direction match per `style_to_duration` |

### Low-confidence threshold: `0.4`

Below → `HARDCODED_FALLBACK` triad served, telemetry flagged
`fallback_reason="low_confidence"`.

### Tiebreak: `item_id` alphabetical (deterministic)

Freshness rotation deferred until telemetry is trusted.

### Lighten / deepen: ITEM IDENTITY PRESERVED

Both adjust reps / duration / burden only. Item swap is **only**
through reset / change-focus. Deepen additionally preserves
`path_intent` — deepen never mutates `restore` into `clarify`.

### Decision ladder (decide_moment) — final tweaks
- **Tier 3 long absence is tiered:**
  - 72h ≤ t < 168h → soft return (dashboard + `M_adaptation_toast` embed)
  - t ≥ 168h → strong (`M_identity_state_view`)
- **Tier 5 embeds capped at TOP 3**
- **Embed ordering:** priority first (as listed in §2), freshness second
- **Grief room re-entry:** fresh entry line again (not mid-options)
- **Trigger vs evening:** unresolved trigger wins
- **Path + joy + post-conflict:** post-conflict wins; joy demoted to
  embed or next session

### §0.2 — path_intent / movement_goal (new internal layer)

The triad selector does not optimize directly for `ananda`. It
optimizes for **the next honest movement**. `path_intent` is the
internal bridge between onboarding signals and catalog scoring.

```
path_intent: Literal[
    "settle",    # overload/volatility → ground down
    "clarify",   # confusion/vikalpa → illuminate next step
    "restore",   # depletion/tamas → gentle replenishment
    "hold",      # grief/loss → stay present with what is
    "soften",    # tension/dvesha → loosen resistance
    "deepen",    # steadiness present → deepen existing pattern
    "abide",     # devotion/bhakti → rest in presence
    "return",    # comparison/asmita → come back to self
    "steady",    # default / orientation-seeking
]
```

**Contract:**
- Derived AFTER signal assembly (between Step 3 and Step 4 of the
  triad algorithm)
- Persisted in `TriadReadonlyView.path_intent` (added)
- Scored as +2 when catalog items carry `path_intent_tags`
- Runs as a **coherence check** after initial top-of-score picks —
  if mantra/sankalp/practice together contradict path_intent (e.g.,
  `path_intent=restore` but mantra is aggressively energizing),
  re-pick the offending item from the next-best within its type and
  log `coherence_adjustment_used=True`
- `deepen` decisions preserve `path_intent` — day-14 "deepen" spawns
  a next cycle with the same `path_intent` and same items, deeper reps

---

**Status:** LOCKED (2026-04-14).
**Purpose:** implementation spec for Phases T1 + T2.

---

## Preamble

Per the reviewer's priority ordering:

| Priority | Algorithm | Current state | Why this priority |
|---|---|---|---|
| **1** | Triad generation | PARTIAL — `/journey/start/` still calls the legacy v2 selector with category/subCategory/level | The daily path is the core product promise. Until inference→selector is truly v3, the user's richer onboarding data is not driving the real item choice. |
| **2** | decide_moment (central reasoning) | SCATTERED — dashboard container + endpoints each decide locally | One sovereign brain that says "this moment today." FE consumes, doesn't invent. |
| 3 | Deepening (day-14 vritti_ratio) | CONTRACTED — thresholds locked, wiring TBD | After #1 and #2 land. |
| 4 | Welcome-back | CONTRACTED — needs #2 + CompanionState work | Follows reasoning. |

This doc covers Priority 1 and 2 only. Priority 3 + 4 documented in
`MITRA_SESSION_2026_04_14_COMPLETE.md` §4.5 and §4.6.

---

## Part 1 — Triad generation

### Goal

Given a completed 4-stage onboarding, produce a `TriadSelectionResult`
that (a) picks mantra + sankalp + practice from the authored library
using v3 signals end-to-end, (b) persists cycle-stably, and (c)
degrades gracefully on low-confidence inference or missing library
coverage.

### Inputs

Produced by existing `infer_mitra_state(stage0..3)`:
```
InferredState {
  lane:                "support" | "growth"
  life_context:        str          # from stage1 map
  primary_kosha:       str          # from stage2 map (weight 3)
  secondary_kosha:     str | None   # from stage2 map (weight 1)
  vritti_candidates:   list[str]    # ranked; [0] is top
  klesha_candidates:   list[str]    # ranked; [0] is top; strip "_low" suffix
  support_style:       str          # from stage3, default "grounding"
  intervention_bias:   list[str]    # merged [kosha_bias, vritti_bias,
                                    #         klesha_bias, style_bias]
  confidence:          float        # 0.0..1.0
  why_this_internal:   dict         # audit trail
}
```

Plus request-level:
```
  mode:    "universal" | "hybrid" | "rooted"
  locale:  "en" | "hi" | ...
  cycle_id: UUID        # newly minted per cycle
```

### Output

```
TriadSelectionResult {
  triad:       TriadReadonlyView {
                 cycle_id,
                 life_kosha     = primary_kosha,
                 life_klesha    = top_klesha,
                 life_vritti    = top_vritti,
                 life_goal      = life_context,
                 scan_focus     = derived,
               }
  mantra:      LibraryItem
  sankalp:     LibraryItem
  practice:    LibraryItem
  confidence:  float
  inference_snapshot: dict    # for audit + re-run
  mode_served: str            # after downgrade
  locale_served: str          # after downgrade
  fallback_used: bool
  fallback_reason: str | None
}
```

### Core algorithm

```python
def generate_triad(state: InferredState, *, mode, locale, cycle_id) \
        -> TriadSelectionResult:
    # Step 0 — low-confidence branch: skip scoring, serve sovereign fallback
    if state.confidence < LOW_CONFIDENCE_THRESHOLD:
        return fallback_triad(
            kosha=state.primary_kosha or "manomaya",
            cycle_id=cycle_id,
            reason="low_confidence",
        )

    # Step 1 — derive scan_focus from v3 ontology
    scan_focus = derive_scan_focus(state.lane, state.life_context,
                                    state.primary_kosha, state.support_style)

    # Step 2 — assemble signal bundle for scoring
    signals = {
        "primary_kosha":   state.primary_kosha,
        "secondary_kosha": state.secondary_kosha,
        "top_vritti":      _head(state.vritti_candidates),
        "top_klesha":      _strip_low(_head(state.klesha_candidates)),
        "life_context":    state.life_context,
        "support_style":   state.support_style,
        "intervention_bias": state.intervention_bias,  # list, merged
    }

    # Step 3 — per-type library pick (uses same scorer, different pool)
    mantra, m_meta = score_and_pick(
        LIBRARY_MANTRAS, signals, mode=mode, locale=locale,
        item_type="mantra",
    )
    sankalp, s_meta = score_and_pick(
        LIBRARY_SANKALPS, signals, mode=mode, locale=locale,
        item_type="sankalp",
    )
    practice, p_meta = score_and_pick(
        LIBRARY_PRACTICES, signals, mode=mode, locale=locale,
        item_type="practice",
        duration_bias=style_to_duration(state.support_style),
    )

    # Step 4 — assemble the frozen triad
    triad = TriadReadonlyView(
        cycle_id=cycle_id,
        life_kosha=state.primary_kosha,
        life_klesha=signals["top_klesha"],
        life_vritti=signals["top_vritti"],
        life_goal=state.life_context,
        scan_focus=scan_focus,
    )

    # Step 5 — combined meta (worst case wins for fallback_used/reason)
    fallback_used = any(m.fallback_used for m in [m_meta, s_meta, p_meta])
    mode_served = _strictest_mode([m_meta.mode, s_meta.mode, p_meta.mode])
    locale_served = _strictest_locale(
        [m_meta.locale, s_meta.locale, p_meta.locale])

    return TriadSelectionResult(
        triad=triad, mantra=mantra, sankalp=sankalp, practice=practice,
        confidence=state.confidence,
        inference_snapshot=state.as_dict(),
        mode_served=mode_served, locale_served=locale_served,
        fallback_used=fallback_used,
        fallback_reason=_collect_reasons(m_meta, s_meta, p_meta),
    )
```

### Scoring function

Each library item carries tags:
```
LibraryItem {
  item_id: str                         # stable analytics id
  item_type: "mantra" | "sankalp" | "practice"
  kosha_tags: list[str]                # panchakosha match
  klesha_tags: list[str]
  vritti_tags: list[str]
  intervention_tags: list[str]         # from the merged bias taxonomy
  mode_fit: list[str]                  # {universal, hybrid, rooted}
  locale_fit: list[str]                # {en, hi, sa, ...}
  duration_min: int | None             # practice only
  title, body, audio_url, devanagari, iast, ...
}
```

Scorer:
```python
SCORE_WEIGHTS = {
    "primary_kosha":     3,
    "secondary_kosha":   1,
    "top_klesha":        2,
    "top_vritti":        2,
    "intervention_per":  1,    # each match in intervention_bias list
    "mode_exact_fit":    1,    # item.mode_fit == [mode] (not generic)
    "duration_bias":     1,    # practice only + direction match
}

def score_item(item, signals, mode, duration_bias):
    s = 0
    if signals["primary_kosha"] in item.kosha_tags: s += 3
    if signals["secondary_kosha"] and signals["secondary_kosha"] in item.kosha_tags: s += 1
    if signals["top_klesha"] and signals["top_klesha"] in item.klesha_tags: s += 2
    if signals["top_vritti"] and signals["top_vritti"] in item.vritti_tags: s += 2
    s += sum(1 for iv in signals["intervention_bias"] if iv in item.intervention_tags)
    if item.mode_fit == [mode]:  # exact (not a superset)
        s += 1
    if duration_bias and item.item_type == "practice" and item.duration_min is not None:
        if duration_bias == "longer" and item.duration_min >= 7: s += 1
        elif duration_bias == "shorter" and item.duration_min <= 3: s += 1
    return s


def score_and_pick(catalog, signals, *, mode, locale, item_type, duration_bias=None):
    # Filter by item_type + mode + locale
    pool = [i for i in catalog
            if i.item_type == item_type
            and mode in i.mode_fit
            and locale in i.locale_fit]

    mode_served = mode
    locale_served = locale

    # Mode downgrade: rooted → hybrid → universal
    if not pool:
        for fallback_mode in _mode_chain(mode):
            mode_served = fallback_mode
            pool = [i for i in catalog
                    if i.item_type == item_type
                    and fallback_mode in i.mode_fit
                    and locale in i.locale_fit]
            if pool: break

    # Locale downgrade: ctx.locale → en
    if not pool:
        locale_served = "en"
        pool = [i for i in catalog
                if i.item_type == item_type
                and mode_served in i.mode_fit
                and "en" in i.locale_fit]

    # Still empty — hard fallback
    if not pool:
        return (HARDCODED_FALLBACK[item_type],
                ScoreMeta(fallback_used=True, reason="empty_catalog",
                          mode=mode_served, locale=locale_served))

    # Rank by score; break ties deterministically by item_id
    ranked = sorted(pool, key=lambda i: (-score_item(i, signals, mode_served, duration_bias), i.item_id))
    return (ranked[0],
            ScoreMeta(fallback_used=(mode_served != mode or locale_served != locale),
                      reason=("downgraded" if mode_served != mode or locale_served != locale else None),
                      mode=mode_served, locale=locale_served))
```

### Tunables (founder review required)

| Constant | Proposed | Notes |
|---|---|---|
| `LOW_CONFIDENCE_THRESHOLD` | `0.4` | Below → fallback triad. Session memory inference returned 0.3-0.85 in test cases; 0.4 catches "weak match" cases. |
| Kosha weight | `3` (primary) `1` (secondary) | Kosha is the most load-bearing signal. |
| Klesha + Vritti weights | `2` each | Equal weight; both are direct state signals. |
| Intervention-bias weight | `+1 per match` | Each merged bias contributes additively; long overlap → bigger boost. |
| Mode exact-fit bonus | `+1` | Reward items authored specifically for the requested mode. |
| Duration bias for practice | `longer` if support_style=practical, `shorter` if contemplative | See `style_to_duration()` below. |

```python
def style_to_duration(support_style):
    return {
        "practical":     "longer",    # user wants to DO
        "grounding":     "shorter",   # gentle entry
        "contemplative": "shorter",   # mental over physical
        "devotional":    "shorter",   # chant-centered
    }.get(support_style)
```

### Hardcoded fallback triad

```python
HARDCODED_FALLBACK = {
    "mantra":   LibraryItem(item_id="fallback.om_namah_shivaya",
                            title="Om Namah Shivaya",
                            devanagari="ॐ नमः शिवाय",
                            kosha_tags=["manomaya"]),
    "sankalp":  LibraryItem(item_id="fallback.sovereign_boundary",
                            title="I protect what matters and let the rest pass.",
                            kosha_tags=["vijnanamaya"]),
    "practice": LibraryItem(item_id="fallback.9_breaths",
                            title="Nine slow breaths, eyes soft",
                            duration_min=6,
                            kosha_tags=["pranamaya"]),
}
```

### Persistence + cycle invariants

Writes happen ONCE at cycle start, to `JourneyContext`:

```
JourneyContext (per user, per cycle)
  cycle_id            UUID
  life_kosha          str   ← triad.life_kosha
  life_klesha         str
  life_vritti         str
  life_goal           str
  scan_focus          str
  current_mantra_id   str
  current_sankalp_id  str
  current_practice_id str
  guidance_mode       str
  locale              str
  inference_snapshot  JSON  ← full state.as_dict() for audit
  confidence_at_pick  float
  fallback_used       bool
  fallback_reason     str | None
  created_at          ts
```

**Invariants (hard — must fail loud if violated):**
1. Once persisted, a cycle's mantra/sankalp/practice **IDs never
   change mid-cycle**. Only deepen/lighten actions adjust rep count
   or duration, never the item.
2. `TriadReadonlyView` is the ONLY read path for triad fields.
   Resolvers and selectors must import it (not the raw JourneyContext).
3. Re-running `generate_triad` on the same snapshot must return the
   same triad (tiebreaker: `item_id` alphabetical).
4. Cycle N+1 generates a new triad ONLY on explicit
   `continue_with_same` / `deepen` / `change_focus` decision. Never
   auto-regenerates.

### API contract proposal

```
POST /api/mitra/journey/start/     (existing — rewire)
  body: full onboarding state + mode + locale
  side effect: persist JourneyContext row
  response: TriadSelectionResult + companion payload

POST /api/mitra/journey/regenerate-triad/   (new)
  body: cycle_id + decision ("continue" | "deepen" | "change_focus")
  only allowed at cycle boundaries (day 14 or reset)
  response: TriadSelectionResult
```

### Test matrix

| Case | Inputs | Expected |
|---|---|---|
| Same inputs → same triad | Run `generate_triad` twice on identical state | Identical mantra/sankalp/practice item_ids |
| Strong kosha signal | `primary_kosha="pranamaya"` | mantra.kosha_tags contains "pranamaya" |
| Klesha bias changes pick | `top_klesha="raga"` vs `top_klesha="dvesha"` | Different sankalp IDs |
| Style changes duration | `practical` vs `grounding` | Different practice duration_min |
| Rooted mode downgrade | `mode="rooted"`, no rooted items in catalog | `mode_served="universal"`, `fallback_used=True` |
| Hi locale downgrade | `locale="hi"`, no Hindi items | `locale_served="en"`, `fallback_used=True` |
| Low confidence | `confidence=0.2` | `HARDCODED_FALLBACK` served, `fallback_reason="low_confidence"` |
| Empty catalog for mode+locale | filter yields 0 | `HARDCODED_FALLBACK` served, `fallback_reason="empty_catalog"` |
| Mid-cycle stability | Triad stored day 1, re-resolved day 5 | Identical item_ids |
| Support lane triad | `lane="support"`, `primary_kosha="annamaya"` | Body-oriented practice |
| Growth lane triad | `lane="growth"`, `life_context="devotion"` | Bhakti-tagged mantra |

---

## Part 2 — Central reasoning (decide_moment)

### Goal

One sovereign backend function that takes full context and returns:
"which moment should this user see right now?"

Frontend consumes the decision. Frontend **does not** decide.

### Inputs

```
ReasoningContext {
  life_layer:       TriadReadonlyView
  today_layer:      {today_kosha, today_vritti, today_klesha,
                     today_mood, trigger_pending, grief_signal,
                     isolation_signal}
  cycle_day:        int                        # 1..14+
  guidance_mode:    str
  locale:           str
  companion_state:  {last_surfaced_moment, last_surfaced_at,
                     last_open_at, pending_reflection_done,
                     post_conflict_pending, days_since_last_practice}
  support_signals:  {clear_window_active, predictive_alert_confidence,
                     joy_signal_present, entity_recognition_pending}
  return_ctx:       {is_return, hours_since_last_open,
                     local_time_slot: "morning"|"midday"|"evening"|"night"}
  user_id:          int | None
  request_id:       str
}
```

### Output

```
MomentDecision {
  moment_id:        str
  container_id:     str
  state_id:         str
  priority_reason:  str       # one of the ladder keys below
  entered_via:     str       # for MitraDecisionLog
  overlay:         bool       # true for sheets/overlays
  embeds:          list[str]  # dashboard-level companion embeds (if applicable)
  ttl_seconds:     int        # decision cache lifetime (typically ≤ 60s)
}
```

### Priority ladder (6 tiers, LOCKED)

Higher tiers win. Ties within a tier are impossible by construction
(each tier's preconditions are mutually exclusive).

```
TIER 1 — CYCLE MILESTONES (sovereign)
    day == 1   → M_first_day
    day == 7   → M24_checkpoint_day_7
    day == 14  → M25_checkpoint_day_14
    day == 15+ & cycle_complete_pending → M_cycle_complete_overview

TIER 2 — DEEP SUPPORT OVERRIDES (protect the vulnerable)
    anandamaya + (asmita | abhinivesha) + grief_signal     → M46_grief_room
    anandamaya + (asmita | abhinivesha) + isolation_signal → M47_loneliness_room
    trigger_pending                                        → M21_trigger_reflection
    post_trigger_complete & integration_pending            → M_post_trigger_mantra

TIER 3 — LONG-ABSENCE / CONTEXTUAL RETURN (welcome-back)
    hours_since_last_open >= 168       (7d+)  → M_identity_state_view
    hours_since_last_open >= 72  & <168 (3-7d) → M08 + M_adaptation_toast embed
    post_conflict_pending                      → M39_post_conflict_morning
    local_time_slot == "evening" & !pending_reflection_done
                                               → M35_evening_reflection

TIER 4 — PATH-MISMATCH ADJUSTMENT
    path == "support" & today.kosha != life.life_kosha
                                               → M_low_burden_day

TIER 5 — DASHBOARD EMBED TRIGGERS (inline, not full-screen)
    These don't own the screen — they surface as embedded cards
    on M08. Tier 5 always runs, cumulatively, BEFORE returning
    tier 6's dashboard.
      clear_window_active                      → add M43 embed
      predictive_alert_confidence >= 0.6       → add M28 embed
      joy_signal_present                        → add M44 embed
      entity_recognition_pending                → add M29 embed-chip
      resilience_narrative_available            → add M26 embed
      season_signal_active                      → add M45 embed

TIER 6 — PATH DEFAULT (fallback, NOT default)
    Only when all prior tiers yielded nothing:
      path == "growth"  → M08_day_active (growth chrome) + tier-5 embeds
      path == "support" → M08_day_active (support chrome) + tier-5 embeds
```

### Algorithm

```python
def decide_moment(ctx: ReasoningContext) -> MomentDecision:
    day = ctx.cycle_day
    today = ctx.today_layer
    life = ctx.life_layer
    cs = ctx.companion_state
    rc = ctx.return_ctx
    sig = ctx.support_signals

    # === TIER 1 — cycle milestones ===
    if day == 1:
        return _md("M_first_day", "companion_dashboard", "first_day",
                   "tier1_day_1_milestone")
    if day == 7:
        return _md("M24_checkpoint_day_7", "cycle_transitions", "day_7",
                   "tier1_day_7_milestone")
    if day == 14:
        return _md("M25_checkpoint_day_14", "cycle_transitions", "day_14",
                   "tier1_day_14_milestone")
    if day > 14 and cs.cycle_complete_pending:
        return _md("M_cycle_complete_overview", "cycle_transitions",
                   "complete_overview", "tier1_cycle_complete")

    # === TIER 2 — deep support overrides ===
    if today.kosha == "anandamaya" and today.klesha in ("asmita", "abhinivesha"):
        if today.grief_signal:
            return _md("M46_grief_room", "support_grief", "room",
                       "tier2_deep_support_grief")
        if today.isolation_signal:
            return _md("M47_loneliness_room", "support_loneliness", "room",
                       "tier2_deep_support_loneliness")
    if today.trigger_pending:
        return _md("M21_trigger_reflection", "support_trigger", "reflect",
                   "tier2_trigger_flow")
    if cs.post_trigger_complete and cs.integration_pending:
        return _md("M_post_trigger_mantra", "support_trigger",
                   "post_trigger_mantra", "tier2_integration_pending")

    # === TIER 3 — return-state overrides ===
    if rc.hours_since_last_open is not None and rc.hours_since_last_open >= 168:
        return _md("M_identity_state_view", "companion_dashboard",
                   "identity_state", "tier3_long_absence_7d")
    if cs.post_conflict_pending:
        return _md("M39_post_conflict_morning", "companion_dashboard",
                   "post_conflict", "tier3_post_conflict")
    if rc.local_time_slot == "evening" and not cs.pending_reflection_done:
        return _md("M35_evening_reflection", "reflection_evening",
                   "reflect", "tier3_evening_slot")

    # === TIER 4 — path-mismatch adjustment ===
    if (life.path == "support"
            and today.kosha
            and today.kosha != life.life_kosha):
        return _md("M_low_burden_day", "companion_dashboard", "low_burden",
                   "tier4_path_mismatch")

    # === TIER 5 — dashboard embeds (fall through to tier 6 with embeds) ===
    embeds = _collect_tier_5_embeds(sig, cs, today)

    # === TIER 6 — path default ===
    state_id = "day_active"
    reason = "tier6_path_default_growth" if life.path == "growth" \
             else "tier6_path_default_support"
    return _md("M08_day_active", "companion_dashboard", state_id,
               reason, embeds=embeds)


def _md(moment_id, container_id, state_id, priority_reason, embeds=None):
    return MomentDecision(
        moment_id=moment_id,
        container_id=container_id,
        state_id=state_id,
        priority_reason=priority_reason,
        entered_via=priority_reason,  # logged for telemetry
        overlay=container_id in {"why_this_overlay", "voice_consent",
                                 "voice_note", "prep_coaching"},
        embeds=embeds or [],
        ttl_seconds=30,
    )


def _collect_tier_5_embeds(sig, cs, today):
    embeds = []
    if sig.clear_window_active:                       embeds.append("M43_clear_window_banner")
    if sig.predictive_alert_confidence >= 0.6:         embeds.append("M28_predictive_alert_card")
    if sig.joy_signal_present:                         embeds.append("M44_gratitude_joy_card")
    if sig.entity_recognition_pending:                 embeds.append("M29_entity_recognition_sheet")
    if sig.resilience_narrative_available:             embeds.append("M26_resilience_narrative_card")
    if sig.season_signal_active:                       embeds.append("M45_season_signal_card")
    return embeds
```

### Contamination rules (must-hold invariants)

1. **Milestones are sovereign.** Day 1/7/14 NEVER composes with embeds or
   is replaced by tier-2 support. Even if grief signal + day 7 coexist,
   checkpoint wins. The checkpoint itself can route to grief room
   after submit if signal persists.

2. **Support-path surfaces never leak into growth-path default.** If
   the user is on growth path and a support signal fires (e.g., trigger),
   the reasoning respects the trigger but returns the user to a
   growth-chrome dashboard after, NOT the support default.

3. **Grief/loneliness rooms exit only via explicit action.** A user in
   M46/M47 who closes the app and reopens: reasoning re-evaluates.
   If the klesha/grief signal persists, M46 re-served. If it has
   cleared, normal routing. Never auto-evict mid-room.

4. **No default dashboard.** Tier 6 is a fallback, reached only when
   1–4 yield nothing. On cold-start from notification/deep-link,
   reasoning runs top-to-bottom every time.

5. **One decision per request.** Tier 5 embeds compose with tier 6's
   dashboard, but are enumerated once — the client does not re-evaluate
   embeds during the session.

### "No default dashboard" enforcement

A CI/runtime assertion rejects any resolve that:
- Is triggered by a "return" event (cold-start, notification tap)
- AND returns `M08_day_active` with `priority_reason`
  `tier6_path_default_*`
- AND the return_ctx has `hours_since_last_open >= 72` or
  `post_conflict_pending==True` or `local_time_slot=="evening"` with
  unresolved reflection

Such a case is a bug — one of the tier 3 checks failed to trigger
when it should have.

### API contract proposal

```
POST /api/mitra/reasoning/decide_moment/      (new)
  body: ReasoningContext (server fills most from session; client
        only supplies return_ctx + guidance_mode + locale)
  response: MomentDecision
  cache: server-side per (user_id + request_id) for 30s (ttl_seconds)
  gate:  MITRA_V3_REASONING_ENABLED=1 (new env flag)
```

### Test matrix

| Case | Inputs (key fields) | Expected |
|---|---|---|
| Day 1 always wins | `day=1` + every signal in world | `M_first_day`, reason `tier1_day_1_milestone` |
| Day 7 beats grief | `day=7` + `grief_signal=True` | `M24_checkpoint_day_7`, NOT M46 |
| Deep grief on normal day | `day=5, today.kosha=anandamaya, klesha=asmita, grief_signal=True` | `M46_grief_room` |
| Trigger beats evening | `trigger_pending=True, local_time_slot=evening` | `M21_trigger_reflection` |
| Long absence beats post-conflict | `hours_since_last_open=200, post_conflict_pending=True` | `M_identity_state_view` |
| Path mismatch → low_burden | `life.path=support, today.kosha!=life.life_kosha, no triggers` | `M_low_burden_day` |
| Evening reflection slot | `hours_since_last_open=2, evening, !reflection_done` | `M35_evening_reflection` |
| Growth path with joy signal | `path=growth, joy_signal_present, normal day` | `M08_day_active` + embeds contains `M44` |
| Support path default | `path=support, no signals, day=5, morning` | `M08_day_active` w/ `tier6_path_default_support` + any matching tier-5 embeds |
| Support leakage test | Growth-path user, post-conflict pending | `M39` THEN next decide returns growth-chrome dashboard |
| Deep support re-entry | M46 user closes app, grief_signal still True | Re-entry returns M46 again |
| Cycle complete | `day=15, cycle_complete_pending=True` | `M_cycle_complete_overview` |

---

## Part 3 — Open questions for founder

These are design calls where my guess in this doc may not match the
founder's intent. Before implementation, each needs a yes/no/refine:

### Triad generation
1. **`LOW_CONFIDENCE_THRESHOLD = 0.4`** — too tight, too loose?
2. **Scoring weights** — `3/2/2/1-per-bias/+1 mode-exact`. Any weight
   you want rebalanced? Specifically: is kosha really 3× a single
   intervention-bias match, or should kosha be more dominant (e.g., 5)?
3. **Secondary kosha weight 1** — token acknowledgement, or lift to 2?
4. **Exact-mode-fit bonus** — should rooted mode aggressively prefer
   items authored `[rooted]` only, so it never serves a generic
   `[universal, rooted]` item when a rooted-only exists? Current
   design: yes (+1 for exact fit).
5. **Tiebreak by `item_id`** — deterministic but alphabetically
   arbitrary. Alternative: tiebreak by `item.serve_count` ascending
   (rotate freshness). Which?
6. **Deepen/regenerate policy** — "deepen never swaps the item" is
   strict. Should day-7 `lighten` ALSO keep the item (just reduce rep
   count), or should `lighten` allow item swap if something simpler fits?

### Central reasoning
7. **Tier 3 "long absence" threshold** — 7 days? 3 days? Tiered
   (3d → soft welcome, 7d → identity_state_view)?
8. **Tier 2 trigger_pending** — does any trigger signal beat M35
   evening reflection, or should evening-slot win for resolved
   triggers where only a mild residue remains?
9. **Tier 5 embed count cap** — if 6 signals fire simultaneously, do we
   show all 6 cards on dashboard, or cap at top 3 by priority?
10. **Dashboard embed ordering** — by priority (clear_window > predictive
    > joy > entity > resilience > season), or by signal freshness?
11. **Support ↔ growth contamination** — if a support-path user has
    joy_signal AND post-conflict pending, does post-conflict win (tier 3)
    and joy becomes next-session? Current answer: yes, tier 3 wins.
12. **Re-entry to grief/loneliness** — when user closes and reopens,
    do we show the entry line again or continue with the options step?
    Current answer: re-entry re-evaluates, opens fresh. Founder call.

---

## Part 4 — Sequencing

Once founder approves this spec:

**Phase T1 (Triad generation) — ~1 week**
1. Author the LibraryItem tagging taxonomy in a doc (week 1 day 1) so
   catalog authors know what tags to add.
2. Extend `library_catalog_*.csv` headers with `kosha_tags`,
   `klesha_tags`, `vritti_tags`, `intervention_tags`, `mode_fit`,
   `locale_fit`. Existing rows get a first-pass tagging.
3. Implement `score_and_pick` + `generate_triad` in
   `kalpx/core/reasoning/triad_selector.py`.
4. Rewire `POST /api/mitra/journey/start/` to call v3 selector.
5. Migration: `JourneyContext` fields for `inference_snapshot`,
   `confidence_at_pick`, `fallback_used`.
6. Test matrix in `tests_triad_selector.py`.
7. Stop-gates on dev: reproducibility, confidence branching, downgrade
   paths, at least 3 distinct onboarding profiles producing distinct
   triads.

**Phase T2 (decide_moment) — ~1 week**
1. Implement `kalpx/core/reasoning/moment_router.py::decide_moment()`
   plus `POST /api/mitra/reasoning/decide_moment/` endpoint.
2. Flag-gate: `MITRA_V3_REASONING_ENABLED=1`.
3. Server-side cache (Redis) per `(user_id, request_id)` for 30s.
4. Test matrix in `tests_moment_router.py` covering all 6 tiers.
5. FE: dashboard, return-nav, deep-link, notification tap ALL call
   `decide_moment` and navigate to the returned container+state.
   FE branching logic for "which moment" is removed.
6. Stop-gates on dev: every test-matrix case returns the expected
   moment_id; contamination rules proven via explicit cross-path tests.

After T1 + T2 green, Phase T3 (deepening) and T4 (welcome-back full
state memory) follow. Both lean on T1 + T2 as foundation.

---

## Ready for review

Please mark up this doc (or reply inline) with:
- Answers to §3 open questions
- Any weight / threshold rebalancing
- Any priority-ladder reordering
- Any missing tier (e.g., predictive alert full override?)

Once locked, I'll open Phase T1 immediately.
