# Track 2 — Detailed Plan (DRAFT for founder review)

**Parent RFC:** `SANATAN_COMPANION_EXPANSION_V1.md`
**Track 1 status:** shipped (kalpx dev `9c659985`, kalpx-app-rn pavani `f4460f0`)
**Date:** 2026-04-18
**Status:** DRAFT — needs founder review before any Track 2 work starts

Scope: **voice/text answering loop + onboarding joy-path expansion + self-learning hookup.** All three were explicitly parked from Track 1 per founder review ("the voice-input part especially is large enough to deserve its own RFC and contract").

---

## 0. Why Track 2 exists

Three gaps remain after Track 1:

1. **The silent void.** Every text/voice input in the app (dashboard "How can I help you?", grief "I want to speak", loneliness "Name it with me", growth "Journal what's open", completion reflection) dispatches `voice_input_send` — which has **no backend handler**. Users type into nothing. This is the single biggest failure mode the app has.

2. **Onboarding is deficit-framed.** Per `mitra_onboarding_joy_inclusion.md` (parked 2026-04-15), Turn 2/3 chips are 100% struggle-coded. A user entering in joy cannot authentically onboard. Track 1 fixed the post-onboarding dashboard; Track 2 fixes the onboarding funnel itself.

3. **No self-learning.** Track 0.5 selector is deterministic — no way for Mitra to learn which wisdom resonates with which user. Eventually needed for per-user variant rotation, snippet promotion, and principle-familiarity tracking.

These are 3 distinct features. Track 2 **does not bundle them** — each is independently scoped below so you can approve / defer / reject per item.

---

## 1. Principle: still deterministic, still no LLM in the core

Track 2 inherits Track 0.5's locked invariants:
- No LLM selection or generation inside core (selector, classifier, orchestrator)
- No multi-turn conversation memory beyond declared-empty `ConversationMemory` in V1
- Deterministic first; Sanatan integrity over cleverness
- Preserve provenance — every rendered line traceable to an approved source

LLM-adjacent work (Phase 2C onwards) is **explicitly gated** — see §5.

---

## 2. Phase 2A — Voice/text answering loop (the biggest unblock)

### 2A.0 The goal in one line
Every text/voice submit produces a response — mirror line + optional wisdom anchor + optional suggested action. Default surface behavior: grief/loneliness/joy get **quiet-ack only**; dashboard + growth room get **visible reply card**. Zero LLM.

### 2A.1 New endpoint
```
POST /api/mitra/voice-input/
Content-Type: application/json
Authorization: Bearer <token> OR X-Guest-UUID: <uuid>
```

**Request body:**
```json
{
  "text": "I don't know if I should take this job",
  "input_type": "text" | "voice",
  "context": {
    "surface": "dashboard" | "grief_room" | "loneliness_room" | "joy_room" | "growth_room" | "completion_reflection",
    "journey_id": "uuid-or-null",
    "session_id": "uuid",
    "runner_source": "core" | "support_*" | null,
    "guidance_mode": "universal" | "hybrid" | "rooted",
    "today_kosha": "vijnanamaya",
    "today_klesha": "asmita",
    "locale": "en",
    "user_readiness_level": "L0" | "L1" | "L2" | "L3" | "L4"
  }
}
```

**Response:**
```json
{
  "ok": true,
  "classification": "seeking_purpose" | "in_grief" | "celebrating" | "asking_question" | "unclear",
  "mirror_line": "That uncertainty is heavy to carry alone.",
  "wisdom_anchor_line": "Your dharma — imperfectly walked — is stronger than another's perfectly performed.",
  "wisdom_anchor_principle_id": "gita_swadharma",
  "suggested_action": {
    "type": "enter_growth_room" | "enter_grief_room" | null,
    "label": "Sit with this in the growth room"
  },
  "log_id": "vi_7fab",
  "telemetry": { "classifier_hits": ["uncertainty", "decision_weight"], "latency_ms": 4 }
}
```

### 2A.2 Classifier — rule-based, NO LLM in Phase 2A
Intent buckets (7 total):
- `in_grief` — tokens: "grief, loss, died, gone, miss, miss them, can't let go, broken, empty"
- `lonely` — tokens: "alone, no one, nobody, isolated, left out, forgotten, disconnected"
- `triggered` — tokens: "triggered, activated, overwhelmed, panicking, spiraling, flooded"
- `celebrating` — tokens: "good day, grateful, happy, wonderful, settled, peaceful, content"
- `seeking_purpose` — tokens: "what should I, which path, meaning, purpose, direction, career, dharma"
- `asking_question` — tokens: opens with "who/what/when/where/why/how/should/can/do"
- `unclear` — fallback for no-match

Matcher: regex + token-frequency scoring. ~150 LOC. Deterministic. Entire classifier is one Python file.

### 2A.3 Response generator — NO LLM
Given `(classification, surface, guidance_mode, readiness_level)`:
1. **Mirror line:** select from authored `mirror_lines_{classification}.yaml` pool. Soft 5-10 lines per classification × 3 modes = ~150 authored mirror lines total.
2. **Wisdom anchor:** call Track 0.5's `pick_wisdom(input)` with `interaction_type=visible_reply` + state_family derived from classification. Returns a principle + line or `ok=false`.
3. **Suggested action:** deterministic map of classification → action:
   - `in_grief` → `{type: enter_grief_room, label: "Sit with me in the grief room"}`
   - `lonely` → `{type: enter_loneliness_room, label: "Quiet company, if it helps"}`
   - `celebrating` → `{type: enter_joy_room, label: "Sit with what's steady"}`
   - `seeking_purpose` → `{type: enter_growth_room, label: "Bring this to the growth room"}`
   - `triggered` → `{type: initiate_trigger, label: "Let's steady first"}`
   - others → `null`

### 2A.4 Surface-specific render rules (hard)

| Surface | Render pattern | Visible reply? |
|---|---|---|
| Dashboard "How can I help?" | mirror + wisdom_anchor + CTA | **Yes** — full card |
| Grief Room typed input | mirror_line only (≤40 chars, minimal) | **No — quiet ack only** |
| Loneliness Room typed input | same as grief | **No — quiet ack only** |
| Joy Room typed input | same as grief | **No — quiet ack only** |
| Growth Room typed input + inquiry journal | mirror + wisdom_anchor + CTA | **Yes** — full card (the one support-room exception) |
| Completion reflection | silent store to `JourneyReflection` table | **No — no render** |

"Do not chatter in sacred rooms" — quiet_ack for grief/loneliness/joy is mandatory. Locked.

### 2A.5 Storage
- Every call creates a `VoiceInputLog` row: `{log_id, user_id, surface, text (hashed for privacy), classification, classifier_hits, response_sent, timestamp}`
- Full text ONLY stored when user is authenticated + journey has voice-opt-in flag
- Guest (`X-Guest-UUID`) users: text hashed, metadata-only stored
- 30-day TTL on stored text (purge task)

### 2A.6 Voice transcription (deferred to Phase 2B)
Phase 2A = text only. For `input_type=voice`, client transcribes on-device (expo-speech) and sends text to endpoint. **No server-side STT in 2A.** This keeps privacy/cost/latency low. Phase 2B adds server-side transcription if on-device accuracy proves insufficient.

### 2A.7 Effort estimate
| Work | Days |
|---|---|
| Backend `voice-input/` endpoint + classifier + response generator | 4d |
| Authoring ~150 mirror lines × 3 modes (founder + agent) | 2d founder + 1d agent |
| `VoiceInputLog` model + Alembic migration | 0.5d |
| Response renderer in RN: `visible_reply` card block + quiet_ack integration in grief/loneliness/joy/growth rooms + dashboard | 3d |
| `wisdom_pick` integration inside classifier response flow | 0.5d |
| Privacy review: hashing policy, TTL purge task, opt-in flag | 1d |
| Tests (45 classifier fixtures + 8 response shape tests) | 1d |
| Dev smoke | 0.5d |
| **Total Phase 2A** | **~11-13 days** |

### 2A.8 Founder decisions needed for Phase 2A
1. Approve the 7 intent buckets above — confirm or add/remove
2. Approve the classification → action map — confirm or revise
3. Confirm quiet-ack list (grief/loneliness/joy) vs visible-reply list (dashboard, growth) — any changes?
4. Text-storage policy — hash-only for guests; full-text for authed. OK?
5. 30-day TTL acceptable?
6. Voice input Phase 2A = on-device STT only — OK to defer server-side?
7. Mirror line authoring — founder-reviewed or agent-drafted + founder-approved?

---

## 3. Phase 2B — Voice input polish (optional; ship only if 2A has real user traction)

Additions on top of 2A:
- Server-side transcription via Whisper API (gated; default off) — for devices where on-device STT is unreliable
- Voice-response playback via TTS for the mirror line (ElevenLabs or on-device) — gated; off for V1
- Multi-turn thread persistence (light): `ConversationMemory.turn_count` + `last_asset_ids` populated
- Barge-in handling on voice replies
- Audio waveform visualization during recording

**Effort:** 8-10 days. **Explicit go/no-go gate:** only build 2B if Phase 2A telemetry shows ≥30% DAU using voice-input surfaces (vs text). Otherwise defer.

---

## 4. Phase 2C — Onboarding joy-path expansion (parked 2026-04-15 memo made real)

Based on `mitra_onboarding_joy_inclusion.md`. Ready-to-build once founder approves.

### 2C.1 Turn 2 — add 4 expansion chips (alongside existing 7 deficit chips)

Founder memo already drafted these:
- "I want to deepen what's working"
- "I'm on a rhythm I want to keep"
- "Gratitude is what's alive for me today"
- "I'm approaching a threshold and want to honor it"

Each expansion chip maps to `scan_focus` + `entered_via: joy_path`.

### 2C.2 Turn 3 — add 4 positive textures (alongside existing 6 deficit textures)

- "Grateful — soft and clear"
- "Playful — lightness"
- "Focused — clean energy"
- "Open — ready to receive"

Ordering rule: if user picked a joy-path chip in Turn 2, Turn 3 shows positive options first. If deficit-path, deficit first.

### 2C.3 Turn 6 — Recognition line routes by path

```python
if entered_via == "joy_path":
    line = joy_signal_recognition[signal_type][guidance_mode]
else:
    klesha, kosha = classify(friction, state)
    line = diagnostic_copy[klesha][kosha][guidance_mode]
```

Extend `joy_signal_templates.yaml` with `onboarding_recognition` section — 6 patterns × 3 modes = 18 new lines (founder-reviewable at same density as `diagnostic_copy.yaml`).

Example target lines (universal):
- "You came in already steady. That's the day to build, not just manage."
- "The rhythm is working. Today is for trust, not adjustment."
- "Gratitude brought you here. Let's honor it with something simple."

### 2C.4 Backend endpoint wire-up

`/journey/start/` picks from `diagnostic_copy_for()` OR `joy_recognition_for()` based on `entered_via` flag. Small view change.

### 2C.5 FE

Turn 2 + Turn 3 schemas in `allContainers.js` onboarding section — add chips + map them. Backend returns correct path-appropriate Recognition line; FE already renders what backend returns.

### 2C.6 Effort estimate
| Work | Days |
|---|---|
| Extend `joy_signal_templates.yaml` with onboarding_recognition section + 18 lines (founder + agent) | 1d founder + 1d agent |
| Backend `/journey/start/` path-aware recognition routing | 1d |
| Turn 2 chip set expansion (allContainers.js + copy) | 0.5d |
| Turn 3 texture expansion + conditional ordering | 1d |
| Joy-path `scan_focus` mapping (per chip → focus) — founder authors | 0.5d founder |
| Tests (12 personas × 2 paths = 24 onboarding walks) | 1.5d |
| **Total Phase 2C** | **~6-7 days** |

### 2C.7 Founder decisions for 2C
1. Approve the 4 Turn-2 expansion chips (copy above) — edit or accept
2. Approve the 4 Turn-3 positive textures — edit or accept
3. Approve the 18 Recognition lines (6 joy signals × 3 modes) — author or review agent drafts
4. Authoritative scan_focus mapping per joy-path chip — founder per-chip call

---

## 5. Phase 2D — Self-learning hookup (the actual hardest part)

This is the "richer layer" work — explicitly gated behind 2A and 2C shipping + telemetry.

### 2D.0 What "self-learning" means in V1
NOT reinforcement learning. NOT personalized LLM. Two very specific deterministic mechanisms:

**Mechanism 1 — Asset familiarity rotation.**
Every `WisdomAsset` serve creates a `UserAssetServeCount` row. When a user has seen an asset ≥ 20 times, selector deprioritizes it for that user in favor of a peer from the same tier+family. Mantras that work for the user continue to surface; wisdom lines naturally rotate so the same Gita 2.47 line doesn't feel like a stuck record over 6 months.

**Mechanism 2 — Snippet promotion candidates.**
`VoiceInputLog` entries where the response included a snippet (e.g., `wis.stillness_is_strength`) AND the user dwelled on the reply card ≥ 5 seconds AND didn't immediately dismiss → snippet gets +1 in a "resonance score" column. Snippets crossing threshold 50 → flagged for founder review as potential promotion candidates (from `drill_down_only` or `standalone_safe=no` to `yes`). Founder stays the final gate.

Both mechanisms are **read-side only** in the selector — they modulate scoring, they don't rewrite the library.

### 2D.1 New tables
```sql
CREATE TABLE user_asset_serve_count (
    user_id UUID,
    asset_id VARCHAR(128),
    serve_count INT DEFAULT 0,
    last_served_at TIMESTAMPTZ,
    PRIMARY KEY (user_id, asset_id)
);

CREATE TABLE snippet_resonance_score (
    snippet_id VARCHAR(128) PRIMARY KEY,
    resonance_score INT DEFAULT 0,
    last_updated_at TIMESTAMPTZ,
    user_dwells_5s INT DEFAULT 0,
    user_dismissals INT DEFAULT 0,
    flagged_for_founder_review BOOL DEFAULT false
);
```

### 2D.2 Selector integration
Add one new tiebreak rule to `pick_wisdom()`:

```
Tiebreak rule 4 (new): Lower `user_asset_serve_count.serve_count` wins (freshness for this user).
```

Slots in between existing rules 3 (repeat_fatigue) and 5 (quality). Keeps determinism.

### 2D.3 Founder review workflow
Weekly Celery task:
```python
def flag_snippet_promotion_candidates():
    SnippetResonanceScore.objects.filter(
        resonance_score__gte=50,
        flagged_for_founder_review=False,
    ).update(flagged_for_founder_review=True)
    # Notify founder via Slack #mitra-wisdom-alerts channel
```

Founder sees weekly Slack digest: "5 snippets crossed resonance threshold this week. Review? <link>"

### 2D.4 Privacy
- `user_asset_serve_count` is per-user, never shared. TTL 180 days (old data purged — long enough for 6-month variance, short enough to bound storage).
- `snippet_resonance_score` is corpus-level aggregate — no user attribution.

### 2D.5 Effort estimate
| Work | Days |
|---|---|
| 2 new Postgres tables + migrations | 0.5d |
| Selector tiebreak rule 4 integration | 0.5d |
| Resonance score increment logic (wired into VoiceInputLog + response render) | 1d |
| Weekly Celery task for promotion flagging | 0.5d |
| Founder notification workflow (Slack digest) | 0.5d |
| Tests (asset rotation scenarios + resonance scoring) | 1d |
| **Total Phase 2D** | **~4 days** |

### 2D.6 Founder decisions for 2D
1. Approve the 20-serve familiarity threshold — higher (30) or lower (10)?
2. Approve the 50-resonance promotion threshold — calibrate after 2 weeks of 2A live?
3. 180-day TTL on serve counts — OK?
4. Slack channel + digest cadence — `#mitra-wisdom-alerts` weekly?
5. Authoritative snippet promotion — founder manual review only (never auto-flip)?

---

## 6. Phase 2E — Optional: LLM-backed conversational layer (explicit gate required)

**Do NOT build this unless phases 2A + 2C have shipped AND delivered measurable user value AND founder explicitly approves scope.**

If triggered, Phase 2E would add:
- `POST /api/mitra/chat-turn/` endpoint that takes a conversation thread + user turn and returns Mitra's turn
- System prompt anchored in the 19 principle YAMLs (RAG over library; not free generation)
- Turn-by-turn memory using the `ConversationMemory` table (declared-empty in Track 0.5; activated here)
- Gated behind founder-approved cost + safety monitoring
- Shipping as an explicit new feature, not a bundle

**Effort (if approved):** 15-20 days + ongoing cost. This is the biggest single chunk.

**Hard prerequisites:**
1. Phase 2A live in prod for ≥ 30 days with telemetry
2. Phase 2C live
3. Founder explicitly decides chat-turn is the next priority (not journal-analysis, not insights, not something else)
4. Budget approval for LLM costs (rough: $X/mo per 1000 DAU)
5. Safety review of system prompt + retrieval

If any gate fails → Phase 2E stays deferred indefinitely. Product works without it.

---

## 7. Recommended sequence

If all three phases approved:

```
Week 1-2:  Phase 2A backend (endpoint, classifier, generator, tests)
Week 3:    Phase 2A content (mirror lines authoring + founder review)
Week 4:    Phase 2A FE integration (visible reply card + surface quiet-acks)
           Phase 2A dev smoke

Week 5:    Phase 2C parked-memo build (onboarding joy-path)
Week 6:    Phase 2C testing + deploy

Week 7:    Phase 2D self-learning hookup
           Phase 2D live behind telemetry-only flag

Week 8+:   Telemetry gathering; Phase 2B go/no-go; Phase 2E gate evaluation
```

Total: **6-8 weeks** for 2A + 2C + 2D. 2B and 2E stay deferred unless explicit triggers hit.

---

## 8. What Track 2 does NOT do

Explicit non-goals:
- No LLM in core selection path (Track 0.5 invariant holds)
- No multi-turn conversation memory beyond thread_id tracking in Phase 2A
- No cross-user personalization (Phase 2D is per-user familiarity only, no other-user signals)
- No generative voice response — text-to-voice in 2B only if explicitly gated
- No rewriting of M48/M49 ContentPacks — those are Track 1 locked
- No reworking of the selector pipeline — Track 0.5 V1 stays
- No new dashboard surfaces — Track 2 is input-response, not new primary entry
- No generative content authoring by AI (snippets/principles stay founder-authored)

---

## 9. Risks and mitigations

| Risk | Phase | Mitigation |
|---|---|---|
| Classifier misfires → user gets wrong mirror/wisdom → trust damage | 2A | Deterministic rules + 45 test fixtures + unclear bucket fallback. Every rendered response has DecisionTrace founder-replayable. |
| Mirror line pool becomes repetitive (150 lines × 3 modes stale at scale) | 2A | Phase 2D familiarity rotation applies to mirror lines too (not just wisdom assets). |
| Voice surfaces get built then nobody uses them | 2B gate | Explicit go/no-go on DAU threshold. 2B only ships if 2A proves demand. |
| Onboarding joy-path adds new dropoff if Turn 3 reorder confuses users | 2C | Conditional ordering (joy-first if user signaled joy-path in Turn 2) + founder spot-check on live Turn 3 flow pre-launch. |
| Self-learning deprioritizes core Gita anchors away from users who need them | 2D | 20-serve threshold is conservative; the alternative (same Gita verse every day for 6 months) is worse. Add a floor: core completion anchors never rotate. |
| LLM layer (2E) drifts into non-Sanatan register | 2E | Hard gate: do not build without explicit founder approval of system prompt + RAG boundaries. If built, every response goes through contraindication filter before render. |

---

## 10. Ten decisions founder must make before Phase 2A engineering starts

1. Intent bucket list (7 above) — approve or revise
2. Classification → action map — approve or revise  
3. Quiet-ack vs visible-reply surface policy — confirm
4. Text storage policy (hash for guests, full for authed, 30d TTL) — OK?
5. Voice 2A = on-device STT only (defer server-side) — OK?
6. Mirror line authoring — founder drafts or agent drafts + founder review?
7. Phase 2C joy-path launch — bundle with 2A or separate release?
8. Phase 2D thresholds (20 serves, 50 resonance) — calibrate later or lock now?
9. Slack channel for founder digest — new `#mitra-wisdom-alerts` or existing?
10. Phase 2E (LLM) — explicitly parked? Or soft-yes conditional on 2A traction?

---

## 11. What becomes possible after Track 2 ships (preview)

- User types "I lost my father last week" into dashboard → Mitra classifies → mirrors with grief-safe copy → offers grief room → user enters → wisdom_anchor + mantra all resonant
- User opens app on gratitude-day → onboarding surfaces joy chips → post-onboarding joy-room is first-class → completion anchors honor the steady-day register
- User has seen `gita_nishkama_karma` anchor 20 times → selector rotates to `gita_swadharma` → gita register preserved, variation earned
- Founder reviews weekly resonance digest → 3 snippets promoted to `standalone_safe=yes` → library quality improves over months

**Track 2 completes the transformation from "Mitra is a surface layout" to "Mitra listens, responds, and learns what resonates."**

---

## 12. What we could do NEXT instead of Track 2 (alternative paths)

If Track 2 feels like the wrong priority:

**Alt 1 — Insights/analytics track.** Instead of voice-input, build founder analytics dashboard showing wisdom usage patterns, room utilization, completion rates per path. Useful for Track 1 validation before Track 2 investment.

**Alt 2 — Content deepening track.** Instead of voice-input, invest in Track 4/5 content coverage — author the ~330 selector-eligible rows' hybrid_explanation band, push Hi locale for top 50 principles, create rooted-mode variants for all support room ContentPacks.

**Alt 3 — Audio polish.** Instead of voice-input, finish the 19 pending mantra recordings + TTS for remaining 11 missing iast entries (from parked items #3b).

**Alt 4 — Founder-first.** Spend 2 weeks using Mitra yourself — Track 1 as-is — and decide if the gap you feel most is input response (Track 2) or something else entirely.

I'd recommend **Alt 4 for at least 1 week** before committing to Track 2 — founder felt-experience is the truest compass.

---

**End of Track 2 plan. Awaiting founder review on §10 decisions + recommendation between Track 2 vs Alt 1-4.**
