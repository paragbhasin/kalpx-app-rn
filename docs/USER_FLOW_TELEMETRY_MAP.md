# User Flow + Telemetry Map

> Current state as of commit `62a85ee` (RN) / `8d5a246f` (backend).
> Maps every user-facing step in the Mitra v3 flow to its backend
> endpoints + `track-event` / `track-completion` calls so the Phase 6
> telemetry bridge can be planned against real usage.

## Call-site totals

- `mitraTrackEvent`: **75 call sites** emitting **63 distinct event_names**
- `mitraTrackCompletion`: **4 call sites** (real triad completions)
- Total telemetry call sites: **79**
- Total FE telemetry emits including track-* + specific analytics (e.g. mitraMomentNext shadow): **84**

---

## Flow 1 — App open (authed user with active journey)

```
user launches app
  └─ Home.tsx mount / useFocusEffect
     └─ GET /mitra/journey/status/                          (line 164)
        └─ reads: hasActiveJourney, journeyId, dayNumber
        └─ if journeyId present → render <ContinueJourney />
        └─ else → navigateToMitra(false) → onboarding/turn_1
```

**Telemetry fired during this flow:** NONE. Status check is read-only, silent.

---

## Flow 2 — ContinueJourney → Dashboard

```
<ContinueJourney /> mount
  ├─ GET /mitra/journey/home/                               (mitraJourneyHome)
  │    └─ returns {response_type, layout, chips, context}
  │    └─ if response_type="route_to_moment" → executeAction(action)
  │    └─ else → render chips
  │
  └─ after 1.5s (non-blocking prehydrate)
     └─ executeAction({type:"generate_companion",
                       payload:{skipReveal:true, use_journey_companion:true}})
        └─ GET /mitra/journey/companion/                    (mitraJourneyCompanion)
           └─ returns {companion.mantra, companion.sankalp, companion.practice}
           └─ populates: card_mantra_title, card_sankalpa_title, card_ritual_title,
                         mantra_audio_url, master_mantra, master_sankalp, master_practice
```

**Telemetry fired:**
- `mitraTrackEvent("journey_started", ...)` at `actionExecutor.ts:1585` — **ONLY** if this is a newly-created journey (journey.id differs from previous). Rare on resume.

---

## Flow 3 — User taps a chip on ContinueJourney

Chip actions dispatch via actionExecutor:

| Chip action | What fires | Telemetry |
|---|---|---|
| `continue_practice` | loadScreen → companion_dashboard_v3 | none |
| `start_checkin` | loadScreen → cycle_transitions/quick_checkin | none at this step |
| `start_support` | Inlines initiate_trigger: sets trigger state, plays OM, navigates to practice_runner/free_mantra_chanting | **`mitraTrackEvent("trigger_session_started", ...)`** at `:528` |
| `open_mitra_chat` | loadScreen → companion_dashboard_v3/day_active | none |
| `welcome_back_continue` | POST /mitra/journey/welcome-back/ {decision:continue} → loadScreen companion_dashboard | none (decision logged to MitraDecisionLog via /journey/home/ path) |
| `welcome_back_fresh` | POST /mitra/journey/welcome-back/ {decision:fresh} → loadScreen onboarding/turn_1 | none |

---

## Flow 4 — User lands on new dashboard (companion_dashboard_v3/day_active)

```
NewDashboardContainer mount (via useFocusEffect)
  ├─ executeAction({type:"generate_companion",
  │                  payload:{skipReveal:true, use_journey_companion:true}})
  │    └─ GET /mitra/journey/companion/   (read-only, NOT /generate-companion/)
  │
  └─ mitraJourneyCompanion() second fetch → hydrates 22 screenData keys:
       cycle_metrics, completed_today, greeting_context, journey_path,
       quick_support_labels, support_rooms_labels, why_this,
       why_this_l1_items, sankalp_how_to_live, focus_phrase, day_type,
       dayTypeCopy, focusName, pathMilestone, continuity, etc.
```

**Telemetry fired:** NONE on dashboard mount itself. Read-only hydration.

---

## Flow 5 — User taps MANTRA triad card (the audio flow we just fixed)

```
TriadCardsRow.handleTap("mantra")
  └─ executeAction({type:"view_info", payload:{type:"mantra"}})
     └─ (in actionExecutor:1234)
     ├─ builds info payload from screenData.master_mantra
     ├─ sets runner_active_item with item_type, source, audio_url
     ├─ sets info_start_action = navigate mantra_rep_selection
     └─ loadScreen(cycle_transitions/offering_reveal)
        └─ CycleTransitionsContainer renders info/mala/counter/reps inline
        └─ AudioPlayerBlock auto-plays mantra audio after 2s (commit 6edfd97)
```

**Telemetry fired:** NONE at view_info entry. (Silent info surface.)

---

## Flow 6 — User taps the mala to chant (on offering_reveal)

```
User taps mala bead → handleIncrement → chantCount++
  (no API call per tap — local state only)

chantCount reaches selectedTarget
  └─ triggerCompletion (CycleTransitionsContainer:338)
     ├─ updateScreenData runner_reps_completed + chant_duration
     └─ executeAction({type:"complete_runner",
                        target:{container:"practice_runner",
                                state:"completion_return"}})
        └─ complete_runner handler in actionExecutor (around :3325-3380)
           ├─ mitraTrackEvent(stmEventName, ...) at :3325
           │    └─ eventName: depends on flow context (e.g. "session_completed")
           │
           └─ mitraTrackCompletion(...) at :3369
                └─ POST /mitra/track-completion/
                   body: {
                     journeyId, itemType:"mantra",
                     itemId: master_mantra.id,
                     source:"core",
                     dayNumber, locale, tz,
                     meta: { duration_seconds, rep_count }
                   }
                └─ backend: writes JourneyActivity
                   activity_type="mantra", source="core",
                   event_name="core_mantra_completed"
                └─ side effects: CompanionState.last_reported_mood="practiced",
                                 metric recompute, sankalp once-per-day dedupe
```

**Telemetry fired (2 calls):**
1. `mitraTrackEvent` with a flow-specific event_name (session_completed or similar)
2. **`mitraTrackCompletion`** with itemType="mantra" — the load-bearing one

---

## Flow 7 — Completion return screen shows after mantra done

```
loadScreen practice_runner/completion_return
  └─ CompletionReturnTransient.tsx renders the gold checkmark + variant message
     │ (M_completion_return ContentPack — "Complete. You stayed with the sound.")
     │
     ├─ mitraTrackEvent("completion_return_shown") at :114
     │
     └─ (if user submits reflection)
        mitraTrackEvent("post_completion_reflection", ...) at :191
     └─ (if user taps Repeat)
        mitraTrackEvent("completion_return_repeated") at :172
     └─ (if user taps Return to Dashboard)
        mitraTrackEvent("completion_return_manually_returned") at :152
```

**Telemetry fired:** 1 on mount, +1 per user action (reflection / repeat / return)

---

## Flow 8 — User taps SANKALP triad card (identical shape)

```
TriadCardsRow.handleTap("sankalp")
  └─ executeAction({type:"view_info", payload:{type:"sankalp"}})
     └─ loadScreen(cycle_transitions/offering_reveal)
        └─ CycleTransitionsContainer renders the sankalp hold UI (embody flow)

User taps + holds center → runSankalpActivation → OM audio plays →
  triggerCompletion → complete_runner
    ├─ mitraTrackEvent("sankalp_embodied" or flow-specific)
    └─ mitraTrackCompletion({itemType:"sankalp", itemId:master_sankalp.id, ...})
       └─ backend writes JourneyActivity activity_type="sankalp", source="core"
       └─ event_name="core_sankalp_completed"
       └─ sankalp once-per-day dedupe (returns early if already today)
```

**Telemetry fired:** same pair pattern as mantra.

---

## Flow 9 — User taps PRACTICE triad card

Same pattern. Container renders practice timer. On completion:
- `mitraTrackEvent("practice_completed" or flow-specific)`
- `mitraTrackCompletion({itemType:"practice", itemId:master_practice.id, ...})`
  - `event_name="core_practice_completed"`

---

## Flow 10 — "I Feel Triggered" quick support

```
QuickSupportBlock tap → dispatchAction("initiate_trigger")
  └─ actionExecutor.ts:1846
     ├─ setScreenValue for trigger state
     ├─ mitraTrackEvent("trigger_session_started", ...) at :1872
     └─ loadScreen(support_trigger/feeling_select)

User picks a feeling → mantra or practice suggested → runs it →
  complete_runner:
    ├─ mitraTrackEvent("trigger_resolved" or variant) at :2040 / :2207 / :2250
    └─ mitraTrackCompletion({source:"support", itemType:...}) at :823 or :3475
       └─ event_name="support_mantra_completed" / "support_practice_completed"

If user bails mid-flow:
    └─ mitraTrackEvent("trigger_session_abandoned") at :935
```

**Telemetry fired:** 2-3 per session depending on flow.

---

## Flow 11 — "Quick Check-in"

```
QuickSupportBlock tap → dispatchAction("start_checkin")
  └─ loadScreen(cycle_transitions/quick_checkin) — single-screen pulse
  (no telemetry here)

User picks feeling → prana acknowledge:
  POST /mitra/prana-acknowledge/ {pranaType}
  └─ mitraTrackEvent("checkin_acknowledged" or specific) at :1217

If "agitated" / "drained" → breath_reset suggested:
  └─ loadScreen(practice_runner/checkin_breath_reset)
     └─ mitraTrackEvent("checkin_breath_reset") at :1168
     └─ on completion:
        └─ mitraTrackEvent("checkin_resolved_after_breath_reset") at :2386

If "balanced" / "energized" → BalancedAckOverlay:
  └─ mitraTrackEvent("checkin_balanced_ack_shown") at BalancedAckOverlay:45
```

**Telemetry fired:** 1-3 per session depending on the branch.

---

## Flow 12 — "More Support" sheet

Labels on the bottom sheet:
- Grief Room → `navigate(support_grief/grief_room)`
  - On enter: `mitraTrackEvent("grief_session_opened")` at `:4806`
- Loneliness Room → `navigate(support_loneliness/loneliness_room)`
  - On enter: `mitraTrackEvent("loneliness_room_entered")`

Crisis entry was also here but user pulled it.

---

## Flow 13 — Day 7 / Day 14 checkpoints

```
User on dashboard → cycle_day reaches 7 → checkpoint presents
  └─ loadScreen(cycle_transitions/checkpoint_day_7)
     └─ mitraTrackEvent("checkpoint_viewed", {day:7}) at :2705
  
User picks decision (continue / lighten / start_fresh):
  └─ POST /mitra/journey/checkpoint/7/submit/
  └─ mitraTrackEvent("checkpoint_completed", {day:7, decision}) at :2784

If day_14 + user cycle complete:
  └─ mitraTrackEvent("cycle_completed", {path_cycle_number}) at :2796
```

**Telemetry fired:** 2 per checkpoint (view + completion).

---

## Flow 14 — Dashboard intelligence surfaces (M26/M28/M29/M39/M44/M45)

Each insight card fires telemetry when interacted with:

| Card | Action | Event |
|---|---|---|
| PredictiveAlertCard (M28) | Dismiss | `predictive_alert_dismissed` at `:4467` |
| EntityRecognitionCard (M29) | Confirm | `entity_confirmed` at `:4483` |
| | Dismiss | `entity_dismissed` at `:4499` |
| RecommendedAdditionalCard (M30) | Accept | `recommended_additional_accepted` at `:4534` |
| | Dismiss | `recommended_additional_dismissed` at `:4579` |
| PostConflictMorningCard (M39) | Ack | `post_conflict_acknowledged` at `:4597` |
| | Open voice note | `post_conflict_voice_note_opened` at `:4607` |
| GratitudeSignalCard (M44) | Submit | `gratitude_joy_submitted` |
| ResilienceNarrativeCard (M26) | Ack | `resilience_narrative_acked` at `:4269` |
| | What helped submit | `what_helped_submitted` at `:4288` |

---

## Flow 15 — Why-This L2 / L3 (the drill-down we added)

```
User taps chip on WhyThisL1Strip
  └─ opens WhyThisSheet bottom sheet
  └─ POST /mitra/content/moments/M36_why_this_l2/resolve/ (mitraResolveMoment)
     └─ renders L2 body
     └─ mitraTrackEvent("why_this_l2_opened", {item_type}) at :4636

User taps "Go deeper"
  └─ POST /mitra/content/moments/M37_why_this_l3/resolve/
     └─ renders L3 body + source line
     └─ mitraTrackEvent("why_this_l3_opened", {item_type}) at :4658
```

**Telemetry fired:** 1-2 per sheet open.

---

## Flow 16 — Onboarding (net new user)

```
welcome_onboarding/turn_1 → turn_2 → ... → turn_7
  Each turn transition:
    └─ mitraTrackEvent("onboarding_turn_response", {turn, choice}) at :3614

Completion:
  POST /mitra/onboarding/complete/
  POST /mitra/journey/start-v3/
  └─ mitraTrackEvent("onboarding_completed", ...) at :3839
```

**Telemetry fired:** ~8 per onboarding sequence.

---

## Flow 17 — Voice consent (first voice tap)

```
mic tap → VoiceConsentModal
  User accepts → mitraTrackEvent("voice_consent_given") at :4249
  User declines → mitraTrackEvent("voice_consent_declined") at :4259
```

---

## Flow 18 — Evening reflection (M34/M35)

```
Evening window + user taps "Reflect"
  └─ mitraTrackEvent("evening_reflection", {mood}) at :4167

Weekly reflection letter (day 7+, async):
  └─ mitraTrackEvent("reflection_letter_completed") at :4210
```

---

## Flow 19 — Journey reset / Sound bridge / Day sealed

| Action | Event | Line |
|---|---|---|
| User taps reset | `journey_reset` | `:4739` |
| User exits Sound Bridge | `sound_bridge_exited` | `:4014` |
| End-of-day seal | `day_sealed` | `:2293` |
| Dashboard check-in ack | `dashboard_check_in_ack` | `:3528` |
| Prep coaching acknowledged | `prep_acknowledged` | `:4450` |

---

## Summary — telemetry density by flow

| Flow | mitraTrackEvent count | mitraTrackCompletion | Total per flow |
|---|---|---|---|
| App open + dashboard hydration | 0-1 (journey_started only on new journey) | 0 | 0-1 |
| Mantra card tap → counter → done | 1 (completion_return_shown) | 1 (core_mantra_completed) | 2-3 |
| Sankalp card → hold → done | 1 | 1 | 2 |
| Practice card → timer → done | 1 | 1 | 2 |
| I Feel Triggered full session | 2-3 (session_started + resolved + maybe still_feeling) | 1 | 3-4 |
| Quick Check-in (agitated branch) | 2-3 | 0 | 2-3 |
| Day 7 / 14 checkpoint | 2 (viewed + completed) | 0 | 2 |
| Grief Room session | 3 (opened + ended + potentially voice_note) | 0-1 | 3-4 |
| Onboarding sequence | ~8 (per turn + completed) | 0 | 8 |
| Why-This L2/L3 sheet | 1-2 (l2_opened + maybe l3_opened) | 0 | 1-2 |

**Typical daily active user session: ~6-12 track-event calls + 1-3 track-completion calls.**

At 1000 DAU = **~10K events/day** hitting the backend. Load-wise manageable — both endpoints are single DB inserts + side effects.

---

## Which flows already write to MitraDecisionLog (today)

**Automatically via orchestrator.resolve() — no FE change needed:**
- M8/M9/M10/M12/M15 — every /journey/home/ call writes 1 row
- M17/M18/M19 runners — M_offering_reveal resolved
- M24 / M25 checkpoints — resolved on view
- M26/M28/M29/M39/M44/M45 intelligence cards — when their content pack resolves
- M35/M36/M37 why-this ladder — on each sheet open (L2, L3)
- M46/M47 grief/loneliness rooms — on enter
- M_completion_return — on completion screen render

**NOT currently in MitraDecisionLog:**
- The imperative telemetry emits above (all track-event + track-completion calls)
- User-action events like `entity_confirmed`, `trigger_try_another`, `dashboard_check_in_ack`

---

## Implications for the Phase 6 bridge

### Track-event bridge — FE needs no changes

Every track-event call already carries `meta` with contextual data. The bridge just needs to:
1. Map `event_name` → `moment_id` (often trivial: `checkin_flow_opened` → `M20`, `grief_session_opened` → `M46`, etc.)
2. Write BOTH `MitraDecisionLog` (new canonical) and `JourneyActivity` (legacy mirror) for 4 weeks
3. Stop writing `JourneyActivity` for pure-telemetry events after parity confirmed

### Track-completion bridge — FE needs no changes, JourneyActivity STAYS

Item completions must continue writing `JourneyActivity` forever because:
- `completed_today[]` on /journey/companion/ aggregates from this table
- Streak computation reads this table
- Sankalp once-per-day dedupe reads this table
- CompanionState mood update hooks into this handler

The bridge just MIRRORS the completion into `MitraDecisionLog` for richer audit trail (variant_id, mode_served, etc.).

### Top 20 event names (for founder mapping approval)

Based on call-site frequency + daily usage patterns:

1. `trigger_session_started` (3 sites — trigger flow entry)
2. `completion_return_shown` (2 sites)
3. `completion_return_manually_returned` (2 sites)
4. `completion_return_repeated` (2 sites)
5. `session_started` (2 sites)
6. `post_completion_reflection` (2 sites)
7. `checkin_flow_opened` (1)
8. `trigger_flow_opened` (1)
9. `journey_started` (1)
10. `checkpoint_viewed` (1)
11. `checkpoint_completed` (1)
12. `cycle_completed` (1)
13. `day_sealed` (1)
14. `onboarding_completed` (1)
15. `onboarding_turn_response` (1)
16. `grief_session_opened` (1)
17. `loneliness_room_entered` (1)
18. `why_this_l2_opened` (1)
19. `why_this_l3_opened` (1)
20. `evening_reflection` (1)

---

## Reference

- RFC: `kalpx/docs/mitra-v3/RFC_TRACK_EVENT_TO_DECISION_LOG.md`
- Audit: `kalpx-app-rn/docs/AUDIT_LEGACY_VS_V3_APIS.md`
- Backend track-event view: `core/mitra_views.py:5105`
- Backend track-completion view: `core/mitra_views.py:6379`
- FE wrappers: `src/engine/mitraApi.ts:236` + `:274`
