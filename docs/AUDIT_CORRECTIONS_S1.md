# Audit Corrections — Sprint 1 (2026-04-18)

**Status:** required team artifact. Supersedes the noted claims from the 2026-04-18 end-to-end Mitra content delivery audit. Owner: Delivery Restoration (MDR-S1-15).

**Purpose:** prevent the team from building on stale audit claims. Any planning session opened after this date MUST consult this file before acting on the original 9-day audit.

## Correction register

### C-1 — `new_dashboard/index.tsx` is NOT a pure orphan

| Field | Value |
|---|---|
| Prior audit claim | Agent 3 (FE wiring): "ORPHAN, self-labeled 'ISOLATED SCAFFOLD'. 470 LOC … imports `PersonalGreetingCard`, `PathMilestoneBanner`, `ContinuityMirrorCard`, `DayTypeChip` — all orphaned scaffolds with no live consumer." Agent 6 (legacy/fallback) reinforced: "Stale dashboard surface spec that shipped in docs references components that are no longer rendered anywhere reachable." |
| Corrected finding | The file is registered as block type `new_dashboard_body` in `BlockRenderer.tsx:133,255` and is referenced by `allContainers.js:571` (`CompanionDashboardV3Container.day_active.blocks`). It IS a reachable block, though the container_id `companion_dashboard_v3` resolves to the real `src/containers/NewDashboardContainer.tsx` via `ScreenRenderer.tsx:94`. So the scaffold is registered-but-shadowed — dead-ish but not pure-orphan. |
| Evidence | `kalpx-app-rn/src/engine/BlockRenderer.tsx:133,255` (block-type registration); `kalpx-app-rn/src/engine/ScreenRenderer.tsx:94` (container_id resolution); `kalpx-app-rn/src/containers/allContainers.js:571` (reference in layout schema) |
| Impacted tickets | MDR-S3-11 (deletion schedule) — cannot be a simple delete; must first remove the `new_dashboard_body` BlockRenderer entry AND the `allContainers.js` schema reference. Blocks deletion of scaffolds #3–6 (personal_greeting_card, path_milestone_banner, continuity_mirror_card, day_type_chip) because they are imported only by this file. |
| Revised disposition | `transitional` (not `delete`). Removal target: 2026-06-30 after BlockRenderer + allContainers cleanup. Deletion of dependent scaffolds MUST wait until this file is deleted. |

### C-2 — `AwarenessTriggerContainer.tsx` is LIVE, not legacy

| Field | Value |
|---|---|
| Prior audit claim | Agent 6 (legacy/fallback): "`AwarenessTriggerContainer` still active — 542 LOC, registered at `ScreenRenderer.tsx:68`, referenced in 14 spots in actionExecutor. This is the pre-spine trigger flow." (Listed under stale component candidates.) |
| Corrected finding | The file is actively LIVE. It drives the full trigger-reset flow (`trigger_reflection`, `trigger_entry`, `breath_reset`, `sensory_grounding`, `trigger_advice_reveal`, etc.) and is the target of `initiate_trigger` (`actionExecutor.ts:1846-1907`, navigates to `{container_id:"awareness_trigger", state_id:"trigger_reflection"}`). Dashboard `QuickSupportBlock` (`blocks/dashboard/QuickSupportBlock.tsx:84`) dispatches into this container. `GlobalScrollLayout.tsx:41` lists it in `SUPPORT_FLOW_CONTAINERS` and multiple guard checks reference it. There is no spine replacement; the audit flag was speculative. |
| Evidence | `ScreenRenderer.tsx:68`; `actionExecutor.ts:1846-1907, :242, :645, :653, :755, :1247`; `blocks/dashboard/QuickSupportBlock.tsx:84`; `GlobalScrollLayout.tsx:41` |
| Impacted tickets | MDR-S1-15 (classification) — not a legacy candidate; classified `live`. No Sprint 3 deletion. |
| Revised disposition | `live`. Keep. Not in any cleanup queue. |

### C-3 — Scaffold-delete queue is **14**, not 7 (consolidation override)

| Field | Value |
|---|---|
| Prior audit claim | Agent 4 (reachability): "8 extension scaffolds with zero importers: completion_return/, sound_bridge/, voice_consent/, why_this_l2/, why_this_l3/, voice_on_every_screen/, personal_greeting_card/, path_milestone_banner/, continuity_mirror_card/, day_type_chip/ (~1500 LOC)." Treated as uniformly delete-ready. |
| S1-15 Agent 1 draft claim | Added `personal_greeting_card`, `path_milestone_banner`, `continuity_mirror_card`, `day_type_chip` as "Tier B — blocked by new_dashboard parent removal." Total: 7 scaffolds. |
| Consolidation panel correction | Both prior claims are undercounts. Grep of `src/extensions/moments/` vs production imports reveals **14 genuinely orphaned scaffolds** (zero cross-folder importers, only README self-references): `checkpoint_results_refresh`, `completion_return`, `continuity_mirror_card`, `cycle_reflection_refresh`, `day_type_chip`, `entity_recognition_card`, `path_milestone_banner`, `personal_greeting_card`, `sound_bridge`, `voice_consent`, `voice_on_every_screen`, `why_this_l1_chip`, `why_this_l2`, `why_this_l3`. Additionally, the claimed cross-dependency — that `personal_greeting_card`, `path_milestone_banner`, `continuity_mirror_card`, `day_type_chip` are imported ONLY by `new_dashboard/index.tsx` — is **also wrong**. All 14 have zero cross-folder importers; none block on `new_dashboard` removal. |
| Evidence | Grep output: every orphan's only non-Markdown reference is its own `README.md`. For `completion_return` the project's `docs/TELEMETRY_CALLSITES_CURRENT_FLOW.csv:11-14` explicitly labels it "Dead code — BlockRenderer registers `src/blocks/CompletionReturnTransient.tsx`, not this file." Same pattern for `why_this_l2` (live = `src/blocks/WhyThisL2Sheet.tsx`), `entity_recognition_card` (live = `src/blocks/dashboard/insights/EntityRecognitionCard.tsx`), `personal_greeting_card` (live greeting is inside `NewDashboardContainer`'s embedded `GreetingCard`), and the rest. |
| Impacted tickets | **MDR-S3-10 delete queue must expand from 7 → 14 scaffolds.** No ordering constraint between MDR-S3-10 and MDR-S3-11 (they can run in parallel). Original "blocked by #2 removal" claim is **revoked** — `NewDashboardContainer.tsx` (the live container) does not import any of the 14. The isolated-scaffold `new_dashboard/index.tsx` imports 5 sibling scaffolds (`personal_greeting_card`, `path_milestone_banner`, `continuity_mirror_card`, `day_type_chip`, and some LIVE ones like `focus_phrase_line`) — but the LIVE block is served through `BlockRenderer.tsx:133` registration, NOT via the orphan scaffold's imports. |
| Revised disposition | Single-stage deletion: **delete all 14 in one Sprint 3 PR**. No tier cascade needed. |

### C-4 — `/api/mitra/onboarding/recognition/` is flag-gated with local fallback

| Field | Value |
|---|---|
| Prior audit claim | Agent 4 (reachability): "`POST /api/mitra/onboarding/recognition/` — marked DEPRECATED in urls.py but still POSTed by `mitraApi.ts:433`." Listed as DEAD_CODE. |
| Corrected finding | The FE function `mitraOnboardingRecognition` at `mitraApi.ts:421-449` is gated by `MITRA_V3_RECOGNITION_BACKEND` feature flag. When flag is off (default), it falls back to local `composeRecognitionFallback` and never hits the BE endpoint. Removal path: flip the flag state across all envs → remove the local fallback → remove the caller → remove the BE endpoint. Not pure dead code; more like "parked with a safety net." |
| Evidence | `kalpx-app-rn/src/engine/mitraApi.ts:421-449` (flag guard), `kalpx-app-rn/src/engine/actionExecutor.ts:28` (caller import) |
| Impacted tickets | MDR-S1-15 classified `transitional`; MDR-S3-12 plans the removal. |
| Revised disposition | `transitional`. Removal target: 2026-05-30. |

### C-5 — `/api/mitra/moment/next/` shadow router: background probe (not pure dead code)

| Field | Value |
|---|---|
| Prior audit claim | Agent 4 (reachability): "shadow-mode only — one callsite, decision swallowed." Classified DEAD_CODE. |
| Corrected finding | The shadow call at `Home.tsx:399-414` fires on every app-open and logs a decision via `console.log` without consuming it. This is Phase T2b shadow-telemetry. It costs a real network round-trip per app-open but is NOT dead — it's validating the router's decision quality against legacy routing. Active telemetry, passive consumer. |
| Evidence | `kalpx-app-rn/src/screens/Home/Home.tsx:399-414`; `kalpx-app-rn/src/engine/mitraApi.ts:817-829` (function comment confirms Phase T2b shadow role) |
| Impacted tickets | MDR-S1-15 classified `transitional` with CP-1 escalation for activate-vs-delete. |
| Revised disposition | `transitional`, pending Phase T2b activation commitment (recommend CP-5, not CP-1). |

## Downstream implications (what the team should NOT assume)

1. Do NOT assume the "new_dashboard scaffold" is a pure orphan — it's registered. Any "delete all orphans" sweep must check BlockRenderer registrations.
2. Do NOT plan to delete AwarenessTriggerContainer — it's the live trigger-reset surface with no spine replacement.
3. Do NOT reorder S3 deletion tickets without re-reading C-3's cascade.
4. Do NOT assume every shadow endpoint is dead — confirm telemetry intent before removal.
5. Do NOT remove deprecated onboarding recognition endpoint first — remove FE caller, then fallback, then endpoint.

## Process improvement

Include in sprint-start agent briefs: "Read `docs/AUDIT_CORRECTIONS_S1.md` before acting on any 2026-04-18 audit claim." This supersedes specific rows of the original audit; the audit itself is NOT revoked — only these listed corrections.

## Maintenance

This file is living. Any future audit correction discovered during a Level B consolidation panel must add a row here before the sprint closes. At sprint close, corrections that are fully acted upon remain as history. Corrections that are pending are flagged with `⚠ pending` in a future update.
