# Phase 5 Smoke Test Matrix

> Run after backend deploy to dev + RN sim rebuild. All 4 personas should
> pass before declaring Phase 5 green. Takes ~20 minutes end-to-end.
>
> Password for all test personas: `Test1234!`

## Pre-conditions

- [ ] Backend `dev` branch deployed on EC2 — tip should be at least `05116de5`
- [ ] `EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD=1` in `.env` on `pavani` branch (committed `27f3d43`)
- [ ] RN sim rebuilt after flag flip: `npx expo run:ios` or similar — env vars are compiled in at bundle time, so a rebuild is required, not a reload
- [ ] Test personas seeded per `/tmp/seed_personas_v3.py` (cycle_metrics + journey activity present)

## Matrix

### Persona 1 — `test+day3@kalpx.com` (Day 3 of 14, support/soften, 2/2 done)

Expected route on login: **ContinueJourney → M8 morning_good (momentum layout)**

Then tap "Continue today's practice" → lands on **new dashboard** with:

- [ ] Header: "KalpX" brand + language pill + (optional) bell
- [ ] GreetingCard renders if backend seeds `sd.greeting_context` (may be null; acceptable)
- [ ] DayTypeChip + PathChip row visible
- [ ] FocusPhraseLine italic below
- [ ] **TriadCardsRow shows 3 cards** — mantra/sankalp/practice with their titles
- [ ] 2 cards marked ✓ (since backend completed_today seeded 2 of 3); 1 card shows ○
- [ ] WhyThisL1Strip (may be empty if `why_this_l1_items` not yet seeded; acceptable)
- [ ] CycleProgressBlock collapsed by default — tap header → expands with 14 dots + metrics
- [ ] DailyRhythmStrip: 3 done dots + 11 pending dots; day 7 + day 14 faint-pending
- [ ] SankalpCarryBlock hidden (practice_embody=false means <1 of triad is sankalp; depends on seed)
- [ ] QuickSupportBlock: 2 primary pills + "More support ›" link
- [ ] Tap "I Feel Triggered" → routes to practice_runner/free_mantra_chanting
- [ ] Tap "Quick Check-in" → routes to cycle_transitions/quick_checkin
- [ ] "More support ›" → sheet slides up with Grief / Loneliness / Crisis links
- [ ] Bottom voice input bar visible + mic tappable
- [ ] Kill app → reopen → ✓ indicators STILL showing (cross-session persistence)

### Persona 2 — `test+day7@kalpx.com` (Day 7 of 14, 6/6 done)

Expected route: ContinueJourney should route_to_moment → **M24 Day 7 Checkpoint**

- [ ] ContinueJourney receives `response_type: route_to_moment` with M24 action
- [ ] Auto-navigates to `cycle_transitions/checkpoint_day_7`
- [ ] Checkpoint renders with decision chips (Continue / Lighten / Start fresh)
- [ ] If user backs out to dashboard instead → Day 7 dot on DailyRhythmStrip should be **tappable** and navigate back to M24

### Persona 3 — `test+day14@kalpx.com` (Day 14 of 14, 13/13 done, growth/deepen)

Expected route: ContinueJourney route_to_moment → **M25 Day 14 Evolution**

- [ ] Lands on `cycle_transitions/checkpoint_day_14`
- [ ] Decision chips: Continue / Deepen / Change focus
- [ ] PathChip (if visible on dashboard) shows "growth" not "support"
- [ ] Day 14 dot on DailyRhythmStrip (post-checkpoint) is active/gold

### Persona 4 — `test+welcomeback@kalpx.com` (Ended 2026-03-13 = 35d ago, support/return)

**This is the big unification test.**

Expected route: ContinueJourney → M12 long-absence variant (NOT legacy WelcomeBack screen)

- [ ] Lands on ContinueJourney (NOT legacy WelcomeBack.tsx — that file is deleted)
- [ ] Backend /journey/home/ returns M12 variant with:
  - [ ] `gap_days_bucket: "long_absence"` in decision meta
  - [ ] `earned_context_line` populated (e.g., "1 cycles · 12 days practiced · your mantra held most often")
  - [ ] 3 chips: Continue with {focus_short} / Start fresh / Talk with Mitra first
  - [ ] `welcome_back_line` interpolated into body_lines[0] (per path_intent "return")
- [ ] Tap Continue with → POST `/mitra/journey/welcome-back/ {decision: continue}` → new Journey created with `path_cycle_number += 1` + `previous_journey` set → lands on new dashboard
- [ ] Tap Start fresh → POST `/mitra/journey/welcome-back/ {decision: fresh}` → old journey status=completed → routes to `welcome_onboarding/turn_1` → after onboarding, new Journey should have `previous_journey=<old_id>` (verify via Django admin or shell)
- [ ] Tap Talk with Mitra first → routes to dashboard (chat surface placeholder)
- [ ] MitraDecisionLog captures the decision (check via SSH: `docker exec kalpx-dev-web python manage.py shell -c "from core.models import MitraDecisionLog; print(list(MitraDecisionLog.objects.filter(moment_surfaced='M12_return_absent').order_by('-created_at')[:3].values('created_at','meta')))"`)

**Verify M12 long-absence variants actually serve (they're currently status: draft):** if founder hasn't approved yet, backend will fall through to the baseline variants and the user will see the short-gap copy instead of the 30+d copy. That's a known gap — part of Phase 5 is the founder flipping `status: draft → approved` on the 3 long-absence variants.

## Policy gate check

Run after all 4 personas pass:

```bash
cd /Users/paragbhasin/kalpx
python3 -c "from core.content.source_visibility import validate_all_moments; vs = validate_all_moments(); print(f'violations: {len(vs)}'); [print(' ', v) for v in vs]"
```

Expected: `violations: 0`. If anything non-zero, do not ship to prod.

## Rollback

If any persona fails:

1. Revert flag: `sed -i '' 's/EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD=1/EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD=0/' .env` + rebuild
2. Backend rollback: SSH dev EC2, `git reset --hard <last-known-good-sha>`, `docker compose -p kalpxdev up -d --remove-orphans`
3. File issues per persona that failed; don't retry with flag on

## Sign-off

- [ ] All 4 personas pass
- [ ] Policy gate shows 0 violations
- [ ] Founder pixel walkthrough done
- [ ] Memory index updated: `mitra_new_dashboard_v1.md` + `mitra_welcomeback_unified.md` created

Once all boxes checked → safe to flip prod flag in a follow-up commit.
