# Smoke Pass Report — Polish Pass (Baseline)

**Date:** 2026-04-20
**Smoke tag:** `polish-2026-04-20`
**Runner:** `core/management/commands/smoke_room_render.py`
**Dev HEAD at run:** `58c240bb` (phase5-polish-qa-smoke branch, smoke-cmd-only diff vs dev)
**Endpoint:** `GET http://127.0.0.1:8000/api/mitra/rooms/{room_id}/render/`
**Scope:** 6 rooms × {cold-start, repeat} = 12 scenarios

This is a **baseline smoke** — Agent B's `phase5-polish-be-wisdom-and-chips`
and Agent D's `phase5-polish-content-step-and-inquiry` branches were
**not yet pushed to origin** at run time, so the endpoint is still
returning the pre-polish anchor+exit-only envelopes. A **delta re-run**
will be appended to this file once B + D land and dev is re-deployed.

## Verdict

**NOT READY for first room flip.**

Baseline confirms the known pre-polish state: the selection service is
emitting only 2 chips per render (anchor + exit) on 11 of 12 scenarios.
Chip Contract v1.1 requires 3–5 chips. The polish-pass fixes from Agent
B (wisdom + chip assembly) and Agent D (content + step + inquiry) are
pre-requisites.

## Per-room scenario results

| Room | Scenario | Chips | Visit | Phase | Verdict | Failures |
|---|---|---|---|---|---|---|
| room_stillness  | cold_start | 2 | 1 | initial | FAIL | CHIP |
| room_stillness  | repeat     | 2 | 3 | repeat  | FAIL | CHIP |
| room_connection | cold_start | 2 | 1 | initial | FAIL | CHIP |
| room_connection | repeat     | 2 | 3 | repeat  | FAIL | CHIP |
| room_release    | cold_start | 2 | 1 | initial | FAIL | CHIP |
| room_release    | repeat     | 2 | 3 | repeat  | FAIL | CHIP |
| room_clarity    | cold_start | 3 | 1 | initial | **PASS** | — |
| room_clarity    | repeat     | 2 | 3 | repeat  | FAIL | CHIP |
| room_growth     | cold_start | 2 | 1 | initial | FAIL | I-11, CHIP |
| room_growth     | repeat     | 2 | 3 | repeat  | FAIL | I-11, CHIP |
| room_joy        | cold_start | 2 | 1 | initial | **FAIL** | **I-5**, CHIP |
| room_joy        | repeat     | 2 | 3 | repeat  | FAIL | §5.6, CHIP |

Summary: **1 of 12 scenarios green; 15 invariant-level blockers.**

## Blocker list (baseline)

Chip-count (11 / 12 scenarios):
- Every scenario except `room_clarity/cold_start` returns 2 chips
  (anchor + exit). Expected 3–5 per Chip Contract v1.1 §Global chip
  rules. Root cause: the post-polish chip-set assembly from Agent B
  has not yet landed; selector is only emitting the minimum envelope.

Invariant-level (beyond pure chip-count):
- **I-5** — `room_joy/cold_start`: canonical runner payload for the
  joy mantra is missing `audio_url`. The I-5 mantra rule requires
  `audio_url` + `essence` both non-empty. Owner: Agent B (runner
  payload completion) or seed-data fix on `MasterMantra.audio_url`.
- **I-11** — `room_growth/{cold_start, repeat}`: room_growth must
  include at least one of {inquiry, regulation-practice, journal}
  beyond anchor/teaching. Current envelope is anchor+exit only → this
  invariant cannot be satisfied until inquiry / regulation-practice
  / journal chips land. Owner: Agent D (inquiry) + Agent B
  (regulation-practice step + chip assembly).
- **§5.6** — `room_joy/repeat`: joy post-cold-start must include at
  least one of {offering, blessing, carry}. Baseline returns only
  anchor+exit → invariant cannot be satisfied until Agent B lands
  the repeat-render offering chip.

Every scenario's `SCENARIO` sanity-check passes — visit_number
increments correctly (1 for cold_start, 3 for repeat after 2 prewarm
renders), render_phase flips `initial → repeat` as expected. The
endpoint contract itself is healthy.

## Observations vs architecture

- `room_clarity/cold_start` correctly emits a teaching action already
  (chip count = 3 passes the 3–5 rule). I-9 (max one wisdom surface)
  holds and locked order from §5.4 holds. Clarity cold-start is the
  only room currently contract-compliant.
- `room_clarity/repeat` is 2-chips → misses regulation step + inquiry,
  both of which Agent D owns (content + step + inquiry).
- No I-1/I-2/I-3/I-4/I-7/I-8/I-9/I-10/I-12/§5.1/§5.4 failures anywhere
  in the 12 scenarios — the envelope plumbing (testIDs, analytics
  keys, provenance, family whitelist, clarity order, stillness
  no-expression cold-start) is solid. The only misses are the
  assembly-layer gaps (chip count, growth composition, joy repeat
  outward movement) + one runner-payload completeness miss (joy
  mantra missing audio_url).

## First-flip recommendation

**Recommended first room:** `room_clarity` (if we had to flip today).

Why:
- It is the only room with one already-green scenario in the baseline
  and already carries a conforming teaching action on cold-start.
- Clarity locked order (§5.4) + I-9 + I-8 are all intact.
- Its remaining gap is purely on the repeat path (+regulation step,
  +inquiry) which is directly in Agent D's polish scope.

**However, no room should flip until the delta smoke below is green.**
The baseline is only useful as a contract-sanity signal. First flip
requires the post-polish rerun returning at least the candidate
room's two scenarios (cold_start + repeat) PASS with all invariants
green. Original polish-pass plan nominates `room_joy` as the first
flip; after fixes land, rerun the smoke and prefer joy only if its
two scenarios pass (including I-5 audio_url + §5.6 outward movement).

### Smoke checklist for the human running the actual flip

1. Confirm Agent B (wisdom + chips) + Agent D (content + step +
   inquiry) branches are merged to dev on origin and dev EC2 is
   deployed off the merged tip.
2. SSH dev, `git pull --ff-only origin dev`, apply any new migrations
   (notably `0121_seed_room_step_templates` from Agent D's branch),
   `docker compose exec web python manage.py migrate core`, and
   restart `web` with `docker compose up -d --force-recreate --no-deps web`.
3. Re-run (use a fresh salt so cold-start guests are truly cold):
   ```bash
   docker compose -f docker-compose.dev.yml -p kalpxdev exec -T web \
       python manage.py smoke_room_render \
       --base-url=http://127.0.0.1:8000 \
       --salt=2026-04-20-postfix
   ```
4. All 12 scenarios must return `PASS`. If even one fails, do not
   flip — cite the blocker and loop back to the responsible agent.
5. On green: flip the candidate room via its feature flag
   `MITRA_ROOM_<ROOM>=1`, verify the live client renders 3–5 chips,
   and watch RoomRenderLog + analytics for 24h before flipping the
   next room.

## Files

- Smoke runner: `/Users/paragbhasin/kalpx/core/management/commands/smoke_room_render.py`
- Results doc (this file): `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/SMOKE_RESULTS_2026_04_20.md`
- CI fixture directory (untouched in this pass): `/Users/paragbhasin/kalpx/core/tests/fixtures/rooms/`
- BE branch: `phase5-polish-qa-smoke` (off `dev`, pushed to origin)
- RN branch: `phase5-polish-qa-smoke` (local-only; tracks this results doc)

## Delta re-run (post Agent B + D)

_To be appended when B + D land. Will capture a second run of the
smoke command and a diff table (baseline → post-fix) showing which
scenarios moved green._
