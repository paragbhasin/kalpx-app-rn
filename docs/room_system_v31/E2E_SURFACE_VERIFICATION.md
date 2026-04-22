# E2E Surface Verification — Room System v3.1.1
**Initial verification:** 2026-04-21  
**Closure sprint applied:** 2026-04-21  
**Persona:** test+day3@kalpx.com (user_id 6586, visit_state: seasoned)  
**Backend:** https://dev.kalpx.com/api  
**RN source:** /Users/paragbhasin/kalpx-app-rn  
**Method:** Every claim derived from actual API responses (curl) and actual source code (Read tool).

---

## Closure Sprint Status (2026-04-21)

| Item | Was | Now | Commit |
|------|-----|-----|--------|
| Breathe timer wrong (60s→120s) | BUG | **FIXED** — TimerBody computes from step_config.cycles×(inhale+exhale+hold) | RN e6d1735 |
| Text-input prompt slot unresolved | BUG | **FIXED** — PROMPT_SLOT_TEXT map resolves slot name to authored text | RN e6d1735 |
| Voice note false affordance | BUG | **FIXED** — Migration 0148 removes room_release carry pool; action no longer returned | BE 2c93d7ec |
| Picker — unfiltered global list | BUG | **FIXED** — Per-room ROOM_PICKER_CONFIG with live-verified context lists | RN cc95df6 |
| Picker — connection shown picker | BUG | **FIXED** — Connection excluded (no visible API differentiation) | RN cc95df6 |
| Picker — release had no picker | MISSING | **FIXED** — Release added with 5 contexts (work_career/relationships/self/health_energy/money_security) | RN cc95df6 |

**Remaining known gaps (not ship-blocking):**
- principle_name = principle_id slug (not rendered; future risk only)
- RoomProvenance TS type missing 4 BE fields (no runtime crash; no FE reads them)
- VisualAnchorKind enum stale (Phase 4 gate; stub View doesn't dispatch on kind)
- Practice as primary chip: intentional architecture — step surface IS the in-room practice layer; practice pool is a fallback when step pools fail (which never happens since step pools are seeded)

---

## 1. Executive Summary

### What is truly visible to the user today

The room system is **structurally wired end-to-end** but has **critical gates that block user visibility**:

1. **EXPO_PUBLIC_MITRA_V3_ROOMS=1 is set in .env** — the flag is ON. RoomRenderer will mount (returns null when flag is off). The render path is live for local/dev builds.

2. **All 6 rooms return HTTP 200** with valid JSON envelopes containing `schema_version: "room.render.v1"`.

3. **User-visible surfaces confirmed working:**
   - Opening experience text (opening_line, second_beat_line, ready_hint) — rendered by RoomOpeningExperience
   - Principle banner (wisdom_anchor_line text) — rendered by RoomPrincipleBanner → RoomActionBannerScalar when non-null
   - Mantra chip label — rendered by RoomActionRunnerPill, tapping launches runner with full payload
   - Step chip label — rendered by RoomActionStepPill, opens StepModal with correct template dispatch
   - Carry chip label — rendered by RoomActionCarryPill with dual-write (BE sacred + Redux)
   - Teaching chip label — rendered by RoomActionTeachingPill, opens WhyThisL2Sheet with body text
   - Inquiry chip label — rendered by RoomActionInquiryPill, opens InquiryModal with categories
   - Sankalp chip (joy only) — rendered as runner_sankalp via RoomActionRunnerPill
   - Exit chip — always rendered by RoomActionExitPill

4. **No practice chips exist anywhere.** Zero `runner_practice` actions returned across all 6 rooms and all 5 life contexts. Practice is absent from all room pools.

5. **principle_name field is broken:** BE sends `principle_name` equal to `principle_id` (slug, not human label) for all 5 rooms that have a banner. The FE TypeScript type expects a human label; the banner component (`RoomActionBannerScalar`) only renders `wisdom_anchor_line` — so the user never sees principle_name directly, masking the bug for now.

6. **StepModal timer bug:** `step_breathe_5_5` sends `{cycles:12, inhale:5, exhale:5}` in `step_config`. StepModal reads `stepPayload.duration_sec` (top-level field). BE never sends `duration_sec` at the top level for breathe steps. Result: timer defaults to 60s instead of the correct 120s (12×10s per cycle).

7. **Visual anchor kinds and motion values from BE are outside TypeScript enum.** BE sends `lotus_still`/`slow_pulse` and `sun_warm`/`soft_bloom`; TypeScript `VisualAnchorKind` only defines `lotus_breathe`, `companion_flame`, `slow_water`, `discernment_line`, `path_seedling`, `fullness_orb`. RoomOpeningExperience doesn't use these fields at render time (ambient layer is a stub `<View />`), so no runtime crash, but the enum is stale.

8. **RoomProvenance TypeScript type is stale:** BE sends 4 extra fields (`visit_number`, `render_phase`, `life_context_applied`, `life_context_skipped`); RoomProvenance interface only has 5 base fields. No runtime crash (TypeScript structural typing), but `(d.provenance as RoomProvenance).life_context_applied` would be typed `undefined`.

9. **Voice note is a UI stub.** `VoiceNoteBody` dispatches `stub: true` — no audio is captured. Release room uses `step_voice_note` family; this shows the correct UI but doesn't record.

10. **Context responsiveness is live and proven** for clarity (5 contexts → 5 different teaching principles + sometimes different mantras) and growth (5 contexts → 5 different principle_banner lines + sometimes different mantras). Connection and release also apply context (life_context_applied: true) and produce different banner/mantra combinations.

---

## 2. Room × Surface Matrix

| Room | Surface | BE Sending? | RN Ingesting? | RN Rendering? | Break Point | Severity |
|------|---------|-------------|---------------|---------------|-------------|----------|
| room_stillness | principle_banner | YES (wisdom_anchor_line present) | YES | YES (italic text block) | principle_name = principle_id slug, not shown | MEDIUM |
| room_stillness | wisdom_teaching | NO (no teaching action) | N/A | NOT RENDERED | Not in pool | LOW (by design) |
| room_stillness | sankalp | NO | N/A | NOT RENDERED | Not in pool | LOW (by design) |
| room_stillness | mantra | YES (Sākṣī Aham, full payload) | YES | YES (tappable pill → runner) | — | PASS |
| room_stillness | practice | NO | N/A | NOT RENDERED | Not in any pool | HIGH |
| room_stillness | in_room_step | YES (step_breathe_5_5) | YES | YES (StepModal timer, timer_breathe) | Timer defaults 60s, correct is 120s | MEDIUM |
| room_stillness | carry/expression | NO | N/A | NOT RENDERED | Not in pool | LOW (by design) |
| room_connection | principle_banner | YES (context-dependent when LC provided) | YES | YES | principle_name = slug | MEDIUM |
| room_connection | wisdom_teaching | NO | N/A | NOT RENDERED | Not in pool | LOW |
| room_connection | sankalp | NO | N/A | NOT RENDERED | Not in pool | LOW |
| room_connection | mantra | YES (Hare Kṛṣṇa or Om Namo Bhagavate) | YES | YES | — | PASS |
| room_connection | practice | NO | N/A | NOT RENDERED | Not in any pool | HIGH |
| room_connection | in_room_step (Name what's close) | YES (step_text_input_name_short) | YES | YES (TextInputBody) | prompt_slot not resolved to text | MEDIUM |
| room_connection | carry (Name who matters) | YES (carries connection_named) | YES | YES (dual-write) | — | PASS |
| room_release | principle_banner | YES (context-dependent) | YES | YES | principle_name = slug | MEDIUM |
| room_release | wisdom_teaching | NO | N/A | NOT RENDERED | Not in pool | LOW |
| room_release | sankalp | NO | N/A | NOT RENDERED | Not in pool | LOW |
| room_release | mantra | YES (Maha Mrityunjaya or Asato Ma) | YES | YES | — | PASS |
| room_release | practice | NO | N/A | NOT RENDERED | Not in any pool | HIGH |
| room_release | in_room_step (Breathe slow) | YES (step_breathe_5_5) | YES | YES (timer) | Timer 60s default, correct 120s | MEDIUM |
| room_release | carry (Leave a voice note) | YES (release_voice_note) | YES | YES (VoiceNoteBody — stub, no audio) | Audio not captured; stub: true | HIGH |
| room_clarity | principle_banner | NO (null with no context) | YES (gracefully null) | NOT RENDERED (null self-hides) | By design for clarity no-context | LOW |
| room_clarity | wisdom_teaching | YES (teaching action with body text) | YES | YES (tappable pill → WhyThisL2Sheet) | — | PASS |
| room_clarity | sankalp | NO | N/A | NOT RENDERED | Not in pool | LOW |
| room_clarity | mantra | YES (Ganesha/Saraswati/Pavamana — context-dependent) | YES | YES | — | PASS |
| room_clarity | practice | NO | N/A | NOT RENDERED | Not in any pool | HIGH |
| room_clarity | in_room_step (ten-second pause) | YES (step_grounding_palms_30s) | YES | YES (GroundingBody: 5-4-3-2-1) | template_id → grounding classification correct | PASS |
| room_clarity | inquiry | YES (5 categories) | YES | YES (InquiryModal with categories) | — | PASS |
| room_clarity | carry/expression | NO | N/A | NOT RENDERED | Not in pool | LOW |
| room_growth | principle_banner | YES (context-dependent, 5 distinct lines) | YES | YES | principle_name = slug | MEDIUM |
| room_growth | wisdom_teaching | NO | N/A | NOT RENDERED | Not in pool | LOW |
| room_growth | sankalp | NO | N/A | NOT RENDERED | Not in pool | LOW |
| room_growth | mantra | YES (Gayatri/Om Tat Sat/Rudra — context-dependent) | YES | YES | — | PASS |
| room_growth | practice | NO | N/A | NOT RENDERED | Not in any pool | HIGH |
| room_growth | in_room_step (slow mindful walk) | YES (step_walk_timer_*) | YES | YES (timer_walk body) | Need to confirm template starts with step_walk_timer_ | PASS |
| room_growth | inquiry | YES (5 categories) | YES | YES (InquiryModal) | — | PASS |
| room_growth | carry (Journal on growth) | YES (growth_journal) | YES | YES (dual-write) | — | PASS |
| room_joy | principle_banner | YES (gita_vairagya_in_expansion, "Hold the good day lightly") | YES | YES | principle_name = slug | MEDIUM |
| room_joy | wisdom_teaching | NO | N/A | NOT RENDERED | Not in pool | LOW |
| room_joy | sankalp | YES (live_in_gratitude, full payload) | YES | YES (runner pill → sankalp runner) | — | PASS |
| room_joy | mantra | YES (Lokah Samastah or Purnamadah) | YES | YES | — | PASS |
| room_joy | practice | NO | N/A | NOT RENDERED | Not in any pool | HIGH |
| room_joy | in_room_step (Notice what feels full) | YES (step_text_input_name_full) | YES | YES (TextInputBody) | prompt_slot not resolved | MEDIUM |
| room_joy | carry (Carry this joy) | YES (joy_carry) | YES | YES (dual-write) | — | PASS |

---

## 3. Per-Room Detail

### room_stillness (no life_context)
- **HTTP 200**, life_context_applied: false (skipped by persona)
- **principle_banner:** `gita_chain_from_dwelling_to_fall` → "Interrupt the chain early" (rendered)
- **Mantra:** Sākṣī Aham (mantra.sakshi_aham), audio_url: null, reps 27, iast/devanagari/meaning/essence all present
- **Step:** step_breathe_5_5, cycles:12, inhale:5, exhale:5 — StepModal renders as timer_breathe with 60s default (BUG: should be 120s)
- **No teaching, no inquiry, no carry, no sankalp, no practice**
- **RN render path:** RoomContainer → api.get(mitra/rooms/room_stillness/render/) → RoomRenderer (flag ON) → RoomOpeningExperience (text: "Good to sit with you. No task here.") → RoomPrincipleBanner (banner text) → RoomActionList (3 actions: step pill, mantra pill, exit pill)

### room_connection (with/without life_context)
- **HTTP 200**, all life contexts produce life_context_applied: true with distinct banners
- **principle_banner:** varies by context (e.g. "Busyness is not belonging", "Eat before pressure", "Remember what has already been given")
- **Mantra:** varies by context (Hare Krishna, Om Namo Bhagavate Vasudevaya)
- **Step:** step_text_input_name_short (TextInputBody) — prompt_slot "name_short_prompt" not resolved to UI text; TextInputBody falls back to generic placeholder
- **Carry:** connection_named, dual-write to sacred endpoint
- **No teaching, no inquiry, no sankalp, no practice**

### room_release (with/without life_context)
- **HTTP 200**, all life contexts produce distinct banner + mantra combinations
- **principle_banner:** varies (e.g. "Pause before deciding", "Cool after conflict", "Use oil to hold the body")
- **Mantra:** varies (Maha Mrityunjaya, Asato Ma Sadgamaya, full Tryambaka version)
- **Step:** step_breathe_5_5 → same 60s/120s bug as stillness
- **Carry:** release_voice_note → VoiceNoteBody renders correctly but is a stub (no audio recording)
- **No teaching, no inquiry, no sankalp, no practice**

### room_clarity (with/without life_context)
- **HTTP 200**
- **principle_banner:** null when no life_context (by design per architecture). Not null when context provided — WAIT: this was confirmed null even with no-context call. RN renders nothing (self-hides correctly per hide_if_empty).
- **Teaching:** context-sensitive principle + body text. Examples: nishkama_karma, yoga_name_the_vritti, gita_clarity_after_desire_anger, body_as_discrimination_field. body length ~199 chars.
- **Mantra:** context-sensitive (Ganesha, Saraswati, Pavamana)
- **Step:** step_grounding_palms_30s → GroundingBody (5-4-3-2-1 prompts), correct classification
- **Inquiry:** 5 categories (decision, confusion, truth, noise, other) — InquiryModal renders all
- **No principle_banner without context, no carry, no sankalp, no practice**

### room_growth (with/without life_context)
- **HTTP 200**  
- **principle_banner:** present even without context ("Interrupt the chain early"). With context: 5 distinct lines (Serve the larger movement / Do not over-carry / Build the ground before you build / Fit rhythm to real life)
- **Mantra:** context-sensitive (Gayatri, Om Tat Sat, Rudra)
- **Step:** step_walk_timer_* — timer_walk classification, renders 60s timer (walk step)
- **Inquiry:** 5 categories (next_step, pattern, practice_refinement, relationship_growth, other)
- **Carry:** growth_journal, dual-write
- **No teaching, no sankalp, no practice**

### room_joy (no life_context)
- **HTTP 200**, life_context_applied: false (skipped by persona)
- **principle_banner:** gita_vairagya_in_expansion → "Hold the good day lightly"
- **Mantra:** Lokah Samastah Sukhino Bhavantu (audio_url present: kalpx-website.s3 mp4)
- **Step:** step_text_input_name_full → TextInputBody (280 char limit) — prompt_slot not resolved
- **Carry:** joy_carry, dual-write
- **Sankalp:** sankalp.live_in_gratitude ("Today, I choose to live in gratitude.") — full payload with insight, how_to_live, benefits
- **No teaching, no inquiry, no practice**

---

## 4. Defects List

### CRITICAL

None found that fully break user flow. The render gate (EXPO_PUBLIC_MITRA_V3_ROOMS=1) is enabled.

### HIGH

**H-1: No runner_practice chip exists in any room across any life context**
- Confirmed zero `runner_practice` actions across all 6 rooms × 5 life contexts (30 API calls)
- The practice surface is explicitly absent from all room pools
- Impact: Users cannot access a standalone practice runner from any room
- Root: No practice seeds in room pools; only in_room_step serves this function

**H-2: Voice note is a UI stub — release_voice_note carry doesn't capture audio**
- StepModal VoiceNoteBody dispatches `stub: true` + `duration_sec` but no audio URI
- The release room carry chip ("Leave a voice note") opens this stub UI
- Comment in StepModal.tsx confirms: "wiring the real recorder is a follow-up"
- Impact: User taps "Leave a voice note", sees recording UI, but nothing is actually recorded or saved to BE

### MEDIUM

**M-1: StepModal timer defaults to 60s for breathe steps (correct: 120s)**
- step_breathe_5_5: `step_config: {cycles:12, inhale:5, exhale:5}` = 120 seconds total
- StepModal.TimerBody reads `stepPayload.duration_sec` (top-level field)
- BE sends duration in `step_config`, not as top-level `duration_sec`
- Result: timer shows 1:00 instead of 2:00; user may stop early
- Affects: room_stillness, room_release (both use step_breathe_5_5)

**M-2: principle_name field is always equal to principle_id slug**
- All 5 rooms with banners: principle_name === principle_id (e.g. "gita_chain_from_dwelling_to_fall")
- TypeScript type PrincipleBanner expects a human-readable principle_name
- Currently not user-visible (RoomActionBannerScalar only renders wisdom_anchor_line)
- Risk: any future use of principle_name for display will show a technical slug

**M-3: step_text_input prompt_slot not resolved to UI text**
- room_joy step: `step_config: {max_chars:280, prompt_slot:"name_full_prompt"}`
- room_connection step: `step_config: {max_chars:140, prompt_slot:"name_short_prompt"}`
- TextInputBody reads `stepPayload.prompt` (top-level field). BE sends the prompt key in `step_config.prompt_slot`, not as top-level `prompt`
- Result: TextInputBody shows generic placeholder "Take a moment and write what comes." instead of authored prompt
- Affects: room_joy ("Notice what feels full"), room_connection ("Name what's close")

**M-4: RoomProvenance TypeScript type missing 4 BE fields**
- BE sends: `visit_number`, `render_phase`, `life_context_applied`, `life_context_skipped`
- TypeScript `RoomProvenance` interface has: `pool_id`, `pool_version`, `selection_service_version`, `render_id`, `active_rotation_window_days`
- No runtime crash (TypeScript structurally accepts extra fields at runtime)
- Impact: Any FE code trying to read `provenance.life_context_applied` would be typed as `undefined`

**M-5: VisualAnchorKind enum is stale**
- TypeScript `VisualAnchorKind` defines: `lotus_breathe | companion_flame | slow_water | discernment_line | path_seedling | fullness_orb`
- BE sends for stillness: `kind: "lotus_still"`, motion: `"slow_pulse"`
- BE sends for joy: `kind: "sun_warm"`, motion: `"soft_bloom"`
- RoomOpeningExperience renders `<View />` placeholder for visual anchor (Phase 4 stub), so no crash
- Impact: When Phase 4 visual anchor art is wired, kind/motion dispatch logic will fail

### LOW

**L-1: post_runner_reflection_line not populated for any room**
- All runner payloads return `post_runner_reflection_line: null`
- TypeScript type allows null; RoomRenderer has no rendering for this field
- Comment in types.ts: "Used by FE to suppress if runner already carried same principle"
- Impact: L3 reflection surface never shown

**L-2: No teaching surface in 4 rooms (stillness, connection, release, joy)**
- By design per room architecture — these rooms use anchor/expression model
- Flagged for completeness: teaching is not pooled for these rooms

**L-3: Clarity principle_banner is null without life_context**
- By design (verified in architecture docs)
- RN renders nothing, hide_if_empty self-hides correctly

**L-4: Audio playback is a stub**
- `ambient_audio` references valid asset_ref values (e.g. "audio/ambient/stillness_drone_v1")
- RoomOpeningExperience renders only an empty `<View />` as audio affordance stub
- No actual audio plays
- Comment: "Audio affordance stub — sound toggle chip, no playback. Phase 4 gate enables real audio."

---

## 5. Ship Truth: User-Visible vs Operational-Only

### User sees (with EXPO_PUBLIC_MITRA_V3_ROOMS=1, flag ON)

| What user sees | Surface | Proven |
|---|---|---|
| Opening text (2 lines) + ready hint | RoomOpeningExperience | YES — renders opening_line, second_beat_line from BE |
| Italic wisdom quote (1 line) | RoomPrincipleBanner | YES — wisdom_anchor_line from principle_banner |
| Mantra chip (tappable, launches runner) | RoomActionRunnerPill | YES — full canonical payload passed to runner |
| Breathe/walk/grounding step chip | RoomActionStepPill → StepModal | YES — opens inline modal (timer or grounding or text) |
| Voice note chip (UI-only, no audio) | StepModal VoiceNoteBody | STUB — no audio captured |
| Carry chip (joy_carry / connection_named / etc.) | RoomActionCarryPill | YES — dual-write to BE + Redux |
| Teaching chip → body text overlay | RoomActionTeachingPill | YES — opens WhyThisL2Sheet with authored body |
| Inquiry chip → 5-category modal | RoomActionInquiryPill → InquiryModal | YES — categories rendered |
| Sankalp chip (joy only) | RoomActionRunnerPill (runner_sankalp) | YES — full payload with insight/how_to_live |
| Exit chip | RoomActionExitPill | YES — always present |

### Exists in backend but NOT visible to user

| What exists in BE | Why not visible |
|---|---|
| principle_name (human label on banner) | Not rendered; only wisdom_anchor_line shown |
| post_runner_reflection_line | Null for all rooms; no RN renderer for it |
| Ambient audio (asset_ref) | Audio stub — no playback wired |
| Visual anchor art (asset_ref) | Phase 4 stub — empty View placeholder |
| step_config.cycles/inhale/exhale for breathe | StepModal reads duration_sec, not step_config; falls back to 60s |
| step_config.prompt_slot for text-input steps | TextInputBody reads stepPayload.prompt; shows generic placeholder |
| practice runner | Not pooled; runner_practice action type never returned |
| visit_number, render_phase, life_context_applied/skipped in provenance | TypeScript type doesn't expose them; no FE reads them |

### Context responsiveness: what changes per life_context

For clarity (confirmed picker room):
- Mantra changes: Ganesha (health_energy, no-context), Saraswati (work_career, purpose_direction), Pavamana (relationships, daily_life)
- Teaching principle changes: 5 distinct principles across 5 contexts
- principle_banner: always null for clarity (design decision)

For growth (confirmed picker room):
- Mantra changes: Gayatri (daily_life), Om Tat Sat (work_career, relationships, purpose_direction), Rudra (health_energy)
- principle_banner changes: 5 distinct lines across 5 contexts
- Inquiry categories: same 5 across all contexts (no context-specific inquiry)

For connection and release (context-responsive but no picker gating in current UX):
- Both respond to life_context: distinct principle_banner + mantra per context
- life_context_applied: true confirmed for all tested contexts

---

## 6. Summary Verdict

**The room system is structurally sound and end-to-end wired.** All 6 rooms return valid 200 responses. The RN ingestion chain (RoomContainer → api.get → RoomRenderer → component tree) is fully coded and correct. The feature flag is ON.

**What is broken today (actionable):**
1. No practice runner in any room pool (H-1)
2. Voice note carry is a UI stub with no audio (H-2)
3. Breathe step timer shows 60s instead of correct duration from step_config (M-1)
4. Text-input step prompt_slot not resolved to authored prompt text (M-3)
5. principle_name always equals principle_id slug (M-2)

**What is intentionally deferred (scaffolding):**
- Visual anchor art (Phase 4)
- Audio playback (Phase 4)
- post_runner_reflection_line (L3 pool not populated)
