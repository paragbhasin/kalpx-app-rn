# Mitra Room Flows + Manual Test Reference V1

**Purpose:** authoritative navigation map for the 4 support / inquiry rooms (grief, loneliness, joy, growth) and a concrete manual-test checklist the operator can run against sim 221EDFB1-254E-4694-9B58-8BABEF2EBADD or a real device.

**Scope:** post-Phase-3 close (2026-04-19). Covers H-3 (MoreSupportSheet a11y), H-5 (Day-14 sovereignty), M-2 (continuity render), M-3 (Joy/Growth ContentPack labels), the triad-completion local-flag sync bug fix (`720206e`), **and the track-completion source-validation fix (`6a171ea3`) — BE now accepts `support_{grief,loneliness,joy,growth}` sources so every room completion actually persists to the DB (pre-fix: all 4 room completions silently 400'd and no `JourneyActivity` was created).**

**Cross-reference:** real request/response wire captures for the full 4-step room API flow are in `docs/ROOM_API_FULL_FLOW_V1.md`.

---

## 1. Room entry matrix

Two entry patterns on the dashboard:

**Direct chip (Joy + Growth):** one tap on a primary chip → room opens.
**Secondary bottom sheet (Grief + Loneliness):** tap "More support" → sheet slides → tap row → room opens.

| Room | Dashboard entry | testID | Action dispatched | Destination container / state |
|---|---|---|---|---|
| Joy | Primary chip "I'm in a good place" | `quick_support_joy_chip` | `enter_joy_room` | `joy_room / room` |
| Growth ("deep") | Primary chip "I want to go deeper" | `quick_support_growth_chip` | `enter_growth_room` | `growth_room / room` |
| Grief | "More support ›" link → bottom sheet → "Sitting with grief" | `quick_support_more_label` → `more_support_grief_row` | `enter_grief_room` | `support_grief / room` |
| Loneliness | "More support ›" link → bottom sheet → "Company for loneliness" | `quick_support_more_label` → `more_support_loneliness_row` | `enter_loneliness_room` | `support_loneliness / room` |

**Chip visibility rule:** Joy + Growth chips render ONLY when backend envelope ships `quick_support_labels.joy_label` / `growth_label` non-empty (M-3: now sourced from `M48_joy_room.chip_dashboard_label` / `M49_growth_room.chip_dashboard_label`). The "More support" row labels (`support_rooms_labels.grief_label` / `loneliness_label`) must also be backend-seeded or the rows hide.

---

## 2. Full room flow (same pattern for all 4 rooms)

```
Dashboard (NewDashboardContainer)
  ↓ tap entry chip OR "More support" → row
  ↓ dispatches enter_{room}_room action
  ↓
actionExecutor.ts clears runner_* state, stamps session timestamps
  ↓ loadScreen({container_id, state_id: "room"})
  ↓
Room container (src/extensions/moments/{room}/)
  ├ Opening line (testID: {room}_room_opening_line)
  ├ Pills that dispatch start_runner with source="support_{room}" OR
  │   room-specific source (joy uses "joy_room", growth uses "growth_room")
  └ Exit/close (returns to dashboard)
  ↓ tap pill
  ↓ dispatches start_runner {item_type, item_id, source, ...}
  ↓
CycleTransitionsContainer (canonical rich runner)
  ├ offering_reveal screen (info + essence + start CTA)
  ├ test_runner_force_complete hook (__DEV__-only, 24×24 opacity 0.01, top:60 right:4)
  └ natural completion (108 taps / 3s hold / timer expiry)
  ↓ on complete → dispatches complete_runner
  ↓
actionExecutor complete_runner handler (src/engine/actionExecutor.ts:3471)
  ├ POST /api/mitra/track-completion/
  │   Payload: {itemType, itemId, source, journeyId, dayNumber, tz, meta}
  │   Response (post-fix 6a171ea3):
  │     200 {status:"ok", itemType, itemId, source, tracked:true, ...}
  │     → JourneyActivity row created with event_name:
  │        • source=core             → event_name=core_{type}_completed
  │        • source=support_grief    → event_name=support_grief_{type}_completed
  │        • source=support_joy      → event_name=support_joy_{type}_completed
  │        • source=support_loneliness → support_loneliness_{type}_completed
  │        • source=support_growth   → event_name=support_growth_{type}_completed
  │   Pre-fix behavior (HISTORICAL, do not expect): 400 {"error":"Invalid source"}
  │     → FE silently swallowed via try/catch → no DB row, no analytics event
  ├ setScreenValue(true, practice_chant|embody|act|deepen)  ← Fix 720206e
  │   (only when source==="core"; support/additional sources don't flip triad)
  └ loadScreen({container_id: "practice_runner", state_id: "completion_return"})
  ↓
CompletionReturnTransient
  ├ Shows completion message + wisdom_anchor_line
  └ Return-to-source button
  ↓ tap return-to-source
  ↓ For support sources → back to the room
  ↓ For core → back to dashboard
```

---

## 3. Room-specific pills + runner sources

**Important correction (2026-04-19):** The FE actually dispatches `source="support_{room}"` for all 4 rooms (NOT `joy_room` / `growth_room` as originally documented). This was a known mismatch vs. BE validator which expected bare `"support"` — fixed in commit `6a171ea3` (BE now accepts all 4 `support_*` variants). Distinct `event_name` values are generated per room for analytics segmentation.

### Grief room (`src/extensions/moments/grief_room/index.tsx`)
- `grief_mantra_option` → mantra runner → `start_runner` with `source: "support_grief"` → completion persists as `event_name: "support_grief_mantra_completed"`
- Opening testID: `grief_room_opening_line`
- Room-internal testIDs verified reachable post-Batch-1A Case B (camelCase fix).

### Loneliness room (`src/extensions/moments/loneliness_room/index.tsx`)
- `loneliness_bhakti_option` → mantra runner → `source: "support_loneliness"` → `event_name: "support_loneliness_mantra_completed"`
- `loneliness_chant_option` → mantra runner → same source
- Opening testID: `loneliness_room_opening_line`

### Joy room (`src/extensions/moments/joy_room/index.tsx`)
- `joy_chant_option` → mantra runner → `source: "support_joy"` → `event_name: "support_joy_mantra_completed"`
- In-room `pill_walk_label` → 10-min walk (no runner, stays in room)
- In-room `pill_carry_label` → dispatches `carry_joy_forward` → adds `joy_carry_chip` to dashboard
- Opening testID: `joy_room_opening_line`

### Growth room / "deep" (`src/extensions/moments/growth_room/index.tsx`)
- `growth_mantra_option` → mantra runner → `source: "support_growth"` → `event_name: "support_growth_mantra_completed"`
- `growth_practice_option` → practice runner → `source: "support_growth"` → `event_name: "support_growth_practice_completed"`
- `inquiry_category_{decision|meaning|boundary}` → category-specific pills (leads to layer-2 runner options)
- Opening testID: `growth_room_opening_line`

---

## 4. Manual test checklist

Prerequisites: sim 221EDFB1 running; Metro bundler on 8081; dev backend healthy (`curl https://dev.kalpx.com/apimitra/journey/start-v3/` returns HTTP 200). For any `maestro test` CLI runs: stop the Maestro MCP daemon first (kill the `maestro.cli.AppKt mcp` java process) to avoid driver collision.

Canonical smoke persona (unless noted): `smoke+triad@kalpx.com` / `smoke-dev-only-do-not-use-in-prod`.

---

### T-1 — Triad completion engaged-count fix (HIGHEST PRIORITY — regression-risk)

**Why:** commit `720206e` landed today to fix dashboard ring + per-item checkmarks not advancing on core completion. This is the highest-value verification.

**Steps:**
1. Fresh launch app on sim. Log in as `smoke+triad@kalpx.com` (day 3/14).
2. On dashboard, confirm ring shows **0/3** initially (or whatever prior state; note the count).
3. Tap `core_item_mantra` card.
4. Info-reveal screen renders; tap **Begin** / natural CTA.
5. On runner screen (`offering_reveal`): tap the tiny `test_runner_force_complete` hotspot at top-right (invisible 24×24 area at top:60, right:4). In Dev builds, this fires the real `complete_runner` action.
6. Completion return screen shows. Tap **Return home** / equivalent.
7. **EXPECTED:**
   - Dashboard ring advances **0/3 → 1/3** (or N → N+1).
   - Under the triad, mantra card now shows a "done" checkmark (reads `ss.practice_chant`).
8. Repeat for `core_item_sankalpa` → ring 1/3 → 2/3; checkmark on sankalpa card.
9. Repeat for `core_item_ritual` (practice) → ring 2/3 → 3/3; checkmark on practice card.
10. After third completion: greeting / ring state text should flip to **"Day Completed"** (or equivalent per localization).

**Fail signal (bug not fixed):** ring stays at 0/3 even after completion, or checkmarks never appear, or "Day Completed" never fires.

**Isolation if failed:**
- Check Metro logs for `[TRACK_COMPLETION]` success → BE persisted.
- Check Redux devtools for `screen/setScreenValue` action with key `practice_chant`/`embody`/`act` after completion → FE flag flip.
- If flag flip missing: the fix was reverted / not bundled.
- If flag flip present but ring doesn't advance: CompanionDashboardContainer isn't re-rendering (stale memoized `coreCount`).

---

### T-2 — Grief room e2e (H-3 a11y + source-validation verification)

**Why:** H-3 refactored MoreSupportSheet to fix iOS Modal accessibility flatten (previously grief/loneliness rows were unreachable). Source-validation fix `6a171ea3` means grief completions now actually persist to BE — before they silently 400'd.

**Steps:**
1. Dashboard visible.
2. Scroll down until **"More support ›"** link is visible in viewport (just below the triad + chips).
3. Tap **"More support ›"**.
4. Bottom sheet slides up showing:
   - Header: **"More ways to be supported"**
   - Row 1: drop icon + **"Sitting with grief"**
   - Row 2: people icon + **"Company for loneliness"**
5. Tap **"Sitting with grief"** row.
6. **EXPECTED:** sheet dismisses; grief room surface mounts.
7. Confirm grief room opening line visible (something like "I'm here with you. We can stay quiet first.").
8. Tap one of the pills (e.g., Mantra / Sitting / Chant).
9. Runner opens (cycle_transitions offering_reveal). Tap `test_runner_force_complete`.
10. Completion return screen shows.
11. Tap **Return**.
12. **EXPECTED:** navigation returns to the **grief room**, not the dashboard (support sources return to their source room).

**Fail signal:**
- Bottom sheet rows not tappable → H-3 fix not live (should not happen; iOS hierarchy probe earlier this session confirmed rows reachable).
- Completion lands on dashboard → return-to-source logic broken (would be a separate regression).

---

### T-3 — Loneliness room e2e

**Steps:**
1. Dashboard → scroll → **"More support ›"** tap.
2. Bottom sheet opens. Tap **"Company for loneliness"** row.
3. Loneliness room opens; opening line visible.
4. Tap `loneliness_bhakti_option` (or other pill).
5. Runner opens → `test_runner_force_complete` → completion → **Return**.
6. **EXPECTED:** returns to loneliness room (not dashboard).

---

### T-4 — Joy room e2e + Joy Carry chip

**Why:** verifies the primary-chip entry pattern + the joy_carry_forward dashboard chip (PR3 wave 3).

**Steps:**
1. Dashboard → find **"I'm in a good place"** chip (gold-bordered, sun icon).
2. Tap the chip.
3. **EXPECTED:** joy room opens; opening line visible.
4. Tap `joy_carry_option` (not the mantra/walk option — specifically the carry-forward pill).
5. **EXPECTED:** dispatches `carry_joy_forward`; sheet dismisses; dashboard has a new `joy_carry_chip` visible at greeting card area.
6. Re-open joy room → tap `joy_mantra_option`.
7. Runner → force complete → Return.
8. **EXPECTED:** returns to joy room.

---

### T-5 — Growth ("deep") room e2e

**Steps:**
1. Dashboard → find **"I want to go deeper"** chip (gold-bordered, leaf icon).
2. Tap the chip.
3. **EXPECTED:** growth room opens; opening line visible.
4. Tap `growth_mantra_option`.
5. **EXPECTED:** runner opens; info screen renders the authored mantra item (post–Case-A BE fix should show "Om Namah Shivaya" variant, NOT a blank/broken item).
6. Force complete → Return.
7. **EXPECTED:** returns to growth room.
8. Re-open growth room → tap `growth_practice_option`.
9. **EXPECTED:** runner opens practice item (post–Case-A fix should show "Mindful 5-5 Walking" variant).
10. Force complete → Return → growth room.

**Fail signal:**
- Blank info screen / 404 item → Case A BE content missing (re-deploy needed).
- `growth_mantra_option` tap does nothing → Case B FE camelCase mismatch regression (check mitraLibrarySearch predicate).

---

### T-6 — H-5 Day 14 sovereignty verification (persona_day14)

**Why:** commit BE `d5aa1ffd` rewrote M25 `narrative_template` to remove canned pre-S1-10 phrases.

**Steps:**
1. Log out. Log in as **`persona_day14@kalpx.com`** / `smoke-dev-only-do-not-use-in-prod`.
2. Wait for dashboard to settle on day 14 state.
3. Expect the Day 14 checkpoint card to mount automatically (or to be reachable via dashboard routing).
4. On the checkpoint surface (`CheckpointDay14Block`):
   - Eyebrow: **"DAY 14"**
   - Headline: **"Two weeks. Something settled."**
   - Body (narrative_template): **"{N} days of presence across 14. What has taken root here now belongs to you."** where N is the completed-count (14 if all days complete; lower if journey has gaps).
   - Summary line: **"{N} of 14 days held."**
5. **MUST NOT see** the strings:
   - "Fourteen days. Two weeks of showing up."
   - "sealed. Something has settled."

**Fail signal:** either forbidden string appears → BE deploy didn't pick up new M25 yaml (re-run docker compose down/up on EC2).

---

### T-7 — M-2 ContinuityMirrorCard no-regression

**Why:** commit `bbae859` added a render block for ContinuityMirrorCard. It MUST stay invisible on current personas (BE doesn't ship `continuityMirror` envelope field yet).

**Steps:**
1. On smoke+triad and on each of the canonical personas:
   - `smoke+triad@kalpx.com`
   - `persona_day7@kalpx.com`
   - `persona_day14@kalpx.com`
   - `persona_welcomeback@kalpx.com`
2. On each dashboard, look for a card with:
   - testID `continuity_mirror_card`
   - OR any visible continuity / "welcome back" messaging
3. **EXPECTED:** card NOT visible on any persona (BE field not yet shipped).
4. No visual regression (dashboard layout unchanged vs. pre-`bbae859`).

**Fail signal:** card appears on any persona → BE envelope is now shipping `continuity_mirror`, which means flow 28 can be un-parked.

---

### T-8 — M-3 Joy/Growth chip label migration (no user-visible change)

**Why:** BE `04014c67` moved Joy/Growth chip labels from Python hardcode to M48/M49 ContentPack slot. User-visible copy is unchanged, but the source path changed.

**Steps:**
1. Log in as `smoke+triad@kalpx.com`.
2. On dashboard, confirm:
   - Joy chip label reads **"I'm in a good place"** (unchanged).
   - Growth chip label reads **"I want to go deeper"** (unchanged).
3. If BE resolver failed silently (registry miss / parse error), chips would HIDE (sovereignty-strict empty fallback).
4. **EXPECTED:** both chips visible with unchanged copy.

**Fail signal:** chips hidden → ContentPack resolver failed. Check BE logs for `journey_envelope: chip label resolve failed` warnings. Re-deploy or inspect yaml for malformed syntax.

---

### T-9 — MoreSupportSheet dismiss + scrim behavior (H-3 regression)

**Why:** the H-3 refactor restructured the scrim from a nested Pressable to a sibling absolute TouchableOpacity. Verify sheet dismiss still works.

**Steps:**
1. Dashboard → tap **"More support ›"** → bottom sheet opens.
2. Tap the dark translucent backdrop (anywhere outside the sheet card).
3. **EXPECTED:** sheet dismisses; dashboard returns.
4. Re-open sheet → tap on the sheet card itself (not a row, not the scrim).
5. **EXPECTED:** sheet stays open (tap doesn't bubble to scrim).
6. Re-open sheet → tap **"Sitting with grief"** row.
7. **EXPECTED:** sheet dismisses + grief room navigation fires (deferred 120ms).

---

### T-10b — Room-completion DB persistence (post source-validation fix)

**Why:** verifies the 6a171ea3 fix is live end-to-end — every room completion now creates a `JourneyActivity` row on BE with a source-distinct `event_name`.

**Prereq:** complete one mantra in each of the 4 rooms (T-2, T-3, T-4, T-5 in any order).

**Verify via dev DB (operator with SSH access):**

```
ssh -i ~/KalpXKeyPairName.pem ubuntu@18.223.217.113
cd /opt/kalpx-dev/app/KalpX
docker compose -f docker-compose.dev.yml -p kalpxdev exec -T web python manage.py shell -c "
from core.models import JourneyActivity
qs = JourneyActivity.objects.filter(source__startswith='support_').order_by('-performed_at')[:10]
for a in qs:
    print(a.performed_at.isoformat(), a.source, a.activity_type, a.event_name, 'journey=', a.journey_id)
"
```

**EXPECTED rows** (one per completion, most-recent first):

```
<ts> support_grief      mantra support_grief_mantra_completed      journey=<id>
<ts> support_loneliness mantra support_loneliness_mantra_completed journey=<id>
<ts> support_joy        mantra support_joy_mantra_completed        journey=<id>
<ts> support_growth     mantra support_growth_mantra_completed     journey=<id>
```

**Verify via API probe (alternative — no SSH needed):**

```
# After each room completion, POST the same payload manually and confirm HTTP 200:
curl -X POST https://dev.kalpx.com/api/mitra/track-completion/ \
  -H "Authorization: Bearer $TOK" -H "Content-Type: application/json" \
  -d '{"itemType":"mantra","itemId":"mantra.peace_calm.om_namah_shivaya","source":"support_grief","journeyId":null,"dayNumber":3,"tz":"Asia/Kolkata","meta":{}}'
# Expect: {"status":"ok","tracked":true, ...} HTTP 200
```

**Fail signal:** fewer than 4 rows, or any row with `event_name="mantra_completed"` (generic fallback = fix regressed). If any of the 4 sources returns HTTP 400 "Invalid source", the fix is not deployed.

### T-10 — Dashboard sanity + no-regression on adjacent flows

**Steps:**
1. Cold-launch app. Log in as smoke persona.
2. Dashboard loads. Check:
   - Greeting card renders with user name.
   - Core triad (mantra/sankalpa/ritual) renders with titles.
   - Why-this L1 strip renders (horizontal scroll chips).
   - Cycle progress "Day N of 14" visible.
   - "I Feel Triggered" + "Quick Check-in" chips visible (primary actions).
   - "I'm in a good place" + "I want to go deeper" chips visible (T-8).
   - "More support ›" link visible (T-2/T-3 entry).
   - "ADDITIONAL PRACTICES" section visible (AdditionalItemsSectionBlock).
3. No blank/skeleton screens beyond initial hydration (≤3s).

---

## 4b. What each pill/button DOES (room-by-room)

Each room has a mix of **runner pills** (dispatch `start_runner` → canonical rich runner → track-completion) and **in-room pills** (`setStep(...)` — stay in the room, no backend). Exit always dispatches `exit_{room}_room` → dashboard. Runner completion returns to the **source room** (not dashboard) for all 4 support sources: `support_grief`, `support_loneliness`, `support_joy`, `support_growth`.

Post 6a171ea3 (2026-04-19): all 4 sources are now BE-accepted and persist `JourneyActivity` rows with distinct `event_name` values.

### Joy Room

| Copy | testID | Behavior on press |
|---|---|---|
| "Chant for this fullness" | `joy_chant_option` | start_runner mantra, source=support_joy, target_reps=27 → offering_reveal → complete_runner → POST track-completion `{source:"support_joy"}` → 200 `tracked:true`, event_name=`support_joy_mantra_completed` |
| "Name what's steady" | — | setStep("input") — in-room textarea; submit dispatches `joy_naming_saved` |
| "Offer it into your day" | — | dispatch("joy_offering_noted") — silent nod, stays in options |
| "A quiet 10-minute walk" | — | setStep("walk") — in-room walk timer |
| "Sit in it a while" | — | setStep("sit") — in-room quiet sit |
| "Carry it forward" | — | dispatch("carry_joy_forward") → dashboard later shows `joy_carry_chip` |
| "I'll go now" | — | dispatch("exit_joy_room") → back to dashboard with actions_used counter |

### Grief Room

| Copy | testID | Behavior on press |
|---|---|---|
| Breath pill | — | setStep("breath") — in-room guided breath |
| Input (what's underneath) | — | setStep("input") — textarea; submit dispatches `grief_naming_saved` |
| Mantra pill | `grief_mantra_option` | start_runner mantra, source=support_grief → track-completion 200 event_name=`support_grief_mantra_completed` |
| Stay pill | — | setStep("stay") — quiet accompany with mute toggle |
| Exit pill | — | dispatch("exit_grief_room") → dashboard |

Grief has 30s silence-tolerance auto-reveal (options appear after silence).

### Loneliness Room

| Copy | testID | Behavior on press |
|---|---|---|
| Bhakti pill | `loneliness_bhakti_option` | start_runner mantra, source=support_loneliness → track-completion 200 event_name=`support_loneliness_mantra_completed` |
| Chant pill | `loneliness_chant_option` | start_runner mantra, source=support_loneliness → same event_name |
| Input pill | — | setStep("input") — naming textarea |
| Walk pill | — | setStep("walk") — in-room walk |
| Exit pill | — | dispatch("exit_loneliness_room") → dashboard |

### Growth Room ("deep")

Two-layer menu: pick a category pill first, then runner/sub-pills.

| Layer 1 | On press |
|---|---|
| Inquiry | `handleInquiryPillTap` → setStep("category") → shows `inquiry_category_decision` / `meaning` / `boundary` sub-pills |
| Teaching | `handleTeachingTap` → in-room teaching display |
| Mantra (`growth_mantra_option` testID) | start_runner mantra, source=support_growth → track-completion 200 event_name=`support_growth_mantra_completed` |
| Practice (`growth_practice_option` testID) | start_runner practice, source=support_growth → track-completion 200 event_name=`support_growth_practice_completed` |
| Journal | setStep("journal") — in-room journaling |
| Exit | dispatch("exit_growth_room") → dashboard |

### Common invariants (all rooms)

- **Pill renders only if its backend label slot is non-empty** (sovereignty-strict; missing slot = hidden pill).
- **setStep(X) pills stay in the room** — no backend call, no runner.
- **start_runner pills** go through `mitraLibrarySearch` → `CycleTransitionsContainer / offering_reveal`.
- **Runner completion (source-aware return):** for all 4 `support_*` sources (grief / loneliness / joy / growth), Return lands on the **source room**. For `source==="core"`, Return lands on dashboard.
- **Runner completion always POSTs to `/api/mitra/track-completion/`** with the source-distinct payload. Post-fix `6a171ea3`, BE responds 200 `tracked:true` and creates a `JourneyActivity` row with a source-distinct `event_name`. Pre-fix all 4 rooms silently 400'd (see doc change log).
- **Exit pill** always dispatches `exit_{room}_room` and logs `actions_used` telemetry via `/api/mitra/track-event/`.

### Red flags during manual testing

- Pill tap does nothing → mitraLibrarySearch returned empty OR item_id missing in envelope.
- Pill tap lands on blank info screen → Case-A BE content gap for that item_id.
- Runner completion lands on dashboard instead of source room → return-to-source logic broken for that source.
- Visible English pill copy but the slot is empty → sovereignty violation (hardcoded fallback shipping).
- `joy_carry_chip` missing after tapping Carry It Forward → `carry_joy_forward` handler regression.
- Metro logs show `track-completion API failed: Request failed with status code 400` after any support-room completion → 6a171ea3 not deployed to the BE this client is hitting; re-run `docker compose down/up` on EC2 or confirm the client is pointing at dev.
- DB query (T-10b) returns rows with generic `event_name="mantra_completed"` instead of `support_{room}_mantra_completed` → event_name_map regressed (likely a merge conflict dropped the 4 support_* entries).

## 5. Known MANUAL EXCEPTIONS (do NOT mark these flows GREEN without a clean Maestro CLI session)

These flows are product-complete but CLI e2e verification owed. Sprint 1 close condition (a) is NOT satisfied until each flows green via `maestro test` in a clean session (no MCP daemon attached):
- `15_day14_checkpoint.yaml`
- `19_completion_grief_mantra.yaml`
- `20_completion_loneliness_mantra.yaml`

Operator protocol:
```
# Stop the Maestro MCP daemon first
ps aux | grep maestro.cli.AppKt | grep -v grep  # find the pid
kill <pid>

# Confirm one xcodebuild test-without-building process max
ps aux | grep "xcodebuild test-without-building" | grep -v grep

# Then run (from /Users/paragbhasin/kalpx-app-rn)
maestro --device 221EDFB1-254E-4694-9B58-8BABEF2EBADD test .maestro/silk-integrity/15_day14_checkpoint.yaml
maestro --device 221EDFB1-254E-4694-9B58-8BABEF2EBADD test .maestro/silk-integrity/19_completion_grief_mantra.yaml
maestro --device 221EDFB1-254E-4694-9B58-8BABEF2EBADD test .maestro/silk-integrity/20_completion_loneliness_mantra.yaml
```

Each flow green = flip corresponding row from 🟡 to 🟢 in `.maestro/silk-integrity/FLOW_STATUS.md`.

## 6. Known PARKED flows (do NOT attempt, external owners named)

- **Flow 28 continuity** — BE/content (MDR-S2-06): `continuityMirror` envelope field not yet emitted.
- **Flow 29 path_milestone** — persona/harness + BE threshold owner: `persona_day7` below the BE 30-day threshold; needs `persona_day30+` or threshold revision.
- **Batch C flows 23/24/25/26/27/30/31** — see FLOW_STATUS.md Batch M-D table for per-flow owner + next action. None are FE bugs.
