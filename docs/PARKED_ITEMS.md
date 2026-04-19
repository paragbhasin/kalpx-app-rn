# Parked Items — Mitra v3 (post Phase 5)

> Living list. Add items as they surface, remove when shipped. Reviewed at the
> top of every new session.
>
> Last updated: **2026-04-18** (end of Phase 5, post-audio-fix).

## ✅ Resolved this session

### Core mantra auto-play — FIXED at `7f5b7ec`
The bug lived in two places, not one:
1. Real render path for the mala counter is `cycle_transitions/offering_reveal` (inline in `CycleTransitionsContainer.tsx:806+`) — NOT `practice_runner/mantra_runner` as originally assumed. The earlier `PracticeRunnerContainer` useEffect never mounted for this flow.
2. `AudioPlayerBlock` on the info-screen render (container line 937) was over-gated on `info.source === "core" || "additional"` — `view_info` doesn't reliably set a source tag, so the player was hidden even with a valid `audio_url`.
3. Gate loosened (3-way fallback: `info.audio_url` → `screenData.mantra_audio_url` → `master_mantra.audio_url`) → player visible.
4. Double-playback (2-3 concurrent loops) caused by `AudioPlayerBlock`'s unmount cleanup firing `unloadAsync()` without awaiting → fixed at `6edfd97` by serializing stop+unload before creating the next sound.

Diagnostic logs removed at `7f5b7ec`.

---

## 🟡 P1 — straightforward wins parked for next content / smoke pass

### 2. Persona seed script produces invalid Master-table IDs
**What:** `/tmp/seed_personas_v3.py` set `cycle_mantra_id='om_namah_shivaya'` etc. — IDs that don't exist in `MasterMantra`/`MasterSankalp`/`MasterPractice`. Result: `/journey/companion/` returned empty companion → triad disappeared on dashboard.

**State:** 3 of 4 personas fixed manually via Django shell (day3, day14, welcomeback). test+day7 query went silent — possibly a stale journey row. Seed script itself unchanged.

**Next session:** audit the seed script's mantra/sankalp/practice ID mapping; either (a) pick from `MasterMantra.objects.filter(locale='en').values_list('item_id')` dynamically, or (b) maintain a vetted whitelist of valid IDs per category.

### 3. Day-type classifier over-tags "heavy"
**What:** test+day3 (Day 3, 2/2 done, no triggers) was classified as `heavy_day` by backend `classify_day_type()`. Classifier likely conservative when signals are sparse. Founder noticed this when greeting fallback + DayTypeChip both showed "heavy" — we removed DayTypeChip for now but the underlying classifier still mis-tags.

**Next session:** review `core/day_type_classifier.py` default behavior when user has < 3 days history. Consider returning `neutral` / `new_day` instead of falling through to `heavy`.

### 3b. Missing mantra audio files (backend content gap)
**What:** Per `~/.claude/projects/-Users-paragbhasin-kalpx/memory/mantra_audio_missing.md`: 770 mantras across all locales without audio; 90 unique en-locale missing; 24 found on archive.org (pending download); **30 still need recording/TTS**.

**State:** List of 30 specific item_ids in the memory file (bija, medium, long recitations). Deploy flow to S3 documented in `mantra_audio_deploy.md` — bucket `kalpx-website`, region `us-east-2`, path `mantras/audio/{item_id}.mp4`. Mgmt command `upload_mantra_audio` handles upload + audio_url backfill.

**Impact on current state:** 106/204 en mantras have audio; the remaining ~98 fall through to empty `audio_url` → mantra runner's AudioPlayerBlock doesn't render / no sound. Users picking a mantra from the no-audio half see silent runner.

**Next session:** (a) download the 24 archive.org finds + upload batch, (b) decide recording strategy for remaining 30 (TTS vs commissioned voice).

### 4. 108 hardcoded in completion copy → softened, but ecosystem still uses
**What:** `M_completion_return` mantra message was "108 in. Kept." — literal even when user picked 9/27/54. Fixed to "Complete. You stayed with the sound." in `8d5a246f`. But elsewhere in codebase there are copy strings that assume 108 (search `grep -rn "108" src/`). Not tested.

### 5. Triad cold-boot flash
**What:** Brief window during mount where `card_mantra_title` / `card_sankalpa_title` / `card_ritual_title` are all empty. TriadCardsRow's filter hides the whole row → user sees empty space for ~1-2s until `/journey/companion/` responds.

**Decision call:** either accept (it IS transient) OR render 3 skeleton cards with just the labels + ○ dots during hydration. Founder call.

---

## 🟢 P2 — real Phase 6 content/signal work

### 6. M30 RecommendedAdditionalCard
**Missing:**
- ContentPack YAML (doesn't exist)
- FE scaffold (doesn't exist)
- Backend detector (when is user "steady" enough + what to suggest)

### 7. M11 PatternDayBanner
**Missing:**
- ContentPack YAML (doesn't exist)
- FE banner scaffold (doesn't exist)
- Backend reliable morning-pattern signal (needs ≥3 occurrences detector)

### 8. track-event + track-completion → MitraDecisionLog bridge (Phase 6)

**State:** Plan + inventory + flow map + per-site CSV all drafted.
Ready for founder review. DO NOT execute until approved.

Docs for review:
- RFC: `kalpx/docs/mitra-v3/RFC_TRACK_EVENT_TO_DECISION_LOG.md`
- Flow map (19 flows): `docs/USER_FLOW_TELEMETRY_MAP.md`
- Per-site CSV (100 rows, sorted): `docs/TELEMETRY_CALLSITES_CURRENT_FLOW.csv`

**Key re-framings since initial RFC:**
- Split treatment: `track-event` moves to MitraDecisionLog primary +
  JourneyActivity mirror (deprecate mirror after 4 weeks);
  `track-completion` stays JourneyActivity primary forever (streaks
  + CompanionState depend on it) with MitraDecisionLog as mirror
- `track-completion` moment_id auto-derives from item_type (mantra→M17,
  sankalp→M18, practice→M19) — NO FE changes needed

**Agent audit findings (commit `616c162`):**
- 100 total call sites — **only 44 reachable in Phase 5 flow**
- 55 dead (legacy / orphaned / scaffold duplicates)
- 1 partial (`breath_reset_completed` — needs runtime trace)
- Significant event-name drift: `trigger_session_started` from 3 sites
  with 3 meta shapes; `core_mantra_completed` family from 4 sites
- All 12 intelligence-card tap events unreachable (compact
  scaffolds render, tap-capable block versions orphaned)
- 7 fully orphaned action handlers

**Before founder sign-off, decisions needed:**
1. Event-name → moment_id mapping for top-20 (mapping candidates
   listed in RFC bottom + flow map §Top 20)
2. Dual-write window — 4 or 8 weeks
3. Who owns `core/telemetry/event_moment_mapping.yaml`
4. Analytics dashboard-query inventory that depends on
   `JourneyActivity.event_name`

**Cleanup pass opportunity (pre-bridge):** removing the 55 dead call
sites + 7 orphaned handlers is a safe deletion that cuts the bridge
scope ~45%. Could be executed independently.

**Blocked until:** founder reviews + approves top-20 mapping. ~1 week
of Eng work once gates pass.

### 9. Completion copy — hybrid + rooted variants for M_completion_return
**What:** Policy tier is `never` (factual completion acknowledgement — no source anchors). But founder may want mode-specific tones anyway. Currently universal-only.

### 10. WhyThisL1 FE placeholder when no data
**What:** Strip currently self-hides when `why_this.level1` is empty in both array and object form. Founder contract says the strip should be "always visible." Discussion parked: render 3 generic placeholders, or accept self-hide behavior?

---

## 🟣 P3 — audit-surfaced migrations (not yet done)

### 11. `/journey/status/` response cleanup (re-scoped — ~60 min, not migration)

**Revised plan** after 2026-04-18 re-audit: `/journey/status/` is
**NOT legacy** — it's the lightweight existence endpoint, fundamentally
correct shape. Home.tsx:164 and :368 are NOT duplicates — they serve
different purposes (auto focus-effect vs explicit resume flow).

**Proposed scope (awaiting approval):**
1. Cull `welcomeBack` + `welcomeBackLine` + `daysPastEnd` from `/status/`
   response (superseded by M12 long-absence variant at `8807fdf0`) — 20 min
2. Add doc comment on view explaining lightweight-existence role — 5 min
3. Update `AUDIT_LEGACY_VS_V3_APIS.md` classification — 5 min
4. Smoke-test test+day3 — 30 min
5. SKIP Home.tsx consolidation (not worth complexity)

**Blocked until:** founder approves dropping the welcomeBack flag from
the response.

### 12. Generate-companion dual-mode flag documentation
**What:** `actionExecutor.ts:1551` handler routes on `payload.use_journey_companion` — the canonical pattern for dashboard hydration. Not documented anywhere except in the one comment.

### 13. Pavani's P0 merge blockers (from prior session)
Still open per `mitra_session_2026_04_17.md`:
- 4 TSC errors at CompanionDashboardContainer.tsx:622, CycleTransitionsContainer.tsx:1430/1467, Home.tsx:206
- Stray `=` rendering under "I Feel Triggered" at CompanionDashboardContainer.tsx:532
- Missing `dashboard_query` action handler — VoiceTextInput.onSend dispatches it; every typed query silently disappears
- Typo "Yes,let's begin" (missing space)

---

## 🔵 Post-cutover (Track 0.5 live on dev 2026-04-18 evening)

### 14. Joy/Growth Maestro smoke flows not authored yet
**What:** Track 1 Joy/Growth rooms are live (M48/M49 + dashboard chips) but `.maestro/` has automated flows only for grief (`grief-room-enter-exit.yaml`, `grief-room-reduced-motion.yaml`) and loneliness (`loneliness-room-companioned-chant.yaml`). No Joy chip tap / Growth chip tap / Joy Room walk-sit / Growth Room 5-inquiry / return_to_source flows exist.

**Impact:** Every Joy/Growth smoke pass is human-manual on a device. No regression CI for these flows.

**Next:** author 4-6 Maestro flows — joy-chip-tap, joy-room-sit-flow, growth-chip-tap, growth-room-inquiry-decision, return-to-source-from-support-runner. Each ~20-40 min to author against a running dev client.

### 15. EAS OTA update channel not configured
**What:** `eas.json` has no `updates` block; `EXPO_UPDATES_DISABLED=1` in production profile. No OTA push path exists — every merge to `main` requires team members to pull + restart Metro to pick up changes.

**Impact:** Track 1 dashboard changes landed in `main` but won't reach team devices automatically. Friction for any JS-only iteration. Every Pass Back / Pass D/E/F would have been OTA-worthy but couldn't be pushed.

**Next:** configure `expo-updates` runtime version + `eas update` channels (e.g. `dev-preview` for internal builds). Decide whether OTA stays opt-in (only dev/preview) or whether production gets it too. Founder call.

### 16. Track 0.5 flag cutover to staging/prod
**What:** `MITRA_V3_WISDOM_SELECTOR_ENABLED=1` live on **dev only** (EC2 `.env.dev`). Staging + prod still have it OFF.

**Next:** monitor dev for 1–2 weeks (winner quality, fallback rate, grief/loneliness tone safety, MitraDecisionLog trace volume). If clean, promote to staging. Watchlist: `ok=false`/`fallback_reason` rate >5%, any tradition_naming leak into grief, any celebration-register line on weight=maximum surfaces, dashboard visible_reply fatigue (we only have 6 rows).

### 17. Batch 3 support-completion drafts parked
**What:** 9 tone-reviewed draft lines for `completion_support`, `completion_support_grief`, `completion_support_loneliness` surfaces. Committed at `kalpx/core/data_seed/wisdom/parked/batch3_support_completion_drafts_2026_04_18.md`.

**Why parked, not shipped:** wiring those surfaces to the selector would extend `COMPLETION_FAMILY_LAW` with `support_*` runner_variants — re-opens the Track 1 "Invariant #8 stays absolute, no resolver exemption" lock. Support completions today are served via `M_completion_return.yaml` ContentPack (9 founder-approved source-aware variants, live).

**Possible future use:** ContentPack rotation-depth pass if telemetry shows `M_completion_return` variants feel stale. Not selector work. Must pass a fresh Agent 5 integrity review before any use.

### 18. Staging re-probe before promoting flag
**What:** The 12 canonical (surface × interaction × mode) probes were exercised on dev DB in-process and via live HTTP. Staging DB has not been probed. Before any staging cutover, re-run the 12 probes against staging.

**Next:** run `/api/mitra/wisdom/pick/` probe matrix on staging after the staging DB pulls Passes D/E/F migrations. Confirm 12/12 resolve, fallback rate = 0%.

---

## Reference (files touched this session)

- Memory: `~/.claude/projects/-Users-paragbhasin/memory/mitra_session_2026_04_18_phase_5.md`
- Audit: `docs/AUDIT_LEGACY_VS_V3_APIS.md`
- Dashboard spec: `docs/NEW_DASHBOARD_V1_SPEC.md`
- Smoke matrix: `docs/PHASE_5_SMOKE_MATRIX.md`
- M12 long-absence: `~/kalpx/docs/mitra-v3/M12_LONG_ABSENCE_DRAFT.md`
- Source policy: `~/kalpx/docs/mitra-v3/SOURCE_VISIBILITY_POLICY_V1.md`
- Phase 4 V2 plan: `~/kalpx/docs/mitra-v3/PHASE_4_CONTENT_AUTHORING_V2.md`
- Writer/Reviewer agent prompts: `~/kalpx/docs/mitra-v3/AGENT_PROMPTS_WRITER_REVIEWER.md`
- Phase 6 RFC: `~/kalpx/docs/mitra-v3/RFC_TRACK_EVENT_TO_DECISION_LOG.md`
