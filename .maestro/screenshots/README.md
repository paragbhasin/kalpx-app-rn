# Mitra v3 Screenshot Matrix

Generates PNG screenshots of every Mitra v3 screen for import into Figma as
reference frames.

## Prerequisites
- Fresh EAS simulator build installed on a running iOS simulator OR Android emulator
  (old binary won't show v3 screens)
- Maestro ≥ 1.36 installed (`curl -Ls "https://get.maestro.mobile.dev" | bash`)
- Logged-in test account on the device OR onboarding-reset state (delete + reinstall app)

## Quick start
```bash
cd ~/kalpx-app-rn
./scripts/capture-screenshots.sh
```

Output: `screenshots/mitra-v3/<moment-number>_<name>.png`

## What gets captured today (backend flags ON)

Flag-independent (capture now):
- Weeks 1–5: onboarding turns 1–7, dashboard, 3 practice runners, completion
  return, trigger, check-in, voice consent, evening + weekly reflection, Day
  7/14 checkpoints
- Week 7 routes: Why-This L2/L3 (needs principle data), grief room, loneliness
  room

Flag-gated (capture after backend enables):
- Week 6 cards (prep/predictive/entity/recommended/post-conflict) — require
  MITRA_V3_POST_CONFLICT, _JOY_SIGNAL, etc.
- Week 7 cards (gratitude/joy, season banner) — require MITRA_V3_JOY_SIGNAL
- Resilience narrative (Moment 26) — requires MITRA_V3_RESILIENCE_NARRATIVE

## Importing into Figma

1. In Figma: create a new file "Mitra v3 Reference Screens"
2. File → Import Images (Cmd+Shift+K)
3. Select all PNGs from `screenshots/mitra-v3/`
4. Figma auto-creates 30 frames; rename using the moment number in filename

## Customizing a single flow

Each flow is at `.maestro/screenshots/<number>_<name>.yaml`. Edit the `launchApp`
+ navigation sequence to match what your account looks like. Common tweak: if
you're already in a journey, skip the onboarding launch step.
