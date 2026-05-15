# Lifecycle Memory Contract — v1.0

**Status:** LOCKED 2026-04-16. Founder-approved.
**Scope:** What state survives app exit, long absence, cycle boundary, and device change. Single source of truth for persistence/resume behavior.

---

## Core principle

Mitra remembers what matters. State that shapes the user's experience must survive normal lifecycle events (app kill, overnight gap, weekend gap). State that is truly ephemeral (mid-flow draft, animation position) should not leak between sessions.

Hard rule: the user should NEVER feel like Mitra forgot them because the app was restarted.

---

## State survival matrix

| Field | Storage | Survives app exit | Survives ≤48h gap | Survives 3-30d gap | Survives ≥30d gap | Reset at cycle boundary | Welcome-back visible |
|---|---|---|---|---|---|---|---|
| **path_intent** | JourneyContext (DB) | ✅ | ✅ | ✅ | ✅ | ✅ (preserved on continue/deepen; re-derived on change_focus) | ✅ (drives welcome-back opener) |
| **cycle triad IDs** (mantra/sankalp/practice) | Journey (DB) | ✅ | ✅ | ✅ | ✅ | ✅ (preserved on continue/deepen; cleared on change_focus) | No |
| **cycle_burden_level** (L0/L1/L2) | Journey (DB) | ✅ | ✅ | ✅ | ✅ | ✅ (inherited on continue; bumped on deepen; decremented on lighten; reset to L1 on change_focus) | No |
| **primary_kosha / primary_klesha / primary_vritti** | JourneyContext (DB) | ✅ | ✅ | ✅ | ✅ | ✅ (re-derived only on change_focus → new onboarding) | No |
| **confidence_at_pick** | JourneyContext (DB) | ✅ | ✅ | ✅ | ✅ | ✅ (updated on next triad generation) | No |
| **day14_checkpoint_presented_at** | Journey (DB) | ✅ | ✅ | ✅ | ✅ | Cleared implicitly (journey status → completed) | ✅ (if unresolved: forces reentry_target=day14_boundary) |
| **movement_goal_label** | JourneyContext (DB) | ✅ | ✅ | ✅ | ✅ | Preserved (derived from path_intent) | No |
| **rupture_inferred** | JourneyContext (DB) | ✅ | ✅ | ✅ | ✅ | Cleared (re-evaluated at next triad generation) | No |
| **lightened** | Journey (DB) | ✅ | ✅ | ✅ | ✅ | Preserved on continue; reset on new cycle via change_focus | No |
| **kalpx_day14_pending** | AsyncStorage (FE) | ✅ | ✅ | ✅ | ✅ | Cleared on successful checkpoint submit | No |
| **checkpoint_completed** | Redux (FE) | ❌ (in-memory; lost on app kill) | ❌ | ❌ | ❌ | N/A | No |
| **checkpoint_day** | Redux (FE) | ❌ | ❌ | ❌ | ❌ | N/A | No |
| **crisis_payload** | Redux (FE) | ❌ | ❌ | ❌ | ❌ | N/A | No |
| **MitraDecisionLog** | DB (append-only) | ✅ forever | ✅ | ✅ | ✅ | Never cleared | ✅ (self-learning reads full history) |
| **JourneyActivity** | DB (append-only) | ✅ forever | ✅ | ✅ | ✅ | Never cleared | No |

---

## Cycle-boundary rules

When the user submits a Day-14 decision:

### continue_same
- Same triad IDs → copied verbatim
- Same path_intent → JourneyContext untouched
- Same burden_level → inherited from previous cycle
- cycle_number += 1
- cycle_day resets to 1
- NO re-onboarding

### deepen_gently
- Same triad IDs → copied verbatim
- Same path_intent → JourneyContext untouched
- burden_level → bumped to L2 (or stays L2 if already there)
- Optional: cycle_deepen_item added alongside core triad
- cycle_number += 1
- NO re-onboarding

### change_focus / start_fresh
- Triad IDs → cleared (new selection from short reorientation)
- path_intent → re-derived from new inference
- burden_level → reset to L1
- cycle_number = 1 (new path)
- Short reorientation flow (NOT full onboarding by default)

### lighten (Day-7)
- Triad IDs → unchanged (same journey, same cycle)
- burden_level → decremented to L0
- lightened = True
- Remaining completion_rule → any_one
- cycle continues; no new journey created

---

## Welcome-back behavior

When the user returns after absence:

### ≤48 hours
- Normal dashboard. No welcome-back screen.
- All state intact (DB-persisted).

### 48h – 30 days
- `journey_status` returns `hasActiveJourney: true`.
- Home.tsx auto-routes to companion_dashboard.
- **If day14 unresolved** → `checkpointPending: true, reentryTarget: day14_boundary` (T1l plumbing).
- All state intact.

### ≥30 days (without unresolved day14)
- `journey_status` returns `welcomeBack: true, expired: true`.
- `welcomeBackLine` carries the per-intent opener (T2c).
- User gets WelcomeBack screen with decision: continue (same path) or fresh (new path).
- On "continue": triad reused if prior transition_type was continue_same/deepen; new selection otherwise.
- On "fresh": full onboarding.

### ≥30 days (WITH unresolved day14)
- T1l pre-check overrides the expiry path.
- `journey_status` returns `hasActiveJourney: true, checkpointPending: true, reentryTarget: day14_boundary`.
- User enters the Day-14 boundary decision (not welcome-back).
- **The boundary decision is NEVER silently dropped** — this was the hardest audit bug, fixed in T1l.

---

## What welcome-back remembers

| Signal | Where it's stored | How it's used |
|---|---|---|
| Last path_intent | JourneyContext.path_intent | Welcome-back opener is chosen per intent (P6 lines) |
| Unresolved boundary | Journey.day14_checkpoint_presented_at | Forces reentry_target=day14_boundary via is_day14_unresolved() |
| Last surfaced moment | MitraDecisionLog (latest row) | decide_moment considers recent history for suppression / cooldowns |
| Last triad burden level | Journey.cycle_burden_level | Inherited on continue; bumped on deepen; decremented on lighten |
| Last cycle classification | Computed live from engagement signals | NOT stored separately (recomputed at checkpoint GET) |

---

## Hard rules (inviolable)

1. **path_intent never silently re-derives** on continue/deepen. Only change_focus triggers re-derivation (via new onboarding → journey_start_v3).
2. **L0/L1/L2 may change burden, depth, and framing — never item identity, path_intent, or directional meaning.** (Founder directive 2026-04-16.)
3. **Unresolved Day-14 boundary cannot be dropped** by welcome-back, expiry, or any other lifecycle event. Only grief/loneliness/crisis may interrupt it (P4 matrix).
4. **MitraDecisionLog and JourneyActivity are append-only.** No deletes. Self-learning depends on full history.
5. **Redux state is ephemeral.** Any field that MUST survive app kill must have a BE counterpart (DB or AsyncStorage).

---

## P5 burden-level semantics (locked)

| Level | Mantras | Practices | Sankalps |
|---|---|---|---|
| **L0 lighten** | Half reps, simplified framing, no silent integration | Fewer steps, shorter duration | Phrase only (no commentary) |
| **L1 default** | Standard authored form | Standard authored form | Full sankalp |
| **L2 deepen** | Double reps, Sanskrit + meaning, silent integration post-chant | All steps, longer duration | Sankalp + brief supportive commentary |

**What L0/L1/L2 can change:** burden, depth, framing, duration, repetition count, whether Sanskrit is present.
**What L0/L1/L2 cannot change:** item_id, path_intent_tags, kosha/klesha/vritti association, the core action (chant → silent reflection transition is OK; mantra → journaling is NOT).

---

## Storage architecture summary

```
DB (PostgreSQL)
├── Journey          → triad IDs, burden_level, lightened, day14_presented_at,
│                      transition_type, path_lineage, cycle_number
├── JourneyContext   → path_intent, kosha, klesha, vritti, confidence,
│                      movement_goal_label, rupture_inferred,
│                      hard_fallback, downgrade_applied,
│                      coherence_adjustment_used, inference_snapshot
├── MitraDecisionLog → append-only telemetry (moment_surfaced, path, signals)
└── JourneyActivity  → append-only engagement (checkin, trigger, feedback)

AsyncStorage (FE)
├── kalpx_day14_pending → checkpoint guard (cleared on submit)
├── access_token        → auth
├── refresh_token       → auth
└── user_id             → auth

Redux (FE, in-memory only)
├── screen.screenData   → all flow-local state (checkpoint_completed,
│                         crisis_payload, checkin_step, etc.)
└── login.user          → auth state
```

---

**Contract end.** All persistence decisions traceable to the audits (DAY14_AUDIT, SUPPORT_ADVICE_AUDIT) and the P4/P5/P6/P10 content ratifications above.
