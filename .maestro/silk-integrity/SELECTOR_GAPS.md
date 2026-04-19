# Silk Integrity — Selector Gaps

Running list of `SELECTOR_PATCH_NEEDED` markers across the 31 flows.
Each row points at an FE source file that must add a stable testID (or
accessibilityLabel) before the flow can assert deterministically.

| Flow | File / Location | Missing selector | Suggested id / label |
|---|---|---|---|
| 01 | `src/screens/LoginScreen*` (onboarding entry) | onboarding "Begin" CTA | `testID="onboarding_start_cta"` |
| 02 | `src/extensions/moments/*` onboarding chips | Turn-N chips | `testID="onboarding_chip_turn<N>_<idx>"` |
| 02 | Turn 7 recognition line | recognition copy | `testID="onboarding_recognition_line"` |
| 03 | Turn 7 primary CTA | continue button | `testID="turn7_primary_cta"` |
| 03 | Triad cards (mantra/sankalp/practice) | card tap targets | `testID="triad_card_<kind>"` |
| 04 | Dashboard first-visit container | greeting block | `testID="first_dashboard_greeting"` |
| 05 | Dashboard home headline | top-of-dashboard | `testID="home_headline"` + `testID="home_body_lines"` |
| 06 | `src/blocks/CoreItemsList*` or equivalent | triad card tap targets | `testID="core_item_<kind>"` (mantra/sankalp/practice) |
| 07 | `src/blocks/QuickCheckin*` | state chips | `testID="checkin_state_<state>"` |
| 08 | `src/blocks/QuickCheckin*` suggestions surface | suggestion rows | `testID="checkin_suggestion_<idx>"` |
| 09 | `src/containers/TriggerContainer*` | trigger prompt container | `testID="trigger_reset_prompt"` |
| 10 | `src/blocks/dashboard/MoreSupportSheet*` | grief row | `testID="more_support_grief_row"` |
| 10 | `src/extensions/moments/grief_room` | opening line | `testID="grief_room_opening_line"` |
| 11 | `src/blocks/dashboard/MoreSupportSheet*` | loneliness row | `testID="more_support_loneliness_row"` |
| 11 | `src/extensions/moments/loneliness_room` | opening line | `testID="loneliness_room_opening_line"` |
| 12 | `src/extensions/moments/joy_room` | opening + walk option | `testID="joy_room_opening_line"`, `testID="joy_walk_option"` |
| 13 | `src/extensions/moments/growth_room` | inquiry categories | `testID="inquiry_category_<decision\|relationship\|stuck\|practice\|other>"`, `testID="inquiry_seat_prompt"` |
| 14 | `src/blocks/CheckpointDay7Block.tsx` | narrative + eyebrow + headline + 3 CTAs | `testID="checkpoint_day_7_narrative"`, `..._eyebrow`, `..._headline`, `checkpoint_cta_<continue_same\|deepen\|change_focus>` |
| 15 | `src/blocks/CheckpointDay14Block.tsx` | narrative + summary + 3 CTAs | `testID="checkpoint_day_14_narrative"`, `..._summary`, same CTA ids |
| 16-18 | `src/blocks/MantraRunnerDisplay*` / `SankalpHoldBlock*` / `PracticeTimerBlock*` / `PracticeStepsBlock*` | Start + Done controls | `testID="mantra_runner_start"`, `mantra_runner_complete`, `sankalp_hold`, `practice_runner_start`, `practice_runner_complete` |
| 16-26 | `src/blocks/CompletionReturnTransient*` | message + anchor + read-more + placeholder | `testID="completion_message"`, `completion_wisdom_anchor_line`, `completion_read_more`, `completion_reflection_placeholder` |
| 19-20 | `src/blocks/dashboard/MoreSupportSheet*` rooms → runner entry | support-room runner option | `testID="<room>_mantra_option"` |
| 22-23 | Growth room inquiry → offering | inquiry offering | `testID="inquiry_<cat>_<kind>_option"` |
| 24-26 | Additional items list + entry surface | list + row taps | `testID="additional_items_section"`, `additional_item_<idx>` |
| 27 | Dashboard additional items surface | section header | `testID="additional_items_header"` |
| 28 | `src/extensions/moments/continuity_mirror_card/index.tsx` | card root | `testID="continuity_mirror_card"` |
| 29 | `src/extensions/moments/path_milestone_banner/index.tsx` | banner root | `testID="path_milestone_banner"` |
| 30 | resilience_narrative surface (TBD location) | card root | `testID="resilience_narrative_card"` |
| 31 | `src/extensions/moments/entity_recognition_card/index.tsx` | card root | `testID="entity_recognition_card"` |

## Patch order recommendation

1. **P0 — regression-critical:** flow 06 (triad visibility). Add
   `testID="core_item_<kind>"` to the triad cards; otherwise the Metro triad
   bug guard is pattern-scan only.
2. **P1 — completion matrix:** flows 16-26 share the completion block
   selectors. One patch to `CompletionReturnTransient` covers 11 flows.
3. **P2 — support rooms:** flows 10-13. Four small patches.
4. **P3 — checkpoints:** flows 14-15. Tier A sovereignty migration alignment.
5. **P4 — dashboard parity:** flows 27-31. Can be tackled one surface at a
   time; most cards live under `src/extensions/moments/`.
6. **P5 — onboarding:** flows 01-04. Lowest priority because pattern-scan
   already catches most regressions.
