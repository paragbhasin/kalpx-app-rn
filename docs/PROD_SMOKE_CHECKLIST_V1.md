# Mitra Production-Profile Smoke Checklist V1

**Owner:** Delivery Restoration (MDR-S1-16).
**Purpose:** this is the blocker-list between Sprint 1 code complete and CP-1 flag flip. Every item below MUST pass on a production-profile preview build before `EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD=1` ships to the App Store.

**Build profile:** `eas build --profile preview` (TestFlight / Android Internal) — NOT `--profile production` until CP-1.
**Env:** staging or prod backend (whichever CP-1 targets first).
**Prerequisite:** `MITRA_V3_CONTENT_RESOLVE_ENABLED=1` confirmed on target BE (S1-07 gate).

## Flow-level smoke (founder plan Phase 2.1 + Sprint 1 additions)

| # | Flow | Pass criteria | Hard deny-list |
|---|---|---|---|
| 1 | Returning user → home | `/journey/home/` renders; chips visible; no blank cards | "Welcome, friend." · "You're here. Begin wherever feels right." |
| 2 | Quick check-in balanced → day_active | Check-in block renders; no auto-detour | — |
| 3 | Quick check-in agitated/drained | Same check-in block; user can independently tap triggered chip | — |
| 4 | Triggered flow → completion | Mantra runner launches; completion renders generic variant (no anchor) | — |
| 5 | Joy chip → Joy Room (M48) | Chip visible; M48 opens; opening_line renders | "(opening missing)" · "Welcome, friend." |
| 6 | Growth chip → Growth Room (M49) | Chip visible; M49 opens; 5 inquiry categories render; seat prompt per category | — |
| 7 | Grief Room (M46) | Opens from MoreSupportSheet; opening_line renders | "Grief Room" in body · pre-spine hardcoded copy |
| 8 | Loneliness Room (M47) | Opens from MoreSupportSheet; opening_line renders | "Loneliness Room" in body · "I'm here if you need more." |
| 9 | Day 7 checkpoint (M24) | Eyebrow + headline + narrative + 3 CTAs render | "Seven days." · hardcoded templates |
| 10 | Day 14 checkpoint (M25) — **post-S1-10** | New `narrative_template` interpolated with `{completed_count}/14`; summary line same | "Fourteen days. Two weeks of showing up." · "sealed. Something has settled." |
| 11 | Core mantra → completion | `M_completion_return_core_mantra_en` wins; anchor "Action without grasping carries its own fullness." | "How did that feel?" |
| 12 | Core sankalp → completion | `M_completion_return_core_sankalp_en` wins; anchor "The intention held lightly..." | — |
| 13 | Core practice → completion | `M_completion_return_core_practice_en` wins; anchor "The body remembers what the mind forgets." | — |
| 14 | Support grief × mantra | `M_completion_return_support_grief_mantra_en` wins; anchor "Grief held quietly..."; `return_to_source` returns to grief_room | — |
| 15 | Support growth × practice | `M_completion_return_support_growth_practice_en` wins; anchor "The rhythm clarifies what urgency cannot." | — |
| 16 | Additional × mantra (library/custom/recommended) — **post-S1-08** | Correct additional_* variant wins per source; visual-only (no wisdom anchor); nav returns to dashboard (not return_to_source) | — |

## Sovereignty hard-deny global check

Run `grep -r` against a screen-recorded session transcript (or use Silk Integrity `FALLBACK_DENY_LIST.txt`) to assert NONE of these strings render in any flow:
- `"Fourteen days. Two weeks of showing up."` — MDR-S1-10 deny
- `"How did that feel?"` — MDR-S1-12 drop
- `"I'm here if you need more."` · `"Grief Room"` · `"Loneliness Room"` — MDR-S1-11 deny
- `"Today's anchor"` · `"Today's vow"` · `"Today's practice"` — MDR-S3-04 deny
- `"Your Sankalp is Alive."` — MDR-S3-05 deny
- `"Welcome, friend."` · `"You're here. Begin wherever feels right."` — MDR-S3-07 deny (S1 finding: still present via GreetingCard)
- `"One gentle step is enough."` — post-S1-04 deny

## Performance / stability smoke

- No blank dashboard cards (each render-conditional card either shows real content or hides cleanly)
- No `(translation missing)` or raw moment_id leaks anywhere
- No double-render of completion transient
- No legacy `companion_dashboard` briefly flashes before `companion_dashboard_v3` mounts (stable post-flip transition)
- `/journey/companion/` response carries `post_conflict` (snake_case) AND `postConflict` (camelCase alias, burn-in); FE renders correctly from either
- `why_this_l1_items` flat array renders preferred; nested `why_this.level1.*` fallback works if burn-in emit drops

## Dependency gates

- **S1-07 gate:** content-resolve flag confirmed `1` on target env.
- **S1-13 Silk Integrity pack:** 11 flows authored; first CI run green (or documented as PARTIAL with founder-accepted risk).
- **S1-15 legacy classification:** published; no new feature work lands on legacy dashboard during smoke window.

## Who signs off

- **Engineering:** confirms all 16 rows PASS and sovereignty hard-deny scan is clean.
- **Founder (CP-1):** accepts the residual risk matrix from S1-07 (if staging/prod env-flag state is still PASS-WITH-RISK at time of flip).

## Rollback plan

- Flag flip = single `eas.json` edit. Rollback = set `EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD` back to `"0"` and re-ship build. ETA ~25 min.
- No schema or migration rollback required; BE envelope changes are additive (dual-emit burn-in).
