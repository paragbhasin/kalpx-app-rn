# Silk Integrity — Go/No-Go Checklist (pre-Batch-A)

**Governed by:** `~/.claude/projects/-Users-paragbhasin-kalpx-app-rn/memory/mitra_silk_flow_contract_v3.md`

## Must pass in order before Batch A opens

### 1. Triad direct-runner canary
- [ ] Login as `persona_smoke_triad_valid`
- [ ] Advance to full dashboard (tap "Continue today's practice" if in momentum)
- [ ] Tap `core_item_mantra` → mantra runner opens directly (no modal)
- [ ] Tap `core_item_sankalpa` → sankalp runner opens directly
- [ ] Tap `core_item_ritual` → practice runner opens directly
- [ ] Tap `core_item_mantra_info` → view_info surface opens
- [ ] No `view_info` fires on primary card tap (verified via log)

### 2. Support return-to-room canary
- [ ] Enter joy room (`quick_support_joy_chip`)
- [ ] Tap Chant pill → mantra runner (`source=support_joy`)
- [ ] Complete runner → lands back in joy room options (NOT dashboard)
- [ ] Tap exit pill → lands on dashboard
- [ ] Regression: core triad completion still → dashboard
- [ ] Regression: additional-item completion still → dashboard
- [ ] Regression: triggered-flow completion still → dashboard

### 3. Onboarding testID canary
- [ ] `onboarding_begin_journey_cta` visible on welcome splash
- [ ] `onboarding_yes_lets_begin` visible on intro
- [ ] `onboarding_turn_1_root` through `onboarding_turn_6_root` each resolve
- [ ] `onboarding_turn_<n>_chip_<key>` selectors work per turn
- [ ] `onboarding_recognition_root` + `onboarding_recognition_continue` work
- [ ] `onboarding_triad_reveal_root` + `onboarding_triad_begin_journey` work
- [ ] End-to-end onboarding completes without any `index: 0` fallback tap

## Only after all 3 pass → open Batch A (06-13)

If any canary fails:
- Do NOT open Batch A
- Diagnose via MCP (hierarchy + screenshot)
- Patch code (NOT the contract)
- Re-run failed canary + any canary the fix could regress
- Document fix in commit message + FLOW_CLOSURE_BOARD.md
