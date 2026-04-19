# CP-1 Decisions Log — Sprint 1 founder checkpoint

**Date:** 2026-04-18 (session-inline).
**Bundle document:** `docs/CP1_BUNDLE_V1.md`.
**Follows:** standing-baseline bundled-checkpoints-not-per-ticket-pauses rule.

## Recorded dispositions

| Gate | Disposition | Guardrail |
|---|---|---|
| **G1 — Env flag verification** (**REVISED 2026-04-18 mid-CP-1**) | **No prod now.** Verify `MITRA_V3_CONTENT_RESOLVE_ENABLED=1` on **dev + staging only.** Prod `.env` untouched. No production flag flip. Sprint 1 continues on dev/staging only. | **Hard constraint: no production env changes, no production flag flip, no production smoke path this sprint.** Prod rollout is PARKED and reopens only by explicit founder instruction. Staging must pass the 7-moment resolve probe matrix before Phase 2 preview build. |
| **G2 — 14-scaffold delete queue** | **Approve 14.** | Sprint 3 ships single delete PR. Deletion includes `day_type_chip` + `voice_on_every_screen` (per standing defaults-if-silent tightening). Git history preserves. |
| **G3 — `/moment/next/` shadow router** | **Defer to CP-5.** | Shadow mode continues through Sprint 4. Phase T2b exit-criteria memo required for CP-5 activation-vs-delete decision. |
| **G4 — Legacy dashboard removal** | **Evidence-gate (not calendar).** | **Remove only after the first fully-green post-flip week, with rollback confidence established, and zero unresolved dashboard parity regressions.** `2026-07-31` is a planning placeholder, NOT the trigger. |
| **G5 — Silk skeleton quality** | **Acknowledged as regression floor only.** | Skeletons are baseline. First live-run against preview build is expected to reveal Maestro-ID patches. Do not describe as "CI-ready" or "comprehensive." |
| **G6 — CP-3 bridge removal** | **Approve.** | At CP-3 (end of Sprint 3, ~2026-05-30): `postConflict` camelCase + `why_this.level1.*` nested shapes removed from `journey_envelope.py`. Register row updates at CP-3 bundle. |

## Immediate consequences (post-revision)

- **S1-17 production flag flip is PARKED for this sprint.** No eas.json production edit, no App Store ship. Reopens only on founder instruction.
- **Sprint 1 closes on dev/staging** once: staging G1 verified + preview build green + Silk live-run green + staging smoke walk-through clean.
- **Prod rollout path becomes a separate future ticket** (not scoped into Sprint 1 or 2). It carries its own gating: prod env flag work + prod smoke matrix + prod rollback drill.
- Sprint 3 planning (MDR-S3-10 delete queue) can now expand to 14 scaffolds without further founder review.
- Sprint 4 planning stays clean (no shadow-router activation work scheduled there).
- Sprint 5 bundle (CP-5) must include: `/moment/next/` activate-vs-delete + Phase T2b exit-criteria memo.
- CompanionDashboardContainer carries a standing evidence-gate — do not remove until the 3 conditions are met, regardless of date.

## Post-CP-1 sequencing — REVISED per 2026-04-18 mid-CP-1 constraint

**Scope:** dev only this sprint (topology: no separate staging env in this repo — dev IS the team's staging equivalent per `docker-compose.yml` + memory confirmation). No prod activity.

1. **Phase 1** — Ops handoff (G1 work). ✅ **Already satisfied on dev** (MITRA_V3_CONTENT_RESOLVE_ENABLED=1 set, 7-moment probe PASS 7/7). No separate staging env exists to verify.
2. **Phase 2** — Preview build via `eas build --profile preview` **targeting dev backend**. Requires EAS credentials + explicit founder "go" before invoking (cost + distribution visibility).
3. **Phase 3** — S1-13 Silk Integrity first live execution against preview build. Iterate until 11/11 green. Patch placeholder Maestro IDs as real IDs surface.
4. **Phase 4** — S1-16 human smoke walk-through on preview build (end-of-sprint validation).
5. **Phase 5** — **PARKED.** S1-17 production flag flip does NOT happen this sprint. Reopens only on explicit founder instruction; will carry its own future ticket + gates.

Sprint 1 closes when Phase 4 is green on dev. Production rollout is a separate future engagement.

**Topology note:** If the team stands up a separate staging env in the future, Phase 1 reopens for that env and Phase 2/3/4 iterate against it before prod reopen. For this sprint, dev carries the full validation weight.

## What CP-1 did NOT decide (deliberately deferred)

- Rooted-mode reframing (CP-5 scope).
- Selector FE activation surface (CP-4 scope — Level A gate in Sprint 4).
- 71-row wisdom library eligibility classification (CP-5 scope).
- Trigger-tag policy extension (CP-5 scope).

These remain queued against their designated checkpoints. No scope creep into CP-1.

## Process note

Single Level-A gate left in Sprint 1: S1-17 flag flip itself, now sequenced behind Phase 1–4. Every other ticket operated under agent review + defaults-if-silent. No additional founder intervention expected between now and end-of-Sprint-1 unless Phase 1–4 surfaces a real ambiguity.
