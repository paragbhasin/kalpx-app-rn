/**
 * Maps life-context codes to i18n keys.
 * Use t(LIFE_CONTEXT_LABELS[code]) at the call site.
 */
export const LIFE_CONTEXT_LABELS: Record<string, string> = {
  work_career: "room.constants.lifeContext.workCareer",
  relationships: "room.constants.lifeContext.relationships",
  self: "room.constants.lifeContext.self",
  health_energy: "room.constants.lifeContext.healthEnergy",
  money_security: "room.constants.lifeContext.moneySecurity",
  purpose_direction: "room.constants.lifeContext.purposeDirection",
  daily_life: "room.constants.lifeContext.dailyLife",
};

/**
 * Maps action_type codes to i18n keys.
 * Use t(ACTION_KIND_LABELS[type]) at the call site; empty string for exit.
 */
export const ACTION_KIND_LABELS: Record<string, string> = {
  runner_mantra: "room.constants.actionKind.runnerMantra",
  runner_sankalp: "room.constants.actionKind.runnerSankalp",
  runner_practice: "room.constants.actionKind.runnerPractice",
  teaching: "room.constants.actionKind.teaching",
  inquiry: "room.constants.actionKind.inquiry",
  in_room_step: "room.constants.actionKind.inRoomStep",
  in_room_carry: "room.constants.actionKind.inRoomCarry",
  exit: "",
};
