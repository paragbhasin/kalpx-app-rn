// Platform-neutral event name constants.
// Add new events here first; never use raw strings in app code.

export const EVENT_NAMES = {
  // Dashboard
  DASHBOARD_LOAD: 'dashboard_load',
  DASHBOARD_CARD_TAP: 'dashboard_card',
  DASHBOARD_CHIP_TAP: 'dashboard_chip_label',
  DASHBOARD_ENTITY_CARD_TAP: 'dashboard_entity_card_tap',
  DASHBOARD_START_OVER: 'dashboard_start_over',
  DASHBOARD_CHECKIN_ACK: 'dashboard_check_in_ack',

  // Mantra runner
  MANTRA_COMPLETE: 'mantra_complete',

  // Sankalp
  SANKALP_COMPLETE: 'sankalp_complete',

  // Practice runner
  PRACTICE_COMPLETE: 'practice_complete',

  // Check-in flow
  CHECKIN_FLOW_OPENED: 'checkin_flow_opened',
  CHECKIN_ACKNOWLEDGED: 'checkin_acknowledged',
  CHECKIN_SUPPORT_COMPLETED: 'checkin_support_completed',
  CHECKIN_REGULATION_COMPLETED: 'checkin_regulation_completed',
  CHECKIN_BREATH_RESET: 'checkin_breath_reset',
  CHECKIN_BREATH_RESET_COMPLETED: 'checkin_breath_reset_completed',
  CHECKIN_SUGGESTION_SELECTED: 'checkin_suggestion_selected',
  CHECKIN_RESOLVED_AFTER_BREATH_RESET: 'checkin_resolved_after_breath_reset',

  // Trigger flow
  TRIGGER_FEELING_SELECTED: 'trigger_feeling_selected',
  TRIGGER_MANTRA_SELECTED: 'trigger_mantra_selected',
  TRIGGER_RESOLVED: 'trigger_resolved',
  TRIGGER_ROUND2: 'trigger_round2',
  TRIGGER_STILL_FEELING: 'trigger_still_feeling',

  // Room
  ENTER_ROOM: 'enter_room',
  ROOM_ENTRY_DISPATCHED: 'room_entry_dispatched',
  ROOM_CARRY_CAPTURED: 'room_carry_captured',
  ROOM_ACTION_TAP: 'room_action_list',
  ROOM_BRIDGE_LINE: 'room_bridge_line',

  // Checkpoints
  CHECKPOINT_REFLECTION: 'checkpoint_reflection',
  CHECKPOINT_COMPLETED: 'checkpoint_completed',

  // Onboarding
  ONBOARDING_TURN: 'onboarding_turn',
  JOURNEY_STARTED: 'journey_started',
  COMPANION_GENERATED: 'companion_generated',

  // Auth / session
  DAY_ACTIVE: 'day_active',

  // Classes + Booking + Payments
  CLASS_LIST_VIEWED: 'class_list_viewed',
  CLASS_DETAIL_VIEWED: 'class_detail_viewed',
  CLASS_BOOKING_STARTED: 'class_booking_started',
  CLASS_BOOKING_CREATED: 'class_booking_created',
  CLASS_PAYMENT_STARTED: 'class_payment_started',
  CLASS_PAYMENT_SUCCEEDED: 'class_payment_succeeded',
  CLASS_PAYMENT_FAILED: 'class_payment_failed',
  CLASS_BOOKING_COMPLETED: 'class_booking_completed',
  CLASS_BOOKING_ABANDONED: 'class_booking_abandoned',

  // Backend API event types (passed as event_name to /mitra/track-event/)
  API_TRACK_EVENT: 'track_event',
  API_TRACK_COMPLETION: 'track_completion',
} as const;

export type EventName = (typeof EVENT_NAMES)[keyof typeof EVENT_NAMES];
