# Parked Items — Mitra v3 (post Phase 5)

> Living list. Add items as they surface, remove when shipped. Reviewed at the
> top of every new session.
>
> Last updated: **2026-04-18** (end of Phase 5).

## 🔴 P0 — bug open from this session

### 1. Core mantra auto-play not firing
**What:** Added `useEffect` in `src/containers/PracticeRunnerContainer.tsx` (after the `isTriggerOmChantScreen` block at line ~1083) that's supposed to auto-load + loop the core mantra audio when `isMantraRunner && !isTriggerOmChantScreen && mantraAudioUrl`. User confirmed audio not playing on the runner screen after commit `5967942`.

**State:** Diagnostic logs pushed at `be1f160` — gate conditions are logged on every effect run:
```
[CORE_MANTRA_AUDIO] effect check — isMantraRunner: X isTriggerOm: Y mantraAudioUrl: Z currentVariant: V currentStateId: S
```

**Next session:**
1. Reload sim with current code
2. Navigate MANTRA triad card → info → Begin Chanting → mantra_runner
3. Capture the log line
4. One of three gate conditions will be false → that's the actual bug:
   - `isMantraRunner=false` → the runner screen variant doesn't match "mantra_runner" (schema config issue)
   - `isTriggerOm=true` → something routed core-triad-tap into the trigger flow
   - `mantraAudioUrl=""` → neither `runner_active_item.audio_url` nor `master_mantra.audio_url` populated (view_info chain break)

**DB side confirmed healthy:** `mantra.peace_calm.om_namah_shivaya` has a valid audio_url pointing at `mantra.health_panchakshara.mp4` (Panchakshara = Om Namah Shivaya = 5-syllable mantra; file is correct).

---

## 🟡 P1 — straightforward wins parked for next content / smoke pass

### 2. Persona seed script produces invalid Master-table IDs
**What:** `/tmp/seed_personas_v3.py` set `cycle_mantra_id='om_namah_shivaya'` etc. — IDs that don't exist in `MasterMantra`/`MasterSankalp`/`MasterPractice`. Result: `/journey/companion/` returned empty companion → triad disappeared on dashboard.

**State:** 3 of 4 personas fixed manually via Django shell (day3, day14, welcomeback). test+day7 query went silent — possibly a stale journey row. Seed script itself unchanged.

**Next session:** audit the seed script's mantra/sankalp/practice ID mapping; either (a) pick from `MasterMantra.objects.filter(locale='en').values_list('item_id')` dynamically, or (b) maintain a vetted whitelist of valid IDs per category.

### 3. Day-type classifier over-tags "heavy"
**What:** test+day3 (Day 3, 2/2 done, no triggers) was classified as `heavy_day` by backend `classify_day_type()`. Classifier likely conservative when signals are sparse. Founder noticed this when greeting fallback + DayTypeChip both showed "heavy" — we removed DayTypeChip for now but the underlying classifier still mis-tags.

**Next session:** review `core/day_type_classifier.py` default behavior when user has < 3 days history. Consider returning `neutral` / `new_day` instead of falling through to `heavy`.

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

### 8. track-event → MitraDecisionLog bridge
**State:** RFC drafted at `kalpx/docs/mitra-v3/RFC_TRACK_EVENT_TO_DECISION_LOG.md` with 4 open decision points:
- Founder: event-name → moment_id mapping for top-20 events
- Eng: DB-load projection for MitraDecisionLog insert rate
- Eng: PII scrubber in `log_client_event`
- Analytics: dashboard-query inventory that depends on `JourneyActivity.event_name`

**Blocked until all 4 answered.** 114 call sites on `mitraTrackEvent` across FE + web.

### 9. Completion copy — hybrid + rooted variants for M_completion_return
**What:** Policy tier is `never` (factual completion acknowledgement — no source anchors). But founder may want mode-specific tones anyway. Currently universal-only.

### 10. WhyThisL1 FE placeholder when no data
**What:** Strip currently self-hides when `why_this.level1` is empty in both array and object form. Founder contract says the strip should be "always visible." Discussion parked: render 3 generic placeholders, or accept self-hide behavior?

---

## 🟣 P3 — audit-surfaced migrations (not yet done)

### 11. `/journey/status/` → `/journey/home/` migration
**5 callers, per-caller work** (NOT a wrapper swap — shapes incompatible per 2026-04-18 audit addendum):
- Home.tsx:164 (journey status check for landing flow)
- Home.tsx:368 (duplicate status check elsewhere in Home — could consolidate)
- InsightSummaryContainer.tsx:132 (redirect-out-if-active guard)
- GuidedGrowthContainer.tsx:113 (similar guard)
- LockRitualContainer.tsx:95 (similar guard)

Each reads `hasActiveJourney` / `journeyId`. `/journey/home/` doesn't carry those directly — would need to either:
(a) extend `/journey/home/` response to include the existence-check fields, OR
(b) keep `/journey/status/` as the lightweight existence endpoint and move only the welcomeBack-branch logic to `/home/`.

Estimated effort: 4-8 hours including testing all 5 surfaces.

### 12. Generate-companion dual-mode flag documentation
**What:** `actionExecutor.ts:1551` handler routes on `payload.use_journey_companion` — the canonical pattern for dashboard hydration. Not documented anywhere except in the one comment.

### 13. Pavani's P0 merge blockers (from prior session)
Still open per `mitra_session_2026_04_17.md`:
- 4 TSC errors at CompanionDashboardContainer.tsx:622, CycleTransitionsContainer.tsx:1430/1467, Home.tsx:206
- Stray `=` rendering under "I Feel Triggered" at CompanionDashboardContainer.tsx:532
- Missing `dashboard_query` action handler — VoiceTextInput.onSend dispatches it; every typed query silently disappears
- Typo "Yes,let's begin" (missing space)

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
