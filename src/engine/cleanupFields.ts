/**
 * Flow-local cleanup fields — matches Vue actionExecutor.js CLEANUP_FIELDS exactly.
 * STATE_OWNERSHIP_MATRIX §Cleanup governs which fields belong to which flow.
 */

export const CLEANUP_FIELDS: Record<string, string[]> = {
  info: [
    'info',
    'info_start_action',
    'info_back_label',
    'info_back_target',
    'info_is_mantra',
    'info_is_sankalp',
    'info_is_practice',
    'show_info_start',
    'info_start_label',
    'info_start_help_text',
    'info_is_locked',
  ],
  runner: ['runner_active_item', '_last_viewed_item', '_active_support_item', '_selected_om_audio', 'reps_done'],
  checkin: [
    'current_prana',
    'current_prana_type',
    'prana_ack_insight',
    'prana_ack_suggestions',
    'trigger_mantra_text',
    'trigger_mantra_devanagari',
    'checkin_ack_accent',
  ],
  trigger: [
    'trigger_mantra_text',
    'trigger_mantra_devanagari',
    'trigger_feeling',
    'feeling_raw',
    'trigger_cycle_count',
    'suggested_trigger_mantras',
    'trigger_advice_headline',
    'trigger_advice_subtext_1',
    'trigger_advice_subtext_2',
    'trigger_advice_subtext_3',
    'show_start_trigger_mantra',
    '_active_support_item',
    '_trigger_support_completed',
    'trigger_step',
    '_trigger_practice_data',
    '_trigger_mantra_data',
    '_trigger_negative_label',
    '_trigger_resolution_toast',
  ],
  checkpoint: [
    'checkpoint_decision',
    'checkpoint_feeling',
    'checkpoint_feeling_simple',
    'checkpoint_user_reflection',
    // v3 checkpoint data — must clear on persona switch / relogin
    'checkpoint_day_7',
    'checkpoint_day_14',
    'checkpoint_trend_graph',
    'checkpoint_classification_headline',
    'checkpoint_classification_body',
    'checkpoint_deepen_suggestion',
    'checkpoint_strongest_type',
    'checkpoint_mitra_reflection',
    'checkpoint_decision_framing',
    'checkpoint_decision_layout',
    'checkpoint_engagement_level',
    'day_7_decisions_available',
    'day_14_decisions_available',
    'checkpoint_show_feelings',
    'checkpoint_day',
    'checkpoint_completed',
    '_pending_daily_view',
    '_pending_carried_count',
  ],
};

/**
 * Unified cleanup function: clear flow-local state by flow type.
 * @param flowType — one of: info, runner, checkin, trigger, checkpoint, all
 * @param setScreenValue — state setter function
 */
export function cleanupFlowState(
  flowType: string,
  setScreenValue: (value: any, key: string) => void,
): void {
  const clear = (fields: string[]) => fields.forEach((f) => setScreenValue(null, f));

  // Always clear info + runner state on any flow exit
  clear(CLEANUP_FIELDS.info);
  clear(CLEANUP_FIELDS.runner);

  if (flowType === 'checkin' || flowType === 'all') {
    clear(CLEANUP_FIELDS.checkin);
  }
  if (flowType === 'trigger' || flowType === 'all') {
    clear(CLEANUP_FIELDS.trigger);
  }
  if (flowType === 'checkpoint' || flowType === 'all') {
    clear(CLEANUP_FIELDS.checkpoint);
  }
}

/**
 * Actions that are guarded against duplicate submission.
 */
export const GUARDED_ACTIONS = new Set([
  'generate_companion',
  'fast_track_companion',
  'alter_practices',
  'seal_day',
  'submit',
  'info_start_click',
  'try_another_way',
  'trigger_still_feeling',
]);
