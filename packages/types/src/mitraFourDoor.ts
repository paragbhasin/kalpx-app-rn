import type { RoomId } from './room';

export type DoorId = "my_rhythm" | "inner_path" | "quick_reset" | "tell_mitra";

// ── Rhythm ──────────────────────────────────────────────────────────────────

export type RhythmTimeBand = "morning" | "afternoon" | "night";

export type RhythmItemType =
  | "mantra"
  | "sankalp"
  | "practice"
  | "reflection"
  | "library";

export type RhythmItemSource =
  | "mitra_suggested"
  | "user_chosen"
  | "library";

export type RhythmReminderPreference = "yes" | "no" | "later";

export interface RhythmItem {
  id: number;
  slot: RhythmTimeBand;
  item_type: RhythmItemType;
  item_id: string;
  title_snapshot: string;
  description_snapshot: string | null;
  purpose: string | null;
  source: RhythmItemSource;
  sort_order: number;
  reminder_enabled: boolean;
  reminder_time: string | null;
}

export interface RhythmSlot {
  items: RhythmItem[];
}

// ── Quick Check-in ───────────────────────────────────────────────────────────

export type QuickCheckinEnergyState =
  | "energized"
  | "balanced"
  | "agitated"
  | "drained";

export type QuickCheckinAction =
  | "navigate_to_door"
  | "navigate_to_room"
  | "return_home";

export interface QuickCheckinResponse {
  energy_state: QuickCheckinEnergyState;
  suggested_action: QuickCheckinAction;
  suggested_door: string | null;
  suggested_room_id: string | null;
  copy: string;
}

// ── Home Response Additions ──────────────────────────────────────────────────

export interface MitraHomeV3Greeting {
  headline: string;
  subtext: string | null;
}

export interface MitraHomeV3MyRhythmSummary {
  has_rhythm: boolean;
  briefing_status: string;
  next_practice_label: string | null;
  next_practice_time_band: string | null;
}

// VerifiedRoomId is a named alias for RoomId.
// Callers use this type to document "this value must be a known room ID."
export type VerifiedRoomId = RoomId;

export type DoorState =
  | "active"       // journey in progress
  | "available"    // accessible, no journey required
  | "no_rhythm"    // My Rhythm not yet built
  | "no_path"      // Inner Path not started
  | "unavailable"  // locked or not accessible
  | "locked";

export interface MitraHomeV3DoorState {
  label: string;
  subtitle: string;
  cta: string;
  state: DoorState;
}

export interface MitraHomeV3InnerPathSummary {
  has_active_path: boolean;
  day_number: number;
  total_days: number;
  phase: string;
  path_title: string | null;
  checkpoint_due: "day_7" | "day_14" | null;
  cta: string;
}

export interface MitraHomeV3CompanionRhythm {
  has_rhythm: boolean;
  reminder_preference?: RhythmReminderPreference;
  morning: RhythmSlot | null;
  afternoon: RhythmSlot | null;
  night: RhythmSlot | null;
}

export interface MitraHomeV3QuickResetSummary {
  available: boolean;
  source_item_type: string | null;
  source_item_id: string | null;
  label: string;
}

export interface MitraHomeV3TellMitraSummary {
  available: boolean;
  label: string;
}

export interface MitraHomeV3AdditionalItemsPlacement {
  my_rhythm_addons: unknown[];
  inner_path_addons: unknown[];
  library_items: unknown[];
}

export interface MitraHomeV3ReminderSummary {
  rhythm_reminders_enabled: boolean;
  morning: { enabled: boolean; time: string | null };
  afternoon: { enabled: boolean; time: string | null };
  night: { enabled: boolean; time: string | null };
  ask_later: boolean;
}

export interface MitraHomeV3Response {
  door_states: Record<DoorId, MitraHomeV3DoorState>;
  inner_path_summary: MitraHomeV3InnerPathSummary;
  companion_rhythm: MitraHomeV3CompanionRhythm;
  quick_reset_summary: MitraHomeV3QuickResetSummary;
  tell_mitra_summary: MitraHomeV3TellMitraSummary;
  additional_items_placement: MitraHomeV3AdditionalItemsPlacement;
  reminder_summary: MitraHomeV3ReminderSummary;
  greeting?: MitraHomeV3Greeting;
  my_rhythm_summary?: MitraHomeV3MyRhythmSummary;
  [key: string]: unknown;
}

// ── Rhythm Suggest (wizard Step 3) ──────────────────────────────────────────

export type RhythmSuggestSource =
  | "internal_rule"
  | "internal_personalized"
  | "ai_fallback"
  | "safe_fallback";

export type RhythmSuggestReasoningCode =
  | "purpose_band_fit"
  | "personalized_context_fit"
  | "ai_candidate_selection"
  | "safe_default";

export interface RhythmSuggestRequest {
  selected_moments: RhythmTimeBand[];
  purposes: Partial<Record<RhythmTimeBand, string>>;
  user_intent_text?: string;
  tz?: string;
  locale?: string;
  source_surface?: string;
}

export interface RhythmSuggestItem {
  slot: RhythmTimeBand;
  sort_order: number;
  item_type: RhythmItemType;
  item_id: string;
  title_snapshot: string;
  description_snapshot: string | null;
  why_this: string;
  source: "mitra_suggested";
  suggestion_source: RhythmSuggestSource;
  confidence: number;
  reasoning_code: RhythmSuggestReasoningCode;
  suggestion_request_id: string;
  reminder_enabled: boolean;
  reminder_time: string | null;
}

export interface RhythmSuggestResponse {
  suggestion_request_id: string;
  status: "ok" | "partial" | "error";
  source: RhythmSuggestSource | "mixed" | "error";
  confidence: number;
  items: RhythmSuggestItem[];
  reasoning: Partial<Record<RhythmTimeBand, string>>;
  fallback_used: boolean;
  missing_slots: RhythmTimeBand[];
  warnings: string[];
}

/** Local wizard state item: RhythmSuggestItem fields + optional provenance. */
export interface RhythmWizardLocalItem {
  slot: RhythmTimeBand;
  item_type: RhythmItemType;
  item_id: string;
  title_snapshot: string;
  description_snapshot: string | null;
  source: RhythmItemSource;
  sort_order: number;
  reminder_enabled: boolean;
  reminder_time: string | null;
  // Provenance — present when item came from /rhythm/suggest/; absent on user-chosen items
  why_this?: string;
  suggestion_source?: RhythmSuggestSource;
  confidence?: number;
  reasoning_code?: RhythmSuggestReasoningCode;
  suggestion_request_id?: string;
}

export type TellMitraRoutingType =
  | "navigate_to_room"
  | "navigate_to_door"
  | "provide_wisdom_inline"
  | "ask_followup";

export interface TellMitraNextOption {
  label: string;
  description: string;
  action_type: "navigate_to_room" | "navigate_to_door";
  room_id: VerifiedRoomId | null;
  door: DoorId | null;
}

export interface TellMitraRoomEntrySituation {
  intent_type: string;
  state_tags: string[];
  energy_state: string;
  life_context: string;
  prior_context_used: boolean;
}

export interface TellMitraRoomEntryDecision {
  routing_type: string;
  suggested_room_id: string;
  confidence: number;
  source: string;
}

export interface TellMitraRoomEntryLearning {
  eligible_for_learning: boolean;
  feedback_pending: boolean;
}

export interface TellMitraConversationContext {
  turn_count: number;
  prior_context_used: boolean;
  prior_intent_type: string | null;
  prior_state_tags: string[];
  prior_life_context: string | null;
  current_input_added_context: boolean;
  current_life_context: string | null;
  summary: string | null;
}

export interface TellMitraFollowupOption {
  label: string;
  value: string;
}

export interface TellMitraFollowupQuestion {
  prompt: string;
  options: TellMitraFollowupOption[];
}

export type TellMitraSupportDepth =
  | "direct_room"
  | "ask_followup"
  | "context_followup"
  | "room_with_followup"
  | "wisdom_inline"
  | "door_navigation";

export interface TellMitraFollowupMeta {
  prompt_id: string | null;
  selected_value: string;
  selected_label: string;
  parent_tell_mitra_event_id: string | number | null;
  parent_intent_type: string | null;
}

export interface TellMitraRoomEntryContext {
  source_surface: string;
  tell_mitra_event_id: string | number | null;
  situation: TellMitraRoomEntrySituation;
  decision: TellMitraRoomEntryDecision;
  learning: TellMitraRoomEntryLearning;
  conversation_context?: TellMitraConversationContext | null;
}

export interface TellMitraV3Response {
  intent_matched: boolean;
  intent_type: string | null;
  confidence: number;
  source: string;
  fallback_reason: string;
  suggested_action: TellMitraRoutingType | "none";
  suggested_room_id: VerifiedRoomId | null;
  suggested_room_label: string | null;
  suggested_room_description: string | null;
  door: DoorId | null;
  response_copy: string;
  state_tags: string[];
  companion_state_written: boolean;
  safety_flag: boolean;
  prior_context_used: boolean;
  prior_context_summary: string | null;
  prior_suggested_room_id: VerifiedRoomId | null;
  prior_suggested_room_label: string | null;
  next_options: TellMitraNextOption[];
  tell_mitra_event_id: string | number | null;
  room_entry_context: TellMitraRoomEntryContext | null;
  conversation_context: TellMitraConversationContext | null;
  support_depth: TellMitraSupportDepth;
  followup_question: TellMitraFollowupQuestion | null;
  conversation_stage: string;
  specific_context: string | null;
  immediate_support_requested: boolean;
  predictive_eligible: boolean;
  pattern_key: string | null;
  // S17-D1X-A: multi-signal intelligence fields
  specific_contexts: string[];
  primary_specific_context: string | null;
  support_need: string;
  secondary_room_id: string | null;
}
