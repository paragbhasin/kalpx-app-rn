# Silk Integrity — Selector Gaps

Running list of `SELECTOR_PATCH_NEEDED` markers across the 31 flows.
Each row points at an FE source file that must add a stable testID (or
accessibilityLabel) before the flow can assert deterministically.

**Phase 3 (2026-04-18) — Agent X land in progress.** Rows below are the
REMAINING gaps after Phase 3 patches; flows 06–31 selector comments
have been removed from YAMLs and replaced with testID-first assertions.
Flows 01–04 (onboarding) remain the last open slice (P5 priority).

| Flow | File / Location | Missing selector | Suggested id / label |
|---|---|---|---|
| 01 | `src/screens/LoginScreen*` (onboarding entry) | onboarding "Begin" CTA | `testID="onboarding_start_cta"` |
| 02 | `src/extensions/moments/*` onboarding chips | Turn-N chips | `testID="onboarding_chip_turn<N>_<idx>"` |
| 02 | Turn 7 recognition line | recognition copy | `testID="onboarding_recognition_line"` |
| 03 | Turn 7 primary CTA | continue button | `testID="turn7_primary_cta"` |
| 03 | Triad cards (onboarding reveal surface) | card tap targets | `testID="triad_card_<kind>"` |
| 04 | Dashboard first-visit container | greeting block | `testID="first_dashboard_greeting"` |
| 05 | Dashboard home headline | top-of-dashboard | `testID="home_headline"` + `testID="home_body_lines"` |
| common | `src/screens/LoginScreen*` email input | email textfield | `testID="login_email_input"` + `testID="login_password_input"` |

## Closed in Phase 3

The following rows have been cleared from the YAMLs — Agent X testID
land tracks these and their corresponding FE components:

- Flow 06 — `core_item_mantra` / `core_item_sankalp` / `core_item_practice` (CoreItemsList)
- Flows 07–08 — `checkin_state_<state>` + `checkin_suggestion_<idx>` (QuickCheckinBlock)
- Flows 10–11 — `more_support_grief_row`, `more_support_loneliness_row` (MoreSupportSheet)
- Flows 10–13 — `<room>_opening_line` for grief/loneliness/joy/growth rooms
- Flow 13 — `inquiry_category_<decision|relationship|stuck|practice|other>` + `inquiry_seat_prompt` (growth_room)
- Flow 14 — `checkpoint_day_7_narrative` / `..._headline` / `..._eyebrow` / `checkpoint_cta_*` (CheckpointDay7Block)
- Flow 15 — `checkpoint_day_14_narrative` / `..._summary` / `checkpoint_cta_*` (CheckpointDay14Block)
- Flows 16–23 — `mantra_runner_start` / `mantra_runner_complete` / `sankalp_hold` / `practice_runner_start` / `practice_runner_complete` (runners) — **SUPERSEDED 2026-04-19 by canonical rich runner routing.** These testIDs lived on the parked `MantraRunnerDisplay` dark-chrome component. Core triad + support runner paths now land on `cycle_transitions/offering_reveal` (CycleTransitionsContainer rich surface). Replacement selector: `test_runner_force_complete` — a dev-only invisible pressable (1×1, `__DEV__`-gated) that triggers the REAL `complete_runner` dispatch per variant (same action the natural 108-tap / 3s-hold / timer-expiry paths use; backend tracking fires; `completion_return` renders; source-room routing resolves identically). Production builds strip the affordance entirely. Maestro flows 16 + 19–22 can swap the legacy `_start`/`_complete` optional taps for a single `tapOn: id: "test_runner_force_complete"`.
- Flows 16–26 — `completion_message` / `completion_wisdom_anchor_line` / `completion_read_more` / `completion_reflection_placeholder` (CompletionReturnTransient)
- Flows 19–20 — `<room>_mantra_option` support-room runner entry
- Flows 22–23 — `inquiry_<cat>_<kind>_option` offering selectors
- Flows 24–26 — `additional_items_surface` + `additional_item_<idx>` (AdditionalItemsSectionBlock)
- Flow 27 — `additional_items_surface` (section mount)
- Flow 28 — `continuity_mirror_card` (ContinuityMirrorCard)
- Flow 29 — `path_milestone_banner` (PathMilestoneBanner)
- Flow 30 — `resilience_narrative_card`
- Flow 31 — `entity_recognition_card`

## Patch order recommendation (remaining)

1. **P5 — onboarding entry (flows 01–04):** lowest priority because
   pattern-scan catches most regressions; add onboarding CTA testIDs
   when the team next touches the login/recognition flow.
2. **common login_as_persona.yaml:** add `login_email_input` +
   `login_password_input` to eliminate text-placeholder reliance for
   every persona-based flow.

## 2026-04-19 Wave 3 close addendum

### Superseded (done)
- `mantra_runner_start` / `mantra_runner_complete` / `sankalp_hold` / `practice_runner_start` / `practice_runner_complete` legacy testIDs — no longer queried. Flows 16/17/18 now use `test_runner_force_complete` (dev-only, __DEV__-gated) on the canonical rich runner surface.

### Landed (room-internal pills)
- `grief_mantra_option`, `loneliness_bhakti_option`, `loneliness_chant_option`, `joy_chant_option`, `growth_mantra_option`, `growth_practice_option` — added PR2, accessibility-label override removed in Cases A+B pass. All queryable via resource-id (verified in DOM inspect 2026-04-19).

### Known iOS accessibility quirks (flow-harness notes)
- **MoreSupportSheet modal**: `Modal` + `Pressable` + children on iOS flattens the accessibility tree into a single parent container. `more_support_grief_row` + `more_support_loneliness_row` testIDs are present in code + accessibilityText concatenation but NOT queryable as discrete resource-id nodes. Blocks flows 19 + 20 until FE refactor (H-3 in Post-Wave-3 Roadmap).
- **Room-pill TouchableOpacity**: previously had the same `accessibilityLabel={testId}` pattern which flattened activation — removed in Wave 3 close. Now testIDs + child authored text work cleanly for Maestro.

### Remaining onboarding gaps (unchanged from prior)
See top of file for Flow 01–04 + `common/login_as_persona` gaps.
