# Agent A — Stage 1 Polish Pass Review

Review date: 2026-04-20
Reviewer: Agent A (strict architecture/contract review, READ-ONLY)
Dev tip under review: `kalpx` @ `674dd7d2` (kalpx-app-rn `a28e3b3` unchanged)

Note on locked references: the two files cited in the prompt
(`/Users/paragbhasin/kalpx-app-rn/docs/ROOM_SYSTEM_V3_1_ARCHITECTURE.md` v3.1.1-wisdom
and `/Users/paragbhasin/kalpx-app-rn/docs/room_system_v31/ROOM_CHIP_CONTRACT_V1_1.md`)
do **not exist** on disk in either repo. Review therefore anchors on the
invariant checklist embedded in the reviewer prompt plus the architecture
comments in `core/room_selection.py` (§5.1-§5.6 references) and the live
envelope returned by `/api/mitra/rooms/{id}/render/`.

## Verdict

**READY FOR FE STAGE 2** — with one small follow-up (see §Drift, D-1).

## Per-room compliance

Each of 6 rooms × {cold-start smoke, repeat smoke} = 12 scenarios. Cold-start
rows cite the reviewer-supplied smoke output (first block). Repeat rows cite
the reviewer-supplied smoke output (second block) cross-validated against
live curls captured today under `guest_uuid=agent-a-review-*`
(rooms are at `visit_number=7..12` on those UUIDs so live = repeat only;
cold-start rows are smoke-dependent).

| Scenario | Chips | Invariants | Verdict | Notes |
| --- | --- | --- | --- | --- |
| stillness cold | 3 | §5.1 (no expression), I-1, I-11 n/a | PASS | regulation step → mantra anchor → exit |
| stillness repeat | 3 | §5.1 intensity ≤ light ✓ (live anchor `mantra_soham` intensity=light), I-9 (banner only) | PASS | live banner `gita_chain_from_dwelling_to_fall`; no teaching chip (stillness-no-teaching) |
| connection cold | 3 | §5.2 banner-only, I-9 | PASS | mantra → expression step → exit |
| connection repeat | 3 | Chip Contract v1.1 no-L2-teaching ✓; banner + mantra + step | PASS | live: `mantra_hare_krishna` + `step_text_input_name_short` + banner `loneliness_room_open_satsanga_hybrid_001` |
| release cold | 3 | §5.3 no uplift/no offering ✓; no teaching ✓ | PASS | regulation step (`step_breathe_4_4_8`) → mantra → exit |
| release repeat | 3 | §5.3 banner only; no L2/L3 ✓ | PASS | live: `step_breathe_4_4_8` + `mantra_asato_ma` + banner `grief_room_open_karuna_hybrid_001` |
| clarity cold | 4 | §5.4 locked order anchor→regulation→teaching→exit (inquiry excluded) | PASS | live-validated order: `runner_mantra(anchor)` → `in_room_step(regulation)` → `teaching` → `exit` |
| clarity repeat | 5 | §5.4 full locked order incl. inquiry; I-9 honored (teaching XOR banner — teaching chosen) | PASS | live: `mantra_pavamana_asato_ma` + `step_grounding_palms_30s` + teaching `gita_choose_clarity_over_despair` + inquiry `m_clarity_inquiry_seeds` + exit |
| growth cold | 4 | §5.5 I-11 ≥1 of {inquiry, regulation-practice, expression-journal} beyond anchor/teaching ✓ via step(regulation)+inquiry; banner-only cold-start (no teaching main route) ✓ | PASS | mantra → regulation step → inquiry → exit |
| growth repeat | 4 | §5.5 I-11 satisfied; banner primary ✓ | PASS | live: `mantra_gayatri_om_tat_savitur` + `step_walk_timer_5min` + inquiry `m_growth_inquiry_seeds` + banner `gita_chain_from_dwelling_to_fall` |
| joy cold | 3 | §5.6 cold-start = chant + name + exit (no offering required) ✓; no L2 teaching ✓ | PASS | mantra → expression step "Notice what feels full" → exit |
| joy repeat | 4 | §5.6 post-cold-start ≥1 of {offering,blessing,carry} ✓ via `runner_sankalp(offering)` | PASS | live: `mantra_lakshmi_om_shri_joy` + `step_text_input_name_full` + `sankalp_joyful_presence(offering)` + exit |

## Envelope invariant findings (I-1 .. I-12)

- **I-1 exactly one exit per render** — PASS. All 12 scenarios have `exit_count=1`.
- **I-2 testID pattern `room_<id>_<action_type>_<index>`** — PASS. Regex `^room_(stillness|connection|release|clarity|growth|joy)_[a-z_]+_[0-9]+$` matches every action in all 6 live renders. Re-indexing loop at `core/room_selection.py:1288-1294` guarantees contiguous indices.
- **I-3 analytics_key pattern `<room_id>.<action_type>.<content_short>.v1`** — PASS. Regex `^room_(…)\.[a-z_]+\.[a-z0-9_]+\.v1$` matches all. Examples: `room_clarity.teaching.gita_choose_clarity_over_despair.v1`, `room_stillness.in_room_step.step_breathe_5_5.v1`, `room_joy.runner_sankalp.sankalp_joyful_presence.v1`.
- **I-4 no contamination** — PASS. All action `provenance.source_class` values ∈ {`room_pool`, `shared_support_pool`, `room_step_template`}. Zero occurrences of `core`/`additional`.
- **I-5 runner_payload completeness** — PASS. After `backfill_practice_duration_min` (commit `f67dfadc` = 1713 rows updated on dev), practice runners resolve cleanly; all observed mantra + sankalp runners carry full payload incl. `analytics_key` + `return_behavior`. Teaching chip correctly has `runner_payload=None` (teaching is its own `action_type`).
- **I-7 provenance block populated** — PASS. Every action carries `{selection_surface, source_class, selection_pool_id, selection_pool_version, selection_reason, anchor_override}`.
- **I-8 family whitelist** — PASS. Every emitted `action_family` is in `ROOM_ALLOWED_FAMILIES[room_id]` (`core/room_selection.py:88-95`).
- **I-9 max one wisdom surface at initial render** — PASS. Clarity has teaching (no banner). Growth / release / connection / joy / stillness-repeat carry banner (no teaching). The I-9 guard at `core/room_selection.py:1103-1108` explicitly drops teaching when both present (except clarity cold-start where it drops banner). Note: growth-repeat carries a banner AND an inquiry chip — inquiry is a chip-level action, not an L2 wisdom *surface*, so I-9 is not violated.
- **I-10 wisdom scalars** — PASS. `principle_banner` in all 5 banner-carrying rooms is a dict with keys `{principle_id, principle_name, wisdom_anchor_line}`, never an array. Confirmed across stillness/connection/release/growth/joy.
- **I-11 growth invariant** — PASS. Growth repeat carries step(regulation, `step_walk_timer_5min`) + inquiry(`m_growth_inquiry_seeds`) beyond anchor, satisfying "≥1 of {inquiry, regulation-practice, expression-journal}". Growth cold-start (from smoke) carries regulation + inquiry identically.
- **I-12 L3 dedup** — NOT EXERCISED. Smoke is pre-completion; no L3 reflection surfacing observed. Out of scope.

## Chip Contract v1.1 findings

- **Chip count 3-5** — PASS. Live renders: stillness=3, connection=3, release=3, clarity=5 (repeat) / 4 (cold smoke), growth=4, joy=4 (repeat) / 3 (cold).
- **Exit label "I'll go now"** — PASS in 6/6 rooms (pinned at `core/room_selection.py:103` `EXIT_LABEL = "I'll go now"`).
- **Joy cold-start expression step label "Notice what feels full"** — PASS. Live joy render: `in_room_step` label = `"Notice what feels full"` (resolved from `step_text_input_name_full` template).
- **Connection: no L2 teaching in v1** — PASS. No teaching chip in any connection render.
- **Joy: no L2 teaching in v1** — PASS. No teaching chip in any joy render.
- **Clarity: teaching always present at cold-start** — PASS. Chip Contract v1.1 cold-start = anchor + regulation + teaching + exit (4 chips); repeat adds inquiry as chip 4 → 5 chips total. Live repeat confirmed.
- **Clarity: inquiry repeat-only** — PASS. Enforced at `core/room_selection.py:1176-1181` (`_emit_inquiry` rejects on `cold_start and room_id==room_clarity`).
- **Growth: banner-only cold-start (no teaching as main route)** — PASS. Assembly plan at `core/room_selection.py:1240-1249` emits mantra → step → inquiry, then attempts `_emit_teaching()` — but since `want_teaching` was never set for growth (only `want_banner=True` at line 1053), `teaching_action` stays None and `_emit_teaching` is a no-op. Banner surfaces on growth cold-start (and repeat). No teaching chip on growth.
- **Stillness: no cold-start banner, rare repeat banner** — PASS. Guard at `core/room_selection.py:1060-1062`: `if room_id == "room_stillness": if not cold_start: want_banner = True`. Live stillness repeat carries banner `gita_chain_from_dwelling_to_fall`.

## Drift list

- **D-1 (minor, non-blocking) — growth teaching assembly dead code.** `core/room_selection.py:1248-1249` calls `_emit_teaching()` and then `teaching_action = None` for `room_growth`, but `want_teaching` is never set True for growth, so `teaching_action` is always None at that point and the call is a no-op. Recommend removing the two lines to match v1.1 intent ("growth banner-only; teaching not main route"). Does not affect output — filed as housekeeping.
  - Fix: delete lines `core/room_selection.py:1248-1249`.

- **D-2 (housekeeping) — clarity connection uses `"loneliness_room_open_satsanga_hybrid_001"` as banner.** Observed in the live connection render. Principle_id naming uses the legacy `loneliness_` prefix rather than `connection_`. Not a contract violation (I-10 scalar shape is correct), but worth flagging if a future rename pass unifies wisdom asset IDs to the canonical room naming (release similarly carries `grief_room_open_karuna_hybrid_001`). No action required for Stage 2.

No other drift detected. Tradition arrays surface as `[]` on live runner rows — this is a separate content-authoring concern (wisdom library tradition tagging), not a Stage 1 polish scope item, and does NOT break any I-invariant.

## Sample testID + analytics_key spot check

Five live tuples, all matching §7.2 patterns:

1. `room_clarity_runner_mantra_1` / `room_clarity.runner_mantra.mantra_pavamana_asato_ma.v1`
2. `room_clarity_in_room_step_2` / `room_clarity.in_room_step.step_grounding_palms_30s.v1`
3. `room_clarity_teaching_3` / `room_clarity.teaching.gita_choose_clarity_over_despair.v1`
4. `room_joy_runner_sankalp_3` / `room_joy.runner_sankalp.sankalp_joyful_presence.v1`
5. `room_growth_inquiry_3` / `room_growth.inquiry.m_growth_inquiry_seeds.v1`

## Sample exit label confirmation

`"I'll go now"` present in **6 of 6** rooms' exit action label (stillness, connection, release, clarity, growth, joy).

## Recommendation

**Stage 2 unblocked.** All envelope invariants I-1..I-11 pass in live renders;
I-12 is out of scope (no completion event in smoke). Chip Contract v1.1 rules
pass in all 6 rooms × 2 visit-states. Drift D-1 is a two-line dead-code cleanup
that does not affect output; D-2 is a future naming-consistency pass. Neither
blocks FE Stage 2.

Optional pre-Stage-2 follow-ups (non-blocking):
- Clean up D-1 dead call in a trailing polish commit.
- Ensure `docs/ROOM_SYSTEM_V3_1_ARCHITECTURE.md` (v3.1.1-wisdom) and
  `docs/room_system_v31/ROOM_CHIP_CONTRACT_V1_1.md` are committed to the
  repo — they are referenced as locked contracts in commit messages but are
  missing from disk in `kalpx-app-rn` as of `a28e3b3`.
