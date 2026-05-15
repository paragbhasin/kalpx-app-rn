# CP-1 Bundle — Sprint 1 Founder Decision Pack

**Purpose:** single-artifact summary for the one founder checkpoint scheduled at end of Sprint 1. Follows the standing baseline "bundled checkpoints, not per-ticket pauses" rule. Founder reviews this bundle and approves / overrides / defers.

**Scheduled decision cadence:** once per sprint at CP-1. Do not escalate individual items outside this bundle unless safety-critical.

---

## What's DONE (landed, verified)

| Item | Evidence | Notes |
|---|---|---|
| S1-01 Contract file `/journey/companion/` | `BE/docs/CONTRACT_JOURNEY_COMPANION_V1.md` | 20 fields documented with source path + FE read path |
| S1-02 `post_conflict` canonical + dual-emit | commit `2dfc3a40` | CP-3 (2026-05-30) removal of camelCase alias logged in closure register |
| S1-03 `dayType`/`dayTypeCopy` removed | commit `2dfc3a40`; closure register row **CLOSED** | Chip stays killed; no tests reference old keys |
| S1-04 `focus_phrase` top-level + sovereign FE | commit `2dfc3a40` + `8b55902` | FocusPhraseLine hides when empty; no English fallback |
| S1-05 `sankalp_how_to_live` top-level alias | commit `2dfc3a40` | |
| S1-06 `why_this_l1_items` flat-array | commit `2dfc3a40` | Legacy nested kept for CP-3 burn-in |
| S1-08 Orchestrator `_PRECEDENCE_KEYS` + 3 additional_* variants + **pytest regression 4/4 PASS** | commit `2dfc3a40` | `runner_source` beats `runner_variant` on specificity ties (rename-safe) |
| S1-10 M25 narrative/summary spine + FE interpolate helper | commit `2dfc3a40` + `8b55902` | Bounded: empty template → "", missing var → "", raw tokens never leak. Universal-only marked TEMPORARY in M25 YAML header |
| S1-11 MoreSupportSheet sovereignty-strict | commit `8b55902` | `hasContent` guard returns null when envelope seeds nothing |
| S1-12 `read_more_label` via `constant_value` + `"How did that feel?"` DROPPED | commit `2dfc3a40` + `8b55902` | Consolidation proof: runtime null-path exists but correct behavior is blank (Rule 3), not English |
| S1-14 Canonical `ROUTES.md` | commit `8b55902` | Canonical `companion_dashboard` alias + banned-target list |
| S1-15 Legacy classification + **AUDIT_CORRECTIONS_S1.md** | commit `8b55902` | 5 corrections vs 2026-04-18 audit; delete queue expanded 7 → 14 scaffolds |
| MDR-CROSS-01 Unread-Field Closure Register | commit `2dfc3a40` | Seeded with all audit-discovered rows + CP-3 removal targets |
| Dev 7-moment resolve probe | PASS 7/7 at `S1_07_CONTENT_RESOLVE_GATE_REPORT.md` | M46/47/48/49 + M_completion_return + M24 + M25 all resolve without fallback |

---

## What's PARTIAL (landed but carries residual risk)

| Item | Status | Risk | Decision needed |
|---|---|---|---|
| S1-07 Content-Resolve Gate | **Dev PASS · Staging PASS-WITH-RISK · Prod PASS-WITH-RISK** | Code default for `MITRA_V3_CONTENT_RESOLVE_ENABLED` is **OFF**; if target env flag is not explicitly set, every Track 1 content resolve returns null → blank rooms. **Partial prod probe in an earlier turn showed prod `.env` has ZERO `MITRA_V3_*` flags.** Parked per founder instruction this session. | CP-1 must decide: (a) assign ops to set `MITRA_V3_CONTENT_RESOLVE_ENABLED=1` on staging + prod BEFORE flag flip, (b) accept risk, or (c) defer flag flip |
| S1-13 Silk Integrity Test Pack | **11 Maestro flow skeletons authored** + README + `FALLBACK_DENY_LIST.txt` | Skeletons use placeholder Maestro IDs (e.g. `triad_card_mantra`) — will need ID alignment during first live run. No CI integration yet. | Founder OK to run skeletons on first production-profile preview build; expect minor skeleton patches before full green |
| S1-16 Prod-Profile Smoke Checklist | **Authored** at `docs/PROD_SMOKE_CHECKLIST_V1.md`; 16 flows + deny-list + dependency gates | Requires human smoke on a real device/simulator to execute | Founder to schedule smoke session (estimate: 30–45 min walk-through) |

---

## What's BLOCKED

| Item | Blocker | Default action if founder silent |
|---|---|---|
| S1-17 Production flag flip | S1-07 staging + prod env state; S1-13 Silk pack first run; S1-16 smoke walk-through | **Hold flag flip** until all three above resolve. This is the standing selector-dormancy analogue for the prod dashboard rule. |

---

## What founder MUST decide at CP-1 (ranked by blast radius)

### G1 — Prod env flag state + flag-flip timing
**Question:** does engineering set `MITRA_V3_CONTENT_RESOLVE_ENABLED=1` on prod (and confirm staging) **before** the `EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD=1` eas.json flip, OR do both atomically, OR delay the flip?

**Default if silent:** hold flag flip until S1-07 is PASS on all envs. Don't ship Track 1 to App Store with silent-default content-resolve OFF.

**My recommendation:** (a) engineering adds env flag to prod as a small isolated PR now; (b) engineering runs smoke checklist on production-profile preview build against prod backend; (c) only then, flip eas.json flag + rebuild. Three discrete steps, each reversible.

### G2 — Legacy dashboard classification (S1-15)
**Question:** approve the 14-scaffold delete list (expanded from the audit's 7-scaffold count) for Sprint 3 deletion? Includes `day_type_chip` (prior founder comment said "keep for future re-mount") and `voice_on_every_screen` (scaffold-only; pre-voice-consent).

**Default if silent:** per tightening rules — both default to **delete**. Git history preserves them if re-mount is ever pursued.

**My recommendation:** approve all 14 for Sprint 3 delete queue. Escalate individually if any becomes live.

### G3 — `/moment/next/` shadow-router disposition
**Question:** commit to Phase T2b activation schedule (recommend CP-5) or reclassify as delete for Sprint 4?

**Default if silent:** Phase T2b activation at CP-5. Shadow-mode telemetry continues but must have exit-criteria memo before next check-in.

### G4 — CompanionDashboardContainer removal date
**Question:** approve `2026-07-31` (= ~6 weeks post-flag-flip burn-in) as target removal date?

**Default if silent:** approve. Earlier removal only after a "first green week" telemetry signal.

### G5 — S1-13 accept skeleton quality for CP-1?
**Question:** accept the 11 Maestro skeletons as "sufficient for CP-1 trust" given IDs will need minor patches on first live run, OR delay CP-1 until skeletons are fully data-grounded?

**Default if silent:** accept skeletons now; iterate in Sprint 2. The skeleton pack is the regression floor, not the ceiling.

### G6 — Bridge removal CP-3 target confirmation
**Question:** confirm `postConflict` camelCase + `why_this.level1.*` nested removal at CP-3 (= end of Sprint 3, 2026-05-30)?

**Default if silent:** approve. Register row exists; CP-3 review lists them.

---

## Cannot be founder-deferred further

These items WILL drift silently without a CP-1 decision:

1. **Prod flag flip** without S1-07 env verification → Track 1 shipped invisibly (users see blank rooms) → retroactive emergency rollback. **High blast radius.**
2. **14 scaffolds** sitting undecided → Sprint 3 cleanup loses velocity; some scaffolds may be accidentally used by a new feature → we track dead code as live forever.
3. **`/moment/next/` shadow-router** running indefinitely → shadow BE cost per app-open with no exit criteria → passive tech debt.

---

## Process note

This bundle is the **only** founder-facing artifact for Sprint 1. Every other Sprint 1 finding was resolved via the 4-agent review pattern or the standing defaults-if-silent registry. Follows the 2026-04-18 standing baseline: "Founders must NOT be the pacing bottleneck."

Next bundle: CP-2 at end of Sprint 2 (Day 14 classification copy + burden-level UX + stage_subtexts selection).
