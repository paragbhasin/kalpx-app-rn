# Phase 2 — Metro / dev-client verification runbook

**Context:** Sprint 1 Phase 2 under CP-1 revised disposition (2026-04-18).
**Scope:** dev backend + Metro/dev-client (no EAS). Prod parked.
**Purpose:** prove Sprint 1 code surface renders real ContentPack-served content end-to-end, on a real device/simulator running Metro, against dev backend. This gate passes before Phase 3 (Silk-on-Metro first live pass).

## Automated pre-checks run this turn (all PASS on dev)

- **TSC:** `npx tsc --noEmit` → exit 0, no type errors.
- **Content resolve (HTTP real endpoint):** `POST /api/mitra/content/moments/M48_joy_room/resolve/` against dev backend → `variant_id=M48_universal_en_baseline`, `fallback_used=False`, `opening_line="Good to sit with you today."`.
- **Expo doctor:** 2 warnings (package version + unmaintained deps) — flagged separately; NOT Sprint 1 blockers. Track as independent cleanup.
- **7-moment resolve probe (from last turn):** PASS 7/7 on dev for M46, M47, M48, M49, M_completion_return, M24, M25.
- **S1-08 pytest regression:** PASS 4/4 (runner_source precedence rule).

## Metro runtime prerequisites

| Item | Value |
|---|---|
| Dev backend base URL | `https://dev.kalpx.com/api/mitra/` (CloudFront → EC2 `dev-backend.kalpx.com:18080`) |
| Flag 1 — Track 1 dashboard | `EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD=1` (set in local `.env`) |
| Flag 2 — content resolve | `MITRA_V3_CONTENT_RESOLVE_ENABLED=1` (backend env — already set on dev EC2) |
| Client node version | per `.nvmrc` / package.json engines |
| Device target | iOS simulator OR Android emulator OR physical dev-client via Expo Go / dev-client build |

## How to start Metro

```bash
cd /Users/paragbhasin/kalpx-app-rn
# Verify Track 1 dashboard flag is in the local env
grep EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD .env || echo "WARNING: flag missing"
# Start Metro targeting dev backend
npx expo start --dev-client
```

Scan the QR from an iOS Expo dev-client build OR press `i` / `a` to open simulator.

## Phase 2 verification checklist (human-runnable)

Each row below is a quick render-check. If any row fails, STOP and file the mismatch; do not advance to Phase 3.

### Dashboard (`companion_dashboard` / `_v3`)
- [ ] Joy chip visible with founder-locked wording ("I'm in a good place")
- [ ] Growth chip visible ("I want to go deeper")
- [ ] Triggered + Quick Check-in + More support chips visible
- [ ] **FocusPhraseLine:** either renders real text OR is hidden. **NO "One gentle step is enough." fallback.** (S1-04 sovereignty-strict)
- [ ] **PostConflictMorningCard:** renders correctly when `post_conflict` is truthy (S1-02 canonical snake_case)
- [ ] No `(translation missing)` strings anywhere
- [ ] DayTypeChip NOT rendered (S1-03 removed; chip killed)
- [ ] Sankalp sub-text uses `sankalp_how_to_live` via top-level (S1-05)
- [ ] WhyThisL1Strip reads from `why_this_l1_items` flat array OR falls back to nested `why_this.level1.*` (S1-06 dual-emit burn-in)

### Joy Room (M48 — Track 1)
- [ ] Tap Joy chip → JoyRoomContainer opens
- [ ] Opening line is real content from M48 ContentPack
- [ ] Walk / Sit options visible; no `"Done"` English fallback on carry labels (S1-06/S3-06)
- [ ] Complete a mantra → CompletionReturnTransient renders
  - [ ] `wisdom_anchor_line` visible: "Joy lives in the doing held lightly..."
  - [ ] `"Read more →"` label visible (NOW served via `constant_value` slot — S1-12)
  - [ ] Reflection placeholder reads `"Anything to carry from this?"` (NOT the dropped `"How did that feel?"`)
  - [ ] `return_to_source` returns to Joy Room (not dashboard)

### Growth Room (M49 — Track 1)
- [ ] Tap Growth chip → GrowthRoomContainer opens
- [ ] 5 inquiry categories render with real seeded prompts
- [ ] Each category → inquiry seat renders content from M49_inquiry_seeds

### Grief + Loneliness (M46 / M47)
- [ ] MoreSupportSheet opens with header + grief + loneliness rows (NO English fallback for missing labels — S1-11)
- [ ] Grief / Loneliness rooms resolve correctly; opening lines render

### Day 14 checkpoint (M25 — post-S1-10 spine migration)
- [ ] Navigate to Day 14 (persona walk or seed)
- [ ] Narrative reads from **spine** (not hardcoded `Fourteen days. Two weeks of showing up...`)
- [ ] Interpolated `{completed_count} of {total_days}` renders real numbers
- [ ] If backend has not seeded, block renders empty (no English leak)

### Completion return variants (end-to-end)
- [ ] Core mantra completion → `M_completion_return_core_mantra_en` wisdom_anchor
- [ ] Additional × mantra completion → `M_completion_return_additional_library_en` (or custom/recommended per source) — visual-only, no anchor (S1-08 adopted)
- [ ] Support grief × mantra → `M_completion_return_support_grief_mantra_en` anchor + `return_to_source`

## Sovereignty deny-list (post-Sprint 1)

**None of these strings should render anywhere in a normal flow:**
- `"Fourteen days. Two weeks of showing up."` (S1-10)
- `"How did that feel?"` (S1-12)
- `"I'm here if you need more."` / `"Grief Room"` (body) / `"Loneliness Room"` (body) (S1-11)
- `"One gentle step is enough."` (S1-04)
- `"Welcome, friend."` / `"You're here. Begin wherever feels right."` (S3-07, still present — not in Sprint 1 scope)
- `"Today's anchor"` / `"Today's vow"` / `"Today's practice"` (S3-04, still present in legacy triad — only bites under flag=0)
- `"Your Sankalp is Alive."` (S3-05, still present — not in Sprint 1 scope)

Enforce via `.maestro/silk-integrity/FALLBACK_DENY_LIST.txt` during Phase 3.

## Backend-bug watch

If Metro rendering reveals a real backend content bug (variant mis-selects, slot missing, envelope field drops), STOP and open a fresh ticket — do NOT ad-hoc patch during Phase 2. Per founder constraint: "do not reopen backend/content scope unless Metro/live-pass reveals a real bug."

## Exit gate to Phase 3

All checklist rows PASS **or** failures are scoped + documented + accepted as "fix before Phase 4." Phase 3 (Silk-on-Metro) runs against the same Metro session.
