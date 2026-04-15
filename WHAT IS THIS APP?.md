<div align="center">

<h1><span style="color:#c9922a">✦ MITRA APP</span></h1>
<h3><span style="color:#6b3a1f">Complete Screen & Flow Documentation — Phase 3A</span></h3>

<img src="https://img.shields.io/badge/Platform-React%20Native-blue?style=flat-square"/>
<img src="https://img.shields.io/badge/Moments-47-gold?style=flat-square&color=c9922a"/>
<img src="https://img.shields.io/badge/Route%20Screens-14-green?style=flat-square&color=2d6b3a"/>
<img src="https://img.shields.io/badge/E2E%20Flows-102-purple?style=flat-square"/>

</div>

---

## <span style="color:#c9922a">◈ WHAT IS MITRA?</span>

**Mitra** _(Sanskrit: "friend/companion")_ is an AI-powered mobile wellness companion app (React Native, iOS + Android). It draws from Indian traditions — **Ayurveda, Bhagavad Gita, Niti Shastra, Yoga, Panchang** — blended with modern psychological concepts like emotional regulation and relationship pattern tracking.

> **Core idea:** Mitra pays attention to your inner life so you don't have to track it yourself. It notices patterns, surfaces insights, prepares you for difficult moments, and holds space when you're struggling.

---

## <span style="color:#c9922a">◈ THE THREE CORE CONCEPTS</span>

### <span style="color:#1a4a6b">① The Core Triad — Daily Practice</span>

Every user gets **3 personalized items** assigned by AI each day:

| Item         | What It Is                                                      | Example                            |
| ------------ | --------------------------------------------------------------- | ---------------------------------- |
| **Mantra**   | Sanskrit phrase to chant, counted on a bead counter like a mala | _"Om Namah Shivaya"_               |
| **Sankalp**  | Personal intention/promise for the day                          | _"I choose steadiness over speed"_ |
| **Practice** | Timed breathwork or meditation                                  | _"Silent Shield · 3 min"_          |

---

### <span style="color:#1a4a6b">② CompanionState — The App's Brain</span>

A backend model that tracks everything about the user:

```
last_reported_mood    →  triggered / settling / practiced / etc.
volatility            →  0.0 (calm) to 1.0 (crisis)
active_dissonance     →  open conflict/tension threads
preferred_guidance_mode → universal / hybrid / rooted
voice_consent_given   →  boolean
last_seen_at          →  timestamp
```

---

### <span style="color:#1a4a6b">③ Guidance Modes — How Mitra Speaks</span>

| Mode          | Description                      | Example                                                                   |
| ------------- | -------------------------------- | ------------------------------------------------------------------------- |
| **Universal** | Plain modern language            | _"You had a tough conversation. Want to prepare?"_                        |
| **Hybrid**    | Modern + Indian concepts blended | Mixed framing                                                             |
| **Rooted**    | Full Sanskrit/Ayurveda/Niti      | _"Chaturthi tithi today — Ganesh energy. And Sarah is on your calendar."_ |

---

## <span style="color:#c9922a">◈ THE 47 MOMENTS — SURFACE MAP</span>

> **Key engineering insight:** Instead of 47 screens → only **14 route screens** to build. Engineering effort reduced ~60%.

| Surface Type              | Count  | What It Means                              |
| ------------------------- | ------ | ------------------------------------------ |
| `Route Screen`            | **14** | Full standalone screens with their own URL |
| `Embedded Dashboard Card` | **6**  | Cards inside the dashboard scroll          |
| `Modal / Bottom Sheet`    | **8**  | Pop-up sheets over a parent screen         |
| `Transient State`         | **2**  | Temporary UI within a screen (few seconds) |
| `Conversation Moment`     | **6**  | Message turns within onboarding            |
| `External`                | **1**  | Push notification                          |

---

## <span style="color:#c9922a">◈ THE 14 ROUTE SCREENS</span>

---

### <span style="color:#2d6b3a">ROUTE 1 · `/welcome`</span> — Onboarding _(Moments 1–7)_

> A single screen containing a **7-turn conversation**. NOT a form or wizard — a conversation thread that builds on screen.

#### The 7 Turns:

**Turn 1 — Mitra Introduces**

> _"I'm Mitra. I'm here to help you live with more clarity, rhythm, and steadiness..."_

- Chips: `I'd like that` / `I'm returning`

**Turn 2 — Friction Question** _(What area of life needs attention?)_

- `Work needs clarity`
- `A relationship needs attention`
- `My mind needs quiet`
- `I'm navigating something uncertain`
- `My energy is low`
- `I'm searching for who I really am`
- `I want to go deeper spiritually`

**Turn 3 — State Reflection** _(How does it feel right now?)_

- `Activated` · `Drained` · `Foggy` · `Heavy` · `Restless` · `Actually clear but a lot to hold`

**Turn 4 — Voice/Text Fork**

> Mitra acknowledges state in **one word** ("Activated." / "Heavy.") then asks: Speak or write?

- ⚠️ If voice chosen → **Voice Consent overlay (Moment 38) fires first**

**Turn 5 — Guidance Mode**

> Sets `preferred_guidance_mode` for ALL future interactions

- `Keep it simple and modern` · `I'm drawn to the deeper roots` · `A blend`

**Turn 6 — First Recognition** _(the gift moment)_

> Calls `POST /api/mitra/generate-companion/` → Mitra returns a **personalized message** referencing exact friction + state:
> _"Your busy mind is real — and the heaviness you're in is the body's honest response to it."_

**Turn 7 — Path Emerges**

> Mitra reveals the Core Triad in conversational sentences.
> User taps **"I'm ready"** → navigates to dashboard.

#### Key UI Rules:

- Prior turns **fade/shrink** at top as conversation progresses
- User replies = **right-aligned cream bubbles**
- Mitra messages = **gold left border**
- 3 small gold dots at top (subtle progress)
- If abandoned mid-flow → **resumes at same turn for 7 days**, then resets

---

### <span style="color:#2d6b3a">ROUTE 2 · `/companion/day-active`</span> — Dashboard _(Moments 8–15, 40, 41, 43)_

> **THE main screen.** 11 variants of ONE screen — variant chosen automatically based on context.

#### The 11 Variants:

| Variant ID                    | When                           | Opening                                                                     |
| ----------------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| `morning_good_yesterday`      | Morning, yesterday complete    | _"Good morning. You're in a rhythm now..."_                                 |
| `morning_triggered_yesterday` | Morning, yesterday had trigger | _"I remember yesterday. You came to me activated..."_                       |
| `morning_incomplete_practice` | Morning, practice skipped      | _"Morning. Yesterday you anchored with the mantra. The rest waited..."_     |
| `morning_pattern_day`         | Morning, recurring pattern day | _"It's Tuesday. I've noticed a pattern..."_                                 |
| `return_after_absence`        | Back after 3+ days             | _"Welcome back. It's been five days..."_                                    |
| `evening_practice_done`       | Evening, complete              | _"Your day is closing. You lived your full path..."_                        |
| `evening_practice_not_done`   | Evening, incomplete            | _"The day moved fast. The practice waited..."_                              |
| `late_night`                  | After 10pm                     | _"It's late. If something is alive in you, I'm here..."_                    |
| `transition_day`              | Emotionally shifting           | _"Something is shifting. Today isn't heavy — but it isn't clear either..."_ |
| `festival_today`              | Hindu festival/Ekadashi        | _"Today is Ekadashi. A lighter day..."_                                     |
| `clear_window_expansive`      | Multiple good days             | _"Today is open. You've earned this space..."_                              |

#### Dashboard Layout (top → bottom):

```
┌─ DayTypeHeader (STICKY) ──────────────────────────────┐
│  "Today looks clear"  ·  sub-header  ·  [Clear Window]│
├─ ContinuityCard (CONDITIONAL) ────────────────────────┤
│  ▌ Mitra's opening message (variant-based)             │
│  ▌ [Reply chip 1]  [Reply chip 2]                      │
├─ MorningBriefingCard (MORNING ONLY) ──────────────────┤
│  (●)  Your briefing is ready  · [Why this today?]      │
├─ CoreTriadSection ─────────────────────────────────────┤
│  ○ 1/3 progress ring                                   │
│  MANTRA · Om Namah Shivaya · [Why this?]  ✓           │
│  SANKALP · I choose steadiness  · [Why this?]  ○       │
│  PRACTICE · Silent Shield 3min · [Why this?]  ○        │
├─ DashboardInlineCards (0–4 cards, priority ordered) ───┤
│  PostConflictGentlenessCard  ← highest priority        │
│  PredictiveAlertCard (high urgency)                    │
│  SeasonChangeBanner                                    │
│  ResilienceNarrativeCard                               │
│  GratitudeCard                                         │
│  RecommendedAdditionalCard  ← lowest priority          │
├─ SupportEntryRow ──────────────────────────────────────┤
│  I feel triggered  ·  Quick check-in                   │
├─ VoiceNoteEntry ───────────────────────────────────────┤
│  [mic]  Record a note                                  │
└────────────────────────────────────────────────────────┘
┌─ GlobalInput (ALWAYS STICKY AT BOTTOM) ───────────────┐
│  How can I help you?                    [mic]  [send]  │
└────────────────────────────────────────────────────────┘
```

#### APIs Called on Load (in parallel):

```
POST  /api/mitra/generate-companion/      ← main data call
GET   /api/mitra/companion-state/
GET   /api/mitra/briefing/today/
GET   /api/mitra/predictive/alerts/
GET   /api/mitra/recommended-additional/
GET   /api/mitra/resilience-ledger/
GET   /api/mitra/journey/additional/list/
```

> **Late Night variant:** No briefing, no alerts, large centered mic, placeholder → _"What's on your mind?"_
> **Festival variant:** Gold mandala accent replaces day header.

---

### <span style="color:#2d6b3a">ROUTE 3 · `/practice/mantra`</span> — Mantra Runner _(Moment 17)_

> Full-screen immersive bead counter. **The phone becomes a mala.** NO conversation during this screen.

#### UI:

- Background: `#1a1a1a` (dark)
- Large gold count number — **72px Piazzolla font** at center
- Small `"of 27"` below in muted cream
- **Entire screen tappable** — each tap increments count
- Each tap: gold pulse + haptic feedback
- Thin circular progress ring fills clockwise

#### Rep Options: `1` · `9` · `27` · `54` · `108`

#### Back Button Behavior:

- Count = 0 → silent exit, no confirmation
- Count > 0 → confirmation sheet: _"You've done {count} of {target}. That still counts."_

> **On completion:** Gold bloom animation (800ms) → Completion Return transient (Moment 32)

---

### <span style="color:#2d6b3a">ROUTE 4 · `/practice/sankalp`</span> — Sankalp Hold _(Moment 18)_

> Immersive screen to **hold your intention**. Not a counter — a contemplative hold. Same dark/gold visual family as Mantra Runner. No conversation during the hold.

---

### <span style="color:#2d6b3a">ROUTE 5 · `/practice/timer`</span> — Practice Timer _(Moment 19)_

> Countdown/count-up timer for breathwork or meditation (e.g., _"Silent Shield · 3 min"_). Same dark immersive visual family. Gold timer display.
> Completion → Moment 32 transient return.

---

### <span style="color:#2d6b3a">ROUTE 6 · `/support/trigger`</span> — Trigger Support _(Moments 20 + 42)_

> Crisis regulation flow. **NOT therapy. NOT strategy. Pure regulation.** 3 sequential steps.

#### Step 1 — OM Practice:

- Background darkens to `#1a1a1a`
- Large gold **OM (ॐ)** at center with soft glow + concentric circles
- OM audio rotates: `Om.mp4` → `Om Shanti.mp4` → `Hari Om.mp4`
- Calming music underneath
- Mitra: _"I'm here. Don't explain it yet. Let's bring the charge down first."_
- Question: _"How do you feel now?"_
- Chips: `I feel calmer now` / `I'm still feeling it` / `Words are too loud`
- Voice input: _"Tell me what happened"_ (up to 3 min recording)

#### <span style="color:#8b1a1a">⚡ Sound Bridge — Transient State (Moment 42)</span>

> Activated when: user taps _"Words are too loud"_ OR stays 3+ min without resolution OR extreme activation detected.

- Background: `#0a0a0a` (deepest dark — even darker than Step 1)
- Screen **empties completely**
- Single gold horizontal waveform undulates slowly
- Tiny text: _"Hum with me"_
- **NO buttons. NO choices. NO input.** Pure non-verbal.
- Single-tone humming audio loop (60–90 sec, seamless)
- After 2–3 min or any tap → returns to Step 1

#### Step 2 — Support Mantra _(if "I'm still feeling it")_:

- Bead counter appears (same visual as Mantra Runner)
- ⚠️ **DIFFERENT mantra** from core triad — chosen by `trigger-mantras` endpoint
- No forced rep count — tap freely

#### Step 3 — Resolution:

> _"You came through that. The charge is down. Your system will take a little time to fully reset. Be gentle with what's next. I'm here if it rises again."_

- `Return to Mitra Home` gold pill → dashboard with resolution toast
- CompanionState: `last_reported_mood: "settling"`, volatility recalculated ↓

> **Abandonment:** If backgrounded >15 min → treated as abandonment. DissonanceThread stays **open/unresolved**.

---

### <span style="color:#2d6b3a">ROUTE 7 · `/support/checkin-regulation`</span> — Check-In Regulation _(Moment 21)_

> Same visual family as Trigger Support but for **moderate activation** — not full crisis.

**Entry path:** `Quick check-in` → prana selector → `Agitated` or `Drained` → this route
_(If `Balanced` → Moment 22 balanced ack sheet instead)_

#### Key Differences from Trigger:

|                   | Trigger                          | Check-In                                    |
| ----------------- | -------------------------------- | ------------------------------------------- |
| Opening           | _"Don't explain it yet..."_      | _"Let's not try to figure anything out..."_ |
| Step 2 chip       | `I'm still feeling it`           | `Try another way`                           |
| Input placeholder | _"Tell me what happened"_ (past) | _"Tell me what's going on"_ (present)       |
| Resolution        | _"You came through that."_       | _"You settled. That matters."_              |

---

### <span style="color:#2d6b3a">ROUTE 8 · `/reflection/weekly`</span> — Weekly Reflection Letter _(Moments 23 + 26)_

> A full dedicated reading screen. **Like receiving a letter from a thoughtful friend.** NOT a dashboard card.

**Before letter loads:** _"Can I show you something from this week?"_ → `Show me` / `Later`

#### Letter Structure — 5 Sections:

| Label             | Content                                                                               |
| ----------------- | ------------------------------------------------------------------------------------- |
| `WHAT I NOTICED`  | Specific weekly observations (practice completion, mood patterns)                     |
| `WHAT HELPED`     | What worked: _"You used the mantra before the meeting, not after. That's the shift."_ |
| `A PATTERN`       | Recurring patterns: _"Work pressure keeps appearing on Tuesdays."_                    |
| `WHAT'S GROWING`  | Resilience Narrative — entity growth tracking (Moment 26 embedded)                    |
| `LOOKING FORWARD` | 1–2 specific recommendations for next week                                            |

**Audio option:** Gold play button → _"Listen to this letter"_ (Mitra reads aloud)

**Loading state:** _"Let me sit with your week for a moment..."_ — gold breathing animation, polls every 2 sec up to 30 sec.

---

### <span style="color:#2d6b3a">ROUTE 9 · `/checkpoint/day-7`</span> — Day 7 Checkpoint _(Moment 24)_

> Milestone review at end of first 7-day cycle. **6 internal steps** (NOT separate routes).

1. **Intro** → _"You've been with me for a week now. Can I show you what I've seen?"_
2. **Journey Grid** → 7 gold dots (filled / half / empty per day)
3. **What Grew** → optional patterns section
4. **Reflection Input** → _"What do you want to carry into next week?"_ + mic
5. **Decision:**
   - `Continue my path` _(gold, primary)_
   - `Lighten it` _(outlined)_
   - `Start fresh` _(text link)_
6. **Confirmation** based on choice

---

### <span style="color:#2d6b3a">ROUTE 10 · `/checkpoint/day-14`</span> — Day 14 Checkpoint _(Moment 25)_

> More ceremonial than Day 7. **The cycle evolution point.**

Same 6-step structure but richer:

- 14-dot grid in **2 rows of 7**
- More entity references in growth section
- Reflection input up to **1500 chars**
- Evolution options:
  - `Continue the same path`
  - `Deepen my practice` _(adds new item to triad)_
  - `Change my focus` _(new cycle begins)_

---

### <span style="color:#2d6b3a">ROUTE 11 · `/reflection/evening`</span> — Evening Reflection _(Moment 34)_

> Mitra and user sit together at end of day. **Voice-primary** (mic is prominent and centered).

**Mitra opens with 3 data-driven observations:**

1. _"You started with the mantra this morning. The first hour was different — steadier, less reactive."_
2. _"That 3pm window got tight again. The pattern is real. But you recovered faster than last week."_
3. _"You came back this evening. Not because you had to. Because this matters to you. That's the shift."_

**Invitation:** _"What was today like for you? The good and the hard — whatever comes."_

**Mitra's acks:**

- After voice → _"I heard that. Rest well. I'll carry it with me into tomorrow's briefing."_
- After text → _"Thank you for naming that. Sleep is easier when something heavy has been set down."_
- Quick chip `Today was fine` → _"Good. A fine day is worth noticing. Rest well."_

---

### <span style="color:#2d6b3a">ROUTE 12 · `/support/grief`</span> — Grief Support _(Moment 46)_

> **A slow room.** Dedicated space — not an overlay. No dashboard chrome. No X icon.

**Visual:** Deep cream `#f4ead4` · Generous whitespace · Linguistic exit only

**Mitra:** _"You don't have to say anything yet. I'm here. We can sit."_

**After 30 sec:** _"Would a slow breath help right now? Or would you rather stay quiet together?"_

**4 options fade in (equal weight — no gold primary):**

- `Breathe slow with me` → 9-min breath timer, extended exhale
- `I want to speak` → voice note, up to 5 min, _"Say whatever needs saying"_
- `A mantra for holding grief` → grief-specific mantra runner
- `Just sit` → stays on screen, ambient dot breathes slowly, no pressure

**Exit:** `I'll go now` (linguistic, at bottom) · System back → _"Leave this space?"_ confirmation

> ❌ NO stages of grief · NO advice · NO cheerfulness · NO silver linings · NO timeline

---

### <span style="color:#2d6b3a">ROUTE 13 · `/support/loneliness`</span> — Loneliness Support _(Moment 47)_

> **A companioned pause.** Not a fix. Visual: warm cream `#fdf6e7`

**Mitra:** _"Loneliness is heavy. I'm here with you. Not to fix it — just to share the minute."_

**5 options — ALL equal weight (no primary button):**

- `Name it with me` → _"Where does it sit in the body?"_
- `Bhakti mantra` → devotional mantra runner
- `A short chant together` → 11-rep chant, Mitra's voice alongside user's
- `Reach out to one person` → _"Who comes to mind?"_ (NO auto-dial — completely in-app)
- `Walk outside 10 minutes` → timer with background persistence + chime notification on return

> ❌ Never tells user to "call someone" · Never implies loneliness is a problem to solve

---

## <span style="color:#c9922a">◈ THE 6 EMBEDDED DASHBOARD CARDS</span>

_Cards within the dashboard scroll — not separate screens._

---

### <span style="color:#6b2d6b">CARD · Predictive Alert</span> _(Moment 28)_

**Triggers when:** Entity has rising `friction_trend` + upcoming context detected · Confidence ≥ **0.6**

**Looks like:** Gold label `HEADS UP ⚡` · Entity + when phrase · Evidence in muted text

**Buttons:** `Help me prepare` → Prep Coaching overlay · `Not this time` → dismiss · Overflow: `Mute alerts for Sarah`

> **Suppressed** if volatility ≥ 0.7 (user already dysregulated — don't add load) · Max 2/day

---

### <span style="color:#6b2d6b">CARD · Recommended Additional</span> _(Moment 30)_

**Triggers when:** Core practice complete + volatility < 0.6 + not shown today

**Looks like:** Label `IF YOU HAVE SIX MIN.` · Duration upfront · Concrete benefit stated

**Buttons:** `Begin` / `Not now`

> ⚠️ **Critical rule:** Completing this does **NOT** count as core practice. Source tracked separately as `additional_recommended`.

---

### <span style="color:#6b2d6b">CARD · Post-Conflict Gentleness</span> _(Moment 39)_

**Triggers when:** Morning after trigger event + entity mention + volatility spike (last 18 hrs) · Appears at **TOP**, displaces other cards

**Copy:** _"Yesterday was hard. I saw your system heat up after the Sarah conversation. You don't need to fix anything today. Just start gentle. I'm with you."_

**Buttons:** `Start gentle` · `Talk about it` · `I'm okay`

> ❌ No debrief · No lessons learned · No push to reconcile · A hand on the shoulder
> Auto-resolves if not engaged for **3 days** (DissonanceThread goes stale)

---

### <span style="color:#6b2d6b">CARD · Resilience Narrative</span> _(Moment 26)_

**Triggers:** Weekly (Sunday evening or Monday morning) · Journey ≥ 7 days old · Also always embedded in Weekly Reflection Letter

**Label:** `THIS WEEK` · Cormorant serif headline · Body prose — what was hard and what held · Closing: _"I'm keeping track so you don't have to."_

**Buttons:** `Thanks for noticing` · `What helped most?` · `Not now`

> ❌ Never uses metrics, streak counts, or minute totals · Never compares to prior weeks

---

### <span style="color:#6b2d6b">CARD · Gratitude / Joy</span> _(Moment 45)_

**Triggers:** 3+ consecutive steady mornings · festival day · positive voice note · meaningful cycle complete

**Label:** `✦ NOTICING` · Amber buttons (not gold — visually distinct)

**Buttons:** `Name one thing` → 120-char inline input · `Just noticing with me` · `Not today`

**Precedence:** Festival > self-declared > steady streak > joy note > cycle complete

> ❌ NOT a celebration · NOT a streak badge · NOT confetti · A warm noticing · No exclamations · No emoji

---

### <span style="color:#6b2d6b">CARD · Season Change Banner</span> _(Moment 44)_

**Triggers:** First day of new Ritu (Ayurvedic season — **6 per year**) · Slim banner at TOP of dashboard

**Collapsed:** ~60px · `◐ Sharad begins · Autumn ›`

**Expanded:** 2–3 calibrations (e.g., _"Lighter food this week," "Earlier sleep," "Morning practice, slower"_) · `Got it` dismisses for whole season

**Auto-collapses:** After 7 days if not acknowledged · **Suppressed** if post-conflict card active

---

## <span style="color:#c9922a">◈ THE 8 MODAL / BOTTOM SHEET OVERLAYS</span>

_Sheets that rise over a parent screen — no navigation taken._

---

### <span style="color:#1a4a6b">OVERLAY · Info Reveal</span> _(Moment 16)_

**Triggered by:** Tapping any Triad card from dashboard
**Shows:** Full practice detail · description · why it was chosen · how to do it · `Begin` button · `Why this?` link → L2

---

### <span style="color:#1a4a6b">OVERLAY · Balanced Check-in Ack</span> _(Moment 22)_

**Triggered by:** `Quick check-in` → prana selector → `Balanced`
**Shows:** Simple gentle acknowledgment. No full route needed. Sheet dismisses.

---

### <span style="color:#1a4a6b">OVERLAY · Prep Coaching</span> _(Moment 27)_

**Triggered by:** `Help me prepare` from alert card, or intent router detecting upcoming conversation

**Contains:**

- `strategy_line` — core coaching (_"Lower your voice slightly. Let her finish before you respond."_)
- `grounding_action` — one concrete thing to do right now
- `Anything else I should know?` → expands DO / DON'T frames
- Optional input: _"What specifically worries you?"_ + mic
- `Got it` gold pill at bottom

> ❌ Not a script · Not a multi-step plan · Not therapy · A 60-second heads-up from a wise friend

---

### <span style="color:#1a4a6b">OVERLAY · Entity Recognition</span> _(Moment 29)_

**Triggered by:** Person mentioned 3+ times across 2+ contexts

**Asks:** _"I've heard you mention Sarah a few times this week — in check-ins and once in a voice note. Is she someone I should remember so I can help you prepare when she comes up?"_

**Replies:** `Yes, remember her` → confirmed + optional relation note · `Not important` → dismissed · `Ask me later` → snoozed 7 days

> Tone: **Not surveillance. Not "tracking." Permission-seeking. Memory for service.**

---

### <span style="color:#1a4a6b">OVERLAY · Voice Note</span> _(Moment 31)_

**Triggered by:** Mic icon anywhere in app
**Shows:** Bottom sheet recorder · Gold waveform · Auto-transcription · Audio discarded within 24 hrs · Text stored in journal

> ⚠️ First use → Voice Consent overlay fires first (Moment 38)

---

### <span style="color:#1a4a6b">OVERLAY · Voice Consent</span> _(Moment 38)_

**Triggered by:** First time user tries the mic anywhere

**Mitra says:** _"Before we start — your voice stays private. I transcribe what you say to text, then the audio is discarded within 24 hours. The text lives in your journal only. I never share voice data. Ready to record?"_

**Replies:** `I'm ready` (granted, never shown again) · `Keep using text` (decline, re-asks next explicit voice attempt)

> ❌ Not a legal ToS popup · Not a scary data warning · Mitra assuring trust in its own voice

---

### <span style="color:#1a4a6b">OVERLAY · Why-This Level 2</span> _(Moment 36)_

**Triggered by:** Any _"Why this?"_ or principle hint link

**Shows:**

- `principle_name` — Sanskrit + English
- `one_liner` — the rule in ≤100 chars (e.g., _"Sama before Bheda."_)
- `plain_explanation` — 120–280 chars, why it works in daily life
- `origin_note` — Niti / Gita / Ayurveda / etc.
- `Read the source` link → opens L3

> Plain language first · Sanskrit appears once, not repeated · Never lectures

---

### <span style="color:#1a4a6b">OVERLAY · Why-This Level 3</span> _(Moment 37)_

**Triggered by:** `Read the source` from L2

**Shows:**

- Source citation (e.g., _"Vidura Niti · 1.74"_)
- Sanskrit verse in Devanagari (if available)
- IAST transliteration (always present)
- Faithful English translation
- Brief context note
- `Copy citation` button

---

## <span style="color:#c9922a">◈ THE 2 TRANSIENT STATES</span>

---

### <span style="color:#8b1a1a">TRANSIENT · Completion Return</span> _(Moment 32)_

**Parent:** Mantra Runner / Sankalp Hold / Practice Timer

**What happens:** Dark runner background warms → thin gold check animation draws (800ms) → Mitra's message fades in.

| Practice | Mitra says                                                                                                                               |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Mantra   | _"That's 27. You stayed with the sound. That's not repetition — it's building a home inside yourself that the noise can't reach."_       |
| Sankalp  | _"You held your intention. Every time you do that, it becomes less of a promise and more of who you are."_                               |
| Practice | _"Three minutes of stillness. Your body will carry this long after your mind moves on. That's how sadhana works — quietly, underneath."_ |

- Optional: _"How did that feel?"_ input + mic
- **Auto-returns to dashboard after 10 seconds** if no interaction
- `Repeat` available as subtle text link

> ❌ Stats are NEVER shown · No "You did 27 reps in 3:42!" · No confetti · No trophies

---

### <span style="color:#8b1a1a">TRANSIENT · Sound Bridge</span> _(Moment 42)_

**Parent:** Trigger Support or Check-in Regulation

> The most powerful moment in the emotional regulation flow — **when words step aside and pure sound takes over.**

See full description under Route 6 (Trigger Support — Step 1).

---

## <span style="color:#c9922a">◈ THE VISUAL DESIGN SYSTEM</span>

| Element                       | Value                                         |
| ----------------------------- | --------------------------------------------- |
| **Background (standard)**     | `#fffdf9` — cream                             |
| **Background (grief)**        | `#f4ead4` — deeper cream                      |
| **Background (loneliness)**   | `#fdf6e7` — warm cream                        |
| **Background (runners)**      | `#1a1a1a` — dark                              |
| **Background (sound bridge)** | `#0a0a0a` — deepest dark                      |
| **Primary accent**            | `#c9922a` — gold / gold gradient              |
| **Text primary**              | `#432104` — deep brown                        |
| **Serif font**                | Cormorant Garamond — Mitra's voice, headlines |
| **Sans-serif font**           | Inter — body text, UI labels                  |
| **Micro-labels**              | Uppercase · 11px · letter-spaced · gold       |
| **Card border accent**        | 2–3px gold left border                        |
| **Border radius**             | 16px standard · 20px for important cards      |
| **Touch targets**             | Minimum **44×44px** everywhere                |
| **Progress ring**             | Thin, gold, fills clockwise                   |

---

## <span style="color:#c9922a">◈ BACKEND INTELLIGENCE LAYER</span>

| System                            | Role                                                                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **CompanionState**                | Central model — mood, volatility, dissonance threads, entities, preferences                                                  |
| **LifeLedgerEntity**              | Tracks people mentioned. States: `provisional` → `confirmed` / `dismissed` / `muted`. Has `friction_trend` + `mention_count` |
| **DissonanceThread**              | Tracks unresolved conflicts. Types: `trigger` / `grief` / `loss`                                                             |
| **TextInterpreter** _(Phase 1.5)_ | Processes free-form text/voice to update CompanionState, detect entities, identify intent                                    |
| **IntentRouter** _(Phase 1.5)_    | Routes dashboard free-form input to correct screen (e.g., _"I'm triggered"_ → trigger route)                                 |
| **Panchang integration**          | Real Hindu calendar data (tithi, Ritu, festivals) to customize content                                                       |
| **generate-companion API**        | Main intelligence call → produces daily triad based on focus, state, day number, guidance mode                               |

---

## <span style="color:#c9922a">◈ ENGINEERING ARCHITECTURE</span>

**Stack:** React Native · `kalpx-app-rn` · Branch: `pavani`

#### Key Files:

| File                           | What It Is                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| `allContainers.js`             | 6585 lines — all screen schemas live here                                                                    |
| `src/engine/BlockRenderer.tsx` | Maps `block_type` → React component. Every new block needs 3 additions: import + blockMap + selfActionBlocks |
| `src/engine/actionExecutor.ts` | 4000+ lines, one giant switch statement for all actions                                                      |
| `src/engine/mitraApi.ts`       | 15+ API wrappers — all return `null` on 404 (cards hide gracefully)                                          |

#### New Redux Slices:

`companionStateSlice` · `preferencesSlice` · `notificationsSlice`

---

> ⚠️ **Critical Engineering Rule:**
> Never call `track_completion` directly. Always go through `start_runner` with explicit `source`:
> `core` / `additional_recommended` / `support_trigger` / `support_checkin`
> Enforced at line ~3152 of `actionExecutor.ts`. Violating this breaks completion tracking.

---

> ⚠️ **Feature Flags:**
> Phase 1.5 features behind flags intentionally OFF. Backend must flip:
> `MITRA_V3_POST_CONFLICT` · `MITRA_V3_JOY_SIGNAL` · `MITRA_V3_ENTITY_RECOGNITION` etc.

---

> 🐛 **"Unknown block: X" error** = `block_type` not registered in `BlockRenderer` blockMap.
> Fix: add import + map entry.

---

#### Testing:

**102 Maestro E2E flows.** 4 critical smoke flows:

```bash
maestro test .maestro/onboarding-full-flow.yaml
maestro test .maestro/dashboard-variants.yaml
maestro test .maestro/mantra-runner-complete.yaml
maestro test .maestro/runner-source-isolation.yaml
```

---

## <span style="color:#c9922a">◈ THE COMPLETE USER JOURNEY</span>

```
Day 1
└── Cold launch → /welcome (7-turn conversation) → Core Triad assigned → Dashboard

Daily Morning
└── Dashboard (variant) → ContinuityCard → MantraCard → Info Reveal → Mantra Runner
    → Completion Return → Dashboard → Sankalp → Practice → 3/3 ring complete ✓

During Day (if triggered)
└── "I feel triggered" → /support/trigger → OM practice
    → [if needed] Sound Bridge → [if needed] Support Mantra → Resolution → Dashboard

Evening
└── Dashboard (evening variant) → /reflection/evening → Mitra's 3 observations
    → User speaks/types → Mitra acknowledges → Rest

End of Week 1
└── /checkpoint/day-7 → Journey grid → What grew → Continue / Lighten / Fresh

End of Week 2
└── /checkpoint/day-14 → More ceremonial → Continue / Deepen / Change focus

When difficult person emerges
└── Entity Recognition overlay (Moment 29) → Entity confirmed
    → Predictive Alert card → "Help me prepare" → Prep Coaching
    → If went badly → next morning: Post-Conflict Gentleness Card

When feeling low
└── "Grief" / "Loneliness" entry → /support/grief or /support/loneliness
    → Unhurried, companioned presence

Weekly
└── /reflection/weekly → Letter from Mitra → Resilience Narrative embedded
    → Also shown as dashboard card (once/week)

Seasonally (6x/year)
└── Season Change Banner → First day of new Ritu → Expanded calibrations → "Got it"
```

---

<div align="center">
<sub><span style="color:#9c6040">Mitra v3 · Phase 3A Screen Specs · 47 Moments · 14 Routes · 31 Spec Files</span></sub>
</div>
