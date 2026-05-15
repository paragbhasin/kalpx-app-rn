# Support / Advice Flow Audit — 2026-04-16

**Scope:** Read-only audit of the current BE + FE support/advice layer vs the target signal-driven selection we want in T3.
**No code changed.** Findings below are the scope spec for Phase T3.

---

## 1. Current end-to-end flow

The support/advice layer has **five entry points**, none of which share a signal contract with the triad selector:

1. **`POST /api/mitra/prana-acknowledge/`** (`mitra_views.py:2548`) — "check-in" after the user names how they feel. Pipeline: `normalize_mitra_context()` → `mitra_selection.select_items()` → `build_prana_response()`. Reads `focus`, `sub_focus`, `prana_type`, `depth`, `baseline_metrics`. Writes `JourneyActivity(activity_type="checkin")`.
2. **`POST /api/mitra/trigger-mantras/`** (`mitra_views.py:2708`) — dysregulated trigger flow. Same pipeline as prana with stricter safety gating (`beginner_safe`, no experimental, `effect_type ∈ {calming, grounding, restorative, releasing, protective}`). Reads `feeling`, `focus`, `sub_focus`, `depth`, `round`, `previousSuggestion*`.
3. **`GET /api/mitra/support/grief-context/`** (`mitra_views.py:7268`) — grief room content. Pipeline: `CompanionState.preferred_guidance_mode` → `support_grief_templates.yaml:modes[mode]` + hardcoded `principle_hint={"id": "karuna"}` at line 7341.
4. **`GET /api/mitra/support/loneliness-context/`** (`mitra_views.py:7377`) — parallel to grief. Hardcoded `principle_hint={"id": "sat_sanga"}` at line 7475.
5. **`GET /api/mitra/voice/notes/<id>/interpretation/`** (`mitra_views.py:7210`) — returns Bedrock Haiku output (`reasoning/text_interpreter.py:102+`). Never feeds back into support selection.

**FE entry points:** dashboard buttons in `kalpx-app-rn/src/extensions/moments/new_dashboard/index.tsx:186–245` (grief, loneliness, trigger, check-in); `CheckInRegulationBlock.tsx:85–94` (chip taps); direct-tap flows at `grief_room/index.tsx` + `loneliness_room/index.tsx` (Phase C scaffolds — NOT yet wired into `ScreenRenderer`; legacy `containers/GriefRoomContainer.tsx` + `LonelinessRoomContainer.tsx` remain active).

---

## 2. Real authority today

| Surface | Authority | Evidence |
|---|---|---|
| prana_acknowledge | (a) `mitra_selection.py:24–74` candidate pool + `mitra_normalization.py:283–399` | reads focus/sub_focus/prana_type only |
| trigger_mantras | (a) same pipeline + stricter safety gate (`mitra_selection.py:81–145`) | reads feeling/round/depth only |
| grief_context | (c) YAML resolver (`support_grief_templates.yaml`) + hardcoded principle | `mitra_views.py:7290–7341` |
| loneliness_context | (c) YAML resolver (`support_loneliness_templates.yaml`) + hardcoded principle | `mitra_views.py:7406–7475` |
| voice interpretation | (f) Bedrock LLM (Claude Haiku) → stored but never read | `text_interpreter.py:102–228` |
| grief_room UI (M46) | Phase C spine pilot — scaffold only, NOT live | `grief_room/index.tsx:130` calls `mitraResolveMoment` |
| loneliness_room UI (M47) | same as M46 | `loneliness_room/index.tsx:112` |

**Multiple authorities, no coordination.** `mitra_selection` (Python pipeline) and the YAML resolvers and the Bedrock classifier all exist in parallel with no shared signal bundle or shared arbitration.

---

## 3. Signal usage matrix

| Signal | prana_ack | trigger_mantras | grief_ctx | loneliness_ctx | voice_interp |
|---|---|---|---|---|---|
| primary_kosha | not_used | not_used | not_used | not_used | not_used |
| top_klesha | not_used | not_used | not_used | not_used | not_used |
| top_vritti | not_used | not_used | not_used | not_used | not_used |
| life_context | not_used | not_used | not_used | not_used | not_used |
| support_style | not_used | not_used | not_used | not_used | not_used |
| **path_intent** | **not_used** | **not_used** | **not_used** | **not_used** | **not_used** |
| principle YAMLs | not_used | not_used | hardcoded (karuna) | hardcoded (sat_sanga) | partial (supports_principle_domains output; never consumed downstream) |
| moment priority ladder (T2) | not_used | not_used | not_used | not_used | not_used |

Every cell in the path_intent row is **not_used**. Every cell in the kosha/klesha/vritti/life_context/support_style rows is **not_used**. The support layer ignores the full inference bundle the triad selector just shipped.

Evidence of non-usage:
- `mitra_views.py:2744–2750` (trigger_mantras request parsing) — no kosha/klesha/vritti read
- `mitra_views.py:7290–7294` (grief) — only `preferred_guidance_mode`
- `mitra_views.py:7406–7416` (loneliness) — only `preferred_guidance_mode`
- `grep -r "path_intent" kalpx-app-rn/src/` → **zero matches**
- `grep -r "path_intent" kalpx/core/mitra_views.py` within support handlers → zero matches

---

## 4. Spine coverage

**On the new spine (MomentDeclaration + ContentPack):**
- M46_grief_room (`core/data_seed/mitra_v3/moments/M46_grief_room.yaml:31`)
- M47_loneliness_room (parallel structure)
- M20_checkin_regulation (referenced by `CheckInRegulationBlock.tsx:26–64` via `useContentSlots`)

**NOT on spine (hardcoded Python / YAML template without MomentDeclaration):**
- prana_acknowledge — no `.yaml` declaration
- trigger_mantras — no `.yaml` declaration
- grief_context endpoint — resolved from `support_grief_templates.yaml` but not a MomentDeclaration
- loneliness_context endpoint — same
- voice_notes_interpretation — pure data fetch, no moment

**FE mismatch:** `grief_room/index.tsx` + `loneliness_room/index.tsx` (Phase C scaffolds, spine-compliant) are authored but **not wired into `ScreenRenderer.tsx`**. Live surfaces today remain the legacy `GriefRoomContainer.tsx` + `LonelinessRoomContainer.tsx` with hardcoded English fallbacks (`mitraApi.ts:1206–1219` for grief; `1233–1251` for loneliness).

**Content sovereignty manifest consequence:** sovereignty checks aren't enforced against the live-routed surfaces yet. Migration hasn't closed because two parallel implementations exist.

---

## 5. Triad interaction

**Shared inference state:** partial — only at the `focus` / `sub_focus` / `state_family` layer via `normalize_mitra_context()`. kosha/klesha/vritti/path_intent are **not** propagated from the triad context into support selection.

**Can support contradict the triad?** Yes, today. Concrete example:
- User's cycle path_intent = `return` (stabilize_and_return after the rupture fix we shipped)
- User taps "I feel triggered" → `trigger_mantras` endpoint runs
- Pipeline reads feeling/focus/sub_focus only; path_intent=return is invisible
- Safety gate excludes energizing/activating items but **does not** exclude `heart_opening`, `forgiveness_first`, `reflective_journaling` — the exact tones the triad selector's deny-list rejects for return
- Result: the user gets an Anahata/forgiveness mantra as a support suggestion while their triad is actively steering away from that tone

**MitraDecisionLog writes:** triad (`triad_generation`) writes a row per pick. Support writes `JourneyActivity(activity_type="checkin" | "trigger")` but **NOT** `MitraDecisionLog`. Telemetry is split across two tables; the new self-learning layer can't read support decisions in the same query as triad decisions.

**decide_moment integration:** zero. None of the five support endpoints call `decide_moment` or the `moment/next/` endpoint. Grief/loneliness triggers from the dashboard bypass the router entirely.

---

## 6. Biggest gaps

1. **Path_intent contradiction risk** — support picks can directly contradict the user's active cycle path_intent. Highest user-harm bug in the current support layer.
2. **Signal bundle duplication** — inference computes 8 signals; support endpoints use 2 (focus, sub_focus). The other 6 are recomputed-or-ignored per endpoint.
3. **Principle library disconnected** — 303 WisdomPrinciple rows with kosha/klesha tags exist; grief/loneliness endpoints hardcode a single principle constant. Zero ranked selection.
4. **Voice interpretation orphan** — `TextInterpreter` outputs `suggested_support_context` (anxiety_spike/low_energy/loneliness/grief/celebration/overload), but no endpoint consumes it. `intent_router.py` keyword mapping exists but is never called server-side.
5. **Crisis path is vocabulary-only** — `DecideContext.crisis_triggered` exists in T2 + P4 YAML rules, but **no code anywhere sets it True**. No keyword detector, no escalation route, no FE "I'm not safe" button. Safety gap.
6. **Two implementations of grief/loneliness rooms** — Phase C scaffolds (spine-compliant, not wired) + legacy containers (live, hardcoded fallback). Migration not closed.
7. **Telemetry split** — support decisions in JourneyActivity, triad decisions in MitraDecisionLog. Self-learning analyzer can't correlate.
8. **Undefined FE actions** — `new_dashboard/index.tsx:189` dispatches `open_trigger` and `:233` dispatches `open_check_in`, neither implemented in actionExecutor. Runtime error waiting.

---

## 7. Should support use triad-like logic? What shared vs separate?

**Yes — support should reuse the triad's signal-driven logic, with these sharing rules:**

### Shared (single source of truth)
- **Inference bundle** — kosha/klesha/vritti/life_context/support_style/path_intent MUST be read from the same `JourneyContext` row the triad reads from. Support endpoints become callers of `build_decide_context_from_journey()` (already exists from T2b).
- **Path_intent** — support MUST respect the active cycle's path_intent. If path_intent=`return`, the support scorer inherits the same deny-list (no `heart_opening`, `forgiveness_first`, etc.). This is the highest-leverage fix.
- **Content resolution** — all support moments migrate to the content spine (`MomentDeclaration` + `ContentPack`). Retires the two YAML template files and the hardcoded principle constants.
- **Telemetry** — support decisions write `MitraDecisionLog` with `moment_surfaced ∈ {support_checkin, support_trigger, grief_room, loneliness_room}`. Retires the JourneyActivity-only log path.
- **Principle ranking** — when principle picks matter (grief, loneliness, advice), use ranked WisdomPrinciple query (kosha/klesha filter + weight) instead of hardcoded constants.

### Separate (distinct concerns)
- **Selection algorithm** — support selection has a different objective (respond to acute state) than triad (set 14-day anchor). Different scorers: triad optimizes for path_intent match + mode fit; support optimizes for immediate regulation + safety gating. BOTH scorers consume the same signal bundle but apply different weights.
- **Safety gates** — support has strict safety gates (trigger mode rejects `energizing`/`activating`, requires `beginner_safe`, checks `contraindications` for grief-adjacent state). Triad does not need these. Keep the existing `mitra_selection._apply_safety_gating()` logic.
- **Voice/text intent classification** — this is a pre-step that produces a support-context label, not a pick. It feeds INTO selection but isn't selection itself.
- **Crisis detection** — dedicated classifier (keyword + severity threshold) that sets `crisis_triggered=True` before selection runs. Shared with decide_moment router but OWNED by the support layer's entry point.

---

## 8. Proposed T3 scope (direct mapping from findings)

1. **Unify signal bundle** — every support endpoint builds a `DecideContext` (or equivalent) from live `Journey` + `JourneyContext`, passes to a shared `select_support(ctx, surface_kind)` function. Closes gaps 1 + 2.
2. **Ship `path_intent` propagation into support** — the single highest-leverage fix. Scorer inherits triad's deny-list. Closes gap 1.
3. **Wire voice interpretation → support selection** — `TextInterpreter.suggested_support_context` + `intent_router.INTENT_MAPPINGS` become valid inputs to `select_support`. Closes gap 4.
4. **Migrate 4 endpoints onto the spine** — prana_acknowledge, trigger_mantras, grief_context, loneliness_context each get a `MomentDeclaration` + `ContentPack`. Retire hardcoded principles. Closes gaps 3 + 6.
5. **Ship crisis detector** — keyword + urgency classifier that sets `crisis_triggered=True` on dangerous inputs. Wire into `decide_moment` and into support entry points. Closes gap 5 (safety).
6. **Unify telemetry** — support endpoints write `MitraDecisionLog` alongside `JourneyActivity`. Closes gap 7.
7. **Fix undefined FE actions** — implement or remove `open_trigger` / `open_check_in` in `actionExecutor`. Closes gap 8.
8. **Retire legacy grief/loneliness containers** — ship the Phase C scaffolds into `ScreenRenderer`, delete the hardcoded English fallbacks. Closes gap 6.

**Sequence:** 2 first (highest leverage, smallest diff), then 1 + 6 (infra), then 4 + 8 (migration), then 3 (voice wiring), then 5 (crisis), then 7 (housekeeping).

---

## 9. Recommendation

**`needs_targeted_consolidation`** — not a rewrite. All five endpoints work; they just don't share the inference bundle or coordinate with the triad. T3 is a signal-propagation PR plus a migration series, not a ground-up reimplementation.

**Most urgent:** gap 1 (path_intent contradiction) + gap 5 (crisis detector). Everything else is quality work.

---

**Audit end.** All claims cited with file:line. No code changed.
