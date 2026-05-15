# Room API Full Flow — V1 (post source-validation fix)

**Status:** live on dev backend (EC2 18.223.217.113) as of 2026-04-19.
**Base URL:** `https://dev.kalpx.com/api/`
**Auth:** `Authorization: Bearer {JWT_ACCESS_TOKEN}` (obtain via `POST /api/token/` with `username` + `password`).
**BE commit:** `6a171ea3` (track-completion ALLOWED_SOURCES + event_name_map + CompanionState hook).

This doc traces the complete HTTP flow for a room session (Joy room shown; grief / loneliness / growth are structurally identical with `M46_grief_room` / `M47_loneliness_room` / `M49_growth_room` moment IDs and `support_grief` / `support_loneliness` / `support_growth` source strings).

All request/response examples below are **real wire-captures** from dev against the `smoke+triad@kalpx.com` persona.

---

## Auth — get a JWT

```
POST /api/token/
Content-Type: application/json

{"username":"smoke_plus_triad_at_kalpx.com","password":"smoke-dev-only-do-not-use-in-prod"}
```

Note: Django username is email with `@` → `_at_`, `+` → `_plus_`, `.` → `.` (the `smoke+triad@kalpx.com` email normalizes to `smoke_plus_triad_at_kalpx.com`).

Response:
```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIs...",
  "access":  "eyJhbGciOiJIUzI1NiIs..."
}
```

All subsequent calls use `Authorization: Bearer {access}`.

---

## STEP 1 — Resolve room content

Called from `useEffect` inside JoyRoomContainer on mount. Drives room labels (opening line, pill labels, wisdom anchor) AND provides `joy_mantra_item_id` used later by runner pills.

### Request

```
POST /api/mitra/content/moments/M48_joy_room/resolve/
Authorization: Bearer {JWT}
Content-Type: application/json

{
  "path": "support",
  "stage_signals": {},
  "life_layer": {
    "cycle_id": "",
    "life_kosha": "",
    "scan_focus": "",
    "life_klesha": null,
    "life_vritti": null,
    "life_goal": null
  },
  "today_layer": {
    "today_kosha": "anandamaya",
    "today_klesha": null
  },
  "cycle_day": 3,
  "entered_via": "dashboard",
  "guidance_mode": "hybrid",
  "locale": "en",
  "user_attention_state": "open_steady",
  "emotional_weight": "light"
}
```

### Response (HTTP 200, live capture)

```json
{
  "moment_id": "M48_joy_room",
  "slots": {
    "opening_line": "Good to sit with you. Something feels settled today.",
    "second_beat_line": "Nothing to chase right now. Let's stay with it.",
    "ready_hint": "Tap when you're ready",
    "offer_intro_text": "A few ways to stay with it, if any land:",
    "pill_chant_label": "Chant for this fullness",
    "pill_offer_label": "Offer it into your day",
    "pill_walk_label": "A quiet 10-minute walk",
    "pill_name_label": "Name what's steady",
    "pill_sit_label": "Sit in it a while",
    "pill_carry_label": "Carry it forward",
    "input_naming_prompt": "What is steady right now?",
    "input_placeholder": "Type here...",
    "input_submit_label": "Submit",
    "input_cancel_label": "Cancel",
    "joy_mantra_item_id": "mantra.peace_calm.om_namah_shivaya",
    "walk_duration_min": "10",
    "wisdom_anchor_line": "Even the good day is held, not grasped.",
    "principle_id": "gita_nishkama_as_celebration",
    "principle_name": "Held, not grasped",
    "chip_dashboard_label": "I'm in a good place"
  },
  "meta": {
    "variant_id": "M48_hybrid_en_baseline",
    "mode_served": "hybrid",
    "locale_served": "en",
    "fallback_used": false,
    "fallback_reason": null,
    "audit_id": "850f032d-e4d9-46b8-9358-6a1437a398df",
    "resolved_in_ms": 0
  },
  "presentation_hints": null
}
```

**Data sufficiency:** all labels + `joy_mantra_item_id` + `walk_duration_min` + `chip_dashboard_label` (M-3 migration verified live) present. FE can render the entire room from this payload alone.

**Fallback behavior:** if `user_attention_state` / `emotional_weight` is empty or invalid, resolver returns `fallback_used: true, fallback_reason: "ctx_invalid:user_attention_state"` with all slot values as empty strings. Sovereignty-strict — FE renders blank pills (hidden) rather than English fallback. Observed during initial probe with empty `user_attention_state`.

---

## STEP 2 — Library search for runner item

Called inside `handleMantraTap()` when user taps the chant pill (`joy_chant_option` testID). FE needs full item details (audio_url, Devanagari, meaning) before dispatching `start_runner`.

### Request

```
GET /api/mitra/library/search/?q=mantra.peace_calm.om_namah_shivaya&itemType=mantra&limit=5
Authorization: Bearer {JWT}
```

### Response (HTTP 200, live capture)

```json
{
  "results": [
    {
      "itemType": "mantra",
      "itemId": "mantra.peace_calm.om_namah_shivaya",
      "title": "Om Namah Shivaya",
      "subtitle": "I bow to the auspicious inner Self...",
      "tags": ["Surrender", "Calm", "Transformation"],
      "beginnerSafe": true,
      "level": "beginner",
      "alreadyInCore": false,
      "alreadyAdded": false,
      "deity": "Shiva",
      "tradition": "Shiva Purana & Tirumantiram",
      "iast": "Om Namah Shivaya",
      "devanagari": "ॐ नमः शिवाय",
      "meaning": "I bow to the auspicious inner Self. Dissolves inner tension, purifies karma, and brings profound peace.",
      "essence": "The five syllables (Na-Maḥ-Śi-Vā-Ya) represent the five elements and five cosmic actions of Shiva. Considered the king of all mantras for liberation.",
      "audio_url": "https://kalpx-website.s3.us-east-2.amazonaws.com/mantras/audio/mantra.health_panchakshara.mp4"
    }
  ],
  "totalCount": 1,
  "query": "mantra.peace_calm.om_namah_shivaya",
  "filters": {"itemType": "mantra", "focus": ""}
}
```

**Data sufficiency:** complete item payload — FE dispatches `start_runner` with `item: { ...mantra, core: mantra }` carrying all fields to CycleTransitionsContainer.

**Failure mode:** if `results: []`, FE logs `"[joy_room] mantra not found in library: {id}"` and silently no-ops — sovereignty-strict (no user-facing error, no English fallback).

---

## STEP 3 — Track completion (the fix is here)

Called by `complete_runner` handler in `actionExecutor.ts` after runner finishes (force_complete OR natural completion).

### Request

```
POST /api/mitra/track-completion/
Authorization: Bearer {JWT}
Content-Type: application/json

{
  "itemType": "mantra",
  "itemId": "mantra.peace_calm.om_namah_shivaya",
  "source": "support_joy",
  "journeyId": null,
  "dayNumber": 3,
  "tz": "Asia/Kolkata",
  "meta": {
    "variant": "mantra",
    "actual_seconds": 42,
    "reps_completed": 27
  }
}
```

### Response — POST-FIX (HTTP 200, live capture)

```json
{
  "status": "ok",
  "itemType": "mantra",
  "itemId": "mantra.peace_calm.om_namah_shivaya",
  "source": "support_joy",
  "metricsToTrack": [],
  "updatedMetrics": {},
  "tracked": true
}
```

### Response — PRE-FIX (historical, HTTP 400)

```json
{"error": "Invalid source"}
```

Pre-fix, FE's `mitraTrackCompletion` try/catch silently swallowed this 400 and returned null. FE navigated to `completion_return` anyway — UX appeared normal, but no `JourneyActivity` row ever got created. Silent data loss.

### DB effect — verified post-fix

Direct query on dev DB after hitting the endpoint once per room:

```
support_growth     mantra  support_growth_mantra_completed     journey=3681 day=2026-04-20
support_joy        mantra  support_joy_mantra_completed        journey=3681 day=2026-04-20
support_loneliness mantra  support_loneliness_mantra_completed journey=3681 day=2026-04-20
support_grief      mantra  support_grief_mantra_completed      journey=3681 day=2026-04-20
```

All 4 room sources persist with distinct `event_name` values (analytics-segmentable).

### Validator still rejects bogus sources

```
POST /api/mitra/track-completion/  {"source":"bogus_source", ...}
→ HTTP 400 {"error":"Invalid source"}
```

---

## STEP 4 — Telemetry events (open / carry / exit)

Non-completion events — room entry, carry_joy_forward, session_ended. Logged via the separate `/track-event/` endpoint.

### 4a. Room entered

```
POST /api/mitra/track-event/
Authorization: Bearer {JWT}
Content-Type: application/json

{
  "eventName": "joy_room_entered",
  "journeyId": null,
  "dayNumber": 3,
  "locale": "en",
  "tz": "Asia/Kolkata",
  "meta": {"parent_source": "dashboard_primary_chip"}
}
```

**Response (HTTP 200):**
```json
{"status": "ok", "eventName": "joy_room_entered", "logged": true}
```

### 4b. Carry joy forward

```json
{
  "eventName": "joy_carried_forward",
  "journeyId": null,
  "dayNumber": 3,
  "locale": "en",
  "tz": "Asia/Kolkata",
  "meta": {"label": "Carry it forward", "captured_at": 1745100000000}
}
```

**Response (HTTP 200):**
```json
{"status": "ok", "eventName": "joy_carried_forward", "logged": true}
```

### 4c. Session ended

```json
{
  "eventName": "joy_session_ended",
  "journeyId": null,
  "dayNumber": 3,
  "locale": "en",
  "tz": "Asia/Kolkata",
  "meta": {
    "duration_sec": 127.4,
    "actions_used": ["chant", "carry_forward"]
  }
}
```

**Response (HTTP 200):**
```json
{"status": "ok", "eventName": "joy_session_ended", "logged": true}
```

---

## Per-room source + moment matrix

Substitute the per-room values into the same 4-step flow:

| Room | Resolve `moment_id` | `start_runner` source | `track-completion` event_name (post-fix) | `track-event` open event |
|---|---|---|---|---|
| Joy | `M48_joy_room` | `support_joy` | `support_joy_{type}_completed` | `joy_room_entered` |
| Grief | `M46_grief_room` | `support_grief` | `support_grief_{type}_completed` | `grief_session_opened` |
| Loneliness | `M47_loneliness_room` | `support_loneliness` | `support_loneliness_{type}_completed` | `loneliness_session_opened` |
| Growth | `M49_growth_room` | `support_growth` | `support_growth_{type}_completed` | `growth_room_entered` |

All 4 sources confirmed HTTP 200 on post-fix dev (live captures above).

---

## Data-sufficiency verdict

| Endpoint | Verdict | Notes |
|---|---|---|
| `POST /content/moments/{id}/resolve/` | ✅ Sufficient | Drives all room labels + runner `item_id`s + chip_dashboard_label (M-3). |
| `GET /library/search/` | ✅ Sufficient | Complete item payload (audio_url, IAST, Devanagari, meaning, essence). |
| `POST /track-completion/` | ✅ Sufficient (post-fix) | All 4 room sources now accepted; distinct event_names; JourneyActivity persists. |
| `POST /track-event/` | ✅ Sufficient | Room lifecycle events log cleanly for authed user. |

**Remaining known issue:** onboarding (pre-login) `track-event` calls return 401 because guest_uuid is null + no refresh token. Parked as `mitra_bug_track_event_401_onboarding.md` for Sprint 2 triage. Does NOT affect post-login room flow.

---

## Change log

- 2026-04-19 — V1. BE commit `6a171ea3` deployed (track-completion ALLOWED_SOURCES + event_name_map + CompanionState hook).
- Depends on prior M-3 commit `04014c67` (chip_dashboard_label ContentPack slot in M48/M49).
