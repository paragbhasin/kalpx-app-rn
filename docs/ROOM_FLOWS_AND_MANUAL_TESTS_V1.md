# Mitra Room Flows + Manual Test Reference V1

**Purpose:** authoritative navigation map for the 4 support / inquiry rooms (grief, loneliness, joy, growth) and a concrete manual-test checklist the operator can run against sim 221EDFB1-254E-4694-9B58-8BABEF2EBADD or a real device.

**Scope:** post-Phase-3 close (2026-04-19). Covers H-3 (MoreSupportSheet a11y), H-5 (Day-14 sovereignty), M-2 (continuity render), M-3 (Joy/Growth ContentPack labels), and the triad-completion local-flag sync bug fix (`720206e`).

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
  ├ POST /api/mitra/track-completion/ (BE persists JourneyActivity)
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

### Grief room (`src/extensions/moments/grief_room/index.tsx`)
- `grief_mantra_option` → mantra runner (source: `support_grief`)
- `grief_chant_option` → chant runner
- `grief_sitting_option` → practice runner
- Opening testID: `grief_room_opening_line`
- Room-internal testIDs verified reachable post-Batch-1A Case B (camelCase fix).

### Loneliness room (`src/extensions/moments/loneliness_room/index.tsx`)
- `loneliness_bhakti_option` → mantra runner (source: `support_loneliness`)
- `loneliness_chant_option` → mantra runner
- `loneliness_walk_option` → practice runner
- Opening testID: `loneliness_room_opening_line`

### Joy room (`src/extensions/moments/joy_room/index.tsx`)
- `joy_mantra_option` → mantra runner (source: `joy_room`)
- `joy_chant_option` → chant runner
- `joy_walk_option` → practice runner (10-min walk)
- `joy_carry_option` → dispatches `carry_joy_forward` → adds `joy_carry_chip` to dashboard
- Opening testID: `joy_room_opening_line`

### Growth room / "deep" (`src/extensions/moments/growth_room/index.tsx`)
- `growth_mantra_option` → mantra runner (source: `growth_room`)
- `growth_practice_option` → practice runner
- `inquiry_category_{decision|meaning|boundary}` → category-specific pills
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

### T-2 — Grief room e2e (H-3 a11y verification)

**Why:** H-3 refactored MoreSupportSheet to fix iOS Modal accessibility flatten. Previously the grief/loneliness rows were unreachable by Maestro / screen readers.

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
