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

export type ActionType =
  | "runner_mantra"
  | "runner_sankalp"
  | "runner_practice"
  | "teaching"
  | "inquiry"
  | "in_room_step"
  | "carry"
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
}

export interface CarryPayload {
  writes_event:
    | "joy_carry"
    | "joy_named"
    | "release_voice_note"
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

/**
 * Polymorphic Action shape per §7.2. One action envelope — payload fields
 * populated according to `action_type`.
 */
export interface ActionEnvelope {
  action_id: string;
  label: string;
  action_type: ActionType;
  action_family: ActionFamily;

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

export interface RoomIdentity {
  purpose_line: string;
  stance_tag: string;
}

export interface RoomProvenance {
  pool_id: string;
  pool_version: string;
  selection_service_version: string;
  render_id: string;
  active_rotation_window_days: number;
}

export interface RoomFallbacks {
  /** Field names that self-hide when null rather than showing English placeholder. */
  hide_if_empty: Array<
    "second_beat_line" | "principle_banner" | "dashboard_chip_label"
  >;
}

export interface RoomRenderV1 {
  schema_version: "room.render.v1";
  room_id: RoomId;
  room_identity: RoomIdentity;

  opening_line: string;
  second_beat_line: string | null;
  ready_hint: string;
  section_prompt: string;

  /** null for release + connection; populated for joy/growth/clarity/stillness. */
  dashboard_chip_label: string | null;

  /** L1 wisdom surface — scalar, never a carousel (§5.7.2 I-10). */
  principle_banner: PrincipleBanner | null;

  opening_experience: OpeningExperience;

  actions: ActionEnvelope[];

  provenance: RoomProvenance;
  fallbacks: RoomFallbacks;
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
