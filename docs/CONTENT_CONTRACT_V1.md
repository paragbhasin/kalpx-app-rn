# Mitra Content Contract v1.0 — Locked Schema

**Status:** Locked (2026-04-14) after 6 PresentationContext walkthroughs.
**Walkthroughs source:** `docs/PRESENTATION_CONTEXT_WALKTHROUGHS.md`
**Related:** mitra_architecture_sadhana_yatra memory; 3-layer content architecture.

This contract governs how content is authored, routed, and rendered for all
47 moments in the Sadhana Yatra framework. Every content surface must be
expressible as a `MomentDeclaration` carrying a `PresentationContext`, a
`MomentContentContext`, a `ContentPack` (with mode variants), and return
a `MomentPayload` at runtime.

---

## 0. Content sovereignty law

**User-facing strings NEVER live in TSX.** Any string the user reads must be
authored in a YAML under `kalpx/core/data_seed/mitra_v3/` and resolved via
the content registry at render time.

Exemptions (grandfathered, planned for migration):
- `CheckpointDay7Block.tsx` narrative fallback (l.58) — Tier A migration.
- `grief_room/index.tsx` opening/second-beat fallback (l.34-37) — Tier A migration.
- `EveningReflectionBlock.tsx` prompt/chips/cta/helper/ack (multiple) — Tier A migration.

CI gate `content_sovereignty_check` will fail the build when a block
containing `<Text>English words</Text>` is shipped without a registry-
backed content slot declared in its `MomentDeclaration`.

---

## 1. PresentationContext schema (locked)

Every moment declares a `PresentationContext`. 10 fields auto-derived from
FE inspection; 12 manually declared. The walkthrough audit validated this
split against 6 real components.

### 1a. Auto-derived fields (10)

| Field | Type | Derivation source |
|---|---|---|
| `component_render_line` | `file:line` | file read |
| `text_style_tokens` | `dict[role → {family,size,lh,weight,color,case,letterSpacing}]` | RN StyleSheet |
| `surface_background` | `{color, opacity, image?}` | styles.root / `updateBackground()` |
| `layout_width_approx_pt` | `int` | screen width − paddings |
| `dynamic_content_vars` | `string[]` (screenData keys interpolated) | grep on `{{xxx}}` + `screenData.xxx` |
| `cta_zone_pattern` | enum: `rn_reg016 / stacked_pills / grid / full_surface_tap / none` | component layout |
| `cta_count` | `int` | count TouchableOpacity CTAs |
| `has_input_field` | `bool` | TextInput presence |
| `has_keyboard_avoiding` | `bool` | KeyboardAvoidingView presence |
| `animation_present` | `{fade?,pulse?,breathing?,custom?}` | Animated.* usage |

### 1b. Manually declared fields (12)

| Field | Type | Why manual |
|---|---|---|
| `screen_id` | `string` (route id) | needs backend mapping |
| `user_attention_state` | enum: `focused_receiving / scanning / meditative_single_pointed / reflective_exposed / grieving_shut_down / winding_down` | invisible to code; single highest-value field for voice |
| `entry_path[]` | `string[]` (route or source identifiers) | drives entry-framing variants |
| `exit_paths[]` | `string[]` | drives closure copy |
| `repeat_exposure_frequency` | enum: `once_ever / once_per_cycle / weekly / daily / multiple_per_day / rare` | drives variant rotation requirement |
| `reading_posture` | enum: `tap_and_go / sit_with / chant_repeat / ritual_held` | drives length + cadence |
| `emotional_weight` | enum: `light / moderate / heavy / maximum` | drives tone rules |
| `voice_mode_available` | `bool` | mic placement |
| `decision_reversibility` | enum: `reversible / hard_to_reverse / irreversible` | drives gravity |
| `silence_tolerance_sec` | `int` (0 if none) | M46-class constraint; copy must respect |
| `primary_locale_override` | `string?` (e.g. `sa` for Sanskrit) | M17-class surfaces |
| `compound_moment_sequence` | `string[]?` (e.g. `['intro','body','ack']`) | multi-beat moments |

### 1c. Relational fields (2)

| Field | Type | Note |
|---|---|---|
| `sibling_blocks_present` | `string[]` | for composed containers (M08) |
| `sibling_content_coupling` | `string[]` | for sequential moments (M17→completion_return) |

---

## 2. MomentContentContext (logical context)

Separate from presentation. Drives content selection.

```python
@dataclass
class MomentContentContext:
    moment_id: str                # e.g. "M07_recognition"
    path: Literal["support","growth","both"]
    stage_signals: dict           # kosha / klesha / vritti / aliveness / aspiration / modality
    life_layer: TriadReadonlyView # read-only; content CANNOT mutate
    today_layer: dict             # today_kosha, today_vritti, etc.
    cycle_day: int
    entered_via: str              # "joy_path" | "deficit_path" | "trigger" | ...
    guidance_mode: Literal["universal","hybrid","rooted"]
    locale: str                   # "en", "hi", "sa"
```

---

## 3. ContentPack (authored unit)

```yaml
moment_id: M07_recognition
presentation_context:
  screen_id: onboarding_turn_6
  user_attention_state: focused_receiving
  reading_posture: sit_with
  emotional_weight: heavy            # overridden per-path via `variants[].override`
  repeat_exposure_frequency: once_ever
  # auto-derived fields auto-populated by build step

slots:
  emphasized_line:
    max_chars: 90
    max_lines: 2
    role: emphasized
    required: true
  body_paragraphs:
    max_chars_per: 140
    max_count: 2
    role: body
    required: false
  label:
    value: "RECOGNITION"           # constant across variants
    role: label

variants:
  - id: support_heavy_universal
    applies_when:
      path: support
      emotional_weight: heavy
      guidance_mode: universal
    slots:
      emphasized_line: "What you're carrying is heavy. You came here anyway."
      body_paragraphs: ["That's already something."]
    status: draft                  # draft | agent_audited | approved | variant_candidate | retired
  - id: growth_light_universal
    applies_when:
      path: growth
      emotional_weight: light
      guidance_mode: universal
    slots:
      emphasized_line: "You came in already steady. That's the day to build, not just manage."
      body_paragraphs: []
    status: approved
```

### Variant lifecycle (locked)

- `draft` — author-submitted, not served.
- `agent_audited` — audit agent flagged acceptable; still not served unless `approved`.
- `approved` — founder-reviewed, live.
- `variant_candidate` — A/B pool; served to ≤5% traffic with telemetry.
- `retired` — removed from rotation; kept for history.

Promotion rules:
- `draft → agent_audited`: audit agent passes §0-§12 rubric.
- `agent_audited → approved`: **founder sign-off only** (no agent alone promotes).
- `approved → variant_candidate`: founder tags for A/B.
- `variant_candidate → approved (primary)`: material-gain telemetry (emotional clarity, completion, reduced dismissal, return-to-practice, reduced fallback).
- `* → retired`: founder or auto (180 days zero-served + 0-engagement).

---

## 4. MomentDeclaration (wires it all together)

```python
@dataclass
class MomentDeclaration:
    moment_id: str
    presentation: PresentationContext
    content_pack_ref: str           # path to ContentPack YAML
    required_signals: list[str]     # signals the selector needs
    fallback_chain: list[str]       # [rooted, hybrid, universal] mode chain
    locale_fallback_chain: list[str] # [hi, en] or [sa, en]
    coverage_required: bool = True  # if true, fails CI when variant missing
```

---

## 5. MomentPayload (runtime contract)

Always-present shape. No existence checks on FE.

```ts
interface MomentPayload {
  moment_id: string;
  slots: {                       // always an object; never null
    [slot_name: string]: string;
  };
  meta: {
    variant_id: string;          // which variant was served
    mode_served: "universal"|"hybrid"|"rooted";
    locale_served: string;
    fallback_used: boolean;      // true if mode or locale was downgraded
    audit_id: string;            // for telemetry
  };
  presentation_hints?: {         // optional — FE ignores if absent
    max_lines?: number;
    cta_count?: number;
  };
}
```

Null-safe rule: every declared slot returns **at minimum** an empty string
(`""`) — never `undefined`, never `null`. FE does `screenData.slot` without
guards.

---

## 6. ChipTree / Notification / Audio payloads

Same shape family:

```ts
interface ChipTreePayload {
  stage: string; choices: Choice[];
  meta: {...}
}

interface NotificationPayload {
  moment_id: string; title: string; body: string;
  deeplink: string;                // kalpx://mitra/<container>/<state>
  meta: {...}
}

interface AudioPayload {
  moment_id: string; audio_url: string; duration_sec: number;
  loop: boolean;
  meta: {...}
}
```

All four payload types share the `meta` structure so telemetry is uniform.

---

## 7. Voice rules (locked from walkthroughs)

Applied per `user_attention_state`:

| attention_state | Max chars (primary slot) | Tone rules |
|---|---|---|
| `focused_receiving` | 90 (2 lines @ 22pt) | mirror-back, name what's present, no questions |
| `scanning` | 60 (1 line) | action-forward, no moralizing |
| `meditative_single_pointed` | 0 (Sanskrit only) | no English body |
| `reflective_exposed` | 140+ (allowed, it's heavy) | narrative-length OK, no glib |
| `grieving_shut_down` | 60 per beat | no exclamations, no questions (one gentle probe max), no metaphors, no "celebrate/great/good" |
| `winding_down` | 40 (prompt) / 1 word (chip) / 4 words (CTA) | soft, declarative |

Applied per `emotional_weight`:
- `maximum` — zero exclamations; zero comparisons; zero imperatives except "Stay."
- `heavy` — no glib; sentences ≤ 18 words.
- `moderate` — normal.
- `light` — can be playful without being cute; celebration permitted.

---

## 8. CI gates (locked)

1. **`content_sovereignty_check`** — block with user-facing string not declared in MomentDeclaration → fail.
2. **`coverage_validator`** — moment with `coverage_required=true` missing a variant for any (mode × locale) combination → fail.
3. **`quality_validator`** — slot exceeds `max_chars` or `max_lines`; banned words present; wrong variant status → fail.
4. **`fallback_exhaustion_test`** — simulate all-fallback scenario; serve ≥ minimum universal for every moment → fail if gap.
5. **`chip_id_stability`** — chip_ids cannot change between releases without explicit migration note → fail.

---

## 9. Orchestration (Phase A1 preview)

Single resolver `content_orchestrator.resolve(moment_id, ctx)`:

```
1. load MomentDeclaration
2. build PresentationContext (auto fields + declared fields)
3. build MomentContentContext from ctx
4. query registry for matching variants
5. apply mode-downgrade chain (rooted → hybrid → universal)
6. apply locale-downgrade chain
7. apply emotional-weight guard (if weight=maximum, refuse light-tone variants)
8. serve highest-status match (approved > variant_candidate > agent_audited)
9. log MitraDecisionLog row (shadow, gated behind MITRA_V3_DECISION_LOG_WRITE)
10. return MomentPayload
```

---

## 10. Migration order (derived from walkthroughs)

**Tier A (week 1 — sovereignty violations):**
1. `EveningReflectionBlock.tsx` — entire block hard-coded. Highest priority.
2. `grief_room/index.tsx` — `ctx` fallback English.
3. `CheckpointDay7Block.tsx` — `narrative` fallback.

**Tier B (week 2 — dashboard chrome):**
4. `dashboard_config.status_messages` — already externalized, needs registry-refactor.
5. Dashboard embeds missing per `mitra_v3_career_screenshot_gap_analysis.md`.

**Tier C (week 3-4 — onboarding recognition):**
6. All 18+ sections of `onboarding_recognition_slots.yaml` — draft → approved cycle.

**Anchor tests (every migration):**
- M07 test: simple passive block.
- M08 test: composed multi-block container.
- M17 test: immersive Sanskrit-primary edge case.
- M24 test: compound-sequenced heavy moment.
- M46 test: ritual-timed max-weight edge case.
- M35 test: regression — ensure TSX no longer holds strings.

---

## 11. What stays out of v1.0

- `haptic_pattern` — flagged but not v1. (M17 has haptics; no authored content coupled to them.)
- `audio_cue_coupling` — audio payloads exist; pairing with text cadence deferred.
- `actions_logged` telemetry signals feeding back into selection — self-learning S1 (flag `MITRA_V3_DECISION_LOG_WRITE`), shadow-write first.
- `cross_moment_narrative_continuity` — e.g. runner → completion_return paired authoring. Flagged as `sibling_content_coupling` but orchestrator doesn't yet enforce.

---

## Sign-off

- [ ] PresentationContext schema locked (this doc)
- [ ] MomentDeclaration / MomentContentContext / ContentPack / MomentPayload shapes locked
- [ ] Variant lifecycle rules locked
- [ ] CI gates enumerated (implementation Phase B)
- [ ] Orchestrator skeleton designed (Phase A1 next)
- [ ] Migration order agreed (Tier A/B/C)
