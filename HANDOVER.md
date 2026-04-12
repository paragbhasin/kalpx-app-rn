# RN Handover — Parag → Pavani (2026-04-10)

## Branch state
- **Branch**: `pavani`
- **HEAD**: `af15a40` — in sync with `origin/pavani`
- **Clean working tree** (only untracked screenshot PNGs + auto-regenerated `screenshots/index.html`)

## Commits this session (pull before you start)
```
af15a40 fix(rn): M3 sankalp title, Day 14 insight splash, M2 LogBox leak
5ff99aa fix(rn): derive OM mantra text from _selected_om_audio URL (Hari Om drift)
211a8b1 fix(rn): 9 pre-existing TS errors + 8 missing track events
67ddb40 fix(rn): audit follow-ups — C2, C3, H1, H2, H3, M1 from web parity audit
fcfa4b2 fix(android): rename om.mp3 → sankalp_om.mp3 to avoid Android raw resource collision
f1618ec fix(rn): remove duplicate trigger buttons on mantra runner
3bb5e90 feat(rn): add I Feel Triggered + Quick Check-In sections to dashboard
```

```bash
cd ~/kalpx-app-rn
git fetch origin
git checkout pavani
git pull origin pavani
```

## TL;DR — what changed
All changes are **web parity fixes** grounded in `kalpx-frontend/src/engine/actionExecutor.js` and `kalpx-frontend/src/blocks/*.vue`. Commit messages cite the web file:line for every change. Please read commit messages first — they're the canonical reference.

Major surfaces touched:
- `src/containers/PracticeRunnerContainer.tsx` — trigger button dedupe, Hari Om drift fix, session_started event, bead count reset
- `src/containers/CycleTransitionsContainer.tsx` — sankalp info_reveal subtitle
- `src/containers/CompanionDashboardContainer.tsx` — I Feel Triggered + Quick Check-In sections
- `src/blocks/CycleReflectionBlock.tsx` — Day 7/14 decision button labels
- `src/engine/actionExecutor.ts` — 8 missing track events, next_insight_screen wiring, additional item source, LogBox fix
- `src/screens/Home/WelcomeBack.tsx` — gold gradient via LinearGradient
- `scripts/walk_flows.py` — check-in + practice walker extensions

## Test setup

### Personas (all password `Test1234!`)
Seeded on dev backend (`dev.kalpx.com`). Nightly reseed cron runs at 04:00 UTC.

- `test+day3@kalpx.com` — no checkpoint, use for dashboard/flow tests
- `test+day7@`, `test+day7_high@`, `test+day7_medium@`, `test+day7_low@`, `test+day7_nearzero@`
- `test+day14@`, `test+day14_mastered@`, `test+day14_medium@`, `test+day14_low@`
- `test+welcomeback@` — 35 days past end, triggers welcome-back flow

### APK install
Android APK (commit `67ddb40`, usable baseline):
**https://expo.dev/artifacts/eas/vqYc4us3aS71yb9N9Wyv94.apk**

Open on Android device, install (allow "unknown sources" once), log in with any persona above.

**Note**: This APK does NOT include the last 4 commits (`211a8b1`, `5ff99aa`, `af15a40`). To get the latest, run `eas build --profile preview --platform android` — see EAS pricing section below.

### iOS — TestFlight path
Current iOS IPA (`bceac8b1`) is signed for STORE distribution but not yet submitted. To test on device:
```bash
eas submit -p ios --latest
```
Requires Apple ID + app-specific password. Takes 5 min upload + 15-60 min Apple processing. Install via TestFlight app on iPhone.

Alternative: add `distribution: "internal"` to the `preview` profile in `eas.json`, re-build with that profile, sign fresh ad-hoc provisioning profile under "Parag Bhasin (Individual)" team. This requires your Apple ID + 2FA since cached creds are STORE, not internal. Device UDID `00008150-0014148A26D9401C` is already registered.

## EAS build pricing — please read before re-building

EAS charges per build slot:
- **Free tier**: 30 builds/month, 15-30 min queue wait, shared machines
- **Production tier** ($99/mo): unlimited, 2-5 min wait, fast machines

Today's session used **6 builds** (2 finished + 4 canceled/failed). Please be frugal:
- Don't re-build for tiny changes — batch multiple fixes per build
- Check `eas build:list --platform all --limit 5 --non-interactive` before queueing
- The FINISHED `67ddb40` builds are still usable for smoke-testing the audit batch fixes
- iOS builds cost the same as Android — don't run both unless you need both

## What's pending (priority order)

### P0 — blockers for a "ship it" call
1. **Fresh device test** (install `67ddb40` APK on phone, smoke test all 4 personas, verify trigger+checkin+checkpoint flows render and navigate correctly)
2. **Fresh EAS build from `af15a40`** at end of next session (once nothing else to add) — picks up Hari Om fix, M3 sankalp title, Day 14 splash wiring
3. **iOS device test** via TestFlight after submit

### P1 — things that need a second pass
4. **Walker v2** — current `walk_flows.py` failed on `test+day3` persona because UI tap targets don't all match. Fix the landing-page selector and add sankalp_confirm capture for RUN.S.02. File: `scripts/walk_flows.py`. Emulator must be booted with latest APK installed before running.
5. **Insight summary / path_reveal visual diff** — code structure is correct (RN `InsightSummaryContainer.tsx` mirrors web 3-step flow), but visual parity never verified. Needs side-by-side screenshot comparison after fresh APK.
6. **C3 Python API test** — verify that completing an additional library item logs `source=additional_library` in `JourneyActivity` table on backend. Not written yet. Should live at `tests/api/test_additional_source.py`.

### P2 — nice to have
7. **RUN.S.02 walker gap** — `sankalp_confirm` renders fine on both platforms (PracticeRunnerContainer.tsx:1482), walker just never taps through embody to reach it. Extend `walk_core_sankalp()` in `scripts/walk_flows.py`.
8. **iOS deep-link code 115** — requires native rebuild + adding `Linking.addEventListener()` to `App.jsx`. Investigated this session; **not fixable as pure script change**. Defer until iOS automation is a priority.

### P3 — web-side fixes (NOT for this repo)
Documented in `~/.claude/projects/-Users-paragbhasin-kalpx-frontend/memory/pending_web_fixes_from_rn_audit.md`:
- **Web C3** — `actionExecutor.js:2125` submit source fallback (one-line fix)
- **Web M5** — `Setup.vue:266,306` add `welcome_back_decided` track event
Both need a PR against `kalpx-frontend`, not this repo.

## Things that WILL trip you up

### Environment config is a landmine
`src/Networks/baseURL.js:7` has a **hardcoded** `ENV = "dev"`. The EAS `preview` profile says `environment: production` and `distribution: STORE` — **ignore that**. Every build regardless of profile hits **dev.kalpx.com**. To ship to production you need to:
1. Change `ENV = "dev"` → `ENV = "prod"` in baseURL.js
2. Rebuild
This is brittle. Long-term fix: read from a build-time env var. For now, just know it.

### Android raw resource collision
If you add any file to `assets/sounds/`, check the basename (case-insensitive, extension-stripped) doesn't collide with any existing file. Android's `mergeReleaseResources` task flattens to lowercase and collides on basename. We hit this today with `Om.mp4` + `om.mp3` both mapping to `raw/assets_sounds_om`. See commit `fcfa4b2` for the fix.

### Walker needs a booted emulator + Metro + fresh APK
`scripts/walk_flows.py` assumes:
- Android emulator `emulator-5554` is booted
- Metro is running at `localhost:8081`
- The APK installed on the emulator is CURRENT (not stale)
- `test+day3@kalpx.com` persona is seeded on dev
- Nightly reseed cron is healthy

If any of these is wrong, the walker taps miss and you get "Could not find 'Return to Your'" errors. The walker uses maestro hierarchy lookup — debug by running `maestro --device emulator-5554 hierarchy` manually.

### Duplicate trigger buttons was fixed TWICE
First fix `f1618ec` removed inline buttons from the mantra runner branch. Second fix `5ff99aa` removed stale field reads from `mantraDisplayTitle`. If you see "Hari Om" text with OM audio again, it's the second issue reappearing — check that `mantraDisplayTitle` still derives from `_omTextForTrack(screenState._selected_om_audio)` and not from the stored `trigger_mantra_text` field.

## Contracts / governance

**MANDATORY before any nav/state/button change**: read the canonical docs in `kalpx-frontend/tests/e2e/`:
- `APPROVED_FLOW_CONTRACTS.md`
- `CANONICAL_INVARIANTS.md` (INV-1 to INV-12)
- `REGRESSION_CASES.md` (REG-001 to REG-020+)
- `STATE_OWNERSHIP_MATRIX.md`
- `FLOW_LIFECYCLE_CONTRACTS.md`

Key rules to never break:
- **INV-1** — "Return to Mitra Home" = explicit navigate to `companion_dashboard/day_active`, never `type: "back"`
- **INV-10** — `view_info` must fully overwrite info fields, no fallback chains
- **INV-12 / REG-015** — trigger buttons must not leak to core. `isTriggerSession` must scope to current state only.
- **REG-002 / INV-4** — `initiate_trigger` must seed `trigger_mantra_text="OM"` synchronously, before `loadScreen`
- **Rule 12 / REG-010** — `generate_companion` must not overwrite `day_number`/`identity_label`/`path_context` when `checkpoint_headline` is set (checkpoint context guard)

## Memory files (for future Claude sessions)
- `~/.claude/projects/-Users-paragbhasin/memory/rn_checkpoint_architecture.md` — 4-stage checkpoint flow, personas, seed system, screenshot pipeline
- `~/.claude/projects/-Users-paragbhasin/memory/feedback_reference_web_constantly.md` — rule: every RN fix must cite web file:line

## Questions to Parag before continuing
1. Do you want `ENV = "dev"` ↔ `"prod"` switch moved to build-time env var, or leave as manual toggle?
2. For iOS, prefer TestFlight (easier, but Apple processing delay) or ad-hoc (faster install, needs `distribution: "internal"` + credential rework)?
3. Should we check in the walker test screenshots to git, or keep them gitignored as today?
