# New Dashboard V1 — Component Spec

> Developer-ready spec for the companion-led dashboard that ships behind
> `EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD=1`. Consumes `/journey/home/`,
> `/journey/companion/`, `cycle_metrics`, and ContentPack slots. Replaces
> `CompanionDashboardContainer.tsx` once flag flips.
>
> Status: spec locked 2026-04-18. Implementation = Phase 3 of the combined
> WelcomeBack + Dashboard + SourcePolicy plan.

## 1. Composition — top-to-bottom

1. Header: KalpX logo dot + brand + language pill + notification bell
2. `GreetingCard` (M_new_dashboard_greeting)
3. Chip row: `DayTypeChip` + `PathChip` (+ optional `StreakPill`)
4. `FocusPhraseLine` (M41)
5. `TriadCardsRow` with `WhyThisL1Strip` below
6. `CycleProgressBlock` — collapsible, defaults closed
7. `SankalpCarryBlock` — conditional on `practice_embody`
8. `InsightsRow` — max 1 banner + 2 cards above the fold
9. `QuickSupportBlock` — 2 primary + "More support" sheet
10. Safety quiet link
11. Floating `VoiceInputBar`
12. Bottom nav (existing)

## 2. Component spec table

### Required core components (11)

| # | Component | Source moment | Data keys | Above fold? | File path | Effort |
|---|---|---|---|---|---|---|
| 1 | `GreetingCard` | M_new_dashboard_greeting | `sd.greeting_context`, `sd.user_name`, `sd.greeting_tone` | ✓ hero | `src/blocks/dashboard/GreetingCard.tsx` (new) | 1h |
| 2 | `DayTypeChip` | M40 | `sd.day_type`, `sd.day_type_label` | ✓ | `src/extensions/moments/day_type_chip/` (exists — register) | 30m |
| 3 | `PathChip` | derived | `sd.journey_path` (support/growth/return) | ✓ | `src/blocks/dashboard/PathChip.tsx` (new) | 30m |
| 4 | `FocusPhraseLine` | M41 | `sd.focus_phrase` | ✓ | `src/extensions/moments/focus_phrase_line/` (exists — register) | 30m |
| 5 | `TriadCardsRow` | M16 + M35 | `sd.card_mantra_*`, `sd.card_sankalpa_*`, `sd.card_ritual_*`, `sd.practice_chant/embody/act`, `sd.completed_today[]` | ✓ hero | `src/blocks/dashboard/TriadCardsRow.tsx` (refactor of `CoreItemsList.tsx`) | 2h |
| 6 | `WhyThisL1Strip` | M35 | `sd.why_this_l1_items[]` (id, label) | ✓ | `src/extensions/moments/why_this_l1_chip/` (exists — register) | 1h |
| 7 | `CycleProgressBlock` | derived + `cycle_metrics` | `sd.day_number`, `sd.total_days`, `sd.cycle_metrics.*` | — | `src/blocks/dashboard/CycleProgressBlock.tsx` (new) | 3h |
| 8 | `DailyRhythmStrip` | `cycle_metrics.daily_rhythm` | `sd.cycle_metrics.daily_rhythm[]` | — | `src/blocks/dashboard/DailyRhythmStrip.tsx` (new) | 2h |
| 9 | `SankalpCarryBlock` | existing | `sd.sankalp_how_to_live[]` (renders only when `sd.practice_embody`) | — | `src/blocks/dashboard/SankalpCarryBlock.tsx` (lift from `CompanionDashboardContainer.tsx:475`) | 1h |
| 10 | `QuickSupportBlock` | M20/M21 + sheet | action dispatches `initiate_trigger` + `start_checkin`; sheet: M46/M47/crisis | — | `src/blocks/dashboard/QuickSupportBlock.tsx` (new) + `MoreSupportSheet.tsx` | 1.5h |
| 11 | `VoiceInputBar` | M31 | existing | ✓ floating | `src/blocks/VoiceTextInput.tsx` (exists) | 0h (wire) |

### Conditional intelligence components (9)

Rendered only when data signal present; self-hide otherwise. Max 1 banner + 2 cards visible above fold; rest in "More insights ›" sheet.

| # | Component | Source moment | Show when | Placement | File path | Effort |
|---|---|---|---|---|---|---|
| 12 | `PatternDayBanner` | M11 | `sd.pattern_day_alert` | banner (above greeting) | `src/blocks/dashboard/insights/PatternDayBanner.tsx` (new) | 1h |
| 13 | `ClearWindowBanner` | M43 | `sd.clear_window_active` | banner (above triad) | `src/blocks/ClearWindowBanner.tsx` (exists — register) | 30m |
| 14 | `PredictiveAlertCard` | M28 | `sd.predictive_alert` | InsightsRow | `src/extensions/moments/predictive_alert_card/` (exists) | 30m |
| 15 | `EntityRecognitionCard` | M29 | `sd.entity_card` | InsightsRow | `src/extensions/moments/entity_recognition_card/` (exists) | 30m |
| 16 | `RecommendedAdditionalCard` | M30 | `sd.recommended_additional` | below triad | `src/blocks/dashboard/insights/RecommendedAdditionalCard.tsx` (new) | 1h |
| 17 | `ResilienceNarrativeCard` | M26 | `sd.resilience_narrative` | InsightsRow (growth) | `src/blocks/dashboard/insights/ResilienceNarrativeCard.tsx` (new) | 1h |
| 18 | `PostConflictMorningCard` | M39 | `sd.post_conflict` | InsightsRow | `src/extensions/moments/post_conflict_morning_card/` (exists) | 30m |
| 19 | `GratitudeJoyCard` (NOTICING slot) | M44 | `sd.gratitude_card` | InsightsRow | `src/extensions/moments/gratitude_signal_card/` (exists) | 30m |
| 20 | `SeasonSignalCard` | M45 | `sd.season_card` | InsightsRow | `src/extensions/moments/season_signal_card/` (exists) | 30m |

## 3. Shell container

- **File:** `src/containers/NewDashboardContainer.tsx` (replaces scaffold at `src/extensions/moments/new_dashboard/index.tsx`)
- **Wired at:** `Home.tsx:270` via `EXPO_PUBLIC_MITRA_V3_NEW_DASHBOARD=1` flag
- **Mount effect:**
  1. Dispatch `generate_companion` to hydrate triad + screenData
  2. Fetch `/journey/companion/` to populate `cycle_metrics`
  3. Fetch `briefing_today/` for `MorningBriefingBlock` if rendered (optional; not in core 20)
- **Render rules:**
  - `SankalpCarryBlock` renders only when `sd.practice_embody` is true
  - Each conditional card self-hides when its data key is absent
  - Max 1 banner visible at top (priority: PatternDay > ClearWindow)
  - Max 2 InsightsRow cards above fold; rest in horizontal scroll or "More insights" sheet
  - `QuickSupportBlock` always visible; Grief/Lonely/Crisis tucked in sheet

## 4. ✓/○ completion indicator — cross-session

**On mount:**
```ts
useEffect(() => {
  if (sd.completed_today && Array.isArray(sd.completed_today)) {
    if (sd.completed_today.includes("practice_chant") || sd.completed_today.includes("mantra"))
      dispatch(screenActions.setScreenValue({ key: "practice_chant", value: true }));
    if (sd.completed_today.includes("practice_embody") || sd.completed_today.includes("sankalp"))
      dispatch(screenActions.setScreenValue({ key: "practice_embody", value: true }));
    if (sd.completed_today.includes("practice_act") || sd.completed_today.includes("practice"))
      dispatch(screenActions.setScreenValue({ key: "practice_act", value: true }));
  }
}, [sd.completed_today]);
```

**TriadCardsRow JSX:**
```tsx
<View style={styles.card}>
  <View style={styles.iconWrap}>{icon}</View>
  <Text style={styles.label}>{it.label}</Text>
  <Text style={styles.title}>{it.title}</Text>
  <Text style={styles.sub}>{it.sub}</Text>
  {it.done
    ? <View style={styles.doneDot}><Text style={styles.doneCheck}>✓</Text></View>
    : <View style={styles.openDot} />}
</View>
```

## 5. Design tokens

Import all colors from `src/theme/colors.ts`. No raw hex in any new component.

```ts
import { Colors } from "@/theme/colors";
// e.g. Colors.gold, Colors.brownDeep, Colors.cream
```

Fonts: `Fonts.serif.bold` + `Fonts.serif.regular` (Cormorant) for headlines, `Fonts.sans.medium` + `Fonts.sans.regular` (Inter) for body/labels.

## 6. Source-policy alignment

Every ContentPack consumed by these components respects the tier policy. FE does not enforce it — content layer + CI do. See `kalpx/docs/mitra-v3/SOURCE_VISIBILITY_POLICY_V1.md`.

Hero dashboard moments and their default visibility:

| Moment | Universal | Hybrid | Rooted |
|---|---|---|---|
| M_new_dashboard_greeting | implicit | implicit | lightly_named |
| M40 day_type_chip | implicit | implicit | lightly_named |
| M41 focus_phrase | implicit | implicit | lightly_named |
| M28 predictive_alert | implicit | implicit | implicit |
| M44 gratitude_joy | implicit | lightly_named | lightly_named |
| M45 season_signal | implicit | lightly_named | explicit |
| M35 why_this_l1 | implicit | implicit | implicit |
| M_info_reveal (M16) | implicit | lightly_named | explicit |

## 7. Acceptance checklist

- [ ] All 11 required components render for test+day3 / test+day7 / test+day14 personas
- [ ] `SankalpCarryBlock` hides when `practice_embody` is false
- [ ] Triad ✓ survives app restart (cross-session persistence works)
- [ ] Day-7 / Day-14 dots on `DailyRhythmStrip` tappable → route to M24 / M25
- [ ] Max 1 banner + 2 InsightsRow cards visible above fold
- [ ] `QuickSupportBlock` sheet contains Grief / Lonely / Crisis
- [ ] Zero raw hex codes — all colors via `Colors` token
- [ ] CI sovereignty gate + source-visibility gate green for all 20 components

## 8. Out of scope for V1 — future versions

- Runtime escalation of source-naming based on user dwell time
- Per-user A/B of insight-card ordering
- Cross-app voice continuity (voice session resume)
- Ekadashi / festival override layout (M41 → sacred-day dashboard variant)
