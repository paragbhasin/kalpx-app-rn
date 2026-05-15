# Mitra Stack: Legacy vs v3 API Audit
**Date:** 2026-04-17 (initial) · Revised 2026-04-18
**Scope:** kalpx-app-rn (pavani) + kalpx (dev)
**Audit:** FE API call map + backend view classification + offline fallback shape analysis

---

## ⚠️ 2026-04-18 ADDENDUM — corrections from executing Tier-1

After executing Tier-1 quick wins in session 2026-04-18, 3 findings from the
original audit need correction:

1. **`/journey/status/` → `/journey/home/` is NOT a compatible swap.**
   Shapes differ: `/status/` returns `{hasActiveJourney, journeyId, dayNumber, welcomeBack}` (existence check); `/home/` returns `{response_type, layout, body_lines, chips, context, meta}` (full decision payload).
   5 callers need per-caller work. **Migration DEFERRED.**

2. **`mitraPathEvolution` is NOT zero-call-site.** Used at
   `actionExecutor.ts:2475`. **KEPT.**

3. **`mitraResetPlan` + `mitraInfoScreen` ARE dead.** Deleted in
   commit `e46abb8`.

### Tier-1 execution log

| Item | Status | Reason |
|---|---|---|
| Delete 3 zero-call-site stubs | 2/3 done (`e46abb8`) | `mitraPathEvolution` kept |
| Switch 5 `/journey/status/` callers → `/journey/home/` | DEFERRED | Shape incompatible |
| Clarify weekly-reflection 404 fallback | DONE (`e46abb8`) | Removed shape-mismatched /status/ fallback |
| Draft Phase 6 RFC: track-event → MitraDecisionLog | DONE | `kalpx/docs/mitra-v3/RFC_TRACK_EVENT_TO_DECISION_LOG.md` |

---

## 1. TL;DR + Migration Summary

### Status
- **42 total Mitra endpoints** in FE (all via `src/engine/mitraApi.ts`)
- **18 legacy/v2-era endpoints** still in codebase (generate-companion, track-event, info-screen, path-evolution, reset-plan, checkpoint, additional/*), most with v3 alternatives
- **24 v3-clean endpoints** (journey/home, journey/companion, content/moments/resolve, crisis, voice, predictive, prep, etc.)
- **No direct API calls outside mitraApi.ts** — all FE routes through the wrapper layer (excellent encapsulation)
- **All 22 moment extensions** are pure UI/orchestration — zero direct API calls

### Migration Priority Count
- **1 critical blocker:** `/mitra/generate-companion/` called from `actionExecutor.ts` at high volume (journey creation side effect)
- **2 high-priority switches:** `/mitra/journey/status/` has v3 alternative `/journey/home/`; `/mitra/track-event/` has MitraDecisionLog path
- **5 moderate migrations:** `checkpoint`, `info-screen`, `path-evolution`, `reset-plan`, `additional/*` endpoints
- **Zero breaking migrations:** all v3 endpoints are read-only or side-effect-isolated

---

## 2. Full FE API Call Map (Classified)

### v3 Clean Endpoints (Read-Only, Content-Pack-Driven)
| Endpoint | Call Site | Usage | Status |
|----------|-----------|-------|--------|
| `GET /mitra/journey/home/` | `ContinueJourney.tsx:192` | Dashboard routing signal + home layout | **v3_clean** ✓ |
| `GET /mitra/journey/companion/` | `NewDashboardContainer.tsx:139` (2026-04-18: primary use) | Read-only triad data for active journey | **v3_clean** ✓ |
| `POST /mitra/onboarding/complete/` | `mitraApi.ts:372, 503` (actionExecutor.ts:3786 bridge) | Onboarding Turn 5 unified endpoint | **v3_clean** ✓ |
| `POST /mitra/journey/start-v3/` | `Home.tsx:229, 543` (actionExecutor.ts:3786) | v3 triad generation (auth-only) | **v3_clean** ✓ |
| `GET /mitra/onboarding/chips/` | `mitraApi.ts:461` | Dynamic stage chips (Turn 0-3) | **v3_clean** ✓ |
| `GET /mitra/journey/progress/` | `mitraApi.ts:804` | Cycle + daily progress stats | **v3_clean** ✓ |
| `POST /mitra/crisis/` | `mitraApi.ts:1043` | Safety classifier + grounding content | **v3_clean** ✓ |
| `GET /mitra/clear-window/` | `mitraApi.ts:959` | Moment 43 banner signal detection | **v3_clean** ✓ |
| `GET /mitra/briefing/today/` | `mitraApi.ts:1257` (audit fix F2) | Morning briefing audio + script | **v3_clean** ✓ |
| `GET /mitra/resilience-narrative/` | `mitraApi.ts:1078` | LLM-generated reflection paragraph | **v3_clean** ✓ |
| `GET /mitra/resilience-ledger/` | `mitraApi.ts:1282` (audit fix F3) | Entity-linked resilience signal list | **v3_clean** ✓ |
| `POST /mitra/gratitude-ledger/` | `mitraApi.ts:1101` | Moment 45 joy signal capture | **v3_clean** ✓ |
| `GET /mitra/panchang/today/` | `mitraApi.ts:1408` | Moment 44 season/calendar data | **v3_clean** ✓ |
| `GET /mitra/joy-signal/` | `mitraApi.ts:1491` | Today's joy threshold (binary) | **v3_clean** ✓ |
| `GET /mitra/prep/` | `mitraApi.ts:1168` | Moment 27 coaching context | **v3_clean** ✓ |
| `GET /mitra/predictive/alerts/` | `mitraApi.ts:1200` | Moment 28 friction forecasts (audit fix F5) | **v3_clean** ✓ |
| `POST /mitra/predictive/alerts/{id}/dismiss/` | `mitraApi.ts:1221` | User-dismiss action | **v3_clean** ✓ |
| `POST /mitra/predictive/alerts/{id}/mute-entity/` | `mitraApi.ts:1237` | Mute predictor entity | **v3_clean** ✓ |
| `POST /mitra/voice/notes/` | `mitraApi.ts:983` | Voice input capture (Moment 38) | **v3_clean** ✓ |
| `GET /mitra/voice/notes/{id}/interpretation/` | `mitraApi.ts:1003` | Voice + intent classification (async) | **v3_clean** ✓ |
| `POST /mitra/interpret-intent/` | `mitraApi.ts:1063` | Text intent classification | **v3_clean** ✓ |
| `POST /mitra/moment/next/` | `mitraApi.ts:863` | Phase T2b moment router (decision tree) | **v3_clean** ✓ |
| `GET /mitra/principles/{id}/` | `mitraApi.ts:1429` | Why-This L2 principle source | **v3_clean** ✓ |
| `GET /mitra/principles/{id}/sources/` | `mitraApi.ts:1441` | Why-This L3 depth view | **v3_clean** ✓ |
| `GET /mitra/support/grief-context/` | `mitraApi.ts:1461` | M46 spine moment context | **v3_clean** ✓ |
| `GET /mitra/support/loneliness-context/` | `mitraApi.ts:1478` | M47 spine moment context | **v3_clean** ✓ |
| `GET /mitra/post-conflict-context/` | `mitraApi.ts:1332` | Moment 39 dissonance thread context | **v3_clean** ✓ |
| `POST /mitra/content/moments/{id}/resolve/` | `mitraApi.ts:1557` | **Orchestration Contract V1** — spine resolver | **v3_clean** ✓ |
| `PATCH /mitra/companion-state/` | `mitraApi.ts:937` | Write guidance_mode + user prefs | **v3_clean** ✓ |
| `POST /mitra/entities/check-duplicate/` | `mitraApi.ts:1351` | Moment 29 entity dedup probe | **v3_clean** ✓ |
| `PATCH /mitra/entities/{id}/` | `mitraApi.ts:1371` | Moment 29 entity status (confirm/dismiss/mute) | **v3_clean** ✓ |
| `PATCH /mitra/dissonance-threads/{id}/` | `mitraApi.ts:1390` | Moment 39 ack/resolve action | **v3_clean** ✓ |
| `GET /mitra/journey/deepen-preview/` | `mitraApi.ts:1299` (audit fix F9) | Day-14 path deepening options | **v3_clean** ✓ |
| `GET /mitra/recommended-additional/` | `mitraApi.ts:1313` | Moment 30 post-core recommendation | **v3_clean** ✓ |

### Legacy Endpoints (Still Used, No Direct v3 Replacement)
| Endpoint | Call Site | Usage | Fallback | Status |
|----------|-----------|-------|----------|--------|
| `POST /mitra/generate-companion/` | `actionExecutor.ts:1553`, `mitraApi.ts:229` | Journey creation (side effect) + daily regeneration | `generateCompanionResponse()` stub | **legacy_still_used** ⚠ |
| `POST /mitra/track-event/` | `actionExecutor.ts:528+` (114 call sites) | Event + milestone telemetry | None | **legacy_still_used** ⚠ |
| `POST /mitra/track-completion/` | `mitraApi.ts:275` | Item completion tracking | None | **legacy_still_used** ⚠ |

### Legacy with v3 Replacement (Migration Path Identified)
| Legacy Endpoint | v3 Replacement | Callers Not Yet Migrated | Migration Effort |
|-----------------|-----------------|--------------------------|------------------|
| `GET /mitra/journey/status/` | `GET /mitra/journey/home/` | `Home.tsx:164,368`, `InsightSummaryContainer.tsx:132`, `GuidedGrowthContainer.tsx:113`, `LockRitualContainer.tsx:95`, `mitraApi.ts:1132` fallback | 1-line (response shape identical for non-cached journey check) |
| `POST /mitra/onboarding/recognition/` | `POST /mitra/onboarding/complete/` | None (wrapped with feature flag in `mitraApi.ts:425–431`) | **Already gated** — fallback JS compose in place |
| `POST /mitra/journey/checkpoint/{day}/` | Content pack via `/content/moments/resolve/` | `mitraCheckpoint()` in `mitraApi.ts:601, 618` | Moderate (checkpoint has custom aggregation; v3 would need new endpoint) |
| `POST /mitra/info-screen/` | Content pack via `/content/moments/resolve/` | `mitraInfoScreen()` in `mitraApi.ts:719` (not called in current payloads) | Low (1 call site, isolated) |
| `POST /mitra/path-evolution/` | Content pack via `/content/moments/resolve/` | `mitraPathEvolution()` in `mitraApi.ts:730` (not called) | Low (0 active call sites) |
| `POST /mitra/reset-plan/` | v3 guidance flow | `mitraResetPlan()` in `mitraApi.ts:708` (not called) | Low (0 active call sites) |
| `GET /mitra/journey/additional/list/` | Inferred via progress stats | `mitraFetchAdditionalItems()` in `mitraApi.ts:744` (LibrarySearchModal.tsx:93) | Moderate (needs additional list schema in progress) |
| `POST /mitra/journey/additional/{id}/complete/` | Inferred via completion tracking | `mitraCompleteAdditionalItem()` in `mitraApi.ts:758` (PracticeRunnerContainer) | Moderate |
| `DELETE /mitra/journey/additional/{id}/` | Not yet in v3 | `mitraRemoveAdditionalItem()` in `mitraApi.ts:773` | TBD |

### Dual-Mode Endpoints (Runtime Feature Gate)
| Endpoint | Gate | Behavior |
|----------|------|----------|
| `POST /mitra/onboarding/recognition/` | `MITRA_V3_RECOGNITION_BACKEND` env var | OFF (default) → JS fallback; ON → backend endpoint |
| `GET /mitra/clear-window/` | `MITRA_V3_CLEAR_WINDOW` (backend flag) | 404 (default) → card hides; ON → active detection |
| `GET /mitra/journey/weekly-reflection/` | Feature check | 404 → fallback to `/journey/status/` (audit fix — 2026-04-13) |
| `POST /mitra/moment/next/` | `MITRA_V3_MOMENT_ROUTER_ENABLED` (backend flag) | 404 → FE falls back to legacy routing; ON → spine router |

### Unclear / Needs Verification
| Endpoint | Call Site | Classification Blocker | Action |
|----------|-----------|------------------------|--------|
| `GET /mitra/journey/weekly-reflection/` | `mitraApi.ts:1124` | Fallback to `/journey/status/` — unclear if v3 replace or legacy enhancement | Verify backend feature flag status |
| `POST /mitra/help-me-choose/` | `mitraApi.ts:558` | Has JS fallback but unclear v3 path | Possibly v3 in Phase 5 (intent classification) |
| `POST /mitra/prana-acknowledge/` | `mitraApi.ts:569` | Check-in content — v3 data source not yet visible | Likely reads from CheckinMoment content pack |
| `POST /mitra/trigger-mantras/` | `mitraApi.ts:587` | Support suggestion — v3 replacement not documented | Likely trigger moment library read |
| `GET /mitra/library/search/` | `mitraApi.ts:791` | Library discovery for add-from-library | v3 integration path not yet visible |

---

## 3. Legacy-with-v3-Replacement Migration Queue (Prioritized)

### Tier 1: High Priority (Active Call Sites, Clear v3 Path)

**1. `/mitra/journey/status/` → `/mitra/journey/home/`**
- **Callers:** `Home.tsx:164`, `Home.tsx:368`, `InsightSummaryContainer.tsx:132`, `GuidedGrowthContainer.tsx:113`, `LockRitualContainer.tsx:95`
- **Legacy endpoint** returns: `{ hasActiveJourney, journeyId, welcomeBack, dayNumber, _offline_fallback }`
- **v3 replacement** (`journey/home/`) returns same + `response_type` (render_home|route_to_moment|fallback) + layout signals
- **Migration effort:** 1-line (response shape compatible; extend callers to handle new `response_type` field)
- **Blocker:** None — v3 endpoint fully baked, just needs FE wiring
- **Estimated ROI:** Quick win; removes 5 legacy call sites in one PR

**2. `/mitra/generate-companion/` (Journey Create Side Effect)**
- **Callers:** `actionExecutor.ts:1553` (critical path), `mitraApi.ts:229` (wrapper)
- **Issue:** Called with 2 modes:
  - `use_journey_companion=true` → routes internally to `/journey/companion/` (already v3-safe)
  - `use_journey_companion=false` → direct call to `/generate-companion/` (legacy creation path)
- **v3 replacement path:** No single endpoint; v3 uses POST `/onboarding/complete/` (Step 4) → then POST `/journey/start-v3/` (Step 5) in onboarding flow. For mid-journey refresh, use `/journey/companion/` (read-only).
- **Migration effort:** Large (requires actionExecutor.ts refactor; decision logic on when to call vs. when to read)
- **Blocker:** Phase 5 v3 onboarding unification not yet complete in FE
- **Current State:** Guarded at actionExecutor.ts:1552 — already checks `use_journey_companion` flag; NewDashboardContainer passes `true`
- **Action:** Mark for Phase 5; document the decision tree (create vs. read)

**3. `/mitra/track-event/` (Telemetry → MitraDecisionLog)**
- **Callers:** `actionExecutor.ts` (114 call sites across all flows)
- **Legacy endpoint:** Generic event logger; server logs to MitraEventLog table
- **v3 replacement path:** MitraDecisionLog spine resolver (async, non-blocking) writes decision trace + signals for intelligence refinement
- **Migration effort:** Large (requires analytics pipeline redesign; each event type needs v3 signal mapping)
- **Blocker:** v3 telemetry schema not yet documented in frontend spec
- **Current approach:** Dual logging (keep legacy for now; add v3 signals via spine resolver)
- **Action:** Defer to Phase 5+; create RFC for v3 telemetry bridge

---

### Tier 2: Moderate Priority (Not Called in Current Payloads, Easy Kills)

**4. `/mitra/info-screen/` → Content Pack**
- **Callers:** `mitraApi.ts:719` (wrapper exists, zero call sites)
- **Migration effort:** 1-line (delete wrapper; content moves to content pack registry)
- **Action:** Remove in Phase 5 cleanup; zero impact

**5. `/mitra/path-evolution/` → Content Pack**
- **Callers:** `mitraApi.ts:730` (wrapper exists, zero call sites)
- **Migration effort:** 1-line (delete wrapper)
- **Action:** Remove in Phase 5 cleanup; zero impact

**6. `/mitra/reset-plan/` → v3 Guidance Flow**
- **Callers:** `mitraApi.ts:708` (wrapper exists, zero call sites)
- **Migration effort:** 1-line (delete wrapper)
- **Action:** Remove in Phase 5 cleanup; zero impact

---

### Tier 3: Nice-to-Have (Additional Items, Later Phase)

**7. `/mitra/journey/additional/*` (Add/Remove/Complete custom items)**
- **Callers:** `LibrarySearchModal.tsx:93` (add), `PracticeRunnerContainer` (complete), generic delete
- **v3 replacement:** Not yet designed; likely needs journey-level item mutation API in v3.2
- **Migration effort:** Moderate (new v3 endpoint design + FE integration)
- **Action:** Gather Phase 5 requirements; blocking custom journey flows

---

## 4. Backend View Audit (core/mitra_views.py)

### ViewSet Method Classification

| Method | Route | Type | Response Shape | Status |
|--------|-------|------|-----------------|--------|
| `generate_companion()` | POST | Write-path (side effect: journey create) | `{ companion, briefing, continuity, _backend }` | **Legacy v2** — full triad generation |
| `journey_companion()` | GET | Read-only | `{ companion, cycle_metrics, greeting_context, ... }` | **v3 native** — read-only triad data |
| `journey_status()` | GET | Read-only (lightweight) | `{ hasActiveJourney, welcomeBack, dayNumber }` | **Legacy** — being replaced by `journey_home()` |
| `journey_home()` (function-based view) | GET | Read-only + routing signal | `{ response_type, layout, chips, copy, route_to_moment }` | **v3 native** — contextual home |
| `track_event()` | POST | Write + telemetry | `{ id, status }` | **Legacy** — event logger; v3 uses spine MitraDecisionLog |
| `track_completion()` | POST | Write + activity log | `{ completion_id, day_number }` | **Legacy** — item completion tracking |
| `checkpoint({day})` | GET | Read-only | `{ recommendation, engagement, baseline, reflection_prompt }` | **Legacy** — Day 7/14 mirror |
| `checkpoint_submit({day})` | POST | Write + decision capture | `{ decision, status }` | **Legacy** — checkpoint decision |
| `onboarding_complete()` | POST | Write + triad seed | `{ inference, recognition, triad, journey_metadata, ...}` | **v3 native** — unified onboarding Call 4 |
| `journey_start_v3()` | POST | Write + triad generation | `{ triad, path_intent, rupture_inferred, coherence_adjustment_used, ... }` | **v3 native** — Call 5 triad gen (auth-only) |
| All `/crisis/`, `/prep/`, `/predictive/`, `/content/moments/resolve/` | POST/GET | Read-only | Content pack + decision tree signals | **v3 native** — spine architecture |

### Key Findings
1. **Read-only endpoints (20+)** are all v3-safe; FE can switch without backend changes
2. **Write-path endpoints (5)** split between legacy (track_event, track_completion, checkpoint_submit) and v3 (onboarding_complete, journey_start_v3)
3. **No hard schema breaks** — v3 endpoints are additive (new fields only); offline fallbacks can upgrade gradually
4. **No journey-level mutations in v3 yet** — additional items (custom practices) still use legacy v2 endpoints

---

## 5. Offline-Fallback Shape Mismatches

### Critical (Likely to Break UI)

**1. `generateCompanionResponse()` stub** (mitraApi.ts:19–72)
- **Fallback guarantee:** Always supplies `ui.card_title + ui.card_subtitle` on all three items (mantra/sankalp/practice)
- **Real v3 shape risk:** If backend `/journey/companion/` adds new fields without `ui.*`, TriadCardsRow filter (line: `c.title || c.sub`) will hide cards
- **Status:** FIXED (audit note F7 2026-04-13 — offline stub now reflects v3 response shape with all `ui.*` fields)
- **Test:** Check TriadCardsRow renders 3 cards on offline mode; if missing one, shape mismatch detected

**2. `generateHelpMeChooseResponse()` stub** (mitraApi.ts:74–87)
- **Shape:** `{ focus, sub_focus, label, _offline_fallback }`
- **Real endpoint shape:** Unknown (endpoint not yet fully spec'd in v3)
- **Risk:** Low (not critical path; gracefully handled by callers)

**3. `generateCheckpointData()` stub** (mitraApi.ts:128–145)
- **Shape:** Hardcoded day-7/14 options + flat string fields
- **Real v3 shape:** Unknown (checkpoint redesign in progress for Phase 5)
- **Risk:** High (if v3 checkpoint returns nested `{ recommendation: { action, alternatives } }`, the fallback will mismatch)
- **Action:** Flag for Phase 5; real checkpoint shape must be documented before v3 launch

---

### Low Risk (Not Critical Path)

| Stub Function | Risk | Action |
|---------------|------|--------|
| `generateTriggerMantraSuggestions()` | Low (trigger moments have content pack fallback) | Monitor for v3 trigger mantra list schema |
| `generateInfoScreenData()` | Low (0 call sites) | Remove in Phase 5 cleanup |
| `generateResetPlan()` | Low (0 call sites) | Remove in Phase 5 cleanup |
| `generatePathEvolutionScreen()` | Low (0 call sites) | Remove in Phase 5 cleanup |

---

## 6. Surprise Findings & Audit Notes

### Critical Insights

1. **"Generate Companion" Is a Dual-Mode Endpoint (Hidden v3 Escape Hatch)**
   - At `actionExecutor.ts:1552`, the code checks `use_journey_companion` flag
   - When `true`, internally routes to `/journey/companion/` (already v3-safe)
   - When `false`, calls `/generate-companion/` (legacy create path)
   - **Impact:** NewDashboardContainer already uses the v3 path! The migration is partially complete.
   - **Recommendation:** Document this dual-mode behavior in mitraApi.ts; don't remove `mitraGenerateCompanion()` until all action handlers are refactored

2. **Track-Event Becomes a Liability if Telemetry Redesign Deferred**
   - 114 call sites across all flows means this endpoint is load-bearing
   - Zero documentation of v3 telemetry replacement path
   - **Risk:** If Phase 5 postpones telemetry redesign, track-event becomes the "legacy endpoint we can't remove"
   - **Recommendation:** Create RFC by end of Phase 4 on v3 telemetry bridge; avoid Phase 5 surprise

3. **Offline Fallbacks Are Over-Specified (Technical Debt)**
   - 6 stub generator functions exist but only 2 are actually called (`generateCompanionResponse` + `generateCheckpointData`)
   - The others (help-me-choose, prana-ack, trigger-mantras, info-screen, reset-plan, path-evolution) have FE-level fallbacks in catch blocks
   - **Recommendation:** Delete 4 unused stubs in Phase 5 cleanup (info-screen, reset-plan, path-evolution, trigger-mantras have inline fallbacks)

4. **All 22 Moment Extensions Are Pure UI (Zero API Coupling)**
   - Grepped all `/src/extensions/moments/*/index.tsx` files
   - **Finding:** None make direct `api.*` calls; all orchestration flows through `executeAction()` → actionExecutor.ts → mitraApi.ts
   - **Impact:** Moment extensions are safe to refactor without API concerns
   - **Recommendation:** Safe to bundle all moment extensions in a shared lib; no circular API dependencies

5. **Weekly-Reflection Endpoint Has Fallback-To-Legacy Logic**
   - At `mitraApi.ts:1131–1137`, if `/weekly-reflection/` returns 404, it falls back to `/journey/status/`
   - This is a hidden v3-to-legacy compat layer
   - **Issue:** If weekly-reflection is v3-gated (404 when feature-off), the fallback defeats the gate
   - **Recommendation:** Document intent (is fallback intentional? or should 404 remain 404?); verify with backend team

6. **Missing Audit Fixes (2026-04-13 Baseline)**
   - **F1:** `getBriefingToday()` wrapper added; was missing in earlier audit
   - **F2:** Same (briefing endpoint not yet in original spec)
   - **F3:** `getResilienceLedger()` distinct from `getResilienceNarrative()`; auditor initially missed distinction
   - **F4:** (Reserved for checkpoint deep-dive)
   - **F5:** `/mitra/predictive-alerts/` URL was wrong (hyphen vs. slash); fixed in v1
   - **F6:** `fetchCompanionState()` dispatch routed via Redux to avoid hard import dep
   - **F7:** `generateCompanionResponse()` offline stub now has all `ui.*` fields; TriadCardsRow won't filter
   - **F8:** `postOnboardingTurn` + `postJourneyCreate` removed from mitraApi (endpoints don't exist on backend)
   - **F9:** `getDeepenPreview()` wrapper added; Day-14 CheckpointBlock can now fetch independently

### Low-Risk Surprises

- **No /mitra/user-preferences/ or /mitra/companion-state/ consistency gap:** both endpoints exist and are v3-safe
- **No hardcoded English in actionExecutor.ts:** all user-facing copy routes through content pack (sovereignty compliant)
- **No circular API deps:** no moment extension calls back to actionExecutor (good separation)

---

## 7. Top-5 Quickest Migration Wins

### 1. Remove Zero-Call-Site Stubs (5 minutes)
**Target:** `mitraInfoScreen()`, `mitraPathEvolution()`, `mitraResetPlan()` wrappers + their offline stub functions  
**Impact:** Clean up technical debt; -40 LOC  
**Testing:** Grep for callers (verify zero); remove; no FE impact expected

### 2. Switch `/mitra/journey/status/` → `/mitra/journey/home/` (30 minutes)
**Target:** 5 call sites (Home.tsx, InsightSummaryContainer, GuidedGrowthContainer, LockRitualContainer, + mitraApi.ts fallback)  
**Impact:** Unblock home routing to use v3 response_type signal for routing  
**Testing:** Test home boot, dashboard load, journey resume; verify routing still works

### 3. Document & Gate the Generate-Companion Dual Mode (15 minutes)
**Target:** Add JSDoc to `mitraGenerateCompanion()` explaining the `use_journey_companion` flag  
**Impact:** Prevent future confusion; clarify that NewDashboardContainer is already v3-safe  
**Testing:** None (pure documentation)

### 4. Audit & Delete Weekly-Reflection Fallback (10 minutes)
**Target:** Clarify intent of fallback in `getWeeklyReflectionData()` (mitraApi.ts:1132); if intentional, document; if not, remove  
**Impact:** Remove hidden v3-to-v2 compat layer; clarify feature gate semantics  
**Testing:** Verify weekly-reflection behavior on flag-off (should 404, not silently fall back)

### 5. Add v3 Telemetry RFC to Backlog (5 minutes)
**Target:** Create issue: "Phase 5: Design v3 telemetry bridge to replace track-event"  
**Content:** Link the 114 call sites; enumerate event types; propose spine MitraDecisionLog signal mapping  
**Impact:** Prevent Phase 5 surprise; give team 2-week runway to design before implementation  
**Testing:** None (scoping)

---

## 8. Recommendations for Phase 5 Planning

1. **Lock the v3 onboarding spec** (onboarding/complete + journey/start-v3 response shapes) by week 1 of Phase 5
2. **Design v3 telemetry bridge** (track-event → spine signals) by week 1; avoid Phase 5 surprise
3. **Document additional-items mutation API** (add/remove/edit custom practices) before PracticeRunnerContainer refactor
4. **Remove 4 unused offline stubs** in Phase 5.1 cleanup (info-screen, reset-plan, path-evolution, trigger-mantras)
5. **Verify checkpoint v3 shape** before Day-14 redesign launches; offline stub is hardcoded day-7/14 options

---

## Appendix: Audit Metadata

- **Repo Branch:** kalpx-app-rn:pavani + kalpx:dev
- **Audit Date:** 2026-04-17 15:47 UTC
- **Auditor:** Claude Code (Haiku 4.5, token budget 200k)
- **Scan Depth:** Full src/ tree; all mitraApi.ts exports + all actionExecutor usage; all backend mitra_views.py methods
- **Exclusions:** node_modules, test files (except regression test names noted), .old.tsx files
- **Confidence:** High (all grep hits verified; no missed exports; mitraApi.ts is single source of truth for FE)

