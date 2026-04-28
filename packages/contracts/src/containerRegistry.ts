// All container_id values present in allContainers.js.
// Update this file whenever a new container is added to allContainers.js —
// the drift CI check enforces parity.

export const CONTAINER_IDS = {
  AWARENESS_TRIGGER: 'awareness_trigger',
  CHOICE_STACK: 'choice_stack',
  COMPANION_DASHBOARD: 'companion_dashboard',
  COMPANION_DASHBOARD_V3: 'companion_dashboard_v3',
  COMPOSER: 'composer',
  CYCLE_TRANSITIONS: 'cycle_transitions',
  DEMO_CONTAINER: 'demo_container',
  EMBODIMENT_CHALLENGE_RUNNER: 'embodiment_challenge_runner',
  INSIGHT_SUMMARY: 'insight_summary',
  INSIGHTS_PROGRESS: 'insights_progress',
  LOCK_RITUAL_OVERLAY: 'lock_ritual_overlay',
  OVERLAY: 'overlay',
  PORTAL: 'portal',
  PORTAL_SPLASH: 'portal_splash',
  PRACTICE_RUNNER: 'practice_runner',
  REFLECTION_EVENING: 'reflection_evening',
  REFLECTION_WEEKLY: 'reflection_weekly',
  ROOM: 'room',
  ROUTINE_BUILDER: 'routine_builder',
  ROUTINE_LOCKED: 'routine_locked',
  SADHANA_DEEPEN: 'sadhana_deepen',
  SPIRITUAL_RECALIBRATION: 'spiritual_recalibration',
  STABLE_SCAN: 'stable_scan',
  SUPPORT_CHECKIN: 'support_checkin',
  SUPPORT_GRIEF: 'support_grief',
  SUPPORT_GROWTH: 'support_growth',
  SUPPORT_JOY: 'support_joy',
  SUPPORT_LONELINESS: 'support_loneliness',
  SUPPORT_TRIGGER: 'support_trigger',
  WELCOME_ONBOARDING: 'welcome_onboarding',
  WHY_THIS_OVERLAY: 'why_this_overlay',
} as const;

export type ContainerId = (typeof CONTAINER_IDS)[keyof typeof CONTAINER_IDS];
