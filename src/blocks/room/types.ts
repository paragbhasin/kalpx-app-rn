/**
 * Room System v3.1.1-wisdom — TypeScript types.
 *
 * Source of truth: docs/ROOM_SYSTEM_V3_1_ARCHITECTURE.md
 *   §5.7.1 (L3 post-runner reflection)
 *   §7.1   RoomRenderV1 envelope
 *   §7.2   Action polymorphic shape
 *
 * These types are SCAFFOLDING ONLY. They are compiled but never instantiated
 * at runtime unless EXPO_PUBLIC_MITRA_V3_ROOMS === "1". Do not import from
 * user-visible code paths until Phase 6 per-room flip.
 */

// ───────────────────────────────────────────────────────────────────────────
// Room identity
// ───────────────────────────────────────────────────────────────────────────

export type RoomId =
  | "room_stillness"
  | "room_connection"
  | "room_release"
  | "room_clarity"
  | "room_growth"
  | "room_joy";

/**
 * 2-step UX life-context slugs (founder-locked 2026-04-20).
 * Picked by `LifeContextPickerSheet` and passed as `?life_context=<slug>`
 * on the /render/ fetch. `self` renders as "Myself" in the picker UI.
 */
export type LifeContext =
  | "work_career"
  | "relationships"
  | "self"
  | "health_energy"
  | "money_security"
  | "purpose_direction"
  | "daily_life";

/**
 * Room visit state (B1 provenance addition). BE may omit; FE treats as
 * optional.
 */
export type VisitState = "cold_start" | "repeat" | "seasoned";

export type ActionType =
  | "runner_mantra"
  | "runner_sankalp"
  | "runner_practice"
  | "teaching"
  | "inquiry"
  | "in_room_step"
  | "in_room_carry"
  | "exit";

export type ActionFamily =
  | "anchor"
  | "expression"
  | "regulation"
  | "offering"
  | "teaching"
  | "inquiry"
  | "exit";

export type SpiritualMode =
  | "mantra"
  | "sankalp"
  | "practice"
  | "teaching"
  | "inquiry"
  | "seva"
  | "stillness"
  | "offering"
  | "blessing"
  | "witnessing";

export type Intensity = "very_light" | "light" | "medium" | "deep";

export type EnergyDirection =
  | "inward"
  | "outward"
  | "stabilizing"
  | "elevating"
  | "relational"
  | "devotional"
  | "reflective";

export type Tradition =
  | "bhakti"
  | "gita"
  | "yoga_sutra"
  | "vedic"
  | "sankhya"
  | "dharma_shastra"
  | "ayurveda"
  | "seva_dana"
  | "niti"
  | "witness_consciousness"
  | "auspiciousness_fullness"
  | "folk_devotional";

export type SelectionSurface = "support_room";
export type SourceClass =
  | "room_pool"
  | "shared_support_pool"
  | "room_step_template";
export type ReturnBehavior = "to_source_room" | "to_dashboard" | "to_options";
export type AutoplayPolicy =
  | "never"
  | "user_enabled_only"
  | "system_unmuted_only";

// ───────────────────────────────────────────────────────────────────────────
// Canonical runner payload (§Contract 2)
// ───────────────────────────────────────────────────────────────────────────

export interface PostRunnerReflection {
  /** Single string from the L3 banner pool. §5.7.1 L3 — one line, not array. */
  line: string;
  /** WisdomAsset asset_id the reflection line was drawn from. */
  principle_id: string;
  /** Used by FE to suppress if runner already carried same principle earlier (I-12). */
  principle_name?: string | null;
}

export interface CanonicalRichRunnerPayloadV1 {
  schema_version: "canonical.runner.v1";
  runner_kind: "mantra" | "sankalp" | "practice";

  item_id: string;
  title: string;
  subtitle_or_line?: string | null;

  // mantra-specific
  deity?: string | null;
  source?: string | null;
  tradition?: string | null;
  iast?: string | null;
  devanagari?: string | null;

  // interpretation
  meaning?: string | null;
  essence?: string | null;

  // sankalp-specific
  insight?: string | null;
  how_to_live?: string[] | null;
  benefits?: string[] | null;

  // practice-specific
  steps?: string[] | null;
  duration_min?: number | null;

  // audio
  audio_url?: string | null;
  audio_duration_ms?: number | null;

  // reps
  reps_target?: number | null;
  reps_default_selection?: number | null;
  reps_available?: number[] | null;

  runner_source: string;
  return_behavior: ReturnBehavior;
  analytics_key: string;

  /** §7.1 addition — optional L3 reflection line surfaced on completion. */
  post_runner_reflection_line?: PostRunnerReflection | null;
}

// ───────────────────────────────────────────────────────────────────────────
// Action sub-payloads (§7.2)
// ───────────────────────────────────────────────────────────────────────────

export interface TeachingPayload {
  principle_id: string;
  principle_name: string;
  body: string;
  sources: string[];
}

export interface InquiryCategory {
  id: string;
  label: string;
  anchor_line: string;
  prompt: string;
  practice_label: string;
  principle_id: string;

  // Phase 6 optional additions — founder spec fields. `reflective_prompt`
  // supersedes `prompt` when present; `suggested_practice_template_id`
  // lets the inquiry detail launch a step directly (InquiryModal Phase 6).
  reflective_prompt?: string | null;
  suggested_practice_template_id?: string | null;
  suggested_practice_label?: string | null;
}

export interface InquiryPayload {
  categories: InquiryCategory[];
}

export type StepTemplateId =
  | "breathe"
  | "walk_timer"
  | "sit_ambient"
  | "grounding"
  | "hand_on_heart";

export interface StepPayload {
  template_id: StepTemplateId | string;
  step_config: Record<string, unknown>;
  input_slots: string[];

  // Phase 6 optional additions — surfaced by StepModal. When BE starts
  // emitting these they populate the modal; otherwise sensible defaults
  // per template category apply (60s timer, generic placeholders).
  duration_sec?: number | null;
  cue_text?: string | null;
  prompt?: string | null;
  memory_modal?: {
    title?: string;
    sanatan_context?: string;
    why_we_ask?: string;
    prompt?: string;
    placeholder?: string;
    primary_label?: string;
    confirmation?: string;       // overrides CARRY_CONFIRM_COPY in confirmed state
    add_another_label?: string;  // overrides CONFIRMED_ADD_LABEL in confirmed state
  } | null;
}

export interface CarryPayload {
  writes_event:
    | "joy_carry"
    | "joy_named"
    | "release_voice_note"
    | "release_named"
    | "connection_named"
    | "connection_reach_out"
    | "growth_journal"
    | "stillness_named"
    | "clarity_journal";
  persists: boolean;
}

export interface ExitPayload {
  returns_to: "dashboard";
}

export interface ActionProvenance {
  selection_surface: SelectionSurface;
  source_class: SourceClass;
  selection_pool_id: string;
  selection_pool_version: string;
  selection_reason: string;
  anchor_override: string | null;
}

export interface ActionVisibilityGate {
  requires_payload_complete?: boolean;
  min_days_on_path?: number | null;
  feature_flag?: string | null;
}

export interface ActionDisplay {
  display_title?: string | null;
  display_subtitle?: string | null;
  why_for_you?: string | null;
}

/**
 * Polymorphic Action shape per §7.2. One action envelope — payload fields
 * populated according to `action_type`.
 */
export interface ActionEnvelope {
  action_id: string;
  label: string;
  action_type: ActionType;
  action_family: ActionFamily;

  display?: ActionDisplay | null;
  runner_payload: CanonicalRichRunnerPayloadV1 | null;
  teaching_payload: TeachingPayload | null;
  inquiry_payload: InquiryPayload | null;
  step_payload: StepPayload | null;
  carry_payload: CarryPayload | null;
  exit_payload: ExitPayload | null;

  room_tags: string[];
  function_tags: string[];
  spiritual_mode: SpiritualMode;
  intensity: Intensity;
  energy_direction: EnergyDirection[];
  tradition: Tradition[];

  provenance: ActionProvenance;

  return_behavior: ReturnBehavior;
  visible_if: ActionVisibilityGate;
  testID: string;
  analytics_key: string;
  persistence: {
    writes_event: string | null;
    persists_across_sessions: boolean;
  };
  primary_recommendation?: boolean;
}

// ───────────────────────────────────────────────────────────────────────────
// Opening experience (§6)
// ───────────────────────────────────────────────────────────────────────────

export type PaletteKey =
  | "stillness_dawn"
  | "connection_warmth"
  | "release_grey"
  | "clarity_silver"
  | "growth_earth"
  | "joy_gold";

export type VisualAnchorKind =
  | "lotus_breathe"
  | "companion_flame"
  | "slow_water"
  | "discernment_line"
  | "path_seedling"
  | "fullness_orb";

export interface VisualAnchor {
  kind: VisualAnchorKind;
  motion: "gentle" | "slow" | "still" | "pulse";
  asset_ref: string | null;
}

export interface AmbientAudio {
  asset_ref: string | null;
  autoplay_policy: AutoplayPolicy;
  start_volume: number;
  fade_in_ms: number;
  sound_affordance_visible: boolean;
}

export interface OpeningPacing {
  opening_line_in: number;
  breath_pause: number;
  second_beat_in: number;
  ready_hint_in: number;
  pills_reveal_stagger: number;
}

export interface OpeningExperience {
  palette: PaletteKey;
  visual_anchor: VisualAnchor;
  ambient_audio: AmbientAudio;
  silence_tolerance_ms: number;
  pacing_ms: OpeningPacing;
  /** §5.7.1 L3 — null when L3 disabled (release, stillness, most connection). */
  post_runner_reflection_pool_id: string | null;
}

// ───────────────────────────────────────────────────────────────────────────
// Wisdom banner (§5.7.1 L1)
// ───────────────────────────────────────────────────────────────────────────

export interface PrincipleBanner {
  principle_id: string;
  principle_name: string;
  wisdom_anchor_line: string;
}

// ───────────────────────────────────────────────────────────────────────────
// Top-level envelope (§7.1)
// ───────────────────────────────────────────────────────────────────────────

export interface RoomProvenance {
  pool_id: string;
  pool_version: string;
  selection_service_version: string;
  render_id: string;
  active_rotation_window_days: number;
  visit_number: number;
  render_phase: string;
  life_context_applied: boolean;
  life_context_skipped: boolean;
}

export interface RoomFallbacks {
  /** Field names that self-hide when null rather than showing English placeholder. */
  hide_if_empty: Array<
    "second_beat_line" | "principle_banner" | "dashboard_chip_label"
  >;
}

// Wave 4 (2026-04-23): 3-layer context surface under room header.
export interface RoomContext {
  room_purpose_line?: string | null;
  sanatan_insight_line?: string | null;
  why_this_room_line?: string | null;
  /** Batch 4C: gentle connective line between wisdom banner and action list. */
  bridge_line?: string | null;
}

export interface RoomRenderV1 {
  schema_version: "room.render.v1";
  room_id: RoomId;

  opening_line: string;
  second_beat_line: string | null;
  ready_hint: string;
  section_prompt: string;

  /** null for release + connection; populated for joy/growth/clarity/stillness. */
  dashboard_chip_label: string | null;

  /** L1 wisdom surface — scalar, never a carousel (§5.7.2 I-10). */
  principle_banner: PrincipleBanner | null;

  /** Wave 4: optional 3-layer context surface. Null when no context slots authored. */
  room_context?: RoomContext | null;

  opening_experience: OpeningExperience;

  actions: ActionEnvelope[];

  provenance: RoomProvenance;
  fallbacks: RoomFallbacks;

  // ─────────────────────────────────────────────────────────────────────
  // 2-step UX additions (founder-locked 2026-04-20). BE stamps these on
  // /render/ responses when the FE passes `?life_context=<slug>`.
  // Visit-state is provenance-only on the BE side; FE treats both fields
  // as informational and tolerates their absence.
  // ─────────────────────────────────────────────────────────────────────
  life_context?: LifeContext | null;
  visit_state?: VisitState | null;

  /**
   * Batch 4B: optional welcome-back echo line. Present only when
   * MITRA_ROOM_MEMORY_ECHO flag is ON and the user has a prior memory for
   * this room. Never contains the user's own text — only a type-level
   * reference ("Last time, you named someone who matters.").
   */
  memory_echo_line?: string | null;
}

// ───────────────────────────────────────────────────────────────────────────
// Component prop surfaces
// ───────────────────────────────────────────────────────────────────────────

export interface RoomRendererProps {
  envelope: RoomRenderV1;
  /**
   * Optional override for tests — production always reads the env flag.
   * Leave undefined in app code.
   */
  _forceFlagOn?: boolean;
}
