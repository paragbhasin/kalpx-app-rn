# Moment: Voice on Every Screen (scaffold)

## What this is
A floating mic button that rides on every conversational surface so the user can reply by voice at any point — not just where a specific turn enables voice.

Per Sadhana Yatra spec (`mitra_architecture_sadhana_yatra.md` §Voice affordance): voice is first-class, not a feature of a single screen.

## Where the design lives
No dedicated spec doc yet. Placement reference: kalpx-frontend `ChatComposer.vue` — mic sits bottom-right, 16px inset, above the bottom tab bar.

## Scaffold
- `index.tsx` — `<VoiceOnEveryScreen />` component. Floating 56x56 round mic button, gold background, stub `onPress`.

Nothing currently imports it. This is deliberate. Wire it up only after the 3 steps below.

---

## Wire-up (3 steps — DO NOT DO YET, 2026-04-14)

### Step 1 of 3 — Shared mount point
Decide where the mic mounts. Options:
1. `App.jsx` at root (covers every screen including overlays).
2. Inside `BlockRenderer.tsx` beneath the blocks array (per-screen).
3. Inside each container layout (surgical, most control).

Recommendation: option 2 — mount once in `BlockRenderer`, gated by a container-level flag `voice_available_everywhere: true` on the container definition in `allContainers.js`.

### Step 2 of 3 — Consent gate
Before the mic can record, check `screenState.voice_consent_given`. If not set, tapping the mic should dispatch the existing `voice_consent` overlay (see `src/extensions/moments/voice_consent/`) instead of opening the recorder.

### Step 3 of 3 — Recorder hookup
Wire `onPress` to the existing voice recorder used by the onboarding `voice_text_fork` block (see `src/blocks/VoiceTextForkBlock.tsx` for the pattern). Normalize the resulting transcription into an `onboarding_turn_response` payload with `freeform_text = <transcript>`.

---

## Why it is unwired right now
1. Consent flow + recording permission UX not finalized.
2. Transcription backend path unclear for onboarding turns (vs. voice_notes).
3. Onboarding spec already places mic inside each `onboarding_conversation_turn` — duplicating risks two mics on the same screen.

Ship this only after Parag + Pavani agree on a single mic mounting strategy.
