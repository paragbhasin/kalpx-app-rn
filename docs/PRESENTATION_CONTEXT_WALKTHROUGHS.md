# PresentationContext — 6 Anchor Walkthroughs

Purpose: before locking `CONTENT_CONTRACT_V1.md`, validate the 20-field
`PresentationContext` schema against six real FE components. For each,
we record what was easy to auto-derive, what had to be manually declared,
what was ambiguous, and what fields turned out unnecessary / missing.

Source tip: `origin/pavani @ c278c9a` (2026-04-14), merged with
`sadhana-yatra-onboarding` scaffolds.

Legend for derivation column:
- **auto** — read straight from the TSX file (styles, layout, imports)
- **inferred** — derived from surrounding code (parent container, screenData keys)
- **manual** — must be declared in the `MomentDeclaration`

---

## 1. M07 — Turn 6 Recognition (`FirstRecognitionBlock.tsx`)

**Component:** `src/blocks/FirstRecognitionBlock.tsx` (82 lines)
**Container host:** `OnboardingContainer` (Pavani updated on pavani@1ad8160)
**Surface class:** embedded block inside conversation turn
**Content slots this backs:** `turn6_recognition_line`, optional body paragraphs

### Auto-derived fields

| Field | Value | How derived |
|---|---|---|
| `component_render_line` | `src/blocks/FirstRecognitionBlock.tsx:36-45` | file read |
| `text_style_tokens.emphasized` | `Fonts.serif.bold / 22pt / lh=30 / color=#432104` | styles.emphasized (l.66-72) |
| `text_style_tokens.body` | `Fonts.serif.regular / 17pt / lh=26` | styles.body (l.73-79) |
| `text_style_tokens.label` | `Fonts.sans.semiBold / 11pt / letterSpacing=2 / color=#6b5a45` | styles.label (l.59-65) |
| `surface_background` | `#fffdf9` with 3px gold left border `#eddeb4` | styles.card (l.51-58) |
| `paired_with_cta` | none rendered by this block; reply chip sibling | component body has no TouchableOpacity |
| `layout_width_approx_pt` | screen width − 32pt (padding 20 + margin 16) | styles.card padding/margin |
| `dynamic_content_vars` | `emphasized_line`, `body_paragraphs[]`, `label` — interpolated via `interpolate(text, screenData)` | l.37, l.43 |
| `render_shape` | passive block (no state, no dispatch) | useState/useRef absent |
| `has_keyboard_avoiding` | no | no KAV import |
| `animation_present` | no | no Animated import |

### Manually declared

| Field | Value | Note |
|---|---|---|
| `screen_id` | `onboarding_turn_6` | route is conversational; sits in welcome_onboarding / turn_6 |
| `user_attention_state` | **focused-receiving** | user has just answered 5 stage questions; leaning in for the mirror-back |
| `entry_path` | always Stage 0→1→2→3→ mode-pick (6 turns before) | deterministic |
| `exit_paths` | `onboarding_turn_7` (single forward) | reply chip is only way forward |
| `repeat_exposure_frequency` | **once ever** per cycle (turn 6 is one-shot during onboarding) | key constraint for copy |
| `reading_posture` | **sit-with** (this is the "mirror moment"; must feel named) | no back button, no skip |
| `emotional_weight` | depends on path — `support`=heavy, `growth`=light | the ONE field copy must vary on |
| `voice_mode_available` | TBD (Pavani c278c9a added voice input globally) | surfaced via `VoiceTextInput` — confirm placement |

### Findings

- ✅ **Easy**: every visual token is literally in `StyleSheet.create`. Line-count cap derivable as `(card_height / lineHeight)`.
- ⚠️ **Ambiguous**: `max_lines` depends on card height which is content-driven (no fixed height on styles.card). Rule: recognition `emphasized_line` MUST fit 2 lines @ 22pt×30lh = 60pt → ~340pt card width → target **~45 English chars** per line = **~90 chars total for emphasized**.
- 🛠 **Needed manual**: `reading_posture` and `emotional_weight` are invisible to code but load-bearing for content voice — these must be authored in the registry.
- ❌ **Unnecessary**: `has_bottom_cta_zone` — the block itself never renders a CTA; that lives on the reply chip below. Move CTA proximity to a *scene-level* (not block-level) field.
- 🔍 **Missing from original 20**: `emphasis_hierarchy` — this block has a 3-tier hierarchy (label → emphasized → body). Copy needs to know which slot it's filling.

---

## 2. M08 — Day-Active Dashboard (`CompanionDashboardContainer.tsx`)

**Component:** `src/containers/CompanionDashboardContainer.tsx` (1078 lines)
**Surface class:** container (full-screen), composes ~12 blocks
**Content slots:** identity label, `journey_summary`, `instruction_text`, `focus_phrase`, status messages, progress ring copy, path_milestone, return banner, core items, footer

### Auto-derived fields

| Field | Value | How derived |
|---|---|---|
| `component_render_line` | `src/containers/CompanionDashboardContainer.tsx:75` | file read |
| `surface_background` | `beige_bg.png` (require'd asset) | l.183 `updateBackground(...)` |
| `render_shape` | scroll-composed container with 12+ block slots | `blocks.filter(...)` x3 + direct children |
| `layout_width_approx_pt` | screen width − 32pt (paddingHorizontal 16) | styles.scrollContent |
| `text_style_tokens.identityHeadline` | `Fonts.serif.bold / 20pt / color=#432104` | l.706-710 |
| `text_style_tokens.instructionText` | `Fonts.sans.regular / 14pt / letterSpacing=0.5` | l.842-848 |
| `text_style_tokens.pathMilestone` | `Fonts.serif.regular / 14pt / color=#d4a017` | l.817-823 |
| `text_style_tokens.narrative (remainingText)` | `Fonts.serif.regular / 16pt / color=#432104` | l.830-835 |
| `text_style_tokens.pranaInsight` | `Fonts.serif.regular / 16pt / lh=26` | l.856-862 |
| `dynamic_content_vars` | ~20: `identity_label`, `day_number`, `total_days`, `path_cycle_number`, `path_milestone`, `streak_display`, `sankalp_how_to_live[]`, `contextual_cta`, `prana_ack_insight`, `journey_narrative`, etc. | l.121-134 |
| `status_message_keyed_copy` | `completed / start / milestone / near_end / default` | l.136-149 |
| `has_keyboard_avoiding` | no (no input fields) | absent |
| `animation_present` | SVG ring progress (not text) | l.152 |

### Manually declared

| Field | Value | Note |
|---|---|---|
| `screen_id` | `companion_dashboard / day_active` | |
| `user_attention_state` | **scanning** (user just opened app; multiple cards compete) | key for copy brevity |
| `entry_path` | cold-launch, notification-tap, completion-return | 3 entry paths; copy may vary |
| `exit_paths` | trigger flow, check-in, practice runner (×3), evening reflection | 6+ exits; heavy branching |
| `repeat_exposure_frequency` | **daily** — user sees 14× per cycle | extreme repeat pressure ⇒ variant rotation critical |
| `reading_posture` | **tap-and-go** (most users land here in <5s pre-practice) | copy must not moralize |
| `emotional_weight` | **light-to-mixed** | depends on `journey_is_lightened`, `contextual_cta` signals |
| `voice_mode_available` | yes (voice button in footer) | c278c9a integrated |

### Findings

- ✅ **Easy**: text styles are very well factored. The `status_messages` keyed copy pattern is already the shape content files want (mode-agnostic lookup table).
- ⚠️ **Ambiguous**: `max_lines` — `remainingText`, `pranaInsightText`, `pathMilestoneText` all have **no height cap** and no `numberOfLines`. Copy authors cannot know visual budget. Recommend adding `numberOfLines={2}` defaults + documenting in PresentationContext.
- 🛠 **Needed manual**: `repeat_exposure_frequency` is the single most important field for this surface — 14× exposure per cycle means daily-repeating static copy will feel dead. Must flag for variant rotation.
- ❌ **Unnecessary**: `has_bottom_cta_zone` again — dashboard has no single primary CTA; it has a grid of 3 practice cards + 2 footer buttons.
- 🔍 **Missing**: `sibling_blocks_present[]` — this container composes 12+ blocks. Copy for e.g. `focus_phrase` should know it's rendered *above* `core_items_list` and *below* `progress_ring`. Content that ignores siblings produces incoherent screens (see `mitra_v3_career_screenshot_gap_analysis.md` — 5 embeds missing created bare dashboards).
- 🔍 **Missing**: `dashboard_chrome_copy` — `status_messages`, `seal_button_labels`, `day_label`, `journey_summary` are all content strings that come from backend via `dashboard_config`. These are **separate** content slots from the blocks. Schema must capture that some content is chrome (headers/labels) vs body (recognition lines).

---

## 3. M17 — Mantra Runner (immersive) (`MantraRunnerDisplay.tsx` + `PracticeRunnerContainer.tsx`)

**Component:** `src/blocks/MantraRunnerDisplay.tsx` (231 lines, active surface)
**Container:** `PracticeRunnerContainer.tsx` → `ImmersiveV3Runner` shim (l.155-200)
**Surface class:** immersive (full-screen dark), single active display
**Content slots:** `devanagari`, `iast`/title, `of <total>` label (computed), no paragraph copy

### Auto-derived fields

| Field | Value | How derived |
|---|---|---|
| `component_render_line` | `src/blocks/MantraRunnerDisplay.tsx:48` | file read |
| `surface_background` | `#1a1a1a` (ImmersiveV3Runner root) | v3Styles in PracticeRunnerContainer |
| `text_style_tokens.count` | `Fonts.serif.regular / 72pt / lh=80 / color=#eddeb4 / weight=300` | l.184-191 |
| `text_style_tokens.ofLine` | `Fonts.sans.regular / 13pt / letterSpacing=1.5 / color=#bfa58a` | l.192-198 |
| `text_style_tokens.devanagari` | `Fonts.serif.regular / 28pt / color=#eddeb4 / opacity=0.9` | l.212-219 |
| `text_style_tokens.iast` | `Fonts.sans.regular / 14pt / letterSpacing=1.2 / uppercase / color=#bfa58a` | l.220-227 |
| `dynamic_content_vars` | `runner_active_item.devanagari`, `runner_active_item.title`/`iast`, `total` (reps target), `mantra_audio_url` | l.153-154, l.58, l.114 |
| `paired_with_cta` | **no text CTA** — entire screen is tap target | l.117-122 Pressable full-surface |
| `render_shape` | immersive, tap-to-advance, reps 1-108 | |
| `animation_present` | pulse on tap (scale 1→1.08→1, 240ms) + progress ring fill | l.79-82 |
| `haptic_feedback` | light impact per tap, success notif on complete | l.85-92 |
| `layout_width_approx_pt` | 120pt ring centered; devanagari/iast constrained to screen − 64pt padding | l.210 |
| `audio_plays_in_background` | yes (loop) if `audio_url` or `mantra_audio_url` present | l.157-161 |

### Manually declared

| Field | Value | Note |
|---|---|---|
| `screen_id` | `practice_runner / mantra_runner` (immersive_v3) | |
| `user_attention_state` | **meditative-single-pointed** (phone held, eyes on count) | extreme focus; zero room for prose |
| `entry_path` | dashboard practice card, grief_room, loneliness_room, trigger flow | 4 entry paths — **copy framing differs** per source |
| `exit_paths` | `completion_return` (on target reps) or back (abandon) | binary |
| `repeat_exposure_frequency` | **daily** (primary practice) | highest repeat of any surface |
| `reading_posture` | **chant-repeat** (Sanskrit, not English prose) | copy is the mantra itself; no English body |
| `emotional_weight` | variable — entered from grief = heavy, from dashboard = neutral | source-dependent |
| `voice_mode_available` | no (this IS the voice already — chanting) | conflict with voice input |

### Findings

- ✅ **Easy**: visual tokens crystal clear. Immersive dark chrome is mechanically different from light dashboards — style-token lookup will fail gracefully if content author targets light.
- ⚠️ **Ambiguous**: there is **no English copy slot here** except `of 108`. This surface is almost entirely Sanskrit. The content contract must allow a moment to declare `primary_locale: sa` (Sanskrit) with no mode variants — current schema assumes all content has universal/hybrid/rooted.
- 🛠 **Needed manual**: `entry_path` drastically changes authored framing — the *same* mantra entered from grief room vs dashboard needs different pre-practice framing (which is the **completion_return** copy, not this block).
- ❌ **Unnecessary**: `text_style_tokens.body` (N/A — no body here). Schema should allow per-surface omission.
- 🔍 **Missing**: `sibling_content_coupling` — this runner is coupled to **`completion_return`** (next screen). Content for both must be authored together or they create emotional discontinuity. Currently schema treats each moment in isolation.
- 🔍 **Missing**: `primary_locale_override` — Sanskrit-first surfaces need explicit locale flag.
- 🔍 **Missing**: `haptic_pattern` — content may want to pair copy cadence with haptic pulse (not v1, but flag).

---

## 4. M24 — Day-7 Checkpoint (`CheckpointDay7Block.tsx`)

**Component:** `src/blocks/CheckpointDay7Block.tsx` (317 lines)
**Container host:** `CycleTransitionsContainer.tsx` (2173 lines, state=`weekly_checkpoint`)
**Surface class:** two-step block (intro → body); emotionally heavy
**Content slots:** `eyebrow (DAY 7)`, `headline`, intro `body`, `narrative`, `what_grew_section`, 3 decision CTAs

### Auto-derived fields

| Field | Value | How derived |
|---|---|---|
| `component_render_line` | `src/blocks/CheckpointDay7Block.tsx:42` | file read |
| `surface_background` | `#FFF8EF` (cream) | styles.root (l.197) |
| `text_style_tokens.eyebrow` | `Fonts.sans.medium / 11pt / letterSpacing=1.5 / color=#c9a84c` | l.207-213 |
| `text_style_tokens.headline` | `Fonts.serif.regular / 28pt / color=#432104` | l.214-219 |
| `text_style_tokens.body` | `Fonts.serif.regular / 18pt / lh=26 / color=#6b5a45` | l.220-225 |
| `text_style_tokens.narrative` | `Fonts.serif.regular / 17pt / lh=26 / color=#432104` | l.249-255 |
| `text_style_tokens.microLabel` | `Fonts.sans.medium / 11pt / letterSpacing=1.5 / color=#c9a84c` | l.256-262 |
| `text_style_tokens.ctaText` | `Fonts.sans.medium / 16pt / color=#432104` | l.289-293 |
| `dynamic_content_vars` | `journey_day_statuses[]`, `journey_narrative`, `what_grew_section`, `checkpoint_user_reflection` | l.50-63 |
| `paired_with_cta` | **3 CTAs**: continue / lighten / start_fresh | l.166-192 |
| `has_bottom_cta_zone` | yes (REG-016: `bottomRegion` minHeight 30%) | l.200-206 |
| `has_input_field` | yes (reflection TextInput, 1000 char max, optional) | l.150-158 |
| `multi_step_flow` | yes: intro → body (internal state) | l.34, l.45, l.91-112 |
| `render_shape` | screen block with scroll + pinned bottom | |

### Manually declared

| Field | Value | Note |
|---|---|---|
| `screen_id` | `cycle_transitions / weekly_checkpoint` | |
| `user_attention_state` | **reflective-exposed** (first big milestone; emotional investment visible) | "Can I show you what I've seen?" |
| `entry_path` | day-7 auto-navigation from dashboard (only) | single entry |
| `exit_paths` | 3 decisions (continue / lighten / start_fresh) → next cycle state | 3-way branch, all permanent |
| `repeat_exposure_frequency` | **once per cycle** (every 14 days) | rare-but-pivotal |
| `reading_posture` | **sit-with** (multi-paragraph, decision-weight) | must feel weighty; no glib copy |
| `emotional_weight` | **heavy** (first milestone acknowledgment) | drives tone |
| `voice_mode_available` | yes (reflection input is text + mic) | c278c9a added |
| `decision_reversibility` | **irreversible** (decision sets next 7 days) | content must frame gravity |

### Findings

- ✅ **Easy**: 3-CTA primary vs secondary hierarchy visually encoded (primary full-width, 2 secondaries in row). Schema's `cta_hierarchy` field (if added) will cleanly map.
- ⚠️ **Ambiguous**: `multi_step_flow` state is **local to the block** (`useState<Step>`) — not in Redux, not in backend. Copy for step-1 (intro) vs step-2 (body) is authored together but UX is sequential. Schema must support **compound moments** (one conceptual moment, multiple screen-presentations).
- 🛠 **Needed manual**: `decision_reversibility` and `emotional_weight=heavy` are critical for voice of narrative — they justify copy length here that would be bloat anywhere else.
- ❌ **Unnecessary**: `animation_present` (none here). Some surfaces simply have none.
- 🔍 **Missing**: `compound_moment_sequence` — intro → body → (ack via container state) is a 3-beat arc. Single `MomentContentContext` cannot hold all three without wrapping.
- 🔍 **Missing**: `fallback_data_present` — block defaults `statuses = Array(DOTS).fill("completed")` and `narrative = "You have been with me for a week..."` (l.53, l.58). Content contract must distinguish **backend-authored** narrative vs **component-fallback**. Currently the fallback lives inside the TSX — arguably a violation of "never author in TSX" rule.

---

## 5. M46 — Grief Room (`grief_room/index.tsx`)

**Component:** `src/extensions/moments/grief_room/index.tsx` (313 lines — Pavani b72de1a)
**Surface class:** moment extension (full-screen, heavy ritual)
**Content slots:** `opening_line`, `second_beat_line`, 4 pill labels, mantra hold copy, input prompt

### Auto-derived fields

| Field | Value | How derived |
|---|---|---|
| `component_render_line` | `src/extensions/moments/grief_room/index.tsx:24` | file read |
| `surface_background` | `#F4EAD4` (deep cream, "dim ambient") | styles.root (l.214) |
| `text_style_tokens.openingLine` | `Fonts.serif.regular / 24pt / lh=34 / color=#2b1d0a / centered` | l.223-230 |
| `text_style_tokens.secondBeat` | `Fonts.sans.regular / 16pt / lh=24 / color=#8a7d6b` | l.238-245 |
| `text_style_tokens.pillText` | `Fonts.sans.medium / 15pt / color=#2b1d0a` | l.261-265 |
| `text_style_tokens.exitText` | `Fonts.sans.regular / 14pt / underline / color=#8a7d6b` | l.271-276 |
| `text_style_tokens.inputPrompt` | `Fonts.sans.regular / 14pt / color=#8a7d6b` | l.281-285 |
| `dynamic_content_vars` | `grief_context.opening_line`, `grief_context.second_beat_line`, `grief_context.slow_breath`, `grief_context.grief_mantra` | l.34-37 |
| `paired_with_cta` | 4 pill options + exit | l.109-158 |
| `animation_present` | **breathing dot**: scale 1→1.3 over 7s loop; 1.2s fade-in opening; 30s auto-reveal of options | l.39-72 |
| `has_input_field` | yes (voice-note input on second step, 1500 char, multiline) | l.161-186 |
| `multi_step_flow` | yes: `opening → options → input` | l.26 |
| `has_keyboard_avoiding` | yes | l.161-165 |
| `tap_anywhere_advances` | yes (whole surface is TouchableOpacity that calls `revealOptions`) | l.189-193 |

### Manually declared

| Field | Value | Note |
|---|---|---|
| `screen_id` | `support_rooms / grief_room` | |
| `user_attention_state` | **grieving / shut-down** | most sensitive state in whole app |
| `entry_path` | anandamaya + klesha(asmita/abhinivesha) from check-in OR from trigger OR from notification | 3 entries, all distressed |
| `exit_paths` | mantra_runner, practice_runner (breath), voice-note submit, stay, exit | 5 exits all gentle |
| `repeat_exposure_frequency` | **rare** (fewer than 1×/week) | copy can be long + ritualized |
| `reading_posture` | **ritual-held** (30s silence before options appear!) | copy must not rush |
| `emotional_weight` | **maximum** | ONE fallback miss = user harm |
| `voice_mode_available` | yes (explicit "I want to speak" pill → voice-note) | core affordance |
| `silence_tolerance_sec` | **30s** hard-coded (l.67) | copy must respect — NO "tap to continue" pressure |

### Findings

- ✅ **Easy**: dim-ambient color palette is visually distinct (`#F4EAD4` vs dashboard `#FAF9F6`). Style tokens map cleanly.
- ⚠️ **Ambiguous**: the `ctx` fallback at l.34-37 **hard-codes English copy** ("You don't have to say anything yet. Sit with me for a moment."). This is a second place (after CheckpointDay7Block) where TSX contains content — violates content-authoring boundary.
- 🛠 **Needed manual**: `silence_tolerance_sec=30` is a PresentationContext constraint that copy authors *must* know. If copy says "tap to begin" but component waits 30s, user experience breaks.
- 🛠 **Needed manual**: `user_attention_state=grieving` + `emotional_weight=maximum` together justify banning: exclamations, questions beyond one gentle probe, metaphors, any "celebrate/great/good".
- ❌ **Unnecessary**: `has_bottom_cta_zone` — this surface has **stacked vertical pills centered**, no zone separation. REG-016 doesn't apply to room-style surfaces.
- 🔍 **Missing**: `component_fallback_copy` — where TSX has fallback English, content contract must require authored content to exist (fail CI if component fallback is ever rendered in prod). Backend must always provide `grief_context.opening_line`.
- 🔍 **Missing**: `timing_constraints` — 30s silent window, 1.2s fade-in, 1s options fade-in. Copy pacing must fit these windows (narrator voice vs chip voice).
- 🔍 **Missing**: `actions_logged` — block tracks `actionsUsed[]` for telemetry (l.28, l.85). Content decisions may reference these patterns via self-learning but schema currently ignores telemetry signals.

---

## 6. M35 — Evening Reflection (`EveningReflectionBlock.tsx`)

**Component:** `src/blocks/EveningReflectionBlock.tsx` (252 lines)
**Container host:** likely `CycleTransitionsContainer` or dashboard-mounted embed
**Surface class:** block (single-step form)
**Content slots:** `prompt`, 3 chip labels (steady/mixed/hard), placeholder, cta, helper, ack

### Auto-derived fields

| Field | Value | How derived |
|---|---|---|
| `component_render_line` | `src/blocks/EveningReflectionBlock.tsx:49` | file read |
| `surface_background` | none declared (transparent; inherits container) | styles.root absent bg |
| `text_style_tokens.prompt` | `Fonts.serif.regular / 24pt / color=#432104 / centered` | l.178-184 |
| `text_style_tokens.chipText` | `Fonts.sans.regular / 14pt / color=#432104` | l.200-204 |
| `text_style_tokens.chipTextActive` | inverted (color=#fffdf9 on filled chip) | l.205 |
| `text_style_tokens.input` | `Fonts.sans.regular / 15pt / color=#432104 / placeholder=rgba(88,58,24,0.45)` | l.206-217 |
| `text_style_tokens.ctaText` | `Fonts.sans.medium / 16pt / color=#432104` | l.225-229 |
| `text_style_tokens.helper` | `Fonts.sans.regular / 12pt / color=rgba(88,58,24,0.65) / centered` | l.230-236 |
| `text_style_tokens.ackText` | `Fonts.serif.regular / 22pt / centered` | l.243-248 |
| `dynamic_content_vars` | none — all copy hard-coded in TSX | **RED FLAG** |
| `has_input_field` | yes (240 char cap) | l.43, l.141-149 |
| `has_keyboard_avoiding` | yes | l.114-117 |
| `has_bottom_cta_zone` | yes (REG-016: `bottomRegion` minHeight 28%) | l.173-177 |
| `paired_with_cta` | single "Set it down" CTA + 3-chip mood selector | l.153-165 |
| `terminal_behavior` | `submitted → ack screen` ("Thank you for showing up. Rest well.") | l.103-111 |
| `chip_count` | 3 (steady / mixed / hard) — **hard-coded in TSX** | l.37-41 |
| `max_chars_input` | 240 | l.43 |

### Manually declared

| Field | Value | Note |
|---|---|---|
| `screen_id` | `evening_reflection` (likely `cycle_transitions / daily_reflection`) | |
| `user_attention_state` | **winding-down** (end of day, low cognitive load) | bedtime |
| `entry_path` | dashboard CTA or notification reminder | 2 entries |
| `exit_paths` | submit → ack → dashboard / back | single forward |
| `repeat_exposure_frequency` | **daily** | high repeat — chip labels boring if static |
| `reading_posture` | **tap-and-go** (one chip, maybe one line) | |
| `emotional_weight` | **low-to-moderate** (varies by chip selected) | chip's own weight |
| `voice_mode_available` | c278c9a voice input globally integrated; confirm exposed here | |

### Findings

- 🚨 **RED FLAG**: entire block hard-codes English copy (prompt, 3 chips, placeholder, CTA, helper, ack). **Zero backend-authored content slots.** This is the most severe content-boundary violation among the 6.
  - Locked tone rules (`Mitra will carry it into tomorrow`, `Set it down`, `Thank you for showing up. Rest well.`) live in TSX, not YAML.
  - Registry **cannot** swap this by mode (universal/hybrid/rooted) without FE code change.
  - Action: **M35 rewrite required** as part of Phase C migration — first candidate.
- ✅ **Easy**: style tokens + layout cleanly auto-derived.
- ⚠️ **Ambiguous**: chip labels (`Steady / Mixed / Hard`) are both **content** and **chip_ids** (l.37-41). If content authors rename them, chip_ids diverge from labels — breaking analytics. Schema needs **chip_id stable, label swappable** pattern.
- 🛠 **Needed manual**: `user_attention_state=winding-down` + `reading_posture=tap-and-go` demand brevity caps (prompt ≤ 8 words, chips ≤ 1 word each, cta ≤ 4 words, helper ≤ 10 words).
- ❌ **Unnecessary**: `animation_present` (none).
- 🔍 **Missing**: `content_sovereignty_check` — CI gate flagging TSX-embedded user-facing strings. M35 would fail this check loudly.

---

## Cross-cutting findings → schema deltas

### Add these fields to the v1 contract

1. **`emphasis_hierarchy`** — which slot role does this copy fill? (label / emphasized / body / caption / cta / placeholder / helper / ack)
2. **`sibling_blocks_present[]`** — for container-composed surfaces (M08 dashboard), copy of one block must know siblings.
3. **`sibling_content_coupling[]`** — for sequential moments (M17 runner ↔ `completion_return`), copy authored together.
4. **`primary_locale_override`** — Sanskrit-first surfaces (M17).
5. **`compound_moment_sequence`** — intro/body/ack beats within one moment (M24).
6. **`timing_constraints`** — fade-in, silence-tolerance, auto-advance windows (M46).
7. **`component_fallback_copy` (boolean)** — flag components containing TSX-embedded strings (M35, M46, M24); CI gate.
8. **`chip_id_stable, label_swappable` pattern** — decouple stable analytics ids from swappable display labels.
9. **`decision_reversibility`** — irreversible vs reversible actions shift tone weight (M24).
10. **`silence_tolerance_sec`** — first-class field for ritual surfaces (M46).

### Remove / narrow these fields

1. **`has_bottom_cta_zone`** — not universal. Only applies to REG-016 screens. Narrow to `cta_zone_pattern: "rn_reg016" | "stacked_pills" | "grid" | "full_surface_tap" | "none"`.
2. **`paired_with_cta` (boolean)** — too coarse. Replace with `cta_count` and `cta_hierarchy[]`.

### Fields that held up as-is

1. `component_render_line` — universal, auto-derivable.
2. `text_style_tokens` — universal, auto-derivable.
3. `surface_background` — universal, auto-derivable.
4. `dynamic_content_vars` — universal, auto-derivable; exposes which surfaces violate sovereignty.
5. `layout_width_approx_pt` — auto-derivable; anchors line-length caps.
6. `screen_id` — manual.
7. `user_attention_state` — manual; **single highest-value field for content voice**.
8. `entry_path / exit_paths` — manual; drives entry-framing variants.
9. `repeat_exposure_frequency` — manual; drives variant rotation requirement.
10. `reading_posture` — manual; drives copy length + cadence.
11. `emotional_weight` — manual; drives tone rules.
12. `voice_mode_available` — manual; drives mic placement assumptions.

### Auto-derivation coverage (empirical, from 6 walkthroughs)

- **Auto-derivable:** 8/12 fields (67%) — not the 70% claimed, but close.
- **Manual:** 10/22 fields (45%, because schema grew from 20 to 22 after deltas).
- Biggest surprise: **dynamic_content_vars** audit reveals that 2/6 moments (M35 hard, M46 partial) author strings in TSX. Contract must include a sovereignty gate.
- Second surprise: `max_lines` / line-length caps are **not** auto-derivable from RN Text style alone — need container height + padding context.

### Validated anchor cases for CONTENT_CONTRACT_V1.md

- M07 = **simple passive block** anchor
- M08 = **composed multi-block container** anchor
- M17 = **immersive Sanskrit-primary** anchor (edge case)
- M24 = **compound-sequenced heavy-weight** anchor
- M46 = **ritual-timed emotional-maximum** anchor (edge case)
- M35 = **sovereignty-violation exemplar** (what NOT to do; first migration target)
