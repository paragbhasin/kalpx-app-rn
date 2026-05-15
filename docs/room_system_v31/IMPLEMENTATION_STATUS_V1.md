# Room System v3.1.1 — Implementation Status vs Strategy (2026-04-20)

This is a section-by-section audit of `ROOM_SYSTEM_STRATEGY_V1.md` against the code that actually shipped on `dev` (`4c9b19bc`) + `pavani` (`3777526`).

## Section-by-section status

| § | Topic | Status | Notes |
|---|---|---|---|
| 1 | Room-first UX (2-step) | **PARTIAL** | Step 1 (room pick) live via `QuickSupportBlock` + `RoomEntrySheet`. **Step 2 (life_context picker) NOT IMPLEMENTED.** No one-tap follow-up screen exists. |
| 2 | Room × life_context mapping | **POLICY DEFINED, CODE MISSING** | Posture/tone/no-go encoded inline in `room_selection.py` comments. `life_context` dimension absent from code, pools, scoring. |
| 3 | Surface-isolation contract | **IMPLEMENTED** | Hard filter + cross-surface exclusions + joy↔growth 7-day live in `room_selection.py:1085-1097`. Override metadata fields (`surface_override_*`) NOT modeled. |
| 4 | Canonical rich runner contract | **IMPLEMENTED** | `canonical_runner_resolver.py` returns full payload; runners use same shape across core + rooms. |
| 5 | Tagging v2 schema | **PARTIAL** | `room_fit, spiritual_mode, intensity, energy_direction, tradition, surface_eligibility, pool_role, action_family` all modeled. **MISSING**: `emotional_function`, `life_context_bias`, governance fields (`curator_notes, selection_justification, review_status, reviewed_by, reviewed_at`), supporting fields (`misuse_risk, standalone_safe, repeat_tolerance, banner_eligible`, etc.). |
| 6 | Audit framework | **AD-HOC, NOT INSTITUTIONAL** | Done once during Phase 5 via scattered agent runs. No structured classification artifact or recurring audit cadence. |
| 7 | Curated pool strategy | **IMPLEMENTED (ex-context)** | Small pools per `(room, slot)` seeded via migrations 0120 / 0121 / 0124 / 0125. Active core/additional exclusion via hard filter. **life_context biasing of scoring NOT implemented.** |
| 8 | Selection rules | **MOSTLY IMPLEMENTED** | 4-rule scoring + anti-repetition + same-day exclusions + joy/growth differentiation + cold-start anchor all live. **Missing**: life_context dimension in scoring; `cross_surface_exclusions_applied` field in logs (partially present). |
| 9 | Backend contract | **PARTIAL** | `/render/` live. `/sacred/` live. **`/telemetry/` endpoint NOT exposed externally** (telemetry writes happen inline from sacred POST; FE cannot post a bare telemetry event). **`/dashboard-chips/` endpoint NOT implemented** — dashboard reads FE-authored labels + BE's per-room `dashboard_chip_label` inside `/render/`. `RoomRenderV1` MISSING: `life_context_optional`, `visit_state` (partial via provenance), `post_runner_reflection_pool_id_optional` (present for growth only). |
| 10 | FE migration contract | **IMPLEMENTED** | All components live; testID pattern enforced; FE never reconstructs runner payload; runner exit routes back to room. |
| 11 | Multi-agent workflow | **AD-HOC** | We've used general-purpose agents ad-hoc for BE / FE / content / contract reviews. The 5 named roles (Tagging / Room-Fit / Surface Isolation / Sovereignty / Runtime) are NOT formalized as a repeatable pipeline with artifacts. |
| 12 | Phased execution order | Phases 0–7 mostly delivered; **2-step UX (Phase 0 contract) is the biggest open Phase 0 item**. |

## Delta summary (what's missing vs spec)

### Critical missing — blocks v1 UX contract
1. **Step 2 life_context picker screen** (FE) — the one-tap follow-up after room selection
2. **`life_context` in render endpoint** (BE) — accept as query param / request body
3. **`life_context_bias` scoring dimension** (BE) — add to 4-rule scorer as 5th rule (+N if row's `life_context_bias` includes request's context)
4. **`life_context` in RoomRenderLog + telemetry** — for future tuning

### Medium missing — observability / governance
5. **`/telemetry/` as standalone endpoint** — FE currently can't POST arbitrary room events (pill_tap etc.) outside the sacred write
6. **`/dashboard-chips/` endpoint** — single BE call returns 6 rooms' `{room_id, dashboard_chip_label}` for FE dashboard; today FE hardcodes + BE's per-room render returns its own label
7. **Tagging v2 governance fields** — `curator_notes, selection_justification, review_status, reviewed_by, reviewed_at` as content-schema columns
8. **Supporting tag fields** — `emotional_function, life_context_bias, misuse_risk, standalone_safe, repeat_tolerance, banner_eligible, teaching_eligible, reflection_eligible`
9. **Override metadata** — `surface_override_approved_by` / `reason` / `date` / `scope` / `expiry_optional`

### Minor missing — formalization
10. **5-agent pipeline as a documented cadence** — currently agents are dispatched ad-hoc; no artifact ledger, no recurring Room-Fit / Sovereignty review rhythm
11. **Curator dashboard (Phase 7)** — admin views exist for logs + rotation stats; no curator-facing UI for pool edits / override approvals

## Parked items (from this session)

### P0 — blocks prod flip
- `MITRA_ROOM_SACRED_KEY` provisioning in **prod** Secrets Manager (dev is done). Current prod fallback = SHA-256(SECRET_KEY), unsafe.
- pavani → main merge for FE (17 commits ahead).

### P1 — owed for parity with spec
- 2-step UX (life_context picker + backend integration).
- `/dashboard-chips/` + `/telemetry/` endpoints.
- Tagging v2 governance columns.

### P2 — UX polish / known gaps
- Voice-note real `expo-av` recorder + BE audio-upload pipeline (current = UI stub with `stub:true`).
- `step_voice_note_*` / `step_reach_out_*` BE pool authoring (UI exists, BE pool empty).
- Stillness/clarity carry remains parked (by design). If unpark: clarity locked-order + chip-ceiling would need reconciliation.
- 4 pre-existing FE tsc errors in CompanionDashboardContainer / CycleTransitionsContainer / Home.tsx (unrelated to rooms).
- Legacy static fixtures `room_stillness/render_cold_start.json` + `room_connection/render_cold_start.json` fall below chip floor (scaffolding drift; live selector compliant).

### P3 — cosmetic / follow-up
- `_prior_renders_count` helper in `room_selection.py:302` — dead after `CARRY_DEEP_REPEAT_MIN_PRIOR` deletion.
- BE schema `ActionType.CARRY = "carry"` enum string still declared while FE uses `"in_room_carry"` — rename to match.
- `room_identity` decommission comment in `views.py:93` can be removed once the field is forgotten.
- 5-agent pipeline documentation + artifact ledger format.
