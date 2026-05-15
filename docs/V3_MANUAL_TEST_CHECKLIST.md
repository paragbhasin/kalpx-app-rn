# v3 Manual Test Checklist

All test users use password `Test1234!` and live on `dev.kalpx.com`.
Simulator: iPhone 15 Pro. Build: `npx expo run:ios`.

---

## 1. Deep-Link Rendering Tests

Open each deep link via:
```bash
xcrun simctl openurl booted "kalpx://mitra/<container>/<state>"
```

Pre-req: logged in as `test+day7@kalpx.com` with active journey.

### Dashboard

- [ ] **DL-01** `companion_dashboard/day_active` -- Triad cards visible (mantra, practice, intention). No blank card titles. No "undefined" text.
- [ ] **DL-11** `companion_dashboard_v3/day_active` -- v3 dashboard variant renders. Day number visible. Focus phrase present.

### Cycle Transitions

- [ ] **DL-02** `cycle_transitions/weekly_checkpoint?cycle_day=7` -- Day 7 framing text present (starts with "Has..."). Four feeling options visible. Submit button present.
- [ ] **DL-03** `cycle_transitions/weekly_checkpoint?cycle_day=14` -- Day 14 framing text present ("Two weeks..."). Decision tree buttons visible.

### Support Flows

- [ ] **DL-04** `support_trigger/feeling_select` -- Trigger screen renders. Feeling chips visible. No blank screen.
- [ ] **DL-05** `support_checkin/notice` -- Check-in screen renders. Notice prompt visible.
- [ ] **DL-06** `support_grief/room` -- Grief room renders. Opening line is non-empty (slot-resolved). No timers or rep counters. Pill options visible ("Sit with me", "I'll come back to this"). Tone is soft -- no exclamation marks.
- [ ] **DL-07** `support_loneliness/room` -- Loneliness room renders. Same checks as grief: non-empty opening, no timers, pills visible.

### Crisis

- [ ] **DL-08** `crisis_room/grounding` -- Crisis room renders. Opening line present ("I hear you" or similar). Hotline numbers visible. No "undefined" or blank slots.

### Practice Runners

- [ ] **DL-09** `practice_runner/mantra_runner` -- Mantra runner loads. Begin/Start button visible. Mantra text or chant instructions present.
- [ ] **DL-10** `practice_runner/practice_timer` -- Practice timer loads. Timer UI present. Start button visible.

### Onboarding (requires fresh/guest session)

- [ ] **DL-12** `welcome_onboarding/turn_1` -- (Must clear AsyncStorage first.) Turn 1 renders with "I'm Mitra" and "I'd like that" chip.

---

## 2. End-to-End Scenarios

### Scenario A -- Fresh User Onboarding

User: `test+fresh1@kalpx.com` / `Test1234!`

- [ ] Login via Menu > Log In. "Connect to Your Roots" screen appears.
- [ ] After login, Turn 1 appears: "I'm Mitra" greeting, "I'd like that" chip.
- [ ] Turn 2: "What's alive for you?" with at least 4 chip options.
- [ ] Turn 3: Texture selection. Chips reference the Turn 2 choice.
- [ ] Turn 4: Voice/text fork. "Speak to me" and "Keep it written" visible.
- [ ] Turn 5: Guidance mode. "A blend" option visible.
- [ ] Turn 6: Recognition screen. "Play my first briefing" and "Show me my path first" visible.
- [ ] Turn 7: Path emerges. Three triad cards: mantra, intention, practice.
- [ ] Turn 8 / Landing: Dashboard loads with the assigned triad. Day 1 visible.
- [ ] No English fallback text appears during any turn (sovereignty check).
- [ ] No blank or "undefined" slots in any turn.

### Scenario B -- Support Flow (Trigger)

User: `test+day3@kalpx.com` / `Test1234!`

- [ ] From dashboard, tap trigger entry point ("I Feel Triggered" or similar).
- [ ] Trigger screen renders with feeling selection chips.
- [ ] After selecting a feeling, suggestions/support content appears.
- [ ] Suggestions match the selected feeling (not generic).
- [ ] Return to dashboard works without crash.
- [ ] Dashboard state is unchanged after returning (no triad mutation).

### Scenario C -- Grief Room

User: `test+day3@kalpx.com` / `Test1234!` (or deep link)

- [ ] Grief room opens with a non-empty opening line.
- [ ] No timers, rep counters, or completion percentages visible.
- [ ] Pill options visible: "Sit with me" and "I'll come back to this".
- [ ] Tapping "Sit with me" stays in room (no navigation away).
- [ ] After ~30s silence, auto-revealed second options appear (if silence_tolerance active).
- [ ] "I'll come back to this" exits to dashboard.
- [ ] Tone check: no exclamation marks, no celebration language, no "Great job!" anywhere.

### Scenario D -- Crisis Room

User: any logged-in user (or deep link)

- [ ] Crisis room renders with grounding content.
- [ ] Opening line present: "I hear you" or similar compassionate text.
- [ ] Hotline numbers visible (AASRA 9820466626, Vandrevala 1860-2662-345, or US 988/741741).
- [ ] No slot is blank or shows "undefined".
- [ ] Exit button returns to previous screen without crash.

### Scenario E -- Day 7 Checkpoint

User: `test+day7@kalpx.com` / `Test1234!`

- [ ] After login and navigating to routine, auto-routes to checkpoint screen.
- [ ] Framing text matches the user's path_intent (not generic).
- [ ] Four feeling options visible: steady, some shift, finding my way, heaviness.
- [ ] Selecting a feeling enables Continue button.
- [ ] Optional reflection textarea present.
- [ ] After submit, results screen renders with feedback matching the selected feeling.
- [ ] Primary action button visible (Continue My Path / Choose New Focus / Lighten).
- [ ] Tapping primary action lands on dashboard.
- [ ] Dashboard shows correct day (day 7 or day 8 depending on cycle logic).

### Scenario F -- Day 14 Unresolved

User: `test+day14unresolved@kalpx.com` / `Test1234!`

- [ ] After login, auto-routes to day 14 checkpoint (reentryTarget=day14_boundary).
- [ ] Framing text references two weeks / 14 days.
- [ ] Decision options include continue-same and change-path variants.
- [ ] Selecting "continue same" returns to dashboard with unchanged triad.
- [ ] Selecting "choose new focus" initiates triad reassignment flow.

### Scenario G -- Welcome Back (30-Day Absence)

User: `test+absent30d@kalpx.com` / `Test1234!`

- [ ] After login, welcome-back screen renders automatically (not regular dashboard).
- [ ] Welcome-back line references the user's prior path_intent.
- [ ] Two buttons visible: "Continue with [focus]" and "Start Fresh".
- [ ] Tapping "Continue with..." creates a new cycle and lands on dashboard (day 1).
- [ ] Tapping "Start Fresh" (if tested) routes to re-onboarding or path selection.

---

## 3. Regression Tests

### App Lifecycle

- [ ] **REG-01** Kill app during onboarding (mid-turn). Relaunch. App resumes at correct turn, not turn 1.
- [ ] **REG-02** Kill app during grief room. Relaunch. App does NOT auto-return to grief room (ephemeral state).
- [ ] **REG-03** Kill app on dashboard. Relaunch. Dashboard restores with correct triad and day number.
- [ ] **REG-04** Background app for 5 minutes. Foreground. Auth token still valid, no re-login required.
- [ ] **REG-05** Background app for 30 minutes. Foreground. If token expired, app redirects to login gracefully (no crash, no blank screen).

### Auth Transitions

- [ ] **REG-06** Guest user taps deep link. Deep link is ignored (no crash, no navigation to authed content).
- [ ] **REG-07** Logged-in user logs out via drawer. AsyncStorage cleared. Navigates to guest home.
- [ ] **REG-08** Logged-in user's token expires mid-session. Next API call triggers re-auth flow, not a white screen.
- [ ] **REG-09** Login with wrong password. Error message visible. No crash. Can retry.
- [ ] **REG-10** Login with non-existent email. Error message visible. No crash.

### Network Failure

- [ ] **REG-11** Airplane mode during onboarding chip tap. Graceful error or retry prompt (no crash).
- [ ] **REG-12** Airplane mode on dashboard load. Cached triad renders from local state (if available) or error message.
- [ ] **REG-13** Network drops during checkpoint submit. No duplicate submissions on retry. Error message shown.
- [ ] **REG-14** Network drops during grief room entry. Content from local cache or graceful fallback (no blank screen).

### State Isolation

- [ ] **REG-15** After trigger flow, return to dashboard. Runner state (mantra count, timer) is untouched.
- [ ] **REG-16** After grief room exit, check-in flow does not inherit grief context.
- [ ] **REG-17** After day 7 checkpoint completion, re-entering routine goes to dashboard (not checkpoint again).
- [ ] **REG-18** Complete mantra runner. Return to dashboard. Tap mantra again. Shows completion state, not stale runner.

### Cross-Flow Contamination

- [ ] **REG-19** Complete trigger flow. Enter check-in flow. Check-in does NOT show trigger feeling chips.
- [ ] **REG-20** Enter grief room. Exit. Enter loneliness room. Loneliness room shows its own opening line, not grief's.
- [ ] **REG-21** Complete onboarding as fresh user. Kill app. Relaunch. Dashboard appears (not onboarding again).

---

## 4. Visual and Content Checks

### No Old English / Hardcoded Strings

- [ ] **VIS-01** Dashboard: all card titles come from backend (no hardcoded "Morning Mantra" etc.).
- [ ] **VIS-02** Grief room: opening line is slot-resolved, not the old hardcoded "I'm here with you".
- [ ] **VIS-03** Loneliness room: opening line is slot-resolved, not hardcoded.
- [ ] **VIS-04** Day 7 checkpoint: framing text is path-specific, not generic.
- [ ] **VIS-05** Evening reflection: all 8 slots populated from registry (if M35 migration active).

### No Blank Slots

- [ ] **VIS-06** Dashboard triad: all 3 cards have title + subtitle + CTA. None blank.
- [ ] **VIS-07** Onboarding turns 2-3: chips render with text. No empty chip bubbles.
- [ ] **VIS-08** Recognition screen (turn 6): briefing copy or path copy present. No empty card.
- [ ] **VIS-09** Checkpoint results: feedback text matches the selected feeling. Not blank.

### Correct Burden Level / Tone

- [ ] **VIS-10** Grief room: no celebration language, no "Great!", no exclamation marks in opening.
- [ ] **VIS-11** Loneliness room: tone is companioning, not prescriptive. No "You should try..." phrasing.
- [ ] **VIS-12** Crisis room: immediate safety content first. No "How are you feeling?" before grounding.
- [ ] **VIS-13** Welcome-back: tone is warm and recognizing, not guilt-inducing ("You've been away...").
- [ ] **VIS-14** Day 14 unresolved: framing acknowledges difficulty without judgment.
- [ ] **VIS-15** Trigger flow: suggestions match burden level. Heavy trigger does not get light/casual advice.

### Layout and Accessibility

- [ ] **VIS-16** All screens render within safe area (no content behind notch or home indicator).
- [ ] **VIS-17** Long text in grief/loneliness opening lines wraps correctly (no truncation).
- [ ] **VIS-18** Crisis hotline numbers are tappable (tel: links work on device).
- [ ] **VIS-19** Chip text in onboarding does not overflow chip boundary.
- [ ] **VIS-20** Dark mode (if supported): all text is readable against background.

---

## Test Execution Log

| Date | Tester | Scenarios Run | Pass | Fail | Notes |
|------|--------|---------------|------|------|-------|
|      |        |               |      |      |       |
|      |        |               |      |      |       |

---

## Test User Reference

| User Email | Password | Journey State | Purpose |
|---|---|---|---|
| `test+fresh1@kalpx.com` | `Test1234!` | No journey | Scenario A: fresh onboarding |
| `test+day3@kalpx.com` | `Test1234!` | Day 3, active | Scenario B: trigger flow, general deep links |
| `test+day7@kalpx.com` | `Test1234!` | Day 7, active | Scenario E: day 7 checkpoint, deep link matrix |
| `test+day14unresolved@kalpx.com` | `Test1234!` | Day 14, unresolved | Scenario F: day 14 boundary |
| `test+absent30d@kalpx.com` | `Test1234!` | 30+ days inactive | Scenario G: welcome back |
| `test+welcomeback@kalpx.com` | `Test1234!` | Welcome-back flag set | Alt welcome-back user |
