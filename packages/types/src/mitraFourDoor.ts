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

export type TellMitraRoutingType =
  | "navigate_to_room"
  | "navigate_to_door"
  | "provide_wisdom_inline";

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
}
