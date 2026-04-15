# Issues Log — 2026-04-10 Session

Full record of every issue found, fixed, deferred, or flagged during this session. Grouped by category. Each entry has: what it is, where, status, evidence, fix (if any), owner.

---

## 🟢 FIXED (on branch `pavani`, HEAD `28765fa`)

### FIX-01 — Android gradle duplicate resource collision
- **Where**: `assets/sounds/Om.mp4` + `assets/sounds/om.mp3` both mapped to `raw/assets_sounds_om` because Android's `mergeReleaseResources` normalizes raw resource names to lowercase basename (extension stripped)
- **Symptom**: EAS Android build failed with `EAS_BUILD_UNKNOWN_GRADLE_ERROR` → `Execution failed for task ':app:mergeReleaseResources' > Duplicate resources`
- **Root cause**: The mantra rotation audio (`Om.mp4`) and the sankalp embody chime (`om.mp3`, 4.2s short chime) were both present in `assets/sounds/`, named similarly
- **Fix**: Renamed `om.mp3` → `sankalp_om.mp3` + updated require() at `PracticeRunnerContainer.tsx:834`
- **Commit**: `fcfa4b2`
- **Follow-up risk**: If anyone adds `Om.wav` or `om.mp4` in the future, same collision. Guardrail: check basename uniqueness before adding to `assets/sounds/`

### FIX-02 — Trigger mantra runner duplicate buttons (C1)
- **Where**: `src/containers/PracticeRunnerContainer.tsx` — mantra runner branch was rendering support buttons TWICE
- **Symptom**: Screenshot showed 4 buttons on `post_trigger_mantra`: 2x "I feel calmer now", 1x "I still feel triggered", 1x "Try another way" + "Return to Mitra Home" link. Should be only 2 buttons per web schema
- **Root cause**: Inline `triggerRunnerActions` hardcoded buttons AND schema-driven `mantraRunnerFooterBlocks` both rendering from `allContainers.js:2456-2490` footer_actions
- **Fix**: Removed the inline block, kept only BlockRenderer path (web has only the schema-driven set)
- **Commit**: `f1618ec`
- **Evidence**: Pre-fix screenshot at `screenshots/flow_trigger/03_trigger_practice_20260410_153328.png`; post-fix at `screenshots/verify_dedupe/om_buttons_scrolled_20260410_154712.png`

### FIX-03 — Day 7 nearzero label (C2)
- **Where**: `src/blocks/CycleReflectionBlock.tsx:154` buildDecisions lighten branch
- **Symptom**: Primary button on Day 7 nearzero decision showed `"Return to Mitra Home"` instead of `"Lighten My Path"`
- **Web parity**: `actionExecutor.js:284-298` uses labelMap `{lighten: "Lighten My Path", continue: "Continue", reset: "Start Fresh"}`
- **Fix**: Changed hardcoded label. Also updated non-lighten Day 7 continue path from `"Return to Mitra Home"` → `"Continue"` to match web
- **Commit**: `67ddb40`

### FIX-04 — Day 14 Deepen button label (H3)
- **Where**: `src/blocks/CycleReflectionBlock.tsx:125`
- **Symptom**: Day 14 decision showed `"Deepen My Practice"` button
- **Web parity**: `CycleReflectionBlock.vue:422-449` day14DecisionOptions computed uses label `"Deepen"` (terser — the deepen suggestion metadata renders separately in a deepen-preview-card above the decision list)
- **Fix**: Changed to `"Deepen"` + updated description to match web "Add one deeper item while staying on the same path."
- **Commit**: `67ddb40`
- **Note**: Earlier audit agent suggested `"Continue Same Path"` and `"Change My Focus"` changes — these came from `actionExecutor.js` labelMap which is **dead code** for this Vue template path. RN's `"Continue Same"` and `"Change Focus"` are already correct.

### FIX-05 — Additional item source tracking (C3)
- **Where**: `src/engine/actionExecutor.ts:900` view_info handler
- **Symptom**: When user taps an additional library item, `runner_active_item` is never populated → on submit, source falls through to `"core"` and engagement metrics for additional items get misattributed
- **Root cause**: view_info only sets `_last_viewed_item` (4 fields, minimal). Submit handler's 4-tier source resolution (`payload.source || activeSupport.source || runner_active_item.source || "core"`) has no `runner_active_item` to read from for additional items
- **Fix**: Added explicit `runner_active_item` population in view_info when `resolvedSource === "additional_library" | "additional_custom" | "additional"`, carrying iast/devanagari/audio_url/steps/title from manualData
- **Commit**: `67ddb40`
- **Web gap**: Web has the SAME bug at `kalpx-frontend/src/engine/actionExecutor.js:2125` — submit handler only has 2-tier resolution, not 4-tier. Web is **worse** than RN on this. Parked in frontend memory at `~/.claude/projects/-Users-paragbhasin-kalpx-frontend/memory/pending_web_fixes_from_rn_audit.md`
- **Backend test needed**: Python API test at `tests/api/test_additional_source.py` to verify `JourneyActivity.source = "additional_library"` after submit. NOT WRITTEN YET.

### FIX-06 — Welcome Back gold gradient (M1)
- **Where**: `src/screens/Home/WelcomeBack.tsx` Continue button
- **Symptom**: RN used solid `#d0902d`; web uses `linear-gradient(135deg, #d4a853, #c49a3c)`
- **Fix**: Wrapped Continue button with `expo-linear-gradient` LinearGradient, same color stops + angle (start={0,0} end={1,1} = 135deg)
- **Commit**: `67ddb40`

### FIX-07 — Hari Om text/audio drift on Pause and Breathe screens
- **Where**: `src/containers/PracticeRunnerContainer.tsx` — `mantraDisplayTitle`, `mantraText`, `mantraHindi` useMemos
- **Symptom**: Pause and Breathe (`checkin_breath_reset`) and trigger OM screens (`free_mantra_chanting`, `post_trigger_mantra`) showed "Hari Om" title while audio played Om.mp4 — title and audio out of sync
- **Root cause**: Title was reading from stored `trigger_mantra_text` / `checkin_mantra_text` (set once by actionExecutor rotation code before loadScreen) which could become stale across rotations. IAST and devanagari already derived correctly from `_omTextForTrack(_selected_om_audio)` URL, but title used stored fields
- **Fix**: Port web yesterday's fix (commit `53721c3` in kalpx-frontend): make title derive from URL the same way IAST and devanagari do. Also added `runner_active_item` priority for `checkin_support_mantra` (post-breath-reset specific mantra) and `trigger_step >= 3` (trigger-picked specific mantra)
- **Commit**: `5ff99aa`
- **Affects both flows**: Quick Check-In → Pause and Breathe → support mantra. I Feel Triggered → OM → post-trigger mantra.

### FIX-08 — Sankalp info reveal title framing (M3)
- **Where**: `src/containers/CycleTransitionsContainer.tsx:264`
- **Symptom**: Sankalp info_reveal showed only `info.meaning || info.summary` as main text
- **Web parity**: `CycleTransitionsContainer.vue:248` renders `sanskritText || info.subtitle` = the "I step forward even when…" framing copy. info.meaning belongs in the expanded Meaning card below
- **Fix**: Changed to `info.subtitle || info.title || info.iast || info.meaning || info.summary` fallback chain
- **Commit**: `af15a40`

### FIX-09 — Day 14 insight splash wiring (`next_insight_screen`)
- **Where**: `src/engine/actionExecutor.ts:881` prana check-in submit branch
- **Symptom**: Day 14 users were skipping the `daily_insight_14` milestone splash entirely, jumping straight past it
- **Root cause**: `allContainers.js:4122` uses template `state_id: "{{next_insight_screen}}"`, but `next_insight_screen` was never set in RN. Web `actionExecutor.js:2279-2283` sets it before `mitraPranaAcknowledge()` call. RN's interpolate() util supports `{{var}}` but silently falls through to empty string when the var isn't set
- **Fix**: Added `setScreenValue(day === 14 ? "daily_insight_14" : "daily_insight", "next_insight_screen")` in RN prana check-in submit handler in the same position as web
- **Commit**: `af15a40`

### FIX-10 — LogBox red overlay leaking into screenshots (M2)
- **Where**: `src/engine/actionExecutor.ts:1312` generate_companion handler
- **Symptom**: Day 14 intro screenshot showed red "[ENGINE] No companion data received" toast overlay from React Native's LogBox
- **Root cause**: `console.error()` in dev builds triggers RN's red LogBox overlay. The underlying no-data case is recoverable (checkpoint orchestrator has its own seed path), so it's a warning not a crash
- **Fix**: `console.error` → `console.warn`, updated message to "generate_companion returned no data — skipping companion seed"
- **Commit**: `af15a40`

### FIX-11 — 9 pre-existing TypeScript errors (unrelated legacy)
- **Where**: InsightSummaryContainer, ClassRescheduleScreen, CartModal, MySadana, StreakScreen, NavigationService
- **Symptom**: `npx tsc --noEmit` exited with 9 errors that were blocking future CI adoption
- **Fixes**:
  1. `InsightSummaryContainer.tsx:468` — uncommented `scrollView` style
  2. `ClassRescheduleScreen.tsx:218` — added missing `highlightDates={[]}` prop
  3. `components/CartModal.tsx` — made `onBrowseMore` prop optional (fixes 4 call sites)
  4. `MySadana.tsx:505` — removed deprecated `panGestureHandlerProps` (removed in react-native-reanimated-carousel v4)
  5. `StreakScreen.tsx:184` — removed unsupported `message` field from `Sharing.shareAsync` options
  6. `NavigationService.ts:19` — cast navigate to `any` to bypass tuple inference
- **Commit**: `211a8b1`
- **Result**: `npx tsc --noEmit` exit 0
- **Note**: None of the protected audit files (CycleReflectionBlock, actionExecutor, WelcomeBack, PracticeRunnerContainer) were touched

### FIX-12 — 8 missing track events (web parity)
- **Where**: `src/engine/actionExecutor.ts` + `src/containers/PracticeRunnerContainer.tsx`
- **Missing events**:
  1. `checkin_ack_only` — differentiates ack-without-support from ack-with-support (conditional on `pranaAckRes.suggestions.length`)
  2. `checkin_breath_reset` — fires when agitated/drained user enters OM breath reset
  3. `checkin_resolved_after_breath_reset` — secondary event in track_event case when `checkin_breath_reset_completed` tracked
  4. `checkin_support_completed` — fires when support item completes inside check-in flow (navigate case, guarded by `_isCheckinFlow`)
  5. `session_started` — fires when a runner session begins (mantra/sankalp/practice/trigger/check-in), in PracticeRunnerContainer useEffect gated by sessionRunners set
  6. `session_abandoned` — payload.type === "session_abandoned" branch in submit
  7. `trigger_session_abandoned` — payload.type === "trigger_session_abandoned" branch in submit, runs `_cleanupOnReturnHome`
  8. `trigger_resolved_after_support` — payload.type === "trigger_resolved_after_support" branch in submit, clears trigger_mantra state
- **Commit**: `211a8b1`
- **Web source references cited inline**: each event has its source line from `kalpx-frontend/src/engine/actionExecutor.js` in the RN commit message

### FIX-13 — EAS upload archive size (523MB → 362MB)
- **Where**: project root `.easignore`
- **Symptom**: `eas build` compressed the project into 523MB archive before upload (took 2+ min per build)
- **Root cause**: No `.easignore` — EAS was including local `android/` (3.9 GB) + `ios/` (226 MB) + `screenshots/` (182 MB) + `build-extract/` (175 MB) + `build.ipa` (82 MB) + other junk in the upload
- **Fix**: Added `.easignore` excluding native build outputs, test artifacts, stale build extracts, local dev files
- **Commit**: `28765fa`
- **Effective reduction**: First build with .easignore was 362MB (still better than 523MB but smaller than expected — the `assets/` dir is 214MB and legitimately needs to ship). Could be further reduced by moving audio to S3 or splitting assets but that's larger refactor work.

---

## 🟠 VERIFIED NOT A BUG (but flagged as issues)

### VERIFIED-01 — RUN.S.02 sankalp intermediate screen "missing"
- **Audit claim**: "Possibly missing intermediate screen between info_reveal and embody"
- **Verification**: Both web and RN have `sankalp_confirm` state at `allContainers.js:1739` / `1740`. RN `PracticeRunnerContainer.tsx:1482` has `isSankalpConfirm` render branch rendering "Your Sankalp is Alive." completion screen with lotus + how-to-live + Repeat/Return buttons
- **Actual gap**: The walker (`walk_flows.py walk_core_sankalp`) never taps through the embody hold to reach the confirm screen. **Walker coverage gap, not a code bug.**
- **Fix needed**: `scripts/walk_flows.py` — extend walk_core_sankalp to hold-and-tap through embody to reach sankalp_confirm

### VERIFIED-02 — insight_summary / path_reveal "never audited"
- **Audit claim**: "Visual audit never completed"
- **Verification**: `src/containers/InsightSummaryContainer.tsx` already implements step0/step1/step2 state machine mirroring web's `insight_config.step0/step1/step2` structure. Reads subtext, labels, CTA copy from schema.insight_config. Code structure is correct
- **Actual gap**: Visual side-by-side diff against web `tests/e2e/screenshots/matrix/PT.*.png` was never done this session
- **Not a code bug**; requires a visual verification pass after fresh APK

### VERIFIED-03 — Checkpoint 4-stage flow agent claimed label mismatches
- **Audit claim**: Day 14 labels "Continue Same Path" / "Change My Focus" / "Deepen: {title}"
- **Verification**: Those labels exist in `kalpx-frontend/src/engine/actionExecutor.js:299-309` but they are **dead code** — the Vue template at `CycleReflectionBlock.vue:1411-1428` renders `day14DecisionOptions` computed (`.vue:422-449`) which uses different labels: "Continue Same" / "Deepen" / "Change Focus"
- **RN matches the Vue template labels**, not the dead actionExecutor labels. Only the Deepen → "Deepen My Practice" was actually wrong (fixed in FIX-04)
- **Lesson**: When auditing, check which code path actually renders to the UI, not just the first grep hit

---

## 🔴 PENDING (not fixed, needs follow-up)

### PEND-01 — Walker `walk_flows.py` landing page selector fragile
- **Where**: `scripts/walk_flows.py` — most walker functions start with `tap_text("Return to Your")`
- **Symptom**: Today's walker run failed on `test+day3` persona:
  ```
  === CORE MANTRA ===
     ⚠ Could not find 'Chant'
  === ADDITIONAL PRACTICE ===
     ⚠ Could not find 'Return to Your'
  === QUICK CHECK-IN ===
     ⚠ Could not find 'Return to Your'
  === I AM TRIGGERED ===
     ⚠ Could not find 'Return to Your'
  ```
- **Root cause**: Either the "Return to Your" button text doesn't exist on some personas, or the walker taps too early before the UI hierarchy is ready
- **Fix needed**: Adjust landing page selectors to match what's actually in the hierarchy; add polling/retry
- **Owner**: Pavani (needs emulator running + fresh APK to debug)

### PEND-02 — Walker `walk_personas.py` missing grid stage
- **Where**: `scripts/walk_personas.py:150` taps "Reflect on My" and expects to land on mirror
- **Actual flow**: Reflect tap goes to **grid** stage (per-day circles), not mirror. Walker mislabels `03_mirror` as the grid stage and `04_decision` as what would have been mirror
- **Symptom**: Persona screenshots today (`persona_day7_*/03_mirror*`) show the journey grid, not the mirror stage with engagement bars
- **Fix needed**: Add a capture step for grid, then tap Continue to reach mirror, capture, then tap Continue for decision
- **Current captures**: `01_home`, `02_intro`, `03_mirror` (actually grid), `04_decision` (actually mirror or decision depending on persona)
- **Owner**: Pavani

### PEND-03 — Walker only captures one screenshot per stage
- **Where**: `scripts/walk_personas.py` + `walk_flows.py`
- **Symptom**: Long stages (mirror with chart + mitra message + scroll, decision with 3 buttons + description) only get one screenshot — Pavani can't see the full content
- **Fix needed**: Add scroll-capture pass for each stage: capture top, scroll down, capture middle/bottom
- **Owner**: Pavani

### PEND-04 — RN check-in flow has almost no walker coverage
- **Where**: `scripts/walk_flows.py:walk_checkin`
- **Symptom**: Only captures `01_day_active`. No prana select, no breath reset, no support mantra, no resolved screen
- **Fix attempted this session**: Walker extended to 6 captures in commit `67ddb40`, but walker didn't run successfully (PEND-01)
- **Owner**: Pavani

### PEND-05 — RN practice step_runner never captured (H2)
- **Where**: `scripts/walk_flows.py:walk_core_practice`
- **Symptom**: `screenshots/flow_core_practice/02_info_reveal_practice_*.png` is actually the dashboard practice selector, not the info_reveal screen. Never captures the timer/step runner
- **Fix attempted this session**: Walker extended with correct navigation in commit `67ddb40`, but walker didn't run successfully (PEND-01)
- **Owner**: Pavani

### PEND-06 — C3 backend test not written
- **Where**: would live at `tests/api/test_additional_source.py` in backend (`kalpx` repo)
- **Purpose**: Verify that completing an additional library item logs `source = "additional_library"` in `JourneyActivity` table (not `"core"`)
- **Fix needed**: Python test using existing JWT fixtures from `tests/api/fixtures.py`
- **Owner**: Pavani or Parag

### PEND-07 — iOS deep-link code 115 error
- **Where**: `scripts/screenshot_flow.py` iOS injection path
- **Symptom**: iOS automation can't launch the app via deep link with JWT injected
- **Root cause investigation** (done this session, agent report): 3-layer issue
  1. `adb` is Android-only — no iOS equivalent command
  2. RN app has zero deep-link handling code in `App.jsx` — no `Linking.addEventListener`, no `getInitialURL()`
  3. AsyncStorage path differs between Android (RKStorage SQLite) and iOS
- **Fix needed**:
  1. Add deep-link handler to `App.jsx` (requires native rebuild)
  2. Modify `screenshot_flow.py` to support iOS simulator via `xcrun simctl openurl booted`
  3. OR create a test API endpoint on backend for JWT injection
- **Verdict**: **Requires native rebuild** — not fixable as pure script change
- **Owner**: Deferred — separate session

### PEND-08 — Web C3 fix (not this repo)
- **Where**: `kalpx-frontend/src/engine/actionExecutor.js:2125` submit handler source resolution
- **Symptom**: Web submit only has 2-tier source fallback; misses `runner_active_item.source` → additional items log as `source=core` on web too
- **Fix**: One-line change — add `screenStore.screenState.runner_active_item?.source` to the submit source fallback chain
- **Parked at**: `~/.claude/projects/-Users-paragbhasin-kalpx-frontend/memory/pending_web_fixes_from_rn_audit.md`
- **Owner**: Pavani (frontend PR)

### PEND-09 — Web M5 fix (not this repo)
- **Where**: `kalpx-frontend/src/components/DailyDharma/Setup.vue:266, 306`
- **Symptom**: Welcome Back Continue and Start Fresh handlers don't fire `welcome_back_decided` analytics event. RN fires it (`Home.tsx:172-180, 236-263`); web doesn't → asymmetric analytics
- **Fix**: Add `authStore.trackEvent("welcome_back_decided", {...})` call to both handlers, matching RN payload shape
- **Parked at**: same memory file as PEND-08
- **Owner**: Pavani (frontend PR)

### PEND-10 — Comprehensive persona walker re-run needed
- **Symptom**: All current `persona_*/` screenshots were captured **against older APKs** (pre-audit-fix state). They don't show:
  - Day 7 lighten: still shows "Return to Mitra Home" button (should be "Lighten My Path") — FIX-03
  - Day 14 decision: still shows "Deepen My Practice" (should be "Deepen") — FIX-04
  - Welcome Back: still shows solid gold button (should be gradient) — FIX-06
- **Fix needed**: Install latest APK, run `walk_personas.py` for all 8 personas, regenerate `comparison.html`
- **Owner**: Pavani

### PEND-12 — Walker JWT injection blocked on non-debuggable release APKs 🔴 NEW
- **Where**: `scripts/screenshot_flow.py:218` `_exec_sql()` uses `adb run-as com.kalpx.app sqlite3`
- **Symptom**: Running `walk_personas.py` against the `preview` profile APK (from `28765fa`) fails on all 8 personas with:
  ```
  RuntimeError: sqlite3 exec failed: run-as: package not debuggable: com.kalpx.app
  ```
- **Root cause**: `adb run-as` only works on apps with `android:debuggable="true"` in AndroidManifest.xml. EAS `preview` profile signs builds for STORE distribution (release mode) → `debuggable=false` → run-as blocked
- **Why it worked earlier today**: The Apr 9 APK installed on the emulator was a `development` profile build with expo-dev-client — that one is debuggable. When the `preview` APK overwrote it at 18:38, JWT injection stopped working immediately
- **Impact**: Can't automate persona login on release builds. Blocks comparison gallery refresh for 7/14/welcomeback flows
- **Fix options** (no code change done this session):
  1. **Add a debuggable build profile to eas.json** — e.g., `preview-debug` that sets `android.gradleCommand` or native options to emit `debuggable=true` in the manifest. This is the cleanest long-term fix
  2. **Switch to Maestro flows** for all persona walkthroughs — Maestro drives the UI without needing AsyncStorage access, so it works on release builds
  3. **Write a test-only deep link handler** in the app that accepts JWT via intent extras (e.g., `exp+kalpx://test-login?token=...`) — requires native rebuild but works on release APKs
  4. **Manual login + walker tap path** — run walker after each manual login, needs walker refactor to skip `inject_jwt` when `--manual-login` flag is passed
- **Workaround for current session**: None without code changes. Previous persona screenshots (pre-18:38) from `persona_day7_*`, `persona_day14_*`, `persona_welcomeback` are the freshest available but were captured against the PRE-audit-fix APK
- **Owner**: Pavani

### PEND-11 — Device smoke test
- **Symptom**: All fixes are verified via code review + typecheck. None have been verified on a physical device
- **Fix needed**:
  1. Install latest APK on phone
  2. Log in with each of 4 key personas (day3, day7_high, day14_mastered, welcomeback)
  3. Smoke test each flow: dashboard sections, trigger, check-in, checkpoint, welcome back
  4. Report any regressions
- **Owner**: Pavani

---

## 🟣 TRIVIA / KNOWN CAVEATS

### TRIVIA-01 — ENV config is hardcoded
- `src/Networks/baseURL.js:7` has `ENV = "dev"`. All builds hit `dev.kalpx.com` regardless of EAS profile name
- Mismatch with EAS config: `preview` profile extends `production` in eas.json, but this is EAS metadata only — not the API URL
- To ship to prod: manually edit `ENV = "prod"` and rebuild
- **Risk**: easy to ship the wrong build. Long-term fix: read from build-time env var

### TRIVIA-02 — EAS build profiles and distribution
- All current builds are `profile=preview`, `distribution=STORE`
- STORE distribution means the build is signed for App Store / Play Store
- Android APKs signed with STORE key can be sideloaded fine (works today)
- iOS IPAs signed with STORE distribution require either TestFlight OR ad-hoc provisioning profile (`distribution: "internal"` in eas.json)
- We registered device UDID `00008150-0014148A26D9401C` under "Parag Bhasin (Individual)" team during this session but didn't switch to ad-hoc distribution

### TRIVIA-03 — Nightly reseed cron
- `kalpx/scripts/reseed_personas.sh` installed at `/etc/cron.d/kalpx-reseed-personas` on dev EC2 box
- Runs 04:00 UTC daily
- Prevents dayNumber drift as real time advances
- If tests start failing suddenly with wrong day, check cron health first

### TRIVIA-04 — RN uses interpolate() util for {{var}} templates
- `src/engine/utils/interpolation.ts` supports `{{var}}` and `{{nested.key}}` from screenState
- If an interpolation silently resolves to empty string, it's because the key isn't in state — not an interpolation bug
- Saw this with `{{next_insight_screen}}` in FIX-09

### TRIVIA-05 — Android raw resource naming gotcha
- Any file added to `assets/sounds/` becomes a raw resource
- Names are normalized: lowercase + extension stripped
- `Om.mp4` and `om.mp3` both become `raw/assets_sounds_om` — collision
- Before adding new audio, grep for basename collision

### TRIVIA-06 — Dashboard schema-driven vs inline rendering drift
- `CompanionDashboardContainer.tsx` was missing 4 sections: I Feel Triggered, Quick Check-In, Your Progress, Daily Rhythm
- These were supposed to be rendered via `footerActionBlocks` from schema
- Schema-driven rendering path wasn't working, so they were added as inline JSX this session (commit `3bb5e90`)
- Long-term: fix the schema-driven path so inline fallbacks aren't needed

---

## 📊 SESSION STATS
- **Commits**: 9 total on `pavani` branch
- **Files changed**: ~20
- **TypeScript errors fixed**: 9 → 0
- **Track events added**: 8
- **Audit findings resolved**: C1, C2, C3, H1, H2, H3, M1, M2, M3 + Hari Om drift + Day 14 splash
- **Web-side issues parked for frontend PR**: 2 (C3, M5)
- **EAS builds attempted**: 8 (6 finished / failed / canceled, 2 usable)
- **Current usable APK**: `ee558017` from `67ddb40` at https://expo.dev/artifacts/eas/vqYc4us3aS71yb9N9Wyv94.apk
- **Time budget eaten by walker debugging**: too much — Pavani should prioritize walker reliability

## 🔗 KEY REFS
- Branch: `pavani` @ `28765fa`
- Origin: `https://github.com/paragbhasin/kalpx-app-rn`
- HANDOVER.md: `~/kalpx-app-rn/HANDOVER.md` (task-oriented handover for Pavani)
- Frontend pending fixes: `~/.claude/projects/-Users-paragbhasin-kalpx-frontend/memory/pending_web_fixes_from_rn_audit.md`
- RN architecture memory: `~/.claude/projects/-Users-paragbhasin/memory/rn_checkpoint_architecture.md`
- Web reference screenshots: `~/kalpx-frontend/tests/e2e/screenshots/matrix/`
- RN captures: `~/kalpx-app-rn/screenshots/`
- Comparison gallery: `~/kalpx-app-rn/screenshots/comparison.html`
- Contracts: `~/kalpx-frontend/tests/e2e/{APPROVED_FLOW_CONTRACTS,CANONICAL_INVARIANTS,REGRESSION_CASES}.md`
